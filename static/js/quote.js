/**
 * Layer Studios - Instant & Request Quote Engine
 * Handles dual-path workflow (Existing 3D model vs CAD design request),
 * drag-and-drop file ingestion, dynamic 3D telemetry parsing, real-time cost breakdown,
 * and API persistence generating unique Quote IDs (LS-XXXX).
 */

class LayerStudiosQuoteEngine {
  constructor() {
    this.viewer = null;
    this.uploadedFiles = [];
    this.hasModel = true;
    this.pricingModel = {
      baseSetup: 4.00,
      materialCostPerGram: {
        'PLA / PLA+': 0.08,
        'PETG': 0.10,
        'TPU 95A': 0.16,
        'ABS / ASA': 0.14,
        'Carbon-Fiber PETG': 0.22
      },
      qualityFactor: {
        'Draft (0.28mm)': 0.85,
        'Standard (0.20mm)': 1.00,
        'Fine (0.12mm)': 1.65
      },
      infillFactor: {
        'Light (15% Infill)': 0.75,
        'Standard (30% Infill)': 1.00,
        'Heavy Duty (50% Infill / 4 Walls)': 1.40,
        'Solid Mechanical (100% Infill)': 2.20
      },
      turnaroundFactor: {
        'Standard (3-5 Days)': 1.00,
        'Express Rush (24-48h)': 1.35
      },
      shippingRates: {
        'Portugal': 4.50,
        'European Union': 9.90,
        'International': 18.00
      }
    };

    this.currentTelemetry = {
      volumeCm3: 42.5,
      weightGrams: 35,
      x: 84,
      y: 52,
      z: 38,
      dimensionsStr: '84 × 52 × 38 mm'
    };

    this.init();
  }

  init() {
    this.setupPathSwitchers();
    this.setupDropzone();
    this.setupDynamicRecalculation();
    this.setupFormSubmission();
    this.initQuoteViewer();
    this.recalculateQuote();
  }

  initQuoteViewer() {
    const canvas = document.getElementById('quote-3d-canvas');
    if (!canvas) return;

    this.viewer = new LayerStudiosViewer('quote-3d-canvas', {
      autoRotate: true,
      initialMaterial: 'petg',
      showGrid: true,
      showBuildCage: true,
      showAxes: false,
      gridSize: 256,
      buildHeight: 256,
      onTelemetryUpdate: (telemetry) => {
        this.currentTelemetry = telemetry;
        this.updateTelemetryUI(telemetry);
        this.recalculateQuote();
        // Update layer count footer
        const lc = document.getElementById('quote-layer-count');
        if (lc) lc.textContent = `${telemetry.layerCount} layers @ 0.2mm`;
      },
      onFitResult: (r) => {
        const badge = document.getElementById('quote-fit-badge');
        if (!badge) return;
        badge.classList.remove('hidden');
        if (r.fits) {
          badge.className = 'absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-sm border bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
          badge.innerHTML = `<span>✓ Fits</span><span class="text-emerald-600">${Math.max(r.pctX, r.pctY, r.pctZ)}%</span>`;
        } else {
          badge.className = 'absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-sm border bg-red-950/80 text-red-400 border-red-500/40';
          badge.innerHTML = `<span>⚠ Exceeds 256mm</span>`;
        }
      }
    });

    // Load initial sample mechanical bracket
    setTimeout(() => {
      if (this.viewer) this.viewer.loadDefaultPart();
    }, 150);
  }

  setupPathSwitchers() {
    const btnHaveModel = document.getElementById('tab-have-model');
    const btnNeedDesign = document.getElementById('tab-need-design');
    const uploadAreaModel = document.getElementById('upload-area-model');
    const uploadAreaDesign = document.getElementById('upload-area-design');

    if (btnHaveModel && btnNeedDesign) {
      btnHaveModel.addEventListener('click', () => {
        this.hasModel = true;
        btnHaveModel.classList.add('bg-blue-500', 'text-white', 'border-blue-400');
        btnHaveModel.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
        btnNeedDesign.classList.remove('bg-blue-500', 'text-white', 'border-blue-400');
        btnNeedDesign.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
        if (uploadAreaModel) uploadAreaModel.classList.remove('hidden');
        if (uploadAreaDesign) uploadAreaDesign.classList.add('hidden');
        this.recalculateQuote();
      });

      btnNeedDesign.addEventListener('click', () => {
        this.hasModel = false;
        btnNeedDesign.classList.add('bg-blue-500', 'text-white', 'border-blue-400');
        btnNeedDesign.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
        btnHaveModel.classList.remove('bg-blue-500', 'text-white', 'border-blue-400');
        btnHaveModel.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
        if (uploadAreaModel) uploadAreaModel.classList.add('hidden');
        if (uploadAreaDesign) uploadAreaDesign.classList.remove('hidden');
        this.recalculateQuote();
      });
    }
  }

