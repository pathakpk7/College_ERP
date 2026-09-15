# College ERP System

A modern, full-stack, modular College ERP System built with **FastAPI** (Python), **React + Vite + Tailwind CSS**, and **PostgreSQL (Neon)**.

---

## 🚀 Features & Architecture

- **Backend**: FastAPI 0.110+, SQLAlchemy 2.x, Alembic migrations, Pydantic settings, JWT authentication.
- **Frontend**: React 18, Vite, Tailwind CSS 4.0, Lucide icons, React Router DOM, Axios.
- **Database**: PostgreSQL (Neon database integration ready).

---

## 📁 Monorepo Project Structure

```
ERP SYSTEM/
├── frontend/             # React + Vite client UI
│   ├── src/
│   │   ├── components/   # Layout, Common UI, Attendance modules
│   │   ├── pages/        # Dashboard, Login, Attendance, Fees, etc.
│   │   ├── services/     # Axios API service handlers
│   │   ├── context/      # Auth & Global state context
│   │   └── utils/        # Attendance calculators, date formatters
│   ├── package.json
│   └── vite.config.js
├── backend/              # FastAPI Python backend application
│   ├── app/
│   │   ├── api/          # RESTful route handlers
│   │   ├── core/         # Security, JWT, configuration settings
│   │   ├── db/           # Database sessions & engine setup
│   │   ├── models/       # SQLAlchemy 2.x ORM schemas
│   │   └── schemas/      # Pydantic validation schemas
│   ├── requirements.txt
│   └── .env.example
├── database/             # PostgreSQL schema, seed data, ER diagram specs
├── docs/                 # API documentation & system specs
└── TODO.md               # Master phase tracking document
```

---

## ⚙️ Quick Start Setup & Local Execution

### 1. Prerequisites
- Python 3.10+ installed
- Node.js v18+ and npm installed

### 2. Backend Setup & Launch
```bash
# Navigate to backend directory
cd backend

# Virtual environment (pre-created or manually set up)
python -m venv venv

# Activate Virtual Environment:
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Option A: From root directory D:\ERP SYSTEM
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000

# Option B: From inside the backend directory
cd backend
..\backend\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API interactive docs: `http://localhost:8000/docs`  
Health check endpoint: `http://localhost:8000/api/v1/health`

### 3. Frontend Setup & Launch
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Web Portal: `http://localhost:5173`

---

## 🧪 Testing Backend Health Check
Verify backend API health status:
```bash
curl http://localhost:8000/api/v1/health
```
Expected output:
```json
{
  "status": "healthy",
  "service": "College ERP API",
  "version": "1.0.0"
}
```
