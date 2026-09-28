'use strict';
/* ThermoLab — Cycles: every cycle is a list of reversible processes solved with Phys.process. */
/*PURE*/
function endState(ty, s, tg, g, n) {
  const nR = n * R; let {P, V, T} = s;
  if (ty === 'iso') { if (tg.V) { V = tg.V; P = nR * T / V; } else { P = tg.P; V = nR * T / P; } }
  else if (ty === 'isb') { if (tg.V) { V = tg.V; T = P * V / nR; } else { T = tg.T; V = nR * T / P; } }
  else if (ty === 'isc') { if (tg.T) { T = tg.T; P = nR * T / V; } else { P = tg.P; T = P * V / nR; } }
  else if (tg.V) { T *= Math.pow(V / tg.V, g - 1); V = tg.V; P = nR * T / V; }
  else { V *= Math.pow(P / tg.P, 1 / g); P = tg.P; T = P * V / nR; }
  return {P, V, T};
}
const CYC = {
  otto:    {name: 'Otto', par: [['r', 'rcomp', '', 2, 20, 8, .5], ['Tmax', 'Tmax', 'K', 600, 3000, 1800, 10]], f: 'η = 1 − r^(1−γ)',
            steps: ({p, T1, V1}) => [['adi', {V: V1 / p.r}], ['isc', {T: p.Tmax}], ['adi', {V: V1}], ['isc', {T: T1}]]},
  diesel:  {name: 'Diesel', par: [['r', 'rcomp', '', 10, 25, 18, .5], ['Tmax', 'Tmax', 'K', 1000, 3000, 2000, 10]], f: 'η = 1 − r^(1−γ) (ρ^γ − 1) / (γ(ρ − 1))',
            steps: ({p, T1, V1}) => [['adi', {V: V1 / p.r}], ['isb', {T: p.Tmax}], ['adi', {V: V1}], ['isc', {T: T1}]]},
  dual:    {name: 'Dual (Sabathé)', par: [['r', 'rcomp', '', 8, 25, 16, .5], ['Tmax', 'Tmax', 'K', 1000, 3000, 2200, 10]],
            steps: ({p, T1, V1, g}) => [['adi', {V: V1 / p.r}], ['isc', {T: (T1 * Math.pow(p.r, g - 1) + p.Tmax) / 2}], ['isb', {T: p.Tmax}], ['adi', {V: V1}], ['isc', {T: T1}]]},
  atk:     {name: 'Atkinson', par: [['r', 'rcomp', '', 4, 15, 8, .5], ['Tmax', 'Tmax', 'K', 600, 3000, 1800, 10]],
            steps: ({p, T1, P1, V1}) => [['adi', {V: V1 / p.r}], ['isc', {T: p.Tmax}], ['adi', {P: P1}], ['isb', {V: V1}]]},
  bray:    {name: 'Brayton (Joule)', par: [['rp', 'rp', '', 2, 20, 8, .5], ['Tmax', 'Tmax', 'K', 600, 2500, 1400, 10]], f: 'η = 1 − rp^((1−γ)/γ)',
            steps: ({p, T1, P1}) => [['adi', {P: P1 * p.rp}], ['isb', {T: p.Tmax}], ['adi', {P: P1}], ['isb', {T: T1}]]},
  stir:    {name: 'Stirling', par: [['r', 'rvol', '', 1.5, 6, 3, .1], ['Tmax', 'Tmax', 'K', 400, 1500, 800, 10]], reg: 2, f: 'η(regen) = 1 − TC/TH',
            steps: ({p, T1, V1}) => [['iso', {V: V1 / p.r}], ['isc', {T: p.Tmax}], ['iso', {V: V1}], ['isc', {T: T1}]]},
  eric:    {name: 'Ericsson', par: [['rp', 'rp', '', 2, 10, 4, .5], ['Tmax', 'Tmax', 'K', 400, 1500, 800, 10]], reg: 2, f: 'η(regen) = 1 − TC/TH',
            steps: ({p, T1, P1}) => [['iso', {P: P1 * p.rp}], ['isb', {T: p.Tmax}], ['iso', {P: P1}], ['isb', {T: T1}]]},
  leno:    {name: 'Lenoir', par: [['Tmax', 'Tmax', 'K', 600, 3000, 1800, 10]], steps: ({p, P1, V1}) => [['isc', {T: p.Tmax}], ['adi', {P: P1}], ['isb', {V: V1}]]},
  rbray:   {name: '↺ Brayton', rev: 1, T1: 250, par: [['rp', 'rp', '', 2, 10, 4, .5], ['Tamb', 'Tamb', 'K', 260, 340, 300, 1]], f: 'COP = 1 / (rp^((γ−1)/γ) − 1)',
            steps: ({p, T1, P1}) => [['adi', {P: P1 * p.rp}], ['isb', {T: p.Tamb}], ['adi', {P: P1}], ['isb', {T: T1}]]}
};
function cycle(d, p, {n, T1, P1, g}) {
  const V1 = n * R * T1 / P1; let s = {P: P1, V: V1, T: T1}, S0 = 0, segs = [], Qin = 0, Qout = 0, W = 0;
  for (const [ty, tg] of d.steps({p, T1, P1, V1, g})) {
    const e = endState(ty, s, tg, g, n);
    if (![e.P, e.V, e.T].every(x => isFinite(x) && x > 0)) throw new Error('e_cyc');
    const r = Phys.process(ty, {n, T1: s.T, T2: e.T, V1: s.V, V2: e.V, g});
    r.path.forEach(q => { q.S += S0; }); S0 += r.dS; segs.push({ty, r});
    if (r.Q > 0) Qin += r.Q; else Qout -= r.Q; W += r.W; s = e;
  }
  if (d.rev ? W >= 0 : W <= 0) throw new Error('e_cyc');
  const all = segs.flatMap(x => x.r.path), Ts = all.map(q => q.T), Tm = Math.min(...Ts), TM = Math.max(...Ts);
  return {segs, all, Qin, Qout, W, eta: W / Qin, etaC: 1 - Tm / TM, copR: Qin / -W, copH: Qout / -W, copC: Tm / (TM - Tm), reg: d.reg != null ? W / segs[d.reg].r.Q : null};
}
/*ENDPURE*/

