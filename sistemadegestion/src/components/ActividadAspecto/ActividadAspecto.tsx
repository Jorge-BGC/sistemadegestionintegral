import { useState } from 'react'
import BotonInfo from '../BotonInfo/BotonInfo'
import Modal from '../Modal/Modal'
import SinValor from '../SinValor/SinValor'
import type { RiesgoRelacionable } from '../../types/aspectos'
import './ActividadAspecto.css'

type Props = {
  principal: string
  sub: string
  riesgoId: number | null
  // Riesgos del área para mostrar el nombre del relacionado
  riesgos: RiesgoRelacionable[]
}

// "Principal: sub" y, si hay riesgo relacionado, el botón "i" que lo muestra
function ActividadAspecto({ principal, sub, riesgoId, riesgos }: Props) {
  const [abierto, setAbierto] = useState(false)

  if (!principal && !sub) return <SinValor />
  const riesgo = riesgos.find((r) => r.id === riesgoId)

  return (
    <div className="actividad-aspecto">
      <span>
        {principal && <b>{principal}</b>}
        {principal && sub && ': '}
        {sub}
      </span>
      {riesgoId !== null && (
        <>
          <BotonInfo etiqueta="Ver riesgo relacionado" onClick={() => setAbierto(true)} />
          {abierto && (
            <Modal titulo="Se relaciona con este riesgo" onCerrar={() => setAbierto(false)} ancho={480}>
              <div className="actividad-aspecto-riesgo">
                <span className="actividad-aspecto-numero">N. {riesgoId}</span>
                {/* Puede no verse si el riesgo aún no se publica o se borró */}
                <p>{riesgo ? riesgo.evento_riesgo : 'Este riesgo no está disponible en esta vista.'}</p>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  )
}

export default ActividadAspecto
