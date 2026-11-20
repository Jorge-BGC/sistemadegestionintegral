import type { Escala, OpcionConTipo, Rango } from './registros'

export type AspectoAmbiental = {
  id: number
  proceso: string
  actividad_principal: string
  actividad_sub: string
  estado_proceso: string | null
  aspecto: string
  real_potencial: string | null
  impacto: string
  tipo_impacto: string | null
  frecuencia: number
  severidad: number
  controles: string[]
  folio: string
  efectividad: string | null
  // Riesgo de la matriz del área con el que se relaciona la actividad (opcional)
  riesgo_id: number | null
}

export type AspectoAmbientalInput = Omit<AspectoAmbiental, 'id'>

export type CatalogosAspectos = {
  procesos: string[]
  actividades: ActividadCatalogo[]
  // Riesgos que se pueden relacionar (los de la matriz de riesgos del área)
  riesgos: RiesgoRelacionable[]
  aspectos: OpcionConTipo[]
  impactos: OpcionConTipo[]
  frecuencia: Escala[]
  severidad: Escala[]
  matriz: Map<string, number>
  evaluacion: Rango[]
}

// Valores del formulario tal como se escriben (controles separados por comas, F y S como texto)
export type BorradorAspecto = {
  proceso: string
  actividad_principal: string
  actividad_sub: string
  riesgo_id: string
  estado_proceso: string
  aspecto: string
  real_potencial: string
  impacto: string
  tipo_impacto: string
  frecuencia: string
  severidad: string
  controles: string
  folio: string
  efectividad: string
}

// Fila de actividad_aia_meps (y futuras actividad_aia_*)
export type ActividadCatalogo = {
  principal: string
  sub: string
}

export type RiesgoRelacionable = {
  id: number
  evento_riesgo: string
}
