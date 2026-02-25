# Elevate Mobile

PWA para alumnos de la plataforma **Elevate** — app de entrenamiento personalizado para coaches de fitness.

## Stack

- **React 18** + TypeScript + Vite 5
- **Supabase** (auth, Realtime, database)
- **TanStack React Query** (server state)
- **shadcn/ui** + Tailwind CSS (UI)
- **Framer Motion** (animaciones)
- **Recharts** (gráficos de progreso)
- **vite-plugin-pwa** (instalable como app)

## Funcionalidades

- Login de alumnos (email/password vía Supabase Auth)
- Ver rutinas asignadas por el coach
- Registrar sesiones de entrenamiento (series, reps, peso)
- Progreso: racha, volumen semanal, PRs, gráficos de evolución
- Mediciones antropométricas (peso, cintura, pecho, etc.)
- Mensajería con el coach (Supabase Realtime)
- Perfil del alumno

## Setup local

```bash
git clone https://github.com/LucasEzequielSilva/mobileelevate.git
cd mobileelevate
npm install
cp .env.example .env   # Completar con credenciales de Supabase
npm run dev
```

## Variables de entorno

Ver `.env.example` para las variables requeridas.

## Base de datos

Comparte la misma instancia de Supabase que [Elevate Web](https://github.com/LucasEzequielSilva/elevate) (proyecto `gssgoeaupfssexhliazy`). El coach gestiona desde la web, el alumno interactúa desde esta PWA.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (localhost:8080) |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run preview` | Preview del build |
