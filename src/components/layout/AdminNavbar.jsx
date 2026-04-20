import { Bell, User, ChevronRight, Home } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ activeTab, onTabChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  const handleHomeClick = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  const handleSettingsClick = () => {
    // Navigate to settings page
    setShowUserMenu(false);
    onTabChange('admin-settings');
  };

  const TAB_LABELS = {
    'admin-dashboard': 'Dashboard',
    'admin-catalogue': 'Catalogue',
    'admin-upload': 'Upload Tile',
    'admin-settings': 'Settings',
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-surface-border flex items-center justify-between px-6 gap-4 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
        <button
          onClick={handleHomeClick}
          className="flex-shrink-0 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
          title="Go to Home"
        >
          <Home size={14} />
        </button>
        <ChevronRight size={12} className="flex-shrink-0 text-slate-300" />
        <span className="font-medium text-brand-navy truncate">
          Admin / {TAB_LABELS[activeTab] || 'Dashboard'}
        </span>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-bold">ADMIN</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-white hover:shadow-glow-orange transition-all"
          >
            <User size={18} />
          </button>
          {showUserMenu && (
            <div className="absolute -right-2 top-12 w-48 bg-white border border-surface-border rounded-xl shadow-lg p-3 space-y-2">
              <div className="px-3 py-2 text-sm">
                <p className="font-semibold text-brand-navy">Admin User</p>
                <p className="text-xs text-slate-500">admin@tiles.local</p>
              </div>
              <hr className="my-2 border-surface-border" />
              <button
                onClick={handleSettingsClick}
                className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


