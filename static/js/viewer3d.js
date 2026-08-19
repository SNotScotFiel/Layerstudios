/**
 * Layer Studios - Three.js WebGL 3D Model Viewer & STL/3MF Parser
 * Build Volume: 256 × 256 × 256 mm (Bambu Lab / Prusa-class)
 * Features:
 *  - 256x256 build plate grid with correct scale
 *  - Wireframe build-volume cage (256³ mm boundary)
 *  - Fit-on-plate validation (green/red/orange)
 *  - XYZ axis helper
 *  - Auto-rotate toggle
 *  - Layer slicer clip plane
 *  - Binary & ASCII STL parser
 *  - 3MF geometry loading (via quote.js parse3MFModelXML)
 *  - Geometry telemetry (dimensions, volume, weight, print time)
 */

const LS_BUILD = { x: 256, y: 256, z: 256 }; // mm — Layer Studios printer build volume

class LayerStudiosViewer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.options = Object.assign({
      autoRotate: true,
      showGrid: true,
      showBuildCage: true,
      showAxes: false,
      gridSize: LS_BUILD.x,          // 256 mm
      buildHeight: LS_BUILD.z,       // 256 mm
      initialMaterial: 'cyan',
      enableSlicing: true,
      onTelemetryUpdate: null,
      onFitResult: null              // callback(fits: bool, percent: {x,y,z})
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentMesh = null;
    this.buildCage = null;
    this.axesHelper = null;
    this.clipPlane = null;
    this.isWireframe = false;
    this.materialPreset = this.options.initialMaterial;
    this.currentGeometry = null; // { boundingBox }

    this.init();
  }

  /* ─────────────────────── INIT ─────────────────────── */

  init() {
    const parent = this.canvas.parentElement;
    const width  = parent ? parent.clientWidth  : 500;
    const height = parent ? parent.clientHeight : 400;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(300, 260, 360);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;

    // Orbit Controls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 1200;
      this.controls.minDistance = 30;
      this.controls.autoRotate = this.options.autoRotate;
      this.controls.autoRotateSpeed = 1.2;
      // Target center of build plate
      this.controls.target.set(0, 40, 0);
      this.controls.update();
    }

    this.setupLighting();

    if (this.options.showGrid) this.setupBuildPlate();
    if (this.options.showBuildCage) this.setupBuildCage();
    if (this.options.showAxes) this.setupAxes();

    // Clipping plane for slicer (normal points down, constant = Y cutoff)
    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), LS_BUILD.z + 10);

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    const key = new THREE.DirectionalLight(0x60a5fa, 1.1); // soft blue key
    key.position.set(200, 300, 160);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x818cf8, 0.5); // indigo fill
    fill.position.set(-200, 150, -120);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x3b82f6, 0.3); // blue rim
    rim.position.set(0, -80, 120);
    this.scene.add(rim);
  }

  setupBuildPlate() {
    const S = this.options.gridSize; // 256
    const DIV = 16; // 16mm per cell → 16 cells per 256mm

    // Grid lines
    const grid = new THREE.GridHelper(S, DIV, 0x3b82f6, 0x1c1c1f);
    grid.position.y = 0;
    this.scene.add(grid);

    // Plate surface
    const plateGeo = new THREE.BoxGeometry(S, 1.5, S);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x111117, roughness: 0.9, metalness: 0.15 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.75;
    plate.receiveShadow = true;
    this.scene.add(plate);
  }

  setupBuildCage() {
    // Wireframe box showing the exact 256×256×256 mm print envelope
    const W = LS_BUILD.x, H = LS_BUILD.z, D = LS_BUILD.y;
    const geo = new THREE.BoxGeometry(W, H, D);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    this.buildCage = new THREE.Mesh(geo, mat);
    this.buildCage.position.set(0, H / 2, 0);
    this.scene.add(this.buildCage);

    // Solid edge lines for clarity
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.copy(this.buildCage.position);
    this.scene.add(edges);
  }

  setupAxes() {
    // XYZ axis helper — 60mm long arrows
    this.axesHelper = new THREE.AxesHelper(60);
    this.axesHelper.position.set(-LS_BUILD.x / 2, 0, -LS_BUILD.y / 2);
    this.scene.add(this.axesHelper);
  }

  toggleAxes() {
    if (!this.scene) return;
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper);
      this.axesHelper = null;
    } else {
      this.setupAxes();
    }
  }

  toggleAutoRotate() {
    if (this.controls) {
      this.controls.autoRotate = !this.controls.autoRotate;
      return this.controls.autoRotate;
    }
    return false;
  }

  /* ─────────────────────── MATERIALS ─────────────────────── */

  getMaterial(preset = this.materialPreset) {
    const cp = this.options.enableSlicing ? [this.clipPlane] : [];
    const base = { clippingPlanes: cp, clipShadows: true, side: THREE.DoubleSide };

    switch (preset) {
      case 'obsidian':
        return new THREE.MeshStandardMaterial({ ...base, color: 0x1e2232, roughness: 0.3, metalness: 0.7 });
      case 'amber': case 'petg':
        return new THREE.MeshPhysicalMaterial({ ...base, color: 0xf97316, roughness: 0.2, metalness: 0.05, transmission: 0.35, transparent: true, opacity: 0.88 });
      case 'tpu':
        return new THREE.MeshStandardMaterial({ ...base, color: 0x64748b, roughness: 0.9, metalness: 0.0 });
      case 'white':
        return new THREE.MeshStandardMaterial({ ...base, color: 0xf0f4f8, roughness: 0.45, metalness: 0.05 });
      case 'red':  // used for "exceeds build volume" warning
        return new THREE.MeshStandardMaterial({ ...base, color: 0xef4444, roughness: 0.3, metalness: 0.2 });
      case 'cyan': default:
        return new THREE.MeshStandardMaterial({ ...base, color: 0x2563eb, roughness: 0.28, metalness: 0.38 });
    }
  }

  setMaterialPreset(preset) {
    this.materialPreset = preset;
    if (!this.currentMesh) return;
    const mat = this.getMaterial(preset);
    this.currentMesh.traverse(child => {
      if (child.isMesh) child.material = mat.clone();
    });
  }

  setWireframe(enabled) {
    this.isWireframe = enabled;
    if (!this.currentMesh) return;
    this.currentMesh.traverse(child => {
      if (child.isMesh) child.material.wireframe = enabled;
    });
  }

  /* ─────────────────────── SLICER ─────────────────────── */

  setSliceHeight(normalizedPercent) {
    if (!this.currentGeometry || !this.currentGeometry.boundingBox) return;
    const bb = this.currentGeometry.boundingBox;
    const totalH = bb.max.y - bb.min.y;
    const targetY = bb.min.y + totalH * (normalizedPercent / 100);
    this.clipPlane.constant = targetY;
  }

  /* ─────────────────────── FIT CHECK ─────────────────────── */

  checkFitInBuildVolume(box) {
    const sX = box.max.x - box.min.x;
    const sY = box.max.y - box.min.y;
    const sZ = box.max.z - box.min.z;

    const fits = sX <= LS_BUILD.x && sY <= LS_BUILD.z && sZ <= LS_BUILD.y;
    const pctX = Math.round(sX / LS_BUILD.x * 100);
    const pctY = Math.round(sY / LS_BUILD.z * 100);
    const pctZ = Math.round(sZ / LS_BUILD.y * 100);

    const result = { fits, sX, sY, sZ, pctX, pctY, pctZ };

    if (this.options.onFitResult) this.options.onFitResult(result);

    // If model exceeds volume, tint it red (but keep the user's preset remembered)
    if (!fits && this.currentMesh) {
      const redMat = this.getMaterial('red');
      this.currentMesh.traverse(child => {
        if (child.isMesh) {
          child.material = redMat.clone();
          child.material.wireframe = this.isWireframe;
        }
      });
    }
    return result;
  }

  /* ─────────────────────── DEFAULT PART ─────────────────────── */

  loadDefaultPart() {
    const group = new THREE.Group();
    const mat = () => this.getMaterial();

    // Base plate (70×50mm with rounded corners, holes, center bore)
    const baseShape = new THREE.Shape();
    const w = 70, l = 50, r = 6;
    baseShape.moveTo(-w/2 + r, -l/2);
    baseShape.lineTo(w/2 - r, -l/2);
    baseShape.quadraticCurveTo(w/2, -l/2, w/2, -l/2 + r);
    baseShape.lineTo(w/2, l/2 - r);
    baseShape.quadraticCurveTo(w/2, l/2, w/2 - r, l/2);
    baseShape.lineTo(-w/2 + r, l/2);
    baseShape.quadraticCurveTo(-w/2, l/2, -w/2, l/2 - r);
    baseShape.lineTo(-w/2, -l/2 + r);
    baseShape.quadraticCurveTo(-w/2, -l/2, -w/2 + r, -l/2);

    [[-w/2+10,-l/2+10],[w/2-10,-l/2+10],[w/2-10,l/2-10],[-w/2+10,l/2-10]].forEach(([hx,hy]) => {
      const h = new THREE.Path(); h.absarc(hx, hy, 3.5, 0, Math.PI*2, true); baseShape.holes.push(h);
    });
    const ch = new THREE.Path(); ch.absarc(0, 0, 14, 0, Math.PI*2, true); baseShape.holes.push(ch);

    const baseGeo = new THREE.ExtrudeGeometry(baseShape, { depth: 8, bevelEnabled: true, bevelSegments: 3, bevelSize: 1, bevelThickness: 1 });
    baseGeo.rotateX(-Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, mat()); baseMesh.castShadow = true; group.add(baseMesh);

    // Central cylinder
    const upright = new THREE.Mesh(new THREE.CylinderGeometry(16, 20, 34, 32), mat());
    upright.position.y = 8 + 17; upright.castShadow = true; group.add(upright);

    // Top torus ring
    const torus = new THREE.Mesh(new THREE.TorusGeometry(12, 3, 16, 32), mat());
    torus.position.y = 8 + 34; torus.rotation.x = Math.PI / 2; torus.castShadow = true; group.add(torus);

    // Four stiffener ribs
    const ribV = new THREE.BoxGeometry(4, 24, 18);
    [-14, 14].forEach(x => {
      const r = new THREE.Mesh(ribV, mat()); r.position.set(x, 8+12, 0); r.castShadow = true; group.add(r);
    });
    const ribH = new THREE.BoxGeometry(18, 24, 4);
    [-14, 14].forEach(z => {
      const r = new THREE.Mesh(ribH, mat()); r.position.set(0, 8+12, z); r.castShadow = true; group.add(r);
    });

    this._addGroupToScene(group);
  }

  /* ─────────────────────── GEOMETRY LOADING ─────────────────────── */

  setGeometry(geometry) {
    this._clearMesh();

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.center();
    const bb = geometry.boundingBox;
    geometry.translate(0, (bb.max.y - bb.min.y) / 2, 0);
    geometry.computeBoundingBox();

    this.currentGeometry = { boundingBox: geometry.boundingBox };
    const mesh = new THREE.Mesh(geometry, this.getMaterial());
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.currentMesh = mesh;
    this.scene.add(mesh);

    this._afterLoad(new THREE.Box3().setFromObject(mesh));
    this.computeTelemetry(geometry);
  }

  _addGroupToScene(group) {
    this._clearMesh();

    group.position.y = 0;
    this.scene.add(group);
    this.currentMesh = group;

    const box = new THREE.Box3().setFromObject(group);
    this.currentGeometry = { boundingBox: box };

    let triCount = 0;
    group.traverse(c => { if (c.isMesh && c.geometry?.attributes?.position) triCount += c.geometry.attributes.position.count / 3; });

    this._afterLoad(box);
    this.computeGroupTelemetry(box, Math.round(triCount));
  }

  _clearMesh() {
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
      this.currentMesh.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (Array.isArray(c.material)) c.material.forEach(m=>m.dispose()); else c.material.dispose(); }
      });
      this.currentMesh = null;
    }
  }

  _afterLoad(box) {
    // Fit camera
    this.fitCameraToBox(box);
    // Reset clip above model
    this.clipPlane.constant = box.max.y + 10;
    // Fit check
    this.checkFitInBuildVolume(box);
  }

  /* ─────────────────────── TELEMETRY ─────────────────────── */

  computeTelemetry(geometry) {
    const bb = geometry.boundingBox;
    const sX = +((bb.max.x - bb.min.x).toFixed(1));
    const sY = +((bb.max.y - bb.min.y).toFixed(1));
    const sZ = +((bb.max.z - bb.min.z).toFixed(1));

    let volume = 0;
    const pos = geometry.attributes.position;
    const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
    if (geometry.index) {
      const idx = geometry.index;
      for (let i = 0; i < idx.count; i += 3) {
        p1.fromBufferAttribute(pos, idx.getX(i));
        p2.fromBufferAttribute(pos, idx.getX(i+1));
        p3.fromBufferAttribute(pos, idx.getX(i+2));
        volume += this._signedVol(p1, p2, p3);
      }
    } else {
      for (let i = 0; i < pos.count; i += 3) {
        p1.fromBufferAttribute(pos, i); p2.fromBufferAttribute(pos, i+1); p3.fromBufferAttribute(pos, i+2);
        volume += this._signedVol(p1, p2, p3);
      }
    }
    const volCm3 = Math.max(0.1, +(Math.abs(volume) / 1000).toFixed(1));
    const grams  = Math.max(1, Math.round(volCm3 * 1.24 * 0.45));
    const tris   = Math.round(pos.count / 3);

    this._emitTelemetry(sX, sY, sZ, volCm3, grams, tris);
    return { sX, sY, sZ, volCm3, grams, tris };
  }

  computeGroupTelemetry(box, tris) {
    const sX = +((box.max.x - box.min.x).toFixed(1));
    const sY = +((box.max.y - box.min.y).toFixed(1));
    const sZ = +((box.max.z - box.min.z).toFixed(1));
    const volCm3 = Math.max(0.1, +((sX * sY * sZ * 0.35) / 1000).toFixed(1));
    const grams  = Math.max(1, Math.round(volCm3 * 1.24 * 0.45));
    this._emitTelemetry(sX, sY, sZ, volCm3, grams, tris);
  }

  _emitTelemetry(sX, sY, sZ, volCm3, grams, tris) {
    const hrs  = Math.floor(grams / 18);
    const mins = Math.round((grams % 18) * 3.3);
    const duration = hrs > 0 ? `${hrs}h ${mins}m` : `${Math.max(10, mins)}m`;

    const t = {
      x: sX, y: sY, z: sZ,
      dimensionsStr: `${sX} × ${sZ} × ${sY} mm`,
      volumeCm3: volCm3,
      weightGrams: grams,
      triangles: tris,
      estimatedDuration: duration,
      layerCount: Math.round(sY / 0.2) // 0.2mm standard layer height
    };
    if (this.options.onTelemetryUpdate) this.options.onTelemetryUpdate(t);
    return t;
  }

  _signedVol(p1, p2, p3) { return p1.dot(p2.clone().cross(p3)) / 6.0; }

  /* ─────────────────────── CAMERA ─────────────────────── */

  fitCameraToBox(box) {
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 60);
    const fov    = this.camera.fov * (Math.PI / 180);
    let d = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2.0;
    d = Math.max(d, 120);

    this.camera.position.set(d * 0.75, d * 0.65, d * 1.0);
    this.camera.lookAt(center);
    if (this.controls) { this.controls.target.copy(center); this.controls.update(); }
  }

  /* ─────────────────────── STL PARSING ─────────────────────── */

  loadSTLFromArrayBuffer(buffer) {
    const geometry = this._isSTLBinary(buffer)
      ? this._parseBinarySTL(buffer)
      : this._parseASCIISTL(new TextDecoder().decode(buffer));
    this.setGeometry(geometry);
  }

  _isSTLBinary(buffer) {
    if (buffer.byteLength < 84) return false;
    const n = new DataView(buffer).getUint32(80, true);
    return buffer.byteLength === 84 + n * 50;
  }

  _parseBinarySTL(buffer) {
    const dv = new DataView(buffer);
    const n  = dv.getUint32(80, true);
    const pos = new Float32Array(n * 9);
    const nor = new Float32Array(n * 9);
    let off = 84;
    for (let f = 0; f < n; f++) {
      const nx = dv.getFloat32(off,true), ny = dv.getFloat32(off+4,true), nz = dv.getFloat32(off+8,true);
      off += 12;
      for (let v = 0; v < 3; v++) {
        const i = f*9 + v*3;
        pos[i]   = dv.getFloat32(off,true);   pos[i+1] = dv.getFloat32(off+4,true); pos[i+2] = dv.getFloat32(off+8,true);
        nor[i]   = nx; nor[i+1] = ny; nor[i+2] = nz;
        off += 12;
      }
      off += 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal',   new THREE.BufferAttribute(nor, 3));
    return geo;
  }

  _parseASCIISTL(text) {
    const vRe = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g;
    const pts = [];
    let m;
    while ((m = vRe.exec(text)) !== null) pts.push(+m[1], +m[2], +m[3]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    geo.computeVertexNormals();
    return geo;
  }

  /* ─────────────────────── RESIZE / RENDER ─────────────────────── */

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const p = this.canvas.parentElement;
    const w = p ? p.clientWidth  : this.canvas.clientWidth;
    const h = p ? p.clientHeight : this.canvas.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
  }
}

window.LayerStudiosViewer = LayerStudiosViewer;
window.LS_BUILD = LS_BUILD;
