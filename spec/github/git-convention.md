# Git 컨벤션

- 작성일: 2026-10-08
- 상태: **초안 — 사용자 제공 원문 반영, 똑디 적용안 합의 전**
- 대상: 똑디 문서·백엔드·프론트엔드 저장소에 적용할 공통 제안. 저장소별로 이미 정한 규칙과 충돌하면 합의 후 적용한다.

커밋 형식·타입·이슈번호 규칙은 제공받은 원문을 반영했다. 아래 scope와 GitHub 이슈 표기는 똑디 적용 제안이다. PR·병합·디자인 시스템 변경 규칙도 이 저장소를 위한 추가 제안이다.

명시하지 않은 커밋 메시지 규칙은 [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md)를 따른다. 이 문서의 한국어 제목, 프로젝트별 scope, 첫 줄 이슈번호, `style` 타입은 프로젝트 규칙으로 우선한다.

## 커밋 메시지

```text
<type>(<scope>): <이슈번호>, <짧은 변경 내용>

<변경 이유와 필요한 설명>

<호환성 변경 등 필요한 꼬리말>
```

- `type`과 제목은 필수다. `scope`와 꼬리말은 필요한 경우만 쓴다.
- 이슈번호는 아래 이슈 규칙에 따라 브랜치의 첫 커밋이나 마지막 커밋에 적는다. 나머지 커밋은 `<type>(<scope>): <짧은 변경 내용>`으로 쓸 수 있다.
- 타입과 범위는 소문자 영문, 제목과 본문은 한국어를 기본으로 한다.
- 제목에는 무엇이 바뀌었는지 적고 끝에 마침표를 붙이지 않는다.
- `수정`, `작업`, `리뷰 반영`만 쓰지 않고 대상과 결과를 적는다.
- 본문은 제목과 한 줄 띄우고 변경 이유·제약·영향을 적는다. Angular 기준에 따라 `docs` 외에는 20자 이상의 본문을 작성하고, `docs`는 생략할 수 있다. 아래 타입 표의 예시는 제목만 보여준다.
- 하나의 커밋은 하나의 목적을 담는다. 기능 변경과 무관한 포맷 정리는 분리한다.
- 커밋하지 않은 변경이 있어야만 동작하는 상태를 피한다. 필요한 생성물과 마이그레이션은 함께 포함한다.

### 타입

| 타입 | 사용 시점 | 예시 |
| --- | --- | --- |
| `feat` | 기능이나 사용자에게 보이는 동작 추가 | `feat(booking): 예약 취소 기능 추가` |
| `fix` | 잘못된 동작 수정 | `fix(booking): 중복 예약 요청의 정원 초과 방지` |
| `docs` | 문서·명세·가이드와 코드 주석 변경 | `docs: Git 컨벤션 초안 추가` |
| `style` | 동작을 바꾸지 않는 코드 서식 변경 | `style: import 구문 공백 정리` |
| `refactor` | 기능 추가·버그 수정이 아닌 코드 변경, 디버그 코드 삭제 | `refactor(member): 디버깅용 console.log 제거` |
| `perf` | 성능 개선 | `perf(member): 회원 목록 조회 쿼리 수 감소` |
| `test` | 테스트 추가·수정 | `test(booking): 동시 예약 충돌 사례 추가` |
| `build` | 빌드 프로세스·도구·라이브러리 변경, 의존성 또는 자체 버전 변경 | `build: 버전업 (1.0.0 => 1.1.1)` |
| `ci` | CI 설정·스크립트 변경. 원문의 Dockerfile·Jenkinsfile 변경 포함 | `ci: 배포 스크립트 변경` |

원문 상단과 Angular 타입 표에는 `style`이 빠져 있지만, 원문 상세 항목에 명시되어 있어 포함한다. 기존 초안의 `chore`는 원문에 없어 제외한다. 되돌림은 아래 Angular의 `revert:` 규칙을 따른다.

`style`은 CSS나 디자인 변경을 뜻하지 않는다. 화면 기능 추가는 `feat`, 잘못된 표시 수정은 `fix`, 디자인 명세 수정은 `docs`로 구분한다. 여러 타입이 섞여 분리하기 어렵다면 주된 변경 목적을 기준으로 고른다.

### 범위(scope)

똑디의 scope는 구체적인 영향 영역을 기준으로 한다. 업무 기능은 `booking`, `member`, `auth`, 공통 디자인 시스템은 `design-system`, 배포·실행 환경은 `infra`를 사용한다. `be`, `fe`처럼 구현 위치만 나타내는 이름은 기본 scope로 사용하지 않는다. 여러 영역에 걸치거나 범위가 명확하지 않으면 생략한다.

PR 템플릿 종류와 커밋 타입·scope는 별개다. 문서 변경은 `docs`, 디자인 변경은 목적에 따라 `docs(design-system)`·`feat(design-system)`·`fix(design-system)`, 인프라 변경은 `ci(infra)`·`build(infra)`·`fix(infra)`처럼 작성한다. `design`과 `infra`를 새 커밋 타입으로 추가하지 않는다.

