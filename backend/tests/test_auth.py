import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.database.seed import seed_database


class TestAuthAndFreshDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Reset and seed database for deterministic test state
        seed_database(reset=True)
        mongodb.connect()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def test_01_admin_login_success(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@placement.edu", "password": "Admin@12345"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "ADMIN")

    def test_02_mentor_login_success(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "mentor.cse@placement.edu", "password": "Password@123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["role"], "MENTOR")
        self.assertEqual(data["user"]["mentor_id"], "CSE-MENTOR-001")

    def test_03_student_login_success(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "aravind@placement.edu", "password": "Password@123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["role"], "STUDENT")
        self.assertEqual(data["user"]["register_number"], "23CSE001")

    def test_04_invalid_password(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "aravind@placement.edu", "password": "WrongPassword"},
        )
        self.assertEqual(response.status_code, 401)

    def test_05_student_registration_and_isolation(self):
        # Register new student
        new_student = {
            "name": "New Tester",
            "email": "newtester@placement.edu",
            "password": "Password@123",
            "register_number": "23CSE999",
            "department": "CSE",
            "batch": "2024-28",
        }
        reg_res = self.client.post("/api/auth/register", json=new_student)
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.json()["access_token"]

        # Student accesses student profile -> success
        profile_res = self.client.get(
            "/api/student/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(profile_res.status_code, 200)
        self.assertEqual(profile_res.json()["name"], "New Tester")

        # Student attempts to access mentor route -> 403 Forbidden
        mentor_res = self.client.get(
            "/api/mentor/students",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(mentor_res.status_code, 403)

        # Student attempts to access admin route -> 403 Forbidden
        admin_res = self.client.get(
            "/api/admin/overview",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(admin_res.status_code, 403)

    def test_06_duplicate_student_email_prevention(self):
        dup_student = {
            "name": "Duplicate Tester",
            "email": "newtester@placement.edu",  # already registered
            "password": "Password@123",
            "register_number": "23CSE888",
            "department": "CSE",
            "batch": "2024-28",
        }
        res = self.client.post("/api/auth/register", json=dup_student)
        self.assertEqual(res.status_code, 409)

    def test_07_duplicate_register_number_prevention(self):
        dup_student = {
            "name": "Duplicate Reg Tester",
            "email": "unique@placement.edu",
            "password": "Password@123",
            "register_number": "23CSE999",  # already used
            "department": "CSE",
            "batch": "2024-28",
        }
        res = self.client.post("/api/auth/register", json=dup_student)
        self.assertEqual(res.status_code, 409)

    def test_08_mentor_registration_auto_id(self):
        new_mentor = {
            "name": "Dr. Mechanical Mentor",
            "email": "mentor.mech@placement.edu",
            "password": "Password@123",
            "department": "MECH",
            "batch": "2024-28",
        }
        res = self.client.post("/api/auth/register-mentor", json=new_mentor)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["user"]["mentor_id"].startswith("MECH-MENTOR-"))

    def test_09_mentor_cannot_access_admin(self):
        login_res = self.client.post(
            "/api/auth/login",
            json={"email": "mentor.cse@placement.edu", "password": "Password@123"},
        )
        token = login_res.json()["access_token"]

        admin_res = self.client.get(
            "/api/admin/overview",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(admin_res.status_code, 403)

    def test_10_logout(self):
        res = self.client.post("/api/auth/logout")
        self.assertEqual(res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
