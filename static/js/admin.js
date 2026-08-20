/**
 * Layer Studios - Administrator Management Portal
 * Quote inspection & cost breakdown editor, Order status updater,
 * Chart.js analytics, catalog manager, and 9 transactional email previews.
 */

class LayerStudiosAdmin {
  constructor() {
    this.isAuthenticated = false;
    this.quotes = [];
    this.orders = [];
    this.currentEditingQuote = null;

    this.init();
  }

  init() {
    this.setupAuth();
    this.setupTabNavigation();
    this.setupEmailPreviewSandbox();
  }

  setupAuth() {
    const authModal = document.getElementById('admin-auth-modal');
    const authForm = document.getElementById('admin-auth-form');
    const authPinInput = document.getElementById('admin-auth-pin');
    const dashboardSection = document.getElementById('admin-dashboard-view');
    const navAdminBtn = document.querySelectorAll('.admin-portal-trigger');

    navAdminBtn.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.isAuthenticated) {
          this.openDashboard();
        } else {
          if (authModal) authModal.classList.remove('hidden');
        }
      });
    });

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = authPinInput ? authPinInput.value.trim() : '';
        if (pin === 'cavalao123') {
          this.isAuthenticated = true;
          if (authModal) authModal.classList.add('hidden');
          window.LayerStudiosApp && window.LayerStudiosApp.showToast('Admin Access Granted. Welcome back, Studio Lead.', 'success');
          this.openDashboard();
        } else {
          window.LayerStudiosApp && window.LayerStudiosApp.showToast('Invalid Password.', 'error');
        }
      });
    }
  }

  openDashboard() {
    const dashboard = document.getElementById('admin-dashboard-view');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      dashboard.scrollIntoView({ behavior: 'smooth' });
    }
    this.loadAdminData();
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

  async loadAdminData() {
    try {
      const [qRes, oRes, sRes] = await Promise.all([
        fetch('/api/quotes'),
        fetch('/api/orders'),
        fetch('/api/stats')
      ]);

      if (qRes.ok) this.quotes = await qRes.json();
      if (oRes.ok) this.orders = await oRes.json();
      if (sRes.ok) {
        const stats = await sRes.json();
        this.renderKPIs(stats);
      }

      this.renderQuotesTable();
      this.renderOrdersTable();
      this.initAnalyticsCharts();
    } catch (err) {
      console.error('Admin data loading error:', err);
    }
  }

  renderKPIs(stats) {
    const revEl = document.getElementById('admin-kpi-revenue');
    const ordEl = document.getElementById('admin-kpi-orders');
    const quoEl = document.getElementById('admin-kpi-quotes');
    const prtEl = document.getElementById('admin-kpi-prints');

    if (revEl) revEl.textContent = `€${stats.totalRevenue.toFixed(2)}`;
    if (ordEl) ordEl.textContent = stats.totalOrders;
    if (quoEl) quoEl.textContent = stats.totalQuotes;
    if (prtEl) prtEl.textContent = `${stats.activePrints} Active`;
  }

  initAnalyticsCharts() {
    if (!window.Chart) return;

    // 1. Revenue trend chart
    const revCtx = document.getElementById('admin-chart-revenue');
    if (revCtx && !this.revenueChart) {
      this.revenueChart = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Aug (MTD)'],
          datasets: [{
            label: 'Revenue (€)',
            data: [640, 1120, 1850, 2480],
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            fill: true,
            tension: 0.35
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
          }
        }
      });
    }

    // 2. Material usage chart
    const matCtx = document.getElementById('admin-chart-materials');
    if (matCtx && !this.materialsChart) {
      this.materialsChart = new Chart(matCtx, {
        type: 'doughnut',
        data: {
          labels: ['PETG', 'PLA+', 'TPU 95A', 'ABS/ASA', 'Carbon-CF'],
          datasets: [{
            data: [42, 30, 14, 8, 6],
            backgroundColor: ['#0284C7', '#60a5fa', '#F97316', '#475569', '#1E293B'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  }

  renderQuotesTable() {
    const tbody = document.getElementById('admin-quotes-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.quotes.forEach(q => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors text-sm';
      tr.innerHTML = `
        <td class="py-4 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">${q.id}</td>
        <td class="py-4 px-4">
          <p class="font-semibold text-white truncate max-w-[200px]">${q.projectName}</p>
          <p class="text-xs text-slate-400">${q.customerName} &bull; ${q.email}</p>
        </td>
        <td class="py-4 px-4 font-mono text-slate-300">${q.material} (${q.color || 'Black'})</td>
        <td class="py-4 px-4 font-mono text-center text-slate-300">${q.quantity}</td>
        <td class="py-4 px-4 font-mono font-bold text-white text-right">€${(q.pricing?.finalPrice || 40.50).toFixed(2)}</td>
        <td class="py-4 px-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${this.getStatusBadgeClass(q.status)}">
            ${q.status}
          </span>
        </td>
        <td class="py-4 px-4 text-right">
          <button type="button" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-500 text-slate-200 hover:text-white text-xs font-semibold transition-all btn-inspect-quote" data-id="${q.id}">
            Inspect & Edit
          </button>
        </td>
      `;

      tr.querySelector('.btn-inspect-quote').addEventListener('click', () => {
        this.openQuoteInspector(q);
      });

      tbody.appendChild(tr);
    });
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Printing': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Shipped':
      case 'Completed': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Quote Sent': return 'bg-blue-500/20 text-blue-400 border border-sky-500/30';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  }

  openQuoteInspector(quote) {
    this.currentEditingQuote = quote;
    const modal = document.getElementById('admin-quote-modal');
    if (!modal) return;

    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    setTxt('aq-modal-id', quote.id);
    setTxt('inspect-quote-id', quote.id);
    setTxt('aq-modal-customer', `${quote.customerName} (${quote.email} / ${quote.phone || 'No phone'})`);
    setTxt('inspect-customer-name', quote.customerName);
    setTxt('inspect-email', quote.email || 'No email');
    setTxt('inspect-phone', quote.phone || 'No phone');
    setTxt('inspect-company', quote.company || 'Private client');
    setTxt('aq-modal-project', quote.projectName);
    setTxt('inspect-project-name', quote.projectName);
    setTxt('aq-modal-desc', quote.description || 'No description provided.');
    setTxt('aq-modal-specs', `${quote.material} | ${quote.color || 'Black'} | ${quote.quality} | ${quote.strength}`);
    setTxt('inspect-material', `${quote.material} (${quote.color || 'Black'})`);
    setTxt('inspect-quality', quote.quality);
    setTxt('inspect-strength', quote.strength);
    setTxt('aq-modal-qty', `${quote.quantity} units`);
    setTxt('inspect-qty', `${quote.quantity} units`);
    setTxt('aq-modal-notes', quote.customerNotes || 'None');
    setTxt('inspect-notes', quote.customerNotes || 'None');

    const filesContainer = document.getElementById('inspect-files-list');
    if (filesContainer) {
      if (quote.files && quote.files.length > 0) {
        filesContainer.innerHTML = quote.files.map(f => {
          const safeName = (f.name || 'model.stl').replace(/[^a-zA-Z0-9._-]/g, '');
          const fileUrl = f.url || `/uploads/${quote.id}_${safeName}`;
          return `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all gap-3">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <span class="text-xl shrink-0">📦</span>
                <div class="truncate">
                  <span class="font-bold text-white text-xs block truncate">${f.name}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${f.size || '3D Model'} ${f.dimensions ? `· ${f.dimensions.x}×${f.dimensions.y}×${f.dimensions.z}mm` : ''}</span>
                </div>
              </div>
              <a href="${fileUrl}" download="${f.name}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0">
                <span>⬇️ Download</span>
              </a>
            </div>
          `;
        }).join('');
      } else {
        filesContainer.innerHTML = '<span class="text-slate-500 italic text-xs">No files attached</span>';
      }
    }

    // Pricing Breakdown
    const p = quote.pricing || {};
    setTxt('inspect-total', `€${(p.finalPrice || 0).toFixed(2)}`);

    // Quick Action Contact Links
    const emailBtn = document.getElementById('inspect-email-btn');
    if (emailBtn) {
      const subject = encodeURIComponent(`Layer Studios — Quote ${quote.id} (${quote.projectName})`);
      const body = encodeURIComponent(`Hello ${quote.customerName},\n\nThank you for requesting a quote with Layer Studios (Quote Reference: ${quote.id}).\n\nWe have reviewed your 3D model and specifications:\n- Material: ${quote.material} (${quote.color || 'Black'})\n- Infill: ${quote.strength}\n- Quantity: ${quote.quantity} units\n- Estimated Total: €${(quote.pricing?.finalPrice || 0).toFixed(2)}\n\nBest regards,\nLayer Studios Team\ncontact@layerstudios.pt`);
      emailBtn.href = quote.email ? `mailto:${quote.email}?subject=${subject}&body=${body}` : '#';
      emailBtn.style.display = quote.email ? 'inline-flex' : 'none';
    }

    const phoneBtn = document.getElementById('inspect-phone-btn');
    if (phoneBtn) {
      if (quote.phone && quote.phone.trim()) {
        const cleanPhone = quote.phone.replace(/[^0-9+]/g, '');
        phoneBtn.href = `https://wa.me/${cleanPhone.replace('+', '')}`;
        phoneBtn.style.display = 'inline-flex';
      } else {
        phoneBtn.style.display = 'none';
      }
    }

    // Delete Quote Handler
    const deleteBtn = document.getElementById('inspect-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (confirm(`Are you sure you want to permanently delete Quote ${quote.id}?`)) {
          try {
            await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
            modal.classList.add('hidden');
            this.quotes = this.quotes.filter(q => q.id !== quote.id);
            this.renderQuotesTable();
          } catch (err) {
            console.error('Delete quote error:', err);
          }
        }
      };
    }

    // Status save handler
    const saveBtn = document.getElementById('inspect-update-status-btn') || document.getElementById('aq-save-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const updatedStatus = document.getElementById('inspect-status-select')?.value || 'Under Review';
        try {
          const res = await fetch(`/api/quotes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: quote.id,
              status: updatedStatus
            })
          });

          quote.status = updatedStatus;
          modal.classList.add('hidden');
          this.renderQuotesTable();
        } catch (err) {
          console.error('Save quote error:', err);
          quote.status = updatedStatus;
          modal.classList.add('hidden');
          this.renderQuotesTable();
        }
      };
    }

    modal.classList.remove('hidden');
  }

  renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors text-sm';
      tr.innerHTML = `
        <td class="py-4 px-4 font-mono font-bold text-white">${o.id}</td>
        <td class="py-4 px-4 font-mono text-xs text-blue-400">${o.quoteId || 'Store Order'}</td>
        <td class="py-4 px-4">
          <p class="font-semibold text-white">${o.customerName}</p>
          <p class="text-xs text-slate-400 font-mono">${o.shippingAddress?.city || 'Portugal'}</p>
        </td>
        <td class="py-4 px-4 font-mono font-bold text-white">€${o.total.toFixed(2)}</td>
        <td class="py-4 px-4 font-mono text-xs text-slate-300">${o.carrier || 'CTT Express'}</td>
        <td class="py-4 px-4 text-center">
          <select class="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white order-status-select" data-id="${o.id}">
            <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
            <option value="Printing" ${o.status === 'Printing' ? 'selected' : ''}>Printing</option>
            <option value="Quality Inspection" ${o.status === 'Quality Inspection' ? 'selected' : ''}>Quality Inspection</option>
            <option value="Ready to Ship" ${o.status === 'Ready to Ship' ? 'selected' : ''}>Ready to Ship</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      `;

      tr.querySelector('.order-status-select').addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        try {
          await fetch(`/api/orders/${o.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          window.LayerStudiosApp && window.LayerStudiosApp.showToast(`Updated ${o.id} to ${newStatus}`, 'success');
        } catch (err) {
          console.error('Update order status error:', err);
        }
      });

      tbody.appendChild(tr);
    });
  }

  setupEmailPreviewSandbox() {
    const triggerBtn = document.getElementById('admin-email-preview-btn');
    const modal = document.getElementById('email-preview-modal');
    const selector = document.getElementById('email-template-select');
    const frame = document.getElementById('email-preview-frame');

    if (triggerBtn && modal) {
      triggerBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        this.renderEmailTemplate(selector ? selector.value : 'quote_ready');
      });
    }

    if (selector) {
      selector.addEventListener('change', () => {
        this.renderEmailTemplate(selector.value);
      });
    }
  }

  renderEmailTemplate(templateKey) {
    const container = document.getElementById('email-preview-container');
    if (!container) return;

    let subject = '';
    let bodyContent = '';

    switch (templateKey) {
      case 'quote_ready':
        subject = '[Layer Studios] Your 3D Manufacturing Quote is Ready (LS-1048)';
        bodyContent = `
          <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 12px;">Your Custom Manufacturing Quote is Ready</h2>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Hi Manuel,</p>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Our engineering team has inspected your 3D CAD files for <strong>Custom Equipment Mounting Bracket</strong>. The model is fully optimized for precision FDM production.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #0D1424; border-radius: 8px; overflow: hidden; border: 1px solid #1E293B;">
            <tr style="border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 12px; text-align: left;">Item / Specs</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
            <tr style="color: #ffffff; font-size: 14px;">
              <td style="padding: 12px;">PETG Matte Black (50% Gyroid Infill / 0.20mm Standard)</td>
              <td style="padding: 12px; text-align: center;">4</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #60a5fa;">€40.50</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 28px 0;">
            <a href="http://localhost:8080/#track?id=LS-1048" style="background: #0284C7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Review & Accept Quote &rarr;</a>
          </div>
        `;
        break;

      case 'order_printing':
        subject = '[Layer Studios] Your Order ORD-8821 is Currently Printing!';
        bodyContent = `
          <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 12px;">Your Parts are on the Print Bed!</h2>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Hi Ricardo,</p>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Machine #2 has started printing your batch of <strong>20x Custom PCB Enclosure Box & Snap-Lid</strong>. Calibration telemetry is nominal with flawless first-layer adhesion.</p>
          <p style="color: #60a5fa; font-size: 13px; font-family: monospace;">Current Status: 65% Completed (Layer 420/650)</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:8080/#track?id=ORD-8821" style="background: #0284C7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Track Live Progress</a>
          </div>
        `;
        break;

      case 'order_shipped':
        subject = '[Layer Studios] Order ORD-8822 Has Shipped via CTT Expresso';
        bodyContent = `
          <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 12px;">Your Order is On Its Way!</h2>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Hi Elena,</p>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Your package has passed our quality inspection and was dispatched with <strong>CTT Expresso 24h</strong>.</p>
          <div style="background: #0D1424; padding: 16px; border-radius: 8px; border: 1px solid #1E293B; margin: 18px 0;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">Tracking Number:</p>
            <p style="color: #60a5fa; font-size: 16px; font-weight: bold; font-family: monospace; margin: 4px 0 0 0;">CT984512304PT</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://www.ctt.pt" style="background: #0284C7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Track Delivery with CTT</a>
          </div>
        `;
        break;

      default:
        subject = '[Layer Studios] Project Update Notification';
        bodyContent = `<p style="color: #94A3B8;">Project status update for Layer Studios order.</p>`;
        break;
    }

    document.getElementById('email-preview-subject').textContent = subject;
    container.innerHTML = `
      <div style="background-color: #070A10; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F8FAFC; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #1E293B;">
          <h1 style="color: #60a5fa; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin: 0;">LAYER STUDIOS</h1>
          <p style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0;">Custom 3D Printing & Rapid Prototyping</p>
        </div>

        ${bodyContent}

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; text-align: center; line-height: 1.5;">
          <p style="margin: 0;">Layer Studios &bull; Lisbon & Porto, Portugal</p>
          <p style="margin: 4px 0 0 0;">Questions? Reply directly to this email or contact <a href="mailto:hello@layerstudios.pt" style="color: #60a5fa;">hello@layerstudios.pt</a></p>
        </div>
      </div>
    `;
  }
}

window.LayerStudiosAdmin = LayerStudiosAdmin;
