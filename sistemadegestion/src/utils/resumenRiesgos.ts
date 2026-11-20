import { contar } from './graficas'
import { calcularNivel, claseNivel } from './nivel'
import type { Nivel, Rango } from '../types/registros'
import type { Riesgo } from '../types/riesgos'

// Cálculos de la Información Visual de riesgos. Sin React: datos de entrada → números para las gráficas.

// Orden de gravedad de evaluacion_riesgos (de más a menos grave)
export const NIVELES = [
  { clave: 'extremo', etiqueta: 'Extremo' },
  { clave: 'alto', etiqueta: 'Alto' },
  { clave: 'importante', etiqueta: 'Importante' },
  { clave: 'moderado', etiqueta: 'Moderado' },
  { clave: 'bajo', etiqueta: 'Bajo' },
] as const

export type RiesgoEvaluado = {
  riesgo: Riesgo
  nivel: Nivel | null
  clave: string | null // "extremo", "alto", …
}

export function evaluar(riesgos: Riesgo[], matriz: Map<string, number>, rangos: Rango[]): RiesgoEvaluado[] {
  return riesgos.map((riesgo) => {
    const nivel = calcularNivel(matriz, rangos, riesgo.severidad, riesgo.probabilidad)
    return { riesgo, nivel, clave: nivel ? claseNivel(nivel.descripcion) : null }
  })
}

export const contarPorNivel = (evaluados: RiesgoEvaluado[]) => contar(evaluados, NIVELES, (e) => e.clave)

// Riesgos en cada celda del mapa de calor, con clave "severidad-probabilidad"
export function contarCeldas(evaluados: RiesgoEvaluado[]) {
  const conteo = new Map<string, number>()
  for (const { riesgo } of evaluados) {
    const k = `${riesgo.severidad}-${riesgo.probabilidad}`
    conteo.set(k, (conteo.get(k) ?? 0) + 1)
  }
  return conteo
}

// Un renglón por proceso, en el orden recibido, con su desglose por nivel
export function porProceso(evaluados: RiesgoEvaluado[], procesos: string[]) {
  return procesos.map((proceso) => {
    const delProceso = evaluados.filter((e) => e.riesgo.proceso === proceso)
    return { clave: proceso, etiqueta: proceso, total: delProceso.length, niveles: contarPorNivel(delProceso) }
  })
}

// Los más graves primero (en la matriz de riesgos, un valor menor es más grave)
export function prioritarios(evaluados: RiesgoEvaluado[], cuantos: number) {
  return evaluados
    .filter((e): e is RiesgoEvaluado & { nivel: Nivel } => e.nivel !== null)
    .sort((a, b) => a.nivel.valor - b.nivel.valor || a.riesgo.id - b.riesgo.id)
    .slice(0, cuantos)
}
