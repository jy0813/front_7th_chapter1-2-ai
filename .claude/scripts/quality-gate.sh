#!/bin/bash

# 품질 게이트 자동화 스크립트
# 사용법: ./quality-gate.sh [--strict]
# 예시: ./quality-gate.sh
# 예시: ./quality-gate.sh --strict (커버리지 검사 포함)

set -e

STRICT_MODE=false
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="claudedocs/quality-logs"
LOG_FILE="${LOG_DIR}/quality-gate-${TIMESTAMP}.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 인자 처리
if [ "$1" = "--strict" ]; then
  STRICT_MODE=true
  echo "🔒 Strict 모드 활성화 (커버리지 검사 포함)"
fi

echo "🚦 품질 게이트 검증 시작..."
echo "📝 로그 저장 위치: $LOG_FILE"
echo ""

# 검증 결과 추적
PASSED=0
FAILED=0
WARNINGS=0

# 함수: 검증 항목 실행
run_check() {
  local NAME=$1
  local CMD=$2
  local REQUIRED=$3  # true/false

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 검증 항목: $NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  set +e
  $CMD 2>&1 | tee -a "$LOG_FILE"
  EXIT_CODE=${PIPESTATUS[0]}
  set -e

  echo ""

  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ $NAME: 통과"
    PASSED=$((PASSED + 1))
  else
    if [ "$REQUIRED" = "true" ]; then
      echo "❌ $NAME: 실패 (필수)"
      FAILED=$((FAILED + 1))
    else
      echo "⚠️ $NAME: 실패 (경고)"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi

  echo ""
}

# 1. TypeScript 타입 체크 (필수)
run_check "TypeScript 타입 체크" "pnpm lint:tsc" "true"

# 2. ESLint 검사 (필수)
run_check "ESLint 코드 품질 검사" "pnpm lint:eslint" "true"

# 3. 테스트 실행 (필수)
run_check "단위 테스트 실행" "pnpm test run" "true"

# 4. Git 상태 확인 (경고)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 검증 항목: Git 저장소 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if git diff --quiet && git diff --cached --quiet; then
  echo "✅ Git 저장소 상태: 깨끗함 (변경사항 없음)"
  PASSED=$((PASSED + 1))
else
  echo "⚠️ Git 저장소 상태: 커밋되지 않은 변경사항 존재"
  echo ""
  echo "변경된 파일:"
  git status --short
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 5. 커버리지 검사 (Strict 모드에서만)
if [ "$STRICT_MODE" = "true" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 검증 항목: 테스트 커버리지"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  set +e
  pnpm test:coverage 2>&1 | tee -a "$LOG_FILE"
  COVERAGE_EXIT=$?
  set -e

  if [ $COVERAGE_EXIT -eq 0 ]; then
    echo "✅ 테스트 커버리지: 통과"
    PASSED=$((PASSED + 1))
  else
    echo "❌ 테스트 커버리지: 실패"
    FAILED=$((FAILED + 1))
  fi

  echo ""
fi

# 최종 결과 리포트
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 품질 게이트 최종 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 통과: $PASSED"
echo "❌ 실패: $FAILED"
echo "⚠️ 경고: $WARNINGS"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "❌ 품질 게이트 실패: $FAILED개 필수 검증 항목 실패"
  echo ""
  echo "💡 조치사항:"
  echo "1. 로그 파일 확인: $LOG_FILE"
  echo "2. 실패한 검증 항목 수정"
  echo "3. 품질 게이트 재실행"
  echo ""
  echo "상세 로그:"
  echo "  cat $LOG_FILE"
  exit 1
else
  echo "✅ 품질 게이트 통과!"

  if [ $WARNINGS -gt 0 ]; then
    echo "⚠️ $WARNINGS개 경고 항목이 있습니다. 로그를 확인하세요."
  fi

  echo ""
  echo "다음 단계:"
  echo "1. Git 커밋 생성 (미커밋 변경사항이 있는 경우)"
  echo "2. Agent 6 (Orchestrator)에게 최종 검증 요청"
  exit 0
fi
