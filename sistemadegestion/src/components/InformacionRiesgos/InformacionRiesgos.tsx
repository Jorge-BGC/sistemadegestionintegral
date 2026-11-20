import { useEffect, useMemo, useState } from 'react'
import BotonIcono from '../BotonIcono/BotonIcono'
import Alerta from '../Alerta/Alerta'
import { cargarDatosVisuales, listarTodosRiesgos } from '../../services/riesgos'
import type { Riesgo } from '../../types/riesgos'
import { calcularNivel, claseNivel } from '../../utils/nivel'
import './InformacionVisual.css'

type Props = {
  onVolver: () => void
  publicados: boolean
}

type DatosVisuales = Awaited<ReturnType<typeof cargarDatosVisuales>>

const PROCESOS = [
  'Manufactura EPS',
  'Entrega de Producto al Cliente',
  'Desarrollo Tecnológico',
  'Programación de la Cadena',
  'Comercialización EPS',
  'Generación de Valor Clientes',
  'TI',
  'Admon Proyectos',
  'Mantenimiento',
  'Cadena Suministro',
  'Capital Humano',
  'Administración Financiera',
  'MASH',
  'Gestión de Calidad',
  'Sustentabilidad & ESG',
]

const NIVELES = ['extremo', 'alto', 'importante', 'moderado', 'bajo'] as const
type NivelClave = (typeof NIVELES)[number]

const etiquetaNivel: Record<NivelClave, string> = {
  extremo: 'Extremo',
  alto: 'Alto',
  importante: 'Importante',
  moderado: 'Moderado',
  bajo: 'Bajo',
}

const claseEfectividad: Record<string, string> = {
  Efectivo: 'efectivo',
  'En Proceso': 'enproceso',
  'No Efectivo': 'noefectivo',
  'Sin evaluar': 'sinevaluar',
}

function nivelDe(riesgo: Riesgo, datos: DatosVisuales) {
  return calcularNivel(datos.matriz, datos.evaluacion, riesgo.severidad, riesgo.probabilidad)
}

