from pydantic import BaseModel, Field
from typing import List


class PlanRequest(BaseModel):
    """
    The shape of data expected from the frontend to generate a plan.

    Parameters:
    - age: The user's age in years.
    - income: The user's approximate annual income (USD).
    - has_children: Whether the user has any dependents.
    - is_student: Whether the user is currently a student.
    - is_graduating: Whether the user is about to graduate in the next year.
    - has_debt: Whether the user currently has any high‑interest debt.
    """

    age: int = Field(..., ge=0, description="Age in years")
    income: float = Field(..., ge=0, description="Annual income in USD")
    has_children: bool = Field(..., description="Whether the user has dependents")
    is_student: bool = Field(..., description="Whether the user is currently a student")
    is_graduating: bool = Field(..., description="Whether the user will graduate within the year")
    has_debt: bool = Field(..., description="Whether the user has high‑interest debt")


class Advice(BaseModel):
    """
    A single action item returned in the plan.

    Each piece of advice includes a short title and a more detailed description.
    """

    title: str
    description: str


class PlanResponse(BaseModel):
    """
    A prioritized list of financial suggestions tailored to the user's inputs.
    """

    steps: List[Advice]