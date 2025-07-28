import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Fallback 값들 (GitHub Pages 배포용)
  const fallbackUrl = 'https://wysihrzbnxhfnymtnvzj.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY';
  
  const finalUrl = url || fallbackUrl;
  const finalKey = anonKey || fallbackKey;
  
  return {
    url: finalUrl,
    anonKey: finalKey,
    isUsingFallback: !url || !anonKey
  };
};

// Supabase 클라이언트 생성 함수
export const createSupabaseClient = (): SupabaseClient | null => {
  // 서버 사이드 렌더링 환경 체크
  if (typeof window === 'undefined') {
    console.warn('Supabase: 서버 환경에서 클라이언트 생성 건너뜀');
    return null;
  }

  const config = getSupabaseConfig();
  
  // 설정 유효성 검사
  if (!config.url || !config.anonKey) {
    console.error('Supabase: URL 또는 API 키가 설정되지 않았습니다.', {
      url: !!config.url,
      hasKey: !!config.anonKey
    });
    return null;
  }

  try {
    const client = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      },
      global: {
        headers: {
          'X-Client-Info': 'crm-esthetic-shop/1.0.0',
          'Content-Type': 'application/json'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    // 연결 테스트
    if (import.meta.env.DEV) {
      console.log('Supabase 클라이언트 생성 성공:', {
        url: config.url,
        isUsingFallback: config.isUsingFallback,
        mode: import.meta.env.MODE
      });
    }

    return client;
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// 전역 Supabase 클라이언트 인스턴스
let supabaseInstance: SupabaseClient | null = null;

// 안전한 Supabase 클라이언트 가져오기
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
};

// 클라이언트 재초기화 (필요시)
export const resetSupabaseClient = (): void => {
  supabaseInstance = null;
};

// 기본 내보내기 (기존 코드 호환성)
export const supabaseClient = getSupabaseClient(); 