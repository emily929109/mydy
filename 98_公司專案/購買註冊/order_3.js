

const App = {



    setup() {
        const member = ref(JSON.parse(localStorage.getItem('member')));
        const json = ref({});
        const selected = ref('');
        const periods = ref({});
        const mobile = ref('');
        const sendCoded = ref(false);//otp
        const otp_code = ref('');//otp
        const verify_code = ref('');//otp
        const showBar = ref(false);//otp
        const showtxtMsg = ref(false);//otp
        const confirmOrder = ref({});
        const showPayDetail = ref(false);
        const loan_type = ref('');
        const interest_periods = ref([]);
        const show_preiod_div = ref(false);
        const checked = ref(false);
        const dudu_order = JSON.parse(localStorage.getItem('dudu_order'));
        const test_order = ref('');
        //const register_push_store = ref('');


        onMounted(() => {
            if (dudu_order != null) test_order.value = dudu_order.order_type;

        });

        // data 內容為 base64 加密字串，QRCode 產生時已用 encodeURIComponent 編碼過(避免 +,/,= 被部分手機或APP誤判)
        // URLSearchParams 會把舊版(未encode)的QRCode +號解析成空白，因此需用 decodeURIComponent
        getQueryParam = (name) => {
            var m = RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
            if (!m) return null;
            try {
                return decodeURIComponent(m[1]);
            } catch (e) {
                return m[1];
            }
        };

        _initLoad = () => {
            //解碼 url 檢查是否可交易 Code是否在有效期限
            var _data = getQueryParam('data');
            var _store_id = getQueryParam('c');//store table id
            if (_data != null && _store_id != null) {
                axios({
                    method: 'post',
                    url: '/api/OrderCheck/OrderCheckInit_3',
                    headers: { 'Content-Type': 'application/json' },
                    params: { data: _data, store_id: _store_id }
                }).then((response) => {
                    console.log(response.data);
                    if (response.data.success) {
                        //register_push_store.value = response.data.store_no;
                    }
                    else {
                        alert(response.data.msg);
                        window.location.href = '../Home/Index';
                        return;
                    }
                }).catch((function (error) {
                    console.log(error);
                })).finally(() => {

                    console.log('完成');
                });
            }
            //--------------------------------


            var member = JSON.parse(localStorage.getItem('member'));
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


            //交易不可為特約商
            if (member != null && member.login_ok_msg == '*' && member.role == 'dealer') {
                alert('目前為特約商角色，請先登出！')
                window.location.href = '../Home/Index';
                return;
            }


            //解碼 url 檢查是否可交易 Code是否在有效期號號
            var _data = getQueryParam('data');
            var _store_id = getQueryParam('c');//store table id
            //console.log(_data);
            if (_data != null && _store_id != null) {
                axios({
                    method: 'post',
                    url: '/api/Order/OrderInit_3',
                    headers: { 'Content-Type': 'application/json' },
                    params: { data: _data, store_id: _store_id }
                }).then((response) => {

                    console.log(response.data);
                    if (response.data.success) {
                        json.value = JSON.parse(response.data.value);
                        json.value.kc_perd_fee = 0;//init                        
                        selected.value = '';//init 
                        loan_type.value = response.data.interest.loan_type;//init 利率方案
                        interest_periods.value = response.data.interest.periods;//init 期數     


                        //超額  例外處理 確認訂單
                        if (dudu_order != null && dudu_order.order_type == '超額') {
                            console.log(dudu_order);
                            var trade_info = JSON.parse(decodeURIComponent(dudu_order.trade_info));
                            json.value = trade_info;
                            selected.value = { n: trade_info.period };
                            $('#nonMember_orderConfirm_modal').modal('show');
                        }
                        //-------------------------------------

                    }
                    else {
                        alert(response.data.msg);
                        window.location.href = '../Home/Index';
                    }


                }).catch((function (error) {
                    console.log(error);
                })).finally(() => {

                    console.log('完成');
                });
            }
            else {
                window.location.href = '../Home/Index';
                return;
            }




        }



        //選擇期數
        Change = (_selected) => {
            if (_selected == '') {
                showPayDetail.value = false;//hide
                return;
            }
            //console.log(_selected);
            showPayDetail.value = true;//show

            json.value.kc_perd_fee = _selected.cash;//期付  
        };

        //試算
        tryPay = async (_price) => {
            var member = JSON.parse(localStorage.getItem('member'));
            if (member == null) {
                $('#authentication-modal').modal('show');
                return;
            }

            if (_price == '' || _price == 0) {
                alert('請輸入金額!');
                return;
            }

            //可能R利率 須要用金額去帶期數 沒有事先討論 被女PM硬幹 這裡很乱哈哈~
            //console.log(loan_type.value.substr(0, 1));
            if (loan_type.value.substr(0, 1) == 'R') {
                let ress = await _orderTry(_price);
                console.log(ress);
                if (ress.data.success) {
                    //json.value = JSON.parse(res.data.value);                       
                    loan_type.value = ress.data.interest.loan_type;//init 利率方案
                    interest_periods.value = ress.data.interest.periods;//init 期數     
                    //console.log(json.value);
                    //console.log(loan_type.value);
                    //console.log(interest_periods.value);
                }
                else {
                    alert(ress.data.msg);
                    return;
                }
            }


            //---------------------------------------
            //convert to int array
            var period = [];
            console.log(interest_periods.value);
            console.log(_price);
            interest_periods.value.forEach(x => {
                //50000以下 最高21期
                if (_price <= 50000) {
                    if (parseInt(x.Text1) <= 21) {
                        period.push(parseInt(x.Text1));
                    }
                }
                else {
                    period.push(parseInt(x.Text1));
                }
            });

            let res = await get_periods_800(loan_type.value, _price, period, member.id, json.value.store_no);
            console.log(res);
            if (res.data.success) {
                //get Dictionary  key value
                var key = [];
                for (var c in res.data.value) {
                    if (res.data.value.hasOwnProperty(c)) {
                        key.push({ n: c, cash: res.data.value[c] });
                        //console.log(res.data.value[c]); //value
                    }
                }
                //console.log(key);
                if (key.length > 0) {
                    selected.value = '';//init
                    show_preiod_div.value = true;//show period div
                    showPayDetail.value = false;

                    periods.value = key;
                }
                else {
                    alert('此金額沒有分期期數');
                    show_preiod_div.value = false;//show period div
                    showPayDetail.value = false;
                }
            }
            else {
                alert(res.data.msg);
            }
        }


        _orderTry = (_price) => {
            var _data = getQueryParam('data');
            var _store_id = getQueryParam('c');//store table id

            return new Promise((resolve, reject) => {
                axios({
                    method: 'post',
                    url: '/api/Order/OrderInit_3_Try',
                    headers: { 'Content-Type': 'application/json' },
                    params: { data: _data, store_id: _store_id, price: _price }
                }).then((response) => {
                    resolve(response);
                }).catch((function (error) {
                    reject(error);
                    console.log(error);
                })).finally(() => {
                    console.log('完成');
                });

            });
        }

        //金額改變
        cashChanged = (event) => {

            showPayDetail.value = false; //應付 hide      
            show_preiod_div.value = false;//show period div
            //preiod_disabled.value = false; //期數 show

        };

        //依期數再呼叫 不可低於800的期數
        get_periods_800 = (loan_type, cash, periods, member_id, _store_no) => {

            //showPayDetail.value = true;//show
            //json.value.kc_perd_fee = 0;//init

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


        //otp
        showOTP = (_price) => {

            console.log(_price);

            var member = JSON.parse(localStorage.getItem('member'));
            //console.log(member.value);
            if (member == null) {
                $('#authentication-modal').modal('show');
                return;
            }

            if (member.role == 'dealer') {
                alert('此帳號為特約商帳號，不能消費');
                return;
            }

            if (_price == '' || typeof _price === 'undefined' || json.value.kc_perd_fee == 0) {
                alert('請輸入金額！')
                return;
            }

            //註冊帶訂單            
            if (dudu_order != null && dudu_order.order_type == '註冊帶訂單') {
                $('#nonMember_orderConfirm_modal').modal('show');
                return;
            }
            else {
                //已經是會員 檢查額度是否可以消費                
                _checkAmount(member.kc_member_no, _price, member.mobile);

            }

            //檢查是否可以消費           
            //_checkAmount(member.kc_member_no, _price, member.mobile);


        };



        //檢查是否可以消費
        _checkAmount = (_member_no, _price, _mobile) => {
            var _order_type = '';
            if (dudu_order != null && dudu_order.order_type == '註冊帶訂單') {
                _order_type = '註冊帶訂單';
            }
            else if (dudu_order != null && dudu_order.order_type == '超額') {
                _order_type = '超額';
            }

            blockUI();
            axios({
                method: 'post',
                url: '/api/Order/CheckAmount',
                headers: { 'Content-Type': 'application/json' },
                params: { member_no: _member_no, price: _price, txt_msg: '店家QR 消費前檢查', order_type: _order_type }
            }).then((response) => {
                $.unblockUI();

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
                            //$('#change_cash_modal').modal('show');
                            _trade_type = '超額';
                            _trade_url = window.location.href;
                            //寫入 trade_type 成功後才顯示額度不足(見下方)
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
                        json.value.period = selected.value.n;
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
                    //無會員資料 註冊帶訂單 可以下單
                    if (dudu_order != null && dudu_order.order_type == '註冊帶訂單' && response.data.msg.indexOf('無會員資料')) {
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

        confirm = (_json, _selected) => {
            //check otp Num 
            if (otp_code.value == '' || verify_code.value != otp_code.value) {
                alert('驗證碼錯誤');
                return;
            }


            var member = JSON.parse(localStorage.getItem('member'));


            blockUI_txt();
            axios({
                method: 'post',
                url: '/api/Order/SendOrder_Transaction_3',
                headers: { 'Content-Type': 'application/json' },
                params: {
                   // member_id: member.id,
                    store_id: _json.id,
                    store_no: _json.store_no,
                    store_name: _json.store_name,
                    item: _json.item,
                    price: _json.price,
                    period: parseInt(_selected.n),
                    pay: _json.kc_perd_fee,
                    //pay: parseInt(_json.kc_perd_fee.replaceAll(',', '')),
                    member_no: member.kc_member_no,
                    loan_type: loan_type.value,//利率方案
                    order_type: '綜合',
                }
            }).then((response) => {
                $.unblockUI();
                // console.log(response.data);
                if (response.data.success) {
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

        //註冊帶訂單或超額
        nonMemberConfirm = (_json, _selected) => {
            //check otp Num 
            //if (otp_code.value == '' || verify_code.value != otp_code.value) {
            //    alert('驗證碼錯誤');
            //    return;
            //}

            console.log(_json);
            console.log(_selected);
            console.log(loan_type.value);

            var member = JSON.parse(localStorage.getItem('member'));


            blockUI_txt();
            axios({
                method: 'post',
                url: '/api/OrderNonMember/SendOrder_Transaction_3_nonMember',
                headers: { 'Content-Type': 'application/json' },
                params: {
                    //member_id: member.id,
                    store_id: _json.id,
                    store_no: _json.store_no,
                    store_name: _json.store_name,
                    item: _json.item,
                    price: _json.price,
                    period: parseInt(_selected.n),
                    pay: _json.kc_perd_fee,
                    //pay: parseInt(_json.kc_perd_fee.replaceAll(',', '')),
                    //member_no: member.kc_member_no,
                    loan_type: loan_type.value,//利率方案                    
                    order_type: dudu_order.order_type == '註冊帶訂單' || dudu_order.order_type == '超額' ? dudu_order.order_type : '綜合'
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
                    localStorage.removeItem('dudu_order');
                    $('#nonMember_orderConfirm_modal').modal('hide');
                    $('#finishmsg').modal('show');
                    confirmOrder.value = response.data.value;
                    //price >30000 call api line notify
                    if (_json.price >= 30000)
                        _price_30000(_json.store_no, _json.price, response.data.value.order_no);
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
                params: { member_id: member.id, time: _checked }
                //params: { time: _checked }
            }).then((response) => {
                $.unblockUI();
                //console.log(response.data);
                if (response.data.success) {
                    localStorage.removeItem('dudu_order');
                    localStorage.removeItem('member');
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
                    member_id: member.id,//會員序號
                    data: getQueryParam('data'),
                    order_type: 3,
                    store_id: getQueryParam('c')
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
            showPayDetail, tryPay, show_preiod_div, cashChanged,
            nonMemberConfirm, Close, ApplyCash, checked, test_order
        };


    }



};

Vue.createApp(App).mount('#app');





$(window).on('load', function () {
    _initLoad();

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
        // $(".msg").text("時間過期!");
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
