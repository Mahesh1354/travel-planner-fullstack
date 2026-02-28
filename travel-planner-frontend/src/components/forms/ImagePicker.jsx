    import React, { useState } from 'react';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Sample cover images from Unsplash
const SAMPLE_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format',
    title: 'Adventure',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format',
    title: 'Beach',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format',
    title: 'Forest',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format',
    title: 'Mountains',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format',
    title: 'City',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format',
    title: 'Desert',
  },
];

const ImagePicker = ({ selectedImage, onSelect }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload - In production, you'd upload to a server/cloud storage
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      onSelect(imageUrl);
      setUploading(false);
    }, 1500);
  };

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-4">
        <label className="block">
          <span className="sr-only">Choose photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center btn-secondary"
          >
            <PhotoIcon className="h-5 w-5 mr-2" />
            Upload Custom Image
          </label>
        </label>
        {uploading && (
          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
        )}
      </div>

      {/* Sample Images Grid */}
      <p className="text-sm text-gray-500 mb-3">Or choose from our collection:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SAMPLE_IMAGES.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(image.url)}
            className={`relative rounded-lg overflow-hidden aspect-video group ${
              selectedImage === image.url ? 'ring-4 ring-primary-500' : 'hover:opacity-75'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            {selectedImage === image.url && (
              <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white font-medium">{image.title}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImagePicker;