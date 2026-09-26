# App Deportiva (monica-app)

Plataforma para dar seguimiento integral a clientes de entrenamiento: onboarding clínico, mediciones,
composición corporal, recomposición, rutinas deportivas y nutrición.

## Módulos

| Módulo | Qué hace |
|---|---|
| **Onboarding / Perfil clínico** | Cuestionario en 7 secciones (datos personales, salud, perfil hormonal, estilo de vida, nutrición, actividad física y aspectos psicológicos). Resalta lesiones, enfermedades y medicamentos como alertas. |
| **Antropometría** | Registro con cinta métrica: brazo, pierna y pantorrilla (izq./der.), cintura, cuello y cadera. Calcula índice cintura/cadera y cintura/estatura. |
| **Composición corporal** | Peso, estatura, % de grasa, % de masa muscular y grasa visceral; calcula IMC y kilos de grasa y músculo. |
| **Recomposición (dashboard)** | Contrasta peso vs. masa grasa y masa muscular en el tiempo y diagnostica si hay recomposición y si va alineada al objetivo. |
| **Rutinas** | Catálogo propuesto de 45 ejercicios y 8 rutinas por objetivo; todo es editable. Cada rutina tiene una imagen con los músculos trabajados (generada automáticamente o subida). Se asignan al cliente tal cual o se personalizan. |
| **Nutrición** | Genera un plan mensual (4 semanas) por cliente: calcula metabolismo basal (Katch-McArdle con % de grasa o Mifflin-St Jeor), gasto por días de entrenamiento de su rutina activa, calorías y macros según el objetivo, con más carbohidratos en días de entrenamiento. Arma el menú diario con una base de 56 alimentos, excluyendo alergias, intolerancias y aversiones del onboarding, e incluye lista de compras semanal y recomendaciones. El seguimiento semanal de adherencia y el cambio de peso ajustan automáticamente las calorías del siguiente plan. |

## Arquitectura

- **Next.js 16** (App Router, Server Components y Server Actions) + **Tailwind CSS 4**.
- **SQLite** con el módulo nativo `node:sqlite` de Node (sin dependencias externas). Las respuestas del
  onboarding se guardan como documento JSON por cliente.
- La base de datos y las imágenes subidas viven en `data/` (ignorada por git). Se crea y se siembra con el
  catálogo la primera vez que se usa. La ubicación se puede cambiar con la variable `DATA_DIR`.

```
src/
  app/            rutas (clientes, rutinas, ejercicios) y acciones del servidor (app/acciones)
  components/     formularios, editor de rutinas, diagrama muscular, gráficas
  lib/            base de datos, consultas, catálogo semilla, motores de recomposición y de nutrición
```

## Uso

Requiere Node.js 24 o superior (por `node:sqlite`).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

> La aplicación no tiene inicio de sesión: está pensada para uso local de un entrenador. Antes de
> publicarla en internet hay que agregar autenticación, porque guarda información de salud.
>
> El plan nutricional es una guía generada automáticamente a partir de fórmulas estándar; si el cliente
> tiene enfermedades o toma medicamentos, debe validarlo un profesional de la salud (la app lo indica).
