// Westur CMS Loader
// Reemplazá SCRIPT_URL con la URL que te da Apps Script al implementar

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwO6L1gbsFrSujp_f8_WZOkuwCw-CrXpUtHC4sAugR-aDrv_cC9-k_E1A_UIoydS931/exec';

const WA = 'https://wa.me/541140919506';
const waMsg = t => `${WA}?text=${encodeURIComponent(t)}`;

function buildWaMsg(tipo, datos = {}) {
  const url = window.location.href.split('#')[0];
  const { nombre, descripcion, precio, moneda, duracion, fecha, ruta } = datos;
  const precioStr = precio ? `\nPrecio desde: ${moneda || 'USD'} ${Number(precio).toLocaleString('es-AR')}` : '';
  const fechaStr = fecha ? `\nFecha de salida: ${fecha}` : '';
  const rutaStr = ruta ? `\nRuta: ${ruta}` : '';
  const durStr = duracion ? `\nDuracion: ${duracion}` : '';
  const urlStr = `\nReferencia: ${url}`;

  const plantillas = {
    paquete: `Hola, estoy interesado en el paquete ${nombre}${durStr}${precioStr}${urlStr}\n\n¿Podrian brindarme mas informacion sobre disponibilidad, fechas y formas de pago?\n\nMuchas gracias.`,
    oferta:  `Hola, quisiera consultar por la oferta ${nombre}${precioStr}${urlStr}\n\n¿Podrian enviarme mas informacion sobre esta promocion?\n\nMuchas gracias.`,
    salida:  `Hola, estoy interesado en la salida grupal a ${nombre}${rutaStr}${fechaStr}${precioStr}${urlStr}\n\nQuisiera conocer los proximos cupos disponibles y que servicios incluye.\n\nMuchas gracias.`,
    circuito:`Hola, quisiera recibir informacion sobre el circuito ${nombre}${rutaStr}${durStr}${precioStr}${urlStr}\n\n¿Podrian asesorarme sobre itinerario y disponibilidad?\n\nMuchas gracias.`,
    auto:    `Hola, quisiera consultar por el alquiler de autos que vi en la pagina de Westur.${urlStr}\n\n¿Podrian indicarme disponibilidad y tarifas?\n\nMuchas gracias.`,
  };

  return `${WA}?text=${encodeURIComponent(plantillas[tipo] || plantillas.paquete)}`;
}

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
    </button>
    <div class="share-menu" role="menu">
      <button class="share-opt" onclick="shareVia('wa','${n}','${d}','${p}','${s}',this)">
        <svg width="15" height="15"><use href="#ic-wa"/></svg> WhatsApp
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

// ── Modal ─────────────────────────────────────────────────────────────────────

const _md = {};

