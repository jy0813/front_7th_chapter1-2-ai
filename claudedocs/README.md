# claudedocs/ - Agent 산출물 디렉토리

**목적**: 6 Agent 시스템의 모든 산출물을 중앙 집중식으로 관리

**생성일**: 2025-10-29
**버전**: 1.0.0

---

## 📁 디렉토리 구조

```
claudedocs/
├── README.md                                    # 이 파일
├── templates/                                   # Agent별 산출물 템플릿
│   ├── 01-feature-design-template.md           # Agent 1 산출물 템플릿
│   ├── 02-test-design-template.md              # Agent 2 산출물 템플릿
│   ├── 03-red-phase-template.md                # Agent 3 산출물 템플릿
│   ├── 04-green-phase-template.md              # Agent 4 산출물 템플릿
│   ├── 05-refactor-template.md                 # Agent 5 산출물 템플릿
│   └── 06-orchestrator-template.md             # Agent 6 산출물 템플릿
├── 01-feature-design-[기능명].md               # Agent 1 실제 산출물
├── 02-test-design-[기능명].md                  # Agent 2 실제 산출물
├── 03-red-phase-[기능명].md                    # Agent 3 실제 산출물 (선택적)
├── 04-implementation-[기능명].md               # Agent 4 실제 산출물
├── 05-refactor-[기능명].md                     # Agent 5 실제 산출물 (선택적)
├── 06-orchestrator-progress-[기능명].md        # Agent 6 진행 상황
├── 06-orchestrator-quality-[기능명].md         # Agent 6 품질 검증
├── 06-orchestrator-tdd-[기능명].md             # Agent 6 TDD 검증
├── 06-orchestrator-final-[기능명].md           # Agent 6 최종 리포트
├── feedback-logs/                               # 피드백 템플릿 저장소
│   └── feedback-agent[N]-to-agent[M]-[TIMESTAMP].md
├── test-logs/                                   # 테스트 실행 로그
│   └── test-[PHASE]-[TIMESTAMP].log
├── quality-logs/                                # 품질 게이트 로그
│   └── quality-gate-[TIMESTAMP].log
└── recovery-logs/                               # 에러 복구 로그
    └── recovery-[TIMESTAMP].log
```

---

## 🎯 Agent별 산출물

### Agent 1: Feature Design Agent
**파일명**: `01-feature-design-[기능명].md`

**내용**:
- 작업 범위 정리 (영향 범위, 수정 필요 파일)
- 명세 품질 자체 검증 (8개 항목 + 3단계 근거)
- 체크리스트
- specs/ 디렉토리 업데이트 요약

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 1 [기능명]
```

---

### Agent 2: Test Design Agent
**파일명**: `02-test-design-[기능명].md`

**내용**:
- 명세 품질 검증 (5개 항목 + 3단계 근거)
- 테스트 구조 설계 (단위/훅/통합)
- 테스트 데이터 fixtures 목록
- Agent 1에게 피드백 (불완전 시)

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 2 [기능명]
```

---

### Agent 3: Red Phase Agent
**파일명**: `03-red-phase-[기능명].md` (선택적)

**내용**:
- 작성한 테스트 파일 목록
- 테스트 실패 확인 로그
- Testing Rules 준수 확인

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 3 [기능명]
```

**참고**: Agent 3은 주로 테스트 코드 작성에 집중하므로 문서는 선택적

---

### Agent 4: Green Phase Agent
**파일명**: `04-implementation-[기능명].md`

**내용**:
- 구현 파일 목록 및 경로
- 최소 구현 원칙 적용 (YAGNI, 단순성 우선, Fake it)
- 각 함수 역할 설명
- 특수 케이스 처리 로직 설명
- API 사용법 (해당 시)

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 4 [기능명]
```

---

### Agent 5: Refactor Agent
**파일명**: `05-refactor-[기능명].md` (선택적)

