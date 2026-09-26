// Motor de nutrición: calcula el requerimiento energético y de macronutrientes del cliente
// y genera un plan de 4 semanas con menú diario, respetando alergias, aversiones y hábitos
// declarados en el onboarding.
import { ALIMENTOS, NOMBRE_ETIQUETA, PALABRAS_ETIQUETA, PALABRAS_GENERICAS, type Alimento, type Etiqueta } from "./alimentos";
import type { Objetivo } from "./objetivos";

export type Macros = { kcal: number; p: number; c: number; g: number };

export type ItemComida = { clave: string; nombre: string; gramos: number; medida: string | null } & Macros;
export type Comida = { nombre: string; items: ItemComida[]; total: Macros };
export type DiaPlan = { fecha: string; entreno: boolean; comidas: Comida[]; total: Macros };
export type SemanaPlan = { numero: number; enfoque: string; dias: DiaPlan[]; compras: { nombre: string; gramos: number; medida: string | null }[] };

export type PlanNutricional = {
  fecha_inicio: string;
  fecha_fin: string;
  calculo: {
    metodo: string;
    tmb: number;
    factor_actividad: number;
    gasto_total: number;
    ajuste_objetivo_pct: number;
    ajuste_kcal: number;
    motivo_ajuste: string | null;
    peso_kg: number;
    grasa_pct: number | null;
  };
  objetivos: { entreno: Macros; descanso: Macros };
  agua_litros: number;
  comidas_por_dia: number;
  dias_entreno: number[];
  restricciones: string[];
  recomendaciones: string[];
  semanas: SemanaPlan[];
};

export type EntradaPlan = {
  sexo: "F" | "M";
  edad: number | null;
  estatura_cm: number | null;
  peso_kg: number;
  grasa_pct: number | null;
  objetivo: Objetivo;
  dias_entrenamiento: number;
  onboarding: Record<string, string>;
  fecha_inicio: string;
  comidas_dia: number;
  ajuste_kcal: number;
  motivo_ajuste: string | null;
  excluir: string;
};

const AJUSTE_OBJETIVO: Record<Objetivo, number> = { perdida_grasa: -0.2, ganancia_muscular: 0.1, recomposicion: -0.1, rendimiento: 0 };
const PROTEINA_G_KG: Record<Objetivo, number> = { perdida_grasa: 2.2, ganancia_muscular: 2.0, recomposicion: 2.2, rendimiento: 1.8 };

// Días de entrenamiento sugeridos (0 = lunes) según cuántos entrena por semana.
const DIAS_ENTRENO: Record<number, number[]> = {
  0: [], 1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6],
};

type Momento = Alimento["momentos"][number];
const TIEMPOS: Record<number, { nombre: string; momento: Momento; parte: number }[]> = {
  3: [
    { nombre: "Desayuno", momento: "desayuno", parte: 0.3 },
    { nombre: "Comida", momento: "comida", parte: 0.4 },
    { nombre: "Cena", momento: "cena", parte: 0.3 },
  ],
  4: [
    { nombre: "Desayuno", momento: "desayuno", parte: 0.25 },
    { nombre: "Comida", momento: "comida", parte: 0.35 },
    { nombre: "Colación", momento: "colacion", parte: 0.15 },
    { nombre: "Cena", momento: "cena", parte: 0.25 },
  ],
  5: [
    { nombre: "Desayuno", momento: "desayuno", parte: 0.25 },
    { nombre: "Colación matutina", momento: "colacion", parte: 0.1 },
    { nombre: "Comida", momento: "comida", parte: 0.3 },
    { nombre: "Colación vespertina", momento: "colacion", parte: 0.12 },
    { nombre: "Cena", momento: "cena", parte: 0.23 },
  ],
  6: [
    { nombre: "Desayuno", momento: "desayuno", parte: 0.2 },
    { nombre: "Colación matutina", momento: "colacion", parte: 0.1 },
    { nombre: "Comida", momento: "comida", parte: 0.28 },
    { nombre: "Colación vespertina", momento: "colacion", parte: 0.12 },
    { nombre: "Cena", momento: "cena", parte: 0.2 },
    { nombre: "Colación nocturna", momento: "colacion", parte: 0.1 },
  ],
};

