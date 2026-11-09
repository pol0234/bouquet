# Procedurálna ASCII Slnečnicová Kytica (Bouquet v2.0)

Generatívna botanická kytica vykresľovaná v reálnom čase (60 FPS) cez nízko-rozlíšený vektorový buffer do dynamických znakov ASCII na HTML5 Canvas.

Projekt stavia na štandarde skillu **`ascii-floral-art`** a rozširuje ho o prepracovaný model **slnečnice (*Helianthus annuus*)** s Fibonacciho semennou špirálou (Phyllotaxis), sprievodné poľné kvety (modrá nevädza, divý mak, biele margaréty, levanduľa) a natívnu responzivitu pre mobilné telefóny aj PC.

---

## 🌻 Hlavné prvky a vlastnosti

1. **Čisté zobrazenie (Zero UI):**
   - Na stránke `index.html` nie sú žiadne rušivé prvky, texty ani lišty. Celú plochu tvorí hlboké OLED plátno s kyticou.
   - **Klik / Ťuknutie:** Kdekoľvek na obrazovke spustí opätovné rozkvitnutie s novým organickým generovaním.
   - **Interaktívny vánok:** Pohyb myšou alebo ťahanie prstom rozhýbe stonky vo vetre.

2. **Matematický model slnečnice (*Helianthus annuus*):**
   - **Vogelov model Fibonacciho špirály:** Stredový terč využíva zlatý uhol $\phi \approx 137.508^\circ$ (2.39996 rad) a 150 floretových semien prechádzajúcich z čokoládového jadra do zlatého peľového venca.
   - **Dvojvrstvové okvetie (48 lupeňov):** Prekrývajúce sa vrstvy s uhlovým posunom, centrálnou svetelnou žilkou a jemným separačným tieňom.
   - **Organické rozvíjanie:** Easing funkcia `eb(x)` (ease-back overshoot) simuluje postupné otváranie lupeňov z púčika.

3. **Sprievodné lúčne kvety:**
   - **Nevädza poľná (*Centaurea cyanus*):** Sýtokobaltové trojcípe zúbkované kvietky.
   - **Divý mak (*Papaver rhoeas*):** Hodvábne zvlnené rubínovo-červené lupene.
   - **Biele margaréty:** Čisté biele lúče s klenutým zlatým stredom.
   - **Levanduľa:** Štíhle fialové klasy rámujúce kompozíciu.
   - **Stonky:** Štíhle, vzdušné línie s negatívnym priestorom bez akéhokoľvek zhluku.

4. **Natívna responzivita (Mobil aj PC):**
   - **Mobil (portrét):** Pomer strán kytice sa dynamicky adaptuje na výšku obrazovky ($Hu \approx 1.48 - 1.62$), stonky sa predlžujú k spodnému okraju a kvety vypĺňajú stred a vrch.
   - **PC (landscape):** Kytica vyplní 96% vertikálnej výšky a je vycentrovaná.
   - **Level detailov:** Kalibrovaný na cca 110 stĺpcov s ostrým Monospace písmom (JetBrains Mono).

---

## 📁 Štruktúra projektu

- `index.html` – Hlavná čistá fullscreen verzia (iba kytica, tap/click na rozkvitnutie).
- `sunflower.html` – Zrkadlo čistej verzie (110 stĺpcov).
- `gallery.html` – Pôvodná galériová verzia s textovým popisom, kartičkou a možnosťou venovania cez URL.
- `js/botanic.js` – Botanická geometria kvetov, easingy a Fibonacciho špirály.
- `js/bouquet.js` – Usporiadanie scény, veterná fyzika a vrstvenie hĺbky.
- `js/ascii-render.js` – 3×3 supersampling rasterizer, nelineárna gamma korekcia `pow(v, 0.72)`.
- `js/particles.js` – Atmosférický zlatý peľ a ambientné hviezdy.
- `test/` – Sada automatizovaných testov pre matematiku, vykresľovanie a headless prehliadač.

---

## 🚀 Spustenie a testovanie

Otvorte priamo `index.html` v ľubovoľnom prehliadači (alebo v mobilnom telefóne).

Pre spustenie testov:
```bash
npm test
```

