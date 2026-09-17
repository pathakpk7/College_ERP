# 🚀 College ERP System - Complete Deployment Guide

This guide covers the two most popular ways to deploy your **FastAPI Backend**, **React Frontend**, and **Neon PostgreSQL Database**.

---

## 🌟 Method 1: Free Cloud Deployment (Recommended - Easiest & Fast)

- **Backend**: [Render.com](https://render.com) (or [Railway.app](https://railway.app))
- **Frontend**: [Vercel.com](https://vercel.com) (or [Netlify.com](https://netlify.com))
- **Database**: [Neon.tech](https://neon.tech) (PostgreSQL - Already connected!)

---

### Step 1: Push Your Code to GitHub

1. Initialize Git in the project root (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Complete College ERP with Auth, Faculty, Timetable, and Production Configs"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy the Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `college-erp-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Add **Environment Variables** under the **Environment** tab:
   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | Your Neon connection string (e.g. `postgresql://...`) |
   | `SECRET_KEY` | Any random 32+ character string |
   | `BACKEND_CORS_ORIGINS` | `*` (or your frontend Vercel URL) |
5. Click **Create Web Service**.
6. Once deployed, copy your live backend URL (e.g., `https://college-erp-backend.onrender.com`).

---

### Step 3: Deploy the Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
2. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://college-erp-backend.onrender.com/api/v1` *(replace with your Render backend URL)* |
4. Click **Deploy**.
5. Your frontend is now live with SPA routing (`vercel.json` ensures zero 404s on page refresh)!

---

## 🐳 Method 2: Docker / VPS Deployment (DigitalOcean, AWS, Linode, Hostinger)

If you have a Linux VPS (Ubuntu/Debian) with Docker and Docker Compose installed:

1. Clone your repository onto your server:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```
2. Create `.env` in the root:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
   SECRET_KEY="supersecretproductionkey32chars"
   ```
3. Start the application with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. Your application is running on:
   - **Frontend**: Port `80` (accessible via `http://<your-server-ip>`)
   - **Backend API**: Port `8000` (accessible via `http://<your-server-ip>:8000/api/v1`)

---

## 📋 Default Login Accounts For Verification

### 🛡️ Administration (Password: `admin123`)
- **Principal & Director**: `principal` / `sanjay.srivastava` / `EMP001`
- **Dean Academic**: `abhishek.malviya` / `dean.academic` / `EMP002`
- **Dean Student Welfare (DSW)**: `manas.pandey` / `dsw` / `EMP003`
- **Dean Corporate & Placements**: `divya.bartaria` / `dean.corporate` / `EMP004`

### 👨‍🏫 HODs & Faculty (Password: `faculty123`)
- **HOD CSE**: `prafull.pandey` / `EMP010`
- **HOD IT**: `rohit.kumar` / `EMP011`
- **HOD Civil**: `man.singh` / `EMP012`
- **HOD Mech**: `rehan.haider` / `EMP013`
- **HOD EC**: `surya.prakash` / `EMP014`
- **Faculty**: `arjun.singh` (`EMP020`), `shruti.sharma` (`EMP023`), `sonali.kumari` (`EMP024`), etc.

### 🎓 Students
- Can log in with their Roll Number (e.g. `220101001` to `220101060`, `230101001`, `240101001`, `250101001`) or permanent College ID (`UIT...`), or email.
