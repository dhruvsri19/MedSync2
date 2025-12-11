
import React, { useState } from 'react';
import { Heart, Activity, Moon, Flame, ArrowUpRight, ArrowDownRight, X, BarChart as BarChartIcon } from 'lucide-react';
import { AppRoute, HealthMetric } from '../types';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  metrics: HealthMetric[];
  onNavigate: (route: any, action?: string) => void;
  isDarkMode?: boolean;
  userName?: string;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
  onClick: () => void;
}> = ({ title, value, unit, icon: Icon, trend, trendUp, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-xl hover:-translate-y-1 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-slate-500 dark:text-slate-500 text-sm">{unit}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ metrics, onNavigate, isDarkMode = true, userName = "Alex" }) => {
  const latestHeartRate = metrics.filter(m => m.type === 'heart_rate').pop();
  const latestSteps = metrics.filter(m => m.type === 'steps').pop();
  
  // Calculate average sleep (mock logic)
  const avgSleep = "7h 12m";
  const calories = "2,150";

  // Modal State
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Helper to generate chart configuration based on card type
  const getChartConfig = (type: string | null) => {
    if (!type) return { data: [], color: '#ccc', formatter: (v: number) => `${v}`, unitLabel: '' };

    // Generate last 7 days labels
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    let data: any[] = [];
    let color = '';
    let formatter = (value: number) => `${value}`;
    let unitLabel = '';

    if (type === 'Heart Rate') {
      color = '#f43f5e'; // rose-500
      // Get real mock data from metrics (last 7)
      const hrMetrics = metrics.filter(m => m.type === 'heart_rate').slice(-7);
      data = last7Days.map((day, i) => {
        const metric = hrMetrics[hrMetrics.length - 7 + i];
        return {
          name: day,
          value: metric ? metric.value : 60 + Math.floor(Math.random() * 20)
        };
      });
      formatter = (val) => `${val}`;
      unitLabel = 'bpm';

    } else if (type === 'Steps') {
      color = '#10b981'; // emerald-500
      const stepMetrics = metrics.filter(m => m.type === 'steps').slice(-7);
      data = last7Days.map((day, i) => {
        const metric = stepMetrics[stepMetrics.length - 7 + i];
        return {
          name: day,
          value: metric ? metric.value : 5000 + Math.floor(Math.random() * 5000)
        };
      });
      formatter = (val) => `${val.toLocaleString()}`;
      unitLabel = 'steps';

    } else if (type === 'Sleep') {
      color = '#6366f1'; // indigo-500
      // Mock data for sleep
      data = last7Days.map(day => ({
        name: day,
        value: 5 + Math.random() * 4 // Random between 5 and 9 hours
      }));
      formatter = (val) => {
        const hours = Math.floor(val);
        const mins = Math.round((val - hours) * 60);
        return `${hours}h ${mins}m`;
      };
      unitLabel = '';

    } else if (type === 'Calories') {
      color = '#f97316'; // orange-500
      // Mock data for calories
      data = last7Days.map(day => ({
        name: day,
        value: 1800 + Math.floor(Math.random() * 800)
      }));
      formatter = (val) => `${val.toLocaleString()}`;
      unitLabel = 'kcal';
    }

    return { data, color, formatter, unitLabel };
  };

  const { data: chartData, color: chartColor, formatter: chartFormatter, unitLabel: chartUnit } = getChartConfig(expandedCard);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
          <p className="text-slate-900 dark:text-white font-bold text-lg">
            {chartFormatter(payload[0].value)} {chartUnit && chartUnit}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartAxisColor = isDarkMode ? "#94a3b8" : "#64748b";
  const chartGridColor = isDarkMode ? "#334155" : "#e2e8f0";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{getGreeting()}, {firstName}</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's your daily health summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Heart Rate"
          value={latestHeartRate?.value.toString() || "--"}
          unit="bpm"
          icon={Heart}
          color="text-rose-500"
          trend="2% vs last week"
          trendUp={false}
          onClick={() => setExpandedCard('Heart Rate')}
        />
        <StatCard
          title="Steps Today"
          value={latestSteps?.value.toLocaleString() || "--"}
          unit="steps"
          icon={Activity}
          color="text-emerald-500"
          trend="12% vs last week"
          trendUp={true}
           onClick={() => setExpandedCard('Steps')}
        />
        <StatCard
          title="Sleep Duration"
          value={avgSleep}
          unit="last night"
          icon={Moon}
          color="text-indigo-500"
          trend="30m vs avg"
          trendUp={true}
           onClick={() => setExpandedCard('Sleep')}
        />
        <StatCard
          title="Calories Burned"
          value={calories}
          unit="kcal"
          icon={Flame}
          color="text-orange-500"
           onClick={() => setExpandedCard('Calories')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
            <button 
              onClick={() => onNavigate(AppRoute.TIMELINE)}
              className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-500 dark:hover:text-primary-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div 
              onClick={() => onNavigate(AppRoute.TIMELINE)}
              className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Elevated Resting Heart Rate</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your average RHR was 72 bpm yesterday, 5 bpm higher than your monthly average.</p>
              </div>
            </div>
            <div 
              onClick={() => onNavigate(AppRoute.TIMELINE)}
              className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Lab Report Analyzed</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your recent blood work from Jan 15 has been processed. Everything looks normal.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-900 to-slate-900 dark:from-primary-900 dark:to-slate-900 border border-primary-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-lg font-semibold text-white mb-2 relative z-10">AI Health Assessment</h3>
           <p className="text-slate-300 text-sm mb-6 relative z-10">
             Based on your recent wearable data and lab reports, your overall wellness score is stable. 
             Focus on maintaining consistent sleep schedules to optimize recovery.
           </p>
           <button 
            onClick={() => onNavigate(AppRoute.INSIGHTS, 'summarize')}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors relative z-10 flex items-center gap-2 shadow-lg shadow-primary-900/50"
           >
             View Detailed Report
             <ArrowUpRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Expanded Card Modal */}
      {expandedCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                 <BarChartIcon className="w-6 h-6 text-primary-500" />
                 {expandedCard} History
               </h2>
               <button onClick={() => setExpandedCard(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6">
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Detailed weekly analysis for your {expandedCard.toLowerCase()}.
              </p>
              
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke={chartAxisColor} 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={chartAxisColor} 
                      fontSize={12}
                      tickFormatter={expandedCard === 'Sleep' ? (v) => `${Math.floor(v)}h` : (v) => `${v}`}
                    />
                    <Tooltip 
                      cursor={{fill: isDarkMode ? '#334155' : '#e2e8f0', opacity: 0.2}}
                      content={<CustomTooltip />}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={chartColor} 
                      radius={[4, 4, 0, 0]} 
                      barSize={40} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setExpandedCard(null)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