function InformacionVisual({ onVolver, publicados }: Props) {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([])
  const [datos, setDatos] = useState<DatosVisuales | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    Promise.all([listarTodosRiesgos(publicados), cargarDatosVisuales()])
      .then(([registros, catalogos]) => {
        if (!vigente) return
        setRiesgos(registros)
        setDatos(catalogos)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [publicados])

  const resumen = useMemo(() => {
    if (!datos) return null
    const niveles = riesgos.reduce<Record<NivelClave, number>>(
      (total, riesgo) => {
        const nivel = nivelDe(riesgo, datos)
        if (nivel) {
          const clave = claseNivel(nivel.descripcion) as NivelClave
          if (NIVELES.includes(clave)) total[clave] += 1
        }
        return total
      },
      { extremo: 0, alto: 0, importante: 0, moderado: 0, bajo: 0 },
    )
    const controlesEfectivos = riesgos.filter((riesgo) => riesgo.efectividad === 'Efectivo').length
    const efectividad = ['Efectivo', 'En Proceso', 'No Efectivo', 'Sin evaluar'].map((nombre) => ({
      nombre,
      total:
        nombre === 'Sin evaluar'
          ? riesgos.filter((riesgo) => !riesgo.efectividad).length
          : riesgos.filter((riesgo) => riesgo.efectividad === nombre).length,
    }))
    const tipos = ['Integral', 'Calidad', 'Ambiental'].map((nombre) => ({
      nombre,
      total: riesgos.filter((riesgo) => riesgo.tipo_riesgo === nombre).length,
    }))
    const fuentes = [...new Set(riesgos.map((riesgo) => riesgo.fuente_actividad).filter(Boolean))]
      .map((fuente) => ({
        fuente,
        total: riesgos.filter((riesgo) => riesgo.fuente_actividad === fuente).length,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    const procesos = PROCESOS.map((proceso) => {
      const registros = riesgos.filter((riesgo) => riesgo.proceso === proceso)
      const peor = registros
        .map((riesgo) => ({ riesgo, nivel: nivelDe(riesgo, datos) }))
        .filter((item) => item.nivel)
        .sort((a, b) => (a.nivel?.valor ?? 26) - (b.nivel?.valor ?? 26))[0]
      return { proceso, total: registros.length, peor }
    })
    const porcentajeEfectividad = riesgos.length
      ? Math.round((controlesEfectivos / riesgos.length) * 100)
      : 0
    return { niveles, procesos, controlesEfectivos, porcentajeEfectividad, efectividad, tipos, fuentes }
  }, [datos, riesgos])

  const riesgosPrioritarios = useMemo(() => {
    if (!datos) return []
    return riesgos
      .map((riesgo) => ({ riesgo, nivel: nivelDe(riesgo, datos) }))
      .filter((item) => item.nivel)
      .sort((a, b) => (a.nivel?.valor ?? 26) - (b.nivel?.valor ?? 26))
      .slice(0, 5)
  }, [datos, riesgos])

  return (
    <main className="visual">
      <header className="visual-encabezado">
        <BotonIcono icono="atras" titulo="Volver" onClick={onVolver} />
        <div>
          <p className="visual-kicker">Matriz de riesgos</p>
          <h1>Información Visual</h1>
          <p className="visual-subtitulo">Panorama general de los riesgos por proceso</p>
        </div>
        <div className="visual-marca">SGI</div>
      </header>

      {error && (
        <Alerta>
          No se pudo cargar la información visual — {error}. ¿Ya ejecutaste el script SQL en Supabase?
        </Alerta>
      )}
      {!error && !resumen && <p className="visual-cargando">Cargando indicadores...</p>}

      {resumen && (
        <>
          <section className="visual-kpis" aria-label="Indicadores generales">
            <article className="visual-kpi visual-kpi-total">
              <span className="visual-kpi-icon">Σ</span>
              <div>
                <strong>{riesgos.length}</strong>
                <span>Riesgos registrados</span>
              </div>
            </article>
            <article className="visual-kpi visual-kpi-extremo">
              <span className="visual-kpi-icon">!</span>
              <div>
                <strong>{resumen.niveles.extremo}</strong>
                <span>Riesgos extremos</span>
              </div>
            </article>
            <article className="visual-kpi visual-kpi-alto">
              <span className="visual-kpi-icon">↑</span>
              <div>
                <strong>{resumen.niveles.alto}</strong>
                <span>Riesgos altos</span>
              </div>
            </article>
            <article className="visual-kpi visual-kpi-efectivo">
              <span className="visual-kpi-icon">✓</span>
              <div>
                <strong>{resumen.porcentajeEfectividad}%</strong>
                <span>Controles efectivos</span>
              </div>
            </article>
          </section>

          <section className="visual-grid visual-grid-principal">
            <article className="visual-card visual-distribucion">
              <div className="visual-card-titulo">
                <div>
                  <p className="visual-kicker">Lectura ejecutiva</p>
                  <h2>Distribución por nivel</h2>
                </div>
                <span className="visual-total">{riesgos.length} total</span>
              </div>
              <div className="visual-barras">
                {NIVELES.map((nivel) => {
                  const cantidad = resumen.niveles[nivel]
                  const porcentaje = riesgos.length ? Math.round((cantidad / riesgos.length) * 100) : 0
                  return (
                    <div className="visual-barra-fila" key={nivel}>
                      <span>{etiquetaNivel[nivel]}</span>
                      <div className="visual-barra-fondo">
                        <div
                          className={`visual-barra visual-${nivel}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <strong>{cantidad}</strong>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="visual-card visual-prioritarios">
              <div className="visual-card-titulo">
                <div>
                  <p className="visual-kicker">Atención inmediata</p>
                  <h2>Riesgos prioritarios</h2>
                </div>
              </div>
              {riesgosPrioritarios.length ? (
                <ol className="visual-lista-prioridad">
                  {riesgosPrioritarios.map(({ riesgo, nivel }) => (
                    <li key={riesgo.id}>
                      <span className={`visual-punto visual-${claseNivel(nivel!.descripcion)}`} />
                      <div>
                        <strong>{riesgo.evento_riesgo}</strong>
                        <span>{riesgo.proceso}</span>
                      </div>
                      <b>{nivel!.valor}</b>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="visual-vacio">No hay riesgos registrados todavía.</p>
              )}
            </article>
          </section>

          <section className="visual-card visual-procesos">
            <div className="visual-card-titulo">
              <div>
                <p className="visual-kicker">Cobertura completa</p>
                <h2>Riesgos por proceso</h2>
              </div>
              <span className="visual-total">{resumen.procesos.filter((p) => p.total > 0).length}/15 con datos</span>
            </div>
            <div className="visual-procesos-grid">
              {resumen.procesos.map(({ proceso, total, peor }) => (
                <article className="visual-proceso" key={proceso}>
                  <div className="visual-proceso-cabecera">
                    <strong>{proceso}</strong>
                    <span>{total}</span>
                  </div>
                  <div className="visual-proceso-barra">
                    <span style={{ width: `${riesgos.length ? Math.max((total / riesgos.length) * 100, total ? 3 : 0) : 0}%` }} />
                  </div>
                  <p>
                    {peor ? (
                      <>
                        Nivel máximo: <b className={`visual-texto-${claseNivel(peor.nivel!.descripcion)}`}>
                          {peor.nivel!.descripcion.split(':')[0]}
                        </b>
                      </>
                    ) : (
                      'Sin registros'
                    )}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="visual-insights-grid">
            <article className="visual-card visual-insight-card">
              <div className="visual-card-titulo">
                <div>
                  <p className="visual-kicker">Seguimiento</p>
                  <h2>Efectividad de controles</h2>
                </div>
              </div>
              <div className="visual-mini-barras">
                {resumen.efectividad.map(({ nombre, total }) => (
                  <div className="visual-mini-fila" key={nombre}>
                    <div className="visual-mini-label">
                      <span>{nombre}</span>
                      <strong>{total}</strong>
                    </div>
                    <div className="visual-barra-fondo">
                      <div
                        className={`visual-mini-barra visual-efectividad-${claseEfectividad[nombre]}`}
                        style={{ width: `${riesgos.length ? Math.max((total / riesgos.length) * 100, total ? 2 : 0) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="visual-card visual-insight-card">
              <div className="visual-card-titulo">
                <div>
                  <p className="visual-kicker">Composición</p>
                  <h2>Tipos de riesgo</h2>
                </div>
              </div>
              <div className="visual-tipos">
                {resumen.tipos.map(({ nombre, total }) => (
                  <div className="visual-tipo" key={nombre}>
                    <span className={`visual-tipo-icon visual-tipo-${nombre.toLowerCase()}`}>
                      {nombre.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{nombre}</strong>
                      <span>{total} registros</span>
                    </div>
                    <b>{riesgos.length ? Math.round((total / riesgos.length) * 100) : 0}%</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="visual-card visual-insight-card">
              <div className="visual-card-titulo">
                <div>
                  <p className="visual-kicker">Concentración</p>
                  <h2>Fuentes más frecuentes</h2>
                </div>
              </div>
              <ol className="visual-fuentes">
                {resumen.fuentes.map(({ fuente, total }) => (
                  <li key={fuente}>
                    <span>{fuente}</span>
                    <b>{total}</b>
                  </li>
                ))}
                {!resumen.fuentes.length && <li className="visual-fuentes-vacio">Sin fuentes registradas</li>}
              </ol>
            </article>
          </section>
        </>
      )}
    </main>
  )
}

export default InformacionVisual
