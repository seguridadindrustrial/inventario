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
  { categoria: 'Bebidas', items: BEBIDAS },
  { categoria: 'Cristalería y bar', items: CRISTALERIA },
  { categoria: 'Cubiertos', items: CUBIERTOS },
  { categoria: 'Otros', items: OTROS },
  { categoria: 'Productos de limpieza', items: LIMPIEZA },
  { categoria: 'Vajilla y bandejas', items: VAJILLA },
  { categoria: 'Vinos', items: VINOS }
];

export const CATEGORIAS_DANOS = [
  { categoria: 'Bebidas y vinos', items: [...BEBIDAS, ...VINOS].sort((a, b) => a.localeCompare(b, 'es')) },
  { categoria: 'Cristalería y bar', items: CRISTALERIA },
  { categoria: 'Cubiertos', items: CUBIERTOS },
  { categoria: 'Decoración', items: DECORACION },
  { categoria: 'Otros', items: OTROS },
  { categoria: 'Vajilla y bandejas', items: VAJILLA }
];

// Verificación de inventario: todas las categorías de ambas listas
// (Bebidas y vinos no se repite porque sus artículos ya están en Bebidas + Vinos).
export const CATEGORIAS_VERIFICACION = [
  { categoria: 'Bebidas', items: BEBIDAS },
  { categoria: 'Cristalería y bar', items: CRISTALERIA },
  { categoria: 'Cubiertos', items: CUBIERTOS },
  { categoria: 'Decoración', items: DECORACION },
  { categoria: 'Otros', items: OTROS },
  { categoria: 'Productos de limpieza', items: LIMPIEZA },
  { categoria: 'Vajilla y bandejas', items: VAJILLA },
  { categoria: 'Vinos', items: VINOS }
];

export const ZONAS = [
  'PISO 2',
  'SALA DE DEGUSTACIÓN'
];