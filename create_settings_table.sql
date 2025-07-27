-- settings 테이블 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. settings 테이블 생성
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT DEFAULT '에스테틱 샵',
    business_phone TEXT DEFAULT '02-1234-5678',
    business_address TEXT DEFAULT '서울시 강남구 테헤란로 123',
    business_hours TEXT DEFAULT '09:00-18:00',
    language TEXT DEFAULT 'ko',
    appointment_time_interval INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 생성
-- 사용자는 자신의 설정만 읽을 수 있음
CREATE POLICY "Users can view own settings" ON settings
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 설정만 생성할 수 있음
CREATE POLICY "Users can insert own settings" ON settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 설정만 수정할 수 있음
CREATE POLICY "Users can update own settings" ON settings
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 설정만 삭제할 수 있음
CREATE POLICY "Users can delete own settings" ON settings
    FOR DELETE USING (auth.uid() = user_id);

-- 4. updated_at 자동 업데이트를 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. updated_at 트리거 생성
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 테이블 생성 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- 7. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'settings'; 