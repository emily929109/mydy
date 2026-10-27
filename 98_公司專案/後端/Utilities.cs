using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace DuDuPay.Models
{
    public class Utilities
    {
        #region 上傳照片 (修改手機號碼,提高額度/修改證件資料,修改證件資料)
        public async System.Threading.Tasks.Task<Layout.ReturnMsg> Upload(HttpRequestMessage Request, string msg_txt)
        {
            var authMember = DuDuPay.Controllers.MemberIdentity.Require(Request);


            string msg = string.Empty;
            try
            {

                if (!Request.Content.IsMimeMultipartContent())
                {
                    Request.CreateResponse(System.Net.HttpStatusCode.UnsupportedMediaType);
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 CreateResponse Error" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }

            string root = "";
            MultipartFormDataMemoryStreamProvider provider;

            try
            {
                GetMultipartProvider(out root);//取得絕對路徑
                string roo = AppDomain.CurrentDomain.BaseDirectory;
                provider = new MultipartFormDataMemoryStreamProvider();

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 provider erroe" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }


            //寫檔
            //(1) path and filename    
            //App_Data\Tmp\FileUploads\客戶端檔名            
            MultipartFormDataMemoryStreamProvider result = null;
            try
            {
                result = await Request.Content.ReadAsMultipartAsync(provider);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "寫檔時 系統錯誤：" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 寫檔失敗" + ex.Message
                };
            }

            int id = 999999999;
            string mobile = string.Empty;
            string img = string.Empty;
            int width; int height;
            try
            {
                string file_name = "";
                string file_path = "";
                //(2) 取得客戶端檔名及完整路徑  
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                foreach (MultipartFileData file in provider.FileData)
                {
                    file_name = file.Headers.ContentDisposition.FileName.Replace("\"", "");
                    //file_path = file.LocalFileName;
                    file_path = root + "\\" + file_name;
                    var stream = ((MultipartFileDateStream)file).Stream;
                    //((MultipartFileDateStream)file).Dispose();

                    //save 
                    using (StreamWriter sw = new StreamWriter(file_path))
                    {
                        stream.CopyTo(sw.BaseStream);
                        sw.Flush();
                    }
                }

                //get id 
                var UploadDataModel = GetFormData<UploadDataModel>(result);
                UploadDataModel dm = (UploadDataModel)UploadDataModel; //id\
                mobile = authMember.mobileno;
                img = dm.img;
                id = authMember.member_id;
                width = dm.width;
                height = dm.height;

                //change file size
                //(3) 改變檔案大小
                //save C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名 to ...客戶端檔名_1.jpg                
                string changeSizeFile = root + Path.GetFileNameWithoutExtension(file_name) + "_1";
                Image bmpInput = Image.FromFile(file_path);
                //ID0L 自拍
                Bitmap bmpOutput;
                //if (img == "ID0L")
                //{
                //    //bmpOutput = new Bitmap(bmpInput, new Size(450, 300));
                //    //bmpOutput.RotateFlip(RotateFlipType.Rotate270FlipNone);
                //    bmpOutput = new Bitmap(bmpInput, new Size(300, 450));
                //}
                //else
                //{
                //bmpOutput = new Bitmap(bmpInput, new Size(400, 300));
                bmpOutput = new Bitmap(bmpInput, new Size(width, height));
                //}
                bmpOutput.SetResolution(300f, 300f);
                bmpOutput.Save(changeSizeFile, System.Drawing.Imaging.ImageFormat.Jpeg);
                bmpInput.Dispose();
                bmpOutput.Dispose();

                //create dir path
                //(4) 多加一層資料夾\0905217718
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\0905217718\ID0A-000.jpg
                string newFilePath = root + @"\" + mobile + @"\" + img + "-000.jpg";
                string dir_path = root + @"\" + mobile;
                if (!Directory.Exists(dir_path))
                    Directory.CreateDirectory(dir_path);
                else
                    File.Delete(newFilePath);//exist delete img


                //(5) move to 0905217718\之下且改名
                //move path App_Data\Tmp\FileUploads\客戶端檔名_1.jpg to App_Data\Tmp\FileUploads\0905217718\ID0A-000.png
                File.Move(changeSizeFile, newFilePath);



                //(6) delete C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                File.Delete(file_path);//用此方法存檔 不能刪



                if (img == "ID0A" || img == "ID0B")
                {
                    //照件辨識
                    FileInfo[] fi = new FileInfo[] { new FileInfo(newFilePath) };
                    CheckIdIdentify(dir_path, fi, id, img, msg_txt);

                }

                return new Layout.ReturnMsg()
                {
                    success = true
                };


            }
            catch (System.Exception e)
            {
                new Common().WriteErrorLog(1, msg_txt, mobile + " " + img + " " + e.Message, id, null, null, null, null);

                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 失敗" + e.Message
                };
            }



        }
        public string GetMultipartProvider(out string path)
        {

            var uploadFolder = "~/App_Data/Tmp/FileUploads"; // you could put this to web.config
            var root = HttpContext.Current.Server.MapPath(uploadFolder);

            Directory.CreateDirectory(root);
            path = root;
            return path;
        }
        private object GetFormData<T>(MultipartFormDataMemoryStreamProvider result)
        {
            if (result.FormData.HasKeys())
            {
                var unescapedFormData = Uri.UnescapeDataString(result.FormData.GetValues(0).FirstOrDefault() ?? String.Empty);
                if (!String.IsNullOrEmpty(unescapedFormData))
                    return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(unescapedFormData);
            }

            return null;
        }
        void CheckIdIdentify(string dirPath, FileInfo[] fi, int id, string img, string msg_txt)
        {
            var tokenSource2 = new CancellationTokenSource();
            CancellationToken ct = tokenSource2.Token;
            var t = Task.Run(() =>
            {
                try
                {
                    //var filelist = new DirectoryInfo(path).GetFiles("*_" + id.ToString() + "_*.png", SearchOption.TopDirectoryOnly).OrderBy(x => x.Name).ToArray();
                    //var filelist = new DirectoryInfo(root).GetFiles("*_" + "000" + "*.png", SearchOption.TopDirectoryOnly).OrderBy(x => x.Name).ToArray();
                    CallApi.IDApi IDApi = new CallApi.IDApi();
                    //此時還沒有cp_no 用隨意
                    var json = IDApi.CheckIdIdentify("2512020580", fi, dirPath);



                    if ((string)json["msg"] == "OK")
                    {


                        if (img == "ID0A")
                        {
                            string[] data = JsonConvert.DeserializeObject<string[]>((string)json["data"].ToString());
                            int i1 = data[3].IndexOf("國");
                            int i2 = data[3].IndexOf("年");
                            int i3 = data[3].IndexOf("月");
                            int i4 = data[3].IndexOf("日");
                            int i5 = data[3].IndexOf("(");
                            int i6 = data[3].IndexOf(")");
                            int i7 = data[3].IndexOf("發");
                            string issue_date = "";
                            string issue_site = "";
                            string issue_reason = "";
                            //年月日
                            if (i1 != -1 && i2 != -1 && i3 != -1 && i4 != -1)
                            {
                                string y = data[3].Substring(i1 + 1, i2 - i1 - 1);//年
                                string m = data[3].Substring(i2 + 1, i3 - i2 - 1);//月
                                string d = data[3].Substring(i3 + 1, i4 - i3 - 1);//日                                               
                                issue_date = y + '-' + m + '-' + d;
                            }
                            //發證地
                            if (i5 != -1 && i6 != -1)
                            {
                                issue_site = data[3].Substring(i5 + 1, i6 - i5 - 1);
                            }
                            //補換發
                            if (i6 != -1 && i7 != -1)
                            {
                                issue_reason = data[3].Substring(i6 + 1);
                            }

                            string _id_no = data[2];
                            using (var db = new kcsddb2Entities_new())
                            {
                                //check id_no 是否別人有用了
                                //沒有別人用才寫入 z_Member id_no
                                //如有人用則不寫入 z_Member id_no 且寫入error log
                                var m = db.z_Member.Where(x => x.id != id && x.id_no != null && x.id_no != ""
                                  && x.id_no == _id_no).FirstOrDefault();
                                if (m != null)
                                {
                                    new Common().WriteErrorLog(1, msg_txt + "(身分證辦識) ", "此身分證已有人使用了" + m.id_no + "(所以不會寫入z_AmountUpTmp)", id, null, null, null, null);
                                }
                                else
                                {
                                    var AmountUpTmp = db.z_AmountUpTmp.Where(x => x.member_id == id).FirstOrDefault();
                                    if (AmountUpTmp != null)
                                    {
                                        //先紀錄在tmp
                                        AmountUpTmp.tmp_birthday = data[0];
                                        AmountUpTmp.tmp_name = data[1];
                                        AmountUpTmp.tmp_id_no = data[2];
                                        AmountUpTmp.tmp_apply_date = data[3];
                                        AmountUpTmp.tmp_issue_date = issue_date;
                                        AmountUpTmp.tmp_issue_site = issue_site;
                                        AmountUpTmp.tmp_issue_reason = issue_reason;
                                        AmountUpTmp.type_msg = msg_txt;

                                        db.z_AmountUpTmp.Attach(AmountUpTmp);
                                        db.Entry(AmountUpTmp).State = EntityState.Modified;
                                        db.SaveChanges();
                                    }
                                }


                            };
                        }
                        else//ID0B
                        {
                            string[] data = JsonConvert.DeserializeObject<string[]>((string)json["data"].ToString());
                            using (var db = new kcsddb2Entities_new())
                            {
                                var AmountUpTmp = db.z_AmountUpTmp.Where(x => x.member_id == id).FirstOrDefault();
                                if (AmountUpTmp != null)
                                {
                                    AmountUpTmp.tmp_papa_nameu = data[0];
                                    AmountUpTmp.tmp_mama_nameu = data[1];
                                    AmountUpTmp.tmp_mate_nameu = data[2];
                                    AmountUpTmp.tmp_address = data[3];
                                    AmountUpTmp.type_msg = msg_txt;

                                    db.z_AmountUpTmp.Attach(AmountUpTmp);
                                    db.Entry(AmountUpTmp).State = EntityState.Modified;
                                    db.SaveChanges();
                                }
                            };

                        }

                    }
                    else if ((string)json["msg"] == "NG")
                    {
                        new Common().WriteErrorLog(0, msg_txt + "(身分證辦識) 辦識型態：" + img, "東元主機回傳:" + (string)json["txt"], id, null, null, null, null);
                    }
                }
                catch (Exception ex)
                {
                    tokenSource2.Cancel();
                    new Common().WriteErrorLog(1, msg_txt + "(身分證辦識) 辦識型態：" + img, "系統錯誤：" + ex.Message, id, null, null, null, null);

                }
            }, tokenSource2.Token);



        }
        #endregion



        #region 註冊上傳照片專用


        public async Task<Layout.ReturnMsg> Upload_register(HttpRequestMessage Request, string msg_txt)
        {
            var authMember = DuDuPay.Controllers.MemberIdentity.Require(Request);
            string msg = string.Empty;
            try
            {

                if (!Request.Content.IsMimeMultipartContent())
                {
                    Request.CreateResponse(System.Net.HttpStatusCode.UnsupportedMediaType);
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 CreateResponse Error" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }

            string root = "";
            MultipartFormDataMemoryStreamProvider provider;

            try
            {
                GetMultipartProvider(out root);//取得絕對路徑
                string roo = AppDomain.CurrentDomain.BaseDirectory;
                provider = new MultipartFormDataMemoryStreamProvider();

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 provider erroe" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }


            //寫檔
            //(1) path and filename    
            //App_Data\Tmp\FileUploads\客戶端檔名            
            MultipartFormDataMemoryStreamProvider result = null;
            try
            {
                result = await Request.Content.ReadAsMultipartAsync(provider);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "寫檔時 系統錯誤：" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 寫檔失敗" + ex.Message
                };
            }

            int id = 999999999;
            string mobile = string.Empty;
            string img = string.Empty;
            int width; int height;
            try
            {
                string file_name = "";
                string file_path = "";

                //(2) 取得客戶端檔名及完整路徑  
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                foreach (MultipartFileData file in provider.FileData)
                {
                    file_name = file.Headers.ContentDisposition.FileName.Replace("\"", "");
                    //file_path = file.LocalFileName;
                    file_path = root + "\\" + file_name;
                    var stream = ((MultipartFileDateStream)file).Stream;
                    //((MultipartFileDateStream)file).Dispose();

                    //save 
                    using (StreamWriter sw = new StreamWriter(file_path))
                    {
                        stream.CopyTo(sw.BaseStream);
                        sw.Flush();
                    }
                }

                //get id 
                var UploadDataModel = GetFormData<UploadDataModel>(result);
                UploadDataModel dm = (UploadDataModel)UploadDataModel; //id\
                mobile = authMember.mobileno;
                img = dm.img;
                id = authMember.member_id;
                width = dm.width;
                height = dm.height;

                //change file size
                //(3) 改變檔案大小
                //save C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名 to ...客戶端檔名_1.jpg                
                string changeSizeFile = root + Path.GetFileNameWithoutExtension(file_name) + "_1";
                Image bmpInput = Image.FromFile(file_path);
                //ID0L 自拍
                Bitmap bmpOutput;
                //if (img == "ID0L")
                //{
                //    //bmpOutput = new Bitmap(bmpInput, new Size(450, 300));
                //    //bmpOutput.RotateFlip(RotateFlipType.Rotate270FlipNone);
                //    bmpOutput = new Bitmap(bmpInput, new Size(300, 450));
                //}
                //else
                //{
                //    bmpOutput = new Bitmap(bmpInput, new Size(400, 300));
                //ean
                //bmpOutput = new Bitmap(bmpInput, new Size(width, height));
                bmpOutput = new Bitmap(bmpInput);

                //}
                //bmpOutput.SetResolution(300f, 300f);
                bmpOutput.Save(changeSizeFile, System.Drawing.Imaging.ImageFormat.Jpeg);
                bmpInput.Dispose();
                bmpOutput.Dispose();

                //create dir path
                //(4) 多加一層資料夾\0905217718
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\0905217718\ID0A-000.jpg
                string newFilePath = root + @"\" + mobile + @"\" + img + "-000.jpg";
                string dir_path = root + @"\" + mobile;
                if (!Directory.Exists(dir_path))
                    Directory.CreateDirectory(dir_path);
                else
                    File.Delete(newFilePath);//exist delete img


                //(5) move to 0905217718\之下且改名
                //move path App_Data\Tmp\FileUploads\客戶端檔名_1.jpg to App_Data\Tmp\FileUploads\0905217718\ID0A-000.png
                File.Move(changeSizeFile, newFilePath);



                //(6) delete C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                File.Delete(file_path);//用此方法存檔 不能刪



                object ocr = new { status = "skip" };//非身分證照片不辨識
                if (img == "ID0A" || img == "ID0B")
                {
                    //照件辨識
                    FileInfo[] fi = new FileInfo[] { new FileInfo(newFilePath) };
                    ocr = CheckIdIdentify_register(dir_path, fi, id, img, msg_txt);//等辨識完 結果帶回前端

                }

                return new Layout.ReturnMsg()
                {
                    success = true,
                    value = new { ocr }
                };


            }
            catch (System.Exception e)
            {
                new Common().WriteErrorLog(1, msg_txt, mobile + " " + img + " " + e.Message, id, null, null, null, null);

                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 失敗" + e.Message
                };
            }

        }


        public async Task<Layout.ReturnMsg> Upload_register2(HttpRequestMessage Request, string msg_txt)
        {
            var authMember = DuDuPay.Controllers.MemberIdentity.Require(Request);
            string msg = string.Empty;
            try
            {

                if (!Request.Content.IsMimeMultipartContent())
                {
                    Request.CreateResponse(System.Net.HttpStatusCode.UnsupportedMediaType);
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 CreateResponse Error" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }

            string root = "";
            MultipartFormDataMemoryStreamProvider provider;

            try
            {
                GetMultipartProvider(out root);//取得絕對路徑
                string roo = AppDomain.CurrentDomain.BaseDirectory;
                provider = new MultipartFormDataMemoryStreamProvider();

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "系統錯誤 provider erroe" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }


            //寫檔
            //(1) path and filename    
            //App_Data\Tmp\FileUploads\客戶端檔名            
            MultipartFormDataMemoryStreamProvider result = null;
            try
            {
                result = await Request.Content.ReadAsMultipartAsync(provider);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "寫檔時 系統錯誤：" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 寫檔失敗" + ex.Message
                };
            }

            int id = 999999999;
            string mobile = string.Empty;
            string img = string.Empty;
            int width; int height;
            try
            {
                string file_name = "";
                string file_path = "";

                //(2) 取得客戶端檔名及完整路徑  
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                foreach (MultipartFileData file in provider.FileData)
                {
                    file_name = file.Headers.ContentDisposition.FileName.Replace("\"", "");
                    //file_path = file.LocalFileName;
                    file_path = root + "\\" + file_name;
                    var stream = ((MultipartFileDateStream)file).Stream;
                    //((MultipartFileDateStream)file).Dispose();

                    //save 
                    using (StreamWriter sw = new StreamWriter(file_path))
                    {
                        stream.CopyTo(sw.BaseStream);
                        sw.Flush();
                    }
                }

                //get id 
                var UploadDataModel = GetFormData<UploadDataModel>(result);
                UploadDataModel dm = (UploadDataModel)UploadDataModel; //id\
                mobile = authMember.mobileno;
                img = dm.img;
                id = authMember.member_id;
                width = dm.width;
                height = dm.height;

                //change file size
                //(3) 改變檔案大小
                //save C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名 to ...客戶端檔名_1.jpg                
                string changeSizeFile = root + Path.GetFileNameWithoutExtension(file_name) + "_1";
                Image bmpInput = Image.FromFile(file_path);
                //ID0L 自拍
                Bitmap bmpOutput;
                //if (img == "ID0L")
                //{
                //    //bmpOutput = new Bitmap(bmpInput, new Size(450, 300));
                //    //bmpOutput.RotateFlip(RotateFlipType.Rotate270FlipNone);
                //    bmpOutput = new Bitmap(bmpInput, new Size(300, 450));
                //}
                //else
                //{
                //    bmpOutput = new Bitmap(bmpInput, new Size(400, 300));
                bmpOutput = new Bitmap(bmpInput, new Size(width, height));
                //}
                bmpOutput.SetResolution(300f, 300f);
                bmpOutput.Save(changeSizeFile, System.Drawing.Imaging.ImageFormat.Jpeg);
                bmpInput.Dispose();
                bmpOutput.Dispose();

                //create dir path
                //(4) 多加一層資料夾\0905217718
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\0905217718\ID0A-000.jpg
                string newFilePath = root + @"\" + mobile + @"\" + img + "-000.jpg";
                string dir_path = root + @"\" + mobile;
                if (!Directory.Exists(dir_path))
                    Directory.CreateDirectory(dir_path);
                else
                    File.Delete(newFilePath);//exist delete img


                //(5) move to 0905217718\之下且改名
                //move path App_Data\Tmp\FileUploads\客戶端檔名_1.jpg to App_Data\Tmp\FileUploads\0905217718\ID0A-000.png
                File.Move(changeSizeFile, newFilePath);



                //(6) delete C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                File.Delete(file_path);//用此方法存檔 不能刪



                if (img == "ID0A" || img == "ID0B")
                {
                    //照件辨識
                    FileInfo[] fi = new FileInfo[] { new FileInfo(newFilePath) };
                    CheckIdIdentify_register(dir_path, fi, id, img, msg_txt);

                }

                return new Layout.ReturnMsg()
                {
                    success = true
                };


            }
            catch (System.Exception e)
            {
                new Common().WriteErrorLog(1, msg_txt, mobile + " " + img + " " + e.Message, id, null, null, null, null);

                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = msg_txt + " 失敗" + e.Message
                };
            }

        }
        //回傳 { status, msg, data, http_status } 給前端
        //status: ok (讀不到的欄位為空字串) / duplicate / fail (OCR 主機，看 http_status) / error (後端程式例外)
        public object CheckIdIdentify_register(string dirPath, FileInfo[] fi, int id, string img, string msg_txt)
        {
            var tokenSource2 = new CancellationTokenSource();
            CancellationToken ct = tokenSource2.Token;
            var t = Task.Run(() =>
                       {
                           try
                           {
                               //var filelist = new DirectoryInfo(path).GetFiles("*_" + id.ToString() + "_*.png", SearchOption.TopDirectoryOnly).OrderBy(x => x.Name).ToArray();
                               //var filelist = new DirectoryInfo(root).GetFiles("*_" + "000" + "*.png", SearchOption.TopDirectoryOnly).OrderBy(x => x.Name).ToArray();
                               CallApi.IDApi IDApi = new CallApi.IDApi();
                               //此時還沒有cp_no 用隨意
                               var json = IDApi.CheckIdIdentify("2512020580", fi, dirPath);


                               if ((string)json["msg"] == "OK")
                               {


                                   if (img == "ID0A")
                                   {
                                       string[] data = JsonConvert.DeserializeObject<string[]>((string)json["data"].ToString());
                                       int i1 = data[3].IndexOf("國");
                                       int i2 = data[3].IndexOf("年");
                                       int i3 = data[3].IndexOf("月");
                                       int i4 = data[3].IndexOf("日");
                                       int i5 = data[3].IndexOf("(");
                                       int i6 = data[3].IndexOf(")");
                                       int i7 = data[3].IndexOf("發");
                                       string issue_date = "";
                                       string issue_site = "";
                                       string issue_reason = "";
                                       //年月日
                                       if (i1 != -1 && i2 != -1 && i3 != -1 && i4 != -1)
                                       {
                                           string y = data[3].Substring(i1 + 1, i2 - i1 - 1);//年
                                           string m = data[3].Substring(i2 + 1, i3 - i2 - 1);//月
                                           string d = data[3].Substring(i3 + 1, i4 - i3 - 1);//日                                               
                                           issue_date = y + '-' + m + '-' + d;
                                       }
                                       //發證地
                                       if (i5 != -1 && i6 != -1)
                                       {
                                           issue_site = data[3].Substring(i5 + 1, i6 - i5 - 1);
                                       }
                                       //補換發
                                       if (i6 != -1 && i7 != -1)
                                       {
                                           issue_reason = data[3].Substring(i6 + 1);
                                       }


                                       string _id_no = data[2];
                                       using (var db = new kcsddb2Entities_new())
                                       {
                                           //check id_no 是否別人有用了
                                           //沒有別人用才寫入 z_Member id_no
                                           //如有人用則不寫入 z_Member id_no 且寫入error log
                                           var m = db.z_Member.Where(x => x.id != id && x.id_no != null && x.id_no != ""
                                             && x.id_no == _id_no).FirstOrDefault();
                                           if (m != null)
                                           {
                                               new Common().WriteErrorLog(1, msg_txt + "(身分證辦識) ", "此身分證已有人使用了" + m.id_no + "(應更改手機號或mail)", id, null, null, null, null);
                                               return OcrResult("duplicate", "此身分證號已註冊過，請確認證件或聯繫客服");
                                           }
                                           else
                                           {
                                               //eantodo 不知是否這裡致z_Member id_no 被清為空白
                                               var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                                               if (member != null)
                                               {
                                                   new Common().WriteErrorLog(0, msg_txt + "(身分證辦識) ", data[0] + "|" + data[1] + "|" + data[2], id, null, null, null, null);

                                                   if (data[0] != "") member.birthday = data[0];
                                                   if (data[1] != "") member.name = data[1];
                                                   if (data[2] != "") member.id_no = data[2];
                                                   if (data[3] != "") member.apply_date = data[3];
                                                   member.issue_date = issue_date;
                                                   member.issue_site = issue_site;
                                                   member.issue_reason = issue_reason;

                                                   db.z_Member.Attach(member);
                                                   db.Entry(member).State = EntityState.Modified;
                                                   db.SaveChanges();
                                               }
                                           }



                                       };

                                       //讀不到的欄位為空字串
                                       return OcrResult("ok", "", new { id_no = data[2], name = data[1], birthday = data[0], issue_date, issue_site, issue_reason });
                                   }
                                   else//ID0B
                                   {
                                       string[] data = JsonConvert.DeserializeObject<string[]>((string)json["data"].ToString());
                                       using (var db = new kcsddb2Entities_new())
                                       {
                                           var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                                           if (member != null)
                                           {
                                               member.papa_nameu = data[0];
                                               member.mama_nameu = data[1];
                                               member.mate_nameu = data[2];
                                               member.address = data[3];

                                               db.z_Member.Attach(member);
                                               db.Entry(member).State = EntityState.Modified;
                                               db.SaveChanges();
                                           }
                                       };

                                       //讀不到的欄位為空字串
                                       return OcrResult("ok", "", new { papa_nameu = data[0], mama_nameu = data[1], mate_nameu = data[2], address = data[3] });
                                   }

                               }
                               else if ((string)json["msg"] == "NG")
                               {
                                   new Common().WriteErrorLog(0, msg_txt + "(身分證辦識) 辦識型態：" + img, "東元主機回傳:" + (string)json["txt"], id, null, null, null, null);

                                   //http_status = OCR 主機回的 HTTP 狀態碼，0 = 沒收到回應(逾時/連不上)或還沒送出就失敗
                                   int http_status = json["http_status"] != null ? (int)json["http_status"] : 0;
                                   return OcrResult("fail", "證件辨識失敗，請於下一步手動填寫", null, http_status);
                               }
                               return OcrResult("fail", "證件辨識失敗，請於下一步手動填寫");
                           }
                           catch (Exception ex)
                           {
                               tokenSource2.Cancel();

                               //string a = ex.Message;
                               new Common().WriteErrorLog(1, msg_txt + "(身分證辦識) 辦識型態：" + img, "系統錯誤：" + ex.Message, id, null, null, null, null);

                               return OcrResult("error", "證件辨識失敗，請於下一步手動填寫");
                           }
                       }, tokenSource2.Token);

            return t.Result;//等辨識完才回傳
        }

        static object OcrResult(string status, string msg, object data = null, int http_status = 0)
        {
            return new { status, msg, data, http_status };
        }
        #endregion

        #region 店家合作申請
        public async Task<Layout.ReturnMsg> Upload_DealerApply(HttpRequestMessage Request)
        {
            string msg = string.Empty;
            try
            {

                if (!Request.Content.IsMimeMultipartContent())
                {
                    Request.CreateResponse(System.Net.HttpStatusCode.UnsupportedMediaType);
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "店家合作申請", "系統錯誤 CreateResponse Error" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }

            string root = "";
            MultipartFormDataMemoryStreamProvider provider;

            try
            {
                GetMultipartProvider(out root);//取得絕對路徑
                string roo = AppDomain.CurrentDomain.BaseDirectory;
                provider = new MultipartFormDataMemoryStreamProvider();

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "店家合作申請", "系統錯誤 provider erroe" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };

            }


            //寫檔
            //(1) path and filename    
            //App_Data\Tmp\FileUploads\客戶端檔名            
            MultipartFormDataMemoryStreamProvider result = null;
            try
            {
                result = await Request.Content.ReadAsMultipartAsync(provider);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "店家合作申請", "寫檔時 系統錯誤：" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = "店家合作申請" + " 寫檔失敗" + ex.Message
                };
            }

            int id = 999999999;
            string mobile = string.Empty;
            string img = string.Empty;
            int width; int height;
            try
            {
                string file_name = "";
                string file_path = "";

                //(2) 取得客戶端檔名及完整路徑  
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                foreach (MultipartFileData file in provider.FileData)
                {
                    file_name = file.Headers.ContentDisposition.FileName.Replace("\"", "");
                    //file_path = file.LocalFileName;
                    file_path = root + "\\" + file_name;
                    var stream = ((MultipartFileDateStream)file).Stream;
                    //((MultipartFileDateStream)file).Dispose();

                    //save 
                    using (StreamWriter sw = new StreamWriter(file_path))
                    {
                        stream.CopyTo(sw.BaseStream);
                        sw.Flush();
                    }
                }

                //get id 
                var UploadDataModel = GetFormData<UploadDataModel>(result);
                UploadDataModel dm = (UploadDataModel)UploadDataModel; //id\
                mobile = dm.mobile;
                img = dm.img;
                id = dm.id;
                width = dm.width;
                height = dm.height;

                //change file size
                //(3) 改變檔案大小
                //save C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名 to ...客戶端檔名_1.jpg                
                string changeSizeFile = root + Path.GetFileNameWithoutExtension(file_name) + "_1";
                Image bmpInput = Image.FromFile(file_path);
                //ID0L 自拍
                Bitmap bmpOutput;
                //if (img == "ID0L")
                //{
                //    //bmpOutput = new Bitmap(bmpInput, new Size(450, 300));
                //    //bmpOutput.RotateFlip(RotateFlipType.Rotate270FlipNone);
                //    bmpOutput = new Bitmap(bmpInput, new Size(300, 450));
                //}
                //else
                //{
                //    bmpOutput = new Bitmap(bmpInput, new Size(400, 300));
                //bmpOutput = new Bitmap(bmpInput, new Size(width, height));
                bmpOutput = new Bitmap(bmpInput);//用原客戶的解析度
                //}
                //bmpOutput.SetResolution(300f, 300f);
                bmpOutput.Save(changeSizeFile, System.Drawing.Imaging.ImageFormat.Jpeg);
                bmpInput.Dispose();
                bmpOutput.Dispose();

                //create dir path
                //(4) 多加一層資料夾\0905217718
                //C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\0905217718\ID0A-000.jpg
                string newFilePath = root + @"\" + mobile + @"\" + img + "-000.jpg";
                string dir_path = root + @"\" + mobile;
                if (!Directory.Exists(dir_path))
                    Directory.CreateDirectory(dir_path);
                else
                    File.Delete(newFilePath);//exist delete img

                //-----------------------------------------------------------------------
                //(5) move to 0905217718\之下且改名
                //move path App_Data\Tmp\FileUploads\客戶端檔名_1.jpg to App_Data\Tmp\FileUploads\0905217718\ID0A-000.png
                File.Move(changeSizeFile, newFilePath);



                //(6) delete C:\DuDuPay\DuDuPay\App_Data\Tmp\FileUploads\客戶端檔名
                File.Delete(file_path);//用此方法存檔 不能刪


                return new Layout.ReturnMsg()
                {
                    success = true
                };


            }
            catch (System.Exception e)
            {
                new Common().WriteErrorLog(1, "店家合作申請", mobile + " " + img + " " + e.Message, id, null, null, null, null);

                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = "店家合作申請" + " 失敗" + e.Message
                };
            }

        }
        #endregion


        #region move file to scan3 
        /// <summary>
        /// 註冊完成 覆寫證件且完成後刪除 client pdf
        /// </summary>
        /// <param name="cp_no"></param>
        /// <param name="mobile"></param>
        /// <param name="id"></param>
        /// <param name="msg_txt"></param>
        /// <returns></returns>
        public Layout.ReturnMsg MoveImageFileToScan3CoverFinishDelete(string cp_no, string mobile, int id, string msg_txt)
        {
            try
            {
                //iis pdf
                //string srcDir_iis = @"C:\DuDuPay\DuDuPay\App_Data\Tmp\PDF\" + mobile;
                //iis image
                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                string srcDir_iis = dataFile + @"\" + mobile;

                string Scan3_Path = ConfigurationManager.AppSettings["Scan3_Path"];
                string destDir_scan3 = Scan3_Path + cp_no.Substring(0, 4) + @"\" + cp_no;

                //error: 拒絕存取路徑 '\\10.2.8.1\Scan3\2310\2310250024'。
                //del 目標目錄下的檔案
                //if (Directory.Exists(destDir_scan3))
                //{
                //    System.IO.DirectoryInfo di = new DirectoryInfo(destDir_scan3);

                //    foreach (FileInfo file in di.GetFiles())
                //    {
                //        file.Delete();
                //    }
                //    //foreach (DirectoryInfo dir in di.GetDirectories())//刪子目錄
                //    //{
                //    //    dir.Delete(true);
                //    //}
                //}

                //move 
                //1.move 後 srcDir_iis會刪除原有  
                //2.destDir_scan3 不能有相同檔名
                if (Directory.Exists(srcDir_iis))
                {
                    if (!Directory.Exists(destDir_scan3))//scan3 沒檔案時 整批move
                    {
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                    }
                    else//重新上傳
                    {
                        //get destDir_scan3 file and delete scan3
                        System.IO.DirectoryInfo di_scan3 = new DirectoryInfo(destDir_scan3);//scan3
                        System.IO.DirectoryInfo di_iis = new DirectoryInfo(srcDir_iis);//iis
                                                                                       //----test
                                                                                       //string ean = string.Empty;
                                                                                       //foreach (FileInfo file in di_iis.GetFiles())
                                                                                       //{
                                                                                       //    ean = ean + file.Name + "  ";
                                                                                       //}

                        //using (var db = new kcsddb2Entities_new())
                        //{
                        //    var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                        //    if (m != null)
                        //    {
                        //        m.login_error_msg = ean;
                        //        db.z_Member.Attach(m);
                        //        db.Entry(m).State = EntityState.Modified;
                        //        db.SaveChanges();
                        //    }

                        //};
                        //-------------------
                        //scan3 裡有相同檔名的先刪除
                        foreach (FileInfo file in di_scan3.GetFiles())
                        {
                            var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                            if (iis_file != null)
                            {
                                file.Delete();//del scan3
                            }
                        }

                        //整批move
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                    }

                }


                //check scan3照片有幾張
                //System.IO.DirectoryInfo scan3_di = new DirectoryInfo(destDir_scan3);//scan3
                //if (scan3_di.GetFiles().Count() <= 1)
                //{
                //    using (var db = new kcsddb2Entities_new())
                //    {
                //        var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                //        if (m != null)
                //        {
                //            m.login_ok_msg = "";//註冊未完成
                //            m.login_error_msg = "未上傳照片";
                //            db.z_Member.Attach(m);
                //            db.Entry(m).State = EntityState.Modified;
                //            db.SaveChanges();
                //        }
                //        else
                //        {
                //            new Common().WriteErrorLog(1, "註冊完成 MoveToScan3", "會員序號不存在" + id, null, null, cp_no, null, null);
                //        }
                //    };
                //}



                try
                {
                    //最終delete 與client 連結 /img/ 簽名pdf
                    var img_root = HttpContext.Current.Server.MapPath("~/img/");
                    string newFilePath = img_root + mobile;// + @"\ID0K-000.pdf";//img\0905217718\ID0K-000.pdf
                    DeleteFolder(newFilePath);
                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, msg_txt + " MoveToScan3 刪除連結/img/簽名pdf", "系統錯誤：" + ex.Message, id, null, cp_no, null, null);
                    return new Layout.ReturnMsg() { success = true };
                }

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt + " MoveToScan3", "系統錯誤：" + ex.Message, id, null, cp_no, null, null);
                return new Layout.ReturnMsg() { success = false, msg = ex.Message };
            }

            return new Layout.ReturnMsg() { success = true };

        }


        public Layout.ReturnMsg MoveImageFileToScan3ForBoboMemberFinishDelete(string member_no, string mobile, int id, string msg_txt)
        {
            //\dudu\會員前4\會員全
            try
            {
                //iis pdf
                //string srcDir_iis = @"C:\DuDuPay\DuDuPay\App_Data\Tmp\PDF\" + mobile;
                //iis image
                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                string srcDir_iis = dataFile + @"\" + mobile;

                string BoBo_validation_Path = ConfigurationManager.AppSettings["BoBo_validation_Path"];
                string destDir_scan3 = BoBo_validation_Path + member_no.Substring(0, 4) + @"\" + member_no;

                //move 
                //1.move 後 srcDir_iis會刪除原有  
                //2.destDir_scan3 不能有相同檔名
                if (Directory.Exists(srcDir_iis))
                {
                    if (!Directory.Exists(destDir_scan3))//scan3 沒檔案時 整批move
                    {
                        //Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                        Microsoft.VisualBasic.FileIO.FileSystem.CopyDirectory(srcDir_iis, destDir_scan3);
                    }
                    else//重新上傳
                    {
                        //get destDir_scan3 file and delete scan3
                        System.IO.DirectoryInfo di_scan3 = new DirectoryInfo(destDir_scan3);//scan3
                        System.IO.DirectoryInfo di_iis = new DirectoryInfo(srcDir_iis);//iis


                        //-------------------
                        //scan3 裡有相同檔名的先刪除//eantodo
                        foreach (FileInfo file in di_scan3.GetFiles())
                        {
                            if (file.Name.StartsWith("ID0K"))//add to ID0K-X00 , ID0K-X01
                            {
                                var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                                if (iis_file != null)
                                {
                                    string toFilePath = new Common().CheckSacn3Item_bobo(destDir_scan3, "ID0K-X00", "ID0K-X", file.Extension);
                                    //file move
                                    File.Move(iis_file.FullName, toFilePath);
                                }

                            }
                            else
                            {
                                var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                                if (iis_file != null)
                                {
                                    //file.Delete();//del scan3 2025/11/24原來的 補件後改為如下
                                    //create file name                               
                                    string toFilePath = new Common().CheckSacn3Item(destDir_scan3, file.Name, file.Name.Substring(0, 5), file.Extension);
                                    //file move
                                    File.Move(iis_file.FullName, toFilePath);
                                }
                            }


                        }

                        //整批move
                        //Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                        Microsoft.VisualBasic.FileIO.FileSystem.CopyDirectory(srcDir_iis, destDir_scan3);
                    }

                }


                //最終delete 與client 連結 /img/ 簽名pdf
                //var img_root = HttpContext.Current.Server.MapPath("~/img/");
                //string newFilePath = img_root + mobile;// + @"\ID0K-000.pdf";//img\0905217718\ID0K-000.pdf
                //DeleteFolder(newFilePath);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt + " move to BoBo_validation_Path", "系統錯誤：" + ex.Message, id, null, null, member_no, null);
                return new Layout.ReturnMsg() { success = false, msg = ex.Message };
            }

            return new Layout.ReturnMsg() { success = true };

        }
        public Layout.ReturnMsg MoveImageFileToScan3ForBoboFinishDelete(string cp_no, string mobile, int id, string msg_txt)
        {
            try
            {
                //iis pdf
                //string srcDir_iis = @"C:\DuDuPay\DuDuPay\App_Data\Tmp\PDF\" + mobile;
                //iis image
                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                string srcDir_iis = dataFile + @"\" + mobile;

                string Scan3_Path = ConfigurationManager.AppSettings["Scan3_Path"];
                string destDir_scan3 = Scan3_Path + cp_no.Substring(0, 4) + @"\" + cp_no;

                //move 
                //1.move 後 srcDir_iis會刪除原有  
                //2.destDir_scan3 不能有相同檔名
                if (Directory.Exists(srcDir_iis))
                {
                    if (!Directory.Exists(destDir_scan3))//scan3 沒檔案時 整批move
                    {
                        //Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                        Microsoft.VisualBasic.FileIO.FileSystem.CopyDirectory(srcDir_iis, destDir_scan3);
                    }
                    else//重新上傳
                    {
                        //get destDir_scan3 file and delete scan3
                        System.IO.DirectoryInfo di_scan3 = new DirectoryInfo(destDir_scan3);//scan3
                        System.IO.DirectoryInfo di_iis = new DirectoryInfo(srcDir_iis);//iis


                        //-------------------
                        //scan3 裡有相同檔名的先刪除//eantodo
                        foreach (FileInfo file in di_scan3.GetFiles())
                        {
                            if (file.Name.StartsWith("ID0K"))//add to ID0K-X00 , ID0K-X01
                            {
                                var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                                if (iis_file != null)
                                {
                                    string toFilePath = new Common().CheckSacn3Item_bobo(destDir_scan3, "ID0K-X00", "ID0K-X", file.Extension);
                                    //file move
                                    File.Move(iis_file.FullName, toFilePath);
                                }

                            }
                            else
                            {
                                var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                                if (iis_file != null)
                                {
                                    //file.Delete();//del scan3 2025/11/24原來的 補件後改為如下
                                    //create file name                               
                                    string toFilePath = new Common().CheckSacn3Item(destDir_scan3, file.Name, file.Name.Substring(0, 5), file.Extension);
                                    //file move
                                    File.Move(iis_file.FullName, toFilePath);
                                }
                            }


                        }

                        //整批move
                        //Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                        Microsoft.VisualBasic.FileIO.FileSystem.CopyDirectory(srcDir_iis, destDir_scan3);
                    }

                }


                //最終delete 與client 連結 /img/ 簽名pdf
                var img_root = HttpContext.Current.Server.MapPath("~/img/");
                string newFilePath = img_root + mobile;// + @"\ID0K-000.pdf";//img\0905217718\ID0K-000.pdf
                DeleteFolder(newFilePath);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt + " MoveToScan3", "系統錯誤：" + ex.Message, id, null, cp_no, null, null);
                return new Layout.ReturnMsg() { success = false, msg = ex.Message };
            }

            return new Layout.ReturnMsg() { success = true };



        }

        public Layout.ReturnMsg MoveImageFileToScan3CoverFinishDeleteForDealer(string dealer_id, string random_id)
        {
            try
            {
                //iis pdf
                //string srcDir_iis = @"C:\DuDuPay\DuDuPay\App_Data\Tmp\PDF\" + mobile;
                //iis image
                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                string srcDir_iis = dataFile + @"\" + random_id;

                string Scan4_Path = ConfigurationManager.AppSettings["Scan4_Path"];
                string destDir_scan4 = Scan4_Path + @"dealerpartner\" + dealer_id;

                //if (!Directory.Exists(destDir_scan4)) Directory.CreateDirectory(destDir_scan4);

                //error: 拒絕存取路徑 '\\10.2.8.1\Scan3\2310\2310250024'。
                //del 目標目錄下的檔案
                //if (Directory.Exists(destDir_scan3))
                //{
                //    System.IO.DirectoryInfo di = new DirectoryInfo(destDir_scan3);

                //    foreach (FileInfo file in di.GetFiles())
                //    {
                //        file.Delete();
                //    }
                //    //foreach (DirectoryInfo dir in di.GetDirectories())//刪子目錄
                //    //{
                //    //    dir.Delete(true);
                //    //}
                //}

                //move 
                //1.move 後 srcDir_iis會刪除原有  
                //2.destDir_scan3 不能有相同檔名
                if (Directory.Exists(srcDir_iis))
                {
                    if (!Directory.Exists(destDir_scan4))//scan4 沒檔案時 整批move
                    {
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan4);
                    }
                    else//重新上傳
                    {
                        //get destDir_scan3 file and delete scan3
                        System.IO.DirectoryInfo di_scan4 = new DirectoryInfo(destDir_scan4);//scan4
                        System.IO.DirectoryInfo di_iis = new DirectoryInfo(srcDir_iis);//iis
                                                                                       //----test
                                                                                       //string ean = string.Empty;
                                                                                       //foreach (FileInfo file in di_iis.GetFiles())
                                                                                       //{
                                                                                       //    ean = ean + file.Name + "  ";
                                                                                       //}

                        //using (var db = new kcsddb2Entities_new())
                        //{
                        //    var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                        //    if (m != null)
                        //    {
                        //        m.login_error_msg = ean;
                        //        db.z_Member.Attach(m);
                        //        db.Entry(m).State = EntityState.Modified;
                        //        db.SaveChanges();
                        //    }

                        //};
                        //-------------------
                        //scan3 裡有相同檔名的先刪除
                        foreach (FileInfo file in di_scan4.GetFiles())
                        {
                            var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                            if (iis_file != null)
                            {
                                file.Delete();//del scan3
                            }
                        }

                        //整批move
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan4);
                    }

                }

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "店家申請合作完成" + " MoveToScan3", "系統錯誤：" + ex.Message, null, null, null, null, null);
                return new Layout.ReturnMsg() { success = false, msg = ex.Message };
            }

            return new Layout.ReturnMsg() { success = true };

        }



        /// <summary>
        /// 修改證件..不覆寫證件且完成後刪除 client pdf
        /// </summary>
        /// <param name="cp_no"></param>
        /// <param name="mobile"></param>
        /// <param name="member_id"></param>
        /// <returns></returns>
        public Layout.ReturnMsg MoveImageFileToScan3FinishDelete(string cp_no, string mobile, int member_id, string msg_txt)
        {
            try
            {
                //iis pdf
                //string srcDir_iis = @"C:\DuDuPay\DuDuPay\App_Data\Tmp\PDF\" + mobile;
                //iis image
                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                string srcDir_iis = dataFile + @"\" + mobile;
                string Scan3_Path = ConfigurationManager.AppSettings["Scan3_Path"];
                string destDir_scan3 = Scan3_Path + cp_no.Substring(0, 4) + @"\" + cp_no;


                //move 
                //1.move 後 srcDir_iis會刪除原有  
                //2.destDir_scan3 不能有相同檔名
                if (Directory.Exists(srcDir_iis))
                {
                    if (!Directory.Exists(destDir_scan3))//scan3 沒檔案時 整批move
                    {
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                    }
                    else//重新上傳
                    {
                        //get destDir_scan3 file and delete scan3
                        System.IO.DirectoryInfo di_scan3 = new DirectoryInfo(destDir_scan3);//scan3
                        System.IO.DirectoryInfo di_iis = new DirectoryInfo(srcDir_iis);//iis

                        //-------------------
                        //scan3 裡有相同檔名的先刪除
                        foreach (FileInfo file in di_scan3.GetFiles())
                        {
                            var iis_file = di_iis.GetFiles().Where(x => x.Name == file.Name).FirstOrDefault();
                            if (iis_file != null)//scan3 里有此檔名
                            {
                                //create file name                               
                                string toFilePath = new Common().CheckSacn3Item(destDir_scan3, file.Name, file.Name.Substring(0, 5), file.Extension);
                                //file move
                                File.Move(iis_file.FullName, toFilePath);
                            }

                        }

                        //整批move
                        Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(srcDir_iis, destDir_scan3);
                    }

                }



                //最終delete 與client 連結 /img/ 簽名pdf
                var img_root = HttpContext.Current.Server.MapPath("~/img/");
                string newFilePath = img_root + mobile;// + @"\ID0K-000.pdf";//img\0905217718\ID0K-000.pdf
                DeleteFolder(newFilePath);
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt + " MoveToScan3", "系統錯誤：" + ex.Message, member_id, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };
            }
            return new Layout.ReturnMsg() { success = true };
        }
        #endregion

        void DeleteFolder(string dir)
        {
            foreach (string d in Directory.GetFileSystemEntries(dir))
            {
                if (System.IO.File.Exists(d))
                {
                    FileInfo fi = new FileInfo(d);
                    if (fi.Attributes.ToString().IndexOf("ReadOnly") != -1)
                        fi.Attributes = FileAttributes.Normal;
                    System.IO.File.Delete(d);//直接删除其中的文件   
                }
                else
                    DeleteFolder(d);//递归删除子文件夹   
            }
            Directory.Delete(dir);//删除已空文件夹   
        }


        #region 刪除原先建立的 cp_no
        public void DeleteCpNo(string cp_no)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();
                if (cpdata != null)
                {
                    db.kc_cpdata.Remove(cpdata);
                    db.SaveChanges();
                }
            }
        }

        #endregion

        //寫twca message

        //move image to scan3

        //身份驗證

        //人臉辦識

    }



}
