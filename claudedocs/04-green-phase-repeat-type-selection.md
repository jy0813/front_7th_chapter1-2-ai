# Agent 4: Green Phase - 반복 일정 생성 로직 구현

**작성일**: 2025-10-31
**Agent**: Green Phase Agent (Agent 4)
**상태**: 완료 ✅

---

## Phase 4 완료 요약

### 구현 결과

- ✅ **단위 테스트 통과**: 17/17 (easy.repeatUtils.spec.ts)
- ✅ **통합 테스트 통과**: 14/14 (medium.integration.spec.tsx 반복 일정 블록)
- ✅ **전체 테스트 통과**: 122/122
- ✅ **Git 커밋 완료**: `feat: [GREEN] 반복 일정 생성 로직 및 UI 구현`

### 구현 파일

1. **src/utils/repeatUtils.ts** (신규 생성, 130줄)
   - 5개 함수: generateDailyDates, generateWeeklyDates, generateMonthlyDates, generateYearlyDates, isLeapYear

2. **src/App.tsx** (수정)
   - 반복 UI 주석 해제 (라인 439-476)
   - Repeat 아이콘 표시 (라인 542)
   - POST /api/events-list 연동 (라인 144-197)
   - repeatUtils import 추가

3. **src/types.ts** (수정)
   - RepeatInfo 인터페이스에 id 필드 추가

---

## 구현 상세 설명

### 1. repeatUtils.ts - 반복 날짜 생성 로직

#### 1.1 isLeapYear(year: number): boolean

**역할**: 윤년 여부 판단

**알고리즘**:
```typescript
(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
```

**논리**:
- 4로 나누어떨어지고
- (100으로 나누어떨어지지 않거나 OR 400으로 나누어떨어지면) 윤년

**예시**:
- 2024: 윤년 (4로 나누어떨어지고 100으로 나누어떨어지지 않음)
- 2000: 윤년 (400으로 나누어떨어짐)
- 1900: 평년 (100으로 나누어떨어지지만 400으로 나누어떨어지지 않음)

---

#### 1.2 generateDailyDates(startDate: string, endDate: string): string[]

**역할**: 시작일부터 종료일까지 매일 날짜 생성

**알고리즘**:
1. Date 객체로 시작일, 종료일 파싱
2. while 루프로 current <= end까지 반복
3. 각 날짜를 YYYY-MM-DD 형식으로 배열에 추가
4. current.setDate(current.getDate() + 1) (하루씩 증가)

**최소 구현 이유**:
- 가장 단순한 루프 방식
- 외부 라이브러리 불필요
- 테스트 통과에 충분

---

#### 1.3 generateWeeklyDates(startDate: string, endDate: string): string[]

**역할**: 시작일의 요일과 같은 요일에 매주 날짜 생성

**알고리즘**:
1. 시작일의 요일 고정
2. while 루프로 current <= end까지 반복
3. 각 날짜를 배열에 추가
4. current.setDate(current.getDate() + 7) (7일씩 증가)

**특징**:
- 요일 자동 유지 (Date 객체의 setDate가 자동으로 다음 주 같은 요일 계산)
- 예: 2025-01-06 (월요일) → 01-13 (월요일) → 01-20 (월요일)

---

#### 1.4 generateMonthlyDates(startDate: string, endDate: string): string[]

**역할**: 시작일의 날짜와 같은 날짜에 매월 날짜 생성 (⭐️ 31일 특수 케이스 처리)

**알고리즘**:
1. 시작일에서 targetDay (날짜) 추출 (예: 31일)
2. year, month 변수로 매월 순회
3. 각 달에 targetDay가 존재하는지 검증 (`isDayValidInMonth`)
4. 존재하면 배열에 추가
5. month++, year++ (12월 넘어가면 연도 증가)

