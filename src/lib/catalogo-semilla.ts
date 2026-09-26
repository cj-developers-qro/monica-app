// Catálogo inicial propuesto. Se carga una sola vez cuando la base de datos está vacía;
// después todo es editable desde la aplicación.
import type { Musculo } from "./musculos";
import type { Nivel, Objetivo, TipoEjercicio } from "./objetivos";

type EjercicioSemilla = {
  clave: string;
  nombre: string;
  tipo: TipoEjercicio;
  equipo: string;
  principales: Musculo[];
  secundarios: Musculo[];
  descripcion: string;
};

export const EJERCICIOS_SEMILLA: EjercicioSemilla[] = [
  // Pecho
  { clave: "press_banca", nombre: "Press de banca con barra", tipo: "fuerza", equipo: "Barra y banco", principales: ["pectorales"], secundarios: ["triceps", "deltoides"], descripcion: "Escápulas retraídas, barra a la línea del pezón, pies firmes en el piso." },
  { clave: "press_inclinado_mancuernas", nombre: "Press inclinado con mancuernas", tipo: "fuerza", equipo: "Mancuernas y banco", principales: ["pectorales"], secundarios: ["deltoides", "triceps"], descripcion: "Banco a 30°, codos a 45° del torso, bajar controlado." },
  { clave: "aperturas_polea", nombre: "Aperturas en polea (cruce)", tipo: "fuerza", equipo: "Polea", principales: ["pectorales"], secundarios: ["deltoides"], descripcion: "Codos ligeramente flexionados, juntar manos al frente apretando el pecho." },
  { clave: "lagartijas", nombre: "Lagartijas", tipo: "fuerza", equipo: "Peso corporal", principales: ["pectorales"], secundarios: ["triceps", "deltoides", "abdominales"], descripcion: "Cuerpo en línea recta, pecho casi toca el piso. Regresión: apoyar rodillas." },
  { clave: "fondos", nombre: "Fondos en paralelas", tipo: "fuerza", equipo: "Paralelas", principales: ["triceps", "pectorales"], secundarios: ["deltoides"], descripcion: "Inclinar el torso para enfatizar pecho; vertical para tríceps." },
  // Espalda
  { clave: "dominadas", nombre: "Dominadas", tipo: "fuerza", equipo: "Barra fija", principales: ["dorsales"], secundarios: ["biceps", "antebrazos", "trapecio"], descripcion: "Agarre prono, llevar el pecho a la barra. Regresión: banda o máquina asistida." },
  { clave: "jalon_pecho", nombre: "Jalón al pecho", tipo: "fuerza", equipo: "Polea alta", principales: ["dorsales"], secundarios: ["biceps", "trapecio"], descripcion: "Pecho arriba, jalar la barra hacia la clavícula llevando codos abajo." },
  { clave: "remo_barra", nombre: "Remo con barra", tipo: "fuerza", equipo: "Barra", principales: ["dorsales", "trapecio"], secundarios: ["biceps", "lumbares", "deltoides"], descripcion: "Torso a 45°, espalda neutra, jalar la barra al ombligo." },
  { clave: "remo_mancuerna", nombre: "Remo con mancuerna a una mano", tipo: "fuerza", equipo: "Mancuerna y banco", principales: ["dorsales"], secundarios: ["biceps", "trapecio"], descripcion: "Apoyo en banco, jalar el codo hacia la cadera." },
  { clave: "remo_polea", nombre: "Remo sentado en polea", tipo: "fuerza", equipo: "Polea baja", principales: ["dorsales", "trapecio"], secundarios: ["biceps"], descripcion: "Torso erguido, juntar escápulas al final del recorrido." },
  { clave: "face_pull", nombre: "Face pull", tipo: "fuerza", equipo: "Polea con cuerda", principales: ["deltoides", "trapecio"], secundarios: [], descripcion: "Jalar la cuerda hacia la frente separando las manos; rotación externa." },
  // Hombro
  { clave: "press_militar", nombre: "Press militar de pie", tipo: "fuerza", equipo: "Barra", principales: ["deltoides"], secundarios: ["triceps", "trapecio", "abdominales"], descripcion: "Glúteos y abdomen apretados, empujar la barra por encima de la cabeza." },
  { clave: "press_hombro_mancuernas", nombre: "Press de hombro con mancuernas", tipo: "fuerza", equipo: "Mancuernas", principales: ["deltoides"], secundarios: ["triceps"], descripcion: "Sentado con respaldo, bajar hasta la altura de las orejas." },
  { clave: "elevaciones_laterales", nombre: "Elevaciones laterales", tipo: "fuerza", equipo: "Mancuernas", principales: ["deltoides"], secundarios: ["trapecio"], descripcion: "Subir hasta la altura del hombro con codos ligeramente flexionados." },
  // Brazos
  { clave: "curl_barra", nombre: "Curl de bíceps con barra", tipo: "fuerza", equipo: "Barra", principales: ["biceps"], secundarios: ["antebrazos"], descripcion: "Codos pegados al torso, sin balanceo." },
  { clave: "curl_martillo", nombre: "Curl martillo", tipo: "fuerza", equipo: "Mancuernas", principales: ["biceps", "antebrazos"], secundarios: [], descripcion: "Agarre neutro, alternando brazos." },
  { clave: "extension_triceps_polea", nombre: "Extensión de tríceps en polea", tipo: "fuerza", equipo: "Polea alta", principales: ["triceps"], secundarios: [], descripcion: "Codos fijos, extender completamente abajo." },
  { clave: "press_frances", nombre: "Press francés", tipo: "fuerza", equipo: "Barra Z y banco", principales: ["triceps"], secundarios: [], descripcion: "Bajar la barra a la frente manteniendo los codos apuntando al techo." },
  // Pierna
  { clave: "sentadilla", nombre: "Sentadilla trasera con barra", tipo: "fuerza", equipo: "Barra y rack", principales: ["cuadriceps", "gluteos"], secundarios: ["aductores", "lumbares", "abdominales"], descripcion: "Pies a la anchura de hombros, bajar al menos a paralelo con espalda neutra." },
  { clave: "sentadilla_goblet", nombre: "Sentadilla goblet", tipo: "fuerza", equipo: "Mancuerna o kettlebell", principales: ["cuadriceps", "gluteos"], secundarios: ["abdominales", "aductores"], descripcion: "Carga pegada al pecho, codos por dentro de las rodillas. Ideal para aprender el patrón." },
  { clave: "prensa", nombre: "Prensa de piernas", tipo: "fuerza", equipo: "Máquina", principales: ["cuadriceps", "gluteos"], secundarios: ["isquiotibiales"], descripcion: "No despegar la zona lumbar del respaldo; no bloquear rodillas." },
  { clave: "zancadas", nombre: "Zancadas caminando", tipo: "fuerza", equipo: "Mancuernas", principales: ["cuadriceps", "gluteos"], secundarios: ["isquiotibiales", "aductores"], descripcion: "Paso largo, rodilla trasera cerca del piso, torso erguido." },
  { clave: "sentadilla_bulgara", nombre: "Sentadilla búlgara", tipo: "fuerza", equipo: "Mancuernas y banco", principales: ["cuadriceps", "gluteos"], secundarios: ["aductores"], descripcion: "Pie trasero sobre el banco, bajar vertical." },
  { clave: "peso_muerto", nombre: "Peso muerto convencional", tipo: "fuerza", equipo: "Barra", principales: ["isquiotibiales", "gluteos", "lumbares"], secundarios: ["dorsales", "trapecio", "antebrazos", "cuadriceps"], descripcion: "Barra pegada a las piernas, empujar el piso y extender cadera." },
  { clave: "peso_muerto_rumano", nombre: "Peso muerto rumano", tipo: "fuerza", equipo: "Barra o mancuernas", principales: ["isquiotibiales", "gluteos"], secundarios: ["lumbares"], descripcion: "Bisagra de cadera con rodillas semiflexionadas hasta sentir estiramiento." },
  { clave: "hip_thrust", nombre: "Hip thrust", tipo: "fuerza", equipo: "Barra y banco", principales: ["gluteos"], secundarios: ["isquiotibiales"], descripcion: "Espalda alta en el banco, extender la cadera apretando glúteos arriba." },
  { clave: "curl_femoral", nombre: "Curl femoral acostado", tipo: "fuerza", equipo: "Máquina", principales: ["isquiotibiales"], secundarios: ["pantorrillas"], descripcion: "Cadera pegada al banco, recorrido completo." },
  { clave: "extension_cuadriceps", nombre: "Extensión de cuádriceps", tipo: "fuerza", equipo: "Máquina", principales: ["cuadriceps"], secundarios: [], descripcion: "Pausa de un segundo arriba." },
  { clave: "elevacion_talones", nombre: "Elevación de talones de pie", tipo: "fuerza", equipo: "Máquina o escalón", principales: ["pantorrillas"], secundarios: [], descripcion: "Estirar completo abajo y pausa arriba." },
  // Core
  { clave: "plancha", nombre: "Plancha frontal", tipo: "core", equipo: "Peso corporal", principales: ["abdominales"], secundarios: ["oblicuos", "deltoides"], descripcion: "Codos bajo hombros, glúteos apretados, sin hundir la cadera." },
  { clave: "plancha_lateral", nombre: "Plancha lateral", tipo: "core", equipo: "Peso corporal", principales: ["oblicuos"], secundarios: ["abdominales", "gluteos"], descripcion: "Cuerpo alineado de lado, cadera arriba." },
  { clave: "elevacion_piernas", nombre: "Elevación de piernas colgado", tipo: "core", equipo: "Barra fija", principales: ["abdominales"], secundarios: ["oblicuos", "antebrazos"], descripcion: "Subir las piernas sin balanceo, retroversión pélvica arriba." },
  { clave: "pallof", nombre: "Press Pallof", tipo: "core", equipo: "Polea o banda", principales: ["oblicuos", "abdominales"], secundarios: [], descripcion: "Antirrotación: extender los brazos al frente resistiendo el giro." },
  { clave: "rueda_abdominal", nombre: "Rueda abdominal", tipo: "core", equipo: "Rueda", principales: ["abdominales"], secundarios: ["dorsales", "oblicuos"], descripcion: "Desde rodillas, extender sin arquear la zona lumbar." },
  // Cardio y metabólicos
  { clave: "burpees", nombre: "Burpees", tipo: "cardio", equipo: "Peso corporal", principales: ["cuadriceps", "pectorales"], secundarios: ["gluteos", "deltoides", "abdominales", "triceps"], descripcion: "Sentadilla, plancha, lagartija y salto en un solo movimiento." },
  { clave: "kettlebell_swing", nombre: "Kettlebell swing", tipo: "cardio", equipo: "Kettlebell", principales: ["gluteos", "isquiotibiales"], secundarios: ["lumbares", "deltoides", "abdominales"], descripcion: "Bisagra explosiva de cadera; los brazos solo guían." },
  { clave: "mountain_climbers", nombre: "Mountain climbers", tipo: "cardio", equipo: "Peso corporal", principales: ["abdominales"], secundarios: ["cuadriceps", "deltoides", "oblicuos"], descripcion: "En plancha alta, llevar rodillas al pecho alternando rápido." },
  { clave: "remo_ergometro", nombre: "Remo en ergómetro", tipo: "cardio", equipo: "Remo", principales: ["dorsales", "cuadriceps"], secundarios: ["gluteos", "biceps", "isquiotibiales"], descripcion: "Piernas, cadera y brazos en ese orden." },
  { clave: "bicicleta_intervalos", nombre: "Bicicleta por intervalos (HIIT)", tipo: "cardio", equipo: "Bicicleta estática", principales: ["cuadriceps"], secundarios: ["gluteos", "pantorrillas", "isquiotibiales"], descripcion: "Ej. 30 s intenso / 60 s suave." },
  { clave: "caminata_inclinada", nombre: "Caminata inclinada (LISS)", tipo: "cardio", equipo: "Caminadora", principales: ["gluteos", "pantorrillas"], secundarios: ["isquiotibiales", "cuadriceps"], descripcion: "Frecuencia cardiaca en zona 2 (puede mantener una conversación)." },
  { clave: "saltar_cuerda", nombre: "Saltar la cuerda", tipo: "cardio", equipo: "Cuerda", principales: ["pantorrillas"], secundarios: ["cuadriceps", "deltoides", "antebrazos"], descripcion: "Saltos cortos sobre la punta de los pies." },
  // Potencia
  { clave: "salto_cajon", nombre: "Salto al cajón", tipo: "pliometria", equipo: "Cajón", principales: ["cuadriceps", "gluteos"], secundarios: ["pantorrillas", "isquiotibiales"], descripcion: "Aterrizar suave con rodillas alineadas; bajar caminando." },
  { clave: "power_clean", nombre: "Cargada de potencia (power clean)", tipo: "pliometria", equipo: "Barra", principales: ["gluteos", "isquiotibiales", "trapecio"], secundarios: ["cuadriceps", "lumbares", "deltoides", "antebrazos"], descripcion: "Triple extensión explosiva y recepción en sentadilla parcial." },
  { clave: "lanzamiento_balon", nombre: "Lanzamiento de balón medicinal", tipo: "pliometria", equipo: "Balón medicinal", principales: ["abdominales", "pectorales"], secundarios: ["oblicuos", "deltoides", "triceps"], descripcion: "Lanzamiento de pecho o rotacional contra la pared." },
  // Movilidad
  { clave: "movilidad_cadera", nombre: "Movilidad de cadera 90/90", tipo: "movilidad", equipo: "Peso corporal", principales: ["gluteos", "aductores"], secundarios: [], descripcion: "Transiciones lentas entre ambos lados." },
];

