# 똑디 — 데이터 모델 설계 (첫 슬라이스)

> 2026-08-02 초안 · **2026-08-09 리뷰 반영** · 범위: 회원 등록 → 회원권 발급 → 예약 → 자동 차감 → 잔여 확인
> 기획: [../README.md](../README.md) · 커스텀 스펙: custom-spec.md (미이관)

## 설계 원칙 4개

1. **도메인 중립** — staff / service / membership / booking. "선생님·수업"은 `shop.labels`로 화면에서만 치환. 마사지·에스테틱 확장의 기반.
2. **원장(ledger) 방식** — 잔여 횟수의 진실은 거래 이력(`membership_transaction`). `membership.remaining_count`는 캐시.
3. **정책은 값(JSONB)** — 기능 스위치가 아니라 회원권 상품에 묶인 정책 번들. 정책 추가할 때마다 마이그레이션 하지 않기 위함.
4. **shop_id는 전 테이블에, 예외 없이** — 나중에 멀티테넌시 붙이면 전 테이블을 손봐야 하고, LLM 조회 함수가 테넌트 필터를 join 없이 걸 수 있어야 남의 샵 데이터 유출을 막는 마지막 방어선이 된다.

---

## 테이블 (9개)

### shop — 테넌트

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| name | text | |
| timezone | text | 기본 'Asia/Seoul' |
| labels | jsonb | `{"staff":"선생님","service":"수업","member":"회원"}` |
| created_at | timestamptz | |

### staff — 강사/관리사

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| name | text | |
| phone | text | |
| active | boolean | 퇴사해도 과거 예약 이력은 남아야 하므로 삭제 대신 비활성 |

### member — 회원

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| name | text | |
| phone | text | `(shop_id, phone)` unique — 중복 등록 방지 |
| memo | text | 인터뷰 1의 페인 — 폰에서 바로 쓰는 자유 메모. 단일 필드(덮어쓰기)라 이력이 안 남음 — 시간순 기록은 `member_note`로 확장 (뺀 것 참고) |
| created_at | timestamptz | |

### service — 수업/시술 종류

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| name | text | "1:1 개인레슨 50분" |
| duration_minutes | int | 뷰티 확장 시 시술별 소요시간이 여기로 |
| capacity | int | 1 = 1:1. 그룹은 2 이상 (첫 슬라이스는 1만 씀) |
| deduction_count | int | 기본 차감 횟수 (기본 1). 1:1=2차감 같은 가중치가 여기 |
| active | boolean | |

### staff_availability — 강사별 요일 반복 가용시간

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | 원칙 4 — 예외 없이 |
| staff_id | uuid FK | |
| day_of_week | int | 0~6 |
| start_time | time | shop.timezone 기준 |
| end_time | time | |

인터뷰 1: 선생님 5명 모두 가능 시간대가 다름 → 이 테이블이 예약 가능 슬롯 계산의 기준.
예외일(휴가·특근)은 다음 슬라이스에서 `staff_availability_exception`으로 추가.

### membership_plan — 회원권 상품 (= 정책 번들)

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| name | text | "10회권", "3개월 무제한" |
| type | text | COUNT / PERIOD / HYBRID |
| total_count | int null | 횟수제일 때 |
| duration_days | int null | 기간제일 때 |
| price | int | 원 단위 |
| policy | jsonb | 아래 참고 |
| active | boolean | |

```json
{
  "expiryStartsFrom": "PAYMENT",      // or FIRST_USE — 유효기간 기산점
  "holding": { "maxTimes": 2, "maxDays": 30 },
  "cancelDeadlineHours": 24,
  "lateCancelPenalty": "DEDUCT",       // NONE | DEDUCT
  "noShowPenalty": "DEDUCT",           // NONE | DEDUCT
  "deductionOverrides": { "<service_id>": 2 }
}
```

자주 필터링하는 값(type, total_count, price)만 컬럼으로 빼고 나머지는 JSONB.
Kotlin에서는 sealed class + data class로 파싱해서 타입 안전하게 다룸.

### membership — 발급된 회원권

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| member_id | uuid FK | |
| plan_id | uuid FK | |
| policy_snapshot | jsonb | **발급 시점 정책 복사본** |
| status | text | ACTIVE / EXPIRED / SUSPENDED / REFUNDED |
| total_count | int null | |
| remaining_count | int null | 캐시 (진실은 transaction). PERIOD형은 null |
| started_at | timestamptz null | FIRST_USE면 첫 이용 때 채워짐 — 기산 기준은 "결정 필요" 참고 |
| expires_at | timestamptz null | |
| price_paid | int | 첫 슬라이스 한정 — 분할·추가 결제는 `payment` 테이블로 분리 예정 (뺀 것 참고) |
| paid_at | timestamptz | |

`policy_snapshot`이 중요: 사장이 나중에 상품 정책을 바꿔도 **이미 판 회원권의 조건은 그대로여야** 한다. 계약 조건이 소급되면 분쟁이 생김.

### booking — 예약

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | |
| member_id | uuid FK | |
| staff_id | uuid FK | |
| service_id | uuid FK | |
| membership_id | uuid FK null | **어느 회원권으로 잡은 예약인지** — 차감 연결고리. null = 회원권 없는 예약(체험 수업 등), 차감 없음 |
| start_at | timestamptz | |
| end_at | timestamptz | |
| status | text | BOOKED / COMPLETED / CANCELLED / NO_SHOW |
| cancelled_at | timestamptz null | |
| created_at | timestamptz | |

