# CRM 시스템 - 에스테틱 샵

에스테틱 샵을 위한 고객 관계 관리(CRM) 시스템입니다.

## 🚀 기능

- **고객 관리**: 고객 정보 등록, 수정, 조회
- **예약 관리**: 예약 등록, 일정 관리, 상태 추적
- **재무 관리**: 매출, 지출, 수익 관리 및 분석
- **상품 관리**: 서비스 상품 등록 및 관리
- **적립금 관리**: 고객 적립금 적립 및 사용 관리
- **설정**: 시스템 설정 및 환경 구성

## 📁 프로젝트 구조

```
src/
├── components/        # 공통 UI 컴포넌트
│   ├── Sidebar.tsx   # 사이드바 네비게이션
│   ├── Layout.tsx    # 레이아웃 컴포넌트
│   ├── ErrorBoundary.tsx # 에러 처리
│   └── ...           # 기타 컴포넌트
├── pages/            # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── CustomerManagement.tsx
│   ├── AppointmentManagement.tsx
│   ├── FinanceManagement.tsx
│   ├── ProductManagement.tsx
│   └── Settings.tsx
├── types/            # TypeScript 타입 정의
│   └── index.ts
├── utils/            # 유틸리티 함수
│   ├── supabaseClient.ts
│   ├── supabaseMCP.ts
│   └── migrateToSupabase.ts
├── App.tsx           # 메인 앱 컴포넌트
├── main.tsx          # 앱 진입점
├── App.css           # 앱 스타일
└── index.css         # 전역 스타일
```

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Data Management**: Supabase (PostgreSQL) + LocalStorage (백업)
- **Date Handling**: date-fns
- **Calendar**: react-calendar

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 미리보기
```bash
npm run preview
```

## 🔧 개발

### 스크립트
- `npm run dev`: 개발 서버 실행 (포트 3001)
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드된 앱 미리보기
- `npm run lint`: ESLint 검사
- `npm run type-check`: TypeScript 타입 검사
- `npm run server`: 백엔드 서버 실행

### 코드 구조
- **컴포넌트**: 재사용 가능한 UI 컴포넌트
- **페이지**: 각 기능별 페이지 컴포넌트
- **타입**: TypeScript 인터페이스 및 타입 정의
- **유틸리티**: 공통 함수 및 헬퍼

## 📊 데이터 관리

시스템은 Supabase를 기본 데이터베이스로 사용하며, LocalStorage를 백업으로 사용합니다:
- 고객 정보 (customers)
- 예약 정보 (appointments)
- 상품 정보 (products)
- 재무 데이터 (finance)

### Supabase 설정

Supabase를 사용하려면 환경변수를 설정하세요:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 데이터 마이그레이션

기존 LocalStorage 데이터를 Supabase로 마이그레이션할 수 있습니다:
1. 설정 페이지로 이동
2. "데이터 마이그레이션" 섹션에서 마이그레이션 실행
3. 마이그레이션 완료 후 로컬 데이터 정리

## 🎨 UI/UX

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **직관적 네비게이션**: 사이드바 기반 메뉴 구조
- **모던 UI**: Tailwind CSS 기반 깔끔한 디자인
- **에러 처리**: ErrorBoundary를 통한 안정적인 에러 처리
- **로딩 상태**: 사용자 친화적인 로딩 UI

## 🔒 보안

- 모든 데이터는 로컬에 저장됩니다
- Supabase 사용 시 RLS(Row Level Security) 적용
- 환경변수를 통한 민감한 정보 관리

## 🚀 배포

### Render 배포

1. GitHub 리포지토리를 Render에 연결
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Environment Variables 설정 (필요시)

### Vercel 배포

1. Vercel에 GitHub 리포지토리 연결
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

## 🔄 업데이트 로그

### v1.0.0
- 초기 CRM 시스템 구현
- 고객, 예약, 재무, 상품 관리 기능
- 반응형 UI 및 에러 처리
- Supabase 연동 지원 