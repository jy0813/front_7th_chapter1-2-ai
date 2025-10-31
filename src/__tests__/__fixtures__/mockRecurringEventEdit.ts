/**
 * 반복 일정 수정 테스트 데이터 Fixtures
 *
 * @see specs/10-recurring-event-edit.md
 * @see claudedocs/02-test-design-recurring-event-edit.md
 */

import { Event } from '../../types';

/**
 * 반복 일정 시리즈 (3개)
 * - 같은 repeat.id를 가진 매일 반복 일정
 * - 전체 수정 테스트용
 */
export const mockRecurringEventSeries: Event[] = [
  {
    id: 'event-1',
    title: '매일 회의',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
      endDate: '2025-10-31',
    },
    notificationTime: 10,
  },
  {
    id: 'event-2',
    title: '매일 회의',
    date: '2025-10-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
      endDate: '2025-10-31',
    },
    notificationTime: 10,
  },
  {
    id: 'event-3',
    title: '매일 회의',
    date: '2025-10-03',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      id: 'repeat-1',
      endDate: '2025-10-31',
    },
    notificationTime: 10,
  },
];

/**
 * 단일 반복 일정
 * - 단일 수정 테스트용 (첫 번째 일정만 수정)
 */
export const mockSingleRecurringEvent: Event = mockRecurringEventSeries[0];

/**
 * 일반 일정 (비반복)
 * - 다이얼로그 미표시 테스트용
 */
export const mockNormalEvent: Event = {
  id: 'event-normal',
  title: '일반 회의',
  date: '2025-10-01',
  startTime: '14:00',
  endTime: '15:00',
  description: '일반 회의',
  location: '회의실 B',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};

/**
 * 단일 수정 후 예상 결과
 * - repeat.type이 'none'으로 변경됨
 * - repeat.id, repeat.endDate 제거됨
 */
export const mockSingleEditedEvent: Event = {
  ...mockSingleRecurringEvent,
  title: '특별 회의',
  repeat: {
    type: 'none',
    interval: 0,
  },
};

/**
 * 전체 수정 후 예상 결과
 * - 같은 repeat.id를 가진 모든 일정의 제목 변경
 * - repeat 정보는 유지됨
 */
export const mockAllEditedEvents: Event[] = mockRecurringEventSeries.map((event) => ({
  ...event,
  title: '업데이트된 회의',
  startTime: '14:00',
  endTime: '15:00',
}));

/**
 * API 응답 Mock 데이터
 */
export const mockApiResponses = {
  /**
   * 단일 수정 API 응답 (PUT /api/events/:id)
   */
  singleEdit: {
    success: mockSingleEditedEvent,
    error: {
      status: 400,
      message: '일정 수정에 실패했습니다',
    },
  },

  /**
   * 전체 수정 API 응답 (PUT /api/recurring-events/:repeatId)
   */
  allEdit: {
    success: {
      updatedCount: 3,
      events: mockAllEditedEvents,
    },
    error: {
      status: 500,
      message: '반복 일정 수정에 실패했습니다',
    },
  },
};

/**
 * 테스트 시나리오별 데이터
 */
export const mockTestScenarios = {
  /**
   * TC-1: 다이얼로그 표시
   */
  dialogDisplay: {
    initialEvents: [mockSingleRecurringEvent],
    expectedDialogText: '해당 일정만 수정하시겠어요?',
  },

  /**
   * TC-2: 일반 일정 수정 (다이얼로그 미표시)
   */
  normalEventEdit: {
    initialEvents: [mockNormalEvent],
    shouldNotShowDialog: true,
  },

  /**
   * TC-3, TC-4: 단일 수정
   */
  singleEdit: {
    initialEvents: mockRecurringEventSeries,
    targetEvent: mockSingleRecurringEvent,
    updatedTitle: '특별 회의',
    expectedResult: mockSingleEditedEvent,
    otherEventsShouldNotChange: true,
  },

  /**
   * TC-5, TC-6: 전체 수정
   */
  allEdit: {
    initialEvents: mockRecurringEventSeries,
    targetEvent: mockSingleRecurringEvent,
    updatedTitle: '업데이트된 회의',
    updatedStartTime: '14:00',
    updatedEndTime: '15:00',
    expectedResults: mockAllEditedEvents,
    allEventsShouldChange: true,
  },

  /**
   * TC-7: 취소 버튼
   */
  cancelEdit: {
    initialEvents: mockRecurringEventSeries,
    targetEvent: mockSingleRecurringEvent,
    shouldCancelDialog: true,
    noApiCallExpected: true,
  },

  /**
   * TC-8: 단일 수정 API 실패
   */
  singleEditError: {
    initialEvents: mockRecurringEventSeries,
    targetEvent: mockSingleRecurringEvent,
    apiError: mockApiResponses.singleEdit.error,
    expectedErrorMessage: '일정 수정에 실패했습니다',
  },

  /**
   * TC-9: 전체 수정 API 실패
   */
  allEditError: {
    initialEvents: mockRecurringEventSeries,
    targetEvent: mockSingleRecurringEvent,
    apiError: mockApiResponses.allEdit.error,
    expectedErrorMessage: '반복 일정 수정에 실패했습니다',
  },
};
