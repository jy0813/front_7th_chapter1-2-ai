import { describe, it, expect } from 'vitest';

import { generateRecurringDates, isLeapYear, isValidMonthlyDate } from '../../utils/repeatUtils';

describe('generateRecurringDates', () => {
  describe('매일 반복 (daily)', () => {
    it('매일 반복 일정을 시작일부터 종료일까지 생성한다', () => {
      // Given: startDate = "2025-01-06", repeatType = "daily", interval = 1, endDate = "2025-01-10"
      const startDate = '2025-01-06';
      const endDate = '2025-01-10';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'daily', 1, endDate);

      // Then: 5개의 날짜 반환 (2025-01-06, 01-07, 01-08, 01-09, 01-10)
      expect(result).toEqual([
        '2025-01-06',
        '2025-01-07',
        '2025-01-08',
        '2025-01-09',
        '2025-01-10',
      ]);
    });

    it('간격이 2일 때 하루 건너뛰며 일정을 생성한다 (격일)', () => {
      // Given: interval = 2
      const startDate = '2025-01-06';
      const endDate = '2025-01-12';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'daily', 2, endDate);

      // Then: 격일로 날짜 생성 (2025-01-06, 01-08, 01-10, 01-12)
      expect(result).toEqual(['2025-01-06', '2025-01-08', '2025-01-10', '2025-01-12']);
    });

    it('종료일이 없을 때 기본 종료일(1년 후)까지 생성한다', () => {
      // Given: endDate = undefined
      const startDate = '2025-01-06';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'daily', 1);

      // Then: 1년 후까지 365개의 날짜 생성
      expect(result.length).toBe(365);
      expect(result[0]).toBe('2025-01-06');
      expect(result[result.length - 1]).toBe('2026-01-05');
    });
  });

  describe('매주 반복 (weekly)', () => {
    it('매주 같은 요일에 일정을 생성한다', () => {
      // Given: startDate = "2025-01-06" (월요일), repeatType = "weekly", interval = 1
      const startDate = '2025-01-06'; // 월요일
      const endDate = '2025-01-27';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'weekly', 1, endDate);

      // Then: 매주 월요일 (2025-01-06, 01-13, 01-20, 01-27)
      expect(result).toEqual(['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27']);
    });

    it('간격이 2주일 때 격주로 일정을 생성한다', () => {
      // Given: interval = 2
      const startDate = '2025-01-06'; // 월요일
      const endDate = '2025-02-03';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'weekly', 2, endDate);

      // Then: 격주 월요일 (2025-01-06, 01-20, 02-03)
      expect(result).toEqual(['2025-01-06', '2025-01-20', '2025-02-03']);
    });
  });

  describe('매월 반복 (monthly)', () => {
    it('매월 같은 날짜에 일정을 생성한다', () => {
      // Given: startDate = "2025-01-15", repeatType = "monthly", interval = 1
      const startDate = '2025-01-15';
      const endDate = '2025-04-15';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'monthly', 1, endDate);

      // Then: 매월 15일 (2025-01-15, 02-15, 03-15, 04-15)
      expect(result).toEqual(['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15']);
    });

    it('31일 매월 반복은 31일이 있는 달에만 생성한다', () => {
      // Given: startDate = "2025-01-31"
      const startDate = '2025-01-31';
      const endDate = '2025-05-31';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'monthly', 1, endDate);

      // Then: 31일이 있는 달만 (2025-01-31, 03-31, 05-31) - 2월, 4월 건너뜀
      expect(result).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
    });

    it('30일 매월 반복은 2월만 건너뛴다', () => {
      // Given: startDate = "2025-01-30"
      const startDate = '2025-01-30';
      const endDate = '2025-12-30';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'monthly', 1, endDate);

      // Then: 2월 제외한 모든 달 (2025-01-30, 03-30, 04-30, ...)
      expect(result).toEqual([
        '2025-01-30',
        '2025-03-30', // 2월 건너뜀
        '2025-04-30',
        '2025-05-30',
        '2025-06-30',
        '2025-07-30',
        '2025-08-30',
        '2025-09-30',
        '2025-10-30',
        '2025-11-30',
        '2025-12-30',
      ]);
    });

    it('간격이 3개월일 때 분기별로 일정을 생성한다', () => {
      // Given: interval = 3
      const startDate = '2025-01-15';
      const endDate = '2025-10-15';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'monthly', 3, endDate);

      // Then: 3개월마다 (2025-01-15, 04-15, 07-15, 10-15)
      expect(result).toEqual(['2025-01-15', '2025-04-15', '2025-07-15', '2025-10-15']);
    });
  });

  describe('매년 반복 (yearly)', () => {
    it('매년 같은 날짜에 일정을 생성한다', () => {
      // Given: startDate = "2025-06-15", repeatType = "yearly", interval = 1
      const startDate = '2025-06-15';
      const endDate = '2028-06-15';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'yearly', 1, endDate);

      // Then: 매년 6월 15일 (2025-06-15, 2026-06-15, 2027-06-15, 2028-06-15)
      expect(result).toEqual(['2025-06-15', '2026-06-15', '2027-06-15', '2028-06-15']);
    });

    it('2월 29일 매년 반복은 윤년에만 생성한다', () => {
      // Given: startDate = "2024-02-29" (윤년)
      const startDate = '2024-02-29';
      const endDate = '2028-02-29';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'yearly', 1, endDate);

      // Then: 윤년만 (2024-02-29, 2028-02-29) - 2025, 2026, 2027 건너뜀
      expect(result).toEqual(['2024-02-29', '2028-02-29']);
    });

    it('종료일이 없을 때 기본 종료일(10년 후)까지 생성한다', () => {
      // Given: endDate = undefined
      const startDate = '2025-06-15';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'yearly', 1);

      // Then: 10년 후까지 10개의 날짜 생성
      expect(result.length).toBe(10);
      expect(result[0]).toBe('2025-06-15');
      expect(result[result.length - 1]).toBe('2034-06-15');
    });
  });

  describe('엣지 케이스', () => {
    it('시작일과 종료일이 같을 때 1개의 날짜만 반환한다', () => {
      // Given: startDate = "2025-01-06", endDate = "2025-01-06"
      const startDate = '2025-01-06';
      const endDate = '2025-01-06';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'daily', 1, endDate);

      // Then: 1개의 날짜 반환 (2025-01-06)
      expect(result).toEqual(['2025-01-06']);
    });

    it('종료일이 시작일보다 이전일 때 빈 배열을 반환한다', () => {
      // Given: startDate = "2025-01-06", endDate = "2025-01-05"
      const startDate = '2025-01-06';
      const endDate = '2025-01-05';

      // When: generateRecurringDates 호출
      const result = generateRecurringDates(startDate, 'daily', 1, endDate);

      // Then: 빈 배열 반환
      expect(result).toEqual([]);
    });

    it('간격이 0 이하일 때 에러를 throw한다', () => {
      // Given: interval = 0
      const startDate = '2025-01-06';
      const endDate = '2025-01-10';

      // When & Then: generateRecurringDates 호출 시 Error throw
      expect(() => {
        generateRecurringDates(startDate, 'daily', 0, endDate);
      }).toThrow('반복 간격은 1 이상이어야 합니다.');
    });
  });
});

