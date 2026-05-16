from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from threading import RLock
from typing import Any

import pandas as pd

from .engine import assess_asset, dashboard_metrics

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / 'data'
DB_PATH = DATA_DIR / 'app.db'
DB_LOCK = RLock()
CSV_MAP = {
    'users': 'users.csv',
    'sites': 'sites.csv',
    'assets': 'assets.csv',
    'maintenance_history': 'maintenance_history.csv',
    'condition_data': 'condition_data.csv',
    'alarm_faults': 'alarm_faults.csv',
    'operator_observations': 'operator_observations.csv',
    'recommendations': 'recommendations.csv',
    'audit_log': 'audit_log.csv',
    'energy_emissions': 'energy_emissions.csv',
    'training_compliance': 'training_compliance.csv',
    'transition_scenarios': 'transition_scenarios.csv',
    'compliance_standards': 'compliance_standards.csv',
}


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def _seed_db(conn: sqlite3.Connection) -> None:
    for table, filename in CSV_MAP.items():
        path = DATA_DIR / filename
        df = pd.read_csv(path)
        df.to_sql(table, conn, if_exists='replace', index=False)
    conn.commit()


def init_db(force_reset: bool = False) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with DB_LOCK:
        if DB_PATH.exists() and not force_reset:
            return
        with _conn() as conn:
            _seed_db(conn)


def reset_db() -> None:
    init_db(force_reset=True)


def _read_table(table: str) -> list[dict[str, Any]]:
    with DB_LOCK:
        with _conn() as conn:
            cur = conn.execute(f'SELECT * FROM {table}')
            return [dict(row) for row in cur.fetchall()]


def get_users() -> list[dict[str, Any]]:
    return _read_table('users')


def get_sites() -> list[dict[str, Any]]:
    return _read_table('sites')


def _cast_asset(row: dict[str, Any]) -> dict[str, Any]:
    asset = dict(row)
    if isinstance(asset.get('historicalHealthScores'), str):
        try:
            asset['historicalHealthScores'] = json.loads(asset['historicalHealthScores'])
        except json.JSONDecodeError:
            asset['historicalHealthScores'] = [int(x) for x in asset['historicalHealthScores'].strip('[]').split(',') if x.strip()]
    for key in ['workerCertified', 'emissionCompliant']:
        if key in asset:
            value = asset[key]
            asset[key] = str(value).strip().lower() in {'1', 'true', 'yes'} if not isinstance(value, bool) else value
    return asset


def get_assets(site: str | None = None, risk: str | None = None, search: str | None = None) -> list[dict[str, Any]]:
    assets = [_cast_asset(row) for row in _read_table('assets')]
    assessed = [assess_asset(asset) for asset in assets]
    if site:
        assessed = [a for a in assessed if a.get('site') == site]
    if risk and risk != 'All':
        assessed = [a for a in assessed if a.get('riskLevel') == risk]
    if search:
        q = search.lower().strip()
        assessed = [a for a in assessed if q in a.get('assetId', '').lower() or q in a.get('assetName', '').lower() or q in a.get('site', '').lower()]
    return assessed


def get_asset(asset_id: str) -> dict[str, Any] | None:
    assets = get_assets()
    for asset in assets:
        if asset['assetId'] == asset_id:
            return asset
    return None


def get_dashboard(site: str | None = None) -> dict[str, Any]:
    assets = get_assets(site=site)
    chart = [
        {'name': 'Low Risk', 'value': sum(1 for a in assets if a['riskLevel'] == 'Low')},
        {'name': 'Medium Risk', 'value': sum(1 for a in assets if a['riskLevel'] == 'Medium')},
        {'name': 'High Risk', 'value': sum(1 for a in assets if a['riskLevel'] == 'High')},
    ]
    return {'metrics': dashboard_metrics(assets), 'chartData': chart, 'assets': assets}


def get_audit(asset_id: str | None = None) -> list[dict[str, Any]]:
    rows = _read_table('audit_log')
    if asset_id:
        rows = [row for row in rows if row.get('assetId') == asset_id]
    return sorted(rows, key=lambda x: x.get('timestamp', ''), reverse=True)


def add_audit_entry(payload: dict[str, Any]) -> dict[str, Any]:
    rows = get_audit()
    next_id = f"AUD-{1000 + len(rows) + 1}"
    entry = {
        'id': next_id,
        'assetId': payload['asset_id'],
        'reviewer': payload['reviewer'],
        'reviewerRole': payload['reviewer_role'],
        'decision': payload['decision'],
        'comment': payload.get('comment', ''),
        'timestamp': payload['timestamp'],
        'standard': payload.get('standard', 'AS3788'),
        'compliant': payload.get('compliant', True),
    }
    with DB_LOCK:
        with _conn() as conn:
            pd.DataFrame([entry]).to_sql('audit_log', conn, if_exists='append', index=False)
            conn.commit()
    return entry


