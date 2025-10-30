/**
 * 반복 일정 테스트 데이터 Fixtures
 *
 * @description
 * Agent 2 (Test Design Agent)가 생성한 반복 일정 테스트용 Mock 데이터
 *
 * @usage
 * - Agent 3 (Red Phase): 단위 테스트 및 통합 테스트 작성 시 활용
 * - Agent 4 (Green Phase): 구현 검증 시 참조
 *
 * @see specs/09-recurring-events.md - 반복 일정 명세
 * @see claudedocs/02-test-design-repeat-type-selection.md - 테스트 설계
 */

import { Event } from '../../types';

/**
 * 31일 매월 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-004 테스트: 31일 매월 반복 시 31일이 없는 달 건너뛰기
 *
 * @expected
 * 2025-01-31, 2025-03-31, 2025-05-31, 2025-07-31, 2025-08-31, 2025-10-31, 2025-12-31
 * (총 7개 일정 생성, 2월/4월/6월/9월/11월 건너뜀)
 */
export const mock31DayMonthlyEvent: Event = {
  id: 'monthly-31',
  title: '31일 매월 반복 일정',
  date: '2025-01-31',
  startTime: '10:00',
  endTime: '11:00',
  description: '31일 매월 반복 테스트',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'monthly-31-repeat'
  },
  notificationTime: 10
};

/**
 * 윤년 2월 29일 매년 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-006 테스트: 윤년 2월 29일 매년 반복 시 평년 건너뛰기
 *
 * @expected
 * 2024-02-29, 2028-02-29, 2032-02-29
 * (총 3개 일정 생성, 2025/2026/2027/2029/2030/2031 평년 건너뜀)
 */
export const mockLeapYearEvent: Event = {
  id: 'yearly-leap',
  title: '윤년 2월 29일 매년 반복',
  date: '2024-02-29',
  startTime: '14:00',
  endTime: '15:00',
  description: '윤년 생일 축하',
  location: '온라인',
  category: '개인',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: '2032-12-31',
    id: 'yearly-leap-repeat'
  },
  notificationTime: 1440 // 1일 전
};

/**
 * 매일 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-001 테스트: 매일 반복 일정 생성
 *
 * @expected
 * 2025-01-01, 2025-01-02, 2025-01-03, 2025-01-04, 2025-01-05
 * (총 5개 일정 생성)
 */
export const mockDailyEvent: Event = {
  id: 'daily-1',
  title: '매일 운동',
  date: '2025-01-01',
  startTime: '07:00',
  endTime: '08:00',
  description: '아침 조깅',
  location: '공원',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-05',
    id: 'daily-1-repeat'
  },
  notificationTime: 30
};

/**
 * 매주 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-002 테스트: 매주 같은 요일에 반복 일정 생성
 *
 * @expected
 * 2025-01-06 (월), 2025-01-13 (월), 2025-01-20 (월), 2025-01-27 (월)
 * (총 4개 일정 생성, 모두 월요일)
 */
export const mockWeeklyEvent: Event = {
  id: 'weekly-1',
  title: '주간 회의',
  date: '2025-01-06', // 월요일
  startTime: '09:00',
  endTime: '10:00',
  description: '팀 주간 회의',
  location: '회의실 B',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-27',
    id: 'weekly-1-repeat'
  },
  notificationTime: 60
};

/**
 * 일반 날짜 매월 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-003 테스트: 일반 날짜 매월 반복 (모든 달에 존재)
 *
 * @expected
 * 2025-01-15, 2025-02-15, 2025-03-15, 2025-04-15
 * (총 4개 일정 생성, 모든 달에 15일 존재)
 */
export const mockRegularMonthlyEvent: Event = {
  id: 'monthly-regular',
  title: '월간 보고',
  date: '2025-01-15',
  startTime: '15:00',
  endTime: '16:00',
  description: '월간 실적 보고',
  location: '회의실 C',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-04-15',
    id: 'monthly-regular-repeat'
  },
  notificationTime: 120
};

/**
 * 30일 매월 반복 테스트용 이벤트
 *
 * @description
 * 매월 반복 엣지 케이스: 30일 매월 반복 시 2월만 건너뛰기
 *
 * @expected
 * 2025-01-30, 2025-03-30, 2025-04-30
 * (총 3개 일정 생성, 2월(28일) 건너뜀)
 */
export const mock30DayMonthlyEvent: Event = {
  id: 'monthly-30',
  title: '30일 매월 반복',
  date: '2025-01-30',
  startTime: '11:00',
  endTime: '12:00',
  description: '30일 매월 반복 테스트',
  location: '회의실 D',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate: '2025-04-30',
    id: 'monthly-30-repeat'
  },
  notificationTime: 10
};

/**
 * 일반 날짜 매년 반복 테스트용 이벤트
 *
 * @description
 * RR-GEN-005 테스트: 일반 날짜 매년 반복 (모든 연도에 존재)
 *
 * @expected
 * 2025-03-15, 2026-03-15, 2027-03-15, 2028-03-15, 2029-03-15
 * (총 5개 일정 생성, 모든 연도에 3월 15일 존재)
 */
export const mockRegularYearlyEvent: Event = {
  id: 'yearly-regular',
  title: '창립 기념일',
  date: '2025-03-15',
  startTime: '10:00',
  endTime: '18:00',
  description: '회사 창립 기념 행사',
  location: '본사',
  category: '업무',
  repeat: {
    type: 'yearly',
    interval: 1,
    endDate: '2029-12-31',
    id: 'yearly-regular-repeat'
  },
  notificationTime: 10080 // 7일 전
};

/**
 * 일정 겹침 무시 테스트용 기존 이벤트
 *
 * @description
 * RR-GEN-007 테스트: 반복 일정 생성 시 일정 겹침 무시
 * mockOverlappingRecurringEvent와 시간이 겹침
 */
export const mockExistingOverlappingEvent: Event = {
  id: 'existing-overlap',
  title: '기존 일정',
  date: '2025-01-01',
  startTime: '10:00',
  endTime: '12:00',
  description: '겹침 테스트용 기존 일정',
  location: '회의실 E',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0
  },
  notificationTime: 10
};

/**
 * 일정 겹침 무시 테스트용 반복 이벤트
 *
 * @description
 * RR-GEN-007 테스트: mockExistingOverlappingEvent와 시간이 겹치지만
 * 반복 일정이므로 겹침 경고 없이 생성되어야 함
 *
 * @expected
 * 2025-01-01, 2025-01-02, 2025-01-03 (총 3개 일정 생성)
 * 겹침 경고 다이얼로그 표시 안함
 */
export const mockOverlappingRecurringEvent: Event = {
  id: 'recurring-overlap',
  title: '겹치는 반복 일정',
  date: '2025-01-01',
  startTime: '11:00',
  endTime: '13:00',
  description: '겹침 무시 테스트용 반복 일정',
  location: '회의실 F',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-03',
    id: 'recurring-overlap-repeat'
  },
  notificationTime: 30
};
