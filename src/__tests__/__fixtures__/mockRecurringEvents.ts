import { Event, RepeatInfo } from '../../types';

/**
 * 기본 Event 객체 생성 함수
 *
 * @param overrides - 기본값을 덮어쓸 필드들
 * @returns Event 객체
 */
export const createBaseEvent = (overrides?: Partial<Event>): Event => ({
  id: '1',
  title: '테스트 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

/**
 * 매일 반복 일정 생성 함수
 *
 * @param overrides - 기본값을 덮어쓸 필드들
 * @returns 매일 반복하는 Event 객체
 */
export const createDailyRecurringEvent = (overrides?: Partial<Event>): Event =>
  createBaseEvent({
    id: 'daily-1',
    title: '매일 반복 일정',
    date: '2025-01-01',
    repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
    ...overrides,
  });

/**
 * 매주 반복 일정 생성 함수
 *
 * @param overrides - 기본값을 덮어쓸 필드들
 * @returns 매주 반복하는 Event 객체
 */
export const createWeeklyRecurringEvent = (overrides?: Partial<Event>): Event =>
  createBaseEvent({
    id: 'weekly-1',
    title: '매주 반복 일정',
    date: '2025-01-01', // 수요일
    repeat: { type: 'weekly', interval: 1, endDate: '2025-02-28' },
    ...overrides,
  });

/**
 * 매월 반복 일정 생성 함수
 *
 * @param overrides - 기본값을 덮어쓸 필드들
 * @returns 매월 반복하는 Event 객체
 */
export const createMonthlyRecurringEvent = (overrides?: Partial<Event>): Event =>
  createBaseEvent({
    id: 'monthly-1',
    title: '매월 반복 일정',
    date: '2025-01-15',
    repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
    ...overrides,
  });

/**
 * 매년 반복 일정 생성 함수
 *
 * @param overrides - 기본값을 덮어쓸 필드들
 * @returns 매년 반복하는 Event 객체
 */
export const createYearlyRecurringEvent = (overrides?: Partial<Event>): Event =>
  createBaseEvent({
    id: 'yearly-1',
    title: '매년 반복 일정',
    date: '2025-01-01',
    repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
    ...overrides,
  });

// ============================================
// 특수 케이스 Mock 데이터
// ============================================

/**
 * 31일 매월 반복 일정 (31일이 없는 달 건너뛰기 테스트용)
 *
 * 예상 동작: 1월 31일 → 3월 31일 → 5월 31일 (2월은 건너뜀)
 */
export const monthly31DayEvent = createMonthlyRecurringEvent({
  id: 'monthly-31',
  title: '매월 31일 반복',
  date: '2025-01-31',
  repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
});

/**
 * 30일 매월 반복 일정 (2월 건너뛰기 테스트용)
 *
 * 예상 동작: 1월 30일 → 3월 30일 → 4월 30일 (2월은 건너뜀)
 */
export const monthly30DayEvent = createMonthlyRecurringEvent({
  id: 'monthly-30',
  title: '매월 30일 반복',
  date: '2025-01-30',
  repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
});

/**
 * 2월 29일 매년 반복 일정 (평년 건너뛰기 테스트용)
 *
 * 예상 동작: 2024-02-29 (윤년) → 2028-02-29 (윤년, 2025-2027 건너뜀)
 */
export const yearlyLeapDayEvent = createYearlyRecurringEvent({
  id: 'yearly-leap',
  title: '매년 2월 29일 반복',
  date: '2024-02-29', // 윤년
  repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
});

/**
 * 2월 28일 매년 반복 일정 (모든 해에 존재)
 *
 * 예상 동작: 모든 연도에 생성됨 (윤년, 평년 상관없음)
 */
export const yearlyFeb28Event = createYearlyRecurringEvent({
  id: 'yearly-feb28',
  title: '매년 2월 28일 반복',
  date: '2025-02-28',
  repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
});

/**
 * 매일 반복 (interval=2, 하루 건너뛰기)
 */
export const dailyInterval2Event = createDailyRecurringEvent({
  id: 'daily-interval2',
  title: '이틀에 한 번 반복',
  date: '2025-01-01',
  repeat: { type: 'daily', interval: 2, endDate: '2025-01-15' },
});

/**
 * 매주 반복 (interval=2, 격주)
 */
export const weeklyInterval2Event = createWeeklyRecurringEvent({
  id: 'weekly-interval2',
  title: '격주 반복',
  date: '2025-01-01',
  repeat: { type: 'weekly', interval: 2, endDate: '2025-03-31' },
});

/**
 * 매월 반복 (interval=2, 격월)
 */
export const monthlyInterval2Event = createMonthlyRecurringEvent({
  id: 'monthly-interval2',
  title: '격월 반복',
  date: '2025-01-15',
  repeat: { type: 'monthly', interval: 2, endDate: '2025-12-31' },
});

/**
 * 매년 반복 (interval=2, 격년)
 */
export const yearlyInterval2Event = createYearlyRecurringEvent({
  id: 'yearly-interval2',
  title: '격년 반복',
  date: '2025-01-01',
  repeat: { type: 'yearly', interval: 2, endDate: '2035-12-31' },
});

// ============================================
// endDate 없는 무한 반복 일정
// ============================================

/**
 * endDate 없는 매일 반복 일정
 */
export const infiniteDailyEvent = createDailyRecurringEvent({
  id: 'daily-infinite',
  title: '무한 매일 반복',
  date: '2025-01-01',
  repeat: { type: 'daily', interval: 1 }, // endDate 없음
});

/**
 * endDate 없는 매주 반복 일정
 */
export const infiniteWeeklyEvent = createWeeklyRecurringEvent({
  id: 'weekly-infinite',
  title: '무한 매주 반복',
  date: '2025-01-01',
  repeat: { type: 'weekly', interval: 1 }, // endDate 없음
});

// ============================================
// 헬퍼 함수
// ============================================

/**
 * RepeatInfo 객체 생성 헬퍼
 *
 * @param type - 반복 유형
 * @param interval - 반복 간격
 * @param endDate - 종료 날짜 (선택)
 * @returns RepeatInfo 객체
 */
export const createRepeatInfo = (
  type: RepeatInfo['type'],
  interval: number,
  endDate?: string
): RepeatInfo => ({
  type,
  interval,
  ...(endDate && { endDate }),
});

/**
 * 반복 일정 ID 생성 헬퍼
 *
 * @param baseId - 기본 ID
 * @param index - 인덱스 번호
 * @returns 반복 일정의 고유 ID
 */
export const generateRecurringEventId = (baseId: string, index: number): string =>
  `${baseId}-${index}`;

/**
 * 여러 개의 반복 일정을 생성하는 헬퍼 함수
 *
 * @param baseEvent - 기본 이벤트
 * @param dates - 생성할 날짜 배열
 * @returns Event 배열
 */
export const createRecurringEventInstances = (
  baseEvent: Event,
  dates: string[]
): Event[] =>
  dates.map((date, index) => ({
    ...baseEvent,
    id: generateRecurringEventId(baseEvent.id, index),
    date,
  }));
