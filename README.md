# Marcapp · Front

[![CI](https://github.com/florenciaPenaSepulveda/marcapp-front/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/florenciaPenaSepulveda/marcapp-front/actions/workflows/ci.yml)

Aplicación móvil de **Marcapp**, un sistema de control de asistencia para empresas: los trabajadores registran su entrada y salida con su ubicación y revisan su resumen semanal; los administradores buscan trabajadores, corrigen marcajes y consultan estadísticas de horas. Hecha con Expo y React Native; también corre en el navegador.

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

Hay 140 pruebas sobre validaciones, cálculo de horarios, manejo de errores, servicios HTTP, el hook de trabajadores, almacenamiento y sesión, los componentes de interfaz y las pantallas de ingreso, inicio, trabajadores y cambio de contraseña, con cerca de 98 % de cobertura sobre ese código. El CI revisa tipos, ejecuta las pruebas, comprueba las versiones con `expo-doctor` y empaqueta la versión web.

## Dependencias

La app usa Expo SDK 51. `npm audit` reporta advertencias solo en las herramientas de construcción de Expo y React Native (CLI, `tar`, `xmldom`, `postcss`) y en React Navigation 6. Ninguna afecta a los datos que maneja la app; resolverlas exige migrar de SDK, un trabajo que queda como mejora futura. La interfaz ya no depende de `native-base`, `react-native-elements` ni `react-native-svg-charts`, que no se mantienen.

## Autoría

Proyecto desarrollado en equipo durante la carrera. Esta copia forma parte del portafolio de [Florencia Peña Sepúlveda](https://github.com/florenciaPenaSepulveda), que la revisó, corrigió y documentó.
