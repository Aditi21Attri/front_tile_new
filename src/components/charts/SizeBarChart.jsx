import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '../../theme';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold">{payload[0].payload.name}</p>
      <p className="text-sm opacity-80">{payload[0].value} tiles</p>
    </div>
  );
};

export default function SizeBarChart({ data = {} }) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  if (!chartData.length) {
    return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No size data available</div>;
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Sizes</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
          <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
