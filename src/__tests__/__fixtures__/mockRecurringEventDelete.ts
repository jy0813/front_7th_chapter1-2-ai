import { Event } from '../../types';

/**
 * 반복 일정 삭제 테스트를 위한 Mock 데이터
 *
 * @see specs/11-recurring-event-delete.md
 */

// ===========================
// 1. 반복 일정 시리즈 (삭제 대상)
// ===========================

export const mockRecurringSeriesForDelete: Event[] = [
  {
    id: 'event-1',
    title: '매일 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '반복 일정 삭제 테스트용',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: 'event-2',
    title: '매일 회의',
    date: '2025-10-02',
    startTime: '10:00',
    endTime: '11:00',
    description: '반복 일정 삭제 테스트용',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: 'event-3',
    title: '매일 회의',
    date: '2025-10-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '반복 일정 삭제 테스트용',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
];

// ===========================
// 2. 일반 일정 (다이얼로그 미표시 확인용)
// ===========================

export const mockNormalEventForDelete: Event = {
  id: 'normal-event-1',
  title: '일반 회의',
  date: '2025-10-05',
  startTime: '14:00',
  endTime: '15:00',
  description: '일반 일정 테스트용',
  location: '회의실 B',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};

// ===========================
// 3. API 응답 Mock 데이터
// ===========================

/**
 * TC-3: 단일 일정 삭제 성공 응답
 */
export const mockSingleDeleteSuccessResponse = {
  message: 'Event deleted successfully',
};

/**
 * TC-4: 전체 시리즈 삭제 성공 응답
 */
export const mockSeriesDeleteSuccessResponse = {
  message: 'Recurring event series deleted successfully',
  deletedCount: 3,
};

/**
 * TC-6: 단일 삭제 실패 응답 (400 에러)
 */
export const mockSingleDeleteFailureResponse = {
  error: 'Failed to delete event',
};

/**
 * TC-7: 전체 삭제 실패 응답 (500 에러)
 */
export const mockSeriesDeleteFailureResponse = {
  error: 'Failed to delete recurring event series',
};

// ===========================
// 4. 테스트 시나리오별 데이터
// ===========================

/**
 * TC-1: 다이얼로그 표시 시나리오
 */
export const tc1Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  expectedDialogTitle: '반복 일정 삭제',
  expectedDialogMessage: '해당 일정만 삭제하시겠어요?',
  expectedButtons: ['예', '아니오', '취소'],
};

/**
 * TC-2: 일반 일정 삭제 (다이얼로그 미표시)
 */
export const tc2Scenario = {
  initialEvents: [mockNormalEventForDelete],
  targetEvent: mockNormalEventForDelete,
  shouldShowDialog: false,
  expectedSuccessMessage: '일정이 삭제되었습니다.',
};

/**
 * TC-3: 단일 일정 삭제
 */
export const tc3Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  userChoice: '예',
  apiEndpoint: '/api/events/event-1',
  apiMethod: 'DELETE',
  apiResponse: mockSingleDeleteSuccessResponse,
  expectedSuccessMessage: '일정이 삭제되었습니다.',
  remainingEventIds: ['event-2', 'event-3'],
};

/**
 * TC-4: 전체 시리즈 삭제
 */
export const tc4Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  userChoice: '아니오',
  apiEndpoint: '/api/recurring-events/repeat-1',
  apiMethod: 'DELETE',
  apiResponse: mockSeriesDeleteSuccessResponse,
  expectedSuccessMessage: '반복 일정 시리즈가 삭제되었습니다.',
  remainingEventIds: [],
};

/**
 * TC-5: 취소 버튼
 */
export const tc5Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  userChoice: '취소',
  shouldCallApi: false,
  remainingEventIds: ['event-1', 'event-2', 'event-3'],
};

/**
 * TC-6: 단일 삭제 API 실패
 */
export const tc6Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  userChoice: '예',
  apiEndpoint: '/api/events/event-1',
  apiMethod: 'DELETE',
  apiStatusCode: 400,
  apiResponse: mockSingleDeleteFailureResponse,
  expectedErrorMessage: '일정 삭제 실패',
  remainingEventIds: ['event-1', 'event-2', 'event-3'],
};

/**
 * TC-7: 전체 삭제 API 실패
 */
export const tc7Scenario = {
  initialEvents: mockRecurringSeriesForDelete,
  targetEvent: mockRecurringSeriesForDelete[0],
  userChoice: '아니오',
  apiEndpoint: '/api/recurring-events/repeat-1',
  apiMethod: 'DELETE',
  apiStatusCode: 500,
  apiResponse: mockSeriesDeleteFailureResponse,
  expectedErrorMessage: '반복 일정 삭제 실패',
  remainingEventIds: ['event-1', 'event-2', 'event-3'],
};
