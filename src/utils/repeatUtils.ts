/**
 * 반복 일정 생성 유틸리티
 *
 * @see specs/09-recurring-events.md
 * @see claudedocs/02-test-design-recurring-events.md
 */

import { EventForm } from '../types';
import { formatDate } from './dateUtils';

/**
 * 윤년 검증
 *
 * @param year - 검증할 년도
 * @returns 윤년 여부
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
 */
export function isValidDayInMonth(year: number, month: number, day: number): boolean {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return day <= daysInMonth;
}

/**
 * 반복 일정 종료 조건 계산
 * endDate가 없으면 현재 날짜 + 2년, 있으면 min(endDate, 현재 날짜 + 2년)
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (선택)
 * @returns 종료 조건 날짜
 */
function calculateEndCondition(startDate: Date, endDate?: string): Date {
  const twoYearsLater = new Date(startDate);
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

  if (!endDate) {
    return twoYearsLater;
  }

  const endDateObj = new Date(endDate);
  return endDateObj < twoYearsLater ? endDateObj : twoYearsLater;
}

/**
 * 매일 반복 일정 생성
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 */
export function generateDailyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const interval = baseEvent.repeat.interval;

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
 */
export function generateWeeklyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const interval = baseEvent.repeat.interval;

  let current = new Date(startDate);

  while (current <= endCondition) {
    events.push({
      ...baseEvent,
      date: formatDate(current),
    });

    current.setDate(current.getDate() + interval * 7);
  }

  return events;
}

/**
 * 매월 반복 일정 생성
 * 특수 케이스:
 * - 31일 매월 반복: 31일이 있는 달에만 생성
 * - 30일 매월 반복: 2월 제외
 * - 29일 매월 반복: 평년 2월 제외, 윤년 포함
 *
 * @param baseEvent - 기본 일정 정보
 * @returns 생성된 일정 배열
 */
export function generateMonthlyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const interval = baseEvent.repeat.interval;
  const dayOfMonth = startDate.getDate();

  let current = new Date(startDate);

  while (current <= endCondition) {
    // 해당 월에 dayOfMonth가 존재하는 경우만 생성
    if (isValidDayInMonth(current.getFullYear(), current.getMonth(), dayOfMonth)) {
      const eventDate = new Date(current.getFullYear(), current.getMonth(), dayOfMonth);
      events.push({
        ...baseEvent,
        date: formatDate(eventDate),
      });
    }

    // 다음 달로 이동
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
 */
export function generateYearlyEvents(baseEvent: EventForm): EventForm[] {
  const events: EventForm[] = [];
  const startDate = new Date(baseEvent.date);
  const endCondition = calculateEndCondition(startDate, baseEvent.repeat.endDate);
  const interval = baseEvent.repeat.interval;
  const month = startDate.getMonth();
  const dayOfMonth = startDate.getDate();

  let current = new Date(startDate);

  while (current < endCondition) {
    // 해당 년도에 해당 월/일이 존재하는 경우만 생성
    if (isValidDayInMonth(current.getFullYear(), month, dayOfMonth)) {
      const eventDate = new Date(current.getFullYear(), month, dayOfMonth);
      events.push({
        ...baseEvent,
        date: formatDate(eventDate),
      });
    }

    // 다음 해로 이동
    current.setFullYear(current.getFullYear() + interval);
  }

  return events;
}
