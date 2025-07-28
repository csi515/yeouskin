import React from 'react';
import { getSupabase } from '../utils/supabase';

interface SafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

const SafeWrapper: React.FC<SafeWrapperProps> = ({ 
  children, 
  fallback = <div className="p-4 text-center text-gray-500">데이터베이스 연결을 확인 중...</div>,
  showError = true 
}) => {
  const supabase = getSupabase();

  // Supabase 클라이언트가 없을 때 fallback 렌더링
  if (!supabase) {
    console.warn('Supabase 클라이언트를 사용할 수 없습니다. 오프라인 모드로 전환합니다.');
    
    if (showError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="font-medium text-yellow-800">데이터베이스 연결 오류</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Supabase 데이터베이스에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
          >
            새로고침
          </button>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default SafeWrapper; 