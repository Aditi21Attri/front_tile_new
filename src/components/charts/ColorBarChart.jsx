import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TOOLTIP_STYLE } from '../../theme';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold">{payload[0].payload.name}</p>
      <p className="text-sm opacity-80">{payload[0].value} tiles</p>
    </div>
  );
};

export default function ColorBarChart({ data = {} }) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  if (!chartData.length) {
    return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No color data available</div>;
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Colors</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ bottom: 40 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="url(#colorGradient)"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
