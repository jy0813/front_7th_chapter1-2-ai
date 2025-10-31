# 반복 종료 날짜 검증 명세

**문서 버전**: 1.0.0
**작성일**: 2025-10-31
**상태**: ✅ 완료

---

## 1. 개요

### 목적
반복 일정의 종료 날짜(`endDate`)를 입력받을 때, 유효한 날짜인지 검증하고 최대 날짜 제한(2025-12-31)을 적용합니다.

### 범위
- 반복 종료 날짜 입력 UI
- 날짜 유효성 검증 로직
- 최대 날짜 제한 (2025-12-31)
- 에러 메시지 표시

---

## 2. 기능 요구사항

### 2.1 반복 종료 날짜 입력

**Given**: 사용자가 반복 일정을 생성/수정하고 있다
**When**: 반복 유형을 선택하고 종료 날짜를 입력한다
**Then**:
- 날짜 입력 필드에 유효한 날짜를 입력할 수 있다
- 2025-12-31 이후의 날짜는 입력할 수 없다
- 일정 시작 날짜보다 이전 날짜는 입력할 수 없다

### 2.2 최대 날짜 제한

**Given**: 사용자가 반복 종료 날짜를 입력하고 있다
**When**: 2025-12-31 이후의 날짜를 입력한다
**Then**:
- 에러 메시지가 표시된다
- 메시지: "반복 종료일은 2025-12-31까지만 설정할 수 있습니다"
- 일정 저장이 불가능하다

### 2.3 시작 날짜보다 이전 검증

**Given**: 사용자가 반복 종료 날짜를 입력하고 있다
**When**: 일정 시작 날짜보다 이전 날짜를 입력한다
**Then**:
- 에러 메시지가 표시된다
- 메시지: "반복 종료일은 시작일({시작일}) 이후여야 합니다"
- 일정 저장이 불가능하다

---

## 3. 검증 규칙

### 3.1 날짜 형식 검증

```typescript
/**
 * 날짜 형식 검증
 *
 * @param dateStr - 검증할 날짜 문자열 (YYYY-MM-DD)
 * @returns true if valid format, false otherwise
 */
function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateStr) && !isNaN(Date.parse(dateStr));
}
```

### 3.2 최대 날짜 제한 검증

```typescript
/**
 * 최대 날짜 제한 검증 (2025-12-31까지)
 *
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns true if valid, false if exceeds max date
 */
function isWithinMaxDate(endDate: string): boolean {
  const maxDate = new Date('2025-12-31');
  const inputDate = new Date(endDate);
  return inputDate <= maxDate;
}
```

### 3.3 시작 날짜 이후 검증

```typescript
/**
 * 시작 날짜 이후 검증
 *
 * @param startDate - 일정 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD)
 * @returns true if endDate is after startDate, false otherwise
 */
function isEndDateAfterStartDate(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}
```

### 3.4 통합 검증 함수

```typescript
/**
 * 반복 종료 날짜 통합 검증
 *
 * @param startDate - 일정 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD, optional)
 * @returns 에러 메시지 (유효하면 빈 문자열)
 */
function validateRepeatEndDate(
  startDate: string,
  endDate?: string
): string {
  // 1. endDate가 없으면 유효 (선택적 필드)
  if (!endDate) {
    return '';
  }

  // 2. 날짜 형식 검증
  if (!isValidDateFormat(endDate)) {
    return '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)';
  }

  // 3. 시작 날짜 이후 검증
  if (!isEndDateAfterStartDate(startDate, endDate)) {
    return `반복 종료일은 시작일(${startDate}) 이후여야 합니다`;
  }

  // 4. 최대 날짜 제한 검증
  if (!isWithinMaxDate(endDate)) {
    return '반복 종료일은 2025-12-31까지만 설정할 수 있습니다';
  }

  return '';
}
```

---

## 4. 테스트 시나리오

### 4.1 정상 케이스

#### 시나리오 1: 유효한 종료 날짜
```typescript
// Given
const startDate = '2025-10-01';
const endDate = '2025-10-31';

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('');
```

