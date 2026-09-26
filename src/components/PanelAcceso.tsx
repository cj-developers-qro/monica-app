"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cambiarCorreoAcceso, cambiarEstadoAcceso, crearAcceso, restablecerAcceso } from "@/app/acciones/accesos";
import type { EstadoFormulario } from "@/lib/formulario";

type Acceso = { usuario: string; activo: number; debe_cambiar: number; ultimo_acceso: string | null } | null;

const fechaHora = (f: string) => new Date(f.replace(" ", "T") + "Z").toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

/**
 * Alta, restablecimiento y baja del acceso del cliente. Es un solo componente para que la
 * contraseña temporal siga visible después de que la sección cambia de «crear» a «administrar».
 */
export function PanelAcceso({ clienteId, nombre, acceso }: { clienteId: number; nombre: string; acceso: Acceso }) {
  const [creado, crear] = useActionState(crearAcceso, undefined);
  const [restablecido, restablecer] = useActionState(restablecerAcceso, undefined);
  const [correo, guardarCorreo] = useActionState(cambiarCorreoAcceso, undefined);
  const campoCliente = <input type="hidden" name="cliente_id" value={clienteId} />;
  const primerNombre = nombre.split(" ")[0];
  const conSecreto = [restablecido, creado].find((e) => e?.secreto);

  return (
    <section id="acceso" className="tarjeta scroll-mt-6 p-5">
      <h2 className="text-base font-semibold text-slate-900">Acceso a la aplicación</h2>

      {conSecreto && (
        <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>{conSecreto.mensaje}</p>
          <p className="mt-2 select-all rounded-lg border border-emerald-300 bg-white px-3 py-2 text-center font-mono text-lg font-semibold tracking-wide text-slate-900">
            {conSecreto.secreto}
          </p>
          <p className="mt-2 text-xs">
            Cópiala ahora: por seguridad no se vuelve a mostrar. {primerNombre} entra en esta misma dirección con su correo y esta contraseña, y la app le pedirá crear
            una propia.
          </p>
        </div>
      )}

      {!acceso ? (
        <>
          <p className="mt-1 text-sm text-slate-500">
            {primerNombre} todavía no puede entrar. Al crear su acceso se genera una contraseña temporal que deberá cambiar la primera vez que entre.
          </p>
          <form action={crear} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            {campoCliente}
            <label className="flex-1">
              <span className="etiqueta">Correo electrónico de {primerNombre}</span>
              <input name="usuario" type="email" required className="campo" />
            </label>
            <Enviar>Crear acceso</Enviar>
          </form>
          <MensajeError estado={creado} />
        </>
      ) : (
        <div className="mt-3 space-y-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Correo de acceso</dt>
              <dd className="break-all font-medium text-slate-800">{acceso.usuario}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Estado</dt>
              <dd>
                {acceso.activo ? (
                  <span className="insignia-marca">{acceso.debe_cambiar ? "Activo · contraseña temporal" : "Activo"}</span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Desactivado</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Último ingreso</dt>
              <dd className="text-slate-800">{acceso.ultimo_acceso ? fechaHora(acceso.ultimo_acceso) : "Nunca"}</dd>
            </div>
          </dl>

          <div className="grid gap-4 lg:grid-cols-2">
            <form action={restablecer} className="rounded-xl border border-pink-100 p-4">
              {campoCliente}
              <p className="text-sm font-medium text-slate-800">¿Olvidó su contraseña?</p>
              <p className="mt-1 text-xs text-slate-500">Genera una nueva contraseña temporal; la anterior deja de funcionar.</p>
              <div className="mt-3">
                <Enviar clase="boton-secundario">Generar contraseña temporal</Enviar>
              </div>
              <MensajeError estado={restablecido} />
            </form>
            <form action={guardarCorreo} className="rounded-xl border border-pink-100 p-4">
              {campoCliente}
              <label className="block">
                <span className="etiqueta">Cambiar correo de acceso</span>
                <input name="usuario" type="email" required defaultValue={acceso.usuario} className="campo" />
              </label>
              <div className="mt-3">
                <Enviar clase="boton-secundario">Guardar correo</Enviar>
              </div>
              <MensajeError estado={correo} />
              {correo?.ok && <p className="mt-2 text-xs text-emerald-700">✓ {correo.mensaje}</p>}
            </form>
          </div>

          <form
            action={cambiarEstadoAcceso.bind(null, clienteId, !acceso.activo)}
            onSubmit={(e) => {
              if (acceso.activo && !window.confirm(`¿Desactivar el acceso de ${primerNombre}? No podrá entrar, pero su información se conserva.`)) e.preventDefault();
            }}
            className="flex flex-wrap items-center gap-3 border-t border-pink-50 pt-4"
          >
            <Enviar clase={acceso.activo ? "boton-peligro" : "boton"}>{acceso.activo ? "Desactivar acceso" : "Reactivar acceso"}</Enviar>
            <p className="text-xs text-slate-500">Desactivar es la baja temporal: conserva todo su historial.</p>
          </form>
        </div>
      )}
    </section>
  );
}

function Enviar({ children, clase = "boton" }: { children: ReactNode; clase?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={clase}>
      {pending ? "Procesando…" : children}
    </button>
  );
}

function MensajeError({ estado }: { estado: EstadoFormulario }) {
  if (!estado?.error) return null;
  return (
    <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {estado.error}
    </p>
  );
}
