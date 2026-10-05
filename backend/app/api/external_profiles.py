from urllib.parse import urlparse

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pymongo.errors import (
    DuplicateKeyError,
)

from app.core.security import require_role

from app.repositories.external_profile_repository import (
    create_external_profile,
    find_profile_by_platform_and_username,
    find_profile_by_student_and_platform,
    get_external_profile_by_id,
    get_student_external_profiles,
    normalize_platform,
    normalize_profile_url,
    update_external_profile_stats,
)

from app.schemas.external_profile import (
    ConnectProfileRequest,
    ExternalProfileListResponse,
    ExternalProfileResponse,
)

from app.services.github_service import (
    fetch_github_statistics,
)


router = APIRouter(
    prefix="/student/profiles",
    tags=["External Profiles"],
)


SUPPORTED_PLATFORMS = {

    "leetcode": [
        "leetcode.com",
        "www.leetcode.com",
    ],

    "github": [
        "github.com",
        "www.github.com",
    ],

    "codechef": [
        "codechef.com",
        "www.codechef.com",
    ],

    "hackerrank": [
        "hackerrank.com",
        "www.hackerrank.com",
    ],

}


def extract_username_from_url(
    platform: str,
    profile_url: str,
) -> str:

    parsed = urlparse(
        profile_url
    )

    hostname = (
        parsed.netloc
        .lower()
        .split(":")[0]
    )

    allowed_hosts = (
        SUPPORTED_PLATFORMS[
            platform
        ]
    )

    if hostname not in allowed_hosts:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid {platform} "
                "profile URL."
            ),
        )

    path_parts = [

        part

        for part in parsed.path.split("/")

        if part

    ]

    if not path_parts:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Profile username "
                "could not be found."
            ),
        )

    username = path_parts[0].strip()

    if not username:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Profile username "
                "could not be found."
            ),
        )

    return username


def profile_to_response(
    profile: dict,
) -> ExternalProfileResponse:

    last_verified_at = profile.get(
        "last_verified_at"
    )

    if last_verified_at is not None:

        last_verified_at = (
            last_verified_at.isoformat()
        )

    return ExternalProfileResponse(

        id=str(
            profile["_id"]
        ),

        student_id=str(
            profile["student_id"]
        ),

        platform=profile[
            "platform"
        ],

        username=profile[
            "username"
        ],

        profile_url=profile[
            "profile_url"
        ],

        verification_status=profile.get(
            "verification_status",
            "PENDING",
        ),

        stats=profile.get(
            "stats",
            {},
        ),

        last_verified_at=
            last_verified_at,

    )


@router.post(
    "",
    response_model=ExternalProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def connect_profile(
    request: ConnectProfileRequest,

    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    platform = normalize_platform(
        request.platform
    )

    if platform not in SUPPORTED_PLATFORMS:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported platform. "
                "Supported platforms are "
                "LeetCode, GitHub, CodeChef "
                "and HackerRank."
            ),
        )


    profile_url = normalize_profile_url(
        request.profile_url
    )


    if (
        not profile_url.startswith(
            "https://"
        )
        and
        not profile_url.startswith(
            "http://"
        )
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Profile URL must start "
                "with http:// or https://."
            ),
        )


    username = extract_username_from_url(
        platform,
        profile_url,
    )


    existing_student_profile = (
        find_profile_by_student_and_platform(
            current_user["_id"],
            platform,
        )
    )


    if existing_student_profile is not None:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"You already have a "
                f"{platform} profile connected."
            ),
        )


    existing_external_profile = (
        find_profile_by_platform_and_username(
            platform,
            username,
        )
    )


    if existing_external_profile is not None:

        if (
            existing_external_profile[
                "student_id"
            ]
            == current_user["_id"]
        ):

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This profile is already "
                    "connected to your account."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This external profile is "
                "already connected to another "
                "student account."
            ),
        )


    try:

        profile = create_external_profile(

            student_id=current_user[
                "_id"
            ],

            platform=platform,

            username=username,

            profile_url=profile_url,

        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This external profile "
                "is already connected."
            ),
        )


    return profile_to_response(
        profile
    )


@router.get(
    "",
    response_model=ExternalProfileListResponse,
)
def get_my_profiles(
    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    profiles = (
        get_student_external_profiles(
            current_user["_id"]
        )
    )

    responses = [

        profile_to_response(
            profile
        )

        for profile in profiles

    ]

    return ExternalProfileListResponse(

        profiles=responses,

        total=len(
            responses
        ),

    )


@router.post(
    "/{profile_id}/refresh",
    response_model=ExternalProfileResponse,
)
def refresh_profile(
    profile_id: str,

    current_user: dict = Depends(
        require_role("STUDENT")
    ),
):

    try:

        object_id = ObjectId(
            profile_id
        )

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid profile ID.",
        )


    profile = get_external_profile_by_id(

        student_id=current_user["_id"],

        profile_id=object_id,

    )


    if profile is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )


    platform = profile[
        "platform"
    ]

    username = profile[
        "username"
    ]


    if platform != "github":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Automatic statistics "
                "are currently available "
                "only for GitHub."
            ),
        )


    try:

        stats = fetch_github_statistics(
            username
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to communicate "
                "with GitHub."
            ),
        )


    updated_profile = (
        update_external_profile_stats(

            student_id=current_user[
                "_id"
            ],

            profile_id=object_id,

            stats=stats,

        )
    )


    if updated_profile is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )


    return profile_to_response(
        updated_profile
    )