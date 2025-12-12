/* =========================================================================
   Woz Marketplace - js/app.js
   - Genera datos ficticios (500 productos)
   - Implementa infinite scroll, filtros, búsqueda y export CSV
   - Diseñado mobile-first y eficiente para dispositivos de baja gama
   ========================================================================= */

/* -----------------------------
   Configuración / constantes
   ----------------------------- */
const TOTAL_PRODUCTS = 500;
const PAGE_SIZE = 20; // cantidad que se renderiza por paso en el infinite scroll

const SUPPLIERS = [
  "Amazon",
  "AliExpress",
  "Walmart",
  "Ebay",
  "Woz Marketplace",
  "Woz Dropshipping"
];

// Distribución de precios (como solicitaste):
// - 10% cerca de 50.000 Gs
// - 20% entre 100.000 y 800.000
// - resto entre 1.000.000 y 5.000.000
const PRICE_BUCKETS = [
  { pct: 0.10, min: 40000, max: 60000 },
  { pct: 0.20, min: 100000, max: 800000 },
  { pct: 0.70, min: 1000000, max: 5000000 }
];

/* -----------------------------
   Helpers
   ----------------------------- */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function integer(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Formatea número con separador de miles (Gs)
function formatGs(n) {
  // Asegurar entero
  const v = Math.round(n);
  // Usamos punto como separador de miles y coma para decimales (convención latino)
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Genera rating realista <= 4.5 con 1 decimal
function genRating() {
  const r = Math.random() * 3.5 + 1.0; // entre 1.0 y 4.5
  return Math.round(r * 10) / 10;
}

// Genera precio respetando distribución
function genPrice() {
  const r = Math.random();
  let acc = 0;
  for (const bucket of PRICE_BUCKETS) {
    acc += bucket.pct;
    if (r <= acc) {
      return integer(bucket.min, bucket.max);
    }
  }
  // fallback
  return integer(100000, 800000);
}

/* -----------------------------
   Datos auxiliares: categorías, droppers, nombres de productos
   ----------------------------- */

// Lista base de palabras para generar categorías y nombres
const baseCategoryWords = [
  "Ropa", "Deporte", "Hogar", "Cocina", "Juguetes", "Bebés", "Electrónica", "Accesorios",
  "Belleza", "Cuidado", "Mascotas", "Jardín", "Muebles", "Herramientas", "Automotriz",
  "Oficina", "Moda", "Calzado", "Relojes", "Joyas", "Computación", "Audio", "Video",
  "Iluminación", "Seguridad", "Viaje", "Camping", "Ciclismo", "Fitness", "Yoga", "Cuidado personal"
];

// Generar al menos 220 categorías combinando palabras y sufijos
const CATEGORIES = (function makeCategories() {
  const cats = new Set();
  // agregar algunas categorías comunes en español
  const seed = [
    "Celulares y Telefonía", "Electrodomésticos", "Audio portátil", "Cámaras",
    "Hogar inteligente", "Decoración", "Alimentos y bebidas", "Material escolar",
    "Instrumentos musicales", "Cuidado del auto", "Repuestos", "Herramientas eléctricas",
    "Productos orgánicos", "Cuidado facial", "Maquillaje", "Perfumes", "Ropa hombre",
    "Ropa mujer", "Ropa niño", "Calzado deportivo", "Sandalias", "Botas", "Abrigos",
    "Trajes de baño", "Ropa interior", "Sábanas", "Cortinas", "Iluminación LED"
  ];
  seed.forEach(s => cats.add(s));

  // Combinar palabras base y sufijos
  const sufijos = ["Accesorios", "Kit", "Set", "Repuestos", "Pro", "Premium", "Económico", "Compacto", "Línea", "Plus"];
  while (cats.size < 220) {
    const a = pick(baseCategoryWords);
    const b = pick(baseCategoryWords);
    const s = pick(sufijos);
    const candidate = `${a} ${b} ${s}`;
    cats.add(candidate);
  }
  return Array.from(cats);
})();

// Generar droppers (vendedores reales-sounding español latino)
const FIRST_NAMES = ["Carlos","María","Juan","Lucía","Miguel","Sofía","José","Valentina","Pedro","Ana","Luis","Camila","Ricardo","Fernanda","Diego","Paula","Martín","Juliana","Gustavo","Gabriela","Rafael","Mónica","Santiago","Isabel","Andrés"];
const LAST_NAMES = ["González","Rodríguez","López","Martínez","Gutiérrez","Pérez","Sánchez","Díaz","Ramírez","Torres","Ruiz","Flores","Vargas","Castro","Ramos","Herrera","Álvarez","Morales","Medina","Suárez"];
const DROPPERS = (function makeDroppers() {
  const arr = [];
  const count = 120;
  for (let i = 0; i < count; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    arr.push(`${fn} ${ln}`);
  }
  // deduplicate just in case
  return Array.from(new Set(arr));
})();

/* Lista de plantillas de nombres de productos en español (latam) */
const PRODUCT_TEMPLATES = [
  "Carrito para bebé {mod}",
  "Cargador rápido USB-C {mod}",
  "Auriculares inalámbricos {mod}",
  "Smartwatch deportivo {mod}",
  "Almohada ergonómica {mod}",
  "Silla de oficina {mod}",
  "Set de sartenes antiadherente {mod}",
  "Cámara de seguridad IP {mod}",
  "Juego de herramientas {mod}",
  "Bombilla LED inteligente {mod}",
  "Mochila urbana {mod}",
  "Ropa deportiva para correr {mod}",
  "Zapatillas running {mod}",
  "Terminal POS portátil {mod}",
  "Purificador de agua compacto {mod}",
  "Secadora de cabello profesional {mod}",
  "Cama para mascotas {mod}",
  "Cargador solar portátil {mod}",
  "Soporte para laptop ajustable {mod}",
  "Kit de limpieza para auto {mod}",
  "Lentes de sol polarizados {mod}",
  "Colchón inflable portátil {mod}",
  "Organizador de cocina {mod}",
  "Cámara instantánea {mod}",
  "Mini proyector portátil {mod}"
];

const MODIFIERS = ["Edición 2025", "Plus", "Mini", "Pro", "Lite", "Versión A", "Versión B", "Deluxe", "Compacto", "Sport"];

/* -----------------------------
   Generar productos
   ----------------------------- */

function genSKU(index) {
  return `woz-sku-${String(index).padStart(4, "0")}`;
}

function generateProducts(name) {
  const products = [];
  for (let i = 1; i <= name; i++) {
    // nombre basado en plantilla
    const tpl = pick(PRODUCT_TEMPLATES);
    const mod = pick(MODIFIERS);
    const name = tpl.replace("{mod}", mod);

    // supplier y vendedor
    const supplier = pick(SUPPLIERS);
    const seller = pick(DROPPERS);

    // category
    const category = pick(CATEGORIES);

    // price según distribución
    const price = genPrice();

    // rating y reviews
    const rating = genRating();
    const reviews = integer(5, 12000);

    // create object
    const product = {
      sku: genSKU(i),
      title: name,
      category,
      supplier,
      seller,
      price,
      priceFormatted: `Gs. ${formatGs(price)}`,
      rating,
      reviews,
      description: `Descripción del producto: ${name}. Ideal para uso diario. Producto ficticio para demo.`,
      sent_by_verified: true, // visual: check azul
      promoted: i <= 5 // Solo los primeros 5 productos
    };

    products.push(product);
  }
  return products;
}

/* -----------------------------
   Estado de la app y render
   ----------------------------- */
const state = {
  allProducts: [],   // todos los generados
  filtered: [],      // resultado del filtro actual
  renderedCount: 0,  // cuantos se han añadido al DOM
  pageSize: PAGE_SIZE,
  filters: {
    query: "",
    category: null,
    supplier: null,
    seller: null,
    priceRange: null, // e.g. {min: 0, max: 500000}
    minRating: 0,
    country: "Paraguay",
    dropperToggle: true // valor del toggle
  }
};

/* -----------------------------
   DOM referencias
   ----------------------------- */
const el = {
  productList: document.getElementById("product-list"),
  sentinel: document.getElementById("scroll-sentinel"),
  searchInput: document.getElementById("search-input"),
  countryBtn: document.getElementById("country-btn"),
  dropperToggle: document.getElementById("dropper-toggle"),
  filtersToggle: null // creado dinámicamente si no existe
};

/* -----------------------------
   Render de una tarjeta de producto (string HTML)
   ----------------------------- */
function createProductCardHTML(p) {
  // estrellas visuales basadas en rating (max 5)
  const fullStars = Math.floor(p.rating);
  const half = (p.rating - fullStars) >= 0.5;
  let stars = "";
  for (let i = 0; i < fullStars; i++) stars += "★";
  if (half) stars += "☆";
  // rellenar hasta 5
  while (stars.length < 5) stars += "☆";

  const promotedMarkup = p.promoted ? `<span class="ad-pill">Impulsado por Woz Ads</span>` : "";

  // Botones: Ver producto -> product.html?sku=..., Comprar -> checkout.html?sku=...
  return `
    <article class="product-card" data-sku="${p.sku}">
      <div class="product-card-inner">
        <header class="product-card-header">
          <h3 class="product-title">${escapeHtml(p.title)}</h3>
          ${promotedMarkup}
        </header>

        <p class="meta">
          <span class="sent-by">Enviado por: <strong>${escapeHtml(p.supplier)}</strong> <span class="verified">✔︎</span></span>
          <span class="sold-by">Vendido por: <strong>${escapeHtml(p.seller)}</strong></span>
        </p>

        <p class="price">Precio: <strong>Gs. ${formatGs(p.price)}</strong></p>

        <div class="rating">
          <span class="stars">${stars}</span>
          <span class="score">${p.rating.toFixed(1)}</span>
          <span class="reviews">(${p.reviews.toLocaleString()})</span>
        </div>

        <p class="other-sellers">Otros vendedores están vendiendo el mismo producto</p>

        <div class="product-actions">
          <a class="btn btn-ghost" href="producto.html?sku=${encodeURIComponent(p.sku)}">Ver producto</a>
          <button class="btn btn-primary buy-btn" data-product-sku="${encodeURIComponent(p.sku)}">Comprar</button>
          <button class="btn btn-outline wozchat-btn">WozChat</button>
        </div>
      </div>
    </article>
  `;
}

/* escape HTML simple */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* -----------------------------
   Render parcial (añadir N productos más)
   ----------------------------- */
function renderNextBatch() {
  const start = state.renderedCount;
  const end = Math.min(state.filtered.length, start + state.pageSize);
  if (start >= end) return;

  const fragment = document.createDocumentFragment();
  const temp = document.createElement("div");
  let html = "";

  // Agrupa los primeros 5 productos promovidos en un cuadro especial
  if (start === 0 && state.filtered.length > 0 && state.filtered[0].promoted) {
    html += `<div class="wozads-group">`;
    for (let i = 0; i < Math.min(5, state.filtered.length); i++) {
      html += `
        <div class="wozads-badge">Impulsado por Woz Ads</div>
        ${createProductCardHTML(state.filtered[i])}
      `;
    }
    html += `</div>`;
    state.renderedCount = 5;
  }

  // Renderiza el resto normalmente
  for (let i = state.renderedCount; i < end; i++) {
    html += createProductCardHTML(state.filtered[i]);
  }
  temp.innerHTML = html;
  Array.from(temp.children).forEach(c => fragment.appendChild(c));
  el.productList.insertBefore(fragment, el.sentinel);

  state.renderedCount = end;

  attachBuyHandlers();
}

/* -----------------------------
   Attach Buy Buttons handlers (delegación ligera)
   ----------------------------- */
function attachBuyHandlers() {
  // Seleccionamos todos los botones buy que no tengan data-attached
  const buys = el.productList.querySelectorAll(".buy-btn:not([data-attached])");
  buys.forEach(btn => {
    btn.setAttribute("data-attached", "1");
    btn.addEventListener("click", (e) => {
      const sku = btn.getAttribute("data-product-sku");
      // redirigir a checkout con sku
      window.location.href = `checkout.html?sku=${encodeURIComponent(sku)}`;
    });
  });
}

/* -----------------------------
   Aplicar filtros y búsqueda -> produce state.filtered
   ----------------------------- */
function applyFilters() {
  const f = state.filters;
  const q = (f.query || "").trim().toLowerCase();
  state.filtered = state.allProducts.filter(p => {
    // dropper toggle: si está activo (true) mostramos todo; si false, por ejemplo podríamos ocultar productos "promoted"?
    // En la UI original el toggle sugiere "Sos Dropper?" — aquí lo usaremos como filtro para mostrar solo productos con supplier Woz Marketplace/Dropshipping si está ON
    if (f.dropperToggle) {
      // no hacemos filtro por dropper en true (mostrar todo)
    } else {
      // si está apagado, filtramos para mostrar solo productos enviados por proveedores externos (AliExpress, Amazon, etc.)
      if (p.supplier === "Woz Marketplace" || p.supplier === "Woz Dropshipping") return false;
    }

    if (f.category && p.category !== f.category) return false;
    if (f.supplier && p.supplier !== f.supplier) return false;
    if (f.seller && p.seller !== f.seller) return false;

    if (f.priceRange) {
      if (p.price < f.priceRange.min || p.price > f.priceRange.max) return false;
    }

    if (f.minRating && p.rating < f.minRating) return false;

    if (q) {
      const inTitle = p.title.toLowerCase().includes(q);
      const inSeller = p.seller.toLowerCase().includes(q);
      const inCategory = p.category.toLowerCase().includes(q);
      if (!(inTitle || inSeller || inCategory)) return false;
    }

    // Country selection is currently informative (no shipping simulation), but we keep it for future use
    return true;
  });

  // reset render count and clear DOM list (but conservar sentinel)
  // remover todas las tarjetas previas excepto sentinel
  const cards = el.productList.querySelectorAll(".product-card");
  cards.forEach(c => c.remove());
  state.renderedCount = 0;

  // si filtered está vacío, mostrar mensaje
  if (state.filtered.length === 0) {
    el.productList.insertBefore(createNoResultsElement(), el.sentinel);
  } else {
    // renderiza primer batch
    renderNextBatch();
  }
}

/* -----------------------------
   No results element
   ----------------------------- */
function createNoResultsElement() {
  const div = document.createElement("div");
  div.className = "no-results";
  div.style.padding = "1rem";
  div.style.textAlign = "center";
  div.innerHTML = `<p style="color:#666">No se encontraron productos con esos filtros.</p>`;
  return div;
}

/* -----------------------------
   Infinite scroll con IntersectionObserver
   ----------------------------- */
function setupInfiniteScroll() {
  const obs = new IntersectionObserver(async (entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        // render next batch
        renderNextBatch();
      }
    }
  }, {
    root: null,
    rootMargin: "200px",
    threshold: 0.1
  });
  obs.observe(el.sentinel);
}

