/**
 * Inventario - Sistema de Pedidos y Reportes
 *
 * Este script convierte tu Google Sheets en un mini "servidor" gratuito.
 * - Guarda los pedidos y reportes en la hoja "Registros"
 * - Envia un email a los destinatarios configurados abajo (ADMIN_EMAILS)
 *
 * PASOS PARA USARLO:
 * 1. Crea una hoja de calculo en Google Sheets
 * 2. Menu: Extensiones > Apps Script
 * 3. Borra el contenido y pega TODO este codigo
 * 4. Configura la lista de emails en ADMIN_EMAILS (mas abajo)
 * 5. Guarda (Ctrl+S) y ejecuta la funcion "setup" una vez
 * 6. Pon el MISMO TOKEN en la variable TOKEN (abajo) y en frontend/.env como VITE_TOKEN
 * 7. Implementar > Nueva implementacion > Aplicacion web
 *    - Ejecutar como: Yo
 *    - Quien tiene acceso: Cualquier usuario
 *    - Dale a Implementar y acepta permisos
 * 8. Copia la URL (termina en /exec) y pegalo en frontend/src/config.js
 */

/* ============================================================
   CONFIGURACION - EDITA ESTO
   ============================================================ */
var ADMIN_EMAILS = [
  'carolinablanco8419@gmail.com',  // Primer correo destino
  'segundo-correo@gmail.com'       // Segundo correo destino (cambialo)
];

/* Hojas de la hoja de calculo.
   - Pedidos:   cada pedido
   - Daños:     cada reporte de equipo dañado
   - Registros: historial maestro que resume todo (+ estado)
   Las columnas las puedo ajustar cuando me des la lista exacta. */
var HOJA_PEDIDOS = 'Pedidos';
var HOJA_DANOS = 'Daños';
var HOJA_REGISTROS = 'Registros';

/* Columnas que se guardaran en cada hoja (encabezados).
   La foto NO se guarda en ninguna hoja: solo va adjunta al correo. */
var COL_PEDIDOS = ['fecha', 'id', 'usuario', 'usuario_email', 'productos', 'cantidad', 'destino', 'urgencia', 'notas', 'estado'];
var COL_DANOS = ['fecha', 'id', 'usuario', 'usuario_email', 'objeto', 'descripcion', 'estado'];
/* Registros es la union de todas las columnas (resumen), sin foto. */
var COL_REGISTROS = ['fecha', 'tipo', 'id', 'usuario', 'usuario_email', 'productos', 'cantidad', 'destino', 'urgencia', 'notas', 'objeto', 'descripcion', 'estado'];

/* ============================================================
   SEGURIDAD - TOKEN COMPARTIDO
   La app manda este token en cada peticion. Si el atacante no
   lo conoce, el script rechaza la llamada.
   Usa un valor largo y dificil de adivinar.
   DEBE ser igual al VITE_TOKEN en frontend/.env
   ============================================================ */
var TOKEN = '4ee89cf1a2116437b2d103f2387d96e02ac9caf6dfa766a9c0d876220b9d36b5';

/* Origenes permitidos (origen exacto desde donde se llama la app).
   Ajusta segun donde estes publicando (https o localhost). */
