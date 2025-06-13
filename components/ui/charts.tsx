'use client';

import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
}

export function LineChart({ data, xAxis, yAxis }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yAxis} stroke="#8884d8" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ data, xAxis, yAxis }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yAxis} fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
} 