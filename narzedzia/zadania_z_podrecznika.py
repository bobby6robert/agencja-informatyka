# -*- coding: utf-8 -*-
"""Wyciąga ćwiczenia i zadania z podręcznika (pole `tasks` każdej lekcji w klasaN-informatyka-efekty.html)
do małego pliku tresc/klasaN/gra/zadania.js, który czyta gra i Prowadzenie lekcji.
Treść poleceń NIE jest przepisywana ręcznie – zawsze pochodzi z podręcznika. Uruchom po każdej zmianie zadań w efekty.html:
    python narzedzia/zadania_z_podrecznika.py
"""
import json, os, re, sys

KAT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class P:
    """Mały parser literałów JS: obiekty z kluczami bez cudzysłowów, napisy "…", '…' i `…`."""
    def __init__(s, t, i): s.t, s.i = t, i
    def ws(s):
        while s.t[s.i] in ' \t\r\n': s.i += 1
    def val(s):
        s.ws(); c = s.t[s.i]
        if c == '[':
            s.i += 1; w = []
            while True:
                s.ws()
                if s.t[s.i] == ']': s.i += 1; return w
                w.append(s.val()); s.ws()
                if s.t[s.i] == ',': s.i += 1
        if c == '{':
            s.i += 1; w = {}
            while True:
                s.ws()
                if s.t[s.i] == '}': s.i += 1; return w
                k = s.val() if s.t[s.i] in '"\'' else s.ident()
                s.ws(); assert s.t[s.i] == ':', s.t[s.i - 40:s.i + 40]; s.i += 1
                w[k] = s.val(); s.ws()
                if s.t[s.i] == ',': s.i += 1
        if c in '"\'`':
            s.i += 1; w = []
            while s.t[s.i] != c:
                if s.t[s.i] == chr(92):
                    n = s.t[s.i + 1]; s.i += 2
                    if n == 'u': w.append(chr(int(s.t[s.i:s.i + 4], 16))); s.i += 4
                    else: w.append({'n': '\n', 't': '\t', 'r': ''}.get(n, n))
                else: w.append(s.t[s.i]); s.i += 1
            s.i += 1; return ''.join(w)
        m = re.compile(r'-?[\d.]+|true|false|null').match(s.t, s.i); assert m, s.t[s.i - 40:s.i + 40]
        s.i = m.end(); return json.loads(m.group())
    def ident(s):
        m = re.compile(r'[\w$]+').match(s.t, s.i); s.i = m.end(); return m.group()


def klasa(n):
    zr = os.path.join(KAT, 'tresc', 'klasa%d' % n, 'klasa%d-informatyka-efekty.html' % n)
    if not os.path.exists(zr): return
    t = open(zr, encoding='utf-8').read()
    lek = [(m.start(), m.group(1)) for m in re.finditer(r'[{,]\s*"?id"?\s*:\s*"(k\d+)"\s*,\s*"?title"?\s*:', t)]
    wyn = {}
    for j, (p, k) in enumerate(lek):
        kon = lek[j + 1][0] if j + 1 < len(lek) else len(t)
        m = re.compile(r'"?tasks"?\s*:\s*\[').search(t, p, kon)
        if not m: continue
        gr = P(t, m.end() - 1).val()
        wyn[k] = [dict(h=g.get('h', ''), **({'note': g['note']} if g.get('note') else {}),
                       items=[dict(t=x['t'], **({'lvl': x['lvl']} if x.get('lvl') else {}),
                                   **{a: x[a] for a in x if a not in ('t', 'lvl')}) for x in g.get('items', [])]) for g in gr]
    if not wyn: return
    # pliki do ćwiczeń: mapa RES w podręczniku (lekcja -> nazwy plików) + ścieżki w folderze pliki-do-cwiczen
    kp = os.path.join(KAT, 'tresc', 'klasa%d' % n, 'pliki-do-cwiczen')
    sciezki = {f: os.path.relpath(os.path.join(d, f), kp).replace(os.sep, '/') for d, _, ff in os.walk(kp) for f in ff}
    pliki, brak = {}, set()
    m = re.search(r'const RES\s*=\s*', t)
    if m:
        for k, r in P(t, m.end()).val().items():
            ok = [sciezki[f] for f in r.get('files', []) if f in sciezki]
            brak |= {f for f in r.get('files', []) if f not in sciezki}
            if ok: pliki[k] = ok
    if brak: print('  brak w pliki-do-cwiczen:', ', '.join(sorted(brak)))
    wyn = {'zrodlo': os.path.basename(zr), 'lekcje': wyn, 'pliki': pliki}
    cel = os.path.join(KAT, 'tresc', 'klasa%d' % n, 'gra', 'zadania.js')
    js = ('/* PLIK GENEROWANY – nie edytuj ręcznie. Źródło: klasa%d-informatyka-efekty.html (pole tasks lekcji).\n'
          '   Odśwież: python narzedzia/zadania_z_podrecznika.py */\nwindow.ZADANIA = ' % n
          + json.dumps(wyn, ensure_ascii=False, separators=(',', ':')).replace('],"k', '],\n"k') + ';\n')
    open(cel, 'w', encoding='utf-8', newline='').write(js)
    print('klasa %d: lekcji z zadaniami %d, poleceń %d -> %s' % (n, len(wyn['lekcje']), sum(len(g['items']) for v in wyn['lekcje'].values() for g in v), os.path.relpath(cel, KAT)))
    return wyn


if __name__ == '__main__':
    for n in (1, 2, 3):
        klasa(n)