  setupDropzone() {
    const dropzone = document.getElementById('quote-dropzone');
    const fileInput = document.getElementById('quote-file-input');

    if (!dropzone || !fileInput) return;

    // Clicking anywhere on the dropzone opens the file picker
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.handleFiles(files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFiles(e.target.files);
        // Reset input so the same file can be re-selected
        fileInput.value = '';
      }
    });
  }

  handleFiles(fileList) {
    const fileListContainer = document.getElementById('uploaded-files-list');
    if (!fileListContainer) return;

    Array.from(fileList).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['stl', 'step', 'stp', '3mf', 'obj', 'zip', 'pdf', 'png', 'jpg', 'jpeg'];
      
      if (!validExtensions.includes(ext)) {
        window.LayerStudiosApp && window.LayerStudiosApp.showToast(`Unsupported format: .${ext}. Please upload STL, 3MF, STEP, OBJ, PDF or Images.`, 'warning');
        return;
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileRecord = {
        name: file.name,
        size: `${sizeMB} MB`,
        extension: ext,
        fileObject: file
      };

      this.uploadedFiles.push(fileRecord);

      // Render file badge
      const badge = document.createElement('div');
      badge.className = 'flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-sm animate-fade-in';
      badge.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden">
          <div class="w-8 h-8 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs uppercase font-bold flex-shrink-0">
            ${ext}
          </div>
          <div class="truncate">
            <p class="font-medium text-slate-200 truncate">${file.name}</p>
            <p class="text-xs text-slate-400 font-mono">${sizeMB} MB</p>
          </div>
        </div>
        <button type="button" class="text-slate-500 hover:text-red-400 p-1 transition-colors" data-filename="${file.name}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      `;

      badge.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name);
        badge.remove();
        this.recalculateQuote();
      });

      fileListContainer.appendChild(badge);

      // Load 3D files into the WebGL viewer
      if (ext === 'stl') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (this.viewer) {
            this.viewer.loadSTLFromArrayBuffer(evt.target.result);
            this.showToast(`Loaded ${file.name} into 3D viewer!`, 'success');
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (ext === '3mf') {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            if (typeof JSZip === 'undefined') {
              this.showToast(`Uploaded ${file.name} — will be reviewed by our team`, 'info');
              return;
            }
            const zip = await JSZip.loadAsync(evt.target.result);
            // 3MF files are ZIP archives; find the primary model XML
            const modelEntry = zip.file('3D/3dmodel.model') ||
                               (zip.file(/\.model$/i).length > 0 ? zip.file(/\.model$/i)[0] : null);
            if (modelEntry) {
              const xmlText = await modelEntry.async('string');
              const geometry = this.parse3MFModelXML(xmlText);
              if (geometry && this.viewer) {
                this.viewer.setGeometry(geometry);
                this.showToast(`Loaded ${file.name} into 3D viewer!`, 'success');
              } else {
                this.showToast(`Could not parse 3D data in ${file.name}`, 'warning');
              }
            } else {
              this.showToast(`Could not find model data inside ${file.name}`, 'warning');
            }
          } catch (err) {
            console.error('3MF parse error:', err);
            this.showToast(`Uploaded ${file.name} — will be reviewed by our team`, 'info');
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });

    this.recalculateQuote();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const color = type === 'success' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/90' :
                  type === 'warning' ? 'border-amber-500/50 text-amber-300 bg-amber-950/90' :
                  type === 'error'   ? 'border-red-500/50 text-red-300 bg-red-950/90' :
                                       'border-blue-500/50 text-blue-300 bg-blue-950/90';
    toast.className = `p-3.5 rounded-xl border backdrop-blur-md text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-auto ${color}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  parse3MFModelXML(xmlText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');
      const ns = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';

      // Try with namespace, fall back to without
      let meshes = doc.getElementsByTagNameNS(ns, 'mesh');
      if (meshes.length === 0) meshes = doc.getElementsByTagName('mesh');
      if (meshes.length === 0) return null;

      const mesh = meshes[0];

      let verticesEl = mesh.getElementsByTagNameNS(ns, 'vertices');
      if (verticesEl.length === 0) verticesEl = mesh.getElementsByTagName('vertices');
      if (verticesEl.length === 0) return null;

      let vertexEls = verticesEl[0].getElementsByTagNameNS(ns, 'vertex');
      if (vertexEls.length === 0) vertexEls = verticesEl[0].getElementsByTagName('vertex');

      const verts = [];
      for (let i = 0; i < vertexEls.length; i++) {
        verts.push(
          parseFloat(vertexEls[i].getAttribute('x')),
          parseFloat(vertexEls[i].getAttribute('y')),
          parseFloat(vertexEls[i].getAttribute('z'))
        );
      }

      let trianglesEl = mesh.getElementsByTagNameNS(ns, 'triangles');
      if (trianglesEl.length === 0) trianglesEl = mesh.getElementsByTagName('triangles');
      if (trianglesEl.length === 0) return null;

      let triEls = trianglesEl[0].getElementsByTagNameNS(ns, 'triangle');
      if (triEls.length === 0) triEls = trianglesEl[0].getElementsByTagName('triangle');

      const positions = [];
      for (let i = 0; i < triEls.length; i++) {
        const v1 = parseInt(triEls[i].getAttribute('v1'));
        const v2 = parseInt(triEls[i].getAttribute('v2'));
        const v3 = parseInt(triEls[i].getAttribute('v3'));
        positions.push(
          verts[v1 * 3], verts[v1 * 3 + 1], verts[v1 * 3 + 2],
          verts[v2 * 3], verts[v2 * 3 + 1], verts[v2 * 3 + 2],
          verts[v3 * 3], verts[v3 * 3 + 1], verts[v3 * 3 + 2]
        );
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
      return geometry;
    } catch (err) {
      console.error('3MF XML parse error:', err);
      return null;
    }
  }

  updateTelemetryUI(telemetry) {
    const dimEl = document.getElementById('telemetry-dimensions');
    const volEl = document.getElementById('telemetry-volume');
    const weightEl = document.getElementById('telemetry-weight');
    const timeEl = document.getElementById('telemetry-time');

    if (dimEl) dimEl.textContent = telemetry.dimensionsStr;
    if (volEl) volEl.textContent = `${telemetry.volumeCm3} cm³`;
    if (weightEl) weightEl.textContent = `~${telemetry.weightGrams} g`;
    if (timeEl) timeEl.textContent = telemetry.estimatedDuration;
  }

  setupDynamicRecalculation() {
    const ids = [
      'quote-quality',
      'quote-infill',
      'quote-strength',
      'quote-quantity',
      'quote-turnaround',
      'quote-shipping-country',
      'quote-color'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.recalculateQuote());
        el.addEventListener('input', () => this.recalculateQuote());
      }
    });

    // Material radio buttons
    const matRadios = document.querySelectorAll('input[name="quote-material"]');
    matRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (this.viewer) {
          const mat = radio.value;
          if (mat.includes('PETG')) this.viewer.setMaterialPreset('amber');
          else if (mat.includes('TPU')) this.viewer.setMaterialPreset('tpu');
          else if (mat.includes('ABS')) this.viewer.setMaterialPreset('obsidian');
          else if (mat.includes('CF') || mat.includes('Nylon')) this.viewer.setMaterialPreset('obsidian');
          else this.viewer.setMaterialPreset('cyan');
        }
        this.recalculateQuote();
      });
    });
  }

  recalculateQuote() {
    const selectedMatRadio = document.querySelector('input[name="quote-material"]:checked');
    const selectedMatSelect = document.getElementById('quote-material');
    const material = selectedMatRadio ? selectedMatRadio.value : (selectedMatSelect ? selectedMatSelect.value : 'PLA+');

    const qualEl = document.getElementById('quote-quality');
    const infillEl = document.getElementById('quote-infill') || document.getElementById('quote-strength');
    const qtyEl = document.getElementById('quote-quantity');
    const shipEl = document.getElementById('quote-shipping-country');

    const quality = qualEl ? qualEl.value : 'standard';
    const infillVal = infillEl ? infillEl.value : '30';
    const quantity = qtyEl ? Math.max(1, parseInt(qtyEl.value) || 1) : 1;
    const country = shipEl ? shipEl.value : 'Portugal';

    // Pricing rates per gram based on filament type (includes spool handling & purge waste)
    let gramPrice = 0.10;
    if (material.includes('PETG')) gramPrice = 0.12;
    else if (material.includes('TPU')) gramPrice = 0.20;
    else if (material.includes('ABS')) gramPrice = 0.15;
    else if (material.includes('CF') || material.includes('Nylon')) gramPrice = 0.28;

    // Infill multiplier
    let infillFactor = 1.0;
    if (infillVal.includes('15') || infillVal === '15') infillFactor = 0.55;
    else if (infillVal.includes('60') || infillVal === '60') infillFactor = 1.50;
    else if (infillVal.includes('100') || infillVal === '100') infillFactor = 2.20;

    // Quality multiplier (finer layers take longer machine time)
    let qualFactor = 1.0;
    if (quality === 'fine' || quality.includes('0.1')) qualFactor = 1.60;
    else if (quality === 'draft' || quality.includes('0.3')) qualFactor = 0.75;

    // Dynamic Telemetry: use actual parsed geometry telemetry
    const volCm3 = this.currentTelemetry?.volumeCm3 || 30.0;
    const heightZ = this.currentTelemetry?.z || (this.currentTelemetry?.y || 30.0);
    const rawGrams = this.currentTelemetry?.weightGrams || Math.max(1, Math.round(volCm3 * 1.24 * 0.45));
    const adjustedGrams = Math.max(0.5, +(rawGrams * infillFactor).toFixed(1));

    // Dynamic Material Cost (base €0.50 minimum to cover nozzle purge line & spool setup)
    const unitMaterialCost = Math.max(0.50, +(0.35 + (adjustedGrams * gramPrice)).toFixed(2));
    
    // Dynamic Machine Print Duration (minutes) & Cost
    const printMinutes = Math.max(8, Math.round((adjustedGrams * 2.5 * qualFactor) + (heightZ * 0.3)));
    const unitMachineCost = Math.max(0.40, +((printMinutes / 60) * 3.20).toFixed(2));

    // Base Prep & QA Calibration (scales gently with object scale)
    const basePrep = Math.max(0.80, +(0.50 + Math.min(2.50, rawGrams * 0.03)).toFixed(2));

    // CAD Design Fee (if customer requested design from scratch)
    const designFee = this.hasModel ? 0.00 : 25.00;

    // Unit Subtotal before volume discount
    const unitSubtotal = +(unitMaterialCost + unitMachineCost + basePrep).toFixed(2);
    const totalRaw = (unitSubtotal * quantity) + designFee;

    // Volume Discount Tiers
    let discountPercent = 0;
    if (quantity >= 100) discountPercent = 40;
    else if (quantity >= 50) discountPercent = 30;
    else if (quantity >= 25) discountPercent = 20;
    else if (quantity >= 10) discountPercent = 12;
    else if (quantity >= 5) discountPercent = 6;

    const discountAmount = +(totalRaw * (discountPercent / 100)).toFixed(2);
    const subtotalDiscounted = +(totalRaw - discountAmount).toFixed(2);

    // Shipping Cost
    let shippingCost = this.pricingModel.shippingRates[country] || 4.50;
    if (subtotalDiscounted >= 50.00 && country === 'Portugal') {
      shippingCost = 0.00; // Free shipping over €50 in Portugal
    }

    const finalTotal = +(subtotalDiscounted + shippingCost).toFixed(2);

    // Update Live Price Breakdown UI
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    
    setTxt('calc-unit-price', `€${unitSubtotal.toFixed(2)}`);
    setTxt('calc-quantity-multiplier', `× ${quantity}`);
    setTxt('calc-shipping-amount', shippingCost === 0.00 ? 'FREE' : `€${shippingCost.toFixed(2)}`);
    setTxt('calc-total-amount', `€${finalTotal.toFixed(2)}`);

    setTxt('price-material', `€${(unitMaterialCost * quantity).toFixed(2)}`);
    setTxt('price-time', `€${(unitMachineCost * quantity).toFixed(2)}`);
    setTxt('price-post', `€${(basePrep * quantity).toFixed(2)}`);
    setTxt('price-qty-label', `${quantity}`);
    setTxt('price-qty', `€${(unitSubtotal * quantity).toFixed(2)}`);
    setTxt('price-shipping', shippingCost === 0.00 ? 'FREE' : `€${shippingCost.toFixed(2)}`);
    setTxt('price-total', `€${finalTotal.toFixed(2)}`);

    const priceDiscountEl = document.getElementById('calc-discount-row');
    const priceDiscountVal = document.getElementById('calc-discount-amount');
    const batchBadge = document.getElementById('batch-discount-badge');

    if (discountPercent > 0) {
      if (priceDiscountEl) priceDiscountEl.classList.remove('hidden');
      if (priceDiscountVal) priceDiscountVal.textContent = `-€${discountAmount.toFixed(2)} (${discountPercent}% Batch)`;
      if (batchBadge) {
        batchBadge.classList.remove('hidden');
        batchBadge.textContent = `${discountPercent}% BATCH SAVINGS`;
      }
    } else {
      if (priceDiscountEl) priceDiscountEl.classList.add('hidden');
      if (batchBadge) batchBadge.classList.add('hidden');
    }

    this.calculatedBreakdown = {
      unitPrice: unitSubtotal,
      materialCost: unitMaterialCost * quantity,
      machineCost: unitMachineCost * quantity,
      designCost: designFee,
      shippingCost: shippingCost,
      discount: discountAmount,
      discountPercent: discountPercent,
      subtotal: totalRaw,
      finalPrice: finalTotal
    };
  }

  setupFormSubmission() {
    const form = document.getElementById('quote-request-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Quote';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating Quote...
        `;
      }

      const payload = {
        customerName: document.getElementById('quote-name')?.value || 'Anonymous',
        email: document.getElementById('quote-email')?.value || '',
        phone: document.getElementById('quote-phone')?.value || '',
        company: document.getElementById('quote-company')?.value || '',
        projectName: document.getElementById('quote-project-name')?.value || 'Custom 3D Print Request',
        description: document.getElementById('quote-description')?.value || '',
        hasModel: this.hasModel,
        files: this.uploadedFiles.length > 0 ? this.uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          dimensions: { x: this.currentTelemetry.x, y: this.currentTelemetry.y, z: this.currentTelemetry.z },
          volumeCm3: this.currentTelemetry.volumeCm3
        })) : [{
          name: 'project_spec.stl',
          size: '1.8 MB',
          dimensions: { x: this.currentTelemetry.x, y: this.currentTelemetry.y, z: this.currentTelemetry.z },
          volumeCm3: this.currentTelemetry.volumeCm3
        }],
        material: document.getElementById('quote-material')?.value || 'PETG',
        color: document.getElementById('quote-selected-color')?.value || 'Matte Black',
        quality: document.getElementById('quote-quality')?.value || 'Standard (0.20mm)',
        strength: document.getElementById('quote-strength')?.value || 'Standard (30% Infill)',
        quantity: parseInt(document.getElementById('quote-quantity')?.value) || 1,
        turnaround: document.getElementById('quote-turnaround')?.value || 'Standard (3-5 Days)',
        deadline: document.getElementById('quote-deadline')?.value || '',
        shippingCountry: document.getElementById('quote-shipping-country')?.value || 'Portugal',
        isConfidential: document.getElementById('quote-confidential')?.checked || false,
        customerNotes: document.getElementById('quote-notes')?.value || '',
        pricing: this.calculatedBreakdown || {}
      };

      try {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          this.showQuoteSuccessModal(data.quote || payload, data.quoteId || 'LS-1048');
          form.reset();
          this.uploadedFiles = [];
          const listEl = document.getElementById('uploaded-files-list');
          if (listEl) listEl.innerHTML = '';
        } else {
          window.LayerStudiosApp && window.LayerStudiosApp.showToast('Could not submit quote: ' + (data.error || 'Server error'), 'error');
        }
      } catch (err) {
        console.error('Quote submission error:', err);
        // Fallback local quote ID for offline demonstration
        const fallbackId = `LS-${Math.floor(1000 + Math.random() * 9000)}`;
        this.showQuoteSuccessModal(payload, fallbackId);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  showQuoteSuccessModal(quote, quoteId) {
    const modal = document.getElementById('quote-success-modal');
    if (!modal) return;

    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setTxt('modal-quote-id', quoteId);
    setTxt('quote-order-id', `Reference: ${quoteId}`);
    setTxt('modal-quote-project', quote.projectName || 'Custom 3D Print Request');
    setTxt('modal-quote-material', `${quote.material || 'PETG'} (${quote.color || 'Black'})`);
    setTxt('modal-quote-qty', `${quote.quantity || 1} units`);
    setTxt('modal-quote-total', `€${(quote.pricing?.finalPrice || 40.50).toFixed(2)}`);

    const trackBtn = document.getElementById('modal-quote-track-btn');
    if (trackBtn) {
      trackBtn.onclick = () => {
        modal.classList.add('hidden');
        window.location.href = `/track?id=${quoteId}`;
      };
    }

    modal.classList.remove('hidden');
  }
}

window.LayerStudiosQuoteEngine = LayerStudiosQuoteEngine;
window.LayerStudiosQuote = LayerStudiosQuoteEngine;
