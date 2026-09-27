// Datos del aviso de privacidad. COMPLETAR antes de usar la app con clientes reales y pedir
// que una persona asesora en protección de datos revise el texto (src/app/(legal)/privacidad/page.tsx).

export const AVISO = {
  /** Nombre completo de la persona responsable del tratamiento de los datos. */
  responsable: "[Nombre completo de Moni]",
  /** Domicilio para oír y recibir notificaciones. */
  domicilio: "[Domicilio completo]",
  /** Correo donde los clientes ejercen sus derechos ARCO o revocan su consentimiento. */
  correo: "[correo de contacto para privacidad]",
  /** Fecha de la última actualización del aviso (AAAA-MM-DD). */
  actualizado: "2026-09-26",
};

/** true mientras falte llenar algún dato del aviso (se muestra una advertencia a la administradora). */
export const AVISO_INCOMPLETO = Object.values(AVISO).some((v) => v.startsWith("["));
