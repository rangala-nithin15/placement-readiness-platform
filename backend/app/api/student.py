from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.security import (
    require_role,
)

from app.repositories.student_repository import (
    create_student_profile,
    get_student_profile,
    update_student_profile,
)

from app.repositories.external_profile_repository import (
    get_student_external_profiles,
)

from app.schemas.student import (
    StudentProfileResponse,
    StudentProfileUpdateRequest,
)

from app.services.student_placement_service import (
    calculate_student_placement,
)


router = APIRouter(
    prefix="/student",
    tags=["Student"],
)


# =========================================================
# STUDENT PROFILE RESPONSE
# =========================================================

def profile_to_response(
    profile: dict,
) -> StudentProfileResponse:

    return StudentProfileResponse(
        id=str(
            profile["_id"]
        ),

        user_id=str(
            profile["user_id"]
        ),

        name=profile.get(
            "name",
            ""
        ),

        email=profile.get(
            "email",
            ""
        ),

        register_number=profile.get(
            "register_number"
        ),

        department=profile.get(
            "department"
        ),

        batch=profile.get(
            "batch"
        ),

        phone=profile.get(
            "phone"
        ),

        location=profile.get(
            "location"
        ),

        linkedin_url=profile.get(
            "linkedin_url"
        ),

        cgpa=profile.get(
            "cgpa"
        ),

        tenth_percentage=profile.get(
            "tenth_percentage"
        ),

        twelfth_percentage=profile.get(
            "twelfth_percentage"
        ),

        backlogs=profile.get(
            "backlogs",
            0
        ),

        skills=profile.get(
            "skills",
            []
        ),

        career_interests=profile.get(
            "career_interests",
            []
        ),

        profile_completion=profile.get(
            "profile_completion",
            0
        ),
    )


# =========================================================
# JSON SERIALIZER FOR MONGODB DATA
# =========================================================

def serialize_mongodb_value(
    value,
):
    """
    Convert MongoDB-specific values into
    JSON-compatible values.
    """

    # ObjectId
    if hasattr(value, "__class__") and (
        value.__class__.__name__ == "ObjectId"
    ):
        return str(value)

    # datetime
    if isinstance(
        value,
        datetime,
    ):
        return value.isoformat()

    # dictionary
    if isinstance(
        value,
        dict,
    ):
        return {
            key: serialize_mongodb_value(
                item
            )
            for key, item in value.items()
        }

    # list
    if isinstance(
        value,
        list,
    ):
        return [
            serialize_mongodb_value(
                item
            )
            for item in value
        ]

    # normal value
    return value


# =========================================================
# GET STUDENT PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=StudentProfileResponse,
)
def get_my_profile(
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    profile = get_student_profile(
        current_user["_id"]
    )

    if profile is None:

        profile = create_student_profile(
            current_user
        )

    return profile_to_response(
        profile
    )


# =========================================================
# UPDATE STUDENT PROFILE
# =========================================================

@router.put(
    "/profile",
    response_model=StudentProfileResponse,
)
def update_my_profile(
    request: StudentProfileUpdateRequest,

    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    update_data = request.model_dump(
        exclude_unset=True
    )

    profile = get_student_profile(
        current_user["_id"]
    )

    if profile is None:

        profile = create_student_profile(
            current_user
        )

    updated_profile = (
        update_student_profile(
            current_user["_id"],
            update_data,
        )
    )

    if updated_profile is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    return profile_to_response(
        updated_profile
    )


# =========================================================
# GET MY PLACEMENT READINESS
# =========================================================

@router.get(
    "/placement",
)
def get_my_placement_readiness(
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    try:

        return calculate_student_placement(
            current_user["_id"]
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Placement calculation error:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to calculate "
                "placement readiness."
            ),
        )


# =========================================================
# DEBUG - VIEW CONNECTED EXTERNAL PROFILES
# =========================================================
#
# Temporary development endpoint.
#
# It converts MongoDB ObjectId and datetime values
# into JSON-compatible values.
#
# We will remove this endpoint before production.
# =========================================================

@router.get(
    "/profiles/debug",
)
def debug_student_profiles(
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    profiles = get_student_external_profiles(
        current_user["_id"]
    )

    serialized_profiles = (
        serialize_mongodb_value(
            profiles
        )
    )

    return {
        "profiles": serialized_profiles,
    }