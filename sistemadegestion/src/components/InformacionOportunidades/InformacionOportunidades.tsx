import { useEffect, useMemo, useState } from 'react'
import BarraProporcion from '../BarraProporcion/BarraProporcion'
import BarrasNivel from '../BarrasNivel/BarrasNivel'
import Leyenda from '../Leyenda/Leyenda'
import MapaCalor from '../MapaCalor/MapaCalor'
import NivelesPorGrupo from '../NivelesPorGrupo/NivelesPorGrupo'
import PanelVisual from '../PanelVisual/PanelVisual'
import TablaDestacados from '../TablaDestacados/TablaDestacados'
import TarjetaGrafica from '../TarjetaGrafica/TarjetaGrafica'
import TarjetaIndicador from '../TarjetaIndicador/TarjetaIndicador'
import { cargarCatalogosOportunidades, tablaOportunidades } from '../../services/oportunidades'
import { formatoFecha } from '../../utils/fecha'
import { porcentaje } from '../../utils/graficas'
import { calcularNivel } from '../../utils/nivel'
import {
  DIAS_AVISO,
  NIVELES_EO,
  contarCeldas,
  contarPorNivel,
  diasParaVencer,
  evaluar,
  estadoVigencia,
  masPrioritarias,
  porGrupo,
  segmentosSeguimiento,
  segmentosVigencia,
  tomada,
  totalBeneficios,
} from '../../utils/resumenOportunidades'
import type { CatalogosOportunidades, Oportunidad } from '../../types/oportunidades'
import './InformacionOportunidades.css'

type Props = {
  onVolver: () => void
  // Modo lectura: lo publicado; editor: su borrador
  publicados: boolean
}

const leyendaViabilidad = NIVELES_EO.map((n) => ({ etiqueta: n.etiqueta, color: `--nivel-${n.clave}` }))

// "vence en 12 días", "venció hace 3 días", "vence hoy"
function textoVigencia(vigencia: string | null, hoy: Date) {
  const dias = diasParaVencer(vigencia, hoy)
  if (dias === null) return 'NA'
  if (dias === 0) return `${formatoFecha(vigencia)} · vence hoy`
  if (dias < 0) return `${formatoFecha(vigencia)} · venció hace ${-dias} ${dias === -1 ? 'día' : 'días'}`
  return `${formatoFecha(vigencia)} · en ${dias} ${dias === 1 ? 'día' : 'días'}`
}

