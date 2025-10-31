# 테스트 구조 설계

**Agent**: Agent 2 (Test Design)
**기능명**: repeat-end-date-validation (반복 종료 날짜 검증)
**작성일**: 2025-10-31
**상태**: ✅ 완료

---

## 1. 명세 및 규칙 확인

### 참조 문서
- [x] specs/09-repeat-end-date-validation.md 읽기
- [x] `rules/tdd-principles.md` 읽기
- [x] `rules/testing-library-queries.md` 읽기
- [x] 기존 테스트 파일 패턴 확인

---

## 2. 명세 품질 검증 (v2.8.0)

### 1. ✅ 패턴 준수
- [x] Given-When-Then 패턴이 일관되게 적용되었는가?
  - **근거 (사실)**: 모든 시나리오가 Given-When-Then 형식으로 작성됨
  - **근거 (평가)**: 6개 시나리오 모두 패턴 준수
  - **근거 (대안)**: 피드백 불필요

### 2. ✅ 예시 포함
- [x] 구체적인 입력값과 예시 결과값이 포함되었는가?
  - **근거 (사실)**: 각 시나리오마다 구체적인 날짜와 예상 에러 메시지 명시
  - **근거 (평가)**: 테스트 데이터 생성에 충분한 정보
  - **근거 (대안)**: 피드백 불필요

### 3. ✅ 엣지 케이스
- [x] 경계 조건과 예외 상황이 명시되었는가?
  - **근거 (사실)**: 최대 날짜 경계(2025-12-31), 시작 날짜 동일, 선택적 필드(undefined) 포함
  - **근거 (평가)**: 충분한 엣지 케이스 커버
  - **근거 (대안)**: 피드백 불필요

### 4. ✅ 테스트 가능
- [x] 명세 수준이 테스트 케이스 작성 가능한 수준인가?
  - **근거 (사실)**: 함수 시그니처, 입력값, 출력값 모두 명확
  - **근거 (평가)**: Agent 3이 즉시 테스트 작성 가능
  - **근거 (대안)**: 피드백 불필요

### 5. ✅ 범위 준수
- [x] 명세가 요구사항 범위를 벗어나지 않았는가?
  - **근거 (사실)**: 반복 종료 날짜 검증에만 집중, UI 구현은 별도
  - **근거 (평가)**: 범위 준수
  - **근거 (대안)**: 피드백 불필요

**✅ 명세 품질 검증 통과**: Agent 3으로 즉시 진행 가능

---

## 3. 테스트 구조 설계

### 단위 테스트 (Unit Tests)
**파일**: `src/__tests__/unit/easy.repeatEndDateValidation.spec.ts`

**테스트 케이스**:
1. `describe('validateRepeatEndDate', () => {...})`
   - `it('종료 날짜가 없으면 유효하다 (선택적 필드)', () => {...})`
   - `it('유효한 종료 날짜는 에러 없음 (시작일 이후, 2025-12-31 이전)', () => {...})`
   - `it('최대 날짜(2025-12-31)는 유효하다', () => {...})`
   - `it('2025-12-31 초과 시 에러 메시지 반환', () => {...})`
   - `it('시작 날짜보다 이전 날짜는 에러 메시지 반환', () => {...})`
   - `it('잘못된 날짜 형식은 에러 메시지 반환', () => {...})`
   - `it('시작 날짜와 동일한 날짜는 유효하다', () => {...})`

**참고**: 이 기능은 순수 함수 검증이므로 단위 테스트로 충분합니다.
통합 테스트는 불필요합니다.

---

## 4. 테스트 데이터 준비

### Fixtures
**파일**: `src/__tests__/__fixtures__/mockRepeatEndDateValidation.ts`

**데이터**:
```typescript
export const mockRepeatEndDateValidation = {
  // 정상 케이스
  validCases: [
    {
      description: '유효한 종료 날짜 (시작일 이후, 최대일 이전)',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      expected: ''
    },
    {
      description: '종료 날짜 없음 (선택적 필드)',
      startDate: '2025-10-01',
      endDate: undefined,
      expected: ''
    },
    {
      description: '최대 날짜 (2025-12-31)',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      expected: ''
    },
    {
      description: '시작 날짜와 동일',
      startDate: '2025-10-31',
      endDate: '2025-10-31',
      expected: ''
    }
  ],

  // 에러 케이스
  errorCases: [
    {
      description: '최대 날짜 초과 (2026-01-01)',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      expected: '반복 종료일은 2025-12-31까지만 설정할 수 있습니다'
    },
    {
      description: '시작 날짜보다 이전',
      startDate: '2025-10-31',
      endDate: '2025-10-01',
      expected: '반복 종료일은 시작일(2025-10-31) 이후여야 합니다'
    },
    {
      description: '잘못된 날짜 형식',
      startDate: '2025-10-01',
      endDate: 'invalid-date',
      expected: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'
    }
  ]
};
```

---

## 5. 테스트 케이스 목록

### 기능: 반복 종료 날짜 검증
- [x] 정상 케이스 1: 종료 날짜 없음
  - Given: startDate='2025-10-01', endDate=undefined
  - When: validateRepeatEndDate 호출
  - Then: 빈 문자열 반환 (유효)

- [x] 정상 케이스 2: 유효한 종료 날짜
  - Given: startDate='2025-10-01', endDate='2025-10-31'
  - When: validateRepeatEndDate 호출
  - Then: 빈 문자열 반환 (유효)

- [x] 정상 케이스 3: 최대 날짜 (2025-12-31)
  - Given: startDate='2025-01-01', endDate='2025-12-31'
  - When: validateRepeatEndDate 호출
  - Then: 빈 문자열 반환 (유효)

- [x] 정상 케이스 4: 시작 날짜와 동일
  - Given: startDate='2025-10-31', endDate='2025-10-31'
  - When: validateRepeatEndDate 호출
  - Then: 빈 문자열 반환 (유효)

- [x] 에러 케이스 1: 최대 날짜 초과
  - Given: startDate='2025-01-01', endDate='2026-01-01'
  - When: validateRepeatEndDate 호출
  - Then: '반복 종료일은 2025-12-31까지만 설정할 수 있습니다' 반환

- [x] 에러 케이스 2: 시작 날짜보다 이전
  - Given: startDate='2025-10-31', endDate='2025-10-01'
  - When: validateRepeatEndDate 호출
  - Then: '반복 종료일은 시작일(2025-10-31) 이후여야 합니다' 반환

- [x] 에러 케이스 3: 잘못된 날짜 형식
  - Given: startDate='2025-10-01', endDate='invalid-date'
  - When: validateRepeatEndDate 호출
  - Then: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)' 반환

---

## 6. 다음 단계

**Agent 3에게 전달**:
- 테스트 구조 설계: 이 문서
- 테스트 데이터: `src/__tests__/__fixtures__/mockRepeatEndDateValidation.ts`
- Red Phase 시작 가능

**Git 커밋**:
```bash
git add src/__tests__/__fixtures__/mockRepeatEndDateValidation.ts
git add claudedocs/02-test-design-repeat-end-date-validation.md
git commit -m "test: [DESIGN] 반복 종료 날짜 검증 테스트 구조 설계 및 fixtures 생성"
```

---

**생성 도구**: 수동 작성 (Agent 2)
