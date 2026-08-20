/**
 * Layer Studios - Complete Internationalization (i18n) Engine (PT-PT / EN)
 * Translates navigation, hero, 3D viewer HUD, quote calculator, material badges,
 * dropdown options, placeholders, store catalog, materials quiz, and order tracking.
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
  ['You imagine it.', 'Tu imaginas.'],
  ['We print it.', 'Nós imprimimos.'],
  ['256³ mm Bambu Lab · Precision Studio in Portugal', '256³ mm Bambu Lab · Estúdio de Precisão em Portugal'],
  ['Professional 3D printing & rapid prototyping studio in Portugal. Upload your STL or 3MF file, get an instant estimate, or order custom-engineered functional designs.', 'Estúdio profissional de impressão 3D e prototipagem rápida em Portugal. Carregue o seu ficheiro STL ou 3MF, obtenha uma estimativa imediata ou encomende peças à medida.'],
  ['Instant Quote & Slicer →', 'Orçamento e Slicer 3D →'],
  ['Instant Quote & Slicer', 'Orçamento e Slicer 3D'],
  ['Browse Catalog', 'Ver Catálogo da Loja'],
  ['Explore Catalog', 'Ver Catálogo'],
  ['256³ mm Build Plate', 'Base 256³ mm Bambu Lab'],
  ['24–48h Fast Turnaround', 'Produção Rápida em 24–48h'],
  ['Free Shipping > €50 in PT', 'Envio Grátis > €50 em Portugal'],
  ['0.08–0.28mm Layer Precision', 'Precisão de 0.08–0.28mm'],
  ['Multi-Material & Carbon Fiber', 'Multi-Material e Fibra de Carbono'],
  ['Instant 3D CAD Geometry Analysis', 'Análise Geométrica 3D Instantânea'],

  // 3D Slicer & Preview
  ['3D Model Preview', 'Pré-visualização 3D'],
  ['Layer Preview', 'Pré-visualização de Camadas'],
  ['Model Analysis', 'Análise do Modelo 3D'],
  ['GEOMETRY TELEMETRY', 'TELEMETRIA GEOMÉTRICA'],
  ['Size (mm)', 'Dimensões (mm)'],
  ['Size', 'Dimensões'],
  ['Dimensions', 'Dimensões'],
  ['Volume', 'Volume'],
  ['Est. Time', 'Tempo Est.'],
  ['Est. Filament', 'Filamento Est.'],
  ['Filament', 'Filamento'],
  ['Fits on plate', '✓ Cabe na mesa'],
  ['Exceeds 256mm', '⚠ Excede 256mm'],
  ['Rotate 360°', 'Rodar 360°'],
  ['Reset View', 'Centrar Vista'],
  ['Wireframe', 'Estrutura Arestas'],
  ['Solid View', 'Vista Sólida'],
  ['Slice Height', 'Altura da Camada'],
  ['Top View', 'Vista Superior'],
  ['Front View', 'Vista Frontal'],
  ['Side View', 'Vista Lateral'],

  // Pillars & Features
  ['Why Layer Studios', 'Porquê a Layer Studios'],
  ['Industrial quality for creators, engineers, and automotive enthusiasts.', 'Qualidade industrial para criadores, engenheiros e apaixonados por automóveis.'],
  ['High-Speed Bambu Precision', 'Precisão Bambu Lab de Alta Velocidade'],
  ['CoreXY kinematics delivering sub-millimeter tolerances and buttery-smooth layer lines.', 'Cinemática CoreXY com tolerâncias submilimétricas e acabamento impecável.'],
  ['Engineering Grade Filaments', 'Filamentos de Grau de Engenharia'],
  ['Carbon-Fiber Nylon, heat-resistant PETG/ABS, and ultra-durable TPU 95A.', 'Nylon com Fibra de Carbono, PETG/ABS resistente ao calor e TPU 95A flexível.'],
  ['Instant Physics-Based Quoting', 'Orçamento Baseado em Física Real'],
  ['Transparent pricing derived from your exact 3D volume, mass, and machine time.', 'Preços transparentes calculados a partir do volume, massa e tempo de máquina reais.'],
  ['Fast 24-48h Dispatch', 'Expedição em 24–48 Horas'],
  ['Dispatched directly from Portugal with tracked express shipping across the EU.', 'Enviado diretamente de Portugal com correio expresso registado para toda a UE.'],

  // Quote Page - Badges & Materials
  ['Instant 3D Print Quote & Slicer', 'Calculadora e Orçamento de Impressão 3D'],
  ['Upload your 3D file for instant volume analysis and pricing, or request a custom CAD design from our engineers.', 'Carregue o seu ficheiro 3D para análise imediata de volume e preço, ou solicite um projeto CAD à medida aos nossos técnicos.'],
  ['I have a 3D file', 'Tenho um ficheiro 3D (.STL, .3MF, .STEP)'],
  ['I need it designed', 'Preciso de Desenho CAD / Modelação'],
  ['What would you like us to design?', 'O que gostaria que a nossa equipa desenhasse?'],
  ['Describe the part — dimensions, purpose, material preference, how it mounts or connects...', 'Descreva a peça — dimensões aproximadas, finalidade, tipo de esforço, onde encaixa ou fixa...'],
  ['Drop your 3D files here', 'Arraste os ficheiros 3D para aqui'],
  ['or click to browse', 'ou clique para procurar ficheiros'],
  ['STL · 3MF · STEP · OBJ · PDF drawings (max 50 MB)', 'Ficheiros STL · 3MF · STEP · OBJ · Desenhos PDF (máx. 50 MB)'],
  ['Print Settings', 'Parâmetros de Fabrico'],
  ['Material', 'Material'],
  ['Rigid · Affordable', 'Rígido · Económico'],
  ['Strong · Heat resistant', 'Resistente · Suporta Calor'],
  ['Tough · High temp', 'Robusto · Alta Temperatura'],
  ['Flexible · Impact', 'Flexível · Absorção de Impacto'],
  ['Premium · Ultra strong', 'Premium · Ultra Resistente'],
  ['More →', 'Mais →'],
  ['See all materials', 'Ver todos os materiais'],

  // Dropdown Options
  ['Print Quality', 'Qualidade de Impressão (Altura da Camada)'],
  ['Fine (0.1mm)', 'Fino (0.10mm - Elevado Detalhe)'],
  ['Fine (0.10mm)', 'Fino (0.10mm - Elevado Detalhe)'],
  ['Standard (0.2mm)', 'Padrão (0.20mm - Velocidade & Força)'],
  ['Standard (0.20mm)', 'Padrão (0.20mm - Velocidade & Força)'],
  ['Draft (0.3mm)', 'Rascunho (0.30mm - Rápido)'],
  ['Draft (0.30mm)', 'Rascunho (0.30mm - Rápido)'],
  ['Infill Strength', 'Densidade de Preenchimento (Infill)'],
  ['Light (15%) — Display', 'Leve (15%) — Decorativo'],
  ['Light (15% Infill)', 'Leve (15% Infill - Decorativo)'],
  ['Standard (30%)', 'Padrão (30% - Funcional)'],
  ['Standard (30% Infill)', 'Padrão (30% Infill - Funcional)'],
  ['Strong (60%)', 'Reforçado (60% - Esforço Mecânico)'],
  ['Heavy Duty (60% Infill)', 'Reforçado (60% Infill - Esforço Mecânico)'],
  ['Solid (100%)', 'Sólido (100% - Carga Máxima)'],
  ['Solid (100% Infill)', 'Sólido (100% Infill - Carga Máxima)'],
  ['Quantity', 'Quantidade'],
  ['Preferred Colour', 'Cor Pretendida'],
  ['e.g. Black, White, RAL 5015...', 'ex: Preto, Branco, RAL 5015...'],
  ['Matte Black', 'Preto Mate'],
  ['Signal White', 'Branco Puro'],
  ['Space Grey', 'Cinzento Espacial'],
  ['Royal Blue', 'Azul Royal'],
  ['Signal Orange', 'Laranja Signal'],
  ['Military Green', 'Verde Militar'],

  // Contact Form
  ['Your Details', 'Os Seus Dados de Contacto'],
  ['Name', 'Nome Completo'],
  ['Your full name', 'O seu nome completo'],
  ['Email', 'Endereço de Email'],
  ['Email Address', 'Endereço de Email'],
  ['your@email.com', 'o.seu@email.com'],
  ['Phone Number', 'Número de Telemóvel'],
  ['Company (optional)', 'Empresa (opcional)'],
  ['Shipping Country', 'País de Envio'],
  ['Portugal (€4.50 · Free over €50)', 'Portugal Continental (€4.50 · Grátis > €50)'],
  ['European Union (€9.90)', 'União Europeia (€9.90)'],
  ['International Tracked (€18.00)', 'Internacional com Rastreio (€18.00)'],
  ['NDA / Confidential project (do not photograph)', 'Projeto Confidencial / NDA (não fotografar nem partilhar)'],
  ['NDA / Confidential project:', 'Projeto Confidencial / NDA:'],
  ['Do not photograph or display my part in Layer Studios portfolio.', 'Não fotografar nem publicar a minha peça no portfólio da Layer Studios.'],
  ['Additional notes', 'Notas adicionais'],
  ['e.g. M4 brass inserts required, smooth top surface...', 'ex: Inserções roscadas M4, acabamento liso superior...'],
  ['Send Quote Request →', 'Enviar Pedido de Orçamento →'],
  ['Estimated Cost', 'Resumo de Custos Estimados'],
  ['Material cost', 'Custo do Material'],
  ['Machine runtime', 'Tempo de Máquina'],
  ['Base prep & calibration', 'Preparação da Mesa e Calibração'],
  ['Shipping (CTT Expresso)', 'Envio (CTT Expresso Portugal)'],
  ['Total Estimate', 'Total Estimado'],

  // Quick answers / FAQ
  ['Quick answers', 'Respostas Rápidas'],
  ['What formats do you accept?', 'Que formatos de ficheiro 3D aceitam?'],
  ['STL, 3MF, STEP (.step/.stp), OBJ, and ZIP archives. For design requests, we also accept PDF drawings, photos, and sketches.', 'Aceitamos nativamente ficheiros STL, 3MF, STEP (.step/.stp), OBJ e arquivos ZIP. Para projetos novos de raiz, também aceitamos desenhos em PDF, fotografias com medidas e esboços.'],
  ['How long does it take?', 'Quanto tempo demora a produção?'],
  ['Most orders are printed and shipped within 24–48 hours after payment. Complex or large parts may take 3–5 business days. We\'ll confirm the timeline when we review your quote.', 'A grande maioria das peças é impressa e expedida em 24 a 48 horas após confirmação. Projetos industriais de grande porte podem demorar 3 a 5 dias úteis. O prazo exato é confirmado na proposta.'],
  ['What\'s the maximum part size?', 'Qual é o tamanho máximo da peça?'],
  ['Our build volume is 256 × 256 × 256 mm. Larger parts can be split and glued together — just mention it in the notes.', 'O volume útil da nossa câmara é de 256 × 256 × 256 mm. Peças maiores podem ser fatiadas e unidas mecanicamente com encaixes invisíveis — indique nas notas se desejar.'],
  ['I don\'t have a 3D file — can you still help?', 'Não tenho ficheiro 3D — podem ajudar?'],
  ['Absolutely. Switch to "I need it designed" above, describe what you need, and optionally upload a photo, sketch, or PDF. Our team will create the 3D model and share it for your approval.', 'Sem dúvida! Mude para o separador "Preciso de Desenho CAD" acima, descreva o que pretende e anexe fotos ou medidas. A nossa equipa de engenharia cria o modelo 3D para a sua aprovação.'],
  ['Quote request sent!', 'Pedido de orçamento enviado com sucesso!'],
  ['We\'ll review your request and get back to you within 2 business hours with a final quote and payment link.', 'A nossa equipa técnica analisará o seu ficheiro e responderá no prazo de 2 horas úteis com a proposta final e link para pagamento.'],
  ['Done', 'Concluir'],

  // Store Page
  ['Layer Studios Store', 'Loja Layer Studios'],
  ['Functional, minimalist, custom 3D printed lifestyle & desk designs.', 'Designs funcionais, minimalistas e impressos em 3D para secretária e lifestyle.'],
  ['All Products', 'Todos os Produtos'],
  ['Desk & Tech', 'Secretária & Tecnologia'],
  ['Automotive', 'Automóvel'],
  ['Home & Workshop', 'Casa & Oficina'],
  ['Add to Cart', 'Adicionar ao Carrinho'],
  ['Customize & 3D View', 'Personalizar & Ver em 3D'],
  ['Your Shopping Cart', 'O Seu Carrinho de Compras'],
  ['Your cart is currently empty', 'O seu carrinho está vazio'],
  ['Explore Store Catalog', 'Explorar Catálogo da Loja'],
  ['Subtotal', 'Subtotal'],
  ['Shipping', 'Envio'],
  ['Free (Order > €50)', 'Grátis (Encomenda > €50)'],
  ['Total payable:', 'Total a pagar:'],
  ['Total', 'Total'],
  ['Proceed to Checkout →', 'Avançar para Pagamento →'],
  ['Checkout & Shipping', 'Dados de Envio e Pagamento'],
  ['Shipping Address', 'Morada Completa'],
  ['Postal Code', 'Código Postal'],
  ['City', 'Localidade / Cidade'],
  ['Payment Method', 'Método de Pagamento'],
  ['Confirm Order →', 'Confirmar Encomenda →'],
  ['MB WAY / Multibanco', 'MB WAY / Multibanco'],
  ['Credit / Debit Card', 'Cartão de Crédito / Débito'],

  // Materials Page
  ['Engineering Materials Center', 'Centro de Materiais de Engenharia'],
  ['Compare filaments, thermal tolerance, impact strength, and run our Material Advisor Quiz.', 'Compare filamentos, resistência térmica e mecânica, ou use o Questionário do Consultor.'],
  ['Find Your Ideal Material', 'Descubra o Material Ideal'],
  ['Technical Comparison Matrix', 'Matriz Comparativa Técnica de Filamentos'],
  ['What will this part be used for?', 'Qual é a aplicação principal da peça?'],
  ['Indoor decorative or display', 'Decoração ou protótipo visual interior'],
  ['Functional mechanical part (brackets, gears)', 'Peça mecânica funcional (suportes, engrenagens)'],
  ['Outdoor / High UV & Weather resistance', 'Exterior / Resistência a raios UV e intempéries'],
  ['High Heat / Automotive Engine Bay', 'Calor elevado / Baía de motor automóvel'],
  ['Flexible impact gasket or damper', 'Vedante flexível ou amortecedor de impacto'],
  ['Extreme stiffness / Aerospace / Drone frame', 'Rigidez extrema / Drones / Peças de alta competição'],
  ['Advisor Recommendation:', 'Recomendação do Consultor:'],
  ['Get a Quote with this Material →', 'Pedir Orçamento com este Material →'],

  // Tracker Page
  ['Live Production Tracker', 'Seguir Fabrico em Direto'],
  ['Enter your Quote ID (e.g. LS-XXXX) or Order Reference to view live production status', 'Introduza o ID do Orçamento (ex: LS-XXXX) ou o ID da Encomenda para ver o estado em tempo real'],
  ['Track Order →', 'Seguir Encomenda →'],
  ['Order Reference', 'Referência da Encomenda'],
  ['Current Stage', 'Etapa Atual de Produção'],
  ['Estimated Dispatch', 'Data Prevista de Envio'],
  ['Tracking Number', 'Código de Rastreio CTT'],
  ['Production Timeline', 'Histórico e Linha Temporal de Fabrico'],
  ['Quote Requested', 'Orçamento Solicitado'],
  ['Under Review', 'Em Análise Técnica'],
  ['Quote Sent', 'Orçamento Enviado'],
  ['Awaiting Payment', 'Aguardar Pagamento'],
  ['Preparing', 'Preparação do Ficheiro'],
  ['Printing', 'Em Impressão 3D'],
  ['Quality Inspection', 'Controlo de Qualidade'],
  ['Ready to Ship', 'Pronto para Envio'],
  ['Shipped', 'Enviado via CTT Expresso'],
  ['Completed', 'Entregue / Concluído'],

  // Footer
  ['About Our Studio', 'Sobre o Nosso Estúdio'],
  ['Recent Projects', 'Projetos Recentes'],
  ['B2B & Enterprise', 'B2B & Empresas'],
  ['Contact & Workshop', 'Contactos & Oficina'],
  ['© 2026 Layer Studios. All rights reserved. Portugal • EU.', '© 2026 Layer Studios. Todos os direitos reservados. Portugal • UE.']
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
      if (isPT) {
        phraseMap.set(en.trim().toLowerCase(), pt);
      } else {
        phraseMap.set(pt.trim().toLowerCase(), en);
      }
    });

    // Deep text node translation across the document
    const walkTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.trim();
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
          const optText = node.textContent.trim().toLowerCase();
          if (phraseMap.has(optText)) {
            node.textContent = phraseMap.get(optText);
          }
        }

        // Translate placeholders
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          if (node.placeholder) {
            const plower = node.placeholder.trim().toLowerCase();
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
    const navContainers = document.querySelectorAll('header .flex.items-center.space-x-3, header .flex.items-center.gap-4, header .flex.items-center.gap-3');
    navContainers.forEach(container => {
      if (container.querySelector('.lang-switcher-btn')) return;

      const switcher = document.createElement('button');
      switcher.type = 'button';
      switcher.className = 'lang-switcher-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer';
      switcher.innerHTML = this.getSwitcherHTML();
      switcher.onclick = () => {
        const nextLang = this.currentLang === 'pt' ? 'en' : 'pt';
        this.setLanguage(nextLang);
        location.reload();
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
