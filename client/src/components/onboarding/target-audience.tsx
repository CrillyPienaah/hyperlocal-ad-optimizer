import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Users, Target, Heart, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const audienceFormSchema = z.object({
  customerDescription: z.string().min(10, "Customer description must be at least 10 characters").max(1000, "Description too long"),
  targetAgeGroups: z.array(z.enum(["18-24", "25-34", "35-44", "45-54", "55-64", "65+"])).min(1, "Select at least one age group"),
  customerInterests: z.array(z.string().min(1).max(50)).min(1, "Add at least one customer interest").max(20, "Too many interests"),
  communityInvolvement: z.enum(["high", "medium", "low", "none"], {
    errorMap: () => ({ message: "Please select community involvement level" })
  }),
});

type AudienceFormData = z.infer<typeof audienceFormSchema>;

interface TargetAudienceProps {
  businessId: number;
  onNext: (data: any) => void;
  onBack: () => void;
}

const AGE_GROUPS = [
  { value: "18-24", label: "18-24 years" },
  { value: "25-34", label: "25-34 years" },
  { value: "35-44", label: "35-44 years" },
  { value: "45-54", label: "45-54 years" },
  { value: "55-64", label: "55-64 years" },
  { value: "65+", label: "65+ years" },
];

const POPULAR_INTERESTS = [
  "Technology", "Food & Dining", "Health & Fitness", "Fashion", "Travel",
  "Entertainment", "Sports", "Music", "Art", "Education", "Family",
  "Sustainability", "Local Events", "Shopping", "Photography"
];

export default function TargetAudience({ businessId, onNext, onBack }: TargetAudienceProps) {
  const { toast } = useToast();
  const [newInterest, setNewInterest] = useState("");
  const [debouncedDescription, setDebouncedDescription] = useState("");

  const form = useForm<AudienceFormData>({
    resolver: zodResolver(audienceFormSchema),
    defaultValues: {
      customerDescription: "",
      targetAgeGroups: [],
      customerInterests: [],
      communityInvolvement: "medium",
    },
  });

  // Debounced description update
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const debouncedUpdateDescription = useCallback(
    debounce((value: string) => {
      setDebouncedDescription(value);
    }, 500),
    []
  );

  // Load existing business data
  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['/api/businesses', businessId],
    enabled: !!businessId,
  });

  // Update form with existing data when business loads
  useEffect(() => {
    if (business) {
      const targetAgeGroups = business.targetAgeGroups ? JSON.parse(business.targetAgeGroups) : [];
      const customerInterests = business.customerInterests ? JSON.parse(business.customerInterests) : [];
      
      form.reset({
        customerDescription: business.customerDescription || "",
        targetAgeGroups,
        customerInterests,
        communityInvolvement: business.communityInvolvement || "medium",
      });
      setDebouncedDescription(business.customerDescription || "");
    }
  }, [business, form]);

  // Update audience mutation
  const updateAudienceMutation = useMutation({
    mutationFn: async (data: AudienceFormData) => {
      const response = await apiRequest(`/api/business-profile/${businessId}/audience`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses', businessId] });
      toast({
        title: "Audience profile saved",
        description: "Your target audience information has been updated successfully.",
      });
      onNext(data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error saving audience profile",
        description: error.message || "Failed to save audience information. Please try again.",
      });
    },
  });

  const onSubmit = (data: AudienceFormData) => {
    updateAudienceMutation.mutate(data);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !form.getValues("customerInterests").includes(newInterest.trim())) {
      const currentInterests = form.getValues("customerInterests");
      if (currentInterests.length < 20) {
        form.setValue("customerInterests", [...currentInterests, newInterest.trim()]);
        setNewInterest("");
      }
    }
  };

  const handleRemoveInterest = (interest: string) => {
    const currentInterests = form.getValues("customerInterests");
    form.setValue("customerInterests", currentInterests.filter(i => i !== interest));
  };

  const handleQuickAddInterest = (interest: string) => {
    const currentInterests = form.getValues("customerInterests");
    if (!currentInterests.includes(interest) && currentInterests.length < 20) {
      form.setValue("customerInterests", [...currentInterests, interest]);
    }
  };

  const handleAgeGroupChange = (ageGroup: string, checked: boolean) => {
    const currentAgeGroups = form.getValues("targetAgeGroups");
    if (checked) {
      form.setValue("targetAgeGroups", [...currentAgeGroups, ageGroup as any]);
    } else {
      form.setValue("targetAgeGroups", currentAgeGroups.filter(ag => ag !== ageGroup));
    }
  };

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading business information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step 3 of 4</span>
            <span>75% Complete</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Help us understand who your ideal customers are so we can create more effective advertising campaigns.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Customer Description */}
                <FormField
                  control={form.control}
                  name="customerDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Customer Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your ideal customers. Who are they? What do they value? What brings them to your business? Be specific about their lifestyle, needs, and preferences..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debouncedUpdateDescription(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The more specific you are, the better we can target your ads
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age Groups */}
                <FormField
                  control={form.control}
                  name="targetAgeGroups"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-semibold">
                        <Target className="h-4 w-4" />
                        Age Groups
                      </FormLabel>
                      <FormDescription className="mb-4">
                        Select all age groups that represent your typical customers
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AGE_GROUPS.map((ageGroup) => (
                          <FormField
                            key={ageGroup.value}
                            control={form.control}
                            name="targetAgeGroups"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(ageGroup.value)}
                                    onCheckedChange={(checked) => 
                                      handleAgeGroupChange(ageGroup.value, checked as boolean)
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {ageGroup.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Customer Interests */}
                <FormField
                  control={form.control}
                  name="customerInterests"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-semibold">
                        <Heart className="h-4 w-4" />
                        Customer Interests
                      </FormLabel>
                      <FormDescription className="mb-4">
                        What topics, activities, or interests do your customers care about?
                      </FormDescription>
                      
                      {/* Quick Add Popular Interests */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">Popular interests:</Label>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_INTERESTS.map((interest) => (
                            <Badge
                              key={interest}
                              variant={form.watch("customerInterests").includes(interest) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-blue-100"
                              onClick={() => handleQuickAddInterest(interest)}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Custom Interest Input */}
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Add custom interest..."
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddInterest}
                          disabled={!newInterest.trim() || form.watch("customerInterests").length >= 20}
                        >
                          Add
                        </Button>
                      </div>

                      {/* Selected Interests */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selected interests:</Label>
                        <div className="flex flex-wrap gap-2">
                          {form.watch("customerInterests").map((interest) => (
                            <Badge key={interest} variant="default" className="pr-1">
                              {interest}
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(interest)}
                                className="ml-2 hover:bg-red-500 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {form.watch("customerInterests").length === 0 && (
                          <p className="text-sm text-gray-500">No interests selected yet</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Community Involvement */}
                <FormField
                  control={form.control}
                  name="communityInvolvement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Local Community Involvement</FormLabel>
                      <FormDescription className="mb-4">
                        How involved are your customers in local community activities and events?
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select community involvement level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High - Very active in local events and community groups</SelectItem>
                          <SelectItem value="medium">Medium - Occasionally participates in local activities</SelectItem>
                          <SelectItem value="low">Low - Limited community involvement</SelectItem>
                          <SelectItem value="none">None - Primarily focused on personal interests</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={updateAudienceMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateAudienceMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}