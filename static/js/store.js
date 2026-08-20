/**
 * Layer Studios - Ready-to-Order Catalog, Cart Drawer & Checkout Engine
 * Supports product customization, persistent localStorage cart, promo codes,
 * and Portugal payment methods (MB WAY, Multibanco, Stripe/Card).
 */

class LayerStudiosStore {
  constructor() {
    this.products = [];
    this.cart = this.loadCart();
    this.activeCategory = 'All';
    this.currentProduct = null;
    this.promoDiscount = 0;
    this.promoCode = '';
    this.theme = localStorage.getItem('ls_store_theme') || 'minimal'; // Default to modern clean minimal

    this.init();
  }

  init() {
    this.setupThemeSwitcher();
    this.fetchProducts();
    this.setupCategoryFilters();
    this.setupCartDrawer();
    this.setupCheckoutFlow();
    this.updateCartBadge();
    this.applyTheme(this.theme);
  }

  setupThemeSwitcher() {
    const btnMinimal = document.getElementById('theme-btn-minimal');
    const btnCad = document.getElementById('theme-btn-cad');

    if (btnMinimal) {
      btnMinimal.addEventListener('click', () => this.applyTheme('minimal'));
    }
    if (btnCad) {
      btnCad.addEventListener('click', () => this.applyTheme('cad'));
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('ls_store_theme', theme);

    const storeSec = document.getElementById('store');
    const btnMinimal = document.getElementById('theme-btn-minimal');
    const btnCad = document.getElementById('theme-btn-cad');

    if (storeSec) {
      storeSec.classList.remove('store-theme-minimal', 'store-theme-cad');
      storeSec.classList.add(theme === 'minimal' ? 'store-theme-minimal' : 'store-theme-cad');
    }

    if (btnMinimal && btnCad) {
      if (theme === 'minimal') {
        btnMinimal.className = 'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 bg-white text-slate-950 shadow-md';
        btnCad.className = 'px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 text-slate-400 hover:text-white';
      } else {
        btnCad.className = 'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 bg-blue-500 text-white shadow-md shadow-sky-500/20';
        btnMinimal.className = 'px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 text-slate-400 hover:text-white';
      }
    }

    this.updateCategoryFilterStyles();
    this.renderProducts();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('ls_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('ls_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
    this.updateCartBadge();
    this.renderCartItems();
  }

  async fetchProducts() {
    const grid = document.getElementById('store-products-grid');
    if (!grid) return;

    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        this.products = await res.json();
        this.renderProducts();
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  }

  setupCategoryFilters() {
    const buttons = document.querySelectorAll('.store-filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.activeCategory = btn.getAttribute('data-category');
        this.updateCategoryFilterStyles();
        this.renderProducts();
      });
    });
  }

  updateCategoryFilterStyles() {
    const buttons = document.querySelectorAll('.store-filter-btn');
    buttons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const isActive = cat === this.activeCategory;
      
      if (isActive) {
        btn.classList.add('active');
        if (this.theme === 'minimal') {
          btn.className = 'store-filter-btn active px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white text-slate-950 shadow-md';
        } else {
          btn.className = 'store-filter-btn active px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all bg-blue-500 text-white border border-blue-400';
        }
      } else {
        btn.classList.remove('active');
        if (this.theme === 'minimal') {
          btn.className = 'store-filter-btn px-4 py-2 rounded-xl text-xs font-medium transition-all bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700';
        } else {
          btn.className = 'store-filter-btn px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all bg-slate-900 text-slate-400 border border-slate-800 hover:text-white';
        }
      }
    });
  }

  renderProducts() {
    const grid = document.getElementById('store-products-grid');
    if (!grid) return;

    const filtered = this.activeCategory === 'All' 
      ? this.products 
      : this.products.filter(p => p.category === this.activeCategory);

    grid.innerHTML = '';

    filtered.forEach(p => {
      const card = document.createElement('div');
      
      if (this.theme === 'minimal') {
        // ULTRA-PREMIUM & MINIMAL LUXURY THEME CARD
        card.className = 'group rounded-3xl store-luxury-card overflow-hidden flex flex-col justify-between';
        card.innerHTML = `
          <div class="relative store-card-img-wrap p-7 flex items-center justify-center overflow-hidden aspect-video">
            <img src="${p.image}" alt="${p.title}" class="max-h-40 max-w-full object-contain group-hover:scale-105 transition-transform duration-500">
            <div class="absolute top-3.5 right-3.5">
              <span class="store-pill-badge px-3 py-1 rounded-full text-[11px] font-medium">
                ${p.leadTime}
              </span>
            </div>
          </div>
          
          <div class="p-7 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <span class="store-category-tag block">${p.category}</span>
              <h3 class="store-card-title text-xl leading-snug group-hover:text-sky-300 transition-colors">${p.title}</h3>
              <p class="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">${p.description}</p>
            </div>

            <div class="mt-7 pt-5 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 font-sans block uppercase tracking-wider">Starting at</span>
                <span class="store-card-price text-2xl font-bold">€${p.price.toFixed(2)}</span>
              </div>
              <button type="button" class="store-card-btn px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center space-x-1.5 btn-view-prod" data-id="${p.id}">
                <span>Configure</span>
                <span class="text-xs font-normal">&rarr;</span>
              </button>
            </div>
          </div>
        `;
      } else {
        // CAD BLUEPRINT / TECHNICAL THEME CARD
        card.className = 'group rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden glass-panel-hover flex flex-col justify-between';
        card.innerHTML = `
          <div class="relative bg-slate-950 p-6 flex items-center justify-center border-b border-slate-800/60 overflow-hidden aspect-video">
            <img src="${p.image}" alt="${p.title}" class="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform duration-300">
            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/90 text-blue-400 border border-sky-500/30">
                ${p.leadTime}
              </span>
            </div>
          </div>
          
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono text-slate-400">${p.category}</span>
              <h3 class="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition-colors font-mono">${p.title}</h3>
              <p class="text-xs text-slate-400 mt-2 line-clamp-2">${p.description}</p>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 block font-mono">From</span>
                <span class="text-xl font-bold font-mono text-white">€${p.price.toFixed(2)}</span>
              </div>
              <button type="button" class="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-sky-500/30 font-semibold text-xs tracking-wide transition-all btn-view-prod" data-id="${p.id}">
                Customize & Order
              </button>
            </div>
          </div>
        `;
      }

      card.querySelector('.btn-view-prod').addEventListener('click', () => {
        this.openProductModal(p);
      });

      grid.appendChild(card);
    });
  }

      card.querySelector('.btn-view-prod').addEventListener('click', () => {
        this.openProductModal(p);
      });

      grid.appendChild(card);
    });
  }

  openProductModal(product) {
    this.currentProduct = product;
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    document.getElementById('modal-prod-title').textContent = product.title;
    document.getElementById('modal-prod-desc').textContent = product.description;
    document.getElementById('modal-prod-dim').textContent = product.dimensions;
    document.getElementById('modal-prod-lead').textContent = product.leadTime;
    document.getElementById('modal-prod-price').textContent = `€${product.price.toFixed(2)}`;
    document.getElementById('modal-prod-img').src = product.image;

    // Materials selector
    const matSelect = document.getElementById('modal-prod-material');
    if (matSelect) {
      matSelect.innerHTML = product.materials.map(m => `<option value="${m}">${m}</option>`).join('');
    }

    // Colors selector
    const colSelect = document.getElementById('modal-prod-color');
    if (colSelect) {
      colSelect.innerHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // Customization field
    const customContainer = document.getElementById('modal-prod-custom-container');
    const customInput = document.getElementById('modal-prod-custom-input');
    const customLabel = document.getElementById('modal-prod-custom-label');
    if (product.customizable) {
      customContainer.classList.remove('hidden');
      customLabel.textContent = product.customizationField || 'Personalized Text:';
      if (customInput) customInput.value = '';
    } else {
      customContainer.classList.add('hidden');
    }

    const qtyInput = document.getElementById('modal-prod-qty');
    if (qtyInput) qtyInput.value = 1;

    modal.classList.remove('hidden');
  }

  setupCartDrawer() {
    const openBtns = document.querySelectorAll('.cart-open-btn');
    const closeBtn = document.getElementById('cart-drawer-close');
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');

    openBtns.forEach(b => b.addEventListener('click', () => this.openCartDrawer()));
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCartDrawer());
    if (backdrop) backdrop.addEventListener('click', () => this.closeCartDrawer());

    // Add to cart from modal
    const addBtn = document.getElementById('modal-prod-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!this.currentProduct) return;
        const mat = document.getElementById('modal-prod-material')?.value || this.currentProduct.defaultMaterial;
        const col = document.getElementById('modal-prod-color')?.value || this.currentProduct.colors[0];
        const qty = parseInt(document.getElementById('modal-prod-qty')?.value) || 1;
        const customText = document.getElementById('modal-prod-custom-input')?.value || '';

        this.addToCart(this.currentProduct, qty, mat, col, customText);
        document.getElementById('product-detail-modal').classList.add('hidden');
        this.openCartDrawer();
      });
    }

    // Promo code apply button
    const promoBtn = document.getElementById('cart-promo-apply-btn');
    const promoInput = document.getElementById('cart-promo-input');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', async () => {
        const code = promoInput.value.trim().toUpperCase();
        if (!code) return;
        try {
          const res = await fetch('/api/validate-promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            this.promoDiscount = data.discountPercent;
            this.promoCode = code;
            window.LayerStudiosApp && window.LayerStudiosApp.showToast(`Applied promo code ${code}: -${data.discountPercent}%!`, 'success');
            this.renderCartItems();
          } else {
            window.LayerStudiosApp && window.LayerStudiosApp.showToast('Invalid promo code', 'warning');
          }
        } catch {
          if (code === 'FIRST10' || code === 'STUDIO2026') {
            this.promoDiscount = 10;
            this.promoCode = code;
            this.renderCartItems();
          }
        }
      });
    }
  }

  addToCart(product, quantity, material, color, customText = '') {
    const itemKey = `${product.id}_${material}_${color}_${customText}`;
    const existing = this.cart.find(i => i.key === itemKey);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        key: itemKey,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        material: material,
        color: color,
        customText: customText,
        quantity: quantity
      });
    }

    this.saveCart();
    if (window.LayerStudiosAnalytics) {
      window.LayerStudiosAnalytics.track('add_to_cart', {
        product_id: product.id,
        title: product.title,
        quantity: quantity,
        price: product.price
      });
    }
    window.LayerStudiosApp && window.LayerStudiosApp.showToast(`Added ${quantity}x "${product.title}" to cart!`, 'success');
  }

  openCartDrawer() {
    this.renderCartItems();
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('hidden');
      setTimeout(() => {
        drawer.classList.remove('translate-x-full');
      }, 10);
    }
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
    }
  }

  updateCartBadge() {
    const totalQty = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge-count, #cart-count-badge, #cart-count, #cart-badge-qty');
    badges.forEach(b => {
      b.textContent = totalQty;
      if (totalQty > 0) {
        b.classList.remove('hidden');
      }
    });
  }

  renderCartItems() {
    const list = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-drawer-footer');
    if (!list) return;

    if (this.cart.length === 0) {
      list.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (footer) footer.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');

    list.innerHTML = '';
    let subtotal = 0;

    this.cart.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const el = document.createElement('div');
      el.className = 'p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between space-x-3';
      el.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="w-14 h-14 rounded-lg bg-slate-950 p-2 object-contain border border-slate-800 flex-shrink-0">
        <div class="flex-1 overflow-hidden">
          <h4 class="text-sm font-semibold text-white truncate">${item.title}</h4>
          <p class="text-xs text-slate-400 font-mono">${item.material} &bull; ${item.color}</p>
          ${item.customText ? `<p class="text-[11px] text-blue-400 truncate italic">"${item.customText}"</p>` : ''}
          <div class="flex items-center space-x-2 mt-2">
            <button type="button" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs flex items-center justify-center btn-qty-minus" data-idx="${idx}">-</button>
            <span class="text-xs font-mono text-white font-bold w-6 text-center">${item.quantity}</span>
            <button type="button" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs flex items-center justify-center btn-qty-plus" data-idx="${idx}">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold font-mono text-white">€${itemTotal.toFixed(2)}</p>
          <button type="button" class="text-slate-500 hover:text-red-400 text-xs mt-2 transition-colors btn-cart-remove" data-idx="${idx}">Remove</button>
        </div>
      `;

      el.querySelector('.btn-qty-minus').addEventListener('click', () => {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          this.cart.splice(idx, 1);
        }
        this.saveCart();
      });

      el.querySelector('.btn-qty-plus').addEventListener('click', () => {
        item.quantity += 1;
        this.saveCart();
      });

      el.querySelector('.btn-cart-remove').addEventListener('click', () => {
        this.cart.splice(idx, 1);
        this.saveCart();
      });

      list.appendChild(el);
    });

    // Calculate totals
    const discountAmount = subtotal * (this.promoDiscount / 100);
    const discountedSubtotal = subtotal - discountAmount;
    let shipping = 4.50;
    if (discountedSubtotal >= 50.00) shipping = 0.00; // Free shipping over €50
    const total = discountedSubtotal + shipping;

    document.getElementById('cart-subtotal-val').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping-val').textContent = shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`;
    document.getElementById('cart-total-val').textContent = `€${total.toFixed(2)}`;

    const discountRow = document.getElementById('cart-discount-row');
    if (this.promoDiscount > 0 && discountRow) {
      discountRow.classList.remove('hidden');
      document.getElementById('cart-discount-val').textContent = `-€${discountAmount.toFixed(2)} (${this.promoCode})`;
    } else if (discountRow) {
      discountRow.classList.add('hidden');
    }

    this.cartSummary = { subtotal, discount: discountAmount, shipping, total };
  }

  setupCheckoutFlow() {
    const checkoutTriggerBtn = document.getElementById('cart-checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutTriggerBtn && checkoutModal) {
      checkoutTriggerBtn.addEventListener('click', () => {
        this.closeCartDrawer();
        document.getElementById('checkout-total-badge').textContent = `€${(this.cartSummary?.total || 33.00).toFixed(2)}`;
        checkoutModal.classList.remove('hidden');
        if (window.LayerStudiosAnalytics) {
          window.LayerStudiosAnalytics.track('checkout_started', {
            items_count: this.cart.length,
            total: this.cartSummary?.total || 0
          });
        }
      });
    }

    // Payment method radio selection
    const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
    const mbwayDetails = document.getElementById('pay-details-mbway');
    const multibancoDetails = document.getElementById('pay-details-multibanco');
    const cardDetails = document.getElementById('pay-details-card');

    paymentMethods.forEach(radio => {
      radio.addEventListener('change', () => {
        if (mbwayDetails) mbwayDetails.classList.add('hidden');
        if (multibancoDetails) multibancoDetails.classList.add('hidden');
        if (cardDetails) cardDetails.classList.add('hidden');

        if (radio.value === 'MB WAY' && mbwayDetails) mbwayDetails.classList.remove('hidden');
        if (radio.value === 'Multibanco' && multibancoDetails) multibancoDetails.classList.remove('hidden');
        if (radio.value === 'Card' && cardDetails) cardDetails.classList.remove('hidden');
      });
    });

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Processing Order...';
        }

        const selectedPayMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'MB WAY';
        const payload = {
          customerName: document.getElementById('checkout-name')?.value || 'Valued Customer',
          email: document.getElementById('checkout-email')?.value || '',
          phone: document.getElementById('checkout-phone')?.value || '',
          shippingAddress: {
            street: document.getElementById('checkout-street')?.value || '',
            city: document.getElementById('checkout-city')?.value || '',
            postalCode: document.getElementById('checkout-postal')?.value || '',
            country: document.getElementById('checkout-country')?.value || 'Portugal'
          },
          items: this.cart,
          subtotal: this.cartSummary?.subtotal || 28.50,
          shippingCost: this.cartSummary?.shipping || 4.50,
          discount: this.cartSummary?.discount || 0,
          total: this.cartSummary?.total || 33.00,
          paymentMethod: selectedPayMethod
        };

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.success) {
            this.cart = [];
            this.saveCart();
            checkoutModal.classList.add('hidden');
            checkoutForm.reset();
            
            if (window.LayerStudiosPayments) {
              window.LayerStudiosPayments.openPayment({
                type: 'order',
                id: data.orderId,
                amount: payload.total,
                title: `${payload.items[0]?.title || 'Store Merchandise'} (${payload.items.length} items)`,
                phone: payload.phone || '+351 962 118 770',
                email: payload.email || '',
                onSuccess: (method) => {
                  window.location.href = `/track?id=${data.orderId}&paid=true`;
                }
              });
            } else {
              window.location.href = `/track?id=${data.orderId}`;
            }
          }
        } catch (err) {
          console.error('Checkout error:', err);
          const fallbackOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
          this.cart = [];
          this.saveCart();
          checkoutModal.classList.add('hidden');
          window.location.href = `/track?id=${fallbackOrderId}`;
        }
      });
    }
  }
}

window.LayerStudiosStore = LayerStudiosStore;
