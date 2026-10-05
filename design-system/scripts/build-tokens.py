#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tokens.json(원본)에서 tokens.css와 claude-design/project/tokens.json을 만든다.

    python3 design-system/scripts/build-tokens.py          # 생성
    python3 design-system/scripts/build-tokens.py --check  # 대비 검사 + 생성물이 최신인지 확인(파일을 쓰지 않음)

토큰 이름은 pen 변수, CSS 변수, Claude Design 토큰에서 모두 같다.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(io.open(os.path.join(ROOT, 'tokens.json'), encoding='utf-8'))
PRIM = T['color']['primitive']
ROLE = T['color']['role']
LISTS = [('space', 'spacing'), ('radius', 'radius'), ('border', 'border'), ('size', 'size'), ('motion', 'duration'), ('layer', 'zIndex')]


def resolve(name):
    """역할 또는 원시 색 이름을 실제 색 값으로 푼다."""
    if name in PRIM:
        return PRIM[name]['value']
    r = ROLE[name]
    return r['value'] if 'value' in r else resolve(r['ref'])


def luminance(value):
    h = value.lstrip('#')
    chan = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in chan]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a, b):
    hi, lo = sorted([luminance(resolve(a)), luminance(resolve(b))], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def css():
    out = ['/* 생성 파일. design-system/tokens.json을 고치고 scripts/build-tokens.py를 실행한다. */', ':root {']
    for name, t in PRIM.items():
        out.append('  --%s: %s;' % (name, t['value']))
    for name, t in ROLE.items():
        out.append('  --%s: %s;' % (name, t['value'] if 'value' in t else 'var(--%s)' % t['ref']))
    for key, _ in LISTS:
        for name, t in T[key].items():
            out.append('  --%s: %s;' % (name, t['value']))
    for name, stack in T['type']['family'].items():
        out.append('  --font-%s: %s;' % (name, stack))
    out.append('}')
    for name, s in T['type']['styles'].items():
        out.append('.%s { font: %d %s/%s var(--font-%s); }' % (name, s['fontWeight'], s['fontSize'], s['lineHeight'], s.get('family', 'body')))
    return '\n'.join(out) + '\n'


def claude_design():
    colors = [{'name': n, 'value': t['value'], 'usage': t['usage']} for n, t in PRIM.items()]
    colors += [{'name': n, 'value': t['value'] if 'value' in t else '{%s}' % t['ref'], 'usage': t['usage']} for n, t in ROLE.items()]
    doc = {
        'name': 'DDoukD', 'version': 2,
        'color': {'themes': [{'id': 'light', 'name': 'Light'}], 'tokens': colors},
        'type': {'fonts': [], 'families': T['type']['family'], 'groups': [{'name': 'Text', 'family': 'body', 'styles': [
            {'name': n, 'fontSize': s['fontSize'], 'lineHeight': s['lineHeight'], 'fontWeight': s['fontWeight'], 'sample': s['sample'], 'usage': s['usage']}
            for n, s in T['type']['styles'].items()]}]},
    }
    for key, family in LISTS:
        doc[family] = {'tokens': [{'name': n, 'value': t['value'], 'usage': t['usage']} for n, t in T[key].items()]}
    doc['meta'] = {'source': 'github', 'repo': 'Team-DanD/ddoukd-docs', 'ref': 'main', 'package': 'design-system',
                   'paths': {'tokens': ['design-system/tokens.json'], 'docs': ['design-system/README.md', 'design-system/claude-design/project']},
                   'synced': T['updated']}
    return json.dumps(doc, ensure_ascii=False, indent=1) + '\n'


def main():
    names = list(PRIM) + list(ROLE) + [n for key, _ in LISTS for n in T[key]]
    assert len(names) == len(set(names)), '토큰 이름 중복: %s' % sorted({n for n in names if names.count(n) > 1})
    assert all(re.match(r'^[a-z0-9][a-z0-9-]{0,63}$', n) for n in names), '토큰 이름은 소문자 kebab-case'
    failed = False
    for c in T['contrast']:
        ratio = contrast(c['foreground'], c['background'])
        ok = ratio >= c['min']
        failed = failed or not ok
        print('%s %5.2f (기준 %s) %s / %s  %s' % ('OK  ' if ok else 'FAIL', ratio, c['min'], c['foreground'], c['background'], c['use']))
    targets = {'tokens.css': css(), os.path.join('claude-design', 'project', 'tokens.json'): claude_design()}
    for rel, text in targets.items():
        path = os.path.join(ROOT, rel)
        if '--check' in sys.argv:
            current = io.open(path, encoding='utf-8').read() if os.path.exists(path) else ''
            if current != text:
                print('STALE %s (build-tokens.py를 다시 실행)' % rel)
                failed = True
        else:
            io.open(path, 'w', encoding='utf-8').write(text)
            print('wrote design-system/%s' % rel)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
