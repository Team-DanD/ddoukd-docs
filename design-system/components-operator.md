# 운영자 화면 컴포넌트 명세 (제안)

> 상태: **제안** · 2026-10-04 작성 · 2026-10-06 새 톤("A · 장부")으로 수치 갱신
> 기준 문서: [디자인 시스템 README](README.md) · [tokens.json](tokens.json) · [MVP 범위](../mvp.md) · [테넌트·계정](../spec/tenancy.md) · [데이터 모델](../spec/data-model.md) · [생애주기](../spec/lifecycle.md)

운영자 화면에 필요한 입력·목록·피드백 컴포넌트의 용도, 수치, 상태, 접근성을 정리한 명세입니다. MVP는 사업장 운영자 화면이므로, pen.dev로 화면 기획을 시작하고 구현할 때 기준으로 삼습니다. 시각 톤과 토큰은 [README](README.md)와 [tokens.json](tokens.json)이 기준입니다.

- 이 문서의 수치·상태·문구는 전부 **제안**입니다. 구현된 컴포넌트도, 캡처로 검증한 화면도 없습니다.
- 제품 정책·권한·회원권 규칙을 새로 확정하지 않습니다. 근거 문서에 없는 것은 각 절과 [미결 사항](#미결-사항)에 미결로 적었습니다.
- 토큰은 [tokens.json](tokens.json)의 이름으로 적었습니다. 컴포넌트 전용 크기는 전역 토큰이 아니라 이 문서의 표가 기준입니다([토큰](#토큰)).
- 운영자 화면은 **폰 기준**으로 먼저 설계합니다([mvp.md](../mvp.md)). 백오피스는 이 디자인 시스템 밖입니다([decisions.md](../decisions.md) 2026-10-05).

## 톤 변경 안내

이 문서는 이전 포스터 톤(검정 2px 선, 흐림 없는 그림자, 노랑 선택)을 전제로 처음 쓰였습니다. 2026-10-05에 운영자 화면의 톤이 "A · 장부"로 바뀌어, 2026-10-06에 각 절의 수치와 토큰 이름을 새 톤으로 고쳤습니다. 용도, 상태, 동작, 접근성, 미결 사항은 그대로입니다.

- 토큰 이름은 [tokens.json](tokens.json)의 kebab-case 이름입니다(`border-control`, `space-16`). 글자 크기는 글자 스타일 이름(`control`, `row-title`)으로 적었습니다.
- pen 원본과 미리보기 CSS에 아직 없는 것이 이 문서에는 있습니다(DatePicker 패널, 사이드바, 부분 선택, 스켈레톤 등). 명세가 앞서 있는 부분이며 구현 때 채웁니다.
- 백오피스는 이 디자인 시스템 밖입니다. 이 문서의 대상은 사업장 운영자 화면과 공개 캘린더입니다.

## 공통 규칙

아래는 이 문서의 모든 컴포넌트에 적용되는 기본값입니다.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 모서리 | 버튼·입력 8px, 배지 4px. Radio·스위치·이니셜만 원형 | `radius-control`, `radius-badge`, `radius-signal` |
| 테두리 | 모두 1px. 입력과 보조 버튼은 바탕과 3:1 이상인 회색 | `border-strong`, `border-subtle`, `border-control` |
| 그림자 | 없음 | — |
| 주요 행동·선택 | 보라 면 + 흰 글자 | `action-primary-*`, `selection-*` |
| 포커스 | 보라 2px outline + 2px offset. `:focus-visible`에만 표시 | `focus-color`, `focus-outline-width` |
| 클릭 영역 | 최소 44 × 44px | `hit-target-min` |
| 글자 | 라벨 최소 12px. 입력 글자 16px | `label`, `control` |
| 간격 | 4px 기반 스케일 | `space-*` |
| 모션 | 전환 150ms, 펼침 300ms. `prefers-reduced-motion`에서는 제거 | `motion-fast`, `motion-slow` |

**그림자를 쓰지 않습니다.** 입력과 행동은 그림자가 아니라 면으로 구분합니다. 주요 행동은 보라 면, 입력은 흰 면에 회색 테두리입니다. Modal, Toast, Select 목록은 1px 선과 배경 가림막으로 떠 있음을 표시합니다.

**포커스.** outline은 테두리와 독립적으로 그립니다. 오류 상태의 빨간 테두리 위에서도 보라 outline이 함께 보여야 합니다. 스크롤 컨테이너에 잘리는 표 행처럼 바깥 offset을 둘 수 없는 곳만 안쪽 outline(`outline-offset: -2px`)을 예외로 허용합니다. 포커스 색의 대비는 흰 면에서 6.68:1, 진행 중인 행의 옅은 보라 면에서 6.13:1입니다([README의 대비 표](README.md#대비)). 보라 면 위에서는 `focus-color-on-brand`를 씁니다.

**색만으로 의미를 전달하지 않습니다.** 오류는 아이콘 + 문구, 선택은 체크·위치·`aria-*`, 상태 배지는 문구를 항상 함께 둡니다.

**비활성.** 입력 계열도 `action-disabled-background` / `action-disabled-foreground`를 씁니다(6.87:1). 테두리는 `action-disabled-border`로 낮춥니다. 실제 `disabled` 속성을 쓰고, 왜 비활성인지는 도움말로 적습니다.

**대비.** 현재 토큰의 대비는 [README의 대비 표](README.md#대비)에 있습니다. `python3 design-system/scripts/build-tokens.py --check`로 다시 계산합니다.

## 컴포넌트 목록

| 컴포넌트 | 한 줄 용도 |
| --- | --- |
| [TextField](#textfield) | 한 줄 입력. 텍스트·전화번호·비밀번호·검색 변형 |
| [Textarea](#textarea) | 여러 줄 입력. 회원 메모 |
| [Select](#select) | 정해진 목록에서 하나 선택 |
| [Checkbox · Radio · Switch](#checkbox--radio--switch) | 켜고 끄기, 여러 개 중 선택 |
| [DatePicker · TimePicker](#datepicker--timepicker) | 수업 날짜·시각 입력 |
| [Form 레이아웃](#form-레이아웃) | 라벨·도움말·오류·제출 영역의 배치 |
| [Table · List](#table--list) | 회원·예약·shop 목록. 모바일은 리스트 |
| [StatusBadge](#statusbadge-목록에서-쓰는-상태-표시) | 예약·수업 상태 표시(Table·List의 부속) |
| [Tabs](#tabs) | 같은 화면 안의 패널 전환 |
| [Modal · Dialog · 확인창](#modal--dialog--확인창) | 화면 위 작업, 되돌릴 수 없는 행동의 확인 |
| [Toast](#toast) | 완료·실패의 짧은 알림 |
| [EmptyState](#emptystate) | 빈 목록·검색 결과 없음·오류 |
| [Pagination](#pagination) | 목록 페이지 이동 |
| [AppShell](#appshell) | shop-key 헤더와 내비게이션 |

버튼의 변형(primary, secondary, danger, disabled)과 규칙은 `claude-design/project/components/Button/README.md`에 있습니다. `danger`의 색은 제안값입니다.

---

## TextField

**용도.** 한 줄 값을 입력받습니다. 샵 이름, shop-key, 이름, email, 전화번호, 비밀번호, 검색어, 정원 같은 숫자.

**구조.**

```
[라벨]                              ← Form 레이아웃 소관
┌──────────────────────────────────┐
│ (앞 요소) 입력 값        (뒤 요소) │  ← 필드 상자
└──────────────────────────────────┘
[도움말 또는 오류]                    ← Form 레이아웃 소관
```

- 앞 요소: 아이콘(검색) 또는 고정 접두(`<도메인>/`)
- 뒤 요소: 지우기, 비밀번호 보기, 복사 같은 아이콘 버튼 또는 스피너

**수치.**

| 항목 | 값 |
| --- | --- |
| 높이 | 최소 48px (`control-min-height`) |
| 가로 패딩 | 12px. 앞·뒤 요소와 입력 값 사이 8px |
| 글자 | 16px / 1.4 (`control`). 숫자는 tabular-nums |
| 테두리 | 1px `border-control`, 모서리 8px (`radius-control`). 테두리 색은 바탕과 3:1 이상 |
| 그림자 | 없음 |
| 아이콘 | 20px. 버튼이면 클릭 영역 44 × 44px(필드 안쪽 높이를 그대로 채움) |
| 폭 | 부모 폭 100%. 폼 최대 폭은 [Form 레이아웃](#form-레이아웃) |

입력 글자를 16px로 두는 이유는 iOS Safari가 16px 미만 입력에 포커스할 때 화면을 확대하기 때문입니다. 폰 기준 화면이라 기본값으로 둡니다.

**상태.**

| 상태 | 면 | 테두리 | 글자 | 그 밖 |
| --- | --- | --- | --- | --- |
| default | `background-canvas` | 1px `border-control` | `text-primary`, placeholder는 `text-secondary` | — |
| hover | `background-subtle` | 동일 | 동일 | 포인터 기기에서만 |
| focus | `background-canvas` | 동일 | 동일 | 보라 2px outline + 2px offset |
| error | `feedback-error-background` | 1px `feedback-error-border` | `feedback-error-foreground` | 아래에 오류 아이콘 + 문구. `aria-invalid="true"` |
| disabled | `action-disabled-background` | 1px `action-disabled-border` | `action-disabled-foreground` | `disabled` 속성. 뒤 요소 버튼도 비활성 |
| read-only | `background-subtle` | 1px `border-strong` | `text-primary` | `readonly` 속성. hover 변화 없음. 선택·복사 가능 |
| loading | default와 동일 | 동일 | 동일 | 뒤 요소 자리에 20px 스피너. 입력은 계속 가능. `aria-busy="true"` |

**변형.**

| 변형 | 속성 | 구성 | 메모 |
| --- | --- | --- | --- |
| 텍스트 | `type="text"` | 기본 | email은 `type="email"` + `autocomplete="username"`, 숫자(정원)는 `inputmode="numeric"` |
| 접두 | — | 앞 요소에 `<도메인>/` 고정 문자열. `background-subtle` 면 + 오른쪽 1px 구분선 | shop-key 입력용. 규칙(소문자 영숫자·하이픈, 3~30자, 예약어 금지)은 [tenancy.md 2절](../spec/tenancy.md)을 도움말에 그대로 옮기고, 대문자는 입력 시 소문자로 바꿉니다 |
| 전화번호 | `type="tel"`, `inputmode="tel"`, `autocomplete="tel"` | 기본 | 같은 샵 안에서 중복 불가(`(shop_id, phone)` unique). 중복은 error 상태 + 문구로 표시 |
| 비밀번호 | `type="password"` | 뒤 요소에 보기/숨기기 토글 | 로그인은 `autocomplete="current-password"`, 변경은 `new-password`. 토글은 `aria-pressed`와 "비밀번호 보기" 라벨 |
| 검색 | `type="search"`, `role="searchbox"` | 앞 요소 검색 아이콘, 값이 있으면 뒤 요소에 지우기 버튼 | 결과 수 변화는 `role="status"` 영역으로 알림. 조회 중에는 loading |
| 1회 표시(읽기 전용 + 복사) | `readonly` | 뒤 요소에 복사 버튼 | shop 생성 완료 화면의 URL·ID·임시 비밀번호. 복사하면 Toast로 알림. 임시 비밀번호는 다시 볼 수 없다는 안내를 필드 아래에 둡니다([tenancy.md 1절](../spec/tenancy.md)) |

**접근성.**

- 보이는 `<label>`을 `for`/`id`로 연결합니다. placeholder를 라벨 대신 쓰지 않습니다
- 도움말·오류는 `aria-describedby`로 연결합니다
- 뒤 요소 버튼은 각각 접근 가능한 이름을 가집니다("지우기", "비밀번호 보기", "복사")
- 붙여넣기를 막지 않습니다(비밀번호 포함)

**사용 토큰.** `background-canvas`, `background-subtle`, `text-primary`, `text-secondary`, `border-control`, `border-strong`, `feedback-error-*`, `action-disabled-*`, `focus-color`, `radius-control`, `space-8`, `space-12`, `control-min-height`, 글자 스타일 `control`

**미결.** 전화번호 저장 형식(하이픈 유무)과 자동 하이픈 표시, 비밀번호 규칙(최소 길이·조합), 비밀번호 변경 시 현재 비밀번호·확인 입력 요구 여부, 검색 대상(이름·전화번호)과 서버 검색 여부, 아이콘 세트.

---

## Textarea

**용도.** 여러 줄 자유 입력. 현재 대상은 회원 메모(`member.memo`) 하나입니다.

**구조.** 필드 상자 + (선택) 오른쪽 아래 글자 수.

**수치.**

| 항목 | 값 |
| --- | --- |
| 높이 | 최소 120px. 내용에 따라 늘어나고 최대 320px부터 내부 스크롤 |
| 패딩 | 12px |
| 글자 | 16px / 1.6 (`control` 크기에 본문 줄높이) |
| 테두리 | TextField와 동일(1px, 모서리 8px, 그림자 없음) |
| 크기 조절 | 세로만(`resize: vertical`). 모바일에서는 자동 높이만 |

**상태.** TextField의 default / hover / focus / error / disabled / read-only와 같습니다. loading(저장 중)은 필드를 잠그지 않고 저장 버튼 쪽에 표시합니다.

**접근성.** 라벨·도움말 연결은 TextField와 같습니다. 글자 수 제한이 있으면 남은 글자 수를 `aria-describedby`로 연결하고, 초과 직전에만 `role="status"`로 알립니다.

**사용 토큰.** TextField와 동일.

**미결.** `member.memo`는 단일 필드라 저장하면 덮어씁니다([data-model.md](../spec/data-model.md)). 그래서 자동 저장 대신 **명시적 저장 버튼**을 제안하지만 확정은 아닙니다. 최대 글자 수, 저장하지 않고 나갈 때의 확인창 여부, 시간순 메모(`member_note`) 전환 시의 화면은 미결입니다.

---

## Select

**용도.** 정해진 목록에서 하나를 고릅니다. 서비스·강사(수업 개설, 예약 추가).

**구조.** TextField와 같은 필드 상자 + 뒤 요소에 아래 방향 화살표 20px. 펼치면 옵션 목록.

**수치.**

| 항목 | 값 |
| --- | --- |
| 트리거 | TextField와 동일(높이 48px, 패딩 12px, 1px 테두리) |
| 목록(커스텀일 때) | 트리거 아래 4px, 폭은 트리거와 같게. 1px `border-control`, 모서리 8px, 그림자 없음, 면 `background-canvas` |
| 옵션 | 높이 최소 44px, 가로 패딩 12px, 글자 16px |
| 목록 최대 높이 | 옵션 6개(264px)까지 보이고 그 이상은 내부 스크롤 |
| 레이어 | `layer-popover` |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default / hover / focus / error / disabled | TextField와 동일 |
| 열림 | 트리거에 `aria-expanded="true"`, 화살표 뒤집힘 |
| 옵션 hover·키보드 활성 | `background-subtle` 면 |
| 옵션 선택됨 | 굵은 글자 + 왼쪽에 보라 체크 아이콘(`selection-indicator`). 면은 칠하지 않음 |
| loading | 옵션을 불러오는 동안 트리거 뒤 요소에 스피너, 목록 자리에 "불러오는 중" |
| 옵션 없음 | 목록 대신 한 줄 안내 + (가능하면) 만들러 가는 링크 |

**동작 제안.** 폰에서는 **네이티브 `<select>`** 를 기본으로 씁니다. OS 선택기가 한 손 조작과 접근성을 이미 해결하기 때문입니다. 커스텀 목록은 PC 보기나 옵션에 보조 정보(강사 표시명 등)를 함께 보여줘야 할 때만 씁니다.

회원처럼 **수가 많고 검색이 필요한 대상은 Select로 만들지 않습니다.** 검색 TextField + List를 Modal(모바일 시트)에 담은 "선택 시트" 패턴으로 구성합니다. 예약 생성의 회원 선택이 이 경우입니다.

**접근성.** 커스텀 목록은 `role="combobox"` 트리거 + `role="listbox"` / `role="option"`, `aria-selected`, 방향키·Home·End·글자 입력 탐색, Esc로 닫고 트리거로 포커스 복귀를 지킵니다.

**사용 토큰.** TextField의 토큰 + `selection-indicator`, `layer-popover`

**미결.** 타임존 선택 목록의 범위(전체 IANA 목록 또는 소수 고정). 기본값 `Asia/Seoul`만 근거가 있습니다.

---

## Checkbox · Radio · Switch

**용도.**

| 컴포넌트 | 쓰는 때 |
| --- | --- |
| Checkbox | 폼 안의 예/아니오, 여러 개 선택. **저장 버튼을 눌러야 반영**되는 값 |
| Radio | 2~5개 중 하나 선택. 선택지가 모두 보여야 할 때 |
| Switch | **누르는 즉시 반영**되는 켜고 끄기. 예: 개설된 수업의 공개 여부(`is_public`) |

Checkbox와 Switch를 같은 값에 섞어 쓰지 않습니다. 수업 개설 폼 안에서는 Checkbox("공개 캘린더에 공개"), 이미 만들어진 수업의 상세에서는 Switch라는 구분을 제안합니다.

**구조.** 컨트롤 + 오른쪽 라벨. (선택) 라벨 아래 도움말. 라벨까지 포함한 줄 전체가 클릭 영역입니다.

**수치.**

| 항목 | Checkbox | Radio | Switch |
| --- | --- | --- | --- |
| 컨트롤 크기 | 24 × 24px | 24 × 24px 원형 | 트랙 48 × 28px, 손잡이 20 × 20px |
| 테두리 | 1px `border-control`, 모서리 4px (`radius-badge`) | 1px `border-control`, `radius-signal` | 트랙 1px `border-control`, `radius-signal`. 손잡이도 원형 |
| 선택 표시 | 보라 면에 흰 체크(선 두께 2px) | 보라 면에 가운데 10px 흰 점 | 손잡이가 오른쪽으로 이동(트랙 안쪽 여백 3px) |
| 라벨 | 14px / 1.6 (`body`), 컨트롤과 12px | 동일 | 동일 |
| 줄 높이(클릭 영역) | 최소 44px | 최소 44px | 최소 44px |
| 항목 간 간격 | 세로 0(줄 높이 44px가 간격 역할), 가로 배치는 24px | 동일 | — |

**상태.**

| 상태 | Checkbox · Radio | Switch |
| --- | --- | --- |
| 꺼짐 | 면 `background-canvas` | 트랙 `action-disabled-background`, 흰 손잡이 왼쪽 |
| 켜짐 | 면 `selection-background`, 표시 `selection-foreground` | 트랙 `selection-background`, 흰 손잡이 오른쪽 |
| 부분 선택(Checkbox) | 면 `selection-background` + 흰 가로 막대 | — |
| hover | 꺼짐 상태의 면이 `background-subtle` | 동일 |
| focus | 컨트롤에 보라 2px outline + 2px offset | 동일 |
| error | 컨트롤 테두리 `feedback-error-border`, 그룹 아래 오류 문구 | — |
| disabled | 면 `action-disabled-background`, 테두리 `action-disabled-border`, 라벨 `action-disabled-foreground` | 동일 |
| loading | — | 서버 반영 중: 손잡이 안에 스피너, `aria-busy`, 중복 조작 차단. 실패하면 원래 위치로 되돌리고 Toast로 알림 |

**접근성.**

- 네이티브 `<input type="checkbox|radio">`를 쓰고 모양만 바꿉니다. Switch는 `role="switch"` + `aria-checked`
- Radio·Checkbox 그룹은 `<fieldset>` + `<legend>`로 묶습니다. Radio는 방향키로 이동합니다
- Switch는 색만으로 상태를 전달하지 않도록 손잡이 위치에 더해 "공개" / "비공개" 같은 상태 문구를 옆에 둡니다
- 선택지가 2~4개이고 짧으면 Radio 대신 기존 ClassFilter와 같은 버튼형 단일 선택도 쓸 수 있습니다

**사용 토큰.** `background-canvas`, `background-subtle`, `selection-*`, `border-control`, `feedback-error-border`, `action-disabled-*`, `focus-color`, `radius-badge`, `radius-signal`, 글자 스타일 `body`

**미결.** 수업 공개 전환을 즉시 반영(Switch)으로 할지 확인 단계를 둘지는 미결입니다. Radio와 스위치를 원형으로 두는 것은 새 톤(둥근 모서리)에서 예외가 아닙니다.

---

## DatePicker · TimePicker

**용도.** 수업 개설의 시작 날짜·시각 입력. 예약 생성에서 세션이 없어 즉석으로 만들 때(ad-hoc)의 날짜·시각 입력. 일정 화면의 **날짜 이동**은 이 컴포넌트가 아니라 DateStrip(7일 띠)을 씁니다.

**구조.**

- 트리거: TextField와 같은 필드 상자. 뒤 요소에 달력 또는 시계 아이콘 20px
- 달력 패널(커스텀일 때): 머리글(이전 달 · `2026년 10월` · 다음 달) + 요일 줄 + 날짜 격자 7열
- 시각 목록(커스텀일 때): Select의 목록과 같은 모양

**수치.**

| 항목 | 값 |
| --- | --- |
| 트리거 | TextField와 동일. 날짜와 시각을 나란히 둘 때 간격 12px, 360px 폭에서는 세로로 쌓음 |
| 패널 | 1px `border-control`, 모서리 8px, 그림자 없음, 패딩 12px, `layer-popover`. 모바일은 하단 시트 |
| 날짜 칸 | 44 × 44px, 글자 14px, tabular-nums. 패널 폭 = 44 × 7 + 패딩 24 + 테두리 2 = 334px |
| 머리글 | 높이 44px. 이전·다음 버튼 44 × 44px, 연·월은 글자 스타일 `title` |
| 요일 줄 | 높이 32px, 12px `text-secondary` |

**상태.**

| 상태 | 표현 |
| --- | --- |
| 트리거 default / hover / focus / error / disabled | TextField와 동일 |
| 날짜 칸 default | `background-canvas`, `text-primary` |
| 날짜 칸 hover | `background-subtle` |
| 오늘 | 1px `border-control` 테두리 + `aria-current="date"` |
| 선택됨 | `selection-background` + `selection-foreground`, 모서리 8px, `aria-selected="true"` |
| 선택 불가 | `action-disabled-foreground`, `aria-disabled="true"`. 취소선으로 한 번 더 구분 |
| 다른 달의 날짜 | 표시하지 않음(빈 칸) |
| loading | 강사 가용시간 등을 불러와 후보를 제한할 때 패널에 스피너. 값 입력 자체는 막지 않음 |

**동작 제안.**

- 폰에서는 **네이티브 `<input type="date">` / `<input type="time">`** 을 기본으로 씁니다. 커스텀 패널은 PC 또는 선택 불가 날짜를 보여줘야 할 때만 씁니다
- 표시는 샵 타임존(`shop.timezone`) 기준입니다. 타임존이 `Asia/Seoul`이 아닌 샵에서는 필드 도움말에 타임존을 적습니다
- 종료 시각은 입력받지 않고 서비스의 소요 시간(`service.duration_minutes`)으로 계산해 읽기 전용으로 보여줍니다([data-model.md](../spec/data-model.md))
- 날짜와 시각은 각각의 필드로 두고 하나의 `<fieldset>`("수업 시작")으로 묶습니다

**접근성.** 달력 격자는 `role="grid"`, 방향키로 날짜 이동, PageUp/PageDown으로 달 이동, Enter로 선택, Esc로 닫고 트리거로 포커스 복귀. 직접 입력(`2026-10-04`)도 허용합니다. 형식 오류는 Form 오류 규칙을 따릅니다.

**사용 토큰.** TextField의 토큰 + `selection-*`, `text-secondary`, `layer-popover`, 글자 스타일 `title`, `label`

**미결.** 시각 입력 단위(5·10·30분), 지난 날짜·시각으로 수업을 개설할 수 있는지(예약은 `start_at > now()`만 가능), 강사 가용시간(`staff_availability`) 밖의 시각을 막을지 경고만 할지, 강사 시간 겹침 오류의 표시 방식.

---

## Form 레이아웃

**용도.** 라벨·컨트롤·도움말·오류와 제출 영역을 한 가지 방식으로 배치합니다.

**구조.**

```
폼
 ├─ (서버 오류 요약)                 role="alert"
 ├─ 섹션 제목 (선택)
 │   ├─ 필드
 │   │   ├─ 라벨  (선택 항목이면 "(선택)")
 │   │   ├─ 컨트롤
 │   │   └─ 도움말 또는 오류 문구   ← 오류가 있으면 도움말 자리를 대체하지 않고 위에 추가
 │   └─ 필드 ...
 └─ 제출 영역: 주 버튼 + (보조 버튼)
```

**수치.**

| 항목 | 값 |
| --- | --- |
| 라벨 | 14px / 1.4 / 700 (`field-label`), `text-primary`. 컨트롤 위, 간격 8px |
| 도움말 | 12px / 1.4 (`caption`), `text-secondary`. 컨트롤 아래 8px |
| 오류 문구 | 12px / 1.4 (`caption`), `feedback-error-foreground`. 앞에 16px 오류 아이콘(`feedback-error-border` 색), 아이콘과 4px |
| 필드 간 간격 | 20px |
| 섹션 간 간격 | 32px. 섹션 제목은 글자 스타일 `title`(18px / 1.3) |
| 폼 폭 | 모바일 100%(화면 가로 여백 16px). PC는 최대 480px(`form-max-width`) 한 열 |
| 제출 영역 | 주 버튼은 최소 높이 48px, 그림자 없음. 모바일은 화면 하단 고정 바에 두고 위쪽 1px `border-strong` 구분선 + safe-area 여백. 버튼이 둘이면 그만두기 1 : 저장 2 비율. PC는 폼 끝에 오른쪽 정렬, 버튼 간격 12px |

한 열 배치를 기본으로 합니다. 날짜 + 시각처럼 한 값을 이루는 짝만 나란히 둡니다.

**상태.**

| 상태 | 동작 |
| --- | --- |
| default | 주 버튼 활성. 필수 값이 비어 있어도 버튼을 비활성으로 두지 않고, 제출 시 오류로 알려줍니다 |
| 필드 error | 해당 컨트롤 error 상태 + 오류 문구. 검증 시점은 필드를 떠날 때(blur)와 제출 시. 입력 중에는 오류를 새로 띄우지 않고, 이미 뜬 오류는 고치는 즉시 지웁니다 |
| 제출 중(loading) | 주 버튼 loading(스피너 + 진행 문구, 폭 유지, `aria-busy`). 중복 제출 차단. 입력 값은 유지 |
| 제출 실패 | 필드에 귀속되는 오류는 그 필드에, 그 밖의 오류는 폼 맨 위 요약에 표시. 입력 값은 지우지 않습니다 |
| 제출 성공 | 다음 화면으로 이동하거나 Toast. 같은 화면에 머물면 포커스를 결과 위치로 옮깁니다 |
| disabled | 폼 전체가 읽기 전용이면 컨트롤을 read-only로 두고 제출 영역을 숨깁니다 |

**서버 오류 요약.** 폼 맨 위에 둡니다. 면 `feedback-error-background`, 1px `feedback-error-border`, 모서리 8px, 글자 `feedback-error-foreground`, 패딩 12px 16px, 앞에 오류 아이콘 20px. 예: 예약 생성의 409(정원 마감·닫힌 수업·지난 수업 — [lifecycle.md 4절](../spec/lifecycle.md)).

**접근성.**

- 필수 표시는 색이나 `*` 단독으로 하지 않습니다. 대부분이 필수이므로 **선택 항목에만 "(선택)"** 을 붙이고 필수 필드에는 `aria-required="true"`를 둡니다
- 제출 시 오류가 있으면 첫 오류 필드로 포커스를 옮기고, 오류 요약은 `role="alert"`로 알립니다
- 오류 문구는 무엇이 잘못됐고 어떻게 고치는지를 적습니다("전화번호 형식이 올바르지 않아요"보다 "숫자만 10~11자리로 입력해주세요")
- `autocomplete` 값을 지정합니다(로그인 `username`·`current-password`, 변경 `new-password`). 회원 등록의 이름·전화번호는 운영자 본인의 정보가 채워지지 않도록 `autocomplete="off"`
- Enter 제출은 한 줄 필드에서만 동작하고 Textarea에서는 줄바꿈입니다

**사용 토큰.** `text-primary`, `text-secondary`, `feedback-error-*`, `border-strong`, `space-4`, `space-8`, `space-12`, `space-16`, `space-20`, `space-32`, `form-max-width`, 글자 스타일 `field-label`, `caption`, `title`

**미결.** 서버 오류 응답 형식(필드별 오류 코드)이 정해지지 않아 필드 귀속 규칙은 가정입니다. 저장하지 않고 화면을 떠날 때의 확인창 적용 범위도 미결입니다.

---

## Table · List

**용도.** 여러 건을 훑어보고 한 건으로 들어갑니다. 회원 목록, 예약 목록.

**어느 것을 쓰나.**

| 화면 폭 | 구성 | 대상 |
| --- | --- | --- |
| 1024px 미만 | List | 회원 목록, 예약 목록 (운영자 화면의 기본) |
| 1024px 이상 | Table | 회원·예약 목록의 PC 보기 |

같은 데이터를 폭에 따라 다른 구조로 보여줍니다. Table을 가로 스크롤로 폰에 밀어 넣지 않습니다.

### Table

**구조.** 표 상자 > 머리글 행 > 본문 행 > (아래) Pagination. 행 전체가 상세로 가는 링크이고, 행 안의 개별 행동은 마지막 열의 아이콘 버튼으로 분리합니다.

| 항목 | 값 |
| --- | --- |
| 표 상자 | 1px `border-strong`, 모서리 8px, 그림자 없음, 면 `background-canvas` |
| 머리글 행 | 높이 40px, 면 `background-subtle`, 글자 12px / 1.4 / 700 `text-secondary`, 아래 1px `border-strong` |
| 본문 행 | 최소 높이 48px, 행 사이 1px `border-subtle` |
| 셀 패딩 | 세로 12px, 가로 16px |
| 본문 글자 | 14px / 1.6 (`body`). 날짜·시각·전화번호는 tabular-nums |
| 정렬 | 텍스트 왼쪽, 숫자 오른쪽, 상태 배지 왼쪽 |
| 행 행동 버튼 | 아이콘 20px, 클릭 영역 44 × 44px |
| 긴 텍스트 | 한 줄 말줄임. 이름 열은 최소 폭 120px |

### List (모바일)

목록은 카드가 아니라 **행**입니다. 행 사이는 1px `border-subtle`로 나누고 여백과 그림자를 두지 않습니다.

| 종류 | 대상 | 구조 | 수치 |
| --- | --- | --- | --- |
| MemberRow | 회원 목록 | 왼쪽: 이름 + 전화번호. 오른쪽: 회원권과 잔여 + 만료 정보(회원권 트랙이 붙은 뒤) | 최소 높이 60px(`row-height`), 패딩 12px 16px. 이름은 글자 스타일 `row-title`(15px / 700), 보조는 `row-meta`(13px) `text-secondary` |
| BookingRow | 예약 목록 | 시각 열 + 본문(회원 이름, 강사·서비스) + 상태 배지 | 패딩 12px 16px. 시각 열 52px, `row-title` + tabular-nums. 지금 진행 중인 행만 `background-current` |

만료 임박은 주황 글자(`text-warn`)로 "만료 D-5"처럼 쓰고, 만료됐으면 회색 "만료" 배지를 붙입니다. 진행 중인 행의 보조 글자는 `text-on-muted`를 씁니다(`text-secondary`는 그 면에서 대비가 모자랍니다).

**상태(Table·List 공통).**

| 상태 | 표현 |
| --- | --- |
| default | 위 수치 |
| hover | 행 면 `background-subtle` |
| focus | 행 링크에 보라 2px outline. 행이 붙어 있으므로 안쪽 outline(`outline-offset: -2px`) |
| 선택됨 | 지금 진행 중인 예약 행은 `background-current`. 다중 선택이 필요해지면 첫 열에 Checkbox |
| error | 목록 자리에 EmptyState의 오류 변형(재시도 버튼) |
| disabled | 취소된 예약·수업 행: 투명도를 낮추지 않습니다. 회색 배지와 `text-secondary`로 구분하고 읽을 수 있게 유지합니다 |
| loading | 행 모양의 스켈레톤 5개(`action-disabled-background` 면, 움직임 없음 또는 300ms 깜빡임). 목록 컨테이너에 `aria-busy="true"` |
| 빈 목록 | EmptyState |

**접근성.**

- Table은 `<table>` + `<th scope="col">`. 제목은 `<caption>` 또는 `aria-labelledby`
- 행 전체 클릭은 첫 열의 링크를 행 전체로 넓히는 방식으로 구현하고, 행 안에 버튼을 중첩하지 않습니다(이전 프로토타입의 중첩 버튼 문제를 반복하지 않음)
- List는 `<ul>` / `<li>`. 카드의 상세 링크와 행동 버튼은 형제로 둡니다
- 정렬 가능한 머리글은 `<button>` + `aria-sort`

**사용 토큰.** `background-canvas`, `background-subtle`, `background-current`, `text-primary`, `text-secondary`, `text-on-muted`, `text-warn`, `border-strong`, `border-subtle`, `focus-color`, `row-height`, 글자 스타일 `row-title`, `row-meta`, `body`, `label`

**미결.** 각 목록의 열·정렬·필터 구성(예: 예약 목록의 기본 기간, 회원 목록에 최근 예약일을 보여줄지), 정렬을 서버에서 하는지, 회원 목록에서 전화번호 전체를 보여줄지 일부를 가릴지.

### StatusBadge (목록에서 쓰는 상태 표시)

예약, 수업, 공개 여부의 상태를 알리는 배지입니다. 상태 값 자체는 [lifecycle.md](../spec/lifecycle.md)에 확정된 것만 씁니다. **표시 문구와 모양은 제안**입니다.

| 수치 | 값 |
| --- | --- |
| 크기 | 높이 24px, 가로 패딩 8px, 글자 12px / 1.4 / 700 (`label`) |
| 테두리 | 1px, 모서리 4px (`radius-badge`) |
| 동작 | 정보 표시 전용. 클릭 동작 없음 |

배지는 하나의 컴포넌트(Badge)이고 모양은 세 가지뿐입니다. 면을 채우는 배지는 노쇼 하나입니다.

| 대상 | 값 | 문구(제안) | 모양 | 토큰 |
| --- | --- | --- | --- | --- |
| 예약 | `BOOKED`, 수업 종료 전 | 예약 | 보라 외곽선, 보라 글자 | `status-booked-*` |
| 예약 | `BOOKED`, 수업 종료 후(조회 시 판정) | 완료 | 회색 외곽선, 회색 글자 | `status-muted-*` |
| 예약 | `CANCELLED` | 취소 | 회색 외곽선, 회색 글자 | `status-muted-*` |
| 예약 | `NO_SHOW` | 노쇼 | 검정 면, 흰 글자 | `status-no-show-*` |
| 수업 | `OPEN` | 예약 가능 | 보라 외곽선, 보라 글자 | `status-booked-*` |
| 수업 | `CLOSED` | 마감 | 회색 외곽선, 회색 글자 | `status-muted-*` |
| 수업 | `CANCELLED` | 휴강 | 회색 외곽선, 회색 글자 | `status-muted-*` |
| 수업 | `is_public = true` | 공개 | 보라 외곽선, 보라 글자 | `status-booked-*` |
| 수업 | `is_public = false` | 비공개 | 회색 외곽선, 회색 글자 | `status-muted-*` |
| 회원권 | 만료 | 만료 | 회색 외곽선, 회색 글자 | `status-muted-*` |

회색 배지는 색이 같고 문구로 구분합니다. 수업의 "예약 가능"과 "공개"는 같은 보라 외곽선이라 한 행에 함께 둘 때는 문구로만 구분됩니다. 디자인 확인이 필요합니다.

- "완료"는 저장된 상태가 아니라 `BOOKED` + 수업 종료 시각 경과로 조회 시 판정합니다(2026-10-01 A안). 완료 처리 버튼은 만들지 않습니다
- 수업 상태와 공개 여부는 직교한 축이라 배지를 따로 둡니다(`OPEN`이면서 비공개 가능)
- 정원이 찬 것은 상태가 아닙니다. `마감` 배지는 사장이 명시적으로 닫은 `CLOSED`에만 쓰고, 정원은 `3 / 3`처럼 숫자로 보여줍니다
- 대기는 슬라이스 1에 대기자가 없어 배지를 두지 않았습니다

---

## Tabs

**용도.** 한 화면 안에서 같은 대상의 다른 면을 전환합니다. 화면 이동(내비게이션)에는 쓰지 않습니다. 후보: 회원 상세의 정보 / 예약 이력, 예약 목록의 예정 / 지난 예약.

목록 필터(`aria-pressed`로 같은 목록을 좁히는 버튼)와 다릅니다. Tabs는 패널을 바꾸고, 필터는 같은 목록을 좁힙니다.

**구조.** 탭 목록(가로) + 탭 패널. (선택) 탭 안에 건수.

**수치.**

| 항목 | 값 |
| --- | --- |
| 탭 목록 | 아래 1px `border-strong`. 가로 스크롤 허용, 줄바꿈 금지(`white-space: nowrap`) |
| 탭 | 높이 44px, 가로 패딩 8px. 글자 14px / 1.4, 기본 500 · 선택 700 |
| 탭 사이 | 간격 8px. 선택된 탭만 아래 2px 보라 선(`selection-indicator`) |
| 건수 | 탭 글자 뒤 8px, 12px tabular-nums |
| 패널 | 탭 목록 아래 16px부터 내용 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default | 면 없음, 글자 `text-secondary` |
| hover | 글자 `text-primary` |
| 선택됨 | 면 없음, 글자 `text-primary` 700, 아래 2px `selection-indicator`. `aria-selected="true"` |
| focus | 보라 2px outline. 스크롤 영역에 잘리지 않도록 안쪽 outline |
| disabled | 글자 `action-disabled-foreground`, `aria-disabled="true"`. 가능하면 비활성 대신 탭을 숨기지 않고 빈 상태를 보여줍니다 |
| loading | 탭은 바로 전환하고 패널에 스켈레톤. 탭 자체에는 로딩 표시 없음 |
| error | 패널에 EmptyState의 오류 변형 |

**접근성.** `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-controls` 연결. 좌우 방향키로 탭 이동, Home/End, 선택된 탭만 `tabindex="0"`. 선택 상태를 색만이 아니라 아래 선, 글자 굵기, `aria-selected`로 전달합니다.

**사용 토큰.** `selection-indicator`, `text-primary`, `text-secondary`, `border-strong`, `action-disabled-foreground`, `focus-color`, 글자 스타일 `field-label`

**미결.** 회원 상세·예약 목록을 실제로 탭으로 나눌지는 화면 기획에서 정합니다. 위 후보는 근거 문서에 없습니다.

---

## Modal · Dialog · 확인창

**용도.**

| 종류 | 쓰는 때 | 예 |
| --- | --- | --- |
| Modal(작업) | 현재 화면을 벗어나지 않고 짧은 작업을 할 때 | 예약 생성의 회원 선택 시트, 메모 편집 |
| 확인창 | 되돌릴 수 없거나 영향이 큰 행동 직전 | 수업 취소(휴강), 노쇼 기록, 임시 비밀번호 재발급 |

**구조.** 배경 가림막 + 상자(제목 줄: 제목 + 닫기 버튼 / 본문 / 버튼 줄).

**수치.**

| 항목 | PC (1024px 이상) | 모바일 |
| --- | --- | --- |
| 형태 | 화면 가운데 상자 | 하단 시트 |
| 폭 | 최대 480px, 화면 좌우 최소 16px 여백 | 100% |
| 높이 | 최대 화면의 88%, 본문만 스크롤 | 최대 88%, 본문 독립 스크롤, safe-area 하단 여백 |
| 테두리 | 1px `border-strong`, 모서리 8px, 그림자 없음 | 위쪽 1px `border-strong`, 위쪽 모서리 8px, 그림자 없음 |
| 패딩 | 24px | 20px 16px |
| 제목 | 글자 스타일 `title`(18px / 1.3 / 700). 닫기 버튼 44 × 44px | 동일 |
| 본문 | 14px / 1.6, 제목 아래 8px | 동일 |
| 버튼 줄 | 본문 아래 24px. 오른쪽 정렬, 간격 12px. 보조(왼쪽) → 주(오른쪽) | 폭 100%로 세로 쌓기, 간격 12px. 실행 버튼이 위 |
| 가림막 | `overlay-scrim` | 동일 |
| 레이어 | `layer-sheet`(50) | 동일 |

**확인창의 내용 규칙.**

- 제목은 행동을 그대로 묻습니다("이 수업을 휴강 처리할까요?"). "확인" 같은 제목을 쓰지 않습니다
- 본문은 **무엇이 바뀌고 되돌릴 수 있는지**를 적습니다. 수업 취소는 딸린 예약이 함께 취소되므로 영향받는 예약 건수를 보여줍니다([lifecycle.md 5절](../spec/lifecycle.md))
- 버튼 문구는 행동 그대로("휴강 처리", "노쇼 기록"). "예 / 아니오"를 쓰지 않습니다
- 위험한 행동의 실행 버튼은 `danger` 변형, 그만두는 버튼은 `secondary`. 처음 포커스는 그만두는 버튼에 둡니다
- 수업 취소가 끝나면 **영향받은 회원 명단**을 결과로 보여줍니다. 사장이 그 명단으로 연락해야 하기 때문입니다(같은 절)

**상태.**

| 상태 | 동작 |
| --- | --- |
| default | 열릴 때 150ms(`motion-fast`). reduced motion에서는 즉시 |
| hover / focus | 내부 버튼·필드 각자의 규칙 |
| loading | 실행 버튼 loading, 닫기·그만두기 비활성, 가림막 클릭으로 닫히지 않음 |
| error | 창을 닫지 않고 본문 아래에 오류 문구(`role="alert"`) + 다시 시도 가능 |
| disabled | 실행 조건이 안 되면 버튼을 비활성으로 두기보다 열기 전에 이유를 알려줍니다 |

**접근성.**

- 작업 Modal은 `role="dialog"`, 확인창은 `role="alertdialog"`. 둘 다 `aria-modal="true"`, 제목을 `aria-labelledby`, 본문을 `aria-describedby`로 연결
- 포커스 가두기, 닫으면 열었던 요소로 포커스 복귀, 배경 `inert`
- Esc로 닫습니다. 가림막 클릭으로 닫는 것은 작업 Modal만 허용하고 확인창에서는 닫히지 않습니다
- 입력 중인 내용이 있는 작업 Modal은 닫기 전에 내용이 사라진다는 것을 알립니다

**사용 토큰.** `background-canvas`, `text-primary`, `border-strong`, `overlay-scrim`, `layer-sheet`, `motion-fast`, `radius-control`, `action-secondary-*`, `action-primary-*`, `action-danger-*`, 글자 스타일 `title`, `body`

**미결.** 예약 취소에 확인 단계를 둘지는 취소 정책이 정해진 뒤 결정합니다. 수업 취소와 노쇼는 상태 전이도에서 되돌리는 경로가 없어 확인창을 제안했지만 확정은 아닙니다. 노쇼를 잘못 기록했을 때의 정정 경로는 근거 문서에 없습니다.

---

## Toast

**용도.** 방금 한 행동의 결과를 짧게 알립니다. 화면 흐름을 막지 않습니다. 사용자가 **조치해야 하는 오류**는 Toast만으로 알리지 않고 폼 오류·확인창·EmptyState에 남깁니다.

**구조.** 상자: 상태 아이콘 + 문구 + (선택) 행동 버튼 1개 + 닫기 버튼.

**수치.**

| 항목 | 값 |
| --- | --- |
| 폭 | 최대 360px, 화면 좌우 16px 여백 |
| 높이 | 최소 48px |
| 패딩 | 12px 16px. 요소 간격 12px |
| 면·테두리 | `background-canvas`, 1px `border-control`, 모서리 8px, 그림자 없음 |
| 상태 아이콘 | 24 × 24px 원형. 성공은 `feedback-success-background` 면 + `feedback-success-foreground` 체크. 실패는 `feedback-error-border` 색 아이콘, 상자 테두리도 `feedback-error-border` |
| 문구 | 14px / 1.6 `text-primary`. 최대 2줄 |
| 닫기 | 아이콘 20px, 클릭 영역 44 × 44px |
| 위치 | 모바일: 하단 가운데, 하단 내비게이션(또는 고정 제출 영역) 위 16px. PC: 오른쪽 아래 24px |
| 쌓기 | 최대 3개, 간격 8px. 새 알림이 아래 |
| 레이어 | `layer-toast`(60) |
| 표시 시간 | 4000ms. 실패 알림은 자동으로 닫지 않음 |

한국어 한 문장과 닫기 버튼을 인지할 시간을 주기 위해 4000ms를 제안합니다. 이전 프로토타입의 버튼 완료 표시는 2000ms였습니다.

**상태.**

| 상태 | 표현 |
| --- | --- |
| 성공(default) | 위 수치. `role="status"` |
| 실패(error) | 테두리·아이콘 `feedback-error-border`. `role="alert"`. 자동으로 닫지 않음 |
| hover / focus | 표시 시간 타이머 일시 정지. 내부 버튼은 버튼 규칙 |
| loading | 쓰지 않습니다. 진행 중은 버튼 loading으로 표시 |
| disabled | 해당 없음 |

**접근성.**

- 포커스를 가져가지 않습니다. live region은 화면에 미리 있어야 읽히므로 컨테이너를 항상 렌더링해 둡니다
- 문구만으로 의미가 통해야 합니다("예약이 취소됐어요"). 아이콘은 `aria-hidden`
- reduced motion에서는 미끄러지는 등장 대신 즉시 표시
- 문구는 [브랜드 가이드](claude-design/project/README.md)의 "글" 규칙을 따릅니다(해요체, 행동을 그대로)

**사용 토큰.** `background-canvas`, `text-primary`, `border-control`, `feedback-success-*`, `feedback-error-border`, `layer-toast`, `motion-fast`, `radius-control`, 글자 스타일 `body`

**미결.** "실행 취소" 같은 되돌리기 행동은 서버가 지원해야 합니다. 예약 취소·노쇼는 되돌리는 전이가 없으므로 지금은 넣지 않습니다.

---

## EmptyState

**용도.** 목록이나 화면에 보여줄 것이 없을 때 **왜 비었는지와 다음에 할 일**을 알려줍니다. 제목, 설명, 행동(title, description, action)으로 이뤄집니다.

**구조.** 제목 + 설명 + (선택) 행동 버튼 1개.

**수치.**

| 항목 | 값 |
| --- | --- |
| 정렬 | 가운데. 글 최대 폭 360px |
| 패딩 | 세로 32px, 가로 24px. 화면 전체형은 세로 64px |
| 장식 | 쓰지 않음. 운영자 화면에는 장식 그림을 넣지 않습니다 |
| 제목 | 글자 스타일 `title`(18px / 1.3 / 700) |
| 설명 | 14px / 1.6 `text-secondary`, 제목 아래 8px |
| 버튼 | 설명 아래 20px. 화면의 주 버튼이 하단 고정 바에 이미 있으면 여기에는 두지 않습니다 |
| 테두리 | 목록 자리에 들어갈 때는 자체 테두리 없음. 단독일 때 1px `border-strong`, 모서리 8px은 선택 |

**변형.**

| 변형 | 제목 예(제안) | 행동 | 쓰는 곳 |
| --- | --- | --- | --- |
| 처음 비어 있음 | 아직 등록한 회원이 없어요 | 주 버튼 "회원 등록" | 회원·예약·shop 목록 |
| 검색·필터 결과 없음 | 조건에 맞는 회원이 없어요 | 보조 버튼 "검색어 지우기" | 검색·필터된 목록 |
| 불러오기 실패(error) | 목록을 불러오지 못했어요 | 보조 버튼 "다시 시도" | 목록·탭 패널 |
| 공개 캘린더에 수업 없음 | 이 주에는 공개된 수업이 없어요 | 없음 | `/{shop-key}/schedule` |
| 화면 전체: 찾을 수 없음 | 페이지를 찾을 수 없어요 | 없음 | shop이 없거나 비활성일 때의 404([tenancy.md 7절](../spec/tenancy.md)) |

**상태.** 정적인 컴포넌트라 default와 변형만 있습니다. hover / focus / disabled / loading은 내부 버튼의 규칙을 따릅니다. 다시 시도 중에는 버튼 loading.

**접근성.**

- 제목은 문맥에 맞는 heading 수준으로 둡니다
- 불러오기 실패는 `role="alert"`, 검색 결과 없음은 `role="status"`로 알립니다
- 공개 화면의 빈 상태·404 문구에는 샵의 내부 정보(비활성 사유 등)를 넣지 않습니다. 없는 샵과 비활성 샵은 같은 화면이어야 합니다

**사용 토큰.** `text-primary`, `text-secondary`, `border-strong`, `space-8`, `space-20`, `space-24`, `space-32`, `space-64`, 글자 스타일 `title`, `body`

**미결.** 각 화면의 실제 문구.

---

## Pagination

**용도.** 건수가 많은 목록을 나눠 보여줍니다. shop 목록, 회원 목록, 예약 목록.

**구조.** 이전 버튼 + 페이지 번호들 + 다음 버튼. (선택) "1–20 / 132명" 같은 범위 표시.

**수치.**

| 항목 | 값 |
| --- | --- |
| 버튼 | 44 × 44px, 1px `border-control`, 모서리 8px, 그림자 없음. 글자 14px tabular-nums |
| 간격 | 버튼 사이 8px. 목록과는 16px |
| 번호 개수 | PC: 처음 · 현재 주변 5개 · 끝 + 말줄임(`…`). 모바일: 번호를 숨기고 `이전 · 3 / 12 · 다음` |
| 정렬 | PC 오른쪽, 모바일 가운데(양 끝 정렬) |
| 범위 표시 | 12px `text-secondary`. PC는 왼쪽, 모바일은 위 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default | 면 `action-secondary-background`, 글자 `action-secondary-foreground` |
| hover | 면 `background-subtle` |
| 현재 페이지 | 면 `selection-background`, 글자 `selection-foreground`, `aria-current="page"`. 누를 수 없음 |
| focus | 보라 2px outline + 2px offset |
| disabled | 첫 페이지의 이전·마지막 페이지의 다음: `action-disabled-*`, `disabled` 속성 |
| loading | 누른 버튼만 스피너, 목록은 스켈레톤. 다른 버튼은 중복 조작 차단 |
| error | 목록이 EmptyState 오류 변형을 보여주고 Pagination은 이전 상태 유지 |

**접근성.** `<nav aria-label="페이지 이동">` 안의 버튼 목록. 번호 버튼은 "3페이지"처럼 읽히는 이름을 가집니다. 페이지가 바뀌면 포커스를 목록 맨 위로 옮기고 범위 표시를 `role="status"`로 알립니다. 한 페이지뿐이면 컴포넌트를 렌더링하지 않습니다.

**사용 토큰.** `action-secondary-*`, `background-subtle`, `selection-*`, `action-disabled-*`, `border-control`, `text-secondary`, `focus-color`, 글자 스타일 `body`, `caption`

**미결.** 목록 API의 페이지 방식(번호·커서)과 페이지 크기가 정해지지 않았습니다. 커서 방식이면 번호 대신 "더 보기" 버튼(폭 100%, secondary) 하나로 바꿉니다. 폰에서는 "더 보기"가 더 맞을 수 있어 화면 기획 때 함께 정합니다.

---

## AppShell

**용도.** 로그인 후 모든 화면을 감싸는 틀. 화면 제목을 보여주고 주요 화면으로 이동시킵니다. 경로 방식에서는 모든 샵이 같은 주소 체계를 쓰고 서버가 매 요청마다 토큰과 shop-key를 대조합니다([tenancy.md 5절](../spec/tenancy.md)). 화면에서 지금 어느 샵인지를 어떻게, 얼마나 자주 보여줄지는 화면 기획에서 정합니다(미결 11).

**종류.**

| 종류 | 대상 | 기준 폭 | 구성 |
| --- | --- | --- | --- |
| 사업장 Shell | staff. `/{shop-key}/...` | 폰 우선 | 화면 제목 줄 + 하단 고정 바 + 하단 내비게이션(모바일) / 사이드바(PC) |
| 백오피스 | platform_admin. `/backoffice/...` | PC | 이 디자인 시스템 밖. 기성 UI 라이브러리 |
| 인증 레이아웃 | 로그인, 강제 비밀번호 변경 | 폰 우선 | 내비게이션 없음. 서비스 이름 + 샵 이름 + 폼 |
| 공개 레이아웃 | 공개 캘린더(비로그인) | 폰 우선 | 샵 이름만 있는 헤더. 내비게이션·로그인 정보 없음 |

### 사업장 Shell

**구조.**

```
모바일 (1024px 미만)                 PC (1024px 이상)
┌──────────────────────────┐        ┌────────┬──────────────────────┐
│ 화면 제목        보조 정보 │        │        │ 화면 제목     보조 정보 │
├──────────────────────────┤        │ 내비    ├──────────────────────┤
│                          │        │ 항목    │                      │
│  본문 (목록은 행)          │        │        │  본문                 │
│                          │        │        │                      │
├──────────────────────────┤        │        │                      │
│  [ 주 버튼 ]              │ 고정 바 │        │            [ 주 버튼 ] │
├──────────────────────────┤        │        │                      │
│  항목 │ 항목 │ 항목 │ 항목 │ 하단   │        │                      │
└──────────────────────────┘        └────────┴──────────────────────┘
```

**수치.**

| 항목 | 값 |
| --- | --- |
| 화면 제목 줄 | 높이 56px, 가로 패딩 16px, 면 `background-canvas`. 왼쪽에 화면 제목, 오른쪽에 보조 정보(건수, "오늘"). 하위 화면은 왼쪽에 뒤로 가기 + 아래 1px `border-strong` |
| 샵 이름 | 로그인·비밀번호 변경 화면 위에 글자 스타일 `detail-title`. 목록 화면에 샵 이름을 계속 보여줄지는 미결 |
| shop-key | 화면에 계속 노출할지 미결. 그리지 않는 것을 기본으로 합니다 |
| 사용자 메뉴 | 이름, 비밀번호 변경, 로그아웃. 하단 내비게이션의 "더보기"에 두는 것이 후보. 메뉴 모양은 Select 목록과 같음(1px 테두리, `layer-popover`) |
| 하단 내비게이션 | 높이 56px + safe-area 하단 여백, 위 1px `border-strong`, 면 `background-canvas`, 하단 고정, `layer-header`(10). 항목 3~5개, 같은 폭 |
| 내비 항목(모바일) | 아이콘 24px + 라벨 12px / 1.4, 세로 배치. 클릭 영역은 칸 전체(최소 44px) |
| 사이드바(PC) | 폭 240px, 오른쪽 1px `border-strong`. 1024px 이상에서 하단 내비게이션 대신 |
| 내비 항목(PC) | 높이 48px, 가로 패딩 16px, 아이콘 20px + 라벨 14px / 700, 간격 12px |
| 본문 | 가로 여백 모바일 16px, PC 24px(README 간격 규칙). 모바일은 하단 내비게이션 높이만큼 아래 여백 |
| 하단 고정 바 | 화면의 주 버튼을 둡니다. 위 1px `border-strong`, 패딩 12px 16px. 하단 내비게이션 바로 위 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| 내비 항목 default | 면 없음, 글자 `text-secondary` |
| 내비 항목 hover | 글자 `text-primary` |
| 현재 화면 | 면 없음, 글자와 아이콘 `selection-indicator`, 굵기 700, `aria-current="page"` |
| focus | 보라 2px outline. 칸이 붙어 있으므로 안쪽 outline |
| disabled | 아직 열리지 않은 메뉴는 비활성으로 두지 않고 숨깁니다 |
| loading | Shell은 먼저 그리고 본문만 스켈레톤. 샵 이름을 아직 모르면 그 자리에 스켈레톤 한 줄 |
| error | 본문 자리에 EmptyState. 헤더·내비게이션은 유지 |

**내비게이션 항목(후보).** 슬라이스 1 범위에서 근거가 있는 것은 **예약(일정) · 회원 · 수업** 세 가지입니다. 회원권·LLM 조회는 구현 순서가 뒤이므로 넣지 않았습니다. 항목 이름·순서·첫 화면은 화면 기획에서 정합니다.

### 백오피스 Shell

2026-10-05 결정으로 백오피스는 이 디자인 시스템의 컴포넌트를 쓰지 않습니다. 팀 내부 PC 화면이라 기성 UI 라이브러리로 만들고 주색만 `brand-primary`에 맞춥니다([decisions.md](../decisions.md)). 고객이 보는 화면이 백오피스에 생기면 다시 봅니다.

### 인증 레이아웃

| 항목 | 값 |
| --- | --- |
| 구성 | 내비게이션 없는 화면. 상자로 감싸지 않고 본문에 바로 둡니다. 화면 가로 여백 16px |
| 위쪽 | 서비스 이름(로고 확정 전에는 보라 글자) + 샵 이름(글자 스타일 `detail-title`). 샵 이름은 로그인 화면에 노출되는 값입니다([data-model.md](../spec/data-model.md) `shop.name`) |
| 내용 | Form 레이아웃. 주 버튼은 하단 고정 바에 폭 100% |

강제 비밀번호 변경(`must_change_password = true`)은 내비게이션이 없는 이 레이아웃을 써서 변경을 마치기 전에는 다른 화면으로 갈 수 없게 합니다.

### 공개 레이아웃

공개 캘린더는 비로그인 화면입니다. 헤더에는 **샵 이름만** 둡니다. 운영자 내비게이션, 사용자 정보, shop-key 외의 내부 식별자를 넣지 않습니다. 본문의 구성과 톤은 정해지지 않았습니다(운영자 톤을 쓸지, 이전 포스터 톤 변형을 쓸지 미정 — [README](README.md)). 이전 톤의 수업 카드와 정원 게이지는 [이전 포스터 톤 문서](archived/poster-v0.1/README.md)에 있습니다. 노출 항목은 [tenancy.md 7절](../spec/tenancy.md)의 "나감" 열에 있는 것만 씁니다(수업명, 시작·종료 시각, 강사 표시명, 잔여 정원·마감 여부). 예약 버튼은 없습니다(조회만).

**접근성(공통).**

- `<header>`, `<nav aria-label="주요 메뉴">`, `<main>` 랜드마크. 첫 요소로 "본문으로 건너뛰기" 링크
- 화면마다 `<h1>` 하나(화면 제목). `<title>`에 화면 제목과 샵 이름을 함께 둡니다
- 하단 내비게이션 라벨은 숨기지 않습니다(아이콘만 두지 않음)
- 360px 폭에서 헤더가 줄바꿈되지 않게 샵 이름을 말줄임합니다(이전 프로토타입의 헤더 줄바꿈 문제)
- 고정 헤더·내비게이션이 포커스된 요소를 가리지 않도록 `scroll-padding`을 둡니다

**사용 토큰.** `background-canvas`, `text-primary`, `text-secondary`, `border-strong`, `selection-indicator`, `brand-primary`, `focus-color`, `layer-header`, `layer-popover`, 글자 스타일 `heading`, `title`, `detail-title`, `caption`

**미결.** 내비게이션 항목·순서·첫 화면, 로그아웃과 사용자 메뉴의 구성, 토큰의 `shop_id`와 URL의 shop-key가 다를 때(403) 보여줄 화면, 세션 만료 시 동작, 공개 캘린더에 운영자 로그인 링크를 둘지, 헤더에 shop-key를 계속 노출할지(샵 이름만으로 충분한지), PC 본문의 최대 폭.

---

## 화면별 사용 컴포넌트

대상 화면은 [mvp.md](../mvp.md)와 [tenancy.md](../spec/tenancy.md), [data-model.md](../spec/data-model.md) "다음 단계"의 API 목록에서 가져왔습니다. 화면 번호는 붙이지 않았습니다. 번호와 이름은 `plans/<작업>/README.md`에서 정합니다. 입력 항목은 데이터 모델의 컬럼을 근거로 한 **후보**이고 화면 구성을 확정하지 않습니다.

| 화면 | 경로(근거) | Shell | 입력 | 목록·표시 | 피드백 |
| --- | --- | --- | --- | --- | --- |
| 사업장 로그인 | `/{shop-key}/login` | 인증 | Form, TextField(email), TextField(비밀번호) | — | 폼 오류 요약, 버튼 loading. shop이 없으면 EmptyState(찾을 수 없음) |
| 비밀번호 변경 | 로그인 직후 강제(`must_change_password`) | 인증 | Form, TextField(비밀번호) | — | 폼 오류, Toast |
| 회원 목록 | `/{shop-key}/...` | 사업장 | TextField(검색) | MemberRow 목록 · PC는 Table, Pagination | EmptyState(처음 · 검색 결과 없음 · 실패) |
| 회원 등록 | 〃 | 사업장 | Form, TextField(이름), TextField(전화번호), Textarea(메모) | — | 폼 오류(전화번호 중복), Toast |
| 회원 상세 | 〃 | 사업장 | — | Tabs(후보), BookingRow 목록(예약 이력), StatusBadge | EmptyState(예약 없음) |
| 회원 메모 | 회원 상세 안 | 사업장 | Textarea | — | Toast(저장됨), 버튼 loading |
| 수업 개설 | 〃 | 사업장 | Form, Select(서비스 · 강사), DatePicker, TimePicker, TextField(정원, 숫자), Checkbox(공개) | 종료 시각(읽기 전용) | 폼 오류(강사 시간 겹침), Toast |
| 수업 공개 · 마감 · 휴강 | 수업 상세 | 사업장 | Switch(공개) | StatusBadge(수업 상태 · 공개 여부), MemberRow 목록(예약한 회원) | 확인창(휴강: 영향 건수 → 결과에 회원 명단), Toast |
| 예약 생성 | 〃 | 사업장 | Form, Modal(회원 선택 시트: TextField 검색 + MemberRow 목록), Select 또는 목록(수업 선택), DatePicker · TimePicker(수업이 없어 즉석 생성할 때) | — | 폼 오류 요약(409: 정원 마감 · 닫힘 · 지난 수업), Toast |
| 예약 목록 | 〃 | 사업장 | DateStrip, Tabs 또는 필터(후보) | BookingRow 목록 · PC는 Table, StatusBadge, Pagination | EmptyState |
| 예약 취소 | 예약 행·상세에서 | 사업장 | — | StatusBadge | 확인창(미결), Toast |
| 노쇼 기록 | 예약 행·상세에서 | 사업장 | — | StatusBadge | 확인창, Toast |
| 공개 캘린더 | `/{shop-key}/schedule` | 공개 | 없음(조회만) | 미정(공개 캘린더의 톤과 구성) | EmptyState(수업 없음 · 찾을 수 없음) |

백오피스 화면(shop 목록, shop 생성, 생성 완료, 임시 비밀번호 재발급)은 이 표에서 뺐습니다. 백오피스는 이 디자인 시스템 밖이고, 화면 목록과 요구사항은 [plans/backoffice-staff-auth/README.md](../plans/backoffice-staff-auth/README.md)에 있습니다. 기성 UI 라이브러리로 그 요구사항(검색, 표, 폼 오류, 1회 표시와 복사)을 충족하면 됩니다.

컴포넌트 쪽에서 본 사용처입니다.

| 컴포넌트 | 쓰이는 화면 |
| --- | --- |
| TextField | 로그인, 비밀번호 변경, 회원 등록, 회원 검색, 수업 개설(정원), 예약 생성(회원 검색) |
| Textarea | 회원 등록, 회원 메모 |
| Select | 수업 개설(서비스 · 강사), 예약 생성(강사 · 서비스 · 시각) |
| Checkbox · Radio · Switch | 수업 개설(공개 Checkbox), 수업 상세(공개 Switch). Radio는 현재 확정된 사용처 없음 |
| DatePicker · TimePicker | 수업 개설, 예약 생성(즉석 수업) |
| Form 레이아웃 | 입력이 있는 모든 화면 |
| Table · List | 회원 목록, 회원 상세(예약 이력), 예약 목록, 수업 상세(예약한 회원) |
| Tabs | 회원 상세, 예약 목록(둘 다 후보) |
| Modal · 확인창 | 예약 생성(회원 선택), 예약 상세, 휴강, 노쇼, 예약 취소(미결) |
| Toast | 저장·등록·취소·기록·복사의 결과 |
| EmptyState | 모든 목록, 공개 캘린더, 찾을 수 없음 |
| Pagination | 회원 목록, 예약 목록 |
| AppShell | 전 화면(종류는 위 표의 Shell 열) |

서비스(`service`)·직원(`staff`)·가용시간(`staff_availability`) 관리 화면은 대상 화면 목록에 없어 연결하지 않았습니다. 수업 개설의 Select가 이 데이터를 필요로 하므로 화면 기획 때 확인이 필요합니다.

---

## 미결 사항

근거 문서에 없어 이 문서에서 정하지 않은 것들입니다. 제품 정책에 해당하는 것은 [spec/](../spec/)과 [decisions.md](../decisions.md)에서 결정합니다.

| # | 항목 | 종류 | 관련 컴포넌트 |
| --- | --- | --- | --- |
| 1 | 전화번호 저장 형식과 화면 표시 형식 | 정책·API | TextField |
| 2 | 비밀번호 규칙, 변경 시 현재 비밀번호·확인 입력 요구 여부 | 정책 | TextField, Form |
| 3 | 회원 검색 대상과 서버 검색 여부 | API | TextField, List |
| 4 | 회원 메모의 저장 방식(명시적 저장 제안), 최대 글자 수 | 정책 | Textarea |
| 5 | 시각 입력 단위, 지난 시각의 수업 개설, 가용시간 밖 시각·강사 시간 겹침의 처리 | 정책 | DatePicker · TimePicker |
| 6 | 예약 취소의 확인 단계 여부 | 정책(취소 정책 확정 후) | 확인창 |
| 7 | 노쇼를 잘못 기록했을 때의 정정 경로 | 정책 | 확인창, StatusBadge |
| 8 | 수업 공개 전환을 즉시 반영할지 | 정책 | Switch |
| 9 | 목록 API의 페이지 방식과 크기, 정렬·필터 | API | Pagination, Table · List |
| 10 | 서버 오류 응답 형식(필드별 오류) | API | Form |
| 11 | 내비게이션 항목·순서·첫 화면, 사용자 메뉴 구성 | 화면 기획 | AppShell |
| 12 | shop-key 불일치(403)·세션 만료 시 화면 | 정책·화면 기획 | AppShell, EmptyState |
| 13 | 서비스·직원·가용시간 관리 화면의 범위 | 화면 기획 | Select |
| 14 | 회원 상세·예약 목록을 탭으로 나눌지 | 화면 기획 | Tabs |
| 15 | 상태 배지 문구, "예약 가능"과 "공개"가 같은 모양인 것 | 디자인 확인 | StatusBadge |
| 16 | 서체를 Pretendard로 바꿀지(지금은 Noto Sans KR, 아이콘은 lucide) | 디자인·구현 | 전체 |
| 17 | 다크 모드 | 범위 밖 | 라이트 우선 |

---

## 토큰

이 문서가 처음 제안했던 추가 토큰(입력 글자, 폼 라벨, 화면 제목, 팝오버 레이어, 가림막, 상태 배지 색 등)은 2026-10-05 톤 변경 때 [tokens.json](tokens.json)에 새 이름과 값으로 정리됐습니다. 강도·대기 관련 토큰과 그림자 토큰은 없어졌습니다. 이전 제안 표는 이 파일의 2026-10-05 이전 이력과 [archived/poster-v0.1/](archived/poster-v0.1/README.md)에서 볼 수 있습니다.

컴포넌트 전용 크기(스위치 48 × 28, 달력 칸 44, 사이드바 240 등)는 전역 토큰으로 두지 않고 이 문서의 표와 컴포넌트 CSS의 로컬 변수로 관리합니다.
