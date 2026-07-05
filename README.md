# FinRelief AI – AI Powered Debt Relief & Financial Recovery Platform

FinRelief AI is a full-stack application that analyzes personal debt structures and formulates AI-powered financial recovery strategies. It helps users optimize repayment plans, predict settlement outcomes, and draft professional creditor negotiation letters.

---

## 🔒 Security Notice

> **This repository is safe to make public.** No API keys, passwords, or secrets are committed to version control. All sensitive values are loaded from a `.env` file which is listed in `.gitignore`.

Anyone cloning this repository must create their own `.env` file with their own credentials before AI features will work.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | SQLite, SQLAlchemy ORM |
| Auth | JWT (python-jose), bcrypt (passlib) |
| AI | Google Gemini API (with rule-based fallback) |
| Frontend | React.js, Vite, Axios, React Router |
| Icons | Lucide React |

---

## 📂 Folder Structure

```
FinRelief-AI/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT security helpers & get_current_user dependency
│   │   ├── core/              # Logging configuration
│   │   ├── models/            # SQLAlchemy models (User, Loan, FinancialProfile, SettlementRecord, AIHistory)
│   │   ├── routers/           # API route controllers (auth, loans, financial, settlement, ai, history)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic (financial_engine, settlement_engine, gemini_service, fallback_engine, ai_orchestrator)
│   │   ├── utils/             # Utility functions
│   │   ├── config.py          # Environment settings loader
│   │   ├── database.py        # SQLAlchemy engine & session setup
│   │   └── main.py            # FastAPI application entry point
│   ├── .env.example           # Template for environment variables
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar
│   │   ├── context/           # AuthContext provider
│   │   ├── layouts/           # MainLayout
│   │   ├── pages/             # Home, Login, Register, Dashboard
│   │   ├── services/          # Axios API client
│   │   └── styles/            # CSS design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (form-data) |
| POST | `/api/v1/auth/login/json` | Login (JSON body) |
| GET | `/api/v1/auth/me` | Get current user profile |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loans` | List all user loans |
| GET | `/api/v1/loans/{id}` | Get loan by ID |
| POST | `/api/v1/loans` | Create a new loan |
| PUT | `/api/v1/loans/{id}` | Update a loan |
| DELETE | `/api/v1/loans/{id}` | Delete a loan |

### Financial Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/financial/health` | Get computed financial health |
| POST | `/api/v1/financial/calculate` | Calculate financial health from inputs |

### Settlement Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/settlement/predict` | Predict settlement for a loan |
| GET | `/api/v1/settlement/history` | Get settlement prediction history |

### AI Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/generate-strategy` | Generate negotiation strategy |
| POST | `/api/v1/ai/generate-letter` | Generate settlement letter |
| POST | `/api/v1/ai/chat` | Chat with AI counselor |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/history/ai` | Get AI interaction history |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Global health check |
| GET | `/api/v1/health` | API v1 health check |

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and npm

---

### 🔑 Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables** — edit `.env`:
   ```env
   # Generate a secure key: openssl rand -hex 32
   SECRET_KEY=your_generated_secret_key_here

   # Optional: Get from https://aistudio.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

6. **Start the server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   - API: http://127.0.0.1:8000
   - Swagger docs: http://127.0.0.1:8000/docs

---

### 🤖 Obtaining a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** and select a Google Cloud project (or create one).
4. Copy the generated key.
5. Paste it into your `.env` file as `GEMINI_API_KEY=your_key_here`.

> **If no Gemini API key is provided**, the application will **not crash**. It automatically uses the built-in rule-based fallback engine, which provides deterministic financial advice, settlement predictions, and negotiation letter templates. The response will include `"is_fallback": true` to indicate the fallback engine was used.

---

### 💻 Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install packages**:
   ```bash
   npm install
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000 with API requests proxied to port 8000.

---

## 🔮 Future Modules

- **Epic 3**: AI Legal Letter Drafter — Advanced templates, multi-format export
- **Epic 4**: Creditor & Collection Logs — Payment tracking, dispute history, calendar notifications
- **Epic 5**: Credit Score Recovery — Score simulation, improvement roadmaps
