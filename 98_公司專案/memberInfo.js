// 發票變數整理 :
// u.voice_type.v : 二聯電子發票 1 || 捐贈發票 3
// u.voice_subtype.v : 手機條碼載具 1 || 東元會員載具 2 || 自然人憑證載具 3
// u.voice_txt_mobile.v : 手機條碼載具 || u.voice_txt_oaddress.v : 東元會員載具 || u.voice_txt_cq.v : 自然人憑證載具 || u.voice_txt_give.v : 捐贈發票單位

const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const u = reactive({
      id: { v: "", error: "0", msg: "" },
      name: { v: "", error: "0", msg: "" },
      birthDay: { v: "", error: "0", msg: "" },
      issue_date: { v: "", error: "0", msg: "" },
      issue_site: { v: "", error: "0", msg: "" },
      issue_reason: { v: "", error: "0", msg: "" },
      address: { v: "", error: "0", msg: "" },
      address_type: { v: false, error: "0", msg: "" },
      current_address: { v: "", error: "0", msg: "" },
      tel: { v: "", error: "0", msg: "" },
      link_name: { v: "", error: "0", msg: "" },
      link_mobile: { v: "", error: "0", msg: "" },
      link_relation: { v: "", error: "0", msg: "" },
      work_type: { v: 0, error: false, msg: "" },
      work_name: { v: "", error: "0", msg: "" },
      work_tel: { v: "", error: "0", msg: "" },
      create_type: { v: 0, error: false, msg: "" },
      create_co: { v: "", error: "0", msg: "" },
      bankCode: { v: "", error: "0", msg: "" },
      bankName: { v: "", error: "0", msg: "" },
      bankAcc: { v: "", error: "0", msg: "" },
      lineId: { v: "", error: "0", msg: "" },
      cash: { v: "", error: "0", msg: "" },
      voice_type: { v: "", error: false, msg: "" },
      voice_subtype: { v: "", error: false, msg: "" },
      //voice_subtype_2: { v: '', error: false, msg: '' },
      voice_txt_mobile: { v: "", error: false, msg: "" },
      voice_txt_give: { v: "", error: false, msg: "" },
      voice_txt_cq: { v: "", error: false, msg: "" },
      //voice_txt_comp: { v: '', error: false, msg: '' },
      voice_txt_oaddress: { v: "", error: false, msg: "" },
    });
    const time_msg = ref("");
    const showPassword = ref(false);
    const pwFieldType = ref("password");
    const showTypePage = reactive({
      v1: false,
      v2: false,
      v3: false,
      v4: false,
      v1_1: false,
      v1_2: false,
      v1_3: false,
    });

    onMounted(() => {
      //var order_amount = JSON.parse(localStorage.getItem('order_amount'));
      //console.log(order_amount);

      //console.log(member.value);
      //未登入或己完成註冊
      //if (member.value == null || member.value.login_ok_msg == '*') {
      //    window.location.href = '../Home/Index';
      //    return;
      //}
      if (member.value == null) {
        window.location.href = "../Home/Index";
        return;
      }

      //自動帶入資料
      if (member.value != null) {
        //read set data id, name...
        blockUI();
        axios({
          method: "post",
          url: "/api/Member/MemberInfoInit",
          headers: { "Content-Type": "application/json" },
          //params: { id: member.value.id, }
        })
          .then((response) => {
            if (response.data.success) {
              var data = response.data.value;
              u.id.v = data.id_no;
              u.name.v = data.name;
              u.birthDay.v = data.birthday;
              u.issue_date.v = data.issue_date;
              u.issue_site.v = data.issue_site;
              u.issue_reason.v = data.issue_reason;
              u.address.v = data.address;
              u.current_address.v = data.curr_address;
              u.tel.v = data.curr_tel;
              u.link_name.v = data.contact_person_name;
              u.link_mobile.v = data.contact_person_tel;
              u.link_relation.v = data.contact_person_relation;
              u.work_type.v = data.employment_state;
              u.voice_type.v = data.voice_type;
              u.voice_txt_mobile.v = data.voice_txt_mobile;
              u.voice_txt_give.v = data.voice_txt_give;
              u.voice_subtype.v = data.voice_subtype;
              //u.voice_subtype_2.v = data.voice_subtype_2;

              u.voice_txt_cq.v = data.voice_txt_cq;
              //u.voice_txt_comp.v = data.voice_txt_comp;
              u.voice_txt_oaddress.v = data.voice_txt_oaddress;

              u.work_name.v = data.company_name;
              u.work_tel.v = data.company_tel;
              u.create_type.v = data.credit_state;
              u.create_co.v = data.credit_bank;
              u.bankCode.v = data.refund_bank_no;
              u.bankName.v = data.refund_bank_name;
              u.bankAcc.v = data.refund_bank_acc;
              u.lineId.v = data.line_id;
              u.cash.v = data.credit_amount;
              switch (data.voice_type) {
                case "1":
                  showTypePage.v1 = true;
                  switch (data.voice_subtype) {
                    case "1":
                      showTypePage.v1_1 = true;
                      break;
                    case "2":
                      showTypePage.v1_2 = true;
                      break;
                    case "3":
                      showTypePage.v1_3 = true;
                      break;
                    default:
                  }
                  break;
                case "2":
                  showTypePage.v2 = true;
                  break;
                case "3":
                  showTypePage.v3 = true;
                  break;
                case "4":
                  showTypePage.v4 = true;
                  break;
                default:
              }
            } else {
              alert(response.data.msg);
            }
          })
          .catch(function (error) {
            $.unblockUI();
          })
          .finally(() => {
            $.unblockUI();
          });
      }
    });

    eye = () => {
      pwFieldType.value = pwFieldType.value == "password" ? "text" : "password";
      showPassword.value = !showPassword.value;
    };

    //check id_no 是否已註冊過
    _checkIdno = (_idno) => {
      blockUI();

      return new Promise((resolve, reject) => {
        axios({
          method: "post",
          url: "/api/Member/CheckIdNo",
          headers: { "Content-Type": "application/json" },
          params: {
            //member_id: member.value.id,
            id_no: _idno,
            msg_txt: "註冊填寫基本資料",
          },
        })
          .then((response) => {
            $.unblockUI();
            resolve(response);
          })
          .catch(function (error) {
            $.unblockUI();
            //console.log(error);
            reject(error);
          })
          .finally(() => {});
      });
    };

    const scrollToFirstError = () => {
      Vue.nextTick(() => {
        const el = document.querySelector(
          "#register-form .error_border, #register-form .error_border_radio",
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        }
      });
    };

    const Send = async (u) => {
      //check 發票索取方式
      if (!u.voice_type.v || !["1", "3"].includes(u.voice_type.v)) {
        u.voice_type.error = true;
        u.voice_type.msg = "請選擇發票索取方式";
      } else {
        u.voice_type.error = false;
        u.voice_type.msg = "";
      }

      //檢查二聯電子發票
      if (u.voice_type.v == "1") {
        if (!["1", "2", "3"].includes(u.voice_subtype.v)) {
          u.voice_type.error = true;
          u.voice_type.msg = "請選擇二聯電子發票";
        }

        //請輸入手機條碼
        if (u.voice_subtype.v == "1") {
          if (!u.voice_txt_mobile.v || u.voice_txt_mobile.v == "") {
            //null
            u.voice_txt_mobile.error = "ng";
            u.voice_txt_mobile.msg = "請輸入手機條碼";
          } else {
            const patt = /^\/[0-9A-Z.+-]{7}$/;
            if (!patt.test(u.voice_txt_mobile.v)) {
              u.voice_txt_mobile.error = "ng";
              u.voice_txt_mobile.msg = "手機條碼格式錯誤";
            } else {
              u.voice_txt_mobile.error = "ok";
              u.voice_txt_mobile.msg = "";
            }
          }
        } else {
          u.voice_txt_mobile.error = "ok";
          u.voice_txt_mobile.msg = "";
        }

        //東元會員載具
        if (u.voice_subtype.v == "2") {
          if (!u.voice_txt_oaddress.v || u.voice_txt_oaddress.v == "") {
            //null
            u.voice_txt_oaddress.error = "ng";
            u.voice_txt_oaddress.msg = "請輸入中獎發票地址";
          } else {
            u.voice_txt_oaddress.error = "ok";
            u.voice_txt_oaddress.msg = "";
          }
        } else {
          u.voice_txt_oaddress.error = "ok";
          u.voice_txt_oaddress.msg = "";
        }

        //自然人憑證
        if (u.voice_subtype.v == "3") {
          if (!u.voice_txt_cq.v || u.voice_txt_cq.v == "") {
            //null
            u.voice_txt_cq.error = "ng";
            u.voice_txt_cq.msg = "請輸入自然人憑證";
          } else {
            var regexp = /^[A-Z]{2}[0-9]{14}$/;
            if (regexp.test(u.voice_txt_cq.v)) {
              u.voice_txt_cq.error = "ok";
              u.voice_txt_cq.msg = "";
            } else {
              u.voice_txt_cq.error = "ng";
              u.voice_txt_cq.msg =
                "自然人憑證格式錯誤(總長16碼字元，前兩碼為大寫英文，後14碼為數字)";
            }
          }
        } else {
          u.voice_txt_cq.error = "ok";
          u.voice_txt_cq.msg = "";
        }
      } else {
        u.voice_txt_mobile.error = "ok";
        u.voice_txt_mobile.msg = "";
        u.voice_txt_cq.error = "ok";
        u.voice_txt_cq.msg = "";
        u.voice_txt_oaddress.error = "ok";
        u.voice_txt_oaddress.msg = "";
      }

      //檢查三聯電子發票
      //if (u.voice_type.v == '2') {
      //    //請輸入統編
      //    if (!u.voice_txt_comp.v || u.voice_txt_comp.v == '') {//null
      //        u.voice_txt_comp.error = 'ng';
      //        u.voice_txt_comp.msg = '請輸入統一編號';
      //    }
      //    else {
      //        if (u.voice_txt_comp.v.toString().length !== 8) {
      //            u.voice_txt_comp.error = 'ng';
      //            u.voice_txt_comp.msg = '統一編號 限8碼數字';
      //        }
      //        else {
      //            u.voice_txt_comp.error = 'ok';
      //            u.voice_txt_comp.msg = '';
      //        }
      //    }

      //}
      //else {
      //    u.voice_txt_comp.error = 'ok';
      //    u.voice_txt_comp.msg = '';
      //}

      //檢查捐贈發票
      if (u.voice_type.v == "3") {
        if (!u.voice_txt_give.v || u.voice_txt_give.v == "") {
          //null
          u.voice_txt_give.error = "ng";
          u.voice_txt_give.msg = "請選擇捐贈單位";
        } else {
          u.voice_txt_give.error = "ok";
          u.voice_txt_give.msg = "";
        }
      } else {
        u.voice_txt_give.error = "ok";
        u.voice_txt_give.msg = "";
      }

      //檢查紙本發票
      //if (u.voice_type.v == '4') {
      //    if (!u.voice_subtype_2.v || u.voice_subtype_2.v == '') {
      //        u.voice_type.error = true;
      //        u.voice_type.msg = '請選擇紙本發票';
      //    }

      //    if (u.voice_subtype_2.v == '3') {
      //        if (!u.voice_txt_oaddress.v || u.voice_txt_oaddress.v == '') {//null
      //            u.voice_txt_oaddress.error = 'ng';
      //            u.voice_txt_oaddress.msg = '請填寫其他地址';
      //        }
      //        else {
      //            u.voice_txt_oaddress.error = 'ok';
      //            u.voice_txt_oaddress.msg = '';
      //        }
      //    }
      //    else {
      //        u.voice_txt_oaddress.error = 'ok';
      //        u.voice_txt_oaddress.msg = '';
      //    }
      //}
      //else {
      //    u.voice_txt_oaddress.error = 'ok';
      //    u.voice_txt_oaddress.msg = '';
      //}

      //check id
      //檢查第二碼英文為外國人 數字才是台人
      if (u.id.v == "") {
        u.id.error = "ng";
        u.id.msg = "請輸入身份證號碼";
      } else {
        if (isNum(u.id.v.substr(1, 1))) {
          if (!checkID(u.id.v)) {
            u.id.error = "ng";
            u.id.msg = "身份證號碼寫錯了";
          } else {
            try {
              let res = await _checkIdno(u.id.v);
              if (res.data.success) {
                u.id.error = "ok";
                u.id.msg = "";
              } else {
                u.id.error = "ng";
                u.id.msg = res.data.msg;
              }
            } catch (err) {
              u.id.error = "ng";
              u.id.msg = "請求出錯,請再試一次";
            }
          }
        }
      }

      //------------------------------------
      //check name
      //if (u.name.v == '') {
      //    u.name.error = 'ng';
      //    u.name.msg = "姓名不可空白";
      //}
      //else {
      //    u.name.error = 'ok';
      //    u.name.msg = '';
      //}
      //------------------------------------
      //check birthday
      //if (u.birthDay.v == '') {
      //    u.birthDay.error = 'ng';
      //    u.birthDay.msg = "生日不可空白";
      //}
      //else {
      //    u.birthDay.error = 'ok';
      //    u.birthDay.msg = '';
      //}
      //------------------------------------
      //check 發證日期
      //if (u.issue_date.v == '' || !checkIssueDate(u.issue_date.v)) {
      //    u.issue_date.error = 'ng';
      //    u.issue_date.msg = "發證日期 不可空白";
      //}
      //else {
      //    u.issue_date.error = 'ok';
      //    u.issue_date.msg = '';
      //}
      //check 發證地點
      //if (!checkSite(u.issue_site.v)) {
      //    u.issue_site.error = 'ng';
      //    u.issue_site.msg = "發證縣市 不可空白";
      //}
      //else {
      //    u.issue_site.error = 'ok';
      //    u.issue_site.msg = '';
      //}
      //check 補換發
      //if (!checkReason(u.issue_reason.v)) {
      //    u.issue_reason.error = 'ng';
      //    u.issue_reason.msg = "補換發 不可空白";
      //}
      //else {
      //    u.issue_reason.error = 'ok';
      //    u.issue_reason.msg = '';
      //}

      //------------------------------------
      //check 戶籍地址
      //if (u.address.v == '') {
      //    u.address.error = 'ng';
      //    u.address.msg = '戶籍地址不可空白';
      //    //return;
      //}
      //else {
      //    u.address.error = 'ok';
      //    u.address.msg = '';
      //}

      //------------------------------------
      //check 居住地址
      if (!u.address_type.v && u.current_address.v == "") {
        u.current_address.error = "ng";
        u.current_address.msg = "居住地址不可空白";
        //return;
      } else {
        u.current_address.error = "ok";
        u.current_address.msg = "";
      }
      //------------------------------------
      //check 居住電話
      //var mobil = /^(0\d+)-(\d{7,8})|^09[0-9]{8}$/;
      var mobil = /^(0\d+)-(\d{7,8})(?:(?:#)(\d+))?$|^09[0-9]{8}$/;
      if (u.tel.v != "") {
        if (u.tel.v.search(mobil) == -1) {
          u.tel.error = "ng";
          u.tel.msg = "電話號碼格式錯誤(02-12345678)或(0912345678)";
          //return;
        } else {
          u.tel.error = "ok";
          u.tel.msg = "";
        }
      } else {
        u.tel.error = "ok";
        //    u.tel.msg = '';
      }

      //------------------------------------
      //check 聯絡人姓名
      if (u.link_name.v == "") {
        u.link_name.error = "ng";
        u.link_name.msg = "聯絡人姓名不可空白";
        //return;
      } else {
        u.link_name.error = "ok";
        u.link_name.msg = "";
      }

      //------------------------------------
      //check 聯絡人手機
      var mobil = /^09[0-9]{8}$/;
      if (u.link_mobile.v.search(mobil) == -1) {
        u.link_mobile.error = "ng";
        u.link_mobile.msg = "手機號碼格式錯誤 {範例：0920123456}";
        //return;
      } else {
        u.link_mobile.error = "ok";
        u.link_mobile.msg = "";
      }
      //check 聯絡人關係
      if (u.link_relation.v == "") {
        u.link_relation.error = "ng";
        u.link_relation.msg = "聯絡人關係必須填寫";
      } else {
        u.link_relation.error = "ok";
        u.link_relation.msg = "";
      }

      //------------------------------------
      //check 工作公司
      if (u.work_type.v == 0) {
        u.work_type.error = true;
        u.work_type.msg = "不可空白";
        //return;
      } else {
        u.work_type.error = false;
        u.work_type.msg = "";
      }

      //------------------------------------
      //check 公司名稱
      if (u.work_name.v == "") {
        u.work_name.error = "ng";
        u.work_name.msg = "公司名稱/學校不可空白";
        //return;
      } else {
        u.work_name.error = "ok";
        u.work_name.msg = "";
      }
      //------------------------------------
      //check 公司電話
      var mobil = /^(0\d+)-(\d{7,8})(?:(?:#)(\d+))?$|^09[0-9]{8}$/;
      if (u.work_tel.v != "") {
        if (u.work_tel.v.search(mobil) == -1) {
          u.work_tel.error = "ng";
          u.work_tel.msg = "電話號碼格式錯誤(02-12345678)或(0912345678)";
          //return;
        } else {
          u.work_tel.error = "ok";
          u.work_tel.msg = "";
        }
      } else {
        u.work_tel.error = "ok";
        u.work_tel.msg = "";
      }

      //------------------------------------
      //check 發卡銀行  有卡 無卡
      if (u.create_type.v == 0) {
        u.create_type.error = true;
        u.create_type.msg = "信用卡發卡銀行不可空白";
      } else {
        u.create_type.error = false;
        u.create_type.msg = "";
      }
      //------------------------------------
      //check 發卡銀行
      if (u.create_type.v == 1) {
        if (u.create_co.v == "") {
          u.create_co.error = "ng";
          u.create_co.msg = "發卡銀行不可空白";
          //return;
        } else {
          u.create_co.error = "ok";
          u.create_co.msg = "";
        }
      }

      if (u.create_type.v == 2) {
        u.create_co.error = "ok";
        u.create_co.msg = "";
      }

      //------------------------------------
      //退款銀行代號
      if (u.bankCode.v != "") {
        if (!isNumber(u.bankCode.v) || u.bankCode.v.length > 4) {
          u.bankCode.error = "ng";
          u.bankCode.msg = "銀行代號只能數字且不可過長";
        } else {
          u.bankCode.error = "ok";
          u.bankCode.msg = "";
        }
      } else {
        u.bankCode.error = "ok";
        //    u.bankCode.msg = '';
      }
      //退款銀行帳號
      if (u.bankAcc.v != "") {
        if (!isNumber(u.bankAcc.v) || u.bankAcc.v.length > 20) {
          u.bankAcc.error = "ng";
          u.bankAcc.msg = "銀行帳號只能數字且不可過長";
        } else {
          u.bankAcc.error = "ok";
          u.bankAcc.msg = "";
        }
      } else {
        u.bankAcc.error = "ok";
        //    u.bankAcc.msg = '';
      }

      //check line id
      if (u.lineId.v == "") {
        u.lineId.error = "ng";
        u.lineId.msg = "Line ID 不可空白";
        //return;
      } else {
        u.lineId.error = "ok";
        u.lineId.msg = "";
      }

      if (
        //u.pay_pw.error == 'ok' && u.pay_repw.error == 'ok' &&
        u.id.error == "ok" &&
        //6個不檢查
        //&& u.name.error == 'ok' && u.birthDay.error == 'ok'
        //&& u.issue_date.error == 'ok' && u.issue_site.error == 'ok' && u.issue_reason.error == 'ok'
        //&& u.address.error == 'ok'
        u.current_address.error == "ok" &&
        u.link_name.error == "ok" &&
        u.link_mobile.error == "ok" &&
        !u.work_type.error &&
        u.work_name.error == "ok" &&
        u.work_tel.error == "ok" &&
        !u.create_type.error &&
        u.create_co.error == "ok" &&
        u.link_relation.error == "ok" &&
        u.bankCode.error == "ok" &&
        //&& u.bankName.error == 'ok'
        u.bankAcc.error == "ok" &&
        u.voice_txt_mobile.error == "ok" &&
        u.voice_txt_give.error == "ok" &&
        u.voice_txt_cq.error == "ok" &&
        u.voice_txt_oaddress.error == "ok" &&
        !u.voice_type.error &&
        u.lineId.error == "ok"
      ) {
        blockUI();
        axios({
          method: "post",
          url: "/api/Member/MemberInfo",
          headers: { "Content-Type": "application/json" },
          params: {
            id_no: u.id.v,
            name: u.name.v,
            birthDay: u.birthDay.v,
            issue_date: u.issue_date.v,
            issue_site: u.issue_site.v,
            issue_reason: u.issue_reason.v,
            address: u.address.v,
            current_address: u.current_address.v,
            tel: u.tel.v,
            link_name: u.link_name.v,
            link_mobile: u.link_mobile.v,
            link_relation: u.link_relation.v,
            work_type: u.work_type.v,
            work_name: u.work_name.v,
            work_tel: u.work_tel.v,
            create_type: u.create_type.v,
            create_co: u.create_co.v,
            bankCode: u.bankCode.v,
            bankName: u.bankName.v,
            bankAcc: u.bankAcc.v,
            lineId: u.lineId.v,
            cash: u.cash.v,
            voice_type: u.voice_type.v,
            voice_txt_mobile: u.voice_txt_mobile.v,
            voice_txt_give: u.voice_txt_give.v,

            voice_subtype: u.voice_subtype.v,
            //voice_subtype_2: u.voice_subtype_2.v,
            voice_txt_cq: u.voice_txt_cq.v,
            //voice_txt_comp: u.voice_txt_comp.v,
            voice_txt_oaddress: u.voice_txt_oaddress.v,
          },
        })
          .then((response) => {
            $.unblockUI();
            if (response.data.success) {
              window.location.href = "../Home/TwcaVerify_1"; //綜合
              //var order_amount = JSON.parse(localStorage.getItem('order_amount'));
              //console.log(order_amount);
              ////綜合
              //if (order_amount == null) {
              //    window.location.href = '../Home/TwcaVerify_1';//綜合
              //}
              //else {
              //    if (order_amount.ok)
              //        window.location.href = '../Home/TwcaVerify_1';//綜合
              //    else
              //        window.location.href = '../Home/MemberSign2';//超額
              //}
            } else {
              alert(response.data.msg);
            }
          })
          .catch(function (error) {
            $.unblockUI();
          })
          .finally(() => {});
      } else {
        scrollToFirstError();
      }
    };

    //同戶籍地
    change = (v) => {
      if (v) u.current_address.v = u.address.v;
      else u.current_address.v = "";
    };

    //選取發證日期
    _setIssueDate = (dateTW) => {
      u.issue_date.v = dateTW;
    };

    changeVoice = (_type) => {
      // 先全部清空
      u.voice_subtype.v = "";
      u.voice_txt_mobile.v = ""; // 手機條碼載具
      u.voice_txt_oaddress.v = ""; // 東元會員載具
      u.voice_txt_cq.v = ""; // 自然人憑證載具
      u.voice_txt_give.v = ""; // 捐贈發票單位

      switch (_type) {
        case 1: //二聯電子發票
          showTypePage.v1 = true;
          showTypePage.v2 = false;
          showTypePage.v3 = false;
          showTypePage.v4 = false;
          break;
        //case 2://三聯電子發票
        //    showTypePage.v1 = false;
        //    showTypePage.v2 = true;
        //    showTypePage.v3 = false;
        //    showTypePage.v4 = false;
        //    u.voice_subtype.v = '';//init
        //    break;
        case 3: //捐贈發票
          showTypePage.v1 = false;
          showTypePage.v2 = false;
          showTypePage.v3 = true;
          showTypePage.v4 = false;
          u.voice_subtype.v = ""; //init
          break;
        //case 4://索取紙本發票
        //    showTypePage.v1 = false;
        //    showTypePage.v2 = false;
        //    showTypePage.v3 = false;
        //    showTypePage.v4 = true;
        //    u.voice_subtype.v = '';//init
        //    break;
        default:
      }
    };

    //二聯電子發票 子項目
    changeVoice1_1 = (_type) => {
      // 先全部清空
      u.voice_txt_mobile.v = ""; // 手機條碼載具
      u.voice_txt_oaddress.v = ""; // 東元會員載具
      u.voice_txt_cq.v = ""; // 自然人憑證載具

      switch (_type) {
        case 1: //手機條碼載具
          showTypePage.v1_1 = true;
          showTypePage.v1_2 = false;
          showTypePage.v1_3 = false;
          break;
        case 2: //東元會員載具
          showTypePage.v1_1 = false;
          showTypePage.v1_2 = true;
          showTypePage.v1_3 = false;
          break;
        case 3: //自然人憑證載具
          showTypePage.v1_1 = false;
          showTypePage.v1_2 = false;
          showTypePage.v1_3 = true;
          break;
        default:
      }
    };

    //三聯電子發票 子項目
    //changeVoice2 = (_type) => {
    //    switch (_type) {
    //        case 1: //手機條碼載具
    //            showTypePage.v2_1 = true;
    //            break;
    //        default:
    //    }
    //}

    return {
      u,
      Send,
      time_msg,
      minLength: 8,
      maxLength: 18,
      showPassword,
      pwFieldType,
      eye,
      change,
      changeVoice,
      changeVoice1_1,
      showTypePage,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

function initDatepickerTW() {
  (function () {
    var yearTextSelector = ".ui-datepicker-year";

    var dateNative = new Date(),
      dateTW = new Date(
        dateNative.getFullYear() - 1911,
        dateNative.getMonth(),
        dateNative.getDate(),
      );

    function leftPad(val, length) {
      var str = "" + val;
      while (str.length < length) {
        str = "0" + str;
      }
      return str;
    }

    // 應該有更好的做法
    var funcColle = {
      onSelect: {
        basic: function (dateText, inst) {
          /*
                    var yearNative = inst.selectedYear < 1911
                        ? inst.selectedYear + 1911 : inst.selectedYear;*/
          dateNative = new Date(
            inst.selectedYear,
            inst.selectedMonth,
            inst.selectedDay,
          );

          // 年分小於100會被補成19**, 要做例外處理
          var yearTW =
            inst.selectedYear > 1911
              ? leftPad(inst.selectedYear - 1911, 4)
              : inst.selectedYear;
          var monthTW = leftPad(inst.selectedMonth + 1, 2);
          var dayTW = leftPad(inst.selectedDay, 2);
          dateTW = new Date(
            yearTW + "-" + monthTW + "-" + dayTW + "T00:00:00.000Z",
          );
          var selectDay = $.datepicker.formatDate(
            twSettings.dateFormat,
            dateTW,
          );
          _setIssueDate(selectDay);
          return selectDay;
        },
      },
    };

    var twSettings = {
      closeText: "關閉",
      prevText: "上個月",
      nextText: "下個月",
      currentText: "今天",
      monthNames: [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
      ],
      monthNamesShort: [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
      ],
      dayNames: [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ],
      dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
      weekHeader: "周",
      dateFormat: "yy/m/d",
      firstDay: 1,
      isRTL: false,
      showMonthAfterYear: true,
      yearSuffix: "年",

      onSelect: function (dateText, inst) {
        $(this).val(funcColle.onSelect.basic(dateText, inst));
        if (typeof funcColle.onSelect.newFunc === "function") {
          funcColle.onSelect.newFunc(dateText, inst);
        }
      },
    };

    // 把yearText換成民國
    var replaceYearText = function () {
      var $yearText = $(".ui-datepicker-year");

      if (twSettings.changeYear !== true) {
        $yearText.text("民國" + dateTW.getFullYear());
      } else {
        // 下拉選單
        if ($yearText.prev("span.datepickerTW-yearPrefix").length === 0) {
          $yearText.before("<span class='datepickerTW-yearPrefix'>民國</span>");
        }
        $yearText.children().each(function () {
          if (parseInt($(this).text()) > 1911) {
            $(this).text(parseInt($(this).text()) - 1911);
          }
        });
      }
    };

    $.fn.datepickerTW = function (options) {
      // setting on init,
      if (typeof options === "object") {
        //onSelect例外處理, 避免覆蓋
        if (typeof options.onSelect === "function") {
          funcColle.onSelect.newFunc = options.onSelect;
          options.onSelect = twSettings.onSelect;
        }
        // year range正規化成西元, 小於1911的數字都會被當成民國年
        if (options.yearRange) {
          var temp = options.yearRange.split(":");
          for (var i = 0; i < temp.length; i += 1) {
            //民國前處理
            if (parseInt(temp[i]) < 1) {
              temp[i] = parseInt(temp[i]) + 1911;
            } else {
              temp[i] =
                parseInt(temp[i]) < 1911 ? parseInt(temp[i]) + 1911 : temp[i];
            }
          }
          options.yearRange = temp[0] + ":" + temp[1];
        }
        // if input val not empty
        if ($(this).val() !== "") {
          options.defaultDate = $(this).val();
        }
      }

      // setting after init
      if (arguments.length > 1) {
        // 目前還沒想到正常的解法, 先用轉換成init setting obj的形式
        if (arguments[0] === "option") {
          options = {};
          options[arguments[1]] = arguments[2];
        }
      }

      // override settings
      $.extend(twSettings, options);

      // init
      $(this).datepicker(twSettings);

      // beforeRender
      $(this).click(function () {
        var isFirstTime = $(this).val() === "";

        // year range and default date
        if ((twSettings.defaultDate || twSettings.yearRange) && isFirstTime) {
          if (twSettings.defaultDate) {
            $(this).datepicker("setDate", twSettings.defaultDate);
          }

          // 當有year range時, select初始化設成range的最末年
          if (twSettings.yearRange) {
            var $yearSelect = $(".ui-datepicker-year"),
              nowYear = twSettings.defaultDate
                ? $(this).datepicker("getDate").getFullYear()
                : dateNative.getFullYear();

            $yearSelect.children(":selected").removeAttr("selected");
            if ($yearSelect.children("[value=" + nowYear + "]").length > 0) {
              $yearSelect
                .children("[value=" + nowYear + "]")
                .attr("selected", "selected");
            } else {
              $yearSelect.children().last().attr("selected", "selected");
            }
          }
        } else {
          $(this).datepicker("setDate", dateNative);
        }

        $(this).val($.datepicker.formatDate(twSettings.dateFormat, dateTW));

        replaceYearText();

        if (isFirstTime) {
          $(this).val("");
        }
      });

      // afterRender
      $(this).focus(function () {
        replaceYearText();
      });

      return this;
    };
  })();

  $(".datepickerTW").datepickerTW({
    changeYear: true,
    changeMonth: true,
    dateFormat: "yy-m-d",
    yearRange: "80:2025",
    // defaultDate: '110-11-1',
  });
  //$('.datepicker').datepicker({
  //    changeYear: true,
  //    changeMonth: true,
  //    dateFormat: 'yy-mm-dd'
  //    // yearRange: '1911:2018',
  //    // defaultDate: '2016-11-01'
  //});
}

// memberInfo.js 是透過 loadVersionedScripts 非同步載入,手機網路較慢時
// window 的 load 事件可能在這支 script 掛上監聽器之前就已經觸發過了,
// 導致民國年 datepicker 沒有初始化。若 load 已經發生過就直接執行。
if (document.readyState === "complete") {
  initDatepickerTW();
} else {
  $(window).on("load", initDatepickerTW);
}

function isNum(val) {
  return !isNaN(val);
}

window.mobilecheck = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function checkIssueDate(dateString) {
  const regex = /^\d{2,3}-\d{1,2}-\d{1,2}$/;
  return regex.test(dateString);
}

function checkSite(_site) {
  var site = [
    "北縣",
    "宜縣",
    "桃縣",
    "竹縣",
    "苗縣",
    "中縣",
    "彰縣",
    "投縣",
    "雲縣",
    "嘉縣",
    "南縣",
    "高縣",
    "屏縣",
    "東縣",
    "花縣",
    "澎縣",
    "基市",
    "竹市",
    "嘉市",
    "連江",
    "金門",
    "北市",
    "高市",
    "新北市",
    "中市",
    "南市",
    "桃市",
  ];

  for (var i = 0; i < site.length; i++) {
    if (_site == site[i]) {
      return true;
    }
  }

  return false;
}

function checkReason(_reason) {
  var reason = ["初發", "補發", "換發"];

  for (var i = 0; i < reason.length; i++) {
    if (_reason == reason[i]) {
      return true;
    }
  }
  return false;
}
