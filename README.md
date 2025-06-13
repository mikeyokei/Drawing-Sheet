# Handwriting Template Generator

A professional web-based application for generating customizable A4 handwriting practice templates for italic handwriting and calligraphy scripts.

## Features

### 🎯 Core Functionality
- **Customizable Typography Metrics**: Adjust baseline, x-height, cap height, ascender, and descender ratios
- **Multiple Script Presets**: Italic Foundational, Copperplate, Spencerian, Modern Calligraphy
- **Slant Angle Control**: Adjustable italic angles with visual guidelines
- **Professional Grid Systems**: Ruled lines, dotted grid, or custom spacing
- **Print-Ready Output**: High-resolution PDF export optimized for printing

### 🎨 Customization Options
- **Typography Controls**: Fine-tune all letter proportions and spacing
- **Layout Options**: Adjustable margins, line count, letter and word spacing
- **Color Customization**: Customizable colors for baselines, guidelines, and grids
- **Grid Options**: Multiple grid types with opacity control
- **Real-time Preview**: Instant visual feedback for all adjustments

### 📄 Export Features
- **High-Quality PDF**: 300 DPI export for crisp printing
- **A4 Format**: Standard paper size (210 × 297mm)
- **Professional Templates**: Ready for classroom or personal use

## Technology Stack

- **Frontend**: React.js with modern hooks
- **Canvas Rendering**: Fabric.js for precise line drawing
- **PDF Generation**: jsPDF for high-quality document export
- **State Management**: Zustand for lightweight state handling
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage Guide

### 1. Selecting Presets
- Choose from pre-configured calligraphy styles in the control panel
- **Italic Foundational**: Standard italic practice (7° slant)
- **Copperplate**: Pointed pen script (12° slant)
- **Spencerian**: American cursive style (15° slant)
- **Modern Calligraphy**: Contemporary brush lettering (10° slant)

### 2. Customizing Typography
- **Base Size**: Overall scale of the template (10-50mm)
- **X-Height Ratio**: Height of lowercase letters (0.2-0.8)
- **Cap Height**: Height of uppercase letters (0.4-1.0)
- **Ascender/Descender**: Height above/below baseline (0.1-1.2)
- **Line Spacing**: Distance between writing lines (1.0-3.0)
- **Slant Angle**: Italic angle in degrees (0-20°)

### 3. Layout Controls
- **Number of Lines**: How many practice lines to include (5-20)
- **Letter Spacing**: Horizontal guides for character width (2-10mm)
- **Word Spacing**: Guides for word separation (5-25mm)

### 4. Grid and Visual Options
- **Grid Type**: Choose between ruled lines, dotted grid, or no grid
- **Opacity**: Adjust visibility of guide lines (0.1-1.0)
- **Colors**: Customize baseline, grid, and slant line colors
- **Show/Hide**: Toggle slant lines and grid visibility

### 5. Exporting Templates
- Click "Export PDF" to generate a high-resolution file
- Files are optimized for printing at 300 DPI
- Templates maintain precise measurements when printed

## Project Structure

```
src/
├── components/
│   ├── ControlPanel.js      # Main control interface
│   └── TemplateCanvas.js    # Canvas preview component
├── store/
│   └── templateStore.js     # Zustand state management
├── utils/
│   ├── templateGenerator.js # Core template generation engine
│   └── pdfExporter.js      # PDF export functionality
├── App.js                  # Main application component
├── index.js               # React entry point
└── index.css             # Global styles and Tailwind imports
```

## Typography Standards

The app follows professional calligraphy standards:

### Measurement Ratios
- **X-Height**: Base measurement for lowercase letters
- **Cap Height**: Typically 1.4-2x the x-height
- **Ascenders**: Letters like 'h', 'b', 'k' extending above x-height
- **Descenders**: Letters like 'g', 'j', 'p' extending below baseline

### Italic Angles
- **Foundational Italic**: 5-10° for readability
- **Copperplate**: 10-15° for elegance
- **Spencerian**: 12-18° for flowing style

## Development

### Available Scripts
- `npm start`: Development server with hot reload
- `npm run build`: Production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (irreversible)

### Key Dependencies
- `react`: ^18.2.0 - Core React library
- `fabric`: ^5.3.0 - Canvas manipulation library
- `jspdf`: ^2.5.1 - PDF generation
- `zustand`: ^4.4.1 - State management
- `lucide-react`: ^0.263.1 - Icon library
- `tailwindcss`: ^3.3.2 - Utility-first CSS framework

## Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure all dependencies are installed correctly
3. Verify browser compatibility
4. Clear browser cache if experiencing rendering issues

---

**Created with ❤️ for the calligraphy and handwriting community** 