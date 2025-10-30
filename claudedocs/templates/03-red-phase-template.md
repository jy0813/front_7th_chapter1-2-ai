# Red Phase 테스트 작성

**Agent**: Agent 3 (Red Phase)
**기능명**: [기능명]
**작성일**: [YYYY-MM-DD]
**Phase**: 🔴 RED

---

## 1. 참조 문서

### 필수 준수 규칙

- [x] `rules/tdd-principles.md` 읽기
- [x] `rules/testing-library-queries.md` 읽기
- [x] `rules/react-testing-library-best-practices.md` 읽기

### 우선 참조 순서

1. **🥇 `claudedocs/02-test-design-[기능명].md`** (Agent 2가 설계한 테스트 시나리오)
2. **🥈 `specs/[기능명].md`** (명세 문서)

---

## 2. 작성한 테스트 파일

### 단위 테스트

- `src/__tests__/unit/easy.[기능명].spec.ts`
  - [함수명 1] 테스트
  - [함수명 2] 테스트
  - [함수명 3] 테스트 (엣지 케이스 포함)

### 훅 테스트

- `src/__tests__/hooks/medium.[훅명].spec.ts`
  - [훅명] 동작 테스트

---

## 3. 테스트 실행 결과

### 실패 확인 ✅

```bash
pnpm test

# 예상된 실패 출력:
# FAIL  src/__tests__/unit/easy.[기능명].spec.ts
#   ● [함수명] › [시나리오]
#     ReferenceError: [함수명] is not defined
```

**실패 이유**: 구현 코드가 아직 작성되지 않음 (예상된 동작)

---

## 4. Testing Rules 준수 확인

### 쿼리 우선순위 (Testing Library)

- [x] `getByRole` 우선 사용
- [x] `getByLabelText` 차선 사용
- [x] `getByTestId` 최후의 수단

### Given-When-Then 패턴

- [x] 모든 테스트에 G-W-T 주석 포함
- [x] 각 단계 명확히 구분

### 테스트 작성 원칙

- [x] 독립적 테스트 (다른 테스트에 영향 없음)
- [x] 반복 가능 (항상 같은 결과)
- [x] 빠른 실행

---

## 5. 다음 단계

**Agent 4에게 전달**:

- 작성된 테스트: `src/__tests__/unit/easy.[기능명].spec.ts`
- Green Phase 시작 가능

**Git 커밋**:

```bash
git add src/__tests__/unit/easy.[기능명].spec.ts
git commit -m "test: [RED] [기능명] 테스트 작성"
```

---

**생성 도구**: `.claude/scripts/doc-generator.sh 3 [기능명]`
**테스트 강제**: `.claude/scripts/test-enforcer.sh RED src/__tests__/unit/easy.[기능명].spec.ts`
