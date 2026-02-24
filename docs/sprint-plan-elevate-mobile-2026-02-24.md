# Sprint Plan: Elevate Mobile

**Date:** 2026-02-24
**Scrum Master:** Lucas Silva (Steve)
**Project Level:** 3
**Total Stories:** 30
**Total Points:** 105
**Planned Sprints:** 3
**Team Capacity:** 35 points per sprint

---

## Executive Summary

Plan de 3 sprints para llevar Elevate Mobile de codebase con dual-Supabase y features standalone a MVP student-only conectado a Elevate Web.

---

## Story Inventory

### EPIC-001: Cleanup & Auth

#### STORY-001: Eliminar segundo Supabase project
**Points:** 5
**Priority:** Must Have
**Description:** Eliminar `coachSupabase` client, `useCoachAuth`, `CoachAuthContext`. Reemplazar con single Supabase client apuntando a `gssgoeaupfssexhliazy`.
**Acceptance Criteria:**
- [ ] Solo existe un Supabase client
- [ ] URL y key apuntan a Elevate Web project
- [ ] No quedan referencias a `fumuvimyitsnuweqrgap` ni `syrtcaagrrhdofekivjs`

#### STORY-002: Implementar auth de estudiante
**Points:** 5
**Priority:** Must Have
**Description:** Crear `useStudentAuth` hook que autentica contra Supabase y fetchea perfil de tabla `students`. Reemplazar `useAuth` y `useCoachAuth`.
**Acceptance Criteria:**
- [ ] Login con email/password funcional
- [ ] Sesión persistente
- [ ] Fetch de student profile post-login
- [ ] ProtectedRoute usa nueva auth

#### STORY-003: Implementar recuperación de contraseña
**Points:** 3
**Priority:** Must Have
**Description:** Pantalla de reset password funcional.
**Acceptance Criteria:**
- [ ] Link desde login
- [ ] Email de reset vía Supabase
- [ ] Página para nueva contraseña

#### STORY-004: Eliminar features standalone
**Points:** 5
**Priority:** Must Have
**Description:** Eliminar Achievements, Nutrition, Check-ins, Onboarding, Programs y todo código que dependa del Supabase standalone.
**Acceptance Criteria:**
- [ ] Páginas eliminadas o vaciadas
- [ ] Hooks standalone eliminados
- [ ] Componentes sin uso eliminados
- [ ] Imports limpios

#### STORY-005: Limpiar rutas y navegación
**Points:** 3
**Priority:** Must Have
**Description:** Actualizar App.tsx con rutas MVP. Actualizar BottomNav: Home, Rutinas, Progreso, Mensajes, Perfil.
**Acceptance Criteria:**
- [ ] Solo rutas MVP en App.tsx
- [ ] BottomNav con 5 tabs correctos
- [ ] Rutas standalone removidas

#### STORY-006: Verificar build limpio
**Points:** 2
**Priority:** Must Have
**Description:** Instalar deps, correr build, zero errors.
**Acceptance Criteria:**
- [ ] `npm install` exitoso
- [ ] `vite build` sin errores
- [ ] Sin warnings de imports rotos

---

### EPIC-002: Dashboard & Navigation

#### STORY-007: Dashboard con datos reales
**Points:** 5
**Priority:** Must Have
**Description:** Adaptar Index.tsx para usar datos de Elevate Web. Mostrar rutina activa, sesiones de la semana, streak, próxima sesión.
**Acceptance Criteria:**
- [ ] Query a routine_assignments para rutina activa
- [ ] Query a planned_sessions/completed_sessions para stats semana
- [ ] Streak calculado de completed_sessions
- [ ] Próxima sesión desde planned_sessions

#### STORY-008: Componentes de Dashboard limpios
**Points:** 3
**Priority:** Must Have
**Description:** Limpiar componentes de home: remover nutrition section, standalone workout card. Mantener greeting, weekly progress, next session CTA.
**Acceptance Criteria:**
- [ ] Sin sección nutrition mock
- [ ] Sin workout card standalone
- [ ] Componentes muestran datos reales

---

### EPIC-003: Rutinas

#### STORY-009: Vista de rutina asignada
**Points:** 5
**Priority:** Must Have
**Description:** Adaptar Routines.tsx para mostrar rutina(s) asignada(s) desde routine_assignments de Elevate Web.
**Acceptance Criteria:**
- [ ] Lista rutinas asignadas al student
- [ ] Rutina activa destacada
- [ ] Nombre, objetivo, semanas

#### STORY-010: Detalle de rutina (días y ejercicios)
**Points:** 5
**Priority:** Must Have
**Description:** Adaptar RoutineDetail.tsx para mostrar días y ejercicios de la rutina.
**Acceptance Criteria:**
- [ ] Selector de días
- [ ] Lista de ejercicios por día (nombre, series, reps, descanso)
- [ ] Info de ejercicio (muscle group, equipment)

#### STORY-011: Sesiones planificadas
**Points:** 3
**Priority:** Must Have
**Description:** Mostrar próximas sesiones planificadas del alumno.
**Acceptance Criteria:**
- [ ] Lista de planned_sessions con fecha
- [ ] Nombre del día de rutina
- [ ] Estado completado/pendiente

---

### EPIC-004: Workout Execution

#### STORY-012: Iniciar sesión de workout
**Points:** 5
**Priority:** Must Have
**Description:** Adaptar WorkoutDetail para crear completed_session e iniciar tracking.
**Acceptance Criteria:**
- [ ] Crea completed_session en Supabase
- [ ] Carga ejercicios del routine_day
- [ ] Timer de sesión activo

