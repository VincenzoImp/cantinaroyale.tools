import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssetThumbnail } from "@/features/nft/asset-thumbnail";

describe("AssetThumbnail", () => {
  it("uses the filled canvas surface for weapon thumbnails", () => {
    const { container } = render(
      <AssetThumbnail
        type="weapons"
        url="https://media.elrond.com/nfts/asset/blaster.png"
        thumbnailUrl={null}
        alt="Blaster"
        className="h-12 w-12"
        sizes="48px"
      />,
    );

    expect(
      container.querySelector("[data-transparent-asset-surface='true']"),
    ).not.toBeInTheDocument();
    expect(container.querySelector("span")).toHaveClass("bg-canvas");
    expect(container.querySelector("span")).not.toHaveClass(
      "asset-transparent-surface",
    );
  });
});
