const NEWSLETTER_SHEET_ID = '1EqRNCQxmr9oP50a5nV32ZOVDFcnK4VhnGLM8aRTMRMs';
const CMS_SHEET_ID = '1r4TA2P3vsq7oKnEQwApro6kTh58gia8h_lPJDVGw2CY';

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'newsletter')   return handleNewsletter(e.parameter.email || '');
  if (action === 'contacto')     return handleContacto(e.parameter);
  if (action === 'ofertaExpire') return handleOfertaExpire(e.parameter);
  if (action === 'analytics')    return handleAnalytics(e.parameter);

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

function handleAnalytics(p) {
  try {
    const ss = SpreadsheetApp.openById(NEWSLETTER_SHEET_ID);
    let sheet = ss.getSheetByName('KPIs_Visitas');
    if (!sheet) {
      sheet = ss.insertSheet('KPIs_Visitas');
      const cols = ['Fecha', 'Tipo', 'Label', 'Seccion', 'Valor', 'Dispositivo', 'Referrer', 'Sesion'];
      const hdr = sheet.getRange(1, 1, 1, cols.length);
      hdr.setValues([cols]).setFontWeight('bold').setBackground('#1F4D3A').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      [160, 130, 280, 130, 80, 110, 190, 150].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
      ensureKpiSummary(ss);
    }
    sheet.appendRow([
      p.ts ? new Date(p.ts) : new Date(),
      (p.tipo   || '').substring(0, 40),
      (p.label  || '').substring(0, 120),
      (p.seccion|| '').substring(0, 60),
      p.valor ? (isNaN(Number(p.valor)) ? p.valor : Number(p.valor)) : '',
      (p.device || '').substring(0, 20),
      (p.ref    || '').substring(0, 120),
      (p.sid    || '').substring(0, 30)
    ]);
    return respond({ ok: true });
  } catch(err) {
    return respond({ ok: false, error: err.toString() });
  }
}

function ensureKpiSummary(ss) {
  if (ss.getSheetByName('KPIs')) return;
  const s = ss.insertSheet('KPIs', 0);

  // ── Título ──
  s.getRange('A1').setValue('KPIs — Westur Landing').setFontSize(16).setFontWeight('bold').setFontColor('#1F4D3A');
  s.getRange('A2').setValue('Los datos se actualizan en tiempo real desde la hoja KPIs_Visitas.').setFontColor('#888').setFontSize(9);

  // ── Col A-B: Visitas ──
  s.getRange('A4:B4').merge().setValue('VISITAS GENERALES').setFontWeight('bold').setBackground('#1F4D3A').setFontColor('#ffffff');
  s.getRange('A5').setValue('Sesiones unicas (visitantes)');
  s.getRange('B5').setFormula("=IFERROR(COUNTA(UNIQUE(FILTER(KPIs_Visitas!H2:H,KPIs_Visitas!B2:B=\"pageview\"))),0)").setHorizontalAlignment('center').setFontWeight('bold').setFontSize(13);
  s.getRange('A6').setValue('Visitas mobile');
  s.getRange('B6').setFormula("=IFERROR(COUNTIFS(KPIs_Visitas!B2:B,\"pageview\",KPIs_Visitas!F2:F,\"mobile\"),0)").setHorizontalAlignment('center');
  s.getRange('A7').setValue('Visitas desktop');
  s.getRange('B7').setFormula("=IFERROR(COUNTIFS(KPIs_Visitas!B2:B,\"pageview\",KPIs_Visitas!F2:F,\"desktop\"),0)").setHorizontalAlignment('center');

  // ── Col A-C: Paquetes mas vistos ──
  s.getRange('A10:C10').setValues([['PAQUETES MAS VISTOS','','']]).setBackground('#1F4D3A').setFontColor('#ffffff').setFontWeight('bold');
  s.getRange('A11').setFormula("=IFERROR(QUERY(KPIs_Visitas!A:H,\"SELECT C, D, COUNT(C) WHERE B = 'vista_card' GROUP BY C, D ORDER BY COUNT(C) DESC LIMIT 15 LABEL C 'Paquete', D 'Seccion', COUNT(C) 'Vistas'\",1),\"Sin datos aun\")");

  // ── Col A-B: Secciones con mas tiempo ──
  s.getRange('A28:B28').merge().setValue('TIEMPO EN SECCION (segundos acumulados)').setFontWeight('bold').setBackground('#1F4D3A').setFontColor('#ffffff');
  s.getRange('A29').setFormula("=IFERROR(QUERY(KPIs_Visitas!A:H,\"SELECT C, SUM(E) WHERE B = 'tiempo_seccion' GROUP BY C ORDER BY SUM(E) DESC LABEL C 'Seccion', SUM(E) 'Segundos'\",1),\"Sin datos aun\")");

  // ── Col E-F: Clics mas frecuentes ──
  s.getRange('E4:F4').merge().setValue('CLICS MAS FRECUENTES').setFontWeight('bold').setBackground('#1F4D3A').setFontColor('#ffffff');
  s.getRange('E5').setFormula("=IFERROR(QUERY(KPIs_Visitas!A:H,\"SELECT C, COUNT(C) WHERE B = 'click' GROUP BY C ORDER BY COUNT(C) DESC LIMIT 15 LABEL C 'Elemento', COUNT(C) 'Clics'\",1),\"Sin datos aun\")");

  // ── Col E-F: Fuentes de trafico ──
  s.getRange('E23:F23').merge().setValue('FUENTES DE TRAFICO').setFontWeight('bold').setBackground('#1F4D3A').setFontColor('#ffffff');
  s.getRange('E24').setFormula("=IFERROR(QUERY(KPIs_Visitas!A:H,\"SELECT G, COUNT(G) WHERE B = 'pageview' AND G != '' GROUP BY G ORDER BY COUNT(G) DESC LABEL G 'Fuente', COUNT(G) 'Visitas'\",1),\"Sin datos aun\")");

  // ── Col E-G: Modales abiertos ──
  s.getRange('E30:G30').setValues([['MODALES ABIERTOS (que consultas generan)','','']]).setBackground('#1F4D3A').setFontColor('#ffffff').setFontWeight('bold');
  s.getRange('E31').setFormula("=IFERROR(QUERY(KPIs_Visitas!A:H,\"SELECT C, D, COUNT(C) WHERE B = 'modal_open' GROUP BY C, D ORDER BY COUNT(C) DESC LIMIT 10 LABEL C 'Paquete', D 'Seccion', COUNT(C) 'Aperturas'\",1),\"Sin datos aun\")");

  // Anchos de columna
  [260, 110, 90, 26, 260, 90, 90].forEach((w, i) => s.setColumnWidth(i + 1, w));
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
