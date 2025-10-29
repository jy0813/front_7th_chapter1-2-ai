#!/bin/bash

# 에러 복구 자동화 스크립트
# 사용법: ./auto-recovery.sh <ERROR_TYPE>
# 예시: ./auto-recovery.sh test-failure
# 예시: ./auto-recovery.sh lint-error
# 예시: ./auto-recovery.sh commit-missing

set -e

ERROR_TYPE=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RECOVERY_LOG="claudedocs/recovery-logs/recovery-${TIMESTAMP}.log"

mkdir -p "claudedocs/recovery-logs"

if [ -z "$ERROR_TYPE" ]; then
  echo "❌ 사용법: ./auto-recovery.sh <ERROR_TYPE>"
  echo ""
  echo "사용 가능한 ERROR_TYPE:"
  echo "  test-failure      - 테스트 실패 시 복구"
  echo "  lint-error        - 린트 에러 시 복구"
  echo "  commit-missing    - 커밋 누락 시 복구"
  echo "  refactor-failure  - 리팩토링 실패 시 롤백"
  echo "  dependency-error  - 의존성 에러 시 복구"
  exit 1
fi

echo "🔧 에러 복구 시작..."
echo "📝 로그 저장: $RECOVERY_LOG"
echo ""

case "$ERROR_TYPE" in
  test-failure)
    echo "🧪 테스트 실패 복구 시작"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. 현재 상태 저장
    echo "1️⃣ 현재 상태 저장 중..."
    git diff > "/tmp/test-failure-diff-${TIMESTAMP}.patch"

    # 2. 테스트 로그 수집
    echo "2️⃣ 테스트 로그 수집 중..."
    pnpm test run 2>&1 | tee "$RECOVERY_LOG" || true

    # 3. 실패 원인 분석
    echo "3️⃣ 실패 원인 분석 중..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 복구 조치사항:"
    echo ""
    echo "Option 1: 코드 수정"
    echo "  - 테스트 로그를 확인하여 실패 원인 파악"
    echo "  - 구현 코드 수정 후 재테스트"
    echo "  - 명령: vim [실패한 파일] && pnpm test"
    echo ""
    echo "Option 2: 마지막 커밋으로 롤백"
    echo "  - git reset --hard HEAD"
    echo "  - 변경사항은 /tmp/test-failure-diff-${TIMESTAMP}.patch 에 저장됨"
    echo ""
    echo "Option 3: 테스트 케이스 재검토"
    echo "  - 테스트가 너무 엄격하거나 잘못 작성되었을 수 있음"
    echo "  - 명세(specs/)와 테스트 설계(claudedocs/) 재확인"
    echo ""
    ;;

  lint-error)
    echo "🔍 린트 에러 복구 시작"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. TypeScript 타입 체크
    echo "1️⃣ TypeScript 타입 체크..."
    pnpm lint:tsc 2>&1 | tee "$RECOVERY_LOG" || true

    # 2. ESLint 검사
    echo "2️⃣ ESLint 검사..."
    pnpm lint:eslint 2>&1 | tee -a "$RECOVERY_LOG" || true

    # 3. 자동 수정 시도
    echo "3️⃣ 자동 수정 시도 중..."
    echo ""
    echo "💡 복구 조치사항:"
    echo ""
    echo "Option 1: ESLint 자동 수정"
    echo "  - pnpm lint:eslint --fix"
    echo "  - 일부 린트 에러는 자동으로 수정 가능"
    echo ""
    echo "Option 2: 타입 에러 수정"
    echo "  - TypeScript 컴파일 에러는 수동 수정 필요"
    echo "  - 로그 파일 확인: cat $RECOVERY_LOG"
    echo ""
    echo "Option 3: 변경사항 롤백"
    echo "  - git diff를 확인하여 문제가 된 변경사항 파악"
    echo "  - git checkout -- [파일명] 으로 개별 파일 롤백"
    echo ""
    ;;

  commit-missing)
    echo "📦 커밋 누락 복구 시작"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. Git 상태 확인
    echo "1️⃣ Git 상태 확인..."
    git status

    # 2. 변경사항 확인
    echo ""
    echo "2️⃣ 변경사항 확인..."
    git diff --stat

    echo ""
    echo "💡 복구 조치사항:"
    echo ""
    echo "Option 1: commit-helper.sh 사용"
    echo "  - .claude/scripts/commit-helper.sh <AGENT> <MESSAGE>"
    echo "  - 예: .claude/scripts/commit-helper.sh 3 '시간 검증 테스트 작성'"
    echo ""
    echo "Option 2: 수동 커밋"
    echo "  - git add ."
    echo "  - git commit -m '<적절한 커밋 메시지>'"
    echo ""
    echo "⚠️ 주의: 반드시 올바른 커밋 패턴 준수"
    echo "  - Agent 1: docs:"
    echo "  - Agent 2: test: [DESIGN]"
    echo "  - Agent 3: test: [RED]"
    echo "  - Agent 4: feat: [GREEN]"
    echo "  - Agent 5: refactor: [REFACTOR]"
    echo "  - Agent 6: docs:"
    echo ""
    ;;

  refactor-failure)
    echo "🔄 리팩토링 실패 롤백 시작"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. 백업 생성
    echo "1️⃣ 현재 변경사항 백업..."
    git diff > "/tmp/refactor-backup-${TIMESTAMP}.patch"

    # 2. 마지막 커밋 정보
    echo "2️⃣ 마지막 커밋 정보..."
    git log -1 --oneline

    # 3. 테스트 실행
    echo "3️⃣ 테스트 실행하여 실패 확인..."
    pnpm test run 2>&1 | tee "$RECOVERY_LOG" || true

    echo ""
    echo "💡 복구 조치사항:"
    echo ""
    echo "⚠️ CRITICAL: 리팩토링 후 테스트가 깨졌습니다!"
    echo ""
    echo "Option 1: 즉시 롤백 (권장)"
    echo "  - git reset --hard HEAD"
    echo "  - 변경사항은 /tmp/refactor-backup-${TIMESTAMP}.patch 에 저장됨"
    echo "  - 나중에 적용: git apply /tmp/refactor-backup-${TIMESTAMP}.patch"
    echo ""
    echo "Option 2: 부분 롤백"
    echo "  - git diff로 변경사항 확인"
    echo "  - git checkout -- <파일명> 으로 개별 파일만 롤백"
    echo "  - 문제없는 리팩토링은 유지 가능"
    echo ""
    echo "Option 3: 수정 후 재시도"
    echo "  - 더 작은 단위로 리팩토링 재시도"
    echo "  - 각 단계마다 테스트 실행하여 검증"
    echo ""
    ;;

  dependency-error)
    echo "📦 의존성 에러 복구 시작"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. 패키지 정보 확인
    echo "1️⃣ package.json 확인..."
    cat package.json | grep -A 20 "dependencies"

    # 2. 설치 시도
    echo ""
    echo "2️⃣ 의존성 재설치 시도..."

    echo ""
    echo "💡 복구 조치사항:"
    echo ""
    echo "Option 1: 클린 인스톨"
    echo "  - rm -rf node_modules pnpm-lock.yaml"
    echo "  - pnpm install"
    echo ""
    echo "Option 2: 캐시 클리어"
    echo "  - pnpm store prune"
    echo "  - pnpm install"
    echo ""
    echo "Option 3: 버전 확인"
    echo "  - package.json의 의존성 버전 확인"
    echo "  - 호환되지 않는 버전이 있는지 검토"
    echo ""
    ;;

  *)
    echo "❌ 알 수 없는 에러 타입: $ERROR_TYPE"
    echo ""
    echo "사용 가능한 ERROR_TYPE:"
    echo "  test-failure"
    echo "  lint-error"
    echo "  commit-missing"
    echo "  refactor-failure"
    echo "  dependency-error"
    exit 1
    ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 복구 로그 저장 완료: $RECOVERY_LOG"
echo ""
echo "다음 단계:"
echo "1. 복구 조치사항 중 하나를 선택하여 실행"
echo "2. 문제 해결 후 품질 게이트 재실행"
echo "3. Agent 6 (Orchestrator)에게 재검증 요청"
