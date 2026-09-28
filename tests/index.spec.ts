/**
 * Public entry surface: the runtime exports of `src/index.ts` are the
 * package's contract, so a lost re-export must fail here. The frozen
 * tier is the complete `core/` toolkit plus `decodeSkin` (user
 * direction 2026-09-29).
 */

import { describe, expect, it } from "vitest";
import * as constants from "../src/core/constants";
import { SKIN_SIZE } from "../src/core/constants";
import * as legacy from "../src/core/legacy";
import * as pixels from "../src/core/pixels";
import { buildMask } from "../src/core/pixels";
import * as entry from "../src/index";
import { decodeSkin } from "../src/index";

describe("public entry", () => {
  it("re-exports the decoder entry point", () => {
    expect(entry.decodeSkin).toBe(decodeSkin);
  });

  it("re-exports the frozen format tier samples", () => {
    expect(entry.SKIN_SIZE).toBe(SKIN_SIZE);
    expect(entry.buildMask).toBe(buildMask);
  });

  it("surfaces every runtime export of the core toolkit", () => {
    for (const mod of [constants, pixels, legacy]) {
      for (const name of Object.keys(mod)) {
        expect(entry).toHaveProperty(name);
      }
    }
  });

  it("keeps the pipeline internals internal", () => {
    expect(entry).not.toHaveProperty("checkSignature");
    expect(entry).not.toHaveProperty("decodeJacket");
  });
});
