# Team-26_Capstone-Project
Capstone project for Team 26: O’Brien Energy explainable maintenance decision-support MVP with React, FastAPI, and SQLite.


# O'Brien Energy – Industrial Decision Intelligence MVP

This starter project is built for interim capstone progress. It includes:

- React + Vite + Tailwind frontend
- Login and sign-up flow with mock authentication
- Admin-controlled user approval and role assignment
- Role-based dashboard state
- Fleet assets page
- Rules-based recommendation logic
- Audit log updates from human review actions
- FastAPI backend starter for later integration

## Frontend setup

```bash
cd client
npm install
npm run dev
```

## Backend setup

```bash
cd server
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Demo credentials

### Admin account
- Email: `admin@obrienenergy.com.au`
- Password: `Admin123!`

### Engineer account
- Email: `ali.ahmad@obrienenergy.com.au`
- Password: `User123!`

### Planner account
- Email: `planner@obrienenergy.com.au`
- Password: `User123!`

## Current demo workflow

1. Sign up creates a pending account request.
2. Admin logs in and opens the **Admin Panel**.
3. Admin approves the user, assigns the final role, and can activate or deactivate accounts.
4. Approved users can log in.
5. Dashboard content changes according to the signed-in role.
6. Review actions append new audit-log entries.