/* -----------------------------
   UI: country selector simple (lista de países)
   ----------------------------- */
function setupCountrySelector() {
  const countries = ["Paraguay", "Argentina", "Brasil", "Chile", "Uruguay", "Bolivia", "Perú", "Estados Unidos", "China"];
  el.countryBtn.addEventListener("click", () => {
    // abrir un prompt simple (mobile friendly)
    const choice = prompt("Seleccione país (escriba exactamente):\n" + countries.join(", "), state.filters.country);
    if (!choice) return;
    if (!countries.includes(choice)) {
      alert("País no válido. Ejemplos: " + countries.join(", "));
      return;
    }
    state.filters.country = choice;
    el.countryBtn.textContent = `Comprar en ${choice} ▾`;
  });
}

/* -----------------------------
   Filtros UI (panel simple) - crea un modal overlay ligero
   ----------------------------- */
function createFiltersPanel() {
  // overlay
  const overlay = document.createElement("div");
  overlay.id = "filters-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.35)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "flex-end";
  overlay.style.zIndex = "9999";

  const panel = document.createElement("div");
  panel.style.width = "100%";
  panel.style.maxHeight = "85%";
  panel.style.background = "#fff";
  panel.style.borderTopLeftRadius = "12px";
  panel.style.borderTopRightRadius = "12px";
  panel.style.overflow = "auto";
  panel.style.padding = "1rem";

  // content: search, category select, supplier, price ranges, rating min, seller
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.6rem;">
      <strong>Filtros</strong>
      <button id="filters-close" style="background:none; border:none; font-weight:700; font-size:1rem;">Cerrar ✕</button>
    </div>

    <div style="margin-bottom:.6rem;">
      <label style="font-weight:600; font-size:.9rem;">Buscar</label>
      <input id="filter-query" type="search" placeholder="Buscar por producto, vendedor o categoria" style="width:100%; padding:.6rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
    </div>

    <div style="margin-bottom:.6rem;">
      <label style="font-weight:600; font-size:.9rem;">Categoría</label>
      <select id="filter-category" style="width:100%; padding:.6rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
        <option value="">(Todas las categorías)</option>
      </select>
    </div>

    <div style="display:flex; gap:.5rem; margin-bottom:.6rem;">
      <div style="flex:1;">
        <label style="font-weight:600; font-size:.9rem;">Proveedor</label>
        <select id="filter-supplier" style="width:100%; padding:.5rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
          <option value="">(Todos)</option>
        </select>
      </div>

      <div style="flex:1;">
        <label style="font-weight:600; font-size:.9rem;">Calificación mínima</label>
        <select id="filter-rating" style="width:100%; padding:.5rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
          <option value="0">(Cualquiera)</option>
          <option value="4.5">4.5+</option>
          <option value="4.0">4.0+</option>
          <option value="3.5">3.5+</option>
          <option value="3.0">3.0+</option>
        </select>
      </div>
    </div>

    <div style="margin-bottom:.6rem;">
      <label style="font-weight:600; font-size:.9rem;">Rango de precio</label>
      <select id="filter-price" style="width:100%; padding:.6rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
        <option value="">(Todos)</option>
        <option value="0-60000">Hasta Gs. 60.000</option>
        <option value="60001-999999">Gs. 60.001 - Gs. 999.999</option>
        <option value="1000000-5000000">Gs. 1.000.000 - Gs. 5.000.000</option>
      </select>
    </div>

    <div style="margin-bottom:.6rem;">
      <label style="font-weight:600; font-size:.9rem;">Vendedor</label>
      <select id="filter-seller" style="width:100%; padding:.6rem; border-radius:8px; border:1px solid #eee; margin-top:.3rem;">
        <option value="">(Todos)</option>
      </select>
    </div>

    <div style="display:flex; gap:.5rem; margin-top: .5rem;">
      <button id="apply-filters" style="flex:1; padding:.7rem; border-radius:10px; background:#19B44C; color:#fff; border:none; font-weight:700;">Aplicar</button>
      <button id="clear-filters" style="flex:1; padding:.7rem; border-radius:10px; background:#eee; color:#333; border:none; font-weight:700;">Limpiar</button>
    </div>

    <div style="margin-top:.8rem; font-size:.9rem; color:#666;">
      <small>Consejo: usa la búsqueda rápida arriba para filtrar por título sin abrir este panel.</small>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // populate selects: categories, suppliers, sellers
  const catSel = overlay.querySelector("#filter-category");
  CATEGORIES.forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    catSel.appendChild(o);
  });

  const supSel = overlay.querySelector("#filter-supplier");
  SUPPLIERS.forEach(s => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    supSel.appendChild(o);
  });

  const sellerSel = overlay.querySelector("#filter-seller");
  // top droppers first
  DROPPERS.slice(0, 80).forEach(seller => {
    const o = document.createElement("option");
    o.value = seller;
    o.textContent = seller;
    sellerSel.appendChild(o);
  });

  // listeners
  overlay.querySelector("#filters-close").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#apply-filters").addEventListener("click", () => {
    // read values and apply
    const q = overlay.querySelector("#filter-query").value || "";
    const category = overlay.querySelector("#filter-category").value || null;
    const supplier = overlay.querySelector("#filter-supplier").value || null;
    const minRating = parseFloat(overlay.querySelector("#filter-rating").value) || 0;
    const priceVal = overlay.querySelector("#filter-price").value || null;
    const seller = overlay.querySelector("#filter-seller").value || null;

    state.filters.query = q;
    state.filters.category = category;
    state.filters.supplier = supplier;
    state.filters.minRating = minRating;
    state.filters.seller = seller;

    if (priceVal) {
      const [min, max] = priceVal.split("-").map(x => parseInt(x, 10));
      state.filters.priceRange = { min, max };
    } else {
      state.filters.priceRange = null;
    }

    overlay.remove();
    applyFilters();
  });

  overlay.querySelector("#clear-filters").addEventListener("click", () => {
    overlay.querySelector("#filter-query").value = "";
    overlay.querySelector("#filter-category").value = "";
    overlay.querySelector("#filter-supplier").value = "";
    overlay.querySelector("#filter-rating").value = "0";
    overlay.querySelector("#filter-price").value = "";
    overlay.querySelector("#filter-seller").value = "";
  });
}

