import jsPDF from 'jspdf';
import { A4_CONFIG } from '../store/templateStore';

export class PDFExporter {
  constructor(templateGenerator, config) {
    this.templateGenerator = templateGenerator;
    this.config = config;
  }

  async exportToPDF(filename = 'handwriting-template.pdf') {
    try {
      // Create high-resolution version for PDF
      const highResCanvas = this.createHighResolutionCanvas();
      
      if (!highResCanvas) {
        throw new Error('Failed to create high-resolution canvas');
      }

      // Generate the template at high resolution
      await this.generateHighResTemplate(highResCanvas);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: this.config.orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Convert canvas to image and add to PDF
      const imgData = highResCanvas.toDataURL('image/png', 1.0);
      
      const pdfWidth = this.config.orientation === 'landscape' ? A4_CONFIG.height : A4_CONFIG.width;
      const pdfHeight = this.config.orientation === 'landscape' ? A4_CONFIG.width : A4_CONFIG.height;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save the PDF
      pdf.save(filename);
      
      // Clean up
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
    
    // Set high DPI dimensions
    canvas.width = A4_CONFIG.pixelWidth;
    canvas.height = A4_CONFIG.pixelHeight;
    
    // Scale context for high DPI
    const scale = A4_CONFIG.dpi / 96; // 96 is standard screen DPI
    ctx.scale(scale, scale);
    
    // Set canvas style for proper rendering
    canvas.style.width = A4_CONFIG.width + 'mm';
    canvas.style.height = A4_CONFIG.height + 'mm';
    
    return canvas;
  }

  async generateHighResTemplate(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate metrics for high resolution
    const metrics = this.config.getCalculatedMetrics();
    const margins = this.config.margins;
    
    // Convert mm to pixels for high-res rendering
    const mmToPixel = (mm) => (mm * A4_CONFIG.dpi) / 25.4;
    
    const workArea = {
      left: mmToPixel(margins.left),
      top: mmToPixel(margins.top),
      width: mmToPixel(A4_CONFIG.width - margins.left - margins.right),
      height: mmToPixel(A4_CONFIG.height - margins.top - margins.bottom),
    };
    
    // Draw baselines
    this.drawHighResBaselines(ctx, workArea, metrics, mmToPixel);
    
    // Draw slant lines if enabled
    if (this.config.showSlantLines) {
      this.drawHighResSlantLines(ctx, workArea, metrics, mmToPixel);
    }
    
    // Draw grid if enabled
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
      
      // Baseline (main writing line) - always show
      ctx.strokeStyle = this.config.baselineColor;
      ctx.lineWidth = 2;
      this.drawLine(ctx, workArea.left, baselineY, workArea.left + workArea.width, baselineY);
      
      // Always show x-height line (top line) so users know where to write
      ctx.strokeStyle = this.config.gridColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      this.drawLine(ctx, workArea.left, baselineY - xHeight, workArea.left + workArea.width, baselineY - xHeight);
      
      // Show additional guide lines if enabled
      if (this.config.showGuideLines) {
        // Cap height line
        ctx.globalAlpha = 0.5;
        this.drawLine(ctx, workArea.left, baselineY - capHeight, workArea.left + workArea.width, baselineY - capHeight);
        
        // Ascender line
        ctx.globalAlpha = 0.4;
        this.drawLine(ctx, workArea.left, baselineY - ascenderHeight, workArea.left + workArea.width, baselineY - ascenderHeight);
        
        // Descender line
        ctx.globalAlpha = 0.4;
        this.drawLine(ctx, workArea.left, baselineY + descenderDepth, workArea.left + workArea.width, baselineY + descenderDepth);
      }
      
      ctx.globalAlpha = 1;
    }
  }

  drawHighResSlantLines(ctx, workArea, metrics, mmToPixel) {
    const slantAngle = metrics.slantAngle;
    
    if (slantAngle === 90) return; // No slant lines for vertical (90° from baseline)
    
    // Convert slant angle to be relative to baseline (horizontal) instead of vertical
    // In calligraphy, 0° = horizontal, 90° = vertical
    const angleFromVertical = 90 - slantAngle;
    const radians = (angleFromVertical * Math.PI) / 180;
    const slantSpacing = mmToPixel(3); // 3mm spacing between diagonal lines
    
    // Calculate how many lines we need to fill the entire width plus the offset
    // Works with both positive and negative angles
    const offset = workArea.height * Math.tan(radians);
    const totalWidth = workArea.width + Math.abs(offset);
    const numberOfVerticals = Math.ceil(totalWidth / slantSpacing) + 2;
    
    // Start from before the left margin to ensure full coverage
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
    
    const gridSpacing = mmToPixel(5); // 5mm grid
    const isDotted = this.config.gridType === 'dotted';
    
    ctx.strokeStyle = this.config.gridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = this.config.gridOpacity;
    
    if (isDotted) {
      ctx.fillStyle = this.config.gridColor;
      
      // Draw dots at grid intersections
      for (let x = workArea.left; x <= workArea.left + workArea.width; x += gridSpacing) {
        for (let y = workArea.top; y <= workArea.top + workArea.height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else {
      // Vertical grid lines
      for (let x = workArea.left; x <= workArea.left + workArea.width; x += gridSpacing) {
        this.drawLine(ctx, x, workArea.top, x, workArea.top + workArea.height);
      }
      
      // Horizontal grid lines
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