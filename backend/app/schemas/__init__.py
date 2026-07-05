from app.schemas.user import UserBase, UserCreate, UserUpdate, UserOut, Token, TokenPayload
from app.schemas.loan import LoanCreate, LoanUpdate, LoanOut, LoanListOut
from app.schemas.financial import (
    FinancialCalculationRequest,
    FinancialHealthResponse,
    FinancialProfileOut,
)
from app.schemas.settlement import (
    SettlementPredictionRequest,
    SettlementPredictionResponse,
    SettlementHistoryOut,
    SettlementHistoryListOut,
)
from app.schemas.ai import (
    StrategyRequest,
    StrategyResponse,
    LetterRequest,
    LetterResponse,
    ChatRequest,
    ChatResponse,
    AIHistoryOut,
    AIHistoryListOut,
)
