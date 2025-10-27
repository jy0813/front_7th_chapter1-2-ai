# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

일정 관리 캘린더 애플리케이션 (React + TypeScript + Vite)
- 일정 생성/수정/삭제 및 알림 기능
- 주간/월간 캘린더 뷰 제공
- 일정 검색 및 카테고리 분류
- 공휴일 API 연동

## 개발 명령어

### 필수 개발 명령어
```bash
# 개발 서버 실행 (Vite + Express 서버 동시 실행)
pnpm dev

# Vite 개발 서버만 실행
pnpm start

# Express API 서버만 실행
pnpm server
pnpm server:watch  # watch 모드

# 프로덕션 빌드
pnpm build
```

### 테스트 명령어
```bash
# 테스트 실행 (watch 모드)
pnpm test

# 테스트 UI
pnpm test:ui

# 커버리지 리포트 생성
pnpm test:coverage
```

### 린트 명령어
```bash
# 전체 린트 검사 (ESLint + TypeScript)
pnpm lint

# ESLint만 실행
pnpm lint:eslint

# TypeScript 타입 체크만 실행
pnpm lint:tsc
```

## 아키텍처 구조

### 계층 구조
```
src/
├── App.tsx              # 메인 애플리케이션 컴포넌트 (모든 UI 렌더링)
├── hooks/               # 커스텀 훅 (비즈니스 로직 분리)
│   ├── useCalendarView.ts    # 캘린더 뷰 상태 관리
│   ├── useEventForm.ts        # 일정 폼 상태 및 유효성 검증
│   ├── useEventOperations.ts # 일정 CRUD API 호출
│   ├── useNotifications.ts    # 알림 시스템
│   └── useSearch.ts           # 검색 필터링
├── utils/               # 순수 유틸리티 함수
│   ├── dateUtils.ts           # 날짜 포맷팅 및 계산
│   ├── eventUtils.ts          # 일정 데이터 처리
│   ├── eventOverlap.ts        # 일정 겹침 감지
│   ├── timeValidation.ts      # 시간 유효성 검증
│   └── notificationUtils.ts   # 알림 로직
├── apis/                # API 통신
│   └── fetchHolidays.ts       # 공휴일 API
├── __tests__/           # 테스트 파일
│   ├── unit/                  # 단위 테스트
│   ├── hooks/                 # 훅 테스트
│   └── medium.integration.spec.tsx  # 통합 테스트
├── __mocks__/           # MSW 핸들러 및 테스트 데이터
└── types.ts             # TypeScript 타입 정의
```

### 설계 패턴

**단일 컴포넌트 구조**
- `App.tsx`가 모든 UI를 렌더링하는 단일 컴포넌트 구조
- 비즈니스 로직은 커스텀 훅으로 분리하여 관심사 분리
- 상태 관리는 React 기본 hooks (useState, useEffect) 사용

**Hooks 기반 아키텍처**
- `useEventForm`: 폼 상태, 유효성 검증, 에러 메시지 관리
- `useEventOperations`: API 호출 및 데이터 동기화
- `useCalendarView`: 캘린더 네비게이션 및 공휴일 데이터
- `useNotifications`: 일정 알림 시스템
- `useSearch`: 검색어 기반 일정 필터링

**Utils 함수 설계 원칙**
- 순수 함수로 구현 (부수효과 없음)
- 단위 테스트 가능하도록 설계
- 날짜/시간 로직, 일정 계산, 유효성 검증 등 재사용 가능한 로직

**데이터 흐름**
1. 사용자 입력 → `useEventForm` (유효성 검증)
2. 폼 제출 → `useEventOperations` (API 호출)
3. 서버 응답 → 상태 업데이트 → UI 리렌더링
4. `useNotifications`가 이벤트 목록 감시하여 알림 표시

### API 서버 (server.js)

**Express 서버**
- 포트 3000에서 실행
- JSON 파일 기반 데이터베이스 (`realEvents.json` / `e2e.json`)
- E2E 테스트 환경 지원 (`TEST_ENV=e2e`)

