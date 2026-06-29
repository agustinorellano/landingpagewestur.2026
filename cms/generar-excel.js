const ExcelJS = require('exceljs');
const path = require('path');

const VERDE = '1F4D3A';
const VERDE_CLARO = 'E8F0EC';
const BLANCO = 'FFFFFF';
const GRIS = 'F5F5F5';
const NARANJA = 'FFF3CD';

const sheets = [
  {
    name: 'Paquetes',
    headers: ['Activo','Nombre','Destino','Descripción','Precio','Moneda','Duración','Categoría','Badge','Tipo Badge','Fecha Límite','Imagen 1','Imagen 2','Imagen 3'],
    widths:  [10, 24, 18, 36, 12, 10, 14, 14, 28, 14, 16, 40, 40, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Moneda': 'USD o $ (pesos)',
      'Categoría': 'caribe / europa / nacional / cruceros',
      'Tipo Badge': 'cupos (amarillo) / promo (verde) / hot (rojo)',
      'Fecha Límite': 'Formato: AAAA-MM-DD\nEj: 2026-08-15\nActiva el contador regresivo',
      'Imagen 1': 'Pegar link de Google Drive (botón compartir)',
    },
    rows: [
      ['SI','Turquía & Grecia','Turquía','Historia, cultura y el mar más azul del mundo',2190,'USD','14 noches','europa','Alta demanda esta temporada','hot','2026-08-31','','',''],
      ['SI','Punta Cana','Punta Cana','Arena blanca, agua turquesa y relax total',1490,'USD','7 noches','caribe','Solo 4 cupos disponibles','cupos','2026-07-15','','',''],
      ['SI','Circuitos por Europa','Europa','Múltiples países, una sola experiencia inolvidable',3200,'USD','15-22 días','europa','Precio especial de temporada','promo','2026-08-15','','',''],
      ['SI','Patagonia Argentina','Patagonia','El sur que te cambia para siempre',850000,'$','8 noches','nacional','Solo 12 plazas · Próxima salida','cupos','','','',''],
      ['SI','Cruceros','Cruceros','El mundo en un barco. Todo incluido.',980,'USD','7-14 noches','cruceros','Financiación sin interés disponible','promo','','','',''],
      ['SI','Esteros del Iberá','Iberá','La naturaleza más salvaje de Argentina',320000,'$','4 noches','nacional','Temporada limitada','hot','','','',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'], 'Tipo Badge': ['"cupos,promo,hot"'], 'Categoría': ['"caribe,europa,nacional,cruceros"'] },
  },
  {
    name: 'Ofertas',
    headers: ['Activo','Nombre','Descripción','Precio Original','Precio Nuevo','Moneda','Fecha Vencimiento','Badge Urgencia','Imagen 1','Imagen 2','Imagen 3'],
    widths:  [10, 28, 36, 16, 14, 10, 18, 28, 40, 40, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Moneda': 'USD o $ (pesos)',
      'Fecha Vencimiento': 'Formato: AAAA-MM-DD\nActiva el contador regresivo',
    },
    rows: [
      ['SI','Punta Cana — 7 noches','Vuelo + Hotel Todo Incluido · Salida desde Buenos Aires',1890,1490,'USD','2026-07-15','Solo 4 cupos disponibles','','',''],
      ['SI','Patagonia Soñada — 8 noches','El Calafate + Ushuaia + Traslados incluidos','',850000,'$','2026-07-20','Solo 12 plazas disponibles','','',''],
      ['SI','Turquía & Grecia — 14 noches','Circuito completo · Guía en español incluido','',2190,'USD','2026-07-31','Alta demanda','','',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'] },
  },
  {
    name: 'Salidas Grupales',
    headers: ['Activo','Destino','Ruta','Dia','Mes','Duración','Cupos Totales','Cupos Disponibles','Precio','Moneda','Imagen 1','Imagen 2','Imagen 3'],
    widths:  [10, 22, 48, 8, 8, 14, 14, 18, 12, 10, 40, 40, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Ruta': 'Ciudades separadas por · (punto medio)',
      'Cupos Disponibles': '5 o menos → aparece en naranja en la web',
      'Moneda': 'USD o $ (pesos)',
    },
    rows: [
      ['SI','Turquía & Grecia','Estambul · Capadocia · Atenas · Santorini · Guía en español incluido',18,'Jul','14 noches',20,3,2190,'USD','','',''],
      ['SI','Europa Clásica','París · Roma · Barcelona · Amsterdam · Bus panorámico',2,'Ago','16 noches',24,8,3400,'USD','','',''],
      ['SI','Patagonia Soñada','El Calafate · Ushuaia · Torres del Paine · Traslados incluidos',15,'Ago','10 noches',16,12,850000,'$','','',''],
      ['SI','Israel & Jordania','Tel Aviv · Jerusalén · Mar Muerto · Petra · Tierra Santa',5,'Sep','12 noches',18,5,2890,'USD','','',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'] },
  },
  {
    name: 'Circuitos',
    headers: ['Activo','Nombre','Ruta','Duración','Precio','Moneda','Badge','Guia Incluido','Imagen 1','Imagen 2','Imagen 3'],
    widths:  [10, 24, 48, 14, 12, 10, 20, 14, 40, 40, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Ruta': 'Ciudades separadas por · (punto medio)',
      'Moneda': 'USD o $ (pesos)',
      'Guia Incluido': 'SI o NO',
    },
    rows: [
      ['SI','Turquía & Grecia','Estambul · Capadocia · Atenas · Santorini',14990,2190,'USD','Más vendido','SI','','',''],
      ['SI','Europa Clásica','París · Roma · Barcelona · Amsterdam','16 noches',3400,'USD','Alta demanda','SI','','',''],
      ['SI','Israel & Jordania','Tel Aviv · Jerusalén · Mar Muerto · Petra','12 noches',2890,'USD','Nuevo','SI','','',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'], 'Guia Incluido': ['"SI,NO"'] },
  },
  {
    name: 'Cruceros',
    headers: ['Activo','Nombre','Naviera','Ruta','Duración','Precio','Moneda','Fecha Salida','Categoria','Badge','Imagen 1','Imagen 2'],
    widths:  [10, 28, 18, 40, 14, 12, 10, 16, 16, 24, 40, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Ruta': 'Puertos separados por · (punto medio)',
      'Moneda': 'USD o $ (pesos)',
      'Fecha Salida': 'Formato: AAAA-MM-DD\nEj: 2026-09-10',
      'Categoria': 'mediterraneo / caribe / noruego / pacifico',
      'Imagen 1': 'Pegar link de Google Drive (botón compartir)',
    },
    rows: [
      ['SI','MSC Crucero Mediterráneo','MSC Cruceros','Barcelona · Marsella · Génova · Roma · Nápoles · Palermo','7 noches',1290,'USD','2026-09-10','mediterraneo','Más vendido','',''],
      ['SI','Costa Caribe Todo Incluido','Costa Cruceros','Miami · Nassau · Cozumel · Roatán · Cartagena','10 noches',1590,'USD','2026-10-05','caribe','Solo 8 cabinas','',''],
      ['SI','Fiordos Noruegos','Hurtigruten','Bergen · Flam · Geiranger · Alesund · Tromso','12 noches',2890,'USD','2026-08-20','noruego','Nuevo','',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'], 'Categoria': ['"mediterraneo,caribe,noruego,pacifico"'] },
  },
  {
    name: 'Autos',
    headers: ['Activo','Categoria','Marca Modelo','Destino','Precio Por Dia','Moneda','Incluye','Disponibilidad','Imagen 1'],
    widths:  [10, 16, 24, 22, 16, 10, 36, 20, 40],
    notas: {
      'Activo': 'SI = visible en la web\nNO = oculto',
      'Categoria': 'economico / intermedio / suv / premium',
      'Moneda': 'USD o $ (pesos)',
      'Incluye': 'Ej: GPS, Seguro básico, 200km/día',
      'Disponibilidad': 'Ej: Todo el año · Consultar fechas',
      'Imagen 1': 'Pegar link de Google Drive (botón compartir)',
    },
    rows: [
      ['SI','economico','Toyota Yaris / similar','Cancún',45,'USD','GPS · Seguro básico · 200 km/día','Todo el año',''],
      ['SI','intermedio','Chevrolet Cruze / similar','Miami',62,'USD','GPS · Seguro completo · km ilimitados','Todo el año',''],
      ['SI','suv','Ford Escape / similar','Bariloche',95,'USD','GPS · Seguro completo · km ilimitados · Portaequipajes','Sep – Mar',''],
      ['SI','premium','BMW Serie 3 / similar','Buenos Aires',110,'USD','GPS · Seguro completo · km ilimitados · Asistencia 24hs','Todo el año',''],
    ],
    dropdowns: { 'Activo': ['"SI,NO"'], 'Moneda': ['"USD,$"'], 'Categoria': ['"economico,intermedio,suv,premium"'] },
  },
];

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Westur Viajes';
  wb.created = new Date();

  for (const sheet of sheets) {
    const ws = wb.addWorksheet(sheet.name, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Encabezados
    ws.columns = sheet.headers.map((h, i) => ({
      header: h,
      key: h,
      width: sheet.widths[i] || 18,
    }));

    // Estilo encabezado
    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERDE } };
      cell.font = { bold: true, color: { argb: 'FF' + BLANCO }, size: 11, name: 'Calibri' };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF' + BLANCO } },
      };
    });

    // Notas en encabezados
    if (sheet.notas) {
      sheet.headers.forEach((h, i) => {
        if (sheet.notas[h]) {
          const cell = headerRow.getCell(i + 1);
          cell.note = sheet.notas[h];
        }
      });
    }

    // Filas de datos
    sheet.rows.forEach((rowData, ri) => {
      const row = ws.addRow(rowData);
      row.height = 22;
      const bgColor = ri % 2 === 0 ? BLANCO : GRIS;
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } };
        cell.font = { size: 10.5, name: 'Calibri' };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
        };
        // Activo = SI → verde claro
        if (colNum === 1) {
          const v = String(cell.value || '').toUpperCase();
          if (v === 'SI') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERDE_CLARO } };
            cell.font = { ...cell.font, bold: true, color: { argb: 'FF' + VERDE } };
          } else if (v === 'NO') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE8E6' } };
            cell.font = { ...cell.font, bold: true, color: { argb: 'FFC62828' } };
          }
        }
      });
    });

    // Dropdowns
    if (sheet.dropdowns) {
      const maxRows = 500;
      sheet.headers.forEach((h, colIdx) => {
        if (sheet.dropdowns[h]) {
          for (let r = 2; r <= maxRows; r++) {
            ws.getCell(r, colIdx + 1).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: sheet.dropdowns[h],
            };
          }
        }
      });
    }

    // Fila vacía de ejemplo al final para que sepan dónde agregar
    const emptyRow = ws.addRow(sheet.headers.map(() => ''));
    emptyRow.height = 22;
    emptyRow.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFDE7' } };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } } };
    });
    // Nota en primera celda de fila vacía
    emptyRow.getCell(1).value = '→ Agregar fila nueva aquí';
    emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' }, size: 10 };
  }

  const outPath = path.join(__dirname, 'Westur-CMS.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('Archivo creado:', outPath);
}

main().catch(console.error);
