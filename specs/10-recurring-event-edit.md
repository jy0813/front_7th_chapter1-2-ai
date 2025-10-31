# 반복 일정 수정 명세

**문서 버전**: 1.0.0
**작성일**: 2025-10-31
**상태**: ✅ 완료

---

## 1. 개요

### 목적
반복 일정을 수정할 때 "단일 수정" 또는 "전체 수정"을 선택할 수 있도록 합니다.

### 범위
- 반복 일정 수정 시 다이얼로그 표시
- 단일 수정: 해당 일정만 수정 (repeat.type → 'none')
- 전체 수정: 같은 repeat.id를 가진 모든 일정 수정

---

## 2. 기능 요구사항

### 2.1 반복 일정 감지

**Given**: 사용자가 일정 수정 버튼을 클릭한다
**When**: 해당 일정이 반복 일정이다 (repeat.type !== 'none')
**Then**:
- "해당 일정만 수정하시겠어요?" 다이얼로그 표시
- "예" / "아니오" 버튼 제공

### 2.2 단일 수정 ("예" 선택)

**Given**: 사용자가 반복 일정 수정 다이얼로그에서 "예"를 선택한다
**When**: 수정 내용을 입력하고 저장한다
**Then**:
- 해당 일정만 수정됨
- `repeat.type`이 'none'으로 변경됨
- `repeat.id`, `repeat.interval`, `repeat.endDate`는 제거됨
- 캘린더 뷰에서 반복 아이콘이 사라짐
- 다른 반복 일정은 영향받지 않음

### 2.3 전체 수정 ("아니오" 선택)

**Given**: 사용자가 반복 일정 수정 다이얼로그에서 "아니오"를 선택한다
**When**: 수정 내용을 입력하고 저장한다
**Then**:
- 같은 `repeat.id`를 가진 모든 일정이 수정됨
- `repeat.type`은 유지됨 (반복 일정 유지)
- `repeat.id`, `repeat.interval`, `repeat.endDate`는 유지됨
- 캘린더 뷰에서 반복 아이콘이 유지됨
- 모든 반복 일정의 내용이 동일하게 변경됨

---

## 3. API 명세

### 3.1 단일 수정 API

**Endpoint**: `PUT /api/events/:id`

**Request Body**:
```typescript
{
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: {
    type: 'none',  // 강제로 'none'으로 변경
    interval: 0
  };
  notificationTime: number;
}
```

**Response**:
```typescript
{
  id: string;
  // ... updated event data
  repeat: {
    type: 'none',
    interval: 0
  }
}
```

### 3.2 전체 수정 API

**Endpoint**: `PUT /api/recurring-events/:repeatId`

**Request Body**:
```typescript
{
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  notificationTime: number;
  // date는 제외 (각 일정의 날짜 유지)
  // repeat는 제외 (반복 정보 유지)
}
```

**Response**:
```typescript
{
  updatedCount: number;
  events: Event[];  // 수정된 모든 일정
}
```

---

## 4. UI 플로우

### 4.1 수정 버튼 클릭

```
사용자가 반복 일정의 수정 버튼 클릭
    ↓
일정이 반복 일정인가? (repeat.type !== 'none')
    ↓
[YES] 다이얼로그 표시: "해당 일정만 수정하시겠어요?"
    ├─ "예" → 단일 수정 모드
    └─ "아니오" → 전체 수정 모드
    ↓
[NO] 일반 수정 모드 (기존 동작)
```

### 4.2 다이얼로그 디자인

```tsx
<Dialog open={showEditDialog}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 수정하시겠어요?
    </DialogContentText>
    <Alert severity="info">
      • "예": 이 일정만 수정되며, 반복 일정에서 제외됩니다.
      • "아니오": 모든 반복 일정이 함께 수정됩니다.
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleEditChoice(true)}>예</Button>
    <Button onClick={() => handleEditChoice(false)}>아니오</Button>
    <Button onClick={() => setShowEditDialog(false)}>취소</Button>
  </DialogActions>
</Dialog>
```

---

## 5. 테스트 시나리오

### 5.1 단일 수정 시나리오

#### 시나리오 1: 반복 일정 → 단일 일정 변환
```typescript
// Given
const recurringEvent = {
  id: '1',
  title: '매일 회의',
  date: '2025-10-01',
  repeat: {
    type: 'daily',
    interval: 1,
    id: 'repeat-1',
    endDate: '2025-10-31'
  }
};

// When
editSingleEvent(recurringEvent.id, {
  title: '특별 회의',
  // ... other fields
});

// Then
expect(updatedEvent.title).toBe('특별 회의');
expect(updatedEvent.repeat.type).toBe('none');
expect(updatedEvent.repeat.id).toBeUndefined();
// 다른 반복 일정들은 변경되지 않음
```

### 5.2 전체 수정 시나리오

