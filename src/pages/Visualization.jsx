import { useState, useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Sparkles, Upload, Image as ImageIcon, SlidersHorizontal,
  Download, Play, Eye, Loader2, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, XCircle, Wifi, WifiOff
} from "lucide-react";
import { MAIN_API } from "../config/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

// Polling config
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 600000; // 10 minutes max (increased from 5 min)

export default function Visualization() {
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
  const [error, setError] = useState(null);
  const [pollProgress, setPollProgress] = useState(0); // 0–100
  const [statusMessage, setStatusMessage] = useState('');

  // Refs for cleanup
  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const [tileLoadError, setTileLoadError] = useState(null);
  const [recommendedTilesUsed, setRecommendedTilesUsed] = useState(false);

  // Load tiles from catalogue OR use recommended tiles from search
  useEffect(() => {
    const fetchTiles = async () => {
      try {
        // Check if we have recommended tiles from a previous search
        const recommendedTilesJson = sessionStorage.getItem('recommendedTiles');
        const selectedTileJson = sessionStorage.getItem('selectedVisualizationTile');

        if (recommendedTilesJson) {
          try {
            const recommendedTiles = JSON.parse(recommendedTilesJson);
            if (Array.isArray(recommendedTiles) && recommendedTiles.length > 0) {
              console.log(`✓ Loaded ${recommendedTiles.length} recommended tiles from search results`);
              setTiles(recommendedTiles);
              setRecommendedTilesUsed(true);
              setTileLoadError(null);

              // Auto-select the first tile if available
              if (recommendedTiles.length > 0 && selectedTileJson) {
                try {
                  const selectedTile = JSON.parse(selectedTileJson);
                  setSelectedTile(selectedTile);
                } catch (e) {
                  console.log("Could not auto-select tile");
                }
              }

              return;
            }
          } catch (e) {
            console.log("Could not parse recommended tiles, falling back to catalogue");
          }
        }

        // Fall back to loading ALL tiles from catalogue
        console.log("No recommended tiles found, loading from catalogue...");
        setRecommendedTilesUsed(false);

        // Try fetching from catalogue first
        let res = await fetch(`${MAIN_API}/api/v1/catalogue/search?q=*&limit=50`, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setTiles(data.results);
            setTileLoadError(null);
            return;
          }
        }
        // Fall back to blank query
        res = await fetch(`${MAIN_API}/api/v1/catalogue/search?q=&limit=50`, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setTiles(data.results);
            setTileLoadError(null);
            return;
          }
        }

        // Catalogue is empty — try loading from static/tiles_images directory
        console.log("Catalogue empty, trying static tiles directory fallback...");
        const fallbackRes = await fetch(`${MAIN_API}/api/v1/tiles/available`, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.tiles && fallbackData.tiles.length > 0) {
            console.log(`Loaded ${fallbackData.tiles.length} tiles from static directory`);
            setTiles(fallbackData.tiles);
            setTileLoadError(null);
            return;
          }
        }

        // No tiles found anywhere
        setTileLoadError('No tiles found. Add tiles first via the Upload page or populate the catalogue.');
        setTiles([]);

      } catch (err) {
        console.error("Failed to load tiles:", err);
        setTileLoadError(`Cannot reach backend at ${MAIN_API} — ${err.message}`);
        setTiles([]);
      }
    };
    fetchTiles();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImageFile(file);
      setRoomImagePreview(URL.createObjectURL(file));
      setGeneratedImage(null);
      setError(null);
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

  // ─── Polling Logic ───────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const startPolling = useCallback((taskId) => {
    // Clear any existing polling
    stopPolling();

    setCurrentTaskId(taskId);
    setStatusMessage('Waiting for AI to process your image...');
    setPollProgress(5);

    const startTime = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set an absolute timeout
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsGenerating(false);
      setError(`Generation timed out after ${POLL_TIMEOUT_MS / 1000}s. The task may still be processing on the server. You can try "Resume Polling" below.`);
      setStatusMessage('');
    }, POLL_TIMEOUT_MS);

    // Poll at intervals
    pollIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, Math.round((elapsed / POLL_TIMEOUT_MS) * 100));
      setPollProgress(progress);

      try {
        const res = await fetch(`${MAIN_API}/api/v1/visualize/status/${taskId}`, {
          signal: controller.signal,
          headers: { 'ngrok-skip-browser-warning': '69420' },
        });

        if (!res.ok) {
          console.warn(`[poll] Status endpoint returned HTTP ${res.status}`);
          setStatusMessage(`Polling... (server returned ${res.status}, retrying)`);
          return; // Keep polling — transient error
        }

        const data = await res.json();

        // Log full response so we can debug field names
        console.log("[Flux poll] Full kie.ai task response:", JSON.stringify(data, null, 2));

        if (data.status === 'completed') {
          stopPolling();
          setPollProgress(100);

          // Extract the image URL — try multiple field paths
          const imageUrl =
            data.image_url ||
            data.output_image_url ||
            data.output_url ||
            data.outputUrl ||
            data.imageUrl ||
            data.result?.image ||
            data.result?.url ||
            data.result?.imageUrl ||
            data.raw_response?.outputUrl ||
            data.raw_response?.imageUrl ||
            data.raw_response?.output_url ||
            data.raw_response?.output ||
            null;

          console.log("[Flux poll] Extracted image URL:", imageUrl);

          if (imageUrl) {
            setGeneratedImage(imageUrl);
            setStatusMessage('');
          } else {
            console.error("[Flux poll] Completed but no image URL found. Full data:", data);
            setError(
              'Generation completed but no output image was returned. ' +
              'Check the browser console for the full API response.'
            );
            setStatusMessage('');
          }
          setIsGenerating(false);
          return;
        }

        if (data.status === 'failed') {
          stopPolling();
          setError('Generation failed: ' + (data.error || 'Unknown error from kie.ai'));
          setIsGenerating(false);
          setStatusMessage('');
          return;
        }

        // Still processing
        const secs = Math.round(elapsed / 1000);
        setStatusMessage(`AI is generating your visualization... (${secs}s elapsed)`);

      } catch (err) {
        if (err.name === 'AbortError') return; // Expected during cleanup
        console.error("[Flux poll] Error:", err);
        // Don't stop polling on transient network errors — just log
        setStatusMessage(`Network hiccup — retrying... (${err.message})`);
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  // ─── Generate Handler ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selectedTile || !roomImageFile) {
      setError('Please select a tile and upload a room image');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setPollProgress(0);
    setStatusMessage('Uploading room image...');

    try {
      // Step 1 — Upload room image to backend
      const formData = new FormData();
      formData.append('image', roomImageFile);

      const uploadRes = await fetch(`${MAIN_API}/api/v1/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'ngrok-skip-browser-warning': '69420' },
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(
          errData.detail ||
          `Image upload failed (HTTP ${uploadRes.status}). ` +
          `Make sure the backend is running at ${MAIN_API}.`
        );
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url || uploadData.file_url;
      console.log("[generate] Uploaded image URL:", imageUrl);

      if (!imageUrl) {
        throw new Error('Upload succeeded but no URL was returned.');
      }

      // Step 2 — Build the tile reference URL
      const filename = selectedTile.img_url || selectedTile.image || selectedTile.name;
      const tileImageUrl = filename?.startsWith('http')
        ? filename
        : filename?.startsWith('/')
          ? `${MAIN_API}${filename}`
          : `${MAIN_API}/static/tiles_images/${filename?.split('/').pop()}`;

      // Step 3 — Submit generation request to backend → kie.ai
      setStatusMessage('Submitting generation request to Flux AI...');
      const genRes = await fetch(`${MAIN_API}/api/v1/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'ngrok-skip-browser-warning': '69420',
        },
        body: new URLSearchParams({
          room_image_url: imageUrl,
          tile_image_url: tileImageUrl,
          prompt: promptText,
          room_type: selectedRoom,
          style: selectedStyle,
          strength: strength,
        }).toString(),
      });

      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}));
        throw new Error(
          errData.detail ||
          `Generation request failed (HTTP ${genRes.status}).`
        );
      }

      const genData = await genRes.json();
      console.log("[generate] kie.ai task response:", genData);

      if (genData.task_id) {
        startPolling(genData.task_id);
      } else {
        throw new Error(genData.detail || 'No task ID returned from Flux API.');
      }

    } catch (err) {
      console.error("[generate] Error:", err);
      setError('Generation failed: ' + err.message);
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleResumePoll = () => {
    if (currentTaskId) {
      setError(null);
      setIsGenerating(true);
      startPolling(currentTaskId);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.target = "_blank";
      a.download = "tile-visualization.png";
      a.click();
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {recommendedTilesUsed && (
            <button
              onClick={() => window.location.href = '/search'}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
            >
              ← Back to Search
            </button>
          )}
          <h2 className="text-sm font-bold text-brand-navy flex-1 text-center">Visualization</h2>
          <div className="w-[120px]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
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
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">Select Tile Source</label>
                  {recommendedTilesUsed && tiles.length > 0 && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                      ✓ Recommended Results ({tiles.length})
                    </span>
                  )}
                </div>
                {tiles.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    {tileLoadError || 'No tiles found. Ensure the backend is running and the catalogue has tiles.'}
                  </p>
                ) : (
                  <select
                    onChange={handleTileSelect}
                    defaultValue={selectedTile ? tiles.findIndex(t => t.faiss_id === selectedTile.faiss_id || t.img_name === selectedTile.img_name) : "-1"}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all"
                  >
                    <option value="-1" disabled>— Select a tile —</option>
                    {tiles.map((tile, idx) => (
                      <option key={tile.faiss_id || idx} value={idx}>
                        {tile.img_name || tile.name} {tile.texture ? `(${tile.texture})` : ''} {tile.size ? `[${tile.size}]` : ''} {recommendedTilesUsed ? `• Score: ${(tile.score * 100).toFixed(0)}%` : ''}
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
                    onChange={e => setPromptText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Room Type</label>
                    <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
                      <option value="living room">Living Room</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bedroom">Bedroom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Style</label>
                    <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm bg-white">
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
                    onChange={e => setStrength(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-orange"
                    style={{ background: `linear-gradient(to right, #F97316 0%, #F97316 ${(strength - 0.1) / 0.9 * 100}%, #E2E8F0 ${(strength - 0.1) / 0.9 * 100}%, #E2E8F0 100%)` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTile || !roomImageFile}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-orange to-brand-orange-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-orange/25 transition-all"
            >
              {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Generating...</> : <><Sparkles size={20} /> Generate</>}
            </button>

            {/* Go back to search button (if using recommended tiles) */}
            {recommendedTilesUsed && (
              <button
                onClick={() => window.location.href = '/search'}
                className="w-full py-2.5 rounded-xl font-semibold text-brand-indigo bg-brand-indigo/10 hover:bg-brand-indigo/20 flex items-center justify-center gap-2 transition-all text-sm"
              >
                ← Try Different Tiles
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                  {currentTaskId && !isGenerating && (
                    <button
                      onClick={handleResumePoll}
                      className="mt-2 text-xs font-bold text-brand-indigo hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Resume Polling (task: {currentTaskId.slice(0, 8)}…)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT — Results */}
        <motion.div variants={item} className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-surface-border bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-navy mb-4 flex items-center gap-2">
              <Eye size={20} className="text-brand-indigo" /> Results
            </h2>

            {/* Empty state */}
            {!isGenerating && !generatedImage && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-surface-secondary/50">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-indigo/10 to-brand-orange/10 flex items-center justify-center mb-4">
                  <ImageIcon size={40} className="text-slate-400" strokeWidth={1} />
                </div>
                <p className="text-slate-500 font-medium">Your visualization will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Select tile + room image & click Generate</p>
              </div>
            )}

            {/* Loading / Polling state */}
            {isGenerating && (
              <div className="py-16 flex flex-col items-center">
                {/* Animated spinner */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-200" />
                  <div
                    className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-orange animate-spin"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={24} className="text-brand-orange" />
                  </div>
                </div>

                <p className="font-semibold text-brand-navy text-center">Processing your visualization...</p>
                <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">{statusMessage}</p>

                {/* Progress bar */}
                <div className="w-full max-w-xs mt-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-orange to-brand-orange-light rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pollProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 text-center">{pollProgress}% — This typically takes 30–300 seconds</p>
                </div>

                {currentTaskId && (
                  <p className="text-xs text-slate-400 mt-3 font-mono">
                    Task: {currentTaskId}
                  </p>
                )}
              </div>
            )}

            {/* Result image */}
            {generatedImage && !isGenerating && (
              <div className="space-y-4">
                <div className="rounded-xl border border-surface-border overflow-hidden bg-slate-100 relative group">
                  <img
                    src={generatedImage}
                    alt="Generated Visualization"
                    className="w-full h-auto object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("[result] Image failed to load:", generatedImage);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-16 text-slate-500">
                          <p class="font-medium">Image could not be loaded</p>
                          <a href="${generatedImage}" target="_blank" rel="noopener" class="text-sm text-blue-500 underline mt-2">Open image URL directly</a>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={generatedImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-slate-700 shadow hover:bg-white transition-colors"
                    >
                      <Eye size={12} /> Open Full Size
                    </a>
                  </div>
                </div>

                {/* Success badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Visualization generated successfully!</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    {roomImagePreview && (
                      <>
                        <img src={roomImagePreview} alt="Original" className="w-full rounded-xl border border-surface-border" />
                        <p className="text-xs font-semibold text-slate-500 mt-2">Original</p>
                      </>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={handleDownload}
                      className="w-full h-full min-h-[80px] flex items-center justify-center flex-col gap-2 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-light text-white font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-orange/25 transition-all"
                    >
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
      </div>
    </>
  );
}
