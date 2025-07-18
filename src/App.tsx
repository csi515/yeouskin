import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import ProductManagement from './pages/ProductManagement';
import AppointmentManagement from './pages/AppointmentManagement';
import FinanceManagement from './pages/FinanceManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// 라우팅 핸들러 컴포넌트
const RoutingHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const action = event.detail;
      switch (action) {
        case 'customers':
          navigate('/customers');
          break;
        case 'appointments':
          navigate('/appointments');
          break;
        case 'finance':
          navigate('/finance');
          break;
        case 'products':
          navigate('/products');
          break;
        default:
          break;
      }
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, [navigate]);

  return null;
};

// 로딩 컴포넌트
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// 에러 컴포넌트
const ErrorFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 불러올 수 없습니다</h1>
      <p className="text-gray-600 mb-4">
        페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <Router>
          <RoutingHandler />
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* 보호된 라우트 */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <CustomerManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <ProductManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Layout>
                  <AppointmentManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute>
                <Layout>
                  <FinanceManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 