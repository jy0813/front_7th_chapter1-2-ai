# 02. 테스트 설계: 반복 일정 기능

**문서 버전**: 1.0.0
**작성일**: 2025-10-31
**작성자**: Agent 2 (Test Design Agent)
**참조 명세**: specs/09-recurring-events.md

---

## 📋 목차

1. [명세 품질 검증 결과](#명세-품질-검증-결과)
2. [테스트 구조 설계](#테스트-구조-설계)
3. [테스트 케이스 목록](#테스트-케이스-목록)
4. [테스트 데이터 Fixtures](#테스트-데이터-fixtures)
5. [우선순위 및 실행 순서](#우선순위-및-실행-순서)
6. [다음 단계](#다음-단계)

---

## 명세 품질 검증 결과

### ✅ 검증 통과 (5/5)

#### 1. ✅ **패턴 준수** - Given-When-Then 패턴 적용
- **근거 (사실)**: 모든 시나리오(생성 종료 조건, 매일/주간/월간/연간 반복, 특수 케이스)가 Given-When-Then 형식으로 작성됨
- **근거 (평가)**: 패턴 일관성이 매우 높음 (100%)
- **근거 (대안)**: 피드백 불필요

#### 2. ✅ **예시 충분성** - 구체적 입력/출력 예시 포함
- **근거 (사실)**: 모든 시나리오에 구체적인 입력값(날짜, 시간, 반복 설정) + 출력값(생성된 일정 목록, JSON 예시) 포함
- **근거 (평가)**: 예시가 매우 구체적이고 상세함 (예: 31일 매월 반복 시나리오에 7개 일정 날짜 명시)
- **근거 (대안)**: 피드백 불필요

#### 3. ✅ **완전성** - 엣지 케이스 및 예외 상황 정의
- **근거 (사실)**:
  - 31일 매월 반복 (31일 없는 달 건너뜀)
  - 30일 매월 반복 (2월 건너뜀)
  - 29일 매월 반복 (평년 2월 건너뜀)
  - 윤년 2월 29일 매년 반복 (평년 건너뜀)
  - 2년 제한 로직
- **근거 (평가)**: 엣지 케이스 커버리지 우수 (특수 케이스 처리 섹션 전체 할애)
- **근거 (대안)**: 피드백 불필요

#### 4. ✅ **테스트 변환 가능성** - 즉시 테스트 작성 가능
- **근거 (사실)**: 각 시나리오마다 입력값, 알고리즘, 출력값, 검증 기준 모두 명시
- **근거 (평가)**: 테스트 케이스로 즉시 변환 가능 (명세 971-1218줄에 테스트 시나리오 템플릿 제공)
- **근거 (대안)**: 피드백 불필요

#### 5. ✅ **명확성** - 모호한 표현 없음
- **근거 (사실)**: "31일이 있는 달에만", "윤년에만", "2년 제한" 등 정량적 표현 사용
- **근거 (평가)**: 모든 조건이 명확하고 정량적
- **근거 (대안)**: 피드백 불필요

### 결론

**명세 품질이 우수하여 즉시 테스트 설계 진행 가능**

---

## 테스트 구조 설계

### 테스트 파일 계층 구조

```
src/__tests__/
├── __fixtures__/                        # 테스트 데이터
│   └── mockRecurringEvents.ts          # ✅ 생성 완료
├── unit/                                # 단위 테스트
│   ├── easy.repeatUtils.spec.ts        # 🆕 반복 일정 생성 로직 (핵심)
│   └── easy.isValidDayInMonth.spec.ts  # 🆕 월별 일수 검증 로직
└── medium.integration.spec.tsx          # 통합 테스트 (기존 파일 확장)
```

### 테스트 범위

| 테스트 유형 | 파일명 | 테스트 대상 | 우선순위 |
|------------|--------|------------|----------|
| 단위 테스트 | `easy.repeatUtils.spec.ts` | 반복 일정 생성 함수 | ⭐⭐⭐ 최우선 |
| 단위 테스트 | `easy.isValidDayInMonth.spec.ts` | 월별 일수 검증 함수 | ⭐⭐ 높음 |
| 통합 테스트 | `medium.integration.spec.tsx` | UI + 유틸 통합 | ⭐ 중간 (선택) |

---

## 테스트 케이스 목록

### 파일 1: `easy.repeatUtils.spec.ts` (핵심)

#### describe: `generateDailyEvents`

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| 매일 반복 일정을 시작일부터 종료일까지 생성한다 | date='2025-01-01', interval=1, endDate='2025-01-07' | generateDailyEvents 호출 | 7개 일정 생성 (2025-01-01 ~ 2025-01-07) |
| 격일 반복 일정을 interval에 따라 생성한다 | interval=2, endDate='2025-01-07' | generateDailyEvents 호출 | 4개 일정 생성 (1, 3, 5, 7일) |
| endDate가 없으면 2년 제한으로 일정을 생성한다 | endDate=undefined, date='2025-01-01' | generateDailyEvents 호출 | 2027-01-01까지 일정 생성 (정확히 2년) |
| endDate가 2년을 초과하면 2년 제한을 적용한다 | endDate='2030-12-31' (5년 후) | generateDailyEvents 호출 | 2027-01-01까지만 생성 (2년 제한) |

#### describe: `generateWeeklyEvents`

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| 매주 같은 요일에 반복 일정을 생성한다 | date='2025-01-06' (월요일), interval=1, endDate='2025-01-27' | generateWeeklyEvents 호출 | 4개 일정 생성 (매주 월요일) |
| 격주 반복 일정을 interval에 따라 생성한다 | interval=2, endDate='2025-02-03' | generateWeeklyEvents 호출 | 3개 일정 생성 (2주마다) |

#### describe: `generateMonthlyEvents` (⭐ 특수 케이스 우선)

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| **31일 매월 반복 시 31일이 있는 달에만 일정을 생성한다** | date='2025-01-31', endDate='2025-12-31' | generateMonthlyEvents 호출 | **7개 일정 생성 (1, 3, 5, 7, 8, 10, 12월만)** |
| **30일 매월 반복 시 2월을 제외하고 일정을 생성한다** | date='2025-01-30', endDate='2025-12-30' | generateMonthlyEvents 호출 | **11개 일정 생성 (2월 제외)** |
| **29일 매월 반복 시 평년 2월을 건너뛴다** | date='2025-01-29' (평년) | generateMonthlyEvents 호출 | **11개 일정 생성 (2월 제외)** |
| **29일 매월 반복 시 윤년 2월을 포함한다** | date='2024-01-29' (윤년) | generateMonthlyEvents 호출 | **12개 일정 생성 (2월 포함)** |
| 15일 매월 반복 시 모든 달에 일정을 생성한다 | date='2025-01-15', endDate='2025-04-15' | generateMonthlyEvents 호출 | 4개 일정 생성 (매월 15일) |

#### describe: `generateYearlyEvents`

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| 매년 같은 월/일에 반복 일정을 생성한다 | date='2025-06-15', endDate=undefined | generateYearlyEvents 호출 | 2개 일정 생성 (2025-06-15, 2026-06-15) |
| **2월 29일 매년 반복 시 윤년에만 일정을 생성한다** | date='2024-02-29' (윤년) | generateYearlyEvents 호출 | **1개 일정만 생성 (2024-02-29만, 2025년 평년 제외)** |

---

### 파일 2: `easy.isValidDayInMonth.spec.ts`

#### describe: `isValidDayInMonth`

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| 31일은 31일이 있는 달에만 유효하다 | year=2025, day=31, month=0~11 | isValidDayInMonth 호출 | 1, 3, 5, 7, 8, 10, 12월만 true |
| 30일은 30일 이상 있는 달에만 유효하다 | year=2025, day=30, month=0~11 | isValidDayInMonth 호출 | 2월만 false, 나머지 true |
| 29일은 윤년 2월에 유효하다 | year=2024, month=1, day=29 (윤년) | isValidDayInMonth 호출 | true |
| 29일은 평년 2월에 유효하지 않다 | year=2025, month=1, day=29 (평년) | isValidDayInMonth 호출 | false |

#### describe: `isLeapYear`

| 테스트 케이스 | Given | When | Then |
|-------------|-------|------|------|
| 4로 나누어떨어지고 100으로 나누어떨어지지 않으면 윤년이다 | year=2024 | isLeapYear 호출 | true |
| 100으로 나누어떨어지면 윤년이 아니다 | year=2100 | isLeapYear 호출 | false |
| 400으로 나누어떨어지면 윤년이다 | year=2000 | isLeapYear 호출 | true |
| 4로 나누어떨어지지 않으면 윤년이 아니다 | year=2025 | isLeapYear 호출 | false |

---

## 테스트 데이터 Fixtures

### 파일: `src/__tests__/__fixtures__/mockRecurringEvents.ts` ✅ 생성 완료

#### 제공되는 Mock 데이터

| 변수명 | 설명 | 반복 유형 | 특징 |
|--------|------|----------|------|
| `mockDailyEvent` | 매일 반복 (7일간) | daily, interval=1 | 기본 케이스 |
| `mockAlternateDayEvent` | 격일 반복 | daily, interval=2 | interval 테스트 |
| `mockWeeklyEvent` | 매주 반복 (월요일) | weekly, interval=1 | 기본 케이스 |
| `mockBiweeklyEvent` | 격주 반복 | weekly, interval=2 | interval 테스트 |
| **`mockMonthly31Event`** | **31일 매월 반복** | monthly, interval=1 | **⭐ 특수 케이스** |
| **`mockMonthly30Event`** | **30일 매월 반복** | monthly, interval=1 | **⭐ 특수 케이스** |
| **`mockMonthly29EventCommonYear`** | **29일 매월 반복 (평년)** | monthly, interval=1 | **⭐ 특수 케이스** |
| **`mockMonthly29EventLeapYear`** | **29일 매월 반복 (윤년)** | monthly, interval=1 | **⭐ 특수 케이스** |
| `mockMonthly15Event` | 15일 매월 반복 | monthly, interval=1 | 일반 케이스 |
| `mockYearlyEvent` | 매년 반복 | yearly, interval=1 | 기본 케이스 |
| **`mockYearlyLeapDayEvent`** | **윤년 2월 29일 매년 반복** | yearly, interval=1 | **⭐ 특수 케이스** |
| `mockEventWithoutEndDate` | endDate 없음 (2년 제한) | daily, interval=1 | 2년 제한 테스트 |
| `mockEventWithLongEndDate` | endDate 5년 후 (2년 제한) | monthly, interval=1 | 2년 제한 테스트 |

#### 사용 예시

```typescript
import { mockMonthly31Event, mockYearlyLeapDayEvent } from '../__fixtures__/mockRecurringEvents';

it('31일 매월 반복 시 31일이 있는 달에만 일정을 생성한다', () => {
  // Given
  const events = generateMonthlyEvents(mockMonthly31Event);

  // Then
  expect(events).toHaveLength(7); // 1, 3, 5, 7, 8, 10, 12월만
});
```

---

## 우선순위 및 실행 순서

### Phase 1: 핵심 로직 (필수)

1. **`easy.isValidDayInMonth.spec.ts`** - 월별 일수 검증 함수
   - 테스트 순서: `isLeapYear` → `isValidDayInMonth`
   - 이유: `generateMonthlyEvents`가 `isValidDayInMonth`에 의존

2. **`easy.repeatUtils.spec.ts`** - 반복 일정 생성 함수
   - 테스트 순서 (우선순위 높은 순):
     1. ⭐⭐⭐ `generateMonthlyEvents` (특수 케이스 31일, 30일, 29일)
     2. ⭐⭐ `generateYearlyEvents` (윤년 2월 29일)
     3. ⭐ `generateDailyEvents` (2년 제한)
     4. ⭐ `generateWeeklyEvents` (기본)

### Phase 2: 통합 테스트 (선택)

- **`medium.integration.spec.tsx`** - UI + 유틸 통합
  - 반복 일정 생성 E2E 시나리오
  - 특수 케이스 UI 검증

---

## 다음 단계

### Agent 3 (Red Phase Agent) 작업 범위

1. **파일 생성**:
   - `src/__tests__/unit/easy.repeatUtils.spec.ts`
   - `src/__tests__/unit/easy.isValidDayInMonth.spec.ts`

2. **테스트 코드 작성 순서**:
   ```
   Step 1: easy.isValidDayInMonth.spec.ts
     → isLeapYear 테스트 4개
     → isValidDayInMonth 테스트 4개

   Step 2: easy.repeatUtils.spec.ts
     → generateMonthlyEvents 테스트 5개 (특수 케이스 우선)
     → generateYearlyEvents 테스트 2개
     → generateDailyEvents 테스트 4개
     → generateWeeklyEvents 테스트 2개
   ```

3. **테스트 규칙 준수**:
   - ✅ Testing Library 쿼리 우선순위 (해당 없음, 유틸 함수 테스트)
   - ✅ TDD Red Phase 원칙 (테스트 먼저, 구현 나중)
   - ✅ Given-When-Then 패턴
   - ✅ 구체적 테스트 명세 (한글)

4. **참조 문서**:
   - `specs/09-recurring-events.md` (명세)
   - `claudedocs/02-test-design-recurring-events.md` (현재 문서)
   - `src/__tests__/__fixtures__/mockRecurringEvents.ts` (테스트 데이터)
   - `rules/tdd-principles.md` (TDD 원칙)

### 예상 산출물

- ✅ 실패하는 테스트 파일 2개 (총 17개 테스트 케이스)
- ✅ 테스트 실행 로그 (모든 테스트 실패 확인)
- ✅ Git 커밋: `test: [RED]: 반복 일정 생성 로직 테스트 작성`

---

**작성 완료**: 2025-10-31
**다음 Agent**: Agent 3 (Red Phase Agent)
**참조**: Agent 4, 5가 구현 및 리팩토링 시 활용
