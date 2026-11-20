import { useState } from 'react'
import ActividadAspecto from '../ActividadAspecto/ActividadAspecto'
import Icono from '../Icono/Icono'
import SelectorActividad from '../SelectorActividad/SelectorActividad'
import type { ActividadElegida } from '../SelectorActividad/SelectorActividad'
import type { ActividadCatalogo, RiesgoRelacionable } from '../../types/aspectos'
import './CampoActividad.css'

type Props = {
  valor: ActividadElegida
  actividades: ActividadCatalogo[]
  riesgos: RiesgoRelacionable[]
  areaRiesgos: string
  onChange: (elegida: ActividadElegida) => void
}

// Celda en edición de Actividad/Evento: lo elegido + botón que abre el selector (no se escribe a mano)
function CampoActividad({ valor, actividades, riesgos, areaRiesgos, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="campo-actividad">
      <div className="campo-actividad-valor">
        {valor.sub ? (
          <ActividadAspecto
            principal={valor.principal}
            sub={valor.sub}
            riesgoId={valor.riesgoId ? Number(valor.riesgoId) : null}
            riesgos={riesgos}
          />
        ) : (
          <span className="campo-actividad-vacio">Sin elegir</span>
        )}
      </div>
      <button
        type="button"
        className="campo-actividad-boton"
        onClick={() => setAbierto(true)}
        title="Elegir actividad"
        aria-label="Elegir actividad"
      >
        <Icono nombre="lista" />
      </button>
      {abierto && (
        <SelectorActividad
          actividades={actividades}
          riesgos={riesgos}
          areaRiesgos={areaRiesgos}
          inicial={valor}
          onCerrar={() => setAbierto(false)}
          onConfirmar={(elegida) => {
            onChange(elegida)
            setAbierto(false)
          }}
        />
      )}
    </div>
  )
}

export default CampoActividad
