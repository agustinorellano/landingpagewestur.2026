// Westur CMS — Google Apps Script
// Extensiones → Apps Script → pegar → Implementar → Aplicación web → Cualquiera

// ── Setup inicial: crea hojas Cruceros y Autos si no existen ─────────────────
// Correr UNA sola vez desde el editor: seleccioná agregarHojas y presioná ▶
function agregarHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // CRUCEROS
  let hC = ss.getSheetByName('Cruceros');
  if (!hC) hC = ss.insertSheet('Cruceros');
  if (hC.getLastRow() < 1) {
    hC.getRange(1,1,1,12).setValues([[
      'Activo','Nombre','Naviera','Ruta','Duración','Precio','Moneda','Fecha Salida','Categoria','Badge','Imagen 1','Imagen 2'
    ]]);
    hC.getRange(2,1,3,12).setValues([
      ['SI','MSC Crucero Mediterráneo','MSC Cruceros','Barcelona · Marsella · Génova · Roma · Nápoles','7 noches',1290,'USD','2026-09-10','mediterraneo','Más vendido','',''],
      ['SI','Costa Caribe Todo Incluido','Costa Cruceros','Miami · Nassau · Cozumel · Roatán · Cartagena','10 noches',1590,'USD','2026-10-05','caribe','Solo 8 cabinas','',''],
      ['SI','Fiordos Noruegos','Hurtigruten','Bergen · Flam · Geiranger · Alesund · Tromso','12 noches',2890,'USD','2026-08-20','noruego','Nuevo','',''],
    ]);
  }

  // AUTOS
  let hA = ss.getSheetByName('Autos');
  if (!hA) hA = ss.insertSheet('Autos');
  if (hA.getLastRow() < 1) {
    hA.getRange(1,1,1,9).setValues([[
      'Activo','Categoria','Marca Modelo','Destino','Precio Por Dia','Moneda','Incluye','Disponibilidad','Imagen 1'
    ]]);
    hA.getRange(2,1,4,9).setValues([
      ['SI','economico','Toyota Yaris / similar','Cancún',45,'USD','GPS · Seguro básico · 200 km/día','Todo el año',''],
      ['SI','intermedio','Chevrolet Cruze / similar','Miami',62,'USD','GPS · Seguro completo · km ilimitados','Todo el año',''],
      ['SI','suv','Ford Escape / similar','Bariloche',95,'USD','GPS · Seguro completo · km ilimitados · Portaequipajes','Sep – Mar',''],
      ['SI','premium','BMW Serie 3 / similar','Buenos Aires',110,'USD','GPS · Seguro completo · km ilimitados · Asistencia 24hs','Todo el año',''],
    ]);
  }

  SpreadsheetApp.getUi().alert('Hojas Cruceros y Autos listas.');
}


function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = {
    paquetes:        parseSheet(ss, 'Paquetes'),
    ofertas:         parseSheet(ss, 'Ofertas'),
    salidas_grupales:parseSheet(ss, 'Salidas Grupales'),
    circuitos:       parseSheet(ss, 'Circuitos'),
    cruceros:        parseSheet(ss, 'Cruceros'),
    autos:           parseSheet(ss, 'Autos'),
  };
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseSheet(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const headers = rows[0].map(h =>
    h.toString().trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  // quita tildes
      .replace(/\s+/g, '_')
  );

  return rows.slice(1)
    .filter(row => row[0].toString().trim().toUpperCase() === 'SI')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        // Convertir URL de Drive (compartir enlace) a URL directa de imagen
        if (h.startsWith('imagen') && typeof val === 'string' && val.includes('drive.google.com')) {
          val = driveUrlToImg(val);
        }
        // Formatear fechas como string
        if (val instanceof Date) {
          val = Utilities.formatDate(val, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
        }
        obj[h] = val;
      });
      return obj;
    });
}

// Convierte URL de "compartir" de Drive a URL directa de imagen
function driveUrlToImg(url) {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1];
  return url;
}
