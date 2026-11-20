import { escala, matriz, nombres, nombresConTipo, rangos } from './catalogos'
import { tablaRegistros } from './registros'
import { supabase } from './supabase'
import type {
  ActividadCatalogo,
  AspectoAmbiental,
  AspectoAmbientalInput,
  CatalogosAspectos,
  RiesgoRelacionable,
} from '../types/aspectos'

const COLUMNAS =
  'id, proceso, actividad_principal, actividad_sub, estado_proceso, aspecto, real_potencial, impacto, tipo_impacto, frecuencia, severidad, controles, folio, efectividad, riesgo_id'

// Tablas propias de cada área de la matriz de aspectos
export type AreaAspectos = {
  clave: string // columna "area" de aspectos_ambientales: 'meps', 'gch', …
  // De dónde sale la columna Proceso:
  //   tabla:    lista para elegir (procesos_aia_meps)
  //   fijo:     ya viene puesto y no se cambia ("Gestión de Calidad")
  //   opciones: interruptor entre pocos valores; el primero viene elegido
  procesos: { tabla: string } | { fijo: string } | { opciones: string[] }
  actividades: string // actividad_aia_meps
  procesoRiesgos: string // proceso en la matriz de riesgos ("Manufactura EPS")
}

// Aspectos de una sola área
export const tablaAspectos = (area: AreaAspectos) =>
  tablaRegistros<AspectoAmbiental, AspectoAmbientalInput>('aspectos_ambientales', COLUMNAS, { area: area.clave })

async function actividades(tabla: string): Promise<ActividadCatalogo[]> {
  const { data, error } = await supabase.from(tabla).select('principal, sub').order('principal').order('sub')
  if (error) throw new Error(`Tabla "${tabla}": ${error.message}`)
  return data
}

// Riesgos del área que se pueden relacionar. El editor ve su borrador; el modo lectura, lo publicado.
async function riesgosDelArea(proceso: string, publicados: boolean): Promise<RiesgoRelacionable[]> {
  const tabla = publicados ? 'riesgos_publicados' : 'riesgos'
  const { data, error } = await supabase.from(tabla).select('id, evento_riesgo').eq('proceso', proceso).order('id')
  if (error) throw new Error(`Tabla "${tabla}": ${error.message}`)
  return data
}

// Valores posibles de Proceso según cómo los define el área
function procesosDelArea({ procesos }: AreaAspectos) {
  if ('fijo' in procesos) return [procesos.fijo]
  if ('opciones' in procesos) return procesos.opciones
  return nombres(procesos.tabla)
}

export async function cargarCatalogosAspectos(area: AreaAspectos, publicados: boolean): Promise<CatalogosAspectos> {
  const [procesos, acts, riesgos, aspectos, impactos, frecuencia, severidad, mat, evaluacion] = await Promise.all([
    procesosDelArea(area),
    actividades(area.actividades),
    riesgosDelArea(area.procesoRiesgos, publicados),
    nombresConTipo('aspecto_aia'),
    nombresConTipo('impacto_aia'),
    escala('frecuencia_aia'),
    escala('severidad_aia'),
    matriz('matriz_aia', 'frecuencia', 'severidad'),
    rangos('evaluacion_aia'),
  ])
  return { procesos, actividades: acts, riesgos, aspectos, impactos, frecuencia, severidad, matriz: mat, evaluacion }
}

// Todos los aspectos (de todas las áreas) para la Información Visual
export type AspectoConArea = AspectoAmbiental & { area: string }

export async function listarTodosAspectos(publicados: boolean): Promise<AspectoConArea[]> {
  const tabla = publicados ? 'aspectos_ambientales_publicados' : 'aspectos_ambientales'
  const { data, error } = await supabase.from(tabla).select(`${COLUMNAS}, area`).order('id')
  if (error) throw new Error(`Tabla "${tabla}": ${error.message}`)
  return data as unknown as AspectoConArea[]
}

// Matriz F×S, rangos de significancia y escalas para el mapa de calor
export async function cargarDatosVisualesAspectos() {
  const [mat, evaluacion, frecuencia, severidad] = await Promise.all([
    matriz('matriz_aia', 'frecuencia', 'severidad'),
    rangos('evaluacion_aia'),
    escala('frecuencia_aia'),
    escala('severidad_aia'),
  ])
  return { matriz: mat, evaluacion, frecuencia, severidad }
}
