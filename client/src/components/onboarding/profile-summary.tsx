import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Edit, 
  Download, 
  ArrowRight,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Target,
  TrendingUp,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileSummaryProps {
  businessId: number;
  onEditSection: (section: string) => void;
  onContinue: () => void;
}

export default function ProfileSummary({ businessId, onEditSection, onContinue }: ProfileSummaryProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Load complete business profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/business-profile', businessId, 'complete'],
    queryFn: () => apiRequest(`/api/business-profile/${businessId}/complete`),
  });

  // Export profile mutation
  const exportProfile = useMutation({
    mutationFn: async () => {
      setIsExporting(true);
      const response = await fetch(`/api/business-profile/${businessId}/export`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${profile?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'business'}_profile.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Profile Exported",
        description: "Your business profile has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "Failed to export profile. Please try again.",
      });
    },
    onSettled: () => {
      setIsExporting(false);
    }
  });

  const getMarketingGoalLabel = (goal: string) => {
    const goals = {
      "increase-awareness": "Increase Brand Awareness",
      "drive-foot-traffic": "Drive Foot Traffic", 
      "generate-leads": "Generate Leads",
      "boost-sales": "Boost Sales",
      "promote-events": "Promote Events",
      "build-community": "Build Community"
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const getBudgetTierLabel = (tier: string) => {
    const tiers = {
      "50-200": "$50 - $200",
      "201-500": "$201 - $500",
      "501-1000": "$501 - $1,000", 
      "1000+": "$1,000+"
    };
    return tiers[tier as keyof typeof tiers] || tier;
  };

  const getCommunityInvolvementLabel = (level: string) => {
    const levels = {
      "high": "High - Very active in local events and community groups",
      "medium": "Medium - Occasionally participates in local activities",
      "low": "Low - Limited community involvement",
      "none": "None - Primarily focused on personal interests"
    };
    return levels[level as keyof typeof levels] || level;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile summary...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load business profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-4">
      <div className="max-w-5xl mx-auto px-4 print:px-0">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6 print:shadow-none print:border-none">
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">{profile.name}</h1>
              <p className="text-lg text-gray-600 mt-1">Business Profile Summary</p>
            </div>
            <div className="flex items-center gap-2">
              {profile.completeness?.overall ? (
                <Badge className="bg-green-100 text-green-800 print:bg-transparent print:border">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>
          
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{profile.city || profile.address}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Business Overview */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Business Overview
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection('business')}
                  className="print:hidden"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Industry</h4>
                <p className="text-gray-600">{profile.industry}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Business Type</h4>
                <p className="text-gray-600">
                  {profile.businessType}
                  {profile.customBusinessType && ` - ${profile.customBusinessType}`}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                <p className="text-gray-600">{profile.address}</p>
              </div>
              {profile.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{profile.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Service Details */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location & Service Details
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection('location')}
                  className="print:hidden"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.city && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Primary City</h4>
                  <p className="text-gray-600">{profile.city}</p>
                </div>
              )}
              {profile.primaryNeighborhood && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Primary Neighborhood</h4>
                  <p className="text-gray-600">{profile.primaryNeighborhood}</p>
                </div>
              )}
              {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.serviceAreas.map((area: string) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.serviceRadius && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Service Radius</h4>
                  <p className="text-gray-600">{profile.serviceRadius} kilometers</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Options</h4>
                <div className="space-y-1">
                  {profile.serviceAtLocation && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Service at business location</span>
                    </div>
                  )}
                  {profile.serviceAtCustomerLocation && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Service at customer location</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience Summary */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Target Audience Summary
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection('audience')}
                  className="print:hidden"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.customerDescription && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Customer Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{profile.customerDescription}</p>
                </div>
              )}
              {profile.targetAgeGroups && profile.targetAgeGroups.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Target Age Groups</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.targetAgeGroups.map((age: string) => (
                      <Badge key={age} variant="outline" className="text-xs">
                        {age} years
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.customerInterests && profile.customerInterests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.customerInterests.slice(0, 10).map((interest: string) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {profile.customerInterests.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.customerInterests.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {profile.communityInvolvement && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Community Involvement</h4>
                  <p className="text-gray-600 text-sm">{getCommunityInvolvementLabel(profile.communityInvolvement)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget & Goals */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Budget & Goals
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection('budget')}
                  className="print:hidden"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.budgetTier && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Budget Range</h4>
                  <p className="text-gray-600">{getBudgetTierLabel(profile.budgetTier)}</p>
                </div>
              )}
              {profile.budgetTimeframe && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Budget Timeframe</h4>
                  <p className="text-gray-600 capitalize">{profile.budgetTimeframe.replace('-', ' ')}</p>
                </div>
              )}
              {profile.marketingGoal && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Primary Marketing Goal</h4>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <p className="text-gray-600">{getMarketingGoalLabel(profile.marketingGoal)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Completeness */}
        <Card className="mb-8 print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'business', label: 'Business Info', icon: Building2 },
                { key: 'location', label: 'Location Details', icon: MapPin },
                { key: 'audience', label: 'Target Audience', icon: Users },
                { key: 'budget', label: 'Budget & Goals', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <div className="flex items-center gap-2">
                      {profile.completeness?.[key as keyof typeof profile.completeness] ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Clock className="h-3 w-3 text-orange-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {profile.completeness?.[key as keyof typeof profile.completeness] ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <Button
            onClick={() => exportProfile.mutate()}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Profile
              </>
            )}
          </Button>
          
          <Button
            onClick={onContinue}
            className="flex items-center gap-2"
            disabled={!profile.completeness?.overall}
          >
            Continue to Recommendations
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 print:mt-8">
          <p>Business Profile generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Hyperlocal Advertising Platform</p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          
          .print\\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
          
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          
          .print\\:border {
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </div>
  );
}