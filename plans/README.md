# 기획 (plans)

화면 기획·프로토타입을 작업 단위로 모으는 곳. 화면은 [pen.dev](https://pen.dev)의 `.pen` 파일로 그린다.
도메인 결정은 여기가 아니라 [../decisions.md](../decisions.md)와 [../spec/](../spec/)에 남긴다.

- [서비스·강사 관리](service-staff/README.md): 등록 주체·경로·가용시간·수업/예약 복귀. 2026-10-06 초안.

## 구조

```
plans/
  <작업>/            예: booking-calendar, membership-issue
    README.md        목적 · 화면 목록 · 근거 문서 · 정책 · 미결 사항
    <작업>.pen       화면 원본 (pen.dev)
    exports/         공유용 내보내기 이미지 (필요할 때만)
```

- 작업 하나에 디렉터리 하나. 이름은 짧은 영문 kebab-case
- 화면 번호·이름은 한 번 정하면 유지한다. README의 화면 목록과 `.pen` 안의 프레임 이름을 맞춘다
- 정책·미결 사항은 `.pen` 안 메모가 아니라 README에 쓴다 — 텍스트로 검색·리뷰할 수 있어야 한다
- 확정되지 않은 정책을 화면에서 임의로 확정하지 않는다. 미결로 적고 [../spec/](../spec/)의 결정 필요 목록과 연결한다

## .pen 파일 다루기

- `.pen`은 암호화된 파일이다. 텍스트 편집기·`cat`·`grep`으로 읽거나 고치지 않는다
- 사람은 pen.dev 앱으로, 에이전트(Claude·Codex)는 pencil MCP 도구로만 읽고 쓴다
- 한 파일을 동시에 고치는 사람·에이전트는 한 명으로 유지한다. diff가 안 보이므로 커밋 메시지에 바뀐 화면을 적는다
- 디자인 토큰·공통 컴포넌트는 [../design-system/](../design-system/README.md)을 따른다

## README 템플릿

```markdown
# <작업 이름>

- 목적:
- 근거 문서: (spec·decisions 링크)
- 상태: 초안 / 리뷰 중 / 확정

## 화면

| # | 화면 | 그룹 | 메모 |
|---|------|------|------|

## 정책

## 미결 사항
```
