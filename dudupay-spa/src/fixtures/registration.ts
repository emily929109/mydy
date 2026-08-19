// 月 1 全程假資料：這裡放各步驟共用的假驗證/假回應邏輯，不呼叫任何真實或模擬的後端 API。

// 假 OTP：任意 6 碼數字即視為驗證成功（比照公司系統 js/register.js，只有簡訊 OTP 一組）。
export function isFakeOtpValid(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

export const FAKE_OTP_HINT = '任意輸入 6 碼數字即視為驗證成功（例如 123456）'

// 比照 ADR-0001：月 1 不呼叫既有 /api/Twca/MIDClause，這裡用假文字頂著
// 「行動身分識別服務使用者約定條款及隱私權告知條款」modal 的內容
export const FAKE_MID_CLAUSE_HTML = `
  <p>（月 1 假資料，非正式條款內容，正式版待後續串接 /api/Twca/MIDClause 後取代）</p>
  <p>本服務使用行動身分識別（TWCA）進行身分驗證，您同意由電信業者比對您門號註冊資料，
  以完成身分核實程序。驗證過程中將傳輸您的門號、身分證字號末四碼等資訊予 TWCA 進行比對，
  比對結果將回傳本服務作為身分驗證依據。</p>
  <p>詳細條款內容請洽客服，或待正式串接後端 API 後於此顯示完整條款全文。</p>
`
