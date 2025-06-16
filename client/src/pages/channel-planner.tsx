import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor,
  Radio,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string;
  suitabilityScore: number;
  estimatedCost: string;
  expectedReach: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToSee: string;
  pros: string[];
  cons: string[];
  recommendedFor: string[];
  icon: string;
}

interface ChannelRecommendations {
  primaryChannels: Channel[];
  secondaryChannels: Channel[];
  budgetOptimized: Channel[];
  totalRecommendations: number;
}

const channelIcons = {
  'google-ads': Globe,
  'facebook-ads': Users,
  'instagram-ads': Smartphone,
  'linkedin-ads': Monitor,
  'local-radio': Radio,
  'email-marketing': Mail,
  'social-media': MessageSquare,
  'seo': TrendingUp
};

export default function ChannelPlanner() {
  const businessId = 1; // Demo business ID
  const [selectedBudget, setSelectedBudget] = useState<string>("201-500");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["brand-awareness"]);
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const { toast } = useToast();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['/api/recommendations/channels', businessId, selectedBudget],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations/channels", {
        businessId,
        budget: selectedBudget,
        goals: selectedGoals
      });
      return response.json();
    }
  });

  const optimizeMutation = useMutation({
    mutationFn: async (channels: string[]) => {
      const response = await apiRequest("POST", "/api/recommendations/optimize", {
        businessId,
        selectedChannels: channels,
        budget: selectedBudget
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Channel Plan Optimized",
        description: "Your advertising strategy has been optimized for maximum ROI.",
      });
    }
  });

  const handleBudgetChange = (budget: string) => {
    setSelectedBudget(budget);
    refetch();
  };

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
    refetch();
  };

  const renderChannelCard = (channel: Channel, isPrimary: boolean = false) => {
    const IconComponent = channelIcons[channel.icon as keyof typeof channelIcons] || Target;
    
    return (
      <Card key={channel.id} className={`relative ${isPrimary ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
        {isPrimary && (
          <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{channel.name}</CardTitle>
              <CardDescription className="text-sm">{channel.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suitability Score</span>
            <div className="flex items-center gap-2">
              <Progress value={channel.suitabilityScore} className="w-20" />
              <span className="text-sm font-bold">{channel.suitabilityScore}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Est. Cost:</span>
              <p className="font-medium">{channel.estimatedCost}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Reach:</span>
              <p className="font-medium">{channel.expectedReach}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <Badge variant={channel.difficulty === 'Easy' ? 'default' : channel.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                {channel.difficulty}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Time to Results:</span>
              <p className="font-medium">{channel.timeToSee}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Pros
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {channel.pros.map((pro, index) => (
                  <li key={index}>• {pro}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Considerations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {channel.cons.map((con, index) => (
                  <li key={index}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Best for: {channel.recommendedFor.join(", ")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Channel Planner</h1>
        <p className="text-muted-foreground mt-2">
          Discover the best advertising channels for your business based on AI-powered recommendations
        </p>
      </div>

      {/* Strategy Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategy Settings
          </CardTitle>
          <CardDescription>
            Customize your recommendations based on budget and marketing goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Budget Range</label>
            <div className="flex flex-wrap gap-2">
              {["50-200", "201-500", "501-1000", "1000+"].map((budget) => (
                <Button
                  key={budget}
                  variant={selectedBudget === budget ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBudgetChange(budget)}
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${budget}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Marketing Goals</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "brand-awareness", label: "Brand Awareness" },
                { id: "lead-generation", label: "Lead Generation" },
                { id: "sales", label: "Direct Sales" },
                { id: "engagement", label: "Customer Engagement" },
                { id: "local-reach", label: "Local Reach" }
              ].map((goal) => (
                <Button
                  key={goal.id}
                  variant={selectedGoals.includes(goal.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  {goal.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">Top Picks</TabsTrigger>
          <TabsTrigger value="all">All Channels</TabsTrigger>
          <TabsTrigger value="budget">Budget-Optimized</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations ? (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-4">Primary Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(recommendations.primaryChannels || []).map((channel: Channel) => 
                    renderChannelCard(channel, true)
                  )}
                </div>
              </div>
              
              {(recommendations.secondaryChannels || []).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Additional Options</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(recommendations.secondaryChannels || []).map((channel: Channel) => 
                      renderChannelCard(channel)
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground">
                  Adjust your budget and goals above to get personalized channel recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...(recommendations.primaryChannels || []), ...(recommendations.secondaryChannels || [])].map((channel: Channel) => 
                renderChannelCard(channel)
              )}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations?.budgetOptimized ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Maximum ROI Channels</h2>
                <p className="text-muted-foreground">
                  Best value channels for your ${selectedBudget} budget
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(recommendations.budgetOptimized || []).map((channel: Channel) => 
                  renderChannelCard(channel)
                )}
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}