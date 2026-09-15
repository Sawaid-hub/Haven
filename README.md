# Haven

A responsive real-estate marketplace for buying, renting, and listing homes. Built with React, TypeScript, Vinext, and Cloudflare Workers, with D1 for listings/favorites and R2 for uploaded photos.

## Features

- Buy/Rent tabs, location/ZIP search, property categories, minimum/maximum prices, sorting.
- Responsive mobile, tablet, and desktop layouts.
- Property details, rotating galleries, saved homes, and Google Maps links.
- Four-step property posting with photos, review, and server-side ownership checks.
- Dedicated account page, custom 404 pages, and recoverable error screens.
- Firebase email/password sign-in, signup, and password reset, ready for project configuration.

## Run locally

**Deploying to Netlify?** See [Netlify setup](docs/NETLIFY.md). Use `npm run build:netlify` and publish `.next`; the normal Sites build produces a different format.

Use Node.js 22.13 or later. Run `npm run install:ci`, then `npm run dev` and open the local URL printed in the terminal.

Apply the existing D1 migrations for a fresh checkout as described in [runtime instructions](docs/STARTER.md#local-d1-migrations). Run `npm run build` first if the generated Wrangler configuration is missing. Never replay an already applied migration.

This is a full-stack Worker application. GitHub stores its source; GitHub Pages cannot run its database, authentication, or upload endpoints. A GitHub push alone does not update the existing Sites deployment.

## Firebase setup - activation required

The Firebase code is implemented, but no Firebase project was provided. Until both settings below are present, Haven retains its existing ChatGPT sign-in. The account page explains that email sign-in is being set up.

1. In Firebase, enable Authentication > Email/Password. Configure your password policy and password-reset email template.
2. Get the **web API key** and **project ID** from project settings. No service-account private key is needed.
3. Set `FIREBASE_API_KEY` and `FIREBASE_PROJECT_ID` as server runtime values. Locally, copy `firebase.env.example` to `.dev.vars` and fill them in. For Sites, use Sites runtime-value management. Restart preview after changes.
4. Keep Identity Toolkit API access enabled for the key. Requests originate on the server; browser-referrer-only key restrictions are unsuitable for this integration.
5. Test a real account: signup, signout/in, password reset, saving homes, uploading a photo, and publishing. These live Firebase checks remain pending until configured.

Firebase validates sessions on the server before every protected operation. Cookies are HttpOnly, SameSite=Lax, and Secure on HTTPS; sessions expire after up to one hour. Passwords and tokens are not stored in the application database or returned to browser JavaScript. The implementation uses the [official Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth).

Firebase users have distinct ownership IDs from ChatGPT users. Switching providers does not automatically migrate favorites or listing ownership. Preserve existing records and use an explicit account-linking migration if needed. Listings and photos continue to use D1/R2.

The hosted Site's platform access policy is independent of Firebase. Activating Firebase does not make an owner-private Site public.

## Checks

```sh
node --test tests/auth.test.cjs
npx tsc --noEmit
npm run build
# With local preview running:
node scripts/check-links.mjs http://localhost:5173
```

Auth tests mock Firebase responses to check token rejection, project isolation, expiry, cookies, redirects, and request-origin protection. They do not establish a live Firebase connection. The link checker verifies pages, custom 404 statuses, and anonymous API protection without creating data.

## Key files

| Path | Purpose |
| --- | --- |
| app/marketplace.tsx | Browse, favorites, details, navigation and footer |
| app/globals.css | Styling and responsive layouts |
| app/data.ts | Illustrative properties |
| app/photo-gallery.tsx | Hover previews and two-second slideshows |
| app/listing-form.tsx | Property submission |
| app/signin/page.tsx | Sign-in, signup, password reset, account |
| app/firebase-auth.ts | Server-side Firebase identity checks |
| app/api/auth/route.ts | Authentication endpoints |
| app/api/ | Listings, favorites and photo APIs |
| app/not-found.tsx, app/error.tsx, app/global-error.tsx | Custom error screens |
| db/, drizzle/ | Database schema and migrations |

## Data and exports

Sample listings have fictional addresses, contacts, and prices with illustrative stock photography. Gallery photos are not verified views of one actual property. Sample maps open the city; owner-posted maps use the full address.

Exports exclude dependencies, build output, credentials, live database contents, and uploaded R2 photos. Stock photographs are referenced by URL; the source archive is not an offline photo library.
