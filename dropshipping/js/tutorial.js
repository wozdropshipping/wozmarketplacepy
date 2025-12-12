// Tour ligero, persistente entre páginas via localStorage.

(function(){
  const STEPS = [
    /* Raíz (index.html) */
    { page: "index.html", selector: "#globalDroppers", title:"Droppers (cantidad)", text:"Aquí ves el conteo de droppers que siguen productos. Es útil para medir demanda." },
    { page: "index.html", selector: ".dropper-region", title:"Droppers por país", text:"Distribución por país: te ayuda a seleccionar mercados con alta demanda." },
    { page: "index.html", selector:"#productList", title:"Productos Woz Dropshipping", text:"Listado de productos que puedes vender. Haz clic en una tarjeta para ver detalles." },
    { page: "index.html", selector:".product-card", title:"Card del producto", text:"Tarjeta del producto con información rápida." },
    { page: "index.html", selector:".product-card .title", title:"Título", text:"Nombre del producto exportado." },
    { page: "index.html", selector:".product-card .provider-name", title:"Proveedor", text:"Proveedor de origen (información útil para importación)." },
    { page: "index.html", selector:".price-provider", title:"Precio proveedor", text:"Precio base del proveedor." },
    { page: "index.html", selector:".price-suggested", title:"Precio sugerido", text:"Precio recomendado para vender en Marketplace." },
    { page: "index.html", selector:".rating", title:"Calificación", text:"Calificación promedio del producto." },
    { page: "index.html", selector:".sold-count", title:"Ventas", text:"Cuántas veces se vendió este producto (indica demanda)." },
    { page: "index.html", selector:".profitability", title:"Rentabilidad", text:"Indica si la ganancia es alta o regular según márgenes." },
    { page: "index.html", selector:".vender-btn", title:"Vender este producto", text:"Botón para empezar a vender: abre el formulario modal." },

    /* Modal vendedor: primero PREVIEW del modal (usuario debe presionar Siguiente para continuar) */
    { page: "index.html", selector:"#venderModal, #modal-vender, .modal-vender", title:"Formulario Woz Marketplace", text:"Llena estos campos para publicar en Woz Marketplace. Usa Siguiente para ver cada sección del formulario.", modalPreview: true },

    /* Campos del modal: título + rectángulo (selectores alternativos para tolerancia) */
    { page: "index.html", selector:"#vendedorNombre, #nombreVendedor, input[name='vendedorNombre'], .vendor-name-input", title:"Título del vendedor", text:"Nombre que verán los compradores." },
    { page: "index.html", selector:"#precioVendedor, #precioProveedor, .price-provider, .precio-proveedor", title:"Precio del vendedor", text:"Tu precio final para el comprador." },
    { page: "index.html", selector:"#vendorIdInput, #idVendedor, .vendor-id-input", title:"ID de vendedor", text:"ID único que te provee Woz." },
    { page: "index.html", selector:"#vendedorWhats, #whatsappVendedor, .vendedor-whats", title:"WhatsApp", text:"Contacto para que compradores te contacten." },
    { page: "index.html", selector:"#vendedorDesc, #descripcionVendedor, .vendedor-desc, textarea[name='descripcion']", title:"Descripción del producto", text:"Descripción que aparecerá en la ficha." },
    { page: "index.html", selector:".banco-box, .bank-info, #datosTransferencia", title:"Datos de transferencia", text:"Datos bancarios para realizar pagos y activación de membresía Woz Dropshipping." },
    { page: "index.html", selector:"#comprobanteWhats, .comprobante-actions, .publish-actions", title:"Acciones: solicitar ID / comprobante / publicar", text:"Botones para solicitar ID, enviar comprobante y publicar el producto. (Aquí se resaltarán los 3 botones juntos si están en un mismo contenedor.)" },

    /* Paso final centrado que termina el tutorial */
    { page: "index.html", selector: null, title: "Fin de tutorial", text: "Con estos pasos podrás vender de manera ilimitada en nuestras plataformas. Activa un IS de vendedor por tan solo 250.000 Gs anuales y comienza a vender de manera ilimitada.\n\n¿Quieres ver dónde se publicarán tus productos? Visita Woz Marketplace.", final: true }
  ];

  let state = { active:false, index:0 };
  let _scrollTimeout = null;

  // ===== Añadidas: reposition y scrollToElement (evitan ReferenceError y reposicionan highlight/tooltip) =====
  function scrollToElement(el){
    return new Promise(resolve => {
      if(!el) return resolve();
      try{
        // solo scrollear si no está visible en viewport
        const r = el.getBoundingClientRect();
        const visible = r.top >= 0 && r.bottom <= window.innerHeight;
        if(visible) return resolve();
        el.scrollIntoView({behavior:'smooth', block:'center', inline:'nearest'});
        // esperar un poco para que el layout se estabilice
        setTimeout(resolve, 320);
      }catch(e){
        setTimeout(resolve, 200);
      }
    });
  }

  function reposition(){
    if(!state || !state.active) return;
    const step = STEPS[state.index];
    if(!step) return;
    const overlay = document.getElementById('tutorial-overlay');
    const highlight = document.getElementById('tutorial-highlight');
    const tooltip = document.getElementById('tutorial-tooltip');
    if(!overlay || !highlight || !tooltip) return;

    let el = step.selector ? document.querySelector(step.selector) : null;
    const target = (typeof getCaptureElement === 'function') ? (getCaptureElement(el) || el) : el;
    if(target){
      const r = target.getBoundingClientRect();
      const pad = 8;
      const top = Math.max(6, r.top - pad);
      const left = Math.max(6, r.left - pad);
      const width = Math.min(window.innerWidth - left - 6, r.width + pad*2);
      const height = Math.min(window.innerHeight - top - 6, r.height + pad*2);

      highlight.style.display = 'block';
      highlight.style.top = top + 'px';
      highlight.style.left = left + 'px';
      highlight.style.width = width + 'px';
      highlight.style.height = height + 'px';
      highlight.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.6)';
      highlight.style.background = 'transparent';
      highlight.style.borderRadius = '8px';

      const ttW = Math.min(360, window.innerWidth - 40);
      tooltip.style.maxWidth = ttW + 'px';
      tooltip.style.visibility = 'visible';
      const ttHeight = tooltip.offsetHeight || 80;
      let ttTop = r.bottom + 12;
      if(ttTop + ttHeight > window.innerHeight - 12){
        ttTop = r.top - ttHeight - 12;
        if(ttTop < 12) ttTop = 12;
      }
      let ttLeft = Math.max(12, r.left);
      if(ttLeft + ttW > window.innerWidth - 12){
        ttLeft = Math.max(12, window.innerWidth - ttW - 12);
      }
      tooltip.style.left = ttLeft + 'px';
      tooltip.style.top = ttTop + 'px';
      tooltip.style.transform = 'translateX(0)';
    } else {
      highlight.style.display = 'none';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.top = (window.innerHeight * 0.15) + 'px';
      tooltip.style.visibility = 'visible';
    }
  }
  // ============================================================================================

  function createOverlay(){
    if(document.getElementById('tutorial-overlay')) return;
    const ov = document.createElement('div'); ov.id='tutorial-overlay';
    const hl = document.createElement('div'); hl.id='tutorial-highlight';
    const tt = document.createElement('div'); tt.id='tutorial-tooltip';
    tt.innerHTML = `<button id="tutorial-close" aria-label="Cerrar" style="position:absolute;right:8px;top:8px;border:none;background:transparent;font-size:18px;cursor:pointer">✕</button><h4 id="tutorial-title"></h4><p id="tutorial-text"></p><div class="tutorial-controls">
      <button id="tutorial-prev" class="btn-secondary">Atrás</button>
      <button id="tutorial-next">Siguiente</button>
    </div>`;
    document.body.appendChild(ov); document.body.appendChild(hl); document.body.appendChild(tt);

    document.getElementById('tutorial-next').addEventListener('click', nextStep);
    document.getElementById('tutorial-prev').addEventListener('click', prevStep);
    document.getElementById('tutorial-close').addEventListener('click', endTour);
    ov.addEventListener('click', (e)=>{ e.stopPropagation(); });
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', () => {
      if(_scrollTimeout) clearTimeout(_scrollTimeout);
      _scrollTimeout = setTimeout(reposition, 80);
    }, { passive: true });
    window.addEventListener('keydown', (ev)=> { if(ev.key === 'Escape') endTour(); });
  }

  function isSamePage(stepPage){
    const path = window.location.pathname.replace(/\\/g,'/');
    if(stepPage === 'index.html'){
      return path.endsWith('/index.html') || path === '/' || path === '';
    }
    return path.endsWith(stepPage) || path.endsWith('/' + stepPage);
  }

  function getCaptureElement(el){
    if(!el) return null;
    // Si vienen con data-tour-target en ancestors, respetar
    if(el.closest){
      const forced = el.closest('[data-tour-target]');
      if(forced){
        const sel = forced.getAttribute('data-tour-target');
        if(sel){
          const explicit = document.querySelector(sel);
          if(explicit) return explicit;
        }
        return forced;
      }
    }

    // Si es imagen, usar su contenedor
    if(el.tagName === 'IMG' && el.parentElement) el = el.parentElement;

    // Si es un input/textarea/select o un rect pequeño (valor), intentar encontrar el título/label cercano
    const inputLike = /INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.className && /(input|form-control|field|rect)/i.test(el.className);
    const txt = (el.textContent || '').trim();
    const isShortNumeric = txt && (/^[\s\d\.,₲Gs\$]+$/.test(txt) || (txt.length < 8 && /\d/.test(txt)));

    if(inputLike || isShortNumeric){
      // 1) Si el padre contiene un label o título, devolver el padre
      if(el.parentElement){
        const p = el.parentElement;
        try{
          if(p.querySelector && (p.querySelector('label, .label, .field-title, .title, h1, h2, h3'))){
            return p;
          }
        }catch(e){}
      }

      // 2) Buscar sibling previo con texto (etiqueta)
      let prev = el.previousElementSibling;
      if(prev && prev.textContent && prev.textContent.trim().length > 0 && prev.textContent.trim().length < 120){
        return el.parentElement || el;
      }

      // 3) Subir algunos niveles buscando un contenedor que incluya tanto título como el campo
      let node = el;
      for(let i=0;i<4 && node && node!==document.body;i++){
        try{
          if(node.querySelector && node.querySelector('label, .field-title, .title, h1, h2, h3')){
            // asegurar que dentro de ese ancestor exista el propio elemento
            if(node.contains(el)) return node;
          }
        }catch(e){}
        node = node.parentElement;
      }

      // 4) fallback: devolver parent si existe
      if(el.parentElement) return el.parentElement;
    }

    // Heurística general: evitar ancestros enormes, preferir ancestro pequeño con texto
    let candidate = el;
    let node2 = el;
    const viewportArea = window.innerWidth * window.innerHeight;
    while(node2 && node2 !== document.body){
      try{
        const r = node2.getBoundingClientRect();
        const area = Math.max(1, r.width * r.height);
        if(area < viewportArea * 0.6){
          candidate = node2;
          break;
        }
      }catch(e){}
      node2 = node2.parentElement;
    }

    // Si candidate es muy grande, intentar un hijo con texto
    try{
      const candRect = candidate.getBoundingClientRect();
      if((candRect.width * candRect.height) > viewportArea * 0.7 && candidate.childElementCount){
        const smallChild = Array.from(candidate.children).find(ch => {
          const r = ch.getBoundingClientRect();
          return r.width * r.height < viewportArea * 0.5 && ch.textContent && ch.textContent.trim().length > 0;
        });
        if(smallChild) return smallChild;
      }
    }catch(e){}

    return candidate || el;
  }

  async function showStep(s){
    createOverlay();
    const overlay = document.getElementById('tutorial-overlay');
    const highlight = document.getElementById('tutorial-highlight');
    const tooltip = document.getElementById('tutorial-tooltip');
    overlay.style.display='block';
    highlight.style.display='block';
    tooltip.style.display='block';
    tooltip.style.transform = 'translateX(0)';

    // Si es paso final (centrado) mostrar layout especial
    if(s && s.final){
      // reemplazar contenido del tooltip por mensaje final con botones
      tooltip.innerHTML = `
        <h4 id="tutorial-title">${s.title}</h4>
        <p id="tutorial-text" style="white-space:pre-wrap;">${s.text}</p>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button id="tutorial-open-marketplace" class="btn-primary">Woz Marketplace</button>
          <button id="tutorial-restart-btn" class="btn-secondary">Reiniciar tutorial</button>
          <button id="tutorial-cancel-btn" class="btn-ghost">Cancelar</button>
        </div>
      `;
      // attach handlers
      document.getElementById('tutorial-open-marketplace').addEventListener('click', ()=> { window.location.href = 'Marketplace/index.html'; });
      document.getElementById('tutorial-restart-btn').addEventListener('click', ()=> { startTour(0); });
      document.getElementById('tutorial-cancel-btn').addEventListener('click', ()=> { endTour(); });

      // center tooltip
      tooltip.style.left = '50%';
      tooltip.style.top = (window.innerHeight * 0.2) + 'px';
      tooltip.style.transform = 'translateX(-50%)';
      highlight.style.display = 'none';
      return;
    }

    document.getElementById('tutorial-title').textContent = s.title || '';
    document.getElementById('tutorial-text').textContent = s.text || '';

    // abrir modal si selector está dentro de uno (forzar visible)
    const modalIds = ['venderModal','modal-vender'];
    for(const id of modalIds){
      const m = document.getElementById(id);
      if(m && s.selector){
        try{
          if(m.querySelector(s.selector)){
            if(getComputedStyle(m).display === 'none' || m.style.display === 'none' || m.style.display === ''){
              m.style.display = 'flex';
              await new Promise(r=>setTimeout(r, 260));
            }
          }
        }catch(e){}
      }
    }

    // encontrar elemento objetivo
    let el = s.selector ? document.querySelector(s.selector) : null;
    const target = getCaptureElement(el) || el;

    // Si el target está dentro de un modal, primero mostrar preview del modal entero UNA VEZ
    const modalAncestor = (target && target.closest) ? (target.closest('.modal') || target.closest('#venderModal') || target.closest('[role="dialog"]')) : null;
    if(modalAncestor && !modalAncestor.dataset.__tourPreviewShown){
      try{
        // Mostrar preview del modal completo con título fijo
        const rModal = modalAncestor.getBoundingClientRect();
        const padM = 10;
        highlight.style.top = Math.max(6, rModal.top - padM) + 'px';
        highlight.style.left = Math.max(6, rModal.left - padM) + 'px';
        highlight.style.width = Math.min(window.innerWidth - 12, rModal.width + padM*2) + 'px';
        highlight.style.height = Math.min(window.innerHeight - 12, rModal.height + padM*2) + 'px';
        highlight.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.6)';
        highlight.style.borderRadius = '10px';

        // temporalizar tooltip con texto genérico del form
        const prevTitle = document.getElementById('tutorial-title');
        const prevText = document.getElementById('tutorial-text');
        if(prevTitle) prevTitle.textContent = 'Formulario Woz Marketplace';
        if(prevText) prevText.textContent = 'Llena estos campos para publicar en Woz Marketplace';

        tooltip.style.left = Math.max(12, rModal.left) + 'px';
        tooltip.style.top = Math.max(12, rModal.top + 12) + 'px';
        tooltip.style.visibility = 'visible';

        // marcar para no repetir
        modalAncestor.dataset.__tourPreviewShown = '1';
        // no avanzar automáticamente: el usuario debe pulsar Siguiente para ir al campo
        return;
      }catch(e){ /* noop */ }
    }

    if(target){
      await scrollToElement(target);
      const capture = getCaptureElement(target) || target;
      const r = capture.getBoundingClientRect();
      const pad = 8;
      const top = Math.max(6, r.top - pad);
      const left = Math.max(6, r.left - pad);
      const width = Math.min(window.innerWidth - left - 6, r.width + pad*2);
      const height = Math.min(window.innerHeight - top - 6, r.height + pad*2);

      highlight.style.top = top + 'px';
      highlight.style.left = left + 'px';
      highlight.style.width = width + 'px';
      highlight.style.height = height + 'px';
      highlight.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.6)';
      highlight.style.background = 'transparent';
      highlight.style.borderRadius = '8px';

      // posicionar tooltip
      const ttW = Math.min(360, window.innerWidth - 40);
      tooltip.style.maxWidth = ttW + 'px';
      tooltip.style.visibility = 'hidden';
      await new Promise(rf => requestAnimationFrame(rf));
      tooltip.style.visibility = 'visible';
      const ttHeight = tooltip.offsetHeight || 80;
      let ttTop = r.bottom + 12;
      if(ttTop + ttHeight > window.innerHeight - 12){
        ttTop = r.top - ttHeight - 12;
        if(ttTop < 12) ttTop = 12;
      }
      let ttLeft = Math.max(12, r.left);
      if(ttLeft + ttW > window.innerWidth - 12){
        ttLeft = Math.max(12, window.innerWidth - ttW - 12);
      }
      tooltip.style.left = ttLeft + 'px';
      tooltip.style.top = ttTop + 'px';
    } else {
      // fallback central
      highlight.style.display = 'none';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.top = (window.innerHeight * 0.15) + 'px';
      tooltip.style.visibility = 'visible';
      if(!tooltip.dataset.noteAdded){
        const p = document.getElementById('tutorial-text');
        if(p) p.textContent = (s.text || '') + ' (Elemento no encontrado en esta vista — presiona Siguiente.)';
        tooltip.dataset.noteAdded = '1';
      }
    }

    // ajustar controles
    try {
      const prevBtn = document.getElementById('tutorial-prev');
      const nextBtn = document.getElementById('tutorial-next');
      if(prevBtn) prevBtn.style.display = (state.index>0) ? 'inline-block' : 'none';
      if(nextBtn) nextBtn.textContent = (state.index < STEPS.length -1) ? 'Siguiente' : 'Finalizar';
    } catch(e){}
    try { localStorage.setItem('tutorialState', JSON.stringify(state)); }catch(e){}
  }

  function nextStep(){
    if(state.index >= STEPS.length -1){ endTour(); return; }
    state.index++; persistState();
    navigateOrShow();
  }
  function prevStep(){
    if(state.index<=0) return;
    state.index--; persistState();
    navigateOrShow();
  }

  function navigateOrShow(){
    const step = STEPS[state.index];
    if(!step) return endTour();
    if(!isSamePage(step.page)){
      persistState();
      // navegar con ruta relativa; si estás en index.html, go to Marketplace/index.html, etc.
      window.location.href = step.page;
    } else {
      setTimeout(()=> showStep(step), 200);
    }
  }

  function startTour(fromIndex=0){
    state.active = true; state.index = fromIndex; persistState();
    navigateOrShow();
  }
  function endTour(){
    state.active = false; state.index = 0; persistState();
    const ov = document.getElementById('tutorial-overlay');
    const hl = document.getElementById('tutorial-highlight');
    const tt = document.getElementById('tutorial-tooltip');
    if(ov) ov.style.display='none';
    if(hl){ hl.style.display='none'; hl.style.boxShadow = ''; }
    if(tt) tt.style.display='none';
    localStorage.removeItem('woz_tour');
  }

  function persistState(){ localStorage.setItem('woz_tour', JSON.stringify(state)); }
  function loadState(){ const s = localStorage.getItem('woz_tour'); if(s){ try{ state = JSON.parse(s); }catch(e){} } }

  // reemplazar el DOMContentLoaded actual por este bloque
  document.addEventListener('DOMContentLoaded', ()=>{
    // limpieza inmediata: eliminar estado y nodos residuales de sesiones previas
    try{ localStorage.removeItem('woz_tour'); }catch(e){}
    ['tutorial-overlay','tutorial-highlight','tutorial-tooltip'].forEach(id=>{
      const n = document.getElementById(id);
      if(n) n.remove();
    });
    // asegurar overflow del body no quede bloqueado
    try{ document.body.style.overflow = ''; }catch(e){}

    // restablecer estado en memoria
    state = { active:false, index:0 };

    // configurar botón principal del banner (si existe)
    const startBtnRoot = document.getElementById('startTutorialBtn');
    if(startBtnRoot){
      startBtnRoot.addEventListener('click', ()=> {
        // limpiar restos antes de iniciar
        ['tutorial-overlay','tutorial-highlight','tutorial-tooltip'].forEach(id=>{
          const n = document.getElementById(id);
          if(n) n.remove();
        });
        // asegurar estado limpio en storage
        localStorage.removeItem('woz_tour');
        startTour(0);
      });
    }

    // botón flotante de reinicio (si no existe)
    if(!document.getElementById('tutorial-restart')){
      const b = document.createElement('button');
      b.id='tutorial-restart';
      b.textContent='Comenzar tutorial';
      b.style.position='fixed'; b.style.right='12px'; b.style.bottom='12px';
      b.style.zIndex=10001; b.style.padding='8px 10px'; b.style.borderRadius='8px';
      b.style.background='#0b66ff'; b.style.color='#fff'; b.style.border='none'; b.style.cursor='pointer';
      b.addEventListener('click', ()=> {
        ['tutorial-overlay','tutorial-highlight','tutorial-tooltip'].forEach(id=>{
          const n = document.getElementById(id);
          if(n) n.remove();
        });
        localStorage.removeItem('woz_tour');
        startTour(0);
      });
      document.body.appendChild(b);
    }

    // fallback: si algo quedó visible pero sin tooltip, eliminarlo pasados 700ms
    setTimeout(()=>{
      const ov = document.getElementById('tutorial-overlay');
      const hl = document.getElementById('tutorial-highlight');
      const tt = document.getElementById('tutorial-tooltip');
      if(ov && (!tt || tt.style.display === 'none' || !document.body.contains(tt))){
        ov.remove();
        if(hl) hl.remove();
        if(tt) tt.remove();
        document.body.style.overflow = '';
        state = { active:false, index:0 };
        localStorage.removeItem('woz_tour');
      }
    }, 700);

    console.info('WozTutorial listo. Usa el botón "Comenzar tutorial" o WozTutorial.start(0) para iniciar.');
  });

  window.WozTutorial = { start: startTour, end: endTour, state: ()=> state };
})();