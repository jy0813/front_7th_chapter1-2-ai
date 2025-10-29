#!/bin/bash
# sync-doc-versions.sh
# 문서 버전 동기화 스크립트 v1.0.0
#
# 목적: 4개 주요 문서의 버전 및 날짜 동기화 자동화
# 대상 문서:
#   1. CLAUDE.md
#   2. WORKFLOW_RECURRING_EVENTS.md
#   3. claudedocs/agent-system-analysis-report.md
#   4. claudedocs/workflow-verification-report.md

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 주요 문서 경로
CLAUDE_MD="CLAUDE.md"
WORKFLOW_MD="WORKFLOW_RECURRING_EVENTS.md"
ANALYSIS_MD="claudedocs/agent-system-analysis-report.md"
VERIFICATION_MD="claudedocs/workflow-verification-report.md"

# 현재 날짜
TODAY=$(date +%Y-%m-%d)

# 함수: 버전 추출
extract_version() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "0.0.0"
    return
  fi

  # 다양한 버전 표기를 처리
  local version=$(grep -E "^\*\*문서 버전\*\*:|^\*\*버전\*\*:|^\*\*워크플로우 버전\*\*:" "$file" | head -1 | sed -E 's/.*: ([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

  if [ -z "$version" ]; then
    echo "0.0.0"
  else
    echo "$version"
  fi
}

# 함수: 날짜 추출
extract_date() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "N/A"
    return
  fi

  # 최종 업데이트 우선, 없으면 작성일 사용
  local date=$(grep -E "^\*\*최종 업데이트\*\*:" "$file" | head -1 | sed -E 's/.*: ([0-9]{4}-[0-9]{2}-[0-9]{2}).*/\1/')

  if [ -z "$date" ]; then
    date=$(grep -E "^\*\*작성일\*\*:" "$file" | head -1 | sed -E 's/.*: ([0-9]{4}-[0-9]{2}-[0-9]{2}).*/\1/')
  fi

  if [ -z "$date" ]; then
    echo "N/A"
  else
    echo "$date"
  fi
}

# 함수: 버전 비교
compare_versions() {
  local v1=$1
  local v2=$2

  if [ "$v1" = "$v2" ]; then
    echo "="
  else
    echo "!="
  fi
}

# 함수: 도움말 출력
print_help() {
  echo -e "${BLUE}sync-doc-versions.sh - 문서 버전 동기화 도구 v1.0.0${NC}"
  echo ""
  echo "사용법:"
  echo "  ./sync-doc-versions.sh [옵션]"
  echo ""
  echo "옵션:"
  echo "  --check              현재 버전 및 날짜 확인 (기본값)"
  echo "  --sync VERSION       모든 문서를 지정된 VERSION으로 동기화"
  echo "  --update-dates       모든 문서의 날짜를 오늘 날짜로 업데이트"
  echo "  --fix                버전 불일치 자동 수정 (CLAUDE.md 기준)"
  echo "  --help               이 도움말 출력"
  echo ""
  echo "예시:"
  echo "  ./sync-doc-versions.sh --check"
  echo "  ./sync-doc-versions.sh --sync 2.10.0"
  echo "  ./sync-doc-versions.sh --update-dates"
  echo "  ./sync-doc-versions.sh --fix"
}

