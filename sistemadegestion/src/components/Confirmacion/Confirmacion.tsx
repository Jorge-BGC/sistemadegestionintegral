import Modal from '../Modal/Modal'
import './Confirmacion.css'

type Props = {
  titulo: string
  mensaje: string
  // Texto del botón que confirma: "Publicar", "Borrar"…
  confirmar: string
  // Acción destructiva: el botón de confirmar va en rojo
  peligro?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

// Pregunta de sí/no dentro de la app (en lugar del confirm() del navegador)
function Confirmacion({ titulo, mensaje, confirmar, peligro, onConfirmar, onCancelar }: Props) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar} ancho={440}>
      <p className="confirmacion-mensaje">{mensaje}</p>
      <footer className="confirmacion-pie">
        {/* El foco inicial: en acciones destructivas, Cancelar (un Enter accidental no borra) */}
        <button
          type="button"
          className="confirmacion-cancelar"
          onClick={onCancelar}
          data-autofocus={peligro ? true : undefined}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={peligro ? 'confirmacion-aceptar peligro' : 'confirmacion-aceptar'}
          onClick={onConfirmar}
          data-autofocus={peligro ? undefined : true}
        >
          {confirmar}
        </button>
      </footer>
    </Modal>
  )
}

export default Confirmacion
