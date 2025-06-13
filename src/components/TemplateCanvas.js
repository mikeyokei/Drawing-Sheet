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
      {/* Header */}
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

      {/* Canvas Container */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="flex justify-center">
          <div className="canvas-container">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Info */}
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