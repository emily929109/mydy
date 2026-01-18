<script setup>
import { ref, onMounted, nextTick, watch, reactive, computed } from "vue";

const u = ref({
  id: "",
});
const msg = reactive({
  name: false,
  idno: false,
  addr: false,
  birth: false,
});
const idErrorStatus = ref("");

onMounted(() => {});

const handleRequiredAtBlur = (fieldName) => {
  const value = u.value[fieldName];

  if (fieldName === "idno") {
    validateID(value);
    return;
  }

  if (!value || value.trim() === "") {
    msg[fieldName] = true;
  } else {
    msg[fieldName] = false;
  }
};

const validateID = (value) => {
  if (!value || value === "") {
    idErrorStatus.value = "case1";
    msg.idno = true;
    return msg.idno;
  }

  if (
    taiwanIdValidator.isNationalIdentificationNumberValid(
      value.toUpperCase()
    ) ||
    taiwanIdValidator.isResidentCertificateNumberValid(value.toUpperCase())
  ) {
    idErrorStatus.value = "";
    msg.idno = false;
    return true;
  } else {
    idErrorStatus.value = "case2";
    msg.idno = true;
    return false;
  }
};

const next = (_u) => {
  validateID(_u.idno);

  if (!_u.name || _u.name == "") msg.name = true;
  else msg.name = false;
  if (!_u.idno || _u.idno == "" || !validateID(_u.idno)) msg.idno = true;
  else msg.idno = false;
  if (!_u.addr || _u.addr == "") msg.addr = true;
  else msg.addr = false;
  if (!_u.birth || _u.birth == "") msg.birth = true;
  else msg.birth = false;

  console.log(_u);
  console.log(msg);
  if (Object.keys(_u).length === 0) {
    alert("請填寫資料");
    return;
  }

  if (!msg.name && !msg.idno && !msg.addr && !msg.birth) {
    console.log("通過檢查");
    //window.location.href = '../Home/DealerContact_recipient2';
  } else {
    alert("請填寫完整資料");
  }
};

window.addEventListener("load", function () {
  flatpickr("#datepicker");

  // 2. 手動初始化 MDB Input (解決邊框不見的問題)
  document.querySelectorAll(".form-outline").forEach((formOutline) => {
    // 確保 mdb 物件存在 (如果您是用 CDN 引入)
    if (window.mdb && window.mdb.Input) {
      new mdb.Input(formOutline).init();
    }
  });
});
</script>

<template>
  <div class="wrapper mx-auto">
    <div class="title fw-bold fs-2 fs-md-3">基本身分資料</div>
    <div class="subtitle mb-3">請手動輸入身分資料:</div>
    <!-- 身分證字號 -->
    <div class="basic-info">
      <div>
        <div class="form-outline position-relative" data-mdb-input-init>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': msg.idno, active: u.idno }"
            id="ID"
            maxlength="10"
            v-model="u.idno"
            @blur="handleRequiredAtBlur('idno')"
            @focus="msg.idno = false"
            required
            @keyup.enter="$event.target.blur()"
            @input="msg.idno = false"
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

      <!-- 真實姓名 -->
      <div>
        <div class="form-outline" data-mdb-input-init>
          <input
            type="text"
            id="name"
            class="form-control"
            :class="{ 'is-invalid': msg.name, active: u.name }"
            v-model.trim="u.name"
            @blur="handleRequiredAtBlur('name')"
            @focus="msg.name = false"
            required
            @keyup.enter="$event.target.blur()"
            @input="msg.name = false"
          />
          <label class="form-label" for="name"
            ><span class="required-icon">*</span>真實姓名</label
          >
          <div class="invalid-feedback">此欄位為必填</div>
        </div>
      </div>

      <!-- 出生年月日 -->
      <div>
        <div class="orm-outline mt-4" data-mdb-input-init>
          <!-- <label for="datepicker">Start Date</label> -->
          <input
            id="datepicker"
            type="text"
            class="form-control datetimepicker"
            :class="{ 'is-invalid': msg.birth, active: u.birth }"
            placeholder="出生年月日"
            data-options='{"dateFormat":"d/m/y"}'
            v-model.trim="u.birth"
            @focus="msg.birth = false"
            required
            @keyup.enter="$event.target.blur()"
            @input="msg.birth = false"
          />

          <div class="invalid-feedback">此欄位為必填</div>
        </div>
      </div>

      <!-- 戶籍地址 -->
      <div>
        <div class="form-outline mt-4" data-mdb-input-init>
          <input
            type="text"
            id="addr"
            class="form-control"
            :class="{ 'is-invalid': msg.addr, active: u.addr }"
            v-model.trim="u.addr"
            @blur="handleRequiredAtBlur('addr')"
            @focus="msg.addr = false"
            required
            @keyup.enter="$event.target.blur()"
            @input="msg.addr = false"
          />
          <label class="form-label" for="addr"
            ><span class="required-icon">*</span>戶籍地址</label
          >
          <div class="invalid-feedback">此欄位為必填</div>
        </div>
      </div>

      <!-- <div class="form-group">
            <label for="datepicker">Start Date</label>
            <input class="form-control datetimepicker" id="datepicker" type="text" placeholder="dd/mm/yy" data-options='{"dateFormat":"d/m/y"}'>
        </div> -->
    </div>

    <button
      type="button"
      class="btn btn-primary d-block ms-auto mt-4"
      data-mdb-ripple-init
      @click="next(u)"
    >
      下一步
    </button>
  </div>
</template>

<style scoped></style>
