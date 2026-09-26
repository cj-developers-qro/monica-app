// Marco mínimo para el documento exportable: sin menús, fondo blanco, listo para imprimir o guardar como PDF.
export default function LayoutExportar({ children }: LayoutProps<"/">) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
