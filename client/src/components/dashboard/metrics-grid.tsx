import { DollarSign, Eye, MousePointer, BellRing } from "lucide-react";

interface MetricsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  activeCampaigns: number;
}

interface MetricsGridProps {
  summary?: MetricsSummary;
  isLoading: boolean;
}

export default function MetricsGrid({ summary, isLoading }: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const clickRate = summary && summary.totalImpressions > 0 
    ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(1)
    : '0.0';

  const metrics = [
    {
      title: "Total Spend",
      value: `$${summary?.totalSpend.toFixed(2) || '0.00'}`,
      change: "↗ 12.5%",
      changeType: "positive",
      icon: DollarSign,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      title: "Impressions",
      value: `${summary ? (summary.totalImpressions / 1000).toFixed(1) : '0.0'}K`,
      change: "↗ 8.2%",
      changeType: "positive",
      icon: Eye,
      iconBg: "bg-green-50",
      iconColor: "text-accent",
    },
    {
      title: "Click Rate",
      value: `${clickRate}%`,
      change: "↗ 2.1%",
      changeType: "positive",
      icon: MousePointer,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Active Campaigns",
      value: `${summary?.activeCampaigns || 0}`,
      change: "↘ 1",
      changeType: "negative",
      icon: BellRing,
      iconBg: "bg-orange-50",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.title} className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`metric-icon ${metric.iconBg}`}>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm ${metric.changeType === 'positive' ? 'text-accent' : 'text-red-500'}`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
