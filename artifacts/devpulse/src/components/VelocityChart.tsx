import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { VelocityDay } from "@workspace/api-client-react";

interface VelocityChartProps {
  data: VelocityDay[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
            stroke="var(--text-muted)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={10}
            fontFamily="JetBrains Mono"
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              borderColor: 'var(--border-subtle)', 
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono',
              fontSize: '10px'
            }}
            itemStyle={{ color: 'var(--accent-orange)' }}
            labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          />
          <Bar dataKey="commits" radius={[2, 2, 0, 0]} barSize={40}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="var(--accent-orange)" fillOpacity={0.3} className="hover:fill-opacity-100 transition-all duration-300" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
