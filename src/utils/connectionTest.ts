import { supabase } from './supabase';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

export const testDatabaseConnection = async (): Promise<ConnectionTestResult> => {
  try {
    // 1. Supabase 클라이언트 확인
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.'
      };
    }

    // 2. 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: `데이터베이스 연결 오류: ${error.message}`,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      };
    }

    return {
      success: true,
      details: {
        message: '데이터베이스 연결 성공',
        data: data
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      details: {
        type: 'exception',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export const testNetworkConnection = async (): Promise<ConnectionTestResult> => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return {
        success: false,
        error: '환경변수 누락: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY',
        details: { hasUrl: !!url, hasKey: !!anonKey }
      };
    }

    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        }
      };
    }

    return {
      success: true,
      details: {
        message: '네트워크 연결 성공',
        status: response.status
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결 실패',
      details: {
        type: 'network_error',
        message: error instanceof Error ? error.message : 'Unknown network error'
      }
    };
  }
};

export const getConnectionDiagnostics = async () => {
  const results = {
    database: await testDatabaseConnection(),
    network: await testNetworkConnection(),
    environment: {
      mode: import.meta.env.MODE,
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: import.meta.env.NODE_ENV,
      userAgent: navigator.userAgent
    }
  };

  return results;
}; 