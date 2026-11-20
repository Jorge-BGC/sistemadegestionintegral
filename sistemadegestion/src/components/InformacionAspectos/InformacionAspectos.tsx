import { useEffect, useMemo, useState } from 'react'
import BarraProporcion from '../BarraProporcion/BarraProporcion'
import BarrasConteo from '../BarrasConteo/BarrasConteo'
import BarrasNivel from '../BarrasNivel/BarrasNivel'
import Leyenda from '../Leyenda/Leyenda'
import MapaCalor from '../MapaCalor/MapaCalor'
import NivelesPorGrupo from '../NivelesPorGrupo/NivelesPorGrupo'
import PanelVisual from '../PanelVisual/PanelVisual'
import SinValor from '../SinValor/SinValor'
import TablaDestacados from '../TablaDestacados/TablaDestacados'
import TarjetaGrafica from '../TarjetaGrafica/TarjetaGrafica'
import TarjetaIndicador from '../TarjetaIndicador/TarjetaIndicador'
import { AREAS_ASPECTOS } from '../../config/aspectos'
import { cargarDatosVisualesAspectos, listarTodosAspectos } from '../../services/aspectos'
import type { AspectoConArea } from '../../services/aspectos'
import { porcentaje, segmentosEfectividad } from '../../utils/graficas'
import { calcularNivel } from '../../utils/nivel'
import {
  NIVELES_AIA,
  aspectosFrecuentes,
  contarCeldas,
  contarPorNivel,
  evaluar,
  masSignificativos,
  porArea,
  segmentosEstado,
  segmentosTipo,
} from '../../utils/resumenAspectos'

type Props = {
  onVolver: () => void
  // Modo lectura: lo publicado; editor: su borrador
  publicados: boolean
}

type Datos = Awaited<ReturnType<typeof cargarDatosVisualesAspectos>>

const nombreArea = (clave: string) => AREAS_ASPECTOS.find((a) => a.clave === clave)?.etiqueta ?? clave

