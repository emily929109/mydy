using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using DuDuPay.Models;

namespace DuDuPay.Controllers
{

    public class OrderNonMemberController : ApiController
    {
        OrderNonMemberDA OrderNonMemberDA;
        private readonly static object _thisLock = new object();
        public OrderNonMemberController()
        {
            OrderNonMemberDA = new OrderNonMemberDA();
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

        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object SendOrder_Transaction_2_nonMember(int store_id, string store_no, string store_name,
           string item, int price, int period, int pay, int pay_cash, string loan_type, string order_type)
        {


            var member_id = GetAuthMember().member_id;

            //(0)check flag 可以交易？
            //string msg = OrderNonMemberDA.TrandOK_2(member_id);
            //if (msg != "OK") return new Layout.ReturnMsg() { success = false, msg = msg };


            //(1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (pay_cash > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "消費模式2-" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款金額),此筆撥款金額：" + pay_cash + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額:" + DealerMonthPay.balance, member_id, null, null, null, null);
                return new Layout.ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款金額-註冊帶訂單)" };
            }


            //(2)產生訂單 write order kc_merchanttrade
            string order_no;
            Layout.ReturnMsg ReturnMsg;
            lock (_thisLock)
            {
                //取訂單號
                order_no = new Common().CreateOrderNo(store_no, order_type);
                ReturnMsg = OrderNonMemberDA.WriteOrder_Transaction_2_nonMember(member_id, store_id, store_no, item, price, period, pay, pay_cash, order_no, loan_type, order_type);
            }
            if (!ReturnMsg.success) return ReturnMsg;
            if (order_type == "超額") new OrderDA().ClearMemberTradeType(member_id);


            //(3)交易完成 回傳訂單          
            return OrderNonMemberDA.GetOrder(store_no, order_no);

        }



        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object CloseTime(string time)
        {
            var member_id = GetAuthMember().member_id;
            return OrderNonMemberDA.CloseTime(member_id, time);
        }


        //---------------------------        
        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object SendOrder_Transaction_3_nonMember(int store_id, string store_no, string store_name,
    string item, int price, int period, int pay, string loan_type, string order_type)
        {
            //(0)check flag 可以交易？           
            //string msg = OrderDA.TrandOK_3(member_id);
            //if (msg != "OK")
            //{
            //    return new ReturnMsg()
            //    {
            //        success = false,
            //        msg = msg
            //    };
            //}

            var member_id = GetAuthMember().member_id;

            //(1)取撥款金額
            Layout.OrderMessage om = new OrderDA().GetdsMoneyCal_forDUDUPAY(loan_type, price, period, member_id, store_no);
            if (!om.success)
            {
                new Common().WriteErrorLog(1, "消費模式3-" + order_type, "取撥款金額 call cpi 商品試算 店家" + store_no + "品項" + item + om.msg, member_id, null, null, null, null);
                return om;
            }
            int kc_give_amt = 0;
            bool success = int.TryParse(om.orderData.kc_give_amt, out kc_give_amt);//撥款金額

            if (kc_give_amt == 0)
            {
                new Common().WriteErrorLog(1, "消費模式3-" + order_type, "取撥款金額有誤 撥款金額為0" + store_no + "品項" + item + om.msg, member_id, null, null, null, null);
                return new Layout.ReturnMsg()
                {
                    success = false,
                    msg = "撥款金額有誤,請洽客服"
                };
            }


            //(1)check get month give_pay
            Layout.DealerMonthPay DealerMonthPay = new Common().MonthPay(store_no);
            if (kc_give_amt > DealerMonthPay.balance)
            {
                new Common().WriteErrorLog(0, "消費模式3-" + order_type, "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款金額),此筆撥款金額：" + kc_give_amt + "核准：" + DealerMonthPay.allow_pay + "已用：" + DealerMonthPay.month_pay + "月餘額:" + DealerMonthPay.balance, member_id, null, null, null, null);
                return new Layout.ReturnMsg() { success = false, msg = "店家目前無法受理該筆訂單，請洽店家詢問(超出月撥款金額)" };
            }

            //(2)產生訂單 write order kc_merchanttrade
            string order_no;
            Layout.ReturnMsg ReturnMsg;
            lock (_thisLock)
            {
                //取訂單號
                order_no = new Common().CreateOrderNo(store_no, order_type);
                ReturnMsg = OrderNonMemberDA.WriteOrder_Transaction_3_nonMember(member_id, store_id, store_no, item, price, period, pay, order_no, kc_give_amt, loan_type, order_type);
            }
            if (!ReturnMsg.success) return ReturnMsg;
            if (order_type == "超額") new OrderDA().ClearMemberTradeType(member_id);

            //(2.1) 更新已用額度  
            //ReturnMsg = OrderDA.UpdateAmount(member_no, price);
            //if (!ReturnMsg.success) return ReturnMsg;


            //(3)交易完成 回傳訂單
            return OrderNonMemberDA.GetOrder(store_no, order_no);


        }


