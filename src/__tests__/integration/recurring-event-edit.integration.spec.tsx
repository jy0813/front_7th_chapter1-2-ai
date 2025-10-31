import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';
import {
  mockRecurringEventSeries,
  mockSingleRecurringEvent,
  mockNormalEvent,
  mockSingleEditedEvent,
  mockAllEditedEvents,
  mockApiResponses,
} from '../__fixtures__/mockRecurringEventEdit';

describe('반복 일정 수정', () => {
  describe('TC-1: 다이얼로그 표시 (반복 일정 감지)', () => {
    it('반복 일정 수정 시 "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다', async () => {
      // Given: 반복 일정이 화면에 렌더링되어 있다
      const mockEvents: Event[] = [mockSingleRecurringEvent];
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      render(<App />);
      const user = userEvent.setup();

      // 캘린더에서 일정 표시 대기
      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      // When: 사용자가 해당 일정의 수정 버튼을 클릭한다
      const eventCell = screen.getByText('매일 회의').closest('div');
      const editButton = within(eventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      // Then: 다이얼로그가 표시됨
      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      // "예", "아니오", "취소" 버튼 존재 확인
      expect(
        screen.getByRole('button', { name: /^예$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^아니오$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /취소/i })
      ).toBeInTheDocument();
    });
  });

  describe('TC-2: 일반 일정 수정 시 다이얼로그 미표시', () => {
    it('일반 일정(repeat.type: none) 수정 시 다이얼로그가 표시되지 않는다', async () => {
      // Given: 일반 일정이 화면에 렌더링되어 있다
      const mockEvents: Event[] = [mockNormalEvent];
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      render(<App />);
      const user = userEvent.setup();

      // 캘린더에서 일정 표시 대기
      await waitFor(() => {
        expect(screen.getByText('일반 회의')).toBeInTheDocument();
      });

      // When: 사용자가 해당 일정의 수정 버튼을 클릭한다
      const eventCell = screen.getByText('일반 회의').closest('div');
      const editButton = within(eventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      // Then: 다이얼로그가 표시되지 않음
      await waitFor(() => {
        expect(
          screen.queryByText('해당 일정만 수정하시겠어요?')
        ).not.toBeInTheDocument();
      });

      // 바로 수정 모드로 진입 (일정 추가 다이얼로그 표시)
      expect(screen.getByText('일정 추가')).toBeInTheDocument();
    });
  });

  describe('TC-3, TC-4: 단일 수정 ("예" 선택)', () => {
    it('단일 수정 후 해당 일정만 수정되고 repeat.type이 "none"으로 변경된다', async () => {
      // Given: 반복 일정 시리즈가 렌더링되어 있다
      const mockEvents: Event[] = [...mockRecurringEventSeries];
      let apiCalled = false;
      let requestBody: any = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          apiCalled = true;
          requestBody = await request.json();

          // 단일 수정: repeat.type을 'none'으로 변경
          const index = mockEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            mockEvents[index] = {
              ...mockEvents[index],
              ...requestBody,
              repeat: { type: 'none', interval: 0 },
            };
          }

          return HttpResponse.json(mockEvents[index]);
        })
      );

      render(<App />);
      const user = userEvent.setup();

      // 첫 번째 일정 클릭하여 수정 다이얼로그 열기
      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      const firstEventCell = screen.getAllByText('매일 회의')[0].closest('div');
      const editButton = within(firstEventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      // 반복 일정 수정 다이얼로그 대기
      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      // When: "예" 버튼을 클릭한다
      const yesButton = screen.getByRole('button', { name: /^예$/ });
      await user.click(yesButton);

      // 일정 수정 폼이 표시됨
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      // 제목을 "특별 회의"로 변경하고 저장
      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: API 호출 확인
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });

      // repeat.type이 'none'으로 설정되었는지 확인
      expect(requestBody.repeat.type).toBe('none');
      expect(requestBody.repeat.interval).toBe(0);

      // 해당 일정만 제목이 변경됨
      await waitFor(() => {
        expect(screen.getByText('특별 회의')).toBeInTheDocument();
      });

      // 다른 일정은 여전히 "매일 회의"
      const remainingEvents = screen.getAllByText('매일 회의');
      expect(remainingEvents.length).toBe(2); // 원래 3개 중 1개만 변경
    });

    it('단일 수정 후 해당 일정의 Repeat 아이콘이 사라진다', async () => {
      // Given: 반복 일정 시리즈가 렌더링되어 있다
      const mockEvents: Event[] = [...mockRecurringEventSeries];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const requestBody = await request.json();

          const index = mockEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            mockEvents[index] = {
              ...mockEvents[index],
              ...requestBody,
              repeat: { type: 'none', interval: 0 },
            };
          }

          return HttpResponse.json(mockEvents[index]);
        })
      );

      render(<App />);
      const user = userEvent.setup();

      // 초기 상태: Repeat 아이콘 3개 존재
      await waitFor(() => {
        const initialIcons = screen.getAllByTestId('RepeatIcon');
        expect(initialIcons.length).toBe(3);
      });

      // 첫 번째 일정 수정
      const firstEventCell = screen.getAllByText('매일 회의')[0].closest('div');
      const editButton = within(firstEventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /^예$/ });
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: Repeat 아이콘이 2개로 감소
      await waitFor(() => {
        const remainingIcons = screen.getAllByTestId('RepeatIcon');
        expect(remainingIcons.length).toBe(2);
      });
    });
  });

  describe('TC-5, TC-6: 전체 수정 ("아니오" 선택)', () => {
    it('전체 수정 후 같은 repeat.id를 가진 모든 일정이 수정되고 repeat 정보가 유지된다', async () => {
      // Given: 반복 일정 시리즈가 렌더링되어 있다
      const mockEvents: Event[] = [...mockRecurringEventSeries];
      let apiCalled = false;
      let requestBody: any = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put(
          '/api/recurring-events/:repeatId',
          async ({ params, request }) => {
            const { repeatId } = params;
            apiCalled = true;
            requestBody = await request.json();

            // 같은 repeat.id를 가진 모든 일정 수정
            mockEvents.forEach((event, index) => {
              if (event.repeat.id === repeatId) {
                mockEvents[index] = {
                  ...event,
                  ...requestBody,
                  // date는 제외 (각 일정의 날짜 유지)
                  date: event.date,
                  // repeat는 유지
                  repeat: event.repeat,
                };
              }
            });

            const updatedEvents = mockEvents.filter(
              (e) => e.repeat.id === repeatId
            );

            return HttpResponse.json({
              updatedCount: updatedEvents.length,
              events: updatedEvents,
            });
          }
        )
      );

      render(<App />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      const firstEventCell = screen.getAllByText('매일 회의')[0].closest('div');
      const editButton = within(firstEventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      // When: "아니오" 버튼을 클릭한다
      const noButton = screen.getByRole('button', { name: /^아니오$/ });
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      // 제목을 "업데이트된 회의"로 변경하고 저장
      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '업데이트된 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: API 호출 확인
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });

      // 요청 body에 date, repeat가 제외되었는지 확인
      expect(requestBody.date).toBeUndefined();
      expect(requestBody.repeat).toBeUndefined();

      // 모든 일정의 제목이 "업데이트된 회의"로 변경됨
      await waitFor(() => {
        const updatedEvents = screen.getAllByText('업데이트된 회의');
        expect(updatedEvents.length).toBe(3);
      });
    });

    it('전체 수정 후 모든 반복 일정의 Repeat 아이콘이 유지된다', async () => {
      // Given: 반복 일정 시리즈가 렌더링되어 있다
      const mockEvents: Event[] = [...mockRecurringEventSeries];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put(
          '/api/recurring-events/:repeatId',
          async ({ params, request }) => {
            const { repeatId } = params;
            const requestBody = await request.json();

            mockEvents.forEach((event, index) => {
              if (event.repeat.id === repeatId) {
                mockEvents[index] = {
                  ...event,
                  ...requestBody,
                  date: event.date,
                  repeat: event.repeat,
                };
              }
            });

            const updatedEvents = mockEvents.filter(
              (e) => e.repeat.id === repeatId
            );

            return HttpResponse.json({
              updatedCount: updatedEvents.length,
              events: updatedEvents,
            });
          }
        )
      );

      render(<App />);
      const user = userEvent.setup();

      // 초기 상태: Repeat 아이콘 3개 존재
      await waitFor(() => {
        const initialIcons = screen.getAllByTestId('RepeatIcon');
        expect(initialIcons.length).toBe(3);
      });

      const firstEventCell = screen.getAllByText('매일 회의')[0].closest('div');
      const editButton = within(firstEventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: /^아니오$/ });
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '업데이트된 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: Repeat 아이콘이 여전히 3개
      await waitFor(() => {
        const remainingIcons = screen.getAllByTestId('RepeatIcon');
        expect(remainingIcons.length).toBe(3);
      });
    });
  });

  describe('TC-7: 취소 버튼', () => {
    it('취소 버튼 클릭 시 다이얼로그가 닫히고 API 호출이 발생하지 않는다', async () => {
      // Given: 반복 일정 수정 다이얼로그가 표시되어 있다
      const mockEvents: Event[] = [mockSingleRecurringEvent];
      let apiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', () => {
          apiCalled = true;
          return HttpResponse.json({});
        }),
        http.put('/api/recurring-events/:repeatId', () => {
          apiCalled = true;
          return HttpResponse.json({});
        })
      );

      render(<App />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      const eventCell = screen.getByText('매일 회의').closest('div');
      const editButton = within(eventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      // When: "취소" 버튼을 클릭한다
      const cancelButton = screen.getByRole('button', { name: /취소/i });
      await user.click(cancelButton);

      // Then: 다이얼로그가 닫힘
      await waitFor(() => {
        expect(
          screen.queryByText('해당 일정만 수정하시겠어요?')
        ).not.toBeInTheDocument();
      });

      // API 호출이 발생하지 않음
      expect(apiCalled).toBe(false);
    });
  });

  describe('TC-8, TC-9: 에러 처리', () => {
    it('단일 수정 API 실패 시 "일정 수정에 실패했습니다" 메시지가 표시된다', async () => {
      // Given: 반복 일정이 렌더링되어 있고, API가 실패한다
      const mockEvents: Event[] = [mockSingleRecurringEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', () => {
          return HttpResponse.json(
            { message: mockApiResponses.singleEdit.error.message },
            { status: mockApiResponses.singleEdit.error.status }
          );
        })
      );

      render(<App />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      const eventCell = screen.getByText('매일 회의').closest('div');
      const editButton = within(eventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /^예$/ });
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: 에러 메시지가 표시됨
      await waitFor(() => {
        expect(
          screen.getByText('일정 수정에 실패했습니다')
        ).toBeInTheDocument();
      });
    });

    it('전체 수정 API 실패 시 "반복 일정 수정에 실패했습니다" 메시지가 표시된다', async () => {
      // Given: 반복 일정이 렌더링되어 있고, API가 실패한다
      const mockEvents: Event[] = [mockSingleRecurringEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json(
            { message: mockApiResponses.allEdit.error.message },
            { status: mockApiResponses.allEdit.error.status }
          );
        })
      );

      render(<App />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('매일 회의')).toBeInTheDocument();
      });

      const eventCell = screen.getByText('매일 회의').closest('div');
      const editButton = within(eventCell!).getByRole('button', {
        name: /수정/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByText('해당 일정만 수정하시겠어요?')
        ).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: /^아니오$/ });
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '업데이트된 회의');

      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // Then: 에러 메시지가 표시됨
      await waitFor(() => {
        expect(
          screen.getByText('반복 일정 수정에 실패했습니다')
        ).toBeInTheDocument();
      });
    });
  });
});
