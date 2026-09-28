'use strict';
/* ThermoLab — physics (Phys), i18n (TR), UI logic, chart rendering.
   Conventions: W = work done BY the gas; Q = heat added TO the gas; ΔU = Q − W. SI units internally. */
const R = 8.314462618;              // J/(mol·K)
const $ = id => document.getElementById(id);
const f = x => (x === 0 || !isFinite(x)) ? String(x) : (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-3) ? x.toExponential(3) : String(Number(x.toPrecision(5)));
const inp = x => String(Number(x.toPrecision(6)));

/* ============ i18n: add a language by adding one object here + one <option> in index.html ============ */
const TR = {
en: {
 n_dash:'Dashboard',n_gas:'Ideal Gas',n_proc:'Processes',n_carnot:'Carnot Cycle',n_pv:'P-V Diagram',n_calc:'Calculations',n_about:'About',
 sub:'Interactive Thermodynamics Simulator',tag:'Explore thermodynamic processes, visualize P-V diagrams, and understand energy transfer.',
 conv:'Sign convention: W is work done BY the gas (W > 0 on expansion). Q is heat added TO the gas (Q > 0 when absorbed). ΔU = Q − W. All calculations use SI units and kelvin, for an ideal gas with constant heat capacities.',
 menu:'Menu',theme:'Toggle light / dark theme',language:'Language',
 T:'Temperature',P:'Pressure',V:'Volume',n:'Amount of substance',Rn:'Gas constant',U:'Internal energy',W:'Work',Q:'Heat',eta:'Efficiency',dU:'Change in internal energy',dS:'Change in entropy',
 dashNote:'W and Q come from the process selected in the Processes tab; efficiency comes from the Carnot tab. U = nCvT uses the gas selected here.',
 eqUsed:'Equation used: P = nRT / V (ideal gas law). Editing P changes V at fixed n and T.',gasType:'Gas type',mono:'Monatomic gas (γ = 5/3)',di:'Diatomic gas (γ = 7/5)',
 solve:'Calculate',given:'Given values',formula:'Formula',subst:'Substitution',result:'Result',
 unitNote:'Units can be converted freely, but every calculation is done in SI units (Pa, m³, K, mol). Celsius is converted first: T[K] = T[°C] + 273.15.',
 pType:'Process',iso:'Isothermal',isb:'Isobaric',isc:'Isochoric',adi:'Adiabatic',V1:'Initial volume',V2:'Final volume',T1:'Initial temperature',T2:'Final temperature',P1:'Initial pressure',P2:'Final pressure',
 animate:'Animate process',reset:'Reset',export:'Export PNG',state:'State',
 q1:'What stays constant?',q2:'How does pressure change?',q3:'What happens to temperature?',q4:'Where does the energy go?',q5:'What is the work?',
 x_iso:['Temperature (T).','Pressure falls as volume grows, because PV is constant.','It stays the same.','The internal energy of an ideal gas depends only on T, so ΔU = 0. All the heat absorbed becomes work: Q = W.','W = nRT ln(V₂/V₁).'],
 x_isb:['Pressure (P).','It does not change.','It rises when the gas expands and falls when it is compressed (T ∝ V).','Heat Q goes partly into raising the internal energy (ΔU) and partly into work W: Q = ΔU + W.','W = P(V₂ − V₁).'],
 x_isc:['Volume (V).','It rises with temperature (P ∝ T).','It changes only because heat is added or removed.','The gas does no work, so all the heat changes the internal energy: Q = ΔU.','W = 0, because the volume does not change.'],
 x_adi:['Heat exchange: Q = 0 (no heat flows in or out).','It changes faster than in an isothermal process: PV^γ is constant.','It falls on expansion and rises on compression.','The work comes from the internal energy: W = −ΔU.','W = −ΔU = −nCv(T₂ − T₁).'],
 TH:'Hot reservoir temperature TH',TC:'Cold reservoir temperature TC',cV1:'Volume, state 1',cV2:'Volume after isothermal expansion, state 2',QH:'Heat absorbed QH',QC:'Heat rejected QC',Wn:'Net work Wnet',etaC:'Carnot efficiency 1 − TC/TH',etaS:'Wnet / QH from the cycle',
 start:'Start',pause:'Pause',stg:'Stage',s1:'Isothermal expansion',s2:'Adiabatic expansion',s3:'Isothermal compression',s4:'Adiabatic compression',hot:'Hot reservoir',cold:'Cold reservoir',engine:'Engine',
 flowQH:'QH = heat absorbed from the hot reservoir.',flowQC:'QC = heat rejected to the cold reservoir (shown as a positive magnitude).',flowW:'W = net work done by the engine = QH − QC.',
 carnotInfo:'A Carnot cycle is reversible: two isotherms (stages 1 and 3) and two adiabats (stages 2 and 4). No engine operating between the same two temperatures can be more efficient.',
 f_gas:'Ideal gas law',f_first:'First law (sign convention above)',f_iso:'Isothermal work',f_isb:'Isobaric work',f_adi:'Adiabatic relations',f_cv:'Internal energy (constant Cv)',f_ds:'Entropy change of an ideal gas',f_car:'Carnot efficiency',
 fTitle:'Formulas used',stepsTitle:'Step by step: current process',
 assump:'Assumptions: ideal gas, constant heat capacities, reversible (quasi-static) processes. Monatomic: γ = 5/3, Cv = 3R/2. Diatomic: γ = 7/5, Cv = 5R/2 (vibrations frozen). Cv = R/(γ − 1).',
 tsNote:'Entropy is relative to state 1 (S₁ = 0). It is computed exactly as ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁); for the reversible adiabatic process this gives ΔS = 0. The Carnot cycle is shown on the P-V diagram only.',
 e_T:'Temperature must be greater than 0 K.',e_P:'Pressure must be greater than 0.',e_V:'Volume must be greater than 0.',e_n:'Amount of substance must be greater than 0.',e_num:'Enter a valid number.',
 e_TH:'The hot reservoir must be hotter than the cold one (TH > TC).',e_V2:'In the Carnot cycle, V₂ must be larger than V₁ (isothermal expansion).',e_log:'The logarithm needs a positive volume ratio.',
 aboutT:'An interactive educational simulator for exploring the fundamentals of thermodynamics.',aboutL:['Ideal gases','Thermodynamic processes','P-V diagrams','T-S diagrams','Carnot cycles','Energy calculations'],
 built:'Built as a scientific computing and physics education project.',disc:'ThermoLab is a teaching tool. It is not scientifically validated and must not be used for professional engineering decisions.'},
fr: {
 n_dash:'Tableau de bord',n_gas:'Gaz parfait',n_proc:'Transformations',n_carnot:'Cycle de Carnot',n_pv:'Diagramme P-V',n_calc:'Calculs',n_about:'À propos',
 sub:'Simulateur interactif de thermodynamique',tag:'Explorez les transformations thermodynamiques, visualisez les diagrammes P-V et comprenez les transferts d’énergie.',
 conv:'Convention de signe : W est le travail fourni PAR le gaz (W > 0 en détente). Q est la chaleur reçue PAR le gaz (Q > 0 si absorbée). ΔU = Q − W. Tous les calculs utilisent les unités SI et le kelvin, pour un gaz parfait à capacités thermiques constantes.',
 menu:'Menu',theme:'Basculer thème clair / sombre',language:'Langue',
 T:'Température',P:'Pression',V:'Volume',n:'Quantité de matière',Rn:'Constante des gaz',U:'Énergie interne',W:'Travail',Q:'Chaleur',eta:'Rendement',dU:'Variation d’énergie interne',dS:'Variation d’entropie',
 dashNote:'W et Q proviennent de la transformation choisie dans l’onglet Transformations ; le rendement provient de l’onglet Carnot. U = nCvT utilise le gaz choisi ici.',
 eqUsed:'Équation utilisée : P = nRT / V (loi des gaz parfaits). Modifier P change V à n et T fixés.',gasType:'Type de gaz',mono:'Gaz monoatomique (γ = 5/3)',di:'Gaz diatomique (γ = 7/5)',
 solve:'Calculer',given:'Données',formula:'Formule',subst:'Substitution',result:'Résultat',
 unitNote:'Les unités se convertissent librement, mais tous les calculs sont faits en unités SI (Pa, m³, K, mol). Le Celsius est converti d’abord : T[K] = T[°C] + 273,15.',
 pType:'Transformation',iso:'Isotherme',isb:'Isobare',isc:'Isochore',adi:'Adiabatique',V1:'Volume initial',V2:'Volume final',T1:'Température initiale',T2:'Température finale',P1:'Pression initiale',P2:'Pression finale',
 animate:'Animer la transformation',reset:'Réinitialiser',export:'Exporter en PNG',state:'État',
 q1:'Qu’est-ce qui reste constant ?',q2:'Comment varie la pression ?',q3:'Que devient la température ?',q4:'Où va l’énergie ?',q5:'Quel est le travail ?',
 x_iso:['La température (T).','La pression diminue quand le volume augmente, car PV est constant.','Elle reste identique.','L’énergie interne d’un gaz parfait ne dépend que de T, donc ΔU = 0. Toute la chaleur reçue devient du travail : Q = W.','W = nRT ln(V₂/V₁).'],
 x_isb:['La pression (P).','Elle ne change pas.','Elle augmente lors d’une détente et diminue lors d’une compression (T ∝ V).','La chaleur Q sert en partie à augmenter l’énergie interne (ΔU) et en partie à fournir du travail W : Q = ΔU + W.','W = P(V₂ − V₁).'],
 x_isc:['Le volume (V).','Elle augmente avec la température (P ∝ T).','Elle ne change que si de la chaleur est apportée ou retirée.','Le gaz ne fournit aucun travail : toute la chaleur modifie l’énergie interne, Q = ΔU.','W = 0, car le volume ne change pas.'],
 x_adi:['Les échanges de chaleur : Q = 0 (aucune chaleur n’entre ni ne sort).','Elle varie plus vite qu’en isotherme : PV^γ est constant.','Elle diminue en détente et augmente en compression.','Le travail provient de l’énergie interne : W = −ΔU.','W = −ΔU = −nCv(T₂ − T₁).'],
 TH:'Température de la source chaude TH',TC:'Température de la source froide TC',cV1:'Volume, état 1',cV2:'Volume après la détente isotherme, état 2',QH:'Chaleur absorbée QH',QC:'Chaleur rejetée QC',Wn:'Travail net Wnet',etaC:'Rendement de Carnot 1 − TC/TH',etaS:'Wnet / QH d’après le cycle',
 start:'Démarrer',pause:'Pause',stg:'Étape',s1:'Détente isotherme',s2:'Détente adiabatique',s3:'Compression isotherme',s4:'Compression adiabatique',hot:'Source chaude',cold:'Source froide',engine:'Moteur',
 flowQH:'QH = chaleur absorbée depuis la source chaude.',flowQC:'QC = chaleur rejetée vers la source froide (affichée comme grandeur positive).',flowW:'W = travail net fourni par le moteur = QH − QC.',
 carnotInfo:'Le cycle de Carnot est réversible : deux isothermes (étapes 1 et 3) et deux adiabatiques (étapes 2 et 4). Aucun moteur fonctionnant entre les deux mêmes températures ne peut avoir un meilleur rendement.',
 f_gas:'Loi des gaz parfaits',f_first:'Premier principe (convention ci-dessus)',f_iso:'Travail isotherme',f_isb:'Travail isobare',f_adi:'Relations adiabatiques',f_cv:'Énergie interne (Cv constant)',f_ds:'Variation d’entropie d’un gaz parfait',f_car:'Rendement de Carnot',
 fTitle:'Formules utilisées',stepsTitle:'Pas à pas : transformation actuelle',
 assump:'Hypothèses : gaz parfait, capacités thermiques constantes, transformations réversibles (quasi statiques). Monoatomique : γ = 5/3, Cv = 3R/2. Diatomique : γ = 7/5, Cv = 5R/2 (vibrations gelées). Cv = R/(γ − 1).',
 tsNote:'L’entropie est relative à l’état 1 (S₁ = 0), calculée exactement par ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁) ; pour l’adiabatique réversible on obtient ΔS = 0. Le cycle de Carnot n’est affiché que sur le diagramme P-V.',
 e_T:'La température doit être supérieure à 0 K.',e_P:'La pression doit être supérieure à 0.',e_V:'Le volume doit être supérieur à 0.',e_n:'La quantité de matière doit être supérieure à 0.',e_num:'Saisissez un nombre valide.',
 e_TH:'La source chaude doit être plus chaude que la source froide (TH > TC).',e_V2:'Dans le cycle de Carnot, V₂ doit être supérieur à V₁ (détente isotherme).',e_log:'Le logarithme exige un rapport de volumes positif.',
 aboutT:'Un simulateur pédagogique interactif pour explorer les bases de la thermodynamique.',aboutL:['Gaz parfaits','Transformations thermodynamiques','Diagrammes P-V','Diagrammes T-S','Cycles de Carnot','Calculs d’énergie'],
 built:'Conçu comme un projet de calcul scientifique et d’enseignement de la physique.',disc:'ThermoLab est un outil pédagogique. Il n’est pas validé scientifiquement et ne doit pas servir à des décisions d’ingénierie professionnelles.'},
ar: {
 n_dash:'لوحة القيادة',n_gas:'الغاز المثالي',n_proc:'التحولات',n_carnot:'دورة كارنو',n_pv:'مخطط P-V',n_calc:'الحسابات',n_about:'حول',
 sub:'محاكي تفاعلي للديناميكا الحرارية',tag:'استكشف التحولات الترموديناميكية، وتأمّل مخططات P-V، وافهم انتقال الطاقة.',
 conv:'اصطلاح الإشارة: W هو الشغل الذي ينجزه الغاز (W > 0 عند التمدد). Q هي الحرارة المكتسبة من طرف الغاز (Q > 0 عند الامتصاص). ΔU = Q − W. تستعمل كل الحسابات الوحدات الدولية والكلفن، لغاز مثالي ذي سعات حرارية ثابتة.',
 menu:'القائمة',theme:'تبديل المظهر الفاتح / الداكن',language:'اللغة',
 T:'درجة الحرارة',P:'الضغط',V:'الحجم',n:'كمية المادة',Rn:'ثابت الغازات',U:'الطاقة الداخلية',W:'الشغل',Q:'الحرارة',eta:'المردود',dU:'تغيّر الطاقة الداخلية',dS:'تغيّر الإنتروبيا',
 dashNote:'يأتي W وQ من التحول المختار في تبويب التحولات، ويأتي المردود من تبويب كارنو. يستعمل U = nCvT الغاز المختار هنا.',
 eqUsed:'المعادلة المستعملة: P = nRT / V (قانون الغاز المثالي). تعديل P يغيّر V عند n وT ثابتين.',gasType:'نوع الغاز',mono:'غاز أحادي الذرة (γ = 5/3)',di:'غاز ثنائي الذرة (γ = 7/5)',
 solve:'احسب',given:'المعطيات',formula:'الصيغة',subst:'التعويض',result:'النتيجة',
 unitNote:'يمكن تحويل الوحدات بحرية، لكن تُجرى كل الحسابات بالوحدات الدولية (Pa، m³، K، mol). تُحوَّل درجة السيلسيوس أولاً: T[K] = T[°C] + 273.15.',
 pType:'التحول',iso:'متساوي الحرارة',isb:'متساوي الضغط',isc:'متساوي الحجم',adi:'أديباتي',V1:'الحجم الابتدائي',V2:'الحجم النهائي',T1:'درجة الحرارة الابتدائية',T2:'درجة الحرارة النهائية',P1:'الضغط الابتدائي',P2:'الضغط النهائي',
 animate:'حرّك التحول',reset:'إعادة ضبط',export:'تصدير PNG',state:'الحالة',
 q1:'ما الذي يبقى ثابتاً؟',q2:'كيف يتغير الضغط؟',q3:'ماذا يحدث لدرجة الحرارة؟',q4:'إلى أين تذهب الطاقة؟',q5:'ما هو الشغل؟',
 x_iso:x=>x,
 x_isb:x=>x,x_isc:x=>x,x_adi:x=>x,
 TH:'درجة حرارة المنبع الساخن TH',TC:'درجة حرارة المنبع البارد TC',cV1:'الحجم، الحالة 1',cV2:'الحجم بعد التمدد متساوي الحرارة، الحالة 2',QH:'الحرارة الممتصة QH',QC:'الحرارة المطروحة QC',Wn:'الشغل الصافي Wnet',etaC:'مردود كارنو 1 − TC/TH',etaS:'Wnet / QH من الدورة',
 start:'ابدأ',pause:'إيقاف مؤقت',stg:'المرحلة',s1:'تمدد متساوي الحرارة',s2:'تمدد أديباتي',s3:'انضغاط متساوي الحرارة',s4:'انضغاط أديباتي',hot:'المنبع الساخن',cold:'المنبع البارد',engine:'المحرك',
 flowQH:'QH = الحرارة الممتصة من المنبع الساخن.',flowQC:'QC = الحرارة المطروحة نحو المنبع البارد (تُعرض كقيمة موجبة).',flowW:'W = الشغل الصافي الذي ينجزه المحرك = QH − QC.',
 carnotInfo:'دورة كارنو انعكاسية: تحولان متساويا الحرارة (المرحلتان 1 و3) وتحولان أديباتيان (المرحلتان 2 و4). لا يمكن لأي محرك يعمل بين درجتي الحرارة نفسيهما أن يتفوق عليها في المردود.',
 f_gas:'قانون الغاز المثالي',f_first:'المبدأ الأول (الاصطلاح أعلاه)',f_iso:'الشغل في تحول متساوي الحرارة',f_isb:'الشغل في تحول متساوي الضغط',f_adi:'علاقات التحول الأديباتي',f_cv:'الطاقة الداخلية (Cv ثابتة)',f_ds:'تغيّر إنتروبيا غاز مثالي',f_car:'مردود كارنو',
 fTitle:'الصيغ المستعملة',stepsTitle:'خطوة بخطوة: التحول الحالي',
 assump:'الفرضيات: غاز مثالي، سعات حرارية ثابتة، تحولات انعكاسية (شبه ساكنة). أحادي الذرة: γ = 5/3 وCv = 3R/2. ثنائي الذرة: γ = 7/5 وCv = 5R/2 (الاهتزازات مجمَّدة). Cv = R/(γ − 1).',
 tsNote:'الإنتروبيا نسبية إلى الحالة 1 (S₁ = 0)، وتُحسب بدقة بالعلاقة ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁)؛ وفي التحول الأديباتي الانعكاسي تعطي ΔS = 0. تُعرض دورة كارنو على مخطط P-V فقط.',
 e_T:'يجب أن تكون درجة الحرارة أكبر من 0 K.',e_P:'يجب أن يكون الضغط أكبر من 0.',e_V:'يجب أن يكون الحجم أكبر من 0.',e_n:'يجب أن تكون كمية المادة أكبر من 0.',e_num:'أدخل عدداً صحيحاً صالحاً.',
 e_TH:'يجب أن يكون المنبع الساخن أسخن من البارد (TH > TC).',e_V2:'في دورة كارنو يجب أن يكون V₂ أكبر من V₁ (تمدد متساوي الحرارة).',e_log:'يتطلب اللوغاريتم نسبة حجوم موجبة.',
 aboutT:'محاكٍ تعليمي تفاعلي لاستكشاف أساسيات الديناميكا الحرارية.',aboutL:['الغازات المثالية','التحولات الترموديناميكية','مخططات P-V','مخططات T-S','دورات كارنو','حسابات الطاقة'],
 built:'أُنجز كمشروع في الحساب العلمي وتعليم الفيزياء.',disc:'ThermoLab أداة تعليمية. لم يتم التحقق منه علمياً ولا يجوز استعماله لاتخاذ قرارات هندسية مهنية.'}
};
TR.ar.x_iso=['درجة الحرارة (T).','ينخفض الضغط عندما يزداد الحجم لأن PV ثابت.','تبقى ثابتة.','تعتمد الطاقة الداخلية للغاز المثالي على T فقط، إذن ΔU = 0. كل الحرارة الممتصة تتحول إلى شغل: Q = W.','W = nRT ln(V₂/V₁).'];
TR.ar.x_isb=['الضغط (P).','لا يتغير.','ترتفع عند التمدد وتنخفض عند الانضغاط (T ∝ V).','تذهب الحرارة Q جزئياً لزيادة الطاقة الداخلية (ΔU) وجزئياً إلى الشغل W: Q = ΔU + W.','W = P(V₂ − V₁).'];
TR.ar.x_isc=['الحجم (V).','يزداد مع درجة الحرارة (P ∝ T).','تتغير فقط عند إضافة الحرارة أو سحبها.','لا ينجز الغاز أي شغل، فكل الحرارة تغيّر الطاقة الداخلية: Q = ΔU.','W = 0 لأن الحجم لا يتغير.'];
TR.ar.x_adi=['التبادل الحراري: Q = 0 (لا تدخل حرارة ولا تخرج).','يتغير أسرع من التحول متساوي الحرارة: PV^γ ثابت.','تنخفض عند التمدد وترتفع عند الانضغاط.','يأتي الشغل من الطاقة الداخلية: W = −ΔU.','W = −ΔU = −nCv(T₂ − T₁).'];

