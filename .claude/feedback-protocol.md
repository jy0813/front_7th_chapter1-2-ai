# Agent 간 피드백 프로토콜

**버전**: 1.1.0
**최종 업데이트**: 2025-10-31
**v2.8.0 자동화 개선의 일환**

---

## 📋 개요

6 Agent 시스템에서 품질을 보장하기 위해 Agent 간 피드백 채널을 구축합니다.

**핵심 피드백 루프**:
- **Agent 2 → Agent 1**: 명세 품질 검증 및 피드백
- **Agent 6 → Agent 3, 4, 5**: 커밋 누락 및 품질 문제 피드백

---

## 🔄 피드백 채널 1: Agent 2 → Agent 1

### 목적
Agent 2가 명세 품질을 검증하고, 불완전한 경우 Agent 1에게 구체적 피드백 제공

### 트리거 조건
Agent 2의 Phase 1.5 (명세 품질 검증) 중 5개 항목 중 1개 이상 실패

### 피드백 형식

```markdown
# Agent 2 → Agent 1 피드백

**일시**: [YYYY-MM-DD HH:MM:SS]
**기능**: [기능명]

## 검증 결과: ❌ 불완전

### 실패 항목

#### 1. ❌ [검증 항목명]
- **근거 (사실)**: [현재 명세 상태]
- **근거 (평가)**: [부족한 부분]
- **근거 (대안)**: [개선 필요 사항]

**요청사항**: [구체적으로 무엇을 추가/수정해야 하는지]

---

## Agent 1 조치 필요

- [ ] [첫 번째 개선 사항]
- [ ] [두 번째 개선 사항]
- [ ] [세 번째 개선 사항]

**예상 재작업 시간**: [30분/1시간/2시간]
**재시도 횟수**: [1/2/3] (최대 3회)
```

### 재시도 메커니즘

1. **1차 피드백**: 구체적 개선 요청
2. **2차 피드백**: 더 상세한 예시 제공
3. **3차 피드백**: 최후 통보 (이후 Agent 6에게 에스컬레이션)

### 예시

```markdown
# Agent 2 → Agent 1 피드백

**일시**: 2025-10-30 14:30:00
**기능**: recurring-events

## 검증 결과: ❌ 불완전

### 실패 항목

#### 1. ❌ 구체적 예시
- **근거 (사실)**: 시나리오 3에 "주간 반복" 기능이 있으나 구체적 입력값 없음
- **근거 (평가)**: Agent 2가 즉시 테스트 데이터를 만들 수 없음
- **근거 (대안)**: 다음 정보 추가 필요
  - 예시 입력: `{ type: 'weekly', interval: 1, daysOfWeek: [0, 3] }`
  - 예시 출력: 생성된 일정 ID 배열

**요청사항**: 시나리오 3에 구체적 입력/출력 예시 추가

#### 2. ❌ 엣지 케이스
- **근거 (사실)**: 월간 반복 시 31일이 없는 달 처리 로직 없음
- **근거 (평가)**: 엣지 케이스 명시 부족
- **근거 (대안)**: 다음 시나리오 추가
  - Given: 31일 설정, When: 2월 반복, Then: 어떻게 처리?

**요청사항**: 31일 엣지 케이스 시나리오 추가

---

## Agent 1 조치 필요

- [ ] 시나리오 3에 예시 입력/출력 추가
- [ ] 31일 엣지 케이스 시나리오 추가
- [ ] specs/09-recurring-events.md 업데이트

**예상 재작업 시간**: 30분
**재시도 횟수**: 1 (최대 3회)
```

---

## 🔄 피드백 채널 2: Agent 6 → Agent 3, 4, 5

### 목적
Agent 6이 커밋 누락, 테스트 실패, 린트 에러 등을 감지하고 해당 Agent에게 재작업 요청

### 트리거 조건
- Git 커밋 누락 감지
- 테스트 실패
- 린트 에러
- TDD 사이클 위반

### 피드백 형식

```markdown
# Agent 6 → Agent [N] 피드백

**일시**: [YYYY-MM-DD HH:MM:SS]
**Agent**: Agent [N]
**Phase**: [RED/GREEN/REFACTOR]

## 문제 감지: [문제 유형]

### 문제 상세
- **감지 내용**: [구체적 문제]
- **예상 원인**: [가능한 원인]
- **영향 범위**: [다른 Agent/단계에 미치는 영향]

### 요구 조치
1. [첫 번째 조치]
2. [두 번째 조치]
3. [검증 방법]

### 자동화 도구
- 사용 가능 스크립트: [스크립트명]
- 실행 명령: `[명령어]`

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림
```

### 예시