// Panorama de la Matriz de Aspectos e Impactos Ambientales de todas las áreas (o de una, con el filtro)
function InformacionAspectos({ onVolver, publicados }: Props) {
  const [aspectos, setAspectos] = useState<AspectoConArea[] | null>(null)
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [area, setArea] = useState('')

  useEffect(() => {
    let vigente = true
    Promise.all([listarTodosAspectos(publicados), cargarDatosVisualesAspectos()])
      .then(([a, d]) => {
        if (!vigente) return
        setAspectos(a)
        setDatos(d)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [publicados])

  const todas = area === ''

  const resumen = useMemo(() => {
    if (!aspectos || !datos) return null
    const evaluados = evaluar(aspectos, datos.matriz, datos.evaluacion)
    const vistos = todas ? evaluados : evaluados.filter((e) => e.aspecto.area === area)
    const niveles = contarPorNivel(vistos)
    const areas = porArea(evaluados, AREAS_ASPECTOS)
    const tipos = segmentosTipo(vistos)
    return {
      total: vistos.length,
      niveles,
      significativos: niveles.critico + niveles.alto,
      beneficos: tipos.find((t) => t.clave === 'Benéfico')?.valor ?? 0,
      adversos: tipos.find((t) => t.clave === 'Adverso')?.valor ?? 0,
      conRiesgo: vistos.filter((e) => e.aspecto.riesgo_id !== null).length,
      tipos,
      estados: segmentosEstado(vistos),
      efectividad: segmentosEfectividad(vistos.map((e) => e.aspecto.efectividad)),
      celdas: contarCeldas(vistos),
      areas,
      conAspectos: areas.filter((a) => a.total > 0).length,
      frecuentes: aspectosFrecuentes(vistos, 6),
      destacados: masSignificativos(vistos, 8),
    }
  }, [aspectos, datos, area, todas])

  return (
    <PanelVisual
      matriz="Matriz de Aspectos e Impactos Ambientales"
      onVolver={onVolver}
      publicados={publicados}
      filtro={{
        etiqueta: 'Área',
        todos: 'Todas las áreas',
        valor: area,
        opciones: AREAS_ASPECTOS.map((a) => ({ valor: a.clave, etiqueta: a.etiqueta })),
        onChange: setArea,
      }}
      error={error}
      cargando={!resumen}
      vacio={
        resumen?.total === 0
          ? todas
            ? 'Todavía no hay aspectos registrados.'
            : `${nombreArea(area)} todavía no tiene aspectos registrados.`
          : null
      }
    >
      {resumen && datos && (
        <>
          <section className="panel-visual-indicadores" aria-label="Indicadores">
            <TarjetaIndicador
              etiqueta="Aspectos registrados"
              valor={resumen.total}
              detalle={todas ? `en ${resumen.conAspectos} de ${AREAS_ASPECTOS.length} áreas` : nombreArea(area)}
            />
            <TarjetaIndicador
              etiqueta="Significativos"
              valor={resumen.significativos}
              detalle={`Crítico y Alto · ${porcentaje(resumen.significativos, resumen.total)}% del total`}
              color="--nivel-critico"
            />
            <TarjetaIndicador
              etiqueta="Impactos benéficos"
              valor={resumen.beneficos}
              detalle={`frente a ${resumen.adversos} adversos`}
              color="--estado-bien"
            />
            <TarjetaIndicador
              etiqueta="Relacionados con un riesgo"
              valor={resumen.conRiesgo}
              detalle={`${porcentaje(resumen.conRiesgo, resumen.total)}% de los aspectos`}
              color="--accent"
            />
          </section>

          <div className="panel-visual-par">
            <TarjetaGrafica
              titulo="Mapa de calor"
              descripcion="Dónde se concentran los aspectos según su frecuencia y severidad"
            >
              <MapaCalor
                ejeY={{ titulo: 'Severidad', escala: datos.severidad }}
                ejeX={{ titulo: 'Frecuencia', escala: datos.frecuencia }}
                nivel={(s, f) => calcularNivel(datos.matriz, datos.evaluacion, f, s)}
                conteo={(s, f) => resumen.celdas.get(`${f}-${s}`) ?? 0}
                singular="aspecto"
                plural="aspectos"
              />
            </TarjetaGrafica>
            <TarjetaGrafica titulo="Distribución por significancia" descripcion="Cuántos aspectos hay en cada nivel">
              <BarrasNivel niveles={NIVELES_AIA} conteo={resumen.niveles} total={resumen.total} />
            </TarjetaGrafica>
          </div>

          {todas && (
            <TarjetaGrafica
              titulo="Aspectos por área"
              descripcion="Clic en un área para ver solo sus datos"
              extra={
                <Leyenda elementos={NIVELES_AIA.map((n) => ({ etiqueta: n.etiqueta, color: `--nivel-${n.clave}` }))} />
              }
            >
              <NivelesPorGrupo niveles={NIVELES_AIA} filas={resumen.areas} onElegir={setArea} textoVacio="Sin aspectos" />
            </TarjetaGrafica>
          )}

          <div className="panel-visual-par">
            <TarjetaGrafica titulo="Perfil de los aspectos" descripcion="Cómo se reparten los aspectos registrados">
              <div className="panel-visual-bloques">
                <div>
                  <h3>Tipo de impacto</h3>
                  <BarraProporcion segmentos={resumen.tipos} total={resumen.total} />
                </div>
                <div>
                  <h3>Estado del proceso</h3>
                  <BarraProporcion segmentos={resumen.estados} total={resumen.total} />
                </div>
                <div>
                  <h3>Efectividad de controles</h3>
                  <BarraProporcion segmentos={resumen.efectividad} total={resumen.total} />
                </div>
              </div>
            </TarjetaGrafica>
            <TarjetaGrafica titulo="Aspectos más frecuentes" descripcion="Los que más se repiten en la matriz">
              <BarrasConteo elementos={resumen.frecuentes} />
            </TarjetaGrafica>
          </div>

          <TarjetaGrafica
            titulo="Aspectos más significativos"
            descripcion={`Los ${resumen.destacados.length} de mayor significancia`}
          >
            <TablaDestacados
              tituloNivel="Significancia"
              encabezados={[
                'Aspecto ambiental',
                'Actividad / Evento',
                ...(todas ? ['Área'] : []),
                'Riesgo relacionado',
              ]}
              filas={resumen.destacados.map(({ aspecto, nivel }) => ({
                id: aspecto.id,
                nivel,
                celdas: [
                  aspecto.aspecto,
                  <span key="actividad">
                    <b>{aspecto.actividad_principal}</b>: {aspecto.actividad_sub}
                  </span>,
                  ...(todas ? [nombreArea(aspecto.area)] : []),
                  aspecto.riesgo_id !== null ? `N. ${aspecto.riesgo_id}` : <SinValor key="riesgo" />,
                ],
              }))}
            />
          </TarjetaGrafica>
        </>
      )}
    </PanelVisual>
  )
}

export default InformacionAspectos
