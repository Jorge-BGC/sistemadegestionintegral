import type { Categoria } from '../../types/graficas'
import './NivelesPorGrupo.css'

export type FilaGrupo = {
  // Lo que se pasa a onElegir (p. ej. el proceso o la clave del área)
  clave: string
  etiqueta: string
  total: number
  niveles: Record<string, number>
}

type Props = {
  niveles: readonly Categoria[]
  filas: FilaGrupo[]
  // Clic en un grupo: filtra el panel por él
  onElegir: (clave: string) => void
  textoVacio?: string
}

// Barra apilada por grupo (proceso, área…): cuántos registros tiene y de qué nivel. De más a menos.
function NivelesPorGrupo({ niveles, filas, onElegir, textoVacio = 'Sin registros' }: Props) {
  const maximo = Math.max(1, ...filas.map((f) => f.total))
  const ordenadas = [...filas].sort((a, b) => b.total - a.total)

  return (
    <ul className="niveles-grupo">
      {ordenadas.map((f) => (
        <li key={f.clave}>
          <button
            type="button"
            className="niveles-grupo-nombre"
            onClick={() => onElegir(f.clave)}
            title={`Ver solo ${f.etiqueta}`}
            disabled={f.total === 0}
          >
            {f.etiqueta}
          </button>
          <span className="niveles-grupo-pista" style={{ width: `${(f.total / maximo) * 100}%` }}>
            {niveles
              .filter(({ clave }) => (f.niveles[clave] ?? 0) > 0)
              .map(({ clave, etiqueta }) => (
                <span
                  key={clave}
                  className="niveles-grupo-segmento"
                  style={{ flexGrow: f.niveles[clave], background: `var(--nivel-${clave})` }}
                  title={`${f.etiqueta} · ${etiqueta}: ${f.niveles[clave]}`}
                />
              ))}
          </span>
          <b className="niveles-grupo-total">{f.total || <small>{textoVacio}</small>}</b>
        </li>
      ))}
    </ul>
  )
}

export default NivelesPorGrupo
