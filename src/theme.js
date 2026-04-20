// TileDetect AI — Shared Theme Constants

export const COLORS = {
  orange: '#F97316',
  orangeLight: '#FB923C',
  orangeDark: '#EA580C',
  indigo: '#6366F1',
  indigoLight: '#818CF8',
  indigoDark: '#4F46E5',
  navy: '#0F172A',
  navyLight: '#1E293B',
  green: '#10B981',
  red: '#EF4444',
  slate: '#64748B',
};

// Chart color palette (orange -> indigo spectrum)
export const CHART_COLORS = [
  '#F97316', '#FB923C', '#FBBF24', '#6366F1',
  '#818CF8', '#A78BFA', '#10B981', '#14B8A6',
  '#F43F5E', '#EC4899',
];

// Texture -> pill color mapping
export const TEXTURE_COLORS = {
  'Glazed Vitrified': 'bg-orange-100 text-orange-700',
  'Polished Vitrified': 'bg-indigo-100 text-indigo-700',
  'Gres': 'bg-emerald-100 text-emerald-700',
  'Ceramic Wall': 'bg-pink-100 text-pink-700',
  'Porcelain': 'bg-blue-100 text-blue-700',
  'Matt': 'bg-slate-100 text-slate-700',
  'default': 'bg-gray-100 text-gray-700',
};

export function getTextureColor(texture) {
  return TEXTURE_COLORS[texture] || TEXTURE_COLORS['default'];
}

// Recharts custom tooltip style
export const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
  padding: '8px 12px',
};

// Match score color coding
export function getScoreColor(score) {
  const pct = (score || 0) * 100;
  if (pct >= 60) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (pct >= 40) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
}
