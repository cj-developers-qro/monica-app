# Monica App · Entrenamiento y nutrición

Aplicación para que **Moni** dé seguimiento completo a sus clientes: cuestionario de ingreso (onboarding),
medidas, composición corporal, progreso de recomposición, rutinas de ejercicio y plan de nutrición mensual.
Cada cliente tiene su propio acceso para consultar **solo su información** y descargar su plan del mes.

---

## Contenido

1. [¿Quién puede hacer qué?](#1-quién-puede-hacer-qué)
2. [Entrar por primera vez (Moni)](#2-entrar-por-primera-vez-moni)
3. [Guía para Moni, paso a paso](#3-guía-para-moni-paso-a-paso)
   - [3.1 Dar de alta a un cliente](#31-dar-de-alta-a-un-cliente)
   - [3.2 Darle acceso a la app](#32-darle-acceso-a-la-app)
   - [3.3 Registrar medidas con cinta (antropometría)](#33-registrar-medidas-con-cinta-antropometría)
   - [3.4 Registrar composición corporal](#34-registrar-composición-corporal)
   - [3.5 Ver el progreso (recomposición)](#35-ver-el-progreso-recomposición)
   - [3.6 Asignar una rutina](#36-asignar-una-rutina)
   - [3.7 Crear y editar rutinas y ejercicios](#37-crear-y-editar-rutinas-y-ejercicios)
   - [3.8 Plan de nutrición mensual](#38-plan-de-nutrición-mensual)
   - [3.9 Cambios y bajas de clientes](#39-cambios-y-bajas-de-clientes)
   - [3.10 Tu cuenta y tu contraseña](#310-tu-cuenta-y-tu-contraseña)
4. [Guía para los clientes](#4-guía-para-los-clientes)
5. [Rutina de trabajo recomendada para Moni](#5-rutina-de-trabajo-recomendada-para-moni)
6. [Preguntas frecuentes](#6-preguntas-frecuentes)
7. [Privacidad y seguridad](#7-privacidad-y-seguridad)
8. [Información técnica (instalación y mantenimiento)](#8-información-técnica-instalación-y-mantenimiento)

---

## 1. ¿Quién puede hacer qué?

| | **Moni (administradora)** | **Cliente** |
|---|---|---|
| Dar de alta, modificar y dar de baja clientes | ✅ | — |
| Crear, restablecer o desactivar el acceso de un cliente | ✅ | — |
| Registrar medidas y composición corporal | ✅ | — |
| Crear, editar y asignar rutinas y ejercicios | ✅ | — |
| Generar el plan de nutrición mensual | ✅ | — |
| Ver el expediente de **todos** los clientes | ✅ | — |
| Ver **su propio** resumen, rutina, progreso y plan de nutrición | — | ✅ |
| Registrar cómo le fue cada semana con su plan de nutrición | ✅ | ✅ |
| Exportar el plan mensual a PDF o Excel | ✅ | ✅ (solo el suyo) |
| Cambiar su propia contraseña | ✅ | ✅ |

Un cliente **nunca** puede ver la información de otro cliente, aunque intente escribir la dirección a mano:
la aplicación revisa quién eres en cada pantalla y en cada acción.

---

## 2. Entrar por primera vez (Moni)

1. Abre la aplicación en el navegador (la dirección te la da quien la instaló; en la computadora donde
   está instalada es **http://localhost:3000**).
2. Verás la pantalla rosa de **Iniciar sesión**.
3. Escribe tu correo **monica@moni-fit.com** y la **contraseña temporal** que te entregaron.
4. La app te pedirá crear **tu propia contraseña** (mínimo 8 caracteres). Escribe primero la temporal,
   luego tu nueva contraseña dos veces y presiona **Guardar y continuar**.
5. Listo: entras a tu panel de **Clientes**.

> 💡 Usa una contraseña que solo tú conozcas. Nadie (ni quien instaló la app) puede verla: la aplicación
> solo guarda una versión cifrada.

### Tu pantalla principal

- **Barra rosa de la izquierda:** menú con *Clientes*, *Rutinas* y *Ejercicios*. Abajo aparece tu nombre,
  el enlace **Mi cuenta** y el botón **Salir**.
- **Clientes:** una tarjeta por cliente con su objetivo, peso actual, % de grasa, rutina asignada y si
  tiene o no acceso a la app.

---

## 3. Guía para Moni, paso a paso

### 3.1 Dar de alta a un cliente

1. En **Clientes**, presiona **+ Nuevo cliente (onboarding)**.
2. Llena el cuestionario. Está dividido en secciones:
   - **I. Datos personales y biometría inicial:** nombre, edad, sexo, peso, estatura y **objetivo principal**
     (pérdida de grasa, ganancia muscular, recomposición corporal o rendimiento).
   - **II. Historial médico y salud:** enfermedades, medicamentos, cirugías o lesiones, fracturas y digestión.
   - **III. Perfil hormonal:** aparece solo si eliges *Mujer* (ciclo, síntomas, anticonceptivos, embarazos).
   - **IV. Estilo de vida y descanso**, **V. Nutrición e hidratación**, **VI. Actividad física actual** y
     **VII. Aspectos psicológicos**.
3. Solo **nombre, sexo y objetivo** son obligatorios; lo demás puedes completarlo después.
4. Presiona **Registrar cliente**. Se abre su **expediente**.

> El peso que escribas se guarda automáticamente como su **primer registro de composición corporal**.

**Lo que conviene llenar bien:** alergias, alimentos que no le gustan, fruta favorita, cuántas comidas hace
al día y si se le dificulta cocinar. Con esas respuestas se arma su plan de nutrición. Las enfermedades,
medicamentos y lesiones aparecen como **alertas amarillas** en su perfil y en sus rutinas.

#### El expediente del cliente

Tiene estas pestañas:

| Pestaña | Para qué sirve |
|---|---|
| **Perfil clínico** | Todas las respuestas del cuestionario, alertas de salud y los parámetros de entrenamiento de su objetivo. |
| **Antropometría** | Medidas con cinta métrica. |
| **Composición corporal** | Peso, % de grasa, % de músculo y grasa visceral. |
| **Recomposición** | Tablero con gráficas y diagnóstico de su progreso. |
| **Rutinas** | Su rutina activa, las recomendadas para su objetivo y su historial. |
| **Nutrición** | Su plan mensual, el seguimiento semanal y el historial de planes. |

Arriba a la derecha está el botón **Editar perfil y acceso**.

### 3.2 Darle acceso a la app

Mientras un cliente no tenga acceso, su perfil muestra el aviso *"aún no puede entrar a la app"*.

1. Entra al expediente del cliente → **Editar perfil y acceso** (o presiona **Crear acceso** en el aviso).
2. En la sección **Acceso a la aplicación**, escribe el **correo del cliente** y presiona **Crear acceso**.
3. Aparece un recuadro verde con una **contraseña temporal** (por ejemplo `fresa-luna-4821`).
   **Cópiala en ese momento**: por seguridad no se vuelve a mostrar.
4. Envíale al cliente:
   - la dirección de la aplicación,
   - su correo,
   - la contraseña temporal.
5. La primera vez que entre, la app le pedirá crear su propia contraseña.

En esa misma sección puedes ver el **estado** del acceso (activo, con contraseña temporal o desactivado) y la
fecha de su **último ingreso**.

### 3.3 Registrar medidas con cinta (antropometría)

1. Expediente → pestaña **Antropometría**.
2. Escribe la fecha y las medidas en **centímetros**: brazo izquierdo y derecho, pierna izquierda y derecha,
   pantorrilla izquierda y derecha, cintura, cuello y cadera. No es obligatorio llenarlas todas.
3. Presiona **Guardar medidas**.

La pantalla calcula dos indicadores de salud:
- **Índice cintura / cadera:** se considera riesgo elevado arriba de 0.85 en mujeres y 0.90 en hombres.
- **Índice cintura / estatura:** lo deseable es mantenerlo por debajo de 0.5.

Con dos o más registros aparece la gráfica de cintura, cadera y cuello, y una fila de **Cambio total**.
Para borrar un registro equivocado usa **Eliminar** en su renglón.

### 3.4 Registrar composición corporal

1. Expediente → pestaña **Composición corporal**.
2. Escribe fecha, **peso** (obligatorio), estatura, **% de grasa corporal**, **% de masa muscular** y el
   **nivel de grasa visceral**, tal como te los da la báscula de bioimpedancia.
3. Presiona **Guardar registro**.

La tabla calcula el **IMC** y convierte los porcentajes a **kilos de grasa** y **kilos de músculo**.

> 💡 Para que las comparaciones sean confiables, mide siempre con la misma báscula, en ayunas y a la misma hora.

### 3.5 Ver el progreso (recomposición)

Expediente → pestaña **Recomposición**. Necesita al menos **dos registros con % de grasa y % de músculo**.

- **Recuadro de diagnóstico** (verde, ámbar o rojo), por ejemplo:
  - *Recomposición corporal lograda* — bajó grasa y subió músculo.
  - *Pérdida de grasa preservando músculo*.
  - *Pérdida de grasa con pérdida muscular* — conviene revisar proteína y rutina.
  - *Ganancia muscular con aumento de grasa*.

  Además indica si el progreso **va alineado con su objetivo**.
- **Tres tarjetas:** cambio de peso, de masa grasa y de masa muscular, en kilos.
- **Gráficas:** masa grasa contra masa muscular, peso corporal y porcentajes. Al pasar el cursor por una gráfica
  ves los valores de cada fecha, y con **Ver como tabla** ves los números exactos.

> La báscula puede marcar casi lo mismo mientras el cuerpo cambia: la gráfica de grasa contra músculo lo muestra.

### 3.6 Asignar una rutina

Expediente → pestaña **Rutinas**.

- Arriba se muestra la **rutina activa** con la **imagen de los músculos que trabaja** (rojo intenso =
  músculo principal, rojo claro = secundario) y su plan por día: ejercicio, series, repeticiones y descanso.
- Si el cliente tiene lesiones registradas, aparece un aviso amarillo para que adaptes los ejercicios.
- En **Recomendadas para (su objetivo)** tienes dos opciones por rutina:
  - **Asignar:** usa la rutina del catálogo tal cual.
  - **Personalizar:** crea una **copia solo para ese cliente** y abre el editor para ajustarla (por ejemplo,
    cambiar un ejercicio por una lesión). Los cambios no afectan al catálogo.
- Si asignas una rutina de otro objetivo, la app te avisa que no está alineada.
- **Finalizar** termina la rutina activa. Las anteriores quedan en el **Historial**, desde donde puedes
  **Reactivarlas**.

Solo puede haber **una rutina activa** por cliente: al asignar una nueva, la anterior pasa al historial.

### 3.7 Crear y editar rutinas y ejercicios

#### Catálogo de rutinas (menú **Rutinas**)
La app trae 8 rutinas base, dos por objetivo, con series, repeticiones y descansos adecuados a cada uno.
Puedes filtrarlas por objetivo.

- **+ Nueva rutina** o **Editar** abren el editor:
  1. Escribe nombre, objetivo, nivel, días por semana e indicaciones.
  2. En cada **día** (puedes renombrarlo, por ejemplo "Torso" o "Pierna") elige ejercicios de la lista
     **+ Agregar ejercicio del catálogo…**. Con **Filtrar el catálogo por músculo** encuentras rápido lo que buscas.
  3. Ajusta **series**, **repeticiones** (acepta texto: "8–10", "30 s", "12 por lado") y **descanso** en segundos.
     Con ▲ ▼ cambias el orden y con ✕ quitas un ejercicio.
  4. **+ Agregar día** suma otro día.
  5. A la derecha ves en vivo el **diagrama de músculos trabajados** y los parámetros recomendados para el objetivo.
  6. **Imagen propia (opcional):** si prefieres una foto o ilustración (PNG, JPG o WebP de hasta 4 MB),
     súbela ahí. Si no, la imagen de la rutina es el diagrama generado automáticamente.
  7. Presiona **Guardar rutina**.
- **Duplicar** crea una copia para hacer una variante.
- **Descargar imagen** baja la imagen de músculos de la rutina.

#### Catálogo de ejercicios (menú **Ejercicios**)
Trae 45 ejercicios propuestos. Para crear uno nuevo presiona **+ Nuevo ejercicio** y marca, para cada músculo,
si es **Principal**, **Secundario** o no participa (—). El dibujo se actualiza al momento: esa será la imagen
del ejercicio. Un ejercicio que se usa en alguna rutina **no se puede eliminar** hasta quitarlo de ellas.

### 3.8 Plan de nutrición mensual

Expediente → pestaña **Nutrición**. El cliente debe tener **al menos un peso registrado**.

#### Generar el plan
1. Elige la fecha de inicio y cuántas comidas al día hará (3 a 6).
2. Opcional:
   - **Ajuste manual (kcal):** sube o baja calorías si tú lo decides (por ejemplo, −100).
   - **Excluir además:** alimentos que no quiera, separados por comas (por ejemplo "atún, camote").
   - **Notas del plan**.
3. Presiona **Generar plan mensual**.

#### Cómo se calcula (para que puedas explicarlo)
- **Metabolismo basal:** si hay % de grasa reciente usa la fórmula de Katch-McArdle, que se basa en la masa
  magra; si no, usa Mifflin-St Jeor, con edad, estatura, peso y sexo.
- **Gasto total:** el metabolismo basal multiplicado por un factor según los días que entrena en su **rutina activa**.
- **Ajuste por objetivo:** −20 % para pérdida de grasa, −10 % para recomposición, +10 % para ganancia muscular
  y 0 % para rendimiento.
- **Proteína:** de 1.8 a 2.2 g por kilo según el objetivo. **Grasas:** alrededor de 25–35 % de las calorías.
  **Carbohidratos:** el resto.
- **Días de entrenamiento y de descanso:** los días que entrena lleva más carbohidratos y los de descanso un
  poco menos; el promedio de la semana es el mismo.
- **Alergias e intolerancias** excluyen grupos completos (por ejemplo "lactosa" quita todos los lácteos).
  Los **alimentos que no le gustan** quitan solo ese alimento, salvo que escriba una categoría como "pescado".

#### Qué contiene el plan
- **Metas diarias:** calorías de día de entrenamiento y de descanso, proteína, carbohidratos, grasas y agua.
- **Cómo se calculó** y **restricciones aplicadas**.
- **Recomendaciones** personalizadas según sus respuestas: hidratación, digestión, alcohol, sueño, cocina,
  suplementos y ciclo menstrual. Si tiene enfermedades o toma medicamentos, el plan indica que un médico o
  nutriólogo debe validarlo.
- **4 semanas de menú**, cada una con un **enfoque de hábito** y cada día con sus comidas, porciones en
  **gramos y medidas caseras** (tazas, piezas, cucharadas) y el total del día.
- **Lista de compras** de cada semana.

#### Seguimiento semanal
Debajo del menú está **Seguimiento semanal**. Cada semana registra (o el cliente registra desde su portal):
- la **adherencia al plan** en porcentaje (qué tanto lo cumplió),
- el agua promedio,
- la **energía** y el **hambre** del 1 al 5,
- notas.

La gráfica muestra la tendencia de la adherencia.

#### El plan del mes siguiente
Al terminar el mes presiona **Generar nuevo plan**. La app revisa **cómo cambió el peso** y **la adherencia**
del plan anterior:
- Si la adherencia fue **75 % o más** y el peso **no avanzó** al ritmo esperado para su objetivo, ajusta las
  calorías automáticamente (entre 100 y 150 kcal) y explica por qué en *Cómo se calculó*.
- Si la adherencia fue baja, **mantiene** las calorías: primero hay que mejorar el cumplimiento.

Todos los planes quedan en el **Historial de planes**; el plan del mes en curso aparece marcado como **vigente**.

#### Exportar
Presiona **Exportar plan**. Se abre el plan completo (4 semanas, listas de compras, recomendaciones y rutina activa):
- **Descargar PDF / Imprimir:** en la ventana de impresión elige **"Guardar como PDF"**.
- **Descargar Excel (CSV):** una fila por alimento de cada comida de cada día, con gramos y macronutrientes.

### 3.9 Cambios y bajas de clientes

Todo está en **Editar perfil y acceso**:

| Quiero… | Qué hacer |
|---|---|
| Corregir datos o respuestas del cuestionario | Edita el formulario y presiona **Guardar cambios**. |
| Cambiar el objetivo del cliente | Elige el nuevo objetivo y guarda. Después revisa su rutina y genera un nuevo plan de nutrición. |
| Cambiar el correo con que entra | En *Acceso a la aplicación* → **Cambiar correo de acceso**. |
| Que el cliente vuelva a entrar porque olvidó su contraseña | **Generar contraseña temporal** y envíasela. La anterior deja de funcionar. |
| Baja temporal (deja de venir, pero quiero conservar su historial) | **Desactivar acceso**. No podrá entrar, pero su información se conserva. Puedes **Reactivar acceso** cuando quieras. |
| Baja definitiva | Abajo de todo: **Eliminar cliente**. Borra todo su expediente y su acceso, y **no se puede deshacer**. |

### 3.10 Tu cuenta y tu contraseña

- **Mi cuenta** (barra rosa, abajo) → cambia tu contraseña cuando quieras. Al cambiarla se cierran las
  sesiones abiertas en otros equipos.
- **Salir** cierra tu sesión. Hazlo siempre en computadoras que no sean tuyas.
- Si escribes mal la contraseña **5 veces seguidas**, el acceso se bloquea **15 minutos** por seguridad.
- **¿Olvidaste tu contraseña?** Pide a quien instaló la app que ejecute este comando en la computadora
  donde está instalada. Te dará una nueva contraseña temporal:
  ```bash
  npm run admin -- monica@moni-fit.com Moni
  ```

---

## 4. Guía para los clientes

*(Puedes copiar esta sección y enviársela a tus clientes).*

1. **Entrar:** abre la dirección de la app, escribe tu correo y la contraseña temporal que te dio Moni.
   La primera vez te pedirá crear tu propia contraseña.
2. **Mi resumen:** tu peso, % de grasa y % de músculo más recientes, cómo va tu progreso, las fechas de tu plan
   de nutrición y **tu rutina** con la imagen de los músculos que trabajas y los ejercicios de cada día.
3. **Mi progreso:** tus gráficas de peso, grasa y músculo, y la tabla con tus medidas.
4. **Mi nutrición:** tu menú del mes, semana por semana, con porciones y lista de compras.
   - Al final de cada semana llena **Seguimiento semanal**: qué porcentaje del plan cumpliste, cuánta agua
     tomaste y cómo te sentiste de energía y hambre. Con eso Moni ajusta tu siguiente plan.
5. **Exportar mi plan:** botón **Exportar mi plan** → **Descargar PDF / Imprimir** (elige *Guardar como PDF*)
   o **Descargar Excel (CSV)**.
6. **Mi cuenta:** cambia tu contraseña. **Salir** cierra tu sesión.

¿Olvidaste tu contraseña? Pídele a Moni que te genere una nueva.

---

## 5. Rutina de trabajo recomendada para Moni

| Cuándo | Qué hacer |
|---|---|
| Cliente nuevo | Onboarding → crear acceso → registrar medidas y composición → asignar o personalizar rutina → generar plan de nutrición. |
| Cada semana | Revisar el **Seguimiento semanal** de nutrición de cada cliente. |
| Cada 2–4 semanas | Registrar **medidas** y **composición corporal**; revisar **Recomposición**. |
| Cada mes | **Generar nuevo plan** de nutrición; si el progreso se estancó, ajustar o cambiar la rutina. |
| Cada mes (o más seguido) | **Respaldo** de los datos (ver [sección 8](#respaldos)). |

---

## 6. Preguntas frecuentes

**¿Por qué no aparece el diagnóstico de recomposición?**
Hacen falta al menos dos registros de composición con % de grasa **y** % de músculo.

**¿Por qué no puedo generar el plan de nutrición?**
El cliente necesita al menos un peso registrado en *Composición corporal*.

**¿Por qué el plan no incluye cierto alimento?**
Revisa *Restricciones aplicadas*: puede estar excluido por una alergia o porque no le gusta. Para excluir más
alimentos usa **Excluir además** al generar el plan.

**Cambié la rutina, ¿se actualiza el plan de nutrición?**
No automáticamente. Genera un plan nuevo para que tome en cuenta los nuevos días de entrenamiento.

**Un cliente dice que no puede entrar.**
Revisa en *Acceso a la aplicación* que esté **Activo** y que el correo sea correcto. Si no recuerda su
contraseña, genera una temporal. Si falló 5 veces, debe esperar 15 minutos.

**¿Puedo borrar una rutina del catálogo?**
Sí, pero se quitará también del historial de los clientes que la tuvieron asignada. Si solo quieres una
variante, usa **Duplicar**.

---

## 7. Privacidad y seguridad

- Las contraseñas se guardan **cifradas** (scrypt); nadie puede leerlas, ni siquiera en la base de datos.
- Cada cliente solo puede ver y exportar **su propio** expediente. La app lo verifica en cada pantalla, en cada
  consulta y en cada acción, no solo en los menús.
- Las sesiones duran 30 días o hasta que la persona presiona **Salir**. Desactivar un acceso o restablecer una
  contraseña cierra de inmediato las sesiones de ese cliente.
- Tras 5 intentos fallidos el acceso se bloquea 15 minutos.
- La información de salud es sensible: si la app se publica en internet, debe servirse **solo con HTTPS**
  (ver sección 8).
- El plan nutricional y las rutinas son una **guía** generada con fórmulas estándar; no sustituyen una
  valoración médica.

---

## 8. Información técnica (instalación y mantenimiento)

*Esta sección es para la persona que instala o mantiene la aplicación.*

### Tecnología
- **Next.js 16** (App Router, Server Components y Server Actions) + **Tailwind CSS 4**. Un solo estilo
  compartido (rosa y blanco) definido en `src/app/globals.css`, con las clases `boton`, `campo`, `tarjeta`,
  `chip`, `pestana`, `menu-enlace`, etc.
- **SQLite** con el módulo nativo `node:sqlite` de Node (sin dependencias externas). El esquema está en
  `src/lib/esquema.sql` y se aplica solo al abrir la base.
- **Autenticación propia:** contraseñas con scrypt, sesiones en base de datos (cookie `httpOnly` con token
  aleatorio; en la base solo se guarda su SHA-256), bloqueo por intentos, y roles `admin` y `cliente`.

### Requisitos e instalación
Requiere **Node.js 24 o superior**.

```bash
npm install
npm run build
npm run admin -- monica@moni-fit.com Moni   # crea la cuenta de Moni y muestra su contraseña temporal
npm start                                        # http://localhost:3000
```

Para desarrollo: `npm run dev`.

`npm run admin -- <correo> [nombre]` crea la cuenta de administradora o, si ya existe, le asigna una **nueva
contraseña temporal** y cierra sus sesiones. Sirve también para recuperar el acceso de Moni.

### Datos y respaldos <a id="respaldos"></a>
Todos los datos viven en la carpeta **`data/`** (ignorada por git):
- `data/app-deportiva.db` — base de datos: clientes, medidas, rutinas, planes, usuarios.
- `data/imagenes/` — imágenes propias subidas a las rutinas.

**Respaldo:** detén la app (o asegúrate de que nadie la use) y copia la carpeta `data/` completa a un lugar
seguro. Para restaurar, vuelve a colocarla. Con la variable `DATA_DIR` puedes guardar los datos en otra ruta.

### Acceso de los clientes desde su celular
Con `npm start` la app solo es accesible en esa computadora (y en la misma red Wi-Fi mediante
`http://<IP-de-la-computadora>:3000`). Para que los clientes entren desde cualquier lugar hay que
**publicarla en un servidor con HTTPS**, por ejemplo una VPS con un proxy inverso como Caddy o Nginx, o un
túnel de Cloudflare. El proxy debe enviar el encabezado `X-Forwarded-Proto: https`: así la cookie de sesión
se marca como segura. Conserva la carpeta `data/` en un disco persistente.

### Estructura
```
scripts/admin.mjs            crea o restablece la cuenta de administradora
src/proxy.ts                 sin sesión → /login (filtro inicial)
src/app/(acceso)/            login y "Mi cuenta"
src/app/(admin)/             panel de Moni: clientes, rutinas, ejercicios
src/app/(portal)/portal/     portal del cliente: resumen, progreso, nutrición
src/app/(exportar)/          plan mensual imprimible y descarga CSV
src/app/acciones/            acciones del servidor (cada una verifica el rol)
src/components/              componentes compartidos (vistas de plan, recomposición, formularios…)
src/lib/auth.ts              contraseñas, sesiones y verificación de roles
src/lib/datos.ts             consultas; cada una verifica quién la pide
src/lib/nutricion.ts         motor del plan de nutrición
src/lib/recomposicion.ts     motor del diagnóstico de recomposición
src/lib/musculos.ts          catálogo de músculos y diagrama SVG
src/lib/catalogo-semilla.ts  45 ejercicios y 8 rutinas iniciales
src/lib/alimentos.ts         base de 56 alimentos con macronutrientes
```
