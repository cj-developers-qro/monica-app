// Carga 3 clientes ficticios de demostración (2 mujeres y 1 hombre) con cuestionario completo,
// 3 meses de medidas y composición, rutina asignada, plan de nutrición del mes anterior con su
// seguimiento semanal y plan del mes en curso (con el ajuste automático aplicado).
//
//   npm run demo            carga o recarga los clientes de demostración
//   npm run demo -- --borrar  elimina los clientes de demostración
//
// Es idempotente: identifica a los clientes de demostración por la marca "_demo" de su
// cuestionario, así que volver a ejecutarlo los reemplaza sin tocar a los clientes reales.
import { cifrarContrasena, contrasenaTemporal } from "@/lib/contrasenas";
import { db } from "@/lib/db";
import { copiarRutina, enTransaccion } from "@/lib/escritura";
import { ajusteAdaptativo, generarPlan, sumarFecha } from "@/lib/nutricion";
import type { Objetivo } from "@/lib/objetivos";

type Registro = { dias: number; peso: number; grasa: number; musculo: number; visceral: number };
type Medida = { cintura: number; cadera: number; cuello: number; brazo: number; pierna: number; pantorrilla: number };

type ClienteDemo = {
  nombre: string;
  correo: string;
  edad: number;
  sexo: "F" | "M";
  estatura: number;
  objetivo: Objetivo;
  onboarding: Record<string, string>;
  rutina: string;
  personalizar?: { cambiar: string; por: string; nota: string };
  composicion: Registro[];
  medidas: Medida[];
  adherencias: number[];
};

// Fechas relativas a hoy: la primera medición fue hace 12 semanas.
const hoyISO = new Date().toISOString().slice(0, 10);
const hace = (dias: number) => sumarFecha(hoyISO, -dias);

