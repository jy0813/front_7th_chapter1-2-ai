# 반복 일정 삭제 기능 명세

**기능 ID**: 11-recurring-event-delete
**작성일**: 2025-11-01
**관련 명세**: 10-recurring-event-edit.md (반복 일정 수정)

---

## 📋 기능 개요

반복 일정을 삭제할 때 사용자가 **단일 삭제** 또는 **전체 시리즈 삭제**를 선택할 수 있는 기능입니다.

---

## 🎯 기능 요구사항

### 1. 반복 일정 삭제 다이얼로그

반복 일정(`repeat.type !== 'none'`이고 `repeat.id`가 있는 경우)을 삭제하려고 할 때, 다음과 같은 다이얼로그를 표시합니다:

**다이얼로그 구성**:
- **제목**: "반복 일정 삭제"
- **메시지**: "해당 일정만 삭제하시겠어요?"
- **버튼**:
  - "예": 해당 일정만 삭제
  - "아니오": 모든 반복 일정 삭제
  - "취소": 삭제 취소

### 2. 단일 일정 삭제 (Single Event Delete)

**트리거**: 다이얼로그에서 "예" 버튼 클릭

**동작**:
1. 해당 일정만 삭제
2. API: `DELETE /api/events/:id`
3. 성공 메시지: "일정이 삭제되었습니다."
4. 다른 반복 일정은 영향 없음

### 3. 전체 시리즈 삭제 (Series Delete)

**트리거**: 다이얼로그에서 "아니오" 버튼 클릭

**동작**:
1. 같은 `repeat.id`를 가진 모든 일정 삭제
2. API: `DELETE /api/recurring-events/:repeatId`
3. 성공 메시지: "반복 일정 시리즈가 삭제되었습니다."

### 4. 일반 일정 삭제

**조건**: `repeat.type === 'none'` 또는 `repeat.id`가 없는 경우

**동작**:
1. 다이얼로그 **표시하지 않음**
2. 즉시 삭제
3. API: `DELETE /api/events/:id`
4. 성공 메시지: "일정이 삭제되었습니다."

---

## 📊 테스트 시나리오

### TC-1: 다이얼로그 표시 (반복 일정 감지)

**Given**: 반복 일정이 화면에 렌더링되어 있다
- `repeat.type`: 'daily'
- `repeat.id`: 'repeat-1'

**When**: 삭제 버튼을 클릭한다

**Then**:
- "반복 일정 삭제" 다이얼로그가 표시된다
- 메시지: "해당 일정만 삭제하시겠어요?"
- 버튼: "예", "아니오", "취소"

---

### TC-2: 일반 일정 삭제 시 다이얼로그 미표시

**Given**: 일반 일정이 화면에 렌더링되어 있다
- `repeat.type`: 'none'

**When**: 삭제 버튼을 클릭한다

**Then**:
- 다이얼로그가 **표시되지 않는다**
- 즉시 삭제된다
- 성공 메시지: "일정이 삭제되었습니다."

---

### TC-3: 단일 일정 삭제 ("예" 선택)

**Given**:
- 반복 일정 시리즈 3개가 렌더링되어 있다
  - event-1 (2025-10-01), event-2 (2025-10-02), event-3 (2025-10-03)
  - 모두 같은 `repeat.id: 'repeat-1'`

**When**:
1. 첫 번째 일정(event-1)의 삭제 버튼 클릭
2. 다이얼로그에서 "예" 버튼 클릭

**Then**:
- `DELETE /api/events/event-1` 호출됨
- event-1만 삭제됨
- event-2, event-3는 그대로 남아있음
- 성공 메시지: "일정이 삭제되었습니다."

---

### TC-4: 전체 시리즈 삭제 ("아니오" 선택)

**Given**:
- 반복 일정 시리즈 3개가 렌더링되어 있다
  - event-1 (2025-10-01), event-2 (2025-10-02), event-3 (2025-10-03)
  - 모두 같은 `repeat.id: 'repeat-1'`

**When**:
1. 첫 번째 일정(event-1)의 삭제 버튼 클릭
2. 다이얼로그에서 "아니오" 버튼 클릭

