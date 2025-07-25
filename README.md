# 🌸 CRM 시스템 - 에스테틱 샵

> 에스테틱 샵을 위한 현대적이고 사용자 친화적인 고객 관리 시스템

[![Deploy to GitHub Pages](https://github.com/csi515/yeouskin/actions/workflows/deploy.yml/badge.svg)](https://github.com/csi515/yeouskin/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://csi515.github.io/yeouskin/)

## 🚀 라이브 데모

**👉 [CRM 시스템 체험하기](https://csi515.github.io/yeouskin/)**

## 📋 프로젝트 소개

에스테틱 샵 운영에 필요한 모든 기능을 통합한 웹 기반 CRM(고객 관계 관리) 시스템입니다. 
고객 정보 관리, 예약 스케줄링, 상품 관리, 재무 관리를 하나의 플랫폼에서 효율적으로 처리할 수 있습니다.

## ✨ 주요 기능

### 👥 고객 관리
- **고객 정보 등록/수정/삭제**
- **상세 고객 프로필** (연락처, 생년월일, 피부타입, 메모)
- **포인트 시스템** 관리
- **고객 검색** 및 필터링

### 📅 예약 관리
- **실시간 예약 스케줄링**
- **캘린더 뷰** 지원
- **예약 상태 관리** (예약됨, 완료, 취소, 노쇼)
- **고객별 예약 이력** 조회

### 🛍️ 상품 관리
- **서비스/상품 등록/관리**
- **가격 정책** 설정
- **바우처/일회성** 상품 구분
- **상품 활성화/비활성화** 관리

### 💰 재무 관리
- **수입/지출 기록**
- **월별 재무 현황**
- **카테고리별 분석**
- **수익성 리포트**

### 🎨 사용자 경험
- **반응형 디자인** - 데스크톱/태블릿/모바일 지원
- **다크/라이트 테마**
- **직관적인 UI/UX**
- **실시간 데이터 동기화**

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router v6** - 라우팅

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 실시간 구독
  - 인증 및 권한 관리
  - RESTful API

### 배포 & CI/CD
- **GitHub Pages** - 정적 사이트 호스팅
- **GitHub Actions** - 자동 배포
- **Vercel** (옵션) - 대안 배포 플랫폼

### 개발 도구
- **ESLint** - 코드 품질
- **Prettier** - 코드 포맷팅
- **PostCSS** - CSS 후처리

## 🚦 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 복제**
```bash
git clone https://github.com/csi515/yeouskin.git
cd yeouskin
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 시작**
```bash
npm run dev
```

4. **브라우저에서 확인**
```
http://localhost:3000
```

### 빌드

**프로덕션 빌드:**
```bash
npm run build
```

**GitHub Pages용 빌드:**
```bash
npm run build:github
```

## 🌐 배포

### GitHub Pages 자동 배포

이 프로젝트는 **GitHub Actions**를 통해 자동으로 배포됩니다:

1. `main` 브랜치에 코드 push
2. GitHub Actions가 자동으로 빌드 및 배포
3. **https://csi515.github.io/yeouskin/** 에서 확인

### 수동 배포

```bash
# GitHub Pages용 빌드 및 배포
npm run deploy
```

## 🔧 설정

### Supabase 연결

이 프로젝트는 Supabase를 백엔드로 사용합니다. GitHub Pages 배포를 위해 연결 정보가 코드에 직접 설정되어 있습니다.

개발 환경에서 다른 Supabase 프로젝트를 사용하려면:

1. `src/utils/supabaseClient.ts` 파일 수정
2. URL과 Anon Key를 본인의 Supabase 프로젝트 정보로 변경

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── CustomerForm.tsx
│   ├── AppointmentForm.tsx
│   ├── ProductForm.tsx
│   └── ...
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── CustomerManagement.tsx
│   └── ...
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── SettingsContext.tsx
├── utils/              # 유틸리티 함수
│   ├── supabase.ts
│   └── ...
├── types/              # TypeScript 타입 정의
└── ...
```

## 🐛 해결된 주요 이슈

### GitHub Pages 배포 최적화
- ✅ **MIME Type 문제** 해결 (`.nojekyll` 파일 적용)
- ✅ **React Router** HashRouter 적용
- ✅ **환경변수** 하드코딩으로 런타임 의존성 제거
- ✅ **Vite 빌드** IIFE 형식으로 호환성 향상

### 성능 최적화
- ✅ **번들 크기** 최적화
- ✅ **ES2015** 타겟으로 브라우저 호환성 확보
- ✅ **코드 스플리팅** 적용

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for Esthetic Shops** 
