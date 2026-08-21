/**
 * Layer Studios - Production-Grade Analytics, Google Ads & Conversion Funnel Engine
 * Compliant with EU GDPR & Google Consent Mode v2.
 * 
 * Features:
 * - Google Consent Mode v2 default & update state management
 * - Dynamic GA4 & Google Ads loading via /api/analytics-config
 * - Strict PII and CAD geometry confidentiality sanitization
 * - Anti-duplication safeguards for purchases and quote submissions
 * - Standard GA4 ecommerce & lead conversion event taxonomy
 * - Failure isolation: analytics script failure never affects core UX
 */

(function() {
  // 1. Establish Google Tag / dataLayer & Consent Mode v2 immediately before any other scripts
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  class LayerStudiosAnalytics {
    constructor() {
      this.config = {
        gaMeasurementId: '',
        googleAdsId: '',
        environment: 'development'
      };
      this.initialized = false;
      this.tagScriptLoaded = false;
      this.trackedPurchases = this.loadTrackedSet('ls_tracked_purchases');
      this.trackedQuotes = this.loadTrackedSet('ls_tracked_quotes');
      this.quoteStartedFired = false;

      this.initConsentMode();
      this.fetchConfigAndInit();
      this.bindGlobalListeners();
    }

    loadTrackedSet(storageKey) {
      try {
        const raw = localStorage.getItem(storageKey) || '[]';
        return new Set(JSON.parse(raw));
      } catch {
        return new Set();
      }
    }

    saveTrackedSet(storageKey, setObj) {
      try {
        const arr = Array.from(setObj).slice(-100); // keep last 100 entries to bound storage
        localStorage.setItem(storageKey, JSON.stringify(arr));
      } catch (e) {
        console.warn('Storage save warning:', e);
      }
    }

    getConsentSettings() {
      try {
        const saved = localStorage.getItem('ls_consent_settings');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}
      return null; // null means user has not made an explicit choice yet
    }

    initConsentMode() {
      const consent = this.getConsentSettings();
      const analyticsGranted = consent ? consent.analytics === true : false;
      const marketingGranted = consent ? consent.marketing === true : false;

      // Google Consent Mode v2 Default Specification
      gtag('consent', 'default', {
        'analytics_storage': analyticsGranted ? 'granted' : 'denied',
        'ad_storage': marketingGranted ? 'granted' : 'denied',
        'ad_user_data': marketingGranted ? 'granted' : 'denied',
        'ad_personalization': marketingGranted ? 'granted' : 'denied',
        'wait_for_update': 500
      });

      // Default dataLayer timestamp
      gtag('js', new Date());
    }

    async fetchConfigAndInit() {
      try {
        const res = await fetch('/api/analytics-config');
        if (res.ok) {
          this.config = await res.json();
        }
      } catch (err) {
        // Fallback gracefully
        this.config = {
          gaMeasurementId: '',
          googleAdsId: '',
          environment: window.location.hostname.includes('layerstudios.pt') ? 'production' : 'development'
        };
      }

      this.initialized = true;
      this.setupGoogleTagsIfAllowed();
      this.setupCookieBannerUI();
    }

    setupGoogleTagsIfAllowed() {
      const gaId = this.config.gaMeasurementId;
      const adsId = this.config.googleAdsId;

      if (!gaId && !adsId) {
        if (this.config.environment === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('[Analytics] Layer Studios Analytics Initialized in DEV Mode (Awaiting owner GA4_MEASUREMENT_ID).');
        }
        return;
      }

      const primaryTagId = gaId || adsId;
      if (primaryTagId && !this.tagScriptLoaded) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`;
        script.onerror = () => {
          console.warn('[Analytics] Google tag script blocked or unreachable. Site operation remains nominal.');
        };
        document.head.appendChild(script);
        this.tagScriptLoaded = true;
      }

      if (gaId) {
        gtag('config', gaId, {
          send_page_view: true,
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure'
        });
      }

      if (adsId) {
        gtag('config', adsId);
      }
    }

    /**
     * Update user consent preferences
     * @param {boolean} analytics 
     * @param {boolean} marketing 
     */
    updateConsent(analytics, marketing) {
      const settings = {
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        timestamp: new Date().toISOString()
      };

      try {
        localStorage.setItem('ls_consent_settings', JSON.stringify(settings));
      } catch (e) {}

      // Dispatch Google Consent Mode v2 Update
      gtag('consent', 'update', {
        'analytics_storage': settings.analytics ? 'granted' : 'denied',
        'ad_storage': settings.marketing ? 'granted' : 'denied',
        'ad_user_data': settings.marketing ? 'granted' : 'denied',
        'ad_personalization': settings.marketing ? 'granted' : 'denied'
      });

      if (settings.analytics || settings.marketing) {
        this.setupGoogleTagsIfAllowed();
      }

      // Hide banner if open
      const banner = document.getElementById('ls-global-cookie-banner');
      if (banner) banner.classList.add('hidden');

      if (window.LayerStudiosApp && typeof window.LayerStudiosApp.showToast === 'function') {
        const isPt = (localStorage.getItem('ls_lang') || 'pt') === 'pt';
        window.LayerStudiosApp.showToast(
          isPt ? 'Preferências de cookies guardadas com sucesso.' : 'Cookie preferences updated successfully.',
          'success'
        );
      }
    }

    setupCookieBannerUI() {
      const existingConsent = this.getConsentSettings();
      if (existingConsent !== null) return; // User already made a decision

      if (document.getElementById('ls-global-cookie-banner')) return;

      const isPt = (localStorage.getItem('ls_lang') || 'pt') === 'pt';

      const banner = document.createElement('div');
      banner.id = 'ls-global-cookie-banner';
      banner.className = 'fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-300';
      banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5 max-w-3xl">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg shrink-0 mt-0.5">
              🍪
            </div>
            <div class="space-y-1 text-xs text-slate-300 leading-relaxed font-sans">
              <p class="font-bold text-white text-sm">
                ${isPt ? 'Privacidade & Preferências de Cookies' : 'Privacy & Cookie Preferences'}
              </p>
              <p class="text-slate-400">
                ${isPt 
                  ? 'Utilizamos armazenamento essencial para gerir o seu carrinho e orçamentos 3D. Com a sua autorização, utilizamos métricas anónimas para otimizar os nossos serviços e medição de campanhas.'
                  : 'We use strictly necessary storage for your 3D quotes and cart. With your permission, we use privacy-first analytics to improve our engineering services and marketing.'}
                <button type="button" id="ls-cookie-read-policy" class="text-blue-400 hover:text-blue-300 underline font-semibold ml-1">
                  ${isPt ? 'Ler Política' : 'Privacy Policy'}
                </button>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button type="button" id="ls-cookie-settings-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-all">
              ${isPt ? 'Definições' : 'Settings'}
            </button>
            <button type="button" id="ls-cookie-decline-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              ${isPt ? 'Apenas Essenciais' : 'Essential Only'}
            </button>
            <button type="button" id="ls-cookie-accept-btn" class="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all">
              ${isPt ? 'Aceitar Todos' : 'Accept All'}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      // Event listeners
      banner.querySelector('#ls-cookie-accept-btn').addEventListener('click', () => {
        this.updateConsent(true, true);
      });

      banner.querySelector('#ls-cookie-decline-btn').addEventListener('click', () => {
        this.updateConsent(false, false);
      });

      banner.querySelector('#ls-cookie-settings-btn').addEventListener('click', () => {
        this.openCookieSettingsModal();
      });

      banner.querySelector('#ls-cookie-read-policy').addEventListener('click', () => {
        if (window.LayerStudiosLegalInstance) {
          window.LayerStudiosLegalInstance.open('privacy');
        }
      });
    }

    openCookieSettingsModal() {
      if (document.getElementById('ls-cookie-modal')) {
        document.getElementById('ls-cookie-modal').remove();
      }

      const consent = this.getConsentSettings() || { analytics: false, marketing: false };
      const isPt = (localStorage.getItem('ls_lang') || 'pt') === 'pt';

      const modal = document.createElement('div');
      modal.id = 'ls-cookie-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all';
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">🍪</div>
              <div>
                <h3 class="text-base font-bold text-white leading-tight">
                  ${isPt ? 'Centro de Preferências de Cookies' : 'Cookie Preferences Center'}
                </h3>
                <p class="text-[11px] text-slate-400 font-mono">Layer Studios · RGPD / GDPR</p>
              </div>
            </div>
            <button id="ls-cookie-modal-close" type="button" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4 text-xs text-slate-300 max-h-[70vh] overflow-y-auto font-sans">
            <p class="text-slate-400">
              ${isPt 
                ? 'Pode personalizar as suas escolhas relativas às tecnologias de armazenamento e medição utilizadas no nosso website.'
                : 'You can customize your preferences for storage and measurement technologies on our website.'}
            </p>

            <!-- 1. Necessary -->
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-sm">${isPt ? '1. Estritamente Necessários' : '1. Strictly Necessary'}</span>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">${isPt ? 'Sempre Ativo' : 'Always Active'}</span>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">
                ${isPt 
                  ? 'Essenciais para o funcionamento do configurador de orçamentos 3D, carrinho de compras, idioma e início de sessão seguro.'
                  : 'Required for 3D quote calculations, shopping cart state, language preferences, and secure account sessions.'}
              </p>
            </div>

            <!-- 2. Analytics -->
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-sm">${isPt ? '2. Análise & Desempenho (GA4)' : '2. Analytics & Performance (GA4)'}</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="ls-cookie-opt-analytics" class="sr-only peer" ${consent.analytics ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">
                ${isPt 
                  ? 'Permite-nos compreender de forma anónima que páginas são visitadas e melhorar o desempenho técnico do visualizador 3D.'
                  : 'Helps us anonymously measure page visits and improve 3D visualizer performance.'}
              </p>
            </div>

            <!-- 3. Marketing -->
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-sm">${isPt ? '3. Marketing & Google Ads' : '3. Marketing & Google Ads'}</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="ls-cookie-opt-marketing" class="sr-only peer" ${consent.marketing ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">
                ${isPt 
                  ? 'Permite aferir a eficácia de campanhas publicitárias no Google Search e medir conversões de orçamentos.'
                  : 'Allows measurement of Google Search advertising efficiency and quote conversion attribution.'}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
            <button type="button" id="ls-cookie-modal-reject" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-all">
              ${isPt ? 'Rejeitar Todos' : 'Reject All'}
            </button>
            <button type="button" id="ls-cookie-modal-save" class="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
              ${isPt ? 'Guardar Preferências' : 'Save Preferences'}
            </button>
          </div>

        </div>
      `;

      document.body.appendChild(modal);

      const closeModal = () => modal.remove();
      modal.querySelector('#ls-cookie-modal-close').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

      modal.querySelector('#ls-cookie-modal-reject').addEventListener('click', () => {
        this.updateConsent(false, false);
        closeModal();
      });

      modal.querySelector('#ls-cookie-modal-save').addEventListener('click', () => {
        const analytics = document.getElementById('ls-cookie-opt-analytics')?.checked || false;
        const marketing = document.getElementById('ls-cookie-opt-marketing')?.checked || false;
        this.updateConsent(analytics, marketing);
        closeModal();
      });
    }

    /**
     * Strict PII & CAD Confidentiality Sanitizer
     * Strips personal names, emails, phone numbers, addresses, tokens, passwords, and CAD filenames.
     */
    sanitizeParams(params) {
      if (!params || typeof params !== 'object') return {};

      const bannedKeyPatterns = [
        'name', 'email', 'phone', 'tel', 'address', 'street', 'postal', 'city', 'nif', 
        'password', 'token', 'secret', 'auth', 'filename', 'file_name', 'cad_name', 
        'notes', 'description', 'message', 'subject', 'company', 'card', 'cvc', 'exp',
        'raw', 'body', 'cookie'
      ];

      const clean = {};

      for (const [key, val] of Object.entries(params)) {
        const lowerKey = key.toLowerCase();
        
        // Discard banned keys
        if (bannedKeyPatterns.some(pattern => lowerKey.includes(pattern))) {
          continue;
        }

        // If string, check for sensitive patterns (emails, phone numbers, file extensions)
        if (typeof val === 'string') {
          if (val.includes('@') || /^\+?[0-9\s-]{9,15}$/.test(val.trim())) {
            continue; // Skip emails and phone numbers
          }
          if (/\.(stl|3mf|step|stp|obj|dxf|iges|zip|pdf|png|jpg)$/i.test(val)) {
            // Do not send specific file name, extract only extension
            clean[key] = val.split('.').pop().toLowerCase();
            continue;
          }
          clean[key] = val.substring(0, 100); // cap string length
        } else if (typeof val === 'number') {
          clean[key] = Number.isFinite(val) ? Number(val.toFixed(2)) : 0;
        } else if (typeof val === 'boolean') {
          clean[key] = val;
        } else if (Array.isArray(val)) {
          // Clean item arrays for ecommerce
          clean[key] = val.map(item => this.sanitizeItem(item)).filter(Boolean);
        }
      }

      return clean;
    }

    sanitizeItem(item) {
      if (!item || typeof item !== 'object') return null;
      return {
        item_id: String(item.productId || item.item_id || item.id || 'prod'),
        item_name: String(item.title || item.item_name || item.name || '3D Product').substring(0, 80),
        item_category: String(item.category || item.item_category || 'Printing Service').substring(0, 50),
        item_variant: String(item.material || item.color || item.item_variant || '').substring(0, 40),
        price: typeof item.price === 'number' ? Number(item.price.toFixed(2)) : 0,
        quantity: parseInt(item.quantity, 10) || 1
      };
    }

    /**
     * Core Dispatcher
     * Wraps gtag safely, never throwing errors.
     */
    track(eventName, rawParams = {}) {
      try {
        // Exclude admin route from polluting customer conversion data
        if (window.location.pathname.startsWith('/admin')) {
          return;
        }

        const safeParams = this.sanitizeParams(rawParams);
        safeParams.page_location = window.location.pathname;
        safeParams.language = (localStorage.getItem('ls_lang') || 'pt') === 'pt' ? 'pt-PT' : 'en';

        // 1. Dispatch to GA4 via gtag
        gtag('event', eventName, safeParams);

        // 2. Dev console logging
        if (this.config.environment === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`%c[GA4 Event] ${eventName}`, 'color: #3b82f6; font-weight: bold;', safeParams);
        }
      } catch (err) {
        // Fail silently so analytics never impedes site operations
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPECIFIC CONVERSION FUNNEL METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Quote Page Viewed
     */
    trackQuotePageViewed() {
      this.track('quote_page_viewed', {
        page_title: 'Quote Engine'
      });
    }

    /**
     * Quote Funnel Step 1: User meaningfully begins quoting
     */
    trackQuoteStarted(source = 'interaction') {
      if (this.quoteStartedFired) return;
      this.quoteStartedFired = true;
      this.track('quote_started', {
        start_method: source // 'file_drop', 'file_picker', 'description_input', 'design_help'
      });
    }

    /**
     * Model Uploaded (Safe metadata only, NO file content or filename)
     */
    trackModelUploaded(fileType, uploadCategory = '3d_model') {
      this.track('model_uploaded', {
        file_type: fileType, // 'stl', '3mf', 'step', 'obj', 'pdf', 'image'
        upload_category: uploadCategory
      });
    }

    /**
     * Model Preview Loaded in Three.js WebGL Viewer
     */
    trackModelPreviewLoaded(material = 'default') {
      this.track('model_preview_loaded', {
        material_preview: material
      });
    }

    /**
     * Customer selects CAD Design Assistance path
     */
    trackDesignHelpRequested() {
      this.track('design_help_requested', {
        quote_path: 'need_cad_design'
      });
    }

    /**
     * Quote Configuration Completed (Material / Quantity / Turnaround)
     */
    trackQuoteConfigured(material, quantity, turnaround) {
      let qtyRange = '1';
      if (quantity >= 50) qtyRange = '50+';
      else if (quantity >= 21) qtyRange = '21-50';
      else if (quantity >= 6) qtyRange = '6-20';
      else if (quantity >= 2) qtyRange = '2-5';

      this.track('quote_configuration_completed', {
        material: material,
        quantity_range: qtyRange,
        turnaround: turnaround
      });
    }

    /**
     * PRIMARY CONVERSION: Quote Submitted
     * Fired only upon verified 201 backend confirmation.
     * Deduplicated by quote reference ID.
     */
    trackQuoteSubmitted(quoteId, details = {}) {
      if (!quoteId) return;
      if (this.trackedQuotes.has(quoteId)) {
        return; // Deduplicated
      }

      this.trackedQuotes.add(quoteId);
      this.saveTrackedSet('ls_tracked_quotes', this.trackedQuotes);

      let qtyRange = '1';
      const q = details.quantity || 1;
      if (q >= 50) qtyRange = '50+';
      else if (q >= 21) qtyRange = '21-50';
      else if (q >= 6) qtyRange = '6-20';
      else if (q >= 2) qtyRange = '2-5';

      this.track('quote_submitted', {
        material: details.material || 'PETG',
        has_3d_model: Boolean(details.hasModel !== false),
        quantity_range: qtyRange,
        estimated_value: details.estimatedPrice ? Number(details.estimatedPrice.toFixed(2)) : undefined,
        currency: 'EUR'
      });
    }

    /**
     * Quote Accepted by Customer in Tracker
     */
    trackQuoteAccepted(quoteId, value = 0) {
      this.track('quote_accepted', {
        currency: 'EUR',
        value: typeof value === 'number' ? Number(value.toFixed(2)) : 0
      });
    }

    /**
     * Store: Product Viewed (GA4 view_item)
     */
    trackViewItem(product) {
      if (!product) return;
      this.track('view_item', {
        currency: 'EUR',
        value: product.price || 0,
        items: [this.sanitizeItem(product)]
      });
    }

    /**
     * Store: Add to Cart (GA4 add_to_cart)
     */
    trackAddToCart(item) {
      if (!item) return;
      this.track('add_to_cart', {
        currency: 'EUR',
        value: (item.price || 0) * (item.quantity || 1),
        items: [this.sanitizeItem(item)]
      });
    }

    /**
     * Store: Remove from Cart (GA4 remove_from_cart)
     */
    trackRemoveFromCart(item) {
      if (!item) return;
      this.track('remove_from_cart', {
        currency: 'EUR',
        value: (item.price || 0) * (item.quantity || 1),
        items: [this.sanitizeItem(item)]
      });
    }

    /**
     * Store: View Cart (GA4 view_cart)
     */
    trackViewCart(cartItems, subtotal) {
      this.track('view_cart', {
        currency: 'EUR',
        value: subtotal || 0,
        items: Array.isArray(cartItems) ? cartItems.map(i => this.sanitizeItem(i)) : []
      });
    }

    /**
     * Store: Begin Checkout (GA4 begin_checkout)
     */
    trackBeginCheckout(cartItems, total) {
      this.track('begin_checkout', {
        currency: 'EUR',
        value: total || 0,
        items: Array.isArray(cartItems) ? cartItems.map(i => this.sanitizeItem(i)) : []
      });
    }

    /**
     * PRIMARY CONVERSION: Purchase (GA4 purchase)
     * Fired ONLY after verified payment confirmation.
     * Guaranteed Deduplication by transaction ID.
     */
    trackPurchase(transactionId, orderData = {}) {
      if (!transactionId) return;

      const safeTxId = String(transactionId).trim();
      if (this.trackedPurchases.has(safeTxId)) {
        return; // Prevents double counting on page reload or return visit
      }

      this.trackedPurchases.add(safeTxId);
      this.saveTrackedSet('ls_tracked_purchases', this.trackedPurchases);

      const items = Array.isArray(orderData.items) ? orderData.items.map(i => this.sanitizeItem(i)) : [];
      const totalValue = typeof orderData.total === 'number' ? orderData.total : (orderData.amount || 0);

      this.track('purchase', {
        transaction_id: safeTxId,
        value: Number(totalValue.toFixed(2)),
        currency: 'EUR',
        shipping: typeof orderData.shippingCost === 'number' ? Number(orderData.shippingCost.toFixed(2)) : 4.50,
        tax: 0.00,
        payment_method: orderData.paymentMethod || 'Stripe',
        items: items
      });
    }

    /**
     * Contact Form Submitted
     */
    trackContactSubmitted(category = 'general') {
      this.track('contact_submitted', {
        contact_type: category
      });
    }

    /**
     * Language Changed
     */
    trackLanguageChanged(fromLang, toLang) {
      this.track('language_changed', {
        from_lang: fromLang,
        to_lang: toLang
      });
    }

    /**
     * Key CTA Clicks
     */
    trackCtaClick(ctaName, location = 'body') {
      this.track(`${ctaName}_clicked`, {
        location: location
      });
    }

    /**
     * Anonymous Operational Error Tracking
     */
    trackError(errorType, errorCategory = 'general') {
      this.track(`${errorType}_error`, {
        error_category: errorCategory
      });
    }

    bindGlobalListeners() {
      // Bind CTA clicks across pages
      document.addEventListener('click', (e) => {
        const ctaBtn = e.target.closest('[data-analytics-cta]');
        if (ctaBtn) {
          const ctaName = ctaBtn.getAttribute('data-analytics-cta');
          const location = ctaBtn.getAttribute('data-analytics-loc') || 'page';
          this.trackCtaClick(ctaName, location);
        }

        const cookieSettingsTrigger = e.target.closest('[data-cookie-settings], [data-legal-modal="cookies"]');
        if (cookieSettingsTrigger) {
          e.preventDefault();
          this.openCookieSettingsModal();
        }
      });
    }
  }

  // Expose singleton to window
  window.LayerStudiosAnalytics = new LayerStudiosAnalytics();
})();
