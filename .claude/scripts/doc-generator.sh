#!/bin/bash

# 문서 자동 생성 템플릿 스크립트
# 사용법: ./doc-generator.sh <AGENT> <FEATURE_NAME>
# 예시: ./doc-generator.sh 1 recurring-events
# 예시: ./doc-generator.sh 2 time-validation

set -e

AGENT=$1
FEATURE_NAME=$2
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -z "$AGENT" ] || [ -z "$FEATURE_NAME" ]; then
  echo "❌ 사용법: ./doc-generator.sh <AGENT> <FEATURE_NAME>"
  echo "AGENT: 1-6"
  echo "예시: ./doc-generator.sh 1 recurring-events"
  exit 1
fi

# Agent 번호 검증
if ! [[ "$AGENT" =~ ^[1-6]$ ]]; then
  echo "❌ Agent 번호는 1-6 사이여야 합니다"
  exit 1
fi

# Agent별 문서 디렉토리
DOC_DIR="claudedocs"
mkdir -p "$DOC_DIR"

# Agent별 문서 생성
case "$AGENT" in
  1)
    DOC_FILE="${DOC_DIR}/01-feature-design-${FEATURE_NAME}.md"
    echo "📝 Agent 1 명세 문서 생성: $DOC_FILE"

    cat > "$DOC_FILE" <<'EOF'
# 기능 설계 명세

**Agent**: Agent 1 (Feature Design)
**기능명**: ${FEATURE_NAME}
**작성일**: ${TIMESTAMP}
**상태**: 🚧 작성 중

---

## 1. 프로젝트 분석

### 1.1 기존 코드베이스 현황
- [ ] specs/ 디렉토리 구조 파악
- [ ] 관련 기존 명세 확인
- [ ] 의존성 분석

### 1.2 작업 범위 정의
**⚠️ 중요**: 새로운 기능 추가가 아닌, 명세 구체화 수준으로 진행

**범위 내**:
-

**범위 외**:
-

---

## 2. 요구사항 분석

### 2.1 기능 개요


### 2.2 주요 요구사항
1.
2.
3.

### 2.3 제약사항
-

---

## 3. Given-When-Then 시나리오

### 시나리오 1: [시나리오 이름]

**Given** (초기 상태):
-

**When** (사용자 행동):
-

**Then** (예상 결과):
-
- 예시 입력: `...`
- 예시 출력: `...`

---

## 4. 명세 품질 자체 검증 (v2.8.0)

각 항목마다 **3단계 근거**를 서술하세요:

### 1. ✅ 패턴 준수
- [ ] Given-When-Then 패턴을 모든 시나리오에 일관되게 적용했는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 2. ✅ 구체적 예시
- [ ] 구체적 입력값과 예시 결과값을 함께 제공했는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 3. ✅ 엣지 케이스
- [ ] 엣지 케이스와 예외 상황을 명시했는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 4. ✅ 테스트 가능성
- [ ] Agent 2가 즉시 테스트 설계 가능한 수준의 상세도인가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 5. ✅ 명세 범위 준수
- [ ] 명세 범위를 벗어나지 않았는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 6. ✅ 구현 가능성
- [ ] 기술적으로 구현 가능한가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 7. ✅ 예시 충분성
- [ ] 각 시나리오에 충분한 예시가 있는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 8. ✅ 수용 기준
- [ ] 명확한 수용 기준이 있는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

---

## 5. 다음 단계

- [ ] specs/${FEATURE_NAME}.md 파일 생성
- [ ] Git 커밋 (docs: ${FEATURE_NAME} 명세 작성)
- [ ] Agent 2에게 인계
EOF

    # 변수 치환
    sed -i.bak "s/\${FEATURE_NAME}/${FEATURE_NAME}/g" "$DOC_FILE"
    sed -i.bak "s/\${TIMESTAMP}/$(date '+%Y-%m-%d %H:%M:%S')/g" "$DOC_FILE"
    rm "${DOC_FILE}.bak"

    echo "✅ Agent 1 문서 생성 완료"
    ;;

  2)
    DOC_FILE="${DOC_DIR}/02-test-design-${FEATURE_NAME}.md"
    echo "📝 Agent 2 테스트 설계 문서 생성: $DOC_FILE"

    cat > "$DOC_FILE" <<'EOF'
# 테스트 설계 명세

**Agent**: Agent 2 (Test Design)
**기능명**: ${FEATURE_NAME}
**작성일**: ${TIMESTAMP}
**상태**: 🚧 작성 중

---

## 1. 명세 품질 검증 (v2.8.0)

**참조**: specs/${FEATURE_NAME}.md

각 항목마다 **3단계 근거**를 서술하세요:

### 1. ✅ 패턴 준수
- [ ] Given-When-Then 패턴이 일관되게 적용되었는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 2. ✅ 구체적 예시
- [ ] 구체적 예시가 포함되어 있는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 3. ✅ 엣지 케이스
- [ ] 엣지 케이스가 명시되어 있는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 4. ✅ 테스트 가능 여부
- [ ] 즉시 테스트 작성 가능한가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

### 5. ✅ 명세 범위 준수
- [ ] 명세 범위를 준수했는가?
  - 근거 (사실):
  - 근거 (평가):
  - 근거 (대안):

