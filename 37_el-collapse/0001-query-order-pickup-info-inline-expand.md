# QueryOrder 取貨資訊改採行內展開，不用 popover 或整列展開

`QueryOrder.cshtml` 的取貨資訊原本是 Bootstrap dropdown-menu 浮動選單。改版時比較過 `el-popover`（浮出卡片）與 `el-table` 展開列（整列展開）兩種常見做法，最終選擇在同一儲存格內用 `el-collapse-transition` 原地展開 `el-descriptions`。原因：popover 在窄欄位、行動裝置上容易被裁切或位置跑掉；整列展開雖然視覺效果更像「抽屜」，但需要把現有 `<table>` 改寫成 `<el-table>`，牽動既有的排序/分頁/篩選邏輯，改動範圍過大，且此次優化範圍僅限取貨資訊這一欄。行內展開兩者都不犯，且支援多筆同時展開以利比對訂單。
