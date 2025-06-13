import React, { useState, useRef } from 'react';
import { Download, Printer, RotateCcw, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

const HandwritingTemplateGenerator = () => {
  // Default A4 dimensions in mm
  const DEFAULT_WIDTH = 210;
  const DEFAULT_HEIGHT = 297;
  const SCALE_FACTOR = 2.8; // Scale for screen display
  
  // State for page settings
  const [pageSettings, setPageSettings] = useState({
    orientation: 'portrait', // 'portrait' or 'landscape'
    customSize: false,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  });

  // Calculate current dimensions based on orientation and custom size
  const getCurrentDimensions = () => {
    if (pageSettings.customSize) {
      return {
        width: pageSettings.width,
        height: pageSettings.height
      };
    }
    
    // Standard A4 dimensions
    if (pageSettings.orientation === 'landscape') {
      return {
        width: DEFAULT_HEIGHT, // 297mm
        height: DEFAULT_WIDTH  // 210mm
      };
    } else {
      return {
        width: DEFAULT_WIDTH,  // 210mm
        height: DEFAULT_HEIGHT // 297mm
      };
    }
  };

  const { width: CURRENT_WIDTH, height: CURRENT_HEIGHT } = getCurrentDimensions();
  
  // State for template settings - Based on handwriting research
  const [settings, setSettings] = useState({
    // Typography metrics (in mm) - Research-based standards
    xHeight: 4, // Optimal for elementary students
    capHeight: 6, // 1.5x x-height for proper proportions
    ascenderHeight: 15, // Increased height for better letter practice
    descenderDepth: 3, // 0.75x x-height for balance
    numberOfLines: 12, // Number of lines to display on the sheet
    interlineSpacing: 6, // Spacing between baseline and next ascender in mm
    
    // Layout settings - Educational best practices
    slantAngle: 75, // Default slant angle (75° from baseline, typical for calligraphy)
    marginTop: 15, // Optimized for better space usage
    marginBottom: 15, // Consistent margins
    marginLeft: 20, // Adequate space for line labels
    marginRight: 15, // Optimized right margin
    
    // Grid options - Research-informed settings
    showSlantLines: true,
    showGrid: false, // Default to minimal for clarity
    showXHeight: false, // Optional for basic practice
    showCapHeight: false, // Optional for advanced practice
    showAscender: true, // Important for tall letters
    showDescender: false, // Optional for practice
    showLineLabels: false, // Optional for learning
    gridSpacing: 5, // Fine grid for precision
    slantLineSpacing: 6, // Optimal spacing for letter width practice
    
    // Line styles - Enhanced visibility
    baselineOpacity: 1.0, // Always fully visible
    baselineThickness: 0.6, // Baseline thickness in mm
    guidelineOpacity: 0.6, // More visible than before for better guidance
    guidelineThickness: 0.3, // Guide line thickness in mm
    slantLineOpacity: 0.5, // Balanced visibility
    
    // Colors - Research-based educational colors
    baselineColor: '#000000', // Black for strong baseline reference
    guidelineColor: '#0066cc', // Blue for secondary lines (common in education)
    slantLineColor: '#ff6600', // Orange for slant guides (high contrast)
    marginColor: '#ff0000' // Red for margins (warning/boundary color)
  });

  const svgRef = useRef();

  // Update settings
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Update page settings
  const updatePageSetting = (key, value) => {
    setPageSettings(prev => ({ ...prev, [key]: value }));
  };

  // Toggle orientation
  const toggleOrientation = () => {
    const newOrientation = pageSettings.orientation === 'portrait' ? 'landscape' : 'portrait';
    updatePageSetting('orientation', newOrientation);
  };

  // Enhanced line calculation with dynamic spacing distribution
  const calculateLines = () => {
    const { marginTop, marginBottom, numberOfLines, xHeight, capHeight, ascenderHeight, descenderDepth, interlineSpacing } = settings;
    
    // Calculate available writing area height
    const availableHeight = CURRENT_HEIGHT - marginTop - marginBottom;
    
    // Calculate minimum space needed for the first line (ascender space)
    const firstLineOffset = ascenderHeight;
    
    // Reserve extra space at the bottom to ensure the last line with descenders fits
    const bottomBuffer = descenderDepth + 5; // Add 5mm buffer for last line descenders
    
    // Calculate available space for line distribution
    const distributionHeight = availableHeight - firstLineOffset - bottomBuffer;
    
    // Calculate optimal spacing to fill the page
    let actualLineSpacing;
    if (numberOfLines > 1) {
      // Distribute the available space evenly among the lines
      actualLineSpacing = distributionHeight / (numberOfLines - 1);
      
      // Ensure minimum spacing (don't make lines too cramped)
      const minSpacing = ascenderHeight + descenderDepth + 3; // 3mm minimum gap
      if (actualLineSpacing < minSpacing) {
        actualLineSpacing = minSpacing;
      }
    } else {
      actualLineSpacing = interlineSpacing + ascenderHeight + descenderDepth;
    }
    
    const lines = [];
    
    for (let i = 0; i < numberOfLines; i++) {
      const baselineY = marginTop + firstLineOffset + (i * actualLineSpacing);
      
      // Ensure the line doesn't go beyond the safe writing area
      const maxBaselineY = CURRENT_HEIGHT - marginBottom - descenderDepth - 5; // 5mm safety margin
      
      if (baselineY <= maxBaselineY) {
        lines.push({
          baseline: baselineY,
          xHeightLine: baselineY - xHeight,
          capHeightLine: baselineY - capHeight,
          ascenderLine: baselineY - ascenderHeight,
          descenderLine: baselineY + descenderDepth,
          groupIndex: Math.floor(i / 3), // For label grouping only
          lineIndex: i % 3
        });
      }
    }
    
    return lines;
  };

  // Enhanced slant lines with better spacing (supports negative angles)
  const generateSlantLines = () => {
    const { slantAngle, slantLineSpacing, marginLeft, marginRight, marginTop, marginBottom } = settings;
    const slantLines = [];
    
    if (slantAngle === 90) return slantLines; // No slant lines for vertical (90° from baseline)
    
    // Convert slant angle to be relative to baseline (horizontal) instead of vertical
    // In calligraphy, 0° = horizontal, 90° = vertical
    // We need to convert this to the angle from vertical for Math.tan
    const angleFromVertical = 90 - slantAngle;
    const angleRad = (angleFromVertical * Math.PI) / 180;
    const tanAngle = Math.tan(angleRad);
    
    // Define the writing area boundaries
    const writingAreaLeft = marginLeft;
    const writingAreaRight = CURRENT_WIDTH - marginRight;
    const writingAreaTop = marginTop;
    const writingAreaBottom = CURRENT_HEIGHT - marginBottom;
    const writingAreaWidth = writingAreaRight - writingAreaLeft;
    const writingAreaHeight = writingAreaBottom - writingAreaTop;
    
    // Calculate projection for slanted lines (handles both positive and negative angles)
    const heightProjection = writingAreaHeight * tanAngle;
    const startX = writingAreaLeft - Math.abs(heightProjection);
    const totalWidth = writingAreaWidth + (2 * Math.abs(heightProjection));
    const numLines = Math.ceil(totalWidth / slantLineSpacing) + 2;
    
    for (let i = 0; i < numLines; i++) {
      const x = startX + (i * slantLineSpacing);
      
      // For negative angles, the slant goes the opposite direction
      const topX = x;
      const bottomX = x + heightProjection;
      
      slantLines.push({
        x1: topX,
        y1: writingAreaTop,
        x2: bottomX,
        y2: writingAreaBottom
      });
    }
    
    return slantLines;
  };

  // Enhanced grid lines
  const generateGridLines = () => {
    const { marginLeft, marginRight, marginTop, marginBottom, gridSpacing } = settings;
    const verticalLines = [];
    const horizontalLines = [];
    
    // Vertical lines within writing area
    for (let x = marginLeft; x <= CURRENT_WIDTH - marginRight; x += gridSpacing) {
      verticalLines.push({
        x,
        y1: marginTop,
        y2: CURRENT_HEIGHT - marginBottom
      });
    }
    
    // Horizontal lines within writing area
    for (let y = marginTop; y <= CURRENT_HEIGHT - marginBottom; y += gridSpacing) {
      horizontalLines.push({
        y,
        x1: marginLeft,
        x2: CURRENT_WIDTH - marginRight
      });
    }
    
    return { verticalLines, horizontalLines };
  };

  // Enhanced margin guides
  const generateMarginGuides = () => {
    const { marginTop, marginBottom, marginLeft, marginRight } = settings;
    
    return {
      top: { x1: 0, y1: marginTop, x2: CURRENT_WIDTH, y2: marginTop },
      bottom: { x1: 0, y1: CURRENT_HEIGHT - marginBottom, x2: CURRENT_WIDTH, y2: CURRENT_HEIGHT - marginBottom },
      left: { x1: marginLeft, y1: 0, x2: marginLeft, y2: CURRENT_HEIGHT },
      right: { x1: CURRENT_WIDTH - marginRight, y1: 0, x2: CURRENT_WIDTH - marginRight, y2: CURRENT_HEIGHT }
    };
  };

  // Export SVG
  const exportSVG = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'handwriting-practice-sheet.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print template
  const printTemplate = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    const pageSize = pageSettings.customSize 
      ? `${pageSettings.width}mm ${pageSettings.height}mm`
      : (pageSettings.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Handwriting Practice Sheet</title>
          <style>
            @page { 
              size: ${pageSize}; 
              margin: 0; 
            }
            body { 
              margin: 0; 
              padding: 0; 
            }
            svg { 
              width: ${CURRENT_WIDTH}mm; 
              height: ${CURRENT_HEIGHT}mm; 
            }
          </style>
        </head>
        <body>
          ${svgString}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Export PDF
  const exportPDF = async () => {
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      
      // Create a temporary canvas for high-resolution rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set high resolution for better quality (300 DPI)
      const scaleFactor = 300 / 96; // 300 DPI vs 96 DPI screen
      const canvasWidth = CURRENT_WIDTH * scaleFactor * (25.4 / 25.4); // mm to mm conversion for clarity
      const canvasHeight = CURRENT_HEIGHT * scaleFactor * (25.4 / 25.4);
      
      canvas.width = canvasWidth * 4; // 4x for higher quality
      canvas.height = canvasHeight * 4;
      
      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: pageSettings.orientation === 'landscape' ? 'l' : 'p',
          unit: 'mm',
          format: 'a4'
        });
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, CURRENT_WIDTH, CURRENT_HEIGHT);
        
        // Save PDF
        pdf.save('handwriting-practice-sheet.pdf');
        
        // Clean up
        URL.revokeObjectURL(url);
        canvas.remove();
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  const lines = calculateLines();
  const slantLines = generateSlantLines();
  const { verticalLines, horizontalLines } = generateGridLines();
  const marginGuides = generateMarginGuides();

  // Enhanced tap-friendly stepper component with refined UX
  const BrutalistStepper = ({ label, value, onChange, min, max, step, unit = '' }) => {
    const [isPressed, setIsPressed] = React.useState({ dec: false, inc: false });
    const [inputFocused, setInputFocused] = React.useState(false);
    const intervalRef = React.useRef(null);
    const timeoutRef = React.useRef(null);

    const handleDecrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    };

    const handleIncrement = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    };

    const handleInputChange = (e) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    // Enhanced button press with hold-to-repeat functionality
    const handleButtonPress = (direction, isMouseDown) => {
      if (isMouseDown) {
        setIsPressed(prev => ({ ...prev, [direction]: true }));
        
        // Immediate action
        const action = direction === 'inc' ? handleIncrement : handleDecrement;
        action();
        
        // Start repeat after delay
        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            action();
          }, 80); // Fast repeat rate
        }, 400); // Initial delay before repeat starts
      } else {
        setIsPressed(prev => ({ ...prev, [direction]: false }));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    // Keyboard navigation support
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecrement();
      }
    };

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    // Calculate percentage for visual feedback
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="brutalist-stepper-container">
        <div className="brutalist-stepper-label">
          <span className="brutalist-label">{label}</span>
          <div className="brutalist-stepper-value-container">
            <span className="brutalist-stepper-value brutalist-mono">{value}{unit}</span>
            <div className="brutalist-stepper-range-indicator">
              <div 
                className="brutalist-stepper-range-fill" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="brutalist-stepper-controls">
          <button 
            className={`brutalist-stepper-btn ${isPressed.dec ? 'pressed' : ''}`}
            onMouseDown={() => handleButtonPress('dec', true)}
            onMouseUp={() => handleButtonPress('dec', false)}
            onMouseLeave={() => handleButtonPress('dec', false)}
            onTouchStart={() => handleButtonPress('dec', true)}
            onTouchEnd={() => handleButtonPress('dec', false)}
            disabled={value <= min}
            title={`Decrease ${label} (${step}${unit})`}
            aria-label={`Decrease ${label}`}
          >
            <span className="brutalist-stepper-btn-icon">−</span>
          </button>
          <div className="brutalist-stepper-input-container">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              min={min}
              max={max}
              step={step}
              className={`brutalist-stepper-input ${inputFocused ? 'focused' : ''}`}
              title={`${label}: ${min} to ${max}${unit}`}
              aria-label={`${label} value`}
            />
            <div className="brutalist-stepper-input-overlay"></div>
          </div>
          <button 
            className={`brutalist-stepper-btn ${isPressed.inc ? 'pressed' : ''}`}
            onMouseDown={() => handleButtonPress('inc', true)}
            onMouseUp={() => handleButtonPress('inc', false)}
            onMouseLeave={() => handleButtonPress('inc', false)}
            onTouchStart={() => handleButtonPress('inc', true)}
            onTouchEnd={() => handleButtonPress('inc', false)}
            disabled={value >= max}
            title={`Increase ${label} (${step}${unit})`}
            aria-label={`Increase ${label}`}
          >
            <span className="brutalist-stepper-btn-icon">+</span>
          </button>
        </div>
        
        {/* Quick preset buttons for common values */}
        {(label === 'Number of Lines' || label === 'X-Height' || label === 'Slant Angle') && (
          <div className="brutalist-stepper-presets">
            {label === 'Number of Lines' && [8, 12, 16, 20].map(preset => (
              <button
                key={preset}
                onClick={() => onChange(preset)}
                className={`brutalist-preset-btn ${value === preset ? 'active' : ''}`}
                title={`Set to ${preset} lines`}
              >
                {preset}
              </button>
            ))}
            {label === 'X-Height' && [3, 4, 5, 6].map(preset => (
              <button
                key={preset}
                onClick={() => onChange(preset)}
                className={`brutalist-preset-btn ${value === preset ? 'active' : ''}`}
                title={`Set to ${preset}mm`}
              >
                {preset}
              </button>
            ))}
            {label === 'Slant Angle' && [55, 75, 85, 90].map(preset => (
              <button
                key={preset}
                onClick={() => onChange(preset)}
                className={`brutalist-preset-btn ${value === preset ? 'active' : ''}`}
                title={`Set to ${preset}° from baseline`}
              >
                {preset}°
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Enhanced checkbox component
  const BrutalistCheckbox = ({ label, checked, onChange }) => (
    <div className="brutalist-checkbox-item" onClick={() => onChange(!checked)}>
      <div className="brutalist-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div className="brutalist-checkbox-mark"></div>
      </div>
      <span className="brutalist-checkbox-label">{label}</span>
    </div>
  );

  return (
    <div className="brutalist-container">
      {/* Control Panel */}
      <div className="brutalist-panel no-print">
        {/* Header */}
        <div className="brutalist-section accent">
          <h1 className="brutalist-title">Practice<br/>Sheet<br/>Generator</h1>
          <p className="brutalist-mono" style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
            HANDWRITING · A4 · EDUCATION
          </p>
        </div>

        {/* Page Settings */}
        <div className="brutalist-section">
          <h3 className="brutalist-section-title">Page Settings</h3>
          
          {/* Orientation Toggle */}
          <div className="brutalist-checkbox-container" style={{ marginBottom: '1rem' }}>
            <button
              onClick={toggleOrientation}
              className="brutalist-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCcw size={16} />
              {pageSettings.orientation === 'portrait' ? 'Switch to Landscape' : 'Switch to Portrait'}
            </button>
          </div>

          {/* Custom Size Toggle */}
          <div className="brutalist-checkbox-container" style={{ marginBottom: '1rem' }}>
            <BrutalistCheckbox
              label="Custom Size"
              checked={pageSettings.customSize}
              onChange={(value) => updatePageSetting('customSize', value)}
            />
          </div>

          {/* Custom Size Inputs */}
          {pageSettings.customSize && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="brutalist-input-container">
                <label className="brutalist-label">Width (mm)</label>
                <input
                  type="number"
                  value={pageSettings.width}
                  onChange={(e) => updatePageSetting('width', parseFloat(e.target.value) || 0)}
                  className="brutalist-input"
                  min="50"
                  max="500"
                  step="1"
                />
              </div>
              <div className="brutalist-input-container">
                <label className="brutalist-label">Height (mm)</label>
                <input
                  type="number"
                  value={pageSettings.height}
                  onChange={(e) => updatePageSetting('height', parseFloat(e.target.value) || 0)}
                  className="brutalist-input"
                  min="50"
                  max="500"
                  step="1"
                />
              </div>
            </div>
          )}

          {/* Current Size Display */}
          <div className="brutalist-mono" style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Current: {CURRENT_WIDTH} × {CURRENT_HEIGHT} mm
            {!pageSettings.customSize && ` (A4 ${pageSettings.orientation})`}
          </div>
        </div>

        {/* Typography & Style Controls */}
        <div className="brutalist-section">
          <h3 className="brutalist-section-title">Typography & Style</h3>
          
          {/* Compact dual steppers */}
          <div className="brutalist-dual-stepper">
            <BrutalistStepper
              label="Number of Lines"
              value={settings.numberOfLines}
              onChange={(value) => updateSetting('numberOfLines', value)}
              min={5}
              max={25}
              step={1}
              unit=""
            />
            <BrutalistStepper
              label="Ascender Height"
              value={settings.ascenderHeight}
              onChange={(value) => updateSetting('ascenderHeight', value)}
              min={4}
              max={30}
              step={0.25}
              unit="mm"
            />
          </div>
          
          <div className="brutalist-dual-stepper">
            <BrutalistStepper
              label="X-Height"
              value={settings.xHeight}
              onChange={(value) => updateSetting('xHeight', value)}
              min={2.5}
              max={8}
              step={0.25}
              unit="mm"
            />
            <BrutalistStepper
              label="Slant Angle"
              value={settings.slantAngle}
              onChange={(value) => updateSetting('slantAngle', value)}
              min={45}
              max={135}
              step={0.5}
              unit="°"
            />
          </div>
          
          <div className="brutalist-dual-stepper">
            <BrutalistStepper
              label="Interline Spacing"
              value={settings.interlineSpacing}
              onChange={(value) => updateSetting('interlineSpacing', value)}
              min={2}
              max={20}
              step={0.5}
              unit="mm"
            />
            <BrutalistStepper
              label="Baseline Thick"
              value={settings.baselineThickness}
              onChange={(value) => updateSetting('baselineThickness', value)}
              min={0.1}
              max={2.0}
              step={0.05}
              unit="mm"
            />
          </div>
        </div>

        {/* Guide Lines */}
        <div className="brutalist-section">
          <h3 className="brutalist-section-title">Guide Lines</h3>
          <div className="brutalist-checkbox-grid">
            <BrutalistCheckbox
              label="X-Height"
              checked={settings.showXHeight}
              onChange={(value) => updateSetting('showXHeight', value)}
            />
            <BrutalistCheckbox
              label="Ascender"
              checked={settings.showAscender}
              onChange={(value) => updateSetting('showAscender', value)}
            />
            <BrutalistCheckbox
              label="Descender"
              checked={settings.showDescender}
              onChange={(value) => updateSetting('showDescender', value)}
            />
            <BrutalistCheckbox
              label="Slant Lines"
              checked={settings.showSlantLines}
              onChange={(value) => updateSetting('showSlantLines', value)}
            />
            <BrutalistCheckbox
              label="Labels"
              checked={settings.showLineLabels}
              onChange={(value) => updateSetting('showLineLabels', value)}
            />
            <BrutalistCheckbox
              label="Grid"
              checked={settings.showGrid}
              onChange={(value) => updateSetting('showGrid', value)}
            />
          </div>
        </div>

        {/* Export Controls */}
        <div className="brutalist-section">
          <h3 className="brutalist-section-title">Export</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={exportPDF}
              className="brutalist-btn-accent"
            >
              <FileDown size={16} />
              Export PDF
            </button>
            <button
              onClick={printTemplate}
              className="brutalist-btn-accent"
            >
              <Printer size={16} />
              Print Sheet
            </button>
            <button
              onClick={exportSVG}
              className="brutalist-btn-accent"
            >
              <Download size={16} />
              Download SVG
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="brutalist-canvas-area">
        <div 
          className="brutalist-canvas" 
          style={{ width: CURRENT_WIDTH * SCALE_FACTOR, height: CURRENT_HEIGHT * SCALE_FACTOR }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${CURRENT_WIDTH} ${CURRENT_HEIGHT}`}
            className="practice-sheet-text"
          >
            {/* Page background */}
            <rect width={CURRENT_WIDTH} height={CURRENT_HEIGHT} fill="white" />
            
            {/* Margin guides */}
            <g opacity="0.3">
              <line {...marginGuides.top} stroke={settings.marginColor} strokeWidth="0.5" strokeDasharray="2,2" />
              <line {...marginGuides.bottom} stroke={settings.marginColor} strokeWidth="0.5" strokeDasharray="2,2" />
              <line {...marginGuides.left} stroke={settings.marginColor} strokeWidth="0.5" strokeDasharray="2,2" />
              <line {...marginGuides.right} stroke={settings.marginColor} strokeWidth="0.5" strokeDasharray="2,2" />
            </g>
            
            {/* Define clipping path for writing area only */}
            <defs>
              <clipPath id="writingAreaClip">
                <rect 
                  x={settings.marginLeft} 
                  y={settings.marginTop} 
                  width={CURRENT_WIDTH - settings.marginLeft - settings.marginRight} 
                  height={CURRENT_HEIGHT - settings.marginTop - settings.marginBottom} 
                />
              </clipPath>
            </defs>
            
            {/* Slant lines - clipped to writing area only */}
            {settings.showSlantLines && settings.slantAngle !== 0 && (
              <g opacity={settings.slantLineOpacity} clipPath="url(#writingAreaClip)">
                {slantLines.map((line, i) => (
                  <line
                    key={`slant-${i}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={settings.slantLineColor}
                    strokeWidth="0.2"
                  />
                ))}
              </g>
            )}
            
            {/* Grid lines */}
            {settings.showGrid && (
              <g opacity={settings.guidelineOpacity}>
                {verticalLines.map((line, i) => (
                  <line
                    key={`v-${i}`}
                    x1={line.x}
                    y1={line.y1}
                    x2={line.x}
                    y2={line.y2}
                    stroke={settings.guidelineColor}
                    strokeWidth="0.1"
                    strokeDasharray="1,1"
                  />
                ))}
                {horizontalLines.map((line, i) => (
                  <line
                    key={`h-${i}`}
                    x1={line.x1}
                    y1={line.y}
                    x2={line.x2}
                    y2={line.y}
                    stroke={settings.guidelineColor}
                    strokeWidth="0.1"
                    strokeDasharray="1,1"
                  />
                ))}
              </g>
            )}
            
            {/* Typography lines */}
            {lines.map((lineSet, i) => (
              <g key={`line-set-${i}`}>
                {/* Line Labels - enhanced positioning */}
                {settings.showLineLabels && lineSet.lineIndex === 0 && (
                  <g opacity="0.7" className="practice-sheet-labels">
                    {/* Ascender label */}
                    {settings.showAscender && (
                      <text
                        x={settings.marginLeft - 12}
                        y={lineSet.ascenderLine + 1}
                        fontSize="2.5"
                        fill="#666"
                        textAnchor="middle"
                        fontFamily="ArkSans"
                        fontWeight="bold"
                      >
                        A
                      </text>
                    )}
                    
                    {/* Cap height label */}
                    {settings.showCapHeight && (
                      <text
                        x={settings.marginLeft - 12}
                        y={lineSet.capHeightLine + 1}
                        fontSize="2.5"
                        fill="#666"
                        textAnchor="middle"
                        fontFamily="ArkSans"
                        fontWeight="bold"
                      >
                        C
                      </text>
                    )}
                    
                    {/* X-height label */}
                    {settings.showXHeight && (
                      <text
                        x={settings.marginLeft - 12}
                        y={lineSet.xHeightLine + 1}
                        fontSize="2.5"
                        fill="#666"
                        textAnchor="middle"
                        fontFamily="ArkSans"
                        fontWeight="bold"
                      >
                        X
                      </text>
                    )}
                    
                    {/* Baseline label */}
                    <text
                      x={settings.marginLeft - 12}
                      y={lineSet.baseline + 1}
                      fontSize="2.5"
                      fill="#666"
                      textAnchor="middle"
                      fontFamily="ArkSans"
                      fontWeight="bold"
                    >
                      B
                    </text>
                    
                    {/* Descender label */}
                    {settings.showDescender && (
                      <text
                        x={settings.marginLeft - 12}
                        y={lineSet.descenderLine + 1}
                        fontSize="2.5"
                        fill="#666"
                        textAnchor="middle"
                        fontFamily="ArkSans"
                        fontWeight="bold"
                      >
                        D
                      </text>
                    )}
                  </g>
                )}
                
                {/* Baseline - always shown, thicker */}
                <line
                  x1={settings.marginLeft}
                  y1={lineSet.baseline}
                  x2={CURRENT_WIDTH - settings.marginRight}
                  y2={lineSet.baseline}
                  stroke={settings.baselineColor}
                  strokeWidth={settings.baselineThickness}
                  opacity={settings.baselineOpacity}
                />
                
                {/* X-height line */}
                {settings.showXHeight && (
                  <line
                    x1={settings.marginLeft}
                    y1={lineSet.xHeightLine}
                    x2={CURRENT_WIDTH - settings.marginRight}
                    y2={lineSet.xHeightLine}
                    stroke={settings.guidelineColor}
                    strokeWidth={settings.guidelineThickness}
                    opacity={settings.guidelineOpacity}
                  />
                )}
                
                {/* Cap height line */}
                {settings.showCapHeight && (
                  <line
                    x1={settings.marginLeft}
                    y1={lineSet.capHeightLine}
                    x2={CURRENT_WIDTH - settings.marginRight}
                    y2={lineSet.capHeightLine}
                    stroke={settings.guidelineColor}
                    strokeWidth="0.2"
                    opacity={settings.guidelineOpacity}
                    strokeDasharray="4,2"
                  />
                )}
                
                {/* Ascender line */}
                {settings.showAscender && (
                  <line
                    x1={settings.marginLeft}
                    y1={lineSet.ascenderLine}
                    x2={CURRENT_WIDTH - settings.marginRight}
                    y2={lineSet.ascenderLine}
                    stroke={settings.guidelineColor}
                    strokeWidth={settings.guidelineThickness}
                    opacity={settings.guidelineOpacity}
                  />
                )}
                
                {/* Descender line */}
                {settings.showDescender && (
                  <line
                    x1={settings.marginLeft}
                    y1={lineSet.descenderLine}
                    x2={CURRENT_WIDTH - settings.marginRight}
                    y2={lineSet.descenderLine}
                    stroke={settings.guidelineColor}
                    strokeWidth={settings.guidelineThickness}
                    opacity={settings.guidelineOpacity}
                  />
                )}
              </g>
            ))}
            
            {/* Enhanced Legend - positioned at bottom to avoid overlap */}
            <g transform={`translate(${settings.marginLeft}, ${CURRENT_HEIGHT - settings.marginBottom + 2})`}>
              <rect x="0" y="0" width="65" height="12" fill="white" fillOpacity="0.95" stroke="#ddd" strokeWidth="0.1"/>
              <text x="2" y="4" fontSize="2" fill="#333" fontWeight="bold" fontFamily="ArkSans">
                Handwriting Practice Sheet
              </text>
              
              {settings.showLineLabels && (
                <g fontSize="1" fill="#666" fontFamily="ArkSans">
                  <text x="2" y="7">
                    {[
                      settings.showAscender && 'A=Ascender',
                      settings.showCapHeight && 'C=Cap Height', 
                      settings.showXHeight && 'X=X-Height',
                      'B=Baseline',
                      settings.showDescender && 'D=Descender'
                    ].filter(Boolean).join(' • ')}
                  </text>
                </g>
              )}
              
              {!settings.showLineLabels && (
                <g>
                  <line x1="2" y1="7" x2="6" y2="7" stroke={settings.baselineColor} strokeWidth={settings.baselineThickness}/>
                  <text x="8" y="8" fontSize="1" fill="#333" fontFamily="ArkSans">Baseline</text>
                  {settings.showSlantLines && settings.slantAngle !== 0 && (
                    <>
                      <line x1="25" y1="7" x2="29" y2="7" stroke={settings.slantLineColor} strokeWidth="0.2"/>
                      <text x="31" y="8" fontSize="1" fill="#333" fontFamily="ArkSans">
                        Slant {settings.slantAngle}° from baseline
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HandwritingTemplateGenerator; 