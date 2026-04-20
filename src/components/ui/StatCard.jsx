import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, delay = 0 }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-surface-border bg-white p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-brand-orange/10 to-brand-indigo/10 -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-brand-orange tracking-tight">{value}</p>
          <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {trend > 0 ? (
            <><TrendingUp size={14} className="text-emerald-500" /><span className="text-emerald-600">+{trend}%</span></>
          ) : trend < 0 ? (
            <><TrendingDown size={14} className="text-red-500" /><span className="text-red-600">{trend}%</span></>
          ) : (
            <><Minus size={14} className="text-slate-400" /><span className="text-slate-500">No change</span></>
          )}
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
