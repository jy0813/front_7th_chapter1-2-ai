# Refactor Phase 코드 개선

**Agent**: Agent 5 (Refactor)
**기능명**: [기능명]
**작성일**: [YYYY-MM-DD]
**Phase**: 🔵 REFACTOR

---

## 1. 리팩토링 대상

### 파일
- `src/utils/[파일명].ts`

### 개선 목표
- 중복 코드 제거
- TypeScript 타입 정의 추가/강화
- JSDoc 주석 추가
- 가독성 향상

---

## 2. 리팩토링 범위 제한 (v2.8.0)

### ⚠️ 절대 규칙
- ✅ **현재 파일만 수정**
- ❌ **다른 파일 수정 절대 금지**

**이유**: 과도한 수정은 디버깅을 어렵게 만들고 TDD 사이클 위반

---

## 3. 개선 사항

### 개선 1: 중복 코드 제거
**Before**:
```typescript
// 중복된 로직
function func1() { /* 반복 로직 */ }
function func2() { /* 반복 로직 */ }
```

**After**:
```typescript
// 공통 헬퍼 함수 추출
function helperFunc() { /* 공통 로직 */ }
function func1() { helperFunc(); }
function func2() { helperFunc(); }
```

### 개선 2: TypeScript 타입 정의 추가
**Before**:
```typescript
function calculate(a, b) { return a + b; }
```

**After**:
```typescript
function calculate(a: number, b: number): number { return a + b; }
```

### 개선 3: JSDoc 주석 추가
```typescript
/**
 * [함수 역할 설명]
 * @param param1 [파라미터 설명]
 * @param param2 [파라미터 설명]
 * @returns [반환값 설명]
 */
function funcName(param1: Type1, param2: Type2): ReturnType {
  // ...
}
```

### 개선 4: 가독성 향상
- 변수명 명확히 하기
- 복잡한 로직에 주석 추가
- 매직 넘버 상수화

---

## 4. 테스트 및 린트 검증

### 테스트 통과 ✅
```bash
pnpm test

# 예상된 성공 출력:
# PASS  src/__tests__/unit/easy.[기능명].spec.ts
#   ✓ [모든 테스트 여전히 통과]
```

### 린트 검증 ✅
```bash
# ESLint 검사
pnpm lint:eslint

# TypeScript 타입 체크
pnpm lint:tsc

# 예상된 성공 출력:
# ✔ No ESLint errors found
# ✔ TypeScript compilation successful
```

---

## 5. 개선 효과

### 코드 품질 향상
- 중복 코드: [N개 → M개]
- 타입 안전성: [타입 추가된 함수 수]
- JSDoc 커버리지: [N%]

### 가독성 개선
- 함수당 평균 라인 수: [Before vs After]
- 복잡도: [Before vs After]

---

## 6. 다음 단계

**Agent 6에게 전달**:
- 개선된 파일: `src/utils/[파일명].ts`
- 품질 검증 가능

**Git 커밋**:
```bash
git add src/utils/[파일명].ts
git commit -m "refactor: [REFACTOR] [기능명] 코드 개선"
```

---

**생성 도구**: `.claude/scripts/doc-generator.sh 5 [기능명]`
**테스트 강제**: `.claude/scripts/test-enforcer.sh REFACTOR`
