import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeepseekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costs: {
    totalCost: number;
    cacheHitRate: number;
    totalRequests: number;
    averageLatency: number;
    monthlyTrend: {
      cost: number;
      requests: number;
      date: string;
    }[];
  } | null;
}

export function DeepseekDialog({ open, onOpenChange, costs }: DeepseekDialogProps) {
  if (!costs) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            DeepSeek API Usage Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Cost (Current Month)</p>
                  <p className="text-2xl font-bold">${costs.totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cache Hit Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{costs.cacheHitRate.toFixed(1)}%</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Optimized
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold">{costs.totalRequests.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Latency</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{costs.averageLatency}ms</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Good
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {costs.monthlyTrend.map((trend, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">{new Date(trend.date).toLocaleDateString()}</p>
                      <p className="text-lg font-semibold">${trend.cost.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{trend.requests.toLocaleString()} requests</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 