### 이슈번호

- 이슈번호는 커밋 메시지의 맨 윗줄, 콜론 다음에 `<이슈번호>, <설명>`으로 적는다.
- 해당 브랜치의 첫 커밋이나 마지막 커밋에 한 번 포함하면 된다. 모든 커밋에 반복할 필요는 없다.
- 한 브랜치에서 여러 이슈를 처리하면 이슈별로 커밋을 나누고, 각 커밋에 해당 이슈번호 하나를 적는다.
- 꼬리말에만 이슈번호를 적는 것은 첫 줄 표기를 대신하지 않는다.

원문 형식을 따른 Jira 예시:

```text
branch: feature/JIRA-0001
commit: feat(core): JIRA-0001, 컨벤션 로직 추가
```

똑디 적용 제안은 GitHub 이슈를 `#번호`로 표기하는 것이다. 이슈가 없는 문서·유지보수 작업은 번호를 만들지 않고 생략한다. 아래 번호는 모두 예시다.

```text
fix(booking): #123, 취소한 예약을 활성 예약 집계에서 제외

취소 이후에도 정원이 차 있는 것으로 보이는 문제를 수정한다.
예약 목록과 정원 계산에서 동일한 활성 상태 조건을 사용한다.
```

여러 이슈를 같은 브랜치에서 처리하는 경우의 제목 예시:

```text
fix(booking): #123, 취소한 예약을 활성 예약 집계에서 제외
fix(member): #124, 회원 검색의 앞뒤 공백 제거
```

이슈 종료가 필요한 경우 PR 본문에 `Closes #번호`를 적고, 해당 PR이 이슈 범위를 모두 해결하는지 확인한다.

기존 API·토큰·컴포넌트 사용법과 호환되지 않는 변경은 본문 끝에 `BREAKING CHANGE:`로 영향과 이전 방법을 남긴다. 이 표기가 자동 버전 발행을 설정하거나 보장하지는 않는다.

```text
refactor(design-system): 공통 버튼 속성 이름 통일

BREAKING CHANGE: Button의 kind 속성을 variant로 변경한다.

기존 사용처의 kind="primary"를 variant="primary"로 변경해야 한다.
```

되돌림 제목은 `revert: <원본 커밋 제목>`으로 적고 본문에 `This reverts commit <SHA>`와 되돌리는 이유를 남긴다. Git이 생성한 merge 메시지는 일반 커밋 형식으로 바꾸지 않아도 된다.

## 브랜치

아래는 똑디 적용 제안이다. 기본 브랜치(`main`)에서 작업 브랜치를 만들고 PR로 병합한다. 기능 브랜치 접두사는 `feature`, 커밋 타입은 `feat`로 구분한다.

```text
<작업종류>/<이슈번호 또는 짧은-kebab-case-작업명>

docs/git-convention
feature/123-booking-cancellation
fix/124-booking-capacity
feature/design-system-button
```

- 하나의 브랜치는 하나의 작업 목적을 가진다.
- 이슈 번호가 필요하면 `fix/123-booking-capacity`처럼 작업명 앞에 붙인다.
- 병합 전에 기본 브랜치와의 충돌을 해결하고, 해결 과정에서 영향을 받은 부분을 다시 검증한다.
- 공유 브랜치의 이력을 임의로 재작성하지 않는다. 재작성이 필요하면 협업자와 먼저 조율한다.

## PR과 병합

### 작업별 템플릿

똑디 작업에 맞는 PR 템플릿 5개를 둔다. 작성 안내는 HTML 주석으로 넣었으며, 해당 없는 선택 항목은 삭제한다.

| 작업 | 템플릿 | 중점 |
| --- | --- | --- |
| 기능 추가 | [git-pull-request-template-feature.md](git-pull-request-template-feature.md) | 사용 목적, 정상·오류 흐름, API·DB·사용처 영향 |
| 버그 수정 | [git-pull-request-template-bugfix.md](git-pull-request-template-bugfix.md) | 재현 조건, 원인, 수정 전후, 회귀 검증 |
| 문서·기획 변경 | [git-pull-request-template-docs.md](git-pull-request-template-docs.md) | 변경 근거, 제안·확정 상태, 명세·링크 확인 |
| 디자인 변경 | [git-pull-request-template-design.md](git-pull-request-template-design.md) | 전후 화면, 토큰·생성물, 상태·접근성 검증 |
| 인프라 변경 | [git-pull-request-template-infra.md](git-pull-request-template-infra.md) | 대상 환경, 설정·배포 영향, 검증·복구 순서 |

주된 검토 대상에 맞는 템플릿 하나를 선택하고, 다른 유형도 포함되면 필요한 항목만 가져온다. 디자인 동작·시안·토큰이 바뀌면 디자인 템플릿, 문서의 표현·설명만 바뀌면 문서 템플릿을 사용한다.

