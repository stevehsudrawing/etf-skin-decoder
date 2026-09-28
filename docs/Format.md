# The ETF player-skin format

This page describes the ETF (Entity Texture Features) player-skin
format as this package reads and writes it: where the marker lives,
how the palette and the choice slots work, and what each feature
means. It is an independent description derived from player-facing
documentation and the official example skins; ETF is LGPL-3.0 and
serves as a specification reference only - no ETF code, comments or
assets are part of this package.

The exact tables behind this page are exported by the package (see
"The format API" in the README) - use those symbols rather than
re-typing coordinates. All coordinates are 64x64-layout pixels with
the origin at the top-left; every rectangle is inclusive.

## 1. The marker block

A skin opts in to the player features by carrying a marker: eleven
signature pixels, four choice cells, four pattern boxes and seven
choice slots. The signature and the cells sit in the top-left corner
`(0,16)-(3,19)`; the slots sit at x 52-53, y 16-19; the four 8x8
pattern boxes occupy the unused columns x 56-63, y 16-47.

### 1.1 The signature

The eleven pixels below must match exactly, alpha included (255).
The template's twelfth icon pixel `(3,19)` is deliberately not
checked.

| Pixel  | RGB         |
| ------ | ----------- |
| (0,16) | 127,0,0     |
| (1,16) | 255,0,0     |
| (2,16) | 0,255,0     |
| (3,16) | 0,127,0     |
| (0,17) | 255,0,0     |
| (3,17) | 0,255,0     |
| (0,18) | 0,0,255     |
| (3,18) | 255,255,255 |
| (0,19) | 0,0,127     |
| (1,19) | 0,0,255     |
| (2,19) | 255,255,255 |

### 1.2 The choice cells and the pattern boxes

Each cell is painted with a palette color to enable the pattern of
its box: pink (palette id 1) enables the emissive pattern, cyan
(id 2) the enchanted pattern. The first cell holding the choice wins.

| Cell   | Box                |
| ------ | ------------------ |
| (1,17) | 1: (56,16)-(63,23) |
| (1,18) | 2: (56,24)-(63,31) |
| (2,17) | 3: (56,32)-(63,39) |
| (2,18) | 4: (56,40)-(63,47) |

### 1.3 The palette

Choice pixels are matched with exact RGBA equality, alpha included.
Anything else reads as unset - the format is lenient here: black,
transparent and arbitrary placeholder colors are all valid.

| Id  | Name   | RGBA           |
| --- | ------ | -------------- |
| 1   | pink   | 255,0,255,255  |
| 2   | cyan   | 0,255,255,255  |
| 3   | red    | 255,0,0,255    |
| 4   | green  | 0,255,0,255    |
| 5   | brown  | 127,64,0,255   |
| 6   | blue   | 0,0,255,255    |
| 7   | orange | 255,127,0,255  |
| 8   | yellow | 255,255,34,255 |
| 666 | nose   | 144,94,67,255  |

The ids double as the choice values (a blink mode, for example, is
written as id 1-5); id 666 only appears as the deprecated nose color.

## 2. The choice slots

| Slot          | Pixel   | Values                                               |
| ------------- | ------- | ---------------------------------------------------- |
| blinking      | (52,16) | palette ids 1-5 select blink modes 1-5; else off     |
| jacket style  | (52,17) | palette ids 1-8; else off                            |
| jacket length | (52,18) | palette ids 1-8; unset or out of range decodes as 1  |
| eye position  | (52,19) | palette ids 1-8; unset or out of range decodes as 1  |
| cape          | (53,16) | retained for diagnostics; the in-skin cape is dead   |
| nose          | (53,17) | palette ids 1-8, plus the raw `(9,0,0,0)` for type 9 |
| forced solid  | (53,18) | palette id 1 (pink) forces the base layer solid      |

## 3. Feature semantics

### 3.1 Transparency and forced solid

A matching marker enables transparency: the base layer's alpha may
render. The forced-solid slot (pink, id 1) then forces the alpha of
ten base regions opaque (`FORCED_SOLID_RECTS`: the helmet faces, the
body, the arm and leg faces and the lower band). `decodeSkin()`
applies the strips to `result.skin`.

### 3.2 Blinking

