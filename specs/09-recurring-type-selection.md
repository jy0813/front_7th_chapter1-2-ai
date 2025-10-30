# 반복 일정 기능 명세

**작성일**: 2025-10-31
**버전**: 1.0.0
**담당**: Agent 1 (Feature Design Agent)

---

## 📋 개요

일정 생성 시 반복 유형을 선택하여 자동으로 여러 일정을 생성하는 기능

### 핵심 원칙

- ✅ **단순성 우선**: 복잡한 반복 규칙보다 명확한 4가지 유형만 지원
- ✅ **특수 케이스 명시**: 31일 매월 반복, 윤년 2월 29일 처리 방법 정의
- ✅ **일정 겹침 무시**: 반복 일정은 일정 겹침 검사를 하지 않음

---

## 🎯 요구사항

### 1. 반복 유형 선택

**Given**: 사용자가 일정 생성 또는 수정 폼을 열었을 때
**When**: 반복 유형 Select를 클릭했을 때
**Then**: 매일, 매주, 매월, 매년 옵션이 표시된다

**입력 데이터 구조**:
```typescript
interface RepeatInfo {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;  // 반복 간격 (기본값: 1)
  endDate?: string;  // 종료일 (YYYY-MM-DD, 선택)
  id: string;        // 반복 시리즈 ID (UUID)
}
```

### 2. 반복 날짜 생성 로직

#### 2.1 매일 반복 (daily)

**Given**: 사용자가 2025-01-01에 매일 반복 일정을 생성했을 때
**When**: interval=1, endDate=2025-12-31로 설정했을 때
**Then**: 2025-01-01부터 2025-12-31까지 **365개** 날짜가 생성된다

**예시**:
```typescript
// Input
const startDate = '2025-01-01';
const interval = 1;
const endDate = '2025-12-31';

// Output (일부)
[
  '2025-01-01',
  '2025-01-02',
  '2025-01-03',
  // ... 365개
  '2025-12-31'
]
```

#### 2.2 매주 반복 (weekly)

**Given**: 사용자가 2025-01-06(월요일)에 매주 반복 일정을 생성했을 때
**When**: interval=1, endDate=2025-12-31로 설정했을 때
**Then**: 매주 월요일에 **52개** 날짜가 생성된다

**예시**:
```typescript
// Input
const startDate = '2025-01-06'; // 월요일
const interval = 1;
const endDate = '2025-12-31';

// Output
[
  '2025-01-06',
  '2025-01-13',
  '2025-01-20',
  // ... 52개
  '2025-12-29'
]
```

#### 2.3 매월 반복 (monthly)

**Given**: 사용자가 2025-01-15에 매월 반복 일정을 생성했을 때
**When**: interval=1, endDate=2025-12-31로 설정했을 때
**Then**: 매월 15일에 **12개** 날짜가 생성된다

**예시 (일반 케이스)**:
```typescript
// Input
const startDate = '2025-01-15';
const interval = 1;
const endDate = '2025-12-31';

// Output
[
  '2025-01-15',
  '2025-02-15',
  '2025-03-15',
  // ... 12개
  '2025-12-15'
]
```

**특수 케이스 1: 31일 매월 반복**

**Given**: 사용자가 2025-01-31에 매월 반복 일정을 생성했을 때
**When**: interval=1, endDate=2025-12-31로 설정했을 때
**Then**: **31일이 있는 달에만** 날짜가 생성된다 (2월, 4월, 6월, 9월, 11월은 건너뜀)

**예시**:
```typescript
// Input
const startDate = '2025-01-31';
const interval = 1;
const endDate = '2025-12-31';

// Output (7개만 생성됨)
[
  '2025-01-31',  // 1월 (31일 있음)
  // 2025-02-31 건너뜀 (2월은 28일까지)
  '2025-03-31',  // 3월 (31일 있음)
  // 2025-04-31 건너뜀 (4월은 30일까지)
  '2025-05-31',  // 5월 (31일 있음)
  // 2025-06-31 건너뜀 (6월은 30일까지)
  '2025-07-31',  // 7월 (31일 있음)
  '2025-08-31',  // 8월 (31일 있음)
  // 2025-09-31 건너뜀 (9월은 30일까지)
  '2025-10-31',  // 10월 (31일 있음)
  // 2025-11-31 건너뜀 (11월은 30일까지)
  '2025-12-31'   // 12월 (31일 있음)
]
```

**알고리즘**:
1. 시작 날짜의 일(day)을 추출 (31)
2. 매월 해당 일이 존재하는지 확인
3. 존재하면 추가, 존재하지 않으면 건너뜀

#### 2.4 매년 반복 (yearly)

