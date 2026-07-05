import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure the backend directory is in the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Temporary test database URL
os.environ["DATABASE_URL"] = "sqlite:///./test_finrelief_epic5.db"
# Clear Gemini API key to test the fallback engine
os.environ["GEMINI_API_KEY"] = ""

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement_record import SettlementRecord
from app.models.ai_history import AIHistory

class Epic5E2ETest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_finrelief_epic5.db"):
            os.remove("./test_finrelief_epic5.db")

    def setUp(self):
        db = SessionLocal()
        db.query(AIHistory).delete()
        db.query(SettlementRecord).delete()
        db.query(FinancialProfile).delete()
        db.query(Loan).delete()
        db.query(User).delete()
        db.commit()
        db.close()

    def test_complete_e2e_user_flow(self):
        # 1. Register user
        reg_payload = {
            "email": "e2e@example.com",
            "password": "securepassword123",
            "full_name": "E2E User"
        }
        res_reg = self.client.post("/api/v1/auth/register", json=reg_payload)
        self.assertEqual(res_reg.status_code, 201)
        self.assertTrue(res_reg.json()["success"])
        self.assertEqual(res_reg.json()["data"]["email"], "e2e@example.com")

        # 2. Login user
        login_payload = {
            "email": "e2e@example.com",
            "password": "securepassword123"
        }
        res_login = self.client.post("/api/v1/auth/login/json", json=login_payload)
        self.assertEqual(res_login.status_code, 200)
        self.assertTrue(res_login.json()["success"])
        token = res_login.json()["data"]["access_token"]
        self.assertIsNotNone(token)

        # 3. JWT verification / Access protected routes
        headers = {"Authorization": f"Bearer {token}"}
        res_me = self.client.get("/api/v1/auth/me", headers=headers)
        self.assertEqual(res_me.status_code, 200)
        self.assertTrue(res_me.json()["success"])
        self.assertEqual(res_me.json()["data"]["email"], "e2e@example.com")

        # 4. Fetch dashboard data (financial health)
        # First calculate profile inputs
        calc_payload = {
            "monthly_income": 60000.0,
            "monthly_expenses": 25000.0
        }
        res_calc = self.client.post("/api/v1/financial/calculate", json=calc_payload, headers=headers)
        self.assertEqual(res_calc.status_code, 200)
        self.assertTrue(res_calc.json()["success"])

        # Fetch health details
        res_health = self.client.get("/api/v1/financial/health", headers=headers)
        self.assertEqual(res_health.status_code, 200)
        self.assertTrue(res_health.json()["success"])
        self.assertEqual(res_health.json()["data"]["monthly_income"], 60000.0)

        # 5. Add loan
        loan_payload = {
            "loan_type": "personal",
            "lender_name": "Chase Bank",
            "original_amount": 200000.0,
            "outstanding_amount": 150000.0,
            "interest_rate": 18.0,
            "emi_amount": 10000.0,
            "tenure_months": 24,
            "overdue_months": 5,
            "status": "active"
        }
        res_add = self.client.post("/api/v1/loans", json=loan_payload, headers=headers)
        self.assertEqual(res_add.status_code, 201)
        self.assertTrue(res_add.json()["success"])
        loan_id = res_add.json()["data"]["id"]
        self.assertIsNotNone(loan_id)

        # 6. Edit loan
        edit_payload = {
            "lender_name": "Chase Bank International",
            "outstanding_amount": 140000.0
        }
        res_edit = self.client.put(f"/api/v1/loans/{loan_id}", json=edit_payload, headers=headers)
        self.assertEqual(res_edit.status_code, 200)
        self.assertTrue(res_edit.json()["success"])
        self.assertEqual(res_edit.json()["data"]["lender_name"], "Chase Bank International")
        self.assertEqual(res_edit.json()["data"]["outstanding_amount"], 140000.0)

        # 7. Run settlement prediction
        res_pred = self.client.post("/api/v1/settlement/predict", json={"loan_id": loan_id}, headers=headers)
        self.assertEqual(res_pred.status_code, 200)
        self.assertTrue(res_pred.json()["success"])
        pred_data = res_pred.json()["data"]
        self.assertEqual(pred_data["loan_id"], loan_id)
        self.assertTrue(pred_data["recommended_percentage"] > 0)
        self.assertEqual(pred_data["outstanding_amount"], 140000.0)

        # 8. Generate negotiation letter (Gemini fallback mode since GEMINI_API_KEY="")
        letter_payload = {
            "borrower_name": "E2E User",
            "lender_name": "Chase Bank International",
            "loan_type": "personal",
            "outstanding_amount": 140000.0,
            "proposed_settlement_amount": 70000.0,
            "overdue_months": 5,
            "reason": "medical bills"
        }
        res_letter = self.client.post("/api/v1/ai/generate-letter", json=letter_payload, headers=headers)
        self.assertEqual(res_letter.status_code, 200)
        self.assertTrue(res_letter.json()["success"])
        letter_data = res_letter.json()["data"]
        self.assertTrue(letter_data["is_fallback"])
        self.assertEqual(letter_data["model_used"], "fallback")
        self.assertIn("Chase Bank International", letter_data["letter"])
        self.assertIn("medical bills", letter_data["letter"])

        # Chat with counselor
        chat_payload = {"message": "How can I negotiate with Chase Bank?"}
        res_chat = self.client.post("/api/v1/ai/chat", json=chat_payload, headers=headers)
        self.assertEqual(res_chat.status_code, 200)
        self.assertTrue(res_chat.json()["success"])
        self.assertTrue(res_chat.json()["data"]["is_fallback"])

        # 9. View AI history
        res_hist = self.client.get("/api/v1/history/ai", headers=headers)
        self.assertEqual(res_hist.status_code, 200)
        self.assertTrue(res_hist.json()["success"])
        hist_data = res_hist.json()["data"]
        self.assertEqual(hist_data["total"], 2)  # 1 for letter, 1 for chat
        records = hist_data["records"]
        request_types = [r["request_type"] for r in records]
        self.assertIn("letter", request_types)
        self.assertIn("chat", request_types)

        # 10. Delete loan
        res_del = self.client.delete(f"/api/v1/loans/{loan_id}", headers=headers)
        self.assertEqual(res_del.status_code, 200)
        self.assertTrue(res_del.json()["success"])

        # Verify loan is deleted
        res_get_del = self.client.get(f"/api/v1/loans/{loan_id}", headers=headers)
        self.assertEqual(res_get_del.status_code, 404)
