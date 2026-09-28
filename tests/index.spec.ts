/**
 * Placeholder entry spec: the real entry-point coverage arrives with
 * the decode-layer migration (commit-2).
 */

import { describe, expect, it } from "vitest";
import * as entry from "../src/index";

describe("public entry", () => {
  it("loads the placeholder module", () => {
    expect(entry).toBeDefined();
  });
});
