using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
//using System.Data.Entity.SqlServer;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using DuDuPay.Layout;
using DuDuPay.Models;
using Newtonsoft.Json;

namespace DuDuPay.Controllers
{



    public class Update
    {
        public string Status { get; set; }
        public string Date { get; set; }
    }




    public class MemberController : ApiController
    {
        MemberDA MemberDA;
        private readonly static object _thisLock = new object();

        public MemberController()
        {
            MemberDA = new MemberDA();
        }

        private DuDuPay.Layout.JwtAuthObject GetAuthMember()
        {
            var authMember = RequestContext.RouteData.Values["AuthMember"] as DuDuPay.Layout.JwtAuthObject;
            if (authMember == null || authMember.member_id <= 0)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.Unauthorized, "登入資訊不完整，請重新登入！"));
            }
            return authMember;
        }

        //html form post
        [HttpPost]
        [ActionName("Complex")]
        public HttpResponseMessage PostComplex(Update update)
        {

            var response = new HttpResponseMessage(HttpStatusCode.Redirect);
            response.Headers.Location = new Uri(Url.Link("Default", new { controller = "Home", action = "Order_1", id = System.Web.Mvc.UrlParameter.Optional }));
            return response;
        }

        //=============================================================     


        public HttpResponseMessage Login(string mobile, string pw, string role, string browser, string login_type)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var m = db.z_Member.Where(x => (x.mobile == mobile || x.mail == mobile) && x.role == role).FirstOrDefault();
                    if (m != null)
                    {
                        if (pw != m.pw)
                        {
                            new Common().WriteErrorLog(0, "登入", "密碼錯誤", m.id, m.id_no, m.cp_no, m.kc_member_no, browser);
                            var obja = new DuDuPay.Layout.ReturnMsg()
                            {
                                success = false,
                                msg = "密碼錯誤！"
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, obja);
                        }
                        var isPass = db.kc_memberdata.Any(a => a.kc_member_no == m.kc_member_no);

                        //update 最後登入的時間                    
                        m.last_login_time = DateTime.Now;
                        m.login_day = DateTime.Now.Day;
                        m.browser = browser;
                        m.ip = new Common().GetIp();
                        db.z_Member.Attach(m);
                        db.Entry(m).State = EntityState.Modified;
                        db.SaveChanges();

                        //-----------------general token-----------------------------------------                    
                        var secret = System.Configuration.ConfigurationManager.AppSettings["Jwt_GeneralSigningKey"];
                        //放一些基本的驗證資訊
                        var payload = new DuDuPay.Layout.JwtAuthObject()
                        {
                            issuer = "東元",
                            sub = "dudupay",
                            username = mobile,//記錄user的資訊
                            expiredTime = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd HH:mm:ss"),
                            member_id = m.id,
                            kc_member_no = m.kc_member_no,
                            role = m.role,
                            idno = m.id_no,
                            mobileno = m.mobile
                            //expiredTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss")
                        };
                        string token = Jose.JWT.Encode(payload, System.Text.Encoding.UTF8.GetBytes(secret), Jose.JwsAlgorithm.HS256);
                        //-----------------consume token-----------------------------------------                    
                        var secret_consume = System.Configuration.ConfigurationManager.AppSettings["Jwt_ConsumeSigningKey"];
                        //放一些基本的驗證資訊
                        var payload_consume = new DuDuPay.Layout.JwtAuthObject()
                        {
                            issuer = "東元",
                            sub = "dudupay",
                            username = mobile,//記錄user的資訊
                            expiredTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"),
                            member_id = m.id,
                            kc_member_no = m.kc_member_no,
                            role = m.role,
                            idno = m.id_no,
                            mobileno = m.mobile
                        };
                        string token_consume = Jose.JWT.Encode(payload_consume, System.Text.Encoding.UTF8.GetBytes(secret_consume), Jose.JwsAlgorithm.HS256);
                        //----------------------------------------------------------------------------------
                        
                        //check  memberdata
                        Layout.applyCheckMsg applyCheckMsg = null;
                        Layout.CheckAmountMsg checkAmountMsg = null;
                        Layout.Cart cart = null;

                        //檢查購物車
                        cart = new DealerDA().GetCart(m.id);

                        var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == m.kc_member_no).FirstOrDefault();

                        if (memberdata == null)//表示等待徵審
                        {
                            //因應簡易註冊check
                            if (m.register_type == "正常註冊")
                            {
                                if (m.register_cp_no != null && m.register_cp_no != "")
                                {
                                    //檢查徵審結果
                                    applyCheckMsg = ApplyCheckMsg(m.register_cp_no, m.id, login_type, m.order_type);
                                    if (!applyCheckMsg.check)
                                    {
                                        var obj2 = new DuDuPay.Layout.ReturnMsg()
                                        {
                                            success = false,
                                            msg = applyCheckMsg.error_msg
                                        };
                                        return Request.CreateResponse(HttpStatusCode.OK, obj2);
                                    }
                                }
                            }

                        }
                        else//已是會員 applyCheckMsg = null
                        {

                            //是否有逾期
                            if (memberdata.kc_member_no != "" && memberdata.kc_member_no != null)
                            {
                                OrderDA orderDA = new OrderDA();
                                checkAmountMsg = orderDA.CreateNewCustDuduChk(memberdata.kc_member_no, 0, "登入時檢查額度", "");

                            }
                        }

                        //add 
                        //bool hasPasskey = CheckUserHasPasskey(m.id.ToString());
                        //
                        //if (hasPasskey)
                        //{
                        //    var flowId = Guid.NewGuid();
                        //    var preAuthToken = AuthCookieHelper.CreatePreAuthToken(m, mobile, flowId);
                        //    var obj_auth = new DuDuPay.Layout.ReturnMsg()
                        //    {
                        //        success = true,
                        //        needWebAuthn = true,
                        //        msg = "請完成指紋或安全金鑰驗證"
                        //    };
                        //    var preAuthResp = Request.CreateResponse(HttpStatusCode.OK, obj_auth);
                        //    AuthCookieHelper.AppendPreAuthCookie(preAuthResp, preAuthToken);
                        //    return preAuthResp;
                        //}
                        //-------------------------------

                        var obj = new DuDuPay.Layout.ReturnMsg()
                        {
                            success = true,
                            value = new
                            {
                                m.id,
                                //kc_member_no = applyCheckMsg == null ? m.kc_member_no : memberdata.kc_member_no,
                                kc_member_no = m.kc_member_no,
                                m.name,
                                m.mobile,
                                m.role,
                                m.login_ok_msg,
                                login_day = m.login_day.Value,
                                m.register_step,
                                applyCheckMsg = applyCheckMsg,
                                checkAmountMsg = checkAmountMsg,
                                cart,
                                isPass
                            }
                        };

                        //-------------set  cookie-----------------------------
                        var resp = Request.CreateResponse(HttpStatusCode.OK, obj);
                        long time = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                        long expireTime = time + 1000 * 24 * 60 * 60;//24小時
                        //long expireTime = time + 1000 * 2 * 60 * 60;//2小時
                        DateTime now = new DateTime(expireTime * TimeSpan.TicksPerMillisecond);

                        //long expireTime_consume = time + 1000 * 1 * 60 * 15;//15分鐘                        
                        long expireTime_consume = time + 1000 * 1 * 60 * 15 * 8;//2小時                        
                        DateTime now_consume = new DateTime(expireTime_consume * TimeSpan.TicksPerMillisecond);

                        //resp.Headers.Add("Set-Cookie", $"test=111;Secure;Domain={domain}");//Domain=.facebook.com  Strict
                        //resp.Headers.Add("Set-Cookie", $"eanToken={token};Expires={now.ToString("R")};HttpOnly;Secure;SameSite=None;path=/");//Domain=.facebook.com  Strict
                        resp.Headers.Add("Set-Cookie", $"Token_g={token};Expires={now.ToString("R")};HttpOnly;Secure;SameSite=None;path=/");//Domain=.facebook.com  Strict
                        resp.Headers.Add("Set-Cookie", $"Token_c={token_consume};Expires={now_consume.ToString("R")};HttpOnly;Secure;SameSite=Strict;path=/");//Domain=.facebook.com  Strict

                        return resp;

                        //-------------set  cookie-----------------------------
                        //var resp = Request.CreateResponse(HttpStatusCode.OK, obj);
                        //var loginTokens = AuthCookieHelper.CreateLoginTokens(m, mobile);
                        //AuthCookieHelper.AppendLoginCookies(resp, loginTokens);

                        //return resp;

                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "登入", "無此帳號:" + mobile, null, null, null, null, browser);
                        var obj = new DuDuPay.Layout.ReturnMsg()
                        {
                            success = false,
                            //msg = "無此帳號！"
                            msg = "無此帳號(或門號異常，請嘗試改用 E-mail登入)"
                        };
                        return Request.CreateResponse(HttpStatusCode.OK, obj);
                    }

                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "登入錯誤", ex.Message + "mobile:" + mobile, null, null, null, null, null);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "登入錯誤" + ex.Message);
            }

        }

        private bool CheckUserHasPasskey(string userId)
        {

            using (var db = new kcsddb2Entities_new())
            {
                return db.z_UserPasskey
                         .AsNoTracking()
                         .Any(x =>
                              x.UserId == userId &&
                              x.IsEnabled == true);
            }
        }
        private List<byte[]> GetUserCredentialIds(string userId)
        {
            using (var db = new kcsddb2Entities_new())
            {
                return db.z_UserPasskey
                         .AsNoTracking()
                         .Where(x =>
                                x.UserId == userId &&
                                x.IsEnabled)
                         .Select(x => x.CredentialId)
                         .ToList();
            }
        }

        // login_type == "註冊帶訂單" 代表前端正在訂單頁 (order_2/order_3/orderapi) 登入
        internal Layout.applyCheckMsg ApplyCheckMsg(string cp_no, int member_id, string login_type, string member_order_type)
        {
            kc_cpdata cp_data;
            using (var db = new kcsddb2Entities_new())
            {
                cp_data = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();
                if (cp_data == null)
                {
                    new Common().WriteErrorLog(1, "登入檢核 徵審狀態", "cp_data cp_no 不存在" + cp_no, member_id, null, null, null, null);
                    return new Layout.applyCheckMsg() { check = false, error_msg = "登入檢核 徵審狀態 cp_data cp_no 不存在" + cp_no };
                }
            }

            //先檢查徵審狀態後檢查核准狀態
            #region
            switch (cp_data.kc_cfm_stat)//徵審狀態
            {
                case "B":
                    switch (cp_data.kc_apply_stat)//核准狀態
                    {
                        case "":
                        case null:
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "B",
                                kc_apply_stat = "",
                                type = 1,
                            };
                        case "N":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "B",
                                kc_apply_stat = "N",
                                type = 2,
                            };
                        case "R":
                            //check 徵審狀態 R
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "B",
                                kc_apply_stat = "R",
                                type = ApplyStatus_180(cp_data.kc_appv_date.Value) ? 17 : 3,
                            };

                        case "P"://通過
                                 //string member_no = new Common().getMemberNo(cp_data.kc_id_no);
                                 //bool has_memberdata = db.kc_memberdata.Any(x => x.kc_member_no == member_no);
                                 //if (!has_memberdata)
                                 //{
                                 //    return new applyCheckMsg()
                                 //    {
                                 //        check = false,
                                 //        error_msg = "會員基本資料未建立",
                                 //        kc_apply_stat = "",
                                 //    };
                                 //}

                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "B",
                                kc_apply_stat = "P",
                                type = 4,
                            };
                            //default:
                            //    break;
                    }
                    break;
                case "P":
                    switch (cp_data.kc_apply_stat)
                    {
                        case "":
                        case null:
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "P",
                                kc_apply_stat = "",
                                type = 5,
                            };
                        case "N":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "P",
                                kc_apply_stat = "N",
                                type = 6,
                            };
                        case "R":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "P",
                                kc_apply_stat = "R",
                                type = ApplyStatus_180(cp_data.kc_appv_date.Value) ? 18 : 7,
                            };

                        case "P"://通過
                                 //string member_no = new Common().getMemberNo(cp_data.kc_id_no);
                                 //bool has_memberdata = db.kc_memberdata.Any(x => x.kc_member_no == member_no);
                                 //if (!has_memberdata)
                                 //{
                                 //    return new applyCheckMsg()
                                 //    {
                                 //        check = false,
                                 //        error_msg = "會員基本資料未建立",
                                 //        kc_apply_stat = "",
                                 //    };
                                 //}

                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "P",
                                kc_apply_stat = "P",
                                type = 8,
                            };
                    }
                    break;
                case "R":
                    switch (cp_data.kc_apply_stat)
                    {
                        case "":
                        case null:
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "R",
                                kc_apply_stat = "",
                                type = 9,
                            };
                        case "N":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "R",
                                kc_apply_stat = "N",
                                type = 10,
                            };
                        case "R":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "R",
                                kc_apply_stat = "R",
                                type = ApplyStatus_180(cp_data.kc_appv_date.Value) ? 19 : 11,
                            };

                        case "P"://通過
                                 //string member_no = new Common().getMemberNo(cp_data.kc_id_no);
                                 //bool has_memberdata = db.kc_memberdata.Any(x => x.kc_member_no == member_no);
                                 //if (!has_memberdata)
                                 //{
                                 //    return new applyCheckMsg()
                                 //    {
                                 //        check = false,
                                 //        error_msg = "會員基本資料未建立",
                                 //        kc_apply_stat = "",
                                 //    };
                                 //}

                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "R",
                                kc_apply_stat = "P",
                                type = 12,
                            };
                    }
                    break;
                case "N":
                case "":
                case null:
                    switch (cp_data.kc_apply_stat)
                    {
                        case "":
                        case null:
                            //放行資格以 DB 的 order_type 為準，login_type 只代表前端在訂單頁
                            if (login_type == "註冊帶訂單" && member_order_type == "註冊帶訂單")
                            {
                                return new Layout.applyCheckMsg()
                                {
                                    check = true,
                                    kc_cfm_stat = "N",
                                    kc_apply_stat = "",
                                    type = 21,
                                };
                            }
                            else
                            {
                                return new Layout.applyCheckMsg()
                                {
                                    check = true,
                                    kc_cfm_stat = "N",
                                    kc_apply_stat = "",
                                    type = 13,
                                };
                            }

                        case "N":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "N",
                                kc_apply_stat = "N",
                                type = 14,
                            };
                        case "R":
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "N",
                                kc_apply_stat = "R",
                                type = ApplyStatus_180(cp_data.kc_appv_date.Value) ? 20 : 15,
                            };

                        case "P"://通過
                                 //string member_no = new Common().getMemberNo(cp_data.kc_id_no);
                                 //bool has_memberdata = db.kc_memberdata.Any(x => x.kc_member_no == member_no);
                                 //if (!has_memberdata)
                                 //{
                                 //    return new applyCheckMsg()
                                 //    {
                                 //        check = false,
                                 //        error_msg = "會員基本資料未建立",
                                 //        kc_apply_stat = "",
                                 //    };
                                 //}

                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "N",
                                kc_apply_stat = "P",
                                type = 16,
                            };
                    }
                    break;
                //default:
                //    break;

                case "Z":
                    switch (cp_data.kc_apply_stat)
                    {
                        case "P"://通過                                
                            return new Layout.applyCheckMsg()
                            {
                                check = true,
                                kc_cfm_stat = "Z",
                                kc_apply_stat = "P",
                                type = 22,
                            };
                    }
                    break;

            }
            #endregion


            new Common().WriteErrorLog(1, "登入檢核 徵審狀態", "程式羅輯不在判斷中20240707需求單單號240717003,cp_no:" + cp_no, member_id, null, null, null, null);
            return new Layout.applyCheckMsg() { check = false, error_msg = "程式羅輯不在判斷中" };

        }

        ////距退件後已 >180天
        bool ApplyStatus_180(DateTime? kc_appv_date)
        {
            if (!kc_appv_date.HasValue) return false;

            DateTime apply_date = DateTime.Parse(kc_appv_date.Value.ToString("yyyy-MM-dd") + " 23:59:59");
            DateTime return_date = apply_date.AddDays(180);

            int dateCount = new TimeSpan(return_date.Ticks - DateTime.Now.Ticks).Days;
            if (dateCount <= 0) return true;
            return false;

        }

        public HttpResponseMessage Login2(string mobile, string pw, string role, string browser)
        {
            var result = Login2Core(mobile, pw, role, browser);

            var resp = Request.CreateResponse(HttpStatusCode.OK, result.Result);

            // 設 cookie（只有成功才設）
            if (result.Result.success && !string.IsNullOrEmpty(result.Token))
            {
                long time = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                long expireTime = time + 1000 * 24 * 60 * 60;
                DateTime now = new DateTime(expireTime * TimeSpan.TicksPerMillisecond);

                resp.Headers.Add("Set-Cookie",
                    $"Token_g={result.Token};Expires={now:R};HttpOnly;Secure;SameSite=None;path=/");
            }

            return resp;

        }

        public class LoginResult
        {
            public DuDuPay.Layout.ReturnMsg Result { get; set; }
            public string Token { get; set; } // 給外層用來設 cookie
        }

        internal LoginResult Login2Core(string mobile, string pw, string role, string browser)
        {
            try
            {
                // 🔴 admin 特例
                if (mobile == "admin" && pw == "1234")
                {
                    return new LoginResult
                    {
                        Result = new DuDuPay.Layout.ReturnMsg()
                        {
                            success = true,
                            msg = "admin"
                        }
                    };
                }

                using (var db = new kcsddb2Entities_new())
                {
                    var m = db.z_Member
                        .Where(x => x.dealer_acc == mobile && x.role == role)
                        .FirstOrDefault();

                    if (m == null)
                    {
                        new Common().WriteErrorLog(0, "登入", "無此帳號:" + mobile, null, null, null, null, browser);

                        return new LoginResult
                        {
                            Result = new DuDuPay.Layout.ReturnMsg()
                            {
                                success = false,
                                msg = "無此帳號！"
                            }
                        };
                    }

                    // 密碼錯誤
                    if (pw != m.pw)
                    {
                        new Common().WriteErrorLog(0, "登入", "密碼錯誤", m.id, m.id_no, m.cp_no, m.kc_member_no, browser);

                        return new LoginResult
                        {
                            Result = new DuDuPay.Layout.ReturnMsg()
                            {
                                success = false,
                                msg = "密碼錯誤！"
                            }
                        };
                    }

                    // 分期未啟用
                    if (m.login_ok_msg != "*")
                    {
                        return new LoginResult
                        {
                            Result = new DuDuPay.Layout.ReturnMsg()
                            {
                                success = false,
                                msg = "此經銷商暫時停用,請洽客服人員(分期未啟用)！"
                            }
                        };
                    }

                    // 權限未啟用
                    if (m.isStart != "*")
                    {
                        return new LoginResult
                        {
                            Result = new DuDuPay.Layout.ReturnMsg()
                            {
                                success = false,
                                msg = "此經銷帳號沒有登入的權限(權限設定未啟用)！"
                            }
                        };
                    }

                    // ===== 權限判斷 =====
                    var allDealerRole = EnumHelper.GetDescriptions<DealerAuthority>();
                    var dealerRole = db.z_DealerRole
                             .Where(x => x.store_no == m.store_no && x.dealer_name == m.dealer_role && x.isCheck.Value)
                             .ToList();

                    var authoritys = allDealerRole.Select(x => new
                    {
                        authority = x,
                        isCheck = m.dealer_role == "負責人" ? true : dealerRole.Any(a => a.authority == x && a.isCheck.Value)
                    }).ToList();
                    

                    // ===== 更新登入資訊 =====
                    m.last_login_time = DateTime.Now;
                    m.login_day = DateTime.Now.Day;
                    m.browser = browser;
                    m.ip = new Common().GetIp();

                    db.z_Member.Attach(m);
                    db.Entry(m).State = EntityState.Modified;

                    // ===== 首登紀錄 =====
                    var pm = db.z_PartnerMerchants.Where(x => x.status_code == "14" &&
                        (x.c_taxid_no == pw ||
                        (x.p_idno != null && x.p_idno.Length >= 8 && x.p_idno.Substring(x.p_idno.Length - 8) == pw)))
                        .FirstOrDefault();

                    if (pm != null)
                    {
                        bool hasFirstLogin = db.z_PartnerMerchantsFoot
                            .Any(x => x.taxid_no == pw && x.first_login == "*");

                        if (!hasFirstLogin)
                        {
                            var partnerMerchantsFoot = new z_PartnerMerchantsFoot()
                            {
                                item = "帳號已開通(特約商首次登入完成)",
                                ip = new Common().GetIp(),
                                date_time = DateTime.Now,
                                first_login = "*",
                                taxid_no = pw,
                                dealer_id = pm.dealer_id,
                            };
                            db.z_PartnerMerchantsFoot.Add(partnerMerchantsFoot);
                            db.SaveChanges();
                            var footprintId = partnerMerchantsFoot.footprints_id;
                            var request = new SetSalesNotifyRequest { FootprintId = footprintId };
                            new MydyClient().GetAsync<SetSalesNotifyRequest, SetSalesNotifyResponse>("SetSalesNotify", request);
                        }
                    }
                    else
                    {
                        db.SaveChanges();
                    }

                    // ===== JWT =====
                    var secret = System.Configuration.ConfigurationManager.AppSettings["Jwt_GeneralSigningKey"];

                    var payload = new DuDuPay.Layout.JwtAuthObject()
                    {
                        issuer = "東元",
                        sub = "dudupay",
                        username = mobile,
                        expiredTime = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd HH:mm:ss"),
                        member_id = m.id,
                        kc_member_no = m.kc_member_no,
                        role = m.role,
                        idno = m.id_no,
                        mobileno = m.mobile
                    };

                    string token = Jose.JWT.Encode(payload,
                        System.Text.Encoding.UTF8.GetBytes(secret),
                        Jose.JwsAlgorithm.HS256);

                    // ===== 回傳 =====
                    return new LoginResult
                    {
                        Token = token,
                        Result = new DuDuPay.Layout.ReturnMsg()
                        {
                            success = true,
                            value = new
                            {
                                m.id,
                                m.kc_member_no,
                                m.name,
                                m.role,
                                m.login_ok_msg,
                                login_day = m.login_day.Value,
                                m.dealer_acc,
                                m.store_no,
                                m.dealer_role,
                                m.dealer_branch,
                                authoritys
                            }
                        }
                    };
                }
            }
            catch (Exception ex)
            {
                return new LoginResult
                {
                    Result = new DuDuPay.Layout.ReturnMsg()
                    {
                        success = false,
                        msg = "登入錯誤：" + ex.Message
                    }
                };
            }
        }

        //public HttpResponseMessage Login2(string mobile, string pw, string role, string browser)
        //{
        //    try
        //    {
        //        if (mobile == "admin" && pw == "1234")
        //        {
        //            return Request.CreateResponse(HttpStatusCode.OK, new DuDuPay.Layout.ReturnMsg()
        //            {
        //                success = true,
        //                msg = "admin"
        //            });
        //        }


        //        using (var db = new kcsddb2Entities_new())
        //        {
        //            //有區分大小寫
        //            //var m = db.z_Member.Where(x => x.dealer_acc == mobile && x.role == role).ToList().Where(s => mobile.Contains(s.dealer_acc)).FirstOrDefault();                    
        //            var m = db.z_Member.Where(x => x.dealer_acc == mobile && x.role == role).FirstOrDefault();
        //            if (m != null)
        //            {
        //                if (pw != m.pw)
        //                {
        //                    new Common().WriteErrorLog(0, "登入", "密碼錯誤", m.id, m.id_no, m.cp_no, m.kc_member_no, browser);
        //                    return Request.CreateResponse(HttpStatusCode.OK, new DuDuPay.Layout.ReturnMsg()
        //                    {
        //                        success = false,
        //                        msg = "密碼錯誤！"
        //                    });
        //                }
        //                //分期未啟用
        //                if (m.login_ok_msg != "*")
        //                {
        //                    return Request.CreateResponse(HttpStatusCode.OK, new DuDuPay.Layout.ReturnMsg()
        //                    {
        //                        success = false,
        //                        msg = "此經銷商暫時停用,請洽客服人員(分期未啟用)！"
        //                    });
        //                }

        //                if (m.isStart != "*")
        //                {
        //                    return Request.CreateResponse(HttpStatusCode.OK, new DuDuPay.Layout.ReturnMsg()
        //                    {
        //                        success = false,
        //                        msg = "此經銷帳號沒有登入的權限(權限設定未啟用)！"
        //                    });
        //                }

        //                //檢查角色權限 非負責人角色
        //                //bool authority_query = true; bool authority_cashApply = true; bool authority_admin = true;
        //                bool authority_query = false; bool authority_cashApply = false; bool authority_admin = false;
        //                bool authority_mall = false;
        //                if (m.dealer_role == "負責人")
        //                {
        //                    authority_query = true; authority_cashApply = true; authority_admin = true;
        //                }
        //                else
        //                {
        //                    if (m.dealer_acc != null && m.dealer_acc != "")
        //                    {
        //                        var DealerRole = db.z_DealerRole.Where(x => x.store_no == m.store_no && x.dealer_name == m.dealer_role && x.isCheck.Value).ToList();
        //                        if (DealerRole != null)
        //                        {
        //                            authority_query = DealerRole.Any(x => x.authority == "訂單查詢");
        //                            authority_cashApply = DealerRole.Any(x => x.authority == "申請撥款");
        //                            authority_admin = DealerRole.Any(x => x.authority == "角色權限");
        //                        }
        //                    }
        //                }
        //                //--------------
        //                //商城
        //                var caragent = db.kc_caragent.Where(x => x.kc_agent_code == m.store_no && x.kc_duduMall_type == "Y").FirstOrDefault();
        //                if (caragent != null) authority_mall = true;


        //                //update 最後登入的時間                    
        //                m.last_login_time = DateTime.Now;
        //                m.login_day = DateTime.Now.Day;
        //                m.browser = browser;
        //                m.ip = new Common().GetIp();
        //                db.z_Member.Attach(m);
        //                db.Entry(m).State = EntityState.Modified;

        //                //有申請首登寫足跡
        //                var pm = db.z_PartnerMerchants.Where(x => x.status_code == "14" &&
        //                (x.c_taxid_no == pw ||
        //                (x.p_idno != null && x.p_idno != "" && x.p_idno.Length >= 8 && x.p_idno.Substring(x.p_idno.Length - 8) == pw))).FirstOrDefault();

        //                if (pm != null)//有申請
        //                {
        //                    //首登
        //                    bool hasFirstLogin = db.z_PartnerMerchantsFoot.Any(x => x.taxid_no == pw && x.first_login == "*");
        //                    if (!hasFirstLogin)
        //                    {
        //                        db.z_PartnerMerchantsFoot.Add(new z_PartnerMerchantsFoot()
        //                        {
        //                            item = "帳號已開通(特約商首次登入完成)",
        //                            ip = new Common().GetIp(),
        //                            date_time = DateTime.Now,
        //                            first_login = "*",
        //                            taxid_no = pw,
        //                            dealer_id = pm.dealer_id,
        //                        });
        //                    }
        //                }
        //                //----------------------------------
        //                db.SaveChanges();
        //                //-----------------general token-----------------------------------------                    
        //                var secret = System.Configuration.ConfigurationManager.AppSettings["Jwt_GeneralSigningKey"];
        //                //放一些基本的驗證資訊
        //                var payload = new DuDuPay.Layout.JwtAuthObject()
        //                {
        //                    issuer = "東元",
        //                    sub = "dudupay",
        //                    username = mobile,//記錄user的資訊
        //                    expiredTime = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd HH:mm:ss")
        //                    //expiredTime = DateTime.Now.AddHours(2).ToString("yyyy-MM-dd HH:mm:ss")
        //                };
        //                string token = Jose.JWT.Encode(payload, System.Text.Encoding.UTF8.GetBytes(secret), Jose.JwsAlgorithm.HS256);
        //                //----------------------------------------------------------
        //                var obj = new DuDuPay.Layout.ReturnMsg()
        //                {
        //                    success = true,
        //                    value = new
        //                    {
        //                        m.id,
        //                        m.kc_member_no,
        //                        m.name,
        //                        //m.mobile,
        //                        m.role,
        //                        m.login_ok_msg,
        //                        login_day = m.login_day.Value,
        //                        m.dealer_acc,
        //                        m.store_no,
        //                        m.dealer_role,
        //                        m.dealer_branch,
        //                        authority_query,//權限  
        //                        authority_cashApply,
        //                        authority_admin,
        //                        authority_mall
        //                    },

        //                };
        //                //-------------set  cookie-----------------------------
        //                var resp = Request.CreateResponse(HttpStatusCode.OK, obj);
        //                long time = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
        //                long expireTime = time + 1000 * 24 * 60 * 60;//24小時
        //                DateTime now = new DateTime(expireTime * TimeSpan.TicksPerMillisecond);

        //                resp.Headers.Add("Set-Cookie", $"Token_g={token};Expires={now.ToString("R")};HttpOnly;Secure;SameSite=None;path=/");//Domain=.facebook.com  Strict                    

        //                return resp;
        //            }
        //            else
        //            {
        //                new Common().WriteErrorLog(0, "登入", "無此帳號:" + mobile, null, null, null, null, browser);
        //                return Request.CreateResponse(HttpStatusCode.OK, new DuDuPay.Layout.ReturnMsg()
        //                {
        //                    success = false,
        //                    msg = "無此帳號！"
        //                });
        //            }

        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "登入錯誤" + ex.Message);
        //    }


        //}



        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object SendMobileCode(string mobile)
        {
            return MemberDA.SendMobileCode(mobile);
        }


        [HttpPost]
        public HttpResponseMessage Register(string type, string pw, string mobile, string mail, string recommend_code, string browser, string order_url, string mobile_code = null)
        {
            try
            {
                if (!new Shared.Security.MobileOtpService("kcsddb2Entities_new").Verify(mobile, mobile_code, true))
                    return Request.CreateResponse(HttpStatusCode.OK, new { success = false, msg = "手機驗證碼不正確或已過期" });

                using (var db = new kcsddb2Entities_new())
                {

                    //店家推薦碼 的處理                    
                    string comp_code = "";//1.會員推薦DU99或一般用DU00;2.店家推薦用店家代號
                    string sales_code = "";
                    string area_code; //1.非店家推薦用DU00去query;2.店家推薦用店家代號query
                    Common c = new Common();
                    if (recommend_code != null && recommend_code != "" && recommend_code.Trim().Length == 4)
                    {
                        string areaCode = "";
                        //4碼都是數字 客服員工推薦 以無推薦方式處理DU00
                        int n;
                        bool isNumeric = int.TryParse(recommend_code.Trim(), out n);

                        if (isNumeric)//員工
                        {
                            comp_code = "DU00";
                            sales_code = c.GetSalesCode("DU00");
                            areaCode = c.GetAreaCode("DU00", mobile);
                        }
                        else//4碼數字加英文 店家推薦
                        {
                            comp_code = recommend_code;//店家碼 
                            sales_code = c.GetSalesCode(recommend_code);//店家
                            areaCode = c.GetAreaCode(recommend_code, mobile);//用店家代碼得area_code                           
                        }

                        if (areaCode == "")
                        {
                            var obja = new DuDuPay.Layout.ReturnMsg
                            {
                                success = false,
                                msg = "kc_caragent table, kc_area_code space error 員工推薦/店家推薦 請洽客服人員",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, obja);
                        }
                        else
                        {
                            area_code = areaCode;
                        }


                    }
                    else//非店家推薦
                    {
                        string areaCode = "";
                        //會員推薦
                        if (recommend_code != null && recommend_code != "" && recommend_code.Trim().Length == 11)
                        {
                            //check 此推薦碼
                            bool has_introduce_code = db.kc_memberdata.Any(x => x.kc_introduce_code == recommend_code.Trim());
                            if (!has_introduce_code)
                            {
                                var obja = new DuDuPay.Layout.ReturnMsg
                                {
                                    success = false,
                                    msg = "會員資料中無此推薦碼" + recommend_code + "請重新確認此推薦碼或空白不使用推薦碼"
                                };
                                return Request.CreateResponse(HttpStatusCode.OK, obja);
                            }
                            //會員推薦
                            comp_code = "DU99";
                            sales_code = c.GetSalesCode("DU99");
                            areaCode = c.GetAreaCode("DU99", mobile);
                        }
                        else//無推薦碼
                        {
                            comp_code = "DU00";
                            sales_code = c.GetSalesCode("DU00");
                            areaCode = c.GetAreaCode("DU00", mobile);
                        }

                        if (areaCode == "")
                        {
                            var obja = new DuDuPay.Layout.ReturnMsg
                            {
                                success = false,
                                msg = "kc_caragent table, kc_area_code space error 會員推薦/無推薦 請洽客服人員",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, obja);
                        }
                        else
                        {
                            area_code = areaCode;
                        }
                    }
                    //註冊會員
                    z_Member member = new z_Member()
                    {
                        pw = pw, //EncryptByDES(pw),
                        mobile = mobile,
                        mail = mail,
                        role = "member",
                        kc_introduce_code = recommend_code,
                        browser = browser,
                        last_login_time = DateTime.Now,
                        login_day = DateTime.Now.Day,
                        kc_comp_code = comp_code,
                        kc_sales_code = sales_code,
                        ip = new Common().GetIp(),
                        register_step = 0,
                        area_code = area_code,
                        update_time = DateTime.Now,
                        order_url = order_url != "" && order_url != null ? order_url : null,//帶訂單
                        order_type = order_url != "" && order_url != null ? "註冊帶訂單" : "綜合",
                    };
                    db.z_Member.Add(member);
                    db.SaveChanges();


                    //-----------------general token-----------------------------------------                    
                    var secret = System.Configuration.ConfigurationManager.AppSettings["Jwt_GeneralSigningKey"];
                    //放一些基本的驗證資訊
                    var payload = new DuDuPay.Layout.JwtAuthObject()
                    {
                        issuer = "東元",
                        sub = "dudupay",
                        username = mobile,//記錄user的資訊
                        expiredTime = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd HH:mm:ss"),
                        member_id = member.id,
                        kc_member_no = member.kc_member_no,
                        role = member.role,
                        idno = member.id_no,
                        mobileno = member.mobile
                        //expiredTime = DateTime.Now.AddMinutes(5).ToString("yyyy-MM-dd HH:mm:ss")
                    };
                    string token = Jose.JWT.Encode(payload, System.Text.Encoding.UTF8.GetBytes(secret), Jose.JwsAlgorithm.HS256);
                    //-----------------consume token-----------------------------------------                    
                    var secret_consume = System.Configuration.ConfigurationManager.AppSettings["Jwt_ConsumeSigningKey"];
                    //放一些基本的驗證資訊
                    var payload_consume = new DuDuPay.Layout.JwtAuthObject()
                    {
                        issuer = "東元",
                        sub = "dudupay",
                        username = mobile,//記錄user的資訊
                        expiredTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"),
                        member_id = member.id,
                        kc_member_no = member.kc_member_no,
                        role = member.role,
                        idno = member.id_no,
                        mobileno = member.mobile
                    };
                    string token_consume = Jose.JWT.Encode(payload_consume, System.Text.Encoding.UTF8.GetBytes(secret_consume), Jose.JwsAlgorithm.HS256);

                    //----------------------------------------------------------------------------------
                    var obj = new DuDuPay.Layout.ReturnMsg()
                    {
                        success = true,
                        value = new
                        {
                            id = member.id,
                            name = member.name,
                            cp_no = member.cp_no,
                            mobile = member.mobile,
                            role = "member",
                            login_ok_msg = member.login_ok_msg
                        }
                    };

                    //-------------set  cookie-----------------------------
                    var resp = Request.CreateResponse(HttpStatusCode.OK, obj);
                    long time = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                    long expireTime = time + 1000 * 24 * 60 * 60;//24小時
                    DateTime now = new DateTime(expireTime * TimeSpan.TicksPerMillisecond);


                    //long expireTime_consume = time + 1000 * 1 * 60 * 15;//15分鐘                        
                    long expireTime_consume = time + 1000 * 1 * 60 * 15 * 8;//2小時                        
                    DateTime now_consume = new DateTime(expireTime_consume * TimeSpan.TicksPerMillisecond);


                    resp.Headers.Add("Set-Cookie", $"Token_g={token};Expires={now.ToString("R")};HttpOnly;Secure;SameSite=None;path=/");//Domain=.facebook.com  Strict
                    resp.Headers.Add("Set-Cookie", $"Token_c={token_consume};Expires={now_consume.ToString("R")};HttpOnly;Secure;SameSite=Strict;path=/");//Domain=.facebook.com  Strict

                    return resp;

                };
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "登入錯誤" + ex.Message);
            }

            //return MemberDA.Register(type, pw, mobile, mail, recommend_code, browser);
        }

        [HttpPost]
        public HttpResponseMessage Register_2(string pw, string mobile, string mail, string recommend_code, string browser, string order_url, string purchase_item, string mobile_code = null)
        {
            try
            {
                if (!new Shared.Security.MobileOtpService("kcsddb2Entities_new").Verify(mobile, mobile_code, true))
                    return Request.CreateResponse(HttpStatusCode.OK, new { success = false, msg = "手機驗證碼不正確或已過期" });

                using (var db = new kcsddb2Entities_new())
                {

                    //店家推薦碼 的處理                    
                    string comp_code = "";//1.會員推薦DU99或一般用DU00;2.店家推薦用店家代號
                    string sales_code = "";
                    string area_code; //1.非店家推薦用DU00去query;2.店家推薦用店家代號query
                    Common c = new Common();
                    if (recommend_code != null && recommend_code != "" && recommend_code.Trim().Length == 4)
                    {
                        string areaCode = "";
                        //4碼都是數字 客服員工推薦 以無推薦方式處理DU00
                        int n;
                        bool isNumeric = int.TryParse(recommend_code.Trim(), out n);

                        if (isNumeric)//員工
                        {
                            comp_code = "DU00";
                            sales_code = c.GetSalesCode("DU00");
                            areaCode = c.GetAreaCode("DU00", mobile);
                        }
                        else//4碼數字加英文 店家推薦
                        {
                            comp_code = recommend_code;//店家碼 
                            sales_code = c.GetSalesCode(recommend_code);//店家
                            areaCode = c.GetAreaCode(recommend_code, mobile);//用店家代碼得area_code                           
                        }

                        if (areaCode == "")
                        {
                            var obja = new DuDuPay.Layout.ReturnMsg
                            {
                                success = false,
                                msg = "kc_caragent table, kc_area_code space error 員工推薦/店家推薦 請洽客服人員",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, obja);
                        }
                        else
                        {
                            area_code = areaCode;
                        }


                    }
                    else//非店家推薦
                    {
                        string areaCode = "";
                        //會員推薦
                        if (recommend_code != null && recommend_code != "" && recommend_code.Trim().Length == 11)
                        {
                            //check 此推薦碼
                            bool has_introduce_code = db.kc_memberdata.Any(x => x.kc_introduce_code == recommend_code.Trim());
                            if (!has_introduce_code)
                            {
                                var obja = new DuDuPay.Layout.ReturnMsg
                                {
                                    success = false,
                                    msg = "會員資料中無此推薦碼" + recommend_code + "請重新確認此推薦碼或空白不使用推薦碼"
                                };
                                return Request.CreateResponse(HttpStatusCode.OK, obja);
                            }
                            //會員推薦
                            comp_code = "DU99";
                            sales_code = c.GetSalesCode("DU99");
                            areaCode = c.GetAreaCode("DU99", mobile);
                        }
                        else//無推薦碼
                        {
                            comp_code = "DU00";
                            sales_code = c.GetSalesCode("DU00");
                            areaCode = c.GetAreaCode("DU00", mobile);
                        }

                        if (areaCode == "")
                        {
                            var obja = new DuDuPay.Layout.ReturnMsg
                            {
                                success = false,
                                msg = "kc_caragent table, kc_area_code space error 會員推薦/無推薦 請洽客服人員",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, obja);
                        }
                        else
                        {
                            area_code = areaCode;
                        }
                    }
                    //註冊會員
                    z_Member member = new z_Member()
                    {
                        pw = pw, //EncryptByDES(pw),
                        mobile = mobile,
                        mail = mail,
                        role = "member",
                        kc_introduce_code = recommend_code,
                        browser = browser,
                        last_login_time = DateTime.Now,
                        login_day = DateTime.Now.Day,
                        kc_comp_code = comp_code,
                        kc_sales_code = sales_code,
                        ip = new Common().GetIp(),
                        register_step = 0,
                        area_code = area_code,
                        update_time = DateTime.Now,
                        order_url = order_url != "" && order_url != null ? order_url : null,//帶訂單
                        order_type = order_url != "" && order_url != null ? "註冊帶訂單" : "綜合",
                    };
                    db.z_Member.Add(member);
                    db.SaveChanges();

                    //商城註冊購買
                    if (purchase_item != "" && purchase_item != null)
                    {
                        z_Cart parsedJson = JsonConvert.DeserializeObject<z_Cart>(purchase_item);
                        var dealer = db.z_Dealer.Where(x => x.store_no == parsedJson.store_no).FirstOrDefault();

                        db.z_Cart.Add(new z_Cart()
                        {
                            member_id = member.id,
                            add_time = DateTime.Now,
                            buy_qty = parsedJson.buy_qty,
                            dealer_id = parsedJson.dealer_id,
                            item = parsedJson.item,
                            item_spec = parsedJson.item_spec,
                            product_id = parsedJson.product_id,
                            store_no = parsedJson.store_no,
                            cash = parsedJson.cash,
                            cust_check = "*",
                            dealer_name = dealer != null ? dealer.dealer_name : ""

                        });
                        db.SaveChanges();
                    }





                    //-----------------general token-----------------------------------------                    
                    var secret = System.Configuration.ConfigurationManager.AppSettings["Jwt_GeneralSigningKey"];
                    //放一些基本的驗證資訊
                    var payload = new DuDuPay.Layout.JwtAuthObject()
                    {
                        issuer = "東元",
                        sub = "dudupay",
                        username = mobile,//記錄user的資訊
                        expiredTime = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd HH:mm:ss"),
                        member_id = member.id,
                        kc_member_no = member.kc_member_no,
                        role = member.role,
                        idno = member.id_no,
                        mobileno = member.mobile
                        //expiredTime = DateTime.Now.AddMinutes(5).ToString("yyyy-MM-dd HH:mm:ss")
                    };
                    string token = Jose.JWT.Encode(payload, System.Text.Encoding.UTF8.GetBytes(secret), Jose.JwsAlgorithm.HS256);
                    //-----------------consume token-----------------------------------------                    
                    var secret_consume = System.Configuration.ConfigurationManager.AppSettings["Jwt_ConsumeSigningKey"];
                    //放一些基本的驗證資訊
                    var payload_consume = new DuDuPay.Layout.JwtAuthObject()
                    {
                        issuer = "東元",
                        sub = "dudupay",
                        username = mobile,//記錄user的資訊
                        expiredTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"),
                        member_id = member.id,
                        kc_member_no = member.kc_member_no,
                        role = member.role,
                        idno = member.id_no,
                        mobileno = member.mobile
                    };
                    string token_consume = Jose.JWT.Encode(payload_consume, System.Text.Encoding.UTF8.GetBytes(secret_consume), Jose.JwsAlgorithm.HS256);

                    //----------------------------------------------------------------------------------
                    var obj = new DuDuPay.Layout.ReturnMsg()
                    {
                        success = true,
                        value = new
                        {
                            id = member.id,
                            name = member.name,
                            cp_no = member.cp_no,
                            mobile = member.mobile,
                            role = "member",
                            login_ok_msg = member.login_ok_msg
                        }
                    };

                    //-------------set  cookie-----------------------------
                    var resp = Request.CreateResponse(HttpStatusCode.OK, obj);
                    long time = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                    long expireTime = time + 1000 * 24 * 60 * 60;//24小時
                    DateTime now = new DateTime(expireTime * TimeSpan.TicksPerMillisecond);


                    //long expireTime_consume = time + 1000 * 1 * 60 * 15;//15分鐘                        
                    long expireTime_consume = time + 1000 * 1 * 60 * 15 * 8;//2小時                        
                    DateTime now_consume = new DateTime(expireTime_consume * TimeSpan.TicksPerMillisecond);


                    resp.Headers.Add("Set-Cookie", $"Token_g={token};Expires={now.ToString("R")};HttpOnly;Secure;SameSite=None;path=/");//Domain=.facebook.com  Strict
                    resp.Headers.Add("Set-Cookie", $"Token_c={token_consume};Expires={now_consume.ToString("R")};HttpOnly;Secure;SameSite=Strict;path=/");//Domain=.facebook.com  Strict

                    return resp;

                };
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "登入錯誤" + ex.Message);
            }

            //return MemberDA.Register(type, pw, mobile, mail, recommend_code, browser);
        }



        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object MemberInfo(string id_no, string name, string birthDay,
                     string issue_date, string issue_site, string issue_reason,
                              string address, string current_address,
                              string tel, string link_name, string link_mobile, string link_relation,
                              string work_type, string work_name, string work_tel,
                              string create_type, string create_co, string bankCode,
                              string bankName, string bankAcc, string lineId, string cash,
                              string voice_type, string voice_txt_mobile, string voice_txt_give,
                              string voice_subtype,
                             //string voice_subtype_2,
                             string voice_txt_cq, string voice_txt_oaddress)
        {
            var id = GetAuthMember().member_id;


            //檢查是否滿18岁
            try
            {
                if (new Common().GetAgeByBirthdate(DateTime.Parse(birthDay)) < 18)
                {
                    //write to db
                    Utity u = new Utity();
                    Layout.ReturnMsg ReturnMsg = u.MemberInfo_18(id, id_no, name, birthDay, issue_date, issue_site, issue_reason, address, current_address,
                           tel, link_name, link_mobile, link_relation, work_type, work_name, work_tel,
                           create_type, create_co, bankCode, bankName, bankAcc, lineId, cash,
                           voice_type, voice_txt_mobile, voice_txt_give, voice_subtype, voice_txt_cq, voice_txt_oaddress);

                    if (ReturnMsg.success)
                    {
                        return new
                        {
                            success = false,
                            msg = "很抱歉,申請失敗(因應民法規定須年滿18嵗方可註冊申請此項服務,謝謝)"
                        };
                    }
                    else
                    {
                        return new
                        {
                            success = false,
                            msg = ReturnMsg.msg
                        };
                    }

                }
            }
            catch (Exception)
            {

            }




            //call 財政部api 手機條碼(要申請dudu ip .188)
            try
            {
                if (voice_type == "1" && voice_subtype == "1" && voice_txt_mobile != "" && voice_txt_mobile != null)
                {
                    Layout.ReturnMsg returnMsg = new Common().CheckMobileCode(voice_txt_mobile);
                    if (!returnMsg.success)
                    {
                        return new
                        {
                            success = false,
                            msg = "呼叫財政部API：" + returnMsg.msg
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "註冊填寫基本資料", "呼叫財政部手機條碼驗證", id, id_no, null, null, null);
                return new
                {
                    success = false,
                    msg = ex.Message
                };
            }


            return MemberDA.MemberInfo(id, id_no, name, birthDay, issue_date, issue_site, issue_reason, address, current_address,
                       tel, link_name, link_mobile, link_relation, work_type, work_name, work_tel,
                       create_type, create_co, bankCode, bankName, bankAcc, lineId, cash,
                       voice_type, voice_txt_mobile, voice_txt_give,
                        voice_subtype, voice_txt_cq, voice_txt_oaddress);
        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object MemberInfo_D(string id_no, string name, string birthDay,
                    string issue_date, string issue_site, string issue_reason,
                             string address, string current_address,
                             string tel, string link_name, string link_mobile, string link_relation,
                             string work_type, string work_name, string work_tel,
                             string create_type, string create_co, string bankCode,
                             string bankName, string bankAcc, string lineId, string cash,
                             string voice_type, string voice_txt_mobile, string voice_txt_give,
                             string voice_subtype,
                            //string voice_subtype_2,
                            string voice_txt_cq, string voice_txt_comp, string voice_txt_oaddress)
        {
            var id = GetAuthMember().member_id;


            //檢查是否滿18岁
            if (new Common().GetAgeByBirthdate(DateTime.Parse(birthDay)) < 18)
            {
                //write to db
                Utity u = new Utity();
                Layout.ReturnMsg ReturnMsg = u.MemberInfo_18(id, id_no, name, birthDay, issue_date, issue_site, issue_reason, address, current_address,
                       tel, link_name, link_mobile, link_relation, work_type, work_name, work_tel,
                       create_type, create_co, bankCode, bankName, bankAcc, lineId, cash,
                       voice_type, voice_txt_mobile, voice_txt_give, voice_subtype, voice_txt_cq, voice_txt_oaddress);

                if (ReturnMsg.success)
                {
                    return new
                    {
                        success = false,
                        msg = "很抱歉,申請失敗(因應民法規定須年滿18嵗方可註冊申請此項服務,謝謝)"
                    };
                }
                else
                {
                    return new
                    {
                        success = false,
                        msg = ReturnMsg.msg
                    };
                }

            }


            //call 財政部api 手機條碼(要申請dudu ip .188)
            try
            {
                if (voice_type == "1" && voice_subtype == "1" && voice_txt_mobile != "" && voice_txt_mobile != null)
                {
                    Layout.ReturnMsg returnMsg = new Common().CheckMobileCode(voice_txt_mobile);
                    if (!returnMsg.success)
                    {
                        return new
                        {
                            success = false,
                            msg = "呼叫財政部API：" + returnMsg.msg
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "註冊填寫基本資料", "呼叫財政部手機條碼驗證", id, id_no, null, null, null);
                return new
                {
                    success = false,
                    msg = ex.Message
                };
            }


            return MemberDA.MemberInfo_D(id, id_no, name, birthDay, issue_date, issue_site, issue_reason, address, current_address,
                       tel, link_name, link_mobile, link_relation, work_type, work_name, work_tel,
                       create_type, create_co, bankCode, bankName, bankAcc, lineId, cash,
                       voice_type, voice_txt_mobile, voice_txt_give,
                        voice_subtype, voice_txt_cq, voice_txt_comp, voice_txt_oaddress);
        }



        [DuDuPay.Controllers.JwtAuthActionFilter_General]
        [HttpPost]
        public Object MemberInfoInit()
        {
            var id = GetAuthMember().member_id;

            return MemberDA.MemberInfoInit(id);
        }

        [DuDuPay.Controllers.JwtAuthActionFilter_General]
        [HttpPost]
        public Object MemberInfoInit_GetCpData()
        {
            var id = GetAuthMember().member_id;
            return MemberDA.MemberInfoInit_GetCpData(id);
        }

        [DuDuPay.Controllers.JwtAuthActionFilter_General]
        [HttpPost]
        public Object MemberInfoInit_Add()
        {
            var id = GetAuthMember().member_id;
            return MemberDA.MemberInfoInit_Add(id);
        }

        [HttpPost]
        [JwtAuthActionFilter_General]
        public Layout.ReturnMsg SaveTwcaMessage(string twcaMessage)
        {
            return MemberDA.SaveTwcaMessage(GetAuthMember().member_id, twcaMessage);
        }

        [DuDuPay.Controllers.JwtAuthActionFilter_General]
        [HttpPost]
        public Object SaveTwcaMessageForBobo(string twcaMessage)
        {
            var id = GetAuthMember().member_id;
            return MemberDA.SaveTwcaMessageForBobo(id, twcaMessage);
        }





        //[HttpPost]
        //public Object SaveImage(string base64)
        //{
        //    return MemberDA.SaveImage(base64);
        //}

        //[HttpPost]
        //public Object SaveImage([FromBody]base64Obj obj)
        //{
        //    return MemberDA.SaveImage(obj.sign_base64);
        //}

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object SaveImageMerge([FromBody]base64Obj obj)
        {
            var authMember = GetAuthMember();
            obj.id = authMember.member_id;
            obj.mobile = authMember.mobileno;
            return MemberDA.SaveImage(obj.id, obj.mobile, obj.sign_base64, obj.video_base64);
        }



        //加密
        [HttpPost]
        public Object EncryptByDES(string code)
        {
            string Encryption_Decryption_key = ConfigurationManager.AppSettings["Encryption_Decryption_key"];
            string Encryption_Decryption_vi = ConfigurationManager.AppSettings["Encryption_Decryption_vi"];
            Common common = new Common();
            return common.EncryptByDES(code, Encryption_Decryption_key, Encryption_Decryption_vi);

        }

        //解密
        [HttpPost]
        public Object DecryptByDES(string code)
        {
            try
            {
                string Encryption_Decryption_key = ConfigurationManager.AppSettings["Encryption_Decryption_key"];
                string Encryption_Decryption_vi = ConfigurationManager.AppSettings["Encryption_Decryption_vi"];
                Common common = new Common();
                return common.DecryptByDES(code, Encryption_Decryption_key, Encryption_Decryption_vi);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }


        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object FinishRegister(string time, string longitude, string latitude, string order_type)
        {
            var id = GetAuthMember().member_id;

            Layout.ReturnMsg ReturnMsg = null;
            for (int i = 0; i < 4; i++)
            {
                lock (_thisLock)
                {
                    //(0)get cp_no
                    string _cp_no = new Common().CreateCpNo();
                    //(1)update cp_data
                    ReturnMsg = MemberDA.FinishRegister_0(id, _cp_no, time, order_type);
                }
                if (ReturnMsg.success || (!ReturnMsg.success && ReturnMsg.msg != "Duplicate Key")) break;
            }

            if (!ReturnMsg.success && ReturnMsg.msg == "Duplicate Key")
            {
                return new { success = false, msg = "系統忙碌中,請重新按完成" };
            }

            //(2)update z_Member...
            if (ReturnMsg.success)
            {
                string cp_no = ReturnMsg.value.ToString();
                ReturnMsg = MemberDA.FinishRegister(id, cp_no, time, longitude, latitude, order_type);
                //if error then delete cp_data cp_no
                //if (!ReturnMsg.success) new Utilities().DeleteCpNo(cp_no);

                return ReturnMsg;
            }
            else
            {
                return new { success = false, msg = "註冊失敗,請洽客服" };
            }




        }


        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object FinishEasyRegister(string longitude, string latitude)
        {
            var id = GetAuthMember().member_id;

            Layout.ReturnMsg ReturnMsg = null;
            for (int i = 0; i < 4; i++)
            {
                lock (_thisLock)
                {
                    //(0)get cp_no
                    string _cp_no = new Common().CreateCpNo();
                    //(1)update cp_data
                    ReturnMsg = MemberDA.FinishEasyRegister_0(id, _cp_no);
                }
                if (ReturnMsg.success || (!ReturnMsg.success && ReturnMsg.msg != "Duplicate Key")) break;
            }

            if (!ReturnMsg.success && ReturnMsg.msg == "Duplicate Key")
            {
                return new { success = false, msg = "系統忙碌中,請重新按完成" };
            }

            //(2)update z_Member...
            if (ReturnMsg.success)
            {
                string cp_no = ReturnMsg.value.ToString();
                ReturnMsg = MemberDA.FinishEasyRegister(id, cp_no, longitude, latitude);

                return ReturnMsg;
            }
            else
            {
                return new { success = false, msg = "簡易註冊失敗,請洽客服" };
            }




        }


        //[JwtAuthActionFilter_General]
        //[HttpPost]
        //public Object NonMemberFinishRegister(int id, string longitude, string latitude)
        //{
        //    return MemberDA.NonMemberFinishRegister(id, longitude, latitude);
        //}


        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object ReSetPassword(string pw)
        {
            var authMember = GetAuthMember();
            return MemberDA.ReSetPassword(authMember.member_id, pw, authMember.role);
        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object WriteTwcaMsg()
        {
            return MemberDA.WriteTwcaMsg(GetAuthMember().member_id);
        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object WriteTwcaMsg_bobo()
        {
            return MemberDA.WriteTwcaMsg_bobo(GetAuthMember().member_id);
        }





        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object CheckIdNo(string id_no, string msg_txt)
        {
            return MemberDA.CheckIdNo(GetAuthMember().member_id, id_no, msg_txt);
        }


        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object WriteTwcaTable()
        {
            return MemberDA.WriteTwcaTable(GetAuthMember().member_id);
        }


        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object CheckRegisterOrder()
        {
            return MemberDA.CheckRegisterOrder(GetAuthMember().member_id);
        }



        [HttpPost]
        public Object GetPuchCodeDecoding(string data, int type, string store_id)
        {
            return new Common().GetPuchCodeDecoding(data, type, store_id);
        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object FinishRegister_bobo(string longitude, string latitude, string order_type)
        {
            return MemberDA.FinishRegister_bobo(GetAuthMember().member_id, longitude, latitude, order_type);
        }


        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object SaveMemberInfoEasy(string name, string idno, string birth, string addr,
            string current_address,
                     string voice_type,
                 string voice_txt_mobile,
                string voice_txt_give,
                string voice_subtype,
                string voice_txt_cq,
                 string voice_txt_oaddress)
        {
            var member_id = GetAuthMember().member_id;
            //call 財政部api 手機條碼(要申請dudu ip .188)
            try
            {
                if (voice_type == "1" && voice_subtype == "1" && voice_txt_mobile != "" && voice_txt_mobile != null)
                {
                    Layout.ReturnMsg returnMsg = new Common().CheckMobileCode(voice_txt_mobile);
                    if (!returnMsg.success)
                    {
                        return new
                        {
                            success = false,
                            msg = "呼叫財政部API：" + returnMsg.msg
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "簡易註冊填寫基本資料", "呼叫財政部手機條碼驗證", member_id, idno, null, null, null);
                return new
                {
                    success = false,
                    msg = ex.Message
                };
            }

            return MemberDA.SaveMemberInfoEasy(member_id, name, idno, birth, addr, current_address,
                      voice_type,
                  voice_txt_mobile,
                 voice_txt_give,
                 voice_subtype,
                 voice_txt_cq,
                  voice_txt_oaddress);
        }

        [JwtAuthActionFilter_General]
        [HttpPost]
        public Object GetEasyMemberInfo()
        {
            return MemberDA.GetEasyMemberInfo(GetAuthMember().member_id);
        }


    }





    public class base64Obj
    {
        public int id { set; get; }
        public string insured_cp_no { set; get; }
        public string mobile { set; get; }
        public string sign_base64 { set; get; }
        public string video_base64 { set; get; }

    }

}
