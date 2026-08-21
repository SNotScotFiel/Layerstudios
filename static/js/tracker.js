/**
 * Layer Studios - 10-Stage Order & Quote Tracking Pipeline
 * Handles real-time search, visual milestone progress, carrier tracking links (CTT, DHL),
 * and dynamic production telemetry logs.
 */

class LayerStudiosTracker {
  constructor() {
    this.stages = [
      'Quote Requested',
      'Under Review',
      'Quote Sent',
      'Awaiting Payment',
      'Preparing',
      'Printing',
      'Quality Inspection',
      'Ready to Ship',
      'Shipped',
      'Completed'
    ];

    this.init();
  }

  init() {
    this.setupSearchForm();
    this.setupQuickPills();
    
    // Check URL params for ?id=LS-XXXX or #track?id=LS-XXXX
    this.checkInitialUrlParams();
  }

  async checkInitialUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    const isPaid = urlParams.get('paid') === 'true';

    if (queryId) {
      const input = document.getElementById('tracker-input-id');
      if (input) input.value = queryId;

      if (isPaid) {
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          try {
            const verifyRes = await fetch(`/api/verify-payment?id=${encodeURIComponent(queryId)}&sessionId=${encodeURIComponent(sessionId)}`);
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.paid) {
              if (window.LayerStudiosApp) {
                window.LayerStudiosApp.showToast('🎉 Pagamento verificado com sucesso via Stripe! A produção foi iniciada.', 'success');
              }
            }
          } catch (e) {
            console.warn('Payment verification error:', e);
          }
        }
      }

      this.track(queryId);
      return;
    }

    const hash = window.location.hash;
    if (hash.includes('?id=')) {
      const trackId = hash.split('?id=')[1].split('&')[0];
      if (trackId) {
        const input = document.getElementById('tracker-input-id');
        if (input) input.value = trackId;
        this.track(trackId);
      }
    }
  }

  setupSearchForm() {
    const form = document.getElementById('tracker-search-form');
    const input = document.getElementById('tracker-input-id');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = input.value.trim();
        if (id) {
          this.track(id);
        }
      });
    }
  }

  setupQuickPills() {
    const pills = document.querySelectorAll('.track-quick-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        const input = document.getElementById('tracker-input-id');
        if (input) input.value = id;
        this.track(id);
      });
    });
  }

  async track(trackId) {
    const resultContainer = document.getElementById('tracker-result-container');
    const notFoundEl = document.getElementById('tracker-not-found');
    const loadingEl = document.getElementById('tracker-loading');

    if (!resultContainer) return;

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (notFoundEl) notFoundEl.classList.add('hidden');
    resultContainer.classList.add('hidden');

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackId)}`);
      if (res.ok) {
        const payload = await res.json();
        this.renderTrackerResult(payload.type, payload.data);
      } else {
        if (notFoundEl) {
          notFoundEl.classList.remove('hidden');
          document.getElementById('tracker-searched-id').textContent = trackId;
        }
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      if (notFoundEl) notFoundEl.classList.remove('hidden');
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  renderTrackerResult(type, data) {
    const container = document.getElementById('tracker-result-container');
    if (!container) return;

    // Header Telemetry
    document.getElementById('track-res-id').textContent = data.id;
    document.getElementById('track-res-title').textContent = data.projectName || (data.items && data.items[0]?.title) || 'Custom 3D Printing Project';
    
    const statusBadge = document.getElementById('track-res-status-badge');
    const currentStatus = data.status || 'Under Review';
    if (statusBadge) {
      statusBadge.textContent = currentStatus.toUpperCase();
      // Colorize badge
      if (['Printing', 'Preparing'].includes(currentStatus)) {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 badge-glow-amber';
      } else if (['Shipped', 'Completed'].includes(currentStatus)) {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      } else {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-sky-500/30 badge-glow-cyan';
      }
    }

    // Specifications Grid
    const specMat = document.getElementById('track-res-material');
    const specQty = document.getElementById('track-res-qty');
    const specCarrier = document.getElementById('track-res-carrier');
    const specTotal = document.getElementById('track-res-total');

    if (specMat) specMat.textContent = data.material || (data.items && data.items[0]?.material) || 'PETG High-Temp';
    if (specQty) specQty.textContent = `${data.quantity || (data.items && data.items[0]?.quantity) || 1} units`;
    
    if (specCarrier) {
      if (data.trackingNumber && data.trackingNumber !== 'PENDING_DISPATCH') {
        specCarrier.innerHTML = `<span class="text-blue-400 font-bold">${data.carrier || 'CTT Expresso'}</span> &bull; <a href="https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?objects=${data.trackingNumber}" target="_blank" class="underline text-blue-400 font-mono">${data.trackingNumber}</a>`;
      } else {
        specCarrier.textContent = data.carrier ? `${data.carrier} (Dispatches on completion)` : 'CTT Express 24h';
      }
    }

    // Payment Action Banner (if not yet marked Paid)
    const payBannerContainer = document.getElementById('tracker-payment-action-banner') || document.createElement('div');
    payBannerContainer.id = 'tracker-payment-action-banner';
    const price = data.pricing?.finalPrice || data.total || 40.50;
    const isPaid = data.paymentStatus === 'Paid' || ['Printing', 'Quality Inspection', 'Ready to Ship', 'Shipped', 'Completed'].includes(currentStatus);

    const isPT = (localStorage.getItem('ls_lang') || 'pt') === 'pt';
    const lang = isPT ? 'pt' : 'en';

    const stageDisplayNames = {
      pt: {
        'Quote Requested': 'Pedido de Orçamento',
        'Under Review': 'Em Análise Técnica',
        'Quote Sent': 'Orçamento Disponível',
        'Awaiting Payment': 'Aguardar Pagamento',
        'Preparing': 'Em Preparação',
        'Printing': 'Em Impressão',
        'Quality Inspection': 'Controlo de Qualidade',
        'Ready to Ship': 'Pronto para Envio',
        'Shipped': 'Enviado',
        'Completed': 'Entregue / Concluído'
      },
      en: {
        'Quote Requested': 'Quote Requested',
        'Under Review': 'Under Technical Review',
        'Quote Sent': 'Quote Ready',
        'Awaiting Payment': 'Awaiting Payment',
        'Preparing': 'Preparing',
        'Printing': 'Printing',
        'Quality Inspection': 'Quality Inspection',
        'Ready to Ship': 'Ready to Ship',
        'Shipped': 'Shipped',
        'Completed': 'Delivered / Completed'
      }
    };

    if (!isPaid) {
      payBannerContainer.className = 'p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl';
      payBannerContainer.innerHTML = `
        <div>
          <span class="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">${isPT ? 'Lançamento de Produção' : 'Production Launch'}</span>
          <p class="text-sm font-bold text-white mt-0.5">${isPT ? 'Conclua o pagamento de' : 'Complete payment of'} <strong class="text-blue-400">€${price.toFixed(2)}</strong> ${isPT ? 'para iniciar a impressão' : 'to start printing'}</p>
          <p class="text-xs text-slate-400">${isPT ? 'MB WAY · Referência Multibanco · Cartão / Apple Pay' : 'MB WAY · Multibanco Reference · Credit Card / Apple Pay'}</p>
        </div>
        <button type="button" id="track-pay-now-btn" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap">
          💳 ${isPT ? 'Pagar & Iniciar Produção' : 'Pay & Start Production'} &rarr;
        </button>
      `;

      const summaryCard = container.querySelector('.p-6.sm\\:p-8');
      if (summaryCard && !summaryCard.contains(payBannerContainer)) {
        summaryCard.insertBefore(payBannerContainer, summaryCard.firstChild);
      }

      payBannerContainer.querySelector('#track-pay-now-btn')?.addEventListener('click', () => {
        if (window.LayerStudiosPayments) {
          window.LayerStudiosPayments.openPayment({
            type: data.id.startsWith('LS') ? 'quote' : 'order',
            id: data.id,
            amount: price,
            title: data.projectName || '3D Printing Order',
            phone: data.phone || '+351 962 118 770',
            email: data.email || '',
            onSuccess: (method) => {
              window.location.reload();
            }
          });
        }
      });
    } else {
      payBannerContainer.remove();
    }

    // 10-Stage Milestone Pipeline rendering
    this.render10StageTimeline(currentStatus, data);

    // Auto-subscribe to live notifications for this order/quote
    if (window.LayerStudiosNotifications) {
      window.LayerStudiosNotifications.addTrackedOrderId(data.id);
      window.LayerStudiosNotifications.loadInitialNotifications();
    }
    this.renderNotificationAlertCard(data);

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderNotificationAlertCard(data) {
    let card = document.getElementById('tracker-notif-alert-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'tracker-notif-alert-card';
      const container = document.getElementById('tracker-result-container');
      if (container) {
        container.insertBefore(card, container.children[1] || container.firstChild);
      }
    }

    const hasPermission = ('Notification' in window) && Notification.permission === 'granted';
    const isPT = (localStorage.getItem('ls_lang') || 'pt') === 'pt';

    card.className = 'p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg';
    card.innerHTML = `
      <div class="flex items-center gap-3.5 w-full sm:w-auto">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h4 class="text-xs sm:text-sm font-bold text-white leading-tight">${isPT ? 'Alertas em Tempo Real' : 'Real-Time Alerts'}</h4>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${hasPermission ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
              ${hasPermission ? (isPT ? '● Ativo' : '● Active') : (isPT ? '● Em Direto' : '● Live')}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            ${isPT 
              ? `Receba notificações automáticas no sino do topo e no navegador sempre que a sua peça <strong class="text-white font-mono">${data.id}</strong> mudar de estado.`
              : `Receive live status updates in the notification bell and browser whenever <strong class="text-white font-mono">${data.id}</strong> updates.`}
          </p>
        </div>
      </div>
      <button type="button" id="btn-subscribe-push-alerts" class="w-full sm:w-auto px-4 py-2.5 rounded-xl ${hasPermission ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 hover:bg-blue-600 text-white border border-slate-700 hover:border-blue-500'} font-semibold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-2 shrink-0">
        <span>${hasPermission ? (isPT ? '🔔 Notificações Ativas' : '🔔 Alerts Active') : (isPT ? '🔔 Ativar Alertas no Navegador' : '🔔 Enable Browser Alerts')}</span>
      </button>
    `;

    const btn = card.querySelector('#btn-subscribe-push-alerts');
    if (btn) {
      btn.onclick = async () => {
        if (window.LayerStudiosNotifications) {
          window.LayerStudiosNotifications.addTrackedOrderId(data.id);
          const granted = await window.LayerStudiosNotifications.requestBrowserNotificationPermission();
          if (granted) {
            btn.innerHTML = `<span>${isPT ? '🔔 Notificações Ativas' : '🔔 Alerts Active'}</span>`;
            btn.className = 'w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-2 shrink-0';
            if (window.LayerStudiosApp) {
              window.LayerStudiosApp.showToast(isPT ? `🔔 Notificações ativadas para ${data.id}!` : `🔔 Alerts activated for ${data.id}!`, 'success');
            }
          } else {
            if (window.LayerStudiosApp) {
              window.LayerStudiosApp.showToast(isPT ? `Alertas em direto registados no Centro de Notificações.` : `Live alerts active in Notification Center.`, 'info');
            }
          }
        }
      };
    }
  }

  render10StageTimeline(currentStatus, data) {
    const pipelineEl = document.getElementById('tracker-10-stages');
    if (!pipelineEl) return;

    const isPT = (localStorage.getItem('ls_lang') || 'pt') === 'pt';
    const stageMap = {
      'Quote Requested': isPT ? 'Pedido de Orçamento' : 'Quote Requested',
      'Under Review': isPT ? 'Em Análise Técnica' : 'Under Technical Review',
      'Quote Sent': isPT ? 'Orçamento Disponível' : 'Quote Ready',
      'Awaiting Payment': isPT ? 'Aguardar Pagamento' : 'Awaiting Payment',
      'Preparing': isPT ? 'Em Preparação' : 'Preparing',
      'Printing': isPT ? 'Em Impressão' : 'Printing',
      'Quality Inspection': isPT ? 'Controlo de Qualidade' : 'Quality Inspection',
      'Ready to Ship': isPT ? 'Pronto para Envio' : 'Ready to Ship',
      'Shipped': isPT ? 'Enviado' : 'Shipped',
      'Completed': isPT ? 'Entregue / Concluído' : 'Delivered / Completed'
    };

    let currentIndex = this.stages.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
    if (currentIndex === -1) {
      if (currentStatus.includes('Print')) currentIndex = 5;
      else if (currentStatus.includes('Ship')) currentIndex = 8;
      else if (currentStatus.includes('Pay')) currentIndex = 3;
      else currentIndex = 1;
    }

    pipelineEl.innerHTML = '';

    this.stages.forEach((stageName, idx) => {
      const isCompleted = idx < currentIndex;
      const isCurrent = idx === currentIndex;
      const isFuture = idx > currentIndex;

      const stageCard = document.createElement('div');
      stageCard.className = `flex items-center p-3 rounded-lg border transition-all ${
        isCurrent
          ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
          : isCompleted
          ? 'bg-slate-900/60 border-slate-800 opacity-90'
          : 'bg-slate-950/40 border-slate-900 opacity-40'
      }`;

      let iconHtml = '';
      if (isCompleted) {
        iconHtml = `<div class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">✓</div>`;
      } else if (isCurrent) {
        iconHtml = `<div class="w-7 h-7 rounded-full bg-blue-500 border border-blue-300 flex items-center justify-center text-white text-xs font-bold font-mono radar-dot">${idx + 1}</div>`;
      } else {
        iconHtml = `<div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-mono">${idx + 1}</div>`;
      }

      let subtext = '';
      if (isCurrent && stageName === 'Printing') {
        subtext = isPT 
          ? '<span class="text-xs text-amber-400 font-mono block mt-0.5 animate-pulse">Impressão ativa &bull; Telemetria nominal (Camada 420/650)</span>'
          : '<span class="text-xs text-amber-400 font-mono block mt-0.5 animate-pulse">Printing active &bull; Nominal telemetry (Layer 420/650)</span>';
      } else if (isCurrent && stageName === 'Quote Sent') {
        subtext = isPT 
          ? '<span class="text-xs text-blue-400 font-mono block mt-0.5">Orçamento pronto para aprovação</span>'
          : '<span class="text-xs text-blue-400 font-mono block mt-0.5">Quote ready for your approval below</span>';
      } else if (isCompleted) {
        subtext = isPT 
          ? '<span class="text-xs text-emerald-400/80 font-mono block mt-0.5">Concluído</span>'
          : '<span class="text-xs text-emerald-400/80 font-mono block mt-0.5">Completed</span>';
      } else {
        subtext = isPT 
          ? '<span class="text-xs text-slate-500 font-mono block mt-0.5">Etapa seguinte</span>'
          : '<span class="text-xs text-slate-500 font-mono block mt-0.5">Pending stage</span>';
      }

      const displayTitle = stageMap[stageName] || stageName;

      stageCard.innerHTML = `
        <div class="flex items-center space-x-3 w-full">
          ${iconHtml}
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}">${displayTitle}</p>
            ${subtext}
          </div>
        </div>
      `;

      pipelineEl.appendChild(stageCard);
    });

    // Customer Action Button (e.g. Approve quote or pay)
    const actionArea = document.getElementById('tracker-customer-action-area');
    if (actionArea) {
      if (currentStatus === 'Quote Sent') {
        actionArea.innerHTML = `
          <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div>
              <p class="font-bold text-white text-base">${isPT ? 'O seu orçamento oficial está pronto para aprovação!' : 'Your official quote is ready for approval!'}</p>
              <p class="text-xs text-slate-300">Total: <span class="font-bold text-blue-400">€${(data.pricing?.finalPrice || 40.50).toFixed(2)}</span> &bull; ${isPT ? 'Prazo: 2–4 dias úteis' : 'Lead time: 2–4 business days'}</p>
            </div>
            <div class="flex space-x-3">
              <button type="button" onclick="window.LayerStudiosTrackerInstance.approveQuote('${data.id}')" class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all">
                ${isPT ? 'Aprovar & Iniciar Produção' : 'Accept & Proceed to Production'} &rarr;
              </button>
            </div>
          </div>
        `;
        actionArea.classList.remove('hidden');
      } else {
        actionArea.classList.add('hidden');
      }
    }
  }

  async approveQuote(quoteId) {
    const isPT = (localStorage.getItem('ls_lang') || 'pt') === 'pt';
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Preparing' })
      });
      if (res.ok) {
        window.LayerStudiosApp && window.LayerStudiosApp.showToast(isPT ? `Orçamento ${quoteId} aprovado! Produção iniciada.` : `Quote ${quoteId} accepted! Production queued.`, 'success');
        this.track(quoteId);
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  }
}

window.LayerStudiosTracker = LayerStudiosTracker;
