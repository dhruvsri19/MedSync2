

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HealthMetric } from '../types';
import { format, parseISO } from 'date-fns';
import { MOCK_INSIGHTS } from '../services/mockData';
import { AlertCircle, CheckCircle, Info, ChevronDown } from 'lucide-react';

interface TimelineProps {
  metrics: HealthMetric[];
  isDarkMode?: boolean;
}

type TimeRange = 'Past 30 Days' | 'Past 6 Months' | 'Past Year' | 'All Time';

export const Timeline: React.FC<TimelineProps> = ({ metrics, isDarkMode = true }) => {
  const [hrRange, setHrRange] = useState<TimeRange>('Past 30 Days');
  const [stepsRange, setStepsRange] = useState<TimeRange>('Past 30 Days');

  const filterMetrics = (data: HealthMetric[], range: TimeRange) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'Past 30 Days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'Past 6 Months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'Past Year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'All Time':
        startDate = new Date(0); // Beginning of time
        break;
    }

    return data.filter(m => new Date(m.timestamp) >= startDate);
  };

  const getFilteredData = (type: 'heart_rate' | 'steps', range: TimeRange) => {
    const typeMetrics = metrics.filter(m => m.type === type);
    const filtered = filterMetrics(typeMetrics, range);
    
    return filtered
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({
        date: format(parseISO(m.timestamp), 'MMM d'),
        fullDate: m.timestamp,
        value: m.value
      }));
  };

  const heartData = getFilteredData('heart_rate', hrRange);
  const stepsData = getFilteredData('steps', stepsRange);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert': return AlertCircle;
      case 'warning': return Info;
      default: return CheckCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert': return 'text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900';
      case 'warning': return 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900';
      default: return 'text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900';
    }
  };

  const chartAxisColor = isDarkMode ? "#94a3b8" : "#64748b";
  const chartGridColor = isDarkMode ? "#334155" : "#e2e8f0";

  const renderDropdown = (value: TimeRange, onChange: (val: TimeRange) => void) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeRange)}
        className="appearance-none bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option value="Past 30 Days">Past 30 Days</option>
        <option value="Past 6 Months">Past 6 Months</option>
        <option value="Past Year">Past Year</option>
        <option value="All Time">All Time</option>
      </select>
      <ChevronDown className="w-4 h-4 text-primary-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Health Timeline</h1>
        <p className="text-slate-500 dark:text-slate-400">Track your vital signs and alerts over time.</p>
      </div>

      {/* Alerts Section */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Alerts</h3>
        <div className="space-y-4">
          {MOCK_INSIGHTS.length > 0 ? MOCK_INSIGHTS.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);
            const colorClass = getSeverityColor(alert.severity);
            return (
              <div key={alert.id} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-4">
                <div className={`p-2 rounded-lg h-fit border ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{alert.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          }) : (
             <div className="text-slate-500 text-sm text-center py-4">No recent alerts.</div>
          )}
        </div>
      </div>

      {/* Heart Rate Chart */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Heart Rate History (bpm)</h3>
          <div className="flex gap-2">
            {renderDropdown(hrRange, setHrRange)}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heartData}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke={chartAxisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                  color: isDarkMode ? '#fff' : '#0f172a' 
                }}
                itemStyle={{ color: '#f43f5e' }}
                labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                        return new Date(payload[0].payload.fullDate).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        });
                    }
                    return label;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#f43f5e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHr)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps Chart */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Steps</h3>
          <div className="flex gap-2">
            {renderDropdown(stepsRange, setStepsRange)}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stepsData}>
               <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke={chartAxisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                  color: isDarkMode ? '#fff' : '#0f172a' 
                }}
                itemStyle={{ color: '#10b981' }}
                labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                        return new Date(payload[0].payload.fullDate).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        });
                    }
                    return label;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="url(#colorSteps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
