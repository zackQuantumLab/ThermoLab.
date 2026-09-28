// Run: node tests/phys.test.js  — checks the physics engine (no browser needed).
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync(__dirname + '/../script.js', 'utf8');
const R = 8.314462618;
const Phys = new Function('R', src.slice(src.indexOf('const Phys'), src.indexOf('/* ============ Helpers')) + '; return Phys;')(R);
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
let n = 0; const test = (name, fn) => { fn(); n++; console.log('ok -', name); };
for (const g of [5 / 3, 7 / 5]) for (const ty of ['iso', 'isb', 'isc', 'adi']) test(`first law ΔU = Q − W (${ty}, γ=${g.toFixed(2)})`, () => {
  const r = Phys.process(ty, {n: 2, T1: 300, T2: 450, V1: 0.01, V2: ty === 'isc' ? 0.01 : 0.03, g});
  close(r.dU, r.Q - r.W);
});
test('isothermal: ΔU = 0, W = nRT ln(V2/V1)', () => { const r = Phys.process('iso', {n: 1, T1: 300, V1: 0.01, V2: 0.03, g: 5 / 3}); close(r.dU, 0); close(r.W, R * 300 * Math.log(3)); });
test('adiabatic: Q = 0, ΔS = 0, PV^γ constant', () => { const g = 7 / 5, r = Phys.process('adi', {n: 1, T1: 300, V1: 0.01, V2: 0.02, g}); close(r.Q, 0); close(r.dS, 0); close(r.P1 * Math.pow(0.01, g), r.P2 * Math.pow(0.02, g), 1e-9); });
test('isochoric: W = 0', () => close(Phys.process('isc', {n: 1, T1: 300, T2: 600, V1: 0.01, V2: 0.01, g: 5 / 3}).W, 0));
test('Carnot: η = 1 − TC/TH and Wnet = QH − QC', () => { const c = Phys.carnot({n: 1, TH: 600, TC: 300, V1: 0.002, V2: 0.006, g: 5 / 3}); close(c.eta, 0.5, 1e-9); close(c.Wnet, c.QH - c.QC); close(c.QC / c.QH, 300 / 600, 1e-9); });
console.log(`\n${n} tests passed`);

// ---- cycles ----
const cs = fs.readFileSync(__dirname + '/../cycles.js', 'utf8');
const { cycle, CYC } = new Function('R', 'Phys', cs.slice(cs.indexOf('/*PURE*/'), cs.indexOf('/*ENDPURE*/')) + '; return {cycle, CYC};')(R, Phys);
const base = {n: 1, T1: 300, P1: 1e5}, g = 7 / 5;
test('Otto η = 1 − r^(1−γ)', () => close(cycle(CYC.otto, {r: 8, Tmax: 1800}, {...base, g}).eta, 1 - Math.pow(8, 1 - g), 1e-9));
test('Brayton η = 1 − rp^((1−γ)/γ)', () => close(cycle(CYC.bray, {rp: 8, Tmax: 1400}, {...base, g}).eta, 1 - Math.pow(8, (1 - g) / g), 1e-9));
test('Diesel matches closed-form efficiency', () => { const r = 18, Tm = 2000, T2 = 300 * Math.pow(r, g - 1), rho = Tm / T2; close(cycle(CYC.diesel, {r, Tmax: Tm}, {...base, g}).eta, 1 - Math.pow(r, 1 - g) * (Math.pow(rho, g) - 1) / (g * (rho - 1)), 1e-9); });
test('Stirling with regenerator equals Carnot', () => close(cycle(CYC.stir, {r: 3, Tmax: 800}, {...base, g}).reg, 1 - 300 / 800, 1e-9));
for (const k of Object.keys(CYC)) test(`cycle ${k}: closed loop, W = Qin − Qout`, () => {
  const d = CYC[k], p = {}; d.par.forEach(a => { p[a[0]] = a[5]; });
  const c = cycle(d, p, {...base, T1: d.T1 || 300, g}); close(c.W, c.Qin - c.Qout, 1e-9);
  const a = c.all[0], b = c.all[c.all.length - 1]; close(b.V, a.V, 1e-9); close(b.T, a.T, 1e-9); close(b.S, 0, 1e-9);
});
test('polytropic k=γ equals adiabatic, k=1 equals isothermal', () => { const a = {n: 1, T1: 300, V1: .01, V2: .03, g}, x = Phys.process('pol', {...a, k: g}), y = Phys.process('adi', a); close(x.W, y.W, 1e-9); close(Phys.process('pol', {...a, k: 1}).W, Phys.process('iso', a).W, 1e-9); });
test('free expansion: Q = W = ΔU = 0, ΔS = nR ln(V2/V1)', () => { const r = Phys.process('free', {n: 1, T1: 300, V1: .01, V2: .02, g}); close(r.W + r.Q + r.dU, 0); close(r.dS, R * Math.log(2)); });
console.log(`\n${n} tests passed in total`);
