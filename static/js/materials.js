/**
 * Layer Studios - Materials Center, Matrix Comparison & Interactive Advisor Quiz
 */

class LayerStudiosMaterials {
  constructor() {
    this.materials = [];
    this.quizAnswers = {
      useCase: 'mechanical',
      temperature: 'standard',
      stress: 'moderate'
    };

    this.init();
  }

  async init() {
    await this.fetchMaterials();
    this.setupQuiz();
    this.setupComparisonTableFilters();
  }

  async fetchMaterials() {
    try {
      const res = await fetch('/api/materials');
      if (res.ok) {
        this.materials = await res.json();
        this.renderMaterialCards();
        this.renderComparisonTable();
        if (window.LayerStudiosI18nInstance) {
          window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
        }
      }
    } catch (err) {
      console.error('Fetch materials error:', err);
    }
  }

  renderMaterialCards() {
    const container = document.getElementById('materials-cards-grid');
    if (!container) return;

    container.innerHTML = '';

    this.materials.forEach(m => {
      const card = document.createElement('div');
      card.className = 'rounded-2xl bg-slate-900/80 border border-slate-800 p-6 glass-panel-hover flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-sky-400 font-bold tracking-wider uppercase">${m.priceLevel}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">Max ${m.heatTemp}</span>
          </div>

          <h3 class="text-2xl font-bold text-white mt-3">${m.name}</h3>
          <p class="text-xs font-mono text-slate-400 mt-0.5">${m.subtitle}</p>
          <p class="text-sm text-slate-300 mt-3 leading-relaxed">${m.tagline}</p>

          <!-- Technical Specs Ratings -->
          <div class="mt-6 space-y-2.5 pt-4 border-t border-slate-800/80 text-xs font-mono">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Mechanical Strength</span>
              <div class="flex items-center space-x-1">
                ${this.renderRatingBar(m.strength)}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Flexibility & Impact</span>
              <div class="flex items-center space-x-1">
                ${this.renderRatingBar(m.flexibility)}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Heat Resistance</span>
              <div class="flex items-center space-x-1">
                ${this.renderRatingBar(m.heatResistance)}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Outdoor & UV Sun</span>
              <div class="flex items-center space-x-1">
                ${this.renderRatingBar(m.outdoorResistance)}
              </div>
            </div>
          </div>

          <!-- Advantages list -->
          <div class="mt-6">
            <p class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">Key Advantages</p>
            <ul class="space-y-1.5 text-xs text-slate-400">
              ${m.advantages.slice(0, 3).map(a => `<li class="flex items-start space-x-2"><span class="text-sky-400">✓</span><span>${a}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800/80">
          <a href="/quote" class="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-800 hover:bg-blue-500 text-slate-200 hover:text-white font-semibold text-xs transition-all select-mat-btn" data-material="${m.name}">
            Select for Quote &rarr;
          </a>
        </div>
      `;

      card.querySelector('.select-mat-btn').addEventListener('click', () => {
        try { localStorage.setItem('ls_selected_material', m.name); } catch(e){}
      });

      container.appendChild(card);
    });
  }

  renderRatingBar(val) {
    let dots = '';
    for (let i = 1; i <= 10; i += 2) {
      const active = i <= val;
      dots += `<span class="w-2.5 h-2 rounded-sm ${active ? 'bg-blue-400' : 'bg-slate-800'}"></span>`;
    }
    return dots;
  }

  renderComparisonTable() {
    const tbody = document.getElementById('materials-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.materials.forEach(m => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors text-xs font-mono';
      row.innerHTML = `
        <td class="p-4 font-bold text-white whitespace-nowrap">
          ${m.name}
          <span class="block text-[10px] text-slate-500 font-normal">${m.subtitle}</span>
        </td>
        <td class="p-4 text-slate-300">${m.heatTemp}</td>
        <td class="p-4 text-slate-300">${m.strength}/10</td>
        <td class="p-4 text-slate-300">${m.flexibility}/10</td>
        <td class="p-4 text-slate-300">${m.outdoorResistance}/10</td>
        <td class="p-4 font-bold text-blue-400">${m.priceLevel}</td>
        <td class="p-4 text-right">
          <a href="/quote" class="inline-block px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-500 text-slate-200 hover:text-white font-semibold text-[10px] transition-all">
            Quote &rarr;
          </a>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  setupComparisonTableFilters() {
    // optional sorting can be added here
  }

  setupQuiz() {
    const quizForm = document.getElementById('material-advisor-form');
    if (!quizForm) return;

    quizForm.addEventListener('change', () => this.evaluateQuiz());
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.evaluateQuiz();
    });

    this.evaluateQuiz();
  }

  evaluateQuiz() {
    const useCase = document.querySelector('input[name="advisor-useCase"]:checked, input[name="advisor_use"]:checked')?.value || 'mechanical';
    const temp = document.querySelector('input[name="advisor-temp"]:checked, input[name="advisor_temp"]:checked')?.value || 'standard';
    const stress = document.querySelector('input[name="advisor-stress"]:checked, input[name="advisor_stress"]:checked')?.value || 'moderate';

    let recommended = 'PETG';
    let rationale = 'PETG offers the ideal balance of impact resistance, weather resistance, and thermal tolerance up to 75°C.';

    if (useCase === 'flexible') {
      recommended = 'TPU 95A';
      rationale = 'TPU 95A is flexible, shock-absorbing, and virtually indestructible under impacts and vibrations.';
    } else if (useCase === 'visual' || (useCase === 'mechanical' && temp === 'standard' && stress === 'low')) {
      recommended = 'PLA+';
      rationale = 'PLA+ provides the crispest surface details, sharpest edges, and most cost-effective prototyping turnaround.';
    } else if (temp === 'hot' || useCase === 'automotive') {
      recommended = 'Carbon-Fiber CF-Nylon';
      rationale = 'CF-Nylon delivers maximum structural stiffness, thermal resistance up to 120°C+, and high strength.';
    } else if (stress === 'heavy') {
      recommended = 'Carbon-Fiber CF-Nylon';
      rationale = 'Carbon-fiber reinforced composite engineered for high mechanical loads and zero flexing.';
    }

    const resultBox = document.getElementById('advisor-result-box');
    const resultName = document.getElementById('advisor-result-name');
    const resultText = document.getElementById('advisor-result-text');
    const applyBtn = document.getElementById('advisor-apply-btn');

    if (resultName) resultName.textContent = recommended;
    if (resultText) resultText.textContent = rationale;
    if (applyBtn) {
      applyBtn.onclick = () => {
        try { localStorage.setItem('ls_selected_material', recommended); } catch(e){}
        window.location.href = '/quote';
      };
    }

    if (window.LayerStudiosI18nInstance) {
      window.LayerStudiosI18nInstance.applyLanguage(window.LayerStudiosI18nInstance.currentLang);
    }
  }
}

window.LayerStudiosMaterials = LayerStudiosMaterials;