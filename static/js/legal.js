/**
 * Layer Studios - GDPR Legal Suite & Cookie Consent Manager
 */

class LayerStudiosLegal {
  constructor() {
    this.cookieConsentKey = 'ls_cookie_consent';
    this.init();
  }

  init() {
    this.checkCookieConsent();
    this.setupLegalModals();
  }

  checkCookieConsent() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) return;

    const consent = localStorage.getItem(this.cookieConsentKey);
    if (!consent) {
      setTimeout(() => {
        banner.classList.remove('translate-y-full', 'opacity-0');
      }, 1000);
    }

    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const acceptEssBtn = document.getElementById('cookie-accept-essential');

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        localStorage.setItem(this.cookieConsentKey, JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: Date.now() }));
        banner.classList.add('translate-y-full', 'opacity-0');
        window.LayerStudiosApp && window.LayerStudiosApp.showToast('Cookie preferences saved.', 'info');
      });
    }

    if (acceptEssBtn) {
      acceptEssBtn.addEventListener('click', () => {
        localStorage.setItem(this.cookieConsentKey, JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }));
        banner.classList.add('translate-y-full', 'opacity-0');
        window.LayerStudiosApp && window.LayerStudiosApp.showToast('Essential cookies accepted only.', 'info');
      });
    }
  }

  setupLegalModals() {
    const triggers = document.querySelectorAll('.legal-link-trigger');
    const modal = document.getElementById('legal-modal');
    const titleEl = document.getElementById('legal-modal-title');
    const bodyEl = document.getElementById('legal-modal-body');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const pageKey = trigger.getAttribute('data-legal-page');
        this.openLegalPage(pageKey, titleEl, bodyEl, modal);
      });
    });
  }

  openLegalPage(pageKey, titleEl, bodyEl, modal) {
    if (!modal) return;

    let title = 'Legal Information';
    let content = '';

    switch (pageKey) {
      case 'privacy':
        title = 'Privacy Policy (GDPR / RGPD)';
        content = `
          <p class="mb-4"><strong>Effective Date:</strong> August 2026</p>
          <div class="p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <strong>Legal Template Notice:</strong> This privacy document is structured according to European Union GDPR (Regulamento Geral sobre a Proteção de Dados) standards and Portuguese law (Lei n.º 58/2019). Review with local legal counsel before public production.
          </div>
          <h4 class="text-base font-bold text-white mt-4 mb-2">1. Data Controller</h4>
          <p class="mb-4">Layer Studios operates as the data controller for personal data collected through this website. We process customer names, emails, telephone numbers, shipping addresses, and 3D design files solely for quote evaluation, custom fabrication, and delivery fulfillment.</p>
          <h4 class="text-base font-bold text-white mt-4 mb-2">2. Confidentiality of 3D Models & Intellectual Property</h4>
          <p class="mb-4">All CAD models, STL geometry, sketches, and specifications uploaded by customers are treated with strict confidentiality under our standard non-disclosure practices. Customer models are never shared with third parties or published in portfolio showcases unless explicit consent has been granted.</p>
          <h4 class="text-base font-bold text-white mt-4 mb-2">3. Your GDPR Rights</h4>
          <p class="mb-4">Under Articles 15-22 of the GDPR, you retain full rights to access, rectify, or request immediate deletion of your personal contact records and stored 3D CAD files at any time by contacting hello@layerstudios.pt.</p>
        `;
        break;

      case 'terms':
        title = 'Terms & Conditions of Service';
        content = `
          <div class="p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <strong>Template Notice:</strong> Standard terms of fabrication service for bespoke 3D manufacturing.
          </div>
          <h4 class="text-base font-bold text-white mt-4 mb-2">1. Custom Manufacturing & Bespoke Goods</h4>
          <p class="mb-4">Layer Studios manufactures bespoke physical items based on customer-provided digital models or requested CAD specifications. Slicing orientation, infill patterns, and support placements are selected to achieve optimum dimensional accuracy and strength.</p>
          <h4 class="text-base font-bold text-white mt-4 mb-2">2. Safety Critical & Certified Uses</h4>
          <p class="mb-4">3D printed parts manufactured via standard FDM additive methods are intended for prototyping, functional fitment, tooling, and general mechanical utility. Unless explicitly certified under specialized quality documentation, printed parts should not be deployed in life-critical medical, aircraft flight-critical, or unverified high-risk structural applications.</p>
          <h4 class="text-base font-bold text-white mt-4 mb-2">3. Intellectual Property Warranties</h4>
          <p class="mb-4">Customers uploading 3D files warrant that they hold the necessary rights or licensing to fabricate the digital models and that prints do not infringe on third-party registered trademarks or intellectual property.</p>
        `;
        break;

      case 'shipping':
        title = 'Shipping & Delivery Policy';
        content = `
          <h4 class="text-base font-bold text-white mt-4 mb-2">1. Destinations & Transit Times</h4>
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>Portugal Continental:</strong> 24h Express via CTT Expresso (€4.50 &bull; Free on orders over €50.00)</li>
            <li><strong>Portugal Islands (Madeira & Açores):</strong> 2-4 business days via CTT Express (€6.90)</li>
            <li><strong>European Union:</strong> 3-5 business days via DHL Express / CTT International (€9.90)</li>
            <li><strong>International / Worldwide:</strong> 5-10 business days tracked (€18.00)</li>
          </ul>
          <h4 class="text-base font-bold text-white mt-4 mb-2">2. Protective Packaging</h4>
          <p class="mb-4">Every component undergoes dimensional inspection, is wrapped in shock-absorbing eco-friendly cushioning, and boxed to prevent transit deformation.</p>
        `;
        break;

      case 'returns':
        title = 'Returns & Refund Policy';
        content = `
          <h4 class="text-base font-bold text-white mt-4 mb-2">1. Custom Manufactured Goods Provision</h4>
          <p class="mb-4">Under European Union Consumer Rights Directive (Article 16(c) of Directive 2011/83/EU), the standard 14-day statutory right of withdrawal does not apply to goods made to the consumer's custom specifications or clearly personalized.</p>
          <h4 class="text-base font-bold text-white mt-4 mb-2">2. Quality Guarantee & Dimensional Remediation</h4>
          <p class="mb-4">If a finished part arrives damaged, has a manufacturing defect, or deviates from the agreed CAD tolerances (standard ±0.15mm), Layer Studios will promptly re-print and dispatch replacement parts at zero additional charge upon photographic verification.</p>
        `;
        break;

      case 'cookies':
        title = 'Cookie Policy';
        content = `
          <p class="mb-4">Layer Studios uses necessary cookies to store session state, cart items, and essential quote preferences. Non-essential analytical telemetry is used solely to optimize website loading speeds and 3D viewer rendering efficiency.</p>
        `;
        break;

      default:
        title = 'Legal Notice (Aviso Legal)';
        content = `<p>Layer Studios &bull; Precision 3D Printing & Prototyping &bull; Portugal</p>`;
        break;
    }

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = content;
    modal.classList.remove('hidden');
  }
}

window.LayerStudiosLegal = LayerStudiosLegal;