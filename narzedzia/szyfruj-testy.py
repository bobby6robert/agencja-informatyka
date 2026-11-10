# Szyfruje kartkówki i sprawdziany do gry (ten sam format co sprawdziany.html: PBKDF2 150 000 + AES-GCM).
# Źródła (jawne) i klucze leżą w DLA-NAUCZYCIELA (poza gitem):
#   DLA-NAUCZYCIELA/testy/<id>.json   – treść testu
#   DLA-NAUCZYCIELA/klucze-testow.json – {"<id>": "<klucz>"}; te same klucze są w ranking.gs (KLUCZE_TESTOW_)
# Wynik: tresc/klasaN/gra/testy-r<rozdział>.js (window.TESTY_ZASZ). Uruchom: python narzedzia/szyfruj-testy.py
import base64, glob, json, os, re, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

KORZEN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
klucze = json.load(open(os.path.join(KORZEN, 'DLA-NAUCZYCIELA', 'klucze-testow.json'), encoding='utf-8'))
pliki = {}
for p in sorted(glob.glob(os.path.join(KORZEN, 'DLA-NAUCZYCIELA', 'testy', '*.json'))):
    tid = os.path.splitext(os.path.basename(p))[0]
    m = re.match(r'^(\d)r(\d+)-', tid)
    if not m or tid not in klucze:
        sys.exit(f'Brak klucza albo zła nazwa pliku: {tid}')
    tresc = json.dumps(json.load(open(p, encoding='utf-8')), ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    sol, iv = os.urandom(16), os.urandom(12)
    k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=sol, iterations=150000).derive(klucze[tid].encode('utf-8'))
    pliki.setdefault((m.group(1), m.group(2)), {})[tid] = base64.b64encode(sol + iv + AESGCM(k).encrypt(iv, tresc, None)).decode()
for (kl, r), testy in pliki.items():
    cel = os.path.join(KORZEN, 'tresc', f'klasa{kl}', 'gra', f'testy-r{r}.js')
    with open(cel, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'/* Kartkówki i sprawdziany – klasa {kl}, rozdział {r}. Zaszyfrowane; klucz wysyła skrypt nauczyciela po uruchomieniu testu. */\n')
        f.write('window.TESTY_ZASZ = Object.assign(window.TESTY_ZASZ || {}, ' + json.dumps(testy, indent=1) + ');\n')
    print('Zapisano', os.path.relpath(cel, KORZEN), '–', ', '.join(testy))
