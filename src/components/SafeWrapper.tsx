import React from 'react';
import { supabase } from '../utils/supabase';

interface SafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SafeWrapper: React.FC<SafeWrapperProps> = ({ children, fallback }) => {
  // Supabase 클라이언트가 없을 때 fallback 렌더링
  if (!supabase) {
    console.warn('Supabase 클라이언트를 사용할 수 없습니다. 오프라인 모드로 전환합니다.');
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">연결 문제</h1>
          <p className="text-gray-600 mb-4">
            데이터베이스에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.
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
  }

  return <>{children}</>;
};

export default SafeWrapper; 