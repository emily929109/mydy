using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Web;
using Microsoft.VisualBasic.FileIO;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Threading;
using System.Text;

namespace DuDuPay.Models
{


    public class MemberDA
    {



        public Object ReSetPassword(int id, string pw, string role)
        {

            using (var db = new kcsddb2Entities_new())
            {
                var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                if (m != null)
                {
                    m.pw = pw;// = role == "member" ? EncryptByDES(pw) : pw;
                    db.z_Member.Attach(m);
                    db.Entry(m).State = EntityState.Modified;
                    db.SaveChanges();
                    return new Layout.ReturnMsg()
                    {
                        success = true,
                        value = "OK"
                    };
                }
                else
                {
                    new Common().WriteErrorLog(0, "重設密碼", "無此會員:" + id, null, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = "無此會員！"
                    };
                }

            };
        }



        /// <summary>
        /// 傳送手機驗證碼
        /// </summary>
        /// <param name="mobile"></param>
        /// <returns></returns>
        public Object SendMobileCode(string mobile)
        {
            Common c = new Common();
            int otp_code = c.GetRandomMumber();//get random code           
            return c.SendMobileWithChinese("1022", mobile, otp_code.ToString());

            //CallApi.MobileApi mobileApi = new CallApi.MobileApi();
            ////string one_time_code = ConfigurationManager.AppSettings["one_time_code"];
            ////string body = string.Format("【DUDUPAY】您的驗證碼為：{0}，請於本公司系統驗證，將於5分鐘內失效，請於時間內輸入以完成認證，謝謝！ {1} #{0}", otp_code, one_time_code);
            //string body = string.Format("【DUDUPAY】您的驗證碼為：{0}，請於本公司系統驗證，將於5分鐘內失效，請於時間內輸入以完成認證，謝謝！", otp_code);


            //var result = mobileApi.SendSignMobile(mobile, body, "C");
            //if (result.success)
            //{
            //    return new Layout.ReturnMsg()
            //    {
            //        success = true,
            //        value = otp_code
            //    };
            //}
            //else
            //{
            //    new Common().WriteErrorLog(1, "傳送簡訊碼", mobile + result.msg, null, null, null, null, null);
            //    return new Layout.ReturnMsg()
            //    {
            //        success = false,
            //        msg = result.msg
            //    };
            //}
        }



        //填寫基本資料
        public Object MemberInfo(int id, string id_no, string name, string birthDay,
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

            try
            {

                using (var db = new kcsddb2Entities_new())
                {
                    //(1)check 此身份證是否曾註冊過(跟會員編號有關)
                    //bool has_idno = db.z_Member.Any(x => x.id != id && x.id_no == id_no);
                    //if (has_idno)
                    //{
                    //    new Common().WriteErrorLog(1, "填寫基本資料", "此身分證字號曾經註冊過,z_Member,請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", id, id_no, null, null, null);
                    //    return new Layout.ReturnMsg()
                    //    {
                    //        success = false,
                    //        msg = "此身分證字號曾經註冊過" + id_no
                    //    };
                    //}

                    ////(1.1)
                    //has_idno = db.kc_memberdata.Any(x => x.kc_id_no == id_no);
                    //if (has_idno)
                    //{
                    //    new Common().WriteErrorLog(1, "未滿18填寫基本資料", "此身分證字號曾經註冊過,kc_memberdata，請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", id, id_no, null, null, null);
                    //    return new Layout.ReturnMsg()
                    //    {
                    //        success = false,
                    //        msg = "此身分證字號曾經註冊過" + id_no
                    //    };
                    //}

                    //write z_Member table
                    var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (m != null)
                    {
                        try
                        {
                            //分解字串
                            int i1 = issue_date.IndexOf("-");
                            int i2 = issue_date.LastIndexOf("-");
                            string yy = ""; string mm = ""; string dd = "";
                            if (i1 != -1 && i2 != -1)
                            {
                                yy = issue_date.Substring(0, i1);//年
                                mm = issue_date.Substring(i1 + 1, i2 - i1 - 1);//月
                                dd = issue_date.Substring(i2 + 1);//日  
                            }

                            m.issue_date = issue_date;
                            m.issue_site = issue_site == "" || issue_site == null ? "" : issue_site;
                            m.issue_reason = issue_reason == "" || issue_reason == null ? "" : issue_reason;
                            m.apply_date = string.Format("民國{0}年{1}月{2}日({3}){4}", yy, mm, dd, m.issue_site, m.issue_reason);

                        }
                        catch (Exception)
                        {
                            m.issue_date = "";
                            m.issue_site = issue_site == "" || issue_site == null ? "" : issue_site;
                            m.issue_reason = issue_reason == "" || issue_reason == null ? "" : issue_reason;
                            m.apply_date = "";
                        }



                        m.id_no = id_no.ToUpper();
                        m.name = name == "" || name == null ? "" : name;

                        try
                        {
                            m.birthday = birthDay;
                            m.birthday_dt = DateTime.Parse(birthDay);
                        }
                        catch (Exception)
                        {

                        }

                        //m.issue_date = issue_date;
                        //m.issue_site = issue_site == "" || issue_site == null ? "" : issue_site;
                        //m.issue_reason = issue_reason == "" || issue_reason == null ? "" : issue_reason;
                        //m.apply_date = string.Format("民國{0}年{1}月{2}日({3}){4}", yy, mm, dd, m.issue_site, m.issue_reason);
                        m.address = address == "" || address == null ? "" : address;
                        m.curr_address = current_address;
                        m.curr_tel = tel;
                        m.contact_person_name = link_name;
                        m.contact_person_tel = link_mobile;
                        m.contact_person_relation = link_relation;
                        m.employment_state = work_type;
                        m.company_name = work_name;
                        m.company_tel = work_tel;
                        m.credit_state = create_type;
                        m.credit_bank = create_co;
                        m.refund_bank_no = bankCode;
                        m.refund_bank_name = bankName;
                        m.refund_bank_acc = bankAcc;
                        m.line_id = lineId;
                        m.credit_amount = cash;
                        m.kc_member_no = new Common().getMemberNo(id_no.ToUpper());//ean
                        m.register_step = 2;
                        m.voice_type = voice_type;
                        m.voice_txt_mobile = voice_txt_mobile;
                        m.voice_txt_give = voice_txt_give;

                        m.voice_subtype = voice_subtype;
                        //m.voice_subtype_2 = voice_subtype_2;
                        m.voice_txt_cq = voice_txt_cq;
                        m.voice_txt_comp = "";
                        m.voice_txt_oaddress = voice_txt_oaddress;


                        db.z_Member.Attach(m);
                        db.Entry(m).State = EntityState.Modified;
                        db.SaveChanges();
                    }

                    return new Layout.ReturnMsg() { success = true };
                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "填寫基本資料 系統錯誤", ex.Message, id, id_no, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };
            }

        }
        //check value 非展場
        public Object MemberInfo2(int id, string id_no, string name, string birthDay,
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

            try
            {

                using (var db = new kcsddb2Entities_new())
                {
                    //(1)check 此身份證是否曾註冊過(跟會員編號有關)
                    //bool has_idno = db.z_Member.Any(x => x.id != id && x.id_no == id_no);
                    //if (has_idno)
                    //{
                    //    new Common().WriteErrorLog(1, "填寫基本資料", "此身分證字號曾經註冊過,z_Member,請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", id, id_no, null, null, null);
                    //    return new Layout.ReturnMsg()
                    //    {
                    //        success = false,
                    //        msg = "此身分證字號曾經註冊過" + id_no
                    //    };
                    //}

                    ////(1.1)
                    //has_idno = db.kc_memberdata.Any(x => x.kc_id_no == id_no);
                    //if (has_idno)
                    //{
                    //    new Common().WriteErrorLog(1, "未滿18填寫基本資料", "此身分證字號曾經註冊過,kc_memberdata，請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", id, id_no, null, null, null);
                    //    return new Layout.ReturnMsg()
                    //    {
                    //        success = false,
                    //        msg = "此身分證字號曾經註冊過" + id_no
                    //    };
                    //}

                    //write z_Member table
                    var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (m != null)
                    {


                        //分解字串
                        int i1 = issue_date.IndexOf("-");
                        int i2 = issue_date.LastIndexOf("-");
                        string yy = ""; string mm = ""; string dd = "";
                        if (i1 != -1 && i2 != -1)
                        {
                            yy = issue_date.Substring(0, i1);//年
                            mm = issue_date.Substring(i1 + 1, i2 - i1 - 1);//月
                            dd = issue_date.Substring(i2 + 1);//日  
                        }


                        m.id_no = id_no.ToUpper();
                        m.name = name;
                        m.birthday = birthDay;
                        m.birthday_dt = DateTime.Parse(birthDay);
                        m.issue_date = issue_date;
                        m.issue_site = issue_site;
                        m.issue_reason = issue_reason;
                        m.apply_date = string.Format("民國{0}年{1}月{2}日({3}){4}", yy, mm, dd, m.issue_site, m.issue_reason);
                        m.address = address;
                        m.curr_address = current_address;
                        m.curr_tel = tel;
                        m.contact_person_name = link_name;
                        m.contact_person_tel = link_mobile;
                        m.contact_person_relation = link_relation;
                        m.employment_state = work_type;
                        m.company_name = work_name;
                        m.company_tel = work_tel;
                        m.credit_state = create_type;
                        m.credit_bank = create_co;
                        m.refund_bank_no = bankCode;
                        m.refund_bank_name = bankName;
                        m.refund_bank_acc = bankAcc;
                        m.line_id = lineId;
                        m.credit_amount = cash;
                        m.kc_member_no = new Common().getMemberNo(id_no.ToUpper());//ean
                        m.register_step = 2;
                        m.voice_type = voice_type;
                        m.voice_txt_mobile = voice_txt_mobile;
                        m.voice_txt_give = voice_txt_give;

                        m.voice_subtype = voice_subtype;
                        //m.voice_subtype_2 = voice_subtype_2;
                        m.voice_txt_cq = voice_txt_cq;
                        m.voice_txt_comp = voice_txt_comp;
                        m.voice_txt_oaddress = voice_txt_oaddress;


                        db.z_Member.Attach(m);
                        db.Entry(m).State = EntityState.Modified;
                        db.SaveChanges();
                    }

                    return new Layout.ReturnMsg() { success = true };
                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "填寫基本資料 系統錯誤", ex.Message, id, id_no, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };
            }

        }

