# Domain Docs

How the engineering skills should consume this project's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at this folder's root (`35_SignaturePad/CONTEXT.md`)
- **`docs/adr/`** — read ADRs that touch the area you're about to work in

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context project:

```
35_SignaturePad/
├── CONTEXT.md
├── docs/
│   ├── adr/
│   └── agents/
├── MemberSign2.html
└── MemberSign2.js
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

## Note: this project shares a git repo with other unrelated sub-projects

`35_SignaturePad/` is one of many independent, unrelated sub-projects living under the same `07_mydy` git repo. This project's `CONTEXT.md` and `docs/adr/` are scoped to this folder only — don't conflate its domain language or decisions with any other sub-project's.
