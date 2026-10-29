/**
 * Layer Studios - Complete Legal Policies, GDPR & Consumer Protection System (PT-PT / EN)
 * Compliant with Portuguese & European Union E-Commerce & Manufacturing Regulations:
 *  - Decreto-Lei n.º 24/2014 (Contratos Celebrados à Distância e Bens Personalizados - Art.º 17.º)
 *  - Decreto-Lei n.º 84/2021 (Direitos do Consumidor e Garantia de Conformidade)
 *  - Regulamento (UE) 2016/679 (RGPD / GDPR) & Lei n.º 58/2019 (CNPD)
 *  - Lei n.º 41/2004 & Google Consent Mode v2 (Política de Cookies e Privacidade Eletrónica)
 *  - Lei n.º 144/2015 (Resolução Alternativa de Litígios de Consumo - RAL / CNIACC / CACCL)
 *  - Decreto-Lei n.º 74/2017 (Livro de Reclamações Eletrónico)
 */

class LayerStudiosLegal {
  constructor() {
    this.modalEl = null;
    this.currentType = 'terms';
    this.init();
  }

  init() {
    this.createModalDOM();
    this.bindEvents();
    this.checkUrlTrigger();
  }

  isPortuguese() {
    const i18n = window.LayerStudiosI18n || window.LayerStudiosI18nInstance;
    if (i18n && i18n.currentLang) {
      return i18n.currentLang === 'pt';
    }
    try {
      const saved = localStorage.getItem('ls_lang');
      if (saved) return saved === 'pt';
    } catch (e) {}
    return true; // Default to PT-PT
  }

  createModalDOM() {
    if (document.getElementById('ls-legal-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ls-legal-modal';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">LS</div>
            <div>
              <h3 id="ls-legal-title" class="text-base sm:text-lg font-bold text-white leading-tight">Informação Legal</h3>
              <p id="ls-legal-subtitle" class="text-[11px] text-slate-400 font-mono">Layer Studios · Portugal · NIF 262891808</p>
            </div>
          </div>
          <button id="ls-legal-close" type="button" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Fechar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Interactive Policy Switcher Tabs -->
        <div id="ls-legal-tabs" class="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button type="button" data-tab="terms" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Termos & Condições</button>
          <button type="button" data-tab="privacy" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Privacidade (RGPD)</button>
          <button type="button" data-tab="shipping" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Envios & Entregas</button>
          <button type="button" data-tab="returns" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Garantia & Devoluções</button>
          <button type="button" data-tab="cookies" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Política de Cookies</button>
          <button type="button" data-tab="legal" class="ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">Aviso Legal & RAL</button>
        </div>

        <!-- Content Body (Scrollable) -->
        <div id="ls-legal-body" class="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div class="flex items-center gap-3 font-mono text-[11px]">
            <span>Layer Studios · Portugal · UE</span>
            <span>·</span>
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" class="text-blue-400 hover:underline">Livro de Reclamações ↗</a>
          </div>
          <div class="flex items-center gap-2">
            <button id="ls-legal-btn-cookies" type="button" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors text-xs">
              🍪 Gerir Cookies
            </button>
            <button id="ls-legal-btn-ok" type="button" class="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-colors text-xs">
              Fechar / Compreendi
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('#ls-legal-close').addEventListener('click', () => this.close());
    modal.querySelector('#ls-legal-btn-ok').addEventListener('click', () => this.close());
    modal.querySelector('#ls-legal-btn-cookies').addEventListener('click', () => {
      this.close();
      if (window.LayerStudiosAnalytics && typeof window.LayerStudiosAnalytics.openCookieSettingsModal === 'function') {
        window.LayerStudiosAnalytics.openCookieSettingsModal();
      }
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    modal.querySelectorAll('.ls-legal-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.open(tab);
      });
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-legal-modal]');
      if (target) {
        e.preventDefault();
        const type = target.getAttribute('data-legal-modal');
        this.open(type);
      }
    });
  }

  checkUrlTrigger() {
    try {
      const params = new URLSearchParams(window.location.search);
      const legalParam = params.get('legal');
      if (legalParam && ['terms', 'privacy', 'shipping', 'returns', 'cookies', 'legal'].includes(legalParam)) {
        this.open(legalParam);
      }
    } catch (e) {}
  }