        //超額 填寫基本資料
        public Object MemberInfo_D(int id, string id_no, string name, string birthDay,
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

            try
            {

                using (var db = new kcsddb2Entities_new())
                {

                    //write z_Member table
                    var m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (m != null)
                    {

                        //分解字串
                        int i1 = issue_date.IndexOf("-");
                        int i2 = issue_date.LastIndexOf("-");
                        string yy = ""; string mm = ""; string dd = "";
                        if (i1 != -1 && i2 != -1)
                        {
                            yy = issue_date.Substring(0, i1);//年
                            mm = issue_date.Substring(i1 + 1, i2 - i1 - 1);//月
                            dd = issue_date.Substring(i2 + 1);//日  
                        }
                        //超額不更新 以下二個欄位
                        //m.id_no = id_no.ToUpper();
                        //m.kc_member_no = new Common().getMemberNo(id_no.ToUpper());//ean
                        m.name = name;
                        m.birthday = birthDay;
                        m.birthday_dt = DateTime.Parse(birthDay);
                        m.issue_date = issue_date;
                        m.issue_site = issue_site;
                        m.issue_reason = issue_reason;
                        m.apply_date = string.Format("民國{0}年{1}月{2}日({3}){4}", yy, mm, dd, m.issue_site, m.issue_reason);
                        m.address = address;
                        m.curr_address = current_address;
                        m.curr_tel = tel;
                        m.contact_person_name = link_name;
                        m.contact_person_tel = link_mobile;
                        m.contact_person_relation = link_relation;
                        m.employment_state = work_type;
                        m.company_name = work_name;
                        m.company_tel = work_tel;
                        m.credit_state = create_type;
                        m.credit_bank = create_co;
                        m.refund_bank_no = bankCode;
                        m.refund_bank_name = bankName;
                        m.refund_bank_acc = bankAcc;
                        m.line_id = lineId;
                        m.credit_amount = cash;

                        m.register_step = 2;
                        m.voice_type = voice_type;
                        m.voice_txt_mobile = voice_txt_mobile;
                        m.voice_txt_give = voice_txt_give;

                        m.voice_subtype = voice_subtype;
                        //m.voice_subtype_2 = voice_subtype_2;
                        m.voice_txt_cq = voice_txt_cq;
                        m.voice_txt_comp = voice_txt_comp;
                        m.voice_txt_oaddress = voice_txt_oaddress;


                        db.z_Member.Attach(m);
                        db.Entry(m).State = EntityState.Modified;
                        db.SaveChanges();
                    }

                    return new Layout.ReturnMsg() { success = true };
                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "填寫基本資料 系統錯誤", ex.Message, id, id_no, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = ex.Message
                };
            }

        }

        //基本資料頁 page load 自動帶出一些值
        public Object MemberInfoInit(int id)
        {

            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                if (member != null)
                {

                    var a = new Layout.ReturnMsg()
                    {
                        success = true,
                        value = new
                        {
                            id_no = member.id_no == null || member.id_no == "" ? "" : member.id_no,
                            name = member.name == null ? "" : member.name,
                            member.mobile,
                            member.mail,
                            birthday = member.birthday == null ? "" : member.birthday,
                            member.issue_date,
                            member.issue_site,
                            member.issue_reason,
                            address = member.address == null ? "" : member.address,
                            curr_address = member.curr_address == null ? "" : member.curr_address,
                            curr_tel = member.curr_tel == null ? "" : member.curr_tel,
                            contact_person_name = member.contact_person_name == null ? "" : member.contact_person_name,
                            contact_person_tel = member.contact_person_tel == null ? "" : member.contact_person_tel,
                            contact_person_relation = member.contact_person_relation == null ? "" : member.contact_person_relation,
                            employment_state = member.employment_state == null ? "" : member.employment_state,
                            company_name = member.company_name == null ? "" : member.company_name,
                            company_tel = member.company_tel == null ? "" : member.company_tel,
                            credit_state = member.credit_state == null ? "" : member.credit_state,
                            credit_bank = member.credit_bank == null ? "" : member.credit_bank,
                            refund_bank_no = member.refund_bank_no == null ? "" : member.refund_bank_no,
                            refund_bank_name = member.refund_bank_name == null ? "" : member.refund_bank_name,
                            refund_bank_acc = member.refund_bank_acc == null ? "" : member.refund_bank_acc,
                            line_id = member.line_id == null ? "" : member.line_id,
                            credit_amount = member.credit_amount == null ? "" : member.credit_amount,
                            member.voice_type,
                            voice_txt_mobile = member.voice_txt_mobile == null ? "" : member.voice_txt_mobile,
                            voice_txt_give = member.voice_txt_give == null ? "" : member.voice_txt_give,

                            voice_subtype = member.voice_subtype,
                            voice_subtype_2 = member.voice_subtype_2,
                            voice_txt_cq = member.voice_txt_cq == null ? "" : member.voice_txt_cq,
                            voice_txt_comp = member.voice_txt_comp == null ? "" : member.voice_txt_comp,
                            voice_txt_oaddress = member.voice_txt_oaddress == null ? "" : member.voice_txt_oaddress,




                        }
                    };

                    return a;
                }

            };

            new Common().WriteErrorLog(0, "基本資料頁 PageLoad", "會員序號不存在", id, null, null, null, null);

            return new Layout.ReturnMsg()
            {
                success = false,
                msg = "會員序號不存在"
            };

        }


        #region 補件 基本資料
        public Object MemberInfoInit_Add(int id)
        {

            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                if (member != null)
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.register_cp_no).FirstOrDefault();
                    if (cpdata == null) new Layout.ReturnMsg() { success = false, msg = "cpdata cp_no不存在" + member.register_cp_no };