**Then**:
- `DELETE /api/recurring-events/repeat-1` 호출됨
- event-1, event-2, event-3 모두 삭제됨
- 성공 메시지: "반복 일정 시리즈가 삭제되었습니다."

---

### TC-5: 취소 버튼

**Given**: 반복 일정이 렌더링되어 있다

**When**:
1. 삭제 버튼 클릭
2. 다이얼로그에서 "취소" 버튼 클릭

**Then**:
- 다이얼로그가 닫힌다
- API 호출이 발생하지 않는다
- 일정이 삭제되지 않는다

---

### TC-6: 단일 삭제 API 실패

**Given**:
- 반복 일정이 렌더링되어 있다
- API가 400 에러를 반환하도록 설정됨

**When**:
1. 삭제 버튼 클릭
2. 다이얼로그에서 "예" 버튼 클릭

**Then**:
- 에러 메시지: "일정 삭제 실패" 스낵바 표시
- 일정이 삭제되지 않음

---

### TC-7: 전체 삭제 API 실패

**Given**:
- 반복 일정이 렌더링되어 있다
- API가 500 에러를 반환하도록 설정됨

**When**:
1. 삭제 버튼 클릭
2. 다이얼로그에서 "아니오" 버튼 클릭

**Then**:
- 에러 메시지: "반복 일정 삭제 실패" 스낵바 표시
- 일정이 삭제되지 않음

---

## 🔌 API 명세

### 1. 단일 일정 삭제

**엔드포인트**: `DELETE /api/events/:id`

**요청**:
```
DELETE /api/events/event-1
```

**응답 (성공)**:
```json
{
  "message": "Event deleted successfully"
}
```

**응답 (실패)**:
```json
{
  "error": "Failed to delete event"
}
```
Status: 400

---

### 2. 반복 일정 시리즈 삭제

**엔드포인트**: `DELETE /api/recurring-events/:repeatId`

**요청**:
```
DELETE /api/recurring-events/repeat-1
```

**응답 (성공)**:
```json
{
  "message": "Recurring event series deleted successfully",
  "deletedCount": 3
}
```

**응답 (실패)**:
```json
{
  "error": "Failed to delete recurring event series"
}
```
Status: 500

---

## 🎨 UI/UX 요구사항

### 다이얼로그 스타일

**제목**: "반복 일정 삭제"
**메시지**: "해당 일정만 삭제하시겠어요?"

**버튼 배치** (왼쪽 → 오른쪽):
1. "취소" (기본 스타일)
2. "아니오" (주요 액션)
3. "예" (주요 액션)

### 성공 메시지

- **단일 삭제**: "일정이 삭제되었습니다." (info)
- **시리즈 삭제**: "반복 일정 시리즈가 삭제되었습니다." (info)

### 에러 메시지

- **단일 삭제 실패**: "일정 삭제 실패" (error)
- **시리즈 삭제 실패**: "반복 일정 삭제 실패" (error)

---

## 📝 기존 코드 참고

### 기존 삭제 함수 (`App.tsx`)

```typescript
const handleDeleteEvent = async (id: string) => {
  await deleteEvent(id);
};
```

### 기존 `useEventOperations.ts`

```typescript
const deleteEvent = async (id: string) => {
  try {
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    await fetchEvents();
    enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

---

## ✅ 수용 기준 (Acceptance Criteria)

1. ✅ 반복 일정 삭제 시 다이얼로그 표시
2. ✅ 일반 일정 삭제 시 다이얼로그 미표시
3. ✅ "예" 선택 시 단일 일정만 삭제
4. ✅ "아니오" 선택 시 모든 반복 일정 삭제
5. ✅ "취소" 선택 시 삭제 취소
6. ✅ 적절한 성공/실패 메시지 표시
7. ✅ API 에러 처리

---

## 🔗 관련 문서

- **반복 일정 수정**: `specs/10-recurring-event-edit.md`
- **데이터 모델**: `specs/01-data-models.md`
- **API 명세**: `specs/04-api-specification.md`

---

**작성자**: Agent 1 (Feature Design Agent)
**검토 필요**: Agent 2 (Test Design Agent)
