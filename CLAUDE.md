# CLAUDE.md

**문서 버전**: 2.6.0
**최종 업데이트**: 2025-10-29
**이전 버전**: 2.5.0 (Agent 2 커밋 정보), 2.4.0 (전체 6 Agent 시스템 완성), 2.3.0 (테스트 설계 Agent), 2.2.0 (기능 설계 Agent), 2.1.0 (6개 Agent 시스템), 2.0.0 (명세 기반 개발 + TDD 통합), 1.0.0 (초기 문서)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 문서 변경 이력

### v2.6.0 (2025-10-29)
- **추가**: Agent 시스템 산출물 흐름도 추가
  - 6개 Agent 간 산출물 참조 관계 시각화
  - 각 Agent의 산출물 경로 명시 (specs/, claudedocs/, src/)
  - 산출물 활용 방법 가이드 추가
- **개선**: 모든 Agent 명세서 산출물 섹션에 구체적 경로 추가
  - Agent 1-6 출력물에 파일 경로 및 참조 관계 명시
  - 각 산출물이 다른 Agent에게 어떻게 활용되는지 설명 추가
- **개선**: Agent 2 출력물 예시 명확화
  - 테스트 구조 설계로만 제한 (실제 코드는 Agent 3이 작성)
  - 역할 중복 방지를 위한 경고 추가

### v2.5.0 (2025-10-29)
- **추가**: Agent 2 커밋 정보 추가
  - Agent 2도 테스트 구조 설계 후 Git 커밋 수행
  - 커밋 태그: `test: [DESIGN]`
  - 총 커밋 수: 20개 → 21개 (명세 1 + 설계 1 + 기능 6×3 + 문서 1)
- **개선**: Agent 2 출력물 섹션에 Git 커밋 추가
- **개선**: Git 커밋 컨벤션 섹션에 `test: [DESIGN]` 태그 추가

### v2.4.0 (2025-10-28)
- **추가**: 나머지 4개 Agent 서브 에이전트 정의 파일 생성
  - red-phase-agent.md (Agent 3)
  - green-phase-agent.md (Agent 4)
  - refactor-agent.md (Agent 5)
  - orchestrator-agent.md (Agent 6)
- **추가**: Agent 3-6 섹션에 서브 에이전트 링크 및 호출 방법 추가
- **추가**: rules를 지켜야 하는 Agent 명시 (Agent 3: 필수 준수)
- **완성**: 전체 6 Agent 시스템 문서화 완료

### v2.3.0 (2025-10-28)
- **추가**: 테스트 설계 Agent 서브 에이전트 정의 파일 생성 (.claude/agents/test-design-agent.md)
- **추가**: Agent 2 섹션에 서브 에이전트 링크 및 호출 방법 추가

### v2.2.0 (2025-10-28)
- **추가**: 기능 설계 Agent 서브 에이전트 정의 파일 생성 (.claude/agents/feature-design-agent.md)
- **추가**: 서브 에이전트 호출 방법 및 참조 추가
- **개선**: Agent 1 섹션에 서브 에이전트 링크 추가

### v2.1.0 (2025-10-28)
- **추가**: 6개 Agent 시스템 설명 및 활용 가이드
- **추가**: 반복 일정 기능 구현 워크플로우 참조
- **추가**: AI 협업 리포트 템플릿 참조
- **개선**: 프로젝트 문서 참조 구조 명확화

### v2.0.0 (2025-10-27)
- **추가**: 명세 기반 개발(Specification-Driven Development) 섹션
- **추가**: TDD(Test-Driven Development) 워크플로우 가이드
- **추가**: 테스트 규칙 (Testing Library + TDD 원칙) 통합
- **추가**: AI 도구 활용 가이드 (명세 + 규칙 기반 개발)
- **개선**: 프로젝트 구조 설명 강화
- **개선**: 개발 시 주의사항 명확화

### v1.0.0 (초기)
- 기본 프로젝트 개요 및 아키텍처 설명

---

## 프로젝트 개요

일정 관리 캘린더 애플리케이션 (React + TypeScript + Vite)
- 일정 생성/수정/삭제 및 알림 기능
- 주간/월간 캘린더 뷰 제공
- 일정 검색 및 카테고리 분류
- 공휴일 API 연동

