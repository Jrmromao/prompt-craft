interface ModelData {
  model: string;
  runs: number;
  cost: number;
  avgCost: number;
  successRate: number;
}

export function ModelBreakdown({ data }: { data: ModelData[] }) {
  const totalCost = data.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Model Breakdown</h3>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((model, i) => {
            const percentage = (model.cost / totalCost) * 100;
            
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{model.model}</div>
                    <div className="text-sm text-gray-600">
                      {model.runs} runs • ${model.avgCost.toFixed(4)}/run
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${model.cost.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
