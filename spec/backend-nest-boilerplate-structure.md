# 새 프로젝트 보일러플레이트를 위한 폴더 구조 방안

- 검토일: 2026-10-07

- 목적: 현재 저장소의 폴더 구조를 새 프로젝트의 보일러플레이트로 재사용하기 위한 검토
- 검토 범위: 폴더 구조, 설정 파일, 대표 구현의 정적 검토. 빌드와 테스트는 실행하지 않음.

## 검토 방안

현재 구조는 API와 워커가 함께 필요한 프로젝트의 출발점으로 적합하다. 도메인별 모듈 구성은 유지하고, 공통 코드·설정·테스트 경계를 정리해서 보일러플레이트로 만드는 것을 권장한다.

실제 스택은 NestJS + Express + TypeORM + PostgreSQL이며, pnpm workspace로 구성되어 있다. 새 프로젝트에서 MariaDB를 사용한다면 DB 설정과 엔티티·쿼리의 호환성을 별도로 검토해야 한다.

이 문서의 권장 구조는 새 프로젝트를 위한 제안이며, 현재 저장소를 즉시 재구성해야 한다는 의미나 표준을 의미하지 않는다.

## 구분


| 구성                           | 이유                                                          |
| ---------------------------- | ----------------------------------------------------------- |
| `server` / `worker` 분리       | API와 비동기 작업을 독립적으로 실행·배포하기 좋다. 워커가 필요한 프로젝트에 적합하다.          |
| `modules/{도메인}`              | 기능 수정 시 관련 Controller·Service·Repository·DTO를 한곳에서 찾을 수 있다. |
| 소스 옆 `*.spec.ts`             | 구현과 단위 테스트를 함께 관리하기 좋다.                                     |
| 앱별 `deploy/base`, `overlays` | 배포 단위와 환경별 설정의 위치가 명확하다.                                    |
| pnpm workspace + catalog     | 여러 앱의 의존성 버전을 루트에서 관리할 수 있다.                                |


## 보일러플레이트로 만들기 전에 정리할 부분

### 1. `common`의 책임 분리

현재 `common`에는 설정. 특히 [UtilService](../server/src/common/utils/util.service.ts)는 객체 처리 함수와 BullMQ 실패 Slack 알림을 같이 담당한다.

`config`, `infrastructure`, `common`, 테스트 지원 코드를 분리하면 새 기능의 위치를 결정하기 쉬워진다.


| 위치                | 책임                                     |
| ----------------- | -------------------------------------- |
| `config/`         | 환경 변수 읽기, 검증, 앱별 설정                    |
| `infrastructure/` | DB·캐시·큐 연결 구성과 외부 시스템 연동               |
| `common/`         | 도메인과 무관한 작은 공통 기능, pipe·guard·filter 등 |
| `test/`           | 통합·E2E 테스트와 테스트 지원 코드                  |
| `modules/{도메인}/`  | 도메인 업무 로직과 해당 도메인에만 필요한 연동 코드          |


특정 도메인에만 쓰이는 외부 연동은 해당 모듈에 유지할 수 있다. 모든 SDK 연동을 무조건 앱 공통 인프라로 이동할 필요는 없다.

### 2. 공유 패키지 소비 방식 정리

[서버 tsconfig](../server/tsconfig.json)와 [워커 tsconfig](../worker/tsconfig.json)는 `packages/shared/src` 내부를 여러 별칭으로 직접 참조한다. Jest에도 같은 매핑이 반복되며, 앱 내부에는 공유 파일을 다시 export하는 파일이 남아 있다.

또한 [shared/package.json](../packages/shared/package.json)의 `main`은 실제로 없는 `src/index.ts`를 가리킨다. 현재 앱의 경로 별칭 사용과 별개로, 패키지 이름으로 가져오는 구조는 준비되어 있지 않다.

새 프로젝트에서는 다음 기준으로 정리하는 것을 권장한다.

- 앱에서 공유 패키지를 `workspace:*` 의존성으로 명시한다.
- 공유 패키지에 공개 export와 빌드 결과의 진입점을 정의한다.
- 소비하는 앱에서 공유 패키지 내부의 `src` 경로를 직접 참조하지 않는다.
- 공유 패키지 빌드·개발 모드·테스트·배포에서 동일한 공개 경계를 사용한다.

목적은 폴더 이동 때마다 앱·Jest·실행 경로를 함께 수정하는 부담을 줄이는 것이다.

### 3. 공유 범위와 도메인 소유권 정의 필요


| 코드 종류                   | 권장 소유 위치                   |
| ----------------------- | -------------------------- |
| API 요청·응답 DTO           | 해당 API 모듈 dto/req, dto/res |
| 한 앱에서만 쓰는 업무 로직         | 해당 앱의 도메인 모듈               |
| 여러 앱에서 실제로 재사용하는 인프라 구현 | 필요성이 확인되면 별도 공유 패키지        |