#### 시나리오 2: 모든 반복 일정 수정
```typescript
// Given
const repeatId = 'repeat-1';
const recurringEvents = [
  { id: '1', date: '2025-10-01', repeat: { id: repeatId, type: 'daily' } },
  { id: '2', date: '2025-10-02', repeat: { id: repeatId, type: 'daily' } },
  { id: '3', date: '2025-10-03', repeat: { id: repeatId, type: 'daily' } }
];

// When
editAllRecurringEvents(repeatId, {
  title: '업데이트된 회의',
  startTime: '14:00',
  endTime: '15:00',
  repeat: {
    type: 'weekly',  // 반복 유형 변경 가능
    interval: 1
  }
});

// Then
const updatedEvents = getEventsByRepeatId(repeatId);
updatedEvents.forEach(event => {
  expect(event.title).toBe('업데이트된 회의');
  expect(event.startTime).toBe('14:00');
  expect(event.endTime).toBe('15:00');
  expect(event.repeat.type).toBe('weekly');  // 반복 정보도 수정됨
  expect(event.repeat.id).toBe(repeatId);    // repeatId는 유지
});
```

---

## 6. 예외 처리

### 6.1 단일 수정 실패

**Given**: 단일 수정 API 호출이 실패한다
**When**: 서버가 400/500 에러를 반환한다
**Then**:
- 에러 메시지 표시: "일정 수정에 실패했습니다"
- 폼 데이터는 유지 (재시도 가능)
- 다이얼로그는 닫히지 않음

### 6.2 전체 수정 실패

**Given**: 전체 수정 API 호출이 실패한다
**When**: 서버가 400/500 에러를 반환한다
**Then**:
- 에러 메시지 표시: "반복 일정 수정에 실패했습니다"
- 일부만 수정된 경우 롤백 필요
- 폼 데이터는 유지 (재시도 가능)

### 6.3 repeat.id가 없는 경우

**Given**: 반복 일정인데 repeat.id가 없다 (데이터 오류)
**When**: 전체 수정을 시도한다
**Then**:
- 경고 메시지 표시: "repeat.id가 없어 전체 수정이 불가능합니다"
- 단일 수정으로 fallback

---

## 7. 데이터 흐름

### 7.1 단일 수정 흐름

```
사용자가 "예" 선택
    ↓
editingEvent에 수정 내용 저장
    ↓
repeat.type을 'none'으로 설정
    ↓
PUT /api/events/:id 호출
    ↓
서버 응답 받기
    ↓
로컬 상태 업데이트 (events 배열)
    ↓
폼 초기화 및 다이얼로그 닫기
```

### 7.2 전체 수정 흐름

```
사용자가 "아니오" 선택
    ↓
editingEvent에 수정 내용 저장
    ↓
repeat 정보 유지
    ↓
PUT /api/recurring-events/:repeatId 호출
    ↓
서버 응답 받기 (수정된 모든 일정)
    ↓
로컬 상태 업데이트 (events 배열 전체)
    ↓
폼 초기화 및 다이얼로그 닫기
```

---

## 8. 상태 관리

### 8.1 필요한 상태

```typescript
// App.tsx 또는 useEventForm.ts
const [showEditTypeDialog, setShowEditTypeDialog] = useState(false);
const [editType, setEditType] = useState<'single' | 'all' | null>(null);
```

### 8.2 editEvent 함수 수정

```typescript
const editEvent = (event: Event) => {
  if (event.repeat.type !== 'none') {
    // 반복 일정인 경우 다이얼로그 표시
    setEditingEvent(event);
    setShowEditTypeDialog(true);
  } else {
    // 일반 일정인 경우 바로 수정 모드
    setEditingEvent(event);
    fillFormWithEvent(event);
  }
};

const handleEditChoice = (isSingle: boolean) => {
  setEditType(isSingle ? 'single' : 'all');
  setShowEditTypeDialog(false);
  fillFormWithEvent(editingEvent);
};
```

---

## 9. 수용 기준 (Acceptance Criteria)

### 필수 요구사항
- ✅ 반복 일정 수정 시 다이얼로그 표시
- ✅ "예" 선택 시 단일 수정 (repeat.type → 'none')
- ✅ "아니오" 선택 시 전체 수정 (repeat 정보 유지)
- ✅ 단일 수정 후 반복 아이콘 사라짐
- ✅ 전체 수정 후 반복 아이콘 유지

### 사용자 경험
- ✅ 다이얼로그에 명확한 설명 제공
- ✅ "취소" 버튼으로 수정 취소 가능
- ✅ 수정 성공 시 즉시 UI 반영
- ✅ 에러 발생 시 명확한 메시지 표시

---

## 10. 관련 문서

- [specs/01-data-models.md](./01-data-models.md) - Event, RepeatInfo 타입 정의
- [specs/04-api-specification.md](./04-api-specification.md) - API 명세
- [rules/tdd-principles.md](../rules/tdd-principles.md) - TDD 개발 원칙

---

**생성 도구**: 수동 작성 (Agent 1)
**명세 품질**: Given-When-Then 패턴 준수, 구체적 예시 포함, 엣지 케이스 명시
