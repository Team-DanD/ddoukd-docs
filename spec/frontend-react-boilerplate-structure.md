# React 프로젝트 보일러플레이트를 위한 폴더 구조 방안

- 작성일: 2026-10-07
- 목적: 새 React 프로젝트의 폴더 구성과 책임을 정리한다.
- 대상: React + TypeScript + Vite 기반 SPA
- 범위: 폴더 구조와 네이밍 제안. 실제 앱 생성, 빌드와 테스트는 수행하지 않았다.

## 검토 방안

폴더 이름과 계층은 프론트엔드의 화면 구성, 사용자 기능, 상태 관리, API 연동에 맞춰 정한다.

제품별 앱, 디자인 시스템, API와 서버 상태 관리의 책임을 구분한다. 기능별 관련 코드는 `features/{기능}`에 모아 함께 관리한다.

기본 구조는 React SPA를 대상으로 한다. Next.js를 선택하면 라우팅과 서버·클라이언트 경계가 달라지므로 이 구조를 그대로 적용하지 않는다.

## 구분

| 구성 | 이유 |
| --- | --- |
| `app/` | 라우터, Provider, 전역 스타일 등 앱 초기화 구성을 모은다. |
| `pages/` | 라우트별 화면을 구성하고 여러 기능을 조합한다. |
| `features/{기능}/` | 기능의 UI, Hook, API, 상태, 타입을 함께 관리한다. |
| `shared/` | 특정 업무 기능에 의존하지 않는 앱 공통 코드를 관리한다. |
| 소스 옆 테스트 | 구현과 단위·컴포넌트 테스트를 함께 변경하기 좋다. |
| `tests/` | 통합·E2E 테스트와 공통 테스트 지원 코드를 관리한다. |
| 선택적 `packages/` | 여러 앱에서 실제로 공유하는 UI·유틸·설정을 추출한다. |

이 구조는 프로젝트를 위한 제안이다. 특정 아키텍처 방법론의 모든 계층을 도입하는 것을 의미하지 않는다.

## 보일러플레이트로 만들기 전에 정리할 부분

### 1. 화면과 기능의 책임 분리

`pages/`는 라우트에서 보여줄 화면을 구성한다. 기능의 상세 구현은 `features/`에 둔다.

예를 들어 계정 페이지는 프로필 수정, 비밀번호 변경, 알림 설정 기능을 조합할 수 있다. 각 기능의 API와 폼 로직을 페이지 파일에 모두 넣지 않는다.

| 위치 | 책임 |
| --- | --- |
| `app/router/` | 경로, 페이지 연결, 라우트 수준 접근 제어 |
| `app/providers/` | Query, 인증 Context, 테마 등 앱 초기화 |
| `app/layouts/` | 앱의 내비게이션과 공통 화면 틀 |
| `pages/` | 기능을 조합하는 라우트 화면 |
| `features/` | 사용자가 수행하는 기능과 해당 기능의 업무 로직 |
| `shared/` | 기능과 무관하게 재사용 가능한 기반 코드 |

작은 기능은 파일 몇 개로 시작한다. 모든 기능에 아래 예시의 하위 폴더를 처음부터 만들 필요는 없다.

### 2. 공통 UI와 기능 UI 구분

공통 여부는 사용 횟수보다 업무 의존성으로 판단한다.

- 범용 Button, Input, Dialog는 `shared/components/`에 둔다.
- 프로필 수정 폼, 결제 확인 모달처럼 업무 의미가 있는 UI는 해당 기능의 `components/`에 둔다.
- 여러 앱에서 공통 UI를 사용하게 되면 `packages/ui`로 추출한다.
- 디자인 시스템을 도입한다면 앱 공통 UI와 디자인 시스템에 같은 컴포넌트를 중복 구현하지 않는다.

### 3. API와 상태 관리 구분

| 위치 또는 방식 | 책임 |
| --- | --- |
| `shared/api/` | HTTP 클라이언트, 공통 오류 처리와 인증 연동 |
| 기능의 `api/` | 엔드포인트 호출과 요청·응답 타입 |
| 기능의 `queries/` | TanStack Query를 사용할 때 Query key, 조회·변경 옵션, 캐시 무효화 정책 |
| 기능의 `hooks/` | React 생명주기, 이벤트, 폼과 화면 동작의 조합 |
| 컴포넌트 로컬 상태 | 해당 컴포넌트에서만 사용하는 UI 상태 |
| 기능의 `stores/` | 여러 컴포넌트·화면이 공유해야 하는 클라이언트 상태. 필요할 때 추가 |
| 기능의 `schemas/` | 폼 입력이나 API 응답의 런타임 검증 |
| 기능의 `types/` | 폼·UI 모델 등 기능 내부 타입 |

