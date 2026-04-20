import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Database, Layers, Ruler, Palette, Search, LayoutGrid, List, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import TileCard from '../components/ui/TileCard';
import { SkeletonCard, SkeletonChart } from '../components/ui/SkeletonLoader';
import CatalogueStackedChart from '../components/charts/CatalogueStackedChart';
import TextureDonutChart from '../components/charts/TextureDonutChart';
import { getTextureColor } from '../theme';
import { MAIN_API } from '../config/api';

const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  const name = filename.split('/').pop();
  return `${MAIN_API}/static/tiles_images/${name}`;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const ITEMS_PER_PAGE = 12;

export default function CataloguePage({
  stats,
  manageQuery, setManageQuery,
  manageResults, onManageSearch, managing,
  onDeleteTile, openEdit,
  editState, setEditState, saveEdit, editSaving,
  onLoadStats,
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [textureFilter, setTextureFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => { onLoadStats(); }, [onLoadStats]);

  const totalTiles = stats?.total || 0;
  const textureCount = Object.keys(stats?.textures || {}).length;
  const sizeCount = Object.keys(stats?.sizes || {}).length;
  const colorCount = Object.keys(stats?.colors || {}).length;

  // Filter and paginate results
  let filtered = [...manageResults];
  if (textureFilter) filtered = filtered.filter(t => t.texture === textureFilter);
  if (sizeFilter) filtered = filtered.filter(t => t.size === sizeFilter);
  if (sortBy === 'name') filtered.sort((a, b) => (a.img_name || '').localeCompare(b.img_name || ''));
  else if (sortBy === 'texture') filtered.sort((a, b) => (a.texture || '').localeCompare(b.texture || ''));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-brand-navy">Catalogue</h1>
        <p className="text-sm text-slate-500 mt-1">Browse, filter, and manage your tile collection</p>
      </motion.div>

      {/* Summary pills */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        {[
          { label: 'Total Tiles', value: totalTiles, icon: Database },
          { label: 'Textures', value: textureCount, icon: Layers },
          { label: 'Sizes', value: sizeCount, icon: Ruler },
          { label: 'Colors', value: colorCount, icon: Palette },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-border text-sm">
            <s.icon size={14} className="text-brand-orange" />
            <span className="font-bold text-brand-navy">{s.value}</span>
            <span className="text-slate-500">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-surface-border">
        <form onSubmit={onManageSearch} className="flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by tile name..."
              value={manageQuery}
              onChange={e => setManageQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-indigo-light text-white font-semibold text-sm hover:shadow-glow-indigo transition-all">
            {managing ? 'Searching...' : 'Search'}
          </button>
        </form>

        <select value={textureFilter} onChange={e => { setTextureFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
          <option value="">All Textures</option>
          {Object.keys(stats?.textures || {}).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={sizeFilter} onChange={e => { setSizeFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
          <option value="">All Sizes</option>
          {Object.keys(stats?.sizes || {}).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
          <option value="name">Sort by Name</option>
          <option value="texture">Sort by Texture</option>
        </select>

        <div className="flex rounded-xl border border-surface-border overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-brand-indigo text-white' : 'bg-white text-slate-500 hover:bg-surface-secondary'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-brand-indigo text-white' : 'bg-white text-slate-500 hover:bg-surface-secondary'}`}>
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {/* Charts */}
      {stats && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CatalogueStackedChart textures={stats.textures} sizes={stats.sizes} />
          <TextureDonutChart data={stats.colors} />
        </motion.div>
      )}

      {/* Tile Grid / Table */}
      <motion.div variants={item}>
        {filtered.length === 0 && manageResults.length === 0 ? (
          <div className="rounded-xl border border-surface-border bg-white p-12 text-center">
            <Search size={48} strokeWidth={1} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Search to browse catalogue tiles</p>
            <p className="text-xs text-slate-400 mt-1">Type a tile name and click Search</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(t => (
              <div key={t.faiss_id} className="relative group">
                <TileCard tile={t} />
                {/* Actions overlay */}
                <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(t.faiss_id)} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-brand-indigo hover:bg-brand-indigo hover:text-white transition-all shadow">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDeleteTile(t.faiss_id, t.img_name)} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-surface-border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-secondary text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Image</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Texture</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Size</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Color</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => {
                  const texCls = getTextureColor(t.texture);
                  return (
                    <tr key={t.faiss_id} className="border-b border-surface-border hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-2.5"><ImageWithFallback src={getImageUrl(t.img_url)} alt={t.img_name} className="w-10 h-10 rounded-lg object-cover" /></td>
                      <td className="px-4 py-2.5 font-semibold text-brand-navy">{t.img_name}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${texCls}`}>{t.texture || '-'}</span></td>
                      <td className="px-4 py-2.5 text-slate-600">{t.size || '-'}</td>
                      <td className="px-4 py-2.5 text-slate-600">{t.color || '-'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(t.faiss_id)} className="p-1.5 rounded-lg text-brand-indigo hover:bg-brand-indigo/10 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => onDeleteTile(t.faiss_id, t.img_name)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-surface-border disabled:opacity-30 hover:bg-surface-secondary transition-colors">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === n ? 'bg-brand-indigo text-white' : 'border border-surface-border hover:bg-surface-secondary'}`}>
              {n}
            </button>
          ))}
          {totalPages > 5 && <span className="text-slate-400">…</span>}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-surface-border disabled:opacity-30 hover:bg-surface-secondary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editState && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditState(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-brand-navy mb-4">Edit: {editState.img_name}</h3>
            <form onSubmit={saveEdit} className="space-y-3">
              {['img_url', 'size', 'texture', 'color'].map(field => (
                <input
                  key={field}
                  placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  value={editState[field]}
                  onChange={e => setEditState(s => ({ ...s, [field]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
                />
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSaving} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-50 hover:shadow-glow-orange transition-all">
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditState(null)} className="px-4 py-2.5 rounded-xl font-semibold border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