**내용**:
- 리팩토링 대상 파일
- 개선 사항 (중복 제거, 타입 정의, 가독성)
- 테스트 및 린트 검증 결과

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 5 [기능명]
```

**참고**: Agent 5는 주로 코드 개선에 집중하므로 문서는 선택적

---

### Agent 6: Orchestrator Agent
**파일명**:
- `06-orchestrator-progress-[기능명].md` (진행 상황)
- `06-orchestrator-quality-[기능명].md` (품질 검증)
- `06-orchestrator-tdd-[기능명].md` (TDD 검증)
- `06-orchestrator-final-[기능명].md` (최종 리포트)

**내용**:
- **progress**: 전체 워크플로우 진행 상황, 각 Agent 완료 여부
- **quality**: 품질 게이트 통과 여부 (테스트, 커버리지, 린트)
- **tdd**: TDD 사이클 준수 확인 (Red-Green-Refactor 커밋)
- **final**: 최종 종합 리포트 (Git 로그, 테스트 결과, 커버리지)

**생성 방법**:
```bash
.claude/scripts/doc-generator.sh 6 [기능명]
# 또는
.claude/scripts/final-report.sh [기능명]
```

---

## 🔄 자동 생성 로그

### 피드백 로그
**경로**: `feedback-logs/`

**파일명**: `feedback-agent[N]-to-agent[M]-[TIMESTAMP].md`

**생성 방법**:
```bash
.claude/scripts/feedback-generator.sh <FROM_AGENT> <TO_AGENT> <ISSUE_TYPE>
```

**예시**:
- Agent 2 → Agent 1: `feedback-agent2-to-agent1-20251029_143000.md`
- Agent 6 → Agent 4: `feedback-agent6-to-agent4-20251029_150000.md`

---

### 테스트 로그
**경로**: `test-logs/`

**파일명**: `test-[PHASE]-[TIMESTAMP].log`

**생성 방법**:
```bash
.claude/scripts/test-enforcer.sh <PHASE> [TEST_FILE]
```

**예시**:
- Red Phase: `test-RED-20251029_140000.log`
- Green Phase: `test-GREEN-20251029_141000.log`
- Refactor Phase: `test-REFACTOR-20251029_142000.log`

---

### 품질 게이트 로그
**경로**: `quality-logs/`

**파일명**: `quality-gate-[TIMESTAMP].log`

**생성 방법**:
```bash
.claude/scripts/quality-gate.sh [--strict]
```

**내용**:
- TypeScript 타입 체크 결과
- ESLint 코드 품질 검사 결과
- 단위 테스트 실행 결과
- 테스트 커버리지 (strict 모드)

---

### 에러 복구 로그
**경로**: `recovery-logs/`

**파일명**: `recovery-[TIMESTAMP].log`

**생성 방법**:
```bash
.claude/scripts/auto-recovery.sh <ERROR_TYPE>
```

**지원 에러 타입**:
- `test-failure`: 테스트 실패 복구
- `lint-error`: 린트 에러 복구
- `commit-missing`: 커밋 누락 복구
- `refactor-failure`: 리팩토링 실패 롤백
- `dependency-error`: 의존성 에러 복구

---

## 📊 산출물 활용 방법

### 1. Agent 간 참조
- **Agent 2** → `01-feature-design-[기능명].md` 읽고 명세 품질 검증
- **Agent 3** → `02-test-design-[기능명].md` 읽고 테스트 코드 작성
- **Agent 4** → `02-test-design-[기능명].md` 읽고 최소 구현
- **Agent 5** → `04-implementation-[기능명].md` 읽고 리팩토링
- **Agent 6** → 모든 산출물 읽고 품질 검증

### 2. 추적성 확보
- 각 Agent의 작업 기록이 문서로 남음
- Git 커밋과 문서를 함께 참조하여 변경 이력 추적
- 피드백 로그로 Agent 간 의사소통 기록

### 3. 지속적 개선
- 과거 프로젝트 산출물을 지식 베이스로 활용
- 반복되는 패턴을 `.claude/knowledge-base/patterns/`에 정리
- 자주 발생하는 에러를 `.claude/knowledge-base/common-errors/`에 문서화

---

## 🔗 관련 문서

- **CLAUDE.md**: 프로젝트 개발 가이드 (v2.9.0 자동화 섹션)
- **WORKFLOW_RECURRING_EVENTS.md**: 6 Agent 시스템 워크플로우
- **.claude/agents/**: 각 Agent 상세 명세
- **.claude/scripts/**: 자동화 스크립트
- **.claude/knowledge-base/**: 지식 베이스

---

**버전 이력**:
- v1.0.0 (2025-10-29): 초기 claudedocs 구조 정의, Agent별 산출물 템플릿 생성
