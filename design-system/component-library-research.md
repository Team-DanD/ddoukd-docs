# 똑디 UI 컴포넌트 라이브러리 조사 및 비교 분석

> 상태: **조사·비교 보고서 (제안)** · 2026-10-05 작성  
> 기준 문서: [디자인 시스템 README](README.md) · [운영자 화면 컴포넌트 명세](components-operator.md) · [tokens.json](tokens.json) · [결정 기록](../decisions.md) · [MVP 범위](../mvp.md) · [README](../README.md)  
> 작성: Antigravity(웹 조사) · 검토: Claude(npm·GitHub 대조, 2026-10-05) · 결정 대상: 민수(프론트·디자인), 서현(기획·백엔드)

이 문서는 결정이 아니라 **결정을 위한 조사 자료**입니다. 추천안(B)은 [decisions.md](../decisions.md)의 "Expo + react-native-web 한 코드베이스" 결정과 다릅니다. 채택하려면 decisions.md를 먼저 고쳐야 합니다.

### 검토 기록

- **1차 (2026-10-05, Claude)**: 버전·릴리스 날짜·라이선스·저장소 상태를 npm registry와 GitHub API로 대조해 고쳤습니다.
- **2차 (2026-10-05, Codex 설계 리뷰)**: "웹·앱 분리안(B)을 최선으로 추천하기엔 근거가 부족하다"는 지적을 받아 추천 순서를 바꿨습니다. 사실 오류도 함께 고쳤습니다. Codex가 붙인 출처는 본문에 그대로 옮겼습니다.
- **디자인 톤 변경 반영 (2026-10-05)**: 조사 당시의 디자인 조건은 포스터 톤(모서리 0, 검정 2px, 하드 섀도)이었습니다. 그 뒤 운영자 화면의 톤이 "A · 장부"(1px 회색 선, 모서리 8px, 그림자 없음, 보라 하나)로 확정됐습니다([README](README.md)). 2.2절과 결론을 새 톤 기준으로 고쳤습니다.

조사 뒤에 확인한 상태입니다.

