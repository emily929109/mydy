# C# × OCR 呼叫鏈 Resources

## Knowledge

- [Microsoft Learn: Action Results in Web API 2](https://learn.microsoft.com/en-us/aspnet/web-api/overview/getting-started-with-aspnet-web-api/action-results)
  官方說明 Web API 2（ASP.NET 4.x）怎麼把 action 的回傳值變成 HTTP response：回傳一般物件 → 序列化成 body、固定 **200**；`void` → 204；`HttpResponseMessage` → 照它設定的碼。Use for: 「為什麼辨識失敗前端還是拿到 200」。
- [Microsoft Learn: Exception Handling in ASP.NET Web API](https://learn.microsoft.com/en-us/aspnet/web-api/overview/error-handling/exception-handling)
  沒被 catch 的例外預設變成 **500**；`HttpResponseException` 可以指定任何碼（`MemberController.GetAuthMember` 用它丟 401）。Use for: 前端看到 500 / 401 時後端發生什麼。
- [Microsoft Learn: Exception-handling statements (throw, try-catch-finally)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements)
  C# 語言參考。catch 由上往下比對、只跑一個；方法內沒 catch 就往呼叫者冒。Use for: `Upload_register`、`IDApi.Identify` 的多個 catch。
- [Microsoft Learn: Anonymous types](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/anonymous-types)
  `new { Name = "Alice" }` 與「用變數名推斷屬性名」`new { productName, price }`。Use for: `new { ocr }`、`OcrResult` 裡的 `new { status, msg, data, http_status }`。
- [Microsoft Learn: A tour of the C# language](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/)
  官方 C# 總覽。Use for: 遇到陌生語法時的第一站。

## Wisdom (Communities)

（尚未建立。使用者目前目標是讀懂公司專案；之後若想問 C# / ASP.NET 問題，可考慮 Stack Overflow 的 `c#`、`asp.net-web-api` tag。）

## Gaps

- 待補並驗證：`Task.Run` / `Task<T>.Result`（Lesson 3）、`HttpClient` 與逾時（Lesson 4）、`using` 敘述、LINQ `Where/FirstOrDefault`、Newtonsoft `JObject`。
