import { motion } from 'framer-motion';
import { Search, ImageOff, AlertCircle } from 'lucide-react';

export default function EmptyState({ type = 'no-results', message = '', actionButton = null }) {
  const configs = {
    'no-results': {
      icon: Search,
      title: 'No Results Found',
      desc: message || 'Try uploading a different image or adjusting your search',
      color: 'slate',
    },
    'no-image': {
      icon: ImageOff,
      title: 'No Image Selected',
      desc: message || 'Upload an image to get started with tile detection',
      color: 'slate',
    },
    'error': {
      icon: AlertCircle,
      title: 'Something Went Wrong',
      desc: message || 'An error occurred while processing your request',
      color: 'red',
    },
  };

  const config = configs[type] || configs['no-results'];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center space-y-4"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          config.color === 'red' ? 'bg-red-100' : 'bg-slate-100'
        }`}
      >
        <Icon size={32} className={config.color === 'red' ? 'text-red-500' : 'text-slate-400'} />
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-brand-navy mb-2">{config.title}</h3>
        <p className="text-sm text-slate-500 max-w-xs">{config.desc}</p>
      </div>

      {actionButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={actionButton.onClick}
          className="mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold text-sm hover:shadow-glow-orange transition-all duration-200"
        >
          {actionButton.label}
        </motion.button>
      )}
    </motion.div>
  );
}
