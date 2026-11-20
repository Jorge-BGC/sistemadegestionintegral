import type { ReactNode } from 'react'
import './TarjetaGrafica.css'

type Props = {
  titulo: string
  // Una línea que dice qué responde la gráfica
  descripcion?: string
  // A la derecha del título: leyenda, total, etc.
  extra?: ReactNode
  className?: string
  children: ReactNode
}

// Contenedor de una gráfica de la Información Visual
function TarjetaGrafica({ titulo, descripcion, extra, className, children }: Props) {
  return (
    <section className={className ? `tarjeta-grafica ${className}` : 'tarjeta-grafica'}>
      <header className="tarjeta-grafica-encabezado">
        <div>
          <h2>{titulo}</h2>
          {descripcion && <p>{descripcion}</p>}
        </div>
        {extra}
      </header>
      {children}
    </section>
  )
}

export default TarjetaGrafica
