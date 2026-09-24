//先encode 後再decode
function getUrlParameter(name) {

    var encode = encodeURIComponent(location.search);
    var uri_dec = decodeURIComponent(encode);

    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(uri_dec) || [, null])[1]
    );
}


function getImagesSize(k_count) {
    var size; var len;
    //if (k_count > 200) {
    //    size = 15;
    //    len = 10;
    //}
    //else if (k_count > 120 && k_count <= 200) {
    //    size = 20;
    //    len = 12;
    //}
    //else if (k_count >= 90 && k_count < 120) {
    //    size = 25;
    //    len = 15;
    //}
    //else { //<90
    //    size = 2015;
    //    len = 10;
    //}


    if (k_count <= 90) {
        size = 22;
        len = 15;
    }
    if (k_count > 90 && k_count <= 120) {
        size = 25;
        len = 15;
    }
    else if (k_count > 120 && k_count <= 200) {
        size = 18;
        len = 11;
    } else {//>200
        size = 20;
        len = 12;
    }

    return {
        size,
        len
    };

};


Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
}


function dateFormate(date) {
    return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2);
}

function timeFormate(date) {
    return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) +
        ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':00';
}

function timeFormateNoItalic(date) {
    return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2) + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
}

function datediff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}


function preCountDate(date, k_count) {
    //var dd = new Date(getDate[1] * 1000);
    var count = 0;
    var pre_date;
    while (count < k_count) {
        pre_date = date.addDays(-1);
        if (pre_date.getDay() != 6 && pre_date.getDay() != 0) {
            count = count + 1;
        }
    }
    return pre_date;

}


function nextCountDate(date, k_count) {
    //var dd = new Date(getDate[1] * 1000);
    var count = 0;
    var next_date;
    while (count < k_count) {
        next_date = date.addDays(1);
        if (next_date.getDay() != 6 && next_date.getDay() != 0) {
            count = count + 1;
        }
    }
    return next_date;

}


var add_minutes = function (dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
}

function checkID(id) {
    id = id.trim().toUpperCase();

    verification = id.match("^[A-Z][12]\\d{8}$")
    if (!verification) {
        return false
    }

    let conver = "ABCDEFGHJKLMNPQRSTUVXYWZIO"
    let weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]

    id = String(conver.indexOf(id[0]) + 10) + id.slice(1);

    checkSum = 0
    for (let i = 0; i < id.length; i++) {
        c = parseInt(id[i])
        w = weights[i]
        checkSum += c * w
    }

    return checkSum % 10 == 0
}


//身分證檢查
//function checkID2(idStr) {
//    // 依照字母的編號排列，存入陣列備用。
//    var letters = new Array('A', 'B', 'C', 'D',
//        'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
//        'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
//        'X', 'Y', 'W', 'Z', 'I', 'O');
//    // 儲存各個乘數
//    var multiply = new Array(1, 9, 8, 7, 6, 5,
//        4, 3, 2, 1);
//    var nums = new Array(2);
//    var firstChar;
//    var firstNum;
//    var lastNum;
//    var total = 0;
//    // 撰寫「正規表達式」。第一個字為英文字母，
//    // 第二個字為1或2，後面跟著8個數字，不分大小寫。
//    var regExpID = /^[a-zA-Z][1|2][0-9]{8}$/i;

//    // 使用「正規表達式」檢驗格式
//    if (idStr.search(regExpID) == -1) {
//        // 基本格式錯誤        
//        return "身分證字號格式錯誤 {範例：A123456789}";
//    } else {
//        // 取出第一個字元和最後一個數字。
//        firstChar = idStr.charAt(0).toUpperCase();
//        lastNum = idStr.charAt(9);
//    }
//    // 找出第一個字母對應的數字，並轉換成兩位數數字。
//    for (var i = 0; i < 26; i++) {
//        if (firstChar == letters[i]) {
//            firstNum = i + 10;
//            nums[0] = Math.floor(firstNum / 10);
//            nums[1] = firstNum - (nums[0] * 10);
//            break;
//        }
//    }
//    // 執行加總計算
//    for (var i = 0; i < multiply.length; i++) {
//        if (i < 2) {
//            total += nums[i] * multiply[i];
//        } else {
//            total += parseInt(idStr.charAt(i - 1)) *
//                multiply[i];
//        }
//    }
//    // 和最後一個數字比對
//    if ((10 - (total % 10)) != lastNum) {
//        return "身份證號碼寫錯了！";
//    }
//    return '';
//}


