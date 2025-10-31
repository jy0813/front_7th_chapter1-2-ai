# 반복 일정 UI 통합 설계 문서

**작성일**: 2025-10-31
**작성자**: Design Agent
**목적**: App.tsx 반복 일정 UI 통합 설계 및 구현 가이드

---

## 📋 설계 개요

### 현재 상태 분석

**✅ 완료된 부분**:
1. **백엔드 로직 (100%)**:
   - `src/utils/repeatUtils.ts`: 반복 일정 생성 유틸리티 함수 완성
   - 단위 테스트 13개 통과 (커버리지 99.16%)
   - 특수 케이스 처리 (31일 매월, 윤년 2월 29일)

2. **타입 정의 (100%)**:
   - `RepeatType`: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
   - `RepeatInfo`: type, interval, endDate 필드

3. **상태 관리 (100%)**:
   - `useEventForm`: repeatType, repeatInterval, repeatEndDate 상태 이미 구현됨
   - setter 함수 모두 준비 완료

**❌ 미완료 부분**:
1. **UI 레이어 (0%)**:
   - App.tsx 441-478줄: 반복 옵션 UI 주석 처리
   - RepeatType import 주석 처리 (38줄)
   - setter 함수 주석 처리 (80-84줄)

2. **API 연동 (0%)**:
   - `useEventOperations`: `/api/events-list` 엔드포인트 미연동
   - 반복 일정 생성 시 유틸 함수 호출 로직 없음

---

## 🎯 설계 목표

### Phase 1: UI 주석 해제 및 활성화
1. RepeatType import 주석 해제
2. setter 함수 (setRepeatType, setRepeatInterval, setRepeatEndDate) 주석 해제
3. 반복 옵션 UI (441-478줄) 주석 해제

### Phase 2: 폼 제출 로직 통합
1. `addOrUpdateEvent` 함수에 반복 일정 생성 로직 추가
2. `isRepeating === true`일 때 유틸 함수 호출
3. 생성된 이벤트 배열을 `/api/events-list`로 전송

### Phase 3: API 연동
1. `useEventOperations`에 `saveMultipleEvents` 함수 추가
2. `/api/events-list` POST 엔드포인트 호출
3. 에러 처리 및 사용자 피드백

---

## 🛠️ 상세 설계

### 1. App.tsx 수정 계획

#### 1.1 Import 수정

**현재 (38-39줄)**:
```typescript
// import { Event, EventForm, RepeatType } from './types';
import { Event, EventForm } from './types';
```

**변경 후**:
```typescript
import { Event, EventForm, RepeatType } from './types';
```

**변경 이유**:
- RepeatType을 Select의 onChange 핸들러에서 사용 (448줄)
- TypeScript 타입 안전성 확보

---

#### 1.2 useEventForm 훅 호출 수정

**현재 (79-84줄)**:
```typescript
repeatType,
// setRepeatType,
repeatInterval,
// setRepeatInterval,
repeatEndDate,
// setRepeatEndDate,
```

**변경 후**:
```typescript
repeatType,
setRepeatType,
repeatInterval,
setRepeatInterval,
repeatEndDate,
setRepeatEndDate,
```

**변경 이유**:
- 반복 옵션 UI에서 사용자 입력을 받아야 함
- useEventForm 훅은 이미 이 함수들을 반환하고 있음 (확인 완료)

---

#### 1.3 반복 옵션 UI 주석 해제

**현재 (440-478줄)**:
```typescript
{/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
{/* {isRepeating && (
  <Stack spacing={2}>
    ...
  </Stack>
)} */}
```

