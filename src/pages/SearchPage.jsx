import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import HeroSearchBar from '../components/search/HeroSearchBar';
import SimilarityCard from '../components/search/SimilarityCard';
import ScoreVisualization from '../components/search/ScoreVisualization';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { MAIN_API } from '../config/api';

const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  const name = filename.split('/').pop();
  return `${MAIN_API}/static/tiles_images/${name}`;
};

const getImageUrlCrop = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  // For crop images like "file_id/crop_name", prepend /static/crops/
  return `${MAIN_API}/static/crops/${filename}`;
};

export default function SearchPage({
  sourceImage, setSourceImage,
  detecting, onDetectSubmit,
  crops, selectedCrop, setSelectedCrop,
  searching, onFindSimilar, canSearch,
  matches, error,
}) {
  const [showCropSelection, setShowCropSelection] = useState(false);
  const [averageScore, setAverageScore] = useState(0);

  // Handle visualization button click
  const handleVisualize = (tile) => {
    // Store BOTH the selected tile AND all recommended matches for the visualization page
    sessionStorage.setItem('selectedVisualizationTile', JSON.stringify(tile));
    sessionStorage.setItem('recommendedTiles', JSON.stringify(matches));
    // Navigate to dedicated visualization page
    window.location.href = '/visualization';
  };
 
  // Calculate average score for visualization
  useEffect(() => {
    if (matches.length > 0) {
      const avg = matches.reduce((sum, m) => sum + (m.score || 0), 0) / matches.length;
      setAverageScore(avg);
    } else {
      setAverageScore(0);
    }
  }, [matches]);

  // Show crop selection if crops are available
  useEffect(() => {
    if (crops.length > 0) {
      setShowCropSelection(true);
    } else {
      setShowCropSelection(false);
    }
  }, [crops]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-orange-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold text-xs hover:shadow-glow-orange transition-all duration-300"
          >
            📊 Admin
          </button>
        </div>
      </div>
      <section className="py-6 md:py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy">Find Similar Tiles</h1>
            <p className="text-sm md:text-base text-slate-600">
              Upload an image, detect tiles, and find perfect matches in your catalogue
            </p>
          </motion.div>

          {/* Main search bar */}
          <HeroSearchBar
            sourceImage={sourceImage}
            setSourceImage={setSourceImage}
            onDetectSubmit={onDetectSubmit}
            detecting={detecting}
          />

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3"
            >
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Detection Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Crop Selection Section */}
      {showCropSelection && crops.length > 0 && (
        <section className="px-4 py-5 bg-white border-t border-b border-slate-200">
          <div className="max-w-4xl mx-auto space-y-3">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base font-semibold text-brand-navy flex items-center gap-2"
            >
              <Sparkles size={18} className="text-brand-orange" />
              Detected Tiles ({crops.length})
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
            >
              {crops.map((crop, idx) => {
                const active = selectedCrop?.crop === crop.crop;
                return (
                  <motion.button
                    key={crop.crop}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCrop(crop)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 group ${
                      active
                        ? 'border-brand-orange ring-2 ring-brand-orange/30 shadow-glow-orange'
                        : 'border-slate-300 hover:border-brand-orange/50 hover:shadow-md'
                    }`}
                  >
                    <ImageWithFallback
                      src={getImageUrlCrop(crop.url)}
                      alt={`Crop ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {active && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-brand-orange/10 flex items-center justify-center"
                      >
                        <span className="text-xs font-bold bg-brand-orange text-white px-2 py-1 rounded-full">
                          Selected
                        </span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Search button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={!canSearch || searching}
              onClick={onFindSimilar}
              className="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-indigo-light disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-indigo transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              {searching ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Finding Similar Tiles...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Find Similar Tiles</span>
                </>
              )}
            </motion.button>
          </div>
        </section>
      )}

      {/* Results Section */}
      {(matches.length > 0 || searching) && (
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start justify-between flex-wrap gap-3"
            >
              <div>
                <h2 className="text-xl font-bold text-brand-navy mb-1">Similar Tiles</h2>
                {matches.length > 0 && (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <span>Avg Match:</span>
                    <ScoreVisualization score={averageScore} showPercentage={true} />
                  </p>
                )}
              </div>

              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs"
                >
                  {matches.length} matches
                </motion.div>
              )}
            </motion.div>

            {/* Loading State */}
            {searching && <LoadingState count={6} type="cards" />}

            {/* Results Grid */}
            {!searching && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {matches.map((match, idx) => (
                  <SimilarityCard
                    key={`${match.img_name || match.name}-${idx}`}
                    result={match}
                    index={idx}
                    delay={idx}
                    onVisualize={handleVisualize}
                  />
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!searching && matches.length === 0 && !error && selectedCrop && (
              <EmptyState
                type="no-results"
                message="Try selecting a different crop or upload a new image"
              />
            )}
          </div>
        </section>
      )}

      {/* Initial Empty State */}
      {!searching && matches.length === 0 && !selectedCrop && !error && crops.length === 0 && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <EmptyState
              type="no-image"
              message="Start by uploading an image above to detect tiles and find matches"
            />
          </div>
        </section>
      )}

      {/* Error State */}
      {!searching && error && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <EmptyState
              type="error"
              message={error}
            />
          </div>
        </section>
      )}
    </div>
  );
}
