from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.database.mongodb import mongodb


def get_students_collection():

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database["student_profiles"]


def get_users_collection():

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database["users"]


def get_assignments_collection():

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.database[
        "mentor_student_assignments"
    ]


def get_mentor_by_email(
    email: str,
) -> Optional[dict]:

    collection = get_users_collection()

    return collection.find_one(
        {
            "email": email.lower().strip(),
            "role": "MENTOR",
        }
    )


def get_student_by_id(
    student_id,
) -> Optional[dict]:
    collection = get_students_collection()
    s_ids = [student_id]
    if isinstance(student_id, str):
        try:
            s_ids.append(ObjectId(student_id))
        except Exception:
            pass
    elif isinstance(student_id, ObjectId):
        s_ids.append(str(student_id))

    return collection.find_one(
        {
            "$or": [
                {"_id": {"$in": s_ids}},
                {"user_id": {"$in": s_ids}},
            ]
        }
    )


def create_assignment(
    mentor_id,
    student_id,
) -> dict:
    collection = get_assignments_collection()

    existing = collection.find_one(
        {
            "mentor_id": mentor_id,
            "student_id": student_id,
        }
    )

    if existing:
        return existing

    assignment = {
        "mentor_id": mentor_id,
        "student_id": student_id,
        "assigned_at": datetime.utcnow(),
        "is_active": True,
    }

    result = collection.insert_one(
        assignment
    )

    assignment["_id"] = result.inserted_id

    return assignment


def get_mentor_students(
    mentor_id,
) -> List[dict]:
    assignments_collection = (
        get_assignments_collection()
    )

    students_collection = (
        get_students_collection()
    )

    assignments = list(
        assignments_collection.find(
            {
                "mentor_id": mentor_id,
                "is_active": True,
            }
        )
    )

    student_ids = [
        assignment["student_id"]
        for assignment in assignments
    ]

    if not student_ids:
        return []

    return list(
        students_collection.find(
            {
                "$or": [
                    {"_id": {"$in": student_ids}},
                    {"user_id": {"$in": student_ids}},
                ]
            }
        ).sort(
            "name",
            1
        )
    )


def get_assigned_student(
    mentor_id,
    student_id,
) -> Optional[dict]:
    assignments_collection = get_assignments_collection()
    students_collection = get_students_collection()

    s_ids = [student_id]
    if isinstance(student_id, str):
        try:
            s_ids.append(ObjectId(student_id))
        except Exception:
            pass
    elif isinstance(student_id, ObjectId):
        s_ids.append(str(student_id))

    student = students_collection.find_one(
        {
            "$or": [
                {"_id": {"$in": s_ids}},
                {"user_id": {"$in": s_ids}},
            ]
        }
    )
    if student is None:
        return None

    m_ids = [mentor_id]
    if isinstance(mentor_id, str):
        try:
            m_ids.append(ObjectId(mentor_id))
        except Exception:
            pass
    elif isinstance(mentor_id, ObjectId):
        m_ids.append(str(mentor_id))

    target_student_ids = []
    if student.get("user_id"):
        target_student_ids.extend([student["user_id"], str(student["user_id"])])
    if student.get("_id"):
        target_student_ids.extend([student["_id"], str(student["_id"])])

    assignment = assignments_collection.find_one(
        {
            "mentor_id": {"$in": m_ids},
            "student_id": {"$in": target_student_ids},
            "is_active": True,
        }
    )

    if assignment is None:
        return None

    return student


def create_mentor_assignment_indexes():

    collection = (
        get_assignments_collection()
    )

    collection.create_index(
        [
            ("mentor_id", 1),
            ("student_id", 1),
        ],
        unique=True,
    )

    collection.create_index(
        "mentor_id"
    )

    collection.create_index(
        "student_id"
    )