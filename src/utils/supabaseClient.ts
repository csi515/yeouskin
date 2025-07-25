import { createClient } from '@supabase/supabase-js';

// 안전한 Supabase 클라이언트 생성
export const createSafeSupabaseClient = () => {
  // 브라우저 환경 확인
  if (typeof window === 'undefined') {
    console.log('서버 환경에서 Supabase 클라이언트 초기화 건너뜀');
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wysihrzbnxhfnymtnvzj.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('Supabase 환경변수 확인:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined'
  });

  if (!supabaseAnonKey) {
    console.error('VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
    // 환경변수가 없어도 앱이 크래시되지 않도록 null 반환
    return null;
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
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
    
    console.log('Supabase 클라이언트 생성 성공');
    return client;
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    // 오류가 발생해도 앱이 크래시되지 않도록 null 반환
    return null;
  }
};

// 단일 인스턴스 생성
export const supabaseClient = createSafeSupabaseClient(); 