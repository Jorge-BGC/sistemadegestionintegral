import './BarrasConteo.css'

type Props = {
  elementos: { etiqueta: string; valor: number }[]
}

// Ranking de una sola serie: nombre arriba, barra proporcional al mayor y la cifra a la derecha
function BarrasConteo({ elementos }: Props) {
  const maximo = Math.max(1, ...elementos.map((e) => e.valor))
  return (
    <ol className="barras-conteo">
      {elementos.map((e) => (
        <li key={e.etiqueta} title={`${e.etiqueta}: ${e.valor}`}>
          <span className="barras-conteo-etiqueta">{e.etiqueta}</span>
          <span className="barras-conteo-pista">
            <span className="barras-conteo-barra" style={{ width: `${(e.valor / maximo) * 100}%` }} />
          </span>
          <b>{e.valor}</b>
        </li>
      ))}
    </ol>
  )
}

export default BarrasConteo
