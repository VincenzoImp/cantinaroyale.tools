import Image from "next/image";
import type { CollectionType } from "@/server/data/schema";

type AssetThumbnailProps = {
  type: CollectionType;
  url: string | null;
  thumbnailUrl: string | null;
  alt?: string;
  className: string;
  sizes: string;
  priority?: boolean;
};

function imageUrlForAsset({
  type,
  url,
  thumbnailUrl,
}: Pick<AssetThumbnailProps, "type" | "url" | "thumbnailUrl">) {
  return type === "weapons" ? (url ?? thumbnailUrl) : (thumbnailUrl ?? url);
}

export function AssetThumbnail({
  type,
  url,
  thumbnailUrl,
  alt = "",
  className,
  sizes,
  priority = false,
}: AssetThumbnailProps) {
  const imageUrl = imageUrlForAsset({ type, url, thumbnailUrl });

  return (
    <span
      className={`relative block shrink-0 overflow-hidden border border-line bg-canvas ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={type === "weapons" ? "object-contain p-1" : "object-cover"}
        />
      ) : null}
    </span>
  );
}
