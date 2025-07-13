import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import ProductManagement from './pages/ProductManagement';
import AppointmentManagement from './pages/AppointmentManagement';
import FinanceManagement from './pages/FinanceManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './App.css';

// 환경변수 상태 확인 컴포넌트
const EnvironmentCheck: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase 환경변수가 설정되지 않았습니다.');
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 text-yellow-800 px-4 py-2 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <span className="text-sm">
            Supabase 환경변수가 설정되지 않았습니다. 일부 기능이 제한될 수 있습니다.
          </span>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-yellow-600 hover:text-yellow-800 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

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
      <EnvironmentCheck />
      <Router>
        <RoutingHandler />
        <Layout>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/appointments" element={<AppointmentManagement />} />
                <Route path="/finance" element={<FinanceManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 