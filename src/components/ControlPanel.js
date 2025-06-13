import React from 'react';
import { useTemplateStore, TYPOGRAPHY_PRESETS } from '../store/templateStore';
import { Sliders, Type, Grid, FileDown, RotateCcw } from 'lucide-react';

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

  const SliderControl = ({ label, value, onChange, min, max, step, unit = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-track"
      />
    </div>
  );

  const ColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        />
        <span className="text-sm text-gray-500">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sliders className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">Template Controls</h2>
      </div>

      {/* Preset Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Presets</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TYPOGRAPHY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                currentPreset === key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Controls */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Typography</h3>
        
        <SliderControl
          label="Base Size"
          value={baseSize}
          onChange={setBaseSize}
          min={10}
          max={50}
          step={1}
          unit="mm"
        />
        
        <SliderControl
          label="X-Height Ratio"
          value={metrics.xHeight}
          onChange={(value) => setMetric('xHeight', value)}
          min={0.2}
          max={0.8}
          step={0.01}
        />
        
        <SliderControl
          label="Cap Height Ratio"
          value={metrics.capHeight}
          onChange={(value) => setMetric('capHeight', value)}
          min={0.4}
          max={1.0}
          step={0.01}
        />
        
        <SliderControl
          label="Ascender Ratio"
          value={metrics.ascender}
          onChange={(value) => setMetric('ascender', value)}
          min={0.5}
          max={1.2}
          step={0.01}
        />
        
        <SliderControl
          label="Descender Ratio"
          value={metrics.descender}
          onChange={(value) => setMetric('descender', value)}
          min={0.1}
          max={0.5}
          step={0.01}
        />
        
        <SliderControl
          label="Inter-Line Spacing"
          value={metrics.lineSpacing}
          onChange={(value) => setMetric('lineSpacing', value)}
          min={1.0}
          max={4.0}
          step={0.05}
          unit="x"
        />
        
        <SliderControl
          label="Metric Spacing"
          value={metrics.metricSpacing}
          onChange={(value) => setMetric('metricSpacing', value)}
          min={0.5}
          max={2.0}
          step={0.05}
          unit="x"
        />
        
        <SliderControl
          label="Slant Angle"
          value={metrics.slantAngle}
          onChange={(value) => setMetric('slantAngle', value)}
          min={-45}
          max={45}
          step={0.5}
          unit="°"
        />
      </div>

      {/* Layout Controls */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Layout</h3>
        
        <SliderControl
          label="Number of Lines"
          value={numberOfLines}
          onChange={(value) => setLayoutOption('numberOfLines', value)}
          min={5}
          max={20}
          step={1}
        />
        
        <SliderControl
          label="Letter Spacing"
          value={letterSpacing}
          onChange={(value) => setLayoutOption('letterSpacing', value)}
          min={2}
          max={10}
          step={0.5}
          unit="mm"
        />
        
        <SliderControl
          label="Word Spacing"
          value={wordSpacing}
          onChange={(value) => setLayoutOption('wordSpacing', value)}
          min={5}
          max={25}
          step={1}
          unit="mm"
        />
      </div>

      {/* Grid Controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Grid className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Grid Options</h3>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Grid Type</label>
          <select
            value={gridType}
            onChange={(e) => setGridOption('gridType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ruled">Ruled Lines</option>
            <option value="dotted">Dotted Grid</option>
            <option value="none">No Grid</option>
          </select>
        </div>
        
        <SliderControl
          label="Grid Opacity"
          value={gridOpacity}
          onChange={(value) => setGridOption('gridOpacity', value)}
          min={0.1}
          max={1.0}
          step={0.1}
        />
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showGrid"
            checked={showGrid}
            onChange={(e) => setGridOption('showGrid', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="showGrid" className="text-sm text-gray-700">Show Grid</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showSlantLines"
            checked={showSlantLines}
            onChange={(e) => setGridOption('showSlantLines', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="showSlantLines" className="text-sm text-gray-700">Show Slant Lines</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showGuideLines"
            checked={showGuideLines}
            onChange={(e) => setGridOption('showGuideLines', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="showGuideLines" className="text-sm text-gray-700">Show Guide Lines (x-height, cap height, etc.)</label>
        </div>
      </div>

      {/* Color Controls */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Colors</h3>
        
        <ColorPicker
          label="Baseline Color"
          value={baselineColor}
          onChange={(value) => setGridOption('baselineColor', value)}
        />
        
        <ColorPicker
          label="Grid Color"
          value={gridColor}
          onChange={(value) => setGridOption('gridColor', value)}
        />
        
        <ColorPicker
          label="Slant Line Color"
          value={slantLineColor}
          onChange={(value) => setGridOption('slantLineColor', value)}
        />
      </div>

      {/* Export Controls */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={onExportPDF}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
        
        <button
          onClick={() => setPreset('minimal')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Minimal</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel; 