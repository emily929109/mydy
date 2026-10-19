using DuDuPay.Layout;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Web;

namespace DuDuPay.Models
{


    public class OrderNonMemberDA
    {
        private readonly static object _thisLock = new object();

        #region GetOrder
        public Object GetOrder(string store_no, string order_no)
        {
            using (var db = new duducmsEntities())
            {
                var kc_merchanttrade = db.kc_merchanttrade.Where(x => x.kc_merchant_id == store_no && x.kc_order_no == order_no).FirstOrDefault();
                if (kc_merchanttrade != null)
                {
                    return new
                    {
                        success = true,
                        value = new
                        {
                            store_name = getStoreName(kc_merchanttrade.kc_merchant_id),
                            kc_car_model = kc_merchanttrade.kc_item_desc,//品名
                            kc_merchanttrade.kc_loan_amt,
                            kc_perd_fee = kc_merchanttrade.kc_perd_fee,
                            kc_updt_date = kc_merchanttrade.CreateDate.ToString("yyyy/MM/dd HH:mm:ss"),
                            kc_loan_perd = kc_merchanttrade.kc_loan_perd,
                            order_no
                        }
                    };
                }
                else
                {
                    return new { success = false, msg = "訂單不存在" };
                }
            }
        }
        #endregion

        string getStoreName(string store_no)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var caragent = db.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                if (caragent != null)
                {
                    return caragent.kc_agent_name;
                }
            };
            return "";
        }



        #region 消費模式2
        /// <summary>
        /// 消費模式2
        /// </summary>
        /// <param name="member_id">會員序號</param>
        /// <param name="store_id">店家序號</param>
        /// <param name="store_no">店家代號</param>
        /// <param name="item">商品名</param>
        /// <param name="price"></param>
        /// <param name="period"></param>
        /// <param name="pay"></param>
        /// <param name="order_no">訂單編號</param>
        /// <param name="member_no">會員編號</param>
        public ReturnMsg WriteOrder_Transaction_2_nonMember(int member_id, int store_id, string store_no,
                 string item, int price, int period, int pay, int pay_cash, string order_no, string loan_type, string order_type)
        {

            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                string store_name = kc_caragent == null ? "" : kc_caragent.kc_agent_name;

                string _cp_no = "";
                var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    if (member.kc_member_no == "" || member.kc_member_no == null) return new ReturnMsg() { success = false, msg = "會員編號不存在" + member.id };



                    if (order_type == "超額")
                    {
                        if (member.cp_no == "" || member.cp_no == null) return new ReturnMsg() { success = false, msg = "member.cp_no不存在" + member.id };
                        _cp_no = member.cp_no;
                    }
                    else
                    {
                        if (member.register_cp_no == "" || member.register_cp_no == null) return new ReturnMsg() { success = false, msg = "member.register_cp_no不存在" + member.id };
                        _cp_no = member.register_cp_no;
                    }

                    var cpdata = db2.kc_cpdata.Where(x => x.kc_cp_no == _cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        //審核狀態有值 案件已經過審理 不可再使用此案件購買註冊
                        if (!string.IsNullOrWhiteSpace(cpdata.kc_apply_stat)) return new ReturnMsg() { success = false, msg = "案件已結束" + member.id };

                        //cp以綁上訂單不可再綁
                        if (cpdata.kc_cash_price.HasValue && cpdata.kc_cash_price.Value > 0) return new ReturnMsg() { success = false, msg = "已有訂單" + member.id };

                        //kc_dealer_data = $"項目:{_order_type},希望的額度:{m.credit_amount}\n會員編號:{m.kc_member_no}",

                        cpdata.kc_dealer_data = cpdata.kc_dealer_data + $"\n訂單資訊:\n訂單編號:{order_no}\n店家:{store_no}/{store_name}\n品名:{item}\n利率專案:{loan_type}\n金額:{price}\n期數:{period}\n月付款:{pay}";
                        cpdata.kc_cash_price = price;
                        cpdata.kc_loan_type = loan_type;
                        cpdata.kc_loan_perd = (byte)period;
                        cpdata.kc_car_model = item;
                        cpdata.kc_proc_fee = 0;
                        cpdata.kc_collarcar_fee = 0;
                        cpdata.kc_brok_fee = 0;
                        cpdata.kc_strt_fee = 0;
                        //todo 註冊帶訂單 及 超額  店家
                        //cpdata.kc_comp_code = store_no;//店家碼                       
                        //cpdata.kc_sales_code = new DuDuPay.Controllers.MemberController().GetSalesCode(store_no);//店家
                        //cpdata.kc_area_code = new DuDuPay.Controllers.MemberController().GetAreaCode(store_no, member.mobile);//用店家代碼得area_code    

                    }
                    //(1)產生訂單
                    db.kc_merchanttrade.Add(new kc_merchanttrade()
                    {
                        kc_merchant_id = store_no,
                        kc_order_no = order_no,
                        kc_item_desc = item,
                        kc_loan_amt = price,
                        kc_loan_perd = period,
                        kc_perd_fee = pay,
                        kc_time_stamp = DateTimeOffset.Now.ToOffset(new TimeSpan(8, 0, 0)).AddSeconds(+90).ToUnixTimeSeconds().ToString(),
                        kc_client_ip = new Common().ConvertIPToLong(new Common().GetIp()),
                        kc_trade_status = order_type == "註冊帶訂單" || order_type == "超額" ? "9" : "0",//9送件中; 0待確認
                        kc_cp_no = _cp_no,
                        CreatePerson = "",
                        CreateDate = DateTime.Now,
                        kc_updt_user = "",
                        kc_updt_date = DateTime.Now,
                        member_no = member.kc_member_no,
                        cust_type = "2",//消費模式       
                        kc_give_amt = pay_cash,
                        loan_type = loan_type,//利率方案
                        kc_file_upload_num = 3,
                        kc_order_type = order_type

                    });


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
                        new Common().WriteErrorLog(0, "自訂QR-" + order_type, "系統錯誤" + ex.Message, member_id, null, null, null, null);
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = ex.Message
                        };
                    }

                    return new ReturnMsg() { success = true };
                }
                else
                {
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在"
                    };
                }




            }
        }
        #endregion


        public Object CloseTime(int member_id, string time)
        {
            try
            {
                Layout.Cart cart;
                using (var db = new kcsddb2Entities_new())
                {
                    cart = new Layout.Cart
                    {
                        success = true,
                        groups = db.z_Cart.AsNoTracking()
                            .Where(x => x.member_id == member_id && x.cust_confirm != "*")
                            .GroupBy(x => x.dealer_id).ToList()
                            .Select(g => new Layout.CartGroup
                            {
                                dealer_id = g.Key.Value,
                                cars = g.Select(x => new Layout.car
                                {
                                    product_id = x.product_id.Value,
                                    store_no = x.store_no,
                                    dealer_id = x.dealer_id.Value,
                                    item = x.item,
                                    //item_spec = x.item_spec,
                                    item_spec = JsonConvert.DeserializeObject<Layout.Product_spec>(x.item_spec),
                                    dealer_name = x.dealer_name,
                                    ProducBase64 = new DealerDA().GetProductImageOneBase64(x.store_no, x.product_id.Value),
                                    buy_qty = x.buy_qty.Value,
                                    cash = x.cash.Value,
                                    cust_check = x.cust_check == "*" ? true : false,
                                    car_id = x.car_id

                                }).ToList()
                            }).ToList()
                    };

                }

                using (var db = new kcsddb2Entities_new())
                {
                    var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                    if (member != null)
                    {
                        member.connection_time = time;
                        db.z_Member.Attach(member);
                        db.Entry(member).State = System.Data.Entity.EntityState.Modified;


                        var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.cp_no).FirstOrDefault();
                        if (cpdata != null)
                        {
                            cpdata.kc_further_date3 = new Common().ComptoTime(time);//可連絡時間                        
                            db.kc_cpdata.Attach(cpdata);
                            db.Entry(cpdata).State = System.Data.Entity.EntityState.Modified;

                            db.SaveChanges();
                        }
                    }

                }

                return new { success = true, cart = cart };
            }
            catch (Exception ex)
            {
                return new { success = false, msg = ex.Message };
            }

        }

        #region 消費模式3       
        public ReturnMsg WriteOrder_Transaction_3_nonMember(int member_id, int store_id, string store_no,
               string item, int price, int period, int pay, string order_no, int kc_give_amt, string loan_type, string order_type)
        {

            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {

                var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                string store_name = kc_caragent == null ? "" : kc_caragent.kc_agent_name;

                string _cp_no = "";
                var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    if (member.kc_member_no == "" || member.kc_member_no == null) return new ReturnMsg() { success = false, msg = "會員編號不存在" + member.id };

                    if (order_type == "超額")
                    {
                        if (member.cp_no == "" || member.cp_no == null) return new ReturnMsg() { success = false, msg = "member.cp_no不存在" + member.id };
                        _cp_no = member.cp_no;
                    }
                    else
                    {
                        if (member.register_cp_no == "" || member.register_cp_no == null) return new ReturnMsg() { success = false, msg = "member.register_cp_no不存在" + member.id };
                        _cp_no = member.register_cp_no;
                    }



                    var cpdata = db2.kc_cpdata.Where(x => x.kc_cp_no == _cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        //審核狀態有值 案件已經過審理 不可再使用此案件購買註冊
                        if (!string.IsNullOrWhiteSpace(cpdata.kc_apply_stat)) return new ReturnMsg() { success = false, msg = "案件已結束" + member.id };

                        //cp以綁上訂單不可再綁
                        if (cpdata.kc_cash_price.HasValue && cpdata.kc_cash_price.Value > 0) return new ReturnMsg() { success = false, msg = "已有訂單" + member.id };

                        cpdata.kc_dealer_data = cpdata.kc_dealer_data + $"\n訂單資訊:\n訂單編號:{order_no}\n店家:{store_no}/{store_name}\n品名:{item}\n利率專案:{loan_type}\n金額:{price}\n期數:{period}\n月付款:{pay}";
                        cpdata.kc_cash_price = price;
                        cpdata.kc_loan_type = loan_type;
                        cpdata.kc_loan_perd = (byte)period;
                        cpdata.kc_car_model = item;
                        cpdata.kc_proc_fee = 0;
                        cpdata.kc_collarcar_fee = 0;
                        cpdata.kc_brok_fee = 0;
                        cpdata.kc_strt_fee = 0;
                        //todo 註冊帶訂單 及 超額  回寫
                        //cpdata.kc_comp_code = store_no;//店家碼                       
                        //cpdata.kc_sales_code = new DuDuPay.Controllers.MemberController().GetSalesCode(store_no);//店家
                        //cpdata.kc_area_code = new DuDuPay.Controllers.MemberController().GetAreaCode(store_no, member.mobile);//用店家代碼得area_code     
                    }

                    //產生訂單
                    db.kc_merchanttrade.Add(new kc_merchanttrade()
                    {

                        kc_merchant_id = store_no,
                        kc_order_no = order_no,
                        kc_item_desc = item,
                        kc_loan_amt = price,
                        kc_loan_perd = period,
                        kc_perd_fee = pay,
                        kc_time_stamp = DateTimeOffset.Now.ToOffset(new TimeSpan(8, 0, 0)).AddSeconds(+90).ToUnixTimeSeconds().ToString(),
                        kc_client_ip = new Common().ConvertIPToLong(new Common().GetIp()),
                        kc_trade_status = order_type == "註冊帶訂單" || order_type == "超額" ? "9" : "0",//9送件中; 0待確認
                        kc_cp_no = _cp_no,
                        CreatePerson = "",
                        CreateDate = DateTime.Now,
                        kc_updt_user = "",
                        kc_updt_date = DateTime.Now,
                        member_no = member.kc_member_no,
                        cust_type = "3",//消費模式                      
                        kc_give_amt = kc_give_amt,
                        loan_type = loan_type,//利率方案
                        kc_file_upload_num = 3,
                        kc_order_type = order_type
                    });

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
                        new Common().WriteErrorLog(0, "店家QR-" + order_type, "系統錯誤" + ex.Message, member_id, null, null, null, null);
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = ex.Message
                        };
                    }

                    return new ReturnMsg() { success = true };

                }
                else
                {
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在"
                    };
                }





            }

        }
        #endregion




        #region 消費模式 api
        /// <summary>
        /// 消費模式2
        /// </summary>
        /// <param name="member_id">會員序號</param>
        /// <param name="store_id">店家序號</param>
        /// <param name="store_no">店家代號</param>
        /// <param name="item">商品名</param>
        /// <param name="item_list">明細</param>
        /// <param name="total_cash">總金額</param>
        /// <param name="period"></param>
        /// <param name="pay">期付</param>        
        /// <param name="order_no">訂單編號</param>
        /// <param name="member_no">會員編號</param>
        public ReturnMsg WriteOrder_Transaction_api_nonMember(int member_id, int store_id, string store_no,
                 string item, string item_list, int total_cash, int period, int pay, string order_no, string loan_type, string nonce, string return_url, int auto_pay, string order_type)
        {

            //(1)write log
            z_Member mer;
            string _member_no = "";
            using (var db = new kcsddb2Entities_new())
            {
                mer = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (mer != null) _member_no = mer.kc_member_no;
            }
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, _member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudupay api 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, _member_no, null);
                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {

                var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                string store_name = kc_caragent == null ? "" : kc_caragent.kc_agent_name;

                string _cp_no = "";
                var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    if (member.kc_member_no == "" || member.kc_member_no == null) return new ReturnMsg() { success = false, msg = "會員編號不存在" + member.id };

                    if (order_type == "超額")
                    {
                        if (member.cp_no == "" || member.cp_no == null) return new ReturnMsg() { success = false, msg = "member.cp_no不存在" + member.id };
                        _cp_no = member.cp_no;
                    }
                    else
                    {
                        if (member.register_cp_no == "" || member.register_cp_no == null) return new ReturnMsg() { success = false, msg = "member.register_cp_no不存在" + member.id };
                        _cp_no = member.register_cp_no;
                    }

                    var cpdata = db2.kc_cpdata.Where(x => x.kc_cp_no == _cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        //審核狀態有值 案件已經過審理 不可再使用此案件購買註冊
                        if (!string.IsNullOrWhiteSpace(cpdata.kc_apply_stat)) return new ReturnMsg() { success = false, msg = "案件已結束" + member.id };

                        //cp以綁上訂單不可再綁
                        if (cpdata.kc_cash_price.HasValue && cpdata.kc_cash_price.Value > 0) return new ReturnMsg() { success = false, msg = "已有訂單" + member.id };

                        cpdata.kc_dealer_data = cpdata.kc_dealer_data + $"\n訂單資訊:\n訂單編號:{order_no}\n店家:{store_no}/{store_name}\n品名:{item}\n利率專案:{loan_type}\n金額:{total_cash}\n期數:{period}\n月付款:{pay}";
                        cpdata.kc_cash_price = total_cash;
                        cpdata.kc_loan_type = loan_type;
                        cpdata.kc_loan_perd = (byte)period;
                        cpdata.kc_car_model = item;
                        cpdata.kc_proc_fee = 0;
                        cpdata.kc_collarcar_fee = 0;
                        cpdata.kc_brok_fee = 0;
                        cpdata.kc_strt_fee = 0;
                        //todo 註冊帶訂單 及 超額  回寫
                        //cpdata.kc_comp_code = store_no;//店家碼                       
                        //cpdata.kc_sales_code = new DuDuPay.Controllers.MemberController().GetSalesCode(store_no);//店家
                        //cpdata.kc_area_code = new DuDuPay.Controllers.MemberController().GetAreaCode(store_no, member.mobile);//用店家代碼得area_code      
                    }

                    //(1)產生訂單
                    db.kc_merchanttrade.Add(new kc_merchanttrade()
                    {
                        kc_merchant_id = store_no,
                        kc_order_no = order_no,
                        kc_item_desc = item,
                        kc_loan_amt = total_cash,
                        kc_loan_perd = period,
                        kc_perd_fee = pay,
                        kc_time_stamp = DateTimeOffset.Now.ToOffset(new TimeSpan(8, 0, 0)).AddSeconds(+90).ToUnixTimeSeconds().ToString(),
                        kc_client_ip = new Common().ConvertIPToLong(new Common().GetIp()),
                        kc_trade_status = order_type == "註冊帶訂單" || order_type == "超額" ? "9" : "0",//9送件中; 0待確認
                        kc_cp_no = _cp_no,
                        CreatePerson = "",
                        CreateDate = DateTime.Now,
                        kc_updt_user = "",
                        kc_updt_date = DateTime.Now,
                        member_no = member.kc_member_no,
                        cust_type = "4",//消費模式 api      
                        kc_give_amt = give_amt,// pay_cash,
                        loan_type = loan_type,//利率方案
                        kc_item_desc_list = item_list,//明細
                        kc_dealer_api_nonce = nonce,
                        kc_dealer_api_return_url = return_url,
                        kc_auto_pay = auto_pay,
                        kc_file_upload_num = 3,
                        kc_order_type = order_type

                    });

                    //-------test
                    //int orderLog_id = (int)returnMsg.value;
                    ////    //call 冠api
                    //OrderMessage ApiMessage = new OrderDA().Api_SendOrder(member.kc_member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type, order_no, give_amt);
                    //if (!ApiMessage.success)
                    //{
                    //    returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                    //    if (!returnMsg.success) return returnMsg;

                    //    return new ReturnMsg()
                    //    {
                    //        success = false,
                    //        msg = ApiMessage.msg
                    //    };
                    //}

                    //------
                    //(3)自動撥款 帶訂單的消費不可能自動撥款 只會在OrderDA 
                    //這裡只是做測試用
                    ////if (auto_pay == 1)
                    ////{                
                    //    int orderLog_id = (int)returnMsg.value;
                    //    //call 冠api
                    //    OrderMessage ApiMessage = new OrderDA().Api_SendOrder(member.kc_member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type);
                    //    if (!ApiMessage.success)
                    //    {
                    //        returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                    //        if (!returnMsg.success) return returnMsg;

                    //        return new ReturnMsg()
                    //        {
                    //            success = false,
                    //            msg = ApiMessage.msg
                    //        };
                    //    }

                    //    //(2)回寫客編及交易狀態
                    //    string case_no = ApiMessage.orderData.kc_case_no;
                    //    new OrderDA().Api_UpdateStatus(db, db2, order_no, case_no, ApiMessage.url);

                    //    //(3)更新此會員是否有被推薦
                    //    returnMsg = new CmsApiDA().MemberPush(db2, member_no, store_no);
                    //    if (!returnMsg.success) return returnMsg;

                    ////}
                    ///

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
                        new Common().WriteErrorLog(0, "dudupay api 下單" + order_type, "系統錯誤" + ex.Message, member_id, null, null, null, null);
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = ex.Message
                        };
                    }

                    return new ReturnMsg() { success = true, value = give_amt };
                }
                else
                {
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在"
                    };
                }





            }


        }
        #endregion


        #region 消費模式 dudu購買
        /// <summary>
        /// 消費模式 dudu購買
        /// </summary>
        /// <param name="member_id">會員序號</param>
        /// <param name="store_id">店家序號</param>
        /// <param name="store_no">店家代號</param>
        /// <param name="item">商品名</param>
        /// <param name="item_list">明細</param>
        /// <param name="total_cash">總金額</param>
        /// <param name="period"></param>
        /// <param name="pay">期付</param>        
        /// <param name="order_no">訂單編號</param>
        /// <param name="member_no">會員編號</param>
        public ReturnMsg WriteOrder_Transaction_purchase_nonMember(int member_id, int store_id, string store_no,
                 string item, int total_cash, int period, int pay, string order_no, string loan_type, string order_type,
                 int product_id, string item_spec, int send_type, string home_name, string home_mobile, string home_mark, string car_name, string car_mobile, string car_address, string car_mark)
        {

            //(1)write log
            z_Member mer;
            string _member_no = "";
            using (var db = new kcsddb2Entities_new())
            {
                mer = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (mer != null) _member_no = mer.kc_member_no;
            }
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, _member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, _member_no, null);
                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {

                var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                string store_name = kc_caragent == null ? "" : kc_caragent.kc_agent_name;

                string _cp_no = "";
                var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    if (member.kc_member_no == "" || member.kc_member_no == null) return new ReturnMsg() { success = false, msg = "會員編號不存在" + member.id };
                    if (order_type == "超額")
                    {
                        if (member.cp_no == "" || member.cp_no == null) return new ReturnMsg() { success = false, msg = "member.cp_no不存在" + member.id };
                        _cp_no = member.cp_no;
                    }
                    else
                    {
                        if (member.register_cp_no == "" || member.register_cp_no == null) return new ReturnMsg() { success = false, msg = "member.register_cp_no不存在" + member.id };
                        _cp_no = member.register_cp_no;
                    }

                    var cpdata = db2.kc_cpdata.Where(x => x.kc_cp_no == _cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        cpdata.kc_dealer_data = cpdata.kc_dealer_data + $"\n訂單資訊:\n訂單編號:{order_no}\n店家:{store_no}/{store_name}\n品名:{item}\n利率專案:{loan_type}\n金額:{total_cash}\n期數:{period}\n月付款:{pay}";
                        cpdata.kc_cash_price = total_cash;
                        cpdata.kc_loan_type = loan_type;
                        cpdata.kc_loan_perd = (byte)period;
                        cpdata.kc_car_model = item;
                        cpdata.kc_proc_fee = 0;
                        cpdata.kc_collarcar_fee = 0;
                        cpdata.kc_brok_fee = 0;
                        cpdata.kc_strt_fee = 0;
                        //todo 註冊帶訂單 及 超額  回寫
                        //cpdata.kc_comp_code = store_no;//店家碼                       
                        //cpdata.kc_sales_code = new DuDuPay.Controllers.MemberController().GetSalesCode(store_no);//店家
                        //cpdata.kc_area_code = new DuDuPay.Controllers.MemberController().GetAreaCode(store_no, member.mobile);//用店家代碼得area_code     
                    }

                    //(1)產生訂單
                    db.kc_merchanttrade.Add(new kc_merchanttrade()
                    {
                        kc_merchant_id = store_no,
                        kc_order_no = order_no,
                        kc_item_desc = item,
                        kc_loan_amt = total_cash,
                        kc_loan_perd = period,
                        kc_perd_fee = pay,
                        kc_time_stamp = DateTimeOffset.Now.ToOffset(new TimeSpan(8, 0, 0)).AddSeconds(+90).ToUnixTimeSeconds().ToString(),
                        kc_client_ip = new Common().ConvertIPToLong(new Common().GetIp()),
                        kc_trade_status = order_type == "註冊帶訂單" || order_type == "超額" ? "9" : "0",//9送件中; 0待確認
                        kc_cp_no = _cp_no,
                        CreatePerson = "",
                        CreateDate = DateTime.Now,
                        kc_updt_user = "",
                        kc_updt_date = DateTime.Now,
                        member_no = member.kc_member_no,
                        cust_type = "5",//消費模式 dudu購買     
                        kc_give_amt = give_amt,// pay_cash,
                        loan_type = loan_type,//利率方案
                        //kc_item_desc_list = item_list,//明細
                        //kc_dealer_api_nonce = nonce,
                        //kc_dealer_api_return_url = return_url,
                        //kc_auto_pay = auto_pay,
                        kc_file_upload_num = 3,
                        kc_order_type = order_type,
                        product_id = product_id,
                        item_spec = item_spec,
                        send_type = send_type,
                        home_name = home_name,
                        home_mobile = home_mobile,
                        home_mark = home_mark,
                        car_name = car_name,
                        car_mobile = car_mobile,
                        car_address = car_address,
                        car_mark = car_mark

                    });

                    //(2)減少庫存數
                    var product = db2.z_Product.Where(x => x.product_id == product_id).FirstOrDefault();
                    if (product != null)
                    {
                        if (product.product_spec != null && product.product_spec != "")
                        {
                            var product_spec = JsonConvert.DeserializeObject<List<Layout.Product_spec>>(product.product_spec);
                            var spec = product_spec.Where(x => x.name == item_spec).FirstOrDefault();
                            if (spec != null)
                            {
                                spec.qty = spec.qty > 0 ? spec.qty - 1 : 0;

                                product.product_spec = JsonConvert.SerializeObject(product_spec);
                                db2.z_Product.Attach(product);
                                db2.Entry(product).State = System.Data.Entity.EntityState.Modified;
                            }
                        }

                    }

                    //(3)自動撥款 帶訂單的消費不可能自動撥款 只會在OrderDA 
                    //這裡只是做測試用
                    ////if (auto_pay == 1)
                    ////{                
                    //    int orderLog_id = (int)returnMsg.value;
                    //    //call 冠api
                    //    OrderMessage ApiMessage = new OrderDA().Api_SendOrder(member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type);
                    //    if (!ApiMessage.success)
                    //    {
                    //        returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                    //        if (!returnMsg.success) return returnMsg;

                    //        return new ReturnMsg()
                    //        {
                    //            success = false,
                    //            msg = ApiMessage.msg
                    //        };
                    //    }

                    //    //(2)回寫客編及交易狀態
                    //    string case_no = ApiMessage.orderData.kc_case_no;
                    //    new OrderDA().Api_UpdateStatus(db, db2, order_no, case_no, ApiMessage.url);

                    //    //(3)更新此會員是否有被推薦
                    //    returnMsg = new CmsApiDA().MemberPush(db2, member_no, store_no);
                    //    if (!returnMsg.success) return returnMsg;

                    ////}
                    ///

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
                        new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "系統錯誤" + ex.Message, member_id, null, null, null, null);
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = ex.Message
                        };
                    }

                    return new ReturnMsg() { success = true, value = give_amt };
                }
                else
                {
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在"
                    };
                }
            }

        }


        /// <summary>
        /// 消費模式 dudu購買
        /// </summary>
        /// <param name="member_id">會員序號</param>
        /// <param name="store_id">店家序號</param>
        /// <param name="store_no">店家代號</param>
        /// <param name="item">商品名</param>
        /// <param name="item_list">明細</param>
        /// <param name="total_cash">總金額</param>
        /// <param name="period"></param>
        /// <param name="pay">期付</param>        
        /// <param name="order_no">訂單編號</param>
        /// <param name="member_no">會員編號</param>
        public ReturnMsg WriteOrder_Transaction_purchase_nonMember_2(int member_id, int store_id, string store_no,
                 string item, int total_cash, int period, int pay, string order_no, string loan_type, string order_type,
                 int product_id, string item_spec, string item_list, int shipping_fee)
        {

            //(1)write log
            z_Member mer;
            string _member_no = "";
            using (var db = new kcsddb2Entities_new())
            {
                mer = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (mer != null) _member_no = mer.kc_member_no;
            }
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, _member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, _member_no, null);
                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {

                var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                string store_name = kc_caragent == null ? "" : kc_caragent.kc_agent_name;

                string _cp_no = "";
                var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    if (member.kc_member_no == "" || member.kc_member_no == null) return new ReturnMsg() { success = false, msg = "會員編號不存在" + member.id };
                    if (order_type == "超額")
                    {
                        if (member.cp_no == "" || member.cp_no == null) return new ReturnMsg() { success = false, msg = "member.cp_no不存在" + member.id };
                        _cp_no = member.cp_no;
                    }
                    else
                    {
                        if (member.register_cp_no == "" || member.register_cp_no == null) return new ReturnMsg() { success = false, msg = "member.register_cp_no不存在" + member.id };
                        _cp_no = member.register_cp_no;
                    }

                    List<Layout.itemList> list = JsonConvert.DeserializeObject<List<Layout.itemList>>(item_list);
                    var detailStr = string.Join("\n", list.Select(x =>
                           $"品項:{x.item} / 數量:{x.buy_qty} / 單價:{x.cash}"
                       ));

                    var cpdata = db2.kc_cpdata.Where(x => x.kc_cp_no == _cp_no).FirstOrDefault();

                    if (cpdata == null) return new ReturnMsg() { success = false, msg = "案件異常" + member.id };

                    //審核狀態有值 案件已經過審理 不可再使用此案件購買註冊
                    if (!string.IsNullOrWhiteSpace(cpdata.kc_apply_stat)) return new ReturnMsg() { success = false, msg = "案件已結束" + member.id };

                    //cp以綁上訂單不可再綁
                    if (cpdata.kc_cash_price.HasValue && cpdata.kc_cash_price.Value > 0) return new ReturnMsg() { success = false, msg = "已有訂單" + member.id };
                    

                    
                    cpdata.kc_dealer_data = cpdata.kc_dealer_data + $"\n訂單資訊:\n訂單編號:{order_no}\n店家:{store_no}/{store_name}\n品名:{item}\n明細:\n{detailStr}\n利率專案:{loan_type}\n金額:{total_cash}\n期數:{period}\n月付款:{pay}";
                    cpdata.kc_cash_price = total_cash;
                    cpdata.kc_loan_type = loan_type;
                    cpdata.kc_loan_perd = (byte)period;
                    cpdata.kc_car_model = item;
                    cpdata.kc_proc_fee = 0;
                    cpdata.kc_collarcar_fee = 0;
                    cpdata.kc_brok_fee = 0;
                    cpdata.kc_strt_fee = 0;
                    cpdata.kc_membertarget_type = cpdata.kc_membertarget_type == "A" ? "E" : cpdata.kc_membertarget_type;//一般註冊如果買東西 會轉成購買註冊
                    //todo 註冊帶訂單 及 超額  回寫
                    //cpdata.kc_comp_code = store_no;//店家碼                       
                    //cpdata.kc_sales_code = new DuDuPay.Controllers.MemberController().GetSalesCode(store_no);//店家
                    //cpdata.kc_area_code = new DuDuPay.Controllers.MemberController().GetAreaCode(store_no, member.mobile);//用店家代碼得area_code     




                    var _car_id = list[0].car_id;
                    var cart = db2.z_Cart.Where(x => x.car_id == _car_id).FirstOrDefault();

                    //(1)產生訂單
                    db.kc_merchanttrade.Add(new kc_merchanttrade()
                    {
                        kc_merchant_id = store_no,
                        kc_order_no = order_no,
                        kc_item_desc = item,
                        kc_loan_amt = total_cash,
                        kc_loan_perd = period,
                        kc_perd_fee = pay,
                        kc_time_stamp = DateTimeOffset.Now.ToOffset(new TimeSpan(8, 0, 0)).AddSeconds(+90).ToUnixTimeSeconds().ToString(),
                        kc_client_ip = new Common().ConvertIPToLong(new Common().GetIp()),
                        kc_trade_status = order_type == "註冊帶訂單" || order_type == "超額" ? "9" : "0",//9送件中; 0待確認
                        kc_cp_no = _cp_no,
                        CreatePerson = "",
                        CreateDate = DateTime.Now,
                        kc_updt_user = "",
                        kc_updt_date = DateTime.Now,
                        member_no = member.kc_member_no,
                        cust_type = "5",//消費模式 dudu購買     
                        kc_give_amt = give_amt,// pay_cash,
                        loan_type = loan_type,//利率方案
                        //kc_item_desc_list = item_list,//明細
                        //kc_dealer_api_nonce = nonce,
                        //kc_dealer_api_return_url = return_url,
                        //kc_auto_pay = auto_pay,
                        kc_file_upload_num = 3,
                        kc_order_type = order_type,
                        product_id = product_id,
                        item_spec = item_spec,
                        send_type = cart.send_type,
                        home_name = cart.home_name,
                        home_mobile = cart.home_mobile,
                        home_mark = cart.home_mark,
                        car_name = cart.car_name,
                        car_mobile = cart.car_mobile,
                        car_address = cart.car_address,
                        car_mark = cart.car_mark,
                        item_list = item_list,
                        shipping_fee = shipping_fee

                    });

                    //(2)減少庫存數
                    foreach (var tt in list)
                    {
                        z_Cart _cart = db2.z_Cart.Where(x => x.car_id == tt.car_id).ToList().Select(x => new z_Cart()
                        {
                            car_id = x.car_id,
                            product_id = x.product_id,
                            item_spec = x.item_spec,// = JsonConvert.DeserializeObject<Layout.Product_spec>(x.item_spec),                           
                        }).FirstOrDefault();

                        Layout.Product_spec _item_spec = JsonConvert.DeserializeObject<Layout.Product_spec>(_cart.item_spec);

                        var product = db2.z_Product.Where(x => x.product_id == _cart.product_id).FirstOrDefault();
                        if (product != null)
                        {
                            if (product.product_spec != null && product.product_spec != "")
                            {
                                var product_spec = JsonConvert.DeserializeObject<List<Layout.Product_spec>>(product.product_spec);
                                var spec = product_spec.Where(x => x.name == _item_spec.name).FirstOrDefault();
                                if (spec != null)
                                {
                                    if (spec.qty < tt.buy_qty) return new ReturnMsg()
                                    {
                                        success = false,
                                        msg = "庫存數不足：" + _item_spec.name + "購買數" + tt.buy_qty + "庫存數：" + spec.qty
                                    };
                                    //spec.qty = spec.qty > 0 ? spec.qty - 1 : 0;
                                    product.product_spec = JsonConvert.SerializeObject(product_spec);
                                    db2.z_Product.Attach(product);
                                    db2.Entry(product).State = System.Data.Entity.EntityState.Modified;


                                    if (_cart != null)
                                    {
                                        z_Cart car = db2.z_Cart.FirstOrDefault(x => x.car_id == tt.car_id);
                                        if (car != null) cart.cust_confirm = "*";
                                        db2.z_Cart.Attach(car);
                                        db2.Entry(car).State = System.Data.Entity.EntityState.Modified;
                                    }

                                }
                                else
                                {
                                    return new ReturnMsg()
                                    {
                                        success = false,
                                        msg = "沒有此規格商品" + store_no + _item_spec.name
                                    };
                                }
                            }


                        }

                    }

                    //var product = db2.z_Product.Where(x => x.product_id == product_id).FirstOrDefault();
                    //if (product != null)
                    //{
                    //    if (product.product_spec != null && product.product_spec != "")
                    //    {
                    //        var product_spec = JsonConvert.DeserializeObject<List<Layout.Product_spec>>(product.product_spec);
                    //        var spec = product_spec.Where(x => x.name == item_spec).FirstOrDefault();
                    //        if (spec != null)
                    //        {
                    //            spec.qty = spec.qty > 0 ? spec.qty - 1 : 0;

                    //            product.product_spec = JsonConvert.SerializeObject(product_spec);
                    //            db2.z_Product.Attach(product);
                    //            db2.Entry(product).State = System.Data.Entity.EntityState.Modified;
                    //        }
                    //    }

                    //}

                    //(3)自動撥款 帶訂單的消費不可能自動撥款 只會在OrderDA 
                    //這裡只是做測試用
                    ////if (auto_pay == 1)
                    ////{                
                    //    int orderLog_id = (int)returnMsg.value;
                    //    //call 冠api
                    //    OrderMessage ApiMessage = new OrderDA().Api_SendOrder(member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type);
                    //    if (!ApiMessage.success)
                    //    {
                    //        returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                    //        if (!returnMsg.success) return returnMsg;

                    //        return new ReturnMsg()
                    //        {
                    //            success = false,
                    //            msg = ApiMessage.msg
                    //        };
                    //    }

                    //    //(2)回寫客編及交易狀態
                    //    string case_no = ApiMessage.orderData.kc_case_no;
                    //    new OrderDA().Api_UpdateStatus(db, db2, order_no, case_no, ApiMessage.url);

                    //    //(3)更新此會員是否有被推薦
                    //    returnMsg = new CmsApiDA().MemberPush(db2, member_no, store_no);
                    //    if (!returnMsg.success) return returnMsg;

                    ////}
                    ///

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
                        new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "系統錯誤" + ex.Message, member_id, null, null, null, null);
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = ex.Message
                        };
                    }

                    return new ReturnMsg() { success = true, value = give_amt };
                }
                else
                {
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = "會員序號不存在"
                    };
                }
            }

        }
        #endregion



    }







}