- Modes 1-2 (entire face): the two stored 8x8 head corners are
  copied over the face front `(8,8)-(15,15)` and the floating-face
  front `(40,8)-(47,15)`: frame 1 from `(0,0)-(7,7)` and
  `(32,0)-(39,7)`, frame 2 from `(24,0)-(31,7)` and `(56,0)-(63,7)`.
  The first frame is the fully-closed state; the second, optional
  frame is the half-closed state. Mode 1 has one frame, mode 2 two.
- Modes 3-5 (pixel-tall eyes): one closed-eye strip is stamped
  across the face row `8 + (eyePosition - 1)`. Mode 3 uses the 1px
  strip `(12,16)-(19,16)` (one frame); mode 4 the 2px strips
  `(12,16)-(19,17)` and `(12,18)-(19,19)` (two frames); mode 5 the
  4px strips `(12,16)-(19,19)` and `(36,16)-(43,19)` (two frames).
- When the deprecated floating-face nose is removed, the stored
  entire-face frames receive the nose cuts
  (`BLINK_NOSE_CUT_RECTS`) so the removed pixels never appear in the
  closed eyes.

### 3.3 Nose

Two independent styles exist:

- Villager: from the deprecated six-pixel noses in the nose color
  `144,94,67` - `(43,13)-(44,15)` (the floating-face copy) and
  `(11,13)-(12,15)` (the face copy) - and/or from the slot. The
  floating-face copy is removed from the base skin, and its presence
  sets the "remove face pixels" behavior.
- Textured: from a prepared 8x8 image built from the former
  in-skin-cape region 1-5 (`NOSE_CAPE_REGIONS`, 8x4 each;
  transposed, mirrored, then with its halves swapped).

The nose slot values:

| Value | Meaning                                                  |
| ----- | -------------------------------------------------------- |
| 1     | villager                                                 |
| 2-6   | textured 1-5                                             |
| 7     | villager, textured                                       |
| 8     | villager, remove face pixels                             |
| 9     | villager, textured, remove face pixels (raw `(9,0,0,0)`) |
| 666   | ignored                                                  |

### 3.4 Jacket

The eight styles combine a model width, a source behavior and the
top faces:

| Id  | Name            | Model | Sources | Top |
| --- | --------------- | ----- | ------- | --- |
| 1   | copied-thin-top | thin  | copied  | yes |
| 2   | moved-thin-top  | thin  | moved   | yes |
| 3   | copied-wide-top | wide  | copied  | yes |
| 4   | moved-wide-top  | wide  | moved   | yes |
| 5   | copied-thin     | thin  | copied  | no  |
| 6   | moved-thin      | thin  | moved   | no  |
| 7   | copied-wide     | wide  | copied  | no  |
| 8   | moved-wide      | wide  | moved   | no  |

The jacket texture is built by copying five regions of the leg outer
layer into a 64x64 texture (`JACKET_COPY_TABLE`); each source's
bottom edge grows by the length offset `L = length - 1`, and the two
top-face entries apply to the top styles (1-4) only. The moved
styles (2, 4, 6, 8) clear their leg sources from the base skin
(`JACKET_MOVED_RECTS`; the side strips grow with the length).

### 3.5 Patterns (emissive and enchanted)

The chosen cell's box provides the keys: every distinct
non-transparent color of the box, in row-major first-seen order. The
mask then keeps exactly those pixels whose RGBA matches a key (alpha
included) across the whole skin. A pattern is off when the box holds
no non-transparent pixel, or when nothing in the skin matches a key.
The jacket's emissive and enchanted masks are cut from the jacket
texture with the same keys.

## 4. Processing order

The decoder applies the pipeline in this order, so every prepared
artifact sees the same working skin:

1. copy the (legacy-converted) source into the working skin;
2. nose: build the textured image from the original skin; clear the
   deprecated floating-face pixels when present;
3. jacket: build the texture from the original skin; clear the moved
   styles' leg sources;
4. forced solid: strip alpha over the ten regions;
5. blinking: apply the nose cuts (entire-face modes), then build the
   frames from the working skin;
6. patterns: select each box, collect its keys and cut the masks;
7. jacket masks: cut from the jacket texture with the pattern keys.

## 5. Compatibility

- 64x64 skins decode natively. Legacy 64x32 skins are converted to
  the 1.8 layout first: the top half is kept and the left limbs
  receive mirrored copies of the right-limb plates. The conversion
  replicates the vanilla geometry only - the host's alpha fixes are
  not part of the format.
- Any other size returns `supported: false` with one warning; every
  feature is off.
- A skin without the marker decodes as feature-free
  (`hasMarker: false`).
