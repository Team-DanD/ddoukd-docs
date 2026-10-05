# DDoukD 디자인 시스템

흰 바탕과 가는 회색 선이 장부의 칸을 만들고, 보라 하나가 지금 할 행동과 지금 보는 곳을 가리킵니다. 사업장 운영자(사장·강사)가 수업 사이에 폰으로 쓰는 화면을 위한 시스템입니다.

2026-10-05에 운영자 화면의 톤을 **"A · 장부"**로 확정했습니다([결정 기록](../decisions.md)). 컴포넌트는 아직 구현하거나 실제 화면으로 검증하지 않은 **제안**입니다.

[브랜드 가이드](claude-design/project/README.md) · [토큰](tokens.json) · [CSS 변수](tokens.css) · [컴포넌트 CSS](claude-design/project/components/bundle.css) · [운영자 화면 컴포넌트 명세](components-operator.md) · [pen.dev 설정 가이드](pen-setup.md) · [이전 포스터 톤](archived/poster-v0.1/README.md)

## 왜 바꿨나

이전 톤(검정 2px 선, 흐림 없는 그림자, Anton 포스터 제목, 노랑과 보라)은 회원이 직접 예약하는 프로토타입 화면에서 뽑은 것입니다. 그 화면은 MVP 범위 밖입니다. MVP의 주 사용자는 사장과 강사이고, 화면의 대부분은 회원 목록, 회원권 잔여, 예약 기록 같은 장부입니다([mvp.md](../mvp.md)).

- 하루에 여러 번 여는 업무 화면에서 포스터 톤은 시끄럽습니다. 모든 요소가 같은 세기로 강조돼 숫자가 먼저 읽히지 않았습니다.
- 월정액으로 돈을 내고 믿고 쓸 장부로 보여야 합니다([strategy.md](../strategy.md)).
- 다음 확장 업종은 마사지·에스테틱입니다. 스포츠 포스터 톤은 맞지 않습니다.
- 로고 초안은 전부 둥글고 부드러운 쪽입니다.

## 톤 요약

| 항목 | 값 |
| --- | --- |
| 바탕 | 흰색. 보조 면은 `background-subtle` 한 단계 |
| 선 | 모두 1px. 구획 `border-strong`, 행 구분 `border-subtle`, 입력·보조 버튼 `border-control` |
| 모서리 | 버튼·입력 8px, 배지 4px. Radio·스위치·이니셜만 원형 |
| 그림자 | 없음. 떠 있는 면은 1px 선과 배경 가림막으로 구분 |
| 색 | 보라 하나(행동, 선택, 현재). 노쇼만 검정 면. 만료 임박만 주황 글자. 빨강은 오류 테두리·아이콘 전용 |
| 글자 | Noto Sans KR 하나. 400 / 500 / 700. 숫자는 tabular-nums |
| 목록 | 카드가 아니라 행. 행 60px 이상, 선으로 나눔 |
| 상태 | 1px 외곽선 배지. 면을 채우는 배지는 노쇼 하나 |
| 주 행동 | 화면 아래 고정 바에 하나 |

색, 글, 형태, 상태의 사용 규칙은 [브랜드 가이드](claude-design/project/README.md)에 있습니다. 컴포넌트별 규칙은 `claude-design/project/components/<이름>/README.md`에 있습니다.

## 파일 구성

| 경로 | 무엇 | 고치는 법 |
| --- | --- | --- |
| `tokens.json` | 토큰의 원본. 값, 쓰임, 대비 검사 목록 | 직접 고친다 |
| `tokens.css` | CSS 변수 | 생성 파일. 고치지 않는다 |
| `claude-design/project/tokens.json` | Claude Design용 토큰 | 생성 파일. 고치지 않는다 |
| `claude-design/project/README.md` | 브랜드 가이드 | 직접 고친다 |
| `claude-design/project/components/bundle.css` | 컴포넌트 CSS | 직접 고친다 |
| `claude-design/project/components/<이름>/` | 컴포넌트 설명(`README.md`)과 미리보기(`preview.html`) | 직접 고친다 |
| `scripts/build-tokens.py` | 생성과 검사 | |
| `components-operator.md` | 운영자 화면 컴포넌트의 동작·상태·접근성 명세 | 직접 고친다 |
| `ddoukd.pen` | pen.dev 원본. 변수 105개, 재사용 컴포넌트 44개, 시안 화면 3개 | pen.dev. 값은 `tokens.json`을 먼저 고친 뒤 맞춘다 |
| `archived/poster-v0.1/` | 이전 톤 전체(README, 토큰, 캡처 43개, 장식, 스크립트) | 보관. 고치지 않는다 |

