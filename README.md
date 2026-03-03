# Vite RSC + Cloudflare Late-Discovery Repro

This repo reproduces late server dependency discovery in Vite RSC dev mode with `@cloudflare/vite-plugin`.

## Provenance

This repro is based on:
- https://github.com/edmundhung/cloudflare-react-router-rsc

Intentional differences from that baseline:
- Uses custom RSC handling (`app/rsc-handler.ts`, `app/entry.rsc.ts`, `workers/app.ts`) to match production wiring.
- Adds `app/request-context.server.ts` to reliably trigger Cloudflare request-context warnings.
- Keeps focus on dev-mode behavior (`vite dev`) where late optimization and reload happen.

## Setup

```bash
bun install
```

## Run

```bash
DEBUG=vite:deps,vite:optimize-deps bun run dev
```

Open (use the printed local port if `5173` is taken):

- `http://localhost:5173/`
- then `http://localhost:5173/problem` (or click `Open /problem`)

## Deterministic Repro Steps

1. Start from a cold-ish dev state:

```bash
rm -r node_modules/.vite .react-router .wrangler 2>/dev/null || true
```

2. Start dev with forced dep optimization:

```bash
bun run dev -- --force
```

3. Use the printed local URL (example uses `5175`) and hit `/problem` twice:

```bash
curl -s -o /dev/null http://localhost:5175/problem
curl -s -o /dev/null http://localhost:5175/problem
```

4. Observe logs for both signatures:

Expected Vite signature:
- `✨ new dependencies optimized: @conform-to/dom/future, @conform-to/zod/v4/future`
- `✨ optimized dependencies changed. reloading`
- `[vite] program reload`

Expected Worker request-context signature:
- `Warning: A promise was resolved or rejected from a different request context ...`
- stack includes `app/request-context.server.ts` and `app/routes/problem-loader.server.ts`

## Expected behavior

First load/navigation to `/problem` triggers late dep optimization and a dev program reload while the request is in-flight.

The dev server logs should show:

- `✨ new dependencies optimized: @conform-to/dom/future, @conform-to/zod/v4/future`
- `✨ optimized dependencies changed. reloading`

Note: the page may still render successfully. This repro is focused on the
unexpected mid-request optimization+reload behavior (the root cause), which is
timing-sensitive and does not always surface as a visible browser error.

To increase likelihood of worker request-context warnings, load `/problem`
multiple times after startup. The repro arms and resolves a deferred promise
across different request contexts to mimic production pressure.

## Why this reproduces

- `@cloudflare/vite-plugin` runs the Worker entry from `wrangler.jsonc` (`workers/app.ts`)
- Worker requests are handled through React Router RSC (`app/rsc-handler.ts`, `app/entry.rsc.ts`)
- Vite envs are configured as `viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }`
- `rsc` + `ssr` environments run with `optimizeDeps.noDiscovery = false`
- `/problem` route module is discovered on first `/problem(.manifest)` request and imports `./problem-loader.server`
- `problem-loader.server` statically imports `@conform-to/dom/future` and `@conform-to/zod/v4/future`
- Those deps are discovered during request handling rather than startup, which can trigger dev program reload