| 조사 원문의 주장 | 확인 결과 |
| --- | --- |
| Shopify Restyle이 2026년 말 지원 종료 | 미확인. 공식 변경 기록에 종료 근거가 없습니다. 마지막 npm 릴리스는 2.4.5(2025-03-19)입니다. 릴리스 간격만으로 종료를 추론하지 않습니다 ([변경 기록](https://github.com/Shopify/restyle/blob/master/CHANGELOG.md)) |
| gluestack-ui v5가 웹 지원을 축소 | 틀렸습니다. 공식 소개가 React·Next.js·RN 공통 사용을 명시하고 v5 문서에 웹 설정이 있습니다 ([소개](https://gluestack.io/ui/docs/home/overview/introduction)) |
| React Native Paper 메인테이너 리소스 부족 | 현재 상태와 다릅니다. 2026-05에 메인테이너가 v6 작업 중이라고 답했습니다 ([답변](https://github.com/callstack/react-native-paper/discussions/4954)) |
| react-native-reusables가 최신 Expo·React 19·New Architecture에서 정상 동작 | 미확인. 패키지 정의만으로는 실제 동작을 보장하지 못합니다. 스파이크로 확인합니다 |
| @expo/ui가 웹 미지원·Expo Go 불가 | 틀렸습니다. Universal API는 웹 구현과 Expo Go 포함을 명시합니다. SwiftUI·Compose 전용 API와 구분해야 합니다 ([Expo UI Universal](https://docs.expo.dev/versions/latest/sdk/ui/universal/)) |
| Expo SDK 57에 RN 0.87 | 틀렸습니다(1차 검토에서 각 패키지의 최신 버전을 따로 붙인 실수). **SDK 57은 RN 0.86.3, React 19.2.3, Reanimated 4.5.1**입니다 ([SDK 57 번들 목록](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json), 2026-10-05 직접 확인) |

실기기, 빌드, 성능 검증은 아무도 실행하지 않았습니다. 3절 표의 패치 버전과 날짜는 2026-10-05 기준이며 그 뒤 다시 대조하지 않았습니다.

---

## 1. 결론 요약

1. **지금 정할 수 있는 것은 순서입니다.** 기존 결정인 "웹 먼저, 앱은 검증 후"([decisions.md](../decisions.md) 2026-08-02)를 유지하고, **Expo 한 코드베이스에 웹 전용 파일을 섞는 안(A-2)을 먼저 검증**합니다. 실패한 부분만 분리합니다.
2. **운영자 화면까지 지금의 Vite 웹으로 먼저 내고 RN을 뒤로 미루는 안**이 유력한 대안입니다. "RN과 웹 둘 다 타깃"은 동시 출시나 같은 화면을 두 번 만드는 것을 뜻하지 않습니다.
3. **웹·앱 분리안(B)은 A-2가 실패하거나 채널별 화면이 크게 달라질 때의 선택지**입니다. 운영자 화면을 앱과 모바일 웹 양쪽에 내야 하면 B는 입력·오류·시트·접근성 수정을 계속 두 번 하게 됩니다. 프론트 담당이 한 명이라 이 비용이 가장 큽니다.
4. **새 디자인 톤은 라이브러리 선택의 부담을 줄였습니다.** 1px 회색 선, 8px 모서리, 그림자 없음은 shadcn 계열의 기본 모습에 가깝습니다. 포스터 톤에서 걱정했던 RN의 하드 섀도 구현과 대규모 재스타일은 더 이상 문제가 아닙니다.
5. **어느 안이든 결정 전에 같은 운영자 흐름 하나를 실제로 만들어 비교해야 합니다**(7.3절). 부품이 그려지는지 확인하는 것만으로는 구조를 정할 수 없습니다. 이 구조 판단의 확신은 중간입니다.

---

## 2. 조사 배경 및 디자인 시스템 제약조건

### 2.1 제품 및 기술 전제
* **타깃 플랫폼**: React Native(iOS, Android)와 React Web 양쪽 지원 필수.
* **3대 화면의 이질적 요구사항**:
  1. **사업장 운영자 화면**: 폰 기준(390×844px), 한 손 터치 조작, 44px 터치 타깃, 모바일 하단 시트 및 하단 내비게이션 중심.
  2. **백오피스 화면**: PC 웹 기준(1024px+), 마스터 계정 전용, 복잡한 표(Table), 페이징, 대량 정보 훑어보기.
  3. **공개 수업 캘린더**: 비로그인 모바일/PC 웹, URL(`/{shop-key}/schedule`) 직접 진입, 빠른 첫 화면 로딩(경량 번들), SEO 및 접근성.
* **기존 자산**: 웹 프로토타입 `ddoukd-web`에 Vite + React 18 + Tailwind 4 기반의 shadcn/ui 컴포넌트 46개(Radix, react-day-picker, sonner, vaul, react-hook-form, lucide-react)가 기구축되어 있음. 앱 레포(`ddoukd-app`)는 비어 있음.

### 2.2 디자인 시스템 시각 요구조건 ("A · 장부", 2026-10-05 확정)

| 시각 요소 | 똑디 디자인 시스템 | 일반적인 기성 UI 라이브러리 기본값 |
| :--- | :--- | :--- |
| 모서리 | 버튼·입력 8px, 배지 4px | 4~12px. 가깝습니다 |
| 선 | 모두 1px. 입력 테두리는 바탕과 3:1 이상인 회색(`#8791a0`) | 1px 옅은 회색. 색만 진하게 바꾸면 됩니다 |
| 그림자 | 없음. 떠 있는 면은 1px 선과 배경 가림막 | blur가 있는 그림자. 걷어내야 합니다 |
| 색 | 보라 하나(`#5a46c8`). 노쇼만 검정 면, 만료 임박만 주황 글자 | 파랑·회색 계열. 테마 색 교체로 대응됩니다 |
| 글자 | Noto Sans KR 하나. 400 / 500 / 700 | 시스템 서체나 Inter |
| 목록 | 카드가 아니라 행. 60px 이상, 선으로 나눔 | 카드 위주. 행 컴포넌트는 직접 만듭니다 |
| 접근성 | 보라 2px outline + 2px offset(`:focus-visible`), 클릭 영역 44px, 입력 글자 16px | 2px 링 또는 브라우저 기본 포커스 |

> **조사 당시와 달라진 점.** 이 조사는 포스터 톤(모서리 0, 검정 2px, 하드 섀도)을 전제로 "스타일을 강제하는 라이브러리는 맞지 않고, 코드를 복사해 고치는 방식이 유리하다"고 봤습니다. 새 톤은 기성 라이브러리의 기본 모습에 가까워서 그 전제가 약해졌습니다. 그래도 코드를 프로젝트가 소유하는 복사형 방식(shadcn, react-native-reusables)은 클릭 영역 44px, 입력 16px, 포커스 표시 같은 세부를 맞추기 쉽다는 점에서 여전히 유리합니다. Material Design에 묶인 React Native Paper처럼 테마가 강한 라이브러리는 주력으로 권하지 않습니다. 다만 "쓸 수 없다"는 뜻은 아니며, OS 날짜·선택기처럼 일부 입력에 쓰는 것은 명세와도 맞습니다.

**기존 `ddoukd-web` 자산에 대해.** shadcn 컴포넌트 약 46개가 들어 있지만 똑디 명세에 맞춘 것은 아닙니다. 예를 들어 Button은 `rounded-md`에 높이 36~40px(`h-9`, `h-10`)이고 명세는 48px입니다. Calendar의 날짜 칸은 32px이고 명세는 44px입니다. 포커스 표시도 반투명 링입니다. 색과 모서리 토큰만 옮긴다고 맞춰지지 않으므로, 실제로 쓸 컴포넌트만 골라 수정 비용을 따로 잡아야 합니다(2026-10-05 `src/app/components/ui/button.tsx`, `calendar.tsx` 확인).

---

## 3. UI 컴포넌트 및 스타일 라이브러리 후보군 사실 확인

조사 대상 후보들을 (1) 웹 헤드리스 라이브러리, (2) React Native / 크로스플랫폼 컴포넌트 라이브러리, (3) 스타일링 엔진, (4) 포스터 톤 참고 컬렉션으로 나눠 사실을 정리했습니다.

### 3.1 웹 헤드리스(Headless) UI 라이브러리

| 후보 라이브러리 | 지원 플랫폼 | 스타일링 방식 | WAI-ARIA 접근성 | React 19 / 최신 호환 | 유지보수 상태 (최신 버전 / 확인일) | 라이선스 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **shadcn/ui** | React DOM (웹) | Tailwind CSS (v3 / v4) | 기반 라이브러리에 따름 | 호환 (공식 v4 지원) | 활발 (CLI `shadcn` 4.21.1, 2026-10-01) | MIT |
| **Radix Primitives** | React DOM (웹) | Unstyled (완전 자유) | 최상 (W3C 표준 준수) | 호환 (최신 패치 완료) | 활발 (`radix-ui` 1.6.7, 2026-07-24) | MIT |
| **Base UI (@base-ui/react)** | React DOM (웹) | Unstyled (CSS/Tailwind) | 최상 (MUI 팀 신규 설계) | 호환 (1.0 안정판 이후) | 활발 (1.8.0, 2026-09-04) | MIT |
| **React Aria Components** | React DOM (웹) | Unstyled / Hooks | 최상 (국제화·접근성 최강) | 호환 (Adobe 공식) | 활발 (1.21.1, 2026-09-04) | Apache-2.0 |
| **Ark UI (@ark-ui/react)** | React DOM, Vue, Svelte | Unstyled (Zag.js 상태머신) | 최상 (WAI-ARIA 준수) | 호환 (Chakra 팀) | 활발 (5.39.2, 2026-09-13) | MIT |
| **Headless UI** | React DOM (웹) | Unstyled (Tailwind Labs) | 우수 | 호환 (v2.x) | 보통 (2.2.10, 2026-04-07) | MIT |

#### 상세 팩트체크
* **shadcn/ui**
  * 사실: React Native를 직접 지원하지 않는 웹 전용 도구입니다. **Radix 전용이 아닙니다.** 2026-07부터 신규 프로젝트의 기본 기반은 Base UI이고 React Aria 기반도 제공합니다. 기존 Radix 기반은 계속 지원되므로 `ddoukd-web`을 옮길 필요는 없습니다 ([Base UI 기본 전환](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), [React Aria 지원](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)). 2025~2026년에 걸쳐 Tailwind CSS v4(`@theme` CSS-first 아키텍처) 및 React 19를 공식 지원하도록 CLI와 컴포넌트가 전면 업데이트되었습니다.
  * 출처: [shadcn/ui 공식 문서](https://ui.shadcn.com) (확인 날짜: 2026-10-05), [GitHub shadcn-ui/ui](https://github.com/shadcn-ui/ui)
* **Radix Primitives**
  * 사실: 웹 DOM API(`document`, `window`, HTML focus 이벤트 등)에 강하게 의존하여 React Native 환경에서 단독 실행되지 않습니다. 포커스 트랩, 방향키 탐색, Esc 닫기 등 WAI-ARIA 명세를 가장 충실하게 만족합니다.
  * 출처: [Radix UI 공식 문서](https://www.radix-ui.com) (확인 날짜: 2026-10-05)
* **Base UI (@base-ui/react)**
  * 사실: 기존 `@base-ui-components/react`에서 `@base-ui/react`로 패키지명이 변경되며 v1.0 안정판에 도달했습니다. 웹 전용이며 React Native는 지원하지 않습니다.
  * 출처: [Base UI 공식 사이트](https://base-ui.com) (확인 날짜: 2026-10-05)
* **React Aria / React Aria Components**
  * 사실: Adobe의 React Aria는 웹 전용입니다. React Native용으로는 GeekyAnts가 포팅한 커뮤니티 프로젝트 `react-native-aria`가 별도로 존재합니다.
  * 출처: [Adobe React Spectrum](https://react-spectrum.adobe.com/react-aria/) (확인 날짜: 2026-10-05)
* **Ark UI**
  * 사실: Zag.js(유한 상태 머신) 기반으로 React, Vue, Svelte를 지원하지만 React Native 바인딩은 공식적으로 제공하지 않습니다(웹 전용).
  * 출처: [Ark UI 공식 문서](https://ark-ui.com) (확인 날짜: 2026-10-05)

---

### 3.2 React Native 및 크로스플랫폼 UI 라이브러리

| 후보 라이브러리 | 지원 플랫폼 (Web / iOS / Android) | 스타일링 방식 | 토큰 100% 재스타일 가능 여부 | 접근성 수준 | Expo / New Architecture 호환 | 유지보수 상태 (확인일: 2026-10-05) | 라이선스 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **react-native-reusables (RNR)** | Universal (iOS, Android, Web) | NativeWind / Tailwind | **가능** (Copy-paste) | 웹은 Radix. 네이티브는 자체 hook + RN 컴포넌트(직접 검증 필요) | 미확인 (스파이크 필요) | 활발 (CLI 0.7.1, 2026-03-14 · 저장소 push 2026-09-27) | MIT |
| **RN Primitives (rn-primitives)** | Universal (iOS, Android, Web) | Headless (Unstyled) | **가능** (완전 무스타일) | **우수** (Web: Radix 포워딩) | 호환 (TurboModules/Fabric 지원) | 활발 (1.5.2, 2026-07-02) | MIT |
| **gluestack-ui** | iOS, Android, Web | NativeWind / Tailwind | **가능** (Copy-paste) | 양호 (직접 검증 필요) | 호환 (v5) | 활발 (`@gluestack-ui/core` 5.0.15, 2026-06-25) | MIT (npm 기준) |
| **Tamagui** | Universal (Web, iOS, Android) | Tamagui 스타일. 컴파일러는 선택 사항 | 가능 (unstyled 구성 있음) | 양호 (직접 검증 필요) | 호환 (공식 문서 기준) | 활발 (2.7.7, 2026-08-15 · v3 beta 진행 중) | MIT |
| **React Native Paper** | Universal (Web, iOS, Android) | MD3 테마 | 주력으로 비추천 (MD3 모습과 충돌) | 보통 (모바일 위주) | 호환 (v5.15.3) | 활발 (5.15.3, 2026-05-26 · v6 작업 중) | MIT |
| **Expo UI (@expo/ui)** | iOS, Android, Web(Universal API) | OS 네이티브 위젯 | 주력으로 비추천 (OS 모습을 따름) | OS 네이티브 접근성 | Expo Go 포함(Universal API) | 활발 (57.0.21, 2026-09-29) | MIT |

#### 상세 팩트체크
* **react-native-reusables (RNR)**
  * **아키텍처**: shadcn/ui의 설계를 React Native로 옮긴 프로젝트입니다. npm 패키지 통설치가 아닌 `@react-native-reusables/cli`를 통해 프로젝트 내부 컴포넌트 폴더로 코드를 복사합니다.
  * **접근성**: 내부의 `rn-primitives`는 웹 빌드에서 `@radix-ui/react-*`를 그대로 씁니다([웹 Dialog 구현](https://raw.githubusercontent.com/roninoss/rn-primitives/main/packages/dialog/src/dialog.web.tsx)). 네이티브에서는 `react-native-aria`가 아니라 자체 hook과 RN 컴포넌트를 씁니다([네이티브 구현](https://raw.githubusercontent.com/roninoss/rn-primitives/main/packages/dialog/src/dialog.tsx)). 웹의 Radix 품질과 앱의 접근성 품질은 따로 확인해야 합니다.
  * **플랫폼 호환**: Expo 권장 조합(SDK 57, RN 0.86.3, React 19.2.3)에서의 동작은 직접 확인하지 못했습니다(미확인). 7.3절의 검증 1·2번에서 확인합니다.
  * 출처: [reactnativereusables.com](https://reactnativereusables.com) (확인 날짜: 2026-10-05), [GitHub founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables)
* **RN Primitives (rn-primitives)**
  * **역할**: RNR의 코어 엔진 역할을 하는 비스타일(headless) 원시 컴포넌트 모음. 저장소는 [roninoss/rn-primitives](https://github.com/roninoss/rn-primitives).
  * **버전**: `@rn-primitives/dialog` 1.5.2, `@rn-primitives/types` 1.4.0 등 2026년 기준 지속 릴리스 중입니다.
  * 출처: [rnprimitives.com](https://rnprimitives.com) (확인 날짜: 2026-10-05)
* **gluestack-ui**
  * **변화 이력**: v1의 런타임 스타일 엔진(`gluestack-style`)을 버리고, v2부터 NativeWind(Tailwind) 기반의 copy-paste 모듈러 구조로 전면 전환되었습니다.
  * **웹 지원**: v5 문서에 웹 설정이 있습니다. Table과 DateTimePicker 문서도 있습니다(메뉴에 alpha 표시가 있어 안정성은 따로 봐야 합니다). 탈락시킬 근거가 없어 예비 후보로 둡니다 ([Table](https://gluestack.io/ui/docs/components/table), [DateTimePicker](https://gluestack.io/ui/docs/components/date-time-picker)).
  * 출처: [gluestack.io](https://gluestack.io) (확인 날짜: 2026-10-05)
* **Tamagui**
  * **버전 및 상태**: 2026-10-05 기준 안정 버전은 2.7.7(2026-08-15)이고 v3 beta가 진행 중입니다. React 19·New Architecture·Expo 지원 범위는 공식 문서 기준 서술이며 직접 확인하지 않았습니다.
  * **장단점**: 웹과 앱을 한 스타일 체계로 쓰는 것이 목표입니다. 컴파일러 설치는 필수가 아니고 unstyled 구성도 있어서 "설정이 복잡해 부적합"이라는 원래 평가는 낮춰야 합니다([컴파일러 선택 사항](https://tamagui.dev/docs/intro/compiler-install)). 민수의 숙련도와 실제 작업 시간을 모르므로 RNR보다 낫다고도, 못하다고도 단정하지 않습니다.
  * 출처: [tamagui.dev](https://tamagui.dev) (확인 날짜: 2026-10-05)
* **React Native Paper**
  * **버전 및 한계**: 5.15.3이고 v6 작업이 진행 중입니다. Material Design 3의 모습(ripple, elevation)이 컴포넌트에 묶여 있어 똑디 톤으로 맞추려면 덮어쓸 것이 많습니다. 주력으로는 권하지 않습니다.
  * 출처: [reactnativepaper.com](https://callstack.github.io/react-native-paper/) (확인 날짜: 2026-10-05)
* **Expo UI (@expo/ui)**
  * **원리**: Swift(SwiftUI)와 Kotlin(Jetpack Compose)을 직접 브릿징하는 컴포넌트입니다.
  * **쓰임**: OS 고유의 위젯 모양을 쓰는 방식이라 전체 디자인 시스템의 주력으로는 맞지 않습니다. 날짜·시각 선택처럼 명세가 OS 선택기를 허용한 입력에는 쓸 수 있습니다.
  * 출처: [Expo 공식 문서 Expo UI](https://docs.expo.dev) (확인 날짜: 2026-10-05)

---

### 3.3 스타일링 엔진 및 토큰 라이브러리

| 라이브러리 | 성격 | Tailwind 4 호환성 | React Native New Architecture | 토큰 이식 용이성 |
| :--- | :--- | :--- | :--- | :--- |
| **NativeWind** | Tailwind for RN | v4.2.7은 Tailwind 3. v5.0.0-rc.0이 Tailwind 4 지원(공식 문서가 production 용도가 아니라고 명시) | 호환 (v4.2.7이 SDK 57 지원을 명시) | CSS 변수와 tailwind 설정 연계 |
| **Uniwind** | Tailwind 4 for RN | Tailwind 4 지원 | 무료판은 JS 엔진(Expo Go 지원). C++ 엔진은 유료 Pro(development build 필요) | `global.css` @theme 변수 연동 |
| **Unistyles (react-native-unistyles)** | C++ 기반 고속 스타일링 | Tailwind 아님 (StyleSheet 확장) | 호환 (3.4.0, 2026-10-01) | `tokens.json` JavaScript 객체 주입 |
| **Restyle (@shopify/restyle)** | TypeScript 테마 라이브러리 | Tailwind 무관 | 미확인 | 마지막 릴리스 2.4.5(2025-03-19). 지원 종료 주장은 미확인 |

* **NativeWind 현황**: 안정 버전은 4.2.7(Tailwind 3 기반)이고 SDK 57 지원을 명시합니다([v4 설치](https://www.nativewind.dev/docs/getting-started/installation)). v5는 RC이고 공식 문서가 production 용도가 아니라고 적고 있습니다([v5 설치](https://www.nativewind.dev/v5/getting-started/installation)). 웹은 Tailwind 4, 앱은 Tailwind 3으로 두고 토큰을 생성해 맞추는 것도 가능합니다. v4, v5 RC, Uniwind는 서로 다른 검증 조합으로 다룹니다.
* **Uniwind**: Unistyles 제작진이 만든 Tailwind v4용 RN 스타일링 엔진입니다(1.12.1, 2026-10-01). 무료판은 JS 엔진이고 C++ 엔진은 Pro입니다([공식 비교](https://docs.uniwind.dev/pro-version)). 성능 주장은 제작사 설명이며 직접 측정하지 않았습니다.
* **Shopify Restyle**: 조사 원문은 2026년 말 지원 종료가 확정됐다고 적었지만 검토에서 근거를 찾지 못했습니다(미확인). 다만 npm 릴리스가 2025-03 이후 없어 신규 채택 우선순위는 낮습니다.

---

### 3.4 네오 브루탈리즘 shadcn 컬렉션 (지금은 해당 없음)

조사 당시 포스터 톤의 참고 자료로 [neobrutalism.dev](https://neobrutalism.dev)(ekmas/neobrutalism-components)와 [boldkit](https://github.com/ANIBIT14/boldkit)을 찾았습니다. 운영자 화면의 톤이 바뀌어 지금은 쓰지 않습니다. 공개 캘린더에서 포스터 톤 변형을 쓰기로 하면 다시 봅니다.

---

## 4. 필요 컴포넌트 18종 충족 매트릭스

`components-operator.md` 및 `README.md`에서 도출된 18종 컴포넌트가 각 후보 라이브러리에서 어떻게 충족되는지 대조한 결과입니다.

| # | 필요 컴포넌트 | shadcn/ui (Web) | react-native-reusables (Universal) | gluestack-ui (v2/v5) | Tamagui (v2) | 결손 시 표준 대체 방안 (RN 생태계) |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | **TextField** (접두·비번·검색·복사) | 제공 (`Input`) | 제공 (`Input`) | 제공 (`Input`) | 제공 (`Input`) | 복사 버튼/접두는 Flexbox View 조합 |
| 2 | **Textarea** (회원 메모) | 제공 (`Textarea`) | 제공 (`Textarea`) | 제공 (`Textarea`) | 제공 (`TextArea`) | RN 기본 `TextInput multiline` |
| 3 | **Select** (단일 선택) | 제공 (`Select`) | 제공 (`Select`) | 제공 (`Select`) | 제공 (`Select`) | 모바일 폰은 OS 네이티브 휠/시트 권장 |
| 4 | **Checkbox** (공개 여부 등) | 제공 (`Checkbox`) | 제공 (`Checkbox`) | 제공 (`Checkbox`) | 제공 (`Checkbox`) | `expo-checkbox` 또는 RNR Checkbox |
| 5 | **Radio** (단일 옵션) | 제공 (`RadioGroup`) | 제공 (`RadioGroup`) | 제공 (`Radio`) | 제공 (`RadioGroup`) | RNR RadioGroup |
| 6 | **Switch** (즉시 반영 토글) | 제공 (`Switch`) | 제공 (`Switch`) | 제공 (`Switch`) | 제공 (`Switch`) | RN 기본 `Switch` 또는 RNR Switch |
| 7 | **DatePicker** (수업 날짜) | 제공 (`react-day-picker`) | **미제공** | 문서 있음(alpha 표시) | **미제공** | 폰은 OS 선택기(명세가 허용). 웹은 `<input type="date">` 또는 `react-day-picker` |
| 8 | **TimePicker** (수업 시각) | 제공 (조합형) | **미제공** | **미제공** | **미제공** | 모바일: 네이티브 타임피커 / 웹: Select 목록 |
| 9 | **Form 검증** (라벨·오류요약) | 제공 (`Form` / RHF) | 제공 (`react-hook-form`) | 제공 (`FormControl`) | 제공 (`Form`) | `react-hook-form` + `zod` 결합 |
| 10 | **Table** (운영자 PC 보기) | 제공 (`Table`) | **부분 제공** (rn-primitives Table) | 문서 있음(웹은 HTML 태그) | **미제공** | 웹 전용 파일에서 실제 `<table>`. 정렬·페이징이 필요해지면 `@tanstack/react-table` |
| 11 | **List** (모바일 회원/예약 목록) | 제공 (`Card` 등 조합) | 제공 (`Card`, `Separator`) | 제공 (`Card` 등) | 제공 (`Card`, `YStack`) | RN `FlatList` / `FlashList` 기반 행 렌더링 |
| 12 | **Tabs** (패널 전환) | 제공 (`Tabs`) | 제공 (`Tabs`) | 제공 (`Tabs`) | 제공 (`Tabs`) | RNR Tabs |
| 13 | **Modal / 확인창** (휴강·노쇼) | 제공 (`AlertDialog`) | 제공 (`AlertDialog`, `Dialog`) | 제공 (`AlertDialog`) | 제공 (`AlertDialog`, `Dialog`) | RNR AlertDialog |
| 14 | **하단 시트** (확인창, 선택) | Radix Dialog를 하단에 배치. `vaul`은 유지보수 중단 | **제한적** (Dialog 시트 모드) | 제공 (`Actionsheet`) | 제공 (`Sheet`) | 드래그·스냅이 필요 없으면 Dialog 하단 배치로 충분. `@gorhom/bottom-sheet`는 RN Web도 지원 |
| 15 | **Toast** (짧은 알림 피드백) | 제공 (`sonner`) | **별도 연동** (`sonner-native`) | 제공 (`Toast`) | 제공 (`Toast`) | 웹: `sonner` / 앱: `sonner-native` |
| 16 | **EmptyState** (빈 화면) | 패턴 조합 | 패턴 조합 | 패턴 조합 | 패턴 조합 | 독자 레이아웃 컴포넌트 제작 |
| 17 | **Pagination** (페이지 이동) | 제공 (`Pagination`) | 패턴 조합 (버튼 결합) | 패턴 조합 | 패턴 조합 | Button + Text 조합형 독자 컴포넌트 |
| 18 | **AppShell** (헤더·사이드바·내비) | 레이아웃 조합 | 레이아웃 조합 | 레이아웃 조합 | 레이아웃 조합 | 모바일: Expo Router Tabs / PC: 독자 Shell |

> **분석 요약**: 어느 후보든 DatePicker, TimePicker, Table, 하단 시트, Toast는 플랫폼마다 다르게 채워야 합니다. "제공"은 컴포넌트가 있다는 뜻이지 똑디 명세(44px 영역, 포커스 복귀, 키보드 회피)를 충족한다는 뜻이 아닙니다. **`vaul`은 공식 저장소가 유지보수 중단을 명시**했으므로 새 표준 의존성으로 삼지 않습니다([공지](https://github.com/emilkowalski/vaul)). 명세는 하단 배치, 본문 스크롤, 고정 버튼만 요구하고 드래그를 요구하지 않습니다. 백오피스는 이 디자인 시스템 밖이므로(2026-10-05 결정) 표가 필요한 곳은 운영자 화면의 PC 보기뿐입니다.

---

## 5. 아키텍처 구조 선택지 비교

> **읽는 법.** 아래 5절의 표와 상세 검토는 조사 원문이고 B안에 유리하게 쓰였습니다. Codex 리뷰가 지적한 문제는 세 가지입니다. (1) A-2는 웹 전용 파일에서 실제 `<table>`과 shadcn을 쓸 수 있는데, 표에서는 A의 제약("View 기반 모조 표")으로 평가했습니다. (2) 공개 캘린더의 "Vite가 더 빠르다"는 측정하지 않은 가설입니다. Expo Router도 정적 HTML 출력을 지원합니다([정적 렌더링](https://docs.expo.dev/router/web/static-rendering/)). (3) 백오피스는 shop 생성과 목록 정도라 "복잡한 표"를 프론트 분리의 근거로 삼기엔 과합니다. 지금은 백오피스가 디자인 시스템 밖이기도 합니다. **현재의 판단은 5.2절과 7절입니다.**

### 구조 비교 종합표

| 평가 항목 | A안: Expo 단일 코드베이스 (RNR 중심) | B안: 웹/앱 분리 및 토큰 공유 (조합안, 추천) | C안: 크로스플랫폼 통합 라이브러리 (Tamagui) |
| :--- | :--- | :--- | :--- |
| **코드베이스 형태** | Expo + react-native-web 단일 레포 | 모노레포 또는 2개 레포 (웹 + 앱) | Expo + Next/Vite 모노레포 (Tamagui) |
| **웹 화면 구현 방식** | react-native-web 변환 렌더링 | 순수 React DOM + Tailwind 4 (기존 자산) | Tamagui 웹 컴파일러 변환 렌더링 |
| **기존 ddoukd-web 자산 활용** | 재작성 필요 (낮음) | 동작 코드 재사용, **스타일은 토큰으로 다시 입혀야 함** (높음) | 전면 재작성 (매우 낮음) |
| **사업장 폰 화면 (운영자)** | RNR로 모바일 UI 구현 우수 | RNR로 모바일 UI 구현 우수 | Tamagui로 모바일 UI 구현 우수 |
| **백오피스 PC 표 (Table)** | **약함** (View 기반 모조 표, 접근성 한계) | **최상** (TanStack Table + Radix 순수 표) | **약함** (공식 Table 부재, CSS 그리드 조합) |
| **비로그인 공개 캘린더** | 보통 (RN-web 번들 큼, 초기 로딩 지연) | **최상** (가벼운 Vite 정적 번들, 빠른 로딩) | 보통 (초기 번들 및 CSS 추출 설정 필요) |
| **톤 맞추기(1px 선, 8px 모서리, 그림자 없음)** | RNR 복사 수정 | 웹: shadcn 클래스 수정 / 앱: RNR 복사 수정 | Tamagui 테마로 대응(작업량 미확인) |
| **유지보수 및 학습 비용** | 한 언어/프레임워크 단일화 (낮음) | 웹/앱 역할 분담 명확, 분리 관리 (중간) | Tamagui 컴파일러 및 테마 학습 (매우 높음) |

---

### 5.1 상세 검토

#### A안: 한 코드베이스(Expo + react-native-web)에 RN 라이브러리(RNR) 단일화
* **운영자 폰 화면**: RNR과 NativeWind로 구현합니다.
* **백오피스 PC 표**: 약한 부분입니다. react-native-web의 `View`로는 HTML `<table>` 시맨틱과 키보드 조작을 그대로 얻기 어려워 웹 전용 구현을 따로 둬야 합니다.
* **공개 캘린더**: react-native-web 런타임이 번들에 포함됩니다. 첫 로딩에 미치는 영향은 측정하지 않았습니다.
* **극복 방안**: `Table.web.tsx`, `DatePicker.web.tsx` 형태로 웹 플랫폼 전용 확장자 파일을 분리하여, 웹 빌드 시에만 HTML 시맨틱 및 웹 전용 라이브러리를 주입하는 하이브리드 아키텍처를 취해야 합니다.

#### B안 (추천): 웹(shadcn/ui + Radix)과 앱(Expo + RNR) 분리, tokens.json으로 스타일 동기화
* **운영자 폰 화면**: `ddoukd-app`에서 Expo + react-native-reusables로 구현합니다. 메이미가 원한 "폰으로 메모 + 사진 찍어 올리기"([interviews/01-maymi-pilates.md](../interviews/01-maymi-pilates.md), MVP+1 검토 중)처럼 기기 기능이 필요한 쪽이 앱의 몫입니다.
* **백오피스 PC 표**: `ddoukd-web`의 shadcn Table에 필요하면 TanStack Table을 붙입니다. 백오피스는 우리만 쓰므로 앱으로 낼 이유가 없다는 점은 [README](../README.md)에도 적혀 있습니다.
* **공개 캘린더**: 비로그인 웹이라 Vite 웹 앱 쪽에 둡니다.
* **토큰 동기화**: `tokens.json`에서 웹의 Tailwind 4 `@theme`과 앱의 NativeWind/Uniwind 테마를 생성해 두 플랫폼의 형태(1px 선, 8px 모서리, 보라 하나)를 맞춥니다. 같은 사람이 폰 앱과 PC 웹을 오가므로 운영자 화면을 어느 쪽에 둘지는 따로 정해야 합니다.

#### C안: 크로스플랫폼 통합 라이브러리(Tamagui) 단일화
* **현실적 장벽**: `ddoukd-web`의 shadcn 컴포넌트와 Tailwind 4 설정을 Tamagui 문법으로 다시 작성해야 합니다.
* **1인 프론트 개발 리스크**: 민수 혼자서 인프라, 디자인, 프론트를 모두 도맡고 있는 상황([README](../README.md))에서, Tamagui 컴파일러 설정과 학습에 드는 시간이 부담입니다. 블로그·커뮤니티 의견에 기댄 평가이며 직접 써 보지 않았습니다.

---

### 5.2 다시 정리한 선택지 (2026-10-05, Codex 리뷰 반영)

| 선택지 | 지금 조건에서의 판단 | 채택 조건과 주요 비용 |
| --- | --- | --- |
| **A-2: Expo Router + react-native-reusables + 필요한 `.web.tsx`** | **먼저 검증할 후보** | 운영자 웹·앱의 공통 화면을 유지하고 표·날짜 입력·시트만 분기합니다. 기존 결정과 가장 잘 맞습니다. 웹 배포, CSS, 접근성 검증이 필요합니다 ([플랫폼 분기](https://docs.expo.dev/router/advanced/platform-specific-modules/)) |
| **Vite 웹 선출시, RN 후속** | **초기 개발량을 줄일 유력 후보** | 운영자도 반응형 웹으로 냅니다. RN 타깃은 유지하되 출시를 늦춥니다. 나중에 UI를 옮기는 비용을 미리 적어 둬야 합니다 |
| **B: 웹·앱 별도 UI + 공통 패키지** | A-2 검증이 실패하거나 채널별 화면이 크게 다를 때 | 토큰뿐 아니라 API 클라이언트, 입력 스키마, 날짜 변환, 오류 매핑을 공유합니다. UI 변경과 플랫폼 QA는 각각 해야 합니다 |
| **Expo + 일부 DOM components** | 기존 웹 화면을 앱에 빨리 넣을 때의 보조안 | 네이티브에서는 WebView가 됩니다. 상태·입력·내비게이션 경계 비용이 있어 운영자 화면 전체의 기본값으로는 보류합니다 ([DOM components](https://docs.expo.dev/guides/dom-components/)) |
| **gluestack / Tamagui** | 예비 후보 | 공통 화면 작성 경험과 스타일 수정량을 RNR과 비교합니다. 지금 자료로는 RNR보다 낫다고 단정할 근거가 없습니다 |
| **React Strict DOM** | 장기 검토 | 완성형 업무 컴포넌트 세트가 아니고 스타일 체계를 바꿔야 해서 이번 착수의 우선순위는 낮습니다 ([소개](https://react.github.io/react-strict-dom/learn/)) |

구분해 둘 것:

- **웹 선출시와 PWA는 별개입니다.** 일반 모바일 웹으로 먼저 내고, 설치·오프라인 요구가 생기면 PWA 범위를 정합니다.
- **사진 촬영만으로 앱이 필수가 되지는 않습니다.** 기존 결정에 file input 폴백이 있고 Expo ImagePicker도 웹을 지원합니다([ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)). 실제 촬영 흐름의 브라우저 제약은 따로 검증합니다.
- **모노레포에서 공유할 것은 토큰보다 넓습니다.** 순수 TypeScript의 계약, 검증, 변환을 공유하고 인증 저장소, 라우터, 파일 선택은 플랫폼 어댑터로 둡니다. NestJS 엔티티나 관리자 DTO를 공개 캘린더와 공유하지 않습니다. React 18 웹과 React 19 앱을 함께 두면 React가 중복으로 해석되는지 확인해야 합니다([Expo 모노레포 지침](https://docs.expo.dev/guides/monorepos/)).
- **`.web.tsx`의 `<table>`과 `'use dom'`은 다릅니다.** 앞은 일반 웹 DOM이고, 뒤는 앱에서 WebView와 비동기 경계를 만듭니다.

---

## 6. tokens.json을 각 방식의 테마로 옮기는 방법

토큰의 원본은 [tokens.json](tokens.json) 하나이고 `scripts/build-tokens.py`가 CSS 변수([tokens.css](tokens.css))와 Claude Design용 토큰을 생성합니다. 구현 라이브러리의 테마도 같은 방식으로 **생성**해야 합니다. 색 몇 개를 손으로 복사하는 것은 동기화가 아닙니다.

| 방식 | 옮기는 방법 | 주의 |
| --- | --- | --- |
| Tailwind CSS 4 (`@theme`) | `tokens.css`의 변수를 `@theme` 블록의 `--color-*`, `--radius-*`, `--spacing-*`로 내보내는 출력을 스크립트에 추가 | 기존 컴포넌트의 `rounded-md` 같은 클래스는 토큰을 바꿔도 그대로입니다. 컴포넌트 쪽 클래스를 고쳐야 합니다([radius 규칙](https://tailwindcss.com/docs/border-radius)) |
| NativeWind 4 (Tailwind 3 설정) | `tailwind.config.js`의 `theme.extend`를 스크립트로 생성 | v4는 JS 설정, v5와 Uniwind는 CSS 설정입니다. 두 출력을 따로 둡니다 |
| Tamagui | `createTokens`에 넣을 객체를 스크립트로 생성 | 역할 토큰을 테마 키로 어떻게 나눌지 먼저 정해야 합니다 |
| Unistyles 3 | `StyleSheet.configure({ themes })`에 넣을 객체를 생성 | 3.x API 기준입니다 |

RN에서는 `lineHeight`에 CSS의 배수(1.4)를 그대로 넣지 않고 px로 환산해야 합니다([RN 텍스트 스타일](https://reactnative.dev/docs/text-style-props)). 조사 원문의 설정 코드 예시는 포스터 톤의 색과 하드 섀도를 담고 있어 지웠습니다.

---

## 7. 추천과 검증

### 7.1 추천 순서

1. **기존 "웹 먼저" 결정을 유지합니다.** 파일럿은 사장에게 URL을 주고 폰 브라우저로 쓰게 합니다.
2. **A-2(Expo Router + react-native-reusables + 필요한 `.web.tsx`)를 먼저 검증합니다.** 통과하면 기존 결정의 구체화로 기록합니다.
3. **A-2가 운영자 흐름에서 막히면** 막힌 컴포넌트만 분기해 풀 수 있는지 먼저 봅니다. 접근성이나 CSS 문제 하나를 구조 전체의 실패로 넓히지 않습니다.
4. **그래도 안 되면** 운영자 화면까지 Vite 웹으로 먼저 내고 RN을 뒤로 미루거나, B로 갑니다.

웹 쪽 검증은 `ddoukd-web`에 맞춰 pnpm으로 합니다. `ddoukd-app`은 비어 있어 패키지 매니저가 정해지지 않았습니다.

### 7.2 이 추천이 틀릴 수 있는 조건

- react-native-reusables가 Expo 권장 조합(SDK 57, RN 0.86.3, React 19.2.3)에서 웹 production 빌드까지 안정적으로 돌지 않는 경우. 지금은 미확인입니다.
- 운영자 화면을 설치 없이 URL로만 쓰는 것이 파일럿에서 충분하다고 확인되는 경우. 그러면 RN을 서두를 이유가 줄고 Vite 웹 선출시가 가장 쌉니다.
- 민수가 Expo 웹 타깃 검토(README 다음 액션 3번)에서 라우팅·반응형·빌드 중 하나가 막힌다고 판단하는 경우.

### 7.3 결정 전에 할 검증

조사 원문의 스파이크는 부품이 그려지는지 보는 것이라 구조를 정하기엔 부족했습니다. Codex 리뷰가 제안한 순서로 바꿨습니다. 하드 섀도 검증은 톤이 바뀌어 뺐습니다. 각 패키지의 최신 버전이 아니라 **Expo가 권장하는 한 묶음(SDK 57, RN 0.86.3, React 19.2.3)을 고정**하고 lockfile을 남깁니다.

| 순서 | 검증 | 통과·중단 기준 |
| --- | --- | --- |
| 0 | 운영자 화면을 웹으로 꼭 내야 하는지, 앱 출시 시점, 지원 OS·브라우저를 정한다 | 기존 "웹 먼저"를 바꿀 근거가 없으면 유지. 여기서 두 안이 만들 화면 범위를 똑같이 고정한다 |
| 1 | 호환 버전을 고정하고 웹 production export와 iOS·Android 빌드 | Expo 권장 조합에서 재현돼야 한다. 후보를 쓰려고 지원 밖 RN 버전을 강제해야 하면 그 조합은 중단 |
| 2 | **로그인 → 회원 검색·선택 시트 → 날짜 입력 → 예약 → 409 오류 처리** 한 흐름 | 한글 입력, 키보드, 스크롤, 뒤로 가기, 입력 보존, 스크린리더까지 본다. 화면 전체를 갈라야 하거나 라이브러리 내부를 고쳐야 하면 비용을 기록 |
| 3 | 실제 호스팅에서 새 shop-key로 직접 진입·새로고침·공개 캘린더 | 새 샵에 재배포 없이 접근돼야 한다. 다른 샵의 세션·캐시가 섞이거나 비공개 값이 노출되면 실패 |
| 4 | 포커스·폰트·1px 선·44px 영역을 하나의 상태 갤러리로 확인 | 360px, 긴 한국어, 글자 확대, 오류와 포커스 동시, 시트 안 입력까지 명세를 충족. OS 선택기 예외는 미리 적는다 |
| 5 | 같은 데이터·폰트·기기·네트워크에서 A-2와 Vite 웹 비교 | 초기 JS·폰트 용량, 첫 유효 화면, 조작 응답. 허용 기준을 먼저 정한다 |
| 6 | 두 안에 같은 후속 변경 적용(예: 회원 검색 조건과 필드 오류 추가) | 수정 파일, 플랫폼 분기, QA 시간으로 유지비를 비교. 미리 정한 시간 상한을 넘으면 범위를 줄이거나 분리 |

2번에서 Button과 Input만 Tab으로 확인하고 react-native-reusables 전체가 호환된다고 적으면 안 됩니다. Dialog, Select, Portal, 시트의 조합과 production 빌드가 들어가야 합니다.

구현에서 조심할 점입니다.

| 항목 | 함정 |
| --- | --- |
| 포커스 outline | 웹은 CSS outline으로 됩니다. RN에도 outline 속성이 있지만 `:focus-visible` 동작이 자동으로 생기지는 않습니다. 키보드 포커스와 VoiceOver·TalkBack 포커스를 각각 봅니다 ([RN 스타일](https://reactnative.dev/docs/view-style-props)) |
| 폰트 | Noto Sans KR의 정적 폰트 파일 기준으로 검증합니다 ([Expo 폰트](https://docs.expo.dev/develop/user-interface/fonts/)) |
| 날짜·시각 | OS 선택기는 명세가 허용한 예외라 톤을 강제할 필요가 없습니다. 기기 타임존과 `shop.timezone`의 차이, 날짜만 있는 값의 변환, 취소 동작을 봅니다 ([DateTimePicker](https://github.com/react-native-datetimepicker/datetimepicker#timezonename-optional-ios-and-android-only)) |
| 하단 시트·토스트 | 키보드 회피, safe area, 뒤로 가기, 닫은 뒤 포커스, 읽기 알림, 오류 유지를 봅니다 |

### 7.4 결정 기록을 다루는 법

- 이 문서의 머지는 구조의 채택이 아닙니다.
- 기존 결정을 고치지 않고 `decisions.md`에 날짜를 붙인 후속 결정으로 남깁니다.
- "RN과 React 둘 다 타깃"(2026-10-05 서현)은 명시하되, 웹 선출시, 운영자 화면을 어디에 낼지, 코드 공유 구조는 따로 정합니다.
- A-2를 택하면 2026-08-02 결정의 구체화로 적습니다. B를 택하면 그 결정 중 무엇을 대체하는지, 운영자 웹을 어떤 코드로 내는지, 중복 구현 비용을 왜 받아들이는지를 적습니다.
