/**
 * 반복 일정 생성 유틸리티
 *
 * @see specs/09-recurring-events.md
 * @see claudedocs/02-test-design-recurring-events.md
 */

import { EventForm } from '../types';
import { formatDate } from './dateUtils';

/**
 * 반복 일정 최대 생성 기간 (년 단위)
 */
const MAX_REPEAT_YEARS = 2;

/**
 * 주간 반복 일수 (7일)
 */
const DAYS_PER_WEEK = 7;

/**
 * 윤년 검증
 *
 * @param year - 검증할 년도
 * @returns 윤년 여부
 *
 * @example
 * isLeapYear(2024) // true (4의 배수)
 * isLeapYear(2100) // false (100의 배수이지만 400의 배수 아님)
 * isLeapYear(2000) // true (400의 배수)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 주어진 년도와 월에 특정 일자가 존재하는지 검증
 *
 * @param year - 년도
 * @param month - 월 (0-11, JavaScript Date 기준)
 * @param day - 일자
 * @returns 유효 여부
 *
 * @example
 * isValidDayInMonth(2024, 1, 29) // true (윤년 2월 29일)
 * isValidDayInMonth(2025, 1, 29) // false (평년 2월 28일까지)
 * isValidDayInMonth(2025, 3, 31) // false (4월은 30일까지)
 */
export function isValidDayInMonth(year: number, month: number, day: number): boolean {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return day <= daysInMonth;
}

/**
 * 반복 일정 종료 조건 계산
 * endDate가 없으면 시작일 + 2년, 있으면 min(endDate, 시작일 + 2년)
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (선택)
 * @returns 종료 조건 날짜
 *
 * @example
 * // endDate 없음: 2년 제한
 * calculateEndCondition(new Date('2025-01-01'), undefined)
 * // -> 2027-01-01
 *
 * // endDate가 2년 이내: endDate 사용
 * calculateEndCondition(new Date('2025-01-01'), '2025-12-31')
 * // -> 2025-12-31
 *
 * // endDate가 2년 초과: 2년 제한 적용
 * calculateEndCondition(new Date('2025-01-01'), '2030-01-01')
 * // -> 2027-01-01
 */
function calculateEndCondition(startDate: Date, endDate?: string): Date {
  const maxEndDate = new Date(startDate);
  maxEndDate.setFullYear(maxEndDate.getFullYear() + MAX_REPEAT_YEARS);

  if (!endDate) {
    return maxEndDate;
  }

  const userEndDate = new Date(endDate);
  return userEndDate < maxEndDate ? userEndDate : maxEndDate;
}

/**
 * 매일 반복 일정 생성
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 *
 * @example
 * // 매일 반복 (interval: 1)
 * generateDailyEvents({
 *   date: '2025-01-01',
 *   repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' }
 * })
 * // -> 2025-01-01, 2025-01-02, ..., 2025-01-07 (7개)
 *
 * // 격일 반복 (interval: 2)
 * generateDailyEvents({
 *   date: '2025-01-01',
 *   repeat: { type: 'daily', interval: 2, endDate: '2025-01-07' }
 * })
 * // -> 2025-01-01, 2025-01-03, 2025-01-05, 2025-01-07 (4개)
 */
export function generateDailyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const { interval } = baseEvent.repeat;

  let current = new Date(startDate);

  while (current <= endCondition) {
    events.push({
      ...baseEvent,
      date: formatDate(current),
    });

    current.setDate(current.getDate() + interval);
  }

  return events;
}

/**
 * 매주 반복 일정 생성
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 *
 * @example
 * // 매주 반복 (interval: 1)
 * generateWeeklyEvents({
 *   date: '2025-01-06',  // 월요일
 *   repeat: { type: 'weekly', interval: 1, endDate: '2025-01-27' }
 * })
 * // -> 매주 월요일 (2025-01-06, 13, 20, 27)
 *
 * // 격주 반복 (interval: 2)
 * generateWeeklyEvents({
 *   date: '2025-01-06',
 *   repeat: { type: 'weekly', interval: 2, endDate: '2025-02-03' }
 * })
 * // -> 격주 월요일 (2025-01-06, 20, 02-03)
 */
