# 05. 검증 규칙 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 개요

모든 입력 데이터의 유효성 검증 규칙과 에러 메시지를 정의합니다.

---

## 필수 필드 검증

### VR-REQ-001: 제목 검증

**규칙**:
- 빈 문자열 불가
- 최소 길이: 1자
- 최대 길이: 100자

**에러 메시지**: "필수 정보를 모두 입력해주세요."

---

### VR-REQ-002: 날짜 검증

**규칙**:
- 빈 문자열 불가
- 형식: `YYYY-MM-DD`
- 정규식: `/^\d{4}-\d{2}-\d{2}$/`
- 유효한 날짜여야 함

**에러 메시지**: "필수 정보를 모두 입력해주세요."

---

### VR-REQ-003: 시간 검증

**규칙** (startTime, endTime):
- 빈 문자열 불가
- 형식: `HH:mm`
- 정규식: `/^\d{2}:\d{2}$/`
- 유효한 시간 (00:00 ~ 23:59)

**에러 메시지**: "필수 정보를 모두 입력해주세요."

---

## 시간 순서 검증

### VR-TIME-001: 시작/종료 시간 비교

**규칙**: `startTime < endTime`

**구현**:
```typescript
const startDate = new Date(`2000-01-01T${start}`);
const endDate = new Date(`2000-01-01T${end}`);

if (startDate >= endDate) {
  return {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  };
}
```

**검증 시점**: onBlur, 제출 시

**구현 위치**: `src/utils/timeValidation.ts`

---

## 선택 필드 검증

### VR-OPT-001: 설명 검증

**규칙**:
- 빈 문자열 허용
- 최대 길이: 500자

---

### VR-OPT-002: 위치 검증

**규칙**:
- 빈 문자열 허용
- 최대 길이: 200자

---

## 카테고리 검증

### VR-CAT-001: 카테고리 값

**규칙**: `'업무'` | `'개인'` | `'가족'` | `'기타'` 중 하나

---

## 알림 시간 검증

### VR-NOTIF-001: 알림 시간 값

**규칙**: `1` | `10` | `60` | `120` | `1440` 중 하나

---

## 제출 시 종합 검증

### VR-SUBMIT-001: 제출 전 체크리스트

```typescript
// 1. 필수 필드 존재 검증
if (!title || !date || !startTime || !endTime) {
  return '필수 정보를 모두 입력해주세요.';
}

// 2. 시간 에러 존재 검증
if (startTimeError || endTimeError) {
  return '시간 설정을 확인해주세요.';
}

// 3. 일정 겹침 검증 (경고, 강제 아님)
const overlapping = findOverlappingEvents(eventData, events);
if (overlapping.length > 0) {
  // 다이얼로그 표시
}
```

**구현 위치**: `App.tsx:addOrUpdateEvent()`

---

## 참조

- **구현 파일**: `src/utils/timeValidation.ts`, `App.tsx`
- **테스트 파일**: `src/__tests__/unit/easy.timeValidation.spec.ts`

---

**다음 문서**: [06. 일정 겹침 감지](./06-event-overlap-detection.md)
