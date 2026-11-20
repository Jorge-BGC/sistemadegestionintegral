import { contar } from './graficas'
import { calcularNivel, claseNivel } from './nivel'
import type { AspectoConArea } from '../services/aspectos'
import type { Categoria, Segmento } from '../types/graficas'
import type { Nivel, Rango } from '../types/registros'

// Cálculos de la Información Visual de aspectos. Sin React: datos de entrada → números para las gráficas.

// Orden de gravedad de evaluacion_aia (de más a menos significativo)
export const NIVELES_AIA = [
  { clave: 'critico', etiqueta: 'Crítico' },
  { clave: 'alto', etiqueta: 'Alto' },
  { clave: 'medio', etiqueta: 'Medio' },
  { clave: 'bajo', etiqueta: 'Bajo' },
] as const

export type AspectoEvaluado = {
  aspecto: AspectoConArea
  nivel: Nivel | null
  clave: string | null // "critico", "alto", …
}

export function evaluar(aspectos: AspectoConArea[], matriz: Map<string, number>, rangos: Rango[]): AspectoEvaluado[] {
  return aspectos.map((aspecto) => {
    const nivel = calcularNivel(matriz, rangos, aspecto.frecuencia, aspecto.severidad)
    return { aspecto, nivel, clave: nivel ? claseNivel(nivel.descripcion) : null }
  })
}

export const contarPorNivel = (evaluados: AspectoEvaluado[]) => contar(evaluados, NIVELES_AIA, (e) => e.clave)

// Aspectos en cada celda del mapa de calor, con clave "frecuencia-severidad"
export function contarCeldas(evaluados: AspectoEvaluado[]) {
  const conteo = new Map<string, number>()
  for (const { aspecto } of evaluados) {
    const k = `${aspecto.frecuencia}-${aspecto.severidad}`
    conteo.set(k, (conteo.get(k) ?? 0) + 1)
  }
  return conteo
}

// Un renglón por área, en el orden del menú, con su desglose por nivel
export function porArea(evaluados: AspectoEvaluado[], areas: Categoria[]) {
  return areas.map(({ clave, etiqueta }) => {
    const delArea = evaluados.filter((e) => e.aspecto.area === clave)
    return { clave, etiqueta, total: delArea.length, niveles: contarPorNivel(delArea) }
  })
}

// Los más significativos primero (en la matriz de aspectos, un valor mayor es más significativo)
export function masSignificativos(evaluados: AspectoEvaluado[], cuantos: number) {
  return evaluados
    .filter((e): e is AspectoEvaluado & { nivel: Nivel } => e.nivel !== null)
    .sort((a, b) => b.nivel.valor - a.nivel.valor || a.aspecto.id - b.aspecto.id)
    .slice(0, cuantos)
}

// Aspectos ambientales que más se repiten
export function aspectosFrecuentes(evaluados: AspectoEvaluado[], cuantos: number) {
  const conteo = new Map<string, number>()
  for (const { aspecto } of evaluados) conteo.set(aspecto.aspecto, (conteo.get(aspecto.aspecto) ?? 0) + 1)
  return [...conteo]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta))
    .slice(0, cuantos)
}

const TIPOS = [
  { clave: 'Adverso', etiqueta: 'Adverso', color: '--estado-mal' },
  { clave: 'Benéfico', etiqueta: 'Benéfico', color: '--estado-bien' },
  { clave: 'Sin tipo', etiqueta: 'Sin tipo', color: '--estado-neutro' },
]

const ESTADOS = [
  { clave: 'Normal', etiqueta: 'Normal', color: '--estado-bien' },
  { clave: 'Anormal', etiqueta: 'Anormal', color: '--estado-proceso' },
  { clave: 'Emergencia', etiqueta: 'Emergencia', color: '--estado-mal' },
  { clave: 'Sin estado', etiqueta: 'Sin estado', color: '--estado-neutro' },
]

// Reparto en segmentos; las categorías "sin dato" solo aparecen si tienen registros
function segmentos(evaluados: AspectoEvaluado[], cats: typeof TIPOS, valor: (a: AspectoConArea) => string | null) {
  const conteo = contar(evaluados, cats, (e) => valor(e.aspecto), cats.at(-1)!.clave)
  return cats.map((c): Segmento => ({ ...c, valor: conteo[c.clave] })).filter((s, i) => i < cats.length - 1 || s.valor > 0)
}

export const segmentosTipo = (evaluados: AspectoEvaluado[]) => segmentos(evaluados, TIPOS, (a) => a.tipo_impacto)
export const segmentosEstado = (evaluados: AspectoEvaluado[]) => segmentos(evaluados, ESTADOS, (a) => a.estado_proceso)
