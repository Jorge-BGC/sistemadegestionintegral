import { useState } from 'react'
import CampoSelect from '../CampoSelect/CampoSelect'
import Modal from '../Modal/Modal'
import type { ActividadCatalogo, RiesgoRelacionable } from '../../types/aspectos'
import './SelectorActividad.css'

export type ActividadElegida = {
  principal: string
  sub: string
  riesgoId: string // '' = sin riesgo relacionado
}

type Props = {
  actividades: ActividadCatalogo[]
  riesgos: RiesgoRelacionable[]
  // Nombre del área en la matriz de riesgos, p. ej. "Manufactura EPS"
  areaRiesgos: string
  inicial: ActividadElegida
  onConfirmar: (elegida: ActividadElegida) => void
  onCerrar: () => void
}

// Modal de Actividad/Evento: actividad principal → subactividad → (opcional) riesgo relacionado
function SelectorActividad({ actividades, riesgos, areaRiesgos, inicial, onConfirmar, onCerrar }: Props) {
  const [principal, setPrincipal] = useState(inicial.principal)
  const [sub, setSub] = useState(inicial.sub)
  const [riesgoId, setRiesgoId] = useState(inicial.riesgoId)
  const [relacionar, setRelacionar] = useState(inicial.riesgoId !== '')

  const principales = [...new Set(actividades.map((a) => a.principal))]
  const subs = actividades.filter((a) => a.principal === principal).map((a) => a.sub)
  const completa = principal !== '' && sub !== ''

  function elegirPrincipal(v: string) {
    setPrincipal(v)
    setSub('')
  }

  function quitarRelacion() {
    setRelacionar(false)
    setRiesgoId('')
  }

  return (
    <Modal titulo="Actividad / Evento" onCerrar={onCerrar} ancho={820}>
      <div className="selector-actividad">
        <div className="selector-actividad-columnas">
          <label>
            <span>Actividad principal</span>
            <CampoSelect
              valor={principal}
              opciones={principales.map((p) => ({ valor: p, etiqueta: p }))}
              onChange={elegirPrincipal}
              etiqueta="Actividad principal"
              vacio="Elige una actividad"
            />
          </label>
          <label>
            <span>Subactividad</span>
            <CampoSelect
              valor={sub}
              opciones={subs.map((s) => ({ valor: s, etiqueta: s }))}
              onChange={setSub}
              etiqueta="Subactividad"
              deshabilitado={!principal}
              vacio={principal ? 'Elige una subactividad' : 'Primero la actividad principal'}
            />
          </label>
        </div>

        {/* El texto completo, por si la subactividad es larga y el selector la recorta */}
        {completa && (
          <p className="selector-actividad-vista">
            <b>{principal}</b>: {sub}
          </p>
        )}

        {completa && !relacionar && (
          <button type="button" className="selector-actividad-secundario" onClick={() => setRelacionar(true)}>
            Relacionar riesgo
          </button>
        )}

        {completa && relacionar && (
          <div className="selector-actividad-riesgo">
            <div className="selector-actividad-riesgo-titulo">
              <span>Riesgo relacionado · Matriz de Riesgos de {areaRiesgos}</span>
              <button type="button" className="selector-actividad-enlace" onClick={quitarRelacion}>
                Quitar relación
              </button>
            </div>
            {riesgos.length ? (
              <CampoSelect
                valor={riesgoId}
                opciones={riesgos.map((r) => ({ valor: String(r.id), etiqueta: `N. ${r.id} — ${r.evento_riesgo}` }))}
                onChange={setRiesgoId}
                etiqueta="Riesgo relacionado"
                vacio="Elige un riesgo"
              />
            ) : (
              <p className="selector-actividad-aviso">
                La Matriz de Riesgos de {areaRiesgos} todavía no tiene riesgos registrados.
              </p>
            )}
          </div>
        )}

        <footer className="selector-actividad-pie">
          <button type="button" className="selector-actividad-secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="selector-actividad-principal"
            disabled={!completa}
            onClick={() => onConfirmar({ principal, sub, riesgoId: relacionar ? riesgoId : '' })}
          >
            Confirmar
          </button>
        </footer>
      </div>
    </Modal>
  )
}

export default SelectorActividad
