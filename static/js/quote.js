/**
 * Layer Studios - Instant & Request Quote Engine (v2.4)
 * Handles dual-path workflow (Existing 3D model vs CAD design request),
 * drag-and-drop STL/3MF ingestion, WebGL 3D telemetry & slicer preview,
 * color swatches, batch quantity discounts, and Neon PostgreSQL + Resend integration.
 */

class LayerStudiosQuoteEngine {
  constructor() {
    this.viewer = null;
    this.uploadedFiles = [];
    this.hasModel = true;
    this.pricingModel = {
      baseSetup: 4.00,
      shippingRates: {
        'Portugal': 4.50,
        'Portugal Islands': 6.90,
        'European Union': 9.90,
        'International': 18.00
      }
    };

    this.currentTelemetry = null;
    this.init();
  }

  init() {
    this.prefillAuthenticatedUser();
    this.setupPathSwitchers();
    this.setupDropzone();
    this.setupInteractiveControls();
    this.setupDynamicRecalculation();
    this.setupFormSubmission();
    this.initQuoteViewer();
    this.recalculateQuote();

    if (window.LayerStudiosAnalytics) {
      window.LayerStudiosAnalytics.trackQuotePageViewed();
    }
  }

  prefillAuthenticatedUser() {
    try {
      const saved = localStorage.getItem('ls_customer_user');
      if (!saved) return;
      const user = JSON.parse(saved);
      const nameEl = document.getElementById('quote-name');
      const emailEl = document.getElementById('quote-email');
      const phoneEl = document.getElementById('quote-phone');
      if (nameEl && !nameEl.value && user.name) nameEl.value = user.name;
      if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;
      if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;
    } catch (e) {}
  }

  initQuoteViewer() {
    const canvas = document.getElementById('quote-3d-canvas');
    if (!canvas) return;

    this.viewer = new LayerStudiosViewer('quote-3d-canvas', {
      autoRotate: true,
      initialMaterial: 'cyan',
      showGrid: true,
      showBuildCage: true,
      showAxes: false,
      gridSize: 256,
      buildHeight: 256,
      onTelemetryUpdate: (telemetry) => {
        this.currentTelemetry = telemetry;
        this.updateTelemetryUI(telemetry);
        this.recalculateQuote();
        const lc = document.getElementById('quote-layer-count');
        if (lc) lc.textContent = `~${telemetry.layerCount} camadas @ 0.20mm`;
      },
      onFitResult: (r) => {
        const badge = document.getElementById('quote-fit-badge');
        if (!badge) return;
        badge.classList.remove('hidden');
        if (r.fits) {
          badge.className = 'absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-sm border bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
          badge.innerHTML = `<span>✓ Cabe na Mesa</span><span class="text-emerald-500">${Math.max(r.pctX, r.pctY, r.pctZ)}%</span>`;
        } else {
          badge.className = 'absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-sm border bg-red-950/80 text-red-400 border-red-500/40';
          badge.innerHTML = `<span>⚠ Excede 256mm (Corte multi-peça)</span>`;
        }
      }
    });

    // Load default demo geometry on start so the 3D viewer looks alive immediately
    if (this.viewer && typeof this.viewer.loadDefaultPart === 'function') {
      this.viewer.loadDefaultPart();
      // Keep currentTelemetry null until user uploads their own file so price starts clean
      this.currentTelemetry = null;
      this.updateTelemetryUI(null);
      const lc = document.getElementById('quote-layer-count');
      if (lc) lc.textContent = 'Peça de demonstração (carregue o seu STL)';
    }
  }