def login(email: str, password: str) -> dict[str, Any] | None:
    norm = email.strip().lower()
    with DB_LOCK:
        with _conn() as conn:
            row = conn.execute('SELECT * FROM users WHERE lower(email)=?', (norm,)).fetchone()
            if not row:
                return None
            user = dict(row)
    if str(user.get('password', '')) != password:
        return {'error': 'Incorrect password.'}
    is_active = str(user.get('isActive', '')).lower() in {'1', 'true', 'yes'} if not isinstance(user.get('isActive'), bool) else user['isActive']
    approved = str(user.get('approved', '')).lower() in {'1', 'true', 'yes'} if not isinstance(user.get('approved'), bool) else user['approved']
    user['isActive'] = is_active
    user['approved'] = approved
    if not is_active:
        return {'error': 'Account has been deactivated.'}
    if not approved:
        return {'error': 'Account is pending admin approval.'}
    return user


def signup(payload: dict[str, Any]) -> tuple[bool, str]:
    users = get_users()
    norm = payload['email'].strip().lower()
    if any(str(u['email']).lower() == norm for u in users):
        return False, 'Email already registered.'
    new_user = {
        'id': f"USR-{len(users)+1:03d}",
        'name': payload['name'].strip(),
        'email': norm,
        'password': payload['password'],
        'role': 'Pending Approval',
        'desiredRole': payload['desiredRole'],
        'site': payload['site'],
        'approved': False,
        'isActive': True,
        'createdAt': payload['createdAt'],
        'notes': payload.get('notes', ''),
    }
    with DB_LOCK:
        with _conn() as conn:
            pd.DataFrame([new_user]).to_sql('users', conn, if_exists='append', index=False)
            conn.commit()
    return True, 'Account request submitted. Admin must approve before login.'


def update_user(user_id: str, **updates: Any) -> dict[str, Any] | None:
    users = get_users()
    target = next((u for u in users if u['id'] == user_id), None)
    if not target:
        return None
    target.update(updates)
    df = pd.DataFrame(users)
    df.loc[df['id'] == user_id, list(updates.keys())] = list(updates.values())
    with DB_LOCK:
        with _conn() as conn:
            df.to_sql('users', conn, if_exists='replace', index=False)
            conn.commit()
    return target


def get_recommendations(site: str | None = None) -> list[dict[str, Any]]:
    assets = get_assets(site=site)
    rows = []
    for asset in assets:
        rows.append({
            'assetId': asset['assetId'],
            'assetName': asset['assetName'],
            'site': asset['site'],
            'riskLevel': asset['riskLevel'],
            'recommendedAction': asset['recommendedAction'],
            'healthScore': asset['healthScore'],
            'priority': asset['explainability']['priority'],
            'confidence': asset['confidenceScore'],
            'keyFactors': asset['explainability']['factors'],
            'reviewStatus': asset['reviewStatus'],
            'daysToFailure': asset['prediction']['daysToFailure'],
        })
    return rows


def get_compliance() -> dict[str, Any]:
    standards = _read_table('compliance_standards')
    energy = _read_table('energy_emissions')
    train = _read_table('training_compliance')
    audits = get_audit()
    summary = {
        'compliantAssets': sum(1 for row in energy if str(row.get('emission_compliant')).lower() in {'1', 'true', 'yes'}),
        'nonCompliantAssets': sum(1 for row in energy if str(row.get('emission_compliant')).lower() not in {'1', 'true', 'yes'}),
        'trainingFlags': sum(1 for row in train if str(row.get('training_compliance_flag')).lower() not in {'1', 'true', 'yes'}),
        'openAuditActions': sum(1 for row in audits if row.get('decision') != 'Approved'),
    }
    return {'standards': standards, 'energy': energy, 'training': train, 'audit': audits, 'summary': summary}


def get_transition() -> list[dict[str, Any]]:
    return _read_table('transition_scenarios')


def get_report_summary() -> dict[str, Any]:
    assets = get_assets()
    audits = get_audit()
    by_site: dict[str, dict[str, Any]] = {}
    for asset in assets:
        site = asset['site']
        site_bucket = by_site.setdefault(site, {'site': site, 'high': 0, 'medium': 0, 'low': 0, 'avgHealth': []})
        site_bucket[asset['riskLevel'].lower()] += 1
        site_bucket['avgHealth'].append(asset['healthScore'])
    site_rows = []
    for site, data in by_site.items():
        avg = round(sum(data['avgHealth']) / len(data['avgHealth']), 1) if data['avgHealth'] else 0
        site_rows.append({k: v for k, v in data.items() if k != 'avgHealth'} | {'avgHealth': avg})
    return {
        'totalAssets': len(assets),
        'highRiskAssets': sum(1 for asset in assets if asset['riskLevel'] == 'High'),
        'approvedReviews': sum(1 for audit in audits if audit.get('decision') == 'Approved'),
        'siteBreakdown': sorted(site_rows, key=lambda row: row['site']),
    }