현재 템플릿은 `spec/github/`에 참고용으로 보관한다. 파일 내용을 PR 본문에 복사해 사용한다.

다른 저장소에서 GitHub 템플릿으로 적용하려면 `.github/PULL_REQUEST_TEMPLATE/`에 필요한 파일을 넣고 기본 브랜치에 병합한다. 이후 PR 생성 URL의 `template` 쿼리로 파일을 지정할 수 있다([GitHub 공식 안내](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)).

```text
https://github.com/Team-DanD/ddoukd-docs/compare/main...작업브랜치?quick_pull=1&template=git-pull-request-template-feature.md
```

위 URL은 GitHub 템플릿을 설치했을 때의 예시다. 저장소 주소, `작업브랜치`, `template`의 파일명을 실제 작업에 맞게 바꾼다.

### 작성과 병합 규칙

- PR 제목도 커밋 제목 형식을 사용한다.
- 변경 이유, 바뀐 동작이나 문서, 실행한 검증과 미수행 항목을 적는다.
- API 계약·DB 마이그레이션·디자인 토큰 변경은 사용처 영향과 적용 순서를 적는다.
- 화면이나 디자인 원본 변경은 변경 화면·상태와 전후 캡처를 남긴다.
- 리뷰 이후 수정했다면 최종 변경에 필요한 검증을 다시 수행한다.
- 병합 방식은 별도 합의 전까지 저장소의 기존 방식을 따른다. 이 저장소에는 merge commit 이력이 있으며, 이 문서로 squash를 강제하지 않는다.
- squash를 선택하는 저장소에서는 최종 메시지에 첫 줄 이슈번호, 변경 이유와 호환성 변경이 남는지 확인한다. 여러 이슈를 별도 커밋으로 처리했다면 하나로 squash하지 않고 커밋 구분을 유지한다.

PR 본문 예시:

```markdown
예약 취소 후에도 정원이 차 있는 것으로 표시되는 문제를 수정합니다.
활성 예약 집계에서 취소 상태를 제외합니다.

- 영향: 예약 목록과 정원 계산
- 검증: 취소 후 재예약 테스트 통과
- 미수행: 운영 환경 검증

Closes #123
```

예시의 검증 결과는 실제 수행 결과로 바꾼다.

## 디자인 시스템 변경

파일의 원본·생성물 구분은 [디자인 시스템 가이드](../../design-system/README.md)를 따른다.

| 변경 대상 | 함께 관리할 것 |
| --- | --- |
| 토큰 값·이름 | `design-system/tokens.json` 원본, 생성 파일, 영향을 받는 사용처 |
| 컴포넌트 동작·모양 | 컴포넌트 명세, 해당 미리보기, 구현이 있는 저장소의 코드·검증 |
| `.pen` 화면 | 변경 화면·상태를 적은 커밋/PR 설명, 확인 가능한 캡처 |
| 브랜드·구조 결정 | 확정된 경우 `decisions.md`와 관련 가이드. 제안 단계는 제안으로 표시 |

토큰 변경 시 저장소 루트에서 다음 순서로 실행한다.

```bash
python3 design-system/scripts/build-tokens.py
python3 design-system/scripts/build-tokens.py --check
```

생성 파일인 `tokens.css`와 `claude-design/project/tokens.json`은 직접 수정하지 않는다. 원본과 생성 결과를 같은 커밋에 포함한다. 토큰 이름을 바꾸거나 삭제하면 CSS·미리보기·`.pen` 변수·앱 사용처의 영향을 확인하고, 다른 저장소에 필요한 변경은 관련 PR로 연결한다.

`.pen` 파일은 한 번에 한 사람 또는 에이전트가 수정한다. 기존 [화면 기획 협업 규칙](../../plans/README.md)에 따라 커밋 메시지에 바뀐 화면을 적는다.

```text
docs(design-system): 입력 필드 오류 상태 명세 보완
docs(design-system): 회원 목록 pen 시안의 빈 상태 추가
fix(design-system): 입력 테두리 대비 수정
feat(design-system): 공통 버튼 컴포넌트 구현
```

토큰 검사 통과만으로 화면 동작이나 접근성 전체가 검증된 것으로 보고하지 않는다. 현재 HTML/CSS 시안과 React·React Native 구현 여부를 구분하고, 실제 화면 검증 범위는 [프론트 구조 검증 계획](../../plans/frontend-spike/README.md)에 연결한다.

## 확정 전 확인할 것

- 똑디 scope 목록, GitHub 이슈 표기 및 이슈 없는 작업의 생략 규칙
- 적용할 저장소와 각 저장소의 기존 컨벤션 충돌 여부
- 병합 방식 및 자동 검사 도입 여부. 이 문서 작성으로 설정을 바꾸지는 않음
