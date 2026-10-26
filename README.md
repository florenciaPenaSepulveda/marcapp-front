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

- **Trabajador:** registro de cuenta, ingreso, marcaje de entrada y salida con geolocalización, resumen semanal con navegación entre semanas, edición de su perfil y cierre de sesión.
- **Administrador:** búsqueda de trabajadores, revisión y corrección de marcajes, aviso de entradas sin salida, creación de marcajes y gráficos de horas por semana y por año, con comparación entre varios trabajadores.

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
- Si el servidor responde 401 con una sesión activa, la app cierra la sesión y vuelve al ingreso; al reabrir la app se restaura la sesión y se valida contra el servidor.
- Los formularios validan en el cliente con las mismas reglas que el servidor (correo, nombres, contraseña de 8 a 72 caracteres con letra y número, fecha de nacimiento y fecha y hora de los marcajes).
- Solo se pide la ubicación en primer plano, en el momento de marcar; ya no se solicita el permiso de ubicación en segundo plano.
- No se versiona ningún `.env`.

## Pruebas

```bash
npm test
npm run test:cov
npm run typecheck
```

Hay 80 pruebas sobre validaciones, manejo de errores, servicios HTTP, almacenamiento y sesión, y las pantallas de ingreso e inicio, con cerca de 98 % de cobertura sobre ese código. El CI revisa tipos, ejecuta las pruebas, comprueba las versiones con `expo-doctor` y empaqueta la versión web.

## Dependencias

La app usa Expo SDK 51. `npm audit` reporta advertencias en las herramientas de construcción de Expo y React Native (CLI, `tar`, `xmldom`, `postcss`) y en `lodash.pick`, una dependencia de `native-base`, que ya no se mantiene. Ninguna afecta a los datos que maneja la app; resolverlas exige migrar de SDK y reemplazar `native-base` y `react-native-svg-charts`, un trabajo que queda como mejora futura.

## Autoría

Proyecto desarrollado en equipo durante la carrera. Esta copia forma parte del portafolio de [Florencia Peña Sepúlveda](https://github.com/florenciaPenaSepulveda), que la revisó, corrigió y documentó.
