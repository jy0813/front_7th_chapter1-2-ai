// 반복 일정 유틸리티 함수
// specs/09-recurring-events.md 참조

import { RepeatType } from '../types';

/**
 * 윤년 판별 함수
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 매월 반복 날짜 유효성 검증
 */
export function isValidMonthlyDate(
  year: number,
  month: number,
  day: number
): boolean {
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * 반복 일정 날짜 생성 함수
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

  const dates: string[] = [];
  const start = new Date(startDate);

  // 기본 종료일 설정
  let end: Date;
  if (endDate) {
    end = new Date(endDate);
  } else {
    // 종료일이 없으면 기본값 적용
    if (repeatType === 'daily' || repeatType === 'weekly') {
      end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
    } else if (repeatType === 'yearly') {
      end = new Date(start);
      end.setFullYear(end.getFullYear() + 10);
      end.setDate(end.getDate() - 1);
    } else {
      end = new Date(start);
      end.setFullYear(end.getFullYear() + 2);
      end.setDate(end.getDate() - 1);
    }
  }

  // 종료일이 시작일보다 이전이면 빈 배열 반환
  if (end < start) {
    return [];
  }

  const startDay = start.getDate();
  const startMonth = start.getMonth();

  let iterationCount = 0;
  const MAX_ITERATIONS = 10000; // 무한루프 방지

  if (repeatType === 'daily' || repeatType === 'weekly') {
    // daily/weekly는 Date 객체를 직접 증가
    let current = new Date(start);

    while (current <= end && iterationCount < MAX_ITERATIONS) {
      iterationCount++;

      // YYYY-MM-DD 형식으로 변환
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const day = current.getDate();
      dates.push(
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      );

      // 다음 날짜 계산
      if (repeatType === 'daily') {
        current.setDate(current.getDate() + interval);
      } else {
        // weekly
        current.setDate(current.getDate() + interval * 7);
      }
    }
  } else {
    // monthly/yearly는 year/month 변수 사용
    let year = start.getFullYear();
    let month = start.getMonth();

    while (iterationCount < MAX_ITERATIONS) {
      iterationCount++;

      // 특수 케이스 체크
      let isValid = true;

      if (repeatType === 'monthly') {
        // 매월 반복: 해당 날짜가 유효한지 체크
        isValid = isValidMonthlyDate(year, month + 1, startDay);
      } else if (
        repeatType === 'yearly' &&
        startMonth === 1 &&
        startDay === 29
      ) {
        // 매년 반복 + 2월 29일: 윤년만 허용
        isValid = isLeapYear(year);
      }

      if (isValid) {
        // 날짜 생성
        const current = new Date(year, month, startDay);

        // 종료일 체크
        if (current > end) {
          break;
        }

        // YYYY-MM-DD 형식으로 변환
        dates.push(
          `${year}-${String(month + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`
        );
      }

      // 다음 날짜 계산
      if (repeatType === 'monthly') {
        // 월 증가
        month += interval;
        while (month >= 12) {
          month -= 12;
          year += 1;
        }
        // 대략적 체크
        if (new Date(year, month, 1) > end) break;
      } else if (repeatType === 'yearly') {
        // 년도 증가
        year += interval;
        // 대략적 체크
        if (new Date(year, month, 1) > end) break;
      }
    }
  }

  if (iterationCount >= MAX_ITERATIONS) {
    throw new Error(
      `무한루프 방지: 최대 반복 횟수(${MAX_ITERATIONS}) 초과`
    );
  }

  return dates;
}