**Given**: 사용자가 2025-03-15에 매년 반복 일정을 생성했을 때
**When**: interval=1, endDate=2025-12-31로 설정했을 때
**Then**: 매년 3월 15일에 **1개** 날짜가 생성된다 (endDate가 올해 내이므로)

**예시 (일반 케이스)**:
```typescript
// Input
const startDate = '2025-03-15';
const interval = 1;
const endDate = '2025-12-31';

// Output (1개)
[
  '2025-03-15'
]
```

**특수 케이스 2: 윤년 2월 29일 매년 반복**

**Given**: 사용자가 2024-02-29(윤년)에 매년 반복 일정을 생성했을 때
**When**: interval=1, endDate=2027-12-31로 설정했을 때
**Then**: **윤년에만** 2월 29일 날짜가 생성된다 (평년은 건너뜀)

**예시**:
```typescript
// Input
const startDate = '2024-02-29'; // 윤년
const interval = 1;
const endDate = '2027-12-31';

// Output (2개)
[
  '2024-02-29',  // 2024년 (윤년)
  // 2025-02-29 건너뜀 (평년은 2월 28일까지)
  // 2026-02-29 건너뜀 (평년은 2월 28일까지)
  // 2027-02-29 건너뜀 (평년은 2월 28일까지)
  // (다음 윤년인 2028년은 endDate 이후)
]
```

**윤년 판단 알고리즘**:
```
윤년 = (연도가 4로 나누어떨어짐 AND 100으로 나누어떨어지지 않음)
       OR (연도가 400으로 나누어떨어짐)
```

### 3. 반복 일정 표시

**Given**: 캘린더에 반복 일정이 표시될 때
**When**: 사용자가 캘린더 뷰를 확인할 때
**Then**: 반복 일정에 Material-UI의 `Repeat` 아이콘이 표시된다

**UI 예시**:
```jsx
{event.repeat.type !== 'none' && (
  <Repeat fontSize="small" sx={{ ml: 0.5 }} />
)}
```

### 4. 반복 종료 조건

**Given**: 사용자가 반복 일정을 생성할 때
**When**: 종료일(endDate)을 지정하지 않을 때
**Then**: 기본값으로 **2025-12-31**까지 생성된다

**제약사항**:
- 최대 종료일: 2025-12-31
- 이유: 예제 특성상 과도한 데이터 생성 방지

### 5. 반복 일정 수정

**Given**: 사용자가 반복 일정을 수정하려 할 때
**When**: 수정 버튼을 클릭했을 때
**Then**: "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다

#### 5.1 단일 수정 (다이얼로그 '예' 선택)

**Given**: 다이얼로그에서 '예'를 선택했을 때
**When**: 일정 정보를 수정하고 저장했을 때
**Then**:
- 해당 일정만 수정된다
- `repeat.type`이 `'none'`으로 변경된다
- 반복 아이콘이 사라진다

**예시**:
```typescript
// Before
{
  id: 'event-123',
  title: '회의',
  date: '2025-03-15',
  repeat: { type: 'monthly', interval: 1, id: 'repeat-001' }
}

// After (단일 수정)
{
  id: 'event-123',
  title: '중요 회의',  // 제목 변경
  date: '2025-03-15',
  repeat: { type: 'none', interval: 0, id: '' }  // 반복 해제
}
```

#### 5.2 전체 수정 (다이얼로그 '아니오' 선택)

**Given**: 다이얼로그에서 '아니오'를 선택했을 때
**When**: 일정 정보를 수정하고 저장했을 때
**Then**:
- 동일한 `repeat.id`를 가진 **모든 일정**이 수정된다
- `repeat.type`은 유지된다
- 반복 아이콘이 유지된다

**API 호출**:
```typescript
PUT /api/recurring-events/:repeatId
{
  title: '중요 회의',
  startTime: '10:00',
  endTime: '11:00',
  description: '수정된 설명',
  location: '수정된 장소',
  category: '수정된 카테고리'
}
```

### 6. 반복 일정 삭제

**Given**: 사용자가 반복 일정을 삭제하려 할 때
**When**: 삭제 버튼을 클릭했을 때
**Then**: "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다

#### 6.1 단일 삭제 (다이얼로그 '예' 선택)

**Given**: 다이얼로그에서 '예'를 선택했을 때
**When**: 삭제를 확인했을 때
**Then**: 해당 일정만 삭제된다

**API 호출**:
```typescript
DELETE /api/events/:id
```

#### 6.2 전체 삭제 (다이얼로그 '아니오' 선택)

**Given**: 다이얼로그에서 '아니오'를 선택했을 때
**When**: 삭제를 확인했을 때
**Then**: 동일한 `repeat.id`를 가진 **모든 일정**이 삭제된다

