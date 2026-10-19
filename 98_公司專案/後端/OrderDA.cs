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


    public class OrderDA
    {


        //取得解密 code time and check type code
        public string GetCodeTime(string store_id, int type_code)
        {
            int id = int.Parse(store_id);
            using (var db = new kcsddb2Entities_new())
            {
                var store = db.z_Store.Where(x => x.id == id && x.type_code == type_code && x.del_flag != "*").FirstOrDefault();
                if (store != null)
                    return store.code_time;
                else
                    return string.Empty;
            };

        }


        //取得會員編號
        string getMemberNo(int member_id)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    return member.kc_member_no;
                }
                return "";
            };
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
        public ReturnMsg WriteOrder_Transaction_2(int member_id, int store_id, string store_no,
                 string item, int price, int period, int pay, int pay_cash, string order_no, string member_no, string loan_type)
        {



            using (var db = new duducmsEntities())
            //using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            //using (var transaction2 = db2.Database.BeginTransaction())
            {

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
                    kc_trade_status = "0",//綜合 待確認
                    CreatePerson = "",
                    CreateDate = DateTime.Now,
                    kc_updt_user = "",
                    kc_updt_date = DateTime.Now,
                    member_no = member_no,
                    cust_type = "2",//消費模式       
                    kc_give_amt = pay_cash,
                    loan_type = loan_type,//利率方案
                    kc_file_upload_num = 3,
                    kc_order_type = "綜合"

                });

                try
                {
                    db.SaveChanges();
                    //db2.SaveChanges();
                    transaction1.Commit();
                    //transaction2.Commit();
                }
                catch (Exception ex)
                {
                    transaction1.Rollback();
                    new Common().WriteErrorLog(0, "自訂QR", "系統錯誤" + ex.Message + member_no, member_id, null, null, null, null);
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message + member_no
                    };
                }

                return new ReturnMsg() { success = true };


            }


        }


        #endregion

        #region GetOrder
        public Layout.ReturnMsg GetOrder(string store_no, string order_no)
        {
            using (var db = new duducmsEntities())
            {
                var kc_merchanttrade = db.kc_merchanttrade.Where(x => x.kc_merchant_id == store_no && x.kc_order_no == order_no).FirstOrDefault();
                if (kc_merchanttrade != null)
                {
                    return new Layout.ReturnMsg()
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
                            order_no,
                            kc_merchanttrade.product_id,
                            item_list = kc_merchanttrade.item_list != "" && kc_merchanttrade.item_list != null ? JsonConvert.DeserializeObject<List<Layout.itemList>>(kc_merchanttrade.item_list) : null,
                            kc_merchanttrade.shipping_fee,
                        }
                    };
                }
                else
                {
                    return new Layout.ReturnMsg() { success = false, msg = "訂單不存在" };
                }
            }
        }
        public Layout.ReturnMsg GetOrderWithPurchase(string store_no, string order_no, int member_id)
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




            using (var db = new duducmsEntities())
            {
                var kc_merchanttrade = db.kc_merchanttrade.Where(x => x.kc_merchant_id == store_no && x.kc_order_no == order_no).FirstOrDefault();
                if (kc_merchanttrade != null)
                {
                    return new Layout.ReturnMsg()
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
                            order_no,
                            kc_merchanttrade.product_id,
                            item_list = kc_merchanttrade.item_list != "" && kc_merchanttrade.item_list != null ? JsonConvert.DeserializeObject<List<Layout.itemList>>(kc_merchanttrade.item_list) : null,
                            kc_merchanttrade.shipping_fee,
                            cart = cart
                        },

                    };
                }
                else
                {
                    return new Layout.ReturnMsg() { success = false, msg = "訂單不存在" };
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

        #region 消費模式3
        /// <summary>
        /// 消費模式3
        /// </summary>
        /// <param name="member_id"></param>
        /// <param name="store_id"></param>
        /// <param name="store_no"></param>
        /// <param name="item"></param>
        /// <param name="price"></param>
        /// <param name="period"></param>
        /// <param name="pay"></param>
        /// <param name="order_no"></param>
        /// <param name="member_no"></param>
        /// <returns></returns>
        public ReturnMsg WriteOrder_Transaction_3(int member_id, int store_id, string store_no,
               string item, int price, int period, int pay, string order_no, string member_no, int kc_give_amt, string loan_type)
        {
            using (var db = new duducmsEntities())
            //using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            //using (var transaction2 = db2.Database.BeginTransaction())
            {
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
                    kc_trade_status = "0",//待確認
                    CreatePerson = "",
                    CreateDate = DateTime.Now,
                    kc_updt_user = "",
                    kc_updt_date = DateTime.Now,
                    member_no = member_no,
                    cust_type = "3",//消費模式                      
                    kc_give_amt = kc_give_amt,
                    loan_type = loan_type,//利率方案
                    kc_file_upload_num = 3,
                    kc_order_type = "綜合"
                });

                try
                {
                    db.SaveChanges();
                    transaction1.Commit();

                }
                catch (Exception ex)
                {
                    transaction1.Rollback();
                    new Common().WriteErrorLog(0, "店家QR", "系統錯誤" + ex.Message + member_no, member_id, null, null, null, null);
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message + member_no
                    };
                }

                return new ReturnMsg() { success = true };


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
        public ReturnMsg WriteOrder_Transaction_api(int member_id, int store_id, string store_no,
                 string item, string item_list, int total_cash, int period, int pay, string order_no, string member_no, string loan_type, string nonce, string return_url, int auto_pay, string order_type)
        {

            //(1)write log
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudupay api 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, member_no, null);
                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                //string _cp_no = "";
                //var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                //if (member != null)
                //{
                //    _cp_no = member.register_cp_no;
                //}

                kc_merchanttrade kc_merchanttrade = new kc_merchanttrade()
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
                    //kc_cp_no = _cp_no,
                    CreatePerson = "",
                    CreateDate = DateTime.Now,
                    kc_updt_user = "",
                    kc_updt_date = DateTime.Now,
                    member_no = member_no,
                    cust_type = "4",//消費模式 api      
                    kc_give_amt = give_amt,// pay_cash,
                    loan_type = loan_type,//利率方案
                    kc_item_desc_list = item_list,//明細
                    kc_dealer_api_nonce = nonce,
                    kc_dealer_api_return_url = return_url,
                    kc_auto_pay = auto_pay,
                    kc_file_upload_num = 3,
                    kc_order_type = order_type

                };



                //註冊帶訂單 超額 都還在徵審 無法自動撥款               
                //(3)自動撥款(因分期徵審無法自動撥款 先mark)
                if ((order_type == "綜合" || order_type == "足額") && auto_pay == 1)
                {
                    var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                    if (kc_caragent != null)
                    {
                        if (kc_caragent.kc_duduautogive_type == "Y")//自動撥款啟用
                        {
                            int orderLog_id = (int)returnMsg.value;
                            //call 冠api
                            OrderMessage ApiMessage = Api_SendOrder(member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type, order_no, give_amt);
                            if (!ApiMessage.success)
                            {
                                returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                                if (!returnMsg.success)
                                {
                                    new Common().WriteErrorLog(0, "DUDU API 自動撥款", returnMsg.msg, member_id, null, null, member_no, null);
                                    return returnMsg;
                                }

                                new Common().WriteErrorLog(0, "DUDU API 自動撥款", "呼叫分期 API 回傳錯誤：" + ApiMessage.msg, member_id, null, null, member_no, null);
                                return new ReturnMsg() { success = false, msg = ApiMessage.msg };
                            }

                            //(2)回寫客編及交易狀態
                            string case_no = ApiMessage.orderData.kc_case_no;
                            kc_merchanttrade.kc_case_no = case_no;//回寫客編
                            kc_merchanttrade.kc_trade_status = "3";//更新交易狀熊

                            returnMsg = Api_UpdateStatus(db2, order_no, case_no, ApiMessage.url);
                            if (!returnMsg.success) return returnMsg;
                        }
                        else
                        {
                            new Common().WriteErrorLog(0, "DUDU API 自動撥款", "未啟用自動撥款", member_id, null, null, member_no, null);
                        }
                    }

                }
                //----------------------------------------------


                //(1)產生訂單
                db.kc_merchanttrade.Add(kc_merchanttrade);

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
                    new Common().WriteErrorLog(0, "dudupay api 下單" + order_type, "系統錯誤" + ex.Message + member_no, member_id, null, null, null, null);
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message + member_no
                    };
                }

                return new ReturnMsg() { success = true, value = give_amt };


            }


        }
        #endregion


        #region 消費模式 dudu購買
        /// <summary>
        /// dudu購買 5
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
        public ReturnMsg WriteOrder_Transaction_purchase(int member_id, int store_id, string store_no,
                 string item, int total_cash, int period, int pay, string order_no, string member_no, string loan_type, string order_type,
                int product_id, string item_spec, int send_type, string home_name, string home_mobile, string home_mark, string car_name, string car_mobile, string car_address, string car_mark)
        {

            //(1)write log
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, member_no, null);

                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {
                //string _cp_no = "";
                //var member = db2.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                //if (member != null)
                //{
                //    _cp_no = member.register_cp_no;
                //}

                kc_merchanttrade kc_merchanttrade = new kc_merchanttrade()
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
                    //kc_cp_no = _cp_no,
                    CreatePerson = "",
                    CreateDate = DateTime.Now,
                    kc_updt_user = "",
                    kc_updt_date = DateTime.Now,
                    member_no = member_no,
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

                };

                //註冊帶訂單 超額 都還在徵審 無法自動撥款               
                //(3)自動撥款(商城先不做自動撥款 先mark)
                //if ((order_type == "綜合" || order_type == "足額") && auto_pay == 1)
                //{
                //    var kc_caragent = db2.kc_caragent.Where(x => x.kc_agent_code == store_no).FirstOrDefault();
                //    if (kc_caragent != null)
                //    {
                //        if (kc_caragent.kc_duduautogive_type == "Y")//自動撥款啟用
                //        {
                //            int orderLog_id = (int)returnMsg.value;
                //            //call 冠api
                //            OrderMessage ApiMessage = Api_SendOrder(member_no, store_no, item, JsonConvert.SerializeObject(item_list), total_cash, period, pay, loan_type,order_no,give_amt);
                //            if (!ApiMessage.success)
                //            {
                //                returnMsg = new CmsApiDA().WriteOrderLogError(orderLog_id, ApiMessage.msg, ApiMessage.url);
                //                if (!returnMsg.success) return returnMsg;

                //                return new ReturnMsg()
                //                {
                //                    success = false,
                //                    msg = ApiMessage.msg
                //                };
                //            }

                //            //(2)回寫客編及交易狀態
                //            string case_no = ApiMessage.orderData.kc_case_no;
                //            kc_merchanttrade.kc_case_no = case_no;//回寫客編
                //            kc_merchanttrade.kc_trade_status = "3";//更新交易狀熊

                //            Api_UpdateStatus(db2, order_no, case_no, ApiMessage.url);
                //            //(3)更新此會員是否有被推薦
                //            returnMsg = new CmsApiDA().MemberPush(db2, member_no, store_no);
                //            if (!returnMsg.success) return returnMsg;
                //        }
                //    }

                //}
                //----------------------------------------------


                //(1)產生訂單
                db.kc_merchanttrade.Add(kc_merchanttrade);

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
                    new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "系統錯誤" + ex.Message + member_no, member_id, null, null, null, null);
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message + member_no
                    };
                }

                return new ReturnMsg() { success = true, value = give_amt };


            }


        }


        /// <summary>
        /// dudu購買 5
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
        public ReturnMsg WriteOrder_Transaction_purchase_2(int member_id, int store_id, string store_no,
                 string item, int total_cash, int period, int pay, string order_no, string member_no, string loan_type, string order_type,
                int product_id, string item_spec, string item_list, int shipping_fee)
        {

            //(1)write log
            ReturnMsg returnMsg = new CmsApiDA().WriteOrderLog(store_no, store_no, item, total_cash, period, pay, order_no, member_no);
            if (!returnMsg.success) return new ReturnMsg() { success = false, msg = returnMsg.msg };

            //(2)get pay_cash 撥款金額
            OrderMessage OrderMessage = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, total_cash, period, member_id, store_no);
            int give_amt = int.Parse(OrderMessage.orderData.kc_give_amt);

            //(2.1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額),此筆撥款金額：" + give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額" + DealerMonthPay.balance + "訂單：" + order_no, member_id, null, null, member_no, null);

                return new ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款餘額)" };
            }



            using (var db = new duducmsEntities())
            using (var db2 = new kcsddb2Entities_new())
            using (var transaction1 = db.Database.BeginTransaction())
            using (var transaction2 = db2.Database.BeginTransaction())
            {

                List<Layout.itemList> list = JsonConvert.DeserializeObject<List<Layout.itemList>>(item_list);
                var orderItemSpec = new List<Layout.ItemSpec>();//寫入訂單規格

                var _car_id = list[0].car_id;
                var cart = db2.z_Cart.AsNoTracking().Where(x => x.car_id == _car_id).FirstOrDefault();

                kc_merchanttrade kc_merchanttrade = new kc_merchanttrade()
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
                    //kc_cp_no = _cp_no,
                    CreatePerson = "",
                    CreateDate = DateTime.Now,
                    kc_updt_user = "",
                    kc_updt_date = DateTime.Now,
                    member_no = member_no,
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


                };

                //減少庫存數
                foreach (var tt in list)
                {
                    var _cart = db2.z_Cart
                        .FirstOrDefault(x => x.car_id == tt.car_id);

                    if (_cart == null)
                        continue;

                    var itemSpec =
                        JsonConvert.DeserializeObject<Layout.Product_spec>(_cart.item_spec);

                    var product = db2.z_Product
                        .FirstOrDefault(x => x.product_id == _cart.product_id);

                    if (product == null)
                        continue;

                    if (string.IsNullOrEmpty(product.product_spec))
                        continue;

                    var productSpecs =
                        JsonConvert.DeserializeObject<List<Layout.Product_spec>>(
                            product.product_spec);

                    var spec = productSpecs
                        .FirstOrDefault(x => x.name == itemSpec.name);

                    if (spec == null)
                    {
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = "沒有此規格商品" + store_no + itemSpec.name
                        };
                    }

                    if (spec.qty < tt.buy_qty)
                    {
                        return new ReturnMsg()
                        {
                            success = false,
                            msg = $"庫存數不足：{itemSpec.name} 購買數：{tt.buy_qty} 庫存數：{spec.qty}"
                        };
                    }
                    
                    spec.qty -= tt.buy_qty;
                    orderItemSpec.Add(new ItemSpec {Name = spec.name, CarId = _cart.car_id }); //建立訂單規格
                    product.product_spec =
                        JsonConvert.SerializeObject(productSpecs);

                    _cart.cust_confirm = "*";
                }

                kc_merchanttrade.item_spec = JsonConvert.SerializeObject(orderItemSpec);
                //產生訂單
                db.kc_merchanttrade.Add(kc_merchanttrade);


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
                    new Common().WriteErrorLog(0, "dudu購買 下單" + order_type, "系統錯誤" + ex.Message + member_no, member_id, null, null, null, null);
                    return new ReturnMsg()
                    {
                        success = false,
                        msg = ex.Message + member_no
                    };
                }

                return new ReturnMsg() { success = true, value = give_amt };


            }


        }
        #endregion


        #region 回寫客編及交易狀態
        public ReturnMsg Api_UpdateStatus(kcsddb2Entities_new db2, string order_no, string case_no, string url)
        {
            try
            {

                //回寫客編
                var orderlog = db2.z_OrderLog.Where(x => x.order_no == order_no).FirstOrDefault();
                if (orderlog != null)
                {
                    orderlog.finish_time = DateTime.Now;
                    orderlog.case_no = case_no;
                    orderlog.url = url;
                    db2.z_OrderLog.Attach(orderlog);
                    db2.Entry(orderlog).State = System.Data.Entity.EntityState.Modified;
                    //db2.SaveChanges();
                }

                return new ReturnMsg() { success = true };
            }
            catch (Exception ex)
            {
                return new ReturnMsg() { success = false, msg = ex.Message };
            }




        }
        #endregion

        #region 自動撥款
        /// <summary>
        /// 自動撥款
        /// </summary>
        /// <param name="member_no">會員編號</param>
        /// <param name="store_no">店家代號</param>
        /// <param name="item">品名</param>
        /// <param name="item_list">品項</param>
        /// <param name="total_cash">總金額</param>
        /// <param name="period">期數</param>
        /// <param name="pay">期付</param>
        /// <param name="loan_type">利率專案</param>
        /// <returns></returns>        
        public OrderMessage Api_SendOrder(string member_no, string store_no, string item, string item_list, int kc_loan_amt, int period, int pay, string loan_type, string order_no, int? kc_give_amt)
        {
            string kc_member_no = member_no;
            string kc_car_model = item;
            string kc_loan_perd = period.ToString();
            string _kc_loan_amt = kc_loan_amt.ToString();
            string kc_perd_fee = pay.ToString();
            string _kc_give_amt = kc_give_amt.ToString();

            string date_now = DateTime.Now.ToString("yyyy-MM-dd");

            string data = DuDuPay.Models.SecureHelper.AESEncrypt(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10}", kc_member_no, kc_car_model, kc_loan_perd, _kc_loan_amt, kc_perd_fee, store_no, loan_type, date_now, order_no, _kc_give_amt, DuDuPay.Models.SecureHelper.GetRNGChar(6)), DuDuPay.Models.SecureHelper.SecretKey2);
            string v2 = System.Web.HttpUtility.UrlEncode(data);
            string url = ConfigurationManager.AppSettings["WebApi_Url"] + $"CreateNewCustDudu?rpt=&realV={v2}";

            //傳冠博寫檔
            try
            {
                Common c = new Common();
                //OrderData result = c.SendOrderApi(ConfigurationManager.AppSettings["WebApi_Url"] + "CreateNewCustDudu", new { rpt = "", realV = data });
                OrderData result = c.SendApi<OrderData>(ConfigurationManager.AppSettings["WebApi_Url"] + "CreateNewCustDudu", new { rpt = "", realV = data });

                //回傳 客編
                if (result.success)
                {
                    return new OrderMessage()
                    {
                        success = true,
                        orderData = result,
                        url = url
                    };

                }
                else
                {
                    string error = string.Format("{0},品名：{1},金額：{2},期數：{3},月付：{4},利率方案：{5}", member_no, item, kc_loan_amt, period, pay, loan_type);
                    new Common().WriteErrorLog(1, "DUDU API 自動撥款 Call API", result.message + error + "url:" + url, null, null, null, null, null);
                    return new OrderMessage()
                    {
                        success = false,
                        msg = "呼叫分期回傳:" + result.message,
                        url = url

                    };

                }


            }
            catch (Exception ex)
            {
                string error = string.Format("{0},品名：{1},金額：{2},期數：{3},月付：{4}", member_no, item, kc_loan_amt, period, pay);
                new Common().WriteErrorLog(1, "DUDU API 自動撥款 Call API", "系統錯誤：" + ex.Message + error, null, null, null, null, null);
                return new OrderMessage()
                {
                    success = false,
                    msg = ex.Message,
                    url = url
                };
            }

        }
        #endregion




        #region 取月付金額 撥款金額
        /// <summary>
        /// 取利率
        /// </summary>
        /// <param name="kc_loan_type">利率方案</param>
        /// <param name="cash">金額</param>
        /// <param name="kc_loan_perd">期數</param>
        /// <returns></returns>
        public OrderMessage GetdsMoneyCal_forDUDUPAY(string kc_loan_type, int cash, int kc_loan_perd, int member_id, string kc_agent_code)
        {

            //check  R利率專案時
            if (kc_loan_type.Substring(0, 1) == "R")
            {
                OrderMessage OrderMessage = CheckLoanTypeR(kc_loan_type, cash);
                if (!OrderMessage.success) return OrderMessage;
            }


            string _cash = cash.ToString();
            string loan_perd = kc_loan_perd.ToString();

            string data = DuDuPay.Models.SecureHelper.AESEncrypt(string.Format("{0},{1},{2},{3},{4}", kc_loan_type, _cash, loan_perd, kc_agent_code, DuDuPay.Models.SecureHelper.GetRNGChar(6)), DuDuPay.Models.SecureHelper.SecretKey2);
            string v2 = HttpUtility.UrlEncode(data);
            string url = ConfigurationManager.AppSettings["WebApi_Url"] + $"GetdsMoneyCal_forDUDUPAY?rpt=&realV={v2}";


            //傳冠博寫檔
            try
            {
                Common c = new Common();
                //Layout.OrderData result = c.SendOrderApi(ConfigurationManager.AppSettings["WebApi_Url"] + "GetdsMoneyCal_forDUDUPAY", new
                //{
                //    rpt = "",
                //    realV = data
                //});
                Layout.OrderData result = c.SendApi<OrderData>(ConfigurationManager.AppSettings["WebApi_Url"] + "GetdsMoneyCal_forDUDUPAY", new
                {
                    rpt = "",
                    realV = data
                });

                if (result.success)
                {
                    return new OrderMessage()
                    {
                        success = true,
                        orderData = result,
                        url = url
                    };

                }
                else
                {
                    string info = string.Format("利率別:{0}金額:{1}期數:{2}url:{3}", kc_loan_type, cash, kc_loan_perd, url);
                    new Common().WriteErrorLog(1, "自訂QR 取利率", result.message + info, member_id, null, null, null, null);
                    return new OrderMessage()
                    {
                        success = false,
                        msg = "呼叫分期回傳:" + result.message,
                        url = url

                    };

                }


            }
            catch (Exception ex)
            {
                string error = string.Format("利率別：{0}金額：{1}期數：{2}", kc_loan_type, cash, kc_loan_perd);
                new Common().WriteErrorLog(1, "自訂QR 取利率", "系統錯誤：" + ex.Message + error, member_id, null, null, null, null);
                return new OrderMessage()
                {
                    success = false,
                    msg = ex.Message,
                    url = url
                };
            }

        }

        OrderMessage CheckLoanTypeR(string kc_loan_type, int cash)
        {

            using (var db = new kcsddb2Entities_new())
            {
                bool hasdata = db.kc_Loantypeforflexible.Where(x => x.kc_loan_type == kc_loan_type && x.kc_lower_limit <= cash && x.kc_upper_limit > cash).Any();
                if (hasdata) return new OrderMessage() { success = true };
                else
                    return new OrderMessage() { success = false, msg = "利率專案無此金額" + kc_loan_type + "金額：" + cash };
            };
        }

        #endregion

        #region 消費前檢查 可用額度及是否逾期
        public Layout.CheckAmountMsg CreateNewCustDuduChk(string member_no, int price, string txt_msg, string order_type)
        {
            //eantodo test
            //return new Layout.CheckAmountMsg()
            //{
            //    success = true,
            //    type = -1,//可用金額不足
            //    loc_remaining = 1000
            //};


            string data = DuDuPay.Models.SecureHelper.AESEncrypt(string.Format("{0},{1}", member_no, DuDuPay.Models.SecureHelper.GetRNGChar(6)), DuDuPay.Models.SecureHelper.SecretKey2);
            string v2 = HttpUtility.UrlEncode(data);
            string url = ConfigurationManager.AppSettings["WebApi_Url"] + $"CreateNewCustDuduChk?rpt=&realV={v2}";

            //傳冠博寫檔
            try
            {



                Common c = new Common();
                // 開始計時
                var sw = System.Diagnostics.Stopwatch.StartNew();
                Layout.OrderCheckAmount result = c.SendApi<Layout.OrderCheckAmount>(ConfigurationManager.AppSettings["WebApi_Url"] + "CreateNewCustDuduChk", new
                { rpt = "", realV = data });

                // 結束計時
                sw.Stop();
                // 寫 log
                new Common().WriteErrorLog(0, "消費及登入前檢查 可用額度及是否逾期", $"API耗時: {sw.ElapsedMilliseconds} ms", null, null, null, member_no, null);

                if (result.success)
                {
                    //檢查$ 可用金額不足
                    if (price > double.Parse(result.kc_loc_remaining))
                    {
                        new Common().WriteErrorLog(0, txt_msg + " " + order_type, "查詢可用額度 可用金額不足 可用：" + result.kc_loc_remaining + "消費：" + price + "url:" + url, null, null, null, member_no, null);
                        return new Layout.CheckAmountMsg()
                        {
                            success = true,
                            type = -1,//可用金額不足
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    //檢查是否逾期                    
                    DateTime payDate = DateTime.Parse(result.kc_expt_date + " 23:59:59");//付款日
                    DateTime currDate = DateTime.Now;
                    int dateCount = new TimeSpan(currDate.Ticks - payDate.Ticks).Days;
                    if (dateCount <= 0)//繼續交易 正常
                    {
                        new Common().WriteErrorLog(0, txt_msg + " " + order_type, "查詢可用額度 可繼續交易 可用：" + result.kc_loc_remaining + "消費：" + price + "url:" + url, null, null, null, member_no, null);
                        return new Layout.CheckAmountMsg()
                        {
                            success = true,
                            type = 0,//繼續交易 正常
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    else if (dateCount < 10)//<10天 提示後 繼續交易
                    {
                        new Common().WriteErrorLog(0, txt_msg + " " + order_type, "查詢可用額度 <10天 可繼續交易 天數：" + dateCount + "可用：" + result.kc_loc_remaining + "消費：" + price + "url:" + url, null, null, null, member_no, null);
                        return new Layout.CheckAmountMsg()
                        {
                            success = true,
                            type = 1,//<10天 提示後 繼續交易
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    else//提示 不可交易 >10天
                    {
                        new Common().WriteErrorLog(0, txt_msg + " " + order_type, "查詢可用額度 >=10天,不可交易 天數：" + dateCount + "可用：" + result.kc_loc_remaining + "消費：" + price + "url:" + url, null, null, null, member_no, null);
                        return new Layout.CheckAmountMsg()
                        {
                            success = true,
                            type = 2,//提示 不可交易 >10天
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }




                }
                else
                {
                    new Common().WriteErrorLog(1, txt_msg + " " + order_type, "串接API回傳失敗:" + result.message, null, null, null, member_no, null);
                    return new Layout.CheckAmountMsg()
                    {
                        success = false,
                        msg = "呼叫分期回傳:" + result.message,
                        //type = 99,
                        //loc_remaining = 0
                        //url = url

                    };

                }


            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, txt_msg + " " + order_type, "系統錯誤:" + ex.Message, null, null, null, member_no, null);
                return new Layout.CheckAmountMsg()
                {
                    success = false,
                    msg = ex.Message
                    //url = url

                };

            }


        }
        public Layout.CheckAmountMsg CreateNewCustDuduChk2(string member_no, int price, string txt_msg)
        {

            string data = DuDuPay.Models.SecureHelper.AESEncrypt(string.Format("{0},{1}", member_no, DuDuPay.Models.SecureHelper.GetRNGChar(6)), DuDuPay.Models.SecureHelper.SecretKey2);
            string v2 = HttpUtility.UrlEncode(data);
            string url = ConfigurationManager.AppSettings["WebApi_Url"] + $"CreateNewCustDuduChk?rpt=&realV={v2}";



            //傳冠博寫檔
            try
            {
                Common c = new Common();
                Layout.OrderCheckAmount result = c.SendApi<Layout.OrderCheckAmount>(ConfigurationManager.AppSettings["WebApi_Url"] + "CreateNewCustDuduChk", new
                { rpt = "", realV = data });


                if (result.success)
                {
                    //檢查$ 可用金額不足
                    if (price > double.Parse(result.kc_loc_remaining))
                    {
                        return new Layout.CheckAmountMsg()
                        {
                            success = false,
                            type = 0,
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    //檢查是否逾期                    
                    DateTime payDate = DateTime.Parse(result.kc_expt_date + " 23:59:59");//付款日
                    DateTime currDate = DateTime.Now;
                    int dateCount = new TimeSpan(currDate.Ticks - payDate.Ticks).Days;
                    if (dateCount <= 0)//繼續交易 正常
                    {
                        return new Layout.CheckAmountMsg()
                        {
                            success = true,
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    else if (dateCount < 10)//<10天 提示後 繼續交易
                    {
                        return new Layout.CheckAmountMsg()
                        {
                            success = false,
                            type = 1,
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }
                    else//提示 不可交易 >10天
                    {
                        return new Layout.CheckAmountMsg()
                        {
                            success = false,
                            type = 2,
                            loc_remaining = double.Parse(result.kc_loc_remaining)
                        };
                    }

                }
                else
                {
                    new Common().WriteErrorLog(1, txt_msg, "串接API回傳失敗:" + result.message, null, null, null, member_no, null);
                    return new Layout.CheckAmountMsg()
                    {
                        success = false,
                        msg = "呼叫分期回傳:" + result.message,
                        type = 99,
                        loc_remaining = 0
                        //url = url

                    };

                }


            }
            catch (Exception ex)
            {
                new Common().WriteErrorLog(1, txt_msg, "系統錯誤:" + ex.Message, null, null, null, member_no, null);
                return new Layout.CheckAmountMsg()
                {
                    success = false,
                    msg = ex.Message
                    //url = url

                };

            }


        }



        #endregion


        public Object WriteMemberTradeType(int member_id, string trade_type, string trade_url, string trade_info)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    member.trade_type = trade_type;
                    member.trade_info = trade_info;
                    member.trade_url = trade_url;
                    db.z_Member.Attach(member);
                    db.Entry(member).State = EntityState.Modified;
                    db.SaveChanges();
                }
            }

            return new { success = true };
        }

        //超額下單成功後清除額度不足的暫存資訊，避免之後的訂單頁誤觸發超額流程
        public void ClearMemberTradeType(int member_id)
        {
            WriteMemberTradeType(member_id, null, null, null);
        }

        #region 是否已經核准交易
        public string TrandOK_2(int member_id)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.register_cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        if (cpdata.kc_apply_stat == "P" || cpdata.kc_apply_stat == "Q")
                        {
                            //return "OK";

                            //check memberdata flag
                            var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member.kc_member_no).FirstOrDefault();
                            if (memberdata != null)
                            {
                                if (memberdata.kc_member_stat != "A" && memberdata.kc_member_stat != "T")
                                {
                                    new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata消費狀態：" + memberdata.kc_member_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                    return "無法消費(消費狀態：" + memberdata.kc_member_stat + ")";
                                }
                                else
                                {
                                    return "OK";
                                }
                            }
                            else
                            {
                                new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata沒有會員編號member_no)" + member.kc_member_no, member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                return "無法消費(無此會員編號：" + member.kc_member_no + ")";
                            }


                        }
                        else
                        {
                            new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                            return "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")";
                        }
                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "客編不存在(cp_data)", member_id, null, null, null, null);
                        return "客編不存在(cp_data)" + "會員編號:" + member_id;
                    }
                }
                else
                {
                    new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "會員資料不存在", member_id, null, null, null, null);
                    return "會員資料不存在:" + member_id;
                }

            }
        }
        public string TrandOK_3(int member_id)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.register_cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        if (cpdata.kc_apply_stat == "P" || cpdata.kc_apply_stat == "Q")
                        {
                            //return "OK";
                            //check memberdata flag
                            var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member.kc_member_no).FirstOrDefault();
                            if (memberdata != null)
                            {
                                if (memberdata.kc_member_stat != "A" && memberdata.kc_member_stat != "T")
                                {
                                    new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata消費狀態：" + memberdata.kc_member_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                    return "無法消費(消費狀態：" + memberdata.kc_member_stat + ")";
                                }
                                else
                                {
                                    return "OK";
                                }
                            }
                            else
                            {
                                new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata沒有會員編號member_no)" + member.kc_member_no, member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                return "無法消費(無此會員編號：" + member.kc_member_no + ")";
                            }


                        }
                        else
                        {
                            new Common().WriteErrorLog(0, "店家QR 檢查是否可下單", "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                            return "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")";
                        }
                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "店家QR 檢查是否可下單", "客編不存在(cp_data)", member_id, null, null, null, null);
                        return "客編不存在(cp_data)" + "會員編號:" + member_id;
                    }
                }
                else
                {
                    new Common().WriteErrorLog(0, "店家QR 檢查是否可下單", "會員資料不存在", member_id, null, null, null, null);
                    return "會員資料不存在:" + member_id;
                }

            }
        }

        public string TrandOK_api(int member_id, string order_type)
        {
            using (var db = new kcsddb2Entities_new())
            {
                var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
                if (member != null)
                {
                    var cpdata = db.kc_cpdata.Where(x => x.kc_cp_no == member.register_cp_no).FirstOrDefault();
                    if (cpdata != null)
                    {
                        if (cpdata.kc_apply_stat == "P" || cpdata.kc_apply_stat == "Q")
                        {
                            //return "OK";
                            //check memberdata flag
                            var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member.kc_member_no).FirstOrDefault();
                            if (memberdata != null)
                            {
                                if (memberdata.kc_member_stat != "A" && memberdata.kc_member_stat != "T")
                                {
                                    new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata消費狀態：" + memberdata.kc_member_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                    return "無法消費(消費狀態：" + memberdata.kc_member_stat + ")";
                                }
                                else
                                {
                                    return "OK";
                                }
                            }
                            else
                            {
                                new Common().WriteErrorLog(0, "自訂QR 檢查是否可下單", "無法消費(memberdata沒有會員編號member_no)" + member.kc_member_no, member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                                return "無法消費(無此會員編號：" + member.kc_member_no + ")";
                            }

                        }
                        else
                        {
                            new Common().WriteErrorLog(0, "dudupay api 下單 " + order_type + " 檢查是否可下單", "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")", member_id, member.id_no, member.cp_no, member.kc_member_no, null);
                            return "無法消費(消費狀態：" + cpdata.kc_apply_stat + ")";
                        }
                    }
                    else
                    {
                        new Common().WriteErrorLog(0, "dudupay api 下單 " + order_type + " 檢查是否可下單", "客編不存在(cp_data)", member_id, null, null, null, null);
                        return "客編不存在(cp_data)" + "會員編號:" + member_id;
                    }
                }
                else
                {
                    new Common().WriteErrorLog(0, "dudupay api 下單 " + order_type + " 檢查是否可下單", "會員資料不存在", member_id, null, null, null, null);
                    return "會員資料不存在:" + member_id;
                }

            }
        }
        #endregion

        #region 檢查可用額度
        //public ReturnMsg CheckAmount(string member_no, int price)
        //{
        //    using (var db = new kcsddb2Entities_new())
        //    {
        //        var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member_no).FirstOrDefault();
        //        if (memberdata == null)
        //        {
        //            return new ReturnMsg()
        //            {
        //                success = false,
        //                msg = "會員編號不存在" + member_no
        //            };
        //        }

        //        if (memberdata.kc_loc_amount - memberdata.kc_used_amount < price)
        //        {
        //            return new ReturnMsg()
        //            {
        //                success = false,
        //                msg = $"{member_no}會員額度不足,目前可使用額度{memberdata.kc_loc_amount - memberdata.kc_used_amount}"
        //            };
        //        }

        //        return new ReturnMsg() { success = true };

        //    }
        //}
        #endregion

        #region 更新已用額度
        //public ReturnMsg UpdateAmount(string member_no, int price)
        //{
        //    using (var db = new kcsddb2Entities_new())
        //    {
        //        var memberdata = db.kc_memberdata.Where(x => x.kc_member_no == member_no).FirstOrDefault();
        //        if (memberdata == null)
        //        {
        //            return new ReturnMsg()
        //            {
        //                success = false,
        //                msg = "會員編號不存在" + member_no
        //            };
        //        }

        //        memberdata.kc_used_amount = memberdata.kc_used_amount.HasValue ? memberdata.kc_used_amount.Value + price : price;
        //        db.kc_memberdata.Attach(memberdata);
        //        db.Entry(memberdata).State = EntityState.Modified;
        //        db.SaveChanges();


        //        return new ReturnMsg() { success = true };

        //    }
        //}
        #endregion

        #region 取利率專案及期數
        /// <summary>
        /// 取利率專案及期數
        /// </summary>
        /// <param name="agent_code">商電代號</param>
        /// <param name="prod_type">14</param>
        /// <param name="isEnable">1</param>
        /// <returns></returns>
        public ean GetInterestType(string agent_code, string prod_type, bool isEnable, int price)
        {
            //(1)找利率專案 期數限制
            string loan_type = string.Empty;//利率專案
            string loan_perd = string.Empty;//期數限制
            using (var db = new kcsddb2Entities_2())
            {
                var caragentbranchProd = db.kc_caragentbranchProd.Where(x => x.kc_agent_code == agent_code && x.kc_prod_type == prod_type && x.IsEnable.Value == isEnable).FirstOrDefault();
                if (caragentbranchProd != null)
                {
                    if (caragentbranchProd.kc_loan_type == null)//正式環境只會有一筆測試可能多筆
                    {
                        new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案不存在 kc_caragentbranchProd 商店代號：" + agent_code, null, null, null, null, null);
                        return new ean()
                        {
                            success = false,
                            msg = "此店家未設定利率專案"
                        };
                    }
                    loan_type = caragentbranchProd.kc_loan_type;//利率專案名稱
                    loan_perd = caragentbranchProd.kc_loan_perd;//期數限制

                    //加條件判斷
                    if (price <= 50000 && loan_perd != "" && loan_perd != null)
                    {
                        if (int.Parse(loan_perd) > 21) loan_perd = "21";
                    }
                }
                else
                {
                    new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案不存在 kc_caragentbranchProd is null  商店代號：" + agent_code, null, null, null, null, null);
                    return new ean()
                    {
                        success = false,
                        msg = "此店家未設定利率專案"
                    };
                }
            };

            if (loan_type == "" || loan_type == null)
            {
                new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案為空 kc_caragentbranchProd 商店代號：" + agent_code + "利率專案:" + loan_type, null, null, null, null, null);
                return new ean()
                {
                    success = false,
                    msg = "分期系統未設定店家利率專案"
                };
            }

            if (loan_perd == "" || loan_perd == null)
            {
                new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率期數限制為空 kc_caragentbranchProd 商店代號：" + agent_code + "期數限制:" + loan_perd, null, null, null, null, null);
                return new ean()
                {
                    success = false,
                    msg = "分期系統未設定店家利率期數限制"
                };
            }

            //(2)店家是否有設下月付  
            bool has_one_period = false;
            using (var db = new kcsddb2Entities_new())
            {
                var kc_caragent = db.kc_caragent.Where(x => x.kc_agent_code == agent_code && x.kc_proc_per != null && x.kc_proc_type != null).FirstOrDefault();
                if (kc_caragent != null) has_one_period = true;
            }

            //(3)此利率專案有那些期數list 被女PM硬幹這裡很乱哈哈~
            if (loan_type.Substring(0, 1) == "R")//R利率
            {
                return R_interest(loan_type, has_one_period, loan_perd, agent_code, price);
            }


            //L,O,P,利率
            using (var db = new ZephyrEntities())
            {
                var periods = db.sys_code.Where(x => x.Text4 == loan_type && x.IsEnable.Value == isEnable && x.CodeType == "MoneyCalculation").ToList();

                if (periods.Count > 0)
                {
                    var interest_has_one = periods.Where(x => x.Text1 == "1").FirstOrDefault();
                    //綜合判斷
                    //(T1)利率專案有設一期 但此店家未設下月付也不能有一期
                    //(T2)店家有設下月付 但此利率專案無一期也要有一期 insert
                    if (interest_has_one != null && !has_one_period)//(T1)
                    {
                        periods.Remove(interest_has_one);
                    }
                    else if (has_one_period && interest_has_one == null)//(T2)
                    {
                        periods.Insert(0, new sys_code() { Text1 = "1", Text4 = loan_type });
                    }


                    return new ean()
                    {
                        success = true,
                        value = new sub_ean()
                        {
                            loan_type = loan_type,//利率專案名稱
                            loan_perd = loan_perd,//期數限制 18  //if 
                                                  //專案利率期數list要<=此利率期數的限制(3,6,18,24)-->(3,6,18)
                                                  //所以只能有這些期數
                            periods = periods.Where(x => int.Parse(x.Text1) <= int.Parse(loan_perd)).Select(s => new sub_ean2()
                            {
                                Text1 = int.Parse(s.Text1)
                            }).OrderBy(o => o.Text1).ToList()
                        }
                    };
                }
                else
                {
                    new Common().WriteErrorLog(0, "消費 取專案利率", "此專案利率期數不存在sys_code  table 商店代號：" + agent_code + "利率專案:" + loan_type, null, null, null, null, null);
                    return new ean
                    {
                        success = false,
                        msg = "此專案利率期數不存在(未設定期數)" + loan_type
                    };
                }
            };

        }
        public ean GetInterestTypeForOrder_3(string agent_code, string prod_type, bool isEnable)
        {
            //(1)找利率專案 期數限制
            string loan_type = string.Empty;//利率專案
            string loan_perd = string.Empty;//期數限制
            using (var db = new kcsddb2Entities_2())
            {
                var caragentbranchProd = db.kc_caragentbranchProd.Where(x => x.kc_agent_code == agent_code && x.kc_prod_type == prod_type && x.IsEnable.Value == isEnable).FirstOrDefault();
                if (caragentbranchProd != null)
                {
                    if (caragentbranchProd.kc_loan_type == null)//正式環境只會有一筆測試可能多筆
                    {
                        new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案不存在 kc_caragentbranchProd 商店代號：" + agent_code, null, null, null, null, null);
                        return new ean()
                        {
                            success = false,
                            msg = "此店家未設定利率專案"
                        };
                    }
                    loan_type = caragentbranchProd.kc_loan_type;//利率專案名稱
                    loan_perd = caragentbranchProd.kc_loan_perd;//期數限制

                    //加條件判斷
                    //if (price <= 50000 && loan_perd != "" && loan_perd != null)
                    //{
                    //    if (int.Parse(loan_perd) > 21) loan_perd = "21";
                    //}
                }
                else
                {
                    new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案不存在 kc_caragentbranchProd is null  商店代號：" + agent_code, null, null, null, null, null);
                    return new ean()
                    {
                        success = false,
                        msg = "此店家未設定利率專案"
                    };
                }
            };

            if (loan_type == "" || loan_type == null)
            {
                new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率專案為空 kc_caragentbranchProd 商店代號：" + agent_code + "利率專案:" + loan_type, null, null, null, null, null);
                return new ean()
                {
                    success = false,
                    msg = "分期系統未設定店家利率專案"
                };
            }

            if (loan_perd == "" || loan_perd == null)
            {
                new Common().WriteErrorLog(0, "消費 取利率專案", "店家利率期數限制為空 kc_caragentbranchProd 商店代號：" + agent_code + "期數限制:" + loan_perd, null, null, null, null, null);
                return new ean()
                {
                    success = false,
                    msg = "分期系統未設定店家利率期數限制"
                };
            }

            //(2)店家是否有設下月付  
            bool has_one_period = false;
            using (var db = new kcsddb2Entities_new())
            {
                var kc_caragent = db.kc_caragent.Where(x => x.kc_agent_code == agent_code && x.kc_proc_per != null && x.kc_proc_type != null).FirstOrDefault();
                if (kc_caragent != null) has_one_period = true;
            }

            //(3)此利率專案有那些期數list 被女PM硬幹這裡很乱哈哈~
            if (loan_type.Trim().Substring(0, 1) == "R")//R利率
            {
                return new ean()
                {
                    success = true,
                    value = new sub_ean()
                    {
                        loan_type = loan_type.Trim()//利率專案名稱                        
                    }
                };


            }


            //L,O,P,利率
            using (var db = new ZephyrEntities())
            {
                var periods = db.sys_code.Where(x => x.Text4 == loan_type && x.IsEnable.Value == isEnable && x.CodeType == "MoneyCalculation").ToList();

                if (periods.Count > 0)
                {
                    var interest_has_one = periods.Where(x => x.Text1 == "1").FirstOrDefault();
                    //綜合判斷
                    //(T1)利率專案有設一期 但此店家未設下月付也不能有一期
                    //(T2)店家有設下月付 但此利率專案無一期也要有一期 insert
                    if (interest_has_one != null && !has_one_period)//(T1)
                    {
                        periods.Remove(interest_has_one);
                    }
                    else if (has_one_period && interest_has_one == null)//(T2)
                    {
                        periods.Insert(0, new sys_code() { Text1 = "1", Text4 = loan_type });
                    }

                    return new ean()
                    {
                        success = true,
                        value = new sub_ean()
                        {
                            loan_type = loan_type,//利率專案名稱
                            loan_perd = loan_perd,//期數限制 18  //if 
                                                  //專案利率期數list要<=此利率期數的限制(3,6,18,24)-->(3,6,18)
                                                  //所以只能有這些期數
                            periods = periods.Where(x => int.Parse(x.Text1) <= int.Parse(loan_perd)).Select(s => new sub_ean2()
                            {
                                Text1 = int.Parse(s.Text1)
                            }).OrderBy(o => o.Text1).ToList()
                        }
                    };
                }
                else
                {
                    new Common().WriteErrorLog(0, "消費 取專案利率", "此專案利率期數不存在sys_code  table 商店代號：" + agent_code + "利率專案:" + loan_type, null, null, null, null, null);
                    return new ean
                    {
                        success = false,
                        msg = "此專案利率期數不存在(未設定期數)" + loan_type
                    };
                }
            };

        }

        ean R_interest(string loan_type, bool has_one_period, string loan_perd, string agent_code, int price)
        {
            using (var db = new kcsddb2Entities_new())
            {


                var periods = db.kc_Loantypeforflexible.Where(x => x.kc_loan_type == loan_type && x.kc_lower_limit <= price && x.kc_upper_limit > price).GroupBy(g => g.kc_loan_perd).Select(g => g.FirstOrDefault()).OrderBy(s => s.kc_loan_perd).
                    Select(p => new sys_code()
                    {
                        Text1 = p.kc_loan_perd.ToString(),
                        Text4 = loan_type
                    }).ToList();



                //var periods = db.kc_Loantypeforflexible.Where(x => x.kc_loan_type == loan_type).GroupBy(g => g.kc_loan_perd).Select(g => g.FirstOrDefault()).OrderBy(s => s.kc_loan_perd).
                //   Select(p => new sys_code()
                //   {
                //       Text1 = p.kc_loan_perd.ToString(),
                //       Text4 = loan_type
                //   }).ToList();


                if (periods.Count > 0)
                {
                    var interest_has_one = periods.Where(x => x.Text1 == "1").FirstOrDefault();

                    //綜合判斷
                    //(T1)利率專案有設一期 但此店家未設下月付也不能有一期
                    //(T2)店家有設下月付 但此利率專案無一期也要有一期 insert
                    if (interest_has_one != null && !has_one_period)//(T1)
                    {
                        periods.Remove(interest_has_one);
                    }
                    else if (has_one_period && interest_has_one == null)//(T2)
                    {
                        periods.Insert(0, new sys_code() { Text1 = "1", Text4 = loan_type });
                    }

                    return new ean()
                    {
                        success = true,
                        value = new sub_ean()
                        {
                            loan_type = loan_type,//利率專案名稱
                            loan_perd = loan_perd,//期數限制 18  //if 
                                                  //專案利率期數list要<=此利率期數的限制(3,6,18,24)-->(3,6,18)
                                                  //所以只能有這些期數
                            periods = periods.Where(x => int.Parse(x.Text1) <= int.Parse(loan_perd)).Select(s => new sub_ean2()
                            {
                                Text1 = int.Parse(s.Text1)
                            }).OrderBy(o => o.Text1).ToList()
                        }
                    };
                }
                else
                {
                    new Common().WriteErrorLog(0, "消費 取專案利率", "此專案利率期數不存在 kc_Loantypeforflexible  table 商店代號：" + agent_code + "利率專案:" + loan_type, null, null, null, null, null);
                    return new ean
                    {
                        success = false,
                        msg = "此專案利率期數不存在(此金額未設定期數)" + loan_type
                    };
                }
            };
        }
        #endregion

        #region 取會員編號
        //public string GetMemberNO(int member_id)
        //{
        //    using (var db = new kcsddb2Entities_new())
        //    {
        //        var member = db.z_Member.Where(x => x.id == member_id).FirstOrDefault();
        //        if (member == null) return "";

        //        return member.kc_member_no;
        //    }
        //}
        #endregion




        public class ean
        {
            public bool success { set; get; }
            public string msg { set; get; }
            public sub_ean value { set; get; }
        }

        public class sub_ean
        {
            public string loan_type { set; get; }//利率專案名稱
            public string loan_perd { set; get; }//期數限制 18
            public List<sub_ean2> periods { set; get; } //專案利率期數list要<=此利率期數的限制(3,6,18,24)-->(3,6,18)                           
        }

        public class sub_ean2
        {
            public int Text1 { set; get; }//利率期數
        }


    }







}