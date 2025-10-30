# 02. 비즈니스 규칙 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [일정 생성 규칙](#일정-생성-규칙)
3. [일정 수정 규칙](#일정-수정-규칙)
4. [일정 삭제 규칙](#일정-삭제-규칙)
5. [일정 겹침 처리](#일정-겹침-처리)
6. [반복 일정 규칙 (미구현)](#반복-일정-규칙-미구현)
7. [알림 규칙](#알림-규칙)
8. [검색 및 필터링 규칙](#검색-및-필터링-규칙)

---

## 개요

### 문서 목적

시스템의 핵심 비즈니스 로직과 제약사항을 정의합니다. 모든 규칙은 명확하고 검증 가능하며, AI가 코드로 구현할 수 있는 수준으로 작성되었습니다.

### 핵심 원칙

1. **사용자 중심**: 사용자의 실수를 방지하고 명확한 피드백 제공
2. **데이터 무결성**: 모순되거나 유효하지 않은 데이터 저장 방지
3. **유연성**: 사용자가 최종 결정권을 가짐 (강제하지 않음)

---

## 일정 생성 규칙

### BR-CREATE-001: 필수 필드 검증

**규칙**: 일정 생성 시 다음 필드는 반드시 입력되어야 함

| 필드 | 조건 | 에러 메시지 |
|------|------|-------------|
| `title` | 비어있지 않음 | "필수 정보를 모두 입력해주세요." |
| `date` | 유효한 날짜 형식 | "필수 정보를 모두 입력해주세요." |
| `startTime` | 유효한 시간 형식 | "필수 정보를 모두 입력해주세요." |
| `endTime` | 유효한 시간 형식 | "필수 정보를 모두 입력해주세요." |

**구현 위치**: `App.tsx:addOrUpdateEvent()`

**테스트 시나리오**:
```gherkin
Given: 사용자가 일정 추가 폼에서
When: title이 비어있는 상태로 "일정 추가" 버튼 클릭
Then: "필수 정보를 모두 입력해주세요." 에러 메시지 표시
And: 일정이 생성되지 않음
```

---

### BR-CREATE-002: 시간 순서 검증

**규칙**: 시작 시간은 종료 시간보다 빨라야 함

**조건**:
- `startTime < endTime` (엄격한 부등호, 같을 수 없음)
- 검증 시점: 사용자가 시간 입력 필드를 변경할 때마다 (onBlur)

**구현 위치**: `utils/timeValidation.ts:getTimeErrorMessage()`

**에러 메시지**:
- startTime 필드: "시작 시간은 종료 시간보다 빨라야 합니다."
- endTime 필드: "종료 시간은 시작 시간보다 늦어야 합니다."

**테스트 시나리오**:
```gherkin
Given: 사용자가 일정 추가 폼에서
When: startTime = "14:00", endTime = "14:00" 입력
Then: 두 필드 모두 에러 상태로 표시
And: 툴팁에 에러 메시지 표시
And: "일정 추가" 버튼 클릭 시 "시간 설정을 확인해주세요." 메시지 표시
```

---

### BR-CREATE-003: 기본값 설정

**규칙**: 일정 생성 폼의 기본값

| 필드 | 기본값 | 이유 |
|------|--------|------|
| `category` | `'업무'` | 가장 일반적인 사용 사례 |
| `notificationTime` | `10` (10분 전) | 충분한 준비 시간 |
| `repeat.type` | `'none'` | 대부분 일회성 일정 |
| `repeat.interval` | `1` | 반복 시 가장 일반적 |
| `description` | `''` (빈 문자열) | 선택적 필드 |
| `location` | `''` (빈 문자열) | 선택적 필드 |

**구현 위치**: `hooks/useEventForm.ts`

---

### BR-CREATE-004: UUID 생성

**규칙**: 모든 일정은 고유한 UUID v4 식별자를 가짐

**생성 주체**: 서버 (`server.js`)
**생성 시점**: POST /api/events 요청 처리 시
**형식**: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

**충돌 방지**: UUID v4는 충돌 확률이 극히 낮음 (2^122)

---

## 일정 수정 규칙

### BR-UPDATE-001: 수정 가능 필드

**규칙**: 모든 필드를 수정할 수 있음 (id 제외)

**수정 불가 필드**:
- `id`: 생성 후 변경 불가

**수정 가능 필드**:
- `title`, `date`, `startTime`, `endTime`
- `description`, `location`, `category`
- `repeat` (전체 객체)
- `notificationTime`

**구현 위치**: `hooks/useEventOperations.ts:saveEvent()`

---

### BR-UPDATE-002: 수정 중 검증

**규칙**: 수정 시에도 생성 규칙과 동일한 검증 적용

- 필수 필드 검증 (BR-CREATE-001)
- 시간 순서 검증 (BR-CREATE-002)
- 일정 겹침 검증 (BR-OVERLAP-001)

**차이점**: 자기 자신과의 겹침은 무시

```typescript
// 수정 시 자기 자신 제외
const overlapping = findOverlappingEvents(eventData, events);
// findOverlappingEvents 내부에서 event.id !== newEvent.id 체크
```

---

### BR-UPDATE-003: 수정 폼 초기화

**규칙**: "Edit event" 버튼 클릭 시 기존 값으로 폼 채움

**동작**:
1. 기존 일정의 모든 필드 값을 폼에 설정
2. 폼 제목을 "일정 수정"으로 변경
3. 제출 버튼 텍스트를 "일정 수정"으로 변경

**구현 위치**: `hooks/useEventForm.ts:editEvent()`

---

## 일정 삭제 규칙

### BR-DELETE-001: 즉시 삭제

**규칙**: 삭제 확인 없이 즉시 삭제

**동작**:
1. "Delete event" 버튼 클릭
2. 서버에 DELETE 요청
3. 성공 시 목록에서 제거
4. "일정이 삭제되었습니다." 알림 표시

**이유**: 단순한 UI, 실수 시 재생성 비용이 낮음

**구현 위치**: `hooks/useEventOperations.ts:deleteEvent()`

---

### BR-DELETE-002: 삭제 후 폼 유지

**규칙**: 일정 삭제 후 폼은 현재 상태 유지

- 수정 중이던 일정 삭제 시에도 폼 데이터는 남아있음
- 사용자가 명시적으로 취소하거나 새 일정 추가 시까지 유지

---

## 일정 겹침 처리

### BR-OVERLAP-001: 겹침 감지

**규칙**: 같은 날짜에 시간이 겹치는 일정 감지

**겹침 조건**:
```typescript
// event1과 event2가 겹침
startTime1 < endTime2 AND startTime2 < endTime1
```

**예시**:
- Event A: 10:00-12:00
- Event B: 11:00-13:00
- 결과: 겹침 (11:00-12:00 구간)

**예시 (겹치지 않음)**:
- Event A: 10:00-12:00
- Event B: 12:00-14:00
- 결과: 겹치지 않음 (12:00에서 정확히 만남)

**구현 위치**: `utils/eventOverlap.ts:isOverlapping()`

---

### BR-OVERLAP-002: 겹침 경고 표시

**규칙**: 겹치는 일정이 있으면 경고 다이얼로그 표시

**다이얼로그 내용**:
- 제목: "일정 겹침 경고"
- 메시지: "다음 일정과 겹칩니다:"
- 겹치는 일정 목록 표시 (제목, 날짜, 시간)
- 선택지:
  - "취소": 일정 생성/수정 취소
  - "계속 진행": 겹침을 무시하고 저장

**구현 위치**: `App.tsx (Dialog 컴포넌트)`

---

### BR-OVERLAP-003: 사용자 선택권

**규칙**: 겹침이 있어도 사용자가 "계속 진행" 선택 가능

**비즈니스 가치**:
- 긴급한 일정은 겹쳐도 등록해야 할 수 있음
- 시스템이 강제하지 않고 사용자가 판단

**제한사항**:
- 현재 버전에서는 무제한 겹침 허용
- 향후 버전에서는 겹침 횟수 제한 고려 가능

---

## 반복 일정 규칙 (미구현)

### BR-REPEAT-001: 반복 일정 UI 비활성화

**규칙**: 현재 버전에서는 반복 일정 UI가 주석 처리됨

**이유**: 8주차 과제로 예정

**현재 동작**:
- `repeat` 필드는 데이터 모델에 존재
- 기본값: `{ type: 'none', interval: 1 }`
- 서버 API는 반복 일정 지원 (구현 완료)
- UI만 비활성화됨

**구현 위치**: `App.tsx:441-478` (주석 처리된 UI 코드)

---

### BR-REPEAT-002: 반복 일정 서버 지원 (구현 완료)

**규칙**: 서버는 반복 일정 생성/수정/삭제 지원

**API 엔드포인트**:
- POST /api/events-list: 여러 일정 동시 생성
- PUT /api/recurring-events/:repeatId: 반복 일정 시리즈 수정
- DELETE /api/recurring-events/:repeatId: 반복 일정 시리즈 삭제

**구현 위치**: `server.js`

---

## 알림 규칙

### BR-NOTIFY-001: 알림 시간 옵션

**규칙**: 다음 5가지 알림 시간만 선택 가능

| 값 (분) | 표시 | 사용 사례 |
|---------|------|-----------|
| 1 | 1분 전 | 긴급 회의, 직전 준비 |
| 10 | 10분 전 | 일반적인 회의 |
| 60 | 1시간 전 | 이동 시간 필요한 약속 |
| 120 | 2시간 전 | 준비 시간 필요한 이벤트 |
| 1440 | 1일 전 | 중요한 일정, 사전 준비 |

**구현 위치**: `App.tsx:notificationOptions`

---

### BR-NOTIFY-002: 알림 트리거 조건

**규칙**: 현재 시간이 일정 시작 시간 - 알림 시간 이내일 때 알림 표시

**알고리즘**:
```typescript
const now = new Date();
const eventStart = new Date(`${event.date}T${event.startTime}`);
const notifyTime = new Date(eventStart.getTime() - event.notificationTime * 60000);

if (now >= notifyTime && now < eventStart) {
  // 알림 표시
}
```

**구현 위치**: `hooks/useNotifications.ts`

---

### BR-NOTIFY-003: 알림 표시 방식

**규칙**: 알림은 두 가지 방식으로 표시

1. **화면 우측 상단 Alert**
   - 위치: `position: fixed, top: 16px, right: 16px`
   - 자동 사라짐: 없음 (사용자가 직접 닫기)
   - 닫기 버튼: X 아이콘

2. **일정 목록에서 강조 표시**
   - 배경색: 연한 빨강 (#ffebee)
   - 글꼴: 굵게 (bold)
   - 색상: 빨강 (#d32f2f)
   - 아이콘: 종 모양 (Notifications)

**구현 위치**: `App.tsx:635-655` (Alert), `App.tsx:186-214` (목록 강조)

---

### BR-NOTIFY-004: 중복 알림 방지

**규칙**: 같은 일정에 대해 한 번만 알림 표시

**동작**:
1. 알림 표시 시 해당 일정 ID를 `notifiedEvents` 배열에 추가
2. 이미 `notifiedEvents`에 있는 일정은 알림 생략
3. 페이지 새로고침 시 초기화 (세션 단위)

**구현 위치**: `hooks/useNotifications.ts`

---

## 검색 및 필터링 규칙

### BR-SEARCH-001: 검색 범위

**규칙**: 다음 필드에서 대소문자 구분 없이 검색

- `title`: 일정 제목
- `description`: 일정 설명
- `location`: 일정 위치

**검색 제외 필드**:
- `category`: 별도 필터로 구현 권장
- `date`, `startTime`, `endTime`: 날짜 필터로 구현 권장

**구현 위치**: `hooks/useSearch.ts`

---

### BR-SEARCH-002: 검색 알고리즘

**규칙**: 부분 문자열 매칭 (includes)

```typescript
const searchLower = searchTerm.toLowerCase();
const matches = events.filter(event =>
  event.title.toLowerCase().includes(searchLower) ||
  event.description.toLowerCase().includes(searchLower) ||
  event.location.toLowerCase().includes(searchLower)
);
```

**특징**:
- 대소문자 구분 없음
- 부분 문자열 허용 ("회의" 검색 시 "팀 회의", "회의실" 모두 매칭)
- 실시간 검색 (입력할 때마다 필터링)

---

### BR-SEARCH-003: 빈 검색어 처리

**규칙**: 검색어가 비어있으면 현재 뷰의 모든 일정 표시

**동작**:
- 검색어 = "" → 필터링 없이 전체 목록 표시
- 뷰(주간/월간)에 따라 날짜 범위만 필터링

---

### BR-SEARCH-004: 검색 결과 없음 처리

**규칙**: 검색 결과가 없으면 안내 메시지 표시

**메시지**: "검색 결과가 없습니다."
**표시 위치**: 일정 목록 영역

**구현 위치**: `App.tsx:535-537`

---

## 참조

- **관련 명세**:
  - [01. 데이터 모델](./01-data-models.md): 타입 정의
  - [05. 검증 규칙](./05-validation-rules.md): 유효성 검증 상세
  - [06. 일정 겹침 감지](./06-event-overlap-detection.md): 겹침 알고리즘
  - [07. 알림 시스템](./07-notification-system.md): 알림 상세
  - [08. 테스트 시나리오](./08-test-scenarios.md): 비즈니스 규칙 테스트

---

**다음 문서**: [03. 사용자 워크플로우](./03-user-workflows.md)
