import { lazy, Suspense, useEffect, useState } from 'react'
import BarraSesion from './components/BarraSesion/BarraSesion'
import Bienvenida from './components/Bienvenida/Bienvenida'
import Confirmacion from './components/Confirmacion/Confirmacion'
import InicioSesion from './components/InicioSesion/InicioSesion'
import PanelRegistros from './components/PanelRegistros/PanelRegistros'
import { MATRICES_ASPECTOS, type MatrizAspectos } from './config/aspectos'
import { moduloOportunidades } from './config/oportunidades'
import { MATRICES_RIESGOS, type MatrizRiesgos } from './config/matricesRiesgos'
import { usePublicacion } from './hooks/usePublicacion'
import { useSesion } from './hooks/useSesion'
import { cerrarSesion } from './services/sesion'

// Los paneles de Información Visual se descargan solo cuando alguien los abre (aligera la carga inicial)
const InformacionRiesgos = lazy(() => import('./components/InformacionRiesgos/InformacionRiesgos'))
const InformacionAspectos = lazy(() => import('./components/InformacionAspectos/InformacionAspectos'))
const InformacionOportunidades = lazy(() => import('./components/InformacionOportunidades/InformacionOportunidades'))

// Menús: inicio → riesgos / oportunidades / ambiental (submenús, con Información Visual al final)
type Vista =
  | 'inicio'
  | 'riesgos'
  | 'informacion'
  | 'informacion_aspectos'
  | 'oportunidades_menu'
  | 'oportunidades'
  | 'informacion_oportunidades'
  | 'ambiental'
  | MatrizRiesgos
  | MatrizAspectos

const esMatrizRiesgos = (v: Vista): v is MatrizRiesgos => v in MATRICES_RIESGOS
const esMatrizAspectos = (v: Vista): v is MatrizAspectos => v in MATRICES_ASPECTOS

// Acceso discreto de editores: tusitio/#editar abre el formulario de inicio de sesión.
// Con "#" funciona en cualquier hosting sin configurar redirecciones.
const HASH_EDITAR = '#editar'
const pideAcceso = () => window.location.hash === HASH_EDITAR

function quitarHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}

function App() {
  const [vista, setVista] = useState<Vista>('inicio')
  const ir = (v: Vista) => () => setVista(v)
  const { editor } = useSesion()
  const publicacion = usePublicacion(editor)
  const [acceso, setAcceso] = useState(pideAcceso)

  // Con sesión, la barra fija del editor ocupa la esquina superior: las pantallas bajan para no quedar debajo
  useEffect(() => {
    document.body.classList.toggle('con-sesion', editor !== null)
  }, [editor])

  // Por si se escribe #editar con la página ya abierta
  useEffect(() => {
    const revisar = () => setAcceso(pideAcceso())
    window.addEventListener('hashchange', revisar)
    return () => window.removeEventListener('hashchange', revisar)
  }, [])

  function cerrarAcceso() {
    quitarHash()
    setAcceso(false)
  }

  function pantalla() {
    const editable = editor !== null

    if (esMatrizRiesgos(vista)) {
      const { titulo, modulo } = MATRICES_RIESGOS[vista]
      return (
        <PanelRegistros
          key={vista}
          titulo={titulo}
          modulo={modulo}
          onVolver={ir('riesgos')}
          editable={editable}
          onCambio={publicacion.revisar}
        />
      )
    }

    if (esMatrizAspectos(vista)) {
      const { titulo, modulo } = MATRICES_ASPECTOS[vista]
      return (
        <PanelRegistros
          key={vista}
          titulo={titulo}
          modulo={modulo}
          onVolver={ir('ambiental')}
          editable={editable}
          onCambio={publicacion.revisar}
        />
      )
    }

    switch (vista) {
      case 'informacion':
        return <InformacionRiesgos onVolver={ir('riesgos')} publicados={!editable} />
      case 'riesgos':
        return (
          <Bienvenida
            titulo="Matriz de Riesgos"
            onVolver={ir('inicio')}
            opciones={(Object.keys(MATRICES_RIESGOS) as MatrizRiesgos[]).map((v) => ({
              titulo: MATRICES_RIESGOS[v].titulo,
              onAbrir: ir(v),
            }))}
            secundarias={[{ titulo: 'Información Visual', onAbrir: ir('informacion') }]}
          />
        )
      case 'ambiental':
        return (
          <Bienvenida
            titulo="Matriz de Aspectos e Impactos Ambientales"
            onVolver={ir('inicio')}
            opciones={(Object.keys(MATRICES_ASPECTOS) as MatrizAspectos[]).map((v) => ({
              titulo: MATRICES_ASPECTOS[v].titulo,
              onAbrir: ir(v),
            }))}
            secundarias={[{ titulo: 'Información Visual', onAbrir: ir('informacion_aspectos') }]}
          />
        )
      case 'informacion_aspectos':
        return <InformacionAspectos onVolver={ir('ambiental')} publicados={!editable} />
      case 'oportunidades_menu':
        return (
          <Bienvenida
            titulo="Evaluación de Oportunidades"
            onVolver={ir('inicio')}
            opciones={[{ titulo: 'Tabla', onAbrir: ir('oportunidades') }]}
            secundarias={[{ titulo: 'Información Visual', onAbrir: ir('informacion_oportunidades') }]}
          />
        )
      case 'informacion_oportunidades':
        return <InformacionOportunidades onVolver={ir('oportunidades_menu')} publicados={!editable} />
      case 'oportunidades':
        return (
          <PanelRegistros
            key={vista}
            titulo="Evaluación de Oportunidades"
            modulo={moduloOportunidades}
            onVolver={ir('oportunidades_menu')}
            editable={editable}
            onCambio={publicacion.revisar}
          />
        )
      default:
        return (
          <Bienvenida
            titulo="Sistema de Gestión Integral"
            opciones={[
              { titulo: 'Matriz de Riesgos', onAbrir: ir('riesgos') },
              { titulo: 'Evaluación de Oportunidades', onAbrir: ir('oportunidades_menu') },
              { titulo: 'Matriz de Aspectos e Impactos Ambientales', onAbrir: ir('ambiental') },
            ]}
          />
        )
    }
  }

  return (
    <>
      <Suspense fallback={<p className="cargando-pantalla">Cargando…</p>}>{pantalla()}</Suspense>
      {editor && (
        <BarraSesion
          editor={editor}
          pendiente={publicacion.pendiente}
          publicando={publicacion.publicando}
          error={publicacion.error}
          onPublicar={publicacion.pedirPublicar}
          onCerrarSesion={cerrarSesion}
        />
      )}
      {editor && publicacion.confirmando && (
        <Confirmacion
          titulo="Publicar cambios"
          mensaje="Los cambios que hiciste serán visibles para todos en el modo lectura. ¿Quieres publicarlos?"
          confirmar="Publicar"
          onConfirmar={publicacion.publicar}
          onCancelar={publicacion.cancelarPublicar}
        />
      )}
      {acceso && !editor && <InicioSesion onListo={cerrarAcceso} onCerrar={cerrarAcceso} />}
    </>
  )
}

export default App
