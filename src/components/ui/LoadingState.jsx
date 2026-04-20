import { motion } from 'framer-motion';

export default function LoadingState({ count = 6, type = 'cards' }) {
  const container = { show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0.5 }, show: { opacity: 1, transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' } } };

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i} variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* Image skeleton */}
            <motion.div
              variants={item}
              className="aspect-square bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl animate-pulse"
            />
            {/* Title skeleton */}
            <motion.div variants={item} className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
            {/* Text skeleton */}
            <motion.div variants={item} className="h-3 bg-slate-200 rounded-lg w-full animate-pulse" />
            {/* Badge skeletons */}
            <div className="flex gap-2">
              <motion.div variants={item} className="h-6 bg-slate-200 rounded-full w-16 animate-pulse" />
              <motion.div variants={item} className="h-6 bg-slate-200 rounded-full w-16 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={item}
            className="flex gap-4 p-4 bg-slate-50 rounded-lg"
          >
            <motion.div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <motion.div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
              <motion.div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Processing animation
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-brand-orange"
        />
      </div>
      <div className="text-center space-y-2">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-semibold text-brand-navy"
        >
          Processing...
        </motion.p>
        <motion.p className="text-sm text-slate-500">
          This may take a few seconds
        </motion.p>
      </div>
    </div>
  );
}