let lang = 'en';
const t = k => TR[lang][k] ?? TR.en[k] ?? k;

/* ============ Physics engine (no DOM access) ============ */
const Phys = {
  cv: g => R / (g - 1),
  /** Returns states, W, Q, ΔU, ΔS and a sampled path for one reversible process. Inputs in SI. */
  process(type, {n, T1, T2, V1, V2, g, k}) {
    const cv = Phys.cv(g), M = 100;
    if (!(V2 / V1 > 0)) throw new Error('e_log');
    if (type === 'free') {                          // Joule free expansion: irreversible, only end states exist
      if (V2 <= V1) throw new Error('e_free');
      const path = [V1, V2].map(V => ({V, T: T1, P: n * R * T1 / V, S: n * R * Math.log(V / V1)}));
      return {path, P1: path[0].P, P2: path[1].P, T1, T2: T1, V1, V2, W: 0, Q: 0, dU: 0, dS: path[1].S, cv, n, g};
    }
    let P = null;
    const Tat = {                                   // temperature along the path, fraction x in [0,1]
      iso: () => T1,
      isb: x => { const V = V1 + (V2 - V1) * x; return P * V / (n * R); },
      isc: x => T1 + (T2 - T1) * x,
      adi: x => T1 * Math.pow(V1 / (V1 + (V2 - V1) * x), g - 1),
      pol: x => T1 * Math.pow(V1 / (V1 + (V2 - V1) * x), k - 1)
    }[type];
    if (type === 'isb') P = n * R * T1 / V1;
    const path = [];
    for (let i = 0; i <= M; i++) {
      const x = i / M, V = type === 'isc' ? V1 : V1 + (V2 - V1) * x, T = Tat(x);
      path.push({V, T, P: n * R * T / V, S: type === 'adi' ? 0 : n * cv * Math.log(T / T1) + n * R * Math.log(V / V1)});
    }
    const a = path[0], b = path[M], dT = b.T - a.T;
    let W, Q, dU;
    if (type === 'iso') { dU = 0; W = n * R * T1 * Math.log(V2 / V1); Q = W; }
    else if (type === 'isb') { dU = n * cv * dT; W = a.P * (V2 - V1); Q = dU + W; }
    else if (type === 'isc') { dU = n * cv * dT; W = 0; Q = dU; }
    else if (type === 'pol') { dU = n * cv * dT; W = Math.abs(k - 1) < 1e-9 ? n * R * T1 * Math.log(V2 / V1) : n * R * (a.T - b.T) / (k - 1); Q = dU + W; }
    else { dU = n * cv * dT; W = -dU; Q = 0; }
    return {path, P1: a.P, P2: b.P, T1: a.T, T2: b.T, V1, V2, W, Q, dU, dS: b.S, cv, n, g};
  },
  /** Carnot cycle: 1→2 isothermal exp (TH), 2→3 adiabatic exp, 3→4 isothermal comp (TC), 4→1 adiabatic comp. */
  carnot({n, TH, TC, V1, V2, g}) {
    const k = 1 / (g - 1), V3 = V2 * Math.pow(TH / TC, k), V4 = V1 * Math.pow(TH / TC, k), M = 60, segs = [[], [], [], []];
    const cvv = R / (g - 1), pt = (V, T) => ({V, T, P: n * R * T / V, S: n * cvv * Math.log(T / TH) + n * R * Math.log(V / V1)});
    for (let i = 0; i <= M; i++) {
      const x = i / M;
      let V = V1 + (V2 - V1) * x; segs[0].push(pt(V, TH));
      V = V2 + (V3 - V2) * x; segs[1].push(pt(V, TH * Math.pow(V2 / V, g - 1)));
      V = V3 + (V4 - V3) * x; segs[2].push(pt(V, TC));
      V = V4 + (V1 - V4) * x; segs[3].push(pt(V, TC * Math.pow(V4 / V, g - 1)));
    }
    const QH = n * R * TH * Math.log(V2 / V1), QC = n * R * TC * Math.log(V3 / V4);   // QC: magnitude rejected
    const Wnet = QH - QC;
    return {segs, V3, V4, QH, QC, Wnet, eta: Wnet / QH, etaC: 1 - TC / TH, g, n};
  }
};