//image 去背 白色
function removeImgBg(img) {

    //背景顏色 白色
    const rgba = [255, 255, 255, 255];

    // 容差大小
    const tolerance = 60;
    var imgData = null;
    const [r0, g0, b0, a0] = rgba;
    var r, g, b, a;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;
    context.drawImage(img, 0, 0);
    imgData = context.getImageData(0, 0, w, h);

    for (let i = 0; i < imgData.data.length; i += 4) {

        r = imgData.data[i];
        g = imgData.data[i + 1];
        b = imgData.data[i + 2];
        a = imgData.data[i + 3];
        const t = Math.sqrt((r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2 + (a - a0) ** 2);
        if (t <= tolerance) {
            imgData.data[i] = 0;
            imgData.data[i + 1] = 0;
            imgData.data[i + 2] = 0;
            imgData.data[i + 3] = 0;
        }

    }

    context.putImageData(imgData, 0, 0);

    const newBase64 = canvas.toDataURL('image/png');

    img.src = newBase64;
    return img;

};

function removeImgBg2(img) {
    const rgba = [255, 255, 255, 255];
    const tolerance = 60;
    var imgData = null;
    const [r0, g0, b0, a0] = rgba;
    var r, g, b, a;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;

    var img2 = new Image();
    img2.crossOrigin = '';
    img2.onload = function () {
        context.drawImage(this, 0, 0);
        imgData = context.getImageData(0, 0, w, h);
        for (let i = 0; i < imgData.data.length; i += 4) {
            r = imgData.data[i];
            g = imgData.data[i + 1];
            b = imgData.data[i + 2];
            a = imgData.data[i + 3];
            const t = Math.sqrt((r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2 + (a - a0) ** 2);
            if (t <= tolerance) {
                imgData.data[i] = 0;
                imgData.data[i + 1] = 0;
                imgData.data[i + 2] = 0;
                imgData.data[i + 3] = 0;
            }
        }
        context.putImageData(imgData, 0, 0);
        const newBase64 = canvas.toDataURL('image/png');
        img.src = newBase64;

    };
    img2.src = img.src;

    return img2;

};

//未登入或未完成註冊不可連入一些網頁
function NotRegisterReturnSOP(member) {
    if (member.value == null) {
        window.location.href = '../Home/Index';
        return;
    }
    if (member.value != null && member.value.login_ok_msg == '*') {
        window.location.href = '../Home/Index';
        return;
    }
}


PostWebApi = async function (url, jsonParams) {
    const response = await axios({
        method: 'post',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        params: jsonParams
    }).then((response) => {
        //return response;
        //console.log(response.data);
        //if (response.data.msg == 'OK') {
        //    json.value = response.data.data;
        //}

    }).catch((function (error) {
        console.log(error);
    })).finally(() => {
        console.log('完成');
    });

    return response.data;
}

function blockUI(target) {
    var options = {
        baseZ: 99999,
        css: {
            border: 'none',
            backgroundColor: 'transparent',
            zIndex: '99999',
            left: '50%',
            transform: 'translate(-50%)',
        },
        overlayCSS: {
            backgroundColor: '#DCDCDC',
            opacity: 0.6
        },
        message: '<img style="width:4rem;" src="../img/duprocess.gif"/> '

    };

    if (target) {
        $(target).block($.extend({}, options, { centerX: false, centerY: false })); // 關掉外掛自動置中，改用自己的 css 定位
    } else {
        $.blockUI(options); // 鎖定整頁
    }
};

function blockUI_txt() {
    $.blockUI({
        baseZ: 99999,
        css: { border: 'none', backgroundColor: 'none', top: '45%', zIndex: '99999' },
        overlayCSS: { backgroundColor: '#DCDCDC' },
        //message: ' <div class="spinner-border" style="color:#00af9a;" role="status"><span class="visually-hidden" > Loading...</span> </div > '
        message: '<img style="width:4rem;" src="../img/duprocess.gif"/><br>請勿關閉視窗'

    });
};

//全形轉半形
//example
//toASCII("ＡＢＣ"); // 返回 'ABC' 半形
function toASCII(chars) {
    var ascii = '';
    for (var i = 0, l = chars.length; i < l; i++) {
        var c = chars[i].charCodeAt(0);
        //只針對半形去轉換
        if (c >= 0xFF00 && c <= 0xFFEF) {
            c = 0xFF & (c + 0x20);
        }
        ascii += String.fromCharCode(c);
    }
    return ascii;
}




//依金額取得級距/期數
//function getPeriod(_price) {
//    var price = [1000, 3000, 6000, 9000, 12000, 15000, 18000, 24000, 999999];//金額
//    var period = [1, 3, 6, 9, 12, 15, 18, 24, 36];//期數

//    var idx = 0;
//    for (var i = 0; i < price.length; i++) {
//        if (_price <= price[i]) {
//            idx = i;
//            break;
//        }
//    }

//    return period.slice(0, idx + 1);//期數
//}


//依金額取得級距/期數
//_price 輸入的金額
//_periods 利率專案的期數 
function getPeriod(_price, _periods) {
    //console.log(_periods);
    var periods = [];
    //加入金額限制
    var periods_limit = [1, 3, 6, 9, 12, 15, 18, 24, 30];//期數
    var price = [1999, 4999, 5999, 7999, 9999, 14999, 17999, 19999, 9999999];//金額

    var idx = 0;
    for (var i = 0; i < price.length; i++) {
        if (_price <= price[i]) {
            idx = i;
            break;
        }
    }
    var doller_period_limit = periods_limit.slice(idx, idx + 1);//金額期數限制
    //利率專案 期數轉換及判斷
    for (var i = 0; i < _periods.length; i++) {
        //加入1期
        if (i == 0) {
            if (parseInt(_periods[i].Text1) !== 1) periods.push(1);
        }
        //<=金額期數 加入 array
        if (parseInt(_periods[i].Text1) <= doller_period_limit)
            periods.push(parseInt(_periods[i].Text1));
    }
    //console.log(periods);
    return periods;

}

function getPeriodWithDivisor(_price, _periods) {
    if (_price < 800) return;


    //console.log(_periods);
    var periods = [];
    //金額期數限制
    var doller_period_limit = Math.trunc(_price / 800); //只取整數


    //利率專案 期數轉換及判斷
    for (var i = 0; i < _periods.length; i++) {
        //加入1期
        if (i == 0) {
            if (parseInt(_periods[i].Text1) !== 1) periods.push(1);
        }
        //<=金額期數 加入 array
        if (parseInt(_periods[i].Text1) <= doller_period_limit)
            periods.push(parseInt(_periods[i].Text1));
    }
    //console.log(periods);
    return periods;

}


//字符串中是否存在特殊字符
function hasSpecialStr(str) {
    var specialChars = "~·`!！@#$￥%^…&*()（）—-_=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。 ";
    var len = specialChars.length;
    for (var i = 0; i < len; i++) {
        if (str.indexOf(specialChars.substring(i, i + 1)) != -1) {
            return true;
        }
    }
    return false;
}

//有全形
function hasFullShape(str) {
    if (str.match(/[\uff00-\uffff]/g) != null) return true;
    return false;
}

function isNumber(a) {
    if (isNaN(Number(a, 10))) {
        return false;
        //console.log("不是数字");
    }
    else {
        return true;
        //console.log("是数字");
    }
}


function getAndroidVersion(ua) {
    ua = (ua || navigator.userAgent).toLowerCase();
    var match = ua.match(/android\s([0-9\.]*)/i);
    return match ? ' Android ' + match[1] : undefined;
};

function iOSversion() {
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
        // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        return ' IOS ' + [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
    }
}

//使用的瀏覽器
function _getNavigatorVersion() {

    var objappVersion = navigator.appVersion;
    var browserAgent = navigator.userAgent;
    var browserName = navigator.appName;
    var browserVersion = '' + parseFloat(navigator.appVersion);
    var browserMajorVersion = parseInt(navigator.appVersion, 10);
    var Offset, OffsetVersion, ix;

    //console.log(browserAgent);
    //Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.115
    // For Chrome
    if ((OffsetVersion = browserAgent.indexOf("Chrome")) != -1) {
        browserName = "Chrome";
        browserVersion = browserAgent.substring(OffsetVersion + 7);
    }
    // For Microsoft internet explorer
    else if ((OffsetVersion = browserAgent.indexOf("MSIE")) != -1) {
        browserName = "Microsoft Internet Explorer";
        browserVersion = browserAgent.substring(OffsetVersion + 5);
    }
    // EDGE
    //else if ((OffsetVersion = browserAgent.indexOf("Edge")) != -1) {            
    //    console.log("Edge");
    //}
    // For Firefox
    else if ((OffsetVersion = browserAgent.indexOf("Firefox")) != -1) {
        browserName = "Firefox";
    }
    // For Safari
    else if ((OffsetVersion = browserAgent.indexOf("Safari")) != -1) {
        browserName = "Safari";
        browserVersion = browserAgent.substring(OffsetVersion + 7);
        if ((OffsetVersion = browserAgent.indexOf("Version")) != -1)
            browserVersion = browserAgent.substring(OffsetVersion + 8);
    }

    // For other browser "name/version" is at the end of userAgent
    else if ((Offset = browserAgent.lastIndexOf(' ') + 1) <
        (OffsetVersion = browserAgent.lastIndexOf('/'))) {
        browserName = browserAgent.substring(Offset, OffsetVersion);
        browserVersion = browserAgent.substring(OffsetVersion + 1);
        if (browserName.toLowerCase() == browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }

    // Trimming the fullVersion string at
    // semicolon/space if present
    if ((ix = browserVersion.indexOf(";")) != -1)
        browserVersion = browserVersion.substring(0, ix);
    if ((ix = browserVersion.indexOf(" ")) != -1)
        browserVersion = browserVersion.substring(0, ix);


    browserMajorVersion = parseInt('' + browserVersion, 10);
    if (isNaN(browserMajorVersion)) {
        browserVersion = '' + parseFloat(navigator.appVersion);
        browserMajorVersion = parseInt(navigator.appVersion, 10);
    }

    return browserName + '|' + browserVersion + '|' + screen.height + 'x' + screen.width;


}

//檢測手機作業系統
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    console.log(userAgent);
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

//寫入 z_member trade_type
//一律 resolve { success, msg }，不會 reject；msg 為 null 代表已提示過(401 由 header.js 攔截器處理)
function writeMemberOrderType(member_id, _trade_type, _trade_url, trade_info) {
    var fail_msg = '額度申請資料寫入失敗，請稍後再按一次「確認訂單」';
    return axios({
        method: 'post',
        url: '/api/Order/WriteMemberTradeType',
        headers: { 'Content-Type': 'application/json' },
        params: { member_id: member_id, trade_type: _trade_type, trade_url: _trade_url, trade_info: JSON.stringify(trade_info) }
    }).then((response) => {
        console.log(response.data);
        if (response.data.success) {
            return { success: true, msg: null };
        }
        else {
            return { success: false, msg: response.data.msg || fail_msg };
        }

    }).catch((function (error) {
        console.log(error);
        //401 header.js 已 alert 並顯示登入視窗
        if (error.response && error.response.status === 401) {
            return { success: false, msg: null };
        }
        return { success: false, msg: fail_msg };
    })).finally(() => {
        console.log('完成');
    });
}

//隨機產生16碼
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

function base64ToFile(base64Data, fileName) {
    const arr = base64Data.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], fileName, { type: mime })
}

