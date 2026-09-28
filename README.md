<p align="center"><img src="assets/logo.svg" width="96" alt="ThermoLab logo"></p>

# ThermoLab

*Interactive Thermodynamics Simulator — an educational tool for university physics students.*

## Overview
ThermoLab lets students change pressure, volume, temperature and amount of gas and see the consequences: P-V and T-S diagrams, work, heat, internal energy and Carnot-cycle efficiency. Everything runs in the browser; there is no backend and no API.

Supported languages: **English, French, and Arabic (with full right-to-left layout)**.

## Features
- Dashboard with linked sliders and inputs (PV = nRT), never accepting T, P, V or n ≤ 0
- Ideal gas calculator (solve for P, V, T or n) with given values, formula, substitution and result; units Pa/kPa/bar/atm, m³/L, K/°C
- **Six transformations:** isothermal, isobaric, isochoric, adiabatic (isentropic), **polytropic** (PVᵏ = const, any k) and **free expansion** (irreversible); monatomic γ = 5/3, diatomic γ = 7/5
- **Cycles tab, 9 cycles animated in real time:** Otto, Diesel, Dual (Sabathé), Atkinson, Brayton (Joule), Stirling, Ericsson, Lenoir, and reversed Brayton (refrigerator / heat pump), plus Carnot in its own tab. Each shows live P-V and T-S diagrams, the cylinder, a stage table (W, Q, ΔU, ΔS per stage, highlighted as it plays), efficiency or COP, and the Carnot limit
- Animated P-V diagram, T-S diagram, PNG export
- Carnot cycle simulator with Start / Pause / Reset, speed and timeline, stage indicator and animated energy-flow diagram
- Formula panel and step-by-step substitution for the current process
- **Real gas (van der Waals):** compare ideal and real pressure for He, N₂, CO₂ and H₂O, with deviation, compressibility factor Z and an isotherm chart
- **Speed control (0.25× to 8×) and a draggable timeline** for every animation, so a cycle can be slowed down, sped up or scrubbed
- **Animated cylinder and piston:** piston height follows the volume, gas colour follows the temperature, and the base shows heat flowing in, out or not at all (orange, blue, grey)
- **Carnot cycle on a T-S diagram** (a rectangle) with a moving marker, next to the P-V diagram
- **CSV export** of the current process (V, P, T, S along the path) for use in a spreadsheet or lab report
- **Unit tests** for the physics engine (first law, adiabatic invariants, Carnot efficiency)
- Light and dark themes, responsive layout with collapsible sidebar

## Physics
**Conventions (used everywhere):** W = work done *by* the gas (W > 0 on expansion). Q = heat added *to* the gas. ΔU = Q − W. SI units internally; temperatures in kelvin.

**Assumptions:** ideal gas, constant heat capacities, reversible (quasi-static) processes. Cv = R/(γ − 1): 3R/2 (monatomic), 5R/2 (diatomic, vibrations frozen). R = 8.314462618 J/(mol·K).

| Process | Relations |
|---|---|
| Isothermal | PV = const, ΔU = 0, W = nRT ln(V₂/V₁), Q = W |
| Isobaric | W = P(V₂ − V₁), ΔU = nCvΔT, Q = ΔU + W |
| Isochoric | W = 0, ΔU = nCvΔT, Q = ΔU |
| Adiabatic | PV^γ = const, TV^(γ−1) = const, Q = 0, W = −ΔU |
| Entropy | ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁) (relative to state 1) |
| Polytropic | PVᵏ = const, TV^(k−1) = const, W = nR(T₁ − T₂)/(k − 1), C = Cv − R/(k − 1) |
| Free expansion | Q = W = ΔU = 0, ΔS = nR ln(V₂/V₁) > 0 |
| Cycles | Built from the processes above; ΔU = 0 over a cycle, Wnet = ΣQ; e.g. Otto η = 1 − r^(1−γ), Brayton η = 1 − rp^((1−γ)/γ) |
| Carnot | QH = nR·TH ln(V₂/V₁), QC = nR·TC ln(V₃/V₄), Wnet = QH − QC, η = 1 − TC/TH |

In the Carnot cycle QC is shown as a positive magnitude of heat rejected. The Carnot cycle is shown on both the P-V and T-S diagrams.

## Technologies
HTML5, CSS3, vanilla JavaScript, Chart.js 4 (CDN), Google Fonts (IBM Plex Sans, Noto Sans Arabic).

## Project Structure
```
thermolab/
├── index.html      markup
├── style.css       themes, layout, RTL rules
├── script.js       Phys (physics engine), TR (translations), UI, charts
├── features.js     van der Waals, piston view, CSV export
├── assets/logo.svg logo and favicon
├── tests/phys.test.js   run with: node tests/phys.test.js
├── LICENSE
└── README.md
```

## Multilingual architecture
- All text lives in the `TR` object in `script.js`: `TR.en`, `TR.fr`, `TR.ar`.
- Static elements carry `data-i18n="key"` (or `data-i18n-title` for tooltips); `applyLang()` swaps their text. Dynamic output (errors, explanations, chart labels) calls `t(key)`.
- Switching language re-renders results from the current input values, so **simulation values and graphs are preserved**. No page reload.
- Arabic sets `document.documentElement.dir = "rtl"`; other languages set `"ltr"`. Layout uses CSS logical properties, while equations, numbers and charts stay left-to-right.
- The choice is saved in `localStorage` (`thermolab-language`). On first visit the browser language (`fr`, `ar`, else `en`) is used.
- **Adding a language:** add one object to `TR` with the same keys and one `<option>` to the `#lang` select. Equations are never translated.

## How to Run
Open `index.html` in a browser. (Chart.js and fonts load from CDNs, so an internet connection is needed the first time.) Or serve locally: `python3 -m http.server` and visit `http://localhost:8000`.

## GitHub Pages Deployment
1. Create a repository and push the contents of `thermolab/` to the `main` branch (with `index.html` at the root).
2. In the repository go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. After a minute the site is live at `https://<username>.github.io/<repository>/`.

## Academic Context
Fill in the *Project information* card in the About tab (institution, course, team, supervisor, year), and the table below when submitting.

| Item | Details |
|---|---|
| Objective | Help students see how P, V, T and n are linked and how energy moves in thermodynamic processes |
| Method | Analytical ideal-gas relations evaluated numerically (SI units), plotted with Chart.js |
| Validation | Automated checks of ΔU = Q − W, PV^γ = const, η = 1 − TC/TH; van der Waals compared with PV = nRT in the ideal limit |
| Limits | Ideal gas with constant heat capacities; van der Waals is qualitative near the critical point |

## References
1. Y. A. Çengel, M. A. Boles, *Thermodynamics: An Engineering Approach*, McGraw-Hill.
2. H. B. Callen, *Thermodynamics and an Introduction to Thermostatistics*, Wiley.
3. P. Atkins, J. de Paula, *Physical Chemistry*, Oxford University Press.
4. M. W. Zemansky, R. H. Dittman, *Heat and Thermodynamics*, McGraw-Hill.

## Future Improvements
More equations of state · real gas models (more real-gas models · statistical mechanics · Otto, Diesel and Rankine cycles · Rankine cycle (needs steam tables) · data logging · automated tests for the physics module.

## Disclaimer
Built as a scientific computing and physics education project. ThermoLab is not scientifically validated and must not be used for professional engineering decisions.
