import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';

const TemplateCard = ({ template, onUseTemplate }) => {
  const {
    id,
    title,
    description,
    destination,
    duration,
    image,
    highlights,
    budget,
    tags,
  } = template;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Duration Badge */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{duration} days</span>
          </div>
        </div>
        
        {/* Budget Badge */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">${budget}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm">{destination}</span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

        {/* Highlights */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">HIGHLIGHTS</p>
          <div className="flex flex-wrap gap-2">
            {highlights.slice(0, 3).map((highlight, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
              >
                {highlight}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{highlights.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onUseTemplate(template)}
          className="w-full btn-primary"
        >
          Use This Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;