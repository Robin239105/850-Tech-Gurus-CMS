# 850 Tech Gurus CMS — Vercel Deployment Guide

Complete step-by-step guide to deploy this CMS to Vercel with a Postgres database.

---

## Prerequisites

- Node.js 18+ installed locally
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free — sign up with GitHub)
- An authenticator app on your phone (Google Authenticator, Authy, etc.)

---

## Step 1: Prepare Your Code for GitHub

Open Terminal and run these commands from the project root:

```bash
cd "/Volumes/Mac Main/850 Tech Gurus CMS"

# Initialise git (skip if already done)
git init

# Make sure .env.local is never committed
echo ".env.local" >> .gitignore

# Stage and commit everything
git add .
git commit -m "production ready"
```

---

## Step 2: Push to GitHub

1. Go to [github.com/new](https://github.com/new)
2. Create a new **private** repository named `850-tech-gurus-cms`
3. Do NOT initialise with README (your code already exists)
4. Copy the two commands GitHub shows under **"push an existing repository"**, e.g.:

```bash
git remote add origin https://github.com/YOUR_USERNAME/850-tech-gurus-cms.git
git branch -M main
git push -u origin main
```

---

## Step 3: Import Project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Continue with GitHub"** and authorise Vercel
3. Find `850-tech-gurus-cms` in the list → click **Import**
4. Framework preset will auto-detect as **Next.js** ✓
5. Leave all build settings as default
6. **Do NOT click Deploy yet** — set up the database first (Step 4)

---

## Step 4: Add a Postgres Database

1. In the Vercel dashboard go to your project → **Storage** tab
2. Click **"Create Database"**
3. Choose **Postgres** (powered by Neon) → click **Continue**
4. Name it `cms-db` → select the region closest to you → **Create**
5. Click **"Connect"** to link it to your project
6. Vercel automatically adds these env vars to your project:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

---

## Step 5: Generate Your Secrets Locally

Run each command in your terminal and **copy the output** — you'll need it in Step 6.

### A) Hash your admin password
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('YOUR_STRONG_PASSWORD_HERE', 12).then(h => console.log(h));
"
```
> Replace `YOUR_STRONG_PASSWORD_HERE` with a real password (min 12 chars). Save this password somewhere safe.

### B) Generate your TOTP secret (for 2FA)
```bash
node -e "
const { generateSecret } = require('otplib');
console.log(generateSecret());
"
```
> This outputs something like `JBSWY3DPEHPK3PXP`. Save it — you'll scan it into your authenticator app.

### C) Generate your auth secret (session signing)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 6: Add Environment Variables to Vercel

1. In Vercel → your project → **Settings → Environment Variables**
2. Add each variable below (select **Production**, **Preview**, and **Development** for all):

| Variable | Value |
|---|---|
| `ADMIN_EMAIL` | Your admin email e.g. `admin@850techgurus.com` |
| `ADMIN_PASSWORD_HASH` | The bcrypt hash from Step 5A |
| `ADMIN_TOTP_SECRET` | The secret from Step 5B |
| `AUTH_SECRET` | The random string from Step 5C |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_APP_NAME` | `850 Tech Gurus CMS` |

3. Click **Save** after each one

---

## Step 7: Set Up 2FA on Your Phone

1. Open **Google Authenticator** (or Authy) on your phone
2. Tap **+** → **Enter a setup key**
3. Account name: `850 Tech Gurus CMS`
4. Key: paste the `ADMIN_TOTP_SECRET` value from Step 5B
5. Tap **Add** — a 6-digit code will start rotating every 30 seconds

> **Keep the TOTP secret backed up somewhere safe.** If you lose it you cannot log in.

---

## Step 8: Deploy

1. Go back to Vercel → your project → **Deployments** tab
2. Click **"Redeploy"** (or if you haven't deployed yet, go to the project overview and click **Deploy**)
3. Wait ~2 minutes for the build to complete
4. Click **"Visit"** to open your live site

Your site will be live at: `https://your-project-name.vercel.app`

---

## Step 9: Test the Login

1. Go to `https://your-project-name.vercel.app/admin/login`
2. Enter your `ADMIN_EMAIL` and the password you used in Step 5A
3. When prompted for 2FA, open your authenticator app and enter the 6-digit code
4. You should land on the admin dashboard ✓

---

## Step 10: Add a Custom Domain (Optional)

1. Vercel → your project → **Settings → Domains**
2. Click **"Add"** → type your domain e.g. `cms.850techgurus.com`
3. Vercel shows you DNS records to add at your domain registrar (Cloudflare, GoDaddy, etc.)
4. Add the records → wait up to 24hrs for DNS propagation
5. Vercel auto-provisions an SSL certificate ✓

---

## Redeploying After Code Changes

Every time you push to GitHub, Vercel **automatically redeploys**:

```bash
git add .
git commit -m "describe your change"
git push
```

That's it — Vercel picks it up within seconds.

---

## Troubleshooting

### "Invalid credentials" on login
- Double-check `ADMIN_EMAIL` matches exactly what you're typing
- Regenerate the password hash in Step 5A and update the env var in Vercel
- Redeploy after changing env vars

### "Server is not configured" error
- An env var is missing — check all vars in **Settings → Environment Variables**
- Make sure you clicked Save on each one
- Redeploy after adding missing vars

### 2FA code rejected
- Make sure your phone's time is correct (TOTP is time-based)
- Confirm the `ADMIN_TOTP_SECRET` in Vercel matches what you scanned into your app
- The code changes every 30s — try waiting for the next one

### Build fails
```bash
# Test the build locally first
npm run build
```
Fix any errors locally, push again.

---

## Database Connection (When You're Ready)

Once you want to connect real data, install the Vercel Postgres client:

```bash
npm install @vercel/postgres
git add . && git commit -m "add vercel postgres" && git push
```

Then in your API routes:

```ts
import { sql } from '@vercel/postgres'

// Example: fetch all clients
const { rows } = await sql`SELECT * FROM clients ORDER BY created_at DESC`
```

Pull the database env vars to your local machine for development:

```bash
npm install -g vercel
vercel login
vercel link        # links this folder to your Vercel project
vercel env pull    # downloads all env vars into .env.local
```

---

## Summary Checklist

- [ ] Code pushed to GitHub (private repo)
- [ ] Project imported into Vercel
- [ ] Postgres database created and connected
- [ ] All 6 environment variables added in Vercel
- [ ] 2FA set up in authenticator app
- [ ] Deployed and login tested
- [ ] Custom domain added (optional)