- 슬롯 겹침 방지는 **앱 레벨 체크가 유일한 방어** (구간 겹침은 인덱스·유니크 제약으로 못 막음). `(staff_id, start_at)` 인덱스는 슬롯 조회 성능용. 관리자 1명이 입력하는 1인샵이라 동시 입력 위험이 낮아 앱 체크로 충분 — 멀티 관리자 단계에서 Postgres EXCLUDE 제약 재검토.
- `status = NO_SHOW`가 곧 LLM 조회 "노쇼 횟수"의 원천.

### membership_transaction — 차감/복구 원장

| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| shop_id | uuid FK | 원칙 4 — LLM 조회가 가장 많이 때리는 테이블. 테넌트 필터를 join 없이 |
| membership_id | uuid FK | |
| booking_id | uuid FK null | |
| type | text | GRANT / DEDUCT / RESTORE / ADJUST |
| amount | int | +/- (GRANT +10, DEDUCT -1) |
| reason | text | "예약 차감", "마감 전 취소 복구", "사장 수동 조정" |
| created_at | timestamptz | |

**이 테이블이 이 제품의 심장이다.** 인터뷰 1의 "차감을 수기로 한다"가 정확히 여기서 해결되고,
"박서현 회원 결제 금액·횟수 보여줘" 같은 LLM 조회도 전부 이 이력을 먹고 산다.
`remaining_count`가 틀어져도 `SUM(amount)`로 언제든 복구 가능.

---

## 차감 로직 (첫 슬라이스 · 2026-08-09 분기 보강)

plan type에 따라 갈린다:

```
예약 생성
  → membership 유효성 확인
      공통:   status = ACTIVE, 만료 전(expires_at)
      COUNT:  잔여 ≥ deduction   ← "> 0" 아님. 2차감 수업을 잔여 1로 예약하면 음수가 됨
      PERIOD: 잔여 체크·차감 없음 (무제한, remaining_count = null)
      HYBRID: 만료 + 잔여 둘 다
  → deduction = service.deduction_count (policy.deductionOverrides 있으면 그 값)
  → COUNT/HYBRID만: transaction(DEDUCT, -deduction) 기록 + remaining_count 갱신
      ← 한 트랜잭션으로. 갱신은 조건부 UPDATE 패턴 권장:
        UPDATE membership SET remaining_count = remaining_count - :d
        WHERE id = :id AND remaining_count >= :d
        (0행이면 실패 처리 — 동시 예약 레이스에서도 음수 잔여 차단)

예약 취소
  → 마감선(policy.cancelDeadlineHours, booking.start_at 기준) 이전이면 transaction(RESTORE, +deduction)
  → 이후면 policy.lateCancelPenalty에 따라: DEDUCT = 미복구 / NONE = 복구

노쇼 처리
  → status = NO_SHOW
  → policy.noShowPenalty에 따라: DEDUCT = 복구 안 함 / NONE = transaction(RESTORE, +deduction)
     (정책은 값 — 원칙 3. 하드코딩하지 않는다)
```

차감 시점을 "예약 시"로 잡음. 샵에 따라 "수업 완료 시" 차감을 원할 수 있으나 정책 값으로 나중에 추가.

## 결정 필요 (구현 전 확정)

| 항목 | 쟁점 |
|------|------|
| FIRST_USE 기산 기준 | "첫 예약 생성" vs "첫 수업 완료" 중 무엇으로 started_at/expires_at을 채우나. 사장 관점은 보통 첫 수업일이 자연스러움 |
| FIRST_USE 롤백 | 기산점이 된 첫 예약이 취소되면 started_at/expires_at을 되돌리나. 안 정하면 유효기간 분쟁으로 이어짐 |

---

## 첫 슬라이스에서 뺀 것

| 항목 | 이유 |
|------|------|
| 그룹 수업(정원 2+), 대기자 | 인터뷰 1이 1:1만. capacity 컬럼 자리만 확보 |
| **payment 테이블 (결제 분리)** | 첫 슬라이스는 회원권 1건 = 결제 1건(price_paid/paid_at)으로 고정. 분할 결제·연장 추가 결제·부분 환불이 생기는 순간, 그리고 "이번 달 결제 총액" LLM 조회를 정확히 하려면 분리 필요 |
| **member_note (시간순 메모 + 사진)** | 인터뷰 1의 실제 니즈는 "수업 끝나고 폰으로 메모+사진" = 쌓이는 기록. member.memo(단일 text)는 임시 — MVP+1 사진 업로드 붙일 때 member_note(member_id, body, photo_url, created_at)로 |
| 자원(베드/룸) | 뷰티 버티컬용. Resource 테이블은 확장 시 추가 |
| 강사 예외 스케줄(휴가) | 반복 스케줄 먼저 |
| 홀딩 실행, 환불 계산 | 정책 필드만 두고 로직은 나중 |
| 사진·계약서 업로드, 설문, 알림톡 | MVP+1 이후 ([../mvp.md](../mvp.md) 백로그) |
| LLM 조회 | 데이터 쌓인 뒤. 조회 함수는 이 모델 확정 후 작성 |

## 다음 단계

1. 이 모델 리뷰 → 확정 ("결정 필요" 2건 포함)
2. Kotlin 엔티티 / 도메인 클래스 + Flyway 마이그레이션
3. API 5개: 회원 등록 / 회원권 발급 / 예약 가능 슬롯 조회 / 예약 생성 / 예약 취소·노쇼
4. Expo 웹 화면 최소 (회원 목록 → 상세 → 예약 잡기)
