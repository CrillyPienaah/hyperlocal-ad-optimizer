import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, ArrowRight, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const businessDetailsSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Please enter a complete address"),
  phone: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  businessType: z.enum(["restaurant", "retail", "service", "healthcare", "fitness", "beauty", "professional", "education", "entertainment", "other"]),
  customBusinessType: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
}).refine((data) => {
  if (data.businessType === "other" && !data.customBusinessType) {
    return false;
  }
  return true;
}, {
  message: "Please specify your business type",
  path: ["customBusinessType"],
});

type BusinessDetailsForm = z.infer<typeof businessDetailsSchema>;

interface BusinessDetailsProps {
  onNext: (data: any) => void;
  onSkip?: () => void;
}

const businessTypeOptions = [
  { value: "restaurant", label: "Restaurant / Food & Beverage" },
  { value: "retail", label: "Retail Store" },
  { value: "service", label: "Service Business" },
  { value: "healthcare", label: "Healthcare / Medical" },
  { value: "fitness", label: "Fitness / Wellness" },
  { value: "beauty", label: "Beauty / Personal Care" },
  { value: "professional", label: "Professional Services" },
  { value: "education", label: "Education / Training" },
  { value: "entertainment", label: "Entertainment / Events" },
  { value: "other", label: "Other" },
];

const industryOptions = [
  "Food & Beverage",
  "Retail",
  "Healthcare",
  "Professional Services",
  "Fitness & Wellness",
  "Beauty & Personal Care",
  "Education",
  "Entertainment",
  "Technology",
  "Real Estate",
  "Automotive",
  "Other",
];

export default function BusinessDetails({ onNext, onSkip }: BusinessDetailsProps) {
  const { toast } = useToast();
  const [showCustomType, setShowCustomType] = useState(false);

  const form = useForm<BusinessDetailsForm>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      industry: "",
      businessType: "restaurant",
      customBusinessType: "",
      description: "",
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: BusinessDetailsForm) => {
      const response = await apiRequest("POST", "/api/business-profile", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Business profile saved!",
        description: "Your business information has been saved successfully.",
      });
      onNext(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error saving profile",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BusinessDetailsForm) => {
    saveProfileMutation.mutate(data);
  };

  const handleBusinessTypeChange = (value: string) => {
    form.setValue("businessType", value as any);
    setShowCustomType(value === "other");
    if (value !== "other") {
      form.setValue("customBusinessType", "");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Business Setup</h1>
                <p className="text-gray-500">Step 1 of 4 - Business Details</p>
              </div>
            </div>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>
          <Progress value={25} className="h-2" />
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your business</CardTitle>
            <p className="text-sm text-gray-600">
              This information helps us create targeted advertising campaigns for your local market.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Your business name"
                      className="mt-1"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="business@example.com"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="123 Main Street, City, State, ZIP"
                    className="mt-1"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Business Classification */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Business Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={form.watch("businessType")}
                      onValueChange={handleBusinessTypeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.businessType && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.businessType.message}</p>
                    )}
                  </div>

                  {showCustomType && (
                    <div>
                      <Label htmlFor="customBusinessType">Specify Business Type *</Label>
                      <Input
                        id="customBusinessType"
                        {...form.register("customBusinessType")}
                        placeholder="Describe your business type"
                        className="mt-1"
                      />
                      {form.formState.errors.customBusinessType && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.customBusinessType.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={form.watch("industry")}
                      onValueChange={(value) => form.setValue("industry", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.industry && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.industry.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Description */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Business Description</h3>
                <div>
                  <Label htmlFor="description">Describe your products or services *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Tell us about what your business offers, your target customers, and what makes you unique..."
                    className="mt-1"
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {form.formState.errors.description ? (
                      <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {form.watch("description")?.length || 0}/500 characters
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={saveProfileMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}