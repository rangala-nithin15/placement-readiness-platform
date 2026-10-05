import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.database.seed import seed_database


class TestStudentSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database(reset=True)
        mongodb.connect()
        cls.client = TestClient(app)

        # Login as student
        res = cls.client.post(
            "/api/auth/login",
            json={"email": "aravind@placement.edu", "password": "Password@123"},
        )
        cls.token = res.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def test_01_get_student_profile(self):
        res = self.client.get("/api/student/profile", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["name"], "Aravind Swaminathan")
        self.assertEqual(data["register_number"], "23CSE001")
        self.assertEqual(data["department"], "CSE")

    def test_02_update_student_profile_and_completion(self):
        update_payload = {
            "phone": "+91 9876543210",
            "location": "Chennai, India",
            "linkedin_url": "https://linkedin.com/in/aravind-test",
            "cgpa": 8.75,
            "tenth_percentage": 92.5,
            "twelfth_percentage": 89.0,
            "backlogs": 0,
            "skills": ["Python", "FastAPI", "React", "MongoDB"],
            "career_interests": ["Full Stack Developer", "Software Engineer"],
        }
        res = self.client.put(
            "/api/student/profile",
            headers=self.headers,
            json=update_payload,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["cgpa"], 8.75)
        self.assertEqual(len(data["skills"]), 4)
        self.assertEqual(data["phone"], "+91 9876543210")
        # Profile completion should now be 100% since all 13 fields are filled!
        self.assertEqual(data["profile_completion"], 100)

    def test_03_student_placement_calculation(self):
        res = self.client.get("/api/student/placement", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_score", data)
        self.assertEqual(data["maximum_score"], 250)
        self.assertIn("parameter_scores", data)
        self.assertEqual(len(data["parameter_scores"]), 12)
        self.assertIn("conditions", data)


if __name__ == "__main__":
    unittest.main()