function showCard(key) {
  const d = _md[key];
  if (!d) return;
  const imgEl = document.getElementById('cmodal-img');
  imgEl.innerHTML = d.img
    ? `<img src="${d.img}" alt="${d.titulo}" loading="lazy">`
    : `<div class="card-img-bg ${d.bgClass}" style="height:100%;min-height:220px"><span class="pi-label">${d.titulo}</span></div>`;
  document.getElementById('cmodal-badge').innerHTML = d.badge
    ? `<span class="urg-badge ${badgeClass(d.tipo_badge)}">${d.badge}</span>` : '';
  document.getElementById('cmodal-ttl').textContent = d.titulo;
  document.getElementById('cmodal-desc').textContent = d.descripcion || '';
  document.getElementById('cmodal-meta').innerHTML =
    `${d.precio ? `<div class="cmodal-price">Desde <strong>${d.precio}</strong></div>` : ''}
     ${d.duracion ? `<span class="cmodal-dur">${d.duracion}</span>` : ''}`;
  document.getElementById('cmodal-wa').href = d.waUrl;
  const modal = document.getElementById('cmodal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('cmodal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cmodal').addEventListener('click', e => {
    if (e.target === document.getElementById('cmodal')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// ── Renderizadores ────────────────────────────────────────────────────────────

function buildCarousel(imgs, alt) {
  if (!imgs.length) return `<div class="card-img-bg pi-tk"><span class="pi-label">${alt}</span></div>`;
  if (imgs.length === 1) return `<img src="${imgs[0]}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;display:block">`;

  const slides = imgs.map((src, i) =>
    `<div class="crs-slide${i===0?' crs-active':''}" style="background-image:url(${src})"></div>`
  ).join('');
  const dots = imgs.map((_, i) =>
    `<button class="crs-dot${i===0?' crs-dot-on':''}" data-i="${i}" aria-label="Imagen ${i+1}"></button>`
  ).join('');

  return `
    <div class="crs-wrap">
      ${slides}
      <button class="crs-arr crs-prev" aria-label="Anterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="crs-arr crs-next" aria-label="Siguiente">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="crs-dots">${dots}</div>
    </div>`;
}

function initCarousels(container) {
  container.querySelectorAll('.crs-wrap').forEach(wrap => {
    const slides = wrap.querySelectorAll('.crs-slide');
    const dots   = wrap.querySelectorAll('.crs-dot');
    let cur = 0;

    function goTo(n) {
      slides[cur].classList.remove('crs-active');
      dots[cur].classList.remove('crs-dot-on');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('crs-active');
      dots[cur].classList.add('crs-dot-on');
    }

    wrap.querySelector('.crs-prev').addEventListener('click', e => { e.preventDefault(); goTo(cur - 1); });
    wrap.querySelector('.crs-next').addEventListener('click', e => { e.preventDefault(); goTo(cur + 1); });
    dots.forEach(d => d.addEventListener('click', e => { e.preventDefault(); goTo(+d.dataset.i); }));
  });
}

function renderPaquetes(items) {
  const grid = document.querySelector('#paquetes .dest-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((p, i) => {
    const imgs = [p.imagen_1, p.imagen_2, p.imagen_3]
      .map(u => u && driveToImg(u)).filter(Boolean);

    const imgHtml = buildCarousel(imgs, p.destino || p.nombre);
    const badgeHtml = p.badge
      ? `<span class="urg-badge ${badgeClass(p.tipo_badge)}">${p.badge}</span>` : '';
    const moneda = p.moneda || 'USD';
    const precio = p.precio ? `${moneda} ${Number(p.precio).toLocaleString('es-AR')}` : '';

    const featClass = i === 0 ? ' feat' : '';
    const cat = (p.categoria || 'todos').toLowerCase().trim();
    const mKey = `p${i}`;
    _md[mKey] = { titulo:p.nombre, descripcion:p.descripcion, img:imgs[0]||'', bgClass:'pi-tk',
      badge:p.badge, tipo_badge:p.tipo_badge, precio, duracion:p.duracion,
      waUrl:buildWaMsg('paquete',{nombre:p.nombre,descripcion:p.descripcion,precio:p.precio,moneda:p.moneda,duracion:p.duracion}) };
    return `
    <div class="dest-card r${featClass}" data-cat="${cat}" onclick="showCard('${mKey}')" style="cursor:pointer">
      <div class="card-img">
        ${imgHtml}
        <div class="img-ov"></div>
      </div>
      <div class="card-b">
        ${badgeHtml}
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ''}</p>
        <div class="card-foot">
          <div class="card-price">Desde <strong>${precio}</strong></div>
          <span class="card-dur">${p.duracion || ''}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px" onclick="event.stopPropagation()">
          <a href="${buildWaMsg('paquete', {nombre:p.nombre, descripcion:p.descripcion, precio:p.precio, moneda:p.moneda, duracion:p.duracion})}" class="btn-dest" target="_blank" style="flex:1;min-width:120px">
            <svg width="15" height="15"><use href="#ic-wa"/></svg>
            Ver más
          </a>
          ${shareHtml(p.nombre, p.descripcion, precio ? `${precio}` : '', 'paquetes')}
        </div>
      </div>
    </div>`;
  }).join('');

  initCarousels(grid);
  document.querySelectorAll('.dest-card.r:not(.v)').forEach(el => revealObs.observe(el));
  // re-apply active filter if one is selected
  const activeBtn = document.querySelector('.filtro-btn.act');
  if (activeBtn) {
    const f = activeBtn.dataset.f;
    document.querySelectorAll('.dest-card').forEach(card => {
      if (f === 'todos' || card.dataset.cat === f) card.classList.remove('hidden');
      else card.classList.add('hidden');
    });
  }
}

function renderOfertas(items) {
  const grid = document.querySelector('#ofertas .promo-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((o, i) => {
    const imgHtml = o.imagen_1 && o.imagen_1.startsWith('http')
      ? `<img src="${o.imagen_1}" alt="${o.nombre}" style="width:100%;height:160px;object-fit:cover;display:block">`
      : `<div class="promo-img pi-pc">`;

    const moneda = o.moneda || 'USD';
    const precioNuevo = o.precio_nuevo ? `${moneda} ${Number(o.precio_nuevo).toLocaleString('es-AR')}` : '';
    const precioOrig = o.precio_original ? `<span class="promo-old">${moneda} ${Number(o.precio_original).toLocaleString('es-AR')}</span>` : '';

    const mKey = `o${i}`;
    _md[mKey] = { titulo:o.nombre, descripcion:o.descripcion, img:o.imagen_1?driveToImg(o.imagen_1):'', bgClass:'pi-pc',
      badge:o.badge_urgencia, tipo_badge:'promo', precio:precioNuevo, duracion:'',
      waUrl:buildWaMsg('oferta',{nombre:o.nombre,descripcion:o.descripcion,precio:o.precio_nuevo,moneda:o.moneda}) };
    return `
    <div class="promo-card r" onclick="showCard('${mKey}')" style="cursor:pointer">
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
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px" onclick="event.stopPropagation()">
          <a href="${buildWaMsg('oferta', {nombre:o.nombre, descripcion:o.descripcion, precio:o.precio_nuevo, moneda:o.moneda})}" class="btn-dest" target="_blank" style="flex:1;min-width:140px">
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
        <a href="${buildWaMsg('salida', {nombre:s.destino, ruta:s.ruta, precio:s.precio, moneda:s.moneda, fecha:`${s.dia} ${s.mes}`})}"
           class="btn-dest" target="_blank" style="width:auto;padding:10px 18px;white-space:nowrap">
          <svg width="14" height="14"><use href="#ic-wa"/></svg> Reservar
        </a>

        ${shareHtml(s.destino, s.ruta, s.precio ? `${s.moneda||'USD'} ${Number(s.precio).toLocaleString('es-AR')}` : '', 'salidas-grupales')}
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

    const mKey = `c${i}`;
    _md[mKey] = { titulo:c.nombre, descripcion:c.descripcion||c.ruta||'', img:c.imagen_1?driveToImg(c.imagen_1):'', bgClass:'bg-grupales',
      badge:c.badge, tipo_badge:'promo', precio, duracion:c.duracion,
      waUrl:buildWaMsg('circuito',{nombre:c.nombre,ruta:c.ruta,precio:c.precio,moneda:c.moneda,duracion:c.duracion}) };
    return `
    <div class="circ-card r ${delay}" onclick="showCard('${mKey}')" style="cursor:pointer">
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
          <div class="card-price">Desde <strong>${precio}</strong></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px" onclick="event.stopPropagation()">
          <a href="${buildWaMsg('circuito', {nombre:c.nombre, ruta:c.ruta, precio:c.precio, moneda:c.moneda, duracion:c.duracion})}"
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

function renderCruceros(items) {
  const grid = document.querySelector('#cruceros .circ-grid');
  if (!grid || !items.length) return;

  grid.innerHTML = items.map((c, i) => {
    const delay = ['', 'r1', 'r2'][i % 3];
    const moneda = c.moneda || 'USD';
    const precio = c.precio ? `${moneda} ${Number(c.precio).toLocaleString('es-AR')}` : '';
    const rutaHtml = (c.ruta || '').split('·').map(r => r.trim()).filter(Boolean)
      .map((r, j) => j === 0 ? `<span>${r}</span>` : `<span class="circ-dot"></span><span>${r}</span>`)
      .join('');
    const bgStyle = c.imagen_1
      ? `style="background-image:url(${driveToImg(c.imagen_1)});background-size:cover;background-position:center"`
      : '';

    const mKey = `cr${i}`;
    _md[mKey] = { titulo:c.nombre, descripcion:c.descripcion||c.ruta||'', img:c.imagen_1?driveToImg(c.imagen_1):'', bgClass:'pi-cr',
      badge:c.badge, tipo_badge:'promo', precio, duracion:c.duracion,
      waUrl:buildWaMsg('circuito',{nombre:c.nombre,ruta:c.ruta,precio:c.precio,moneda:c.moneda,duracion:c.duracion}) };
    return `
    <div class="circ-card r ${delay}" onclick="showCard('${mKey}')" style="cursor:pointer">
      <div class="circ-img" ${bgStyle}>
        ${c.badge ? `<span class="circ-badge">${c.badge}</span>` : ''}
      </div>
      <div class="circ-b">
        <div class="circ-route">${rutaHtml}</div>
        <h3>${c.nombre}</h3>
        <div class="circ-tags">
          ${c.duracion ? `<span class="circ-tag">${c.duracion}</span>` : ''}
          ${c.naviera ? `<span class="circ-tag">${c.naviera}</span>` : ''}
          ${c.fecha_salida ? `<span class="circ-tag">Salida: ${c.fecha_salida}</span>` : ''}
        </div>
        <div class="card-foot">
          <div class="card-price">Desde <strong>${precio}</strong></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px" onclick="event.stopPropagation()">
          <a href="${buildWaMsg('circuito', {nombre:c.nombre, ruta:c.ruta, precio:c.precio, moneda:c.moneda, duracion:c.duracion})}"
             class="btn-dest" target="_blank" style="flex:1;min-width:130px">
            <svg width="15" height="15"><use href="#ic-wa"/></svg>
            Consultar crucero
          </a>
          ${shareHtml(c.nombre, c.ruta, precio, 'cruceros')}
        </div>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('#cruceros .circ-card.r').forEach(el => revealObs.observe(el));
}

function renderAutos(items) {
  const grid = document.querySelector('#autos .autos-cms-grid');
  if (!grid || !items.length) return;

  const catLabel = { economico:'Económico', intermedio:'Intermedio', suv:'SUV', premium:'Premium' };
  const catClass = { economico:'tag-g', intermedio:'tag-d', suv:'urg-cupos', premium:'urg-hot' };

  grid.innerHTML = items.map((a, i) => {
    const delay = ['', 'r1', 'r2', 'r3'][i % 4];
    const moneda = a.moneda || 'USD';
    const precio = a.precio_por_dia ? `${moneda} ${Number(a.precio_por_dia).toLocaleString('es-AR')}/día` : '';
    const bgStyle = a.imagen_1
      ? `style="background-image:url(${driveToImg(a.imagen_1)});background-size:cover;background-position:center"`
      : '';

    return `
    <div class="circ-card r ${delay}">
      <div class="circ-img" ${bgStyle}>
        <span class="circ-badge">${catLabel[a.categoria] || a.categoria}</span>
      </div>
      <div class="circ-b">
        <h3>${a.marca_modelo}</h3>
        <div class="circ-tags">
          ${a.destino ? `<span class="circ-tag">${a.destino}</span>` : ''}
          ${a.disponibilidad ? `<span class="circ-tag">${a.disponibilidad}</span>` : ''}
        </div>
        ${a.incluye ? `<p style="font-size:12.5px;color:var(--txt2);margin:8px 0 0;line-height:1.5">${a.incluye}</p>` : ''}
        <div class="card-foot" style="margin-top:12px">
          <div class="card-price">Desde <strong>${precio}</strong></div>
        </div>
        <a href="${buildWaMsg('auto', {nombre:a.marca_modelo, descripcion:a.incluye})}"
           class="btn-dest" target="_blank" style="margin-top:12px;display:flex;align-items:center;gap:7px;justify-content:center">
          <svg width="15" height="15"><use href="#ic-wa"/></svg>
          Consultar disponibilidad
        </a>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('#autos .circ-card.r').forEach(el => revealObs.observe(el));
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
  if (data.cruceros?.length)         renderCruceros(data.cruceros);
  if (data.autos?.length)            renderAutos(data.autos);
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