### 프로젝트 특징

**명세 기반 개발 (Specification-Driven Development)**
- `specs/` 디렉토리에 살아있는 문서(Living Documentation)로 모든 요구사항 정의
- AI가 명세를 읽고 코드를 생성할 수 있는 수준의 상세 명세
- 명세 → 테스트 → 구현 순서로 개발 진행

**TDD(Test-Driven Development) 기반**
- Red-Green-Refactor 사이클 엄격히 준수
- 단위 테스트 기반 순수 함수 설계
- `rules/` 디렉토리에 테스트 작성 규칙 정의

**AI 협업 최적화**
- Claude Code, GitHub Copilot, Cursor 등 AI 도구 활용 가이드 제공
- 명세와 규칙을 AI가 이해하고 코드 생성하도록 구조화
- 6개 Agent 시스템으로 역할 분담 및 품질 관리

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
- JSON 파일 기반 데이터베이스 (`realEvents.json`)

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

---

## 명세 기반 개발 (Specification-Driven Development)

### 명세 문서 구조 (`specs/`)

프로젝트의 모든 요구사항은 `specs/` 디렉토리에 문서화되어 있습니다.

| 문서 | 설명 | AI 도구 활용 |
|------|------|-------------|
| [README.md](./specs/README.md) | 명세 개요 및 TDD 워크플로우 | 개발 전 필수 읽기 |
| [01-data-models.md](./specs/01-data-models.md) | TypeScript 타입 정의 및 필드 제약 | 타입 생성 시 참조 |
| [02-business-rules.md](./specs/02-business-rules.md) | 비즈니스 로직 및 제약사항 | 검증 로직 구현 시 참조 |
| [03-user-workflows.md](./specs/03-user-workflows.md) | 사용자 시나리오 및 워크플로우 | 통합 테스트 작성 시 참조 |
| [04-api-specification.md](./specs/04-api-specification.md) | REST API 엔드포인트 상세 | API 호출 코드 작성 시 참조 |
| [05-validation-rules.md](./specs/05-validation-rules.md) | 입력 유효성 검증 로직 | 유효성 검증 함수 구현 시 참조 |
| [06-event-overlap-detection.md](./specs/06-event-overlap-detection.md) | 일정 겹침 감지 알고리즘 | 겹침 로직 구현 시 참조 |
| [07-notification-system.md](./specs/07-notification-system.md) | 알림 시스템 트리거 로직 | 알림 기능 구현 시 참조 |
| [08-test-scenarios.md](./specs/08-test-scenarios.md) | 수용 기준 및 테스트 케이스 | 테스트 작성 시 참조 |

### 명세 활용 원칙

**1. 명세를 먼저 읽고 구현**
```bash
# Claude Code 사용 예시
"specs/05-validation-rules.md를 읽고 getTimeErrorMessage 함수를 TDD로 구현해줘"
```

**2. Given-When-Then 패턴 준수**
- 명세의 모든 시나리오는 Given-When-Then 형식으로 작성됨
- 테스트 코드 작성 시 이 구조를 그대로 변환

**3. 명세와 코드 동기화**
- 명세 변경 시 테스트와 구현 코드도 함께 업데이트
- Git 커밋에 명세 + 테스트 + 코드를 함께 포함

---

## 테스트 규칙 (Testing Rules)

### 테스트 규칙 문서 구조 (`rules/`)

| 문서 | 설명 | 적용 시점 |
|------|------|----------|
| [README.md](./rules/README.md) | 테스트 규칙 개요 | 테스트 작성 전 필수 읽기 |
| [testing-library-queries.md](./rules/testing-library-queries.md) | Testing Library 쿼리 우선순위 | 쿼리 선택 시 참조 |
| [react-testing-library-best-practices.md](./rules/react-testing-library-best-practices.md) | RTL 베스트 프랙티스 | 컴포넌트 테스트 시 참조 |
| [tdd-principles.md](./rules/tdd-principles.md) | TDD 원칙 및 안티패턴 | 개발 프로세스 전반 |

### 핵심 테스트 규칙

**1. Testing Library 쿼리 우선순위 (3단계)**

