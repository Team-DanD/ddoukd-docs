# 운영자 화면 컴포넌트 명세 (제안)

> 상태: **v0.1 제안** · 2026-10-04 작성
> 기준 문서: [디자인 시스템 README](README.md) · [tokens.json](tokens.json) · [MVP 범위](../mvp.md) · [테넌트·계정](../spec/tenancy.md) · [데이터 모델](../spec/data-model.md) · [생애주기](../spec/lifecycle.md)

[README.md](README.md)의 v0.1은 회원 예약 프로토타입(`ddoukd-web`) 캡처에서 나온 제안이라 입력 계열 컴포넌트가 없습니다. MVP는 사업장 운영자 화면이므로, pen.dev로 화면 기획을 시작할 수 있게 그 공백을 채웁니다.

- 이 문서의 수치·상태·문구는 전부 **제안**입니다. 구현된 컴포넌트도, 캡처로 검증한 화면도 없습니다.
- 제품 정책·권한·회원권 규칙을 새로 확정하지 않습니다. 근거 문서에 없는 것은 각 절과 [미결 사항](#미결-사항)에 미결로 적었습니다.
- `tokens.json`은 고치지 않았습니다. 기존 토큰으로 표현할 수 없는 값은 [추가가 필요한 토큰](#추가가-필요한-토큰)에 모았습니다. 본문에서 그 토큰을 쓸 때는 이름 뒤에 `(추가)`를 붙였습니다.
- 운영자 화면은 **폰 기준**으로 먼저 설계합니다([mvp.md](../mvp.md)). 백오피스는 PC 기준입니다.

## 공통 규칙

README의 시각 방향을 그대로 따릅니다. 아래는 이 문서의 모든 컴포넌트에 적용되는 기본값입니다.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 모서리 | 0. 라디오와 스피너만 원형 예외 | `primitive.radius.square`, `primitive.radius.signal` |
| 구조 테두리 | 검정 2px | `primitive.border.strong` + `border.strong` |
| 보조 구분선 | 1px 낮은 대비 | `primitive.border.fine` + `border.subtle` |
| 그림자 | 흐림 없는 우하단 오프셋. 행 3px, 행동 4px, 강조 5px | `primitive.shadow.row` / `action` / `emphasis` |
| 주요 행동·선택 | 노랑 면 + 검정 글자 | `action.primary.*`, `selection.*` |
| 브랜드 | 보라 | `brand.primary` |
| 포커스 | 보라 3px outline + 2px offset. `:focus-visible`에만 표시 | `component.focus`, `focus.color` |
| 클릭 영역 | 최소 44 × 44px | `component.button.hitTarget` |
| 글자 | 라벨 최소 12px. 입력 글자 16px | `typography.label`, `typography.control`(추가) |
| 간격 | 4px 기반 스케일 | `primitive.space.*` |
| 모션 | 전환 150ms, 펼침 300ms. `prefers-reduced-motion`에서는 이동 제거 | `motion.fast`, `motion.standard` |

**그림자를 쓰는 곳과 안 쓰는 곳.** 입력 컨트롤(필드·체크박스·탭)은 그림자 없이 평면으로 둡니다. 그림자는 누를 수 있는 행동(버튼), 떠 있는 면(모달·토스트·팝오버), 카드 행에만 씁니다. 한 화면에서 입력과 행동이 그림자 유무로 구분됩니다.

**포커스.** outline은 테두리·그림자와 독립적으로 그립니다. 오류 상태의 빨간 테두리 위에서도 보라 outline이 함께 보여야 합니다. 스크롤 컨테이너에 잘리는 표 행처럼 바깥 offset을 둘 수 없는 곳만 안쪽 outline(`outline-offset: -3px`)을 예외로 허용합니다. 포커스 색의 비텍스트 대비는 흰 면 5.70:1, `surface` 5.23:1, 노랑 4.47:1, 검정 3.31:1로 모두 3:1 이상입니다.

**색만으로 의미를 전달하지 않습니다.** 오류는 아이콘 + 문구, 선택은 체크·위치·`aria-*`, 상태 배지는 문구를 항상 함께 둡니다.

**비활성.** 입력 계열도 `action.disabled.background` / `action.disabled.foreground`를 재사용합니다(`surface2` 위 `inkSoft` 5.72:1). 테두리는 `border.subtle` 2px로 낮추고 그림자를 제거합니다. 실제 `disabled` 속성을 쓰고, 왜 비활성인지는 도움말로 적습니다.

**이 문서에서 계산한 대비.** README의 [contrast.cjs](scripts/contrast.cjs)와 같은 sRGB 상대 휘도 방식입니다.

| 조합 | 대비 | 쓰는 곳 |
| --- | --- | --- |
| inkFaint / paper | 5.03:1 | placeholder |
| inkSoft / paper | 6.80:1 | 도움말, 보조 텍스트 |
| inkSoft / surface | 6.24:1 | 표 머리글, 읽기 전용 값 |
| inkSoft / surface2 | 5.72:1 | 비활성 글자 |
| destructive / paper | 4.29:1 | 오류 테두리·아이콘(비텍스트 3:1 충족). 글자색으로는 쓰지 않음 |
| paper / ink | 18.88:1 | 노쇼 배지 |

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

버튼은 README의 [버튼 상태](README.md#버튼-상태) 계약을 그대로 씁니다. 이 문서에서는 `danger` 변형의 색만 [추가 토큰](#추가가-필요한-토큰)으로 제안합니다.

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
| 높이 | 최소 48px (`primitive.space.48`). 내부 44px + 테두리 2px × 2 |
| 가로 패딩 | 12px. 앞·뒤 요소와 입력 값 사이 8px |
| 글자 | 16px / 1.4 (`typography.control`(추가)). 숫자는 tabular-nums |
| 테두리 | 2px `border.strong`, radius 0 |
| 그림자 | 없음 |
| 아이콘 | 20px. 버튼이면 클릭 영역 44 × 44px(필드 안쪽 높이를 그대로 채움) |
| 폭 | 부모 폭 100%. 폼 최대 폭은 [Form 레이아웃](#form-레이아웃) |

입력 글자를 16px로 두는 이유는 iOS Safari가 16px 미만 입력에 포커스할 때 화면을 확대하기 때문입니다. 폰 기준 화면이라 기본값으로 둡니다.

**상태.**

| 상태 | 면 | 테두리 | 글자 | 그 밖 |
| --- | --- | --- | --- | --- |
| default | `background.canvas` | 2px `border.strong` | `text.primary`, placeholder는 `text.captionOnPaper` | — |
| hover | `background.subtle` | 동일 | 동일 | 포인터 기기에서만 |
| focus | `background.canvas` | 동일 | 동일 | 보라 3px outline + 2px offset |
| error | `feedback.error.background` | 2px `feedback.error.border` | `feedback.error.foreground` | 아래에 오류 아이콘 + 문구. `aria-invalid="true"` |
| disabled | `action.disabled.background` | 2px `border.subtle` | `action.disabled.foreground` | `disabled` 속성. 뒤 요소 버튼도 비활성 |
| read-only | `background.subtle` | 2px `border.subtle` | `text.primary` | `readonly` 속성. hover 변화 없음. 선택·복사 가능 |
| loading | default와 동일 | 동일 | 동일 | 뒤 요소 자리에 20px 스피너. 입력은 계속 가능. `aria-busy="true"` |

**변형.**

| 변형 | 속성 | 구성 | 메모 |
| --- | --- | --- | --- |
| 텍스트 | `type="text"` | 기본 | email은 `type="email"` + `autocomplete="username"`, 숫자(정원)는 `inputmode="numeric"` |
| 접두 | — | 앞 요소에 `<도메인>/` 고정 문자열. `background.subtle` 면 + 오른쪽 2px 구분선 | shop-key 입력용. 규칙(소문자 영숫자·하이픈, 3~30자, 예약어 금지)은 [tenancy.md 2절](../spec/tenancy.md)을 도움말에 그대로 옮기고, 대문자는 입력 시 소문자로 바꿉니다 |
| 전화번호 | `type="tel"`, `inputmode="tel"`, `autocomplete="tel"` | 기본 | 같은 샵 안에서 중복 불가(`(shop_id, phone)` unique). 중복은 error 상태 + 문구로 표시 |
| 비밀번호 | `type="password"` | 뒤 요소에 보기/숨기기 토글 | 로그인은 `autocomplete="current-password"`, 변경은 `new-password`. 토글은 `aria-pressed`와 "비밀번호 보기" 라벨 |
| 검색 | `type="search"`, `role="searchbox"` | 앞 요소 검색 아이콘, 값이 있으면 뒤 요소에 지우기 버튼 | 결과 수 변화는 `role="status"` 영역으로 알림. 조회 중에는 loading |
| 1회 표시(읽기 전용 + 복사) | `readonly` | 뒤 요소에 복사 버튼 | shop 생성 완료 화면의 URL·ID·임시 비밀번호. 복사하면 Toast로 알림. 임시 비밀번호는 다시 볼 수 없다는 안내를 필드 아래에 둡니다([tenancy.md 1절](../spec/tenancy.md)) |

**접근성.**

- 보이는 `<label>`을 `for`/`id`로 연결합니다. placeholder를 라벨 대신 쓰지 않습니다
- 도움말·오류는 `aria-describedby`로 연결합니다
- 뒤 요소 버튼은 각각 접근 가능한 이름을 가집니다("지우기", "비밀번호 보기", "복사")
- 붙여넣기를 막지 않습니다(비밀번호 포함)

**사용 토큰.** `background.canvas`, `background.subtle`, `text.primary`, `text.captionOnPaper`, `border.strong`, `border.subtle`, `feedback.error.*`, `action.disabled.*`, `focus.color`, `primitive.border.strong`, `primitive.radius.square`, `primitive.space.8/12/48`, `typography.control`(추가), `component.field`(추가)

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
| 글자 | 16px / 1.6 (`typography.control`(추가) 크기에 본문 줄높이) |
| 테두리·그림자 | TextField와 동일(2px, radius 0, 그림자 없음) |
| 크기 조절 | 세로만(`resize: vertical`). 모바일에서는 자동 높이만 |

**상태.** TextField의 default / hover / focus / error / disabled / read-only와 같습니다. loading(저장 중)은 필드를 잠그지 않고 저장 버튼 쪽에 표시합니다.

**접근성.** 라벨·도움말 연결은 TextField와 같습니다. 글자 수 제한이 있으면 남은 글자 수를 `aria-describedby`로 연결하고, 초과 직전에만 `role="status"`로 알립니다.

**사용 토큰.** TextField와 동일.

**미결.** `member.memo`는 단일 필드라 저장하면 덮어씁니다([data-model.md](../spec/data-model.md)). 그래서 자동 저장 대신 **명시적 저장 버튼**을 제안하지만 확정은 아닙니다. 최대 글자 수, 저장하지 않고 나갈 때의 확인창 여부, 시간순 메모(`member_note`) 전환 시의 화면은 미결입니다.

---

## Select

**용도.** 정해진 목록에서 하나를 고릅니다. 타임존(백오피스), 서비스·강사(수업 개설).

**구조.** TextField와 같은 필드 상자 + 뒤 요소에 아래 방향 화살표 20px. 펼치면 옵션 목록.

**수치.**

| 항목 | 값 |
| --- | --- |
| 트리거 | TextField와 동일(높이 48px, 패딩 12px, 2px 테두리, 그림자 없음) |
| 목록(커스텀일 때) | 트리거 아래 4px, 폭은 트리거와 같게. 2px `border.strong`, `primitive.shadow.action`(4px), 면 `background.canvas` |
| 옵션 | 높이 최소 44px, 가로 패딩 12px, 글자 16px |
| 목록 최대 높이 | 옵션 6개(264px)까지 보이고 그 이상은 내부 스크롤 |
| 레이어 | `layer.popover`(추가) |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default / hover / focus / error / disabled | TextField와 동일 |
| 열림 | 트리거에 `aria-expanded="true"`, 화살표 뒤집힘 |
| 옵션 hover·키보드 활성 | `background.subtle` 면 |
| 옵션 선택됨 | `selection.background` + `selection.foreground`, 왼쪽에 체크 아이콘 |
| loading | 옵션을 불러오는 동안 트리거 뒤 요소에 스피너, 목록 자리에 "불러오는 중" |
| 옵션 없음 | 목록 대신 한 줄 안내 + (가능하면) 만들러 가는 링크 |

**동작 제안.** 폰에서는 **네이티브 `<select>`** 를 기본으로 씁니다. OS 선택기가 한 손 조작과 접근성을 이미 해결하기 때문입니다. 커스텀 목록은 PC 백오피스나 옵션에 보조 정보(강사 표시명 등)를 함께 보여줘야 할 때만 씁니다.

회원처럼 **수가 많고 검색이 필요한 대상은 Select로 만들지 않습니다.** 검색 TextField + List를 Modal(모바일 시트)에 담은 "선택 시트" 패턴으로 구성합니다. 예약 생성의 회원 선택이 이 경우입니다.

**접근성.** 커스텀 목록은 `role="combobox"` 트리거 + `role="listbox"` / `role="option"`, `aria-selected`, 방향키·Home·End·글자 입력 탐색, Esc로 닫고 트리거로 포커스 복귀를 지킵니다.

**사용 토큰.** TextField의 토큰 + `selection.*`, `primitive.shadow.action`, `layer.popover`(추가)

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
| 테두리 | 2px `border.strong`, radius 0 | 2px `border.strong`, `primitive.radius.signal` | 트랙 2px `border.strong`, radius 0. 손잡이도 사각 |
| 선택 표시 | 검정 체크(선 두께 2px 이상) | 가운데 12px 검정 점 | 손잡이가 오른쪽으로 이동(트랙 안쪽 여백 2px) |
| 라벨 | 14px / 1.6 (`typography.body`), 컨트롤과 12px | 동일 | 동일 |
| 줄 높이(클릭 영역) | 최소 44px | 최소 44px | 최소 44px |
| 항목 간 간격 | 세로 0(줄 높이 44px가 간격 역할), 가로 배치는 24px | 동일 | — |

**상태.**

| 상태 | Checkbox · Radio | Switch |
| --- | --- | --- |
| 꺼짐 | 면 `background.canvas` | 트랙 `background.canvas`, 손잡이 `text.primary` 왼쪽 |
| 켜짐 | 면 `selection.background`, 표시 `selection.foreground` | 트랙 `selection.background`, 손잡이 `text.primary` 오른쪽 |
| 부분 선택(Checkbox) | 면 `selection.background` + 가로 막대 | — |
| hover | 꺼짐 상태의 면이 `background.subtle` | 동일 |
| focus | 컨트롤에 보라 3px outline + 2px offset | 동일 |
| error | 컨트롤 테두리 `feedback.error.border`, 그룹 아래 오류 문구 | — |
| disabled | 면 `action.disabled.background`, 테두리 `border.subtle`, 라벨 `action.disabled.foreground` | 동일 |
| loading | — | 서버 반영 중: 손잡이 안에 스피너, `aria-busy`, 중복 조작 차단. 실패하면 원래 위치로 되돌리고 Toast로 알림 |

**접근성.**

- 네이티브 `<input type="checkbox|radio">`를 쓰고 모양만 바꿉니다. Switch는 `role="switch"` + `aria-checked`
- Radio·Checkbox 그룹은 `<fieldset>` + `<legend>`로 묶습니다. Radio는 방향키로 이동합니다
- Switch는 색만으로 상태를 전달하지 않도록 손잡이 위치에 더해 "공개" / "비공개" 같은 상태 문구를 옆에 둡니다
- 선택지가 2~4개이고 짧으면 Radio 대신 기존 ClassFilter와 같은 버튼형 단일 선택도 쓸 수 있습니다

**사용 토큰.** `background.canvas`, `background.subtle`, `selection.*`, `text.primary`, `border.strong`, `border.subtle`, `feedback.error.border`, `action.disabled.*`, `focus.color`, `primitive.radius.signal`(Radio), `typography.body`

**미결.** Radio의 원형은 "radius 0, 원형 신호만 예외" 원칙의 예외를 넓히는 것입니다. 사각 Radio는 Checkbox와 구분되지 않아 원형을 제안했지만 디자인 확인이 필요합니다. 수업 공개 전환을 즉시 반영(Switch)으로 할지 확인 단계를 둘지도 미결입니다.

---

## DatePicker · TimePicker

**용도.** 수업 개설의 시작 날짜·시각 입력. 예약 생성에서 세션이 없어 즉석으로 만들 때(ad-hoc)의 날짜·시각 입력. 공개 캘린더와 일정 화면의 **날짜 이동**은 이 컴포넌트가 아니라 README의 DateStrip을 씁니다.

**구조.**

- 트리거: TextField와 같은 필드 상자. 뒤 요소에 달력 또는 시계 아이콘 20px
- 달력 패널(커스텀일 때): 머리글(이전 달 · `2026년 10월` · 다음 달) + 요일 줄 + 날짜 격자 7열
- 시각 목록(커스텀일 때): Select의 목록과 같은 모양

**수치.**

| 항목 | 값 |
| --- | --- |
| 트리거 | TextField와 동일. 날짜와 시각을 나란히 둘 때 간격 12px, 360px 폭에서는 세로로 쌓음 |
| 패널 | 2px `border.strong`, `primitive.shadow.action`(4px), 패딩 12px, `layer.popover`(추가). 모바일은 하단 시트 |
| 날짜 칸 | 44 × 44px, 글자 14px, tabular-nums. 패널 폭 = 44 × 7 + 패딩 24 + 테두리 4 = 336px |
| 머리글 | 높이 44px. 이전·다음 버튼 44 × 44px, 연·월은 `typography.title` |
| 요일 줄 | 높이 32px, 12px `text.secondary` |

**상태.**

| 상태 | 표현 |
| --- | --- |
| 트리거 default / hover / focus / error / disabled | TextField와 동일 |
| 날짜 칸 default | `background.canvas`, `text.primary` |
| 날짜 칸 hover | `background.subtle` |
| 오늘 | 2px `border.strong` 테두리 + `aria-current="date"` |
| 선택됨 | `selection.background` + `selection.foreground` + 2px 테두리, `aria-selected="true"` |
| 선택 불가 | `action.disabled.foreground`, `aria-disabled="true"`. 취소선으로 한 번 더 구분 |
| 다른 달의 날짜 | 표시하지 않음(빈 칸) |
| loading | 강사 가용시간 등을 불러와 후보를 제한할 때 패널에 스피너. 값 입력 자체는 막지 않음 |

**동작 제안.**

- 폰에서는 **네이티브 `<input type="date">` / `<input type="time">`** 을 기본으로 씁니다. 커스텀 패널은 PC 또는 선택 불가 날짜를 보여줘야 할 때만 씁니다
- 표시는 샵 타임존(`shop.timezone`) 기준입니다. 타임존이 `Asia/Seoul`이 아닌 샵에서는 필드 도움말에 타임존을 적습니다
- 종료 시각은 입력받지 않고 서비스의 소요 시간(`service.duration_minutes`)으로 계산해 읽기 전용으로 보여줍니다([data-model.md](../spec/data-model.md))
- 날짜와 시각은 각각의 필드로 두고 하나의 `<fieldset>`("수업 시작")으로 묶습니다

**접근성.** 달력 격자는 `role="grid"`, 방향키로 날짜 이동, PageUp/PageDown으로 달 이동, Enter로 선택, Esc로 닫고 트리거로 포커스 복귀. 직접 입력(`2026-10-04`)도 허용합니다. 형식 오류는 Form 오류 규칙을 따릅니다.

**사용 토큰.** TextField의 토큰 + `selection.*`, `text.secondary`, `typography.title`, `typography.label`, `primitive.shadow.action`, `layer.popover`(추가), `component.sheet`(모바일)

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
| 라벨 | 14px / 1.4 / 700 (`typography.fieldLabel`(추가)), `text.primary`. 컨트롤 위, 간격 8px |
| 도움말 | 12px / 1.4 (`typography.label`), `text.secondary`. 컨트롤 아래 8px |
| 오류 문구 | 12px / 1.4 (`typography.label`), `feedback.error.foreground`. 앞에 16px 오류 아이콘(`feedback.error.border` 색), 아이콘과 4px |
| 필드 간 간격 | 20px |
| 섹션 간 간격 | 32px. 섹션 제목은 `typography.title`(18px / 1.3) |
| 폼 폭 | 모바일 100%(화면 가로 여백 16px). PC는 최대 480px(`responsive.formMaxWidth`(추가)) 한 열 |
| 제출 영역 | 주 버튼은 README 버튼 계약(최소 높이 48px, `primitive.shadow.action`). 모바일은 폭 100%로 화면 하단에 고정, 위쪽 2px `border.strong` 구분선 + safe-area 여백. PC는 폼 끝에 오른쪽 정렬, 버튼 간격 12px |
| 그림자 여유 | 버튼 그림자가 잘리지 않도록 제출 영역 오른쪽·아래에 최소 6px |

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

**서버 오류 요약.** 폼 맨 위에 둡니다. 면 `feedback.error.background`, 2px `feedback.error.border`, 글자 `feedback.error.foreground`, 패딩 12px 16px, 앞에 오류 아이콘 20px. 예: 예약 생성의 409(정원 마감·닫힌 수업·지난 수업 — [lifecycle.md 4절](../spec/lifecycle.md)).

**접근성.**

- 필수 표시는 색이나 `*` 단독으로 하지 않습니다. 대부분이 필수이므로 **선택 항목에만 "(선택)"** 을 붙이고 필수 필드에는 `aria-required="true"`를 둡니다
- 제출 시 오류가 있으면 첫 오류 필드로 포커스를 옮기고, 오류 요약은 `role="alert"`로 알립니다
- 오류 문구는 무엇이 잘못됐고 어떻게 고치는지를 적습니다("전화번호 형식이 올바르지 않아요"보다 "숫자만 10~11자리로 입력해주세요")
- `autocomplete` 값을 지정합니다(로그인 `username`·`current-password`, 변경 `new-password`). 회원 등록의 이름·전화번호는 운영자 본인의 정보가 채워지지 않도록 `autocomplete="off"`
- Enter 제출은 한 줄 필드에서만 동작하고 Textarea에서는 줄바꿈입니다

**사용 토큰.** `text.primary`, `text.secondary`, `feedback.error.*`, `border.strong`, `typography.label`, `typography.title`, `typography.fieldLabel`(추가), `primitive.space.4/8/12/16/20/32`, `component.button`, `primitive.shadow.action`, `responsive.formMaxWidth`(추가)

**미결.** 서버 오류 응답 형식(필드별 오류 코드)이 정해지지 않아 필드 귀속 규칙은 가정입니다. 저장하지 않고 화면을 떠날 때의 확인창 적용 범위도 미결입니다.

---

## Table · List

**용도.** 여러 건을 훑어보고 한 건으로 들어갑니다. shop 목록(백오피스), 회원 목록, 예약 목록.

**어느 것을 쓰나.**

| 화면 폭 | 구성 | 대상 |
| --- | --- | --- |
| 1024px 미만 | List | 회원 목록, 예약 목록 (운영자 화면의 기본) |
| 1024px 이상 | Table | shop 목록(백오피스는 PC 기준), 회원·예약 목록의 PC 보기 |

같은 데이터를 폭에 따라 다른 구조로 보여줍니다. Table을 가로 스크롤로 폰에 밀어 넣지 않습니다.

### Table

**구조.** 표 상자 > 머리글 행 > 본문 행 > (아래) Pagination. 행 전체가 상세로 가는 링크이고, 행 안의 개별 행동은 마지막 열의 아이콘 버튼으로 분리합니다.

| 항목 | 값 |
| --- | --- |
| 표 상자 | 2px `border.strong`, radius 0, 그림자 없음, 면 `background.canvas` |
| 머리글 행 | 높이 44px, 면 `background.subtle`, 글자 12px / 1.4 / 700 `text.secondary`, 아래 2px `border.strong` |
| 본문 행 | 최소 높이 48px, 행 사이 1px `border.subtle` |
| 셀 패딩 | 세로 12px, 가로 16px |
| 본문 글자 | 14px / 1.6 (`typography.body`). 날짜·시각·전화번호는 tabular-nums |
| 정렬 | 텍스트 왼쪽, 숫자 오른쪽, 상태 배지 왼쪽 |
| 행 행동 버튼 | 아이콘 20px, 클릭 영역 44 × 44px |
| 긴 텍스트 | 한 줄 말줄임. 이름 열은 최소 폭 120px |

### List (모바일)

두 가지 행 모양을 제안합니다.

| 종류 | 대상 | 구조 | 수치 |
| --- | --- | --- | --- |
| 구분선 리스트 | 회원 목록 | 하나의 상자 안에 행을 쌓음. 행: 주 텍스트(이름) + 보조 텍스트(전화번호) + 오른쪽 화살표 | 상자 2px `border.strong`. 행 최소 높이 64px, 패딩 12px 16px, 행 사이 1px `border.subtle`. 주 텍스트 `typography.title`(18px / 1.3), 보조 14px `text.secondary`, 화살표 20px |
| 카드 리스트 | 예약 목록 | README의 ClassCard 구조 재사용. 시간 열 + 본문(수업명·회원·강사) + 상태 배지 | `component.classCard` 그대로: 패딩 16px, 행 간격 12px, 시간 열 최소 76px, 강조선 6px, `primitive.shadow.row`(3px), 2px 테두리 |

회원 목록은 건수가 많고 한 건의 정보가 적어 구분선 리스트로, 예약 목록은 시간이 핵심이고 상태가 다양해 카드 리스트로 나눴습니다.

**상태(Table·List 공통).**

| 상태 | 표현 |
| --- | --- |
| default | 위 수치 |
| hover | 행 면 `background.subtle`. 카드는 면 변화 없이 커서만 |
| focus | 행 링크에 보라 3px outline. 표 행·구분선 리스트 행은 안쪽 outline(`outline-offset: -3px`), 카드는 바깥 2px offset |
| 선택됨 | `selection.background` + `selection.foreground`. 다중 선택이 필요해지면 첫 열에 Checkbox |
| error | 목록 자리에 EmptyState의 오류 변형(재시도 버튼) |
| disabled | 취소된 예약·수업 행: 투명도를 낮추지 않습니다. 배지와 `text.secondary`로 구분하고 읽을 수 있게 유지합니다(README P0 지적과 같은 원칙) |
| loading | 행 모양의 스켈레톤 5개(`background.subtle` 면, 움직임 없음 또는 300ms 깜빡임). 목록 컨테이너에 `aria-busy="true"` |
| 빈 목록 | EmptyState |

**접근성.**

- Table은 `<table>` + `<th scope="col">`. 제목은 `<caption>` 또는 `aria-labelledby`
- 행 전체 클릭은 첫 열의 링크를 행 전체로 넓히는 방식으로 구현하고, 행 안에 버튼을 중첩하지 않습니다(README P1의 중첩 버튼 문제를 반복하지 않음)
- List는 `<ul>` / `<li>`. 카드의 상세 링크와 행동 버튼은 형제로 둡니다
- 정렬 가능한 머리글은 `<button>` + `aria-sort`

**사용 토큰.** `background.canvas`, `background.subtle`, `text.primary`, `text.secondary`, `border.strong`, `border.subtle`, `selection.*`, `focus.color`, `typography.body`, `typography.title`, `typography.label`, `component.classCard`, `primitive.shadow.row`, `component.table`(추가), `component.listRow`(추가)

**미결.** 각 목록의 열·정렬·필터 구성(예: 예약 목록의 기본 기간, 회원 목록에 최근 예약일을 보여줄지), 정렬을 서버에서 하는지, 회원 목록에서 전화번호 전체를 보여줄지 일부를 가릴지.

### StatusBadge (목록에서 쓰는 상태 표시)

README의 BookingBadge를 운영 상태로 넓힌 제안입니다. 상태 값 자체는 [lifecycle.md](../spec/lifecycle.md)에 확정된 것만 씁니다. **표시 문구와 색은 제안**입니다.

| 수치 | 값 |
| --- | --- |
| 크기 | 최소 높이 24px, 패딩 4px 8px, 글자 12px / 1.4 / 700 (`typography.label`) |
| 테두리 | 1px `border.strong`(`primitive.border.fine`), radius 0 |
| 동작 | 정보 표시 전용. 클릭 동작 없음 |

| 대상 | 값 | 문구(제안) | 배경 / 글자 | 토큰 |
| --- | --- | --- | --- | --- |
| 예약 | `BOOKED`, 수업 종료 전 | 예약 | yellow / ink | `booking.confirmed.*` |
| 예약 | `BOOKED`, 수업 종료 후(조회 시 판정) | 완료 | surface / ink | `booking.completed.*`(추가) |
| 예약 | `CANCELLED` | 취소 | surface2 / inkSoft | `booking.cancelled.*` |
| 예약 | `NO_SHOW` | 노쇼 | ink / paper | `booking.noShow.*`(추가) |
| 수업 | `OPEN` | 예약 가능 | paper / ink | `session.open.*`(추가) |
| 수업 | `CLOSED` | 마감 | surface2 / ink | `session.closed.*`(추가) |
| 수업 | `CANCELLED` | 휴강 | surface2 / inkSoft | `session.cancelled.*`(추가) |
| 수업 | `is_public = true` | 공개 | purpleTint / purpleDeep | `visibility.public.*`(추가) |
| 수업 | `is_public = false` | 비공개 | surface / inkSoft | `visibility.private.*`(추가) |

- "완료"는 저장된 상태가 아니라 `BOOKED` + 수업 종료 시각 경과로 조회 시 판정합니다(2026-10-01 A안). 완료 처리 버튼은 만들지 않습니다
- 수업 상태와 공개 여부는 직교한 축이라 배지를 따로 둡니다(`OPEN`이면서 비공개 가능)
- 정원이 찬 것은 상태가 아닙니다. `마감` 배지는 사장이 명시적으로 닫은 `CLOSED`에만 쓰고, 정원은 `3 / 3`처럼 숫자(CapacityMeter)로 보여줍니다
- 대기(`booking.waitlist.*`)는 슬라이스 1에 대기자가 없어 운영자 화면에서 쓰지 않습니다

---

## Tabs

**용도.** 한 화면 안에서 같은 대상의 다른 면을 전환합니다. 화면 이동(내비게이션)에는 쓰지 않습니다. 후보: 회원 상세의 정보 / 예약 이력, 예약 목록의 예정 / 지난 예약.

README의 ClassFilter(`aria-pressed`, 목록 필터)와 다릅니다. Tabs는 패널을 바꾸고, 필터는 같은 목록을 좁힙니다.

**구조.** 탭 목록(가로) + 탭 패널. (선택) 탭 안에 건수.

**수치.**

| 항목 | 값 |
| --- | --- |
| 탭 목록 | 아래 2px `border.strong`. 가로 스크롤 허용, 줄바꿈 금지(`white-space: nowrap`) |
| 탭 | 높이 48px, 가로 패딩 16px, 최소 폭 44px. 글자 14px / 1.4 / 700 |
| 탭 사이 | 간격 0. 선택된 탭만 위·좌·우 2px 테두리 |
| 건수 | 탭 글자 뒤 8px, 12px tabular-nums |
| 패널 | 탭 목록 아래 16px부터 내용 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default | 면 `background.canvas`, 글자 `text.secondary` |
| hover | 면 `background.subtle`, 글자 `text.primary` |
| 선택됨 | 면 `selection.background`, 글자 `selection.foreground`, 위·좌·우 2px `border.strong`. `aria-selected="true"` |
| focus | 보라 3px outline. 스크롤 영역에 잘리지 않도록 안쪽 outline |
| disabled | 글자 `action.disabled.foreground`, `aria-disabled="true"`. 가능하면 비활성 대신 탭을 숨기지 않고 빈 상태를 보여줍니다 |
| loading | 탭은 바로 전환하고 패널에 스켈레톤. 탭 자체에는 로딩 표시 없음 |
| error | 패널에 EmptyState의 오류 변형 |

**접근성.** `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-controls` 연결. 좌우 방향키로 탭 이동, Home/End, 선택된 탭만 `tabindex="0"`. 선택 상태를 색만이 아니라 테두리와 `aria-selected`로 전달합니다.

**사용 토큰.** `background.canvas`, `background.subtle`, `selection.*`, `text.primary`, `text.secondary`, `border.strong`, `action.disabled.foreground`, `focus.color`, `typography.fieldLabel`(추가)

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
| 형태 | 화면 가운데 상자 | 하단 시트(README의 DetailSheet와 같은 틀) |
| 폭 | 최대 480px, 화면 좌우 최소 16px 여백 | 100% |
| 높이 | 최대 화면의 88%, 본문만 스크롤 | 최대 88%(`component.sheet.maxHeight`), 본문 독립 스크롤, safe-area 하단 여백 |
| 테두리·그림자 | 2px `border.strong`, `primitive.shadow.emphasis`(5px) | 위쪽 2px `border.strong`, 그림자 없음 |
| 패딩 | 24px | 20px 16px |
| 제목 | `typography.title`(18px / 1.3) 700. 닫기 버튼 44 × 44px | 동일 |
| 본문 | 14px / 1.6, 제목 아래 12px | 동일 |
| 버튼 줄 | 본문 아래 24px. 오른쪽 정렬, 간격 12px. 보조(왼쪽) → 주(오른쪽) | 폭 100%로 세로 쌓기, 간격 12px. 주 버튼이 위. 하단 고정 |
| 가림막 | `overlay.scrim`(추가) | 동일 |
| 레이어 | `layer.sheet`(50) | 동일 |

**확인창의 내용 규칙.**

- 제목은 행동을 그대로 묻습니다("이 수업을 휴강 처리할까요?"). "확인" 같은 제목을 쓰지 않습니다
- 본문은 **무엇이 바뀌고 되돌릴 수 있는지**를 적습니다. 수업 취소는 딸린 예약이 함께 취소되므로 영향받는 예약 건수를 보여줍니다([lifecycle.md 5절](../spec/lifecycle.md))
- 버튼 문구는 행동 그대로("휴강 처리", "노쇼 기록"). "예 / 아니오"를 쓰지 않습니다
- 위험한 행동의 실행 버튼은 `danger` 변형, 그만두는 버튼은 `secondary`. 처음 포커스는 그만두는 버튼에 둡니다
- 수업 취소가 끝나면 **영향받은 회원 명단**을 결과로 보여줍니다. 사장이 그 명단으로 연락해야 하기 때문입니다(같은 절)

**상태.**

| 상태 | 동작 |
| --- | --- |
| default | 열릴 때 150ms(`motion.fast`). reduced motion에서는 즉시 |
| hover / focus | 내부 버튼·필드 각자의 규칙 |
| loading | 실행 버튼 loading, 닫기·그만두기 비활성, 가림막 클릭으로 닫히지 않음 |
| error | 창을 닫지 않고 본문 아래에 오류 문구(`role="alert"`) + 다시 시도 가능 |
| disabled | 실행 조건이 안 되면 버튼을 비활성으로 두기보다 열기 전에 이유를 알려줍니다 |

**접근성.**

- 작업 Modal은 `role="dialog"`, 확인창은 `role="alertdialog"`. 둘 다 `aria-modal="true"`, 제목을 `aria-labelledby`, 본문을 `aria-describedby`로 연결
- 포커스 가두기, 닫으면 열었던 요소로 포커스 복귀, 배경 `inert`(README P0 지적 사항)
- Esc로 닫습니다. 가림막 클릭으로 닫는 것은 작업 Modal만 허용하고 확인창에서는 닫히지 않습니다
- 입력 중인 내용이 있는 작업 Modal은 닫기 전에 내용이 사라진다는 것을 알립니다

**사용 토큰.** `background.canvas`, `text.primary`, `border.strong`, `primitive.shadow.emphasis`, `component.sheet`, `layer.sheet`, `motion.fast`, `typography.title`, `typography.body`, `action.secondary.*`, `action.primary.*`, `overlay.scrim`(추가), `action.danger.*`(추가), `component.modal`(추가)

**미결.** 예약 취소에 확인 단계를 둘지는 취소 정책이 정해진 뒤 결정합니다(README와 같은 입장). 수업 취소와 노쇼는 상태 전이도에서 되돌리는 경로가 없어 확인창을 제안했지만 확정은 아닙니다. 노쇼를 잘못 기록했을 때의 정정 경로는 근거 문서에 없습니다.

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
| 면·테두리·그림자 | `background.canvas`, 2px `border.strong`, `primitive.shadow.action`(4px) |
| 상태 아이콘 | 24 × 24px 사각. 성공은 `selection.background` 면 + 검정 체크. 실패는 `feedback.error.border` 색 아이콘, 상자 테두리도 `feedback.error.border` |
| 문구 | 14px / 1.6 `text.primary`. 최대 2줄 |
| 닫기 | 아이콘 20px, 클릭 영역 44 × 44px |
| 위치 | 모바일: 하단 가운데, 하단 내비게이션(또는 고정 제출 영역) 위 16px. PC: 오른쪽 아래 24px |
| 쌓기 | 최대 3개, 간격 8px. 새 알림이 아래 |
| 레이어 | `layer.toast`(60) |
| 표시 시간 | 4000ms(`motion.toast`(추가)). 실패 알림은 자동으로 닫지 않음 |

README는 버튼의 success 피드백을 2000ms로 관찰했습니다. 한국어 한 문장과 닫기 버튼을 인지하기엔 짧아 Toast는 4000ms를 따로 제안합니다.

**상태.**

| 상태 | 표현 |
| --- | --- |
| 성공(default) | 위 수치. `role="status"` |
| 실패(error) | 테두리·아이콘 `feedback.error.border`. `role="alert"`. 자동으로 닫지 않음 |
| hover / focus | 표시 시간 타이머 일시 정지. 내부 버튼은 버튼 규칙 |
| loading | 쓰지 않습니다. 진행 중은 버튼 loading으로 표시 |
| disabled | 해당 없음 |

**접근성.**

- 포커스를 가져가지 않습니다. live region은 화면에 미리 있어야 읽히므로 컨테이너를 항상 렌더링해 둡니다
- 문구만으로 의미가 통해야 합니다("예약이 취소됐어요"). 아이콘은 `aria-hidden`
- reduced motion에서는 미끄러지는 등장 대신 즉시 표시
- 문구는 README의 [예약 상태와 피드백](README.md#예약-상태와-피드백) 표의 어조를 따릅니다

**사용 토큰.** `background.canvas`, `text.primary`, `border.strong`, `selection.background`, `feedback.error.border`, `primitive.shadow.action`, `layer.toast`, `typography.body`, `motion.fast`, `motion.toast`(추가), `component.toast`(추가)

**미결.** "실행 취소" 같은 되돌리기 행동은 서버가 지원해야 합니다. 예약 취소·노쇼는 되돌리는 전이가 없으므로 지금은 넣지 않습니다.

---

## EmptyState

**용도.** 목록이나 화면에 보여줄 것이 없을 때 **왜 비었는지와 다음에 할 일**을 알려줍니다. README 컴포넌트 계약의 EmptyState(title, description, action)에 수치와 변형을 더했습니다.

**구조.** (선택) 장식 1개 + 제목 + 설명 + (선택) 행동 버튼 1개.

**수치.**

| 항목 | 값 |
| --- | --- |
| 정렬 | 가운데. 글 최대 폭 360px |
| 패딩 | 세로 32px, 가로 24px. 화면 전체형은 세로 64px |
| 장식 | 최대 64px, README의 장식 요소 중 1개. `aria-hidden` |
| 제목 | `typography.title`(18px / 1.3) 700, 장식 아래 16px |
| 설명 | 14px / 1.6 `text.secondary`, 제목 아래 8px |
| 버튼 | 설명 아래 20px. README 버튼 계약 |
| 테두리 | 목록 상자 안에 들어갈 때는 자체 테두리 없음. 단독일 때 2px `border.strong`은 선택 |

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

**사용 토큰.** `text.primary`, `text.secondary`, `border.strong`, `typography.title`, `typography.body`, `primitive.space.8/16/20/24/32/64`, `component.button`

**미결.** 장식을 운영자 화면에도 쓸지(업무 화면에서는 생략하는 안), 각 화면의 실제 문구.

---

## Pagination

**용도.** 건수가 많은 목록을 나눠 보여줍니다. shop 목록, 회원 목록, 예약 목록.

**구조.** 이전 버튼 + 페이지 번호들 + 다음 버튼. (선택) "1–20 / 132명" 같은 범위 표시.

**수치.**

| 항목 | 값 |
| --- | --- |
| 버튼 | 44 × 44px, 2px `border.strong`, radius 0, 그림자 없음. 글자 14px tabular-nums |
| 간격 | 버튼 사이 8px. 목록과는 16px |
| 번호 개수 | PC: 처음 · 현재 주변 5개 · 끝 + 말줄임(`…`). 모바일: 번호를 숨기고 `이전 · 3 / 12 · 다음` |
| 정렬 | PC 오른쪽, 모바일 가운데(양 끝 정렬) |
| 범위 표시 | 12px `text.secondary`. PC는 왼쪽, 모바일은 위 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| default | 면 `action.secondary.background`, 글자 `action.secondary.foreground` |
| hover | 면 `background.subtle` |
| 현재 페이지 | 면 `selection.background`, 글자 `selection.foreground`, `aria-current="page"`. 누를 수 없음 |
| focus | 보라 3px outline + 2px offset |
| disabled | 첫 페이지의 이전·마지막 페이지의 다음: `action.disabled.*`, `disabled` 속성 |
| loading | 누른 버튼만 스피너, 목록은 스켈레톤. 다른 버튼은 중복 조작 차단 |
| error | 목록이 EmptyState 오류 변형을 보여주고 Pagination은 이전 상태 유지 |

**접근성.** `<nav aria-label="페이지 이동">` 안의 버튼 목록. 번호 버튼은 "3페이지"처럼 읽히는 이름을 가집니다. 페이지가 바뀌면 포커스를 목록 맨 위로 옮기고 범위 표시를 `role="status"`로 알립니다. 한 페이지뿐이면 컴포넌트를 렌더링하지 않습니다.

**사용 토큰.** `action.secondary.*`, `background.subtle`, `selection.*`, `action.disabled.*`, `border.strong`, `text.secondary`, `focus.color`, `typography.body`, `typography.label`

**미결.** 목록 API의 페이지 방식(번호·커서)과 페이지 크기가 정해지지 않았습니다. 커서 방식이면 번호 대신 "더 보기" 버튼(폭 100%, secondary) 하나로 바꿉니다. 폰에서는 "더 보기"가 더 맞을 수 있어 화면 기획 때 함께 정합니다.

---

## AppShell

**용도.** 로그인 후 모든 화면을 감싸는 틀. **지금 어느 샵에 있는지**를 항상 보여주고 주요 화면으로 이동시킵니다. 경로 방식에서는 모든 샵이 같은 주소 체계를 쓰므로([tenancy.md 5절](../spec/tenancy.md)) 헤더에서 샵을 식별할 수 있어야 합니다.

**종류.**

| 종류 | 대상 | 기준 폭 | 구성 |
| --- | --- | --- | --- |
| 사업장 Shell | staff. `/{shop-key}/...` | 폰 우선 | shop-key 헤더 + 하단 내비게이션(모바일) / 사이드바(PC) |
| 백오피스 Shell | platform_admin. `/backoffice/...` | PC | 보라 헤더 + 사이드바. shop-key 없음 |
| 인증 레이아웃 | 로그인, 강제 비밀번호 변경 | 폰 우선 | 내비게이션 없음. 가운데 상자 하나 |
| 공개 레이아웃 | 공개 캘린더(비로그인) | 폰 우선 | 샵 이름만 있는 헤더. 내비게이션·로그인 정보 없음 |

### 사업장 Shell

**구조.**

```
모바일 (1024px 미만)                 PC (1024px 이상)
┌──────────────────────────┐        ┌────────┬──────────────────────┐
│ 샵 이름          [사용자] │ 헤더   │ 샵 이름 │ 화면 제목     [사용자] │
│ /shop-key                │        │ /key   ├──────────────────────┤
├──────────────────────────┤        │        │                      │
│                          │        │ 내비    │  본문                 │
│  본문                     │        │ 항목    │                      │
│                          │        │        │                      │
├──────────────────────────┤        │        │                      │
│  항목 │ 항목 │ 항목 │ 항목 │ 하단   │        │                      │
└──────────────────────────┘        └────────┴──────────────────────┘
```

**수치.**

| 항목 | 값 |
| --- | --- |
| 헤더 | 높이 56px, 가로 패딩 16px(PC 24px), 아래 2px `border.strong`, 면 `background.canvas`, 상단 고정, `layer.header`(10) |
| 샵 이름 | `typography.title`(18px / 1.3) 700, 한 줄 말줄임 |
| shop-key | 샵 이름 아래 12px / 1.4 `text.secondary`, `/{shop-key}` 형식 |
| 사용자 버튼 | 44 × 44px. 누르면 메뉴(이름, 비밀번호 변경, 로그아웃). 메뉴는 Select 목록과 같은 모양(2px 테두리, `primitive.shadow.action`, `layer.popover`(추가)) |
| 하단 내비게이션 | 높이 56px + safe-area 하단 여백, 위 2px `border.strong`, 면 `background.canvas`, 하단 고정, `layer.header`(10). 항목 3~5개, 같은 폭 |
| 내비 항목(모바일) | 아이콘 20px + 라벨 12px / 1.4, 세로 배치, 간격 4px. 클릭 영역은 칸 전체(최소 44px) |
| 사이드바(PC) | 폭 240px, 오른쪽 2px `border.strong`. 위쪽에 샵 이름·shop-key(패딩 16px) |
| 내비 항목(PC) | 높이 48px, 가로 패딩 16px, 아이콘 20px + 라벨 14px / 700, 간격 12px |
| 본문 | 가로 여백 모바일 16px, PC 24px(README 간격 규칙). 모바일은 하단 내비게이션 높이만큼 아래 여백 |
| 화면 제목 | `typography.heading`(추가, 24px / 1.25 / 700). 모바일은 본문 맨 위, PC는 헤더 안 |

**상태.**

| 상태 | 표현 |
| --- | --- |
| 내비 항목 default | 면 `background.canvas`, 글자 `text.secondary` |
| 내비 항목 hover | 면 `background.subtle`, 글자 `text.primary` |
| 현재 화면 | 면 `selection.background`, 글자 `selection.foreground`, `aria-current="page"`. 색만이 아니라 글자 굵기 700으로도 구분 |
| focus | 보라 3px outline. 칸이 붙어 있으므로 안쪽 outline |
| disabled | 아직 열리지 않은 메뉴는 비활성으로 두지 않고 숨깁니다 |
| loading | Shell은 먼저 그리고 본문만 스켈레톤. 샵 이름을 아직 모르면 그 자리에 스켈레톤 한 줄 |
| error | 본문 자리에 EmptyState. 헤더·내비게이션은 유지 |

**내비게이션 항목(후보).** 슬라이스 1 범위에서 근거가 있는 것은 **예약(일정) · 회원 · 수업** 세 가지입니다. 회원권·LLM 조회는 구현 순서가 뒤이므로 넣지 않았습니다. 항목 이름·순서·첫 화면은 화면 기획에서 정합니다.

### 백오피스 Shell

사업장 Shell과 **한눈에 구분**되도록 헤더 면을 보라로 둡니다. 마스터가 샵 화면과 백오피스를 오갈 때 맥락을 헷갈리지 않게 하려는 제안입니다.

| 항목 | 값 |
| --- | --- |
| 헤더 | 높이 56px, 면 `brand.primary`, 글자 `primitive.color.paper`(대비 5.70:1), 아래 2px `border.strong`. 왼쪽 "DDoukD Backoffice", 오른쪽 사용자 버튼 |
| 사이드바 | 폭 240px. 항목 후보: shop 목록, shop 생성 |
| 본문 | 가로 여백 24px. 표는 본문 폭 전체 |
| 최소 폭 | 1024px. 그 미만은 지원 범위 밖(가로 스크롤) — [mvp.md](../mvp.md)의 "백오피스는 PC 기준" |

보라 헤더 위의 포커스는 보라 outline이 보이지 않으므로 헤더 안 요소만 outline 색을 `primitive.color.paper`로 바꿉니다.

### 인증 레이아웃

| 항목 | 값 |
| --- | --- |
| 상자 | 최대 폭 400px, 가운데. 2px `border.strong`, `primitive.shadow.emphasis`(5px), 패딩 24px. 모바일은 화면 좌우 16px 여백 |
| 위쪽 | 로고(`brand.primary`) + 샵 이름(`typography.heading`(추가)). 샵 이름은 로그인 화면에 노출되는 값입니다([data-model.md](../spec/data-model.md) `shop.name`) |
| 내용 | Form 레이아웃. 주 버튼 폭 100% |

강제 비밀번호 변경(`must_change_password = true`)은 내비게이션이 없는 이 레이아웃을 써서 변경을 마치기 전에는 다른 화면으로 갈 수 없게 합니다.

### 공개 레이아웃

공개 캘린더는 비로그인 화면입니다. 헤더에는 **샵 이름만** 둡니다. 운영자 내비게이션, 사용자 정보, shop-key 외의 내부 식별자를 넣지 않습니다. 본문 구성은 README의 DateStrip·ClassCard·CapacityMeter를 재사용하되, 노출 항목은 [tenancy.md 7절](../spec/tenancy.md)의 "나감" 열에 있는 것만 씁니다(수업명, 시작·종료 시각, 강사 표시명, 잔여 정원·마감 여부). 예약 버튼은 없습니다(조회만).

**접근성(공통).**

- `<header>`, `<nav aria-label="주요 메뉴">`, `<main>` 랜드마크. 첫 요소로 "본문으로 건너뛰기" 링크
- 화면마다 `<h1>` 하나(화면 제목). `<title>`에 화면 제목과 샵 이름을 함께 둡니다
- 하단 내비게이션 라벨은 숨기지 않습니다(아이콘만 두지 않음)
- 360px 폭에서 헤더가 줄바꿈되지 않게 샵 이름을 말줄임합니다(README P1의 헤더 줄바꿈 문제)
- 고정 헤더·내비게이션이 포커스된 요소를 가리지 않도록 `scroll-padding`을 둡니다

**사용 토큰.** `background.canvas`, `background.subtle`, `text.primary`, `text.secondary`, `border.strong`, `selection.*`, `brand.primary`, `focus.color`, `layer.header`, `primitive.shadow.action`, `primitive.shadow.emphasis`, `typography.title`, `typography.label`, `typography.heading`(추가), `layer.popover`(추가), `component.appShell`(추가)

**미결.** 내비게이션 항목·순서·첫 화면, 로그아웃과 사용자 메뉴의 구성, 토큰의 `shop_id`와 URL의 shop-key가 다를 때(403) 보여줄 화면, 세션 만료 시 동작, 공개 캘린더에 운영자 로그인 링크를 둘지, 헤더에 shop-key를 계속 노출할지(샵 이름만으로 충분한지), PC 본문의 최대 폭.

---

## 화면별 사용 컴포넌트

대상 화면은 [mvp.md](../mvp.md)와 [tenancy.md](../spec/tenancy.md), [data-model.md](../spec/data-model.md) "다음 단계"의 API 목록에서 가져왔습니다. 화면 번호는 붙이지 않았습니다. 번호와 이름은 `plans/<작업>/README.md`에서 정합니다. 입력 항목은 데이터 모델의 컬럼을 근거로 한 **후보**이고 화면 구성을 확정하지 않습니다.

| 화면 | 경로(근거) | Shell | 입력 | 목록·표시 | 피드백 |
| --- | --- | --- | --- | --- | --- |
| shop 목록 | `/backoffice/...` | 백오피스 | TextField(검색) | Table, Pagination | EmptyState |
| shop 생성 | `/backoffice/...` | 백오피스 | Form, TextField(샵 이름 · shop-key 접두 · OWNER 이름 · email), Select(타임존) | — | 폼 오류(shop-key 규칙·중복·예약어), 버튼 loading |
| shop 생성 완료 (1회 표시) | 생성 직후 | 백오피스 | TextField(읽기 전용 + 복사) × 3: URL · ID · 임시 비밀번호 | — | Toast(복사됨), 다시 볼 수 없다는 안내 |
| 임시 비밀번호 재발급 | shop 목록·상세에서 | 백오피스 | — | TextField(읽기 전용 + 복사) | 확인창, Toast |
| 사업장 로그인 | `/{shop-key}/login` | 인증 | Form, TextField(email), TextField(비밀번호) | — | 폼 오류 요약, 버튼 loading. shop이 없으면 EmptyState(찾을 수 없음) |
| 비밀번호 변경 | 로그인 직후 강제(`must_change_password`) | 인증 | Form, TextField(비밀번호) | — | 폼 오류, Toast |
| 회원 목록 | `/{shop-key}/...` | 사업장 | TextField(검색) | List(구분선) · PC는 Table, Pagination | EmptyState(처음 · 검색 결과 없음 · 실패) |
| 회원 등록 | 〃 | 사업장 | Form, TextField(이름), TextField(전화번호), Textarea(메모) | — | 폼 오류(전화번호 중복), Toast |
| 회원 상세 | 〃 | 사업장 | — | Tabs(후보), List(카드: 예약 이력), StatusBadge | EmptyState(예약 없음) |
| 회원 메모 | 회원 상세 안 | 사업장 | Textarea | — | Toast(저장됨), 버튼 loading |
| 수업 개설 | 〃 | 사업장 | Form, Select(서비스 · 강사), DatePicker, TimePicker, TextField(정원, 숫자), Checkbox(공개) | 종료 시각(읽기 전용) | 폼 오류(강사 시간 겹침), Toast |
| 수업 공개 · 마감 · 휴강 | 수업 상세 | 사업장 | Switch(공개) | StatusBadge(수업 상태 · 공개 여부), List(예약한 회원) | 확인창(휴강: 영향 건수 → 결과에 회원 명단), Toast |
| 예약 생성 | 〃 | 사업장 | Form, Modal(회원 선택 시트: TextField 검색 + List), Select 또는 List(수업 선택), DatePicker · TimePicker(수업이 없어 즉석 생성할 때) | — | 폼 오류 요약(409: 정원 마감 · 닫힘 · 지난 수업), Toast |
| 예약 목록 | 〃 | 사업장 | Tabs 또는 필터(후보) | List(카드) · PC는 Table, StatusBadge, Pagination | EmptyState |
| 예약 취소 | 예약 행·상세에서 | 사업장 | — | StatusBadge | 확인창(미결), Toast |
| 노쇼 기록 | 예약 행·상세에서 | 사업장 | — | StatusBadge | 확인창, Toast |
| 공개 캘린더 | `/{shop-key}/schedule` | 공개 | 없음(조회만) | README의 DateStrip · ClassCard · CapacityMeter | EmptyState(수업 없음 · 찾을 수 없음) |

컴포넌트 쪽에서 본 사용처입니다.

| 컴포넌트 | 쓰이는 화면 |
| --- | --- |
| TextField | shop 생성 · 생성 완료, 로그인, 비밀번호 변경, 회원 등록, 회원·shop 검색, 수업 개설(정원), 예약 생성(회원 검색) |
| Textarea | 회원 등록, 회원 메모 |
| Select | shop 생성(타임존), 수업 개설(서비스 · 강사), 예약 생성(수업) |
| Checkbox · Radio · Switch | 수업 개설(공개 Checkbox), 수업 상세(공개 Switch). Radio는 현재 확정된 사용처 없음 |
| DatePicker · TimePicker | 수업 개설, 예약 생성(즉석 수업) |
| Form 레이아웃 | 입력이 있는 모든 화면 |
| Table · List | shop 목록, 회원 목록, 회원 상세(예약 이력), 예약 목록, 수업 상세(예약한 회원) |
| Tabs | 회원 상세, 예약 목록(둘 다 후보) |
| Modal · 확인창 | 예약 생성(회원 선택), 휴강, 노쇼, 예약 취소(미결), 임시 비밀번호 재발급 |
| Toast | 저장·등록·취소·기록·복사의 결과 |
| EmptyState | 모든 목록, 공개 캘린더, 찾을 수 없음 |
| Pagination | shop 목록, 회원 목록, 예약 목록 |
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
| 15 | Radio의 원형 예외, 운영자 화면의 장식 사용, 상태 배지 문구·색 | 디자인 확인 | Radio, EmptyState, StatusBadge |
| 16 | 아이콘 세트와 한국어 폰트(README의 Noto Sans KR 추가 제안과 같은 문제) | 디자인·구현 | 전체 |
| 17 | 다크 모드 | 범위 밖 | README와 같이 라이트 우선 |

---

## 추가가 필요한 토큰

`tokens.json`에 없어서 이 문서가 임시 이름으로 쓴 값입니다. 전부 **제안**이고 `tokens.json`은 고치지 않았습니다. 색은 새 원시 색 없이 기존 원시 색을 참조합니다.

### 의미 색 (semantic)

| 이름 | 값 | 이유 |
| --- | --- | --- |
| `overlay.scrim` | `rgba(17,17,17,0.5)` (ink 50%) | Modal·시트의 배경 가림막. 기존 `rule`(14%)은 구분선용이라 배경을 가리지 못함 |
| `action.danger.background` | `primitive.color.paper` → `#FFFFFF` | README 버튼 계약에 `danger` 변형이 있으나 색 토큰이 없음. 흰 글자 / 빨간 면은 4.29:1로 금지이므로 흰 면으로 둠 |
| `action.danger.foreground` | `primitive.color.ink` → `#111111` | 〃 |
| `action.danger.border` | `primitive.color.destructive` → `#E23B2E` | 〃 위험 행동을 테두리 색 + 문구로 구분(비텍스트 대비 4.29:1) |
| `booking.noShow.background` | `primitive.color.ink` → `#111111` | 예약 상태 `NO_SHOW`의 배지. 기존 토큰은 confirmed·waitlist·cancelled뿐 |
| `booking.noShow.foreground` | `primitive.color.paper` → `#FFFFFF` | 〃 (18.88:1) |
| `booking.completed.background` | `primitive.color.surface` → `#F5F5F7` | "완료"(BOOKED + 수업 종료 경과, 조회 시 판정)의 배지. 예약 중인 노랑과 구분 |
| `booking.completed.foreground` | `primitive.color.ink` → `#111111` | 〃 (17.34:1) |
| `session.open.background` / `.foreground` | `paper` / `ink` | 수업 상태 `OPEN` 배지. 수업 상태 토큰이 없음 |
| `session.closed.background` / `.foreground` | `surface2` / `ink` | 수업 상태 `CLOSED`(임시 마감) 배지 (15.88:1) |
| `session.cancelled.background` / `.foreground` | `surface2` / `inkSoft` | 수업 상태 `CANCELLED` 배지. `booking.cancelled.*`와 같은 값 (5.72:1) |
| `visibility.public.background` / `.foreground` | `purpleTint` / `purpleDeep` | `is_public = true` 배지. 수업 상태와 직교한 축이라 별도 역할 (7.90:1) |
| `visibility.private.background` / `.foreground` | `surface` / `inkSoft` | `is_public = false` 배지 (6.24:1) |

### 타이포그래피

| 이름 | 값 | 이유 |
| --- | --- | --- |
| `typography.control` | body 폰트, 16px / 1.4 | 입력 글자. 기존 `body`는 14px인데 iOS Safari가 16px 미만 입력에 포커스하면 화면을 확대함 |
| `typography.fieldLabel` | body 폰트, 14px / 1.4, 굵기 700 | 폼 라벨·탭·내비 항목. 기존 `label`(12px)은 폰에서 필드 라벨로 작고, 굵기 토큰이 없음 |
| `typography.heading` | body 폰트, 24px / 1.25, 굵기 700 | 화면 제목. README 타이포 표에는 24px / 1.25가 있으나 `tokens.json`에는 `title`(18px)까지만 있음 |

### 레이어 · 모션

| 이름 | 값 | 이유 |
| --- | --- | --- |
| `layer.popover` | `30` | Select 목록·달력 패널·사용자 메뉴. `header`(10)보다 위, `sheet`(50)보다 아래가 필요 |
| `motion.toast` | `4000` ms | Toast 표시 시간. 기존 `feedback`(2000ms)은 버튼 안 완료 표시 기준이라 문장을 읽기엔 짧음 |

### 컴포넌트 · 반응형 수치

| 이름 | 값 | 이유 |
| --- | --- | --- |
| `component.field` | `minHeight 48`, `paddingX 12`, `iconSize 20`, `gap 8`, 테두리 `primitive.border.strong`, 그림자 없음 (px) | TextField·Select·DatePicker 트리거의 공통 상자. 기존 component 토큰은 button·classCard·sheet·focus뿐 |
| `component.textarea` | `minHeight 120`, `maxHeight 320`, `padding 12` (px) | 메모 입력의 높이 범위 |
| `component.choice` | `boxSize 24`, `labelGap 12`, `rowMinHeight 44`, `switchTrack 48 × 28`, `switchThumb 20` (px) | Checkbox·Radio·Switch의 크기 |
| `component.table` | `headerHeight 44`, `rowMinHeight 48`, `cellPaddingX 16`, `cellPaddingY 12` (px) | 표의 행·셀 수치 |
| `component.listRow` | `minHeight 64`, `paddingX 16`, `paddingY 12` (px) | 모바일 구분선 리스트의 행 |
| `component.badge` | `minHeight 24`, `paddingX 8`, `paddingY 4`, 테두리 `primitive.border.fine` (px) | 상태 배지 크기. README에 배지 수치가 없음 |
| `component.modal` | `maxWidth 480`, `padding 24`, `paddingMobile 20 / 16`, 그림자 `primitive.shadow.emphasis` (px) | PC 대화상자. 모바일은 기존 `component.sheet` 사용 |
| `component.toast` | `maxWidth 360`, `minHeight 48`, `paddingX 16`, `paddingY 12`, `stackGap 8`, `maxStack 3`, 그림자 `primitive.shadow.action` (px) | Toast 상자 |
| `component.datePanel` | `cell 44`, `width 336`, `padding 12` (px) | 달력 패널 |
| `component.appShell` | `headerHeight 56`, `bottomNavHeight 56`, `sidebarWidth 240`, `navItemHeight 48`, `authBoxMaxWidth 400` (px) | 운영자 Shell의 틀 |
| `responsive.formMaxWidth` | `480` px | PC에서 폼 한 열의 최대 폭. 기존 responsive 토큰은 예약 화면 폭뿐 |
| `responsive.operatorSplitAt` | `1024` px | List ↔ Table, 하단 내비게이션 ↔ 사이드바 전환점. 기존 `proposedSplitAt`(1024)과 같은 값이지만 그쪽은 목록/상세 분할 의미 |

기존 토큰을 **이름과 다른 용도로 재사용**한 곳도 정리가 필요합니다. 입력의 비활성에 `action.disabled.*`를, placeholder에 `text.captionOnPaper`를 썼습니다. 값은 맞지만 이름이 용도와 달라, 토큰을 정리할 때 `control.disabled.*`·`text.placeholder` 같은 별칭을 둘지 함께 검토합니다.
