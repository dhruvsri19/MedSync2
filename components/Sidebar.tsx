import React from 'react';
import { LayoutDashboard, Activity, FileText, Brain, Settings, LogOut, HeartPulse, Pill, Users } from 'lucide-react';
import { AppRoute } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onLogout }) => {
  const navItems = [
    { route: AppRoute.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { route: AppRoute.TIMELINE, icon: Activity, label: 'Timeline' },
    { route: AppRoute.UPLOAD, icon: FileText, label: 'Lab Reports' },
    { route: AppRoute.INSIGHTS, icon: Brain, label: 'AI Insights' },
    { route: AppRoute.MEDICATIONS, icon: Pill, label: 'Medications' },
    { route: AppRoute.FAMILY, icon: Users, label: 'Family Health' },
    { route: AppRoute.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary-600 p-2 rounded-xl">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MedSync</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentRoute === item.route
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentRoute === item.route ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};