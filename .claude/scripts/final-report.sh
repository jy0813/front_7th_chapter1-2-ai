#!/bin/bash

# 최종 리포트 자동 생성 스크립트
# 사용법: ./final-report.sh <FEATURE_NAME>
# 예시: ./final-report.sh recurring-events

set -e

FEATURE_NAME=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="claudedocs/06-orchestrator-final-${FEATURE_NAME}.md"

if [ -z "$FEATURE_NAME" ]; then
  echo "❌ 사용법: ./final-report.sh <FEATURE_NAME>"
  echo "예시: ./final-report.sh recurring-events"
  exit 1
fi

echo "📊 최종 리포트 생성 중..."
echo "📝 저장 위치: $REPORT_FILE"
echo ""

# Git 커밋 로그 수집
echo "🔍 Git 커밋 로그 분석 중..."
COMMITS=$(git log --oneline --all --grep="${FEATURE_NAME}" --format="%h %s" 2>/dev/null || echo "커밋 없음")

# 테스트 결과 수집
echo "🧪 최종 테스트 실행 중..."
TEST_RESULT=$(pnpm test run 2>&1 || echo "테스트 실패")

# 린트 검사
echo "🔍 린트 검사 중..."
LINT_TSC=$(pnpm lint:tsc 2>&1 && echo "✅ TypeScript 타입 체크 통과" || echo "❌ TypeScript 타입 체크 실패")
LINT_ESLINT=$(pnpm lint:eslint 2>&1 && echo "✅ ESLint 검사 통과" || echo "❌ ESLint 검사 실패")

# 변경된 파일 목록
echo "📂 변경된 파일 목록 수집 중..."
CHANGED_FILES=$(git diff --name-only HEAD~10 2>/dev/null | grep -E "(${FEATURE_NAME}|spec)" || echo "변경 파일 없음")

# 커버리지 정보 (있는 경우)
COVERAGE_INFO="커버리지 정보 없음"
if [ -f ".coverage/coverage-summary.json" ]; then
  COVERAGE_INFO=$(cat .coverage/coverage-summary.json 2>/dev/null || echo "커버리지 파일 읽기 실패")
fi

# 리포트 생성
cat > "$REPORT_FILE" <<EOF
# 최종 워크플로우 리포트

**기능명**: ${FEATURE_NAME}
**생성일시**: $(date '+%Y-%m-%d %H:%M:%S')
**Agent**: Agent 6 (Orchestrator)

---

## 📋 Executive Summary

### 전체 진행 상황

| Phase | Agent | 상태 | 비고 |
|-------|-------|------|------|
| 명세 작성 | Agent 1 | ✅ | specs/${FEATURE_NAME}.md |
| 테스트 설계 | Agent 2 | ✅ | claudedocs/02-test-design-${FEATURE_NAME}.md |
| Red Phase | Agent 3 | ✅ | 테스트 작성 |
| Green Phase | Agent 4 | ✅ | 구현 완료 |
| Refactor | Agent 5 | ✅ | 코드 개선 |
| 품질 검증 | Agent 6 | ✅ | 최종 검증 |

---

## 📊 Git 커밋 이력

### 커밋 로그
\`\`\`
${COMMITS}
\`\`\`

### 커밋 패턴 검증
- [ ] docs: 명세 작성 (Agent 1)
- [ ] test: [DESIGN] 테스트 설계 (Agent 2)
- [ ] test: [RED] 실패하는 테스트 (Agent 3)
- [ ] feat: [GREEN] 최소 구현 (Agent 4)
- [ ] refactor: [REFACTOR] 코드 개선 (Agent 5)
- [ ] docs: 문서 업데이트 (Agent 6)

**⚠️ 누락된 커밋이 있는 경우 즉시 보완 필요**

---

## 🧪 테스트 결과

### 최종 테스트 실행
\`\`\`
${TEST_RESULT}
\`\`\`

### 테스트 커버리지
\`\`\`json
${COVERAGE_INFO}
\`\`\`

---

## 🔍 품질 검증 결과

### TypeScript 타입 체크
${LINT_TSC}

### ESLint 검사
${LINT_ESLINT}

---

## 📂 변경된 파일 목록

\`\`\`
${CHANGED_FILES}
\`\`\`

---

## ✅ TDD 사이클 검증

### Red-Green-Refactor 준수 여부

1. **Red Phase (Agent 3)**
   - [ ] 실패하는 테스트 먼저 작성
   - [ ] 테스트 실패 확인
   - [ ] Git 커밋 (test: [RED])

2. **Green Phase (Agent 4)**
   - [ ] 최소 구현 코드 작성
   - [ ] 테스트 통과 확인
   - [ ] Git 커밋 (feat: [GREEN])

3. **Refactor Phase (Agent 5)**
   - [ ] 코드 품질 개선
   - [ ] 테스트 여전히 통과
   - [ ] Git 커밋 (refactor: [REFACTOR])

**종합 평가**: [통과/보완 필요]

---

## 📝 품질 평가

### 코드 품질 (5점 척도)

| 항목 | 점수 | 비고 |
|------|------|------|
| 테스트 커버리지 | /5 | |
| 타입 안전성 | /5 | |
| 코드 가독성 | /5 | |
| TDD 준수도 | /5 | |
| 문서 완성도 | /5 | |

**총점**: /25

---

## ⚠️ 발견된 이슈

### 심각도: 높음
-

### 심각도: 중간
-

### 심각도: 낮음
-

---

## 💡 개선 제안

### 즉시 조치 필요
-

### 향후 고려사항
-

---

## 🎯 최종 결론

**상태**: [✅ 완료 / ⚠️ 보완 필요 / ❌ 재작업 필요]

**종료 시각**: $(date '+%Y-%m-%d %H:%M:%S')

**다음 단계**:
1.
2.
3.

---

## 📚 참조 문서

- 명세: specs/${FEATURE_NAME}.md
- 테스트 설계: claudedocs/02-test-design-${FEATURE_NAME}.md
- 워크플로우: WORKFLOW_RECURRING_EVENTS.md
- 시스템 가이드: CLAUDE.md

---

**보고서 생성**: Automated by final-report.sh
**생성 시각**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo "✅ 최종 리포트 생성 완료"
echo ""
echo "📄 생성된 리포트: $REPORT_FILE"
echo ""
echo "다음 단계:"
echo "1. 리포트 내용 검토 및 평가 점수 입력"
echo "2. 발견된 이슈 및 개선 제안 작성"
echo "3. 최종 상태 결정"
echo "4. CLAUDE.md 업데이트"
echo "5. Git 커밋 (docs: ${FEATURE_NAME} 최종 리포트)"
