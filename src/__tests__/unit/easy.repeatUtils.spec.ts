import { describe, it, expect } from 'vitest';

import {
  generateDailyDates,
  generateWeeklyDates,
  generateMonthlyDates,
  generateYearlyDates,
} from '../../utils/repeatUtils';

describe('반복 날짜 생성 유틸리티', () => {
  describe('generateDailyDates >', () => {
    it('시작일부터 365일치 매일 반복 날짜를 생성한다', () => {
      // Given: 시작 날짜
      const startDate = '2025-11-01';

      // When: 매일 반복 날짜 생성
      const dates = generateDailyDates(startDate);

      // Then: 365개 날짜 생성됨
      expect(dates).toHaveLength(365);

      // Then: 첫 번째 날짜는 시작일
      expect(dates[0]).toBe('2025-11-01');

      // Then: 마지막 날짜는 365일 후
      expect(dates[364]).toBe('2026-10-31');

      // Then: 각 날짜는 하루씩 증가
      expect(dates[1]).toBe('2025-11-02');
      expect(dates[2]).toBe('2025-11-03');
    });
  });

  describe('generateWeeklyDates >', () => {
    it('시작일부터 52주치 매주 반복 날짜를 생성한다', () => {
      // Given: 시작 날짜 (2025-11-03, 월요일)
      const startDate = '2025-11-03';

      // When: 매주 반복 날짜 생성
      const dates = generateWeeklyDates(startDate);

      // Then: 52개 날짜 생성됨
      expect(dates).toHaveLength(52);

      // Then: 첫 번째 날짜는 시작일
      expect(dates[0]).toBe('2025-11-03');

      // Then: 두 번째 날짜는 7일 후 (같은 요일)
      expect(dates[1]).toBe('2025-11-10');

      // Then: 마지막 날짜는 52주 후
      expect(dates[51]).toBe('2026-10-26');
    });

    it('모든 날짜가 같은 요일이다', () => {
      // Given: 시작 날짜 (금요일)
      const startDate = '2025-01-31';

      // When: 매주 반복 날짜 생성
      const dates = generateWeeklyDates(startDate);

      // Then: 모든 날짜가 금요일
      dates.forEach((dateStr) => {
        const date = new Date(dateStr);
        expect(date.getDay()).toBe(5); // 5 = 금요일
      });
    });
  });

  describe('generateMonthlyDates >', () => {
    it('시작일부터 12개월치 매월 반복 날짜를 생성한다', () => {
      // Given: 시작 날짜 (1일)
      const startDate = '2025-01-01';

      // When: 매월 반복 날짜 생성
      const dates = generateMonthlyDates(startDate);

      // Then: 12개 날짜 생성됨
      expect(dates).toHaveLength(12);

      // Then: 첫 번째 날짜는 시작일
      expect(dates[0]).toBe('2025-01-01');

      // Then: 각 날짜는 같은 날짜(일)를 유지
      dates.forEach((dateStr) => {
        const date = new Date(dateStr);
        expect(date.getDate()).toBe(1); // 매월 1일
      });

      // Then: 마지막 날짜는 11개월 후 (12개 = 0~11개월)
      expect(dates[11]).toBe('2025-12-01');
    });

    it('매월 15일 반복 시 모든 달에 생성된다', () => {
      // Given: 시작 날짜 (15일)
      const startDate = '2025-01-15';

      // When: 매월 반복 날짜 생성
      const dates = generateMonthlyDates(startDate);

      // Then: 12개 날짜 생성됨 (모든 달에 15일 있음)
      expect(dates).toHaveLength(12);

      // Then: 모든 날짜가 15일
      dates.forEach((dateStr) => {
        const date = new Date(dateStr);
        expect(date.getDate()).toBe(15);
      });
    });

    describe('엣지 케이스 >', () => {
      it('31일에 생성 시 31일이 없는 달은 건너뛴다', () => {
        // Given: 시작 날짜 (1월 31일)
        const startDate = '2025-01-31';

        // When: 매월 반복 날짜 생성
        const dates = generateMonthlyDates(startDate);

        // Then: 7개 날짜만 생성됨 (31일이 있는 달만)
        expect(dates).toHaveLength(7);

        // Then: 생성된 날짜 검증
        expect(dates).toEqual([
          '2025-01-31', // 1월 ✅
          '2025-03-31', // 3월 ✅
          '2025-05-31', // 5월 ✅
          '2025-07-31', // 7월 ✅
          '2025-08-31', // 8월 ✅
          '2025-10-31', // 10월 ✅
          '2025-12-31', // 12월 ✅
        ]);

        // Then: 건너뛴 달 확인 (2, 4, 6, 9, 11월)
        const months = dates.map((d) => new Date(d).getMonth() + 1);
        expect(months).not.toContain(2); // 2월 없음
        expect(months).not.toContain(4); // 4월 없음
        expect(months).not.toContain(6); // 6월 없음
        expect(months).not.toContain(9); // 9월 없음
        expect(months).not.toContain(11); // 11월 없음
      });

      it('30일에 생성 시 2월만 건너뛴다', () => {
        // Given: 시작 날짜 (1월 30일)
        const startDate = '2025-01-30';

        // When: 매월 반복 날짜 생성
        const dates = generateMonthlyDates(startDate);

        // Then: 11개 날짜 생성됨 (2월만 제외)
        expect(dates).toHaveLength(11);

        // Then: 모든 날짜가 30일
        dates.forEach((dateStr) => {
          const date = new Date(dateStr);
          expect(date.getDate()).toBe(30);
        });

        // Then: 2월이 포함되지 않음
        const months = dates.map((d) => new Date(d).getMonth() + 1);
        expect(months).not.toContain(2);
      });
    });
  });

  describe('generateYearlyDates >', () => {
    it('시작일부터 1년치(1개) 매년 반복 날짜를 생성한다', () => {
      // Given: 시작 날짜
      const startDate = '2025-06-15';

      // When: 매년 반복 날짜 생성
      const dates = generateYearlyDates(startDate);

      // Then: 1개 날짜만 생성됨 (1년치 = 1개)
      expect(dates).toHaveLength(1);

      // Then: 날짜는 시작일
      expect(dates[0]).toBe('2025-06-15');
    });

    describe('엣지 케이스 >', () => {
      it('윤년 2/29에 생성 시 1개만 생성된다 (다음 해는 평년)', () => {
        // Given: 시작 날짜 (2024년 2월 29일, 윤년)
        const startDate = '2024-02-29';

        // When: 매년 반복 날짜 생성
        const dates = generateYearlyDates(startDate);

        // Then: 1개 날짜만 생성됨
        expect(dates).toHaveLength(1);

        // Then: 날짜는 2024-02-29
        expect(dates[0]).toBe('2024-02-29');

        // Then: 2025-02-29는 생성되지 않음 (평년, 2/28까지만)
        expect(dates).not.toContain('2025-02-29');
      });

      it('평년 2/28에 생성 시 정상적으로 생성된다', () => {
        // Given: 시작 날짜 (2월 28일)
        const startDate = '2025-02-28';

        // When: 매년 반복 날짜 생성
        const dates = generateYearlyDates(startDate);

        // Then: 1개 날짜 생성됨
        expect(dates).toHaveLength(1);

        // Then: 날짜는 2025-02-28
        expect(dates[0]).toBe('2025-02-28');
      });
    });
  });
});
