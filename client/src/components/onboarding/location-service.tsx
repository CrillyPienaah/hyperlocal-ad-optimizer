import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, MapPin, Target, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const locationFormSchema = z.object({
  city: z.string().min(2, "City is required").max(100, "City name too long"),
  primaryNeighborhood: z.string().max(100, "Neighborhood name too long").optional().or(z.literal("")),
  serviceAreas: z.string().max(500, "Service areas description too long").optional().or(z.literal("")),
  serviceRadius: z.number().min(1, "Service radius must be at least 1km").max(50, "Service radius cannot exceed 50km"),
  serviceAtLocation: z.boolean().default(false),
  serviceAtCustomerLocation: z.boolean().default(false),
}).refine(data => data.serviceAtLocation || data.serviceAtCustomerLocation, {
  message: "At least one service method must be selected",
  path: ["serviceAtLocation"],
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface LocationServiceProps {
  businessId: number;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function LocationService({ businessId, onNext, onBack }: LocationServiceProps) {
  const { toast } = useToast();
  const [radiusValue, setRadiusValue] = useState(5);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      city: "",
      primaryNeighborhood: "",
      serviceAreas: "",
      serviceRadius: 5,
      serviceAtLocation: false,
      serviceAtCustomerLocation: false,
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
        city: (business as any)?.city || "",
        primaryNeighborhood: (business as any)?.primaryNeighborhood || "",
        serviceAreas: (business as any)?.serviceAreas || "",
        serviceRadius: (business as any)?.serviceRadius || 5,
        serviceAtLocation: (business as any)?.serviceAtLocation || false,
        serviceAtCustomerLocation: (business as any)?.serviceAtCustomerLocation || false,
      });
      setRadiusValue((business as any)?.serviceRadius || 5);
    }
  }, [business, form]);

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await apiRequest("PUT", `/api/business-profile/${businessId}/location`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses', businessId] });
      toast({
        title: "Location saved",
        description: "Your business location information has been updated successfully.",
      });
      onNext(data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error saving location",
        description: error.message || "Failed to save location information. Please try again.",
      });
    },
  });

  const onSubmit = (data: LocationFormData) => {
    updateLocationMutation.mutate(data);
  };

  const handleRadiusChange = (value: number) => {
    setRadiusValue(value);
    form.setValue("serviceRadius", value);
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
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step 2 of 4</span>
            <span>50% Complete</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Service Location & Areas
            </CardTitle>
            <CardDescription>
              Tell us where your business operates so we can help you reach the right customers in your area.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City/Town *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., San Francisco, Austin, Portland" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The main city or town where your business is located
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Primary Neighborhood */}
                <FormField
                  control={form.control}
                  name="primaryNeighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Neighborhood</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., SOMA, Downtown, Westside" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The specific neighborhood or district (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Areas */}
                <FormField
                  control={form.control}
                  name="serviceAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Areas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Downtown, Mission District, Castro, Nob Hill. Or describe your delivery zones..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List the neighborhoods, districts, or areas you serve (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Radius */}
                <FormField
                  control={form.control}
                  name="serviceRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Service Radius: {radiusValue} km
                      </FormLabel>
                      <FormControl>
                        <div className="px-3">
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={radiusValue}
                            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 km</span>
                            <span>25 km</span>
                            <span>50 km</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How far are you willing to travel or deliver?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Methods */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Settings className="h-4 w-4" />
                    Service Methods *
                  </Label>
                  
                  <FormField
                    control={form.control}
                    name="serviceAtLocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Customers come to my location
                          </FormLabel>
                          <FormDescription>
                            You provide services at your business location (store, office, restaurant, etc.)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceAtCustomerLocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            I go to customer locations
                          </FormLabel>
                          <FormDescription>
                            You provide services at customer locations (delivery, house calls, events, etc.)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.serviceAtLocation && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.serviceAtLocation.message}
                    </p>
                  )}
                </div>

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
                    disabled={updateLocationMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateLocationMutation.isPending ? (
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