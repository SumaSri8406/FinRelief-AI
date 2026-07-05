import axios from 'axios';

// Set up Axios base client connecting directly to the FastAPI server
const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to headers if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized
API.interceptors.response.use(
  (response) => {
    // If the response is wrapped in our backend's ApiResponse model, unwrap it
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are not on login page, redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (fullName, email, password) => {
    const response = await API.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response;
  },
  
  login: async (email, password) => {
    const response = await API.post('/auth/login/json', {
      email,
      password,
    });
    const token = response?.access_token || response?.data?.access_token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response;
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export const loanService = {
  list: async () => {
    const response = await API.get('/loans');
    return response; // Returns LoanListOut: { loans, total }
  },

  get: async (id) => {
    const response = await API.get(`/loans/${id}`);
    return response;
  },

  create: async (loanData) => {
    const response = await API.post('/loans', loanData);
    return response;
  },

  update: async (id, loanData) => {
    const response = await API.put(`/loans/${id}`, loanData);
    return response;
  },

  delete: async (id) => {
    await API.delete(`/loans/${id}`);
  }
};

export const financialService = {
  getHealth: async () => {
    const response = await API.get('/financial/health');
    return response; // Returns FinancialHealthResponse
  },

  calculate: async (monthlyIncome, monthlyExpenses) => {
    const response = await API.post('/financial/calculate', {
      monthly_income: parseFloat(monthlyIncome),
      monthly_expenses: parseFloat(monthlyExpenses)
    });
    return response; // Returns FinancialHealthResponse
  }
};

export const settlementService = {
  predict: async (loanId) => {
    const response = await API.post('/settlement/predict', {
      loan_id: parseInt(loanId)
    });
    return response; // Returns SettlementPredictionResponse
  },

  getHistory: async () => {
    const response = await API.get('/settlement/history');
    return response; // Returns SettlementHistoryListOut: { records, total }
  }
};

export const aiService = {
  generateStrategy: async (strategyData) => {
    const response = await API.post('/ai/generate-strategy', {
      monthly_income: parseFloat(strategyData.monthly_income),
      monthly_expenses: parseFloat(strategyData.monthly_expenses),
      outstanding_amount: parseFloat(strategyData.outstanding_amount),
      loan_type: strategyData.loan_type,
      overdue_months: parseInt(strategyData.overdue_months || 0),
      interest_rate: parseFloat(strategyData.interest_rate || 0.0),
      lender_name: strategyData.lender_name || ''
    });
    return response; // Returns StrategyResponse: { strategy, is_fallback, model_used }
  },

  generateLetter: async (letterData) => {
    const response = await API.post('/ai/generate-letter', {
      borrower_name: letterData.borrower_name,
      lender_name: letterData.lender_name,
      loan_type: letterData.loan_type,
      outstanding_amount: parseFloat(letterData.outstanding_amount),
      proposed_settlement_amount: parseFloat(letterData.proposed_settlement_amount),
      overdue_months: parseInt(letterData.overdue_months || 0),
      reason: letterData.reason || 'financial hardship'
    });
    return response; // Returns LetterResponse: { letter, is_fallback, model_used }
  },

  chat: async (chatData) => {
    const response = await API.post('/ai/chat', {
      message: chatData.message,
      monthly_income: chatData.monthly_income ? parseFloat(chatData.monthly_income) : null,
      monthly_expenses: chatData.monthly_expenses ? parseFloat(chatData.monthly_expenses) : null,
      total_outstanding: chatData.total_outstanding ? parseFloat(chatData.total_outstanding) : null
    });
    return response; // Returns ChatResponse: { reply, is_fallback, model_used }
  },

  getHistory: async (skip = 0, limit = 50) => {
    const response = await API.get('/history/ai', {
      params: { skip, limit }
    });
    return response; // Returns AIHistoryListOut: { records, total }
  }
};

export default API;
