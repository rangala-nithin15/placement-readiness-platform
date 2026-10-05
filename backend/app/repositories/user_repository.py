import re
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import mongodb
from app.services.password_service import hash_password


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


def find_user_by_email(email: str) -> Optional[dict]:
    collection = get_users_collection()

    return collection.find_one(
        {
            "email": email.lower().strip()
        }
    )


def find_user_by_register_number(register_number: str) -> Optional[dict]:
    collection = get_users_collection()

    return collection.find_one(
        {
            "register_number": register_number.strip()
        }
    )


def find_user_by_mentor_id(mentor_id: str) -> Optional[dict]:
    collection = get_users_collection()

    return collection.find_one(
        {
            "mentor_id": mentor_id.strip()
        }
    )


def find_user_by_id(user_id) -> Optional[dict]:
    collection = get_users_collection()

    if isinstance(user_id, str):
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return None

    return collection.find_one(
        {
            "_id": user_id
        }
    )


def list_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    batch: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
) -> List[dict]:
    collection = get_users_collection()

    query: dict = {}
    if role:
        query["role"] = role.upper()
    if department:
        query["department"] = department
    if batch:
        query["batch"] = batch

    return list(
        collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )


def update_user(user_id, update_data: dict) -> Optional[dict]:
    collection = get_users_collection()

    if isinstance(user_id, str):
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return None

    update_data["updated_at"] = datetime.utcnow()

    collection.update_one(
        {"_id": user_id},
        {"$set": update_data},
    )

    return collection.find_one({"_id": user_id})


def generate_mentor_id(department: str) -> str:
    collection = get_users_collection()
    clean_dept = "".join(c for c in department.upper() if c.isalnum()) or "GEN"
    # Find existing mentor count in this dept
    count = collection.count_documents(
        {
            "role": "MENTOR",
            "department": {"$regex": f"^{re.escape(department)}$", "$options": "i"},
        }
    )
    candidate = f"{clean_dept}-MENTOR-{count + 1:03d}"
    while collection.find_one({"mentor_id": candidate}):
        count += 1
        candidate = f"{clean_dept}-MENTOR-{count + 1:03d}"
    return candidate


def ensure_admin_user() -> Optional[dict]:
    collection = get_users_collection()
    admin = collection.find_one({"role": "ADMIN"})
    if admin is not None:
        return admin

    default_admin = {
        "name": "System Administrator",
        "email": "admin@placement.edu",
        "password_hash": hash_password("Admin@12345"),
        "role": "ADMIN",
        "department": "ADMIN",
        "batch": "ALL",
        "register_number": None,
        "mentor_id": None,
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result = collection.insert_one(default_admin)
        default_admin["_id"] = result.inserted_id
        print("Default admin initialized: admin@placement.edu / Admin@12345")
        return default_admin
    except DuplicateKeyError:
        return collection.find_one({"email": "admin@placement.edu"})


def create_user_indexes() -> None:
    collection = get_users_collection()

    try:
        collection.create_index(
            "email",
            unique=True,
        )
    except Exception:
        pass

    try:
        collection.create_index(
            "register_number",
            unique=True,
            partialFilterExpression={"register_number": {"$type": "string"}},
        )
    except Exception:
        pass

    try:
        collection.create_index(
            "mentor_id",
            unique=True,
            partialFilterExpression={"mentor_id": {"$type": "string"}},
        )
    except Exception:
        pass

    try:
        collection.create_index(
            "role",
        )
    except Exception:
        pass