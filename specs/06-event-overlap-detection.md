# 06. 일정 겹침 감지 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 개요

두 일정의 시간이 겹치는지 판단하는 알고리즘을 정의합니다.

---

## 겹침 판단 알고리즘

### 핵심 공식

```typescript
function isOverlapping(event1: Event, event2: Event): boolean {
  const start1 = parseDateTime(event1.date, event1.startTime);
  const end1 = parseDateTime(event1.date, event1.endTime);
  const start2 = parseDateTime(event2.date, event2.startTime);
  const end2 = parseDateTime(event2.date, event2.endTime);

  return start1 < end2 && start2 < end1;
}
```

**조건**: `start1 < end2 AND start2 < end1`

---

## 시각적 예시

### 겹치는 경우

```
Event A:  [==========]
          10:00    12:00

Event B:        [==========]
                11:00    13:00

겹침 구간:      [====]
                11:00-12:00
```

**판단**: `10:00 < 13:00 AND 11:00 < 12:00` → **TRUE**

---

### 겹치지 않는 경우

```
Event A:  [==========]
          10:00    12:00

Event B:            [==========]
                    12:00    14:00

겹침 없음
```

**판단**: `10:00 < 14:00 AND 12:00 < 12:00` → **FALSE**

---

## 구현 함수

### parseDateTime

```typescript
function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}
```

**입력**: `('2025-10-27', '14:30')`
**출력**: `Date('2025-10-27T14:30:00')`

---

### convertEventToDateRange

```typescript
function convertEventToDateRange(event: Event | EventForm) {
  return {
    start: parseDateTime(event.date, event.startTime),
    end: parseDateTime(event.date, event.endTime)
  };
}
```

---

### findOverlappingEvents

```typescript
function findOverlappingEvents(
  newEvent: Event | EventForm,
  events: Event[]
): Event[] {
  return events.filter(
    event => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
```

**특징**: 자기 자신 제외 (`event.id !== newEvent.id`)

---

## Edge Case 처리

### Case 1: 정확히 끝나고 시작

```
Event A: 10:00-12:00
Event B: 12:00-14:00

결과: 겹치지 않음 (start2 < end1 → 12:00 < 12:00 → FALSE)
```

---

### Case 2: 완전히 포함

```
Event A: 10:00-16:00
Event B: 12:00-14:00

결과: 겹침 (B가 A에 완전히 포함)
```

---

### Case 3: 같은 시간

```
Event A: 10:00-12:00
Event B: 10:00-12:00

결과: 겹침
```

---

## 참조

- **구현 파일**: `src/utils/eventOverlap.ts`
- **테스트 파일**: `src/__tests__/unit/easy.eventOverlap.spec.ts`

---

**다음 문서**: [07. 알림 시스템](./07-notification-system.md)
