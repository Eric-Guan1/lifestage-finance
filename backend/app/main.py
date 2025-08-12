from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PlanRequest, PlanResponse
from .rules import generate_plan

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
async def create_plan(request: PlanRequest) -> PlanResponse:
    """
    Generate a prioritized financial plan based on the user's life stage.

    This endpoint accepts user profile information and returns a short list
    of recommended actions. The simple rules engine defined in ``rules.py``
    determines the ordering and content of the suggestions.
    """
    return generate_plan(request)