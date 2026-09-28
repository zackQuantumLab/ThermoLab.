'use strict';
/* ThermoLab — Real Engine: crank-angle-resolved single-zone 4-stroke model.
   Slider-crank geometry, Wiebe heat release, Woschni heat loss, variable γ(T), gas exchange (valves), friction. */
/*PURE*/
const RS = 287, LHV = 44e6, AFR = 14.7;
function engineSim(o) {
  const {rpm, load, adv, r, B, S, ncyl, boost, diesel} = o, a = S / 2, l = 3.27 * a, A = Math.PI * B * B / 4, Vd = A * S, Vc = Vd / (r - 1), Sp = 2 * S * rpm / 60, rad = Math.PI / 180, d = 0.5, L = load / 100;
  const IVO = 700, IVC = 220, EVO = 485, EVC = 740;
  const Vf = th => { const c = th * rad; return Vc + A * (l + a - a * Math.cos(c) - Math.sqrt(l * l - a * a * Math.sin(c) ** 2)); };
  const Pint = diesel ? 100 + boost * L : (100 + boost) * (0.28 + 0.72 * L), Pexh = 105 + 25 * Math.pow(rpm / 6000, 2) * Pint / 100;
  const ts = diesel ? 360 - adv + 6 + rpm / 600 : 360 - adv, dur = diesel ? 55 + rpm / 200 : 40 + rpm / 250;
  const wb = th => th <= ts ? 0 : th >= ts + dur ? 1 : 1 - Math.exp(-5 * Math.pow((th - ts) / dur, 3));   // Wiebe, m = 2
  function run(burn) {
    const N = 720 / d, P_ = [], T_ = []; let P = Pint, T = 330, m = 0, Qt = 0, Ql = 0, mf = 0, Tivc = 330;
    for (let i = 0; i <= N; i++) {
      const th = i * d, V = Vf(th); P_.push(P); T_.push(T); if (i === N) break;
      const th2 = th + d, V2 = Vf(th2), dV = V2 - V, sn = Math.abs(Math.sin(th2 * rad));
      if (th2 < IVC) { P = Pint * (1 - 0.15 * Math.pow(rpm / 6000, 2) * sn); T = 330; }
      else if (th2 <= EVO) {
        if (m === 0) { m = P * 1e3 * V / (RS * T); Tivc = T; mf = burn ? m / (AFR * (diesel ? 1.35 / Math.max(L, 0.1) : 1)) : 0; Qt = mf * LHV * 0.97; }
        const Tg = P * 1e3 * V / (m * RS), gam = Math.max(1.22, 1.4 - 8e-5 * (Tg - 300));
        const dQc = Qt * (wb(th2) - wb(th)), h = 3.26 * Math.pow(B, -0.2) * Math.pow(P, 0.8) * Math.pow(Tg, -0.55) * Math.pow(2.28 * Sp, 0.8);
        const dQl = 2.4 * h * (2 * A + Math.PI * B * V / A) * (Tg - 450) * d / (6 * rpm); Ql += dQl;
        P += (gam - 1) * (dQc - dQl) / V / 1e3 - gam * P * dV / V; T = P * 1e3 * V2 / (m * RS);
      } else if (th2 <= 540) { const Pn = P + (Pexh - P) * (1 - Math.exp(-d / 10)); T *= Math.pow(Pn / P, 0.22); P = Pn; }
      else if (th2 < IVO) { P = Pexh * (1 + 0.08 * Math.pow(rpm / 6000, 2) * sn); T = 500 + (T - 500) * 0.995; }
      else { const x = (th2 - IVO) / (720 - IVO); P = Pexh + (Pint - Pexh) * x; T = T + (330 - T) * x * 0.3; }
    }
    return {P: P_, T: T_, m, mf, Qt, Ql, Tivc};
  }
  const c = run(true), mo = run(false), N = 720 / d, V = []; for (let i = 0; i <= N; i++) V.push(Vf(i * d));
  let Wg = 0, Wp = 0;
  for (let i = 0; i < N; i++) { const th = i * d, w = (c.P[i] + c.P[i + 1]) / 2 * 1e3 * (V[i + 1] - V[i]); if (th >= 180 && th < 540) Wg += w; else Wp += w; }
  const Wn = Wg + Wp, imep = Wn / Vd / 1e3, fmep = 30 + 4.5 * Sp, bmep = imep - fmep, pc = Wn * rpm / 120 * ncyl / 1e3, pb = bmep * 1e3 * Vd * rpm / 120 * ncyl / 1e3;
  const Qf = c.mf * LHV, gam0 = 1.4, rho = 1 + c.Qt / (c.m * 1005 * c.Tivc * Math.pow(r, gam0 - 1));
  let pk = 0, pkA = 0; for (let i = 0; i <= N; i++) { const th = i * d; if (th >= 300 && th <= 480 && c.P[i] > pk) { pk = c.P[i]; pkA = th; } }
  let Tpk = 0; for (const x of c.T) Tpk = Math.max(Tpk, x);
  const fuel = c.mf * ncyl * rpm / 120 * 1e3;   // g/s
  const at = (arr, k) => arr.filter((_, i) => i % 2 === 0);
  return {V: at(V), P: at(c.P), T: at(c.T), Pm: at(mo.P), Vd, Vc, A, a, l, ts, dur, wb, IVO, IVC, EVO, EVC, Pint, Pexh, Wg, Wp, Wn, imep, fmep, bmep, pc, pb, Tpk, pk, pkA,
    etaG: Wg / Qf, etaN: Wn / Qf, etaB: pb / (Qf * ncyl * rpm / 120 / 1e3), etaOtto: 1 - Math.pow(r, 1 - gam0), etaDsl: 1 - Math.pow(r, 1 - gam0) * (Math.pow(rho, gam0) - 1) / (gam0 * (rho - 1)),
    loss: c.Ql / (c.Qt || 1), fuel, bsfc: pb > 0 ? fuel * 3600 / pb : NaN, tq: pb * 1e3 / (2 * Math.PI * rpm / 60), lam: diesel ? 1.35 / Math.max(L, 0.1) : 1};
}
/*ENDPURE*/

