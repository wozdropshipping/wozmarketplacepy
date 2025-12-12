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

  // Total: mostrar precio del producto formateado (sin datos de vendedor)
  const totalNode = document.getElementById("totalCompra");
  if (totalNode) {
    if (typeof producto.price === 'number') {
      totalNode.textContent = producto.price.toLocaleString('es-ES');
    } else {
      // si no es number, usar el texto ya formateado
      totalNode.textContent = precioTexto.replace(/^Gs\.\s*/,'');
    }
  }
});