# LinkedIn link preview

## Approved scope

Use the existing, unmodified Cantina Royale logo as the preview image for
`https://cantinaroyale-tools.vercel.app/`. The user approved autonomous
implementation, testing and publication, then explicitly selected the logo
instead of a new social card.

## Diagnosis

The deployed homepage returns HTTP 200 for ordinary requests and requests with
the LinkedInBot user agent. Its initial HTML includes an Open Graph title and
description but no `og:image`. The existing logo is a 550-by-375 PNG at
`public/images/cantina_logo.png`.

## Design

Add this existing public asset to the root layout's Open Graph metadata, with
its actual dimensions, PNG MIME type and descriptive alternative text. Keep
the existing production metadata base so Next.js emits an absolute HTTPS URL.
Retain the existing title, description, interface and assets without changes.
No generated artwork, dependencies, crawler exceptions or LinkedIn automation.

## Acceptance

- Tests check the exported metadata and the referenced PNG's real dimensions.
- The production build, type checks, lint and existing tests pass.
- The deployed initial HTML exposes the absolute logo URL in `og:image`.
- The logo URL returns HTTP 200 and `image/png` to an unauthenticated request.
- Do not claim LinkedIn has refreshed a previously cached preview unless that
  has actually been observed; its cache is outside the repository's control.