/* ---- text (proper names stay untranslated) ---- */
const USE = {en: ['Petrol engines', 'Classic diesel engines', 'Fast modern diesels', 'Hybrid / high-efficiency engines', 'Gas turbines, jet engines', 'Stirling engines, cryocoolers', 'Hot-air engines, heat recovery', 'First internal-combustion engine (1860)', 'Gas refrigeration, aircraft cooling'],
  fr: ['Moteurs à essence', 'Moteurs diesel classiques', 'Diesels modernes rapides', 'Moteurs hybrides à haut rendement', 'Turbines à gaz, réacteurs', 'Moteurs Stirling, cryogénie', 'Moteurs à air chaud, récupération de chaleur', 'Premier moteur à combustion interne (1860)', 'Réfrigération à gaz, climatisation d’avion'],
  ar: ['محركات البنزين', 'محركات الديزل الكلاسيكية', 'محركات الديزل الحديثة السريعة', 'المحركات الهجينة عالية المردود', 'التوربينات الغازية والمحركات النفاثة', 'محركات ستيرلينغ والتبريد العميق', 'محركات الهواء الساخن واسترجاع الحرارة', 'أول محرك احتراق داخلي (1860)', 'التبريد بالغاز وتكييف الطائرات']};
Object.assign(TR.en, {n_cyc: 'Cycles', cycT: 'Cycle', rcomp: 'Compression ratio r', rvol: 'Volume ratio r', rp: 'Pressure ratio rp', Tmax: 'Maximum temperature', Tamb: 'Ambient temperature', qabs: 'Heat absorbed', qrej: 'Heat rejected', copR: 'COP (refrigerator)', copH: 'COP (heat pump)', etaReg: 'Efficiency with ideal regenerator', kpol: 'Polytropic index k', pol: 'Polytropic (PVᵏ = const)', free: 'Free expansion (irreversible)', e_cyc: 'These parameters do not give a valid cycle: raise Tmax or check the ratios.', e_free: 'Free expansion needs V₂ > V₁.', cycS: 'Stage / process',
  x_pol: ['PVᵏ, where k is the polytropic index (k = 0 isobaric, 1 isothermal, γ adiabatic).', 'P ∝ V⁻ᵏ.', 'T·V^(k−1) is constant.', 'Q = ΔU + W, and the heat capacity is C = Cv − R/(k − 1).', 'W = nR(T₁ − T₂)/(k − 1).'],
  x_free: ['Nothing is exchanged: Q = 0 and W = 0 (expansion into vacuum).', 'It falls to P₁V₁/V₂. The line is only a guide: intermediate states are not equilibrium states.', 'It stays the same (ideal gas, ΔU = 0).', 'Nothing leaves the gas; entropy is created inside, so the process is irreversible.', 'W = 0: the gas pushes against no pressure.']});
