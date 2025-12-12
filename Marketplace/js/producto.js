document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const sku = params.get('sku');

  let productosUsuario = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
  let productosGenerados = JSON.parse(localStorage.getItem('productosGeneradosMarketplace')) || [];
  let producto = productosUsuario.find(p => p.sku === sku) || productosGenerados.find(p => p.sku === sku);

  if (!producto) {
    document.body.innerHTML = "<h2 style='padding:2rem;'>Producto no encontrado</h2>";
    return;
  }

  // --- Entrega dinámica ---
  const proveedor = producto.supplier;
  const ahora = new Date();
  const horasRestantes = 24 - ahora.getHours();
  const minutosRestantes = (60 - ahora.getMinutes()) % 60;
  const tiempoCompra = minutosRestantes ? `${horasRestantes}h ${minutosRestantes}m` : `${horasRestantes}h`;
  let fechaEntrega;
  let mensajeEntrega;
  if (/ali|china/i.test(proveedor)) {
    const dias = Math.floor(Math.random() * 4) + 7;
    fechaEntrega = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000);
    mensajeEntrega = `Compra en ${tiempoCompra} para que te llegue en ${fechaEntrega.getDate()} de ${fechaEntrega.toLocaleString('es', { month: 'long' })}.`;
  } else if (/amazon|walmart|ebay|usa|estados/i.test(proveedor)) {
    fechaEntrega = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    mensajeEntrega = `Compra en ${tiempoCompra} para que te llegue en ${fechaEntrega.getDate()} de ${fechaEntrega.toLocaleString('es', { month: 'long' })}.`;
  } else if (/woz/i.test(proveedor)) {
    fechaEntrega = new Date(ahora.getTime() + 1 * 24 * 60 * 60 * 1000);
    mensajeEntrega = `Compra en ${tiempoCompra} para que te llegue mañana (${fechaEntrega.getDate()} de ${fechaEntrega.toLocaleString('es', { month: 'long' })}).`;
  } else {
    fechaEntrega = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    mensajeEntrega = `Compra en ${tiempoCompra} para que te llegue en ${fechaEntrega.getDate()} de ${fechaEntrega.toLocaleString('es', { month: 'long' })}.`;
  }
  document.getElementById("entrega").textContent = mensajeEntrega;

  // --- Método de envío dinámico ---
  let metodoEnvio = "Transporte aéreo";
  if (/ali|china|amazon|walmart|ebay|usa|estados/i.test(proveedor)) {
    metodoEnvio = Math.random() > 0.5 ? "Transporte aéreo" : "Marítimo";
  }
  if (/woz/i.test(proveedor)) {
    metodoEnvio = "Delivery local";
  }
  // Nota: ya no existe un elemento con id "envio" en el HTML.
  // Se mostrará dentro del breakdown (id "br-envio").

  // --- País destino dinámico (sincroniza con selector y localStorage) ---
  function getSelectedCountry() {
    const stored = localStorage.getItem('selectedCountry');
    if (stored) return stored;
    const btn = document.getElementById('country-btn');
    if (btn && btn.textContent) {
      const m = btn.textContent.match(/Comprar en\s+(.+?)(?:\s*[▾▼])?$/);
      if (m && m[1]) return m[1].trim();
    }
    return 'Paraguay';
  }

  function setCountryUI(country) {
    const btn = document.getElementById('country-btn');
    if (btn) btn.textContent = `Comprar en ${country} ▼`;
    const destino = document.getElementById('destino-envio');
    if (destino) destino.textContent = country;
  }

  const country = getSelectedCountry();
  setCountryUI(country);

  const btnCountry = document.getElementById('country-btn');
  if (btnCountry) {
    const countries = ["Paraguay","Argentina","Brasil","Chile","Uruguay","Bolivia","Perú","Colombia","Ecuador","Venezuela","México","Estados Unidos","China"];
    btnCountry.addEventListener('click', () => {
      const choice = prompt("Seleccione país (escriba exactamente):\n" + countries.join(", "), country);
      if (!choice) return;
      if (!countries.includes(choice)) { alert("País no válido"); return; }
      localStorage.setItem('selectedCountry', choice);
      setCountryUI(choice);
    });
  }

  // --- Devoluciones dinámicas (30 días aprox: mismo día del próximo mes) ---
  (function updateDevoluciones() {
    const target = new Date();
    const origDay = target.getDate();
    target.setMonth(target.getMonth() + 1);
    // Si por overflow el mes cambió de forma no deseada, JS ya ajusta la fecha posible
    const opts = { month: 'long' };
    const mes = target.toLocaleString('es-ES', opts);
    const texto = `Se puede devolver hasta el ${target.getDate()} de ${mes} del ${target.getFullYear()}`;
    const devol = document.getElementById('devoluciones-info');
    if (devol) devol.textContent = texto;
  })();

  // --- Información sobre el vendedor dinámica y persistente ---
  function getVendedorInfo(nombre) {
    let vendedores = JSON.parse(localStorage.getItem('vendedoresMarketplace')) || {};
    if (!vendedores[nombre]) {
      // Fecha de inicio coherente (entre 2016 y 2019)
      const startYear = 2016 + Math.floor(Math.random()*4); // 2016..2019
      const fecha = new Date(startYear, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1);
      const activoDesde = fecha.toLocaleDateString('es');
      // WhatsApp formato: +595 981-393-660
      const prefix = ["961","971","981","991"][Math.floor(Math.random()*4)];
      const sub2 = Math.floor(Math.random()*900)+100; // 100-999
      const sub3 = Math.floor(Math.random()*900)+100; // 100-999
      const numero = `+595 ${prefix}-393-${sub3}`;
      // Ventas
      const ventas = Math.floor(Math.random()*400)+20;
      // Volumen: entre 1.000.000 y 500.000.000
      const volumenRaw = Math.floor(Math.random() * (500000000 - 1000000 + 1)) + 1000000;
      const volumen = volumenRaw.toLocaleString('es-ES');
      vendedores[nombre] = { activoDesde, numero, ventas, volumen, startYear };
      localStorage.setItem('vendedoresMarketplace', JSON.stringify(vendedores));
    }
    return vendedores[nombre];
  }
  const vendedorInfo = getVendedorInfo(producto.seller);
  document.getElementById("vendedor-info").textContent = producto.seller;
  document.querySelector(".seller-row:nth-child(2) span:last-child").textContent = vendedorInfo.activoDesde;
  document.querySelector(".seller-row:nth-child(3) span:last-child").innerHTML = `<a href="https://wa.me/${vendedorInfo.numero.replace(/\D/g,'')}" target="_blank">${vendedorInfo.numero}</a>`;
  document.querySelector(".seller-row:nth-child(4) span:last-child").textContent = Number(vendedorInfo.ventas).toLocaleString('es-ES');
  document.querySelector(".seller-row:nth-child(5) span:last-child").textContent = `Gs. ${vendedorInfo.volumen}`;

  // --- Comentarios únicos por producto ---
  function generarComentariosUnicos(sku) {
    let comentariosPorProducto = JSON.parse(localStorage.getItem('comentariosPorProducto')) || {};
    if (!comentariosPorProducto[sku]) {
      const nombresES = [
        "Ana Gómez","Luis Martínez","Carlos López","María Fernández","Pedro Duarte","Lucía Benítez","Miguel Torres","Sofía Ramírez",
        "José González","Valentina Rivas","Ricardo Vera","Fernanda Acosta","Diego Caballero","Paula Sosa","Martín Ayala","Juliana Franco"
      ];
      const nombresEN = [
        "John Smith","Emily Johnson","Michael Brown","Sarah Miller","David Wilson","Jessica Moore","Daniel Taylor","Ashley Anderson",
        "Matthew Thomas","Olivia Jackson","James White","Sophia Harris","Benjamin Martin","Ava Thompson","William Garcia","Mia Martinez"
      ];

      const banderasES = ["ar","cl","py","bo","co","ec","pe","uy","ve","mx","cr","sv","gt","hn","ni","pa","do"];
      const banderasEN = ["us","gb"];

      const frasesBuenasES = [
        "La calidad es superior a lo esperado.","El empaque llegó intacto.","Muy buena atención del vendedor.","La entrega fue puntual.",
        "Excelente experiencia de compra.","El producto cumple con lo prometido.","Muy recomendable.","Todo perfecto, gracias."
      ];
      const frasesMalasES = [
        "El producto llegó con retraso.","No era lo que esperaba.","La calidad podría ser mejor.","El vendedor tardó en responder.",
        "No volvería a comprar.","La atención fue regular.","El envío demoró más de lo indicado.","No recomiendo este producto."
      ];
      const frasesBuenasEN = [
        "Great quality, better than expected.","Fast shipping and excellent service.","Very satisfied with the purchase.",
        "Product matches the description perfectly.","Highly recommended.","Everything arrived in perfect condition."
      ];
      const frasesMalasEN = [
        "Product arrived late.","Not what I expected.","Quality could be better.","Seller was slow to respond.",
        "Would not buy again.","Shipping took longer than stated."
      ];

      // Ciudades por código ISO (agregué países de Centroamérica)
      const ciudadesPorPais = {
        py: ["Asunción","Ciudad del Este","Encarnación","San Lorenzo"],
        ar: ["Buenos Aires","Córdoba","Rosario","Mendoza"],
        cl: ["Santiago","Valparaíso","Concepción","Viña del Mar"],
        bo: ["La Paz","Santa Cruz","Cochabamba"],
        co: ["Bogotá","Medellín","Cali","Barranquilla"],
        ec: ["Quito","Guayaquil","Cuenca"],
        pe: ["Lima","Arequipa","Cusco"],
        uy: ["Montevideo","Punta del Este"],
        ve: ["Caracas","Maracaibo"],
        mx: ["Ciudad de México","Guadalajara","Monterrey"],
        cr: ["San José","Alajuela","Cartago"],
        sv: ["San Salvador","Santa Tecla"],
        gt: ["Ciudad de Guatemala","Quetzaltenango"],
        hn: ["Tegucigalpa","San Pedro Sula"],
        ni: ["Managua","León"],
        pa: ["Panamá","Colón"],
        do: ["Santo Domingo","Santiago de los Caballeros"],
        us: ["New York, NY","Miami, FL","Tampa, FL","Los Angeles, CA","Chicago, IL"],
        gb: ["London","Manchester","Liverpool","Birmingham"]
      };

      // Nombre completo del país por código (para el ", País")
      const nombrePais = {
        py: "Paraguay", ar: "Argentina", cl: "Chile", bo: "Bolivia", co: "Colombia", ec: "Ecuador", pe: "Perú",
        uy: "Uruguay", ve: "Venezuela", mx: "México", cr: "Costa Rica", sv: "El Salvador", gt: "Guatemala",
        hn: "Honduras", ni: "Nicaragua", pa: "Panamá", do: "República Dominicana", us: "USA", gb: "England"
      };

      const comentarios = [];
      const usados = new Set();
      const cantidad = Math.floor(Math.random() * 6) + 5; // 5-10

      for (let i = 0; i < cantidad; i++) {
        const esIngles = Math.random() > 0.5;
        let nombre, codigoBandera, frasesPool;
        if (esIngles) {
          nombre = nombresEN[Math.floor(Math.random() * nombresEN.length)];
          codigoBandera = banderasEN[Math.floor(Math.random() * banderasEN.length)];
          frasesPool = i < cantidad - 2 ? frasesBuenasEN : frasesMalasEN;
        } else {
          nombre = nombresES[Math.floor(Math.random() * nombresES.length)];
          codigoBandera = banderasES[Math.floor(Math.random() * banderasES.length)];
          frasesPool = i < cantidad - 2 ? frasesBuenasES : frasesMalasES;
        }

        // Combina 2-4 frases para variar y limitar tamaño
        let frasesElegidas = [];
        const toTake = Math.min(4, Math.max(2, Math.floor(Math.random()*3)+2)); // 2-4
        while (frasesElegidas.length < toTake) {
          let f = frasesPool[Math.floor(Math.random() * frasesPool.length)];
          if (!frasesElegidas.includes(f)) frasesElegidas.push(f);
        }
        let texto = frasesElegidas.join("<br>");

        if (usados.has(texto)) { i--; continue; }
        usados.add(texto);

        const estrellas = i < cantidad - 2 ? Math.floor(Math.random()*2)+4 : Math.floor(Math.random()*2)+2;

        // Ciudad acorde al país
        let ciudad = "Ciudad";
        if (ciudadesPorPais[codigoBandera] && ciudadesPorPais[codigoBandera].length) {
          const ciudadSolo = ciudadesPorPais[codigoBandera][Math.floor(Math.random() * ciudadesPorPais[codigoBandera].length)];
          const paisNombre = nombrePais[codigoBandera] || codigoBandera.toUpperCase();
          ciudad = `${ciudadSolo}, ${paisNombre}`;
        } else {
          // fallback: si no hay mapeo, colocar país en nombre
          const paisNombre = nombrePais[codigoBandera] || codigoBandera.toUpperCase();
          ciudad = `Ciudad, ${paisNombre}`;
        }

        // Fecha del comentario: garantizar lógica posterior al registro del vendedor
        const minYear = vendedorInfo && vendedorInfo.startYear ? vendedorInfo.startYear : 2016;
        const baseYear = Math.max(minYear, 2019); // al menos 2019
        const year = Math.max(baseYear, 2020) + Math.floor(Math.random()*6); // ventana 2020..2025

        comentarios.push({
          nombre,
          codigoBandera,
          ciudad,
          fecha: `${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${year}`,
          estrellas,
          comentario: texto
        });
      }

      comentariosPorProducto[sku] = comentarios;
      localStorage.setItem('comentariosPorProducto', JSON.stringify(comentariosPorProducto));
    }
    return comentariosPorProducto[sku];
  }
  const reseñasDiv = document.getElementById("contenedor-reseñas");
  if (reseñasDiv) {
    const comentarios = generarComentariosUnicos(producto.sku);
    reseñasDiv.innerHTML = comentarios.map(c => `
      <div class="comentario">
        <span class="bandera-icono fi fi-${c.codigoBandera}" aria-hidden="true"></span>
        <p class="nombre">
          ${c.nombre}
          <svg class="check-verificado" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#3897f0"/><path d="M17 8l-6.5 7L7 11.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </p>
        <span class="ubicacion-comentario">${c.ciudad}</span>
        <div class="estrellas-input">
          ${'<span class="star" style="color: gold;">★</span>'.repeat(c.estrellas)}
          ${'<span class="star" style="color: #ddd;">☆</span>'.repeat(5-c.estrellas)}
        </div>
        <p class="texto">${c.comentario}</p>
        <span class="fecha">${c.fecha}</span>
      </div>
    `).join("");
  }

  // Inicializador opcional: conectar reseñas del vendedor con tus datos reales
  // Generador de reseñas del vendedor (persistente por vendedor)
  function getSellerReviewStats(nombreVendedor, producto) {
    const key = 'sellerReviewStats';
    const cache = JSON.parse(localStorage.getItem(key) || '{}');
    if (!cache[nombreVendedor]) {
      // Total coherente con el producto si existe
      let total = Number(producto && producto.reviews);
      if (!isFinite(total) || total <= 0) {
        total = 500 + Math.floor(Math.random() * 19500); // 500..20000
      }
      // Base porcentajes: sesgo positivo ligero
      let p5 = 40 + Math.floor(Math.random() * 40); // 40..79
      let p4 = 10 + Math.floor(Math.random() * 30); // 10..39
      let p3 = Math.floor(Math.random() * 15);      // 0..14
      let p2 = Math.floor(Math.random() * 10);      // 0..9
      let p1 = Math.floor(Math.random() * 10);      // 0..9
      // Normalizar a 100%
      let sum = p5 + p4 + p3 + p2 + p1;
      p5 = Math.round(p5 * 100 / sum);
      p4 = Math.round(p4 * 100 / sum);
      p3 = Math.round(p3 * 100 / sum);
      p2 = Math.round(p2 * 100 / sum);
      p1 = Math.max(0, 100 - (p5 + p4 + p3 + p2));
      // Calcular rating entero aproximado
      const ratingFloat = (5*p5 + 4*p4 + 3*p3 + 2*p2 + 1*p1) / 100;
      const rating = Math.round(ratingFloat);
      cache[nombreVendedor] = {
        total,
        rating,
        dist: {5: p5, 4: p4, 3: p3, 2: p2, 1: p1}
      };
      localStorage.setItem(key, JSON.stringify(cache));
    } else {
      // Sincroniza el total si el producto tiene otro valor
      const prodTotal = Number(producto && producto.reviews);
      if (isFinite(prodTotal) && prodTotal > 0 && cache[nombreVendedor].total !== prodTotal) {
        cache[nombreVendedor].total = prodTotal;
        localStorage.setItem(key, JSON.stringify(cache));
      }
    }
    return cache[nombreVendedor];
  }

  if (typeof initSellerReviews === 'function') {
    const stats = getSellerReviewStats(producto.seller, producto);
    initSellerReviews(stats);
  }

  // --- Rellenar datos principales ---
  document.getElementById("nombre-producto").textContent = producto.title;
  document.getElementById("proveedor").innerHTML = `${producto.supplier} <svg class="check-verificado" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#3897f0"/><path d="M17 8l-6.5 7L7 11.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.getElementById("vendedor").textContent = producto.seller;
  // Evitar referencias a elementos inexistentes: ya no hay elemento #precio en el HTML.
  // El precio se muestra dentro del breakdown y en otros lugares propios.
  // Sincroniza filas superiores del breakdown
  (function syncTopBreakdown(){
    function fmtGs(val){
      const num = typeof val === 'number' ? val : parseInt(String(val||'').replace(/[^\d]/g,''),10);
      if (!isFinite(num)) return 'Gs. —';
      return `Gs. ${num.toLocaleString('es-ES')}`;
    }
    const brPrecioV = document.getElementById('br-precio-vendedor');
    const brEnvio = document.getElementById('br-envio');
    if (brPrecioV) brPrecioV.textContent = fmtGs(producto.priceFormatted || producto.price);
    if (brEnvio) brEnvio.textContent = metodoEnvio || '—';
  })();
  // --- Breakdown de precio profesional ---
  (function calcularBreakdown(){
    const precioStr = producto.priceFormatted.replace(/[^0-9.]/g,'');
    const precio = parseInt(precioStr.replace(/\./g,''),10);
    if (!isFinite(precio)) return;
    const iva = Math.round(precio * 0.10);
    const woz = Math.round(precio * 0.05);
    const seguro = Math.round(precio * 0.02);
    const tarjeta = Math.round(precio * 0.03); // usar 3% para aproximar 20.608 sobre ~686.920
    const subtotal = precio + iva + woz + seguro + tarjeta;
    function fmt(n){return `Gs. ${n.toLocaleString('es-ES')}`}
    const elPrecio = document.getElementById('br-precio');
    const elIva = document.getElementById('br-iva');
    const elWoz = document.getElementById('br-woz');
    const elSeguro = document.getElementById('br-seguro');
    const elTarjeta = document.getElementById('br-tarjeta');
    const elSubtotal = document.getElementById('br-subtotal');
    if (elPrecio) elPrecio.textContent = fmt(precio);
    if (elIva) elIva.textContent = fmt(iva);
    if (elWoz) elWoz.textContent = fmt(woz);
    if (elSeguro) elSeguro.textContent = fmt(seguro);
    if (elTarjeta) elTarjeta.textContent = fmt(tarjeta);
    if (elSubtotal) elSubtotal.textContent = fmt(subtotal);
    // Persistir subtotal estimativo por SKU para checkout
    try{
      const key = 'subtotalPorProducto';
      const cache = JSON.parse(localStorage.getItem(key) || '{}');
      cache[producto.sku] = subtotal;
      localStorage.setItem(key, JSON.stringify(cache));
    }catch{}
  })();
  
  // Generar descripción creativa por SKU (persistente en localStorage)
  function obtenerDescripcionProducto(producto) {
    const key = 'descripcionesProductos';
    const cache = JSON.parse(localStorage.getItem(key) || "{}");
    if (cache[producto.sku]) return cache[producto.sku];

    // Si el vendedor ya puso una descripción válida, úsala
    if (producto.description && !/fictici|demo|producto ficticio/i.test(producto.description)) {
      cache[producto.sku] = producto.description;
      localStorage.setItem(key, JSON.stringify(cache));
      return cache[producto.sku];
    }

    // Generador creativo
    const usos = ["limpiar", "organizar", "proteger", "mejorar el rendimiento", "mantener como nuevo", "simplificar tu rutina"];
    const categorias = ["electrónico", "doméstico", "personal", "de cuidado", "de jardín", "de oficina"];
    const beneficios = ["duradero", "de alta calidad", "fácil de usar", "compacto", "estético", "versátil"];
    const frases = [
      `Producto ${producto.title || ''} pensado para ${usos[Math.floor(Math.random()*usos.length)]}.`,
      `Ideal para uso ${categorias[Math.floor(Math.random()*categorias.length)]}, con diseño ${beneficios[Math.floor(Math.random()*beneficios.length)]}.`,
      `Presenta acabados cuidados y rendimiento confiable para el día a día.`,
      `Perfecto para quienes buscan una solución práctica y de buena relación calidad-precio.`
    ];

    // mezcla aleatoria y límite 2-3 frases
    const take = 2 + Math.floor(Math.random()*2);
    const seleccion = [];
    while (seleccion.length < take) {
      const f = frases[Math.floor(Math.random()*frases.length)];
      if (!seleccion.includes(f)) seleccion.push(f);
    }
    const descripcion = seleccion.join(' ');
    cache[producto.sku] = descripcion;
    localStorage.setItem(key, JSON.stringify(cache));
    return descripcion;
  }

  // usa la descripción
  document.getElementById("descripcion").value = obtenerDescripcionProducto(producto);
  document.getElementById("btn-comprar").href = `checkout.html?sku=${producto.sku}`;

  // --- Estrellas y reviews ---
  const ratingDiv = document.getElementById("rating-producto");
  if (ratingDiv) {
    let estrellas = "";
    for (let i = 0; i < 5; i++) {
      estrellas += `<span class="star" style="color: gold;">${i < Math.round(producto.rating) ? "★" : "☆"}</span>`;
    }
    const puntuacionEntera = Math.round(Number(producto.rating || 0));
    ratingDiv.innerHTML = `
      ${estrellas}
      <span class="puntuacion">${puntuacionEntera.toLocaleString('es-ES')}</span>
      <span class="reviews">(${Number(getSellerReviewStats(producto.seller, producto).total || 0).toLocaleString('es-ES')})</span>
    `;
  }
  // --- Solicitud de reembolso ---
  const btnReembolso = document.getElementById('btn-reembolso');
  const modalReembolso = document.getElementById('modal-reembolso');
  let cerrarReembolso = document.getElementById('btn-cerrar-reembolso');
  const formReembolso = document.getElementById('form-reembolso');
  const fechaActualInput = document.getElementById('fecha-actual');
  const fechaActualText = document.getElementById('fecha-actual-text');
  const fechaCompraInput = document.getElementById('fecha-compra');
  const estadoDiv = document.getElementById('estado-solicitud');

  function setToday() {
    const tz = 'America/Asuncion';
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth()+1).padStart(2,'0');
    const dd = String(ahora.getDate()).padStart(2,'0');
    if (fechaActualInput) fechaActualInput.value = `${yyyy}-${mm}-${dd}`;
    // Texto legible: dd/mm/yyyy hh:mm (PY)
    if (fechaActualText) {
      const fechaStr = ahora.toLocaleString('es-PY', { timeZone: tz, hour: '2-digit', minute: '2-digit', day:'2-digit', month:'2-digit', year:'numeric' });
      fechaActualText.textContent = `Ahora en Paraguay: ${fechaStr}`;
    }
  }
  // Inicializar fecha actual y límites al cargar
  setToday();
  function setDateLimits() {
    if (!fechaCompraInput) return;
    const hoy = new Date();
    const min = new Date(hoy.getTime() - 30*24*60*60*1000);
    function fmt(d){
      const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${dd}`;
    }
    fechaCompraInput.max = fmt(hoy);
    fechaCompraInput.min = fmt(min);
  }
  setDateLimits();
  // Actualizar reloj cada minuto SOLO si el modal está visible
  setInterval(() => {
    const tz = 'America/Asuncion';
    const ahora = new Date();
    if (fechaActualText && modalReembolso && !modalReembolso.classList.contains('hidden')) {
      const fechaStr = ahora.toLocaleString('es-PY', { timeZone: tz, hour: '2-digit', minute: '2-digit', day:'2-digit', month:'2-digit', year:'numeric' });
      fechaActualText.textContent = `Ahora en Paraguay: ${fechaStr}`;
    }
    if (fechaActualInput && modalReembolso && !modalReembolso.classList.contains('hidden')) {
      const yyyy = ahora.getFullYear();
      const mm = String(ahora.getMonth()+1).padStart(2,'0');
      const dd = String(ahora.getDate()).padStart(2,'0');
      fechaActualInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }, 60000);
  function openModal() {
    setToday();
    const prodInput = document.getElementById('producto-solicitud');
    if (prodInput) prodInput.value = producto.title || '';
    if (modalReembolso) {
      modalReembolso.classList.remove('hidden');
      // Asegurar que se muestre (contrarrestar style.display='none')
      modalReembolso.style.display = 'flex';
      modalReembolso.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    if (estadoDiv) {
      estadoDiv.textContent = '';
      estadoDiv.className = 'estado-solicitud';
    }
    setDateLimits();
    cerrarReembolso = document.getElementById('btn-cerrar-reembolso');
    if (cerrarReembolso) cerrarReembolso.addEventListener('click', closeModal, { once: true });
  }
  function closeModal() {
    if (modalReembolso) {
      modalReembolso.classList.add('hidden');
      modalReembolso.style.display = 'none';
      modalReembolso.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  }
  // Garantizar estado inicial cerrado al cargar
  if (modalReembolso) {
    modalReembolso.classList.add('hidden');
    modalReembolso.style.display = 'none';
    modalReembolso.setAttribute('aria-hidden','true');
  }
  // Exponer cierre global para fallback desde HTML
  window.closeRefundModal = closeModal;
  if (btnReembolso && modalReembolso) {
    btnReembolso.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  if (cerrarReembolso) cerrarReembolso.addEventListener('click', closeModal);
  // Fallback por delegación (por si el listener directo falla)
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;
    const btn = target.id === 'btn-cerrar-reembolso' ? target : target.closest && target.closest('#btn-cerrar-reembolso');
    if (btn) {
      e.preventDefault();
      closeModal();
    }
  });
  // Cerrar con clic fuera del contenido
  if (modalReembolso) {
    modalReembolso.addEventListener('click', (e) => {
      if (e.target === modalReembolso) closeModal();
    });
  }
  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalReembolso && !modalReembolso.classList.contains('hidden')) {
      closeModal();
    }
  });

  function diasEntre(a, b) {
    const MS = 24*60*60*1000;
    const aUTC = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const bUTC = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((aUTC - bUTC) / MS);
  }

  function evaluarElegibilidad(fechaCompraStr, fechaActualStr) {
    const fc = new Date(fechaCompraStr);
    const fa = new Date(fechaActualStr);
    if (isNaN(fc.getTime()) || isNaN(fa.getTime())) return { ok:false, msg:'Fechas inválidas' };
    const diff = diasEntre(fa, fc); // días desde compra hasta hoy
    if (diff <= 30 && diff >= 0) {
      return { ok:true, msg:`Aprobado: dentro de ${diff} días desde la compra` };
    } else if (diff < 0) {
      return { ok:false, msg:'La fecha de compra no puede ser futura' };
    }
    return { ok:false, msg:`Rechazado: han pasado ${diff} días (límite 30)` };
  }

  if (formReembolso) {
    formReembolso.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('titulo-solicitud').value.trim();
      const productoNombre = document.getElementById('producto-solicitud').value.trim();
      const correo = document.getElementById('correo-solicitud').value.trim();
      const idCompra = document.getElementById('id-compra-solicitud').value.trim();
      const motivo = document.getElementById('motivo-solicitud').value.trim();
      const fa = fechaActualInput.value;
      const fc = fechaCompraInput.value;

      if (!titulo || !productoNombre || !correo || !idCompra || !motivo || !fa || !fc) {
        if (estadoDiv) {
          estadoDiv.textContent = 'Completa todos los campos.';
          estadoDiv.className = 'estado-solicitud estado-rechazado';
        }
        return;
      }

      const eleg = evaluarElegibilidad(fc, fa);
      if (estadoDiv) {
        estadoDiv.textContent = eleg.msg;
        estadoDiv.className = 'estado-solicitud ' + (eleg.ok ? 'estado-aprobado' : 'estado-rechazado');
      }

      const key = 'solicitudesReembolso';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push({
        sku: producto.sku,
        titulo,
        producto: productoNombre,
        correo,
        idCompra,
        motivo,
        fechaCompra: fc,
        fechaActual: fa,
        estado: eleg.ok ? 'aprobado' : 'rechazado'
      });
      localStorage.setItem(key, JSON.stringify(arr));

      if (eleg.ok) {
        alert('Solicitud enviada. Te responderemos en ~72 horas a tu correo electrónico.');
        closeModal();
      }
    });
  }

  // (mantenido arriba) setDateLimits();
});
// Estrellas independientes para calificación
let calificacionSeleccionada = 5;
const estrellasCalificacion = document.querySelectorAll('#estrellas-calificacion .star');
estrellasCalificacion.forEach((star, idx) => {
  star.addEventListener('click', () => {
    calificacionSeleccionada = idx + 1;
    estrellasCalificacion.forEach((s, i) => {
      s.style.color = i < calificacionSeleccionada ? 'gold' : '#bbb';
    });
  });
});

