/**
 * 반복 종료 날짜 검증 테스트용 Mock 데이터
 *
 * 목적:
 * - validateRepeatEndDate 함수 테스트 데이터
 * - 정상 케이스 vs 에러 케이스 구분
 * - 경계값 테스트 (2025-12-31, 시작일 동일)
 */

export const mockRepeatEndDateValidation = {
  /**
   * 정상 케이스: 유효한 종료 날짜
   */
  validCases: [
    {
      description: '유효한 종료 날짜 (시작일 이후, 최대일 이전)',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      expected: '',
    },
    {
      description: '종료 날짜 없음 (선택적 필드)',
      startDate: '2025-10-01',
      endDate: undefined,
      expected: '',
    },
    {
      description: '최대 날짜 (2025-12-31)',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      expected: '',
    },
    {
      description: '시작 날짜와 동일',
      startDate: '2025-10-31',
      endDate: '2025-10-31',
      expected: '',
    },
  ],

  /**
   * 에러 케이스: 유효하지 않은 종료 날짜
   */
  errorCases: [
    {
      description: '최대 날짜 초과 (2026-01-01)',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      expected: '반복 종료일은 2025-12-31까지만 설정할 수 있습니다',
    },
    {
      description: '시작 날짜보다 이전',
      startDate: '2025-10-31',
      endDate: '2025-10-01',
      expected: '반복 종료일은 시작일(2025-10-31) 이후여야 합니다',
    },
    {
      description: '잘못된 날짜 형식',
      startDate: '2025-10-01',
      endDate: 'invalid-date',
      expected: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)',
    },
  ],
};