Object.assign(TR.fr, {n_cyc: 'Cycles', cycT: 'Cycle', rcomp: 'Taux de compression r', rvol: 'Rapport de volumes r', rp: 'Rapport de pressions rp', Tmax: 'Température maximale', Tamb: 'Température ambiante', qabs: 'Chaleur absorbée', qrej: 'Chaleur rejetée', copR: 'COP (réfrigérateur)', copH: 'COP (pompe à chaleur)', etaReg: 'Rendement avec régénérateur idéal', kpol: 'Indice polytropique k', pol: 'Polytropique (PVᵏ = cte)', free: 'Détente libre (irréversible)', e_cyc: 'Ces paramètres ne donnent pas un cycle valide : augmentez Tmax ou vérifiez les rapports.', e_free: 'La détente libre exige V₂ > V₁.', cycS: 'Étape / transformation',
  x_pol: ['PVᵏ, où k est l’indice polytropique (k = 0 isobare, 1 isotherme, γ adiabatique).', 'P ∝ V⁻ᵏ.', 'T·V^(k−1) est constant.', 'Q = ΔU + W, et la capacité thermique vaut C = Cv − R/(k − 1).', 'W = nR(T₁ − T₂)/(k − 1).'],
  x_free: ['Aucun échange : Q = 0 et W = 0 (détente dans le vide).', 'Elle tombe à P₁V₁/V₂. Le trait est indicatif : les états intermédiaires ne sont pas des états d’équilibre.', 'Elle reste la même (gaz parfait, ΔU = 0).', 'Rien ne sort du gaz ; de l’entropie est créée à l’intérieur : la transformation est irréversible.', 'W = 0 : le gaz ne pousse contre aucune pression.']});
Object.assign(TR.ar, {n_cyc: 'الدورات', cycT: 'الدورة', rcomp: 'نسبة الانضغاط r', rvol: 'نسبة الأحجام r', rp: 'نسبة الضغط rp', Tmax: 'درجة الحرارة القصوى', Tamb: 'درجة الحرارة المحيطة', qabs: 'الحرارة الممتصة', qrej: 'الحرارة المطروحة', copR: 'معامل الأداء (ثلاجة)', copH: 'معامل الأداء (مضخة حرارية)', etaReg: 'المردود مع مجدد مثالي', kpol: 'دليل البوليتروب k', pol: 'بوليتروبي (PVᵏ = ثابت)', free: 'تمدد حر (غير عكوس)', e_cyc: 'هذه القيم لا تعطي دورة صالحة: ارفع Tmax أو راجع النسب.', e_free: 'يتطلب التمدد الحر V₂ > V₁.', cycS: 'المرحلة / التحول',
  x_pol: ['PVᵏ حيث k دليل البوليتروب (k = 0 ثابت الضغط، 1 ثابت الحرارة، γ كظوم).', 'P ∝ V⁻ᵏ.', 'T·V^(k−1) ثابت.', 'Q = ΔU + W والسعة الحرارية C = Cv − R/(k − 1).', 'W = nR(T₁ − T₂)/(k − 1).'],
  x_free: ['لا تبادل: Q = 0 و W = 0 (تمدد في الفراغ).', 'ينخفض إلى P₁V₁/V₂. الخط للإرشاد فقط: الحالات الوسيطة ليست حالات توازن.', 'يبقى ثابتاً (غاز مثالي، ΔU = 0).', 'لا شيء يغادر الغاز؛ تتولد إنتروبيا داخله فالتحول غير عكوس.', 'W = 0: الغاز لا يدفع ضد أي ضغط.']});

