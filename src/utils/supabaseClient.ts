import { createClient } from '@supabase/supabase-js';

// GitHub Pages용 Supabase 연결 정보 (직접 명시)
const SUPABASE_URL = 'https://wysihrzbnxhfnymtnvzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY';

// 안전한 Supabase 클라이언트 생성
export const createSafeSupabaseClient = () => {
  // 브라우저 환경 확인
  if (typeof window === 'undefined') {
    console.log('서버 환경에서 Supabase 클라이언트 초기화 건너뜀');
    return null;
  }

  // 개발 모드에서만 로그 출력
  if (import.meta.env.DEV) {
    console.log('Supabase 연결 정보 확인:', {
      url: SUPABASE_URL,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      status: 'GitHub Pages 배포용 직접 설정됨'
    });
  }

  if (!SUPABASE_ANON_KEY) {
    console.error('Supabase Anon Key가 설정되지 않았습니다.');
    return null;
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      },
      global: {
        headers: {},
        fetch: window.fetch.bind(window)
      }
    });
    
    if (import.meta.env.DEV) {
      console.log('Supabase 클라이언트 생성 성공');
    }
    return client;
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// 단일 인스턴스 생성
export const supabaseClient = createSafeSupabaseClient(); 