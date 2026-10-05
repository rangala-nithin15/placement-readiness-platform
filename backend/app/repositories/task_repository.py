from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import mongodb


def get_tasks_collection():
    if mongodb.db is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.db["tasks"]


def create_task_indexes():
    collection = get_tasks_collection()
    try:
        collection.create_index([("student_id", 1)])
    except Exception:
        pass
    try:
        collection.create_index([("mentor_id", 1)])
    except Exception:
        pass
    try:
        collection.create_index([("status", 1)])
    except Exception:
        pass
    try:
        collection.create_index([("created_at", -1)])
    except Exception:
        pass


def create_task(
    mentor_id,
    student_id,
    title: str,
    description: str,
    priority: str = "MEDIUM",
    due_date: Optional[str] = None,
) -> Dict[str, Any]:
    collection = get_tasks_collection()
    now = datetime.utcnow()
    task = {
        "mentor_id": ObjectId(mentor_id) if isinstance(mentor_id, str) else mentor_id,
        "student_id": ObjectId(student_id) if isinstance(student_id, str) else student_id,
        "title": title.strip(),
        "description": description.strip(),
        "priority": priority.strip().upper(),
        "due_date": due_date,
        "status": "PENDING",
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }
    result = collection.insert_one(task)
    task["_id"] = result.inserted_id
    return task


def get_student_tasks(student_id) -> List[Dict[str, Any]]:
    collection = get_tasks_collection()
    s_ids = [student_id]
    if isinstance(student_id, str):
        try:
            s_ids.append(ObjectId(student_id))
        except Exception:
            pass
    elif isinstance(student_id, ObjectId):
        s_ids.append(str(student_id))
    return list(collection.find({"student_id": {"$in": s_ids}}).sort("created_at", -1))


def get_mentor_tasks(mentor_id) -> List[Dict[str, Any]]:
    collection = get_tasks_collection()
    m_ids = [mentor_id]
    if isinstance(mentor_id, str):
        try:
            m_ids.append(ObjectId(mentor_id))
        except Exception:
            pass
    elif isinstance(mentor_id, ObjectId):
        m_ids.append(str(mentor_id))
    return list(collection.find({"mentor_id": {"$in": m_ids}}).sort("created_at", -1))


def get_task_by_id(task_id) -> Optional[Dict[str, Any]]:
    collection = get_tasks_collection()
    tid = ObjectId(task_id) if isinstance(task_id, str) else task_id
    return collection.find_one({"_id": tid})


def update_task_status(task_id, student_id, new_status: str) -> Optional[Dict[str, Any]]:
    collection = get_tasks_collection()
    tid = ObjectId(task_id) if isinstance(task_id, str) else task_id
    sid = ObjectId(student_id) if isinstance(student_id, str) else student_id

    status_upper = new_status.strip().upper()
    now = datetime.utcnow()
    update_data = {
        "status": status_upper,
        "updated_at": now,
    }
    if status_upper == "COMPLETED":
        update_data["completed_at"] = now
    else:
        update_data["completed_at"] = None

    collection.update_one(
        {"_id": tid, "student_id": sid},
        {"$set": update_data},
    )
    return collection.find_one({"_id": tid, "student_id": sid})


def delete_task(task_id, mentor_id) -> bool:
    collection = get_tasks_collection()
    tid = ObjectId(task_id) if isinstance(task_id, str) else task_id
    mid = ObjectId(mentor_id) if isinstance(mentor_id, str) else mentor_id
    result = collection.delete_one({"_id": tid, "mentor_id": mid})
    return result.deleted_count > 0
