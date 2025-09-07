from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PlanRequest, PlanResponse
from .rules import generate_plan
from . import auth
from fastapi import HTTPException, Request

app = FastAPI(
    title="LifeStage Finance API",
    description="API for generating life-stage financial plans",
    version="0.1.0",
)

# Allow CORS for all origins for simplicity. In production limit this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health() -> dict[str, str]:
    """
    Simple health check endpoint to verify the API is running.
    """
    return {"status": "ok"}


@app.post("/api/plan", response_model=PlanResponse)
async def create_plan(request_payload: PlanRequest, request: Request) -> PlanResponse:
    """
    Generate a prioritized financial plan based on the user's life stage.

    This endpoint accepts user profile information and returns a short list
    of recommended actions. The simple rules engine defined in ``rules.py``
    determines the ordering and content of the suggestions.
    """
    plan = generate_plan(request_payload)
    # if Authorization header present, persist the plan for the user (dev-only)
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
        email = auth.get_email_for_token(token)
        if email:
            auth.save_plan_for_email(email, plan.dict())
    return plan


@app.get("/api/plan")
async def get_plan(request: Request):
    """Return the stored plan for the authenticated user."""
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    token = auth_header.split(" ", 1)[1]
    email = auth.get_email_for_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    plan = auth.get_plan_for_email(email)
    if not plan:
        raise HTTPException(status_code=404, detail="plan not found")
    return plan


@app.post("/api/signup")
async def signup(payload: dict) -> dict:
    """Create a new user (dev-only, in-memory) and return a token and basic profile."""
    email = payload.get("email")
    password = payload.get("password")
    first_name = payload.get("first_name") or ""
    last_name = payload.get("last_name") or ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password required")
    try:
        token = auth.create_user(email, password, first_name=first_name, last_name=last_name)
        user = auth.get_user(email)
        return {"token": token, "user": user}
    except ValueError:
        raise HTTPException(status_code=400, detail="user already exists")


@app.post("/api/signin")
async def signin(payload: dict) -> dict:
    """Authenticate and return token and user info if successful."""
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password required")
    token = auth.authenticate_user(email, password)
    if not token:
        raise HTTPException(status_code=401, detail="invalid credentials")
    user = auth.get_user(email)
    return {"token": token, "user": user}


@app.get("/api/_debug/users")
async def debug_users():
    """Development-only: list users (no passwords)."""
    out = []
    for email, rec in auth.USERS.items():
        out.append({"email": email, "first_name": rec.get("first_name"), "last_name": rec.get("last_name")})
    return out