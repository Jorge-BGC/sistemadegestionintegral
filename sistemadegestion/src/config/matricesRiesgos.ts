import { crearModuloRiesgos } from './riesgos'

// Matrices de riesgos por proceso: mismo dashboard, cambia el proceso y su catálogo de actividades.
// Para agregar un proceso basta otra entrada aquí. Los módulos se crean una sola vez
// porque el dashboard recarga datos cuando cambia el módulo.
//   titulo: texto del botón y del dashboard
//   proceso: nombre exacto en procesos_riesgos (p. ej. "Cadena Suministro", sin "de")
//   actividades: tabla que sugiere la columna Fuente / Actividad
const matriz = (titulo: string, proceso: string, actividades: string) => ({
  titulo,
  proceso,
  modulo: crearModuloRiesgos(proceso, actividades),
})

export const MATRICES_RIESGOS = {
  meps: matriz('Manufactura EPS', 'Manufactura EPS', 'actividad_riesgos_meps'),
  epc: matriz('Entrega de Producto al Cliente', 'Entrega de Producto al Cliente', 'actividad_riesgos_epc'),
  dt: matriz('Desarrollo Tecnológico', 'Desarrollo Tecnológico', 'actividad_riesgos_dt'),
  pc: matriz('Programación de la Cadena', 'Programación de la Cadena', 'actividad_riesgos_pc'),
  ceps: matriz('Comercialización EPS', 'Comercialización EPS', 'actividad_riesgos_ceps'),
  gvc: matriz('Generación de Valor Clientes', 'Generación de Valor Clientes', 'actividad_riesgo_gvc'),
  ti: matriz('TI', 'TI', 'actividad_riesgos_ti'),
  ap: matriz('Admon Proyectos', 'Admon Proyectos', 'actividad_riesgo_ap'),
  m: matriz('Mantenimiento', 'Mantenimiento', 'actividad_riesgos_m'),
  cs: matriz('Cadena de Suministro', 'Cadena Suministro', 'actividad_riesgos_cs'),
  ch: matriz('Capital Humano', 'Capital Humano', 'actividad_riesgos_ch'),
  af: matriz('Administración Financiera', 'Administración Financiera', 'actividad_riesgos_af'),
  mash: matriz('MASH', 'MASH', 'actividad_riesgos_mash'),
  calidad: matriz('Gestión de Calidad', 'Gestión de Calidad', 'actividad_riesgos_gc'),
  sesg: matriz('Sustentabilidad & ESG', 'Sustentabilidad & ESG', 'actividad_riesgos_sesg'),
}

export type MatrizRiesgos = keyof typeof MATRICES_RIESGOS

// Procesos en el orden del menú (para la Información Visual)
export const PROCESOS_RIESGOS = Object.values(MATRICES_RIESGOS).map((m) => m.proceso)
