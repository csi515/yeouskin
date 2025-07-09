# Supabase MCP 연결 설정 가이드

## 개요
이 프로젝트는 Supabase를 백엔드 데이터베이스로 사용하는 CRM 시스템입니다. MCP(Model Context Protocol)를 통해 Supabase와 연결하여 데이터를 관리합니다.

## 설정 단계

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=https://supabase.com/dashboard/project/wysihrzbnxhfnymtnvzj
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY

# 개발 서버 설정
VITE_API_URL=http://localhost:3001
```

### 2. 데이터베이스 스키마 적용
Supabase 대시보드에서 SQL 편집기를 열고 `supabase_schema.sql` 파일의 내용을 실행하세요.

### 3. 연결 테스트
1. 개발 서버를 실행: `npm run dev`
2. 브라우저에서 `http://localhost:5173` 접속
3. 설정 페이지로 이동
4. "Supabase MCP 연결 테스트" 섹션에서 연결 상태 확인

## 파일 구조

```
src/
├── utils/
│   ├── supabaseClient.ts      # 기본 Supabase 클라이언트
│   └── supabaseMCP.ts         # MCP 연결 유틸리티
├── components/
│   └── SupabaseMCPTest.tsx    # 연결 테스트 컴포넌트
└── pages/
    └── Settings.tsx           # 설정 페이지 (MCP 테스트 포함)
```

## 주요 기능

### SupabaseMCP 클래스
- `testConnection()`: Supabase 연결 테스트
- `getSchemaInfo()`: 데이터베이스 스키마 정보 조회
- `getCustomers()`: 고객 데이터 조회
- `getAppointments()`: 예약 데이터 조회
- `getProducts()`: 상품 데이터 조회
- `getFinance()`: 재무 데이터 조회

### 연결 테스트 컴포넌트
- 실시간 연결 상태 표시
- 데이터베이스 스키마 정보 표시
- 각 테이블의 데이터 개수 확인
- 연결 재시도 기능

## 문제 해결

### 연결 실패 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 상태 확인
4. 브라우저 콘솔에서 오류 메시지 확인

### 데이터 조회 실패 시
1. 데이터베이스 스키마가 올바르게 적용되었는지 확인
2. RLS(Row Level Security) 정책 확인
3. 테이블에 데이터가 있는지 확인

## 추가 설정

### Supabase CLI 사용 (선택사항)
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
npx supabase init

# 로컬 개발 환경 설정
npx supabase start
```

### 환경별 설정
- **개발**: `VITE_API_URL=http://localhost:3001`
- **프로덕션**: `VITE_API_URL=https://your-domain.com`

## 보안 고려사항

1. **환경 변수**: 민감한 정보는 반드시 환경 변수로 관리
2. **RLS 정책**: 데이터베이스 레벨에서 접근 제어 설정
3. **API 키**: 서비스 역할 키는 서버에서만 사용
4. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용

## 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase 대시보드의 로그 섹션
2. 브라우저 개발자 도구의 네트워크 탭
3. 콘솔 오류 메시지
4. 환경 변수 설정 상태 