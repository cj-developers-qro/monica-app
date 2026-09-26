// Permite ejecutar con Node los módulos TypeScript de src/ desde los scripts:
// resuelve el alias "@/" y los imports relativos sin extensión (".ts"/".tsx").
//   node --import ./scripts/cargador.mjs scripts/archivo.ts
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.resolve("src");

registerHooks({
  resolve(especificador, contexto, siguiente) {
    let ruta = null;
    if (especificador.startsWith("@/")) ruta = path.join(SRC, especificador.slice(2));
    else if (especificador.startsWith(".") && contexto.parentURL?.startsWith("file:"))
      ruta = path.resolve(path.dirname(fileURLToPath(contexto.parentURL)), especificador);
    if (ruta && !path.extname(ruta)) {
      const encontrado = [".ts", ".tsx", "/index.ts"].map((e) => ruta + e).find(existsSync);
      if (encontrado) return siguiente(pathToFileURL(encontrado).href, contexto);
    }
    return siguiente(ruta ? pathToFileURL(ruta).href : especificador, contexto);
  },
});
