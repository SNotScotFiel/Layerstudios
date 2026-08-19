# Layer Studios | Professional 3D Printing & Prototyping Web Application

> **“Turn Your Ideas Into Reality. Layer by Layer.”**  
> *“You imagine it. We print it.”*  
> Custom Parts • Rapid Prototypes • Small-Batch Production (Portugal & Europe)

---

## Overview

**Layer Studios** is a modern, high-tech, responsive Single Page Application (SPA) designed for a premium 3D printing and digital fabrication studio. Built with client-side Three.js WebGL model rendering, dynamic quoting calculations, real-time 10-stage project tracking, an e-commerce catalog with shopping cart, and a protected administration portal.

---

## Key Features

1. **Interactive Three.js 3D Model Viewer & Slicer**:
   - WebGL 3D preview with rotation, pan, zoom, wireframe CAD toggle, and real-time slicer clipping plane animation.
   - Client-side STL parser (binary and ASCII) that computes bounding box dimensions (X * Y * Z mm), signed tetrahedron volume (cm3), estimated filament weight (g), and print time.

2. **Dual-Path Instant Quote Engine**:
   - **Path A**: Upload 3D models (STL, 3MF, STEP, OBJ, ZIP) with drag-and-drop.
   - **Path B**: Request CAD Design (upload sketches, photos of broken parts with calipers, or project specs).
   - Real-time cost estimator with automatic volume tier discounts (10% to 35%), material multiplier, layer quality selection, infill density, and turnaround speed.
   - Generates unique tracking ID (e.g. LS-1048) and triggers confirmation modal.

3. **Materials Matrix & Interactive Advisor Quiz**:
   - Detailed specification cards for 5 engineering filaments: **PETG High-Temp**, **PLA / PLA+ Biopolymer**, **TPU 95A Elastomer**, **ABS / ASA Extreme**, and **Carbon-Fiber PETG**.
   - Side-by-side technical comparison table (strength, flexibility, temperature tolerance, UV resistance, surface finish).
   - 3-question interactive selector quiz recommending the optimal polymer.

4. **10-Stage Live Project & Order Tracker**:
   - Search by Quote ID (`LS-XXXX`) or Order ID (`ORD-XXXX`).
   - 10-milestone visual pipeline with animated pulses: Quote Requested -> Under Review -> Quote Sent -> Awaiting Payment -> Preparing -> Printing -> Quality Inspection -> Ready to Ship -> Shipped -> Completed.
   - Direct carrier tracking integration for **CTT Expresso 24h** (`DA123456789PT`).

5. **Store Catalog & Full Checkout**:
   - 6 ready-to-order functional products with customizer modal (material, color, engraved text, and quantity).
   - Persistent `localStorage` cart drawer with promo code validation (`FIRST10`, `BATCH20`, `STUDIO2026`).
   - Comprehensive checkout with Portugal/EU payment options (**MB WAY**, **Multibanco Entity/Reference**, and **Credit Card / Stripe**).

6. **Protected Administrator Dashboard (`admin123`)**:
   - Real-time studio KPIs (Monthly revenue, active orders, quote requests, printer fleet status).
   - Interactive Chart.js analytics for revenue trends and material consumption.
   - Interactive Quote Cost Editor: modify material cost, machine time, CAD design fee, shipping, and profit margin.
   - 9-stage transactional email preview sandbox (HTML templates).

7. **GDPR & Legal Compliance**:
   - Interactive cookie consent banner with localStorage persistence.
   - Modals for Privacy Policy (GDPR), Terms & Conditions, Shipping Policy (Portugal Continental 24h, Islands, EU), Returns & Refunds, Cookie Policy, and Legal Notice.

---

## Quick Start

### 1. Requirements
- Python 3.8+ (Standard library only).
- Web browser with WebGL support.

### 2. Launch the Application Server
Run the following command from the `layer-studios` directory:

```bash
python server.py 8080
```

Open your browser and navigate to:
```
http://localhost:8080
```

### 3. Test Credentials & Demo Data
- **Administrator Dashboard PIN**: `admin123` (Access via key icon in navbar or footer link).
- **Test Quote IDs**: `LS-1048` (Quote Sent), `LS-1049` (Printing), `LS-1050` (Under Review).
- **Test Order IDs**: `ORD-8821` (Printing Batch), `ORD-8822` (Shipped CTT Expresso).
- **Promo Codes**: `FIRST10`, `BATCH20`, `STUDIO2026`.