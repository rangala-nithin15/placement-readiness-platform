from datetime import datetime

from bson import ObjectId

from app.database.mongodb import mongodb


# ============================================================
# COLLECTION
# ============================================================

def get_profiles_collection():
    if mongodb.db is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.db["external_profiles"]


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_platform(
    platform: str,
) -> str:

    return (
        platform
        .strip()
        .lower()
    )


def normalize_username(
    username: str,
) -> str:

    return (
        username
        .strip()
        .lower()
    )


def normalize_profile_url(
    profile_url: str,
) -> str:

    url = profile_url.strip()

    while url.endswith("/"):
        url = url[:-1]

    return url


# ============================================================
# FIND PROFILE
# ============================================================

def find_profile_by_student_and_platform(
    student_id,
    platform: str,
):

    collection = get_profiles_collection()

    return collection.find_one(
        {
            "student_id": student_id,
            "platform": normalize_platform(
                platform
            ),
        }
    )


def find_profile_by_platform_and_username(
    platform: str,
    username: str,
):

    collection = get_profiles_collection()

    return collection.find_one(
        {
            "platform": normalize_platform(
                platform
            ),
            "username": normalize_username(
                username
            ),
        }
    )


def get_external_profile_by_id(
    student_id,
    profile_id,
):

    collection = get_profiles_collection()

    return collection.find_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )


# ============================================================
# CREATE PROFILE
# ============================================================

def create_external_profile(
    student_id,
    platform: str,
    username: str,
    profile_url: str,
):

    collection = get_profiles_collection()

    now = datetime.utcnow()

    profile = {
        "student_id": student_id,

        "platform": normalize_platform(
            platform
        ),

        "username": normalize_username(
            username
        ),

        "profile_url": normalize_profile_url(
            profile_url
        ),

        # IMPORTANT:
        # Public profile data does NOT prove ownership.
        # A newly connected profile therefore starts as PENDING.
        "verification_status": "PENDING",

        "stats": {},

        "last_verified_at": None,

        "created_at": now,

        "updated_at": now,
    }

    result = collection.insert_one(
        profile
    )

    profile["_id"] = result.inserted_id

    return profile


# ============================================================
# GET STUDENT PROFILES
# ============================================================

def get_student_external_profiles(
    student_id,
):

    collection = get_profiles_collection()

    return list(
        collection.find(
            {
                "student_id": student_id,
            }
        ).sort(
            "created_at",
            1,
        )
    )


# ============================================================
# UPDATE PUBLIC STATS
# ============================================================

def update_external_profile_stats(
    student_id,
    profile_id,
    stats: dict,
):

    collection = get_profiles_collection()

    existing_profile = collection.find_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )

    if existing_profile is None:
        return None

    current_status = (
        existing_profile.get(
            "verification_status"
        )
        or "PENDING"
    )

    # --------------------------------------------------------
    # IMPORTANT VERIFICATION RULE
    #
    # Fetching public LeetCode/GitHub information does NOT
    # prove that the student owns the account.
    #
    # Therefore:
    #
    # PENDING  -> remains PENDING
    # REJECTED -> remains REJECTED
    # VERIFIED -> remains VERIFIED
    #
    # Only the verification workflow can change the status.
    # --------------------------------------------------------

    if current_status not in {
        "PENDING",
        "REJECTED",
        "VERIFIED",
    }:
        current_status = "PENDING"

    now = datetime.utcnow()

    collection.update_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        },
        {
            "$set": {
                "stats": stats or {},

                "verification_status": (
                    current_status
                ),

                "updated_at": now,
            }
        },
    )

    return get_external_profile_by_id(
        student_id,
        profile_id,
    )


# ============================================================
# UPDATE VERIFICATION STATUS
# ============================================================

def update_external_profile_verification_status(
    student_id,
    profile_id,
    verification_status: str,
):

    collection = get_profiles_collection()

    allowed_statuses = {
        "PENDING",
        "VERIFIED",
        "REJECTED",
    }

    status_value = (
        verification_status
        .strip()
        .upper()
    )

    if status_value not in allowed_statuses:
        raise ValueError(
            "Invalid verification status."
        )

    existing_profile = collection.find_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )

    if existing_profile is None:
        return None

    now = datetime.utcnow()

    update_fields = {
        "verification_status": status_value,
        "updated_at": now,
    }

    # --------------------------------------------------------
    # Only VERIFIED profiles receive last_verified_at.
    # --------------------------------------------------------

    if status_value == "VERIFIED":

        update_fields[
            "last_verified_at"
        ] = now

    elif status_value == "PENDING":

        update_fields[
            "last_verified_at"
        ] = None

    elif status_value == "REJECTED":

        update_fields[
            "last_verified_at"
        ] = None

    collection.update_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        },
        {
            "$set": update_fields,
        },
    )

    return get_external_profile_by_id(
        student_id,
        profile_id,
    )


# ============================================================
# DELETE PROFILE
# ============================================================

def delete_external_profile(
    student_id,
    profile_id,
):

    collection = get_profiles_collection()

    result = collection.delete_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )

    return result.deleted_count > 0


# ============================================================
# INDEXES
# ============================================================

def create_external_profile_indexes():

    collection = get_profiles_collection()

    # --------------------------------------------------------
    # One profile per platform for each student.
    #
    # Example:
    # Student A -> LeetCode -> allowed
    # Student A -> second LeetCode -> blocked
    # --------------------------------------------------------

    collection.create_index(
        [
            (
                "student_id",
                1,
            ),
            (
                "platform",
                1,
            ),
        ],
        unique=True,
        name=(
            "unique_student_platform"
        ),
    )

    # --------------------------------------------------------
    # One external account can only belong to one student.
    #
    # Example:
    # Student A -> LeetCode -> madhesh
    # Student B -> LeetCode -> madhesh
    #                        ^
    #                        blocked
    # --------------------------------------------------------

    collection.create_index(
        [
            (
                "platform",
                1,
            ),
            (
                "username",
                1,
            ),
        ],
        unique=True,
        name=(
            "unique_platform_username"
        ),
    )

    # --------------------------------------------------------
    # Fast lookup by student.
    # --------------------------------------------------------

    collection.create_index(
        [
            (
                "student_id",
                1,
            )
        ],
        name=(
            "student_id_index"
        ),
    )

    # --------------------------------------------------------
    # Useful for verification filtering.
    # --------------------------------------------------------

    collection.create_index(
        [
            (
                "verification_status",
                1,
            )
        ],
        name=(
            "verification_status_index"
        ),
    )