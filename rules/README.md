# 테스트 규칙 가이드

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [규칙 문서 구조](#규칙-문서-구조)
3. [TDD + Testing Library 통합 워크플로우](#tdd--testing-library-통합-워크플로우)
4. [규칙 활용 방법](#규칙-활용-방법)

---

## 개요

이 디렉토리는 **TypeScript/React 19 환경**에서 TDD(Test-Driven Development)와 Testing Library를 사용한 테스트 작성 규칙을 정의합니다.

### 문서 목적

- **일관성**: 팀 전체가 동일한 테스트 작성 패턴 사용
- **품질**: 안티패턴 방지 및 베스트 프랙티스 적용
- **효율성**: 빠르고 안정적인 테스트 작성
- **접근성**: 사용자 중심의 테스트 작성

### 핵심 원칙

1. **사용자 중심 테스트**: 사용자가 앱과 상호작용하는 방식으로 테스트 작성
2. **접근성 우선**: 접근성 쿼리를 최우선으로 사용
3. **TDD 사이클 준수**: Red-Green-Refactor 사이클 엄격히 적용
4. **타입 안전성**: TypeScript 타입 시스템 활용

---

## 규칙 문서 구조

### 1. [Testing Library 쿼리 우선순위](./testing-library-queries.md)

**내용**:

- 쿼리 선택 3단계 우선순위
- 각 쿼리 타입 상세 설명
- 사용 시나리오 및 예시
- TypeScript 타입 통합

**주요 규칙**:

- Priority 1: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByDisplayValue`
- Priority 2: `getByAltText` → `getByTitle`
- Priority 3: `getByTestId` (최후의 수단)

---

### 2. [React Testing Library 베스트 프랙티스](./react-testing-library-best-practices.md)

**내용**:

- ESLint 설정 및 도구
- 쿼리 메서드 올바른 사용
- Assertion 패턴
- 비동기 처리
- 접근성 규칙
- 사용자 상호작용

**주요 안티패턴**:

- ❌ `container.querySelector()` 사용
- ❌ `fireEvent` 대신 `userEvent` 사용 권장
- ❌ `waitFor()` 내부에서 side effect 실행
- ❌ 불필요한 `role`, `aria-*` 속성 추가

---

### 3. [TDD 원칙 및 안티패턴](./tdd-principles.md)

**내용**:

- Red-Green-Refactor 사이클 상세
- TypeScript/React 환경 최적화 규칙
- 8가지 안티패턴 및 해결 방법
- 커밋 전략

**주요 안티패턴**:

- ❌ 타입 변경과 로직 변경 동시 수행
- ❌ 구현 후 테스트 작성
- ❌ TypeScript 컴파일 에러 포함 커밋
- ❌ 모호한 테스트 이름

---

## TDD + Testing Library 통합 워크플로우

### 1단계: 🔴 Red - 실패하는 테스트 작성

```typescript
// ❌ 아직 구현되지 않은 함수
import { render, screen } from '@testing-library/react';
import { MyButton } from './MyButton';

describe('MyButton', () => {
  it('클릭 시 카운터가 증가한다', async () => {
    // Arrange
    render(<MyButton />);

    // Act
    const button = screen.getByRole('button', { name: /증가/i });
    await userEvent.click(button);

    // Assert
    expect(screen.getByText('카운트: 1')).toBeInTheDocument();
  });
});
```

**규칙 적용**:

- ✅ `getByRole` 사용 (접근성 쿼리)
- ✅ `userEvent` 사용 (실제 사용자 상호작용)
- ✅ `toBeInTheDocument()` 사용 (jest-dom matcher)

---

### 2단계: 🟢 Green - 최소 구현

```typescript
// src/MyButton.tsx
export function MyButton() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <p>카운트: {count}</p>
    </div>
  );
}
```

**규칙 적용**:

- ✅ 테스트를 통과하는 최소한의 코드만 작성
- ✅ TypeScript 타입 에러 없음
- ✅ 과도한 구현 방지

---

### 3단계: 🔵 Refactor - 개선

```typescript
// src/MyButton.tsx
type MyButtonProps = {
  initialCount?: number;
};

export function MyButton({ initialCount = 0 }: MyButtonProps) {
  const [count, setCount] = useState(initialCount);

  const handleIncrement = () => setCount((prev) => prev + 1);

  return (
    <div>
      <button onClick={handleIncrement}>증가</button>
      <p>카운트: {count}</p>
    </div>
  );
}
```

**규칙 적용**:

- ✅ TypeScript 타입 추가
- ✅ 함수 추출 (가독성 향상)
- ✅ 테스트는 여전히 통과

---

## 규칙 활용 방법

### Claude Code 사용 시

1. **테스트 작성 전 규칙 확인**:

```
"rules/testing-library-queries.md를 참고하여
적절한 쿼리 메서드를 선택한 테스트 코드를 작성해줘."
```

2. **안티패턴 검증**:

```
"rules/react-testing-library-best-practices.md의 규칙을 위반한
코드가 있는지 검토해줘."
```

3. **TDD 사이클 준수**:

```
"rules/tdd-principles.md를 따라 Red-Green-Refactor 순서로
[기능명] 기능을 구현해줘."
```

---

### ESLint 통합

프로젝트에 이미 설정된 ESLint 플러그인:

- `eslint-plugin-testing-library`
- `eslint-plugin-jest-dom`

ESLint가 자동으로 규칙 위반을 감지합니다.

---

### 코드 리뷰 체크리스트

- [ ] 접근성 쿼리 우선 사용 (`getByRole`, `getByLabelText`)
- [ ] `userEvent` 사용 (fireEvent ❌)
- [ ] `screen` 객체 사용
- [ ] jest-dom matcher 사용 (`toBeInTheDocument`, `toBeDisabled` 등)
- [ ] `waitFor()` 올바른 사용 (side effect 외부)
- [ ] 테스트 이름 명확 (동작 설명)
- [ ] TDD 사이클 준수 (Red → Green → Refactor)
- [ ] TypeScript 컴파일 에러 없음

---

## 참고 자료

### 프로젝트 내부 문서

- [specs/README.md](../specs/README.md): 명세 문서 가이드
- [CLAUDE.md](../CLAUDE.md): Claude Code 개발 가이드
- [README.md](../README.md): 프로젝트 전체 개요

---

## 🔖 버전 히스토리

| 버전  | 날짜       | 변경 내용             | 작성자      |
| ----- | ---------- | --------------------- | ----------- |
| 1.0.0 | 2025-10-27 | 테스트 규칙 초기 작성 | Claude Code |

---

**다음 문서**:

- [Testing Library 쿼리 우선순위](./testing-library-queries.md)
- [React Testing Library 베스트 프랙티스](./react-testing-library-best-practices.md)
- [TDD 원칙 및 안티패턴](./tdd-principles.md)
