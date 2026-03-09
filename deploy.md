# Deploying Virtue Website to Railway

This guide walks you through deploying the Virtue website step by step. You have never deployed before, so every detail is covered. Read each step fully before doing it.

---

## How Does This Work? (Quick Explanation)

Your project has two parts:
- **Client** (React frontend) - what users see in the browser
- **Server** (Express backend) - the API that talks to the database

Locally, these run as two separate processes. But in production, the server does double duty: it runs the API **and** serves the built React files. So on Railway, you only need **one service** (not two). When you run `npm run build`, the React app gets compiled into static files in `client/dist/`. The Express server then serves those files to visitors.

Railway also gives you a **PostgreSQL database** in the cloud, so you don't need your other PC.

---

## BEFORE YOU START - Security Checklist

**Your passwords and secrets must NEVER end up on GitHub.** Here's how to make sure:

### 1. Verify .env is gitignored

Your `.gitignore` already blocks `.env` files. Double-check by running:

```bash
git status
```

If you see any `.env` file listed there (not `.env.example`), STOP and do NOT commit. Remove it from tracking first:

```bash
git rm --cached server/.env
git rm --cached client/.env
```

### 2. Check what's actually in your repo

Run this to make sure no secrets are already committed:

```bash
git log --all --full-history -- "*.env"
git log --all --full-history -- "*/.env"
```

If either command shows results, your `.env` was committed at some point. Even if you deleted it later, it's still in your git history. In that case: **change all your passwords** after deploying (especially your ADMIN_PASSWORD). The old password would still be visible in the git history.

### 3. What files contain secrets

These files have secrets and must **NEVER** be committed:
- `server/.env` - contains ADMIN_PASSWORD, DATABASE_URL

These files are safe to commit (they are templates with no real values):
- `server/.env.example`
- `client/.env.example`

---

## Step 1: Push Your Code to GitHub

If you don't have a GitHub repo yet:

1. Go to github.com and create a **new repository**
2. Make it **private** (your code, your choice - but private is safer)
3. Do NOT check "Add a README" or ".gitignore" (you already have these)
4. GitHub will show you commands. Run these in your project folder:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

If you already have a GitHub repo, just make sure everything is committed and pushed:

```bash
git add -A
git status
```

**STOP AND CHECK:** Look at the `git status` output. Make sure no `.env` file is listed. If it is, go back to the security checklist above. If it's clean, continue:

```bash
git commit -m "prepare for deployment"
git push
```

---

## Step 2: Create a Railway Account

1. Go to **railway.app**
2. Click **"Login"** in the top right
3. Sign up with your **GitHub account** (this makes connecting your repo easier)
4. You may need to verify your email

---

## Step 3: Create a New Project on Railway

1. In the Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If Railway asks for GitHub permissions, grant them
4. Find and select your repository from the list
5. Railway will create a service and start trying to deploy - **it will fail** because we haven't set up the database and environment variables yet. That's fine, don't worry.

---

## Step 4: Add a PostgreSQL Database

1. Inside your Railway project, click the **"+ New"** button (top right of the project canvas)
2. Select **"Database"**
3. Select **"Add PostgreSQL"**
4. Wait a few seconds for it to provision (you'll see it appear on the canvas)

---

## Step 5: Link the Database to Your Service

1. Click on your **web service** (the one connected to your GitHub repo, NOT the database)
2. Go to the **"Variables"** tab
3. Click **"Add Reference Variable"**
4. You'll see your PostgreSQL database listed - select `DATABASE_URL`
5. Click **"Add"**

This makes Railway automatically inject the database connection string into your server. You don't need to copy any database URLs manually.

---

## Step 6: Set Environment Variables

Still in the **"Variables"** tab of your web service, click **"New Variable"** for each of these:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Tells the server to serve the React build |
| `PORT` | `5000` | The port your server listens on |
| `ADMIN_PASSWORD` | *(pick a strong password)* | This is the password for your /admin page. Use something long with letters, numbers, and symbols. **Do NOT use the same password as your other accounts.** |
| `CLIENT_URL` | *(leave empty for now)* | We'll fill this in after Step 9 when we get the domain |

**About ADMIN_PASSWORD:** This is the single password that protects your /admin dashboard. Anyone who knows it can edit your roster, change videos, etc. Pick something strong like `Virt!ue2024$Sec` (but not that exact one obviously).

---

## Step 7: Configure Build and Start Commands

1. Click on your web service
2. Go to the **"Settings"** tab
3. Scroll down to **"Build Command"** and set it to:

```
npm run install:all && npm run build
```

4. Set the **"Start Command"** to:

```
npm start
```

5. Make sure **"Root Directory"** is empty (or `/`)

**What these do:**
- `npm run install:all` installs dependencies in root, server, and client folders
- `npm run build` compiles the React frontend into static files
- `npm start` runs the Express server (which serves the API + the compiled React files)

---

## Step 8: Set Up the Database (Migrate Your Data From Your Other PC)

You already have a database with real data on your other PC. Here's how to get that data into Railway.

### Option A: Export from your PC, import into Railway (recommended)

**On your other PC**, open a terminal and run this to export your entire database:

```bash
pg_dump -U YOUR_DB_USERNAME -d YOUR_DB_NAME --no-owner --no-acl > virtue_backup.sql
```

It will ask for your local database password. This creates a file `virtue_backup.sql` with all your tables AND data.

**Now import it into Railway:**

1. Click on your **PostgreSQL database** on the Railway project canvas
2. Go to the **"Connect"** tab
3. You'll see connection details (host, port, username, password, database name). Copy the **connection string** (looks like `postgresql://postgres:xxxx@xxxx.railway.app:5432/railway`)
4. On your other PC, run:

```bash
psql "YOUR_RAILWAY_CONNECTION_STRING" < virtue_backup.sql
```

Replace `YOUR_RAILWAY_CONNECTION_STRING` with the connection string from Railway. This uploads all your tables and data directly.

5. If you get errors about tables already existing, that's fine - the `IF NOT EXISTS` clauses handle it.

**Important:** Make sure the `settings` table gets created. If your local database didn't have it, go to Railway's database **"Data"** tab, click **"Query"**, and run:

```sql
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option B: Create empty tables and re-add data through /admin

If you don't want to deal with pg_dump, you can create the tables fresh and add everything manually through the admin panel.

1. Click on your **PostgreSQL database** on the project canvas
2. Go to the **"Data"** tab
3. Click **"Query"** (opens an SQL editor)
4. Copy and paste this entire SQL block and click **"Run"**:

```sql
CREATE TABLE IF NOT EXISTS players_editors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'editor')),
    recent_vid VARCHAR(500),
    valhalla_clips INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    valhalla_clips INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Then go to `https://your-domain.up.railway.app/admin` and add your leads, players, and editors manually.