```typescript
// ✅ Priority 1: 접근성 쿼리 (사용자가 요소를 찾는 방식)
screen.getByRole('button', { name: /저장/i })
screen.getByLabelText('시작 시간')
screen.getByPlaceholderText('제목을 입력하세요')
screen.getByText('일정 추가')

// ⚠️ Priority 2: 시맨틱 쿼리 (차선책)
screen.getByAltText('프로필 이미지')
screen.getByTitle('도움말')

// ❌ Priority 3: Test ID (최후의 수단)
screen.getByTestId('event-form') // 다른 방법이 없을 때만 사용
```

**2. 사용자 상호작용 패턴**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ✅ userEvent 사용 (실제 사용자 행동 시뮬레이션)
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'Hello');

// ❌ fireEvent 사용하지 않기
fireEvent.click(button); // 지양
```

**3. TDD Red-Green-Refactor 사이클**

```
1. 🔴 Red: 실패하는 테스트 먼저 작성
   ├─ specs/ 명세 읽기
   ├─ Given-When-Then 형식으로 테스트 작성
   └─ pnpm test → 실패 확인

2. 🟢 Green: 테스트를 통과하는 최소한의 코드 작성
   ├─ 명세의 요구사항만 충족
   └─ pnpm test → 성공 확인

3. 🔵 Refactor: 코드 개선
   ├─ 중복 제거, 가독성 향상
   └─ pnpm test → 여전히 성공
```

### 안티패턴 방지

**❌ 하지 말아야 할 것들**
- `container.querySelector()` 사용
- 구현 후 테스트 작성
- 불필요한 `role`, `aria-*` 속성 추가
- `waitFor()` 내부에서 side effect 실행
- TypeScript 컴파일 에러 포함 커밋
- 모호한 테스트 이름

**✅ 올바른 패턴**
- `screen` 객체 사용
- 테스트 먼저 작성 (TDD)
- 시맨틱 HTML 활용
- 비동기 처리는 `waitFor()`, `findBy*` 사용
- 명확한 타입 정의
- 행동 중심 테스트 이름

---

## TDD 워크플로우 (명세 + 규칙 통합)

### 전체 개발 프로세스

```
1. 📋 명세 읽기
   └─ specs/[해당-기능].md 확인

2. 📝 규칙 확인
   └─ rules/[관련-규칙].md 검토

3. 🔴 Red: 실패하는 테스트 작성
   ├─ src/__tests__/ 디렉토리에 테스트 파일 생성
   ├─ Given-When-Then 패턴으로 테스트 작성
   ├─ Testing Library 쿼리 우선순위 준수
   └─ pnpm test → 실패 확인

4. 🟢 Green: 최소 구현
   ├─ src/utils/ 또는 src/hooks/ 에 구현
   ├─ TypeScript 타입 안전성 유지
   └─ pnpm test → 성공 확인

5. 🔵 Refactor: 코드 개선
   ├─ 중복 제거, 가독성 향상
   ├─ 명세 및 규칙 재확인
   └─ pnpm test → 여전히 성공

6. ✅ 품질 검증
   ├─ pnpm lint → ESLint + TypeScript 검사
   └─ pnpm test:coverage → 커버리지 확인

7. 📦 커밋
   └─ git commit -m "feat: [기능명] 구현 (TDD)"
```

### 실전 예시: 시간 유효성 검증 구현

#### Step 1: 명세 읽기
```bash
"specs/05-validation-rules.md의 시간 유효성 검증 규칙을 읽어줘"
```

#### Step 2: 🔴 Red - 테스트 작성
```typescript
// src/__tests__/unit/easy.timeValidation.spec.ts
import { describe, it, expect } from 'vitest';
import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환', () => {
    // Given
    const startTime = '14:00';
    const endTime = '13:00';

    // When
    const result = getTimeErrorMessage(startTime, endTime);

    // Then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
    });
  });
});
```

#### Step 3: 🟢 Green - 최소 구현
```typescript
// src/utils/timeValidation.ts
export function getTimeErrorMessage(start: string, end: string) {
  if (start >= end) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
    };
  }
  return { startTimeError: '', endTimeError: '' };
}
```

#### Step 4: 🔵 Refactor - 개선
```typescript
// src/utils/timeValidation.ts
export type TimeErrorMessage = {
  startTimeError: string;
  endTimeError: string;
};

