# O'Brien Energy – Industrial Decision Intelligence Platform

Full local full-stack capstone MVP for O'Brien Energy, built from the uploaded prototype plus the requirements described in the uploaded capstone PDFs.

## What was added

The uploaded zip already contained a strong React frontend prototype, but it did **not** include the backend, CSV datasets, SQLite persistence layer, or local API described in the project guidance. The files in this project add those missing parts:

- **Frontend:** React + Vite + Tailwind + Recharts + React Router
- **Backend:** FastAPI + SQLite + pandas
- **Primary app dataset:** synthetic O’Brien-style thermal-asset dataset aligned to the uploaded report guidance
- **AI stack for the MVP:**
  - production recommendation flow = **rules-based explainable engine**
  - offline benchmark models = **Random Forest**, **XGBoost**, **Isolation Forest**
- **Human-in-the-loop workflow:** signup → admin approval → role assignment → review decision → audit log

## Role access

These route restrictions match the project requirements:

- **Admin only:** Dashboard, Fleet Assets, Admin Panel
- **All authenticated users:** Recommendations, Compliance & Audit, Reports, Transition Comparison, Settings

## Dataset included

The project files said the main app should be driven by a synthetic dataset if real client data is unavailable. This project includes:

- `server/data/users.csv`
- `server/data/sites.csv`
- `server/data/assets.csv`
- `server/data/maintenance_history.csv`
- `server/data/condition_data.csv`
- `server/data/alarm_faults.csv`
- `server/data/operator_observations.csv`
- `server/data/recommendations.csv`
- `server/data/audit_log.csv`
- `server/data/energy_emissions.csv`
- `server/data/training_compliance.csv`
- `server/data/transition_scenarios.csv`
- `server/data/compliance_standards.csv`

Generated size:

- 36 assets
- 4 sites
- 7 user accounts
- 432 maintenance-history rows
- 288 condition-data rows
- 74 alarm/fault rows

## Demo accounts

Use these after starting the backend:

- **Admin**: `admin@obrienenergy.com.au` / `Admin123!`
- **Engineer / Operator**: `ali.ahmad@obrienenergy.com.au` / `User123!`
- **Maintenance Planner**: `planner@obrienenergy.com.au` / `User123!`
- **Executive**: `executive@obrienenergy.com.au` / `User123!`
- **Regulator / Auditor**: `auditor@obrienenergy.com.au` / `User123!`
- **Sustainability Lead**: `transition@obrienenergy.com.au` / `User123!`

There is also one pending user in the seed data so the Admin Panel can demonstrate approval flow.

## Project structure

```text
obrien-idi-fullstack/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── routes/
│   ├── package.json
│   └── .env.example
├── server/
│   ├── app/
│   │   ├── engine.py
│   │   ├── repository.py
│   │   ├── modeling.py
│   │   └── main.py
│   ├── data/
│   ├── models/
│   ├── scripts/
│   │   └── generate_data.py
│   ├── requirements.txt
│   └── run.py
└── README.md
```

## Run locally in VS Code

### 1) Open the folder

Open the root folder `obrien-idi-fullstack` in VS Code.

### 2) Start the backend

Open a terminal in `server/`.

#### Windows PowerShell

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

#### macOS / Linux

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend URL:

```text
http://127.0.0.1:8000
```

Main API health check:

```text
http://127.0.0.1:8000/api/health
```

### 3) Start the frontend

Open a second terminal in `client/`.

```bash
cd client
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

If you want to change the backend URL, copy `.env.example` to `.env` and update `VITE_API_BASE_URL`.

## Build for production

### Frontend

```bash
cd client
npm run build
```

### Backend

Use the same FastAPI server, or run with uvicorn directly:

```bash
cd server
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## How the AI logic works

### Core in-app decision engine

The uploaded PDFs repeatedly positioned the MVP as **read-only, advisory-only, explainable, and human-reviewed**. Because of that, the main app uses a **rules-based engine** as the production recommendation layer.

The engine calculates:

- health score
- risk level
- recommended action
- confidence score
- days-to-failure estimate
- anomaly flags
- explainability factors
- strategy recommendation

### Benchmark models included

The project guidance also discussed using multiple AI models for later predictive work. To support that, the backend includes an offline benchmarking module with:

- **Random Forest** – risk-class prediction benchmark
- **XGBoost** – advanced tabular benchmark
- **Isolation Forest** – anomaly benchmark

These are deliberately treated as **benchmark / experimentation models**, while the core app still uses explainable rules-first recommendations.

## Main pages

- **Login / Sign Up** – branded access request and sign-in flow
- **Dashboard** – admin-only fleet overview, KPIs, charts, recommendation and explainability
- **Fleet Assets** – admin-only asset-level inspection and review
- **Admin Panel** – approvals, role assignment, user activation/deactivation
- **Recommendations** – role-aware recommendation view
- **Compliance & Audit** – compliance, standards, audit visibility
- **Reports** – export-style summaries and charts
- **Transition Comparison** – compare strategy scenarios and impact
- **Settings** – user preferences and password update screen

## Important note about the logo

The uploaded bundle did not include a standalone company logo asset. A local branded SVG was added so the app can run immediately. If you have the official logo file from your Figma or company assets, replace:

```text
client/src/assets/obrien-logo.svg
```

with the official one and keep the same filename.

## Regenerate the synthetic data

If you want to regenerate the CSV and frontend seed data:

```bash
cd server
python scripts/generate_data.py
```

That script updates:

- backend CSV files in `server/data/`
- frontend seed module in `client/src/data/mockData.generated.js`

## What was kept unchanged

The uploaded React prototype already had the page structure and most of the UI your capstone required. To avoid changing the approved UI/UX direction, the app structure, routing, card layout, sidebar flow, and page hierarchy were kept intact and extended rather than redesigned.
