# Deployment Checklist — iCloud Notes Clone

## 1. Architecture Overview

```
Browser
  └── Vercel (single project)
        ├── frontend/dist/      ← Vite SPA (static files)
        │     index.html        ← SPA fallback for all non-/api routes
        └── /api/*.ts           ← Vercel Serverless Functions (Node.js)
              └── _lib/         ← Shared DB, auth, models
                    └── db.ts   ← pg Pool → Supabase Postgres
```

- **Frontend** is a React 18 + Vite SPA built from `frontend/`.
- **API** is a set of Vercel serverless functions in the root `/api/` directory — _not_ the `backend/` Express app (that is local-dev only).
- **Database** is a Supabase-hosted Postgres instance. The API connects via `DATABASE_URL`.
- **Auth** uses Google Identity Services (GIS) on the frontend to get an ID token, which is POSTed to `/api/auth/google` and exchanged for an app-level JWT (7-day expiry).

---

## 2. Vercel Project Setup

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (project root, not `frontend/`) |
| **Build Command** | `cd frontend && npm ci && npm run build` |
| **Output Directory** | `frontend/dist` |
| **Install Command** | `npm ci` (runs at root, installs `/api` deps) |

> **Why root directory matters:** Vercel needs to see both `api/` (serverless functions) and `frontend/dist/` (static output) from the same root. Setting Root Directory to `frontend/` would hide the `/api` functions.

