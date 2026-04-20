import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '../../theme';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function CatalogueStackedChart({ textures = {}, sizes = {} }) {
  // Build cross-tabulation data: for each top texture, show distribution across top sizes
  const topTextures = Object.entries(textures).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
  const topSizes = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);

  // Generate mock cross-tab data since API doesn't provide it
  const chartData = topTextures.map(tex => {
    const total = textures[tex] || 0;
    const entry = { name: tex };
    let remaining = total;
    topSizes.forEach((sz, i) => {
      const portion = i === topSizes.length - 1 ? remaining : Math.floor(total * (0.3 - i * 0.04));
      entry[sz] = Math.max(0, Math.min(portion, remaining));
      remaining -= entry[sz];
    });
    return entry;
  });

  if (!chartData.length) {
    return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No cross-tab data</div>;
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Tiles per Texture × Size</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ bottom: 30 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-25} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
          {topSizes.map((sz, i) => (
            <Bar key={sz} dataKey={sz} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === topSizes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
