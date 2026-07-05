import sys
import os
import shutil
import unittest
from fastapi.testclient import TestClient

# Ensure the backend directory is in the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


# Temporary test database URL
os.environ["DATABASE_URL"] = "sqlite:///./test_finrelief.db"
# Mock Gemini API key to ensure service is initialized or disabled properly
os.environ["GEMINI_API_KEY"] = ""

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement_record import SettlementRecord
from app.models.ai_history import AIHistory

class Epic3Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create all tables in the test database
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Clean up database
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_finrelief.db"):
            os.remove("./test_finrelief.db")


    def setUp(self):
        # Clear tables before each test
        db = SessionLocal()
        db.query(AIHistory).delete()
        db.query(SettlementRecord).delete()
        db.query(FinancialProfile).delete()
        db.query(Loan).delete()
        db.query(User).delete()
        db.commit()
        db.close()

    def test_1_user_registration_and_login_flow(self):
        # 1. Register user with invalid password (too short)
        reg_short_payload = {
            "email": "test@example.com",
            "password": "123",
            "full_name": "Test User"
        }
        response = self.client.post("/api/v1/auth/register", json=reg_short_payload)
        self.assertEqual(response.status_code, 422)
        json_data = response.json()
        self.assertFalse(json_data["success"])
        self.assertEqual(json_data["message"], "Validation Error")
        self.assertIn("error", json_data)

        # 2. Register user with valid data
        reg_payload = {
            "email": "test@example.com",
            "password": "securepassword123",
            "full_name": "Test User"
        }
        response = self.client.post("/api/v1/auth/register", json=reg_payload)
        self.assertEqual(response.status_code, 201)
        json_data = response.json()
        self.assertTrue(json_data["success"])
        self.assertEqual(json_data["message"], "User registered successfully")
        self.assertEqual(json_data["data"]["email"], "test@example.com")
        self.assertIsNotNone(json_data["data"]["id"])

        # 3. Register user with duplicate email
        response = self.client.post("/api/v1/auth/register", json=reg_payload)
        self.assertEqual(response.status_code, 400)
        json_data = response.json()
        self.assertFalse(json_data["success"])
        self.assertEqual(json_data["message"], "A user with this email already exists.")

        # 4. Login JSON with valid credentials
        login_payload = {
            "email": "test@example.com",
            "password": "securepassword123"
        }
        response = self.client.post("/api/v1/auth/login/json", json=login_payload)
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertTrue(json_data["success"])
        self.assertIn("access_token", json_data["data"])
        self.assertEqual(json_data["data"]["token_type"], "bearer")

        # 5. Login JSON with invalid password
        login_invalid_payload = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/v1/auth/login/json", json=login_invalid_payload)
        self.assertEqual(response.status_code, 400)
        json_data = response.json()
        self.assertFalse(json_data["success"])
        self.assertEqual(json_data["message"], "Incorrect email or password")

    def test_2_jwt_protection_and_user_isolation(self):
        # 1. Attempt access to /me without token
        response = self.client.get("/api/v1/auth/me")
        self.assertEqual(response.status_code, 401)
        json_data = response.json()
        self.assertFalse(json_data["success"])
        self.assertEqual(json_data["message"], "Not authenticated")

        # 2. Register User A and User B
        user_a_payload = {"email": "usera@example.com", "password": "password123", "full_name": "User A"}
        user_b_payload = {"email": "userb@example.com", "password": "password123", "full_name": "User B"}
        
        self.client.post("/api/v1/auth/register", json=user_a_payload)
        self.client.post("/api/v1/auth/register", json=user_b_payload)

        # Login User A
        login_a = self.client.post("/api/v1/auth/login/json", json={"email": "usera@example.com", "password": "password123"})
        token_a = login_a.json()["data"]["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Login User B
        login_b = self.client.post("/api/v1/auth/login/json", json={"email": "userb@example.com", "password": "password123"})
        token_b = login_b.json()["data"]["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A creates a loan
        loan_payload = {
            "loan_type": "personal",
            "lender_name": "HDFC Bank",
            "original_amount": 100000.0,
            "outstanding_amount": 80000.0,
            "interest_rate": 12.5,
            "emi_amount": 5000.0,
            "tenure_months": 24,
            "overdue_months": 4,
            "status": "active"
        }
        res_loan = self.client.post("/api/v1/loans", json=loan_payload, headers=headers_a)
        self.assertEqual(res_loan.status_code, 201)
        loan_id = res_loan.json()["data"]["id"]

        # User B lists loans (should be empty)
        res_list_b = self.client.get("/api/v1/loans", headers=headers_b)
        self.assertEqual(res_list_b.json()["data"]["total"], 0)

        # User B attempts to access User A's loan directly (should be 404/not found to isolate existence details)
        res_get_b = self.client.get(f"/api/v1/loans/{loan_id}", headers=headers_b)
        self.assertEqual(res_get_b.status_code, 404)

        # User A successfully retrieves own loan
        res_get_a = self.client.get(f"/api/v1/loans/{loan_id}", headers=headers_a)
        self.assertEqual(res_get_a.status_code, 200)
        self.assertEqual(res_get_a.json()["data"]["outstanding_amount"], 80000.0)

    def test_3_loan_processing_and_automatic_calculations(self):
        # Register and Login
        user_payload = {"email": "calc@example.com", "password": "password123", "full_name": "Calc User"}
        self.client.post("/api/v1/auth/register", json=user_payload)
        login_res = self.client.post("/api/v1/auth/login/json", json={"email": "calc@example.com", "password": "password123"})
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Set Financial Profile Income and Expenses first
        fin_payload = {
            "monthly_income": 50000.0,
            "monthly_expenses": 20000.0
        }
        res_calc = self.client.post("/api/v1/financial/calculate", json=fin_payload, headers=headers)
        self.assertEqual(res_calc.status_code, 200)
        self.assertEqual(res_calc.json()["data"]["financial_health_score"], 100.0) # No debt yet

        # 2. Add a loan (should automatically calculate profile and settlement records)
        loan_payload = {
            "loan_type": "personal",
            "lender_name": "SBI Bank",
            "original_amount": 500000.0,
            "outstanding_amount": 400000.0,
            "interest_rate": 15.0,
            "emi_amount": 15000.0,
            "tenure_months": 36,
            "overdue_months": 5,
            "status": "active"
        }
        res_loan = self.client.post("/api/v1/loans", json=loan_payload, headers=headers)
        self.assertEqual(res_loan.status_code, 201)

        # 3. Verify Financial Profile was automatically updated with SBI EMI and outstanding amounts
        res_health = self.client.get("/api/v1/financial/health", headers=headers)
        health_data = res_health.json()["data"]
        self.assertEqual(health_data["total_emi"], 15000.0)
        self.assertEqual(health_data["total_outstanding"], 400000.0)
        self.assertEqual(health_data["monthly_surplus"], 15000.0) # 50000 - 20000 - 15000
        self.assertLess(health_data["financial_health_score"], 100.0) # Score should have dropped due to debt

        # 4. Verify Settlement Record was automatically calculated and stored for this loan
        res_settle_hist = self.client.get("/api/v1/settlement/history", headers=headers)
        settle_data = res_settle_hist.json()["data"]
        self.assertEqual(settle_data["total"], 1)
        record = settle_data["records"][0]
        self.assertEqual(record["outstanding_amount"], 400000.0)
        self.assertTrue(record["recommended_percentage"] > 0)
        self.assertEqual(record["recommended_amount"], round(400000.0 * (record["recommended_percentage"] / 100), 2))

    def test_4_settlement_engine_priority_rules(self):
        # Register and Login
        user_payload = {"email": "settle@example.com", "password": "password123", "full_name": "Settle User"}
        self.client.post("/api/v1/auth/register", json=user_payload)
        login_res = self.client.post("/api/v1/auth/login/json", json={"email": "settle@example.com", "password": "password123"})
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create financial profile
        self.client.post("/api/v1/financial/calculate", json={"monthly_income": 40000.0, "monthly_expenses": 15000.0}, headers=headers)

        # Add critical loan (overdue > 12 months)
        loan_crit = {
            "loan_type": "credit_card",
            "lender_name": "ICICI",
            "original_amount": 200000.0,
            "outstanding_amount": 180000.0,
            "interest_rate": 36.0,
            "emi_amount": 10000.0,
            "tenure_months": 24,
            "overdue_months": 15,
            "status": "active"
        }
        res_crit = self.client.post("/api/v1/loans", json=loan_crit, headers=headers)
        loan_crit_id = res_crit.json()["data"]["id"]

        # Register and Login User B (for low priority loan to have a low debt ratio)
        user_low_payload = {"email": "settle_low@example.com", "password": "password123", "full_name": "Settle Low User"}
        self.client.post("/api/v1/auth/register", json=user_low_payload)
        login_low_res = self.client.post("/api/v1/auth/login/json", json={"email": "settle_low@example.com", "password": "password123"})
        token_low = login_low_res.json()["data"]["access_token"]
        headers_low = {"Authorization": f"Bearer {token_low}"}

        # Create financial profile with high income for User B
        self.client.post("/api/v1/financial/calculate", json={"monthly_income": 500000.0, "monthly_expenses": 15000.0}, headers=headers_low)

        # Add low-priority loan (overdue 1 month) for User B
        loan_low = {
            "loan_type": "home",
            "lender_name": "HDFC",
            "original_amount": 100000.0,
            "outstanding_amount": 40000.0,
            "interest_rate": 8.5,

            "emi_amount": 8000.0,
            "tenure_months": 180,
            "overdue_months": 1,
            "status": "active"
        }
        res_low = self.client.post("/api/v1/loans", json=loan_low, headers=headers_low)
        loan_low_id = res_low.json()["data"]["id"]

        # Call predict on critical loan (User A)
        res_pred_crit = self.client.post("/api/v1/settlement/predict", json={"loan_id": loan_crit_id}, headers=headers)
        self.assertEqual(res_pred_crit.status_code, 200)
        self.assertEqual(res_pred_crit.json()["data"]["priority"], "Critical")
        self.assertEqual(res_pred_crit.json()["data"]["risk_category"], "Critical")
        self.assertIn("financial_health", res_pred_crit.json()["data"]) # Output check

        # Call predict on low loan (User B)
        res_pred_low = self.client.post("/api/v1/settlement/predict", json={"loan_id": loan_low_id}, headers=headers_low)
        self.assertEqual(res_pred_low.status_code, 200)
        self.assertEqual(res_pred_low.json()["data"]["priority"], "Low")
        self.assertEqual(res_pred_low.json()["data"]["risk_category"], "Low")


    def test_5_negotiation_letter_generation_with_fallback(self):
        # Register and Login
        user_payload = {"email": "letter@example.com", "password": "password123", "full_name": "Letter User"}
        self.client.post("/api/v1/auth/register", json=user_payload)
        login_res = self.client.post("/api/v1/auth/login/json", json={"email": "letter@example.com", "password": "password123"})
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        letter_payload = {
            "borrower_name": "Jane Doe",
            "lender_name": "Axis Bank",
            "loan_type": "personal",
            "outstanding_amount": 150000.0,
            "proposed_settlement_amount": 75000.0,
            "overdue_months": 6,
            "reason": "medical emergency in the family"
        }

        # Since GEMINI_API_KEY is empty, it should automatically use fallback template
        response = self.client.post("/api/v1/ai/generate-letter", json=letter_payload, headers=headers)
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertTrue(json_data["success"])
        self.assertEqual(json_data["message"], "Negotiation letter generated successfully")
        self.assertTrue(json_data["data"]["is_fallback"])
        self.assertEqual(json_data["data"]["model_used"], "fallback")
        self.assertIn("Jane Doe", json_data["data"]["letter"])
        self.assertIn("Axis Bank", json_data["data"]["letter"])
        self.assertIn("medical emergency", json_data["data"]["letter"])

    def test_6_pagination_verification(self):
        # Register and Login
        user_payload = {"email": "pag@example.com", "password": "password123", "full_name": "Pag User"}
        self.client.post("/api/v1/auth/register", json=user_payload)
        login_res = self.client.post("/api/v1/auth/login/json", json={"email": "pag@example.com", "password": "password123"})
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Generate 5 AI interactions
        for i in range(5):
            chat_payload = {"message": f"Hello FinRelief {i}"}
            self.client.post("/api/v1/ai/chat", json=chat_payload, headers=headers)

        # Retrieve page 1 (limit=2, skip=0)
        res_p1 = self.client.get("/api/v1/history/ai?limit=2&skip=0", headers=headers)
        self.assertEqual(res_p1.status_code, 200)
        self.assertEqual(len(res_p1.json()["data"]["records"]), 2)
        self.assertEqual(res_p1.json()["data"]["total"], 5)

        # Retrieve page 2 (limit=2, skip=2)
        res_p2 = self.client.get("/api/v1/history/ai?limit=2&skip=2", headers=headers)
        self.assertEqual(res_p2.status_code, 200)
        self.assertEqual(len(res_p2.json()["data"]["records"]), 2)
        self.assertEqual(res_p2.json()["data"]["total"], 5)

        # Verify records are different
        r1 = [rec["id"] for rec in res_p1.json()["data"]["records"]]
        r2 = [rec["id"] for rec in res_p2.json()["data"]["records"]]
        self.assertFalse(any(rid in r2 for rid in r1))

if __name__ == "__main__":
    unittest.main()
