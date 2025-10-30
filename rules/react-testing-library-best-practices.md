# React Testing Library 베스트 프랙티스

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [ESLint 설정](#eslint-설정)
3. [변수 명명 및 Import](#변수-명명-및-import)
4. [쿼리 메서드 선택](#쿼리-메서드-선택)
5. [Assertion 패턴](#assertion-패턴)
6. [비동기 처리](#비동기-처리)
7. [접근성 속성](#접근성-속성)
8. [사용자 상호작용](#사용자-상호작용)

---

## 개요

이 문서는 React Testing Library 사용 시 흔히 발생하는 실수와 올바른 해결 방법을 정리합니다.

### 핵심 철학

> **"테스트는 소프트웨어 사용 방식과 유사할수록 더 많은 신뢰를 제공합니다."**

---

## ESLint 설정

### ❌ Anti-Pattern: ESLint 플러그인 미사용

**문제점**:

- 안티패턴을 수동으로 발견해야 함
- 코드 리뷰 시간 낭비
- 팀 전체 일관성 부족

**해결 방법**:

```bash
# 프로젝트에 이미 설치됨
pnpm add -D eslint-plugin-testing-library eslint-plugin-jest-dom
```

**eslint.config.js 설정**:

```javascript
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';

export default [
  {
    files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
    plugins: {
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
    },
    rules: {
      ...testingLibrary.configs.react.rules,
      ...jestDom.configs.recommended.rules,
    },
  },
];
```

**자동 감지 예시**:

```typescript
// ❌ ESLint 경고: "Prefer `screen.getByRole` over `container.querySelector`"
const button = container.querySelector('button');

// ✅ ESLint 통과
const button = screen.getByRole('button');
```

---

## 변수 명명 및 Import

### ❌ Anti-Pattern 1: "wrapper" 변수 이름 사용

**문제점**:

- Enzyme 시대의 잔재
- RTL은 wrapping 개념이 없음
- 오해 유발

```typescript
// ❌ Bad: Enzyme 스타일 명명
const wrapper = render(<MyComponent />);
wrapper.getByRole('button');
```

**해결 방법**:

```typescript
// ✅ Good: 필요한 것만 destructure
const { getByRole, rerender } = render(<MyComponent />);
const button = getByRole('button');

// ✅ Better: screen 사용 (권장)
render(<MyComponent />);
const button = screen.getByRole('button');
```

---

### ❌ Anti-Pattern 2: cleanup 수동 호출

**문제점**:

- Vitest는 자동으로 cleanup 수행
- 불필요한 코드 중복
- 최신 라이브러리 기능 미활용

```typescript
// ❌ Bad: 불필요한 cleanup
import { render, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

**해결 방법**:

```typescript
// ✅ Good: cleanup은 자동으로 처리됨
import { render } from '@testing-library/react';

// afterEach 불필요
```

---

## 쿼리 메서드 선택

### ❌ Anti-Pattern 3: screen 객체 미사용

**문제점**:

- destructure 목록 유지 보수 부담
- 여러 쿼리 사용 시 코드 복잡
- 타입 추론 어려움

```typescript
// ❌ Bad: destructure 사용
const { getByRole, getByLabelText, getByText } = render(<Form />);
const button = getByRole('button');
const input = getByLabelText(/이메일/i);
```

**해결 방법**:

```typescript
// ✅ Good: screen 사용
import { render, screen } from '@testing-library/react';

render(<Form />);
const button = screen.getByRole('button');
const input = screen.getByLabelText(/이메일/i);
```

**TypeScript 타입 이점**:

```typescript
// screen 사용 시 자동완성 지원
screen.getBy; // ← IDE가 모든 쿼리 메서드 표시
```

---

### ❌ Anti-Pattern 4: 잘못된 쿼리 선택

**문제점**:

- 접근성 검증 누락
- 깨지기 쉬운 테스트
- 사용자 관점 미반영

```typescript
// ❌ Bad: ID로 쿼리
const button = screen.getByTestId('submit-button');

// ❌ Bad: 클래스로 쿼리
const button = container.querySelector('.btn-primary');

// ❌ Bad: 텍스트로 button 쿼리
const button = screen.getByText(/제출/i);
```

**해결 방법**:

```typescript
// ✅ Good: role 사용
const button = screen.getByRole('button', { name: /제출/i });

// ✅ Good: labelText로 input 쿼리
const emailInput = screen.getByLabelText(/이메일/i);

// ✅ Good: text로 비대화형 요소 쿼리
const heading = screen.getByText(/환영합니다/i);
```

**우선순위 복습**:

1. `getByRole` (최우선)
2. `getByLabelText` (form 요소)
3. `getByPlaceholderText`
4. `getByText` (비대화형 요소)
5. `getByTestId` (최후의 수단)

---

### ❌ Anti-Pattern 5: container.querySelector() 사용

**문제점**:

- 접근성 검증 완전 우회
- CSS 선택자 의존 (구현 세부사항)
- 테스트 신뢰도 급감

```typescript
// ❌ Bad: DOM API 직접 사용
const button = container.querySelector('.submit-btn');
const input = container.querySelector('#email-input');
```

**해결 방법**:

```typescript
// ✅ Good: RTL 쿼리 사용
const button = screen.getByRole('button', { name: /제출/i });
const input = screen.getByLabelText(/이메일/i);

// ✅ 정말 필요한 경우: data-testid 사용
const customElement = screen.getByTestId('complex-widget');
```

---

### ❌ Anti-Pattern 6: 보이는 텍스트로 쿼리하지 않기

**문제점**:

- 번역 누락 미감지
- 사용자가 보는 것과 테스트 불일치
- 콘텐츠 변경 시 테스트 깨짐

```typescript
// ❌ Bad: 하드코딩된 key로 쿼리
const message = screen.getByTestId('welcome-message');

// ❌ Bad: aria-label에만 의존
const button = screen.getByLabelText('submit');
```

**해결 방법**:

```typescript
// ✅ Good: 실제 표시 텍스트로 쿼리
const message = screen.getByText(/환영합니다/i);

// ✅ Good: 접근 가능한 이름 (visible text 우선)
const button = screen.getByRole('button', { name: /제출/i });
```

**번역 검증 예시**:

```typescript
it('한국어 텍스트가 올바르게 표시된다', () => {
  render(<App locale="ko" />);

  // ✅ 번역 누락 시 테스트 실패
  expect(screen.getByText(/환영합니다/i)).toBeInTheDocument();
});
```

---

### ❌ Anti-Pattern 7: getByTestId 남용

**문제점**:

- 사용자는 testid를 볼 수 없음
- 접근성 검증 불가
- 유지보수 부담 증가

```typescript
// ❌ Bad: testid 남용
<button data-testid="submit-btn">제출</button>
<input data-testid="email-input" />
<div data-testid="error-message">에러</div>
```

**해결 방법**:

```typescript
// ✅ Good: 시맨틱 쿼리 사용
<button>제출</button>  {/* getByRole('button', { name: /제출/i }) */}
<label htmlFor="email">이메일</label>
<input id="email" />  {/* getByLabelText(/이메일/i) */}
<div role="alert">에러</div>  {/* getByRole('alert') */}

// ⚠️ 정말 필요한 경우만 testid 사용
<div data-testid="loading-spinner" />  {/* 동적 콘텐츠 */}
```

---

## Assertion 패턴

### ❌ Anti-Pattern 8: 일반 assertion 사용

**문제점**:

- 에러 메시지 불명확
- 디버깅 어려움
- jest-dom matcher의 이점 미활용

```typescript
// ❌ Bad: 일반 assertion
expect(button.disabled).toBe(true);
expect(input.value).toBe('test@example.com');
expect(element).not.toBe(null);
```

**해결 방법**:

```typescript
// ✅ Good: jest-dom matcher 사용
import '@testing-library/jest-dom';

expect(button).toBeDisabled();
expect(input).toHaveValue('test@example.com');
expect(element).toBeInTheDocument();
```

**jest-dom matcher 목록**:

```typescript
// 존재 여부
expect(element).toBeInTheDocument();
expect(element).toBeVisible();

// 상태
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(checkbox).toBeChecked();

// 값
expect(input).toHaveValue('text');
expect(select).toHaveDisplayValue('Option 1');

// 텍스트
expect(element).toHaveTextContent(/hello/i);

// 클래스/속성
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/home');

// 스타일
expect(element).toHaveStyle({ color: 'red' });

// Form
expect(form).toHaveFormValues({ email: 'test@example.com' });
```

---

### ❌ Anti-Pattern 9: query\* 로 존재 확인

**문제점**:

- 실패 시 에러 메시지 없음
- `null` 반환으로 디버깅 어려움

```typescript
// ❌ Bad: query*로 존재 확인
expect(screen.queryByRole('button')).toBeInTheDocument();
```

**해결 방법**:

```typescript
// ✅ Good: get*로 존재 확인
expect(screen.getByRole('button')).toBeInTheDocument();

// ✅ Good: query*는 부재 확인에만 사용
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

**사용 구분**:
| 쿼리 | 용도 | 반환 | 실패 시 |
|------|------|------|---------|
| `get*` | 존재 확인 | Element | throw |
| `query*` | 부재 확인 | Element \| null | null |
| `find*` | 비동기 대기 | Promise<Element> | reject |

---

## 비동기 처리

### ❌ Anti-Pattern 10: render/fireEvent를 act()로 감싸기

**문제점**:

- 이미 내부적으로 act 처리됨
- 불필요한 코드 중복
- act 경고 원인 은폐

```typescript
// ❌ Bad: 불필요한 act
import { act } from '@testing-library/react';

await act(async () => {
  render(<MyComponent />);
});

await act(async () => {
  await userEvent.click(button);
});
```

**해결 방법**:

```typescript
// ✅ Good: act 불필요
render(<MyComponent />);
await userEvent.click(button);

// ⚠️ act가 정말 필요한 경우 (드물음)
act(() => {
  // React 상태 직접 업데이트
  store.dispatch(action);
});
```

---

### ❌ Anti-Pattern 11: waitFor() 빈 콜백

**문제점**:

- 타이밍에 의존하는 깨지기 쉬운 테스트
- 무엇을 기다리는지 불명확
- 불필요한 대기 시간

```typescript
// ❌ Bad: 빈 콜백으로 시간만 대기
await waitFor(() => {});
await new Promise((resolve) => setTimeout(resolve, 1000));
```

**해결 방법**:

```typescript
// ✅ Good: 구체적인 조건 대기
await waitFor(() => {
  expect(screen.getByText(/성공/i)).toBeInTheDocument();
});

// ✅ Better: find* 쿼리 사용
await screen.findByText(/성공/i);
```

---

### ❌ Anti-Pattern 12: waitFor() 내 여러 assertion

**문제점**:

- 첫 번째 assertion 실패 시 timeout까지 대기
- 디버깅 시간 낭비
- 테스트 실행 속도 저하

```typescript
// ❌ Bad: 여러 assertion
await waitFor(() => {
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

**해결 방법**:

```typescript
// ✅ Good: assertion 하나씩 분리
await waitFor(() => {
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
expect(screen.getByRole('button')).toBeDisabled();
expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
```

---

### ❌ Anti-Pattern 13: waitFor() 내 side effect

**문제점**:

- 콜백이 여러 번 실행됨
- side effect가 중복 실행됨
- 예상치 못한 동작 발생

```typescript
// ❌ Bad: waitFor 안에서 클릭
await waitFor(() => {
  const button = screen.getByRole('button');
  userEvent.click(button); // 여러 번 실행됨!
});
```

**해결 방법**:

```typescript
// ✅ Good: 상호작용은 waitFor 밖에서
const button = screen.getByRole('button');
await userEvent.click(button);

await waitFor(() => {
  expect(screen.getByText(/성공/i)).toBeInTheDocument();
});
```

**waitFor 사용 규칙**:

- ✅ assertion만 포함
- ❌ 사용자 상호작용 금지
- ❌ API 호출 금지
- ❌ 상태 변경 금지

---

### ❌ Anti-Pattern 14: waitFor 대신 find\* 미사용

**문제점**:

- 코드 중복 (waitFor + get 조합)
- 에러 메시지 품질 저하
- 가독성 저하

```typescript
// ❌ Bad: waitFor + get 조합
await waitFor(() => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

// ❌ Bad: waitFor + query + assertion
await waitFor(() => {
  expect(screen.queryByRole('alert')).toBeInTheDocument();
});
```

**해결 방법**:

```typescript
// ✅ Good: find* 쿼리 사용
const alert = await screen.findByRole('alert');
expect(alert).toBeInTheDocument();

// ✅ Better: find* 만으로 충분
await screen.findByRole('alert'); // 존재하면 pass, 없으면 fail
```

---

## 접근성 속성

### ❌ Anti-Pattern 15: 불필요한 role/aria 속성

**문제점**:

- 보조 기술에 혼란 유발
- 시맨틱 HTML의 이점 손실
- 유지보수 부담 증가

```typescript
// ❌ Bad: 불필요한 role 추가
<button role="button">클릭</button>
<h1 role="heading">제목</h1>
<input type="text" role="textbox" />
```

**해결 방법**:

```typescript
// ✅ Good: 시맨틱 HTML만으로 충분
<button>클릭</button>  {/* 자동으로 role="button" */}
<h1>제목</h1>  {/* 자동으로 role="heading" */}
<input type="text" />  {/* 자동으로 role="textbox" */}

// ✅ 커스텀 컴포넌트에만 role 추가
<div role="button" tabIndex={0} onClick={handleClick}>
  커스텀 버튼
</div>
```

---

### ❌ Anti-Pattern 16: get\* 쿼리를 암묵적 assertion으로 사용

**문제점**:

- 테스트 의도 불명확
- 에러 메시지는 어차피 동일
- 코드 가독성 저하

```typescript
// ❌ Bad: 암묵적 assertion
screen.getByRole('alert'); // 존재하면 pass, 아니면 fail
```

**해결 방법**:

```typescript
// ✅ Good: 명시적 assertion
expect(screen.getByRole('alert')).toBeInTheDocument();

// ✅ 더 간결하게
const alert = screen.getByRole('alert');
expect(alert).toHaveTextContent(/에러 발생/i);
```

**명시적 assertion 장점**:

- 테스트 의도 명확
- 코드 리뷰 용이
- 유지보수 편리

---

## 사용자 상호작용

### ❌ Anti-Pattern 17: fireEvent 사용

**문제점**:

- 실제 브라우저 이벤트와 다름
- 키보드 이벤트 시퀀스 누락
- focus, hover 등 부가 동작 미수행

```typescript
// ❌ Bad: fireEvent 사용
import { fireEvent } from '@testing-library/react';

fireEvent.click(button);
fireEvent.change(input, { target: { value: 'test' } });
```

**해결 방법**:

```typescript
// ✅ Good: userEvent 사용
import userEvent from '@testing-library/user-event';

await userEvent.click(button);
await userEvent.type(input, 'test');
```

**userEvent 장점**:

- ✅ 실제 사용자 동작 시뮬레이션
- ✅ focus, blur 자동 처리
- ✅ 키보드 이벤트 시퀀스 (keyDown → keyPress → keyUp)
- ✅ 더 정확한 테스트

**userEvent API**:

```typescript
// 클릭
await userEvent.click(button);
await userEvent.dblClick(button);

// 타이핑
await userEvent.type(input, 'Hello World');
await userEvent.clear(input);

// 키보드
await userEvent.keyboard('{Enter}');
await userEvent.keyboard('{Shift>}A{/Shift}'); // Shift + A

// 선택
await userEvent.selectOptions(select, 'option1');
await userEvent.upload(fileInput, file);

// 체크박스/라디오
await userEvent.click(checkbox); // toggle
```

---

## 실전 예시: Bad → Good 변환

### 예시 1: 로그인 폼 테스트

```typescript
// ❌ Bad: 모든 안티패턴 포함
it('로그인 테스트', async () => {
  const { container } = render(<LoginForm />);

  // ❌ querySelector 사용
  const emailInput = container.querySelector('#email');
  const passwordInput = container.querySelector('#password');
  const submitButton = container.querySelector('.submit-btn');

  // ❌ fireEvent 사용
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);

  // ❌ waitFor 빈 콜백
  await waitFor(() => {});

  // ❌ testid로 쿼리
  expect(container.querySelector('[data-testid="success"]')).not.toBe(null);
});
```

```typescript
// ✅ Good: 베스트 프랙티스 적용
it('이메일과 비밀번호로 로그인할 수 있다', async () => {
  render(<LoginForm />);

  // ✅ screen + labelText 사용
  const emailInput = screen.getByLabelText(/이메일/i);
  const passwordInput = screen.getByLabelText(/비밀번호/i);
  const submitButton = screen.getByRole('button', { name: /로그인/i });

  // ✅ userEvent 사용
  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.type(passwordInput, 'password123');
  await userEvent.click(submitButton);

  // ✅ find* + 명시적 assertion
  const successMessage = await screen.findByText(/로그인 성공/i);
  expect(successMessage).toBeInTheDocument();
});
```

---

## 요약 체크리스트

### ESLint & Setup

- [ ] `eslint-plugin-testing-library` 설치 및 설정
- [ ] `eslint-plugin-jest-dom` 설치 및 설정
- [ ] `cleanup` 수동 호출 제거

### Query

- [ ] `screen` 객체 사용
- [ ] `getByRole` 최우선 사용
- [ ] `container.querySelector()` 제거
- [ ] 보이는 텍스트로 쿼리
- [ ] `getByTestId` 최소화

### Assertion

- [ ] jest-dom matcher 사용
- [ ] `query*`는 부재 확인에만 사용
- [ ] 명시적 assertion 추가

### Async

- [ ] `act()` 불필요한 사용 제거
- [ ] `waitFor()` 구체적 조건 포함
- [ ] `find*` 쿼리 우선 사용
- [ ] side effect를 `waitFor` 밖으로 이동

### Accessibility

- [ ] 불필요한 `role`, `aria-*` 제거
- [ ] 시맨틱 HTML 우선 사용

### User Interaction

- [ ] `fireEvent` 대신 `userEvent` 사용

---

## 참고 자료

- [rules/README.md](./README.md): 테스트 규칙 가이드
- [rules/testing-library-queries.md](./testing-library-queries.md): 쿼리 우선순위
- [rules/tdd-principles.md](./tdd-principles.md): TDD 원칙

---

**이전 문서**: [Testing Library 쿼리 우선순위](./testing-library-queries.md)
**다음 문서**: [TDD 원칙 및 안티패턴](./tdd-principles.md)
