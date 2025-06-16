import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, Image, Download, Copy, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ColorPalette {
  name: string;
  palette: string[];
}

interface StyleRecommendations {
  colors: ColorPalette[];
  imagery: string[];
  fonts: {
    headline: string;
    body: string;
  };
  mock_tile_text: string;
  business_context?: {
    color_description: string;
    font_style: string;
  };
  metadata?: {
    business_type: string;
    vibe: string;
    generated_at: string;
  };
}

const VIBE_OPTIONS = [
  { value: "modern-clean", label: "Modern & Clean" },
  { value: "friendly-local", label: "Friendly & Local" },
  { value: "classic-professional", label: "Classic & Professional" },
  { value: "bold-eye-catching", label: "Bold & Eye-catching" }
];

export default function VisualStyleGuide() {
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [recommendations, setRecommendations] = useState<StyleRecommendations | null>(null);
  const { toast } = useToast();

  const generateStylesMutation = useMutation({
    mutationFn: async (vibe: string) => {
      // Get business type from localStorage if available
      const campaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
      let businessType = 'retail';
      
      if (campaigns.length > 0) {
        const latestCampaign = campaigns[campaigns.length - 1];
        if (latestCampaign.content?.includes('restaurant')) {
          businessType = 'restaurant';
        } else if (latestCampaign.content?.includes('service')) {
          businessType = 'services';
        }
      }

      const response = await apiRequest(
        "GET",
        `/api/style-recommendations?business_type=${businessType}&vibe=${encodeURIComponent(vibe)}`
      );
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast({
        title: "Style recommendations generated!",
        description: "Your personalized brand style guide is ready."
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating recommendations",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateStyles = () => {
    if (!selectedVibe) {
      toast({
        title: "Please select a vibe",
        description: "Choose a brand vibe to get personalized recommendations.",
        variant: "destructive"
      });
      return;
    }
    generateStylesMutation.mutate(selectedVibe);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} copied!`,
        description: "Added to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const ColorPaletteCard = ({ palette }: { palette: ColorPalette }) => (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{palette.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          {palette.palette.map((color, index) => (
            <div key={index} className="group relative">
              <div 
                className="w-12 h-12 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-110" 
                style={{ backgroundColor: color }}
                title={color}
                onClick={() => copyToClipboard(color, "Color")}
              />
              <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {color}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Perfect for {recommendations?.metadata?.business_type || 'your business'}
        </p>
      </CardContent>
    </Card>
  );

  const FontCard = ({ title, fontFamily, description }: { title: string; fontFamily: string; description: string }) => (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="text-2xl font-bold mb-2" style={{ fontFamily }}>
          {title}
        </div>
        <div className="text-sm text-gray-600 mb-2">{description}</div>
        <div className="text-base" style={{ fontFamily }}>
          Sample: Your Business Name Here
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => copyToClipboard(fontFamily, "Font")}
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy Font
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visual Style Guide</h1>
        <p className="text-gray-600">
          Get personalized brand recommendations to create cohesive, professional marketing materials
        </p>
      </div>

      {/* Vibe Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Choose Your Brand Vibe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedVibe} onValueChange={setSelectedVibe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand vibe..." />
                </SelectTrigger>
                <SelectContent>
                  {VIBE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateStyles} 
              disabled={!selectedVibe || generateStylesMutation.isPending}
            >
              {generateStylesMutation.isPending ? "Generating..." : "Get Suggestions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations && (
        <div className="space-y-6">
          {/* Color Palettes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Palettes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.colors.map((palette, index) => (
                  <ColorPaletteCard key={index} palette={palette} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FontCard
                  title={recommendations.fonts.headline || "Headline Font"}
                  fontFamily={recommendations.fonts.headline || "Arial"}
                  description="Perfect for headlines and titles"
                />
                <FontCard
                  title={recommendations.fonts.body || "Body Font"}
                  fontFamily={recommendations.fonts.body || "Arial"}
                  description="Ideal for descriptions and content"
                />
              </div>
              {recommendations.business_context && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Typography Tip:</strong> {recommendations.business_context.font_style}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Imagery Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Imagery Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.imagery.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
              {recommendations.business_context && (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>For Your Business:</strong> {recommendations.business_context.color_description}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Style Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Style Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <img 
                  src={`https://placehold.co/600x400/${recommendations.colors[0]?.palette[0]?.substring(1) || '2563EB'}/white?text=${encodeURIComponent(recommendations.mock_tile_text || 'Your Business')}&font=montserrat`}
                  alt="Style tile preview" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/600x400/${recommendations.colors[0]?.palette[0]?.substring(1) || '2563EB'}/ffffff?text=${encodeURIComponent(recommendations.mock_tile_text || 'Your Business')}`;
                  }}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Style preview for {recommendations.metadata?.vibe || 'your selected vibe'}
                </p>
                {recommendations.metadata && (
                  <div className="mt-3 flex justify-center gap-2">
                    <Badge variant="secondary">
                      {recommendations.metadata.business_type}
                    </Badge>
                    <Badge variant="outline">
                      {recommendations.metadata.vibe}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}