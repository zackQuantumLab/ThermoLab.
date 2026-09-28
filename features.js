'use strict';
/* ThermoLab — extra features: van der Waals real gas, practice exercises, CSV export. Uses globals from script.js. */
const X = {
en: {n_real:'Real Gas (van der Waals)',csv:'Export CSV',rGas:'Gas',pIdeal:'Ideal-gas pressure',pReal:'van der Waals pressure',dev:'Deviation from ideal',Z:'Compressibility factor Z',
 realNote:'van der Waals model: a corrects for attraction between molecules, b for their own volume. Real gases deviate from PV = nRT at high pressure and low temperature. Below the critical temperature the model shows a loop that is only qualitative.',
 e_Vb:'Volume must be larger than nb (the excluded volume).',pInfo:'Project information',iInst:'Institution',iCourse:'Course',iTeam:'Team',iSup:'Supervisor',iYear:'Academic year',refsT:'References'},
fr: {n_real:'Gaz réel (van der Waals)',csv:'Exporter CSV',rGas:'Gaz',pIdeal:'Pression du gaz parfait',pReal:'Pression de van der Waals',dev:'Écart au gaz parfait',Z:'Facteur de compressibilité Z',
 realNote:'Modèle de van der Waals : a corrige l’attraction entre molécules, b leur volume propre. Les gaz réels s’écartent de PV = nRT à haute pression et basse température. Sous la température critique, la boucle du modèle n’est que qualitative.',
 e_Vb:'Le volume doit être supérieur à nb (volume exclu).',pInfo:'Informations du projet',iInst:'Établissement',iCourse:'Module',iTeam:'Équipe',iSup:'Encadrant',iYear:'Année universitaire',refsT:'Références'},
ar: {n_real:'الغاز الحقيقي (فان دير فالس)',csv:'تصدير CSV',rGas:'الغاز',pIdeal:'ضغط الغاز المثالي',pReal:'ضغط فان دير فالس',dev:'الانحراف عن المثالي',Z:'عامل الانضغاطية Z',
 realNote:'نموذج فان دير فالس: يصحح a قوى الجذب بين الجزيئات، ويصحح b حجمها الذاتي. تنحرف الغازات الحقيقية عن PV = nRT عند الضغط المرتفع ودرجة الحرارة المنخفضة. تحت درجة الحرارة الحرجة تكون الحلقة في النموذج كيفية فقط.',
 e_Vb:'يجب أن يكون الحجم أكبر من nb (الحجم المستبعد).',pInfo:'معلومات المشروع',iInst:'المؤسسة',iCourse:'المادة',iTeam:'الفريق',iSup:'المشرف',iYear:'السنة الجامعية',refsT:'المراجع'}
};
Object.assign(X.en, {speed:'Animation speed',carTS:'T–S diagram of the cycle',carTSn:'On a T-S diagram the Carnot cycle is a rectangle: two isotherms (horizontal) and two adiabats (vertical, ΔS = 0). The enclosed area equals the net work.',tsNote:'Entropy is relative to state 1 (S₁ = 0): ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁). For the reversible adiabatic process ΔS = 0.'});
Object.assign(X.fr, {speed:'Vitesse de l’animation',carTS:'Diagramme T-S du cycle',carTSn:'Dans un diagramme T-S, le cycle de Carnot est un rectangle : deux isothermes (horizontales) et deux adiabatiques (verticales, ΔS = 0). L’aire enfermée est égale au travail net.',tsNote:'L’entropie est relative à l’état 1 (S₁ = 0) : ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁). Pour l’adiabatique réversible, ΔS = 0.'});
Object.assign(X.ar, {speed:'سرعة المحاكاة',carTS:'مخطط T-S للدورة',carTSn:'في مخطط T-S تظهر دورة كارنو على شكل مستطيل: منحنيان متساويا الحرارة (أفقيان) ومنحنيان كظومان (عموديان، ΔS = 0). المساحة المحصورة تساوي الشغل الصافي.',tsNote:'الإنتروبيا نسبية إلى الحالة 1 (S₁ = 0): ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁). وفي العملية الكظومة العكوسة ΔS = 0.'});
for (const l in X) Object.assign(TR[l], X[l]);

