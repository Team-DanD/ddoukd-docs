# 똑디 UI 컴포넌트 라이브러리 조사 및 비교 분석

> 상태: **조사·비교 보고서 (제안)** · 2026-10-05 작성  
> 기준 문서: [디자인 시스템 README](README.md) · [운영자 화면 컴포넌트 명세](components-operator.md) · [tokens.json](tokens.json) · [결정 기록](../decisions.md) · [MVP 범위](../mvp.md) · [README](../README.md)  
> 작성: Antigravity(웹 조사) · 검토: Claude(npm·GitHub 대조, 2026-10-05) · 결정 대상: 민수(프론트·디자인), 서현(기획·백엔드)

이 문서는 결정이 아니라 **결정을 위한 조사 자료**입니다. 추천안(B)은 [decisions.md](../decisions.md)의 "Expo + react-native-web 한 코드베이스" 결정과 다릅니다. 채택하려면 decisions.md를 먼저 고쳐야 합니다.

### 검토 기록 (2026-10-05)

버전·릴리스 날짜·라이선스·저장소 상태는 npm registry와 GitHub API로 다시 확인해 본문을 고쳤습니다. 아래는 확인하지 못해 **미확인**으로 남긴 주장입니다. 결정 근거로 쓰기 전에 공식 문서로 확인이 필요합니다.

| 주장 | 상태 |
| --- | --- |
| Shopify Restyle이 2026년 말 지원 종료 | 미확인. npm에 deprecated 표시 없음, 저장소 archive 아님(2026-09-29 push), README에 공지 없음. 마지막 npm 릴리스는 2.4.5(2025-03-19) |
| gluestack-ui v5가 웹 지원을 축소 | 미확인. 저장소 설명은 "React & React Native Components" |
| React Native Paper 메인테이너 리소스 부족 공지 | 미확인. README에서 찾지 못함 |
| react-native-reusables가 최신 Expo SDK·React 19·New Architecture에서 정상 동작 | 미확인. 스파이크로 직접 확인 |
| @expo/ui의 웹 미지원·Expo Go 불가 | 미확인. 조사 시점의 서술이며 현재 버전(57.x) 기준으로 재확인 필요 |
| 6절의 설정 코드 | 실행해 보지 않은 예시 |

조사 원문은 Expo SDK 52/53을 현재 환경처럼 썼지만, 2026-10-05 기준 최신은 **Expo SDK 57(expo 57.0.26), React Native 0.87.1**입니다. 본문을 이에 맞춰 고쳤습니다.

---

## 1. 결론 요약 (Executive Summary)

1. **추천 아키텍처 (조합안 B)**: 웹은 기존 `ddoukd-web` 자산(**shadcn/ui + Radix + Tailwind 4**)을 유지해 백오피스 PC 표와 비로그인 공개 캘린더를 담당하고, 앱은 **Expo + react-native-reusables(RNR) + NativeWind(또는 Uniwind)** 로 폰 화면을 구현하며, 두 플랫폼은 `tokens.json`을 단일 진실 공급원(SSOT)으로 삼아 스타일을 공유하는 방식을 권장합니다.
2. **차선 아키텍처 (단일안 A)**: 단일 코드베이스 유지가 절대적인 우선순위라면 **Expo + react-native-web 기반에 react-native-reusables**를 얹되, DatePicker·Table·BottomSheet는 `.web.tsx` 플랫폼 분기 파일로 웹 전용 구현을 결합하는 방식을 권장합니다.
3. **스타일을 강제하는 라이브러리는 맞지 않습니다**: 모서리 0, 검정 2px, blur 0 하드 섀도는 기성 테마를 덮어쓰는 비용이 커서, 컴포넌트 코드를 프로젝트가 소유하는 **복사형 방식(shadcn / RNR)** 이 유리합니다.
4. **React Native의 하드 섀도**: React Native 0.76(Expo SDK 52)부터 `boxShadow` 스타일 속성이 추가됐습니다(New Architecture 전용). `boxShadow: '4px 4px 0px #111111'` 같은 blur 0 그림자를 별도 라이브러리 없이 쓸 수 있을 것으로 보이지만, 실기기 렌더링은 스파이크 1로 확인해야 합니다.
5. **선결 검증 과제(Spike)**: 최신 Expo SDK(2026-10-05 기준 57) 환경에서 Android `boxShadow` 하드 섀도 실기기 렌더링, RNR 컴포넌트의 react-native-web 포커스 링 동작, DatePicker 플랫폼 분기 패턴을 결정 전에 스파이크로 확인해야 합니다(7.4절).

---

