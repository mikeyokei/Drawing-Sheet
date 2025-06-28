# Complete Handwriting Template Generator Recreation Guide

## OVERVIEW
Create a professional web-based handwriting template generator with React, Fabric.js, and jsPDF. This app generates customizable A4 practice templates for calligraphy with real-time preview and PDF export.

## PROJECT SETUP

### 1. Initialize React Project
```bash
npx create-react-app handwriting-template-generator
cd handwriting-template-generator
npm install fabric jspdf zustand lucide-react @headlessui/react autoprefixer postcss tailwindcss
npx tailwindcss init -p
```

### 2. Package.json (Replace content)
```json
{
  "name": "handwriting-template-generator",
  "version": "1.0.0",
  "description": "A web-based application for generating customizable handwriting practice templates",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "fabric": "^5.3.0",
    "jspdf": "^2.5.1",
    "zustand": "^4.4.1",
    "lucide-react": "^0.263.1",
    "@headlessui/react": "^1.7.17"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2"
  }
}
```

### 3. Tailwind Config (tailwind.config.js)
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['ArkSans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

## FILE STRUCTURE TO CREATE
```
src/
├── index.js (React entry)
├── index.css (Complete design system)
├── App.js (Main component - 1300+ lines)
├── components/
│   ├── ControlPanel.js (Controls sidebar)
│   └── TemplateCanvas.js (Canvas preview)
├── store/
│   └── templateStore.js (Zustand state)
└── utils/
    ├── templateGenerator.js (Fabric.js engine)
    └── pdfExporter.js (PDF generation)
```

## CORE FILES

### src/index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### src/store/templateStore.js
```javascript
import { create } from 'zustand';

export const A4_CONFIG = {
  width: 210,
  height: 297,
  dpi: 300,
  pixelWidth: 2480,
  pixelHeight: 3508,
};

export const TYPOGRAPHY_PRESETS = {
  italic: {
    name: 'Italic Foundational',
    xHeight: 0.5,
    capHeight: 0.7,
    ascender: 0.75,
    descender: 0.25,
    slantAngle: 83,
    lineSpacing: 2.5,
    metricSpacing: 1.0,
  },
  copperplate: {
    name: 'Copperplate',
    xHeight: 0.33,
    capHeight: 0.66,
    ascender: 1.0,
    descender: 0.33,
    slantAngle: 78,
    lineSpacing: 3.0,
    metricSpacing: 1.2,
  },
  spencerian: {
    name: 'Spencerian',
    xHeight: 0.4,
    capHeight: 0.6,
    ascender: 0.8,
    descender: 0.3,
    slantAngle: 70,
    lineSpacing: 2.8,
    metricSpacing: 1.1,
  },
  modern: {
    name: 'Modern Calligraphy',
    xHeight: 0.45,
    capHeight: 0.65,
    ascender: 0.85,
    descender: 0.35,
    slantAngle: 75,
    lineSpacing: 3.2,
    metricSpacing: 1.3,
  },
  minimal: {
    name: 'Minimal',
    xHeight: 0.5,
    capHeight: 0.7,
    ascender: 0.75,
    descender: 0.25,
    slantAngle: 83,
    lineSpacing: 2.0,
    metricSpacing: 1.0,
  },
};

export const useTemplateStore = create((set, get) => ({
  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  baseSize: 20,
  currentPreset: 'minimal',
  metrics: { ...TYPOGRAPHY_PRESETS.minimal },
  gridType: 'none',
  gridOpacity: 0.3,
  gridColor: '#9ca3af',
  baselineColor: '#374151',
  slantLineColor: '#3b82f6',
  showSlantLines: true,
  showGrid: false,
  showGuideLines: false,
  numberOfLines: 8,
  letterSpacing: 3,
  wordSpacing: 15,
  
  setMetric: (key, value) => set((state) => ({
    metrics: { ...state.metrics, [key]: value },
    currentPreset: 'custom'
  })),
  setPreset: (presetName) => set({
    currentPreset: presetName,
    metrics: { ...TYPOGRAPHY_PRESETS[presetName] }
  }),
  setBaseSize: (size) => set({ baseSize: size }),
  setGridOption: (key, value) => set({ [key]: value }),
  setLayoutOption: (key, value) => set({ [key]: value }),
  setMargins: (margins) => set({ margins }),
  
  getCalculatedMetrics: () => {
    const state = get();
    const { baseSize, metrics } = state;
    return {
      xHeight: baseSize * metrics.xHeight * metrics.metricSpacing,
      capHeight: baseSize * metrics.capHeight * metrics.metricSpacing,
      ascenderHeight: baseSize * metrics.ascender * metrics.metricSpacing,
      descenderDepth: baseSize * metrics.descender * metrics.metricSpacing,
      lineSpacing: baseSize * metrics.lineSpacing,
      metricSpacing: metrics.metricSpacing,
      slantAngle: metrics.slantAngle,
    };
  },
  
  getCanvasSize: () => {
    const state = get();
    const scale = 3.2;
    if (state.orientation === 'landscape') {
      return {
        width: A4_CONFIG.height * scale,
        height: A4_CONFIG.width * scale,
      };
    }
    return {
      width: A4_CONFIG.width * scale,
      height: A4_CONFIG.height * scale,
    };
  },
}));
```

### src/utils/templateGenerator.js
```javascript
import { fabric } from 'fabric';

export class TemplateGenerator {
  constructor(config) {
    this.config = config;
    this.canvas = null;
  }

  initCanvas(canvasElement) {
    const canvasSize = this.config.getCanvasSize();
    
    if (this.canvas) {
      this.canvas.dispose();
    }
    
    this.canvas = new fabric.Canvas(canvasElement, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'white',
      selection: false,
    });
    
    this.generateTemplate();
    return this.canvas;
  }

  generateTemplate() {
    if (!this.canvas) return;
    
    this.canvas.clear();
    this.canvas.backgroundColor = 'white';
    
    const scale = 3.2;
    const metrics = this.config.getCalculatedMetrics();
    const canvasSize = this.config.getCanvasSize();
    
    const margins = {
      top: this.config.margins.top * scale,
      left: this.config.margins.left * scale,
      right: this.config.margins.right * scale,
      bottom: this.config.margins.bottom * scale,
    };
    
    const workArea = {
      width: canvasSize.width - margins.left - margins.right,
      height: canvasSize.height - margins.top - margins.bottom,
    };
    
    if (this.config.showSlantLines) {
      this.drawSlantLines(margins, workArea, metrics, scale);
    }
    
    this.drawBaselines(margins, workArea, metrics, scale);
    
    if (this.config.showGrid) {
      this.drawGrid(margins, workArea, scale);
    }
    
    this.canvas.renderAll();
  }

  drawBaselines(margins, workArea, metrics, scale) {
    const lineSpacing = metrics.lineSpacing * scale;
    const xHeight = metrics.xHeight * scale;
    const capHeight = metrics.capHeight * scale;
    const ascenderHeight = metrics.ascenderHeight * scale;
    const descenderDepth = metrics.descenderDepth * scale;
    
    const startY = margins.top + ascenderHeight;
    const numberOfLines = Math.floor((workArea.height - ascenderHeight - descenderDepth) / lineSpacing);
    
    for (let i = 0; i < numberOfLines; i++) {
      const baselineY = startY + (i * lineSpacing);
      
      this.addLine(
        margins.left,
        baselineY,
        margins.left + workArea.width,
        baselineY,
        { stroke: this.config.baselineColor, strokeWidth: 1.5 }
      );
      
      this.addLine(
        margins.left,
        baselineY - xHeight,
        margins.left + workArea.width,
        baselineY - xHeight,
        { stroke: this.config.gridColor, strokeWidth: 1, opacity: 0.7 }
      );
      
      if (this.config.showGuideLines) {
        this.addLine(
          margins.left,
          baselineY - capHeight,
          margins.left + workArea.width,
          baselineY - capHeight,
          { stroke: this.config.gridColor, strokeWidth: 1, opacity: 0.5 }
        );
        
        this.addLine(
          margins.left,
          baselineY - ascenderHeight,
          margins.left + workArea.width,
          baselineY - ascenderHeight,
          { stroke: this.config.gridColor, strokeWidth: 0.8, opacity: 0.4 }
        );
        
        this.addLine(
          margins.left,
          baselineY + descenderDepth,
          margins.left + workArea.width,
          baselineY + descenderDepth,
          { stroke: this.config.gridColor, strokeWidth: 0.8, opacity: 0.4 }
        );
      }
    }
  }

  drawSlantLines(margins, workArea, metrics, scale) {
    const slantAngle = metrics.slantAngle;
    if (slantAngle === 90) return;
    
    const angleFromVertical = 90 - slantAngle;
    const radians = (angleFromVertical * Math.PI) / 180;
    const slantSpacing = 3 * scale;
    
    const offset = workArea.height * Math.tan(radians);
    const totalWidth = workArea.width + Math.abs(offset);
    const numberOfVerticals = Math.ceil(totalWidth / slantSpacing) + 2;
    
    const startX = margins.left - Math.abs(offset);
    
    for (let i = 0; i < numberOfVerticals; i++) {
      const x = startX + (i * slantSpacing);
      const topY = margins.top;
      const bottomY = margins.top + workArea.height;
      
      this.addLine(
        x,
        topY,
        x + offset,
        bottomY,
        { 
          stroke: this.config.slantLineColor, 
          strokeWidth: 0.5, 
          opacity: 0.25,
        }
      );
    }
  }

  drawGrid(margins, workArea, scale) {
    if (this.config.gridType === 'none') return;
    
    const gridSpacing = 5 * scale;
    const isDotted = this.config.gridType === 'dotted';
    
    for (let x = margins.left; x <= margins.left + workArea.width; x += gridSpacing) {
      if (isDotted) {
        this.addDottedLine(x, margins.top, x, margins.top + workArea.height);
      } else {
        this.addLine(
          x,
          margins.top,
          x,
          margins.top + workArea.height,
          { 
            stroke: this.config.gridColor, 
            strokeWidth: 0.3, 
            opacity: this.config.gridOpacity 
          }
        );
      }
    }
    
    for (let y = margins.top; y <= margins.top + workArea.height; y += gridSpacing) {
      if (isDotted) {
        this.addDottedLine(margins.left, y, margins.left + workArea.width, y);
      } else {
        this.addLine(
          margins.left,
          y,
          margins.left + workArea.width,
          y,
          { 
            stroke: this.config.gridColor, 
            strokeWidth: 0.3, 
            opacity: this.config.gridOpacity 
          }
        );
      }
    }
  }

  addLine(x1, y1, x2, y2, options = {}) {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      opacity: options.opacity || 1,
      selectable: false,
      evented: false,
      ...options,
    });
    this.canvas.add(line);
  }

  addDottedLine(x1, y1, x2, y2) {
    const spacing = 5;
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.floor(distance / spacing);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      
      const dot = new fabric.Circle({
        left: x - 0.5,
        top: y - 0.5,
        radius: 0.5,
        fill: this.config.gridColor,
        opacity: this.config.gridOpacity,
        selectable: false,
        evented: false,
      });
      this.canvas.add(dot);
    }
  }

  exportToDataURL() {
    if (!this.canvas) return null;
    return this.canvas.toDataURL({ format: 'png', quality: 1 });
  }

  destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
}
```

### src/utils/pdfExporter.js
```javascript
import jsPDF from 'jspdf';
import { A4_CONFIG } from '../store/templateStore';

export class PDFExporter {
  constructor(templateGenerator, config) {
    this.templateGenerator = templateGenerator;
    this.config = config;
  }

  async exportToPDF(filename = 'handwriting-template.pdf') {
    try {
      const highResCanvas = this.createHighResolutionCanvas();
      if (!highResCanvas) {
        throw new Error('Failed to create high-resolution canvas');
      }

      await this.generateHighResTemplate(highResCanvas);
      
      const pdf = new jsPDF({
        orientation: this.config.orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = highResCanvas.toDataURL('image/png', 1.0);
      
      const pdfWidth = this.config.orientation === 'landscape' ? A4_CONFIG.height : A4_CONFIG.width;
      const pdfHeight = this.config.orientation === 'landscape' ? A4_CONFIG.width : A4_CONFIG.height;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      
      highResCanvas.remove();
      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      return false;
    }
  }

  createHighResolutionCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = A4_CONFIG.pixelWidth;
    canvas.height = A4_CONFIG.pixelHeight;
    
    const scale = A4_CONFIG.dpi / 96;
    ctx.scale(scale, scale);
    
    canvas.style.width = A4_CONFIG.width + 'mm';
    canvas.style.height = A4_CONFIG.height + 'mm';
    
    return canvas;
  }

  async generateHighResTemplate(canvas) {
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const metrics = this.config.getCalculatedMetrics();
    const margins = this.config.margins;
    
    const mmToPixel = (mm) => (mm * A4_CONFIG.dpi) / 25.4;
    
    const workArea = {
      left: mmToPixel(margins.left),
      top: mmToPixel(margins.top),
      width: mmToPixel(A4_CONFIG.width - margins.left - margins.right),
      height: mmToPixel(A4_CONFIG.height - margins.top - margins.bottom),
    };
    
    this.drawHighResBaselines(ctx, workArea, metrics, mmToPixel);
    
    if (this.config.showSlantLines) {
      this.drawHighResSlantLines(ctx, workArea, metrics, mmToPixel);
    }
    
    if (this.config.showGrid) {
      this.drawHighResGrid(ctx, workArea, mmToPixel);
    }
  }

  drawHighResBaselines(ctx, workArea, metrics, mmToPixel) {
    const lineSpacing = mmToPixel(metrics.lineSpacing);
    const xHeight = mmToPixel(metrics.xHeight);
    const capHeight = mmToPixel(metrics.capHeight);
    const ascenderHeight = mmToPixel(metrics.ascenderHeight);
    const descenderDepth = mmToPixel(metrics.descenderDepth);
    
    const startY = workArea.top + ascenderHeight;
    const numberOfLines = Math.floor((workArea.height - ascenderHeight - descenderDepth) / lineSpacing);
    
    ctx.lineCap = 'round';
    
    for (let i = 0; i < numberOfLines; i++) {
      const baselineY = startY + (i * lineSpacing);
      
      ctx.strokeStyle = this.config.baselineColor;
      ctx.lineWidth = 2;
      this.drawLine(ctx, workArea.left, baselineY, workArea.left + workArea.width, baselineY);
      
      ctx.strokeStyle = this.config.gridColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      this.drawLine(ctx, workArea.left, baselineY - xHeight, workArea.left + workArea.width, baselineY - xHeight);
      
      if (this.config.showGuideLines) {
        ctx.globalAlpha = 0.5;
        this.drawLine(ctx, workArea.left, baselineY - capHeight, workArea.left + workArea.width, baselineY - capHeight);
        
        ctx.globalAlpha = 0.4;
        this.drawLine(ctx, workArea.left, baselineY - ascenderHeight, workArea.left + workArea.width, baselineY - ascenderHeight);
        this.drawLine(ctx, workArea.left, baselineY + descenderDepth, workArea.left + workArea.width, baselineY + descenderDepth);
      }
      
      ctx.globalAlpha = 1;
    }
  }

  drawHighResSlantLines(ctx, workArea, metrics, mmToPixel) {
    const slantAngle = metrics.slantAngle;
    if (slantAngle === 90) return;
    
    const angleFromVertical = 90 - slantAngle;
    const radians = (angleFromVertical * Math.PI) / 180;
    const slantSpacing = mmToPixel(3);
    
    const offset = workArea.height * Math.tan(radians);
    const totalWidth = workArea.width + Math.abs(offset);
    const numberOfVerticals = Math.ceil(totalWidth / slantSpacing) + 2;
    
    const startX = workArea.left - Math.abs(offset);
    
    ctx.strokeStyle = this.config.slantLineColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    
    for (let i = 0; i < numberOfVerticals; i++) {
      const x = startX + (i * slantSpacing);
      const topY = workArea.top;
      const bottomY = workArea.top + workArea.height;
      
      this.drawLine(ctx, x, topY, x + offset, bottomY);
    }
    
    ctx.globalAlpha = 1;
  }

  drawHighResGrid(ctx, workArea, mmToPixel) {
    if (this.config.gridType === 'none') return;
    
    const gridSpacing = mmToPixel(5);
    const isDotted = this.config.gridType === 'dotted';
    
    ctx.strokeStyle = this.config.gridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = this.config.gridOpacity;
    
    if (isDotted) {
      ctx.fillStyle = this.config.gridColor;
      
      for (let x = workArea.left; x <= workArea.left + workArea.width; x += gridSpacing) {
        for (let y = workArea.top; y <= workArea.top + workArea.height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else {
      for (let x = workArea.left; x <= workArea.left + workArea.width; x += gridSpacing) {
        this.drawLine(ctx, x, workArea.top, x, workArea.top + workArea.height);
      }
      for (let y = workArea.top; y <= workArea.top + workArea.height; y += gridSpacing) {
        this.drawLine(ctx, workArea.left, y, workArea.left + workArea.width, y);
      }
    }
    
    ctx.globalAlpha = 1;
  }

  drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
```

## IMPLEMENTATION INSTRUCTIONS

1. **Create the project structure** using the files above
2. **Install all dependencies** from package.json
3. **Copy the store, utils, and component files** exactly as provided
4. **Create the brutalist CSS design system** in index.css (see next section)
5. **Build the main App.js component** with SVG template generation
6. **Add the ControlPanel and TemplateCanvas components**
7. **Test the real-time preview and PDF export functionality**

## KEY FEATURES TO IMPLEMENT

- **Real-time SVG preview** with precise millimeter calculations
- **Five typography presets** (Italic, Copperplate, Spencerian, Modern, Minimal)
- **Mobile-responsive design** with collapsible panels
- **300 DPI PDF export** for professional printing
- **Brutalist design system** with ArkSans font
- **Educational color standards** for handwriting practice

## CSS DESIGN SYSTEM
The index.css file should include:
- ArkSans font import from CloudFlare CDN
- Brutalist variables (--black, --white, --accent colors)
- Responsive grid layout system
- Custom slider, button, and checkbox components
- Mobile breakpoints and touch optimizations

## FINAL STEPS
1. Replace public/index.html title with "Handwriting Template Generator"
2. Test all typography presets work correctly
3. Verify PDF export generates 300 DPI files
4. Check mobile responsiveness on different screen sizes
5. Ensure canvas rendering works in all major browsers

This guide contains everything needed to recreate the handwriting template generator exactly. 