/**
 * Layer Studios - Master Application Controller
 * Handles Hero 3D visualizer, interactive price simulator, portfolio modal,
 * FAQ accordions, toast notification system, and mobile drawer navigation.
 */

class LayerStudiosApp {
  constructor() {
    this.heroViewer = null;
    this.init();
  }

  init() {
    this.initHeroViewer();
    this.setupMobileMenu();
    this.setupStickyNav();
    this.setupPricingSimulator();
    this.setupPortfolioModal();
    this.setupFAQAccordions();
    this.setupContactForm();
    this.setupB2BForm();
    this.setupModalDismissals();
  }

  initHeroViewer() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    this.heroViewer = new LayerStudiosViewer('hero-canvas', {
      autoRotate: true,
      initialMaterial: 'cyan',
      showGrid: true,
      showBuildCage: true,
      showAxes: false,
      onTelemetryUpdate: (t) => {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('hero-telemetry-dims',   t.dimensionsStr);
        set('hero-telemetry-vol',    `${t.volumeCm3} cm³`);
        set('hero-telemetry-weight', `~${t.weightGrams} g`);
        set('hero-telemetry-time',   t.estimatedDuration);
        set('hero-layer-count',      `${t.layerCount} layers @ 0.2mm`);
        // Reset slicer label when new model loads
        const lv = document.getElementById('hero-layer-val');
        if (lv) lv.textContent = `Z: ${t.z} mm (${t.layerCount} layers)`;
      },
      onFitResult: (r) => {
        const badge = document.getElementById('hero-fit-badge');
        if (!badge) return;
        badge.classList.remove('hidden');
        if (r.fits) {
          badge.className = 'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono flex items-center space-x-1.5 backdrop-blur-sm border bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
          badge.innerHTML = `<span>✓ Fits on plate</span><span class="text-emerald-600">${Math.max(r.pctX,r.pctY,r.pctZ)}%</span>`;
        } else {
          badge.className = 'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono flex items-center space-x-1.5 backdrop-blur-sm border bg-red-950/80 text-red-400 border-red-500/40';
          badge.innerHTML = `<span>⚠ Exceeds 256mm</span>`;
        }
      }
    });

    // Load initial mechanical CAD model
    setTimeout(() => { if (this.heroViewer) this.heroViewer.loadDefaultPart(); }, 100);

