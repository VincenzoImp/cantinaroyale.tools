import { z } from "zod";

const nullableUrlSchema = z.string().url().nullable();
const nullableStringSchema = z.string().nullable();
const nullableNumberSchema = z.number().finite().nullable();
const nullableIntegerSchema = z.number().int().nullable();

export const collectionTypeSchema = z.enum(["characters", "weapons"]);

export const collectionSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: collectionTypeSchema,
  nftCount: z.number().int().nonnegative(),
  holderCount: z.number().int().nonnegative().nullable(),
  description: z.string().nullable(),
  iconUrl: nullableUrlSchema,
});

export const attributeValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const baseNftSchema = z.object({
  identifier: z.string().min(1),
  collection: z.string().min(1),
  name: z.string().min(1),
  url: nullableUrlSchema,
  thumbnailUrl: nullableUrlSchema,
  owner: nullableStringSchema,
  rank: nullableNumberSchema,
  priceCurrency: nullableStringSchema,
  priceAmount: nullableNumberSchema,
  value: nullableNumberSchema,
  discount: nullableNumberSchema,
  progress: nullableNumberSchema,
  attributes: z.record(z.string(), attributeValueSchema),
});

export const characterNftSchema = baseNftSchema.extend({
  type: z.literal("characters"),
  rarityClass: nullableStringSchema,
  perk1: nullableStringSchema,
  perk2: nullableStringSchema,
  level: nullableIntegerSchema,
  characterTokens: nullableNumberSchema,
  health: nullableNumberSchema,
  shield: nullableNumberSchema,
  talentPointsAvailable: nullableNumberSchema.optional(),
  talentPointsTotal: nullableNumberSchema.optional(),
  earnRate: nullableNumberSchema.optional(),
});

export const weaponNftSchema = baseNftSchema.extend({
  type: z.literal("weapons"),
  xp: nullableNumberSchema,
  wear: nullableNumberSchema,
  level: nullableIntegerSchema,
  starLevel: nullableIntegerSchema,
  damage: nullableNumberSchema,
  reloadTime: nullableNumberSchema,
  ammo: nullableNumberSchema,
  range: nullableNumberSchema,
});

export const nftSchema = z.discriminatedUnion("type", [
  characterNftSchema,
  weaponNftSchema,
]);

export const collectionRowSchema = z.object({
  type: collectionTypeSchema,
  identifier: z.string().min(1),
  collection: z.string().min(1),
  name: z.string().min(1),
  url: nullableUrlSchema,
  thumbnailUrl: nullableUrlSchema,
  owner: nullableStringSchema,
  rank: nullableNumberSchema,
  priceCurrency: nullableStringSchema,
  priceAmount: nullableNumberSchema,
  value: nullableNumberSchema,
  discount: nullableNumberSchema,
  progress: nullableNumberSchema,
  rarityClass: nullableStringSchema,
  perk1: nullableStringSchema,
  perk2: nullableStringSchema,
  level: nullableIntegerSchema,
  characterTokens: nullableNumberSchema,
  health: nullableNumberSchema,
  shield: nullableNumberSchema,
  xp: nullableNumberSchema,
  wear: nullableNumberSchema,
  starLevel: nullableIntegerSchema,
  damage: nullableNumberSchema,
  reloadTime: nullableNumberSchema,
  ammo: nullableNumberSchema,
  range: nullableNumberSchema,
});

export const sortDirectionSchema = z.enum(["asc", "desc"]);
export const listingFilterSchema = z.enum(["all", "listed", "unlisted"]);

export const collectionSortKeySchema = z.enum([
  "identifier",
  "collection",
  "name",
  "owner",
  "rank",
  "priceAmount",
  "value",
  "discount",
  "progress",
  "rarityClass",
  "perk1",
  "perk2",
  "level",
  "characterTokens",
  "health",
  "shield",
  "xp",
  "wear",
  "starLevel",
  "damage",
  "reloadTime",
  "ammo",
  "range",
]);

const trimmedOptionalString = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const collectionQuerySchema = z.object({
  identifier: z.string().min(1),
  type: collectionTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(10)
    .default(25)
    .transform((value) => Math.min(value, 100)),
  search: trimmedOptionalString,
  sortBy: collectionSortKeySchema.default("identifier"),
  sortDirection: sortDirectionSchema.default("asc"),
  listing: listingFilterSchema.default("all"),
  collection: trimmedOptionalString,
  rarityClass: trimmedOptionalString,
  priceCurrency: trimmedOptionalString,
  name: trimmedOptionalString,
  perk: trimmedOptionalString,
  level: z.coerce.number().int().optional(),
  starLevel: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().finite().optional(),
  maxPrice: z.coerce.number().finite().optional(),
  minRank: z.coerce.number().finite().optional(),
  maxRank: z.coerce.number().finite().optional(),
  minValue: z.coerce.number().finite().optional(),
  maxValue: z.coerce.number().finite().optional(),
  minProgress: z.coerce.number().finite().optional(),
  maxProgress: z.coerce.number().finite().optional(),
});

export const searchResultSchema = z.object({
  identifier: z.string().min(1),
  collection: z.string().min(1),
  type: collectionTypeSchema,
  name: z.string().min(1),
  url: nullableUrlSchema,
  thumbnailUrl: nullableUrlSchema,
});

export const collectionPageSchema = z.object({
  rows: z.array(collectionRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});

export type CollectionType = z.infer<typeof collectionTypeSchema>;
export type CollectionSummary = z.infer<typeof collectionSummarySchema>;
export type AttributeValue = z.infer<typeof attributeValueSchema>;
export type CharacterNft = z.infer<typeof characterNftSchema>;
export type WeaponNft = z.infer<typeof weaponNftSchema>;
export type Nft = z.infer<typeof nftSchema>;
export type CollectionRow = z.infer<typeof collectionRowSchema>;
export type CollectionSortKey = z.infer<typeof collectionSortKeySchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type ListingFilter = z.infer<typeof listingFilterSchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type CollectionPage = z.infer<typeof collectionPageSchema>;
