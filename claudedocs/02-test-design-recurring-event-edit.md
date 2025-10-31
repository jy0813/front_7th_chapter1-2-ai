# Agent 2: 반복 일정 수정 테스트 설계

**문서 버전**: 1.0.0
**작성일**: 2025-10-31
**Phase**: Agent 2 (Test Design Agent)
**상태**: ✅ 완료

---

## 1. 테스트 설계 개요

### 1.1 명세 참조
- **specs/10-recurring-event-edit.md**: 반복 일정 수정 명세
- **핵심 기능**:
  - 반복 일정 수정 시 다이얼로그 표시
  - "예" (단일 수정): repeat.type → 'none', 아이콘 사라짐
  - "아니오" (전체 수정): repeat 정보 유지, 아이콘 유지

### 1.2 테스트 범위
- **통합 테스트**: 다이얼로그 표시 → 사용자 선택 → API 호출 → UI 업데이트
- **단위 테스트**: 반복 일정 감지 로직 (선택 사항)

---

## 2. 테스트 구조 설계

### 2.1 테스트 파일 위치
```
src/__tests__/
└── integration/
    └── recurring-event-edit.integration.spec.tsx
```

### 2.2 Fixtures 위치
```
src/__tests__/__fixtures__/
└── mockRecurringEventEdit.ts
```

---

## 3. 테스트 케이스 설계

### 3.1 다이얼로그 표시 (반복 일정 감지)

#### TC-1: 반복 일정 수정 시 다이얼로그 표시
**Given**: 반복 일정이 화면에 렌더링되어 있다 (repeat.type !== 'none')
**When**: 사용자가 해당 일정의 수정 버튼을 클릭한다
**Then**:
- "해당 일정만 수정하시겠어요?" 텍스트가 표시됨
- "예" 버튼이 존재함
- "아니오" 버튼이 존재함
- "취소" 버튼이 존재함

#### TC-2: 일반 일정 수정 시 다이얼로그 미표시
**Given**: 일반 일정이 화면에 렌더링되어 있다 (repeat.type === 'none')
**When**: 사용자가 해당 일정의 수정 버튼을 클릭한다
**Then**:
- 다이얼로그가 표시되지 않음
- 바로 수정 모드로 진입 (기존 동작)

### 3.2 단일 수정 ("예" 선택)

#### TC-3: 단일 수정 후 repeat.type이 'none'으로 변경
**Given**: 반복 일정 수정 다이얼로그가 표시되어 있다
**When**:
1. "예" 버튼을 클릭한다
2. 제목을 "특별 회의"로 변경한다
3. 저장 버튼을 클릭한다
**Then**:
- API 호출: `PUT /api/events/:id`
- 요청 body에 `repeat.type`이 'none'으로 설정됨
- 해당 일정만 제목이 "특별 회의"로 변경됨
- 다른 반복 일정은 영향받지 않음

#### TC-4: 단일 수정 후 아이콘 사라짐
**Given**: 반복 일정 수정 다이얼로그가 표시되어 있다
**When**:
1. "예" 버튼을 클릭한다
2. 제목을 "특별 회의"로 변경하고 저장한다
**Then**:
- 캘린더 뷰에서 해당 일정의 Repeat 아이콘이 사라짐
- 다른 날짜의 반복 일정은 여전히 Repeat 아이콘 표시

### 3.3 전체 수정 ("아니오" 선택)

#### TC-5: 전체 수정 후 repeat 정보 유지
**Given**: 반복 일정 수정 다이얼로그가 표시되어 있다
**When**:
1. "아니오" 버튼을 클릭한다
2. 제목을 "업데이트된 회의"로 변경한다
3. 저장 버튼을 클릭한다
**Then**:
- API 호출: `PUT /api/recurring-events/:repeatId`
- 같은 repeat.id를 가진 모든 일정의 제목이 "업데이트된 회의"로 변경됨
- repeat.type, repeat.id, repeat.interval 모두 유지됨

#### TC-6: 전체 수정 후 아이콘 유지
**Given**: 반복 일정 수정 다이얼로그가 표시되어 있다
**When**:
1. "아니오" 버튼을 클릭한다
2. 제목을 "업데이트된 회의"로 변경하고 저장한다
**Then**:
- 캘린더 뷰에서 모든 반복 일정에 Repeat 아이콘 유지
- 아이콘 개수 변화 없음

### 3.4 취소 버튼

#### TC-7: 취소 버튼 클릭 시 다이얼로그 닫힘
**Given**: 반복 일정 수정 다이얼로그가 표시되어 있다
**When**: "취소" 버튼을 클릭한다
**Then**:
- 다이얼로그가 닫힘
- API 호출 없음
- 일정 데이터 변경 없음

### 3.5 에러 처리

#### TC-8: 단일 수정 API 실패 시 에러 메시지 표시
**Given**: 반복 일정 수정 다이얼로그에서 "예"를 선택했다
**When**:
1. 제목을 수정하고 저장한다
2. API가 400/500 에러를 반환한다
**Then**:
- "일정 수정에 실패했습니다" 메시지 표시
- 폼 데이터는 유지 (재시도 가능)

