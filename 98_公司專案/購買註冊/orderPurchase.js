


const App = {



    setup() {
        const member = ref(JSON.parse(localStorage.getItem('member')));
        const json = ref({ kc_perd_fee: 0, price: 0 });
        const periods = ref([]);
        const selected = ref('');
        const mobile = ref('');
        const sendCoded = ref(false);//otp
        const otp_code = ref('');//otp
        const verify_code = ref('');//otp
        const showBar = ref(false);//otp
        const showtxtMsg = ref(false);//otp
        const confirmOrder = ref({});
        const loan_type = ref('');
        const checked = ref(false);
        const isSubmitting = ref(false);//防止重複送出訂單
        const dudu_order = JSON.parse(localStorage.getItem('dudu_order'));
        const test_order = ref('');

        onMounted(async () => {

            console.log(dudu_order);
            if (dudu_order != null) test_order.value = dudu_order.order_type;

        });

        initLoad = async () => {


            //----------------------------
            //var member = JSON.parse(localStorage.getItem('member'));
            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) {
                $('#authentication-modal').modal('show');
                return;
            }
            if (member.role && member.role === "dealer") {
                $('#authentication-modal').modal('show');
                return;
            }

            //手機時 且如果是註冊帶訂單  因在簽名頁登入時 此時 login_ok_msg還是null 回到order_2 會要求再登一次             
            if (dudu_order != null && dudu_order.order_type == '註冊帶訂單') {
                if (member == null) {
                    $('#authentication-modal').modal('show');
                    return;
                }
            }
            else {
                if (member == null || (member.login_ok_msg && member.login_ok_msg != '*')) {
                    $('#authentication-modal').modal('show');
                    return;
                }
            }

            try {

                //(1)
                let res = await _initLoad();
                console.log(res);
                if (res.data.success) {
                    json.value = JSON.parse(res.data.value);
                    json.value.kc_perd_fee = 0;//init    
                    selected.value = '';//init 
                    loan_type.value = res.data.interest.loan_type;//init 

                    //(2)依金額取期數                        
                    //var tmp_periods = await getPeriodWithDivisor(json.value.price, res.data.interest.periods);

                    //(3)再call api 取不可低於800的期數                    
                    var period = [];
                    res.data.interest.periods.forEach(x => {
                        period.push(parseInt(x.Text1));//convert to int array
                    });
                    let ress = await get_periods_800(loan_type.value, json.value.total_cash, period, member.id, json.value.store_no);
                    console.log(ress);
                    if (ress.data.success) {
                        //get Dictionary  key value
                        var key = [];
                        for (var c in ress.data.value) {
                            if (ress.data.value.hasOwnProperty(c)) {
                                key.push(c);
                                //console.log(ress.data.value[c]); //value
                            }
                        }
                        periods.value = key;

                        //超額  例外處理 確認訂單
                        if (dudu_order != null && dudu_order.order_type == '超額') {
                            console.log(dudu_order);
                            var trade_info = JSON.parse(decodeURIComponent(dudu_order.trade_info));
                            json.value = trade_info;
                            selected.value = trade_info.period;
                            //json.value = JSON.parse(decodeURIComponent(order_amount.order));
                            //selected.value = order_amount.period;
                            $('#nonMember_orderConfirm_modal').modal('show');
                        }
                        //---------------------------------
                    }
                    else {
                        alert(ress.data.msg);
                    }

                    console.log(json.value);

                }
                else {
                    alert(res.data.msg);
                    window.location.href = '../Home/Index';
                }

            } catch (err) {
                console.log(err);
            }
        }

        //解密
        _initLoad = () => {
            //交易不可為特約商
            if (member.value != null && member.value.login_ok_msg == '*' && member.value.role == 'dealer') {
                alert('目前為特約商角色，請先登出！')
                window.location.href = '../Home/Index';
                return;
            }

            //解碼 url 檢查是否可交易 Code是否在有效期
            var _data = getUrlParameter('data');
            //console.log(_data);
            if (_data != 'null') {

                blockUI();
                return new Promise((resolve, reject) => {

                    axios({
                        method: 'post',
                        url: '/api/OrderPurchase/PurchaseOrderInit_2',
                        headers: { 'Content-Type': 'application/json' },
                        params: { data: _data }

                    }).then((response) => {
                        $.unblockUI();
                        resolve(response);

                    }).catch((function (error) {
                        $.unblockUI();
                        reject(error);
                        //console.log(error);
                    })).finally(() => {
                        console.log('完成');
                    });
                });


            }
            else {
                window.location.href = '../Home/Index';
                return;
            }
        }

        //依期數再呼叫 不可低於800的期數
        get_periods_800 = (loan_type, cash, periods, member_id, _store_no) => {
            console.log(loan_type);
            console.log(cash);
            console.log(periods);
            console.log(member_id);
            console.log(_store_no);
            blockUI();
            return new Promise((resolve, reject) => {

                axios({
                    method: 'post',
                    url: '/api/Order/GetPeriod_800',
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        loan_type: loan_type,
                        cash: cash,
                        periods: periods,
                        //member_id: member_id,
                        store_no: _store_no
                    }//金額/期數
                }).then((response) => {
                    $.unblockUI();
                    resolve(response);
                }).catch((function (error) {
                    $.unblockUI();
                    reject(error);
                    //console.log(error);
                })).finally(() => {
                    console.log('完成');
                });
            });



        }

        //選擇期數
        Change = (_selected) => {
            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) {
                selected.value = '';//init
                $('#authentication-modal').modal('show');
                return;
            }
            //console.log(_selected);        
            //console.log(loan_type.value);
            //alert(json.value.store_no);
            blockUI();
            axios({
                method: 'post',
                url: '/api/Order/GetdsMoneyCal_forDUDUPAY',
                headers: { 'Content-Type': 'application/json' },
                params: {
                    loan_type: loan_type.value,
                    cash: json.value.total_cash,
                    period: _selected,
                   // member_id: member.id,
                    store_no: json.value.store_no
                }//金額/期數
            }).then((response) => {
                $.unblockUI();
                //console.log(response.data);
                if (response.data.success) {
                    json.value.kc_perd_fee = response.data.value.kc_perd_fee;//期付   
                    json.value.kc_give_amt = response.data.value.kc_give_amt//撥款金額                    

                }
                else {
                    alert(response.data.msg);
                    json.value.kc_perd_fee = 0;//init
                }

            }).catch((function (error) {
                $.unblockUI();
                console.log(error);
            })).finally(() => {

                console.log('完成');
            });

        };



        //otp
        showOTP = (_selected, _price) => {

            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) {
                $('#authentication-modal').modal('show');
                return;
            }
            if (member.role == 'dealer') {
                alert('此帳號為特約商帳號，不能消費');
                return;
            }

            if (_selected == '' || json.value.kc_perd_fee == '') {
                alert('請選擇分期期數')
                return;
            }

            console.log(member);
            console.log(_selected);
            console.log(_price);


            _checkAmount(member.kc_member_no, _price, member.mobile);

            //註冊帶訂單            
            //if (dudu_order != null && dudu_order.order_type == '註冊帶訂單') {
            //    $('#nonMember_orderConfirm_modal').modal('show');
            //    return;
            //}
            //else {
            //    //已經是會員 檢查額度是否可以消費                
            //    _checkAmount(member.kc_member_no, _price, member.mobile);

            //}

        };

        //檢查是否可以消費
        _checkAmount = (_member_no, _price, _mobile) => {
            var _order_type = '註冊帶訂單';

            if (dudu_order != null && dudu_order.order_type == '超額') _order_type = '超額';


            //var _order_type = '';
            //if (dudu_order != null && dudu_order.order_type == '註冊帶訂單') {
            //    _order_type = '註冊帶訂單';
            //}
            //else if (dudu_order != null && dudu_order.order_type == '超額') {
            //    _order_type = '超額';
            //}
            blockUI();
            axios({
                method: 'post',
                url: '/api/Order/CheckAmount',
                headers: { 'Content-Type': 'application/json' },
                params: { member_no: _member_no, price: _price, txt_msg: 'DUDU商城 下單 消費前檢查', order_type: _order_type }
            }).then((response) => {
                $.unblockUI();
                console.log(response.data);

                if (response.data.success) {
                    var _trade_type = ''; var _trade_url = '';
                    switch (response.data.type) {
                        case 0://額度夠(綜合)
                            //localStorage.removeItem('dudu_order');                            
                            //顯示 OTP    
                            _trade_type = '足額';
                            verify_code.value = '';
                            $('#otp_msg').modal('show');
                            mobile.value = _mobile.slice(0, 4) + 'XXX' + _mobile.slice(7, 10);
                            break;
                        case -1://可用金額不足 可以交易 (超額)
                            //localStorage.removeItem('dudu_order'); 
                            _trade_type = '超額';
                            _trade_url = window.location.href;
                            console.log(json.value);
                            console.log(selected);
                            //寫入 trade_type 成功後才顯示額度不足(見下方)
                            //$('#change_cash_modal').modal('show');
                            //$('#nonMember_orderConfirm_modal').modal('show');                            
                            break;
                        case 1://提示後 繼續交易
                            //localStorage.removeItem('dudu_order');    
                            _trade_type = '足額';
                            alert('您有逾期帳單未繳, 請盡早完成繳納以免影響您的消費, 如您已完成繳納,則無需理會本通知');
                            verify_code.value = '';
                            $('#otp_msg').modal('show');
                            mobile.value = _mobile.slice(0, 4) + 'XXX' + _mobile.slice(7, 10);
                            break;
                        case 2://提示 不可交易
                            $('#notCust_modal').modal('show');
                            break;
                    }
                    //write z_member trade_type
                    test_order.value = _trade_type;
                    if (response.data.type == 0 || response.data.type == -1 || response.data.type == 1) {
                        var member = JSON.parse(localStorage.getItem('member'));
                        json.value.period = selected.value;
                        //console.log(json.value);
                        var writing = writeMemberOrderType(member.id, _trade_type, _trade_url, json.value);

                        if (response.data.type == -1) {
                            //超額 寫入成功才可申請
                            blockUI();
                            writing.then((result) => {
                                $.unblockUI();
                                if (result.success) $('#cash-ample-modal').modal('show');
                                else if (result.msg) alert(result.msg);
                            });
                        }
                        else {
                            //足額 不中止流程
                            writing.then((result) => {
                                if (!result.success) console.log('writeMemberOrderType 足額寫入失敗', result.msg);
                            });
                        }
                    }
                }
                else {
                    if (response.data.msg.indexOf('無會員資料') !== -1 ) {
                        var dudu_order = { order_type: '註冊帶訂單', order_url: '' };                       
                        localStorage.setItem('dudu_order', JSON.stringify(dudu_order));   
                        
                        $('#nonMember_orderConfirm_modal').modal('show');
                        return;
                    }
                    alert(response.data.msg);
                }

            }).catch((function (error) {
                $.unblockUI();
                console.log(error);
            })).finally(() => {
                console.log('完成');
            });


        }

        //otp
        var intervalID;
        sendOTP = () => {

            //debug
            //$('#otp_msg').modal('show');
            //timeBar();
            //showBar.value = true;
            //return;          

            var member = JSON.parse(localStorage.getItem('member'));

            axios({
                method: 'post',
                url: '/api/Member/SendMobileCode',
                headers: { 'Content-Type': 'application/json' },
                params: { mobile: member.mobile }
            }).then((response) => {
                //console.log(response.data);
                if (response.data.success) {
                    //自動OTP填入
                    navigator.credentials.get({
                        otp: { transport: ['sms'] }
                    }).then(otp => {
                        verify_code.value = otp.code;
                    });

                    clearInterval(intervalID);
                    //disabled
                    sendCoded.value = true;
                    intervalID = setInterval(function () {
                        sendCoded.value = false;
                    }, 1000 * 60 * 5);
                    //clearInterval(intervalID);
                    //console.log(sendCoded.value);
                    //keep otp code
                    otp_code.value = response.data.value;
                    //show time bar
                    verify_code.value = '';
                    $('#otp_msg').modal('show');
                    timeBar();
                    showBar.value = true;
                    showtxtMsg.value = true;

                }
                else {
                    alert('發送驗證碼失敗！');
                }
            }).catch((function (error) {
                console.log(error);
            })).finally(() => {
                console.log('完成');
            });
        };

        //綜合
        confirm = async (_json, _selected) => {
            //防止連點造成重複送單
            if (isSubmitting.value) return;

            var member = JSON.parse(localStorage.getItem('member'));

            if (otp_code.value == '' || verify_code.value != otp_code.value) {
                alert('驗證碼錯誤');
                return;
            }

            if (_json.kc_give_amt == null) {
                alert('撥款金額有誤,請洽客服人員');
                return;
            }

            var _payload;
            try {
                _payload = {
                    //member_id: member.id,//會員序號
                    store_id: _json.id,//店家 序號
                    store_no: _json.store_no,//BO01
                    store_name: _json.store_name,//店家名
                    item: _json.item,//品項
                    item_list: JSON.stringify(_json.item_list),//明細
                    total_cash: _json.total_cash,//總金額
                    period: _selected,
                    pay: parseInt(_json.kc_perd_fee.replaceAll(',', '')),//期付                    
                    ////pay_cash: parseInt(_json.kc_give_amt.replaceAll(',', '')),//撥款金額                    
                    member_no: member.kc_member_no,
                    loan_type: loan_type.value,//利率方案


                    //nonce: _json.nonce,
                    //return_url: _json.return_url,
                    //auto_pay: _json.auto_pay,
                    order_type: '綜合',
                    ////info
                    product_id: _json.product_id,//商品id
                    item_spec: _json.item_spec,//規格
                    //send_type: _json.send_type,//送貨方式
                    //home_name: _json.home_name,
                    //home_mobile: _json.home_mobile,
                    //home_mark: _json.home_mark,
                    //car_name: _json.car_name,
                    //car_mobile: _json.car_mobile,
                    //car_address: _json.car_address,
                    //car_mark: _json.car_mark,
                    shipping_fee: _json.shipping_fee,
                };
            } catch (e) {
                alert('訂單資料有誤,請重新整理頁面後再試');
                return;
            }

            isSubmitting.value = true;
            blockUI_txt();

            try {
                const response = await axios({
                    method: 'post',
                    url: '/api/OrderPurchase/SendOrder_Transaction_purchase_2',
                    headers: { 'Content-Type': 'application/json' },
                    data: _payload
                });

                if (response.data && response.data.success) {
                    //init opt
                    otp_code.value = '';
                    verify_code.value = '';
                    showBar.value = false;
                    $('#otp_msg').modal('hide');
                    //show order detail binding
                    $('#orderConfirm_modal').modal('show');
                    confirmOrder.value = response.data.value;

                    //price >30000 call api line notify
                    if (_json.price >= 30000)
                        _price_30000(_json.store_no, _json.price, response.data.value.order_no);

                    //檢查購物車
                    if (response.data.value.cart && response.data.value.cart.success) {
                        console.log(response.data.value.cart.groups)

                        // 1. 更新header icon
                        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: response.data.value.cart.groups }));

                        // 2. 更新local storage，跨頁資料同步
                        const storedMember = JSON.parse(localStorage.getItem('member'));
                        if (storedMember) {
                            storedMember.cart = { success: true, groups: response.data.value.cart.groups };
                            localStorage.setItem('member', JSON.stringify(storedMember));
                        }
                    }
                }
                else {
                    alert((response.data && response.data.msg) || '下單失敗,請稍後再試');
                }
            } catch (error) {
                if (error.response) {
                    //伺服器回應非 2xx
                    alert('請稍後再試 (錯誤碼 ' + error.response.status + ')');
                } else if (error.request) {
                    //已送出但無回應（斷線、CORS、逾時之外的網路問題）
                    alert('網路連線異常,請確認網路後再試');
                } else {
                    alert('發生未知錯誤,請稍後再試');
                }
            } finally {
                $.unblockUI();
                isSubmitting.value = false;
                console.log('完成');
            }
        };

        //註冊帶訂單或超額
        nonMemberConfirm = (_json, _selected) => {
            console.log(_json);
            console.log(_selected);
            //check otp Num 
            //if (otp_code.value == '' || verify_code.value != otp_code.value) {
            //    alert('驗證碼錯誤');
            //    return;
            //}



            //防呆
            if (_json.kc_give_amt == null) {
                alert('撥款金額有誤,請洽客服人員');
                return;
            }
            var member = JSON.parse(localStorage.getItem('member'));
            console.log(member);
            console.log(loan_type.value)

            console.log(dudu_order);

            const _dudu_order = JSON.parse(localStorage.getItem('dudu_order'));
            blockUI_txt();
            axios({
                method: 'post',
                url: '/api/OrderNonMember/SendOrder_Transaction_purchase_nonMember_2',
                headers: { 'Content-Type': 'application/json' },
                data: {
                    //member_id: member.id,//會員序號
                    store_id: _json.id,//店家 序號 
                    store_no: _json.store_no,//BO01
                    store_name: _json.store_name,//店家名
                    item: _json.item,//品項
                    item_list: JSON.stringify(_json.item_list),//明細
                    total_cash: _json.total_cash,//總金額
                    period: _selected,
                    pay: parseInt(_json.kc_perd_fee.replaceAll(',', '')),//期付                    
                    //pay_cash: parseInt(_json.kc_give_amt.replaceAll(',', '')),//撥款金額                    
                    //member_no: member.kc_member_no,
                    loan_type: loan_type.value,//利率方案
                    //nonce: _json.nonce,
                    //return_url: _json.return_url,
                    //auto_pay: _json.auto_pay,
                    order_type: _dudu_order.order_type == '註冊帶訂單' || _dudu_order.order_type == '超額' ? _dudu_order.order_type : '綜合',                   
                    //info
                    product_id: _json.product_id,//商品id                 
                    item_spec: _json.item_spec,//規格
                    //send_type: _json.send_type,//送貨方式                   
                    //home_name: _json.home_name,
                    //home_mobile: _json.home_mobile,
                    //home_mark: _json.home_mark,
                    //car_name: _json.car_name,
                    //car_mobile: _json.car_mobile,
                    //car_address: _json.car_address,
                    //car_mark: _json.car_mark,
                    shipping_fee: _json.shipping_fee,

                }
            }).then((response) => {
                $.unblockUI();
                // console.log(response.data);
                if (response.data.success) {
                    //init opt
                    //otp_code.value = '';
                    //verify_code.value = '';
                    //showBar.value = false;
                    //$('#otp_msg').modal('hide');
                    //show order detail binding
                    //$('#orderConfirm_modal').modal('show');
                    localStorage.removeItem('dudu_order');
                    $('#nonMember_orderConfirm_modal').modal('hide');
                    $('#finishmsg').modal('show');



                    //confirmOrder.value = response.data.value;                   
                    //price >30000 call api line notify
                    if (_json.price >= 30000)
                        _price_30000(_json.store_no, _json.price, response.data.value.order_no);

                    //檢查購物車
                    if (response.data.value.cart && response.data.value.cart.success) {
                        console.log(response.data.value.cart.groups)
                        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: response.data.value.cart.groups }));
                    }

                }
                else {
                    alert(response.data.msg);
                }

            }).catch((function (error) {
                $.unblockUI();
                console.log(error);
            })).finally(() => {
                console.log('完成');
            });
        };

        _price_30000 = (_store_no, _price, _order_no) => {
            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) return;

            //console.log(_member_no);
            //console.log(_store_no);
            //console.log(_price);
            //console.log(_order_no);
            blockUI_txt();
            axios({
                method: 'post',
                url: '/api/Order/CheckPrice_30000',
                headers: { 'Content-Type': 'application/json' },
                params: {
                    //member_id: member.id,
                    store_no: _store_no,
                    price: _price,
                    order_no: _order_no
                }
            }).then((response) => {
                $.unblockUI();
                //console.log(response.data);
                if (response.data.success) {

                }
                else {
                    //console.log(response.data.msg);
                }

            }).catch((function (error) {
                $.unblockUI();
                console.log(error);
            })).finally(() => {
                console.log('完成');
            });
        }

        //bar 時間過期
        code_timeout = () => {
            otp_code.value = '';
        };

        //完成註冊
        const Close = (_checked) => {
            if (!_checked) {
                alert('請選擇方便聯絡您的時間！');
                return;
            }

            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) {
                $('#authentication-modal').modal('show');
                return;
            }


            blockUI();
            //axios write db           
            axios({
                method: 'post',
                url: '/api/OrderNonMember/CloseTime',
                headers: { 'Content-Type': 'application/json' },
                //params: { member_id: member.id, time: _checked }
                params: {  time: _checked }
            }).then((response) => {
                $.unblockUI();
                console.log(response.data);
                if (response.data.success) {
                    localStorage.removeItem('order_register');
                    localStorage.removeItem('dudu_order');
                    //localStorage.removeItem('member');

                    //eantodo 回傳
                    //檢查購物車
                    if (response.data.cart && response.data.cart.success) {
                        console.log(response.data.cart.groups)
                        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: response.data.cart.groups }));
                    }

                    $('#finishmsg').modal('hide');
                    alert('申請完成');
                    window.location.href = '../Home/Index';
                }
                else {
                    alert(response.data.msg);
                }

            }).catch((function (error) {
                console.log(error);
            })).finally(() => {
                $.unblockUI();
                console.log('Close 完成');
            });


        };

        //超額立即申請 沒討論硬幹只好硬寫sorry
        ApplyCash = () => {
            var member = JSON.parse(localStorage.getItem('member'));
            //console.log(member)
            //寫入推薦碼 member           
            blockUI();
            axios({
                method: 'post',
                url: '/api/Order/SetPushCode',
                headers: { 'Content-Type': 'application/json' },
                params: {
                    //member_id: member.id,//會員序號
                    data: getUrlParameter('data'),
                    order_type: 0,
                    store_id: ''
                }
            }).then((response) => {
                $.unblockUI();
                console.log(response.data);
                if (response.data.success) {
                    window.location.href = '../Home/UploadFile?type=D&noshow=1';
                }
                else {
                    alert(response.data.msg);
                }

            }).catch((function (error) {
                $.unblockUI();
                console.log(error);
            })).finally(() => {
                console.log('完成');
            });
        }

        return {
            Change, showOTP, json, periods, selected,
            mobile, sendOTP, confirm, sendCoded, showBar, showtxtMsg, verify_code, confirmOrder,
            nonMemberConfirm, Close, ApplyCash, checked, test_order, isSubmitting
        };


    }



};