**특수 케이스: 31일 매월 반복**
```typescript
// 예: 2025-01-31 시작, 2025-06-30 종료
// 결과: ['2025-01-31', '2025-03-31', '2025-05-31']

// 건너뛴 달:
// - 2월: 28일까지만 있음 (평년)
// - 4월: 30일까지만 있음
// - 6월: 종료일이 06-30이므로 31일 생성 불가
```

**isDayValidInMonth 헬퍼 함수**:
```typescript
function isDayValidInMonth(year: number, month: number, day: number): boolean {
  const lastDay = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜
  return day <= lastDay;
}
```

**하드코딩 vs 일반화**:
- 현재: `new Date(year, month + 1, 0).getDate()`로 마지막 날짜 계산 (일반화됨)
- YAGNI 원칙: 테스트 통과에 필요한 만큼만 구현

---

#### 1.5 generateYearlyDates(startDate: string, endDate: string): string[]

**역할**: 시작일의 월/일과 같은 날짜에 매년 날짜 생성 (⭐️ 윤년 2월 29일 특수 케이스 처리)

**알고리즘**:
1. 시작일에서 targetMonth, targetDay 추출
2. 2월 29일 윤년 케이스 확인: `isLeapDayCase = targetMonth === 1 && targetDay === 29`
3. year 변수로 매년 순회
4. **윤년 케이스**: `isLeapYear(year)`가 true인 연도만 추가
5. **일반 케이스**: 모든 연도에 추가

**특수 케이스: 윤년 2월 29일 매년 반복**
```typescript
// 예: 2024-02-29 시작, 2030-12-31 종료
// 결과: ['2024-02-29', '2028-02-29']

// 건너뛴 연도:
// - 2025, 2026, 2027, 2029, 2030: 평년 (2월 29일 없음)
```

**일반 날짜 매년 반복**
```typescript
// 예: 2025-03-15 시작, 2029-12-31 종료
// 결과: ['2025-03-15', '2026-03-15', '2027-03-15', '2028-03-15', '2029-03-15']
// 모든 연도에 3월 15일 존재
```

---

### 2. App.tsx - 반복 UI 및 API 연동

#### 2.1 반복 UI 주석 해제 (라인 439-476)

**변경 전**:
```tsx
{/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
{/* {isRepeating && (
  <Stack spacing={2}>
    ...
  </Stack>
)} */}
```

**변경 후**:
```tsx
{isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select value={repeatType} onChange={...}>
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel>반복 간격</FormLabel>
        <TextField type="number" value={repeatInterval} ... />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>반복 종료일</FormLabel>
        <TextField type="date" value={repeatEndDate} ... />
      </FormControl>
    </Stack>
  </Stack>
)}
```

---

#### 2.2 Repeat 아이콘 표시 (라인 542)

**역할**: 반복 일정에 시각적 표시 추가

**구현**:
```tsx
<Stack direction="row" spacing={1} alignItems="center">
  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" />} {/* 추가 */}
  <Typography>
    {event.title}
  </Typography>
</Stack>
```

**조건**: `event.repeat.type !== 'none'`일 때만 Repeat 아이콘 표시

---

#### 2.3 POST /api/events-list 연동 (라인 144-197)

**역할**: 반복 일정 생성 시 여러 이벤트를 한 번에 서버로 전송

**알고리즘**:
```typescript
const addOrUpdateEvent = async () => {
  // ... 유효성 검증 ...

  // 반복 일정인 경우
  if (isRepeating && repeatType !== 'none') {
    const endDate = repeatEndDate || '2025-12-31'; // 기본 종료일
    let dates: string[] = [];

    // 반복 유형에 따라 날짜 생성
    if (repeatType === 'daily') {
      dates = generateDailyDates(date, endDate);
    } else if (repeatType === 'weekly') {
      dates = generateWeeklyDates(date, endDate);
    } else if (repeatType === 'monthly') {
      dates = generateMonthlyDates(date, endDate);
    } else if (repeatType === 'yearly') {
      dates = generateYearlyDates(date, endDate);
    }

    // 반복 일정 ID 생성 (동일한 반복 시리즈 그룹화)
    const repeatId = crypto.randomUUID();

    // 여러 일정 생성
    const eventsToCreate = dates.map((d) => ({
      title,
      date: d,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
        id: repeatId, // 동일한 repeatId로 그룹화
      },
      notificationTime,
    }));

    // POST /api/events-list 호출
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToCreate }),
    });

    // ... 성공/실패 처리 ...
  } else {
    // 일반 일정: 겹침 체크 수행
    const overlapping = findOverlappingEvents(eventData, events);
    // ...
  }
};
```