토큰 이름은 pen 변수, CSS 변수, Claude Design 토큰에서 모두 같습니다. 예: `action-primary-background`, `text-secondary`, `space-16`.

## 토큰을 바꿀 때

```bash
# 1. design-system/tokens.json을 고친다
# 2. 생성 파일을 다시 만든다
python3 design-system/scripts/build-tokens.py
# 3. 대비와 생성물 상태를 확인한다 (파일을 쓰지 않음)
python3 design-system/scripts/build-tokens.py --check
```

`--check`는 `tokens.json`의 `contrast` 목록에 있는 글자·바탕 쌍이 기준을 넘는지, 생성 파일이 최신인지 봅니다. 새 색 조합을 쓰면 그 목록에 추가합니다.

`claude-design/project/` 폴더는 Claude Design의 "DDoukD" 디자인 시스템에 올리는 파일 그대로입니다. 저장소를 고친 뒤 그 폴더를 다시 올려 맞춥니다. Claude Design 페이지에서 직접 고치면 다음에 올릴 때 덮어쓰입니다.

## 컴포넌트

| 컴포넌트 | 화면 | 상태 |
| --- | --- | --- |
| Button, Badge | 운영자 폰 | 제안 |
| TextField, Textarea, Select, FormField, Checkbox, Radio, Switch | 운영자 폰 | 제안 |
| Tabs, DateStrip, AppShell | 운영자 폰 | 제안 |
| MemberRow, BookingRow | 운영자 폰 | 제안 |
| Modal, Toast, EmptyState | 운영자 폰 | 제안 |
| Table, Pagination | 운영자 PC 보기 | 제안 |
| MemberListScreen, MemberFormScreen, BookingsScreen | 운영자 폰 390px | 시안 조합 |

- 미리보기는 정적인 HTML과 CSS입니다. React나 React Native 구현이 아닙니다. 구현에 쓸 라이브러리는 PR #13의 조사 문서에서 다룹니다.
- hover, 1024px 분기, 표는 웹 전제입니다. 앱으로 옮길 때는 값(색, 간격, 모서리, 1px 선)만 그대로 쓰고 동작은 다시 정해야 합니다.
- 이전 톤에 있던 강도 배지, 정원 게이지, 대기 배지·버튼은 1:1 수업 범위에 없어 뺐습니다. 그룹 수업을 열 때 다시 만듭니다.

## 대비

`scripts/build-tokens.py --check`의 결과입니다(sRGB 상대 휘도, WCAG 2). 본문 글자는 4.5:1, 컨트롤 경계와 포커스 표시는 3:1이 기준입니다.

| 조합 | 대비 | 쓰는 곳 |
| --- | --- | --- |
| text-primary / background-canvas | 17.74:1 | 본문 |
| text-secondary / background-canvas | 4.83:1 | 설명, placeholder |
| text-secondary / background-subtle | 4.63:1 | 읽기 전용 필드, 표 머리글 |
| text-on-muted / background-current | 6.94:1 | 진행 중인 행의 보조 글자 |
| text-on-muted / action-disabled-background | 6.87:1 | 비활성 글자 |
| text-warn / background-canvas | 5.02:1 | 만료 임박 글자 |
| action-primary-foreground / action-primary-background | 6.68:1 | 주요 버튼 |
| status-booked-foreground / background-current | 8.09:1 | 진행 중인 행의 시각, 예약 배지 |
| status-muted-foreground / status-muted-background | 7.56:1 | 회색 배지 |
| border-control / background-canvas | 3.19:1 | 입력 필드와 보조 버튼의 경계 |
| feedback-error-border / background-canvas | 4.83:1 | 오류 테두리와 아이콘 |
| focus-color / background-canvas | 6.68:1 | 포커스 outline |

