import type { ReactNode } from 'react'
import InsigniaNivel from '../InsigniaNivel/InsigniaNivel'
import type { Nivel } from '../../types/registros'
import './TablaDestacados.css'

export type FilaDestacada = {
  id: number
  nivel: Nivel
  // Una celda por cada encabezado (después de la columna de nivel)
  celdas: ReactNode[]
}

type Props = {
  // Título de la primera columna: "Nivel", "Significancia"…
  tituloNivel: string
  encabezados: string[]
  filas: FilaDestacada[]
}

// Los registros más graves: insignia de nivel + las columnas que cada panel elija
function TablaDestacados({ tituloNivel, encabezados, filas }: Props) {
  return (
    <div className="tabla-destacados-contenedor">
      <table className="tabla-destacados">
        <thead>
          <tr>
            <th>{tituloNivel}</th>
            {encabezados.map((e) => (
              <th key={e}>{e}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td>
                <span className="tabla-destacados-nivel">
                  <InsigniaNivel nivel={f.nivel} />
                  {f.nivel.descripcion.split(/[:-]/)[0]}
                </span>
              </td>
              {f.celdas.map((c, i) => (
                <td key={encabezados[i]} className={i === 0 ? 'tabla-destacados-principal' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaDestacados
