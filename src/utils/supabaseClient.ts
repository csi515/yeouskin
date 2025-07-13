import { createClient } from '@supabase/supabase-js';

// Supabase URL을 코드에 직접 명시
const supabaseUrl = 'https://wysihrzbnxhfnymtnvzj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경변수 검증
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
  throw new Error('Supabase anon key가 누락되었습니다. VITE_SUPABASE_ANON_KEY 환경변수를 확인하세요.');
}

// Supabase 클라이언트 생성 시 옵션 추가
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase; 