import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.mongodb import mongodb
from app.database.seed import seed_database


class TestTasksAndNotifications(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database(reset=True)
        mongodb.connect()
        cls.client = TestClient(app)

        # Login Mentor CSE
        res_cse = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.cse@placement.edu", "password": "Password@123"},
        )
        cls.cse_token = res_cse.json()["access_token"]
        cls.cse_headers = {"Authorization": f"Bearer {cls.cse_token}"}

        # Login Student Aravind (CSE)
        res_aravind = cls.client.post(
            "/api/auth/login",
            json={"email": "aravind@placement.edu", "password": "Password@123"},
        )
        cls.aravind_token = res_aravind.json()["access_token"]
        cls.aravind_headers = {"Authorization": f"Bearer {cls.aravind_token}"}
        cls.aravind_id = res_aravind.json()["user"]["id"]

        # Login Mentor ECE
        res_ece = cls.client.post(
            "/api/auth/login",
            json={"email": "mentor.ece@placement.edu", "password": "Password@123"},
        )
        cls.ece_token = res_ece.json()["access_token"]
        cls.ece_headers = {"Authorization": f"Bearer {cls.ece_token}"}

        # Login Student Karthik (ECE)
        res_karthik = cls.client.post(
            "/api/auth/login",
            json={"email": "karthik@placement.edu", "password": "Password@123"},
        )
        cls.karthik_token = res_karthik.json()["access_token"]
        cls.karthik_headers = {"Authorization": f"Bearer {cls.karthik_token}"}
        cls.karthik_id = res_karthik.json()["user"]["id"]

    @classmethod
    def tearDownClass(cls):
        mongodb.close()

    def test_01_mentor_creates_task_for_assigned_student(self):
        payload = {
            "student_id": self.aravind_id,
            "title": "Solve 10 LeetCode Medium Questions",
            "description": "Focus on Graphs and Dynamic Programming.",
            "priority": "HIGH",
            "due_date": "2026-10-15",
        }
        res = self.client.post("/api/tasks/mentor", headers=self.cse_headers, json=payload)
        self.assertEqual(res.status_code, 201)
        tasks = res.json()["tasks"]
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(task["title"], payload["title"])
        self.assertEqual(task["status"], "PENDING")
        self.assertEqual(task["priority"], "HIGH")
        self.__class__.task_id = task.get("id") or task.get("_id")

    def test_02_mentor_student_isolation_in_task_assignment(self):
        # Mentor CSE tries to assign a task to Karthik (ECE) -> 403 Forbidden
        payload = {
            "student_id": self.karthik_id,
            "title": "Unauthorized Task Assignment",
            "description": "Should fail due to isolation.",
            "priority": "MEDIUM",
        }
        res = self.client.post("/api/tasks/mentor", headers=self.cse_headers, json=payload)
        self.assertEqual(res.status_code, 403)
        self.assertIn("Mentor isolation enforced", res.json()["detail"])

    def test_03_student_receives_task_and_notification(self):
        # Aravind checks tasks
        res_tasks = self.client.get("/api/tasks/student", headers=self.aravind_headers)
        self.assertEqual(res_tasks.status_code, 200)
        tasks = res_tasks.json()["tasks"]
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["title"], "Solve 10 LeetCode Medium Questions")

        # Aravind checks notifications
        res_notifs = self.client.get("/api/notifications", headers=self.aravind_headers)
        self.assertEqual(res_notifs.status_code, 200)
        data = res_notifs.json()
        self.assertGreater(data["unread_count"], 0)
        notifs = data["notifications"]
        self.assertTrue(any(n["title"] == "New Task Assigned" for n in notifs))
        self.__class__.notification_id = notifs[0].get("id") or notifs[0].get("_id")

    def test_04_student_updates_task_status_and_notifies_mentor(self):
        # Mark in progress
        res_prog = self.client.patch(
            f"/api/tasks/student/{self.__class__.task_id}/status",
            headers=self.aravind_headers,
            json={"status": "IN_PROGRESS"},
        )
        self.assertEqual(res_prog.status_code, 200)
        self.assertEqual(res_prog.json()["task"]["status"], "IN_PROGRESS")

        # Mark completed
        res_comp = self.client.patch(
            f"/api/tasks/student/{self.__class__.task_id}/status",
            headers=self.aravind_headers,
            json={"status": "COMPLETED"},
        )
        self.assertEqual(res_comp.status_code, 200)
        task = res_comp.json()["task"]
        self.assertEqual(task["status"], "COMPLETED")
        self.assertIsNotNone(task.get("completed_at"))

        # Verify mentor received completion notification
        mentor_notifs = self.client.get("/api/notifications", headers=self.cse_headers).json()
        self.assertTrue(any(n["title"] == "Task Completed" for n in mentor_notifs["notifications"]))

    def test_05_mark_notification_as_read(self):
        # Mark single notification as read
        res = self.client.patch(
            f"/api/notifications/{self.__class__.notification_id}/read",
            headers=self.aravind_headers,
        )
        self.assertEqual(res.status_code, 200)

        # Mark all read
        res_all = self.client.post("/api/notifications/mark-all-read", headers=self.aravind_headers)
        self.assertEqual(res_all.status_code, 200)
        unread = self.client.get("/api/notifications", headers=self.aravind_headers).json()["unread_count"]
        self.assertEqual(unread, 0)

    def test_06_mentor_deletes_task(self):
        res = self.client.delete(
            f"/api/tasks/mentor/{self.__class__.task_id}",
            headers=self.cse_headers,
        )
        self.assertEqual(res.status_code, 200)
        # Check task list is now empty for mentor
        tasks = self.client.get("/api/tasks/mentor", headers=self.cse_headers).json()["tasks"]
        self.assertEqual(len(tasks), 0)


if __name__ == "__main__":
    unittest.main()
