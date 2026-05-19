import React from 'react';
import { motion } from 'motion/react';
import { Bell, Search, ExternalLink, Zap, ShieldAlert, TrendingUp, Users, Target, Bot, BarChart4, Terminal, LayoutDashboard, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useNotificationMetrics } from '../../hooks/useAdminData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Cell as PieCell } from 'recharts';

// Mock data to match complexity
const channelData = [
  { name: '12 AM', push: 1000, sms: 500, whatsapp: 200, email: 100 },
  { name: '4 AM', push: 1200, sms: 600, whatsapp: 300, email: 150 },
  { name: '8 AM', push: 3000, sms: 1500, whatsapp: 800, email: 400 },
  { name: '12 PM', push: 5000, sms: 2500, whatsapp: 1200, email: 600 },
  { name: '4 PM', push: 6000, sms: 3000, whatsapp: 1500, email: 800 },
  { name: '8 PM', push: 4000, sms: 2000, whatsapp: 1000, email: 500 },
];

const overviewData = [
  { name: 'Customers', value: 6521, color: '#38bdf8' },
  { name: 'Riders', value: 4256, color: '#4ade80' },
  { name: 'Stores', value: 1245, color: '#fb923c' },
  { name: 'System', value: 526, color: '#a855f7' },
];

export function NotificationsDashboard() {
  const { notifications, loading, createNotification, sendEmergencyBroadcast } = useNotifications();
  const metrics = useNotificationMetrics(notifications);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: '', message: '', targetApps: [] as string[] });
  const [emergencyData, setEmergencyData] = React.useState({ title: '', message: '' });

  const handleSend = async () => {
    await createNotification({...formData, category: 'System'});
    setIsModalOpen(false);
    setFormData({ title: '', message: '', targetApps: [] });
  };

  const handleEmergencySend = async () => {
     await sendEmergencyBroadcast({...emergencyData});
     setIsEmergencyModalOpen(false);
     setEmergencyData({ title: '', message: '' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10 px-6 font-sans text-slate-200">
        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg bg-cyber-black border border-neon-blue/50 p-6">
                    <h2 className="text-white font-bold mb-4">Create New Notification</h2>
                    <input className="w-full bg-white/5 border border-white/10 p-2 mb-2 text-white" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <textarea className="w-full bg-white/5 border border-white/10 p-2 mb-2 text-white" placeholder="Message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                    <div className="flex gap-4 mb-4 text-xs text-slate-300">
                        {['Customers', 'Riders', 'Stores'].map(app => (
                            <label key={app} className="flex items-center gap-1">
                                <input type="checkbox" onChange={e => setFormData({...formData, targetApps: e.target.checked ? [...formData.targetApps, app] : formData.targetApps.filter(t => t !== app)})} /> {app}
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-white">Cancel</button>
                        <button onClick={handleSend} className="px-4 py-2 bg-neon-blue text-cyber-black font-bold">Send</button>
                    </div>
                </div>
            </div>
        )}

        {/* Emergency Modal */}
        {isEmergencyModalOpen && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg bg-red-950/20 border border-neon-red/50 p-6">
                    <h2 className="text-neon-red font-black uppercase text-xl mb-4">Emergency Broadcast</h2>
                    <input className="w-full bg-white/5 border border-white/10 p-2 mb-2 text-white" placeholder="Alert Title" value={emergencyData.title} onChange={e => setEmergencyData({...emergencyData, title: e.target.value})} />
                    <textarea className="w-full bg-white/5 border border-white/10 p-2 mb-2 text-white" placeholder="Alert Message" value={emergencyData.message} onChange={e => setEmergencyData({...emergencyData, message: e.target.value})} />
                    
                    <div className="flex gap-2 justify-end mt-4">
                        <button onClick={() => setIsEmergencyModalOpen(false)} className="px-4 py-2 text-white">Cancel</button>
                        <button onClick={handleEmergencySend} className="px-4 py-2 bg-neon-red text-white font-black uppercase tracking-widest">SEND CRITICAL ALERT</button>
                    </div>
                </div>
            </div>
        )}

      {/* Header with Cyberpunk Border */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative">
         <div className="absolute -bottom-[1px] left-0 w-20 h-[1px] bg-neon-blue shadow-[0_0_10px_#00b2ff]" />
        <h1 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
           <Bell size={18} className="text-neon-blue" />
           RAjFleet Notifications
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative text-xs group">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue" />
            <input type="text" placeholder="Search anything..." className="bg-cyber-black border border-white/10 rounded-sm py-1.5 pl-8 pr-4 text-white focus:border-neon-blue outline-none transition-colors w-64" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-white/5 border border-white/10 text-white cursor-pointer hover:border-neon-blue"><Bell size={16} /></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-white/5 border border-white/10 text-white cursor-pointer hover:border-neon-blue"><LayoutDashboard size={16} /></div>
          </div>
        </div>
      </div>

      {/* Metrics Row - Dense */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-1">
        {[
          { label: 'Total Sent', value: metrics.totalSent.toLocaleString(), delta: '+16.8%' },
          { label: 'Delivered', value: metrics.deliveredCount.toLocaleString(), delta: '+15.2%' },
          { label: 'Open Rate', value: metrics.avgOpenRate, delta: '+6.7%' },
          { label: 'Click Rate', value: metrics.avgClickRate, delta: '+4.3%' },
          { label: 'Failed', value: metrics.failedCount.toLocaleString(), delta: '-3.1%' },
          { label: 'Active', value: metrics.activeCampaigns.toLocaleString(), delta: '+5' },
          { label: 'Scheduled', value: metrics.scheduledCount.toLocaleString(), delta: '+2' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-2 border border-white/10 bg-cyber-black/70 flex flex-col gap-0.5 hover:border-neon-blue/40 transition-all cursor-pointer relative group">
            <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[8px] font-mono text-slate-500 uppercase">{stat.label}</span>
            <div className="text-md font-black text-white italic font-orbitron">{stat.value}</div>
            <div className="text-[7px] font-bold text-neon-green">
              {stat.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Row 1 */}
        <div className="lg:col-span-1 glass-panel p-4 bg-cyber-black/40">
           <h2 className="text-[10px] font-bold text-white uppercase italic mb-2">Notification Overview</h2>
           <div className="h-[150px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={overviewData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {overviewData.map((entry, index) => <PieCell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="lg:col-span-1 glass-panel p-4 bg-cyber-black/40">
          <h2 className="text-[10px] font-bold text-white uppercase italic mb-2">Recent Notifications</h2>
          <div className="space-y-2 text-xs">
            {loading ? <div>Loading...</div> : notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-white truncate">{n.title}</span>
                <span className="text-neon-blue font-mono">SENT</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 glass-panel p-4 bg-cyber-black/40">
           <h2 className="text-[10px] font-bold text-white uppercase italic mb-2">Channel Performance</h2>
           <div className="h-[150px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={channelData}>
                 <Area type="monotone" dataKey="push" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} />
                 <Area type="monotone" dataKey="sms" stroke="#4ade80" fill="#4ade80" fillOpacity={0.1} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
      {/* Row 2: Categories, Table, Scheduled - Rebuilt dense */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
         <div className="lg:col-span-3 glass-panel p-3 bg-cyber-black/60 border border-white/10 text-xs">
            <h2 className="text-[10px] font-bold text-white uppercase italic mb-2 border-b border-white/5 pb-1">Categories</h2>
            <div className="space-y-2">
               {metrics.categoryData.map(c => (
                  <div key={c.name} className="flex justify-between items-center group">
                     <span className="text-slate-400 group-hover:text-neon-blue text-[9px]">{c.name}</span>
                     <div className="flex-1 mx-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue/50" style={{width: `${c.percentage}%`}}></div>
                     </div>
                     <span className="text-white font-bold text-[9px]">{c.value}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="lg:col-span-6 glass-panel p-3 bg-cyber-black/60 border border-white/10 text-xs text-white">
            <h2 className="text-[10px] font-bold uppercase italic mb-2 border-b border-white/5 pb-1">Top Performing Notifications</h2>
            <table className="w-full text-[9px]">
              <thead><tr className="text-slate-500 uppercase text-[8px] text-left"><th>Title</th><th>Sent</th><th>Open %</th><th>Engagement</th></tr></thead>
              <tbody>
                <tr className="border-b border-white/5"><td className="py-1 text-white">20% OFF Sale</td><td>5,251</td><td>72%</td><td className="text-neon-green">HIGH</td></tr>
                <tr className="border-b border-white/5"><td className="py-1 text-white">Order #RJ12</td><td>2,145</td><td>70%</td><td className="text-neon-green">HIGH</td></tr>
              </tbody>
            </table>
         </div>
         <div className="lg:col-span-3 glass-panel p-3 bg-cyber-black/60 border border-white/10 text-xs text-white">
            <h2 className="text-[10px] font-bold uppercase italic mb-2 border-b border-white/5 pb-1">Scheduled</h2>
              <div className="space-y-1">
                 <div className="flex justify-between bg-white/5 p-1 rounded-sm border border-white/5">
                    <span className="text-slate-300">Flash Sale</span>
                    <span className="text-neon-green">SCHEDULED</span>
                 </div>
              </div>
         </div>
      </div>

       {/* Row 4 - Create New / Quick Actions */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="glass-panel p-3 bg-cyber-black/60 border border-white/10 flex items-center justify-between">
             <div className="text-xs">
                <h2 className="text-[10px] font-bold text-white uppercase italic">Create New Notification</h2>
                <p className="text-[9px] text-slate-500">Send notifications to your users across channels.</p>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 bg-neon-blue/20 border border-neon-blue/50 text-neon-blue text-[10px] font-bold uppercase hover:bg-neon-blue hover:text-cyber-black transition-colors">Create New</button>
          </div>
          <div className="glass-panel p-3 bg-cyber-black/60 border border-white/10 flex items-center gap-2">
             <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-300 hover:text-neon-blue">Customers</button>
             <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-300 hover:text-neon-green">Riders</button>
             <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-300 hover:text-neon-orange">Stores</button>
          </div>
       </div>


       {/* Row 5 - Emergency/AI */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
         <div className="glass-panel p-4 bg-red-950/10 border border-neon-red/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-transparent animate-pulse" />
            <h2 className="text-[10px] font-bold text-neon-red uppercase italic mb-2 flex items-center gap-1">
               <AlertTriangle size={10} className="animate-bounce"/> Emergency Alert System
            </h2>
            <div className="flex gap-4">
               <button onClick={() => setIsEmergencyModalOpen(true)} className="py-2 px-6 bg-neon-red text-cyber-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.01] transition-transform">Send Emergency Broadcast</button>
               <div className="flex-1 text-[9px] text-slate-400">
                  <p>Priority: <span className="text-neon-red">HIGH</span></p>
                  <p>Status: <span className="text-neon-green">ACTIVE</span></p>
               </div>
            </div>
         </div>
         <div className="glass-panel p-4 bg-cyber-black/60 border border-neon-purple/30">
            <h2 className="text-[10px] font-bold text-neon-purple uppercase italic mb-2 flex items-center gap-1"><Bot size={10}/> AI Smart Assistant</h2>
            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-300">
               <p>Best Time: 7 PM - 9 PM</p>
               <p>Audience: All Customers</p>
               <p>Predicted Rate: 72%</p>
               <button className="text-neon-cyan underline">Generate Report</button>
            </div>
         </div>
       </div>

    </div>
  );
}
