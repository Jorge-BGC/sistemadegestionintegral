import './CampoSelect.css'

export type OpcionSelect = {
  valor: string
  etiqueta: string
  // Opciones con el mismo grupo se muestran juntas bajo ese encabezado
  grupo?: string
}

type Props = {
  valor: string
  opciones: OpcionSelect[]
  onChange: (valor: string) => void
  etiqueta: string
  deshabilitado?: boolean
  // Texto de la opción vacía (por defecto "—")
  vacio?: string
}

function CampoSelect({ valor, opciones, onChange, etiqueta, deshabilitado, vacio = '—' }: Props) {
  const grupos = [...new Set(opciones.map((o) => o.grupo))]
  const lista = (os: OpcionSelect[]) =>
    os.map((o) => (
      <option key={o.valor} value={o.valor}>
        {o.etiqueta}
      </option>
    ))

  return (
    <select
      className="campo-select"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      aria-label={etiqueta}
      disabled={deshabilitado}
    >
      <option value="">{vacio}</option>
      {grupos.map((g) => {
        const os = opciones.filter((o) => o.grupo === g)
        return g ? (
          <optgroup key={g} label={g}>
            {lista(os)}
          </optgroup>
        ) : (
          lista(os)
        )
      })}
    </select>
  )
}

export default CampoSelect
