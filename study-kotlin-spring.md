# Kotlin + Spring Boot 학습 가이드 (서현 · 백엔드 착수용)

> 2026-09-01 작성. 전제: TypeScript(strict) + NestJS + TypeORM은 매일 쓰는 수준,
> Spring Boot는 예전에 잠깐, Kotlin은 처음.
> 대상 작업: [spec/data-model.md](spec/data-model.md) "다음 단계"의 서버 구현 전체.

## 결론 먼저

**선행 학습은 2~3일이면 충분하다. 다 배우고 시작하지 말 것.**

- NestJS 경험이 생각보다 많이 이전된다 — Spring이 NestJS의 원형이라 DI·데코레이터(애노테이션)·
  레이어 구조·DTO 검증까지 개념 지도가 거의 1:1로 겹친다. 새로 배우는 건 "개념"이 아니라
  "문법과 이름"이다
- Kotlin은 TS 사용자에게 진입장벽이 낮다 — null safety(`?`), 타입 추론, 람다 등 이미 아는
  개념이 많다. 진짜 새로운 건 sealed class 정도인데, 이건 우리 회원권 정책 모델링의 핵심이라
  어차피 손으로 익히게 된다
- 학습 계획은 아래 "작업 순서 = 학습 순서" 표대로. 각 단계에서 막히는 것만 그때 찾아본다

## NestJS → Spring Boot 개념 매핑

아는 것에서 출발하기 위한 지도. 왼쪽을 안다면 오른쪽은 문법만 익히면 된다.

| NestJS | Spring Boot | 비고 |
|--------|-------------|------|
| `@Module` + providers | `@Configuration` + 컴포넌트 스캔 | Spring은 모듈 선언 없이 패키지 스캔이 기본 |
| `@Injectable` + 생성자 주입 | `@Service` / `@Component` + 생성자 주입 | Kotlin은 주 생성자 프로퍼티로 더 짧음 |
| `@Controller` + `@Get/@Post` | `@RestController` + `@GetMapping/@PostMapping` | |
| DTO + class-validator | DTO(data class) + Bean Validation(`@field:NotBlank` 등) | Kotlin은 `@field:` 접두 필요 — 처음에 다 헤매는 지점 |
| Guard / Interceptor | Filter / HandlerInterceptor | TenantResolver는 인터셉터(또는 필터)로 |
| ExceptionFilter | `@RestControllerAdvice` + `@ExceptionHandler` | |
| TypeORM Entity | JPA `@Entity` | 아래 "ORM 선택" 참고 |
| TypeORM migration | **Flyway** (SQL 파일 버전 관리) | 엔티티에서 자동 생성하지 않고 SQL을 직접 쓴다 |
| `.env` + ConfigService | `application.yml` + `@ConfigurationProperties` | |
| Jest | JUnit 5 + 필요시 Testcontainers(Postgres) | |

## Kotlin — 이 프로젝트에서 실제 쓰는 것만

### 필수 (착수 전 1~1.5일)

| 항목 | 우리 코드에서 쓰이는 곳 |
|------|------------------------|
| `val`/`var`, 타입 추론, null safety (`?.` `?:` `!!`) | 전부. `display_name ?: name` 폴백이 문자 그대로 `?:` 한 줄 |
| data class | 모든 DTO, 정책 값 객체 |
| **sealed class/interface + `when` 완전성 검사** | **회원권 정책 모델링의 심장.** COUNT/PERIOD/HYBRID 분기를 `when`으로 쓰면 유형 추가 시 컴파일러가 빠뜨린 분기를 잡아준다 — [decisions.md](decisions.md) 스택 선정 이유이기도 함 |
| enum class | BookingStatus, 원장 reason 코드 등 상태·코드 전부 |
| 주 생성자, named/default arguments | 엔티티·DTO 생성. 빌더 패턴이 필요 없어짐 |
| 컬렉션 API (`map/filter/sumOf/groupBy/minByOrNull`) | TS 배열 메서드와 거의 동일. `minByOrNull`은 FIRST_USE 롤백(남은 예약 중 최소 시각) 재계산에 바로 씀 |
| companion object | 팩토리 메서드, 상수 |

### 읽을 수 있으면 되는 것 (쓰다 보면 익혀짐)