  open(type = 'terms') {
    if (!this.modalEl) this.createModalDOM();
    this.currentType = type;
    const isPt = this.isPortuguese();
    const content = this.getContent(type, isPt);

    document.getElementById('ls-legal-title').textContent = content.title;
    document.getElementById('ls-legal-subtitle').textContent = content.subtitle;
    document.getElementById('ls-legal-body').innerHTML = content.body;
    document.getElementById('ls-legal-body').scrollTop = 0;

    // Update tab labels & active state
    const tabLabels = isPt ? {
      terms: 'Termos & Condições',
      privacy: 'Privacidade (RGPD)',
      shipping: 'Envios & Entregas',
      returns: 'Garantia & Devoluções',
      cookies: 'Política de Cookies',
      legal: 'Aviso Legal & RAL'
    } : {
      terms: 'Terms & Conditions',
      privacy: 'Privacy (GDPR)',
      shipping: 'Shipping & Delivery',
      returns: 'Warranty & Returns',
      cookies: 'Cookie Policy',
      legal: 'Legal Notice & ADR'
    };

    this.modalEl.querySelectorAll('.ls-legal-tab').forEach(btn => {
      const t = btn.getAttribute('data-tab');
      btn.textContent = tabLabels[t] || t;
      if (t === type) {
        btn.className = 'ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors bg-blue-500 text-white font-bold shadow-sm';
      } else {
        btn.className = 'ls-legal-tab px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors bg-slate-900 text-slate-400 hover:text-white border border-slate-800';
      }
    });

    const okBtn = document.getElementById('ls-legal-btn-ok');
    if (okBtn) okBtn.textContent = isPt ? 'Fechar / Compreendi' : 'Close / Understood';
    const cookieBtn = document.getElementById('ls-legal-btn-cookies');
    if (cookieBtn) cookieBtn.textContent = isPt ? '🍪 Preferências de Cookies' : '🍪 Cookie Preferences';

    this.modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    document.body.style.overflow = '';
  }

  getContent(type, isPt) {
    switch (type) {
      /* ═══════════════════════════════════════════════════════════════════
         1. TERMOS E CONDIÇÕES GERAIS DE VENDA E FABRICO (TERMS OF SERVICE)
         ═══════════════════════════════════════════════════════════════════ */
      case 'terms':
        return isPt ? {
          title: 'Termos e Condições Gerais de Venda e Fabrico',
          subtitle: 'Última atualização: Outubro 2026 · Legislação Portuguesa e Europeia (DL n.º 24/2014 e DL n.º 84/2021)',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                Estes Termos e Condições regulam o acesso e utilização do website <strong>layerstudios.pt</strong>, bem como a encomenda de serviços de impressão 3D sob medida, modelação CAD e artigos de catálogo da loja online.
              </div>

              <h4 class="text-sm font-bold text-white">1. Identificação do Prestador de Serviços</h4>
              <p>O website e os serviços são operados sob a marca <strong>Layer Studios</strong> por <strong>Guilherme Miguel Garcia Cardoso</strong>, Trabalhador Independente com o NIF <strong>262891808</strong>, com sede operacional na Área Metropolitana de Lisboa, Portugal, email <code class="text-blue-400">contact@layerstudios.pt</code> e telefone de apoio ao cliente <strong>(+351) 962 118 770</strong>.</p>

              <h4 class="text-sm font-bold text-white">2. Objeto e Modalidades de Serviço</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Fabrico Aditivo Sob Medida (Orçamentos 3D):</strong> Produção de peças personalizadas por tecnologia FDM (Fused Deposition Modeling) em PLA+, PETG, ABS/ASA, TPU 95A e Compósitos de Fibra de Carbono, a partir de ficheiros 3D (<code>.STL</code>, <code>.3MF</code>, <code>.STEP</code>, <code>.OBJ</code>) submetidos pelo cliente.</li>
                <li><strong>Desenho CAD & Engenharia Inversa:</strong> Modelação 3D técnica a partir de esboços cotados, desenhos PDF ou peças partidas enviadas pelo cliente.</li>
                <li><strong>Loja Online de Catálogo:</strong> Venda direta de acessórios e produtos técnicos pré-desenhados e impressos nas nossas instalações.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Orçamentação, Preços e Formação do Contrato</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Todos os preços apresentados no website são expressos em <strong>Euros (€)</strong>.</li>
                <li>A calculadora 3D interativa na página de Orçamento fornece uma <strong>estimativa instantânea automática</strong> baseada no volume geométrico, material, preenchimento (infill) e altura de camada.</li>
                <li>Após a submissão de um pedido de orçamento personalizado, a equipa técnica da Layer Studios analisa a malha 3D, valida a imprimibilidade (necessidade de suportes, paredes mínimas ou ajustes de orientação) e confirma o preço final na página de acompanhamento. O contrato considera-se concluído no momento da confirmação e pagamento da encomenda.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">4. Condições de Pagamento e Segurança</h4>
              <p>Os pagamentos são processados de forma encriptada (SSL/TLS) através da plataforma certificada <strong>Stripe PCI-DSS Level 1</strong> (permitindo Cartão de Crédito/Débito Visa/Mastercard, Apple Pay, Google Pay, MB WAY e Referência Multibanco) ou por modalidade acordada diretamente em orçamentos empresariais (B2B). A produção de peças sob medida inicia-se após a confirmação de pagamento.</p>

              <h4 class="text-sm font-bold text-white">5. Tolerâncias Dimensionais e Características Técnicas FDM</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>A tolerância dimensional padrão do fabrico FDM na Layer Studios é de <strong>±0.20 mm</strong> (ou ±0.3% em peças com dimensões superiores a 100 mm).</li>
                <li>O processo de impressão camada a camada origina naturalmente linhas de camada visíveis (<em>layer lines</em>) e ligeiras marcas nos pontos de contacto de estruturas de suporte, as quais são limpas manualmente no pós-processamento mas fazem parte intrínseca da tecnologia de fabrico aditivo, não constituindo defeito.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">6. Propriedade Intelectual e Direitos de Autor</h4>
              <p>O cliente conserva a totalidade dos direitos de propriedade intelectual sobre os ficheiros 3D submetidos. Ao submeter um ficheiro, o cliente declara e garante que é o titular dos respetivos direitos ou possui licença válida para o seu fabrico físico, assumindo integral responsabilidade perante terceiros por qualquer violação de patentes, marcas registadas ou direitos de autor.</p>

              <h4 class="text-sm font-bold text-white">7. Artigos Proibidos e Direito de Recusa</h4>
              <p>Nos termos da Lei Portuguesa (incluindo o Regime Jurídico das Armas e suas Munições — Lei n.º 5/2006), é estritamente proibida a submissão ou encomenda de armas de fogo, componentes essenciais de armas, réplicas ilícitas, dispositivos destinados a atos ilícitos ou objetos que violem a ordem pública. A Layer Studios reserva-se o direito de recusar e cancelar imediatamente qualquer pedido desta natureza.</p>

              <h4 class="text-sm font-bold text-white">8. Limitação de Responsabilidade e Uso Técnico</h4>
              <p>Salvo especificação técnica escrita em contrário, as peças produzidas destinam-se a prototipagem, utilização geral, suportes e substituição não crítica. Não possuem certificação para implantes médicos, aviação certificada, sistemas de travagem/segurança crítica automóvel ou contacto alimentar prolongado não revestido. A responsabilidade máxima da Layer Studios limita-se ao valor pago pelo cliente na respetiva encomenda, sem prejuízo das normas legais imperativas de defesa do consumidor.</p>

              <h4 class="text-sm font-bold text-white">9. Lei Aplicável e Foro</h4>
              <p>Os presentes Termos regem-se pela <strong>Lei Portuguesa</strong>. Para a resolução de qualquer litígio emergente, é competente o foro da comarca de Lisboa ou as entidades de Resolução Alternativa de Litígios de Consumo (RAL) identificadas no Aviso Legal.</p>
            </div>
          `
        } : {
          title: 'General Terms & Conditions of Sale and Manufacturing',
          subtitle: 'Last updated: October 2026 · Portuguese & EU E-Commerce Law (DL 24/2014 & DL 84/2021)',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                These Terms & Conditions govern the use of <strong>layerstudios.pt</strong>, custom 3D printing services, CAD design services, and online catalog purchases.
              </div>

              <h4 class="text-sm font-bold text-white">1. Service Provider Identity</h4>
              <p>Operated under the trade name <strong>Layer Studios</strong> by <strong>Guilherme Miguel Garcia Cardoso</strong>, Tax ID / NIF <strong>PT262891808</strong>, based in the Lisbon Metropolitan Area, Portugal. Email: <code class="text-blue-400">contact@layerstudios.pt</code> · Phone: <strong>(+351) 962 118 770</strong>.</p>

              <h4 class="text-sm font-bold text-white">2. Scope of Services</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Custom FDM 3D Printing:</strong> On-demand additive manufacturing in PLA+, PETG, ABS/ASA, TPU 95A, and Carbon-Fiber composites from customer-supplied 3D files (<code>.STL</code>, <code>.3MF</code>, <code>.STEP</code>, <code>.OBJ</code>).</li>
                <li><strong>CAD Modeling & Reverse Engineering:</strong> Creation of 3D printable models from technical drawings, dimensioned sketches, or broken physical samples.</li>
                <li><strong>Catalog Store:</strong> Direct sale of studio-manufactured 3D printed accessories and hardware.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Quoting, Pricing & Contract Formation</h4>
              <p>All prices are stated in <strong>Euros (€)</strong>. Instant online slicer calculations are automated estimates; final custom manufacturing pricing and lead times are confirmed after technical geometry inspection. Production starts upon payment confirmation via <strong>Stripe</strong> (Card, Apple Pay, Google Pay, MB WAY, Multibanco) or agreed B2B invoicing.</p>

              <h4 class="text-sm font-bold text-white">4. Dimensional Tolerances & FDM Characteristics</h4>
              <p>Standard FDM tolerance is <strong>±0.20 mm</strong> (or ±0.3% above 100 mm). Layer lines and minor support contact marks are inherent to layer-by-layer filament extrusion and do not constitute manufacturing defects.</p>

              <h4 class="text-sm font-bold text-white">5. Intellectual Property & Prohibited Items</h4>
              <p>Customers retain full intellectual property rights over uploaded CAD files and warrant they hold legal rights to manufacture them. Layer Studios strictly prohibits firearms, weapon components (Portuguese Law 5/2006), unlawful devices, or counterfeit goods.</p>

              <h4 class="text-sm font-bold text-white">6. Governing Law</h4>
              <p>Governed by <strong>Portuguese Law</strong> and applicable EU consumer directives.</p>
            </div>
          `
        };

      /* ═══════════════════════════════════════════════════════════════════
         2. POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS — RGPD (PRIVACY)
         ═══════════════════════════════════════════════════════════════════ */
      case 'privacy':
        return isPt ? {
          title: 'Política de Privacidade e Proteção de Dados (RGPD)',
          subtitle: 'Em conformidade com o Regulamento (UE) 2016/679 e Lei n.º 58/2019',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <strong>Compromisso de Confidencialidade e Privacidade:</strong> Os seus ficheiros 3D/CAD e dados pessoais são tratados com sigilo rigoroso, guardados em servidores europeus encriptados e utilizados exclusivamente para orçamentar, produzir e entregar as suas encomendas.
              </div>

              <h4 class="text-sm font-bold text-white">1. Responsável pelo Tratamento de Dados</h4>
              <p>O responsável pelo tratamento dos dados pessoais é <strong>Guilherme Miguel Garcia Cardoso</strong> (marca <strong>Layer Studios</strong>, NIF <strong>262891808</strong>), com sede na Área Metropolitana de Lisboa, Portugal. Contacto direto para questões de privacidade e exercício de direitos RGPD: <code class="text-blue-400">contact@layerstudios.pt</code> ou <strong>(+351) 962 118 770</strong>.</p>

              <h4 class="text-sm font-bold text-white">2. Dados Pessoais Recolhidos e Finalidades</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Dados de Identificação e Contacto (Nome, Email, Telefone):</strong> Para comunicação sobre orçamentos, envio de notificações de estado da encomenda e apoio técnico.</li>
                <li><strong>Dados de Entrega e Faturação (Morada Postal, Código Postal, País, NIF opcional):</strong> Para expedição postal registada e cumprimento de obrigações fiscais perante a Autoridade Tributária.</li>
                <li><strong>Ficheiros Técnicos 3D e Desenhos CAD (STL, 3MF, STEP, OBJ, PDF):</strong> Exclusivamente para análise geométrica, fatiamento (slicing) e fabrico físico das peças.</li>
                <li><strong>Dados de Conta de Cliente:</strong> Palavra-passe armazenada sob hash criptográfico irreversível (<code>PBKDF2-HMAC-SHA256</code> com 200.000 iterações) para consulta de histórico de encomendas.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Fundamento de Licitude (Artigo 6.º do RGPD)</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Execução de contrato ou diligências pré-contratuais (Art.º 6.º, n.º 1, al. b):</strong> Processamento de orçamentos, fabrico e entrega de encomendas.</li>
                <li><strong>Cumprimento de obrigação jurídica (Art.º 6.º, n.º 1, al. c):</strong> Emissão e arquivo legal de documentos de faturação.</li>
                <li><strong>Consentimento do titular (Art.º 6.º, n.º 1, al. a):</strong> Cookies de estatística/marketing (geridos através do painel de Consentimento v2).</li>
              </ul>

              <h4 class="text-sm font-bold text-white">4. Confidencialidade Industrial (NDA) sobre Ficheiros 3D</h4>
              <p>A Layer Studios garante que <strong>nunca partilha, vende, publica nem disponibiliza a terceiros os ficheiros 3D/CAD enviados pelos clientes</strong>. Adicionalmente, o cliente dispõe da caixa <em>"Projeto confidencial"</em> no formulário de orçamento para proibir qualquer registo fotográfico da peça em portfólio.</p>

              <h4 class="text-sm font-bold text-white">5. Subcontratantes e Segurança Técnica</h4>
              <p>Apenas partilhamos os dados estritamente necessários com parceiros que cumprem o RGPD:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Stripe Payments Europe, Ltd.:</strong> Processamento seguro de pagamentos (a Layer Studios nunca tem acesso aos dados completos do seu cartão bancário).</li>
                <li><strong>CTT – Correios de Portugal / Transportadoras Expresso:</strong> Nome, morada e contacto telefónico para entrega da encomenda e avisos de rastreio.</li>
                <li><strong>Infraestrutura Base de Dados (Neon PostgreSQL - Região UE Frankfurt, Alemanha) & Resend:</strong> Armazenamento encriptado e envio de emails transacionais de encomenda.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">6. Prazos de Conservação dos Dados</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Ficheiros 3D/CAD:</strong> Conservados pelo período necessário à produção, garantia e eventual repetição de encomenda até um máximo de <strong>12 meses</strong>, ou <strong>eliminados de imediato</strong> a pedido do cliente.</li>
                <li><strong>Dados de Faturação:</strong> Conservados durante <strong>10 anos</strong> por imposição do Código do IVA e legislação fiscal portuguesa.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">7. Direitos dos Titulares e Reclamação à CNPD</h4>
              <p>O titular dos dados pode, a qualquer momento e gratuitamente, exercer os seus direitos de <strong>acesso, retificação, apagamento ("direito a ser esquecido"), limitação do tratamento, portabilidade e oposição</strong> enviando um pedido para <code class="text-blue-400">contact@layerstudios.pt</code>. Assiste-lhe igualmente o direito de apresentar reclamação junto da autoridade nacional de controlo: <strong>CNPD – Comissão Nacional de Proteção de Dados</strong> (<a href="https://www.cnpd.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cnpd.pt</a>).</p>
            </div>
          `
        } : {
          title: 'Privacy & Data Protection Policy (GDPR)',
          subtitle: 'Compliance with Regulation (EU) 2016/679 & Portuguese Law 58/2019',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <strong>Strict CAD & Personal Data Confidentiality:</strong> Your 3D files and personal data are encrypted, stored in EU servers (Frankfurt), used solely to quote, manufacture, and ship your parts, and never sold or shared.
              </div>

              <h4 class="text-sm font-bold text-white">1. Data Controller</h4>
              <p><strong>Guilherme Miguel Garcia Cardoso</strong> (trading as <strong>Layer Studios</strong>, Tax ID / NIF <strong>PT262891808</strong>), Lisbon Metropolitan Area, Portugal. Email: <code class="text-blue-400">contact@layerstudios.pt</code> · Phone: <strong>(+351) 962 118 770</strong>.</p>

              <h4 class="text-sm font-bold text-white">2. Data Collected & Legal Basis (GDPR Art. 6)</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Contract Performance (Art. 6(1)(b)):</strong> Name, email, phone, shipping address, and 3D CAD files (<code>.STL</code>, <code>.3MF</code>, <code>.STEP</code>, <code>.OBJ</code>) to slice, manufacture, and deliver your order.</li>
                <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> Billing records retained for 10 years under Portuguese tax law.</li>
                <li><strong>Explicit Consent (Art. 6(1)(a)):</strong> Optional analytics/marketing cookies via Google Consent Mode v2.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Subprocessors & Security</h4>
              <p>Payments are processed by <strong>Stripe Payments Europe, Ltd.</strong> (PCI-DSS Level 1). Database storage is hosted in the European Union (Frankfurt, Germany). Shipping is fulfilled via tracked postal carriers (CTT Expresso).</p>

              <h4 class="text-sm font-bold text-white">4. Your GDPR Rights & Supervisory Authority</h4>
              <p>You may request access, rectification, portability, or immediate permanent deletion of your CAD files and personal data at <code class="text-blue-400">contact@layerstudios.pt</code>. You also have the right to lodge a complaint with the Portuguese Data Protection Authority (<strong>CNPD</strong> — <a href="https://www.cnpd.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cnpd.pt</a>).</p>
            </div>
          `
        };

      /* ═══════════════════════════════════════════════════════════════════
         3. POLÍTICA DE ENVIOS E ENTREGAS (SHIPPING & DELIVERY)
         ═══════════════════════════════════════════════════════════════════ */
      case 'shipping':
        return isPt ? {
          title: 'Política de Envios, Prazos e Entregas',
          subtitle: 'Tarifas postais, prazos de produção e rastreio CTT / Expresso',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Destinos, Tarifas e Portes Grátis</h4>
              <div class="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-950 border-b border-slate-800 text-slate-300">
                    <tr><th class="p-3">Região / Destino</th><th class="p-3">Custo de Envio</th><th class="p-3">Trânsito Estimado</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-300">
                    <tr><td class="p-3 font-semibold text-white">Portugal Continental</td><td class="p-3">€4.50 <span class="text-emerald-400 font-bold">(Grátis em encomendas ≥ €50)</span></td><td class="p-3">24h a 48h úteis (CTT Expresso / Registado)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Açores e Madeira</td><td class="p-3">€6.90 <span class="text-emerald-400 font-bold">(Grátis ≥ €50)</span></td><td class="p-3">3 a 5 dias úteis (CTT Registado)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">União Europeia (UE)</td><td class="p-3">€9.90</td><td class="p-3">3 a 6 dias úteis (Tracked Courier)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Internacional (Fora da UE)</td><td class="p-3">€18.00</td><td class="p-3">5 a 10 dias úteis</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 class="text-sm font-bold text-white">2. Prazos de Produção em Estúdio</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Urgente (24h–48h úteis):</strong> Prioridade máxima na fila de impressão (+35%).</li>
                <li><strong>Produção Padrão (2 a 4 dias úteis):</strong> Prazo habitual para a maioria das peças individuais e protótipos.</li>
                <li><strong>Económico / Pequena Série (5 a 7 dias úteis):</strong> Ideal para lotes maiores com desconto de 10%.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Acompanhamento e Código de Rastreio (Tracking)</h4>
              <p>Todas as encomendas são enviadas com registo e acondicionamento protetor. Assim que a encomenda é expedida, o cliente recebe um email automático com o <strong>código de rastreio CTT / Transportadora</strong> e pode consultar o estado em tempo real na página <a href="/track" class="text-blue-400 underline font-semibold">Seguir Encomenda</a>.</p>

              <h4 class="text-sm font-bold text-white">4. Avarias ou Extravio no Transporte</h4>
              <p>O risco de perda ou dano dos bens transfere-se para o consumidor apenas no momento em que este adquire a posse física dos mesmos (Art.º 9.º-C da Lei n.º 24/96 e DL n.º 84/2021). Se a embalagem chegar visivelmente danificada, envie-nos fotografia no prazo de 48h para <code class="text-blue-400">contact@layerstudios.pt</code> para procedermos à reimpressão e reenvio gratuito imediato.</p>
            </div>
          `
        } : {
          title: 'Shipping, Lead Times & Delivery Policy',
          subtitle: 'Postal rates, studio production tiers, and live tracking',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Shipping Zones & Rates</h4>
              <div class="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-950 border-b border-slate-800 text-slate-300">
                    <tr><th class="p-3">Destination</th><th class="p-3">Shipping Rate</th><th class="p-3">Estimated Transit</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-300">
                    <tr><td class="p-3 font-semibold text-white">Portugal Mainland</td><td class="p-3">€4.50 <span class="text-emerald-400 font-bold">(Free on orders ≥ €50)</span></td><td class="p-3">24–48h business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Azores & Madeira</td><td class="p-3">€6.90</td><td class="p-3">3–5 business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">European Union</td><td class="p-3">€9.90</td><td class="p-3">3–6 business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">International</td><td class="p-3">€18.00</td><td class="p-3">5–10 business days</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 class="text-sm font-bold text-white">2. Production Tiers & Tracking</h4>
              <p>Choose between <strong>Express (24–48h)</strong>, <strong>Standard (2–4 business days)</strong>, or <strong>Economy Batch (5–7 business days)</strong>. Every shipment includes a tracking number sent via email and accessible at <a href="/track" class="text-blue-400 underline font-semibold">Track Order</a>.</p>
            </div>
          `
        };

      /* ═══════════════════════════════════════════════════════════════════
         4. GARANTIA, DEVOLUÇÕES E REEMBOLSOS (RETURNS & WARRANTY)
         ═══════════════════════════════════════════════════════════════════ */
      case 'returns':
        return isPt ? {
          title: 'Política de Garantia, Devoluções, Cancelamento e Reembolsos',
          subtitle: 'Em conformidade com o Decreto-Lei n.º 24/2014 e Decreto-Lei n.º 84/2021',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Garantia de Qualidade Layer Studios:</strong> Todas as peças são inspecionadas dimensionalmente antes do envio. Se existir qualquer defeito de impressão, material/cor incorretos ou dano no transporte, <strong>reimprimimos sem qualquer custo ou reembolsamos a 100%</strong>.
              </div>

              <h4 class="text-sm font-bold text-white">1. Direito de Livre Resolução (14 Dias) — Artigos da Loja Online</h4>
              <p>Para produtos pré-fabricados adquiridos no catálogo da <strong>Loja Online (<code>/store</code>)</strong>, o consumidor dispõe do prazo legal de <strong>14 dias seguidos</strong> a contar da data de receção da encomenda para resolver livremente o contrato (devolução sem necessidade de indicar motivo), nos termos do artigo 10.º do Decreto-Lei n.º 24/2014:</p>
              <ul class="list-disc pl-5 space-y-1 text-slate-300">
                <li>Para exercer este direito, basta comunicar a decisão por email para <code class="text-blue-400">contact@layerstudios.pt</code> indicando o número da encomenda.</li>
                <li>O artigo deve ser devolvido em perfeito estado de conservação e sem sinais de uso indevido. O reembolso integral é efetuado no mesmo método de pagamento no prazo máximo de 14 dias (habitualmente 3 a 5 dias úteis).</li>
              </ul>

              <h4 class="text-sm font-bold text-white">2. Regime Legal das Peças Impressas Sob Medida (Orçamentos 3D)</h4>
              <p>Nos termos da <strong>alínea c) do n.º 1 do artigo 17.º do Decreto-Lei n.º 24/2014</strong> (e Art.º 16.º, al. c) da Diretiva 2011/83/UE), o direito de livre resolução (desistência sem motivo em 14 dias) <strong>não se aplica ao fornecimento de bens confecionados de acordo com especificações do consumidor ou manifestamente personalizados</strong> (peças fabricadas exclusivamente a partir do ficheiro 3D/CAD ou medidas do cliente).</p>
              <p class="text-xs text-slate-400"><strong>Cancelamento Antes da Impressão:</strong> Caso o cliente solicite o cancelamento de um pedido personalizado <em>antes de a impressão 3D ter sido iniciada</em> no estúdio, a Layer Studios procede ao cancelamento imediato e ao <strong>reembolso de 100%</strong> do valor pago.</p>

              <h4 class="text-sm font-bold text-white">3. Garantia Legal e Defeitos de Fabrico (Decreto-Lei n.º 84/2021)</h4>
              <p>Independentemente de se tratar de um produto da loja ou de uma peça personalizada sob medida, o cliente goza de proteção total contra defeitos de fabrico ou não conformidades:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Defeito de Impressão, Material/Cor Trocados ou Dano Postal:</strong> Reimpressão urgente e reenvio 100% gratuito por nossa conta, ou reembolso total.</li>
                <li><strong>Erro no Desenho CAD Original do Cliente:</strong> Se a peça foi impressa exatamente conforme o ficheiro 3D fornecido pelo cliente mas o desenho original continha medidas incorretas, a nossa equipa ajuda a identificar a correção e oferece um <strong>desconto de 30% a 50% na reimpressão</strong> do ficheiro corrigido.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">4. Como Acionar a Garantia ou Devolução</h4>
              <p>Envie um email para <code class="text-blue-400">contact@layerstudios.pt</code> (ou WhatsApp/Telefone <strong>+351 962 118 770</strong>) com a referência da encomenda e, em caso de defeito ou dano, uma fotografia da peça. Respondemos em menos de 24 horas úteis.</p>
            </div>
          `
        } : {
          title: 'Warranty, Returns, Cancellations & Refunds Policy',
          subtitle: 'Compliant with EU Directive 2011/83/EU & Portuguese DL 24/2014 / DL 84/2021',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Layer Studios Quality Guarantee:</strong> If any part arrives damaged, printed in the wrong material/color, or out of dimensional tolerance, we reprint and reship for free or issue a 100% refund.
              </div>

              <h4 class="text-sm font-bold text-white">1. 14-Day Right of Withdrawal (Catalog Store Items)</h4>
              <p>For standard catalog products purchased on our <strong>Store (<code>/store</code>)</strong>, EU consumers have <strong>14 calendar days</strong> from delivery to return the item without giving any reason (DL 24/2014 Art. 10). Refunds are processed to the original payment method within 3–5 business days.</p>

              <h4 class="text-sm font-bold text-white">2. Custom-Manufactured 3D Parts (Quote Orders)</h4>
              <p>Under <strong>Article 17(1)(c) of Decree-Law 24/2014</strong> and EU Directive 2011/83/EU, the 14-day withdrawal right does not apply to goods made to the consumer's specifications or clearly personalized (custom 3D prints once production has begun). However, <strong>if production has not yet started, you may cancel for a 100% full refund</strong>.</p>

              <h4 class="text-sm font-bold text-white">3. Defective Parts & Customer CAD Revisions</h4>
              <p>Manufacturing defects or shipping damages are covered by a free priority reprint or full refund. If an error originated in the customer's own CAD dimensions, we offer a courtesy discount on the revised reprint.</p>
            </div>
          `
        };

      /* ═══════════════════════════════════════════════════════════════════
         5. POLÍTICA DE COOKIES E CONSENTIMENTO (COOKIE POLICY)
         ═══════════════════════════════════════════════════════════════════ */
      case 'cookies':
        return isPt ? {
          title: 'Política de Cookies e Tecnologias de Rastreio',
          subtitle: 'Lei n.º 41/2004, RGPD e Google Consent Mode v2',
          body: `
            <div class="space-y-4">
              <p>A Layer Studios utiliza cookies e armazenamento local (<code>localStorage</code>) de forma transparente, respeitando a sua privacidade e aplicando o protocolo <strong>Google Consent Mode v2</strong> (por defeito, cookies analíticos e de marketing encontram-se desativados até que dê o seu consentimento explícito).</p>

              <h4 class="text-sm font-bold text-white">1. Cookies e Armazenamento Estritamente Necessários (Sempre Ativos)</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><code>ls_token</code> / <code>ls_user</code>: Mantém a sessão autenticada do cliente de forma segura.</li>
                <li><code>ls_cart</code>: Guarda os artigos adicionados ao carrinho da loja.</li>
                <li><code>ls_lang</code> & <code>ls_theme</code>: Memoriza o idioma escolhido (PT/EN) e o tema visual (Escuro/Claro).</li>
                <li><code>ls_cookie_consent_v2</code>: Regista a sua escolha de consentimento de cookies.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">2. Cookies Analíticos (Opcionais — Requerem Consentimento)</h4>
              <p>Utilizamos o <strong>Google Analytics 4 (GA4)</strong> com anonimização de IP e filtragem automática de dados pessoais (PII Redaction) para compreender que páginas são visitadas e melhorar a performance do Slicer 3D.</p>

              <h4 class="text-sm font-bold text-white">3. Cookies de Marketing e Atribuição (Opcionais — Requerem Consentimento)</h4>
              <p>Utilizados apenas quando aceites pelo utilizador para medir a eficácia de campanhas no Google Ads (parâmetros <code>gclid</code> / <code>utm</code>), sem nunca partilhar ficheiros 3D ou dados confidenciais.</p>

              <h4 class="text-sm font-bold text-white">4. Como Alterar ou Revogar o Consentimento</h4>
              <p>Pode alterar ou retirar o seu consentimento a qualquer momento clicando no botão <strong>"🍪 Preferências de Cookies"</strong> aqui em baixo ou no rodapé de qualquer página do site.</p>
            </div>
          `
        } : {
          title: 'Cookie Policy & Consent Management',
          subtitle: 'ePrivacy Directive, GDPR & Google Consent Mode v2',
          body: `
            <div class="space-y-4">
              <p>Layer Studios uses strictly necessary local storage for site functionality and implements <strong>Google Consent Mode v2</strong> (analytics and marketing cookies remain denied by default unless explicitly accepted).</p>

              <h4 class="text-sm font-bold text-white">1. Strictly Necessary Storage (Always Active)</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><code>ls_token</code> / <code>ls_user</code>: Secure customer authentication session.</li>
                <li><code>ls_cart</code>: Shopping cart items persistence.</li>
                <li><code>ls_lang</code> & <code>ls_theme</code>: Language (PT/EN) and theme (Dark/Light) preferences.</li>
                <li><code>ls_cookie_consent_v2</code>: Stores your cookie consent preferences.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">2. Analytics & Marketing Cookies (Opt-In Only)</h4>
              <p>Google Analytics 4 (with strict PII filtering and IP anonymization) and Google Ads conversion attribution run only if you grant consent. Click <strong>"🍪 Cookie Preferences"</strong> below at any time to update your choices.</p>
            </div>
          `
        };

      /* ═══════════════════════════════════════════════════════════════════
         6. AVISO LEGAL, LIVRO DE RECLAMAÇÕES E RAL (LEGAL NOTICE & ADR)
         ═══════════════════════════════════════════════════════════════════ */
      case 'legal':
      default:
        return isPt ? {
          title: 'Aviso Legal, Livro de Reclamações e Resolução de Litígios (RAL)',
          subtitle: 'Cumprimento da Lei n.º 144/2015 e Decreto-Lei n.º 74/2017',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Identificação Legal e Fiscal</h4>
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-300">
                <p><strong>Marca Registada / Nome Comercial:</strong> Layer Studios</p>
                <p><strong>Titular da Exploração:</strong> Guilherme Miguel Garcia Cardoso</p>
                <p><strong>NIF / VAT Europeu:</strong> PT 262891808</p>
                <p><strong>Atividade Económica:</strong> Impressão 3D, Prototipagem Rápida, Fabrico Aditivo e Desenho CAD</p>
                <p><strong>Localização:</strong> Área Metropolitana de Lisboa, Portugal</p>
                <p><strong>Contacto Telefónico / WhatsApp:</strong> (+351) 962 118 770</p>
                <p><strong>Endereço Eletrónico:</strong> contact@layerstudios.pt</p>
              </div>

              <h4 class="text-sm font-bold text-white">2. Livro de Reclamações Eletrónico</h4>
              <p>Nos termos do Decreto-Lei n.º 74/2017, de 21 de junho, a Layer Studios disponibiliza o acesso direto à Plataforma Digital do <strong>Livro de Reclamações Eletrónico</strong> para apresentação de reclamações ou pedidos de informação à entidade reguladora (ASAE):</p>
              <p><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" class="inline-flex items-center px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors font-semibold text-xs">Aceder ao Livro de Reclamações Eletrónico (www.livroreclamacoes.pt) &rarr;</a></p>

              <h4 class="text-sm font-bold text-white">3. Resolução Alternativa de Litígios de Consumo (RAL — Lei n.º 144/2015)</h4>
              <p>Em caso de litígio de consumo, o consumidor pode recorrer a uma das seguintes Entidades de Resolução Alternativa de Litígios de Consumo:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
                <li><strong>CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo</strong> (Competência genérica nacional): <a href="https://www.cniacc.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cniacc.pt</a></li>
                <li><strong>CACCL – Centro de Arbitragem de Conflitos de Consumo de Lisboa</strong> (Área Metropolitana de Lisboa): <a href="http://www.centroarbitragemlisboa.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.centroarbitragemlisboa.pt</a></li>
                <li>Mais informações no <strong>Portal do Consumidor</strong> da Direção-Geral do Consumidor: <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.consumidor.gov.pt</a></li>
              </ul>
            </div>
          `
        } : {
          title: 'Legal Notice, Complaints Book & Dispute Resolution (ADR)',
          subtitle: 'Portuguese Law 144/2015 & Decree-Law 74/2017 Disclosures',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Legal Entity Identification</h4>
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-300">
                <p><strong>Trading Name:</strong> Layer Studios</p>
                <p><strong>Legal Holder:</strong> Guilherme Miguel Garcia Cardoso</p>
                <p><strong>Tax ID / EU VAT (NIF):</strong> PT 262891808</p>
                <p><strong>Activity:</strong> 3D Printing, Rapid Prototyping & CAD Modeling Services</p>
                <p><strong>Location:</strong> Lisbon Metropolitan Area, Portugal</p>
                <p><strong>Phone / Support:</strong> (+351) 962 118 770</p>
                <p><strong>Email:</strong> contact@layerstudios.pt</p>
              </div>

              <h4 class="text-sm font-bold text-white">2. Official Electronic Complaints Book (Portugal)</h4>
              <p>In compliance with Portuguese Decree-Law 74/2017, consumers may access the official Electronic Complaints Book at <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" class="text-blue-400 underline font-semibold">www.livroreclamacoes.pt</a>.</p>

              <h4 class="text-sm font-bold text-white">3. Alternative Dispute Resolution (ADR / RAL)</h4>
              <p>Under Law 144/2015, consumers may submit disputes to <strong>CNIACC</strong> (<a href="https://www.cniacc.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cniacc.pt</a>) or the <strong>Lisbon Consumer Conflict Arbitration Center (CACCL)</strong> (<a href="http://www.centroarbitragemlisboa.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.centroarbitragemlisboa.pt</a>).</p>
            </div>
          `
        };
    }
  }
}

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.LayerStudiosLegalInstance = new LayerStudiosLegal();
});
