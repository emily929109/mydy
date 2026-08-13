import type { StepKey } from '../types/registration'

export interface RegistrationStepMeta {
  key: StepKey
  path: string
  title: string
  order: number
}

// 7 步驟的順序/路徑/標題單一事實來源。RegisterWizardNav、router 都讀這份，
// 不在別處寫死步驟名稱或順序。
export const registrationSteps: RegistrationStepMeta[] = [
  { key: 'step1Account', path: '/register', title: '帳號註冊', order: 1 },
  { key: 'step2Upload', path: '/register/upload', title: '上傳照片', order: 2 },
  { key: 'step3Info', path: '/register/info', title: '基本資料', order: 3 },
  { key: 'step4TwcaConsent', path: '/register/twca/consent', title: '門號同意', order: 4 },
  { key: 'step5TwcaClause', path: '/register/twca/clause', title: '條款同意', order: 5 },
  { key: 'step6TwcaVerify', path: '/register/twca/verify', title: '身分驗證', order: 6 },
  { key: 'step7Sign', path: '/register/sign', title: '簽署完成', order: 7 },
]
