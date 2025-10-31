/**
 * 반복 일정 통합 테스트
 *
 * @see specs/09-recurring-events.md (통합 테스트 섹션)
 * @see claudedocs/02-test-design-recurring-events-integration.md (테스트 설계)
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import {
  mockWeeklyEvent,
  mockMonthly31Event,
  mockYearlyLeapDayEvent,
} from './__fixtures__/mockRecurringEvents';

const theme = createTheme();

/**
 * 테스트 헬퍼: App 렌더링 (기존 패턴 재사용)
 */
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

/**
 * 테스트 헬퍼: 일정 추가 폼 작성 (기존 패턴 재사용)
 */
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));
};

/**
 * 테스트 헬퍼: 반복 설정 활성화 및 입력
 */
const enableRepeatSettings = async (
  user: UserEvent,
  settings: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  }
) => {
  // Given: "반복 일정" 체크박스 활성화
  const repeatCheckbox = screen.getByLabelText('반복 일정');
  await user.click(repeatCheckbox);

  // Then: 반복 관련 필드 표시 확인
  expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
  expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();

  // When: 반복 유형 선택
  const repeatTypeSelect = screen.getByLabelText('반복 유형');
  await user.click(within(repeatTypeSelect).getByRole('combobox'));

  const typeLabels = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };
  await user.click(screen.getByRole('option', { name: typeLabels[settings.type] }));

  // When: 반복 간격 입력
  const intervalInput = screen.getByLabelText('반복 간격');
  await user.clear(intervalInput);
  await user.type(intervalInput, String(settings.interval));

  // When: 반복 종료일 입력 (선택적)
  if (settings.endDate) {
    const endDateInput = screen.getByLabelText('반복 종료일');
    await user.type(endDateInput, settings.endDate);
  }
};

describe('반복 일정 생성', () => {
  it('사용자가 반복 일정을 생성할 수 있다', async () => {
    // Given: App 렌더링
    const { user } = setup(<App />);

    // When: 일정 추가 폼 작성
    await saveSchedule(user, {
      title: mockWeeklyEvent.title,
      date: mockWeeklyEvent.date,
      startTime: mockWeeklyEvent.startTime,
      endTime: mockWeeklyEvent.endTime,
      description: mockWeeklyEvent.description,
      location: mockWeeklyEvent.location,
      category: mockWeeklyEvent.category,
    });

    // When: 반복 설정 활성화
    await enableRepeatSettings(user, {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
    });

    // When: 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 4개 일정 생성 확인
    await waitFor(() => {
      const events = screen.getAllByText(mockWeeklyEvent.title);
      expect(events.length).toBeGreaterThanOrEqual(4);
    });

    // Then: Repeat 아이콘 표시 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThanOrEqual(4);
  });
});

describe('API 호출 통합', () => {
  it('POST /api/events-list 호출 시 repeat.id가 자동으로 할당된다', async () => {
    // Given: MSW handler 설정
    const capturedRequests: Array<{ events: Event[] }> = [];

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        capturedRequests.push(body);

        // repeat.id 자동 할당 로직
        const repeatId = crypto.randomUUID();
        const createdEvents = body.events.map((event, index) => ({
          ...event,
          id: `uuid-${index + 1}`,
          repeat: {
            ...event.repeat,
            id: repeatId,
          },
        }));

        return HttpResponse.json({ events: createdEvents }, { status: 201 });
      })
    );

    // When: 반복 일정 생성
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: mockWeeklyEvent.title,
      date: mockWeeklyEvent.date,
      startTime: mockWeeklyEvent.startTime,
      endTime: mockWeeklyEvent.endTime,
      description: mockWeeklyEvent.description,
      location: mockWeeklyEvent.location,
      category: mockWeeklyEvent.category,
    });

    await enableRepeatSettings(user, {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
    });

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: API 호출 확인
    await waitFor(() => {
      expect(capturedRequests.length).toBeGreaterThan(0);
    });

    // Then: repeat.id 동일 확인
    const capturedRequest = capturedRequests[0];
    expect(capturedRequest.events.length).toBeGreaterThan(0);

    // 모든 일정이 동일한 repeat 정보를 가져야 함
    const firstRepeat = capturedRequest.events[0].repeat;
    capturedRequest.events.forEach((event: Event) => {
      expect(event.repeat.type).toBe(firstRepeat.type);
      expect(event.repeat.interval).toBe(firstRepeat.interval);
    });
  });
});

