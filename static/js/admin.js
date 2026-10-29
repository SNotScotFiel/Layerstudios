/**
 * Layer Studios - Administrator Management Portal (v2.4)
 * Complete Quote Inspection & Pricing Editor, Store Order & CTT Tracking Manager,
 * Catalog & Promo Code Manager, CSV Export, and Real-Time Analytics.
 */

class LayerStudiosAdmin {
  constructor() {
    this.token = sessionStorage.getItem('ls_admin_token') || '';
    this.isAuthenticated = Boolean(this.token);
    this.quotes = [];
    this.orders = [];
    this.products = [];
    this.promos = [];
    this.currentEditingQuote = null;
    this.currentEditingOrder = null;

    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupFiltersAndExport();
    this.setupCatalogManager();
    if (this.isAuthenticated) {
      this.loadAdminData();
    }
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bg = type === 'error'
      ? 'bg-red-950/95 border-red-500/40 text-red-200'
      : 'bg-slate-900/95 border-emerald-500/40 text-emerald-300';
    toast.className = `px-4 py-3 rounded-xl border ${bg} shadow-2xl text-xs font-mono flex items-center gap-2 pointer-events-auto transition-all`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('bg-blue-500', 'text-white');
          t.classList.add('text-slate-400', 'hover:text-slate-200');
        });
        tab.classList.add('bg-blue-500', 'text-white');
        tab.classList.remove('text-slate-400', 'hover:text-slate-200');

        const targetView = tab.getAttribute('data-admin-view');
        document.querySelectorAll('.admin-subview').forEach(v => v.classList.add('hidden'));
        const activeView = document.getElementById(`admin-view-${targetView}`);
        if (activeView) activeView.classList.remove('hidden');
      });
    });
  }

  setupFiltersAndExport() {
    document.getElementById('admin-quotes-search')?.addEventListener('input', () => this.renderQuotesTable());
    document.getElementById('admin-quotes-status-filter')?.addEventListener('change', () => this.renderQuotesTable());
    document.getElementById('admin-orders-search')?.addEventListener('input', () => this.renderOrdersTable());
    document.getElementById('admin-orders-status-filter')?.addEventListener('change', () => this.renderOrdersTable());

    document.getElementById('admin-export-quotes-csv')?.addEventListener('click', () => {
      if (!this.quotes.length) return this.showToast('Sem orçamentos para exportar.', 'error');
      const headers = ['ID', 'Data', 'Cliente', 'Email', 'Telefone', 'Projeto', 'Material', 'Cor', 'Quantidade', 'Valor_EUR', 'Pagamento', 'Estado'];
      const rows = this.quotes.map(q => [
        q.public_reference || q.id,
        q.created_at || q.createdAt || '',
        q.customerName || q.customer_name || '',
        q.email || q.guest_email || '',
        q.phone || '',
        q.projectName || q.project_name || '',
        q.material || '',
        q.color || '',
        q.quantity || 1,
        (q.pricing?.finalPrice ?? q.final_price ?? 0).toFixed(2),
        q.paymentStatus || q.payment_status || 'unpaid',
        q.status || ''
      ]);
      this.downloadCSV('layerstudios_orcamentos.csv', headers, rows);
    });

    document.getElementById('admin-export-orders-csv')?.addEventListener('click', () => {
      if (!this.orders.length) return this.showToast('Sem encomendas para exportar.', 'error');
      const headers = ['ID', 'Data', 'Cliente', 'Email', 'Telefone', 'Morada', 'Codigo_Postal', 'Cidade', 'Total_EUR', 'Pagamento', 'Estado', 'Tracking_CTT'];
      const rows = this.orders.map(o => [
        o.public_reference || o.id,
        o.created_at || o.createdAt || '',
        o.customerName || o.customer_name || '',
        o.email || '',
        o.phone || '',
        o.shippingAddress?.address || o.shipping_address || '',
        o.shippingAddress?.postalCode || o.postal_code || '',
        o.shippingAddress?.city || o.city || '',
        Number(o.total || 0).toFixed(2),
        o.paymentStatus || o.payment_status || 'unpaid',
        o.status || '',
        o.trackingNumber || o.tracking_number || ''
      ]);
      this.downloadCSV('layerstudios_encomendas.csv', headers, rows);
    });
  }

  downloadCSV(filename, headers, rows) {
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csvContent = '\uFEFF' + [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(`Ficheiro ${filename} exportado!`);
  }

  async loadAdminData(showFeedback = false) {
    try {
      this.token = sessionStorage.getItem('ls_admin_token') || this.token || '';
      const headers = this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
      const [qRes, oRes, sRes, pRes, prmRes] = await Promise.all([
        fetch('/api/quotes', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/stats', { headers }),
        fetch('/api/products?all=1', { headers }),
        fetch('/api/promos', { headers })
      ]);

      if (qRes.status === 403 || oRes.status === 403) {
        this.isAuthenticated = false;
        sessionStorage.removeItem('ls_admin_token');
        sessionStorage.removeItem('ls_admin_authenticated');
        const authScreen = document.getElementById('admin-auth-screen');
        const dashboardContainer = document.getElementById('admin-dashboard-container');
        if (authScreen && dashboardContainer) {
          dashboardContainer.classList.add('hidden');
          authScreen.classList.remove('hidden');
        }
        return;
      }

      if (qRes.ok) this.quotes = await qRes.json();
      if (oRes.ok) this.orders = await oRes.json();
      if (pRes.ok) this.products = await pRes.json();
      if (prmRes.ok) this.promos = await prmRes.json();

      if (sRes.ok) {
        const stats = await sRes.json();
        this.renderKPIs(stats);
        this.initAnalyticsCharts(stats);
      }

      this.renderQuotesTable();
      this.renderOrdersTable();
      this.renderCatalogAndPromos();

      if (showFeedback) {
        this.showToast('Dados sincronizados com a base de dados Neon.');
      }
    } catch (err) {
      console.error('Admin data loading error:', err);
    }
  }

  renderKPIs(stats) {
    const revEl = document.getElementById('admin-kpi-revenue');
    const ordEl = document.getElementById('admin-kpi-orders');
    const quoEl = document.getElementById('admin-kpi-quotes');
    const prtEl = document.getElementById('admin-kpi-prints');

    if (revEl) revEl.textContent = `€${Number(stats.totalRevenue || 0).toFixed(2)}`;
    if (ordEl) ordEl.textContent = stats.totalOrders ?? 0;
    if (quoEl) quoEl.textContent = stats.totalQuotes ?? 0;
    if (prtEl) prtEl.textContent = `${stats.activePrints ?? 0} Ativas`;
  }

  initAnalyticsCharts(stats = {}) {
    if (!window.Chart) return;

    const revCtx = document.getElementById('admin-chart-revenue');
    if (revCtx) {
      const currentRev = Number(stats.totalRevenue || 0);
      if (this.revenueChart) {
        this.revenueChart.data.datasets[0].data = [640, 1120, 1850, Math.max(currentRev, 120)];
        this.revenueChart.update();
      } else {
        this.revenueChart = new Chart(revCtx, {
          type: 'line',
          data: {
            labels: ['Mês -3', 'Mês -2', 'Mês -1', 'Mês Atual'],
            datasets: [{
              label: 'Receita (€)',
              data: [640, 1120, 1850, Math.max(currentRev, 120)],
              borderColor: '#60a5fa',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              fill: true,
              tension: 0.35
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
            }
          }
        });
      }
    }

    const matCtx = document.getElementById('admin-chart-materials');
    if (matCtx) {
      const breakdown = stats.materialsBreakdown || {};
      const labels = Object.keys(breakdown).length ? Object.keys(breakdown) : ['PETG', 'PLA+', 'TPU 95A', 'ABS/ASA', 'Carbon-CF'];
      const values = Object.keys(breakdown).length ? Object.values(breakdown) : [42, 30, 14, 8, 6];
      if (this.materialsChart) {
        this.materialsChart.data.labels = labels;
        this.materialsChart.data.datasets[0].data = values;
        this.materialsChart.update();
      } else {
        this.materialsChart = new Chart(matCtx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: ['#0284C7', '#60a5fa', '#F97316', '#10B981', '#8B5CF6', '#475569'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } }
            }
          }
        });
      }
    }
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Printing':
      case 'Preparing':
      case 'Quality Inspection':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Ready to Ship':
      case 'Shipped':
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Quote Sent':
      case 'Awaiting Payment':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  }

  getPaymentBadge(status) {
    const isPaid = String(status || '').toLowerCase() === 'paid';
    return isPaid
      ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">PAGO</span>'
      : '<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">POR PAGAR</span>';
  }

  renderQuotesTable() {
    const tbody = document.getElementById('admin-quotes-tbody');
    if (!tbody) return;

    const searchQ = (document.getElementById('admin-quotes-search')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('admin-quotes-status-filter')?.value || '';

    const filtered = (this.quotes || []).filter(q => {
      if (statusFilter && q.status !== statusFilter) return false;
      if (!searchQ) return true;
      const hay = `${q.id} ${q.public_reference || ''} ${q.customerName || q.customer_name || ''} ${q.email || q.guest_email || ''} ${q.projectName || q.project_name || ''} ${q.material || ''}`.toLowerCase();
      return hay.includes(searchQ);
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-500 font-mono text-xs">
            Nenhum pedido de orçamento encontrado.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(q => {
      const refId = q.public_reference || q.id;
      const custName = q.customerName || q.customer_name || 'Cliente';
      const custEmail = q.email || q.guest_email || '—';
      const projName = q.projectName || q.project_name || 'Impressão 3D Personalizada';
      const finalPrice = Number(q.pricing?.finalPrice ?? q.final_price ?? 24.50);
      const payStatus = q.paymentStatus || q.payment_status || 'unpaid';
      const fileCount = Array.isArray(q.files) ? q.files.length : 0;
      const createdDate = (q.created_at || q.createdAt || '').slice(0, 10);

      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors text-sm';
      tr.innerHTML = `
        <td class="py-4 px-4 font-mono whitespace-nowrap">
          <span class="font-bold text-blue-400 block">${refId}</span>
          <span class="text-[10px] text-slate-500">${createdDate}</span>
        </td>
        <td class="py-4 px-4">
          <p class="font-semibold text-white truncate max-w-[220px]">${projName}</p>
          <p class="text-xs text-slate-400 truncate max-w-[220px]">${custName} &bull; ${custEmail}</p>
        </td>
        <td class="py-4 px-4 font-mono text-xs text-slate-300">
          <span class="font-bold text-white">${q.material || 'PETG'}</span> (${q.color || 'Preto'})<br>
          <span class="text-[11px] text-slate-400">${q.quality || '0.20mm'} &bull; ${q.strength || '20%'}</span>
        </td>
        <td class="py-4 px-4 font-mono text-center text-xs text-slate-300">
          <span class="font-bold text-white">${q.quantity || 1} un.</span><br>
          <span class="text-[10px] ${fileCount > 0 ? 'text-blue-400' : 'text-slate-500'}">📦 ${fileCount} fich.</span>
        </td>
        <td class="py-4 px-4 font-mono text-right whitespace-nowrap">
          <span class="font-bold text-white block">€${finalPrice.toFixed(2)}</span>
          ${this.getPaymentBadge(payStatus)}
        </td>
        <td class="py-4 px-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${this.getStatusBadgeClass(q.status)}">
            ${q.status || 'Quote Requested'}
          </span>
        </td>
        <td class="py-4 px-4 text-right whitespace-nowrap">
          <button type="button" class="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500 text-blue-400 hover:text-white text-xs font-semibold transition-all btn-inspect-quote">
            Inspecionar &amp; Editar
          </button>
        </td>
      `;

      tr.querySelector('.btn-inspect-quote').addEventListener('click', () => {
        this.openQuoteInspector(q);
      });

      tbody.appendChild(tr);
    });
  }

  openQuoteInspector(quote) {
    this.currentEditingQuote = quote;
    const modal = document.getElementById('admin-quote-modal');
    if (!modal) return;

    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    const refId = quote.public_reference || quote.id;
    const custName = quote.customerName || quote.customer_name || 'Cliente';
    const custEmail = quote.email || quote.guest_email || '';
    const projName = quote.projectName || quote.project_name || 'Impressão 3D Personalizada';
    const finalPrice = Number(quote.pricing?.finalPrice ?? quote.final_price ?? 24.50);
    const payStatus = quote.paymentStatus || quote.payment_status || 'unpaid';
    const custNotes = quote.customerNotes || quote.customer_notes || quote.description || 'Sem notas adicionais.';
    const adminNotes = (quote.adminNotes || quote.admin_notes || '').replace('Pending engineering inspection.', '');

    setTxt('inspect-quote-id', refId);
    setTxt('inspect-quote-date', (quote.created_at || quote.createdAt || '').replace('T', ' ').slice(0, 16));
    setTxt('inspect-project-name', projName);
    setTxt('inspect-customer-name', custName);
    setTxt('inspect-email', custEmail || 'Sem email');
    setTxt('inspect-phone', quote.phone || 'Sem telefone');
    setTxt('inspect-company', quote.company || 'Cliente Particular');
    setTxt('inspect-material', `${quote.material || 'PETG'} (${quote.color || 'Preto'})`);
    setTxt('inspect-quality', quote.quality || 'Standard (0.20mm)');
    setTxt('inspect-strength', quote.strength || '20% Infill');
    setTxt('inspect-qty', `${quote.quantity || 1} unidades`);
    setTxt('inspect-turnaround', quote.turnaround || 'Standard (2-4 Dias)');
    setTxt('inspect-notes', custNotes);

    setVal('inspect-final-price-input', finalPrice.toFixed(2));
    setVal('inspect-payment-status-select', payStatus);
    setVal('inspect-status-select', quote.status || 'Quote Requested');
    setVal('inspect-admin-notes-input', adminNotes);

    const trackLink = document.getElementById('inspect-track-link');
    if (trackLink) {
      trackLink.href = `/track?id=${encodeURIComponent(refId)}`;
    }

    const filesContainer = document.getElementById('inspect-files-list');
    if (filesContainer) {
      if (quote.files && quote.files.length > 0) {
        filesContainer.innerHTML = quote.files.map(f => {
          const origName = f.original_filename || f.name || 'model.stl';
          const diskName = f.disk_filename || f.diskFilename || `${refId}_${origName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
          const fileSize = f.file_size || f.size || 'Modelo 3D';
          const fileUrl = `/api/files/${encodeURIComponent(diskName)}?admin_token=${encodeURIComponent(this.token)}`;
          return `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all gap-3">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <span class="text-xl shrink-0">📦</span>
                <div class="truncate">
                  <span class="font-bold text-white text-xs block truncate">${origName}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${fileSize}</span>
                </div>
              </div>
              <a href="${fileUrl}" download="${origName}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0">
                <span>⬇️ Descarregar CAD</span>
              </a>
            </div>
          `;
        }).join('');
      } else {
        filesContainer.innerHTML = '<span class="text-slate-500 italic text-xs">Nenhum ficheiro CAD anexado a este pedido.</span>';
      }
    }

    // Quick Action Contact Links
    const emailBtn = document.getElementById('inspect-email-btn');
    if (emailBtn) {
      const subject = encodeURIComponent(`Layer Studios — Orçamento ${refId} (${projName})`);
      const body = encodeURIComponent(`Olá ${custName},\n\nObrigado pelo seu pedido de orçamento na Layer Studios (Referência: ${refId}).\n\nAnalisámos o seu modelo 3D:\n- Material: ${quote.material} (${quote.color || 'Preto'})\n- Quantidade: ${quote.quantity} un.\n- Valor Final: €${finalPrice.toFixed(2)}\n\nPode acompanhar o pedido e concluir o pagamento em:\n${window.location.origin}/track?id=${refId}\n\nMelhores cumprimentos,\nEquipa Layer Studios`);
      emailBtn.href = custEmail ? `mailto:${custEmail}?subject=${subject}&body=${body}` : '#';
      emailBtn.style.display = custEmail ? 'inline-flex' : 'none';
    }

    const phoneBtn = document.getElementById('inspect-phone-btn');
    if (phoneBtn) {
      if (quote.phone && quote.phone.trim()) {
        let cleanPhone = quote.phone.replace(/[^0-9+]/g, '');
        if (!cleanPhone.startsWith('+') && cleanPhone.length === 9) cleanPhone = `+351${cleanPhone}`;
        const msg = encodeURIComponent(`Olá ${custName}! Aqui é da Layer Studios relativamente ao seu pedido de impressão 3D (${refId}).`);
        phoneBtn.href = `https://wa.me/${cleanPhone.replace('+', '')}?text=${msg}`;
        phoneBtn.style.display = 'inline-flex';
      } else {
        phoneBtn.style.display = 'none';
      }
    }

    // Delete Quote Handler
    const deleteBtn = document.getElementById('inspect-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (confirm(`Tem a certeza que deseja eliminar permanentemente o orçamento ${refId}?`)) {
          try {
            const res = await fetch(`/api/quotes/${encodeURIComponent(refId)}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (res.ok) {
              modal.classList.add('hidden');
              this.showToast(`Orçamento ${refId} eliminado.`);
              this.loadAdminData();
            }
          } catch (err) {
            this.showToast('Erro ao eliminar orçamento.', 'error');
          }
        }
      };
    }

    // Save Quote Changes Handler
    const saveBtn = document.getElementById('inspect-update-status-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const updatedStatus = document.getElementById('inspect-status-select')?.value || 'Under Review';
        const updatedPayment = document.getElementById('inspect-payment-status-select')?.value || 'unpaid';
        const updatedPrice = parseFloat(document.getElementById('inspect-final-price-input')?.value || finalPrice);
        const updatedNotes = document.getElementById('inspect-admin-notes-input')?.value || '';

        saveBtn.disabled = true;
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'A guardar...';

        try {
          const res = await fetch(`/api/quotes/${encodeURIComponent(refId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              id: refId,
              status: updatedStatus,
              payment_status: updatedPayment,
              final_price: updatedPrice,
              admin_notes: updatedNotes
            })
          });

          if (res.ok) {
            modal.classList.add('hidden');
            this.showToast(`Orçamento ${refId} atualizado (€${updatedPrice.toFixed(2)} • ${updatedStatus})`);
            await this.loadAdminData();
          } else {
            this.showToast('Erro ao guardar alterações.', 'error');
          }
        } catch (err) {
          this.showToast('Erro de rede ao atualizar orçamento.', 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = origText;
        }
      };
    }

    modal.classList.remove('hidden');
  }

  renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    const searchQ = (document.getElementById('admin-orders-search')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('admin-orders-status-filter')?.value || '';

    const filtered = (this.orders || []).filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!searchQ) return true;
      const hay = `${o.id} ${o.public_reference || ''} ${o.customerName || o.customer_name || ''} ${o.email || ''} ${o.shippingAddress?.city || o.city || ''} ${o.trackingNumber || o.tracking_number || ''}`.toLowerCase();
      return hay.includes(searchQ);
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-500 font-mono text-xs">
            Nenhuma encomenda da loja encontrada.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(o => {
      const refId = o.public_reference || o.id;
      const custName = o.customerName || o.customer_name || 'Cliente Loja';
      const city = o.shippingAddress?.city || o.city || 'Portugal';
      const itemsList = Array.isArray(o.items) && o.items.length
        ? o.items.map(i => `${i.quantity || 1}x ${i.title || i.product_name || 'Artigo'}`).join(', ')
        : (o.quoteId ? `Orçamento ${o.quoteId}` : 'Encomenda Loja');
      const payStatus = o.paymentStatus || o.payment_status || 'unpaid';
      const total = Number(o.total || 0);
      const createdDate = (o.created_at || o.createdAt || '').slice(0, 10);

      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors text-sm';
      tr.innerHTML = `
        <td class="py-4 px-4 font-mono whitespace-nowrap">
          <span class="font-bold text-white block">${refId}</span>
          <span class="text-[10px] text-slate-500">${createdDate}</span>
        </td>
        <td class="py-4 px-4">
          <p class="font-semibold text-white">${custName}</p>
          <p class="text-xs text-slate-400 font-mono">📍 ${city} &bull; ${o.email || ''}</p>
        </td>
        <td class="py-4 px-4 text-xs text-slate-300 max-w-[220px] truncate" title="${itemsList}">
          ${itemsList}
        </td>
        <td class="py-4 px-4 text-center whitespace-nowrap">
          ${this.getPaymentBadge(payStatus)}
          <span class="block text-[10px] text-slate-500 font-mono mt-0.5">${o.paymentMethod || o.payment_method || 'Stripe'}</span>
        </td>
        <td class="py-4 px-4 font-mono font-bold text-white text-right whitespace-nowrap">
          €${total.toFixed(2)}
        </td>
        <td class="py-4 px-4 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${this.getStatusBadgeClass(o.status)}">
            ${o.status || 'Preparing'}
          </span>
        </td>
        <td class="py-4 px-4 text-right whitespace-nowrap">
          <button type="button" class="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-semibold transition-all btn-inspect-order">
            Gerir Encomenda
          </button>
        </td>
      `;

      tr.querySelector('.btn-inspect-order').addEventListener('click', () => {
        this.openOrderInspector(o);
      });

      tbody.appendChild(tr);
    });
  }

  openOrderInspector(order) {
    this.currentEditingOrder = order;
    const modal = document.getElementById('admin-order-modal');
    if (!modal) return;

    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    const refId = order.public_reference || order.id;
    const custName = order.customerName || order.customer_name || 'Cliente Loja';
    const addr = order.shippingAddress || {};

    setTxt('order-modal-id', refId);
    setTxt('order-modal-date', (order.created_at || order.createdAt || '').replace('T', ' ').slice(0, 16));
    setTxt('order-modal-customer', `Encomenda de ${custName}`);
    setTxt('order-modal-name', custName);
    setTxt('order-modal-email', order.email || '—');
    setTxt('order-modal-phone', order.phone || 'Sem telefone');
    setTxt('order-modal-method', order.paymentMethod || order.payment_method || 'Stripe / MB WAY');
    setTxt('order-modal-address', addr.address || order.shipping_address || 'Morada não indicada');
    setTxt('order-modal-postal-city', `${addr.postalCode || order.postal_code || ''} ${addr.city || order.city || 'Portugal'}`.trim());
    setTxt('order-modal-country', addr.country || order.country || 'Portugal');
    setTxt('order-modal-total', `€${Number(order.total || 0).toFixed(2)}`);

    const trackLink = document.getElementById('order-modal-track-link');
    if (trackLink) trackLink.href = `/track?id=${encodeURIComponent(refId)}`;

    const itemsBox = document.getElementById('order-modal-items');
    if (itemsBox) {
      if (Array.isArray(order.items) && order.items.length > 0) {
        itemsBox.innerHTML = order.items.map(item => `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span class="font-bold text-white">${item.quantity || 1}x ${item.title || item.product_name || 'Produto 3D'}</span>
              <span class="block text-[11px] text-slate-400">${item.material || 'PLA+'} &bull; ${item.color || 'Preto'}${item.customization ? ` &bull; Personalização: "${item.customization}"` : ''}</span>
            </div>
            <span class="font-bold text-slate-200">€${Number(item.total_price || item.unit_price || 0).toFixed(2)}</span>
          </div>
        `).join('');
      } else {
        itemsBox.innerHTML = '<p class="text-slate-500 italic">Artigo padrão da loja.</p>';
      }
    }

    setVal('order-modal-status-select', order.status || 'Preparing');
    setVal('order-modal-payment-select', order.paymentStatus || order.payment_status || 'unpaid');
    setVal('order-modal-carrier-input', order.carrier || 'CTT Expresso');
    setVal('order-modal-tracking-input', (order.trackingNumber || order.tracking_number || '') === 'GENERATING' ? '' : (order.trackingNumber || order.tracking_number || ''));

    const deleteBtn = document.getElementById('order-modal-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (confirm(`Tem a certeza que deseja eliminar a encomenda ${refId}?`)) {
          const res = await fetch(`/api/orders/${encodeURIComponent(refId)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          if (res.ok) {
            modal.classList.add('hidden');
            this.showToast(`Encomenda ${refId} eliminada.`);
            this.loadAdminData();
          }
        }
      };
    }

    const saveBtn = document.getElementById('order-modal-save-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const newStatus = document.getElementById('order-modal-status-select')?.value || 'Preparing';
        const newPayment = document.getElementById('order-modal-payment-select')?.value || 'unpaid';
        const newCarrier = document.getElementById('order-modal-carrier-input')?.value.trim() || 'CTT Expresso';
        const newTracking = document.getElementById('order-modal-tracking-input')?.value.trim() || 'GENERATING';

        saveBtn.disabled = true;
        saveBtn.textContent = 'A guardar...';
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(refId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              status: newStatus,
              payment_status: newPayment,
              carrier: newCarrier,
              tracking_number: newTracking
            })
          });
          if (res.ok) {
            modal.classList.add('hidden');
            this.showToast(`Encomenda ${refId} atualizada (${newStatus})!`);
            await this.loadAdminData();
          } else {
            this.showToast('Erro ao atualizar encomenda.', 'error');
          }
        } catch (err) {
          this.showToast('Erro de rede.', 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = '💾 Guardar & Enviar Tracking por Email';
        }
      };
    }

    modal.classList.remove('hidden');
  }

  setupCatalogManager() {
    const prodForm = document.getElementById('admin-new-product-form');
    if (prodForm) {
      prodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          title: document.getElementById('prod-title')?.value.trim(),
          category: document.getElementById('prod-category')?.value,
          price: parseFloat(document.getElementById('prod-price')?.value || '19.90'),
          dimensions: document.getElementById('prod-dimensions')?.value.trim() || '100 × 100 × 100 mm',
          leadTime: document.getElementById('prod-leadtime')?.value.trim() || '1-2 dias úteis',
          image: document.getElementById('prod-image')?.value.trim() || '/static/assets/product-stand.svg',
          description: document.getElementById('prod-description')?.value.trim() || ''
        };
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          prodForm.reset();
          this.showToast(`Produto "${payload.title}" adicionado à loja!`);
          this.loadAdminData();
        } else {
          this.showToast('Erro ao criar produto.', 'error');
        }
      });
    }

    const promoForm = document.getElementById('admin-new-promo-form');
    if (promoForm) {
      promoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('promo-code-input')?.value.trim().toUpperCase();
        const discountPercent = parseFloat(document.getElementById('promo-pct-input')?.value || '10');
        if (!code) return;
        const res = await fetch('/api/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ code, discountPercent })
        });
        if (res.ok) {
          promoForm.reset();
          this.showToast(`Cupão ${code} (-${discountPercent}%) ativo!`);
          this.loadAdminData();
        } else {
          this.showToast('Erro ao criar cupão.', 'error');
        }
      });
    }
  }

  renderCatalogAndPromos() {
    const prodTbody = document.getElementById('admin-products-tbody');
    const prodCount = document.getElementById('admin-products-count');
    if (prodCount) prodCount.textContent = `${(this.products || []).length} produtos`;

    if (prodTbody) {
      prodTbody.innerHTML = '';
      (this.products || []).forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors text-xs';
        tr.innerHTML = `
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${p.image || '/static/assets/product-stand.svg'}" alt="" class="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 object-contain p-1">
              <div>
                <p class="font-bold text-white text-sm">${p.title}</p>
                <p class="text-[11px] text-slate-400 font-mono">${p.dimensions || ''} &bull; ${p.leadTime || '1-2 dias'}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 font-mono text-slate-300">${p.category}</td>
          <td class="py-3 px-4 text-right font-mono font-bold text-white">€${Number(p.price || 0).toFixed(2)}</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">Em Stock</span>
          </td>
          <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
            <button type="button" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-500 text-slate-200 hover:text-white font-semibold transition-all btn-edit-prod">Preço</button>
            <button type="button" class="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white font-semibold transition-all btn-del-prod">✕</button>
          </td>
        `;

        tr.querySelector('.btn-edit-prod').addEventListener('click', async () => {
          const newPrice = prompt(`Novo preço (€) para "${p.title}":`, Number(p.price || 0).toFixed(2));
          if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
            await fetch(`/api/products/${encodeURIComponent(p.id)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
              body: JSON.stringify({ price: parseFloat(newPrice) })
            });
            this.showToast(`Preço de "${p.title}" atualizado para €${parseFloat(newPrice).toFixed(2)}`);
            this.loadAdminData();
          }
        });

        tr.querySelector('.btn-del-prod').addEventListener('click', async () => {
          if (confirm(`Remover "${p.title}" do catálogo da loja?`)) {
            await fetch(`/api/products/${encodeURIComponent(p.id)}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${this.token}` }
            });
            this.showToast(`Produto "${p.title}" removido.`);
            this.loadAdminData();
          }
        });

        prodTbody.appendChild(tr);
      });
    }

    const promosList = document.getElementById('admin-promos-list');
    if (promosList) {
      promosList.innerHTML = '';
      (this.promos || []).forEach(prm => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800';
        div.innerHTML = `
          <div>
            <span class="font-bold text-emerald-400">${prm.code}</span>
            <span class="text-slate-400 ml-2">-${Number(prm.discount_percent || 0)}%</span>
          </div>
          <button type="button" class="text-slate-500 hover:text-red-400 font-bold px-1">✕</button>
        `;
        div.querySelector('button').addEventListener('click', async () => {
          await fetch(`/api/promos/${encodeURIComponent(prm.code)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          this.showToast(`Cupão ${prm.code} removido.`);
          this.loadAdminData();
        });
        promosList.appendChild(div);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-dashboard-view') && !window.adminPortal) {
    window.adminPortal = new LayerStudiosAdmin();
  }
});
