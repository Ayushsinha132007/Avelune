# AVELUNE Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide walks you through deploying the **AVELUNE Luxury E-Commerce** platform to production:
- **Backend (Django REST Framework)** on **Render**
- **Frontend (React + Vite + TypeScript)** on **Vercel**

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        VERCEL (Frontend)        │           │         RENDER (Backend)        │
│    https://avelune.vercel.app   │  ──────>  │   https://avelune.onrender.com  │
│  React + Vite + Tailwind + PWA  │   REST    │   Django + Gunicorn + WhiteNoise│
└─────────────────────────────────┘           └─────────────────────────────────┘
                                                               │
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │   PostgreSQL / SQLite Database  │
                                              └─────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Render

### Step 1: Sign up & Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** in the top right and select **Web Service**.
3. Select your repository: **`Ayushsinha132007/Avelune`**.

### Step 2: Configure Service Details
Fill in the following fields:
* **Name**: `avelune-backend` (or any name you choose)
* **Region**: Choose the closest region (e.g., `Singapore` or `Frankfurt`)
* **Branch**: `main`
* **Root Directory**: `backend` *(Important: set this to `backend`)*
* **Runtime**: `Python 3`
* **Build Command**: `./build.sh`
* **Start Command**: `gunicorn config.wsgi:application`
* **Plan**: `Free`

### Step 3: Configure Environment Variables
Under the **Environment Variables** section on Render, add the following key-value pairs:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Stable Python runtime |
| `DEBUG` | `False` | Production security |
| `DJANGO_SECRET_KEY` | *(Click "Generate" or paste a random secret key)* | Django cryptographic security |
| `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Allows Render domain |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://your-frontend.vercel.app` *(update with your Vercel URL once created)* | Browser security |
| `CSRF_TRUSTED_ORIGINS` | `https://*.vercel.app,https://*.onrender.com` | CSRF protection for HTTPS |
| `RAZORPAY_KEY_ID` | `rzp_test_U1K7lLYugYIst3` | Razorpay payment API Key |
| `RAZORPAY_KEY_SECRET` | `VMw935Pec80FsyXjfjpX3i6B` | Razorpay Key Secret |
| `GEMINI_API_KEY` | *(Your Gemini API key, optional for AI Assistant)* | AI Shopping Assistant |
| `EMAIL_HOST_USER` | `ayushkumar53467@gmail.com` | Gmail SMTP sender |
| `EMAIL_HOST_PASSWORD` | *(Your 16-character Google App Password)* | Secure Gmail SMTP auth |

> **Note on Database**:
> - By default, Django uses SQLite (`db.sqlite3`).
> - For a persistent PostgreSQL database on Render, click **New +** -> **PostgreSQL**, create a database, copy the **Internal Database URL**, and add it as `DATABASE_URL` in your Web Service environment variables. Django will automatically connect to it!

### Step 4: Deploy & Test
1. Click **Create Web Service**.
2. Render will run `./build.sh` (installs packages, runs migrations, and collects static files) and start Gunicorn.
3. Once live, open `https://<your-render-name>.onrender.com/health/` in your browser. You should see:
   ```json
   { "status": "healthy", "service": "avelune-django-backend", "database": "sqlite3" }
   ```
4. Copy your backend URL: e.g. `https://avelune-backend.onrender.com`.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your repository: **`Ayushsinha132007/Avelune`**.

### Step 2: Configure Project Settings
In the configuration screen:
* **Project Name**: `avelune-storefront` (or `avelune`)
* **Framework Preset**: `Vite`
* **Root Directory**: Click **Edit** and select **`frontend`** *(Crucial step)*
* **Build Command**: `npm run build` (auto-detected)
* **Output Directory**: `dist` (auto-detected)

### Step 3: Add Environment Variable
Under **Environment Variables**:
* **Key**: `VITE_API_BASE_URL`
* **Value**: `https://<your-render-name>.onrender.com/api` *(replace with your actual Render URL)*

### Step 4: Deploy
1. Click **Deploy**.
2. Vercel will install dependencies, build the React app, and deploy it to a `.vercel.app` URL (e.g. `https://avelune-storefront.vercel.app`).
3. Single Page Application (SPA) routing is pre-configured via `vercel.json` so pages like `/admin`, `/collections`, and `/cart` load cleanly without 404 errors.

---

## Part 3: Connect Frontend URL to Backend CORS

1. Copy your Vercel URL (e.g., `https://avelune-storefront.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com/) -> Select **`avelune-backend`** -> **Environment**.
3. Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL:
   ```
   http://localhost:5173,https://avelune-storefront.vercel.app
   ```
4. Click **Save Changes**. Render will automatically redeploy with the updated CORS configuration.

---

## Part 4: Accessing the Admin Suite in Production

1. Visit your live Vercel website (e.g., `https://avelune-storefront.vercel.app/login`).
2. Enter the designated Atelier Director email:
   ```
   ayushsinha53467@gmail.com
   ```
3. The system will detect your Director account with **Zero OTP Required**.
4. Click **"Direct Sign In to Admin Suite"**.
5. You will enter `https://avelune-storefront.vercel.app/admin` with full access to:
   - Live revenue & metrics
   - Client dossiers & purchase histories
   - Order fulfillment & dispatch statuses
   - Catalogue product additions and management
