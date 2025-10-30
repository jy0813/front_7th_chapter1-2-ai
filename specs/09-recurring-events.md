# 09. 반복 일정 기능 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-30
**작성자**: Agent 1 (Feature Design Agent)

---

## 📋 목차

1. [개요](#개요)
2. [기능 요구사항](#기능-요구사항)
3. [데이터 모델](#데이터-모델)
4. [UI 명세](#ui-명세)
5. [비즈니스 로직](#비즈니스-로직)
6. [API 명세](#api-명세)
7. [특수 케이스 처리](#특수-케이스-처리)
8. [테스트 시나리오](#테스트-시나리오)

---

## 개요

### 문서 목적

반복 일정 기능의 상세 명세를 정의합니다. 사용자가 일정 생성 시 반복 유형을 선택하면, 선택한 규칙에 따라 자동으로 여러 일정이 생성됩니다.

### 기능 범위

**✅ 포함되는 기능**:
- 반복 유형 선택 UI (매일, 매주, 매월, 매년)
- 반복 간격 설정 (예: 2일마다, 3주마다)
- 반복 종료일 설정
- 반복 일정 생성 (POST /api/events-list)

**❌ 제외되는 기능**:
- 반복 일정 단일 수정 (현재는 전체 시리즈 수정만 지원)
- 반복 일정 겹침 검사 (요구사항에 따라 제외)

### 핵심 원칙

1. **UI 재사용**: 기존 App.tsx의 주석 처리된 UI 활성화만 수행
2. **특수 케이스 건너뛰기**: 31일, 2월 29일 등 존재하지 않는 날짜는 일정 생성 안 함
3. **겹침 무시**: 반복 일정은 일정 겹침 검사를 하지 않음

---

## 기능 요구사항

### REQ-001: 반복 유형 선택

**설명**: 사용자가 일정 생성 또는 수정 시 반복 유형을 선택할 수 있어야 합니다.

**반복 유형**:
| 유형 | 값 | 설명 | 예시 |
|------|-----|------|------|
| 반복 안 함 | `none` | 일회성 일정 | 회의 1회 |
| 매일 | `daily` | 매일 반복 | 매일 아침 운동 |
| 매주 | `weekly` | 매주 같은 요일에 반복 | 매주 월요일 회의 |
| 매월 | `monthly` | 매월 같은 날짜에 반복 | 매월 15일 보고 |
| 매년 | `yearly` | 매년 같은 날짜에 반복 | 생일, 기념일 |

**입력 방법**:
- 체크박스 "반복 일정" 체크 시 반복 설정 UI 표시
- 드롭다운 메뉴에서 반복 유형 선택 (매일/매주/매월/매년)

---

### REQ-002: 반복 간격 설정

**설명**: 사용자가 반복 간격을 지정할 수 있어야 합니다.

**입력 방법**:
- 숫자 입력 필드 (최소값: 1)
- 단위는 반복 유형에 따라 자동 결정

**예시**:
| 반복 유형 | 간격 | 결과 |
|----------|------|------|
| 매일 | 1 | 매일 |
| 매일 | 2 | 이틀에 한 번 (격일) |
| 매주 | 1 | 매주 |
| 매주 | 2 | 격주 (2주마다) |
| 매월 | 1 | 매월 |
| 매월 | 3 | 3개월마다 (분기별) |
| 매년 | 1 | 매년 |

---

### REQ-003: 반복 종료일 설정

**설명**: 사용자가 반복 일정의 종료일을 지정할 수 있어야 합니다.

**입력 방법**:
- 날짜 선택 필드 (type="date")
- 비어있으면 무한 반복 (서버에서 합리적인 최대값 적용)

**제약사항**:
- 종료일은 시작 날짜보다 이후여야 함
- 종료일이 비어있으면 `undefined` 저장

---

## 데이터 모델

### 기존 타입 정의 (변경 없음)

```typescript
// src/types.ts (이미 정의되어 있음)

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;        // 반복 유형
  interval: number;        // 반복 간격 (1 이상의 정수)
  endDate?: string;        // 반복 종료일 (선택적, YYYY-MM-DD 형식)
  id?: string;             // 반복 시리즈 ID (서버가 생성)
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;      // 반복 설정
  notificationTime: number;
}

export interface Event extends EventForm {
  id: string;              // 개별 일정 ID
}
```

### 반복 일정 시리즈 개념

**시리즈 ID (`repeat.id`)**:
- 서버가 생성하는 UUID
- 같은 반복 일정 시리즈에 속한 모든 일정이 동일한 `repeat.id`를 가짐
- 예시: 매주 월요일 회의 → 모든 월요일 일정들이 같은 `repeat.id`

**개별 일정 ID (`id`)**:
- 각 일정마다 고유한 UUID
- 예시: 1월 6일 회의 ID, 1월 13일 회의 ID, 1월 20일 회의 ID (모두 다름)

---

## UI 명세

### UI-001: 반복 일정 체크박스

**위치**: 일정 추가/수정 폼, 카테고리 선택 아래

**기존 코드 활성화** (App.tsx:412-422):
```tsx
<FormControl>
  <FormControlLabel
    control={
      <Checkbox
        checked={isRepeating}
        onChange={(e) => setIsRepeating(e.target.checked)}
      />
    }
    label="반복 일정"
  />
</FormControl>
```

**동작**:
- Given: 사용자가 일정 추가 폼에 있을 때
- When: "반복 일정" 체크박스를 체크
- Then: 반복 설정 UI (반복 유형, 간격, 종료일)가 표시됨

---

### UI-002: 반복 설정 패널

**위치**: "반복 일정" 체크박스 아래 (조건부 렌더링)

**기존 코드 활성화** (App.tsx:441-478):
```tsx
{isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select
        size="small"
        value={repeatType}
        onChange={(e) => setRepeatType(e.target.value as RepeatType)}
      >
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>

    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel>반복 간격</FormLabel>
        <TextField
          size="small"
          type="number"
          value={repeatInterval}
          onChange={(e) => setRepeatInterval(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>반복 종료일</FormLabel>
        <TextField
          size="small"
          type="date"
          value={repeatEndDate}
          onChange={(e) => setRepeatEndDate(e.target.value)}
        />
      </FormControl>
    </Stack>
  </Stack>
)}
```

**컴포넌트 구성**:
1. **반복 유형 선택** (Select)
   - 옵션: 매일, 매주, 매월, 매년
   - 기본값: 매일

2. **반복 간격** (Number TextField)
   - 최소값: 1
   - 정수만 허용
   - 기본값: 1

3. **반복 종료일** (Date TextField)
   - 선택적 (비어있어도 됨)
   - 형식: YYYY-MM-DD
   - 비어있으면 무한 반복

---

### UI-003: 폼 상태 관리

**필요한 상태 변수** (useEventForm 훅에 이미 정의되어 있음):
```typescript
// src/hooks/useEventForm.ts
const [isRepeating, setIsRepeating] = useState(false);
const [repeatType, setRepeatType] = useState<RepeatType>('daily');
const [repeatInterval, setRepeatInterval] = useState(1);
const [repeatEndDate, setRepeatEndDate] = useState('');
```

**주석 해제 필요**:
- App.tsx 38줄: `import { Event, EventForm, RepeatType } from './types';`
- App.tsx 80-84줄: repeatType, setRepeatType, repeatInterval, setRepeatInterval, repeatEndDate, setRepeatEndDate

---

## 비즈니스 로직

### BL-001: 반복 일정 생성 알고리즘

**입력**:
- 시작 날짜 (`date`)
- 반복 유형 (`repeatType`)
- 반복 간격 (`interval`)
- 종료일 (`endDate` 또는 `undefined`)

**출력**:
- 반복 일정 날짜 배열 (`string[]`, YYYY-MM-DD 형식)

**알고리즘**:
```typescript
function generateRecurringDates(
  startDate: string,      // "2025-01-06"
  repeatType: RepeatType, // "weekly"
  interval: number,       // 1
  endDate?: string        // "2025-12-31" 또는 undefined
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : getDefaultEndDate(start, repeatType);

  let current = new Date(start);

  while (current <= end) {
    // 특수 케이스 체크 (31일, 2월 29일)
    if (isValidRecurringDate(current, start, repeatType)) {
      dates.push(formatDate(current)); // "YYYY-MM-DD"
    }

    // 다음 날짜 계산
    current = getNextDate(current, repeatType, interval);
  }

  return dates;
}
```

**기본 종료일**:
- 매일/매주: 1년 후
- 매월: 2년 후
- 매년: 10년 후

---

### BL-002: 매일 반복 (daily)

**Given**: 사용자가 반복 유형을 "매일"로 선택
**When**: 간격이 1일 때
**Then**: 매일 같은 시간에 일정이 생성됨

**예시**:
```typescript
// 입력
startDate: "2025-01-06"  // 월요일
repeatType: "daily"
interval: 1
endDate: "2025-01-10"

// 출력
[
  "2025-01-06",  // 월
  "2025-01-07",  // 화
  "2025-01-08",  // 수
  "2025-01-09",  // 목
  "2025-01-10"   // 금
]
```

**Given**: 사용자가 반복 유형을 "매일"로 선택
**When**: 간격이 2일 때 (격일)
**Then**: 이틀마다 일정이 생성됨

**예시**:
```typescript
// 입력
startDate: "2025-01-06"
repeatType: "daily"
interval: 2
endDate: "2025-01-12"

// 출력
[
  "2025-01-06",  // 월
  "2025-01-08",  // 수
  "2025-01-10",  // 금
  "2025-01-12"   // 일
]
```

---

### BL-003: 매주 반복 (weekly)

**Given**: 사용자가 반복 유형을 "매주"로 선택
**When**: 간격이 1주일 때
**Then**: 매주 같은 요일에 일정이 생성됨

**예시**:
```typescript
// 입력
startDate: "2025-01-06"  // 월요일
repeatType: "weekly"
interval: 1
endDate: "2025-01-27"

// 출력
[
  "2025-01-06",  // 월 (1주차)
  "2025-01-13",  // 월 (2주차)
  "2025-01-20",  // 월 (3주차)
  "2025-01-27"   // 월 (4주차)
]
```

**Given**: 사용자가 반복 유형을 "매주"로 선택
**When**: 간격이 2주일 때 (격주)
**Then**: 격주로 같은 요일에 일정이 생성됨

**예시**:
```typescript
// 입력
startDate: "2025-01-06"  // 월요일
repeatType: "weekly"
interval: 2
endDate: "2025-02-03"

// 출력
[
  "2025-01-06",  // 월 (1주차)
  "2025-01-20",  // 월 (3주차)
  "2025-02-03"   // 월 (5주차)
]
```

---

### BL-004: 매월 반복 (monthly)

**Given**: 사용자가 반복 유형을 "매월"로 선택
**When**: 시작 날짜가 1일부터 28일 사이일 때
**Then**: 매월 같은 날짜에 일정이 생성됨

**예시 1 - 정상 케이스**:
```typescript
// 입력
startDate: "2025-01-15"  // 15일
repeatType: "monthly"
interval: 1
endDate: "2025-04-15"

// 출력
[
  "2025-01-15",  // 1월 15일
  "2025-02-15",  // 2월 15일
  "2025-03-15",  // 3월 15일
  "2025-04-15"   // 4월 15일
]
```

**Given**: 사용자가 반복 유형을 "매월"로 선택
**When**: 시작 날짜가 31일일 때
**Then**: 31일이 있는 달에만 일정이 생성됨 (31일이 없는 달은 건너뛰기)

**예시 2 - 특수 케이스 (31일)**:
```typescript
// 입력
startDate: "2025-01-31"  // 1월 31일
repeatType: "monthly"
interval: 1
endDate: "2025-05-31"

// 출력
[
  "2025-01-31",  // 1월 31일 ✅ (31일 있음)
  // "2025-02-31" → ❌ 2월은 31일 없음, 건너뛰기
  "2025-03-31",  // 3월 31일 ✅ (31일 있음)
  // "2025-04-31" → ❌ 4월은 31일 없음, 건너뛰기
  "2025-05-31"   // 5월 31일 ✅ (31일 있음)
]
```

**⚠️ 중요**: 31일이 없는 달 (2월, 4월, 6월, 9월, 11월)은 마지막 날로 대체하지 않고 **건너뛰기**

**Given**: 사용자가 반복 유형을 "매월"로 선택
**When**: 간격이 3개월일 때 (분기별)
**Then**: 3개월마다 같은 날짜에 일정이 생성됨

**예시 3 - 간격 3개월**:
```typescript
// 입력
startDate: "2025-01-15"
repeatType: "monthly"
interval: 3
endDate: "2025-10-15"

// 출력
[
  "2025-01-15",  // 1월 (Q1)
  "2025-04-15",  // 4월 (Q2)
  "2025-07-15",  // 7월 (Q3)
  "2025-10-15"   // 10월 (Q4)
]
```

---

### BL-005: 매년 반복 (yearly)

**Given**: 사용자가 반복 유형을 "매년"로 선택
**When**: 시작 날짜가 2월 29일이 아닐 때
**Then**: 매년 같은 날짜에 일정이 생성됨

**예시 1 - 정상 케이스**:
```typescript
// 입력
startDate: "2025-06-15"  // 6월 15일
repeatType: "yearly"
interval: 1
endDate: "2028-06-15"

// 출력
[
  "2025-06-15",  // 2025년
  "2026-06-15",  // 2026년
  "2027-06-15",  // 2027년
  "2028-06-15"   // 2028년
]
```

**Given**: 사용자가 반복 유형을 "매년"로 선택
**When**: 시작 날짜가 2월 29일일 때 (윤년)
**Then**: 윤년에만 2월 29일에 일정이 생성됨 (평년은 건너뛰기)

**예시 2 - 특수 케이스 (2월 29일, 윤년)**:
```typescript
// 입력
startDate: "2024-02-29"  // 2024년 2월 29일 (윤년)
repeatType: "yearly"
interval: 1
endDate: "2028-02-29"

// 출력
[
  "2024-02-29",  // 2024년 ✅ (윤년)
  // "2025-02-29" → ❌ 2025년은 평년, 건너뛰기
  // "2026-02-29" → ❌ 2026년은 평년, 건너뛰기
  // "2027-02-29" → ❌ 2027년은 평년, 건너뛰기
  "2028-02-29"   // 2028년 ✅ (윤년)
]
```

**⚠️ 중요**: 평년(윤년이 아닌 해)은 2월 28일로 대체하지 않고 **건너뛰기**

**윤년 판별 규칙**:
```typescript
function isLeapYear(year: number): boolean {
  // 4로 나누어떨어지고, 100으로 나누어떨어지지 않거나, 400으로 나누어떨어지면 윤년
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 예시:
// 2024: 윤년 (4로 나누어떨어지고, 100으로 나누어떨어지지 않음)
// 2025: 평년 (4로 나누어떨어지지 않음)
// 2000: 윤년 (400으로 나누어떨어짐)
// 1900: 평년 (100으로 나누어떨어지지만, 400으로 나누어떨어지지 않음)
```

---

### BL-006: 일정 겹침 무시

**Given**: 사용자가 반복 일정을 생성
**When**: 기존 일정과 시간이 겹치는 경우
**Then**: 겹침 경고 없이 일정이 생성됨

**근거**: 요구사항에 명시 ("반복일정은 일정 겹침을 고려하지 않는다.")

**구현**:
```typescript
// addOrUpdateEvent 함수 수정
const addOrUpdateEvent = async () => {
  // ... 유효성 검증 ...

  // 반복 일정인 경우 겹침 검사 건너뛰기
  if (isRepeating && repeatType !== 'none') {
    await saveEvent(eventData);
    resetForm();
    return;
  }

  // 일반 일정은 기존대로 겹침 검사
  const overlapping = findOverlappingEvents(eventData, events);
  if (overlapping.length > 0) {
    // ... 겹침 다이얼로그 표시 ...
  }
};
```

---

## API 명세

### API-001: 반복 일정 생성

**엔드포인트**: POST /api/events-list

**요청 본문**:
```json
{
  "events": [
    {
      "title": "주간 회의",
      "date": "2025-01-06",
      "startTime": "09:00",
      "endTime": "10:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31"
      },
      "notificationTime": 10
    },
    {
      "title": "주간 회의",
      "date": "2025-01-13",
      "startTime": "09:00",
      "endTime": "10:00",
      "description": "팀 주간 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31"
      },
      "notificationTime": 10
    }
    // ... 나머지 일정들 ...
  ]
}
```

**응답** (201 Created):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "주간 회의",
    "date": "2025-01-06",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "팀 주간 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "123e4567-e89b-12d3-a456-426614174000"  // 서버가 생성한 시리즈 ID
    },
    "notificationTime": 10
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "주간 회의",
    "date": "2025-01-13",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "팀 주간 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "123e4567-e89b-12d3-a456-426614174000"  // 같은 시리즈 ID
    },
    "notificationTime": 10
  }
  // ... 나머지 일정들 ...
]
```

**서버 동작** (server.js:76-99에 이미 구현됨):
1. `repeatId` 생성 (UUID)
2. 각 일정마다 개별 `id` 생성
3. 반복 일정인 경우 모두 같은 `repeat.id` 설정
4. 파일에 저장 후 생성된 일정 배열 반환

---

### API-002: 반복 일정 시리즈 수정

**엔드포인트**: PUT /api/recurring-events/:repeatId

**URL 파라미터**:
- `repeatId`: 반복 시리즈 ID (repeat.id)

**요청 본문** (수정할 필드만 포함):
```json
{
  "title": "주간 팀 미팅",  // 제목 변경
  "location": "회의실 B"   // 장소 변경
}
```

**응답** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "주간 팀 미팅",  // 변경됨
    "date": "2025-01-06",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "팀 주간 회의",
    "location": "회의실 B",  // 변경됨
    "category": "업무",
    "repeat": {
      "type": "weekly",
      "interval": 1,
      "endDate": "2025-12-31",
      "id": "123e4567-e89b-12d3-a456-426614174000"
    },
    "notificationTime": 10
  }
  // ... 같은 시리즈의 다른 일정들도 동일하게 변경됨 ...
]
```

**서버 동작** (server.js:142-174에 이미 구현됨):
1. `repeatId`로 해당 시리즈의 모든 일정 찾기
2. 각 일정에 변경사항 적용
3. 파일에 저장 후 수정된 일정 배열 반환

**수정 가능 필드**:
- title, description, location, category
- notificationTime
- repeat (반복 설정 자체)

**수정 불가 필드**:
- id (개별 일정 ID)
- date, startTime, endTime (시간 변경 시 새 시리즈 생성 권장)

---

### API-003: 반복 일정 시리즈 삭제

**엔드포인트**: DELETE /api/recurring-events/:repeatId

**URL 파라미터**:
- `repeatId`: 반복 시리즈 ID (repeat.id)

**응답** (204 No Content): 본문 없음

**서버 동작** (server.js:176-192에 이미 구현됨):
1. `repeatId`로 해당 시리즈의 모든 일정 찾기
2. 해당 일정들을 모두 삭제
3. 파일에 저장

---

## 특수 케이스 처리

### SC-001: 매월 31일 반복

**시나리오**: 사용자가 1월 31일에 매월 반복 일정을 생성

**Given**: startDate = "2025-01-31", repeatType = "monthly", interval = 1
**When**: 반복 일정 생성
**Then**: 31일이 있는 달에만 일정이 생성됨

**생성되는 일정**:
- 2025-01-31 ✅ (1월: 31일 있음)
- 2025-02-31 ❌ (2월: 31일 없음, 건너뛰기)
- 2025-03-31 ✅ (3월: 31일 있음)
- 2025-04-31 ❌ (4월: 31일 없음, 건너뛰기)
- 2025-05-31 ✅ (5월: 31일 있음)
- 2025-06-31 ❌ (6월: 31일 없음, 건너뛰기)
- 2025-07-31 ✅ (7월: 31일 있음)
- 2025-08-31 ✅ (8월: 31일 있음)
- 2025-09-31 ❌ (9월: 31일 없음, 건너뛰기)
- 2025-10-31 ✅ (10월: 31일 있음)
- 2025-11-31 ❌ (11월: 31일 없음, 건너뛰기)
- 2025-12-31 ✅ (12월: 31일 있음)

**구현 로직**:
```typescript
function isValidMonthlyDate(year: number, month: number, day: number): boolean {
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

// 예시:
isValidMonthlyDate(2025, 2, 31);  // false (2월은 28일까지)
isValidMonthlyDate(2025, 3, 31);  // true (3월은 31일까지)
isValidMonthlyDate(2025, 4, 31);  // false (4월은 30일까지)
```

**❌ 하지 말아야 할 것**:
- 2월 → 2월 28일로 대체 (평년) 또는 2월 29일로 대체 (윤년)
- 4월, 6월, 9월, 11월 → 해당 월의 마지막 날로 대체

**✅ 올바른 동작**:
- 31일이 없는 달은 **일정을 생성하지 않음** (건너뛰기)

---

### SC-002: 매년 2월 29일 반복 (윤년)

**시나리오**: 사용자가 2024년 2월 29일에 매년 반복 일정을 생성

**Given**: startDate = "2024-02-29", repeatType = "yearly", interval = 1
**When**: 반복 일정 생성
**Then**: 윤년에만 일정이 생성됨

**생성되는 일정**:
- 2024-02-29 ✅ (윤년)
- 2025-02-29 ❌ (평년, 건너뛰기)
- 2026-02-29 ❌ (평년, 건너뛰기)
- 2027-02-29 ❌ (평년, 건너뛰기)
- 2028-02-29 ✅ (윤년)
- 2029-02-29 ❌ (평년, 건너뛰기)
- 2030-02-29 ❌ (평년, 건너뛰기)
- 2031-02-29 ❌ (평년, 건너뛰기)
- 2032-02-29 ✅ (윤년)

**윤년 판별**:
```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
```

**❌ 하지 말아야 할 것**:
- 평년 → 2월 28일로 대체

**✅ 올바른 동작**:
- 평년은 **일정을 생성하지 않음** (건너뛰기)

---

### SC-003: 매월 30일 반복

**시나리오**: 사용자가 1월 30일에 매월 반복 일정을 생성

**Given**: startDate = "2025-01-30", repeatType = "monthly", interval = 1
**When**: 반복 일정 생성
**Then**: 30일이 있는 달에만 일정이 생성됨

**생성되는 일정**:
- 2025-01-30 ✅ (1월: 31일까지)
- 2025-02-30 ❌ (2월: 28일까지, 건너뛰기)
- 2025-03-30 ✅ (3월: 31일까지)
- 2025-04-30 ✅ (4월: 30일까지)
- 2025-05-30 ✅ (5월: 31일까지)
- 2025-06-30 ✅ (6월: 30일까지)
- 2025-07-30 ✅ (7월: 31일까지)
- 2025-08-30 ✅ (8월: 31일까지)
- 2025-09-30 ✅ (9월: 30일까지)
- 2025-10-30 ✅ (10월: 31일까지)
- 2025-11-30 ✅ (11월: 30일까지)
- 2025-12-30 ✅ (12월: 31일까지)

**특징**: 2월만 건너뛰고 나머지 모든 달에 생성됨

---

## 테스트 시나리오

### TS-001: 반복 설정 UI 표시/숨김

**Given**: 사용자가 일정 추가 폼에 있을 때
**When**: "반복 일정" 체크박스를 체크
**Then**: 반복 유형, 반복 간격, 반복 종료일 입력 필드가 표시됨

**Given**: 사용자가 "반복 일정" 체크박스를 체크한 상태일 때
**When**: 체크박스를 다시 체크 해제
**Then**: 반복 설정 입력 필드가 숨겨짐

---

### TS-002: 매일 반복 일정 생성

**Given**: 사용자가 다음 정보를 입력
- 제목: "매일 운동"
- 날짜: "2025-01-06"
- 시작 시간: "06:00"
- 종료 시간: "07:00"
- 반복 일정: 체크
- 반복 유형: "매일"
- 반복 간격: 1
- 반복 종료일: "2025-01-10"

**When**: "일정 추가" 버튼 클릭
**Then**:
- 5개의 일정이 생성됨 (1/6, 1/7, 1/8, 1/9, 1/10)
- 모든 일정이 같은 repeat.id를 가짐
- 캘린더 뷰에 모든 일정이 표시됨
- "일정이 추가되었습니다." 알림 표시

---

### TS-003: 매주 반복 일정 생성

**Given**: 사용자가 다음 정보를 입력
- 제목: "주간 회의"
- 날짜: "2025-01-06" (월요일)
- 시작 시간: "09:00"
- 종료 시간: "10:00"
- 반복 일정: 체크
- 반복 유형: "매주"
- 반복 간격: 1
- 반복 종료일: "2025-01-27"

**When**: "일정 추가" 버튼 클릭
**Then**:
- 4개의 일정이 생성됨 (1/6, 1/13, 1/20, 1/27, 모두 월요일)
- 모든 일정이 같은 repeat.id를 가짐

---

### TS-004: 매월 31일 반복 일정 생성 (특수 케이스)

**Given**: 사용자가 다음 정보를 입력
- 제목: "월말 보고"
- 날짜: "2025-01-31"
- 시작 시간: "17:00"
- 종료 시간: "18:00"
- 반복 일정: 체크
- 반복 유형: "매월"
- 반복 간격: 1
- 반복 종료일: "2025-05-31"

**When**: "일정 추가" 버튼 클릭
**Then**:
- 3개의 일정만 생성됨 (1/31, 3/31, 5/31)
- 2월과 4월은 건너뛰어짐 (31일 없음)
- 2월 28일이나 4월 30일에는 일정이 생성되지 않음

---

### TS-005: 매년 2월 29일 반복 일정 생성 (특수 케이스)

**Given**: 사용자가 다음 정보를 입력
- 제목: "윤년 기념일"
- 날짜: "2024-02-29" (윤년)
- 시작 시간: "12:00"
- 종료 시간: "13:00"
- 반복 일정: 체크
- 반복 유형: "매년"
- 반복 간격: 1
- 반복 종료일: "2028-02-29"

**When**: "일정 추가" 버튼 클릭
**Then**:
- 2개의 일정만 생성됨 (2024-02-29, 2028-02-29)
- 2025년, 2026년, 2027년은 건너뛰어짐 (평년)
- 2월 28일에는 일정이 생성되지 않음

---

### TS-006: 반복 종료일 없음 (무한 반복)

**Given**: 사용자가 다음 정보를 입력
- 제목: "매주 운동"
- 날짜: "2025-01-06"
- 시작 시간: "18:00"
- 종료 시간: "19:00"
- 반복 일정: 체크
- 반복 유형: "매주"
- 반복 간격: 1
- 반복 종료일: (비어있음)

**When**: "일정 추가" 버튼 클릭
**Then**:
- 기본 종료일이 자동 설정됨 (1년 후)
- 52개의 일정이 생성됨 (매주 × 52주)

---

### TS-007: 반복 일정 겹침 무시

**Given**:
- 기존 일정: "2025-01-06 09:00-10:00"
- 사용자가 겹치는 반복 일정을 생성하려 함
  - 날짜: "2025-01-06"
  - 시작 시간: "09:30"
  - 종료 시간: "10:30"
  - 반복 일정: 체크

**When**: "일정 추가" 버튼 클릭
**Then**:
- 겹침 경고 다이얼로그가 표시되지 않음
- 일정이 바로 생성됨

---

### TS-008: 격주 반복 일정 생성

**Given**: 사용자가 다음 정보를 입력
- 제목: "격주 리뷰"
- 날짜: "2025-01-06" (월요일)
- 시작 시간: "14:00"
- 종료 시간: "15:00"
- 반복 일정: 체크
- 반복 유형: "매주"
- 반복 간격: 2 (격주)
- 반복 종료일: "2025-02-03"

**When**: "일정 추가" 버튼 클릭
**Then**:
- 3개의 일정이 생성됨 (1/6, 1/20, 2/3)
- 1/13, 1/27은 건너뛰어짐 (격주이므로)

---

### TS-009: 반복 간격 검증

**Given**: 사용자가 다음 정보를 입력
- 반복 일정: 체크
- 반복 간격: 0 또는 음수

**When**: "일정 추가" 버튼 클릭
**Then**:
- "반복 간격은 1 이상이어야 합니다." 에러 메시지 표시
- 일정이 생성되지 않음

---

### TS-010: 반복 종료일 검증

**Given**: 사용자가 다음 정보를 입력
- 날짜: "2025-01-06"
- 반복 일정: 체크
- 반복 종료일: "2025-01-05" (시작 날짜보다 이전)

**When**: "일정 추가" 버튼 클릭
**Then**:
- "반복 종료일은 시작 날짜보다 이후여야 합니다." 에러 메시지 표시
- 일정이 생성되지 않음

---

## 참조

### 관련 명세
- [01. 데이터 모델](./01-data-models.md): RepeatInfo, RepeatType 타입 정의
- [02. 비즈니스 규칙](./02-business-rules.md): BR-REPEAT 섹션
- [04. API 명세](./04-api-specification.md): /api/events-list 엔드포인트

### 구현 파일
- `src/types.ts`: 타입 정의 (이미 존재)
- `src/App.tsx`: UI 코드 (주석 해제 필요)
- `src/hooks/useEventForm.ts`: 폼 상태 관리 (주석 해제 필요)
- `src/hooks/useEventOperations.ts`: API 호출 (수정 필요)
- `src/utils/repeatUtils.ts`: 반복 일정 생성 로직 (신규 생성)
- `server.js`: 서버 API (이미 구현됨)

---

**다음 문서**: [테스트 설계](../claudedocs/02-test-design-recurring-events.md) (Agent 2가 작성)
