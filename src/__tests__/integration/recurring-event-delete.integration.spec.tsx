import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it, beforeEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import {
  mockSingleDeleteSuccessResponse,
  tc1Scenario,
  tc2Scenario,
  tc3Scenario,
  tc4Scenario,
  tc5Scenario,
  tc6Scenario,
  tc7Scenario,
} from '../__fixtures__/mockRecurringEventDelete';

/**
 * 반복 일정 삭제 통합 테스트
 *
 * @see specs/11-recurring-event-delete.md
 */

const theme = createTheme();

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

describe('반복 일정 삭제 통합 테스트', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  /**
   * TC-1: 다이얼로그 표시 (반복 일정 감지)
   *
   * Given: 반복 일정이 화면에 렌더링되어 있다
   * When: 삭제 버튼을 클릭한다
   * Then: "반복 일정 삭제" 다이얼로그가 표시된다
   */
  it('TC-1: 반복 일정 삭제 시 다이얼로그가 표시된다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc1Scenario.initialEvents,
        });
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 첫 번째 반복 일정의 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // Then: 다이얼로그 표시 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc1Scenario.expectedDialogTitle)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(tc1Scenario.expectedDialogMessage)).toBeInTheDocument();

    // 버튼 확인
    tc1Scenario.expectedButtons.forEach((buttonName) => {
      expect(screen.getByRole('button', { name: new RegExp(buttonName, 'i') })).toBeInTheDocument();
    });
  });

  /**
   * TC-2: 일반 일정 삭제 시 다이얼로그 미표시
   *
   * Given: 일반 일정이 화면에 렌더링되어 있다
   * When: 삭제 버튼을 클릭한다
   * Then: 다이얼로그가 표시되지 않고 즉시 삭제된다
   */
  it('TC-2: 일반 일정 삭제 시 다이얼로그가 표시되지 않는다', async () => {
    // Given: 일반 일정 렌더링
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc2Scenario.initialEvents,
        });
      }),
      http.delete('/api/events/normal-event-1', () => {
        return HttpResponse.json(mockSingleDeleteSuccessResponse);
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitle = within(eventList).getByText('일반 회의');
        expect(eventTitle).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 삭제 버튼 클릭
    const eventTitle = within(eventList).getByText('일반 회의');
    const eventContainer = eventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // Then: 다이얼로그가 표시되지 않음
    await waitFor(
      () => {
        expect(screen.queryByText('반복 일정 삭제')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // 성공 메시지 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc2Scenario.expectedSuccessMessage)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  /**
   * TC-3: 단일 일정 삭제 ("예" 선택)
   *
   * Given: 반복 일정 시리즈 3개가 렌더링되어 있다
   * When: 첫 번째 일정의 삭제 버튼 클릭 후 "예" 버튼 클릭
   * Then: event-1만 삭제되고 event-2, event-3는 남아있음
   */
  it('TC-3: "예" 선택 시 단일 일정만 삭제된다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc3Scenario.initialEvents,
        });
      }),
      http.delete('/api/events/event-1', () => {
        return HttpResponse.json(tc3Scenario.apiResponse);
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 첫 번째 일정 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // 다이얼로그 대기
    await waitFor(
      () => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // "예" 버튼 클릭
    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    // Then: 성공 메시지 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc3Scenario.expectedSuccessMessage)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  /**
   * TC-4: 전체 시리즈 삭제 ("아니오" 선택)
   *
   * Given: 반복 일정 시리즈 3개가 렌더링되어 있다
   * When: 첫 번째 일정의 삭제 버튼 클릭 후 "아니오" 버튼 클릭
   * Then: event-1, event-2, event-3 모두 삭제됨
   */
  it('TC-4: "아니오" 선택 시 모든 반복 일정이 삭제된다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc4Scenario.initialEvents,
        });
      }),
      http.delete('/api/recurring-events/repeat-1', () => {
        return HttpResponse.json(tc4Scenario.apiResponse);
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 첫 번째 일정 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // 다이얼로그 대기
    await waitFor(
      () => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // "아니오" 버튼 클릭
    const noButton = screen.getByRole('button', { name: /아니오/i });
    await user.click(noButton);

    // Then: 성공 메시지 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc4Scenario.expectedSuccessMessage)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  /**
   * TC-5: 취소 버튼
   *
   * Given: 반복 일정이 렌더링되어 있다
   * When: 삭제 버튼 클릭 후 "취소" 버튼 클릭
   * Then: 다이얼로그가 닫히고 API 호출이 발생하지 않음
   */
  it('TC-5: "취소" 버튼 클릭 시 일정이 삭제되지 않는다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc5Scenario.initialEvents,
        });
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // 다이얼로그 대기
    await waitFor(
      () => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // "취소" 버튼 클릭
    const cancelButton = screen.getByRole('button', { name: /취소/i });
    await user.click(cancelButton);

    // Then: 다이얼로그가 닫힘
    await waitFor(
      () => {
        expect(screen.queryByText('반복 일정 삭제')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // 일정이 여전히 존재함 (3개)
    const remainingEvents = within(eventList).getAllByText('매일 회의');
    expect(remainingEvents).toHaveLength(3);
  });

  /**
   * TC-6: 단일 삭제 API 실패
   *
   * Given: 반복 일정이 렌더링되어 있고 API가 400 에러를 반환한다
   * When: 삭제 버튼 클릭 후 "예" 버튼 클릭
   * Then: 에러 메시지가 표시되고 일정이 삭제되지 않음
   */
  it('TC-6: 단일 삭제 API 실패 시 에러 메시지가 표시된다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링 + API 에러
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc6Scenario.initialEvents,
        });
      }),
      http.delete('/api/events/event-1', () => {
        return HttpResponse.json(tc6Scenario.apiResponse, {
          status: tc6Scenario.apiStatusCode,
        });
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // 다이얼로그 대기
    await waitFor(
      () => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // "예" 버튼 클릭
    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    // Then: 에러 메시지 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc6Scenario.expectedErrorMessage)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 일정이 삭제되지 않음 (3개 유지)
    const remainingEvents = within(eventList).getAllByText('매일 회의');
    expect(remainingEvents).toHaveLength(3);
  });

  /**
   * TC-7: 전체 삭제 API 실패
   *
   * Given: 반복 일정이 렌더링되어 있고 API가 500 에러를 반환한다
   * When: 삭제 버튼 클릭 후 "아니오" 버튼 클릭
   * Then: 에러 메시지가 표시되고 일정이 삭제되지 않음
   */
  it('TC-7: 전체 삭제 API 실패 시 에러 메시지가 표시된다', async () => {
    // Given: 반복 일정 시리즈 3개 렌더링 + API 에러
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: tc7Scenario.initialEvents,
        });
      }),
      http.delete('/api/recurring-events/repeat-1', () => {
        return HttpResponse.json(tc7Scenario.apiResponse, {
          status: tc7Scenario.apiStatusCode,
        });
      })
    );

    const { user } = setup(<App />);

    // 이벤트 목록 대기
    const eventList = await screen.findByTestId('event-list');

    await waitFor(
      () => {
        const eventTitles = within(eventList).getAllByText('매일 회의');
        expect(eventTitles[0]).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // When: 삭제 버튼 클릭
    const eventTitleElements = within(eventList).getAllByText('매일 회의');
    const firstEventTitle = eventTitleElements[0];
    const eventContainer = firstEventTitle.closest('[class*="MuiBox-root"]');
    const deleteButton = within(eventContainer! as HTMLElement).getByRole('button', {
      name: /삭제/i,
    });

    await user.click(deleteButton);

    // 다이얼로그 대기
    await waitFor(
      () => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // "아니오" 버튼 클릭
    const noButton = screen.getByRole('button', { name: /아니오/i });
    await user.click(noButton);

    // Then: 에러 메시지 확인
    await waitFor(
      () => {
        expect(screen.getByText(tc7Scenario.expectedErrorMessage)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 일정이 삭제되지 않음 (3개 유지)
    const remainingEvents = within(eventList).getAllByText('매일 회의');
    expect(remainingEvents).toHaveLength(3);
  });
});
