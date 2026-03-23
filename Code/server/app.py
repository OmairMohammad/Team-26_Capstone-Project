from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="O'Brien Energy IDI MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSETS = [
    {
        "assetId": "BOI-101",
        "assetName": "Main Steam Boiler A",
        "assetType": "Boiler",
        "site": "Melbourne Plant",
        "temperature": 91,
        "pressure": 74,
        "vibration": 22,
        "efficiencyScore": 82,
        "recentFaults": 0,
        "overdueDays": 0,
    },
    {
        "assetId": "BUR-205",
        "assetName": "Burner Unit 2",
        "assetType": "Burner",
        "site": "Melbourne Plant",
        "temperature": 108,
        "pressure": 79,
        "vibration": 34,
        "efficiencyScore": 66,
        "recentFaults": 2,
        "overdueDays": 11,
    },
    {
        "assetId": "PMP-144",
        "assetName": "Feedwater Pump 3",
        "assetType": "Pump",
        "site": "Melbourne Plant",
        "temperature": 115,
        "pressure": 86,
        "vibration": 58,
        "efficiencyScore": 41,
        "recentFaults": 4,
        "overdueDays": 29,
    },
]

class LoginPayload(BaseModel):
    email: str
    password: str


def assess_asset(asset: dict) -> dict:
    health_score = asset["efficiencyScore"]

    if asset["recentFaults"] >= 3:
        health_score -= 20
    elif asset["recentFaults"] >= 1:
        health_score -= 8

    if asset["overdueDays"] > 30:
        health_score -= 18
    elif asset["overdueDays"] > 7:
        health_score -= 10

    if asset["vibration"] > 50:
        health_score -= 12
    elif asset["vibration"] > 30:
        health_score -= 6

    if asset["temperature"] > 110:
        health_score -= 10
    elif asset["temperature"] > 100:
        health_score -= 5

    health_score = max(0, min(100, round(health_score)))

    risk_level = "Low"
    recommended_action = "Continue Monitoring"

    if health_score < 50 or asset["recentFaults"] >= 4 or asset["overdueDays"] > 28:
        risk_level = "High"
        recommended_action = "Service / Escalate"
    elif health_score < 80 or asset["recentFaults"] >= 1 or asset["overdueDays"] > 7:
        risk_level = "Medium"
        recommended_action = "Inspect / Tune / Clean"

    return {
        **asset,
        "healthScore": health_score,
        "riskLevel": risk_level,
        "recommendedAction": recommended_action,
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/login")
def login(payload: LoginPayload):
    return {
        "message": "Mock login successful",
        "user": {
            "name": "Omair Mohammad",
            "email": payload.email,
            "role": "Project Manager / Team Leader",
        },
    }


@app.get("/api/assets")
def get_assets():
    return [assess_asset(asset) for asset in ASSETS]


@app.get("/api/assets/{asset_id}")
def get_asset(asset_id: str):
    for asset in ASSETS:
        if asset["assetId"] == asset_id:
            return assess_asset(asset)
    return {"error": "Asset not found"}
