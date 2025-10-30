# 04. API 명세

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 개요

### Base URL
- **개발**: `http://localhost:3000`
- **Vite Proxy**: `/api` → `http://localhost:3000`

### 인증
- 현재 버전: 인증 없음
- 모든 엔드포인트 공개

### 데이터 형식
- **Request**: `application/json`
- **Response**: `application/json`
- **날짜 형식**: ISO 8601 (YYYY-MM-DD)
- **시간 형식**: 24시간제 (HH:mm)

---

## 엔드포인트 목록

### GET /api/events
일정 목록 조회

**응답**:
```json
{
  "events": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "팀 회의",
      "date": "2025-10-27",
      "startTime": "14:00",
      "endTime": "15:00",
      "description": "Q4 진행 상황 리뷰",
      "location": "회의실 B",
      "category": "업무",
      "repeat": {
        "type": "none",
        "interval": 1
      },
      "notificationTime": 10
    }
  ]
}
```

**상태 코드**:
- `200 OK`: 성공
- `500 Internal Server Error`: 서버 오류

---

### POST /api/events
일정 생성

**요청**:
```json
{
  "title": "새 회의",
  "date": "2025-10-27",
  "startTime": "14:00",
  "endTime": "15:00",
  "description": "",
  "location": "",
  "category": "업무",
  "repeat": {
    "type": "none",
    "interval": 1
  },
  "notificationTime": 10
}
```

**응답** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "새 회의",
  // ... 요청 데이터 전체
}
```

---

### PUT /api/events/:id
일정 수정

**요청**:
```json
{
  "title": "수정된 회의",
  "date": "2025-10-27",
  // ... EventForm 필드 전체
}
```

**응답** (200 OK): 수정된 Event 객체

**상태 코드**:
- `404 Not Found`: 일정 미존재

---

### DELETE /api/events/:id
일정 삭제

**응답**: `204 No Content`

**상태 코드**:
- `404 Not Found`: 일정 미존재

---

### POST /api/events-list
여러 일정 동시 생성 (반복 일정용)

**요청**:
```json
{
  "events": [
    { /* EventForm */ },
    { /* EventForm */ }
  ]
}
```

**응답** (201 Created): 생성된 Event 배열

---

### PUT /api/recurring-events/:repeatId
반복 일정 시리즈 수정 (미구현 UI)

---

### DELETE /api/recurring-events/:repeatId
반복 일정 시리즈 삭제 (미구현 UI)

---

## 에러 응답 형식

```json
{
  "error": "Error message"
}
```

**상태 코드**:
- `400 Bad Request`: 잘못된 요청
- `404 Not Found`: 리소스 미존재
- `500 Internal Server Error`: 서버 오류

---

## 참조

- **구현 파일**: `server.js`
- **클라이언트 사용**: `src/hooks/useEventOperations.ts`

---

**다음 문서**: [05. 검증 규칙](./05-validation-rules.md)
