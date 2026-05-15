# iOS Launch Checklist — Elevate

Pasos para publicar Elevate en App Store desde Windows. Todo lo que sigue es trabajo administrativo en los portales web de Apple. **No requiere Mac.**

## 1. Apple Developer Portal (`developer.apple.com`)

URL: <https://developer.apple.com/account>

### 1.1. Crear App ID

1. Menú lateral → **Certificates, Identifiers & Profiles**
2. **Identifiers** → botón `+` (arriba a la derecha)
3. Elegir **App IDs** → Continue
4. Elegir **App** → Continue
5. Llenar:
   - **Description**: `Elevate Mobile`
   - **Bundle ID**: seleccionar `Explicit` → `com.elevateap.mobile`
6. Bajo **Capabilities**, marcar:
   - ✅ **Push Notifications**
   - (las demás dejarlas sin marcar — la app no las necesita)
7. Continue → Register

### 1.2. Crear APNs Authentication Key (para push notifications)

Esto te lo va a pedir Supabase para enviar push desde el backend.

1. Menú lateral → **Keys** → botón `+`
2. Nombre: `Elevate APNs Key`
3. Marcar ✅ **Apple Push Notifications service (APNs)**
4. Continue → Register
5. **Descargar el archivo `.p8`** (solo se puede descargar UNA vez, guardalo seguro)
6. Anotar el **Key ID** y tu **Team ID** (lo ves arriba a la derecha)

> Estos 3 valores los vas a usar después en Supabase: `Key ID`, `Team ID`, archivo `.p8`.

---

## 2. App Store Connect (`appstoreconnect.apple.com`)

URL: <https://appstoreconnect.apple.com>

### 2.1. Crear la App

1. **My Apps** → botón `+` (arriba) → **New App**
2. Llenar:
   - **Platforms**: ✅ iOS
   - **Name**: `Elevate`
   - **Primary Language**: `Spanish (Mexico)` (o el que corresponda a tu mercado)
   - **Bundle ID**: seleccionar `com.elevateap.mobile - Elevate Mobile`
   - **SKU**: `ELEVATE-MOBILE-001` (cualquier identificador único, solo lo ves vos)
   - **User Access**: `Full Access`
3. Create

### 2.2. Llenar metadata obligatoria

En **App Information** (menú izquierdo):

- **Subtitle** (max 30 chars): `Tu entrenamiento personalizado`
- **Privacy Policy URL**: `https://TU-DOMINIO/privacy.html` (la página que creamos en `public/privacy.html`)
- **Category**:
  - Primary: `Health & Fitness`
  - Secondary: opcional, podés dejar vacío
- **Content Rights**: marcar según corresponda

En **Pricing and Availability**:
- **Price**: `Free`
- **Availability**: seleccionar los países donde quieras publicar

En **App Privacy**:
- Click en **Get Started** y respondé las preguntas. Para tu caso:
  - ✅ Email Address — usado para autenticación, vinculado a usuario, NO usado para tracking
  - ✅ Name — vinculado a usuario, NO usado para tracking
  - ✅ Health & Fitness (peso, altura, edad, lesiones) — vinculado a usuario, NO usado para tracking
  - ✅ User Content (rutinas, mensajes) — vinculado a usuario, NO usado para tracking
  - ❌ NO marcar Location, Contacts, Browsing History, Search History, Identifiers, Advertising Data
  - **Used for Tracking**: No

### 2.3. Preparar el Version 1.0.0 release

En la sección **iOS App → 1.0.0 Prepare for Submission**:

- **What's New in This Version**: en la primera versión queda vacío (es solo para updates)
- **Promotional Text** (opcional, max 170 chars)
- **Description**: descripción completa de la app (max 4000 chars) — te la armo cuando estemos cerca de submission
- **Keywords** (max 100 chars total, separados por coma): `entrenamiento, fitness, gym, rutinas, alumnos, coach, ejercicios, progreso`
- **Support URL**: tu URL de soporte (puede ser la misma del sitio o un mailto)
- **Marketing URL** (opcional)
- **Screenshots**:
  - 6.7" Display (iPhone 15 Pro Max): mínimo 3 screenshots, máximo 10
  - 6.5" Display (iPhone 11 Pro Max): mínimo 3 screenshots, máximo 10
  - iPads no son necesarios si la app es solo iPhone
  > Las vamos a generar con el simulator de Codemagic más adelante.
- **App Review Information**:
  - **Sign-in required**: ✅ Yes
  - **Demo Account** → ver paso 3 (Credenciales de prueba)
  - **Notes**: explicar brevemente qué hace la app: *"Aplicación para alumnos de gimnasio. Los usuarios son agregados por su coach desde una herramienta separada. El demo account te permite ver una cuenta con rutinas y datos cargados."*

---

## 3. Credenciales de prueba para review de Apple

Apple necesita poder loguearse y testear tu app. Como no hay signup público, tenés que crear un user de demo:

1. En Supabase Dashboard → Authentication → Users → **Add user**
   - Email: `apple-review@elevate.app` (o cualquier email que controles)
   - Password: generar uno fuerte y guardarlo
2. En la tabla `students`, insertar un row vinculando ese user a algún coach con datos de muestra:
   - `email`: mismo email del paso anterior
   - `coach_id`: el ID de un coach existente
   - `full_name`: `Apple Reviewer`
   - `status`: `active`
   - Llenar el resto con datos plausibles
3. Asignar al menos una rutina con ejercicios para que la app no esté vacía cuando Apple la abra
4. Anotar email y password — los cargás en App Store Connect en **App Review Information → Demo Account**

---

## 4. Sandbox / Testing antes de submission

- **TestFlight Internal Testing**: hasta 100 testers que sean miembros de tu Apple Developer team. No requiere review de Apple, build disponible en minutos después de upload.
- **TestFlight External Testing**: hasta 10.000 testers externos. Requiere un "Beta App Review" rápido (24h aprox).

Recomendación: testear primero en TestFlight Internal con tu propio iPhone antes de mandar a submission.

---

## Checklist resumido

- [ ] App ID `com.elevateap.mobile` creado con Push capability
- [ ] APNs Key `.p8` descargada y guardada
- [ ] App creada en App Store Connect
- [ ] Privacy Policy URL pública y accesible
- [ ] Privacy questionnaire respondido
- [ ] User demo creado en Supabase y vinculado a coach
- [ ] App Review Information completada con demo account
- [ ] (Cuando lo armemos) Codemagic conectado al repo
- [ ] (Después) Screenshots subidos
- [ ] (Después) Descripción y keywords
- [ ] Submit for review
