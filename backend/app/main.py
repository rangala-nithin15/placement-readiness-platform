from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.mongodb import (
    close_mongodb_connection,
    connect_to_mongodb,
)

from app.repositories.user_repository import (
    create_user_indexes,
)

from app.repositories.student_repository import (
    create_student_profile_index,
)

from app.repositories.mentor_repository import (
    create_mentor_assignment_indexes,
)

from app.repositories.external_profile_repository import (
    create_external_profile_indexes,
)

from app.api import auth
from app.api import student
from app.api import mentor
from app.api import external_profiles
from app.api import placement


app = FastAPI(
    title="Placement Readiness API",
    description=(
        "Backend API for the College Placement "
        "Readiness Platform."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
    ),
    allow_credentials=True,
    allow_methods=[
        "*"
    ],
    allow_headers=[
        "*"
    ],
)


@app.on_event("startup")
async def startup_event():

    print("")
    print("========================================")
    print("Starting Placement Readiness API")
    print("========================================")
    print("")

    # ----------------------------------------
    # CONNECT TO MONGODB
    # ----------------------------------------

    connect_to_mongodb()

    # ----------------------------------------
    # CREATE DATABASE INDEXES
    # ----------------------------------------

    print("")
    print("Creating database indexes...")

    create_user_indexes()

    create_student_profile_index()

    create_mentor_assignment_indexes()

    create_external_profile_indexes()

    print("Database indexes created.")

    print("")
    print("Placement Readiness API started.")
    print("")


@app.on_event("shutdown")
async def shutdown_event():

    print("")
    print("Shutting down Placement Readiness API...")

    close_mongodb_connection()

    print("Placement Readiness API stopped.")
    print("")


# ----------------------------------------
# AUTHENTICATION
# ----------------------------------------

app.include_router(
    auth.router,
    prefix="/api",
)


# ----------------------------------------
# STUDENT
# ----------------------------------------

app.include_router(
    student.router,
    prefix="/api",
)


# ----------------------------------------
# MENTOR
# ----------------------------------------

app.include_router(
    mentor.router,
    prefix="/api",
)


# ----------------------------------------
# EXTERNAL PROFILES
# ----------------------------------------

app.include_router(
    external_profiles.router,
    prefix="/api",
)


# ----------------------------------------
# PLACEMENT
# ----------------------------------------

app.include_router(
    placement.router,
    prefix="/api",
)


# ----------------------------------------
# ROOT
# ----------------------------------------

@app.get("/")
def root():

    return {
        "message": (
            "Placement Readiness API is running."
        ),
        "version": "1.0.0",
    }


# ----------------------------------------
# HEALTH CHECK
# ----------------------------------------

@app.get("/api/health")
def health_check():

    return {
        "status": "ok",
        "service": "Placement Readiness API",
    }