**변경 후**:
```typescript
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

**UI 구성 요소**:
1. **반복 유형 Select**:
   - 값: 'daily', 'weekly', 'monthly', 'yearly'
   - 레이블: '매일', '매주', '매월', '매년'

2. **반복 간격 TextField**:
   - type="number"
   - min=1 (최소값 검증)
   - 기본값: 1

3. **반복 종료일 TextField**:
   - type="date"
   - 선택 사항 (값이 없으면 2년 제한 적용)

---

### 2. 폼 제출 로직 설계

#### 2.1 addOrUpdateEvent 함수 수정

**현재 로직 (110-146줄)**:
```typescript
const addOrUpdateEvent = async () => {
  // 유효성 검증
  if (!title || !date || !startTime || !endTime) {
    enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
    return;
  }

  // 시간 에러 검증
  if (startTimeError || endTimeError) {
    enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
    return;
  }

  // 이벤트 데이터 생성
  const eventData: Event | EventForm = { ... };

  // 겹침 검증
  const overlapping = findOverlappingEvents(eventData, events);
  if (overlapping.length > 0) {
    // 겹침 다이얼로그 표시
  } else {
    // 단일 이벤트 저장
    await saveEvent(eventData);
    resetForm();
  }
};
```

**변경 후 로직**:
```typescript
const addOrUpdateEvent = async () => {
  // 1. 유효성 검증 (기존 로직 유지)
  if (!title || !date || !startTime || !endTime) {
    enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
    return;
  }

  if (startTimeError || endTimeError) {
    enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
    return;
  }

  // 2. 기본 이벤트 데이터 생성
  const baseEventData: EventForm = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
  };

  // 3. 반복 일정 여부에 따라 분기
  if (isRepeating && repeatType !== 'none' && !editingEvent) {
    // 3-1. 반복 일정 생성
    await handleRecurringEventCreation(baseEventData);
  } else {
    // 3-2. 단일 일정 생성/수정 (기존 로직)
    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      ...baseEventData,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  }
};
```

---

#### 2.2 반복 일정 생성 헬퍼 함수

**새로운 함수 추가**:
```typescript
const handleRecurringEventCreation = async (baseEventData: EventForm) => {
  try {
    // 1. repeatUtils 함수 import 추가
    import {
      generateDailyEvents,
      generateWeeklyEvents,
      generateMonthlyEvents,
      generateYearlyEvents,
    } from './utils/repeatUtils';

    // 2. 반복 유형에 따라 적절한 함수 호출
    let generatedEvents: EventForm[] = [];

    switch (baseEventData.repeat.type) {
      case 'daily':
        generatedEvents = generateDailyEvents(baseEventData);
        break;
      case 'weekly':
        generatedEvents = generateWeeklyEvents(baseEventData);
        break;
      case 'monthly':
        generatedEvents = generateMonthlyEvents(baseEventData);
        break;
      case 'yearly':
        generatedEvents = generateYearlyEvents(baseEventData);
        break;
      default:
        throw new Error('Invalid repeat type');
    }

    // 3. 생성된 이벤트 개수 확인
    if (generatedEvents.length === 0) {
      enqueueSnackbar('생성할 반복 일정이 없습니다.', { variant: 'warning' });
      return;
    }

    // 4. 사용자 확인 메시지
    const confirmed = window.confirm(
      `${generatedEvents.length}개의 반복 일정이 생성됩니다. 계속하시겠습니까?`
    );

    if (!confirmed) {
      return;
    }

    // 5. API 호출 (useEventOperations에 새로운 함수 추가 필요)
    await saveMultipleEvents(generatedEvents);

    enqueueSnackbar(
      `${generatedEvents.length}개의 반복 일정이 생성되었습니다.`,
      { variant: 'success' }
    );

    resetForm();
  } catch (error) {
    console.error('Error creating recurring events:', error);
    enqueueSnackbar('반복 일정 생성 실패', { variant: 'error' });
  }
};
```

**설계 포인트**:
1. **유틸 함수 호출**: repeatType에 따라 적절한 generate 함수 선택
2. **사용자 확인**: 대량 일정 생성 전 확인 다이얼로그
3. **API 연동**: saveMultipleEvents 함수 필요 (다음 단계)
4. **에러 처리**: try-catch로 안전하게 처리

---

### 3. useEventOperations 훅 수정

#### 3.1 saveMultipleEvents 함수 추가

**추가할 함수**:
```typescript
const saveMultipleEvents = async (eventsData: EventForm[]) => {
  try {
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsData }),
    });

    if (!response.ok) {
      throw new Error('Failed to save multiple events');
    }

    await fetchEvents();
    onSave?.();

    return true;
  } catch (error) {
    console.error('Error saving multiple events:', error);
    throw error; // 상위에서 에러 처리
  }
};
```

**API 엔드포인트**:
- **URL**: `POST /api/events-list`
- **요청 본문**:
  ```json
  {
    "events": [
      {
        "title": "반복 일정",
        "date": "2025-01-01",
        "startTime": "10:00",
        "endTime": "11:00",
        "description": "",
        "location": "",
        "category": "업무",
        "repeat": { "type": "daily", "interval": 1, "endDate": "2025-01-07" },
        "notificationTime": 10
      },
      ...
    ]
  }
  ```
- **응답**:
  ```json
  {
    "events": [
      { "id": "uuid-1", ... },
      { "id": "uuid-2", ... },
      ...
    ]
  }
  ```

**훅 반환값 수정**:
```typescript
return {
  events,
  fetchEvents,
  saveEvent,
  saveMultipleEvents,  // 추가
  deleteEvent
};
```

---

### 4. 데이터 흐름도

```
사용자 입력 (App.tsx)
  ↓
isRepeating === true 체크
  ↓
repeatType에 따라 분기
  ├─ daily   → generateDailyEvents(baseEventData)
  ├─ weekly  → generateWeeklyEvents(baseEventData)
  ├─ monthly → generateMonthlyEvents(baseEventData)
  └─ yearly  → generateYearlyEvents(baseEventData)
  ↓
EventForm[] 배열 생성
  ↓
사용자 확인 (confirm)
  ↓
saveMultipleEvents(generatedEvents)
  ↓
POST /api/events-list
  ↓
서버에 저장 (realEvents.json)
  ↓
fetchEvents() 재호출
  ↓