  setupInteractiveControls() {
    // 1. 3D Viewer Toolbar Buttons
    const rotateBtn = document.getElementById('btn-3d-rotate');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        if (!this.viewer) return;
        const active = this.viewer.toggleAutoRotate();
        rotateBtn.className = active
          ? 'px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] transition-colors'
          : 'px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] transition-colors';
      });
    }

    const wireBtn = document.getElementById('btn-3d-wireframe');
    if (wireBtn) {
      wireBtn.addEventListener('click', () => {
        if (!this.viewer) return;
        const nextState = !this.viewer.isWireframe;
        this.viewer.setWireframe(nextState);
        wireBtn.className = nextState
          ? 'px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] transition-colors'
          : 'px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] transition-colors';
      });
    }

    const resetBtn = document.getElementById('btn-3d-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.viewer && typeof this.viewer.resetCamera === 'function') {
          this.viewer.resetCamera();
        }
      });
    }

    const sliceSlider = document.getElementById('quote-slice-slider');
    const sliceVal = document.getElementById('quote-slice-val');
    if (sliceSlider) {
      sliceSlider.addEventListener('input', (e) => {
        const pct = parseInt(e.target.value, 10) || 100;
        if (sliceVal) sliceVal.textContent = `${pct}%`;
        if (this.viewer) this.viewer.setSliceHeight(pct);
      });
    }

    // 2. Quantity Preset Pills
    const qtyInput = document.getElementById('quote-quantity');
    const qtyBtns = document.querySelectorAll('.qty-preset-btn');
    qtyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-qty-preset'), 10) || 1;
        if (qtyInput) qtyInput.value = val;
        qtyBtns.forEach(b => {
          b.classList.remove('border-blue-500/50', 'text-white');
          b.classList.add('border-slate-800', 'text-slate-300');
        });
        btn.classList.remove('border-slate-800', 'text-slate-300');
        btn.classList.add('border-blue-500/50', 'text-white');
        this.recalculateQuote();
      });
    });

    // 3. Color Swatch Buttons
    const colorInput = document.getElementById('quote-color');
    const swatches = document.querySelectorAll('.color-swatch-btn');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const colorName = swatch.getAttribute('data-color-name') || 'Preto Matte';
        const colorHex = swatch.getAttribute('data-color-hex') || '#2563eb';
        if (colorInput) colorInput.value = colorName;
        swatches.forEach(s => s.classList.remove('border-2', 'border-blue-400', 'ring-2', 'ring-blue-500/30'));
        swatch.classList.add('border-2', 'border-blue-400', 'ring-2', 'ring-blue-500/30');
        if (this.viewer && typeof this.viewer.setCustomColor === 'function') {
          this.viewer.setCustomColor(colorHex);
        }
        this.recalculateQuote();
      });
    });
  }

  setupPathSwitchers() {
    const btnHaveModel = document.getElementById('tab-have-model');
    const btnNeedDesign = document.getElementById('tab-need-design');
    const uploadAreaModel = document.getElementById('upload-area-model');
    const uploadAreaDesign = document.getElementById('upload-area-design');

    if (btnHaveModel && btnNeedDesign) {
      btnHaveModel.addEventListener('click', () => {
        this.hasModel = true;
        btnHaveModel.classList.add('bg-blue-500', 'text-white');
        btnHaveModel.classList.remove('text-slate-400');
        btnNeedDesign.classList.remove('bg-blue-500', 'text-white');
        btnNeedDesign.classList.add('text-slate-400');
        if (uploadAreaModel) uploadAreaModel.classList.remove('hidden');
        if (uploadAreaDesign) uploadAreaDesign.classList.add('hidden');
        this.recalculateQuote();
      });

      btnNeedDesign.addEventListener('click', () => {
        this.hasModel = false;
        btnNeedDesign.classList.add('bg-blue-500', 'text-white');
        btnNeedDesign.classList.remove('text-slate-400');
        btnHaveModel.classList.remove('bg-blue-500', 'text-white');
        btnHaveModel.classList.add('text-slate-400');
        if (uploadAreaModel) uploadAreaModel.classList.add('hidden');
        if (uploadAreaDesign) uploadAreaDesign.classList.remove('hidden');
        this.recalculateQuote();

        if (window.LayerStudiosAnalytics) {
          window.LayerStudiosAnalytics.trackDesignHelpRequested();
          window.LayerStudiosAnalytics.trackQuoteStarted('design_help');
        }
      });
    }
  }

  setupDropzone() {
    const dropzone = document.getElementById('quote-dropzone');
    const fileInput = document.getElementById('quote-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-400', 'bg-blue-500/5');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-400', 'bg-blue-500/5');
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
        fileInput.value = '';
      }
    });
  }

  handleFiles(fileList) {
    const fileListContainer = document.getElementById('uploaded-files-list');
    if (!fileListContainer) return;

    if (window.LayerStudiosAnalytics) {
      window.LayerStudiosAnalytics.trackQuoteStarted('file_upload');
    }

    Array.from(fileList).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['stl', 'step', 'stp', '3mf', 'obj', 'zip', 'pdf', 'png', 'jpg', 'jpeg'];
      
      if (!validExtensions.includes(ext)) {
        this.showToast(`Formato não suportado: .${ext}. Use STL, 3MF, STEP, OBJ ou PDF.`, 'warning');
        return;
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileRecord = {
        name: file.name,
        size: `${sizeMB} MB`,
        rawBytes: file.size,
        extension: ext,
        fileObject: file
      };

      this.uploadedFiles.push(fileRecord);

      // Auto-populate project name if empty
      const projInput = document.getElementById('quote-project-name');
      if (projInput && !projInput.value.trim()) {
        projInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      }

      const is3D = ['stl', '3mf', 'step', 'stp', 'obj'].includes(ext);
      if (window.LayerStudiosAnalytics) {
        window.LayerStudiosAnalytics.trackModelUploaded(ext, is3D ? '3d_model' : 'reference_file');
      }

      const badge = document.createElement('div');
      badge.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm animate-fade-in';
      badge.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs uppercase font-bold flex-shrink-0">
            ${ext}
          </div>
          <div class="truncate">
            <p class="font-semibold text-white truncate text-xs">${file.name}</p>
            <p class="text-[11px] text-slate-400 font-mono">${sizeMB} MB</p>
          </div>
        </div>
        <button type="button" class="text-slate-500 hover:text-red-400 p-1.5 transition-colors" title="Remover ficheiro">
          ✕
        </button>
      `;

      badge.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name);
        badge.remove();
        if (this.uploadedFiles.length === 0) {
          this.currentTelemetry = null;
        }
        this.recalculateQuote();
      });

      fileListContainer.appendChild(badge);

      // Load 3D files into the WebGL viewer
      if (ext === 'stl') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (this.viewer) {
            this.viewer.loadSTLFromArrayBuffer(evt.target.result);
            this.showToast(`Modelo 3D "${file.name}" analisado com sucesso!`, 'success');
            if (window.LayerStudiosAnalytics) {
              window.LayerStudiosAnalytics.trackModelPreviewLoaded(document.querySelector('input[name="quote-material"]:checked')?.value || 'PETG');
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (ext === '3mf') {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            if (typeof JSZip === 'undefined') {
              this.setFallbackTelemetryForCADFile(file);
              return;
            }
            const zip = await JSZip.loadAsync(evt.target.result);
            const modelEntry = zip.file('3D/3dmodel.model') ||
                               (zip.file(/\.model$/i).length > 0 ? zip.file(/\.model$/i)[0] : null);
            if (modelEntry) {
              const xmlText = await modelEntry.async('string');
              const geometry = this.parse3MFModelXML(xmlText);
              if (geometry && this.viewer) {
                this.viewer.setGeometry(geometry);
                this.showToast(`Modelo 3MF "${file.name}" carregado!`, 'success');
                if (window.LayerStudiosAnalytics) {
                  window.LayerStudiosAnalytics.trackModelPreviewLoaded(document.querySelector('input[name="quote-material"]:checked')?.value || 'PETG');
                }
              } else {
                this.setFallbackTelemetryForCADFile(file);
              }
            } else {
              this.setFallbackTelemetryForCADFile(file);
            }
          } catch (err) {
            this.setFallbackTelemetryForCADFile(file);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // STEP / OBJ / ZIP / PDF — set estimated telemetry so user still gets an instant baseline quote
        this.setFallbackTelemetryForCADFile(file);
        this.showToast(`Ficheiro "${file.name}" anexado para validação técnica.`, 'info');
      }
    });

    this.recalculateQuote();
  }

  setFallbackTelemetryForCADFile(file) {
    const estVol = Math.max(12, Math.min(180, Math.round((file.size || 250000) / 18000)));
    const estGrams = Math.max(8, Math.round(estVol * 0.55));
    this.currentTelemetry = {
      x: 65, y: 45, z: 35,
      dimensionsStr: 'Análise CAD STEP/OBJ',
      volumeCm3: estVol,
      weightGrams: estGrams,
      estimatedDuration: '1h 15m',
      layerCount: 175
    };
    this.updateTelemetryUI(this.currentTelemetry);
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
      return null;
    }
  }

  updateTelemetryUI(telemetry) {
    const dimEl = document.getElementById('telemetry-dimensions');
    const volEl = document.getElementById('telemetry-volume');
    const weightEl = document.getElementById('telemetry-weight');
    const timeEl = document.getElementById('telemetry-time');

    if (!telemetry) {
      if (dimEl) dimEl.textContent = '—';
      if (volEl) volEl.textContent = '— cm³';
      if (weightEl) weightEl.textContent = '— g';
      if (timeEl) timeEl.textContent = '—';
      return;
    }

    if (dimEl) dimEl.textContent = telemetry.dimensionsStr || `${telemetry.x} × ${telemetry.y} × ${telemetry.z} mm`;
    if (volEl) volEl.textContent = `${telemetry.volumeCm3} cm³`;
    if (weightEl) weightEl.textContent = `~${telemetry.weightGrams} g`;
    if (timeEl) timeEl.textContent = telemetry.estimatedDuration || '—';
  }

  setupDynamicRecalculation() {
    const ids = [
      'quote-quality',
      'quote-infill',
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
    const material = selectedMatRadio ? selectedMatRadio.value : 'PLA+';

    const qualEl = document.getElementById('quote-quality');
    const infillEl = document.getElementById('quote-infill');
    const turnEl = document.getElementById('quote-turnaround');
    const qtyEl = document.getElementById('quote-quantity');
    const shipEl = document.getElementById('quote-shipping-country');

    const quality = qualEl ? qualEl.value : 'Padrão (0.20mm)';
    const infillVal = infillEl ? infillEl.value : '30% (Funcional Padrão)';
    const turnaround = turnEl ? turnEl.value : 'Standard (2-4 Dias)';
    const quantity = qtyEl ? Math.max(1, parseInt(qtyEl.value, 10) || 1) : 1;
    const country = shipEl ? shipEl.value : 'Portugal';
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

    let shippingCost = this.pricingModel.shippingRates[country] ?? 4.50;

    // STATE 1: User has 3D file option selected, but NO model is uploaded yet
    if (this.hasModel && (!this.uploadedFiles || this.uploadedFiles.length === 0 || !this.currentTelemetry)) {
      this.updateTelemetryUI(null);
      setTxt('price-material', '—');
      setTxt('price-time', '—');
      setTxt('price-post', '—');
      setTxt('price-qty-label', `${quantity}`);
      setTxt('price-qty', '—');
      setTxt('price-shipping', `€${shippingCost.toFixed(2)}`);
      setTxt('price-total', '—');

      const priceDiscountEl = document.getElementById('calc-discount-row');
      const batchBadge = document.getElementById('batch-discount-badge');
      if (priceDiscountEl) priceDiscountEl.classList.add('hidden');
      if (batchBadge) batchBadge.classList.add('hidden');

      this.calculatedBreakdown = {
        unitPrice: 15.00,
        materialCost: 5.00,
        machineCost: 10.00,
        designCost: 0,
        shippingCost: shippingCost,
        discount: 0,
        discountPercent: 0,
        subtotal: 15.00,
        finalPrice: +(15.00 + shippingCost).toFixed(2)
      };
      return;
    }

    // STATE 2: User chose "Preciso de desenho CAD" (CAD service)
    if (!this.hasModel) {
      const designFee = 25.00;
      const totalRaw = +(designFee * quantity).toFixed(2);
      if (totalRaw >= 50.00 && country === 'Portugal') shippingCost = 0.00;
      const finalTotal = +(totalRaw + shippingCost).toFixed(2);

      setTxt('telemetry-dimensions', 'Modelação CAD 3D');
      setTxt('telemetry-volume', 'Sob Medida');
      setTxt('telemetry-weight', 'A definir');
      setTxt('telemetry-time', '24–48h Desenho');
      setTxt('quote-layer-count', 'Modelação CAD 3D pela equipa Layer Studios');

      setTxt('price-material', 'Incluído');
      setTxt('price-time', `€${totalRaw.toFixed(2)} (CAD)`);
      setTxt('price-post', 'Incluído');
      setTxt('price-qty-label', `${quantity}`);
      setTxt('price-qty', `€${totalRaw.toFixed(2)}`);
      setTxt('price-shipping', shippingCost === 0 ? 'GRÁTIS' : `€${shippingCost.toFixed(2)}`);
      setTxt('price-total', `€${finalTotal.toFixed(2)}`);

      this.calculatedBreakdown = {
        unitPrice: designFee,
        materialCost: 0,
        machineCost: 0,
        designCost: totalRaw,
        shippingCost: shippingCost,
        discount: 0,
        discountPercent: 0,
        subtotal: totalRaw,
        finalPrice: finalTotal
      };
      return;
    }

    // STATE 3: Model is loaded -> Real geometric calculation
    let gramPrice = 0.09;
    if (material.includes('PETG')) gramPrice = 0.11;
    else if (material.includes('TPU')) gramPrice = 0.18;
    else if (material.includes('ABS')) gramPrice = 0.14;
    else if (material.includes('CF') || material.includes('Nylon')) gramPrice = 0.26;

    let infillFactor = 1.0;
    if (infillVal.includes('15')) infillFactor = 0.65;
    else if (infillVal.includes('60')) infillFactor = 1.45;
    else if (infillVal.includes('100')) infillFactor = 2.10;

    let qualFactor = 1.0;
    if (quality.includes('0.12') || quality === 'fine') qualFactor = 1.55;
    else if (quality.includes('0.28') || quality === 'draft') qualFactor = 0.78;

    const urgencyMultiplier = turnaround.includes('Expresso') ? 1.25 : 1.0;

    const volCm3 = this.currentTelemetry?.volumeCm3 || 25.0;
    const heightZ = this.currentTelemetry?.z || (this.currentTelemetry?.y || 25.0);
    const rawGrams = this.currentTelemetry?.weightGrams || Math.max(2, Math.round(volCm3 * 1.24 * 0.45));
    const adjustedGrams = Math.max(1.0, +(rawGrams * infillFactor).toFixed(1));

    const unitMaterialCost = Math.max(1.20, +(0.50 + (adjustedGrams * gramPrice)).toFixed(2));
    const printMinutes = Math.max(12, Math.round((adjustedGrams * 2.4 * qualFactor) + (heightZ * 0.35)));
    const unitMachineCost = Math.max(1.50, +((printMinutes / 60) * 3.50 * urgencyMultiplier).toFixed(2));
    const basePrep = Math.max(1.00, +(0.80 + Math.min(2.50, rawGrams * 0.03)).toFixed(2));

    const unitSubtotal = +(unitMaterialCost + unitMachineCost + basePrep).toFixed(2);
    const totalRaw = +(unitSubtotal * quantity).toFixed(2);

    let discountPercent = 0;
    if (quantity >= 100) discountPercent = 35;
    else if (quantity >= 50) discountPercent = 30;
    else if (quantity >= 25) discountPercent = 20;
    else if (quantity >= 10) discountPercent = 12;
    else if (quantity >= 5) discountPercent = 6;

    const discountAmount = +(totalRaw * (discountPercent / 100)).toFixed(2);
    // Minimum order subtotal €9.50
    const subtotalDiscounted = Math.max(9.50, +(totalRaw - discountAmount).toFixed(2));

    if (subtotalDiscounted >= 50.00 && country === 'Portugal') {
      shippingCost = 0.00;
    }

    const finalTotal = +(subtotalDiscounted + shippingCost).toFixed(2);

    setTxt('price-material', `€${(unitMaterialCost * quantity).toFixed(2)}`);
    setTxt('price-time', `€${(unitMachineCost * quantity).toFixed(2)}`);
    setTxt('price-post', `€${(basePrep * quantity).toFixed(2)}`);
    setTxt('price-qty-label', `${quantity}`);
    setTxt('price-qty', `€${subtotalDiscounted.toFixed(2)}`);
    setTxt('price-shipping', shippingCost === 0.00 ? 'GRÁTIS' : `€${shippingCost.toFixed(2)}`);
    setTxt('price-total', `€${finalTotal.toFixed(2)}`);

    const priceDiscountEl = document.getElementById('calc-discount-row');
    const priceDiscountVal = document.getElementById('calc-discount-amount');
    const batchBadge = document.getElementById('batch-discount-badge');

    if (discountPercent > 0) {
      if (priceDiscountEl) priceDiscountEl.classList.remove('hidden');
      if (priceDiscountVal) priceDiscountVal.textContent = `-€${discountAmount.toFixed(2)} (-${discountPercent}%)`;
      if (batchBadge) {
        batchBadge.classList.remove('hidden');
        batchBadge.textContent = `POUPANÇA LOTE -${discountPercent}%`;
      }
    } else {
      if (priceDiscountEl) priceDiscountEl.classList.add('hidden');
      if (batchBadge) batchBadge.classList.add('hidden');
    }

    this.calculatedBreakdown = {
      unitPrice: unitSubtotal,
      materialCost: +(unitMaterialCost * quantity).toFixed(2),
      machineCost: +(unitMachineCost * quantity).toFixed(2),
      designCost: 0,
      shippingCost: shippingCost,
      discount: discountAmount,
      discountPercent: discountPercent,
      subtotal: subtotalDiscounted,
      finalPrice: finalTotal
    };
  }

  setupFormSubmission() {
    const form = document.getElementById('quote-request-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (this.hasModel && (!this.uploadedFiles || this.uploadedFiles.length === 0)) {
        this.showToast('Por favor carregue o seu ficheiro 3D (STL/3MF/STEP) ou selecione "Preciso de desenho CAD".', 'warning');
        return;
      }

      const submitBtn = document.querySelector('button[form="quote-request-form"]') || form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Enviar Pedido de Orçamento →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'A processar e enviar ficheiros 3D...';
      }

      const filesToUpload = [...(this.uploadedFiles || [])];
      const filesMetadata = filesToUpload.length > 0
        ? filesToUpload.map(f => ({
            name: f.name,
            size: typeof f.size === 'string' && f.size.includes('MB') ? f.size : `${((f.rawBytes || 1048576) / (1024 * 1024)).toFixed(2)} MB`,
            dimensions: { x: this.currentTelemetry?.x || 45, y: this.currentTelemetry?.y || 35, z: this.currentTelemetry?.z || 25 },
            volumeCm3: this.currentTelemetry?.volumeCm3 || 25.0
          }))
        : [{
            name: 'pedido_cad_2d_3d.pdf',
            size: '0.50 MB',
            dimensions: { x: 50, y: 50, z: 50 },
            volumeCm3: 25.0
          }];

      const selectedMatRadio = document.querySelector('input[name="quote-material"]:checked');
      const selectedMaterial = selectedMatRadio ? selectedMatRadio.value : (document.getElementById('quote-material')?.value || 'PLA+');

      const defaultProjName = filesToUpload.length > 0
        ? filesToUpload[0].name.replace(/\.[^.]+$/, '')
        : 'Modelação CAD & Impressão 3D';

      const payload = {
        customerName: document.getElementById('quote-name')?.value.trim() || 'Cliente Layer Studios',
        email: document.getElementById('quote-email')?.value.trim() || '',
        phone: document.getElementById('quote-phone')?.value.trim() || '',
        company: document.getElementById('quote-company')?.value.trim() || '',
        projectName: document.getElementById('quote-project-name')?.value.trim() || defaultProjName,
        description: document.getElementById('quote-description')?.value.trim() || '',
        hasModel: this.hasModel,
        files: filesMetadata,
        material: selectedMaterial,
        color: document.getElementById('quote-color')?.value.trim() || 'Preto Matte',
        quality: document.getElementById('quote-quality')?.value || 'Padrão (0.20mm)',
        strength: document.getElementById('quote-infill')?.value || '30% (Funcional Padrão)',
        quantity: Math.max(1, parseInt(document.getElementById('quote-quantity')?.value, 10) || 1),
        turnaround: document.getElementById('quote-turnaround')?.value || 'Standard (2-4 Dias)',
        shippingCountry: document.getElementById('quote-shipping-country')?.value || 'Portugal',
        isConfidential: document.getElementById('quote-confidential')?.checked || false,
        customerNotes: document.getElementById('quote-notes')?.value.trim() || '',
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
          const quoteId = data.quoteId || 'LS-Q-1048';

          if (window.LayerStudiosAnalytics) {
            window.LayerStudiosAnalytics.trackQuoteSubmitted(quoteId, {
              material: payload.material,
              quantity: payload.quantity,
              hasModel: payload.hasModel,
              estimatedPrice: payload.pricing?.finalPrice
            });
          }

          // Upload actual binary CAD files and wait for completion so Neon PostgreSQL stores the CAD blob
          if (filesToUpload.length > 0) {
            for (const file of filesToUpload) {
              if (!file.fileObject) continue;
              try {
                const formData = new FormData();
                formData.append('file', file.fileObject);
                formData.append('quoteId', quoteId);
                await fetch('/api/upload-file', { method: 'POST', body: formData });
              } catch (uploadErr) {
                console.warn('File upload warning:', uploadErr);
              }
            }
          }

          this.showQuoteSuccessModal(data.quote || payload, quoteId);
          form.reset();
          this.uploadedFiles = [];
          this.currentTelemetry = null;
          const listEl = document.getElementById('uploaded-files-list');
          if (listEl) listEl.innerHTML = '';
          this.recalculateQuote();
        } else {
          this.showToast('Erro ao submeter orçamento: ' + (data.error || 'Erro no servidor'), 'error');
        }
      } catch (err) {
        console.error('Quote submission error:', err);
        this.showToast('Erro de ligação. Verifique a sua internet e tente novamente.', 'error');
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

    const finalP = Number(quote.pricing?.finalPrice ?? quote.final_price ?? 24.50);
    const idEl = document.getElementById('quote-order-id');
    if (idEl) {
      idEl.textContent = `Referência: ${quoteId} • Estimativa: €${finalP.toFixed(2)}`;
    }

    const trackBtn = document.getElementById('modal-quote-track-btn');
    if (trackBtn) {
      trackBtn.href = `/track?id=${encodeURIComponent(quoteId)}`;
    }

    modal.classList.remove('hidden');
  }
}

window.LayerStudiosQuoteEngine = LayerStudiosQuoteEngine;
window.LayerStudiosQuote = LayerStudiosQuoteEngine;
