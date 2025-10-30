# Testing Library 쿼리 우선순위

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [쿼리 우선순위 3단계](#쿼리-우선순위-3단계)
3. [Priority 1: 접근성 쿼리](#priority-1-접근성-쿼리)
4. [Priority 2: 시맨틱 쿼리](#priority-2-시맨틱-쿼리)
5. [Priority 3: TestId 쿼리](#priority-3-testid-쿼리)
6. [쿼리 변형 (get, query, find)](#쿼리-변형-get-query-find)
7. [TypeScript 타입 안전성](#typescript-타입-안전성)

---

## 개요

### 핵심 원칙

> **"테스트는 사용자가 앱과 상호작용하는 방식을 최대한 모방해야 합니다."**

쿼리 선택 시 항상 다음 질문을 고려하세요:

- ✅ 실제 사용자가 이 요소를 어떻게 찾을까?
- ✅ 시각 장애인이 스크린 리더로 이 요소를 찾을 수 있을까?
- ✅ 이 쿼리가 접근성 문제를 감지할 수 있을까?

---

## 쿼리 우선순위 3단계

### 우선순위 결정 트리

```
┌─────────────────────────────────┐
│ Role이 있는가? (button, textbox) │ → YES → getByRole ✅
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ Label이 있는가? (form 요소)      │ → YES → getByLabelText ✅
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ Placeholder가 있는가?            │ → YES → getByPlaceholderText ⚠️
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ 텍스트 내용이 있는가?             │ → YES → getByText ✅
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ Alt text가 있는가? (img 등)     │ → YES → getByAltText ✅
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ Title 속성이 있는가?             │ → YES → getByTitle ⚠️
└─────────────────────────────────┘
              ↓ NO
┌─────────────────────────────────┐
│ 최후의 수단                      │ → getByTestId ❌
└─────────────────────────────────┘
```

---

## Priority 1: 접근성 쿼리

모든 사용자(시각 장애인 포함)가 요소를 찾는 방식을 반영합니다.

### 1. getByRole (최우선 권장 ⭐⭐⭐)

**설명**: 접근성 트리에 노출된 모든 요소를 쿼리할 수 있습니다.

**장점**:

- ✅ 접근성 문제를 자동으로 감지
- ✅ 시맨틱 HTML 강제
- ✅ 가장 사용자 중심적

**사용법**:

```typescript
// ✅ Good: 역할과 접근 가능한 이름으로 쿼리
screen.getByRole('button', { name: /제출/i });
screen.getByRole('textbox', { name: /이메일/i });
screen.getByRole('heading', { level: 1, name: /제목/i });
```

**TypeScript 타입 힌트**:

```typescript
import { screen } from '@testing-library/react';
import type { ByRoleMatcher, ByRoleOptions } from '@testing-library/react';

// role은 자동완성됨
const button = screen.getByRole('button', { name: /제출/i });
//                                ^ 'button' | 'link' | 'textbox' | ...

// 반환 타입은 HTMLElement
const element: HTMLElement = button;
```

**주요 Role 목록**:
| HTML 요소 | role | 예시 |
|-----------|------|------|
| `<button>` | button | `getByRole('button', { name: /클릭/i })` |
| `<a>` | link | `getByRole('link', { name: /홈으로/i })` |
| `<input type="text">` | textbox | `getByRole('textbox', { name: /이름/i })` |
| `<input type="checkbox">` | checkbox | `getByRole('checkbox', { name: /동의/i })` |
| `<select>` | combobox | `getByRole('combobox', { name: /선택/i })` |
| `<h1>` ~ `<h6>` | heading | `getByRole('heading', { level: 1 })` |
| `<img>` | img | `getByRole('img', { name: /로고/i })` |

**실전 예시**:

```typescript
// ❌ Bad: 클래스 이름으로 쿼리
const button = container.querySelector('.submit-button');

// ✅ Good: role로 쿼리
const button = screen.getByRole('button', { name: /제출/i });
```

---

### 2. getByLabelText (form 요소 최우선 ⭐⭐⭐)

**설명**: `<label>` 요소와 연결된 form 요소를 쿼리합니다.

**장점**:

- ✅ form 접근성 보장
- ✅ label과 input 연결 검증
- ✅ 사용자가 form을 채우는 방식 반영

**사용법**:

```typescript
// ✅ Good: label 텍스트로 input 찾기
screen.getByLabelText(/이메일/i);
screen.getByLabelText(/비밀번호/i);
```

**HTML 구조 요구사항**:

```tsx
{/* ✅ Good: 명시적 label 연결 */}
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

{/* ✅ Good: 암묵적 label 연결 */}
<label>
  이메일
  <input type="email" />
</label>

{/* ❌ Bad: label 없음 (getByLabelText 사용 불가) */}
<input type="email" placeholder="이메일" />
```

**실전 예시**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('이메일 입력 필드에 값을 입력할 수 있다', async () => {
  render(<LoginForm />);

  // ✅ Good: label로 input 찾기
  const emailInput = screen.getByLabelText(/이메일/i);
  await userEvent.type(emailInput, 'test@example.com');

  expect(emailInput).toHaveValue('test@example.com');
});
```

---

### 3. getByPlaceholderText (label 대안 ⚠️)

**설명**: placeholder 속성으로 요소를 찾습니다.

**주의사항**:

- ⚠️ placeholder는 label을 대체할 수 없음
- ⚠️ label이 없으면 접근성 문제
- ⚠️ 가능하면 `getByLabelText` 사용 권장

**사용법**:

```typescript
// ⚠️ 차선책: label이 없을 때만 사용
screen.getByPlaceholderText(/검색어를 입력하세요/i);
```

**개선 방법**:

```tsx
{/* ❌ Bad: placeholder만 있음 */}
<input placeholder="이메일" />

{/* ✅ Good: label 추가 */}
<label htmlFor="email">이메일</label>
<input id="email" placeholder="example@domain.com" />
```

---

### 4. getByText (비대화형 요소 ⭐⭐)

**설명**: 텍스트 내용으로 요소를 찾습니다. 주로 `div`, `span`, `p` 등 비대화형 요소에 사용합니다.

**장점**:

- ✅ 사용자가 보는 텍스트로 검증
- ✅ 번역 누락 감지 가능

**사용법**:

```typescript
// ✅ Good: 텍스트 내용으로 요소 찾기
screen.getByText(/환영합니다/i);
screen.getByText(/총 5개의 항목/i);

// ✅ Good: 정규식으로 부분 매칭
screen.getByText(/결제가 완료되었습니다/i);
```

**실전 예시**:

```typescript
it('일정이 추가되면 목록에 표시된다', () => {
  render(<EventList events={mockEvents} />);

  // ✅ Good: 텍스트로 일정 제목 확인
  expect(screen.getByText(/팀 회의/i)).toBeInTheDocument();
  expect(screen.getByText(/2025-10-27/i)).toBeInTheDocument();
});
```

**주의사항**:

```typescript
// ❌ Bad: button, link 등 대화형 요소는 getByRole 사용
const button = screen.getByText(/제출/i);

// ✅ Good: 대화형 요소는 role로 찾기
const button = screen.getByRole('button', { name: /제출/i });
```

---

### 5. getByDisplayValue (form 값 채움 상태)

**설명**: input, textarea, select의 현재 값으로 요소를 찾습니다.

**사용 시나리오**:

- 수정 폼에서 기존 값 확인
- 여러 input 중 특정 값을 가진 요소 찾기

**사용법**:

```typescript
// ✅ Good: 미리 채워진 값으로 input 찾기
const input = screen.getByDisplayValue(/기존 제목/i);
```

**실전 예시**:

```typescript
it('수정 모드에서 기존 일정 정보가 로드된다', () => {
  render(<EventForm event={existingEvent} mode="edit" />);

  // ✅ Good: 기존 값으로 input 확인
  expect(screen.getByDisplayValue(/팀 회의/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue(/2025-10-27/i)).toBeInTheDocument();
});
```

---

## Priority 2: 시맨틱 쿼리

HTML5 및 ARIA 호환 쿼리입니다.

### 6. getByAltText (이미지, area, input)

**설명**: `alt` 속성으로 요소를 찾습니다.

**사용 시나리오**:

- `<img>` 요소
- `<area>` 요소
- `<input type="image">` 요소

**사용법**:

```typescript
// ✅ Good: alt 텍스트로 이미지 찾기
screen.getByAltText(/회사 로고/i);
screen.getByAltText(/사용자 프로필 사진/i);
```

**HTML 요구사항**:

```tsx
{
  /* ✅ Good: alt 속성 필수 */
}
<img src="/logo.png" alt="회사 로고" />;

{
  /* ❌ Bad: alt 없음 (접근성 문제) */
}
<img src="/logo.png" />;
```

---

### 7. getByTitle (최소 사용 권장 ⚠️)

**설명**: `title` 속성으로 요소를 찾습니다.

**단점**:

- ⚠️ 스크린 리더 지원 일관성 부족
- ⚠️ 시각적 사용자에게 기본적으로 표시되지 않음
- ⚠️ hover 시에만 tooltip으로 표시됨

**사용법**:

```typescript
// ⚠️ 차선책: 다른 쿼리 사용 불가할 때만
screen.getByTitle(/닫기/i);
```

**개선 방법**:

```tsx
{
  /* ❌ Bad: title만 사용 */
}
<button title="닫기">X</button>;

{
  /* ✅ Good: aria-label 사용 */
}
<button aria-label="닫기">X</button>;

{
  /* ✅ Better: 접근 가능한 텍스트 */
}
<button>닫기</button>;
```

---

## Priority 3: TestId 쿼리

### 8. getByTestId (최후의 수단 ❌)

**설명**: `data-testid` 속성으로 요소를 찾습니다.

**사용 시나리오** (오직 다음 경우에만):

- 텍스트가 동적으로 변경되는 경우
- role이나 label이 없는 레거시 코드
- 시맨틱 쿼리로 특정할 수 없는 경우

**단점**:

- ❌ 사용자가 볼 수 없는 속성
- ❌ 접근성 검증 불가
- ❌ 코드 중복 (HTML + 테스트 모두 유지)

**사용법**:

```typescript
// ❌ Bad: 너무 쉽게 사용
const element = screen.getByTestId('submit-button');

// ✅ Good: 정말 필요한 경우만
const dynamicContent = screen.getByTestId('loading-spinner');
```

**개선 사례**:

```tsx
{
  /* ❌ Bad: testid에 의존 */
}
<button data-testid="submit-button">제출</button>;
// 테스트: screen.getByTestId('submit-button')

{
  /* ✅ Good: role 사용 */
}
<button>제출</button>;
// 테스트: screen.getByRole('button', { name: /제출/i })
```

---

## 쿼리 변형 (get, query, find)

각 쿼리는 3가지 변형이 있습니다:

### get\* - 동기, 요소 존재 기대

- **반환**: 요소 또는 에러 throw
- **사용 시기**: 요소가 반드시 존재해야 할 때

```typescript
// ✅ Good: 요소가 존재해야 함
const button = screen.getByRole('button', { name: /제출/i });
```

---

### query\* - 동기, 요소 부재 확인

- **반환**: 요소 또는 null
- **사용 시기**: 요소가 없는지 확인할 때

```typescript
// ✅ Good: 요소가 없는지 확인
expect(screen.queryByText(/에러 메시지/i)).not.toBeInTheDocument();

// ❌ Bad: 존재 확인에 query* 사용
expect(screen.queryByRole('button')).toBeInTheDocument();
// ✅ Good: 존재 확인은 get* 사용
expect(screen.getByRole('button')).toBeInTheDocument();
```

---

### find\* - 비동기, 요소 대기

- **반환**: Promise<Element>
- **사용 시기**: 비동기로 나타나는 요소 (API 호출 후 등)

```typescript
// ✅ Good: 비동기 요소 대기
const successMessage = await screen.findByText(/성공/i);

// ❌ Bad: waitFor + get 조합
await waitFor(() => {
  expect(screen.getByText(/성공/i)).toBeInTheDocument();
});

// ✅ Good: find* 사용
expect(await screen.findByText(/성공/i)).toBeInTheDocument();
```

---

## TypeScript 타입 안전성

### screen 객체 타입

```typescript
import { screen } from '@testing-library/react';

// screen의 모든 쿼리는 HTMLElement 또는 null 반환
const button: HTMLElement = screen.getByRole('button');
const maybeText: HTMLElement | null = screen.queryByText(/optional/i);
const asyncElement: Promise<HTMLElement> = screen.findByRole('alert');
```

### 커스텀 타입 가드

```typescript
// input 요소 타입 단언
function getInputElement(name: string): HTMLInputElement {
  const element = screen.getByLabelText(name);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Expected input element, got ${element.tagName}`);
  }
  return element;
}

// 사용
const emailInput = getInputElement(/이메일/i);
emailInput.value; // TypeScript가 value 속성 인식
```

---

## 요약

### 쿼리 선택 체크리스트

1. ✅ **getByRole** 사용 가능한가? → **최우선 사용**
2. ✅ form 요소인가? → **getByLabelText** 사용
3. ⚠️ label이 없는가? → **getByPlaceholderText** (개선 필요)
4. ✅ 텍스트 내용이 있는가? → **getByText** 사용
5. ✅ 이미지인가? → **getByAltText** 사용
6. ⚠️ title만 있는가? → **getByTitle** (개선 필요)
7. ❌ 정말 다른 방법이 없는가? → **getByTestId** (최후의 수단)

### 핵심 원칙 재확인

> "접근성 쿼리를 사용할 수 없다면, UI 자체에 접근성 문제가 있을 가능성이 높습니다."

---

## 참고 자료

- [rules/README.md](./README.md): 테스트 규칙 가이드
- [rules/react-testing-library-best-practices.md](./react-testing-library-best-practices.md): RTL 베스트 프랙티스
- [specs/08-test-scenarios.md](../specs/08-test-scenarios.md): 테스트 시나리오

---

**이전 문서**: [README.md](./README.md)
**다음 문서**: [React Testing Library 베스트 프랙티스](./react-testing-library-best-practices.md)
