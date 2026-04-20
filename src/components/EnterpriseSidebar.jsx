import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Search, Upload, BookOpen, Eye, Settings,
  ChevronLeft, ChevronRight, User2,
} from 'lucide-react';
import { MAIN_API } from '../config/api';
import netsmartsLogo from '../assets/netsmartz_logo.jpg';

export default function EnterpriseSidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => [
    { label: 'Search & Match', icon: Search, tab: 'search' },
    { label: 'Upload Tile', icon: Upload, tab: 'add' },
    { label: 'Catalogue', icon: BookOpen, tab: 'catalogue' },
    { label: 'Visualization', icon: Eye, tab: 'visualizer' },
    { label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
    { label: 'Settings', icon: Settings, tab: 'settings' },

  ], []);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-brand-navy flex flex-col z-50 transition-all duration-300 ease-in-out shadow-sidebar ${collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
    >
      {/* Logo Section */}
      <div className="sidebar__logoWrap" title="Netsmartz">
        <div className="sidebar__logoFrame">
          <img src={netsmartsLogo} alt="Netsmarts Logo" className="sidebar__logoImg" />
          {/* <img className="sidebar__logoImg" src="../assets/netsmartz_logo.jpg" alt="Netsmartz Logo" /> */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const active = activeTab === item.tab;
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                ? 'bg-brand-orange/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                } ${collapsed ? 'justify-center' : ''}`}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-brand-orange" />
              )}
              <Icon size={20} className={`flex-shrink-0 ${active ? 'text-brand-orange' : 'group-hover:text-white'}`} />
              {!collapsed && (
                <span className={`text-sm font-medium truncate animate-fade-in ${active ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — User + Collapse */}
      <div className="px-3 pb-4 space-y-2 flex-shrink-0 border-t border-white/[0.08] pt-3">
        {/* User */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-brand-navy-lighter flex items-center justify-center flex-shrink-0">
            <User2 size={16} className="text-slate-400" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="text-white text-xs font-medium truncate">Admin</p>
              <p className="text-slate-500 text-[10px] truncate">Logged in</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs font-semibold">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
