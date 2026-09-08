// CATÁLOGO DE PRODUCTOS Y UBICACIONES
// ---------------------------------------------------------------
// Agrega, quita o edita nombres aquí. La app los mostrará en orden
// alfabético dentro de cada categoría, con buscador.
//
// Hay dos catálogos:
//   CATEGORIAS_PEDIDOS -> categorías del formulario de pedidos
//   CATEGORIAS_DANOS   -> categorías del formulario de reporte de daños
//
// Ejemplo de un bloque:
//   { categoria: 'Decoración', items: ['Jarrón', 'Alfombra'] }
// ---------------------------------------------------------------

const BEBIDAS = [
  'Agua Minalba',
  'Agua para máquina de café (sala de degustación)',
  'Agua Senda',
  'Agua Sparkling',
  'Coca Cola ligero',
  'Coca Cola normal',
  'Coca Cola sin calorías (nueva presentación)',
  'Louis Perdrier',
  'Máquina de café (sala de degustación)',
  'Panna',
  'Pepsi',
  'S.Pellegrino',
  'Soda'
];

const VINOS = [
  'Salentein',
  'Vino blanco Marqués de Cáceres',
  'Vino blanco Montés',
  'Vino tinto El Coto',
  'Vino tinto Santa Carolina'
];

const LIMPIEZA = [
  'Panitos de mano (baño degustación)',
  'Servilletas coctelera',
  'Servilletas de comensal',
  'Servilletas de tela (bandeja)'
];

const CRISTALERIA = [
  'Copa de agua',
  'Copa de vino blanco',
  'Copa de vino tinto',
  'Hielera',
  'Jarra de vidrio',
  'Kit de barra',
  'Plato hielera',
  'Shot',
  'Vasos cortos'
];

const VAJILLA = [
  'Bandeja pasa paletas blanca',
  'Bandeja pasa paletas verde',
  'Boul Miko borde azul',
  'Boul Miko marrón',
  'Boul verde ensaladera (pequeño)',
  'Conera',
  'Panera',
  'Plato de fondo',
  'Plato postre',
  'Plato principal',
  'Plato rectangular azul',
  'Tabla ajedrez'
];

const CUBIERTOS = [
  'Cucharilla postre',
  'Cucharilla sopa',
  'Cucharita café',
  'Cuchillo entrada',
  'Cuchillo mesa',
  'Cuchillo sierra',
  'Pinzas grandes',
  'Pinzas pequeñas',
  'Tenedor entrada',
  'Tenedor mesa'
];

const OTROS = [
  'Guantes',
  'Palitos de bambú',
  'Papel higiénico',
  'Pitillos',
  'Ramiki',
  'Soyeritas',
  'Tapabocas'
];

const DECORACION = [];

export const CATEGORIAS_PEDIDOS = [
  { categoria: 'Bebidas', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: BEBIDAS },
  { categoria: 'Cristalería y bar', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CRISTALERIA },
  { categoria: 'Cubiertos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CUBIERTOS },
  { categoria: 'Otros', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: OTROS },
  { categoria: 'Productos de limpieza', zonas: ['SALA DE DEGUSTACIÓN'], items: LIMPIEZA },
  { categoria: 'Vajilla y bandejas', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: VAJILLA },
  { categoria: 'Vinos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: VINOS }
];

export const CATEGORIAS_DANOS = [
  { categoria: 'Bebidas y vinos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: [...BEBIDAS, ...VINOS].sort((a, b) => a.localeCompare(b, 'es')) },
  { categoria: 'Cristalería y bar', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CRISTALERIA },
  { categoria: 'Cubiertos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CUBIERTOS },
  { categoria: 'Decoración', zonas: ['PISO 2'], items: DECORACION },
  { categoria: 'Otros', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: OTROS },
  { categoria: 'Vajilla y bandejas', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: VAJILLA }
];

// Verificación de inventario: todas las categorías de ambas listas
// (Bebidas y vinos no se repite porque sus artículos ya están en Bebidas + Vinos).
export const CATEGORIAS_VERIFICACION = [
  { categoria: 'Bebidas', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: BEBIDAS },
  { categoria: 'Cristalería y bar', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CRISTALERIA },
  { categoria: 'Cubiertos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: CUBIERTOS },
  { categoria: 'Decoración', zonas: ['PISO 2'], items: DECORACION },
  { categoria: 'Otros', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: OTROS },
  { categoria: 'Productos de limpieza', zonas: ['SALA DE DEGUSTACIÓN'], items: LIMPIEZA },
  { categoria: 'Vajilla y bandejas', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: VAJILLA },
  { categoria: 'Vinos', zonas: ['SALA DE DEGUSTACIÓN', 'PISO 2'], items: VINOS }
];

// Zonas disponibles. Las categorías se filtran por zona según el array `zonas`
// de cada categoría (una categoría puede estar en una o en ambas zonas).
export const ZONAS = [
  'PISO 2',
  'SALA DE DEGUSTACIÓN'
];

// Devuelve las categorías que tienen artículos y pertenecen a la zona elegida.
export function porZona(categorias, zona) {
  if (!zona) return [];
  return categorias.filter((g) => g.items.length > 0 && g.zonas.includes(zona));
}