const ENFOQUES = [
  "Adaptación: pesa las porciones y registra lo que comes; cumple la meta de agua todos los días.",
  "Proteína en cada comida: prioriza la porción de proteína antes que el resto del plato.",
  "Fibra y verduras: verduras en al menos dos comidas y fruta entera en lugar de jugo.",
  "Consolidación: planea y prepara las comidas de la semana; evaluación de fin de mes.",
];

const normalizar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const redondear = (n: number, paso = 1) => Math.round(n / paso) * paso;
const vacio = (t?: string) => !t || /^(no|ninguna?o?s?|nada|n\/a|-|0)\.?$/i.test(t.trim());

function sumar(lista: Macros[]): Macros {
  const t = lista.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, g: a.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), g: Math.round(t.g) };
}

export function sumarFecha(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Alimentos permitidos y la explicación de lo que se excluyó. */
function filtrarAlimentos(onboarding: Record<string, string>, excluir: string) {
  const alergias = normalizar(onboarding.alergias ?? "");
  const aversiones = normalizar(`${onboarding.aversiones ?? ""} ${excluir}`);
  const restricciones: string[] = [];
  const etiquetas = new Set<Etiqueta>();
  for (const [etiqueta, patron] of Object.entries(PALABRAS_ETIQUETA) as [Etiqueta, RegExp][]) {
    if (!vacio(alergias) && patron.test(alergias)) {
      etiquetas.add(etiqueta);
      restricciones.push(`Sin ${NOMBRE_ETIQUETA[etiqueta]} (alergia o intolerancia).`);
    } else if (PALABRAS_GENERICAS[etiqueta]?.test(aversiones)) {
      etiquetas.add(etiqueta);
      restricciones.push(`Sin ${NOMBRE_ETIQUETA[etiqueta]} (no le gusta).`);
    }
  }
  const porNombre: string[] = [];
  const permitidos = ALIMENTOS.filter((a) => {
    if (a.etiquetas.some((e) => etiquetas.has(e))) return false;
    const palabras = normalizar(a.nombre).split(/[^a-zñ]+/).filter((p) => p.length >= 4 && !["entero", "cocido", "cocida", "natural", "plancha", "horno", "salteadas", "salteados", "asada", "asados", "vapor"].includes(p));
    const coincide = palabras.slice(0, 2).some((p) => new RegExp(`\\b${p.slice(0, -1)}`).test(aversiones));
    if (coincide) porNombre.push(a.nombre);
    return !coincide;
  });
  if (porNombre.length) restricciones.push(`Excluidos por preferencia: ${porNombre.join(", ")}.`);
  return { permitidos, restricciones };
}

// Límites razonables de porción por categoría (gramos) y excepciones por alimento.
const LIMITES: Record<Alimento["categoria"], [number, number]> = {
  proteina: [40, 300], lacteo: [100, 350], carbohidrato: [0, 450], grasa: [0, 40], verdura: [0, 250], fruta: [0, 250],
};
const LIMITE_ALIMENTO: Record<string, [number, number]> = {
  huevo: [50, 150], claras: [60, 300], proteina_polvo: [15, 45], proteina_vegetal: [15, 45], pavo_rebanado: [40, 120], aceite_oliva: [0, 15], aguacate: [0, 120],
  avena: [20, 150], tortilla_maiz: [0, 240], pan_integral: [0, 120], galletas_arroz: [0, 36], semillas_chia: [0, 24], crema_cacahuate: [0, 32],
  frijoles: [0, 300], lentejas: [0, 300],
};

function medida(a: Alimento, gramos: number) {
  if (!a.unidad) return null;
  const n = gramos / a.unidad.gramos;
  if (a.unidad.gramos < 5) return `≈ ${Math.round(n)} ${a.unidad.nombre}s`;
  const texto = n >= 0.9 && n <= 1.1 ? "1" : n < 1 ? (n >= 0.4 ? "½" : "¼") : String(Math.round(n * 2) / 2).replace(".5", "½");
  const plural = n > 1.1 && !a.unidad.nombre.includes(" ") ? `${a.unidad.nombre}s` : a.unidad.nombre;
  return `${texto.replace(/^(\d)½$/, "$1 ½")} ${plural}`;
}

function item(a: Alimento, gramos: number): ItemComida {
  const f = gramos / 100;
  return {
    clave: a.clave, nombre: a.nombre, gramos, medida: medida(a, gramos),
    kcal: Math.round(a.kcal * f), p: Math.round(a.p * f * 10) / 10, c: Math.round(a.c * f * 10) / 10, g: Math.round(a.g * f * 10) / 10,
  };
}

/** Ajusta los gramos de cada alimento para aproximar la meta de proteína, carbohidrato y grasa. */
function resolverPorciones(meta: Macros, fijos: [Alimento, number][], variables: { a: Alimento; macro: "p" | "c" | "g" }[]): ItemComida[] {
  const gramos = new Map<string, number>(variables.map((v) => [v.a.clave, 0]));
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    for (const { a, macro } of variables) {
      let aporteOtros = fijos.reduce((s, [f, gr]) => s + (f[macro] * gr) / 100, 0);
      for (const v of variables) if (v.a !== a) aporteOtros += (v.a[macro] * (gramos.get(v.a.clave) ?? 0)) / 100;
      const [min, max] = LIMITE_ALIMENTO[a.clave] ?? LIMITES[a.categoria];
      const deseado = a[macro] > 0 ? ((meta[macro] - aporteOtros) / a[macro]) * 100 : 0;
      gramos.set(a.clave, Math.min(max, Math.max(macro === "p" ? min : 0, deseado)));
    }
  }
  const redondeo = (a: Alimento, g: number) =>
    a.unidad && a.unidad.gramos >= 30 && ["huevo", "tortilla_maiz", "pan_integral"].includes(a.clave)
      ? Math.max(a.clave === "huevo" ? 1 : 0, Math.round(g / a.unidad.gramos)) * a.unidad.gramos
      : redondear(g, a.categoria === "grasa" && g < 30 ? 1 : 5);
  return [
    ...fijos.map(([a, g]) => item(a, g)),
    ...variables.map(({ a }) => item(a, redondeo(a, gramos.get(a.clave)!))).filter((i) => i.gramos >= 3),
  ];
}

