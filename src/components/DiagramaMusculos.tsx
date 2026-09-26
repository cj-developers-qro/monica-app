import { COLOR_PRINCIPAL, COLOR_SECUNDARIO, diagramaMusculosSVG, nombreMusculo } from "@/lib/musculos";

/** Imagen anatómica con los músculos trabajados resaltados (frontal y posterior). */
export function DiagramaMusculos({
  principales,
  secundarios = [],
  leyenda = true,
  className = "",
}: {
  principales: string[];
  secundarios?: string[];
  leyenda?: boolean;
  className?: string;
}) {
  const etiqueta = `Músculos trabajados: ${principales.map(nombreMusculo).join(", ") || "ninguno"}`;
  return (
    <figure className={className}>
      <div
        role="img"
        aria-label={etiqueta}
        className="[&>svg]:h-auto [&>svg]:w-full"
        // El SVG se genera en código a partir de claves de músculo validadas; no contiene datos del usuario.
        dangerouslySetInnerHTML={{ __html: diagramaMusculosSVG(principales, secundarios) }}
      />
      {leyenda && (
        <figcaption className="mt-2 space-y-1 text-xs text-slate-600">
          <Leyenda color={COLOR_PRINCIPAL} titulo="Principal" musculos={principales} />
          {secundarios.length > 0 && <Leyenda color={COLOR_SECUNDARIO} titulo="Secundario" musculos={secundarios} />}
        </figcaption>
      )}
    </figure>
  );
}

function Leyenda({ color, titulo, musculos }: { color: string; titulo: string; musculos: string[] }) {
  return (
    <p className="flex items-start gap-2">
      <span className="mt-0.5 inline-block size-3 shrink-0 rounded-sm" style={{ background: color }} />
      <span>
        <strong className="font-semibold text-slate-700">{titulo}:</strong> {musculos.map(nombreMusculo).join(", ")}
      </span>
    </p>
  );
}
