import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";

describe("site metadata", () => {
  it("uses the deployed Vercel URL as the canonical metadata base", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");

    expect(source).toContain(
      'metadataBase: new URL("https://cantinaroyale-tools.vercel.app/")',
    );
    expect(source).not.toContain("https://cantinaroyale.tools");
  });

  it("uses the original Cantina Royale logo for social link previews", () => {
    expect(metadata.openGraph).toMatchObject({
      images: [
        {
          url: "/images/cantina_logo.png",
          width: 550,
          height: 375,
          type: "image/png",
          alt: "Cantina Royale logo",
        },
      ],
    });
  });

  it("describes the actual public PNG dimensions", () => {
    const logo = readFileSync("public/images/cantina_logo.png");

    expect(logo.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(logo.readUInt32BE(16)).toBe(550);
    expect(logo.readUInt32BE(20)).toBe(375);
  });
});
