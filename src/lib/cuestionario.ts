// Cuestionario de onboarding. Las respuestas se guardan como documento JSON en el cliente
// (clientes.onboarding) y alimentan el módulo de perfil clínico.

export type Pregunta = {
  clave: string;
  texto: string;
  tipo: "texto" | "parrafo" | "opciones" | "hora";
  opciones?: string[];
};

export type Seccion = {
  clave: string;
  titulo: string;
  soloSexo?: "F";
  preguntas: Pregunta[];
};

export const SECCIONES: Seccion[] = [
  {
    clave: "salud",
    titulo: "Historial médico y salud",
    preguntas: [
      { clave: "enfermedades", texto: "¿Tienes alguna enfermedad crónica diagnosticada?", tipo: "parrafo" },
      { clave: "medicamentos", texto: "¿Tomas algún medicamento regular? (especificar)", tipo: "parrafo" },
      { clave: "cirugias_lesiones", texto: "¿Tienes cirugías previas, lesiones actuales o molestias físicas?", tipo: "parrafo" },
      { clave: "fracturas", texto: "En los últimos 5 años, ¿has sufrido alguna fractura?", tipo: "texto" },
      { clave: "digestion", texto: "¿Cómo evalúas tu sistema digestivo?", tipo: "opciones", opciones: ["Excelente", "Bueno", "Regular", "Malo"] },
      { clave: "digestion_por_que", texto: "¿Por qué?", tipo: "texto" },
    ],
  },
  {
    clave: "hormonal",
    titulo: "Perfil hormonal",
    soloSexo: "F",
    preguntas: [
      { clave: "ciclo_regular", texto: "¿Tu ciclo menstrual es regular?", tipo: "opciones", opciones: ["Sí", "No", "No aplica"] },
      { clave: "ciclo_dias", texto: "¿Cuántos días dura habitualmente?", tipo: "texto" },
      { clave: "ciclo_sintomas", texto: "¿Experimentas dolor severo o síntomas atípicos durante tu periodo?", tipo: "parrafo" },
      { clave: "anticonceptivo", texto: "¿Utilizas algún método anticonceptivo hormonal o de otro tipo?", tipo: "texto" },
      { clave: "embarazos", texto: "¿Tienes hijos? ¿A qué edad fue tu primer embarazo?", tipo: "texto" },
    ],
  },
  {
    clave: "estilo_vida",
    titulo: "Estilo de vida y descanso",
    preguntas: [
      { clave: "hora_despertar", texto: "¿A qué hora sueles despertarte?", tipo: "hora" },
      { clave: "hora_dormir", texto: "¿A qué hora sueles acostarte?", tipo: "hora" },
      { clave: "descanso_reparador", texto: "Al despertar, ¿sientes que tuviste un descanso reparador?", tipo: "opciones", opciones: ["Sí", "A veces", "No"] },
      { clave: "fuma", texto: "¿Fumas? (frecuencia / cantidad)", tipo: "texto" },
      { clave: "alcohol", texto: "¿Consumes alcohol? (frecuencia / cantidad)", tipo: "texto" },
      { clave: "rutina_diaria", texto: "Describe brevemente cómo es la rutina de un día normal para ti", tipo: "parrafo" },
    ],
  },
  {
    clave: "nutricion",
    titulo: "Nutrición e hidratación",
    preguntas: [
      { clave: "alergias", texto: "¿Tienes alergias o intolerancias alimentarias?", tipo: "texto" },
      { clave: "aversiones", texto: "¿Qué alimentos definitivamente NO te gustan?", tipo: "texto" },
      { clave: "fruta_favorita", texto: "¿Cuál es tu fruta favorita?", tipo: "texto" },
      { clave: "agua_litros", texto: "¿Cuántos litros de agua consumes al día en promedio?", tipo: "texto" },
      { clave: "suplementos", texto: "¿Consumes algún suplemento actualmente? (proteína, creatina, vitaminas…)", tipo: "texto" },
      { clave: "dificultad_cocinar", texto: "¿Se te dificulta cocinar o preparar tus propias comidas?", tipo: "opciones", opciones: ["No", "Un poco", "Sí"] },
      { clave: "comidas_dia", texto: "¿Cuántas comidas sueles hacer al día?", tipo: "texto" },
    ],
  },
  {
    clave: "actividad",
    titulo: "Actividad física actual",
    preguntas: [
      { clave: "horario_entreno", texto: "¿A qué hora prefieres entrenar y cuánto tiempo le dedicas?", tipo: "texto" },
      { clave: "cardio", texto: "¿Realizas ejercicio cardiovascular? (tipo, duración y frecuencia)", tipo: "parrafo" },
    ],
  },
  {
    clave: "psicologia",
    titulo: "Aspectos psicológicos",
    preguntas: [
      { clave: "area_prioritaria", texto: "¿Qué es lo que menos te gusta de tu condición física actual o qué área buscas mejorar con mayor prioridad?", tipo: "parrafo" },
    ],
  },
];

export const CLAVES_ONBOARDING = SECCIONES.flatMap((s) => s.preguntas.map((p) => p.clave));

/** Respuestas que merecen una alerta para quien diseña la rutina. */
export const CLAVES_ALERTA = ["enfermedades", "medicamentos", "cirugias_lesiones", "fracturas"];