// Estrellas de "Deja una calificación" (outline -> rellenable)
(function setupEstrellasCalificacion() {
  const container = document.getElementById('estrellas-calificacion');
  if (!container) return;
  const stars = Array.from(container.querySelectorAll('.star'));
  let seleccion = 0;
  function pintar(n) {
    stars.forEach((s, i) => {
      if (i < n) {
        s.classList.add('selected');
        s.style.color = '#ffb400';
        s.style.webkitTextStroke = '0';
      } else {
        s.classList.remove('selected');
        s.style.color = 'transparent';
        s.style.webkitTextStroke = '1px #ffb400';
      }
    });
  }
  // init: outline all
  pintar(0);
  stars.forEach((star, idx) => {
    star.addEventListener('mouseenter', () => pintar(idx+1));
    star.addEventListener('mouseleave', () => pintar(seleccion));
    star.addEventListener('click', () => {
      seleccion = idx+1;
      pintar(seleccion);
    });
  });

  // Manejo de "Publicar reseña" -> simulación ID no reconocido y modal
  const btnPublicar = document.querySelector('.btn-publicar');
  const idInput = document.getElementById('id-compra');
  if (btnPublicar && idInput) {
    btnPublicar.addEventListener('click', (e) => {
      e.preventDefault();
      // Para demo: siempre mostrar modal de "ID no reconocido"
      const id = idInput.value || '';
      mostrarModalIdNoReconocido(id);
    });
  }

  function mostrarModalIdNoReconocido(id) {
    // modal simple
    const modal = document.createElement('div');
    modal.className = 'mi-modal';
    modal.innerHTML = `
      <div class="mi-modal-contenido" role="dialog" aria-modal="true">
        <h3>ID no reconocido</h3>
        <p>No se ha podido verificar el ID <strong>${id || 'ID-456-XXX-XXX'}</strong>. Verifica en tu correo electrónico la boleta o comprobante de compra.</p>
        <div class="mi-modal-botones">
          <button class="mi-modal-intentar">Volver a intentar</button>
          <button class="mi-modal-cerrar">Cerrar ventana</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.querySelector('.mi-modal-cerrar').addEventListener('click', closeModal);
    modal.querySelector('.mi-modal-intentar').addEventListener('click', () => {
      closeModal();
      idInput.focus();
    });
    function closeModal() {
      modal.remove();
      document.body.style.overflow = '';
    }
  }
})();

// Persiste datos para mantener coherencia entre visitas