**핵심 포인트**:
1. ⭐️ **일정 겹침 무시**: 반복 일정은 `findOverlappingEvents` 호출 건너뜀
2. **repeatId 생성**: `crypto.randomUUID()`로 동일한 반복 시리즈 그룹화
3. **기본 종료일**: `repeatEndDate || '2025-12-31'` (명세의 최대 종료일)

---

### 3. types.ts - RepeatInfo 수정

**변경 전**:
```typescript
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}
```

**변경 후**:
```typescript
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string; // 반복 일정 시리즈 ID (추가)
}
```

**역할**: 동일한 반복 시리즈에 속한 일정들을 그룹화

---

## 최소 구현 원칙 준수

### YAGNI (You Aren't Gonna Need It)

✅ **테스트에 명시된 기능만 구현**:
- 17개 단위 테스트 + 14개 통합 테스트 요구사항만 충족
- 추가 기능 없음 (예: 반복 간격 2 이상, 특정 요일 선택 등)

### 단순성 우선 (Simplicity First)

✅ **가장 단순한 방법 선택**:
- while 루프와 Date 객체로 직관적 구현
- 외부 라이브러리 (moment.js, date-fns) 사용 안함
- 클래스/인터페이스 추상화 없음 (순수 함수만)

### Fake it till you make it

✅ **하드코딩 허용**:
- 기본 종료일: `'2025-12-31'` (명세에 명시됨)
- 이유: 테스트 통과에 충분하며, Refactor Phase에서 필요 시 개선 가능

---

## 특수 케이스 처리 검증

### ✅ 31일 매월 반복

**테스트 케이스**: `2025-01-31` 시작, `2025-06-30` 종료

**예상 결과**: `['2025-01-31', '2025-03-31', '2025-05-31']`

**검증 로직**:
```typescript
// isDayValidInMonth(2025, 1, 31) → true (2월은 28일 → false)
// isDayValidInMonth(2025, 2, 31) → false (3월은 31일 → true)
// isDayValidInMonth(2025, 3, 31) → false (4월은 30일 → false)
```

**건너뛴 달**: 2월(28일), 4월(30일), 6월(종료일 초과)

---

### ✅ 윤년 2월 29일 매년 반복

**테스트 케이스**: `2024-02-29` 시작, `2030-12-31` 종료

**예상 결과**: `['2024-02-29', '2028-02-29']`

**검증 로직**:
```typescript
// isLeapYear(2024) → true (윤년)
// isLeapYear(2025) → false (평년) → 건너뜀
// isLeapYear(2026) → false (평년) → 건너뜀
// isLeapYear(2027) → false (평년) → 건너뜀
// isLeapYear(2028) → true (윤년)
// isLeapYear(2029) → false (평년) → 건너뜀
// isLeapYear(2030) → false (평년) → 건너뜀
```

**건너뛴 연도**: 2025, 2026, 2027, 2029, 2030 (평년)

---

## 테스트 성공 확인

### 단위 테스트 (easy.repeatUtils.spec.ts)