```markdown
# Agent 6 → Agent 4 피드백

**일시**: 2025-10-30 15:00:00
**Agent**: Agent 4 (Green Phase)
**Phase**: GREEN

## 문제 감지: 커밋 누락

### 문제 상세
- **감지 내용**: Agent 4 작업 완료 후 Git 커밋이 생성되지 않음
- **예상 원인**: 커밋 명령 누락 또는 에러 발생
- **영향 범위**: Agent 5, 6이 작업 이력을 추적할 수 없음

### 요구 조치
1. 변경사항 확인: `git status`, `git diff`
2. 커밋 생성: `.claude/scripts/commit-helper.sh 4 "시간 검증 유틸 구현"`
3. 커밋 검증: `git log -1 --oneline`

### 자동화 도구
- 사용 가능 스크립트: commit-helper.sh
- 실행 명령: `.claude/scripts/commit-helper.sh 4 "시간 검증 유틸 구현"`

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림

---

**조치 완료 후**: Agent 6에게 재검증 요청
```

---

## 🔄 피드백 채널 3: Agent 5 → Agent 4 (선택적)

### 목적
리팩토링 중 과도한 복잡도 또는 중복 코드 발견 시 피드백

### 트리거 조건
- 함수가 50줄 초과
- 중복 코드 3회 이상 발견
- 순환 복잡도 과다

### 피드백 형식

```markdown
# Agent 5 → Agent 4 피드백 (선택적)

**일시**: [YYYY-MM-DD HH:MM:SS]
**파일**: [파일명]

## 발견 사항

### 복잡도 문제
- **위치**: [파일:줄번호]
- **현재 상태**: [측정값]
- **제안**: [개선 방향]

### 중복 코드
- **위치 1**: [파일:줄번호]
- **위치 2**: [파일:줄번호]
- **제안**: [공통 함수 추출]

---

**참고**: Agent 5가 직접 리팩토링 진행 가능
```

---

## 📊 피드백 메트릭

### 추적 항목
- 피드백 발생 횟수
- 재시도 횟수
- 평균 해결 시간
- 에스컬레이션 비율

### 개선 지표
- 피드백 발생 → 감소 트렌드
- 재시도 → 1회 이내 해결
- 에스컬레이션 → 0%

---

## 🔧 자동화 지원

### 피드백 로그 저장
```bash
# 피드백 로그 디렉토리
claudedocs/feedback-logs/

# 파일 명명 규칙
feedback-agent[N]-to-agent[M]-[TIMESTAMP].md
```

### 피드백 템플릿 생성
```bash
# 피드백 템플릿 자동 생성
.claude/scripts/feedback-generator.sh <FROM_AGENT> <TO_AGENT> <ISSUE_TYPE>

# 예시: Agent 2 → Agent 1 명세 품질 피드백
.claude/scripts/feedback-generator.sh 2 1 spec-quality

# 예시: Agent 6 → Agent 4 커밋 누락 피드백
.claude/scripts/feedback-generator.sh 6 4 commit-missing

# 예시: Agent 6 → Agent 5 테스트 실패 피드백
.claude/scripts/feedback-generator.sh 6 5 test-failure
```

**지원하는 Issue Type**:
- **Agent 2 → Agent 1**: `spec-quality` (명세 품질 문제)
- **Agent 6 → Agent 3,4,5**: `commit-missing`, `test-failure`, `lint-error`, `tdd-violation`
- **Agent 5 → Agent 4**: `complexity`, `duplication` (선택적)

**출력 위치**: `claudedocs/feedback-logs/feedback-agent[N]-to-agent[M]-[TIMESTAMP].md`

---

## 관련 문서

- **CLAUDE.md**: v2.8.0 피드백 루프 추가
- **.claude/agents/test-design-agent.md**: Agent 2 피드백 프로토콜
- **.claude/agents/orchestrator-agent.md**: Agent 6 에러 처리
- **WORKFLOW_RECURRING_EVENTS.md**: 피드백 시나리오 예시

---

## 📊 Timeout 처리 프로토콜

### 3.1. 테스트 Timeout (test-enforcer.sh)

**트리거**: 테스트 실행 시간이 120초 초과

**자동 처리 절차**:
1. test-enforcer.sh가 timeout 감지 (exit code 124)
2. auto-recovery.sh test-failure 자동 호출
3. Timeout 원인 분석 로그 저장 (`claudedocs/test-logs/`)

**Agent 대응 (Agent 3, 4, 5)**:
1. auto-recovery.sh의 안내에 따라 문제 해결
2. 다음 사항 확인:
   - 무한 루프 발생 여부
   - 비동기 처리 미완료 (Promise, waitFor 등)
   - 테스트 데이터가 과도하게 큰 경우
   - waitFor() timeout 설정 과다 (기본 1000ms 권장)
