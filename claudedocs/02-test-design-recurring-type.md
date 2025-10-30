# 테스트 구조 설계: 반복 유형 선택 기능

**Agent 2: Test Design Agent**
**생성일**: 2025-10-31
**명세 문서**: specs/09-recurring-type-selection.md
**테스트 파일**: src/__tests__/unit/easy.repeatUtils.spec.ts

---

## 📋 명세 품질 검증 결과

### 검증 체크리스트 (5/5 통과)

#### 1. ✅ Given-When-Then 패턴 준수
- **근거 (사실)**: 모든 비즈니스 로직 시나리오(시나리오 1-4)와 엣지 케이스 시나리오가 G-W-T 형식으로 작성됨
- **근거 (평가)**: 패턴이 일관되게 적용됨
- **근거 (대안)**: 없음

#### 2. ✅ 구체적 예시 포함
- **근거 (사실)**: 각 시나리오마다 입력/출력 JSON 예시 포함 (769-1068 라인)
- **근거 (평가)**: 모든 반복 유형(daily, weekly, monthly, yearly)에 대한 구체적 데이터 존재
- **근거 (대안)**: 없음

#### 3. ✅ 엣지 케이스 명시
- **근거 (사실)**: 31일 + 매월 반복 (278-348 라인), 윤년 2/29 + 매년 반복 (353-405 라인) 명시
- **근거 (평가)**: 특수 케이스 처리 로직이 구체적으로 정의됨
- **근거 (대안)**: 없음

#### 4. ✅ 테스트 가능 수준
- **근거 (사실)**: 각 시나리오를 읽고 즉시 테스트 케이스로 변환 가능
- **근거 (평가)**: 입력 데이터, 기대 출력, 검증 조건이 명확함
- **근거 (대안)**: 없음

#### 5. ✅ 명세 범위 준수
- **근거 (사실)**: 반복 유형 선택 UI 및 반복 날짜 계산 로직에 집중
- **근거 (평가)**: 명세 범위가 명확하고 일관적
- **근거 (대안)**: 없음

### 최종 판단

✅ **명세 품질 우수 - 즉시 테스트 설계 가능**

Agent 3이 이 명세만 보고 즉시 테스트 코드 작성 가능합니다.

---

## 🎯 테스트 전략

### 테스트 파일 위치
- **파일명**: `src/__tests__/unit/easy.repeatUtils.spec.ts`
- **이유**: 반복 날짜 계산은 순수 유틸 함수로 구현

### Fixtures 전략
- **전략**: fixtures 생성하지 않음 (인라인 데이터 사용)
- **이유**:
  - 반복 날짜 데이터는 복잡하지만 함수 내에서 생성 가능
  - 테스트 케이스마다 입력값이 다양하여 재사용성 낮음
  - 인라인 데이터가 테스트 가독성에 더 유리

### 테스트 범위
- ✅ 매일 반복 날짜 생성 (daily)
- ✅ 매주 반복 날짜 생성 (weekly)
- ✅ 매월 반복 날짜 생성 (monthly)
- ✅ 매년 반복 날짜 생성 (yearly)
- ✅ 31일 + 매월 반복 엣지 케이스
- ✅ 윤년 2/29 + 매년 반복 엣지 케이스

---

## 📝 테스트 구조 설계

### 테스트 파일 구조

```typescript
// src/__tests__/unit/easy.repeatUtils.spec.ts
import { describe, it, expect } from 'vitest';
import {
  generateDailyDates,
  generateWeeklyDates,
  generateMonthlyDates,
  generateYearlyDates
} from '../../utils/repeatUtils';

describe('반복 날짜 생성 유틸리티', () => {
  describe('generateDailyDates >', () => {
    // 매일 반복 테스트
  });

  describe('generateWeeklyDates >', () => {
    // 매주 반복 테스트
  });

  describe('generateMonthlyDates >', () => {
    // 매월 반복 테스트
    // 엣지 케이스: 31일 케이스 포함
  });

  describe('generateYearlyDates >', () => {
    // 매년 반복 테스트
    // 엣지 케이스: 윤년 케이스 포함
  });
});
```

---

## 🧪 테스트 케이스 상세 설계

### 1. generateDailyDates (매일 반복)

#### 테스트 케이스 1-1: 기본 매일 반복
```typescript
describe('generateDailyDates >', () => {
  it('시작일부터 365일치 매일 반복 날짜를 생성한다', () => {
    // Given: 시작 날짜
    const startDate = '2025-11-01';

    // When: 매일 반복 날짜 생성
    const dates = generateDailyDates(startDate);

    // Then: 365개 날짜 생성됨
    expect(dates).toHaveLength(365);

    // Then: 첫 번째 날짜는 시작일
    expect(dates[0]).toBe('2025-11-01');

    // Then: 마지막 날짜는 365일 후
    expect(dates[364]).toBe('2026-10-31');

    // Then: 각 날짜는 하루씩 증가
    expect(dates[1]).toBe('2025-11-02');
    expect(dates[2]).toBe('2025-11-03');
  });
});
```

