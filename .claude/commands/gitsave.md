---
description: 自動生成 commit message 並推送到 GitHub
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*)
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

## Step 4 — 請 user 確認或修改

將生成的 commit message 顯示給 user，詢問：
「是否要修改？若沒問題，我將執行 git commit 與 git push。」

等待 user 回覆，若 user 要求修改，依其指示調整後再次確認。

## Step 5 — 執行 Commit 與 Push

待 user 確認後：

1. 執行 `git commit -m "<確認的 commit message>"`
2. 執行 `git push` 推送到當前分支
3. 顯示推送結果