/** Prefiere alimentos cuya porción máxima alcance al menos el 80 % de la proteína de la comida. */
function suficientes(lista: Alimento[], metaP: number) {
  const capaces = lista.filter((a) => ((LIMITE_ALIMENTO[a.clave] ?? LIMITES[a.categoria])[1] * a.p) / 100 >= metaP * 0.8);
  return capaces.length ? capaces : lista;
}

const proteico = (categorias: Alimento["categoria"][]) => categorias.includes("proteina") && !categorias.includes("carbohidrato");

/**
 * Si al día le falta proteína o carbohidrato (porque en alguna comida la porción topó con su
 * límite), se reparte lo que falta entre los alimentos de ese tipo de las demás comidas, sin
 * rebasar su límite. Primero comida y cena, que admiten porciones más grandes.
 */
function compensar(comidas: Comida[], meta: number, macro: "p" | "c", categorias: Alimento["categoria"][]) {
  let falta = meta - comidas.reduce((s, c) => s + c.total[macro], 0);
  const principal = (c: Comida) => Number(/^(Comida|Cena)$/.test(c.nombre));
  for (const comida of [...comidas].sort((a, b) => principal(b) - principal(a))) {
    if (falta <= 3) break;
    const i = comida.items.findIndex((x) => categorias.includes(ALIMENTOS.find((a) => a.clave === x.clave)?.categoria ?? "verdura"));
    if (i < 0) continue;
    const a = ALIMENTOS.find((x) => x.clave === comida.items[i].clave)!;
    const [, max] = LIMITE_ALIMENTO[a.clave] ?? LIMITES[a.categoria];
    const nuevos = Math.max(comida.items[i].gramos, Math.min(max, redondear(comida.items[i].gramos + (falta / a[macro]) * 100, 5)));
    falta -= ((nuevos - comida.items[i].gramos) * a[macro]) / 100;
    comida.items[i] = item(a, nuevos);
    comida.total = sumar(comida.items);
  }
}

