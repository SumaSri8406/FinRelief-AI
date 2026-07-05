import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DebtAnalysis from './pages/DebtAnalysis';
import RecoveryPlans from './pages/RecoveryPlans';
import BudgetTracker from './pages/BudgetTracker';
import FinancialLibrary from './pages/FinancialLibrary';
import Settings from './pages/Settings';

// New Pages imported for Epic 4
import LoanManagement from './pages/LoanManagement';
import AddLoan from './pages/AddLoan';
import EditLoan from './pages/EditLoan';
import SettlementPredictor from './pages/SettlementPredictor';
import NegotiationEmailGenerator from './pages/NegotiationEmailGenerator';
import KnowYourRights from './pages/KnowYourRights';
import AIHistory from './pages/AIHistory';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Route guard component to check for authenticated users
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-display)',
        fontSize: '1.25rem'
      }}>
        Initializing Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Dashboard Subroutes */}
            <Route 
              path="dashboard" 
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/loans" 
              element={
                <RequireAuth>
                  <LoanManagement />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/loans/add" 
              element={
                <RequireAuth>
                  <AddLoan />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/loans/edit/:id" 
              element={
                <RequireAuth>
                  <EditLoan />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/settlement-predictor" 
              element={
                <RequireAuth>
                  <SettlementPredictor />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/negotiate" 
              element={
                <RequireAuth>
                  <NegotiationEmailGenerator />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/rights" 
              element={
                <RequireAuth>
                  <KnowYourRights />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/ai-history" 
              element={
                <RequireAuth>
                  <AIHistory />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/profile" 
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } 
            />

            {/* Existing compatibility routes */}
            <Route 
              path="dashboard/debt-analysis" 
              element={
                <RequireAuth>
                  <DebtAnalysis />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/recovery-plans" 
              element={
                <RequireAuth>
                  <RecoveryPlans />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/budget" 
              element={
                <RequireAuth>
                  <BudgetTracker />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/library" 
              element={
                <RequireAuth>
                  <FinancialLibrary />
                </RequireAuth>
              } 
            />
            <Route 
              path="dashboard/settings" 
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              } 
            />

            {/* Fallback routing */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
