using System;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CallApi
{
    public class IDApi
    {
        private static readonly HttpClient SharedClient = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        private readonly HttpClient client;
        private readonly string endpoint;
        private readonly Action<int> retryDelay;

        public IDApi() : this(SharedClient, ConfigurationManager.AppSettings["ID_IdentifyServer"], Thread.Sleep) { }

        internal IDApi(HttpClient client, string endpoint, Action<int> retryDelay)
        {
            this.client = client;
            this.endpoint = endpoint;
            this.retryDelay = retryDelay;
        }

        /// <summary>
        /// Recognize the first supported ID photo and keep the existing caller result contract.
        /// Front: [birthdate, name, id, issuedate]; back: [parent, mother, spouse, address].
        /// root is retained for compatibility with existing upload callers.
        /// </summary>
        public dynamic CheckIdIdentify(string kc_cp_no, FileInfo[] filelist, string root)
        {
            if (filelist == null || filelist.Length == 0) return Failure("沒有可辨識的身分證照片");
            try
            {
                foreach (var file in filelist)
                {
                    if (file == null) continue;
                    var match = Regex.Match(file.Name, @"^ID[012]([AB])(?:[-_.]|$)", RegexOptions.IgnoreCase);
                    if (!match.Success) continue;

                    byte[] bytes = File.ReadAllBytes(file.FullName);
                    if (bytes.Length == 0) return Failure("身分證照片內容為空");
                    string cardType = match.Groups[1].Value.ToUpperInvariant() == "A" ? "TaiwanIdCard_A" : "TaiwanIdCard_B";
                    return Identify(kc_cp_no, cardType, Convert.ToBase64String(bytes));
                }
                return Failure("沒有可辨識的身分證正反面照片");
            }
            catch (IOException) { return Failure("無法讀取身分證照片"); }
            catch (UnauthorizedAccessException) { return Failure("無法讀取身分證照片"); }
        }

        private JObject Identify(string cpNo, string cardType, string imageData)
        {
            Uri uri;
            if (!Uri.TryCreate(endpoint, UriKind.Absolute, out uri) || (uri.Scheme != "http" && uri.Scheme != "https"))
                return Failure("身分證辨識服務網址未設定或格式錯誤");

            string requestBody = JsonConvert.SerializeObject(new { id = cpNo, card_type = cardType, image_data = imageData });
            try
            {
                // Retry only transient HTTP 502, with at most three attempts in total.
                for (int attempt = 0; attempt < 3; attempt++)
                {
                    using (var content = new StringContent(requestBody, Encoding.UTF8, "application/json"))
                    using (var response = client.PostAsync(uri, content).GetAwaiter().GetResult())
                    {
                        if (response.StatusCode == HttpStatusCode.BadGateway && attempt < 2)
                        {
                            retryDelay(250 * (1 << attempt));
                            continue;
                        }
                        string body = response.Content == null ? "" : response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                        JObject json;
                        try { json = JObject.Parse(body); }
                        catch (JsonException)
                        {
                            return Failure(response.IsSuccessStatusCode ? "身分證辨識服務回傳格式錯誤" : HttpError(response.StatusCode), (int)response.StatusCode);
                        }

                        // Read the JSON error body even for HTTP 400/500/502.
                        if (!response.IsSuccessStatusCode || json["success"] == null ||
                            json["success"].Type != JTokenType.Boolean || !(bool)json["success"])
                        {
                            string error = json["error"] != null && json["error"].Type == JTokenType.String ? (string)json["error"] : null;
                            return Failure(string.IsNullOrWhiteSpace(error) ?
                                (response.IsSuccessStatusCode ? "身分證辨識失敗" : HttpError(response.StatusCode)) : error, (int)response.StatusCode);
                        }
                        return MapResult(json, cardType, cpNo);
                    }
                }
                return Failure("OCR 服務暫時無法使用");
            }
            catch (OperationCanceledException) { return Failure("身分證辨識作業逾時"); }
            catch (HttpRequestException) { return Failure("身分證辨識服務連線失敗"); }
        }

        private static JObject MapResult(JObject json, string cardType, string cpNo)
        {
            var data = json["data"] as JObject;
            if (data == null || json["card_type"] == null || json["card_type"].Type != JTokenType.String ||
                json["id"] == null || json["id"].Type != JTokenType.String ||
                (string)json["card_type"] != cardType || (string)json["id"] != cpNo)
                return Failure("身分證辨識服務回傳資料不符");

            string[] fields = cardType == "TaiwanIdCard_A"
                ? new[] { "birthdate", "name", "id", "issuedate" }
                : new[] { "parent", "mother", "spouse", "address" };
            var values = new string[fields.Length];
            for (int i = 0; i < fields.Length; i++)
            {
                var field = data[fields[i]];
                if (field == null || field.Type != JTokenType.String) return Failure("身分證辨識結果欄位不完整");
                values[i] = (string)field;
            }
            if (cardType == "TaiwanIdCard_A")
            {
                string birthday;
                if (!TryConvertBirthday(values[0], out birthday)) return Failure("身分證辨識生日格式錯誤");
                values[0] = birthday;
            }
            return new JObject { ["msg"] = "OK", ["data"] = new JArray(values) };
        }

        private static bool TryConvertBirthday(string value, out string birthday)
        {
            birthday = "";
            if (string.IsNullOrWhiteSpace(value) || value.Contains("**")) return true;
            var match = Regex.Match(value, @"^\s*民國\s*([0-9]{1,3})\s*年\s*([0-9]{1,2})\s*月\s*([0-9]{1,2})\s*日\s*$");
            if (!match.Success) return false;
            try
            {
                int year = int.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
                if (year < 1) return false;
                var date = new DateTime(year + 1911, int.Parse(match.Groups[2].Value), int.Parse(match.Groups[3].Value));
                birthday = date.ToString("yyyy-M-d", CultureInfo.InvariantCulture);
                return true;
            }
            catch (ArgumentOutOfRangeException) { return false; }
        }

        // http_status = OCR 主機回的 HTTP 狀態碼（沒收到回應就不帶）
        private static JObject Failure(string message, int httpStatus = 0)
        {
            var result = new JObject { ["msg"] = "NG", ["txt"] = message };
            if (httpStatus > 0) result["http_status"] = httpStatus;
            return result;
        }

        private static string HttpError(HttpStatusCode status)
        {
            return status == HttpStatusCode.BadGateway ? "OCR 服務暫時無法使用" : "身分證辨識服務錯誤（HTTP " + (int)status + "）";
        }
    }
}
