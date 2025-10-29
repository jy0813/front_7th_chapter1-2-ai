#!/bin/bash

# 테스트 실행 강제 스크립트
# 사용법: ./test-enforcer.sh <PHASE> [TEST_FILE]
# 예시: ./test-enforcer.sh RED src/__tests__/unit/easy.timeValidation.spec.ts
# 예시: ./test-enforcer.sh GREEN

set -e

PHASE=$1
TEST_FILE=$2
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="claudedocs/test-logs"
LOG_FILE="${LOG_DIR}/test-${PHASE}-${TIMESTAMP}.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

if [ -z "$PHASE" ]; then
  echo "❌ 사용법: ./test-enforcer.sh <PHASE> [TEST_FILE]"
  echo "PHASE: RED, GREEN, REFACTOR"
  exit 1
fi

# Phase 검증
if ! [[ "$PHASE" =~ ^(RED|GREEN|REFACTOR)$ ]]; then
  echo "❌ PHASE는 RED, GREEN, REFACTOR 중 하나여야 합니다"
  exit 1
fi

echo "🧪 테스트 실행 중... (Phase: $PHASE)"
echo "📝 로그 저장 위치: $LOG_FILE"
echo ""

# 테스트 실행
if [ -n "$TEST_FILE" ]; then
  echo "📂 특정 파일 테스트: $TEST_FILE"
  TEST_CMD="pnpm test $TEST_FILE"
else
  echo "📦 전체 테스트 실행"
  TEST_CMD="pnpm test"
fi

# 테스트 실행 및 결과 저장
set +e  # 테스트 실패 시에도 스크립트 계속 실행
$TEST_CMD 2>&1 | tee "$LOG_FILE"
TEST_EXIT_CODE=${PIPESTATUS[0]}
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Phase별 검증
case "$PHASE" in
  RED)
    if [ $TEST_EXIT_CODE -ne 0 ]; then
      echo "✅ RED Phase 성공: 테스트가 실패했습니다 (예상된 동작)"
      echo "📊 테스트 실패 확인 완료"
      echo ""
      echo "다음 단계: Agent 4 (Green Phase)를 실행하여 구현 코드를 작성하세요"
      exit 0
    else
      echo "❌ RED Phase 실패: 테스트가 통과했습니다"
      echo "⚠️ Red Phase에서는 테스트가 실패해야 합니다!"
      echo ""
      echo "원인 분석:"
      echo "1. 테스트 코드가 구현되지 않은 함수를 호출하지 않았을 수 있습니다"
      echo "2. 이미 구현 코드가 존재할 수 있습니다"
      echo "3. 테스트 단언(assertion)이 너무 약할 수 있습니다"
      exit 1
    fi
    ;;

  GREEN)
    if [ $TEST_EXIT_CODE -eq 0 ]; then
      echo "✅ GREEN Phase 성공: 모든 테스트가 통과했습니다"
      echo "📊 테스트 통과 확인 완료"
      echo ""
      echo "다음 단계: Agent 5 (Refactor Phase)를 실행하여 코드 품질을 개선하세요"
      exit 0
    else
      echo "❌ GREEN Phase 실패: 테스트가 실패했습니다"
      echo "⚠️ Green Phase에서는 모든 테스트가 통과해야 합니다!"
      echo ""
      echo "원인 분석:"
      echo "1. 구현 코드에 버그가 있을 수 있습니다"
      echo "2. 테스트 케이스의 요구사항을 충족하지 못했습니다"
      echo "3. 엣지 케이스를 처리하지 못했을 수 있습니다"
      echo ""
      echo "💡 조치사항:"
      echo "- 테스트 로그를 확인하여 실패 원인 파악"
      echo "- 실패한 테스트 케이스의 Given-When-Then 재검토"
      echo "- 구현 코드 수정 후 재실행"
      exit 1
    fi
    ;;

  REFACTOR)
    if [ $TEST_EXIT_CODE -eq 0 ]; then
      echo "✅ REFACTOR Phase 성공: 리팩토링 후에도 모든 테스트가 통과했습니다"
      echo "📊 회귀 테스트 통과 확인 완료"
      echo ""
      echo "다음 단계: 다음 기능으로 이동하거나 Agent 6에게 품질 검증을 요청하세요"
      exit 0
    else
      echo "❌ REFACTOR Phase 실패: 리팩토링 후 테스트가 깨졌습니다!"
      echo "⚠️ 즉시 롤백이 필요합니다!"
      echo ""
      echo "원인 분석:"
      echo "1. 리팩토링 과정에서 로직이 변경되었습니다"
      echo "2. 의존성이 깨졌을 수 있습니다"
      echo "3. 타입 에러가 발생했을 수 있습니다"
      echo ""
      echo "💡 조치사항:"
      echo "- git diff로 변경사항 확인"
      echo "- 마지막 커밋으로 롤백 고려"
      echo "- 더 작은 단위로 리팩토링 재시도"
      exit 1
    fi
    ;;
esac
