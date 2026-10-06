import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { usuarioActual } from "@/lib/auth";

export const metadata: Metadata = { title: "Ayuda" };

const MANUAL = "https://github.com/cj-developers-qro/monica-app#readme";

/**
 * Ayuda dentro de la app. Es pública (se puede leer antes de entrar); si entra Moni, también ve su
 * guía rápida. El manual completo, con capturas, está en el README del repositorio.
 */
export default async function Ayuda() {
  const usuario = await usuarioActual();
  const esAdmin = usuario?.rol === "admin";
  const volver = usuario ? (esAdmin ? "/hoy" : "/portal") : "/login";

  return (
    <article className="space-y-6 text-sm leading-relaxed text-slate-700">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ayuda</h1>
          <p className="mt-1 text-slate-500">Toca cada tema para ver los pasos.</p>
        </div>
        <Link href={volver} className="enlace">
          ← Volver
        </Link>
      </header>

      {esAdmin && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-pink-700">Guía rápida para Moni</h2>
          <Tema titulo="Tu día a día: la pantalla Hoy">
            <p>
              Al entrar ves <strong>Hoy</strong>: quién no ha registrado su semana, a quién le toca medición, planes por vencer, clientes sin rutina,
              adherencia baja y quién dejó de registrar sus entrenamientos. Cada nombre te lleva directo a la pestaña donde se resuelve. Abajo está la
              actividad de la semana.
            </p>
          </Tema>
          <Tema titulo="Cliente nuevo, de principio a fin">
            <ol>
              <li>
                <strong>Clientes → + Nuevo cliente:</strong> llena el cuestionario con el cliente.
              </li>
              <li>
                <strong>Editar perfil y acceso → Crear acceso:</strong> copia la contraseña temporal y envíasela con la dirección{" "}
                <strong>moni-fit.com</strong> y el enlace a esta Ayuda.
              </li>
              <li>
                <strong>Composición corporal:</strong> registra peso, % de grasa y % de músculo: en <strong>Recomposición</strong> verás su punto de
                partida.
              </li>
              <li>
                <strong>Rutinas:</strong> asigna una del catálogo o <strong>Personalizar</strong> para ajustarla.
              </li>
              <li>
                <strong>Nutrición → Generar plan mensual.</strong>
              </li>
            </ol>
          </Tema>
          <Tema titulo="Videos de los ejercicios">
            <p>
              En <strong>Ejercicios</strong>, abre un ejercicio y pega el enlace de YouTube en <strong>Video de cómo se hace</strong>. Si no pones
              ninguno, tus clientes verán una búsqueda en YouTube con el nombre del ejercicio. Los que ya tienen video muestran <strong>▶ Video</strong>{" "}
              en el catálogo.
            </p>
          </Tema>
          <Tema titulo="Bitácora e intercambios de tus clientes">
            <p>
              En la pestaña <strong>Entrenamiento</strong> de cada cliente ves sus sesiones y cómo suben sus cargas; también puedes registrar tú la
              sesión si entrenó contigo. En <strong>Nutrición</strong>, los alimentos que el cliente cambió muestran <em>«en lugar de…»</em>; tú
              también puedes cambiarlos con <strong>⇄ Cambiar</strong>.
            </p>
          </Tema>
          <Tema titulo="Avisos por Telegram">
            <p>
              En <strong>Avisos</strong> conectas el bot (una sola vez, con el token de @BotFather), vinculas tu Telegram y envías mensajes a tus
              clientes. Los avisos de plan, rutina y el recordatorio del domingo salen solos.
            </p>
          </Tema>
          <p className="text-xs text-slate-500">
            Manual completo con capturas:{" "}
            <a href={MANUAL} className="enlace" target="_blank" rel="noopener noreferrer">
              {MANUAL.replace("https://", "")}
            </a>
          </p>
          <h2 className="pt-4 text-base font-semibold text-pink-700">Lo que ven tus clientes</h2>
        </section>
      )}

      <section className="space-y-2">
        <Tema titulo="Entrar por primera vez" abierto={!usuario}>
          <ol>
            <li>
              Abre <strong>moni-fit.com</strong> y escribe tu correo y la <strong>contraseña temporal</strong> que te dio Moni.
            </li>
            <li>Crea tu propia contraseña (mínimo 8 caracteres): escribe la temporal y luego la nueva dos veces.</li>
            <li>
              Lee el <Link href="/privacidad" className="enlace">aviso de privacidad</Link>, marca la casilla y presiona <strong>Acepto y continuar</strong>.
            </li>
          </ol>
        </Tema>

        <Tema titulo="Tu rutina y la bitácora de entrenamiento">
          <p>
            En <strong>Mi resumen</strong> está tu rutina: la imagen muestra los músculos que trabajas y la tabla, los ejercicios de cada día.
          </p>
          <ul>
            <li>
              <strong>Series:</strong> cuántas veces repites el bloque. <strong>Reps:</strong> repeticiones por serie («10–12» = entre 10 y 12; «30
              s» = sostener 30 segundos). <strong>Descanso:</strong> entre una serie y otra.
            </li>
            <li>
              <strong>▶ Ver cómo se hace</strong> abre un video del ejercicio.
            </li>
          </ul>
          <p>
            <strong>Después de entrenar</strong>, entra a <strong>Mi entrenamiento</strong>:
          </p>
          <ol>
            <li>Elige el día que hiciste (la app te sugiere el que sigue).</li>
            <li>Desmarca lo que no hiciste y anota series, repeticiones y el peso en kg (vacío si fue con tu peso corporal).</li>
            <li>
              Presiona <strong>Guardar sesión</strong>. La próxima vez verás lo que hiciste y en <strong>Progreso por ejercicio</strong> cómo suben tus
              cargas.
            </li>
          </ol>
        </Tema>

        <Tema titulo="Tu plan de nutrición y cómo cambiar un alimento">
          <ul>
            <li>
              En <strong>Mi nutrición</strong> ves tu menú del mes por semanas, con porciones en gramos y medidas caseras, y la lista de compras.
            </li>
            <li>Los días de entrenamiento llevan un poco más de carbohidratos que los de descanso.</li>
          </ul>
          <p>
            <strong>¿No tienes un alimento o no se te antoja?</strong> Toca <strong>⇄ Cambiar</strong> junto a él y elige otro equivalente: la
            porción ya viene calculada para que te aporte lo mismo. Puedes cambiarlo solo en esa comida o en toda la semana. Solo aparecen alimentos
            permitidos para ti.
          </p>
        </Tema>

        <Tema titulo="Registrar tu semana (cada domingo)">
          <ol>
            <li>
              En <strong>Mi nutrición</strong>, baja a <strong>Seguimiento semanal</strong>.
            </li>
            <li>
              <strong>Adherencia (%):</strong> comidas que hiciste como decía el plan ÷ comidas de la semana × 100. Ejemplo: 21 de 28 = <strong>75</strong>.
            </li>
            <li>
              Opcional: agua al día en litros, <strong>energía</strong> y <strong>hambre</strong> del 1 (muy poca) al 5 (mucha), y notas para Moni.
            </li>
            <li>
              Presiona <strong>Registrar semana</strong>. Con esto Moni ajusta tu siguiente plan. ¡Sé honesto!
            </li>
          </ol>
        </Tema>

        <Tema titulo="Avisos por Telegram (opcional)">
          <ol>
            <li>Instala Telegram si no lo tienes.</li>
            <li>
              En MoniFit: <strong>Mi cuenta → Avisos por Telegram → Vincular Telegram</strong>.
            </li>
            <li>
              Se abre el bot de MoniFit: presiona <strong>Iniciar</strong>. Te llegarán tu nuevo plan, tu nueva rutina, un recordatorio los domingos y
              los mensajes de Moni (nunca con datos de salud).
            </li>
          </ol>
          <p>
            Para dejar de recibirlos: <strong>Desvincular</strong> en Mi cuenta o escribe <code>/desvincular</code> al bot. Si el bot dice que el enlace
            expiró, vuelve a presionar <strong>Vincular Telegram</strong> (sirve 30 minutos).
          </p>
        </Tema>

        <Tema titulo="Descargar tu plan del mes">
          <p>
            En <strong>Mi nutrición → Exportar mi plan</strong>: <strong>Descargar PDF / Imprimir</strong> (elige «Guardar como PDF») o{" "}
            <strong>Descargar Excel (CSV)</strong>.
          </p>
        </Tema>

        <Tema titulo="Tener MoniFit como app en tu celular">
          <ul>
            <li>
              <strong>iPhone (Safari):</strong> botón Compartir → <strong>Agregar a pantalla de inicio</strong>.
            </li>
            <li>
              <strong>Android (Chrome):</strong> menú ⋮ → <strong>Agregar a la pantalla principal</strong>.
            </li>
          </ul>
        </Tema>

        <Tema titulo="Contraseña, bloqueo y privacidad">
          <ul>
            <li>
              Cambia tu contraseña en <strong>Mi cuenta</strong>. ¿La olvidaste? Pídele a Moni una nueva temporal.
            </li>
            <li>Si te equivocas 5 veces seguidas, espera 15 minutos.</li>
            <li>
              Solo tú y Moni ven tus datos. Para consultarlos, corregirlos o borrarlos escribe a <strong>monica@moni-fit.com</strong> (
              <Link href="/privacidad" className="enlace">aviso de privacidad</Link>).
            </li>
          </ul>
        </Tema>

        <Tema titulo="Glosario">
          <ul>
            <li>
              <strong>% de grasa / % de músculo:</strong> qué parte de tu peso es grasa o músculo.
            </li>
            <li>
              <strong>Recomposición:</strong> bajar grasa y subir músculo al mismo tiempo, aunque la báscula casi no cambie.
            </li>
            <li>
              <strong>Punto de partida:</strong> tu primera medición; tu progreso se verá desde la segunda.
            </li>
            <li>
              <strong>Adherencia:</strong> qué tanto seguiste el plan, en %. <strong>kcal:</strong> energía de los alimentos.{" "}
              <strong>P · C · G:</strong> proteína, carbohidratos y grasas en gramos.
            </li>
          </ul>
        </Tema>
      </section>
    </article>
  );
}

function Tema({ titulo, children, abierto = false }: { titulo: string; children: ReactNode; abierto?: boolean }) {
  return (
    <details open={abierto} className="group rounded-xl border border-pink-100 bg-white [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:space-y-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-800">
        {titulo}
        <span className="text-pink-600 transition group-open:rotate-45" aria-hidden>
          ＋
        </span>
      </summary>
      <div className="space-y-2 border-t border-pink-50 px-4 py-3">{children}</div>
    </details>
  );
}