**API 호출**:
```typescript
DELETE /api/recurring-events/:repeatId
```

### 7. 일정 겹침 검사 예외

**Given**: 사용자가 반복 일정을 생성할 때
**When**: 생성하려는 반복 일정이 기존 일정과 시간이 겹칠 때
**Then**: **겹침 경고를 표시하지 않고** 그대로 생성된다

**제약사항**:
- 반복 일정은 `isOverlapping()` 검사를 수행하지 않음
- 이유: 365개 날짜를 모두 검사하는 것은 성능 문제

---

## 🔗 관련 API

### 반복 일정 생성

**엔드포인트**: `POST /api/events-list`

**Request Body**:
```typescript
{
  events: Event[]  // 여러 일정을 배열로 전달
}
```

**예시**:
```json
{
  "events": [
    {
      "id": "uuid-1",
      "title": "주간 회의",
      "date": "2025-01-06",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "매주 월요일 회의",
      "location": "회의실",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31",
        "id": "repeat-001"
      }
    },
    {
      "id": "uuid-2",
      "title": "주간 회의",
      "date": "2025-01-13",
      "startTime": "10:00",
      "endTime": "11:00",
      "description": "매주 월요일 회의",
      "location": "회의실",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31",
        "id": "repeat-001"  // 동일한 ID
      }
    }
    // ... 52개
  ]
}
```

### 반복 일정 전체 수정

**엔드포인트**: `PUT /api/recurring-events/:repeatId`

**Path Parameter**: `repeatId` (반복 시리즈 ID)

**Request Body**:
```typescript
{
  title?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  category?: string;
}
```

### 반복 일정 전체 삭제

**엔드포인트**: `DELETE /api/recurring-events/:repeatId`

**Path Parameter**: `repeatId` (반복 시리즈 ID)

---

## ✅ 검증 기준

### 기능 완성도

- [ ] 매일 반복: 365개 날짜 생성 확인
- [ ] 매주 반복: 52개 날짜 생성 확인
- [ ] 매월 반복: 12개 날짜 생성 확인 (일반 케이스)
- [ ] 매월 반복: 31일 특수 케이스 (7개 날짜만 생성)
- [ ] 매년 반복: 윤년 2월 29일 특수 케이스
- [ ] 반복 아이콘 표시
- [ ] 단일 수정 시 `repeat.type`이 `'none'`으로 변경
- [ ] 전체 수정 시 동일 `repeat.id` 모든 일정 수정
- [ ] 단일 삭제 시 해당 일정만 삭제
- [ ] 전체 삭제 시 동일 `repeat.id` 모든 일정 삭제

### 품질 기준

- [ ] TypeScript 타입 안전성 확보
- [ ] 모든 유틸 함수 단위 테스트 작성
- [ ] 테스트 커버리지 85% 이상
- [ ] ESLint 검증 통과
- [ ] 사용자 시나리오 통합 테스트

---

## 📝 구현 파일 목록

### 유틸리티 함수 (신규)
- `src/utils/repeatUtils.ts`
  - `generateDailyDates(startDate, endDate, interval)`
  - `generateWeeklyDates(startDate, endDate, interval)`
  - `generateMonthlyDates(startDate, endDate, interval)`
  - `generateYearlyDates(startDate, endDate, interval)`
  - `isLeapYear(year)`

### UI 컴포넌트 (수정)
- `src/App.tsx`
  - 439-476 라인 주석 해제 (반복 유형 Select, 간격 TextField, 종료일 TextField)
  - 반복 아이콘 표시 로직 추가
  - 반복 수정/삭제 다이얼로그 추가

### 훅 (수정)
- `src/hooks/useEventForm.ts`
  - 반복 일정 폼 상태 관리
- `src/hooks/useEventOperations.ts`
  - 반복 일정 생성 API 호출 (`POST /api/events-list`)
  - 반복 일정 전체 수정 API 호출 (`PUT /api/recurring-events/:repeatId`)
  - 반복 일정 전체 삭제 API 호출 (`DELETE /api/recurring-events/:repeatId`)

---

## 🔖 참고 문서

- [WORKFLOW_RECURRING_EVENTS.md](../WORKFLOW_RECURRING_EVENTS.md): 전체 워크플로우
- [specs/04-api-specification.md](./04-api-specification.md): API 명세
- [rules/tdd-principles.md](../rules/tdd-principles.md): TDD 원칙
- [CLAUDE.md](../CLAUDE.md): 프로젝트 가이드

---

**다음 단계**: Agent 2가 이 명세를 기반으로 테스트 구조를 설계합니다.
