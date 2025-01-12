import { expect, test } from "@playwright/test";

test("home, collection API, collection page, NFT detail, and theme", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cantina Royale Tools" }),
  ).toBeVisible();
  await expect(page.locator("header").getByRole("button", {
    name: /theme/i,
  })).toHaveCount(0);
  await expect(page.getByLabel("Search NFTs").first()).toBeVisible();

  const collectionResponse = await request.get(
    "/api/collections/All-Characters?pageSize=10&sort=rank&direction=asc",
  );
  expect(collectionResponse.ok()).toBe(true);
  const collectionPayload = await collectionResponse.json();
  expect(collectionPayload.page.rows.length).toBeLessThanOrEqual(10);
  expect(collectionPayload.page.total).toBeGreaterThan(10_000);

  await page.goto("/collection/All-Weapons?pageSize=10&q=rail");
  await expect(
    page.getByRole("heading", { name: "All Weapons" }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page
    .getByLabel("Sale status")
    .selectOption("listed");
  await expect(page).toHaveURL(/listing=listed/);

  await page.getByRole("button", { name: "Open Characters menu" }).click();
  await expect(
    page.getByRole("menu", { name: "Characters collections" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open Weapons menu" }).click();
  await expect(
    page.getByRole("menu", { name: "Characters collections" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("menu", { name: "Weapons collections" }),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 800 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Site navigation" }),
  ).toBeVisible();
  await expect(page.locator("header").getByRole("button", {
    name: /theme/i,
  })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show character collections" })
    .click();
  await expect(page.getByRole("link", { name: /All Characters/ })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 720 });

  const searchResponse = await request.get("/api/search?q=Dragonbreath&limit=1");
  expect(searchResponse.ok()).toBe(true);
  const searchPayload = await searchResponse.json();
  const identifier = searchPayload.results[0].identifier as string;

  await page.goto(`/nft/${identifier}`);
  await expect(page.getByText(identifier)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Market details" }),
  ).toBeVisible();

  await page
    .locator("footer")
    .getByRole("button", { name: "Use dark theme" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
