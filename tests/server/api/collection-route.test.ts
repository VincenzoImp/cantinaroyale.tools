import { beforeAll, describe, expect, it } from "vitest";
import { GET } from "@/app/api/collections/[identifier]/route";
import { buildSqliteDatabase } from "@/server/data/build";

const context = {
  params: Promise.resolve({ identifier: "All-Characters" }),
};

describe("collection API route", () => {
  beforeAll(() => {
    buildSqliteDatabase();
  });

  it("returns bad request instead of throwing on invalid query params", async () => {
    const response = await GET(
      new Request("http://localhost/api/collections/All-Characters?sort=broken"),
      context,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid collection query");
  });

  it("returns a compact successful page for valid params", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/collections/All-Characters?pageSize=10&sort=rank",
      ),
      context,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.page.rows).toHaveLength(10);
    expect(body.page.rows[0]).not.toHaveProperty("attributes");
  });
});
