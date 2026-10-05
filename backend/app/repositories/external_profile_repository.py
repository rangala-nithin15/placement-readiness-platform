from datetime import datetime
from typing import List, Optional

from app.database.mongodb import mongodb


def get_profiles_collection():

    if mongodb.database is None:

        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database[
        "external_profiles"
    ]


def normalize_platform(
    platform: str,
) -> str:

    return platform.strip().lower()


def normalize_profile_url(
    profile_url: str,
) -> str:

    url = profile_url.strip()

    if url.endswith("/"):
        url = url[:-1]

    return url


def find_profile_by_student_and_platform(
    student_id,
    platform: str,
) -> Optional[dict]:

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
) -> Optional[dict]:

    collection = get_profiles_collection()

    return collection.find_one(
        {
            "platform": normalize_platform(
                platform
            ),
            "username": username.lower().strip(),
        }
    )


def create_external_profile(
    student_id,
    platform: str,
    username: str,
    profile_url: str,
) -> dict:

    collection = get_profiles_collection()

    profile = {

        "student_id": student_id,

        "platform": normalize_platform(
            platform
        ),

        "username": username.lower().strip(),

        "profile_url": normalize_profile_url(
            profile_url
        ),

        "verification_status": "PENDING",

        "stats": {},

        "last_verified_at": None,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow(),

    }

    result = collection.insert_one(
        profile
    )

    profile["_id"] = result.inserted_id

    return profile


def get_student_external_profiles(
    student_id,
) -> List[dict]:

    collection = get_profiles_collection()

    return list(
        collection.find(
            {
                "student_id": student_id
            }
        ).sort(
            "platform",
            1
        )
    )


def get_external_profile_by_id(
    student_id,
    profile_id,
) -> Optional[dict]:

    collection = get_profiles_collection()

    return collection.find_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )


def update_external_profile_stats(
    student_id,
    profile_id,
    stats: dict,
) -> Optional[dict]:

    collection = get_profiles_collection()

    collection.update_one(

        {
            "_id": profile_id,
            "student_id": student_id,
        },

        {
            "$set": {

                "stats": stats,

                "verification_status":
                    "VERIFIED",

                "last_verified_at":
                    datetime.utcnow(),

                "updated_at":
                    datetime.utcnow(),

            }
        }
    )

    return collection.find_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )


def delete_external_profile(
    student_id,
    profile_id,
) -> bool:

    collection = get_profiles_collection()

    result = collection.delete_one(
        {
            "_id": profile_id,
            "student_id": student_id,
        }
    )

    return result.deleted_count > 0


def create_external_profile_indexes():

    collection = get_profiles_collection()

    collection.create_index(

        [
            ("student_id", 1),
            ("platform", 1),
        ],

        unique=True,

    )

    collection.create_index(

        [
            ("platform", 1),
            ("username", 1),
        ],

        unique=True,

    )

    collection.create_index(
        "student_id"
    )