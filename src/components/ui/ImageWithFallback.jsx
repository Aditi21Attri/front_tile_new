import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ImageWithFallback({ src, alt, className = '', ...props }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`} {...props}>
        <ImageOff size={32} />
        <span className="text-xs mt-1.5 font-medium">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      {...props}
    />
  );
}
