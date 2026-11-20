import { porcentaje } from '../../utils/graficas'
import type { Categoria } from '../../types/graficas'
import './BarrasNivel.css'

type Props = {
  // Niveles en orden de gravedad; el color sale de --nivel-<clave>
  niveles: readonly Categoria[]
  conteo: Record<string, number>
  total: number
}

// Una barra por nivel; la longitud es relativa al total de registros
function BarrasNivel({ niveles, conteo, total }: Props) {
  return (
    <ul className="barras-nivel">
      {niveles.map(({ clave, etiqueta }) => {
        const n = conteo[clave] ?? 0
        const pct = porcentaje(n, total)
        return (
          <li key={clave} title={`${etiqueta}: ${n} (${pct}%)`}>
            <span className="barras-nivel-etiqueta">{etiqueta}</span>
            <span className="barras-nivel-pista">
              {n > 0 && (
                <span
                  className="barras-nivel-barra"
                  style={{ width: `${Math.max(pct, 2)}%`, background: `var(--nivel-${clave})` }}
                />
              )}
            </span>
            <span className="barras-nivel-cifra">
              <b>{n}</b> <small>{pct}%</small>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default BarrasNivel
