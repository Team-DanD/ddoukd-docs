# pen.dev 설정 가이드

처음 pen.dev를 쓰는 사람이 `ddoukd.pen`을 열고 화면 기획을 시작할 때까지의 순서입니다. 2026-10-04, macOS, VS Code 확장 0.6.73~0.6.74 기준으로 확인했습니다.

- 무엇을 그리나: 화면 기획·프로토타입. 규칙은 [../plans/README.md](../plans/README.md)
- 무엇을 기준으로 그리나: [디자인 시스템](README.md)과 그 토큰을 담은 [ddoukd.pen](ddoukd.pen)

## 1. 설치

1. VS Code 1.100 이상 또는 Cursor를 준비합니다.
2. 확장 탭에서 `pen.dev`를 검색해 설치합니다. 게시자는 `highagency`, 확장 ID는 `highagency.pencildev`입니다.
3. 터미널에서 설치하려면 아래 명령을 씁니다.

```bash
code --install-extension highagency.pencildev
```

4. 명령 팔레트(Cmd+Shift+P)에서 `pen.dev: Open Welcome File`을 실행합니다. 캔버스가 열리면 설치가 끝난 것입니다.

확장이 로그인이나 활성화를 요구하면 화면 안내를 따릅니다. 이 부분은 계정마다 다를 수 있어 이 문서에서 확인하지 못했습니다.

## 2. 저장소와 원본 파일 열기

```bash
git clone https://github.com/Team-DanD/ddoukd-docs.git
code ddoukd-docs
```

VS Code 탐색기에서 `design-system/ddoukd.pen`을 클릭합니다. `.pen` 파일은 자동으로 디자인 에디터에서 열립니다.

| 프레임 | 내용 |
| --- | --- |
| Foundations | 원시 색 14, 역할 색 12쌍, 글자 11단계, 간격, 선과 모서리 견본 |
| Components | 재사용 컴포넌트 44개: Button, Badge, TextField, Textarea, Select, FormField, Checkbox, Radio, Switch, Tabs, DateStrip, MemberRow, BookingRow, Modal, Toast, EmptyState, TopBar, ActionBar, BottomNav |
| Screens | 시안 화면 3개(회원 목록, 회원 등록, 오늘 예약). 컴포넌트를 조합한 예시 |

변수 목록에 `color-purple`, `action-primary-background`, `space-16` 같은 토큰 105개가 보이면 정상입니다. 변수 패널의 위치는 확장 버전에 따라 다를 수 있습니다. 변수 이름은 [tokens.json](tokens.json)의 토큰 이름과 같습니다. 글자 스타일은 `text-<이름>-size`와 `text-<이름>-line-height` 두 변수로 나뉘어 있습니다.

## 3. 화면 기획 시작하기

pen.dev는 다른 파일의 컴포넌트를 참조할 수 없습니다. 그래서 원본을 복사해서 시작합니다.

```bash
mkdir -p plans/booking-calendar
cp design-system/ddoukd.pen plans/booking-calendar/booking-calendar.pen
```

1. 복사한 파일을 열고, Screens 프레임 아래쪽에 화면 프레임을 만듭니다.
2. 프레임 크기는 모바일 390 × 844, 데스크톱 1440 × 1000을 기본으로 씁니다. 좁은 화면 확인은 360 × 800, 태블릿은 768 × 1024입니다.
3. 버튼·배지·입력 필드·목록 행은 새로 그리지 않고 Components의 컴포넌트를 복사해 인스턴스로 씁니다. 화면 틀은 Screens의 시안 화면을 복사해서 시작하면 빠릅니다.
4. `plans/<작업>/README.md`에 화면 목록·정책·미결 사항을 적습니다. 템플릿은 [../plans/README.md](../plans/README.md)에 있습니다.

`design-system/ddoukd.pen` 자체는 토큰이나 공통 컴포넌트를 바꿀 때만 고칩니다. 값은 `tokens.json`을 먼저 고친 뒤 맞춥니다.

## 4. 그릴 때 지킬 것

- 색·간격·글자 크기는 직접 입력하지 않고 변수를 고릅니다. 컴포넌트에는 원시 색(`color-*`)이 아니라 역할 색(`action-*`, `status-*`, `text-*`)을 씁니다.
- 선은 모두 1px입니다. 모서리는 버튼과 입력이 8, 배지가 4입니다. 그림자를 쓰지 않습니다.
- 폰트는 `font-body`(Noto Sans KR) 하나입니다. 굵기는 400, 500, 700을 씁니다.
- 목록은 카드가 아니라 행으로 그립니다. 화면의 주 행동은 아래 고정 바(ActionBar)에 둡니다.
- 보라 면의 버튼은 화면에 하나만 둡니다. 면을 채우는 배지는 노쇼 하나입니다.
- 글자는 12px 미만으로 쓰지 않습니다. 버튼 높이는 48 이상, 누를 수 있는 영역은 44 이상입니다.
- 아이콘은 lucide 라이브러리만 씁니다.
- 너비·높이에는 변수가 적용되지 않습니다. 숫자를 직접 넣습니다.
- 정해지지 않은 정책을 화면에서 임의로 확정하지 않습니다. README의 미결 사항에 적습니다.

