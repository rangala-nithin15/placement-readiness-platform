import unittest
from datetime import datetime
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.core.security import get_current_user
from app.database.seed import seed_database
from app.repositories.chat_repository import (
    create_chat_message,
    get_chat_messages,
    get_mentor_group_info,
    get_assigned_mentor_for_student,
)

client = TestClient(app)


class TestChatSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database(reset=True)
        mongodb.connect()

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def setUp(self):
        self.users_col = mongodb.database["users"]
        self.mentor_cse = self.users_col.find_one({"email": "mentor.cse@placement.edu"})
        self.mentor_ece = self.users_col.find_one({"email": "mentor.ece@placement.edu"})
        self.student_aravind = self.users_col.find_one({"email": "aravind@placement.edu"})
        self.student_karthik = self.users_col.find_one({"email": "karthik@placement.edu"})

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_mentor_group_info(self):
        """Mentor CSE group info should contain CSE mentor and assigned students"""
        group_info = get_mentor_group_info(str(self.mentor_cse["_id"]))
        self.assertIsNotNone(group_info)
        self.assertEqual(group_info["mentor_name"], "Dr. Rajesh Kumar")
        self.assertEqual(group_info["department"], "CSE")
        # Assigned students in seed: Aravind, Bhavani, Deepa (3 students + mentor = 4)
        self.assertGreaterEqual(len(group_info["members"]), 3)

    def test_student_assigned_mentor_lookup(self):
        """Student Aravind (CSE) should be assigned to Dr. Rajesh Kumar (CSE)"""
        mentor = get_assigned_mentor_for_student(self.student_aravind["_id"])
        self.assertIsNotNone(mentor)
        self.assertEqual(mentor["email"], "mentor.cse@placement.edu")

        """Student Karthik (ECE) should be assigned to Dr. Anitha Sharma (ECE)"""
        mentor_ece = get_assigned_mentor_for_student(self.student_karthik["_id"])
        self.assertIsNotNone(mentor_ece)
        self.assertEqual(mentor_ece["email"], "mentor.ece@placement.edu")

    def test_mentor_get_chat_group_api(self):
        """Mentor should get their group metadata and messages"""
        app.dependency_overrides[get_current_user] = lambda: self.mentor_cse
        response = client.get("/api/chat/group")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["group"]["mentor_code"], "CSE-MENTOR-001")
        self.assertIn("messages", data)

    def test_student_get_chat_group_api(self):
        """Assigned student should get their assigned mentor's group"""
        app.dependency_overrides[get_current_user] = lambda: self.student_aravind
        response = client.get("/api/chat/group")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["group"]["mentor_code"], "CSE-MENTOR-001")

    def test_mentor_and_student_chat_interaction(self):
        """Mentor posts a message, then student posts a reply in the same group"""
        # 1. Mentor sends message
        app.dependency_overrides[get_current_user] = lambda: self.mentor_cse
        res1 = client.post("/api/chat/messages", json={"message": "Welcome all mentees! Let's schedule our mock interviews."})
        self.assertEqual(res1.status_code, 200)
        msg1 = res1.json()["message"]
        self.assertEqual(msg1["sender_role"], "MENTOR")
        self.assertEqual(msg1["sender_name"], "Dr. Rajesh Kumar")

        # 2. Student sends message
        app.dependency_overrides[get_current_user] = lambda: self.student_aravind
        res2 = client.post("/api/chat/messages", json={"message": "Thank you sir! Ready for the session."})
        self.assertEqual(res2.status_code, 200)
        msg2 = res2.json()["message"]
        self.assertEqual(msg2["sender_role"], "STUDENT")
        self.assertEqual(msg2["sender_register_number"], "23CSE001")

        # 3. Check group messages
        res3 = client.get("/api/chat/messages")
        self.assertEqual(res3.status_code, 200)
        messages = res3.json()["messages"]
        self.assertGreaterEqual(len(messages), 2)
        contents = [m["message"] for m in messages]
        self.assertIn("Welcome all mentees! Let's schedule our mock interviews.", contents)
        self.assertIn("Thank you sir! Ready for the session.", contents)

    def test_group_chat_isolation(self):
        """Student from ECE (Karthik) cannot see CSE group messages"""
        app.dependency_overrides[get_current_user] = lambda: self.student_karthik
        res = client.get("/api/chat/group")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # Should be ECE mentor
        self.assertEqual(data["group"]["mentor_code"], "ECE-MENTOR-001")
        # CSE messages must NOT be in ECE group
        contents = [m["message"] for m in data["messages"]]
        self.assertNotIn("Welcome all mentees! Let's schedule our mock interviews.", contents)

    def test_empty_message_validation(self):
        """Empty message should return 422 Unprocessable Entity"""
        app.dependency_overrides[get_current_user] = lambda: self.student_aravind
        res = client.post("/api/chat/messages", json={"message": "   "})
        self.assertEqual(res.status_code, 422)


if __name__ == "__main__":
    unittest.main()
