// 純粹定義每一步資料長什麼樣子，零依賴，沒有任何業務邏輯
export interface Step1Account {
  password: string;
  confirmPassword: string;
  email: string;
  mobile: string;
  smsOtp: string;
  emailOtp: string;
  referralCode: string;
  agreedTerms: boolean;
}

export interface Step2Upload {
  idFront: string | null;
  idBack: string | null;
  secondId: string | null;
  selfie: string | null;
  incomeProof: string | null;
}

// ~25 欄位的完整定義留給 issue 07（RegisterInfoView）依實作需要展開，
// 月 1 型別重點放在 RegistrationState 的整體形狀，這塊先寫鬆一點。
export interface Step3Info {
  [field: string]: unknown;
}

export interface Step4TwcaConsent {
  isSelfOwned: boolean | null;
  networkType: "wifi" | "mobile" | null;
  agreed: boolean;
}

export interface Step5TwcaClause {
  clausever: string | null;
  agreed: boolean;
}

export interface Step6TwcaVerify {
  telecom: string | null;
  verified: boolean;
}

export interface Step7Sign {
  signed: boolean;
}

// StepKey 會用來當作 store、router、config 的 key
export type StepKey =
  | "step1Account"
  | "step2Upload"
  | "step3Info"
  | "step4TwcaConsent"
  | "step5TwcaClause"
  | "step6TwcaVerify"
  | "step7Sign";