//字元長度
function getDisplayLength(str) {
    let len = 0;

    for (let ch of str) {
        const code = ch.codePointAt(0);

        // 中文 (CJK Unified Ideographs)
        if (code >= 0x4E00 && code <= 0x9FFF) {
            len += 2;
        }
        // 全形字（Fullwidth forms，包含全形英數）
        else if (code >= 0xFF01 && code <= 0xFF60) {
            len += 2;
        }
        // Emoji（常見範圍）
        else if (
            (code >= 0x1F300 && code <= 0x1FAFF) || // 表情符號
            (code >= 0x2600 && code <= 0x26FF)      // 符號型 emoji
        ) {
            len += 2;
        }
        // 其他（半形英數符號）
        else {
            len += 1;
        }
    }

    return len;
}



//依期數計算各項費用
//function getAmtItem(_price, _period) {
//    var period = [1, 3, 6, 9, 12, 15, 18, 24, 36];//期數
//    var per = [1, 2, 3, 4, 5, 6, 7, 8, 9];//費率
//    var idx = 0;
//    for (var i = 0; i < period.length; i++) {
//        if (_period == period[i]) {
//            idx = i;
//            break;
//        }
//    }
//    var feeRate = per[idx];//費率


//    var pay = _price / _period + _price / _period * (feeRate / 100)//首付/分期付 6000/6 * 3%    
//    var fee = _price * feeRate / 100;//手續費
//    var amt = _price + fee;//總應付 = _price + 手續費

//    return [pay, feeRate, fee, amt];//首付,費率,手續費,總應付
//}


//function compAmtItem(_price,) {
//    var price = [1000, 3000, 6000, 9000, 12000, 15000, 18000, 24000, 999999];
//    var rate = [1, 3, 6, 9, 12, 15, 18, 24, 36];
//    var per = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//    //取得級距
//    var idx = 0;
//    for (var i = 0; i < price.length; i++) {
//        if (_price <= price[i]) {
//            idx = i;
//            break;
//        }
//    }

//    var ary_rate = rate.slice(0, idx + 1);//期數
//    //var ary_per = rate.slice(0, idx + 1);
//    var pay = _price / rate[idx] + _price / rate[idx] * (per[idx] / 100)//首付/分期付 6000/6 * 3%    
//    var fee = _price * per[idx] / 100;//手續費
//    var amt = _price + fee;//總應付 = _price + 手續費

//    return [pay, per[idx], fee, amt, ary_rate];//首付,費率,手續費,總應付,可用期數


//}



