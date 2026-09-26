import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { iniciarSesion } from "@/app/acciones/sesion";
import { existeAdministradora, usuarioActual } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function Login() {
  const usuario = await usuarioActual();
  if (usuario) redirect(usuario.debe_cambiar ? "/cuenta?primera=1" : usuario.rol === "admin" ? "/" : "/portal");

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900">¡Hola! Inicia sesión</h2>
      <p className="mt-1 text-sm text-slate-500">Consulta tu rutina, tu progreso y tu plan de nutrición.</p>
      {!existeAdministradora() && (
        <p className="aviso-marca mt-4">
          Aún no existe la cuenta de administradora. En la carpeta de la app ejecuta <code className="font-mono">npm run admin -- correo@ejemplo.com Moni</code>.
        </p>
      )}
      <Formulario accion={iniciarSesion} className="mt-6 space-y-4">
        <label className="block">
          <span className="etiqueta">Correo electrónico</span>
          <input name="usuario" type="email" autoComplete="username" required autoFocus className="campo" />
        </label>
        <label className="block">
          <span className="etiqueta">Contraseña</span>
          <input name="contrasena" type="password" autoComplete="current-password" required className="campo" />
        </label>
        <BotonEnviar className="boton w-full py-2.5">Entrar</BotonEnviar>
      </Formulario>
      <p className="mt-6 text-center text-xs text-slate-500">¿Olvidaste tu contraseña? Pídele a Moni que te genere una nueva.</p>
    </>
  );
}