- scope functions (`let` `apply` `also` `run`) — 남의 코드·예제 읽을 때 필요. 직접 쓰는 건 천천히
- extension function — Spring 예제 코드에 자주 나옴
- `lateinit`, delegated properties (`by lazy`) — 프레임워크 코드에서 마주치는 정도

### 지금 안 배워도 되는 것

코루틴(suspend) · 제네릭 변성(in/out) · DSL 빌더 · 인라인 함수 심화.
MVP 서버는 전부 동기 블로킹 코드로 충분하다.

## Spring Boot — 이 프로젝트에서 실제 쓰는 것만

### 필수

| 항목 | 우리 코드에서 쓰이는 곳 |
|------|------------------------|
| DI, 컴포넌트 스캔, 생성자 주입 | 전부 |
| `@RestController` + DTO + Bean Validation | 모든 API. 공개 캘린더 **전용 DTO 분리**([spec/tenancy.md](spec/tenancy.md) 7절) 원칙 실행 지점 |
| **`@Transactional`** + 전파·롤백 기본 | **가장 중요.** "원장 기록 + remaining_count 갱신 + booked_count 증가"가 한 트랜잭션([spec/data-model.md](spec/data-model.md) 차감 로직). 이거 하나는 대충 넘어가지 말 것 |
| 조건부 UPDATE 패턴 (`UPDATE ... WHERE remaining_count >= :d` 0행이면 실패) | 동시 예약 레이스 차단. JPA만으로 안 되고 `@Modifying` 쿼리 또는 JDBC로 — 설계 문서에 이미 SQL이 적혀 있으니 그대로 옮기면 됨 |
| Flyway | 스키마는 V1__init.sql부터 SQL로 직접. 테이블 11개 DDL을 손으로 쓰는 게 곧 모델 복습 |
| `@RestControllerAdvice` 예외 처리 | 정원 마감·잔여 부족·마감선 초과 등 도메인 에러 → HTTP 응답 변환 |
| HandlerInterceptor (TenantResolver) | shop-key → shop_id 해석을 한 곳에 — [spec/tenancy.md](spec/tenancy.md) 4절 |
| `application.yml`, 프로파일(local/prod) | |

### 프로젝트 특화 — 일반 튜토리얼에 안 나오는 것 3개

1. **JSONB ↔ Kotlin 객체**: `membership_plan.policy` / `membership.policy_snapshot`.
   Hibernate 6이면 `@JdbcTypeCode(SqlTypes.JSON)` + jackson-module-kotlin으로 컬럼을
   data class(sealed 포함)로 바로 매핑 가능. 착수 첫 주에 스파이크로 검증해둘 것 —
   여기가 막히면 원칙 3(정책은 값)이 흔들린다
2. **인증은 Spring Security 풀세트 말고 최소로**: Spring Security는 러닝커브가 가장 큰
   구간인데, MVP 요구는 "JWT 검증 + 토큰 shop_id ↔ URL shop-key 대조 + 비밀번호 해시"뿐.
   `spring-security-crypto`(BCrypt)만 쓰고 JWT 검증은 직접 만든 필터/인터셉터로 하는 선택지가
   학습량 대비 낫다. 풀 Spring Security 도입은 나중에 필요해지면 (팀 확인 후 결정)
3. **시간대**: 전 컬럼 `timestamptz` + `shop.timezone` 변환. Kotlin/Java의 `Instant` vs
   `LocalTime`/`ZonedDateTime` 구분을 초반에 한 번 정리하고 시작 — staff_availability의
   `time`(샵 타임존 기준)과 세션의 `timestamptz`가 만나는 지점이 버그 명당이다

### 지금 안 배워도 되는 것

WebFlux/리액티브 · Spring Security 심화(OAuth, 세션) · JPA 심화(2차 캐시, 복잡한 연관관계
매핑 — 우리는 FK를 uuid 컬럼으로 들고 조회는 명시 쿼리로 가는 편이 안전) · Spring Batch ·
메시징 · Gradle 커스텀 플러그인.

## ORM 선택 (결정 필요 — 학습 계획에 영향)

decisions.md에 아직 없는 결정. 선택지 2개:

