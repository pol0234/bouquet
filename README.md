# Procedurálna ASCII Slnečnicová Kytica (Bouquet v2.0)

Generatívna botanická kytica vykresľovaná v reálnom čase (60 FPS) cez nízko-rozlíšený vektorový buffer do dynamických znakov ASCII na HTML5 Canvas.

Projekt stavia na štandarde skillu **`ascii-floral-art`** a rozširuje ho o prepracovaný model **slnečnice (*Helianthus annuus*)** s Fibonacciho semennou špirálou (Phyllotaxis), sprievodné poľné kvety (modrá nevädza, divý mak, biele margaréty, levanduľa), floristické previazanie stoniek a natívnu responzivitu pre mobilné telefóny aj PC.

---

## 🌻 Hlavné prvky a vlastnosti

1. **Čisté zobrazenie (Zero UI):**
   - Na stránke `index.html` nie sú žiadne rušivé prvky, texty ani lišty. Celú plochu tvorí hlboké OLED plátno s kyticou.
   - **Ikonka stránky (Favicon):** Elegantné sivé textové srdiečko `<3` (`#94a3b8`) v monospace fonte.
   - **Klik / Ťuknutie:** Kdekoľvek na obrazovke spustí opätovné rozkvitnutie s novým organickým generovaním (s ochranou proti dvojitému kliku na dotykových displejoch).
   - **Interaktívny vánok:** Pohyb myšou alebo ťahanie prstom plynulo kolíše stonky vo vetre (`touch-action: none` zabraňuje nechcenému scrollovaniu).

2. **Matematický model slnečnice (*Helianthus annuus*):**
   - **Vogelov model Fibonacciho špirály:** Stredový terč využíva zlatý uhol $\phi \approx 137.508^\circ$ (2.39996 rad) a 84 floretov prechádzajúcich zo zamatového čokoládového jadra do žiarivého zlatého peľového venca.
   - **Lúčovité okvetie (16 vonkajších + 14 vnútorných lupeňov):** Ostré kopijovité lúče s jasným negatívnym priestorom medzi špičkami, bielym centrálnym hrebeňom (specular spine) a tmavým separačným obrysom pre dokonalý 3D ASCII reliéf.
   - **Organické rozvíjanie:** Easing funkcia `eb(x)` (ease-back overshoot) simuluje postupné otváranie lupeňov z púčika.

3. **Sprievodné lúčne kvety a floristické detaily:**
   - **Nevädza poľná (*Centaurea cyanus*):** Sýtokobaltové trojcípe zúbkované kvietky.
   - **Divý mak (*Papaver rhoeas*):** Hodvábne zvlnené rubínovo-červené lupene.
   - **Biele margaréty:** Čisté biele lúče s klenutým zlatým stredom.
   - **Levanduľa:** Štíhle fialové klasy rámujúce horné krídla kompozície.
   - **Floristické previazanie (Raffia Tie):** V páse kytice ozdobné rafiové previazanie so zlatou krížovou šnúrkou a visiacimi koncami.
   - **Lístie:** Bohaté bočné listy klenúce sa do šírky displeja a jemné lístky pri vrcholových pukoch.

4. **Natívna responzivita (Mobil aj PC):**
   - **Mobil (portrét):** Plátno natívne vyplní 100 % šírky aj výšky displeja bez čiernych okrajov. Vertikálne pozície kvetov a stoniek sa dynamicky prispôsobujú pomeru displeja $Hu \approx 2.0 - 2.2$.
   - **PC (landscape):** Kytica vyplní 95 % vertikálnej výšky a je majestátne vycentrovaná v pomere $Hu \approx 1.36$.
   - **Level detailov:** Presne kalibrovaný na cca 110 stĺpcov s ostrým písmom JetBrains Mono.

---

## 📁 Štruktúra projektu

- `index.html` – Hlavná čistá fullscreen verzia (iba kytica, tap/click na rozkvitnutie).
- `sunflower.html` – Zrkadlo čistej verzie (110 stĺpcov).
- `gallery.html` – Pôvodná galériová verzia s textovým popisom, kartičkou a možnosťou venovania cez URL.
- `js/botanic.js` – Botanická geometria kvetov, easingy a Fibonacciho špirály.
- `js/bouquet.js` – Usporiadanie scény, adaptívne škálovanie podľa $Hu$, rafiová stužka a veterná dynamika.
- `js/ascii-render.js` – 3×3 supersampling rasterizer, nelineárna gamma korekcia `pow(v, 0.72)`.
- `js/particles.js` – Voliteľný časticový podsystém (používaný v gallery verzii).
- `test/` – Sada 7 automatizovaných testov (matematika, botanika, ASCII shader, headless Chrome audit).
- `scripts/` – Skript pre audit responzívnosti na desktope a mobile (`scripts/test-responsive-110.js`).

---

## 🚀 Spustenie a testovanie

Otvorte priamo `index.html` v ľubovoľnom prehliadači (alebo v mobilnom telefóne).

Pre spustenie testov:
```bash
npm test
```