/* ============ Helpers ============ */
const guard = (errId, fn) => { const box = $(errId); try { fn(); box.hidden = true; } catch (e) { box.hidden = false; box.textContent = TR[lang][e.message] ? t(e.message) : e.message; } };
const num = (id, err) => { const v = parseFloat($(id).value); if (!isFinite(v)) throw new Error('e_num'); if (v <= 0) throw new Error(err); return v; };
const gam = id => $(id).value === 'm' ? 5 / 3 : 7 / 5;
function fld(parent, id, key, unit, min, max, val, step, cb) {
  const d = document.createElement('div'); d.className = 'fld';
  d.innerHTML = `<label for="${id}"><span data-i18n="${key}"></span> ${unit ? `<i>[${unit}]</i>` : ''}</label><div class="row">${max ? `<input type="range" id="${id}_r" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${id}">` : ''}<input type="number" id="${id}" min="0" step="any" value="${val}" inputmode="decimal"></div>`;
  $(parent).appendChild(d);
  const n = $(id), r = $(id + '_r');
  n.addEventListener('input', () => { if (r) r.value = n.value; cb(id); });
  if (r) r.addEventListener('input', () => { n.value = r.value; cb(id); });
}
function kv(parent, rows) { $(parent).innerHTML = rows.map(([id, key, unit]) => `<div><span><span data-i18n="${key}"></span> <i>${unit}</i></span><b class="num" id="${id}"></b></div>`).join(''); }
const setv = (id, v) => { $(id).textContent = v; };
const interp = (pts, p) => { const i = p * (pts.length - 1), a = Math.floor(i), b = Math.min(a + 1, pts.length - 1), x = i - a, L = k => pts[a][k] + (pts[b][k] - pts[a][k]) * x; return {V: L('V'), P: L('P'), T: L('T'), S: L('S')}; };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ============ Dashboard ============ */
let lastProc = null, lastCar = null;
function dash(src) {
  guard('err_dash', () => {
    const n = num('dn', 'e_n'), T = num('dT', 'e_T'); let V, P;
    if (src === 'dP') { P = num('dP', 'e_P'); V = n * R * T / P; $('dV').value = inp(V); $('dV_r').value = V; }
    else { V = num('dV', 'e_V'); P = n * R * T / V; $('dP').value = inp(P); }
    const g = gam('dGas'), U = n * Phys.cv(g) * T;
    const cards = [['T', `${f(T)} K`, `${f(T - 273.15)} °C`], ['P', `${f(P)} Pa`, `${f(P / 101325)} atm`], ['V', `${f(V)} m³`, `${f(V * 1000)} L`], ['n', `${f(n)} mol`, ''],
      ['Rn', `${f(R)} J/(mol·K)`, ''], ['U', `${f(U)} J`, ''], ['W', lastProc ? `${f(lastProc.W)} J` : '—', ''], ['Q', lastProc ? `${f(lastProc.Q)} J` : '—', ''], ['eta', lastCar ? `${f(lastCar.eta * 100)} %` : '—', '']];
    $('dashCards').innerHTML = cards.map(([k, v, s]) => `<div class="card"><small data-i18n="${k}"></small><b class="num">${v}</b><small class="num">${s}</small></div>`).join('');
    applyStatic($('dashCards'));
  });
}

