from datetime import datetime
from typing import Any, Optional

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel

from app.core.security import (
    get_current_user,
    require_role,
)

from app.repositories.external_profile_repository import (
    get_external_profile_by_id,
    update_external_profile_verification_status,
)

from app.repositories.mentor_repository import (
    get_assigned_student,
)

from app.repositories.verification_repository import (
    create_verification_request,
    find_pending_request,
    get_student_verification_requests,
    get_verification_request_by_id,
    update_verification_request,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/verification",
    tags=["Verification"],
)


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class VerificationRequestBody(BaseModel):

    external_profile_id: str


class ReviewVerificationBody(BaseModel):

    action: str

    review_note: Optional[str] = None


# ============================================================
# SERIALIZATION
# ============================================================

def serialize_value(
    value: Any,
) -> Any:

    if isinstance(
        value,
        ObjectId,
    ):

        return str(value)

    if isinstance(
        value,
        datetime,
    ):

        return value.isoformat()

    if isinstance(
        value,
        dict,
    ):
        res = {
            key: serialize_value(item)
            for key, item in value.items()
        }
        if "_id" in res and "id" not in res:
            res["id"] = res["_id"]
        return res

    if isinstance(
        value,
        list,
    ):

        return [
            serialize_value(item)
            for item in value
        ]

    return value


def serialize_request(
    request: dict,
) -> dict:

    return serialize_value(
        request
    )


# ============================================================
# STUDENT
# GET MY VERIFICATION REQUESTS
# ============================================================

@router.get(
    "/student",
)
def get_my_verification_requests(
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    requests = (
        get_student_verification_requests(
            current_user["_id"]
        )
    )

    return {
        "requests": [
            serialize_request(request)
            for request in requests
        ],
        "total": len(requests),
    }


# ============================================================
# STUDENT
# CREATE VERIFICATION REQUEST
# ============================================================

@router.post(
    "/student",
    status_code=status.HTTP_201_CREATED,
)
def request_verification(
    request: VerificationRequestBody,
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    # --------------------------------------------------------
    # Validate profile ID
    # --------------------------------------------------------

    try:

        profile_id = ObjectId(
            request.external_profile_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid external profile ID."
            ),
        )

    # --------------------------------------------------------
    # Make sure the profile belongs to
    # the currently logged-in student.
    # --------------------------------------------------------

    profile = get_external_profile_by_id(
        current_user["_id"],
        profile_id,
    )

    if profile is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "External profile not found."
            ),
        )

    # --------------------------------------------------------
    # Already verified
    # --------------------------------------------------------

    if (
        profile.get(
            "verification_status"
        )
        == "VERIFIED"
    ):

        raise HTTPException(
            status_code=409,
            detail=(
                "This profile is already verified."
            ),
        )

    # --------------------------------------------------------
    # Check whether a pending request already exists.
    # --------------------------------------------------------

    existing_request = (
        find_pending_request(
            current_user["_id"],
            profile_id,
        )
    )

    if existing_request is not None:

        raise HTTPException(
            status_code=409,
            detail=(
                "A verification request "
                "for this profile is already pending."
            ),
        )

    # --------------------------------------------------------
    # Create verification request.
    # --------------------------------------------------------

    verification_request = (
        create_verification_request(
            student_id=current_user["_id"],
            external_profile_id=profile_id,
        )
    )

    return {
        "message": (
            "Verification request submitted "
            "successfully."
        ),
        "request": serialize_request(
            verification_request
        ),
    }


# ============================================================
# MENTOR
# GET VERIFICATION REQUESTS
# ============================================================

