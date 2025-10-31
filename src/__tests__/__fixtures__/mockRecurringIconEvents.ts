import { Event } from '../../types';

/**
 * 반복 일정 아이콘 표시 테스트용 Mock 데이터
 *
 * 목적:
 * - repeat.type에 따른 아이콘 표시 여부 테스트
 * - 일반 일정(none) vs 반복 일정(daily/weekly/monthly/yearly) 구분 테스트
 */

export const mockRecurringIconEvents = {
  /**
   * 일반 일정 (반복 아이콘 미표시)
   * repeat.type: 'none'
   */
  normalEvent: {
    id: '1',
    title: '일반 일정',
    date: '2025-10-31',
    startTime: '10:00',
    endTime: '11:00',
    description: '일반 일정 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  /**
   * 매일 반복 일정 (반복 아이콘 표시)
   * repeat.type: 'daily'
   */
  dailyEvent: {
    id: '2',
    title: '매일 반복 일정',
    date: '2025-10-31',
    startTime: '09:00',
    endTime: '10:00',
    description: '매일 회의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-1',
    },
    notificationTime: 10,
  } as Event,

  /**
   * 매주 반복 일정 (반복 아이콘 표시)
   * repeat.type: 'weekly'
   */
  weeklyEvent: {
    id: '3',
    title: '매주 반복 일정',
    date: '2025-10-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 C',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-2',
    },
    notificationTime: 10,
  } as Event,

  /**
   * 매월 반복 일정 (반복 아이콘 표시)
   * repeat.type: 'monthly'
   */
  monthlyEvent: {
    id: '4',
    title: '매월 반복 일정',
    date: '2025-10-31',
    startTime: '16:00',
    endTime: '17:00',
    description: '월간 보고',
    location: '회의실 D',
    category: '업무',
    repeat: {
      type: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-3',
    },
    notificationTime: 10,
  } as Event,

  /**
   * 매년 반복 일정 (반복 아이콘 표시)
   * repeat.type: 'yearly'
   */
  yearlyEvent: {
    id: '5',
    title: '매년 반복 일정',
    date: '2025-10-31',
    startTime: '18:00',
    endTime: '19:00',
    description: '연간 행사',
    location: '대회의실',
    category: '행사',
    repeat: {
      type: 'yearly',
      interval: 1,
      endDate: '2027-10-31',
      id: 'repeat-4',
    },
    notificationTime: 10,
  } as Event,
};
