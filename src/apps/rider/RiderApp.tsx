import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Map, Wallet, User, Bell, Package, Zap, Navigation, ShieldAlert, Cpu, Activity, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';

export default function RiderApp() {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col h-screen bg-cyber-black text-slate-200 overflow-hidden max-w-md mx-auto border-x border-white/5 font-sans relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-[60px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-24 h-24 bg-neon-orange/5 blur-[50px] rounded-full" />
        <div className="scan-line absolute inset-0 opacity-10" />
      </div>

      {/* Rider Header */}
      <header className="h-20 glass-panel rounded-none border-t-0 border-x-0 border-b-white/10 flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center space-x-3">
          <img 
            src="http://rajhomeindia.com/wp-content/uploads/2026/05/RAjfleet-app.png" 
            alt="RAjFleet Logo" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Link Status</span>
            <span className="text-[9px] font-bold text-neon-green uppercase tracking-widest leading-tight flex items-center">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full mr-1.5 animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>SYNCED
            </span>
          </div>
          <div className="w-9 h-9 rounded border border-white/10 bg-white/5 flex items-center justify-center relative">
            <Bell size={16} className="text-slate-400" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-neon-orange rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Rider Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6 space-y-6 relative z-10">
        <Routes>
          <Route path="/" element={<RiderDashboard />} />
          <Route path="/orders" element={<Placeholder label="Task History" />} />
          <Route path="/map" element={<RiderMap />} />
          <Route path="/wallet" element={<Placeholder label="Credit Matrix" />} />
          <Route path="/profile" element={<RiderProfile />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-panel rounded-none border-b-0 border-x-0 border-t-white/10 flex justify-around py-3 px-2 z-20">
        <MobileNavItem to="/rider" icon={<Cpu size={20} />} label="CORE" />
        <MobileNavItem to="/rider/orders" icon={<ClipboardList size={20} />} label="TASKS" />
        <MobileNavItem to="/rider/map" icon={<Navigation size={20} />} label="NAV" />
        <MobileNavItem to="/rider/wallet" icon={<Wallet size={20} />} label="FIN" />
        <MobileNavItem to="/rider/profile" icon={<User size={20} />} label="ME" />
      </nav>
    </div>
  );
}

function MobileNavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/rider' && (location.pathname === '/rider/' || location.pathname === '/rider'));
  
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 min-w-[56px] py-1 transition-all active:scale-90">
      <div className={cn(
        "p-2 rounded-sm transition-all relative overflow-hidden",
        isActive ? "text-neon-blue bg-neon-blue/10 border border-neon-blue/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]" : "text-slate-500"
      )}>
        {icon}
        {isActive && (
           <motion.div 
             layoutId="rider-nav-active"
             className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue"
             initial={false}
           />
        )}
      </div>
      <span className={cn(
        "text-[8px] font-mono font-black tracking-[0.2em] uppercase",
        isActive ? "text-white" : "text-slate-600"
      )}>
        {label}
      </span>
    </Link>
  );
}

function RiderDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-panel p-5 relative overflow-hidden group neon-glow-blue border-neon-blue/30">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity size={60} className="text-neon-blue" />
        </div>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em] leading-none mb-3 italic">Shift Telemetry / INR</p>
        <div className="flex items-baseline gap-1">
           <span className="text-sm font-mono text-neon-blue font-bold">₹</span>
           <h2 className="text-4xl font-black text-white font-mono tracking-tighter leading-none">1,240.00</h2>
        </div>
        <div className="mt-6 flex items-center space-x-3">
          <div className="px-2 py-1 bg-neon-green/10 border border-neon-green/20 rounded-sm font-mono text-[9px] font-bold text-neon-green uppercase tracking-widest">
            8 Deliveries
          </div>
          <div className="px-2 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-sm font-mono text-[9px] font-bold text-neon-blue uppercase tracking-widest">
            4h 22m Online
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <div>
             <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none">Command Queue</h3>
             <div className="hud-line w-20 mt-1.5" />
          </div>
          <span className="text-[9px] font-mono text-neon-orange uppercase font-bold animate-pulse tracking-widest">Awaiting Link...</span>
        </div>
        <div className="space-y-4">
          <OrderCard id="RF-8291" status="NAVIGATING TO PICKUP" type="PRIME" timer="04:20" />
          <OrderCard id="RF-8302" status="IN QUEUE" type="CARGO" timer="--:--" inactive />
        </div>
      </section>

      <section className="glass-panel p-5 bg-cyber-black/40 border-white/5">
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4">Operations Map</h3>
        <div className="h-40 bg-cyber-deep border border-white/5 border-dashed rounded flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
           <Navigation size={24} className="text-neon-blue animate-pulse" />
           <p className="text-[9px] font-mono uppercase tracking-[0.3em] italic">Synthesizing Hotzones...</p>
        </div>
      </section>
    </div>
  );
}

