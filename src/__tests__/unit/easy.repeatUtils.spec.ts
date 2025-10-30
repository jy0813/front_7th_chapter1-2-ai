import { describe, expect, it } from 'vitest';
import {
  generateDailyDates,
  generateMonthlyDates,
  generateWeeklyDates,
  generateYearlyDates,
  isLeapYear,
} from '../../utils/repeatUtils';

describe('repeatUtils', () => {
  describe('generateDailyDates', () => {
    it('매일 반복 시 startDate부터 endDate까지 모든 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-01, 종료일 2025-12-31, 간격 1
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      const interval = 1;

      // When: generateDailyDates 호출
      const result = generateDailyDates(startDate, endDate, interval);

      // Then: 365개 날짜 배열 반환
      expect(result).toHaveLength(365);
      expect(result[0]).toBe('2025-01-01');
      expect(result[364]).toBe('2025-12-31');
    });

    it('interval이 2일 경우 이틀 간격으로 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-01, 종료일 2025-01-10, 간격 2
      const startDate = '2025-01-01';
      const endDate = '2025-01-10';
      const interval = 2;

      // When: generateDailyDates 호출
      const result = generateDailyDates(startDate, endDate, interval);

      // Then: 5개 날짜 배열 반환 (01, 03, 05, 07, 09)
      expect(result).toHaveLength(5);
      expect(result).toEqual([
        '2025-01-01',
        '2025-01-03',
        '2025-01-05',
        '2025-01-07',
        '2025-01-09',
      ]);
    });

    it('endDate가 startDate보다 빠르면 빈 배열을 반환한다', () => {
      // Given: 시작일 2025-12-31, 종료일 2025-01-01
      const startDate = '2025-12-31';
      const endDate = '2025-01-01';
      const interval = 1;

      // When: generateDailyDates 호출
      const result = generateDailyDates(startDate, endDate, interval);

      // Then: 빈 배열 []
      expect(result).toEqual([]);
    });

    it('startDate와 endDate가 같으면 단일 날짜 배열을 반환한다', () => {
      // Given: 시작일과 종료일이 동일
      const startDate = '2025-01-01';
      const endDate = '2025-01-01';
      const interval = 1;

      // When: generateDailyDates 호출
      const result = generateDailyDates(startDate, endDate, interval);

      // Then: 1개 날짜 배열 반환
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('2025-01-01');
    });
  });

  describe('generateWeeklyDates', () => {
    it('매주 반복 시 같은 요일에 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-06 (월요일), 종료일 2025-12-31, 간격 1
      const startDate = '2025-01-06'; // 월요일
      const endDate = '2025-12-31';
      const interval = 1;

      // When: generateWeeklyDates 호출
      const result = generateWeeklyDates(startDate, endDate, interval);

      // Then: 52개 월요일 날짜 배열 반환
      expect(result).toHaveLength(52);
      expect(result[0]).toBe('2025-01-06');
      expect(result[1]).toBe('2025-01-13');
      expect(result[51]).toBe('2025-12-29');
    });

    it('interval이 2일 경우 2주 간격으로 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-06, 종료일 2025-02-28, 간격 2
      const startDate = '2025-01-06';
      const endDate = '2025-02-28';
      const interval = 2;

      // When: generateWeeklyDates 호출
      const result = generateWeeklyDates(startDate, endDate, interval);

      // Then: 4개 날짜 (01-06, 01-20, 02-03, 02-17)
      expect(result).toHaveLength(4);
      expect(result).toEqual(['2025-01-06', '2025-01-20', '2025-02-03', '2025-02-17']);
    });

    it('endDate가 startDate보다 빠르면 빈 배열을 반환한다', () => {
      // Given: 시작일이 종료일보다 늦음
      const startDate = '2025-12-31';
      const endDate = '2025-01-01';
      const interval = 1;

      // When: generateWeeklyDates 호출
      const result = generateWeeklyDates(startDate, endDate, interval);

      // Then: 빈 배열 []
      expect(result).toEqual([]);
    });
  });

  describe('generateMonthlyDates', () => {
    it('매월 반복 시 같은 날짜(일)에 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-15, 종료일 2025-12-31, 간격 1
      const startDate = '2025-01-15';
      const endDate = '2025-12-31';
      const interval = 1;

      // When: generateMonthlyDates 호출
      const result = generateMonthlyDates(startDate, endDate, interval);

      // Then: 12개 날짜 (매월 15일)
      expect(result).toHaveLength(12);
      expect(result[0]).toBe('2025-01-15');
      expect(result[1]).toBe('2025-02-15');
      expect(result[11]).toBe('2025-12-15');
    });

    it('31일 매월 반복 시 31일이 있는 달에만 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-31, 종료일 2025-12-31, 간격 1
      const startDate = '2025-01-31';
      const endDate = '2025-12-31';
      const interval = 1;

      // When: generateMonthlyDates 호출
      const result = generateMonthlyDates(startDate, endDate, interval);

      // Then: 7개 날짜 (1, 3, 5, 7, 8, 10, 12월)
      expect(result).toHaveLength(7);
      expect(result).toEqual([
        '2025-01-31',
        '2025-03-31',
        '2025-05-31',
        '2025-07-31',
        '2025-08-31',
        '2025-10-31',
        '2025-12-31',
      ]);
    });

    it('30일 매월 반복 시 2월을 건너뛴다', () => {
      // Given: 시작일 2025-01-30, 종료일 2025-03-31, 간격 1
      const startDate = '2025-01-30';
      const endDate = '2025-03-31';
      const interval = 1;

      // When: generateMonthlyDates 호출
      const result = generateMonthlyDates(startDate, endDate, interval);

      // Then: 2개 날짜 (01-30, 03-30), 2월 건너뜀
      expect(result).toHaveLength(2);
      expect(result).toEqual(['2025-01-30', '2025-03-30']);
    });

    it('interval이 2일 경우 2개월 간격으로 날짜를 생성한다', () => {
      // Given: 시작일 2025-01-15, 종료일 2025-12-31, 간격 2
      const startDate = '2025-01-15';
      const endDate = '2025-12-31';
      const interval = 2;

      // When: generateMonthlyDates 호출
      const result = generateMonthlyDates(startDate, endDate, interval);

      // Then: 6개 날짜 (1, 3, 5, 7, 9, 11월)
      expect(result).toHaveLength(6);
      expect(result).toEqual([
        '2025-01-15',
        '2025-03-15',
        '2025-05-15',
        '2025-07-15',
        '2025-09-15',
        '2025-11-15',
      ]);
    });

    it('endDate가 startDate보다 빠르면 빈 배열을 반환한다', () => {
      // Given: 시작일이 종료일보다 늦음
      const startDate = '2025-12-31';
      const endDate = '2025-01-01';
      const interval = 1;

      // When: generateMonthlyDates 호출
      const result = generateMonthlyDates(startDate, endDate, interval);

      // Then: 빈 배열 []
      expect(result).toEqual([]);
    });
  });

  describe('generateYearlyDates', () => {
    it('매년 반복 시 같은 월-일에 날짜를 생성한다', () => {
      // Given: 시작일 2024-03-15, 종료일 2026-12-31, 간격 1
      const startDate = '2024-03-15';
      const endDate = '2026-12-31';
      const interval = 1;

      // When: generateYearlyDates 호출
      const result = generateYearlyDates(startDate, endDate, interval);

      // Then: 3개 날짜 (2024-03-15, 2025-03-15, 2026-03-15)
      expect(result).toHaveLength(3);
      expect(result).toEqual(['2024-03-15', '2025-03-15', '2026-03-15']);
    });

    it('윤년 2월 29일 매년 반복 시 윤년에만 날짜를 생성한다', () => {
      // Given: 시작일 2024-02-29 (윤년), 종료일 2027-12-31, 간격 1
      const startDate = '2024-02-29'; // 윤년
      const endDate = '2027-12-31';
      const interval = 1;

      // When: generateYearlyDates 호출
      const result = generateYearlyDates(startDate, endDate, interval);

      // Then: 1개 날짜 (2024-02-29), 평년 건너뜀
      expect(result).toHaveLength(1);
      expect(result).toEqual(['2024-02-29']);
    });

    it('interval이 2일 경우 2년 간격으로 날짜를 생성한다', () => {
      // Given: 시작일 2024-03-15, 종료일 2029-12-31, 간격 2
      const startDate = '2024-03-15';
      const endDate = '2029-12-31';
      const interval = 2;

      // When: generateYearlyDates 호출
      const result = generateYearlyDates(startDate, endDate, interval);

      // Then: 3개 날짜 (2024, 2026, 2028)
      expect(result).toHaveLength(3);
      expect(result).toEqual(['2024-03-15', '2026-03-15', '2028-03-15']);
    });

    it('endDate가 startDate보다 빠르면 빈 배열을 반환한다', () => {
      // Given: 시작일이 종료일보다 늦음
      const startDate = '2026-01-01';
      const endDate = '2024-01-01';
      const interval = 1;

      // When: generateYearlyDates 호출
      const result = generateYearlyDates(startDate, endDate, interval);

      // Then: 빈 배열 []
      expect(result).toEqual([]);
    });

    it('endDate가 올해 내일 경우 1개 날짜만 생성한다', () => {
      // Given: 시작일 2025-03-15, 종료일 2025-12-31, 간격 1
      const startDate = '2025-03-15';
      const endDate = '2025-12-31';
      const interval = 1;

      // When: generateYearlyDates 호출
      const result = generateYearlyDates(startDate, endDate, interval);

      // Then: 1개 날짜 (2025-03-15)
      expect(result).toHaveLength(1);
      expect(result).toEqual(['2025-03-15']);
    });
  });

  describe('isLeapYear', () => {
    it('4로 나누어떨어지고 100으로 나누어떨어지지 않으면 윤년이다', () => {
      // Given: 2024, 2028
      // When: isLeapYear 호출
      // Then: true
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
    });

    it('400으로 나누어떨어지면 윤년이다', () => {
      // Given: 2000, 2400
      // When: isLeapYear 호출
      // Then: true
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
    });

    it('100으로 나누어떨어지지만 400으로 나누어떨어지지 않으면 평년이다', () => {
      // Given: 1900, 2100
      // When: isLeapYear 호출
      // Then: false
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });

    it('4로 나누어떨어지지 않으면 평년이다', () => {
      // Given: 2023, 2025
      // When: isLeapYear 호출
      // Then: false
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
    });
  });
});
