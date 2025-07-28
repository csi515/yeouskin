# CRM 시스템 - 에스테틱 샵

Customer Relationship Management System for Esthetic Shop

## 🚀 주요 기능

- **고객 관리**: 고객 정보 등록, 수정, 삭제, 검색
- **상품 관리**: 상품 등록, 가격 관리, 재고 관리
- **예약 관리**: 예약 생성, 수정, 취소, 상태 관리
- **재무 관리**: 수입/지출 기록, 월별 통계
- **데이터 분석**: 대시보드를 통한 실시간 현황 파악

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: GitHub Pages, Netlify

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```

## 🔧 데이터베이스 연결 문제 해결

### GitHub Pages에서 흰 화면이 나오는 경우

1. **개발 서버로 실행**: `npm run dev` 후 `http://localhost:3000` 접속
2. **환경 변수 확인**: Supabase URL과 API 키가 올바른지 확인
3. **브라우저 캐시 삭제**: Ctrl+F5로 강제 새로고침

### 데이터베이스 연결 오류

1. **연결 상태 확인**: "상세 진단" 버튼 클릭
2. **Supabase 프로젝트 상태**: Supabase 대시보드에서 프로젝트 활성 상태 확인
3. **API 키 확인**: 올바른 anon key 사용 여부 확인
4. **CORS 설정**: Supabase 프로젝트 설정에서 도메인 허용 확인

### 일반적인 문제 해결

- **네트워크 오류**: 인터넷 연결 확인
- **인증 오류**: Supabase API 키 재생성
- **권한 오류**: RLS(Row Level Security) 설정 확인

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── contexts/           # React Context
├── pages/             # 페이지 컴포넌트
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
│   ├── supabase.ts    # Supabase API 래퍼
│   └── supabaseClient.ts # Supabase 클라이언트 설정
└── App.tsx            # 메인 앱 컴포넌트
```

## 🚀 배포

### GitHub Pages
```bash
npm run build:github
npm run deploy
```

### Netlify
```bash
npm run build:netlify
```

## 🔍 디버깅

### 개발자 도구 활용
1. **Console 탭**: JavaScript 오류 확인
2. **Network 탭**: API 요청/응답 확인
3. **Application 탭**: 로컬 스토리지 확인

### 로그 확인
- 개발 모드에서 브라우저 콘솔에서 Supabase 연결 정보 확인
- "상세 진단" 기능으로 구체적인 오류 정보 확인

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 
