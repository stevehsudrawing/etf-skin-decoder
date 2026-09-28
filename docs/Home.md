# etf-skin-decoder

> [!WARNING]
> This package is in **beta**. The public API, decoding behavior,
> package layout and documentation may still change in any `0.x`
> release; treat every minor release as potentially breaking. Do not
> use it in production yet.

Unofficial, community-built decoder for
[ETF (Entity Texture Features)](https://github.com/Traben-0/Entity_Texture_Features)
player-skin features - the standalone extraction of the decoder
built into
[`skinview3d-etf`](https://github.com/stevehsudrawing/skinview3d-etf).
Not affiliated with or endorsed by the ETF or skinview3d projects.

## 1. What it decodes

- transparency on the base skin layer;
- emissive (glowing) pixels;
- blinking eyes;
- the villager and textured noses;
- the enchanted pixel pattern;
- the jacket/dress extension.

`decodeSkin()` reads every feature above from a 64x64 (or legacy
64x32) player-skin image and returns renderer-ready data. The
package is zero-dependency and DOM-free, so it runs in the browser
and in Node.

## 2. Install and quick start

```sh
npm install etf-skin-decoder
```

```ts
import { decodeSkin } from "etf-skin-decoder";

// Any ImageData-compatible buffer, e.g. from a canvas:
const image = ctx.getImageData(0, 0, 64, 64);
const result = decodeSkin(image);

if (result.hasMarker) {
  console.log(result.cells, result.slots);
}
```

The repository README carries the result-shape table and the
complete format API tables.

## 3. Documentation

- [Format](Format.md) - the ETF player-skin format reference: the
  marker, the palette, the choice slots and every feature's
  semantics;
- [Guides](Guides.md) - reading a skin in depth and the write
  recipes built on the public format API.

## 4. Project links

- [npm package](https://www.npmjs.com/package/etf-skin-decoder);
- [Repository](https://github.com/stevehsudrawing/etf-skin-decoder);
- [Issues](https://github.com/stevehsudrawing/etf-skin-decoder/issues);
- [Wiki](https://github.com/stevehsudrawing/etf-skin-decoder/wiki) -
  the latest-state mirror of this documentation.

## 5. License

MIT - see the repository's `LICENSE`. ETF is LGPL-3.0 and serves as
a specification reference only; no ETF code, comments or assets are
copied into this project.
