# 지식 베이스 (Knowledge Base)

**목적**: 6 Agent 시스템 개발 과정에서 발견한 패턴, 교훈, 베스트 프랙티스 축적

**생성일**: 2025-10-30
**v2.8.0 자동화 개선의 일환**

---

## 📁 디렉토리 구조

```
.claude/knowledge-base/
├── README.md                 # 이 파일
├── patterns/                 # 반복 사용 가능한 코드 패턴
│   ├── testing-patterns.md       # 테스트 작성 패턴
│   ├── tdd-patterns.md           # TDD 사이클 패턴
│   └── refactoring-patterns.md   # 리팩토링 패턴
├── lessons-learned/          # 프로젝트 진행 중 얻은 교훈
│   ├── agent-collaboration.md    # Agent 간 협업 교훈
│   ├── quality-gates.md          # 품질 게이트 운영 교훈
│   └── automation-learnings.md   # 자동화 개선 교훈
├── common-errors/            # 자주 발생하는 에러 및 해결법
│   ├── test-failures.md          # 테스트 실패 패턴
│   ├── lint-errors.md            # 린트 에러 패턴
│   └── git-commit-errors.md      # Git 커밋 문제
└── best-practices/           # 검증된 베스트 프랙티스
    ├── agent-1-best-practices.md  # Agent 1 명세 작성
    ├── agent-2-best-practices.md  # Agent 2 테스트 설계
    ├── agent-3-best-practices.md  # Agent 3 Red Phase
    ├── agent-4-best-practices.md  # Agent 4 Green Phase
    ├── agent-5-best-practices.md  # Agent 5 Refactor
    └── agent-6-best-practices.md  # Agent 6 Orchestrator
```

---

## 🎯 사용 방법

### 1. 패턴 활용
- 새로운 기능 개발 시 `patterns/` 디렉토리 참조
- 검증된 패턴을 재사용하여 개발 속도 향상

### 2. 교훈 학습
- `lessons-learned/` 디렉토리에서 과거 실수와 개선 방법 학습
- 같은 실수 반복 방지

### 3. 에러 해결
- 에러 발생 시 `common-errors/` 디렉토리 참조
- 빠른 문제 해결 및 복구

### 4. 베스트 프랙티스 준수
- Agent별 `best-practices/` 문서 참조
- 품질 기준 유지 및 일관성 확보

---

## 📝 문서 작성 규칙

### 패턴 문서 형식
```markdown
# [패턴 이름]

## 문제 상황
- 어떤 상황에서 발생하는가?

## 해결 방법
- 구체적인 코드 또는 접근 방법

## 예시
- 실제 사용 예시

## 주의사항
- 함정 및 피해야 할 것들

## 관련 문서
- 참조할 다른 문서 링크
```

### 교훈 문서 형식
```markdown
# [교훈 제목]

## 상황
- 무슨 일이 있었는가?

## 문제
- 왜 문제가 되었는가?

## 해결
- 어떻게 해결했는가?

## 학습 내용
- 무엇을 배웠는가?

## 예방 방법
- 어떻게 재발을 방지할 수 있는가?
```

### 에러 문서 형식
```markdown
# [에러 이름]

## 증상
- 어떤 에러 메시지가 표시되는가?

## 원인
- 왜 발생하는가?

## 해결 방법
1. 첫 번째 시도
2. 두 번째 시도
3. 최후의 수단

## 예방
- 어떻게 미리 방지할 수 있는가?

## 관련 스크립트
- auto-recovery.sh 사용법
```

---

## 🔄 업데이트 주기

### Agent 작업 후
- 새로운 패턴 발견 시 즉시 추가
- 에러 해결 시 common-errors/ 업데이트

### 주간 리뷰
- lessons-learned/ 정리
- best-practices/ 검증 및 업데이트

### 프로젝트 완료 시
- 종합 리뷰 및 문서 정리
- 다음 프로젝트를 위한 가이드 작성

---

## 📊 메트릭 추적

### 패턴 재사용률
- 패턴 참조 횟수 추적
- 효과적인 패턴 식별

### 에러 재발률
- 같은 에러 재발 여부 추적
- 예방 메커니즘 개선

### 품질 향상도
- 베스트 프랙티스 적용 전/후 비교
- 지속적 개선

---

## 🔗 관련 문서

- **CLAUDE.md**: 프로젝트 전체 가이드
- **WORKFLOW_RECURRING_EVENTS.md**: 6 Agent 시스템 워크플로우
- **.claude/agents/**: 각 Agent 상세 명세
- **.claude/scripts/**: 자동화 스크립트
- **claudedocs/**: Agent 산출물

---

## 💡 기여 가이드

### 새로운 패턴 추가
1. 패턴이 3회 이상 반복 사용됨을 확인
2. 적절한 카테고리 선택 (patterns/, lessons-learned/, etc.)
3. 문서 작성 규칙 준수
4. Git 커밋 (docs: 지식 베이스 [카테고리] 추가)

### 기존 문서 업데이트
1. 새로운 정보 또는 개선 사항 발견
2. 문서 업데이트
3. 변경 이력 기록
4. Git 커밋 (docs: 지식 베이스 [문서명] 업데이트)

---

**마지막 업데이트**: 2025-10-30
**v2.8.0 자동화 개선 완료**
