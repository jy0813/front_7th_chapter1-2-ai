import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '../App';
import { mockRecurringIconEvents } from './__fixtures__/mockRecurringIconEvents';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';

describe('반복 일정 아이콘 표시', () => {
  it('일반 일정(repeat.type: none)은 반복 아이콘을 표시하지 않는다', async () => {
    // Given: 일반 일정 데이터
    const { normalEvent } = mockRecurringIconEvents;
    setupMockHandlerCreation([normalEvent]);

    // When: App 렌더링
    render(<App />);

    // Then: 반복 아이콘이 DOM에 존재하지 않음
    // MUI Repeat 아이콘은 svg 요소로 렌더링되며, data-testid="RepeatIcon"를 가짐
    const repeatIcon = screen.queryByTestId('RepeatIcon');
    expect(repeatIcon).not.toBeInTheDocument();
  });

  it('매일 반복 일정(repeat.type: daily)은 반복 아이콘을 표시한다', async () => {
    // Given: 매일 반복 일정 데이터
    const { dailyEvent } = mockRecurringIconEvents;
    setupMockHandlerCreation([dailyEvent]);

    // When: App 렌더링
    render(<App />);

    // Then: 반복 아이콘이 DOM에 존재함
    const repeatIcon = await screen.findByTestId('RepeatIcon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('매주 반복 일정(repeat.type: weekly)은 반복 아이콘을 표시한다', async () => {
    // Given: 매주 반복 일정 데이터
    const { weeklyEvent } = mockRecurringIconEvents;
    setupMockHandlerCreation([weeklyEvent]);

    // When: App 렌더링
    render(<App />);

    // Then: 반복 아이콘이 DOM에 존재함
    const repeatIcon = await screen.findByTestId('RepeatIcon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('매월 반복 일정(repeat.type: monthly)은 반복 아이콘을 표시한다', async () => {
    // Given: 매월 반복 일정 데이터
    const { monthlyEvent } = mockRecurringIconEvents;
    setupMockHandlerCreation([monthlyEvent]);

    // When: App 렌더링
    render(<App />);

    // Then: 반복 아이콘이 DOM에 존재함
    const repeatIcon = await screen.findByTestId('RepeatIcon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('매년 반복 일정(repeat.type: yearly)은 반복 아이콘을 표시한다', async () => {
    // Given: 매년 반복 일정 데이터
    const { yearlyEvent } = mockRecurringIconEvents;
    setupMockHandlerCreation([yearlyEvent]);

    // When: App 렌더링
    render(<App />);

    // Then: 반복 아이콘이 DOM에 존재함
    const repeatIcon = await screen.findByTestId('RepeatIcon');
    expect(repeatIcon).toBeInTheDocument();
  });
});
