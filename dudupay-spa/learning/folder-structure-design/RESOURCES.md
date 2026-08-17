# 資料夾結構設計 Resources

## Knowledge

- [Feature-Sliced Design — Layers](https://feature-sliced.design/docs/reference/layers)
  前端分層架構的方法論文件，明確定義「上層可以 import 下層，下層不能 import 上層」的單向依賴規則（Import Rule）。用於：理解為什麼 dudupay-spa 的 `type → config → store → router` 只能單向依賴，以及為什麼這能避免循環依賴。
- [Dependency Inversion Principle — Wikipedia](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
  SOLID 原則之一，說明高階模組不該依賴低階模組的實作細節，兩者都該依賴抽象。用於：理解「穩定、無副作用的東西放底層（type），易變、有副作用的東西放上層（router）」這個更廣泛的架構原則。

## Wisdom (Communities)

（目前使用者專注在單一專案裡建立直覺，暫不需要社群資源。之後若想比較其他專案的分層慣例，可以回來補。）

## Gaps

- 還沒找到專門針對 Vue + Pinia 專案的分層資料夾結構最佳實踐（多半是 React 生態圈的文件），之後可以補。
