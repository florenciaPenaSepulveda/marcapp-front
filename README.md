# Marcapp · Front

[![CI](https://github.com/florenciaPenaSepulveda/marcapp-front/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/florenciaPenaSepulveda/marcapp-front/actions/workflows/ci.yml)

Aplicación móvil de **Marcapp**, un sistema de control de asistencia para empresas: los trabajadores registran su entrada y salida con su ubicación y revisan su resumen semanal; los administradores buscan trabajadores, corrigen marcajes y consultan estadísticas de horas. Hecha con Expo y React Native; también corre en el navegador.

## Inicio rápido

```
cp .env.example .env     # URL de los dos microservicios
npm ci
npm run web
```

Requiere los dos microservicios en ejecución. Pruebas: 238 con 98 % de cobertura (`npm run test:cov`).

## Repositorios del proyecto

| Repositorio | Descripción |
|---|---|
| [marcapp-login-ms](https://github.com/florenciaPenaSepulveda/marcapp-login-ms) | Usuarios, registro, ingreso y roles (necesario para usar la app) |
| [marcapp-marcaje-ms](https://github.com/florenciaPenaSepulveda/marcapp-marcaje-ms) | Marcajes y estadísticas de horas (necesario para usar la app) |
| **marcapp-front** (este) | Aplicación móvil |

## Qué incluye

- **Trabajador:** registro de cuenta con requisitos de contraseña en vivo, ingreso, marcaje de entrada y salida con geolocalización y reloj en vivo, resumen semanal con horas por día y total, resumen de las horas del mes en el inicio, edición de su perfil, cambio de contraseña y cierre de sesión.
- **Administrador:** panorama de hoy en el inicio (quién está trabajando, quién terminó y quién no ha marcado); lista de todos los trabajadores con su estado de hoy, búsqueda en vivo y carga por páginas; al tocar un trabajador se abre su detalle con el resumen del mes y los marcajes de la semana, que puede corregir, agregar o eliminar, y la opción de eliminar al trabajador con confirmación; y estadísticas de horas por semana y por año, con comparación entre varios trabajadores.

La interfaz usa un sistema de diseño propio (`src/theme.ts` y `src/components/ui.tsx`): tarjetas, botones, campos con validación y accesibilidad, avisos, paneles inferiores y un gráfico de barras sin librerías externas. Todas las pantallas internas tienen encabezado con flecha para volver.

## Funcionamiento sin conexión

El trabajador puede abrir la app, navegar y marcar entrada y salida aunque no tenga señal; los registros se guardan en el teléfono y se envían solos cuando vuelve la conexión.

- **Apertura:** con una sesión guardada la app abre directamente en el inicio, sin esperar al servidor, y actualiza el perfil en segundo plano. El ingreso (la primera vez) sí requiere conexión.
- **Marcaje:** la app intenta enviarlo al servidor. Si no hay red, la solicitud falla por falta de señal o hay marcajes anteriores esperando, lo guarda en una cola local (`pending-registrations-storage`) con la hora del dispositivo, la ubicación y un identificador único. El botón sigue alternando entre entrada y salida según lo guardado, y el aviso indica que el registro quedó en el teléfono.
- **Orden:** mientras haya registros en la cola, los nuevos también se encolan, de modo que siempre se envían en el orden en que se hicieron.
- **Envío:** se sincroniza al volver la conexión, al volver a abrir la app, cada 30 segundos mientras haya pendientes y con el botón "Send now". Como cada registro lleva su identificador, un reintento tras una respuesta perdida no lo duplica.
- **Rechazos:** si el servidor rechaza un registro por una regla de negocio (por ejemplo, el día ya estaba completo), deja de reintentarse y se muestra un aviso con el motivo, que se puede descartar. Los fallos de red, 429 y 5xx se reintentan; si la sesión venció, la cola se conserva y se envía tras volver a ingresar.
- **Resumen semanal:** muestra los registros pendientes junto con los del servidor, señalados como "Waiting to be sent", y los suma al total.
- **Administrador:** los marcajes hechos sin conexión se muestran con la insignia "Recorded offline".

La hora del dispositivo se puede manipular, por eso el servidor la acota (no puede ser futura ni tener más de 72 horas) y señala esos registros; ver el README de `marcapp-marcaje-ms`.

## Requisitos

- Node.js 24 (ver `.nvmrc`).
- Los dos microservicios en ejecución (ver sus README).
- Expo Go en el teléfono, o un emulador, o el navegador.

## Puesta en marcha

```bash
cp .env.example .env
npm ci
npm start
```

Edita `.env` con las URL de los servicios. En un teléfono físico usa la IP del computador (por ejemplo `http://192.168.1.50:3001`); en el emulador de Android, `http://10.0.2.2:3001`.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_MS_USER_URL` | URL del servicio de usuarios (`marcapp-login-ms`) |
| `EXPO_PUBLIC_MS_TIMEREGISTRATION_URL` | URL del servicio de marcajes (`marcapp-marcaje-ms`) |

Para abrirla en el navegador: `npm run web`. El primer administrador se crea en el servicio de usuarios con `npm run seed:admin`.

## Seguridad

- El token de sesión se guarda cifrado en el teléfono con `expo-secure-store` (Keychain en iOS, Keystore en Android) y viaja siempre en la cabecera `Authorization`, nunca en el cuerpo de las peticiones ni en los registros.
- Si el servidor responde 401 con una sesión activa, la app cierra la sesión y vuelve al ingreso (por ejemplo, cuando la sesión fue revocada); al cambiar la contraseña el servidor emite un token nuevo y la app lo guarda para no perder la sesión; al reabrir la app se restaura la sesión y se valida contra el servidor.
- Los formularios validan en el cliente con las mismas reglas que el servidor (correo, nombres, contraseña de 8 a 72 caracteres con letra y número, fecha de nacimiento y fecha y hora de los marcajes).
- Solo se pide la ubicación en primer plano, en el momento de marcar; ya no se solicita el permiso de ubicación en segundo plano.
- No se versiona ningún `.env`.

## Pruebas

```bash
npm test
npm run test:cov
npm run typecheck
```

Hay 238 pruebas sobre validaciones, cálculo de horarios, manejo de errores, servicios HTTP, el hook de trabajadores, la cola sin conexión y su sincronización, almacenamiento y sesión, los componentes de interfaz y las pantallas de ingreso, carga, inicio, marcaje, resumen semanal, trabajadores y cambio de contraseña, con cerca de 98 % de cobertura sobre ese código. El CI revisa tipos, ejecuta las pruebas, comprueba las versiones con `expo-doctor` y empaqueta la versión web.

## Dependencias

La app usa Expo SDK 51. `npm audit` reporta advertencias solo en las herramientas de construcción de Expo y React Native (CLI, `tar`, `xmldom`, `postcss`) y en React Navigation 6. Ninguna afecta a los datos que maneja la app; resolverlas exige migrar de SDK, un trabajo que queda como mejora futura. La interfaz ya no depende de `native-base`, `react-native-elements` ni `react-native-svg-charts`, que no se mantienen.

## Autoría

Proyecto desarrollado en equipo durante la carrera. Esta copia forma parte del portafolio de [Florencia Peña Sepúlveda](https://github.com/florenciaPenaSepulveda), que la revisó, corrigió y documentó.