UI 업데이트
```

---

## 🎨 UI 설계 상세

### 반복 옵션 UI 구조

```
┌─────────────────────────────────────┐
│ 📅 일정 추가                         │
├─────────────────────────────────────┤
│ 제목: [텍스트 입력]                   │
│ 날짜: [날짜 선택]                     │
│ 시간: [시작] - [종료]                 │
│ ...                                  │
│                                      │
│ ☑️ 반복 일정                          │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ 반복 유형: [매일 ▼]              │ │
│ │   - 매일                         │ │
│ │   - 매주                         │ │
│ │   - 매월                         │ │
│ │   - 매년                         │ │
│ │                                  │ │
│ │ 반복 간격: [1]  반복 종료일: [날짜] │ │
│ └─────────────────────────────────┘ │
│                                      │
│ 알림 설정: [10분 전 ▼]                │
│                                      │
│ [일정 추가]                           │
└─────────────────────────────────────┘
```

### 상태 전환 다이어그램

```
초기 상태 (isRepeating = false)
  ↓
[반복 일정 체크박스 클릭]
  ↓
isRepeating = true
  ↓
반복 옵션 UI 표시
  ↓
사용자가 반복 유형 선택 (예: 매일)
  ↓
repeatType = 'daily'
  ↓
사용자가 interval, endDate 입력
  ↓
[일정 추가 버튼 클릭]
  ↓
addOrUpdateEvent() 실행
  ↓
handleRecurringEventCreation() 호출
  ↓
generateDailyEvents() 호출
  ↓
EventForm[] 배열 생성 (예: 7개)
  ↓
confirm 다이얼로그 표시
  ↓
사용자 확인
  ↓
saveMultipleEvents() 호출
  ↓
POST /api/events-list
  ↓
성공 메시지 표시
  ↓
resetForm() → 초기 상태로 복귀
```

---

## 🔍 검증 체크리스트

### Phase 1: UI 활성화
- [ ] RepeatType import 주석 해제
- [ ] setRepeatType, setRepeatInterval, setRepeatEndDate 주석 해제
- [ ] 반복 옵션 UI (441-478줄) 주석 해제
- [ ] TypeScript 컴파일 에러 0개
- [ ] ESLint 에러 0개

### Phase 2: 폼 제출 로직
- [ ] handleRecurringEventCreation 함수 추가
- [ ] addOrUpdateEvent 함수 수정 (분기 추가)
- [ ] repeatUtils import 추가
- [ ] 테스트: 매일 반복 (interval 1, endDate 7일 후) → 7개 생성 확인
- [ ] 테스트: 매주 반복 (interval 2, endDate 1개월 후) → 격주 확인
- [ ] 테스트: 매월 반복 (31일) → 31일 있는 달만 생성 확인

### Phase 3: API 연동
- [ ] useEventOperations에 saveMultipleEvents 추가
- [ ] /api/events-list POST 호출 확인
- [ ] 서버 응답 처리 확인
- [ ] 에러 처리 확인
- [ ] fetchEvents() 재호출 확인

### Phase 4: 사용자 경험
- [ ] confirm 다이얼로그 표시 확인
- [ ] 성공 메시지 표시 확인
- [ ] 실패 시 에러 메시지 표시 확인
- [ ] 폼 리셋 확인

---

## ⚠️ 주의사항

### 1. 일정 겹침 검증 제외
- **명세 요구사항**: 반복 일정은 일정 겹침을 고려하지 않음
- **구현**: `handleRecurringEventCreation`에서는 `findOverlappingEvents` 호출 안 함

### 2. 수정 모드에서 반복 일정 처리
- **현재 설계**: 수정 모드에서는 반복 일정 생성 안 함
- **이유**: 반복 일정 시리즈 수정은 별도 API 필요 (`PUT /api/recurring-events/:repeatId`)
- **향후 개선**: 반복 일정 시리즈 수정 기능 추가

### 3. repeatType 기본값
- **현재**: `repeatType = 'none'` (useEventForm.ts:17)
- **문제**: 'none'은 RepeatType에 포함되지만 반복 없음을 의미
- **해결**: isRepeating이 true일 때만 반복 옵션 UI 표시 (이미 구현됨)

### 4. 2년 제한
- **명세 요구사항**: endDate가 없으면 2년 제한 적용
- **구현**: `calculateEndCondition` 함수에서 처리 (완료)
- **확인**: endDate가 빈 문자열('')일 때도 undefined로 처리되는지 확인 필요

---

## 📊 예상 작업 시간

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| Phase 1 | UI 주석 해제 및 테스트 | 10분 |
| Phase 2 | 폼 제출 로직 구현 | 30분 |
| Phase 3 | API 연동 | 20분 |
| Phase 4 | 테스트 및 검증 | 30분 |
| **총합** | | **90분 (1.5시간)** |

---

## 🎯 다음 단계

1. **즉시 시작 가능**:
   - App.tsx 38줄: RepeatType import 주석 해제
   - App.tsx 80-84줄: setter 함수 주석 해제
   - App.tsx 440-478줄: 반복 옵션 UI 주석 해제

2. **Phase 2 준비**:
   - handleRecurringEventCreation 함수 추가
   - addOrUpdateEvent 함수 수정

3. **Phase 3 준비**:
   - useEventOperations에 saveMultipleEvents 추가

---

**설계 완료일**: 2025-10-31
**다음 문서**: `claudedocs/implementation-recurring-ui.md` (구현 완료 후 작성)
