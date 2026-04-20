// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Upload, FileArchive, FileSpreadsheet, ImagePlus } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminUpload({
  addFile, setAddFile, addForm, setAddForm,
  addMode, setAddMode,
  batchFiles, setBatchFiles, batchCsv, setBatchCsv,
  zipFile, setZipFile,
  addingTile, addResult,
  onAddSingleTile, onAddBatchTiles, onAddZipTiles,
}) {
  const modes = [
    { key: 'single', label: 'Single Upload', icon: ImagePlus },
    { key: 'batch', label: 'Batch + CSV', icon: FileSpreadsheet },
    { key: 'zip', label: 'ZIP Archive', icon: FileArchive },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-brand-navy">Upload Tile</h1>
        <p className="text-sm text-slate-500 mt-1">Add tiles to the catalogue for detection and similarity matching</p>
      </motion.div>

      {/* Mode selector */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {modes.map(m => {
          const Icon = m.icon;
          const active = addMode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setAddMode(m.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-brand-indigo to-brand-indigo-light text-white shadow-glow-indigo'
                  : 'bg-white border border-surface-border text-slate-600 hover:bg-surface-secondary'
              }`}
            >
              <Icon size={16} /> {m.label}
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-surface-border bg-white p-6">
        {/* Single Upload */}
        {addMode === 'single' && (
          <form onSubmit={onAddSingleTile} className="space-y-4">
            <label
              htmlFor="add-image"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-orange hover:bg-brand-orange/5 transition-all duration-300 group"
            >
              <input
                id="add-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAddFile(e.target.files?.[0] || null)}
              />
              <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <ImagePlus size={28} className="text-brand-orange" />
              </div>
              <p className="font-semibold text-brand-navy text-sm">{addFile ? addFile.name : 'Select tile image'}</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['img_name', 'img_url', 'size', 'texture', 'color'].map(field => (
                <input
                  key={field}
                  placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) + (field === 'img_name' || field === 'img_url' ? ' (optional)' : '')}
                  value={addForm[field]}
                  onChange={e => setAddForm(s => ({ ...s, [field]: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={addingTile}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-50 hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {addingTile ? (
                <><motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                /> Uploading...</>
              ) : (
                <><Upload size={18} /> Upload & Index Tile</>
              )}
            </button>
          </form>
        )}

        {/* Batch Upload */}
        {addMode === 'batch' && (
          <form onSubmit={onAddBatchTiles} className="space-y-4">
            <label htmlFor="batch-images" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-orange transition-all group">
              <input id="batch-images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => setBatchFiles(Array.from(e.target.files || []))} />
              <ImagePlus size={24} className="text-brand-orange mb-2" />
              <p className="font-semibold text-sm text-brand-navy">{batchFiles.length ? `${batchFiles.length} images selected` : 'Select batch images'}</p>
            </label>

            <label htmlFor="batch-csv" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-indigo transition-all group">
              <input id="batch-csv" type="file" accept=".csv" className="hidden" onChange={(e) => setBatchCsv(e.target.files?.[0] || null)} />
              <FileSpreadsheet size={24} className="text-brand-indigo mb-2" />
              <p className="font-semibold text-sm text-brand-navy">{batchCsv ? batchCsv.name : 'Select metadata CSV'}</p>
            </label>

            <button type="submit" disabled={addingTile} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-50 hover:shadow-glow-orange transition-all duration-300 flex items-center justify-center gap-2">
              {addingTile ? 'Uploading...' : <><Upload size={18} /> Upload Batch</>}
            </button>
          </form>
        )}

        {/* ZIP Upload */}
        {addMode === 'zip' && (
          <form onSubmit={onAddZipTiles} className="space-y-4">
            <label htmlFor="zip-file" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-orange transition-all group">
              <input id="zip-file" type="file" accept=".zip" className="hidden" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
              <FileArchive size={28} className="text-brand-orange mb-2" />
              <p className="font-semibold text-sm text-brand-navy">{zipFile ? zipFile.name : 'Select ZIP archive (images + CSV)'}</p>
            </label>

            <button type="submit" disabled={addingTile} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-50 hover:shadow-glow-orange transition-all duration-300 flex items-center justify-center gap-2">
              {addingTile ? 'Uploading...' : <><Upload size={18} /> Upload ZIP</>}
            </button>
          </form>
        )}

        {/* Result toast */}
        {addResult && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            ✓ {addResult}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
