# 08. 테스트 시나리오 및 수용 기준

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-27

---

## 📋 목차

1. [개요](#개요)
2. [단위 테스트 시나리오](#단위-테스트-시나리오)
3. [통합 테스트 시나리오](#통합-테스트-시나리오)
4. [수용 기준 (Acceptance Criteria)](#수용-기준-acceptance-criteria)

---

## 개요

### 문서 목적

모든 기능에 대한 테스트 시나리오를 Given-When-Then 형식으로 정의하고, 각 시나리오의 수용 기준을 명확히 합니다. 이 명세를 바탕으로 AI가 테스트 코드를 생성하거나 기존 테스트를 검증할 수 있습니다.

### 테스트 전략

- **단위 테스트**: 순수 함수와 유틸리티 (src/utils/, src/apis/)
- **통합 테스트**: 사용자 워크플로우 전체 (src/**tests**/medium.integration.spec.tsx)
- **커버리지 목표**: 단위 테스트 80% 이상, 통합 테스트 주요 워크플로우 100%

---

## TDD 접근 방식

이 프로젝트는 **Test-Driven Development (TDD)** 방법론을 따릅니다. 모든 기능은 테스트를 먼저 작성하고, 테스트를 통과하는 최소한의 코드를 구현한 후, 리팩토링하는 Red-Green-Refactor 사이클로 개발됩니다.

### 명세 → 테스트 → 구현 순서

TDD 워크플로우는 다음과 같이 진행됩니다:

1. **🔴 Red: 실패하는 테스트 작성**
   - 이 문서(specs/08-test-scenarios.md)에서 해당 시나리오 읽기
   - 명세를 바탕으로 Vitest 테스트 케이스 작성
   - 테스트 실행 → 실패 확인 (아직 구현 코드가 없으므로)

2. **🟢 Green: 테스트를 통과하는 최소한의 코드 작성**
   - 명세의 요구사항만 충족하는 구현 작성
   - 테스트 실행 → 성공 확인

3. **🔵 Refactor: 코드 개선**
   - 중복 제거, 가독성 향상, 성능 최적화
   - 테스트는 여전히 통과해야 함
   - 명세의 수용 기준(Acceptance Criteria) 재확인

4. **✅ 커밋 및 다음 테스트**
   - 변경사항 커밋
   - 다음 시나리오로 이동하여 1번부터 반복

### Given-When-Then 구조

이 문서의 모든 시나리오는 **Given-When-Then** 형식으로 작성되어 있습니다. 이것은 **테스트 케이스 구조화 패턴**으로, Vitest의 **Arrange-Act-Assert** 패턴과 동일한 의미입니다:

| 명세 패턴 | 테스트 패턴 | 설명                                           |
| --------- | ----------- | ---------------------------------------------- |
| **Given** | **Arrange** | 테스트 전제 조건 설정 (초기 상태, 입력 데이터) |
| **When**  | **Act**     | 테스트 대상 함수 실행 (실제 동작)              |
| **Then**  | **Assert**  | 결과 검증 (기대값과 실제값 비교)               |

### 명세를 Vitest 코드로 변환하는 예시

**명세 (UT-01-001)**:

```gherkin
Scenario: 시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환

Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('14:00', '13:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  }
```

**Vitest 테스트 코드**:

```typescript
import { describe, it, expect } from 'vitest';
import { getTimeErrorMessage } from '@/utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환', () => {
    // Given (Arrange) - 테스트 전제 조건
    const startTime = '14:00';
    const endTime = '13:00';

    // When (Act) - 테스트 대상 함수 실행
    const result = getTimeErrorMessage(startTime, endTime);

    // Then (Assert) - 결과 검증
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });
});
```

**Red-Green-Refactor 적용**:

1. 🔴 위 테스트 작성 → 실행 → 실패 (함수 미구현)
2. 🟢 `getTimeErrorMessage` 함수 구현 → 실행 → 성공
3. 🔵 코드 개선 (예: 매직 넘버 제거, 에러 메시지 상수화)
4. ✅ 커밋 후 다음 시나리오(UT-01-002)로 이동

---

## 단위 테스트 시나리오

### UT-01: 시간 유효성 검증 (`timeValidation.spec.ts`)

#### UT-01-001: 시작 시간이 종료 시간보다 늦을 때

```gherkin
Scenario: 시작 시간이 종료 시간보다 늦을 때 에러 메시지 반환

Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('14:00', '13:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  }
```

**테스트 파일**: `src/__tests__/unit/easy.timeValidation.spec.ts:4-10`

---

#### UT-01-002: 시작 시간과 종료 시간이 같을 때

```gherkin
Scenario: 시작 시간과 종료 시간이 같을 때 에러 메시지 반환

Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('14:00', '14:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  }
```

**수용 기준**:

- 시작 시간 = 종료 시간인 경우 에러로 처리
- 0분 일정은 허용하지 않음

---

#### UT-01-003: 정상적인 시간 입력

```gherkin
Scenario: 시작 시간이 종료 시간보다 빠를 때 null 반환

Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('13:00', '14:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: null,
    endTimeError: null
  }
```

---

#### UT-01-004: 빈 입력 처리

```gherkin
Scenario: 시작 시간이 비어있을 때 null 반환

Given: getTimeErrorMessage 함수가 있음
When: getTimeErrorMessage('', '14:00') 호출
Then: 다음 객체 반환
  {
    startTimeError: null,
    endTimeError: null
  }
```

**수용 기준**:

- 빈 문자열 입력 시 검증하지 않음
- 필수 필드 검증은 별도 로직에서 처리

---

### UT-02: 일정 겹침 감지 (`eventOverlap.spec.ts`)

#### UT-02-001: parseDateTime 정상 동작

```gherkin
Scenario: 유효한 날짜와 시간을 Date 객체로 변환

Given: parseDateTime 함수가 있음
When: parseDateTime('2025-07-01', '14:30') 호출
Then: new Date('2025-07-01T14:30:00')과 동일한 객체 반환
```

**테스트 파일**: `src/__tests__/unit/easy.eventOverlap.spec.ts:10-13`

---

#### UT-02-002: parseDateTime 잘못된 입력 처리

```gherkin
Scenario: 잘못된 날짜 형식에 대해 Invalid Date 반환

Given: parseDateTime 함수가 있음
When: parseDateTime('2025/07/01', '14:30') 호출  # 슬래시 형식
Then: Invalid Date 반환
```

**수용 기준**:

- 잘못된 형식은 Invalid Date로 처리
- 에러를 던지지 않음 (Date 생성자 동작과 일치)

---

#### UT-02-003: isOverlapping 겹치는 경우

```gherkin
Scenario: 두 이벤트가 시간적으로 겹침

Given: 두 이벤트가 있음
  event1: 2025-07-01, 14:00-16:00
  event2: 2025-07-01, 15:00-17:00
When: isOverlapping(event1, event2) 호출
Then: true 반환
```

**알고리즘**: `start1 < end2 && start2 < end1`

**테스트 파일**: `src/__tests__/unit/easy.eventOverlap.spec.ts:88-114`

---

#### UT-02-004: isOverlapping 겹치지 않는 경우

```gherkin
Scenario: 두 이벤트가 시간적으로 겹치지 않음

Given: 두 이벤트가 있음
  event1: 2025-07-01, 14:00-16:00
  event2: 2025-07-01, 16:00-18:00
When: isOverlapping(event1, event2) 호출
Then: false 반환
```

**수용 기준**:

- 종료 시간과 시작 시간이 정확히 같으면 겹치지 않음
- 1분이라도 겹치면 true

---

#### UT-02-005: findOverlappingEvents 여러 겹침

```gherkin
Scenario: 새 이벤트와 겹치는 모든 이벤트 찾기

Given: 기존 이벤트 목록이 있음
  event1: 2025-07-01, 10:00-12:00
  event2: 2025-07-01, 11:00-13:00
  event3: 2025-07-01, 15:00-16:00
When: 새 이벤트 추가
  newEvent: 2025-07-01, 11:30-14:30
Then: [event1, event2] 반환 (event3는 제외)
```

**테스트 파일**: `src/__tests__/unit/easy.eventOverlap.spec.ts:185-200`

---

#### UT-02-006: findOverlappingEvents 자기 자신 제외

```gherkin
Scenario: 수정 시 자기 자신과의 겹침은 무시

Given: 기존 이벤트가 있음
  event1: id='1', 2025-07-01, 10:00-12:00
When: 같은 이벤트를 수정
  updatedEvent: id='1', 2025-07-01, 10:00-12:00
Then: 빈 배열 반환 (자기 자신 제외)
```

**구현**: `event.id !== newEvent.id` 조건으로 필터링

---

### UT-03: 날짜 유틸리티 (`dateUtils.spec.ts`)

#### UT-03-001: formatDate

```gherkin
Scenario: Date 객체와 일(day)을 YYYY-MM-DD 형식으로 변환

Given: formatDate 함수가 있음
  currentDate: 2025년 10월을 나타내는 Date 객체
When: formatDate(currentDate, 15) 호출
Then: '2025-10-15' 반환
```

---

#### UT-03-002: getWeekDates

```gherkin
Scenario: 주어진 날짜가 속한 주의 일요일~토요일 날짜 배열 반환

Given: getWeekDates 함수가 있음
  date: 2025-10-27 (월요일)
When: getWeekDates(date) 호출
Then: [2025-10-26(일), 2025-10-27(월), ..., 2025-11-01(토)] 배열 반환
And: 배열 길이는 7
```

**수용 기준**:

- 항상 일요일부터 시작
- 배열 길이는 정확히 7

---

#### UT-03-003: getWeeksAtMonth

```gherkin
Scenario: 특정 월의 모든 주차 데이터 반환 (캘린더 그리드용)

Given: getWeeksAtMonth 함수가 있음
  date: 2025년 10월을 나타내는 Date 객체
When: getWeeksAtMonth(date) 호출
Then: 2차원 배열 반환
  [
    [null, null, null, 1, 2, 3, 4],  # 10월 1일이 수요일인 경우
    [5, 6, 7, 8, 9, 10, 11],
    ...
  ]
And: 각 주는 7개 요소 (일~토)
And: 해당 월에 속하지 않는 날은 null
```

---

### UT-04: 이벤트 유틸리티 (`eventUtils.spec.ts`)

#### UT-04-001: fillZero

```gherkin
Scenario: 한 자리 숫자를 두 자리 문자열로 변환

Given: fillZero 함수가 있음
When: fillZero(5) 호출
Then: '05' 반환

When: fillZero(10) 호출
Then: '10' 반환
```

---

### UT-05: 알림 유틸리티 (`notificationUtils.spec.ts`)

#### UT-05-001: isTimeToNotify

```gherkin
Scenario: 알림 시간이 되었는지 판단

Given: isTimeToNotify 함수가 있음
  event: date='2025-10-27', startTime='14:00', notificationTime=10
  now: 2025-10-27 13:50
When: isTimeToNotify(event, now) 호출
Then: true 반환  # 10분 전이므로 알림 시간

Given: now: 2025-10-27 13:49
When: isTimeToNotify(event, now) 호출
Then: false 반환  # 아직 알림 시간 아님
```

---

### UT-06: 공휴일 API (`fetchHolidays.spec.ts`)

#### UT-06-001: fetchHolidays 성공

```gherkin
Scenario: 공휴일 API 호출 성공

Given: fetchHolidays 함수가 있음
  year: 2025, month: 10
When: fetchHolidays(2025, 10) 호출
Then: Promise 반환
And: 결과는 { [date: string]: string } 형식
  예: { '2025-10-03': '개천절', '2025-10-09': '한글날' }
```

---

## 통합 테스트 시나리오

### IT-01: 일정 CRUD 및 기본 기능

#### IT-01-001: 새로운 일정 생성

```gherkin
Scenario: 입력한 새로운 일정 정보가 정확히 저장됨

Given: 사용자가 일정 관리 페이지에 접근
And: MSW가 POST /api/events를 모킹 (성공 응답)
When: 다음 정보를 입력하여 일정 추가
  - 제목: '새 회의'
  - 날짜: '2025-10-15'
  - 시작 시간: '14:00'
  - 종료 시간: '15:00'
  - 설명: '프로젝트 진행 상황 논의'
  - 위치: '회의실 A'
  - 카테고리: '업무'
Then: 일정 목록에 새 일정이 다음 정보와 함께 표시됨
  - 제목: '새 회의'
  - 날짜: '2025-10-15'
  - 시간: '14:00 - 15:00'
  - 설명: '프로젝트 진행 상황 논의'
  - 위치: '회의실 A'
  - 카테고리: '카테고리: 업무'
```

**테스트 파일**: `src/__tests__/medium.integration.spec.tsx:58-80`

**수용 기준**:

- 모든 필드가 입력한 값과 정확히 일치
- 서버 API 호출 성공
- UI에 즉시 반영

---

#### IT-01-002: 기존 일정 수정

```gherkin
Scenario: 기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영됨

Given: 일정이 하나 이상 존재함
  - 기존 일정: '팀 회의', 설명: '기존 설명'
And: MSW가 PUT /api/events/:id를 모킹 (성공 응답)
When: '팀 회의' 일정의 Edit 버튼 클릭
And: 제목을 '수정된 회의'로 변경
And: 설명을 '회의 내용 변경'으로 변경
And: '일정 수정' 버튼 클릭
Then: 일정 목록에 변경된 내용이 표시됨
  - 제목: '수정된 회의'
  - 설명: '회의 내용 변경'
```

**테스트 파일**: `src/__tests__/medium.integration.spec.tsx:82-99`

---

#### IT-01-003: 일정 삭제

```gherkin
Scenario: 일정을 삭제하면 목록에서 제거됨

Given: 일정이 하나 이상 존재함
And: MSW가 DELETE /api/events/:id를 모킹 (성공 응답)
When: Delete 버튼 클릭
Then: 해당 일정이 목록에서 사라짐
And: "일정이 삭제되었습니다." 알림 표시
```

---

### IT-02: 검색 및 필터링

#### IT-02-001: 제목으로 검색

```gherkin
Scenario: 검색어와 일치하는 일정만 표시

Given: 여러 일정이 존재함
  - '팀 회의'
  - '점심 약속'
  - '개인 시간'
When: 검색 필드에 '회의' 입력
Then: '팀 회의'만 목록에 표시됨
And: 다른 일정들은 숨겨짐
```

---

#### IT-02-002: 검색 결과 없음

```gherkin
Scenario: 검색 결과가 없을 때 안내 메시지 표시

Given: 여러 일정이 존재함
When: 검색 필드에 매칭되지 않는 텍스트 입력
Then: "검색 결과가 없습니다." 메시지 표시
And: 일정 목록이 비어있음
```

---

### IT-03: 캘린더 뷰 전환

#### IT-03-001: 주간 뷰 표시

```gherkin
Scenario: 주간 뷰에서 일주일 일정 표시

Given: 현재 뷰가 주간 뷰
  - 날짜: 2025-10-27 (월요일)
Then: 10월 26일(일) ~ 11월 1일(토) 표시
And: 각 날짜 셀에 해당 일정 표시
And: 제목에 "2025년 10월 4주" 형식 표시
```

---

#### IT-03-002: 월간 뷰 표시

```gherkin
Scenario: 월간 뷰에서 한 달 전체 일정 표시

Given: 현재 뷰가 월간 뷰
  - 날짜: 2025년 10월
Then: 10월 1일 ~ 10월 31일 표시
And: 주차별로 행 구성 (5-6주)
And: 각 날짜 셀에 해당 일정 표시
And: 공휴일 표시 (빨간색)
And: 제목에 "2025년 10월" 표시
```

---

### IT-04: 일정 겹침 처리

#### IT-04-001: 겹침 경고 표시

```gherkin
Scenario: 겹치는 일정 생성 시 경고 다이얼로그 표시

Given: 기존 일정이 있음
  - 날짜: 2025-10-27
  - 시간: 14:00-16:00
  - 제목: '기존 회의'
When: 새 일정 입력
  - 날짜: 2025-10-27
  - 시간: 15:00-17:00
  - 제목: '긴급 회의'
And: '일정 추가' 버튼 클릭
Then: "일정 겹침 경고" 다이얼로그 표시
And: 겹치는 일정 정보 표시: "기존 회의 (2025-10-27 14:00-16:00)"
And: "취소" / "계속 진행" 버튼 표시
```

---

#### IT-04-002: 겹침 경고 무시하고 생성

```gherkin
Scenario: 겹침 경고에서 "계속 진행" 선택 시 일정 생성

Given: 겹침 경고 다이얼로그가 표시됨
When: "계속 진행" 버튼 클릭
Then: 다이얼로그 닫힘
And: 새 일정이 목록에 추가됨
And: 캘린더에 두 일정 모두 표시됨
```

---

### IT-05: 알림 시스템

#### IT-05-001: 알림 시간 도달 시 알림 표시

```gherkin
Scenario: 일정 시작 10분 전에 알림 표시

Given: 일정이 있음
  - 날짜: 오늘
  - 시작 시간: 현재 시간 + 10분
  - 알림 설정: 10분 전
When: 1분 경과 (알림 시간 도달)
Then: 화면 우측 상단에 Alert 표시
  - 메시지: "[일정 제목] 10분 전입니다."
And: 일정 목록에서 해당 일정 강조 표시
  - 배경: 연한 빨강
  - 글꼴: 굵게
  - 아이콘: 종 모양
```

---

#### IT-05-002: 중복 알림 방지

```gherkin
Scenario: 같은 일정에 대해 한 번만 알림 표시

Given: 일정에 대해 알림이 이미 표시됨
When: 시간이 더 경과하여 여전히 알림 조건 만족
Then: 추가 알림이 표시되지 않음
And: 기존 알림만 유지됨
```

---

## 수용 기준 (Acceptance Criteria)

### AC-01: 일정 생성

**수용 기준**:

- [ ] 모든 필수 필드 입력 시에만 생성 가능
- [ ] 시작 시간 < 종료 시간 검증 통과
- [ ] 서버 API 호출 성공 (201 Created)
- [ ] 클라이언트 목록에 즉시 반영
- [ ] 캘린더 뷰에 표시
- [ ] 성공 알림 표시
- [ ] 폼 초기화

---

### AC-02: 일정 수정

**수용 기준**:

- [ ] Edit 버튼 클릭 시 폼에 기존 데이터 로드
- [ ] 폼 제목이 "일정 수정"으로 변경
- [ ] 제출 버튼 텍스트가 "일정 수정"으로 변경
- [ ] 수정 시에도 동일한 검증 규칙 적용
- [ ] 자기 자신과의 겹침은 무시
- [ ] 서버 API 호출 성공 (200 OK)
- [ ] 목록 및 캘린더에 변경사항 즉시 반영
- [ ] 성공 알림 표시

---

### AC-03: 일정 삭제

**수용 기준**:

- [ ] Delete 버튼 클릭 시 즉시 삭제 (확인 없음)
- [ ] 서버 API 호출 성공 (204 No Content)
- [ ] 목록 및 캘린더에서 즉시 제거
- [ ] 삭제 알림 표시

---

### AC-04: 일정 검색

**수용 기준**:

- [ ] 제목, 설명, 위치에서 검색
- [ ] 대소문자 구분 없음
- [ ] 부분 문자열 매칭
- [ ] 실시간 필터링 (입력할 때마다)
- [ ] 검색 결과 없을 시 안내 메시지
- [ ] 검색어 지우면 전체 목록 복원

---

### AC-05: 일정 겹침 감지

**수용 기준**:

- [ ] 같은 날짜에 시간이 겹치면 경고
- [ ] 겹치는 일정 목록 표시
- [ ] "취소" 선택 시 생성 중단, 폼 데이터 유지
- [ ] "계속 진행" 선택 시 강제 생성
- [ ] 수정 시 자기 자신 제외

---

### AC-06: 캘린더 뷰

**수용 기준**:

- [ ] 주간/월간 뷰 전환 가능
- [ ] 이전/다음 주/월 네비게이션
- [ ] 각 날짜 셀에 해당 일정 표시
- [ ] 공휴일 표시 (월간 뷰)
- [ ] 현재 기간 표시 (제목)
- [ ] 뷰 전환 시 일정 목록도 필터링

---

### AC-07: 알림 시스템

**수용 기준**:

- [ ] 일정 시작 시간 - 알림 시간에 알림 표시
- [ ] 화면 우측 상단 Alert
- [ ] 일정 목록에서 강조 표시
- [ ] 중복 알림 방지
- [ ] Alert 닫기 버튼
- [ ] 페이지 새로고침 시 초기화

---

## 테스트 실행 가이드

### 단위 테스트 실행

```bash
# 모든 단위 테스트
pnpm test src/__tests__/unit/

# 특정 파일
pnpm test src/__tests__/unit/easy.timeValidation.spec.ts

# 특정 테스트만
pnpm test src/__tests__/unit/easy.timeValidation.spec.ts -t "시작 시간이 종료 시간보다 늦을 때"
```

### 통합 테스트 실행

```bash
# 통합 테스트
pnpm test src/__tests__/medium.integration.spec.tsx

# watch 모드
pnpm test src/__tests__/medium.integration.spec.tsx --watch
```

### 커버리지 확인

```bash
pnpm test:coverage
```

---

## 참조

- **테스트 파일**:
  - `src/__tests__/unit/`: 단위 테스트
  - `src/__tests__/medium.integration.spec.tsx`: 통합 테스트
- **관련 명세**:
  - [02. 비즈니스 규칙](./02-business-rules.md): 비즈니스 로직
  - [03. 사용자 워크플로우](./03-user-workflows.md): 사용자 시나리오
  - [05. 검증 규칙](./05-validation-rules.md): 유효성 검증

---

**이전 문서**: [07. 알림 시스템](./07-notification-system.md)