API 호출 함수는 React Hook이나 UI 상태에 의존하지 않도록 한다. 서버 응답 원본을 Query 캐시와 별도 store에 중복 저장하지 않는 것을 기본으로 한다.

프론트 API 계약은 TypeScript 요청·응답 타입으로 표현한다. 백엔드의 DTO 클래스·데코레이터·Repository 계층을 가져올 필요는 없다. 런타임 스키마에서 타입을 파생한다면 동일한 계약을 별도 타입으로 중복 선언하지 않는다.

### 4. 공통 코드와 패키지의 경계

공통 코드는 사용 범위와 책임을 기준으로 분리하고, 프로젝트에 필요한 기능만 포함한다.

- 한 기능에서만 사용하는 코드는 해당 기능에 둔다.
- 여러 기능에서 쓰는 범용 Hook·유틸은 `shared/`에 둔다.
- 여러 앱에서 실제로 공유하는 코드만 `packages/`로 추출한다.
- 오디오·실시간 통신 등 특수 기능은 기본 템플릿에 일괄 포함하지 않는다.
- 공유 패키지는 공개 export를 정의하고, 소비하는 앱이 패키지 내부 `src` 경로에 의존하지 않도록 한다.

### 5. 테스트·빌드·문서 일치

테스트·타입 검사·빌드 설정과 문서는 선택한 도구와 실제 실행 명령에 맞춰 정리한다.

- TypeScript는 `strict: true`를 기준으로 한다.
- 단위·컴포넌트 테스트는 소스 옆에 두고, 통합·E2E 테스트는 `tests/`에서 관리한다.
- 테스트용 mock과 fixture를 제품 실행 코드에서 import하지 않는다.
- `.env.example`에는 브라우저에 노출 가능한 설정과 사용 방법을 기록한다.
- README는 설치, 환경 변수 설정, 실행, 검증 순서로 작성한다.
- Turbo를 도입한다면 실제 빌드 산출물과 환경 변수 입력을 캐시 설정에 반영한다.

## 네이밍 기준

폴더는 `components`, `hooks`, `types`, `schemas`, `utils`처럼 프론트 역할이 드러나는 이름을 사용한다. `api`, `app`, `shared`처럼 집합이나 영역을 나타내는 이름은 그대로 사용한다.

| 종류 | 파일명 예시 | 기준 |
| --- | --- | --- |
| 페이지 | `ProfilePage.tsx` | PascalCase, Page 접미사 |
| 컴포넌트 | `ProfileForm.tsx` | 컴포넌트 이름과 동일한 PascalCase |
| Hook | `useProfileForm.ts` | use로 시작하는 camelCase |
| API 호출 | `profile.api.ts` | 기능명 + 역할 접미사 |
| API 계약 타입 | `profile.api.types.ts` | 요청·응답 타입을 호출 코드 가까이에 배치 |
| Query | `profile.queries.ts` | Query key와 조회·변경 옵션 |
| 클라이언트 상태 | `profile.store.ts` | 공유 상태가 필요할 때 사용 |
| 스키마 | `profile.schema.ts` | 런타임 검증 |
| 내부 타입 | `profile.types.ts` | UI·폼 등 내부 타입 |
| 순수 함수 | `formatProfile.ts` | 함수 역할이 드러나는 이름 |
| 컴포넌트 테스트 | `ProfileForm.test.tsx` | 대상 파일 옆에 배치 |
| 로직 테스트 | `profile.api.test.ts` | 대상 파일 옆에 배치 |

이 명명법은 새 템플릿의 일관성을 위한 선택이며 React의 강제 규칙은 아니다. `index.ts`는 외부에 공개할 진입점이 필요한 곳에만 둔다.

## 권장 폴더 구조

독립 프론트 앱 하나를 시작하는 기본 구조다.

