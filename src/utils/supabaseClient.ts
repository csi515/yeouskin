import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 환경변수 검증 및 로깅
console.log('Supabase 환경변수 상태:', {
  url: supabaseUrl ? '설정됨' : '누락',
  key: supabaseAnonKey ? '설정됨' : '누락',
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 누락되었습니다. 앱이 제한된 모드로 실행됩니다.');
  
  // Development 환경에서는 에러를 throw하지만, Production에서는 graceful하게 처리
  if (import.meta.env.DEV) {
    throw new Error('Supabase 환경변수가 누락되었습니다. .env 파일 또는 Render 환경변수를 확인하세요.');
  }
}

// Mock Supabase 클라이언트 (환경변수가 없을 때 사용)
const createMockSupabase = () => {
  console.log('Mock Supabase 클라이언트를 생성합니다.');
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    }
  };
};

// 실제 Supabase 클라이언트 또는 Mock 클라이언트 생성
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockSupabase();

export default supabase; 