**엔드포인트**
- `GET /api/events` - 모든 일정 조회
- `POST /api/events` - 단일 일정 생성
- `PUT /api/events/:id` - 단일 일정 수정
- `DELETE /api/events/:id` - 단일 일정 삭제
- `POST /api/events-list` - 반복 일정 생성 (여러 일정 동시 생성)
- `PUT /api/events-list` - 여러 일정 수정
- `DELETE /api/events-list` - 여러 일정 삭제
- `PUT /api/recurring-events/:repeatId` - 반복 일정 시리즈 수정
- `DELETE /api/recurring-events/:repeatId` - 반복 일정 시리즈 삭제

**데이터 저장 방식**
- 파일 시스템 기반 JSON 저장
- UUID로 일정 ID 생성
- 반복 일정은 `repeat.id`로 그룹 관리

### 테스트 전략

**테스트 구조**
- `unit/`: 유틸리티 함수 단위 테스트 (`easy.*.spec.ts`)
- `hooks/`: 커스텀 훅 테스트
- `medium.integration.spec.tsx`: 컴포넌트 통합 테스트

**테스트 도구**
- Vitest: 테스트 러너
- Testing Library: React 컴포넌트 테스트
- MSW: API 모킹
- jsdom: 브라우저 환경 시뮬레이션

**테스트 실행 환경**
- `setupTests.ts`에서 전역 설정
- MSW handlers로 API 응답 모킹
- `.coverage/` 디렉토리에 커버리지 리포트 생성

### 주요 기술 스택

**UI 라이브러리**
- Material-UI (MUI) v7 - UI 컴포넌트
- Emotion - CSS-in-JS
- Framer Motion - 애니메이션
- notistack - 토스트 알림

**개발 도구**
- Vite - 빌드 도구
- TypeScript - 타입 안정성
- ESLint + Prettier - 코드 품질

**테스트**
- Vitest - 테스트 프레임워크
- Testing Library - React 테스트 유틸리티
- MSW - API 모킹

## 개발 시 주의사항

### 타입 정의
- `types.ts`에 정의된 `Event`, `EventForm`, `RepeatInfo` 타입 사용
- 모든 이벤트 데이터는 `Event` 인터페이스를 준수해야 함
- 반복 일정은 `RepeatInfo` 인터페이스 구조 유지

### 일정 검증 로직
- 시간 유효성: `utils/timeValidation.ts`의 `getTimeErrorMessage` 사용
- 일정 겹침: `utils/eventOverlap.ts`의 `findOverlappingEvents` 사용
- 날짜 계산: `utils/dateUtils.ts`의 함수들 활용

### 반복 일정 (현재 비활성화)
- UI는 주석 처리되어 있음 (8주차 과제 예정)
- 서버 API는 구현되어 있음
- `repeat.type`이 'none'인 경우 일반 일정으로 처리

### 테스트 작성 가이드
- 유틸리티 함수는 `unit/` 디렉토리에 단위 테스트 작성
- 훅은 `renderHook`을 사용하여 테스트
- 통합 테스트는 실제 사용자 시나리오 기반으로 작성
- MSW handlers는 `__mocks__/handlers.ts`에 정의

### API 통신
- Vite dev server의 프록시를 통해 `/api` 요청을 `localhost:3000`으로 전달
- `pnpm dev` 명령어로 Vite와 Express 서버를 동시 실행해야 함
- 테스트 환경에서는 MSW로 API 모킹

### 상태 관리 패턴
- 전역 상태 관리 라이브러리 없음 (React 기본 hooks 사용)
- 각 훅이 독립적으로 상태 관리
- Props drilling을 통한 데이터 전달
- 서버 상태는 `useEventOperations`에서 관리

## 프로젝트 특징

### 과제 기반 프로젝트
- AI와 테스트를 활용한 안정적인 기능 개발 학습
- 단위 테스트 기반 TDD 접근
- AI 도구 활용 및 개선 실험

### 코드 작성 원칙
- 유틸리티 함수는 순수 함수로 작성
- 비즈니스 로직과 UI 로직 분리
- 타입 안정성 유지
- 테스트 가능한 코드 구조
