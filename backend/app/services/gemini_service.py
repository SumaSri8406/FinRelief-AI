from app.config import settings
from app.core import logger


class GeminiUnavailableError(Exception):
    """Raised when the Gemini API is not available."""
    pass


class GeminiService:
    def __init__(self):
        self.available = False
        self.model = None
        self._initialize()

    def _initialize(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key in ("", "your_gemini_api_key_here"):
            logger.warning(
                "GEMINI_API_KEY is not configured. AI features will use the fallback engine. "
                "Set GEMINI_API_KEY in your .env file to enable Gemini AI."
            )
            return

        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-pro")
            # Lightweight validation: list available models
            self.available = True
            logger.info("Gemini AI service initialized successfully.")
        except Exception as exc:
            logger.error(f"Failed to initialize Gemini AI: {exc}")
            self.available = False

    def _ensure_available(self):
        if not self.available or self.model is None:
            raise GeminiUnavailableError(
                "Gemini AI service is unavailable. The system will use the rule-based fallback engine."
            )

    def generate_strategy(
        self,
        monthly_income: float,
        monthly_expenses: float,
        outstanding_amount: float,
        loan_type: str,
        overdue_months: int,
        interest_rate: float,
        lender_name: str,
    ) -> str:
        self._ensure_available()

        prompt = (
            "You are an experienced financial settlement advisor and debt recovery specialist.\n\n"
            "Analyze the following borrower profile and provide a comprehensive negotiation strategy:\n\n"
            f"- Monthly Income: ₹{monthly_income:,.2f}\n"
            f"- Monthly Expenses: ₹{monthly_expenses:,.2f}\n"
            f"- Monthly Surplus: ₹{monthly_income - monthly_expenses:,.2f}\n"
            f"- Outstanding Loan Amount: ₹{outstanding_amount:,.2f}\n"
            f"- Loan Type: {loan_type}\n"
            f"- Lender: {lender_name}\n"
            f"- Interest Rate: {interest_rate}%\n"
            f"- Months Overdue: {overdue_months}\n\n"
            "Provide:\n"
            "1. A recommended settlement percentage and justification.\n"
            "2. Step-by-step negotiation strategy with the lender.\n"
            "3. Key talking points for the borrower.\n"
            "4. Alternative repayment plan if settlement is rejected.\n"
            "5. Timeline recommendation.\n\n"
            "Maintain a professional, empathetic tone. Be specific with numbers."
        )

        response = self.model.generate_content(prompt)
        return response.text

    def generate_letter(
        self,
        borrower_name: str,
        lender_name: str,
        loan_type: str,
        outstanding_amount: float,
        proposed_settlement_amount: float,
        overdue_months: int,
        reason: str,
    ) -> str:
        self._ensure_available()

        prompt = (
            "You are a professional financial correspondence writer.\n\n"
            "Draft a formal settlement negotiation letter from the borrower to the lender.\n\n"
            f"Borrower Name: {borrower_name}\n"
            f"Lender Name: {lender_name}\n"
            f"Loan Type: {loan_type}\n"
            f"Outstanding Amount: ₹{outstanding_amount:,.2f}\n"
            f"Proposed Settlement Amount: ₹{proposed_settlement_amount:,.2f}\n"
            f"Months Overdue: {overdue_months}\n"
            f"Reason for Hardship: {reason}\n\n"
            "The letter should:\n"
            "1. Be formally structured with date, subject line, and reference.\n"
            "2. Acknowledge the debt professionally.\n"
            "3. Explain the financial hardship clearly.\n"
            "4. Propose the settlement amount with justification.\n"
            "5. Request written confirmation of the settlement terms.\n"
            "6. Maintain a respectful and professional tone throughout.\n"
        )

        response = self.model.generate_content(prompt)
        return response.text

    def chat(
        self,
        message: str,
        monthly_income: float = None,
        monthly_expenses: float = None,
        total_outstanding: float = None,
    ) -> str:
        self._ensure_available()

        context_lines = [
            "You are FinRelief AI, a knowledgeable and empathetic financial recovery counselor.",
            "You specialize in debt relief, settlement negotiation, budgeting, and credit recovery.",
            "Provide clear, actionable advice. Use specific numbers when possible.",
            "",
        ]
        if monthly_income is not None:
            context_lines.append(f"User's monthly income: ₹{monthly_income:,.2f}")
        if monthly_expenses is not None:
            context_lines.append(f"User's monthly expenses: ₹{monthly_expenses:,.2f}")
        if total_outstanding is not None:
            context_lines.append(f"User's total outstanding debt: ₹{total_outstanding:,.2f}")

        context_lines.append(f"\nUser's question: {message}")

        prompt = "\n".join(context_lines)
        response = self.model.generate_content(prompt)
        return response.text


# Singleton instance
gemini_service = GeminiService()
