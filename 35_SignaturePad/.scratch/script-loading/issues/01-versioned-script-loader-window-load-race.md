# versioned script loader + window `load` race → PDF fails to load

Status: wontfix (informational — the affected code path is currently dead/commented-out, no live bug to fix; keep as a gotcha reference for future script-loading changes)

## Context

`MemberSign2.html` had an experimental script-loading setup (now commented out in the Razor comment block, `MemberSign2.html:838-844`):

```html
<script src="~/js/version-loader.js?v=1"></script>
<script>
  loadVersionedScripts([
    '@Url.Content("~/js/common.js")',
    '@Url.Content("~/js/memberSign2.js")',
  ]);
</script>
```

`loadVersionedScripts` does an async `fetch` `HEAD` request per script to compare `Last-Modified` against a locally cached version, and only *then* dynamically injects the real `<script src="...">` tag if a refetch is needed.

## What happened

The reporter placed this `loadVersionedScripts(...)` call as the **last** script on the page (after `pdf.min.js`, `qrcode.js`, etc.) and observed the contract PDF failing to render.

## Root cause

`memberSign2.js` registers its own `window` `load` listener at the top level of the file:

```js
// MemberSign2.js:792
$(window).on("load", function () {
  ...
  LoadPdfFromUrl("/img/DUDUPAY享後付條款暨約定書.pdf"); // MemberSign2.js:816
  ...
});
```

`LoadPdfFromUrl` — the function that actually renders the PDF into `#pdf_container` — only runs once this listener fires. But the listener isn't registered until `memberSign2.js` itself has finished downloading and executing, and `loadVersionedScripts` makes that happen **asynchronously** (network round trip for the `HEAD` check, then a dynamically-inserted `<script>` tag).

The browser's native `window` `load` event fires once, as soon as all currently in-flight resources are done. When `loadVersionedScripts(...)` sits at the very bottom of the page, everything else (images, CSS, other synchronous `<script src>` tags) has typically already finished loading by the time the HEAD-check promise is still in flight — so the browser has nothing left to wait on and fires `load` immediately. Only after that does the HEAD check resolve and the real `<script src="memberSign2.js">` get injected and start downloading. By the time it finishes and reaches `$(window).on('load', ...)`, the `load` event has already fired and won't fire again — the listener is dead on arrival, `LoadPdfFromUrl` never runs, and the PDF never appears.

Placing the same code higher up (while other resources are still in flight) happens to dodge the race, because those other pending requests keep `load` from firing until after the dynamic script injection has had a chance to start — but that's incidental, not a fix.

## Why this doesn't currently bite

The whole `version-loader.js` / `loadVersionedScripts` experiment is commented out in the live HTML (`MemberSign2.html:818-850`). The active script list loads everything via plain, synchronous `<script src="...">` tags in a fixed order (see `docs/agents/domain.md` / prior conversation for the full list), so there's no async gap for this race to occur in.

## If this pattern gets revived

Don't gate business logic behind a one-shot global `window load` event when any of the scripts registering that listener load asynchronously. Instead, have `loadVersionedScripts` (or whatever replaces it) resolve a `Promise` per script — or take an `onload` callback — and have the caller explicitly wait on `Promise.all([...]).then(() => initApp())` before relying on anything the scripts define. That removes the dependency on the browser's `load` timing entirely.
