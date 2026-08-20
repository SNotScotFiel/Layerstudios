/**
 * Layer Studios - Complete Internationalization (i18n) Engine (PT-PT / EN)
 * Complete natural Portuguese (PT-PT) and English translation covering every single section,
 * hero copy, 3D viewer HUD, service cards, workflow steps, portfolio items, B2B, FAQ,
 * contact form, store products, materials matrix, and live tracking.
 */

const LS_PHRASES = [
  // Nav
  ['Home', 'Início'],
  ['Get a Quote', 'Pedir Orçamento'],
  ['Store', 'Loja'],
  ['Materials', 'Materiais'],
  ['Track Order', 'Seguir Encomenda'],
  ['Live Status', 'Estado em Direto'],
  ['New Quote →', 'Novo Orçamento →'],
  ['New Quote', 'Novo Orçamento'],
  ['Exit to Site', 'Voltar ao Site'],

  // Hero Section
  ['Studio open in Portugal • EU delivery in 24–48h', 'Estúdio aberto em Portugal • Envio UE em 24–48h'],
  ['Studio open in Portugal · EU delivery in 24–48h', 'Estúdio aberto em Portugal · Envio UE em 24–48h'],
  ['You imagine it.', 'Tu imaginas.'],
  ['We print it.', 'Nós imprimimos.'],
  ['256³ mm Bambu Lab · Precision Studio in Portugal', '256³ mm Bambu Lab · Estúdio de Precisão em Portugal'],
  ['Precision 3D printing, rapid prototyping, and custom replacement parts made easy. Drop your CAD file or send us a sketch — we\'ll handle the slicing, materials, and delivery.', 'Impressão 3D de precisão, prototipagem rápida e peças à medida sem complicações. Envie o seu ficheiro CAD ou esboço — tratamos do fatiamento, materiais e entrega.'],
  ['Professional 3D printing & rapid prototyping studio in Portugal. Upload your STL or 3MF file, get an instant estimate, or order custom-engineered functional designs.', 'Estúdio profissional de impressão 3D e prototipagem rápida em Portugal. Carregue o seu ficheiro STL ou 3MF, obtenha uma estimativa imediata ou encomende peças à medida.'],
  ['Upload 3D File • Instant Quote', 'Carregar Ficheiro 3D • Orçamento Imediato'],
  ['Upload 3D File · Instant Quote', 'Carregar Ficheiro 3D · Orçamento Imediato'],
  ['Upload 3D File • Instant Quote →', 'Carregar Ficheiro 3D • Orçamento Imediato →'],
  ['Instant Quote & Slicer →', 'Orçamento e Slicer 3D →'],
  ['Instant Quote & Slicer', 'Orçamento e Slicer 3D'],
  ['Browse Store Catalog', 'Explorar Catálogo da Loja'],
  ['Browse Catalog', 'Ver Catálogo da Loja'],
  ['Explore Catalog', 'Ver Catálogo'],
  ['Tolerance Accuracy', 'Tolerância de Precisão'],
  ['Build Volume', 'Volume de Impressão'],
  ['Standard Turnaround', 'Prazo Padrão de Envio'],
  ['256³ mm Build Plate', 'Base 256³ mm Bambu Lab'],
  ['24–48h Fast Turnaround', 'Produção Rápida em 24–48h'],
  ['Free Shipping > €50 in PT', 'Envio Grátis > €50 em Portugal'],
  ['0.08–0.28mm Layer Precision', 'Precisão de 0.08–0.28mm'],
  ['Multi-Material & Carbon Fiber', 'Multi-Material e Fibra de Carbono'],
  ['Instant 3D CAD Geometry Analysis', 'Análise Geométrica 3D Instantânea'],

  // 3 Core Pillars
  ['24–48h Rapid Turnaround', 'Produção Rápida em 24–48h'],
  ['Local production in Portugal with express domestic shipping and fast EU courier delivery.', 'Produção local em Portugal com envio expresso nacional e entregas rápidas em toda a UE.'],
  ['Industrial Tolerances', 'Tolerâncias Industriais'],
  ['Calibrated direct-drive motion systems achieving ±0.15mm accuracy and perfect layer bonding.', 'Sistemas calibrados de acionamento direto atingindo precisão de ±0.15mm e adesão perfeita entre camadas.'],
  ['Friendly for Beginners', 'Acessível a Iniciantes'],
  ['No 3D experience needed. We inspect every model, fix manifold errors, and recommend the best settings.', 'Sem necessidade de experiência em 3D. Inspecionamos cada modelo, corrigimos erros geométricos e recomendamos as melhores definições.'],

  // Capabilities & Services Section
  ['Capabilities', 'Capacidades'],
  ['Full-Spectrum Manufacturing & CAD Design', 'Fabrico Abrangente & Modelação CAD'],
  ['Full-Spectrum Manufacturing &amp; CAD Design', 'Fabrico Abrangente & Modelação CAD'],
  ['Whether you have a ready CAD model or just a broken plastic part you need replicated, Layer Studios provides end-to-end service.', 'Quer tenha um modelo CAD pronto ou apenas uma peça partida para replicar, a Layer Studios oferece um serviço completo de ponta a ponta.'],
  
  ['Rapid Prototyping', 'Prototipagem Rápida'],
  ['Turn digital CAD concepts into testable physical models in hours. Test ergonomic fit, mechanics, and form factor before investing in expensive tooling.', 'Transforme conceitos digitais em modelos físicos testáveis em poucas horas. Valide ergonomia, mecânica e encaixes antes de investir em moldes caros.'],
  ['Request prototype quote', 'Pedir orçamento de protótipo'],
  ['Request prototype quote →', 'Pedir orçamento de protótipo →'],

  ['Small-Batch Production', 'Produção em Pequena Série'],
  ['Produce from 5 to 500+ end-use parts without injection mould upfront costs. Ideal for market testing, custom electronic enclosures, and bespoke hardware.', 'Produza de 5 a 500+ peças funcionais sem custos iniciais de moldes de injeção. Ideal para testes de mercado, caixas de eletrónica e hardware sob medida.'],
  ['Calculate batch pricing', 'Calcular preço de série'],
  ['Calculate batch pricing →', 'Calcular preço de série →'],

  ['Replacement & Obsolete Parts', 'Peças de Substituição & Descontinuadas'],
  ['Replacement &amp; Obsolete Parts', 'Peças de Substituição & Descontinuadas'],
  ['Replacement Parts', 'Peças de Substituição'],
  ['Discontinued appliance gears, broken car trim clips, drone arms, or vacuum mounts. Send us caliper measurements or fragments for 1:1 replacement.', 'Engrenagens de eletrodomésticos, molas de friso automóvel partidas, braços de drone ou suportes. Envie medidas ou fragmentos para substituição 1:1.'],
  ['Send broken part photo', 'Enviar foto da peça partida'],
  ['Send broken part photo →', 'Enviar foto da peça partida →'],

  ['CAD & Reverse Engineering', 'Modelação CAD & Engenharia Inversa'],
  ['CAD &amp; Reverse Engineering', 'Modelação CAD & Engenharia Inversa'],
  ['No 3D file? We create precision STEP and STL solid CAD files from dimensioned sketches, technical drawings, or physical samples.', 'Sem ficheiro 3D? Criamos ficheiros CAD sólidos de precisão (STEP e STL) a partir de esboços cotados, desenhos técnicos ou amostras físicas.'],

  ['Post-Processing & Finishing', 'Pós-Processamento & Acabamentos'],
  ['Post-Processing &amp; Finishing', 'Pós-Processamento & Acabamentos'],
  ['Chemical vapour smoothing, multi-grit sanding, UV-stable priming, brass heat-set threaded inserts, and assembly bonding.', 'Alisamento por vapor químico, lixagem progressiva, primário anti-UV, inserções roscadas em latão e colagem estrutural.'],
  ['Explore finishing options', 'Ver opções de acabamento'],
  ['Explore finishing options →', 'Ver opções de acabamento →'],

  ['Material Selection Advisory', 'Consultoria e Escolha de Materiais'],
  ['Get expert engineering advice on selecting between PLA+, PETG, ABS, TPU 95A, and Carbon-Fiber Nylon based on heat, load, and chemical resistance.', 'Aconselhamento técnico especializado na escolha entre PLA+, PETG, ABS, TPU 95A e Nylon com Fibra de Carbono consoante calor, esforço e agentes químicos.'],
  ['Try Materials Advisor Quiz', 'Fazer o Teste do Consultor de Materiais'],
  ['Try Materials Advisor Quiz →', 'Fazer o Teste do Consultor de Materiais →'],

  // How It Works / Workflow
  ['Workflow', 'Fluxo de Trabalho'],
  ['Simple 4-Step Production Process', 'Processo Simples de Fabrico em 4 Passos'],
  ['We designed our studio workflow so you can go from digital idea to finished product seamlessly.', 'Estruturámos o nosso fluxo de trabalho para transformar a sua ideia digital numa peça física sem complicações.'],
  ['Upload or Request', '1. Carregar ou Pedir Orçamento'],
  ['Drop your STL/3MF/STEP file or upload sketches/photos. Choose your material, colour, and quantity.', 'Envie o seu ficheiro STL/3MF/STEP ou fotos com medidas. Escolha o material, cor e quantidade.'],
  ['Slicing Review', '2. Análise de Fatiamento'],
  ['Our engineers inspect your geometry, optimize layer orientation for strength, and confirm print time.', 'Os nossos técnicos analisam a geometria, otimizam a orientação para máxima resistência e calculam o tempo exato.'],
  ['Precision Printing', '3. Impressão de Alta Precisão'],
  ['Manufactured on 256³ mm high-speed direct-drive machines with multi-point automated bed leveling.', 'Fabrico em máquinas CoreXY de 256³ mm com nivelamento automático multiponto de alta precisão.'],
  ['Quality & Delivery', '4. Controlo de Qualidade & Envio'],
  ['Quality &amp; Delivery', '4. Controlo de Qualidade & Envio'],
  ['Caliper inspection, support removal, post-processing, and tracked express shipping straight to your door.', 'Inspeção com paquímetro digital, remoção de suportes, acabamento e envio expresso registado até à sua porta.'],
  ['Start Your Custom Order →', 'Iniciar o Seu Pedido à Medida →'],

  // Portfolio / Case Studies
  ['Case Studies', 'Casos de Estudo'],
  ['Recent Studio Projects', 'Projetos Recentes do Estúdio'],
  ['Real parts manufactured for engineering teams, local businesses, and individuals.', 'Peças reais produzidas para equipas de engenharia, empresas e clientes individuais.'],
  ['All', 'Todos'],
  ['Prototyping', 'Prototipagem'],
  ['Replacement', 'Substituição'],
  ['Mechanical', 'Mecânica'],
  ['Rapid Prototype', 'Protótipo Rápido'],
  ['IoT Sensor Enclosure', 'Caixa Estanque para Sensor IoT'],
  ['Weather-sealed IP65 enclosure with heat-set brass threaded inserts and custom silicone gasket channel in PETG.', 'Caixa estanque IP65 com inserções roscadas em latão e canal para vedante de silicone em PETG.'],
  ['Material: PETG Black', 'Material: PETG Preto'],
  ['Lead: 24h', 'Prazo: 24h'],
  ['Vintage Kitchen Mixer Gear', 'Engrenagem para Batedeira Vintage'],
  ['Recreated a discontinued nylon helical planetary gear from broken fragments with precise involute tooth profile.', 'Recriação de engrenagem helicoidal descontinuada a partir de fragmentos partidos com perfil exato de dentes.'],
  ['Material: CF-Nylon', 'Material: CF-Nylon (Carbono)'],
  ['Tolerance: ±0.08mm', 'Tolerância: ±0.08mm'],
  ['Functional Mount', 'Suporte Funcional'],
  ['Telemetry Camera Rig', 'Suporte para Câmara de Telemetria'],
  ['Lightweight vibration-dampened action camera mount with TPU isolation bushings for motorsport data logging.', 'Suporte leve com amortecimento de vibrações e casquilhos em TPU para recolha de telemetria automóvel.'],
  ['Material: CF-Nylon + TPU', 'Material: CF-Nylon + TPU'],
  ['Weight: 42g', 'Peso: 42g'],

  // B2B Section
  ['B2B Prototyping', 'Prototipagem B2B'],
  ['Engineering Prototyping for Companies', 'Prototipagem e Fabrico para Empresas'],
  ['We partner with hardware startups, engineering teams, architecture studios, and robotics developers across Portugal and Europe. Enjoy dedicated print capacity, strict mutual NDAs, volume pricing, and Net-30 invoicing.', 'Trabalhamos com startups de hardware, equipas de engenharia, gabinetes de arquitetura e criadores em Portugal e na Europa. Capacidade dedicada, NDAs rigorosos, preços de volume e faturação certificada.'],
  ['Standard Mutual NDA', 'Acordo de Confidencialidade (NDA)'],
  ['Volume Tier Discounts', 'Descontos Progressivos por Quantidade'],
  ['Certified Tax Invoices', 'Faturas com NIF Certificadas'],
  ['Request B2B Consultation →', 'Pedir Consulta B2B →'],
  ['Email: business@layerstudios.pt', 'Email: business@layerstudios.pt'],

  // FAQ Section
  ['Frequently Asked Questions', 'Perguntas Frequentes'],
  ['Everything you need to know about ordering, files, materials, and delivery.', 'Tudo o que precisa de saber sobre pedidos, ficheiros, materiais e entregas.'],
  ['What 3D file formats do you accept?', 'Que formatos de ficheiro 3D aceitam?'],
  ['We accept all standard 3D formats including STL, 3MF, STEP (.step/.stp), and OBJ. For CAD design or reverse-engineering, you can also upload dimensioned PDF drawings, sketches, or photos.', 'Aceitamos todos os formatos 3D padrão incluindo STL, 3MF, STEP (.step/.stp) e OBJ. Para modelação CAD de raiz ou engenharia inversa, também pode enviar desenhos técnicos em PDF com cotas, esboços ou fotos.'],
  ['What is your maximum build volume?', 'Qual é o volume máximo de impressão?'],
  ['Our standard single-piece build volume is 256 × 256 × 256 mm. Larger models can be split with alignment pin joints and assembled seamlessly with structural bonding.', 'A nossa área útil de fabrico numa só peça é de 256 × 256 × 256 mm. Peças maiores podem ser fatiadas com uniões macho-fêmea de alinhamento e montadas de forma invisível com colagem estrutural.'],
  ['How fast is delivery within Portugal and the EU?', 'Qual é a rapidez de entrega em Portugal e na UE?'],
  ['Most orders print in 24–48 hours. Shipping in Portugal takes 24 hours via CTT Express (€4.50, free over €50). European Union deliveries take 2–4 business days via DHL/UPS.', 'A maioria das encomendas é impressa em 24–48 horas. O envio em Portugal continental demora 24h via CTT Expresso (€4.50, grátis acima de €50). Para a União Europeia demora 2–4 dias úteis.'],
  ['I have never ordered a 3D print before. What should I do?', 'Nunca encomendei uma impressão 3D. Como devo fazer?'],
  ['It\'s completely painless! Head to our Get a Quote page and drag your file into the box. If you don\'t have a 3D file, switch to "I need it designed" and write a description. We will guide you step by step.', 'É muito simples! Aceda à página Pedir Orçamento e arraste o seu ficheiro para a caixa. Se não tiver ficheiro 3D, mude para "Preciso de Desenho CAD" e descreva o que pretende. Acompanhamos todo o processo passo a passo.'],

  // About & Contact Form
  ['About Layer Studios', 'Sobre a Layer Studios'],
  ['Precision Studio Based in Portugal', 'Estúdio de Precisão Sediado em Portugal'],
  ['Layer Studios was founded with a clear mission: making custom manufacturing and functional prototyping accessible to everyone without friction.', 'A Layer Studios nasceu com uma missão clara: tornar o fabrico sob medida e a prototipagem funcional acessíveis a criadores e empresas com a máxima qualidade.'],
  ['Studio Location:', 'Localização do Estúdio:'],
  ['Lisbon, Portugal', 'Lisboa, Portugal'],
  ['Working Hours:', 'Horário de Funcionamento:'],
  ['Mon–Fri 09:00–18:30 WET', 'Seg–Sex 09:00–18:30 WET'],
  ['Send Us a Direct Message', 'Envie-nos uma Mensagem Direta'],
  ['Have a custom inquiry or engineering question? Our team responds within 2 hours.', 'Tem alguma dúvida técnica ou projeto especial? A nossa equipa responde no próprio dia.'],
  ['Your Name', 'O Seu Nome'],
  ['Subject', 'Assunto'],
  ['Message', 'Mensagem'],
  ['Project consultation / CAD inquiry', 'Consultoria de projeto / Pedido de modelação CAD'],
  ['Tell us about what you\'d like to manufacture...', 'Descreva o projeto ou peça que pretende produzir...'],
  ['Send Message →', 'Enviar Mensagem →'],

  // Footer Links
  ['Dedicated Pages', 'Páginas do Site'],
  ['Instant 3D Quoting Studio', 'Estúdio de Orçamentos 3D'],
  ['Ready-Made Product Store', 'Loja de Produtos Impressos'],
  ['Engineering Materials Guide', 'Guia de Materiais de Engenharia'],
  ['Live Order Tracker', 'Seguir Encomenda em Direto'],
  ['Services', 'Serviços'],
  ['Studio', 'Estúdio'],
  ['About Our Studio', 'Sobre o Nosso Estúdio'],
  ['Recent Projects', 'Projetos Recentes'],
  ['B2B & Enterprise', 'B2B & Empresas'],
  ['Contact & Workshop', 'Contactos & Oficina'],
  ['© 2026 Layer Studios. All rights reserved. Portugal • EU.', '© 2026 Layer Studios. Todos os direitos reservados. Portugal • UE.'],

  // Payment Modal & Tracker
  ['Layer Studios Secure Checkout', 'Checkout Seguro Layer Studios'],
  ['256-Bit SSL Encrypted Gateway', 'Gateway Encriptada SSL de 256-Bits'],
  ['Total to Pay', 'Total a Pagar'],
  ['Order Reference', 'Referência da Encomenda'],
  ['One-Click Checkout', 'Pagamento Rápido em 1 Clique'],
  ['Pay with Apple Pay / Google Pay / Card', 'Pagar com Apple Pay / Google Pay / Cartão'],
  ['Pay securely using Apple Pay, Google Pay, or any Credit/Debit Card. Processed directly through Stripe with end-to-end encryption.', 'Pague com total segurança através de Apple Pay, Google Pay ou Cartão de Débito/Crédito. Processado diretamente via Stripe com encriptação de ponta a ponta.'],
  ['Instant & Direct', 'Instantâneo & Direto'],
  ['Push Notification', 'Notificação Push'],
  ['Entity & Ref', 'Entidade & Ref.'],
  ['Production Launch', 'Lançamento de Produção'],
  ['Pay & Start Production →', 'Pagar & Iniciar Produção →'],
  ['Complete payment of', 'Conclua o pagamento de'],
  ['to start printing', 'para iniciar a impressão'],

  // Account & Notifications
  ['Account', 'Conta'],
  ['My Account', 'Minha Conta'],
  ['Notification Center', 'Centro de Notificações'],
  ['Live Production Alerts', 'Live Production Alerts'],
  ['Log In', 'Iniciar Sessão'],
  ['Sign Up', 'Criar Conta'],
  ['Guest Access', 'Acesso de Convidado'],
  ['Customer Portal', 'Área de Cliente'],
  ['My Orders & 3D Quotes', 'As Minhas Encomendas & Orçamentos 3D'],
  ['Clear', 'Limpar'],
  ['Log Out', 'Sair'],
  ['Track Order', 'Seguir Encomenda'],
  ['Live Status', 'Estado em Direto']
];

