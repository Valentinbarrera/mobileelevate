# Product Brief: Elevate Mobile

**Date:** 2026-02-24
**Author:** Lucas Silva
**Project Level:** 3 (Complex integration)
**Project Type:** Mobile App (PWA/Web App mobile-first)

---

## Executive Summary

Elevate Mobile es la app companion para alumnos de coaches que usan Elevate Web. Permite a los alumnos ver sus rutinas asignadas, ejecutar entrenamientos con tracking de series/reps/peso, registrar progreso corporal, comunicarse con su coach y ver su historial. Es una app mobile-first conectada al mismo Supabase que Elevate Web.

---

## Problem Statement

Los alumnos de coaches fitness necesitan una interfaz dedicada para seguir sus entrenamientos diarios, registrar cargas y ver su progreso. Actualmente la web tiene una Student App básica pero no está optimizada para uso en el gym (mobile-first, rápida, offline-friendly).

**Why now:** Elevate Web MVP está completo. Los coaches necesitan que sus alumnos puedan usar la app desde el día 1 del launch.

**Impact if unsolved:** Sin app mobile, los alumnos no tienen forma práctica de seguir rutinas ni registrar entrenamientos, lo que elimina el valor core del producto.

---

## Target Audience

### Primary Users
- **Alumnos de coaches fitness** (18-40 años, LATAM hispanohablante)
- Usan el celular en el gym
- Necesitan ver qué ejercicios hacer, cuántas series/reps, y registrar peso
- Tech-savvy medio (usan Instagram, WhatsApp)

### Secondary Users
- **Coaches** (indirectamente) - ven el progreso de sus alumnos desde Elevate Web

---

## Solution Overview

App mobile-first (React SPA) que se conecta al Supabase de Elevate Web (`gssgoeaupfssexhliazy`) como único backend. Los alumnos se autentican con su cuenta de estudiante y acceden a:

### Key Features (MVP)
- **Auth**: Login con email/password (cuenta de estudiante de Elevate Web)
- **Dashboard**: Resumen del día, próxima sesión, streak, rutina activa
- **Rutinas**: Ver rutina asignada por el coach, días y ejercicios
- **Workout Execution**: Ejecutar sesión, trackear series/reps/peso en tiempo real
- **Progreso**: Ver evolución de peso, cintura, PRs, volumen de entrenamiento
- **Mediciones corporales**: Ver mediciones registradas por el coach
- **Mensajes**: Chat con el coach
- **Perfil**: Datos básicos, logout

### Value Proposition
Una experiencia mobile nativa para el alumno que complementa la plataforma del coach, con tracking de entrenamiento en tiempo real.

---

## Business Objectives

- Completar el ecosistema Elevate (Coach Web + Student Mobile)
- Proveer valor inmediato a los alumnos desde el launch
- Diferenciarse de apps genéricas con rutinas personalizadas del coach
- Preparar base para monetización futura (coaches cobran por el servicio)

### Success Metrics
- Alumno puede completar un workout end-to-end
- Datos de sesión visibles para el coach en Elevate Web
- < 3 segundos de carga en pantallas principales
- Funciona en Chrome Android y Safari iOS

---

## Scope

### In Scope
- Auth con Supabase (estudiantes de Elevate Web)
- Dashboard con stats del alumno
- Vista de rutinas asignadas (readonly)
- Ejecución de workouts con tracking de sets
- Historial de sesiones completadas
- Progreso: peso, cintura, volumen, PRs
- Mensajería con coach
- Perfil del alumno
- PWA installable

### Out of Scope
- Registro de nuevos usuarios (lo hace el coach desde web)
- Workout library standalone (solo rutinas del coach)
- Nutrición
- Achievements/gamification (post-MVP)
- Check-ins semanales (post-MVP)
- Modo offline
- Notificaciones push
- Segundo Supabase project (se elimina)

### Future Considerations
- Notificaciones push (workout reminder)
- Modo offline con sync
- Gamification (XP, badges, streak rewards)
- Check-ins semanales con fotos
- Nutrición integrada
- Video de ejercicios inline

---

## Stakeholders

- **Lucas Silva (Owner)** - High influence. Product owner y developer.
- **Coaches** - Medium influence. Necesitan que sus alumnos usen la app.
- **Alumnos** - High influence. End users.

---

## Constraints

- Debe usar el mismo Supabase que Elevate Web (`gssgoeaupfssexhliazy`)
- Codebase existente con 188 archivos - limpiar, no reescribir
- Mismas tablas de DB que la web (students, routines, planned_sessions, completed_sessions, etc.)
- Timeline: ASAP (1 semana ideal)
- Solo 1 desarrollador (AI loop)

---

## Assumptions

- Los alumnos ya tienen cuenta creada por el coach en Elevate Web
- Las tablas de Supabase ya existen (creadas por Elevate Web)
- La app será accedida desde browser mobile (Chrome/Safari)
- El coach asigna rutinas desde Elevate Web antes de que el alumno las vea
- RLS policies ya están configuradas en Supabase

---

## Risks

- **Risk:** Codebase tiene dual Supabase que hay que unificar
  - **Likelihood:** Certain
  - **Mitigation:** Eliminar segundo Supabase, apuntar todo a `gssgoeaupfssexhliazy`

- **Risk:** Tablas/queries de la mobile no coinciden con schema de web
  - **Likelihood:** High
  - **Mitigation:** Auditar queries y adaptar a tablas existentes

- **Risk:** Mucho código standalone que no aplica al MVP student-only
  - **Likelihood:** High
  - **Mitigation:** Eliminar o gate-ar features no-MVP

---

**This brief was created using BMAD Method v6 - Phase 1 (Analysis)**
