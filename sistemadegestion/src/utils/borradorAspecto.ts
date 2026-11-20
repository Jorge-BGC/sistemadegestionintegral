import { aLista, deLista } from './lista'
import type { AspectoAmbiental, AspectoAmbientalInput, BorradorAspecto } from '../types/aspectos'

export function borradorAspectoVacio(): BorradorAspecto {
  return {
    proceso: '',
    actividad_principal: '',
    actividad_sub: '',
    riesgo_id: '',
    estado_proceso: '',
    aspecto: '',
    real_potencial: '',
    impacto: '',
    tipo_impacto: '',
    frecuencia: '',
    severidad: '',
    controles: '',
    folio: 'NA',
    efectividad: '',
  }
}

export function aBorradorAspecto(a: AspectoAmbiental): BorradorAspecto {
  return {
    proceso: a.proceso,
    actividad_principal: a.actividad_principal,
    actividad_sub: a.actividad_sub,
    riesgo_id: a.riesgo_id === null ? '' : String(a.riesgo_id),
    estado_proceso: a.estado_proceso ?? '',
    aspecto: a.aspecto,
    real_potencial: a.real_potencial ?? '',
    impacto: a.impacto,
    tipo_impacto: a.tipo_impacto ?? '',
    frecuencia: String(a.frecuencia),
    severidad: String(a.severidad),
    controles: deLista(a.controles),
    folio: a.folio,
    efectividad: a.efectividad ?? '',
  }
}

export function aDatosAspecto(b: BorradorAspecto): AspectoAmbientalInput {
  return {
    proceso: b.proceso,
    actividad_principal: b.actividad_principal,
    actividad_sub: b.actividad_sub,
    estado_proceso: b.estado_proceso || null,
    aspecto: b.aspecto.trim(),
    real_potencial: b.real_potencial || null,
    impacto: b.impacto,
    tipo_impacto: b.tipo_impacto || null,
    frecuencia: Number(b.frecuencia),
    severidad: Number(b.severidad),
    controles: aLista(b.controles),
    folio: b.folio.trim() || 'NA',
    efectividad: b.efectividad || null,
    riesgo_id: b.riesgo_id ? Number(b.riesgo_id) : null,
  }
}

export function faltantesAspecto(b: BorradorAspecto) {
  const requeridos: [keyof BorradorAspecto, string][] = [
    ['proceso', 'Proceso'],
    ['actividad_sub', 'Actividad/Evento'],
    ['aspecto', 'Aspecto ambiental'],
    ['impacto', 'Impacto ambiental'],
    ['frecuencia', 'F'],
    ['severidad', 'S'],
  ]
  return requeridos.filter(([campo]) => !b[campo].trim()).map(([, nombre]) => nombre)
}
