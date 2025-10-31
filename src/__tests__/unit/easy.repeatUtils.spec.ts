/**
 * 반복 일정 생성 로직 단위 테스트
 *
 * @see specs/09-recurring-events.md
 * @see claudedocs/02-test-design-recurring-events.md
 */

import { describe, it, expect } from 'vitest';

import {
  generateDailyEvents,
  generateWeeklyEvents,
  generateMonthlyEvents,
  generateYearlyEvents,
} from '../../utils/repeatUtils';
import {
  mockDailyEvent,
  mockAlternateDayEvent,
  mockWeeklyEvent,
  mockBiweeklyEvent,
  mockMonthly31Event,
  mockMonthly30Event,
  mockMonthly29EventCommonYear,
  mockMonthly29EventLeapYear,
  mockMonthly15Event,
  mockYearlyEvent,
  mockYearlyLeapDayEvent,
  mockEventWithoutEndDate,
} from '../__fixtures__/mockRecurringEvents';

describe('generateDailyEvents', () => {
  it('매일 반복 일정을 시작일부터 종료일까지 생성한다', () => {
    // Given
    const baseEvent = mockDailyEvent;

    // When
    const events = generateDailyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(7);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[1].date).toBe('2025-01-02');
    expect(events[2].date).toBe('2025-01-03');
    expect(events[3].date).toBe('2025-01-04');
    expect(events[4].date).toBe('2025-01-05');
    expect(events[5].date).toBe('2025-01-06');
    expect(events[6].date).toBe('2025-01-07');
  });

  it('격일 반복 일정을 interval에 따라 생성한다', () => {
    // Given
    const baseEvent = mockAlternateDayEvent;

    // When
    const events = generateDailyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(4);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[1].date).toBe('2025-01-03');
    expect(events[2].date).toBe('2025-01-05');
    expect(events[3].date).toBe('2025-01-07');
  });

  it('endDate가 없으면 2년 제한으로 일정을 생성한다', () => {
    // Given
    const baseEvent = mockEventWithoutEndDate;

    // When
    const events = generateDailyEvents(baseEvent);

    // Then
    // 2025-01-01 ~ 2027-01-01 (정확히 2년) = 731일
    expect(events).toHaveLength(731);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[events.length - 1].date).toBe('2027-01-01');
  });

  it('endDate가 2년을 초과하면 2년 제한을 적용한다', () => {
    // Given
    const baseEvent = {
      ...mockDailyEvent,
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2030-12-31', // 5년 후
      },
    };

    // When
    const events = generateDailyEvents(baseEvent);

    // Then
    // 2025-01-01 ~ 2027-01-01 (2년 제한) = 731일
    expect(events).toHaveLength(731);
    expect(events[events.length - 1].date).toBe('2027-01-01');
  });
});

describe('generateWeeklyEvents', () => {
  it('매주 같은 요일에 반복 일정을 생성한다', () => {
    // Given
    const baseEvent = mockWeeklyEvent;

    // When
    const events = generateWeeklyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(4);
    expect(events[0].date).toBe('2025-01-06'); // 월요일
    expect(events[1].date).toBe('2025-01-13'); // 월요일
    expect(events[2].date).toBe('2025-01-20'); // 월요일
    expect(events[3].date).toBe('2025-01-27'); // 월요일
  });

  it('격주 반복 일정을 interval에 따라 생성한다', () => {
    // Given
    const baseEvent = mockBiweeklyEvent;

    // When
    const events = generateWeeklyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-01-06');
    expect(events[1].date).toBe('2025-01-20'); // 2주 후
    expect(events[2].date).toBe('2025-02-03'); // 4주 후
  });
});

describe('generateMonthlyEvents', () => {
  it('31일 매월 반복 시 31일이 있는 달에만 일정을 생성한다', () => {
    // Given
    const baseEvent = mockMonthly31Event;

    // When
    const events = generateMonthlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(7);
    expect(events[0].date).toBe('2025-01-31');
    expect(events[1].date).toBe('2025-03-31'); // 2월 건너뜀
    expect(events[2].date).toBe('2025-05-31'); // 4월 건너뜀
    expect(events[3].date).toBe('2025-07-31'); // 6월 건너뜀
    expect(events[4].date).toBe('2025-08-31');
    expect(events[5].date).toBe('2025-10-31'); // 9월 건너뜀
    expect(events[6].date).toBe('2025-12-31'); // 11월 건너뜀
  });

  it('30일 매월 반복 시 2월을 제외하고 일정을 생성한다', () => {
    // Given
    const baseEvent = mockMonthly30Event;

    // When
    const events = generateMonthlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(11);
    expect(events[0].date).toBe('2025-01-30');
    expect(events[1].date).toBe('2025-03-30'); // 2월 건너뜀
    expect(events[2].date).toBe('2025-04-30');
    expect(events[3].date).toBe('2025-05-30');
    expect(events[4].date).toBe('2025-06-30');
    expect(events[5].date).toBe('2025-07-30');
    expect(events[6].date).toBe('2025-08-30');
    expect(events[7].date).toBe('2025-09-30');
    expect(events[8].date).toBe('2025-10-30');
    expect(events[9].date).toBe('2025-11-30');
    expect(events[10].date).toBe('2025-12-30');
  });

  it('29일 매월 반복 시 평년 2월을 건너뛴다', () => {
    // Given
    const baseEvent = mockMonthly29EventCommonYear;

    // When
    const events = generateMonthlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(11);
    // 2월을 제외한 모든 달
    expect(events[0].date).toBe('2025-01-29');
    expect(events[1].date).toBe('2025-03-29'); // 2월 건너뜀
    expect(events[2].date).toBe('2025-04-29');
  });

  it('29일 매월 반복 시 윤년 2월을 포함한다', () => {
    // Given
    const baseEvent = mockMonthly29EventLeapYear;

    // When
    const events = generateMonthlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(12);
    // 모든 달 포함
    expect(events[0].date).toBe('2024-01-29');
    expect(events[1].date).toBe('2024-02-29'); // 윤년 2월 포함
    expect(events[2].date).toBe('2024-03-29');
  });

  it('15일 매월 반복 시 모든 달에 일정을 생성한다', () => {
    // Given
    const baseEvent = mockMonthly15Event;

    // When
    const events = generateMonthlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(4);
    expect(events[0].date).toBe('2025-01-15');
    expect(events[1].date).toBe('2025-02-15');
    expect(events[2].date).toBe('2025-03-15');
    expect(events[3].date).toBe('2025-04-15');
  });
});

describe('generateYearlyEvents', () => {
  it('매년 같은 월/일에 반복 일정을 생성한다', () => {
    // Given
    const baseEvent = mockYearlyEvent;

    // When
    const events = generateYearlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2025-06-15');
    expect(events[1].date).toBe('2026-06-15');
  });

  it('2월 29일 매년 반복 시 윤년에만 일정을 생성한다', () => {
    // Given
    const baseEvent = mockYearlyLeapDayEvent;

    // When
    const events = generateYearlyEvents(baseEvent);

    // Then
    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2024-02-29');
    // 2025년은 평년이므로 생성 안 됨
    // 2026년은 2년 제한으로 확인 안 됨
  });
});
