from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId

from app.database.mongodb import mongodb


def get_chat_collection():
    if mongodb.database is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.database["chat_messages"]


def get_assignments_collection():
    if mongodb.database is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.database["mentor_student_assignments"]


def get_users_collection():
    if mongodb.database is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.database["users"]


def get_student_profiles_collection():
    if mongodb.database is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.database["student_profiles"]


def create_chat_indexes():
    collection = get_chat_collection()
    collection.create_index([("mentor_id", 1), ("created_at", 1)])
    collection.create_index("sender_id")


def format_chat_message(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "mentor_id": str(doc.get("mentor_id", "")),
        "sender_id": str(doc.get("sender_id", "")),
        "sender_name": doc.get("sender_name", "Anonymous"),
        "sender_role": doc.get("sender_role", "STUDENT"),
        "sender_register_number": doc.get("sender_register_number"),
        "sender_mentor_id": doc.get("sender_mentor_id"),
        "message": doc.get("message", ""),
        "created_at": (
            doc["created_at"].isoformat()
            if isinstance(doc.get("created_at"), datetime)
            else str(doc.get("created_at", ""))
        ),
    }


def create_chat_message(
    mentor_id: str,
    sender_id: str,
    sender_name: str,
    sender_role: str,
    message: str,
    sender_register_number: Optional[str] = None,
    sender_mentor_id: Optional[str] = None,
) -> dict:
    collection = get_chat_collection()
    now = datetime.utcnow()
    doc = {
        "mentor_id": str(mentor_id),
        "sender_id": str(sender_id),
        "sender_name": sender_name.strip(),
        "sender_role": sender_role.strip().upper(),
        "sender_register_number": sender_register_number,
        "sender_mentor_id": sender_mentor_id,
        "message": message.strip(),
        "created_at": now,
    }
    result = collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return format_chat_message(doc)


def get_chat_messages(
    mentor_id: str,
    limit: int = 100,
    since: Optional[datetime] = None,
) -> List[dict]:
    collection = get_chat_collection()
    query = {"mentor_id": str(mentor_id)}
    if since is not None:
        query["created_at"] = {"$gt": since}

    cursor = collection.find(query).sort("created_at", 1).limit(limit)
    return [format_chat_message(doc) for doc in cursor]


def get_mentor_group_info(mentor_id: str) -> Optional[dict]:
    users_collection = get_users_collection()
    assignments_collection = get_assignments_collection()
    students_collection = get_student_profiles_collection()

    m_ids = [mentor_id]
    try:
        m_ids.append(ObjectId(mentor_id))
    except Exception:
        pass

    mentor = users_collection.find_one({"_id": {"$in": m_ids}, "role": "MENTOR"})
    if not mentor:
        return None

    actual_mentor_id_str = str(mentor["_id"])

    # Find active assigned students
    assignments = list(
        assignments_collection.find(
            {"mentor_id": {"$in": m_ids + [actual_mentor_id_str]}, "is_active": True}
        )
    )

    members = []
    for asgn in assignments:
        raw_s_id = asgn.get("student_id")
        s_ids = [raw_s_id]
        if isinstance(raw_s_id, str):
            try:
                s_ids.append(ObjectId(raw_s_id))
            except Exception:
                pass
        elif isinstance(raw_s_id, ObjectId):
            s_ids.append(str(raw_s_id))

        student_user = users_collection.find_one(
            {"_id": {"$in": s_ids}, "role": "STUDENT"}
        )
        student_prof = students_collection.find_one(
            {
                "$or": [
                    {"_id": {"$in": s_ids}},
                    {"user_id": {"$in": s_ids}},
                ]
            }
        )

        name = ""
        reg_no = ""
        user_id_str = str(raw_s_id)
        if student_user:
            name = student_user.get("name", "")
            reg_no = student_user.get("register_number", "")
            user_id_str = str(student_user["_id"])
        elif student_prof:
            name = student_prof.get("name", "")
            reg_no = student_prof.get("register_number", "")
            if student_prof.get("user_id"):
                user_id_str = str(student_prof["user_id"])

        members.append(
            {
                "user_id": user_id_str,
                "name": name or "Student",
                "register_number": reg_no or "N/A",
                "role": "STUDENT",
            }
        )

    return {
        "room_id": actual_mentor_id_str,
        "mentor_id": actual_mentor_id_str,
        "mentor_name": mentor.get("name", "Mentor"),
        "mentor_code": mentor.get("mentor_id", ""),
        "department": mentor.get("department", ""),
        "members": members,
        "member_count": len(members) + 1,  # including mentor
    }


def get_assigned_mentor_for_student(student_user_id) -> Optional[dict]:
    assignments_collection = get_assignments_collection()
    users_collection = get_users_collection()
    students_collection = get_student_profiles_collection()

    s_ids = [student_user_id]
    if isinstance(student_user_id, str):
        try:
            s_ids.append(ObjectId(student_user_id))
        except Exception:
            pass
    elif isinstance(student_user_id, ObjectId):
        s_ids.append(str(student_user_id))

    prof = students_collection.find_one(
        {"$or": [{"_id": {"$in": s_ids}}, {"user_id": {"$in": s_ids}}]}
    )
    if prof:
        if prof.get("_id"):
            s_ids.extend([prof["_id"], str(prof["_id"])])
        if prof.get("user_id"):
            s_ids.extend([prof["user_id"], str(prof["user_id"])])

    assignment = assignments_collection.find_one(
        {"student_id": {"$in": s_ids}, "is_active": True}
    )
    if not assignment:
        return None

    m_raw_id = assignment.get("mentor_id")
    m_ids = [m_raw_id]
    if isinstance(m_raw_id, str):
        try:
            m_ids.append(ObjectId(m_raw_id))
        except Exception:
            pass
    elif isinstance(m_raw_id, ObjectId):
        m_ids.append(str(m_raw_id))

    mentor = users_collection.find_one({"_id": {"$in": m_ids}, "role": "MENTOR"})
    return mentor

