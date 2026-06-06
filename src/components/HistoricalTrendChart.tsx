import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { HistoricalAQIEntry } from "../types";

interface HistoricalTrendChartProps {
  data: HistoricalAQIEntry[];
}

// Function to get color based on CPCB SAMEER bands for the dot
function getAqiColorByValue(value: number): string {
  if (value <= 50) return "#10B981"; // Good
  if (value <= 100) return "#84CC16"; // Satisfactory
  if (value <= 200) return "#F59E0B"; // Moderate
  if (value <= 300) return "#EF4444"; // Poor
  if (value <= 400) return "#8B5CF6"; // Very Poor
  return "#7F1D1D"; // Severe
}

export default function HistoricalTrendChart({ data }: HistoricalTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-[#111113] border border-[#27272a] rounded-xl p-6 text-center text-zinc-500 text-xs">
        No historical data available for this range.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111113] border border-[#27272a] rounded-xl p-4 my-2">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
              }}
            />
            <YAxis 
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#e4e4e7",
                fontSize: "12px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="aqi" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle cx={cx} cy={cy} r={4} fill={getAqiColorByValue(payload.aqi)} stroke="#18181b" strokeWidth={1} />
                );
              }}
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "#18181b" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
