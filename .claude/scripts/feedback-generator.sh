#!/bin/bash

# Agent 간 피드백 템플릿 생성 스크립트
# 사용법: ./feedback-generator.sh <FROM_AGENT> <TO_AGENT> <ISSUE_TYPE>
# 예시: ./feedback-generator.sh 2 1 spec-quality
# 예시: ./feedback-generator.sh 6 4 commit-missing

set -e

FROM_AGENT=$1
TO_AGENT=$2
ISSUE_TYPE=$3
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FEEDBACK_DIR="claudedocs/feedback-logs"
FEEDBACK_FILE="${FEEDBACK_DIR}/feedback-agent${FROM_AGENT}-to-agent${TO_AGENT}-${TIMESTAMP}.md"

mkdir -p "$FEEDBACK_DIR"

if [ -z "$FROM_AGENT" ] || [ -z "$TO_AGENT" ] || [ -z "$ISSUE_TYPE" ]; then
  echo "❌ 사용법: ./feedback-generator.sh <FROM_AGENT> <TO_AGENT> <ISSUE_TYPE>"
  echo ""
  echo "사용 가능한 피드백 조합:"
  echo "  Agent 2 → Agent 1:"
  echo "    - spec-quality: 명세 품질 문제"
  echo ""
  echo "  Agent 6 → Agent 3, 4, 5:"
  echo "    - commit-missing: Git 커밋 누락"
  echo "    - test-failure: 테스트 실패"
  echo "    - lint-error: 린트 에러"
  echo "    - tdd-violation: TDD 사이클 위반"
  echo ""
  echo "  Agent 5 → Agent 4:"
  echo "    - complexity: 복잡도 문제"
  echo "    - duplication: 중복 코드"
  echo ""
  echo "예시:"
  echo "  ./feedback-generator.sh 2 1 spec-quality"
  echo "  ./feedback-generator.sh 6 4 commit-missing"
  exit 1
fi

# Agent 번호 검증
if ! [[ "$FROM_AGENT" =~ ^[1-6]$ ]] || ! [[ "$TO_AGENT" =~ ^[1-6]$ ]]; then
  echo "❌ Agent 번호는 1-6 사이여야 합니다"
  exit 1
fi

echo "📝 피드백 템플릿 생성 중..."
echo "From: Agent $FROM_AGENT → To: Agent $TO_AGENT"
echo "Issue Type: $ISSUE_TYPE"
echo ""

# Agent 2 → Agent 1 피드백 템플릿
if [ "$FROM_AGENT" = "2" ] && [ "$TO_AGENT" = "1" ] && [ "$ISSUE_TYPE" = "spec-quality" ]; then
  cat > "$FEEDBACK_FILE" <<'EOF'
# Agent 2 → Agent 1 피드백

**일시**: [TIMESTAMP]
**기능**: [기능명]

## 검증 결과: ❌ 불완전

### 실패 항목

#### 1. ❌ [검증 항목명]
- **근거 (사실)**: [현재 명세의 상태를 구체적으로 나열]
  - 예: "시나리오 3에 '주간 반복' 기능이 있으나 구체적 입력값 없음"
- **근거 (평가)**: [품질 수준 평가 - 충분한지/부족한지]
  - 예: "Agent 2가 즉시 테스트 데이터를 만들 수 없음"
- **근거 (대안)**: [개선이 필요한 경우 조치 방법]
  - 예: "다음 정보 추가 필요: 예시 입력 `{ type: 'weekly', interval: 1, daysOfWeek: [0, 3] }`, 예시 출력: 생성된 일정 ID 배열"

**요청사항**: [구체적으로 무엇을 추가/수정해야 하는지]

---

#### 2. ❌ [검증 항목명 2]
- **근거 (사실)**:
- **근거 (평가)**:
- **근거 (대안)**:

**요청사항**:

---

## Agent 1 조치 필요

- [ ] [첫 번째 개선 사항]
- [ ] [두 번째 개선 사항]
- [ ] [세 번째 개선 사항]
- [ ] specs/[기능명].md 업데이트
- [ ] Agent 2에게 재검증 요청

**예상 재작업 시간**: [30분/1시간/2시간]
**재시도 횟수**: [1/2/3] (최대 3회)

---

## 재시도 메커니즘

- **1차 피드백**: 구체적 개선 요청 (현재)
- **2차 피드백**: 더 상세한 예시 제공 (필요 시)
- **3차 피드백**: 최후 통보 (이후 Agent 6에게 에스컬레이션)

---

**생성 시각**: [TIMESTAMP]
**생성 도구**: feedback-generator.sh
EOF

  # 변수 치환
  sed -i.bak "s/\[TIMESTAMP\]/$(date '+%Y-%m-%d %H:%M:%S')/g" "$FEEDBACK_FILE"
  rm "${FEEDBACK_FILE}.bak"

  echo "✅ Agent 2 → Agent 1 피드백 템플릿 생성 완료"

