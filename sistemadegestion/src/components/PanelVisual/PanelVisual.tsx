import type { ReactNode } from 'react'
import Alerta from '../Alerta/Alerta'
import BotonIcono from '../BotonIcono/BotonIcono'
import CampoSelect from '../CampoSelect/CampoSelect'
import type { OpcionSelect } from '../CampoSelect/CampoSelect'
import Encabezado from '../Encabezado/Encabezado'
import './PanelVisual.css'

type Props = {
  // "Matriz de Riesgos", "Matriz de Aspectos e Impactos Ambientales"
  matriz: string
  onVolver: () => void
  // Modo lectura: lo publicado; editor: su borrador
  publicados: boolean
  filtro: {
    etiqueta: string
    todos: string // texto de la opción "todos": "Todos los procesos"
    valor: string // '' = todos
    opciones: OpcionSelect[]
    onChange: (valor: string) => void
  }
  error: string | null
  cargando: boolean
  // Texto cuando no hay registros (con el filtro aplicado)
  vacio: string | null
  children: ReactNode
}

// Esqueleto de un panel de Información Visual: encabezado con filtro, contexto y estados de carga.
// Dentro, los hijos usan .panel-visual-indicadores y .panel-visual-par para acomodarse.
function PanelVisual({ matriz, onVolver, publicados, filtro, error, cargando, vacio, children }: Props) {
  const elegido = filtro.opciones.find((o) => o.valor === filtro.valor)?.etiqueta

  return (
    <main className="dashboard panel-visual">
      <Encabezado titulo="Información Visual" inicio={<BotonIcono icono="atras" titulo="Volver" onClick={onVolver} />}>
        <div className="panel-visual-filtro">
          <CampoSelect
            valor={filtro.valor}
            opciones={filtro.opciones}
            onChange={filtro.onChange}
            etiqueta={filtro.etiqueta}
            vacio={filtro.todos}
          />
        </div>
      </Encabezado>
      <p className="panel-visual-contexto">
        {matriz} · {elegido ?? filtro.todos}
        {!publicados && (
          <span className="panel-visual-borrador">Borrador del editor (incluye cambios sin publicar)</span>
        )}
      </p>

      {error && <Alerta>No se pudo cargar la información — {error}</Alerta>}
      {!error && cargando && <p className="panel-visual-vacio">Cargando…</p>}
      {!error && !cargando && vacio && <p className="panel-visual-vacio">{vacio}</p>}
      {!error && !cargando && !vacio && children}
    </main>
  )
}

export default PanelVisual
