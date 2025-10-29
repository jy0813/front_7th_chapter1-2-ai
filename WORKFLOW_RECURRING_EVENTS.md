# 반복 일정 기능 구현 워크플로우

**작성일**: 2025-10-28
**방법론**: TDD (Test-Driven Development) + 명세 기반 개발 (SDD)
**구현 방식**: 6개 Agent 시스템 활용
**총 소요 시간**: 8-9시간
**총 커밋 수**: 21개 (명세 1 + 설계 1 + 기능 6×3 + 문서 1)

---

## 📋 목차

1. [개요](#개요)
2. [요구사항](#요구사항)
3. [6개 Agent 시스템](#6개-agent-시스템)
4. [전체 워크플로우](#전체-워크플로우)
5. [실행 가이드](#실행-가이드)
6. [품질 검증](#품질-검증)

---

## 개요

### 목표

반복 일정 기능을 **TDD 사이클**(Red-Green-Refactor)로 구현하고, 각 단계마다 커밋을 생성합니다.

### 핵심 원칙

- ✅ **명세 우선**: 코드보다 명세 문서를 먼저 작성
- ✅ **테스트 주도**: 구현보다 테스트를 먼저 작성
- ✅ **단계별 커밋**: Red-Green-Refactor 각 단계마다 커밋
- ✅ **Agent 시스템**: 역할별로 6개 Agent 활용
- ✅ **품질 검증**: 각 단계마다 테스트 및 린트 실행

---

## 요구사항

### 1. 반복 유형 선택
- 일정 생성/수정 시 반복 유형 선택 가능
- 반복 유형: 매일, 매주, 매월, 매년
- **특수 케이스**:
  - 31일 매월 반복: 31일이 없는 달은 건너뜀 (예: 2월, 4월)
  - 윤년 2월 29일 매년 반복: 평년은 건너뜀
- 반복 일정은 일정 겹침 검사 제외

### 2. 반복 일정 표시
- 캘린더 뷰에서 `Repeat` 아이콘으로 구분 표시

### 3. 반복 종료
- 반복 종료 조건: 특정 날짜까지
- 최대 종료일: 2025-12-31

### 4. 반복 일정 수정
- **단일 수정** (예): 해당 일정만 수정, 반복 아이콘 사라짐
- **전체 수정** (아니오): 모든 반복 일정 수정, 아이콘 유지

### 5. 반복 일정 삭제
- **단일 삭제** (예): 해당 일정만 삭제
- **전체 삭제** (아니오): 모든 반복 일정 삭제

---

## 6개 Agent 시스템

> **참고 자료**:
> - [Claude Code 서브에이전트 공식 문서](https://docs.anthropic.com/ko/docs/claude-code/sub-agents)
> - [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD/tree/main) - 더 세분화된 Agent 구성 참고

### Agent 1: 기능 설계 Agent (Feature Design Agent)
**Persona**: Scribe + Analyzer + Architect

**핵심 역할**:
- **프로젝트 분석 후 작업 범위 정리** (가장 중요!)
- 요구사항 분석 및 명세 문서 작성
- specs/ 디렉토리 업데이트
- Given-When-Then 시나리오 작성

**도구**: Read, Write, Edit, Grep

**출력물**:
- `specs/02-business-rules.md` 업데이트 - Agent 2, 3, 4, 5가 참조
- `specs/08-test-scenarios.md` 업데이트
- `specs/09-recurring-events.md` 신규 생성 (마크다운 형식)
- `claudedocs/01-feature-design-recurring-events.md` - 작업 범위 정리

**품질 검증 8개 항목** (v2.8.0):
1. ✅ Given-When-Then 패턴 준수
2. ✅ 구체적 입력값/예시 결과값 포함
3. ✅ 엣지 케이스 명시
4. ✅ 테스트 가능한 수준의 상세도
5. ✅ 명세 범위 준수 (과도한 기능 추가 금지)
6. ✅ 구현 가능성 확인
7. ✅ 예시 충분성
8. ✅ 명확한 수용 기준

**⚠️ 중요한 TIP**:

✅ **반드시 프로젝트 분석 후 작업 범위를 정리하세요**
- 입력받은 기능이 영향을 미칠 수 있는 부분에 대해 질문을 먼저 만들어보세요
- 답변을 받은 다음 해당 내용을 문서로 만드세요
- 다른 에이전트들이 이 내용을 참고하도록 하세요

✅ **명세를 구체화하는 정도로 진행하세요**
- 새로운 기능이 자유롭게 추가되지 않도록 주의하세요
- 불필요한 기능이 추가되면 제거해야 하며 수정 범위가 너무 넓어집니다

✅ **체크리스트를 활용하세요**
- 구현해야 할 기능 목록을 체크리스트로 작성
- 각 기능의 완료 조건을 명확히 정의

✅ **구체적인 입력값과 예시 결과값을 함께 제공하세요**
- 추상적인 설명보다 실제 데이터 예시를 포함
- 엣지 케이스에 대한 구체적인 예시 제공

✅ **문서는 마크다운으로 작성하고 계층화하세요**
- 명세 문서는 다른 Agent들이 참고할 수 있도록 구조화
- 문서 계층이 명확할수록 이해하기 쉽습니다

✅ **생성된 문서는 꼭 다시 확인하세요!**
- 누락되거나 잘못된 부분은 직접 반영
- 반복된다면 이 내용도 함께 챙기도록 강조

**실행 명령**:
```
"Agent 1 (기능 설계 Agent) 역할을 수행해줘.

[1단계] 프로젝트 분석 및 작업 범위 정리:
1. 기존 프로젝트 구조 분석 (src/, specs/, rules/ 디렉토리)
2. 반복 일정 기능이 영향을 미칠 수 있는 부분 파악
   - 기존 일정 생성 로직 (App.tsx, useEventForm.ts)
   - 서버 API (server.js의 /api/recurring-events 엔드포인트)
   - 일정 표시 UI (캘린더 뷰, 일정 목록)
3. 작업 범위를 문서로 정리 (영향 범위, 수정 필요 파일 목록)

[2단계] 명세 문서 작성:
1. specs/02-business-rules.md 업데이트
   - 반복 일정 비즈니스 로직 추가
   - 31일 매월 반복 특수 케이스
   - 윤년 2월 29일 매년 반복 특수 케이스
   - 구체적인 입력값과 예시 결과값 포함

2. specs/08-test-scenarios.md 업데이트
   - 반복 일정 테스트 시나리오 추가
   - Given-When-Then 형식으로 작성

3. specs/09-recurring-events.md 신규 생성
   - 반복 일정 전용 명세 (마크다운 형식)
   - 체크리스트 포함
   - 계층화된 구조

[주의사항]:
- 명세에 새로운 기능을 자유롭게 추가하지 마세요
- 요구사항에 명시된 기능만 구체화하세요
- 문서는 다른 Agent들이 참고할 수 있도록 작성하세요

완료 후 커밋: docs: 반복 일정 명세 문서 작성 및 작업 범위 정리"
```

---

### Agent 2: 테스트 설계 Agent (Test Design Agent)
**Persona**: QA + Architect + TDD 전문가

**핵심 역할**:
- **명세 기반 테스트 설계** (TDD의 일환)
- 테스트 구조 설계 (단위/훅/통합)
- 테스트 케이스가 채워진 테스트 파일 생성
- 테스트 데이터 준비

**도구**: Read, Write, Grep

**출력물**:
- `claudedocs/02-test-design-recurring-events.md` - 테스트 구조 설계 (Agent 3이 참조)
- 테스트 케이스가 채워진 테스트 파일 (또는 기존 파일에 추가)
- `src/__tests__/__fixtures__/mockRecurringEvents.ts`
- Git 커밋 (test: [DESIGN] ...) - Agent 6이 검증

**명세 품질 검증 5개 항목** (v2.8.0):
1. ✅ Given-When-Then 패턴 준수
2. ✅ 구체적 예시 포함
3. ✅ 엣지 케이스 명시
4. ✅ 테스트 가능 여부
5. ✅ 명세 범위 준수
→ 불완전 시 Agent 1에게 피드백

**⚠️ 중요한 TIP**:

✅ **기존 테스트 작성 방식을 참고하세요**
- `src/__tests__/unit/easy.*.spec.ts` 기존 패턴 확인
- `setupTests.ts` 같은 공통 설정이 있다면 중복 구성하지 마세요
- 기존 테스트 유틸리티 함수 재활용

✅ **테스트 설계는 TDD의 일환입니다**
- 구현 관점에서의 테스트를 지향하세요
- **테스트 명세의 설명은 최대한 구체적으로 작성하세요**
- "동작한다" ❌ → "31일 매월 반복은 31일이 없는 달을 건너뛴다" ✅

✅ **명세화된 문서를 참고하세요**
- `specs/09-recurring-events.md` 명세 문서
- `rules/tdd-principles.md` TDD 원칙
- `rules/testing-library-queries.md` 쿼리 우선순위

✅ **명세의 범위를 벗어나지 마세요**
- 테스트 케이스만 작성하세요 (구현 코드 작성 금지)
- 과한 수정을 경계하세요
- 명세에 없는 기능은 테스트하지 마세요

✅ **테스트 명세 작성법을 문서화하세요**
- 켄트 벡(Kent Beck)의 테스트 작성법 참고
- "잘 작성하는 테스트는 무엇인지?" 정리
- "우리가 무엇을 조심하면서 테스트를 작성하려 했는지" 문서화

**실행 명령**:
```
"Agent 2 (테스트 설계 Agent) 역할을 수행해줘.

[1단계] 명세 및 규칙 확인:
1. specs/09-recurring-events.md 읽기 (반복 일정 명세)
2. rules/tdd-principles.md 읽기 (TDD 원칙)
3. rules/testing-library-queries.md 읽기 (쿼리 우선순위)
4. 기존 테스트 파일 패턴 확인 (src/__tests__/unit/easy.*.spec.ts)

[2단계] 테스트 구조 설계:
1. 단위 테스트 구조 설계
   - easy.repeatUtils.spec.ts (반복 생성 로직)
   - 각 함수별 테스트 케이스 나열

2. 훅 테스트 구조 설계
   - medium.useRecurringEvents.spec.ts
   - API 호출 및 상태 관리 테스트

[3단계] 테스트 데이터 준비:
1. src/__tests__/__fixtures__/mockRecurringEvents.ts 생성
   - 31일 매월 반복 케이스
   - 윤년 2월 29일 케이스
   - 일반 반복 케이스

[4단계] 테스트 케이스 작성:
- 구체적인 테스트 설명 작성
- Given-When-Then 패턴 적용
- setupTests.ts 공통 설정 활용

[주의사항]:
- 테스트 케이스만 작성하세요 (구현 코드 작성 금지!)
- 명세의 범위를 벗어나지 마세요
- 기존 테스트 패턴을 따르세요

이 Agent의 결과물은 '테스트 케이스'가 채워진 '테스트 파일'입니다."
```

---

### Agent 3: Red Phase Agent (테스트 코드 작성 Agent)
**Persona**: QA + TDD 전문가

**핵심 역할**:
- **실패하는 테스트 코드 작성** (TDD Red Phase)
- 테스트 실행 및 실패 확인
- Red 커밋 생성

**도구**: Write, Bash (pnpm test, git commit)

**출력물**:
- 테스트 파일 생성 (또는 기존 파일에 추가)
- 테스트 실패 확인 로그
- Git 커밋 (test: [RED] ...) - Agent 6이 검증

**⚠️ 필수 준수 규칙 (Testing Rules)** (v2.8.0):
- **rules/tdd-principles.md**: TDD 원칙 및 안티패턴 (필수 읽기)
- **rules/testing-library-queries.md**: Testing Library 쿼리 우선순위 (필수 준수)
- **rules/react-testing-library-best-practices.md**: RTL 베스트 프랙티스 (필수 준수)

**우선 참조 순서** (v2.8.0):
1. **🥇 claudedocs/02-test-design-recurring-events.md** (Agent 2가 설계한 테스트 시나리오)
2. **🥈 specs/09-recurring-events.md** (명세 문서)

**⚠️ 중요한 TIP**:

✅ **Kent Beck의 테스트 작성 방법론을 참고하세요**
- "잘 작성하는 테스트는 무엇인지?" 정리
- "우리가 무엇을 조심하면서 테스트를 작성하려 했는지" 문서화
- 테스트는 독립적이고, 반복 가능하고, 빠르게 실행되어야 합니다

✅ **기존 테스트 유틸리티를 활용하세요**
- `src/__tests__/setupTests.ts` 공통 설정 활용
- `src/__tests__/__mocks__/handlers.ts` MSW 핸들러 재사용
- 기존 테스트 헬퍼 함수가 있다면 중복 작성하지 마세요

✅ **테스트 명세는 구체적으로 작성하세요**
- "동작한다" ❌ → "31일 매월 반복은 31일이 없는 달을 건너뛴다" ✅
- Given-When-Then 패턴 명확히 작성
- 실패 메시지가 명확하도록 expect 문구 작성

✅ **테스트 작성 방법론을 문서화하세요**
- 어떤 원칙으로 테스트를 작성했는지 기록
- 다른 개발자가 참고할 수 있도록 패턴 정리
- rules/tdd-principles.md 내용 준수

**실행 명령 (기능 1 예시)**:
```
"Agent 3 (Red Phase / 테스트 코드 작성 Agent) 역할을 수행해줘.

[1단계] 테스트 작성 방법론 확인:
1. rules/tdd-principles.md 읽기 (TDD 원칙)
2. 기존 테스트 패턴 확인 (src/__tests__/unit/easy.*.spec.ts)
3. Kent Beck의 테스트 작성 원칙 적용

[2단계] 테스트 코드 작성:
1. src/__tests__/unit/easy.repeatUtils.spec.ts 생성
2. generateDailyEvents, generateWeeklyEvents, generateMonthlyEvents, generateYearlyEvents 테스트 작성
3. 31일 매월 반복과 윤년 케이스 포함
4. Given-When-Then 패턴으로 구체적인 테스트 명세 작성

[3단계] 테스트 실행 및 실패 확인:
1. pnpm test 실행
2. 의도한 대로 실패하는지 확인
3. 실패 메시지가 명확한지 검증

[4단계] 커밋:
git add src/__tests__/unit/easy.repeatUtils.spec.ts
git commit -m 'test: [RED] 반복 일정 생성 로직 테스트 작성'

[주의사항]:
- 기존 테스트 유틸리티를 재사용하세요
- 테스트 작성 방법론을 준수하세요
- 실패 메시지가 명확하도록 작성하세요"
```

---

### Agent 4: Green Phase Agent (코드 작성 Agent)
**Persona**: Frontend/Backend Developer

**핵심 역할**:
- **테스트를 통과하는 최소 구현 작성** (TDD Green Phase)
- 테스트 실행 및 성공 확인
- Green 커밋 생성

**최소 구현 원칙** (v2.7.0):
- **YAGNI (You Aren't Gonna Need It)**: 테스트에 명시되지 않은 기능은 구현하지 않음
- **단순성 우선 (Simplicity First)**: 가장 단순한 방법으로 테스트를 통과시킴
- **Fake it till you make it**: 하드코딩도 허용, Refactor Phase에서 일반화

**판단 기준**:
1. ✅ 이 코드가 테스트를 통과하는가?
2. ✅ 더 단순한 방법은 없는가?
3. ✅ 테스트에 없는 기능을 구현했는가? (NO여야 함)

**도구**: Write, Edit, Read, Bash, MCP (Context7)

**출력물**:
- 구현 파일 생성/수정
- 테스트 성공 확인 로그
- 코드 설명 문서 (작성 후)
- Git 커밋 (Green Phase)

**⚠️ 중요한 TIP**:

✅ **API 사용법을 명확히 하세요**
- 서버 API 엔드포인트 사용 시 `specs/04-api-specification.md` 참고
- 기존 API 호출 패턴 확인 (`src/hooks/useEventOperations.ts`)
- 새로운 API를 추가할 경우 명세 문서에 먼저 정의

✅ **프로젝트 구조를 정확히 파악하세요**
- 기존 코드 패턴 분석 (utils, hooks, components 구조)
- TypeScript 타입 정의 확인 (`src/types.ts`)
- import 경로 및 모듈 구조 준수

✅ **절대 테스트 코드를 수정하지 마세요**
- 테스트가 실패하면 구현 코드를 수정해야 합니다
- 테스트 명세가 잘못되었다면 Red Phase Agent에게 피드백
- Green Phase에서는 오직 구현 코드만 작성

✅ **MCP 도구를 적극 활용하세요**
- Context7: 라이브러리 문서 참고 (Material-UI, React 등)
- Sequential: 복잡한 로직 분석 시 사용
- 공식 문서 기반으로 최신 API 사용법 확인

✅ **코드 작성 후 설명을 제공하세요**
- 구현한 함수의 역할과 알고리즘 설명
- 특수 케이스 처리 로직 설명 (31일 매월 반복, 윤년 등)
- 다른 개발자가 이해할 수 있도록 JSDoc 주석 추가

**실행 명령 (기능 1 예시)**:
```
"Agent 4 (Green Phase / 코드 작성 Agent) 역할을 수행해줘.

[1단계] 프로젝트 구조 파악:
1. src/types.ts 읽기 (Event, RepeatInfo 타입 확인)
2. src/utils/dateUtils.ts 읽기 (기존 날짜 유틸 함수 확인)
3. 기존 코드 패턴 분석 (함수 네이밍, 타입 정의 방식)

[2단계] API 명세 확인:
1. specs/04-api-specification.md 읽기 (서버 API 엔드포인트)
2. specs/09-recurring-events.md 읽기 (반복 로직 명세)

[3단계] 최소 구현 작성 (YAGNI 원칙 적용):
1. src/utils/repeatUtils.ts 생성
2. 테스트에서 요구하는 함수만 구현:
   - generateRecurringEvents (메인 함수)
   - generateDailyEvents (매일 반복)
   - generateWeeklyEvents (매주 반복)
   - generateMonthlyEvents (매월 반복, 31일 케이스 처리)
   - generateYearlyEvents (매년 반복, 윤년 케이스 처리)
   - isLeapYear (윤년 판단 헬퍼)
3. 단순성 우선: 하드코딩도 OK (예: 특정 케이스만 우선 구현)
4. 테스트가 통과하면 충분! Refactor에서 개선

[4단계] 테스트 실행 및 성공 확인:
1. pnpm test 실행
2. 모든 테스트 통과 확인
3. 실패 시 구현 코드 수정 (테스트는 수정 금지!)

[5단계] 코드 설명 제공:
1. 각 함수의 역할 설명
2. 31일 매월 반복 처리 로직 설명
3. 윤년 2월 29일 처리 로직 설명

[6단계] 커밋:
git add src/utils/repeatUtils.ts
git commit -m 'feat: [GREEN] 반복 일정 생성 로직 최소 구현'

[주의사항]:
- 테스트 코드는 절대 수정하지 마세요!
- 프로젝트 구조와 패턴을 준수하세요
- MCP Context7로 최신 API 확인하세요
- 코드 작성 후 반드시 설명을 제공하세요"
```

---

### Agent 5: Refactor Agent (리팩토링 Agent)
**Persona**: Refactorer + Performance

**핵심 역할**:
- **코드 품질 개선** (TDD Refactor Phase)
- 중복 제거 및 가독성 향상
- 타입 안전성 강화

**도구**: Read, Edit, Bash

**출력물**:
- 개선된 코드 (src/utils/ 또는 src/hooks/) - Agent 6이 검증
- 테스트 통과 확인 로그
- 린트 검증 로그
- Git 커밋 (refactor: [REFACTOR] ...) - Agent 6이 검증

**⚠️ 리팩토링 범위 제한** (v2.8.0):
- ⚠️ **현재 파일만 수정** (절대 규칙)
- ❌ 다른 파일 수정 절대 금지
- 이유: 과도한 수정은 디버깅을 어렵게 만들고 TDD 사이클 위반

**⚠️ 중요한 TIP**:

✅ **리팩토링 범위를 제한하세요**
- "이 기능에 필요한 최소한의 개선"에 집중
- 현재 기능 구현 파일만 리팩토링 (다른 파일 수정 금지)
- 과도한 수정은 디버깅을 어렵게 만듭니다

✅ **반드시 테스트 통과를 확인하세요**
- 리팩토링 후 `pnpm test` 실행
- 모든 테스트가 여전히 통과해야 합니다
- 테스트 실패 시 리팩토링 전으로 되돌리고 다시 시도

✅ **린트 검증도 필수입니다**
- `pnpm lint` 실행하여 코드 스타일 검증
- `pnpm lint:tsc` 실행하여 TypeScript 타입 검증
- ESLint 경고도 가능한 한 제거

✅ **개선 사항을 명확히 하세요**
- 어떤 부분을 어떻게 개선했는지 설명
- 중복 제거, 성능 개선, 가독성 향상 등 구체적으로 기록
- JSDoc 주석으로 함수 역할 명확히 문서화

**실행 명령 (기능 1 예시)**:
```
"Agent 5 (Refactor / 리팩토링 Agent) 역할을 수행해줘.

[1단계] 현재 구현 파일 분석:
1. src/utils/repeatUtils.ts 읽기
2. 중복 코드 패턴 파악
3. 개선 가능한 부분 식별

[2단계] 리팩토링 수행 (제한된 범위):
1. 중복 코드 제거
   - 반복되는 날짜 계산 로직을 헬퍼 함수로 추출
2. TypeScript 타입 정의 추가
   - 함수 파라미터 및 반환 타입 명확히 정의
3. JSDoc 주석 추가
   - 각 함수의 역할, 파라미터, 반환값 설명
4. 가독성 개선
   - 변수명 명확히 하기
   - 복잡한 로직에 주석 추가

[3단계] 테스트 및 린트 검증:
1. pnpm test 실행 → 모든 테스트 통과 확인
2. pnpm lint 실행 → ESLint 통과 확인
3. pnpm lint:tsc 실행 → TypeScript 컴파일 확인

[4단계] 커밋:
git add src/utils/repeatUtils.ts
git commit -m 'refactor: [REFACTOR] 반복 일정 생성 로직 개선'

[주의사항]:
- 현재 파일만 리팩토링하세요 (다른 파일 수정 금지!)
- 반드시 테스트가 통과해야 합니다
- 린트 검증도 필수입니다
- 개선 사항을 명확히 설명하세요"
```

---

### Agent 6: Orchestrator Agent (전체 오케스트레이션 Agent)
**Persona**: Architect + DevOps

**핵심 역할**:
- **전체 워크플로우 조율 및 품질 관리**
- Agent 1-5 순차 실행 관리
- 코드 리뷰 및 품질 검증
- 문서 업데이트
- 최종 리포트 생성

**도구**: TodoWrite, Task, Bash, Read, Write

**출력물**:
- claudedocs/06-orchestrator-progress-recurring-events.md - 전체 진행 상황
- claudedocs/06-orchestrator-quality-recurring-events.md - 품질 검증 리포트
- claudedocs/06-orchestrator-tdd-recurring-events.md - TDD 사이클 검증
- claudedocs/06-orchestrator-final-recurring-events.md - 최종 워크플로우 리포트

**⚠️ 커밋 검증 및 강제** (v2.8.0):
- 각 Agent 작업 완료 시 Git 커밋 확인
  - Agent 2: `test: [DESIGN]`
  - Agent 3: `test: [RED]`
  - Agent 4: `feat: [GREEN]`
  - Agent 5: `refactor: [REFACTOR]`
- 커밋 누락 시 즉시 지적하고 재실행 요청
- 커밋 메시지 패턴 검증

**⚠️ 에러 처리 메커니즘** (v2.8.0):
1. **Agent 실행 실패** → 최대 2회 재시도
2. **품질 검증 실패** → 해당 Agent 재실행
3. **커밋 누락/Git 에러** → 즉시 수정 요청
4. **TDD 사이클 위반** → 즉시 지적 및 재작업

**⚠️ 중요한 TIP**:

✅ **각 Agent가 git 커밋을 반드시 하도록 강제하세요**
- Agent 2 → 테스트 설계 커밋 필수 (`test: [DESIGN]`)
- Agent 3 → 테스트 파일 커밋 필수 (`test: [RED]`)
- Agent 4 → 구현 파일 커밋 필수 (`feat: [GREEN]`)
- Agent 5 → 개선된 파일 커밋 필수 (`refactor: [REFACTOR]`)
- **커밋 누락 시 `git reset` 또는 `git revert`를 활용하여 이전 단계로 되돌리세요**

✅ **Git 되돌리기 활용법**
- Agent가 커밋을 깜빡한 경우 즉시 지적
- `git reset --soft HEAD~1` 로 마지막 커밋을 취소한 후 수정하고 재커밋
- 또는 `git revert <commit-hash>` 로 특정 커밋을 되돌리기
- 커밋 메시지 컨벤션 준수 확인

✅ **품질 검증 체크리스트**
- 모든 테스트 통과 (`pnpm test`)
- 테스트 커버리지 85% 이상 (`pnpm test:coverage`)
- ESLint 검증 통과 (`pnpm lint`)
- TypeScript 컴파일 성공 (`pnpm lint:tsc`)
- 명세 문서 동기화 확인

✅ **TDD 사이클 검증**
- 각 기능별 Red-Green-Refactor 커밋 3개 확인
- 총 20개 커밋 생성 확인 (6기능 × 3 + 명세 + 통합테스트)
- 커밋 메시지가 규칙을 따르는지 검증

✅ **최종 품질 검증**
- 품질 게이트 통과 확인 (test, coverage, lint, tsc)
- 문서 업데이트 (CLAUDE.md, README.md)
- 최종 리포트 생성

**실행 명령**:
```
"Agent 6 (Orchestrator / 전체 오케스트레이션 Agent) 역할을 수행해줘.

[1단계] 전체 워크플로우 진행 상황 확인:
1. TodoWrite로 작업 목록 확인
2. 각 Agent가 커밋을 올바르게 생성했는지 확인
3. git log로 커밋 히스토리 검증

[2단계] 커밋 누락 확인 및 강제:
1. Red-Green-Refactor 각 단계별 커밋 확인
2. 커밋이 누락된 경우 해당 Agent에게 재실행 요청
3. 필요 시 `git reset --soft HEAD~1` 또는 `git revert` 로 이전 단계로 되돌리기

[3단계] 품질 검증:
1. pnpm test → 모든 테스트 통과
2. pnpm test:coverage → 커버리지 85% 이상 확인
3. pnpm lint → ESLint 통과
4. pnpm lint:tsc → TypeScript 컴파일 성공

[4단계] 문서 업데이트:
1. CLAUDE.md 업데이트 (반복 일정 기능 설명 추가)
2. README.md 업데이트 (기능 목록 업데이트)
3. 커밋: docs: 반복 일정 기능 문서 업데이트

[5단계] 최종 리포트 생성:
1. 총 커밋 수: 21개 (명세 + 설계 + 기능 6×3 + 문서)
2. 테스트 커버리지: 85%+
3. TDD 사이클 준수 여부
4. 품질 검증 결과

[주의사항]:
- 각 Agent가 반드시 커밋하도록 강제하세요!
- 커밋 누락 시 `git reset` 또는 `git revert`를 활용하세요
- 품질 검증 체크리스트를 모두 통과해야 합니다
- TDD 사이클이 올바르게 지켜졌는지 검증하세요"
```

---

## 전체 워크플로우

### Phase 0: 준비 단계 (10분)

**TodoWrite 작업 목록**:
- [ ] 명세 작성
- [ ] 테스트 설계
- [ ] 기능 1-6 구현 (각 R-G-R)
- [ ] 문서 업데이트

---

### Phase 1: 명세 작성 (30분)
**Agent**: Specification Agent

**작업**:
1. Read `specs/02-business-rules.md`
2. Edit `specs/02-business-rules.md` (반복 로직 추가)
3. Edit `specs/08-test-scenarios.md` (테스트 시나리오 추가)
4. Write `specs/09-recurring-events.md` (신규 명세)

**커밋**:
```bash
git add specs/
git commit -m "docs: 반복 일정 명세 문서 작성"
```

---

### Phase 2: 테스트 설계 (30분)
**Agent**: Test Architect Agent

**작업**:
1. Read `specs/09-recurring-events.md`
2. Design 테스트 구조
3. Write `src/__tests__/__fixtures__/mockRecurringEvents.ts`
4. Write 테스트 구조 파일 (describe/it 블록)

**커밋**:
```bash
git add src/__tests__/__fixtures__/
git add src/__tests__/unit/easy.*.spec.ts
git commit -m "test: [DESIGN] 반복 일정 테스트 구조 설계

- mockRecurringEvents fixtures 생성
- 테스트 케이스 구조 정의
- describe/it 블록 구조화"
```

---

### Phase 3-8: 기능 구현 (6시간)

각 기능별로 Red-Green-Refactor 사이클 반복 (1시간/기능)

#### 기능 1: 반복 일정 생성 로직 (1시간)

**🔴 Red Phase (20분)** - Agent 3
```bash
# 테스트 작성
src/__tests__/unit/easy.repeatUtils.spec.ts

# 테스트 실행 (실패 확인)
pnpm test

# 커밋
git add src/__tests__/unit/easy.repeatUtils.spec.ts
git commit -m "test: [RED] 반복 일정 생성 로직 테스트 작성"
```

**🟢 Green Phase (30분)** - Agent 4
```bash
# 최소 구현
src/utils/repeatUtils.ts

# 테스트 실행 (성공 확인)
pnpm test

# 커밋
git add src/utils/repeatUtils.ts
git commit -m "feat: [GREEN] 반복 일정 생성 로직 최소 구현"
```

**🔵 Refactor Phase (10분)** - Agent 5
```bash
# 코드 개선
src/utils/repeatUtils.ts

# 테스트 및 린트 (여전히 통과)
pnpm test
pnpm lint

# 커밋
git add src/utils/repeatUtils.ts
git commit -m "refactor: [REFACTOR] 반복 일정 생성 로직 개선"
```

---

#### 기능 2: 반복 일정 UI 입력 (1시간)

**파일**: `src/App.tsx` (441-478줄 주석 해제), `src/hooks/useEventForm.ts`

**Red → Green → Refactor** 동일 패턴

**커밋**:
```
test: [RED] 반복 UI 입력 테스트 작성
feat: [GREEN] 반복 UI 입력 최소 구현
refactor: [REFACTOR] 반복 UI 입력 개선
```

---

#### 기능 3: 반복 아이콘 표시 (1시간)

**파일**: `src/App.tsx` (Repeat 아이콘 추가)

**커밋**:
```
test: [RED] 반복 아이콘 표시 테스트 작성
feat: [GREEN] 반복 아이콘 표시 최소 구현
refactor: [REFACTOR] 반복 아이콘 표시 개선
```

---

#### 기능 4: 반복 수정 모달 (1시간)

**파일**: `src/components/RecurringEditDialog.tsx` (신규), `src/App.tsx`, `src/hooks/useEventOperations.ts`

**커밋**:
```
test: [RED] 반복 수정 모달 테스트 작성
feat: [GREEN] 반복 수정 모달 최소 구현
refactor: [REFACTOR] 반복 수정 모달 개선
```

---

#### 기능 5: 반복 삭제 모달 (1시간)

**파일**: `src/components/RecurringDeleteDialog.tsx` (신규), `src/App.tsx`, `src/hooks/useEventOperations.ts`

**커밋**:
```
test: [RED] 반복 삭제 모달 테스트 작성
feat: [GREEN] 반복 삭제 모달 최소 구현
refactor: [REFACTOR] 반복 삭제 모달 개선
```

---

#### 기능 6: API 통합 (1시간)

**파일**: `src/hooks/useEventOperations.ts`, `src/App.tsx`

**커밋**:
```
test: [RED] 반복 API 통합 테스트 작성
feat: [GREEN] 반복 API 통합 최소 구현
refactor: [REFACTOR] 반복 API 통합 개선
```

---

### Phase 9: 문서 업데이트 (20분)
**Agent**: Orchestrator Agent

```bash
# 문서 업데이트
edit CLAUDE.md
edit README.md

# 커밋
git add CLAUDE.md README.md
git commit -m "docs: 반복 일정 기능 문서 업데이트"
```

---

## 실행 가이드

### 1. 준비
```bash
cd /Users/jaeyun/Documents/Personal/front_7th_chapter1-2
```

### 2. Agent 순차 실행

#### Agent 1: 명세 작성
```
Claude Code에 요청:
"Agent 1 (Specification Agent) 역할을 수행해줘.
specs/02-business-rules.md에 반복 일정 로직을 추가하고,
specs/09-recurring-events.md를 신규 생성해줘."
```

#### Agent 2: 테스트 설계
```
"Agent 2 (Test Architect Agent) 역할을 수행해줘.
테스트 구조를 설계하고 mockRecurringEvents.ts를 생성해줘."
```

#### Agent 3-5: 기능 1 구현 (Red-Green-Refactor)
```
# Red
"Agent 3: easy.repeatUtils.spec.ts 테스트 작성"

# Green
"Agent 4: src/utils/repeatUtils.ts 최소 구현"

# Refactor
"Agent 5: src/utils/repeatUtils.ts 코드 개선"
```

#### 기능 2-6 반복...

#### Agent 6: 최종 통합
```
"Agent 6 (Orchestrator) 역할을 수행해줘.
품질 검증, 문서 업데이트, 최종 리포트 생성까지 완료해줘."
```

---

## 품질 검증

### 각 커밋 전 필수 검증

#### Red Phase
```bash
pnpm test  # 실패 확인 필수
```

#### Green Phase
```bash
pnpm test  # 성공 확인 필수
```

#### Refactor Phase
```bash
pnpm test      # 여전히 성공
pnpm lint      # ESLint 통과
pnpm lint:tsc  # TypeScript 컴파일 확인
```

---

### 최종 품질 지표

✅ **테스트**:
- 모든 테스트 통과
- 테스트 커버리지 85%+

✅ **코드 품질**:
- ESLint 통과
- TypeScript 컴파일 성공
- 명세 문서 동기화

✅ **TDD 준수**:
- 21개 커밋 생성 (명세 + 설계 + 기능×18 + 문서)
- Red-Green-Refactor 사이클 준수
- 각 단계마다 검증

✅ **기능 완성도**:
- 매일/매주/매월/매년 반복 생성
- 31일 매월 반복 특수 케이스 처리
- 윤년 2월 29일 매년 반복 처리
- 단일/전체 수정 모달
- 단일/전체 삭제 모달

---

## 최종 체크리스트

### Phase 0: 준비
- [ ] TodoWrite로 작업 목록 생성

### Phase 1-2: 명세 및 설계
- [ ] 명세 문서 작성 (Agent 1)
- [ ] 테스트 구조 설계 (Agent 2)

### Phase 3-8: 기능 구현
- [ ] 기능 1: 생성 로직 (R-G-R)
- [ ] 기능 2: UI 입력 (R-G-R)
- [ ] 기능 3: 아이콘 표시 (R-G-R)
- [ ] 기능 4: 수정 모달 (R-G-R)
- [ ] 기능 5: 삭제 모달 (R-G-R)
- [ ] 기능 6: API 통합 (R-G-R)

### Phase 9: 문서 업데이트
- [ ] 커버리지 검증 (85%+)
- [ ] 문서 업데이트 (CLAUDE.md, README.md)
- [ ] 최종 리포트 생성

---

## 참고 자료

- [CLAUDE.md](./CLAUDE.md): 프로젝트 개발 가이드
- [specs/README.md](./specs/README.md): 명세 문서 개요
- [rules/README.md](./rules/README.md): 테스트 규칙 가이드
- [rules/tdd-principles.md](./rules/tdd-principles.md): TDD 원칙

---

**작성자**: Claude Code (Orchestrator Agent)
**워크플로우 버전**: 1.0.0
