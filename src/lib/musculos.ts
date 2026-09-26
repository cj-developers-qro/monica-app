// Catálogo de grupos musculares y generador del diagrama anatómico (SVG).
// El diagrama se usa como la imagen de cada ejercicio y de cada rutina:
// los músculos principales se pintan en rojo intenso y los secundarios en rojo claro.

export const MUSCULOS = {
  pectorales: "Pectorales",
  deltoides: "Hombros (deltoides)",
  trapecio: "Trapecio",
  dorsales: "Dorsales",
  lumbares: "Zona lumbar",
  biceps: "Bíceps",
  triceps: "Tríceps",
  antebrazos: "Antebrazos",
  abdominales: "Abdominales",
  oblicuos: "Oblicuos",
  gluteos: "Glúteos",
  cuadriceps: "Cuádriceps",
  isquiotibiales: "Isquiotibiales",
  aductores: "Aductores",
  pantorrillas: "Pantorrillas",
} as const;

export type Musculo = keyof typeof MUSCULOS;

export const LISTA_MUSCULOS = Object.keys(MUSCULOS) as Musculo[];

export function esMusculo(valor: string): valor is Musculo {
  return valor in MUSCULOS;
}

export function nombreMusculo(m: string) {
  return esMusculo(m) ? MUSCULOS[m] : m;
}

export const COLOR_PRINCIPAL = "#dc2626";
export const COLOR_SECUNDARIO = "#fca5a5";
const COLOR_NEUTRO = "#e2e8f0";
const COLOR_TRAZO = "#94a3b8";
const COLOR_SILUETA = "#f8fafc";

type Forma = { m: Musculo; svg: string };

const elipse = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;

// Crea la forma del lado izquierdo y su reflejo en el lado derecho (eje x = 100).
function par(m: Musculo, cx: number, cy: number, rx: number, ry: number): Forma[] {
  return [
    { m, svg: elipse(cx, cy, rx, ry) },
    { m, svg: elipse(200 - cx, cy, rx, ry) },
  ];
}

const SILUETA = [
  `<circle cx="100" cy="34" r="18"/>`,
  `<rect x="91" y="50" width="18" height="16" rx="4"/>`,
  `<path d="M62,70 Q100,60 138,70 L142,118 Q136,160 130,180 L70,180 Q64,160 58,118 Z"/>`,
  `<rect x="43" y="72" width="24" height="70" rx="11"/>`,
  `<rect x="133" y="72" width="24" height="70" rx="11"/>`,
  `<rect x="39" y="138" width="21" height="52" rx="10"/>`,
  `<rect x="140" y="138" width="21" height="52" rx="10"/>`,
  `<circle cx="48" cy="198" r="9"/>`,
  `<circle cx="152" cy="198" r="9"/>`,
  `<path d="M70,176 L130,176 L134,206 L66,206 Z"/>`,
  `<rect x="67" y="192" width="32" height="78" rx="14"/>`,
  `<rect x="101" y="192" width="32" height="78" rx="14"/>`,
  `<rect x="72" y="266" width="24" height="72" rx="11"/>`,
  `<rect x="104" y="266" width="24" height="72" rx="11"/>`,
  `<ellipse cx="82" cy="344" rx="13" ry="6"/>`,
  `<ellipse cx="118" cy="344" rx="13" ry="6"/>`,
].join("");

const FRONTAL: Forma[] = [
  { m: "trapecio", svg: `<path d="M91,62 L70,72 L91,72 Z"/>` },
  { m: "trapecio", svg: `<path d="M109,62 L130,72 L109,72 Z"/>` },
  ...par("deltoides", 64, 82, 12, 12),
  ...par("pectorales", 85, 94, 15, 11),
  ...par("biceps", 55, 112, 8, 19),
  ...par("antebrazos", 49, 163, 8, 21),
  { m: "abdominales", svg: `<rect x="90" y="110" width="20" height="58" rx="6"/>` },
  ...par("oblicuos", 78, 142, 7, 21),
  ...par("cuadriceps", 82, 230, 11, 33),
  ...par("aductores", 96.5, 214, 3.5, 17),
  ...par("pantorrillas", 84, 300, 8, 25),
];

const POSTERIOR: Forma[] = [
  { m: "trapecio", svg: `<path d="M100,56 L128,74 L108,96 L100,122 L92,96 L72,74 Z"/>` },
  ...par("deltoides", 64, 82, 12, 12),
  ...par("dorsales", 81, 128, 11, 27),
  ...par("triceps", 55, 112, 8, 19),
  ...par("antebrazos", 49, 163, 8, 21),
  { m: "lumbares", svg: `<rect x="91" y="140" width="18" height="34" rx="5"/>` },
  ...par("gluteos", 87, 197, 13, 14),
  ...par("isquiotibiales", 84, 241, 11, 27),
  ...par("pantorrillas", 84, 298, 10, 23),
];

function vista(formas: Forma[], principales: Set<string>, secundarios: Set<string>, dx: number, titulo: string) {
  const musculos = formas
    .map(({ m, svg }) => {
      const color = principales.has(m) ? COLOR_PRINCIPAL : secundarios.has(m) ? COLOR_SECUNDARIO : COLOR_NEUTRO;
      return svg.replace("/>", ` fill="${color}"><title>${MUSCULOS[m]}</title></${svg.slice(1, svg.indexOf(" "))}>`);
    })
    .join("");
  return (
    `<g transform="translate(${dx},0)">` +
    `<g fill="${COLOR_SILUETA}" stroke="${COLOR_TRAZO}" stroke-width="1.2">${SILUETA}</g>` +
    `<g stroke="#ffffff" stroke-width="1.5">${musculos}</g>` +
    `<text x="100" y="372" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#475569">${titulo}</text>` +
    `</g>`
  );
}

/** Devuelve el diagrama de cuerpo completo (vista frontal y posterior) como SVG. */
export function diagramaMusculosSVG(principales: string[], secundarios: string[] = []): string {
  const p = new Set(principales.filter(esMusculo));
  const s = new Set(secundarios.filter((m) => esMusculo(m) && !p.has(m)));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 385" role="img">` +
    `<rect width="420" height="385" fill="#ffffff"/>` +
    vista(FRONTAL, p, s, 5, "Frontal") +
    vista(POSTERIOR, p, s, 215, "Posterior") +
    `</svg>`
  );
}

/** Une los músculos de varios ejercicios: un músculo principal en cualquiera gana sobre secundario. */
export function combinarMusculos(ejercicios: { musculos_principales: string[]; musculos_secundarios: string[] }[]) {
  const principales = new Set<string>();
  const secundarios = new Set<string>();
  for (const e of ejercicios) {
    e.musculos_principales.forEach((m) => principales.add(m));
    e.musculos_secundarios.forEach((m) => secundarios.add(m));
  }
  principales.forEach((m) => secundarios.delete(m));
  return { principales: [...principales], secundarios: [...secundarios] };
}
