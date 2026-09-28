# Guides

How to read the features out of a skin and how to write them back
with the package's format API. The exact tables are exported from
the package root; the README lists every symbol, and
[Format.md](Format.md) explains what the data means.

## 1. Reading a skin

### 1.1 The input

`decodeSkin()` accepts any `ImageData`-compatible buffer:
`{ width, height, data }` with row-major RGBA bytes in a
`Uint8ClampedArray`. In a browser, `ctx.getImageData(...)` is ready
to pass; in Node, any PNG decoder that produces the same shape works
(the package itself stays DOM-free).

The call:

- throws a `TypeError` for malformed buffers (non-integer or
  non-positive sizes, wrong byte length);
- converts legacy 64x32 skins to the 1.8 layout first;
- returns `supported: false` with a warning for any other size;
- returns `hasMarker: false` and no features for marker-less skins.

### 1.2 The result

| Field          | Meaning                                                          |
| -------------- | ---------------------------------------------------------------- |
| `supported`    | `true` for 64x64; `false` disables every other field             |
| `warnings`     | non-fatal notes (unsupported sizes)                              |
| `hasMarker`    | the eleven signature pixels matched                              |
| `cells`        | the four marker cells as palette ids (`null` unset)              |
| `slots`        | the raw slot values as palette ids (`null` unset)                |
| `transparency` | `enabled` (the marker gate) and `forcedSolid` (the flag)         |
| `blink`        | mode, eye position and the prepared frames, or `null`            |
| `nose`         | the villager / textured flags and the 8x8 image, or `null`       |
| `jacket`       | style, length, flags, the 64x64 texture and its masks, or `null` |
| `emissive`     | box, keys and mask, or `null`                                    |
| `enchanted`    | box, keys and mask, or `null`                                    |
| `skin`         | the base skin with the removals and solid strips applied         |

Notes: `blink.frames` holds one or two prepared frames (the first is
the fully-closed state); `jacket.emissiveMask` / `enchantedMask` are
cut from `jacket.texture`. Everything is plain data - no three.js,
no DOM - and the input buffer is never mutated.

## 2. Writing a skin

Short recipes that build a marked skin with the public tier, then
validate it with `decodeSkin()`. All of them mutate a 64x64 buffer.

### 2.1 Start a buffer

```ts
import { createImage } from "etf-skin-decoder";

const skin = createImage(64, 64); // fully transparent
```

### 2.2 Paint the marker signature

```ts
import { MARKER_SIGNATURE, setPixel } from "etf-skin-decoder";

for (const [at, rgb] of MARKER_SIGNATURE) {
  setPixel(skin, at.x, at.y, [...rgb, 255]);
}
```

### 2.3 Choose the pattern cells

```ts
import { MARKER_CELLS, paletteColor, setPixel } from "etf-skin-decoder";

// The first cell holding pink enables the emissive pattern...
setPixel(skin, MARKER_CELLS[0].x, MARKER_CELLS[0].y, paletteColor(1));
// ...and the first holding cyan enables the enchanted pattern.
setPixel(skin, MARKER_CELLS[3].x, MARKER_CELLS[3].y, paletteColor(2));
```

### 2.4 Set the choice slots

```ts
import { SLOTS, paletteColor, setPixel } from "etf-skin-decoder";

// Blink mode 4, eyes at row 3.
setPixel(skin, SLOTS.blink.x, SLOTS.blink.y, paletteColor(4));
setPixel(skin, SLOTS.eyePosition.x, SLOTS.eyePosition.y, paletteColor(3));

// The jacket: style 2, length 5.
setPixel(skin, SLOTS.jacketStyle.x, SLOTS.jacketStyle.y, paletteColor(2));
setPixel(skin, SLOTS.jacketLength.x, SLOTS.jacketLength.y, paletteColor(5));
```

Nose type 9 is the one value without a palette swatch - write the
raw pixel:

```ts
import { NOSE_TYPE9_PIXEL, SLOTS, setPixel } from "etf-skin-decoder";

setPixel(skin, SLOTS.nose.x, SLOTS.nose.y, NOSE_TYPE9_PIXEL);
```

### 2.5 Force the base layer solid

Writing the forced-solid slot is enough for the format - the decoder
(and any ETF consumer) forces the regions opaque when reading:

```ts
import { SLOTS, paletteColor, setPixel } from "etf-skin-decoder";

setPixel(skin, SLOTS.forcedSolid.x, SLOTS.forcedSolid.y, paletteColor(1));
```

To make the pixels themselves opaque (for a plain viewer that does
not know the format), strip the regions yourself:

```ts
import { FORCED_SOLID_RECTS, stripAlphaRect } from "etf-skin-decoder";

for (const rect of FORCED_SOLID_RECTS) {
  stripAlphaRect(skin, rect);
}
```

### 2.6 Paint a pattern

Paint non-transparent pixels into the chosen box; every distinct
color becomes a key:

```ts
import { MARKER_BOXES, paletteColor, setPixel } from "etf-skin-decoder";

const box = MARKER_BOXES[0]; // the emissive box selected by cell 1
setPixel(skin, box.topLeft.x, box.topLeft.y, paletteColor(7));
```

To preview the overlay a reader will cut - the exact key matches
across the whole skin - use the same two helpers the decoder uses:

```ts
import { MARKER_BOXES, buildMask, collectKeys } from "etf-skin-decoder";

const box = MARKER_BOXES[0];
const mask = buildMask(skin, collectKeys(skin, box));
```

### 2.7 Paint the jacket

The jacket texture is not stored on the skin: a reader builds it
from five regions of the leg outer layer (`JACKET_COPY_TABLE`), each
source's bottom edge grown by `L = length - 1`, and styles 5-8 also
drop the two top-face copies. To author a jacket, paint those leg
source regions and set the style / length slots. The moved styles
(2, 4, 6, 8) clear their sources when a reader decodes the skin
(`JACKET_MOVED_RECTS`), so one painted source serves both
behaviors. `copyRect()` is handy for stamping artwork between
buffers.

### 2.8 Validate

```ts
import { decodeSkin } from "etf-skin-decoder";

const result = decodeSkin(skin);
console.log(result.hasMarker, result.cells, result.slots);
console.log(result.blink?.mode, result.jacket?.style);
```

`result.nose`, `result.emissive` and the other fields confirm each
feature the same way a foreign implementation would read the skin.

## 3. Notes and pitfalls

- Choice pixels are matched exactly (RGBA, alpha included): use
  `paletteColor()` for the opaque palette values. Blended or
  anti-aliased colors read as unset.
- Unset is fully lenient: black, transparent and arbitrary colors in
  the cells and slots are all valid "off" states.
- The nose slot ignores the nose color 666, and type 9 is the only
  value written outside the palette (`NOSE_TYPE9_PIXEL`).
- Legacy input: `isLegacySkin()` detects 64x32 skins and
  `convertLegacySkin()` produces the 1.8 layout buffer;
  `decodeSkin()` calls both automatically.
- `decodeSkin()` returns a new `skin` buffer; the input buffer is
  never mutated.
