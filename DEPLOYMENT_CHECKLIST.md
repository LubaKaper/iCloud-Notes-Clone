# Deployment Checklist

## 1) Vercel environment variables

Set these in Vercel project settings.

### Required when deploying frontend + root `api/*` (single Vercel project)

- `VITE_GOOGLE_CLIENT_ID` = your Google OAuth Web Client ID
- `GOOGLE_CLIENT_ID` = same value as `VITE_GOOGLE_CLIENT_ID`
- `JWT_SECRET` = random 32+ char secret
- `DATABASE_URL` = Postgres connection string
- `NODE_ENV` = `production`

### Required when Vercel hosts frontend only (external backend)

- `VITE_GOOGLE_CLIENT_ID` = your Google OAuth Web Client ID
- `VITE_API_URL` = backend base URL (example: `https://your-backend.onrender.com`)
  - Important: **do not include `/api`**

### Optional

- `BACKEND_URL` = backend base URL (only if using `frontend/api/[[...path]].ts` proxy)

## 2) Supabase `DATABASE_URL` guidance

Use the pooled connection string from Supabase and include SSL mode.

Example format:

`postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require`

Notes:

- Use the pooler endpoint for serverless workloads.
- Keep `NODE_ENV=production` so runtime uses production SSL config.
- Rotate the DB password if it was ever committed or shared.

## 3) Google Cloud Console OAuth configuration

In Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client ID (Web application):

Authorized JavaScript origins must include:

- `http://localhost:5173`
- `https://<your-vercel-domain>.vercel.app`
- `https://<your-custom-domain>` (if applicable)

This app uses Google Identity ID token flow in frontend and backend token verification; no OAuth callback URL is required for this current flow.

## 4) Verification checklist

Run these checks after deployment.

- [ ] Open app URL and click **Sign In**.
  - Expected: Google prompt appears.
- [ ] Complete sign-in and inspect `POST /api/auth/google`.
  - Expected: `200` with `{ token, user }`.
- [ ] Inspect first authenticated data request (`GET /api/notes`).
  - Expected: `200` with notes list (or `[]` for new user).
- [ ] Unauthenticated request to notes endpoint returns auth error.
  - Expected: `401` for `GET /api/notes` without bearer token.
- [ ] `GET /api/auth/google` (wrong method) is rejected.
  - Expected: `405`.
- [ ] Network paths do not contain `/api/api/...`.
  - Expected: all API calls use `/api/...` once.

## 5) Quick curl checks

```bash
curl -i https://<your-domain>/api/auth/google
# expected: 405 Method not allowed (GET)

curl -i https://<your-domain>/api/notes
# expected: 401 Unauthorized (without token)
```