## 2. 조사 배경 및 디자인 시스템 제약조건

### 2.1 제품 및 기술 전제
* **타깃 플랫폼**: React Native(iOS, Android)와 React Web 양쪽 지원 필수.
* **3대 화면의 이질적 요구사항**:
  1. **사업장 운영자 화면**: 폰 기준(390×844px), 한 손 터치 조작, 44px 터치 타깃, 모바일 하단 시트 및 하단 내비게이션 중심.
  2. **백오피스 화면**: PC 웹 기준(1024px+), 마스터 계정 전용, 복잡한 표(Table), 페이징, 대량 정보 훑어보기.
  3. **공개 수업 캘린더**: 비로그인 모바일/PC 웹, URL(`/{shop-key}/schedule`) 직접 진입, 빠른 첫 화면 로딩(경량 번들), SEO 및 접근성.
* **기존 자산**: 웹 프로토타입 `ddoukd-web`에 Vite + React 18 + Tailwind 4 기반의 shadcn/ui 컴포넌트 46개(Radix, react-day-picker, sonner, vaul, react-hook-form, lucide-react)가 기구축되어 있음. 앱 레포(`ddoukd-app`)는 비어 있음.

### 2.2 디자인 시스템 시각 요구조건 (네오 브루탈리즘)
기성 UI 라이브러리의 기본 디자인(둥근 모서리, 부드러운 머티리얼 입체감, 블러 그림자)을 완전히 배제하고 아래 토큰을 엄격히 적용해야 합니다.

| 시각 요소 | 똑디 디자인 시스템 요구치 | 일반적인 기성 UI 라이브러리 기본값 |
| :--- | :--- | :--- |
| **모서리 (Border Radius)** | **0 (완전 직각)**. 라디오·신호용 점만 예외(`999px`) | 4px, 8px, 12px, 9999px (둥근 모서리) |
| **구조선 (Border)** | **검정 2px 실선** (`#111111`, `border-2`) | 1px 옅은 회색 (`#E5E7EB` 등) |
| **그림자 (Shadow)** | **블러 없는 3/4/5px 하드 섀도우** (우하단 오프셋, 색상 `#111111`) | blur 4~16px의 부드러운 다단계 elevation/drop-shadow |
| **색채 팔레트** | 노랑(`action.primary`, `#FFE500`), 보라(`brand.primary`, `#7C3AED`), 검정(`ink`, `#111111`), 흰색(`paper`) | 중채도 파랑, 회색 계열 기본 테마 |
| **접근성** | 보라 3px outline + 2px offset (`:focus-visible`), WAI-ARIA 및 RN 접근성 | 2px 링 또는 브라우저 기본 포커스 |

> **가정 검토 결과**: "기성 테마를 쓰는 라이브러리보다 동작만 주거나(Headless) 코드를 복사해 고치는(Copy-paste) 방식이 유리하다"는 가정은 조사 결과와 맞습니다. Material Design처럼 특정 테마에 묶인 라이브러리(React Native Paper 등)는 ripple, 둥근 모서리, elevation 그림자를 걷어내려면 내부 스타일을 많이 덮어써야 합니다. 직접 구현해 비교한 것은 아닙니다.

---

## 3. UI 컴포넌트 및 스타일 라이브러리 후보군 사실 확인

조사 대상 후보들을 (1) 웹 헤드리스 라이브러리, (2) React Native / 크로스플랫폼 컴포넌트 라이브러리, (3) 스타일링 엔진, (4) 네오 브루탈리즘 컬렉션으로 분류하여 객관적 사실을 정리했습니다.

### 3.1 웹 헤드리스(Headless) UI 라이브러리

| 후보 라이브러리 | 지원 플랫폼 | 스타일링 방식 | WAI-ARIA 접근성 | React 19 / 최신 호환 | 유지보수 상태 (최신 버전 / 확인일) | 라이선스 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **shadcn/ui** | React DOM (웹) | Tailwind CSS (v3 / v4) | 최상 (Radix 기반) | 호환 (공식 v4 지원) | 활발 (CLI `shadcn` 4.21.1, 2026-10-01) | MIT |
| **Radix Primitives** | React DOM (웹) | Unstyled (완전 자유) | 최상 (W3C 표준 준수) | 호환 (최신 패치 완료) | 활발 (`radix-ui` 1.6.7, 2026-07-24) | MIT |
| **Base UI (@base-ui/react)** | React DOM (웹) | Unstyled (CSS/Tailwind) | 최상 (MUI 팀 신규 설계) | 호환 (1.0 안정판 이후) | 활발 (1.8.0, 2026-09-04) | MIT |
| **React Aria Components** | React DOM (웹) | Unstyled / Hooks | 최상 (국제화·접근성 최강) | 호환 (Adobe 공식) | 활발 (1.21.1, 2026-09-04) | Apache-2.0 |
| **Ark UI (@ark-ui/react)** | React DOM, Vue, Svelte | Unstyled (Zag.js 상태머신) | 최상 (WAI-ARIA 준수) | 호환 (Chakra 팀) | 활발 (5.39.2, 2026-09-13) | MIT |
| **Headless UI** | React DOM (웹) | Unstyled (Tailwind Labs) | 우수 | 호환 (v2.x) | 보통 (2.2.10, 2026-04-07) | MIT |

