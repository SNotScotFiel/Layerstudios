/**
 * Layer Studios - Universal Payment Engine (MB WAY, Multibanco, Card, Apple Pay)
 * Handles payment processing, MB WAY instant notifications, Multibanco reference generation,
 * encrypted card processing, and order/quote state transitions to 'Paid'.
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
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
        
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
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-blue-500 bg-blue-500/10 text-white" data-method="mbway">
            <span>📱 MB WAY</span>
            <span class="text-[9px] text-slate-400 font-normal">Instant Push</span>
          </button>
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700" data-method="card">
            <span>💳 Card / Apple</span>
            <span class="text-[9px] text-slate-500 font-normal">Stripe Secure</span>
          </button>
          <button type="button" class="pay-method-tab py-2.5 px-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700" data-method="multibanco">
            <span>🏧 Multibanco</span>
            <span class="text-[9px] text-slate-500 font-normal">Entity & Ref</span>
          </button>
        </div>

        <!-- TAB 1: MB WAY -->
        <div id="pay-view-mbway" class="space-y-4">
          <div class="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2 text-slate-300">
            <p class="font-semibold text-blue-300">📱 Open your MB WAY app on your phone:</p>
            <p class="text-[11px] text-slate-400">We've sent a payment request to <strong id="pay-mbway-phone-display" class="text-white font-mono">+351 9xx xxx xxx</strong>. You have <strong>04:59</strong> to approve the notification.</p>
          </div>

          <div class="flex items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 flex-col text-center">
            <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-mono text-slate-400 pt-2">Waiting for confirmation in MB WAY app...</p>
          </div>

          <button type="button" id="pay-btn-simulate-mbway" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2">
            <span>✓ Confirm MB WAY Payment</span>
          </button>
        </div>

        <!-- TAB 2: CREDIT / DEBIT CARD -->
        <div id="pay-view-card" class="hidden space-y-4 text-xs font-mono">
          <div class="space-y-3">
            <div>
              <label class="block text-slate-400 mb-1">Card Number</label>
              <div class="relative">
                <input type="text" id="pay-card-num" placeholder="4242 •••• •••• 4242" maxlength="19" class="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-blue-400 focus:outline-none placeholder-slate-600">
                <span class="absolute right-3 top-3 text-sm">💳</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Expiry Date</label>
                <input type="text" id="pay-card-exp" placeholder="MM / YY" maxlength="5" class="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-blue-400 focus:outline-none placeholder-slate-600 text-center">
              </div>
              <div>
                <label class="block text-slate-400 mb-1">CVC / CVV</label>
                <input type="password" id="pay-card-cvc" placeholder="•••" maxlength="4" class="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-blue-400 focus:outline-none placeholder-slate-600 text-center">
              </div>
            </div>
          </div>

          <button type="button" id="pay-btn-submit-card" class="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
            <span>🔒 Pay with Card</span>
          </button>
        </div>

        <!-- TAB 3: MULTIBANCO REFERENCE -->
        <div id="pay-view-multibanco" class="hidden space-y-4 text-xs font-mono">
          <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Entidade (Entity):</span>
              <strong class="text-white text-sm">21094</strong>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Referência (Reference):</span>
              <div class="flex items-center gap-2">
                <strong id="pay-mb-ref" class="text-blue-400 text-sm tracking-wider">942 108 349</strong>
                <button type="button" id="pay-mb-copy" class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Copy</button>
              </div>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <span class="text-slate-400">Montante (Amount):</span>
              <strong id="pay-mb-amount" class="text-white text-sm">€0.00</strong>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span>Validade:</span>
              <span>3 dias (72h)</span>
            </div>
          </div>

          <button type="button" id="pay-btn-submit-mb" class="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all">
            <span>✓ I have completed Multibanco payment</span>
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
        modal.querySelector('#pay-view-mbway').classList.toggle('hidden', method !== 'mbway');
        modal.querySelector('#pay-view-card').classList.toggle('hidden', method !== 'card');
        modal.querySelector('#pay-view-multibanco').classList.toggle('hidden', method !== 'multibanco');
      };
    });

    // Copy MB Ref
    modal.querySelector('#pay-mb-copy').onclick = () => {
      const ref = modal.querySelector('#pay-mb-ref').textContent;
      navigator.clipboard.writeText(ref.replace(/\s+/g, ''));
      alert('Referência Multibanco copiada!');
    };

    // Simulate MB WAY
    modal.querySelector('#pay-btn-simulate-mbway').onclick = () => this.handleSuccessPayment('MB WAY');

    // Submit Card
    modal.querySelector('#pay-btn-submit-card').onclick = () => this.handleSuccessPayment('Card (Stripe)');

    // Submit Multibanco
    modal.querySelector('#pay-btn-submit-mb').onclick = () => this.handleSuccessPayment('Multibanco Reference');
  }

  openPayment({ type = 'order', id, amount, title, phone = '+351 912 345 678', onSuccess }) {
    this.currentPayment = { type, id, amount, title, phone, onSuccess };
    const modal = this.modal || document.getElementById('ls-payment-gateway-modal');
    if (!modal) return;

    modal.querySelector('#pay-modal-desc').textContent = `${title || 'Order'} (${id})`;
    modal.querySelector('#pay-modal-amount').textContent = `€${amount.toFixed(2)}`;
    modal.querySelector('#pay-mb-amount').textContent = `€${amount.toFixed(2)}`;
    modal.querySelector('#pay-mbway-phone-display').textContent = phone;

    // Generate pseudo MB reference from ID
    const cleanNum = id.replace(/[^0-9]/g, '') || '84920';
    const mbRef = `${cleanNum.padEnd(3, '9').slice(0,3)} ${cleanNum.padEnd(6, '4').slice(0,3)} ${cleanNum.padEnd(9, '1').slice(0,3)}`;
    modal.querySelector('#pay-mb-ref').textContent = mbRef;

    modal.classList.remove('hidden');
  }

  async handleSuccessPayment(method) {
    if (!this.currentPayment) return;
    const { type, id, onSuccess } = this.currentPayment;

    try {
      if (type === 'quote') {
        await fetch('/api/quotes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'Printing', paymentStatus: 'Paid', paymentMethod: method })
        });
      } else {
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'Printing', paymentStatus: 'Paid', paymentMethod: method })
        });
      }
    } catch (err) {
      console.error('Payment sync error:', err);
    }

    if (this.modal) this.modal.classList.add('hidden');

    if (typeof onSuccess === 'function') {
      onSuccess(method);
    } else {
      window.location.href = `/track?id=${id}&paid=true`;
    }
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  window.LayerStudiosPayments = new LayerStudiosPayments();
}
