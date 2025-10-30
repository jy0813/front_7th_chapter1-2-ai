// 반복 일정 유틸리티 함수
// specs/09-recurring-events.md 참조

import { RepeatType } from '../types';

// ============================================
// 상수 정의
// ============================================

/** 무한루프 방지 최대 반복 횟수 */
const MAX_ITERATIONS = 10000;

/** 반복 유형별 기본 종료 기간 (년 단위) */
const DEFAULT_END_YEARS: Record<RepeatType, number> = {
  none: 0,
  daily: 1,
  weekly: 1,
  monthly: 2,
  yearly: 10,
};

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 *
 * @param date - 포맷할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 *
 * @example
 * formatDate(new Date(2025, 0, 6)) // returns "2025-01-06"
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * 윤년 판별 함수
 *
 * @param year - 판별할 년도
 * @returns 윤년이면 true, 평년이면 false
 *
 * @example
 * isLeapYear(2024) // returns true (윤년)
 * isLeapYear(2025) // returns false (평년)
 * isLeapYear(2000) // returns true (400으로 나누어떨어짐)
 * isLeapYear(1900) // returns false (100으로 나누어떨어지지만 400으로는 안 됨)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 매월 반복 날짜 유효성 검증
 *
 * @param year - 년도
 * @param month - 월 (1-12)
 * @param day - 일 (1-31)
 * @returns 해당 월에 해당 날짜가 존재하면 true
 *
 * @example
 * isValidMonthlyDate(2025, 1, 31) // returns true (1월은 31일까지)
 * isValidMonthlyDate(2025, 2, 31) // returns false (2월은 31일 없음)
 * isValidMonthlyDate(2024, 2, 29) // returns true (2024년은 윤년)
 */
export function isValidMonthlyDate(year: number, month: number, day: number): boolean {
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * 기본 종료일 계산
 *
 * @param start - 시작 날짜
 * @param repeatType - 반복 유형
 * @returns 계산된 종료 날짜
 */
function calculateDefaultEndDate(start: Date, repeatType: RepeatType): Date {
  const end = new Date(start);
  const years = DEFAULT_END_YEARS[repeatType];

  end.setFullYear(end.getFullYear() + years);
  end.setDate(end.getDate() - 1); // 1일 빼기 (명세 요구사항)

  return end;
}

/**
 * daily/weekly 반복 일정 생성
 *
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @param repeatType - 반복 유형 (daily 또는 weekly)
 * @param interval - 반복 간격
 * @returns 생성된 날짜 배열
 */
function generateDailyWeeklyDates(
  start: Date,
  end: Date,
  repeatType: 'daily' | 'weekly',
  interval: number
): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  let iterationCount = 0;

  // 날짜 증가량 계산
  const daysToAdd = repeatType === 'daily' ? interval : interval * 7;

  while (current <= end && iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // 날짜 추가
    dates.push(formatDate(current));

    // 다음 날짜로 이동
    current.setDate(current.getDate() + daysToAdd);
  }

  if (iterationCount >= MAX_ITERATIONS) {
    throw new Error(`무한루프 방지: 최대 반복 횟수(${MAX_ITERATIONS}) 초과`);
  }

  return dates;
}

/**
 * monthly/yearly 반복 일정 생성
 *
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @param repeatType - 반복 유형 (monthly 또는 yearly)
 * @param interval - 반복 간격
 * @returns 생성된 날짜 배열
 */
function generateMonthlyYearlyDates(
  start: Date,
  end: Date,
  repeatType: 'monthly' | 'yearly',
  interval: number
): string[] {
  const dates: string[] = [];
  const startDay = start.getDate();
  const startMonth = start.getMonth();

  let year = start.getFullYear();
  let month = start.getMonth();
  let iterationCount = 0;

  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // 특수 케이스: 31일, 2월 29일 유효성 검증
    const isValid = isDateValid(year, month, startDay, startMonth, repeatType);

    if (isValid) {
      const current = new Date(year, month, startDay);

      // 종료일 초과 시 루프 종료
      if (current > end) {
        break;
      }

      // 날짜 추가
      dates.push(formatDate(current));
    }

    // 다음 날짜 계산
    if (repeatType === 'monthly') {
      month += interval;
      while (month >= 12) {
        month -= 12;
        year += 1;
      }
      // 조기 종료 체크
      if (new Date(year, month, 1) > end) break;
    } else {
      // yearly
      year += interval;
      // 조기 종료 체크
      if (new Date(year, month, 1) > end) break;
    }
  }

  if (iterationCount >= MAX_ITERATIONS) {
    throw new Error(`무한루프 방지: 최대 반복 횟수(${MAX_ITERATIONS}) 초과`);
  }

  return dates;
}

/**
 * monthly/yearly 반복에서 날짜 유효성 검증
 *
 * @param year - 년도
 * @param month - 월 (0-11)
 * @param day - 일
 * @param startMonth - 시작 월 (0-11)
 * @param repeatType - 반복 유형
 * @returns 유효하면 true
 */
function isDateValid(
  year: number,
  month: number,
  day: number,
  startMonth: number,
  repeatType: 'monthly' | 'yearly'
): boolean {
  if (repeatType === 'monthly') {
    // 매월 반복: 해당 날짜가 존재하는지 체크 (31일, 30일, 2월)
    return isValidMonthlyDate(year, month + 1, day);
  }

  // 매년 반복: 2월 29일 특수 케이스만 체크
  if (startMonth === 1 && day === 29) {
    // 2월 29일은 윤년에만 유효
    return isLeapYear(year);
  }

  return true;
}

/**
 * 반복 일정 날짜 생성 함수
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param repeatType - 반복 유형 (daily, weekly, monthly, yearly)
 * @param interval - 반복 간격 (1 이상의 정수)
 * @param endDate - 반복 종료일 (선택적, YYYY-MM-DD 형식)
 * @returns 생성된 날짜 배열 (YYYY-MM-DD 형식)
 *
 * @throws 반복 간격이 0 이하일 때
 * @throws 최대 반복 횟수 초과 시
 *
 * @example
 * generateRecurringDates('2025-01-06', 'daily', 1, '2025-01-10')
 * // returns ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10']
 *
 * generateRecurringDates('2025-01-06', 'weekly', 2, '2025-02-03')
 * // returns ['2025-01-06', '2025-01-20', '2025-02-03']
 *
 * generateRecurringDates('2025-01-31', 'monthly', 1, '2025-05-31')
 * // returns ['2025-01-31', '2025-03-31', '2025-05-31'] (2월, 4월 건너뜀)
 */
export function generateRecurringDates(
  startDate: string,
  repeatType: RepeatType,
  interval: number,
  endDate?: string
): string[] {
  // 간격 검증
  if (interval <= 0) {
    throw new Error('반복 간격은 1 이상이어야 합니다.');
  }

  const start = new Date(startDate);

  // 기본 종료일 설정
  const end = endDate ? new Date(endDate) : calculateDefaultEndDate(start, repeatType);

  // 종료일이 시작일보다 이전이면 빈 배열 반환
  if (end < start) {
    return [];
  }

  // 반복 유형에 따라 적절한 생성 함수 호출
  if (repeatType === 'daily' || repeatType === 'weekly') {
    return generateDailyWeeklyDates(start, end, repeatType, interval);
  }

  if (repeatType === 'monthly' || repeatType === 'yearly') {
    return generateMonthlyYearlyDates(start, end, repeatType, interval);
  }

  // 'none' 또는 기타 케이스
  return [];
}
