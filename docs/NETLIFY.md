# Deploy Haven on Netlify

The repository supports two builds. Sites uses Vinext/Cloudflare and writes `dist`. Netlify needs actual Next.js output in `.next`; pointing Netlify's Next.js adapter at `dist` causes the reported “expected Next.js build output” error.

The root `netlify.toml` now sets:

- Build command: `npm run build:netlify`
- Publish directory: `.next`
- Node.js: 22
- Base directory: repository root

Deploy the latest `main` commit. Keep Netlify's automatic Next.js runtime enabled. Remove any older manual static-SPA redirect or skip-plugin setting; this application needs server functions. Do not upload `dist` or use a static export. If a cached deployment still uses the old settings, clear its build cache and redeploy.

## Runtime configuration

Build success does not transfer the original Site's private runtime bindings. Add these variables to Netlify's server/function environment:

| Variable | Purpose |
| --- | --- |
| FIREBASE_API_KEY | Firebase web API key |
| FIREBASE_PROJECT_ID | Firebase project ID; enable Email/Password authentication |
| CLOUDFLARE_ACCOUNT_ID | Account containing your D1 database and R2 bucket |
| CLOUDFLARE_API_TOKEN | Server-only Cloudflare token authorized for the selected database and bucket |
| CLOUDFLARE_D1_DATABASE_ID | D1 database with the migrations in `drizzle/` applied |
| CLOUDFLARE_R2_BUCKET | R2 bucket name for uploaded property photos |

Use your own Cloudflare resources unless you already have authorized access to the existing data. Managed Sites bindings are not exportable merely by copying the source. Do not put tokens in GitHub or use `NEXT_PUBLIC_` prefixes. No credentials are required just to compile.

Without storage settings, illustrative listings remain browsable and a data-unavailable notice is shown; saving and posting need configured storage. Without Firebase settings, the account page states that sign-in is being configured. ChatGPT sign-in is available only on the original Sites host, not on Netlify. The Netlify build explicitly rejects user-supplied Sites identity headers.

## Local production check

```sh
npm run build:netlify
npm run start:next
```

This produces `.next/BUILD_ID`, routes manifests, browser assets, and server route bundles. Netlify packages those into its own functions during deployment. Generated output stays out of Git; Netlify rebuilds it from source.

The original Sites build remains `npm run build`. `lib/runtime.ts` uses native Worker bindings; the dedicated Next.js TypeScript configuration selects `lib/runtime-node.ts`, which accesses configured Cloudflare storage through its HTTPS API.

References: [Netlify Next.js settings](https://docs.netlify.com/snippets/frameworks/nextjs-config-values/), [Cloudflare R2 API](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/objects/).
