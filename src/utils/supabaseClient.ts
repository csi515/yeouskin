import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 환경변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경변수가 누락되었습니다:', {
    url: supabaseUrl ? '설정됨' : '누락',
    key: supabaseAnonKey ? '설정됨' : '누락'
  });
  
  // Development 환경에서는 에러를 throw하지만, Production에서는 graceful하게 처리
  if (import.meta.env.DEV) {
    throw new Error('Supabase 환경변수가 누락되었습니다. .env 파일 또는 Render 환경변수를 확인하세요.');
  }
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase; 