import { useState } from 'react'
import CampoSelect from '../CampoSelect/CampoSelect'
import BotonInfo from '../BotonInfo/BotonInfo'
import Modal from '../Modal/Modal'
import TablaEscala from '../TablaEscala/TablaEscala'
import type { Escala } from '../../types/registros'
import './CampoEscala.css'

type Props = {
  valor: string
  escala: Escala[]
  onChange: (valor: string) => void
  etiqueta: string
}

function CampoEscala({ valor, escala, onChange, etiqueta }: Props) {
  const [ayuda, setAyuda] = useState(false)

  return (
    <div className="campo-escala">
      <CampoSelect
        valor={valor}
        opciones={escala.map((e) => ({ valor: String(e.numero), etiqueta: e.valor }))}
        onChange={onChange}
        etiqueta={etiqueta}
      />
      <BotonInfo etiqueta={`Ver niveles de ${etiqueta}`} onClick={() => setAyuda(true)} />
      {ayuda && (
        <Modal titulo={etiqueta} onCerrar={() => setAyuda(false)}>
          <TablaEscala escala={escala} />
        </Modal>
      )}
    </div>
  )
}

export default CampoEscala
