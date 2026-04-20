// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette, Database } from 'lucide-react';

export default function AdminSettings() {
  const sections = [
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      items: ['Theme Mode', 'Accent Color', 'Font Size'],
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure alerts and notification preferences',
      items: ['Email Alerts', 'Push Notifications', 'Detection Alerts'],
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'FAISS index and catalogue settings',
      items: ['Index Backup', 'Export Data', 'Clear Cache'],
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'API keys and access control',
      items: ['API Key Management', 'Access Logs', 'Session Settings'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
          <SettingsIcon size={24} className="text-brand-orange" /> Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your TileDetect AI preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-xl border border-surface-border bg-white p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange/20 transition-colors">
                  <Icon size={20} className="text-brand-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-navy">{section.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                  <div className="mt-3 space-y-1.5">
                    {section.items.map((itm) => (
                      <div key={itm} className="flex items-center justify-between py-1.5 border-b border-surface-border last:border-0">
                        <span className="text-sm text-slate-600">{itm}</span>
                        <span className="text-xs text-slate-400">Configure →</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-gradient-to-r from-brand-navy to-brand-navy-light p-6 text-white">
        <h3 className="font-bold text-lg">TileDetect AI v2.0</h3>
        <p className="text-sm text-slate-300 mt-1">Built by Netsmartz — Enterprise-grade tile detection platform</p>
        <div className="flex gap-4 mt-3 text-xs text-slate-400">
          <span>React + Vite</span>
          <span>•</span>
          <span>FastAPI Backend</span>
          <span>•</span>
          <span>FAISS Index</span>
        </div>
      </div>
    </motion.div>
  );
}
