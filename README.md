# 똑디 ddoukd — 문서

> 팀: **단디 DanD** (서현 + 민수) · 운동샵 예약·회원관리 SaaS
> 상태: 💡 기획 정리 완료 · 인터뷰 1/5 · **2026-08-16 스코프 확정, 구현 착수**
> "똑디"는 가칭 — 런칭 전 재검토 필요, [naming.md](naming.md) 참고

## 한 줄 정의

필라테스/PT/크로스핏 같은 수업형 운동 업체를 위한 **무한정 커스텀 가능한 예약·회원관리 SaaS**.
수업 형태(1:1/1:다), 회원권 정책(기간제/횟수차감제), 강사 스케줄을 업체가 설정만으로 조합하고,
LLM 레이어로 "박서현 회원 노쇼 횟수 보여줘" 같은 자연어 조회를 지원.

제품의 본체는 **회원권 엔진**이고 예약은 그 표면. 우선순위 충돌 시 회원권 쪽이 이긴다.

## 팀 (2026-08-09 역할 확정)

| 사람 | 담당 |
|------|------|
| 서현 | 기획 · 영업 · 백엔드 (Kotlin/Spring — 이번 기회에 학습 겸함) |
| 민수 | 재정 · 디자인 · 인프라 · 프론트(앱, RN/Expo) |

## 문서 맵

| 문서 | 내용 |
|------|------|
| [design-system/](design-system/README.md) | 현재 프론트 참고 캡처 43개, 라이트 디자인 시스템 v0.1 제안, 시각 갤러리 |
| [spec/frontend-prototype-api.md](spec/frontend-prototype-api.md) | ddoukd-web에서 이전한 회원 예약 프로토타입 API 참고 명세 — 기존 MVP 도메인 명세와 별도 |
| [decisions.md](decisions.md) | 날짜 붙은 결정 기록 — 기술 스택, 배포 전략, 역할, 협업 툴 |
| [strategy.md](strategy.md) | 타겟 기준, 버티컬 확장 로드맵, 경쟁 현황, 수익 모델, 플랫폼·카톡 전략 |
| [hypotheses.md](hypotheses.md) | 핵심 가설 3개 + 가설별 검증 경로 + 파일럿 지표 |
| [naming.md](naming.md) | 네이밍 리스크 조사, 대안 후보, 다음 네이밍 때 배운 것 |
| [mvp.md](mvp.md) | MVP 범위(기능 3개), 뺄 것, 기능 백로그 |
| [interviews/](interviews/) | 사장 인터뷰 기록 (1건씩) + 공통 질문 템플릿 |
| [spec/data-model.md](spec/data-model.md) | 데이터 모델 설계 + ERD — 슬라이스 구분 (2026-08-16 갱신) |
| [spec/lifecycle.md](spec/lifecycle.md) | 생애주기·시퀀스 도식 — 상태 전이, 트랜잭션 경계, 회원권 시간 축 |
| [spec/tenancy.md](spec/tenancy.md) | shop-key 라우팅, 계정 3종, 권한 매트릭스, 공개 캘린더 노출 범위 |
| [spec/custom-spec.md](spec/custom-spec.md) | "무한 커스텀"의 단계·범위·설계 원칙 + LLM 설정(v2) 방향 |
| [study-kotlin-spring.md](study-kotlin-spring.md) | 서현 백엔드 착수용 Kotlin/Spring 학습 가이드 — 작업 순서 = 학습 순서 |

## 이번 스코프 한 줄 (2026-08-16)

마스터가 백오피스에서 shop을 만들고 shop-key를 발급 → 사업장 user가 `/{shop-key}`로 들어와
회원·수업·예약을 관리 → 오픈한 수업은 비로그인 누구나 캘린더로 조회. **회원 user는 이번에 안 만든다.**

**회원권은 구현 슬라이스에서 분리한다 (2026-08-16)** — 설계를 계속 구체화하면서 개발은 병행.
예약이 소비하는 자원 2개 중 자리(정원) 트랙만 먼저 만든다. 회원권 트랙은 결정 필요 6건이 열려
있는 상태 — [spec/lifecycle.md](spec/lifecycle.md)

## 다음 액션

| # | 할 일 | 담당 |
|---|-------|------|
| 1 | ~~데이터 모델 "결정 필요" 5건~~ → 2026-08-16 확정. 단, 도식화하며 **6건이 새로 열림** ([spec/lifecycle.md](spec/lifecycle.md)) | ⚠️ |
| 1-1 | 그중 `booking.COMPLETED` 전이 주체 1건이 **2번을 막는다** — 먼저 결정 | 서현 |
| 2 | Kotlin + Spring Boot 프로젝트 생성, 슬라이스 1 스키마(8테이블) 마이그레이션 | 서현 |
| 3 | RN(Expo) **웹 타깃 실현 가능성 검토** — 라우팅·반응형·빌드 | 민수 |
| 4 | 백오피스 화면 (shop 생성·목록) | 민수 |
| 5 | 사업장 user 화면 (로그인 → 회원 → 세션 개설 → 예약, 폰 기준) + Figma | 민수 |
| 6 | 서버 세팅: Lightsail + Postgres + 배포 파이프라인. **백업 포함** — Managed DB(자동 스냅샷) 또는 pg_dump 크론 + 오프사이트. 남의 장부 데이터를 받는 순간 필수 | 민수 |
| 7 | 사장 인터뷰 계속 (1/5) — 메이미 남은 질문 + 계약서 샘플 + 다른 샵 2~4곳. 질문지: [interviews/template.md](interviews/template.md) | 서현 |
| 8 | 파일럿: 후보 1호 메이미 필라테스, 목표 2~3곳 · 지표는 [hypotheses.md](hypotheses.md) | 서현 |
| 9 | (런칭 결정 시점에) 네이밍 재검토 — [naming.md](naming.md). 그 전까지 똑디는 가칭 | 팀 |

3번이 먼저 끝나야 4·5번 방향이 정해진다. RN 웹이 막히면 백오피스만 별도 웹(Next.js 등)으로
빼는 선택지도 있다 — 백오피스는 우리만 쓰므로 앱으로 낼 이유가 없다.
