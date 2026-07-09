/* ============================================================
   CYBERPUNK STOREFRONT — Business Logic & Cart Engine
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let cart = JSON.parse(localStorage.getItem('cyberCart')) || [];

  const catalogContainer = document.getElementById('catalogContainer');
  const filterContainer = document.getElementById('filterContainer');
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartBadge = document.getElementById('cartBadge');
  
  // Cart Summary Elements
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Modals
  const detailsModal = document.getElementById('detailsModal');
  const checkoutModal = document.getElementById('checkoutModal');

  // ─── Fetch Products from JSON ─────────────────────────────
  async function loadProducts() {
    try {
      const response = await fetch('products.json');
      products = await response.json();
      renderProducts(products);
      setupFilters();
      updateCartUI();
    } catch (err) {
      console.error('Error loading products dataset:', err);
      if (catalogContainer) {
        catalogContainer.innerHTML = `<div class="empty-cart-msg mono" style="color: var(--danger);">[ERROR] FAILED TO LOAD SYSTEM PRODUCTS DATABASE.</div>`;
      }
    }
  }

  // ─── Render Products ──────────────────────────────────────
  function renderProducts(itemsToRender) {
    if (!catalogContainer) return;
    catalogContainer.innerHTML = '';

    if (itemsToRender.length === 0) {
      catalogContainer.innerHTML = `<div class="empty-cart-msg mono">NO MODULES MATCHING SELECTED FILTER.</div>`;
      return;
    }

    itemsToRender.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-store-card reveal';
      card.innerHTML = `
        <div class="product-store-img-box">
          ${product.image}
          <div class="product-store-price-tag">$${product.price.toFixed(2)}</div>
        </div>
        <div class="product-store-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-store-actions">
            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">ADD_TO_CART</button>
            <button class="btn btn-secondary btn-icon view-details-btn" data-id="${product.id}" aria-label="View Details">🔍</button>
          </div>
        </div>
      `;
      catalogContainer.appendChild(card);
    });

    // Wire up events
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        addToCart(e.target.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openDetailsModal(id);
      });
    });

    // Trigger reveal fade-in
    setTimeout(() => {
      document.querySelectorAll('.product-store-card').forEach(el => el.classList.add('visible'));
    }, 50);
  }

  // ─── Setup Categories Filter Menu ─────────────────────────
  function setupFilters() {
    if (!filterContainer) return;
    const categories = ['all', ...new Set(products.map(p => p.category))];
    
    filterContainer.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${cat === 'all' ? 'active' : ''}`;
      btn.setAttribute('data-category', cat);
      btn.textContent = cat.toUpperCase().replace('-', '_');
      
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const selected = e.target.getAttribute('data-category');
        
        if (selected === 'all') {
          renderProducts(products);
        } else {
          const filtered = products.filter(p => p.category === selected);
          renderProducts(filtered);
        }
      });
      
      filterContainer.appendChild(btn);
    });
  }

  // ─── Cart Systems ─────────────────────────────────────────
  function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        cart.push({ ...product, quantity: 1 });
      }
    }
    
    saveCart();
    updateCartUI();
    openCartSidebar();
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
  }

  function updateQuantity(productId, amount) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
    }
  }

  function saveCart() {
    localStorage.setItem('cyberCart', JSON.stringify(cart));
  }

  function updateCartUI() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<div class="empty-cart-msg mono">YOUR SECURE VAULT IS EMPTY.</div>`;
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      if (cartTax) cartTax.textContent = '$0.00';
      if (cartTotal) cartTotal.textContent = '$0.00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.quantity;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-icon">${item.image}</div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn decrease-qty" data-id="${item.id}">-</button>
            <span class="cart-qty-num">${item.quantity}</span>
            <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove Item">✖</button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    // Attach quantity event handlers
    document.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-id'), -1));
    });

    document.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-id'), 1));
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => removeFromCart(e.target.getAttribute('data-id')));
    });

    // Calculate details
    const tax = subtotal * 0.08; // 8% sales tax
    const total = subtotal + tax;

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  // ─── Open/Close Cart Sidebar ──────────────────────────────
  function openCartSidebar() {
    if (cartSidebar) cartSidebar.classList.add('open');
  }

  function closeCartSidebar() {
    if (cartSidebar) cartSidebar.classList.remove('open');
  }

  if (cartToggle) cartToggle.addEventListener('click', openCartSidebar);
  if (closeCart) closeCart.addEventListener('click', closeCartSidebar);

  // ─── Product Details Modal ────────────────────────────────
  function openDetailsModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !detailsModal) return;

    const modalContent = detailsModal.querySelector('.modal-box');
    modalContent.innerHTML = `
      <button class="close-modal-btn" id="closeDetailsModal" aria-label="Close Details">✖</button>
      <div class="modal-body">
        <div class="modal-product-header">
          <div class="modal-product-icon">${product.image}</div>
          <div class="modal-product-title">
            <h2>${product.name}</h2>
            <div class="modal-product-price">$${product.price.toFixed(2)}</div>
          </div>
        </div>
        <p class="modal-product-desc">${product.description}</p>
        <div class="modal-product-specs">
          <h4>// Module Specifications</h4>
          <ul>
            ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
        <button class="btn btn-primary" id="modalAddToCart" data-id="${product.id}" style="width:100%; justify-content:center;">
          LOAD_MODULE_TO_VAULT
        </button>
      </div>
    `;

    detailsModal.classList.add('open');

    // Attach handlers
    document.getElementById('closeDetailsModal').addEventListener('click', closeDetailsModals);
    document.getElementById('modalAddToCart').addEventListener('click', (e) => {
      addToCart(e.target.getAttribute('data-id'));
      closeDetailsModals();
    });
  }

  function closeDetailsModals() {
    if (detailsModal) detailsModal.classList.remove('open');
  }

  // Close modals on clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  // ─── Checkout CLI Terminal Simulator ─────────────────────
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      closeCartSidebar();
      openCheckoutTerminal();
    });
  }

  function openCheckoutTerminal() {
    if (!checkoutModal) return;
    const modalContent = checkoutModal.querySelector('.modal-box');
    
    modalContent.innerHTML = `
      <div class="checkout-cli-header">
        <span class="mono" style="color:var(--teal); font-size:11px;">nexus@checkout-terminal:~</span>
        <button class="close-cart-btn" id="closeCheckoutModal">✖</button>
      </div>
      <div class="checkout-cli-body" id="checkoutCliBody">
        <div class="checkout-cli-line">> Initializing transaction pipeline...</div>
      </div>
    `;

    checkoutModal.classList.add('open');
    document.getElementById('closeCheckoutModal').addEventListener('click', () => {
      checkoutModal.classList.remove('open');
    });

    runCheckoutSequence();
  }

  function runCheckoutSequence() {
    const cliBody = document.getElementById('checkoutCliBody');
    if (!cliBody) return;

    const lines = [
      { text: "> Loading payment gateway integration...", delay: 600 },
      { text: "> Contacting secure processing servers... <span class='checkout-loader'>⚙</span>", delay: 1200 },
      { text: "> [<span class='ok'>OK</span>] Encryption handshake established. AES-256 enabled.", delay: 2000 },
      { text: "> Order Summary: " + cart.reduce((acc, i) => acc + i.quantity, 0) + " modules identified.", delay: 2600 },
      { text: "> Invoice amount: " + cartTotal.textContent, delay: 3000 },
      { text: "> Please verify credit credentials...", delay: 3500 },
      { text: "<div class='checkout-cli-line input'>$ sudo process_transaction --card=VISA_****</div>", delay: 4200 },
      { text: "> Processing credit lines... <span class='checkout-loader'>⚙</span>", delay: 4800 },
      { text: "> [<span class='ok'>SUCCESS</span>] Authorization code: 0x8F923D. Charge successful!", delay: 6000 },
      { text: "> Delivering digital product packages to your terminal...", delay: 6600 },
      { text: "> Transaction complete! Thank you for purchasing, Anurag. 👋", delay: 7200 }
    ];

    lines.forEach(line => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'checkout-cli-line';
        el.innerHTML = line.text;
        cliBody.appendChild(el);
        cliBody.scrollTop = cliBody.scrollHeight;
      }, line.delay);
    });

    // Clear cart on success
    setTimeout(() => {
      cart = [];
      saveCart();
      updateCartUI();
    }, 7000);
  }

  // ─── Initialize Store ─────────────────────────────────────
  loadProducts();
});
