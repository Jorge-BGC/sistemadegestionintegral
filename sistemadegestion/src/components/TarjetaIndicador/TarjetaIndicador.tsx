import './TarjetaIndicador.css'

type Props = {
  etiqueta: string
  valor: string | number
  // Contexto bajo la cifra: "de 12 evaluados", "Extremo + Alto", …
  detalle?: string
  // Marca de color a la izquierda (variable CSS, p. ej. "--nivel-extremo")
  color?: string
}

// Cifra principal de la Información Visual
function TarjetaIndicador({ etiqueta, valor, detalle, color }: Props) {
  return (
    <article className="tarjeta-indicador">
      {color && <span className="tarjeta-indicador-marca" style={{ background: `var(${color})` }} />}
      <span className="tarjeta-indicador-etiqueta">{etiqueta}</span>
      <strong className="tarjeta-indicador-valor">{valor}</strong>
      {detalle && <span className="tarjeta-indicador-detalle">{detalle}</span>}
    </article>
  )
}

export default TarjetaIndicador
