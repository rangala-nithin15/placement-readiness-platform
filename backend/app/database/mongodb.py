from typing import Optional, Any
from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings


class MongoDB:
    client: Optional[MongoClient] = None
    database: Optional[Database] = None

    @property
    def db(self) -> Optional[Database]:
        return self.database

    def connect(self) -> None:
        print("Connecting to MongoDB...")
        print("MongoDB URI:", settings.mongodb_uri)

        try:
            self.client = MongoClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=5000,
            )

            # Force connection test
            self.client.admin.command("ping")

            self.database = self.client[settings.mongodb_database]

            print("MongoDB connection successful.")
            print("Database:", settings.mongodb_database)

        except Exception as error:
            self.client = None
            self.database = None
            print("MongoDB connection FAILED.")
            print("Error:", error)
            raise

    def close(self) -> None:
        if self.client is not None:
            self.client.close()
            self.client = None
            self.database = None
            print("MongoDB connection closed.")


mongodb = MongoDB()


def connect_to_mongodb() -> None:
    mongodb.connect()


def close_mongodb_connection() -> None:
    mongodb.close()