function OrderCard({ id, status, type, timer, inactive }: { id: string, status: string, type: string, timer: string, inactive?: boolean }) {
  return (
    <div className={cn(
      "glass-panel p-4 flex justify-between items-center group transition-all relative overflow-hidden",
      inactive ? "opacity-40 grayscale pointer-events-none" : "hover:border-neon-blue/40 border-white/10"
    )}>
      <div className="flex gap-4 items-center z-10">
        <div className="w-12 h-12 rounded border border-white/10 bg-white/5 flex items-center justify-center text-neon-blue group-hover:neon-text-blue transition-all">
          <Package size={22} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest",
              type === 'PRIME' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-blue/20 text-neon-blue'
            )}>{type}</span>
            <span className="text-[9px] font-mono text-slate-500 tracking-tight">#{id}</span>
          </div>
          <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{status}</p>
        </div>
      </div>
      <div className="text-right z-10">
        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">ETA_NOD</p>
        <p className={cn(
          "text-lg font-mono font-black tracking-tighter leading-none",
          timer !== '--:--' ? 'text-neon-orange' : 'text-slate-500'
        )}>{timer}</p>
      </div>
      {!inactive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue opacity-50" />}
    </div>
  );
}

function RiderMap() {
  return (
    <div className="h-full glass-panel border-white/5 rounded-none flex items-center justify-center relative overflow-hidden p-6 text-center">
       {/* UI Graphics */}
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
       <div className="absolute w-[300px] h-[300px] border border-neon-blue/10 rounded-full animate-pulse" />
       
       <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-neon-blue/10 border border-neon-blue/30 rounded-full mx-auto flex items-center justify-center text-neon-blue neon-glow-blue">
            <Navigation size={40} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Navigation Active</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] max-w-[200px] mx-auto">Neural GPS linkage established for RAjFleet core.</p>
          </div>
          <div className="hud-line w-40 mx-auto" />
       </div>
    </div>
  );
}

function RiderProfile() {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
      <div className="relative">
         <div className="w-28 h-28 glass-panel border-neon-blue/20 rounded-full flex items-center justify-center text-neon-blue overflow-hidden relative">
            <User size={48} className="z-10" />
            <div className="absolute inset-0 bg-neon-blue/5 animate-pulse" />
         </div>
         <div className="absolute -bottom-2 -right-2 w-10 h-10 glass-panel border-neon-green/30 bg-cyber-black rounded-full flex items-center justify-center text-neon-green">
            <CheckCircle size={20} />
         </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black uppercase tracking-tight text-white italic">Mithun Kumar</h2>
        <div className="flex items-center justify-center gap-3">
           <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest italic">Unit-044/ACT</span>
           <div className="w-1 h-1 rounded-full bg-slate-700" />
           <span className="text-[9px] font-mono text-neon-blue uppercase tracking-widest font-bold">EXPERT_RIDER</span>
        </div>
      </div>
      
      <div className="w-full glass-panel p-4 bg-white/5 border-white/5 flex items-center justify-between">
         <div className="text-left">
            <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Operational ID</div>
            <div className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">RF-NODE-7721X</div>
         </div>
         <div className="text-right">
            <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Trust Score</div>
            <div className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest font-mono">99.8%</div>
         </div>
      </div>

      <button 
        onClick={logout}
        className="w-full py-4 bg-neon-red/10 border border-neon-red/30 text-neon-red font-black text-[11px] uppercase tracking-[0.4em] rounded-sm hover:bg-neon-red/20 transition-all active:scale-95 cursor-pointer neon-text-red italic"
      >
        Terminate Neural Link
      </button>
      
      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest opacity-50">
        Infrastructure Core v3.04.12 // SECURE_NODE
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6 animate-in fade-in duration-1000 p-8 text-center">
      <div className="relative">
         <div className="w-20 h-20 rounded-full border border-neon-blue/10 animate-[spin_10s_linear_infinite]" />
         <div className="absolute inset-0 flex items-center justify-center">
            <ShieldAlert size={28} className="opacity-40 text-neon-blue" />
         </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white italic">{label}</h2>
        <div className="flex flex-col gap-1 items-center">
           <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest">Sync Sequence: PENDING</p>
           <div className="hud-line w-32 mt-2" />
        </div>
      </div>
    </div>
  );
}

