import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
}

interface AQIChartProps {
  data: ChartDataItem[];
  type?: "bar" | "pie" | "none";
}

// Function to get color based on CPCB SAMEER bands
function getAqiColorByValue(value: number): string {
  if (value <= 50) return "#10B981"; // Good (Emerald)
  if (value <= 100) return "#84CC16"; // Satisfactory (Lime)
  if (value <= 200) return "#F59E0B"; // Moderate (Amber)
  if (value <= 300) return "#EF4444"; // Poor (Red)
  if (value <= 400) return "#8B5CF6"; // Very Poor (Purple)
  return "#7F1D1D"; // Severe (Maroon)
}

export default function AQIChart({ data, type = "bar" }: AQIChartProps) {
  if (!data || data.length === 0 || type === "none") {
    return null;
  }

  // Double check sorting to make sure comparison is elegant
  const chartData = [...data];

  return (
    <div className="w-full bg-[#111113] border border-[#27272a] rounded-xl p-4 my-2">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
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
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                color: "#e4e4e7",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
              {chartData.map((item, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getAqiColorByValue(item.value)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Good (0-50)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
          Satisfactory (51-100)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Moderate (101-200)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          Poor (201-300)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
          Very Poor (301-400)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-950"></span>
          Severe (401+)
        </div>
      </div>
    </div>
  );
}