export function getTimeErrorMessage(
  start: string,
  end: string
): TimeErrorMessage {
  const hasError = start >= end;

  return {
    startTimeError: hasError ? '시작 시간은 종료 시간보다 빨라야 합니다.' : '',
    endTimeError: hasError ? '종료 시간은 시작 시간보다 늦어야 합니다.' : ''
  };
}
```

---

## 6개 Agent 시스템

### 개요

복잡한 기능 개발을 위해 역할별로 특화된 6개 Agent를 활용하는 시스템입니다.

**참고 문서**:
- [WORKFLOW_RECURRING_EVENTS.md](./WORKFLOW_RECURRING_EVENTS.md) - 반복 일정 기능 구현 워크플로우
- [.claude/agents/](./.claude/agents/) - 서브 에이전트 정의 파일

**서브 에이전트 호출 방법**:
```bash
# Claude Code에서 직접 호출
@feature-design-agent "새로운 기능 요구사항"
```

### 산출물 흐름도

각 Agent가 생성한 산출물을 다음 Agent가 참조하여 작업합니다:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 1: Feature Design                        │
│                     (기능 설계 및 명세 작성)                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ specs/[기능명].md
                                   ├─→ claudedocs/scope-[기능명].md
                                   └─→ claudedocs/checklist-[기능명].md
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 2: Test Design                           │
│                    (테스트 구조 설계 및 데이터)                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ claudedocs/test-structure-[기능명].md
                                   ├─→ src/__tests__/__fixtures__/mock[기능명].ts
                                   └─→ Git 커밋: test: [DESIGN]
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 3: Red Phase                             │
│                   (실패하는 테스트 코드 작성)                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ src/__tests__/unit/easy.[기능명].spec.ts
                                   ├─→ 테스트 실패 로그
                                   └─→ Git 커밋: test: [RED]
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 4: Green Phase                           │
│                     (최소 구현 코드 작성)                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ src/utils/[파일명].ts 또는 src/hooks/[파일명].ts
                                   ├─→ claudedocs/implementation-[기능명].md
                                   ├─→ 테스트 성공 로그
                                   └─→ Git 커밋: feat: [GREEN]
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 5: Refactor Phase                        │
│                       (코드 품질 개선)                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ src/utils/[파일명].ts (개선된 코드)
                                   ├─→ claudedocs/refactor-[기능명].md
                                   ├─→ 테스트 통과 + 린트 검증 로그
                                   └─→ Git 커밋: refactor: [REFACTOR]
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Agent 6: Orchestrator                          │
│                   (전체 조율 및 품질 검증)                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─→ claudedocs/progress-report-[기능명].md
                                   ├─→ claudedocs/quality-report-[기능명].md
                                   ├─→ claudedocs/tdd-validation-[기능명].md
                                   └─→ claudedocs/final-report-[기능명].md
                                   │
                                   ▼
                              ✅ 완료된 기능
```

**산출물 활용 방법**:
- 각 Agent는 `Read`, `Grep`, `Glob` 도구로 이전 Agent의 산출물 읽기
- `Bash` 도구로 Git 로그 확인 및 테스트 실행
- 모든 산출물은 Git 커밋으로 버전 관리되어 추적 가능
- `claudedocs/` 디렉토리는 Agent 간 통신 및 사용자 보고용 문서 저장소

### Agent 역할 및 책임

#### Agent 1: 기능 설계 Agent (Feature Design Agent)
**Persona**: Scribe + Analyzer + Architect

**서브 에이전트 정의**: [.claude/agents/feature-design-agent.md](./.claude/agents/feature-design-agent.md)

**핵심 역할**:
- 프로젝트 분석 후 작업 범위 정리 (가장 중요!)
- 요구사항 분석 및 명세 문서 작성
- specs/ 디렉토리 업데이트
- Given-When-Then 시나리오 작성

**출력물**:
- 명세 문서 (specs/ 디렉토리)
- 작업 범위 정리 문서
- 체크리스트

**주의사항**:
- 반드시 프로젝트 분석 후 작업 범위를 정리하세요
- 명세를 구체화하는 정도로 진행하세요 (새로운 기능 추가 금지)
- 구체적인 입력값과 예시 결과값을 함께 제공하세요