/* ---- text ---- */
Object.assign(TR.en, {n_eng: 'Real Engine', engP: 'Engine', eP_pet: 'Petrol 1.6 L (4 cyl)', eP_spo: 'Sport petrol (high revs)', eP_tdi: 'Turbo diesel 2.0 L', eP_trk: 'Truck diesel 9.5 L (6 cyl)', eP_mot: 'Motorbike single 500 cc', rpm: 'Engine speed', load: 'Load (throttle / fuel)', adv: 'Spark / injection advance (° before TDC)', bore: 'Bore', strk: 'Stroke', ncyl: 'Cylinders', boost: 'Turbo boost (above 100 kPa)',
  s_int: 'Intake', s_cmp: 'Compression', s_pow: 'Power', s_exh: 'Exhaust', imep: 'IMEP (indicated)', bmep: 'BMEP (brake)', pkW: 'Brake power', tq: 'Brake torque', ei: 'Indicated efficiency (gross)', eb: 'Brake efficiency', eo: 'Air-standard ideal (Otto / Diesel)', pk: 'Peak pressure', pkA: 'Peak pressure angle (° after TDC)', tpk: 'Peak gas temperature', hl: 'Heat lost to walls', fuel: 'Fuel flow', sfc: 'BSFC', lam: 'Air-fuel ratio λ', pump: 'Pumping work (per cycle)',
  reNote: 'Crank-angle simulation of a real 4-stroke engine over 720°: slider-crank piston motion, Wiebe combustion, Woschni wall heat loss, variable γ(T), valve timing, pumping and friction losses. The dashed curve is the motoring pressure (no fuel). Real efficiency is well below the ideal cycle because of heat loss, finite burn time, pumping and friction. Time runs in slow motion.', e_eng: 'These engine settings give no valid result.', slow: 'Slow-motion factor'});
