# 반복 일정 통합 테스트 설계

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-31
**작성자**: Agent 2 (Test Design Agent)
**참조 명세**: specs/09-recurring-events.md

---

## 📋 목차

1. [개요](#개요)
2. [테스트 구조](#테스트-구조)
3. [테스트 케이스 설계](#테스트-케이스-설계)
4. [테스트 데이터](#테스트-데이터)
5. [참조](#참조)

---

## 개요

### 테스트 목적

반복 일정 기능의 **전체 사용자 흐름**을 검증하는 통합 테스트입니다.

**검증 범위**:
- UI 통합 (App.tsx 반복 설정 UI)
- API 연동 (POST /api/events-list)
- 유틸 함수 (repeatUtils.ts) 통합
- 전체 흐름 (사용자 → UI → API → 화면 표시)

### 테스트 파일

- **경로**: `src/__tests__/recurring-events.integration.spec.tsx`
- **참조**: specs/09-recurring-events.md (1211-1253줄)

---

## 테스트 구조

### 기본 설정

```typescript
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { mockWeeklyEvent, mockMonthly31Event, mockYearlyLeapDayEvent } from './__fixtures__/mockRecurringEvents';
```

### 테스트 헬퍼 함수

**기존 패턴 재사용**:
- `setup()`: ThemeProvider + SnackbarProvider로 App 렌더링
- `saveSchedule()`: 일정 추가 폼 작성 헬퍼 (기존 함수 활용)

**추가 필요 헬퍼**:
- `enableRepeatSettings()`: 반복 설정 활성화 및 입력
- `verifyRecurringEventsCreated()`: 생성된 반복 일정 검증

---

## 테스트 케이스 설계

### 테스트 그룹 1: 반복 일정 생성 UI 흐름

#### 테스트 1: 사용자가 반복 일정을 생성할 수 있다

**명세 참조**: specs/09-recurring-events.md (1216-1251줄)

**시나리오**:
```gherkin
Given: 사용자가 일정 추가 폼에서
When:
  - 기본 필드 입력 (제목, 날짜, 시간, 설명, 위치, 카테고리)
  - "반복 일정" 체크박스 활성화
  - 반복 유형: "매주"
  - 반복 간격: 1
  - 반복 종료일: '2025-01-27'
  - "일정 추가" 버튼 클릭
Then:
  - 4개 일정이 생성됨 (주간 회의 × 4)
  - 각 일정에 Repeat 아이콘 표시
  - POST /api/events-list 호출 확인
```

**테스트 코드 구조**:
```typescript
describe('반복 일정 생성', () => {
  it('사용자가 반복 일정을 생성할 수 있다', async () => {
    // Given: 렌더링
    // When: 일정 추가 폼 작성
    // When: 반복 설정 활성화
    // When: 반복 유형, 간격, 종료일 입력
    // When: 일정 추가 버튼 클릭
    // Then: 4개 일정 생성 확인
    // Then: Repeat 아이콘 표시 확인
  });
});
```

**쿼리 우선순위 (Testing Library)**:
- ✅ `screen.getByLabelText('반복 일정')` - 체크박스
- ✅ `screen.getByLabelText('반복 유형')` - Select
- ✅ `screen.getByLabelText('반복 간격')` - Input
- ✅ `screen.getByLabelText('반복 종료일')` - Date Input
- ✅ `screen.getByRole('button', { name: '일정 추가' })` - Submit 버튼
- ✅ `screen.getAllByText(/주간 회의/)` - 생성된 일정 확인

---

### 테스트 그룹 2: API 호출 통합

#### 테스트 2: POST /api/events-list 호출 시 repeat.id가 자동으로 할당된다

**명세 참조**: specs/09-recurring-events.md (1173-1208줄)

**시나리오**:
```gherkin
Given: 매주 반복 일정 폼 작성 완료
When: POST /api/events-list 호출
Then:
  - 응답 상태 코드: 201
  - 응답 배열 길이: 4
  - 모든 일정의 repeat.id가 동일함
  - repeat.id는 UUID v4 형식
```

**테스트 코드 구조**:
```typescript
describe('API 호출 통합', () => {
  it('POST /api/events-list 호출 시 repeat.id가 자동으로 할당된다', async () => {
    // Given: MSW handler 설정
    // When: 반복 일정 생성
    // Then: API 호출 확인
    // Then: repeat.id 동일 확인
  });
});
```

**MSW Handler 설정**:
```typescript
server.use(
  http.post('/api/events-list', async ({ request }) => {
    const { events } = await request.json();

    // repeat.id 자동 할당 로직
    const repeatId = crypto.randomUUID();
    const createdEvents = events.map((event, index) => ({
      ...event,
      id: `uuid-${index + 1}`,
      repeat: {
        ...event.repeat,
        id: repeatId
      }
    }));

    return HttpResponse.json({ events: createdEvents }, { status: 201 });
  })
);
```

---

### 테스트 그룹 3: 특수 케이스 통합

#### 테스트 3: 31일 매월 반복은 31일이 있는 달만 생성한다

**명세 참조**: specs/09-recurring-events.md (369-422줄)

**시나리오**:
```gherkin
Given: 사용자가 반복 일정 폼에서
  - date: '2025-01-31'
  - repeat.type: 'monthly'
  - repeat.interval: 1
  - repeat.endDate: '2025-12-31'
When: "일정 추가" 버튼 클릭
Then: 7개 일정 생성 (1월, 3월, 5월, 7월, 8월, 10월, 12월)
  - 2월(28일), 4월(30일), 6월(30일), 9월(30일), 11월(30일) 건너뜀
```

**테스트 코드 구조**:
```typescript
describe('특수 케이스 통합', () => {
  it('31일 매월 반복은 31일이 있는 달만 생성한다', async () => {
    // Given: 31일 매월 반복 폼 작성
    // When: 일정 추가
    // Then: 7개 일정 생성 확인
    // Then: 생성된 날짜 검증 (1, 3, 5, 7, 8, 10, 12월 31일)
  });
});
```

**검증 예시**:
```typescript
// Then: 7개 일정 생성
const events = screen.getAllByText(/월말 정산/);
expect(events).toHaveLength(7);

// Then: 생성된 날짜 검증
const expectedDates = [
  '2025-01-31',
  '2025-03-31',
  '2025-05-31',
  '2025-07-31',
  '2025-08-31',
  '2025-10-31',
  '2025-12-31',
];

expectedDates.forEach(date => {
  expect(screen.getByText(date)).toBeInTheDocument();
});
```

---

#### 테스트 4: 윤년 2월 29일 매년 반복은 윤년에만 생성한다

**명세 참조**: specs/09-recurring-events.md (493-551줄)

**시나리오**:
```gherkin
Given: 사용자가 반복 일정 폼에서
  - date: '2024-02-29' (윤년)
  - repeat.type: 'yearly'
  - repeat.interval: 1
  - repeat.endDate: undefined (2년 제한)
When: "일정 추가" 버튼 클릭
Then: 1개 일정만 생성
  - 2024-02-29 생성 ✅
  - 2025-02-29 생성 안 됨 ❌ (평년)
  - 2026-02-29 2년 제한으로 확인 안 함
```

**테스트 코드 구조**:
```typescript
it('윤년 2월 29일 매년 반복은 윤년에만 생성한다', async () => {
  // Given: 시스템 시간 2024-01-01로 설정 (윤년)
  vi.setSystemTime(new Date('2024-01-01'));

  // When: 2024-02-29 매년 반복 일정 생성
  // Then: 1개 일정만 생성 (2024-02-29)
  // Then: 2025-02-29, 2026-02-29는 없음
});
```

**검증 예시**:
```typescript
// Then: 1개 일정만 생성
const events = screen.getAllByText(/윤년 기념일/);
expect(events).toHaveLength(1);

// Then: 2024-02-29만 존재
expect(screen.getByText('2024-02-29')).toBeInTheDocument();

// Then: 2025-02-29, 2026-02-29는 없음
expect(screen.queryByText('2025-02-29')).not.toBeInTheDocument();
expect(screen.queryByText('2026-02-29')).not.toBeInTheDocument();
```

---

### 테스트 그룹 4: UI 표시 확인

#### 테스트 5: 반복 일정에 Repeat 아이콘이 표시된다

**명세 참조**: specs/09-recurring-events.md (680-704줄)

**시나리오**:
```gherkin
Given: 반복 일정이 생성된 상태
When: 캘린더 뷰에서 일정 목록 확인
Then:
  - 반복 일정에 Repeat 아이콘 표시
  - 아이콘 옆에 "반복" 텍스트 표시
  - 일반 일정에는 아이콘 표시 안 됨
```

**테스트 코드 구조**:
```typescript
describe('UI 표시 확인', () => {
  it('반복 일정에 Repeat 아이콘이 표시된다', async () => {
    // Given: 반복 일정 1개 + 일반 일정 1개 생성
    // Then: 반복 일정에 Repeat 아이콘 표시
    // Then: 일반 일정에는 아이콘 없음
  });
});
```

**검증 예시**:
```typescript
// Then: Repeat 아이콘 확인 (MUI의 Repeat 아이콘)
const repeatIcons = screen.getAllByTestId('RepeatIcon');
expect(repeatIcons).toHaveLength(4); // 주간 회의 4개

// Then: "반복" 텍스트 확인
const repeatTexts = screen.getAllByText('반복');
expect(repeatTexts).toHaveLength(4);
```

---

## 테스트 데이터

### 기존 Fixtures 활용

**파일**: `src/__tests__/__fixtures__/mockRecurringEvents.ts`

**재사용 데이터**:
- `mockWeeklyEvent`: 매주 월요일 회의 (테스트 1, 2)
- `mockMonthly31Event`: 31일 매월 반복 (테스트 3)
- `mockYearlyLeapDayEvent`: 윤년 2월 29일 매년 반복 (테스트 4)

---

## 참조

### 관련 파일

**명세**:
- specs/09-recurring-events.md (통합 테스트 섹션)

**기존 테스트 패턴**:
- src/__tests__/medium.integration.spec.tsx

**Fixtures**:
- src/__tests__/__fixtures__/mockRecurringEvents.ts

**테스트 규칙**:
- rules/testing-library-queries.md (쿼리 우선순위)
- rules/react-testing-library-best-practices.md (RTL 베스트 프랙티스)

---

## 다음 단계

**Agent 3 (Red Phase)**: 이 설계를 기반으로 실패하는 테스트 코드 작성

**작성할 테스트 파일**:
- `src/__tests__/recurring-events.integration.spec.tsx`

**테스트 실행 예상 결과**:
- ❌ 모든 테스트 실패 (구현 전이므로)
- Red Phase 완료 후 Agent 4로 전달

---

**작성 완료**: 2025-10-31
**다음 Agent**: Agent 3 (Red Phase Agent)
