<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRegistrationStore } from "../../stores/registration";
import { registrationSteps } from "../../config/registrationSteps";
import RegisterStepLayout from "../../components/register/RegisterStepLayout.vue";
import FormField from "../../components/register/FormField.vue";
import {
  isFakeOtpValid,
  FAKE_OTP_HINT,
  FAKE_MID_CLAUSE_HTML,
} from "../../fixtures/registration";
import { PRIVACY_POLICY_HTML } from "../../content/privacyPolicy";

const STEP_KEY = "step1Account";
const route = useRoute();
const router = useRouter();
const store = useRegistrationStore();
const stepIndex = registrationSteps.findIndex((s) => s.key === STEP_KEY);
const nextStep = registrationSteps[stepIndex + 1];

// store.step1Account 本身已是 reactive 物件
const form = store.step1Account;

// URL 帶 ?push= 推薦碼時預填且不可手動修改
const referralCodeLocked = ref(false);

// 比照舊系統 Register.cshtml 的 showPdf() / showHtml()：純顯示條款內容用的 modal 開關
const showPrivacyModal = ref(false);
const showClauseModal = ref(false);

// 比照 register.js 的 close()：4 碼英數混合（同時含字母與數字）視為店家代號，否則為會員/員工推薦碼
function isStoreCode(code: string): boolean {
  return (
    /^[A-Za-z0-9]{4}$/.test(code) && /[A-Za-z]/.test(code) && /\d/.test(code)
  );
}

onMounted(() => {
  const push =
    typeof route.query.push === "string" ? route.query.push.trim() : "";
  if (push) {
    form.referralCode = push;
    form.referralCodeIsStoreCode = isStoreCode(push);
    referralCodeLocked.value = true;
  }
});

const errors = reactive<Record<string, string>>({
  password: "",
  confirmPassword: "",
  email: "",
  mobile: "",
  smsOtp: "",
  agreedTerms: "",
});

// 密碼規則 : 1. 長度需 8~18 字   2. 需含至少一個英文大寫字母   3. 需含至少一個英文小寫字母   4. 需含至少一個數字 5. 只可包含ASCII鍵盤符號
const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,18}$/;
const MOBILE_RULE = /^09\d{8}$/;
const EMAIL_RULE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

// 條件1 ? 結果A : (條件2 ? 結果B : 結果C)（巢狀三元運算子）
function validate(): boolean {
  errors.email = !form.email
    ? "Email 不可為空"
    : EMAIL_RULE.test(form.email)
      ? ""
      : "Email 格式不正確";
  errors.password = !form.password
    ? "密碼不可為空"
    : PASSWORD_RULE.test(form.password)
      ? ""
      : "密碼須為 8-18 碼，同時包含大小寫英文字母與數字，可包含常見符號";
  errors.confirmPassword = !form.confirmPassword
    ? "確認密碼不可為空"
    : form.confirmPassword === form.password
      ? ""
      : "確認密碼與密碼不一致";

  errors.mobile = !form.mobile
    ? "手機號碼不可為空"
    : MOBILE_RULE.test(form.mobile)
      ? ""
      : "手機格式須為 09 開頭、共 10 碼數字";
  errors.smsOtp = !form.smsOtp
    ? "簡訊 OTP 不可為空"
    : isFakeOtpValid(form.smsOtp)
      ? ""
      : `簡訊 OTP 錯誤（${FAKE_OTP_HINT}）`;
  errors.agreedTerms = form.agreedTerms ? "" : "請先閱讀並同意服務條款";

  return Object.values(errors).every((message) => message === "");
}

function handleNext() {
  if (!validate()) return;
  store.completeStep(STEP_KEY);
  if (nextStep) router.push(nextStep.path);
}
</script>

<template>
  <RegisterStepLayout next-label="下一步" @next="handleNext">
    <FormField
      id="email"
      v-model="form.email"
      type="email"
      label="Email"
      :error="errors.email"
    />
    <FormField
      id="password"
      v-model="form.password"
      type="password"
      label="密碼"
      :error="errors.password"
    />
    <FormField
      id="confirmPassword"
      v-model="form.confirmPassword"
      type="password"
      label="確認密碼"
      :error="errors.confirmPassword"
    />

    <FormField
      id="mobile"
      v-model="form.mobile"
      type="tel"
      label="手機號碼"
      :error="errors.mobile"
    />

    <p class="form-text">{{ FAKE_OTP_HINT }}</p>
    <FormField
      id="smsOtp"
      v-model="form.smsOtp"
      label="簡訊 OTP"
      :error="errors.smsOtp"
    />

    <FormField
      id="referralCode"
      v-model="form.referralCode"
      label="推薦碼（選填）"
      :disabled="referralCodeLocked"
    />

    <div class="form-check mb-3">
      <input
        id="agreedTerms"
        v-model="form.agreedTerms"
        class="form-check-input"
        type="checkbox"
      />
      <label class="form-check-label" for="agreedTerms">
        我已詳細閱讀並充分了解，同意「<span
          class="terms-link"
          @click="showPrivacyModal = true"
          >隱私政策</span
        >」及「<span class="terms-link" @click="showClauseModal = true"
          >行動身分識別服務使用者約定條款及隱私權告知條款</span
        >」。
      </label>
      <div v-if="errors.agreedTerms" class="text-danger small">
        {{ errors.agreedTerms }}
      </div>
    </div>

    <el-dialog v-model="showPrivacyModal">
      <div class="legal-content" v-html="PRIVACY_POLICY_HTML"></div>
    </el-dialog>

    <el-dialog
      v-model="showClauseModal"
      title="行動身分識別服務使用者約定條款及隱私權告知條款"
    >
      <div class="legal-content" v-html="FAKE_MID_CLAUSE_HTML"></div>
    </el-dialog>
  </RegisterStepLayout>
</template>

<style scoped>
.terms-link {
  text-decoration: underline;
  cursor: pointer;
}

.legal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.legal-content :deep(.privacy-item) {
  margin-bottom: 1.5rem;
}

.legal-content :deep(.privacy-item ol) {
  line-height: 180%;
}
</style>
