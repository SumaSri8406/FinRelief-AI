# FinRelief AI - Documentation

## Overview
FinRelief AI is a full-stack AI-powered financial debt relief and settlement platform. It helps users manage loans, analyze financial health, and generate AI-based settlement negotiation strategies.

---

## System Modules

### 1. Authentication Module
- User registration and login
- JWT-based authentication
- Protected routes

### 2. Loan Management
- Add, update, delete loans
- Track outstanding amounts, EMI, and interest
- Auto financial recalculation on changes

### 3. Financial Engine
- EMI calculation
- Debt-to-income ratio
- Financial health score
- Monthly surplus calculation

### 4. Settlement Engine
- Loan settlement prediction
- Risk category (Low / Medium / High)
- Priority scoring
- Recommended settlement amount

### 5. AI Engine (Google Gemini + Fallback)
- Generates negotiation letters
- Creates repayment strategies
- Provides AI financial advice
- Works with fallback logic if API is unavailable

### 6. AI History Module
- Stores all AI-generated outputs
- Chat history tracking
- Pagination support

---

## Architecture

Frontend:
- React.js + Vite
- Axios for API calls
- JWT interceptor

Backend:
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic validation

Database:
- SQLite (development)

AI:
- Google Gemini API
- Rule-based fallback system

---

## API Flow

1. User logs in → receives JWT token  
2. Token stored in frontend  
3. All API requests include JWT  
4. Backend validates token  
5. Financial calculations triggered on loan updates  
6. AI engine generates recommendations  
7. Response returned in standardized format  

---

## Key Features

- Real-time financial health analysis
- AI-powered settlement suggestions
- Automated negotiation letter generation
- Secure authentication system
- Clean modular architecture
- Full-stack integration

---

## Status

Project is production-ready and fully tested.
