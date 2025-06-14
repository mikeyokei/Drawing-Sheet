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

  // Collapsible sections state
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
      {/* Header */}
      <div className="brutalist-section accent">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <h2 className="brutalist-title">Template Controls</h2>
        </div>
      </div>

      {/* Preset Selection - Always visible at top */}
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

      {/* Typography Controls */}
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
            min={0.5}
            max={1.2}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Descender"
            value={metrics.descender}
            onChange={(value) => setMetric('descender', value)}
            min={0.1}
            max={0.5}
            step={0.01}
          />
          
          <BrutalistSlider
            label="Line Spacing"
            value={metrics.lineSpacing}
            onChange={(value) => setMetric('lineSpacing', value)}
            min={1.0}
            max={4.0}
            step={0.05}
            unit="x"
          />
          
          <BrutalistSlider
            label="Metric Spacing"
            value={metrics.metricSpacing}
            onChange={(value) => setMetric('metricSpacing', value)}
            min={0.5}
            max={2.0}
            step={0.05}
            unit="x"
          />
          
          <BrutalistSlider
            label="Slant Angle"
            value={metrics.slantAngle}
            onChange={(value) => setMetric('slantAngle', value)}
            min={45}
            max={135}
            step={0.5}
            unit="°"
          />
        </div>
      </CollapsibleSection>

      {/* Layout Controls */}
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
            step={0.5}
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

      {/* Grid Controls */}
      <CollapsibleSection
        title="Grid Options"
        icon={Grid}
        isExpanded={expandedSections.grid}
        onToggle={() => toggleSection('grid')}
      >
        <div className="space-y-4">
          <div className="brutalist-input-container">
            <label className="brutalist-label">Grid Type</label>
            <select
              value={gridType}
              onChange={(e) => setGridOption('gridType', e.target.value)}
              className="brutalist-input"
            >
              <option value="ruled">Ruled Lines</option>
              <option value="dotted">Dotted Grid</option>
              <option value="none">No Grid</option>
            </select>
          </div>
          
          <BrutalistSlider
            label="Grid Opacity"
            value={gridOpacity}
            onChange={(value) => setGridOption('gridOpacity', value)}
            min={0.1}
            max={1.0}
            step={0.1}
          />
          
          <div className="brutalist-checkbox-grid">
            <BrutalistCheckbox
              label="Show Grid"
              id="showGrid"
              checked={showGrid}
              onChange={(checked) => setGridOption('showGrid', checked)}
            />
            
            <BrutalistCheckbox
              label="Show Slant Lines"
              id="showSlantLines"
              checked={showSlantLines}
              onChange={(checked) => setGridOption('showSlantLines', checked)}
            />
            
            <BrutalistCheckbox
              label="Show Guide Lines"
              id="showGuideLines"
              checked={showGuideLines}
              onChange={(checked) => setGridOption('showGuideLines', checked)}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Color Controls */}
      <CollapsibleSection
        title="Colors"
        icon={Palette}
        isExpanded={expandedSections.colors}
        onToggle={() => toggleSection('colors')}
      >
        <div className="space-y-4">
          <BrutalistColorPicker
            label="Baseline"
            value={baselineColor}
            onChange={(value) => setGridOption('baselineColor', value)}
          />
          
          <BrutalistColorPicker
            label="Grid"
            value={gridColor}
            onChange={(value) => setGridOption('gridColor', value)}
          />
          
          <BrutalistColorPicker
            label="Slant Lines"
            value={slantLineColor}
            onChange={(value) => setGridOption('slantLineColor', value)}
          />
        </div>
      </CollapsibleSection>

      {/* Export Controls - Always visible at bottom */}
      <div className="brutalist-section">
        <div className="space-y-3">
          <button
            onClick={onExportPDF}
            className="brutalist-btn-accent"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          
          <button
            onClick={() => setPreset('minimal')}
            className="brutalist-btn w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Minimal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 