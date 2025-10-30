# 일정 관리 캘린더 애플리케이션 명세서

**버전**: 1.0.0
**최종 업데이트**: 2025-10-27
**작성 목적**: AI와 테스트를 활용한 안정적인 기능 개발

---

## 📋 명세서 소개

이 명세서는 **살아있는 문서(Living Documentation)**로, 일정 관리 캘린더 애플리케이션의 모든 요구사항, 비즈니스 로직, 테스트 시나리오를 포함합니다.

### 명세서의 목적

1. **의도와 가치를 명확하게 표현**: 모호하지 않은 언어로 시스템의 동작을 정의
2. **AI 코드 생성 가능**: AI가 이 명세를 읽고 올바른 코드를 생성할 수 있는 수준의 상세함
3. **테스트 가능**: 모든 명세 항목은 테스트 케이스로 검증 가능
4. **협업 가능**: 개발자, QA, 기획자 모두가 읽고 기여할 수 있는 자연어 기반
5. **버전 관리**: Git으로 변경 이력을 추적하고 코드와 함께 동기화

---

## 🗂️ 문서 구조

### 핵심 명세 문서

| 문서                                                  | 설명                                  | 주요 독자  |
| ----------------------------------------------------- | ------------------------------------- | ---------- |
| [01. 데이터 모델](./01-data-models.md)                | 타입 정의, 데이터 구조, 필드 제약사항 | 개발자, AI |
| [02. 비즈니스 규칙](./02-business-rules.md)           | 핵심 비즈니스 로직 및 제약사항        | 전체       |
| [03. 사용자 워크플로우](./03-user-workflows.md)       | 사용자 시나리오 및 단계별 동작        | 기획자, QA |
| [04. API 명세](./04-api-specification.md)             | REST API 엔드포인트 상세              | 개발자     |
| [05. 검증 규칙](./05-validation-rules.md)             | 입력 유효성 검증 로직                 | 개발자, QA |
| [06. 일정 겹침 감지](./06-event-overlap-detection.md) | 겹침 판단 알고리즘                    | 개발자, AI |
| [07. 알림 시스템](./07-notification-system.md)        | 알림 트리거 및 표시 로직              | 개발자, QA |
| [08. 테스트 시나리오](./08-test-scenarios.md)         | 수용 기준 및 테스트 케이스            | QA, 개발자 |

### 읽는 순서 (역할별)

**개발자가 처음 읽을 때**:

1. 데이터 모델 → 비즈니스 규칙 → API 명세 → 검증 규칙 → 테스트 시나리오

**QA가 테스트 작성 시**:

1. 사용자 워크플로우 → 비즈니스 규칙 → 테스트 시나리오 → 검증 규칙

**AI가 코드 생성 시**:

1. 데이터 모델 → 비즈니스 규칙 → API 명세 → 검증 규칙 → 일정 겹침 감지

---

## 🎯 명세 작성 원칙

### 1. 명확하고 모호하지 않은 표현

**❌ 나쁜 예시**:

```
일정은 적절한 시간에 저장되어야 한다.
```

**✅ 좋은 예시**:

```
일정 생성 시 다음 조건을 만족해야 한다:
- 시작 시간이 종료 시간보다 빠름 (startTime < endTime)
- 날짜 형식은 ISO 8601 준수 (YYYY-MM-DD)
- 시간 형식은 24시간제 (HH:mm)
```

### 2. 실행 가능하고 테스트 가능

모든 명세는 다음을 포함합니다:

- **Given** (전제 조건): 테스트 초기 상태
- **When** (동작): 사용자 또는 시스템 액션
- **Then** (결과): 예상되는 결과 및 부작용

**예시**:

```
Given: 사용자가 "2025-10-27" 날짜에 "10:00-12:00" 일정 A를 가지고 있음
When: "2025-10-27" 날짜에 "11:00-13:00" 일정 B를 생성 시도
Then: 일정 겹침 경고 다이얼로그가 표시됨
```

### 3. 의도와 가치 명시

각 기능에는 **"왜(Why)"**를 설명합니다:

```
## 일정 겹침 감지 기능

### 비즈니스 가치
- 사용자가 이중 예약을 방지하여 시간 관리 실수를 줄임
- 중요한 회의가 겹치는 상황을 사전에 경고

### 구현 의도
- 시각적인 경고로 사용자의 주의를 환기
- 사용자가 최종 결정권을 가짐 (강제하지 않음)
```

