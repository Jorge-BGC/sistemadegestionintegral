import ActividadAspecto from '../components/ActividadAspecto/ActividadAspecto'
import CampoActividad from '../components/CampoActividad/CampoActividad'
import CampoOpciones from '../components/CampoOpciones/CampoOpciones'
import CampoSelect from '../components/CampoSelect/CampoSelect'
import ListaItems from '../components/ListaItems/ListaItems'
import NivelRiesgo from '../components/NivelRiesgo/NivelRiesgo'
import SinValor from '../components/SinValor/SinValor'
import { camposDe, verEscala } from './campos'
import { cargarCatalogosAspectos, tablaAspectos } from '../services/aspectos'
import type { AreaAspectos } from '../services/aspectos'
import {
  aBorradorAspecto,
  aDatosAspecto,
  borradorAspectoVacio,
  faltantesAspecto,
} from '../utils/borradorAspecto'
import { aNumero } from '../utils/lista'
import { calcularNivel } from '../utils/nivel'
import type { Columna, Modulo, OpcionConTipo } from '../types/registros'
import type {
  AspectoAmbiental,
  AspectoAmbientalInput,
  BorradorAspecto,
  CatalogosAspectos,
} from '../types/aspectos'

const ESTADOS = ['Normal', 'Anormal', 'Emergencia']
const REAL_POTENCIAL = ['Real', 'Potencial']
const EFECTIVIDADES = ['Efectivo', 'No Efectivo', 'En Proceso']

const campo = camposDe<BorradorAspecto, CatalogosAspectos>()

// Significancia: cruce F×S en matriz_aia y su rango en evaluacion_aia
const significancia = (cat: CatalogosAspectos, f: number | null, s: number | null) => (
  <NivelRiesgo nivel={calcularNivel(cat.matriz, cat.evaluacion, f, s)} />
)

const opcional = (v: string | null) => v ?? <SinValor />

// Aspectos e impactos se muestran agrupados: primero los adversos, luego los benéficos
const GRUPOS: Record<string, string> = { Adverso: 'Adversos', 'Benéfico': 'Benéficos' }
const agrupar = (os: OpcionConTipo[]) =>
  os
    .map((o) => ({ valor: o.nombre, etiqueta: o.nombre, grupo: GRUPOS[o.tipo ?? ''] ?? 'Sin clasificar' }))
    .sort((a, b) => Object.values(GRUPOS).indexOf(a.grupo) - Object.values(GRUPOS).indexOf(b.grupo))

const tipoDe = (os: OpcionConTipo[], nombre: string) => os.find((o) => o.nombre === nombre)?.tipo ?? ''

// Proceso con que nace una fila nueva: el fijo, o la primera opción del interruptor
const procesoInicial = ({ procesos }: AreaAspectos) =>
  'fijo' in procesos ? procesos.fijo : 'opciones' in procesos ? procesos.opciones[0] : ''

function editarProceso({ procesos }: AreaAspectos): Columna<AspectoAmbiental, BorradorAspecto, CatalogosAspectos>['editar'] {
  if ('fijo' in procesos) return (b) => b.proceso
  if ('opciones' in procesos) {
    return (b, cambiar) => (
      <CampoOpciones
        valor={b.proceso}
        opciones={procesos.opciones}
        onChange={(v) => cambiar('proceso', v)}
        etiqueta="Proceso"
      />
    )
  }
  return campo.seleccion('proceso', 'Proceso', (cat) => cat.procesos)
}

