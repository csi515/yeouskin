import { createClient } from '@supabase/supabase-js';

// Vite env-based Supabase connection (configured via Vercel project env vars)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

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
      status: 'Vite env에서 로드됨'
    });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다. Vercel 프로젝트 환경변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 확인하세요.');
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