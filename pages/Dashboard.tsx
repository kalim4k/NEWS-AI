import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Eye, FileText, ArrowUpRight, Clock } from 'lucide-react';
import { StatData } from '../types';

interface DashboardProps {
  stats: StatData[];
  globalStats: {
    totalViews: number;
    totalVisitors: number;
    totalArticles: number;
  };
}

const TRAFFIC_SOURCE_DATA = [
  { name: 'Recherche Org.', value: 45, color: '#4f46e5' }, 
  { name: 'Réseaux Sociaux', value: 25, color: '#ec4899' }, 
  { name: 'Direct', value: 20, color: '#0ea5e9' }, 
  { name: 'Référents', value: 10, color: '#8b5cf6' },
];

export const Dashboard: React.FC<DashboardProps> = ({ stats, globalStats }) => {
  const [greeting, setGreeting] = useState({ text: 'Bonjour', icon: '☀️' });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting({ text: 'Bonjour', icon: '☕' });
      } else if (hour >= 12 && hour < 18) {
        setGreeting({ text: 'Bon après-midi', icon: '🌤️' });
      } else {
        setGreeting({ text: 'Bonsoir', icon: '🌙' });
      }
    };
    updateGreeting();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{greeting.text} Admin ! <span className="ml-1">{greeting.icon}</span></h1>
          <p className="text-slate-500 mt-2 text-sm md:text-lg">Voici les performances de NEWS AI cette semaine.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <Clock size={14} /><span>Mise à jour : À l'instant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: 'Vues totales', value: globalStats.totalViews.toLocaleString(), icon: Eye, color: 'blue', change: '+12%' },
          { title: 'Visiteurs Uniques', value: globalStats.totalVisitors.toLocaleString(), icon: Users, color: 'indigo', change: '+5.4%' },
          { title: 'Articles Publiés', value: globalStats.totalArticles.toString(), icon: FileText, color: 'purple', change: null }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-slate-500">{item.title}</p><h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{item.value}</h3></div>
              <div className={`p-3 bg-${item.color}-50 rounded-xl text-${item.color}-600`}><item.icon className="w-6 h-6" /></div>
            </div>
            {item.change && <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md"><ArrowUpRight className="w-4 h-4 mr-1" /><span className="font-bold">{item.change}</span></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Trafic & Visites</h2>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Sources</h2>
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={TRAFFIC_SOURCE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {TRAFFIC_SOURCE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-12"><span className="text-2xl font-bold text-slate-800">100%</span></div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {TRAFFIC_SOURCE_DATA.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                  <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};