#### STORY-013: Tracking de sets
**Points:** 5
**Priority:** Must Have
**Description:** Registrar series con peso, reps para cada ejercicio.
**Acceptance Criteria:**
- [ ] Input de peso y reps por set
- [ ] Guardar completed_exercises en Supabase
- [ ] Timer de descanso entre sets
- [ ] Indicador de set actual vs total

#### STORY-014: Finalizar workout y resumen
**Points:** 3
**Priority:** Must Have
**Description:** Completar sesión y mostrar resumen.
**Acceptance Criteria:**
- [ ] Actualiza completed_session con duración
- [ ] Pantalla de resumen con stats
- [ ] Volumen total calculado

#### STORY-015: Historial de sesiones
**Points:** 3
**Priority:** Must Have
**Description:** Listar sesiones completadas del alumno.
**Acceptance Criteria:**
- [ ] Lista ordenada por fecha
- [ ] Fecha, duración, ejercicios
- [ ] Detalle al tap

---

### EPIC-005: Progreso

#### STORY-016: Gráficos de peso y cintura
**Points:** 3
**Priority:** Must Have
**Description:** Mostrar evolución de peso y cintura desde tabla anthropometry.
**Acceptance Criteria:**
- [ ] LineChart de peso
- [ ] LineChart de cintura
- [ ] Última medición destacada

#### STORY-017: PRs y volumen
**Points:** 3
**Priority:** Must Have
**Description:** Mostrar records personales y evolución de volumen.
**Acceptance Criteria:**
- [ ] Lista de PRs por ejercicio
- [ ] Gráfico de volumen por sesión
- [ ] Detección de PRs basada en completed_exercises

#### STORY-018: Mediciones corporales
**Points:** 3
**Priority:** Must Have
**Description:** Página de mediciones detalladas con historial.
**Acceptance Criteria:**
- [ ] Grid de última medición (peso, cintura, cadera, grasa)
- [ ] Historial de mediciones
- [ ] Fotos de progreso si existen

---

### EPIC-006: Comunicación

#### STORY-019: Vista de mensajes
**Points:** 3
**Priority:** Must Have
**Description:** Pantalla de chat con el coach.
**Acceptance Criteria:**
- [ ] Lista de mensajes ordenados
- [ ] Bubbles de chat (student vs coach)
- [ ] Timestamp por mensaje

#### STORY-020: Enviar mensajes
**Points:** 3
**Priority:** Must Have
**Description:** Input para enviar mensajes al coach.
**Acceptance Criteria:**
- [ ] Input con botón de enviar
- [ ] Insert en tabla messages
- [ ] Scroll automático al nuevo mensaje
- [ ] Marcar como leídos

---

### EPIC-007: Perfil & PWA

#### STORY-021: Perfil del alumno
**Points:** 2
**Priority:** Must Have
**Description:** Pantalla de perfil con datos del estudiante.
**Acceptance Criteria:**
- [ ] Nombre, email, edad
- [ ] Objetivo, nivel
- [ ] Fecha de registro
- [ ] Botón logout

#### STORY-022: Configurar PWA
**Points:** 3
**Priority:** Should Have
**Description:** Manifest, service worker, iconos para PWA installable.
**Acceptance Criteria:**
- [ ] manifest.webmanifest correcto
- [ ] Service worker con caching básico
- [ ] Iconos en múltiples tamaños

#### STORY-023: Env vars y deploy config
**Points:** 2
**Priority:** Must Have
**Description:** Configurar .env con Supabase URL/key correctos, documentar deploy.
**Acceptance Criteria:**
- [ ] .env.example con vars necesarias
- [ ] Apunta a gssgoeaupfssexhliazy
- [ ] Build production funcional

---

## Sprint Allocation

### Sprint 1: "Clean Slate" - 33/35 points
**Goal:** Eliminar dual Supabase, auth funcional, codebase limpio, build passing

**Stories:**
- STORY-001: Eliminar segundo Supabase (5)
- STORY-002: Auth de estudiante (5)
- STORY-003: Recuperación de contraseña (3)
- STORY-004: Eliminar features standalone (5)
- STORY-005: Limpiar rutas y navegación (3)
- STORY-006: Verificar build limpio (2)
- STORY-007: Dashboard con datos reales (5)
- STORY-008: Componentes dashboard limpios (3)
- STORY-023: Env vars y deploy config (2)

---

### Sprint 2: "Core Experience" - 35/35 points
**Goal:** Rutinas visibles, workout execution completo, sesiones planificadas

**Stories:**
- STORY-009: Vista de rutina asignada (5)
- STORY-010: Detalle de rutina (5)
- STORY-011: Sesiones planificadas (3)
- STORY-012: Iniciar sesión de workout (5)
- STORY-013: Tracking de sets (5)
- STORY-014: Finalizar workout y resumen (3)
- STORY-015: Historial de sesiones (3)
- STORY-019: Vista de mensajes (3)
- STORY-020: Enviar mensajes (3)

---

### Sprint 3: "Progress & Polish" - 37/35 points
**Goal:** Progreso visual, perfil, PWA, pulido final

**Stories:**
- STORY-016: Gráficos de peso y cintura (3)
- STORY-017: PRs y volumen (3)
- STORY-018: Mediciones corporales (3)
- STORY-021: Perfil del alumno (2)
- STORY-022: PWA config (3)

**Total:** 14 points (sprint ligero, buffer para bugs)

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Queries no coinciden con schema web | High | Auditar tablas existentes primero |
| Hook migration rompe funcionalidad | Medium | Build check después de cada cambio |
| RLS policies no cubren mobile queries | Medium | Verificar policies existentes |

---

## Definition of Done

- [ ] Código implementado y commiteado
- [ ] Build sin errores
- [ ] Queries apuntan a Supabase correcto
- [ ] Sin código standalone residual
- [ ] Funcional en Chrome mobile

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
