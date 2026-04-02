---
description: 自動生成 commit message 並推送到 GitHub
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(echo:*), Bash(code:*)
---

執行以下 git 儲存與推送流程：

## Step 1 — Stage 所有變更

執行 `git add .`

## Step 2 — 分析變更內容

收集以下資訊：

- 當前狀態：!`git status`
- 變更差異：!`git diff HEAD`
- 最近紀錄：!`git log --oneline -5`

## Step 3 — 生成 Commit Message

根據上述差異，生成一個 commit message，格式如下：

```
<簡短摘要，50字以內>

- 條列主要修改項目 1
- 條列主要修改項目 2
- ...
```

## Step 4 — 開啟 VSCode 讓 user 編輯 commit message

1. 將生成的 commit message 寫入暫存檔 `/tmp/gitsave_commit_msg.txt`
2. 執行 `code --wait /tmp/gitsave_commit_msg.txt` 開啟 VSCode
3. 告知 user：「已在 VSCode 開啟 commit message，請編輯完畢後**關閉該分頁**，我會自動繼續。」
4. 等待指令返回（user 關閉分頁後自動繼續）
5. 讀取 `/tmp/gitsave_commit_msg.txt` 的最終內容作為 commit message

## Step 5 — 執行 Commit 與 Push

1. 執行 `git commit -F /tmp/gitsave_commit_msg.txt`
2. 執行 `git push` 推送到當前分支
3. 顯示推送結果
