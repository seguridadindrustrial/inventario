// CATÁLOGO DE PRODUCTOS Y UBICACIONES
// ---------------------------------------------------------------
// Cada zona (SALA DE DEGUSTACIÓN / PISO 2) tiene su propio inventario.
// Agrega, quita o edita nombres aquí. La app los mostrará en orden
// alfabético dentro de cada categoría, con buscador.
//
// Estructura:
//   CATALOGO[zona] = {
//     pedidos:      [ { categoria, items } ]  para el formulario de pedidos
//     danos:        [ { categoria, items } ]  para reporte de daños
//     verificacion: [ { categoria, items } ]  para verificación de inventario
//   }
// ---------------------------------------------------------------

/* ===== SALA DE DEGUSTACIÓN ===== */
const BEBIDAS_SALA = [
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

const VINOS_SALA = [
  'Salentein',
  'Vino blanco Marqués de Cáceres',
  'Vino blanco Montés',
  'Vino tinto El Coto',
  'Vino tinto Santa Carolina'
];

const LIMPIEZA_SALA = [
  'Panitos de mano (baño degustación)',
  'Servilletas coctelera',
  'Servilletas de comensal',
  'Servilletas de tela (bandeja)'
];

const CRISTALERIA_SALA = [
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

const VAJILLA_SALA = [
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

const CUBIERTOS_SALA = [
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

const OTROS_SALA = [
  'Guantes',
  'Palitos de bambú',
  'Papel higiénico',
  'Pitillos',
  'Ramiki',
  'Soyeritas',
  'Tapabocas'
];

const DECORACION_SALA = [];

/* ===== PISO 2 ===== */
const LIMPIEZA_PISO2 = [
  'Aragán',
  'Bolsas blancas para papeleras',
  'Bolsas negras para papeleras medianas',
  'Coleto',
  'Escoba',
  'Esponjas doble uso',
  'Garrafa cloro',
  'Garrafa desinfectante',
  'Garrafa jabón de manos',
  'Garrafa jabón líquido',
  'Limpotex azul',
  'Limpotex rojo',
  'Pala',
  'Palitos amarillo',
  'Papel higiénico',
  'Pridex',
  'Secante',
  'Servilletas'
];

const BEBIDAS_PISO2 = [
  'Azúcar kilo',
  'Azúcar sobrecito',
  'Café en grano kilo',
  'Café en polvo kilo',
  'Leche completa',
  'Leche descremada',
  'Manzanilla',
  'Splenda',
  'Té durazno',
  'Té frutos rojos',
  'Té negro',
  'Té verde'
];

const CRISTALERIA_PISO2 = [
  'Vasos de café',
  'Vasos grandes'
];

const OTROS_PISO2 = [];

/* ===== CATÁLOGO POR ZONA ===== */
export const CATALOGO = {
  'SALA DE DEGUSTACIÓN': {
    pedidos: [
      { categoria: 'Bebidas', items: BEBIDAS_SALA },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_SALA },
      { categoria: 'Cubiertos', items: CUBIERTOS_SALA },
      { categoria: 'Otros', items: OTROS_SALA },
      { categoria: 'Productos de limpieza', items: LIMPIEZA_SALA },
      { categoria: 'Vajilla y bandejas', items: VAJILLA_SALA },
      { categoria: 'Vinos', items: VINOS_SALA }
    ],
    danos: [
      { categoria: 'Bebidas y vinos', items: [...BEBIDAS_SALA, ...VINOS_SALA].sort((a, b) => a.localeCompare(b, 'es')) },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_SALA },
      { categoria: 'Cubiertos', items: CUBIERTOS_SALA },
      { categoria: 'Decoración', items: DECORACION_SALA },
      { categoria: 'Otros', items: OTROS_SALA },
      { categoria: 'Vajilla y bandejas', items: VAJILLA_SALA }
    ],
    verificacion: [
      { categoria: 'Bebidas', items: BEBIDAS_SALA },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_SALA },
      { categoria: 'Cubiertos', items: CUBIERTOS_SALA },
      { categoria: 'Decoración', items: DECORACION_SALA },
      { categoria: 'Otros', items: OTROS_SALA },
      { categoria: 'Productos de limpieza', items: LIMPIEZA_SALA },
      { categoria: 'Vajilla y bandejas', items: VAJILLA_SALA },
      { categoria: 'Vinos', items: VINOS_SALA }
    ]
  },
  'PISO 2': {
    pedidos: [
      { categoria: 'Bebidas', items: BEBIDAS_PISO2 },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_PISO2 },
      { categoria: 'Otros', items: OTROS_PISO2 },
      { categoria: 'Productos de limpieza', items: LIMPIEZA_PISO2 }
    ],
    danos: [
      { categoria: 'Bebidas', items: BEBIDAS_PISO2 },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_PISO2 },
      { categoria: 'Otros', items: OTROS_PISO2 },
      { categoria: 'Productos de limpieza', items: LIMPIEZA_PISO2 }
    ],
    verificacion: [
      { categoria: 'Bebidas', items: BEBIDAS_PISO2 },
      { categoria: 'Cristalería y bar', items: CRISTALERIA_PISO2 },
      { categoria: 'Otros', items: OTROS_PISO2 },
      { categoria: 'Productos de limpieza', items: LIMPIEZA_PISO2 }
    ]
  }
};

// Zonas disponibles.
export const ZONAS = [
  'PISO 2',
  'SALA DE DEGUSTACIÓN'
];

// Devuelve las categorías (con artículos) de una zona para el tipo indicado:
// 'pedidos' | 'danos' | 'verificacion'
export function gruposDeZona(zona, tipo) {
  const z = CATALOGO[zona];
  if (!z || !z[tipo]) return [];
  return z[tipo].filter((g) => g.items.length > 0);
}