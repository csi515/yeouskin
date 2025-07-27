import React, { useState, useEffect } from 'react';
import errorMonitor from '../utils/errorMonitor';
import ErrorTestPanel from '../components/ErrorTestPanel';
import DatabaseStatus from '../components/DatabaseStatus';

const Debug: React.FC = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const updateErrors = () => {
      setErrors(errorMonitor.getErrors());
      setStats(errorMonitor.getErrorStats());
    };

    // 초기 로드
    updateErrors();

    // 주기적으로 업데이트
    const interval = setInterval(updateErrors, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearErrors = () => {
    errorMonitor.clearErrors();
    setErrors([]);
    setStats({});
  };

  const toggleMonitoring = () => {
    errorMonitor.setEnabled(!isMonitoring);
    setIsMonitoring(!isMonitoring);
  };

  const get404Errors = () => {
    setErrors(errorMonitor.get404Errors());
  };

  const getAllErrors = () => {
    setErrors(errorMonitor.getErrors());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ko-KR');
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'fetch': return '🌐';
      case 'xhr': return '📡';
      case 'image': return '🖼️';
      case 'script': return '📜';
      case 'css': return '🎨';
      case 'console': return '💻';
      case 'global': return '🌍';
      case 'promise': return '⏳';
      default: return '❌';
    }
  };

  const getErrorColor = (status: number) => {
    if (status === 404) return 'text-red-600';
    if (status >= 500) return 'text-orange-600';
    if (status >= 400) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 디버깅 도구</h1>
        <p className="text-gray-600">네트워크 오류 및 콘솔 오류를 모니터링합니다.</p>
      </div>

      {/* 데이터베이스 상태 확인 */}
      <DatabaseStatus />

      {/* 오류 테스트 패널 */}
      <ErrorTestPanel />

      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={toggleMonitoring}
            className={`px-4 py-2 rounded-md font-medium ${
              isMonitoring 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isMonitoring ? '🟢 모니터링 중' : '🔴 모니터링 중지'}
          </button>
          
          <button
            onClick={clearErrors}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
          >
            🗑️ 모든 오류 지우기
          </button>
          
          <button
            onClick={get404Errors}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
          >
            🔍 404 오류만 보기
          </button>
          
          <button
            onClick={getAllErrors}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
          >
            📋 모든 오류 보기
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 전체 통계</h3>
          <div className="text-3xl font-bold text-blue-600">{stats.total || 0}</div>
          <p className="text-gray-600">총 오류 수</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚨 404 오류</h3>
          <div className="text-3xl font-bold text-red-600">{stats.byStatus?.[404] || 0}</div>
          <p className="text-gray-600">Not Found 오류</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ 실시간</h3>
          <div className="text-3xl font-bold text-green-600">
            {isMonitoring ? '활성' : '비활성'}
          </div>
          <p className="text-gray-600">모니터링 상태</p>
        </div>
      </div>

      {/* 오류 목록 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            오류 목록 ({errors.length}개)
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {errors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-lg">오류가 없습니다!</p>
              <p className="text-sm">모든 것이 정상적으로 작동하고 있습니다.</p>
            </div>
          ) : (
            errors.map((error, index) => (
              <div key={index} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getErrorIcon(error.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${getErrorColor(error.status)}`}>
                        {error.status} {error.statusText}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {error.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(error.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1 break-all" title={error.url}>
                      <span className="font-medium">URL:</span> {error.url}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">메시지:</span> {error.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 개발자 도구 안내 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">💡 개발자 도구 사용법</h4>
        <div className="text-blue-800 space-y-2">
          <p>• <strong>F12</strong> 또는 <strong>Ctrl+Shift+I</strong>를 눌러 개발자 도구를 엽니다</p>
          <p>• <strong>Console</strong> 탭에서 실시간 오류 로그를 확인할 수 있습니다</p>
          <p>• <strong>Network</strong> 탭에서 네트워크 요청과 응답을 모니터링할 수 있습니다</p>
          <p>• 브라우저 콘솔에서 <code className="bg-blue-100 px-1 rounded">window.errorMonitor</code>를 입력하여 직접 접근할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
};

export default Debug; 