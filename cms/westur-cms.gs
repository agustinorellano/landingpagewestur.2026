// Westur CMS — Google Apps Script
// Extensiones → Apps Script → pegar → Implementar → Aplicación web → Cualquiera

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
