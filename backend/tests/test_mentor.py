import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.database.seed import seed_database


class TestMentorSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database(reset=True)
        mongodb.connect()
        cls.client = TestClient(app)

        # Login as Mentor CSE
        res_cse = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.cse@placement.edu", "password": "Password@123"},
        )
        cls.cse_token = res_cse.json()["access_token"]
        cls.cse_headers = {"Authorization": f"Bearer {cls.cse_token}"}

        # Login as Mentor ECE
        res_ece = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.ece@placement.edu", "password": "Password@123"},
        )
        cls.ece_token = res_ece.json()["access_token"]
        cls.ece_headers = {"Authorization": f"Bearer {cls.ece_token}"}

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def test_01_mentor_cse_sees_assigned_students(self):
        res = self.client.get("/api/mentor/students", headers=self.cse_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        students = data["students"]
        self.assertEqual(len(students), 3)
        reg_nos = [s["register_number"] for s in students]
        self.assertIn("23CSE001", reg_nos)
        self.assertIn("23CSE002", reg_nos)
        self.assertIn("23CSE003", reg_nos)
        self.assertNotIn("23ECE001", reg_nos)

    def test_02_mentor_ece_sees_only_ece_student(self):
        res = self.client.get("/api/mentor/students", headers=self.ece_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        students = data["students"]
        self.assertEqual(len(students), 1)
        self.assertEqual(students[0]["register_number"], "23ECE001")

    def test_03_mentor_can_view_assigned_student_details(self):
        # Get CSE student id
        data = self.client.get("/api/mentor/students", headers=self.cse_headers).json()
        student_id = data["students"][0]["id"]

        res = self.client.get(f"/api/mentor/students/{student_id}", headers=self.cse_headers)
        self.assertEqual(res.status_code, 200)
        detail = res.json()
        self.assertIn("student", detail)
        self.assertIn("placement", detail)
        self.assertIn("connected_profiles", detail)
        self.assertEqual(detail["student"]["name"], data["students"][0]["name"])

    def test_04_mentor_student_isolation_enforced(self):
        # Mentor ECE's student
        data = self.client.get("/api/mentor/students", headers=self.ece_headers).json()
        ece_student_id = data["students"][0]["id"]

        # Mentor CSE attempts to access Mentor ECE's student -> Must be 404
        res = self.client.get(f"/api/mentor/students/{ece_student_id}", headers=self.cse_headers)
        self.assertEqual(res.status_code, 404)
        self.assertIn("Student not found or student is not assigned to you", res.json()["detail"])


if __name__ == "__main__":
    unittest.main()