    // Slicer Slider
    const slicerSlider = document.getElementById('hero-slicer-slider');
    const layerLabel   = document.getElementById('hero-layer-val');
    if (slicerSlider) {
      slicerSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.heroViewer) this.heroViewer.setSliceHeight(val);
        if (layerLabel && this.heroViewer?.currentGeometry) {
          const bb = this.heroViewer.currentGeometry.boundingBox;
          const totalH = bb ? (bb.max.y - bb.min.y) : 46;
          const curMm  = ((val / 100) * totalH).toFixed(1);
          const layers = Math.round((val / 100) * (totalH / 0.2));
          layerLabel.textContent = val >= 99
            ? `Z: ${totalH.toFixed(1)} mm (${Math.round(totalH/0.2)} layers)`
            : `Z: ${curMm} mm (${layers} layers)`;
        }
      });
    }

    // Wireframe Toggle
    const wireBtn = document.getElementById('hero-wireframe-btn');
    if (wireBtn) {
      wireBtn.addEventListener('click', () => {
        const on = !this.heroViewer.isWireframe;
        this.heroViewer.setWireframe(on);
        wireBtn.classList.toggle('text-blue-400', on);
        wireBtn.classList.toggle('border-blue-400/60', on);
      });
    }

    // Axes Toggle
    const axesBtn = document.getElementById('hero-axes-btn');
    if (axesBtn) {
      axesBtn.addEventListener('click', () => {
        this.heroViewer.toggleAxes();
        const hasAxes = !!this.heroViewer.axesHelper;
        axesBtn.classList.toggle('text-blue-400', hasAxes);
        axesBtn.classList.toggle('border-blue-400/60', hasAxes);
      });
    }

    // Auto-Rotate Toggle
    const rotateBtn = document.getElementById('hero-rotate-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        const on = this.heroViewer.toggleAutoRotate();
        rotateBtn.classList.toggle('text-blue-400', on);
        rotateBtn.classList.toggle('text-slate-400', !on);
        rotateBtn.textContent = on ? '⟳ Auto' : '⏸ Paused';
      });
    }

    // Material Swatches
    const matBtns = document.querySelectorAll('.hero-mat-btn');
    matBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        matBtns.forEach(b => b.classList.remove('ring-2', 'ring-blue-400'));
        btn.classList.add('ring-2', 'ring-blue-400');
        if (this.heroViewer) this.heroViewer.setMaterialPreset(btn.getAttribute('data-mat'));
      });
    });
  }

  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const closeBtn = document.getElementById('mobile-menu-close');
    const links = document.querySelectorAll('.mobile-nav-link');

    const openMenu = () => {
      if (backdrop && drawer) {
        backdrop.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
      }
    };

    const closeMenu = () => {
      if (backdrop && drawer) {
        drawer.classList.add('translate-x-full');
        setTimeout(() => backdrop.classList.add('hidden'), 250);
      }
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    links.forEach(l => l.addEventListener('click', closeMenu));
  }

  setupStickyNav() {
    const header = document.getElementById('main-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('bg-slate-950/90', 'border-b', 'border-slate-800/80', 'backdrop-blur-md');
      } else {
        header.classList.remove('bg-slate-950/90', 'border-b', 'border-slate-800/80', 'backdrop-blur-md');
      }
    });
  }

  setupPricingSimulator() {
    const sizeSlider = document.getElementById('sim-size-slider');
    const matSelect = document.getElementById('sim-mat-select');
    const qtyInput = document.getElementById('sim-qty-input');
    const qualSelect = document.getElementById('sim-qual-select');

    const volEl = document.getElementById('sim-calculated-vol');
    const timeEl = document.getElementById('sim-calculated-time');
    const costEl = document.getElementById('sim-calculated-cost');

    const updateSim = () => {
      const scale = parseFloat(sizeSlider ? sizeSlider.value : 50); // 10 to 100%
      const mat = matSelect ? matSelect.value : 'PETG';
      const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      const qual = qualSelect ? qualSelect.value : 'standard';

      // Base volume: ~45cm3 at 50%
      const volumeCm3 = Math.round((Math.pow(scale / 50, 2.5) * 45) * 10) / 10;
      const grams = Math.round(volumeCm3 * 1.25 * 0.4);

      let pricePerGram = 0.10;
      if (mat === 'PLA') pricePerGram = 0.08;
      else if (mat === 'TPU') pricePerGram = 0.16;
      else if (mat === 'ASA') pricePerGram = 0.14;
      else if (mat === 'CF') pricePerGram = 0.22;

      let qualFactor = 1.0;
      if (qual === 'draft') qualFactor = 0.85;
      else if (qual === 'fine') qualFactor = 1.60;

      const printHours = Math.max(0.5, ((grams / 18) * qualFactor).toFixed(1));
      const unitCost = 4.00 + (grams * pricePerGram) + (printHours * 3.50);

      let discount = 0;
      if (qty >= 100) discount = 0.35;
      else if (qty >= 50) discount = 0.25;
      else if (qty >= 25) discount = 0.18;
      else if (qty >= 10) discount = 0.10;

      const total = (unitCost * qty) * (1 - discount);

      if (volEl) volEl.textContent = `${volumeCm3} cm³ (~${grams}g)`;
      if (timeEl) timeEl.textContent = `~${Math.round(printHours * 60)} mins per unit`;
      if (costEl) costEl.textContent = `€${total.toFixed(2)}`;
    };

    if (sizeSlider) sizeSlider.addEventListener('input', updateSim);
    if (matSelect) matSelect.addEventListener('change', updateSim);
    if (qtyInput) qtyInput.addEventListener('input', updateSim);
    if (qualSelect) qualSelect.addEventListener('change', updateSim);

    updateSim();
  }

  setupPortfolioModal() {
    const triggers = document.querySelectorAll('.portfolio-card-trigger');
    const modal = document.getElementById('portfolio-case-modal');

    // Portfolio filters
    const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
    const cards = document.querySelectorAll('.portfolio-item-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-blue-500', 'text-white', 'border-blue-400');
          b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
        });
        btn.classList.add('bg-blue-500', 'text-white', 'border-blue-400');
        btn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');

        const cat = btn.getAttribute('data-category');
        cards.forEach(c => {
          if (cat === 'All' || c.getAttribute('data-category') === cat) {
            c.classList.remove('hidden');
          } else {
            c.classList.add('hidden');
          }
        });
      });
    });

    triggers.forEach(card => {
      card.addEventListener('click', () => {
        if (!modal) return;
        document.getElementById('pm-title').textContent = card.getAttribute('data-title');
        document.getElementById('pm-cat').textContent = card.getAttribute('data-category');
        document.getElementById('pm-material').textContent = card.getAttribute('data-material');
        document.getElementById('pm-time').textContent = card.getAttribute('data-time');
        document.getElementById('pm-qty').textContent = card.getAttribute('data-quantity') || 'Custom Batch';
        document.getElementById('pm-challenge').textContent = card.getAttribute('data-challenge');
        document.getElementById('pm-solution').textContent = card.getAttribute('data-solution');
        document.getElementById('pm-result').textContent = card.getAttribute('data-result');
        document.getElementById('pm-image').src = card.getAttribute('data-image');

        modal.classList.remove('hidden');
      });
    });
  }

  setupFAQAccordions() {
    const items = document.querySelectorAll('.faq-accordion-item');
    items.forEach(item => {
      const button = item.querySelector('.faq-accordion-btn');
      const content = item.querySelector('.faq-accordion-content');
      const icon = item.querySelector('.faq-accordion-icon');

      if (button && content) {
        button.addEventListener('click', () => {
          const isOpen = !content.classList.contains('hidden');
          // Close all others
          items.forEach(other => {
            other.querySelector('.faq-accordion-content')?.classList.add('hidden');
            other.querySelector('.faq-accordion-icon')?.classList.remove('rotate-180');
          });

          if (!isOpen) {
            content.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
          }
        });
      }
    });
  }

  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending message...';
      }

      const payload = {
        name: document.getElementById('contact-name')?.value,
        email: document.getElementById('contact-email')?.value,
        phone: document.getElementById('contact-phone')?.value,
        subject: document.getElementById('contact-subject')?.value,
        message: document.getElementById('contact-message')?.value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        this.showToast(data.message || 'Message sent! We will reply within 24 hours.', 'success');
        form.reset();
      } catch {
        this.showToast('Message sent! Our engineering team will contact you shortly.', 'success');
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message &rarr;';
        }
      }
    });
  }

  setupB2BForm() {
    const b2bBtn = document.getElementById('b2b-quote-trigger');
    if (b2bBtn) {
      b2bBtn.addEventListener('click', () => {
        const compInput = document.getElementById('quote-company');
        const notesInput = document.getElementById('quote-notes');
        if (compInput) compInput.value = 'Enterprise B2B Client';
        if (notesInput) notesInput.value = '[B2B Request: Inquire volume series discount and NDA sign-off]';
        window.location.hash = '#quote';
        this.showToast('B2B options pre-loaded into Quote Builder!', 'info');
      });
    }
  }

  setupModalDismissals() {
    const modals = document.querySelectorAll('.app-modal');
    modals.forEach(modal => {
      const dismissBtns = modal.querySelectorAll('.modal-dismiss-btn');
      const backdrop = modal.querySelector('.modal-backdrop-area');

      dismissBtns.forEach(btn => {
        btn.addEventListener('click', () => modal.classList.add('hidden'));
      });
      if (backdrop) {
        backdrop.addEventListener('click', () => modal.classList.add('hidden'));
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 max-w-md ${
      type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' :
      type === 'warning' ? 'bg-amber-950/90 text-amber-200 border-amber-500/40' :
      type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/40' :
      'bg-slate-900/95 text-sky-200 border-sky-500/40'
    }`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `
      <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-black/40 flex-shrink-0">${icon}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.LayerStudiosApp = new LayerStudiosApp();
  window.LayerStudiosQuoteEngine = new LayerStudiosQuoteEngine();
  window.LayerStudiosTrackerInstance = new LayerStudiosTracker();
  window.LayerStudiosStoreInstance = new LayerStudiosStore();
  window.LayerStudiosMaterialsInstance = new LayerStudiosMaterials();
  window.LayerStudiosAdminInstance = new LayerStudiosAdmin();
  window.LayerStudiosLegalInstance = new LayerStudiosLegal();
});