var ORIGENES_PERMITIDOS = [
  'https://inventario-omega-dusky.vercel.app',  // tu app en Vercel
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

/* ============================================================
   CONFIGURACION INICIAL (ejecutar 1 vez)
   ============================================================ */
function setup() {
  ensureSheet_(HOJA_PEDIDOS, COL_PEDIDOS);
  ensureSheet_(HOJA_DANOS, COL_DANOS);
  ensureSheet_(HOJA_REGISTROS, COL_REGISTROS);
  Logger.log('Listo. Revisa las hojas "' + HOJA_PEDIDOS + '", "' + HOJA_DANOS + '" y "' + HOJA_REGISTROS + '".');
}

/* ============================================================
   SEGURIDAD
   ============================================================ */
function tieneAcceso_(e) {
  // 1) Debe traer el token correcto
  var tokEnviado = (e && e.parameter && e.parameter.token) ||
                   (e && e.postData && e.postData.contents && extraerToken_(e.postData.contents));
  if (!tokEnviado || tokEnviado !== TOKEN) {
    return false;
  }

  // 2) El origen debe estar permitido (reduce abuso desde otros sitios)
  var origen = e && e.parameter && e.parameter.origen;
  if (origen && ORIGENES_PERMITIDOS.indexOf(origen) === -1) {
    return false;
  }

  return true;
}

function extraerToken_(json) {
  try {
    var p = JSON.parse(json);
    return p && p.token;
  } catch (err) {
    return null;
  }
}

/* ============================================================
   WEB APP - GET (leer historial)
   Se llama desde el frontend asi:
     GET https://script-url/exec?accion=listar&token=TU_TOKEN&origen=http...
   ============================================================ */
function doGet(e) {
  try {
    if (!tieneAcceso_(e)) {
      return jsonResponse_({ error: 'No autorizado' }, 403);
    }
    ensureSheet_(HOJA_PEDIDOS, COL_PEDIDOS);
    ensureSheet_(HOJA_DANOS, COL_DANOS);
    ensureSheet_(HOJA_REGISTROS, COL_REGISTROS);
    var registros = getSheetData_(HOJA_REGISTROS);
    return jsonResponse_({ registros: registros });
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

/* ============================================================
   WEB APP - POST (guardar pedido/reporte y enviar email)
   El frontend envia un JSON con:
   {
     accion: 'nuevo',
     tipo: 'pedido' | 'reporte',
     datos: { productos:[{producto,cantidad}], destino, urgencia, notas, [objeto, descripcion, foto] },
     usuario: { nombre, email, role }
   }
   ============================================================ */
function doPost(e) {
  try {
    if (!tieneAcceso_(e)) {
      return jsonResponse_({ error: 'No autorizado' }, 403);
    }
    ensureSheet_(HOJA_PEDIDOS, COL_PEDIDOS);
    ensureSheet_(HOJA_DANOS, COL_DANOS);
    ensureSheet_(HOJA_REGISTROS, COL_REGISTROS);

    var payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (!payload || payload.accion !== 'nuevo') {
      return jsonResponse_({ error: 'Accion no soportada' });
    }

    var tipo = payload.tipo;
    var datos = payload.datos || {};
    var usuario = payload.usuario || { nombre: 'Usuario', email: '', role: 'user' };
    var fecha = new Date().toISOString();

    // El id se calcula sobre la hoja de historial maestro (columna C = id)
    var id = nextId_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_REGISTROS), 3);

    // 1) Hoja dedicada (Pedidos o Daños)
    var hojaDedicada = tipo === 'pedido' ? HOJA_PEDIDOS : HOJA_DANOS;
    appendToSheet_(hojaDedicada, buildDedicatedRow_(tipo, id, fecha, datos, usuario));

    // 2) Hoja Registros (resumen maestro)
    appendToSheet_(HOJA_REGISTROS, buildRegistroRow_(tipo, id, fecha, datos, usuario));

    var enviado = tipo === 'pedido'
      ? sendPedidoEmail_(id, datos, usuario)
      : sendReporteEmail_(id, datos, usuario);

    return jsonResponse_({
      ok: true,
      id: id,
      tipo: tipo,
      emailEnviado: enviado,
      message: (tipo === 'pedido' ? 'Pedido' : 'Reporte') + ' guardado y notificado'
    });
  } catch (err) {
    Logger.log(err.stack || err);
    return jsonResponse_({ error: String(err) });
  }
}

/* ============================================================
   EMAILS
   ============================================================ */
function sendPedidoEmail_(id, d, usuario) {
  var subject = '[PEDIDO ' + (d.urgencia || 'normal').toUpperCase() + '] - ' + usuario.nombre;

  var rowsHtml = '';
  var total = 0;
  var lista = d.productos || [];
  for (var i = 0; i < lista.length; i++) {
    var p = lista[i];
    var cant = Number(p.cantidad) || 0;
    total += cant;
    rowsHtml += '<tr><td style="border:1px solid #ddd">' + (i + 1) + '</td>' +
      '<td style="border:1px solid #ddd">' + p.producto + '</td>' +
      '<td style="border:1px solid #ddd;text-align:center">' + cant + '</td></tr>';
  }

  var html = '' +
    '<h3>Productos (' + total + ' en total)</h3>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-family:Segoe UI,Arial,sans-serif">' +
    '<tr><th style="border:1px solid #ddd;background:#f8f9fa">#</th>' +
    '<th style="border:1px solid #ddd;background:#f8f9fa">Producto</th>' +
    '<th style="border:1px solid #ddd;background:#f8f9fa">Cantidad</th></tr>' +
    rowsHtml +
    '</table>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-family:Segoe UI,Arial,sans-serif">' +
    filaHtml_('De', usuario.nombre + ' (' + usuario.email + ')') +
    filaHtml_('Fecha', fechaLegible_(new Date())) +
    filaHtml_('Destino', d.destino || '-') +
    filaHtml_('Urgencia', d.urgencia || 'normal') +
    filaHtml_('Notas', d.notas || '-') +
    '</table>';

  return sendEmail_(subject, html);
}

function sendReporteEmail_(id, d, usuario) {
  var subject = '[REPORTE DE DANO] ' + (d.objeto || '') + ' - ' + usuario.nombre;
  var html = '' +
    '<h2>Nuevo Reporte de Daño</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-family:Segoe UI,Arial,sans-serif">' +
    filaHtml_('No.', String(id)) +
    filaHtml_('De', usuario.nombre + ' (' + usuario.email + ')') +
    filaHtml_('Objeto', d.objeto || '-') +
    filaHtml_('Descripcion', d.descripcion || '-') +
    filaHtml_('Fecha', fechaLegible_(new Date())) +
    '</table>';

  if (d.foto) {
    try {
      var imagen = Utilities.base64Decode(d.foto);
      var adjunto = Utilities.newBlob(imagen, 'image/jpeg', 'danio-' + id + '.jpg');
      return sendEmail_(subject, html, [adjunto]);
    } catch (err) {
      Logger.log('Foto no adjuntada: ' + err);
      return sendEmail_(subject, html);
    }
  }
  return sendEmail_(subject, html);
}

function sendEmail_(subject, html, adjuntos) {
  // Filtra emails validos para no intentar enviar a placeholders
  var destinos = ADMIN_EMAILS.filter(function (email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); });
  if (destinos.length === 0) {
    Logger.log('No hay emails validos configurados en ADMIN_EMAILS.');
    return false;
  }

  var opts = { htmlBody: html, name: 'Inventario' };
  if (adjuntos) opts.attachments = adjuntos;

  GmailApp.sendEmail(destinos, subject, '', opts);
  return true;
}