/* -----------------------------
   Buscar (input principal)
   ----------------------------- */
function setupSearch() {
  if (!el.searchInput) return;
  // debounce input
  let t;
  el.searchInput.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.filters.query = e.target.value || "";
      applyFilters();
    }, 350);
  });
}

/* -----------------------------
   Toggle dropper
   ----------------------------- */
function setupDropperToggle() {
  if (!el.dropperToggle) return;
  el.dropperToggle.addEventListener("change", (e) => {
    state.filters.dropperToggle = e.target.checked;
    applyFilters();
  });
}

/* -----------------------------
   Exportar productos visibles a CSV
   ----------------------------- */
function exportVisibleToCSV() {
  // export state.filtered (todos) or solo los renderizados? Exportar todos filtrados
  const rows = [["sku","title","category","supplier","seller","price","rating","reviews","description"]];
  state.filtered.forEach(p => {
    rows.push([
      p.sku,
      p.title,
      p.category,
      p.supplier,
      p.seller,
      p.price,
      p.rating,
      p.reviews,
      p.description.replace(/\n/g, " ")
    ]);
  });
  const csv = rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `woz_products_export_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -----------------------------
   Init: generar datos y boot
   ----------------------------- */
function initApp() {
  // 1. Generar productos ficticios
  state.allProducts = generateProducts(TOTAL_PRODUCTS);

  // 2. Leer productos publicados por el usuario
  let productosUsuario = JSON.parse(localStorage.getItem('productosMarketplace')) || [];

  // 3. Combinar ambos
  state.allProducts = [...productosUsuario, ...generateProducts(TOTAL_PRODUCTS)];

  // ordenar y filtrar
  state.allProducts.sort((a,b) => (b.promoted - a.promoted) || (b.rating - a.rating) || (a.price - b.price));
  state.filtered = state.allProducts.slice();

  // GUARDA EL ARRAY FINAL EN LOCALSTORAGE
  localStorage.setItem('productosGeneradosMarketplace', JSON.stringify(state.allProducts));

  // attach filter toggle and search
  setupSearch();
  setupCountrySelector();
  setupDropperToggle();

  // create a small "Filtros" button if not presente
  // buscamos un elemento con class filters-toggle en el DOM
  const filtersBtn = document.querySelector(".filters-toggle");
  if (filtersBtn) {
    filtersBtn.addEventListener("click", () => {
      createFiltersPanel();
    });
  }

  // crear botón export en footer (pequeño)
  const footer = document.querySelector(".footer-inner");
  if (footer) {
    const expBtn = document.createElement("button");
    expBtn.textContent = "Exportar productos";
    expBtn.style.marginLeft = "10px";
    expBtn.style.padding = "6px 10px";
    expBtn.style.borderRadius = "8px";
    expBtn.style.background = "#0C1C38";
    expBtn.style.color = "#fff";
    expBtn.style.border = "none";
    expBtn.style.fontWeight = "700";
    expBtn.addEventListener("click", exportVisibleToCSV);
    footer.appendChild(expBtn);
  }

  // render first batch
  applyFilters();

  // setup infinite scroll
  setupInfiniteScroll();

  // small UX: show total count in the header (if exists)
  const countEl = document.querySelector(".list-header .muted");
  if (countEl) {
    countEl.textContent = `${state.allProducts.length.toLocaleString()} productos activos`;
  }

  // show supplier list somewhere? not necessary, but we can show first supplier set on load
  const supplierChipsContainer = document.querySelector(".chips");
  if (supplierChipsContainer) {
    // agregar chips rápidos de los proveedores
    SUPPLIERS.forEach(s => {
      const b = document.createElement("button");
      b.className = "chip outlined";
      b.textContent = s;
      b.addEventListener("click", () => {
        state.filters.supplier = s;
        applyFilters();
      });
      supplierChipsContainer.appendChild(b);
    });
  }
}

/* -----------------------------
   Utilities
   ----------------------------- */

// run init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // ensure el refs are present (some may be null)
  el.productList = document.getElementById("product-list");
  el.sentinel = document.getElementById("scroll-sentinel");
  el.searchInput = document.getElementById("search-input");
  el.countryBtn = document.getElementById("country-btn");
  el.dropperToggle = document.getElementById("dropper-toggle");

  // safety checks
  if (!el.productList || !el.sentinel) {
    console.error("No se encontró el contenedor de productos o sentinel. Asegúrate que el HTML tenga #product-list y #scroll-sentinel.");
    return;
  }

  initApp();
});

const paises = [
  "Paraguay", "Argentina", "Brasil", "Chile", "Uruguay", "Perú", "Colombia", "Bolivia", "Ecuador", "Venezuela", "México", "Costa Rica", "Panamá", "Guatemala", "El Salvador", "Honduras", "Nicaragua", "República Dominicana", "Cuba", "Puerto Rico", "Estados Unidos", "China"
];
const paisDropdownBtn = document.getElementById('country-btn');
const paisDropdownMenu = document.getElementById('paisDropdownMenu');
if (paisDropdownBtn && paisDropdownMenu) {
  paisDropdownBtn.addEventListener('click', () => {
    paisDropdownMenu.style.display = paisDropdownMenu.style.display === 'block' ? 'none' : 'block';
  });
  paisDropdownMenu.innerHTML = paises.map(p => `<div class="dropdown-item">${p}</div>`).join('');
  paisDropdownMenu.addEventListener('click', e => {
    if (e.target.classList.contains('dropdown-item')) {
      paisDropdownBtn.textContent = `Comprar en ${e.target.textContent} ▼`;
      paisDropdownMenu.style.display = 'none';
      // Aquí podrías filtrar productos por país si lo deseas
    }
  });
}

// Categorías
// Categorías
const categorias = Array.from({length:200}, (_,i)=>`Categoría ${i+1}`);
const categoriasBtn = document.getElementById('categoriasBtn');
const categoriasMenu = document.getElementById('categoriasMenu');
if (categoriasBtn && categoriasMenu) {
  categoriasBtn.addEventListener('click', () => {
    categoriasMenu.style.display = categoriasMenu.style.display === 'block' ? 'none' : 'block';
  });
  categoriasMenu.innerHTML = categorias.map(c => `<div class="dropdown-item">${c}</div>`).join('');
}

// Droppers
const nombres = ["Juan", "Pedro", "Ana", "Maria", "Luis", "Carlos", "Lucia", "Sofia", "Miguel", "Jose", "Camila", "Valentina", "Jorge", "Andres", "Paula", "Martina", "Diego", "Gabriel", "Emilia", "Agustin", "Victoria", "Mateo", "Julieta", "Lucas", "Martín", "Florencia", "Santiago", "Daniela", "Facundo", "Antonella", "Bruno", "Renata", "Tomas", "Mia", "Benjamin", "Isabella", "Samuel", "Gabriela", "Dylan", "Nicole", "Sebastian", "Lola", "Thiago", "Lautaro", "Agustina", "Valeria", "Franco", "Milagros", "Ramiro", "Cecilia", "Maximiliano"];
function randomName() {
  return `${nombres[Math.floor(Math.random()*nombres.length)]} ${nombres[Math.floor(Math.random()*nombres.length)]}`;
}
const droppers = Array.from({length:1000}, ()=>({
  nombre: randomName(),
  estrellas: (Math.random()*2+3).toFixed(1)
}));
const droppersBtn = document.getElementById('droppersBtn');
const droppersMenu = document.getElementById('droppersMenu');
if (droppersBtn && droppersMenu) {
  droppersBtn.addEventListener('click', () => {
    droppersMenu.style.display = droppersMenu.style.display === 'block' ? 'none' : 'block';
  });
  droppersMenu.innerHTML = droppers.map(d => `<div class="dropdown-item">${d.nombre} <span style="color:#ffb400;font-weight:700;">${d.estrellas} ★</span></div>`).join('');
}
const filtrosBtn = document.getElementById('filtrosBtn');
const filtrosMenu = document.getElementById('filtrosMenu');
if (filtrosBtn && filtrosMenu) {
  filtrosBtn.addEventListener('click', () => {
    filtrosMenu.style.display = filtrosMenu.style.display === 'block' ? 'none' : 'block';
  });
}

const productos = Array.from({length:500}, (_, i) => ({
  titulo: `${pick(["Carrito", "Silla", "Cuna", "Bicicleta", "Luz", "Candado", "Mochila", "Alforja", "Soporte", "Guardabarros", "Portaequipaje", "Timbrillo", "Manubrio", "Asiento", "Bomba", "Guantes", "Lentes", "Portabotellas", "Cubierta", "Cesta", "Pantalón"])} ${pick(["urbano", "plegable", "premium", "pro", "deluxe", "económico", "multiuso", "resistente", "infantil", "moderno", "seguro", "ergonómico"])}`,
  proveedor: "AliExpress",
  vendedor: randomName(),
  precio: Math.floor(Math.random() * (12000000 - 20000) + 20000),
  estrellas: (Math.random()*2+3).toFixed(1),
  reviews: Math.floor(Math.random()*4000+200),
  wozAds: i < 5
}));

// 1. Generar productos ficticios
let productosGenerados = generateProducts(TOTAL_PRODUCTS);

// Guarda los productos generados en localStorage
localStorage.setItem('productosGeneradosMarketplace', JSON.stringify(productosGenerados));

// Si tienes productos publicados por el usuario, combínalos para mostrar en la lista
let productosUsuario = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
let productosParaMostrar = [...productosUsuario, ...productosGenerados];

// Usa productosParaMostrar para renderizar la lista
// ...existing code...

/* ---------- FILTROS: populate + modal + aplicar ---------- */
(function setupFiltersUI(){
  const openBtn = document.getElementById('openFiltersBtn');
  const closeBtn = document.getElementById('closeFiltersBtn');
  const modal = document.getElementById('filtersModal');
  const backdrop = document.getElementById('filtersBackdrop');
  const applyBtn = document.getElementById('applyFilters');
  const clearBtn = document.getElementById('clearFilters');

  function getProductsSource() {
    // intenta usar variable expuesta por tu app.js, si no fallback a localStorage
    return window.__WOZ_PRODUCTS || JSON.parse(localStorage.getItem('productosGeneradosMarketplace') || '[]');
  }

  function unique(arr) { return Array.from(new Set(arr)); }

  function populateSelects() {
    const products = getProductsSource();
    const providers = unique(products.map(p=>p.supplier).filter(Boolean)).sort();
    const vendors = unique(products.map(p=>p.seller).filter(Boolean)).sort();
    const categories = unique(products.map(p=>p.category).filter(Boolean)).sort();

    const toOption = (v) => `<option value="${v}">${v}</option>`;

    const providerEl = document.getElementById('providerFilter');
    if (providerEl) providerEl.innerHTML = `<option value="all">Todos los proveedores</option>` + providers.map(toOption).join('');
    const vendorEl = document.getElementById('vendorFilter');
    if (vendorEl) vendorEl.innerHTML = `<option value="all">Todos los vendedores</option>` + vendors.map(toOption).join('');
    const catEl = document.getElementById('categoryFilter');
    if (catEl) catEl.innerHTML = `<option value="all">Todas las categorías</option>` + categories.map(toOption).join('');
  }

  function openModal(){ if (modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; } }
  function closeModal(){ if (modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } }

  function applyFiltersHandler(){
    const provider = document.getElementById('providerFilter')?.value || 'all';
    const vendor = document.getElementById('vendorFilter')?.value || 'all';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const rating = document.getElementById('ratingFilter')?.value || 'all';
    const sort = document.getElementById('sortSelect')?.value || 'relevance';

    // Si existe una función global applyFilters en tu app, llámala (mantiene compatibilidad)
    if (typeof window.applyFilters === 'function') {
      closeModal();
      window.applyFilters(); // tu función debe leer los selects existentes
      return;
    }

    // Fallback: filtra y renderiza con window.renderWozProducts si existe
    const products = getProductsSource();
    let out = products.slice();

    if (provider !== 'all') out = out.filter(p => p.supplier === provider);
    if (vendor !== 'all') out = out.filter(p => p.seller === vendor);
    if (category !== 'all') out = out.filter(p => p.category === category);
    if (rating !== 'all') out = out.filter(p => Number(p.rating) >= Number(rating));

    if (sort === 'price_low') out.sort((a,b)=>a.price - b.price);
    if (sort === 'price_high') out.sort((a,b)=>b.price - a.price);
    if (sort === 'rating_high') out.sort((a,b)=> (b.rating||0) - (a.rating||0));

    if (typeof window.renderWozProducts === 'function') {
      window.renderWozProducts(out);
    } else {
      // render simple si no existe renderWozProducts
      const container = document.getElementById('product-list');
      if (container) container.innerHTML = out.map(p => `
        <a class="card" href="producto.html?sku=${encodeURIComponent(p.sku)}">
          <div class="card-body">
            <h3 class="card-title">${p.title}</h3>
            <div class="card-meta">${p.supplier} · ${p.category}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <div class="card-price">Gs. ${Number(p.price).toLocaleString('es-ES')}</div>
              <div class="card-rating">${(p.rating||0).toFixed(1)} <small>(${(p.reviews||0).toLocaleString('es-ES')})</small></div>
            </div>
          </div>
        </a>
      `).join('');
    }

    closeModal();
  }

  function clearFiltersHandler(){
    ['providerFilter','vendorFilter','categoryFilter','ratingFilter','sortSelect'].forEach(id=>{
      const el = document.getElementById(id); if (el) el.value = 'all';
    });
    // restaura lista original
    if (typeof window.renderWozProducts === 'function') window.renderWozProducts(getProductsSource());
    closeModal();
  }

  // event listeners
  if (openBtn) openBtn.addEventListener('click', ()=>{ populateSelects(); openModal(); });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (applyBtn) applyBtn.addEventListener('click', applyFiltersHandler);
  if (clearBtn) clearBtn.addEventListener('click', clearFiltersHandler);

  // populate on load in case modal opened quickly
  populateSelects();
})();

/* ---------- SEED DATA + FILTROS AVANZADOS (vendedores visuales) ---------- */
(function seedAndFilterEnhancements(){
  const LS_PROD = 'productosGeneradosMarketplace';
  const LS_VEND = 'woz_vendors';
  const LS_PROV = 'woz_providers';
  const LS_CAT = 'woz_categories';

  // helpers
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  function unique(arr){ return Array.from(new Set(arr)); }

  // 1) providers reales
  const realProviders = ['AliExpress','Amazon','Walmart','eBay','Mercado Libre','Woz Dropshipping','Woz Marketplace','Almacenes XYZ','Linio','BestBuy'];
  if (!localStorage.getItem(LS_PROV)) localStorage.setItem(LS_PROV, JSON.stringify(realProviders));

  // 2) generar 200 vendedores únicos con rating 1.0-5.0
  if (!localStorage.getItem(LS_VEND)) {
    const first = ["Miguel","Lucía","Carlos","María","Pedro","Fernanda","Diego","Paula","Rafael","Valentina","Santiago","Mónica","Héctor","Juliana","Ricardo","Gabriela","Andrés","Luciano","Mariano","Patricia","Mateo","Emilia","Luis","Sofía","Jorge","Martina","Diego","Carla","Bruno","Laura"];
    const last = ["Gómez","Martínez","López","Fernández","Duarte","Benítez","Torres","Ramírez","González","Rivas","Vera","Acosta","Caballero","Sosa","Ayala","Franco","Vázquez","Medina","Paredes","Villalba","Alvarez","Navarro","Cruz","Morales","Ortiz","Silva","Herrera","Castro"];
    const vendors = [];
    const used = new Set();
    while (vendors.length < 200) {
      const name = `${pick(first)} ${pick(last)}`;
      if (used.has(name)) continue;
      used.add(name);
      const rating = +( (Math.random()*4) + 1 ).toFixed(1); // 1.0 - 5.0
      vendors.push({ name, rating });
    }
    localStorage.setItem(LS_VEND, JSON.stringify(vendors));
  }

  // 3) generar 200 categorías
  if (!localStorage.getItem(LS_CAT)) {
    const cats = [];
    const adjs = ['Pro','Plus','Essential','Compact','Premium','Eco','Smart','Active','Urban','Classic','Ultra','Mini','Max','Light','Home'];
    const nouns = ['Hogar','Electrónica','Cuidado personal','Jardín','Deportes','Accesorios','Ropa','Bebés','Oficina','Automotriz','Mascotas','Herramientas','Iluminación','Cocina','Belleza','Audio','Video','Gaming','Muebles','Viaje','Fitness','Seguridad','Juegos','Instrumentos','Jardinería'];
    const used = new Set();
    while (cats.length < 200) {
      const name = `${pick(nouns)} ${pick(adjs)} ${randInt(1,999)}`.trim();
      if (used.has(name)) continue;
      used.add(name);
      cats.push(name);
    }
    localStorage.setItem(LS_CAT, JSON.stringify(cats));
  }

  // 4) generar 500-700 productos si no existen, manteniendo la estructura que usa producto.js y checkout.js
  if (!localStorage.getItem(LS_PROD)) {
    const vendors = JSON.parse(localStorage.getItem(LS_VEND));
    const providers = JSON.parse(localStorage.getItem(LS_PROV));
    const categories = JSON.parse(localStorage.getItem(LS_CAT));
    const N = randInt(500,700);
    const productos = [];
    const adjectives = ['Compacto','Portátil','Avanzado','Ergonómico','Pro','Premium','Económico','Multifunción','Inteligente','Ligero'];
    const items = ['Purificador','Cargador','Almohada','Set de sartenes','Cámara','Organizador','Colchón','Cafetera','Monitor','Auricular','Batería','Luces','Soporte','Cepillo'];
    for (let i=1;i<=N;i++){
      const id = String(i).padStart(4,'0');
      const title = `${pick(adjectives)} ${pick(items)} Versión ${randInt(1,9)}`;
      const sellerObj = pick(vendors);
      const supplier = pick(providers);
      const category = pick(categories);
      const price = Math.round((Math.random()*900000)+15000);
      const rating = +( (sellerObj.rating * 0.5) + (Math.random()*2.5) + 1 ).toFixed(1); // mezcla vendedor + aleatorio
      const reviews = randInt(5, 15000);
      productos.push({
        sku: `woz-sku-${id}`,
        title,
        supplier,
        seller: sellerObj.name,
        price,
        priceFormatted: `Gs. ${price.toLocaleString('es-ES')}`,
        rating,
        reviews,
        description: null,
        category
      });
    }
    localStorage.setItem(LS_PROD, JSON.stringify(productos));
  }

  // expose products for other modules
  window.__WOZ_PRODUCTS = JSON.parse(localStorage.getItem(LS_PROD) || '[]');

  // 5) poblar selects mínimos y la lista visual de vendedores
  function populateFiltersFromSeed() {
    const products = window.__WOZ_PRODUCTS || JSON.parse(localStorage.getItem(LS_PROD) || '[]');
    const providers = JSON.parse(localStorage.getItem(LS_PROV) || '[]');
    const cats = JSON.parse(localStorage.getItem(LS_CAT) || '[]');
    const vendors = JSON.parse(localStorage.getItem(LS_VEND) || '[]');

    const providerEl = document.getElementById('providerFilter');
    if (providerEl) providerEl.innerHTML = `<option value="all">Todos los proveedores</option>` + providers.map(p=>`<option value="${p}">${p}</option>`).join('');

    const catEl = document.getElementById('categoryFilter');
    if (catEl) catEl.innerHTML = `<option value="all">Todas las categorías</option>` + cats.slice(0,200).map(c=>`<option value="${c}">${c}</option>`).join('');

    const vendorSelect = document.getElementById('vendorFilter');
    if (vendorSelect) {
      vendorSelect.innerHTML = `<option value="all">Todos los vendedores</option>` +
        vendors.map(v => `<option value="${v.name}">${v.name} — ${v.rating.toFixed(1)}★</option>`).join('');
      // opcional: aplicar filtro inmediatamente al cambiar el select
      vendorSelect.addEventListener('change', () => {
        if (typeof window.applyFilters === 'function') window.applyFilters();
      });
    }

    // mantener productos expuestos
    window.__WOZ_PRODUCTS = products;
  }

  // expose function globally so applyFiltersHandler (in your modal code) can read selects
  window.populateFiltersFromSeed = populateFiltersFromSeed;

  // call populate on load (safe)
  document.addEventListener('DOMContentLoaded', () => {
    try { populateFiltersFromSeed(); } catch(e){ /* silent */ }
  });

})();

/* ----------------------------------------------------------------------------
   Populate desktop filter vendor lists (>=1024px). Adds:
   - ~200 vendors with ratings
   - Top 40 vendors auto-selected by rating
   - New vendors (rotativo) with "Sin calificación" badge
   ---------------------------------------------------------------------------- */

(function () {
  // Datos: 200 vendedores (español / inglés / portugués mix) con calificación
  const vendors = [
    { name: "Luz del Sur Shop", rating: 4.8 },
    { name: "CasaVerde Mercado", rating: 4.6 },
    { name: "Tienda Aurora", rating: 4.5 },
    { name: "Atelier Nube", rating: 4.4 },
    { name: "Blue Harbor Goods", rating: 4.7 },
    { name: "Oliva & Co", rating: 4.3 },
    { name: "Mercado Nova", rating: 4.2 },
    { name: "Río Azul Comercio", rating: 4.1 },
    { name: "Nordic Homeware", rating: 4.5 },
    { name: "Estrella Trading", rating: 4.4 },
    { name: "Granero Urbano", rating: 4.0 },
    { name: "PixelMart", rating: 4.6 },
    { name: "CasaLima", rating: 4.3 },
    { name: "Sol & Sal", rating: 4.7 },
    { name: "Bosque Market", rating: 4.1 },
    { name: "Tienda Brisa", rating: 3.9 },
    { name: "Harbor Lane", rating: 4.2 },
    { name: "Marina Boutique", rating: 4.6 },
    { name: "Cosecha Local", rating: 4.0 },
    { name: "Viento Norte Shop", rating: 4.4 },
    { name: "Oliveira Empório", rating: 4.7 },
    { name: "Loom & Leaf", rating: 4.5 },
    { name: "Solstice Goods", rating: 4.8 },
    { name: "Tienda Terral", rating: 4.2 },
    { name: "Casa del Faro", rating: 3.8 },
    { name: "Pueblo Market", rating: 4.3 },
    { name: "Gran Mercado Verde", rating: 4.1 },
    { name: "Atlas Supplies", rating: 4.6 },
    { name: "Aroma y Miel", rating: 4.4 },
    { name: "Lagoa Boutique", rating: 4.5 },
    { name: "Mercado del Puerto", rating: 4.0 },
    { name: "Cálida Casa", rating: 3.9 },
    { name: "NorthField Co.", rating: 4.6 },
    { name: "Rústico & Moderno", rating: 4.2 },
    { name: "Verdor Shop", rating: 4.3 },
    { name: "Cabo Store", rating: 4.7 },
    { name: "Pádua Emporium", rating: 4.4 },
    { name: "Branco & Azul", rating: 4.1 },
    { name: "Willow Lane", rating: 4.8 },
    { name: "LimaCrafts", rating: 4.0 },
    { name: "Tienda Coral", rating: 4.5 },
    { name: "Marea Alta", rating: 4.2 },
    { name: "Madeira Goods", rating: 4.3 },
    { name: "Gran Via Market", rating: 4.6 },
    { name: "Punto Claro", rating: 4.1 },
    { name: "Crown & Clay", rating: 4.7 },
    { name: "Mercadillo 21", rating: 4.0 },
    { name: "Lobo Blanco Shop", rating: 3.8 },
    { name: "Oak & Olive", rating: 4.5 },
    { name: "Tallos Urbanos", rating: 4.2 },
    { name: "Puerto Nuevo Co", rating: 4.3 },
    { name: "Horizon Goods", rating: 4.6 },
    { name: "Casa do Vale", rating: 4.4 },
    { name: "Silva & Hermanos", rating: 4.1 },
    { name: "Círculo Market", rating: 4.0 },
    { name: "Boreal Finds", rating: 4.7 },
    { name: "Solana Mercancías", rating: 4.3 },
    { name: "Riverside Co.", rating: 4.5 },
    { name: "La Cabaña Verde", rating: 4.2 },
    { name: "Pine & Stone", rating: 4.8 },
    { name: "Lavanda Shop", rating: 4.1 },
    { name: "Mar Azul Comercio", rating: 4.4 },
    { name: "TerraNova", rating: 4.6 },
    { name: "Monte Claro", rating: 4.0 },
    { name: "Anchor Goods", rating: 4.2 },
    { name: "Casa Serena", rating: 4.3 },
    { name: "Vento Leste", rating: 4.5 },
    { name: "Mercado Siete", rating: 4.1 },
    { name: "Fusión Urbana", rating: 4.2 },
    { name: "Hacienda Market", rating: 4.4 },
    { name: "Praia Store", rating: 4.0 },
    { name: "Casa del Río", rating: 3.9 },
    { name: "Cedar & Co", rating: 4.6 },
    { name: "Azahar Boutique", rating: 4.5 },
    { name: "Lumen House", rating: 4.7 },
    { name: "Mercado Nativo", rating: 4.1 },
    { name: "Baía Produtos", rating: 4.3 },
    { name: "Pulso Urbano", rating: 4.0 },
    { name: "GreenFound", rating: 4.2 },
    { name: "Tienda Olmo", rating: 4.6 },
    { name: "Sierra Market", rating: 4.4 },
    { name: "Brisa & Sal", rating: 4.3 },
    { name: "Lago Azul", rating: 3.8 },
    { name: "Hearth & Home", rating: 4.7 },
    { name: "Mercado Carioca", rating: 4.5 },
    { name: "Punto Vivo", rating: 4.0 },
    { name: "Finca Urbana", rating: 4.1 },
    { name: "Nord Market", rating: 4.4 },
    { name: "Lustre Goods", rating: 4.6 },
    { name: "Oceano Shop", rating: 4.2 },
    { name: "Barrio Mercado", rating: 4.3 },
    { name: "Casa del Sol", rating: 4.5 },
    { name: "Praça Empório", rating: 4.1 },
    { name: "VerdeMar", rating: 4.8 },
    { name: "Mundo Artes", rating: 4.0 },
    { name: "Coral & Co", rating: 4.2 },
    { name: "Faro House", rating: 4.3 },
    { name: "Londres Corner", rating: 4.6 },
    { name: "Atlas Bazaar", rating: 4.5 },
    { name: "Tienda del Valle", rating: 4.1 },
    { name: "Marea Tienda", rating: 3.9 },
    { name: "Pueblo Crafts", rating: 4.2 },
    { name: "Baú de Ofertas", rating: 4.4 },
    { name: "Sol & Bruma", rating: 4.3 },
    { name: "GreenRoots", rating: 4.6 },
    { name: "Lira Mercado", rating: 4.7 },
    { name: "Costa Nova Shop", rating: 4.2 },
    { name: "Madera y Lino", rating: 4.0 },
    { name: "Vila Mercantil", rating: 4.1 },
    { name: "Rikardo Empório", rating: 4.5 },
    { name: "Casa Marina", rating: 4.3 },
    { name: "Corazón Market", rating: 4.4 },
    { name: "Bright Lane", rating: 4.6 },
    { name: "Bambu & Casa", rating: 4.2 },
    { name: "Estación Urbana", rating: 4.0 },
    { name: "Aura Market", rating: 4.1 },
    { name: "Porto Fine Goods", rating: 4.5 },
    { name: "Terça Feira Empório", rating: 4.3 },
    { name: "La Plaza Shop", rating: 4.0 },
    { name: "Sombra y Luz", rating: 4.4 },
    { name: "Malva Boutique", rating: 4.2 },
    { name: "Canoas Market", rating: 4.1 },
    { name: "Mercado Río Verde", rating: 4.6 },
    { name: "UrbanPulse", rating: 4.3 },
    { name: "Novo Sol", rating: 4.7 },
    { name: "Casa Mística", rating: 4.0 },
    { name: "Pinebrook Goods", rating: 4.2 },
    { name: "Viva Comercio", rating: 4.5 },
    { name: "Isla Finds", rating: 4.1 },
    { name: "Alma & Arte", rating: 4.4 },
    { name: "Rojo Mercado", rating: 3.9 },
    { name: "LuzMar Empório", rating: 4.6 },
    { name: "Porto Alegre Shop", rating: 4.5 },
    { name: "Caminho Market", rating: 4.2 },
    { name: "Mistral Goods", rating: 4.3 },
    { name: "Faro & Co", rating: 4.0 },
    { name: "Campo Claro", rating: 4.1 },
    { name: "Vega Store", rating: 4.7 },
    { name: "Oliva Market", rating: 4.4 },
    { name: "Estoril Boutique", rating: 4.6 },
    { name: "Mercado Alba", rating: 4.2 },
    { name: "Névoa Empório", rating: 4.0 },
    { name: "Ponte & Hogar", rating: 4.3 },
    { name: "Trama Urbana", rating: 4.5 },
    { name: "Lagoa Verde", rating: 4.1 },
    { name: "Mar do Norte", rating: 4.2 },
    { name: "Cora Home", rating: 4.4 },
    { name: "Casa Prisma", rating: 4.6 },
    { name: "Veloz Tienda", rating: 4.0 },
    { name: "Olhar Bazaar", rating: 4.3 },
    { name: "Senda Market", rating: 4.2 },
    { name: "Norte & Sur", rating: 4.5 },
    { name: "Luna Mercantile", rating: 4.7 },
    { name: "Raiz Local", rating: 4.1 },
    { name: "Pomar House", rating: 4.4 },
    { name: "Branco Mercado", rating: 4.0 },
    { name: "EcoCanto", rating: 4.3 },
    { name: "TerraFina", rating: 4.6 },
    { name: "Rosa Viva", rating: 4.2 },
    { name: "Porto Verde", rating: 4.5 }
  ];

  // Nuevos vendedores (sin calificación) — rotativos
  // Reemplazamos lista estática por generación combinada Nombre + Apellido (más realista)
  const firstNamesForNew = ["Arianna","Mateo","Bianca","Thiago","Sofía","Luca","Valeria","Diego","Marina","Rafael","Nora","Bruno","Camila","Enzo","Irene","Hugo","Maya","Lucas","Clara","Pablo","Isabel","Noah","Emma","Miguel","Teresa","Victor","Olivia","Raul","Carla","Gonzalo","Elena","Rico","Renata","Samuel","Aline","Oscar","Luna","Thiago","Marta","César"];
  const lastNamesForNew  = ["Silva","García","Moreira","Torres","Pereira","Rojas","Alves","Cruz","Mendoza","Lima","Castro","Vargas","Santos","Ramírez","Pérez","Fernández","Núñez","Ribeiro","Mora","Duarte","Pinto","Navarro","Carvalho","Herrera","Gómez","Ramos","Paredes","Vega","Oliveira","Domínguez"];
  const newVendors = [];
  // generar 48 nuevos vendedores rotativos (puedes ajustar cantidad)
  for (let i = 0; i < 48; i++) {
    newVendors.push(`${pick(firstNamesForNew)} ${pick(lastNamesForNew)}`);
  }

  // Helpers
  function starsFromRating(r) {
    const filled = Math.round(r); // pintar según el redondeado (petición: pintadas según cantidad)
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  function createVendorLi(v) {
    const li = document.createElement("li");
    li.className = "vendor-item";
    const hasRating = v.rating !== undefined;
    li.innerHTML = `
      <label>
        <span class="vendor-label">${escapeHtml(v.name)}</span>
        <div class="vendor-controls">
          ${ hasRating
            ? `<span class="vendor-stars">${starsFromRating(v.rating)} <span class="num">${v.rating.toFixed(1)}</span></span>`
            : `<span class="badge-no-rating">Sin calificación</span>` }
          <input type="checkbox" name="vendor" value="${escapeHtml(v.name)}">
        </div>
      </label>
    `;
    return li;
  }

  // Render listas
  function populateAllVendors() {
    const ul = document.getElementById("desktopAllVendors");
    if (!ul) return;
    ul.innerHTML = "";
    vendors.forEach(v => {
      ul.appendChild(createVendorLi(v));
    });
  }

  function populateTopVendors() {
    const ul = document.getElementById("desktopTopVendors");
    if (!ul) return;
    ul.innerHTML = "";
    const top = [...vendors].sort((a,b) => b.rating - a.rating).slice(0, 40);
    top.forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <label>
          <input type="checkbox" name="top-vendor" value="${escapeHtml(v.name)}">
          <span class="vendor-name" style="margin-left:8px">${escapeHtml(v.name)}</span>
          <span class="stars" style="color:#f5c518;margin-left:auto;font-weight:900">${starsFromRating(v.rating)}</span>
          <span class="num" style="color:#666;margin-left:8px;font-weight:700">${v.rating.toFixed(1)}</span>
        </label>
      `;
      ul.appendChild(li);
    });
  }

  // Rotativo: reemplaza el contenido de #desktopNewVendors cada X segundos
  let rotIndex = 0;
  function renderNewVendors() {
    const ul = document.getElementById("desktopNewVendors");
    if (!ul) return;
    ul.innerHTML = "";
    // mostrar 6 nuevos por rotación (ajustable)
    const slice = [];
    for (let i = 0; i < 6; i++) {
      slice.push(newVendors[(rotIndex + i) % newVendors.length]);
    }
    slice.forEach(n => {
      const li = document.createElement("li");
      li.innerHTML = `<label><input type="checkbox" name="new-vendor" value="${escapeHtml(n)}"><span style="margin-left:8px">${escapeHtml(n)}</span><span class="badge-no-rating" style="margin-left:auto;background:#f1f3f4;color:#333;padding:4px 8px;border-radius:6px;font-weight:700">Sin calificación</span></label>`;
      ul.appendChild(li);
    });
    rotIndex = (rotIndex + 6) % newVendors.length;
  }

  // Insertar subtítulo bajo el header de "Nuevos vendedores" (si no existe)
  function ensureNewVendorsSubtitle() {
    const section = document.querySelector("#desktopNewVendors")?.closest(".filter-section");
    if (!section) return;
    // busca si ya existe subtitulo
    if (!section.querySelector(".new-vendors-sub")) {
      const subtitle = document.createElement("p");
      subtitle.className = "new-vendors-sub";
      subtitle.textContent = "Vendedores registrados en las últimas 24hs";
      subtitle.style.color = "#666";
      subtitle.style.fontSize = "0.88rem";
      subtitle.style.marginTop = "6px";
      subtitle.style.marginBottom = "8px";
      // insertar después del h4
      const h4 = section.querySelector("h4");
      if (h4 && h4.parentNode) h4.parentNode.insertBefore(subtitle, h4.nextSibling);
    }
  }

  // Inicialización (espera DOM)
  function initDesktopVendorLists() {
    populateAllVendors();
    populateTopVendors();
    ensureNewVendorsSubtitle();
    renderNewVendors();
    // rotación cada 6 segundos
    setInterval(renderNewVendors, 6000);
  }

  // Ejecutar cuando DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDesktopVendorLists);
  } else {
    initDesktopVendorLists();
  }
})();