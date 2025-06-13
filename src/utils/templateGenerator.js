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
    
    const scale = 3.2; // Scale for screen display - better proportions for A4
    const metrics = this.config.getCalculatedMetrics();
    const canvasSize = this.config.getCanvasSize();
    
    // Apply margins
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
    
    // Draw diagonal lines first (so they appear behind baselines)
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
      
      // Baseline (main writing line) - always show
      this.addLine(
        margins.left,
        baselineY,
        margins.left + workArea.width,
        baselineY,
        { stroke: this.config.baselineColor, strokeWidth: 1.5 }
      );
      
      // Always show x-height line (top line) so users know where to write
      this.addLine(
        margins.left,
        baselineY - xHeight,
        margins.left + workArea.width,
        baselineY - xHeight,
        { stroke: this.config.gridColor, strokeWidth: 1, opacity: 0.7 }
      );
      
      // Show additional guide lines if enabled
      if (this.config.showGuideLines) {
        // Cap height line
        this.addLine(
          margins.left,
          baselineY - capHeight,
          margins.left + workArea.width,
          baselineY - capHeight,
          { stroke: this.config.gridColor, strokeWidth: 1, opacity: 0.5 }
        );
        
        // Ascender line
        this.addLine(
          margins.left,
          baselineY - ascenderHeight,
          margins.left + workArea.width,
          baselineY - ascenderHeight,
          { stroke: this.config.gridColor, strokeWidth: 0.8, opacity: 0.4 }
        );
        
        // Descender line
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
    
    if (slantAngle === 90) return; // No slant lines for vertical (90° from baseline)
    
    // Convert slant angle to be relative to baseline (horizontal) instead of vertical
    // In calligraphy, 0° = horizontal, 90° = vertical
    const angleFromVertical = 90 - slantAngle;
    const radians = (angleFromVertical * Math.PI) / 180;
    const slantSpacing = 3 * scale; // Even closer spacing - 3mm between lines
    
    // Calculate how many lines we need to fill the entire width plus the offset
    const offset = workArea.height * Math.tan(radians);
    const totalWidth = workArea.width + Math.abs(offset);
    const numberOfVerticals = Math.ceil(totalWidth / slantSpacing) + 2;
    
    // Start from before the left margin to ensure full coverage
    const startX = margins.left - Math.abs(offset);
    
    for (let i = 0; i < numberOfVerticals; i++) {
      const x = startX + (i * slantSpacing);
      
      // Calculate slanted line that goes through the entire height
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
          strokeDashArray: []
        }
      );
    }
  }

  drawGrid(margins, workArea, scale) {
    if (this.config.gridType === 'none') return;
    
    const gridSpacing = 5 * scale; // 5mm grid
    const isDotted = this.config.gridType === 'dotted';
    
    // Vertical grid lines
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
    
    // Horizontal grid lines
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
      stroke: '#374151',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      ...options,
    });
    
    this.canvas.add(line);
  }

  addDottedLine(x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const dotSpacing = 3;
    const numberOfDots = Math.floor(distance / dotSpacing);
    
    for (let i = 0; i <= numberOfDots; i++) {
      const ratio = i / numberOfDots;
      const x = x1 + (x2 - x1) * ratio;
      const y = y1 + (y2 - y1) * ratio;
      
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
    
    // Temporarily scale up for high-resolution export
    const originalWidth = this.canvas.width;
    const originalHeight = this.canvas.height;
    const scale = 10; // High resolution multiplier
    
    this.canvas.setDimensions({
      width: originalWidth * scale,
      height: originalHeight * scale,
    });
    
    this.canvas.setZoom(scale);
    
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    // Restore original size
    this.canvas.setDimensions({
      width: originalWidth,
      height: originalHeight,
    });
    
    this.canvas.setZoom(1);
    
    return dataURL;
  }

  destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
} 