from fastapi import (
    APIRouter,
    Depends,
)

from app.core.security import get_current_user

from app.schemas.placement import (
    PlacementCalculationRequest,
    PlacementCalculationResponse,
)

from app.services.placement_engine import (
    calculate_placement,
)


router = APIRouter(
    prefix="/placement",
    tags=["Placement Readiness"],
)


@router.post(
    "/calculate",
    response_model=PlacementCalculationResponse,
)
def calculate_student_placement(
    request: PlacementCalculationRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):

    return calculate_placement(
        request
    )


@router.get(
    "/framework",
)
def get_placement_framework(
    current_user: dict = Depends(
        get_current_user
    ),
):

    return {
        "name": (
            "Placement Readiness "
            "Development Framework"
        ),
        "maximum_marks": 250,
        "parameters": [
            {
                "id": 1,
                "name": "Coding Problems Solved",
                "max_marks": 25,
            },
            {
                "id": 2,
                "name": "Open-Source Contribution",
                "max_marks": 20,
            },
            {
                "id": 3,
                "name": "Competition Achievement",
                "max_marks": 20,
            },
            {
                "id": 4,
                "name": "Certification Achievement",
                "max_marks": 20,
            },
            {
                "id": 5,
                "name": "Competitive Programming Rating",
                "max_marks": 20,
            },
            {
                "id": 6,
                "name": (
                    "Project/Product, Publication "
                    "& Patent Achievement"
                ),
                "max_marks": 30,
            },
            {
                "id": 7,
                "name": (
                    "External Aptitude, "
                    "Communication"
                ),
                "max_marks": 20,
            },
            {
                "id": 8,
                "name": (
                    "Monthly Coding Assessment"
                ),
                "max_marks": 20,
            },
            {
                "id": 9,
                "name": (
                    "GATE & Optional "
                    "Higher-Studies Examinations"
                ),
                "max_marks": 25,
            },
            {
                "id": 10,
                "name": (
                    "Internship, Startup, "
                    "Industry & Off-Campus Achievement"
                ),
                "max_marks": 20,
            },
            {
                "id": 11,
                "name": (
                    "Foreign Language "
                    "Proficiency Certification"
                ),
                "max_marks": 15,
            },
            {
                "id": 12,
                "name": (
                    "Hundred Days Training Programme"
                ),
                "max_marks": 15,
            },
        ],
        "levels": [
            {
                "level": "LEVEL 1",
                "score_range": "80-119",
                "category": "Up to ₹5 LPA Companies",
            },
            {
                "level": "LEVEL 2",
                "score_range": "120-159",
                "category": "Up to ₹10 LPA Companies",
            },
            {
                "level": "LEVEL 3",
                "score_range": "160-199",
                "category": "Up to ₹20 LPA Companies",
            },
            {
                "level": "ELITE",
                "score_range": "200-250",
                "category": "Above ₹20 LPA Companies",
            },
        ],
    }