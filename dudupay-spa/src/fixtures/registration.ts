// 月 1 全程假資料：這裡放各步驟共用的假驗證/假回應邏輯，不呼叫任何真實或模擬的後端 API。

// 假 OTP：任意 6 碼數字即視為驗證成功（比照公司系統 js/register.js，只有簡訊 OTP 一組）。
export function isFakeOtpValid(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

export const FAKE_OTP_HINT = '任意輸入 6 碼數字即視為驗證成功（例如 123456）'