**호출 방법**:
```bash
@feature-design-agent "기능 요구사항을 설명해주세요"
```

#### Agent 2: 테스트 설계 Agent (Test Design Agent)
**Persona**: QA + Architect + TDD 전문가

**서브 에이전트 정의**: [.claude/agents/test-design-agent.md](./.claude/agents/test-design-agent.md)

**핵심 역할**:
- 명세 기반 테스트 설계
- 테스트 구조 설계 (단위/훅/통합)
- 테스트 케이스가 채워진 테스트 파일 생성
- 테스트 구조 Git 커밋

**출력물**:
- 테스트 파일 구조 설계 문서
- 테스트 케이스 (테스트 파일)
- 테스트 데이터 fixtures
- Git 커밋 (test: [DESIGN] ...)

**주의사항**:
- 기존 테스트 작성 방식을 참고하세요
- 테스트 명세의 설명은 최대한 구체적으로 작성하세요
- 명세의 범위를 벗어나지 마세요
- 반드시 Git 커밋을 수행하세요

**호출 방법**:
```bash
@test-design-agent "specs/09-recurring-events.md 기반으로 테스트 케이스를 설계해주세요"
```

#### Agent 3: Red Phase Agent (테스트 코드 작성 Agent)
**Persona**: QA + TDD 전문가

**서브 에이전트 정의**: [.claude/agents/red-phase-agent.md](./.claude/agents/red-phase-agent.md)

**⚠️ 필수 준수 규칙 (Testing Rules)**:
- **rules/tdd-principles.md**: TDD 원칙 및 안티패턴 (필수 읽기)
- **rules/testing-library-queries.md**: Testing Library 쿼리 우선순위 (필수 준수)
- **rules/react-testing-library-best-practices.md**: RTL 베스트 프랙티스 (필수 준수)

**핵심 역할**:
- 실패하는 테스트 코드 작성 (TDD Red Phase)
- 테스트 실행 및 실패 확인
- Red 커밋 생성

**출력물**:
- 테스트 파일 생성 (또는 기존 파일에 추가)
- 테스트 실패 확인 로그
- Git 커밋 (test: [RED] ...)

**주의사항**:
- Kent Beck의 테스트 작성 방법론 참고
- Given-When-Then 패턴으로 구체적인 테스트 명세 작성
- 기존 테스트 유틸리티를 활용하세요
- Testing Library 쿼리 우선순위 준수 (getByRole > getByLabelText > getByTestId)

**호출 방법**:
```bash
@red-phase-agent "specs/05-validation-rules.md를 참고하여 시간 유효성 검증 테스트를 작성해줘"
```

#### Agent 4: Green Phase Agent (코드 작성 Agent)
**Persona**: Frontend/Backend Developer

**서브 에이전트 정의**: [.claude/agents/green-phase-agent.md](./.claude/agents/green-phase-agent.md)

**핵심 역할**:
- 테스트를 통과하는 최소 구현 작성 (TDD Green Phase)
- 테스트 실행 및 성공 확인
- Green 커밋 생성

**출력물**:
- 구현 파일 생성/수정
- 테스트 성공 확인 로그
- 코드 설명 문서
- Git 커밋 (feat: [GREEN] ...)

**주의사항**:
- API 사용법을 명확히 하세요 (specs/04-api-specification.md)
- 프로젝트 구조를 정확히 파악하세요
- 절대 테스트 코드를 수정하지 마세요
- MCP 도구를 적극 활용하세요 (Context7, Sequential)

**호출 방법**:
```bash
@green-phase-agent "src/__tests__/unit/easy.timeValidation.spec.ts의 테스트를 통과하는 구현을 작성해줘"
```

#### Agent 5: Refactor Agent (리팩토링 Agent)
**Persona**: Refactorer + Performance

**서브 에이전트 정의**: [.claude/agents/refactor-agent.md](./.claude/agents/refactor-agent.md)

**핵심 역할**:
- 코드 품질 개선 (TDD Refactor Phase)
- 중복 제거 및 가독성 향상
- 타입 안전성 강화

**출력물**:
- 개선된 코드
- 테스트 통과 확인 로그
- 린트 검증 로그
- Git 커밋 (refactor: [REFACTOR] ...)

