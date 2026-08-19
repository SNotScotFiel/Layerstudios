/**
 * Layer Studios - Internationalization (i18n) Engine (PT-PT / EN)
 * Handles dual-language switching (Portuguese & English), first-visit language modal,
 * persistent language preference in localStorage, and dynamic live text translation.
 */

const LS_TRANSLATIONS = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.quote': 'Get a Quote',
    'nav.store': 'Store',
    'nav.materials': 'Materials',
    'nav.track': 'Track Order',
    'nav.admin': 'Admin',
    'nav.new_quote': 'New Quote →',
    'nav.live_status': 'Live Status',

    // Hero
    'hero.badge': '256³ mm Bambu Lab · Precision Studio in Portugal',
    'hero.title_part1': 'You imagine it.',
    'hero.title_part2': 'We print it.',
    'hero.desc': 'Professional 3D printing & rapid prototyping studio in Portugal. Upload your STL or 3MF file, get an instant estimate, or order custom-engineered functional designs.',
    'hero.cta_quote': 'Instant Quote & Slicer →',
    'hero.cta_store': 'Browse Catalog',
    'hero.stat_vol': '256³ mm Build Plate',
    'hero.stat_speed': '24–48h Fast Turnaround',
    'hero.stat_shipping': 'Free Shipping > €50 in PT',

    // 3D Viewer & Telemetry
    'cad.title': '3D Model Preview',
    'cad.slicer': 'Layer Preview',
    'cad.size': 'Size (mm)',
    'cad.volume': 'Volume',
    'cad.filament': 'Est. Filament',
    'cad.time': 'Est. Time',
    'cad.fits': '✓ Fits on plate',
    'cad.exceeds': '⚠ Exceeds 256mm',

    // Quote Page
    'quote.title': 'Get a Quote',
    'quote.subtitle': 'Instant estimate for 3D printing. Upload your file or request a custom CAD design.',
    'quote.tab_model': 'I have a 3D file',
    'quote.tab_design': 'I need it designed',
    'quote.drop_title': 'Drop your 3D files here',
    'quote.drop_sub': 'or click to browse',
    'quote.drop_formats': 'STL · 3MF · STEP · OBJ · PDF drawings (max 50 MB)',
    'quote.settings_title': 'Print Settings',
    'quote.mat_label': 'Material',
    'quote.quality_label': 'Print Quality',
    'quote.infill_label': 'Infill Strength',
    'quote.qty_label': 'Quantity',
    'quote.color_label': 'Preferred Colour',
    'quote.contact_title': 'Your Details',
    'quote.name_label': 'Name',
    'quote.email_label': 'Email',
    'quote.phone_label': 'Phone',
    'quote.company_label': 'Company (optional)',
    'quote.country_label': 'Shipping Country',
    'quote.confidential': 'NDA / Confidential project (do not photograph)',
    'quote.notes_label': 'Additional notes',
    'quote.submit_btn': 'Send Quote Request →',
    'quote.cost_title': 'Estimated Cost',
    'quote.cost_mat': 'Material cost',
    'quote.cost_time': 'Print time',
    'quote.cost_prep': 'Base prep & calibration',
    'quote.cost_shipping': 'Shipping',
    'quote.cost_total': 'Total Estimate',

    // Store Page
    'store.title': 'Layer Studios Store',
    'store.subtitle': 'Functional, minimalist, custom 3D printed lifestyle & desk designs.',
    'store.filter_all': 'All Products',
    'store.filter_desk': 'Desk & Tech',
    'store.filter_auto': 'Automotive',
    'store.filter_home': 'Home & Workshop',
    'store.add_to_cart': 'Add to Cart',
    'store.customize_btn': 'Customize & 3D View',
    'store.cart_title': 'Your Shopping Cart',
    'store.checkout_btn': 'Proceed to Checkout →',

    // Materials Page
    'mat.title': 'Engineering Materials Center',
    'mat.subtitle': 'Compare filaments, thermal tolerance, impact strength, and run our Material Advisor Quiz.',
    'mat.quiz_title': 'Find Your Ideal Material',
    'mat.table_title': 'Technical Comparison Matrix',

    // Track Page
    'track.title': 'Live Production Tracker',
    'track.subtitle': 'Enter your Quote ID (e.g. LS-XXXX) or Order Reference to track your manufacturing progress in real time.',
    'track.input_placeholder': 'e.g. LS-1053 or ORD-1049...',
    'track.btn': 'Track Order →',

    // Modal Language
    'lang_modal.title': 'Welcome to Layer Studios',
    'lang_modal.subtitle': 'Please select your preferred language / Escolha o seu idioma de preferência:',
    'lang_modal.btn_pt': 'Português (Portugal)',
    'lang_modal.btn_en': 'English (International)',
    'lang_modal.save': 'Continue / Continuar'
  },

  pt: {
    // Nav
    'nav.home': 'Início',
    'nav.quote': 'Pedir Orçamento',
    'nav.store': 'Loja',
    'nav.materials': 'Materiais',
    'nav.track': 'Seguir Encomenda',
    'nav.admin': 'Painel Admin',
    'nav.new_quote': 'Novo Orçamento →',
    'nav.live_status': 'Estado em Direto',

    // Hero
    'hero.badge': '256³ mm Bambu Lab · Estúdio de Precisão em Portugal',
    'hero.title_part1': 'Tu imaginas.',
    'hero.title_part2': 'Nós imprimimos.',
    'hero.desc': 'Estúdio profissional de impressão 3D e prototipagem rápida em Portugal. Envie o seu ficheiro STL ou 3MF, obtenha uma estimativa instantânea ou encomende peças sob medida.',
    'hero.cta_quote': 'Orçamento e Slicer 3D →',
    'hero.cta_store': 'Ver Catálogo da Loja',
    'hero.stat_vol': 'Base de Impressão 256³ mm',
    'hero.stat_speed': 'Produção Rápida em 24–48h',
    'hero.stat_shipping': 'Envio Grátis > €50 em Portugal',

    // 3D Viewer & Telemetry
    'cad.title': 'Pré-visualização 3D',
    'cad.slicer': 'Pré-visualização de Camadas',
    'cad.size': 'Dimensões (mm)',
    'cad.volume': 'Volume',
    'cad.filament': 'Filamento Est.',
    'cad.time': 'Tempo Est.',
    'cad.fits': '✓ Cabe na base',
    'cad.exceeds': '⚠ Excede 256mm',

    // Quote Page
    'quote.title': 'Pedir Orçamento',
    'quote.subtitle': 'Estimativa instantânea de impressão 3D. Carregue o seu ficheiro ou peça um projeto CAD à medida.',
    'quote.tab_model': 'Tenho um ficheiro 3D',
    'quote.tab_design': 'Preciso que desenhem o modelo',
    'quote.drop_title': 'Arraste os ficheiros 3D para aqui',
    'quote.drop_sub': 'ou clique para procurar no computador',
    'quote.drop_formats': 'STL · 3MF · STEP · OBJ · Desenhos PDF (máx. 50 MB)',
    'quote.settings_title': 'Parâmetros de Impressão',
    'quote.mat_label': 'Material',
    'quote.quality_label': 'Qualidade da Camada',
    'quote.infill_label': 'Densidade de Preenchimento (Infill)',
    'quote.qty_label': 'Quantidade',
    'quote.color_label': 'Cor Pretendida',
    'quote.contact_title': 'Os Seus Dados',
    'quote.name_label': 'Nome Completo',
    'quote.email_label': 'Email',
    'quote.phone_label': 'Telemóvel',
    'quote.company_label': 'Empresa (opcional)',
    'quote.country_label': 'País de Envio',
    'quote.confidential': 'Projeto Confidencial / NDA (não fotografar a peça)',
    'quote.notes_label': 'Notas Adicionais',
    'quote.submit_btn': 'Enviar Pedido de Orçamento →',
    'quote.cost_title': 'Custo Estimado',
    'quote.cost_mat': 'Custo do material',
    'quote.cost_time': 'Tempo de máquina',
    'quote.cost_prep': 'Preparação e calibração',
    'quote.cost_shipping': 'Envio (CTT Expresso)',
    'quote.cost_total': 'Estimativa Total',

    // Store Page
    'store.title': 'Loja Layer Studios',
    'store.subtitle': 'Designs minimalistas, funcionais e impressos em 3D para secretária e lifestyle.',
    'store.filter_all': 'Todos os Produtos',
    'store.filter_desk': 'Secretária e Tecnologia',
    'store.filter_auto': 'Automóvel e Peças',
    'store.filter_home': 'Casa e Oficina',
    'store.add_to_cart': 'Adicionar ao Carrinho',
    'store.customize_btn': 'Personalizar e Ver em 3D',
    'store.cart_title': 'O Seu Carrinho',
    'store.checkout_btn': 'Avançar para Pagamento →',

    // Materials Page
    'mat.title': 'Centro de Materiais de Engenharia',
    'mat.subtitle': 'Compare filamentos, resistência térmica e mecânica, ou use o Questionário do Consultor.',
    'mat.quiz_title': 'Descubra o Material Ideal',
    'mat.table_title': 'Matriz Comparativa Técnica',

    // Track Page
    'track.title': 'Seguir Produção em Direto',
    'track.subtitle': 'Introduza a Referência do Orçamento (ex: LS-XXXX) ou o ID da Encomenda para ver o estado em tempo real.',
    'track.input_placeholder': 'ex: LS-1053 ou ORD-1049...',
    'track.btn': 'Seguir Encomenda →',

    // Modal Language
    'lang_modal.title': 'Bem-vindo à Layer Studios',
    'lang_modal.subtitle': 'Escolha o seu idioma de preferência / Please select your preferred language:',
    'lang_modal.btn_pt': 'Português (Portugal)',
    'lang_modal.btn_en': 'English (International)',
    'lang_modal.save': 'Continuar / Continue'
  }
};

