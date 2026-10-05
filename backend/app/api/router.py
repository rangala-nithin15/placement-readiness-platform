from fastapi import APIRouter


from app.api.auth import (
    router as auth_router
)

from app.api.student import (
    router as student_router
)

from app.api.mentor import (
    router as mentor_router
)

from app.api.external_profiles import (
    router as external_profiles_router
)


router = APIRouter()


@router.get(
    "/health"
)
def health_check():

    return {

        "status": "ok",

        "message": (
            "Placement Readiness API "
            "is running"
        ),

    }


router.include_router(
    auth_router
)


router.include_router(
    student_router
)


router.include_router(
    mentor_router
)


router.include_router(
    external_profiles_router
)