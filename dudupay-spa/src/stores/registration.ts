import { reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import type {
  Step1Account,
  Step2Upload,
  Step3Info,
  Step4TwcaConsent,
  Step5TwcaClause,
  Step6TwcaVerify,
  Step7Sign,
  StepKey,
} from "../types/registration";
import { registrationSteps } from "../config/registrationSteps";

const STORAGE_KEY = "dudupay-spa.registration";

function defaultStep1Account(): Step1Account {
  return {
    password: "",
    confirmPassword: "",
    email: "",
    mobile: "",
    smsOtp: "",
    referralCode: "",
    referralCodeIsStoreCode: false,
    agreedTerms: false,
  };
}

function defaultStep2Upload(): Step2Upload {
  return {
    idFront: null,
    idBack: null,
    secondId: null,
    selfie: null,
    incomeProof: null,
  };
}

function defaultStep4TwcaConsent(): Step4TwcaConsent {
  return { isSelfOwned: null, networkType: null, agreed: false };
}

function defaultStep5TwcaClause(): Step5TwcaClause {
  return { clausever: null, agreed: false };
}

function defaultStep6TwcaVerify(): Step6TwcaVerify {
  return { telecom: null, verified: false };
}

function defaultStep7Sign(): Step7Sign {
  return { signed: false };
}

interface PersistedShape {
  step1Account: Step1Account;
  step2Upload: Step2Upload;
  step3Info: Step3Info;
  step4TwcaConsent: Step4TwcaConsent;
  step5TwcaClause: Step5TwcaClause;
  step6TwcaVerify: Step6TwcaVerify;
  step7Sign: Step7Sign;
  completedSteps: StepKey[];
}

function loadPersisted(): Partial<PersistedShape> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<PersistedShape>;
  } catch {
    return {};
  }
}

export const useRegistrationStore = defineStore("registration", () => {
  const persisted = loadPersisted();

  // 用預設值墊底、用使用者上次填過的 localStorage 資料覆蓋，合併出 Step1 表單的初始資料，並包成 Vue 響應式物件
  const step1Account = reactive<Step1Account>({
    ...defaultStep1Account(),
    ...persisted.step1Account,
  });
  const step2Upload = reactive<Step2Upload>({
    ...defaultStep2Upload(),
    ...persisted.step2Upload,
  });
  const step3Info = reactive<Step3Info>({ ...persisted.step3Info });
  const step4TwcaConsent = reactive<Step4TwcaConsent>({
    ...defaultStep4TwcaConsent(),
    ...persisted.step4TwcaConsent,
  });
  const step5TwcaClause = reactive<Step5TwcaClause>({
    ...defaultStep5TwcaClause(),
    ...persisted.step5TwcaClause,
  });
  const step6TwcaVerify = reactive<Step6TwcaVerify>({
    ...defaultStep6TwcaVerify(),
    ...persisted.step6TwcaVerify,
  });
  const step7Sign = reactive<Step7Sign>({
    ...defaultStep7Sign(),
    ...persisted.step7Sign,
  });
  const completedSteps = ref<StepKey[]>(persisted.completedSteps ?? []);

  function persist() {
    const snapshot: PersistedShape = {
      step1Account,
      step2Upload,
      step3Info,
      step4TwcaConsent,
      step5TwcaClause,
      step6TwcaVerify,
      step7Sign,
      completedSteps: completedSteps.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  watch(
    [
      step1Account,
      step2Upload,
      step3Info,
      step4TwcaConsent,
      step5TwcaClause,
      step6TwcaVerify,
      step7Sign,
      completedSteps,
    ],
    persist,
    { deep: true },
  );

  function completeStep(key: StepKey) {
    if (!completedSteps.value.includes(key)) {
      completedSteps.value.push(key);
    }
  }

  function isStepCompleted(key: StepKey) {
    return completedSteps.value.includes(key);
  }

  function firstIncompleteStepPath(): string {
    const next = registrationSteps.find(
      (step) => !completedSteps.value.includes(step.key),
    );
    return next ? next.path : registrationSteps[0].path;
  }

  return {
    step1Account,
    step2Upload,
    step3Info,
    step4TwcaConsent,
    step5TwcaClause,
    step6TwcaVerify,
    step7Sign,
    completedSteps,
    completeStep,
    isStepCompleted,
    firstIncompleteStepPath,
  };
});