/* ---- Animated cylinder: piston height = V, gas colour = T, base colour = heat exchange (orange in, blue out, grey none) ---- */
function buildPiston(host, id) {
  $(host).innerHTML = `<svg id="${id}" class="pist" viewBox="0 0 260 240" role="img" aria-label="piston">
  <rect x="80" y="20" width="100" height="180" rx="4" class="cyl"/><rect id="${id}_g" x="82" y="100" width="96" height="98"/>
  <line id="${id}_r" x1="130" y1="90" x2="130" y2="8" class="rod"/><rect id="${id}_p" x="80" y="90" width="100" height="10" rx="2" class="pis"/>
  <rect id="${id}_b" x="66" y="200" width="128" height="14" rx="3"/><text id="${id}_t" x="130" y="232" text-anchor="middle"></text></svg>`;
}
function piston(id, q, pts, base) {
  let v0 = 1e9, v1 = -1e9, t0 = 1e9, t1 = -1e9;
  for (const p of pts) { v0 = Math.min(v0, p.V); v1 = Math.max(v1, p.V); t0 = Math.min(t0, p.T); t1 = Math.max(t1, p.T); }
  const vf = v1 > v0 ? (q.V - v0) / (v1 - v0) : .5, tf = t1 > t0 ? (q.T - t0) / (t1 - t0) : .5, h = 40 + 130 * vf, top = 198 - h, A = (k, o) => { for (const a in o) $(`${id}_${k}`).setAttribute(a, o[a]); };
  A('g', {y: top, height: h, fill: `hsl(${220 - 215 * tf},80%,55%)`}); A('p', {y: top - 10}); A('r', {y1: top - 10}); A('b', {fill: base});
  $(id + '_t').textContent = `V = ${f(q.V * 1000)} L · T = ${f(q.T)} K · P = ${f(q.P / 1000)} kPa`;
}

/* ---- van der Waals (a in Pa·m⁶/mol², b in m³/mol) ---- */
const VDW = {He: {a: 0.00346, b: 2.38e-5}, N2: {a: 0.137, b: 3.87e-5}, CO2: {a: 0.364, b: 4.27e-5}, H2O: {a: 0.5537, b: 3.05e-5}};
const vdwP = (g, n, T, V) => n * R * T / (V - n * g.b) - g.a * n * n / (V * V);
let rChart = null;
function renderReal() {
  guard('err_real', () => {
    const g = VDW[$('rGas').value], n = num('rn', 'e_n'), T = num('rT', 'e_T'), V = num('rV', 'e_V') / 1000;
    if (V <= n * g.b) throw new Error('e_Vb');
    const Pi = n * R * T / V, Pr = vdwP(g, n, T, V), Z = Pr * V / (n * R * T);
    const o = {rO_Pi: Pi / 1000, rO_Pr: Pr / 1000, rO_dev: (Pr / Pi - 1) * 100, rO_Z: Z};
    for (const k in o) setv(k, f(o[k]));
    if (!rChart) rChart = mkChart('rvC', 'L', 'kPa');
    const v0 = n * g.b * 1.3, v1 = V * 3, pi = [], pr = [];
    for (let i = 0; i <= 120; i++) { const v = v0 * Math.pow(v1 / v0, i / 120); pi.push({x: v * 1000, y: n * R * T / v / 1000}); pr.push({x: v * 1000, y: vdwP(g, n, T, v) / 1000}); }
    setChart(rChart, [{label: 'PV = nRT', pts: pi, color: css('--mute')}, {label: 'van der Waals', pts: pr, color: css('--hot')}], [{label: t('pReal'), x: V * 1000, y: Pr / 1000}], `${t('V')} (L)`, `${t('P')} (kPa)`);
    rChart.options.scales.y.max = Pi * 4 / 1000; rChart.options.scales.y.min = 0; rChart.update('none');
  });
}

/* ---- CSV export of the current process ---- */
function csv() {
  if (!lastProc) return;
  const r = lastProc, rows = ['# ThermoLab process export', `# type=${r.ty}; n=${r.n} mol; gamma=${f(r.g)}; W=${r.W} J; Q=${r.Q} J; dU=${r.dU} J; dS=${r.dS} J/K`, 'V_L,P_kPa,T_K,S_rel_J_per_K',
    ...r.path.map(p => [p.V * 1000, p.P / 1000, p.T, p.S].join(','))];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.join('\n')], {type: 'text/csv'})); a.download = `thermolab-${r.ty}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

/* ---- Init ---- */
fld('rFields', 'rn', 'n', 'mol', 0.1, 5, 1, 0.1, renderReal); fld('rFields', 'rT', 'T', 'K', 100, 700, 300, 1, renderReal); fld('rFields', 'rV', 'V', 'L', 0.2, 20, 1, 0.1, renderReal);
kv('rOut', [['rO_Pi', 'pIdeal', '[kPa]'], ['rO_Pr', 'pReal', '[kPa]'], ['rO_dev', 'dev', '[%]'], ['rO_Z', 'Z', '']]);
$('rGas').addEventListener('change', renderReal);
Object.assign(ACT, {csv});
$('lang').addEventListener('change', renderReal);
$('themeBtn').addEventListener('click', () => { if (rChart) { rChart.destroy(); rChart = null; } renderReal(); });
buildPiston('pistP', 'pst_p'); buildPiston('pistC', 'pst_c');
$('spd').addEventListener('change', e => { SPEED = parseFloat(e.target.value); });
$('pSeek').addEventListener('input', e => pAnim.seek(e.target.value / 1000));
$('cSeek').addEventListener('input', e => cAnim.seek(e.target.value / 1000));
applyLang(lang); renderReal();
