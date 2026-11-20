// Tipos compartidos por las gráficas de la Información Visual (riesgos y aspectos)

// Una categoría con nombre: un nivel ("extremo" / "Extremo"), un estado, un tipo…
export type Categoria = {
  clave: string
  etiqueta: string
}

// Categoría con su color (variable CSS, p. ej. "--nivel-alto") y cuántos registros tiene
export type Segmento = Categoria & {
  color: string
  valor: number
}
