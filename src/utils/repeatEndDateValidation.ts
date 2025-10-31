/**
 * 반복 종료 날짜 검증 유틸리티
 *
 * @module repeatEndDateValidation
 * @description 반복 일정의 종료 날짜를 검증하고 에러 메시지를 반환합니다.
 */

/**
 * 반복 종료 날짜 최대 제한 (2025-12-31)
 */
const MAX_REPEAT_END_DATE = '2025-12-31';

/**
 * 날짜 형식 검증 정규식 (YYYY-MM-DD)
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 반복 종료 날짜 통합 검증
 *
 * @param startDate - 일정 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD, optional)
 * @returns 에러 메시지 (유효하면 빈 문자열)
 *
 * @example
 * // 정상 케이스
 * validateRepeatEndDate('2025-10-01', '2025-10-31'); // ''
 * validateRepeatEndDate('2025-10-01', undefined); // ''
 *
 * // 에러 케이스
 * validateRepeatEndDate('2025-10-01', '2026-01-01'); // '반복 종료일은 2025-12-31까지만 설정할 수 있습니다'
 * validateRepeatEndDate('2025-10-31', '2025-10-01'); // '반복 종료일은 시작일(2025-10-31) 이후여야 합니다'
 */
export function validateRepeatEndDate(startDate: string, endDate?: string): string {
  // 1. endDate가 없으면 유효 (선택적 필드)
  if (!endDate) {
    return '';
  }

  // 2. 날짜 형식 검증
  if (!DATE_FORMAT_REGEX.test(endDate) || isNaN(Date.parse(endDate))) {
    return '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)';
  }

  // 3. 시작 날짜 이후 검증
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    return `반복 종료일은 시작일(${startDate}) 이후여야 합니다`;
  }

  // 4. 최대 날짜 제한 검증
  const maxDate = new Date(MAX_REPEAT_END_DATE);
  if (end > maxDate) {
    return `반복 종료일은 ${MAX_REPEAT_END_DATE}까지만 설정할 수 있습니다`;
  }

  return '';
}
