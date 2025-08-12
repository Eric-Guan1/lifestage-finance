from typing import List
from .schemas import PlanRequest, PlanResponse, Advice


def generate_plan(request: PlanRequest) -> PlanResponse:
    """
    Determine a simple prioritized plan based on a user's financial profile.

    The rules below are intentionally transparent and deterministic to make it
    easy to understand why each suggestion was recommended. As the product
    matures you may choose to replace this with a more sophisticated engine.
    """
    steps: List[Advice] = []

    # Emergency fund recommendation based on income
    min_emergency_fund = max(1000.0, request.income * 0.5)
    steps.append(
        Advice(
            title="Build an emergency fund",
            description=(
                "Set aside a buffer of at least "
                f"${min_emergency_fund:,.0f} to handle unexpected expenses. "
                "Aim for 3–6 months of living expenses if possible."
            ),
        )
    )

    # High interest debt repayment takes precedence
    if request.has_debt:
        steps.append(
            Advice(
                title="Pay down high‑interest debt",
                description=(
                    "Focus on paying off any debt with an interest rate above 7% "
                    "before investing heavily elsewhere. Consider the debt avalanche method: "
                    "list balances by interest rate and tackle the highest first."
                ),
            )
        )

    # Employer match contribution
    steps.append(
        Advice(
            title="Contribute to retirement plan",
            description=(
                "If your employer offers a 401(k) or similar plan with a match, "
                "contribute at least enough to get the full match. It's essentially free money."
            ),
        )
    )

    # Students or new grads often need to establish credit and budget
    if request.is_student or request.is_graduating:
        steps.append(
            Advice(
                title="Create a starter budget",
                description=(
                    "Develop a simple monthly budget to track expenses and avoid accumulating debt. "
                    "Use tools like the 50/30/20 rule to allocate needs, wants and savings."
                ),
            )
        )
        steps.append(
            Advice(
                title="Build credit responsibly",
                description=(
                    "Open a low‑fee credit card (if you don't have one) and pay the balance in full each month. "
                    "A strong credit history will help with future loans and housing."
                ),
            )
        )

    # Parents should consider insurance
    if request.has_children:
        steps.append(
            Advice(
                title="Purchase term life insurance",
                description=(
                    "If you have dependents, ensure they are protected by obtaining affordable term life insurance. "
                    "Choose coverage that can replace your income for 10–15 years."
                ),
            )
        )

    # Age-based considerations
    if request.age >= 50:
        steps.append(
            Advice(
                title="Review retirement readiness",
                description=(
                    "Assess your progress towards retirement. Increase contributions "
                    "if you're behind and consider meeting with a professional for a detailed plan."
                ),
            )
        )

    return PlanResponse(steps=steps)