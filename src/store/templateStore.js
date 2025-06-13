import { create } from 'zustand';

// A4 dimensions in mm
export const A4_CONFIG = {
  width: 210,
  height: 297,
  dpi: 300,
  pixelWidth: 2480,
  pixelHeight: 3508,
};

// Typography ratio presets
export const TYPOGRAPHY_PRESETS = {
  italic: {
    name: 'Italic Foundational',
    xHeight: 0.5,
    capHeight: 0.7,
    ascender: 0.75,
    descender: 0.25,
    slantAngle: 83,  // 83° from baseline (was 7° from vertical)
    lineSpacing: 2.5,        // Inter-line spacing (baseline to baseline)
    metricSpacing: 1.0,      // Internal spacing between typography elements
  },
  copperplate: {
    name: 'Copperplate',
    xHeight: 0.33,
    capHeight: 0.66,
    ascender: 1.0,
    descender: 0.33,
    slantAngle: 78,  // 78° from baseline (was 12° from vertical)
    lineSpacing: 3.0,
    metricSpacing: 1.2,      // Tighter internal spacing for elegant look
  },
  spencerian: {
    name: 'Spencerian',
    xHeight: 0.4,
    capHeight: 0.6,
    ascender: 0.8,
    descender: 0.3,
    slantAngle: 70,  // 70° from baseline (was 20° from vertical)
    lineSpacing: 2.8,
    metricSpacing: 1.1,
  },
  modern: {
    name: 'Modern Calligraphy',
    xHeight: 0.45,
    capHeight: 0.65,
    ascender: 0.85,
    descender: 0.35,
    slantAngle: 75,  // 75° from baseline (was 15° from vertical)
    lineSpacing: 3.2,
    metricSpacing: 1.3,      // More generous spacing for modern style
  },
  minimal: {
    name: 'Minimal',
    xHeight: 0.5,
    capHeight: 0.7,
    ascender: 0.75,
    descender: 0.25,
    slantAngle: 83,  // 83° from baseline (was 7° from vertical)
    lineSpacing: 2.0,
    metricSpacing: 1.0,      // Standard 1:1 spacing
  },
};

export const useTemplateStore = create((set, get) => ({
  // Template configuration
  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  
  // Typography metrics
  baseSize: 20, // Base line height in mm
  currentPreset: 'minimal',
  metrics: { ...TYPOGRAPHY_PRESETS.minimal },
  
  // Grid options
  gridType: 'none',
  gridOpacity: 0.3,
  gridColor: '#9ca3af',
  baselineColor: '#374151',
  slantLineColor: '#3b82f6',
  showSlantLines: true,
  showGrid: false,
  showGuideLines: false,
  
  // Layout
  numberOfLines: 8,
  letterSpacing: 3, // mm - closer spacing for more diagonal lines
  wordSpacing: 15, // mm
  
  // Actions
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
  
  // Calculated values
  getCalculatedMetrics: () => {
    const state = get();
    const { baseSize, metrics } = state;
    
    return {
      xHeight: baseSize * metrics.xHeight * metrics.metricSpacing,
      capHeight: baseSize * metrics.capHeight * metrics.metricSpacing,
      ascenderHeight: baseSize * metrics.ascender * metrics.metricSpacing,
      descenderDepth: baseSize * metrics.descender * metrics.metricSpacing,
      lineSpacing: baseSize * metrics.lineSpacing,     // Inter-line spacing
      metricSpacing: metrics.metricSpacing,            // Internal spacing multiplier
      slantAngle: metrics.slantAngle,
    };
  },
  
  getCanvasSize: () => {
    const state = get();
    const scale = 3.2; // Scale for screen display - better proportions for A4
    
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