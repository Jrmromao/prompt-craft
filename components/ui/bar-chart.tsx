import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors: string[];
  valueFormatter: (value: any) => string;
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
}: BarChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <XAxis
            dataKey={index}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {label}
                        </span>
                        {payload.map((entry: any, index: number) => (
                          <span
                            key={`item-${index}`}
                            className="font-medium text-muted-foreground"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {valueFormatter(entry.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 