        #region api
        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object SendOrder_Transaction_api_nonMember([FromBody] apidata_1 data)
        {
            var authMember = MemberIdentity.Require(this);

            //(0)check flag 可以交易？
            //string msg = new OrderDA().TrandOK_api(authMember.member_id,data.order_type);
            //if (msg != "OK")
            //{
            //    return new Layout.ReturnMsg()
            //    {
            //        success = false,
            //        msg = msg
            //    };
            //}

            //(1)產生訂單 write order kc_merchanttrade
            string order_no;
            Layout.ReturnMsg ReturnMsg;
            lock (_thisLock)
            {
                //取訂單號
                order_no = new Common().CreateOrderNo(data.store_no, data.order_type);
                //寫訂單
                ReturnMsg = new OrderNonMemberDA().WriteOrder_Transaction_api_nonMember(authMember.member_id, data.store_id, data.store_no, data.item, Newtonsoft.Json.JsonConvert.SerializeObject(data.item_list), data.total_cash, data.period, data.pay, order_no, data.loan_type, data.nonce, data.return_url, data.auto_pay, data.order_type);
            }
            if (!ReturnMsg.success) return ReturnMsg;
            if (data.order_type == "超額") new OrderDA().ClearMemberTradeType(authMember.member_id);
            //int give_amt = Convert.ToInt32(ReturnMsg.value);//撥款金額
            //(4.0)主動回傳店家 超額及註冊帶訂單 不會主動回傳 (由分期回傳)
            //var tokenSource = new CancellationTokenSource();
            //CancellationToken ct = tokenSource.Token;
            //var t = Task.Run(() =>
            //{
            //    try
            //    {
            //        new OrderApiController().AutoDealerReturnUrl(order_no,data.order_type);
            //    }
            //    catch (Exception ex)
            //    {
            //        tokenSource.Cancel();
            //        new Common().WriteErrorLog(1, "DUDU API" + data.order_type, "主動回傳傳店家 系統錯誤：" + ex.Message + "訂單：" + order_no, null, null, null, null, null);
            //    }
            //}, tokenSource.Token);



            //(4)交易完成 回傳訂單   
            //return new OrderDA().GetOrder(data.store_no, order_no);

            //(4)交易完成 回傳訂單   
            Layout.ReturnMsg result = new OrderDA().GetOrder(data.store_no, order_no);
            if (!result.success)
            {
                return result;
            }
            else
            {
                //轉回店家頁面 
                using (var db = new kcsddb2Entities_new())
                {
                    var duduapi = db.z_DuDuApi.Where(x => x.nonce == data.nonce).FirstOrDefault();
                    if (duduapi != null)
                    {
                        return new Layout.ReturnMsg()
                        {
                            success = true,
                            value = result.value,
                            url = duduapi.redirect_url
                        };
                    }
                    else
                    {
                        return new Layout.ReturnMsg()
                        {
                            success = true,
                            value = result.value,
                            url = ""
                        };
                    }

                }

            }



        }
        #endregion