# Agent 6 → Agent 3, 4, 5 피드백 템플릿
elif [ "$FROM_AGENT" = "6" ] && [[ "$TO_AGENT" =~ ^[345]$ ]]; then
  # Agent 이름 매핑
  case "$TO_AGENT" in
    3) AGENT_NAME="Red Phase" ; PHASE="RED" ;;
    4) AGENT_NAME="Green Phase" ; PHASE="GREEN" ;;
    5) AGENT_NAME="Refactor" ; PHASE="REFACTOR" ;;
  esac

  # Issue 타입별 템플릿
  case "$ISSUE_TYPE" in
    commit-missing)
      cat > "$FEEDBACK_FILE" <<EOF
# Agent 6 → Agent $TO_AGENT 피드백

**일시**: $(date '+%Y-%m-%d %H:%M:%S')
**Agent**: Agent $TO_AGENT ($AGENT_NAME)
**Phase**: $PHASE

## 문제 감지: 커밋 누락

### 문제 상세
- **감지 내용**: Agent $TO_AGENT 작업 완료 후 Git 커밋이 생성되지 않음
- **예상 원인**: 커밋 명령 누락 또는 에러 발생
- **영향 범위**: 후속 Agent가 작업 이력을 추적할 수 없음

### 요구 조치
1. **변경사항 확인**
   \`\`\`bash
   git status
   git diff --stat
   \`\`\`

2. **커밋 생성**
   \`\`\`bash
   .claude/scripts/commit-helper.sh $TO_AGENT "[작업 내용 설명]"
   \`\`\`

3. **커밋 검증**
   \`\`\`bash
   git log -1 --oneline
   \`\`\`

### 자동화 도구
- **사용 가능 스크립트**: commit-helper.sh
- **실행 명령**: \`.claude/scripts/commit-helper.sh $TO_AGENT "[작업 내용]"\`

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림

**현재 재시도**: 1회차

---

**조치 완료 후**: Agent 6에게 재검증 요청
**생성 도구**: feedback-generator.sh
EOF
      ;;

    test-failure)
      cat > "$FEEDBACK_FILE" <<EOF
# Agent 6 → Agent $TO_AGENT 피드백

**일시**: $(date '+%Y-%m-%d %H:%M:%S')
**Agent**: Agent $TO_AGENT ($AGENT_NAME)
**Phase**: $PHASE

## 문제 감지: 테스트 실패

### 문제 상세
- **감지 내용**: $PHASE Phase 테스트가 실패함
- **예상 원인**: [구현 코드 버그 / 테스트 케이스 오류 / 의존성 문제]
- **영향 범위**: TDD 사이클이 중단됨

### 요구 조치
1. **테스트 로그 확인**
   \`\`\`bash
   pnpm test
   \`\`\`

2. **실패 원인 분석**
   - 어떤 테스트가 실패했는가?
   - Given-When-Then 중 어느 단계에서 실패했는가?
   - 예상 값 vs 실제 값 차이는?

3. **수정 및 재검증**
   - 구현 코드 수정 (Agent 4인 경우)
   - 테스트 코드 재검토 (Agent 3인 경우)
   - 리팩토링 롤백 (Agent 5인 경우)

### 자동화 도구
- **테스트 실행**: \`pnpm test\`
- **에러 복구**: \`.claude/scripts/auto-recovery.sh test-failure\`

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림

**현재 재시도**: 1회차

---

**조치 완료 후**: Agent 6에게 재검증 요청
**생성 도구**: feedback-generator.sh
EOF
      ;;

    lint-error)
      cat > "$FEEDBACK_FILE" <<EOF
# Agent 6 → Agent $TO_AGENT 피드백

**일시**: $(date '+%Y-%m-%d %H:%M:%S')
**Agent**: Agent $TO_AGENT ($AGENT_NAME)
**Phase**: $PHASE

## 문제 감지: 린트 에러

### 문제 상세
- **감지 내용**: [TypeScript 타입 에러 / ESLint 규칙 위반]
- **예상 원인**: [타입 정의 누락 / 코드 스타일 위반 / 사용하지 않는 변수]
- **영향 범위**: 품질 게이트를 통과할 수 없음

### 요구 조치
1. **린트 검사 실행**
   \`\`\`bash
   pnpm lint:tsc    # TypeScript 타입 체크
   pnpm lint:eslint # ESLint 검사
   \`\`\`

2. **에러 확인**
   - 어떤 파일에서 에러가 발생했는가?
   - 어떤 규칙을 위반했는가?

3. **수정 및 재검증**
   - ESLint 자동 수정: \`pnpm lint:eslint --fix\`
   - TypeScript 타입 에러: 수동 수정 필요

### 자동화 도구
- **품질 게이트**: \`.claude/scripts/quality-gate.sh\`
- **에러 복구**: \`.claude/scripts/auto-recovery.sh lint-error\`

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림

**현재 재시도**: 1회차

---

**조치 완료 후**: Agent 6에게 재검증 요청
**생성 도구**: feedback-generator.sh
EOF
      ;;

    tdd-violation)
      cat > "$FEEDBACK_FILE" <<EOF
# Agent 6 → Agent $TO_AGENT 피드백

**일시**: $(date '+%Y-%m-%d %H:%M:%S')
**Agent**: Agent $TO_AGENT ($AGENT_NAME)
**Phase**: $PHASE

## 문제 감지: TDD 사이클 위반

### 문제 상세
- **감지 내용**: TDD Red-Green-Refactor 사이클이 준수되지 않음
- **위반 유형**:
  - [ ] Red Phase에서 테스트가 실패하지 않음
  - [ ] Green Phase에서 테스트를 통과하지 못함
  - [ ] Refactor Phase에서 기존 테스트가 깨짐
- **영향 범위**: TDD 품질 보증 메커니즘이 무효화됨

### 요구 조치
1. **TDD 사이클 재확인**
   \`\`\`bash
   # Red Phase 검증
   .claude/scripts/test-enforcer.sh RED [테스트 파일]

   # Green Phase 검증
   .claude/scripts/test-enforcer.sh GREEN

   # Refactor Phase 검증
   .claude/scripts/test-enforcer.sh REFACTOR
   \`\`\`

2. **문제 원인 파악**
   - Red Phase: 테스트가 구현을 검증하는가?
   - Green Phase: 최소 구현으로 테스트를 통과했는가?
   - Refactor Phase: 리팩토링이 동작을 변경하지 않았는가?

3. **수정 및 재시도**
   - 해당 Phase부터 다시 시작
   - rules/tdd-principles.md 재확인

### 자동화 도구
- **테스트 강제**: \`.claude/scripts/test-enforcer.sh <PHASE>\`
- **에러 복구**: \`.claude/scripts/auto-recovery.sh refactor-failure\` (Refactor인 경우)

---

## 재시도 정책

- **최대 재시도**: 2회
- **에스컬레이션**: 2회 실패 시 사용자에게 알림

**현재 재시도**: 1회차

---

**조치 완료 후**: Agent 6에게 재검증 요청
**생성 도구**: feedback-generator.sh
EOF
      ;;

    *)
      echo "❌ 알 수 없는 Issue Type: $ISSUE_TYPE"
      echo "사용 가능한 Issue Type: commit-missing, test-failure, lint-error, tdd-violation"
      exit 1
      ;;
  esac

  echo "✅ Agent 6 → Agent $TO_AGENT 피드백 템플릿 생성 완료"

# Agent 5 → Agent 4 피드백 템플릿
elif [ "$FROM_AGENT" = "5" ] && [ "$TO_AGENT" = "4" ]; then
  case "$ISSUE_TYPE" in
    complexity|duplication)
      cat > "$FEEDBACK_FILE" <<EOF
# Agent 5 → Agent 4 피드백 (선택적)

**일시**: $(date '+%Y-%m-%d %H:%M:%S')
**파일**: [파일명]

## 발견 사항

### ${ISSUE_TYPE^} 문제
- **위치**: [파일:줄번호]
- **현재 상태**:
  - [구체적 측정값 또는 발견 내용]
- **제안**:
  - [개선 방향]

---

## 상세 분석

### 문제점
[구체적 문제 설명]

### 개선 제안
1. [첫 번째 개선안]
2. [두 번째 개선안]
3. [세 번째 개선안]

### 참고 패턴
- .claude/knowledge-base/patterns/refactoring-patterns.md

---

**참고**: Agent 5가 직접 리팩토링 진행 가능 (선택적 피드백)
**생성 도구**: feedback-generator.sh
EOF

      # 변수 치환
      sed -i.bak "s/\${ISSUE_TYPE\^}/${ISSUE_TYPE^}/g" "$FEEDBACK_FILE"
      rm "${FEEDBACK_FILE}.bak"

      echo "✅ Agent 5 → Agent 4 피드백 템플릿 생성 완료"
      ;;

    *)
      echo "❌ 알 수 없는 Issue Type: $ISSUE_TYPE"
      echo "사용 가능한 Issue Type: complexity, duplication"
      exit 1
      ;;
  esac

else
  echo "❌ 지원하지 않는 Agent 조합: Agent $FROM_AGENT → Agent $TO_AGENT"
  echo ""
  echo "사용 가능한 조합:"
  echo "  - Agent 2 → Agent 1: 명세 품질 피드백"
  echo "  - Agent 6 → Agent 3, 4, 5: 커밋/품질 문제 피드백"
  echo "  - Agent 5 → Agent 4: 복잡도/중복 코드 피드백"
  exit 1
fi

echo ""
echo "📄 생성된 피드백 템플릿: $FEEDBACK_FILE"
echo ""
echo "다음 단계:"
echo "1. 피드백 내용 작성 (구체적 문제점 및 요청사항)"
echo "2. 대상 Agent에게 전달"
echo "3. 조치 완료 후 재검증"
