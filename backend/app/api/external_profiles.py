from datetime import datetime
from typing import Dict, Any

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel

from app.core.security import get_current_user

from app.repositories.external_profile_repository import (
    create_external_profile,
    find_profile_by_platform_and_username,
    find_profile_by_student_and_platform,
    get_external_profile_by_id,
    get_student_external_profiles,
    update_external_profile_stats,
    delete_external_profile,
)

from app.services.leetcode_service import (
    extract_leetcode_username,
    normalize_leetcode_url,
    fetch_leetcode_profile,
)

from app.services.github_service import (
    extract_github_username,
    normalize_github_url,
    fetch_github_profile,
)


router = APIRouter(
    prefix="/student/profiles",
    tags=["External Profiles"],
)


class ConnectProfileRequest(BaseModel):

    platform: str

    profile_url: str


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

        return {
            key: serialize_value(item)
            for key, item in value.items()
        }

    if isinstance(
        value,
        list,
    ):

        return [
            serialize_value(item)
            for item in value
        ]

    return value


def profile_response(
    profile: dict,
) -> dict:

    return serialize_value(
        profile
    )


@router.get("")
def get_my_profiles(
    current_user: dict = Depends(
        get_current_user
    ),
):

    profiles = get_student_external_profiles(
        current_user["_id"]
    )

    return {
        "profiles": [
            profile_response(profile)
            for profile in profiles
        ],
        "total": len(profiles),
    }


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def connect_profile(
    request: ConnectProfileRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):

    platform = (
        request.platform
        .strip()
        .lower()
    )

    profile_url = (
        request.profile_url
        .strip()
    )

    supported_platforms = {
        "leetcode",
        "github",
    }

    if platform not in supported_platforms:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported platform. "
                "Currently supported: "
                "LeetCode and GitHub."
            ),
        )

    if not profile_url:

        raise HTTPException(
            status_code=400,
            detail="Profile URL is required.",
        )

    # ------------------------------------------
    # EXTRACT USERNAME
    # ------------------------------------------

    try:

        if platform == "leetcode":

            username = extract_leetcode_username(
                profile_url
            )

        else:

            username = extract_github_username(
                profile_url
            )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    username = username.strip().lower()

    # ------------------------------------------
    # CHECK STUDENT PLATFORM DUPLICATE
    # ------------------------------------------

    existing_student_profile = (
        find_profile_by_student_and_platform(
            current_user["_id"],
            platform,
        )
    )

    if existing_student_profile:

        platform_name = (
            "LeetCode"
            if platform == "leetcode"
            else "GitHub"
        )

        raise HTTPException(
            status_code=409,
            detail=(
                f"You already have a "
                f"{platform_name} profile connected."
            ),
        )

    # ------------------------------------------
    # CHECK GLOBAL PROFILE OWNERSHIP
    # ------------------------------------------

    existing_owner = (
        find_profile_by_platform_and_username(
            platform,
            username,
        )
    )

    if existing_owner:

        if (
            existing_owner.get(
                "student_id"
            )
            != current_user["_id"]
        ):

            platform_name = (
                "LeetCode"
                if platform == "leetcode"
                else "GitHub"
            )

            raise HTTPException(
                status_code=409,
                detail=(
                    f"This {platform_name} profile "
                    "is already connected to "
                    "another student."
                ),
            )

        raise HTTPException(
            status_code=409,
            detail=(
                "This profile is already connected."
            ),
        )

    # ------------------------------------------
    # FETCH REAL PLATFORM DATA
    # ------------------------------------------

    try:

        if platform == "leetcode":

            platform_data = (
                fetch_leetcode_profile(
                    username
                )
            )

        else:

            platform_data = (
                fetch_github_profile(
                    username
                )
            )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except RuntimeError as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        )

    # ------------------------------------------
    # CANONICAL URL
    # ------------------------------------------

    if platform == "leetcode":

        canonical_url = (
            normalize_leetcode_url(
                username
            )
        )

    else:

        canonical_url = (
            normalize_github_url(
                username
            )
        )

    # ------------------------------------------
    # CREATE PROFILE
    # ------------------------------------------

    try:

        profile = create_external_profile(
            student_id=current_user["_id"],
            platform=platform,
            username=username,
            profile_url=canonical_url,
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=409,
            detail=(
                "This external profile "
                "is already connected."
            ),
        )

    # ------------------------------------------
    # STORE REAL STATS
    # ------------------------------------------

    updated = update_external_profile_stats(
        current_user["_id"],
        profile["_id"],
        platform_data["stats"],
    )

    # ------------------------------------------
    # RETURN PROFILE
    # ------------------------------------------

    return profile_response(
        updated
    )


@router.post(
    "/{profile_id}/refresh"
)
def refresh_profile(
    profile_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):

    # ------------------------------------------
    # VALIDATE OBJECT ID
    # ------------------------------------------

    try:

        object_id = ObjectId(
            profile_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid profile ID.",
        )

    # ------------------------------------------
    # GET PROFILE
    # ------------------------------------------

    profile = get_external_profile_by_id(
        current_user["_id"],
        object_id,
    )

    if profile is None:

        raise HTTPException(
            status_code=404,
            detail="External profile not found.",
        )

    platform = profile.get(
        "platform"
    )

    username = profile.get(
        "username"
    )

    # ------------------------------------------
    # FETCH LATEST DATA
    # ------------------------------------------

    try:

        if platform == "leetcode":

            platform_data = (
                fetch_leetcode_profile(
                    username
                )
            )

        elif platform == "github":

            platform_data = (
                fetch_github_profile(
                    username
                )
            )

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Refresh is not supported "
                    "for this platform."
                ),
            )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except RuntimeError as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        )

    # ------------------------------------------
    # UPDATE STORED STATS
    # ------------------------------------------

    updated = update_external_profile_stats(
        current_user["_id"],
        object_id,
        platform_data["stats"],
    )

    if updated is None:

        raise HTTPException(
            status_code=404,
            detail="External profile not found.",
        )

    return profile_response(
        updated
    )


@router.delete(
    "/{profile_id}"
)
def delete_profile(
    profile_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):

    try:

        object_id = ObjectId(
            profile_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid profile ID.",
        )

    deleted = delete_external_profile(
        current_user["_id"],
        object_id,
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="External profile not found.",
        )

    return {
        "message": (
            "External profile removed."
        )
    }