// Base de alimentos para generar los menús. Valores por 100 g (cocidos cuando aplica),
// tomados de tablas de composición de uso común (SMAE / USDA), redondeados.

export type Categoria = "proteina" | "carbohidrato" | "grasa" | "verdura" | "fruta" | "lacteo";

// Etiquetas para excluir alimentos por alergias, intolerancias o aversiones.
export type Etiqueta = "lacteo" | "gluten" | "huevo" | "pescado" | "mariscos" | "frutos_secos" | "soya" | "cerdo" | "res" | "rapido";

export type Alimento = {
  clave: string;
  nombre: string;
  categoria: Categoria;
  kcal: number;
  p: number;
  c: number;
  g: number;
  etiquetas: Etiqueta[];
  /** Medida casera: nombre de la unidad y gramos que pesa. */
  unidad?: { nombre: string; gramos: number };
  /** Momentos en los que tiene sentido servirlo. */
  momentos: ("desayuno" | "comida" | "cena" | "colacion")[];
};

const TODO: Alimento["momentos"] = ["desayuno", "comida", "cena"];

export const ALIMENTOS: Alimento[] = [
  // Proteínas
  { clave: "pechuga_pollo", nombre: "Pechuga de pollo a la plancha", categoria: "proteina", kcal: 165, p: 31, c: 0, g: 3.6, etiquetas: [], momentos: ["comida", "cena"] },
  { clave: "pavo_molido", nombre: "Pavo molido", categoria: "proteina", kcal: 150, p: 27, c: 0, g: 4.5, etiquetas: [], momentos: ["comida", "cena"] },
  { clave: "res_magra", nombre: "Bistec de res magro", categoria: "proteina", kcal: 170, p: 28, c: 0, g: 6, etiquetas: ["res"], momentos: ["comida", "cena"] },
  { clave: "lomo_cerdo", nombre: "Lomo de cerdo", categoria: "proteina", kcal: 165, p: 28, c: 0, g: 5.5, etiquetas: ["cerdo"], momentos: ["comida", "cena"] },
  { clave: "salmon", nombre: "Salmón al horno", categoria: "proteina", kcal: 206, p: 22, c: 0, g: 12, etiquetas: ["pescado"], momentos: ["comida", "cena"] },
  { clave: "tilapia", nombre: "Filete de tilapia", categoria: "proteina", kcal: 128, p: 26, c: 0, g: 2.7, etiquetas: ["pescado"], momentos: ["comida", "cena"] },
  { clave: "atun_agua", nombre: "Atún en agua", categoria: "proteina", kcal: 116, p: 26, c: 0, g: 1, etiquetas: ["pescado", "rapido"], unidad: { nombre: "lata drenada", gramos: 100 }, momentos: ["comida", "cena", "colacion"] },
  { clave: "camaron", nombre: "Camarón cocido", categoria: "proteina", kcal: 99, p: 24, c: 0.2, g: 0.3, etiquetas: ["mariscos"], momentos: ["comida", "cena"] },
  { clave: "huevo", nombre: "Huevo entero", categoria: "proteina", kcal: 143, p: 12.6, c: 0.7, g: 9.5, etiquetas: ["huevo"], unidad: { nombre: "pieza", gramos: 50 }, momentos: ["desayuno", "cena", "colacion"] },
  { clave: "pavo_rebanado", nombre: "Pechuga de pavo rebanada", categoria: "proteina", kcal: 104, p: 18, c: 3.5, g: 1.7, etiquetas: ["rapido"], unidad: { nombre: "rebanada", gramos: 20 }, momentos: ["desayuno", "colacion"] },
  { clave: "edamames", nombre: "Edamames", categoria: "proteina", kcal: 121, p: 11.9, c: 8.9, g: 5.2, etiquetas: ["soya", "rapido"], unidad: { nombre: "taza", gramos: 155 }, momentos: ["colacion"] },
  { clave: "proteina_vegetal", nombre: "Proteína vegetal en polvo (chícharo)", categoria: "proteina", kcal: 380, p: 80, c: 5, g: 6, etiquetas: ["rapido"], unidad: { nombre: "scoop", gramos: 30 }, momentos: ["colacion"] },
  { clave: "claras", nombre: "Claras de huevo", categoria: "proteina", kcal: 52, p: 11, c: 0.7, g: 0.2, etiquetas: ["huevo"], momentos: ["desayuno", "cena"] },
  { clave: "tofu", nombre: "Tofu firme", categoria: "proteina", kcal: 144, p: 17, c: 3, g: 8.7, etiquetas: ["soya"], momentos: TODO },
  { clave: "queso_panela", nombre: "Queso panela", categoria: "proteina", kcal: 200, p: 18, c: 3, g: 13, etiquetas: ["lacteo", "rapido"], momentos: ["desayuno", "cena", "colacion"] },
  { clave: "pollo_deshebrado", nombre: "Pollo deshebrado", categoria: "proteina", kcal: 170, p: 30, c: 0, g: 5, etiquetas: ["rapido"], momentos: ["desayuno", "comida", "cena"] },
  { clave: "frijoles", nombre: "Frijoles de la olla", categoria: "carbohidrato", kcal: 127, p: 8.7, c: 22.8, g: 0.5, etiquetas: [], unidad: { nombre: "taza", gramos: 170 }, momentos: TODO },
  { clave: "lentejas", nombre: "Lentejas cocidas", categoria: "carbohidrato", kcal: 116, p: 9, c: 20, g: 0.4, etiquetas: [], unidad: { nombre: "taza", gramos: 200 }, momentos: ["comida", "cena"] },
  // Lácteos y colaciones proteicas
  { clave: "yogur_griego", nombre: "Yogur griego natural", categoria: "lacteo", kcal: 97, p: 9, c: 3.9, g: 5, etiquetas: ["lacteo", "rapido"], unidad: { nombre: "taza", gramos: 200 }, momentos: ["desayuno", "colacion"] },
  { clave: "leche_light", nombre: "Leche descremada", categoria: "lacteo", kcal: 35, p: 3.4, c: 5, g: 0.1, etiquetas: ["lacteo", "rapido"], unidad: { nombre: "taza", gramos: 240 }, momentos: ["desayuno", "colacion"] },
  { clave: "cottage", nombre: "Queso cottage", categoria: "lacteo", kcal: 98, p: 11, c: 3.4, g: 4.3, etiquetas: ["lacteo", "rapido"], momentos: ["desayuno", "colacion"] },
  { clave: "bebida_soya", nombre: "Bebida de soya sin azúcar", categoria: "lacteo", kcal: 33, p: 3.3, c: 0.6, g: 1.8, etiquetas: ["soya", "rapido"], unidad: { nombre: "taza", gramos: 240 }, momentos: ["desayuno", "colacion"] },
  { clave: "proteina_polvo", nombre: "Proteína en polvo (whey)", categoria: "lacteo", kcal: 380, p: 78, c: 8, g: 5, etiquetas: ["lacteo", "rapido"], unidad: { nombre: "scoop", gramos: 30 }, momentos: ["colacion"] },
  // Carbohidratos
  { clave: "avena", nombre: "Avena en hojuelas", categoria: "carbohidrato", kcal: 379, p: 13, c: 67, g: 6.5, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 80 }, momentos: ["desayuno", "colacion"] },
  { clave: "arroz", nombre: "Arroz cocido", categoria: "carbohidrato", kcal: 130, p: 2.7, c: 28, g: 0.3, etiquetas: [], unidad: { nombre: "taza", gramos: 160 }, momentos: ["comida", "cena"] },
  { clave: "arroz_integral", nombre: "Arroz integral cocido", categoria: "carbohidrato", kcal: 123, p: 2.7, c: 25.6, g: 1, etiquetas: [], unidad: { nombre: "taza", gramos: 160 }, momentos: ["comida", "cena"] },
  { clave: "tortilla_maiz", nombre: "Tortilla de maíz", categoria: "carbohidrato", kcal: 218, p: 5.7, c: 44.6, g: 2.9, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 30 }, momentos: TODO },
  { clave: "pan_integral", nombre: "Pan integral", categoria: "carbohidrato", kcal: 247, p: 13, c: 41, g: 3.4, etiquetas: ["gluten", "rapido"], unidad: { nombre: "rebanada", gramos: 30 }, momentos: ["desayuno", "cena"] },
  { clave: "papa", nombre: "Papa cocida", categoria: "carbohidrato", kcal: 87, p: 1.9, c: 20, g: 0.1, etiquetas: [], unidad: { nombre: "pieza mediana", gramos: 150 }, momentos: ["comida", "cena"] },
  { clave: "camote", nombre: "Camote al horno", categoria: "carbohidrato", kcal: 90, p: 2, c: 20.7, g: 0.2, etiquetas: [], momentos: ["comida", "cena", "desayuno"] },
  { clave: "pasta_integral", nombre: "Pasta integral cocida", categoria: "carbohidrato", kcal: 149, p: 6, c: 30, g: 1.7, etiquetas: ["gluten"], unidad: { nombre: "taza", gramos: 140 }, momentos: ["comida"] },
  { clave: "quinoa", nombre: "Quinoa cocida", categoria: "carbohidrato", kcal: 120, p: 4.4, c: 21.3, g: 1.9, etiquetas: [], unidad: { nombre: "taza", gramos: 185 }, momentos: ["comida", "cena"] },
  { clave: "galletas_arroz", nombre: "Galletas de arroz inflado", categoria: "carbohidrato", kcal: 387, p: 8, c: 81, g: 2.8, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 9 }, momentos: ["colacion"] },
  // Grasas
  { clave: "aguacate", nombre: "Aguacate", categoria: "grasa", kcal: 160, p: 2, c: 8.5, g: 14.7, etiquetas: ["rapido"], unidad: { nombre: "pieza chica", gramos: 100 }, momentos: TODO },
  { clave: "aceite_oliva", nombre: "Aceite de oliva", categoria: "grasa", kcal: 884, p: 0, c: 0, g: 100, etiquetas: [], unidad: { nombre: "cucharadita", gramos: 5 }, momentos: ["comida", "cena"] },
  { clave: "almendras", nombre: "Almendras", categoria: "grasa", kcal: 579, p: 21, c: 21.6, g: 49.9, etiquetas: ["frutos_secos", "rapido"], unidad: { nombre: "pieza", gramos: 1.2 }, momentos: ["desayuno", "colacion"] },
  { clave: "nueces", nombre: "Nueces", categoria: "grasa", kcal: 654, p: 15, c: 13.7, g: 65, etiquetas: ["frutos_secos", "rapido"], momentos: ["desayuno", "colacion"] },
  { clave: "crema_cacahuate", nombre: "Crema de cacahuate natural", categoria: "grasa", kcal: 588, p: 25, c: 20, g: 50, etiquetas: ["frutos_secos", "rapido"], unidad: { nombre: "cucharada", gramos: 16 }, momentos: ["desayuno", "colacion"] },
  { clave: "semillas_chia", nombre: "Semillas de chía", categoria: "grasa", kcal: 486, p: 17, c: 42, g: 31, etiquetas: ["rapido"], unidad: { nombre: "cucharada", gramos: 12 }, momentos: ["desayuno", "colacion"] },
  // Verduras
  { clave: "brocoli", nombre: "Brócoli al vapor", categoria: "verdura", kcal: 35, p: 2.4, c: 7.2, g: 0.4, etiquetas: [], momentos: ["comida", "cena"] },
  { clave: "ensalada", nombre: "Ensalada verde (lechuga, pepino, jitomate)", categoria: "verdura", kcal: 18, p: 1, c: 3.5, g: 0.2, etiquetas: ["rapido"], momentos: ["comida", "cena"] },
  { clave: "calabacita", nombre: "Calabacita asada", categoria: "verdura", kcal: 17, p: 1.2, c: 3.1, g: 0.3, etiquetas: [], momentos: ["comida", "cena", "desayuno"] },
  { clave: "nopales", nombre: "Nopales asados", categoria: "verdura", kcal: 16, p: 1.3, c: 3.3, g: 0.1, etiquetas: [], momentos: TODO },
  { clave: "espinaca", nombre: "Espinacas salteadas", categoria: "verdura", kcal: 23, p: 2.9, c: 3.6, g: 0.4, etiquetas: [], momentos: TODO },
  { clave: "ejotes", nombre: "Ejotes cocidos", categoria: "verdura", kcal: 35, p: 1.9, c: 7.9, g: 0.3, etiquetas: [], momentos: ["comida", "cena"] },
  { clave: "champinones", nombre: "Champiñones salteados", categoria: "verdura", kcal: 28, p: 2.2, c: 5.3, g: 0.5, etiquetas: [], momentos: TODO },
  { clave: "pico_gallo", nombre: "Pico de gallo", categoria: "verdura", kcal: 20, p: 0.8, c: 4.4, g: 0.2, etiquetas: ["rapido"], momentos: TODO },
  // Frutas
  { clave: "manzana", nombre: "Manzana", categoria: "fruta", kcal: 52, p: 0.3, c: 13.8, g: 0.2, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 180 }, momentos: ["desayuno", "colacion"] },
  { clave: "platano", nombre: "Plátano", categoria: "fruta", kcal: 89, p: 1.1, c: 22.8, g: 0.3, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 120 }, momentos: ["desayuno", "colacion"] },
  { clave: "papaya", nombre: "Papaya", categoria: "fruta", kcal: 43, p: 0.5, c: 10.8, g: 0.3, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 140 }, momentos: ["desayuno", "colacion"] },
  { clave: "fresas", nombre: "Fresas", categoria: "fruta", kcal: 32, p: 0.7, c: 7.7, g: 0.3, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 150 }, momentos: ["desayuno", "colacion"] },
  { clave: "mango", nombre: "Mango", categoria: "fruta", kcal: 60, p: 0.8, c: 15, g: 0.4, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 165 }, momentos: ["desayuno", "colacion"] },
  { clave: "pina", nombre: "Piña", categoria: "fruta", kcal: 50, p: 0.5, c: 13.1, g: 0.1, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 165 }, momentos: ["desayuno", "colacion"] },
  { clave: "guayaba", nombre: "Guayaba", categoria: "fruta", kcal: 68, p: 2.6, c: 14.3, g: 1, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 90 }, momentos: ["desayuno", "colacion"] },
  { clave: "naranja", nombre: "Naranja", categoria: "fruta", kcal: 47, p: 0.9, c: 11.8, g: 0.1, etiquetas: ["rapido"], unidad: { nombre: "pieza", gramos: 150 }, momentos: ["desayuno", "colacion"] },
  { clave: "arandanos", nombre: "Arándanos", categoria: "fruta", kcal: 57, p: 0.7, c: 14.5, g: 0.3, etiquetas: ["rapido"], unidad: { nombre: "taza", gramos: 150 }, momentos: ["desayuno", "colacion"] },
];

