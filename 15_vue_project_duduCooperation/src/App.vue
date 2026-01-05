<script setup>
import { ref, onMounted, nextTick, watch, reactive, computed } from "vue";
import axios from "axios";

const u = ref({});
const msg = reactive({
  c_city: false,
  c_town: false,
  c_address: false,
  c_contact_city: false,
  c_contact_town: false,
  c_contact_addr: false,
  c_dealer_desc: false,
  c_dealer_type1: false,
  c_dealer_type2: false,
  c_name: false,
  c_phone: false,
  c_product_class: false,
  c_taxid_no: false,
  p_city: false,
  p_town: false,
  p_address: false,
  p_contact_city: false,
  p_contact_town: false,
  p_contact_addr: false,
  p_dealer_desc: false,
  p_dealer_type1: false,
  p_dealer_type2: false,
  p_idno: false,
  p_name: false,
  p_phone: false,
  p_product_class: false,
});
const prd_class = ref([]); //儲存回傳的產品類別資料
const cities = ref([]); // 儲存api回傳的縣市資料
const selectedCityIndex1 = computed(() =>
  cities.value.findIndex((item) => item.CityName === u.value.c_city)
);
watch(selectedCityIndex1, async (newIndex) => {
  await nextTick();
  areaChoicesInstance = _initSingleChoice(
    areaChoicesInstance,
    areaSelectRef.value
  );
});

const selectedCityIndex2 = computed(() =>
  cities.value.findIndex((item) => item.CityName === u.value.c_contact_city)
);
watch(selectedCityIndex2, async (newIndex) => {
  await nextTick();
  areaChoicesInstance2 = _initSingleChoice(
    areaChoicesInstance2,
    areaSelectRef2.value
  );
});

const selectedCityIndex3 = computed(() =>
  cities.value.findIndex((item) => item.CityName === u.value.p_city)
);
watch(selectedCityIndex3, async (newIndex) => {
  await nextTick();
  areaChoicesInstance3 = _initSingleChoice(
    areaChoicesInstance3,
    areaSelectRef3.value
  );
});

const selectedCityIndex4 = computed(() =>
  cities.value.findIndex((item) => item.CityName === u.value.p_contact_city)
);
watch(selectedCityIndex4, async (newIndex) => {
  await nextTick();
  areaChoicesInstance4 = _initSingleChoice(
    areaChoicesInstance4,
    areaSelectRef4.value
  );
});

const citySelectRef = ref(null);
const areaSelectRef = ref(null);
const citySelectRef2 = ref(null);
const areaSelectRef2 = ref(null);
const citySelectRef3 = ref(null);
const areaSelectRef3 = ref(null);
const citySelectRef4 = ref(null);
const areaSelectRef4 = ref(null);
const prdSelectRef = ref(null);
const p_prdSelectRef = ref(null);
let cityChoicesInstance = null; // 存放 Choices 實體
let areaChoicesInstance = null;
let cityChoicesInstance2 = null;
let areaChoicesInstance2 = null;
let cityChoicesInstance3 = null;
let areaChoicesInstance3 = null;
let cityChoicesInstance4 = null;
let areaChoicesInstance4 = null;
let prdChoicesInstance = null;
let prdChoicesInstance2 = null;
const ubnErrorStatus = ref("");
const idErrorStatus = ref("");

onMounted(() => {
  nextTick();
  _initLoad();
});

const _initLoad = async () => {
  //init
  u.value = {};
  u.value.dealer_type = "公司法人";
  u.value.c_dealer_type1 = [];
  u.value.c_dealer_type2 = [];
  u.value.p_dealer_type1 = [];
  u.value.p_dealer_type2 = [];
  u.value.c_city = "\u00A0";
  u.value.c_town = "\u00A0";
  u.value.c_contact_city = "\u00A0";
  u.value.c_contact_town = "\u00A0";
  u.value.p_city = "\u00A0";
  u.value.p_town = "\u00A0";
  u.value.p_contact_city = "\u00A0";
  u.value.p_contact_town = "\u00A0";
  u.value.c_product_class = "\u00A0";
  u.value.p_product_class = "\u00A0";

  // var res = await _getProductClass();
  // if (res.success) {
  //   prd_class.value = res.list;
  // } else {
  //   alert(res.msg);
  //   return;
  // }

  //set data
  // var dudu_dealerContact = JSON.parse(
  //   localStorage.getItem("dudu_dealerContact")
  // );
  // console.log(dudu_dealerContact);
  // if (dudu_dealerContact != null) u.value = dudu_dealerContact;

  //依穎
  cities.value = await _loadCityData();
  cities.value = cities.value.filter(
    (item) => item.CityName !== "釣魚臺" && item.CityName !== "南海島"
  );
  await nextTick();
  initChoices();
};