// Matriz de aspectos de un área: sus procesos, su catálogo de actividades y los riesgos
// de su matriz de riesgos que se pueden relacionar
export const crearModuloAspectos = (
  area: AreaAspectos,
): Modulo<AspectoAmbiental, AspectoAmbientalInput, BorradorAspecto, CatalogosAspectos> => ({
  nombre: 'aspecto',
  textoVacio: 'No hay aspectos ambientales registrados. Usa el botón + para agregar uno.',
  ...tablaAspectos(area),
  cargarCatalogos: (publicados) => cargarCatalogosAspectos(area, publicados),
  vacio: () => ({
    ...borradorAspectoVacio(),
    proceso: procesoInicial(area),
  }),
  aBorrador: aBorradorAspecto,
  aDatos: aDatosAspecto,
  faltantes: faltantesAspecto,
  confirmarBorrado: (a) => `¿Borrar el aspecto N. ${a.id} (${a.aspecto})?`,
  sugerencias: () => [],
  grupos: [
    {
      titulo: 'Identificación',
      columnas: [
        {
          titulo: 'N.',
          className: 'centro col-n',
          ver: (a) => a.id,
          editar: () => <SinValor />,
        },
        {
          titulo: 'Proceso',
          className: 'col-media',
          ver: (a) => a.proceso,
          // Fijo: solo se muestra · opciones: interruptor · tabla: lista desplegable
          editar: editarProceso(area),
        },
        {
          titulo: 'Actividad/Evento',
          className: 'col-larga',
          ver: (a, cat) => (
            <ActividadAspecto
              principal={a.actividad_principal}
              sub={a.actividad_sub}
              riesgoId={a.riesgo_id}
              riesgos={cat.riesgos}
            />
          ),
          // Sin texto libre: se elige en el modal (principal → sub → riesgo opcional)
          editar: (b, cambiar, cat) => (
            <CampoActividad
              valor={{ principal: b.actividad_principal, sub: b.actividad_sub, riesgoId: b.riesgo_id }}
              actividades={cat.actividades}
              riesgos={cat.riesgos}
              areaRiesgos={area.procesoRiesgos}
              onChange={(e) => {
                cambiar('actividad_principal', e.principal)
                cambiar('actividad_sub', e.sub)
                cambiar('riesgo_id', e.riesgoId)
              }}
            />
          ),
        },
        {
          titulo: 'Estado del proceso (normal, anormal, emergencia)',
          className: 'centro col-corta',
          ver: (a) => opcional(a.estado_proceso),
          editar: campo.seleccion('estado_proceso', 'Estado del proceso', () => ESTADOS),
        },
        {
          titulo: 'Aspecto ambiental (causa)',
          className: 'col-media',
          ver: (a) => a.aspecto,
          // El aspecto define el tipo de impacto; si el impacto elegido ya no coincide, se limpia
          editar: (b, cambiar, cat) => (
            <CampoSelect
              valor={b.aspecto}
              opciones={agrupar(cat.aspectos)}
              etiqueta="Aspecto ambiental (causa)"
              onChange={(v) => {
                const tipo = tipoDe(cat.aspectos, v)
                cambiar('aspecto', v)
                cambiar('tipo_impacto', tipo)
                if (b.impacto && tipoDe(cat.impactos, b.impacto) !== tipo) cambiar('impacto', '')
              }}
            />
          ),
        },
        {
          titulo: '¿El aspecto es real o potencial?',
          className: 'centro col-corta',
          ver: (a) => opcional(a.real_potencial),
          editar: campo.seleccion('real_potencial', '¿El aspecto es real o potencial?', () => REAL_POTENCIAL),
        },
        {
          titulo: 'Impacto ambiental (consecuencia)',
          className: 'col-media',
          ver: (a) => a.impacto,
          // Solo los impactos del mismo tipo que el aspecto
          editar: (b, cambiar, cat) => (
            <CampoSelect
              valor={b.impacto}
              opciones={agrupar(cat.impactos.filter((i) => i.tipo === b.tipo_impacto))}
              etiqueta="Impacto ambiental (consecuencia)"
              deshabilitado={!b.tipo_impacto}
              vacio={b.tipo_impacto ? '—' : 'Elige primero el aspecto'}
              onChange={(v) => cambiar('impacto', v)}
            />
          ),
        },
        {
          titulo: 'Tipo de impacto (benéfico/adverso)',
          className: 'centro col-corta',
          ver: (a) => opcional(a.tipo_impacto),
          // Automático: lo decide el aspecto elegido
          editar: (b) => (b.tipo_impacto ? <span title="Según el aspecto elegido">{b.tipo_impacto}</span> : <SinValor />),
        },
      ],
    },
    {
      titulo: 'Análisis',
      columnas: [
        {
          titulo: 'F',
          className: 'centro col-escala',
          ver: (a, cat) => verEscala(cat.frecuencia, a.frecuencia),
          editar: campo.escala('frecuencia', 'Frecuencia de ocurrencia', (cat) => cat.frecuencia),
        },
        {
          titulo: 'S',
          className: 'centro col-escala',
          ver: (a, cat) => verEscala(cat.severidad, a.severidad),
          editar: campo.escala('severidad', 'Severidad', (cat) => cat.severidad),
        },
        {
          titulo: 'Significancia',
          className: 'col-nivel',
          ver: (a, cat) => significancia(cat, a.frecuencia, a.severidad),
          editar: (b, _cambiar, cat) => significancia(cat, aNumero(b.frecuencia), aNumero(b.severidad)),
        },
      ],
    },
    {
      titulo: 'Tratamiento',
      columnas: [
        {
          titulo: 'Controles operacionales (actuales) y otras medidas aplicadas',
          className: 'col-larga',
          ver: (a) => <ListaItems items={a.controles} />,
          editar: campo.texto('controles', 'Controles operacionales', {
            placeholder: 'Separa los controles con comas',
          }),
        },
        {
          titulo: 'Folio',
          className: 'centro col-corta',
          ver: (a) => a.folio,
          editar: campo.texto('folio', 'Folio'),
        },
        {
          titulo: 'Efectividad',
          className: 'centro col-corta',
          ver: (a) => opcional(a.efectividad),
          editar: campo.seleccion('efectividad', 'Efectividad', () => EFECTIVIDADES),
        },
      ],
    },
  ],
})