/** Palabras que, si aparecen en alergias o intolerancias, excluyen una etiqueta completa. */
export const PALABRAS_ETIQUETA: Record<Etiqueta, RegExp> = {
  lacteo: /lact|l[aá]cteo|leche|queso|yogur/,
  gluten: /gluten|trigo|cel[ií]ac/,
  huevo: /huevo/,
  pescado: /pescado|at[uú]n|salm[oó]n|tilapia/,
  mariscos: /marisco|camar[oó]n|crust[aá]ceo/,
  frutos_secos: /nuez|nueces|cacahuate|man[ií]|almendra|frutos? secos?|oleaginosa/,
  soya: /soya|soja|tofu/,
  cerdo: /cerdo|puerco/,
  res: /\bres\b|carne roja|bistec/,
  rapido: /$^/,
};

/**
 * En aversiones ("no me gusta") solo se excluye la categoría completa si se nombra de forma genérica;
 * "atún" excluye el atún, pero no todo el pescado.
 */
export const PALABRAS_GENERICAS: Partial<Record<Etiqueta, RegExp>> = {
  lacteo: /l[aá]cteos|\bleche\b/,
  gluten: /gluten|harinas?/,
  huevo: /huevo/,
  pescado: /pescados?\b/,
  mariscos: /mariscos?/,
  frutos_secos: /frutos? secos?|nueces|oleaginosas/,
  soya: /soya|soja/,
  cerdo: /cerdo|puerco/,
  res: /\bres\b|carne roja/,
};

export const NOMBRE_ETIQUETA: Record<Etiqueta, string> = {
  lacteo: "lácteos",
  gluten: "gluten",
  huevo: "huevo",
  pescado: "pescado",
  mariscos: "mariscos",
  frutos_secos: "frutos secos y cacahuate",
  soya: "soya",
  cerdo: "cerdo",
  res: "carne de res",
  rapido: "",
};
