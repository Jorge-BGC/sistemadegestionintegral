# Sistema de Gestión Integral — Documentación técnica

> Documento de referencia para desarrollo, operación y auditoría.
> Se actualiza con cada cambio del sistema (ver [Historial de cambios](#16-historial-de-cambios)).
>
> **Última actualización:** 2026-11-19

## Contenido

1. [Propósito y alcance](#1-propósito-y-alcance)
2. [Módulos del sistema](#2-módulos-del-sistema)
3. [Tecnologías utilizadas](#3-tecnologías-utilizadas)
4. [Arquitectura](#4-arquitectura)
5. [Estructura de carpetas](#5-estructura-de-carpetas)
6. [Navegación](#6-navegación)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Reglas de cálculo y colores](#8-reglas-de-cálculo-y-colores)
9. [Seguridad y control de acceso](#9-seguridad-y-control-de-acceso)
10. [Flujo de borrador y publicación](#10-flujo-de-borrador-y-publicación)
11. [Migraciones de base de datos](#11-migraciones-de-base-de-datos)
12. [Datos de prueba](#12-datos-de-prueba)
13. [Configuración, despliegue y operación](#13-configuración-despliegue-y-operación)
14. [Procedimientos frecuentes](#14-procedimientos-frecuentes)
15. [Verificación y control de calidad](#15-verificación-y-control-de-calidad)
16. [Historial de cambios](#16-historial-de-cambios)
17. [Observaciones y pendientes](#17-observaciones-y-pendientes)

---

## 1. Propósito y alcance

Aplicación web para administrar las matrices del Sistema de Gestión Integral (SGI) de la planta:

- **Matriz de Riesgos** por proceso.
- **Evaluación de Oportunidades.**
- **Matriz de Aspectos e Impactos Ambientales** por área.

Cada módulo tiene una **tabla editable** (para editores autorizados) y un panel de **Información Visual** con indicadores y gráficas.

**Quién la usa:**

| Perfil | Qué puede hacer | Cómo entra |
|---|---|---|
| Visitante (consulta) | Ver tablas y paneles con la información **publicada**. No puede crear, editar ni borrar. | Abre la dirección del sitio. No hay inicio de sesión. |
| Editor autorizado | Crear, editar y borrar registros en un **borrador**; publicar los cambios para que los vean los visitantes. | Abre `sitio/#editar` e inicia sesión con correo y contraseña. |

---

## 2. Módulos del sistema

### 2.1 Matriz de Riesgos

Una matriz por proceso. Todas comparten la misma estructura; cambia el proceso (fijo) y el catálogo de actividades.

| Botón | Proceso (en `procesos_riesgos`) | Catálogo de actividades |
|---|---|---|
| Manufactura EPS | Manufactura EPS | `actividad_riesgos_meps` |
| Entrega de Producto al Cliente | Entrega de Producto al Cliente | `actividad_riesgos_epc` |
| Desarrollo Tecnológico | Desarrollo Tecnológico | `actividad_riesgos_dt` |
| Programación de la Cadena | Programación de la Cadena | `actividad_riesgos_pc` |
| Comercialización EPS | Comercialización EPS | `actividad_riesgos_ceps` |
| Generación de Valor Clientes | Generación de Valor Clientes | `actividad_riesgo_gvc` |
| TI | TI | `actividad_riesgos_ti` |
| Admon Proyectos | Admon Proyectos | `actividad_riesgo_ap` |
| Mantenimiento | Mantenimiento | `actividad_riesgos_m` |
| Cadena de Suministro | **Cadena Suministro** (sin "de") | `actividad_riesgos_cs` |
| Capital Humano | Capital Humano | `actividad_riesgos_ch` |
| Administración Financiera | Administración Financiera | `actividad_riesgos_af` |
| MASH | MASH | `actividad_riesgos_mash` |
| Gestión de Calidad | Gestión de Calidad | `actividad_riesgos_gc` |
| Sustentabilidad & ESG | Sustentabilidad & ESG | `actividad_riesgos_sesg` |

Configuración en `src/config/matricesRiesgos.ts`.

**Columnas del dashboard**, en orden:

| Grupo | Columnas |
|---|---|
| Evento | N., Proceso, Fecha de incorporación, Tipo de riesgo |
| Identificación de riesgos | Fuente / Actividad, Evento / Riesgo, Causa, Consecuencia / Impacto, Control |
| Análisis de riesgo | S (severidad), P (probabilidad) |
| Valoración de riesgo | Nivel de riesgo (calculado) |
| Tratamiento de Riesgo | Folio (acciones), Efectividad en el Periodo |

**Comportamiento de los campos:**

- **Proceso:** se llena solo con el proceso de la matriz y no se puede cambiar.
- **Fecha de incorporación:** muestra "NA" hasta que se elige una fecha.
- **Campos con sugerencias del catálogo** (se pueden escribir libremente): Fuente/Actividad, Causa y Consecuencia.
- **Control:** se escribe separando con comas y se muestra como lista.
- **S y P:** tienen un botón "i" que abre la tabla de niveles con su descripción.
- **Efectividad en el Periodo:** Efectivo / No Efectivo / En Proceso.

### 2.2 Evaluación de Oportunidades

Una sola tabla (`oportunidades`). El menú tiene **Tabla** e **Información Visual**.

**Columnas:**

- N.
- Enfoque (catálogo `tipo`).
- Proceso (sugerencias de `procesos_eo`).
- Fecha de Incorporación.
- Antecedentes.
- Origen (sugerencias de `origen_eo`).
- Riesgo y/o Aspecto Relacionado.
- ¿Cuál es la Oportunidad?
- Impacto Positivo Esperado (beneficios, separados por comas).
- I (impacto) y T (tiempo), con botón "i".
- Clasificación (calculada).
- Nivel de viabilidad (calculado).
- Folio asignado ("NA" si aún no se toma).
- Vigencia de OP.

Configuración en `src/config/oportunidades.tsx`.

### 2.3 Matriz de Aspectos e Impactos Ambientales

Una matriz por área. Todas comparten la tabla `aspectos_ambientales`; la columna `area` separa los registros de cada una. El menú tiene un botón por área y, debajo de una línea separadora, **Información Visual**.

| Botón (clave `area`) | Columna Proceso | Actividades | Riesgos relacionables (matriz) |
|---|---|---|---|
| Manufactura de EPS (`meps`) | Lista `procesos_aia_meps` | `actividad_aia_meps` | Manufactura EPS |
| Gestión de Capital Humano (`gch`) | Lista `procesos_aia_gch` | `actividad_aia_gch` | Capital Humano |
| Gestión de Calidad (`gc`) | Fijo: "Gestión de Calidad" | `actividad_aia_gc` | Gestión de Calidad |
| Entrega de Producto al Cliente (`epc`) | Lista `procesos_aia_epc` | `actividad_aia_epc` | Entrega de Producto al Cliente |
| Programación de la Cadena Productiva (`pcp`) | Interruptor Altamira / CDMX | `actividad_aia_pcp` | Programación de la Cadena |
| Comercialización de EPS (`ceps`) | Fijo: "Comercialización de Poliestireno expandible (CDMX)" | `actividad_aia_ceps` | Comercialización EPS |
| Administración Financiera (`af`) | Interruptor Altamira / CDMX | `actividad_aia_af` | Administración Financiera |
| MASH (`mash`) | Lista `procesos_aia_mash` | `actividad_aia_mash` | MASH |
| Desarrollo Tecnológico (`dt`) | Lista `procesos_aia_dt` | `actividad_aia_dt` | Desarrollo Tecnológico |
| Admon Proyectos (`ap`) | Fijo: "Proyectos (Altamira)" | `actividad_aia_ap` | Admon Proyectos |
| Cadena de Suministro (`cs`) | Lista `procesos_aia_cs` | `actividad_aia_cs` | Cadena Suministro |
| Mantenimiento (`m`) | Fijo: "Mantenimiento" | `actividad_aia_m` | Mantenimiento |
| TI (`ti`) | Interruptor Altamira / CDMX | `actividad_aia_ti` | TI |
| Sustentabilidad & ESG (`sesg`) | Fijo: "Sustentabilidad & ESG (CDMX)" | `actividad_aia_sesg` | Sustentabilidad & ESG |
| Generación de Valor a Clientes (`gvc`) | Interruptor Altamira / CDMX | `actividad_aia_gvc` | Generación de Valor Clientes |

Configuración en `src/config/aspectos.tsx`. La columna Proceso se llena de tres formas posibles:

- **`tabla`**: lista desplegable de una tabla de procesos.
- **`fijo`**: ya viene puesto y no se cambia.
- **`opciones`**: interruptor entre pocos valores; el primero viene elegido.

**Columnas del dashboard:**

| Grupo | Columnas |
|---|---|
| Identificación | N., Proceso, Actividad/Evento, Estado del proceso (normal/anormal/emergencia), Aspecto ambiental (causa), ¿Real o potencial?, Impacto ambiental (consecuencia), Tipo de impacto (benéfico/adverso) |
| Análisis | F (frecuencia), S (severidad), Significancia (calculada) |
| Tratamiento | Controles operacionales (lista por comas), Folio (NA por defecto), Efectividad |

**Reglas de llenado:**

- **Actividad/Evento** no se escribe a mano. El botón de lista abre un modal con dos selectores:
  1. Actividad principal, sin repetidos.
  2. Subactividad, solo las de esa principal.
  - Con ambos elegidos aparece **"Relacionar riesgo"** (opcional), que ofrece solo los riesgos de la matriz de riesgos del área.
  - En la tabla se muestra **Principal**: sub. Si hay riesgo relacionado, un botón "i" abre "Se relaciona con este riesgo" con su número y nombre.
- **Aspecto ambiental:** se elige de `aspecto_aia`, agrupado en Adversos y Benéficos.
  - El **Tipo de impacto se llena solo** con el tipo del aspecto elegido.
  - **Impacto ambiental** solo ofrece impactos de ese mismo tipo y queda deshabilitado mientras no haya aspecto.
  - Si se cambia a un aspecto de otro tipo, el impacto incompatible se limpia.

### 2.4 Paneles de Información Visual

| Panel | Componente | Filtro | Contenido |
|---|---|---|---|
| Matriz de Riesgos | `InformacionRiesgos` | Proceso | Indicadores (registrados, requieren atención = Extremo+Alto, controles efectivos, sin evaluar); mapa de calor S×P; distribución por nivel; riesgos por proceso; efectividad de controles; 8 riesgos prioritarios. |
| Aspectos Ambientales | `InformacionAspectos` | Área | Indicadores (registrados, significativos = Crítico+Alto, benéficos vs adversos, relacionados con un riesgo); mapa de calor S×F; distribución por significancia; aspectos por área; perfil (tipo de impacto, estado del proceso, efectividad); aspectos más frecuentes; 8 más significativos. |
| Oportunidades | `InformacionOportunidades` | Enfoque | Indicadores (registradas y beneficios, conviene abordar = Prioritaria+Destacada, tomadas = con folio, vigencia por atender); matriz Impacto×Tiempo; nivel de viabilidad; viabilidad por enfoque; por origen; seguimiento (folio y vigencia); 8 oportunidades por abordar. |

**Reglas comunes:**

- **Qué datos muestran:** el visitante ve lo **publicado**; el editor ve su **borrador**, y el panel lo indica con una etiqueta.
- **Filtrar con clic:** al hacer clic en el nombre de un proceso, área o enfoque en las barras apiladas, todo el panel se filtra por ese valor.
- **Colores de nivel:** las gráficas usan los colores oficiales de cada matriz (sección 8).
- **Colores de estado:** efectividad, vigencia y tipo de impacto usan colores validados para daltonismo y siempre van con su etiqueta y su cifra; el color nunca es la única pista.
- **Carga:** cada panel se descarga solo cuando alguien lo abre (carga diferida con `React.lazy`).
- **"Por vencer" en Oportunidades:** cuenta las que vencen en 30 días o menos (`DIAS_AVISO` en `src/utils/resumenOportunidades.ts`).

---

## 3. Tecnologías utilizadas

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| **React** | ^19.2.8 | Interfaz de usuario por componentes. |
| **React DOM** | ^19.2.8 | Dibuja los componentes en el navegador. |
| **TypeScript** | ~6.0.2 | Tipado estático del código. Configuración estricta (`noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). |
| **Vite** | ^8.2.2 | Servidor de desarrollo y empaquetado para producción. |
| **@vitejs/plugin-react** | ^6.1.0 | Soporte de React/JSX en Vite. |
| **Supabase** (`@supabase/supabase-js`) | ^2.118.0 | Base de datos PostgreSQL alojada, API REST automática (PostgREST), autenticación de usuarios y control de acceso por filas (RLS). |
| **PostgreSQL** (vía Supabase) | Versión del proyecto Supabase | Almacenamiento de catálogos y registros; funciones `es_editor`, `publicar_cambios`, `hay_cambios_sin_publicar`. |
| **Oxlint** | ^1.79.0 | Revisión estática del código (reglas de React, TypeScript y Oxc; `.oxlintrc.json`). |
| **@types/node, @types/react, @types/react-dom** | ^24 / ^19 | Definiciones de tipos para TypeScript. |
| **Node.js** | 26.x (instalado en `%LOCALAPPDATA%\Programs\nodejs`) | Ejecutar npm, Vite y scripts. |
| **Git / GitHub** | — | Control de versiones. Remoto: `sistemadegestionintegral` → `github.com/Jorge-BGC/sistemadegestionintegral`. |
| **Vercel** | — | Hospedaje del sitio publicado. |
| **Microsoft Edge (headless)** | — | Solo para pruebas: abrir la app sin ventana, tomar capturas y verificar comportamiento. No forma parte de la app. |

**Sin dependencias adicionales.** No se usan librerías de gráficas, de componentes ni de estilos: las gráficas son HTML/CSS propios, y los estilos son CSS por componente con variables de tema. Así se reduce la superficie de dependencias de terceros.

---

## 4. Arquitectura

### 4.1 Principios

- **Un componente por carpeta**, con su `.tsx` y su `.css` propio (`src/components/<Nombre>/<Nombre>.tsx|css`). `App.tsx` solo compone pantallas.
- **Capas separadas:**

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Presentación | `components/` | Componentes visuales sin acceso directo a datos (salvo los paneles, que piden datos a `services/`). |
| Configuración | `config/` | Qué columnas tiene cada dashboard, cómo se ve y edita cada una, y qué áreas/procesos existen. |
| Estado | `hooks/` | Lógica de estado reutilizable: registros, sesión, publicación. |
| Acceso a datos | `services/` | Todas las llamadas a Supabase. |
| Tipos | `types/` | Tipos de TypeScript compartidos. |
| Utilidades | `utils/` | Funciones puras: cálculos de nivel, conversiones de formulario, resúmenes para gráficas, fechas. |

### 4.2 Módulo genérico de registros

Los tres tipos de dashboard (riesgos, oportunidades, aspectos) usan los **mismos componentes** (`PanelRegistros`, `TablaRegistros`, `FilaRegistro`, `FilaEdicion`) y el **mismo hook** (`useRegistros`). Cada uno se describe con un objeto `Modulo<R, I, B, C>` (`src/types/registros.ts`):

- `R` registro guardado, `I` datos que se envían a la base, `B` borrador del formulario (todo texto), `C` catálogos.
- Define: nombre, columnas agrupadas, sugerencias, `cargarCatalogos(publicados)`, `listar(publicados)`, `crear`, `actualizar`, `borrar`, `vacio`, `aBorrador`, `aDatos`, `faltantes` (validación) y el texto de confirmación de borrado.
- Cada columna define `ver(registro, catálogos)` y `editar(borrador, cambiar, catálogos)`.
- Los constructores de campos (`texto`, `fecha`, `seleccion`, `escala`) están en `src/config/campos.tsx`.

Las matrices por proceso o área se crean con fábricas: `crearModuloRiesgos(proceso, tablaActividades)` y `crearModuloAspectos(area)`. Agregar una matriz nueva es una entrada de configuración (sección 14).

### 4.3 Acceso a datos

- `src/services/supabase.ts` crea el cliente con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `src/services/registros.ts` — `tablaRegistros(tabla, columnas, filtro)`:
  - `listar(publicados)` lee de `<tabla>` (borrador) o de `<tabla>_publicados`.
  - `filtro` (por ejemplo `{ proceso }` o `{ area }`) se aplica al listar y **se agrega a cada fila nueva**.
- `src/services/catalogos.ts` tiene lectores genéricos:
  - `nombres`: catálogos de una columna.
  - `nombresConTipo`: catálogos con Benéfico/Adverso.
  - `escala`: tablas `valor`/`descripcion`.
  - `matriz`: tabla de dos ejes que devuelve un `Map` con clave `"eje1-eje2"`.
  - `rangos`: tablas "N al M".

### 4.4 Gráficas (Información Visual)

**Componentes genéricos compartidos por los tres paneles:**

| Componente | Qué muestra |
|---|---|
| `PanelVisual` | Esqueleto común: encabezado, filtro, contexto, estados de carga y vacío. |
| `TarjetaIndicador` | Cifra principal de un indicador. |
| `TarjetaGrafica` | Contenedor con título y descripción. |
| `MapaCalor` | Matriz de dos escalas cualquiera. |
| `BarrasNivel` | Una barra por nivel. |
| `NivelesPorGrupo` | Barras apiladas por grupo; con clic opcional para filtrar. |
| `BarraProporcion` | Reparto al 100% con su leyenda. |
| `BarrasConteo` | Ranking de una sola serie. |
| `Leyenda` | Muestras de color con su nombre. |
| `TablaDestacados` | Los registros más relevantes. |

**Cálculos sin React:**

- `src/utils/graficas.ts` tiene lo común: porcentajes, conteo por categoría y segmentos de efectividad.
- `src/utils/resumenRiesgos.ts`, `resumenAspectos.ts` y `resumenOportunidades.ts` tienen lo propio de cada panel.

### 4.5 Interfaz

- **Tema:** variables CSS en `src/index.css`, con tema claro y oscuro automáticos según el sistema operativo (`prefers-color-scheme`).
  - Color principal: verde corporativo `#1e7d43` en claro y `#6cc58a` en oscuro, tomado del logo.
- **Modales:**
  - Usan `<dialog>` nativo montado en `document.body` (`Modal`).
  - Enfocan el elemento marcado con `data-autofocus` o el primer campo.
  - Escape no cancela la fila en edición.
- **Confirmaciones:** son modales propios (`Confirmacion`), nunca `window.confirm`.
  - Las destructivas (borrar) ponen el botón en rojo y el foco en Cancelar.
- **Animaciones:** los botones principales se levantan e iluminan al pasar el cursor. Quien tenga activado "reducir movimiento" en su sistema no ve desplazamientos.
- **Pestaña del navegador:** el ícono es `src/assets/logo.png` (PNG con fondo transparente) y el título es "Sistema de Gestión Integral".

---

## 5. Estructura de carpetas

```
sistemadegestion/
├─ index.html                 Página base (idioma es, ícono, título)
├─ package.json               Dependencias y scripts
├─ vite.config.ts             Configuración de Vite
├─ tsconfig*.json             Configuración de TypeScript
├─ .oxlintrc.json             Reglas de Oxlint
├─ .env                       Variables de Supabase (NO se versiona)
├─ DOCUMENTACION.md           Este documento
├─ supabase/                  Migraciones y datos de prueba (NO se versiona; ver sección 17)
│  ├─ migrations/             Scripts SQL en orden de fecha
│  └─ seed_*_prueba.sql       Datos de prueba
└─ src/
   ├─ main.tsx                Punto de entrada
   ├─ App.tsx                 Navegación entre pantallas y sesión
   ├─ index.css               Tema, colores y estilos globales
   ├─ assets/logo.png         Logo / ícono de pestaña
   ├─ components/             Un componente por carpeta (.tsx + .css)
   ├─ config/                 campos, riesgos, matricesRiesgos, oportunidades, aspectos
   ├─ hooks/                  useRegistros, useSesion, usePublicacion
   ├─ services/               supabase, registros, catalogos, riesgos, oportunidades, aspectos, sesion, publicacion
   ├─ types/                  registros, riesgos, oportunidades, aspectos, graficas
   └─ utils/                  nivel, lista, fecha, borrador*, graficas, resumen*
```

---

## 6. Navegación

```
Sistema de Gestión Integral (portada)
├─ Matriz de Riesgos
│  ├─ 15 botones, uno por proceso → dashboard de esa matriz
│  └─ ── Información Visual
├─ Evaluación de Oportunidades
│  ├─ Tabla → dashboard
│  └─ ── Información Visual
└─ Matriz de Aspectos e Impactos Ambientales
   ├─ 15 botones, uno por área → dashboard de esa área
   └─ ── Información Visual
```

- **Navegación interna:** se hace con el estado de React (`App.tsx`), no con rutas de URL.
- **Botón "atrás":** vuelve al menú anterior y se deshabilita mientras hay una fila en edición.
- **Acceso de editores:** el único fragmento de URL que se usa es `#editar`, que abre el formulario de inicio de sesión.

---

## 7. Modelo de datos

Todas las tablas están en el esquema `public` de Supabase.

### 7.1 Tablas de registros (borrador) y sus copias publicadas

| Borrador (solo editores) | Publicada (lectura pública) | Contenido |
|---|---|---|
| `riesgos` | `riesgos_publicados` | Riesgos de todas las matrices; columna `proceso` distingue la matriz. |
| `oportunidades` | `oportunidades_publicados` | Oportunidades. |
| `aspectos_ambientales` | `aspectos_ambientales_publicados` | Aspectos de todas las áreas; columna `area` distingue el área. |

- **Estructura de la copia:** cada tabla publicada tiene la misma estructura que su borrador (`create table … (like … including defaults including constraints including indexes)`), sin identidad automática: el `id` se copia tal cual.
- **Cambiar columnas:** si se agrega o cambia una columna en un borrador, hay que hacer lo mismo y en la misma posición en su copia publicada. Si no, la publicación falla (sección 10).

**`riesgos`:**

- `id`, `proceso`, `fecha_incorporacion` (opcional), `tipo_riesgo` (FK a `tipo`).
- `fuente_actividad`, `evento_riesgo`, `causa`, `consecuencia_impacto`, `controles` (arreglo).
- `severidad` y `probabilidad` (1–5).
- `folio`, `efectividad` (Efectivo / No Efectivo / En Proceso, opcional), `created_at`.

**`oportunidades`:**

- `id`, `enfoque` (FK a `tipo`), `proceso`, `fecha_incorporacion`.
- `antecedentes`, `origen`, `riesgo_aspecto`, `oportunidad`, `beneficios` (arreglo).
- `impacto` y `tiempo` (1–5).
- `folio` (por defecto 'NA'), `vigencia` (opcional), `created_at`.

**`aspectos_ambientales`:**

- `id`, `proceso`, `actividad_principal`, `actividad_sub`.
- `estado_proceso` (Normal / Anormal / Emergencia).
- `aspecto`, `real_potencial`, `impacto`, `tipo_impacto` (Benéfico / Adverso).
- `frecuencia` y `severidad` (1–4), `controles` (arreglo), `folio` (por defecto 'NA'), `efectividad`.
- `created_at`, `riesgo_id` (FK a `riesgos.id`; si se borra el riesgo queda `null`), `area` (clave del área, por defecto `meps`).

### 7.2 Catálogos

| Módulo | Tablas | Uso |
|---|---|---|
| Común | `tipo` | Tipo de riesgo / enfoque: Ambiental, Calidad, Integral. |
| Riesgos | `procesos_riesgos` | Procesos. |
| Riesgos | `actividad_riesgos_*` (15 tablas, columna `nombre`) | Sugerencias de Fuente / Actividad por proceso. |
| Riesgos | `causa_riesgo`, `consecuencia_riesgo` | Sugerencias de Causa y Consecuencia. |
| Riesgos | `severidad_riesgo`, `probabilidad_riesgo` | Escalas S y P (`valor` "N: nombre", `descripcion`). |
| Riesgos | `matriz_riesgo` (severidad, probabilidad, valor) | Valor 1–25 de cada combinación. |
| Riesgos | `evaluacion_riesgos` (rango, descripcion) | Nivel de riesgo por rango. |
| Oportunidades | `procesos_eo`, `origen_eo` | Sugerencias de Proceso y Origen. |
| Oportunidades | `impacto_eo`, `tiempo_eo` | Escalas I y T. |
| Oportunidades | `matriz_eo` (impacto, tiempo, valor) | Clasificación 1–25. |
| Oportunidades | `evaluacion_oportunidades` | Nivel de viabilidad por rango. |
| Aspectos | `procesos_aia_*` (meps, gch, epc, mash, dt, cs) | Procesos de las áreas con lista. |
| Aspectos | `actividad_aia_*` (15 tablas; `principal`, `sub`) | Actividades por área. |
| Aspectos | `aspecto_aia` (nombre, tipo) | Aspectos ambientales clasificados (35 adversos, 11 benéficos). |
| Aspectos | `impacto_aia` (nombre, tipo) | Impactos ambientales clasificados (10 adversos, 8 benéficos). |
| Aspectos | `frecuencia_aia`, `severidad_aia` | Escalas F y S (1–4). |
| Aspectos | `matriz_aia` (frecuencia, severidad, valor) | Valor = F × S. |
| Aspectos | `evaluacion_aia` | Significancia por rango. |
| Seguridad | `editores` (email) | Correos autorizados para editar (sección 9). |

**Convención:** en las escalas, `valor` empieza con el número del nivel (por ejemplo "3: Moderada"). La app extrae ese número para calcular.

---

## 8. Reglas de cálculo y colores

El nivel de cada registro **no se guarda**: se calcula al mostrarlo con `calcularNivel(matriz, rangos, eje1, eje2)` (`src/utils/nivel.ts`). Primero busca el valor de la matriz y luego el rango donde cae. El nombre del nivel es la primera palabra de su descripción ("Crítico-Significativo: …" → `critico`) y define su color.

### 8.1 Riesgos — matriz S × P (valor 1–25; **menor = más grave**)

| Rango | Nivel | Color |
|---|---|---|
| 1 al 8 | Extremo — es necesario establecer acciones | Rojo `#ff0000` |
| 9 al 13 | Alto — es necesario establecer acciones | Naranja `#e36c0a` |
| 14 al 16 | Importante — al menos un control documentado o acciones | Durazno `#fac090` |
| 17 al 20 | Moderado — no es necesario establecer acciones | Amarillo `#ffff00` |
| 21 al 25 | Bajo — no se requieren acciones | Blanco |

### 8.2 Oportunidades — matriz I × T (valor 1–25; **menor = más conveniente**)

```
        T1  T2  T3  T4  T5
  I5    15   8   6   4   1
  I4    16  14   7   5   2
  I3    20  19  13  11   3
  I2    24  22  18  12   9
  I1    25  23  21  17  10
```

| Rango | Viabilidad | Color |
|---|---|---|
| 1 al 8 | Prioritaria | Verde `#00ff00` |
| 9 al 13 | Destacada | Verde claro `#b7f7b7` |
| 14 al 16 | Adecuada | Durazno `#fbdcc8` |
| 17 al 20 | Factible | Amarillo `#ffff00` |
| 21 al 25 | Intrascendente | Blanco |

### 8.3 Aspectos — matriz F × S (valor = F × S, 1–16; **mayor = más significativo**)

| Rango | Significancia | Color |
|---|---|---|
| 1 al 4 | Bajo — No significativo | Blanco |
| 6 al 8 | Medio — No significativo | Amarillo `#ffff00` |
| 9 al 12 | Alto — Significativo | Naranja `#e36c0a` |
| 13 al 16 | Crítico — Significativo | Rojo `#ff0000` |

El valor 5 no puede resultar de F × S, así que el hueco entre 4 y 6 no afecta.

### 8.4 Colores de estado (paneles)

| Uso | Claro | Oscuro |
|---|---|---|
| Bien (Efectivo, Normal, Benéfico, Vigente, Tomada) | `#1f8a52` | `#25945a` |
| En proceso (En Proceso, Anormal, Por vencer) | `#c08a1a` | `#c99320` |
| Mal (No Efectivo, Emergencia, Adverso, Vencida) | `#cf3f2e` | `#e04a3a` |
| Neutro (Sin evaluar, Sin dato, Sin folio) | `#c3c9d1` | `#454d55` |

Los tres colores con tono se validaron con el script de la guía de visualización para tres cosas: separación para daltonismo, separación con visión normal y contraste. Donde quedaron en el límite, se compensa con etiqueta y cifra visibles junto a cada color.

---

## 9. Seguridad y control de acceso

### 9.1 Modelo

| Rol en Supabase | Quién | Permisos |
|---|---|---|
| `anon` | Cualquier visitante (la app usa la clave *publishable*, que es pública por diseño) | **Solo lectura** de catálogos y de tablas `_publicados`. Sin acceso a los borradores. |
| `authenticated` + correo en `editores` | Editor autorizado | Lee y escribe borradores; ejecuta `publicar_cambios()`. |
| `authenticated` sin correo en `editores` | Cuenta existente pero no autorizada | Igual que un visitante. La app la rechaza al iniciar sesión. |

**Control en dos capas:**

- **Base de datos (la protección real):** cada tabla tiene RLS activado. Las políticas de escritura exigen `es_editor()`, así que aunque alguien use la clave pública directamente contra la API, Supabase rechaza cualquier escritura.
- **Interfaz:** sin sesión de editor no se muestran el botón +, la columna Acciones ni la barra de publicación. Ocultarlos es comodidad, no la protección.

### 9.2 Piezas

- **Tabla `editores`:**
  - Guarda el correo en minúsculas.
  - Sin permisos para `anon` ni para `authenticated`: solo la lee la función `es_editor()`.
  - Primer autorizado: `becariogestion.calidad@styropek.com`.
- **Función `es_editor()`:**
  - `security definer` con `search_path` vacío.
  - Devuelve si el correo del token (`auth.jwt() ->> 'email'`) está en `editores`.
- **Políticas:** `crear/editar/borrar <tabla>` para `authenticated` con `(select public.es_editor())`. Lectura del borrador: solo editores. Lectura de publicados: todos.
- **Inicio de sesión:**
  - Con correo y contraseña (`signInWithPassword`) desde el formulario que abre `sitio/#editar`. El fragmento `#` no llega al servidor, así que funciona en cualquier hosting sin configuración.
  - La sesión la guarda Supabase en el navegador.
  - Si la cuenta no está en `editores`, la app cierra la sesión y muestra "Esta cuenta no está autorizada para editar".
- **Registro público:** debe estar **desactivado** en Supabase (Authentication → Sign In / Providers → "Allow new users to sign up"). Así solo existen las cuentas que crea el administrador.

### 9.3 Consideraciones

- **Dirección `#editar`:** solo esconde el acceso; no es una medida de seguridad. La seguridad está en la contraseña y en RLS.
- **Contraseñas:** Supabase exige mínimo 6 caracteres. Se recomienda una contraseña fuerte para cada editor.
- **Archivo `.env`:** contiene la URL y la clave *publishable*. No se versiona, aunque esa clave es visible en el navegador por diseño.
- **Clave `service_role`:** no se usa en la app y nunca debe ponerse en el frontend.

---

## 10. Flujo de borrador y publicación

1. **Edición:** el editor crea, edita o borra en el **borrador**. Los visitantes no ven esos cambios.
2. **Indicador de cambios pendientes:** después de cada guardado o borrado, la app llama a `hay_cambios_sin_publicar()`, que compara borrador y publicado con `EXCEPT` en ambos sentidos.
   - Si hay diferencias, el botón **Publicar Cambios** de la barra superior se activa en verde con un punto parpadeante.
   - Si no las hay, dice "Todo publicado" y queda deshabilitado.
3. **Confirmación:** el botón abre un modal propio de la app.
4. **Publicación:** al aceptar se ejecuta `publicar_cambios()` (`security definer`, verifica `es_editor()`). Para cada tabla de registros, borra el contenido de la publicada y copia el borrador completo: `delete … where true` y luego `insert … select *`.
5. **Alcance:** se publica **todo a la vez**: riesgos, oportunidades y aspectos.

**Requisito estructural:** como la copia usa `select *`, el borrador y su publicada deben tener las mismas columnas en el mismo orden. Las migraciones que cambian columnas aplican el mismo cambio a ambas tablas.

---

## 11. Migraciones de base de datos

- **Ubicación:** `supabase/migrations/`, con nombre `AAAAMMDDhhmmss_descripcion.sql`.
- **Cómo se aplican:** **manualmente, en orden**, en el SQL Editor de Supabase.
- **Se pueden repetir:** casi todas usan `if not exists`, `on conflict do nothing` o bloques `do $$ … $$` condicionales, así que ejecutarlas de nuevo no duplica datos.

| Migración | Propósito |
|---|---|
| `20261021000000_matriz_riesgos` | Esquema inicial: catálogos de riesgos, escalas, matriz, rangos, tabla `riesgos`. |
| `20261106000000_catalogos_causas_consecuencias` | Carga de causas y consecuencias (sin duplicados, comparación normalizada). |
| `20261106010000_procesos_y_fecha_opcional` | Procesos actualizados; fecha de incorporación opcional (NA). |
| `20261106020000_efectividad_riesgos` | Columna `efectividad` en riesgos. |
| `20261109000000_renombrar_tipo_y_procesos_riesgos` | Ajuste de llaves tras renombrar `tipo_riesgo`→`tipo` y `procesos`→`procesos_riesgos`. |
| `20261109010000_evaluacion_oportunidades` | Módulo de oportunidades: catálogos, escalas, matriz, rangos, tabla. |
| `20261109020000_aspectos_impactos_ambientales` | Módulo de aspectos: catálogos, escalas F/S, matriz, rangos, tabla. |
| `20261110000000_renombrar_catalogos` | Renombres: `fuente_actividad`→`actividad_riesgos_gc`, `causa`→`causa_riesgo`, `consecuencia_impacto`→`consecuencia_riesgo`, `severidad`→`severidad_riesgo`, `probabilidad`→`probabilidad_riesgo`, `impacto`→`impacto_eo`, `tiempo`→`tiempo_eo`. |
| `20261110010000` … `20261111090000` | Catálogos `actividad_riesgos_*` de cada proceso; `20261111080000` reemplaza las actividades de Gestión de Calidad. |
| `20261111100000_renombrar_procesos_aia_meps` | `procesos_aia` → `procesos_aia_meps`. |
| `20261112000000_solo_editores` | Tabla `editores`, función `es_editor()`, escritura solo para editores. |
| `20261112010000_publicar_cambios` | Tablas `_publicados`, funciones `publicar_cambios()` y `hay_cambios_sin_publicar()`, lectura de borradores solo para editores. |
| `20261119000000_aspectos_e_impactos_por_tipo` | `aspecto_aia` con tipo; columna `tipo` en `impacto_aia`; reemplazo de la lista de impactos. |
| `20261119010000_corregir_aspecto_remanentes` | Corrección ortográfica de un aspecto. |
| `20261119020000_actividad_y_riesgo_en_aspectos` | `actividad_aia`→`actividad_aia_meps`; columnas `actividad_principal`, `actividad_sub`, `riesgo_id`. |
| `20261119030000_aspectos_gestion_capital_humano` | Área GCH y columna `area` (borrador y publicada); quita la FK de proceso de aspectos. |
| `20261119040000` … `20261119160000` | Catálogos de las demás áreas de aspectos (GC, EPC, PCP, CEPS, AF, MASH, DT, AP, CS, M, TI, SESG, GVC). |

**Convenciones SQL:**

- Los apóstrofos dentro de un texto se escriben dobles (`'KPI''s'`); las comillas dobles se reservan para nombres de columna.
- Los renombres de tablas solo actúan si la tabla vieja existe y la nueva no, y también renombran la llave primaria.
- Las listas grandes de actividades se generaron con un script a partir del texto entregado por el área, con conteo de verificación (principales, subactividades, repetidas).

---

## 12. Datos de prueba

| Archivo | Carga | Cómo se identifica / se borra |
|---|---|---|
| `supabase/seed_riesgos_prueba.sql` | 5 riesgos por proceso, excepto Manufactura EPS (70 en total) | Folio `PRUEBA-<PROCESO>-0n` |
| `supabase/seed_aspectos_prueba.sql` | 75 aspectos (5 por área); 30 con riesgo relacionado; 1 benéfico por área | Folio `PRUEBA-AIA-<AREA>-0n` |
| `supabase/seed_oportunidades_prueba.sql` | 5 oportunidades, una por nivel de viabilidad; 2 sin folio, una por vencer y una vencida | Por el texto de la oportunidad (listado en el archivo) |

- **Dónde se cargan:** en el **borrador**. Para verlos en modo lectura hay que publicarlos.
- **Volver a ejecutarlos:** primero borran sus propios datos de prueba, así que no duplican.
- **Valores válidos:** el archivo de aspectos se generó con un script que lee los catálogos reales de Supabase y verifica que cada aspecto e impacto exista con el tipo correcto.
- **Antes de producción:** hay que borrar los datos de prueba (sección 17).

---

## 13. Configuración, despliegue y operación

### 13.1 Variables de entorno (`.env`)

| Variable | Para qué |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (rol `anon`). |

En Vercel se configuran en *Project Settings → Environment Variables*.

### 13.2 Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias. |
| `npm run dev` | Servidor local en `http://localhost:5173`. |
| `npm run build` | Revisa tipos (`tsc -b`) y genera `dist/` para producción. |
| `npm run lint` | Revisión con Oxlint. |
| `npm run preview` | Sirve `dist/` localmente. |

En esta máquina, Node está en `%LOCALAPPDATA%\Programs\nodejs`. En terminales nuevas, si no se reconoce `npm`, hay que agregarlo al `PATH`.

### 13.3 Despliegue

- **Vercel** compila con `npm run build` y publica `dist/`.
- **Rutas:** no se necesita configuración de rutas, porque la app no usa rutas de URL y el acceso de editores es por `#editar`.
- **Orden de despliegue:** aplicar primero las migraciones en Supabase y después subir el código. El código nuevo puede depender de tablas o columnas nuevas.

---

## 14. Procedimientos frecuentes

**Dar acceso de edición a una persona:**

1. En Supabase, ir a Authentication → Users → Add user → Create new user. Escribir correo y contraseña (mínimo 6 caracteres) y marcar *Auto Confirm User*.
2. En el SQL Editor, ejecutar `insert into public.editores (email) values ('correo@styropek.com');`, con el correo en minúsculas.

**Quitar el acceso de edición** (la persona conserva su cuenta):
`delete from public.editores where email = 'correo@styropek.com';`

**Agregar una matriz de riesgos (proceso):**

1. Crear la tabla `actividad_riesgos_<clave>` (columna `nombre`), con RLS y política de lectura. Usar como plantilla cualquier migración `actividad_riesgos_*`.
2. Agregar una línea en `src/config/matricesRiesgos.ts`: `clave: matriz('Título del botón', 'Proceso exacto en procesos_riesgos', 'actividad_riesgos_<clave>')`.

**Agregar un área de aspectos:**

1. Crear `actividad_aia_<clave>` (`principal`, `sub`) y, si su proceso es una lista, `procesos_aia_<clave>` (`nombre`), con RLS y política de lectura.
2. En `src/config/aspectos.tsx`, crear el módulo con `crearModuloAspectos({ clave, procesos: { tabla } | { fijo } | { opciones }, actividades, procesoRiesgos })` y agregarlo a `MATRICES_ASPECTOS` con su `area` igual a `clave`.

**Cambiar columnas de una tabla de registros:** aplicar el mismo cambio, en el mismo orden, a la tabla `_publicados` (sección 10).

---

## 15. Verificación y control de calidad

**Antes de dar por terminado cualquier cambio:**

- `npm run build` sin errores. Esto incluye la revisión de tipos de TypeScript en modo estricto.
- `npm run lint` sin advertencias.

**Pruebas funcionales:**

- **Navegador automatizado:** Edge sin ventana, controlado por protocolo de depuración. Se navegan los menús, se abren dashboards y paneles, se toman capturas en tema claro y oscuro y se comprueban textos, conteos y estados.
- **Componentes sueltos:** se montan con datos de ejemplo; así se probaron el modal de actividades y las confirmaciones.
- **Lógica de configuración:** se ejecuta renderizando del lado del servidor con Vite, por ejemplo: tipo de impacto automático, filtrado de impactos, valores por defecto de proceso y matrices de oportunidades.
- **Paneles sin datos publicados:** se prueban interceptando la respuesta de la consulta en el navegador de prueba, sin escribir en la base.

**Verificación contra la base:**

- Las consultas de solo lectura con la clave pública confirman nombres exactos de procesos y catálogos antes de escribir migraciones y configuración.
- Lo que requiere sesión de editor (escritura, publicación) no se prueba automáticamente porque necesita credenciales. Se verifica manualmente.

**Validación de colores:** las paletas de estado se validaron con el script de la guía de visualización (sección 8.4).

---

## 16. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-10-21 | Esquema inicial de la matriz de riesgos. |
| 2026-11-06 | Arquitectura por componentes; carga de causas, consecuencias y procesos; fecha opcional (NA); botón "i" de escalas; colores oficiales de nivel; columna Efectividad; diseño profesional (sin morado); portada "Sistema de Gestión Integral". |
| 2026-11-09 | Módulo de Evaluación de Oportunidades; módulo de Aspectos e Impactos Ambientales (Manufactura de EPS); logo como ícono de pestaña (PNG transparente); renombre de `tipo` y `procesos_riesgos`. |
| 2026-11-10 | Menú de Matriz de Riesgos con un botón por proceso; renombre de catálogos de riesgos; dashboards por proceso con proceso fijo y lista filtrada. |
| 2026-11-11 | Catálogos de actividades para los 15 procesos de riesgos; animación de botones; renombre `procesos_aia_meps`. |
| 2026-11-12 | Color corporativo verde; modo lectura y acceso de editores (`#editar`, tabla `editores`, RLS); flujo de borrador y "Publicar Cambios". |
| 2026-11-17 | Panel de Información Visual inicial (hecho con Copilot; luego reemplazado). |
| 2026-11-19 | Aspectos e impactos clasificados (tipo automático, impactos filtrados); selector de Actividad/Evento con riesgo relacionado; 15 áreas de aspectos; nueva Información Visual de riesgos y de aspectos; Información Visual de oportunidades y menú Tabla / Información Visual; confirmaciones dentro de la app (sin `window.confirm`); carga diferida de paneles; datos de prueba de aspectos y oportunidades; este documento. |

---

## 17. Observaciones y pendientes

| # | Observación | Riesgo / acción sugerida |
|---|---|---|
| 1 | La carpeta `supabase/` (migraciones y datos de prueba) está en `.gitignore` a petición del usuario, así que **las migraciones no están en el control de versiones**. | Para auditoría y recuperación, conviene versionarlas (al menos `supabase/migrations/`) o respaldarlas en otro lugar. Hoy solo existen en esta máquina. |
| 2 | Hay **datos de prueba** cargados (riesgos con folio `PRUEBA-…`; aspectos y oportunidades si se ejecutaron sus archivos). | Borrarlos y publicar antes de usar el sistema con información real. |
| 3 | Los procesos de riesgos se identifican por **nombre de texto** (por ejemplo "Cadena Suministro" sin "de"). | Si se renombra un proceso en `procesos_riesgos`, hay que actualizar `matricesRiesgos.ts` y `aspectos.tsx`; de lo contrario esa matriz deja de mostrar sus registros. |
| 4 | Algunas tablas usan "riesgo" en singular (`actividad_riesgo_gvc`, `actividad_riesgo_ap`), tal como se pidió. | Inconsistencia solo de nombre; no afecta el funcionamiento. |
| 5 | La publicación es **global** (las tres tablas a la vez). | Si se requiere publicar por módulo o por proceso, hay que extender `publicar_cambios()`. |
| 6 | El botón "Relacionar riesgo" ofrece riesgos del **borrador** al editor. Si se relaciona un riesgo que aún no se publica, el visitante ve su número con el aviso "no está disponible en esta vista" hasta publicar. | Comportamiento esperado; publicar resuelve. |
| 7 | Los nombres de catálogos se cargaron tal como los entregó el área. Hay duplicados intencionales (la misma subactividad en dos principales) y algunas erratas conservadas a petición. | Revisar con el área responsable si se desea depurar. |
| 8 | El `README.md` del proyecto es la plantilla de Vite y no describe el sistema. | Este documento lo sustituye como referencia. |
| 9 | Existe una carpeta vacía `sistemadegestion/utils/` de una estructura anterior. | Puede eliminarse; no la usa el código. |