**검증 항목**:
- ✅ 정확히 365개 날짜 생성
- ✅ 첫 날짜 = 시작일
- ✅ 마지막 날짜 = 시작일 + 364일
- ✅ 연속된 날짜 간격 = 1일

---

### 2. generateWeeklyDates (매주 반복)

#### 테스트 케이스 2-1: 기본 매주 반복
```typescript
describe('generateWeeklyDates >', () => {
  it('시작일부터 52주치 매주 반복 날짜를 생성한다', () => {
    // Given: 시작 날짜 (2025-11-03, 월요일)
    const startDate = '2025-11-03';

    // When: 매주 반복 날짜 생성
    const dates = generateWeeklyDates(startDate);

    // Then: 52개 날짜 생성됨
    expect(dates).toHaveLength(52);

    // Then: 첫 번째 날짜는 시작일
    expect(dates[0]).toBe('2025-11-03');

    // Then: 두 번째 날짜는 7일 후 (같은 요일)
    expect(dates[1]).toBe('2025-11-10');

    // Then: 마지막 날짜는 52주 후
    expect(dates[51]).toBe('2026-10-26');
  });

  it('모든 날짜가 같은 요일이다', () => {
    // Given: 시작 날짜 (금요일)
    const startDate = '2025-01-31';

    // When: 매주 반복 날짜 생성
    const dates = generateWeeklyDates(startDate);

    // Then: 모든 날짜가 금요일
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.getDay()).toBe(5); // 5 = 금요일
    });
  });
});
```

**검증 항목**:
- ✅ 정확히 52개 날짜 생성
- ✅ 각 날짜 간격 = 7일
- ✅ 모든 날짜가 같은 요일
- ✅ 마지막 날짜 = 시작일 + 51주

---

### 3. generateMonthlyDates (매월 반복)

#### 테스트 케이스 3-1: 기본 매월 반복
```typescript
describe('generateMonthlyDates >', () => {
  it('시작일부터 12개월치 매월 반복 날짜를 생성한다', () => {
    // Given: 시작 날짜 (1일)
    const startDate = '2025-01-01';

    // When: 매월 반복 날짜 생성
    const dates = generateMonthlyDates(startDate);

    // Then: 12개 날짜 생성됨
    expect(dates).toHaveLength(12);

    // Then: 첫 번째 날짜는 시작일
    expect(dates[0]).toBe('2025-01-01');

    // Then: 각 날짜는 같은 날짜(일)를 유지
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.getDate()).toBe(1); // 매월 1일
    });

    // Then: 마지막 날짜는 12개월 후
    expect(dates[11]).toBe('2026-01-01');
  });

  it('매월 15일 반복 시 모든 달에 생성된다', () => {
    // Given: 시작 날짜 (15일)
    const startDate = '2025-01-15';

    // When: 매월 반복 날짜 생성
    const dates = generateMonthlyDates(startDate);

    // Then: 12개 날짜 생성됨 (모든 달에 15일 있음)
    expect(dates).toHaveLength(12);

    // Then: 모든 날짜가 15일
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.getDate()).toBe(15);
    });
  });
});
```

#### 테스트 케이스 3-2: 31일 엣지 케이스 ⭐
```typescript
describe('generateMonthlyDates > 엣지 케이스', () => {
  it('31일에 생성 시 31일이 없는 달은 건너뛴다', () => {
    // Given: 시작 날짜 (1월 31일)
    const startDate = '2025-01-31';

    // When: 매월 반복 날짜 생성
    const dates = generateMonthlyDates(startDate);

    // Then: 7개 날짜만 생성됨 (31일이 있는 달만)
    expect(dates).toHaveLength(7);

    // Then: 생성된 날짜 검증
    expect(dates).toEqual([
      '2025-01-31', // 1월 ✅
      '2025-03-31', // 3월 ✅
      '2025-05-31', // 5월 ✅
      '2025-07-31', // 7월 ✅
      '2025-08-31', // 8월 ✅
      '2025-10-31', // 10월 ✅
      '2025-12-31', // 12월 ✅
    ]);

    // Then: 건너뛴 달 확인 (2, 4, 6, 9, 11월)
    const months = dates.map(d => new Date(d).getMonth() + 1);
    expect(months).not.toContain(2);  // 2월 없음
    expect(months).not.toContain(4);  // 4월 없음
    expect(months).not.toContain(6);  // 6월 없음
    expect(months).not.toContain(9);  // 9월 없음
    expect(months).not.toContain(11); // 11월 없음
  });

  it('30일에 생성 시 2월만 건너뛴다', () => {
    // Given: 시작 날짜 (1월 30일)
    const startDate = '2025-01-30';

    // When: 매월 반복 날짜 생성
    const dates = generateMonthlyDates(startDate);

    // Then: 11개 날짜 생성됨 (2월만 제외)
    expect(dates).toHaveLength(11);

    // Then: 모든 날짜가 30일
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.getDate()).toBe(30);
    });

    // Then: 2월이 포함되지 않음
    const months = dates.map(d => new Date(d).getMonth() + 1);
    expect(months).not.toContain(2);
  });
});
```

