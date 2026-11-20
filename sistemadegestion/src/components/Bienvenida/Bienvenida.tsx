import BotonIcono from '../BotonIcono/BotonIcono'
import './Bienvenida.css'

export type OpcionInicio = {
  titulo: string
  onAbrir: () => void
}

type Props = {
  titulo: string
  opciones: OpcionInicio[]
  // Opciones aparte, debajo de una línea separadora (p. ej. Información Visual)
  secundarias?: OpcionInicio[]
  // Sin onVolver es la portada; con onVolver es un submenú
  onVolver?: () => void
}

// Pantalla de menú: título centrado y un botón por cada opción
function Bienvenida({ titulo, opciones, secundarias, onVolver }: Props) {
  const botones = (os: OpcionInicio[]) =>
    os.map((o) => (
      <button key={o.titulo} type="button" className="bienvenida-boton" onClick={o.onAbrir}>
        {o.titulo}
      </button>
    ))

  return (
    <main className="bienvenida">
      {onVolver && (
        <div className="bienvenida-volver">
          <BotonIcono icono="atras" titulo="Volver" onClick={onVolver} />
        </div>
      )}
      <h1>{titulo}</h1>
      <div className="bienvenida-acciones">{botones(opciones)}</div>
      {secundarias && secundarias.length > 0 && (
        <>
          <hr className="bienvenida-separador" />
          <div className="bienvenida-acciones">{botones(secundarias)}</div>
        </>
      )}
    </main>
  )
}

export default Bienvenida