class LayerStudiosI18n {
  constructor() {
    this.currentLang = localStorage.getItem('ls_lang') || 'pt';
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
    const isPT = (lang === 'pt');

    // Build phrase lookup map
    const phraseMap = new Map();
    LS_PHRASES.forEach(([en, pt]) => {
      const cleanEn = en.trim().replace(/\s+/g, ' ');
      const cleanPt = pt.trim().replace(/\s+/g, ' ');
      if (isPT) {
        phraseMap.set(cleanEn.toLowerCase(), cleanPt);
      } else {
        phraseMap.set(cleanPt.toLowerCase(), cleanEn);
      }
    });

    // Deep text node translation across the document
    const walkTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.trim().replace(/\s+/g, ' ');
        if (text.length > 0) {
          const lower = text.toLowerCase();
          if (phraseMap.has(lower)) {
            node.nodeValue = phraseMap.get(lower);
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style tags and the switcher button itself
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.classList.contains('lang-switcher-btn')) return;

        // Translate option text in selects
        if (node.tagName === 'OPTION') {
          const optText = node.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
          if (phraseMap.has(optText)) {
            node.textContent = phraseMap.get(optText);
          }
        }

        // Translate placeholders
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          if (node.placeholder) {
            const plower = node.placeholder.trim().replace(/\s+/g, ' ').toLowerCase();
            if (phraseMap.has(plower)) {
              node.placeholder = phraseMap.get(plower);
            }
          }
        }

        node.childNodes.forEach(child => walkTextNodes(child));
      }
    };

    walkTextNodes(document.body);
  }

  renderLanguageSwitcherInNav() {
    // Remove any existing duplicate switcher buttons first
    document.querySelectorAll('.lang-switcher-btn').forEach(b => b.remove());

    const header = document.querySelector('header');
    if (!header) return;

    // Target ONLY the right-side actions container in header
    const containers = header.querySelectorAll('.flex.items-center.space-x-3, .flex.items-center.gap-4, .flex.items-center.gap-3');
    if (containers.length === 0) return;
    const rightContainer = containers[containers.length - 1]; // Select strictly the last (rightmost) container

    const switcher = document.createElement('button');
    switcher.type = 'button';
    switcher.className = 'lang-switcher-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer';
    switcher.innerHTML = this.getSwitcherHTML();
    switcher.onclick = () => {
      const nextLang = this.currentLang === 'pt' ? 'en' : 'pt';
      this.setLanguage(nextLang);
      location.reload();
    };

    rightContainer.insertBefore(switcher, rightContainer.firstChild);
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
          <h3 class="text-xl font-black text-white">Bem-vindo à Layer Studios</h3>
          <p class="text-xs text-slate-400 mt-1">Escolha o seu idioma / Select your preferred language</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button type="button" id="btn-lang-choose-pt" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-blue-500 bg-blue-500/10">
            <span class="text-3xl">🇵🇹</span>
            <span class="text-sm font-bold text-white">Português</span>
            <span class="text-[10px] text-slate-400 font-mono">Portugal & UE</span>
          </button>

          <button type="button" id="btn-lang-choose-en" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-slate-800 bg-slate-950/60 hover:border-slate-700">
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

    let selected = 'pt';

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
