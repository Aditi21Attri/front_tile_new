import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ImageWithFallback from '../ui/ImageWithFallback';
import ScoreVisualization from './ScoreVisualization';
import { getTextureColor } from '../../theme';
import { MAIN_API } from '../../config/api';

const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  const name = filename.split('/').pop();
  return `${MAIN_API}/static/tiles_images/${name}`;
};

export default function SimilarityCard({ result, index, delay = 0, onVisualize }) {
  const texClass = getTextureColor(result.texture);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.04, duration: 0.25 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative h-full"
    >
      <div className="rounded-lg border border-surface-border bg-white overflow-hidden hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          <ImageWithFallback
            src={getImageUrl(result.image || result.img_url)}
            alt={result.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Score Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-sm rounded-md p-1.5 shadow-lg border border-white/20"
          >
            <div className="text-center">
              <div className="text-xs font-bold text-transparent bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text">
                {Math.round((result.score || 0) * 100)}%
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-2 flex-1 flex flex-col">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy line-clamp-2">{result.name}</h3>
            {result.img_url && (
              <p className="text-[11px] text-slate-500 line-clamp-1">{result.img_url}</p>
            )}
          </div>

          {/* Score Visualization */}
          <ScoreVisualization score={result.score || 0} />

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-1.5">
            {result.texture && (
              <span
                className={`inline-block text-[11px] px-2 py-1 rounded font-semibold ${texClass}`}
              >
                {result.texture}
              </span>
            )}
            {result.size && (
              <span className="inline-block text-[11px] px-2 py-1 rounded font-semibold bg-blue-100 text-blue-700">
                {result.size}
              </span>
            )}
            {result.color && (
              <span className="inline-block text-[11px] px-2 py-1 rounded font-semibold bg-purple-100 text-purple-700">
                {result.color}
              </span>
            )}
          </div>

          {/* Visualize Button */}
          <button
            onClick={() => onVisualize?.(result)}
            className="mt-auto w-full px-3 py-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light hover:shadow-glow-orange rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Visualize
          </button>
        </div>
      </div>
    </motion.div>
  );
}