```text
project/
├── src/
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router/
│   │   │   └── router.tsx
│   │   ├── providers/
│   │   │   └── AppProviders.tsx
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx
│   │   └── styles/
│   │       └── global.css
│   ├── pages/
│   │   └── profile/
│   │       └── ProfilePage.tsx
│   ├── features/
│   │   └── profile/
│   │       ├── components/
│   │       │   ├── ProfileForm.tsx
│   │       │   └── ProfileForm.test.tsx
│   │       ├── hooks/
│   │       │   └── useProfileForm.ts
│   │       ├── api/
│   │       │   ├── profile.api.ts
│   │       │   ├── profile.api.types.ts
│   │       │   └── profile.api.test.ts
│   │       ├── queries/
│   │       │   └── profile.queries.ts
│   │       ├── schemas/
│   │       │   └── profile.schema.ts
│   │       ├── types/
│   │       │   └── profile.types.ts
│   │       └── index.ts
│   ├── shared/
│   │   ├── api/
│   │   │   ├── httpClient.ts
│   │   │   └── apiError.ts
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   └── Input/
│   │   ├── hooks/
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── utils/
│   └── assets/
├── public/
├── tests/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   ├── mocks/
│   └── setup.ts
├── deploy/
├── scripts/
├── docs/
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

`stores/`, `constants/`, `utils/`는 필요한 기능에 추가한다. E2E와 린터 설정 파일도 선택한 도구에 맞춰 추가한다.

## 의존성 기준

```text
app → pages → features → shared
```

상위는 하위의 공개 코드를 참조한다. 페이지가 공통 UI를 직접 사용하는 것도 가능하다.

- `shared`는 특정 기능이나 페이지를 import하지 않는다.
- 여러 기능의 연계는 페이지나 상위 Hook에서 조합한다.
- API 호출 함수는 Query나 페이지를 import하지 않는다.
- 기능의 공개 대상을 `index.ts`로 제한하고 다른 기능의 내부 파일을 직접 참조하지 않는다.
- 공유 패키지는 앱 내부 코드를 import하지 않는다.

## 여러 앱으로 확장할 때

독립된 관리 화면이나 별도 제품이 필요해지면 앱을 `apps/`에 모은다. Storybook은 공통 UI의 개발·확인이 필요한 경우 추가한다.

```text
project/
├── apps/
│   ├── web/                # 위의 React 앱
│   ├── admin/              # 독립된 관리 화면이 필요한 경우
│   └── storybook/
├── packages/
│   ├── ui/                 # React 공통 UI와 디자인 토큰
│   ├── utils/              # 앱 간 공유 순수 함수
│   ├── eslint-config/
│   └── tsconfig/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

공유 패키지는 `workspace:*` 의존성과 공개 `exports`를 정의한다. 소스 직접 소비와 빌드 결과 소비 중 어떤 방식을 사용하는지 패키지별로 명시한다.

단일 앱 단계에서 모노레포나 공유 패키지를 필수로 도입하지 않는다.

## 공통 실행 명령

| 명령 | 용도 |
| --- | --- |
| `dev` | 로컬 개발 서버 |
| `build` | 타입 검사와 배포 산출물 생성 |
| `type-check` | TypeScript 타입 검사 |
| `lint` | 파일 변경 없이 린트 검사 |
| `lint:fix` | 명시적인 린트 자동 수정 |
| `test` | 단위·컴포넌트 테스트 개발 모드 |
| `test:run` | 단위·컴포넌트 테스트 1회 실행 |
| `test:integration` | 통합 테스트 |
| `test:e2e` | 브라우저 E2E 테스트 |

명령 이름과 설정 파일, 실제 실행 대상을 일치시킨다. 환경별 빌드에서도 필요한 타입 검사가 누락되지 않도록 한다.

## 적용 우선순위

1. React SPA를 기준으로 작은 예제 기능 하나를 정한다.
2. `app`, `pages`, `features`, `shared`의 책임을 분리한다.
3. 컴포넌트·Hook·API·Query·타입의 네이밍을 통일한다.
4. 서버 상태, 클라이언트 공유 상태, 로컬 상태를 구분한다.
5. 타입 검사·테스트·빌드 설정과 README를 구성한다.
6. 새로 받은 저장소에서 설치·실행·검증을 확인한다.
7. 여러 앱에서 실제로 공유하는 코드만 패키지로 추출한다.