const _getProductClass = () => {
  return axios({
    method: "get",
    url: "/api/Dealer/GetProductClass/",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(() => {
      console.log("完成");
    });
};

const _loadCityData = () => {
  return axios({
    method: "get",
    url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      console.log("完成");
    });
};

// 監聽 Tab 變動 重新啟動mdb
watch(
  () => u.value?.dealer_type, //u有東西後(執行_initLoad)再取出dealer_type
  async (newValue, oldValue) => {
    await nextTick();
    _reinitMDB();
    //_initChoices();會有奇怪的問題
  }
);

const _reinitMDB = () => {
  const inputWrappers = document.querySelectorAll(".form-outline");

  inputWrappers.forEach((wrapper) => {
    new window.mdb.Input(wrapper).init();
  });
};

const initChoices = () => {
  prdChoicesInstance = _initSingleChoice(
    prdChoicesInstance,
    prdSelectRef.value
  );
  prdChoicesInstance2 = _initSingleChoice(
    prdChoicesInstance2,
    p_prdSelectRef.value
  );
  cityChoicesInstance = _initSingleChoice(
    cityChoicesInstance,
    citySelectRef.value
  );
  cityChoicesInstance2 = _initSingleChoice(
    cityChoicesInstance2,
    citySelectRef2.value
  );
  cityChoicesInstance3 = _initSingleChoice(
    cityChoicesInstance3,
    citySelectRef3.value
  );
  cityChoicesInstance4 = _initSingleChoice(
    cityChoicesInstance4,
    citySelectRef4.value
  );
  areaChoicesInstance = _initSingleChoice(
    areaChoicesInstance,
    areaSelectRef.value
  );
  areaChoicesInstance2 = _initSingleChoice(
    areaChoicesInstance2,
    areaSelectRef2.value
  );
  areaChoicesInstance3 = _initSingleChoice(
    areaChoicesInstance3,
    areaSelectRef3.value
  );
  areaChoicesInstance4 = _initSingleChoice(
    areaChoicesInstance4,
    areaSelectRef4.value
  );
};

const _initSingleChoice = (currentInstance, domRef) => {
  if (!domRef) return null;

  if (currentInstance) {
    currentInstance.destroy();
  }

  const DEFAULT_CHOICES_OPTIONS = {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
  };
  const newInstance = new Choices(domRef, DEFAULT_CHOICES_OPTIONS);

  domRef.addEventListener("showDropdown", () => handleRequiredAtFocus(domRef));
  domRef.addEventListener("hideDropdown", () => handleRequiredAtBlur(domRef));
  return newInstance;
};

const handleCityChange = async (which) => {
  if (which == 1) {
    const selectedCityName = event.target.value;
    selectedCityIndex1.value = cities.value.findIndex(
      (item) => item.CityName === selectedCityName
    );
    await nextTick();
    _initSingleChoice(areaChoicesInstance, areaSelectRef.value);
  } else if (which == 2) {
    const selectedCityName2 = event.target.value;
    selectedCityIndex2.value = cities.value.findIndex(
      (item) => item.CityName === selectedCityName2
    );
    await nextTick();
    _initSingleChoice(areaChoicesInstance2, areaSelectRef2.value);
  } else if (which == 3) {
    const selectedCityName3 = event.target.value;
    selectedCityIndex3.value = cities.value.findIndex(
      (item) => item.CityName === selectedCityName3
    );
    await nextTick();
    _initSingleChoice(areaChoicesInstance3, areaSelectRef3.value);
  } else if (which == 4) {
    const selectedCityName4 = event.target.value;
    selectedCityIndex4.value = cities.value.findIndex(
      (item) => item.CityName === selectedCityName4
    );
    await nextTick();
    _initSingleChoice(areaChoicesInstance4, areaSelectRef4.value);
  }
};

const next = async (_u) => {
  console.log(_u);
  if (Object.keys(_u).length === 0) {
    alert("請填寫資料");
    return;
  }

  if (_u.dealer_type == "公司法人") {
    if (!_u.c_taxid_no || _u.c_taxid_no == "") msg.c_taxid_no = true;
    else msg.c_taxid_no = false;
    if (!_u.c_city || _u.c_city == "\u00A0") msg.c_city = true;
    else msg.c_city = false;
    if (!_u.c_town || _u.c_town == "\u00A0") msg.c_town = true;
    else msg.c_town = false;
    if (!_u.c_address || _u.c_address == "") msg.c_address = true;
    else msg.c_address = false;
    if (!_u.c_contact_city || _u.c_contact_city == "\u00A0")
      msg.c_contact_city = true;
    else msg.c_contact_city = false;
    if (!_u.c_contact_town || _u.c_contact_town == "\u00A0")
      msg.c_contact_town = true;
    else msg.c_contact_town = false;
    if (!_u.c_contact_addr || _u.c_contact_addr == "")
      msg.c_contact_addr = true;
    else msg.c_contact_addr = false;
    if (!_u.c_dealer_desc || _u.c_dealer_desc == "") msg.c_dealer_desc = true;
    else msg.c_dealer_desc = false;
    if (_u.c_dealer_type1.length == 0) msg.c_dealer_type1 = true;
    else msg.c_dealer_type1 = false;
    if (_u.c_dealer_type2.length == 0) msg.c_dealer_type2 = true;
    else msg.c_dealer_type2 = false;
    if (!_u.c_name || _u.c_name == "") msg.c_name = true;
    else msg.c_name = false;
    if (!_u.c_phone || _u.c_phone == "") msg.c_phone = true;
    else msg.c_phone = false;
    if (!_u.c_product_class || _u.c_product_class == "\u00A0")
      msg.c_product_class = true;
    else msg.c_product_class = false;

    if (
      !msg.c_taxid_no &&
      !msg.c_city &&
      !msg.c_town &&
      !msg.c_address &&
      !msg.c_contact_city &&
      !msg.c_contact_town &&
      !msg.c_contact_addr &&
      !msg.c_dealer_desc &&
      !msg.c_dealer_type1 &&
      !msg.c_dealer_type2 &&
      !msg.c_name &&
      !msg.c_phone &&
      // !msg.c_product_class
      validateUBN(_u.c_taxid_no) === true
    ) {
      // console.log(validateUBN(_u.c_taxid_no));
      // var result = await _checkApplyed("公司法人", _u.c_taxid_no);
      // console.log(result);
      // if (result.success) {
      //   _u.random_id = generateRandomString(16);
      //   localStorage.removeItem("dudu_dealerContact");
      //   localStorage.setItem("dudu_dealerContact", JSON.stringify(_u));
      //var _r = getUrlParameter('r');//隨機碼
      //if (_r !== 'null')//補件
      //    window.location.href = '../Home/DealerContact_PinCharge?r=' + _r;
      //else
      //window.location.href = '../Home/DealerContact_PinCharge';
      // } else {
      //   alert(result.msg);
      // }
    } else {
      console.log("有錯");
      alert("請填寫資料");
    }
  }

  if (_u.dealer_type == "個人商家") {
    if (!_u.p_city || _u.p_city == "\u00A0") msg.p_city = true;
    else msg.p_city = false;
    if (!_u.p_town || _u.p_town == "\u00A0") msg.p_town = true;
    else msg.p_town = false;
    if (!_u.p_address || _u.p_address == "") msg.p_address = true;
    else msg.p_address = false;
    if (!_u.p_contact_city || _u.p_contact_city == "\u00A0")
      msg.p_contact_city = true;
    else msg.p_contact_city = false;
    if (!_u.p_contact_town || _u.p_contact_town == "\u00A0")
      msg.p_contact_town = true;
    else msg.p_contact_town = false;
    if (!_u.p_contact_addr || _u.p_contact_addr == "")
      msg.p_contact_addr = true;
    else msg.p_contact_addr = false;
    if (!_u.p_dealer_desc || _u.p_dealer_desc == "") msg.p_dealer_desc = true;
    else msg.p_dealer_desc = false;
    if (_u.p_dealer_type1.length == 0) msg.p_dealer_type1 = true;
    else msg.p_dealer_type1 = false;
    if (_u.p_dealer_type2.length == 0) msg.p_dealer_type2 = true;
    else msg.p_dealer_type2 = false;
    if (!_u.p_idno || _u.p_idno == "") msg.p_idno = true;
    else msg.p_idno = false;
    if (!_u.p_name || _u.p_name == "") msg.p_name = true;
    else msg.p_name = false;
    if (!_u.p_phone || _u.p_phone == "") msg.p_phone = true;
    else msg.p_phone = false;
    if (!_u.p_product_class || _u.p_product_class == "\u00A0")
      msg.p_product_class = true;
    else msg.p_product_class = false;

    if (
      !msg.p_city &&
      !msg.p_town &&
      !msg.p_address &&
      !msg.p_contact_city &&
      !msg.p_contact_town &&
      !msg.p_contact_addr &&
      !msg.p_dealer_desc &&
      !msg.p_dealer_type1 &&
      !msg.p_dealer_type2 &&
      !msg.p_idno &&
      !msg.p_name &&
      !msg.p_phone &&
      !msg.p_product_class &&
      taiwanIdValidator.isNationalIdentificationNumberValid(
        _u.p_idno.toUpperCase()
      )
    ) {
      var result = await _checkApplyed("個人商家", _u.p_idno);
      console.log(result);
      if (result.success) {
        _u.random_id = generateRandomString(16);
        localStorage.removeItem("dudu_dealerContact");
        localStorage.setItem("dudu_dealerContact", JSON.stringify(_u));
        //var _r = getUrlParameter('r');//隨機碼
        //if (_r !== 'null')//補件
        //    window.location.href = '../Home/DealerContact_PinCharge?r=' + _r;
        //else
        //window.location.href = '../Home/DealerContact_PinCharge';
      } else {
        alert(result.msg);
      }
    } else {
      alert("請填寫資料");
    }
  }
};

const _checkApplyed = (_dealer_type, _check_id) => {
  console.log(_dealer_type);
  console.log(_check_id);
  blockUI();
  return axios({
    method: "post",
    url: "/api/AnonymousOTP/CheckApplyed",
    headers: { "Content-Type": "application/json" },
    params: { dealer_type: _dealer_type, check_id: _check_id },
  })
    .then((response) => {
      $.unblockUI();
      return response.data;
    })
    .catch(function (error) {
      $.unblockUI();
      console.log(error);
    })
    .finally(() => {
      console.log("完成");
    });
};

const handleRequiredAtBlur = (eventOrSelect) => {
  const element = eventOrSelect.target || eventOrSelect;
  const targetToStyle = element.closest(".select-wrapper") || element; //找不到select-wrapper就退回用element

  if (!element.checkValidity() && element.id !== "GUI" && element.id !== "ID") {
    // checkValidity為瀏覽器原生檢查
    targetToStyle.classList.add("is-invalid"); // 此為MDBclass:顯示紅框和錯誤訊息
  } else if (element.id !== "GUI" && element.id !== "ID") {
    targetToStyle.classList.remove("is-invalid");
  } else if (element.id === "GUI") {
    validateUBN(element.value);
  } else if (element.id === "ID") {
    validateID(element.value);
  }
};

const handleRequiredAtFocus = (eventOrSelect) => {
  const element = eventOrSelect.target || eventOrSelect;
  const targetToStyle = element.closest(".select-wrapper") || element;

  if (targetToStyle.classList.contains("is-invalid")) {
    targetToStyle.classList.remove("is-invalid");

    // checkbox打勾一個就全部有效
    if (targetToStyle.classList.contains("form-check-input")) {
      const siblings = targetToStyle.parentElement.children;

      for (let sibling of siblings) {
        sibling.classList.remove("is-invalid");
      }
    }
  }
};

// const handleUBNInputUI = () => {
//   // const guiValue = e.target.value.trim();
//   const status = validateUBN(guiValue);
//   // const error = e.target.parentElement.querySelector(".invalid-feedback");

//   switch (status) {
//     case "case1":
//       e.target.classList.add("is-invalid");
//       error.textContent = "此欄位為必填";
//       break;
//     case "case2":
//       e.target.classList.add("is-invalid");
//       error.textContent = "統編格式錯誤(長度或字元不符)";
//       break;
//     case "case3":
//       e.target.classList.add("is-invalid");
//       error.textContent = "統編格式錯誤";
//       break;
//     case true:
//       e.target.classList.remove("is-invalid");
//       error.textContent = "";
//       break;
//   }
// };

const validateUBN = (value) => {
  if (value === "") {
    ubnErrorStatus.value = "case1";
    return false;
  }

  // 檢查格式 (是否為8位數字)
  if (!/^\d{8}$/.test(value)) {
    ubnErrorStatus.value = "case2";
    return false;
  }

  // 權重檢查
  const weight = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    const digit = Number(value[i]);
    const p = digit * weight[i];
    let s = Math.floor(p / 10) + (p % 10);
    s = s === 10 ? 0 : s;
    sum += s;
  }
  const checkNumber = 5;
  const isLegal =
    sum % checkNumber === 0 ||
    ((sum + 1) % checkNumber === 0 && Number(value[6]) === 7);

  if (!isLegal) {
    ubnErrorStatus.value = "case3";
    return false;
  } else {
    ubnErrorStatus.value = "";
    return true;
  }
};

const validateID = (value) => {
  if (value === "") {
    idErrorStatus.value = "case1";
    return;
  }

  if (
    taiwanIdValidator.isNationalIdentificationNumberValid(
      value.toUpperCase()
    ) ||
    taiwanIdValidator.isResidentCertificateNumberValid(value.toUpperCase())
  ) {
    idErrorStatus.value = "";
    return;
  } else {
    idErrorStatus.value = "case2";
    return;
  }
};
</script>

<template>
  <section class="mx-auto section">
    <h2 class="title fw-bold">商家資訊填寫</h2>
    <div class="d-flex gap-3">
      <div>
        <input
          type="radio"
          class="form-check-input"
          id="radio-tab-1"
          autocomplete="off"
          value="公司法人"
          v-model="u.dealer_type"
          @change="initChoices"
        />
        <label class="form-check-label" for="radio-tab-1">公司法人</label>
      </div>
      <div>
        <input
          type="radio"
          class="form-check-input"
          id="radio-tab-2"
          autocomplete="off"
          value="個人商家"
          v-model="u.dealer_type"
          @change="initChoices"
        />
        <label class="form-check-label" for="radio-tab-2">個人商家</label>
      </div>
    </div>

    <!-- Tabs navs -->
    <!-- Tabs content -->
    <div class="tab-content" id="ex1-content">
      <transition>
        <!------------------------公司法人panel 開始-------------------------->
        <div v-if="u.dealer_type === '公司法人'">
          <div class="basic-info">
            <!--公司統編-->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  class="form-control"
                  :class="{
                    'is-invalid': ubnErrorStatus !== '',
                    active: u.c_taxid_no,
                  }"
                  maxlength="8"
                  id="GUI"
                  v-model.trim="u.c_taxid_no"
                  required
                  @blur="handleRequiredAtBlur"
                  @focus="ubnErrorStatus = ''"
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="GUI"
                  ><span class="required-icon">*</span>公司統編</label
                >
                <!-- <div class="invalid-feedback">此欄位為必填</div> -->
                <div class="invalid-feedback" v-if="ubnErrorStatus === 'case1'">
                  此欄位為必填
                </div>

                <div
                  class="invalid-feedback"
                  v-else-if="ubnErrorStatus === 'case2'"
                >
                  統編格式錯誤(長度或字元不符)
                </div>

                <div
                  class="invalid-feedback"
                  v-else-if="ubnErrorStatus === 'case3'"
                >
                  統編格式錯誤
                </div>
              </div>
            </div>

            <!--公司登記名稱-->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  id="c_name"
                  class="form-control"
                  :class="{
                    'is-invalid': msg.c_name,
                    active: u.c_name,
                  }"
                  v-model.trim="u.c_name"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_name"
                  ><span class="required-icon">*</span>公司登記名稱</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <!--公司電話-->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  id="c_phone"
                  class="form-control"
                  :class="{
                    'is-invalid': msg.c_phone,
                    active: u.c_phone,
                  }"
                  v-model.trim="u.c_phone"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_phone"
                  ><span class="required-icon">*</span>公司電話</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <!--產品類別-->
            <!-- <div>
              <div
                class="select-wrapper mt-4 position-relative"
                :class="{ 'is-invalid': msg.c_product_class }"
              >
                <select ref="prdSelectRef" v-model="u.c_product_class" required>
                  <option value="" placeholder>產品類別</option>
                  <option
                    v-for="(item, idx) in prd_class"
                    :key="item.id"
                    class="px-4 py-2"
                  >
                    {{ item.text }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div> -->

            <!-- 員工代號 -->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  id="memberno"
                  class="form-control"
                  v-model.trim="u.sale_code"
                  :class="{ 'is-invalid': msg.sale_code, active: u.sale_code }"
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="memberno">員工代號</label>
              </div>
            </div>

            <!---------------- 公司登記地址 開始---------------->
            <div class="fs-4 fw-bold subtitle mb-0">公司登記地址</div>
            <div class="d-flex gap-3">
              <!-- 縣市 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.c_city }"
              >
                <select ref="citySelectRef" v-model="u.c_city" required>
                  <option value="" placeholder>請選擇縣市</option>
                  <option
                    v-for="(c, index) in cities"
                    :key="c.CityName"
                    class="px-4 py-2"
                  >
                    {{ c.CityName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
              <!-- 區域 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.c_town }"
              >
                <select ref="areaSelectRef" v-model="u.c_town" required>
                  <option value="" placeholder>請選擇區域</option>
                  <option
                    v-for="(a, idx) in cities[selectedCityIndex1]
                      ? cities[selectedCityIndex1].AreaList
                      : []"
                    :key="a.AreaName"
                    :value="a.AreaName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ a.AreaName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <div>
              <div class="form-outline" data-mdb-input-init>
                <input
                  type="text"
                  id="c_address"
                  class="form-control"
                  :class="{ 'is-invalid': msg.c_address, active: u.c_address }"
                  v-model.trim="u.c_address"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_address"
                  ><span class="required-icon">*</span>請填寫詳細地址</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <!---------------- 公司登記地址 結束---------------->
            <!---------------- 公司通訊地址 開始---------------->
            <div class="fs-4 fw-bold subtitle mb-0">公司通訊地址</div>
            <div class="d-flex gap-3">
              <!-- 縣市 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.c_contact_city }"
              >
                <select
                  ref="citySelectRef2"
                  v-model="u.c_contact_city"
                  required
                >
                  <option value="" placeholder>請選擇縣市</option>
                  <option
                    v-for="(c, index) in cities"
                    :key="c.CityName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ c.CityName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
              <!-- 區域 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.c_contact_town }"
              >
                <select
                  ref="areaSelectRef2"
                  v-model="u.c_contact_town"
                  required
                >
                  <option value="" placeholder>請選擇區域</option>
                  <option
                    v-for="(a, idx) in cities[selectedCityIndex2]
                      ? cities[selectedCityIndex2].AreaList
                      : []"
                    :key="a.AreaName"
                    :value="a.AreaName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ a.AreaName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>
            <div>
              <div class="form-outline" data-mdb-input-init>
                <input
                  type="text"
                  id="c_contact_addr"
                  class="form-control"
                  :class="{
                    'is-invalid': msg.c_contact_addr,
                    active: u.c_contact_addr,
                  }"
                  v-model.trim="u.c_contact_addr"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_contact_addr"
                  ><span class="required-icon">*</span>請填寫詳細地址</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <!---------------- 公司通訊地址 結束---------------->
          </div>
          <!--basic-info 結束-->
          <!-- 營業型態 -->
          <div class="d-flex mt-4">
            <div class="me-4">
              <span class="required-icon">*</span>營業型態(複選)
            </div>
            <input
              class="form-check-input"
              type="checkbox"
              value="實體商店"
              id="flexCheck1"
              v-model="u.c_dealer_type1"
              :class="{ 'is-invalid': msg.c_dealer_type1 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck1"
              style="margin-bottom: 0"
              >實體商店(offline)</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="網路"
              id="flexCheck2"
              v-model="u.c_dealer_type1"
              :class="{ 'is-invalid': msg.c_dealer_type1 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck2"
              style="margin-bottom: 0"
              >網路(online)</label
            >
            <div
              class="invalid-feedback position-relative"
              style="margin-top: 0"
            >
              此欄位為必填
            </div>
          </div>
          <!-- 營業型態 -->
          <div class="d-flex mt-4">
            <div class="me-4">
              <span class="required-icon">*</span>營業型態(複選)
            </div>
            <input
              class="form-check-input"
              type="checkbox"
              value="門市交貨"
              id="flexCheck3"
              v-model="u.c_dealer_type2"
              :class="{ 'is-invalid': msg.c_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck3"
              style="margin-bottom: 0"
              >門市交貨</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="宅配"
              id="flexCheck4"
              v-model="u.c_dealer_type2"
              :class="{ 'is-invalid': msg.c_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck4"
              style="margin-bottom: 0"
              >宅配</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="超商取貨"
              id="flexCheck5"
              v-model="u.c_dealer_type2"
              :class="{ 'is-invalid': msg.c_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck5"
              style="margin-bottom: 0"
              >超商取貨</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="其他"
              id="flexCheck6"
              v-model="u.c_dealer_type2"
              :class="{ 'is-invalid': msg.c_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck6"
              style="margin-bottom: 0"
              >其他</label
            >
            <div
              class="invalid-feedback position-relative"
              style="margin-top: 0"
            >
              此欄位為必填
            </div>
          </div>
          <!-- 業務說明 -->
          <div class="form-outline mt-4" data-mdb-input-init>
            <textarea
              class="form-control"
              :class="{
                'is-invalid': msg.c_dealer_desc,
                active: u.c_dealer_desc,
              }"
              id="textAreaExample"
              rows="4"
              v-model.trim="u.c_dealer_desc"
              @blur="handleRequiredAtBlur"
              @focus="handleRequiredAtFocus"
              required
              @keyup.enter="$event.target.blur()"
            ></textarea>
            <label class="form-label" for="textAreaExample"
              ><span class="required-icon">*</span
              >業務內容說明，請簡述您公司的產品或服務內容</label
            >
            <div class="invalid-feedback">此欄位為必填</div>
          </div>
        </div>

        <!------------------------公司法人panel 結束-------------------------->
        <!------------------------個人商家panel 開始-------------------------->
        <div v-else-if="u.dealer_type === '個人商家'">
          <div class="basic-info">
            <!-- 身分證字號 -->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  class="form-control"
                  :class="{
                    'is-invalid': idErrorStatus !== '',
                    active: u.p_idno,
                  }"
                  id="ID"
                  maxlength="10"
                  v-model="u.p_idno"
                  @blur="handleRequiredAtBlur"
                  @focus="idErrorStatus = ''"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="ID"
                  ><span class="required-icon">*</span>身分證字號</label
                >
                <div class="invalid-feedback" v-if="idErrorStatus === 'case1'">
                  此欄位為必填
                </div>
                <div class="invalid-feedback" v-if="idErrorStatus === 'case2'">
                  身分證字號格式錯誤
                </div>
              </div>
            </div>
            <!-- 姓名 -->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': msg.p_name, active: u.p_name }"
                  id="idno"
                  maxlength="10"
                  v-model="u.p_name"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="idno"
                  ><span class="required-icon">*</span>姓名</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>
            <!-- 電話 -->
            <div>
              <div class="form-outline mt-4" data-mdb-input-init>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': msg.p_phone, active: u.p_phone }"
                  id="p_phone"
                  v-model="u.p_phone"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="p_phone"
                  ><span class="required-icon">*</span>電話</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>
            <!-- 個人產品類別 -->
            <!-- <div>
              <div
                class="select-wrapper mt-4 position-relative"
                :class="{ 'is-invalid': msg.p_product_class }"
              >
                <select
                  ref="p_prdSelectRef"
                  v-model="u.p_product_class"
                  required
                >
                  <option value="" placeholder>產品類別</option>
                  <option
                    v-for="(item, idx) in prd_class"
                    :key="item.id"
                    class="px-4 py-2"
                  >
                    {{ item.text }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div> -->
            <!---------------- 個人 登記地址 開始---------------->
            <div class="fs-4 fw-bold subtitle mb-0">公司登記地址</div>
            <div class="d-flex gap-3">
              <!-- 縣市 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.p_city }"
              >
                <select ref="citySelectRef3" v-model="u.p_city" required>
                  <option value="" placeholder>請選擇縣市</option>
                  <option
                    v-for="(c, index) in cities"
                    :key="c.CityName"
                    class="px-4 py-2"
                  >
                    {{ c.CityName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
              <!-- 區域 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.p_town }"
              >
                <select ref="areaSelectRef3" v-model="u.p_town" required>
                  <option value="" placeholder>請選擇區域</option>
                  <option
                    v-for="(a, idx) in cities[selectedCityIndex3]
                      ? cities[selectedCityIndex3].AreaList
                      : []"
                    :key="a.AreaName"
                    :value="a.AreaName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ a.AreaName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <div>
              <div class="form-outline" data-mdb-input-init>
                <input
                  type="text"
                  id="c_address2"
                  class="form-control"
                  :class="{ 'is-invalid': msg.p_address, active: u.p_address }"
                  v-model.trim="u.p_address"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_address2"
                  ><span class="required-icon">*</span>請填寫詳細地址</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>

            <!---------------- 公司登記地址 結束---------------->
            <!---------------- 公司通訊地址 開始---------------->
            <div class="fs-4 fw-bold subtitle mb-0">公司通訊地址</div>
            <div class="d-flex gap-3">
              <!-- 縣市 -->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.p_contact_city }"
              >
                <select
                  ref="citySelectRef4"
                  v-model="u.p_contact_city"
                  required
                >
                  <option value="" placeholder>請選擇縣市</option>
                  <option
                    v-for="(c, index) in cities"
                    :key="c.CityName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ c.CityName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
              <!--@*區域*@-->
              <div
                class="select-wrapper position-relative"
                :class="{ 'is-invalid': msg.p_contact_town }"
              >
                <select
                  ref="areaSelectRef4"
                  v-model="u.p_contact_town"
                  required
                >
                  <option value="" placeholder>請選擇區域</option>
                  <option
                    v-for="(a, idx) in cities[selectedCityIndex4]
                      ? cities[selectedCityIndex4].AreaList
                      : []"
                    :key="a.AreaName"
                    :value="a.AreaName"
                    class="px-4 py-2 hover:bg-gray-100"
                  >
                    {{ a.AreaName }}
                  </option>
                </select>
                <span class="required-icon">*</span>
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>
            <div>
              <div class="form-outline" data-mdb-input-init>
                <input
                  type="text"
                  id="c_contact_addr2"
                  class="form-control"
                  :class="{
                    'is-invalid': msg.p_contact_addr,
                    active: u.p_contact_addr,
                  }"
                  v-model.trim="u.p_contact_addr"
                  @blur="handleRequiredAtBlur"
                  @focus="handleRequiredAtFocus"
                  required
                  @keyup.enter="$event.target.blur()"
                />
                <label class="form-label" for="c_contact_addr2"
                  ><span class="required-icon">*</span>請填寫詳細地址</label
                >
                <div class="invalid-feedback">此欄位為必填</div>
              </div>
            </div>
            <!---------------- 公司通訊地址 結束---------------->
          </div>
          <!--basic-info 結束-->
          <!-- 營業型態 -->
          <div class="d-flex mt-4">
            <div class="me-4">
              <span class="required-icon">*</span>營業型態(複選)
            </div>
            <input
              class="form-check-input"
              type="checkbox"
              value="實體商店"
              id="flexCheck7"
              v-model="u.p_dealer_type1"
              :class="{ 'is-invalid': msg.p_dealer_type1 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck7"
              style="margin-bottom: 0"
              >實體商店(offline)</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="網路"
              id="flexCheck8"
              v-model="u.p_dealer_type1"
              :class="{ 'is-invalid': msg.p_dealer_type1 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck8"
              style="margin-bottom: 0"
              >網路(online)</label
            >
            <div
              class="invalid-feedback position-relative"
              style="margin-top: 0"
            >
              此欄位為必填
            </div>
          </div>

          <div class="d-flex mt-4">
            <div class="me-4">
              <span class="required-icon">*</span>營業型態(複選)
            </div>
            <input
              class="form-check-input"
              type="checkbox"
              value="門市交貨"
              id="flexCheck9"
              v-model="u.p_dealer_type2"
              :class="{ 'is-invalid': msg.p_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck9"
              style="margin-bottom: 0"
              >門市交貨</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="宅配"
              id="flexCheck10"
              v-model="u.p_dealer_type2"
              :class="{ 'is-invalid': msg.p_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck10"
              style="margin-bottom: 0"
              >宅配</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="超商取貨"
              id="flexCheck11"
              v-model="u.p_dealer_type2"
              :class="{ 'is-invalid': msg.p_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck11"
              style="margin-bottom: 0"
              >超商取貨</label
            >
            <input
              class="form-check-input"
              type="checkbox"
              value="其他"
              id="flexCheck12"
              v-model="u.p_dealer_type2"
              :class="{ 'is-invalid': msg.p_dealer_type2 }"
              @focus="handleRequiredAtFocus"
            />
            <label
              class="form-check-label me-4"
              for="flexCheck12"
              style="margin-bottom: 0"
              >其他</label
            >
            <div
              class="invalid-feedback position-relative"
              style="margin-top: 0"
            >
              此欄位為必填
            </div>
          </div>
          <!-- 業務說明 -->
          <div class="form-outline mt-4" data-mdb-input-init>
            <textarea
              class="form-control"
              :class="{
                'is-invalid': msg.p_dealer_desc,
                active: u.p_dealer_desc,
              }"
              id="textAreaExample"
              rows="4"
              v-model.trim="u.p_dealer_desc"
              @blur="handleRequiredAtBlur"
              @focus="handleRequiredAtFocus"
              required
              @keyup.enter="$event.target.blur()"
            ></textarea>
            <label class="form-label" for="textAreaExample"
              ><span class="required-icon">*</span
              >業務內容說明，請簡述您公司的產品或服務內容</label
            >
            <div class="invalid-feedback">此欄位為必填</div>
          </div>
        </div>

        <!------------------------個人商家panel 結束-------------------------->
      </transition>
    </div>
    <!-- 下一步 -->
    <div class="mt-5">
      <button
        type="button"
        class="btn btn-primary"
        data-mdb-ripple-init
        @click="next(u)"
      >
        下一步
      </button>
    </div>
  </section>
  <!------------ section 結束------------>
  <!------------ 進度條 開始------------>
  <section class="section-progress">
    <div class="progress-container">
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          style="width: 25%"
          aria-valuenow="25"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div class="progress-text">25%</div>
    </div>
  </section>
  <!------------ 進度條 結束------------>
</template>

<style scoped></style>
