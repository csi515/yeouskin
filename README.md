# 에스테틱 샵 CRM 시스템

에스테틱 샵을 위한 종합적인 고객 관계 관리(CRM) 시스템입니다. 고객 관리, 예약 관리, 상품 관리, 재무 관리 기능을 제공합니다.

## 🚀 주요 기능

- **고객 관리**: 고객 정보 등록, 수정, 삭제, 검색
- **예약 관리**: 캘린더 기반 예약 시스템, 예약 상태 관리
- **상품 관리**: 서비스 상품 등록 및 관리
- **재무 관리**: 수입/지출 기록, 월별 통계
- **대시보드**: 실시간 통계 및 현황 파악
- **사용자 인증**: 안전한 로그인/회원가입 시스템

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Deployment**: GitHub Pages, Netlify

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/crm-esthetic-shop.git
cd crm-esthetic-shop
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🗄️ 데이터베이스 설정

### Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase_schema.sql` 파일 실행
3. Authentication > Settings에서 이메일 인증 활성화
4. API Keys에서 URL과 anon key 복사

### 데이터베이스 스키마

- **customers**: 고객 정보 (이름, 연락처, 피부타입, 포인트 등)
- **products**: 상품 정보 (이름, 가격, 타입, 상태 등)
- **appointments**: 예약 정보 (고객, 상품, 날짜, 상태 등)
- **purchases**: 구매 내역 (고객, 상품, 수량, 날짜 등)
- **finance**: 재무 기록 (수입/지출, 금액, 메모 등)
- **settings**: 사용자 설정 (사업장 정보, 언어 등)

## 🔒 보안 기능

- **Row Level Security (RLS)**: 사용자별 데이터 분리
- **JWT 인증**: 안전한 사용자 인증
- **CORS 설정**: 보안 헤더 구성
- **환경 변수**: 민감한 정보 보호

## 🚀 배포

### GitHub Pages 배포
```bash
npm run build
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Netlify 배포
```bash
npm run build:netlify
```

## 🔧 데이터베이스 연결 문제 해결

### 1. 연결 상태 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인
- Supabase 프로젝트 설정에서 API 키 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 2. CORS 오류 해결
- Supabase 프로젝트 설정에서 허용된 도메인 추가
- GitHub Pages: `https://your-username.github.io`
- Netlify: `https://your-site.netlify.app`

### 3. 인증 오류 해결
- Supabase Authentication 설정 확인
- 이메일 인증 활성화
- 리다이렉트 URL 설정

### 4. RLS 정책 확인
- 데이터베이스에서 RLS 정책이 올바르게 설정되었는지 확인
- 사용자 인증 상태 확인

## 📱 사용법

### 1. 회원가입/로그인
- 이메일과 비밀번호로 계정 생성
- 비밀번호 재설정 기능 제공

### 2. 고객 관리
- 새 고객 등록
- 고객 정보 수정/삭제
- 고객 검색 및 필터링

### 3. 예약 관리
- 캘린더에서 날짜 선택
- 고객과 상품 선택
- 예약 상태 관리 (예약됨, 완료, 취소, 노쇼)

### 4. 상품 관리
- 서비스 상품 등록
- 가격 및 설명 설정
- 상품 상태 관리

### 5. 재무 관리
- 수입/지출 기록
- 월별 통계 확인
- 재무 요약 대시보드

## 🐛 문제 해결

### 빌드 오류
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm run build -- --force
```

### 데이터베이스 연결 오류
1. Supabase 프로젝트 상태 확인
2. API 키 유효성 검증
3. 네트워크 연결 확인
4. 브라우저 콘솔에서 오류 메시지 확인

### 인증 오류
1. Supabase Authentication 설정 확인
2. 이메일 인증 활성화
3. 리다이렉트 URL 설정
4. 세션 만료 시 재로그인

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**에스테틱 샵 CRM 시스템** - 효율적인 고객 관리의 시작 