**vercel.json** (already in repo):
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```
This tells Vercel to route `/api/*` requests to the serverless functions before falling back to the SPA's `index.html`.

---

## 3. Environment Variables

### Build-time (`VITE_*` — baked into the frontend bundle at build time)

| Variable | Where used | Where to set |
|----------|-----------|--------------|
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Services script in `frontend/index.html` | Vercel → Settings → Environment Variables (check **Production** + **Preview**) |

> Changing a `VITE_*` variable requires a **full redeploy** — it is baked into the JS bundle at build time. A restart or re-run of the function is not enough.

### Runtime (server-side — read by serverless functions at request time)

| Variable | Purpose | Where to set |
|----------|---------|--------------|
| `GOOGLE_CLIENT_ID` | Verifies Google ID tokens in `/api/auth/google` | Vercel → Environment Variables |
| `JWT_SECRET` | Signs and verifies app JWTs (use 32+ random chars) | Vercel → Environment Variables |
| `DATABASE_URL` | Postgres connection string (Supabase pooler) | Vercel → Environment Variables |
| `NODE_ENV` | Set to `production` to suppress detailed error messages | Vercel → Environment Variables |

> `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must have the **same value** (your Google OAuth client ID). They're separate variables because Vite only exposes `VITE_*` vars to the browser bundle.

### Local development (never commit these files)

```bash
# backend/.env  (used by the local Express dev server only)
DATABASE_URL=postgres://luba@localhost:5432/icloud_notes
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
JWT_SECRET=dev-secret-change-me-in-production

# frontend/.env.local  (used by Vite dev server)
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

---

## 4. Supabase Database

### Which connection string to use

Supabase provides multiple connection strings. **Use the Session-mode or Transaction-mode pooler URL** for serverless functions — never the direct connection string.

| Type | Port | Use for |
|------|------|---------|
| **Direct** | 5432 | Long-lived servers (local Express dev only) |
| **Transaction pooler** | 6543 | Serverless — recommended for Vercel |
| **Session pooler** | 5432 (pooler host) | Alternative if transaction pooler has issues |

> Vercel serverless functions open and close a DB connection on every invocation. The direct connection exhausts Postgres `max_connections` quickly under load.

**Where to find the pooler URL:** Supabase dashboard → Settings → Database → Connection pooling → Connection string (mode: Transaction).

### SSL

`api/_lib/db.ts` is already configured correctly:
```ts
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```
No additional SSL configuration needed.

### Schema

Tables are auto-created/migrated on first API request via `ensureDbInitialized()`. No manual migration step is needed after the initial deploy.

---

## 5. Google OAuth Setup

This app uses the **Google Identity Services (GIS) ID token flow**: the frontend gets an ID token directly from Google and sends it to `/api/auth/google` for verification. This is _not_ an authorization code flow with server redirects.

- ✅ **Authorized JavaScript origins** — required
- ❌ **Authorized redirect URIs** — not needed for this flow

### Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID

**Authorized JavaScript origins** must include every origin where the app is served:

```
http://localhost:5173          ← Vite dev server
https://your-app.vercel.app    ← Vercel production domain
https://preview-xxxx.vercel.app ← (optional) Vercel preview URLs
https://your-custom-domain.com  ← if using a custom domain
```

> Changes to authorized origins can take **up to 5 minutes** to propagate.

### Troubleshooting: Sign-in button does nothing / `idpiframe_initialization_failed`

This error means the current page origin is not in the authorized origins list. Check:
1. The exact URL (protocol + domain + port) matches what's in Google Console
2. You're on `https://` in production (Google requires HTTPS for non-localhost origins)
3. `VITE_GOOGLE_CLIENT_ID` in Vercel matches the client ID in Google Console

---

## 6. Verification Commands

Replace `YOUR_DOMAIN` with your Vercel preview or production URL.

```bash
# 1. Health check (returns 200 + JSON, no auth required)
curl -s https://YOUR_DOMAIN/api/health
# Expected: {"ok":true,"ts":"2026-..."}

# 2. Auth endpoint rejects GET (wrong method)
curl -s -X GET https://YOUR_DOMAIN/api/auth/google
# Expected: HTTP 405  {"error":"Method not allowed"}

# 3. Notes list requires auth
curl -s https://YOUR_DOMAIN/api/notes
# Expected: HTTP 401  {"error":"Unauthorized"}

# 4. Single note endpoint returns JSON (not HTML) without auth
curl -s https://YOUR_DOMAIN/api/notes/00000000-0000-0000-0000-000000000000
# Expected: HTTP 401  {"error":"Unauthorized"}
# WARNING: if you get <!DOCTYPE html> here, the SPA fallback is swallowing /api routes — see §7A

# 5. Invalid UUID returns 400 or 401 (never 500 or HTML)
curl -s https://YOUR_DOMAIN/api/notes/not-a-uuid
# Expected: {"error":"Unauthorized"} or {"error":"Invalid note id format"}

# 6. OPTIONS preflight returns 204
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS https://YOUR_DOMAIN/api/notes
# Expected: 204
```

---

## 7. Common Failure Modes & Fixes

### A. SPA fallback swallowing `/api/*` routes

**Symptom:** `GET /api/notes/SOME-UUID` returns `<!DOCTYPE html>` instead of JSON.

**Cause:** Vercel's SPA fallback (`index.html` for unknown routes) is catching the request before the serverless function.

**Fix:** Confirm `vercel.json` uses `rewrites` (not `routes`), which lets Vercel's filesystem/function routing run first:
```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
}
```
With `rewrites`, Vercel checks for a matching function file before applying the rewrite. Do not use `routes` for the SPA fallback — that bypasses function matching.

---

### B. Dynamic route mismatch (`[id]` vs `[...id]`)

**Symptom:** `GET /api/notes/SOME-UUID` returns Vercel's built-in 404 (not from your function).

**Cause:** `api/notes/[id].ts` matches exactly one path segment. A request with extra segments (e.g., `/api/notes/ID/sub`) won't match.

**Fix:** The current file layout (`api/notes/[id].ts`) is correct for single-ID routes. Add nested files (e.g., `api/notes/[id]/comments.ts`) only if you add new sub-resources.

---

### C. Frontend and backend Google Client ID mismatch

**Symptom:** Login button renders but clicking does nothing, or the server responds with a token verification error.

**Cause:** `VITE_GOOGLE_CLIENT_ID` (initializes GIS on the browser) and `GOOGLE_CLIENT_ID` (verifies the token server-side) must be identical.

**Fix:**
1. In Vercel → Environment Variables, confirm both variables have the same Google client ID value.
2. After changing `VITE_GOOGLE_CLIENT_ID`, trigger a **full redeploy** — it is embedded in the JS bundle at build time and a restart alone does not pick up the change.

---

### D. Supabase connection string issues

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `connection timeout` on first request | Using direct URL from serverless | Switch to pooler URL (port 6543) |
| `too many clients already` | Same as above | Same fix |
| `SSL SYSCALL error` / `SSL connection error` | SSL config mismatch | Verify `ssl: { rejectUnauthorized: false }` is set in `api/_lib/db.ts` |
| `password authentication failed` | Wrong credentials in pooler URL | Copy fresh URL from Supabase → Settings → Database → Connection pooling |
| 500 on first cold start only | Schema migration races | `ensureDbInitialized()` uses a promise lock — check function logs for the actual DB error |

---

## 8. Deployment Workflow

```bash
# 1. Push branch — Vercel auto-creates a preview URL
git push origin chore/your-branch

# 2. Run smoke tests against the preview URL (see §6)

# 3. Merge to main — Vercel auto-deploys to production
git checkout main
git merge --no-ff chore/your-branch
git push origin main

# 4. Rollback options:
#    a) Code rollback:
git revert -m 1 <merge-commit-sha>
git push origin main
#    b) Vercel dashboard rollback (instant, no code change):
#       Vercel → Deployments → find last good deployment → Redeploy
```

## 9. Local vs Production Differences (Lessons Learned)

During development, the app runs in a very different environment compared to production. Understanding these differences is critical to both successful deployment and future project planning.

### Why it Worked Locally but Broke in Production

**Local Development**
- Vite dev server runs continuously with a single process
- Local backend (if used) keeps persistent database connections
- Routing issues are masked by Vite proxy behavior
- Google auth only checks `http://localhost:5173` origin
- Low concurrency and predictable environment

**Production (Serverless on Vercel)**
- API runs as **serverless functions** — stateless and short-lived
- Each function invocation may open a new database connection
- Requires connection pooling (Supabase pooler) to prevent exhaustion
- Vercel routing must be explicitly configured (no SPA fallback swallowing `/api`)
- OAuth provider (Google) enforces exact origin matching

### Core Architectural Differences

| Aspect | Local | Production |
|--------|---------------------------|-------------------------------|
| Process Model | Long-running server | Stateless serverless functions |
| Database Connection | Persistent | Pooler required (Supabase) |
| Routing Behavior | Vite dev proxy hides issues | Must explicitly support serverless API |
| OAuth Hostnames | Localhost | Production and authorized origins |
| Concurrency | Low | Potentially high |

### Key Deployment Lesson

> Local success does **not** guarantee production stability.

Real deployment environments expose differences that local dev simply doesn’t. Treat deployment readiness as a first-class concern early in the project lifecycle:
- Understand build-time vs runtime environment variables
- Configure database connection pooling for serverless
- Know how your host (e.g., Vercel) handles routing and dynamic API routes
- Register exact production origins with OAuth providers

---

## Bonus: Potential “Deployment Guard” Tool Idea

As part of your long-term learning and project infrastructure, consider building a **Deployment Guard** tool. This could be:

**A CLI or AI assistant that:**
- Scans your repo structure (Vite, serverless API, DB layer)
- Detects missing deployment configurations
- Warns about:
  - missing health endpoints,
  - missing pooler DB connection strings,
  - incomplete OAuth origin settings,
  - SPA routing issues swallowing API routes,
  - unverified environment variable usage patterns
- Generates a tailored deployment readiness report
- Outputs a deployment checklist automatically

This idea can grow into a valuable tooling project that drastically reduces deployment friction on future apps.

---