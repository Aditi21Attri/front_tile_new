import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, ImagePlus, Sparkles } from 'lucide-react';

export default function HeroSearchBar({ sourceImage, setSourceImage, onDetectSubmit, detecting }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      setSourceImage(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50/80 to-slate-100/50 p-12 transition-all duration-300"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: isDragOver ? '#F97316' : undefined,
          backgroundColor: isDragOver ? '#F973160a' : undefined,
        }}
      >
        <form onSubmit={onDetectSubmit} className="space-y-6">
          {/* Upload zone */}
          <label htmlFor="search-upload" className="flex flex-col items-center justify-center cursor-pointer group">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ImagePlus size={32} className="text-brand-orange" />
            </motion.div>
            <input
              id="search-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setSourceImage(e.target.files?.[0] || null);
                setIsDragOver(false);
              }}
            />
            <p className="font-bold text-lg text-brand-navy text-center">
              {sourceImage ? sourceImage.name : 'Drag tile image here or click to browse'}
            </p>
            <p className="text-sm text-slate-500 mt-2">PNG, JPG, WEBP up to 10MB</p>
            {sourceImage && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-sm px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full font-semibold"
              >
                ✓ {sourceImage.name} ({(sourceImage.size / 1024 / 1024).toFixed(2)} MB)
              </motion.span>
            )}
          </label>

          {/* Detect button */}
          <motion.button
            type="submit"
            disabled={detecting || !sourceImage}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-orange transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            {detecting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Detecting Tiles...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Detect Tiles</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Info text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-slate-500 text-sm mt-6"
      >
        Our AI will automatically detect individual tiles in your image and help you find perfect matches
      </motion.p>
    </motion.div>
  );
}
