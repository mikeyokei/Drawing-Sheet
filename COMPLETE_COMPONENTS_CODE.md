# Critical Component Code - Part 2

## src/components/TemplateCanvas.js
```javascript
import React, { useEffect, useRef, useCallback } from 'react';
import { useTemplateStore } from '../store/templateStore';
import { TemplateGenerator } from '../utils/templateGenerator';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const TemplateCanvas = () => {
  const canvasRef = useRef(null);
  const templateGeneratorRef = useRef(null);
  const config = useTemplateStore();

  const regenerateTemplate = useCallback(() => {
    if (templateGeneratorRef.current) {
      templateGeneratorRef.current.generateTemplate();
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      templateGeneratorRef.current = new TemplateGenerator(config);
      templateGeneratorRef.current.initCanvas(canvasRef.current);
    }

    return () => {
      if (templateGeneratorRef.current) {
        templateGeneratorRef.current.destroy();
      }
    };
  }, [config]);

  useEffect(() => {
    regenerateTemplate();
  }, [config, regenerateTemplate]);

  const handleZoomIn = () => {
    if (templateGeneratorRef.current?.canvas) {
      const currentZoom = templateGeneratorRef.current.canvas.getZoom();
      templateGeneratorRef.current.canvas.setZoom(currentZoom * 1.2);
      templateGeneratorRef.current.canvas.renderAll();
    }
  };

  const handleZoomOut = () => {
    if (templateGeneratorRef.current?.canvas) {
      const currentZoom = templateGeneratorRef.current.canvas.getZoom();
      templateGeneratorRef.current.canvas.setZoom(currentZoom * 0.8);
      templateGeneratorRef.current.canvas.renderAll();
    }
  };

  const handleResetZoom = () => {
    if (templateGeneratorRef.current?.canvas) {
      templateGeneratorRef.current.canvas.setZoom(1);
      templateGeneratorRef.current.canvas.renderAll();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Template Preview</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="flex justify-center">
          <div className="canvas-container">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Preview shows actual size proportions</span>
          <span>Print size: A4 (210 × 297mm)</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCanvas;
```

