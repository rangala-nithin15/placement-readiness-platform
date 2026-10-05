from datetime import datetime
from typing import Optional

from bson import ObjectId

from app.database.mongodb import mongodb


def get_students_collection():

    if mongodb.database is None:

        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database["student_profiles"]


def create_student_profile(
    user: dict,
) -> dict:

    collection = get_students_collection()

    existing = collection.find_one(
        {
            "user_id": user["_id"]
        }
    )

    if existing:

        return existing


    profile = {

        "user_id": user["_id"],

        "name": user.get(
            "name",
            ""
        ),

        "email": user.get(
            "email",
            ""
        ),

        "register_number": user.get(
            "register_number"
        ),

        "department": user.get(
            "department"
        ),

        "batch": user.get(
            "batch"
        ),

        "phone": None,

        "location": None,

        "linkedin_url": None,

        "cgpa": None,

        "tenth_percentage": None,

        "twelfth_percentage": None,

        "backlogs": 0,

        "skills": [],

        "career_interests": [],

        "profile_completion": 0,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow(),

    }


    result = collection.insert_one(
        profile
    )

    profile["_id"] = result.inserted_id

    return profile


def get_student_profile(
    user_id: ObjectId,
) -> Optional[dict]:

    collection = get_students_collection()

    return collection.find_one(
        {
            "user_id": user_id
        }
    )


def update_student_profile(
    user_id: ObjectId,
    update_data: dict,
) -> Optional[dict]:

    collection = get_students_collection()

    update_data["updated_at"] = (
        datetime.utcnow()
    )

    collection.update_one(

        {
            "user_id": user_id
        },

        {
            "$set": update_data
        }

    )

    return collection.find_one(
        {
            "user_id": user_id
        }
    )


def create_student_profile_index():

    collection = get_students_collection()

    collection.create_index(
        "user_id",
        unique=True,
    )
def create_student_profile_indexes():
    collection = get_student_profiles_collection()

    collection.create_index(
        [("user_id", 1)],
        unique=True,
    )

    collection.create_index(
        [("register_number", 1)],
        unique=True,
        sparse=True,
    )

    collection.create_index(
        [("department", 1), ("batch", 1)],
    )

    collection.create_index(
        [("batch", 1)],
    )    