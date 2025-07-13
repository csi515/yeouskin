#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = 'https://wysihrzbnxhfnymtnvzj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 롤 키가 필요합니다

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
  console.log('Supabase 대시보드에서 Service Role Key를 확인하고 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Supabase 데이터베이스 설정을 시작합니다...');
    
    // SQL 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'supabase_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('스키마 적용 중 오류:', error);
      return;
    }
    
    console.log('✅ Supabase 데이터베이스 설정이 완료되었습니다!');
    console.log('이제 CRM 시스템을 사용할 수 있습니다.');
    
  } catch (error) {
    console.error('데이터베이스 설정 중 오류:', error);
  }
}

// 스크립트 실행
setupDatabase();