Object.assign(TR.fr, {n_eng: 'Moteur réel', engP: 'Moteur', eP_pet: 'Essence 1,6 L (4 cyl.)', eP_spo: 'Essence sportif (hauts régimes)', eP_tdi: 'Diesel turbo 2,0 L', eP_trk: 'Diesel poids lourd 9,5 L (6 cyl.)', eP_mot: 'Moto monocylindre 500 cc', rpm: 'Régime moteur', load: 'Charge (papillon / carburant)', adv: 'Avance allumage / injection (° avant PMH)', bore: 'Alésage', strk: 'Course', ncyl: 'Cylindres', boost: 'Suralimentation (au-dessus de 100 kPa)',
  s_int: 'Admission', s_cmp: 'Compression', s_pow: 'Détente', s_exh: 'Échappement', imep: 'PMI (indiquée)', bmep: 'PME (effective)', pkW: 'Puissance effective', tq: 'Couple effectif', ei: 'Rendement indiqué (brut)', eb: 'Rendement effectif', eo: 'Cycle idéal à air (Otto / Diesel)', pk: 'Pression maximale', pkA: 'Angle de pression max. (° après PMH)', tpk: 'Température maximale du gaz', hl: 'Chaleur perdue aux parois', fuel: 'Débit de carburant', sfc: 'Consommation spécifique', lam: 'Richesse λ (air/carburant)', pump: 'Travail de pompage (par cycle)',
  reNote: 'Simulation par angle de vilebrequin d’un vrai moteur 4 temps sur 720° : cinématique bielle-manivelle, combustion de Wiebe, pertes thermiques de Woschni, γ(T) variable, distribution, pompage et frottements. La courbe en pointillés est la pression sans combustion. Le rendement réel est bien inférieur au cycle idéal (pertes thermiques, combustion non instantanée, pompage, frottements). Le temps est ralenti.', e_eng: 'Ces réglages ne donnent pas de résultat valide.', slow: 'Facteur de ralenti'});
Object.assign(TR.ar, {n_eng: 'المحرك الحقيقي', engP: 'المحرك', eP_pet: 'بنزين 1.6 لتر (4 أسطوانات)', eP_spo: 'بنزين رياضي (سرعة عالية)', eP_tdi: 'ديزل بشاحن توربيني 2.0 لتر', eP_trk: 'ديزل شاحنة 9.5 لتر (6 أسطوانات)', eP_mot: 'دراجة نارية أحادية 500 سم³', rpm: 'سرعة المحرك', load: 'الحمل (الخانق / الوقود)', adv: 'تقديم الشرارة / الحقن (° قبل PMH)', bore: 'القطر', strk: 'الشوط', ncyl: 'عدد الأسطوانات', boost: 'الشحن التوربيني (فوق 100 kPa)',
  s_int: 'السحب', s_cmp: 'الانضغاط', s_pow: 'القدرة', s_exh: 'العادم', imep: 'الضغط الفعال البياني', bmep: 'الضغط الفعال الفرملي', pkW: 'القدرة الفعلية', tq: 'العزم الفعلي', ei: 'المردود البياني (إجمالي)', eb: 'المردود الفعلي', eo: 'الدورة المثالية (أوتو / ديزل)', pk: 'أقصى ضغط', pkA: 'زاوية أقصى ضغط (° بعد PMH)', tpk: 'أقصى درجة حرارة للغاز', hl: 'الحرارة الضائعة في الجدران', fuel: 'تدفق الوقود', sfc: 'الاستهلاك النوعي', lam: 'نسبة الهواء/الوقود λ', pump: 'شغل الضخ (لكل دورة)',
  reNote: 'محاكاة بزاوية عمود المرفق لمحرك رباعي الأشواط حقيقي على 720°: حركة المكبس والذراع والمرفق، احتراق فيبي، ضياع وودشني الحراري، γ(T) متغيرة، توقيت الصمامات، الضخ والاحتكاك. المنحنى المتقطع هو الضغط بدون احتراق. المردود الحقيقي أقل بكثير من الدورة المثالية. الزمن مبطأ.', e_eng: 'هذه الإعدادات لا تعطي نتيجة صالحة.', slow: 'معامل التبطيء'});