#### 상세 팩트체크
* **shadcn/ui**
  * 사실: React Native를 직접 지원하지 않는 웹 전용 도구입니다. 2025~2026년에 걸쳐 Tailwind CSS v4(`@theme` CSS-first 아키텍처) 및 React 19를 공식 지원하도록 CLI와 컴포넌트가 전면 업데이트되었습니다.
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
| **react-native-reusables (RNR)** | Universal (iOS, Android, Web) | NativeWind / Tailwind | **가능** (Copy-paste) | **우수** (Web: Radix, Native: RN Aria) | 미확인 (스파이크 필요) | 활발 (CLI 0.7.1, 2026-03-14 · 저장소 push 2026-09-27) | MIT |
| **RN Primitives (rn-primitives)** | Universal (iOS, Android, Web) | Headless (Unstyled) | **가능** (완전 무스타일) | **우수** (Web: Radix 포워딩) | 호환 (TurboModules/Fabric 지원) | 활발 (1.5.2, 2026-07-02) | MIT |
| **gluestack-ui** | iOS, Android, Web (웹 축소 여부 미확인) | NativeWind / Tailwind | **가능** (Copy-paste) | 양호 (react-native-aria 기반) | 호환 (v5, New Arch 지원) | 활발 (`@gluestack-ui/core` 5.0.15, 2026-06-25) | MIT (npm 기준) |
| **Tamagui** | Universal (Web, iOS, Android) | Tamagui CSS/컴파일러 | 보통 (토큰 오버라이드 복잡) | 양호 (자체 접근성 구현) | 호환 (v2.7.x, React 19, New Arch) | 활발 (2.7.7, 2026-08-15 · v3 beta 진행 중) | MIT |
| **React Native Paper** | Universal (Web, iOS, Android) | MD3 테마 (고정) | **불가능** (MD3 디자인 충돌) | 보통 (모바일 위주) | 호환 (v5.15.3) | 5.15.3 (2026-05-26). 메인테이너 공지는 미확인 | MIT |
| **Expo UI (@expo/ui)** | Native만 (iOS, Android) **웹 미지원** | Swift/Kotlin 네이티브 | **불가능** (OS 네이티브 UI) | OS 네이티브 접근성 | 미확인 | 활발 (57.0.21, 2026-09-29) | MIT |

