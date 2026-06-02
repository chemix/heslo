# Password Generator

Statický klientský generátor pro https://password.lithium.klab.cz/.

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

Veřejná kontrola:

```bash
curl -I https://password.lithium.klab.cz/
curl -fsSL https://password.lithium.klab.cz/ | grep -E 'Password Generator|app.js|kostra.css'
```
