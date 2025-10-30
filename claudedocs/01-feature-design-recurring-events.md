# Agent 1: 반복 일정 기능 설계 문서

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-30
**Agent**: Agent 1 (Feature Design Agent)

---

## 📋 목차

1. [작업 개요](#작업-개요)
2. [프로젝트 분석 결과](#프로젝트-분석-결과)
3. [작업 범위](#작업-범위)
4. [영향 범위 분석](#영향-범위-분석)
5. [명세 품질 자체 검증](#명세-품질-자체-검증)
6. [체크리스트](#체크리스트)
7. [다음 단계](#다음-단계)

---

## 작업 개요

### 기능 요구사항

사용자가 일정 생성 또는 수정 시 반복 유형을 선택할 수 있도록 합니다.

**반복 유형**:
- 매일 (daily)
- 매주 (weekly)
- 매월 (monthly)
- 매년 (yearly)

**특수 제약사항**:
1. **31일 매월 반복**: 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뛰기
2. **2월 29일 매년 반복**: 평년(윤년이 아닌 해)은 건너뛰기
3. **일정 겹침**: 반복일정은 일정 겹침 검사를 하지 않음

### 출력물

1. **명세 문서**: `specs/09-recurring-events.md` ✅ 작성 완료
2. **작업 범위 문서**: `claudedocs/01-feature-design-recurring-events.md` (현재 문서)

---

## 프로젝트 분석 결과

### 기존 구조 파악

#### 1. 타입 정의 (src/types.ts)
```typescript
// ✅ 이미 정의되어 있음 (변경 불필요)
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string;  // 서버가 생성하는 시리즈 ID
}
```

**분석 결과**: 타입 정의는 이미 완료되어 있으며 수정 불필요

#### 2. UI 컴포넌트 (src/App.tsx)
```typescript
// 🔴 주석 처리되어 있음 (활성화 필요)
// 위치: App.tsx:441-478

{isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select ... >
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>
    {/* ... 반복 간격, 종료일 입력 필드 ... */}
  </Stack>
)}
```

**분석 결과**: UI는 이미 구현되어 있으며 주석만 해제하면 됨

#### 3. 서버 API (server.js)
```javascript
// ✅ 이미 구현되어 있음 (변경 불필요)

// POST /api/events-list: 반복 일정 생성 (76-99줄)
app.post('/api/events-list', async (req, res) => { ... });

// PUT /api/recurring-events/:repeatId: 시리즈 수정 (142-174줄)
app.put('/api/recurring-events/:repeatId', async (req, res) => { ... });

// DELETE /api/recurring-events/:repeatId: 시리즈 삭제 (176-192줄)
app.delete('/api/recurring-events/:repeatId', async (req, res) => { ... });
```

**분석 결과**: 서버 API는 이미 완료되어 있으며 수정 불필요

#### 4. 폼 상태 관리 (src/hooks/useEventForm.ts)
```typescript
// 🔴 주석 처리된 상태 변수 (활성화 필요)
const [repeatType, setRepeatType] = useState<RepeatType>('daily');
const [repeatInterval, setRepeatInterval] = useState(1);
const [repeatEndDate, setRepeatEndDate] = useState('');
```

**분석 결과**: 상태 관리 코드도 이미 작성되어 있으며 주석만 해제하면 됨

---

## 작업 범위

### Phase 1: 명세 작성 ✅ 완료

**산출물**: `specs/09-recurring-events.md`

**포함 내용**:
- 반복 유형별 비즈니스 로직 (Given-When-Then 형식)
- 특수 케이스 처리 (31일, 2월 29일)
- API 명세 (POST /api/events-list)
- 테스트 시나리오 10개
- 구체적 입력/출력 예시

**명세 구조**:
```
09-recurring-events.md
├── 개요
├── 기능 요구사항 (REQ-001 ~ REQ-003)
├── 데이터 모델
├── UI 명세 (UI-001 ~ UI-003)
├── 비즈니스 로직 (BL-001 ~ BL-006)
│   ├── BL-001: 반복 일정 생성 알고리즘
│   ├── BL-002: 매일 반복 (daily)
│   ├── BL-003: 매주 반복 (weekly)
│   ├── BL-004: 매월 반복 (monthly)
│   ├── BL-005: 매년 반복 (yearly)
│   └── BL-006: 일정 겹침 무시
├── API 명세 (API-001 ~ API-003)
├── 특수 케이스 처리 (SC-001 ~ SC-003)
└── 테스트 시나리오 (TS-001 ~ TS-010)
```

### Phase 2: 구현 필요 사항 (Agent 2-5가 수행)

#### 2.1. UI 활성화 (Agent 4)
**파일**: `src/App.tsx`

**작업**:
1. 38줄: import 주석 해제
   ```typescript
   // Before
   // import { Event, EventForm, RepeatType } from './types';

   // After
   import { Event, EventForm, RepeatType } from './types';
   ```

2. 80-84줄: 상태 변수 주석 해제
   ```typescript
   // Before
   // repeatType,
   // setRepeatType,

   // After
   repeatType,
   setRepeatType,
   ```

3. 441-478줄: 반복 설정 UI 주석 해제
   ```tsx
   // Before
   {/* {isRepeating && (
     <Stack spacing={2}>
       ...
     </Stack>
   )} */}

   // After
   {isRepeating && (
     <Stack spacing={2}>
       ...
     </Stack>
   )}
   ```

#### 2.2. 반복 일정 생성 로직 구현 (Agent 4)
**파일**: `src/utils/repeatUtils.ts` (신규 생성)

**필요한 함수**:
1. `generateRecurringDates()`: 반복 날짜 배열 생성
2. `isLeapYear()`: 윤년 판별
3. `isValidMonthlyDate()`: 월별 유효 날짜 확인
4. `getDaysInMonth()`: 월별 일수 계산
5. `addDays()`, `addWeeks()`, `addMonths()`, `addYears()`: 날짜 계산

**예시 시그니처**:
```typescript
export function generateRecurringDates(
  startDate: string,      // "2025-01-06"
  repeatType: RepeatType, // "weekly"
  interval: number,       // 1
  endDate?: string        // "2025-12-31" or undefined
): string[];

export function isLeapYear(year: number): boolean;

export function isValidMonthlyDate(
  year: number,
  month: number,
  day: number
): boolean;
```

#### 2.3. API 호출 로직 수정 (Agent 4)
**파일**: `src/hooks/useEventOperations.ts`

**작업**:
1. `saveEvent()` 함수 수정
   - 반복 일정인 경우 `/api/events-list` 호출
   - 일반 일정인 경우 `/api/events` 호출 (기존 로직 유지)

**예시 로직**:
```typescript
const saveEvent = async (eventData: Event | EventForm) => {
  // 반복 일정인지 확인
  if (eventData.repeat.type !== 'none') {
    // 날짜 배열 생성
    const dates = generateRecurringDates(
      eventData.date,
      eventData.repeat.type,
      eventData.repeat.interval,
      eventData.repeat.endDate
    );

    // 각 날짜별로 일정 객체 생성
    const events = dates.map(date => ({
      ...eventData,
      date
    }));

    // POST /api/events-list 호출
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });

    // ... 응답 처리 ...
  } else {
    // 일반 일정 (기존 로직)
    // POST /api/events 또는 PUT /api/events/:id
  }
};
```

#### 2.4. 겹침 검사 로직 수정 (Agent 4)
**파일**: `src/App.tsx`

**작업**:
- `addOrUpdateEvent()` 함수에서 반복 일정인 경우 겹침 검사 건너뛰기

**예시 로직**:
```typescript
const addOrUpdateEvent = async () => {
  // ... 유효성 검증 ...

  // 반복 일정인 경우 겹침 검사 건너뛰기
  if (isRepeating && repeatType !== 'none') {
    await saveEvent(eventData);
    resetForm();
    return;
  }

  // 일반 일정은 기존대로 겹침 검사
  const overlapping = findOverlappingEvents(eventData, events);
  if (overlapping.length > 0) {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
  } else {
    await saveEvent(eventData);
    resetForm();
  }
};
```

---

## 영향 범위 분석

### 수정이 필요한 파일

| 파일 | 작업 유형 | 영향도 | Agent |
|------|----------|--------|-------|
| `specs/09-recurring-events.md` | ✅ 신규 생성 | 없음 | Agent 1 |
| `src/App.tsx` | 🔵 주석 해제 | 낮음 | Agent 4 |
| `src/hooks/useEventForm.ts` | 🔵 주석 해제 | 낮음 | Agent 4 |
| `src/hooks/useEventOperations.ts` | 🟡 로직 수정 | 중간 | Agent 4 |
| `src/utils/repeatUtils.ts` | ✅ 신규 생성 | 없음 | Agent 4 |

**범례**:
- ✅ 신규 생성: 기존 코드에 영향 없음
- 🔵 주석 해제: 이미 작성된 코드 활성화, 위험도 낮음
- 🟡 로직 수정: 기존 함수 수정, 테스트 필요

### 수정이 불필요한 파일

| 파일 | 이유 |
|------|------|
| `src/types.ts` | 이미 타입 정의 완료 |
| `server.js` | API 엔드포인트 이미 구현됨 |
| `src/utils/dateUtils.ts` | 기존 날짜 유틸리티로 충분 |
| `src/utils/eventOverlap.ts` | 반복 일정은 겹침 검사 안 함 |

### 참조가 필요한 파일

Agent 2-5가 작업 시 참조해야 할 파일:

| Agent | 참조 파일 | 목적 |
|-------|----------|------|
| Agent 2 | `specs/09-recurring-events.md` | 테스트 시나리오 작성 |
| Agent 3 | `src/__tests__/unit/easy.*.spec.ts` | 기존 테스트 패턴 참조 |
| Agent 4 | `src/utils/dateUtils.ts` | 날짜 계산 함수 재사용 |
| Agent 4 | `specs/01-data-models.md` | RepeatInfo 타입 확인 |
| Agent 5 | `src/utils/repeatUtils.ts` | 리팩토링 대상 |

---

## 명세 품질 자체 검증

### Phase 4: 명세 품질 체크리스트

각 항목마다 **3단계 근거**를 서술합니다: 사실 (What) → 평가 (Why) → 대안 (Alternative)

#### 1. ✅ Given-When-Then 패턴 준수

- **근거 (사실)**: BL-002 ~ BL-005 (매일/매주/매월/매년 반복), TS-001 ~ TS-010 (테스트 시나리오 10개) 모두 G-W-T 형식 적용
- **근거 (평가)**: 모든 비즈니스 로직과 테스트 시나리오가 명확히 Given-When-Then 구조로 구분됨
- **근거 (대안)**: 없음 (모든 시나리오가 패턴 준수)

#### 2. ✅ 구체적 입력값/예시 결과값 포함

- **근거 (사실)**: 각 비즈니스 로직(BL-002~BL-005)마다 TypeScript 코드 블록으로 입력/출력 예시 포함
  - BL-002: 매일 반복 2개 예시 (간격 1, 간격 2)
  - BL-003: 매주 반복 2개 예시 (간격 1, 간격 2)
  - BL-004: 매월 반복 3개 예시 (정상, 31일 특수, 간격 3)
  - BL-005: 매년 반복 2개 예시 (정상, 2월 29일 특수)
- **근거 (평가)**: 모든 예시가 입력/출력을 명확한 JSON/배열 형식으로 표현하여 Agent 4가 즉시 구현 가능
- **근거 (대안)**: 없음 (충분히 구체적)

#### 3. ✅ 엣지 케이스 명시

- **근거 (사실)**:
  - SC-001: 매월 31일 반복 (31일 없는 달 처리)
  - SC-002: 매년 2월 29일 반복 (평년 처리)
  - SC-003: 매월 30일 반복 (2월만 건너뛰기)
  - 각 케이스마다 "❌ 하지 말아야 할 것", "✅ 올바른 동작" 명시
- **근거 (평가)**: 특수 케이스 3개 모두 상세히 다루고, 잘못된 구현 방법도 명시하여 혼동 방지
- **근거 (대안)**: 없음 (주요 엣지 케이스 모두 포함)

#### 4. ✅ 테스트 가능 여부

- **근거 (사실)**: 테스트 시나리오 10개 (TS-001 ~ TS-010) 작성
  - TS-001: UI 표시/숨김
  - TS-002 ~ TS-005: 반복 유형별 생성
  - TS-006: 무한 반복
  - TS-007: 겹침 무시
  - TS-008 ~ TS-010: 검증 로직
- **근거 (평가)**: 각 시나리오가 Given-When-Then으로 작성되어 Agent 3이 즉시 테스트 코드로 변환 가능
- **근거 (대안)**: 없음 (모든 요구사항이 테스트 가능)

#### 5. ✅ 명세 범위 준수

- **근거 (사실)**: 요구사항 3개만 구현 (REQ-001: 반복 유형 선택, REQ-002: 반복 간격, REQ-003: 반복 종료일)
- **근거 (평가)**: 사용자 요구사항("반복 유형 선택")만 다루고, 추가 기능 없음
- **근거 (대안)**: 없음 (요구사항 범위 내)

#### 6. ✅ 구현 가능성 확인

- **근거 (사실)**: BL-001에 알고리즘 의사코드 포함, 필요한 함수 5개 정의 (generateRecurringDates, isLeapYear, isValidMonthlyDate, getDaysInMonth, addDays/addWeeks/addMonths/addYears)
- **근거 (평가)**: Agent 4가 의사코드를 보고 즉시 TypeScript로 변환 가능한 수준
- **근거 (대안)**: 없음 (구현 가능)

#### 7. ✅ 예시 충분성

- **근거 (사실)**:
  - 비즈니스 로직마다 2-3개 예시 (총 10개 이상)
  - 특수 케이스마다 전체 연도/월 예시
  - API 명세에 요청/응답 JSON 예시
- **근거 (평가)**: TypeScript 코드 블록, JSON 예시, 주석으로 충분히 설명
- **근거 (대안)**: 없음 (예시 충분)

#### 8. ✅ 명확한 수용 기준

- **근거 (사실)**: 각 테스트 시나리오마다 "Then" 절에 검증 가능한 조건 명시
  - TS-002: "5개의 일정이 생성됨 (1/6, 1/7, 1/8, 1/9, 1/10)"
  - TS-004: "3개의 일정만 생성됨 (1/31, 3/31, 5/31)"
  - TS-005: "2개의 일정만 생성됨 (2024-02-29, 2028-02-29)"
- **근거 (평가)**: 모든 수용 기준이 정량적으로 검증 가능
- **근거 (대안)**: 없음 (명확함)

**검증 결과**: ✅ 8/8 항목 통과

---

## 체크리스트

### 명세 작성 체크리스트

- [x] 요구사항 분석 완료
- [x] 프로젝트 구조 파악 (타입, UI, API)
- [x] 기존 코드 확인 (주석 처리된 부분 확인)
- [x] Given-When-Then 형식 시나리오 작성
- [x] 구체적 입력/출력 예시 포함
- [x] 특수 케이스 명시 (31일, 2월 29일)
- [x] API 명세 작성 (요청/응답 예시)
- [x] 테스트 시나리오 10개 작성
- [x] 명세 품질 자체 검증 (8개 항목)

### UI 범위 준수 체크리스트

- [x] 새로운 컴포넌트 생성 금지 확인
- [x] 기존 주석 처리된 UI 활용 명시
- [x] App.tsx 기존 구조 유지 명시

### 특수 케이스 체크리스트

- [x] 31일 매월 반복 규칙 명세화
- [x] 2월 29일 매년 반복 규칙 명세화
- [x] "건너뛰기" 동작 명확히 정의
- [x] "마지막 날 대체" 금지 명시
- [x] 윤년 판별 규칙 정의

### 일정 겹침 체크리스트

- [x] 반복일정 겹침 무시 규칙 명세화
- [x] addOrUpdateEvent 로직 수정 필요 사항 명시

---

## 다음 단계

### Agent 2 (Test Design Agent)

**입력**: `specs/09-recurring-events.md`

**작업**:
1. 테스트 구조 설계
2. 테스트 데이터 fixtures 생성
3. 테스트 설계 문서 작성 (`claudedocs/02-test-design-recurring-events.md`)
4. Git 커밋 (test: [DESIGN] ...)

**테스트 파일 구조 예상**:
```
src/__tests__/
├── unit/
│   ├── easy.repeatUtils.spec.ts         # 반복 날짜 생성 로직
│   └── easy.dateCalculation.spec.ts     # 윤년, 월말 처리
├── hooks/
│   └── useEventOperations.spec.ts       # API 호출 로직
└── __fixtures__/
    └── mockRecurringEvents.ts           # 반복 일정 테스트 데이터
```

### Agent 3-5 (TDD 사이클)

**반복 작업** (6개 기능):
1. 반복 날짜 생성 로직 (utils/repeatUtils.ts)
2. 윤년 판별 로직
3. 월별 유효 날짜 확인
4. UI 활성화 (App.tsx 주석 해제)
5. API 호출 로직 (useEventOperations.ts)
6. 겹침 검사 건너뛰기 (App.tsx)

**각 기능마다**:
- 🔴 Red (Agent 3): 테스트 작성 → 실패 확인 → 커밋
- 🟢 Green (Agent 4): 최소 구현 → 테스트 통과 → 커밋
- 🔵 Refactor (Agent 5): 코드 개선 → 검증 → 커밋

### Agent 6 (Orchestrator)

**작업**:
1. 전체 진행 상황 모니터링
2. Git 커밋 검증 (21개 커밋 예상)
3. 품질 게이트 검증 (테스트, 린트)
4. 최종 리포트 생성

**예상 커밋 수**:
- 명세: 1개 (docs: ...)
- 설계: 1개 (test: [DESIGN] ...)
- 기능 6개 × 3단계: 18개 (test: [RED], feat: [GREEN], refactor: [REFACTOR])
- 문서: 1개 (docs: ...)
- **총 21개**

---

## 참조

### 명세 문서
- [specs/09-recurring-events.md](../specs/09-recurring-events.md): 반복 일정 기능 명세 (Agent 1 작성)

### 프로젝트 가이드
- [CLAUDE.md](../CLAUDE.md): 프로젝트 구조 및 개발 환경
- [WORKFLOW_RECURRING_EVENTS.md](../WORKFLOW_RECURRING_EVENTS.md): 반복 일정 기능 워크플로우

### 관련 명세
- [specs/01-data-models.md](../specs/01-data-models.md): RepeatInfo 타입 정의
- [specs/02-business-rules.md](../specs/02-business-rules.md): BR-REPEAT 섹션

---

**작성 완료일**: 2025-10-30
**다음 Agent**: Agent 2 (Test Design Agent)
