/**
 * 반복 일정 통합 테스트
 *
 * @see specs/09-recurring-events.md (통합 테스트 섹션)
 * @see claudedocs/02-test-design-recurring-events-integration.md (테스트 설계)
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

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
  // When: 반복 유형 선택
  // When: 반복 간격 입력
  // When: 반복 종료일 입력 (선택적)
};

describe('반복 일정 생성', () => {
  it('사용자가 반복 일정을 생성할 수 있다', async () => {
    // Given: App 렌더링
    // When: 일정 추가 폼 작성
    // When: 반복 설정 활성화
    // When: 반복 유형, 간격, 종료일 입력
    // When: 일정 추가 버튼 클릭
    // Then: 4개 일정 생성 확인
    // Then: Repeat 아이콘 표시 확인
  });
});

describe('API 호출 통합', () => {
  it('POST /api/events-list 호출 시 repeat.id가 자동으로 할당된다', async () => {
    // Given: MSW handler 설정
    // When: 반복 일정 생성
    // Then: API 호출 확인
    // Then: repeat.id 동일 확인
  });
});

describe('특수 케이스 통합', () => {
  it('31일 매월 반복은 31일이 있는 달만 생성한다', async () => {
    // Given: 31일 매월 반복 폼 작성
    // When: 일정 추가
    // Then: 7개 일정 생성 확인
    // Then: 생성된 날짜 검증 (1, 3, 5, 7, 8, 10, 12월 31일)
  });

  it('윤년 2월 29일 매년 반복은 윤년에만 생성한다', async () => {
    // Given: 시스템 시간 2024-01-01로 설정 (윤년)
    // When: 2024-02-29 매년 반복 일정 생성
    // Then: 1개 일정만 생성 (2024-02-29)
    // Then: 2025-02-29, 2026-02-29는 없음
  });
});

describe('UI 표시 확인', () => {
  it('반복 일정에 Repeat 아이콘이 표시된다', async () => {
    // Given: 반복 일정 1개 + 일반 일정 1개 생성
    // Then: 반복 일정에 Repeat 아이콘 표시
    // Then: 일반 일정에는 아이콘 없음
  });
});