class LayerStudiosI18n {
  constructor() {
    this.currentLang = localStorage.getItem('ls_lang') || 'pt'; // Default to PT
    this.init();
  }

  init() {
    this.renderLanguageSwitcherInNav();
    this.checkFirstVisitModal();
    this.applyLanguage(this.currentLang);
  }

  setLanguage(lang) {
    if (lang !== 'pt' && lang !== 'en') lang = 'pt';
    this.currentLang = lang;
    localStorage.setItem('ls_lang', lang);
    localStorage.setItem('ls_lang_chosen', 'true');
    this.applyLanguage(lang);
    this.updateSwitcherUI();
  }

  applyLanguage(lang) {
    document.documentElement.lang = lang;
    const dict = LS_TRANSLATIONS[lang] || LS_TRANSLATIONS.pt;

    // 1. Elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder) el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. Automatic text mapping for common buttons & nav items
    this.translateKeyElements(lang, dict);
  }

  translateKeyElements(lang, dict) {
    // Nav links
    const navLinks = document.querySelectorAll('nav a, header a, footer a');
    navLinks.forEach(link => {
      const txt = link.textContent.trim().toLowerCase();
      if (txt === 'home' || txt === 'início') link.textContent = dict['nav.home'];
      else if (txt === 'get a quote' || txt === 'pedir orçamento') link.textContent = dict['nav.quote'];
      else if (txt === 'store' || txt === 'loja') link.textContent = dict['nav.store'];
      else if (txt === 'materials' || txt === 'materiais') link.textContent = dict['nav.materials'];
      else if (txt === 'track order' || txt === 'seguir encomenda') link.textContent = dict['nav.track'];
    });
  }