---

## Step 9: Generate a Domain and Set CLIENT_URL

1. Click on your **web service**
2. Go to the **"Settings"** tab
3. Scroll down to **"Networking"** / **"Domains"**
4. Click **"Generate Domain"**
5. Railway gives you a URL like `your-app-name-production.up.railway.app`
6. **Copy that full URL** (including the `https://`)

Now go back and set the CLIENT_URL variable:

1. Go to the **"Variables"** tab
2. Click on `CLIENT_URL` (or add it if you left it empty before)
3. Set the value to your Railway domain, e.g. `https://your-app-name-production.up.railway.app`
4. **Important:** No trailing slash! Just `https://your-domain.up.railway.app`

This tells your server which domain is allowed to make API requests (CORS). Without it, your frontend can't talk to your backend.

---

## Step 10: Trigger a Redeploy

After setting all variables, Railway should automatically redeploy. If it doesn't:

1. Click on your web service
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment

Wait for the build to complete (usually 1-3 minutes). Watch the build logs - if everything worked, you'll see:
```
Server running on port 5000
Environment: production
```

---

## Step 11: Add Your Data

Your site is now live but the roster is empty. Go to:

```
https://your-domain.up.railway.app/admin
```

Log in with the ADMIN_PASSWORD you set in Step 6. From here you can add all your leads, players, and editors through the admin panel.

---

## Troubleshooting

### Build fails with "npm run build" error
- Check the build logs in Railway (click on the deployment)
- Usually means a dependency issue - make sure `npm run install:all` is part of the build command

### Site loads but shows blank page
- Make sure `NODE_ENV` is set to `production` (this is what makes the server serve the React files)
- Check that the build command includes `npm run build`

### "CORS error" in browser console
- Your `CLIENT_URL` doesn't match your actual Railway domain
- Make sure it's the exact URL with `https://`, no trailing slash
- Example: `https://virtue-production.up.railway.app`

### Admin login doesn't work
- Check that `ADMIN_PASSWORD` is set in Railway variables
- Password is case-sensitive
- If you changed it, redeploy or restart the service

### Database connection error
- Make sure you linked the PostgreSQL database (Step 5)
- Check that `DATABASE_URL` appears in your variables tab as a reference variable
- Make sure you ran the SQL in Step 8

### "relation 'settings' does not exist"
- You forgot to run the SQL from Step 8, or you only ran part of it
- Go to the database Data tab and run the full SQL again

---

## Updating Your Site After Deployment

Whenever you make changes locally:

```bash
git add -A
git status          # <-- always check this, make sure no .env files
git commit -m "your description of changes"
git push
```

Railway automatically detects the push and redeploys. You don't need to do anything else.

---

## Environment Variables Reference

| Variable | Where to Set | Value |
|----------|-------------|-------|
| `NODE_ENV` | Railway Variables | `production` |
| `PORT` | Railway Variables | `5000` |
| `DATABASE_URL` | Railway Reference Variable (auto) | Set automatically when you link the database |
| `ADMIN_PASSWORD` | Railway Variables | Your secret admin password |
| `CLIENT_URL` | Railway Variables | Your Railway domain URL (e.g. `https://xyz.up.railway.app`) |

**None of these go in your code or on GitHub.** They only exist in Railway's dashboard.

---

## Cost

Railway has a free trial with $5 of credits. After that it's usage-based (usually a few dollars per month for a small site like this). Keep an eye on your usage in the Railway dashboard.
