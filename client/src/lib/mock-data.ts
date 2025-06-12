// This file contains mock data structure for reference
// The actual data comes from the backend storage

export interface MockMetrics {
  totalSpend: number;
  impressions: number;
  clickRate: number;
  activeCampaigns: number;
}

export interface MockCampaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: string;
  impressions: string;
  ctr: string;
  location: string;
}

// Chart data structure for performance visualization
export const performanceChartData = {
  labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
  datasets: [
    {
      label: 'Impressions',
      data: [1200, 1900, 3000, 2800, 3500, 4200, 4500],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    {
      label: 'Clicks',
      data: [65, 85, 120, 110, 140, 165, 180],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
  ],
};

// Geographic targeting options
export const targetingOptions = {
  radiusOptions: ['0.5', '1.0', '2.0', '5.0', '10.0'],
  audienceTypes: ['everyone', 'workers', 'residents', 'recent-visitors'],
  campaignTypes: ['local-awareness', 'store-visits', 'lead-generation', 'event-promotion'],
  durations: ['1-week', '2-weeks', '1-month', '3-months', 'ongoing'],
};