**주의사항**:
- 리팩토링 범위를 제한하세요 (현재 기능 파일만)
- 반드시 테스트 통과를 확인하세요
- 린트 검증도 필수입니다 (pnpm lint, pnpm lint:tsc)

**호출 방법**:
```bash
@refactor-agent "src/utils/timeValidation.ts 파일을 리팩토링해줘"
```

#### Agent 6: Orchestrator Agent (전체 오케스트레이션 Agent)
**Persona**: Architect + DevOps + Project Manager

**서브 에이전트 정의**: [.claude/agents/orchestrator-agent.md](./.claude/agents/orchestrator-agent.md)

**핵심 역할**:
- 전체 워크플로우 조율 및 품질 관리
- Agent 1-5 순차 실행 관리
- 코드 리뷰 및 품질 검증
- 문서 업데이트
- 최종 리포트 생성

**출력물**:
- 전체 진행 상황 리포트
- 품질 검증 리포트 (테스트, 커버리지, 린트)
- TDD 사이클 검증 리포트
- 최종 TDD 워크플로우 리포트

**주의사항**:
- 각 Agent가 git 커밋을 반드시 하도록 강제하세요
- 커밋 누락 시 즉시 지적하고 재실행 요청
- 품질 검증 체크리스트를 모두 통과해야 합니다
- TDD Red-Green-Refactor 사이클 준수 확인

**호출 방법**:
```bash
@orchestrator-agent "반복 일정 기능을 TDD로 구현해줘. 기능은 6개: 일일, 주간, 월간, 연간 반복 + 단일/전체 수정 + 단일/전체 삭제"
```

### Agent 활용 워크플로우

```
Phase 0: 준비 단계
└─ TodoWrite 작업 목록 생성

Phase 1: 명세 작성 (Agent 1)
└─ specs/ 문서 작성 및 커밋 (docs: ...)

Phase 2: 테스트 설계 (Agent 2)
└─ 테스트 구조 설계, fixtures 생성 및 커밋 (test: [DESIGN] ...)

Phase 3-N: 기능 구현 (Agent 3-5 반복)
├─ 🔴 Red Phase (Agent 3): 테스트 작성 → 실패 확인 → 커밋 (test: [RED] ...)
├─ 🟢 Green Phase (Agent 4): 최소 구현 → 테스트 통과 → 커밋 (feat: [GREEN] ...)
└─ 🔵 Refactor Phase (Agent 5): 코드 개선 → 검증 → 커밋 (refactor: [REFACTOR] ...)

Phase N+1: 최종 검증 (Agent 6)
├─ 품질 검증 (테스트, 커버리지, 린트)
├─ 문서 업데이트 및 커밋 (docs: ...)
└─ 최종 리포트 생성
```

### Git 커밋 컨벤션

| 커밋 태그 | 설명 | Agent |
|----------|------|-------|
| `docs:` | 명세 문서 작성 | Agent 1 |
| `test: [DESIGN]` | 테스트 구조 설계 | Agent 2 |
| `test: [RED]` | 실패하는 테스트 작성 | Agent 3 |
| `feat: [GREEN]` | 최소 구현 | Agent 4 |
| `refactor: [REFACTOR]` | 코드 개선 | Agent 5 |
| `docs:` | 최종 문서 업데이트 | Agent 6 |

### 실전 예시

**기능 요구사항**: "반복 일정 기능 구현"

1. **Agent 1**: specs/09-recurring-events.md 작성 및 커밋 (docs:)
2. **Agent 2**: 테스트 구조 설계, fixtures 생성 및 커밋 (test: [DESIGN])
3. **Agent 3**: easy.repeatUtils.spec.ts 작성 및 커밋 (test: [RED])
4. **Agent 4**: src/utils/repeatUtils.ts 구현 및 커밋 (feat: [GREEN])
5. **Agent 5**: repeatUtils.ts 리팩토링 및 커밋 (refactor: [REFACTOR])
6. **Agent 3-5 반복**: 나머지 기능들 (UI, API 등)
7. **Agent 6**: 품질 검증 및 최종 문서 업데이트 커밋 (docs:)

**총 커밋 수**: 21개 (명세 1 + 설계 1 + 기능 6×3 + 문서 1)

**상세 가이드**: [WORKFLOW_RECURRING_EVENTS.md](./WORKFLOW_RECURRING_EVENTS.md)

