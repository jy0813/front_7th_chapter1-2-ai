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

  it('100으로 나누어떨어지지만 400으로 나누어떨어지면 윤년이다', () => {
    // Given
    const year = 2000;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(true);
  });

  it('100으로 나누어떨어지고 400으로 나누어떨어지지 않으면 평년이다', () => {
    // Given
    const year = 1900;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(false);
  });

  it('4로 나누어떨어지지 않으면 평년이다', () => {
    // Given
    const year = 2023;

    // When
    const result = isLeapYear(year);

    // Then
    expect(result).toBe(false);
  });
});

describe('isValidDayInMonth', () => {
  it('31일까지 있는 달에서 31일은 유효하다', () => {
    // Given
    const year = 2024;
    const month = 0; // 1월 (JavaScript Date 기준 0-11)
    const day = 31;

    // When
    const result = isValidDayInMonth(year, month, day);

    // Then
    expect(result).toBe(true);
  });

  it('30일까지 있는 달에서 31일은 유효하지 않다', () => {
    // Given
    const year = 2024;
    const month = 3; // 4월 (JavaScript Date 기준 0-11)
    const day = 31;

    // When
    const result = isValidDayInMonth(year, month, day);

    // Then
    expect(result).toBe(false);
  });

  it('윤년 2월에 29일은 유효하다', () => {
    // Given
    const year = 2024; // 윤년
    const month = 1; // 2월 (JavaScript Date 기준 0-11)
    const day = 29;

    // When
    const result = isValidDayInMonth(year, month, day);

    // Then
    expect(result).toBe(true);
  });

  it('평년 2월에 29일은 유효하지 않다', () => {
    // Given
    const year = 2023; // 평년
    const month = 1; // 2월 (JavaScript Date 기준 0-11)
    const day = 29;

    // When
    const result = isValidDayInMonth(year, month, day);

    // Then
    expect(result).toBe(false);
  });
});
