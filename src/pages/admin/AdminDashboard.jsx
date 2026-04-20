import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Database, Layers, Ruler, Palette, Upload, Search, BookOpen } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { SkeletonStat, SkeletonChart, SkeletonRow } from '../../components/ui/SkeletonLoader';
import TextureDonutChart from '../../components/charts/TextureDonutChart';
import SizeBarChart from '../../components/charts/SizeBarChart';
import ColorBarChart from '../../components/charts/ColorBarChart';
import { getTextureColor } from '../../theme';
import { MAIN_API } from '../../config/api';

const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  const name = filename.split('/').pop();
  return `${MAIN_API}/static/tiles_images/${name}`;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard({ stats, onLoadStats, onTabChange }) {
  useEffect(() => { onLoadStats(); }, [onLoadStats]);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonChart key={i} />)}
        </div>
      </div>
    );
  }

  const totalTiles = stats.total || 0;
  const textureCount = Object.keys(stats.textures || {}).length;
  const sizeCount = Object.keys(stats.sizes || {}).length;
  const colorCount = Object.keys(stats.colors || {}).length;
  const recent = stats.recent || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Enterprise-grade tile detection and smart recommendations</p>
          </div>
          <button
            onClick={onLoadStats}
            className="px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl font-semibold text-sm hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-0.5"
          >
            ↻ Refresh Insights
          </button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tiles Indexed" value={totalTiles} icon={Database} trend={12} delay={0} />
        <StatCard label="Textures" value={textureCount} icon={Layers} trend={3} delay={100} />
        <StatCard label="Sizes" value={sizeCount} icon={Ruler} trend={0} delay={200} />
        <StatCard label="Colors" value={colorCount} icon={Palette} trend={5} delay={300} />
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT — Charts (2 cols width) */}
        <motion.div variants={item} className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-brand-navy">Catalogue Breakdown</h2>
          <TextureDonutChart data={stats.textures} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SizeBarChart data={stats.sizes} />
            <ColorBarChart data={stats.colors} />
          </div>
        </motion.div>

        {/* RIGHT — Recent Tiles + Quick Actions */}
        <motion.div variants={item} className="space-y-4">
          {/* Recent Tiles */}
          <div className="rounded-xl border border-surface-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-navy">Recent Tiles</h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange font-semibold">{recent.length}</span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
              {recent.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No tiles added yet</p>
              ) : (
                recent.slice(0, 8).map((tile, idx) => {
                  const texCls = getTextureColor(tile.texture);
                  return (
                    <div key={tile.img_name + idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors group cursor-pointer">
                      <ImageWithFallback
                        src={getImageUrl(tile.img_url)}
                        alt={tile.img_name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brand-navy truncate">{tile.img_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tile.texture && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${texCls}`}>{tile.texture}</span>
                          )}
                          <span className="text-[11px] text-slate-400">{tile.size || ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-surface-border bg-white p-5">
            <h2 className="text-lg font-semibold text-brand-navy mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              <button
                onClick={() => onTabChange('admin-upload')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold text-sm hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-0.5"
              >
                <Upload size={18} /> Upload New Tile
              </button>
              <button
                onClick={() => onTabChange('search')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-indigo-light text-white font-semibold text-sm hover:shadow-glow-indigo transition-all duration-300 hover:-translate-y-0.5"
              >
                <Search size={18} /> Search Similar
              </button>
              <button
                onClick={() => onTabChange('admin-catalogue')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-brand-navy text-brand-navy font-semibold text-sm hover:bg-brand-navy hover:text-white transition-all duration-300"
              >
                <BookOpen size={18} /> View Catalogue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
