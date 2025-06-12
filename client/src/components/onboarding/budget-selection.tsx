import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, DollarSign, Target, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const budgetFormSchema = z.object({
  budgetTier: z.enum(["50-200", "201-500", "501-1000", "1000+"], {
    errorMap: () => ({ message: "Please select a budget tier" })
  }),
  budgetTimeframe: z.enum(["monthly", "per-campaign"], {
    errorMap: () => ({ message: "Please select budget timeframe" })
  }),
  marketingGoal: z.enum([
    "increase-awareness",
    "drive-foot-traffic", 
    "generate-leads",
    "boost-sales",
    "promote-events",
    "build-community"
  ], {
    errorMap: () => ({ message: "Please select a marketing goal" })
  }),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface BudgetSelectionProps {
  businessId: number;
  onNext: (data: any) => void;
  onBack: () => void;
}

const BUDGET_TIERS = [
  {
    value: "50-200",
    label: "$50 - $200",
    description: "Perfect for small local businesses starting their advertising journey",
    features: ["Basic local targeting", "Small audience reach", "Limited campaign types"],
    recommended: "New businesses, local services"
  },
  {
    value: "201-500",
    label: "$201 - $500", 
    description: "Ideal for established businesses looking to expand their reach",
    features: ["Enhanced targeting options", "Moderate audience reach", "Multiple campaign types"],
    recommended: "Growing businesses, retail stores"
  },
  {
    value: "501-1000",
    label: "$501 - $1,000",
    description: "Great for businesses ready to scale their advertising efforts",
    features: ["Advanced targeting", "Large audience reach", "All campaign types", "Priority support"],
    recommended: "Established businesses, restaurants"
  },
  {
    value: "1000+",
    label: "$1,000+",
    description: "Premium option for businesses with serious growth ambitions",
    features: ["Premium targeting", "Maximum reach", "All features", "Dedicated support", "Custom campaigns"],
    recommended: "Large businesses, franchises"
  }
];

const MARKETING_GOALS = [
  { value: "increase-awareness", label: "Increase Brand Awareness", description: "Get your business noticed by more local customers" },
  { value: "drive-foot-traffic", label: "Drive Foot Traffic", description: "Bring more customers to your physical location" },
  { value: "generate-leads", label: "Generate Leads", description: "Collect contact information from potential customers" },
  { value: "boost-sales", label: "Boost Sales", description: "Increase revenue and conversions" },
  { value: "promote-events", label: "Promote Events", description: "Market special events, sales, or promotions" },
  { value: "build-community", label: "Build Community", description: "Foster engagement and build a loyal customer base" }
];

export default function BudgetSelection({ businessId, onNext, onBack }: BudgetSelectionProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgetTier: undefined,
      budgetTimeframe: "monthly",
      marketingGoal: undefined,
    },
  });

  // Load existing business data
  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['/api/businesses', businessId],
    enabled: !!businessId,
  });

  // Update form with existing data when business loads
  useEffect(() => {
    if (business) {
      form.reset({
        budgetTier: (business as any)?.budgetTier || undefined,
        budgetTimeframe: (business as any)?.budgetTimeframe || "monthly",
        marketingGoal: (business as any)?.marketingGoal || undefined,
      });
    }
  }, [business, form]);

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiRequest("PUT", `/api/business-profile/${businessId}/budget`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses', businessId] });
      setShowSuccess(true);
      toast({
        title: "Setup Complete!",
        description: "Your business profile has been completed successfully.",
      });
      
      // Show success for 2 seconds then navigate
      setTimeout(() => {
        onNext(data);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error completing setup",
        description: error.message || "Failed to save budget information. Please try again.",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    updateBudgetMutation.mutate(data);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your business profile has been successfully completed. You're now ready to start creating advertising campaigns.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step 4 of 4</span>
            <span>100% Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Budget Selection
            </CardTitle>
            <CardDescription>
              Choose your advertising budget and marketing goals to complete your business profile setup.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Budget Tier Selection */}
                <FormField
                  control={form.control}
                  name="budgetTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Monthly Advertising Budget</FormLabel>
                      <FormDescription className="mb-6">
                        Select the budget range that best fits your advertising goals and business size.
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid gap-4"
                        >
                          {BUDGET_TIERS.map((tier) => (
                            <div key={tier.value}>
                              <Label
                                htmlFor={tier.value}
                                className={`flex cursor-pointer rounded-lg border-2 p-4 hover:bg-gray-50 ${
                                  field.value === tier.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                                }`}
                              >
                                <RadioGroupItem value={tier.value} id={tier.value} className="mt-1" />
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{tier.label}</h3>
                                    <span className="text-sm text-gray-500">Recommended for: {tier.recommended}</span>
                                  </div>
                                  <p className="text-gray-600 mb-3">{tier.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {tier.features.map((feature, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget Timeframe */}
                <FormField
                  control={form.control}
                  name="budgetTimeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Budget Timeframe</FormLabel>
                      <FormDescription className="mb-4">
                        How would you like to allocate your advertising budget?
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className="cursor-pointer">
                              <div>
                                <div className="font-medium">Monthly Budget</div>
                                <div className="text-sm text-gray-500">Fixed amount each month</div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="per-campaign" id="per-campaign" />
                            <Label htmlFor="per-campaign" className="cursor-pointer">
                              <div>
                                <div className="font-medium">Per Campaign</div>
                                <div className="text-sm text-gray-500">Budget per individual campaign</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Marketing Goal */}
                <FormField
                  control={form.control}
                  name="marketingGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-semibold">
                        <Target className="h-4 w-4" />
                        Primary Marketing Goal
                      </FormLabel>
                      <FormDescription className="mb-4">
                        What's your main objective for advertising campaigns?
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary marketing goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MARKETING_GOALS.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              <div>
                                <div className="font-medium">{goal.label}</div>
                                <div className="text-sm text-gray-500">{goal.description}</div>
                              </div>
                            </SelectItem>
                          ))}
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
                    disabled={updateBudgetMutation.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {updateBudgetMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        Complete Setup
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