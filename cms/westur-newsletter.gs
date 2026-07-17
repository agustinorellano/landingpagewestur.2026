const NEWSLETTER_SHEET_ID = '1EqRNCQxmr9oP50a5nV32ZOVDFcnK4VhnGLM8aRTMRMs';

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'newsletter') {
    return handleNewsletter(e.parameter.email || '');
  }

  if (action === 'contacto') {
    return handleContacto(e.parameter);
  }

  return respond({ ok: false, error: 'Acción no reconocida' });
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

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
