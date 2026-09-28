# etf-skin-decoder

Unofficial, community-built decoder for
[ETF (Entity Texture Features)](https://github.com/Traben-0/Entity_Texture_Features)
player-skin features. It reads a Minecraft player-skin image (an
`ImageData`-compatible `{ width, height, data }` buffer) and returns
the renderer-ready feature data: transparency, emissive (glowing)
pixels, blinking eyes, the villager and textured noses, the enchanted
pixel pattern and the jacket/dress extension. The package is the
standalone extraction of the decoder built into
[`skinview3d-etf`](https://github.com/stevehsudrawing/skinview3d-etf).

> [!WARNING]
> This package is in **beta**. The public API, decoding behavior,
> package layout and documentation may still change in any `0.x`
> release; treat every minor release as potentially breaking. Do not
> use it in production yet.

## 1. Install

```sh
npm install etf-skin-decoder
```

Zero runtime dependencies and DOM-free, so the decoder runs in the
browser and in Node. ESM-only, with type declarations and a source
map.

## 2. Quick start

```ts
import { decodeSkin } from "etf-skin-decoder";

// Any ImageData-compatible buffer, e.g. from a canvas:
const image = ctx.getImageData(0, 0, 64, 64);
const result = decodeSkin(image);

if (result.hasMarker) {
  console.log(result.cells, result.slots);
  console.log(result.blink?.mode, result.jacket?.style);
}
```

The result's fields:

| Field          | Meaning                                                  |
| -------------- | -------------------------------------------------------- |
| `supported`    | `true` for 64x64; `false` disables every other field     |
| `warnings`     | non-fatal notes (unsupported sizes)                      |
| `hasMarker`    | the eleven signature pixels matched                      |
| `cells`        | the four marker cells as palette ids (`null` unset)      |
| `slots`        | the raw slot values as palette ids (`null` unset)        |
| `transparency` | `enabled` (the marker gate) and `forcedSolid` (the flag) |
| `blink`        | mode, eye position and prepared frames, or `null`        |
| `nose`         | villager / textured flags and the 8x8 image, or `null`   |
| `jacket`       | style, flags, the 64x64 texture and masks, or `null`     |
| `emissive`     | box, keys and mask, or `null`                            |
| `enchanted`    | box, keys and mask, or `null`                            |
| `skin`         | the base skin with removals and solid strips applied     |

The full field tour and the write recipes live in
[docs/Guides.md](docs/Guides.md).

## 3. The format API

Every export of the package's `core/` modules is public: the frozen
format tables, the pixel helpers, the types and the legacy
converters. Build your own decoder, editor or encoder on top of the
package without re-deriving the format. The format itself is
described in [docs/Format.md](docs/Format.md).

### 3.1 Frozen constants

| Symbol                     | What it is                                |
| -------------------------- | ----------------------------------------- |
| `SKIN_SIZE`                | the 64x64 layout side length              |
| `MARKER_SIGNATURE`         | the eleven checked signature pixels       |
| `MARKER_CELLS`             | the four marker-choice cells              |
| `MARKER_BOXES`             | the four 8x8 pattern boxes                |
| `PALETTE`                  | the id / name / RGBA color-guide table    |
| `paletteColor(id)`         | resolves a palette id to its exact RGBA   |
| `NOSE_COLOR`               | the villager nose color (id 666)          |
| `SLOTS`                    | the seven choice-slot coordinates         |
| `NOSE_TYPE9_PIXEL`         | the raw pixel encoding nose type 9        |
| `DEPRECATED_NOSE_RECTS`    | the deprecated six-pixel villager noses   |
| `NOSE_CAPE_REGIONS`        | the five textured-nose source regions     |
| `BLINK_FACE_RECT`          | the face-front blink target               |
| `BLINK_FLOATING_FACE_RECT` | the floating-face blink target            |
| `BLINK_CORNERS`            | the four entire-face corner squares       |
| `BLINK_EYE_STRIPS`         | the closed-eye strips per pixel-tall mode |
| `BLINK_NOSE_CUT_RECTS`     | the frame cuts for the deprecated nose    |
| `JACKET_STYLES`            | the eight style definitions               |
| `JACKET_COPY_TABLE`        | the jacket-texture copy table             |
| `JACKET_MOVED_RECTS`       | the moved styles' source removals         |
| `FORCED_SOLID_RECTS`       | the ten forced-solid base regions         |

The table types (`PaletteEntry`, `BlinkCorner`, `JacketStyle`,
`JacketCopy`, `JacketSourceRemoval`) are exported alongside.

### 3.2 Pixel helpers

| Symbol                               | What it does                                    |
| ------------------------------------ | ----------------------------------------------- |
| `createImage(width, height)`         | a new transparent buffer                        |
| `cloneImage(image)`                  | a deep copy of a buffer                         |
| `getPixel(image, x, y)`              | reads one RGBA pixel                            |
| `setPixel(image, x, y, rgba)`        | writes one RGBA pixel                           |
| `sameColor(a, b)`                    | exact RGBA equality (alpha included)            |
| `fillRect(image, rect, rgba)`        | fills an inclusive rectangle                    |
| `copyRect(source, target, rect, at)` | copies a rectangle between images               |
| `clearRect(image, rect)`             | clears a rectangle to transparent black         |
| `stripAlphaRect(image, rect)`        | forces a rectangle's alpha to 255               |
| `collectKeys(image, rect)`           | the distinct non-transparent colors of a region |
| `buildMask(image, keys)`             | an overlay keeping the exact key matches        |

### 3.3 Types

| Type             | What it is                                        |
| ---------------- | ------------------------------------------------- |
| `Coordinate`     | a pixel position (`x`, `y`)                       |
| `PixelData`      | the buffer shape (`width`, `height`, `data`)      |
| `Rect`           | an inclusive rectangle (top-left to bottom-right) |
| `RGB`, `RGBA`    | the readonly 3- and 4-component color tuples      |
| `SignaturePixel` | one `MARKER_SIGNATURE` entry (`[at, rgb]`)        |
| `PaletteId`      | the color-guide id (`1`-`8`, plus `666`)          |
| `BlinkMode`      | the blink mode (`1`-`5`)                          |
| `BlinkInfo`      | the decoded blinking (mode, eye position, frames) |
| `NoseInfo`       | the decoded nose (flags and the 8x8 texture)      |
| `JacketInfo`     | the decoded jacket (style, flags, texture, masks) |
| `PatternInfo`    | a decoded pattern (box, keys, mask)               |
| `SlotValues`     | the seven raw slot values                         |
| `DecodeResult`   | the `decodeSkin()` return shape                   |

### 3.4 Legacy conversion

| Symbol                     | What it does                                         |
| -------------------------- | ---------------------------------------------------- |
| `isLegacySkin(image)`      | detects a pre-1.8 64x32 skin                         |
| `convertLegacySkin(image)` | produces the 64x64 1.8 layout (mirrored limb plates) |

`decodeSkin()` calls both automatically.

### 3.5 A small encoder sample

The same tables drive the other direction - writing a minimal
marked skin:

```ts
import {
  MARKER_CELLS,
  MARKER_SIGNATURE,
  SLOTS,
  createImage,
  paletteColor,
  setPixel,
} from "etf-skin-decoder";

const skin = createImage(64, 64);
for (const [at, rgb] of MARKER_SIGNATURE) {
  setPixel(skin, at.x, at.y, [...rgb, 255]);
}
setPixel(skin, MARKER_CELLS[0].x, MARKER_CELLS[0].y, paletteColor(1));
setPixel(skin, SLOTS.blink.x, SLOTS.blink.y, paletteColor(4));
```

More recipes (patterns, the jacket, validation) live in
[docs/Guides.md](docs/Guides.md).

## 4. Compatibility

- 64x64 skins decode natively; legacy 64x32 skins are converted to
  the 1.8 layout first; any other size returns `supported: false`
  with one warning and no features.
- Marker-less skins decode as feature-free (`hasMarker: false`).
- Browser and Node; ESM-only with type declarations. The package
  metadata declares Node >= 22.12; the ES2022 code itself runs wider.

## 5. Roadmap

- [x] package scaffold and tooling (build, test, lint, git hooks);
- [x] decode-layer migration from `skinview3d-etf` (source, specs,
      fixtures);
- [x] the format API tier frozen and documented;
- [x] v0.1.0 release on npm.

## 6. Credits and disclaimer

Not affiliated with or endorsed by the ETF or skinview3d projects.
ETF is LGPL-3.0 and serves as a specification reference only; no ETF
code, comments, or assets are copied into this project.

## 7. License

MIT - see [LICENSE](LICENSE).
