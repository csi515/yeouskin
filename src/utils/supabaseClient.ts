import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 누락되었습니다. .env 파일 또는 Render 환경변수를 확인하세요.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 