import { DollarSign, Zap, Clock, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewData {
  totalRuns: number;
  totalCost: number;
  avgCostPerRun: number;
  successRate: number;
  avgLatency: number;
  periodComparison: {
    runs: number;
    cost: number;
  };
}

export function OverviewCards({ data }: { data: OverviewData }) {
  const cards = [
    {
      title: 'Total Cost',
      value: `$${data.totalCost.toFixed(2)}`,
      change: data.periodComparison.cost,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Runs',
      value: data.totalRuns.toLocaleString(),
      change: data.periodComparison.runs,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Avg Cost/Run',
      value: `$${data.avgCostPerRun.toFixed(4)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Success Rate',
      value: `${data.successRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            {card.change !== undefined && (
              <div className={`flex items-center text-sm ${
                card.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(card.change).toFixed(0)}
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{card.value}</div>
          <div className="text-sm text-gray-600">{card.title}</div>
        </div>
      ))}
    </div>
  );
}
