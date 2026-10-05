const fs = require('node:fs');
const path = require('node:path');
const rgb = h => h.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));
const luminance = values => values.map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const blend = (fg, bg, alpha) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));
const pairs = [
  ['본문 / 흰 면', '#111111', '#FFFFFF'], ['보조 / 흰 면', '#5A5A66', '#FFFFFF'],
  ['희미 / 흰 면', '#6E6E7A', '#FFFFFF'], ['주요 버튼', '#111111', '#FFE500'],
  ['보라 배지', '#FFFFFF', '#7C3AED'], ['중강도 배지', '#5B21B6', '#F3EEFE'],
  ['저강도 배지', '#5A5A66', '#F5F5F7'], ['희미 / 회색 면', '#6E6E7A', '#EBEBEF'],
  ['취소 배지 전체 opacity 0.5', '#6E6E7A', '#EBEBEF', 0.5],
  ['오류 흰 글자', '#FFFFFF', '#E23B2E'],
];
const results = pairs.map(([label, foreground, background, opacity = 1]) => {
  const fg = blend(rgb(foreground), rgb('#FFFFFF'), opacity), bg = blend(rgb(background), rgb('#FFFFFF'), opacity);
  const a = luminance(fg), b = luminance(bg), ratio = (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
  return { label, foreground, background, opacity, ratio: +ratio.toFixed(2), normalTextAA: ratio >= 4.5 };
});
fs.writeFileSync(path.resolve(__dirname, '../contrast.json'), JSON.stringify({ method: 'sRGB relative luminance; opacity composited over white; excludes images and browser font rendering', results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
