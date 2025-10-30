# TDD 패턴 (Test-Driven Development Patterns)

**최종 업데이트**: 2025-10-30

---

## 패턴 1: Given-When-Then 테스트 구조

### 문제 상황
- 테스트 코드가 읽기 어렵고 의도를 파악하기 힘듦
- 테스트 케이스 간 일관성 부족

### 해결 방법
모든 테스트를 Given-When-Then 3단계 구조로 작성

```typescript
describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환', () => {
    // Given: 초기 상태 설정
    const startTime = '14:00';
    const endTime = '13:00';

    // When: 테스트 대상 실행
    const result = getTimeErrorMessage(startTime, endTime);

    // Then: 결과 검증
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
    });
  });
});
```

### 주의사항
- Given-When-Then 주석을 반드시 작성
- 각 단계는 명확하게 구분
- When은 단 하나의 동작만 수행

### 관련 문서
- rules/tdd-principles.md

---

## 패턴 2: 실패하는 테스트 먼저 (Red Phase)

### 문제 상황
- 구현 후 테스트를 작성하여 TDD 사이클 위반
- 테스트가 실제로 검증하는지 확인 불가

### 해결 방법
1. 테스트 작성 (실패 확인)
2. 최소 구현 (통과 확인)
3. 리팩토링 (여전히 통과)

```bash
# Step 1: Red Phase
pnpm test  # 실패 확인 필수

# Step 2: Green Phase
# 구현 코드 작성
pnpm test  # 통과 확인

# Step 3: Refactor
# 코드 개선
pnpm test  # 여전히 통과
```

### 주의사항
- Red Phase에서 반드시 실패 확인
- 실패 이유가 예상과 일치하는지 검증
- Green Phase에서는 과도한 구현 금지

---

## 패턴 3: 작은 단계로 진행

### 문제 상황
- 한 번에 너무 많은 기능을 구현하려다 실패
- 디버깅이 어렵고 문제 원인 파악 힘듦

### 해결 방법
- 기능을 작은 단위로 분해
- 각 단위마다 Red-Green-Refactor 사이클 수행

**예시**: 반복 일정 기능
1. 일일 반복 → Red-Green-Refactor
2. 주간 반복 → Red-Green-Refactor
3. 월간 반복 → Red-Green-Refactor
4. 연간 반복 → Red-Green-Refactor

### 주의사항
- 각 단계마다 커밋 생성
- 이전 단계 테스트는 항상 통과 유지
- 복잡한 기능은 더 작게 분해

---

## 패턴 4: 테스트 격리 (Test Isolation)

### 문제 상황
- 테스트 간 의존성으로 인한 순서 의존
- 한 테스트 실패 시 다른 테스트도 실패

### 해결 방법
각 테스트는 독립적으로 실행 가능해야 함

```typescript
describe('eventOperations', () => {
  beforeEach(() => {
    // 각 테스트 전 초기화
    cleanup();
  });

  it('테스트 1', () => {
    // 독립적 실행
  });

  it('테스트 2', () => {
    // 다른 테스트에 영향 없음
  });
});
```

### 주의사항
- 전역 상태 사용 금지
- 각 테스트에서 필요한 데이터 직접 생성
- afterEach로 정리 작업 수행

---

## 패턴 5: 명확한 테스트 이름

### 문제 상황
- 테스트 실패 시 어떤 기능이 깨졌는지 파악 어려움
- 테스트 이름만으로 의도 파악 불가

### 해결 방법
테스트 이름은 "무엇을 테스트하는가"를 명확히 표현

```typescript
// ✅ 좋은 예
it('시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환', () => {});

// ❌ 나쁜 예
it('should work', () => {});
it('test1', () => {});
```

### 주의사항
- 행동 중심으로 작성 (구현 세부사항 언급 금지)
- 예상 결과 포함
- 테스트 조건 명시

---

## 패턴 6: 엣지 케이스 테스트

### 문제 상황
- 일반적인 케이스만 테스트하여 버그 발생
- 경계 조건 미검증

### 해결 방법
명세의 모든 엣지 케이스를 테스트로 작성

```typescript
describe('엣지 케이스', () => {
  it('빈 문자열 입력 시', () => {});
  it('null 입력 시', () => {});
  it('최소값 경계', () => {});
  it('최대값 경계', () => {});
  it('특수 문자 포함 시', () => {});
});
```

### 주의사항
- 명세에 명시된 모든 예외 상황 테스트
- 경계값 분석 (Boundary Value Analysis) 적용
- 예상치 못한 입력에 대한 방어 코드

---

## 사용 통계

| 패턴 | 사용 횟수 | 마지막 사용 |
|------|----------|------------|
| Given-When-Then | 50+ | 2025-10-30 |
| Red-Green-Refactor | 18 | 2025-10-30 |
| 작은 단계 | 6 | 2025-10-29 |
| 테스트 격리 | 40+ | 2025-10-30 |
| 명확한 이름 | 50+ | 2025-10-30 |
| 엣지 케이스 | 30+ | 2025-10-30 |

---

**관련 도구**:
- .claude/scripts/test-enforcer.sh
- rules/tdd-principles.md
