
import React from 'react';
import { LayoutDashboard, Activity, FileText, Brain, Settings, LogOut, HeartPulse, Pill, Users, X, Sun, Moon, Zap } from 'lucide-react';
import { AppRoute } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  onClose?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onLogout, onClose, isDarkMode, toggleDarkMode }) => {
  const navItems = [
    { route: AppRoute.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { route: AppRoute.TIMELINE, icon: Activity, label: 'Timeline' },
    { route: AppRoute.QUICK_HELP, icon: Zap, label: 'Quick Help' },
    { route: AppRoute.UPLOAD, icon: FileText, label: 'Lab Reports' },
    { route: AppRoute.INSIGHTS, icon: Brain, label: 'AI Insights' },
    { route: AppRoute.MEDICATIONS, icon: Pill, label: 'Medications' },
    { route: AppRoute.FAMILY, icon: Users, label: 'Family Health' },
    { route: AppRoute.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">MedSync</span>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentRoute === item.route
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentRoute === item.route ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
        {toggleDarkMode && (
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
