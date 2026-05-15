# Codemagic Setup — Elevate iOS

Guía paso a paso para conectar Codemagic con tu repo y dejar el pipeline corriendo. Todo desde el navegador, sin Mac.

## Prerequisitos

- ✅ Apple Developer Program pagado
- ✅ App ID `com.elevateap.mobile` creado (paso 1.1 de [IOS_LAUNCH_CHECKLIST.md](IOS_LAUNCH_CHECKLIST.md))
- ✅ App creada en App Store Connect (paso 2.1)
- ✅ Carpeta `ios/` commiteada al repo (la hacemos en este sprint)

---

## 1. Crear cuenta en Codemagic

1. Ir a <https://codemagic.io/signup>
2. Login con **GitHub** (más rápido — autoriza acceso a tus repos)
3. Una vez adentro: **Add application** → seleccionar `LucasEzequielSilva/mobileelevate`
4. Elegir **Capacitor (iOS)** como tipo de proyecto
5. Codemagic va a detectar el `codemagic.yaml` automáticamente

---

## 2. Generar App Store Connect API Key

Esto le permite a Codemagic firmar y subir builds a TestFlight automáticamente.

1. En <https://appstoreconnect.apple.com> → **Users and Access** (arriba)
2. Tab **Integrations** → sección **App Store Connect API**
3. Si es tu primer key, vas a tener que aceptar los términos
4. Click **Generate API Key** (botón `+`)
5. Llenar:
   - **Name**: `Codemagic CI`
   - **Access**: `App Manager`
6. Generate → **Descargar el archivo `.p8`** (solo se descarga UNA vez)
7. Anotar también:
   - **Issuer ID** (arriba de la lista de keys)
   - **Key ID** (de la key recién creada)

---

## 3. Conectar la API Key con Codemagic

1. En Codemagic → click en tu avatar (arriba derecha) → **Teams**
2. Seleccionar tu Personal Account (o crear team)
3. Tab **Integrations** → fila **Developer Portal** → **Connect**
4. Cargar:
   - **App Store Connect API Key Name**: `codemagic` (tiene que matchear el `auth: integration` del yaml)
   - **Issuer ID**: del paso 2.7
   - **Key ID**: del paso 2.7
   - **API Key file (.p8)**: subir el archivo
5. Save

> Tip: el nombre `codemagic` debe matchear con `integrations: app_store_connect: codemagic` en `codemagic.yaml`. Si lo cambiás, cambiá el yaml.

---

## 4. Crear grupo de TestFlight "Internal Testers"

El `codemagic.yaml` está configurado para subir automáticamente builds al grupo de testers `Internal Testers`. Hay que crearlo:

1. App Store Connect → tu app → tab **TestFlight**
2. Sección **Internal Testing** → click `+` para crear grupo
3. Nombre: `Internal Testers` (debe matchear el yaml exactamente)
4. Agregar a vos mismo como tester (necesitás invitación al Apple Developer Team primero)

---

## 5. Configurar variables del workflow

Editar [codemagic.yaml](../codemagic.yaml) y reemplazar:

```yaml
APP_STORE_APP_ID: 0000000000
```

Con tu **Apple ID** real de la app. Se encuentra en:

- App Store Connect → My Apps → Elevate → **App Information** → debajo de "General Information" hay un campo **Apple ID** con un número de ~10 dígitos.

Commiteás ese cambio y el pipeline ya va a usar el ID correcto para el auto-increment de build number.

---

## 6. Probar el primer build

Una vez todo configurado:

1. Hacer push a `main` (o trigger manual desde Codemagic dashboard → **Start new build**)
2. Codemagic va a:
   - Clonar el repo
   - Correr `npm ci` y `npm run build`
   - Sincronizar Capacitor iOS
   - Generar certificados y provisioning profiles automáticamente
   - Buildear el IPA
   - Subir a TestFlight
   - Mandarte email cuando termine

**Tiempo estimado del primer build:** 12-18 minutos. Los siguientes van a ser más rápidos por caching (~6-10 min).

---

## Troubleshooting típico del primer build

### "No matching profiles found"
Verificar que el App ID `com.elevateap.mobile` exista en developer.apple.com **con Push capability marcado**.

### "Provisioning profile doesn't include the currently selected device"
Para builds de App Store distribution esto no aplica. Para development distribution, hay que registrar el UDID del iPhone en developer.apple.com → Devices.

### "Code signing error: no signing identity"
La App Store Connect API Key del paso 3 no se conectó bien. Re-verificar el .p8 y los IDs.

### "Build failed: workspace not found"
La carpeta `ios/` no está commiteada al repo. Verificar con `git ls-tree -r HEAD --name-only | grep ios/App`.

### Builds de macOS gratis se acabaron
Free tier de Codemagic: **500 minutos/mes**. Cada build de iOS consume ~12-18 min, así que te alcanza para ~30 builds/mes. Si te pasás, plan paid USD 95/mes para minutos ilimitados.

---

## Workflows disponibles en este repo

| Workflow | Trigger | Qué hace |
|---|---|---|
| `ios-capacitor-workflow` | Push a `main` | Build + sign + upload a TestFlight Internal Testers |
| `ios-test-build` | Pull request abierto | Build verificación (no firma para App Store) |