type RutinaSemilla = {
  nombre: string;
  objetivo: Objetivo;
  nivel: Nivel;
  dias_semana: number;
  descripcion: string;
  // [clave del ejercicio, series, repeticiones, descanso en segundos]
  dias: { dia: string; items: [string, number, string, number][] }[];
};

export const RUTINAS_SEMILLA: RutinaSemilla[] = [
  {
    nombre: "Circuito metabólico de cuerpo completo",
    objetivo: "perdida_grasa",
    nivel: "principiante",
    dias_semana: 3,
    descripcion: "Circuitos con descansos cortos para elevar el gasto calórico preservando la masa muscular. Complementar con 2 caminatas LISS.",
    dias: [
      { dia: "Día A", items: [["sentadilla_goblet", 3, "15", 45], ["lagartijas", 3, "12", 45], ["remo_mancuerna", 3, "12 por lado", 45], ["kettlebell_swing", 3, "20", 45], ["plancha", 3, "40 s", 30]] },
      { dia: "Día B", items: [["zancadas", 3, "12 por pierna", 45], ["press_hombro_mancuernas", 3, "12", 45], ["jalon_pecho", 3, "12", 45], ["mountain_climbers", 3, "30 s", 30], ["bicicleta_intervalos", 1, "10 × 30 s", 60]] },
      { dia: "Día C", items: [["peso_muerto_rumano", 3, "12", 60], ["press_inclinado_mancuernas", 3, "12", 45], ["remo_polea", 3, "12", 45], ["burpees", 3, "10", 45], ["caminata_inclinada", 1, "25 min", 0]] },
    ],
  },
  {
    nombre: "Fuerza + HIIT 4 días",
    objetivo: "perdida_grasa",
    nivel: "intermedio",
    dias_semana: 4,
    descripcion: "Dos días de fuerza con superseries y dos días de HIIT. Mantiene el estímulo de fuerza mientras se acelera la pérdida de grasa.",
    dias: [
      { dia: "Día 1 — Fuerza tren inferior", items: [["sentadilla", 4, "10", 75], ["hip_thrust", 3, "12", 60], ["zancadas", 3, "12 por pierna", 45], ["curl_femoral", 3, "15", 45], ["plancha_lateral", 3, "30 s por lado", 30]] },
      { dia: "Día 2 — HIIT", items: [["bicicleta_intervalos", 1, "12 × 30 s", 60], ["kettlebell_swing", 4, "20", 40], ["burpees", 4, "12", 40]] },
      { dia: "Día 3 — Fuerza tren superior", items: [["press_banca", 4, "10", 75], ["remo_barra", 4, "10", 75], ["press_hombro_mancuernas", 3, "12", 45], ["jalon_pecho", 3, "12", 45], ["mountain_climbers", 3, "40 s", 30]] },
      { dia: "Día 4 — Acondicionamiento", items: [["remo_ergometro", 1, "8 × 250 m", 60], ["saltar_cuerda", 5, "60 s", 30], ["rueda_abdominal", 3, "10", 45]] },
    ],
  },
  {
    nombre: "Torso / Pierna 4 días",
    objetivo: "ganancia_muscular",
    nivel: "intermedio",
    dias_semana: 4,
    descripcion: "Cada grupo muscular se entrena dos veces por semana con volumen moderado-alto y sobrecarga progresiva.",
    dias: [
      { dia: "Torso A", items: [["press_banca", 4, "6–8", 120], ["remo_barra", 4, "8–10", 120], ["press_hombro_mancuernas", 3, "8–10", 90], ["jalon_pecho", 3, "10–12", 90], ["curl_barra", 3, "10–12", 60], ["extension_triceps_polea", 3, "10–12", 60]] },
      { dia: "Pierna A", items: [["sentadilla", 4, "6–8", 150], ["peso_muerto_rumano", 3, "8–10", 120], ["prensa", 3, "10–12", 90], ["curl_femoral", 3, "10–12", 60], ["elevacion_talones", 4, "12–15", 60]] },
      { dia: "Torso B", items: [["press_inclinado_mancuernas", 4, "8–10", 90], ["dominadas", 4, "6–10", 120], ["remo_polea", 3, "10–12", 90], ["elevaciones_laterales", 4, "12–15", 60], ["curl_martillo", 3, "10–12", 60], ["press_frances", 3, "10–12", 60]] },
      { dia: "Pierna B", items: [["peso_muerto", 3, "5", 180], ["sentadilla_bulgara", 3, "8–10 por pierna", 90], ["hip_thrust", 3, "8–10", 90], ["extension_cuadriceps", 3, "12–15", 60], ["elevacion_piernas", 3, "10–12", 60]] },
    ],
  },
  {
    nombre: "Empuje / Jalón / Pierna (PPL)",
    objetivo: "ganancia_muscular",
    nivel: "avanzado",
    dias_semana: 6,
    descripcion: "Se repite el ciclo dos veces por semana. Máximo volumen por grupo para personas con experiencia.",
    dias: [
      { dia: "Empuje", items: [["press_banca", 4, "6–8", 120], ["press_militar", 3, "8–10", 120], ["press_inclinado_mancuernas", 3, "10–12", 90], ["elevaciones_laterales", 4, "12–15", 60], ["aperturas_polea", 3, "12–15", 60], ["fondos", 3, "10–12", 90]] },
      { dia: "Jalón", items: [["peso_muerto", 3, "5", 180], ["dominadas", 4, "6–10", 120], ["remo_polea", 3, "10–12", 90], ["face_pull", 3, "15", 60], ["curl_barra", 3, "8–10", 60], ["curl_martillo", 3, "10–12", 60]] },
      { dia: "Pierna", items: [["sentadilla", 4, "6–8", 150], ["prensa", 3, "10–12", 90], ["peso_muerto_rumano", 3, "8–10", 120], ["curl_femoral", 3, "10–12", 60], ["elevacion_talones", 4, "12–15", 60], ["pallof", 3, "12 por lado", 45]] },
    ],
  },
  {
    nombre: "Cuerpo completo para recomposición",
    objetivo: "recomposicion",
    nivel: "principiante",
    dias_semana: 3,
    descripcion: "Tres sesiones de fuerza de cuerpo completo más 2–3 sesiones de caminata inclinada en zona 2.",
    dias: [
      { dia: "Día A", items: [["sentadilla_goblet", 3, "10–12", 75], ["press_banca", 3, "8–10", 90], ["remo_mancuerna", 3, "10–12", 75], ["peso_muerto_rumano", 3, "10", 75], ["plancha", 3, "40 s", 45]] },
      { dia: "Día B", items: [["prensa", 3, "10–12", 75], ["press_hombro_mancuernas", 3, "10", 75], ["jalon_pecho", 3, "10–12", 75], ["hip_thrust", 3, "10–12", 75], ["pallof", 3, "12 por lado", 45]] },
      { dia: "Día C", items: [["zancadas", 3, "10 por pierna", 75], ["press_inclinado_mancuernas", 3, "10", 75], ["remo_polea", 3, "10–12", 75], ["curl_femoral", 3, "12", 60], ["caminata_inclinada", 1, "30 min", 0]] },
    ],
  },
  {
    nombre: "Recomposición torso / pierna + cardio",
    objetivo: "recomposicion",
    nivel: "intermedio",
    dias_semana: 4,
    descripcion: "Fuerza en rango de hipertrofia con cardio moderado al final de dos sesiones.",
    dias: [
      { dia: "Torso", items: [["press_banca", 4, "8–10", 90], ["remo_barra", 4, "8–10", 90], ["press_militar", 3, "8–10", 90], ["dominadas", 3, "máx.", 90], ["extension_triceps_polea", 2, "12", 60], ["curl_barra", 2, "12", 60]] },
      { dia: "Pierna", items: [["sentadilla", 4, "8–10", 120], ["peso_muerto_rumano", 3, "10", 90], ["sentadilla_bulgara", 3, "10 por pierna", 75], ["elevacion_talones", 3, "15", 45], ["caminata_inclinada", 1, "20 min", 0]] },
      { dia: "Torso (volumen)", items: [["press_inclinado_mancuernas", 3, "10–12", 75], ["remo_polea", 3, "10–12", 75], ["elevaciones_laterales", 3, "15", 45], ["face_pull", 3, "15", 45], ["rueda_abdominal", 3, "10", 60]] },
      { dia: "Pierna (glúteo)", items: [["hip_thrust", 4, "10", 90], ["prensa", 3, "12", 75], ["curl_femoral", 3, "12", 60], ["plancha_lateral", 3, "30 s por lado", 30], ["remo_ergometro", 1, "15 min", 0]] },
    ],
  },
  {
    nombre: "Fuerza y potencia 4 días",
    objetivo: "rendimiento",
    nivel: "avanzado",
    dias_semana: 4,
    descripcion: "Bloque de fuerza máxima con trabajo de potencia al inicio de cada sesión, cuando el sistema nervioso está fresco.",
    dias: [
      { dia: "Potencia + pierna", items: [["salto_cajon", 5, "3", 120], ["sentadilla", 5, "3–5", 180], ["peso_muerto_rumano", 3, "6", 120], ["pallof", 3, "10 por lado", 60]] },
      { dia: "Potencia + empuje", items: [["lanzamiento_balon", 5, "4", 90], ["press_banca", 5, "3–5", 180], ["press_militar", 4, "5", 150], ["fondos", 3, "6–8", 120]] },
      { dia: "Olímpico + jalón", items: [["power_clean", 5, "3", 150], ["peso_muerto", 4, "3", 180], ["dominadas", 4, "5 lastradas", 150], ["remo_barra", 3, "6", 120]] },
      { dia: "Acondicionamiento", items: [["remo_ergometro", 1, "6 × 500 m", 90], ["kettlebell_swing", 5, "15", 60], ["saltar_cuerda", 5, "60 s", 30], ["movilidad_cadera", 2, "5 min", 0]] },
    ],
  },
  {
    nombre: "Acondicionamiento atlético 3 días",
    objetivo: "rendimiento",
    nivel: "intermedio",
    dias_semana: 3,
    descripcion: "Fuerza base, pliometría y capacidad aeróbica para deportistas recreativos.",
    dias: [
      { dia: "Día A", items: [["salto_cajon", 4, "5", 90], ["sentadilla", 4, "5", 150], ["dominadas", 4, "6", 120], ["bicicleta_intervalos", 1, "8 × 20 s", 90]] },
      { dia: "Día B", items: [["lanzamiento_balon", 4, "6", 90], ["press_banca", 4, "5", 150], ["hip_thrust", 3, "8", 90], ["plancha_lateral", 3, "40 s por lado", 45]] },
      { dia: "Día C", items: [["kettlebell_swing", 4, "15", 60], ["sentadilla_bulgara", 3, "6 por pierna", 90], ["remo_barra", 4, "6", 120], ["remo_ergometro", 1, "20 min", 0]] },
    ],
  },
];
