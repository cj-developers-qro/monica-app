// Datos del aviso de privacidad. Si cambian, actualiza también la fecha. Conviene que una persona
// asesora en protección de datos revise el texto (src/app/(legal)/privacidad/page.tsx).

export const AVISO = {
  /** Nombre completo de la persona responsable del tratamiento de los datos. */
  responsable: "Mónica Beatriz Amador Gómez",
  /** Domicilio para oír y recibir notificaciones. */
  domicilio: "Hacienda Montenegro 75, Col. Mansiones del Valle, Querétaro, Qro., C.P. 76185",
  /** Correo donde los clientes ejercen sus derechos ARCO o revocan su consentimiento. */
  correo: "monica@moni-fit.com",
  /** Fecha de la última actualización del aviso (AAAA-MM-DD). */
  actualizado: "2026-09-27",
};

/** true mientras falte llenar algún dato del aviso (se muestra una advertencia a la administradora). */
export const AVISO_INCOMPLETO = Object.values(AVISO).some((v) => v.startsWith("["));
