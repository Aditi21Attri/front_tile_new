import { useState } from 'react';
import { LayoutDashboard, Upload, BookOpen, ChevronLeft, ChevronRight, User2, LogOut } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import { MAIN_API } from '../../config/api';
import netsmartsLogo from '../../assets/netsmartz_logo.jpg';

const TAB_LABELS = {
  'admin-dashboard': 'Dashboard',
  'admin-catalogue': 'Catalogue',
  'admin-upload': 'Upload Tile',
};

const ADMIN_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, tab: 'admin-dashboard' },
  { label: 'Catalogue', icon: BookOpen, tab: 'admin-catalogue' },
  { label: 'Upload Tile', icon: Upload, tab: 'admin-upload' },
];

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-orange-200 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-sm ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center px-3 border-b border-orange-100">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : 'w-full'}`}>
            <img src={netsmartsLogo} alt="Netsmartz Logo" className={`${collapsed ? 'h-8 w-8' : 'h-8 w-auto'} object-contain flex-shrink-0`} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {ADMIN_ITEMS.map((item) => {
            const active = activeTab === item.tab;
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  active ? 'bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-brand-orange" />
                )}
                <Icon size={20} className={`flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-brand-orange'}`} />
                {!collapsed && (
                  <span className={`text-sm font-medium truncate ${active ? 'text-white' : ''}`}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-2 flex-shrink-0 border-t border-orange-100 pt-3">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 flex items-center justify-center flex-shrink-0">
              <User2 size={16} className="text-brand-orange" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-slate-900 text-xs font-medium truncate">Admin</p>
                <p className="text-slate-500 text-[10px] truncate">Logged in</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            {collapsed ? <LogOut size={16} /> : <>
              <LogOut size={16} />
              <span className="text-xs font-semibold">Logout</span>
            </>}
          </button>

          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 text-slate-600 hover:text-brand-orange hover:bg-orange-50 transition-all duration-200"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs font-semibold">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col transition-all duration-300" style={{ marginLeft: collapsed ? 72 : 260 }}>
        <AdminNavbar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
