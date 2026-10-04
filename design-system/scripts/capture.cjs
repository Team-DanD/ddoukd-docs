/* Capture the unchanged app. Install Playwright separately or set PLAYWRIGHT_MODULE_PATH. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const output = path.resolve(__dirname, '..');
const origin = process.env.CAPTURE_URL || 'http://127.0.0.1:5173/';
const fixedTime = '2026-10-04T03:00:00+00:00';
const captures = [];
const errors = [];
const observations = [];
let page;
const row = name => page.getByRole('button', { name: `${name} 상세 보기`, exact: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function shot(id, category, title, description, target, extra = {}) {
  await sleep(180);
  const file = `screenshots/${category}/${id}.png`;
  const locator = target || page.locator('body');
  const metrics = await locator.evaluate(el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height), fontFamily: s.fontFamily,
      fontSize: s.fontSize, lineHeight: s.lineHeight, color: s.color, backgroundColor: s.backgroundColor,
      borderWidth: s.borderWidth, borderRadius: s.borderRadius, boxShadow: s.boxShadow };
  });
  if (id === 'class-focus') {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    await page.screenshot({ path: path.join(output, file), animations: 'disabled', clip: { x: bounds.x - 8, y: bounds.y - 8, width: bounds.width + 16, height: bounds.height + 16 } });
  } else if (target) await target.screenshot({ path: path.join(output, file), animations: 'disabled' });
  else await page.screenshot({ path: path.join(output, file), animations: 'disabled', fullPage: false });
  const brokenImages = await page.locator('img').evaluateAll(imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => ({ alt: i.alt, src: i.src })));
  captures.push({ id, category, title, description, file, viewport: page.viewportSize(), metrics,
    brokenImages, ...extra });
  console.log(`Captured ${id}`);
}
async function reset(width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
  await sleep(600);
}
async function tab(name) { await page.getByRole('button', { name, exact: true }).click(); }
async function openDetail(name) { await row(name).click(); await sleep(350); }
const panel = () => page.locator('div.hidden.md\\:flex').filter({ has: page.getByRole('button', { name: '닫기', exact: true }) });

(async () => {
  for (const folder of ['pages', 'components', 'states', 'responsive']) await fs.mkdir(path.join(output, 'screenshots', folder), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const context = await browser.newContext({ locale: 'ko-KR', timezoneId: 'Asia/Seoul', deviceScaleFactor: 1 });
    await context.addInitScript(({ fixedTime }) => {
      const OriginalDate = Date;
      window.Date = class extends OriginalDate {
        constructor(...args) { super(...(args.length ? args : [fixedTime])); }
        static now() { return new OriginalDate(fixedTime).getTime(); }
      };
    }, { fixedTime });
    page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await reset();
    await shot('schedule-desktop', 'pages', '스케줄 데스크톱', '기본 뷰포트. 목록 아래 항목은 내부 스크롤로 확인합니다.');
    await shot('header', 'components', '공통 헤더', '워드마크, 포스터 타이포, 탭, 예약 수, 사용자 배지.', page.locator('header'));
    await shot('date-strip', 'components', '주간 날짜 선택', '오늘, 선택일, 예약 점, 이전·다음 주.', page.getByRole('button', { name: '이전 주' }).locator('..').locator('..').locator('..'));
    await shot('filter-bar', 'components', '종목 필터', 'ALL 선택 상태와 나머지 비선택 필터.', page.getByRole('button', { name: 'ALL', exact: true }).locator('..').locator('..'));
    await shot('class-available', 'components', '예약 가능한 클래스', '저강도 배지, 검정 강조선, 시간·강사·좌석·예약 CTA.', row('모닝 요가 플로우'));
    await shot('class-confirmed', 'components', '이미 예약한 클래스', '보라 틴트 면, 예약됨 배지, 취소 CTA.', row('파워 스피닝'));
    await shot('class-full', 'components', '정원 마감 클래스', '마감 배지와 대기 신청 CTA. 대기는 활성 행동입니다.', row('크로스핏 파워'));
    await shot('intensity-low', 'components', '저강도 배지', '회색 면과 회색 글자.', row('모닝 요가 플로우').locator('span').filter({ hasText: /^저강도$/ }));
    await shot('intensity-mid', 'components', '중강도 배지', '보라 테두리와 옅은 보라 면.', row('필라테스 코어').locator('span').filter({ hasText: /^중강도$/ }));
    await shot('intensity-high', 'components', '고강도 배지', '노랑 면과 검정 글자.', row('HIIT 서킷 트레이닝').locator('span').filter({ hasText: /^고강도$/ }));
    await reset(1440, 1600);
    await shot('schedule-desktop-complete', 'pages', '스케줄 전체 목록', '뷰포트를 높여 8개 클래스 전체를 캡처했습니다.');
    await reset();
    await openDetail('모닝 요가 플로우');
    await shot('detail-desktop', 'pages', '클래스 상세 데스크톱', '목록 55%와 상세 패널 45% 분할.');
    await shot('detail-panel', 'components', '클래스 상세 패널', '듀오톤 히어로, 통계, 설명, 강사, 정원, CTA.', panel());
    await shot('detail-hero', 'components', '상세 히어로', '16:9 사진, 보라 multiply, 밝은 그라디언트, 낙서.', panel().locator(':scope > div').first());
    await shot('detail-stats', 'components', '상세 통계 타일', '시간·잔여 좌석·강도 3열.', panel().locator('.grid.grid-cols-3'));
    await shot('detail-capacity', 'components', '상세 정원 게이지', '예약 인원 / 전체 정원과 채워진 비율.', panel().getByText('정원 현황', { exact: true }).locator('..').locator('..'));
    await shot('cta-primary', 'components', '주요 예약 버튼', '노랑 배경, 검정 2px 테두리, 4px 하드 섀도.', panel().getByRole('button', { name: '지금 예약하기 →', exact: true }));
    await shot('class-selected', 'states', '상세 선택 상태', '선택한 행의 노랑 면과 5px 그림자.', row('모닝 요가 플로우'));
    await reset();
    await tab('YOGA');
    await shot('filter-yoga', 'states', '요가 필터 선택', '요가 2개만 노출하며 종목 필터를 검정으로 표시합니다.');
    await reset();
    await row('모닝 요가 플로우').focus();
    await shot('class-focus', 'states', '클래스 키보드 포커스', '현재 구현의 보라 4px focus-visible ring.', row('모닝 요가 플로우'));
    await reset();
    await row('모닝 요가 플로우').getByRole('button', { name: '예약', exact: true }).click();
    await shot('booking-success', 'states', '예약 완료 피드백', '2초간 체크와 완료 문구, 예약됨 배지, 잔여 좌석 감소.', row('모닝 요가 플로우'));
    await reset();
    await openDetail('크로스핏 파워');
    await shot('detail-full', 'states', '정원 마감 상세', 'FULL, 가득 찬 게이지, 대기 신청하기 CTA.', panel());
    await panel().getByRole('button', { name: '대기 신청하기 →', exact: true }).click();
    await shot('waitlist-feedback', 'states', '대기 신청 직후', '실제 대기인데 현재 상세 CTA는 예약 완료라고 표시하는 문제를 기록합니다.', panel());
    await sleep(2100);
    await shot('class-waitlist', 'states', '대기 중 클래스', '검정 대기중 배지와 취소 CTA.', row('크로스핏 파워'));
    await tab('MY 예약');
    await shot('bookings-waitlist', 'states', '예약 목록 대기 상태', '확정 3 / 대기 1 / 취소 0.');
    await reset();
    await row('파워 스피닝').getByRole('button', { name: '취소', exact: true }).click();
    await tab('MY 예약');
    await shot('bookings-cancelled', 'states', '예약 목록 취소 상태', '확정 2 / 대기 0 / 취소 1. 취소 행은 opacity 0.5.', undefined, { finding: '취소 행 전체 투명도는 본문 대비도 함께 낮춥니다.' });
    await shot('booking-row-cancelled', 'components', '취소된 예약 행', '취소 배지, 회색 면, 그림자 제거.', page.getByText('파워 스피닝', { exact: true }).locator('..').locator('..'));
    await reset();
    await tab('MY 예약');
    await shot('bookings-desktop', 'pages', '내 예약 데스크톱', '포스터 제목과 상태별 통계, 날짜순 예약 목록.');
    await shot('booking-summary', 'components', '예약 상태 요약', '확정은 노랑, 대기는 보라, 취소는 회색.', page.getByText('내 예약 현황', { exact: true }).locator('..').locator('div.flex.gap-3'));
    await shot('booking-row-confirmed', 'components', '확정 예약 행', '흰 면, 검정 그림자, 노랑 확정 배지.', page.getByText('파워 스피닝', { exact: true }).locator('..').locator('..'));
    await tab('강사진');
    await shot('instructors-desktop', 'pages', '강사진 데스크톱', '2열 그리드, 포스터 타이틀, 듀오톤 강사 카드.');
    const trainerCard = page.getByRole('heading', { name: '김지수', exact: true }).locator('..').locator('..').locator('..');
    await shot('instructor-card', 'components', '강사 카드', '16:7 사진, 소개, 전문 분야, 평점, 경력, 수업 수.', trainerCard);
    await shot('instructor-tags-rating', 'components', '강사 태그와 평점', '회색 테두리 태그와 노랑 평점.', trainerCard.locator('div.flex.items-center.justify-between.mb-3'));
    await reset(1440, 1350); await tab('강사진');
    await shot('instructors-desktop-complete', 'pages', '강사진 전체 목록', '뷰포트를 높여 강사 4명 전체를 캡처했습니다.');
    await reset(390, 844);
    await shot('schedule-mobile', 'responsive', '스케줄 모바일', '390 × 844. 필터는 가로 스크롤, 목록은 세로 스크롤.');
    await shot('header-mobile', 'components', '모바일 헤더', '예약 수는 숨기고 워드마크·탭·사용자 배지를 유지합니다.', page.locator('header'));
    await openDetail('모닝 요가 플로우');
    await shot('detail-mobile', 'responsive', '상세 모바일 바텀시트', '최대 높이 88%, 어두운 스크림, 내부 스크롤.');
    await shot('bottom-sheet', 'components', '모바일 바텀시트', '현재 구현된 dialog. 히어로와 주요 내용을 캡처합니다.', page.getByRole('dialog'));
    await page.setViewportSize({ width: 390, height: 640 });
    await page.getByRole('dialog').evaluate(el => el.scrollTop = el.scrollHeight);
    await shot('detail-mobile-actions', 'responsive', '상세 모바일 하단', '390 × 640의 짧은 화면에서 내부 스크롤 후 정원·CTA·설명이 보이는 상태.');
    await page.getByRole('button', { name: '닫기', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await tab('MY 예약');
    await shot('bookings-mobile', 'responsive', '내 예약 모바일', '390 × 844. 단일 열 예약 목록.');
    await tab('강사진');
    await shot('instructors-mobile', 'responsive', '강사진 모바일', '390 × 844. 단일 열 카드.');
    await reset(768, 1024); await openDetail('모닝 요가 플로우');
    await shot('detail-tablet', 'responsive', '상세 태블릿 경계', '768px에서 데스크톱 분할이 적용되어 목록 폭이 좁아집니다.');
    await reset(360, 800);
    await shot('schedule-small-mobile', 'responsive', '좁은 모바일', '360 × 800. 헤더와 행의 사용 가능 폭을 확인합니다.');
    observations.push(await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, documentWidth: document.documentElement.scrollWidth,
      headerButtons: [...document.querySelectorAll('header button')].map(el => ({ label: el.textContent, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })) })));
    const revision = process.env.SOURCE_REPO_PATH
      ? execFileSync('git', ['-C', process.env.SOURCE_REPO_PATH, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() : null;
    const manifest = { schemaVersion: 1, capturedAt: new Date().toISOString(), sourceRevision: revision, sourceUrl: origin,
      fixture: { today: '2026-10-04', timezone: 'Asia/Seoul', note: '날짜만 고정. 앱 데이터·이미지·스타일을 수정하거나 대체하지 않았습니다. 예약 상태는 실제 UI 클릭으로 만들었습니다.' },
      errors, observations, captures };
    await fs.writeFile(path.join(output, 'screenshots', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(JSON.stringify({ count: captures.length, runtimeErrors: errors, output }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
