---
name: Bug report
about: Report a problem with `decodeSkin()` or the format API
title: "[BUG]"
labels: bug
assignees: ""
---

<!-- Thanks for helping! Please fill in the sections below. -->

## 1. Before you report

- [ ] I have searched the open and closed issues for duplicates.
- [ ] I have read the README status and roadmap; the affected
      behavior is expected at the current stage. (The package is in
      beta; the decoder supports 64x64 and legacy 64x32 skins, and
      any other size reports `supported: false` by design.)
- [ ] I can reproduce the problem with the latest published release
      (`npm install etf-skin-decoder`).

## 2. Description

<!-- A clear and concise description of the problem. -->

## 3. Affected area

- [ ] `decodeSkin()` result (marker, cells, slots)
- [ ] transparency / forced solid
- [ ] emissive
- [ ] blinking
- [ ] nose (villager / textured)
- [ ] enchanted (box, keys, mask)
- [ ] jacket (texture, moved sources, masks)
- [ ] legacy (64x32) conversion
- [ ] the format API (tables, helpers, types)
- [ ] documentation (README, docs pages, wiki)

## 4. Environment

- etf-skin-decoder version or commit:
- Runtime: browser and version, or Node version:
- Operating system:
- How the skin is provided (canvas `getImageData()`, a PNG
  library, a raw buffer, ...):

## 5. Steps to reproduce

<!--
  A minimal code snippet helps a lot. Please attach a skin only if you
  have the right to share it (the ETF example skins are not
  MIT-licensed); a self-drawn minimal skin is perfect.
-->

1.
2.
3.

## 6. Expected behavior

## 7. Actual behavior

## 8. Debug information

<!--
  Console output and a summary of the `decodeSkin()` result help
  (for example `JSON.stringify` of the result with the mask /
  texture fields trimmed).
-->

- Console output:
- Result summary:

## 9. Additional context
