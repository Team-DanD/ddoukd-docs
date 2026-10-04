# DDoukD API 명세 (프론트엔드 연동용)

`ddoukd-web` 화면을 서버 데이터로 구동하기 위해 필요한 백엔드 API를 정의합니다.
현재 프론트는 `src/app/App.tsx` 내부 상수와 `useState`로만 동작하는 프로토타입이며,
이 문서의 엔드포인트로 그 자리를 대체하는 것이 목표입니다.

- **Base URL** — `https://api.ddoukd.com/v1` (로컬: `http://localhost:8080/v1`)
- **인증** — `Authorization: Bearer <access_token>`
- **Content-Type** — `application/json; charset=utf-8`
- **버저닝** — URL 경로 (`/v1`). Breaking change는 `/v2`로 분리하며 기존 버전은 최소 6개월 유지

---

## 목차

1. [공통 규약](#1-공통-규약)
2. [화면 ↔ API 매핑](#2-화면--api-매핑)
3. [도메인 모델](#3-도메인-모델)
4. [엔드포인트](#4-엔드포인트)
5. [예약 동시성 제어](#5-예약-동시성-제어)
6. [에러 카탈로그](#6-에러-카탈로그)
7. [연동 시 프론트 변경점](#7-연동-시-프론트-변경점)

---

## 1. 공통 규약

### 1.1 날짜와 시각 — 타임존 규칙

이 서비스에서 가장 사고가 나기 쉬운 지점입니다. 두 종류를 명확히 구분합니다.

| 종류 | 형식 | 예시 | 설명 |
|------|------|------|------|
| **영업일(local date)** | `YYYY-MM-DD` | `2026-08-16` | 스케줄이 속한 날짜. **KST(Asia/Seoul) 기준**이며 타임존 오프셋을 붙이지 않는다 |
| **시각(instant)** | RFC 3339 | `2026-08-16T08:30:00+09:00` | 실제 시점. 항상 오프셋을 포함한다 |
| **수업 시작 시간** | `HH:mm` | `08:30` | 영업일과 조합해 해석하는 벽시계 시간 |

**규칙**

- 서비스 기준 타임존은 **`Asia/Seoul` 고정**이다. 클라이언트 로컬 타임존에 의존하지 않는다.
- `date` 쿼리 파라미터는 항상 KST 영업일이다. 서버는 이를 UTC로 재해석해서는 안 된다.
- 프론트는 `Date.prototype.toISOString()`으로 영업일을 만들지 않는다.
  UTC 변환 때문에 KST 오전 9시 이전 날짜가 하루 밀린다. 로컬 getter로 직접 조립한다.

  ```ts
  // ❌ KST 08:59 → 전날 날짜가 나온다
  const bad = d.toISOString().split("T")[0];

  // ✅
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const good = `${y}-${m}-${day}`;
  ```

### 1.2 페이지네이션

목록 응답은 커서 기반을 사용합니다.

**요청** `?limit=20&cursor=eyJpZCI6...`

**응답**

```json
{
  "items": [],
  "page": {
    "nextCursor": "eyJpZCI6IjEyMyJ9",
    "hasNext": true
  }
}
```

`limit` 기본값 `20`, 최대 `100`.

### 1.3 멱등성

예약 생성처럼 부수효과가 있는 `POST`는 **`Idempotency-Key` 헤더를 필수**로 요구합니다.
네트워크 재시도로 인한 중복 예약을 막습니다.

```http
POST /v1/bookings
Idempotency-Key: 0f8b7c1e-3a4d-4f2b-9c1a-8e5d2f7a6b30
```

- 키는 클라이언트가 생성한 UUID v4이며 **24시간** 보관합니다.
- 같은 키로 재요청하면 최초 응답을 그대로 반환합니다 (상태 코드 포함).
- 같은 키에 다른 페이로드가 오면 `409 idempotency-key-reuse`.

### 1.4 캐싱과 낙관적 동시성

- 조회 응답은 `ETag`를 내려주며, 클라이언트는 `If-None-Match`로 `304`를 받을 수 있습니다.
- 좌석 수처럼 자주 바뀌는 리소스는 `Cache-Control: no-cache`를 사용합니다.

### 1.5 Rate Limit

| 대상 | 한도 |
|------|------|
| 조회 API | 600 req / min / 사용자 |
| 예약 생성·취소 | 30 req / min / 사용자 |

초과 시 `429`와 함께 `Retry-After`(초) 헤더를 반환합니다.

---

## 2. 화면 ↔ API 매핑

| 화면 요소 | 필요한 API |
|-----------|-----------|
| 헤더 아바타 · 확정 예약 카운트 | `GET /me` |
| 주간 날짜 스트립의 예약 점(dot) | `GET /schedule/summary` |
| 스케줄 탭 클래스 목록 (날짜별 · 잔여 좌석 포함) | `GET /classes` |
| 종목 필터 칩 (ALL / YOGA / HIIT …) | `GET /class-types` |
| 클래스 상세 패널 | `GET /classes/{classId}` |
| 예약 버튼 (예약 / 대기 신청) | `POST /bookings` |
| 취소 버튼 | `DELETE /bookings/{bookingId}` |
| MY 예약 탭 목록 + 확정/대기/취소 카운터 | `GET /bookings` |
| 강사진 탭 카드 | `GET /instructors` |

---

## 3. 도메인 모델

### 3.1 ClassType

```json
{ "code": "yoga", "label": "요가", "displayLabel": "YOGA" }
```

`code`: `yoga` · `hiit` · `cycling` · `pilates` · `boxing` · `crossfit`
(프론트의 `all` 필터는 UI 전용이며 서버는 파라미터 생략으로 처리)

### 3.2 FitnessClass

특정 **영업일에 열리는 수업 1회분(session)** 을 표현합니다.
프론트 프로토타입은 "매일 동일한 클래스 8개"를 가정했지만, 실제로는 날짜마다 편성이 달라집니다.

```json
{
  "id": "cls_01HQ8XA",
  "sessionId": "ses_01HQ8XB",
  "date": "2026-08-16",
  "name": "HIIT 서킷 트레이닝",
  "type": "hiit",
  "startTime": "08:30",
  "startsAt": "2026-08-16T08:30:00+09:00",
  "durationMinutes": 45,
  "intensity": "high",
  "totalSpots": 12,
  "spotsLeft": 2,
  "waitlistCount": 3,
  "accentColor": "#FFE500",
  "description": "최대 심박수를 끌어올리는 고강도 인터벌 트레이닝.",
  "instructor": {
    "id": "inst_02",
    "name": "박민준",
    "avatarUrl": "https://cdn.ddoukd.com/instructors/inst_02_80.webp",
    "rating": 4.8
  },
  "heroImageUrl": "https://cdn.ddoukd.com/classes/hiit_800x450.webp",
  "myBooking": {
    "id": "bkg_01HQ8XC",
    "status": "confirmed"
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 세션 식별자. 예약 생성 시 사용 |
| `date` | string | KST 영업일 |
| `intensity` | enum | `low` · `medium` · `high` (프론트에서 저/중/고강도로 표시) |
| `totalSpots` | int | 정원 |
| `spotsLeft` | int | **서버가 계산한 실제 잔여 좌석.** 0이면 대기 신청만 가능 |
| `waitlistCount` | int | 현재 대기 인원 |
| `myBooking` | object \| null | 요청자의 예약. **없으면 `null`** |

> **중요** `spotsLeft`는 반드시 서버가 계산해 내려줍니다.
> 프론트가 전체 예약 목록으로 좌석을 역산하면 다른 사용자의 예약을 반영하지 못합니다.

### 3.3 Booking

```json
{
  "id": "bkg_01HQ8XC",
  "classId": "cls_01HQ8XA",
  "date": "2026-08-16",
  "className": "HIIT 서킷 트레이닝",
  "startTime": "08:30",
  "startsAt": "2026-08-16T08:30:00+09:00",
  "instructorName": "박민준",
  "status": "confirmed",
  "waitlistPosition": null,
  "createdAt": "2026-08-15T21:04:11+09:00",
  "cancelledAt": null,
  "cancellableUntil": "2026-08-16T06:30:00+09:00"
}
```

**`status` 상태 전이**

```
            POST /bookings (좌석 있음)
   (없음) ─────────────────────────────► confirmed
      │                                     │
      │ POST /bookings (좌석 0)             │ DELETE
      ▼                                     ▼
   waitlist ──── 좌석 발생 시 자동 승격 ──► confirmed
      │                                     │
      │ DELETE                              │
      ▼                                     ▼
                    cancelled
```

| 상태 | 의미 | 좌석 점유 |
|------|------|-----------|
| `confirmed` | 예약 확정 | **점유함** |
| `waitlist` | 대기 등록 | 점유하지 않음 |
| `cancelled` | 취소됨 | 점유하지 않음 |

- `waitlistPosition`은 `status`가 `waitlist`일 때만 1부터 시작하는 정수, 그 외에는 `null`.
- `cancellableUntil` 이후 취소는 `422 cancellation-window-closed`.
- **불변식** — 동일 `(userId, classId)` 조합에 활성(`confirmed`/`waitlist`) 예약은 최대 1건.

### 3.4 Instructor

```json
{
  "id": "inst_01",
  "name": "김지수",
  "specialty": "요가 & 필라테스",
  "experienceYears": 8,
  "rating": 4.9,
  "totalClasses": 342,
  "bio": "전문 요가 강사로 아쉬탕가, 빈야사를 전문으로 합니다. RYT 500 보유.",
  "tags": ["요가", "필라테스", "명상"],
  "imageUrl": "https://cdn.ddoukd.com/instructors/inst_01_400.webp",
  "avatarUrl": "https://cdn.ddoukd.com/instructors/inst_01_80.webp"
}
```

---

## 4. 엔드포인트

### 4.1 `GET /me`

로그인 사용자 요약. 헤더의 아바타와 확정 예약 카운트에 사용합니다.

**응답 `200`**

```json
{
  "id": "usr_01HQ8X9",
  "name": "박서준",
  "initial": "박",
  "avatarUrl": null,
  "membership": { "plan": "premium", "expiresAt": "2026-12-31" },
  "stats": { "confirmedCount": 3, "waitlistCount": 1 }
}
```

`stats.confirmedCount`는 **오늘 이후의 확정 예약 수**입니다 (지난 예약 제외).

---

### 4.2 `GET /class-types`

필터 칩 목록. 정적에 가까우므로 `Cache-Control: public, max-age=3600`.

**응답 `200`**

```json
{
  "items": [
    { "code": "yoga",     "label": "요가",     "displayLabel": "YOGA" },
    { "code": "hiit",     "label": "HIIT",     "displayLabel": "HIIT" },
    { "code": "cycling",  "label": "스피닝",   "displayLabel": "CYCLE" },
    { "code": "pilates",  "label": "필라테스", "displayLabel": "PILATES" },
    { "code": "boxing",   "label": "복싱",     "displayLabel": "BOXING" },
    { "code": "crossfit", "label": "크로스핏", "displayLabel": "CROSSFIT" }
  ]
}
```

---

### 4.3 `GET /classes`

특정 영업일의 클래스 목록. **스케줄 탭의 핵심 API**입니다.

**쿼리 파라미터**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `date` | `YYYY-MM-DD` | ✅ | KST 영업일 |
| `type` | string | | 종목 코드. 생략 시 전체 |
| `instructorId` | string | | 강사 필터 |

**응답 `200`**

```json
{
  "date": "2026-08-16",
  "items": [ /* FitnessClass[] — startTime 오름차순 */ ]
}
```

- 정렬은 **`startTime` 오름차순 고정**입니다.
- 해당 날짜에 편성이 없으면 `items`는 빈 배열(`200`)입니다. `404`가 아닙니다.
- 응답에는 요청자 기준 `myBooking`이 포함되므로 예약 여부를 별도 조회할 필요가 없습니다.

---

### 4.4 `GET /classes/{classId}`

상세 패널용. 목록보다 상세한 필드(`heroImageUrl`, 전체 `description`, 강사 상세)를 포함합니다.

**응답 `200`** — `FitnessClass` (강사 정보 확장판)
**에러** — `404 class-not-found`

---

### 4.5 `GET /schedule/summary`

주간 날짜 스트립의 **점(dot) 표시**용 경량 API입니다.
날짜마다 `GET /classes`를 7번 호출하지 않기 위해 존재합니다.

**쿼리 파라미터**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `from` | `YYYY-MM-DD` | ✅ | 시작 영업일(포함) |
| `to` | `YYYY-MM-DD` | ✅ | 종료 영업일(포함). `from`으로부터 최대 31일 |

**응답 `200`**

```json
{
  "items": [
    { "date": "2026-08-15", "classCount": 8, "myBookingCount": 1, "hasWaitlist": false },
    { "date": "2026-08-16", "classCount": 8, "myBookingCount": 2, "hasWaitlist": true },
    { "date": "2026-08-17", "classCount": 6, "myBookingCount": 0, "hasWaitlist": false }
  ]
}
```

---

### 4.6 `GET /bookings`

내 예약 목록. MY 예약 탭에 사용합니다.

**쿼리 파라미터**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `from` | `YYYY-MM-DD` | | 시작 영업일 |
| `to` | `YYYY-MM-DD` | | 종료 영업일 |
| `status` | string | | `confirmed` · `waitlist` · `cancelled` (콤마로 다중 지정) |
| `limit` / `cursor` | | | 페이지네이션 |

**응답 `200`**

```json
{
  "items": [ /* Booking[] — date, startTime 오름차순 */ ],
  "summary": { "confirmed": 3, "waitlist": 1, "cancelled": 2 },
  "page": { "nextCursor": null, "hasNext": false }
}
```

> `summary`는 **필터와 무관하게 사용자의 전체 예약 기준**으로 집계합니다.
> 상단 카운터(확정/대기/취소)가 필터 때문에 값이 흔들리면 안 되기 때문입니다.

---

### 4.7 `POST /bookings`

예약을 생성합니다. **좌석 유무에 따라 확정 또는 대기로 자동 분기**합니다.

**요청**

```http
POST /v1/bookings
Idempotency-Key: 0f8b7c1e-3a4d-4f2b-9c1a-8e5d2f7a6b30
```

```json
{
  "classId": "cls_01HQ8XA",
  "allowWaitlist": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `classId` | string | ✅ | 세션 식별자. 날짜가 이미 포함되어 있으므로 `date`는 보내지 않는다 |
| `allowWaitlist` | boolean | | 기본 `true`. `false`면 좌석이 없을 때 `409`로 실패 |

**응답 `201`**

```json
{
  "booking": { /* Booking */ },
  "class": { "id": "cls_01HQ8XA", "spotsLeft": 1, "waitlistCount": 3 }
}
```

응답에 갱신된 `class.spotsLeft`를 포함하므로 프론트는 **재조회 없이 좌석 수를 갱신**할 수 있습니다.

**주요 에러**

| 상태 | `type` | 상황 |
|------|--------|------|
| `409` | `class-full` | 좌석 없음 + `allowWaitlist: false` |
| `409` | `already-booked` | 해당 클래스에 활성 예약이 이미 존재 |
| `409` | `schedule-conflict` | 같은 시간대에 다른 확정 예약 존재 |
| `422` | `booking-window-closed` | 수업 시작 시각이 지났거나 예약 마감 |
| `422` | `membership-expired` | 멤버십 만료 |

---

### 4.8 `DELETE /bookings/{bookingId}`

예약을 취소합니다. `confirmed`와 `waitlist` 모두 취소 가능합니다.

**응답 `200`**

```json
{
  "booking": { "id": "bkg_01HQ8XC", "status": "cancelled", "cancelledAt": "2026-08-16T05:12:44+09:00" },
  "class": { "id": "cls_01HQ8XA", "spotsLeft": 2, "waitlistCount": 2 }
}
```

- `confirmed` 취소 시 서버가 대기열 1순위를 **자동 승격**합니다 (승격자에게 알림 발송).
- 이미 `cancelled`인 예약을 다시 취소해도 `200`을 반환합니다 (멱등).
- 취소 후 같은 클래스에 재예약하면 **새 `bookingId`가 발급**됩니다. 기존 레코드를 되살리지 않습니다.

**주요 에러**

| 상태 | `type` | 상황 |
|------|--------|------|
| `403` | `not-booking-owner` | 타인의 예약 |
| `404` | `booking-not-found` | 존재하지 않음 |
| `422` | `cancellation-window-closed` | 취소 마감 시각 경과 |

---

### 4.9 `GET /instructors`

**쿼리 파라미터** — `limit` / `cursor`

**응답 `200`**

```json
{
  "items": [ /* Instructor[] */ ],
  "page": { "nextCursor": null, "hasNext": false }
}
```

### 4.10 `GET /instructors/{instructorId}`

강사 상세와 담당 클래스 목록을 함께 반환합니다.

```json
{
  "instructor": { /* Instructor */ },
  "upcomingClasses": [ /* FitnessClass[] — 향후 7일 */ ]
}
```

---

## 5. 예약 동시성 제어

정원이 있는 예약 시스템의 핵심입니다. **애플리케이션 레벨 검사만으로는 오버부킹을 막을 수 없습니다.**

### 5.1 요구사항

1. 동시 요청이 몰려도 `confirmed` 예약 수가 `totalSpots`를 절대 초과하지 않는다.
2. 같은 사용자가 같은 클래스에 활성 예약을 2건 이상 만들 수 없다.
3. 대기열 순번은 신청 순서를 보장한다.

### 5.2 권장 구현

**(a) DB 제약으로 최종 방어선 구축**

```sql
-- 활성 예약 1건만 허용하는 부분 유니크 인덱스
CREATE UNIQUE INDEX uq_active_booking
  ON bookings (user_id, class_id)
  WHERE status IN ('confirmed', 'waitlist');

-- 좌석 카운터에 음수 방지 제약
ALTER TABLE class_sessions
  ADD CONSTRAINT chk_spots_left CHECK (spots_left >= 0);
```

**(b) 좌석 점유는 원자적 UPDATE로**

```sql
-- 조건부 감소: 영향 행 수가 0이면 만석
UPDATE class_sessions
   SET spots_left = spots_left - 1
 WHERE id = :classId
   AND spots_left > 0;
```

`SELECT ... FOR UPDATE` 후 검사하는 방식도 가능하지만, 위 조건부 `UPDATE`가 잠금 구간이 짧아 처리량이 좋습니다.
영향 행이 0이면 `allowWaitlist`에 따라 대기 등록 또는 `409 class-full`로 분기합니다.

**(c) 트랜잭션 경계**

좌석 차감 · 예약 레코드 생성 · 멱등성 키 저장은 **하나의 트랜잭션**으로 묶습니다.
알림 발송 같은 외부 호출은 트랜잭션 밖에서 아웃박스 패턴으로 처리합니다.

### 5.3 대기열 승격

`confirmed` 취소로 좌석이 발생하면 대기열 1순위를 승격합니다.
승격 역시 위 조건부 `UPDATE`와 동일 트랜잭션에서 수행해 좌석이 이중 배정되지 않게 합니다.

---

## 6. 에러 카탈로그

모든 에러는 **RFC 9457 Problem Details** 형식을 따릅니다.
`Content-Type: application/problem+json`

```json
{
  "type": "https://api.ddoukd.com/problems/class-full",
  "title": "정원이 마감되었습니다",
  "status": 409,
  "detail": "‘HIIT 서킷 트레이닝’ 클래스의 좌석이 모두 찼습니다. 대기 신청은 가능합니다.",
  "instance": "/v1/bookings",
  "traceId": "01HQ8XA3F7K2M9",
  "errors": []
}
```

필드 검증 실패 시 `errors` 배열을 채웁니다.

```json
{
  "type": "https://api.ddoukd.com/problems/validation-failed",
  "title": "요청 값이 올바르지 않습니다",
  "status": 400,
  "errors": [
    { "field": "date", "code": "invalid-format", "message": "YYYY-MM-DD 형식이어야 합니다" }
  ]
}
```

### 상태 코드 사용 기준

| 코드 | 사용처 |
|------|--------|
| `200` | 조회·수정·취소 성공 |
| `201` | 예약 생성 성공 |
| `304` | `If-None-Match` 일치 |
| `400` | 요청 형식/검증 오류 |
| `401` | 토큰 없음·만료 |
| `403` | 권한 없음 (타인 리소스) |
| `404` | 리소스 없음 |
| `409` | 상태 충돌 (만석·중복 예약·시간 충돌) |
| `422` | 형식은 맞으나 비즈니스 규칙 위반 (마감·멤버십) |
| `429` | Rate limit 초과 |
| `500` | 서버 오류. `detail`에 내부 정보를 노출하지 않는다 |

> **`409` vs `422` 구분** — 재시도하면 성공할 수 있으면 `409`(만석은 취소가 나면 풀림),
> 재시도해도 동일하게 실패하면 `422`(예약 마감 시각 경과).

### 에러 `type` 전체 목록

| `type` | 상태 | 설명 |
|--------|------|------|
| `validation-failed` | 400 | 요청 파라미터 검증 실패 |
| `unauthorized` | 401 | 인증 필요 |
| `token-expired` | 401 | 액세스 토큰 만료 (갱신 후 재시도) |
| `not-booking-owner` | 403 | 타인의 예약 접근 |
| `class-not-found` | 404 | 클래스 없음 |
| `booking-not-found` | 404 | 예약 없음 |
| `class-full` | 409 | 정원 마감 |
| `already-booked` | 409 | 활성 예약 중복 |
| `schedule-conflict` | 409 | 동일 시간대 예약 존재 |
| `idempotency-key-reuse` | 409 | 같은 키에 다른 페이로드 |
| `booking-window-closed` | 422 | 예약 마감 |
| `cancellation-window-closed` | 422 | 취소 마감 |
| `membership-expired` | 422 | 멤버십 만료 |
| `rate-limited` | 429 | 요청 한도 초과 |
| `internal-error` | 500 | 서버 내부 오류 |

---

## 7. 연동 시 프론트 변경점

현재 `src/app/App.tsx`가 클라이언트에서 처리하는 로직 중, **서버로 이관해야 하는 것들**입니다.

| 현재 프론트 구현 | 연동 후 |
|------------------|---------|
| `CLASSES` 상수 배열 | `GET /classes?date=` 응답 |
| `INSTRUCTORS` 상수 배열 | `GET /instructors` 응답 |
| `spotsLeftOn()` — 내 예약으로 좌석 역산 | 서버의 `spotsLeft` 사용. **함수 제거** |
| `bookings` `useState` | 서버 상태 (TanStack Query 등) |
| `handleBook()` 토글 분기 | `POST /bookings` · `DELETE /bookings/{id}` 분리 호출 |
| `(classId, date)` 1건 불변식을 프론트에서 유지 | 서버 부분 유니크 인덱스가 보장 |
| 좌석 0이면 `waitlist` 판정 | 서버가 판정해 `booking.status`로 응답 |

### 주의사항

1. **`spotsLeft`를 프론트에서 계산하지 마세요.** 현재 `spotsLeftOn()`은 *내 예약*만 반영하므로
   다른 사용자의 예약이 보이지 않습니다. 연동 시 반드시 제거해야 합니다.
2. **예약 후 목록을 재조회하지 마세요.** `POST`/`DELETE` 응답의 `class.spotsLeft`로 캐시를 갱신하면
   왕복 1회를 줄일 수 있습니다.
3. **낙관적 업데이트 시 롤백을 준비하세요.** `409 class-full`은 정상적으로 발생하는 상태입니다.
   실패 시 이전 좌석 수로 되돌리고 토스트로 안내합니다.
4. **`Idempotency-Key`는 버튼 클릭 시점에 생성**하고, 재시도 시 같은 키를 사용합니다.
   재시도마다 새 키를 만들면 멱등성이 무의미해집니다.
5. **날짜는 항상 KST 영업일 문자열로** 주고받습니다. `Date` 객체를 직렬화해 보내지 않습니다.

### 권장 도입 순서

1. `src/api/client.ts` — `fetch` 래퍼 (인증 헤더, Problem Details 파싱, 재시도)
2. `src/api/types.ts` — 이 문서의 모델을 TypeScript 타입으로
3. TanStack Query 도입 후 `GET /classes` 부터 연결
4. `POST` / `DELETE` 뮤테이션 + 낙관적 업데이트
5. 로딩 / 에러 / 빈 상태 UI 보강