        #region dudu購買
        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        [HttpPost]
        public Object SendOrder_Transaction_purchase_nonMember([FromBody] apidata_1 data)
        {

           var member_id = GetAuthMember().member_id;
            //(1)產生訂單 write order kc_merchanttrade
            string order_no;
            Layout.ReturnMsg ReturnMsg;
            lock (_thisLock)
            {
                //取訂單號
                order_no = new Common().CreateOrderNo(data.store_no, data.order_type);
                //寫訂單
                ReturnMsg = new OrderNonMemberDA().WriteOrder_Transaction_purchase_nonMember(member_id, data.store_id, data.store_no, data.item, data.total_cash, data.period, data.pay, order_no, data.loan_type, data.order_type,
                    data.product_id, data.item_spec, data.send_type, data.home_name, data.home_mobile, data.home_mark, data.car_name, data.car_mobile, data.car_address, data.car_mark);
            }
            if (!ReturnMsg.success) return ReturnMsg;
            if (data.order_type == "超額") new OrderDA().ClearMemberTradeType(member_id);
            //int give_amt = Convert.ToInt32(ReturnMsg.value);//撥款金額


            //(4.0)主動回傳店家 超額及註冊帶訂單 不會主動回傳 (由分期回傳)
            //var tokenSource = new CancellationTokenSource();
            //CancellationToken ct = tokenSource.Token;
            //var t = Task.Run(() =>
            //{
            //    try
            //    {
            //        new OrderApiController().AutoDealerReturnUrl(order_no,data.order_type);
            //    }
            //    catch (Exception ex)
            //    {
            //        tokenSource.Cancel();
            //        new Common().WriteErrorLog(1, "DUDU API" + data.order_type, "主動回傳傳店家 系統錯誤：" + ex.Message + "訂單：" + order_no, null, null, null, null, null);
            //    }
            //}, tokenSource.Token);

            //(4)交易完成 回傳訂單   
            return new OrderDA().GetOrder(data.store_no, order_no);
        }

        [DuDuPay.Controllers.JwtAuthActionFilter_Consume]
        public Object SendOrder_Transaction_purchase_nonMember_2([FromBody] apidata_2 data)
        {

            var member_id = GetAuthMember().member_id;
            //(1)產生訂單 write order kc_merchanttrade
            string order_no;
            Layout.ReturnMsg ReturnMsg;
            lock (_thisLock)
            {
                //取訂單號
                order_no = new Common().CreateOrderNo(data.store_no, data.order_type);
                //寫訂單
                ReturnMsg = new OrderNonMemberDA().WriteOrder_Transaction_purchase_nonMember_2(member_id, data.store_id, data.store_no, data.item, data.total_cash, data.period, data.pay, order_no, data.loan_type, data.order_type,
                    data.product_id, data.item_spec, data.item_list, data.shipping_fee);
            }
            if (!ReturnMsg.success) return ReturnMsg;
            if (data.order_type == "超額") new OrderDA().ClearMemberTradeType(member_id);
            //int give_amt = Convert.ToInt32(ReturnMsg.value);//撥款金額


            //(4)交易完成 回傳訂單   
            return new OrderDA().GetOrderWithPurchase(data.store_no, order_no, member_id);
        }
        #endregion
    }

    public class apidata_1
    {

        public int store_id { set; get; }
        public string store_no { set; get; }
        public string store_name { set; get; }
        public string item { set; get; }
        public List<itemList> item_list { set; get; }
        public int total_cash { set; get; }
        public int period { set; get; }
        public int pay { set; get; }//期付
                                    //public int pay_cash { set; get; }//撥款金額
                                    //public string member_no { set; get; }
        public string loan_type { set; get; }
        public string nonce { set; get; }
        public string return_url { set; get; }
        public int auto_pay { set; get; }
        public string order_type { set; get; }
        //info
        public int product_id { set; get; }//商品id                 
        public string item_spec { set; get; }//規格
        public int send_type { set; get; }//送貨方式   0宅配 1自取                 
        public string home_name { set; get; }
        public string home_mobile { set; get; }
        public string home_mark { set; get; }
        public string car_name { set; get; }
        public string car_mobile { set; get; }
        public string car_address { set; get; }
        public string car_mark { set; get; }
    }

    public class apidata_2
    {

        public int store_id { set; get; }
        public string store_no { set; get; }
        public string store_name { set; get; }
        public string item { set; get; }
        //public List<itemList> item_list { set; get; }
        public string item_list { set; get; }
        public int total_cash { set; get; }
        public int period { set; get; }
        public int pay { set; get; }//期付
                                    //public int pay_cash { set; get; }//撥款金額
                                    //public string member_no { set; get; }
        public string loan_type { set; get; }
        public string nonce { set; get; }
        public string return_url { set; get; }
        public int auto_pay { set; get; }
        public string order_type { set; get; }
        //info
        public int product_id { set; get; }//商品id                 
        public string item_spec { set; get; }//規格
        public int send_type { set; get; }//送貨方式   0宅配 1自取                 
        public string home_name { set; get; }
        public string home_mobile { set; get; }
        public string home_mark { set; get; }
        public string car_name { set; get; }
        public string car_mobile { set; get; }
        public string car_address { set; get; }
        public string car_mark { set; get; }
        public int shipping_fee { set; get; }
    }

    public class itemList
    {
        public string name { set; get; }
        public int cash { set; get; }
    }

}