@router.get(
    "/mentor",
)
def get_mentor_verification_requests(
    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    requests = []

    # --------------------------------------------------------
    # Get all pending verification requests.
    # The repository returns the requests.
    # We then enforce mentor assignment for every request.
    # --------------------------------------------------------

    from app.database.mongodb import mongodb

    if mongodb.db is None:

        raise HTTPException(
            status_code=500,
            detail=(
                "MongoDB database is not initialized."
            ),
        )

    collection = mongodb.db[
        "verification_requests"
    ]

    pending_requests = list(
        collection.find(
            {
                "status": "PENDING",
            }
        ).sort(
            "created_at",
            -1,
        )
    )

    for verification_request in pending_requests:

        student_id = (
            verification_request.get(
                "student_id"
            )
        )

        if student_id is None:
            continue

        assigned_student = (
            get_assigned_student(
                current_user["_id"],
                student_id,
            )
        )

        if assigned_student is None:
            continue

        profile_id = (
            verification_request.get(
                "external_profile_id"
            )
        )

        profile = (
            get_external_profile_by_id(
                student_id,
                profile_id,
            )
        )

        response_item = {
            "request": verification_request,
            "student": assigned_student,
            "profile": profile,
        }

        requests.append(
            serialize_value(
                response_item
            )
        )

    return {
        "requests": requests,
        "total": len(requests),
    }


# ============================================================
# MENTOR
# REVIEW VERIFICATION REQUEST
# ============================================================

@router.post(
    "/mentor/{request_id}/review",
)
def review_verification_request(
    request_id: str,
    request: ReviewVerificationBody,
    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    # --------------------------------------------------------
    # Validate request ID
    # --------------------------------------------------------

    try:

        verification_request_id = ObjectId(
            request_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid verification request ID."
            ),
        )

    # --------------------------------------------------------
    # Get request
    # --------------------------------------------------------

    verification_request = (
        get_verification_request_by_id(
            verification_request_id
        )
    )

    if verification_request is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Verification request not found."
            ),
        )

    # --------------------------------------------------------
    # Only pending requests can be reviewed.
    # --------------------------------------------------------

    if (
        verification_request.get(
            "status"
        )
        != "PENDING"
    ):

        raise HTTPException(
            status_code=409,
            detail=(
                "This verification request "
                "has already been reviewed."
            ),
        )

    student_id = (
        verification_request.get(
            "student_id"
        )
    )

    external_profile_id = (
        verification_request.get(
            "external_profile_id"
        )
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # Mentor can review ONLY assigned students.
    # --------------------------------------------------------

    assigned_student = (
        get_assigned_student(
            current_user["_id"],
            student_id,
        )
    )

    if assigned_student is None:

        raise HTTPException(
            status_code=403,
            detail=(
                "You are not assigned to this student."
            ),
        )

    # --------------------------------------------------------
    # Validate action
    # --------------------------------------------------------

    action = (
        request.action
        .strip()
        .upper()
    )

    if action not in {
        "APPROVE",
        "REJECT",
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "Action must be either "
                "APPROVE or REJECT."
            ),
        )

    # --------------------------------------------------------
    # Make sure the external profile still exists.
    # --------------------------------------------------------

    profile = get_external_profile_by_id(
        student_id,
        external_profile_id,
    )

    if profile is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "External profile no longer exists."
            ),
        )

    # --------------------------------------------------------
    # Determine new profile status.
    # --------------------------------------------------------

    if action == "APPROVE":

        profile_status = "VERIFIED"

        request_status = "APPROVED"

    else:

        profile_status = "REJECTED"

        request_status = "REJECTED"

    # --------------------------------------------------------
    # Update external profile.
    # --------------------------------------------------------

    updated_profile = (
        update_external_profile_verification_status(
            student_id=student_id,
            profile_id=external_profile_id,
            verification_status=profile_status,
        )
    )

    if updated_profile is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Unable to update external profile."
            ),
        )

    # --------------------------------------------------------
    # Update verification request.
    # --------------------------------------------------------

    updated_request = (
        update_verification_request(
            verification_request_id,
            status=request_status,
            mentor_id=current_user["_id"],
            review_note=request.review_note,
        )
    )

    if updated_request is None:

        raise HTTPException(
            status_code=500,
            detail=(
                "Verification request could not "
                "be updated."
            ),
        )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "message": (
            "Verification request "
            + (
                "approved."
                if action == "APPROVE"
                else "rejected."
            )
        ),
        "request": serialize_request(
            updated_request
        ),
        "profile": serialize_value(
            updated_profile
        ),
    }