/* ============ Ideal gas calculator ============ */
const GU = {P: {Pa: 1, kPa: 1e3, bar: 1e5, atm: 101325}, V: {'m³': 1, L: 1e-3}};
const toSI = (k, v, u) => k === 'T' ? (u === 'K' ? v : v + 273.15) : k === 'n' ? v : v * GU[k][u];
const fromSI = (k, v, u) => k === 'T' ? (u === 'K' ? v : v - 273.15) : k === 'n' ? v : v / GU[k][u];
const GD = {P: 101325, V: 24.6, T: 300, n: 1}, GUD = {P: 'Pa', V: 'L', T: 'K', n: 'mol'};
function buildGas() {
  $('gRows').innerHTML = ['P', 'V', 'T', 'n'].map(k => {
    const opts = k === 'T' ? ['K', '°C'] : k === 'n' ? ['mol'] : Object.keys(GU[k]);
    return `<div class="fld"><label for="g_${k}" data-i18n="${k}"></label><div class="row"><input type="number" step="any" id="g_${k}" value="${GD[k]}"><select id="gu_${k}" aria-label="unit">${opts.map(o => `<option ${o === GUD[k] ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div>`;
  }).join('');
  $('gRows').addEventListener('input', gas); $('gRows').addEventListener('change', gas); $('gSolve').addEventListener('change', gas);
}
function gas() {
  guard('err_gas', () => {
    const s = $('gSolve').value, v = {}, err = {P: 'e_P', V: 'e_V', T: 'e_T', n: 'e_n'};
    for (const k of ['P', 'V', 'T', 'n']) {
      $('g_' + k).readOnly = k === s;
      if (k === s) continue;
      const x = parseFloat($('g_' + k).value); if (!isFinite(x)) throw new Error('e_num');
      v[k] = toSI(k, x, $('gu_' + k).value); if (v[k] <= 0) throw new Error(err[k]);
    }
    const F = {P: ['P = nRT / V', v => v.n * R * v.T / v.V, 'Pa', v => `${f(v.n)} × ${f(R)} × ${f(v.T)} / ${f(v.V)}`],
      V: ['V = nRT / P', v => v.n * R * v.T / v.P, 'm³', v => `${f(v.n)} × ${f(R)} × ${f(v.T)} / ${f(v.P)}`],
      T: ['T = PV / (nR)', v => v.P * v.V / (v.n * R), 'K', v => `${f(v.P)} × ${f(v.V)} / (${f(v.n)} × ${f(R)})`],
      n: ['n = PV / (RT)', v => v.P * v.V / (R * v.T), 'mol', v => `${f(v.P)} × ${f(v.V)} / (${f(R)} × ${f(v.T)})`]}[s];
    const r = F[1](v); if (!isFinite(r) || r <= 0) throw new Error('e_num');
    const u = $('gu_' + s).value; $('g_' + s).value = inp(fromSI(s, r, u));
    const given = Object.keys(v).map(k => `${k} = ${f(v[k])} ${{P: 'Pa', V: 'm³', T: 'K', n: 'mol'}[k]}`).join(',  ');
    $('gOut').innerHTML = `<div><b>${t('given')}</b> <span class="num">${given}</span></div><div><b>${t('formula')}</b> <span class="num">PV = nRT → ${F[0]}</span></div><div><b>${t('subst')}</b> <span class="num">${s} = ${F[3](v)}</span></div><div><b>${t('result')}</b> <span class="num">${s} = ${f(r)} ${F[2]}${u !== F[2] ? ` = ${f(fromSI(s, r, u))} ${u}` : ''}</span></div>`;
  });
}

/* ============ Charts ============ */
let charts = {};
const bgPlugin = {id: 'bg', beforeDraw(c) { const x = c.ctx; x.save(); x.globalCompositeOperation = 'destination-over'; x.fillStyle = css('--card'); x.fillRect(0, 0, c.width, c.height); x.restore(); }};
function mkChart(id, xu, yu) {
  const grid = {color: css('--line')}, tk = {color: css('--mute')};
  const c = new Chart($(id), {type: 'scatter', plugins: [bgPlugin], data: {datasets: []}, options: {responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {legend: {labels: {color: css('--ink'), usePointStyle: true}}, tooltip: {callbacks: {label: c => `${c.dataset.label}: ${f(c.parsed.x)} ${c.chart.$cfg.xu}, ${f(c.parsed.y)} ${c.chart.$cfg.yu}`}}},
    scales: {x: {grid, ticks: tk, title: {display: true, color: css('--ink')}}, y: {grid, ticks: tk, title: {display: true, color: css('--ink')}}}}});
  c.$cfg = {xu, yu}; return c;
}
function buildCharts() {
  Object.values(charts).forEach(c => c.destroy());
  charts = {pvS: mkChart('pvS', 'L', 'kPa'), pvB: mkChart('pvB', 'L', 'kPa'), ts: mkChart('tsC', 'J/K', 'K'), car: mkChart('cvC', 'L', 'kPa'), carTS: mkChart('cvT', 'J/K', 'K')};
}
/** segs: [{label, pts:[{x,y}], color}], states: [{label,x,y}]; last dataset is the moving marker. */
function setChart(c, segs, states, xt, yt) {
  const ink = css('--ink');
  c.data.datasets = [...segs.map(s => ({label: s.label, data: s.pts, showLine: true, borderColor: s.color, borderWidth: 3, pointRadius: 0, pointHitRadius: 6, backgroundColor: s.color})),
    ...states.map(s => ({label: s.label, data: [{x: s.x, y: s.y}], pointRadius: 7, backgroundColor: ink, borderColor: css('--card'), borderWidth: 2})),
    {label: '●', data: [], pointStyle: 'rectRot', pointRadius: 9, backgroundColor: css('--hot'), borderColor: '#fff', borderWidth: 2}];
  c.options.scales.x.title.text = xt; c.options.scales.y.title.text = yt; c.update('none');
}
const mv = (c, x, y) => { c.data.datasets[c.data.datasets.length - 1].data = [{x, y}]; c.update('none'); };
const pv = p => ({x: p.V * 1000, y: p.P / 1000});

/* ============ Animation (pausable, time-based) ============ */
let SPEED = 1;
function Anim(dur, loop, cb) {
  let p = 0, run = false, last = 0;
  const step = ts => { if (!run) return; p += (ts - last) / 1000 / dur * SPEED; last = ts; if (p >= 1) { if (loop) p %= 1; else { p = 1; run = false; } } cb(p, run); if (run) requestAnimationFrame(step); };
  return {start() { if (p >= 1) p = 0; if (!run) { run = true; last = performance.now(); requestAnimationFrame(step); cb(p, true); } }, pause() { run = false; cb(p, false); }, reset() { run = false; p = 0; cb(0, false); }, redraw() { cb(p, run); }, seek(x) { p = x; cb(p, run); }};
}

/* ============ Processes ============ */
const PDEF = {pk: 1.3, pn: 1, pT1: 300, pV1: 10, pV2: 30, pT2: 600};
const pAnim = Anim(3, false, p => {
  $('pSeek').value = p * 1000;
  if (!lastProc) return; const q = interp(lastProc.path, p), m = pv(q);
  mv(charts.pvS, m.x, m.y); mv(charts.pvB, m.x, m.y); mv(charts.ts, q.S, q.T);
  if (typeof piston === 'function') piston('pst_p', q, lastProc.path, lastProc.Q > 1e-9 ? '#f97316' : lastProc.Q < -1e-9 ? '#5aa2ff' : '#8a94a3');
});
function proc() {
  guard('err_proc', () => {
    const ty = $('pType').value, g = gam('pGas'), n = num('pn', 'e_n'), T1 = num('pT1', 'e_T'), V1 = num('pV1', 'e_V') / 1000;
    $('pV2').closest('.fld').hidden = ty === 'isc'; $('pT2').closest('.fld').hidden = ty !== 'isc';
    const V2 = ty === 'isc' ? V1 : num('pV2', 'e_V') / 1000, T2 = ty === 'isc' ? num('pT2', 'e_T') : null;
    $('pk').closest('.fld').hidden = ty !== 'pol'; const k = ty === 'pol' ? num('pk', 'e_num') : 1;
    const r = Phys.process(ty, {n, T1, T2, V1, V2, g, k}); lastProc = r; r.ty = ty;
    const o = {pO_P1: r.P1, pO_P2: r.P2, pO_V1: r.V1 * 1000, pO_V2: r.V2 * 1000, pO_T1: r.T1, pO_T2: r.T2, pO_W: r.W, pO_Q: r.Q, pO_dU: r.dU, pO_dS: r.dS};
    for (const k in o) setv(k, f(o[k]));
    const ex = t('x_' + ty);
    $('pExp').innerHTML = '<dl>' + ex.map((s, i) => `<dt>${t('q' + (i + 1))}</dt><dd>${s}</dd>`).join('') + '</dl>';
    const cv = f(r.cv / R) + 'R', dT = `(${f(r.T2)} − ${f(r.T1)})`;
    const st = {iso: [`W = nRT ln(V₂/V₁) = ${f(n)} × ${f(R)} × ${f(T1)} × ln(${f(V2)}/${f(V1)}) = ${f(r.W)} J`, `ΔU = 0 J`, `Q = W = ${f(r.Q)} J`],
      isb: [`P = nRT₁/V₁ = ${f(r.P1)} Pa`, `W = P(V₂ − V₁) = ${f(r.P1)} × (${f(V2)} − ${f(V1)}) = ${f(r.W)} J`, `T₂ = PV₂/(nR) = ${f(r.T2)} K`, `ΔU = nCvΔT = ${f(n)} × ${cv} × ${dT} = ${f(r.dU)} J`, `Q = ΔU + W = ${f(r.Q)} J`],
      isc: [`W = 0 J`, `ΔU = nCvΔT = ${f(n)} × ${cv} × ${dT} = ${f(r.dU)} J`, `Q = ΔU = ${f(r.Q)} J`],
      adi: [`γ = ${f(g)}`, `T₂ = T₁ (V₁/V₂)^(γ−1) = ${f(T1)} × (${f(V1)}/${f(V2)})^${f(g - 1)} = ${f(r.T2)} K`, `ΔU = nCvΔT = ${f(n)} × ${cv} × ${dT} = ${f(r.dU)} J`, `W = −ΔU = ${f(r.W)} J`, `Q = 0 J`],
      pol: [`T₂ = T₁ (V₁/V₂)^(k−1) = ${f(T1)} × (${f(V1)}/${f(V2)})^${f(k - 1)} = ${f(r.T2)} K`, `W = nR(T₁ − T₂)/(k − 1) = ${f(r.W)} J`, `ΔU = nCvΔT = ${f(n)} × ${cv} × ${dT} = ${f(r.dU)} J`, `Q = ΔU + W = ${f(r.Q)} J`],
      free: [`Q = 0 J , W = 0 J , ΔU = 0 J , T₂ = T₁ = ${f(T1)} K`, `P₂ = P₁V₁/V₂ = ${f(r.P2)} Pa`]}[ty];
    $('steps').textContent = st.join('\n') + `\nΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁) = ${f(r.dS)} J/K`;
    drawProc(); pAnim.reset(); dash();
  });
}
function drawProc() {
  if (!lastProc) return; const r = lastProc, path = r.path, a = path[0], b = path[path.length - 1];
  const lab = `${t('state')} `, xy = path.map(pv);
  const states = n => [{label: lab + '1', ...pv(a)}, {label: lab + '2', ...pv(b)}];
  for (const c of [charts.pvS, charts.pvB]) setChart(c, [{label: '1 → 2', pts: xy, color: css('--acc')}], states(), `${t('V')} (L)`, `${t('P')} (kPa)`);
  setChart(charts.ts, [{label: '1 → 2', pts: path.map(p => ({x: p.S, y: p.T})), color: css('--acc')}], [{label: lab + '1', x: a.S, y: a.T}, {label: lab + '2', x: b.S, y: b.T}], 'S − S₁ (J/K)', `${t('T')} (K)`);
  const sx = charts.ts.options.scales.x; sx.suggestedMin = r.ty === 'adi' ? -1 : undefined; sx.suggestedMax = r.ty === 'adi' ? 1 : undefined; charts.ts.update('none');
}
function resetProc() { for (const k in PDEF) { $(k).value = PDEF[k]; if ($(k + '_r')) $(k + '_r').value = PDEF[k]; } $('pType').value = 'iso'; $('pGas').value = 'm'; proc(); }

/* ============ Carnot ============ */
const CDEF = {cTH: 600, cTC: 300, cV1: 2, cV2: 6, cn: 1};
const COL = ['#d9480f', '#7048e8', '#1f5fbf', '#0f8b5f'];
const cAnim = Anim(12, true, (p, run) => {
  $('flow').classList.toggle('paused', !run); $('cSeek').value = p * 1000;
  if (!lastCar) return;
  const all = lastCar.segs.flat(), q = interp(all, Math.min(p, 0.9999)), k = Math.min(3, Math.floor(p * 4));
  mv(charts.car, q.V * 1000, q.P / 1000); mv(charts.carTS, q.S, q.T);
  if (typeof piston === 'function') piston('pst_c', q, all, k === 0 ? '#f97316' : k === 2 ? '#5aa2ff' : '#8a94a3');
  $('stage').textContent = `${t('stg')} ${k + 1}: ${t('s' + (k + 1))}`;
});
function carnot() {
  guard('err_carnot', () => {
    const n = num('cn', 'e_n'), TH = num('cTH', 'e_T'), TC = num('cTC', 'e_T'), V1 = num('cV1', 'e_V') / 1000, V2 = num('cV2', 'e_V') / 1000, g = gam('cGas');
    if (TH <= TC) throw new Error('e_TH'); if (V2 <= V1) throw new Error('e_V2');
    const r = lastCar = Phys.carnot({n, TH, TC, V1, V2, g});
    const o = {cO_QH: r.QH, cO_QC: r.QC, cO_W: r.Wnet, cO_etaC: r.etaC * 100, cO_eta: r.eta * 100, cO_V3: r.V3 * 1000, cO_V4: r.V4 * 1000};
    for (const k in o) setv(k, f(o[k]));
    setv('ef_QH', `QH = ${f(r.QH)} J`); setv('ef_W', `W = ${f(r.Wnet)} J`); setv('ef_QC', `QC = ${f(r.QC)} J`);
    const segs = r.segs.map((s, i) => ({label: `${i + 1}. ${t('s' + (i + 1))}`, pts: s.map(pv), color: COL[i]}));
    const P = [r.segs[0][0], r.segs[1][0], r.segs[2][0], r.segs[3][0]].map(pv);
    setChart(charts.car, segs, P.map((p, i) => ({label: `${t('state')} ${i + 1}`, ...p})), `${t('V')} (L)`, `${t('P')} (kPa)`);
    setChart(charts.carTS, r.segs.map((sg, i) => ({label: `${i + 1}. ${t('s' + (i + 1))}`, pts: sg.map(p => ({x: p.S, y: p.T})), color: COL[i]})), [r.segs[0][0], r.segs[1][0], r.segs[2][0], r.segs[3][0]].map((p, i) => ({label: `${t('state')} ${i + 1}`, x: p.S, y: p.T})), 'S − S₁ (J/K)', `${t('T')} (K)`);
    cAnim.redraw(); dash();
  });
}

/* ============ Static text, formulas, language ============ */
function applyStatic(root) {
  root.querySelectorAll('[data-i18n]').forEach(e => { const v = t(e.dataset.i18n); if (typeof v === 'string') e.textContent = v; });
}
function applyLang(l) {
  lang = l; try { localStorage.setItem('thermolab-language', l); } catch (e) {}
  document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; $('lang').value = l;
  applyStatic(document);
  document.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); e.setAttribute('aria-label', e.title); });
  $('aboutList').innerHTML = t('aboutL').map(s => `<li>${s}</li>`).join('');
  $('formulas').innerHTML = [['f_gas', 'PV = nRT'], ['f_first', 'ΔU = Q − W'], ['f_iso', 'W = nRT ln(V₂/V₁)'], ['f_isb', 'W = P(V₂ − V₁)'], ['f_adi', 'PV^γ = const ,  TV^(γ−1) = const'], ['f_cv', 'ΔU = nCvΔT ,  Cv = R/(γ−1)'], ['f_ds', 'ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁)'], ['f_car', 'η = 1 − TC/TH']]
    .map(([k, e]) => `<div class="fml"><span>${t(k)}</span><span class="eq" dir="ltr">${e}</span></div>`).join('');
  document.title = 'ThermoLab — ' + t('sub');
  gas(); proc(); carnot(); dash(); Object.values(charts).forEach(c => c.resize());
}

/* ============ Init ============ */
function setTheme(th) { document.documentElement.dataset.theme = th; try { localStorage.setItem('thermolab-theme', th); } catch (e) {} }
function show(v) {
  document.querySelectorAll('main section').forEach(s => { s.hidden = s.id !== 'v-' + v; });
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('side').classList.remove('open'); Object.values(charts).forEach(c => c.resize());
}
const ACT = {pAnim: () => pAnim.start(), pReset: resetProc, cStart: () => cAnim.start(), cPause: () => cAnim.pause(), cReset: () => cAnim.reset(),
  export: () => { const a = document.createElement('a'); a.href = charts.pvB.toBase64Image(); a.download = 'thermolab-pv-diagram.png'; a.click(); }};
function init() {
  let th = 'light'; try { th = localStorage.getItem('thermolab-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) {}
  setTheme(th);
  const V0 = R * 300 / 101325;
  fld('dashFields', 'dT', 'T', 'K', 1, 2000, 300, 1, dash); fld('dashFields', 'dP', 'P', 'Pa', 0, 0, 101325, 1, dash);
  fld('dashFields', 'dV', 'V', 'm³', 0.001, 0.2, inp(V0), 0.0001, dash); fld('dashFields', 'dn', 'n', 'mol', 0.1, 10, 1, 0.1, dash);
  fld('pFields', 'pn', 'n', 'mol', 0.1, 5, 1, 0.1, proc); fld('pFields', 'pT1', 'T1', 'K', 50, 1000, 300, 1, proc); fld('pFields', 'pT2', 'T2', 'K', 50, 1500, 600, 1, proc);
  fld('pFields', 'pk', 'kpol', '', 0.1, 3, 1.3, 0.05, proc); fld('pFields', 'pV1', 'V1', 'L', 1, 50, 10, 0.5, proc); fld('pFields', 'pV2', 'V2', 'L', 1, 100, 30, 0.5, proc);
  fld('cFields', 'cTH', 'TH', 'K', 200, 1500, 600, 1, carnot); fld('cFields', 'cTC', 'TC', 'K', 50, 1000, 300, 1, carnot);
  fld('cFields', 'cV1', 'cV1', 'L', 1, 20, 2, 0.1, carnot); fld('cFields', 'cV2', 'cV2', 'L', 2, 60, 6, 0.1, carnot); fld('cFields', 'cn', 'n', 'mol', 0.1, 5, 1, 0.1, carnot);
  kv('pOut', [['pO_P1', 'P1', '[kPa→Pa]'], ['pO_P2', 'P2', '[Pa]'], ['pO_V1', 'V1', '[L]'], ['pO_V2', 'V2', '[L]'], ['pO_T1', 'T1', '[K]'], ['pO_T2', 'T2', '[K]'], ['pO_W', 'W', '[J]'], ['pO_Q', 'Q', '[J]'], ['pO_dU', 'dU', '[J]'], ['pO_dS', 'dS', '[J/K]']]);
  kv('cOut', [['cO_QH', 'QH', '[J]'], ['cO_QC', 'QC', '[J]'], ['cO_W', 'Wn', '[J]'], ['cO_etaC', 'etaC', '[%]'], ['cO_eta', 'etaS', '[%]'], ['cO_V3', 'V1', 'V₃ [L]'], ['cO_V4', 'V2', 'V₄ [L]']]);
  document.querySelector('#pOut div span i').textContent = '[Pa]';
  document.querySelectorAll('#cOut div')[5].querySelector('span').innerHTML = '<span>V₃</span> <i>[L]</i>'; document.querySelectorAll('#cOut div')[6].querySelector('span').innerHTML = '<span>V₄</span> <i>[L]</i>';
  buildGas(); buildCharts();
  ['pType', 'pGas'].forEach(i => $(i).addEventListener('change', proc)); $('cGas').addEventListener('change', carnot); $('dGas').addEventListener('change', () => dash());
  document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
  document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => ACT[b.dataset.act]()));
  $('menuBtn').addEventListener('click', () => $('side').classList.toggle('open'));
  $('themeBtn').addEventListener('click', () => { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); buildCharts(); drawProc(); carnot(); pAnim.redraw(); });
  $('lang').addEventListener('change', e => applyLang(e.target.value));
  let l = null; try { l = localStorage.getItem('thermolab-language'); } catch (e) {}
  if (!TR[l]) { const b = (navigator.language || 'en').slice(0, 2).toLowerCase(); l = TR[b] ? b : 'en'; }
  show('dash'); applyLang(l);
}
init();
