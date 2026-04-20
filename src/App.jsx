import { useMemo, useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import Visualization from './pages/Visualization';
import AdminVisualization from './pages/admin/AdminVisualization';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUpload from './pages/admin/AdminUpload';
import AdminCatalogue from './pages/admin/AdminCatalogue';
import AdminLayout from './components/layout/AdminLayout';
import { ToastProvider, useToast } from './components/ui/Toast';
import {
  addBatchTiles,
  addSingleTile,
  addZipTiles,
  deleteCatalogueTile,
  detectTiles,
  findSimilarByCrop,
  getCatalogueTile,
  getCatalogueStats,
  searchCatalogueByName,
  updateCatalogueTile,
} from './api';

function AppInner() {
  const addToast = useToast();

  // Route state
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path === '/visualization') return 'visualization';
    if (path === '/search') return 'search';
    return 'landing';
  });

  const [adminTab, setAdminTab] = useState('admin-dashboard');

  // Search State
  const [sourceImage, setSourceImage] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Upload State
  const [addFile, setAddFile] = useState(null);
  const [addMode, setAddMode] = useState('single');
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchCsv, setBatchCsv] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [addForm, setAddForm] = useState({
    img_name: '', img_url: '', size: '', texture: '', color: '',
  });
  const [addingTile, setAddingTile] = useState(false);
  const [addResult, setAddResult] = useState('');

  // Catalogue/Manage State
  const [manageQuery, setManageQuery] = useState('');
  const [manageResults, setManageResults] = useState([]);
  const [managing, setManaging] = useState(false);
  const [editState, setEditState] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const canSearch = useMemo(() => Boolean(selectedCrop), [selectedCrop]);

  // Navigation handlers
  const navigateToSearch = () => {
    setCurrentRoute('search');
    window.history.pushState({}, '', '/search');
  };

  const navigateToVisualization = () => {
    setCurrentRoute('visualization');
    window.history.pushState({}, '', '/visualization');
  };

  const navigateToAdmin = (tab = 'admin-dashboard') => {
    setCurrentRoute('admin');
    setAdminTab(tab);
    window.history.pushState({}, '', '/admin');
  };

  const navigateToLanding = () => {
    setCurrentRoute('landing');
    window.history.pushState({}, '', '/');
  };

  const handleAdminTabChange = (tab) => {
    setAdminTab(tab);
  };

  // --- API Actions ---
  const loadStats = useCallback(async () => {
    try {
      const data = await getCatalogueStats();
      console.log("[loadStats] Success:", data);
      setStats(data.stats);
    } catch (err) {
      console.error("[loadStats] Error:", err.message);
      setError(`Failed to load stats: ${err.message}`);
    }
  }, []);

  async function onDetectSubmit(e) {
    e.preventDefault();
    if (!sourceImage) { setError('Pick an image first.'); return; }
    setError(''); setDetecting(true); setMatches([]); setSelectedCrop(null);
    try {
      const data = await detectTiles(sourceImage);
      setCrops(data.crops || []);
      if (!data.crops?.length) setError('No tiles detected in this image.');
    } catch (err) {
      setError(err.message || 'Detection failed.');
    } finally {
      setDetecting(false);
    }
  }

  async function onFindSimilar() {
    if (!selectedCrop) return;
    setSearching(true); setError('');
    try {
      const data = await findSimilarByCrop(selectedCrop.crop, 6);
      setMatches(data.results || []);
      addToast(`Found ${data.results?.length || 0} similar tiles`, 'success');
      await loadStats();
    } catch (err) {
      setError(err.message || 'Similarity search failed.');
    } finally {
      setSearching(false);
    }
  }

  async function onAddSingleTile(e) {
    e.preventDefault();
    if (!addFile) { setAddResult('Pick an image before uploading.'); return; }
    setAddingTile(true); setAddResult('');
    try {
      const res = await addSingleTile({ imageFile: addFile, ...addForm });
      setAddResult(`Added: ${res.tiles_added}, skipped: ${res.tiles_skipped_duplicates}, total: ${res.total_tiles_in_index}`);
      addToast('Tile uploaded successfully!', 'success');
      setAddFile(null);
      setAddForm({ img_name: '', img_url: '', size: '', texture: '', color: '' });
      await loadStats();
    } catch (err) {
      setAddResult(err.message || 'Upload failed.');
      addToast('Upload failed', 'error');
    } finally {
      setAddingTile(false);
    }
  }

  async function onAddBatchTiles(e) {
    e.preventDefault();
    if (!batchFiles.length || !batchCsv) { setAddResult('Select batch images and a CSV file.'); return; }
    setAddingTile(true); setAddResult('');
    try {
      const res = await addBatchTiles({ images: batchFiles, csvFile: batchCsv });
      setAddResult(`Added: ${res.tiles_added}, skipped: ${res.tiles_skipped_duplicates}, total: ${res.total_tiles_in_index}`);
      addToast('Batch upload complete!', 'success');
      setBatchFiles([]); setBatchCsv(null);
      await loadStats();
    } catch (err) {
      setAddResult(err.message || 'Batch upload failed.');
      addToast('Batch upload failed', 'error');
    } finally {
      setAddingTile(false);
    }
  }

  async function onAddZipTiles(e) {
    e.preventDefault();
    if (!zipFile) { setAddResult('Select a ZIP file first.'); return; }
    setAddingTile(true); setAddResult('');
    try {
      const res = await addZipTiles({ zipFile });
      setAddResult(`Added: ${res.tiles_added}, skipped: ${res.tiles_skipped_duplicates}, total: ${res.total_tiles_in_index}`);
      addToast('ZIP upload complete!', 'success');
      setZipFile(null);
      await loadStats();
    } catch (err) {
      setAddResult(err.message || 'ZIP upload failed.');
      addToast('ZIP upload failed', 'error');
    } finally {
      setAddingTile(false);
    }
  }

  async function onManageSearch(e) {
    if (e) e.preventDefault();
    if (!manageQuery.trim()) { setManageResults([]); return; }
    setManaging(true);
    try {
      const res = await searchCatalogueByName(manageQuery.trim(), 30);
      setManageResults(res.results || []);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setManaging(false);
    }
  }

  async function openEdit(faissId) {
    try {
      const tile = await getCatalogueTile(faissId);
      setEditState({
        faiss_id: faissId,
        img_name: tile.img_name || '',
        img_url: tile.img_url || '',
        size: tile.size || '',
        texture: tile.texture || '',
        color: tile.color || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load tile details.');
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editState) return;
    setEditSaving(true);
    try {
      await updateCatalogueTile(editState.faiss_id, {
        img_url: editState.img_url,
        size: editState.size,
        texture: editState.texture,
        color: editState.color,
      });
      addToast('Tile updated successfully', 'success');
      await onManageSearch();
      await loadStats();
      setEditState(null);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setEditSaving(false);
    }
  }

  async function onDeleteTile(faissId, name) {
    const ok = window.confirm(`Delete tile '${name}'? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteCatalogueTile(faissId);
      addToast('Tile deleted', 'info');
      await onManageSearch();
      await loadStats();
    } catch (err) {
      setError(err.message || 'Failed to delete tile.');
    }
  }

  const pageTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  };

  // Render content based on current route
  return (
    <AnimatePresence mode="wait">
      {/* Landing Page */}
      {currentRoute === 'landing' && (
        <motion.div key="landing" {...pageTransition}>
          <LandingPage onStartSearch={navigateToSearch} />
        </motion.div>
      )}

      {/* Public Search Page */}
      {currentRoute === 'search' && (
        <motion.div key="search" {...pageTransition} className="min-h-screen bg-white">
          <div className="fixed top-4 left-6 z-50">
            <button
              onClick={navigateToLanding}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              ← Back to Home
            </button>
          </div>
          <SearchPage
            sourceImage={sourceImage} setSourceImage={setSourceImage}
            detecting={detecting} onDetectSubmit={onDetectSubmit}
            crops={crops} selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop}
            searching={searching} onFindSimilar={onFindSimilar} canSearch={canSearch}
            matches={matches} error={error}
          />
        </motion.div>
      )}

      {/* Visualization Page */}
      {currentRoute === 'visualization' && (
        <motion.div key="visualization" {...pageTransition} className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
          <div className="fixed top-4 left-6 z-50">
            <button
              onClick={navigateToLanding}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              ← Back
            </button>
          </div>
          <div className="max-w-7xl mx-auto">
            <Visualization />
          </div>
        </motion.div>
      )}

      {/* Admin Panel */}
      {currentRoute === 'admin' && (
        <motion.div key="admin" {...pageTransition}>
          <AdminLayout activeTab={adminTab} onTabChange={handleAdminTabChange}>
            {adminTab === 'admin-dashboard' && (
              <AdminDashboard stats={stats} onLoadStats={loadStats} onTabChange={handleAdminTabChange} />
            )}

            {adminTab === 'admin-catalogue' && (
              <AdminCatalogue
                stats={stats}
                manageQuery={manageQuery} setManageQuery={setManageQuery}
                manageResults={manageResults} onManageSearch={onManageSearch} managing={managing}
                onDeleteTile={onDeleteTile} openEdit={openEdit}
                editState={editState} setEditState={setEditState} saveEdit={saveEdit} editSaving={editSaving}
                onLoadStats={loadStats}
              />
            )}

            {adminTab === 'admin-upload' && (
              <AdminUpload
                addFile={addFile} setAddFile={setAddFile}
                addForm={addForm} setAddForm={setAddForm}
                addMode={addMode} setAddMode={setAddMode}
                batchFiles={batchFiles} setBatchFiles={setBatchFiles}
                batchCsv={batchCsv} setBatchCsv={setBatchCsv}
                zipFile={zipFile} setZipFile={setZipFile}
                addingTile={addingTile} addResult={addResult}
                onAddSingleTile={onAddSingleTile} onAddBatchTiles={onAddBatchTiles} onAddZipTiles={onAddZipTiles}
              />
            )}
          </AdminLayout>
        </motion.div>
      )}

      {error && currentRoute !== 'search' && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
