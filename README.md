# Password Generator

Statický klientský generátor hesel. Běží jako veřejná stránka na GitHub Pages: https://chemix.github.io/heslo/

Zdrojáky: https://github.com/chemix/heslo

## Co umí

- generování hesel přes `crypto.getRandomValues`,
- **Random** mód: nastavitelná délka 8–64 znaků a toggly lowercase / uppercase / numbers / symbols,
- **Memorable** mód: 3–8 slov z lokálního wordlistu spojených `-` a zakončených číslem,
- copy-to-clipboard s fallbackem na označení textu,
- hromadné generování 10 hesel do tabulky s editovatelnými usernamy a kopií jako ASCII tabulka,
- žádné externí CDN/dependencies,
- žádný backend, storage ani logování generovaných hodnot.

## Soubory

- `index.html` — statická stránka a UI,
- `app.js` — klientská logika generátoru (vše v jedné `DOMContentLoaded` closure),
- `styles.css` — projektové styly nad Kostra tokeny,
- `kostra.css` — drop-in Kostra CSS z `/var/www/kostra/.claude/skills/kostra-css/kostra.css`.

## Smoke test

Lokální syntaktický test JS:

```bash
node --check /var/www/password/app.js
```

Chování se ověřuje v prohlížeči — generátor běží celý v `DOMContentLoaded` closure a nic neexportuje, takže běh bez DOM není k dispozici.

## Nasazení

Push do `main` spustí workflow `.github/workflows/pages.yml`, které obsah repa nahraje jako artefakt a nasadí na GitHub Pages. Žádný build krok není — assety v `index.html` se odkazují relativně, takže stránka funguje i pod podcestou `/heslo/`.

Veřejná kontrola:

```bash
curl -I https://chemix.github.io/heslo/
curl -fsSL https://chemix.github.io/heslo/ | grep -E 'Password Generator|app.js|kostra.css'
```
