// src/components/maps/OSMMapControls.jsx
import React from 'react';
import { PlusIcon, MinusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const OSMMapControls = ({ onZoomIn, onZoomOut, onRecenter }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Zoom in"
      >
        <PlusIcon className="h-5 w-5 text-gray-600" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Zoom out"
      >
        <MinusIcon className="h-5 w-5 text-gray-600" />
      </button>
      
      <button
        onClick={onRecenter}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Recenter map"
      >
        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default OSMMapControls;