# 함수: 버전 확인
check_versions() {
  echo -e "${BLUE}📊 문서 버전 동기화 스크립트 v1.0.0${NC}"
  echo "========================================"
  echo ""

  # 1. 현재 버전 추출
  echo -e "${BLUE}1️⃣  현재 버전 확인 중...${NC}"
  local claude_ver=$(extract_version "$CLAUDE_MD")
  local workflow_ver=$(extract_version "$WORKFLOW_MD")
  local analysis_ver=$(extract_version "$ANALYSIS_MD")
  local verification_ver=$(extract_version "$VERIFICATION_MD")

  local claude_date=$(extract_date "$CLAUDE_MD")
  local workflow_date=$(extract_date "$WORKFLOW_MD")
  local analysis_date=$(extract_date "$ANALYSIS_MD")
  local verification_date=$(extract_date "$VERIFICATION_MD")

  echo ""
  echo -e "📄 ${BLUE}CLAUDE.md${NC}: v$claude_ver ($claude_date)"
  echo -e "📄 ${BLUE}WORKFLOW_RECURRING_EVENTS.md${NC}: v$workflow_ver ($workflow_date)"
  echo -e "📄 ${BLUE}agent-system-analysis-report.md${NC}: v$analysis_ver ($analysis_date)"
  echo -e "📄 ${BLUE}workflow-verification-report.md${NC}: v$verification_ver ($verification_date)"
  echo ""

  # 2. 버전 일치 확인
  echo -e "${BLUE}2️⃣  버전 일치 여부 확인 중...${NC}"
  local has_version_mismatch=0
  local has_date_mismatch=0

  # 버전 불일치 확인
  if [ "$claude_ver" != "$workflow_ver" ]; then
    echo -e "${RED}❌ WORKFLOW_RECURRING_EVENTS.md 버전 불일치: v$workflow_ver (예상: v$claude_ver)${NC}"
    has_version_mismatch=1
  fi

  if [ "$claude_ver" != "$analysis_ver" ]; then
    echo -e "${RED}❌ agent-system-analysis-report.md 버전 불일치: v$analysis_ver (예상: v$claude_ver)${NC}"
    has_version_mismatch=1
  fi

  if [ "$claude_ver" != "$verification_ver" ]; then
    echo -e "${RED}❌ workflow-verification-report.md 버전 불일치: v$verification_ver (예상: v$claude_ver)${NC}"
    has_version_mismatch=1
  fi

  # 날짜 불일치 확인
  if [ "$claude_date" != "$TODAY" ] || [ "$workflow_date" != "$TODAY" ] || [ "$analysis_date" != "$TODAY" ] || [ "$verification_date" != "$TODAY" ]; then
    echo -e "${YELLOW}⚠️  날짜 불일치 감지 (오늘: $TODAY)${NC}"
    has_date_mismatch=1
  fi

  if [ $has_version_mismatch -eq 0 ] && [ $has_date_mismatch -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 문서 버전 및 날짜 일치${NC}"
    exit 0
  else
    echo ""
    if [ $has_version_mismatch -eq 1 ]; then
      echo -e "${YELLOW}📝 버전 수정: ./sync-doc-versions.sh --fix${NC}"
    fi
    if [ $has_date_mismatch -eq 1 ]; then
      echo -e "${YELLOW}📅 날짜 수정: ./sync-doc-versions.sh --update-dates${NC}"
    fi
    exit 1
  fi
}

# 함수: 날짜 업데이트
update_dates() {
  echo -e "${BLUE}📅 모든 문서 날짜를 $TODAY 로 업데이트 중...${NC}"
  echo ""

  # CLAUDE.md 날짜 업데이트
  if [ -f "$CLAUDE_MD" ]; then
    sed -i '' -E "s/\*\*최종 업데이트\*\*: [0-9]{4}-[0-9]{2}-[0-9]{2}/\*\*최종 업데이트\*\*: $TODAY/" "$CLAUDE_MD"
    echo -e "${GREEN}✅ $CLAUDE_MD 날짜 업데이트 완료${NC}"
  fi

  # WORKFLOW_RECURRING_EVENTS.md 날짜 업데이트
  if [ -f "$WORKFLOW_MD" ]; then
    sed -i '' -E "s/\*\*최종 업데이트\*\*: [0-9]{4}-[0-9]{2}-[0-9]{2}/\*\*최종 업데이트\*\*: $TODAY/" "$WORKFLOW_MD"
    echo -e "${GREEN}✅ $WORKFLOW_MD 날짜 업데이트 완료${NC}"
  fi

  # agent-system-analysis-report.md 날짜 업데이트
  if [ -f "$ANALYSIS_MD" ]; then
    sed -i '' -E "s/\*\*최종 업데이트\*\*: [0-9]{4}-[0-9]{2}-[0-9]{2}/\*\*최종 업데이트\*\*: $TODAY/" "$ANALYSIS_MD"
    echo -e "${GREEN}✅ $ANALYSIS_MD 날짜 업데이트 완료${NC}"
  fi

  # workflow-verification-report.md 날짜 업데이트
  if [ -f "$VERIFICATION_MD" ]; then
    sed -i '' -E "s/\*\*최종 업데이트\*\*: [0-9]{4}-[0-9]{2}-[0-9]{2}/\*\*최종 업데이트\*\*: $TODAY/" "$VERIFICATION_MD"
    echo -e "${GREEN}✅ $VERIFICATION_MD 날짜 업데이트 완료${NC}"
  fi

  echo ""
  echo -e "${GREEN}✨ 모든 문서 날짜 업데이트 완료!${NC}"
  echo ""
  echo "변경 사항 확인:"
  echo "  git diff $CLAUDE_MD"
  echo "  git diff $WORKFLOW_MD"
  echo "  git diff $ANALYSIS_MD"
  echo "  git diff $VERIFICATION_MD"
}

# 함수: 버전 동기화 (CLAUDE.md 기준)
sync_versions() {
  local target_version=$1

  echo -e "${BLUE}🔄 모든 문서를 v$target_version 으로 동기화 중...${NC}"
  echo ""

  # WORKFLOW_RECURRING_EVENTS.md 버전 업데이트
  if [ -f "$WORKFLOW_MD" ]; then
    sed -i '' -E "s/\*\*워크플로우 버전\*\*: [0-9]+\.[0-9]+\.[0-9]+/\*\*워크플로우 버전\*\*: $target_version/" "$WORKFLOW_MD"
    echo -e "${GREEN}✅ $WORKFLOW_MD 버전 업데이트: v$target_version${NC}"
  fi

  # agent-system-analysis-report.md 버전 업데이트
  if [ -f "$ANALYSIS_MD" ]; then
    sed -i '' -E "s/\*\*버전\*\*: [0-9]+\.[0-9]+\.[0-9]+/\*\*버전\*\*: $target_version/" "$ANALYSIS_MD"
    echo -e "${GREEN}✅ $ANALYSIS_MD 버전 업데이트: v$target_version${NC}"
  fi

  # workflow-verification-report.md는 내부에 버전 테이블이 있으므로 직접 업데이트하지 않음
  echo -e "${YELLOW}⚠️  $VERIFICATION_MD 는 수동 업데이트 필요 (버전 테이블)${NC}"

  echo ""
  echo -e "${GREEN}✨ 버전 동기화 완료!${NC}"
  echo ""
  echo "변경 사항 확인:"
  echo "  git diff $WORKFLOW_MD"
  echo "  git diff $ANALYSIS_MD"
}

# 함수: 자동 수정 (CLAUDE.md 기준)
auto_fix() {
  echo -e "${BLUE}🔧 자동 수정 시작 (CLAUDE.md 기준)${NC}"
  echo ""

  # CLAUDE.md 버전 추출
  local master_version=$(extract_version "$CLAUDE_MD")

  if [ "$master_version" = "0.0.0" ]; then
    echo -e "${RED}❌ CLAUDE.md에서 버전을 찾을 수 없습니다${NC}"
    exit 1
  fi

  echo -e "🎯 마스터 버전: ${GREEN}v$master_version${NC} (CLAUDE.md 기준)"
  echo ""

  # 버전 동기화
  sync_versions "$master_version"

  # 날짜 업데이트
  echo ""
  update_dates

  echo ""
  echo -e "${GREEN}✅ 자동 수정 완료!${NC}"
  echo ""
  echo "다음 단계:"
  echo "  1. git diff 로 변경사항 확인"
  echo "  2. git add <파일명> 으로 스테이징"
  echo "  3. git commit -m \"docs: 문서 버전 및 날짜 동기화\" 로 커밋"
}

# 메인 로직
main() {
  local command=${1:-"--check"}

  case "$command" in
    --help)
      print_help
      ;;
    --check)
      check_versions
      ;;
    --update-dates)
      update_dates
      ;;
    --sync)
      if [ -z "$2" ]; then
        echo -e "${RED}❌ 오류: 버전을 지정해주세요${NC}"
        echo "예시: ./sync-doc-versions.sh --sync 2.10.0"
        exit 1
      fi
      sync_versions "$2"
      ;;
    --fix)
      auto_fix
      ;;
    *)
      echo -e "${RED}❌ 알 수 없는 명령: $command${NC}"
      echo ""
      print_help
      exit 1
      ;;
  esac
}

# 스크립트 실행
main "$@"
