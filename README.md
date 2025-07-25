# 에스테틱 샵 CRM 시스템

React + TypeScript + Supabase로 구축된 에스테틱 샵 전용 CRM 시스템입니다.

## 🚀 주요 기능

- **고객 관리**: 고객 정보, 피부 타입, 포인트 관리
- **상품 관리**: 시술 상품, 패키지, 가격 관리
- **예약 관리**: 예약 일정, 상태 관리
- **재무 관리**: 수입/지출, 월별 통계
- **설정**: 매장 정보, 시스템 설정

##  기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Render (Static Site)

## 📦 설치 및 실행
## 🗄 Supabase 데이터베이스 설정

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 anon key 확인

또는 서비스 롤 키를 사용하여 스크립트로 설정:
```bash
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
node setup-supabase.js
```


## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── pages/              # 페이지 컴포넌트
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── App.tsx             # 메인 앱 컴포넌트
```

## 🔧 개발 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run type-check   # TypeScript 타입 체크
```

## 🛡 보안

- Supabase RLS (Row Level Security) 활성화
- 환경변수를 통한 민감한 정보 관리
- CSP 헤더 설정으로 XSS 방지

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요. 
