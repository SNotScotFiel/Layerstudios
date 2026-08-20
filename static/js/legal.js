/**
 * Layer Studios - Legal Policies & Consumer Protection Modal System (PT-PT / EN)
 * Complete legal documentation compliant with Portuguese & EU e-commerce regulations:
 * - Terms of Service (Termos de Serviço & Fabrico)
 * - Privacy Policy & GDPR (Política de Privacidade e Proteção de Dados)
 * - Shipping & Delivery (Envios e Entregas)
 * - Returns, Defects & Quality Guarantee (Garantia, Devoluções e Reclamações)
 * - Legal Identification & ADR (Identificação Legal e Resolução de Litígios)
 */

class LayerStudiosLegal {
  constructor() {
    this.modalEl = null;
    this.init();
  }

  init() {
    this.createModalDOM();
    this.bindEvents();
  }

  createModalDOM() {
    if (document.getElementById('ls-legal-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ls-legal-modal';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">LS</div>
            <div>
              <h3 id="ls-legal-title" class="text-base font-bold text-white leading-tight">Legal Policy</h3>
              <p id="ls-legal-subtitle" class="text-[11px] text-slate-400 font-mono">Layer Studios · Portugal</p>
            </div>
          </div>
          <button id="ls-legal-close" type="button" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Content Body (Scrollable) -->
        <div id="ls-legal-body" class="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span class="font-mono text-[11px]">Layer Studios · Portugal · EU</span>
          <button id="ls-legal-btn-ok" type="button" class="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-colors">
            Close / Fechar
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Close buttons
    modal.querySelector('#ls-legal-close').addEventListener('click', () => this.close());
    modal.querySelector('#ls-legal-btn-ok').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
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

  open(type) {
    if (!this.modalEl) this.createModalDOM();
    const isPt = window.LayerStudiosI18nInstance && window.LayerStudiosI18nInstance.currentLang === 'pt';
    const content = this.getContent(type, isPt);

    document.getElementById('ls-legal-title').textContent = content.title;
    document.getElementById('ls-legal-subtitle').textContent = content.subtitle;
    document.getElementById('ls-legal-body').innerHTML = content.body;

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
      case 'privacy':
        return isPt ? {
          title: 'Política de Privacidade e Proteção de Dados (RGPD)',
          subtitle: 'Conformidade com o Regulamento (UE) 2016/679',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <strong>Resumo de Privacidade:</strong> Os seus ficheiros CAD e dados pessoais são tratados com estrita confidencialidade, utilizados exclusivamente para orçamentação e fabrico das suas peças, e nunca vendidos ou cedidos a terceiros.
              </div>

              <h4 class="text-sm font-bold text-white">1. Responsável pelo Tratamento</h4>
              <p>O responsável pelo tratamento dos dados é a <strong>Layer Studios</strong>, com atividade sediada na Área Metropolitana de Lisboa, Portugal. Para qualquer questão sobre os seus dados ou exercício de direitos, contacte-nos através de <code class="text-blue-400">contact@layerstudios.pt</code>.</p>

              <h4 class="text-sm font-bold text-white">2. Dados Recolhidos e Finalidades</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Ficheiros 3D e Modelos CAD (STL, 3MF, STEP, etc.):</strong> Utilizados estritamente para análise de fatiamento, cálculo de custos e impressão física das peças encomendadas.</li>
                <li><strong>Dados de Contacto e Faturação (Nome, Email, Telefone, Morada, NIF opcional):</strong> Necessários para processamento da encomenda, envio pelos transportadores e cumprimento de obrigações fiscais.</li>
                <li><strong>Dados de Pagamento:</strong> O processamento é realizado de forma encriptada através de entidades bancárias e fornecedores de pagamento certificados (Stripe). A Layer Studios não armazena dados de cartões de crédito.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Confidencialidade e Ficheiros de Clientes</h4>
              <p>A Layer Studios <strong>nunca publicará fotografias nem divulgará ficheiros de projetos proprietários ou personalizados</strong> sem o consentimento prévio e expresso do cliente. No formulário de orçamento, o cliente dispõe de opção explícita de confidencialidade.</p>

              <h4 class="text-sm font-bold text-white">4. Conservação de Dados</h4>
              <p>Os ficheiros 3D são mantidos em ambiente seguro pelo período necessário à produção e reordenação pelo cliente. O cliente pode solicitar a eliminação imediata dos seus ficheiros a qualquer momento após a conclusão da encomenda.</p>

              <h4 class="text-sm font-bold text-white">5. Direitos do Titular (RGPD)</h4>
              <p>Nos termos do RGPD, tem o direito de aceder, retificar, limitar o tratamento, requerer a portabilidade ou a eliminação dos seus dados pessoais ("direito a ser esquecido"), mediante comunicação para <code class="text-blue-400">contact@layerstudios.pt</code>.</p>
            </div>
          `
        } : {
          title: 'Privacy & Data Protection Policy (GDPR)',
          subtitle: 'Compliance with Regulation (EU) 2016/679',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <strong>Privacy Summary:</strong> Your CAD files and personal information are treated with strict confidentiality, used exclusively for quoting and manufacturing your physical parts, and never shared or sold.
              </div>

              <h4 class="text-sm font-bold text-white">1. Data Controller</h4>
              <p>The data controller is <strong>Layer Studios</strong>, based in Portugal. For any data inquiries or rights requests, contact us at <code class="text-blue-400">contact@layerstudios.pt</code>.</p>

              <h4 class="text-sm font-bold text-white">2. Data Collected and Purpose</h4>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>3D Files and CAD Models (STL, 3MF, STEP, etc.):</strong> Used strictly to slice, estimate volume/time, and physically manufacture requested parts.</li>
                <li><strong>Contact & Shipping Data (Name, Email, Phone, Address):</strong> Required for order fulfillment, postal dispatch, and tax documentation.</li>
                <li><strong>Payment Data:</strong> Handled through PCI-compliant payment gateways (Stripe). Layer Studios does not store payment card numbers.</li>
              </ul>

              <h4 class="text-sm font-bold text-white">3. Customer Design Confidentiality</h4>
              <p>Layer Studios <strong>will never publish photos or share proprietary customer designs</strong> in marketing or portfolio showcases without explicit opt-in consent from the client.</p>

              <h4 class="text-sm font-bold text-white">4. Your GDPR Rights</h4>
              <p>Under EU GDPR law, you have the right to access, rectify, restrict processing, or request immediate permanent deletion of your files and account data by contacting <code class="text-blue-400">contact@layerstudios.pt</code>.</p>
            </div>
          `
        };

      case 'terms':
        return isPt ? {
          title: 'Termos e Condições de Serviço',
          subtitle: 'Condições gerais de fabrico e utilização',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Âmbito e Serviços</h4>
              <p>A Layer Studios presta serviços de impressão 3D por deposição de filamento fundido (FDM), prototipagem rápida e apoio a desenho CAD sob pedido do cliente.</p>

              <h4 class="text-sm font-bold text-white">2. Propriedade Intelectual e Ficheiros Fornecidos</h4>
              <p>O cliente declara e garante que detém os direitos legais necessários, licenças ou autorização de fabrico sobre todos os modelos 3D, ficheiros CAD ou desenhos que submete à Layer Studios. O envio de um ficheiro não transfere a propriedade intelectual do mesmo para a Layer Studios.</p>

              <h4 class="text-sm font-bold text-white">3. Direito de Recusa</h4>
              <p>A Layer Studios reserva-se o direito de recusar pedidos de fabrico que envolvam armas de fogo, componentes de segurança não autorizados, símbolos ilícitos ou qualquer conteúdo que viole a legislação portuguesa ou europeia.</p>

              <h4 class="text-sm font-bold text-white">4. Orçamentos e Preços</h4>
              <p>As estimativas instantâneas geradas automaticamente no website são indicativas. O preço final de fabrico e o prazo de entrega são validados pela Layer Studios após verificação da geometria, orientação de camadas e densidade de preenchimento.</p>

              <h4 class="text-sm font-bold text-white">5. Aplicações e Limitações dos Materiais</h4>
              <p>As peças produzidas por tecnologia FDM são indicadas para protótipos funcionais, caixas, suportes e peças de substituição não críticas. Salvo especificação e certificação expressa, as peças não são certificadas para componentes de segurança automóvel (travões, direção), medicinais ou contacto alimentar direto prolongado sem selagem apropriada.</p>
            </div>
          `
        } : {
          title: 'Terms of Service & Manufacturing',
          subtitle: 'General conditions of service',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Scope of Service</h4>
              <p>Layer Studios provides custom fused deposition modeling (FDM) 3D printing, rapid prototyping, and CAD modeling services from Portugal.</p>

              <h4 class="text-sm font-bold text-white">2. Intellectual Property & Customer Supplied CAD</h4>
              <p>The customer affirms they own or hold legitimate rights to manufacture submitted CAD files and geometries. Submitting a file does not transfer ownership to Layer Studios.</p>

              <h4 class="text-sm font-bold text-white">3. Right to Refuse</h4>
              <p>Layer Studios retains discretion to decline manufacturing requests involving weapons, unlawful items, safety hazards, or intellectual property infringements.</p>

              <h4 class="text-sm font-bold text-white">4. Quoting & Pricing</h4>
              <p>Instant online automated calculations are estimates. Final price and production lead times are verified upon technical file review.</p>

              <h4 class="text-sm font-bold text-white">5. Material & Safety Disclaimers</h4>
              <p>FDM parts are intended for prototypes, enclosures, brackets, and non-critical replacement items. Unless explicitly certified, standard 3D prints are not rated for safety-critical automotive structural systems, medical use, or unsealed food contact.</p>
            </div>
          `
        };

      case 'shipping':
        return isPt ? {
          title: 'Política de Envios e Entregas',
          subtitle: 'Prazos, taxas e modalidades de transporte',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Áreas de Envio e Tarifas</h4>
              <div class="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-950 border-b border-slate-800 text-slate-300">
                    <tr><th class="p-3">Destino</th><th class="p-3">Portes</th><th class="p-3">Prazo de Trânsito</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-300">
                    <tr><td class="p-3 font-semibold text-white">Portugal Continental</td><td class="p-3">€4.50 <span class="text-emerald-400 font-bold">(Grátis > €50)</span></td><td class="p-3">24–48h úteis (CTT / Expresso)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Açores e Madeira</td><td class="p-3">€6.90</td><td class="p-3">3–5 dias úteis (CTT Registado)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">União Europeia</td><td class="p-3">€9.90</td><td class="p-3">3–5 dias úteis (Courier Tracked)</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Internacional</td><td class="p-3">€18.00</td><td class="p-3">5–10 dias úteis</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 class="text-sm font-bold text-white">2. Prazo de Produção vs. Prazo de Envio</h4>
              <p>O prazo de entrega total é composto pelo <strong>tempo de fabrico/impressão</strong> (habitualmente 24–48h úteis para pedidos normais) somado ao <strong>tempo de trânsito</strong> do transportador.</p>

              <h4 class="text-sm font-bold text-white">3. Seguimento em Direto (Tracking)</h4>
              <p>Assim que a encomenda for expedida, o cliente recebe um código de rastreio e pode acompanhar o estado no nosso portal em <a href="/track" class="text-blue-400 underline font-semibold">Seguir Encomenda</a>.</p>
            </div>
          `
        } : {
          title: 'Shipping & Delivery Policy',
          subtitle: 'Transit times, rates and logistics',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Shipping Rates & Destinations</h4>
              <div class="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-950 border-b border-slate-800 text-slate-300">
                    <tr><th class="p-3">Destination</th><th class="p-3">Rate</th><th class="p-3">Estimated Transit</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-300">
                    <tr><td class="p-3 font-semibold text-white">Portugal Mainland</td><td class="p-3">€4.50 <span class="text-emerald-400 font-bold">(Free > €50)</span></td><td class="p-3">24–48h business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">Azores & Madeira</td><td class="p-3">€6.90</td><td class="p-3">3–5 business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">European Union</td><td class="p-3">€9.90</td><td class="p-3">3–5 business days</td></tr>
                    <tr><td class="p-3 font-semibold text-white">International</td><td class="p-3">€18.00</td><td class="p-3">5–10 business days</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 class="text-sm font-bold text-white">2. Production Time vs. Transit Time</h4>
              <p>Total lead time equals <strong>manufacturing time</strong> (typically 24–48h) plus <strong>carrier shipping time</strong>.</p>
            </div>
          `
        };

      case 'returns':
        return isPt ? {
          title: 'Garantia, Devoluções & Resolução de Erros',
          subtitle: 'O que acontece se uma peça tiver algum problema?',
          body: `
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide">Compromisso de Qualidade Layer Studios</span>
                <p class="text-xs text-slate-300">Queremos que fique 100% satisfeito com as suas peças. Inspecionamos cada impressão com paquímetro digital antes da embalagem.</p>
              </div>

              <h4 class="text-sm font-bold text-white">1. Erro de Fabrico ou Defeito por parte da Layer Studios</h4>
              <p>Caso a peça entregue apresente um defeito de fabrico (delaminação grave, material incorreto, cor errada, ou dano durante o transporte):</p>
              <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Solução Imediata:</strong> Reimpressão prioritária e reenvio sem qualquer custo adicional para o cliente, ou reembolso integral do valor.
              </div>

              <h4 class="text-sm font-bold text-white">2. Erros no Ficheiro CAD Fornecido pelo Cliente</h4>
              <p>Se a peça foi impressa fielmente de acordo com o modelo 3D enviado, mas as dimensões desenhadas pelo cliente estavam incorretas ou a geometria continha falhas de desenho do próprio cliente:</p>
              <p class="text-slate-300">Ajudamos a identificar a correção necessária e aplicamos um <strong>desconto de cortesia na reimpressão</strong> após a correção do ficheiro.</p>

              <h4 class="text-sm font-bold text-white">3. Direito de Livre Resolução em Bens Personalizados</h4>
              <p class="text-slate-400 text-xs">Nos termos da alínea c) do n.º 1 do artigo 17.º do Decreto-Lei n.º 24/2014 e da Diretiva Europeia 2011/83/UE, o direito de livre resolução (devolução por desistência em 14 dias) <em>não se aplica a bens personalizados ou confecionados de acordo com especificações do consumidor (impressões 3D sob medida)</em>, sem prejuízo da total garantia legal contra defeitos de fabrico e não conformidades.</p>

              <h4 class="text-sm font-bold text-white">4. Como Solicitar Suporte</h4>
              <p>Envie uma fotografia da peça e a referência da sua encomenda para <code class="text-blue-400">contact@layerstudios.pt</code>. Respondemos prontamente em dias úteis.</p>
            </div>
          `
        } : {
          title: 'Quality Guarantee, Defects & Returns',
          subtitle: 'What happens if a print is wrong or defective?',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Layer Studios Manufacturing Error</h4>
              <p>If your part arrives with a manufacturing defect, incorrect material, wrong color, or damage caused in shipping:</p>
              <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Immediate Solution:</strong> We reprint and reship at zero cost, or issue a full refund.
              </div>

              <h4 class="text-sm font-bold text-white">2. Customer CAD / Design Flaws</h4>
              <p>If the part was manufactured faithfully to your uploaded CAD model but the original CAD dimensions or design contained errors:</p>
              <p class="text-slate-300">We will diagnose the fit issue with you and provide a <strong>discounted reprint</strong> once the CAD file is adjusted.</p>

              <h4 class="text-sm font-bold text-white">3. Custom-Made Goods Exemption Notice</h4>
              <p class="text-slate-400 text-xs">Under EU Directive 2011/83/EU and Portuguese consumer law (DL 24/2014), the 14-day return-for-convenience period does not apply to custom-manufactured or personalized 3D printed parts, without restricting statutory warranty rights for defective items.</p>
            </div>
          `
        };

      case 'legal':
      default:
        return isPt ? {
          title: 'Informação Legal e Resolução de Litígios',
          subtitle: 'Identificação da entidade e direitos do consumidor',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Identificação do Prestador de Serviços</h4>
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-300">
                <p><strong>Nome Comercial:</strong> Layer Studios</p>
                <p><strong>Atividade:</strong> Serviços de Impressão 3D, Prototipagem e Modelação CAD</p>
                <p><strong>Sede Operacional:</strong> Área Metropolitana de Lisboa, Portugal</p>
                <p><strong>Email de Contacto:</strong> contact@layerstudios.pt</p>
                <p><strong>NIF / Registo Comercial:</strong> [Aguarda Configuração do Proprietário]</p>
              </div>

              <h4 class="text-sm font-bold text-white">2. Livro de Reclamações Eletrónico</h4>
              <p>Em cumprimento da legislação portuguesa (Decreto-Lei n.º 74/2017), o consumidor pode aceder à plataforma oficial do Livro de Reclamações Eletrónico através do endereço:</p>
              <p><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" class="inline-flex items-center text-blue-400 hover:text-blue-300 underline font-semibold">www.livroreclamacoes.pt &rarr;</a></p>

              <h4 class="text-sm font-bold text-white">3. Resolução Alternativa de Litígios de Consumo (RAL)</h4>
              <p>Em caso de litígio, o consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios de Consumo (Artigo 18.º da Lei n.º 144/2015):</p>
              <p class="text-xs text-slate-400"><strong>CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo</strong> (<a href="https://www.cniacc.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cniacc.pt</a>) ou <strong>Centro de Arbitragem de Conflitos de Consumo de Lisboa</strong> (<a href="http://www.centroarbitragemlisboa.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.centroarbitragemlisboa.pt</a>).</p>
            </div>
          `
        } : {
          title: 'Legal Notice & Business Identity',
          subtitle: 'Entity disclosures and consumer dispute resolution',
          body: `
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-white">1. Service Provider Identification</h4>
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-300">
                <p><strong>Trading Name:</strong> Layer Studios</p>
                <p><strong>Activity:</strong> 3D Printing, Prototyping & CAD Design Services</p>
                <p><strong>Operating Base:</strong> Lisbon area, Portugal</p>
                <p><strong>Contact Email:</strong> contact@layerstudios.pt</p>
                <p><strong>Tax ID / NIF:</strong> [Owner Configuration Required]</p>
              </div>

              <h4 class="text-sm font-bold text-white">2. Electronic Complaints Book (Portugal)</h4>
              <p>In accordance with Portuguese Decree-Law no. 74/2017, access the official electronic complaints platform at:</p>
              <p><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline font-semibold">www.livroreclamacoes.pt &rarr;</a></p>

              <h4 class="text-sm font-bold text-white">3. Alternative Dispute Resolution (ADR)</h4>
              <p class="text-xs text-slate-400">Consumers in the EU may access official dispute resolution entities via CNIACC (<a href="https://www.cniacc.pt" target="_blank" rel="noopener" class="text-blue-400 underline">www.cniacc.pt</a>) or the European Online Dispute Resolution platform.</p>
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