export function generarPlan(e: EntradaPlan): PlanNutricional {
  // 1. Gasto energético
  const masaMagra = e.grasa_pct != null ? e.peso_kg * (1 - e.grasa_pct / 100) : null;
  let tmb: number;
  let metodo: string;
  if (masaMagra != null) {
    tmb = 370 + 21.6 * masaMagra;
    metodo = "Katch-McArdle (usa la masa magra)";
  } else if (e.estatura_cm && e.edad) {
    tmb = 10 * e.peso_kg + 6.25 * e.estatura_cm - 5 * e.edad + (e.sexo === "M" ? 5 : -161);
    metodo = "Mifflin-St Jeor";
  } else {
    tmb = e.peso_kg * (e.sexo === "M" ? 24 : 22);
    metodo = "Estimación por peso (faltan edad, estatura o % de grasa)";
  }
  const dias = Math.min(7, Math.max(0, e.dias_entrenamiento));
  const factor = [1.3, 1.35, 1.45, 1.5, 1.6, 1.65, 1.75, 1.8][dias];
  const gasto = tmb * factor;
  const pct = AJUSTE_OBJETIVO[e.objetivo];
  const minimo = Math.max(tmb, e.sexo === "F" ? 1200 : 1500);
  const kcal = Math.max(minimo, redondear(gasto * (1 + pct) + e.ajuste_kcal, 10));

  // 2. Macronutrientes: proteína por kg, grasa por kg con límites, el resto carbohidratos.
  const grasaAlta = e.grasa_pct != null && e.grasa_pct > (e.sexo === "F" ? 32 : 25);
  const pesoReferencia = grasaAlta && masaMagra ? masaMagra / (e.sexo === "F" ? 0.72 : 0.8) : e.peso_kg;
  const p = redondear(PROTEINA_G_KG[e.objetivo] * pesoReferencia);
  const g = redondear(Math.min((kcal * 0.35) / 9, Math.max(0.8 * pesoReferencia, (kcal * 0.25) / 9)));
  const c = Math.max(50, redondear((kcal - p * 4 - g * 9) / 4));

  // 3. Ciclado de carbohidratos: más en días de entrenamiento, manteniendo el promedio semanal.
  const diasEntreno = DIAS_ENTRENO[dias];
  const descansos = 7 - diasEntreno.length;
  // +15 % en días de entrenamiento, sin bajar más de 25 % los días de descanso.
  const extra = diasEntreno.length && descansos ? Math.min(0.15, (0.25 * descansos) / diasEntreno.length) : 0;
  const cEntreno = redondear(c * (1 + extra));
  const cDescanso = descansos ? redondear(c * (1 - (extra * diasEntreno.length) / descansos)) : c;
  const macros = (cc: number): Macros => ({ kcal: redondear(p * 4 + cc * 4 + g * 9, 10), p, c: cc, g });
  const objetivos = { entreno: macros(cEntreno), descanso: macros(cDescanso) };

  // 4. Menú del mes
  const { permitidos, restricciones } = filtrarAlimentos(e.onboarding, e.excluir);
  const cocinaPoco = /s[ií]|poco/i.test(e.onboarding.dificultad_cocinar ?? "");
  const frutaFavorita = normalizar(e.onboarding.fruta_favorita ?? "");
  const comidasDia = Math.min(6, Math.max(3, e.comidas_dia));
  const tiempos = TIEMPOS[comidasDia];

  const candidatos = (momento: Momento, categorias: Alimento["categoria"][]) => {
    const lista = permitidos.filter(
      (a) => a.momentos.includes(momento) && categorias.includes(a.categoria) && (!proteico(categorias) || a.p >= 8),
    );
    const rapidos = lista.filter((a) => a.etiquetas.includes("rapido"));
    return cocinaPoco && rapidos.length >= 2 ? rapidos : lista;
  };
  const elegir = (lista: Alimento[], semilla: number) => (lista.length ? lista[semilla % lista.length] : null);

  function armarComida(t: (typeof tiempos)[number], meta: Macros, dia: number, indice: number): Comida {
    // Multiplicadores primos para que la rotación no se repita cuando el tamaño de la lista divide al paso.
    const s = dia * 31 + indice * 17;
    const fijos: [Alimento, number][] = [];
    const variables: { a: Alimento; macro: "p" | "c" | "g" }[] = [];
    const agregarVariable = (a: Alimento | null, macro: "p" | "c" | "g") => {
      if (a && !variables.some((v) => v.a.clave === a.clave)) variables.push({ a, macro });
    };
    if (t.momento === "colacion") {
      const frutas = candidatos("colacion", ["fruta"]);
      const favorita = frutas.find((f) => frutaFavorita && normalizar(f.nombre).includes(frutaFavorita.split(" ")[0]));
      const fruta = favorita && (dia + indice) % 2 === 0 ? favorita : elegir(frutas, s);
      if (fruta) fijos.push([fruta, fruta.unidad?.gramos ?? 150]);
      agregarVariable(elegir(suficientes(candidatos("colacion", ["lacteo", "proteina"]), meta.p), s + 1), "p");
      if (meta.g > 6) agregarVariable(elegir(candidatos("colacion", ["grasa"]), s + 2), "g");
      const cFruta = fruta ? (fruta.c * (fruta.unidad?.gramos ?? 150)) / 100 : 0;
      if (meta.c - cFruta > 25) agregarVariable(elegir(candidatos("colacion", ["carbohidrato"]), s + 3), "c");
    } else {
      agregarVariable(elegir(suficientes(candidatos(t.momento, t.momento === "desayuno" ? ["proteina", "lacteo"] : ["proteina"]), meta.p), s), "p");
      agregarVariable(elegir(candidatos(t.momento, ["carbohidrato"]), s + 1), "c");
      const verdura = elegir(candidatos(t.momento, ["verdura"]), s + 2);
      if (verdura) fijos.push([verdura, t.momento === "desayuno" ? 80 : 150]);
      if (t.momento === "desayuno") {
        const fruta = elegir(candidatos("desayuno", ["fruta"]), s + 3);
        if (fruta) fijos.push([fruta, fruta.unidad?.gramos ?? 150]);
      }
      agregarVariable(elegir(candidatos(t.momento, ["grasa"]), s + 4), "g");
    }
    const items = resolverPorciones(meta, fijos, variables);
    return { nombre: t.nombre, items, total: sumar(items) };
  }

  const semanas: SemanaPlan[] = [];
  for (let w = 0; w < 4; w++) {
    const diasSemana: DiaPlan[] = [];
    for (let d = 0; d < 7; d++) {
      const indice = w * 7 + d;
      const fecha = sumarFecha(e.fecha_inicio, indice);
      const diaSemana = (new Date(`${fecha}T12:00:00`).getDay() + 6) % 7;
      const entreno = diasEntreno.includes(diaSemana);
      const meta = entreno ? objetivos.entreno : objetivos.descanso;
      const comidas = tiempos.map((t, i) =>
        armarComida(t, { kcal: meta.kcal * t.parte, p: meta.p * t.parte, c: meta.c * t.parte, g: meta.g * t.parte }, indice, i),
      );
      compensar(comidas, meta.p, "p", ["proteina", "lacteo"]);
      compensar(comidas, meta.c, "c", ["carbohidrato"]);
      diasSemana.push({ fecha, entreno, comidas, total: sumar(comidas.flatMap((c) => c.items)) });
    }
    const compras = new Map<string, { a: Alimento; gramos: number }>();
    for (const dia of diasSemana)
      for (const comida of dia.comidas)
        for (const i of comida.items) {
          const previo = compras.get(i.clave);
          compras.set(i.clave, { a: ALIMENTOS.find((a) => a.clave === i.clave)!, gramos: (previo?.gramos ?? 0) + i.gramos });
        }
    semanas.push({
      numero: w + 1,
      enfoque: ENFOQUES[w],
      dias: diasSemana,
      compras: [...compras.values()]
        .sort((a, b) => a.a.categoria.localeCompare(b.a.categoria) || a.a.nombre.localeCompare(b.a.nombre))
        .map(({ a, gramos }) => ({ nombre: a.nombre, gramos: redondear(gramos, 10), medida: medida(a, gramos) })),
    });
  }

  const agua = Math.round(((e.peso_kg * 35 + (diasEntreno.length * 500) / 7) / 1000) * 10) / 10;

  return {
    fecha_inicio: e.fecha_inicio,
    fecha_fin: sumarFecha(e.fecha_inicio, 27),
    calculo: {
      metodo, tmb: Math.round(tmb), factor_actividad: factor, gasto_total: Math.round(gasto),
      ajuste_objetivo_pct: Math.round(pct * 100), ajuste_kcal: e.ajuste_kcal, motivo_ajuste: e.motivo_ajuste,
      peso_kg: e.peso_kg, grasa_pct: e.grasa_pct,
    },
    objetivos,
    agua_litros: agua,
    comidas_por_dia: comidasDia,
    dias_entreno: diasEntreno,
    restricciones,
    recomendaciones: recomendaciones(e, agua, p, cocinaPoco),
    semanas,
  };
}