#### 시나리오 2: 종료 날짜 없음 (선택적)
```typescript
// Given
const startDate = '2025-10-01';
const endDate = undefined;

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('');
```

#### 시나리오 3: 최대 날짜 (2025-12-31)
```typescript
// Given
const startDate = '2025-01-01';
const endDate = '2025-12-31';

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('');
```

### 4.2 에러 케이스

#### 시나리오 4: 최대 날짜 초과
```typescript
// Given
const startDate = '2025-01-01';
const endDate = '2026-01-01';

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('반복 종료일은 2025-12-31까지만 설정할 수 있습니다');
```

#### 시나리오 5: 시작 날짜보다 이전
```typescript
// Given
const startDate = '2025-10-31';
const endDate = '2025-10-01';

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('반복 종료일은 시작일(2025-10-31) 이후여야 합니다');
```

#### 시나리오 6: 잘못된 날짜 형식
```typescript
// Given
const startDate = '2025-10-01';
const endDate = 'invalid-date';

// When
const error = validateRepeatEndDate(startDate, endDate);

// Then
expect(error).toBe('올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)');
```

---

## 5. UI 통합

### 5.1 입력 필드 제약

```tsx
<TextField
  type="date"
  label="반복 종료일"
  value={repeatEndDate}
  onChange={(e) => setRepeatEndDate(e.target.value)}
  inputProps={{
    max: '2025-12-31',  // HTML5 max 속성
    min: eventDate      // 시작 날짜 이후만 선택 가능
  }}
  error={!!endDateError}
  helperText={endDateError}
/>
```

### 5.2 실시간 검증

```typescript
// 종료 날짜 변경 시 실시간 검증
const handleEndDateChange = (newEndDate: string) => {
  setRepeatEndDate(newEndDate);

  const error = validateRepeatEndDate(eventForm.date, newEndDate);
  setEndDateError(error);
};
```

---

## 6. 예외 처리

### 6.1 서버 응답 에러

**Given**: 서버에 반복 종료 날짜가 포함된 일정을 저장한다
**When**: 서버가 400 Bad Request를 반환한다
**Then**:
- 에러 메시지를 파싱하여 사용자에게 표시
- 폼 데이터는 유지하여 수정 가능

### 6.2 네트워크 에러

**Given**: 반복 일정을 저장하려고 한다
**When**: 네트워크 오류가 발생한다
**Then**:
- "네트워크 오류가 발생했습니다. 다시 시도해주세요" 메시지 표시
- 재시도 옵션 제공

---

## 7. 데이터 흐름

```
사용자 입력 (endDate)
    ↓
validateRepeatEndDate(startDate, endDate)
    ↓
┌─ 유효하면 → 폼 제출 가능
└─ 유효하지 않으면 → 에러 메시지 표시, 제출 불가
```

---

## 8. 관련 문서

- [specs/01-data-models.md](./01-data-models.md) - RepeatInfo 타입 정의
- [specs/05-validation-rules.md](./05-validation-rules.md) - 기타 검증 규칙
- [rules/tdd-principles.md](../rules/tdd-principles.md) - TDD 개발 원칙

---

## 9. 수용 기준 (Acceptance Criteria)

### 필수 요구사항
- ✅ 반복 종료 날짜가 2025-12-31 이후면 에러 메시지 표시
- ✅ 반복 종료 날짜가 시작 날짜보다 이전이면 에러 메시지 표시
- ✅ 유효한 종료 날짜는 정상적으로 저장됨
- ✅ 종료 날짜는 선택적 필드 (없어도 유효)

### 사용자 경험
- ✅ HTML5 date input의 max 속성으로 2025-12-31 이후 선택 불가
- ✅ HTML5 date input의 min 속성으로 시작 날짜 이전 선택 불가
- ✅ 실시간 검증으로 입력 즉시 피드백 제공
- ✅ 명확한 에러 메시지로 수정 방법 안내

---

**생성 도구**: 수동 작성 (Agent 1)
**명세 품질**: Given-When-Then 패턴 준수, 구체적 예시 포함, 엣지 케이스 명시
