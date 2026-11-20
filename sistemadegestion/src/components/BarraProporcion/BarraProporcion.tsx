import Leyenda from '../Leyenda/Leyenda'
import { porcentaje } from '../../utils/graficas'
import type { Segmento } from '../../types/graficas'
import './BarraProporcion.css'

type Props = {
  segmentos: Segmento[]
  total: number
}

// Una sola barra al 100%: cómo se reparte un total entre categorías, con su leyenda y cifras
function BarraProporcion({ segmentos, total }: Props) {
  return (
    <div className="barra-proporcion">
      <div className="barra-proporcion-pista">
        {segmentos
          .filter((s) => s.valor > 0)
          .map((s) => (
            <span
              key={s.clave}
              style={{ flexGrow: s.valor, background: `var(${s.color})` }}
              title={`${s.etiqueta}: ${s.valor} (${porcentaje(s.valor, total)}%)`}
            />
          ))}
      </div>
      <Leyenda
        elementos={segmentos.map((s) => ({
          etiqueta: s.etiqueta,
          color: s.color,
          valor: `${s.valor} · ${porcentaje(s.valor, total)}%`,
        }))}
      />
    </div>
  )
}

export default BarraProporcion