function recomendaciones(e: EntradaPlan, agua: number, proteina: number, cocinaPoco: boolean) {
  const o = e.onboarding;
  const r: string[] = [];
  const condiciones = [o.enfermedades, o.medicamentos].filter((t) => !vacio(t));
  if (condiciones.length) {
    r.push(`Valida este plan con su médico o nutriólogo clínico por: ${condiciones.join("; ")}.`);
  }
  const aguaActual = parseFloat((o.agua_litros ?? "").replace(",", "."));
  r.push(
    Number.isFinite(aguaActual) && aguaActual < agua
      ? `Hidratación: hoy toma ~${aguaActual} L; la meta es ${agua} L al día. Subir 250 ml cada semana hasta alcanzarla.`
      : `Hidratación: ${agua} L de agua al día, más 500 ml por hora de entrenamiento.`,
  );
  if (/regular|malo/i.test(o.digestion ?? "")) {
    r.push("Digestión regular o mala: aumentar la fibra de forma gradual, masticar despacio e incluir fermentados (yogur natural si lo tolera). Detectar alimentos que causen molestias.");
  }
  if (!vacio(o.alcohol)) r.push("Alcohol: limitar a una ocasión por semana; aporta calorías vacías y afecta la recuperación y el sueño.");
  if (!vacio(o.fuma)) r.push("Tabaco: dejar de fumar mejora la capacidad cardiovascular; considerar apoyo profesional.");
  if (/no|a veces/i.test(o.descanso_reparador ?? "")) {
    r.push("Descanso: dormir 7–9 horas, cenar 2–3 horas antes de acostarse e incluir carbohidrato complejo en la cena.");
  }
  if (cocinaPoco) {
    r.push("Cocina poco: el menú prioriza alimentos rápidos. Preparar proteínas y cereales en lote dos veces por semana (domingo y miércoles).");
  }
  const suplementos = normalizar(o.suplementos ?? "");
  if (/creatina/.test(suplementos)) r.push("Creatina: mantener 3–5 g diarios, cualquier hora del día.");
  if (!/protein|whey/.test(suplementos) && proteina > 140) {
    r.push(`La meta de proteína es alta (${proteina} g); un batido de proteína puede ayudar a cumplirla si cuesta con comida.`);
  }
  if (e.sexo === "F" && !/no aplica/i.test(o.ciclo_regular ?? "")) {
    r.push("En la fase lútea (la semana previa al periodo) es normal más hambre: se pueden sumar 100–150 kcal, de preferencia en proteína y fruta.");
  }
  r.push("Pesarse 1–2 veces por semana en ayunas y registrar la adherencia cada semana para ajustar el plan del siguiente mes.");
  return r;
}

