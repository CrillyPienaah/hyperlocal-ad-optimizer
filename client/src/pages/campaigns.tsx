import { useQuery } from "@tanstack/react-query";
import CampaignsTable from "@/components/campaigns/campaigns-table";
import CreateCampaignModal from "@/components/campaigns/create-campaign-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Campaigns() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns/business/1"],
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Campaigns</h2>
            <p className="text-sm text-gray-500">Manage all your advertising campaigns</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <CampaignsTable campaigns={campaigns} isLoading={isLoading} />
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
