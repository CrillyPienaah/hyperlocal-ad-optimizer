import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCampaignSchema } from "@shared/schema";
import { Store, Image } from "lucide-react";

const createCampaignFormSchema = insertCampaignSchema.extend({
  businessId: z.number().default(1),
  status: z.string().default("active"),
});

type CreateCampaignForm = z.infer<typeof createCampaignFormSchema>;

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignFormSchema),
    defaultValues: {
      businessId: 1,
      name: "",
      type: "local-awareness",
      status: "active",
      targetLocation: "",
      targetRadius: "1.0",
      audienceType: "everyone",
      dailyBudget: "100.00",
      duration: "1-month",
      adContent: "",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CreateCampaignForm) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/business/1"] });
      toast({
        title: "Campaign created successfully!",
        description: "Your new campaign is now active.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCampaignForm) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Campaign Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter campaign name"
                  className="mt-1"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-awareness">Local Awareness</SelectItem>
                    <SelectItem value="store-visits">Store Visits</SelectItem>
                    <SelectItem value="lead-generation">Lead Generation</SelectItem>
                    <SelectItem value="event-promotion">Event Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Geographic Targeting */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Geographic Targeting</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="targetLocation">Primary Location</Label>
                <Input
                  id="targetLocation"
                  {...form.register("targetLocation")}
                  placeholder="Enter address or coordinates"
                  className="mt-1"
                />
                {form.formState.errors.targetLocation && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.targetLocation.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetRadius">Radius (miles)</Label>
                  <Select
                    value={form.watch("targetRadius")}
                    onValueChange={(value) => form.setValue("targetRadius", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5 miles</SelectItem>
                      <SelectItem value="1.0">1 mile</SelectItem>
                      <SelectItem value="2.0">2 miles</SelectItem>
                      <SelectItem value="5.0">5 miles</SelectItem>
                      <SelectItem value="10.0">10 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="audienceType">Audience</Label>
                  <Select
                    value={form.watch("audienceType")}
                    onValueChange={(value) => form.setValue("audienceType", value as any)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone in area</SelectItem>
                      <SelectItem value="workers">People who work here</SelectItem>
                      <SelectItem value="residents">People who live here</SelectItem>
                      <SelectItem value="recent-visitors">Recent visitors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Budget & Schedule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyBudget">Daily Budget</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="dailyBudget"
                    type="number"
                    step="0.01"
                    {...form.register("dailyBudget")}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {form.formState.errors.dailyBudget && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.dailyBudget.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="duration">Campaign Duration</Label>
                <Select
                  value={form.watch("duration")}
                  onValueChange={(value) => form.setValue("duration", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 week</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ad Content */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Ad Content</h4>
            <div>
              <Label htmlFor="adContent">Ad Description</Label>
              <Textarea
                id="adContent"
                {...form.register("adContent")}
                placeholder="Enter your ad description..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Ad Preview */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Ad Preview</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mike's Coffee Shop</p>
                  <p className="text-xs text-gray-500">Sponsored</p>
                </div>
              </div>
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {form.watch("adContent") || "Your ad description will appear here..."}
              </p>
              <Button type="button" size="sm" className="bg-primary text-white">
                Learn More
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
