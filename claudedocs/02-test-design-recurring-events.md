# 02. 반복 일정 기능 테스트 설계

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-30
**작성자**: Agent 2 (Test Design Agent)
**참조 명세**: specs/09-recurring-events.md

---

## 📋 목차

1. [명세 품질 검증 결과](#명세-품질-검증-결과)
2. [테스트 계층 구조](#테스트-계층-구조)
3. [테스트 케이스 설계](#테스트-케이스-설계)
4. [테스트 데이터 설계](#테스트-데이터-설계)
5. [다음 단계](#다음-단계)

---

## 명세 품질 검증 결과

### 검증 항목별 평가 (3단계 근거)

#### 1. ✅ Given-When-Then 패턴 준수
- **근거 (사실)**: BL-002~BL-005 모든 비즈니스 로직 섹션에 G-W-T 형식 적용됨
- **근거 (평가)**: 일관되게 적용되어 테스트 변환이 용이함
- **근거 (대안)**: 피드백 불필요

#### 2. ✅ 구체적 예시 포함
- **근거 (사실)**: 모든 시나리오에 입력값(startDate, interval, endDate)과 출력값(배열) JSON 예시 포함
- **근거 (평가)**: Agent 3이 즉시 테스트 데이터로 사용 가능한 수준
- **근거 (대안)**: 피드백 불필요

#### 3. ✅ 엣지 케이스 명시
- **근거 (사실)**: SC-001 (매월 31일), SC-002 (윤년 2월 29일), SC-003 (매월 30일) 특수 케이스 섹션 존재
- **근거 (평가)**: 주요 엣지 케이스가 구체적으로 명시되어 있음
- **근거 (대안)**: 피드백 불필요

#### 4. ✅ 테스트 가능 여부
- **근거 (사실)**: 모든 시나리오를 읽고 즉시 테스트 케이스로 변환 가능 (G-W-T + 입출력 예시 완비)
- **근거 (평가)**: 테스트 변환 가능성 100%
- **근거 (대안)**: 피드백 불필요

#### 5. ✅ 명세 범위 준수
- **근거 (사실)**: 명세에 명확한 기능 범위 정의 (포함/제외 기능 명시)
- **근거 (평가)**: 범위가 명확하며 TDD 개발에 적합
- **근거 (대안)**: 피드백 불필요

### 검증 결과

**전체 통과 (5/5)**
- ✅ 모든 체크리스트 항목 통과
- ✅ 각 시나리오를 읽고 즉시 테스트 케이스로 변환 가능
- ✅ Agent 3이 추가 질문 없이 테스트 코드 작성 가능한 수준

**Agent 1에 대한 피드백**: 없음 (명세 품질 우수)

---

## 테스트 계층 구조

### 계층 구조 결정

반복 일정 기능은 다음 3개 계층으로 테스트합니다:

```
반복 일정 기능
├─ 단위 테스트 (Unit Tests)
│   └─ 반복 날짜 생성 로직 (repeatUtils.ts)
├─ 훅 테스트 (Hook Tests)
│   └─ API 호출 로직 (useEventOperations.ts)
└─ 통합 테스트 (Integration Tests)
    └─ 사용자 시나리오 (App.tsx)
```

### 계층별 역할

#### 1. 단위 테스트 (Unit Tests)
**파일**: `src/__tests__/unit/easy.repeatUtils.spec.ts`

**테스트 대상**: 순수 함수 (repeatUtils.ts)

**역할**:
- 반복 날짜 생성 로직 검증
- 특수 케이스 처리 (31일, 2월 29일)
- 엣지 케이스 검증

**우선순위**: 최고 (핵심 비즈니스 로직)

---

#### 2. 훅 테스트 (Hook Tests)
**파일**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (기존 파일에 추가)

**테스트 대상**: 커스텀 훅 (useEventOperations.ts)

**역할**:
- POST /api/events-list API 호출 검증
- 서버 응답 처리 검증
- 에러 핸들링 검증

**우선순위**: 중간

---

#### 3. 통합 테스트 (Integration Tests)
**파일**: `src/__tests__/medium.integration.spec.tsx` (기존 파일에 추가)

**테스트 대상**: 사용자 시나리오 (App.tsx)

**역할**:
- 반복 일정 UI 표시/숨김
- 반복 유형 선택
- 반복 일정 생성 플로우
- 캘린더 뷰에 반복 일정 표시

**우선순위**: 중간

---

## 테스트 케이스 설계

### 1. 단위 테스트: repeatUtils.spec.ts

#### describe: generateRecurringDates

반복 날짜 생성 메인 함수를 테스트합니다.

**테스트 케이스**:

```typescript
describe('generateRecurringDates', () => {
  describe('매일 반복 (daily)', () => {
    it('매일 반복 일정을 시작일부터 종료일까지 생성한다', () => {
      // Given: startDate = "2025-01-06", repeatType = "daily", interval = 1, endDate = "2025-01-10"
      // When: generateRecurringDates 호출
      // Then: 5개의 날짜 반환 (2025-01-06, 01-07, 01-08, 01-09, 01-10)
    });

    it('간격이 2일 때 하루 건너뛰며 일정을 생성한다 (격일)', () => {
      // Given: interval = 2
      // When: generateRecurringDates 호출
      // Then: 격일로 날짜 생성 (2025-01-06, 01-08, 01-10, 01-12)
    });

    it('종료일이 없을 때 기본 종료일(1년 후)까지 생성한다', () => {
      // Given: endDate = undefined
      // When: generateRecurringDates 호출
      // Then: 1년 후까지 365개의 날짜 생성
    });
  });

  describe('매주 반복 (weekly)', () => {
    it('매주 같은 요일에 일정을 생성한다', () => {
      // Given: startDate = "2025-01-06" (월요일), repeatType = "weekly", interval = 1
      // When: generateRecurringDates 호출
      // Then: 매주 월요일 (2025-01-06, 01-13, 01-20, 01-27)
    });

    it('간격이 2주일 때 격주로 일정을 생성한다', () => {
      // Given: interval = 2
      // When: generateRecurringDates 호출
      // Then: 격주 월요일 (2025-01-06, 01-20, 02-03)
    });
  });

  describe('매월 반복 (monthly)', () => {
    it('매월 같은 날짜에 일정을 생성한다', () => {
      // Given: startDate = "2025-01-15", repeatType = "monthly", interval = 1
      // When: generateRecurringDates 호출
      // Then: 매월 15일 (2025-01-15, 02-15, 03-15, 04-15)
    });

    it('31일 매월 반복은 31일이 있는 달에만 생성한다', () => {
      // Given: startDate = "2025-01-31"
      // When: generateRecurringDates 호출
      // Then: 31일이 있는 달만 (2025-01-31, 03-31, 05-31) - 2월, 4월 건너뜀
    });

    it('30일 매월 반복은 2월만 건너뛴다', () => {
      // Given: startDate = "2025-01-30"
      // When: generateRecurringDates 호출
      // Then: 2월 제외한 모든 달 (2025-01-30, 03-30, 04-30, ...)
    });

    it('간격이 3개월일 때 분기별로 일정을 생성한다', () => {
      // Given: interval = 3
      // When: generateRecurringDates 호출
      // Then: 3개월마다 (2025-01-15, 04-15, 07-15, 10-15)
    });
  });

  describe('매년 반복 (yearly)', () => {
    it('매년 같은 날짜에 일정을 생성한다', () => {
      // Given: startDate = "2025-06-15", repeatType = "yearly", interval = 1
      // When: generateRecurringDates 호출
      // Then: 매년 6월 15일 (2025-06-15, 2026-06-15, 2027-06-15, 2028-06-15)
    });

    it('2월 29일 매년 반복은 윤년에만 생성한다', () => {
      // Given: startDate = "2024-02-29" (윤년)
      // When: generateRecurringDates 호출
      // Then: 윤년만 (2024-02-29, 2028-02-29) - 2025, 2026, 2027 건너뜀
    });

    it('종료일이 없을 때 기본 종료일(10년 후)까지 생성한다', () => {
      // Given: endDate = undefined
      // When: generateRecurringDates 호출
      // Then: 10년 후까지 10개의 날짜 생성
    });
  });

  describe('엣지 케이스', () => {
    it('시작일과 종료일이 같을 때 1개의 날짜만 반환한다', () => {
      // Given: startDate = "2025-01-06", endDate = "2025-01-06"
      // When: generateRecurringDates 호출
      // Then: 1개의 날짜 반환 (2025-01-06)
    });

    it('종료일이 시작일보다 이전일 때 빈 배열을 반환한다', () => {
      // Given: startDate = "2025-01-06", endDate = "2025-01-05"
      // When: generateRecurringDates 호출
      // Then: 빈 배열 반환
    });

    it('간격이 0 이하일 때 에러를 throw한다', () => {
      // Given: interval = 0
      // When: generateRecurringDates 호출
      // Then: Error throw ("반복 간격은 1 이상이어야 합니다.")
    });
  });
});
```

---

#### 헬퍼 함수 테스트

```typescript
describe('isLeapYear', () => {
  it('윤년을 올바르게 판별한다', () => {
    // Given: 2024년 (4로 나누어떨어지고, 100으로 나누어떨어지지 않음)
    // When: isLeapYear(2024) 호출
    // Then: true 반환
  });

  it('평년을 올바르게 판별한다', () => {
    // Given: 2025년 (4로 나누어떨어지지 않음)
    // When: isLeapYear(2025) 호출
    // Then: false 반환
  });

  it('100으로 나누어떨어지지만 400으로 나누어떨어지는 윤년을 판별한다', () => {
    // Given: 2000년 (400으로 나누어떨어짐)
    // When: isLeapYear(2000) 호출
    // Then: true 반환
  });

  it('100으로 나누어떨어지고 400으로 나누어떨어지지 않는 평년을 판별한다', () => {
    // Given: 1900년 (100으로 나누어떨어지지만 400으로 나누어떨어지지 않음)
    // When: isLeapYear(1900) 호출
    // Then: false 반환
  });
});

describe('isValidMonthlyDate', () => {
  it('31일이 있는 달에 31일이 유효하다고 판별한다', () => {
    // Given: year = 2025, month = 1, day = 31 (1월 31일)
    // When: isValidMonthlyDate 호출
    // Then: true 반환
  });

  it('31일이 없는 달에 31일이 유효하지 않다고 판별한다', () => {
    // Given: year = 2025, month = 2, day = 31 (2월 31일)
    // When: isValidMonthlyDate 호출
    // Then: false 반환
  });

  it('평년 2월에 29일이 유효하지 않다고 판별한다', () => {
    // Given: year = 2025, month = 2, day = 29 (평년 2월 29일)
    // When: isValidMonthlyDate 호출
    // Then: false 반환
  });

  it('윤년 2월에 29일이 유효하다고 판별한다', () => {
    // Given: year = 2024, month = 2, day = 29 (윤년 2월 29일)
    // When: isValidMonthlyDate 호출
    // Then: true 반환
  });
});
```

---

### 2. 훅 테스트: useEventOperations.spec.ts

#### describe: POST /api/events-list

```typescript
describe('POST /api/events-list (반복 일정 생성)', () => {
  it('반복 일정 생성 시 POST /api/events-list를 호출한다', async () => {
    // Given: 반복 일정 데이터 준비
    // When: saveEvent 호출
    // Then: POST /api/events-list 호출됨
  });

  it('서버 응답으로 받은 반복 일정들이 상태에 추가된다', async () => {
    // Given: MSW가 3개의 반복 일정 반환 설정
    // When: saveEvent 호출
    // Then: 3개의 일정이 상태에 추가됨
  });

  it('모든 반복 일정이 같은 repeat.id를 가진다', async () => {
    // Given: MSW가 repeat.id = "repeat-123" 설정
    // When: saveEvent 호출
    // Then: 모든 일정의 repeat.id가 "repeat-123"
  });

  it('API 호출 실패 시 에러를 throw한다', async () => {
    // Given: MSW가 500 에러 반환 설정
    // When: saveEvent 호출
    // Then: Error throw
  });
});
```

---

### 3. 통합 테스트: medium.integration.spec.tsx

#### describe: 반복 일정 UI

```typescript
describe('반복 일정 UI', () => {
  it('반복 일정 체크박스를 체크하면 반복 설정 UI가 표시된다', async () => {
    // Given: 일정 추가 폼 렌더링
    // When: "반복 일정" 체크박스 클릭
    // Then: "반복 유형", "반복 간격", "반복 종료일" 입력 필드 표시됨
  });

  it('반복 일정 체크박스를 해제하면 반복 설정 UI가 숨겨진다', async () => {
    // Given: 반복 설정 UI가 표시된 상태
    // When: "반복 일정" 체크박스 다시 클릭 (해제)
    // Then: 반복 설정 UI가 숨겨짐
  });

  it('반복 유형 드롭다운에서 "매일", "매주", "매월", "매년"을 선택할 수 있다', async () => {
    // Given: 반복 설정 UI 표시
    // When: 반복 유형 드롭다운 클릭
    // Then: "매일", "매주", "매월", "매년" 옵션 표시됨
  });

  it('반복 간격 입력 필드에 숫자를 입력할 수 있다', async () => {
    // Given: 반복 설정 UI 표시
    // When: 반복 간격 입력 필드에 "2" 입력
    // Then: 입력 필드 값이 2로 설정됨
  });

  it('반복 종료일 입력 필드에 날짜를 선택할 수 있다', async () => {
    // Given: 반복 설정 UI 표시
    // When: 반복 종료일 입력 필드에 "2025-12-31" 입력
    // Then: 입력 필드 값이 "2025-12-31"로 설정됨
  });
});
```

#### describe: 반복 일정 생성

```typescript
describe('반복 일정 생성', () => {
  it('매일 반복 일정을 생성할 수 있다', async () => {
    // Given: 사용자가 다음 정보 입력
    //   - 제목: "매일 운동"
    //   - 날짜: "2025-01-06"
    //   - 시작 시간: "06:00"
    //   - 종료 시간: "07:00"
    //   - 반복 일정: 체크
    //   - 반복 유형: "매일"
    //   - 반복 간격: 1
    //   - 반복 종료일: "2025-01-10"
    // When: "일정 추가" 버튼 클릭
    // Then:
    //   - "일정이 추가되었습니다." 알림 표시
    //   - POST /api/events-list 호출됨
    //   - 캘린더 뷰에 5개의 일정 표시 (1/6, 1/7, 1/8, 1/9, 1/10)
  });

  it('매주 반복 일정을 생성할 수 있다', async () => {
    // Given: 사용자가 매주 월요일 회의 입력
    // When: "일정 추가" 버튼 클릭
    // Then: 매주 월요일마다 일정 생성됨
  });

  it('매월 31일 반복 일정을 생성하면 31일이 없는 달은 건너뛴다', async () => {
    // Given: 사용자가 1월 31일 반복 일정 입력
    // When: "일정 추가" 버튼 클릭
    // Then: 31일이 있는 달에만 일정 표시 (1월, 3월, 5월, ...), 2월과 4월 건너뜀
  });

  it('매년 2월 29일 반복 일정을 생성하면 윤년에만 일정이 표시된다', async () => {
    // Given: 사용자가 2024년 2월 29일 반복 일정 입력
    // When: "일정 추가" 버튼 클릭
    // Then: 윤년에만 일정 표시 (2024, 2028, ...), 평년 건너뜀
  });

  it('반복 종료일이 비어있으면 기본 종료일까지 일정을 생성한다', async () => {
    // Given: 사용자가 반복 종료일을 입력하지 않음
    // When: "일정 추가" 버튼 클릭
    // Then: 기본 종료일(매일/매주: 1년, 매월: 2년, 매년: 10년)까지 생성
  });

  it('반복 일정은 일정 겹침 경고 없이 바로 생성된다', async () => {
    // Given: 기존 일정과 시간이 겹치는 반복 일정 입력
    // When: "일정 추가" 버튼 클릭
    // Then: 겹침 경고 다이얼로그 없이 일정 생성됨
  });
});
```

#### describe: 반복 일정 검증

```typescript
describe('반복 일정 검증', () => {
  it('반복 간격이 0 이하일 때 에러 메시지를 표시한다', async () => {
    // Given: 사용자가 반복 간격에 0 입력
    // When: "일정 추가" 버튼 클릭
    // Then: "반복 간격은 1 이상이어야 합니다." 에러 메시지 표시, 일정 생성 안 됨
  });

  it('반복 종료일이 시작 날짜보다 이전일 때 에러 메시지를 표시한다', async () => {
    // Given: 시작 날짜 "2025-01-06", 반복 종료일 "2025-01-05"
    // When: "일정 추가" 버튼 클릭
    // Then: "반복 종료일은 시작 날짜보다 이후여야 합니다." 에러 메시지 표시
  });
});
```

---

## 테스트 데이터 설계

### Fixtures 파일 구조

**파일 위치**: `src/__tests__/__fixtures__/mockRecurringEvents.ts`

**포함 데이터**:

```typescript
// src/__tests__/__fixtures__/mockRecurringEvents.ts

import { Event, RepeatType } from '../../types';

/**
 * 매일 반복 일정 Mock 데이터
 */
export const mockDailyEvent: Event = {
  id: 'daily-1',
  title: '매일 운동',
  date: '2025-01-06',
  startTime: '06:00',
  endTime: '07:00',
  description: '아침 운동',
  location: '헬스장',
  category: '건강',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-10',
  },
  notificationTime: 10,
};

/**
 * 매주 반복 일정 Mock 데이터
 */
export const mockWeeklyEvent: Event = {
  id: 'weekly-1',
  title: '주간 회의',
  date: '2025-01-06', // 월요일
  startTime: '09:00',
  endTime: '10:00',
  description: '팀 주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-27',
  },
  notificationTime: 10,
};

/**
 * 매월 반복 일정 Mock 데이터 (정상 케이스)
 */
export const mockMonthlyEvent: Event = {
  id: 'monthly-1',
  title: '월간 보고',
  date: '2025-01-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '월간 실적 보고',
  location: '회의실 B',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-04-15',
  },
  notificationTime: 10,
};

/**
 * 매월 31일 반복 일정 Mock 데이터 (특수 케이스)
 */
export const mockMonthly31DayEvent: Event = {
  id: 'monthly-31',
  title: '월말 보고',
  date: '2025-01-31',
  startTime: '17:00',
  endTime: '18:00',
  description: '월말 실적 보고',
  location: '본사',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-05-31',
  },
  notificationTime: 10,
};

/**
 * 매월 30일 반복 일정 Mock 데이터 (특수 케이스)
 */
export const mockMonthly30DayEvent: Event = {
  id: 'monthly-30',
  title: '월간 점검',
  date: '2025-01-30',
  startTime: '10:00',
  endTime: '11:00',
  description: '시스템 점검',
  location: 'IT실',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-12-30',
  },
  notificationTime: 10,
};

/**
 * 매년 반복 일정 Mock 데이터
 */
export const mockYearlyEvent: Event = {
  id: 'yearly-1',
  title: '생일 기념',
  date: '2025-06-15',
  startTime: '12:00',
  endTime: '13:00',
  description: '생일 축하',
  location: '집',
  category: '개인',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: '2028-06-15',
  },
  notificationTime: 1440, // 1일 전
};

/**
 * 윤년 2월 29일 반복 일정 Mock 데이터 (특수 케이스)
 */
export const mockLeapYearEvent: Event = {
  id: 'yearly-leap',
  title: '윤년 기념일',
  date: '2024-02-29',
  startTime: '12:00',
  endTime: '13:00',
  description: '윤년 기념',
  location: '집',
  category: '개인',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: '2028-02-29',
  },
  notificationTime: 1440,
};

/**
 * 격주 반복 일정 Mock 데이터
 */
export const mockBiWeeklyEvent: Event = {
  id: 'biweekly-1',
  title: '격주 리뷰',
  date: '2025-01-06',
  startTime: '14:00',
  endTime: '15:00',
  description: '격주 프로젝트 리뷰',
  location: '회의실 C',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 2, // 격주
    endDate: '2025-02-03',
  },
  notificationTime: 10,
};

/**
 * 분기별 반복 일정 Mock 데이터
 */
export const mockQuarterlyEvent: Event = {
  id: 'quarterly-1',
  title: '분기별 회의',
  date: '2025-01-15',
  startTime: '09:00',
  endTime: '11:00',
  description: '분기 실적 회의',
  location: '대회의실',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 3, // 3개월마다
    endDate: '2025-10-15',
  },
  notificationTime: 1440,
};

/**
 * 반복 일정 시리즈 Mock 데이터
 * (서버에서 생성된 상태, repeat.id 포함)
 */
export const mockRecurringSeries: Event[] = [
  {
    id: 'series-1-1',
    title: '주간 회의',
    date: '2025-01-06',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
      id: 'repeat-series-123', // 시리즈 ID
    },
    notificationTime: 10,
  },
  {
    id: 'series-1-2',
    title: '주간 회의',
    date: '2025-01-13',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
      id: 'repeat-series-123', // 같은 시리즈 ID
    },
    notificationTime: 10,
  },
  {
    id: 'series-1-3',
    title: '주간 회의',
    date: '2025-01-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
      id: 'repeat-series-123', // 같은 시리즈 ID
    },
    notificationTime: 10,
  },
  {
    id: 'series-1-4',
    title: '주간 회의',
    date: '2025-01-27',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
      id: 'repeat-series-123', // 같은 시리즈 ID
    },
    notificationTime: 10,
  },
];

/**
 * 반복 유형별 날짜 생성 결과 Mock 데이터
 */
export const mockGeneratedDates = {
  daily: ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10'],
  weekly: ['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27'],
  monthly: ['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15'],
  monthly31: ['2025-01-31', '2025-03-31', '2025-05-31'], // 2월, 4월 건너뜀
  monthly30: [
    '2025-01-30',
    '2025-03-30',
    '2025-04-30',
    '2025-05-30',
    '2025-06-30',
    '2025-07-30',
    '2025-08-30',
    '2025-09-30',
    '2025-10-30',
    '2025-11-30',
    '2025-12-30',
  ], // 2월만 건너뜀
  yearly: ['2025-06-15', '2026-06-15', '2027-06-15', '2028-06-15'],
  leapYear: ['2024-02-29', '2028-02-29'], // 윤년만
};

/**
 * 반복 일정 검증용 테스트 데이터
 */
export const mockInvalidRecurringData = {
  zeroInterval: {
    ...mockDailyEvent,
    repeat: {
      type: 'daily' as RepeatType,
      interval: 0, // 잘못된 간격
      endDate: '2025-01-10',
    },
  },
  negativeInterval: {
    ...mockDailyEvent,
    repeat: {
      type: 'daily' as RepeatType,
      interval: -1, // 잘못된 간격
      endDate: '2025-01-10',
    },
  },
  invalidEndDate: {
    ...mockDailyEvent,
    date: '2025-01-06',
    repeat: {
      type: 'daily' as RepeatType,
      interval: 1,
      endDate: '2025-01-05', // 시작일보다 이전
    },
  },
};
```

---

## 다음 단계

### Agent 3 (Red Phase Agent)

**작업 내용**:
1. 이 문서 (`claudedocs/02-test-design-recurring-events.md`) 읽기
2. `src/__tests__/unit/easy.repeatUtils.spec.ts` 파일 생성
3. 테스트 케이스 구조대로 실패하는 테스트 작성
4. `src/__tests__/__fixtures__/mockRecurringEvents.ts` 파일 생성
5. Git 커밋: `test: [RED] 반복 일정 테스트 작성`

**참조 문서**:
- `specs/09-recurring-events.md` (명세)
- `rules/tdd-principles.md` (TDD 원칙)
- `rules/testing-library-queries.md` (쿼리 우선순위)
- 기존 테스트 패턴: `src/__tests__/unit/easy.*.spec.ts`

**주의사항**:
- ⚠️ 테스트 코드만 작성 (구현 코드 작성 금지)
- ⚠️ 테스트 실행 후 실패 확인 필수
- ⚠️ Given-When-Then 패턴 엄격히 준수
- ⚠️ Testing Library 쿼리 우선순위 준수 (통합 테스트)

---

**문서 종료**
