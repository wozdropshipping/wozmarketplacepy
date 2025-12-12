document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const sku = params.get('sku');

  // Buscar en ambas colecciones (usuario y generados)
  const productosUsuario = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
  const productosGenerados = JSON.parse(localStorage.getItem('productosGeneradosMarketplace')) || [];
  const producto = productosUsuario.find(p => p.sku === sku) || productosGenerados.find(p => p.sku === sku);

  if (!producto) {
    document.getElementById("listaProductos").innerHTML = "<div style='padding:1rem;'>Producto no encontrado</div>";
    document.getElementById("totalCompra").textContent = "0";
    return;
  }

  // Mostrar SOLO datos del producto (título y precio)
  const precioTexto = producto.priceFormatted
    ? producto.priceFormatted
    : (typeof producto.price === 'number' ? `Gs. ${producto.price.toLocaleString('es-ES')}` : String(producto.price));

  document.getElementById("listaProductos").innerHTML = `
    <div class="producto-item">
      <div><strong>${producto.title}</strong></div>
      <div class="producto-precio">Precio: ${precioTexto}</div>
    </div>
  `;
  // Resumen: nombre del producto
  const resNombre = document.getElementById('res-prod-nombre');
  if (resNombre) resNombre.textContent = producto.title;

  // Total base: usar el Subtotal estimativo desde producto.html
  const subtotalCache = JSON.parse(localStorage.getItem('subtotalPorProducto') || '{}');
  const subtotalEstimativo = Number(subtotalCache[sku]);
  const ENVIO_BASE = 35000; // Gs.
  const USD_1_GS = 7500; // 1 USD ~ 7500 Gs

  const totalNode = document.getElementById("totalCompra");

  function calcTotals(paymentMethodValue) {
    // Subtotal estimativo: preferir el guardado desde producto.html; si falta, recalcular igual que en producto.js
    let subtotal;
    if (isFinite(subtotalEstimativo) && subtotalEstimativo > 0) {
      subtotal = subtotalEstimativo;
    } else {
      const priceStr = producto.priceFormatted
        ? producto.priceFormatted.replace(/[^0-9.]/g,'')
        : String(producto.price || '').replace(/[^\d]/g,'');
      const precio = parseInt(String(priceStr).replace(/\./g,''), 10) || 0;
      const iva = Math.round(precio * 0.10);
      const woz = Math.round(precio * 0.05);
      const seguro = Math.round(precio * 0.02);
      const tarjeta3 = Math.round(precio * 0.03);
      subtotal = precio + iva + woz + seguro + tarjeta3;
    }

    let comision = 0;
    // Comisión de 5% tarjeta + 1 USD (7.500 Gs). Sin comisión si es Woz Payments.
    if (/(tarjeta|card|visa|master|credit|debit)/i.test(paymentMethodValue)) {
      comision = Math.round(subtotal * 0.05) + USD_1_GS;
    } else if (/(woz\s*payments|woz\s*links|^woz$)/i.test(paymentMethodValue)) {
      comision = 0;
    } else {
      // otros métodos: por ahora sin comisión explícita
      comision = 0;
    }

    const envio = ENVIO_BASE; // base fija. si luego agregas ciudad, ajusta aquí.
    const totalPagar = subtotal + comision + envio;
    return { subtotal, comision, envio, totalPagar };
  }

  function renderTotals(paymentMethodValue){
    const { subtotal, comision, envio, totalPagar } = calcTotals(paymentMethodValue || '');
    if (totalNode) totalNode.textContent = `Gs. ${totalPagar.toLocaleString('es-ES')}`;
    const miniSubtotal = document.getElementById('mini-subtotal');
    const miniComision = document.getElementById('mini-comision');
    const miniEnvio = document.getElementById('mini-envio');
    if (miniSubtotal) miniSubtotal.textContent = `Gs. ${subtotal.toLocaleString('es-ES')}`;
    if (miniComision) miniComision.textContent = `Gs. ${comision.toLocaleString('es-ES')}`;
    if (miniEnvio) miniEnvio.textContent = `Gs. ${envio.toLocaleString('es-ES')}`;
  }

  // Render inicial: usar método seleccionado si existe, o asumir 'credit' para mostrar comisión aplicada
  (function initialRender(){
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    const val = (selected && (selected.value || selected.id)) || 'credit';
    renderTotals(val);
  })();

  /* -----------------------------------------------------
     Lógica de Selección de Método de Pago
     ----------------------------------------------------- */
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const allForms = document.querySelectorAll('.payment-details-form');
  const allItems = document.querySelectorAll('.payment-item');

  function handlePaymentChange(event) {
    const selectedRadio = event.target;
    const targetId = selectedRadio.getAttribute('data-target');

    // 1. Quitar clase 'active' de todos los items
    allItems.forEach(item => item.classList.remove('active'));

    // 2. Ocultar todos los formularios
    allForms.forEach(form => form.style.display = 'none');

    // 3. Activar el item seleccionado (padre del radio)
    const parentItem = selectedRadio.closest('.payment-item');
    if (parentItem) {
      parentItem.classList.add('active');
    }

    // 4. Mostrar el formulario correspondiente debajo
    if (targetId) {
      const formToShow = document.getElementById(targetId);
      if (formToShow) {
        formToShow.style.display = 'block';
      }
    }
    // Recalcular total según método
    const value = selectedRadio.value || selectedRadio.id || '';
    renderTotals(value);
  }

  // Asignar evento
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', handlePaymentChange);
  });

  /* -----------------------------------------------------
     Lógica de Selección tipo "Switch/Acordeón"
     ----------------------------------------------------- */
  const paymentHeaders = document.querySelectorAll('.payment-header');

  paymentHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      // Evitar doble disparo si se clickea inputs internos
      if(e.target.tagName === 'INPUT') return;

      const parentItem = header.closest('.payment-item');
      const radioInput = parentItem.querySelector('.hidden-radio');
      
      // Verificar si ya estaba abierto
      const wasActive = parentItem.classList.contains('active');

      // 1. Cerrar TODOS los items primero (para efecto acordeón exclusivo)
      document.querySelectorAll('.payment-item').forEach(item => {
        item.classList.remove('active');
        // Opcional: desmarcar radios si quieres que al cerrar se pierda la selección
        // item.querySelector('.hidden-radio').checked = false; 
      });

      // 2. Si NO estaba abierto, lo abrimos ahora
      if (!wasActive) {
        parentItem.classList.add('active');
        if(radioInput) radioInput.checked = true; // Marcar el radio oculto para lógica de formulario
      } else {
        // Si ya estaba abierto, al hacer click se cierra (lógica de switch/toggle)
        // Y desmarcamos el radio para que no quede seleccionado "fantasma"
        if(radioInput) radioInput.checked = false;
      }
    });
  });

  // --- NUEVO: Seleccionar el primero por defecto al cargar (Solo Desktop) ---
  const isDesktopInit = window.matchMedia('(min-width: 900px)').matches;
  if (isDesktopInit) {
      const firstItem = document.querySelector('.payment-item');
      if (firstItem) {
          const radio = firstItem.querySelector('.hidden-radio');
          if (radio) {
              radio.checked = true;
              firstItem.classList.add('active');
              
              // Forzar visualización del formulario
              const targetId = radio.getAttribute('data-target'); // Asegúrate de tener data-target en los radios si usas esa lógica
              // O buscar el formulario dentro del item
              const form = firstItem.querySelector('.payment-details-form');
              if(form) form.style.display = 'block';
          // Render por el primer método seleccionado
          renderTotals(radio.value || radio.id || '');
          }
      }
  }
});