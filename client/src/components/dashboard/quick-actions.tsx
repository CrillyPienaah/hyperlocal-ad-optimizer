import { Plus, BarChart, MapPin, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

interface QuickActionsProps {
  onCreateCampaign: () => void;
}

export default function QuickActions({ onCreateCampaign }: QuickActionsProps) {
  const [, setLocation] = useLocation();
  const actions = [
    {
      title: "Create Campaign",
      description: "Start new advertising",
      icon: Plus,
      iconBg: "bg-primary",
      onClick: onCreateCampaign,
    },
    {
      title: "View Analytics",
      description: "Detailed reports",
      icon: BarChart,
      iconBg: "bg-accent",
      onClick: () => setLocation("/analytics"),
    },
    {
      title: "Manage Targeting",
      description: "Geographic settings",
      icon: MapPin,
      iconBg: "bg-purple-600",
      onClick: () => setLocation("/targeting"),
    },
    {
      title: "Budget Settings",
      description: "Manage spending",
      icon: DollarSign,
      iconBg: "bg-warning",
      onClick: () => setLocation("/budget"),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
