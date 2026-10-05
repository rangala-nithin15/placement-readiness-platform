from typing import Optional

from pymongo import MongoClient

from app.core.config import settings


class MongoDB:

    client: Optional[MongoClient] = None
    database = None


mongodb = MongoDB()


def connect_to_mongodb() -> None:

    print("Connecting to MongoDB...")
    print(
        "MongoDB URI:",
        settings.mongodb_uri
    )

    try:

        mongodb.client = MongoClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )

        # Force an actual connection test
        mongodb.client.admin.command("ping")

        mongodb.database = mongodb.client[
            settings.mongodb_database
        ]

        print(
            "MongoDB connection successful."
        )

        print(
            "Database:",
            settings.mongodb_database
        )

    except Exception as error:

        mongodb.client = None
        mongodb.database = None

        print(
            "MongoDB connection FAILED."
        )

        print(
            "Error:",
            error
        )

        raise


def close_mongodb_connection() -> None:

    if mongodb.client is not None:

        mongodb.client.close()

        mongodb.client = None
        mongodb.database = None

        print(
            "MongoDB connection closed."
        )