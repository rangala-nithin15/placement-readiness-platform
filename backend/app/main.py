from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.mongodb import mongodb

from app.api import (
    auth,
    student,
    mentor,
    external_profiles,
    placement,
    verification,
    admin,
    tasks,
    notifications,
    chat,
)

from app.repositories.user_repository import (
    create_user_indexes,
    ensure_admin_user,
)

from app.repositories.student_repository import (
    create_student_profile_indexes,
)

from app.repositories.mentor_repository import (
    create_mentor_assignment_indexes,
)

from app.repositories.external_profile_repository import (
    create_external_profile_indexes,
)

from app.repositories.verification_repository import (
    create_verification_indexes,
)

from app.repositories.task_repository import (
    create_task_indexes,
)

from app.repositories.notification_repository import (
    create_notification_indexes,
)

from app.repositories.chat_repository import (
    create_chat_indexes,
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Placement Readiness API",
    description=(
        "Backend API for the College Placement "
        "Readiness Platform."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=[
        "*",
    ],
    allow_headers=[
        "*",
    ],
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():

    # --------------------------------------------------------
    # Connect to MongoDB
    # --------------------------------------------------------

    mongodb.connect()

    # --------------------------------------------------------
    # Create required indexes
    # --------------------------------------------------------

    create_user_indexes()

    create_student_profile_indexes()

    create_mentor_assignment_indexes()

    create_external_profile_indexes()

    create_verification_indexes()

    create_task_indexes()

    create_notification_indexes()

    create_chat_indexes()

    ensure_admin_user()


# ============================================================
# SHUTDOWN
# ============================================================

@app.on_event("shutdown")
def shutdown_event():

    mongodb.close()


# ============================================================
# API ROUTES
# ============================================================

# ------------------------------------------------------------
# Authentication
# ------------------------------------------------------------

app.include_router(
    auth.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Student
# ------------------------------------------------------------

app.include_router(
    student.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Mentor
# ------------------------------------------------------------

app.include_router(
    mentor.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Admin
# ------------------------------------------------------------

app.include_router(
    admin.router,
    prefix="/api",
)


# ------------------------------------------------------------
# External Profiles
# ------------------------------------------------------------

app.include_router(
    external_profiles.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Placement
# ------------------------------------------------------------

app.include_router(
    placement.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Verification
# ------------------------------------------------------------

app.include_router(
    verification.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Tasks
# ------------------------------------------------------------

app.include_router(
    tasks.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Notifications
# ------------------------------------------------------------

app.include_router(
    notifications.router,
    prefix="/api",
)


# ------------------------------------------------------------
# Chat (WhatsApp-Style Mentorship Group Chat)
# ------------------------------------------------------------

app.include_router(
    chat.router,
    prefix="/api",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Placement Readiness API is running.",
        "status": "ok",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "service": "placement-readiness-api",
    }