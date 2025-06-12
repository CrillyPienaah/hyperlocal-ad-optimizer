import { useQuery } from "@tanstack/react-query";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import PerformanceChart from "@/components/dashboard/performance-chart";
import QuickActions from "@/components/dashboard/quick-actions";
import CampaignsTable from "@/components/campaigns/campaigns-table";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { useState } from "react";
import CreateCampaignModal from "@/components/campaigns/create-campaign-modal";
import type { Campaign } from "@shared/schema";

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns/business/1"],
  });

  const { data: metricsSummary, isLoading: metricsLoading } = useQuery<{
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    activeCampaigns: number;
  }>({
    queryKey: ["/api/metrics/business/1/summary"],
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Manage your advertising campaigns</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Metrics Grid */}
        <MetricsGrid summary={metricsSummary as any} isLoading={metricsLoading} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>

          {/* Quick Actions */}
          <QuickActions onCreateCampaign={() => setShowCreateModal(true)} />
        </div>

        {/* Campaigns Table */}
        <div className="mt-8">
          <CampaignsTable campaigns={campaigns as any} isLoading={campaignsLoading} />
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