const CLIENTES: ClienteDemo[] = [
  {
    nombre: "Valeria Ramírez Soto",
    correo: "valeria.demo@monifit.app",
    edad: 29,
    sexo: "F",
    estatura: 165,
    objetivo: "perdida_grasa",
    onboarding: {
      enfermedades: "No",
      medicamentos: "No",
      cirugias_lesiones: "No",
      fracturas: "No",
      digestion: "Bueno",
      ciclo_regular: "Sí",
      ciclo_dias: "28",
      ciclo_sintomas: "Cólicos leves el primer día",
      anticonceptivo: "No",
      embarazos: "No tengo hijos",
      hora_despertar: "06:30",
      hora_dormir: "23:30",
      descanso_reparador: "A veces",
      fuma: "No",
      alcohol: "Ocasional, 1–2 copas en fin de semana",
      rutina_diaria: "Trabajo de oficina de 9 a 6, sentada casi todo el día. Como fuera entre semana.",
      alergias: "Ninguna",
      aversiones: "Hígado y betabel",
      fruta_favorita: "Fresa",
      agua_litros: "1.2",
      suplementos: "Ninguno",
      dificultad_cocinar: "Un poco",
      comidas_dia: "4",
      horario_entreno: "7 pm, 1 hora",
      cardio: "Caminata de 30 minutos, 2 veces por semana",
      area_prioritaria: "Abdomen y brazos; quiero sentirme con más energía",
    },
    rutina: "Circuito metabólico de cuerpo completo",
    composicion: [
      { dias: 84, peso: 72.4, grasa: 32.1, musculo: 27.9, visceral: 6 },
      { dias: 63, peso: 71.3, grasa: 31.2, musculo: 28.1, visceral: 6 },
      { dias: 42, peso: 70.4, grasa: 30.4, musculo: 28.3, visceral: 5.5 },
      { dias: 21, peso: 69.8, grasa: 29.8, musculo: 28.4, visceral: 5 },
      { dias: 1, peso: 69.5, grasa: 29.4, musculo: 28.6, visceral: 5 },
    ],
    medidas: [
      { cintura: 84, cadera: 104, cuello: 33, brazo: 30.5, pierna: 60, pantorrilla: 37 },
      { cintura: 82.5, cadera: 103, cuello: 33, brazo: 30, pierna: 59.5, pantorrilla: 37 },
      { cintura: 81, cadera: 102, cuello: 32.5, brazo: 29.5, pierna: 59, pantorrilla: 36.5 },
      { cintura: 80, cadera: 101.5, cuello: 32.5, brazo: 29.5, pierna: 58.5, pantorrilla: 36.5 },
      { cintura: 79.5, cadera: 101, cuello: 32.5, brazo: 29.5, pierna: 58.5, pantorrilla: 36.5 },
    ],
    adherencias: [85, 80, 90, 75],
  },
  {
    nombre: "Sofía Hernández Luna",
    correo: "sofia.demo@monifit.app",
    edad: 41,
    sexo: "F",
    estatura: 158,
    objetivo: "recomposicion",
    onboarding: {
      enfermedades: "Hipotiroidismo controlado",
      medicamentos: "Levotiroxina 75 mcg en ayunas",
      cirugias_lesiones: "Tendinitis leve en hombro izquierdo",
      fracturas: "No",
      digestion: "Regular",
      digestion_por_que: "Inflamación después de comer lácteos",
      ciclo_regular: "Sí",
      ciclo_dias: "30",
      ciclo_sintomas: "No",
      anticonceptivo: "DIU de cobre",
      embarazos: "2 hijos; primer embarazo a los 27 años",
      hora_despertar: "06:00",
      hora_dormir: "22:30",
      descanso_reparador: "Sí",
      fuma: "No",
      alcohol: "No",
      rutina_diaria: "Llevo a los niños a la escuela, trabajo desde casa y entreno al mediodía.",
      alergias: "Intolerancia a la lactosa",
      aversiones: "Pescado",
      fruta_favorita: "Mango",
      agua_litros: "2",
      suplementos: "Vitamina D",
      dificultad_cocinar: "No",
      comidas_dia: "5",
      horario_entreno: "1 pm, 50 minutos",
      cardio: "Bicicleta estática 20 minutos, 2 veces por semana",
      area_prioritaria: "Tonificar piernas y glúteos sin bajar mucho de peso",
    },
    rutina: "Cuerpo completo para recomposición",
    personalizar: { cambiar: "Press de hombro con mancuernas", por: "Face pull", nota: "Sustituye el press de hombro por la tendinitis" },
    composicion: [
      { dias: 84, peso: 63.1, grasa: 30.6, musculo: 29.0, visceral: 5 },
      { dias: 63, peso: 62.9, grasa: 29.7, musculo: 29.6, visceral: 5 },
      { dias: 42, peso: 62.8, grasa: 28.8, musculo: 30.3, visceral: 4.5 },
      { dias: 21, peso: 62.7, grasa: 28.0, musculo: 30.9, visceral: 4.5 },
      { dias: 1, peso: 62.6, grasa: 27.3, musculo: 31.4, visceral: 4 },
    ],
    medidas: [
      { cintura: 78, cadera: 99, cuello: 31, brazo: 28, pierna: 55, pantorrilla: 34.5 },
      { cintura: 77, cadera: 98.5, cuello: 31, brazo: 28, pierna: 55.5, pantorrilla: 34.5 },
      { cintura: 76, cadera: 98.5, cuello: 31, brazo: 28.5, pierna: 55.5, pantorrilla: 35 },
      { cintura: 75.5, cadera: 98, cuello: 31, brazo: 28.5, pierna: 56, pantorrilla: 35 },
      { cintura: 75, cadera: 98, cuello: 31, brazo: 28.5, pierna: 56, pantorrilla: 35 },
    ],
    adherencias: [90, 95, 85, 90],
  },
  {
    nombre: "Diego Morales Castro",
    correo: "diego.demo@monifit.app",
    edad: 34,
    sexo: "M",
    estatura: 176,
    objetivo: "ganancia_muscular",
    onboarding: {
      enfermedades: "No",
      medicamentos: "No",
      cirugias_lesiones: "Esguince de tobillo derecho hace 3 años, recuperado",
      fracturas: "No",
      digestion: "Excelente",
      hora_despertar: "05:45",
      hora_dormir: "22:00",
      descanso_reparador: "Sí",
      fuma: "No",
      alcohol: "Rara vez",
      rutina_diaria: "Ingeniero en planta, turno de 7 a 4. Entreno al salir del trabajo.",
      alergias: "Nueces",
      aversiones: "Tofu",
      fruta_favorita: "Plátano",
      agua_litros: "2.5",
      suplementos: "Creatina 5 g y proteína whey",
      dificultad_cocinar: "No",
      comidas_dia: "5",
      horario_entreno: "5 pm, 1 hora 15 minutos",
      cardio: "Fútbol los domingos",
      area_prioritaria: "Ganar masa en espalda y piernas",
    },
    rutina: "Torso / Pierna 4 días",
    composicion: [
      { dias: 84, peso: 70.2, grasa: 15.0, musculo: 40.1, visceral: 4 },
      { dias: 63, peso: 71.0, grasa: 15.1, musculo: 40.8, visceral: 4 },
      { dias: 42, peso: 71.8, grasa: 15.3, musculo: 41.4, visceral: 4 },
      { dias: 21, peso: 72.5, grasa: 15.5, musculo: 41.9, visceral: 4.5 },
      { dias: 1, peso: 73.1, grasa: 15.7, musculo: 42.3, visceral: 4.5 },
    ],
    medidas: [
      { cintura: 80, cadera: 94, cuello: 37, brazo: 32.5, pierna: 55, pantorrilla: 36 },
      { cintura: 80.5, cadera: 94.5, cuello: 37, brazo: 33, pierna: 55.5, pantorrilla: 36 },
      { cintura: 81, cadera: 95, cuello: 37.5, brazo: 33.5, pierna: 56.5, pantorrilla: 36.5 },
      { cintura: 81, cadera: 95.5, cuello: 37.5, brazo: 34, pierna: 57, pantorrilla: 36.5 },
      { cintura: 81.5, cadera: 96, cuello: 38, brazo: 34.5, pierna: 57.5, pantorrilla: 37 },
    ],
    adherencias: [80, 85, 85, 90],
  },
];

