import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Rocket, Target, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  name: string;
  industry: string;
  location: string;
  description: string;
  budget: string;
}

interface AIAnalysis {
  localMarket: string;
  competitors: string[];
  recommendations: string[];
}

interface Channel {
  name: string;
  suitability: number;
  estimatedCost: string;
  expectedReach: string;
}

interface AdCopy {
  headline: string;
  body: string;
  cta: string;
}

export default function LaunchWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "",
    industry: "",
    location: "",
    description: "",
    budget: ""
  });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [adCopy, setAdCopy] = useState<AdCopy[]>([]);
  const { toast } = useToast();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((5 - currentStep) / 4) * 100;

  const handleBusinessSubmit = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI market analysis
    setTimeout(() => {
      setAiAnalysis({
        localMarket: `${businessProfile.location} has 12,500 potential customers in your target demographic. Peak activity hours are 9-11 AM and 6-8 PM.`,
        competitors: ["LocalBiz Pro", "Downtown Services", "Community Favorite"],
        recommendations: [
          "Focus on hyperlocal targeting within 2-mile radius",
          "Emphasize community connection and local expertise",
          "Target morning commuters and evening shoppers"
        ]
      });
      
      setSelectedChannels([
        { name: "Google Ads Local", suitability: 95, estimatedCost: "$15/day", expectedReach: "3,200/week" },
        { name: "Facebook Hyperlocal", suitability: 88, estimatedCost: "$12/day", expectedReach: "2,800/week" },
        { name: "Local SEO", suitability: 92, estimatedCost: "$8/day", expectedReach: "1,500/week" }
      ]);
      
      setAdCopy([
        {
          headline: `${businessProfile.location}'s Premier ${businessProfile.industry}`,
          body: `Discover why locals choose us for exceptional service. ${businessProfile.description}`,
          cta: "Visit Us Today"
        },
        {
          headline: `Local ${businessProfile.industry} Experts`,
          body: `Serving ${businessProfile.location} with quality and care you can trust.`,
          cta: "Get Started Now"
        }
      ]);
      
      setIsAnalyzing(false);
      setCurrentStep(2);
    }, 3000);
  };

  const handleLaunchCampaign = () => {
    // Save campaign to localStorage
    const campaign = {
      id: Date.now(),
      name: `${businessProfile.name} Hyperlocal Campaign`,
      type: "hyperlocal-launch",
      budget: businessProfile.budget,
      duration: "30",
      location: businessProfile.location,
      objective: "Launch-ready hyperlocal advertising",
      content: `AI-generated campaign for ${businessProfile.industry} business`,
      status: "Active",
      impressions: "0",
      ctr: "0%",
      createdAt: new Date().toISOString(),
      dailySpend: Math.round(parseInt(businessProfile.budget) / 30),
      clicks: 0,
      conversions: 0,
      source: "15-minute-launch"
    };

    const existingCampaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
    existingCampaigns.push(campaign);
    localStorage.setItem('userCampaigns', JSON.stringify(existingCampaigns));

    toast({
      title: "Campaign Launched! 🚀",
      description: "Your hyperlocal campaign is now live and attracting customers."
    });
    
    setCurrentStep(5);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with Timer */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Rocket className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">15-Minute Campaign Launch</h1>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-2xl font-bold text-orange-500">{formatTime(timeRemaining)}</span>
          <span className="text-gray-600">remaining</span>
        </div>
        <Progress value={progressPercentage} className="w-full max-w-md mx-auto mt-4" />
      </div>

      {/* Step 1: Business Profile */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tell Us About Your Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessProfile.name}
                  onChange={(e) => setBusinessProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select onValueChange={(value) => setBusinessProfile(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={businessProfile.location}
                  onChange={(e) => setBusinessProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="budget">Monthly Budget</Label>
                <Select onValueChange={(value) => setBusinessProfile(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">$500/month</SelectItem>
                    <SelectItem value="1000">$1,000/month</SelectItem>
                    <SelectItem value="2000">$2,000/month</SelectItem>
                    <SelectItem value="5000">$5,000/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={businessProfile.description}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your business and what makes it special..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleBusinessSubmit} 
              className="w-full"
              disabled={!businessProfile.name || !businessProfile.industry || !businessProfile.location || !businessProfile.budget}
            >
              <Zap className="w-4 h-4 mr-2" />
              Start AI Market Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Analysis */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Analyzing Your Local Market...</h3>
                <p className="text-gray-600">AI is researching competitors and customer behavior in {businessProfile.location}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Local Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{aiAnalysis?.localMarket}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedChannels.map((channel, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{channel.name}</h4>
                          <p className="text-sm text-gray-600">Cost: {channel.estimatedCost} • Reach: {channel.expectedReach}</p>
                        </div>
                        <Badge variant="secondary">{channel.suitability}% match</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Ad Copy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adCopy.map((copy, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-bold text-lg mb-2">{copy.headline}</h4>
                        <p className="text-gray-700 mb-2">{copy.body}</p>
                        <Button variant="outline" size="sm">{copy.cta}</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleLaunchCampaign} className="w-full" size="lg">
                <Rocket className="w-4 h-4 mr-2" />
                Launch My Campaign Now
              </Button>
            </>
          )}
        </div>
      )}

      {/* Step 5: Success */}
      {currentStep === 5 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Launched Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your hyperlocal advertising campaign is now live and will start attracting customers in {businessProfile.location}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Channels Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${businessProfile.budget}</div>
                <div className="text-sm text-gray-600">Monthly Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">7,500+</div>
                <div className="text-sm text-gray-600">Weekly Reach</div>
              </div>
            </div>
            <Button asChild>
              <a href="/dashboard">
                <ArrowRight className="w-4 h-4 mr-2" />
                View Campaign Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}