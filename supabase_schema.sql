-- Supabase CRM 시스템 테이블 구조
-- 기존 데이터 삭제 및 테이블 재생성

-- 기존 테이블 및 관련 객체 삭제 (CASCADE로 의존성 있는 객체도 함께 삭제)
DROP TABLE IF EXISTS finance CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 기존 뷰 삭제
DROP VIEW IF EXISTS appointment_details CASCADE;
DROP VIEW IF EXISTS finance_summary CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS get_customer_appointments(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_finance_stats(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 1. 고객 테이블 (customers)
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    skin_type VARCHAR(20) CHECK (skin_type IN ('dry', 'oily', 'combination', 'sensitive', 'normal')),
    memo TEXT,
    point INTEGER DEFAULT 0,
    purchased_products TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블 (products)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('voucher', 'single')),
    count INTEGER CHECK (count > 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 예약 테이블 (appointments)
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    memo TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 재무 테이블 (finance)
CREATE TABLE finance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    title VARCHAR(200) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 설정 테이블 (settings)
CREATE TABLE settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name VARCHAR(200),
    business_phone VARCHAR(20),
    business_address TEXT,
    business_hours TEXT,
    default_appointment_duration INTEGER DEFAULT 60 CHECK (default_appointment_duration > 0),
    auto_backup BOOLEAN DEFAULT true,
    backup_interval INTEGER DEFAULT 7 CHECK (backup_interval > 0),
    language VARCHAR(10) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_datetime ON appointments(datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_finance_date ON finance(date);
CREATE INDEX idx_finance_type ON finance(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(type);

-- RLS (Row Level Security) 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (모든 사용자가 모든 데이터에 접근 가능)
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON appointments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON finance FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON finance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON finance FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON finance FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON settings FOR DELETE USING (true);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO settings (business_name, business_phone, business_address, business_hours) 
VALUES ('에스테틱 샵', '02-1234-5678', '서울시 강남구 테헤란로 123', '평일 09:00-18:00, 토요일 09:00-15:00');

-- 뷰 생성 (자주 사용되는 쿼리를 위한 뷰)
CREATE VIEW appointment_details AS
SELECT 
    a.id,
    a.datetime,
    a.status,
    a.memo as appointment_memo,
    c.name as customer_name,
    c.phone as customer_phone,
    p.name as product_name,
    p.price as product_price,
    p.type as product_type
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN products p ON a.product_id = p.id;

CREATE VIEW finance_summary AS
SELECT 
    date,
    type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM finance
GROUP BY date, type
ORDER BY date DESC;

-- 함수 생성 (유용한 함수들)
CREATE OR REPLACE FUNCTION get_customer_appointments(customer_uuid UUID)
RETURNS TABLE (
    appointment_id UUID,
    datetime TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    product_name VARCHAR(200),
    product_price INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.datetime,
        a.status,
        p.name,
        p.price
    FROM appointments a
    JOIN products p ON a.product_id = p.id
    WHERE a.customer_id = customer_uuid
    ORDER BY a.datetime DESC;
END;
$$ LANGUAGE plpgsql;

-- 월별 재무 통계 함수
CREATE OR REPLACE FUNCTION get_monthly_finance_stats(year_month VARCHAR(7))
RETURNS TABLE (
    total_income BIGINT,
    total_expense BIGINT,
    net_profit BIGINT,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_profit,
        COUNT(*) as transaction_count
    FROM finance
    WHERE TO_CHAR(date, 'YYYY-MM') = year_month;
END;
$$ LANGUAGE plpgsql; 