import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Budget() {
  const { data: metricsSummary, isLoading } = useQuery<{
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    activeCampaigns: number;
  }>({
    queryKey: ["/api/metrics/business/1/summary"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Budget Management</h2>
          <p className="text-sm text-gray-500">Monitor and control your advertising spend</p>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metricsSummary?.totalSpend.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsSummary?.activeCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Daily Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metricsSummary ? (metricsSummary.totalSpend / 30).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost per Click</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metricsSummary && metricsSummary.totalClicks > 0 
                  ? (metricsSummary.totalSpend / metricsSummary.totalClicks).toFixed(2) 
                  : '0.00'
                }
              </div>
              <p className="text-xs text-muted-foreground">Average CPC</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Facebook Ads</span>
                  <span className="text-sm text-gray-500">$850 / $1,200</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70.8%' }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Google Ads</span>
                  <span className="text-sm text-gray-500">$420 / $800</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '52.5%' }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Instagram Ads</span>
                  <span className="text-sm text-gray-500">$280 / $500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-600 h-2 rounded-full" style={{ width: '56%' }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Local Directories</span>
                  <span className="text-sm text-gray-500">$150 / $300</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Under Budget</div>
                    <div className="text-sm text-green-600">$1,130 remaining this month</div>
                  </div>
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">62%</div>
                    <div className="text-sm text-gray-500">Budget Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">18 days</div>
                    <div className="text-sm text-gray-500">Remaining</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Projected Spend</div>
                  <div className="text-lg font-semibold">$2,450 / $2,800</div>
                  <div className="text-sm text-green-600">On track to finish under budget</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium">Facebook approaching limit</div>
                  <div className="text-xs text-gray-500">71% of monthly budget used</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium">Google Ads optimized</div>
                  <div className="text-xs text-gray-500">CPC reduced by 15%</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium">Monthly target achieved</div>
                  <div className="text-xs text-gray-500">ROI exceeded expectations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Budget Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Increase Monthly Budget
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reallocate Between Platforms
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Set Budget Alerts
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <TrendingDown className="w-4 h-4 mr-2" />
                Pause Low Performers
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Smart Bidding</div>
                <div className="text-xs text-purple-600">Enable automated bidding to optimize for conversions</div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-800">Time-Based Adjustments</div>
                <div className="text-xs text-orange-600">Increase budget during peak hours (2-4 PM)</div>
              </div>
              
              <div className="p-3 bg-indigo-50 rounded-lg">
                <div className="text-sm font-medium text-indigo-800">Audience Refinement</div>
                <div className="text-xs text-indigo-600">Focus budget on high-converting demographics</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
