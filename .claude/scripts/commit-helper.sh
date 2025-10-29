#!/bin/bash

# Git 커밋 자동화 헬퍼 스크립트
# 사용법: ./commit-helper.sh <AGENT_NUMBER> <MESSAGE>
# 예시: ./commit-helper.sh 1 "반복 일정 명세 작성"

set -e

AGENT=$1
MESSAGE=$2

if [ -z "$AGENT" ] || [ -z "$MESSAGE" ]; then
  echo "❌ 사용법: ./commit-helper.sh <AGENT_NUMBER> <MESSAGE>"
  echo "예시: ./commit-helper.sh 1 \"반복 일정 명세 작성\""
  exit 1
fi

# Agent 번호 검증
if ! [[ "$AGENT" =~ ^[1-6]$ ]]; then
  echo "❌ Agent 번호는 1-6 사이여야 합니다"
  exit 1
fi

# 커밋 메시지 템플릿
declare -A COMMIT_PREFIXES=(
  [1]="docs"
  [2]="test: [DESIGN]"
  [3]="test: [RED]"
  [4]="feat: [GREEN]"
  [5]="refactor: [REFACTOR]"
  [6]="docs"
)

PREFIX="${COMMIT_PREFIXES[$AGENT]}"
FULL_MESSAGE="${PREFIX}: ${MESSAGE}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "📝 커밋 메시지:"
echo "$FULL_MESSAGE"
echo ""

# Git 상태 확인
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "📦 변경사항 스테이징..."
  git add .

  echo "✅ 커밋 생성 중..."
  git commit -m "$FULL_MESSAGE"

  echo ""
  echo "✅ 커밋 완료!"
  echo "커밋 해시: $(git rev-parse --short HEAD)"
else
  echo "⚠️ 커밋할 변경사항이 없습니다"
  exit 0
fi
