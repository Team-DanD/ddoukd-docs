# 결정 기록

날짜 붙은 팀 결정. 뒤집을 때는 삭제하지 말고 아래에 새 결정을 추가한다.

## 2026-07-27 — 첫 타겟·수익 모델

- 첫 타겟: 필라테스/PT 1인샵 (근거: [interviews/01-maymi-pilates.md](interviews/01-maymi-pilates.md))
- 수익 모델: 업체 대상 SaaS 월정액 (가격 가설은 [strategy.md](strategy.md))

## 2026-08-02 — 기술 스택 확정

| 영역 | 선택 | 담당 |
|------|------|------|
| 인프라 | AWS Lightsail (고정 요금 VPS) | 민수 |
| 백엔드 | Kotlin + Spring Boot | 서현 |
| 프론트 | React Native — **Expo 기반, 웹 타깃 병행** (react-native-web) | 민수 |
| DB | Postgres (Lightsail 인스턴스 내 컨테이너 or Lightsail Managed DB) | 민수(운영) / 서현(스키마) |
| LLM | gpt-4o-mini / claude-haiku 직접 API 호출 (tool calling) | 서현 |
| 디자인 | Figma | 민수 |

### 학습 비용 메모

Kotlin/Spring은 서현이 이번 기회에 익히려는 목적 포함. 검증 속도보다 학습을 일부 우선하는
선택임을 팀이 인지하고 감. 참고로 회원권 정책 조합(유형·기간·홀딩·패널티)을 모델링하기엔
Kotlin의 sealed class / data class가 잘 맞는 편.

## 2026-08-02 — 배포 전략: 웹 먼저, 앱은 그다음

Expo + react-native-web으로 **한 코드베이스에서 웹 빌드와 앱 빌드를 동시에** 낸다.

- 파일럿 단계: 웹 빌드 배포 → 사장님에게 URL 전달 (스토어 심사·설치 없이 즉시 사용, 수정도 즉시 반영)
- 검증 후: 같은 코드로 앱 빌드 → 스토어 등록. **EAS Update**로 JS 번들 OTA 갱신
- 관리자 화면은 로그인 뒤에 있으니 SEO 무관 → 웹 타깃의 단점이 거의 안 걸림

주의: 네이티브 전용 라이브러리는 웹에서 안 돌아감. 카메라(사진 업로드)처럼 갈리는 기능은
웹 폴백(file input)을 함께 두거나, 웹 검증 단계에선 빼고 감.

## 2026-08-02 — 네이밍 보류

문서·개발은 똑디로 진행, 런칭 전 재검토. 상세: [naming.md](naming.md)

## 2026-08-09 — 역할 확정

| 사람 | 담당 |
|------|------|
| 서현 | 기획 · 영업 · 백엔드 |
| 민수 | 재정 · 디자인 · 인프라 · 프론트(앱) |

## 협업 툴

Claude 계정 공유는 약관 위반 → 각자 Pro 또는 Team 플랜(최소 좌석 요건 확인 필요).
