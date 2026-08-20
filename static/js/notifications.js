/**
 * Layer Studios - Real-Time Customer Notifications & Live Order Updates Engine
 * Features:
 *  - Interactive Notification Bell 🔔 with unread badge counter in navbar
 *  - Notification drawer/dropdown with direct tracking links
 *  - Real-time polling for order & quote status transitions
 *  - Instant toast popups on status updates (e.g. "Order LS-1053 moved to Printing")
 */

class LayerStudiosNotifications {
  constructor() {
    this.pollInterval = null;
    this.knownStatuses = {}; // orderId -> lastKnownStatus
    this.init();
  }

  init() {
    this.renderBellInNav();
    this.createDrawer();
    this.loadInitialNotifications();
    this.startLivePolling();
  }

  getUserEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('ls_user') || '{}');
      if (user && user.email) return user.email.toLowerCase().trim();
      const guest = JSON.parse(localStorage.getItem('ls_guest') || '{}');
      if (guest && guest.email) return guest.email.toLowerCase().trim();
    } catch (e) {}
    return '';
  }

  getTrackedOrderIds() {
    try {
      const ids = JSON.parse(localStorage.getItem('ls_tracked_ids') || '[]');
      return ids;
    } catch (e) {
      return [];
    }
  }

  addTrackedOrderId(orderId) {
    if (!orderId) return;
    const ids = this.getTrackedOrderIds();
    if (!ids.includes(orderId)) {
      ids.push(orderId);
      localStorage.setItem('ls_tracked_ids', JSON.stringify(ids));
    }
  }

  renderBellInNav() {
    const header = document.querySelector('header');
    if (!header) return;

    // Remove any existing duplicate bells
    document.querySelectorAll('.ls-notification-bell-btn').forEach(b => b.remove());

    const containers = header.querySelectorAll('.flex.items-center.space-x-3, .flex.items-center.gap-4, .flex.items-center.gap-3');
    if (containers.length === 0) return;
    const rightContainer = containers[containers.length - 1];

    const bellWrapper = document.createElement('div');
    bellWrapper.className = 'relative inline-flex items-center';
    bellWrapper.innerHTML = `
      <button type="button" id="ls-nav-bell-btn" class="ls-notification-bell-btn relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer" title="Notificações / Notifications">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span id="ls-bell-badge" class="hidden absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">0</span>
      </button>

      <!-- Account Button -->
      <a href="/login" id="ls-nav-account-btn" class="ml-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all whitespace-nowrap">
        <span id="ls-nav-account-avatar">👤</span>
        <span id="ls-nav-account-name">Conta</span>
      </a>
    `;

    rightContainer.insertBefore(bellWrapper, rightContainer.firstChild);

    // Update account button if logged in
    this.updateNavAccountUI();

    // Click handler for bell
    document.getElementById('ls-nav-bell-btn')?.addEventListener('click', () => {
      this.toggleDrawer();
    });
  }

  updateNavAccountUI() {
    const userJson = localStorage.getItem('ls_user');
    const guestJson = localStorage.getItem('ls_guest');
    const accountName = document.getElementById('ls-nav-account-name');
    if (!accountName) return;

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        accountName.textContent = user.name ? user.name.split(' ')[0] : 'Conta';
      } catch (e) {
        accountName.textContent = 'Conta';
      }
    } else if (guestJson) {
      accountName.textContent = 'Convidado';
    } else {
      accountName.textContent = 'Entrar';
    }
  }

  createDrawer() {
    if (document.getElementById('ls-notifications-drawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'ls-notifications-drawer';
    drawer.className = 'hidden fixed inset-0 z-50 overflow-hidden';
    drawer.innerHTML = `
      <div id="ls-notif-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-sm sm:max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col p-6 space-y-4">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                🔔
              </div>
              <div>
                <h3 class="text-sm font-bold text-white leading-tight">Centro de Notificações</h3>
                <span class="text-[10px] text-slate-400 font-mono">Live Production Alerts</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="ls-notif-mark-read" class="text-[11px] text-slate-400 hover:text-blue-400 font-semibold px-2 py-1 rounded-lg hover:bg-slate-900 transition-all">Limpar</button>
              <button type="button" id="ls-notif-close" class="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 transition-colors">✕</button>
            </div>
          </div>

          <!-- Notification List -->
          <div id="ls-notif-list" class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div class="p-8 text-center text-slate-500 text-xs space-y-2">
              <span class="text-3xl block">📭</span>
              <p>Nenhuma notificação nova no momento.</p>
              <p class="text-[10px] text-slate-600">As atualizações das suas encomendas aparecerão aqui em tempo real.</p>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <a href="/track" class="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              <span>Seguir Encomenda</span>
              <span>&rarr;</span>
            </a>
            <a href="/login" class="text-xs text-slate-400 hover:text-white font-semibold">
              Minha Conta &bull;
            </a>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(drawer);

    // Event listeners
    drawer.querySelector('#ls-notif-close').onclick = () => this.toggleDrawer(false);
    drawer.querySelector('#ls-notif-backdrop').onclick = () => this.toggleDrawer(false);
    drawer.querySelector('#ls-notif-mark-read').onclick = () => this.markAllRead();
  }

  toggleDrawer(show) {
    const drawer = document.getElementById('ls-notifications-drawer');
    if (!drawer) return;
    const isHidden = drawer.classList.contains('hidden');
    const targetState = (typeof show === 'boolean') ? show : isHidden;

    if (targetState) {
      drawer.classList.remove('hidden');
      this.loadInitialNotifications();
    } else {
      drawer.classList.add('hidden');
    }
  }

  async loadInitialNotifications() {
    const email = this.getUserEmail();
    const orderIds = this.getTrackedOrderIds().join(',');

    try {
      const url = `/api/customer/notifications?email=${encodeURIComponent(email)}&orderIds=${encodeURIComponent(orderIds)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      this.renderNotificationList(data.notifications || []);
    } catch (e) {
      console.warn('Could not load notifications:', e);
    }
  }

  renderNotificationList(notifs) {
    const listEl = document.getElementById('ls-notif-list');
    const badgeEl = document.getElementById('ls-bell-badge');
    if (!listEl) return;

    const unreadCount = notifs.filter(n => !n.read).length;
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-slate-500 text-xs space-y-2">
          <span class="text-3xl block">📭</span>
          <p class="font-semibold text-slate-400">Sem notificações pendentes</p>
          <p class="text-[10px] text-slate-600">As atualizações de estado das suas impressões 3D surgirão aqui em direto.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    notifs.forEach(n => {
      const item = document.createElement('div');
      const isUnread = !n.read;
      item.className = `p-3.5 rounded-2xl border transition-all cursor-pointer ${
        isUnread 
          ? 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/40 shadow-lg shadow-blue-500/5' 
          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
      }`;

      const icon = n.status === 'Printing' ? '🖨️' :
                   n.status === 'Shipped' ? '📦' :
                   n.status === 'Quality Inspection' ? '🔍' :
                   n.status === 'Paid' ? '💳' : '⚙️';

      item.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="text-xl shrink-0 mt-0.5">${icon}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="text-xs font-bold text-white truncate">${n.title || 'Atualização de Encomenda'}</span>
              <span class="text-[9px] font-mono text-slate-500 shrink-0">${this.formatRelativeTime(n.timestamp)}</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">${n.message || ''}</p>
            ${n.orderId ? `<span class="inline-block mt-2 text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">${n.orderId} &rarr; Ver no Tracker</span>` : ''}
          </div>
        </div>
      `;

      if (n.orderId) {
        item.onclick = () => {
          this.toggleDrawer(false);
          window.location.href = `/track?id=${n.orderId}`;
        };
      }

      listEl.appendChild(item);
    });
  }

  async markAllRead() {
    const email = this.getUserEmail();
    try {
      await fetch('/api/customer/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const badgeEl = document.getElementById('ls-bell-badge');
      if (badgeEl) badgeEl.classList.add('hidden');
      this.loadInitialNotifications();
    } catch (e) {}
  }

  startLivePolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    // Poll every 15 seconds for live status updates
    this.pollInterval = setInterval(async () => {
      const email = this.getUserEmail();
      const orderIds = this.getTrackedOrderIds();
      if (!email && orderIds.length === 0) return;

      try {
        const url = `/api/customer/orders?email=${encodeURIComponent(email)}&token=${encodeURIComponent(localStorage.getItem('ls_auth_token') || '')}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const allItems = [...(data.quotes || []), ...(data.orders || [])];
        allItems.forEach(item => {
          const id = item.id;
          const currentStatus = item.status || 'Quote Requested';
          const previousStatus = this.knownStatuses[id];

          if (previousStatus && previousStatus !== currentStatus) {
            // Status changed! Trigger live toast popup on website
            this.showLiveStatusToast(id, currentStatus, item.projectName || item.id);
            this.loadInitialNotifications();
          }

          this.knownStatuses[id] = currentStatus;
        });
      } catch (e) {}
    }, 15000);
  }

  showLiveStatusToast(orderId, newStatus, title) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-slate-900 border-2 border-blue-500 text-white shadow-2xl shadow-blue-500/25 max-w-sm w-full animate-fade-in flex items-start gap-3 backdrop-blur-md';
    toast.innerHTML = `
      <span class="text-2xl">🔔</span>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <strong class="text-xs font-bold text-blue-400 uppercase tracking-wide">Atualização em Direto</strong>
          <span class="text-[10px] text-slate-500 font-mono">Agora</span>
        </div>
        <p class="text-xs font-bold text-white mt-0.5">${orderId}: ${newStatus}</p>
        <p class="text-[11px] text-slate-400 mt-1">O estado da sua peça avançou para <strong class="text-slate-200">${newStatus}</strong>.</p>
        <a href="/track?id=${orderId}" class="mt-2 inline-block text-xs font-bold text-blue-400 hover:text-blue-300 underline font-mono">Abrir Rastreador &rarr;</a>
      </div>
      <button type="button" class="text-slate-500 hover:text-white p-1" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 7000);
  }

  formatRelativeTime(isoString) {
    if (!isoString) return '';
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return 'Agora';
      if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
      return `${Math.floor(diff / 86400)}d atrás`;
    } catch (e) {
      return '';
    }
  }
}

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.LayerStudiosNotifications = new LayerStudiosNotifications();
  });
}