Vue.createApp(App).mount('#app');





$(window).on('load', function () {

    //var member = JSON.parse(localStorage.getItem('member'));
    //if (member == null) {
    //    $('#authentication-modal').modal('show');
    //    return;
    //}
    //if (member.role == 'dealer') {
    //    $('#authentication-modal').modal('show');
    //    return;
    //}

    initLoad();

});


//-----------------------------------
// Timer Bar
//-----------------------------------
// 目標時間(要倒數幾秒)。
const targetSeconds = 300;
var timerId
function timeBar() {
    clearInterval(timerId);

    // 起始時間(計時器的啟動時間)。
    const startTime = new Date().getTime();
    // 初始化。
    init(targetSeconds);
    // start the timer.
    timerId = setInterval(function () { timer(startTime); }, 1000);
};

// timer.
var timer = function (startTime) {
    // 當前時間。
    var currentTime = new Date().getTime();

    // 當前時間 - 起始時間 = 經過時間。(因為不需要毫秒，所以將結果除以1000。)
    var diffSec = Math.round((currentTime - startTime) / 1000);

    // 目標時間 - 經過時間 = 剩餘時間。
    var remainingTime = targetSeconds - diffSec;

    // update progess.  
    update(remainingTime);

    if (remainingTime == 0) {
        code_timeout();
        // stop the timer.
        clearInterval(timerId);

        // do anything you want to.
        $(".text").text("時間過期!");
    }
}



// 初始化。此處借用update函式來初次設定進度條。
function init(seconds) {
    update(seconds);
}

// update progess with the timer.
function update(seconds) {
    barRenderer(seconds);
    textRenderer(seconds);
}

// refresh the bar.
function barRenderer(seconds) {
    var percent = (seconds / targetSeconds) * 100;
    $(".bar").css("width", percent + "%");
}

// refresh the text of the bar.
function textRenderer(seconds) {
    var sec = seconds % 60;
    var min = Math.floor(seconds / 60);

    /* 兩種作法都可以 */
    //min = min > 9 ? min : "0" + min;
    //sec = sec > 9 ? sec : "0" + sec;  
    min = min.toString().padStart(2, '0');
    sec = sec.toString().padStart(2, '0');

    $(".text").text(min + ":" + sec);
}
