# Procedurálna ASCII Slnečnicová Kytica (Bouquet v2.0)

Generatívna botanická kytica vykresľovaná v reálnom čase (60 FPS) cez nízko-rozlíšený vektorový buffer do dynamických znakov ASCII na HTML5 Canvas.

Projekt stavia na štandarde skillu **`ascii-floral-art`** a rozširuje ho o prepracovaný model **slnečnice (*Helianthus annuus*)** s Fibonacciho semennou špirálou (Phyllotaxis), sprievodné poľné kvety (modrá nevädza, divý mak, biele margaréty, levanduľa), floristické previazanie stoniek a natívnu responzivitu pre mobilné telefóny aj PC.

---

---

## Spustenie a testovanie

Otvorte priamo `index.html` v ľubovoľnom prehliadači (alebo v mobilnom telefóne).

Pre spustenie testov:
```bash
npm test
```



---

## Appka na ploche mobilu (PWA) – experimentálne

Stránka sa dá pridať na plochu ako appka: bez lišty prehliadača, s ikonkou `<3` a s názvom `<3`.
Rovnaká ikonka je aj v karte prehliadača.

| Súbor | Na čo je |
|---|---|
| `manifest.webmanifest` | názov, farby, ikonky, režim „bez lišty“ (Android, iOS 16.4+) |
| `assets/icons/apple-touch-icon.png` | ikonka pre iPhone (180×180, iOS si zaoblí rohy sám) |
| `assets/icons/icon-*.png`, `favicon-32.png` | Android / Chrome / karta prehliadača |
| `sw.js` | service worker: online vždy najnovšia verzia, offline posledná uložená |
| `scripts/generate-icons.js` | vygeneruje ikonky (`npm run icons`) |

### Test A – lokálne cez Wi-Fi (živá stránka sa nemení)

1. Na PC: `npm run serve`, vypíše adresu typu `http://192.168.x.x:8080/`.
   Ak Windows ukáže okno firewallu, povoľ **súkromné siete**.
2. Na iPhone (rovnaká Wi-Fi) otvor túto adresu v **Safari**.
3. **Zdieľať → Pridať na plochu**: v náhľade má byť zlaté `<3` a názov `<3`.
4. Otvor appku z plochy.

Takto sa dá overiť ikonka, názov aj režim bez lišty. Offline režim sa takto neotestuje:
service worker funguje len na HTTPS (Test B).

### Test B – dočasne na GitHub Pages (HTTPS, presne ako to uvidí ona)

1. `git push -u origin experiment/pwa`
2. GitHub → repozitár → **Settings → Pages → Build and deployment → Branch**: vyber `experiment/pwa` → Save.
3. Počkaj 1–2 minúty (záložka **Actions** ukáže, kedy je hotovo), potom testuj na bežnej adrese stránky.
4. Po teste prepni Branch späť na `main` (alebo najprv zmerguj).

Kým je zapnutá branch, na adrese beží táto verzia. Jediný viditeľný rozdiel je ikonka v karte.

### Čo skontrolovať

- [ ] V karte prehliadača je nová ikonka `<3`
- [ ] „Pridať na plochu“ ukáže ikonku `<3` (nie screenshot stránky) a názov `<3`
- [ ] Appka z plochy sa otvorí bez lišty Safari, čierne pozadie po celej obrazovke
- [ ] Kvety nie sú schované pod výrezom/Dynamic Islandom. Ak sú, v HTML zmeň
      `apple-mobile-web-app-status-bar-style` z `black-translucent` na `black`
- [ ] (Test B) Režim lietadlo → appka z plochy sa aj tak otvorí
- [ ] (Android, Chrome) menu ⋮ → **Inštalovať aplikáciu** / **Pridať na plochu**

**Keď sa stále ukazuje stará ikonka:** iOS si ikonky pamätá. Zmaž starú ikonku z plochy a potom
v *Nastavenia → Safari → Pokročilé → Údaje webových stránok* odstráň `github.io` (alebo IP adresu PC).
Prípadne skús pridať stránku na plochu zo súkromnej karty.

### Iná ikonka

```bash
npm run icons                           # predvolené: zlaté <3
node scripts/generate-icons.js --variant=heart-ink   # krémové <3
node scripts/generate-icons.js --variant=star        # ASCII hviezdička / kvet
node scripts/generate-icons.js --variant=flower      # pôvodná kvetinová silueta
```
Na generovanie treba Google Chrome a internet (načíta sa font JetBrains Mono).
