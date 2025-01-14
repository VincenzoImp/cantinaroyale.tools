import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site metadata", () => {
  it("uses the deployed Vercel URL as the canonical metadata base", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");

    expect(source).toContain(
      'metadataBase: new URL("https://cantinaroyale-tools.vercel.app/")',
    );
    expect(source).not.toContain("https://cantinaroyale.tools");
  });
});