### 4. 예외 상황 명시

모든 정상 케이스(Happy Path)와 함께 예외 상황(Edge Case)도 정의합니다:

```
## 시간 유효성 검증

### 정상 케이스
- startTime: "09:00", endTime: "10:00" → 통과

### 예외 케이스
- startTime: "10:00", endTime: "09:00" → 에러: "시작 시간은 종료 시간보다 빨라야 합니다"
- startTime: "10:00", endTime: "10:00" → 에러: "시작 시간은 종료 시간보다 빨라야 합니다"
- startTime: "", endTime: "10:00" → 검증 생략 (필수 필드 검증은 별도)
```

---

## 🔄 TDD 개발 워크플로우

### 핵심 원칙: Test-Driven Development

이 프로젝트는 **TDD(Test-Driven Development)** 방법론을 따릅니다. 명세를 읽고 **테스트를 먼저 작성**한 후, 테스트를 통과하는 코드를 구현합니다.

### Red-Green-Refactor 사이클

```
1. 🔴 Red: 실패하는 테스트 작성
   ├─ specs/ 디렉토리의 해당 명세 파일 읽기
   ├─ 명세를 바탕으로 테스트 케이스 작성 (Vitest)
   └─ 테스트 실행 → 실패 확인 (아직 구현 안 됨)

2. 🟢 Green: 테스트를 통과하는 최소한의 코드 작성
   ├─ 명세의 요구사항만 충족하는 구현
   └─ 테스트 실행 → 성공 확인

3. 🔵 Refactor: 코드 개선
   ├─ 중복 제거, 가독성 향상
   ├─ 명세 준수 확인
   └─ 테스트는 여전히 통과해야 함
```

### Given-When-Then의 역할

이 명세에서 **Given-When-Then**은 BDD 도구가 아닌, **테스트 케이스를 명확히 구조화하는 패턴**입니다.

| 명세 표현 | TDD 의미  | Vitest 코드           |
| --------- | --------- | --------------------- |
| **Given** | 전제 조건 | Arrange (테스트 준비) |
| **When**  | 동작      | Act (함수 호출)       |
| **Then**  | 결과 검증 | Assert (결과 확인)    |

### 명세 → 테스트 코드 변환 예시

#### 명세 (specs/05-validation-rules.md)

```gherkin
Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('14:00', '13:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  }
```

#### TDD 테스트 코드 (Vitest)

```typescript
describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환', () => {
    // Given (Arrange) - 테스트 전제 조건
    const startTime = '14:00';
    const endTime = '13:00';

    // When (Act) - 테스트 대상 함수 실행
    const result = getTimeErrorMessage(startTime, endTime);

    // Then (Assert) - 결과 검증
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });
});
```

### TDD 워크플로우 전체 과정

```
1. 📋 명세 읽기
   └─ specs/05-validation-rules.md 확인

2. 🔴 실패하는 테스트 작성
   ├─ src/__tests__/unit/timeValidation.spec.ts 생성
   ├─ 명세의 시나리오를 Vitest 코드로 변환
   └─ pnpm test → 실패 (함수가 아직 없음)

3. 🟢 최소 구현
   ├─ src/utils/timeValidation.ts 생성
   ├─ getTimeErrorMessage 함수 구현
   └─ pnpm test → 성공

4. 🔵 리팩토링
   ├─ 코드 정리 및 개선
   ├─ 명세와 일치하는지 재확인
   └─ pnpm test → 여전히 성공

5. ✅ 커밋
   └─ git commit -m "feat: 시간 유효성 검증 구현 (TDD)"
```

### AI 도구와 TDD

#### Claude Code에 테스트 먼저 요청

```bash
"specs/05-validation-rules.md를 읽고 timeValidation.spec.ts 테스트 코드를 먼저 작성해줘.
그 다음 테스트를 통과하는 getTimeErrorMessage 함수를 구현해줘."
```

#### GitHub Copilot 활용

```typescript
// 📋 명세: specs/05-validation-rules.md
// 🔴 TDD: 테스트 먼저 작성됨 (timeValidation.spec.ts)

/**
 * 시간 유효성 검증
 * @see specs/05-validation-rules.md
 */
export function getTimeErrorMessage(start: string, end: string) {
  // Copilot이 명세와 테스트를 보고 구현 제안
}
```

