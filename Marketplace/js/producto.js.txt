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
  document.getElementById("envio").textContent = metodoEnvio;

  // --- Información sobre el vendedor dinámica y persistente ---
  function getVendedorInfo(nombre) {
    let vendedores = JSON.parse(localStorage.getItem('vendedoresMarketplace')) || {};
    if (!vendedores[nombre]) {
      // Fecha
      const fecha = new Date(2022 + Math.floor(Math.random()*4), Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1);
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
      vendedores[nombre] = { activoDesde, numero, ventas, volumen };
      localStorage.setItem('vendedoresMarketplace', JSON.stringify(vendedores));
    }
    return vendedores[nombre];
  }
  const vendedorInfo = getVendedorInfo(producto.seller);
  document.getElementById("vendedor-info").textContent = producto.seller;
  document.querySelector(".seller-row:nth-child(2) span:last-child").textContent = vendedorInfo.activoDesde;
  document.querySelector(".seller-row:nth-child(3) span:last-child").innerHTML = `<a href="https://wa.me/${vendedorInfo.numero.replace(/\D/g,'')}" target="_blank">${vendedorInfo.numero}</a>`;
  document.querySelector(".seller-row:nth-child(4) span:last-child").textContent = vendedorInfo.ventas;
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

        comentarios.push({
          nombre,
          codigoBandera,
          ciudad,
          fecha: `${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${2020 + Math.floor(Math.random()*6)}`,
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

  // --- Rellenar datos principales ---
  document.getElementById("nombre-producto").textContent = producto.title;
  document.getElementById("proveedor").innerHTML = `${producto.supplier} <svg class="check-verificado" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#3897f0"/><path d="M17 8l-6.5 7L7 11.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.getElementById("vendedor").textContent = producto.seller;
  document.getElementById("precio").textContent = producto.priceFormatted.replace("Gs. ", "");
  
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
    ratingDiv.innerHTML = `
      ${estrellas}
      <span class="puntuacion">${producto.rating.toFixed(1)}</span>
      <span class="reviews">(${Number(producto.reviews || 0).toLocaleString('es-ES')})</span>
    `;
  }
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

localStorage.removeItem('vendedoresMarketplace');
localStorage.removeItem('comentariosPorProducto');