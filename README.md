# etf-skin-decoder

Unofficial, community-built decoder for
[ETF (Entity Texture Features)](https://github.com/Traben-0/Entity_Texture_Features)
player-skin features - the standalone extraction of the decoder built
into [`skinview3d-etf`](https://github.com/stevehsudrawing/skinview3d-etf).
It reads a Minecraft player-skin image (the `ImageData`-like
`{ width, height, data }` buffer) and returns the renderer-ready
feature data:

- transparency on the base skin layer;
- emissive (glowing) pixels;
- blinking eyes;
- villager nose and the textured nose variants;
- the enchanted pixel pattern;
- the jacket/dress extension.

The package is zero-dependency and DOM-free, so it runs in the
browser and in Node. The full README - install, usage, the format API
table and the beta notice - arrives with the v0.1.0 release.

## 1. Status

Early development. The package currently contains scaffolding only:
the decode API (`decodeSkin()`) is migrated in during the v0.1.0
line, which is beta.

## 2. Roadmap

- [x] package scaffold and tooling (build, test, lint, git hooks);
- [ ] decode-layer migration from `skinview3d-etf` (source, specs,
      fixtures);
- [ ] the format API tier frozen and documented;
- [ ] v0.1.0 release on npm.

## 3. Credits and disclaimer

Not affiliated with or endorsed by the ETF or skinview3d projects.
ETF is LGPL-3.0 and serves as a specification reference only; no ETF
code, comments, or assets are copied into this project.

## 4. License

MIT - see [LICENSE](LICENSE).
