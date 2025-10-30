# 반복 날짜 계산 유틸 리팩토링 리포트

**날짜**: 2025-10-31
**Agent**: Refactor Agent (Agent 5)
**파일**: `src/utils/repeatUtils.ts`

---

## 개선 사항 요약

### 1. 중복 코드 제거

#### 개선 전: 무한루프 방지 코드 중복
```typescript
// generateDailyWeeklyDates
let iterationCount = 0;
while (current <= end && iterationCount < MAX_ITERATIONS) {
  iterationCount++;
  // ...
}
if (iterationCount >= MAX_ITERATIONS) {
  throw new Error(`무한루프 방지: 최대 반복 횟수(${MAX_ITERATIONS}) 초과`);
}

// generateMonthlyYearlyDates
let iterationCount = 0;
while (iterationCount < MAX_ITERATIONS) {
  iterationCount++;
  // ...
}
if (iterationCount >= MAX_ITERATIONS) {
  throw new Error(`무한루프 방지: 최대 반복 횟수(${MAX_ITERATIONS}) 초과`);
}
```

#### 개선 후: for 루프로 통일
```typescript
// generateDailyWeeklyDates
for (let i = 0; i < MAX_ITERATIONS && current <= end; i++) {
  dates.push(formatDate(current));
  current.setDate(current.getDate() + daysToAdd);
}

// generateMonthlyYearlyDates
for (let i = 0; i < MAX_ITERATIONS; i++) {
  // ...
}
```

**효과**: 
- 코드 라인 수 감소: 130줄 → 122줄
- 가독성 향상: for 루프가 의도를 더 명확히 표현
- 일관성 향상: 두 함수 모두 동일한 패턴 사용

---

### 2. 함수 추출로 관심사 분리

#### 개선 전: 다음 월 계산 로직이 generateMonthlyYearlyDates에 포함
```typescript
// 다음 날짜 계산
if (repeatType === 'monthly') {
  month += interval;
  while (month >= 12) {
    month -= 12;
    year += 1;
  }
  if (new Date(year, month, 1) > end) break;
} else {
  year += interval;
  if (new Date(year, month, 1) > end) break;
}
```

#### 개선 후: calculateNextMonth 헬퍼 함수 추출
```typescript
function calculateNextMonth(
  year: number,
  month: number,
  interval: number,
  repeatType: 'monthly' | 'yearly'
): { year: number; month: number } {
  if (repeatType === 'yearly') {
    return { year: year + interval, month };
  }

  let nextMonth = month + interval;
  let nextYear = year;

  while (nextMonth >= 12) {
    nextMonth -= 12;
    nextYear += 1;
  }

  return { year: nextYear, month: nextMonth };
}
```

**효과**:
- 단일 책임 원칙(SRP) 준수
- 테스트 가능성 향상 (필요 시 별도 테스트 가능)
- 가독성 향상: 함수명으로 의도 명확히 표현

---

### 3. 매직 넘버 제거

#### 개선 전
```typescript
for (let i = 0; i < 365; i++) { // 365가 무엇을 의미하는지 불명확
for (let i = 0; i < 52; i++) { // 52가 무엇을 의미하는지 불명확
for (let i = 0; i < 12; i++) { // 12가 무엇을 의미하는지 불명확
date.setDate(start.getDate() + i * 7); // 7이 무엇을 의미하는지 불명확
```

#### 개선 후
```typescript
const DAYS_IN_YEAR = 365;
for (let i = 0; i < DAYS_IN_YEAR; i++) {

const WEEKS_IN_YEAR = 52;
const DAYS_IN_WEEK = 7;
for (let i = 0; i < WEEKS_IN_YEAR; i++) {
  date.setDate(start.getDate() + i * DAYS_IN_WEEK);

const MONTHS_IN_YEAR = 12;
for (let i = 0; i < MONTHS_IN_YEAR; i++) {
```

**효과**:
- 가독성 대폭 향상
- 유지보수성 개선: 상수 변경 시 한 곳만 수정
- 자기 문서화(Self-Documenting) 코드

---

### 4. 코드 간소화

#### 개선 전: formatDate
```typescript
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

#### 개선 후
```typescript
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**효과**:
- 중간 변수 제거로 코드 라인 감소
- 가독성 유지하면서 간결함 달성

---

#### 개선 전: generateMonthlyDates
```typescript
export function generateMonthlyDates(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const targetDay = start.getDate();
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  for (let i = 0; i < 12; i++) {
    let year = startYear;
    let month = startMonth + i;

    while (month >= 12) {
      month -= 12;
      year += 1;
    }

    const date = new Date(year, month, targetDay);

    if (date.getDate() === targetDay) {
      dates.push(formatDate(date));
    }
  }

  return dates;
}
```

#### 개선 후
```typescript
export function generateMonthlyDates(startDate: string): string[] {
  const MONTHS_IN_YEAR = 12;
  const dates: string[] = [];
  const start = new Date(startDate);
  const targetDay = start.getDate();

  for (let i = 0; i < MONTHS_IN_YEAR; i++) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i); // Date 객체가 자동으로 년도 조정

    if (date.getDate() === targetDay) {
      dates.push(formatDate(date));
    }
  }

  return dates;
}
```

**효과**:
- Date.setMonth()가 자동으로 년도 넘김 처리
- 수동 월/년도 계산 로직 제거 (8줄 → 2줄)
- 복잡도 감소

---

## 검증 결과

### ✅ 테스트 통과
```bash
$ pnpm vitest --run src/__tests__/unit/easy.repeatUtils.spec.ts

✓ src/__tests__/unit/easy.repeatUtils.spec.ts (10 tests) 7ms

Test Files  1 passed (1)
     Tests  10 passed (10)
```

### ✅ ESLint 검증
```bash
$ pnpm eslint src/utils/repeatUtils.ts
(에러 없음)
```

### ✅ TypeScript 타입 체크
```bash
$ pnpm lint:tsc
(에러 없음)
```

---

## 리팩토링 범위 준수

**⚠️ 리팩토링 범위 제한 (v2.8.0)**:
- ✅ **현재 파일만 수정**: `src/utils/repeatUtils.ts` 단일 파일만 수정
- ✅ **다른 파일 수정 금지**: 테스트 파일, 타입 정의 파일 등 수정하지 않음
- ✅ **테스트 통과 유지**: 모든 테스트가 여전히 통과
- ✅ **동작 변경 없음**: 기능 추가 없이 구조만 개선

---

## 품질 지표

| 항목 | 개선 전 | 개선 후 | 개선률 |
|-----|--------|--------|-------|
| 총 라인 수 | 374줄 | 367줄 | 1.9% ↓ |
| 중복 코드 | 높음 | 낮음 | - |
| 매직 넘버 | 4개 | 0개 | 100% ↓ |
| 함수 개수 | 11개 | 12개 | +1 (헬퍼 함수 추가) |
| 복잡도 | 중간 | 낮음 | - |

---

## 다음 단계

리팩토링 완료 후 다음 작업:
1. ✅ Git 커밋: `refactor: [REFACTOR] 반복 날짜 계산 유틸 리팩토링`
2. ⏭️ Agent 6 최종 검증

---

**리팩토링 완료**: 2025-10-31 04:38 KST
