import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Copy, RefreshCw, Lightbulb, Target, MessageSquare, Zap } from "lucide-react";

const adCopyFormSchema = z.object({
  campaignGoal: z.string().min(1, "Please select a campaign goal"),
  keyMessage: z.string().min(5, "Key message must be at least 5 characters"),
  tone: z.string().min(1, "Please select a tone"),
  ctaStyle: z.string().min(1, "Please select a call-to-action style"),
});

type AdCopyForm = z.infer<typeof adCopyFormSchema>;

interface AdCopyVariation {
  id: number;
  headline: string;
  body: string;
  cta: string;
  style: string;
}

interface AdCopyGeneratorProps {
  businessId: number;
  selectedChannels?: string[];
}

export default function AdCopyGenerator({ businessId, selectedChannels = [] }: AdCopyGeneratorProps) {
  const [variations, setVariations] = useState<AdCopyVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<AdCopyForm>({
    resolver: zodResolver(adCopyFormSchema),
    defaultValues: {
      campaignGoal: "",
      keyMessage: "",
      tone: "",
      ctaStyle: "",
    },
  });

  const generateCopyMutation = useMutation({
    mutationFn: async (data: AdCopyForm) => {
      const response = await apiRequest("POST", "/api/content/generate-copy", {
        businessId,
        ...data,
        selectedChannels,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVariations(data.variations || []);
      setSelectedVariation(null);
      toast({
        title: "Ad Copy Generated",
        description: `Created ${data.variations?.length || 0} unique variations for your campaign.`,
      });
    },
    onError: (error) => {
      console.error("Error generating ad copy:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      const response = await apiRequest("/api/content/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          ...formData,
          selectedChannels,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVariations(data.variations || []);
      setSelectedVariation(null);
      toast({
        title: "New Variations Generated",
        description: "Fresh ad copy variations have been created.",
      });
    },
  });

  const copyToClipboard = (variation: AdCopyVariation) => {
    const fullCopy = `${variation.headline}\n\n${variation.body}\n\n${variation.cta}`;
    navigator.clipboard.writeText(fullCopy);
    toast({
      title: "Copied to Clipboard",
      description: "Ad copy has been copied to your clipboard.",
    });
  };

  const onSubmit = (data: AdCopyForm) => {
    generateCopyMutation.mutate(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI-Powered Ad Copy Generator
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create compelling, personalized advertising copy that resonates with your target audience. 
          Our AI analyzes your business profile to generate authentic, high-converting ad variations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Campaign Details
            </CardTitle>
            <CardDescription>
              Tell us about your campaign goals and messaging preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="campaignGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Campaign Goal
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="What do you want to achieve?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="increase-sales">Increase Sales</SelectItem>
                          <SelectItem value="drive-traffic">Drive Website Traffic</SelectItem>
                          <SelectItem value="generate-leads">Generate Leads</SelectItem>
                          <SelectItem value="boost-awareness">Boost Brand Awareness</SelectItem>
                          <SelectItem value="promote-event">Promote Event</SelectItem>
                          <SelectItem value="seasonal-promotion">Seasonal Promotion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Key Message
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's the main message you want to convey? (e.g., 'Best local pizza with 30+ years of tradition')"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone & Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your brand voice" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="friendly-casual">Friendly & Casual</SelectItem>
                          <SelectItem value="professional-trustworthy">Professional & Trustworthy</SelectItem>
                          <SelectItem value="energetic-exciting">Energetic & Exciting</SelectItem>
                          <SelectItem value="warm-welcoming">Warm & Welcoming</SelectItem>
                          <SelectItem value="expert-authoritative">Expert & Authoritative</SelectItem>
                          <SelectItem value="fun-playful">Fun & Playful</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Call-to-Action Style
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How should we motivate action?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="urgent-limited-time">Urgent & Limited Time</SelectItem>
                          <SelectItem value="soft-inviting">Soft & Inviting</SelectItem>
                          <SelectItem value="direct-action">Direct & Action-Oriented</SelectItem>
                          <SelectItem value="value-focused">Value-Focused</SelectItem>
                          <SelectItem value="curiosity-driven">Curiosity-Driven</SelectItem>
                          <SelectItem value="community-focused">Community-Focused</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedChannels.length > 0 && (
                  <div className="space-y-2">
                    <FormLabel>Selected Channels</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {selectedChannels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={generateCopyMutation.isPending}
                >
                  {generateCopyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Amazing Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Ad Copy
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Generated Variations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Generated Variations</h2>
            {variations.length > 0 && (
              <Button
                variant="outline"
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
                className="gap-2"
              >
                {regenerateMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </Button>
            )}
          </div>

          {generateCopyMutation.isPending ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : variations.length > 0 ? (
            <div className="space-y-4">
              {variations.map((variation, index) => (
                <Card 
                  key={variation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedVariation === variation.id 
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                      : 'hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedVariation(
                    selectedVariation === variation.id ? null : variation.id
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {variation.headline}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {variation.style}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(variation);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {variation.body}
                    </p>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-3 rounded-lg">
                      <p className="font-semibold text-purple-800 dark:text-purple-200">
                        {variation.cta}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Create Magic?</h3>
                <p className="text-muted-foreground max-w-sm">
                  Fill out the form to generate personalized ad copy variations powered by AI.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {selectedVariation && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-purple-600" />
              Preview Selected Copy
            </CardTitle>
            <CardDescription>
              This is how your selected ad copy will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const selected = variations.find(v => v.id === selectedVariation);
              return selected ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm max-w-md">
                    <h4 className="font-bold text-lg mb-2">{selected.headline}</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {selected.body}
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      {selected.cta}
                    </Button>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(selected)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Full Ad to Clipboard
                  </Button>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}