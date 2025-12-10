import React from 'react';
import { Heart, Activity, Moon, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { HealthMetric } from '../types';

interface DashboardProps {
  metrics: HealthMetric[];
  onNavigate: (route: any) => void;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
}> = ({ title, value, unit, icon: Icon, trend, trendUp, color }) => (
  <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-slate-500 text-sm">{unit}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  const latestHeartRate = metrics.filter(m => m.type === 'heart_rate').pop();
  const latestSteps = metrics.filter(m => m.type === 'steps').pop();
  
  // Calculate average sleep (mock logic as mock data only has HR and Steps)
  const avgSleep = "7h 12m";
  const calories = "2,150";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Good Morning, Alex</h1>
        <p className="text-slate-400">Here's your daily health summary.</p>
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
        />
        <StatCard
          title="Steps Today"
          value={latestSteps?.value.toLocaleString() || "--"}
          unit="steps"
          icon={Activity}
          color="text-emerald-500"
          trend="12% vs last week"
          trendUp={true}
        />
        <StatCard
          title="Sleep Duration"
          value={avgSleep}
          unit="last night"
          icon={Moon}
          color="text-indigo-500"
          trend="30m vs avg"
          trendUp={true}
        />
        <StatCard
          title="Calories Burned"
          value={calories}
          unit="kcal"
          icon={Flame}
          color="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            <button className="text-primary-500 text-sm font-medium hover:text-primary-400">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-4 bg-slate-700/50 rounded-xl border border-slate-700">
              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">Elevated Resting Heart Rate</h4>
                <p className="text-slate-400 text-sm mt-1">Your average RHR was 72 bpm yesterday, 5 bpm higher than your monthly average.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 bg-slate-700/50 rounded-xl border border-slate-700">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">Lab Report Analyzed</h4>
                <p className="text-slate-400 text-sm mt-1">Your recent blood work from Jan 15 has been processed. Everything looks normal.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-900 to-slate-900 border border-primary-800 rounded-2xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-lg font-semibold text-white mb-2 relative z-10">AI Health Assessment</h3>
           <p className="text-slate-300 text-sm mb-6 relative z-10">
             Based on your recent wearable data and lab reports, your overall wellness score is stable. 
             Focus on maintaining consistent sleep schedules to optimize recovery.
           </p>
           <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors relative z-10">
             View Detailed Report
           </button>
        </div>
      </div>
    </div>
  );
};