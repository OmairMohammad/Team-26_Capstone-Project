# Team-26_Capstone_Project
Capstone project for Team 26: O’Brien Energy explainable maintenance decision-support MVP with React, FastAPI, and SQLite.

---

# Team Details

- Omair Mohammad	233025
- Abdul Mannan Mohammed	233562
- Ali Ahmad	231644
- Aqeel Ahmed	232933
- Hamza Murtuza	232755
- Ajay Kunwar	232391

---

# O'Brien Energy – Industrial Decision Intelligence MVP
This project is built for the final capstone project. It includes:

- **Frontend:** React + Vite + Tailwind + Recharts + React Router
- **Backend:** FastAPI + SQLite + pandas
- **Primary app dataset:** synthetic O’Brien-style thermal-asset dataset aligned to the uploaded report guidance
- **AI stack for the MVP:**
  - production recommendation flow = **rules-based explainable engine**
  - offline benchmark models = **Random Forest**, **XGBoost**, **Isolation Forest**
- **Human-in-the-loop workflow:** signup → admin approval → role assignment → review decision → audit log

---

## Role access
These route restrictions match the project requirements:

- **Admin only:** Dashboard, Fleet Assets, Admin Panel
- **All authenticated users:** Recommendations, Compliance & Audit, Reports, Transition Comparison, Settings

---

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

#### Generated size:
- 36 assets
- 4 sites
- 7 user accounts
- 432 maintenance-history rows
- 288 condition-data rows
- 74 alarm/fault rows

---

## Demo accounts
Use these after starting the backend:

- **Admin**: `admin@obrienenergy.com.au` / `Admin123!`
- **Engineer / Operator**: `ali.ahmad@obrienenergy.com.au` / `User123!`
- **Maintenance Planner**: `planner@obrienenergy.com.au` / `User123!`
- **Executive**: `executive@obrienenergy.com.au` / `User123!`
- **Regulator / Auditor**: `auditor@obrienenergy.com.au` / `User123!`
- **Sustainability Lead**: `transition@obrienenergy.com.au` / `User123!`

---

## Run locally in VS Code

### 1) Open the folder
Open the root folder `obrien-idi-fullstack_` in VS Code.

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

---

# Build for production

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

---

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

---

### Benchmark models included

The project guidance also discussed using multiple AI models for later predictive work. To support that, the backend includes an offline benchmarking module with:

- **Random Forest** – risk-class prediction benchmark
- **XGBoost** – advanced tabular benchmark
- **Isolation Forest** – anomaly benchmark

These are deliberately treated as **benchmark/experimentation models**, while the core app still uses explainable rules-first recommendations.


---

## Main pages

- **Login / Sign Up** – branded access request and sign-in flow
- **Dashboard** – admin-only fleet overview, KPIs, charts, recommendations, and explainability
- **Fleet Assets** – admin-only asset-level inspection and review
- **Admin Panel** – approvals, role assignment, user activation/deactivation
- **Recommendations** – role-aware recommendation view
- **Compliance & Audit** – compliance, standards, audit visibility
- **Reports** – export-style summaries and charts
- **Transition Comparison** – compare strategy scenarios and impact
- **Settings** – user preferences and password update screen

---

## Regenerate the synthetic data
If you want to regenerate the CSV and frontend seed data:

```bash
cd server
python scripts/generate_data.py
```

That script updates:

- backend CSV files in `server/data/`
- frontend seed module in `client/src/data/mockData.generated.js`

