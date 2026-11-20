import './Leyenda.css'

export type ElementoLeyenda = {
  etiqueta: string
  // Variable CSS del color, p. ej. "--nivel-alto"
  color: string
  // Cifra opcional junto a la etiqueta
  valor?: string | number
}

// Muestras de color con su nombre: el color nunca es la única pista
function Leyenda({ elementos }: { elementos: ElementoLeyenda[] }) {
  return (
    <ul className="leyenda">
      {elementos.map((e) => (
        <li key={e.etiqueta}>
          <span className="leyenda-muestra" style={{ background: `var(${e.color})` }} />
          {e.etiqueta}
          {e.valor !== undefined && <b>{e.valor}</b>}
        </li>
      ))}
    </ul>
  )
}

export default Leyenda