---

## 🔄 명세 업데이트 프로세스

### 명세가 변경되어야 하는 경우

1. **새로운 기능 추가**: 명세를 먼저 작성한 후 구현
2. **버그 수정**: 버그가 명세 오류인지 구현 오류인지 판단 후 명세 업데이트
3. **요구사항 변경**: 명세 수정 후 관련 테스트 및 코드 업데이트

### 명세 업데이트 워크플로우

```
1. 명세 수정 (specs/*.md)
2. 테스트 케이스 업데이트 (src/__tests__/*.spec.ts)
3. 코드 구현
4. 테스트 실행 및 검증
5. Git 커밋 (명세 + 테스트 + 코드를 함께 커밋)
```

### 커밋 메시지 컨벤션

```
feat: [SPEC] 새로운 반복 일정 기능 추가

- specs/02-business-rules.md에 반복 일정 규칙 추가
- specs/08-test-scenarios.md에 반복 일정 테스트 시나리오 추가
- 실제 구현은 다음 커밋에서 진행
```

---

## 🤖 AI 도구로 명세 활용하기

### Claude Code에서 명세 읽기

```bash
# 특정 기능 구현 시
"specs/06-event-overlap-detection.md를 읽고 isOverlapping 함수를 구현해줘"

# 전체 명세 기반 구현 시
"specs/ 디렉토리의 모든 명세를 읽고 일정 관리 시스템을 구현해줘"
```

### GitHub Copilot에서 명세 활용

코드 파일 상단에 명세 링크를 주석으로 추가:

```typescript
/**
 * 일정 겹침 감지 유틸리티
 *
 * @see specs/06-event-overlap-detection.md
 * 명세에 정의된 알고리즘에 따라 두 일정이 겹치는지 판단합니다.
 */
export function isOverlapping(event1: Event, event2: Event): boolean {
  // 구현...
}
```

### Cursor에서 명세 기반 개발

1. `.cursorrules` 파일에 명세 경로 추가:

```
Always reference specifications in specs/ directory before implementing features.
```

2. 프롬프트 예시:

```
"specs/05-validation-rules.md의 시간 검증 규칙을 구현해줘.
명세의 모든 예외 케이스를 처리하고 테스트 코드도 작성해줘."
```

---

## 📊 명세 검증 체크리스트

각 명세 문서는 다음 기준을 만족해야 합니다:

- [ ] **명확성**: 모호한 표현 없이 구체적으로 기술
- [ ] **완전성**: 정상 케이스와 예외 케이스 모두 포함
- [ ] **테스트 가능성**: Given-When-Then 형식의 검증 기준 제공
- [ ] **실행 가능성**: AI가 읽고 코드를 생성할 수 있는 수준
- [ ] **예시 포함**: 실제 데이터 예시 및 코드 스니펫 제공
- [ ] **의도 설명**: 비즈니스 가치 및 설계 의도 명시
- [ ] **상호 참조**: 관련 명세 문서 링크 제공

---

## 📚 참고 자료

### 내부 문서

- [CLAUDE.md](../CLAUDE.md): Claude Code를 위한 개발 가이드
- [README.md](../README.md): 프로젝트 전체 개요

### 테스트 규칙

- [rules/README.md](../rules/README.md): 테스트 규칙 가이드 개요
- [rules/testing-library-queries.md](../rules/testing-library-queries.md): Testing Library 쿼리 우선순위
- [rules/react-testing-library-best-practices.md](../rules/react-testing-library-best-practices.md): React Testing Library 베스트 프랙티스
- [rules/tdd-principles.md](../rules/tdd-principles.md): TDD 원칙 및 안티패턴

---

## 🔖 버전 히스토리

| 버전  | 날짜       | 변경 내용      | 작성자      |
| ----- | ---------- | -------------- | ----------- |
| 1.0.0 | 2025-10-27 | 초기 명세 작성 | Claude Code |

---

## 📞 명세 관련 문의

명세에 대한 질문, 개선 제안, 오류 발견 시:

1. GitHub Issue 생성
2. PR로 직접 명세 수정 제안
3. 팀 미팅에서 논의

**명세는 살아있는 문서입니다. 적극적으로 개선해주세요!** 🚀
