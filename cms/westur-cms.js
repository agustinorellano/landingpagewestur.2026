// Westur CMS Loader
// Reemplazá SCRIPT_URL con la URL que te da Apps Script al implementar

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz22HkdE0DdSqcN2eu4XhDoeRq2HMNDtAqp5gghHCg1C1qPGgqiDheP7VmuaNeT3wbb/exec';

const WA = 'https://wa.me/541140919506';
const waMsg = t => `${WA}?text=${encodeURIComponent(t)}`;

// ── Share HTML ────────────────────────────────────────────────────────────────

function shareHtml(nombre, descripcion, precio, seccion) {
  const n = nombre.replace(/'/g,"&#39;");
  const d = (descripcion||'').replace(/'/g,"&#39;");
  const p = (precio||'').replace(/'/g,"&#39;");
  const s = seccion;
  return `
  <div class="share-wrap">
    <button class="share-btn" onclick="openShareMenu(this)" aria-label="Compartir">
      <svg width="15" height="15"><use href="#ic-share"/></svg>
      Compartir
    </button>
    <div class="share-menu" role="menu">
      <button class="share-opt" onclick="shareVia('wa','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-wa"/></svg> WhatsApp
      </button>
      <button class="share-opt" onclick="shareVia('tg','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-tg"/></svg> Telegram
      </button>
      <button class="share-opt" onclick="shareVia('fb','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-fb"/></svg> Facebook
      </button>
      <button class="share-opt" onclick="shareVia('x','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-x"/></svg> X (Twitter)
      </button>
      <button class="share-opt" onclick="shareVia('email','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-mail"/></svg> Email
      </button>
      <div class="share-opt-sep"></div>
      <button class="share-opt" onclick="copyLink('${s}',this)">
        <svg width="15" height="15"><use href="#ic-copy"/></svg> Copiar enlace
      </button>
    </div>
  </div>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function driveToImg(url) {
  if (!url) return '';
  // /file/d/FILE_ID/
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w800`;
  // ?id=FILE_ID or &id=FILE_ID
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w800`;
  // /d/FILE_ID (lh3 or already converted)
  const m3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return `https://drive.google.com/thumbnail?id=${m3[1]}&sz=w800`;
  return url;
}

function imgOrPlaceholder(url, cls, label) {
  if (url && url.startsWith('http')) {
    return `<img src="${url}" alt="${label}" style="width:100%;height:100%;object-fit:cover;display:block">`;
  }
  return `<div class="card-img-bg ${cls}"><span class="pi-label">${label}</span></div>`;
}

function badgeClass(tipo) {
  const map = { cupos: 'urg-cupos', promo: 'urg-promo', hot: 'urg-hot' };
  return map[tipo] || 'urg-promo';
}

function countdownHtml(id, deadline) {
  if (!deadline) return '';
  return `
  <div class="countdown" id="cd-${id}" data-deadline="${deadline}T23:59:59">
    <span class="cd-label">Oferta vence en</span>
    <div class="cd-units">
      <div class="cd-block"><span class="cd-num" data-cd="d">--</span><span class="cd-unit">días</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" data-cd="h">--</span><span class="cd-unit">hs</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" data-cd="m">--</span><span class="cd-unit">min</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" data-cd="s">--</span><span class="cd-unit">seg</span></div>
    </div>
  </div>`;
}

// ── Renderizadores ────────────────────────────────────────────────────────────

function renderPaquetes(items) {
  const grid = document.querySelector('#paquetes .dest-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((p, i) => {
    const isFirst = i === 0;
    const imgH = isFirst ? '270px' : '210px';
    const span = isFirst ? 'grid-column:1/3' : '';
    const imgSrc = driveToImg(p.imagen_1);
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${p.nombre}" style="width:100%;height:${imgH};object-fit:cover;display:block">`
      : `<div class="card-img-bg pi-tk" style="height:${imgH}"><span class="pi-label">${p.destino || p.nombre}</span></div>`;

    const badgeHtml = p.badge
      ? `<span class="urg-badge ${badgeClass(p.tipo_badge)}">${p.badge}</span>` : '';

    const moneda = p.moneda || 'USD';
    const precio = p.precio ? `${moneda} ${Number(p.precio).toLocaleString('es-AR')}` : '';

    return `
    <div class="dest-card r" data-cat="${p.categoria || 'todos'}" style="${span}">
      <div class="card-img">
        ${imgHtml}
        <div class="img-ov"></div>
      </div>
      <div class="card-b">
        ${badgeHtml}
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ''}</p>
        <div class="card-foot">
          <div class="card-price">Desde <strong>${precio}</strong> p/p</div>
          <span class="card-dur">${p.duracion || ''}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <a href="${waMsg(`Hola! Me interesa el paquete ${p.nombre}.`)}" class="btn-dest" target="_blank" style="flex:1;min-width:120px">
            <svg width="15" height="15"><use href="#ic-wa"/></svg>
            Ver más
          </a>
          ${shareHtml(p.nombre, p.descripcion, precio ? `${precio} p/p` : '', 'paquetes')}
        </div>
      </div>
    </div>`;
  }).join('');

  // Re-iniciar reveal observer sobre las nuevas cards
  document.querySelectorAll('.dest-card.r:not(.v)').forEach(el => revealObs.observe(el));
}

function renderOfertas(items) {
  const grid = document.querySelector('#ofertas .promo-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((o, i) => {
    const imgHtml = o.imagen_1 && o.imagen_1.startsWith('http')
      ? `<img src="${o.imagen_1}" alt="${o.nombre}" style="width:100%;height:160px;object-fit:cover;display:block">`
      : `<div class="promo-img pi-pc">`;

    const moneda = o.moneda || 'USD';
    const precioNuevo = o.precio_nuevo ? `${moneda} ${Number(o.precio_nuevo).toLocaleString('es-AR')} p/p` : '';
    const precioOrig = o.precio_original ? `<span class="promo-old">${moneda} ${Number(o.precio_original).toLocaleString('es-AR')}</span>` : '';

    return `
    <div class="promo-card r">
      <div class="promo-img pi-pc" style="${o.imagen_1 ? `background-image:url(${driveToImg(o.imagen_1)});background-size:cover;background-position:center` : ''}">
        ${o.badge_urgencia ? `<span class="promo-urg">${o.badge_urgencia}</span>` : ''}
      </div>
      <div class="promo-b">
        <h3>${o.nombre}</h3>
        <p class="promo-det">${o.descripcion || ''}</p>
        <div class="promo-pr">
          ${precioOrig}
          <span class="promo-new">${precioNuevo}</span>
        </div>
        ${countdownHtml(`o${i}`, o.fecha_vencimiento)}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <a href="${waMsg(`Hola! Vi la oferta de ${o.nombre} y me interesa.`)}" class="btn-dest" target="_blank" style="flex:1;min-width:140px">
            <svg width="15" height="15"><use href="#ic-wa"/></svg>
            Quiero esta oferta
          </a>
          ${shareHtml(o.nombre, o.descripcion, precioNuevo, 'ofertas')}
        </div>
      </div>
    </div>`;
  }).join('');

  initCountdowns();
  document.querySelectorAll('#ofertas .promo-card.r').forEach(el => revealObs.observe(el));
}

function renderSalidas(items) {
  const list = document.querySelector('.salidas-list');
  if (!list || !items.length) return;

  list.innerHTML = items.map(s => {
    const cuposN = Number(s.cupos_disponibles) || 0;
    const esPocos = cuposN > 0 && cuposN <= 5;

    return `
    <div class="salida-row r">
      <div class="salida-fecha">
        <div class="salida-fecha-d">${s.dia || '--'}</div>
        <div class="salida-fecha-m">${s.mes || ''}</div>
      </div>
      <div class="salida-info">
        <h4>${s.destino}</h4>
        <p>${s.ruta || ''}</p>
      </div>
      <div class="salida-dur">${s.duracion || ''}</div>
      <div class="salida-cupos ${esPocos ? 'pocos' : ''}">
        <div class="salida-cupos-n">${cuposN || s.cupos_disponibles}</div>
        <div class="salida-cupos-l">cupos</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <a href="${waMsg(`Hola! Me interesa la salida grupal a ${s.destino}.`)}"
           class="btn-dest" target="_blank" style="width:auto;padding:10px 18px;white-space:nowrap">
          <svg width="14" height="14"><use href="#ic-wa"/></svg> Reservar
        </a>
        ${shareHtml(s.destino, s.ruta, s.precio ? `${s.moneda||'USD'} ${Number(s.precio).toLocaleString('es-AR')} p/p` : '', 'salidas-grupales')}
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('.salida-row.r').forEach(el => revealObs.observe(el));
}

function renderCircuitos(items) {
  const grid = document.querySelector('#circuitos .circ-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((c, i) => {
    const delay = i === 0 ? '' : i === 1 ? 'r1' : 'r2';
    const moneda = c.moneda || 'USD';
    const precio = c.precio ? `${moneda} ${Number(c.precio).toLocaleString('es-AR')}` : '';

    const rutaHtml = (c.ruta || '').split('·').map(r => r.trim()).filter(Boolean)
      .map((r, j) => j === 0 ? `<span>${r}</span>` : `<span class="circ-dot"></span><span>${r}</span>`)
      .join('');

    const bgStyle = c.imagen_1
      ? `style="background-image:url(${driveToImg(c.imagen_1)});background-size:cover;background-position:center"`
      : 'class="circ-img bg-grupales"';

    return `
    <div class="circ-card r ${delay}">
      <div class="circ-img" ${bgStyle}>
        ${c.badge ? `<span class="circ-badge">${c.badge}</span>` : ''}
      </div>
      <div class="circ-b">
        <div class="circ-route">${rutaHtml}</div>
        <h3>${c.nombre}</h3>
        <div class="circ-tags">
          ${c.duracion ? `<span class="circ-tag">${c.duracion}</span>` : ''}
          ${c.guia_incluido === 'SI' ? '<span class="circ-tag">Guía incluido</span>' : ''}
        </div>
        <div class="card-foot">
          <div class="card-price">Desde <strong>${precio}</strong> p/p</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          <a href="${waMsg(`Hola! Me interesa el circuito ${c.nombre}.`)}"
             class="btn-dest" target="_blank" style="flex:1;min-width:130px">
            <svg width="15" height="15"><use href="#ic-wa"/></svg>
            Ver itinerario
          </a>
          ${shareHtml(c.nombre, c.ruta, precio, 'circuitos')}
        </div>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('#circuitos .circ-card.r').forEach(el => revealObs.observe(el));
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function skeletonCard(featured) {
  const h = featured ? '270px' : '210px';
  const span = featured ? 'grid-column:1/3' : '';
  return `<div class="dest-card sk" style="${span}">
    <div class="sk-img" style="height:${h}"></div>
    <div class="card-b">
      <div class="sk-line w60"></div>
      <div class="sk-line w90" style="margin-top:8px"></div>
      <div class="sk-line w50" style="margin-top:6px"></div>
      <div class="sk-line w40" style="margin-top:14px"></div>
    </div>
  </div>`;
}

function showSkeletons() {
  const grid = document.querySelector('#paquetes .dest-grid');
  if (!grid) return;
  grid.innerHTML = [0,1,2,3].map(i => skeletonCard(i === 0)).join('');
}

// ── Cache ─────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'westur_cms_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

function applyData(data) {
  if (data.paquetes?.length)         renderPaquetes(data.paquetes);
  if (data.ofertas?.length)          renderOfertas(data.ofertas);
  if (data.salidas_grupales?.length) renderSalidas(data.salidas_grupales);
  if (data.circuitos?.length)        renderCircuitos(data.circuitos);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

let revealObs;

async function loadCMS() {
  if (!SCRIPT_URL || SCRIPT_URL.includes('PEGAR')) return;

  // 1. Mostrar skeleton mientras carga
  showSkeletons();

  // 2. Si hay cache válido, renderizar inmediatamente sin esperar
  const cached = getCache();
  if (cached) {
    applyData(cached);
  }

  // 3. Siempre buscar datos frescos en background
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    setCache(data);
    // Solo re-renderizar si los datos cambiaron
    if (JSON.stringify(data) !== JSON.stringify(cached)) {
      applyData(data);
    }
  } catch (e) {
    if (!cached) console.warn('Westur CMS: usando contenido estático.', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  revealObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('v');
  }), { threshold: 0.08 });

  loadCMS();
});
