import sys
from datetime import datetime
from pymongo import MongoClient

from app.core.config import settings
from app.database.mongodb import mongodb
from app.services.password_service import hash_password
from app.repositories.user_repository import (
    create_user_indexes,
    create_user,
)
from app.repositories.student_repository import (
    create_student_profile_indexes,
    create_student_profile,
)
from app.repositories.mentor_repository import (
    create_mentor_assignment_indexes,
    create_assignment,
)
from app.repositories.external_profile_repository import (
    create_external_profile_indexes,
)
from app.repositories.verification_repository import (
    create_verification_indexes,
)


def seed_database(reset: bool = True):
    print("==================================================")
    print("PLACEMENT READINESS PLATFORM - DATABASE SEED")
    print("==================================================")

    mongodb.connect()
    db = mongodb.database

    if reset:
        print("Resetting existing collections...")
        collections_to_clear = [
            "users",
            "student_profiles",
            "mentor_student_assignments",
            "external_profiles",
            "verification_requests",
            "tasks",
            "chat_messages",
            "notifications",
        ]
        for col in collections_to_clear:
            db[col].drop()
            print(f"  - Dropped {col}")

    # Recreate all indexes
    print("Ensuring indexes...")
    create_user_indexes()
    create_student_profile_indexes()
    create_mentor_assignment_indexes()
    create_external_profile_indexes()
    create_verification_indexes()

    # 1. ADMIN
    print("Creating System Admin...")
    admin = create_user({
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
    })
    print(f"  [ADMIN]  {admin['email']} (Password: Admin@12345)")

    # 2. MENTORS
    print("Creating Mentors...")
    mentor_cse = create_user({
        "name": "Dr. Rajesh Kumar",
        "email": "mentor.cse@placement.edu",
        "password_hash": hash_password("Password@123"),
        "role": "MENTOR",
        "mentor_id": "CSE-MENTOR-001",
        "register_number": None,
        "department": "CSE",
        "batch": "2024-28",
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    print(f"  [MENTOR] {mentor_cse['name']} ({mentor_cse['mentor_id']}) - {mentor_cse['email']}")

    mentor_ece = create_user({
        "name": "Dr. Anitha Sharma",
        "email": "mentor.ece@placement.edu",
        "password_hash": hash_password("Password@123"),
        "role": "MENTOR",
        "mentor_id": "ECE-MENTOR-001",
        "register_number": None,
        "department": "ECE",
        "batch": "2024-28",
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    print(f"  [MENTOR] {mentor_ece['name']} ({mentor_ece['mentor_id']}) - {mentor_ece['email']}")

    # 3. STUDENTS
    print("Creating Students...")
    students_data = [
        {
            "name": "Aravind Swaminathan",
            "email": "aravind@placement.edu",
            "register_number": "23CSE001",
            "department": "CSE",
            "batch": "2024-28",
            "assigned_mentor": mentor_cse["_id"],
        },
        {
            "name": "Bhavani Shankar",
            "email": "bhavani@placement.edu",
            "register_number": "23CSE002",
            "department": "CSE",
            "batch": "2024-28",
            "assigned_mentor": mentor_cse["_id"],
        },
        {
            "name": "Deepa Ramesh",
            "email": "deepa@placement.edu",
            "register_number": "23CSE003",
            "department": "CSE",
            "batch": "2024-28",
            "assigned_mentor": mentor_cse["_id"],
        },
        {
            "name": "Karthik Raja",
            "email": "karthik@placement.edu",
            "register_number": "23ECE001",
            "department": "ECE",
            "batch": "2024-28",
            "assigned_mentor": mentor_ece["_id"],
        },
    ]

    for s_info in students_data:
        s_user = create_user({
            "name": s_info["name"],
            "email": s_info["email"],
            "password_hash": hash_password("Password@123"),
            "role": "STUDENT",
            "register_number": s_info["register_number"],
            "mentor_id": None,
            "department": s_info["department"],
            "batch": s_info["batch"],
            "is_active": True,
            "is_approved": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        create_student_profile(s_user)

        # Assign to mentor
        create_assignment(
            mentor_id=s_info["assigned_mentor"],
            student_id=s_user["_id"],
        )
        print(f"  [STUDENT] {s_user['name']} ({s_user['register_number']}) -> Assigned")

    mongodb.close()
    print("==================================================")
    print("DATABASE SEED COMPLETED SUCCESSFULLY")
    print("==================================================")
    print("Ready to run. Logins:")
    print("  Admin:   admin@placement.edu / Admin@12345")
    print("  Mentor:  mentor.cse@placement.edu / Password@123")
    print("  Mentor:  mentor.ece@placement.edu / Password@123")
    print("  Student: aravind@placement.edu / Password@123")
    print("==================================================")


if __name__ == "__main__":
    reset = "--no-reset" not in sys.argv
    seed_database(reset=reset)
