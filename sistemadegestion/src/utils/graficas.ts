import type { Categoria, Segmento } from '../types/graficas'

// Cálculos compartidos por los paneles de Información Visual (riesgos y aspectos)

export const porcentaje = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0)

// Cuántos elementos caen en cada categoría, en el orden de las categorías.
// Lo que no coincide con ninguna cuenta para "otra" (si se da).
export function contar<T>(
  elementos: T[],
  categorias: readonly Categoria[],
  categoriaDe: (e: T) => string | null,
  otra?: string,
): Record<string, number> {
  const conteo: Record<string, number> = Object.fromEntries(categorias.map((c) => [c.clave, 0]))
  for (const e of elementos) {
    const c = categoriaDe(e)
    if (c !== null && c in conteo) conteo[c]++
    else if (otra) conteo[otra]++
  }
  return conteo
}

// Efectividad de controles: igual en riesgos y aspectos
const EFECTIVIDADES = [
  { clave: 'Efectivo', etiqueta: 'Efectivo', color: '--estado-bien' },
  { clave: 'En Proceso', etiqueta: 'En Proceso', color: '--estado-proceso' },
  { clave: 'No Efectivo', etiqueta: 'No Efectivo', color: '--estado-mal' },
  { clave: 'Sin evaluar', etiqueta: 'Sin evaluar', color: '--estado-neutro' },
]

export function segmentosEfectividad(valores: (string | null)[]): Segmento[] {
  const conteo = contar(valores, EFECTIVIDADES, (v) => v, 'Sin evaluar')
  return EFECTIVIDADES.map((e) => ({ ...e, valor: conteo[e.clave] }))
}