```bash
✓ generateDailyDates (2 tests)
✓ generateWeeklyDates (2 tests)
✓ generateMonthlyDates (5 tests)
  ✓ 일반 날짜(15일) 매월 반복은 모든 달 생성
  ✓ ⭐️ 31일 매월 반복은 31일이 없는 달 건너뜀
  ✓ 30일 매월 반복은 30일이 없는 달(2월) 건너뜀
  ✓ 윤년 2월 29일 매월 반복은 평년 2월 건너뜀
  ✓ 1개월 미만 입력 시 시작일만 반환
✓ generateYearlyDates (4 tests)
  ✓ 일반 날짜 매년 반복은 매년 생성
  ✓ ⭐️ 윤년 2월 29일 매년 반복은 평년 건너뜀
  ✓ 평년 2월 28일 매년 반복은 매년 생성
  ✓ 1년 미만 입력 시 시작일만 반환
✓ isLeapYear (4 tests)

Total: 17/17 passed
```

### 통합 테스트 (medium.integration.spec.tsx - 반복 일정 블록)

```bash
describe('반복 일정 기능', () => {
  ✓ 반복 유형 선택 UI (3 tests)
  ✓ 매일 반복 일정 생성 (2 tests)
  ✓ 매주 반복 일정 생성 (1 test)
  ✓ 매월 반복 일정 생성 (3 tests)
    ✓ 일반 날짜 매월 반복 시 모든 달에 일정이 생성된다
    ✓ ⭐️ 31일 매월 반복 시 31일이 없는 달은 건너뛴다
    ✓ 31일 매월 반복 전체 연도 생성 시 7개 일정 생성
  ✓ 매년 반복 일정 생성 (2 tests)
    ✓ 일반 날짜 매년 반복 시 매년 일정이 생성된다
    ✓ ⭐️ 윤년 2월 29일 매년 반복 시 평년을 건너뛴다
  ✓ 반복 일정 아이콘 표시 (2 tests)
  ✓ 일정 겹침 무시 (1 test)
});

Total: 14/14 passed
```

---

## Git 커밋 정보

**커밋 해시**: `2d3302a`
**커밋 메시지**:
```
feat: [GREEN] 반복 일정 생성 로직 및 UI 구현

- repeatUtils.ts: 5개 날짜 생성 함수 구현 (daily, weekly, monthly, yearly, isLeapYear)
- App.tsx: 반복 UI 주석 해제, Repeat 아이콘 표시, POST /api/events-list 연동
- types.ts: RepeatInfo에 id 필드 추가 (반복 일정 그룹 ID)
- 31일 매월 반복 특수 케이스 처리 (31일 없는 달 건너뜀)
- 윤년 2월 29일 매년 반복 특수 케이스 처리 (평년 건너뜀)
- 반복 일정 생성 시 일정 겹침 무시
- 테스트 122개 모두 통과 (단위 17개 + 통합 14개)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**변경 파일**:
- `src/utils/repeatUtils.ts` (신규 생성, 130줄)
- `src/App.tsx` (수정, +105줄, -12줄)
- `src/types.ts` (수정, +1줄)

---

## 다음 단계

**Agent 5 (Refactor Agent)**로 전달:
- ✅ 모든 테스트 통과 (122/122)
- ✅ Git 커밋 완료
- ✅ 최소 구현 원칙 준수

**리팩토링 후보**:
1. **하드코딩 제거**: 기본 종료일 `'2025-12-31'`을 상수로 추출 가능
2. **중복 제거**: 날짜 포맷팅 로직 (padStart) 중복
3. **타입 안전성**: repeatType 분기 로직을 switch 문으로 개선 가능
4. **가독성**: while 루프를 for 루프로 개선 가능

하지만 Agent 5의 판단에 따라 **현재 상태로도 충분히 명확하고 테스트 가능하므로 유지**할 수 있습니다.

---

**Agent 4 작업 완료** ✅

**총 소요 시간**: 약 15분
**구현 난이도**: 중급 (특수 케이스 처리로 인한 복잡도 증가)
**핵심 난관**: 31일 매월 반복 및 윤년 2월 29일 특수 케이스 처리
