# Micro Password Generator

Statické klientské MVP pro https://password.lithium.klab.cz/.

## Co umí

- generování hesel přes `crypto.getRandomValues`,
- nastavitelná délka 8–64 znaků,
- toggly lowercase / uppercase / numbers / symbols,
- passphrase mód s krátkým zabudovaným lokálním wordlistem,
- copy-to-clipboard s fallbackem,
- jednoduchý strength/entropy hint,
- žádné externí CDN/dependencies,
- žádný backend, storage ani logování generovaných hodnot.

## Soubory

- `index.html` — statická stránka a UI,
- `app.js` — klientská logika generátoru,
- `styles.css` — projektové styly nad Kostra tokeny,
- `kostra.css` — drop-in Kostra CSS z `/var/www/kostra/.claude/skills/kostra-css/kostra.css`.

## Smoke test

Lokální syntaktický test JS:

```bash
node --check /var/www/password/app.js
```

Runtime smoke test generování bez DOM:

```bash
node - <<'NODE'
const fs = require('fs');
const vm = require('vm');
const { webcrypto } = require('crypto');
const context = { crypto: webcrypto, Uint32Array, Math, Number, String, Array, Boolean, Error, FormData: function FormData() {} };
context.globalThis = context;
vm.runInNewContext(fs.readFileSync('/var/www/password/app.js', 'utf8'), context);
console.log(context.PasswordMvp.generatePassword({ length: 20, lowercase: true, uppercase: true, numbers: true, symbols: true }));
console.log(context.PasswordMvp.generatePassphrase({ wordCount: 6, separator: '-', capitalize: false, appendNumber: true }));
NODE
```

Veřejná kontrola:

```bash
curl -I https://password.lithium.klab.cz/
curl -fsSL https://password.lithium.klab.cz/ | grep -E 'Micro Password Generator|app.js|kostra.css'
```
