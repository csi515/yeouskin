import { createClient } from '@supabase/supabase-js';

// 안전한 Supabase 클라이언트 생성
export const createSafeSupabaseClient = () => {
  // 브라우저 환경 확인
  if (typeof window === 'undefined') {
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wysihrzbnxhfnymtnvzj.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    console.error('VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
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
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// 단일 인스턴스 생성
export const supabaseClient = createSafeSupabaseClient(); 