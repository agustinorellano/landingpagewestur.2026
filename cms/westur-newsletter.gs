const NEWSLETTER_SHEET_ID = '1EqRNCQxmr9oP50a5nV32ZOVDFcnK4VhnGLM8aRTMRMs';
const CMS_SHEET_ID = '1r4TA2P3vsq7oKnEQwApro6kTh58gia8h_lPJDVGw2CY';

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'newsletter')   return handleNewsletter(e.parameter.email || '');
  if (action === 'contacto')     return handleContacto(e.parameter);
  if (action === 'ofertaExpire') return handleOfertaExpire(e.parameter);

  // Sin action = solicitud de datos CMS
  const ss = SpreadsheetApp.openById(CMS_SHEET_ID);
  const data = {
    paquetes:         parseSheet(ss, 'Paquetes'),
    ofertas:          parseSheet(ss, 'Ofertas'),
    salidas_grupales: parseSheet(ss, 'Salidas Grupales'),
    circuitos:        parseSheet(ss, 'Circuitos'),
    cruceros:         parseSheet(ss, 'Cruceros'),
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
    h.toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
  );
  return rows.slice(1)
    .filter(row => (row[0] || '').toString().trim().toUpperCase() === 'SI')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? row[i].toString().trim() : '';
      });
      return obj;
    });
}

function driveUrlToImg(url) {
  if (!url) return '';
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w800`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w800`;
  const m3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return `https://drive.google.com/thumbnail?id=${m3[1]}&sz=w800`;
  return url;
}

function handleNewsletter(email) {
  try {
    if (!email || !email.includes('@') || !email.includes('.')) {
      return respond({ ok: false, error: 'Email inválido' });
    }

    const ss = SpreadsheetApp.openById(NEWSLETTER_SHEET_ID);
    let sheet = ss.getSheetByName('Suscriptores');

    if (!sheet) {
      sheet = ss.insertSheet('Suscriptores');
      const header = sheet.getRange(1, 1, 1, 3);
      header.setValues([['Email', 'Fecha', 'Fuente']]);
      header.setFontWeight('bold');
      sheet.setColumnWidth(1, 260);
      sheet.setColumnWidth(2, 180);
      sheet.setColumnWidth(3, 140);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existing = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      if (existing.includes(email)) {
        return respond({ ok: true, msg: 'Ya estás suscripto' });
      }
    }

    sheet.appendRow([email, new Date(), 'Landing Page']);
    return respond({ ok: true, msg: 'Suscripto correctamente' });

  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

function handleContacto(p) {
  try {
    const required = ['nombre', 'whatsapp', 'email', 'destino', 'pasajeros'];
    for (const f of required) {
      if (!p[f] || !p[f].trim()) return respond({ ok: false, error: 'Faltan campos requeridos' });
    }

    const ss = SpreadsheetApp.openById(NEWSLETTER_SHEET_ID);
    let sheet = ss.getSheetByName('Consultas');

    if (!sheet) {
      sheet = ss.insertSheet('Consultas');
      const cols = ['Nombre', 'WhatsApp', 'Email', 'Destino', 'Pasajeros', 'Cuándo', 'Mensaje', 'Fecha', 'Fuente'];
      const header = sheet.getRange(1, 1, 1, cols.length);
      header.setValues([cols]);
      header.setFontWeight('bold');
      sheet.setFrozenRows(1);
      [260, 160, 260, 140, 120, 140, 360, 180, 120].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
    }

    sheet.appendRow([
      p.nombre.trim(),
      p.whatsapp.trim(),
      p.email.trim(),
      p.destino,
      p.pasajeros,
      p.cuando || '',
      p.mensaje ? p.mensaje.trim() : '',
      new Date(),
      'Landing Page'
    ]);

    return respond({ ok: true, msg: 'Consulta recibida' });
  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

function handleOfertaExpire(p) {
  try {
    const titulo = (p.titulo || '').trim();
    if (!titulo) return respond({ ok: false, error: 'Falta titulo' });

    const ss = SpreadsheetApp.openById(CMS_SHEET_ID);
    const sheet = ss.getSheetByName('Ofertas');
    if (!sheet || sheet.getLastRow() < 2) return respond({ ok: false, error: 'Hoja Ofertas no encontrada' });

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h =>
      h.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')
    );
    const nombreIdx = headers.indexOf('nombre');
    const activoIdx = 0; // primera columna siempre es Activo

    if (nombreIdx < 0) return respond({ ok: false, error: 'Columna nombre no encontrada' });

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][nombreIdx].toString().trim() === titulo) {
        sheet.getRange(i + 2, activoIdx + 1).setValue('NO');
        return respond({ ok: true });
      }
    }

    return respond({ ok: false, error: 'Oferta no encontrada' });
  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

// Trigger diario — configurar en Apps Script:
// Extensiones → Apps Script → Triggers → Agregar trigger → checkExpiredOffers → Time-driven → Day timer
function checkExpiredOffers() {
  const ss = SpreadsheetApp.openById(CMS_SHEET_ID);
  const sheet = ss.getSheetByName('Ofertas');
  if (!sheet || sheet.getLastRow() < 2) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h =>
    h.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')
  );
  const deadlineIdx = ['deadline', 'vencimiento', 'fecha_vencimiento', 'fecha_limite'].map(k => headers.indexOf(k)).find(i => i >= 0);
  if (deadlineIdx === undefined) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const now = new Date();

  data.forEach((row, i) => {
    const activo = (row[0] || '').toString().trim().toUpperCase();
    if (activo !== 'SI') return;
    const dl = new Date(row[deadlineIdx]);
    if (!isNaN(dl) && dl < now) {
      sheet.getRange(i + 2, 1).setValue('NO');
    }
  });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