/* ---- UI ---- */
const YCOL = ['#d9480f', '#7048e8', '#1f5fbf', '#0f8b5f', '#c2255c', '#a17800'];
let Y = null, yc = {};
const ids = Object.keys(CYC);
$('yType').innerHTML = ids.map(k => `<option value="${k}">${CYC[k].name}</option>`).join('');
function buildY() {
  const d = CYC[$('yType').value]; $('yFields').innerHTML = '';
  fld('yFields', 'yn', 'n', 'mol', 0.1, 5, 1, 0.1, runY); fld('yFields', 'yT1', 'T1', 'K', 100, 600, d.T1 || 300, 1, runY); fld('yFields', 'yP1', 'P1', 'kPa', 10, 500, 100, 5, runY);
  d.par.forEach(([k, key, u, mn, mx, v, st]) => fld('yFields', 'y_' + k, key, u, mn, mx, v, st, runY));
  applyStatic($('yFields'));
}
function mkY() { Object.values(yc).forEach(c => c.destroy()); yc = {pv: mkChart('yPV', 'L', 'kPa'), ts: mkChart('yTS', 'J/K', 'K')}; }
const yAnim = Anim(16, true, (p, run) => {
  $('ySeek').value = p * 1000; if (!Y) return;
  const q = interp(Y.all, Math.min(p, .9999)), N = Y.segs.length, k = Math.min(N - 1, Math.floor(p * N)), sg = Y.segs[k], Q = sg.r.Q;
  mv(yc.pv, q.V * 1000, q.P / 1000); mv(yc.ts, q.S, q.T);
  piston('pst_y', q, Y.all, Q > 1e-9 ? '#f97316' : Q < -1e-9 ? '#5aa2ff' : '#8a94a3');
  $('yStage').textContent = `${t('stg')} ${k + 1}/${N}: ${t(sg.ty)} · ${Q > 1e-9 ? '🔥 Q > 0' : Q < -1e-9 ? '❄ Q < 0' : '⊘ Q = 0'}`;
  document.querySelectorAll('#yTab tr[data-i]').forEach(r => r.classList.toggle('now', +r.dataset.i === k));
});
function runY() {
  guard('err_cyc', () => {
    const key = $('yType').value, d = CYC[key], p = {}, g = gam('yGas');
    d.par.forEach(a => { p[a[0]] = num('y_' + a[0], 'e_num'); });
    Y = cycle(d, p, {n: num('yn', 'e_n'), T1: num('yT1', 'e_T'), P1: num('yP1', 'e_P') * 1000, g});
    $('yUse').textContent = USE[lang][ids.indexOf(key)]; $('yForm').textContent = d.f || '';
    const rows = [['yQi', 'qabs', '[J]', Y.Qin], ['yQo', 'qrej', '[J]', Y.Qout], ['yW', 'Wn', '[J]', Y.W]].concat(d.rev ? [['yA', 'copR', '', Y.copR], ['yB', 'copH', '', Y.copH], ['yC', 'copR', 'Carnot', Y.copC]] : [['yA', 'eta', '[%]', Y.eta * 100], ['yB', 'etaC', '[%]', Y.etaC * 100]].concat(Y.reg != null ? [['yC', 'etaReg', '[%]', Y.reg * 100]] : []));
    kv('yOut', rows.map(r => r.slice(0, 3))); applyStatic($('yOut')); rows.forEach(r => setv(r[0], f(r[3])));
    if (!yc.pv) mkY();
    const N = Y.segs.length, lab = (sg, i) => `${i + 1}. ${t(sg.ty)}`;
    setChart(yc.pv, Y.segs.map((sg, i) => ({label: lab(sg, i), pts: sg.r.path.map(pv), color: YCOL[i % 6]})), Y.segs.map((sg, i) => ({label: `${t('state')} ${i + 1}`, ...pv(sg.r.path[0])})), `${t('V')} (L)`, `${t('P')} (kPa)`);
    setChart(yc.ts, Y.segs.map((sg, i) => ({label: lab(sg, i), pts: sg.r.path.map(q => ({x: q.S, y: q.T})), color: YCOL[i % 6]})), Y.segs.map((sg, i) => ({label: `${t('state')} ${i + 1}`, x: sg.r.path[0].S, y: sg.r.path[0].T})), 'S − S₁ (J/K)', `${t('T')} (K)`);
    $('yTab').innerHTML = `<tr><th>${t('cycS')}</th><th>W [J]</th><th>Q [J]</th><th>ΔU [J]</th><th>ΔS [J/K]</th></tr>` + Y.segs.map((sg, i) => `<tr data-i="${i}"><td>${i + 1}. ${t(sg.ty)}</td><td class="num">${f(sg.r.W)}</td><td class="num">${f(sg.r.Q)}</td><td class="num">${f(sg.r.dU)}</td><td class="num">${f(sg.r.dS)}</td></tr>`).join('') + `<tr><th>Σ</th><th class="num">${f(Y.W)}</th><th class="num">${f(Y.Qin - Y.Qout)}</th><th class="num">0</th><th class="num">0</th></tr>`;
    yAnim.redraw();
  });
}
buildPiston('pistY', 'pst_y');
Object.assign(ACT, {yStart: () => yAnim.start(), yPause: () => yAnim.pause(), yReset: () => yAnim.reset()});
document.querySelectorAll('#v-cyc [data-act]').forEach(b => b.addEventListener('click', () => ACT[b.dataset.act]()));
$('yType').addEventListener('change', () => { buildY(); yAnim.reset(); runY(); });
$('yGas').addEventListener('change', runY);
$('ySeek').addEventListener('input', e => yAnim.seek(e.target.value / 1000));
$('lang').addEventListener('change', runY);
$('themeBtn').addEventListener('click', () => { mkY(); runY(); });
buildY(); applyLang(lang); runY();
