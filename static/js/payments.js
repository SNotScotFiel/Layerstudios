/**
 * Layer Studios - Universal Payment Engine (Apple Pay, Google Pay, Cards, MB WAY, Multibanco)
 * Integrated with Stripe Checkout & local Portuguese payment reference methods.
 */

class LayerStudiosPayments {
  constructor() {
    this.modal = null;
    this.currentPayment = null;
    this.init();
  }

  init() {
    this.createPaymentModal();
  }

  createPaymentModal() {
    if (document.getElementById('ls-payment-gateway-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ls-payment-gateway-modal';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl relative">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              🔒
            </div>
            <div>
              <h3 class="text-base font-bold text-white leading-tight">Layer Studios Secure Checkout</h3>
              <span class="text-[10px] text-slate-400 font-mono">256-Bit SSL Encrypted Gateway</span>
            </div>
          </div>
          <button type="button" id="pay-modal-close" class="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors">✕</button>
        </div>

        <!-- Amount Banner -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">Total to Pay</span>
            <span id="pay-modal-desc" class="text-xs text-slate-300">Order Reference</span>
          </div>
          <span id="pay-modal-amount" class="text-2xl font-black text-blue-400">€0.00</span>
        </div>

        <!-- Method Tabs -->
        <div class="grid grid-cols-3 gap-2 text-xs font-mono">
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-blue-500 bg-blue-500/10 text-white" data-method="stripe">
            <span>💳 Card / Pay / GPay</span>
            <span class="text-[9px] text-slate-400 font-normal">Instant &amp; Direct</span>
          </button>
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700" data-method="mbway">
            <span>📱 MB WAY</span>
            <span class="text-[9px] text-slate-500 font-normal">Push Notification</span>
          </button>
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700" data-method="multibanco">
            <span>🏧 Multibanco</span>
            <span class="text-[9px] text-slate-500 font-normal">Entity &amp; Ref</span>
          </button>
        </div>

        <!-- TAB 1: STRIPE CHECKOUT (Apple Pay, Google Pay, Visa, MC) -->
        <div id="pay-view-stripe" class="space-y-4">
          <div class="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/20 text-xs space-y-2.5 text-slate-300">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-sm">One-Click Checkout</span>
              <div class="flex items-center gap-1.5 text-base">
                <span title="Apple Pay">Pay</span>
                <span title="Google Pay">GPay</span>
                <span title="Visa/Mastercard">💳</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Pay securely using <strong>Apple Pay</strong>, <strong>Google Pay</strong>, or any Credit/Debit Card. Processed directly through Stripe with end-to-end encryption.
            </p>
          </div>

          <button type="button" id="pay-btn-stripe-checkout" class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5">
            <span>🔒 Pay with Apple Pay / Google Pay / Card</span>
            <span class="font-mono text-xs opacity-90">&rarr;</span>
          </button>

          <div class="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
            <span>🛡️ Powered by Stripe</span>
            <span>&bull;</span>
            <span>PCI-DSS Level 1 Certified</span>
          </div>
        </div>

        <!-- TAB 2: MB WAY -->
        <div id="pay-view-mbway" class="hidden space-y-4">
          <div class="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2 text-slate-300">
            <p class="font-semibold text-blue-300">📱 Pagamento MB WAY Direto:</p>
            <p class="text-[11px] text-slate-400">Envie o montante para o número de contacto oficial Layer Studios: <strong class="text-white font-mono">+351 962 118 770</strong>. Indique a referência <strong id="pay-mbway-ref-desc" class="text-blue-400 font-mono">LS-XXXX</strong> no descritivo.</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center text-xs text-slate-400">
            <p>Assim que o montante for creditado na nossa conta, a encomenda avançará imediatamente para produção.</p>
          </div>

          <button type="button" id="pay-btn-track-mbway" class="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2">
            <span>Acompanhar Encomenda (Aguardar Verificação) &rarr;</span>
          </button>
        </div>

        <!-- TAB 3: MULTIBANCO / TRANSFERÊNCIA BANCÁRIA -->
        <div id="pay-view-multibanco" class="hidden space-y-4 text-xs font-mono">
          <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Beneficiário:</span>
              <strong class="text-white text-sm">Layer Studios Portugal</strong>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Referência:</span>
              <div class="flex items-center gap-2">
                <strong id="pay-mb-ref" class="text-blue-400 text-sm tracking-wider">LS-XXXX</strong>
                <button type="button" id="pay-mb-copy" class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Copy</button>
              </div>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Montante:</span>
              <strong id="pay-mb-amount" class="text-white text-sm">€0.00</strong>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span>Validade:</span>
              <span>3 dias úteis</span>
            </div>
          </div>

          <button type="button" id="pay-btn-track-mb" class="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition-all">
            <span>Acompanhar Encomenda (Aguardar Verificação) &rarr;</span>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
    this.setupModalEvents();
  }

  setupModalEvents() {
    const modal = this.modal;
    if (!modal) return;

    // Close modal
    modal.querySelector('#pay-modal-close').onclick = () => {
      modal.classList.add('hidden');
    };

    // Tabs switching
    const tabs = modal.querySelectorAll('.pay-method-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => {
          t.className = 'pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700';
        });
        tab.className = 'pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-blue-500 bg-blue-500/10 text-white';

        const method = tab.getAttribute('data-method');
        modal.querySelector('#pay-view-stripe').classList.toggle('hidden', method !== 'stripe');
        modal.querySelector('#pay-view-mbway').classList.toggle('hidden', method !== 'mbway');
        modal.querySelector('#pay-view-multibanco').classList.toggle('hidden', method !== 'multibanco');
      };
    });

    // Copy MB Ref
    modal.querySelector('#pay-mb-copy').onclick = () => {
      const ref = modal.querySelector('#pay-mb-ref').textContent;
      navigator.clipboard.writeText(ref.replace(/\s+/g, ''));
      if (window.LayerStudiosApp) {
        window.LayerStudiosApp.showToast('Referência copiada!', 'info');
      } else {
        alert('Referência copiada!');
      }
    };

    // Stripe Checkout Button (Apple Pay, Google Pay, Card)
    modal.querySelector('#pay-btn-stripe-checkout').onclick = async () => {
      if (!this.currentPayment) return;
      const { type, id, amount, title, email } = this.currentPayment;
      const btn = modal.querySelector('#pay-btn-stripe-checkout');
      const originalText = btn.innerHTML;

      try {
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Opening Stripe Checkout...
        `;

        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: id,
            type: type || 'order',
            amount: amount,
            title: title || 'Layer Studios 3D Printing',
            email: email || ''
          })
        });

        let data = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = {};
        }

        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Servidor em reinicialização ou erro no Stripe. Por favor tente novamente em 15 segundos.');
        }
      } catch (err) {
        console.error('Stripe checkout redirect error:', err);
        if (window.LayerStudiosApp) {
          window.LayerStudiosApp.showToast('Erro ao iniciar pagamento Stripe: ' + err.message, 'error');
        } else {
          alert('Could not start Stripe session: ' + err.message);
        }
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    };

    // Track MB WAY
    modal.querySelector('#pay-btn-track-mbway').onclick = () => this.handleTrackPayment();

    // Track Multibanco
    modal.querySelector('#pay-btn-track-mb').onclick = () => this.handleTrackPayment();
  }

  openPayment({ type = 'order', id, amount, title, phone = '+351 962 118 770', email = '', onSuccess }) {
    this.currentPayment = { type, id, amount, title, phone, email, onSuccess };
    const modal = this.modal || document.getElementById('ls-payment-gateway-modal');
    if (!modal) return;

    modal.querySelector('#pay-modal-desc').textContent = `${title || 'Order'} (${id})`;
    modal.querySelector('#pay-modal-amount').textContent = `€${amount.toFixed(2)}`;
    modal.querySelector('#pay-mb-amount').textContent = `€${amount.toFixed(2)}`;
    const mbwayRefDesc = modal.querySelector('#pay-mbway-ref-desc');
    if (mbwayRefDesc) mbwayRefDesc.textContent = id;
    modal.querySelector('#pay-mb-ref').textContent = id;

    modal.classList.remove('hidden');
  }

  handleTrackPayment() {
    if (!this.currentPayment) return;
    const { id } = this.currentPayment;
    if (this.modal) this.modal.classList.add('hidden');
    window.location.href = `/track?id=${encodeURIComponent(id)}`;
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  window.LayerStudiosPayments = new LayerStudiosPayments();
}
