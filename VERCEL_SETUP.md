# Production login setup — do these once

You need to set these in your own accounts (Vercel, Google Cloud, backend). No one else can do it for you.

---

## 1. Push the latest code

```bash
cd "/Users/pursuit/Desktop/L2 PROJECTS/iCloud-Notes-Clone"
git push origin main
```

---

## 2. Vercel (frontend)

1. Go to [vercel.com](https://vercel.com) → your **iCloud Notes** project.
2. **Settings** → **Environment Variables**.
3. Add these (replace the placeholders with your real values):

| Name | Value | Environment |
|------|--------|-------------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL` (e.g. `https://xxx.railway.app`) — **no** `/api` at the end | Production (and Preview if you want) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Web client ID (e.g. `123456-xxx.apps.googleusercontent.com`) | Production (and Preview if you want) |

4. Save, then **Deployments** → **Redeploy** the latest deployment so it uses the new variables.

---

## 3. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized JavaScript origins**, add:
   - `https://icloud-notesclone.vercel.app`
4. Save.

---

## 4. Backend (Railway / Render / etc.)

On the service where your backend runs, set:

- `JWT_SECRET` — long random string (e.g. 32+ characters).
- `GOOGLE_CLIENT_ID` — **same** value as `VITE_GOOGLE_CLIENT_ID` in Vercel.
- `DATABASE_URL` — your production Postgres connection string (if not already set).

---

## 5. Test

Open **https://icloud-notesclone.vercel.app**, click **Sign In**, complete Google sign-in. You should stay in the app and see your notes.

If you still get sent back to the login page, open DevTools → **Network**, sign in again, and check which request returns **401**; that tells you what’s misconfigured (usually wrong `VITE_API_URL` or backend env).
