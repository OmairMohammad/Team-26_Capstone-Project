from __future__ import annotations
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import repository

PRIMARY_ADMIN_ID = 'USR-ADMIN-001'
PRIMARY_ADMIN_ROLE = 'Admin'

app = FastAPI(title='OBrien IDI API', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    desiredRole: str
    site: str
    notes: str = ''


class ReviewRequest(BaseModel):
    asset_id: str
    decision: str
    comment: str = ''
    reviewer: str
    reviewer_role: str
    standard: str = 'AS3788'
    compliant: bool = True


class RoleRequest(BaseModel):
    role: str


@app.on_event('startup')
def startup() -> None:
    repository.init_db()


@app.get('/api/health')
def health() -> dict[str, Any]:
    return {'status': 'ok', 'time': datetime.utcnow().isoformat()}


@app.post('/api/auth/login')
def login(payload: LoginRequest) -> dict[str, Any]:
    user = repository.login(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=404, detail='No account found for this email.')
    if 'error' in user:
        raise HTTPException(status_code=400, detail=user['error'])
    return {'user': user}


@app.post('/api/auth/signup')
def signup(payload: SignupRequest) -> dict[str, Any]:
    ok, message = repository.signup({**payload.model_dump(), 'createdAt': datetime.utcnow().strftime('%Y-%m-%d %H:%M')})
    if not ok:
        raise HTTPException(status_code=400, detail=message)
    return {'message': message}


@app.get('/api/auth/users')
def users() -> list[dict[str, Any]]:
    return repository.get_users()


@app.get('/api/sites')
def sites() -> list[dict[str, Any]]:
    return repository.get_sites()


@app.get('/api/assets')
def assets(site: str | None = None, risk: str | None = None, search: str | None = None) -> list[dict[str, Any]]:
    return repository.get_assets(site=site, risk=risk, search=search)


@app.get('/api/assets/{asset_id}')
def asset(asset_id: str) -> dict[str, Any]:
    result = repository.get_asset(asset_id)
    if not result:
        raise HTTPException(status_code=404, detail='Asset not found.')
    return result


@app.get('/api/dashboard')
def dashboard(site: str | None = None) -> dict[str, Any]:
    return repository.get_dashboard(site)


@app.get('/api/audit')
def audit(asset_id: str | None = None) -> list[dict[str, Any]]:
    return repository.get_audit(asset_id=asset_id)


@app.post('/api/review')
def review(payload: ReviewRequest) -> dict[str, Any]:
    return repository.add_audit_entry({**payload.model_dump(), 'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M')})


@app.get('/api/recommendations')
def recommendations(site: str | None = None) -> list[dict[str, Any]]:
    return repository.get_recommendations(site=site)


@app.get('/api/compliance')
def compliance() -> dict[str, Any]:
    return repository.get_compliance()


@app.get('/api/reports/summary')
def report_summary() -> dict[str, Any]:
    return repository.get_report_summary()


@app.get('/api/transition')
def transition() -> list[dict[str, Any]]:
    return repository.get_transition()


@app.get('/api/models/benchmark')
def model_benchmark() -> dict[str, Any]:
    from .modeling import train_benchmark_models
    return train_benchmark_models(force=False)


@app.post('/api/admin/users/{user_id}/approve')
def approve_user(user_id: str, payload: RoleRequest) -> dict[str, Any]:
    role = payload.role.strip() or 'Engineer / Operator'
    if role == 'Pending Approval':
        role = 'Engineer / Operator'
    updated = repository.update_user(user_id, approved=True, role=role, desiredRole=role)
    if not updated:
        raise HTTPException(status_code=404, detail='User not found.')
    return updated


@app.post('/api/admin/users/{user_id}/role')
def assign_role(user_id: str, payload: RoleRequest) -> dict[str, Any]:
    role = payload.role.strip()
    if not role:
        raise HTTPException(status_code=400, detail='Role is required.')
    if user_id == PRIMARY_ADMIN_ID and role != PRIMARY_ADMIN_ROLE:
        raise HTTPException(status_code=400, detail='Primary demo admin role cannot be changed.')
    updated = repository.update_user(user_id, role=role, desiredRole=role)
    if not updated:
        raise HTTPException(status_code=404, detail='User not found.')
    return updated


@app.post('/api/admin/users/{user_id}/toggle-active')
def toggle_active(user_id: str) -> dict[str, Any]:
    users = repository.get_users()
    target = next((u for u in users if u['id'] == user_id), None)
    if not target:
        raise HTTPException(status_code=404, detail='User not found.')
    if user_id == PRIMARY_ADMIN_ID:
        raise HTTPException(status_code=400, detail='Primary demo admin account cannot be deactivated.')
    current = str(target.get('isActive')).lower() in {'1', 'true', 'yes'} if not isinstance(target.get('isActive'), bool) else target['isActive']
    updated = repository.update_user(user_id, isActive=not current)
    return updated


@app.post('/api/admin/reset-demo')
def reset_demo() -> dict[str, str]:
    try:
        repository.reset_db()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to reset demo data: {exc}') from exc
    return {'message': 'Demo data reset successfully.'}