/**
 * Ajuste automático de calorías para el nuevo plan según cómo cambió el peso con el plan anterior.
 * Solo se ajusta si hubo buena adherencia; si no, lo que hay que corregir es el cumplimiento.
 */
export function ajusteAdaptativo(objetivo: Objetivo, pesos: { fecha: string; peso: number }[], adherencia: number | null) {
  if (pesos.length < 2 || adherencia == null) return { kcal: 0, motivo: null };
  const primero = pesos[0];
  const ultimo = pesos[pesos.length - 1];
  const semanas = (Date.parse(ultimo.fecha) - Date.parse(primero.fecha)) / (7 * 86_400_000);
  if (semanas < 2) return { kcal: 0, motivo: null };
  if (adherencia < 75) {
    return { kcal: 0, motivo: `Adherencia del mes anterior de ${Math.round(adherencia)} %: se mantienen las calorías y se trabaja el cumplimiento.` };
  }
  const ritmo = ((ultimo.peso - primero.peso) / primero.peso) * 100 / semanas;
  const r = ritmo.toFixed(2);
  const reglas: Record<Objetivo, [number, number, number, number]> = {
    // [ritmo mínimo, ajuste si está por debajo, ritmo máximo, ajuste si está por encima] en % de peso por semana
    perdida_grasa: [-1.0, 150, -0.25, -150],
    ganancia_muscular: [0.1, 150, 0.5, -100],
    recomposicion: [-0.75, 100, 0.25, -100],
    rendimiento: [-0.5, 100, 0.5, -100],
  };
  const [min, subir, max, bajar] = reglas[objetivo];
  const rango = `ritmo esperado: ${min} a ${max} % por semana`;
  if (ritmo < min) return { kcal: subir, motivo: `El peso cambió ${r} % por semana, por debajo del ${rango}: +${subir} kcal.` };
  if (ritmo > max) return { kcal: bajar, motivo: `El peso cambió ${r} % por semana, por encima del ${rango}: ${bajar} kcal.` };
  return { kcal: 0, motivo: `El peso cambió ${r} % por semana, dentro del ritmo esperado: se mantienen las calorías.` };
}
