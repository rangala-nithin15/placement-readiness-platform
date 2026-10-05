from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import mongodb


def get_notifications_collection():
    if mongodb.db is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return mongodb.db["notifications"]


def create_notification_indexes():
    collection = get_notifications_collection()
    try:
        collection.create_index([("user_id", 1)])
    except Exception:
        pass
    try:
        collection.create_index([("is_read", 1)])
    except Exception:
        pass
    try:
        collection.create_index([("created_at", -1)])
    except Exception:
        pass


def create_notification(
    user_id,
    title: str,
    message: str,
    type: str = "SYSTEM",
    link: Optional[str] = None,
) -> Dict[str, Any]:
    collection = get_notifications_collection()
    now = datetime.utcnow()
    notification = {
        "user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id,
        "title": title.strip(),
        "message": message.strip(),
        "type": type.strip().upper(),
        "link": link,
        "is_read": False,
        "created_at": now,
    }
    result = collection.insert_one(notification)
    notification["_id"] = result.inserted_id
    return notification


def get_user_notifications(user_id, limit: int = 50) -> List[Dict[str, Any]]:
    collection = get_notifications_collection()
    uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    return list(
        collection.find({"user_id": uid})
        .sort("created_at", -1)
        .limit(limit)
    )


def mark_notification_as_read(notification_id, user_id) -> bool:
    collection = get_notifications_collection()
    nid = ObjectId(notification_id) if isinstance(notification_id, str) else notification_id
    uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    result = collection.update_one(
        {"_id": nid, "user_id": uid},
        {"$set": {"is_read": True}},
    )
    return result.modified_count > 0


def mark_all_notifications_as_read(user_id) -> int:
    collection = get_notifications_collection()
    uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    result = collection.update_many(
        {"user_id": uid, "is_read": False},
        {"$set": {"is_read": True}},
    )
    return result.modified_count


def get_unread_count(user_id) -> int:
    collection = get_notifications_collection()
    uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    return collection.count_documents({"user_id": uid, "is_read": False})
