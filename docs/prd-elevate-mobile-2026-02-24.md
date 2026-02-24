# PRD: Elevate Mobile

**Date:** 2026-02-24
**Product Manager:** Lucas Silva
**Project Level:** 3
**Product Brief:** docs/product-brief-elevate-mobile-2026-02-24.md

---

## Executive Summary

Elevate Mobile es la app para alumnos de coaches fitness. Se conecta al mismo Supabase de Elevate Web como único backend. MVP: auth, dashboard, rutinas, workout execution, progreso, mensajes, perfil.

**Key Metrics:**
- Functional Requirements: 16 (12 Must, 3 Should, 1 Could)
- Non-Functional Requirements: 5
- Epics: 7
- Estimated Stories: 25-35

---

## Functional Requirements

### FR-001: Login de Alumno
**Priority:** Must Have

**Description:**
El alumno puede iniciar sesión con email y password usando su cuenta de estudiante de Elevate Web.

**Acceptance Criteria:**
- [ ] Login con email/password contra Supabase auth
- [ ] Sesión persistente (no pide login cada vez)
- [ ] Error message claro si credenciales incorrectas
- [ ] Redirect a dashboard después de login exitoso

**Dependencies:** Ninguna

---

### FR-002: Recuperación de Contraseña
**Priority:** Must Have

**Description:**
El alumno puede solicitar reset de contraseña desde la pantalla de login.

**Acceptance Criteria:**
- [ ] Link "Olvidé mi contraseña" en pantalla de login
- [ ] Envía email de reset vía Supabase
- [ ] Página para establecer nueva contraseña
- [ ] Redirect a login tras cambio exitoso

---

### FR-003: Dashboard del Alumno
**Priority:** Must Have

**Description:**
Pantalla principal mostrando resumen del día: rutina activa, próxima sesión, streak, stats semanales.

**Acceptance Criteria:**
- [ ] Muestra nombre del alumno
- [ ] Muestra rutina activa (nombre, semanas)
- [ ] Muestra sesiones completadas vs planificadas esta semana
- [ ] Muestra streak actual
- [ ] Muestra próxima sesión planificada
- [ ] CTA para iniciar workout si hay sesión hoy

---

### FR-004: Ver Rutinas Asignadas
**Priority:** Must Have

**Description:**
El alumno puede ver la rutina que le asignó su coach, con todos los días y ejercicios.

**Acceptance Criteria:**
- [ ] Lista de rutinas asignadas (activa destacada)
- [ ] Detalle de rutina con días
- [ ] Detalle de día con ejercicios (nombre, series, reps, descanso)
- [ ] Información del ejercicio (muscle group, equipment)

---

### FR-005: Ejecución de Workout
**Priority:** Must Have

**Description:**
El alumno puede ejecutar una sesión de entrenamiento, registrando series, reps y peso para cada ejercicio.

**Acceptance Criteria:**
- [ ] Iniciar sesión de entrenamiento (crea completed_session)
- [ ] Ver lista de ejercicios del día
- [ ] Para cada ejercicio: registrar peso, reps por serie
- [ ] Timer de descanso entre series
- [ ] Finalizar sesión (guarda duración total)
- [ ] Resumen al completar

---

### FR-006: Historial de Sesiones
**Priority:** Must Have

**Description:**
El alumno puede ver sus sesiones completadas anteriores.

**Acceptance Criteria:**
- [ ] Lista de sesiones completadas ordenadas por fecha
- [ ] Detalle de sesión con ejercicios y sets realizados
- [ ] Fecha, duración, volumen total

---

### FR-007: Progreso - Peso y Mediciones
**Priority:** Must Have

**Description:**
El alumno puede ver la evolución de su peso y mediciones corporales registradas por el coach.

**Acceptance Criteria:**
- [ ] Gráfico de evolución de peso
- [ ] Gráfico de evolución de cintura
- [ ] Última medición destacada
- [ ] Historial de mediciones

---

### FR-008: Progreso - PRs y Volumen
**Priority:** Must Have

**Description:**
El alumno puede ver sus records personales y evolución de volumen de entrenamiento.

**Acceptance Criteria:**
- [ ] Lista de PRs por ejercicio (peso máximo)
- [ ] Gráfico de volumen por sesión
- [ ] Detección de nuevos PRs durante workout

---

### FR-009: Mensajes con Coach
**Priority:** Must Have

**Description:**
El alumno puede enviar y recibir mensajes de su coach.

**Acceptance Criteria:**
- [ ] Ver historial de mensajes
- [ ] Enviar mensaje de texto
- [ ] Mensajes ordenados cronológicamente
- [ ] Marcar como leídos al abrir

---

### FR-010: Perfil del Alumno
**Priority:** Must Have

**Description:**
El alumno puede ver su perfil y cerrar sesión.

**Acceptance Criteria:**
- [ ] Muestra nombre, email, fecha de registro
- [ ] Muestra objetivo y nivel si están definidos
- [ ] Botón de cerrar sesión
- [ ] Link a mediciones corporales

---

### FR-011: Sesiones Planificadas
**Priority:** Must Have

**Description:**
El alumno puede ver sus próximas sesiones planificadas por el coach.

**Acceptance Criteria:**
- [ ] Lista de próximas sesiones con fecha y día de rutina
- [ ] Indicador de sesiones completadas vs pendientes
- [ ] Acceso directo a iniciar sesión del día

---

### FR-012: Bottom Navigation
**Priority:** Must Have

**Description:**
Navegación persistente en la parte inferior con acceso a secciones principales.