// Manufactura de EPS: sus actividades y los riesgos de la matriz "Manufactura EPS"
export const moduloAspectosMeps = crearModuloAspectos({
  clave: 'meps',
  procesos: { tabla: 'procesos_aia_meps' },
  actividades: 'actividad_aia_meps',
  procesoRiesgos: 'Manufactura EPS',
})

// Gestión de Capital Humano: sus actividades y los riesgos de la matriz "Capital Humano"
export const moduloAspectosGch = crearModuloAspectos({
  clave: 'gch',
  procesos: { tabla: 'procesos_aia_gch' },
  actividades: 'actividad_aia_gch',
  procesoRiesgos: 'Capital Humano',
})

// Gestión de Calidad: proceso fijo, sus actividades y los riesgos de la matriz "Gestión de Calidad"
export const moduloAspectosGc = crearModuloAspectos({
  clave: 'gc',
  procesos: { fijo: 'Gestión de Calidad' },
  actividades: 'actividad_aia_gc',
  procesoRiesgos: 'Gestión de Calidad',
})

// Entrega de Producto al Cliente: sus procesos, actividades y los riesgos de la matriz del mismo nombre
export const moduloAspectosEpc = crearModuloAspectos({
  clave: 'epc',
  procesos: { tabla: 'procesos_aia_epc' },
  actividades: 'actividad_aia_epc',
  procesoRiesgos: 'Entrega de Producto al Cliente',
})

// Programación de la Cadena Productiva: proceso con interruptor (Altamira por defecto)
// y los riesgos de la matriz "Programación de la Cadena"
export const moduloAspectosPcp = crearModuloAspectos({
  clave: 'pcp',
  procesos: {
    opciones: ['Programación de la Cadena Productiva (Altamira)', 'Programación de la Cadena Productiva (CDMX)'],
  },
  actividades: 'actividad_aia_pcp',
  procesoRiesgos: 'Programación de la Cadena',
})

// Comercialización de EPS: proceso fijo y los riesgos de la matriz "Comercialización EPS"
export const moduloAspectosCeps = crearModuloAspectos({
  clave: 'ceps',
  procesos: { fijo: 'Comercialización de Poliestireno expandible (CDMX)' },
  actividades: 'actividad_aia_ceps',
  procesoRiesgos: 'Comercialización EPS',
})

// Administración Financiera: proceso con interruptor (Altamira por defecto)
// y los riesgos de la matriz "Administración Financiera"
export const moduloAspectosAf = crearModuloAspectos({
  clave: 'af',
  procesos: { opciones: ['Administración Financiera (Altamira)', 'Administración Financiera (CDMX)'] },
  actividades: 'actividad_aia_af',
  procesoRiesgos: 'Administración Financiera',
})

// MASH: sus procesos, actividades y los riesgos de la matriz "MASH"
export const moduloAspectosMash = crearModuloAspectos({
  clave: 'mash',
  procesos: { tabla: 'procesos_aia_mash' },
  actividades: 'actividad_aia_mash',
  procesoRiesgos: 'MASH',
})

// Desarrollo Tecnológico: sus procesos, actividades y los riesgos de la matriz del mismo nombre
export const moduloAspectosDt = crearModuloAspectos({
  clave: 'dt',
  procesos: { tabla: 'procesos_aia_dt' },
  actividades: 'actividad_aia_dt',
  procesoRiesgos: 'Desarrollo Tecnológico',
})

// Admon Proyectos: proceso fijo y los riesgos de la matriz "Admon Proyectos"
export const moduloAspectosAp = crearModuloAspectos({
  clave: 'ap',
  procesos: { fijo: 'Proyectos (Altamira)' },
  actividades: 'actividad_aia_ap',
  procesoRiesgos: 'Admon Proyectos',
})

