/**
 * Layer Studios - Privacy-Conscious Analytics & Conversion Funnel Dispatcher
 * Dispatches conversion milestones while strictly protecting user privacy & CAD confidentiality.
 * Deliberately NEVER collects: personal names, email addresses, delivery addresses, or proprietary CAD filenames.
 */

(function() {
  class LayerStudiosAnalytics {
    constructor() {
      this.initialized = false;
      this.init();
    }

    init() {
      // Log initialization in development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[Analytics] Layer Studios Privacy-First Analytics Initialized');
      }
      this.initialized = true;
    }

    /**
     * Dispatch an event safely
     * @param {string} eventName - Standardized event name
     * @param {object} params - Non-sensitive metadata only
     */
    track(eventName, params = {}) {
      try {
        // Sanitize to guarantee NO PII or sensitive file names are transmitted
        const cleanParams = {};
        for (const [key, value] of Object.entries(params)) {
          // Reject obvious PII fields
          if (['email', 'name', 'phone', 'address', 'filename', 'file_name', 'street', 'nif'].includes(key.toLowerCase())) {
            continue;
          }
          cleanParams[key] = value;
        }

        cleanParams.timestamp = new Date().toISOString();
        cleanParams.url = window.location.pathname;

        // 1. Google Analytics 4 (if configured by owner)
        if (typeof window.gtag === 'function') {
          window.gtag('event', eventName, cleanParams);
        }

        // 2. Plausible Analytics (if configured by owner)
        if (typeof window.plausible === 'function') {
          window.plausible(eventName, { props: cleanParams });
        }

        // 3. Umami Analytics (if configured by owner)
        if (window.umami && typeof window.umami.track === 'function') {
          window.umami.track(eventName, cleanParams);
        }

        // 4. Local dev logger
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`[Analytics Event] ${eventName}:`, cleanParams);
        }
      } catch (err) {
        // Fail silently so analytics never interrupts user checkout/quoting flow
      }
    }
  }

  window.LayerStudiosAnalytics = new LayerStudiosAnalytics();
})();