---

## AI 도구 활용 가이드

### Claude Code에 명세 활용 요청

```bash
# 특정 기능 구현
"specs/06-event-overlap-detection.md를 읽고 isOverlapping 함수를 구현해줘.
명세의 모든 시나리오에 대한 테스트 코드를 먼저 작성하고, 테스트를 통과하도록 구현해줘."

# 전체 명세 기반 개발
"specs/ 디렉토리의 모든 명세를 읽고 일정 관리 시스템을 TDD로 구현해줘."

# 명세 검증
"specs/05-validation-rules.md의 요구사항과 현재 구현된 timeValidation.ts가 일치하는지 검증해줘."
```

### Claude Code에 규칙 활용 요청

```bash
# 규칙 준수 테스트 작성
"rules/testing-library-queries.md를 참고하여
적절한 쿼리 메서드를 사용한 테스트 코드를 작성해줘."

# 안티패턴 검증
"rules/react-testing-library-best-practices.md의 규칙을 위반한
코드가 있는지 검토하고 수정해줘."

# TDD 사이클 준수
"rules/tdd-principles.md를 따라 Red-Green-Refactor 순서로
일정 수정 기능을 구현해줘."
```

### GitHub Copilot에서 명세 활용

코드 파일 상단에 명세 링크를 주석으로 추가:

```typescript
/**
 * 일정 겹침 감지 유틸리티
 *
 * @see specs/06-event-overlap-detection.md
 * 명세에 정의된 알고리즘에 따라 두 일정이 겹치는지 판단합니다.
 */
export function isOverlapping(event1: Event, event2: Event): boolean {
  // Copilot이 명세를 보고 구현 제안
}
```

### Cursor에서 명세 기반 개발

1. `.cursorrules` 파일에 명세 경로 추가:
```
Always reference specifications in specs/ directory before implementing features.
Always follow testing rules in rules/ directory when writing tests.
```

2. 프롬프트 예시:
```
"specs/05-validation-rules.md의 시간 검증 규칙을 구현해줘.
명세의 모든 예외 케이스를 처리하고, rules/tdd-principles.md에 따라
테스트 코드도 작성해줘."
```

---

## 개발 시 주의사항

### 타입 정의
- `types.ts`에 정의된 `Event`, `EventForm`, `RepeatInfo` 타입 사용
- 모든 이벤트 데이터는 `Event` 인터페이스를 준수해야 함
- 반복 일정은 `RepeatInfo` 인터페이스 구조 유지

### 일정 검증 로직
- 시간 유효성: `utils/timeValidation.ts`의 `getTimeErrorMessage` 사용
- 일정 겹침: `utils/eventOverlap.ts`의 `findOverlappingEvents` 사용
- 날짜 계산: `utils/dateUtils.ts`의 함수들 활용

### 반복 일정
- UI는 주석 처리되어 있음 (8주차 과제 예정)
- 서버 API는 구현되어 있음 (`server.js`)
- `repeat.type`이 'none'인 경우 일반 일정으로 처리
- 반복 일정 기능 구현 시 [WORKFLOW_RECURRING_EVENTS.md](./WORKFLOW_RECURRING_EVENTS.md) 참조

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

---

## 프로젝트 특징

### 과제 기반 프로젝트
- **명세 기반 개발(SDD)**: 살아있는 문서로 요구사항 정의 및 관리
- **TDD 워크플로우**: Red-Green-Refactor 사이클 엄격히 준수
- **AI 협업 최적화**: AI 도구가 명세와 규칙을 읽고 코드 생성
- **테스트 규칙 적용**: Testing Library 베스트 프랙티스 및 안티패턴 방지

### 코드 작성 원칙

**개발 우선순위**
1. **명세 우선**: 명세를 먼저 읽고 요구사항 이해
2. **테스트 주도**: 테스트를 먼저 작성하고 구현
3. **규칙 준수**: Testing Library 쿼리 우선순위 및 TDD 원칙 적용

**코드 품질 기준**
- **순수 함수**: 유틸리티 함수는 부수효과 없는 순수 함수로 작성
- **관심사 분리**: 비즈니스 로직(hooks) ↔ UI 로직(App.tsx) 분리
- **타입 안전성**: TypeScript 타입 시스템 최대 활용
- **테스트 가능성**: 모든 함수는 테스트 가능하도록 설계

