import { contar } from './graficas'
import { calcularNivel, claseNivel } from './nivel'
import type { Categoria, Segmento } from '../types/graficas'
import type { Nivel, Rango } from '../types/registros'
import type { Oportunidad } from '../types/oportunidades'

// Cálculos de la Información Visual de oportunidades. Sin React: datos de entrada → números para las gráficas.

// Orden de evaluacion_oportunidades (de más a menos conveniente abordar)
export const NIVELES_EO = [
  { clave: 'prioritaria', etiqueta: 'Prioritaria' },
  { clave: 'destacada', etiqueta: 'Destacada' },
  { clave: 'adecuada', etiqueta: 'Adecuada' },
  { clave: 'factible', etiqueta: 'Factible' },
  { clave: 'intrascendente', etiqueta: 'Intrascendente' },
] as const

// Días antes del vencimiento en que una oportunidad cuenta como "por vencer"
export const DIAS_AVISO = 30

export type OportunidadEvaluada = {
  oportunidad: Oportunidad
  nivel: Nivel | null
  clave: string | null // "prioritaria", "destacada", …
}

export function evaluar(ops: Oportunidad[], matriz: Map<string, number>, rangos: Rango[]): OportunidadEvaluada[] {
  return ops.map((oportunidad) => {
    const nivel = calcularNivel(matriz, rangos, oportunidad.impacto, oportunidad.tiempo)
    return { oportunidad, nivel, clave: nivel ? claseNivel(nivel.descripcion) : null }
  })
}

export const contarPorNivel = (evaluadas: OportunidadEvaluada[]) => contar(evaluadas, NIVELES_EO, (e) => e.clave)

// Oportunidades en cada celda de la matriz, con clave "impacto-tiempo"
export function contarCeldas(evaluadas: OportunidadEvaluada[]) {
  const conteo = new Map<string, number>()
  for (const { oportunidad: o } of evaluadas) {
    const k = `${o.impacto}-${o.tiempo}`
    conteo.set(k, (conteo.get(k) ?? 0) + 1)
  }
  return conteo
}

// Un renglón por grupo (enfoque, origen…) con su desglose por nivel de viabilidad
export function porGrupo(evaluadas: OportunidadEvaluada[], grupos: string[], grupoDe: (o: Oportunidad) => string) {
  return grupos.map((g) => {
    const delGrupo = evaluadas.filter((e) => grupoDe(e.oportunidad) === g)
    return { clave: g, etiqueta: g, total: delGrupo.length, niveles: contarPorNivel(delGrupo) }
  })
}

// "Tomada" = ya tiene folio asignado (distinto de NA)
export const tomada = (o: Oportunidad) => o.folio.trim() !== '' && o.folio.trim().toUpperCase() !== 'NA'

export function segmentosSeguimiento(evaluadas: OportunidadEvaluada[]): Segmento[] {
  const tomadas = evaluadas.filter((e) => tomada(e.oportunidad)).length
  return [
    { clave: 'tomada', etiqueta: 'Tomada (con folio)', color: '--estado-bien', valor: tomadas },
    { clave: 'pendiente', etiqueta: 'Sin folio asignado', color: '--estado-neutro', valor: evaluadas.length - tomadas },
  ]
}

const VIGENCIAS: (Categoria & { color: string })[] = [
  { clave: 'vigente', etiqueta: 'Vigente', color: '--estado-bien' },
  { clave: 'porvencer', etiqueta: `Vence en ${DIAS_AVISO} días o menos`, color: '--estado-proceso' },
  { clave: 'vencida', etiqueta: 'Vencida', color: '--estado-mal' },
  { clave: 'sinvigencia', etiqueta: 'Sin vigencia (NA)', color: '--estado-neutro' },
]

// Días de hoy a la vigencia (negativo = ya venció); null si no tiene vigencia
export function diasParaVencer(vigencia: string | null, hoy: Date) {
  if (!vigencia) return null
  const [a, m, d] = vigencia.split('-').map(Number)
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((new Date(a, m - 1, d).getTime() - inicio.getTime()) / 86_400_000)
}

export function estadoVigencia(vigencia: string | null, hoy: Date) {
  const dias = diasParaVencer(vigencia, hoy)
  if (dias === null) return 'sinvigencia'
  if (dias < 0) return 'vencida'
  return dias <= DIAS_AVISO ? 'porvencer' : 'vigente'
}

export function segmentosVigencia(evaluadas: OportunidadEvaluada[], hoy: Date): Segmento[] {
  const conteo = contar(evaluadas, VIGENCIAS, (e) => estadoVigencia(e.oportunidad.vigencia, hoy))
  return VIGENCIAS.map((v) => ({ ...v, valor: conteo[v.clave] }))
}

// Las más convenientes primero (en la matriz de oportunidades, un valor menor es más prioritario)
export function masPrioritarias(evaluadas: OportunidadEvaluada[], cuantas: number) {
  return evaluadas
    .filter((e): e is OportunidadEvaluada & { nivel: Nivel } => e.nivel !== null)
    .sort((a, b) => a.nivel.valor - b.nivel.valor || a.oportunidad.id - b.oportunidad.id)
    .slice(0, cuantas)
}

// Total de beneficios esperados (cada oportunidad puede listar varios)
export const totalBeneficios = (evaluadas: OportunidadEvaluada[]) =>
  evaluadas.reduce((n, e) => n + e.oportunidad.beneficios.length, 0)
