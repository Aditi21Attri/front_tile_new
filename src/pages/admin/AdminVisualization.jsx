import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Sparkles, Upload, Image as ImageIcon, SlidersHorizontal,
  Download, Play, Eye, Loader2, AlertTriangle, CheckCircle2,
  Clock
} from "lucide-react";
import { FLUX_API, MAIN_API } from "../../config/api";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminVisualization() {
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [roomImageFile, setRoomImageFile] = useState(null);
  const [roomImagePreview, setRoomImagePreview] = useState(null);
  const [promptText, setPromptText] = useState(
    'Photorealistic interior room visualization. Apply the reference tile texture ONLY on the back wall. Keep the floor, ceiling, and furniture completely unchanged. Tiles should have consistent grout lines, realistic reflections, and natural lighting matching the room. High resolution, sharp detail, professional interior photography.'
  );
  const [selectedRoom, setSelectedRoom] = useState('living room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [strength, setStrength] = useState(0.65);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [error, setError] = useState(null);

  // Load tiles and check if one was selected from search
  useEffect(() => {
    const fetchTiles = async () => {
      try {
        const res = await fetch(`${MAIN_API}/api/v1/catalogue/search?q=&limit=50`, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });
        if (res.ok) {
          const data = await res.json();
          setTiles(data.results || []);

          // Check if a tile was passed from search page
          const storedTile = sessionStorage.getItem('selectedVisualizationTile');
          if (storedTile) {
            try {
              const tile = JSON.parse(storedTile);
              setSelectedTile(tile);
              sessionStorage.removeItem('selectedVisualizationTile'); // Clear after using
            } catch (e) {
              console.error('Failed to parse stored tile:', e);
            }
          }
        } else {
          setTiles([]);
        }
      } catch (err) {
        console.error("Failed to load tiles", err);
      }
    };
    fetchTiles();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImageFile(file);
      setRoomImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTileSelect = (e) => {
    const idx = Number(e.target.value);
    if (idx >= 0 && idx < tiles.length) {
      setSelectedTile(tiles[idx]);
    } else {
      setSelectedTile(null);
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename;
    if (filename.startsWith('/')) return `${MAIN_API}${filename}`;
    const name = filename.split('/').pop();
    return `${MAIN_API}/static/tiles_images/${name}`;
  };

  const startPolling = (taskId) => {
    setCurrentTaskId(taskId);
    let attempts = 0;
    const maxAttempts = 100;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${FLUX_API}/api/flux/status/${taskId}`, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });
        const data = await res.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          setGeneratedImage(data.image_url);
          setIsGenerating(false);
          setCurrentTaskId(null);
          setShowResume(false);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError('Generation failed: ' + (data.error || 'Unknown'));
          setIsGenerating(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowResume(true);
        }
      } catch (err) {
        clearInterval(interval);
        setError('Connection lost: ' + err.message);
        setIsGenerating(false);
      }
    }, 3000);
  };

  const handleGenerate = async () => {
    if (!selectedTile || !roomImageFile) {
      setError('Please select a tile and upload a room image');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setShowResume(false);

    try {
      // Step 1: Upload room image to get URL
      const formData = new FormData();
      formData.append('image', roomImageFile);
      let uploadRes = await fetch(`${MAIN_API}/api/v1/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'ngrok-skip-browser-warning': '69420' },
      });
      if (!uploadRes.ok) {
        throw new Error('Upload endpoint failed or missing on backend: ' + uploadRes.status);
      }
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url || uploadData.file_url;

      // Step 2: Get tile image URL
      const filename = selectedTile.img_url || selectedTile.image || selectedTile.name;
      const tileImageUrl = filename?.startsWith('/') ? `${MAIN_API}${filename}` : `${MAIN_API}/static/tiles_images/${filename?.split('/').pop()}`;

      // Step 3: Call flux_service generate
      const genRes = await fetch(`${FLUX_API}/api/flux/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: promptText + ` Reference tile: ${tileImageUrl}`,
          room_type: selectedRoom,
          style: selectedStyle,
          strength: strength
        })
      });
      const genData = await genRes.json();

      if (genData.task_id) {
        startPolling(genData.task_id);
      } else {
        throw new Error(genData.detail || 'No task ID returned');
      }
    } catch (err) {
      setError('Generation failed: ' + err.message);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = "tile-visualization.png";
      a.click();
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
          <Eye size={24} className="text-brand-orange" /> Visualization
        </h1>
        <p className="text-sm text-slate-500 mt-1">AI-powered tile placement on room images</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT — Configuration */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="rounded-xl border border-surface-border bg-white p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-brand-navy flex items-center gap-2 mb-3">
                <ImageIcon size={18} className="text-brand-indigo" /> Source Images
              </h2>

              {/* Tile Selector */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-slate-700">Select Tile Source</label>
                {tiles.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    No tiles found. Connect backend to load tiles.
                  </p>
                ) : (
                  <select
                    onChange={handleTileSelect}
                    defaultValue="-1"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all"
                  >
                    <option value="-1" disabled>— Select a tile —</option>
                    {tiles.map((tile, idx) => (
                      <option key={tile.faiss_id || idx} value={idx}>
                        {tile.img_name || tile.name} {tile.texture ? `(${tile.texture})` : ''} {tile.size ? `[${tile.size}]` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {selectedTile && (
                  <div className="mt-2 rounded-xl border border-surface-border p-2 bg-slate-50 flex items-center gap-3">
                    <img src={getImageUrl(selectedTile.img_url || selectedTile.name)} alt="Tile Preview" className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{selectedTile.img_name || selectedTile.name}</p>
                      <p className="text-xs text-slate-500">{selectedTile.texture || 'Generic'} • {selectedTile.size || 'Auto'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Room Image */}
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all duration-300 group">
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFile} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload size={20} className="text-brand-indigo" />
                </div>
                <p className="text-sm font-semibold text-brand-navy">{roomImageFile ? roomImageFile.name : "Upload Room Image"}</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP</p>
              </label>
              {roomImagePreview && (
                <img src={roomImagePreview} alt="Room Preview" className="w-full max-h-36 object-contain rounded-xl border border-surface-border mt-3" />
              )}
            </div>

            <div className="h-px bg-surface-border" />

            {/* Prompt & Settings */}
            <div>
              <h2 className="text-base font-semibold text-brand-navy flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-brand-orange" /> Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Prompt</label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Room Type</label>
                    <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
                      <option value="living room">Living Room</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bedroom">Bedroom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Style</label>
                    <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
                      <option value="modern">Modern</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="classic">Classic</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">Strength</label>
                    <span className="text-sm font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-lg">{strength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.10" max="1.00" step="0.05"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-orange"
                    style={{ background: `linear-gradient(to right, #F97316 0%, #F97316 ${(strength - 0.1) / 0.9 * 100}%, #E2E8F0 ${(strength - 0.1) / 0.9 * 100}%, #E2E8F0 100%)` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTile || !roomImageFile}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Generating...</> : <><Sparkles size={20} /> Generate</>}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {showResume && currentTaskId && (
              <button
                onClick={() => {
                  setShowResume(false);
                  setIsGenerating(true);
                  startPolling(currentTaskId);
                }}
                className="w-full py-2.5 rounded-xl border-2 border-brand-indigo text-brand-indigo font-bold flex items-center justify-center gap-2 hover:bg-brand-indigo hover:text-white transition-all"
              >
                ⟳ Resume Polling
              </button>
            )}
          </div>
        </motion.div>

        {/* RIGHT — Results */}
        <motion.div variants={item} className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-surface-border bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-navy mb-4 flex items-center gap-2">
              <Eye size={20} className="text-brand-indigo" /> Results
            </h2>

            {!isGenerating && !generatedImage && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-surface-secondary/50">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-indigo/10 to-brand-orange/10 flex items-center justify-center mb-4">
                  <ImageIcon size={40} className="text-slate-400" strokeWidth={1} />
                </div>
                <p className="text-slate-500 font-medium">Your visualization will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Select tile + room image & click Generate</p>
              </div>
            )}

            {isGenerating && (
              <div className="py-20 flex flex-col items-center">
                <Loader2 size={48} className="animate-spin text-brand-orange mb-4" />
                <p className="font-semibold text-brand-navy">Processing your visualization...</p>
                <p className="text-sm text-slate-500 mt-1">This takes about 30-120 seconds.</p>
              </div>
            )}

            {generatedImage && !isGenerating && (
              <div className="space-y-4">
                <div className="rounded-xl border border-surface-border overflow-hidden bg-slate-100">
                  <ImageWithFallback src={generatedImage} alt="Generated Result" className="w-full h-auto object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <img src={roomImagePreview} alt="Original" className="w-full rounded-xl border border-surface-border" />
                    <p className="text-xs font-semibold text-slate-500 mt-2">Original</p>
                  </div>
                  <div>
                    <button onClick={handleDownload} className="w-full h-full flex items-center justify-center flex-col gap-2 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-light text-white font-bold hover:-translate-y-1 transition-all">
                      <Download size={24} />
                      Download Result
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