/* ---- UI ---- */
const PRE = {pet: {rpm: 3000, load: 80, adv: 22, r: 10.5, B: 79, S: 81, n: 4, boost: 0, dsl: 0}, spo: {rpm: 6500, load: 100, adv: 30, r: 12.5, B: 82, S: 75, n: 4, boost: 0, dsl: 0},
  tdi: {rpm: 2200, load: 75, adv: 8, r: 17.5, B: 85, S: 90, n: 4, boost: 90, dsl: 1}, trk: {rpm: 1400, load: 90, adv: 10, r: 16, B: 120, S: 140, n: 6, boost: 120, dsl: 1}, mot: {rpm: 5000, load: 70, adv: 25, r: 9.5, B: 88, S: 82, n: 1, boost: 0, dsl: 0}};
let E = null, ec = {}, reDsl = 0;
const RCOL = ['#1f5fbf', '#7048e8', '#d9480f', '#0f8b5f'];
function buildRE() {
  $('reView').innerHTML = `<svg id="re" class="pist" viewBox="0 0 260 330" role="img" aria-label="engine">
  <rect id="re_blk" x="85" y="110" width="90" height="122" class="cyl"/><rect id="re_gas" x="95" y="110" width="70" height="30"/><ellipse id="re_fl" cx="130" cy="120" rx="4" ry="4" fill="#ff7a00" opacity="0"/>
  <rect id="re_hd" x="85" y="76" width="90" height="34" rx="3" fill="#8a94a3"/>
  <g id="re_vi"><line x1="106" y1="-28" x2="106" y2="0" class="rod" stroke-width="2"/><rect x="99" y="0" width="14" height="4" fill="#1f5fbf"/></g>
  <g id="re_ve"><line x1="154" y1="-28" x2="154" y2="0" class="rod" stroke-width="2"/><rect x="147" y="0" width="14" height="4" fill="#0f8b5f"/></g>
  <g id="re_pl"><rect x="126" y="-40" width="8" height="40" fill="#e9ecef" stroke="var(--ink)"/><circle id="re_sp" cx="130" cy="4" r="6" fill="#ffe066" opacity="0"/><path id="re_ij" d="M130 2 L116 26 M130 2 L130 30 M130 2 L144 26" stroke="#ff7a00" stroke-width="3" opacity="0"/></g>
  <path id="re_ai" d="M40 92 h44 m-9 -6 l9 6 l-9 6" stroke="#1f5fbf" stroke-width="3" fill="none" opacity="0" stroke-dasharray="7 5"/>
  <path id="re_ex" d="M176 92 h44 m-9 -6 l9 6 l-9 6" stroke="#0f8b5f" stroke-width="3" fill="none" opacity="0" stroke-dasharray="7 5"/>
  <rect id="re_pis" x="95" y="132" width="70" height="22" rx="3" fill="var(--ink)" opacity=".85"/>
  <line id="re_rod" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><circle id="re_pin" r="4" fill="var(--card)" stroke="var(--ink)"/>
  <circle cx="130" cy="265" r="38" class="cyl" fill="none"/><line id="re_arm" x1="130" y1="265" stroke="#f97316" stroke-width="8" stroke-linecap="round"/><circle id="re_cp" r="6" fill="#f97316"/><circle cx="130" cy="265" r="7" fill="var(--ink)"/>
  <text id="re_t" x="130" y="322" text-anchor="middle"></text></svg>`;
  $('reStk').innerHTML = ['s_int', 's_cmp', 's_pow', 's_exh'].map(k => `<span data-i18n="${k}"></span>`).join(''); applyStatic($('reStk'));
}
const lerp = (arr, x) => { const i = Math.min(Math.floor(x), arr.length - 2), u = x - i; return arr[i] + (arr[i + 1] - arr[i]) * u; };
const lift = (th, a, b) => { const T = ((th - a) % 720 + 720) % 720, W = ((b - a) % 720 + 720) % 720; return T < W ? Math.pow(Math.sin(Math.PI * T / W), 2) : 0; };
const setR = (k, a) => { const e = $('re_' + k); for (const n in a) e.setAttribute(n, a[n]); };
const reAnim = Anim(16, true, p => {
  $('reSeek').value = p * 1000; if (!E) return;
  const th = p * 720, P = lerp(E.P, th), T = lerp(E.T, th), V = lerp(E.V, th), xb = E.wb(th), r = 26, Lr = 85, cy = 265, ph = th * Math.PI / 180;
  const xp = r * Math.cos(ph) + Math.sqrt(Lr * Lr - r * r * Math.sin(ph) ** 2), pinY = cy - xp, crown = pinY - 22, hc = Math.max(4, 52 / (reCR - 1)), yh = 132 - hc;
  const cx = 130 + r * Math.sin(ph), cpy = cy - r * Math.cos(ph), pulse = .6 + .3 * Math.sin(th * 3), vi = lift(th, E.IVO, E.IVC), ve = lift(th, E.EVO, E.EVC), tf = Math.min(1, (T - 300) / 2200);
  const burning = th > E.ts && th < E.ts + E.dur * 1.15 && th < E.EVO, inj = reDsl && th > 360 - reAdv && th < E.ts + E.dur * .6;
  setR('blk', {y: yh, height: 232 - yh}); setR('gas', {y: yh, height: Math.max(1, crown - yh), fill: `hsl(${220 - 215 * tf},80%,55%)`}); setR('hd', {y: yh - 34});
  setR('vi', {transform: `translate(0 ${yh + 10 * vi})`}); setR('ve', {transform: `translate(0 ${yh + 10 * ve})`}); setR('pl', {transform: `translate(0 ${yh})`});
  const gh = Math.max(1, crown - yh);
  setR('fl', {cy: yh + gh / 2, rx: reDsl ? 34 * Math.min(1, xb * 3) : 4 + 30 * Math.sqrt(xb), ry: gh / 2, opacity: burning ? (reDsl ? .35 + .3 * pulse : .75) : 0});
  setR('sp', {opacity: !reDsl && Math.abs(th - E.ts) < 6 ? 1 : 0}); setR('ij', {opacity: inj ? 1 : 0});
  setR('ai', {opacity: vi > .05 && th < 400 ? 1 : 0, 'stroke-dashoffset': -p * 900, transform: `translate(0 ${yh - 76})`}); setR('ex', {opacity: ve > .05 ? 1 : 0, 'stroke-dashoffset': -p * 900, transform: `translate(0 ${yh - 76})`});
  setR('pis', {y: crown}); setR('rod', {x1: 130, y1: pinY, x2: cx, y2: cpy}); setR('pin', {cx: 130, cy: pinY}); setR('arm', {x2: cx, y2: cpy}); setR('cp', {cx, cy: cpy});
  $('re_t').textContent = `θ = ${Math.round(th)}° · P = ${f(P / 100)} bar · T = ${f(T)} K`;
  const k = Math.min(3, Math.floor(th / 180)); $('reStk').querySelectorAll('span').forEach((s, i) => s.classList.toggle('now', i === k));
  mv(ec.pt, th, P); mv(ec.pv, V * 1000, P);
  $('reLive').textContent = `${t('slow')}: ${f(16 / (120 / reRpm))}×`;
});
let reCR = 10.5, reAdv = 22, reRpm = 3000;
function mkE() { Object.values(ec).forEach(c => c.destroy()); ec = {pt: mkChart('rePT', '°', 'kPa'), pv: mkChart('rePV', 'L', 'kPa')}; }
function setP(k) {
  const q = PRE[k]; if (!q) return; reDsl = q.dsl;
  [['reRpm', q.rpm], ['reLoad', q.load], ['reAdv', q.adv], ['reCR', q.r], ['reB', q.B], ['reS', q.S], ['reN', q.n], ['reBoost', q.boost]].forEach(([i, v]) => { $(i).value = v; $(i + '_r').value = v; });
}
function runE() {
  guard('err_eng', () => {
    const g = id => num(id, 'e_num'); reCR = g('reCR'); reAdv = g('reAdv'); reRpm = g('reRpm');
    const o = {rpm: reRpm, load: g('reLoad'), adv: reAdv, r: reCR, B: g('reB') / 1000, S: g('reS') / 1000, ncyl: Math.max(1, Math.round(g('reN'))), boost: parseFloat($('reBoost').value) || 0, diesel: reDsl};
    E = engineSim(o); if (![E.imep, E.pk, E.Tpk].every(isFinite)) throw new Error('e_eng');
    const rows = {rO_imep: [E.imep, 'kPa'], rO_bmep: [E.bmep, 'kPa'], rO_pw: [E.pb, 'kW'], rO_tq: [E.tq, 'N·m'], rO_ei: [E.etaG * 100, '%'], rO_eb: [E.etaB * 100, '%'], rO_eo: [(reDsl ? E.etaDsl : E.etaOtto) * 100, '%'], rO_pk: [E.pk / 100, 'bar'], rO_pkA: [E.pkA - 360, '°'], rO_tpk: [E.Tpk, 'K'], rO_hl: [E.loss * 100, '%'], rO_fuel: [E.fuel, 'g/s'], rO_sfc: [E.bsfc, 'g/kWh'], rO_lam: [E.lam, ''], rO_pump: [E.Wp, 'J']};
    for (const k in rows) setv(k, isFinite(rows[k][0]) ? f(rows[k][0]) : '—');
    if (!ec.pt) mkE();
    const cut = (a, b) => E.P.slice(a, b + 1).map((y, i) => ({x: (E.V[a + i]) * 1000, y})), names = ['s_int', 's_cmp', 's_pow', 's_exh'];
    setChart(ec.pt, [{label: 'P (θ)', pts: E.P.map((y, i) => ({x: i, y})), color: '#d9480f'}, {label: '— motoring', pts: E.Pm.map((y, i) => ({x: i, y})), color: css('--mute')}], [], 'θ (° CA, 0 = TDC intake · 360 = TDC firing)', `${t('P')} (kPa)`);
    setChart(ec.pv, [0, 1, 2, 3].map(i => ({label: t(names[i]), pts: cut(i * 180, i * 180 + 180), color: RCOL[i]})), [], `${t('V')} (L)`, `${t('P')} (kPa)`);
    ec.pt.options.scales.x.max = 720; ec.pt.update('none'); reAnim.redraw();
  });
}
Object.assign(ACT, {reStart: () => reAnim.start(), rePause: () => reAnim.pause(), reReset: () => reAnim.reset()});
document.querySelectorAll('#v-eng [data-act]').forEach(b => b.addEventListener('click', () => ACT[b.dataset.act]()));
const engFields = [['reRpm', 'rpm', 'rpm', 600, 8000, 3000, 50], ['reLoad', 'load', '%', 5, 100, 80, 1], ['reAdv', 'adv', '°', 1, 45, 22, 1], ['reCR', 'rcomp', '', 6, 22, 10.5, .5], ['reB', 'bore', 'mm', 50, 140, 79, 1], ['reS', 'strk', 'mm', 50, 150, 81, 1], ['reN', 'ncyl', '', 1, 12, 4, 1], ['reBoost', 'boost', 'kPa', 0, 200, 0, 5]];
engFields.forEach(a => fld('reFields', a[0], a[1], a[2], a[3], a[4], a[5], a[6], runE));
$('reP').innerHTML = Object.keys(PRE).map(k => `<option value="${k}" data-i18n="eP_${k}"></option>`).join('');
$('reP').addEventListener('change', () => { setP($('reP').value); reAnim.reset(); runE(); });
$('reSeek').addEventListener('input', e => reAnim.seek(e.target.value / 1000));
$('lang').addEventListener('change', runE); $('themeBtn').addEventListener('click', () => { mkE(); runE(); });
kv('reOut', [['rO_imep', 'imep', '[kPa]'], ['rO_bmep', 'bmep', '[kPa]'], ['rO_pw', 'pkW', '[kW]'], ['rO_tq', 'tq', '[N·m]'], ['rO_ei', 'ei', '[%]'], ['rO_eb', 'eb', '[%]'], ['rO_eo', 'eo', '[%]'], ['rO_pk', 'pk', '[bar]'], ['rO_pkA', 'pkA', '[°]'], ['rO_tpk', 'tpk', '[K]'], ['rO_hl', 'hl', '[%]'], ['rO_fuel', 'fuel', '[g/s]'], ['rO_sfc', 'sfc', '[g/kWh]'], ['rO_lam', 'lam', ''], ['rO_pump', 'pump', '[J]']]);
buildRE(); applyLang(lang); setP('pet');
runE();
