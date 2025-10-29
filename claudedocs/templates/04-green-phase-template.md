# Green Phase 코드 구현

**Agent**: Agent 4 (Green Phase)
**기능명**: [기능명]
**작성일**: [YYYY-MM-DD]
**Phase**: 🟢 GREEN

---

## 1. 프로젝트 구조 파악

### 참조 문서
- [x] `src/types.ts` 읽기 (타입 정의)
- [x] `specs/[기능명].md` 읽기 (명세)
- [x] `specs/04-api-specification.md` 읽기 (API 명세, 해당 시)
- [x] 기존 코드 패턴 분석

---

## 2. 최소 구현 원칙 (v2.7.0)

### 3대 원칙
1. **YAGNI (You Aren't Gonna Need It)**: 테스트에 명시되지 않은 기능은 구현하지 않음
2. **단순성 우선 (Simplicity First)**: 가장 단순한 방법으로 테스트를 통과시킴
3. **Fake it till you make it**: 하드코딩도 허용, Refactor Phase에서 일반화

### 판단 기준
- ✅ 이 코드가 테스트를 통과하는가?
- ✅ 더 단순한 방법은 없는가?
- ✅ 테스트에 없는 기능을 구현했는가? (NO여야 함)

---

## 3. 구현 파일

### 파일 1: `src/utils/[파일명].ts`
**함수**:
- `[함수명1]`: [역할 설명]
- `[함수명2]`: [역할 설명]
- `[헬퍼함수]`: [역할 설명]

**TypeScript 타입**:
```typescript
export type [타입명] = {
  field1: string;
  field2: number;
  // ...
};
```

### 파일 2: `src/hooks/[훅명].ts` (해당 시)
**커스텀 훅**:
- `use[훅명]`: [역할 설명]

---

## 4. 특수 케이스 처리

### 케이스 1: [케이스 설명]
**처리 로직**:
```typescript
// 예: 31일 매월 반복 처리
if (day === 31 && ![1, 3, 5, 7, 8, 10, 12].includes(month)) {
  continue; // 31일이 없는 달은 건너뜀
}
```

### 케이스 2: [케이스 설명]
**처리 로직**:
```typescript
// 예: 윤년 2월 29일 처리
if (month === 2 && day === 29 && !isLeapYear(year)) {
  continue; // 평년은 건너뜀
}
```

---

## 5. 테스트 실행 결과

### 성공 확인 ✅
```bash
pnpm test

# 예상된 성공 출력:
# PASS  src/__tests__/unit/easy.[기능명].spec.ts
#   ✓ [함수명] › [시나리오 1] (5 ms)
#   ✓ [함수명] › [시나리오 2] (3 ms)
#   ✓ [함수명] › [엣지 케이스] (4 ms)
```

**성공 이유**: 최소 구현으로 모든 테스트 통과

---

## 6. 코드 설명

### 주요 알고리즘
1. **[알고리즘 1]**: [설명]
2. **[알고리즘 2]**: [설명]

### API 사용법 (해당 시)
**엔드포인트**: `POST /api/[엔드포인트]`
```typescript
const response = await fetch('/api/[엔드포인트]', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## 7. 다음 단계

**Agent 5에게 전달**:
- 구현 파일: `src/utils/[파일명].ts`
- Refactor Phase 시작 가능

**Git 커밋**:
```bash
git add src/utils/[파일명].ts
git commit -m "feat: [GREEN] [기능명] 최소 구현"
```

---

**생성 도구**: `.claude/scripts/doc-generator.sh 4 [기능명]`
**테스트 강제**: `.claude/scripts/test-enforcer.sh GREEN`
