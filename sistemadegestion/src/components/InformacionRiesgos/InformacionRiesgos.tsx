import { useEffect, useMemo, useState } from 'react'
import BarraProporcion from '../BarraProporcion/BarraProporcion'
import BarrasNivel from '../BarrasNivel/BarrasNivel'
import Leyenda from '../Leyenda/Leyenda'
import MapaCalor from '../MapaCalor/MapaCalor'
import NivelesPorGrupo from '../NivelesPorGrupo/NivelesPorGrupo'
import PanelVisual from '../PanelVisual/PanelVisual'
import SinValor from '../SinValor/SinValor'
import TablaDestacados from '../TablaDestacados/TablaDestacados'
import TarjetaGrafica from '../TarjetaGrafica/TarjetaGrafica'
import TarjetaIndicador from '../TarjetaIndicador/TarjetaIndicador'
import { PROCESOS_RIESGOS } from '../../config/matricesRiesgos'
import { cargarDatosVisuales, listarTodosRiesgos } from '../../services/riesgos'
import { porcentaje, segmentosEfectividad } from '../../utils/graficas'
import { calcularNivel } from '../../utils/nivel'
import { NIVELES, contarCeldas, contarPorNivel, evaluar, porProceso, prioritarios } from '../../utils/resumenRiesgos'
import type { Riesgo } from '../../types/riesgos'

type Props = {
  onVolver: () => void
  // Modo lectura: lo publicado; editor: su borrador
  publicados: boolean
}

type Datos = Awaited<ReturnType<typeof cargarDatosVisuales>>

// Panorama de la matriz de riesgos de todos los procesos (o de uno, con el filtro)
function InformacionRiesgos({ onVolver, publicados }: Props) {
  const [riesgos, setRiesgos] = useState<Riesgo[] | null>(null)
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [proceso, setProceso] = useState('')

  useEffect(() => {
    let vigente = true
    Promise.all([listarTodosRiesgos(publicados), cargarDatosVisuales()])
      .then(([r, d]) => {
        if (!vigente) return
        setRiesgos(r)
        setDatos(d)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [publicados])

  const todos = proceso === ''

  const resumen = useMemo(() => {
    if (!riesgos || !datos) return null
    const evaluados = evaluar(riesgos, datos.matriz, datos.evaluacion)
    const vistos = todos ? evaluados : evaluados.filter((e) => e.riesgo.proceso === proceso)
    const niveles = contarPorNivel(vistos)
    const efectividad = segmentosEfectividad(vistos.map((e) => e.riesgo.efectividad))
    const procesos = porProceso(evaluados, PROCESOS_RIESGOS)
    return {
      total: vistos.length,
      niveles,
      atencion: niveles.extremo + niveles.alto,
      efectividad,
      efectivos: efectividad[0].valor,
      sinEvaluar: efectividad[3].valor,
      celdas: contarCeldas(vistos),
      procesos,
      conRiesgos: procesos.filter((p) => p.total > 0).length,
      prioritarios: prioritarios(vistos, 8),
    }
  }, [riesgos, datos, proceso, todos])

  return (
    <PanelVisual
      matriz="Matriz de Riesgos"
      onVolver={onVolver}
      publicados={publicados}
      filtro={{
        etiqueta: 'Proceso',
        todos: 'Todos los procesos',
        valor: proceso,
        opciones: PROCESOS_RIESGOS.map((p) => ({ valor: p, etiqueta: p })),
        onChange: setProceso,
      }}
      error={error}
      cargando={!resumen}
      vacio={
        resumen?.total === 0
          ? todos
            ? 'Todavía no hay riesgos registrados.'
            : `${proceso} todavía no tiene riesgos registrados.`
          : null
      }
    >
      {resumen && datos && (
        <>
          <section className="panel-visual-indicadores" aria-label="Indicadores">
            <TarjetaIndicador
              etiqueta="Riesgos registrados"
              valor={resumen.total}
              detalle={todos ? `en ${resumen.conRiesgos} de ${PROCESOS_RIESGOS.length} procesos` : proceso}
            />
            <TarjetaIndicador
              etiqueta="Requieren atención"
              valor={resumen.atencion}
              detalle={`Extremo y Alto · ${porcentaje(resumen.atencion, resumen.total)}% del total`}
              color="--nivel-extremo"
            />
            <TarjetaIndicador
              etiqueta="Controles efectivos"
              valor={`${porcentaje(resumen.efectivos, resumen.total)}%`}
              detalle={`${resumen.efectivos} de ${resumen.total} riesgos`}
              color="--estado-bien"
            />
            <TarjetaIndicador
              etiqueta="Sin evaluar"
              valor={resumen.sinEvaluar}
              detalle="sin efectividad registrada"
              color="--estado-neutro"
            />
          </section>

          <div className="panel-visual-par">
            <TarjetaGrafica
              titulo="Mapa de calor"
              descripcion="Dónde se concentran los riesgos según su severidad y probabilidad"
            >
              <MapaCalor
                ejeY={{ titulo: 'Severidad', escala: datos.severidad }}
                ejeX={{ titulo: 'Probabilidad', escala: datos.probabilidad }}
                nivel={(s, p) => calcularNivel(datos.matriz, datos.evaluacion, s, p)}
                conteo={(s, p) => resumen.celdas.get(`${s}-${p}`) ?? 0}
                singular="riesgo"
                plural="riesgos"
              />
            </TarjetaGrafica>
            <TarjetaGrafica titulo="Distribución por nivel" descripcion="Cuántos riesgos hay en cada nivel">
              <BarrasNivel niveles={NIVELES} conteo={resumen.niveles} total={resumen.total} />
            </TarjetaGrafica>
          </div>

          {todos && (
            <TarjetaGrafica
              titulo="Riesgos por proceso"
              descripcion="Clic en un proceso para ver solo sus datos"
              extra={<Leyenda elementos={NIVELES.map((n) => ({ etiqueta: n.etiqueta, color: `--nivel-${n.clave}` }))} />}
            >
              <NivelesPorGrupo niveles={NIVELES} filas={resumen.procesos} onElegir={setProceso} textoVacio="Sin riesgos" />
            </TarjetaGrafica>
          )}

          <div className="panel-visual-par panel-visual-par-ancho">
            <TarjetaGrafica titulo="Efectividad de controles" descripcion="Estado del control de cada riesgo">
              <BarraProporcion segmentos={resumen.efectividad} total={resumen.total} />
            </TarjetaGrafica>
            <TarjetaGrafica titulo="Riesgos prioritarios" descripcion={`Los ${resumen.prioritarios.length} más graves`}>
              <TablaDestacados
                tituloNivel="Nivel"
                encabezados={todos ? ['Evento / Riesgo', 'Proceso', 'Efectividad'] : ['Evento / Riesgo', 'Efectividad']}
                filas={resumen.prioritarios.map(({ riesgo, nivel }) => ({
                  id: riesgo.id,
                  nivel,
                  celdas: [
                    riesgo.evento_riesgo,
                    ...(todos ? [riesgo.proceso] : []),
                    riesgo.efectividad ?? <SinValor key="efectividad" />,
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

export default InformacionRiesgos
