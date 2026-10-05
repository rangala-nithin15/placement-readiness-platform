from typing import Optional

from pymongo.errors import DuplicateKeyError

from app.database.mongodb import mongodb


def get_users_collection():
    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database["users"]


def create_user(user_data: dict) -> dict:
    collection = get_users_collection()

    result = collection.insert_one(user_data)

    user_data["_id"] = result.inserted_id

    return user_data


def find_user_by_email(
    email: str,
) -> Optional[dict]:

    collection = get_users_collection()

    return collection.find_one(
        {
            "email": email.lower().strip()
        }
    )


def find_user_by_id(
    user_id,
) -> Optional[dict]:

    collection = get_users_collection()

    return collection.find_one(
        {
            "_id": user_id
        }
    )


def create_user_indexes() -> None:
    collection = get_users_collection()

    collection.create_index(
        "email",
        unique=True,
    )

    collection.create_index(
        "register_number",
        unique=True,
        sparse=True,
    )