**검증 항목 (31일 케이스)**:
- ✅ 31일이 있는 달만 포함 (7개월)
- ✅ 2, 4, 6, 9, 11월 건너뜀
- ✅ 1, 3, 5, 7, 8, 10, 12월만 포함
- ✅ 각 날짜의 일(day)이 31일

---

### 4. generateYearlyDates (매년 반복)

#### 테스트 케이스 4-1: 기본 매년 반복
```typescript
describe('generateYearlyDates >', () => {
  it('시작일부터 1년치(1개) 매년 반복 날짜를 생성한다', () => {
    // Given: 시작 날짜
    const startDate = '2025-06-15';

    // When: 매년 반복 날짜 생성
    const dates = generateYearlyDates(startDate);

    // Then: 1개 날짜만 생성됨 (1년치 = 1개)
    expect(dates).toHaveLength(1);

    // Then: 날짜는 시작일
    expect(dates[0]).toBe('2025-06-15');
  });
});
```

#### 테스트 케이스 4-2: 윤년 2/29 엣지 케이스 ⭐
```typescript
describe('generateYearlyDates > 엣지 케이스', () => {
  it('윤년 2/29에 생성 시 1개만 생성된다 (다음 해는 평년)', () => {
    // Given: 시작 날짜 (2024년 2월 29일, 윤년)
    const startDate = '2024-02-29';

    // When: 매년 반복 날짜 생성
    const dates = generateYearlyDates(startDate);

    // Then: 1개 날짜만 생성됨
    expect(dates).toHaveLength(1);

    // Then: 날짜는 2024-02-29
    expect(dates[0]).toBe('2024-02-29');

    // Then: 2025-02-29는 생성되지 않음 (평년, 2/28까지만)
    expect(dates).not.toContain('2025-02-29');
  });

  it('평년 2/28에 생성 시 정상적으로 생성된다', () => {
    // Given: 시작 날짜 (2월 28일)
    const startDate = '2025-02-28';

    // When: 매년 반복 날짜 생성
    const dates = generateYearlyDates(startDate);

    // Then: 1개 날짜 생성됨
    expect(dates).toHaveLength(1);

    // Then: 날짜는 2025-02-28
    expect(dates[0]).toBe('2025-02-28');
  });
});
```

**검증 항목 (윤년 케이스)**:
- ✅ 2024-02-29 (윤년) → 1개만 생성
- ✅ 2025-02-29 (평년) → 건너뜀
- ✅ 평년 2/28은 정상 생성

---

## 🔧 유틸 함수 설계

명세에서 제시한 유틸 함수 구조:

```typescript
/**
 * 유효한 날짜인지 확인
 * @param year - 년도
 * @param month - 월 (1-12)
 * @param day - 일 (1-31)
 * @returns 유효한 날짜 여부
 */
function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * 윤년 여부 확인
 * @param year - 년도
 * @returns 윤년 여부
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

---

## 📊 테스트 데이터 전략

### 인라인 데이터 사용 이유

1. **가독성**: 각 테스트 케이스에서 입력값과 기대값을 직접 확인 가능
2. **유지보수**: 테스트별로 데이터가 다르므로 fixtures 재사용성 낮음
3. **명세 일치**: 명세에 제공된 예시를 테스트에 직접 반영

### 테스트 데이터 예시

```typescript
// ✅ 인라인 데이터 (권장)
it('31일에 생성 시 7개월만 생성된다', () => {
  const startDate = '2025-01-31';
  const dates = generateMonthlyDates(startDate);

  expect(dates).toEqual([
    '2025-01-31',
    '2025-03-31',
    '2025-05-31',
    '2025-07-31',
    '2025-08-31',
    '2025-10-31',
    '2025-12-31',
  ]);
});

// ❌ Fixtures 사용 (불필요)
// 각 테스트마다 다른 데이터가 필요하므로 재사용성이 낮음
```

---

## ✅ 체크리스트

### 테스트 설계 완료 항목
- [x] 명세 품질 검증 (5/5 통과)
- [x] 테스트 파일 구조 정의
- [x] Given-When-Then 패턴 적용
- [x] 매일 반복 테스트 케이스 설계
- [x] 매주 반복 테스트 케이스 설계
- [x] 매월 반복 테스트 케이스 설계 (31일 케이스 포함)
- [x] 매년 반복 테스트 케이스 설계 (윤년 케이스 포함)
- [x] 엣지 케이스 테스트 설계
- [x] 인라인 데이터 전략 결정

### Agent 3에게 전달 사항
- ✅ 테스트 파일: `src/__tests__/unit/easy.repeatUtils.spec.ts` 생성
- ✅ 위 테스트 케이스 구조를 참고하여 실제 테스트 코드 작성
- ✅ 기존 테스트 스타일 (`easy.timeValidation.spec.ts`) 참고
- ✅ TDD Red Phase: 테스트 실행 → 실패 확인

---

## 🔄 다음 단계

**Agent 3 (Red Phase Agent)**: 이 문서를 참고하여 실제 테스트 코드 작성 및 실패 확인

**Git 커밋**: `test: [DESIGN] 반복 유형 선택 테스트 구조 설계`