// Cadena de Suministro: sus procesos, actividades y los riesgos de la matriz "Cadena Suministro"
// (así, sin "de", está en procesos_riesgos)
export const moduloAspectosCs = crearModuloAspectos({
  clave: 'cs',
  procesos: { tabla: 'procesos_aia_cs' },
  actividades: 'actividad_aia_cs',
  procesoRiesgos: 'Cadena Suministro',
})

// Mantenimiento: proceso fijo y los riesgos de la matriz "Mantenimiento"
export const moduloAspectosM = crearModuloAspectos({
  clave: 'm',
  procesos: { fijo: 'Mantenimiento' },
  actividades: 'actividad_aia_m',
  procesoRiesgos: 'Mantenimiento',
})

// TI: proceso con interruptor (Altamira por defecto) y los riesgos de la matriz "TI"
export const moduloAspectosTi = crearModuloAspectos({
  clave: 'ti',
  procesos: { opciones: ['Tecnologías de la Información (Altamira)', 'Tecnologías de la Información (CDMX)'] },
  actividades: 'actividad_aia_ti',
  procesoRiesgos: 'TI',
})

// Sustentabilidad & ESG: proceso fijo y los riesgos de la matriz "Sustentabilidad & ESG"
export const moduloAspectosSesg = crearModuloAspectos({
  clave: 'sesg',
  procesos: { fijo: 'Sustentabilidad & ESG (CDMX)' },
  actividades: 'actividad_aia_sesg',
  procesoRiesgos: 'Sustentabilidad & ESG',
})

// Generación de Valor a Clientes: proceso con interruptor (Altamira por defecto)
// y los riesgos de la matriz "Generación de Valor Clientes"
export const moduloAspectosGvc = crearModuloAspectos({
  clave: 'gvc',
  procesos: {
    opciones: ['Generación de Valor a Clientes (Altamira)', 'Generación de Valor a Clientes (CDMX)'],
  },
  actividades: 'actividad_aia_gvc',
  procesoRiesgos: 'Generación de Valor Clientes',
})

// Botones del menú "Matriz de Aspectos e Impactos Ambientales": uno por área
// area: debe ser la misma "clave" con que se creó su módulo
export const MATRICES_ASPECTOS = {
  aspectos_meps: { titulo: 'Manufactura de EPS', area: 'meps', modulo: moduloAspectosMeps },
  aspectos_gch: { titulo: 'Gestión de Capital Humano', area: 'gch', modulo: moduloAspectosGch },
  aspectos_gc: { titulo: 'Gestión de Calidad', area: 'gc', modulo: moduloAspectosGc },
  aspectos_epc: { titulo: 'Entrega de Producto al Cliente', area: 'epc', modulo: moduloAspectosEpc },
  aspectos_pcp: { titulo: 'Programación de la Cadena Productiva', area: 'pcp', modulo: moduloAspectosPcp },
  aspectos_ceps: { titulo: 'Comercialización de EPS', area: 'ceps', modulo: moduloAspectosCeps },
  aspectos_af: { titulo: 'Administración Financiera', area: 'af', modulo: moduloAspectosAf },
  aspectos_mash: { titulo: 'MASH', area: 'mash', modulo: moduloAspectosMash },
  aspectos_dt: { titulo: 'Desarrollo Tecnológico', area: 'dt', modulo: moduloAspectosDt },
  aspectos_ap: { titulo: 'Admon Proyectos', area: 'ap', modulo: moduloAspectosAp },
  aspectos_cs: { titulo: 'Cadena de Suministro', area: 'cs', modulo: moduloAspectosCs },
  aspectos_m: { titulo: 'Mantenimiento', area: 'm', modulo: moduloAspectosM },
  aspectos_ti: { titulo: 'TI', area: 'ti', modulo: moduloAspectosTi },
  aspectos_sesg: { titulo: 'Sustentabilidad & ESG', area: 'sesg', modulo: moduloAspectosSesg },
  aspectos_gvc: { titulo: 'Generación de Valor a Clientes', area: 'gvc', modulo: moduloAspectosGvc },
}

export type MatrizAspectos = keyof typeof MATRICES_ASPECTOS

// Áreas en el orden del menú (para la Información Visual): clave de la columna "area" y su nombre
export const AREAS_ASPECTOS = Object.values(MATRICES_ASPECTOS).map((m) => ({ clave: m.area, etiqueta: m.titulo }))
