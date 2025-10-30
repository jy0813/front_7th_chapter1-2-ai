/**
 * 윤년 여부를 판단합니다.
 * 4로 나누어떨어지고 (100으로 나누어떨어지지 않거나 400으로 나누어떨어짐)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 매일 반복 날짜 생성
 */
export function generateDailyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 매주 반복 날짜 생성 (같은 요일)
 */
export function generateWeeklyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

/**
 * 특정 월에 해당 날짜가 존재하는지 확인
 */
function isDayValidInMonth(year: number, month: number, day: number): boolean {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return day <= lastDay;
}

/**
 * 매월 반복 날짜 생성 (31일 특수 케이스 처리)
 */
export function generateMonthlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = start.getDate();

  let year = start.getFullYear();
  let month = start.getMonth();

  while (true) {
    const currentDate = new Date(year, month, 1);
    if (currentDate > end) break;

    // 해당 월에 targetDay가 존재하는지 확인
    if (isDayValidInMonth(year, month, targetDay)) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(targetDay).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      // endDate를 넘지 않는 경우만 추가
      if (new Date(dateStr) <= end) {
        dates.push(dateStr);
      }
    }

    // 다음 달로 이동
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return dates;
}

/**
 * 매년 반복 날짜 생성 (윤년 2월 29일 특수 케이스 처리)
 */
export function generateYearlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetMonth = start.getMonth();
  const targetDay = start.getDate();

  // 2월 29일 윤년 케이스 확인
  const isLeapDayCase = targetMonth === 1 && targetDay === 29;

  let year = start.getFullYear();

  while (true) {
    // 윤년 2월 29일 케이스: 윤년만 추가
    if (isLeapDayCase) {
      if (isLeapYear(year)) {
        const dateStr = `${year}-02-29`;
        if (new Date(dateStr) <= end) {
          dates.push(dateStr);
        } else {
          break;
        }
      }
    } else {
      // 일반 케이스: 매년 추가
      const monthStr = String(targetMonth + 1).padStart(2, '0');
      const dayStr = String(targetDay).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      if (new Date(dateStr) <= end) {
        dates.push(dateStr);
      } else {
        break;
      }
    }

    year++;
  }

  return dates;
}