#### TC-9: 전체 수정 API 실패 시 에러 메시지 표시
**Given**: 반복 일정 수정 다이얼로그에서 "아니오"를 선택했다
**When**:
1. 제목을 수정하고 저장한다
2. API가 400/500 에러를 반환한다
**Then**:
- "반복 일정 수정에 실패했습니다" 메시지 표시
- 폼 데이터는 유지 (재시도 가능)

---

## 4. Fixtures 설계

### 4.1 Mock 데이터 구조

#### 단일 반복 일정 (ID 있음)
```typescript
{
  id: 'event-1',
  title: '매일 회의',
  date: '2025-10-01',
  repeat: {
    type: 'daily',
    interval: 1,
    id: 'repeat-1',
    endDate: '2025-10-31'
  }
}
```

#### 반복 일정 시리즈 (같은 repeat.id)
```typescript
[
  { id: 'event-1', date: '2025-10-01', repeat: { id: 'repeat-1', type: 'daily' } },
  { id: 'event-2', date: '2025-10-02', repeat: { id: 'repeat-1', type: 'daily' } },
  { id: 'event-3', date: '2025-10-03', repeat: { id: 'repeat-1', type: 'daily' } }
]
```

#### 일반 일정 (repeat.type === 'none')
```typescript
{
  id: 'event-normal',
  title: '일반 회의',
  date: '2025-10-01',
  repeat: {
    type: 'none',
    interval: 0
  }
}
```

### 4.2 MSW 핸들러 구조

#### 단일 수정 핸들러
```typescript
http.put('/api/events/:id', ({ request, params }) => {
  const { id } = params;
  const body = await request.json();

  // body.repeat.type === 'none' 검증
  return HttpResponse.json({
    id,
    ...body,
    repeat: { type: 'none', interval: 0 }
  });
});
```

#### 전체 수정 핸들러
```typescript
http.put('/api/recurring-events/:repeatId', ({ request, params }) => {
  const { repeatId } = params;
  const body = await request.json();

  // 같은 repeat.id를 가진 모든 일정 수정
  return HttpResponse.json({
    updatedCount: 3,
    events: [/* 수정된 모든 일정 */]
  });
});
```

---

## 5. 테스트 작성 가이드 (Agent 3용)

### 5.1 테스트 작성 순서
1. **TC-1**: 다이얼로그 표시 테스트 (가장 기본)
2. **TC-2**: 일반 일정 수정 시 다이얼로그 미표시
3. **TC-3, TC-4**: 단일 수정 테스트 (API + UI)
4. **TC-5, TC-6**: 전체 수정 테스트 (API + UI)
5. **TC-7**: 취소 버튼 테스트
6. **TC-8, TC-9**: 에러 처리 테스트

### 5.2 핵심 검증 포인트
- **다이얼로그 표시**: `screen.findByText('해당 일정만 수정하시겠어요?')`
- **API 호출 확인**: MSW 핸들러 호출 여부 + 요청 body 검증
- **repeat.type 변경**: 단일 수정 시 'none', 전체 수정 시 유지
- **아이콘 표시**: `screen.queryByTestId('RepeatIcon')` 개수 확인

### 5.3 Testing Library 쿼리 우선순위
1. `screen.getByRole('button', { name: /예/i })`
2. `screen.getByText('해당 일정만 수정하시겠어요?')`
3. `screen.getByTestId('RepeatIcon')` (아이콘만 예외)

### 5.4 주의사항
- 기존 `recurring-icon-display.integration.spec.tsx` 참고
- `setupMockHandlerCreation` 유틸리티 활용
- `waitFor`를 사용하여 비동기 UI 업데이트 대기
- 각 테스트는 독립적으로 실행 가능해야 함

---

## 6. 체크리스트

### Agent 2 (현재)
- [x] 명세 분석 (specs/10-recurring-event-edit.md)
- [x] 테스트 케이스 9개 설계 (Given-When-Then 형식)
- [x] Fixtures 구조 설계
- [x] MSW 핸들러 구조 설계
- [x] 테스트 작성 가이드 작성 (Agent 3용)
- [x] 테스트 설계 문서 작성
- [ ] Fixtures 파일 생성 (mockRecurringEventEdit.ts)
- [ ] Git 커밋: test: [DESIGN] 반복 일정 수정 테스트 구조 설계

### Agent 3 (다음 단계)
- [ ] 테스트 파일 생성 (recurring-event-edit.integration.spec.tsx)
- [ ] TC-1~TC-9 테스트 코드 작성 (실패하는 테스트)
- [ ] 테스트 실행 및 실패 확인
- [ ] Git 커밋: test: [RED] 반복 일정 수정 테스트 작성

---

**생성 도구**: Agent 2 (Test Design Agent)
**명세 준수**: specs/10-recurring-event-edit.md 기반 테스트 설계
**Testing Library 원칙**: 쿼리 우선순위 준수, 사용자 중심 테스트