## 5. 저장과 커밋

- 저장은 Cmd+S입니다. `.pen`은 한 줄짜리 diff로 보이지 않으므로 커밋 메시지에 바뀐 화면을 적습니다.
- 한 파일을 동시에 고치는 사람은 한 명입니다. 작업 전에 `git pull`을 하고, 서현과 같은 파일을 만질 일이 있으면 먼저 알립니다.
- 공유용 이미지는 프레임을 PNG로 내보내 `plans/<작업>/exports/`에 둡니다. 내보내기 메뉴 위치는 이 문서에서 확인하지 못했습니다. 에이전트에게 내보내기를 시킬 수도 있습니다.

## 6. AI 에이전트 연결 (선택)

Claude Code나 Codex가 pen.dev MCP 서버로 캔버스를 읽고 그릴 수 있습니다. 직접 그리기만 할 거라면 건너뜁니다.

1. 확장을 설치하면 MCP 서버 실행 파일이 `~/.pencil/mcp/visual_studio_code/out/`에 생깁니다. Cursor는 폴더 이름이 다를 수 있습니다.
2. Claude Code에서 `/mcp`를 실행해 `pencil`이 connected인지 봅니다. 서현의 Mac에는 사용자 범위로 등록돼 있었습니다. 목록에 없으면 아래처럼 등록합니다.

```bash
claude mcp add pencil --scope user -- \
  ~/.pencil/mcp/visual_studio_code/out/mcp-server-darwin-arm64 \
  --app visual_studio_code --agent claudeCodeCLI
```

3. VS Code에서 고칠 `.pen` 파일을 열어 둔 상태로, 파일 경로를 적어서 에이전트에게 요청합니다. 예: "plans/booking-calendar/booking-calendar.pen에 예약 목록 모바일 화면을 디자인 시스템 컴포넌트로 그려줘."

에이전트를 쓸 때 주의할 점입니다.

- 에이전트에게 고칠 파일의 경로를 명시하게 합니다(MCP 도구의 `filePath`). VS Code에 열려 있는 정상 파일은 경로를 지정하면 다른 `.pen` 탭이 활성이어도 지정한 파일이 대상이 됩니다(2026-10-05 확인).
- 경로를 지정하지 않으면 지금 활성화된 `.pen` 탭이 대상이 됩니다. `.pen` 파일을 여러 개 열어 두었거나 다른 에이전트 세션이 같은 VS Code를 쓰고 있으면 경로를 빼먹지 않습니다.
- 경로를 지정해도 그 파일이 VS Code에 열려 있지 않으면 활성 탭의 파일이 대신 읽혔습니다(2026-10-05, 오류 없이 다른 파일의 프레임이 반환됨). `code <경로>`로 파일을 먼저 엽니다.
- 0바이트짜리 빈 `.pen` 파일은 문서로 인식되지 않아 경로를 지정해도 대상이 되지 않습니다. 이때도 활성 탭의 파일이 바뀔 수 있습니다.
- 고치기 전에 읽기 전용 호출로 최상위 프레임 이름을 확인해 대상이 맞는지 봅니다.
- `.pen` 파일을 텍스트 편집기나 `cat`으로 고치지 않습니다. 에이전트도 MCP 도구로만 읽고 씁니다.
- 한 파일에는 에이전트 세션도 하나만 붙입니다.

## 7. 문제 해결

| 증상 | 원인과 해결 |
| --- | --- |
| `.pen`이 텍스트로 열림 | 확장이 꺼져 있음. 확장 탭에서 pen.dev 활성화 후 파일을 다시 연다 |
| 빈 파일로 만든 `.pen`이 안 열림 | 0바이트 파일은 문서로 인식되지 않는다. `pen.dev: New File` 명령으로 만들거나 `ddoukd.pen`을 복사한다 |
| MCP가 `failed to connect to running Pencil app` | VS Code에 `.pen` 파일이 열려 있지 않음. 파일을 열고 `/mcp`에서 다시 연결 |
| MCP가 갑자기 `Connection closed` | 확장이 자동 업데이트되며 서버 실행 파일을 교체한 경우. `/mcp`에서 재연결하고, 안 되면 VS Code와 Claude Code를 다시 시작 |
| `you are probably referencing the wrong .pen file` | 경로를 지정하지 않았는데 활성 탭이 `.pen` 에디터가 아님. 에이전트에게 파일 경로를 지정하게 하거나 고칠 파일의 탭을 클릭한 뒤 재시도 |
| 에이전트가 다른 `.pen` 파일을 읽거나 고침 | 경로를 지정하지 않았거나, 지정한 파일이 VS Code에 열려 있지 않거나, 0바이트 파일임. `code <경로>`로 파일을 열고 경로를 지정해 다시 요청한다 |
| 글꼴이 다르게 보임 | Google Fonts는 자동으로 쓸 수 있다. 텍스트의 폰트가 변수 `font-body`로 지정됐는지 확인 |
