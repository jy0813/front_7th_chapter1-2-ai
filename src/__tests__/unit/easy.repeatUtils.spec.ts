import { describe, it, expect } from 'vitest';

import {
  generateDailyDates,
  generateWeeklyDates,
  generateMonthlyDates,
  generateYearlyDates,
  isLeapYear,
} from '../../utils/repeatUtils';

describe('generateDailyDates', () => {
  it('시작일부터 종료일까지 매일 날짜 생성', () => {
    // Given: 2025-01-01 ~ 2025-01-05
    const startDate = '2025-01-01';
    const endDate = '2025-01-05';

    // When
    const result = generateDailyDates(startDate, endDate);

    // Then: 5개 날짜 생성
    expect(result).toEqual(['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05']);
  });

  it('동일한 날짜 입력 시 1개 날짜만 반환', () => {
    // Given: 시작일 = 종료일
    const startDate = '2025-01-01';
    const endDate = '2025-01-01';

    // When
    const result = generateDailyDates(startDate, endDate);

    // Then
    expect(result).toEqual(['2025-01-01']);
  });
});

describe('generateWeeklyDates', () => {
  it('같은 요일에 매주 날짜 생성', () => {
    // Given: 2025-01-06 (월요일) ~ 2025-01-27
    const startDate = '2025-01-06';
    const endDate = '2025-01-27';

    // When
    const result = generateWeeklyDates(startDate, endDate);

    // Then: 매주 월요일 (1/6, 1/13, 1/20, 1/27)
    expect(result).toEqual(['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27']);
  });

  it('1주일 미만 입력 시 시작일만 반환', () => {
    // Given: 1주일 미만
    const startDate = '2025-01-06';
    const endDate = '2025-01-10';

    // When
    const result = generateWeeklyDates(startDate, endDate);

    // Then
    expect(result).toEqual(['2025-01-06']);
  });
});

describe('generateMonthlyDates', () => {
  it('일반 날짜(15일) 매월 반복은 모든 달 생성', () => {
    // Given: 2025-01-15 ~ 2025-04-15
    const startDate = '2025-01-15';
    const endDate = '2025-04-15';

    // When
    const result = generateMonthlyDates(startDate, endDate);

    // Then: 1월, 2월, 3월, 4월 모두 생성
    expect(result).toEqual(['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15']);
  });

  it('⭐️ 31일 매월 반복은 31일이 없는 달 건너뜀', () => {
    // Given: 2025-01-31 ~ 2025-06-30
    const startDate = '2025-01-31';
    const endDate = '2025-06-30';

    // When
    const result = generateMonthlyDates(startDate, endDate);

    // Then: 1월, 3월, 5월만 생성 (2월, 4월 건너뜀)
    expect(result).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
  });

  it('30일 매월 반복은 30일이 없는 달(2월) 건너뜀', () => {
    // Given: 2025-01-30 ~ 2025-04-30
    const startDate = '2025-01-30';
    const endDate = '2025-04-30';

    // When
    const result = generateMonthlyDates(startDate, endDate);

    // Then: 1월, 3월, 4월 (2월 건너뜀)
    expect(result).toEqual(['2025-01-30', '2025-03-30', '2025-04-30']);
  });

  it('윤년 2월 29일 매월 반복은 평년 2월 건너뜀', () => {
    // Given: 2024-02-29 (윤년) ~ 2025-04-29
    const startDate = '2024-02-29';
    const endDate = '2025-04-29';

    // When
    const result = generateMonthlyDates(startDate, endDate);

    // Then: 2024-02-29, 2024-03-29, ..., 2024-12-29, 2025-01-29, 2025-03-29, 2025-04-29
    // 2025-02는 평년이므로 건너뜀
    expect(result).toHaveLength(14); // 2024년 11개월 + 2025년 3개월
    expect(result).toContain('2024-02-29');
    expect(result).not.toContain('2025-02-29');
  });

  it('1개월 미만 입력 시 시작일만 반환', () => {
    // Given: 1개월 미만
    const startDate = '2025-01-15';
    const endDate = '2025-01-20';

    // When
    const result = generateMonthlyDates(startDate, endDate);

    // Then
    expect(result).toEqual(['2025-01-15']);
  });
});

describe('generateYearlyDates', () => {
  it('일반 날짜 매년 반복은 매년 생성', () => {
    // Given: 2025-01-15 ~ 2027-12-31
    const startDate = '2025-01-15';
    const endDate = '2027-12-31';

    // When
    const result = generateYearlyDates(startDate, endDate);

    // Then: 2025, 2026, 2027
    expect(result).toEqual(['2025-01-15', '2026-01-15', '2027-01-15']);
  });

  it('⭐️ 윤년 2월 29일 매년 반복은 평년 건너뜀', () => {
    // Given: 2024-02-29 (윤년) ~ 2032-12-31
    const startDate = '2024-02-29';
    const endDate = '2032-12-31';

    // When
    const result = generateYearlyDates(startDate, endDate);

    // Then: 2024, 2028, 2032 (윤년만)
    expect(result).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
  });

  it('평년 2월 28일 매년 반복은 매년 생성', () => {
    // Given: 2025-02-28 ~ 2028-12-31
    const startDate = '2025-02-28';
    const endDate = '2028-12-31';

    // When
    const result = generateYearlyDates(startDate, endDate);

    // Then: 2025, 2026, 2027, 2028 모두 생성
    expect(result).toEqual(['2025-02-28', '2026-02-28', '2027-02-28', '2028-02-28']);
  });

  it('1년 미만 입력 시 시작일만 반환', () => {
    // Given: 1년 미만
    const startDate = '2025-01-15';
    const endDate = '2025-06-30';

    // When
    const result = generateYearlyDates(startDate, endDate);

    // Then
    expect(result).toEqual(['2025-01-15']);
  });
});

describe('isLeapYear', () => {
  it('4로 나누어떨어지고 100으로 나누어떨어지지 않으면 윤년', () => {
    // Given: 2024, 2028
    // When & Then
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
  });

  it('400으로 나누어떨어지면 윤년', () => {
    // Given: 2000, 2400
    // When & Then
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('100으로 나누어떨어지지만 400으로 나누어떨어지지 않으면 평년', () => {
    // Given: 1900, 2100
    // When & Then
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('4로 나누어떨어지지 않으면 평년', () => {
    // Given: 2025, 2026, 2027
    // When & Then
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2027)).toBe(false);
  });
});
