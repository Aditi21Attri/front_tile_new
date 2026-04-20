import { motion } from 'framer-motion';

export default function ScoreVisualization({ score, showPercentage = true }) {
  const percentage = Math.round((score || 0) * 100);

  // Determine color based on score
  const getColor = (pct) => {
    if (pct >= 70) return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700' };
    if (pct >= 50) return { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' };
    return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' };
  };

  const colors = getColor(percentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Match Score</span>
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-bold ${colors.text}`}
          >
            {percentage}%
          </motion.span>
        )}
      </div>

      {/* Score bar with animation */}
      <div className={`w-full h-2.5 rounded-full ${colors.light} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colors.bg} rounded-full shadow-lg`}
          style={{
            boxShadow: `0 0 12px ${colors.bg === 'bg-emerald-500' ? '#10b981' : colors.bg === 'bg-amber-500' ? '#f59e0b' : '#ef4444'}40`,
          }}
        />
      </div>

      {/* Descriptive text */}
      <p className="text-xs text-slate-500">
        {percentage >= 70 ? 'Excellent match' : percentage >= 50 ? 'Good match' : 'Fair match'}
      </p>
    </div>
  );
}
