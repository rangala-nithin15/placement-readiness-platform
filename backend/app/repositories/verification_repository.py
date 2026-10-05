from datetime import datetime

from bson import ObjectId

from app.database.mongodb import mongodb


def get_verification_collection():
    if mongodb.db is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongodb.db[
        "verification_requests"
    ]


def create_verification_request(
    student_id,
    external_profile_id,
):
    collection = get_verification_collection()

    now = datetime.utcnow()

    request = {
        "student_id": student_id,
        "external_profile_id": external_profile_id,
        "status": "PENDING",
        "mentor_id": None,
        "review_note": None,
        "created_at": now,
        "updated_at": now,
        "reviewed_at": None,
    }

    result = collection.insert_one(request)

    request["_id"] = result.inserted_id

    return request


def find_pending_request(
    student_id,
    external_profile_id,
):
    collection = get_verification_collection()

    return collection.find_one(
        {
            "student_id": student_id,
            "external_profile_id": external_profile_id,
            "status": "PENDING",
        }
    )


def get_student_verification_requests(
    student_id,
):
    collection = get_verification_collection()

    return list(
        collection.find(
            {
                "student_id": student_id,
            }
        ).sort(
            "created_at",
            -1,
        )
    )


def get_verification_request_by_id(
    request_id,
):
    collection = get_verification_collection()

    return collection.find_one(
        {
            "_id": request_id,
        }
    )


def update_verification_request(
    request_id,
    status,
    mentor_id,
    review_note=None,
):
    collection = get_verification_collection()

    now = datetime.utcnow()

    collection.update_one(
        {
            "_id": request_id,
        },
        {
            "$set": {
                "status": status,
                "mentor_id": mentor_id,
                "review_note": review_note,
                "reviewed_at": now,
                "updated_at": now,
            }
        },
    )

    return get_verification_request_by_id(
        request_id
    )


def create_verification_indexes():
    collection = get_verification_collection()

    collection.create_index(
        [
            ("student_id", 1),
            ("external_profile_id", 1),
            ("status", 1),
        ]
    )

    collection.create_index(
        [
            ("student_id", 1),
            ("created_at", -1),
        ]
    )

    collection.create_index(
        [
            ("status", 1),
            ("created_at", -1),
        ]
    )