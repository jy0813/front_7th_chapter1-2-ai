/**
 * 반복 일정 테스트 데이터 Fixtures
 *
 * @see specs/09-recurring-events.md
 */

import { EventForm } from '../../types';

/** 매일 반복 일정 (7일간) */
export const mockDailyEvent: EventForm = {
  title: '아침 운동',
  date: '2025-01-01',
  startTime: '06:00',
  endTime: '07:00',
  description: '매일 아침 운동',
  location: '헬스장',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-07',
  },
  notificationTime: 10,
};

/** 격일 반복 일정 */
export const mockAlternateDayEvent: EventForm = {
  title: '격일 운동',
  date: '2025-01-01',
  startTime: '06:00',
  endTime: '07:00',
  description: '',
  location: '',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 2,
    endDate: '2025-01-07',
  },
  notificationTime: 10,
};

/** 매주 반복 일정 (월요일) */
export const mockWeeklyEvent: EventForm = {
  title: '주간 회의',
  date: '2025-01-06', // 월요일
  startTime: '09:00',
  endTime: '10:00',
  description: '팀 주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-27',
  },
  notificationTime: 10,
};

/** 격주 반복 일정 */
export const mockBiweeklyEvent: EventForm = {
  title: '격주 보고',
  date: '2025-01-06',
  startTime: '14:00',
  endTime: '15:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 2,
    endDate: '2025-02-03',
  },
  notificationTime: 10,
};

/** 31일 매월 반복 일정 (특수 케이스) */
export const mockMonthly31Event: EventForm = {
  title: '월말 정산',
  date: '2025-01-31',
  startTime: '17:00',
  endTime: '18:00',
  description: '매월 월말 정산 업무',
  location: '사무실',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 10,
};

/** 30일 매월 반복 일정 (특수 케이스) */
export const mockMonthly30Event: EventForm = {
  title: '월말 보고',
  date: '2025-01-30',
  startTime: '15:00',
  endTime: '16:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-12-30',
  },
  notificationTime: 10,
};

/** 29일 매월 반복 일정 - 평년 (특수 케이스) */
export const mockMonthly29EventCommonYear: EventForm = {
  title: '월말 점검',
  date: '2025-01-29', // 2025년은 평년
  startTime: '16:00',
  endTime: '17:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-12-29',
  },
  notificationTime: 10,
};

/** 29일 매월 반복 일정 - 윤년 (특수 케이스) */
export const mockMonthly29EventLeapYear: EventForm = {
  title: '월말 점검',
  date: '2024-01-29', // 2024년은 윤년
  startTime: '16:00',
  endTime: '17:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2024-12-29',
  },
  notificationTime: 10,
};

/** 15일 매월 반복 일정 (일반 케이스) */
export const mockMonthly15Event: EventForm = {
  title: '월간 보고',
  date: '2025-01-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-04-15',
  },
  notificationTime: 10,
};

/** 매년 반복 일정 (일반 케이스) */
export const mockYearlyEvent: EventForm = {
  title: '생일',
  date: '2025-06-15',
  startTime: '00:00',
  endTime: '23:59',
  description: '생일 기념일',
  location: '',
  category: '기타',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: undefined, // 2년 제한
  },
  notificationTime: 1440, // 하루 전
};

/** 윤년 2월 29일 매년 반복 일정 (특수 케이스) */
export const mockYearlyLeapDayEvent: EventForm = {
  title: '윤년 기념일',
  date: '2024-02-29', // 2024년은 윤년
  startTime: '12:00',
  endTime: '13:00',
  description: '4년마다 돌아오는 날',
  location: '',
  category: '기타',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: undefined, // 2년 제한
  },
  notificationTime: 10,
};

/** endDate 없이 2년 제한 테스트용 */
export const mockEventWithoutEndDate: EventForm = {
  title: '장기 반복 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: undefined, // 2년 제한 적용
  },
  notificationTime: 10,
};

/** endDate가 2년 초과인 경우 테스트용 */
export const mockEventWithLongEndDate: EventForm = {
  title: '초장기 반복 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2030-12-31', // 5년 후 (2년 제한으로 잘림)
  },
  notificationTime: 10,
};