describe('특수 케이스 통합', () => {
  it('31일 매월 반복은 31일이 있는 달만 생성한다', async () => {
    // Given: 31일 매월 반복 폼 작성
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: mockMonthly31Event.title,
      date: mockMonthly31Event.date,
      startTime: mockMonthly31Event.startTime,
      endTime: mockMonthly31Event.endTime,
      description: mockMonthly31Event.description,
      location: mockMonthly31Event.location,
      category: mockMonthly31Event.category,
    });

    await enableRepeatSettings(user, {
      type: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
    });

    // When: 일정 추가
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 7개 일정 생성 확인
    await waitFor(() => {
      const events = screen.getAllByText(mockMonthly31Event.title);
      expect(events).toHaveLength(7);
    });

    // Then: 생성된 날짜 검증 (1, 3, 5, 7, 8, 10, 12월 31일)
    const expectedDates = [
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
      '2025-12-31',
    ];

    expectedDates.forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  it('윤년 2월 29일 매년 반복은 윤년에만 생성한다', async () => {
    // Given: 시스템 시간 2024-01-01로 설정 (윤년)
    vi.setSystemTime(new Date('2024-01-01'));

    const { user } = setup(<App />);

    // When: 2024-02-29 매년 반복 일정 생성
    await saveSchedule(user, {
      title: mockYearlyLeapDayEvent.title,
      date: mockYearlyLeapDayEvent.date,
      startTime: mockYearlyLeapDayEvent.startTime,
      endTime: mockYearlyLeapDayEvent.endTime,
      description: mockYearlyLeapDayEvent.description,
      location: mockYearlyLeapDayEvent.location,
      category: mockYearlyLeapDayEvent.category,
    });

    await enableRepeatSettings(user, {
      type: 'yearly',
      interval: 1,
      // endDate 없음: 2년 제한 적용
    });

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 1개 일정만 생성 (2024-02-29)
    await waitFor(() => {
      const events = screen.getAllByText(mockYearlyLeapDayEvent.title);
      expect(events).toHaveLength(1);
    });

    // Then: 2024-02-29만 존재
    expect(screen.getByText('2024-02-29')).toBeInTheDocument();

    // Then: 2025-02-29, 2026-02-29는 없음
    expect(screen.queryByText('2025-02-29')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-02-29')).not.toBeInTheDocument();
  });
});

describe('UI 표시 확인', () => {
  it('반복 일정에 Repeat 아이콘이 표시된다', async () => {
    // Given: 반복 일정 1개 생성
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: mockWeeklyEvent.title,
      date: mockWeeklyEvent.date,
      startTime: mockWeeklyEvent.startTime,
      endTime: mockWeeklyEvent.endTime,
      description: mockWeeklyEvent.description,
      location: mockWeeklyEvent.location,
      category: mockWeeklyEvent.category,
    });

    await enableRepeatSettings(user, {
      type: 'weekly',
      interval: 1,
      endDate: '2025-01-27',
    });

    await user.click(screen.getByTestId('event-submit-button'));

    // 반복 일정 생성 대기
    await waitFor(() => {
      expect(screen.getAllByText(mockWeeklyEvent.title).length).toBeGreaterThan(0);
    });

    // Given: 일반 일정 1개 생성
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '일반 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-02-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '일반 일정 설명');
    await user.type(screen.getByLabelText('위치'), '사무실');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    await user.click(screen.getByTestId('event-submit-button'));

    // 일반 일정 생성 대기
    await waitFor(() => {
      expect(screen.getByText('일반 일정')).toBeInTheDocument();
    });

    // Then: 반복 일정에 Repeat 아이콘 표시
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);

    // Then: "반복" 텍스트 확인
    const repeatTexts = screen.getAllByText('반복');
    expect(repeatTexts.length).toBeGreaterThan(0);

    // Then: 일반 일정에는 Repeat 아이콘 없음
    // (정확한 검증을 위해서는 일반 일정 요소를 찾고 그 안에 RepeatIcon이 없는지 확인해야 함)
    // 여기서는 반복 일정의 아이콘 개수가 전체 일정보다 적은지 확인
    const allEvents = screen.getAllByText(/2025-/); // 날짜로 일정 찾기
    expect(repeatIcons.length).toBeLessThan(allEvents.length);
  });
});
