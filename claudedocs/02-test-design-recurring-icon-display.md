# 테스트 구조 설계

**Agent**: Agent 2 (Test Design)
**기능명**: recurring-icon-display (반복 일정 아이콘 표시)
**작성일**: 2025-10-31
**상태**: ✅ 완료

---

## 1. 명세 및 규칙 확인

### 참조 문서
- [x] 사용자 요구사항: "캘린더 뷰에서 반복 일정을 아이콘을 넣어 구분하여 표시한다."
- [x] `rules/tdd-principles.md` 읽기
- [x] `rules/testing-library-queries.md` 읽기
- [x] 기존 테스트 파일 패턴 확인

---

## 2. 명세 품질 검증 (v2.8.0)

### 1. ✅ 패턴 준수
- [x] 명세가 간단하여 Given-When-Then 패턴이 필요하지 않음
  - **근거 (사실)**: 요구사항이 "반복 일정에 아이콘 표시" 한 가지 동작만 명시
  - **근거 (평가)**: UI 표시 기능으로 단순하여 시나리오 형식 불필요
  - **근거 (대안)**: 피드백 불필요

### 2. ✅ 예시 포함
- [x] 구체적인 입력값과 예시 결과값 포함
  - **근거 (사실)**: repeat.type이 'none'이 아닌 모든 경우 아이콘 표시
  - **근거 (평가)**: 반복 유형별 (daily, weekly, monthly, yearly) 테스트 가능
  - **근거 (대안)**: 피드백 불필요

### 3. ✅ 엣지 케이스
- [x] 경계 조건 명시
  - **근거 (사실)**: repeat.type === 'none'인 경우 아이콘 미표시
  - **근거 (평가)**: 일반 일정과 반복 일정 구분 케이스 포함
  - **근거 (대안)**: 피드백 불필요

### 4. ✅ 테스트 가능
- [x] UI 렌더링 테스트로 작성 가능
  - **근거 (사실)**: Testing Library의 getByRole, queryByRole로 아이콘 검증 가능
  - **근거 (평가)**: 반복 일정/일반 일정 Mock 데이터로 테스트 가능
  - **근거 (대안)**: 피드백 불필요

### 5. ✅ 범위 준수
- [x] 요구사항 범위 내에서 설계
  - **근거 (사실)**: 아이콘 표시 기능만 다룸 (수정/삭제 로직 제외)
  - **근거 (평가)**: 표시 기능에만 집중하여 범위 준수
  - **근거 (대안)**: 피드백 불필요

**✅ 명세 품질 검증 통과**: Agent 3으로 즉시 진행 가능

---

## 3. 테스트 구조 설계

### 통합 테스트 (Integration Tests)
**파일**: `src/__tests__/recurring-icon-display.integration.spec.tsx`

**테스트 케이스**:
1. `describe('반복 일정 아이콘 표시', () => {...})`
   - `it('일반 일정(repeat.type: none)은 반복 아이콘을 표시하지 않는다', () => {...})`
   - `it('매일 반복 일정(repeat.type: daily)은 반복 아이콘을 표시한다', () => {...})`
   - `it('매주 반복 일정(repeat.type: weekly)은 반복 아이콘을 표시한다', () => {...})`
   - `it('매월 반복 일정(repeat.type: monthly)은 반복 아이콘을 표시한다', () => {...})`
   - `it('매년 반복 일정(repeat.type: yearly)은 반복 아이콘을 표시한다', () => {...})`

**참고**: 이 기능은 UI 렌더링 테스트이므로 통합 테스트로 구현합니다.
순수 함수가 아니므로 단위 테스트는 불필요합니다.

---

## 4. 테스트 데이터 준비

### Fixtures
**파일**: `src/__tests__/__fixtures__/mockRecurringIconEvents.ts`

**데이터**:
```typescript
export const mockRecurringIconEvents = {
  normalEvent: {
    // repeat.type: 'none'인 일반 일정
    id: '1',
    title: '일반 일정',
    date: '2025-10-31',
    startTime: '10:00',
    endTime: '11:00',
    description: '일반 일정 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  dailyEvent: {
    // repeat.type: 'daily'인 매일 반복 일정
    id: '2',
    title: '매일 반복 일정',
    date: '2025-10-31',
    startTime: '09:00',
    endTime: '10:00',
    description: '매일 회의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  weeklyEvent: {
    // repeat.type: 'weekly'인 매주 반복 일정
    id: '3',
    title: '매주 반복 일정',
    date: '2025-10-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 C',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-2',
    },
    notificationTime: 10,
  },
  monthlyEvent: {
    // repeat.type: 'monthly'인 매월 반복 일정
    id: '4',
    title: '매월 반복 일정',
    date: '2025-10-31',
    startTime: '16:00',
    endTime: '17:00',
    description: '월간 보고',
    location: '회의실 D',
    category: '업무',
    repeat: {
      type: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
      id: 'repeat-3',
    },
    notificationTime: 10,
  },
  yearlyEvent: {
    // repeat.type: 'yearly'인 매년 반복 일정
    id: '5',
    title: '매년 반복 일정',
    date: '2025-10-31',
    startTime: '18:00',
    endTime: '19:00',
    description: '연간 행사',
    location: '대회의실',
    category: '행사',
    repeat: {
      type: 'yearly',
      interval: 1,
      endDate: '2027-10-31',
      id: 'repeat-4',
    },
    notificationTime: 10,
  },
};
```

---

## 5. 테스트 케이스 목록

### 기능: 반복 일정 아이콘 표시
- [x] 정상 케이스 1: 일반 일정은 반복 아이콘 미표시
  - Given: repeat.type이 'none'인 일정
  - When: 일정 목록 렌더링
  - Then: Repeat 아이콘이 DOM에 존재하지 않음

- [x] 정상 케이스 2: 매일 반복 일정은 반복 아이콘 표시
  - Given: repeat.type이 'daily'인 일정
  - When: 일정 목록 렌더링
  - Then: Repeat 아이콘이 DOM에 존재함

- [x] 정상 케이스 3: 매주 반복 일정은 반복 아이콘 표시
  - Given: repeat.type이 'weekly'인 일정
  - When: 일정 목록 렌더링
  - Then: Repeat 아이콘이 DOM에 존재함

- [x] 정상 케이스 4: 매월 반복 일정은 반복 아이콘 표시
  - Given: repeat.type이 'monthly'인 일정
  - When: 일정 목록 렌더링
  - Then: Repeat 아이콘이 DOM에 존재함

- [x] 정상 케이스 5: 매년 반복 일정은 반복 아이콘 표시
  - Given: repeat.type이 'yearly'인 일정
  - When: 일정 목록 렌더링
  - Then: Repeat 아이콘이 DOM에 존재함

---

## 6. 다음 단계

**Agent 3에게 전달**:
- 테스트 구조 설계: 이 문서
- 테스트 데이터: `src/__tests__/__fixtures__/mockRecurringIconEvents.ts`
- Red Phase 시작 가능

**Git 커밋**:
```bash
git add src/__tests__/__fixtures__/mockRecurringIconEvents.ts
git add claudedocs/02-test-design-recurring-icon-display.md
git commit -m "test: [DESIGN] 반복 일정 아이콘 표시 테스트 구조 설계 및 fixtures 생성"
```

---

**생성 도구**: `.claude/scripts/doc-generator.sh 2 recurring-icon-display`