  renderLanguageSwitcherInNav() {
    const navContainers = document.querySelectorAll('header .flex.items-center.space-x-3, header .flex.items-center.gap-4');
    navContainers.forEach(container => {
      if (container.querySelector('.lang-switcher-btn')) return;

      const switcher = document.createElement('button');
      switcher.type = 'button';
      switcher.className = 'lang-switcher-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all';
      switcher.innerHTML = this.getSwitcherHTML();
      switcher.onclick = () => {
        const nextLang = this.currentLang === 'pt' ? 'en' : 'pt';
        this.setLanguage(nextLang);
      };

      container.insertBefore(switcher, container.firstChild);
    });
  }

  getSwitcherHTML() {
    return this.currentLang === 'pt' 
      ? '<span>🇵🇹 PT</span><span class="text-slate-600">|</span><span class="text-slate-500 font-normal">EN</span>'
      : '<span>🇬🇧 EN</span><span class="text-slate-600">|</span><span class="text-slate-500 font-normal">PT</span>';
  }

  updateSwitcherUI() {
    document.querySelectorAll('.lang-switcher-btn').forEach(btn => {
      btn.innerHTML = this.getSwitcherHTML();
    });
  }

  checkFirstVisitModal() {
    const hasChosen = localStorage.getItem('ls_lang_chosen');
    if (hasChosen) return;

    // Show Language Selection Modal on first entry
    const modal = document.createElement('div');
    modal.id = 'lang-selection-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-2xl">
          🌍
        </div>
        
        <div>
          <h3 class="text-xl font-black text-white">Welcome to Layer Studios</h3>
          <p class="text-xs text-slate-400 mt-1">Escolha o seu idioma / Select your language</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button type="button" id="btn-lang-choose-pt" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${this.currentLang === 'pt' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}">
            <span class="text-3xl">🇵🇹</span>
            <span class="text-sm font-bold text-white">Português</span>
            <span class="text-[10px] text-slate-400 font-mono">Portugal & UE</span>
          </button>

          <button type="button" id="btn-lang-choose-en" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${this.currentLang === 'en' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}">
            <span class="text-3xl">🇬🇧</span>
            <span class="text-sm font-bold text-white">English</span>
            <span class="text-[10px] text-slate-400 font-mono">International</span>
          </button>
        </div>

        <button type="button" id="btn-lang-continue" class="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all">
          Continuar / Continue →
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    let selected = this.currentLang;

    modal.querySelector('#btn-lang-choose-pt').onclick = () => {
      selected = 'pt';
      modal.querySelector('#btn-lang-choose-pt').className = 'p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/10 transition-all flex flex-col items-center gap-2';
      modal.querySelector('#btn-lang-choose-en').className = 'p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col items-center gap-2';
    };

    modal.querySelector('#btn-lang-choose-en').onclick = () => {
      selected = 'en';
      modal.querySelector('#btn-lang-choose-en').className = 'p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/10 transition-all flex flex-col items-center gap-2';
      modal.querySelector('#btn-lang-choose-pt').className = 'p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col items-center gap-2';
    };

    modal.querySelector('#btn-lang-continue').onclick = () => {
      this.setLanguage(selected);
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.25s ease';
      setTimeout(() => modal.remove(), 250);
    };
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.LayerStudiosI18n = new LayerStudiosI18n();
  });
}