**검증 결과**:
- [ ] 모든 항목 통과 → Agent 3 진행
- [ ] 불완전 → Agent 1에게 피드백 (구체적 개선 요청)

---

## 2. 테스트 구조 설계

### 2.1 단위 테스트
**파일**: `src/__tests__/unit/easy.${FEATURE_NAME}.spec.ts`

**테스트 케이스**:
1.
2.
3.

### 2.2 훅 테스트 (필요 시)
**파일**: `src/__tests__/hooks/use${FEATURE_NAME}.spec.ts`

**테스트 케이스**:
1.
2.

### 2.3 통합 테스트 (필요 시)
**파일**: `src/__tests__/integration/${FEATURE_NAME}.integration.spec.tsx`

**시나리오**:
1.
2.

---

## 3. 테스트 데이터 설계

### 3.1 Mock 데이터
**파일**: `src/__tests__/__fixtures__/mock${FEATURE_NAME}.ts`

```typescript
// 예시
export const mockData = {
  // ...
};
```

### 3.2 테스트 헬퍼 함수


---

## 4. 다음 단계

- [ ] 테스트 구조 설계 문서 완성
- [ ] Fixtures 파일 생성
- [ ] Git 커밋 (test: [DESIGN] ${FEATURE_NAME} 테스트 구조 설계)
- [ ] Agent 3에게 인계
EOF

    # 변수 치환
    sed -i.bak "s/\${FEATURE_NAME}/${FEATURE_NAME}/g" "$DOC_FILE"
    sed -i.bak "s/\${TIMESTAMP}/$(date '+%Y-%m-%d %H:%M:%S')/g" "$DOC_FILE"
    rm "${DOC_FILE}.bak"

    echo "✅ Agent 2 문서 생성 완료"
    ;;

  3|4|5)
    if [ "$AGENT" = "3" ]; then
      PHASE="RED"
      AGENT_NAME="Red Phase"
    elif [ "$AGENT" = "4" ]; then
      PHASE="GREEN"
      AGENT_NAME="Green Phase"
    else
      PHASE="REFACTOR"
      AGENT_NAME="Refactor"
    fi

    DOC_FILE="${DOC_DIR}/0${AGENT}-${PHASE,,}-${FEATURE_NAME}.md"
    echo "📝 Agent $AGENT ($AGENT_NAME) 문서 생성: $DOC_FILE"

    cat > "$DOC_FILE" <<EOF
# ${AGENT_NAME} 단계

**Agent**: Agent $AGENT (${AGENT_NAME})
**기능명**: ${FEATURE_NAME}
**작성일**: $(date '+%Y-%m-%d %H:%M:%S')
**상태**: 🚧 작업 중

---

## 1. 참조 문서

- 명세: specs/${FEATURE_NAME}.md
- 테스트 설계: claudedocs/02-test-design-${FEATURE_NAME}.md

---

## 2. 작업 내역

### 2.1 파일 수정/생성


### 2.2 테스트 실행 결과

\`\`\`bash
# 실행 명령
pnpm test

# 결과
\`\`\`

---

## 3. 다음 단계

- [ ] Git 커밋
- [ ] 다음 Agent에게 인계
EOF

    echo "✅ Agent $AGENT 문서 생성 완료"
    ;;

  6)
    DOC_FILE="${DOC_DIR}/06-orchestrator-progress-${FEATURE_NAME}.md"
    echo "📝 Agent 6 진행 상황 문서 생성: $DOC_FILE"

    cat > "$DOC_FILE" <<'EOF'
# Orchestrator 진행 상황

**Agent**: Agent 6 (Orchestrator)
**기능명**: ${FEATURE_NAME}
**작성일**: ${TIMESTAMP}

---

## 1. 전체 진행 상황

| Agent | 상태 | 커밋 해시 | 비고 |
|-------|------|-----------|------|
| Agent 1 | ⏳ | - | 명세 작성 |
| Agent 2 | ⏳ | - | 테스트 설계 |
| Agent 3 | ⏳ | - | Red Phase |
| Agent 4 | ⏳ | - | Green Phase |
| Agent 5 | ⏳ | - | Refactor |
| Agent 6 | 🔄 | - | 품질 검증 |

---

## 2. 품질 검증 체크리스트

- [ ] 모든 Agent가 Git 커밋 수행
- [ ] 테스트 통과 확인
- [ ] 린트 검증 통과
- [ ] TDD 사이클 준수
- [ ] 문서 업데이트 완료

---

## 3. 발견된 이슈


---

## 4. 최종 상태

**종료 시각**:
**결과**:
EOF

    # 변수 치환
    sed -i.bak "s/\${FEATURE_NAME}/${FEATURE_NAME}/g" "$DOC_FILE"
    sed -i.bak "s/\${TIMESTAMP}/$(date '+%Y-%m-%d %H:%M:%S')/g" "$DOC_FILE"
    rm "${DOC_FILE}.bak"

    echo "✅ Agent 6 문서 생성 완료"
    ;;
esac

echo ""
echo "📄 생성된 문서: $DOC_FILE"
echo ""
echo "다음 단계:"
echo "1. 문서 내용 작성"
echo "2. Agent 작업 수행"
echo "3. Git 커밋"
