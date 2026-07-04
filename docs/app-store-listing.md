# App Store Connect — Ficha de Elevate (v1.0.0)

Contenido listo para copiar/pegar en App Store Connect. App en español (región primaria: Argentina).

---

## Datos base

| Campo | Valor |
|---|---|
| **Nombre** | Elevate |
| **Subtítulo** (30 car. máx) | Tu entrenador, en tu bolsillo |
| **Bundle ID** | com.elevateap.mobile |
| **Categoría primaria** | Salud y forma física (Health & Fitness) |
| **Categoría secundaria** | Estilo de vida (opcional) |
| **Idioma primario** | Español (México o Español para toda LatAm) |
| **Precio** | Gratis |
| **Clasificación por edad** | 4+ (sin contenido objetable) |

### URLs
| Campo | Valor |
|---|---|
| **URL de soporte** | https://mobileelevate-theta.vercel.app/soporte |
| **URL de marketing** (opcional) | https://mobileelevate-theta.vercel.app |
| **Política de privacidad** | https://mobileelevate-theta.vercel.app/privacidad |
| **Email de contacto** | appelevate343@gmail.com |

---

## Subtítulo (máx. 30 caracteres)
```
Tu entrenador, en tu bolsillo
```
*(29 caracteres — alternativas: "Entrená con tu coach real" · "Rutinas, nutrición y progreso")*

## Texto promocional (máx. 170 caracteres — se puede cambiar sin nueva versión)
```
Entrená con las rutinas que arma tu coach, registrá tus series y kilos, seguí tu nutrición y mirá tu progreso real. Todo en un solo lugar.
```

## Descripción
```
Elevate conecta a atletas con su entrenador personal para llevar cada entrenamiento al siguiente nivel.

Tu coach te arma las rutinas y el plan de nutrición; vos las seguís, registrás y ves tu progreso en tiempo real.

ENTRENAMIENTOS
• Rutinas personalizadas asignadas por tu coach
• Registrá series, kilos y repeticiones con un toque
• Cronómetro de descanso integrado (grande, minimizable)
• Superseries y biseries
• Videos de técnica de cada ejercicio
• Editá o deshacé una serie sobre la marcha

NUTRICIÓN
• Plan de comidas armado por tu coach
• Registrá lo que comés y seguí tus macros del día
• Historial de nutrición y tendencias de calorías y proteína
• Seguimiento de agua diario

PROGRESO
• Fotos de progreso (frente, perfil y espalda) con comparación lado a lado
• Historial completo de entrenamientos realizados
• Récords personales (PRs) y evolución de kilos por ejercicio
• Racha de constancia para mantenerte motivado

TU COACH, SIEMPRE CERCA
• Tu entrenador ve tu progreso y te deja feedback
• Comunicación directa dentro de la app

Elevate es la herramienta para quienes entrenan en serio con un profesional detrás. Descargala y llevá tu entrenamiento a otro nivel.
```

## Keywords (máx. 100 caracteres, separadas por coma, sin espacios)
```
entrenamiento,gimnasio,fitness,rutinas,coach,nutricion,pesas,progreso,gym,ejercicio,workout,macros
```
*(≈98 caracteres — no repitas palabras del nombre/subtítulo; Apple ya indexa "Elevate")*

---

## Notas para el revisor (App Review Information)

```
Elevate es una app de coach→atleta. El acceso es solo para alumnos invitados por un
entrenador, así que usá la siguiente cuenta demo para revisar todas las funciones:

  Usuario: camiloruperto84+alumno@gmail.com
  Contraseña: <PONER_CONTRASEÑA_DEMO_ACÁ>

Esta cuenta tiene rutinas, plan de nutrición y datos de progreso cargados para probar
el flujo completo: iniciar un entrenamiento, registrar series, seguir la nutrición,
subir fotos de progreso y ver el historial.

El login es solo email + contraseña (no usamos servicios de terceros ni Sign in with
Apple). La función "Eliminar mi cuenta" está en Perfil > Configuración y borra todos
los datos personales del usuario.
```

> ⚠️ **Pendiente tuyo:** fijar/confirmar la contraseña de la cuenta demo de Camilo en Supabase
> y ponerla en las notas. El revisor DEBE poder entrar o rechaza por Guideline 2.1.

**App Review — Contact info:** tu nombre, teléfono y email (`appelevate343@gmail.com`).
**Sign-in required:** Sí → marcá "Yes" y cargá el usuario/contraseña demo también en el
campo estructurado de credenciales (además de las notas).

---

## Capturas de pantalla (requeridas)

Apple exige, como mínimo, el set de **iPhone 6.9"/6.7"** (iPhone 15/16 Pro Max, 1290×2796 o 1320×2868).
Con ese set suele alcanzar; el de 6.5" es opcional/heredado. **iPad NO es obligatorio** salvo que
marques la app como compatible con iPad.

- Mínimo 3, hasta 10. Recomendado: 5–6.
- Orden sugerido (lo más fuerte primero):
  1. Entrenamiento en curso (registro de series + cronómetro)
  2. Home / rutina del día
  3. Nutrición (plan + macros del día)
  4. Progreso (racha + PRs + gráfico de kilos)
  5. Fotos de progreso (comparación)
  6. Chat/feedback del coach

Ver `docs/app-store-screenshots.md` (si se genera) para cómo capturarlas.

---

## Privacidad de la app (App Privacy — "Nutrition Label")

Declarar en App Store Connect > Privacidad de la app. Elevate recolecta:
- **Datos de contacto:** email (para login/identificar al alumno) → vinculado al usuario.
- **Datos de salud y forma física:** entrenamientos, peso, medidas, fotos de progreso, nutrición → vinculado al usuario.
- **Identificadores:** token de dispositivo para notificaciones push → vinculado al usuario.
- **Uso:** ninguno para tracking/publicidad. **No** se comparte con terceros para ads.
- Marcá "No usás datos para rastrear al usuario" (no hay ad tracking / IDFA).

---

## Checklist de envío
- [ ] Poner `APP_STORE_APP_ID` numérico en `codemagic.yaml`
- [ ] Confirmar contraseña de la cuenta demo (Camilo) y ponerla en las notas del revisor
- [ ] Subir build vía Codemagic → aparece en TestFlight → seleccionarlo en la versión 1.0
- [ ] Cargar capturas 6.9"/6.7"
- [ ] Completar App Privacy (nutrition label)
- [ ] Completar clasificación por edad (4+)
- [ ] Pegar descripción, keywords, subtítulo, promo text, URLs
- [ ] APNs Key (.p8) subida en App Store Connect para que lleguen las push (si querés push en v1)
- [ ] Enviar a revisión
