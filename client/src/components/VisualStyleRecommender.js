import React, { useState } from 'react';

const VisualStyleRecommender = () => {
  const [selectedVibe, setSelectedVibe] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const vibes = [
    { value: 'modern-clean', label: 'Modern & Clean' },
    { value: 'friendly-local', label: 'Friendly & Local' },
    { value: 'classic-professional', label: 'Classic & Professional' },
    { value: 'bold-eye-catching', label: 'Bold & Eye-catching' }
  ];

  const getRecommendations = async () => {
    if (!selectedVibe) {
      setError('Please select a vibe first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/style-recommendations?business_type=retail&vibe=${selectedVibe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error('Error fetching style recommendations:', err);
      
      // Fallback to mock data for demonstration
      setRecommendations(getMockRecommendations(selectedVibe));
    } finally {
      setIsLoading(false);
    }
  };

  const getMockRecommendations = (vibe) => {
    const mockData = {
      'modern-clean': {
        colorPalettes: [
          { name: 'Primary', colors: ['#2563EB', '#1E40AF', '#1D4ED8'], description: 'Trust and reliability' },
          { name: 'Accent', colors: ['#F3F4F6', '#E5E7EB', '#D1D5DB'], description: 'Clean backgrounds' },
          { name: 'Highlight', colors: ['#10B981', '#059669', '#047857'], description: 'Success actions' }
        ],
        imagery: [
          'Clean product photography with white backgrounds',
          'Minimal geometric patterns and shapes',
          'Professional business photography',
          'Simple icons and illustrations'
        ],
        fontPairings: [
          { primary: 'Inter', secondary: 'system-ui', style: 'sans-serif' },
          { primary: 'Roboto', secondary: 'Arial', style: 'sans-serif' }
        ],
        mockText: 'Modern+Business'
      },
      'friendly-local': {
        colorPalettes: [
          { name: 'Warm', colors: ['#F59E0B', '#D97706', '#B45309'], description: 'Welcoming and approachable' },
          { name: 'Natural', colors: ['#84CC16', '#65A30D', '#4D7C0F'], description: 'Fresh and organic' },
          { name: 'Comfort', colors: ['#EF4444', '#DC2626', '#B91C1C'], description: 'Energy and warmth' }
        ],
        imagery: [
          'Local community photos and events',
          'Warm, natural lighting in photography',
          'Hand-drawn illustrations and doodles',
          'Authentic customer testimonial photos'
        ],
        fontPairings: [
          { primary: 'Poppins', secondary: 'sans-serif', style: 'rounded' },
          { primary: 'Nunito', secondary: 'Arial', style: 'friendly' }
        ],
        mockText: 'Local+Community'
      },
      'classic-professional': {
        colorPalettes: [
          { name: 'Traditional', colors: ['#1F2937', '#374151', '#4B5563'], description: 'Authority and expertise' },
          { name: 'Elegant', colors: ['#7C2D12', '#92400E', '#A16207'], description: 'Premium quality' },
          { name: 'Refined', colors: ['#1E3A8A', '#1E40AF', '#2563EB'], description: 'Professional trust' }
        ],
        imagery: [
          'Professional headshots and office photography',
          'Classic architectural elements',
          'Elegant product arrangements',
          'Traditional business imagery'
        ],
        fontPairings: [
          { primary: 'Playfair Display', secondary: 'Georgia', style: 'serif' },
          { primary: 'Source Sans Pro', secondary: 'Arial', style: 'professional' }
        ],
        mockText: 'Professional+Service'
      },
      'bold-eye-catching': {
        colorPalettes: [
          { name: 'Vibrant', colors: ['#EC4899', '#DB2777', '#BE185D'], description: 'High impact and energy' },
          { name: 'Electric', colors: ['#8B5CF6', '#7C3AED', '#6D28D9'], description: 'Creative and bold' },
          { name: 'Dynamic', colors: ['#F97316', '#EA580C', '#C2410C'], description: 'Action and excitement' }
        ],
        imagery: [
          'High-contrast photography with dramatic lighting',
          'Bold graphic elements and patterns',
          'Dynamic action shots and movement',
          'Bright, saturated color photography'
        ],
        fontPairings: [
          { primary: 'Montserrat', secondary: 'Arial Black', style: 'bold' },
          { primary: 'Oswald', secondary: 'Impact', style: 'strong' }
        ],
        mockText: 'Bold+Impact'
      }
    };

    return mockData[vibe] || mockData['modern-clean'];
  };

  const ColorSwatch = ({ color, name }) => (
    <div className="group relative">
      <div 
        className="w-12 h-12 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-110"
        style={{ backgroundColor: color }}
        title={color}
      />
      <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {color}
      </div>
    </div>
  );

  const FontSample = ({ fontPairing, text }) => {
    const fontStyles = {
      'serif': { fontFamily: 'Georgia, serif' },
      'sans-serif': { fontFamily: 'system-ui, sans-serif' },
      'rounded': { fontFamily: 'ui-rounded, system-ui, sans-serif' },
      'friendly': { fontFamily: 'ui-rounded, system-ui, sans-serif' },
      'professional': { fontFamily: 'system-ui, sans-serif' },
      'bold': { fontFamily: 'system-ui, sans-serif', fontWeight: 'bold' },
      'strong': { fontFamily: 'system-ui, sans-serif', fontWeight: '800' }
    };

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div 
          className="text-2xl font-bold mb-2"
          style={fontStyles[fontPairing.style]}
        >
          {fontPairing.primary}
        </div>
        <div 
          className="text-sm text-gray-600"
          style={fontStyles[fontPairing.style]}
        >
          Sample text: {text}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">🎨 Visual Style Guidance</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Your Brand Vibe
        </label>
        <div className="flex gap-4 items-center">
          <select
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select a vibe...</option>
            {vibes.map((vibe) => (
              <option key={vibe.value} value={vibe.value}>
                {vibe.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={getRecommendations}
            disabled={isLoading || !selectedVibe}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Get Suggestions'}
          </button>
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {recommendations && (
        <div className="transition-opacity duration-300 opacity-100">
          {/* Color Palettes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palettes</h3>
            <div className="grid gap-6 md:grid-cols-3">
              {recommendations.colorPalettes.map((palette, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2">{palette.name}</h4>
                  <div className="flex gap-2 mb-3">
                    {palette.colors.map((color, colorIndex) => (
                      <ColorSwatch key={colorIndex} color={color} name={palette.name} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{palette.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Imagery Suggestions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagery Suggestions</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <ul className="space-y-2">
                {recommendations.imagery.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Font Pairings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Pairings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.fontPairings.map((fontPairing, index) => (
                <FontSample 
                  key={index} 
                  fontPairing={fontPairing} 
                  text="Your Business Name"
                />
              ))}
            </div>
          </div>

          {/* Mock Style Tile */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Preview</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <img
                src={`https://placehold.co/600x400/${recommendations.colorPalettes[0].colors[0].substring(1)}/white?text=${recommendations.mockText}&font=montserrat`}
                alt="Style tile preview"
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/600x400/${recommendations.colorPalettes[0].colors[0].substring(1)}/ffffff?text=${recommendations.mockText}`;
                }}
              />
              <p className="text-sm text-gray-600 text-center mt-2">
                Sample style tile with your selected color palette
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualStyleRecommender;