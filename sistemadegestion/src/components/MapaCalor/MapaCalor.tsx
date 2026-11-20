import type { CSSProperties } from 'react'
import { claseNivel } from '../../utils/nivel'
import type { Escala, Nivel } from '../../types/registros'
import './MapaCalor.css'

type Eje = {
  titulo: string
  escala: Escala[]
}

type Props = {
  // Eje vertical (de mayor a menor, arriba hacia abajo) y horizontal (de menor a mayor)
  ejeY: Eje
  ejeX: Eje
  // Nivel de la celda y cuántos registros caen en ella, según los números de cada eje
  nivel: (y: number, x: number) => Nivel | null
  conteo: (y: number, x: number) => number
  // Para lectores de pantalla y tooltips: "riesgo"/"riesgos", "aspecto"/"aspectos"
  singular: string
  plural: string
}

// "3: Moderada" → { numero: "3", nombre: "Moderada" }
function partes(e: Escala) {
  const [numero, ...resto] = e.valor.split(':')
  return { numero: numero.trim(), nombre: resto.join(':').trim() }
}

// Matriz de dos escalas con el color oficial de cada celda; la cifra es cuántos registros caen ahí
function MapaCalor({ ejeY, ejeX, nivel, conteo, singular, plural }: Props) {
  const filas = [...ejeY.escala].sort((a, b) => b.numero - a.numero)
  const columnas = [...ejeX.escala].sort((a, b) => a.numero - b.numero)
  const inicialY = ejeY.titulo[0]
  const inicialX = ejeX.titulo[0]

  return (
    <div className="mapa-calor">
      <span className="mapa-calor-eje mapa-calor-eje-y">{ejeY.titulo}</span>
      <div
        className="mapa-calor-rejilla"
        style={{ gridTemplateColumns: `minmax(72px, auto) repeat(${columnas.length}, minmax(44px, 1fr))` }}
        role="table"
        aria-label={`${plural[0].toUpperCase()}${plural.slice(1)} por ${ejeY.titulo.toLowerCase()} y ${ejeX.titulo.toLowerCase()}`}
      >
        {filas.map((y) => (
          <div className="mapa-calor-fila" role="row" key={y.numero}>
            <span className="mapa-calor-rotulo" role="rowheader" title={y.descripcion}>
              <b>{partes(y).numero}</b> {partes(y).nombre}
            </span>
            {columnas.map((x) => {
              const n = nivel(y.numero, x.numero)
              const total = conteo(y.numero, x.numero)
              const nombreNivel = n?.descripcion.split(/[:-]/)[0] ?? 'Sin nivel'
              return (
                <span
                  key={x.numero}
                  role="cell"
                  className={total ? 'mapa-calor-celda con-riesgos' : 'mapa-calor-celda'}
                  style={n ? ({ '--celda': `var(--nivel-${claseNivel(n.descripcion)})` } as CSSProperties) : undefined}
                  title={`${inicialY}${y.numero} × ${inicialX}${x.numero} · nivel ${n?.valor ?? '—'} (${nombreNivel}): ${total} ${total === 1 ? singular : plural}`}
                >
                  {total || ''}
                </span>
              )
            })}
          </div>
        ))}
        <div className="mapa-calor-fila mapa-calor-pie" role="row">
          <span role="columnheader" />
          {columnas.map((x) => (
            <span className="mapa-calor-rotulo" role="columnheader" key={x.numero} title={x.descripcion}>
              <b>{partes(x).numero}</b>
              <small>{partes(x).nombre}</small>
            </span>
          ))}
        </div>
      </div>
      <span className="mapa-calor-eje mapa-calor-eje-x">{ejeX.titulo}</span>
    </div>
  )
}

export default MapaCalor
