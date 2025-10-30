/**
 * 월별 일수 검증 로직 단위 테스트
 *
 * @see specs/09-recurring-events.md
 * @see claudedocs/02-test-design-recurring-events.md
 */

import { describe, it, expect } from 'vitest';
import { isLeapYear, isValidDayInMonth } from '../../utils/repeatUtils';

describe('isLeapYear', () => {
  it('4로 나누어떨어지고 100으로 나누어떨어지지 않으면 윤년이다', () => {
    // Given
    const year = 2024;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(true);
  });

  it('100으로 나누어떨어지면 윤년이 아니다', () => {
    // Given
    const year = 2100;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(false);
  });

  it('400으로 나누어떨어지면 윤년이다', () => {
    // Given
    const year = 2000;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(true);
  });

  it('4로 나누어떨어지지 않으면 윤년이 아니다', () => {
    // Given
    const year = 2025;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(false);
  });
});

describe('isValidDayInMonth', () => {
  it('31일은 31일이 있는 달에만 유효하다', () => {
    // Given
    const year = 2025;
    const day = 31;

    // When & Then
    expect(isValidDayInMonth(year, 0, day)).toBe(true); // 1월 (31일)
    expect(isValidDayInMonth(year, 1, day)).toBe(false); // 2월 (28일)
    expect(isValidDayInMonth(year, 2, day)).toBe(true); // 3월 (31일)
    expect(isValidDayInMonth(year, 3, day)).toBe(false); // 4월 (30일)
    expect(isValidDayInMonth(year, 4, day)).toBe(true); // 5월 (31일)
    expect(isValidDayInMonth(year, 5, day)).toBe(false); // 6월 (30일)
    expect(isValidDayInMonth(year, 6, day)).toBe(true); // 7월 (31일)
    expect(isValidDayInMonth(year, 7, day)).toBe(true); // 8월 (31일)
    expect(isValidDayInMonth(year, 8, day)).toBe(false); // 9월 (30일)
    expect(isValidDayInMonth(year, 9, day)).toBe(true); // 10월 (31일)
    expect(isValidDayInMonth(year, 10, day)).toBe(false); // 11월 (30일)
    expect(isValidDayInMonth(year, 11, day)).toBe(true); // 12월 (31일)
  });

  it('30일은 30일 이상 있는 달에만 유효하다', () => {
    // Given
    const year = 2025;
    const day = 30;

    // When & Then
    expect(isValidDayInMonth(year, 0, day)).toBe(true); // 1월 (31일)
    expect(isValidDayInMonth(year, 1, day)).toBe(false); // 2월 (28일)
    expect(isValidDayInMonth(year, 2, day)).toBe(true); // 3월 (31일)
    expect(isValidDayInMonth(year, 3, day)).toBe(true); // 4월 (30일)
    expect(isValidDayInMonth(year, 4, day)).toBe(true); // 5월 (31일)
    expect(isValidDayInMonth(year, 5, day)).toBe(true); // 6월 (30일)
    expect(isValidDayInMonth(year, 6, day)).toBe(true); // 7월 (31일)
    expect(isValidDayInMonth(year, 7, day)).toBe(true); // 8월 (31일)
    expect(isValidDayInMonth(year, 8, day)).toBe(true); // 9월 (30일)
    expect(isValidDayInMonth(year, 9, day)).toBe(true); // 10월 (31일)
    expect(isValidDayInMonth(year, 10, day)).toBe(true); // 11월 (30일)
    expect(isValidDayInMonth(year, 11, day)).toBe(true); // 12월 (31일)
  });

  it('29일은 윤년 2월에 유효하다', () => {
    // Given
    const leapYear = 2024; // 윤년
    const month = 1; // 2월 (0-indexed)
    const day = 29;

    // When
    const result = isValidDayInMonth(leapYear, month, day);

    // Then
    expect(result).toBe(true);
  });

  it('29일은 평년 2월에 유효하지 않다', () => {
    // Given
    const commonYear = 2025; // 평년
    const month = 1; // 2월 (0-indexed)
    const day = 29;

    // When
    const result = isValidDayInMonth(commonYear, month, day);

    // Then
    expect(result).toBe(false);
  });
});