export function generateWeeklyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const { interval } = baseEvent.repeat;

  let current = new Date(startDate);

  while (current <= endCondition) {
    events.push({
      ...baseEvent,
      date: formatDate(current),
    });

    // 주간 반복: interval * 7일씩 증가
    current.setDate(current.getDate() + interval * DAYS_PER_WEEK);
  }

  return events;
}

/**
 * 매월 반복 일정 생성
 * 특수 케이스:
 * - 31일 매월 반복: 31일이 있는 달에만 생성 (1, 3, 5, 7, 8, 10, 12월)
 * - 30일 매월 반복: 2월 제외 (1, 3-12월)
 * - 29일 매월 반복: 평년 2월 제외, 윤년 포함
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 *
 * @example
 * // 31일 매월 반복: 31일이 있는 달만 생성
 * generateMonthlyEvents({
 *   date: '2025-01-31',
 *   repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' }
 * })
 * // -> 1, 3, 5, 7, 8, 10, 12월 (7개, 2, 4, 6, 9, 11월 건너뜀)
 *
 * // 29일 매월 반복 (평년): 2월 제외
 * generateMonthlyEvents({
 *   date: '2025-01-29',
 *   repeat: { type: 'monthly', interval: 1, endDate: '2025-12-29' }
 * })
 * // -> 1, 3-12월 (11개, 평년 2월 건너뜀)
 *
 * // 29일 매월 반복 (윤년): 모든 달
 * generateMonthlyEvents({
 *   date: '2024-01-29',
 *   repeat: { type: 'monthly', interval: 1, endDate: '2024-12-29' }
 * })
 * // -> 1-12월 (12개, 윤년 2월 포함)
 */
export function generateMonthlyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const { interval } = baseEvent.repeat;
  const dayOfMonth = startDate.getDate();

  let current = new Date(startDate);

  while (current <= endCondition) {
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();

    // 해당 월에 dayOfMonth가 존재하는 경우만 생성
    if (isValidDayInMonth(currentYear, currentMonth, dayOfMonth)) {
      const eventDate = new Date(currentYear, currentMonth, dayOfMonth);
      events.push({
        ...baseEvent,
        date: formatDate(eventDate),
      });
    }

    // 다음 달로 이동 (interval만큼 증가)
    current.setMonth(current.getMonth() + interval);
  }

  return events;
}

/**
 * 매년 반복 일정 생성
 * 특수 케이스:
 * - 2월 29일 매년 반복: 윤년에만 생성
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 *
 * @example
 * // 일반적인 매년 반복
 * generateYearlyEvents({
 *   date: '2025-06-15',
 *   repeat: { type: 'yearly', interval: 1, endDate: undefined }  // 2년 제한
 * })
 * // -> 2025-06-15, 2026-06-15 (2개, 2027년은 2년 제한으로 제외)
 *
 * // 2월 29일 매년 반복: 윤년만 생성
 * generateYearlyEvents({
 *   date: '2024-02-29',
 *   repeat: { type: 'yearly', interval: 1, endDate: undefined }
 * })
 * // -> 2024-02-29만 생성 (2025년 평년 건너뜀, 2026년은 2년 제한)
 */
export function generateYearlyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const { interval } = baseEvent.repeat;
  const month = startDate.getMonth();
  const dayOfMonth = startDate.getDate();

  let current = new Date(startDate);

  // 주의: 매년 반복은 < 연산자 사용 (endCondition 당일 미포함)
  // 이유: 명세에 따르면 2년 제한 시 정확히 2년 후 날짜는 제외
  // 예: 2025-06-15 시작 → 2025, 2026만 생성 (2027은 제외)
  while (current < endCondition) {
    const currentYear = current.getFullYear();

    // 해당 년도에 해당 월/일이 존재하는 경우만 생성
    // 예: 2월 29일은 윤년에만 존재
    if (isValidDayInMonth(currentYear, month, dayOfMonth)) {
      const eventDate = new Date(currentYear, month, dayOfMonth);
      events.push({
        ...baseEvent,
        date: formatDate(eventDate),
      });
    }

    // 다음 해로 이동 (interval만큼 증가)
    current.setFullYear(current.getFullYear() + interval);
  }

  return events;
}
