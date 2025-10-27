# 07. 알림 시스템 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 개요

일정 시작 전 설정된 시간에 사용자에게 알림을 표시하는 시스템입니다.

---

## 알림 트리거 조건

### 알림 시간 계산

```typescript
const now = new Date();
const eventStart = new Date(`${event.date}T${event.startTime}`);
const notifyTime = new Date(
  eventStart.getTime() - event.notificationTime * 60000
);

if (now >= notifyTime && now < eventStart) {
  // 알림 표시
}
```

**조건**:
- 현재 시간 ≥ 알림 시간
- 현재 시간 < 일정 시작 시간

---

## 알림 시간 옵션

| 값 (분) | 표시 | 계산 |
|---------|------|------|
| 1 | 1분 전 | startTime - 1분 |
| 10 | 10분 전 | startTime - 10분 |
| 60 | 1시간 전 | startTime - 60분 |
| 120 | 2시간 전 | startTime - 120분 |
| 1440 | 1일 전 | startTime - 1440분 |

---

## 알림 표시 방식

### 1. 화면 우측 상단 Alert

**위치**: `position: fixed, top: 16px, right: 16px`

**내용**:
```tsx
<Alert severity="info">
  <AlertTitle>{event.title}</AlertTitle>
  <p>{event.notificationTime}분 전입니다.</p>
</Alert>
```

**특징**:
- 자동 사라짐 없음
- 사용자가 X 버튼으로 직접 닫기

---

### 2. 일정 목록 강조

**스타일**:
- 배경색: `#ffebee` (연한 빨강)
- 글꼴: `bold`
- 글자 색: `#d32f2f` (빨강)
- 아이콘: `<Notifications />` 표시

---

## 중복 알림 방지

### 알림 표시 이력 관리

```typescript
const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

// 알림 표시 시
if (!notifiedEvents.includes(event.id)) {
  setNotifications(prev => [...prev, notification]);
  setNotifiedEvents(prev => [...prev, event.id]);
}
```

**특징**:
- 세션 단위 관리 (페이지 새로고침 시 초기화)
- 같은 일정에 대해 한 번만 알림

---

## 알림 확인 주기

**구현**:
```typescript
useEffect(() => {
  const checkNotifications = () => {
    // 모든 일정 검사
    events.forEach(event => {
      if (shouldNotify(event) && !notifiedEvents.includes(event.id)) {
        showNotification(event);
      }
    });
  };

  const interval = setInterval(checkNotifications, 1000); // 1초마다
  return () => clearInterval(interval);
}, [events, notifiedEvents]);
```

---

## 알림 메시지 형식

```typescript
const notification = {
  id: event.id,
  message: `${event.title} ${event.notificationTime}분 전입니다.`
};
```

---

## 참조

- **구현 파일**: `src/hooks/useNotifications.ts`, `src/utils/notificationUtils.ts`
- **테스트 파일**: `src/__tests__/unit/easy.notificationUtils.spec.ts`

---

**다음 문서**: [08. 테스트 시나리오](./08-test-scenarios.md)
