export interface Cover {
  src: string;
  alt: string;
  fuente: string;
  url_origen: string;
}

export interface Referencia {
  sitio: string;
  url: string;
}

export interface Libro {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  editorial: string;
  anio: number;
  edicion: string | null;
  paginas: number | null;
  tapa: "dura" | "blanda" | null;
  tema: string;
  codigoTema: string;
  isbn: string | null;
  idioma: string;
  precio: number;
  moneda: string;
  estado: string;
  descripcion: string;
  observaciones: string | null;
  cover: Cover | null;
  fotoReal: string | null;
  resumen: string | null;
  referencias: Referencia[];
  destacado: boolean;
  disponible: boolean;
}