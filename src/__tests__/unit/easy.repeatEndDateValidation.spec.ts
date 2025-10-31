import { describe, it, expect } from 'vitest';

import { validateRepeatEndDate } from '../../utils/repeatEndDateValidation';
import { mockRepeatEndDateValidation } from '../__fixtures__/mockRepeatEndDateValidation';

describe('validateRepeatEndDate', () => {
  describe('정상 케이스', () => {
    it('종료 날짜가 없으면 유효하다 (선택적 필드)', () => {
      // Given
      const startDate = '2025-10-01';
      const endDate = undefined;

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('');
    });

    it('유효한 종료 날짜는 에러 없음 (시작일 이후, 2025-12-31 이전)', () => {
      // Given
      const startDate = '2025-10-01';
      const endDate = '2025-10-31';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('');
    });

    it('최대 날짜(2025-12-31)는 유효하다', () => {
      // Given
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('');
    });

    it('시작 날짜와 동일한 날짜는 유효하다', () => {
      // Given
      const startDate = '2025-10-31';
      const endDate = '2025-10-31';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('');
    });
  });

  describe('에러 케이스', () => {
    it('2025-12-31 초과 시 에러 메시지 반환', () => {
      // Given
      const startDate = '2025-01-01';
      const endDate = '2026-01-01';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('반복 종료일은 2025-12-31까지만 설정할 수 있습니다');
    });

    it('시작 날짜보다 이전 날짜는 에러 메시지 반환', () => {
      // Given
      const startDate = '2025-10-31';
      const endDate = '2025-10-01';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('반복 종료일은 시작일(2025-10-31) 이후여야 합니다');
    });

    it('잘못된 날짜 형식은 에러 메시지 반환', () => {
      // Given
      const startDate = '2025-10-01';
      const endDate = 'invalid-date';

      // When
      const result = validateRepeatEndDate(startDate, endDate);

      // Then
      expect(result).toBe('올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)');
    });
  });

  describe('Fixtures 기반 테스트', () => {
    it('모든 정상 케이스가 빈 문자열을 반환한다', () => {
      mockRepeatEndDateValidation.validCases.forEach((testCase) => {
        // When
        const result = validateRepeatEndDate(testCase.startDate, testCase.endDate);

        // Then
        expect(result).toBe(testCase.expected);
      });
    });

    it('모든 에러 케이스가 적절한 에러 메시지를 반환한다', () => {
      mockRepeatEndDateValidation.errorCases.forEach((testCase) => {
        // When
        const result = validateRepeatEndDate(testCase.startDate, testCase.endDate);

        // Then
        expect(result).toBe(testCase.expected);
      });
    });
  });
});
