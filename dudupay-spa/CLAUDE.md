## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### 跨 repo 決策參照

這個專案（dudupay-spa）是從公司 Gitea `mydy/dudupay` repo 的 `.scratch/spa-migration/` 拆出來的（見該 repo 的 ADR-0007）。本 repo 的 ADR-0001 對應那邊的原 ADR-0006（重編號）。有兩份跨兩邊的決策留在 `dudupay` repo、沒有搬過來：

- ADR-0004：JWT 驗證改用 Authorization Header（同時牽動後端）
- ADR-0005：IIS 部署（同時涵蓋未來 Core API 部署，不只 SPA）

這台機器不一定會 checkout 到 `dudupay` repo，上面兩份決策的細節需要另外去那個 repo 查，這裡不放相對連結。
