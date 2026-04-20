import { useState } from 'react';
import { Search, Bell, User, ChevronRight, Home } from 'lucide-react';
import EnterpriseSidebar from './EnterpriseSidebar';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  search: 'Search & Match',
  add: 'Upload Tile',
  catalogue: 'Catalogue',
  visualizer: 'Visualization',
  settings: 'Settings',
};

function TopNavbar({ activeTab }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-surface-border flex items-center justify-between px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
        <Home size={14} className="flex-shrink-0 text-slate-400" />
        <ChevronRight size={12} className="flex-shrink-0 text-slate-300" />
        <span className="font-medium text-brand-navy truncate">
          {TAB_LABELS[activeTab] || 'Dashboard'}
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tiles, textures..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-border bg-surface-secondary text-sm focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="relative w-9 h-9 rounded-xl bg-surface-secondary border border-surface-border flex items-center justify-center text-slate-500 hover:text-brand-navy hover:bg-surface-tertiary transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-orange text-white text-[9px] font-bold flex items-center justify-center">3</span>
        </button>
        <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-white">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}

export default function EnterpriseLayout({ activeTab, onTabChange, children }) {
  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <EnterpriseSidebar activeTab={activeTab} onTabChange={onTabChange} />
      {/* Main area — shifts with sidebar */}
      <div className="flex-1 ml-[260px] flex flex-col transition-all duration-300">
        <TopNavbar activeTab={activeTab} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