function borrarDemo() {
  const ids = db()
    .prepare("SELECT id FROM clientes WHERE json_extract(onboarding, '$._demo') = '1'")
    .all()
    .map((f) => Number(f.id));
  for (const id of ids) db().prepare("DELETE FROM clientes WHERE id = ?").run(id);
  return ids.length;
}

function cargarCliente(c: ClienteDemo) {
  const inicio = c.composicion[0].dias;
  const idCliente = Number(
    db()
      .prepare("INSERT INTO clientes (nombre, edad, sexo, estatura_cm, objetivo, onboarding, creado_en) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(c.nombre, c.edad, c.sexo, c.estatura, c.objetivo, JSON.stringify({ ...c.onboarding, _demo: "1" }), `${hace(inicio)} 10:00:00`)
      .lastInsertRowid,
  );

  c.composicion.forEach((r, i) => {
    db()
      .prepare(
        `INSERT INTO composicion (cliente_id, fecha, peso_kg, estatura_cm, grasa_pct, musculo_pct, grasa_visceral, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(idCliente, hace(r.dias), r.peso, c.estatura, r.grasa, r.musculo, r.visceral, i === 0 ? "Valoración inicial" : null);
    const m = c.medidas[i];
    db()
      .prepare(
        `INSERT INTO mediciones (cliente_id, fecha, brazo_izq, brazo_der, pierna_izq, pierna_der, pantorrilla_izq, pantorrilla_der, cintura, cuello, cadera)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(idCliente, hace(r.dias), m.brazo, m.brazo + 0.5, m.pierna, m.pierna + 0.5, m.pantorrilla, m.pantorrilla, m.cintura, m.cuello, m.cadera);
  });

  // Rutina: la del catálogo o una copia personalizada para el cliente.
  const base = db().prepare("SELECT id, dias_semana FROM rutinas WHERE nombre = ? AND cliente_id IS NULL").get(c.rutina) as
    | { id: number; dias_semana: number }
    | undefined;
  if (!base) throw new Error(`No existe la rutina de catálogo "${c.rutina}"`);
  let rutinaId = base.id;
  if (c.personalizar) {
    rutinaId = copiarRutina(base.id, `${c.rutina} · ${c.nombre.split(" ")[0]}`, idCliente);
    const cambiar = db().prepare("SELECT id FROM ejercicios WHERE nombre = ?").get(c.personalizar.cambiar) as { id: number };
    const por = db().prepare("SELECT id FROM ejercicios WHERE nombre = ?").get(c.personalizar.por) as { id: number };
    db()
      .prepare("UPDATE rutina_ejercicios SET ejercicio_id = ?, notas = ? WHERE rutina_id = ? AND ejercicio_id = ?")
      .run(por.id, c.personalizar.nota, rutinaId, cambiar.id);
  }
  db()
    .prepare("INSERT INTO asignaciones (cliente_id, rutina_id, fecha_inicio, notas) VALUES (?, ?, ?, ?)")
    .run(idCliente, rutinaId, hace(inicio), c.personalizar ? "Personalizada a partir del catálogo" : "");

  // Plan del mes anterior (con datos de hace 4 semanas) y su seguimiento semanal.
  const entrada = (registro: Registro, fechaInicio: string, ajuste: { kcal: number; motivo: string | null }) =>
    generarPlan({
      sexo: c.sexo,
      edad: c.edad,
      estatura_cm: c.estatura,
      peso_kg: registro.peso,
      grasa_pct: registro.grasa,
      objetivo: c.objetivo,
      dias_entrenamiento: base.dias_semana,
      onboarding: c.onboarding,
      fecha_inicio: fechaInicio,
      comidas_dia: Number(c.onboarding.comidas_dia),
      ajuste_kcal: ajuste.kcal,
      motivo_ajuste: ajuste.motivo,
      excluir: "",
    });
  const inicioAnterior = hace(28);
  const anterior = entrada(c.composicion[c.composicion.length - 3], inicioAnterior, { kcal: 0, motivo: null });
  const idAnterior = Number(
    db()
      .prepare("INSERT INTO planes_nutricion (cliente_id, fecha_inicio, fecha_fin, plan, notas) VALUES (?, ?, ?, ?, ?)")
      .run(idCliente, anterior.fecha_inicio, anterior.fecha_fin, JSON.stringify(anterior), "Plan del mes anterior").lastInsertRowid,
  );
  c.adherencias.forEach((adherencia, semana) => {
    db()
      .prepare(
        `INSERT INTO seguimiento_nutricion (cliente_id, plan_id, fecha, adherencia, agua_litros, energia, hambre, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(idCliente, idAnterior, sumarFecha(inicioAnterior, 7 * semana + 6), adherencia, 2 + semana * 0.2, 3 + (semana % 2), 3,
        semana === 0 ? "Me costó la primera semana" : null);
  });

  // Plan del mes en curso con el ajuste automático, igual que al presionar «Generar nuevo plan».
  const pesos = c.composicion.filter((r) => r.dias <= 28).map((r) => ({ fecha: hace(r.dias), peso: r.peso }));
  const promedio = c.adherencias.reduce((a, b) => a + b, 0) / c.adherencias.length;
  const actual = entrada(c.composicion[c.composicion.length - 1], hoyISO, ajusteAdaptativo(c.objetivo, pesos, promedio));
  db()
    .prepare("INSERT INTO planes_nutricion (cliente_id, fecha_inicio, fecha_fin, plan, notas) VALUES (?, ?, ?, ?, ?)")
    .run(idCliente, actual.fecha_inicio, actual.fecha_fin, JSON.stringify(actual), "Plan del mes en curso");

  // Acceso al portal con contraseña temporal (se cambia en el primer ingreso).
  const temporal = contrasenaTemporal();
  db().prepare("DELETE FROM usuarios WHERE usuario = ?").run(c.correo);
  db()
    .prepare("INSERT INTO usuarios (usuario, nombre, rol, cliente_id, hash, debe_cambiar) VALUES (?, ?, 'cliente', ?, ?, 1)")
    .run(c.correo, c.nombre, idCliente, cifrarContrasena(temporal));
  return { id: idCliente, temporal, motivo: actual.calculo.motivo_ajuste, kcal: actual.objetivos.entreno.kcal };
}

const soloBorrar = process.argv.includes("--borrar");
const borrados = enTransaccion(borrarDemo);
if (borrados) console.log(`Se eliminaron ${borrados} clientes de demostración anteriores.`);
if (soloBorrar) process.exit(0);

const resultados = enTransaccion(() => CLIENTES.map((c) => ({ c, ...cargarCliente(c) })));
console.log("\nClientes de demostración cargados (datos ficticios):\n");
for (const { c, temporal, kcal, motivo } of resultados) {
  console.log(`  ${c.nombre} (${c.sexo === "F" ? "mujer" : "hombre"}, ${c.objetivo.replace("_", " ")})`);
  console.log(`    Portal: ${c.correo} · contraseña temporal: ${temporal}`);
  console.log(`    Plan del mes: ${kcal} kcal en día de entrenamiento${motivo ? ` · ${motivo}` : ""}\n`);
}
