import React, { useState, useEffect } from 'react';
import { getSupabase, checkSupabaseConnection } from '../utils/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
  details: any;
}

interface TestResult {
  test: string;
  status: string;
  details: any;
}

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    error: null,
    details: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // 컴포넌트 마운트 시 연결 상태 확인
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const result = await checkSupabaseConnection();
      setStatus({
        isConnected: result.isConnected,
        error: result.error || null,
        details: result.details || null
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        details: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runDetailedTests = async () => {
    setIsLoading(true);
    const detailedResults: TestResult[] = [];

    try {
      // 0. 기본 정보 수집
      const basicInfo = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        timestamp: new Date().toISOString()
      };
      detailedResults.push({ test: '기본 정보', status: 'ℹ️', details: basicInfo });

      // 1. 환경변수 확인
      const envInfo = {
        mode: import.meta.env.MODE,
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        nodeEnv: import.meta.env.NODE_ENV,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'fallback 사용됨',
        supabaseKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      };
      detailedResults.push({ test: '환경변수 확인', status: '✅', details: envInfo });

      // 2. Supabase 클라이언트 상태 확인
      const client = getSupabase();
      const clientInfo = {
        supabaseExists: !!client,
        supabaseType: typeof client,
        hasAuth: !!client?.auth,
        hasFrom: !!client?.from
      };
      detailedResults.push({ test: 'Supabase 클라이언트', status: '✅', details: clientInfo });

      // 3. 네트워크 연결 테스트 (CORS 확인)
      try {
        const response = await fetch('https://wysihrzbnxhfnymtnvzj.supabase.co/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY'
          }
        });
        detailedResults.push({ 
          test: '네트워크 연결 (CORS)', 
          status: response.ok ? '✅ 성공' : '❌ 실패',
          details: { 
            status: response.status, 
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          }
        });
      } catch (error) {
        detailedResults.push({ 
          test: '네트워크 연결 (CORS)', 
          status: '❌ 실패',
          details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
        });
      }

      // 4. 각 테이블 접근 테스트
      const tables = ['customers', 'products', 'appointments', 'finance'];
      for (const table of tables) {
        try {
          if (!client) {
            detailedResults.push({ 
              test: `${table} 테이블 접근`, 
              status: '❌ 실패',
              details: { error: 'Supabase 클라이언트가 없습니다.' }
            });
            continue;
          }

          const { data, error } = await client.from(table).select('count').limit(1);
          detailedResults.push({ 
            test: `${table} 테이블 접근`, 
            status: error ? '❌ 실패' : '✅ 성공',
            details: error ? { 
              error: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            } : { count: data?.length || 0 }
          });
        } catch (error) {
          detailedResults.push({ 
            test: `${table} 테이블 접근`, 
            status: '❌ 실패',
            details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
          });
        }
      }

    } catch (error) {
      detailedResults.push({ 
        test: '상세 테스트', 
        status: '❌ 실패',
        details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
      });
    }

    setTestResults(detailedResults);
    setIsLoading(false);
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? '🟢' : '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">🔌 데이터베이스 연결 상태</h2>
        <div className="flex gap-2">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {isLoading ? '확인 중...' : '연결 확인'}
          </button>
          <button
            onClick={runDetailedTests}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
          >
            상세 진단
          </button>
        </div>
      </div>

      {/* 연결 상태 표시 */}
      <div className="mb-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getStatusIcon(status.isConnected)}</span>
          <span className={`font-semibold ${getStatusColor(status.isConnected)}`}>
            {status.isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
        {status.error && (
          <p className="text-red-600 text-sm">{status.error}</p>
        )}
      </div>

      {/* 상세 테스트 결과 */}
      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">상세 진단 결과</h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{result.status}</span>
                  <span className="font-medium">{result.test}</span>
                </div>
                {result.details && (
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      상세 정보 보기
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 문제 해결 가이드 */}
      {!status.isConnected && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">문제 해결 가이드</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Supabase 프로젝트가 활성 상태인지 확인해주세요</li>
            <li>• API 키가 올바른지 확인해주세요</li>
            <li>• 네트워크 연결을 확인해주세요</li>
            <li>• 브라우저 개발자 도구에서 오류 메시지를 확인해주세요</li>
            <li>• CORS 설정이 올바른지 확인해주세요</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus; 