# Deployment Guide

This guide covers deploying the Virtue website to a live URL.

## Option 1: Railway (Recommended - Easiest)

Railway offers free tier hosting with PostgreSQL included.

### Step 1: Prepare Your Code

1. Make sure all your code is committed to GitHub
2. Push to a GitHub repository

### Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account

### Step 3: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Wait for it to provision

### Step 5: Configure Environment Variables

Click on your web service and go to "Variables" tab. Add:

```
NODE_ENV=production
PORT=5000
ADMIN_PASSWORD=YourSecurePasswordHere
CLIENT_URL=https://your-app-name.up.railway.app
```

For the database, Railway auto-injects `DATABASE_URL` when you link the PostgreSQL service.

### Step 6: Link Database to Service

1. Click on your web service
2. Go to "Variables"
3. Click "Add Reference"
4. Select your PostgreSQL database
5. This adds the `DATABASE_URL` automatically

### Step 7: Configure Build Settings

In your service settings, set:

- **Build Command:** `npm run install:all && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `/` (leave empty)

### Step 8: Set Up Database Tables

1. Click on your PostgreSQL database
2. Go to "Data" tab
3. Open the SQL query tool
4. Copy and paste the contents of `database_setup.txt`
5. Run the query

### Step 9: Generate Domain

1. Click on your web service
2. Go to "Settings"
3. Under "Domains", click "Generate Domain"
4. Your site is now live!

---

## Option 2: Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Choose a name (e.g., `virtue-db`)
3. Select free tier
4. Click "Create Database"
5. Copy the "External Database URL"

### Step 3: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** virtue-website
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`

### Step 4: Add Environment Variables

In the web service settings, add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<paste your PostgreSQL external URL here>
ADMIN_PASSWORD=YourSecurePasswordHere
CLIENT_URL=https://virtue-website.onrender.com
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Run the database setup SQL via Render's PostgreSQL dashboard

---

## Option 3: VPS (DigitalOcean, Hetzner, etc.)

For more control, deploy to a VPS.

### Step 1: Set Up Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

### Step 2: Set Up PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE virtue;
CREATE USER virtueuser WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE virtue TO virtueuser;
\q

# Connect and run setup
psql -U virtueuser -d virtue -f database_setup.txt
```

### Step 3: Clone and Build

```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/virtue-website.git
cd virtue-website

# Install dependencies
npm run install:all

# Build frontend
npm run build

# Create .env file
cat > server/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://virtueuser:your-password@localhost:5432/virtue
ADMIN_PASSWORD=YourSecurePasswordHere
CLIENT_URL=https://yourdomain.com
EOF
```

### Step 4: Configure Nginx

```bash
# Create nginx config
cat > /etc/nginx/sites-available/virtue << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/virtue /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: Start with PM2

```bash
cd /var/www/virtue-website
pm2 start npm --name "virtue" -- start
pm2 save
pm2 startup
```

### Step 6: Add SSL (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Quick Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `ADMIN_PASSWORD` | Password for /admin page | `YourSecurePassword123!` |
| `CLIENT_URL` | Your site's URL (for CORS) | `https://virtue.com` |

### Useful Commands

```bash
# Build frontend
npm run build

# Start production server
npm start

# View logs (if using PM2)
pm2 logs virtue

# Restart server (if using PM2)
pm2 restart virtue
```

### Updating the Site

```bash
# Pull latest changes
git pull

# Rebuild frontend
npm run build

# Restart server
pm2 restart virtue
```

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure database user has proper permissions

### CORS Errors
- Make sure `CLIENT_URL` matches your actual domain
- Include `https://` in the URL

### Admin Login Not Working
- Check `ADMIN_PASSWORD` environment variable is set
- Password is case-sensitive

### Blank Page / React Routes Not Working
- Ensure `NODE_ENV=production` is set
- Verify the build completed successfully
- Check that nginx (or your host) is configured for SPA routing
