# 09. 반복 유형 선택 기능 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-31
**작성 목적**: 반복 일정 UI 및 데이터 흐름 정의

---

## 📋 목차

1. [개요](#개요)
2. [UI 컴포넌트 명세](#ui-컴포넌트-명세)
3. [반복 설정 규칙](#반복-설정-규칙)
4. [특수 케이스 처리](#특수-케이스-처리)
5. [데이터 흐름](#데이터-흐름)
6. [일정 수정 동작](#일정-수정-동작)
7. [비즈니스 로직 시나리오](#비즈니스-로직-시나리오)
8. [입력/출력 예시](#입력출력-예시)
9. [엣지 케이스](#엣지-케이스)

---

## 개요

### 문서 목적

반복 일정 UI 컴포넌트(체크박스, Select 드롭다운) 및 반복 유형 선택 시 데이터 흐름을 정의합니다. Agent 2가 이 명세만 보고 즉시 테스트 구조를 설계할 수 있도록 구체적인 예시와 시나리오를 포함합니다.

### 핵심 설계 원칙

1. **단순성 우선**: interval = 1 고정, endDate = 없음 (무한 반복)
2. **조용한 실패**: 31일/윤년 케이스는 경고 없이 건너뜀
3. **클라이언트 계산**: 반복 날짜 계산은 클라이언트에서 수행
4. **일괄 전송**: POST /api/events-list로 한 번에 전송

### 구현 위치

- **UI 컴포넌트**: `src/App.tsx` (441-478 라인, 현재 주석 처리)
- **상태 관리**: `src/hooks/useEventForm.ts`
- **데이터 계산**: `src/utils/repeatUtils.ts` (신규 생성)
- **API 호출**: `src/hooks/useEventOperations.ts`

---

## UI 컴포넌트 명세

### 컴포넌트 계층 구조

```
FormControlLabel (체크박스 "반복 일정")
  └─ Checkbox (checked={isRepeating}, onChange={setIsRepeating})
      ↓
{isRepeating && (
  Stack (spacing=2)
    └─ FormControl (반복 유형)
        └─ Select (value={repeatType}, onChange={setRepeatType})
            ├─ MenuItem ("매일", value="daily")
            ├─ MenuItem ("매주", value="weekly")
            ├─ MenuItem ("매월", value="monthly")
            └─ MenuItem ("매년", value="yearly")
)}
```

### 1. 체크박스: "반복 일정" ON/OFF

#### 컴포넌트 명세

```tsx
<FormControlLabel
  control={
    <Checkbox
      checked={isRepeating}
      onChange={(e) => setIsRepeating(e.target.checked)}
      data-testid="repeat-checkbox"
    />
  }
  label="반복 일정"
/>
```

#### 필드 정의

| 속성             | 타입                       | 설명                         |
| ---------------- | -------------------------- | ---------------------------- |
| `isRepeating`    | `boolean`                  | 반복 일정 활성화 여부        |
| `setIsRepeating` | `(value: boolean) => void` | 반복 상태 변경 함수          |
| `data-testid`    | `string`                   | 테스트 ID: "repeat-checkbox" |

#### 동작 정의

**Given-When-Then 시나리오 1: 체크박스 ON**

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: "반복 일정" 체크박스가 체크되지 않음 (isRepeating = false)
When: 사용자가 "반복 일정" 체크박스를 클릭
Then: 체크박스가 체크됨 (isRepeating = true)
  And: 반복 유형 Select 드롭다운이 표시됨
  And: repeatType 기본값은 "daily"
```

**Given-When-Then 시나리오 2: 체크박스 OFF**

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: "반복 일정" 체크박스가 체크됨 (isRepeating = true)
  And: repeatType = "weekly"
When: 사용자가 "반복 일정" 체크박스를 클릭하여 해제
Then: 체크박스가 해제됨 (isRepeating = false)
  And: 반복 유형 Select 드롭다운이 숨겨짐
  And: repeatType은 "daily"로 초기화됨
```

#### 기본값

```typescript
const defaultIsRepeating: boolean = false;
```

---

### 2. Select 드롭다운: 반복 유형 선택

#### 컴포넌트 명세

```tsx
{
  isRepeating && (
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select
        size="small"
        value={repeatType}
        onChange={(e) => setRepeatType(e.target.value as RepeatType)}
        data-testid="repeat-type-select"
      >
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>
  );
}
```

#### 필드 정의

| 속성            | 타입                          | 설명                                                     |
| --------------- | ----------------------------- | -------------------------------------------------------- |
| `repeatType`    | `RepeatType`                  | 반복 유형 ("daily" \| "weekly" \| "monthly" \| "yearly") |
| `setRepeatType` | `(value: RepeatType) => void` | 반복 유형 변경 함수                                      |
| `data-testid`   | `string`                      | 테스트 ID: "repeat-type-select"                          |

#### 유효한 값

| 값          | 표시 텍스트 | 의미                  |
| ----------- | ----------- | --------------------- |
| `"daily"`   | "매일"      | 매일 반복             |
| `"weekly"`  | "매주"      | 매주 같은 요일에 반복 |
| `"monthly"` | "매월"      | 매월 같은 날짜에 반복 |
| `"yearly"`  | "매년"      | 매년 같은 날짜에 반복 |

#### 동작 정의

**Given-When-Then 시나리오 3: 반복 유형 선택**

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: "반복 일정" 체크박스가 체크됨 (isRepeating = true)
  And: repeatType = "daily"
When: 사용자가 반복 유형 Select를 클릭하고 "매주"를 선택
Then: repeatType = "weekly"로 변경됨
  And: Select에 "매주"가 표시됨
```

**Given-When-Then 시나리오 4: 일정 생성 시 반복 데이터 변환**

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: title = "팀 회의"
  And: date = "2025-11-01"
  And: startTime = "10:00"
  And: endTime = "11:00"
  And: isRepeating = true
  And: repeatType = "weekly"
When: 사용자가 "일정 추가" 버튼을 클릭
Then: repeat 객체가 다음과 같이 생성됨:
    {
      type: "weekly",
      interval: 1,
      endDate: undefined
    }
  And: 클라이언트에서 1년치(52주) 반복 일정 배열 계산
  And: POST /api/events-list로 52개 일정 전송
```

#### 기본값

```typescript
const defaultRepeatType: RepeatType = 'daily';
```

---

## 반복 설정 규칙

### 고정 값 규칙

#### RULE-REPEAT-001: interval 고정

**규칙**: 반복 간격은 항상 1로 고정

- **적용 범위**: 모든 반복 유형 (daily, weekly, monthly, yearly)
- **의미**:
  - `interval = 1` → 매일 / 매주 / 매월 / 매년
  - 격주(`interval = 2`), 격월(`interval = 3`) 등은 구현하지 않음
- **이유**: 복잡도 최소화, 사용자 혼란 방지

**적용 예시**:

```typescript
// ✅ 올바른 예시
{ type: "daily", interval: 1 }    // 매일
{ type: "weekly", interval: 1 }   // 매주
{ type: "monthly", interval: 1 }  // 매월

// ❌ 구현하지 않음
{ type: "weekly", interval: 2 }   // 격주 (구현 안 함)
{ type: "monthly", interval: 3 }  // 3개월마다 (구현 안 함)
```

---

#### RULE-REPEAT-002: endDate 없음 (무한 반복)

**규칙**: 반복 종료 날짜는 항상 undefined (무한 반복)

- **적용 범위**: 모든 반복 유형
- **의미**: 일정은 무한히 반복됨 (종료 조건 없음)
- **실제 생성 범위**: 클라이언트에서 1년치만 계산하여 전송
- **이유**: UI 복잡도 최소화, MVP 범위 제한

**적용 예시**:

```typescript
// ✅ 올바른 예시
{ type: "weekly", interval: 1, endDate: undefined }  // 무한 반복

// ❌ 구현하지 않음
{ type: "weekly", interval: 1, endDate: "2025-12-31" }  // 종료일 지정 안 함
```

---

### 반복 일정 생성 범위

#### RULE-REPEAT-003: 1년치 반복 일정 생성

**규칙**: 클라이언트에서 1년치 반복 일정을 계산하여 전송

| 반복 유형 | 생성 개수 | 계산 방법              |
| --------- | --------- | ---------------------- |
| `daily`   | 365개     | 시작일 + 1일씩 365번   |
| `weekly`  | 52개      | 시작일 + 7일씩 52번    |
| `monthly` | 12개      | 시작일 + 1개월씩 12번  |
| `yearly`  | 1개       | 시작일만 (1년치 = 1개) |

**근거**:

- 무한 반복이지만 실제로는 1년치만 생성
- 성능 및 UX 최적화 (너무 많은 일정 생성 방지)
- 필요 시 사용자가 다음 해에 다시 생성 가능

---

## 특수 케이스 처리

### 31일 + 매월 반복 케이스

#### RULE-EDGE-001: 31일이 없는 달 처리

**규칙**: 31일에 생성한 매월 반복 일정은 31일이 없는 달을 조용히 건너뜀

**시나리오**:

```gherkin
Given: 사용자가 일정을 생성함
  And: date = "2025-01-31"
  And: repeatType = "monthly"
When: 클라이언트가 1년치 반복 일정을 계산
Then: 다음 날짜들만 생성됨 (31일이 없는 달 제외):
    - 2025-01-31 (1월, 31일 있음) ✅
    - 2025-02-31 → 건너뜀 (2월, 28일까지만) ❌
    - 2025-03-31 (3월, 31일 있음) ✅
    - 2025-04-31 → 건너뜀 (4월, 30일까지만) ❌
    - 2025-05-31 (5월, 31일 있음) ✅
    - 2025-06-31 → 건너뜀 (6월, 30일까지만) ❌
    - 2025-07-31 (7월, 31일 있음) ✅
    - 2025-08-31 (8월, 31일 있음) ✅
    - 2025-09-31 → 건너뜀 (9월, 30일까지만) ❌
    - 2025-10-31 (10월, 31일 있음) ✅
    - 2025-11-31 → 건너뜀 (11월, 30일까지만) ❌
    - 2025-12-31 (12월, 31일 있음) ✅
  And: 총 7개 일정 생성됨 (12개월 중 5개월 건너뜀)
  And: UI에 경고 메시지 표시되지 않음 (조용히 건너뜀)
```

**구현 방법**:

```typescript
// 유효한 날짜인지 확인
function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// 예시: 2025년 2월 31일
isValidDate(2025, 2, 31); // false → 건너뜀
```

**입력/출력 예시**:

**입력**:

```json
{
  "title": "월말 보고",
  "date": "2025-01-31",
  "startTime": "14:00",
  "endTime": "15:00",
  "repeat": {
    "type": "monthly",
    "interval": 1
  }
}
```

**출력** (생성된 날짜 목록):

```json
["2025-01-31", "2025-03-31", "2025-05-31", "2025-07-31", "2025-08-31", "2025-10-31", "2025-12-31"]
```

---

### 윤년 2/29 + 매년 반복 케이스

#### RULE-EDGE-002: 윤년 2월 29일 처리

**규칙**: 2월 29일에 생성한 매년 반복 일정은 평년(2월 28일까지)을 조용히 건너뜀

**시나리오**:

```gherkin
Given: 사용자가 일정을 생성함
  And: date = "2024-02-29" (윤년)
  And: repeatType = "yearly"
When: 클라이언트가 1년치 반복 일정을 계산
Then: 다음 날짜만 생성됨:
    - 2024-02-29 (윤년, 2/29 있음) ✅
    - 2025-02-29 → 건너뜀 (평년, 2/28까지만) ❌
  And: 총 1개 일정만 생성됨 (2025년은 건너뜀)
  And: UI에 경고 메시지 표시되지 않음 (조용히 건너뜀)
```

**구현 방법**:

```typescript
// 윤년 확인
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 예시: 2025년 2월 29일
isValidDate(2025, 2, 29); // false (2025년은 평년) → 건너뜀
```

**입력/출력 예시**:

**입력**:

```json
{
  "title": "윤년 기념일",
  "date": "2024-02-29",
  "startTime": "12:00",
  "endTime": "13:00",
  "repeat": {
    "type": "yearly",
    "interval": 1
  }
}
```

**출력** (생성된 날짜 목록):

```json
["2024-02-29"]
```

---

## 데이터 흐름

### 전체 데이터 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UI 입력 (App.tsx)                                             │
│    - 체크박스 ON (isRepeating = true)                             │
│    - 반복 유형 선택 (repeatType = "weekly")                        │
│    - 기타 일정 정보 입력 (title, date, time 등)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. 반복 일정 계산 (utils/repeatUtils.ts)                         │
│    - generateRecurringEvents(formData, repeatType)               │
│    - 1년치 날짜 배열 생성 (예: 52개 weekly 일정)                  │
│    - 엣지 케이스 필터링 (31일, 윤년)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EventForm[] 배열 생성                                         │
│    - 각 날짜에 대해 별도 EventForm 객체 생성                       │
│    - repeat.type = repeatType, interval = 1, endDate = undefined │
└─────────────────────────────────────────────────────────────────┐
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. API 호출 (hooks/useEventOperations.ts)                       │
│    - POST /api/events-list                                       │
│    - Body: { events: EventForm[] }                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. 서버 처리 (server.js)                                         │
│    - repeatId = UUID 생성 (반복 시리즈 ID)                        │
│    - 각 일정에 id = UUID 생성                                     │
│    - repeat.id = repeatId 추가                                   │
│    - realEvents.json에 저장                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. 응답 (Event[])                                                │
│    - 생성된 일정 배열 반환                                         │
│    - 클라이언트 상태 업데이트                                       │
│    - 캘린더 뷰에 일정 표시                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 단계별 상세 설명

#### Step 1: UI 입력 (App.tsx)

**상태 변수**:

```typescript
const [isRepeating, setIsRepeating] = useState<boolean>(false);
const [repeatType, setRepeatType] = useState<RepeatType>('daily');
```

**사용자 액션**:

1. "반복 일정" 체크박스 클릭 → `isRepeating = true`
2. 반복 유형 Select에서 "매주" 선택 → `repeatType = "weekly"`
3. 기타 일정 정보 입력 (title, date, startTime, endTime 등)

---

#### Step 2: 반복 일정 계산 (utils/repeatUtils.ts)

**함수 시그니처**:

```typescript
/**
 * 반복 일정 배열 생성
 * @param baseEvent - 기준 일정 정보
 * @param repeatType - 반복 유형
 * @returns EventForm[] - 1년치 반복 일정 배열
 */
function generateRecurringEvents(baseEvent: EventForm, repeatType: RepeatType): EventForm[];
```

**알고리즘**:

```typescript
// 예시: weekly 반복
const events: EventForm[] = [];
const startDate = new Date(baseEvent.date);

for (let i = 0; i < 52; i++) {
  // 1년치 = 52주
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() + i * 7); // 7일씩 증가

  events.push({
    ...baseEvent,
    date: formatDate(currentDate), // "YYYY-MM-DD"
    repeat: {
      type: repeatType,
      interval: 1,
      endDate: undefined,
    },
  });
}

return events;
```

**엣지 케이스 필터링**:

```typescript
// 31일 + monthly 케이스
if (repeatType === 'monthly') {
  return events.filter((event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    return isValidDate(year, month, day);
  });
}

// 윤년 + yearly 케이스
if (repeatType === 'yearly') {
  return events.filter((event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    if (month === 2 && day === 29) {
      return isLeapYear(year);
    }
    return true;
  });
}
```

---

#### Step 3: EventForm[] 배열 생성

**입력**:

```json
{
  "title": "팀 회의",
  "date": "2025-11-01",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "주간 회의",
  "location": "회의실 A",
  "category": "업무",
  "notificationTime": 10
}
```

**출력** (repeatType = "weekly", 52개 생성):

```json
[
  {
    "title": "팀 회의",
    "date": "2025-11-01",
    "startTime": "10:00",
    "endTime": "11:00",
    "description": "주간 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1
    },
    "notificationTime": 10
  },
  {
    "title": "팀 회의",
    "date": "2025-11-08",
    "startTime": "10:00",
    "endTime": "11:00",
    "description": "주간 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1
    },
    "notificationTime": 10
  }
  // ... 50개 더
]
```

---

#### Step 4: API 호출

**엔드포인트**: `POST /api/events-list`

**요청 헤더**:

```
Content-Type: application/json
```

**요청 바디**:

```json
{
  "events": [
    {
      /* EventForm 객체 1 */
    },
    {
      /* EventForm 객체 2 */
    }
    // ... 52개
  ]
}
```

**구현 위치**: `src/hooks/useEventOperations.ts`

```typescript
async function saveRecurringEvents(events: EventForm[]): Promise<Event[]> {
  const response = await fetch('/api/events-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    throw new Error('Failed to create recurring events');
  }

  return response.json();
}
```

---

#### Step 5: 서버 처리 (server.js)

**서버 로직** (기존 구현):

```javascript
app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID(); // 반복 시리즈 ID 생성

  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(), // 각 일정 ID 생성
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined, // 반복 시리즈 ID 추가
      },
    };
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, ...newEvents],
    })
  );

  res.status(201).json(newEvents);
});
```

**repeat.id의 역할**:

- 같은 반복 시리즈에 속한 일정들을 그룹핑
- 시리즈 전체 수정/삭제 시 사용
- 예: `PUT /api/recurring-events/:repeatId`

---

#### Step 6: 응답 및 상태 업데이트

**서버 응답** (Event[]):

```json
[
  {
    "id": "a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d",
    "title": "팀 회의",
    "date": "2025-11-01",
    "startTime": "10:00",
    "endTime": "11:00",
    "description": "주간 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "id": "repeat-12345678-1234-1234-1234-123456789012"
    },
    "notificationTime": 10
  }
  // ... 51개 더
]
```

**클라이언트 상태 업데이트**:

```typescript
// hooks/useEventOperations.ts
const createdEvents = await saveRecurringEvents(eventForms);
setEvents((prev) => [...prev, ...createdEvents]);
```

---

## 일정 수정 동작

### 일반 일정 → 반복 일정 변경

#### RULE-MODIFY-001: 기존 일정 유지, 새 시리즈 추가

**규칙**: 일반 일정을 반복 일정으로 수정하면 기존 일정은 유지하고 새 반복 시리즈를 추가함

**시나리오**:

```gherkin
Given: 기존 일정이 있음
  And: id = "event-123"
  And: date = "2025-11-05"
  And: repeat.type = "none" (일반 일정)
When: 사용자가 해당 일정을 수정함
  And: "반복 일정" 체크박스를 ON
  And: repeatType = "weekly" 선택
  And: "일정 수정" 버튼 클릭
Then: 기존 일정 (event-123)은 그대로 유지됨
  And: 새로운 반복 일정 시리즈가 생성됨 (52개)
  And: 새 시리즈의 repeat.id는 새로운 UUID
  And: 총 일정 개수 = 기존 1개 + 새 52개 = 53개
```

**이유**:

- 기존 일정 삭제 시 사용자 의도와 다를 수 있음
- 명시적으로 삭제하지 않는 한 보존
- 사용자가 원치 않으면 기존 일정을 직접 삭제 가능

---

### 반복 일정 → 일반 일정 변경

#### RULE-MODIFY-002: 기존 시리즈 유지

**규칙**: 반복 일정을 일반 일정으로 수정해도 기존 시리즈는 삭제되지 않음

**시나리오**:

```gherkin
Given: 반복 일정 시리즈가 있음
  And: repeat.id = "repeat-abc123"
  And: 시리즈 개수 = 52개
  And: 사용자가 그 중 하나를 선택하여 수정함
When: 사용자가 "반복 일정" 체크박스를 OFF
  And: "일정 수정" 버튼 클릭
Then: 해당 일정만 repeat.type = "none"으로 변경됨
  And: 나머지 51개 일정은 그대로 유지됨
  And: 기존 반복 시리즈는 삭제되지 않음
```

**이유**:

- 사용자가 "시리즈 전체 삭제"를 선택하지 않았음
- 단일 일정 수정은 해당 일정만 영향

---

## 비즈니스 로직 시나리오

### 시나리오 1: 매일 반복 일정 생성

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: title = "아침 운동"
  And: date = "2025-11-01"
  And: startTime = "06:00"
  And: endTime = "07:00"
  And: isRepeating = true
  And: repeatType = "daily"
When: "일정 추가" 버튼 클릭
Then: 365개 일정이 생성됨
  And: 첫 번째 일정 date = "2025-11-01"
  And: 마지막 일정 date = "2026-10-31" (365일 후)
  And: 모든 일정의 repeat.type = "daily"
  And: 모든 일정의 repeat.interval = 1
  And: 모든 일정의 repeat.id = 동일한 UUID
```

**입력**:

```json
{
  "title": "아침 운동",
  "date": "2025-11-01",
  "startTime": "06:00",
  "endTime": "07:00",
  "description": "",
  "location": "헬스장",
  "category": "개인",
  "notificationTime": 60,
  "repeat": {
    "type": "daily",
    "interval": 1
  }
}
```

**출력** (생성된 일정 개수):

```
365개 일정
```

---

### 시나리오 2: 매주 반복 일정 생성

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: title = "주간 회의"
  And: date = "2025-11-03" (월요일)
  And: startTime = "10:00"
  And: endTime = "11:00"
  And: isRepeating = true
  And: repeatType = "weekly"
When: "일정 추가" 버튼 클릭
Then: 52개 일정이 생성됨
  And: 모든 일정이 월요일에 발생함
  And: 첫 번째 일정 date = "2025-11-03"
  And: 두 번째 일정 date = "2025-11-10" (7일 후)
  And: 마지막 일정 date = "2026-10-26" (52주 후)
  And: 모든 일정의 repeat.type = "weekly"
```

**입력**:

```json
{
  "title": "주간 회의",
  "date": "2025-11-03",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "주간 업무 공유",
  "location": "회의실 A",
  "category": "업무",
  "notificationTime": 10,
  "repeat": {
    "type": "weekly",
    "interval": 1
  }
}
```

**출력** (생성된 일정 날짜):

```
2025-11-03, 2025-11-10, 2025-11-17, 2025-11-24,
2025-12-01, 2025-12-08, ... (52개 총)
```

---

### 시나리오 3: 매월 반복 일정 생성 (31일 케이스)

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: title = "월말 보고"
  And: date = "2025-01-31"
  And: startTime = "15:00"
  And: endTime = "16:00"
  And: isRepeating = true
  And: repeatType = "monthly"
When: "일정 추가" 버튼 클릭
Then: 7개 일정만 생성됨 (31일이 있는 달만)
  And: 생성된 날짜:
    - 2025-01-31 ✅
    - 2025-03-31 ✅
    - 2025-05-31 ✅
    - 2025-07-31 ✅
    - 2025-08-31 ✅
    - 2025-10-31 ✅
    - 2025-12-31 ✅
  And: 건너뛴 날짜:
    - 2025-02-31 (2월은 28일까지) ❌
    - 2025-04-31 (4월은 30일까지) ❌
    - 2025-06-31 (6월은 30일까지) ❌
    - 2025-09-31 (9월은 30일까지) ❌
    - 2025-11-31 (11월은 30일까지) ❌
  And: UI에 경고 메시지 없음
```

**입력**:

```json
{
  "title": "월말 보고",
  "date": "2025-01-31",
  "startTime": "15:00",
  "endTime": "16:00",
  "description": "",
  "location": "",
  "category": "업무",
  "notificationTime": 1440,
  "repeat": {
    "type": "monthly",
    "interval": 1
  }
}
```

**출력** (생성된 일정 날짜):

```
2025-01-31, 2025-03-31, 2025-05-31, 2025-07-31,
2025-08-31, 2025-10-31, 2025-12-31
```

---

### 시나리오 4: 매년 반복 일정 생성 (윤년 케이스)

```gherkin
Given: 사용자가 일정 추가 폼에 있음
  And: title = "윤년 기념일"
  And: date = "2024-02-29" (윤년)
  And: startTime = "12:00"
  And: endTime = "13:00"
  And: isRepeating = true
  And: repeatType = "yearly"
When: "일정 추가" 버튼 클릭
Then: 1개 일정만 생성됨 (2024년만)
  And: 생성된 날짜:
    - 2024-02-29 ✅
  And: 건너뛴 날짜:
    - 2025-02-29 (2025년은 평년, 2/28까지) ❌
  And: UI에 경고 메시지 없음
```

**입력**:

```json
{
  "title": "윤년 기념일",
  "date": "2024-02-29",
  "startTime": "12:00",
  "endTime": "13:00",
  "description": "4년마다",
  "location": "",
  "category": "기타",
  "notificationTime": 1440,
  "repeat": {
    "type": "yearly",
    "interval": 1
  }
}
```

**출력** (생성된 일정 날짜):

```
2024-02-29
```

---

## 입력/출력 예시

### 예시 1: 매일 반복 (daily)

**입력 (UI)**:

```
title: "아침 운동"
date: "2025-11-01"
startTime: "06:00"
endTime: "07:00"
isRepeating: true
repeatType: "daily"
```

**출력 (POST /api/events-list 요청 바디)**:

```json
{
  "events": [
    {
      "title": "아침 운동",
      "date": "2025-11-01",
      "startTime": "06:00",
      "endTime": "07:00",
      "description": "",
      "location": "",
      "category": "개인",
      "repeat": { "type": "daily", "interval": 1 },
      "notificationTime": 60
    },
    {
      "title": "아침 운동",
      "date": "2025-11-02"
      // ... 동일
    }
    // ... 363개 더 (총 365개)
  ]
}
```

---

### 예시 2: 매주 반복 (weekly)

**입력 (UI)**:

```
title: "팀 회의"
date: "2025-11-03"
startTime: "10:00"
endTime: "11:00"
isRepeating: true
repeatType: "weekly"
```

**출력 (생성된 날짜 목록, 처음 5개)**:

```json
["2025-11-03", "2025-11-10", "2025-11-17", "2025-11-24", "2025-12-01"]
```

---

### 예시 3: 매월 반복 (monthly, 31일 케이스)

**입력 (UI)**:

```
title: "월말 보고"
date: "2025-01-31"
startTime: "15:00"
endTime: "16:00"
isRepeating: true
repeatType: "monthly"
```

**출력 (생성된 날짜 목록, 31일이 있는 달만)**:

```json
["2025-01-31", "2025-03-31", "2025-05-31", "2025-07-31", "2025-08-31", "2025-10-31", "2025-12-31"]
```

---

### 예시 4: 매년 반복 (yearly, 윤년 케이스)

**입력 (UI)**:

```
title: "윤년 기념일"
date: "2024-02-29"
startTime: "12:00"
endTime: "13:00"
isRepeating: true
repeatType: "yearly"
```

**출력 (생성된 날짜 목록)**:

```json
["2024-02-29"]
```

---

## 엣지 케이스

### 엣지 케이스 요약

| 케이스           | 처리 방법                       | 경고 메시지          |
| ---------------- | ------------------------------- | -------------------- |
| 31일 + 매월      | 31일이 없는 달 건너뜀           | 없음 (조용히 건너뜀) |
| 윤년 2/29 + 매년 | 평년 건너뜀                     | 없음 (조용히 건너뜀) |
| 12/31 + 매월     | 정상 처리 (모든 달에 31일 체크) | 없음                 |
| 1/31 + 매주      | 정상 처리 (요일 기준 반복)      | 없음                 |

---

### 엣지 케이스 1: 30일 + 매월 반복

```gherkin
Given: 사용자가 일정을 생성함
  And: date = "2025-01-30"
  And: repeatType = "monthly"
When: 클라이언트가 1년치 반복 일정을 계산
Then: 12개 일정 모두 생성됨 (모든 달에 30일 있음)
  And: 생성된 날짜:
    - 2025-01-30, 2025-02-30 → 건너뜀 (2월 28일까지) ❌
    - 2025-03-30, 2025-04-30, ..., 2025-12-30
  And: 총 11개 일정 생성됨 (2월 제외)
```

---

### 엣지 케이스 2: 12/31 + 매월 반복

```gherkin
Given: 사용자가 일정을 생성함
  And: date = "2025-12-31"
  And: repeatType = "monthly"
When: 클라이언트가 1년치 반복 일정을 계산
Then: 다음 날짜들만 생성됨:
    - 2025-12-31 ✅
    - 2026-01-31 ✅
    - 2026-02-31 → 건너뜀 ❌
    - 2026-03-31 ✅
    - ... (31일이 있는 달만)
  And: 총 7개 일정 생성됨
```

---

### 엣지 케이스 3: 1/31 + 매주 반복

```gherkin
Given: 사용자가 일정을 생성함
  And: date = "2025-01-31" (금요일)
  And: repeatType = "weekly"
When: 클라이언트가 1년치 반복 일정을 계산
Then: 52개 일정 모두 생성됨 (매주 금요일)
  And: 첫 번째: 2025-01-31 (금)
  And: 두 번째: 2025-02-07 (금)
  And: 세 번째: 2025-02-14 (금)
  And: ... (52개 총)
  And: 날짜 유효성 검증 불필요 (요일 기준 반복)
```

---

### 엣지 케이스 4: 일반 일정을 반복으로 변경 후 다시 일반으로 변경

```gherkin
Given: 일반 일정이 있음 (id = "event-123", repeat.type = "none")
When: 사용자가 반복 일정으로 수정 (repeatType = "weekly")
Then: 기존 일정 유지 + 새 시리즈 52개 생성
  And: 총 53개 일정

When: 사용자가 새 시리즈 중 하나를 다시 일반 일정으로 변경
Then: 해당 일정만 repeat.type = "none"으로 변경
  And: 나머지 51개는 여전히 반복 일정
  And: 총 53개 일정 (변화 없음)
```

---

## 참조

- **관련 명세**:
  - [01. 데이터 모델](./01-data-models.md): RepeatInfo 타입 정의
  - [02. 비즈니스 규칙](./02-business-rules.md): 반복 일정 규칙 (BR-REPEAT-001, BR-REPEAT-002)
  - [04. API 명세](./04-api-specification.md): POST /api/events-list
  - [08. 테스트 시나리오](./08-test-scenarios.md): 반복 일정 테스트 케이스

- **구현 파일**:
  - `src/App.tsx`: UI 컴포넌트 (441-478 라인)
  - `src/hooks/useEventForm.ts`: 상태 관리
  - `src/utils/repeatUtils.ts`: 반복 날짜 계산 로직 (신규 생성)
  - `src/hooks/useEventOperations.ts`: API 호출
  - `server.js`: 서버 API 엔드포인트

---

**다음 문서**: Agent 2가 이 명세를 읽고 테스트 구조를 설계합니다.
