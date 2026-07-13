const NEWSLETTER_SHEET_ID = '1EqRNCQxmr9oP50a5nV32ZOVDFcnK4VhnGLM8aRTMRMs';

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'newsletter') {
    return handleNewsletter(e.parameter.email || '');
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

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