| | Spring Data JPA | Spring Data JDBC (또는 JdbcTemplate) |
|---|---|---|
| 장점 | TypeORM 경험 이전, 자료 압도적으로 많음 | 단순함. SQL이 그대로 보임 — 조건부 UPDATE·원장 패턴과 궁합 좋음. 학습량 절반 |
| 단점 | 영속성 컨텍스트·지연로딩 등 "마법" 이해 비용. 처음이면 여기서 시간 잃기 쉬움 | 자료 적음. 연관 조회를 손으로 씀 |

권장: **JPA로 시작하되 연관관계 매핑을 최소로**(`@ManyToOne` 남발 대신 uuid FK 컬럼 + 명시
쿼리). 이러면 JPA의 편한 부분(CRUD, 매핑)만 쓰고 어려운 부분(그래프 로딩)을 피해간다.
차감 로직의 조건부 UPDATE는 어차피 네이티브/`@Modifying` 쿼리다. — 팀 확정 시 decisions.md로.

## 작업 순서 = 학습 순서

미리 몰아서 공부하지 않고, 각 단계 직전에 그 단계 재료만 배운다.

| 단계 | 작업 ([spec/data-model.md](spec/data-model.md) 다음 단계) | 그때 배우는 것 | 감 잡기용 예상 |
|------|------|------|------|
| 0 | Kotlin 문법 훑기 — 공식 문서 + Kotlin Koans 일부 | 위 "필수" 표 전부 | 1~1.5일 |
| 1 | 프로젝트 생성 (start.spring.io: Kotlin, Gradle-KTS, Web, Validation, JPA, Flyway, Postgres) + 로컬 Postgres(docker compose) + `/health` 하나 | Gradle 구조, application.yml, 프로파일 | 0.5일 |
| 2 | Flyway V1 마이그레이션 — 테이블 11개 DDL + 엔티티 클래스 | Flyway, JPA 기본 매핑, **JSONB 스파이크** | 1~2일 |
| 3 | TenantResolver + 인증 (platform_admin/staff 로그인, JWT, must_change_password) | 인터셉터, BCrypt, JWT 라이브러리 | 1~2일 |
| 4 | 백오피스 API (shop 생성 + 최초 OWNER + 임시 비번) | `@Transactional` 첫 실전, 예외 처리 | 1일 |
| 5 | 사업장 API — 회원·회원권 발급(GRANT 원장)·세션 개설 | 트랜잭션 심화, 검증 | 2~3일 |
| 6 | **차감 로직** — 예약 생성/취소/노쇼/세션취소 + FIRST_USE 기산·롤백 | 조건부 UPDATE, sealed class로 정책 분기 | 2~3일 |
| 7 | 공개 캘린더 API (비로그인, 전용 DTO) + 단계 3~6 테스트 보강 | 테스트 (`@SpringBootTest`, Testcontainers) | 1~2일 |

- 예상치는 학습 포함 기준. 절반은 6단계(도메인 로직)에 쓰는 게 맞고, 1~4단계에서 오래
  걸리면 프레임워크와 싸우고 있다는 신호 — 그때는 접근을 바꾼다 (예: Security 풀세트 →
  수동 필터)
- 테스트는 7에 몰지 말고 6단계 차감 로직만큼은 작성과 동시에. 설계 문서의 분기
  (잔여 ≥ deduction, 마감선, FIRST_USE 롤백)가 곧 테스트 케이스 목록이다

## 자료

- [Kotlin 공식 문서](https://kotlinlang.org/docs/home.html) — Basics + Classes 챕터면 단계 0 커버. [Kotlin Koans](https://play.kotlinlang.org/koans)로 손 풀기
- [Spring 공식 가이드](https://spring.io/guides) — "Building a RESTful Web Service", "Accessing Data with JPA" 두 개면 단계 1~2 워밍업 끝
- [Spring Boot + Kotlin 공식 튜토리얼](https://spring.io/guides/tutorials/spring-boot-kotlin) — 블로그 앱 하나를 Kotlin으로 끝까지. 반나절 투자 가치 있음
- 막히면: 에러 메시지로 검색하기 전에 공식 레퍼런스 먼저. Kotlin+Spring 조합은 블로그 글 절반이 구버전이다