                    return new Layout.ReturnMsg()
                    {
                        success = true,
                        value = new
                        {

                            id_no = cpdata.kc_id_no,
                            name = cpdata.kc_cust_name,
                            mobile = cpdata.kc_mobil_no,
                            mail = cpdata.kc_email_no,
                            address = cpdata.kc_perm_addr == null ? "" : cpdata.kc_perm_addr,
                            curr_address = cpdata.kc_curr_addr,
                            curr_tel = cpdata.kc_curr_phone == null ? "" : cpdata.kc_curr_phone,
                            contact_person_name = cpdata.kc_cust_name3u,
                            contact_person_tel = cpdata.kc_mobil_no3,
                            contact_person_relation = cpdata.kc_relation_no3,
                            employment_state = cpdata.kc_work_state == null ? "" : cpdata.kc_work_state,
                            company_name = cpdata.kc_comp_desc == null ? "" : cpdata.kc_comp_desc,
                            company_tel = cpdata.kc_comp_phone == null ? "" : cpdata.kc_comp_phone,
                            credit_state = cpdata.kc_credit_state == null ? "" : cpdata.kc_credit_state,
                            credit_bank = cpdata.kc_credit_bank == null ? "" : cpdata.kc_credit_bank,
                            refund_bank_no = cpdata.kc_refund_bank_no == null ? "" : cpdata.kc_refund_bank_no,
                            refund_bank_name = cpdata.kc_refund_bank_name == null ? "" : cpdata.kc_refund_bank_name,
                            refund_bank_acc = cpdata.kc_refund_bank_acc == null ? "" : cpdata.kc_refund_bank_acc,
                            line_id = cpdata.kc_line_no == null ? "" : cpdata.kc_line_no,
                            credit_amount = cpdata.kc_credit_amount == null ? "" : cpdata.kc_credit_amount,
                            birthday = cpdata.kc_birth_date.HasValue ? cpdata.kc_birth_date.Value.ToString("yyyy/MM/dd") : "",

                            member.voice_type,
                            voice_txt_mobile = member.voice_txt_mobile == null ? "" : member.voice_txt_mobile,
                            voice_txt_give = member.voice_txt_give == null ? "" : member.voice_txt_give,

                            member.voice_subtype,
                            member.voice_subtype_2,
                            voice_txt_cq = member.voice_txt_cq == null ? "" : member.voice_txt_cq,
                            voice_txt_comp = member.voice_txt_comp == null ? "" : member.voice_txt_comp,
                            voice_txt_oaddress = member.voice_txt_oaddress == null ? "" : member.voice_txt_oaddress,


                            //                                                        
                            issue_date = cpdata.kc_issue_date,
                            //issue_site = member.issue_site,
                            //issue_reason = member.issue_reason,
                            //tmp_cpdata = cpdata,
                            //tmp_member = member


                        }
                    };
                }

            };

            new Common().WriteErrorLog(0, "基本資料頁 PageLoad", "會員序號不存在", id, null, null, null, null);

            return new Layout.ReturnMsg()
            {
                success = false,
                msg = "會員序號不存在"
            };

        }
        #endregion


        //徵審後要修改資料帶出
        public Object MemberInfoInit_GetCpData(int id)
        {

            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                if (member != null)
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.register_cp_no).FirstOrDefault();
                    if (cpdata == null) new Layout.ReturnMsg() { success = false, msg = "cpdata cp_no不存在" + member.register_cp_no };


                    var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member.kc_member_no).FirstOrDefault();
                    string voice_type = ""; string voice_txt_mobile = ""; string voice_txt_give = "";
                    string voice_subtype = ""; string voice_subtype_2 = ""; string voice_txt_cq = "";
                    string voice_txt_comp = ""; string voice_txt_oaddress = "";


                    if (memberdata != null)
                    {
                        voice_type = new Common().SetCarrierType(memberdata.CarrierType);//會員載具                     
                        voice_subtype = new Common().SetCarrierSubType(memberdata.CarrierType);//二聯電子發票  子項
                        voice_subtype_2 = new Common().SetCarrierSubType_2(memberdata.CarrierType, memberdata.CarrierId1);//紙本發票 子項                                             

                        voice_txt_mobile = memberdata.CarrierType == "3J0002" ? memberdata.CarrierId1 : "";
                        voice_txt_give = memberdata.CarrierType == "giveID" ? memberdata.CarrierId1 : "";
                        voice_txt_cq = memberdata.CarrierType == "CQ0001" ? memberdata.CarrierId1 : "";
                        voice_txt_comp = memberdata.CarrierType == "compID" ? memberdata.CarrierId1 : "";
                        voice_txt_oaddress = memberdata.CarrierType == "paper" && memberdata.CarrierId1 == "contact" ? memberdata.kc_contact_memo : "";

                    }

                    return new Layout.ReturnMsg()
                    {
                        success = true,
                        value = new
                        {

                            id_no = cpdata.kc_id_no,
                            name = cpdata.kc_cust_name,
                            mobile = cpdata.kc_mobil_no,
                            mail = cpdata.kc_email_no,
                            address = cpdata.kc_perm_addr == null ? "" : cpdata.kc_perm_addr,
                            curr_address = cpdata.kc_curr_addr,
                            curr_tel = cpdata.kc_curr_phone == null ? "" : cpdata.kc_curr_phone,
                            contact_person_name = cpdata.kc_cust_name3u,
                            contact_person_tel = cpdata.kc_mobil_no3,
                            contact_person_relation = cpdata.kc_relation_no3,
                            employment_state = cpdata.kc_work_state == null ? "" : cpdata.kc_work_state,
                            company_name = cpdata.kc_comp_desc == null ? "" : cpdata.kc_comp_desc,
                            company_tel = cpdata.kc_comp_phone == null ? "" : cpdata.kc_comp_phone,
                            credit_state = cpdata.kc_credit_state == null ? "" : cpdata.kc_credit_state,
                            credit_bank = cpdata.kc_credit_bank == null ? "" : cpdata.kc_credit_bank,
                            refund_bank_no = cpdata.kc_refund_bank_no == null ? "" : cpdata.kc_refund_bank_no,
                            refund_bank_name = cpdata.kc_refund_bank_name == null ? "" : cpdata.kc_refund_bank_name,
                            refund_bank_acc = cpdata.kc_refund_bank_acc == null ? "" : cpdata.kc_refund_bank_acc,
                            line_id = cpdata.kc_line_no == null ? "" : cpdata.kc_line_no,
                            credit_amount = cpdata.kc_credit_amount == null ? "" : cpdata.kc_credit_amount,
                            birthday = cpdata.kc_birth_date.HasValue ? cpdata.kc_birth_date.Value.ToString("yyyy/MM/dd") : "",

                            voice_type = voice_type,
                            voice_txt_mobile = voice_txt_mobile,
                            voice_txt_give = voice_txt_give,

                            voice_subtype = voice_subtype,
                            voice_subtype_2 = voice_subtype_2,
                            voice_txt_cq = voice_txt_cq,
                            voice_txt_comp = voice_txt_comp,
                            voice_txt_oaddress = voice_txt_oaddress,

                            //                                                        
                            issue_date = cpdata.kc_issue_date,
                            //issue_site = member.issue_site,
                            //issue_reason = member.issue_reason,
                            tmp_cpdata = cpdata,
                            tmp_member = member


                        }
                    };
                }

            };

            new Common().WriteErrorLog(0, "基本資料頁 PageLoad", "會員序號不存在", id, null, null, null, null);

            return new Layout.ReturnMsg()
            {
                success = false,
                msg = "會員序號不存在"
            };

        }

        //存TWCA 結果 走M1
        public Layout.ReturnMsg SaveTwcaMessage(int id, string twcaMessage)
        {
            string msg = string.Empty;
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (member != null)
                    {
                        //msg = twcaMessage.Replace("&quot;", "\"").Replace("& quot;", "\"");
                        //var json = JObject.Parse(msg);
                        var json = JObject.Parse(twcaMessage);

                        member.twca_msg = twcaMessage;
                        member.twca_return_desc = (string)json["ReturnCodeDesc"];

                        db.z_Member.Attach(member);
                        db.Entry(member).State = EntityState.Modified;
                        db.SaveChanges();

                        //update 
                        var m1 = db.z_VerifyM1.Where(x => x.mobilno == member.mobile).ToList();
                        if (m1.Count > 0)
                        {
                            m1.ForEach(item =>
                            {
                                item.twca_return_desc = (string)json["ReturnCodeDesc"];
                                item.add_time = DateTime.Now;
                            });

                            db.SaveChanges();
                        }


                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "存 TWCA Message to z_Member", id + "會員序號不存在", null, null, null, null, null);
                        return new Layout.ReturnMsg() { success = false, msg = "會員序號不存在" + id };
                    }
                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "存 TWCA Message to z_Member", "系統錯誤：" + msg + ex.Message, id, null, null, null, null);
                return new Layout.ReturnMsg() { success = false, msg = ex.Message + id };
            }

            return new Layout.ReturnMsg() { success = true };
        }

        public Object SaveTwcaMessageForBobo(int id, string twcaMessage)
        {
            string msg = string.Empty;
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (member != null)
                    {
                        //msg = twcaMessage.Replace("&quot;", "\"").Replace("& quot;", "\"");
                        //var json = JObject.Parse(msg);
                        var json = JObject.Parse(twcaMessage);

                        member.twca_msg = twcaMessage;
                        member.tmp_twca_return_desc = (string)json["ReturnCodeDesc"];

                        db.z_Member.Attach(member);
                        db.Entry(member).State = EntityState.Modified;
                        db.SaveChanges();

                        //update 
                        var m1 = db.z_VerifyM1.Where(x => x.mobilno == member.mobile).ToList();
                        if (m1.Count > 0)
                        {
                            m1.ForEach(item =>
                            {
                                item.twca_return_desc = (string)json["ReturnCodeDesc"];
                                item.add_time = DateTime.Now;
                            });

                            db.SaveChanges();
                        }


                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "存 TWCA Message to z_Member", id + "會員序號不存在", null, null, null, null, null);
                        return new { success = false, msg = "會員序號不存在" + id };
                    }
                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "存 TWCA Message to z_Member", "系統錯誤：" + msg + ex.Message, id, null, null, null, null);
                return new { success = false, msg = ex.Message + id };
            }

            return new { success = true };
        }


        //存TWCA 結果 直接選擇手機非本人        
        public Object WriteTwcaMsg(int id)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (member != null)
                    {
                        member.twca_return_desc = "手機非本人或易付卡";
                        member.twca_msg = "";
                        db.z_Member.Attach(member);
                        db.Entry(member).State = EntityState.Modified;
                        db.SaveChanges();

                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "註冊(存TWCA)", "選擇 手機非本人或易付卡,但會員序號不存在" + id, null, null, null, null, null);
                    }

                };

            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "註冊(存TWCA)", "系統錯誤 ,選擇 手機非本人或易付卡,但會員序號不存在" + id + ex.Message, null, null, null, null, null);
            }
            return "OK";
        }


        //存TWCA 結果 直接選擇手機非本人
        public Object WriteTwcaMsg_bobo(int id)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                    if (member != null)
                    {
                        member.tmp_twca_return_desc = "手機非本人或易付卡";
                        db.z_Member.Attach(member);
                        db.Entry(member).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "會員中心手機驗證(存TWCA)", "系統錯誤 ,選擇 手機非本人或易付卡,但會員序號不存在" + id, null, null, null, null, null);
                    }

                };
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, "會員中心手機驗證(存TWCA)", "選擇 手機非本人或易付卡,但會員序號不存在" + id + ex.Message, null, null, null, null, null);
            }


            return "OK";
        }

        /// <summary>
        ///  Video 跟 PDF 合併
        /// </summary>
        /// <param name="base64_1"></param>
        /// <param name="base64_2"></param>
        /// <returns></returns>
        public Object SaveImage(int id, string mobile, string sign_base64, string video_base64)
        {

            PDF.PDFSignCert pDFSignCert = new PDF.PDFSignCert();

            var result = pDFSignCert.SignImageMerage(id, mobile, sign_base64, video_base64);
            if (result.success)
            {
                return new Layout.ReturnMsg()
                {
                    success = true
                };
            }
            else
            {
                new Common().WriteErrorLog(1, "註冊簽署PDF失敗", result.msg, id, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = result.msg
                };
            }



        }



        #region 完成註冊 成功 update cp_data
        public Layout.ReturnMsg FinishRegister_0(int id, string _cp_no, string time, string order_type)
        {
            string _order_type = ""; string _kc_membertarget_type = "";
            switch (order_type)
            {
                case "註冊帶訂單":
                    _order_type = "E購買註冊";
                    _kc_membertarget_type = "E";
                    break;
                case "綜合":
                    _order_type = "DUDU會員註冊";
                    _kc_membertarget_type = "A";
                    break;
                case "超額":
                    _order_type = "D超額申請";
                    _kc_membertarget_type = "D";
                    break;
                default:
                    break;
            }

            //eantodo debug tmp紀錄是用什麼 綜合/超額 來註冊的
            new Common().WriteErrorLog(0, "註冊(完成)", "debug 紀錄是用什麼 綜合/超額 來註冊的:" + order_type, id, null, _cp_no, null, null);


            z_Member m; string cp_no = "";
            using (var db = new kcsddb2Entities_new())
            {
                m = db.z_Member.Where(x => x.id == id).FirstOrDefault();

                if (m == null)
                {
                    new Common().WriteErrorLog(0, "註冊(完成)", "會員序號不存在", id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "會員序號不存在", };
                }

                if (m.id_no == "" || m.id_no == null) return new Layout.ReturnMsg() { success = false, msg = "身分證號空白", };


                try
                {
                    if (order_type.Trim() == "超額") //超額 用新cp
                    {
                        cp_no = _cp_no;
                    }
                    else
                    {
                        var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == m.register_cp_no).FirstOrDefault();
                        if (cpdata == null)
                        {
                            if (m.register_cp_no == null || m.register_cp_no == string.Empty)
                                cp_no = _cp_no;
                            else
                                cp_no = m.register_cp_no;
                        }
                        else
                        {
                            //退件/取消 用新cp 
                            if (cpdata.kc_apply_stat == "N" || cpdata.kc_apply_stat == "R" )
                            {
                                cp_no = _cp_no;
                            }
                            else
                            {
                                if (m.register_cp_no == null || m.register_cp_no == string.Empty)
                                    cp_no = _cp_no;
                                else
                                    cp_no = m.register_cp_no;
                            }
                        }
                    }

                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "cp_data 欄位有錯 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = "cp_data 欄位有錯" + ex.Message
                    };
                }

                //write cp_data table                       
                var kc_cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();
                //避免資料競爭修改其他CP
                if (kc_cpdata != null && kc_cpdata.kc_id_no != m.id_no)
                {
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = "Duplicate Key"
                    };
                }
                //DateTime? isNull = null;
                DateTime? _kc_birth_date = null;
                try
                {
                    _kc_birth_date = DateTime.Parse(m.birthday);
                }
                catch (Exception) { }

                if (kc_cpdata == null)
                {

                    try
                    {
                        //內部人名單
                        string _kc_further_flag3 = "Y";
                        string run_type = ConfigurationManager.AppSettings["run_type"];
                        if (run_type == "正式")
                        {
                            string _id_no = m.id_no;
                            var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                            if (dudumember != null) _kc_further_flag3 = "N";
                        }
                        //---------------------------------------------------------------

                        db.kc_cpdata.Add(new kc_cpdata()
                        {
                            //不可 null
                            kc_cust_name = m.name,
                            kc_proc_fee = 0,
                            kc_collarcar_fee = 0,
                            kc_area_code = m.area_code,
                            kc_comp_code = m.kc_comp_code,// m.kc_introduce_code "VA00",//店家 放店家代號 ;其他VA00
                            kc_twca_flag = order_type == "超額" ? null : "Y",
                            kc_ccis_flag = order_type == "超額" ? null : "Y",
                            kc_source_type = "03",
                            kc_prod_type = "14",
                            kc_issu_code = "01",
                            kc_branch_code = "03",
                            kc_emp_code = "0001",
                            kc_sales_code = m.kc_sales_code,//推薦碼店家 找業務 非店家0001
                            kc_workover_flag = "N",
                            kc_cfm_stat = "N",
                            kc_further_flag3 = _kc_further_flag3,
                            kc_Rchk_flag = "Y",
                            kc_citizenship_type = "TW",
                            kc_crdt_user = "super",
                            kc_crdt_date = DateTime.Now,
                            kc_brand_code = "03",
                            kc_member_no = m.id_no == "" || m.id_no == null ? "" : new Common().getMemberNo(m.id_no.ToUpper()),
                            kc_membertarget_type = _kc_membertarget_type,
                            //二連電子發票 + 東元會員載具
                            PrintMark = m.voice_type == "1" && m.voice_subtype == "2" ? "Y" : "N",
                            kc_invoice_address = m.voice_type == "1" && m.voice_subtype == "2" ? m.voice_txt_oaddress : null,//地址 
                            CarrierType = new Common().GetCarrierType(m.voice_type, m.voice_subtype),//會員載具
                            CarrierId1 = new Common().GetCarrierId1(m.voice_type, m.voice_subtype,
                                 m.voice_txt_mobile, m.voice_txt_give, m.voice_txt_cq, new Common().getMemberNo(m.id_no.ToUpper())),//載具號碼                               

                            kc_further_date3 = new Common().ComptoTime(time),//可連絡時間
                            kc_cp_no = cp_no,
                            kc_mobil_no = m.mobile,
                            kc_email_no = m.mail,
                            kc_id_no = m.id_no,
                            kc_cust_nameu = m.name,


                            //kc_birth_date = DateTime.Parse(m.birthday),
                            kc_birth_date = _kc_birth_date,
                            kc_perm_addr = m.address,
                            kc_curr_addr = m.curr_address,
                            kc_curr_phone = m.curr_tel,
                            kc_cust_name3u = m.contact_person_name,
                            kc_mobil_no3 = m.contact_person_tel,
                            kc_relation_no3 = m.contact_person_relation,
                            kc_work_state = m.employment_state,//add 工作狀態
                            kc_comp_desc = m.company_name,
                            kc_comp_phone = m.company_tel,
                            kc_credit_state = m.credit_state,//add 有無信用卡
                            kc_credit_bank = m.credit_bank,//add 發卡銀行
                            kc_refund_bank_no = m.refund_bank_no,//add
                            kc_refund_bank_name = m.refund_bank_name,//add
                            kc_refund_bank_acc = m.refund_bank_acc,//add
                            kc_line_no = m.line_id,
                            kc_credit_amount = m.credit_amount,//add 希望額度
                            kc_cp_date = DateTime.Today,
                            kc_issue_date = m.apply_date,//發證日
                            kc_papa_nameu = m.papa_nameu,
                            kc_mama_nameu = m.mama_nameu,
                            kc_mate_nameu = m.mate_nameu,
                            //kc_member_no = m.kc_member_no,
                            kc_introduce_code = m.kc_introduce_code,
                            kc_updt_date = DateTime.Now,
                            kc_bankbook_name = m.refund_bank_name,
                            //kc_bankbook_account = m.refund_bank_no + "-" + m.refund_bank_acc,
                            kc_bankbook_account = m.refund_bank_acc,
                            kc_dealer_data = $"項目:{_order_type},希望的額度:{m.credit_amount}\n會員編號:{m.kc_member_no}",



                        });
                        db.SaveChanges();
                    }
                    catch (System.Data.DataException ex)
                    {
                        new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "CP Duplicate Key 系統錯誤：" + ex.Message + cp_no, id, null, null, null, null);
                        // new Common().WriteErrorLog(1, "註冊(合約簽署完成)",$"{m.name}|{m.area_code}|{m.kc_comp_code}|{m.kc_sales_code}|{m.id_no}|{_kc_membertarget_type}" +
                        //     $"|{m.voice_type}|{m.voice_txt_oaddress}|{}|{}|{}|{}|{}", id, null, null, null, null);
                        return new Layout.ReturnMsg()
                        {
                            success = false,
                            msg = "Duplicate Key"
                        };
                    }
                    catch (Exception ex)
                    {
                        new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "add cp_data 系統錯誤：" + ex.Message + cp_no + " id_no:" + m.id_no, id, null, null, null, null);
                        return new Layout.ReturnMsg()
                        {
                            success = false,

                        };
                        //if (ex.InnerException is System.Data.SqlClient.SqlException)
                        //{
                        //    string a = ex.Message;
                        //}

                    }

                }
                else
                {
                    try
                    {
                        //內部人名單
                        string _kc_further_flag3 = "Y";
                        string run_type = ConfigurationManager.AppSettings["run_type"];
                        if (run_type == "正式")
                        {
                            string _id_no = m.id_no;
                            var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                            if (dudumember != null) _kc_further_flag3 = "N";
                        }
                        //---------------------------------------------------------------


                        //不可 null
                        kc_cpdata.kc_cust_name = m.name;
                        kc_cpdata.kc_proc_fee = 0;
                        kc_cpdata.kc_collarcar_fee = 0;
                        kc_cpdata.kc_area_code = m.area_code;
                        kc_cpdata.kc_comp_code = m.kc_comp_code;
                        kc_cpdata.kc_source_type = "03";
                        kc_cpdata.kc_prod_type = "14";
                        kc_cpdata.kc_issu_code = "01";
                        kc_cpdata.kc_branch_code = "03";
                        kc_cpdata.kc_emp_code = "0001";
                        kc_cpdata.kc_sales_code = m.kc_sales_code;
                        kc_cpdata.kc_workover_flag = "N";
                        kc_cpdata.kc_cfm_stat = "N";
                        kc_cpdata.kc_further_flag3 = _kc_further_flag3;
                        kc_cpdata.kc_Rchk_flag = "Y";
                        kc_cpdata.kc_citizenship_type = "TW";
                        kc_cpdata.kc_crdt_user = "super";
                        kc_cpdata.kc_crdt_date = DateTime.Now;
                        kc_cpdata.kc_brand_code = "03";
                        kc_cpdata.kc_member_no = new Common().getMemberNo(m.id_no.ToUpper());
                        kc_cpdata.kc_membertarget_type = _kc_membertarget_type;

                        //二連電子發票 + 東元會員載具
                        kc_cpdata.PrintMark = m.voice_type == "1" && m.voice_subtype == "2" ? "Y" : "N";
                        kc_cpdata.kc_invoice_address = m.voice_type == "1" && m.voice_subtype == "2" ? m.voice_txt_oaddress : null;//地址 
                        kc_cpdata.CarrierType = new Common().GetCarrierType(m.voice_type, m.voice_subtype);//會員載具
                        kc_cpdata.CarrierId1 = new Common().GetCarrierId1(m.voice_type, m.voice_subtype,
                               m.voice_txt_mobile, m.voice_txt_give, m.voice_txt_cq, new Common().getMemberNo(m.id_no.ToUpper()));//載具號碼 


                        kc_cpdata.kc_further_date3 = new Common().ComptoTime(time);//可連絡時間
                                                                                   //kc_cpdata.kc_cp_no = cp_no;                        kc_cpdata.kc_mobil_no = m.mobile;
                        kc_cpdata.kc_email_no = m.mail;
                        kc_cpdata.kc_id_no = m.id_no;
                        kc_cpdata.kc_cust_nameu = m.name;
                        kc_cpdata.kc_birth_date = _kc_birth_date;// m.birthday != "" && m.birthday != null ? DateTime.Parse(m.birthday) : isNull;
                        kc_cpdata.kc_perm_addr = m.address;
                        kc_cpdata.kc_curr_addr = m.curr_address;
                        kc_cpdata.kc_curr_phone = m.curr_tel;
                        kc_cpdata.kc_cust_name3u = m.contact_person_name;
                        kc_cpdata.kc_mobil_no3 = m.contact_person_tel;
                        kc_cpdata.kc_relation_no3 = m.contact_person_relation;
                        kc_cpdata.kc_work_state = m.employment_state;//add 工作狀態
                        kc_cpdata.kc_comp_desc = m.company_name;
                        kc_cpdata.kc_comp_phone = m.company_tel;
                        kc_cpdata.kc_credit_state = m.credit_state;//add 有無信用卡
                        kc_cpdata.kc_credit_bank = m.credit_bank;//add 發卡銀行
                        kc_cpdata.kc_refund_bank_no = m.refund_bank_no;//add
                        kc_cpdata.kc_refund_bank_name = m.refund_bank_name;//add
                        kc_cpdata.kc_refund_bank_acc = m.refund_bank_acc;//add
                        kc_cpdata.kc_line_no = m.line_id;
                        kc_cpdata.kc_credit_amount = m.credit_amount;//add 希望額度
                        kc_cpdata.kc_cp_date = DateTime.Today;
                        kc_cpdata.kc_issue_date = m.apply_date;
                        kc_cpdata.kc_papa_nameu = m.papa_nameu;
                        kc_cpdata.kc_mama_nameu = m.mama_nameu;
                        kc_cpdata.kc_mate_nameu = m.mate_nameu;
                        //kc_cpdata.kc_member_no = m.kc_member_no;
                        kc_cpdata.kc_introduce_code = m.kc_introduce_code;
                        kc_cpdata.kc_updt_date = DateTime.Now;
                        kc_cpdata.kc_bankbook_name = m.refund_bank_name;
                        //kc_cpdata.kc_bankbook_account = m.refund_bank_no + "-" + m.refund_bank_acc;
                        kc_cpdata.kc_bankbook_account = m.refund_bank_acc;
                        kc_cpdata.kc_dealer_data = $"項目:{_order_type},希望的額度:{m.credit_amount}\n會員編號:{m.kc_member_no}";
                        //time 方便連絡的時間

                        db.kc_cpdata.Attach(kc_cpdata);
                        db.Entry(kc_cpdata).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "update cp_no 系統錯誤：" + ex.Message + cp_no + " id_no:" + m.id_no, id, null, null, null, null);
                        return new Layout.ReturnMsg()
                        {
                            success = false,
                        };
                    }

                }

                //eantodo debug 到底寫入什麼sales_code
                new Common().WriteErrorLog(0, "註冊(完成)", "debug 紀錄是用什麼sales_code的:" + "sales_code:" + m.kc_sales_code + JsonConvert.SerializeObject(m), id, null, _cp_no, null, null);

                return new Layout.ReturnMsg()
                {
                    success = true,
                    value = cp_no
                };


            }



        }

        ////會員載具
        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="voice_type">0手機,1載具,2捐贈</param>       
        ///// <param name="voice_txt_give">捐贈碼</param>
        ///// <returns></returns>
        //string GetCarrierType(string voice_type, string voice_txt_give)
        //{
        //    switch (voice_type)
        //    {
        //        case "0"://手機
        //            return "3J0002";
        //        case "1"://會員載具
        //            return "EN0051";
        //        case "2"://捐贈
        //            return voice_txt_give;
        //        default:
        //            return "";
        //    }
        //}
        ////載具號碼
        //string GetCarrierId1(string voice_type, string voice_txt_mobile, string voice_txt_give)
        //{
        //    switch (voice_type)
        //    {
        //        case "0"://手機
        //            return voice_txt_mobile;
        //        case "1"://會員載具
        //            return "EN0051";
        //        case "2"://捐贈
        //            return voice_txt_give;
        //        default:
        //            return "";
        //    }
        //}


        //完成註冊 成功
        public Layout.ReturnMsg FinishRegister(int id, string cp_no, string time, string longitude, string latitude, string order_type)
        {
            string _login_ok_msg = "";
            int _register_step = 0;
            switch (order_type)
            {
                case "註冊帶訂單":
                    _login_ok_msg = "*";
                    _register_step = 3;
                    break;
                case "綜合":
                    _login_ok_msg = "*";
                    _register_step = 3;
                    break;
                case "超額":
                    z_Member m;
                    try
                    {
                        using (var db = new kcsddb2Entities_new())
                        {
                            m = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                            if (m != null)
                            {
                                m.cp_no = cp_no;
                                //m.member_source = "DUDU";//eantodo
                                //m.email_verify = "*";
                                //m.mobile_verify = "*";
                                //m.register_step = 3;
                                m.kc_updt_date = DateTime.Now;
                                m.update_time = DateTime.Now;
                                db.z_Member.Attach(m);
                                db.Entry(m).State = EntityState.Modified;
                                //db.SaveChanges();
                            }

                            var kc_cpsignature = db.kc_cpsignature.Where(x => x.kc_cp_no == cp_no && x.kc_item_no == 1 && x.kc_id_type == 0 && x.kc_id_no == m.id_no).FirstOrDefault();
                            if (kc_cpsignature == null)
                            {
                                //new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "新增kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                                db.kc_cpsignature.Add(new kc_cpsignature()
                                {
                                    kc_cp_no = cp_no,//key
                                    kc_item_no = 1,//key
                                    kc_id_type = 0,//key
                                    kc_id_no = m.id_no,//key
                                    kc_sign_date = DateTime.Now,
                                    kc_sign_stat = "Y",
                                    kc_mobile_stat = "N",
                                    kc_ca_stat = "N",
                                    CreatePerson = "super",
                                    CreateDate = DateTime.Now,
                                    kc_updt_user = "super",
                                    kc_updt_date = DateTime.Now,
                                });
                            }
                            else
                            {
                                //new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "更新kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                                kc_cpsignature.kc_sign_stat = "Y";
                                kc_cpsignature.kc_updt_date = DateTime.Now;
                                db.kc_cpsignature.Attach(kc_cpsignature);
                                db.Entry(kc_cpsignature).State = EntityState.Modified;
                            }
                            db.SaveChanges();
                        }
                    }
                    catch (Exception ex)
                    {
                        return new Layout.ReturnMsg() { success = false, msg = ex.Message, };
                    }

                    Layout.ReturnMsg returnMsg = new Utilities().MoveImageFileToScan3CoverFinishDelete(cp_no, m.mobile, m.id, "超額-註冊完成");
                    return returnMsg;
                default:
                    break;
            }

            //1.ccis         
            //2.write table z.Member cp_data
            //3.move image file to scan3            
            //4.人臉辨識
            using (var db = new kcsddb2Entities_new())
            using (var db2 = new kcsddb2Entities_2())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                z_Member m; string _id_no;
                m = db.z_Member.Where(x => x.id == id).FirstOrDefault();

                if (m == null)
                {
                    new Common().WriteErrorLog(0, "註冊(完成)", "會員序號不存在" + id, null, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在",
                    };

                }





                //(4) write twca table
                try
                {
                    new Common().WriteTwcaTable(db2, m.twca_msg, cp_no, m.id_no, m.mobile);
                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "write twca table error 系統錯誤：" + m.twca_msg + "|" + cp_no + "|" + m.id_no + "|" + m.mobile + "|" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message
                    };
                }

                //(5)write kc_cpsignature table               
                try
                {
                    var kc_cpsignature = db.kc_cpsignature.Where(x => x.kc_cp_no == cp_no && x.kc_item_no == 1 && x.kc_id_type == 0 && x.kc_id_no == m.id_no).FirstOrDefault();
                    if (kc_cpsignature == null)
                    {
                        //new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "新增kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                        db.kc_cpsignature.Add(new kc_cpsignature()
                        {
                            kc_cp_no = cp_no,//key
                            kc_item_no = 1,//key
                            kc_id_type = 0,//key
                            kc_id_no = m.id_no,//key
                            kc_sign_date = DateTime.Now,
                            kc_sign_stat = "Y",
                            kc_mobile_stat = "N",
                            kc_ca_stat = "N",
                            CreatePerson = "super",
                            CreateDate = DateTime.Now,
                            kc_updt_user = "super",
                            kc_updt_date = DateTime.Now,
                        });
                    }
                    else
                    {
                        //new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "更新kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                        kc_cpsignature.kc_sign_stat = "Y";
                        kc_cpsignature.kc_updt_date = DateTime.Now;
                        db.kc_cpsignature.Attach(kc_cpsignature);
                        db.Entry(kc_cpsignature).State = EntityState.Modified;
                    }
                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "write kc_cpsignature table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message
                    };
                }

                try
                {
                    //(5)write z.Member table
                    m.cp_no = cp_no;
                    m.register_cp_no = cp_no;//紀錄註冊時的原始cp_no
                    m.longitude = longitude;
                    m.latitude = latitude;
                    m.connection_time = time;//連絡時間
                    m.login_ok_msg = _login_ok_msg;//完成註冊
                    m.member_source = "DUDU";
                    m.email_verify = "*";
                    m.mobile_verify = "*";
                    m.register_step = _register_step;
                    m.kc_updt_date = DateTime.Now;
                    m.update_time = DateTime.Now;
                    db.z_Member.Attach(m);
                    db.Entry(m).State = EntityState.Modified;

                    //(5.1)add to kc_noticecfm
                    //if (time == "我在店裡")
                    //{
                    //    var noticecfm = db.kc_noticecfm.Where(x => x.kc_cp_no == cp_no && x.kc_item_no == 1 && x.kc_notice_user == "super").FirstOrDefault();
                    //    if (noticecfm == null)//add
                    //    {
                    //        db.kc_noticecfm.Add(new kc_noticecfm()
                    //        {
                    //            kc_cp_no = cp_no,
                    //            kc_item_no = 1,
                    //            kc_notice_user = "super",
                    //            kc_notice_date = DateTime.Now,
                    //            kc_notice_flag = "Y",
                    //            kc_notice_type = "1",
                    //            kc_updt_date = DateTime.Now
                    //        });
                    //    }
                    //    else//upd
                    //    {
                    //        noticecfm.kc_notice_date = DateTime.Now;
                    //        noticecfm.kc_updt_date = DateTime.Now;
                    //        db.kc_noticecfm.Attach(noticecfm);
                    //        db.Entry(noticecfm).State = EntityState.Modified;
                    //    }
                    //}




                }
                catch (Exception ex)
                {

                    new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "update z_Member table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message
                    };
                }

                //(7)move image file to scan3   
                Layout.ReturnMsg returnMsg = new Utilities().MoveImageFileToScan3CoverFinishDelete(cp_no, m.mobile, m.id, "註冊完成");
                if (!returnMsg.success) return returnMsg;


                try
                {
                    db.SaveChanges();
                    db2.SaveChanges();
                    transaction1.Commit();
                    transaction2.Commit();
                }
                catch (Exception ex)
                {
                    transaction1.Rollback();
                    transaction2.Rollback();
                    new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "Rollback 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message
                    };
                }

                //Commit 存檔之後 才做依另一個執行緒
                if (m != null)
                {
                    //(8)CCIS 人臉辨識 if null ? todo
                    try
                    {
                        //(8.1)正式 才拉C 內部人 不拉C
                        string run_type = ConfigurationManager.AppSettings["run_type"];
                        if (run_type == "正式")
                        {
                            _id_no = m.id_no;
                            var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                            if (dudumember == null)
                            {
                                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                                string path_A = dataFile + @"\" + m.mobile + @"\ID0A-000.jpg";
                                string path_B = dataFile + @"\" + m.mobile + @"\ID0L-000.jpg";
                                WriteCcisAndFace(m.id, cp_no, path_A, path_B,
                                                      m.id_no, m.issue_date, m.issue_site, m.issue_reason, m.birthday, m.name);
                            }
                        }




                    }
                    catch (Exception ex)
                    {
                        new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "CCIS 人臉辨識 系統錯誤：" + ex.Message, id, null, null, null, null);
                        //return new Layout.ReturnMsg()
                        //{
                        //    success = false,
                        //    msg = ex.Message
                        //};
                    }
                }

            }


            return new Layout.ReturnMsg()
            {
                success = true
            };





        }

        //完成簡易註冊 成功
        public Layout.ReturnMsg FinishEasyRegister(int id, string cp_no, string longitude, string latitude)
        {
            string _login_ok_msg = "*";
            int _register_step = 13; //簡易註冊           

            using (var db = new kcsddb2Entities_new())
            using (var db2 = new kcsddb2Entities_2())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                z_Member m; //string _id_no;
                m = db.z_Member.Where(x => x.id == id).FirstOrDefault();

                if (m == null)
                {
                    new Common().WriteErrorLog(0, "簡易註冊(完成)", "會員序號不存在" + id, null, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "會員序號不存在", };
                }


                //write twca table
                try
                {
                    new Common().WriteTwcaTable(db2, m.twca_msg, cp_no, m.id_no, m.mobile);
                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "write twca table error 系統錯誤：" + m.twca_msg + "|" + cp_no + "|" + m.id_no + "|" + m.mobile + "|" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //write kc_cpsignature table               
                //try
                //{
                //    var kc_cpsignature = db.kc_cpsignature.Where(x => x.kc_cp_no == cp_no && x.kc_item_no == 1 && x.kc_id_type == 0 && x.kc_id_no == m.id_no).FirstOrDefault();
                //    if (kc_cpsignature == null)
                //    {
                //        db.kc_cpsignature.Add(new kc_cpsignature()
                //        {
                //            kc_cp_no = cp_no,//key
                //            kc_item_no = 1,//key
                //            kc_id_type = 0,//key
                //            kc_id_no = m.id_no,//key
                //            kc_sign_date = DateTime.Now,
                //            kc_sign_stat = "Y",
                //            kc_mobile_stat = "N",
                //            kc_ca_stat = "N",
                //            CreatePerson = "super",
                //            CreateDate = DateTime.Now,
                //            kc_updt_user = "super",
                //            kc_updt_date = DateTime.Now,
                //        });
                //    }
                //    else
                //    {
                //        //new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "更新kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                //        kc_cpsignature.kc_sign_stat = "Y";
                //        kc_cpsignature.kc_updt_date = DateTime.Now;
                //        db.kc_cpsignature.Attach(kc_cpsignature);
                //        db.Entry(kc_cpsignature).State = EntityState.Modified;
                //    }
                //}
                //catch (Exception ex)
                //{
                //    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "write kc_cpsignature table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                //    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                //}

                try
                {
                    //write z.Member table
                    m.cp_no = cp_no;
                    m.register_cp_no = cp_no;//紀錄註冊時的原始cp_no
                    m.longitude = longitude;
                    m.latitude = latitude;
                    //m.connection_time = time;//連絡時間
                    m.login_ok_msg = _login_ok_msg;//完成註冊
                    m.member_source = "DUDU";
                    m.email_verify = "*";
                    m.mobile_verify = "*";
                    m.register_step = _register_step;
                    m.kc_updt_date = DateTime.Now;
                    m.update_time = DateTime.Now;
                    m.kc_member_no = new Common().getMemberNo(m.id_no.ToUpper());
                    db.z_Member.Attach(m);
                    db.Entry(m).State = EntityState.Modified;

                }
                catch (Exception ex)
                {

                    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "update z_Member table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //move image file to scan3   
                // Layout.ReturnMsg returnMsg = new Utilities().MoveImageFileToScan3CoverFinishDelete(cp_no, m.mobile, m.id, "簡易註冊");
                //if (!returnMsg.success) return returnMsg;


                //call 冠博寫memberdata table
                try
                {
                    string date_now = DateTime.Now.ToString("yyyy-MM-dd");
                    string data = DuDuPay.Models.SecureHelper.AESEncrypt(string.Format("{0},{1}", cp_no, date_now, DuDuPay.Models.SecureHelper.GetRNGChar(6)), DuDuPay.Models.SecureHelper.SecretKey2);
                    string v2 = HttpUtility.UrlEncode(data);
                    string url = ConfigurationManager.AppSettings["WebApi_Url"] + $"GetAutoCpApply?rpt=&realV={v2}";
                    Common c = new Common();
                    Layout.AutoCpApply result = c.SendApi<Layout.AutoCpApply>(ConfigurationManager.AppSettings["WebApi_Url"] + "GetAutoCpApply", new { rpt = "", realV = data });
                    if (!result.success)
                    {
                        DelCpDataRow(cp_no);
                        new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "call 冠博api" + result.message + cp_no + url, id, null, null, null, null);
                        return new Layout.ReturnMsg() { success = false, msg = "呼叫分期API" + result.message };
                    }


                }
                catch (Exception ex)
                {
                    DelCpDataRow(cp_no);
                    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "call 冠博api系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "呼叫分期API" + ex.Message };
                }

                //move image file to scan3   
                Layout.ReturnMsg returnMsg = new Utilities().MoveImageFileToScan3CoverFinishDelete(cp_no, m.mobile, m.id, "簡易註冊");
                if (!returnMsg.success) return returnMsg;

                try
                {
                    db.SaveChanges();
                    db2.SaveChanges();
                    transaction1.Commit();
                    transaction2.Commit();
                }
                catch (Exception ex)
                {
                    transaction1.Rollback();
                    transaction2.Rollback();
                    DelCpDataRow(cp_no);
                    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "Rollback 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //Commit 存檔之後 才做依另一個執行緒
                //if (m != null)
                //{
                //    //(8)CCIS 人臉辨識 if null ? todo
                //    try
                //    {
                //        //(8.1)正式 才拉C 內部人 不拉C
                //        string run_type = ConfigurationManager.AppSettings["run_type"];
                //        if (run_type == "正式")
                //        {
                //            _id_no = m.id_no;
                //            var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                //            if (dudumember == null)
                //            {
                //                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                //                string path_A = dataFile + @"\" + m.mobile + @"\ID0A-000.jpg";
                //                string path_B = dataFile + @"\" + m.mobile + @"\ID0L-000.jpg";
                //                WriteCcisAndFace(m.id, cp_no, path_A, path_B,
                //                                      m.id_no, m.issue_date, m.issue_site, m.issue_reason, m.birthday, m.name);
                //            }
                //        }




                //    }
                //    catch (Exception ex)
                //    {
                //        new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "CCIS 人臉辨識 系統錯誤：" + ex.Message, id, null, null, null, null);

                //    }
                //}

            }

            return new Layout.ReturnMsg() { success = true };

        }


        void DelCpDataRow(string cp_no)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();
                if (cpdata != null)
                {
                    db.kc_cpdata.Remove(cpdata);
                    db.SaveChanges();
                }

            };

        }

        public Layout.ReturnMsg FinishRegister_bobo(int id, string longitude, string latitude, string order_type)
        {

            //1.ccis         
            //2.write table z.Member cp_data
            //3.move image file to scan3            
            //4.人臉辨識
            using (var db = new kcsddb2Entities_new())
            using (var db2 = new kcsddb2Entities_2())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                z_Member m;// string _id_no;
                m = db.z_Member.Where(x => x.id == id).FirstOrDefault();

                if (m == null)
                {
                    new Common().WriteErrorLog(0, "BOBO會員註冊(完成)", "會員序號不存在" + id, null, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "會員序號不存在", };

                }

                //(4) write twca table
                try
                {
                    new Common().WriteTwcaTable(db2, m.twca_msg, m.register_cp_no, m.id_no, m.mobile);
                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "BOBO會員註冊(合約簽署完成)", "write twca table error 系統錯誤：" + m.twca_msg + "|" + m.register_cp_no + "|" + m.id_no + "|" + m.mobile + "|" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //(5)write kc_cpsignature table              
                //try
                //{
                //    var kc_cpsignature = db.kc_cpsignature.Where(x => x.kc_cp_no == m.cp_no && x.kc_item_no == 1 && x.kc_id_type == 0 && x.kc_id_no == m.id_no).FirstOrDefault();
                //    if (kc_cpsignature == null)
                //    {
                //        db.kc_cpsignature.Add(new kc_cpsignature()
                //        {
                //            kc_cp_no = m.cp_no,//key
                //            kc_item_no = 1,//key
                //            kc_id_type = 0,//key
                //            kc_id_no = m.id_no,//key
                //            kc_sign_date = DateTime.Now,
                //            kc_sign_stat = "Y",
                //            kc_mobile_stat = "N",
                //            kc_ca_stat = "N",
                //            CreatePerson = "super",
                //            CreateDate = DateTime.Now,
                //            kc_updt_user = "super",
                //            kc_updt_date = DateTime.Now,
                //        });
                //    }
                //    else
                //    {
                //        //new Common().WriteErrorLog(1, "註冊(合約簽署完成)", "更新kc_cpsignature table cp_no" + cp_no, id, null, null, null, null);
                //        kc_cpsignature.kc_sign_stat = "Y";
                //        kc_cpsignature.kc_updt_date = DateTime.Now;
                //        db.kc_cpsignature.Attach(kc_cpsignature);
                //        db.Entry(kc_cpsignature).State = EntityState.Modified;
                //    }
                //}
                //catch (Exception ex)
                //{
                //    new Common().WriteErrorLog(1, "BOBO會員註冊(合約簽署完成)", "write kc_cpsignature table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                //    return new Layout.ReturnMsg()
                //    {
                //        success = false,
                //        msg = ex.Message
                //    };
                //}


                string _mobile = m.mobile;//用舊的mobile
                try
                {

                    //(5)write z.Member table
                    //m.cp_no = cp_no;
                    //m.register_cp_no = cp_no;//紀錄註冊時的原始cp_no
                    m.longitude = longitude;
                    m.latitude = latitude;
                    //m.connection_time = time;//連絡時間
                    //m.login_ok_msg = _login_ok_msg;//完成註冊
                    //m.register_step = _register_step;
                    m.kc_updt_date = DateTime.Now;
                    m.update_time = DateTime.Now;
                    if (m.tmp_twca_return_desc != null && m.tmp_twca_return_desc != "") m.twca_return_desc = m.tmp_twca_return_desc;
                    if (m.tmp_new_mobile != null && m.tmp_new_mobile != "") m.mobile = m.tmp_new_mobile;//寫入新的mobile

                    m.mobile_verify = "*";
                    //db.z_Member.Attach(m);
                    //db.Entry(m).State = EntityState.Modified;


                    if (m.tmp_new_mobile != null && m.tmp_new_mobile != "")
                    {
                        var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == m.kc_member_no).FirstOrDefault();
                        if (memberdata != null)
                        {
                            memberdata.kc_mobil_no = m.tmp_new_mobile;
                            db.kc_memberdata.Attach(memberdata);
                            db.Entry(memberdata).State = EntityState.Modified;
                        }
                    }

                    //雙驗證後 update memberdata status 
                    if (m.email_verify == "*")//mail 已驗證
                    {
                        var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == m.kc_member_no).FirstOrDefault();
                        if (memberdata != null)
                        {
                            if (m.twca_return_desc == "手機非本人或易付卡")
                                memberdata.kc_member_stat = "T";
                            else
                                memberdata.kc_member_stat = "A";

                            db.kc_memberdata.Attach(memberdata);
                            db.Entry(memberdata).State = EntityState.Modified;

                            m.verify_date = DateTime.Now;//雙驗證時間

                        }
                        else
                        {
                            return new Layout.ReturnMsg() { success = false, msg = "會員編號不存在" + m.kc_member_no };
                        }
                    }
                    db.z_Member.Attach(m);
                    db.Entry(m).State = EntityState.Modified;


                }
                catch (Exception ex)
                {

                    new Common().WriteErrorLog(1, "BOBO會員註冊(合約簽署完成)", "update z_Member table error 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //(6)move member_no
                Layout.ReturnMsg returnMsg = new Utilities().MoveImageFileToScan3ForBoboMemberFinishDelete(m.kc_member_no, _mobile, m.id, "BOBO會員雙驗證註冊完成(會員明細)");
                if (!returnMsg.success) return returnMsg;

                //(7)move image file to scan3   
                //用舊的mobile
                Layout.ReturnMsg returnMsg2 = new Utilities().MoveImageFileToScan3ForBoboFinishDelete(m.register_cp_no, _mobile, m.id, "BOBO會員雙驗證註冊完成(註冊CP)");
                if (!returnMsg2.success) return returnMsg2;


                try
                {
                    db.SaveChanges();
                    db2.SaveChanges();
                    transaction1.Commit();
                    transaction2.Commit();
                }
                catch (Exception ex)
                {
                    transaction1.Rollback();
                    transaction2.Rollback();
                    new Common().WriteErrorLog(1, "BOBO會員註冊(合約簽署完成)", "Rollback 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = ex.Message };
                }

                //Commit 存檔之後 才做依另一個執行緒
                //if (m != null)
                //{
                //    //(8)CCIS 人臉辨識 if null ? todo
                //    try
                //    {
                //        //(8.1)正式 才拉C 內部人 不拉C
                //        string run_type = ConfigurationManager.AppSettings["run_type"];
                //        if (run_type == "正式")
                //        {
                //            _id_no = m.id_no;
                //            var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                //            if (dudumember == null)
                //            {
                //                var dataFile = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Tmp/FileUploads");
                //                string path_A = dataFile + @"\" + m.mobile + @"\ID0A-000.jpg";
                //                string path_B = dataFile + @"\" + m.mobile + @"\ID0L-000.jpg";
                //                WriteCcisAndFace(m.id, m.register_cp_no, path_A, path_B,
                //                                      m.id_no, m.issue_date, m.issue_site, m.issue_reason, m.birthday, m.name);
                //            }
                //        }




                //    }
                //    catch (Exception ex)
                //    {
                //        new Common().WriteErrorLog(1, "BOBO會員註冊(合約簽署完成)", "CCIS 人臉辨識 系統錯誤：" + ex.Message, id, null, null, null, null);

                //    }
                //}

            }

            return new Layout.ReturnMsg() { success = true };
        }
        #endregion


        public Layout.ReturnMsg FinishEasyRegister_0(int id, string _cp_no)
        {
            string _order_type = "G簡易註冊"; string _kc_membertarget_type = "G";
            //switch (order_type)
            //{
            //    case "綜合":
            //        _order_type = "G簡易註冊";
            //        _kc_membertarget_type = "G";
            //        break;
            //    default:
            //        break;
            //}

            //eantodo debug tmp紀錄是用什麼 綜合/超額 來註冊的
            //new Common().WriteErrorLog(0, "簡易註冊(完成)", "debug 紀錄是用什麼 綜合/超額 來註冊的:" + order_type, id, null, _cp_no, null, null);


            z_Member m; string cp_no = "";
            using (var db = new kcsddb2Entities_new())
            {
                m = db.z_Member.Where(x => x.id == id).FirstOrDefault();

                if (m == null)
                {
                    new Common().WriteErrorLog(0, "簡易註冊(完成)", "會員序號不存在", id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "會員序號不存在", };
                }

                if (m.id_no == "" || m.id_no == null) return new Layout.ReturnMsg() { success = false, msg = "身分證號空白", };


                try
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == m.register_cp_no).FirstOrDefault();
                    if (cpdata == null)
                    {
                        if (m.register_cp_no == null || m.register_cp_no == string.Empty)
                            cp_no = _cp_no;
                        else
                            cp_no = m.register_cp_no;
                    }
                    else
                    {  //退件/取消 用新cp
                        if (cpdata.kc_apply_stat == "N" || cpdata.kc_apply_stat == "R")
                        {
                            cp_no = _cp_no;
                        }
                        else
                        {
                            if (m.register_cp_no == null || m.register_cp_no == string.Empty)
                                cp_no = _cp_no;
                            else
                                cp_no = m.register_cp_no;
                        }
                    }


                }
                catch (Exception ex)
                {
                    new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "cp_data 欄位有錯 系統錯誤：" + ex.Message, id, null, null, null, null);
                    return new Layout.ReturnMsg() { success = false, msg = "cp_data 欄位有錯" + ex.Message };
                }

                //write cp_data table                       
                var kc_cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();

                //DateTime? isNull = null;
                DateTime? _kc_birth_date = null;
                try
                {
                    _kc_birth_date = DateTime.Parse(m.birthday);
                }
                catch (Exception) { }
                if (kc_cpdata == null)
                {

                    try
                    {
                        //內部人名單
                        //string _kc_further_flag3 = "Y";
                        //string run_type = ConfigurationManager.AppSettings["run_type"];
                        //if (run_type == "正式")
                        //{
                        //    string _id_no = m.id_no;
                        //    var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                        //    if (dudumember != null) _kc_further_flag3 = "N";
                        //}
                        //---------------------------------------------------------------

                        db.kc_cpdata.Add(new kc_cpdata()
                        {
                            //不可 null
                            kc_cust_name = m.name,
                            kc_proc_fee = 0,
                            kc_collarcar_fee = 0,
                            kc_area_code = m.area_code,
                            kc_comp_code = m.kc_comp_code,// m.kc_introduce_code "VA00",//店家 放店家代號 ;其他VA00
                            kc_twca_flag = "Y",
                            //kc_ccis_flag = "Y",
                            kc_source_type = "03",
                            kc_prod_type = "14",
                            kc_issu_code = "01",
                            kc_branch_code = "03",
                            kc_emp_code = "0001",
                            kc_sales_code = m.kc_sales_code,//推薦碼店家 找業務 非店家0001
                            kc_workover_flag = "N",
                            //kc_cfm_stat = "N",
                            //kc_further_flag3 = _kc_further_flag3,
                            kc_Rchk_flag = "Y",
                            kc_citizenship_type = "TW",
                            kc_crdt_user = "super",
                            kc_crdt_date = DateTime.Now,
                            kc_brand_code = "03",
                            kc_member_no = m.id_no == "" || m.id_no == null ? "" : new Common().getMemberNo(m.id_no.ToUpper()),
                            kc_membertarget_type = _kc_membertarget_type,
                            //二連電子發票 + 東元會員載具
                            PrintMark = m.voice_type == "1" && m.voice_subtype == "2" ? "Y" : "N",
                            kc_invoice_address = m.voice_type == "1" && m.voice_subtype == "2" ? m.voice_txt_oaddress : null,//地址 
                            CarrierType = new Common().GetCarrierType(m.voice_type, m.voice_subtype),//會員載具
                            CarrierId1 = new Common().GetCarrierId1(m.voice_type, m.voice_subtype,
                                 m.voice_txt_mobile, m.voice_txt_give, m.voice_txt_cq, new Common().getMemberNo(m.id_no.ToUpper())),//載具號碼                               
                            //kc_further_date3 = new Common().ComptoTime(time),//可連絡時間
                            kc_cp_no = cp_no,
                            kc_mobil_no = m.mobile,
                            kc_email_no = m.mail,
                            kc_id_no = m.id_no,
                            kc_cust_nameu = m.name,


                            //kc_birth_date = DateTime.Parse(m.birthday),
                            kc_birth_date = _kc_birth_date,
                            kc_perm_addr = m.address,
                            kc_curr_addr = m.curr_address,
                            //kc_curr_phone = m.curr_tel,
                            //kc_cust_name3u = m.contact_person_name,
                            //kc_mobil_no3 = m.contact_person_tel,
                            //kc_relation_no3 = m.contact_person_relation,
                            //kc_work_state = m.employment_state,//add 工作狀態
                            //kc_comp_desc = m.company_name,
                            //kc_comp_phone = m.company_tel,
                            //kc_credit_state = m.credit_state,//add 有無信用卡
                            //kc_credit_bank = m.credit_bank,//add 發卡銀行
                            //kc_refund_bank_no = m.refund_bank_no,//add
                            //kc_refund_bank_name = m.refund_bank_name,//add
                            //kc_refund_bank_acc = m.refund_bank_acc,//add
                            //kc_line_no = m.line_id,
                            kc_credit_amount = "2000",//add 希望額度
                            kc_cp_date = DateTime.Today,
                            //kc_issue_date = m.apply_date,//發證日
                            //kc_papa_nameu = m.papa_nameu,
                            //kc_mama_nameu = m.mama_nameu,
                            //kc_mate_nameu = m.mate_nameu,                            
                            kc_introduce_code = m.kc_introduce_code,
                            kc_updt_date = DateTime.Now,
                            //kc_bankbook_name = m.refund_bank_name,                            
                            //kc_bankbook_account = m.refund_bank_acc,                            
                            kc_dealer_data = $"項目:{_order_type}\n會員編號:{m.kc_member_no}",
                            kc_apply_stat = "P",
                            kc_cfm_stat = "P"


                        });
                        db.SaveChanges();
                    }
                    catch (System.Data.DataException ex)
                    {
                        new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "CP Duplicate Key 系統錯誤：" + ex.Message + cp_no, id, null, null, null, null);
                        return new Layout.ReturnMsg() { success = false, msg = "Duplicate Key" };
                    }
                    catch (Exception ex)
                    {
                        new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "add cp_data 系統錯誤：" + ex.Message + cp_no + " id_no:" + m.id_no, id, null, null, null, null);
                        return new Layout.ReturnMsg() { success = false, };
                        //if (ex.InnerException is System.Data.SqlClient.SqlException)
                        //{
                        //    string a = ex.Message;
                        //}

                    }

                }
                else
                {
                    try
                    {
                        //內部人名單
                        //string _kc_further_flag3 = "Y";
                        //string run_type = ConfigurationManager.AppSettings["run_type"];
                        //if (run_type == "正式")
                        //{
                        //    string _id_no = m.id_no;
                        //    var dudumember = db.kc_dudumember_forAllowlist.Where(x => x.kc_id_no == _id_no).FirstOrDefault();
                        //    if (dudumember != null) _kc_further_flag3 = "N";
                        //}
                        //---------------------------------------------------------------


                        //不可 null
                        kc_cpdata.kc_cust_name = m.name;
                        kc_cpdata.kc_proc_fee = 0;
                        kc_cpdata.kc_collarcar_fee = 0;
                        kc_cpdata.kc_area_code = m.area_code;
                        kc_cpdata.kc_comp_code = m.kc_comp_code;
                        kc_cpdata.kc_source_type = "03";
                        kc_cpdata.kc_prod_type = "14";
                        kc_cpdata.kc_issu_code = "01";
                        kc_cpdata.kc_branch_code = "03";
                        kc_cpdata.kc_emp_code = "0001";
                        kc_cpdata.kc_sales_code = m.kc_sales_code;
                        kc_cpdata.kc_workover_flag = "N";
                        //kc_cpdata.kc_cfm_stat = "N";
                        //kc_cpdata.kc_further_flag3 = _kc_further_flag3;
                        kc_cpdata.kc_Rchk_flag = "Y";
                        kc_cpdata.kc_citizenship_type = "TW";
                        kc_cpdata.kc_crdt_user = "super";
                        kc_cpdata.kc_crdt_date = DateTime.Now;
                        kc_cpdata.kc_brand_code = "03";
                        kc_cpdata.kc_member_no = new Common().getMemberNo(m.id_no.ToUpper());
                        kc_cpdata.kc_membertarget_type = _kc_membertarget_type;

                        //二連電子發票 + 東元會員載具
                        kc_cpdata.PrintMark = m.voice_type == "1" && m.voice_subtype == "2" ? "Y" : "N";
                        kc_cpdata.kc_invoice_address = m.voice_type == "1" && m.voice_subtype == "2" ? m.voice_txt_oaddress : null;//地址 
                        kc_cpdata.CarrierType = new Common().GetCarrierType(m.voice_type, m.voice_subtype);//會員載具
                        kc_cpdata.CarrierId1 = new Common().GetCarrierId1(m.voice_type, m.voice_subtype,
                               m.voice_txt_mobile, m.voice_txt_give, m.voice_txt_cq, new Common().getMemberNo(m.id_no.ToUpper()));//載具號碼 


                        //kc_cpdata.kc_further_date3 = new Common().ComptoTime(time);//可連絡時間
                        //kc_cpdata.kc_cp_no = cp_no;                        kc_cpdata.kc_mobil_no = m.mobile;
                        kc_cpdata.kc_email_no = m.mail;
                        kc_cpdata.kc_id_no = m.id_no;
                        kc_cpdata.kc_cust_nameu = m.name;
                        kc_cpdata.kc_birth_date = _kc_birth_date; //m.birthday != "" && m.birthday != null ? DateTime.Parse(m.birthday) : isNull;
                        kc_cpdata.kc_perm_addr = m.address;
                        kc_cpdata.kc_curr_addr = m.curr_address;
                        //kc_cpdata.kc_curr_phone = m.curr_tel;
                        //kc_cpdata.kc_cust_name3u = m.contact_person_name;
                        //kc_cpdata.kc_mobil_no3 = m.contact_person_tel;
                        //kc_cpdata.kc_relation_no3 = m.contact_person_relation;
                        //kc_cpdata.kc_work_state = m.employment_state;//add 工作狀態
                        //kc_cpdata.kc_comp_desc = m.company_name;
                        //kc_cpdata.kc_comp_phone = m.company_tel;
                        //kc_cpdata.kc_credit_state = m.credit_state;//add 有無信用卡
                        //kc_cpdata.kc_credit_bank = m.credit_bank;//add 發卡銀行
                        //kc_cpdata.kc_refund_bank_no = m.refund_bank_no;//add
                        //kc_cpdata.kc_refund_bank_name = m.refund_bank_name;//add
                        //kc_cpdata.kc_refund_bank_acc = m.refund_bank_acc;//add
                        //kc_cpdata.kc_line_no = m.line_id;
                        kc_cpdata.kc_credit_amount = "2000"; //m.credit_amount;//add 希望額度
                        kc_cpdata.kc_cp_date = DateTime.Today;
                        //kc_cpdata.kc_issue_date = m.apply_date;
                        //kc_cpdata.kc_papa_nameu = m.papa_nameu;
                        //kc_cpdata.kc_mama_nameu = m.mama_nameu;
                        //kc_cpdata.kc_mate_nameu = m.mate_nameu;                        
                        kc_cpdata.kc_introduce_code = m.kc_introduce_code;
                        kc_cpdata.kc_updt_date = DateTime.Now;
                        //kc_cpdata.kc_bankbook_name = m.refund_bank_name;                        
                        //kc_cpdata.kc_bankbook_account = m.refund_bank_acc;
                        kc_cpdata.kc_dealer_data = $"項目:{_order_type}\n會員編號:{m.kc_member_no}";
                        kc_cpdata.kc_apply_stat = "P";
                        kc_cpdata.kc_cfm_stat = "P";


                        db.kc_cpdata.Attach(kc_cpdata);
                        db.Entry(kc_cpdata).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        new Common().WriteErrorLog(1, "簡易註冊(合約簽署完成)", "update cp_no 系統錯誤：" + ex.Message + cp_no + " id_no:" + m.id_no, id, null, null, null, null);
                        return new Layout.ReturnMsg() { success = false, };
                    }

                }

                //eantodo debug 到底寫入什麼sales_code
                //new Common().WriteErrorLog(0, "簡易註冊(完成)", "debug 紀錄是用什麼sales_code的:" + "sales_code:" + m.kc_sales_code + JsonConvert.SerializeObject(m), id, null, _cp_no, null, null);

                return new Layout.ReturnMsg() { success = true, value = cp_no };
            }



        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cp_no"></param>
        /// <param name="base64A">身分証正面</param>
        /// <param name="base64B">自拍</param>
        void WriteCcisAndFace(int id, string cp_no, string path_A, string path_B,
            string id_no, string issue_date, string issue_site, string issue_reason, string birthday, string name)
        {

            var tokenSource = new CancellationTokenSource();
            CancellationToken ct = tokenSource.Token;
            var t = Task.Run(() =>
            {
                try
                {


                    //ean========= (1) get ccis
                    //string run_type = ConfigurationManager.AppSettings["run_type"];
                    //if (run_type == "正式")
                    //{
                    CallApi.CcisApi ccis = new CallApi.CcisApi();
                    var json = ccis.GetCCIS(id_no, issue_date, issue_site, issue_reason, birthday, name);

                    string data = (string)json["data"];

                    if ((string)json["msg"] == "OK")
                    {
                        using (var db = new kcsddb2Entities_new())
                        {
                            //(2)write ccis table
                            var ccisdata = db.kc_ccisdata.Where(x => x.kc_cp_no == cp_no && x.kc_cust_type == 0).FirstOrDefault();
                            if (ccisdata == null)
                            {
                                db.kc_ccisdata.Add(new kc_ccisdata()
                                {
                                    kc_cp_no = cp_no,
                                    kc_cust_type = 0,
                                    kc_id_no = id_no,
                                    kc_ccis_date = DateTime.Today,
                                    kc_ccis_body = data,
                                    CreatePerson = id_no,
                                    CreateDate = DateTime.Now,
                                    kc_updt_user = id_no,
                                    kc_updt_date = DateTime.Now

                                });
                            }
                            else
                            {
                                ccisdata.kc_id_no = id_no;
                                ccisdata.kc_ccis_date = DateTime.Today;
                                ccisdata.kc_ccis_body = data;
                                ccisdata.CreatePerson = id_no;
                                ccisdata.CreateDate = DateTime.Now;
                                ccisdata.kc_updt_user = id_no;
                                ccisdata.kc_updt_date = DateTime.Now;

                            }

                            db.SaveChanges();
                        }
                    }
                    else//error
                    {
                        new Common().WriteErrorLog(1, "註冊完成 Call CCIS", data, id, id_no, cp_no, null, null);
                        using (var db = new kcsddb2Entities_new())
                        {
                            var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                            if (member != null)
                            {
                                member.login_error_msg = data;
                                db.z_Member.Attach(member);
                                db.Entry(member).State = EntityState.Modified;
                                db.SaveChanges();
                            }
                        }
                    }
                    //}




                    //========= (2) 人臉
                    if (File.Exists(path_A) && File.Exists(path_B))
                    {
                        CallApi.FaceApi c = new CallApi.FaceApi();
                        var response = c.FacesRecognition(cp_no, Convert.ToBase64String(System.IO.File.ReadAllBytes(path_A)),
                             Convert.ToBase64String(System.IO.File.ReadAllBytes(path_B)));

                        if (response["success"] != null)
                        {
                            if (response["success"] == true)
                            {
                                var similarity = (double)response["similarity"].Value;
                                var liveness_a = (double)response["faces_a"]["info"]["liveness"].Value;
                                var liveness_b = (double)response["faces_b"]["info"]["liveness"].Value;
                                similarity = similarity * 100.0;
                                liveness_a = liveness_a * 100.0;
                                liveness_b = liveness_b * 100.0;

                                using (var db = new kcsddb2Entities_new())
                                {
                                    var cp_data = db.kc_cpdata.Where(x => x.kc_cp_no == cp_no).FirstOrDefault();
                                    if (cp_data != null)
                                    {
                                        cp_data.kc_similarity_per = similarity.ToString();
                                        cp_data.kc_liveness_a = liveness_a.ToString();
                                        cp_data.kc_liveness_b = liveness_b.ToString();
                                        db.kc_cpdata.Attach(cp_data);
                                        db.Entry(cp_data).State = EntityState.Modified;
                                    }


                                    var member = db.z_Member.Where(x => x.id == id).FirstOrDefault();
                                    if (member != null)
                                    {
                                        member.face_msg = response.ToString(Newtonsoft.Json.Formatting.None);
                                        db.z_Member.Attach(member);
                                        db.Entry(member).State = EntityState.Modified;
                                    }

                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                new Common().WriteErrorLog(1, "註冊 人臉辨識", response["message"], id, id_no, cp_no, null, null);
                            }
                        }
                        else
                        {
                            new Common().WriteErrorLog(1, "註冊完成 人臉辨識", "回傳 response[success]為null", id, id_no, cp_no, null, null);
                        }


                    }



                }
                catch (Exception ex)
                {
                    tokenSource.Cancel();
                    new Common().WriteErrorLog(1, "註冊 CCIS/人臉辨識", "系統錯誤：" + ex.Message, id, id_no, cp_no, null, null);
                }
            }, tokenSource.Token);
        }






        public Object CheckIdNo(int member_id, string id_no, string msg_txt)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    //(1)check 此身份證是否曾註冊過(跟會員編號有關)
                    bool has_idno = db.z_Member.Any(x => x.id != member_id && x.id_no == id_no);
                    if (has_idno)
                    {
                        new Common().WriteErrorLog(1, msg_txt, "此身分證字號曾經註冊過,z_Member，請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", member_id, id_no, null, null, null);
                        return new
                        {
                            success = false,
                            msg = "CheckIdNo"
                        };
                    }

                    //(1.1)
                    var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                    if (member != null)
                    {
                        has_idno = db.kc_memberdata.Any(x => x.kc_cp_no != member.register_cp_no && x.kc_id_no == id_no);
                        if (has_idno)
                        {
                            new Common().WriteErrorLog(1, msg_txt, "此身分證字號曾經註冊過,kc_memberdata，請連繫客服！(此人為舊客戶,可能是換手機)手動將member table 更改mobile", member_id, id_no, null, null, null);
                            return new
                            {
                                success = false,
                                msg = "此身分證字號已經在會員資料中"
                            };
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, msg_txt, "此身分證字號是否曾經註冊過,系統錯誤" + ex.Message, member_id, id_no, null, null, null);
            }


            return new { success = true };

        }





        public async Task<string> SendToSingalR(string Uri, Object obj)
        {
            //Show(Uri);
            var myContent = JsonConvert.SerializeObject(obj);
            var buffer = System.Text.Encoding.UTF8.GetBytes(myContent);
            var byteContent = new ByteArrayContent(buffer);
            byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            using (var client = new HttpClient())
            {
                try
                {
                    client.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
                    var response = await client.PostAsync(Uri, byteContent);
                    var result = await response.Content.ReadAsStringAsync();
                    //Show(result);
                    return result;


                }
                catch (HttpRequestException ex)
                {

                }
                catch (Exception ex)
                {

                }
                return "";


            }

        }


        public Layout.ReturnMsg WriteTwcaTable(int member_id)
        {
            try
            {
                string _twca_msg; string _cp_no; string _mobile; string _id_no;
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                    if (member == null) return new Layout.ReturnMsg() { success = false, msg = "查無此會員序號" };
                    _twca_msg = member.twca_msg;
                    //_cp_no = member.register_cp_no;
                    _cp_no = member.cp_no;
                    _mobile = member.mobile;
                    _id_no = member.id_no;
                }

                using (var db2 = new kcsddb2Entities_2())
                {
                    Layout.ReturnMsg msg = new Common().WriteTwcaTable(db2, _twca_msg, _cp_no, _id_no, _mobile);
                    if (!msg.success) return msg;
                    db2.SaveChanges();
                }

                return new Layout.ReturnMsg() { success = true };
            }
            catch (Exception ex)
            {
                return new Layout.ReturnMsg() { success = false, msg = ex.Message };
            }





        }


        public Object CheckRegisterOrder(int member_id)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                    if (member == null) return new { success = false, msg = "會員序號不存在或您已登入了別的帳號" };

                    //------------------交易面
                    //(1)
                    if (member.trade_type == "超額")
                    {
                        return new
                        {
                            success = true,
                            order_type = "超額",
                            trade_info = member.trade_info,
                            trade_url = member.trade_url
                        };
                    }
                    //(2)
                    if (member.trade_type == "足額")
                    {
                        return new
                        {
                            success = true,
                            order_type = "足額"
                        };
                    }
                    //------------------註冊面
                    //(3)
                    if (member.order_type == "註冊帶訂單")
                    {
                        return new
                        {
                            success = true,
                            order_type = "註冊帶訂單",
                            order_url = member.order_url
                        };
                    }

                    //(4)
                    if (member.order_type == "綜合" || member.order_type == null || member.order_type == "")
                    {
                        return new
                        {
                            success = true,
                            order_type = "綜合"
                        };
                    }

                    return new
                    {
                        success = true
                    };

                }
            }
            catch (Exception ex)
            {
                return new { success = false, msg = ex.Message };

            }


        }

        public Object SaveMemberInfoEasy(int member_id, string name, string idno, string birth, string addr,
             string current_address,
                     string voice_type,
                 string voice_txt_mobile,
                string voice_txt_give,
                string voice_subtype,
                string voice_txt_cq,
                 string voice_txt_oaddress)
        {
            try
            {
                using (var db = new kcsddb2Entities_new())
                {
                    var m = db.z_Member.Where(x => x.id_no == idno && x.id != member_id && x.role == "member").FirstOrDefault();
                    if (m != null) return new { success = false, msg = "此身分證字號曾經註冊過" };


                    var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                    if (member != null)
                    {
                        member.name = name;
                        member.id_no = idno;
                        member.birthday = birth;
                        member.birthday_dt = DateTime.Parse(birth);
                        member.address = addr;
                        member.register_step = 12;


                        member.curr_address = current_address;
                        member.voice_type = voice_type;
                        member.voice_txt_mobile = voice_txt_mobile;
                        member.voice_txt_give = voice_txt_give;

                        member.voice_subtype = voice_subtype;
                        member.voice_txt_cq = voice_txt_cq;
                        member.voice_txt_oaddress = voice_txt_oaddress;
                        db.SaveChanges();
                    }
                }
                return new { success = true };
            }
            catch (Exception ex)
            {
                return new { success = false, msg = ex.Message };
            }

        }
        public Object GetEasyMemberInfo(int member_id)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).Select(x => new
                {
                    x.id_no,
                    x.name,
                    x.birthday,
                    x.address,
                    x.curr_address,
                    x.voice_type,
                    x.voice_txt_mobile,
                    x.voice_txt_give,
                    x.voice_subtype,
                    x.voice_txt_cq,
                    x.voice_txt_oaddress
                }).FirstOrDefault();

                if (member == null) return new { success = false, msg = "資料有誤" };
                return new { success = true, value = member };

            }
        }



        //public Object GetPuchCodeDecoding(string data, int type, string store_id)
        //{
        //    try
        //    {
        //        if (type == 2 || type == 3)//order_2 order_3
        //        {
        //            //(1)get code_time 及 check type_code              
        //            string code_time = new OrderDA().GetCodeTime(store_id, type);
        //            if (code_time == string.Empty) return new { success = false, msg = $"此 QRCode 不存在！store_id:({store_id})" };
        //            //(2)解密
        //            Common c = new Common();
        //            string value = c.DecryptByDES(data, code_time + ConfigurationManager.AppSettings["Encryption_Decryption_key"], code_time + ConfigurationManager.AppSettings["Encryption_Decryption_vi"]); var json = Newtonsoft.Json.Linq.JObject.Parse(value);
        //            string store_no = (string)json["store_no"];
        //            return new { success = true, store_no = store_no };
        //        }
        //        else
        //        {
        //            //(1)解密
        //            Common c = new Common();
        //            string value = c.DecryptByDES(data, ConfigurationManager.AppSettings["Encryption_Decryption_key"], ConfigurationManager.AppSettings["Encryption_Decryption_vi"]); var json = Newtonsoft.Json.Linq.JObject.Parse(value);
        //            string store_no = (string)json["store_no"];
        //            return new { success = true, store_no = store_no };
        //        }



        //    }
        //    catch (Exception ex)
        //    {
        //        new Common().WriteErrorLog(1, "註冊帶訂單", "註冊前解密 系統錯誤" + ex.Message + data, null, null, null, null, null);
        //        return new { success = false, msg = ex.Message };
        //    }
        //}

    }



    class member
    {
        public DateTime? add_date { set; get; }
        public string authority { set; get; }
        public int? count { set; get; }
        public int? date { set; get; }
        public DateTime? e_date { set; get; }
        public DateTime? last_time { set; get; }
        public string name { set; get; }
        public string open_flag { set; get; }
        public DateTime? s_date { set; get; }
        public bool first_login { set; get; }//註冊後首登
        public bool today_login { set; get; }//今日首登
        public string notifyReaded { set; get; }
        public string teacherReaded { set; get; }
        public string menuReaded { set; get; }
    }


}


