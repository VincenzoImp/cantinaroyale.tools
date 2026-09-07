# LinkedIn Logo Preview Implementation Plan

> **For agentic workers:** Use executing-plans for this tightly coupled fix.
> User approval includes autonomous execution and publication.

**Goal:** Expose the existing logo as the public site's Open Graph image.

**Architecture:** Keep metadata in the existing root layout. Next.js resolves
the public asset against its existing production metadata base and renders
the tags server-side. No new rendering service or image is needed.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Vercel.

## Global Constraints

- Use the existing, unmodified `public/images/cantina_logo.png`.
- Keep the current interface, title, description and dependencies unchanged.
- Keep `https://cantinaroyale-tools.vercel.app/` as the metadata base.
- No LinkedIn automation or account changes.

## Task 1: Declare and verify the existing logo

**Files:** Modify `src/app/layout.tsx` and
`tests/content/site-metadata.test.ts`.

**Interface:** The existing exported `metadata` object is the source of truth;
Next.js consumes `openGraph.images` and emits absolute social image metadata.

- [ ] Run the existing metadata test as a baseline.
- [ ] Import the real layout metadata into the existing test and add:

```ts
expect(metadata.openGraph).toMatchObject({
  images: [{
    url: "/images/cantina_logo.png",
    width: 550,
    height: 375,
    type: "image/png",
    alt: "Cantina Royale logo",
  }],
});
const logo = readFileSync("public/images/cantina_logo.png");
expect(logo.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
expect(logo.readUInt32BE(16)).toBe(550);
expect(logo.readUInt32BE(20)).toBe(375);
```

- [ ] Run `npm test -- tests/content/site-metadata.test.ts`; confirm it fails
  because `openGraph.images` is missing, not because of an import error.
- [ ] Add the exact `images` array above to the existing `openGraph` object.
- [ ] Re-run the metadata test; require all assertions to pass.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
- [ ] Inspect the generated homepage HTML for the absolute `og:image` URL,
  dimensions, MIME type and alt text. Check the git diff for unrelated edits.
- [ ] Commit the focused fix, publish it through the existing GitHub/Vercel
  deployment and verify the public HTML and logo using LinkedInBot requests.
- [ ] Report the commit and verification result. If necessary, provide
  LinkedIn Post Inspector as the manual cache refresh step.