**개발 프로세스**
```
명세 읽기 → 규칙 확인 → 테스트 작성 → 구현 → 리팩토링 → 품질 검증 → 커밋
```

---

## 문서 참조 우선순위

Claude Code를 사용할 때 다음 순서로 문서를 참조하세요:

1. **명세 문서** (`specs/`) - 무엇을 구현해야 하는가?
2. **테스트 규칙** (`rules/`) - 어떻게 테스트를 작성해야 하는가?
3. **CLAUDE.md** (현재 문서) - 프로젝트 구조 및 개발 환경
4. **WORKFLOW_RECURRING_EVENTS.md** - 반복 일정 기능 구현 워크플로우 (6개 Agent 시스템)
5. **report.md** - AI 활용 리포트 템플릿 (과제 제출용)
6. **README.md** - 프로젝트 전체 개요

---

## 버전 이력 요약

| 버전 | 날짜 | 주요 변경사항 |
|------|------|-------------|
| 2.5.0 | 2025-10-29 | Agent 2 커밋 정보 추가 (test: [DESIGN] 태그, 총 커밋 21개) |
| 2.4.0 | 2025-10-28 | 전체 6 Agent 시스템 완성 (Agent 3-6 서브 에이전트 정의 파일 생성, rules 준수 Agent 명시) |
| 2.3.0 | 2025-10-28 | 테스트 설계 Agent 서브 에이전트 정의 파일 생성 |
| 2.2.0 | 2025-10-28 | 기능 설계 Agent 서브 에이전트 정의 파일 생성 |
| 2.1.0 | 2025-10-28 | 6개 Agent 시스템 추가, 반복 일정 워크플로우 참조, 문서 구조 개선 |
| 2.0.0 | 2025-10-27 | 명세 기반 개발 + TDD 워크플로우 통합, 테스트 규칙 추가 |
| 1.0.0 | 초기 | 기본 프로젝트 구조 및 아키텍처 설명 |

---

## 관련 문서

### 프로젝트 문서
- **README.md**: 프로젝트 전체 개요 및 과제 제출 체크리스트
- **CLAUDE.md** (현재 문서): Claude Code를 위한 프로젝트 가이드

### 명세 문서 (specs/)
- **[specs/README.md](./specs/README.md)**: 명세 개요 및 TDD 워크플로우
- **[specs/01-data-models.md](./specs/01-data-models.md)**: TypeScript 타입 정의
- **[specs/02-business-rules.md](./specs/02-business-rules.md)**: 비즈니스 로직
- **[specs/03-user-workflows.md](./specs/03-user-workflows.md)**: 사용자 시나리오
- **[specs/04-api-specification.md](./specs/04-api-specification.md)**: REST API 명세
- **[specs/05-validation-rules.md](./specs/05-validation-rules.md)**: 유효성 검증 규칙
- **[specs/06-event-overlap-detection.md](./specs/06-event-overlap-detection.md)**: 일정 겹침 감지
- **[specs/07-notification-system.md](./specs/07-notification-system.md)**: 알림 시스템
- **[specs/08-test-scenarios.md](./specs/08-test-scenarios.md)**: 테스트 시나리오

### 테스트 규칙 (rules/)
- **[rules/README.md](./rules/README.md)**: 테스트 규칙 개요
- **[rules/testing-library-queries.md](./rules/testing-library-queries.md)**: Testing Library 쿼리 우선순위
- **[rules/react-testing-library-best-practices.md](./rules/react-testing-library-best-practices.md)**: RTL 베스트 프랙티스
- **[rules/tdd-principles.md](./rules/tdd-principles.md)**: TDD 원칙 및 안티패턴

### 워크플로우 문서
- **[WORKFLOW_RECURRING_EVENTS.md](./WORKFLOW_RECURRING_EVENTS.md)**: 반복 일정 기능 구현 워크플로우 (6개 Agent 시스템)

### 과제 제출 문서
- **[report.md](./report.md)**: AI 활용 리포트 템플릿

---

**이 문서에 대한 질문이나 개선 제안은 프로젝트 이슈로 등록해주세요.**
