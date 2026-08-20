/**
 * Layer Studios - Customer Authentication & Account Portal Engine
 * Supports:
 *  - Fast, safe Sign Up & Log In with session tokens
 *  - Instant Guest Order Lookup (Email or Order Reference)
 *  - Real-time client dashboard with active quotes, prints, and past orders
 */

class LayerStudiosAuth {
  constructor() {
    this.user = null;
    this.token = localStorage.getItem('ls_auth_token') || '';
    this.init();
  }

  async init() {
    this.updateNavAccountUI();
    this.setupAuthUI();
    this.checkSession();
    this.prefillFormFields();
  }

  async checkSession() {
    const userJson = localStorage.getItem('ls_user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
        this.updateNavAccountUI();
        this.renderUserDashboard();
        return;
      } catch (e) {}
    }

    if (this.token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          this.user = data.user;
          localStorage.setItem('ls_user', JSON.stringify(data.user));
          this.updateNavAccountUI();
          this.renderUserDashboard();
        }
      } catch (e) {}
    }
  }

  setupAuthUI() {
    // Tabs switching on login page
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const tabGuest = document.getElementById('auth-tab-guest');

    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');
    const formGuest = document.getElementById('auth-form-guest');

    if (!tabLogin || !tabRegister || !tabGuest) return;

    const setTab = (activeTab, activeForm) => {
      [tabLogin, tabRegister, tabGuest].forEach(t => {
        t.className = 'py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700';
      });
      activeTab.className = 'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all border-blue-500 bg-blue-500/10 text-white';

      [formLogin, formRegister, formGuest].forEach(f => f.classList.add('hidden'));
      activeForm.classList.remove('hidden');
    };

    tabLogin.onclick = () => setTab(tabLogin, formLogin);
    tabRegister.onclick = () => setTab(tabRegister, formRegister);
    tabGuest.onclick = () => setTab(tabGuest, formGuest);

    // Form handlers
    formLogin.onsubmit = (e) => this.handleLogin(e);
    formRegister.onsubmit = (e) => this.handleRegister(e);
    formGuest.onsubmit = (e) => this.handleGuestLookup(e);

    // Logout button
    document.getElementById('auth-btn-logout')?.addEventListener('click', () => this.handleLogout());
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const btn = document.getElementById('btn-submit-login');
    const errEl = document.getElementById('login-error-msg');
    if (errEl) errEl.classList.add('hidden');

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'A verificar...'; }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao iniciar sessão.');
      }

      this.user = data.user;
      this.token = data.token;
      localStorage.setItem('ls_auth_token', data.token);
      localStorage.setItem('ls_user', JSON.stringify(data.user));
      localStorage.removeItem('ls_guest');

      // Update account status across navigation
      this.updateNavAccountUI();
      if (window.LayerStudiosNotifications?.loadInitialNotifications) {
        window.LayerStudiosNotifications.loadInitialNotifications();
      }

      this.renderUserDashboard();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar na Conta →'; }
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const phone = document.getElementById('reg-phone')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const btn = document.getElementById('btn-submit-register');
    const errEl = document.getElementById('reg-error-msg');
    if (errEl) errEl.classList.add('hidden');

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'A criar conta...'; }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar conta.');
      }

      this.user = data.user;
      this.token = data.token;
      localStorage.setItem('ls_auth_token', data.token);
      localStorage.setItem('ls_user', JSON.stringify(data.user));
      localStorage.removeItem('ls_guest');

      this.updateNavAccountUI();
      if (window.LayerStudiosNotifications?.loadInitialNotifications) {
        window.LayerStudiosNotifications.loadInitialNotifications();
      }

      this.renderUserDashboard();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Criar Conta Segura →'; }
    }
  }

  async handleGuestLookup(e) {
    e.preventDefault();
    const query = document.getElementById('guest-query')?.value.trim();
    const btn = document.getElementById('btn-submit-guest');
    const errEl = document.getElementById('guest-error-msg');
    if (errEl) errEl.classList.add('hidden');

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'A localizar...'; }

      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nenhuma encomenda encontrada com essa referência.');
      }

      localStorage.setItem('ls_guest', JSON.stringify({ query, email: query.includes('@') ? query : '' }));
      if (!query.includes('@')) {
        if (window.LayerStudiosNotifications?.addTrackedOrderId) {
          window.LayerStudiosNotifications.addTrackedOrderId(query);
        }
      }

      this.updateNavAccountUI();
      this.renderGuestDashboard(data);
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Consultar Estado →'; }
    }
  }

  updateNavAccountUI() {
    const userJson = localStorage.getItem('ls_user');
    const guestJson = localStorage.getItem('ls_guest');
    let label = 'Sign In / Sign Up';
    let isLoggedIn = false;

    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        label = u.name ? u.name.split(' ')[0] : 'Conta';
        isLoggedIn = true;
      } catch (e) {
        label = 'Conta';
      }
    } else if (guestJson) {
      label = 'Convidado';
      isLoggedIn = true;
    }

    document.querySelectorAll('a[href="/login"]').forEach(link => {
      if (link.classList.contains('mobile-nav-link') || link.closest('#mobile-menu-drawer')) {
        const mainSpan = link.querySelector('span');
        if (mainSpan) {
          mainSpan.textContent = isLoggedIn ? `Minha Conta (${label})` : 'Sign In / Sign Up';
        }
      } else {
        const spans = link.querySelectorAll('span');
        if (spans.length > 0) {
          spans[spans.length - 1].textContent = label;
        }
        if (isLoggedIn) {
          link.classList.add('border-blue-500/40', 'bg-blue-500/10', 'text-white');
          link.classList.remove('bg-slate-900/90', 'text-slate-200');
        } else {
          link.classList.remove('border-blue-500/40', 'bg-blue-500/10', 'text-white');
          link.classList.add('bg-slate-900/90', 'text-slate-200');
        }
      }
    });
  }

  prefillFormFields() {
    const userJson = localStorage.getItem('ls_user');
    if (!userJson) return;
    try {
      const user = JSON.parse(userJson);
      // Quote page prefill
      const qName = document.getElementById('quote-name');
      const qEmail = document.getElementById('quote-email');
      const qPhone = document.getElementById('quote-phone');
      if (qName && !qName.value) qName.value = user.name || '';
      if (qEmail && !qEmail.value) qEmail.value = user.email || '';
      if (qPhone && !qPhone.value) qPhone.value = user.phone || '';

      // Store checkout prefill
      const cName = document.getElementById('checkout-name');
      const cEmail = document.getElementById('checkout-email');
      const cPhone = document.getElementById('checkout-phone');
      if (cName && !cName.value) cName.value = user.name || '';
      if (cEmail && !cEmail.value) cEmail.value = user.email || '';
      if (cPhone && !cPhone.value) cPhone.value = user.phone || '';
    } catch (e) {}
  }

  handleLogout() {
    this.user = null;
    this.token = '';
    localStorage.removeItem('ls_auth_token');
    localStorage.removeItem('ls_user');
    localStorage.removeItem('ls_guest');

    this.updateNavAccountUI();

    const authContainer = document.getElementById('auth-forms-container');
    const dashboardContainer = document.getElementById('auth-dashboard-container');
    if (authContainer) authContainer.classList.remove('hidden');
    if (dashboardContainer) dashboardContainer.classList.add('hidden');
  }

  async renderUserDashboard() {
    const authContainer = document.getElementById('auth-forms-container');
    const dashboardContainer = document.getElementById('auth-dashboard-container');
    if (!dashboardContainer) return;

    if (authContainer) authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');

    const nameEl = document.getElementById('dash-user-name');
    const emailEl = document.getElementById('dash-user-email');
    if (nameEl) nameEl.textContent = this.user?.name || 'Layer Studios Client';
    if (emailEl) emailEl.textContent = this.user?.email || '';

    // Load user orders and quotes
    try {
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(this.user?.email || '')}&token=${encodeURIComponent(this.token)}`);
      if (res.ok) {
        const data = await res.json();
        this.renderOrdersAndQuotes(data.quotes || [], data.orders || []);
      }
    } catch (e) {
      console.warn('Could not load customer dashboard items:', e);
    }

    if (window.LayerStudiosI18nInstance) {
      window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
    }
  }

  renderGuestDashboard(data) {
    const authContainer = document.getElementById('auth-forms-container');
    const dashboardContainer = document.getElementById('auth-dashboard-container');
    if (!dashboardContainer) return;

    if (authContainer) authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');

    const nameEl = document.getElementById('dash-user-name');
    const emailEl = document.getElementById('dash-user-email');
    if (nameEl) nameEl.textContent = 'Guest Access';
    if (emailEl) emailEl.textContent = data.query || '';

    this.renderOrdersAndQuotes(data.quotes || [], data.orders || []);

    if (window.LayerStudiosI18nInstance) {
      window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
    }
  }

  renderOrdersAndQuotes(quotes, orders) {
    const listEl = document.getElementById('dash-orders-list');
    const statQuotesEl = document.getElementById('dash-stat-quotes');
    const statOrdersEl = document.getElementById('dash-stat-orders');
    const statActiveEl = document.getElementById('dash-stat-active');

    if (statQuotesEl) statQuotesEl.textContent = quotes.length;
    if (statOrdersEl) statOrdersEl.textContent = orders.length;

    const allItems = [
      ...quotes.map(q => ({ ...q, itemType: 'quote' })),
      ...orders.map(o => ({ ...o, itemType: 'order' }))
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const activeCount = allItems.filter(i => ['Preparing', 'Printing', 'Quality Inspection'].includes(i.status)).length;
    if (statActiveEl) statActiveEl.textContent = activeCount;

    if (!listEl) return;

    if (allItems.length === 0) {
      listEl.innerHTML = `
        <div class="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <p class="font-bold text-white text-base">You have no quotes or orders yet</p>
          <p class="text-xs text-slate-400 max-w-md mx-auto">Upload a 3D file to get an instant quote or explore our ready-to-ship store products.</p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <a href="/quote" class="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25">New 3D Quote &rarr;</a>
            <a href="/store" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">Browse Store</a>
          </div>
        </div>
      `;
      if (window.LayerStudiosI18nInstance) {
        window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
      }
      return;
    }

    listEl.innerHTML = '';
    allItems.forEach(item => {
      const card = document.createElement('div');
      const isQuote = item.itemType === 'quote';
      const price = item.pricing?.finalPrice || item.total || 0;
      const isPaid = item.paymentStatus === 'Paid';
      const status = item.status || 'Quote Requested';

      const statusColor = status === 'Printing' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                          status === 'Ready to Ship' || status === 'Shipped' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                          status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                          'text-slate-300 bg-slate-800 border-slate-700';

      card.className = 'p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4';
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${isQuote ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} flex items-center justify-center font-bold font-mono text-xs uppercase tracking-wider">
              ${isQuote ? '3D' : 'Store'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-white text-sm">${item.id}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusColor}">${status}</span>
              </div>
              <p class="text-xs text-slate-400 font-medium truncate max-w-sm mt-0.5">${item.projectName || (item.items && item.items[0]?.title) || 'Custom 3D Print Request'}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <span class="font-mono font-black text-lg text-white">€${price.toFixed(2)}</span>
            <a href="/track?id=${item.id}" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono transition-all">
              Track &rarr;
            </a>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span class="text-[9px] text-slate-500 uppercase block mb-0.5">Material</span>
            <span class="text-slate-200 font-semibold truncate block">${item.material || (item.items && item.items[0]?.material) || 'PETG'}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span class="text-[9px] text-slate-500 uppercase block mb-0.5">Quantity</span>
            <span class="text-slate-200 font-semibold block">${item.quantity || (item.items && item.items[0]?.quantity) || 1} un.</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span class="text-[9px] text-slate-500 uppercase block mb-0.5">Payment</span>
            <span class="${isPaid ? 'text-emerald-400' : 'text-amber-400'} font-semibold block">${isPaid ? '✓ Paid' : 'Pending'}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span class="text-[9px] text-slate-500 uppercase block mb-0.5">Date</span>
            <span class="text-slate-400 block">${item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-PT') : 'Today'}</span>
          </div>
        </div>

        ${!isPaid ? `
          <div class="pt-2 flex items-center justify-between">
            <span class="text-xs text-amber-400/90 font-medium">Complete payment to initiate immediate production.</span>
            <button type="button" class="btn-pay-item px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5" data-id="${item.id}" data-amount="${price}" data-title="${item.projectName || item.id}">
              <span>Pay Now</span>
              <span>&rarr;</span>
            </button>
          </div>
        ` : ''}
      `;

      card.querySelector('.btn-pay-item')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (window.LayerStudiosPayments) {
          window.LayerStudiosPayments.openPayment({
            type: isQuote ? 'quote' : 'order',
            id: btn.getAttribute('data-id'),
            amount: parseFloat(btn.getAttribute('data-amount')),
            title: btn.getAttribute('data-title'),
            email: item.email || '',
            onSuccess: () => window.location.reload()
          });
        }
      });

      listEl.appendChild(card);
    });

    if (window.LayerStudiosI18nInstance) {
      window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
    }
  }
}

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.LayerStudiosAuth = new LayerStudiosAuth();
  });
}