#### 상세 팩트체크
* **react-native-reusables (RNR)**
  * **아키텍처**: shadcn/ui의 설계를 React Native로 옮긴 프로젝트입니다. npm 패키지 통설치가 아닌 `@react-native-reusables/cli`를 통해 프로젝트 내부 컴포넌트 폴더로 코드를 복사합니다.
  * **접근성 매핑 메커니즘**: 내부 핵심인 `rn-primitives`는 웹 빌드 시 `@radix-ui/react-*` 컴포넌트로 직접 렌더링되어 웹 브라우저의 WAI-ARIA 명세를 충족하고, 네이티브 빌드 시에는 React Native의 `View`, `Pressable`, `accessibilityRole`, `accessibilityState`로 매핑됩니다.
  * **플랫폼 호환**: 최신 Expo SDK·React 19·New Architecture에서의 동작은 이 조사에서 직접 확인하지 못했습니다(미확인). 스파이크 2에서 확인합니다.
  * 출처: [reactnativereusables.com](https://reactnativereusables.com) (확인 날짜: 2026-10-05), [GitHub founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables)
* **RN Primitives (rn-primitives)**
  * **역할**: RNR의 코어 엔진 역할을 하는 비스타일(headless) 원시 컴포넌트 모음. 저장소는 [roninoss/rn-primitives](https://github.com/roninoss/rn-primitives).
  * **버전**: `@rn-primitives/dialog` 1.5.2, `@rn-primitives/types` 1.4.0 등 2026년 기준 지속 릴리스 중입니다.
  * 출처: [rnprimitives.com](https://rnprimitives.com) (확인 날짜: 2026-10-05)
* **gluestack-ui**
  * **변화 이력**: v1의 런타임 스타일 엔진(`gluestack-style`)을 버리고, v2부터 NativeWind(Tailwind) 기반의 copy-paste 모듈러 구조로 전면 전환되었습니다.
  * **웹 지원 변동(미확인)**: 조사 원문은 v5에서 웹 지원 문서가 빠지고 네이티브 중심으로 바뀌었다고 적었지만, 검토에서 확인하지 못했습니다. 저장소 설명은 여전히 "React & React Native Components"입니다. 후보로 올릴 때 공식 문서로 확인이 필요합니다.
  * 출처: [gluestack.io](https://gluestack.io) (확인 날짜: 2026-10-05)
* **Tamagui**
  * **버전 및 상태**: 2026-10-05 기준 안정 버전은 2.7.7(2026-08-15)이고 v3 beta가 진행 중입니다. React 19·New Architecture·Expo 지원 범위는 공식 문서 기준 서술이며 직접 확인하지 않았습니다.
  * **장단점**: 자체 최적화 컴파일러로 고성능을 내며 웹/앱 100% 유니버설을 표방하지만, (1) 복잡한 번들러/컴파일러 설정, (2) 네오브루탈리즘의 특이한 하드 섀도우를 입히기 위한 복잡한 테마 구조, (3) 커뮤니티에서 지속적으로 제기되는 특정 컴포넌트(Select 등) 안정성 및 문서 부족 문제가 단점으로 꼽힙니다.
  * 출처: [tamagui.dev](https://tamagui.dev) (확인 날짜: 2026-10-05)
* **React Native Paper**
  * **버전 및 한계**: v5.15.3 유지 중. Material Design 3 규격이 컴포넌트 내부에 강하게 결합되어 있어, 0 radius, 2px 검정 테두리, 하드 섀도우, 옐로우/퍼플 포스터 스타일 적용 시 컴포넌트 내부의 ripple 애니메이션, 고도(elevation) 처리와 정면 충돌합니다. 메인테이너 리소스 부족 공지는 검토에서 확인하지 못했습니다(미확인).
  * 출처: [reactnativepaper.com](https://callstack.github.io/react-native-paper/) (확인 날짜: 2026-10-05)
* **Expo UI (@expo/ui)**
  * **원리**: Swift(SwiftUI)와 Kotlin(Jetpack Compose)을 직접 브릿징하는 컴포넌트입니다.
  * **맞지 않는 이유**: OS 고유의 위젯 모양을 쓰는 방식이라 똑디의 포스터 스타일을 입히기 어렵습니다. 웹 미지원·Expo Go 불가는 조사 원문의 서술이며 현재 버전 기준으로는 미확인입니다.
  * 출처: [Expo 공식 문서 Expo UI](https://docs.expo.dev) (확인 날짜: 2026-10-05)

---

### 3.3 스타일링 엔진 및 토큰 라이브러리

| 라이브러리 | 성격 | Tailwind 4 호환성 | React Native New Architecture | 토큰 이식 용이성 |
| :--- | :--- | :--- | :--- | :--- |
| **NativeWind** | Tailwind for RN | v4.2.7 (Tailwind 3), **v5.0.0-rc.0 (Tailwind 4 지원)** | 호환 (Metro 기반) | CSS 변수 및 tailwind 설정 연계 |
| **Uniwind** | 고성능 Tailwind 4 for RN | **Tailwind 4 네이티브 지원** (C++ Nitro Modules) | 호환 (Unistyles 기반) | `global.css` @theme 변수 즉시 연동 |
| **Unistyles (react-native-unistyles)** | C++ 기반 고속 스타일링 | Tailwind 아님 (StyleSheet 확장) | 호환 (3.4.0, 2026-10-01) | `tokens.json` JavaScript 객체 주입 |
| **Restyle (@shopify/restyle)** | TypeScript 테마 라이브러리 | Tailwind 무관 | 미확인 | 마지막 릴리스 2.4.5(2025-03-19). 지원 종료 주장은 미확인 |

* **NativeWind 현황**: 안정 버전은 4.2.7(2026-09-14, Tailwind v3 기반)이며, Tailwind v4의 CSS-first(`@theme`) 구조를 지원하는 NativeWind v5는 현재 Release Candidate(`5.0.0-rc.0`) 단계입니다.
* **Uniwind**: Unistyles 제작진이 만든 Tailwind v4용 RN 스타일링 엔진입니다(1.12.1, 2026-10-01, [uni-stack/uniwind](https://github.com/uni-stack/uniwind)). 성능 주장은 제작사 설명이며 직접 측정하지 않았습니다. RNR 저장소 설명에 Nativewind/Uniwind가 함께 적혀 있습니다.
* **Shopify Restyle**: 조사 원문은 2026년 말 지원 종료가 확정됐다고 적었지만 검토에서 근거를 찾지 못했습니다(미확인). 다만 npm 릴리스가 2025-03 이후 없어 신규 채택 우선순위는 낮습니다.

---

### 3.4 네오 브루탈리즘 특화 shadcn 컬렉션

* **ekmas/neobrutalism-components** ([neobrutalism.dev](https://neobrutalism.dev)):
  * shadcn/ui(Radix + Tailwind CSS) 기반으로 검정 2px 테두리, radius 0, 하드 섀도우 오프셋, 원색 팔레트를 적용한 대표적 오픈소스 컬렉션입니다.
  * 똑디의 시각 언어(검정 2px 테두리, 하드 섀도, 원색 대비)와 방향이 같은 참고 자료입니다(GitHub 별 5,580, MIT, 2026-09-19 push). 우리 토큰과 수치가 같은지는 비교하지 않았습니다.
* **boldkit** ([GitHub ANIBIT14/boldkit](https://github.com/ANIBIT14/boldkit)):
  * React/Vue용 네오브루탈리즘 shadcn 확장 라이브러리입니다. 규모가 작습니다(GitHub 별 122, 2026-09-20 push).

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
| 7 | **DatePicker** (수업 날짜) | 제공 (`react-day-picker`) | **미제공** | **미제공** | **미제공** | 모바일: `@react-native-community/datetimepicker`<br>웹: `react-day-picker` (플랫폼 분기 필수) |
| 8 | **TimePicker** (수업 시각) | 제공 (조합형) | **미제공** | **미제공** | **미제공** | 모바일: 네이티브 타임피커 / 웹: Select 목록 |
| 9 | **Form 검증** (라벨·오류요약) | 제공 (`Form` / RHF) | 제공 (`react-hook-form`) | 제공 (`FormControl`) | 제공 (`Form`) | `react-hook-form` + `zod` 결합 |
| 10 | **Table** (PC 백오피스 목록) | 제공 (`Table`) | **부분 제공** (rn-primitives Table) | **미제공** | **미제공** | 웹: `@tanstack/react-table` + Table 태그<br>모바일: 가로 스크롤 표 배제, List로 전환 |
| 11 | **List** (모바일 회원/예약 목록) | 제공 (`Card` 등 조합) | 제공 (`Card`, `Separator`) | 제공 (`Card` 등) | 제공 (`Card`, `YStack`) | RN `FlatList` / `FlashList` 기반 행 렌더링 |
| 12 | **Tabs** (패널 전환) | 제공 (`Tabs`) | 제공 (`Tabs`) | 제공 (`Tabs`) | 제공 (`Tabs`) | RNR Tabs |
| 13 | **Modal / 확인창** (휴강·노쇼) | 제공 (`AlertDialog`) | 제공 (`AlertDialog`, `Dialog`) | 제공 (`AlertDialog`) | 제공 (`AlertDialog`, `Dialog`) | RNR AlertDialog |
| 14 | **하단 시트** (모바일 상세/선택) | 제공 (`vaul`) | **제한적** (Dialog 시트 모드) | 제공 (`Actionsheet`) | 제공 (`Sheet`) | 네이티브: `@gorhom/bottom-sheet`<br>웹: `vaul` (Drawer) |
| 15 | **Toast** (짧은 알림 피드백) | 제공 (`sonner`) | **별도 연동** (`sonner-native`) | 제공 (`Toast`) | 제공 (`Toast`) | 웹: `sonner` / 앱: `sonner-native` |
| 16 | **EmptyState** (빈 화면) | 패턴 조합 | 패턴 조합 | 패턴 조합 | 패턴 조합 | 독자 레이아웃 컴포넌트 제작 |
| 17 | **Pagination** (페이지 이동) | 제공 (`Pagination`) | 패턴 조합 (버튼 결합) | 패턴 조합 | 패턴 조합 | Button + Text 조합형 독자 컴포넌트 |
| 18 | **AppShell** (헤더·사이드바·내비) | 레이아웃 조합 | 레이아웃 조합 | 레이아웃 조합 | 레이아웃 조합 | 모바일: Expo Router Tabs / PC: 독자 Shell |

> **분석 요약**: 모든 라이브러리가 **DatePicker, TimePicker, Table, BottomSheet, Toast**에서 플랫폼 간 불일치를 겪습니다. 웹에선 완성형인 컴포넌트들이 React Native 환경에서는 전용 네이티브 라이브러리(`@gorhom/bottom-sheet`, `@react-native-community/datetimepicker`, `sonner-native`)를 별도로 결합해야만 완성됩니다.

---

## 5. 아키텍처 구조 선택지 비교 (A vs B vs C)

### 구조 비교 종합표

| 평가 항목 | A안: Expo 단일 코드베이스 (RNR 중심) | B안: 웹/앱 분리 및 토큰 공유 (조합안, 추천) | C안: 크로스플랫폼 통합 라이브러리 (Tamagui) |
| :--- | :--- | :--- | :--- |
| **코드베이스 형태** | Expo + react-native-web 단일 레포 | 모노레포 또는 2개 레포 (웹 + 앱) | Expo + Next/Vite 모노레포 (Tamagui) |
| **웹 화면 구현 방식** | react-native-web 변환 렌더링 | 순수 React DOM + Tailwind 4 (기존 자산) | Tamagui 웹 컴파일러 변환 렌더링 |
| **기존 ddoukd-web 자산 활용** | 재작성 필요 (낮음) | 동작 코드 재사용, **스타일은 토큰으로 다시 입혀야 함** (높음) | 전면 재작성 (매우 낮음) |
| **사업장 폰 화면 (운영자)** | RNR로 모바일 UI 구현 우수 | RNR로 모바일 UI 구현 우수 | Tamagui로 모바일 UI 구현 우수 |
| **백오피스 PC 표 (Table)** | **약함** (View 기반 모조 표, 접근성 한계) | **최상** (TanStack Table + Radix 순수 표) | **약함** (공식 Table 부재, CSS 그리드 조합) |
| **비로그인 공개 캘린더** | 보통 (RN-web 번들 큼, 초기 로딩 지연) | **최상** (가벼운 Vite 정적 번들, 빠른 로딩) | 보통 (초기 번들 및 CSS 추출 설정 필요) |
| **하드 섀도 / 포스터 스타일** | RN `boxShadow` + RNR 복사 수정 | 웹: CSS 하드섀도 / 앱: RN `boxShadow` | Tamagui 토큰 매핑 커스텀 난이도 높음 |
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
* **토큰 동기화**: `tokens.json`을 공유 패키지나 심볼릭 링크로 두고, 웹은 Tailwind 4 `@theme`으로, 앱은 NativeWind/Uniwind 테마로 변환하여 두 플랫폼의 형태(radius 0, 2px border, 하드 섀도, 노랑/보라)를 맞춥니다. 같은 사람이 폰 앱과 PC 웹을 오가므로 운영자 화면을 어느 쪽에 둘지는 따로 정해야 합니다.

#### C안: 크로스플랫폼 통합 라이브러리(Tamagui) 단일화
* **현실적 장벽**: `ddoukd-web`의 shadcn 컴포넌트와 Tailwind 4 설정을 Tamagui 문법으로 다시 작성해야 합니다.
* **1인 프론트 개발 리스크**: 민수 혼자서 인프라, 디자인, 프론트를 모두 도맡고 있는 상황([README](../README.md))에서, Tamagui 컴파일러 설정과 학습에 드는 시간이 부담입니다. 블로그·커뮤니티 의견에 기댄 평가이며 직접 써 보지 않았습니다.

---

## 6. tokens.json을 각 방식의 테마로 옮기는 방법

`tokens.json`의 원시 색(`primitive.color`), 의미 색(`semantic`), 간격(`primitive.space`), 하드 섀도우(`primitive.shadow`)를 각 라이브러리 설정으로 옮기는 방법입니다. **코드는 실행해 보지 않은 예시**이고, 색 일부만 옮겼습니다. 실제로는 `tokens.json`에서 생성하는 스크립트를 두는 편이 낫습니다.

### 6.1 Tailwind CSS v4 (@theme CSS-first)
Tailwind v4는 `tailwind.config.js` 대신 CSS 파일 자체에 `@theme` 블록을 선언합니다. `tokens.json`의 값을 CSS 변수로 매핑하고 유틸리티 클래스로 확장합니다.
```css
/* theme.css (ddoukd-web) */
@import "tailwindcss";

@theme {
  --color-purple: #7C3AED;
  --color-purple-deep: #5B21B6;
  --color-purple-tint: #F3EEFE;
  --color-yellow: #FFE500;
  --color-yellow-deep: #E6CE00;
  --color-ink: #111111;
  --color-paper: #FFFFFF;
  --color-surface: #F5F5F7;
  --color-surface2: #EBEBEF;
  --color-ink-soft: #5A5A66;
  --color-destructive: #E23B2E;

  /* 똑디 고유 하드 섀도우 (Blur 0) */
  --shadow-hard-row: 3px 3px 0px 0px #111111;
  --shadow-hard-action: 4px 4px 0px 0px #111111;
  --shadow-hard-emphasis: 5px 5px 0px 0px #111111;

  /* 0 Radius 강제 */
  --radius-none: 0px;
}
```

### 6.2 NativeWind v4/v5 및 Uniwind (React Native)
React Native의 `boxShadow`(0.76+, New Architecture)와 NativeWind/Uniwind를 함께 씁니다.
```javascript
// tailwind.config.js (NativeWind v4 기준) 또는 global.css (v5 / Uniwind)
module.exports = {
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#7C3AED', deep: '#5B21B6', tint: '#F3EEFE' },
        yellow: { DEFAULT: '#FFE500', deep: '#E6CE00' },
        ink: { DEFAULT: '#111111', soft: '#5A5A66' },
        paper: '#FFFFFF',
        surface: { DEFAULT: '#F5F5F7', 2: '#EBEBEF' },
        destructive: '#E23B2E',
      },
      boxShadow: {
        // RN 0.76+ New Architecture의 boxShadow. NativeWind가 그대로 넘기는지는 스파이크 1에서 확인
        'hard-row': '3px 3px 0px #111111',
        'hard-action': '4px 4px 0px #111111',
        'hard-emphasis': '5px 5px 0px #111111',
      },
      borderRadius: {
        DEFAULT: '0px',
      }
    }
  }
}
```

### 6.3 Tamagui tokens (`createTokens`, `createTamagui`)
Tamagui는 `createTokens` 함수로 토큰 트리를 선언하고 `createTamagui` 설정에 주입합니다.
```typescript
// tamagui.config.ts
import { createTokens, createTamagui } from 'tamagui'

export const tokens = createTokens({
  color: {
    purple: '#7C3AED',
    purpleDeep: '#5B21B6',
    yellow: '#FFE500',
    ink: '#111111',
    paper: '#FFFFFF',
    surface: '#F5F5F7',
    destructive: '#E23B2E',
  },
  space: { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 48: 48 },
  size: { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 48: 48 },
  radius: { 0: 0, square: 0, signal: 999 },
  zIndex: { header: 10, popover: 30, sheet: 50, toast: 60 }
})

export const config = createTamagui({
  tokens,
  themes: {
    light: {
      bg: tokens.color.paper,
      color: tokens.color.ink,
      primary: tokens.color.yellow,
      brand: tokens.color.purple,
    }
  }
})
```

### 6.4 Unistyles (v3 `StyleSheet.configure`)
조사 원문의 예시는 v2 API(`UnistylesRegistry`)였습니다. 현재 안정 버전은 3.x이므로 v3 방식으로 바꿨습니다. 공식 문서로 재확인이 필요합니다.
```typescript
// unistyles.ts
import { StyleSheet } from 'react-native-unistyles'

const ddoukdTheme = {
  colors: {
    purple: '#7C3AED',
    yellow: '#FFE500',
    ink: '#111111',
    paper: '#FFFFFF',
    surface: '#F5F5F7',
    destructive: '#E23B2E',
  },
  shadows: {
    action: { boxShadow: '4px 4px 0px #111111' },
  },
} as const

StyleSheet.configure({
  themes: { light: ddoukdTheme },
  settings: { initialTheme: 'light' },
})
```

---

## 7. 추천안, 차선안 및 검증 스파이크(Spike)

### 7.1 추천안 (1순위): B안 — 역할 분리 조합안
* **구성**:
  * **PC 백오피스 & 공개 캘린더 웹**: 기존 `ddoukd-web` (Vite + React + Tailwind 4 + shadcn/ui + Radix).
  * **사업장 운영자 모바일 앱**: 신규 `ddoukd-app` (최신 Expo SDK + react-native-reusables + NativeWind 또는 Uniwind).
  * **디자인 토큰**: `tokens.json`을 단일 원천으로 관리.
* **선정 이유**:
  1. **자산 재사용**: `ddoukd-web`에 이미 있는 shadcn 컴포넌트(약 46개)의 동작 코드를 그대로 쓰고 스타일만 토큰으로 다시 입힙니다. 현재 예약 화면은 이 컴포넌트들을 쓰지 않고 있어([README](README.md)) 재스타일 작업량은 따로 산정해야 합니다.
  2. **플랫폼 적합성**: 표·공개 캘린더는 웹에서, 기기 기능이 필요한 화면은 앱에서 구현합니다.
  3. **위험 분산**: Expo 웹 타깃 검토(README 다음 액션 3번)가 끝나지 않아도 백오피스를 시작할 수 있습니다.
* **비용**: 코드베이스가 둘이 되고, 같은 컴포넌트를 웹용·앱용으로 두 번 만들어야 합니다. 프론트 담당이 한 명이라는 점에서 가장 큰 부담입니다.

### 7.2 차선안 (2순위): A-2안 — Expo 단일 코드베이스 + 플랫폼 파일 분기안
* **구성**:
  * **프론트 단일화**: Expo + react-native-web 단일 레포.
  * **기본 UI**: react-native-reusables.
  * **플랫폼 분기**: `DatePicker.web.tsx` / `Table.web.tsx` / `BottomSheet.web.tsx`로 웹에서만 Radix/HTML 시맨틱을 렌더링.
* **선정 이유**: 팀에서 두 개의 레포지토리 운영 부담이 너무 커서 무조건 한 코드베이스여야 한다는 결정이 내려질 경우의 가장 현실적인 대안입니다.

### 7.3 추천이 틀릴 수 있는 조건 (뒤집힘 조건)
1. **관리 리소스 한계**: 민수가 두 코드베이스(웹/앱)의 의존성 관리 및 빌드 파이프라인 유지를 감당하기 어렵다고 판단하여, "다소 웹 표가 투박해지더라도 무조건 Expo 단일 프로젝트로 배포해야 한다"고 결정하는 경우 → **차선안(A-2안) 채택**.
2. **NativeWind v5 RC의 불안정성**: 최신 Expo SDK 환경에서 NativeWind v5 RC가 Metro 빌드 충돌을 일으킬 경우 → **NativeWind v4 고정** 또는 **Uniwind 엔진으로 교체**.
3. **사장님 모바일 앱 설치 거부**: 파일럿 인터뷰 결과 사장님들이 앱 설치를 꺼리고 100% 모바일 웹 브라우저 URL로만 접속하길 원하는 경우 → 네이티브 앱 개발을 전면 보류하고 웹 프로토타입 반응형 튜닝에 올인.

### 7.4 결정 전 직접 수행할 검증(스파이크) 목록

민수와 서현이 결정하기 전에 확인할 기술 검증입니다. 소요 시간은 추정하지 않았습니다. 최신 Expo SDK(2026-10-05 기준 57, RN 0.87)에서 합니다. 패키지 매니저는 `ddoukd-web`이 pnpm을 쓰므로 웹 쪽 검증은 pnpm으로 합니다. `ddoukd-app`은 아직 비어 있어 정해지지 않았습니다.

* [ ] **스파이크 1: Android·iOS `boxShadow` 하드 섀도 검증**
  * 목적: 실기기(Android / iOS)에서 `boxShadow: '4px 4px 0px #111111'`가 블러 없이 깨끗한 직각 하드 섀도우로 렌더링되는지 확인.
  * 검증 코드:
    ```tsx
    <View style={{ width: 100, height: 50, backgroundColor: '#FFE500', borderWidth: 2, borderColor: '#111111', boxShadow: '4px 4px 0px #111111' }} />
    ```
* [ ] **스파이크 2: react-native-reusables 최소 컴포넌트의 Web 포커스 링 검증**
  * 목적: RNR Button과 Input을 웹 브라우저(react-native-web)로 띄웠을 때 Tab 키 이동 시 보라 3px 포커스 링(`:focus-visible`)이 정상 노출되는지 확인.
* [ ] **스파이크 3: DatePicker 플랫폼 분기(`.web.tsx`) 동작성 검증**
  * 목적: 모바일에서는 네이티브 날짜 선택기가 뜨고, 웹에서는 `<input type="date">` 또는 `react-day-picker`가 매끄럽게 교체되는지 번들러 동작 확인.
* [ ] **스파이크 4: Noto Sans KR 및 Anton 폰트 로딩과 tabular-nums 검증**
  * 목적: Expo `expo-font` 및 웹 `@font-face`에서 숫자 폭 고정(`tabular-nums`)과 한국어 줄높이가 레이아웃을 깨뜨리지 않는지 확인.
* [ ] **스파이크 5: 운영자 화면을 어디에 둘지**
  * 목적: 사업장 운영자 화면(폰 기준)을 앱으로만 낼지, 모바일 웹으로도 낼지 정합니다. B안에서는 이 답에 따라 같은 화면을 두 번 만들지가 갈립니다. 기술 검증이 아니라 제품 결정입니다.