## src/components/ControlPanel.js
```javascript
import React, { useState } from 'react';
import { useTemplateStore, TYPOGRAPHY_PRESETS } from '../store/templateStore';
import { 
  Sliders, 
  Type, 
  Grid, 
  FileDown, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Palette,
  Layout,
  Settings
} from 'lucide-react';

const ControlPanel = ({ onExportPDF }) => {
  const {
    baseSize,
    currentPreset,
    metrics,
    gridType,
    gridOpacity,
    gridColor,
    baselineColor,
    slantLineColor,
    showSlantLines,
    showGrid,
    showGuideLines,
    numberOfLines,
    letterSpacing,
    wordSpacing,
    setMetric,
    setPreset,
    setBaseSize,
    setGridOption,
    setLayoutOption,
  } = useTemplateStore();

  const [expandedSections, setExpandedSections] = useState({
    presets: true,
    typography: false,
    layout: false,
    grid: false,
    colors: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const BrutalistSlider = ({ label, value, onChange, min, max, step, unit = '' }) => (
    <div className="brutalist-stepper-container">
      <div className="flex justify-between items-center mb-2">
        <label className="brutalist-label">{label}</label>
        <span className="brutalist-mono text-xs">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="brutalist-slider w-full"
      />
    </div>
  );

  const BrutalistColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="brutalist-label">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 border-2 border-black cursor-pointer bg-white"
            style={{ appearance: 'none' }}
          />
          <div 
            className="absolute inset-1 pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </div>
        <span className="brutalist-mono text-xs flex-1">{value}</span>
      </div>
    </div>
  );

  const BrutalistCheckbox = ({ label, checked, onChange, id }) => (
    <div className="brutalist-checkbox-item">
      <div className="brutalist-checkbox">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="brutalist-checkbox-mark"></div>
      </div>
      <label htmlFor={id} className="brutalist-checkbox-label">{label}</label>
    </div>
  );

  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, accent = false }) => (
    <div className={`brutalist-section ${accent ? 'accent' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <h3 className="brutalist-section-title">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 transition-transform group-hover:scale-110" />
        ) : (
          <ChevronDown className="w-4 h-4 transition-transform group-hover:scale-110" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="brutalist-panel">
      <div className="brutalist-section accent">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <h2 className="brutalist-title">Template Controls</h2>
        </div>
      </div>

      <CollapsibleSection
        title="Presets"
        icon={Type}
        isExpanded={expandedSections.presets}
        onToggle={() => toggleSection('presets')}
      >
        <div className="space-y-3">
          {Object.entries(TYPOGRAPHY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`brutalist-btn w-full ${currentPreset === key ? 'active' : ''}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Typography"
        icon={Type}
        isExpanded={expandedSections.typography}
        onToggle={() => toggleSection('typography')}
      >
        <div className="space-y-4">
          <BrutalistSlider
            label="Base Size"
            value={baseSize}
            onChange={setBaseSize}
            min={10}
            max={50}
            step={1}
            unit="mm"
          />
          
          <BrutalistSlider
            label="X-Height"
            value={metrics.xHeight}
            onChange={(value) => setMetric('xHeight', value)}
            min={0.2}
            max={0.8}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Cap Height"
            value={metrics.capHeight}
            onChange={(value) => setMetric('capHeight', value)}
            min={0.4}
            max={1.0}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Ascender"
            value={metrics.ascender}
            onChange={(value) => setMetric('ascender', value)}
            min={0.1}
            max={1.2}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Descender"
            value={metrics.descender}
            onChange={(value) => setMetric('descender', value)}
            min={0.1}
            max={1.2}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Slant Angle"
            value={metrics.slantAngle}
            onChange={(value) => setMetric('slantAngle', value)}
            min={70}
            max={90}
            step={1}
            unit="°"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Layout"
        icon={Layout}
        isExpanded={expandedSections.layout}
        onToggle={() => toggleSection('layout')}
      >
        <div className="space-y-4">
          <BrutalistSlider
            label="Number of Lines"
            value={numberOfLines}
            onChange={(value) => setLayoutOption('numberOfLines', value)}
            min={5}
            max={20}
            step={1}
          />
          
          <BrutalistSlider
            label="Letter Spacing"
            value={letterSpacing}
            onChange={(value) => setLayoutOption('letterSpacing', value)}
            min={2}
            max={10}
            step={1}
            unit="mm"
          />
          
          <BrutalistSlider
            label="Word Spacing"
            value={wordSpacing}
            onChange={(value) => setLayoutOption('wordSpacing', value)}
            min={5}
            max={25}
            step={1}
            unit="mm"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Grid & Lines"
        icon={Grid}
        isExpanded={expandedSections.grid}
        onToggle={() => toggleSection('grid')}
      >
        <div className="space-y-4">
          <div className="brutalist-checkbox-grid">
            <BrutalistCheckbox
              id="slant-lines"
              label="Slant Lines"
              checked={showSlantLines}
              onChange={(checked) => setGridOption('showSlantLines', checked)}
            />
            
            <BrutalistCheckbox
              id="guide-lines"
              label="Guide Lines"
              checked={showGuideLines}
              onChange={(checked) => setGridOption('showGuideLines', checked)}
            />
            
            <BrutalistCheckbox
              id="grid"
              label="Grid"
              checked={showGrid}
              onChange={(checked) => setGridOption('showGrid', checked)}
            />
          </div>
          
          {showGrid && (
            <>
              <div className="space-y-2">
                <label className="brutalist-label">Grid Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridOption('gridType', 'lines')}
                    className={`brutalist-btn flex-1 ${gridType === 'lines' ? 'active' : ''}`}
                  >
                    Lines
                  </button>
                  <button
                    onClick={() => setGridOption('gridType', 'dotted')}
                    className={`brutalist-btn flex-1 ${gridType === 'dotted' ? 'active' : ''}`}
                  >
                    Dots
                  </button>
                </div>
              </div>
              
              <BrutalistSlider
                label="Grid Opacity"
                value={gridOpacity}
                onChange={(value) => setGridOption('gridOpacity', value)}
                min={0.1}
                max={1.0}
                step={0.1}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Colors"
        icon={Palette}
        isExpanded={expandedSections.colors}
        onToggle={() => toggleSection('colors')}
      >
        <div className="space-y-4">
          <BrutalistColorPicker
            label="Baseline Color"
            value={baselineColor}
            onChange={(color) => setGridOption('baselineColor', color)}
          />
          
          <BrutalistColorPicker
            label="Grid Color"
            value={gridColor}
            onChange={(color) => setGridOption('gridColor', color)}
          />
          
          <BrutalistColorPicker
            label="Slant Line Color"
            value={slantLineColor}
            onChange={(color) => setGridOption('slantLineColor', color)}
          />
        </div>
      </CollapsibleSection>

      <div className="brutalist-section">
        <button
          onClick={onExportPDF}
          className="brutalist-btn-accent w-full flex items-center justify-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
```

## Key CSS Classes for index.css (Add to existing styles)

```css
/* Brutalist Design System Variables */
:root {
  --black: #000000;
  --white: #ffffff;
  --gray-50: #f8f8f8;
  --gray-100: #f0f0f0;
  --gray-200: #e0e0e0;
  --accent: #20b2aa;
  --accent-hover: #17a2b8;
  
  --baseline-color: #000000;
  --midline-color: #0066cc;
  --slant-color: #ff6600;
}

/* Font Import */
@font-face {
  font-family: 'ArkSans';
  src: url('https://res.cloudinary.com/djyhapimn/raw/upload/v1749662957/ArkSans-Regular_xds8qr.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

* {
  font-family: 'ArkSans' !important;
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--gray-50);
  color: var(--black);
  line-height: 1.2;
  -webkit-font-smoothing: antialiased;
}

/* Layout */
.brutalist-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
  background: var(--gray-50);
  gap: 0;
}

.brutalist-panel {
  background: var(--white);
  border-right: 4px solid var(--black);
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.brutalist-canvas-area {
  display: grid;
  place-items: center;
  padding: 2rem;
  background: var(--gray-50);
  min-height: 100vh;
  overflow: auto;
}

/* Typography */
.brutalist-title {
  font-weight: 900;
  font-size: 1.75rem;
  letter-spacing: -0.05em;
  color: var(--white);
  text-transform: uppercase;
  margin: 0;
}

.brutalist-section-title {
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--black);
  margin: 0;
}

.brutalist-label {
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--black);
  margin: 0 0 0.25rem 0;
  display: block;
}

.brutalist-mono {
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.65rem;
  text-transform: uppercase;
}

/* Sections */
.brutalist-section {
  border-bottom: 4px solid var(--black);
  padding: 1.5rem;
  background: var(--white);
}

.brutalist-section:last-child {
  border-bottom: none;
}

.brutalist-section.accent {
  background: var(--black);
  color: var(--white);
}

.brutalist-section.accent .brutalist-section-title,
.brutalist-section.accent .brutalist-label {
  color: var(--white);
}

/* Buttons */
.brutalist-btn {
  background: var(--white);
  border: 2px solid var(--black);
  color: var(--black);
  font-weight: 800;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 0 var(--gray-200);
}

.brutalist-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--gray-200);
}

.brutalist-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--gray-200);
}

.brutalist-btn.active {
  background: var(--black);
  color: var(--white);
  box-shadow: 2px 2px 0 var(--accent);
}

.brutalist-btn-accent {
  background: var(--accent);
  border: 2px solid var(--black);
  color: var(--white);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 0 var(--black);
}

.brutalist-btn-accent:hover {
  background: var(--accent-hover);
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--black);
}

/* Sliders */
.brutalist-slider {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border: 2px solid var(--black);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.brutalist-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent);
  border: 2px solid var(--black);
  cursor: pointer;
  box-shadow: 1px 1px 0 var(--black);
}

.brutalist-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent);
  border: 2px solid var(--black);
  cursor: pointer;
  border-radius: 0;
}

/* Checkboxes */
.brutalist-checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.brutalist-checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border: 1px solid var(--gray-200);
  transition: all 0.15s ease;
}

.brutalist-checkbox-item:hover {
  background: var(--gray-50);
  border-color: var(--black);
}

.brutalist-checkbox {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.brutalist-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.brutalist-checkbox input[type="checkbox"]:checked + .brutalist-checkbox-mark {
  background: var(--accent);
  border-color: var(--black);
}

.brutalist-checkbox input[type="checkbox"]:checked + .brutalist-checkbox-mark::after {
  display: block;
}

.brutalist-checkbox-mark {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  background: var(--white);
  border: 2px solid var(--black);
  transition: all 0.15s ease;
}

.brutalist-checkbox-mark::after {
  content: '';
  position: absolute;
  display: none;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--white);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.brutalist-checkbox-label {
  font-weight: 600;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .brutalist-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .brutalist-panel {
    border-right: none;
    border-bottom: 4px solid var(--black);
    max-height: 50vh;
  }

  .brutalist-canvas-area {
    padding: 1rem;
  }

  .brutalist-section {
    padding: 1rem;
  }

  .brutalist-btn {
    padding: 0.75rem;
    font-size: 0.6rem;
  }

  .brutalist-checkbox-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
```

## Main App.js Structure (Key parts)
```javascript
import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import TemplateCanvas from './components/TemplateCanvas';
import { PDFExporter } from './utils/pdfExporter';
import { useTemplateStore } from './store/templateStore';

const App = () => {
  const [isExporting, setIsExporting] = useState(false);
  const templateStore = useTemplateStore();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // PDF export logic using PDFExporter class
      const exporter = new PDFExporter(null, templateStore);
      await exporter.exportToPDF('handwriting-template.pdf');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="brutalist-container">
      <ControlPanel onExportPDF={handleExportPDF} />
      <div className="brutalist-canvas-area">
        <TemplateCanvas />
      </div>
    </div>
  );
};

export default App;
```

## FINAL NOTES

1. **Template Generation**: Uses Fabric.js for precise canvas rendering
2. **State Management**: Zustand store with calculated metrics
3. **PDF Export**: High-resolution 300 DPI output using jsPDF
4. **Responsive Design**: Mobile-first with collapsible panels
5. **Typography**: Professional calligraphy standards with 5 presets
6. **Performance**: Optimized rendering and memory management

This code provides a complete, professional handwriting template generator that matches the original exactly.