// Panorama de la Evaluación de Oportunidades: qué tan conveniente es abordarlas, de dónde surgen,
// cuántas ya se tomaron (folio) y cuáles están por vencer
function InformacionOportunidades({ onVolver, publicados }: Props) {
  const [ops, setOps] = useState<Oportunidad[] | null>(null)
  const [cat, setCat] = useState<CatalogosOportunidades | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enfoque, setEnfoque] = useState('')
  const [hoy] = useState(() => new Date())

  useEffect(() => {
    let vigente = true
    Promise.all([tablaOportunidades.listar(publicados), cargarCatalogosOportunidades()])
      .then(([o, c]) => {
        if (!vigente) return
        setOps(o)
        setCat(c)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [publicados])

  const todos = enfoque === ''

  const resumen = useMemo(() => {
    if (!ops || !cat) return null
    const evaluadas = evaluar(ops, cat.matriz, cat.evaluacion)
    const vistas = todos ? evaluadas : evaluadas.filter((e) => e.oportunidad.enfoque === enfoque)
    const niveles = contarPorNivel(vistas)
    const vigencias = segmentosVigencia(vistas, hoy)
    const conteoVigencia = (clave: string) => vigencias.find((v) => v.clave === clave)?.valor ?? 0
    const tomadas = vistas.filter((e) => tomada(e.oportunidad)).length
    return {
      total: vistas.length,
      beneficios: totalBeneficios(vistas),
      niveles,
      paraAbordar: niveles.prioritaria + niveles.destacada,
      tomadas,
      porVencer: conteoVigencia('porvencer'),
      vencidas: conteoVigencia('vencida'),
      celdas: contarCeldas(vistas),
      porEnfoque: porGrupo(evaluadas, cat.enfoques, (o) => o.enfoque),
      porOrigen: porGrupo(vistas, cat.origenes, (o) => o.origen),
      seguimiento: segmentosSeguimiento(vistas),
      vigencias,
      prioritarias: masPrioritarias(vistas, 8),
    }
  }, [ops, cat, enfoque, todos, hoy])

  return (
    <PanelVisual
      matriz="Evaluación de Oportunidades"
      onVolver={onVolver}
      publicados={publicados}
      filtro={{
        etiqueta: 'Enfoque',
        todos: 'Todos los enfoques',
        valor: enfoque,
        opciones: (cat?.enfoques ?? []).map((e) => ({ valor: e, etiqueta: `Enfoque ${e}` })),
        onChange: setEnfoque,
      }}
      error={error}
      cargando={!resumen}
      vacio={
        resumen?.total === 0
          ? todos
            ? 'Todavía no hay oportunidades registradas.'
            : `No hay oportunidades con enfoque ${enfoque}.`
          : null
      }
    >
      {resumen && cat && (
        <>
          <section className="panel-visual-indicadores" aria-label="Indicadores">
            <TarjetaIndicador
              etiqueta="Oportunidades registradas"
              valor={resumen.total}
              detalle={`con ${resumen.beneficios} beneficios esperados`}
            />
            <TarjetaIndicador
              etiqueta="Conviene abordar"
              valor={resumen.paraAbordar}
              detalle={`Prioritarias y Destacadas · ${porcentaje(resumen.paraAbordar, resumen.total)}%`}
              color="--nivel-prioritaria"
            />
            <TarjetaIndicador
              etiqueta="Tomadas"
              valor={resumen.tomadas}
              detalle={`con folio asignado · ${porcentaje(resumen.tomadas, resumen.total)}%`}
              color="--estado-bien"
            />
            <TarjetaIndicador
              etiqueta="Vigencia por atender"
              valor={resumen.porVencer + resumen.vencidas}
              detalle={`${resumen.porVencer} por vencer (${DIAS_AVISO} días) · ${resumen.vencidas} vencidas`}
              color="--estado-proceso"
            />
          </section>

          <div className="panel-visual-par">
            <TarjetaGrafica
              titulo="Matriz impacto × tiempo"
              descripcion="Arriba a la derecha: mayor beneficio en menos tiempo"
            >
              <MapaCalor
                ejeY={{ titulo: 'Impacto', escala: cat.impacto }}
                ejeX={{ titulo: 'Tiempo', escala: cat.tiempo }}
                nivel={(i, t) => calcularNivel(cat.matriz, cat.evaluacion, i, t)}
                conteo={(i, t) => resumen.celdas.get(`${i}-${t}`) ?? 0}
                singular="oportunidad"
                plural="oportunidades"
              />
            </TarjetaGrafica>
            <TarjetaGrafica titulo="Nivel de viabilidad" descripcion="Qué tan conveniente es abordar cada oportunidad">
              <BarrasNivel niveles={NIVELES_EO} conteo={resumen.niveles} total={resumen.total} />
            </TarjetaGrafica>
          </div>

          <div className="panel-visual-par">
            {todos && (
              <TarjetaGrafica
                titulo="Viabilidad por enfoque"
                descripcion="Clic en un enfoque para ver solo sus datos"
                extra={<Leyenda elementos={leyendaViabilidad} />}
              >
                <NivelesPorGrupo
                  niveles={NIVELES_EO}
                  filas={resumen.porEnfoque}
                  onElegir={setEnfoque}
                  textoVacio="Sin oportunidades"
                />
              </TarjetaGrafica>
            )}
            <TarjetaGrafica
              titulo="¿De dónde surgen?"
              descripcion="Oportunidades por origen y su viabilidad"
              className={todos ? undefined : 'informacion-oportunidades-ancha'}
              extra={todos ? undefined : <Leyenda elementos={leyendaViabilidad} />}
            >
              <NivelesPorGrupo niveles={NIVELES_EO} filas={resumen.porOrigen} textoVacio="—" />
            </TarjetaGrafica>
          </div>

          <div className="panel-visual-par panel-visual-par-ancho">
            <TarjetaGrafica titulo="Seguimiento" descripcion="Si ya se tomaron y cómo va su vigencia">
              <div className="panel-visual-bloques">
                <div>
                  <h3>Folio asignado</h3>
                  <BarraProporcion segmentos={resumen.seguimiento} total={resumen.total} />
                </div>
                <div>
                  <h3>Vigencia</h3>
                  <BarraProporcion segmentos={resumen.vigencias} total={resumen.total} />
                </div>
              </div>
            </TarjetaGrafica>
            <TarjetaGrafica
              titulo="Oportunidades por abordar"
              descripcion={`Las ${resumen.prioritarias.length} más convenientes según su clasificación`}
            >
              <TablaDestacados
                tituloNivel="Viabilidad"
                encabezados={['Oportunidad', 'Proceso', 'Folio', 'Vigencia']}
                filas={resumen.prioritarias.map(({ oportunidad: o, nivel }) => ({
                  id: o.id,
                  nivel,
                  celdas: [
                    <span key="oportunidad">
                      {o.oportunidad}
                      {o.beneficios.length > 0 && (
                        <small className="informacion-oportunidades-beneficios">
                          {o.beneficios.length} {o.beneficios.length === 1 ? 'beneficio' : 'beneficios'}:{' '}
                          {o.beneficios.join(' · ')}
                        </small>
                      )}
                    </span>,
                    o.proceso,
                    o.folio,
                    <span
                      key="vigencia"
                      className={`informacion-oportunidades-vigencia ${estadoVigencia(o.vigencia, hoy)}`}
                    >
                      {textoVigencia(o.vigencia, hoy)}
                    </span>,
                  ],
                }))}
              />
            </TarjetaGrafica>
          </div>
        </>
      )}
    </PanelVisual>
  )
}

export default InformacionOportunidades
