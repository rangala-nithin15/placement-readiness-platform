import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.database.seed import seed_database


class TestExternalProfilesAndVerification(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database(reset=True)
        mongodb.connect()
        cls.client = TestClient(app)

        # Login Student Aravind (CSE)
        res_s1 = cls.client.post(
            "/api/auth/login",
            json={"email": "aravind@placement.edu", "password": "Password@123"},
        )
        cls.s1_token = res_s1.json()["access_token"]
        cls.s1_headers = {"Authorization": f"Bearer {cls.s1_token}"}

        # Login Student Bhavani (CSE)
        res_s2 = cls.client.post(
            "/api/auth/login",
            json={"email": "bhavani@placement.edu", "password": "Password@123"},
        )
        cls.s2_token = res_s2.json()["access_token"]
        cls.s2_headers = {"Authorization": f"Bearer {cls.s2_token}"}

        # Login Mentor CSE
        res_cse = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.cse@placement.edu", "password": "Password@123"},
        )
        cls.cse_token = res_cse.json()["access_token"]
        cls.cse_headers = {"Authorization": f"Bearer {cls.cse_token}"}

        # Login Mentor ECE
        res_ece = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.ece@placement.edu", "password": "Password@123"},
        )
        cls.ece_token = res_ece.json()["access_token"]
        cls.ece_headers = {"Authorization": f"Bearer {cls.ece_token}"}

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def test_01_connect_profile_and_validate(self):
        # Student connects CodeChef profile
        res = self.client.post(
            "/api/student/profiles",
            headers=self.s1_headers,
            json={
                "platform": "codechef",
                "profile_url": "https://www.codechef.com/users/aravind_coder",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["platform"], "codechef")
        self.assertEqual(data["username"], "aravind_coder")
        self.assertEqual(data["verification_status"], "PENDING")
        self.assertFalse(data.get("api_available", True))
        self.__class__.profile_id = data.get("id") or data.get("_id")

    def test_02_duplicate_platform_prevention_same_student(self):
        # Aravind tries connecting a second CodeChef profile
        res = self.client.post(
            "/api/student/profiles",
            headers=self.s1_headers,
            json={
                "platform": "codechef",
                "profile_url": "https://www.codechef.com/users/aravind_second",
            },
        )
        self.assertEqual(res.status_code, 409)

    def test_03_cross_student_profile_claim_prevention(self):
        # Bhavani tries connecting the same CodeChef handle
        res = self.client.post(
            "/api/student/profiles",
            headers=self.s2_headers,
            json={
                "platform": "codechef",
                "profile_url": "https://www.codechef.com/users/aravind_coder",
            },
        )
        self.assertEqual(res.status_code, 409)
        self.assertIn("already connected to another student", res.json()["detail"])

    def test_04_request_verification_workflow(self):
        # Aravind requests verification
        res = self.client.post(
            "/api/verification/student",
            headers=self.s1_headers,
            json={"external_profile_id": self.__class__.profile_id},
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["request"]["status"], "PENDING")
        self.__class__.request_id = data["request"].get("id") or data["request"].get("_id")

        # Duplicate pending request prevention
        dup_res = self.client.post(
            "/api/verification/student",
            headers=self.s1_headers,
            json={"external_profile_id": self.__class__.profile_id},
        )
        self.assertEqual(dup_res.status_code, 409)

    def test_05_mentor_isolation_in_verification_listing(self):
        # Mentor CSE sees Aravind's pending request
        res_cse = self.client.get("/api/verification/mentor", headers=self.cse_headers)
        self.assertEqual(res_cse.status_code, 200)
        cse_reqs = res_cse.json()["requests"]
        self.assertEqual(len(cse_reqs), 1)
        self.assertEqual(cse_reqs[0]["student"]["register_number"], "23CSE001")

        # Mentor ECE (not assigned to Aravind) sees 0 requests
        res_ece = self.client.get("/api/verification/mentor", headers=self.ece_headers)
        self.assertEqual(res_ece.status_code, 200)
        ece_reqs = res_ece.json()["requests"]
        self.assertEqual(len(ece_reqs), 0)

    def test_06_unassigned_mentor_cannot_review(self):
        # Mentor ECE tries to approve Aravind's request -> 403 Forbidden
        res = self.client.post(
            f"/api/verification/mentor/{self.__class__.request_id}/review",
            headers=self.ece_headers,
            json={"action": "APPROVE", "review_note": "Unauthorized approval attempt"},
        )
        self.assertEqual(res.status_code, 403)

    def test_07_assigned_mentor_approves_verification(self):
        # Mentor CSE approves
        res = self.client.post(
            f"/api/verification/mentor/{self.__class__.request_id}/review",
            headers=self.cse_headers,
            json={"action": "APPROVE", "review_note": "Verified GitHub/CodeChef profile."},
        )
        self.assertEqual(res.status_code, 200)

        # Check profile status is now VERIFIED
        profiles_res = self.client.get("/api/student/profiles", headers=self.s1_headers)
        self.assertEqual(profiles_res.status_code, 200)
        prof = profiles_res.json()["profiles"][0]
        self.assertEqual(prof["verification_status"], "VERIFIED")
        self.assertIsNotNone(prof["last_verified_at"])

    def test_08_re_review_already_processed_request_fails(self):
        # Reviewing again should be 409 Conflict
        res = self.client.post(
            f"/api/verification/mentor/{self.__class__.request_id}/review",
            headers=self.cse_headers,
            json={"action": "REJECT", "review_note": "Second attempt"},
        )
        self.assertEqual(res.status_code, 409)


if __name__ == "__main__":
    unittest.main()
