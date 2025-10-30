import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
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

// ! Hard 여기 제공 안함
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

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 일정 기능', () => {
  describe('반복 유형 선택 UI', () => {
    it('반복 설정 체크 시 반복 유형 Select 표시', async () => {
      // Given: 일정 생성 폼 렌더링
      const user = userEvent.setup();
      const { container } = render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      // 일정 추가 버튼 클릭
      await user.click(screen.getAllByText('일정 추가')[0]);

      // When: "반복 설정" 체크박스 클릭
      // 주석: App.tsx 441-478줄이 주석 해제되어야 함
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
      await user.click(repeatCheckbox);

      // Then: 반복 유형 Select 표시
      expect(screen.getByRole('combobox', { name: /반복 유형/i })).toBeInTheDocument();
    });

    it('반복 유형 Select에 4가지 옵션 표시', async () => {
      // Given: 반복 설정 활성화
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
      await user.click(repeatCheckbox);

      // When: 반복 유형 Select 클릭
      const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
      await user.click(repeatTypeSelect);

      // Then: 매일, 매주, 매월, 매년 옵션 표시
      expect(screen.getByRole('option', { name: /매일/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /매주/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /매월/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /매년/i })).toBeInTheDocument();
    });

    it('반복 설정 체크 해제 시 반복 UI 숨김', async () => {
      // Given: 반복 설정 활성화 상태
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
      await user.click(repeatCheckbox);
      expect(screen.getByRole('combobox', { name: /반복 유형/i })).toBeInTheDocument();

      // When: 반복 설정 체크 해제
      await user.click(repeatCheckbox);

      // Then: 반복 유형 Select 숨김
      expect(screen.queryByRole('combobox', { name: /반복 유형/i })).not.toBeInTheDocument();
    });
  });

  describe('반복 일정 생성', () => {
    it('매일 반복 일정 생성 시 여러 이벤트 생성', async () => {
      // Given: 2025-01-01 매일 반복 (종료: 2025-01-03)
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      // 일정 입력
      await user.type(screen.getByLabelText(/제목/i), '매일 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-01');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '11:00');

      // 반복 설정
      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'daily');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-01-03');

      // When: 일정 추가 버튼 클릭
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: POST /api/events-list 호출 (3개 이벤트)
      await waitFor(() => {
        expect(screen.getByText(/매일 회의/i)).toBeInTheDocument();
      });
      // MSW 핸들러로 3개 이벤트 생성 확인
    });

    it('매주 반복 일정 생성', async () => {
      // Given: 2025-01-06 (월요일) 매주 반복
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '주간 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-06');
      await user.type(screen.getByLabelText(/시작 시간/i), '14:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '15:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'weekly');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-01-27');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 매주 월요일 (1/6, 1/13, 1/20, 1/27) 4개 생성
      await waitFor(() => {
        expect(screen.getByText(/주간 회의/i)).toBeInTheDocument();
      });
    });

    it('매월 반복 일정 생성 (일반 케이스)', async () => {
      // Given: 2025-01-15 매월 반복
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '월간 리뷰');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-15');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '11:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'monthly');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-04-15');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 1월, 2월, 3월, 4월 (4개 생성)
      await waitFor(() => {
        expect(screen.getByText(/월간 리뷰/i)).toBeInTheDocument();
      });
    });

    it('⭐️ 31일 매월 반복은 31일이 없는 달 건너뜀', async () => {
      // Given: 2025-01-31 매월 반복
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '월말 보고');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-31');
      await user.type(screen.getByLabelText(/시작 시간/i), '17:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '18:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'monthly');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-06-30');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 1월, 3월, 5월만 생성 (2월, 4월 건너뜀)
      await waitFor(() => {
        expect(screen.getByText(/월말 보고/i)).toBeInTheDocument();
      });
      // MSW 핸들러로 3개만 생성되었는지 확인
    });

    it('매년 반복 일정 생성 (일반 케이스)', async () => {
      // Given: 2025-01-15 매년 반복
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '연례 행사');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-15');
      await user.type(screen.getByLabelText(/시작 시간/i), '09:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '10:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'yearly');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2027-12-31');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 2025, 2026, 2027 (3개 생성)
      await waitFor(() => {
        expect(screen.getByText(/연례 행사/i)).toBeInTheDocument();
      });
    });

    it('⭐️ 윤년 2월 29일 매년 반복은 평년 건너뜀', async () => {
      // Given: 2024-02-29 매년 반복
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '윤년 행사');
      await user.type(screen.getByLabelText(/날짜/i), '2024-02-29');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '11:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'yearly');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2030-12-31');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 2024, 2028만 생성 (2025~2027, 2029~2030 건너뜀)
      await waitFor(() => {
        expect(screen.getByText(/윤년 행사/i)).toBeInTheDocument();
      });
    });

    it('반복 간격 2로 설정 시 격주로 일정 생성', async () => {
      // Given: 2025-01-06 매주 반복 (간격 2)
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '격주 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-06');
      await user.type(screen.getByLabelText(/시작 시간/i), '14:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '15:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'weekly');
      await user.type(screen.getByLabelText(/반복 간격/i), '2');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-02-03');

      // When
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 격주 월요일 (1/6, 1/20, 2/3) 3개 생성
      await waitFor(() => {
        expect(screen.getByText(/격주 회의/i)).toBeInTheDocument();
      });
    });
  });

  describe('반복 일정 표시', () => {
    it('반복 일정에 Repeat 아이콘 표시', async () => {
      // Given: 매일 반복 일정 생성
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '반복 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-01');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '11:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'daily');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-01-03');

      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: Repeat 아이콘이 표시됨
      await waitFor(() => {
        const repeatIcon = screen.getByTestId('repeat-icon'); // Material-UI Repeat 아이콘
        expect(repeatIcon).toBeInTheDocument();
      });
    });

    it('일반 일정에는 Repeat 아이콘 표시 안함', async () => {
      // Given: 일반 일정 (반복 없음)
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '일반 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-15');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '11:00');
      // 반복 설정 체크 안함

      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: Repeat 아이콘 없음
      await waitFor(() => {
        expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('일정 겹침 무시', () => {
    it('⭐️ 반복 일정 생성 시 겹침 경고 없이 즉시 생성', async () => {
      // Given: 2025-01-01 10:00-12:00 기존 일정
      const user = userEvent.setup();
      render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      );

      await user.click(screen.getAllByText('일정 추가')[0]);

      // 기존 일정 생성
      await user.type(screen.getByLabelText(/제목/i), '기존 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-01');
      await user.type(screen.getByLabelText(/시작 시간/i), '10:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '12:00');
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // And: 2025-01-01 11:00-13:00 매일 반복 생성 (겹침)
      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText(/제목/i), '반복 회의');
      await user.type(screen.getByLabelText(/날짜/i), '2025-01-01');
      await user.type(screen.getByLabelText(/시작 시간/i), '11:00');
      await user.type(screen.getByLabelText(/종료 시간/i), '13:00');

      await user.click(screen.getByRole('checkbox', { name: /반복 설정/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: /반복 유형/i }), 'daily');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-01-03');

      // When: 일정 추가 (겹침 있음)
      await user.click(screen.getByRole('button', { name: /일정 추가/i }));

      // Then: 겹침 경고 다이얼로그 표시 안함
      expect(screen.queryByRole('dialog', { name: /일정 겹침 경고/i })).not.toBeInTheDocument();

      // And: 즉시 반복 일정 생성
      await waitFor(() => {
        expect(screen.getByText(/반복 회의/i)).toBeInTheDocument();
      });
    });
  });
});