describe('isLeapYear', () => {
  it('윤년을 올바르게 판별한다', () => {
    // Given: 2024년 (4로 나누어떨어지고, 100으로 나누어떨어지지 않음)
    // When: isLeapYear(2024) 호출
    const result = isLeapYear(2024);

    // Then: true 반환
    expect(result).toBe(true);
  });

  it('평년을 올바르게 판별한다', () => {
    // Given: 2025년 (4로 나누어떨어지지 않음)
    // When: isLeapYear(2025) 호출
    const result = isLeapYear(2025);

    // Then: false 반환
    expect(result).toBe(false);
  });

  it('100으로 나누어떨어지지만 400으로 나누어떨어지는 윤년을 판별한다', () => {
    // Given: 2000년 (400으로 나누어떨어짐)
    // When: isLeapYear(2000) 호출
    const result = isLeapYear(2000);

    // Then: true 반환
    expect(result).toBe(true);
  });

  it('100으로 나누어떨어지고 400으로 나누어떨어지지 않는 평년을 판별한다', () => {
    // Given: 1900년 (100으로 나누어떨어지지만 400으로 나누어떨어지지 않음)
    // When: isLeapYear(1900) 호출
    const result = isLeapYear(1900);

    // Then: false 반환
    expect(result).toBe(false);
  });
});

describe('isValidMonthlyDate', () => {
  it('31일이 있는 달에 31일이 유효하다고 판별한다', () => {
    // Given: year = 2025, month = 1, day = 31 (1월 31일)
    // When: isValidMonthlyDate 호출
    const result = isValidMonthlyDate(2025, 1, 31);

    // Then: true 반환
    expect(result).toBe(true);
  });

  it('31일이 없는 달에 31일이 유효하지 않다고 판별한다', () => {
    // Given: year = 2025, month = 2, day = 31 (2월 31일)
    // When: isValidMonthlyDate 호출
    const result = isValidMonthlyDate(2025, 2, 31);

    // Then: false 반환
    expect(result).toBe(false);
  });

  it('평년 2월에 29일이 유효하지 않다고 판별한다', () => {
    // Given: year = 2025, month = 2, day = 29 (평년 2월 29일)
    // When: isValidMonthlyDate 호출
    const result = isValidMonthlyDate(2025, 2, 29);

    // Then: false 반환
    expect(result).toBe(false);
  });

  it('윤년 2월에 29일이 유효하다고 판별한다', () => {
    // Given: year = 2024, month = 2, day = 29 (윤년 2월 29일)
    // When: isValidMonthlyDate 호출
    const result = isValidMonthlyDate(2024, 2, 29);

    // Then: true 반환
    expect(result).toBe(true);
  });
});
