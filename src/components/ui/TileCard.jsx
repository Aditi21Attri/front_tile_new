import { useState } from 'react';
import { Bookmark, Eye } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { getTextureColor } from '../../theme';

import { MAIN_API } from '../../config/api';

const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  // If already a path (starts with /), use it directly
  if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
  // Otherwise assume it's a catalogue image
  const name = filename.split('/').pop();
  return `${MAIN_API}/static/tiles_images/${name}`;
};

export default function TileCard({ tile, onView }) {
  const [bookmarked, setBookmarked] = useState(false);
  const name = tile.img_name || tile.name || 'Untitled';
  const imgUrl = getImageUrl(tile.img_url || tile.image || tile.url);
  const textureCls = getTextureColor(tile.texture);

  return (
    <div className="group relative rounded-xl border border-surface-border bg-white overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={imgUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-white text-sm font-semibold truncate">{name}</p>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Bookmark size={16} className={bookmarked ? 'fill-brand-orange text-brand-orange' : 'text-slate-600'} />
        </button>

        {/* Quick View overlay */}
        {onView && (
          <button
            onClick={() => onView(tile)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="flex items-center gap-2 bg-white text-brand-navy px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
              <Eye size={16} /> Quick View
            </span>
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="p-3 space-y-1.5">
        {tile.texture && (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${textureCls}`}>
            {tile.texture}
          </span>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {tile.size && <span>📐 {tile.size}</span>}
          {tile.color && <span>🎨 {tile.color}</span>}
        </div>
      </div>
    </div>
  );
}