3. 수정 후 test-enforcer.sh 재실행

**예시**:
```bash
# Timeout 발생 시 자동 로그
⏱️  TIMEOUT: 테스트가 120초를 초과했습니다!

📋 원인 분석:
1. 무한 루프가 발생했을 수 있습니다
2. 비동기 처리가 완료되지 않았을 수 있습니다
3. 테스트 데이터가 너무 클 수 있습니다
4. waitFor() timeout이 과도할 수 있습니다

🔄 자동 복구 스크립트 실행 중...
```

### 3.2. 품질 게이트 Timeout

**트리거**: TypeScript/ESLint 검사 시간 과다

**수동 처리**:
1. Agent 5가 quality-gate.sh 실행 중 과도한 시간 소요 감지
2. Agent 6에게 보고
3. 파일별 분할 검증 또는 검증 범위 축소 고려

---

## 🚨 에스컬레이션 규칙

### 4.1. Agent 1 ← Agent 2 (명세 품질, 최대 3회)

명세 품질이 3회 재시도에도 개선되지 않을 경우:

**Action**:
1. **Agent 6에게 에스컬레이션**
   - Agent 2가 Agent 6에게 피드백 이력 전달
   - Agent 6이 명세 범위 재조정 검토
2. **Agent 6의 조치**:
   - 명세 범위 축소 또는 단순화
   - Agent 6이 직접 명세 보완
   - 사용자에게 요구사항 재확인 요청
3. **지식 베이스 기록**:
   - `.claude/knowledge-base/lessons-learned/agent-1-spec-quality-lessons.md`에 실패 패턴 기록

### 4.2. Agent 3, 4, 5 ← Agent 6 (구현 품질, 최대 2회)

구현/테스트 품질이 2회 재시도에도 개선되지 않을 경우:

**Action**:
1. **사용자에게 보고**:
   - Agent 6이 문제 상세 및 재시도 이력 정리
   - 사용자에게 수동 개입 요청
2. **또는 Agent 6 직접 수행**:
   - 문제가 명확한 경우 Agent 6이 해당 Phase를 직접 수행
   - 예: 커밋 누락 → Agent 6이 직접 커밋
3. **지식 베이스 기록**:
   - `.claude/knowledge-base/lessons-learned/`에 실패 패턴 기록

---

## 📈 성공 기준 (피드백 프로토콜 효과성 측정)

| 지표 | 목표 | 현재 | 측정 방법 |
|------|------|------|----------|
| **명세 1차 통과율** | > 70% | - | Agent 2 검증 통과 비율 |
| **커밋 누락률** | < 5% | - | Git log 분석 |
| **재시도 평균 횟수** | < 1.5회 | - | 피드백 로그 분석 |
| **에스컬레이션 발생률** | < 10% | - | Agent 6 보고 건수 |
| **Timeout 발생률** | < 5% | - | test-enforcer.sh 로그 |

### 개선 트렌드 추적

```
기능 개발 회차별 측정:
- 1회차: 베이스라인 측정
- 2회차: 개선 비율 측정
- 3회차 이후: 지속적 개선 확인

목표: 3회차 이후 모든 지표가 목표치 달성
```

---

## 🗂️ 지식 베이스 연계

### 저장 위치

피드백 패턴을 지식 베이스에 축적하여 재사용:

```
.claude/knowledge-base/lessons-learned/
├── agent-1-spec-quality-lessons.md     # 명세 품질 실패 패턴
├── agent-2-test-design-lessons.md      # 테스트 설계 교훈
├── agent-3-red-phase-lessons.md        # Red Phase 문제 패턴
├── agent-4-green-phase-lessons.md      # Green Phase 구현 문제
├── agent-5-refactor-lessons.md         # 리팩토링 실패 패턴
└── agent-6-orchestration-lessons.md    # 조율 문제 교훈
```

### 축적 기준

다음 조건 중 하나라도 해당하면 지식 베이스에 기록:

1. ✅ **동일 문제가 2회 이상 반복 발생**
2. ✅ **재시도 최대 횟수 도달**
3. ✅ **에스컬레이션 발생**
4. ✅ **Timeout 문제 발생**
5. ✅ **자동화 도구 개선이 필요한 경우**

### 활용 방법

- 새로운 기능 개발 전: 해당 Agent의 lessons-learned 문서 읽기
- 피드백 발생 시: 과거 유사 사례 검색 및 해결 방법 참조
- 월 1회: Agent별 lessons-learned 문서 업데이트 및 정리

---

**버전 이력**:
- v1.1.0 (2025-10-31): Timeout 처리 프로토콜, 에스컬레이션 규칙, 성공 기준, 지식 베이스 연계 추가
- v1.0.0 (2025-10-30): 초기 피드백 프로토콜 정의
