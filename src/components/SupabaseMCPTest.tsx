import React, { useState, useEffect } from 'react';
import { supabaseMCP } from '../utils/supabaseMCP';
import { SupabaseConnectionStatus, SupabaseSchemaInfo, SupabaseTestData } from '../types';

const SupabaseMCPTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('테스트 중...');
  const [schemaInfo, setSchemaInfo] = useState<SupabaseSchemaInfo | null>(null);
  const [testData, setTestData] = useState<SupabaseTestData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastTestTime, setLastTestTime] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result: SupabaseConnectionStatus = await supabaseMCP.testConnection();
      setConnectionStatus(result.message);
      setLastTestTime(result.timestamp || new Date().toISOString());
      
      if (result.success) {
        const schema: SupabaseSchemaInfo = await supabaseMCP.getSchemaInfo();
        setSchemaInfo(schema);
      }
    } catch (error) {
      setConnectionStatus(`연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setLastTestTime(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const testDataRetrieval = async () => {
    setLoading(true);
    try {
      const data: SupabaseTestData = await supabaseMCP.getTestData();
      setTestData(data);
    } catch (error) {
      setTestData({ 
        customers: '오류',
        appointments: '오류',
        products: '오류',
        finance: '오류',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Supabase MCP 연결 테스트</h2>
      
      <div className="space-y-4">
        {/* 연결 상태 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">연결 상태</h3>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus.includes('성공') ? 'bg-green-500' : 
              connectionStatus.includes('오류') ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className={connectionStatus.includes('성공') ? 'text-green-600' : 
                          connectionStatus.includes('오류') ? 'text-red-600' : 'text-yellow-600'}>
              {connectionStatus}
            </span>
          </div>
          {lastTestTime && (
            <p className="text-xs text-gray-500">
              마지막 테스트: {formatTimestamp(lastTestTime)}
            </p>
          )}
        </div>

        {/* 스키마 정보 */}
        {schemaInfo && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">데이터베이스 스키마</h3>
            <div className="text-sm text-gray-700">
              <p><strong>테이블:</strong> {schemaInfo.tables?.join(', ') || '정보 없음'}</p>
              <p><strong>메시지:</strong> {schemaInfo.message}</p>
              {schemaInfo.version && (
                <p><strong>버전:</strong> {schemaInfo.version}</p>
              )}
            </div>
          </div>
        )}

        {/* 데이터 테스트 */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">데이터 조회 테스트</h3>
          <button
            onClick={testDataRetrieval}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '데이터 조회 테스트'}
          </button>
          
          {testData && (
            <div className="mt-3 text-sm">
              {testData.error ? (
                <div className="text-red-600">
                  <p><strong>오류:</strong> {testData.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <p><strong>고객:</strong> {testData.customers}개</p>
                  <p><strong>예약:</strong> {testData.appointments}개</p>
                  <p><strong>상품:</strong> {testData.products}개</p>
                  <p><strong>재무:</strong> {testData.finance}개</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 재연결 버튼 */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">연결 재시도</h3>
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? '재연결 중...' : '연결 재시도'}
          </button>
        </div>

        {/* 연결 정보 */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">연결 정보</h3>
          <div className="text-sm text-gray-700">
            <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '설정되지 않음'}</p>
            <p><strong>상태:</strong> {supabaseMCP.getConnectionStatus() ? '연결됨' : '연결 안됨'}</p>
            <p><strong>환경:</strong> {import.meta.env.MODE}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseMCPTest; 