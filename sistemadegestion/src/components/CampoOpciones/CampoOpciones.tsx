import './CampoOpciones.css'

type Props = {
  valor: string
  opciones: string[]
  onChange: (valor: string) => void
  etiqueta: string
}

// Interruptor de pocas opciones (botones unidos); siempre hay una elegida
function CampoOpciones({ valor, opciones, onChange, etiqueta }: Props) {
  return (
    <div className="campo-opciones" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === valor}
          className={o === valor ? 'campo-opciones-opcion elegida' : 'campo-opciones-opcion'}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default CampoOpciones
