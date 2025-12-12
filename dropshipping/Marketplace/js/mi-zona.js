document.addEventListener("DOMContentLoaded", () => {
  // Check if user exists, else create default
  let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuarioActual) {
    usuarioActual = {name: 'Vendedor Demo', email: 'demo@woz.com', phone: '0983-222-444', address: 'Asunción, Paraguay'};
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  }

  // Initialize fake data if not present
  initializeFakeData();

  // Load seller info
  loadSellerInfo();

  // Load seller info in presentation card
  loadSellerPresentationCard();

  // Load membership
  loadMembership();

  // Load inventory
  loadInventory();

  // Load sold products
  loadSoldProducts();

  // Load earnings
  loadEarnings();

  // Load bank
  loadBank();

  // Load chat
  loadChat();

  // Load stats
  loadStats();

  // Sidebar navigation
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.closest('a').getAttribute('data-section');
      showSection(section);
      sidebarLinks.forEach(l => l.classList.remove('active'));
      e.target.closest('a').classList.add('active');
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
        hideSidebarOverlay();
      }
    });
  });

  // Burger menu mejorado
  const burgerMenu = document.getElementById('burger-menu');
  if (burgerMenu) {
    burgerMenu.addEventListener('click', toggleSidebar);
  }

  // Show default section
  showSection('info');
  document.querySelector('.sidebar a[data-section="info"]').classList.add('active');

  // Event listeners
  const editInfoBtn = document.getElementById('edit-info-btn');
  if (editInfoBtn) {
    editInfoBtn.addEventListener('click', () => {
      document.getElementById('info-display').style.display = 'none';
      document.getElementById('info-form').style.display = 'block';
      document.querySelector('.info-card').style.display = 'none';
      populateEditForm();
    });
  }

  document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('info-form').style.display = 'none';
    document.getElementById('info-display').style.display = 'block';
  });

  document.getElementById('info-form').addEventListener('submit', saveSellerInfo);

  document.getElementById('acquire-membership-btn').addEventListener('click', acquireMembership);

  document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('product-form').style.display = 'block';
    // Add calculation listeners
    setupPriceCalculations();
  });

  document.getElementById('cancel-product').addEventListener('click', () => {
    document.getElementById('product-form').style.display = 'none';
  });

  document.getElementById('product-form').addEventListener('submit', addProduct);

  document.getElementById('add-account-btn').addEventListener('click', () => {
    document.getElementById('bank-form').style.display = 'block';
  });

  document.getElementById('cancel-bank').addEventListener('click', () => {
    document.getElementById('bank-form').style.display = 'none';
  });

  document.getElementById('bank-form').addEventListener('submit', saveBank);

  document.getElementById('request-withdrawal-btn').addEventListener('click', () => {
    document.getElementById('withdrawal-form').style.display = 'block';
  });

  document.getElementById('cancel-withdrawal').addEventListener('click', () => {
    document.getElementById('withdrawal-form').style.display = 'none';
  });

  document.getElementById('withdrawal-form').addEventListener('submit', requestWithdrawal);

  document.getElementById('chat-form').addEventListener('submit', sendChatMessage);

  // Close chat event
  document.getElementById('close-chat').addEventListener('click', () => {
    document.getElementById('chat-window').classList.remove('active');
    document.getElementById('chat-overlay').classList.remove('active');
    document.getElementById('chat-window').classList.remove('minimized');
    window.currentChatClient = null;
  });

  // Minimize chat event
  document.getElementById('minimize-chat').addEventListener('click', () => {
    document.getElementById('chat-window').classList.toggle('minimized');
  });

  // Close chat when clicking overlay
  document.getElementById('chat-overlay').addEventListener('click', () => {
    document.getElementById('chat-window').classList.remove('active');
    document.getElementById('chat-overlay').classList.remove('active');
    document.getElementById('chat-window').classList.remove('minimized');
    window.currentChatClient = null;
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  // Back to marketplace button
  document.getElementById('back-to-marketplace').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Service buttons handlers
  document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', handleServiceClick);
  });

  document.getElementById('export-data-btn').addEventListener('click', exportData);

  // Preview logic for Cargar Producto
  setupProductPreview();

  function initializeFakeData() {
    // Membership
    if (!localStorage.getItem('membresiaVendedor')) {
      const membresia = { adquirida: true, fechaInicio: '2024-01-01T00:00:00.000Z', anual: true };
      localStorage.setItem('membresiaVendedor', JSON.stringify(membresia));
    }

    // Products
    let productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    if (productos.filter(p => p.seller === usuarioActual.name).length === 0) {
      const fakeProducts = [
        { sku: 'WOZ-FAKE1', title: 'Producto Demo 1', price: 50000, category: 'Electrónica', description: 'Descripción demo 1', image: '', seller: usuarioActual.name, rating: 4.5, reviews: [] },
        { sku: 'WOZ-FAKE2', title: 'Producto Demo 2', price: 75000, category: 'Ropa', description: 'Descripción demo 2', image: '', seller: usuarioActual.name, rating: 4.0, reviews: [] },
        { sku: 'WOZ-FAKE3', title: 'Producto Demo 3', price: 100000, category: 'Hogar', description: 'Descripción demo 3', image: '', seller: usuarioActual.name, rating: 5.0, reviews: [] }
      ];
      productos.push(...fakeProducts);
      localStorage.setItem('productosMarketplace', JSON.stringify(productos));
    }

    // Sold products
    if (!localStorage.getItem('productosVendidos')) {
      const soldProducts = [
        { sku: 'WOZ-SOLD1', title: 'Producto Vendido 1', price: 50000, fechaVenta: '2024-10-01' },
        { sku: 'WOZ-SOLD2', title: 'Producto Vendido 2', price: 75000, fechaVenta: '2024-10-15' }
      ];
      localStorage.setItem('productosVendidos', JSON.stringify(soldProducts));
    }

    // Bank Accounts
    if (!localStorage.getItem('cuentasBancarias')) {
      const cuentas = [
        { id: 1, name: 'Banco Nacional', account: '123-456-789' },
        { id: 2, name: 'Banco Regional', account: '987-654-321' }
      ];
      localStorage.setItem('cuentasBancarias', JSON.stringify(cuentas));
    }

    // Chat - Clients
    if (!localStorage.getItem('clientesMarketplace')) {
      const clientes = [
        { 
          id: 1, 
          name: 'Ana García', 
          email: 'ana.garcia@email.com', 
          cedula: '1.234.567-8',
          messages: [
            { sender: 'client', text: 'Hola, ¿tienes stock del producto Demo 1?', time: '2024-11-27T10:30:00.000Z' },
            { sender: 'vendor', text: 'Hola Ana! Sí, tenemos stock disponible. ¿Te interesa?', time: '2024-11-27T10:32:00.000Z' },
            { sender: 'client', text: 'Perfecto, ¿cuánto cuesta el envío?', time: '2024-11-27T10:35:00.000Z' }
          ]
        },
        { 
          id: 2, 
          name: 'Carlos Mendoza', 
          email: 'carlos.mendoza@email.com', 
          cedula: '2.345.678-9',
          messages: [
            { sender: 'client', text: 'Buenos días, ¿puedo cambiar un producto?', time: '2024-11-26T14:15:00.000Z' },
            { sender: 'vendor', text: 'Hola Carlos! Por supuesto, ¿cuál es el motivo del cambio?', time: '2024-11-26T14:20:00.000Z' }
          ]
        },
        { 
          id: 3, 
          name: 'María Rodriguez', 
          email: 'maria.rodriguez@email.com', 
          cedula: '3.456.789-0',
          messages: [
            { sender: 'client', text: 'Hola, ¿cuándo llega mi pedido?', time: '2024-11-25T16:45:00.000Z' },
            { sender: 'vendor', text: 'Hola María! Tu pedido llegará mañana por la tarde.', time: '2024-11-25T16:50:00.000Z' },
            { sender: 'client', text: 'Genial, gracias!', time: '2024-11-25T16:52:00.000Z' }
          ]
        }
      ];
      localStorage.setItem('clientesMarketplace', JSON.stringify(clientes));
    }

    // Withdrawals
    if (!localStorage.getItem('retirosVendedor')) {
      const retiros = [
        { fecha: '2025-10-20', monto: 500000, estado: 'Completado' },
        { fecha: '2025-11-15', monto: 250000, estado: 'Pendiente' }
      ];
      localStorage.setItem('retirosVendedor', JSON.stringify(retiros));
    }
  }

  function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-card');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Trigger preview when entering Cargar section
    if (sectionId === 'cargar') {
      const dontShow = localStorage.getItem('previewDontShow') === 'true';
      if (!dontShow) {
        const pv = document.getElementById('product-preview');
        if (pv) {
          pv.classList.add('active');
          pv.setAttribute('aria-hidden', 'false');
        }
      }
    }
  }

  function loadSellerInfo() {
    document.getElementById('seller-name').textContent = usuarioActual.name || '';
    document.getElementById('seller-email').textContent = usuarioActual.email || '';
    document.getElementById('seller-phone').textContent = usuarioActual.phone || '';
    document.getElementById('seller-address').textContent = usuarioActual.address || '';
  }

  function loadSellerPresentationCard() {
    // Cargar información en la card minimalista
    const nameDisplay = document.getElementById('seller-name-display');
    const emailDisplay = document.getElementById('seller-email-display');
    const phoneDisplay = document.getElementById('seller-phone-display');
    const addressDisplay = document.getElementById('seller-address-display');

    if (nameDisplay) nameDisplay.textContent = usuarioActual.name || 'Vendedor';
    if (emailDisplay) emailDisplay.textContent = usuarioActual.email || 'email@ejemplo.com';
    if (phoneDisplay) phoneDisplay.textContent = usuarioActual.phone || '+595 XXX XXX XXX';
    if (addressDisplay) addressDisplay.textContent = usuarioActual.address || 'Dirección';
  }

  function setupProductPreview() {
    const pv = document.getElementById('product-preview');
    if (!pv) return;

    const slide1 = pv.querySelector('.preview-slide-1');
    const slide2 = pv.querySelector('.preview-slide-2');
    const startBtn = document.getElementById('preview-start');
    const goUploadBtn = document.getElementById('preview-go-upload');
    const backBtn = document.getElementById('preview-back');
    const checkbox = document.getElementById('preview-dontshow-checkbox');

    // Restore checkbox state
    checkbox.checked = localStorage.getItem('previewDontShow') === 'true';

    startBtn.addEventListener('click', () => {
      slide1.hidden = true;
      slide2.hidden = false;
    });

    backBtn.addEventListener('click', () => {
      if (!slide1.hidden) {
        // Close preview
        pv.classList.remove('active');
        pv.setAttribute('aria-hidden', 'true');
      } else {
        // Go back to first slide
        slide2.hidden = true;
        slide1.hidden = false;
      }
    });

    goUploadBtn.addEventListener('click', () => {
      pv.classList.remove('active');
      pv.setAttribute('aria-hidden', 'true');
      // Open product form
      document.getElementById('product-form').style.display = 'block';
      setupPriceCalculations();
    });

    checkbox.addEventListener('change', (e) => {
      localStorage.setItem('previewDontShow', e.target.checked ? 'true' : 'false');
    });
  }

  function populateEditForm() {
    document.getElementById('input-name').value = usuarioActual.name || '';
    document.getElementById('input-email').value = usuarioActual.email || '';
    document.getElementById('input-phone').value = usuarioActual.phone || '';
    document.getElementById('input-address').value = usuarioActual.address || '';
  }

  function saveSellerInfo(e) {
    e.preventDefault();
    usuarioActual.name = document.getElementById('input-name').value;
    usuarioActual.email = document.getElementById('input-email').value;
    usuarioActual.phone = document.getElementById('input-phone').value;
    usuarioActual.address = document.getElementById('input-address').value;
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    loadSellerInfo();
    loadSellerPresentationCard(); // Actualizar también la card minimalista
    document.getElementById('info-form').style.display = 'none';
    document.getElementById('info-display').style.display = 'block';
    document.querySelector('.info-card').style.display = 'block';
  }

  function loadMembership() {
    const membresia = JSON.parse(localStorage.getItem('membresiaVendedor')) || { adquirida: false };
    const statusDiv = document.getElementById('membership-status');
    const text = document.getElementById('membership-text');
    const btn = document.getElementById('acquire-membership-btn');
    if (membresia.adquirida) {
      text.textContent = '¡Membresía adquirida! Activa hasta 27/11/2026. (Primer año gratis aplicado)';
      btn.style.display = 'none';
    } else {
      text.textContent = 'No tienes membresía adquirida. ¡Aprovecha el primer año gratis!';
      btn.style.display = 'inline-block';
    }
  }

  function acquireMembership() {
    const membresia = { adquirida: true, fechaInicio: new Date().toISOString(), anual: true };
    localStorage.setItem('membresiaVendedor', JSON.stringify(membresia));
    loadMembership();
  }

  function addProduct(e) {
    e.preventDefault();
    const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    const basePrice = parseFloat(document.getElementById('product-price-base').value);
    const tax = parseFloat(document.getElementById('product-tax').value) / 100;
    const priceIVA = Math.round(basePrice * (1 + tax));
    const commission = 0.05; // 5%
    const commissionFee = 7500; // 1 USD ≈ 7500 Gs
    const finalPrice = Math.round(priceIVA * (1 - commission) - commissionFee);

    const newProduct = {
      sku: 'WOZ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      title: document.getElementById('product-title').value,
      price: finalPrice,
      basePrice: basePrice,
      tax: tax * 100,
      priceIVA: priceIVA,
      category: document.getElementById('product-category').value,
      description: document.getElementById('product-description').value,
      image: document.getElementById('product-image').value,
      seller: document.getElementById('product-seller').value,
      shipper: document.getElementById('product-shipper').value,
      shippingFixed: parseFloat(document.getElementById('shipping-fixed').value) || 0,
      shippingVariable: parseFloat(document.getElementById('shipping-variable').value) || 0,
      internationalShipping: document.getElementById('shipping-international').value,
      whatsapp: document.getElementById('seller-whatsapp').value,
      stock: parseInt(document.getElementById('product-stock').value) || 0,
      tags: document.getElementById('product-tags').value,
      returnsPolicy: document.getElementById('product-returns').value,
      deliveryTime: document.getElementById('product-delivery-time').value,
      rating: 0,
      reviews: []
    };
    productos.push(newProduct);
    localStorage.setItem('productosMarketplace', JSON.stringify(productos));
    document.getElementById('product-form').reset();
    document.getElementById('product-form').style.display = 'none';
    loadInventory();
  }

  function loadInventory() {
    const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    const tbody = document.getElementById('inventory-list');
    tbody.innerHTML = '';
    productos.filter(p => p.seller === usuarioActual.name).forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.title}</td>
        <td>Gs. ${product.price.toLocaleString('es-ES')}</td>
        <td>${product.category}</td>
        <td class="action-btns">
          <button onclick="editProduct('${product.sku}')">Editar</button>
          <button onclick="deleteProduct('${product.sku}')">Eliminar</button>
          <button onclick="duplicateProduct('${product.sku}')">Duplicar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function loadSoldProducts() {
    const sold = JSON.parse(localStorage.getItem('productosVendidos')) || [];
    const tbody = document.getElementById('sold-products-list');
    tbody.innerHTML = '';
    sold.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.title}</td>
        <td>Gs. ${product.price.toLocaleString('es-ES')}</td>
        <td>${product.fechaVenta || 'N/A'}</td>
        <td class="action-btns">
          <button onclick="refundProduct('${product.sku}')">Reembolsar</button>
          <button onclick="viewOrder('${product.sku}')">Ver Orden</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function loadEarnings() {
    const sold = JSON.parse(localStorage.getItem('productosVendidos')) || [];
    const total = sold.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('total-earnings').textContent = total.toLocaleString('de-DE');
  }

  function loadBank() {
    const accounts = JSON.parse(localStorage.getItem('cuentasBancarias')) || [];
    const accountsList = document.getElementById('bank-accounts-list');
    const destinationSelect = document.getElementById('withdrawal-destination-account');
    
    accountsList.innerHTML = '';
    destinationSelect.innerHTML = '';

    if (accounts.length === 0) {
      accountsList.innerHTML = '<p>No tienes cuentas bancarias configuradas.</p>';
    } else {
      accounts.forEach(account => {
        const card = document.createElement('div');
        card.className = 'bank-account-card';
        card.innerHTML = `
          <p class="bank-name">${account.name}</p>
          <p class="account-number">${account.account}</p>
        `;
        accountsList.appendChild(card);

        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} - ${account.account}`;
        destinationSelect.appendChild(option);
      });
    }
    loadWithdrawalHistory();
  }



  function saveBank(e) {
    e.preventDefault();
    const accounts = JSON.parse(localStorage.getItem('cuentasBancarias')) || [];
    const newAccount = {
      id: Date.now(),
      name: document.getElementById('bank-name').value,
      account: document.getElementById('account-number').value
    };
    accounts.push(newAccount);
    localStorage.setItem('cuentasBancarias', JSON.stringify(accounts));
    
    loadBank();
    document.getElementById('bank-form').reset();
    document.getElementById('bank-form').style.display = 'none';
  }

  function loadChat() {
    const clientes = JSON.parse(localStorage.getItem('clientesMarketplace')) || [];
    renderClients(clientes);
    setupSearchFilters();
  }

  function renderClients(clientes) {
    const tableBody = document.getElementById('clients-table-body');
    tableBody.innerHTML = '';
    
    clientes.forEach(client => {
      // Generar número aleatorio de mensajes nuevos (0-5) para demo
      const mensajesNuevos = Math.floor(Math.random() * 6);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${client.name}</td>
        <td>${client.email}</td>
        <td>${client.cedula}</td>
        <td>
          <span class="new-messages ${mensajesNuevos === 0 ? 'zero' : ''}">${mensajesNuevos}</span>
        </td>
        <td>
          <button class="chat-btn" onclick="openChat(${client.id})">Chatear</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function setupSearchFilters() {
    const searchName = document.getElementById('search-name');
    const searchEmail = document.getElementById('search-email');
    const searchCedula = document.getElementById('search-cedula');
    
    function filterClients() {
      const clientes = JSON.parse(localStorage.getItem('clientesMarketplace')) || [];
      const nameFilter = searchName.value.toLowerCase();
      const emailFilter = searchEmail.value.toLowerCase();
      const cedulaFilter = searchCedula.value.toLowerCase();
      
      const filtered = clientes.filter(client => {
        const matchName = client.name.toLowerCase().includes(nameFilter);
        const matchEmail = client.email.toLowerCase().includes(emailFilter);
        const matchCedula = client.cedula.toLowerCase().includes(cedulaFilter);
        return matchName && matchEmail && matchCedula;
      });
      
      renderClients(filtered);
    }
    
    searchName.addEventListener('input', filterClients);
    searchEmail.addEventListener('input', filterClients);
    searchCedula.addEventListener('input', filterClients);
  }

  function openChat(clientId) {
    const clientes = JSON.parse(localStorage.getItem('clientesMarketplace')) || [];
    const client = clientes.find(c => c.id === clientId);
    
    if (client) {
      // Show chat bubble and overlay
      document.getElementById('chat-window').classList.add('active');
      document.getElementById('chat-overlay').classList.add('active');
      
      // Set client info
      document.getElementById('chat-client-name').textContent = client.name;
      document.getElementById('chat-client-email').textContent = client.email;
      document.getElementById('chat-client-cedula').textContent = client.cedula;
      
      // Set client initials
      const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase();
      document.getElementById('chat-client-initials').textContent = initials;
      
      // Load messages
      loadChatMessages(client.messages);
      
      // Set current chat client
      window.currentChatClient = clientId;
    }
  }

  function loadChatMessages(messages) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${message.sender}`;
      
      const messageTime = new Date(message.time).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      bubble.innerHTML = `
        <div>${message.text}</div>
        <div class="message-time">${messageTime}</div>
      `;
      
      chatMessages.appendChild(bubble);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendChatMessage(e) {
    e.preventDefault();
    const message = document.getElementById('chat-message').value.trim();
    
    if (message && window.currentChatClient) {
      const clientes = JSON.parse(localStorage.getItem('clientesMarketplace')) || [];
      const clientIndex = clientes.findIndex(c => c.id === window.currentChatClient);
      
      if (clientIndex !== -1) {
        const newMessage = {
          sender: 'vendor',
          text: message,
          time: new Date().toISOString()
        };
        
        clientes[clientIndex].messages.push(newMessage);
        localStorage.setItem('clientesMarketplace', JSON.stringify(clientes));
        
        // Reload messages
        loadChatMessages(clientes[clientIndex].messages);
        
        // Clear input
        document.getElementById('chat-message').value = '';
      }
    }
  }

  function loadStats() {
    const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    const sold = JSON.parse(localStorage.getItem('productosVendidos')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientesMarketplace')) || [];

    document.getElementById('stat-inventory').textContent = productos.filter(p => p.seller === usuarioActual.name).length;
    document.getElementById('stat-sold').textContent = sold.length;
    document.getElementById('stat-earnings').textContent = sold.reduce((sum, p) => sum + p.price, 0).toLocaleString('es-ES');
    document.getElementById('stat-clients').textContent = clientes.length;
  }

  function exportData() {
    const data = {
      seller: usuarioActual,
      products: JSON.parse(localStorage.getItem('productosMarketplace')) || [],
      sold: JSON.parse(localStorage.getItem('productosVendidos')) || [],
      membership: JSON.parse(localStorage.getItem('membresiaVendedor')) || {},
      bank: JSON.parse(localStorage.getItem('cuentaBancaria')) || {},
      chats: JSON.parse(localStorage.getItem('chatsVendedor')) || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos-vendedor.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadWithdrawalHistory() {
    const retiros = JSON.parse(localStorage.getItem('retirosVendedor')) || [];
    const tbody = document.getElementById('withdrawal-history-list');
    tbody.innerHTML = '';
    retiros.forEach(retiro => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(retiro.fecha).toLocaleDateString('es-ES')}</td>
        <td>Gs. ${retiro.monto.toLocaleString('de-DE')}</td>
        <td><span class="status status-${retiro.estado.toLowerCase()}">${retiro.estado}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  function requestWithdrawal(e) {
    e.preventDefault();
    const sold = JSON.parse(localStorage.getItem('productosVendidos')) || [];
    const totalEarnings = sold.reduce((sum, p) => sum + p.price, 0);
    
    const withdrawalAmountInput = document.getElementById('withdrawal-amount');
    const amount = parseFloat(withdrawalAmountInput.value.replace(/\./g, ''));
    const destinationAccountId = document.getElementById('withdrawal-destination-account').value;

    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, ingrese un monto válido.');
      return;
    }

    if (amount > totalEarnings) {
        alert('El monto de retiro no puede ser mayor a las ganancias totales.');
        return;
    }

    const retiros = JSON.parse(localStorage.getItem('retirosVendedor')) || [];
    const newWithdrawal = {
      fecha: new Date().toISOString(),
      monto: amount,
      estado: 'Pendiente',
      cuentaId: destinationAccountId
    };
    retiros.push(newWithdrawal);
    localStorage.setItem('retirosVendedor', JSON.stringify(retiros));

    // This is a simulation. In a real app, you'd update the backend.
    // For now, we'll just refresh the data.
    const newSold = [...sold, { name: 'Retiro', price: -amount, date: new Date().toISOString().split('T')[0] }];
    localStorage.setItem('productosVendidos', JSON.stringify(newSold));


    document.getElementById('withdrawal-form').reset();
    document.getElementById('withdrawal-form').style.display = 'none';
    loadWithdrawalHistory();
    loadEarnings(); // Recalculate earnings
  }

  // Global functions for actions
  function editProduct(sku) {
    const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    const product = productos.find(p => p.sku === sku);
    if (product) {
      // Populate form and show
      document.getElementById('product-title').value = product.title;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-description').value = product.description;
      document.getElementById('product-image').value = product.image;
      document.getElementById('product-form').style.display = 'block';
      // Change submit to update
      const form = document.getElementById('product-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        product.title = document.getElementById('product-title').value;
        product.price = parseFloat(document.getElementById('product-price').value);
        product.category = document.getElementById('product-category').value;
        product.description = document.getElementById('product-description').value;
        product.image = document.getElementById('product-image').value;
        localStorage.setItem('productosMarketplace', JSON.stringify(productos));
        form.reset();
        form.style.display = 'none';
        location.reload(); // Reload to refresh
      };
    }
  }

  function deleteProduct(sku) {
    if (confirm('¿Eliminar este producto?')) {
      const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
      const filtered = productos.filter(p => p.sku !== sku);
      localStorage.setItem('productosMarketplace', JSON.stringify(filtered));
      location.reload();
    }
  }

  function duplicateProduct(sku) {
    const productos = JSON.parse(localStorage.getItem('productosMarketplace')) || [];
    const product = productos.find(p => p.sku === sku);
    if (product) {
      const newProduct = { ...product, sku: 'WOZ-' + Math.random().toString(36).substr(2, 9).toUpperCase() };
      productos.push(newProduct);
      localStorage.setItem('productosMarketplace', JSON.stringify(productos));
      location.reload();
    }
  }

  function refundProduct(sku) {
    alert('Reembolso procesado para ' + sku);
    // Implement refund logic
  }

  function viewOrder(sku) {
    alert('Ver orden para ' + sku);
    // Implement view order
  }

  function setupPriceCalculations() {
    const basePriceInput = document.getElementById('product-price-base');
    const taxInput = document.getElementById('product-tax');
    const ivaOutput = document.getElementById('product-price-iva');
    const commissionOutput = document.getElementById('product-price-commission');

    function calculatePrices() {
      let baseValue = basePriceInput.value.replace(/\./g, '').replace(',', '.');
      const basePrice = parseFloat(baseValue) || 0;
      const tax = parseFloat(taxInput.value) / 100 || 0;
      const priceIVA = Math.round(basePrice * (1 + tax));
      const commission = 0.05; // 5%
      const commissionFee = 7500; // 1 USD ≈ 7500 Gs
      const finalPrice = basePrice > 0 ? Math.round(priceIVA * (1 - commission) - commissionFee) : 0;

      ivaOutput.value = basePrice > 0 ? priceIVA.toLocaleString('de-DE') : '';
      commissionOutput.value = basePrice > 0 ? finalPrice.toLocaleString('de-DE') : '';
    }

    function formatBasePrice() {
      let value = basePriceInput.value.replace(/\./g, '').replace(',', '.');
      let num = parseFloat(value);
      if (!isNaN(num)) {
        basePriceInput.value = num.toLocaleString('de-DE');
      }
    }

    // Calculate initially
    calculatePrices();

    basePriceInput.addEventListener('input', () => {
      formatBasePrice();
      calculatePrices();
    });
    taxInput.addEventListener('input', calculatePrices);
  }

  // Format withdrawal amount input
    document.getElementById('withdrawal-amount').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            e.target.value = parseInt(value, 10).toLocaleString('de-DE');
        } else {
            e.target.value = '';
        }
    });

  function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('usuarioActual');
      window.location.href = 'index.html';
    }
  }

  // Services handlers
  function handleServiceClick(e) {
    const serviceType = e.currentTarget.getAttribute('data-service');
    
    switch(serviceType) {
      case 'dropshipping':
        handleDropshippingService();
        break;
      case 'payments':
        handlePaymentsService();
        break;
      case 'api':
        handleAPIService();
        break;
      default:
        console.log('Servicio no disponible');
    }
  }

  function handleDropshippingService() {
    const modal = createServiceModal({
      title: 'Woz Dropshipping',
      content: `
        <div class="service-modal-content">
          <div class="service-explanation">
            <h4>¿Qué es el Dropshipping?</h4>
            <p>El dropshipping es un modelo de negocio que te permite vender productos sin mantener inventario. Cuando un cliente realiza un pedido en tu tienda:</p>
            <ol>
              <li>Recibes el pedido del cliente</li>
              <li>Envías la orden a nuestro proveedor</li>
              <li>El proveedor envía directamente al cliente</li>
              <li>Tú obtienes la ganancia sin manejar inventario</li>
            </ol>
          </div>
          
          <div class="service-features-extended">
            <h4>Beneficios de Woz Dropshipping:</h4>
            <ul>
              <li><strong>Sin inversión inicial:</strong> No necesitas comprar productos por adelantado</li>
              <li><strong>Gestión automática:</strong> Procesamos y enviamos los pedidos por ti</li>
              <li><strong>Amplio catálogo:</strong> Acceso a más de 10,000 productos verificados</li>
              <li><strong>Márgenes competitivos:</strong> Hasta 40% de ganancia por producto</li>
              <li><strong>Soporte completo:</strong> Asesoría personalizada para tu negocio</li>
            </ul>
          </div>

          <div class="service-pricing">
            <h4>Precios:</h4>
            <p><strong>Plan Básico:</strong> $29/mes - Hasta 100 productos</p>
            <p><strong>Plan Pro:</strong> $79/mes - Productos ilimitados + soporte prioritario</p>
          </div>
        </div>
      `,
      primaryAction: 'Comenzar Ahora',
      onPrimary: () => {
        alert('Redirigiendo a la configuración de Dropshipping...');
        closeModal();
      }
    });
    
    document.body.appendChild(modal);
  }

  function handlePaymentsService() {
    const modal = createServiceModal({
      title: 'Woz Payments',
      content: `
        <div class="service-modal-content">
          <div class="service-explanation">
            <h4>Cobros Internacionales Simplificados</h4>
            <p>Woz Payments te permite recibir pagos de clientes en todo el mundo de forma segura y eficiente:</p>
            <ul>
              <li>Acepta pagos en múltiples monedas</li>
              <li>Conversión automática a tu moneda local</li>
              <li>Transferencias rápidas a tu cuenta bancaria</li>
              <li>Cumplimiento de normativas internacionales</li>
            </ul>
          </div>
          
          <div class="service-features-extended">
            <h4>Características principales:</h4>
            <ul>
              <li><strong>150+ países soportados:</strong> Recibe pagos desde cualquier parte del mundo</li>
              <li><strong>Tarifas competitivas:</strong> Solo 2.9% + $0.30 por transacción</li>
              <li><strong>Checkout optimizado:</strong> Aumenta tus conversiones hasta 20%</li>
              <li><strong>APIs robustas:</strong> Integración fácil con cualquier plataforma</li>
              <li><strong>Reportes detallados:</strong> Analytics completos de tus ingresos</li>
            </ul>
          </div>

          <div class="integration-preview">
            <h4>Integración simple:</h4>
            <code class="code-preview">
              &lt;script src="https://pay.woz.com/v1/woz-payments.js"&gt;&lt;/script&gt;<br>
              &lt;button onclick="WozPay.checkout({ amount: 100, currency: 'USD' })"&gt;<br>
              &nbsp;&nbsp;Pagar ahora<br>
              &lt;/button&gt;
            </code>
          </div>
        </div>
      `,
      primaryAction: 'Activar Payments',
      onPrimary: () => {
        alert('Activando Woz Payments en tu cuenta...');
        closeModal();
      }
    });
    
    document.body.appendChild(modal);
  }

  function handleAPIService() {
    const modal = createServiceModal({
      title: 'API de Pagos para Sitios Externos',
      content: `
        <div class="service-modal-content">
          <div class="service-explanation">
            <h4>Integra pagos en cualquier sitio web</h4>
            <p>Nuestra API te permite agregar un botón de pago a cualquier sitio web externo en minutos:</p>
          </div>
          
          <div class="integration-examples">
            <h4>Ejemplos de integración:</h4>
            
            <div class="code-example">
              <h5>1. Botón simple:</h5>
              <code class="code-preview">
                &lt;button class="woz-pay-btn" <br>
                &nbsp;&nbsp;data-amount="50" <br>
                &nbsp;&nbsp;data-currency="USD" <br>
                &nbsp;&nbsp;data-description="Mi producto"&gt;<br>
                &nbsp;&nbsp;Comprar ahora<br>
                &lt;/button&gt;<br><br>
                &lt;script src="https://api.woz.com/button.js"&gt;&lt;/script&gt;
              </code>
            </div>

            <div class="code-example">
              <h5>2. Checkout personalizado:</h5>
              <code class="code-preview">
                WozCheckout.open({<br>
                &nbsp;&nbsp;key: 'tu_api_key',<br>
                &nbsp;&nbsp;amount: 5000, // en centavos<br>
                &nbsp;&nbsp;currency: 'USD',<br>
                &nbsp;&nbsp;name: 'Mi Tienda',<br>
                &nbsp;&nbsp;description: 'Compra de producto',<br>
                &nbsp;&nbsp;handler: function(response) {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;// Manejar respuesta<br>
                &nbsp;&nbsp;}<br>
                });
              </code>
            </div>
          </div>

          <div class="api-features">
            <h4>Características de la API:</h4>
            <ul>
              <li><strong>Webhooks en tiempo real:</strong> Notificaciones instantáneas de pagos</li>
              <li><strong>Checkout responsivo:</strong> Funciona perfecto en móvil y desktop</li>
              <li><strong>Múltiples métodos de pago:</strong> Tarjetas, PayPal, criptomonedas</li>
              <li><strong>Seguridad avanzada:</strong> PCI DSS Level 1 compliant</li>
              <li><strong>SDKs disponibles:</strong> JavaScript, PHP, Python, Node.js</li>
            </ul>
          </div>
        </div>
      `,
      primaryAction: 'Ver Documentación',
      onPrimary: () => {
        window.open('https://docs.woz.com/api-payments', '_blank');
        closeModal();
      }
    });
    
    document.body.appendChild(modal);
  }

  function createServiceModal({ title, content, primaryAction, onPrimary }) {
    const modal = document.createElement('div');
    modal.className = 'service-modal-overlay';
    modal.innerHTML = `
      <div class="service-modal">
        <div class="service-modal-header">
          <h3>${title}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="service-modal-body">
          ${content}
        </div>
        <div class="service-modal-footer">
          <button class="modal-btn secondary" onclick="closeModal()">Cerrar</button>
          <button class="modal-btn primary" onclick="handlePrimaryAction()">${primaryAction}</button>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-btn.primary').addEventListener('click', onPrimary);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    return modal;
  }

  function closeModal() {
    const modal = document.querySelector('.service-modal-overlay');
    if (modal) {
      modal.remove();
    }
  }

  // Sidebar toggle functions for mobile
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const burgerMenu = document.getElementById('burger-menu');
    
    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      burgerMenu.classList.remove('active');
      hideSidebarOverlay();
    } else {
      sidebar.classList.add('open');
      burgerMenu.classList.add('active');
      showSidebarOverlay();
    }
  }

  function showSidebarOverlay() {
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.addEventListener('click', closeSidebar);
      document.body.appendChild(overlay);
    }
    
    // Force reflow
    overlay.offsetHeight;
    overlay.classList.add('active');
  }

  function hideSidebarOverlay() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const burgerMenu = document.getElementById('burger-menu');
    
    sidebar.classList.remove('open');
    burgerMenu.classList.remove('active');
    hideSidebarOverlay();
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      const burgerMenu = document.getElementById('burger-menu');
      
      if (sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !burgerMenu.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      const burgerMenu = document.getElementById('burger-menu');
      
      sidebar.classList.remove('open');
      burgerMenu.classList.remove('active');
      hideSidebarOverlay();
    }
  });

  // Initial load
  initializeFakeData();

  // Make functions global
  window.openChat = openChat;
  window.closeModal = closeModal;
  window.toggleSidebar = toggleSidebar;
});