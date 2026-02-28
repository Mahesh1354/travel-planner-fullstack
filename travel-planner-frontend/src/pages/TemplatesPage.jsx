import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripTemplates, templateCategories } from '../data/tripTemplates';
import tripsAPI from '../api/trips';
import TemplateCard from '../components/template/TemplateCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // popular, duration, budget

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return tripTemplates
      .filter(template => {
        // Category filter
        if (selectedCategory !== 'all' && !template.tags.includes(selectedCategory)) {
          return false;
        }

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            template.title.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query) ||
            template.destination.toLowerCase().includes(query) ||
            template.tags.some(tag => tag.includes(query))
          );
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'duration':
            return a.duration - b.duration;
          case 'budget':
            return a.budget - b.budget;
          default:
            // 'popular' - keep as is
            return 0;
        }
      });
  }, [searchQuery, selectedCategory, sortBy]);

  // Create trip from template
  const createFromTemplateMutation = useMutation({
    mutationFn: (template) => {
      const tripData = {
        title: template.title,
        description: template.description,
        destination: template.destination,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        coverImage: template.image,
        isPublic: false,
      };
      return tripsAPI.createTrip(tripData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created from template!');
      navigate(`/trip/${response.data.id}/itinerary`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create trip');
    },
  });

  const handleUseTemplate = (template) => {
    createFromTemplateMutation.mutate(template);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-8 w-8 text-primary-600 mr-2" />
            Trip Templates
          </h1>
          <p className="text-gray-600 mt-2">
            Start with a pre-planned itinerary and customize it to your needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by destination, activity, or vibe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="popular">Most Popular</option>
              <option value="duration">Shortest First</option>
              <option value="budget">Budget (Low to High)</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {templateCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {createFromTemplateMutation.isPending && (
          <div className="mb-4">
            <LoadingSpinner />
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <img
              src="https://illustrations.popsy.co/white/searching.svg"
              alt="No templates"
              className="w-48 h-48 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more templates
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUseTemplate={handleUseTemplate}
              />
            ))}
          </div>
        )}

        {/* Create Custom Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Don't see what you're looking for?</p>
          <Link
            to="/create-trip"
            className="btn-secondary inline-flex items-center"
          >
            Create Custom Trip
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;