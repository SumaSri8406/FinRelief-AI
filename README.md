# FinRelief AI – AI Powered Debt Relief & Financial Recovery Platform

FinRelief AI is a state-of-the-art, modular full-stack application designed to analyze personal debt structures and formulate automated financial recovery strategies. Leveraging cognitive modeling and interactive tools, it helps users optimize repayment vectors, track monthly budgets, and draft automated creditor negotiation correspondence.

---

## 🛠 Tech Stack

### Backend
- **Python 3.11** - Core backend platform
- **FastAPI** - High performance, asynchronous web framework
- **SQLAlchemy** - SQL database ORM mapper
- **SQLite** - Compact relational database storage
- **JWT Authentication** - Secure OAuth2 token-based authentication flow
- **Uvicorn** - Lightning-fast ASGI web server implementation

### Frontend
- **React.js & Vite** - Rapid, module-level frontend development
- **Axios** - Interceptor-driven HTTP backend connectivity
- **React Router** - Single Page Application routing structure
- **Lucide React** - High-quality premium SVG iconography
- **Pure CSS Variable Tokens** - Ultra-modern, HSL dynamic gradients, glassmorphism layouts, and transitions

---

## 📂 Folder Structure

```
FinRelief-AI/
├── backend/
│   ├── app/
│   │   ├── auth/          # Authentication helper modules (security, verification)
│   │   ├── core/          # App-wide configurations (logging initialization)
│   │   ├── models/        # SQLAlchemy Database models
│   │   ├── routers/       # FastAPI route controllers (auth endpoints)
│   │   ├── schemas/       # Pydantic schemas (request validation / response models)
│   │   ├── services/      # Business logic handlers (user database helper services)
│   │   ├── utils/         # Global utilities (error response builders)
│   │   ├── config.py      # Environment variable validator setting class
│   │   ├── database.py    # Database engine and SessionLocal setup
│   │   └── main.py        # ASGI application initiation & CORS setup
│   ├── .env.example       # Database, secret key, algorithm template config
│   ├── requirements.txt   # Backend python pip package versions list
│   └── .gitignore         # Backend dependency ignore rules
├── frontend/
│   ├── src/
│   │   ├── assets/        # Media resources
│   │   ├── components/    # Reusable layouts (translucent Navbar, Sidebar)
│   │   ├── context/       # Auth state providers and routing guards
│   │   ├── hooks/         # Shared hook definitions
│   │   ├── layouts/       # Main container layout (grid-alignment wrapper)
│   │   ├── pages/         # Page components (Home, Login, Register, Dashboard)
│   │   ├── services/      # Service wrappers (Axios API connection)
│   │   ├── styles/        # CSS variables and animations
│   │   ├── App.jsx        # Routing mapper
│   │   └── main.jsx       # DOM mount handler
│   ├── index.html         # HTML root and Google Font assets inclusion
│   ├── package.json       # Node package manager configurations
│   ├── vite.config.js     # Build options & backend proxy maps
│   └── .gitignore         # Node modules and build output exclusions
├── .gitignore             # Root repository-wide git exclusion rules
└── README.md              # Project manual documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+ & npm** installed

---

### 🔑 Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   - Windows:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install python packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize configurations**:
   Copy `.env.example` into a new `.env` file:
   ```bash
   cp .env.example .env
   ```

5. **Start server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will boot on `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/docs` to access Swagger interactive OpenAPI specs.

---

### 💻 Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node packages**:
   ```bash
   npm install
   ```

3. **Start local Vite server**:
   ```bash
   npm run dev
   ```
   The frontend interface will initialize on `http://localhost:3000`. Requests targeting `/api` will be proxied automatically to the backend on port `8000`.

---

## 🔮 Future Modules

FinRelief AI is prepared for modular enhancement in upcoming milestones:
- **Epic 2: AI Debt Analysis Engine** - Debt-to-income (DTI) calculations, Snowball vs. Avalanche simulation engines, and automated budget allocation calculators.
- **Epic 3: AI Legal Letter Drafter** - Settlement proposal documents, creditor dispute templates, and automated letter rendering using Gemini Pro API integrations.
- **Epic 4: Creditor & Collection Logs** - Chronological logging, calendar event notifications for payment agreements, and dispute letter dispatch tracking.
