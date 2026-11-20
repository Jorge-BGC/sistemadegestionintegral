import Icono from '../Icono/Icono'
import './BotonInfo.css'

type Props = {
  // Texto para lectores de pantalla y al pasar el puntero
  etiqueta: string
  onClick: () => void
}

// Botón redondo "i" que abre información adicional en un modal
function BotonInfo({ etiqueta, onClick }: Props) {
  return (
    <button type="button" className="boton-info" onClick={onClick} title={etiqueta} aria-label={etiqueta}>
      <Icono nombre="info" />
    </button>
  )
}

export default BotonInfo
