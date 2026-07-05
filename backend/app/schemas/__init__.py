from app.schemas.base import ApiResponse, ApiErrorResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserOut, Token, TokenPayload, UserLogin
from app.schemas.loan import LoanCreate, LoanUpdate, LoanOut, LoanListOut, LoanResponse
from app.schemas.financial import (
    FinancialCalculationRequest,
    FinancialHealthResponse,
    FinancialProfileOut,
    FinancialProfileCreate,
)
from app.schemas.settlement import (
    SettlementPredictionRequest,
    SettlementPredictionResponse,
    SettlementHistoryOut,
    SettlementHistoryListOut,
    SettlementRequest,
    SettlementResponse,
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
    NegotiationRequest,
    NegotiationResponse,
    HistoryResponse,
)