/* ============================================================
   UTILIDADES
   ============================================================ */
/* Construye la fila para la hoja dedicada (Pedidos o Daños). */
function buildDedicatedRow_(tipo, id, fecha, d, usuario) {
  if (tipo === 'pedido') {
    // COL_PEDIDOS: fecha, id, usuario, usuario_email, productos, cantidad, destino, urgencia, notas, estado
    var piezas = 0;
    var partes = [];
    var lista = d.productos || [];
    for (var i = 0; i < lista.length; i++) {
      var p = lista[i];
      var cant = Number(p.cantidad) || 0;
      piezas += cant;
      partes.push(p.producto + ' x' + cant);
    }
    return [
      fecha, id, usuario.nombre || '', usuario.email || '',
      partes.join(', '), piezas ? String(piezas) : '',
      d.destino || '', d.urgencia || 'normal', d.notas || '',
      'pendiente'
    ];
  }
  // COL_DANOS: fecha, id, usuario, usuario_email, objeto, descripcion, estado
  return [
    fecha, id, usuario.nombre || '', usuario.email || '',
    d.objeto || '', d.descripcion || '',
    'pendiente'
  ];
}

/* Construye la fila para la hoja Registros (resumen de todo). */
function buildRegistroRow_(tipo, id, fecha, d, usuario) {
  var productosTexto = '';
  var cantidadTotal = '';
  var objeto = '';
  var descripcion = '';
  if (tipo === 'pedido') {
    var lista = d.productos || [];
    var piezas = 0;
    var partes = [];
    for (var i = 0; i < lista.length; i++) {
      var p = lista[i];
      var cant = Number(p.cantidad) || 0;
      piezas += cant;
      partes.push(p.producto + ' x' + cant);
    }
    productosTexto = partes.join(', ');
    cantidadTotal = piezas ? String(piezas) : '';
  } else {
    objeto = d.objeto || '';
    descripcion = d.descripcion || '';
  }

  // COL_REGISTROS: fecha, tipo, id, usuario, usuario_email, productos, cantidad, destino, urgencia, notas, objeto, descripcion, estado
  return [
    fecha, tipo, id, usuario.nombre || '', usuario.email || '',
    productosTexto, cantidadTotal,
    d.destino || '', d.urgencia || 'normal', d.notas || '',
    objeto, descripcion,
    'pendiente'
  ];
}

function appendToSheet_(name, fila) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (sheet) {
    sheet.appendRow(fila);
  }
}

function nextId_(sheet, col) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { return 1; } // solo cabecera
  var values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < values.length; i++) {
    var v = parseInt(values[i][0], 10);
    if (!isNaN(v) && v > max) max = v;
  }
  return max + 1;
}

function getSheetData_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    // Convierte "Jarron x2, Alfombra x1" en un arreglo para el historial
    if (obj.tipo === 'pedido' && obj.productos) {
      obj.productos = String(obj.productos).split(/,\s*/).map(function (txt) {
        var m = txt.match(/^(.*?)\s*x(\d+)$/i);
        if (m) return { producto: m[1].trim(), cantidad: m[2] };
        return { producto: txt.trim(), cantidad: '1' };
      });
    }
    rows.push(obj);
  }
  return rows;
}

function ensureSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function filaHtml_(campo, valor) {
  return '<tr><td style="border:1px solid #ddd;background:#f8f9fa;font-weight:600">' + campo + '</td>' +
    '<td style="border:1px solid #ddd">' + valor + '</td></tr>';
}

function fechaLegible_(date) {
  return date.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
}

function jsonResponse_(obj, status) {
  var out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (status) {
    out.setStatusCode(status);
  }
  return out;
}