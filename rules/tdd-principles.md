# TDD 원칙 및 안티패턴

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [Red-Green-Refactor 사이클](#red-green-refactor-사이클)
3. [TDD 안티패턴 8가지](#tdd-안티패턴-8가지)
4. [TypeScript 특화 규칙](#typescript-특화-규칙)
5. [커밋 전략](#커밋-전략)

---

## 개요

### TDD란?

**Test-Driven Development (테스트 주도 개발)**는 테스트를 먼저 작성하고, 테스트를 통과하는 최소한의 코드를 작성한 후, 리팩토링하는 개발 방법론입니다.

### 핵심 원칙

> **"실패하는 테스트 없이는 프로덕션 코드를 작성하지 않는다."**

### TDD의 이점

1. **설계 개선**: 테스트 가능한 코드는 결합도가 낮고 응집도가 높음
2. **버그 감소**: 모든 코드가 테스트로 검증됨
3. **리팩토링 자신감**: 테스트가 안전망 역할
4. **문서화**: 테스트가 실행 가능한 명세
5. **빠른 피드백**: 즉각적인 오류 감지

---

## Red-Green-Refactor 사이클

### 3단계 사이클

```
┌─────────────────────────────────────────┐
│  🔴 RED: 실패하는 테스트 작성           │
│  - 명세를 읽고 테스트 케이스 작성       │
│  - 테스트 실행 → 실패 확인              │
│  - 아직 구현 코드 없음                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  🟢 GREEN: 최소 구현                    │
│  - 테스트를 통과하는 최소한의 코드 작성 │
│  - 테스트 실행 → 성공 확인              │
│  - 과도한 구현 지양                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  🔵 REFACTOR: 개선                      │
│  - 중복 제거, 가독성 향상               │
│  - TypeScript 타입 강화                 │
│  - 테스트는 여전히 통과해야 함          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  ✅ COMMIT: 변경사항 커밋               │
│  - 모든 테스트 통과                     │
│  - ESLint/TypeScript 에러 없음          │
│  - 다음 테스트로 이동                   │
└─────────────────────────────────────────┘
```

---

### 상세 워크플로우

#### 1. 🔴 RED 단계

**목표**: 명세를 테스트 코드로 변환

```typescript
// specs/05-validation-rules.md의 VR-TIME-001 명세
// "시작 시간 < 종료 시간"

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환한다', () => {
    // Given
    const startTime = '14:00';
    const endTime = '13:00';

    // When
    const result = getTimeErrorMessage(startTime, endTime);

    // Then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
    });
  });
});
```

**실행 결과**:
```bash
❌ FAIL  src/__tests__/unit/easy.timeValidation.spec.ts
  ✕ 시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환한다

  Cannot find module '@/utils/timeValidation'
```

**체크리스트**:
- [ ] 명세 기반 테스트 작성
- [ ] Given-When-Then 구조
- [ ] 테스트 실행 → 실패 확인
- [ ] 실패 원인 명확 (구현 없음)

---

#### 2. 🟢 GREEN 단계

**목표**: 테스트를 통과하는 최소 구현

```typescript
// src/utils/timeValidation.ts
export function getTimeErrorMessage(
  startTime: string,
  endTime: string
): { startTimeError: string | null; endTimeError: string | null } {
  // 빈 문자열 체크
  if (!startTime || !endTime) {
    return { startTimeError: null, endTimeError: null };
  }

  // Date 객체로 변환하여 비교
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  // 시작 시간이 종료 시간보다 늦거나 같으면 에러
  if (start >= end) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
    };
  }

  return { startTimeError: null, endTimeError: null };
}
```

**실행 결과**:
```bash
✅ PASS  src/__tests__/unit/easy.timeValidation.spec.ts
  ✓ 시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환한다 (5ms)
```

**체크리스트**:
- [ ] 테스트 통과하는 최소 코드
- [ ] 과도한 추상화 지양
- [ ] TypeScript 컴파일 성공
- [ ] 모든 테스트 통과

---

#### 3. 🔵 REFACTOR 단계

**목표**: 코드 품질 개선 (테스트는 유지)

```typescript
// src/utils/timeValidation.ts
type TimeErrorResult = {
  startTimeError: string | null;
  endTimeError: string | null;
};

const ERROR_MESSAGES = {
  START_TIME: '시작 시간은 종료 시간보다 빨라야 합니다.',
  END_TIME: '종료 시간은 시작 시간보다 늦어야 합니다.',
} as const;

const NO_ERROR: TimeErrorResult = {
  startTimeError: null,
  endTimeError: null,
};

export function getTimeErrorMessage(
  startTime: string,
  endTime: string
): TimeErrorResult {
  if (!startTime || !endTime) {
    return NO_ERROR;
  }

  const start = parseTimeToDate(startTime);
  const end = parseTimeToDate(endTime);

  if (start >= end) {
    return {
      startTimeError: ERROR_MESSAGES.START_TIME,
      endTimeError: ERROR_MESSAGES.END_TIME,
    };
  }

  return NO_ERROR;
}

function parseTimeToDate(time: string): Date {
  return new Date(`2000-01-01T${time}`);
}
```

**개선 사항**:
- ✅ 타입 추출 (`TimeErrorResult`)
- ✅ 상수 추출 (`ERROR_MESSAGES`, `NO_ERROR`)
- ✅ 함수 추출 (`parseTimeToDate`)
- ✅ `as const` 타입 안전성 강화

**실행 결과**:
```bash
✅ PASS  src/__tests__/unit/easy.timeValidation.spec.ts
  ✓ 시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환한다 (4ms)
```

**체크리스트**:
- [ ] 중복 제거
- [ ] 가독성 향상
- [ ] 타입 안전성 강화
- [ ] 테스트 여전히 통과

---

## TDD 안티패턴 8가지

### 1. ❌ 타입 변경과 로직 변경 동시 수행

**문제점**:
- 실패 원인 파악 어려움
- 타입 에러인지 로직 에러인지 불명확
- 리뷰 및 디버깅 어려움

```typescript
// ❌ Bad: 타입 변경 + 로직 변경 동시
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  // 타입 변경: repeatType 추가
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
}

function createEvent(data: EventForm): Event {
  // 로직 변경: 반복 일정 생성 로직 추가
  if (data.repeatType !== 'none') {
    return generateRecurringEvents(data);
  }
  return { ...data, id: generateId() };
}
```

**해결 방법**:
```typescript
// ✅ Good: 커밋 1 - 타입 변경만
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly'; // 타입만 추가
}

function createEvent(data: EventForm): Event {
  return { ...data, id: generateId() };  // 로직 변경 없음
}

// 커밋 후...

// ✅ Good: 커밋 2 - 로직 변경만
function createEvent(data: EventForm): Event {
  if (data.repeatType !== 'none') {
    return generateRecurringEvents(data);  // 로직 추가
  }
  return { ...data, id: generateId() };
}
```

**규칙**:
> **"구조 변경과 행동 변경을 절대 동시에 커밋하지 않는다."**

---

### 2. ❌ 구현 후 테스트 작성

**문제점**:
- TDD 사이클 위반
- 테스트하기 어려운 코드 생성
- 코드 설계 개선 기회 상실

```typescript
// ❌ Bad: 구현 먼저
export function calculateOverlap(event1: Event, event2: Event): boolean {
  // 복잡한 로직 먼저 구현
  const start1 = new Date(`${event1.date}T${event1.startTime}`);
  const end1 = new Date(`${event1.date}T${event1.endTime}`);
  const start2 = new Date(`${event2.date}T${event2.startTime}`);
  const end2 = new Date(`${event2.date}T${event2.endTime}`);

  // ... 복잡한 로직

  // 나중에 테스트 작성
}
```

**해결 방법**:
```typescript
// ✅ Good: 테스트 먼저 (RED)
describe('calculateOverlap', () => {
  it('시간이 겹치는 두 일정은 true를 반환한다', () => {
    const event1 = createMockEvent({ startTime: '10:00', endTime: '12:00' });
    const event2 = createMockEvent({ startTime: '11:00', endTime: '13:00' });

    expect(calculateOverlap(event1, event2)).toBe(true);
  });
});

// 그 다음 구현 (GREEN)
export function calculateOverlap(event1: Event, event2: Event): boolean {
  // 테스트를 통과하는 최소 구현
}
```

**규칙**:
> **"Red (테스트) → Green (구현) → Refactor 순서 엄수"**

---

### 3. ❌ TypeScript 제네릭 과용

**문제점**:
- 불필요한 복잡성 증가
- YAGNI(You Aren't Gonna Need It) 위반
- 테스트 작성 및 이해 어려움

```typescript
// ❌ Bad: 과도한 제네릭
function filterEvents<T extends Event, K extends keyof T>(
  events: T[],
  predicate: (event: T, key: K) => boolean,
  keys?: K[]
): Partial<Pick<T, K>>[] {
  // 지나치게 복잡한 타입
}
```

**해결 방법**:
```typescript
// ✅ Good: 필요한 만큼만
function filterEventsByTitle(events: Event[], searchTerm: string): Event[] {
  return events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// ✅ 필요 시점에 제네릭 추가 (REFACTOR 단계)
function filterEvents<T extends Event>(
  events: T[],
  predicate: (event: T) => boolean
): T[] {
  return events.filter(predicate);
}
```

**규칙**:
> **"현재 테스트를 통과하는 최소한의 타입만 사용한다."**

---

### 4. ❌ 타입 에러 존재 시 리팩토링

**문제점**:
- RED 상태에서 REFACTOR 시도
- 에러 원인 혼재 (타입 vs 로직)
- 디버깅 시간 낭비

```typescript
// ❌ Bad: TypeScript 에러가 있는데 리팩토링
function createEvent(data: EventForm): Event {
  return {
    ...data,
    id: generateId(),
    startTime: data.startTime,  // TS Error: Type mismatch
  };
}

// 타입 에러 무시하고 함수 추출 시도
function extractEventData(data: EventForm) { /* ... */ }
```

**해결 방법**:
```typescript
// ✅ Good: 타입 에러 먼저 해결 (GREEN)
function createEvent(data: EventForm): Event {
  return {
    ...data,
    id: generateId(),
    startTime: data.startTime as string,  // 타입 에러 수정
  };
}

// 모든 테스트 통과 후 리팩토링 (REFACTOR)
function createEvent(data: EventForm): Event {
  const baseEvent = extractEventData(data);
  return { ...baseEvent, id: generateId() };
}
```

**규칙**:
> **"GREEN 상태(모든 테스트 통과)에서만 REFACTOR를 수행한다."**

---

### 5. ❌ ESLint/TypeScript 에러 포함 커밋

**문제점**:
- CI/CD 파이프라인 실패
- 팀원의 작업 방해
- 기술 부채 누적

```bash
# ❌ Bad: 에러가 있는데 커밋
$ pnpm lint
✖ 3 problems (3 errors, 0 warnings)

$ pnpm tsc
error TS2345: Argument of type 'string' is not assignable to parameter

$ git commit -m "feature: 반복 일정 추가"  # 에러 무시하고 커밋
```

**해결 방법**:
```bash
# ✅ Good: 에러 해결 후 커밋
$ pnpm lint
✔ No problems found

$ pnpm tsc
✔ Compilation complete

$ pnpm test
✔ All tests passed

$ git commit -m "feature: 반복 일정 추가"
```

**pre-commit 훅 설정**:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm lint && pnpm tsc && pnpm test"
    }
  }
}
```

**규칙**:
> **"모든 테스트 통과 + ESLint/TypeScript 에러 없음 = 커밋 가능"**

---

### 6. ❌ 큰 단위의 드문 커밋

**문제점**:
- 코드 히스토리 추적 어려움
- 버그 발생 시점 파악 어려움
- 리뷰 부담 증가

```bash
# ❌ Bad: 여러 기능을 한 번에 커밋
$ git log --oneline
a3f5b21 feat: 일정 CRUD, 검색, 필터링, 알림, 겹침 감지 구현
```

**해결 방법**:
```bash
# ✅ Good: Red-Green-Refactor 사이클마다 커밋
$ git log --oneline
e8d7c34 refactor: 시간 검증 로직 함수 추출
b6f4a92 test: 시간 검증 테스트 추가 (시작=종료 케이스)
7c2e581 feat: 시작 시간 검증 구현
3a1d890 test: 시간 검증 테스트 추가 (시작>종료 케이스)
```

**커밋 타이밍**:
1. 🔴 RED: 테스트 작성 후 커밋 (선택)
2. 🟢 GREEN: 구현 완료 후 커밋 (필수)
3. 🔵 REFACTOR: 리팩토링 후 커밋 (필수)

**규칙**:
> **"작고 빈번한 커밋으로 변경 이력을 명확히 한다."**

---

### 7. ❌ 모호한 테스트 이름

**문제점**:
- 테스트 실패 시 원인 파악 어려움
- 문서 역할 불가
- 유지보수 어려움

```typescript
// ❌ Bad: 모호한 이름
it('should work', () => { /* ... */ });
it('test 1', () => { /* ... */ });
it('validates input', () => { /* ... */ });
```

**해결 방법**:
```typescript
// ✅ Good: 동작 설명하는 이름
it('시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환한다', () => {
  // ...
});

it('빈 문자열 입력 시 null을 반환한다', () => {
  // ...
});

it('일정 제목으로 검색 시 대소문자를 구분하지 않는다', () => {
  // ...
});
```

**TypeScript 타입 명시**:
```typescript
// ✅ Good: 타입 정보 포함
it('getTimeErrorMessage는 TimeErrorResult 타입을 반환한다', () => {
  const result: TimeErrorResult = getTimeErrorMessage('14:00', '15:00');
  expect(result.startTimeError).toBeNull();
});
```

**규칙**:
> **"테스트 이름만 읽어도 무엇을 검증하는지 명확해야 한다."**

---

### 8. ❌ 큰 단위 테스트

**문제점**:
- 실패 시 원인 파악 어려움
- 피드백 루프 느림
- TDD 목적 상실

```typescript
// ❌ Bad: 여러 기능을 한 번에 테스트
it('일정 관리 시스템이 동작한다', () => {
  // 생성 테스트
  const event = createEvent(data);
  expect(event.id).toBeDefined();

  // 수정 테스트
  const updated = updateEvent(event.id, newData);
  expect(updated.title).toBe('수정됨');

  // 삭제 테스트
  deleteEvent(event.id);
  expect(getEvent(event.id)).toBeNull();

  // 검색 테스트
  const results = searchEvents('회의');
  expect(results.length).toBeGreaterThan(0);
});
```

**해결 방법**:
```typescript
// ✅ Good: 기능별로 분리
describe('createEvent', () => {
  it('유효한 데이터로 일정을 생성한다', () => {
    const event = createEvent(validData);
    expect(event.id).toBeDefined();
  });
});

describe('updateEvent', () => {
  it('일정 제목을 수정한다', () => {
    const updated = updateEvent(event.id, { title: '수정됨' });
    expect(updated.title).toBe('수정됨');
  });
});

describe('deleteEvent', () => {
  it('일정을 삭제하면 조회 시 null을 반환한다', () => {
    deleteEvent(event.id);
    expect(getEvent(event.id)).toBeNull();
  });
});

describe('searchEvents', () => {
  it('제목으로 일정을 검색한다', () => {
    const results = searchEvents('회의');
    expect(results.every(e => e.title.includes('회의'))).toBe(true);
  });
});
```

**React 컴포넌트 테스트**:
```typescript
// ✅ Good: 사용자 동작별로 분리
describe('EventForm', () => {
  it('제목 입력 필드에 텍스트를 입력할 수 있다', async () => {
    render(<EventForm />);
    const titleInput = screen.getByLabelText(/제목/i);
    await userEvent.type(titleInput, '팀 회의');
    expect(titleInput).toHaveValue('팀 회의');
  });

  it('시작 시간이 종료 시간보다 늦으면 에러 메시지를 표시한다', async () => {
    render(<EventForm />);
    // ... 개별 검증
  });
});
```

**규칙**:
> **"하나의 테스트는 하나의 동작만 검증한다."**

---

## TypeScript 특화 규칙

### 타입 안전성 강화

```typescript
// ✅ Good: 타입 가드 사용
function isEvent(data: unknown): data is Event {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data
  );
}

// ✅ Good: 유니온 타입 좁히기
function handleRepeat(type: RepeatType): void {
  switch (type) {
    case 'none':
      return;
    case 'daily':
      return generateDaily();
    case 'weekly':
      return generateWeekly();
    case 'monthly':
      return generateMonthly();
    case 'yearly':
      return generateYearly();
    default:
      // 모든 케이스 처리 확인
      const _exhaustive: never = type;
      throw new Error(`Unhandled type: ${_exhaustive}`);
  }
}
```

### 타입 추론 활용

```typescript
// ✅ Good: 타입 추론 활용
const events = [
  { id: '1', title: '회의' },
  { id: '2', title: '식사' },
];  // Event[] 자동 추론

// ✅ Good: const assertion
const ERROR_CODES = {
  INVALID_TIME: 'INVALID_TIME',
  OVERLAPPING: 'OVERLAPPING',
} as const;
// type ErrorCode = 'INVALID_TIME' | 'OVERLAPPING'
```

---

## 커밋 전략

### 커밋 메시지 형식

```bash
# ✅ Good: 명확한 커밋 메시지
test: 시작 시간 검증 테스트 추가

feat: 시작 시간이 종료 시간보다 늦을 때 에러 반환 구현

refactor: 시간 검증 로직 함수 추출 및 타입 개선

fix: 빈 문자열 입력 시 null 반환하도록 수정
```

### 커밋 단위

1. **테스트 추가**: `test:` 접두사
2. **기능 구현**: `feat:` 접두사
3. **리팩토링**: `refactor:` 접두사
4. **버그 수정**: `fix:` 접두사

### TDD 사이클별 커밋

```bash
# 사이클 1
git add src/__tests__/unit/timeValidation.spec.ts
git commit -m "test: 시작>종료 시간 검증 테스트 추가"

git add src/utils/timeValidation.ts
git commit -m "feat: 시간 검증 함수 구현"

git add src/utils/timeValidation.ts
git commit -m "refactor: 에러 메시지 상수 추출"

# 사이클 2
git add src/__tests__/unit/timeValidation.spec.ts
git commit -m "test: 시작=종료 시간 검증 테스트 추가"

git add src/utils/timeValidation.ts
git commit -m "feat: 동일 시간 에러 처리 추가"
```

---

## 요약 체크리스트

### Red-Green-Refactor
- [ ] 🔴 명세 기반 테스트 작성
- [ ] 🔴 테스트 실행 → 실패 확인
- [ ] 🟢 최소 구현으로 테스트 통과
- [ ] 🟢 모든 테스트 통과 확인
- [ ] 🔵 코드 개선 (중복 제거, 타입 강화)
- [ ] 🔵 테스트 여전히 통과 확인
- [ ] ✅ ESLint/TypeScript 에러 없음
- [ ] ✅ 작은 단위로 커밋

### 안티패턴 회피
- [ ] 타입 변경과 로직 변경 분리
- [ ] 테스트 먼저, 구현은 나중에
- [ ] 필요한 만큼만 제네릭 사용
- [ ] GREEN 상태에서만 리팩토링
- [ ] 에러 없이 커밋
- [ ] 작고 빈번한 커밋
- [ ] 명확한 테스트 이름
- [ ] 하나의 테스트 = 하나의 동작

---

## 참고 자료

- [rules/README.md](./README.md): 테스트 규칙 가이드
- [rules/testing-library-queries.md](./testing-library-queries.md): 쿼리 우선순위
- [rules/react-testing-library-best-practices.md](./react-testing-library-best-practices.md): RTL 베스트 프랙티스
- [specs/08-test-scenarios.md](../specs/08-test-scenarios.md): 테스트 시나리오
- [specs/README.md](../specs/README.md): 명세 문서 가이드

---

**이전 문서**: [React Testing Library 베스트 프랙티스](./react-testing-library-best-practices.md)