**Acceptance Criteria:**
- [ ] Tabs: Home, Rutinas, Progreso, Mensajes, Perfil
- [ ] Indicador de tab activo
- [ ] Siempre visible excepto durante workout

---

### FR-013: PWA Installable
**Priority:** Should Have

**Description:**
La app puede instalarse como PWA desde el browser.

**Acceptance Criteria:**
- [ ] Manifest correcto con iconos
- [ ] Service worker para caching básico
- [ ] Prompt de instalación funcional

---

### FR-014: Planificación Semanal Visual
**Priority:** Should Have

**Description:**
Vista semanal mostrando qué días tiene sesión y cuáles completó.

**Acceptance Criteria:**
- [ ] Vista de 7 días con indicadores
- [ ] Días con sesión planificada marcados
- [ ] Días completados con check

---

### FR-015: Resumen Post-Workout
**Priority:** Should Have

**Description:**
Al completar un workout, mostrar resumen con stats y celebración.

**Acceptance Criteria:**
- [ ] Duración total
- [ ] Volumen total
- [ ] PRs logrados (si hubo)
- [ ] Animación de celebración

---

### FR-016: Fotos de Progreso
**Priority:** Could Have

**Description:**
El alumno puede ver fotos de progreso tomadas durante mediciones.

**Acceptance Criteria:**
- [ ] Galería de fotos por medición
- [ ] Comparación antes/después

---

## Non-Functional Requirements

### NFR-001: Performance
**Priority:** Must Have

**Description:** La app debe cargar rápido en conexiones mobile.

**Acceptance Criteria:**
- [ ] First Contentful Paint < 2s en 4G
- [ ] Navegación entre pantallas < 500ms
- [ ] Lazy loading en todas las rutas

---

### NFR-002: Mobile-First UX
**Priority:** Must Have

**Description:** UI optimizada para uso con una mano en el gym.

**Acceptance Criteria:**
- [ ] Botones de tamaño mínimo 44x44px
- [ ] Funciona en viewport 320px-428px
- [ ] Scroll vertical, no horizontal
- [ ] Dark theme por defecto

---

### NFR-003: Seguridad
**Priority:** Must Have

**Description:** Datos del alumno protegidos con RLS.

**Acceptance Criteria:**
- [ ] Alumno solo ve sus propios datos
- [ ] Auth token refresh automático
- [ ] Logout limpia toda la sesión

---

### NFR-004: Compatibilidad
**Priority:** Must Have

**Description:** Funciona en browsers principales mobile.

**Acceptance Criteria:**
- [ ] Chrome Android 90+
- [ ] Safari iOS 15+
- [ ] Samsung Internet

---

### NFR-005: Código Limpio
**Priority:** Should Have

**Description:** Codebase limpio sin código muerto ni features no-MVP.

**Acceptance Criteria:**
- [ ] Sin segundo Supabase project
- [ ] Sin features standalone (achievements, nutrition, check-ins)
- [ ] Build sin warnings críticos

---

## Epics

### EPIC-001: Cleanup & Auth
**Description:** Eliminar segundo Supabase, unificar auth, limpiar código standalone.
**FRs:** FR-001, FR-002
**Story Estimate:** 5-7 stories
**Priority:** Must Have

### EPIC-002: Dashboard & Navigation
**Description:** Dashboard funcional con stats reales y bottom navigation.
**FRs:** FR-003, FR-012
**Story Estimate:** 3-4 stories
**Priority:** Must Have

### EPIC-003: Rutinas
**Description:** Ver rutinas asignadas por el coach.
**FRs:** FR-004, FR-011, FR-014
**Story Estimate:** 3-4 stories
**Priority:** Must Have

### EPIC-004: Workout Execution
**Description:** Ejecutar workouts con tracking de sets en tiempo real.
**FRs:** FR-005, FR-006, FR-015
**Story Estimate:** 4-5 stories
**Priority:** Must Have

### EPIC-005: Progreso
**Description:** Visualización de progreso corporal y de entrenamiento.
**FRs:** FR-007, FR-008, FR-016
**Story Estimate:** 3-4 stories
**Priority:** Must Have

### EPIC-006: Comunicación
**Description:** Mensajería alumno-coach.
**FRs:** FR-009
**Story Estimate:** 2-3 stories
**Priority:** Must Have

### EPIC-007: Perfil & PWA
**Description:** Perfil del alumno y configuración PWA.
**FRs:** FR-010, FR-013
**Story Estimate:** 2-3 stories
**Priority:** Must Have

---

## Traceability Matrix

| Epic | FRs | Stories Est. | Priority |
|------|-----|-------------|----------|
| EPIC-001 | FR-001, FR-002 | 5-7 | Must |
| EPIC-002 | FR-003, FR-012 | 3-4 | Must |
| EPIC-003 | FR-004, FR-011, FR-014 | 3-4 | Must |
| EPIC-004 | FR-005, FR-006, FR-015 | 4-5 | Must |
| EPIC-005 | FR-007, FR-008, FR-016 | 3-4 | Must |
| EPIC-006 | FR-009 | 2-3 | Must |
| EPIC-007 | FR-010, FR-013 | 2-3 | Must |
| **Total** | **16 FRs** | **22-30** | |

---

## Prioritization Summary
- **Must Have FRs:** 12
- **Should Have FRs:** 3
- **Could Have FRs:** 1
- **Must Have NFRs:** 4
- **Should Have NFRs:** 1

---

**This PRD was created using BMAD Method v6 - Phase 2 (Planning)**