`text-secondary`는 옅은 보라 면(`background-current`) 위에서 4.44:1로 모자랍니다. 그 면에서는 `text-on-muted`를 씁니다. 구획선(`border-strong`)과 행 구분선(`border-subtle`)은 장식 선이라 3:1 기준을 적용하지 않았습니다.

Claude Design 시안의 입력 필드 테두리는 `#d1d5db`(1.47:1)였습니다. 컨트롤 경계 기준에 못 미쳐 `#8791a0`으로 올렸습니다. 시안보다 테두리가 조금 진합니다.

## 아직 이 톤으로 맞추지 않은 것

| 대상 | 상태 |
| --- | --- |
| `plans/backoffice-staff-auth/` | 화면 12개가 포스터 톤으로 그려져 있습니다(PR #11). 사업장 인증 화면은 새 톤으로 다시 그리고, 백오피스 화면은 아래 결정에 따라 범위를 다시 정해야 합니다 |
| `components-operator.md`의 컴포넌트별 수치 | 맨 위 공통 규칙과 변환표만 새 톤으로 고쳤습니다. 각 절의 2px, 그림자, 노랑 선택 서술은 변환표로 읽어야 합니다 |
| `ddoukd-web` 프로토타입 | 이전 톤의 원본입니다. 손대지 않았습니다 |

## pen 원본과 다른 점

`ddoukd.pen`은 화면 기획용이고 `claude-design/project/`는 미리보기와 규칙 문서입니다. 같은 토큰을 쓰지만 들어 있는 것이 조금 다릅니다.

| 항목 | pen | 이유 |
| --- | --- | --- |
| Table, Pagination, Select의 열린 목록, 불러오는 중 행 | 없음 | 폰 화면 기획에 먼저 필요한 것만 넣었습니다. 필요할 때 추가합니다 |
| hover, 누름, 비활성 전환 같은 상태 | 없음 | pen에 상태가 없습니다. 포커스는 TextField 예시 하나만 있습니다 |
| 너비·높이 | 숫자로 직접 입력 | pen은 너비·높이에 변수를 적용하지 않습니다 |
| 글자 스타일 | `text-<이름>-size`, `text-<이름>-line-height` 변수 | pen에 글자 스타일 묶음이 없습니다 |
| 배경 가림막 | `#11182780` | pen은 rgba 대신 8자리 hex를 씁니다 |
| 버튼 진행 중(스피너) | 없음 | 움직임을 그릴 수 없습니다 |
| 하단 바의 그만두기 1 : 저장 2 비율 | 그만두기 112px 고정 | pen에 비율 지정이 없습니다 |

이전 포스터 톤의 pen 원본은 `archived/poster-v0.1/ddoukd.pen`에 있습니다.

## 함께 정한 것 (2026-10-05)

- 운영자 화면에서 노랑을 쓰지 않습니다.
- 백오피스는 이 시스템의 컴포넌트를 쓰지 않습니다. 팀 내부 PC 화면이라 기성 UI 라이브러리로 만들고, 보라 하나만 맞춥니다. 고객이 보는 화면이 백오피스에 생기면 다시 봅니다.
- 이전 포스터 톤은 지우지 않고 `archived/poster-v0.1/`에 보관합니다.

## 확정되지 않은 것

- 공개 캘린더가 이 톤을 쓸지, 포스터 톤 변형을 쓸지. 샵별 로고·색 커스텀(후순위)과 함께 정합니다.
- 로고. 초안의 브랜드 색은 검정, 보라, 노랑입니다. 운영자 화면에서 노랑을 뺐으므로 로고와의 연결은 보라 하나입니다.
- 서체를 Pretendard로 바꿀지. 바꾸면 폰트 파일을 직접 실어야 합니다.
- 회원 목록의 이니셜 원형을 기본으로 켤지.
- 만료 임박으로 보는 기준 일수.
- 회원권 선택을 Select로 할지 버튼 묶음으로 할지.
- 상태 문구(예약, 완료, 노쇼, 취소, 만료)와 내비게이션 항목(예약, 회원, 회원권, 더보기). 시안의 예시입니다.
- 다크 테마.
- [운영자 명세의 미결 17건](components-operator.md#미결-사항). 제품 정책은 이 시스템이 정하지 않습니다.
