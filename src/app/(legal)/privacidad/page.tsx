import type { Metadata } from "next";
import Link from "next/link";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { aceptarPrivacidad } from "@/app/acciones/sesion";
import { usuarioActual } from "@/lib/auth";
import { AVISO, AVISO_INCOMPLETO } from "@/lib/privacidad";

export const metadata: Metadata = { title: "Aviso de privacidad" };

const fecha = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" });

/**
 * Aviso de privacidad integral. Es público; si entra un cliente que aún no lo acepta, al final
 * aparece el consentimiento expreso (necesario porque se tratan datos de salud).
 */
export default async function AvisoPrivacidad() {
  const usuario = await usuarioActual();
  const debeAceptar = usuario?.rol === "cliente" && !usuario.acepto_privacidad && !usuario.debe_cambiar;

  return (
    <article className="space-y-5 text-sm leading-relaxed text-slate-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc">
      {AVISO_INCOMPLETO && usuario?.rol === "admin" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          ⚠ Faltan datos de la responsable en este aviso. Complétalos en <code>src/lib/privacidad.ts</code> antes de dar acceso a clientes reales.
        </p>
      )}
      {debeAceptar && (
        <p className="aviso-marca">
          Antes de ver tu información, lee este aviso y confirma al final que lo aceptas. Solo se te pedirá una vez.
        </p>
      )}

      <header>
        <h1 className="text-2xl font-bold text-slate-900">Aviso de privacidad</h1>
        <p className="mt-1 text-xs text-slate-500">Última actualización: {fecha(AVISO.actualizado)}</p>
      </header>

      <h2>1. Responsable</h2>
      <p>
        <strong>{AVISO.responsable}</strong>, con domicilio en {AVISO.domicilio}, es responsable del tratamiento de tus datos personales
        recabados a través de MoniFit, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su
        normativa aplicable. Contacto: <strong>{AVISO.correo}</strong>.
      </p>

      <h2>2. Datos que se recaban</h2>
      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, edad, sexo y correo electrónico.
        </li>
        <li>
          <strong>Datos de salud (sensibles):</strong> enfermedades, medicamentos, cirugías, lesiones y fracturas, digestión, perfil
          hormonal y ciclo menstrual, alergias e intolerancias.
        </li>
        <li>
          <strong>Medidas y composición corporal:</strong> peso, estatura, perímetros corporales, porcentaje de grasa y de músculo, grasa
          visceral.
        </li>
        <li>
          <strong>Hábitos:</strong> sueño, consumo de tabaco y alcohol, alimentación, hidratación, actividad física y aspectos que deseas
          mejorar.
        </li>
        <li>
          <strong>Seguimiento:</strong> rutinas, planes de nutrición y registros semanales de adherencia.
        </li>
      </ul>

      <h2>3. Finalidades</h2>
      <p>Tus datos se usan exclusivamente para:</p>
      <ul>
        <li>Evaluar tu estado inicial y diseñar tu rutina de entrenamiento y tu plan de nutrición.</li>
        <li>Dar seguimiento a tu progreso y ajustar tus planes.</li>
        <li>Darte acceso a tu información a través de la aplicación.</li>
        <li>Comunicarnos contigo sobre tu programa.</li>
      </ul>
      <p>No se usan con fines publicitarios ni de mercadotecnia, y no se venden a terceros.</p>

      <h2>4. Datos sensibles y consentimiento</h2>
      <p>
        Los datos de salud son datos personales sensibles. Solo se tratan con tu <strong>consentimiento expreso</strong>, que otorgas al
        marcar la casilla de aceptación en la aplicación. Puedes revocarlo en cualquier momento (ver punto 7); en ese caso ya no será
        posible darte el servicio de seguimiento.
      </p>

      <h2>5. Transferencias y encargados</h2>
      <p>
        Tus datos no se transfieren a terceros, salvo cuando lo exija una autoridad competente conforme a la ley. La aplicación se aloja
        en servicios de infraestructura en la nube (Oracle Cloud y Cloudflare), que actúan como encargados: solo almacenan y transmiten la
        información de forma cifrada y no la usan para fines propios.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Cada cliente accede solo a su propia información con su correo y contraseña; las contraseñas se guardan cifradas, la conexión
        usa HTTPS y se hacen respaldos periódicos de la información.
      </p>

      <h2>7. Derechos ARCO y revocación</h2>
      <p>
        Puedes <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong>, <strong>cancelarlos</strong> u{" "}
        <strong>oponerte</strong> a su tratamiento, así como revocar tu consentimiento o limitar su uso, enviando un correo a{" "}
        <strong>{AVISO.correo}</strong> con tu nombre, la descripción de tu solicitud y una identificación. Recibirás respuesta en un
        plazo máximo de 20 días hábiles.
      </p>

      <h2>8. Cookies</h2>
      <p>
        La aplicación usa únicamente una cookie técnica de sesión para mantenerte identificado mientras la usas. No se usan cookies de
        publicidad ni de rastreo.
      </p>

      <h2>9. Cambios al aviso</h2>
      <p>Cualquier cambio a este aviso se publicará en esta misma página, indicando la fecha de actualización.</p>

      {debeAceptar ? (
        <Formulario accion={aceptarPrivacidad} className="mt-8 rounded-2xl border border-pink-200 bg-pink-50/60 p-5">
          <label className="flex items-start gap-3 text-sm text-slate-800">
            <input type="checkbox" name="acepto" value="si" required className="mt-1 size-4 accent-pink-600" />
            <span>
              He leído el aviso de privacidad y <strong>otorgo mi consentimiento expreso</strong> para el tratamiento de mis datos personales,
              incluidos mis datos de salud, para las finalidades descritas.
            </span>
          </label>
          <div className="mt-4">
            <BotonEnviar className="boton w-full sm:w-auto">Acepto y continuar</BotonEnviar>
          </div>
        </Formulario>
      ) : (
        <p className="mt-8 text-center">
          <Link href={usuario ? (usuario.rol === "admin" ? "/" : "/portal") : "/login"} className="enlace">
            ← Volver
          </Link>
        </p>
      )}
    </article>
  );
}