모양이 비슷하다는 이유만으로 모든 Service·Repository를 공유할 필요는 없다. 함께 변경되어야 하는 책임인지 먼저 판단한다.

### 4. 폴더와 파일 명명 규칙 통일.

작은 모듈은 Controller·Service·Module을 루트에 두고, 파일 수와 역할에 따라 `dto, dao, entity, interface` 같은 하위 폴더를 추가하는 방식이 무난하다.

- 동일한 역할에는 동일한 폴더 이름을 사용한다.
- 기본 템플릿에 필요 없는 빈 폴더를 미리 만들지 않는다.
- 대형 기능은 파일 종류별 분류만 늘리기보다 하위 기능 모듈로 분리할지 검토한다.

### 5. 테스트·빌드·초기 실행 구성 보완

확인된 내용은 다음과 같다.

- 두 앱의 `test:e2e`는 저장소에 없는 `../test/jest-e2e.json`을 참조한다.
- 단위·통합 테스트가 같은 `*.spec.ts` 패턴에 포함된다.
- 앱 TypeScript 설정은 테스트 파일을 포함하며, 별도 빌드용 제외 설정이 없다.
- `strictNullChecks`는 켜져 있지만 `noImplicitAny: false`이므로 strict 기준은 아니다.
- 검토 당시 Git 추적 파일 기준으로 `.env.example`, 로컬 Compose, DB migration 구성이 없다. README는 DB 스키마를 외부 저장소로 안내한다.

보일러플레이트에는 다음 구성을 포함하는 것을 권장한다.

- 공통 컴파일 옵션을 담은 `tsconfig.base.json`
- 신규 코드에 적용할 `strict: true`
- 테스트 파일을 제외하는 앱별 `tsconfig.build.json`
- 단위·통합·E2E 테스트별 설정과 실행 명령
- 실제 설정 파일과 일치하는 `package.json` 스크립트
- 환경 변수 예시와 필수 값 검증
- 로컬 의존 서비스를 실행할 `compose.yaml`
- DB 초기화·migration 실행 방법

기존 프로젝트의 strict 전환은 별도 변경 작업이며, 이 검토에서 수행하지 않았다.

## 권장 폴더 구조

API와 워커가 모두 필요한 프로젝트를 기준으로 한 구성이다.

```text
project/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── common/          # 공통 pipe, guard, filter 등
│   │   │   └── modules/
│   │   │       └── example/
│   │   │           ├── example.module.ts
│   │   │           ├── example.controller.ts
│   │   │           ├── entity/
│   │   │           ├── interface/
│   │   │           ├── service/
│   │   │           │    ├── example.service.ts
│   │   │           │    └── example.service.spec.ts
│   │   │           ├── dto/
│   │   │           │    ├── req/
│   │   │           │    └── res/
│   │   │           └── dao/
│   │   │                └── example.repository.ts
│   │   ├── test/
│   │   │   ├── integration/
│   │   │   ├── e2e/
│   │   │   └── fixtures/
│   │   ├── deploy/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── worker/                 # 비동기 처리가 필요할 때 포함, 구조는 서버와 동일
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── config/
│       │   └── modules/
│       ├── test/
│       ├── deploy/
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── tsconfig.build.json
├── ci/
├── scripts/
├── docs/
├── compose.yaml
├── .env.example
├── tsconfig.base.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```



이 트리는 책임 배치를 보여주는 예시다. 각 앱의 Nest·Jest 설정과 공유 패키지의 `package.json`·빌드 설정·공개 진입점 등 실행에 필요한 파일은 실제 템플릿 구현 시 함께 구성한다.

`apps/`로 묶는 것은 정리 목적의 선택 사항이다. 핵심은 앱 내부 코드, 앱 간 계약, DB 모델, 인프라의 경계를 명확하게 두는 것이다.

## 적용 우선순위

1. 알림 전용 구현과 인증 자료를 제외하고 예제 모듈을 정한다.
2. 도메인 모듈의 책임을 분리한다.
3. 실제 공유 대상만 패키지로 추출하고 공개 export와 의존성을 정의한다.
4. TypeScript·테스트·빌드 설정과 실행 명령을 정리한다.
5. 로컬 실행 환경과 DB 초기화 절차를 준비한다.
6. 새로 받은 저장소에서 설치·빌드·테스트·로컬 실행이 가능한지 검증한다.

API만 필요한 프로젝트라면 워커와 공유 패키지를 처음부터 만들지 않고 단일 앱으로 시작해도 충분하다. 폴더 수보다 프로젝트의 실제 실행 단위와 코드 소유권을 기준으로 선택한다.