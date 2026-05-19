import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Truck, Users, Settings, Bell, 
  ShieldAlert, Wallet, Activity, Map, 
  ChevronRight, Search, User, Globe, Cpu, ZapOff,
  Navigation, CheckCircle, AlertTriangle, Filter, MoreHorizontal,
  ExternalLink, Phone, MessageSquare, Clock, ArrowRight, TrendingUp, Radio,
  BrainCircuit, Zap, Zap as ZapIcon, Info, Eye, UserCheck, BatteryMedium, Signal,
  Crown, Star, Gem, Award, BarChart3, Target, MapPin, Calendar, DollarSign,
  AlertCircle, ShieldCheck, Store, ShoppingBag, PieChart as PieChartIcon, Ban, History, ShieldCheck as Verified,
  FileText, Shield, Fingerprint, CreditCard, RotateCcw, Download, Share2, LogOut,
  ArrowUpRight, ArrowDownRight, Plus, Minus, Send, Briefcase, TrendingDown,
  Headset, Timer, Bike, X, UserPlus, HelpCircle, Upload,
  Trophy, Gift, Rocket, PlusSquare, Copy, ClipboardList, Settings2, BarChart4, Sparkles,
  Lock, Unlock, Key, Terminal, Network, Workflow, Database, FileLock, Trash2, Edit3, Clipboard, Bot, Terminal as TerminalIcon,
  Mic
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { AddRiderModal } from '../../components/admin/AddRiderModal';
import { NotificationsDashboard } from './NotificationsDashboard';
import { CreateOrderModal } from '../../components/admin/CreateOrderModal';
import { useOrders, useRiders, useStores, useSOS, useAnalytics, useWithdrawals } from '../../hooks/useAdminData';
import { Toaster, toast } from 'sonner';
import { seedDatabase } from '../../services/seed';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// Mock Data for Charts
const REVENUE_DATA = [
  { name: 'MON', value: 18000 },
  { name: 'TUE', value: 22000 },
  { name: 'WED', value: 19000 },
  { name: 'THU', value: 25000 },
  { name: 'FRI', value: 23000 },
  { name: 'SAT', value: 31000 },
  { name: 'SUN', value: 28000 },
];

const ORDER_DISTRIBUTION = [
  { name: 'Completed', value: 856, color: '#38bdf8' },
  { name: 'On Delivery', value: 234, color: '#22d3ee' },
  { name: 'Pending', value: 98, color: '#f97316' },
  { name: 'Cancelled', value: 60, color: '#ef4444' },
];

const HOURLY_ORDERS = [
  { time: '12 AM', total: 40 },
  { time: '4 AM', total: 20 },
  { time: '8 AM', total: 75 },
  { time: '12 PM', total: 110 },
  { time: '4 PM', total: 140 },
  { time: '8 PM', total: 160 },
  { time: '12 AM', total: 90 },
];

export default function AdminApp() {
  const { logout, profile } = useAuth();
  const location = useLocation();
  const { orders, loading: ordersLoading } = useOrders();
  const { riders, loading: ridersLoading } = useRiders();
  const { stores, loading: storesLoading } = useStores();
  const { sosAlerts, triggerGlobalSOS } = useSOS();

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return Number(localStorage.getItem('rajfleet_sidebar_width')) || 288; // Default 72 (w-72 = 18rem = 288px)
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('rajfleet_sidebar_collapsed') === 'true';
  });

  // Communication States
  const [activeChat, setActiveChat] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);

  useEffect(() => {
    localStorage.setItem('rajfleet_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('rajfleet_sidebar_collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    (window as any).triggerChat = (target: any) => setActiveChat(target);
    (window as any).triggerCall = (target: any) => {
      setActiveCall(target);
      setIsCallMinimized(false);
    };
  }, []);

  const activeRidersCount = riders.filter(r => r.status === 'ONLINE' || r.status === 'BUSY').length;
  const onlineRidersCount = riders.filter(r => r.status === 'ONLINE').length;
  const primeOrdersCount = orders.filter(o => o.type === 'PRIME').length;
  const emergencyOrdersCount = orders.filter(o => o.status === 'EMERGENCY' || o.type === 'EMERGENCY').length;

  return (
    <div className="flex h-screen bg-cyber-black text-slate-200 overflow-hidden font-sans selection:bg-neon-blue/30 relative">
      <Toaster position="top-right" theme="dark" richColors closeButton />
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-neon-blue/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-neon-orange/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="scan-line absolute inset-0 opacity-20" />
      </div>

      {/* Sidebar */}
      <aside 
        style={{ width: sidebarCollapsed ? '80px' : `${sidebarWidth}px` }}
        className="glass-panel m-4 border-white/5 flex flex-col z-20 relative overflow-hidden transition-all duration-500 ease-out group/sidebar"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
             <img 
               src="http://rajhomeindia.com/wp-content/uploads/2026/05/RAjfleet-app.png" 
               alt="RAjFleet Logo" 
               className="h-10 w-auto object-contain flex-shrink-0"
               referrerPolicy="no-referrer"
             />
             {!sidebarCollapsed && (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }}
                 className="flex flex-col min-w-0"
               >
                 <span className="text-lg font-black text-white tracking-tighter leading-none italic neon-text-blue">RAjFleet</span>
                 <span className="text-[8px] font-mono text-neon-blue/60 uppercase tracking-[0.2em] leading-none mt-1">LOGISTICS_CORE</span>
               </motion.div>
             )}
          </div>
          <button 
            onClick={toggleCollapse}
            className="p-2 hover:bg-white/5 rounded-sm text-slate-500 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <X size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div className="px-2 mb-3 text-[9px] font-mono font-bold text-neon-green/50 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="opacity-40">//</span> {!sidebarCollapsed && "NAVIGATION"}
          </div>
          
          <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />} label="DASHBOARD" active={location.pathname === '/admin'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/orders" icon={<Activity size={18} />} label="LIVE ORDERS" badge={orders.length.toString()} active={location.pathname.startsWith('/admin/orders')} collapsed={sidebarCollapsed} />
          
          <SidebarLink to="/admin/stores" icon={<Store size={18} />} label="STORES MANAGEMENT" badge={stores.length.toString()} active={location.pathname === '/admin/stores'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/riders" icon={<Users size={18} />} label="RIDER MANAGEMENT" badge={riders.length.toString()} active={location.pathname === '/admin/riders'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/rider-verification" icon={<UserCheck size={18} />} label="RIDER VERIFICATION" active={location.pathname === '/admin/rider-verification'} collapsed={sidebarCollapsed} />
          
          <SidebarLink to="/admin/wallet" icon={<Wallet size={18} />} label="WALLET & EARNINGS" active={location.pathname === '/admin/wallet'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/withdrawals" icon={<ExternalLink size={18} />} label="WITHDRAW REQUESTS" badge="12" active={location.pathname === '/admin/withdrawals'} collapsed={sidebarCollapsed} />
          
          <SidebarLink to="/admin/analytics" icon={<TrendingUp size={18} />} label="ANALYTICS" active={location.pathname === '/admin/analytics'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/notifications" icon={<Bell size={18} />} label="NOTIFICATIONS" active={location.pathname === '/admin/notifications'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/reports" icon={<FileText size={18} />} label="REPORTS" active={location.pathname === '/admin/reports'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/ai-insights" icon={<BrainCircuit size={18} />} label="AI MONITORING" active={location.pathname === '/admin/ai-insights'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/map" icon={<Map size={18} />} label="REAL-TIME TRACKING" active={location.pathname === '/admin/map'} collapsed={sidebarCollapsed} />
          
          <SidebarLink to="/admin/complaints" icon={<AlertTriangle size={18} />} label="CUSTOMER COMPLAINTS" active={location.pathname === '/admin/complaints'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/support" icon={<MessageSquare size={18} />} label="SUPPORT TICKETS" badge="5" active={location.pathname === '/admin/support'} collapsed={sidebarCollapsed} />
          <SidebarLink to="/admin/settings" icon={<Settings size={18} />} label="SETTINGS" active={location.pathname === '/admin/settings'} collapsed={sidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-cyber-black/40">
           {!sidebarCollapsed && (
             <>
               <div className="text-[9px] font-mono font-bold text-neon-green/50 uppercase tracking-[0.3em] mb-3 flex items-center gap-2 px-2">
                <span className="opacity-40">//</span> SYSTEM CONSOLE
              </div>
              
              <div className="glass-panel p-4 border-neon-green/20 bg-neon-green/5 space-y-3 relative overflow-hidden group/console">
                <div className="absolute top-0 right-0 p-2 opacity-20 cursor-pointer hover:opacity-100 transition-opacity">
                   <ZapOff size={12} className="text-neon-green" />
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-sm border border-neon-green/30 bg-neon-green/10 flex items-center justify-center text-neon-green shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                      <Cpu size={20} />
                   </div>
                   <div>
                      <div className="text-[11px] font-black text-neon-green uppercase tracking-widest leading-none">RAJHOME</div>
                      <div className="text-[8px] font-mono text-neon-green/60 uppercase tracking-widest mt-1">HYPERLOCAL DELIVERY NETWORK</div>
                   </div>
                </div>
                
                <div className="space-y-1 pt-1">
                   <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-neon-green/80">
                      <span>SYSTEM STATUS</span>
                      <span className="font-black">OPERATIONAL</span>
                   </div>
                </div>
              </div>
             </>
           )}

           {sidebarCollapsed && (
             <div className="flex justify-center">
                <Cpu size={20} className="text-neon-green" />
             </div>
           )}
        </div>

        {/* Resize Handle */}
        {!sidebarCollapsed && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-neon-blue/30 transition-colors"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              const onMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.min(Math.max(startWidth + (moveEvent.clientX - startX), 220), 400);
                setSidebarWidth(newWidth);
              };
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-sm relative">
           <div className="flex items-center gap-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH THE NETWORK..." 
                  className="bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-[10px] uppercase font-mono tracking-widest focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 w-80 transition-all"
                />
              </div>
              <div className="flex gap-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-lg animate-pulse" /> Uplink: Stable</span>
                <span className="flex items-center gap-2"><Globe size={12} className="text-neon-blue" /> Delhi Region</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <div className="text-right">
                   <div className="text-[9px] font-mono text-slate-500 uppercase leading-none">System Status</div>
                   <div className="text-[10px] font-bold text-neon-green uppercase leading-none mt-1">Operational</div>
                </div>
                <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center relative hover:bg-white/5 transition-colors cursor-pointer">
                  <Bell size={16} className="text-slate-400" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-orange rounded-full border-2 border-cyber-black" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-neon-blue/20 flex items-center justify-center text-neon-blue">
                   <Cpu size={16} />
                </div>
                <div className="text-[16px] font-mono font-black text-white">12:24<span className="opacity-40 animate-pulse">:</span>01</div>
              </div>
           </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/orders" element={<LiveOrders />} />
            <Route path="/prime" element={<Navigate to="/admin/orders?filter=PRIME" replace />} />
            <Route path="/emergency" element={<Navigate to="/admin/orders?filter=EMERGENCY" replace />} />
            <Route path="/stores" element={<StoresManagement />} />
            <Route path="/riders" element={<RiderManagement />} />
            <Route path="/rider-verification" element={<RiderVerification />} />
            <Route path="/wallet" element={<EarningsAndWallet />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Placeholder label="Accessing Detailed Reports..." />} />
            <Route path="/map" element={<LiveTrackingMap />} />
            <Route path="/withdrawals" element={<WithdrawRequests />} />
            <Route path="/notifications" element={<NotificationsDashboard />} />
            <Route path="/support" element={<SupportSystem />} />
            <Route path="/complaints" element={<Placeholder label="Accessing Customer Complaints..." />} />
            <Route path="/incentives" element={<IncentiveManagement />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/settings" element={<SettingsCenter />} />
            <Route path="/roles" element={<RolePermissionManagement />} />
            <Route path="*" element={<Placeholder label="Accessing Core Domain..." />} />
          </Routes>
        </main>
      </div>

      {/* Footer / Console */}
      <footer className="fixed bottom-0 right-0 p-4 z-30 pointer-events-none">
         <div className="glass-panel py-2 px-4 border-neon-blue/10 flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
               <span className="text-neon-blue">ENCRYPTION:</span> AES-256
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
               <span className="text-neon-green">LATENCY:</span> 14MS
            </div>
            <div className="flex items-center gap-2">
               <span className="text-neon-orange">SECURE NODE:</span> RJ-1048
            </div>
         </div>
      </footer>
      {/* Communication Overlays */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-96 h-[500px] z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <ChatWindow 
              target={activeChat} 
              onClose={() => setActiveChat(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCall && !isCallMinimized && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-cyber-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-8"
          >
            <CallOverlay 
              target={activeCall} 
              onClose={() => setActiveCall(null)} 
              onMinimize={() => setIsCallMinimized(true)}
              onOpenChat={() => { setIsCallMinimized(true); setActiveChat(activeCall); }}
            />
          </motion.div>
        )}
        {activeCall && isCallMinimized && (
           <motion.div
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             className="fixed bottom-6 right-6 z-[120] w-72 h-40 glass-panel border border-neon-blue/30 bg-cyber-black flex flex-col p-4 shadow-[0_0_30px_rgba(0,178,255,0.2)]"
           >
              <div className="flex items-center gap-3 mb-4">
                 <img src={activeCall.avatar} className="w-10 h-10 rounded-full border border-neon-blue" />
                 <div className="flex-1">
                    <div className="text-[10px] font-black text-white">{activeCall.name}</div>
                    <div className="text-[8px] font-mono text-neon-blue">ACTIVE_CALL</div>
                 </div>
                 <button onClick={() => setIsCallMinimized(false)}><ArrowUpRight size={14} /></button>
              </div>
              <div className="flex justify-between items-center text-neon-blue font-mono font-black text-xl">
                 00:45
                 <button onClick={() => setActiveCall(null)} className="text-neon-red"><Phone size={16} /></button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMMUNICATION COMPONENTS ---

function ChatWindow({ target, onClose }: { target: any, onClose: () => void }) {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useChat(target.id);
  const [input, setInput] = useState('');

  useEffect(() => {
     messages.forEach(m => {
        if (m.receiverId === user?.uid && !m.read) {
           markAsRead(m.id);
        }
     });
  }, [messages, user]);
  
  const send = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full h-full glass-panel border-neon-blue/30 bg-cyber-black flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neon-blue/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-neon-blue/40 flex items-center justify-center text-neon-blue font-black text-[10px]">
            {(target.name || 'U').charAt(0)}
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-widest">{target.name || 'Partner Node'}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-[8px] font-mono text-neon-green uppercase">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={cn(
            "flex flex-col max-w-[80%]",
            m.type === 'sent' ? "ml-auto items-end" : "items-start",
            m.type === 'system' && "mx-auto items-center max-w-full"
          )}>
            {m.type === 'system' ? (
              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                {m.text}
              </div>
            ) : (
              <>
                <div className={cn(
                  "px-3 py-2 rounded-sm text-[10px] font-medium leading-relaxed font-sans",
                  m.type === 'sent' 
                    ? "bg-neon-blue text-cyber-black shadow-[0_0_10px_rgba(0,178,255,0.2)]" 
                    : "bg-white/5 border border-white/10 text-white"
                )}>
                  {m.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">{m.time}</span>
                  {m.type === 'sent' && (
                    <div className="flex -space-x-1">
                      <CheckCircle size={8} className="text-neon-blue" />
                      <CheckCircle size={8} className="text-neon-blue" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {/* Typing indicator removed */}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type your message..."
            className="w-full bg-cyber-black border border-white/10 rounded-sm pl-4 pr-12 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-neon-blue/50"
          />
          <button 
            onClick={send}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-blue hover:text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="text-slate-500 hover:text-neon-blue"><Share2 size={12} /></button>
          <button className="text-slate-500 hover:text-neon-blue"><Fingerprint size={12} /></button>
          <div className="flex-1" />
          <span className="text-[7px] font-mono text-slate-700 uppercase tracking-[0.3em]">SECURE_UPLINK</span>
        </div>
      </div>
    </div>
  );
}

function CallOverlay({ target, onClose, onMinimize, onOpenChat }: { target: any, onClose: () => void, onMinimize: () => void, onOpenChat: () => void }) {
  const [status, setStatus] = useState('CONNECTING...');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const s = setTimeout(() => setStatus('ENCRYPTED LINE ACTIVE'), 2000);
    const t = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => { clearTimeout(s); clearInterval(t); };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-lg w-full bg-cyber-black p-12 rounded-sm border border-neon-blue/30 shadow-[0_0_50px_rgba(0,178,255,0.2)] relative">
      <button onClick={onMinimize} className="absolute top-4 right-4 text-slate-500 hover:text-white"><ArrowDownRight size={20} /></button>
      
      <div className="relative">
        <div className="w-40 h-40 rounded-full border-2 border-neon-blue/30 flex items-center justify-center p-2 animate-[spin_20s_linear_infinite]">
          <div className="w-full h-full rounded-full border-2 border-neon-blue relative" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-2 border-neon-blue/40 shadow-[0_0_50px_rgba(0,178,255,0.3)] overflow-hidden">
             <img src={target.avatar || '/default-rider.png'} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-cyber-black border border-white/10 px-2 py-0.5 rounded-sm">
           <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
           <span className="text-[8px] font-mono text-neon-green uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2 font-orbitron">{target.name || 'Partner Node'}</h2>
        <div className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.5em] mb-4 animate-pulse">{status}</div>
        <div className="text-5xl font-mono font-black text-white">{formatTime(timer)}</div>
      </div>

      <div className="grid grid-cols-4 gap-4 w-full">
        <CallActionBtn icon={<MessageSquare />} label="CHAT" onClick={onOpenChat} />
        <CallActionBtn icon={<Radio />} label="REC" />
        <CallActionBtn icon={<Signal />} label="HUD" />
        <CallActionBtn icon={<Cpu />} label="VOX" />
      </div>

      <div className="flex gap-6 mt-4">
        <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white" onClick={() => {}}><Zap size={24} /></button>
        <button onClick={onClose} className="w-16 h-16 rounded-full bg-neon-red flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,59,92,0.5)] hover:scale-110 transition-transform active:scale-95">
          <Phone size={32} className="rotate-[135deg]" />
        </button>
        <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white" onClick={() => {}}><Mic size={24} /></button>
      </div>

      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.4em] mt-4 flex items-center gap-3">
        <span>SIGNAL: <span className="text-neon-green">98%</span></span>
        <span>LATENCY: 12ms</span>
         <span className="w-1 h-1 rounded-full bg-neon-blue animate-pulse" />
      </div>
    </div>
  );
}

function CallActionBtn({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-12 h-12 rounded-sm border border-white/10 bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-neon-blue group-hover:border-neon-blue/40 group-hover:bg-neon-blue/10 transition-all">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function SidebarLink({ to, icon, label, active, badge, badgeColor, color, collapsed }: { to: string, icon: React.ReactNode, label: string, active?: boolean, badge?: string, badgeColor?: string, color?: string, collapsed?: boolean }) {
  // Determine if it's an emergency link to apply intense red styling
  const isEmergency = label.includes('EMERGENCY');
  const activeClass = isEmergency 
    ? "bg-neon-red/10 border border-neon-red/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
    : (color?.includes('orange') ? "bg-neon-orange/10 border border-neon-orange/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "bg-neon-green/10 border border-neon-green/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]");
    
  const activeTextColor = isEmergency ? "text-neon-red" : (color?.includes('orange') ? "text-neon-orange" : "text-neon-green");
  const indicatorColor = isEmergency ? "bg-neon-red" : (color?.includes('orange') ? "bg-neon-orange" : "bg-neon-green");

  return (
    <Link 
      to={to} 
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center justify-between px-3 py-3 rounded-sm transition-all group relative overflow-hidden mb-0.5 min-w-0",
        active ? activeClass : "hover:bg-white/5",
        collapsed && "justify-center px-0"
      )}
    >
      <div className="flex items-center gap-3 z-10 min-w-0">
        <span className={cn(
          "transition-colors shrink-0",
          active ? activeTextColor : (color || "text-slate-400 group-hover:text-neon-green/80")
        )}>
          {active && !collapsed && <span className={cn("mr-2 font-mono text-[8px] group-hover:animate-pulse", activeTextColor)}>{"_>"}</span>}
          {icon}
        </span>
        {!collapsed && (
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.15em] mt-0.5 transition-colors truncate",
            active ? activeTextColor : "text-slate-400 group-hover:text-white"
          )}>
            {label}
          </span>
        )}
      </div>
      {badge && !collapsed && (
        <span className={cn(
          "text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm z-10",
          badgeColor || (active ? `${activeTextColor.replace('text', 'bg')}/20 ${activeTextColor}` : "bg-white/10 text-neon-green")
        )}>
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-green shadow-lg animate-pulse" />
      )}
      {active && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", indicatorColor)} />
      )}
    </Link>
  );
}

function AdminDashboard() {
  const { orders } = useOrders();
  const { riders } = useRiders();
  const { sosAlerts, resolveSOS, triggerGlobalSOS } = useSOS();
  const { totalRevenue, totalOrders, primeOrders, emergencyOrders, revenueChartData, completedOrders, activeRiders, distribution, hourlyChartData } = useAnalytics();
  
  useEffect(() => {
    seedDatabase();
  }, []);
  
  const onlineRiders = riders.filter(r => r.status === 'ONLINE').length;
  const criticalSOS = sosAlerts.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-mono text-neon-blue uppercase tracking-[0.3em] mb-2 leading-none">
              <Activity size={10} /> // HUD_TELEMETRY_DOMAIN
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic">LOGISTICS COMMAND DASHBOARD</h1>
           <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-3 bg-white/5 inline-block px-2 py-1 border-l border-neon-blue italic">
             Welcome back, Admin. Initializing operational neural map...
           </p>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-2">Simulation Period</div>
           <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer hover:border-neon-blue/50 transition-colors">
              <LayoutDashboard size={14} className="text-neon-blue" /> Today, {format(new Date(), 'dd MMM yyyy')}
           </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/admin/orders"><MetricCard title="Total Orders" value={totalOrders.toString()} delta="+12.5%" trend="up" icon={<Package />} /></Link>
        <Link to="/admin/riders"><MetricCard title="Active Riders" value={activeRiders.toString()} delta="+8.4%" trend="up" icon={<Truck />} color="green" /></Link>
        <Link to="/admin/riders"><MetricCard title="Online Riders" value={onlineRiders.toString()} delta="+6.2%" trend="up" icon={<Users />} color="cyan" /></Link>
        <Link to="/admin/orders?filter=PRIME"><MetricCard title="Prime Orders" value={primeOrders.toString()} delta="+15.6%" trend="up" icon={<Zap />} color="cyan" /></Link>
        <Link to="/admin/orders?filter=EMERGENCY"><MetricCard title="Critical SOS" value={criticalSOS.toString().padStart(2, '0')} delta="+25.3%" trend="up" icon={<ShieldAlert />} color="red" /></Link>
        <Link to="/admin/wallet"><MetricCard title="Est. Revenue" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} delta="+18.7%" trend="up" icon={<Wallet />} color="blue" glow /></Link>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Earnings Chart */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col group h-full">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none mb-1">Earnings Overview</h3>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Weekly Neural Projection</p>
              </div>
              <select className="bg-cyber-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white focus:outline-none focus:border-neon-blue/50">
                <option>Today</option>
                <option>Weekly</option>
              </select>
           </div>
           
           <div className="mb-4">
              <div className="text-2xl font-black text-white font-mono">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-neon-green uppercase tracking-widest">+{(Math.random() * 20).toFixed(1)}% vs YESTERDAY</div>
           </div>

           <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter mb-1">Base Earnings</div>
                <div className="text-sm font-black text-white font-mono">₹{(totalRevenue * 0.7).toFixed(0)}</div>
              </div>
              <div>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter mb-1">Incentives</div>
                <div className="text-sm font-black text-neon-blue font-mono">₹{(totalRevenue * 0.3).toFixed(0)}</div>
              </div>
           </div>
        </div>

        {/* Live Tracking Map Placeholder */}
        <div className="lg:col-span-5 glass-panel p-1 flex flex-col relative overflow-hidden h-full">
           <div className="absolute top-6 left-6 z-10 px-3 py-1.5 glass-panel bg-cyber-black/60 border-neon-blue/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Tracking Map</h3>
           </div>
           <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                <MapActionButton label="ONLINE" count={onlineRiders.toString()} color="bg-neon-green" />
                <MapActionButton label="BUSY" count={(activeRiders - onlineRiders).toString()} color="bg-neon-blue" />
              </div>
           </div>

           <div className="flex-1 bg-cyber-deep relative overflow-hidden rounded-md">
              {/* Abstract Map UI */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px' 
                  }} 
              />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                 <div className="w-full h-full border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
                 <div className="absolute w-3/4 h-3/4 border border-white/5 rounded-full border-dashed animate-[spin_40s_linear_reverse_infinite]" />
                 <div className="absolute w-1/2 h-1/2 border border-neon-blue/10 rounded-full animate-pulse" />
                 
                 {/* Mock Nodes */}
                 <div className="absolute top-1/4 left-1/3 p-1 rounded-full bg-neon-green shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse" />
                 <div className="absolute top-12 left-1/2 p-1 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                 <div className="absolute bottom-1/3 right-1/4 p-1 rounded-full bg-neon-orange shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-bounce" />
                 <div className="absolute top-1/2 right-1/2 p-2 rounded bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                    <Navigation size={12} className="text-neon-blue animate-pulse" />
                 </div>

                 {/* Coordinate HUD */}
                 <div className="absolute bottom-4 left-4 font-mono text-[8px] text-slate-500 uppercase tracking-widest space-y-1">
                    <div>LAT: 25.5941</div>
                    <div>LNG: 85.1376</div>
                 </div>
              </div>
           </div>

           <div className="h-14 flex items-center justify-around px-4 bg-cyber-black/40 border-t border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2"><span className="text-white">Avg. Delivery:</span> 28 MIN</div>
              <div className="flex items-center gap-2"><span className="text-white">Transit:</span> {orders.filter(o => o.status === 'IN_TRANSIT').length}</div>
              <div className="flex items-center gap-2"><span className="text-white">Success:</span> {((completedOrders / (totalOrders || 1)) * 100).toFixed(1)}%</div>
           </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col h-full">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">Activity Feed</h3>
              <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">View All</button>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto pr-2 font-mono">
              {orders.slice(0, 8).map(o => (
                <LogEntry 
                  key={o.id}
                  type={o.status === 'EMERGENCY' ? 'emergency' : 'order'} 
                  time={format(o.createdAt?.toDate ? o.createdAt.toDate() : new Date(), 'HH:mm')} 
                  label={`ORDER #${o.id.slice(-6)} ${o.status}`} 
                  details={`${o.customerName} - ${o.storeName}`} 
                />
              ))}
           </div>
        </div>
      </div>

      {/* Secondary Graphs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Order Distribution */}
        <div className="glass-panel p-6 flex flex-col h-[300px]">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Order Distribution</h3>
           <div className="flex-1 flex items-center gap-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                 {distribution.map(item => (
                   <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Top Performers Table */}
        <div className="glass-panel p-6 flex flex-col h-[300px]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Elite Performers</h3>
              <Zap size={14} className="text-neon-cyan" />
           </div>
           <div className="flex-1 space-y-3 overflow-y-auto">
              {riders.slice(0, 5).sort((a, b) => (b.rating || 0) - (a.rating || 0)).map(r => (
                <RiderRow key={r.id} name={r.name} orders={r.totalEarnings ? "30+" : "0"} rating={r.rating?.toString()} revenue={`₹${(r.totalEarnings || 0).toLocaleString()}`} />
              ))}
           </div>
        </div>

        {/* Orders by Time Bar Chart */}
        <div className="glass-panel p-6 flex flex-col h-[300px]">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Ops Concentration</h3>
           <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChartData}>
                  <XAxis dataKey="time" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                    cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#38bdf8" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 flex justify-between px-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Dynamic Demand Analysis Active</span>
           </div>
        </div>
      </div>
    </div>
  );
}
function MetricCard({ title, value, delta, trend, icon, color = 'blue', glow }: { title: string, value: string, delta: string, trend: 'up' | 'down', icon: React.ReactNode, color?: string, glow?: boolean }) {
  const colorMap: any = {
    blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    cyan: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5',
    red: 'text-neon-red border-neon-red/20 bg-neon-red/5',
  };

  return (
    <div className={cn(
      "p-4 glass-panel border-white/5 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between h-32",
      glow && "neon-glow-blue border-neon-blue/30"
    )}>
      <div className="flex items-center justify-between mb-2">
         <div className={cn("p-2 rounded-sm border", colorMap[color])}>
           {icon}
         </div>
         <div className={cn("text-[9px] font-mono font-bold", trend === 'up' ? 'text-neon-green' : 'text-neon-red')}>
            {delta}
         </div>
      </div>
      <div>
         <div className="text-xl font-black font-mono text-white group-hover:neon-text-blue transition-all">{value}</div>
         <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{title}</div>
      </div>
    </div>
  );
}

function MapActionButton({ label, count, color }: { label: string, count: string, color: string }) {
  return (
    <div className="flex items-center gap-2 glass-panel py-1 px-2 border-white/10 bg-cyber-black/40">
       <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color)} />
       <span className="text-[9px] font-bold text-white uppercase tracking-widest">{label}</span>
       <span className="text-[9px] font-mono text-slate-400">{count}</span>
    </div>
  );
}

function LogEntry({ type, time, label, details }: { type: 'order' | 'rider' | 'emergency' | 'system', time: string, label: string, details: string, key?: any }) {
  const icons: any = {
    order: <Package size={12} className="text-neon-blue" />,
    rider: <Truck size={12} className="text-neon-cyan" />,
    emergency: <ShieldAlert size={12} className="text-neon-red animate-pulse" />,
    system: <Activity size={12} className="text-neon-green" />,
  };

  return (
    <div className="flex gap-3 group">
       <div className="w-8 h-8 rounded border border-white/5 bg-white/5 flex items-center justify-center shrink-0">
          {icons[type]}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
             <div className="text-[9px] font-black text-white uppercase truncate tracking-tight">{label}</div>
             <div className="text-[8px] font-mono text-slate-500 whitespace-nowrap ml-2">{time}</div>
          </div>
          <div className="text-[9px] font-mono text-slate-500 truncate">{details}</div>
       </div>
    </div>
  );
}

function RiderRow({ name, orders, rating, revenue }: { name: string, orders: string, rating: string, revenue: string, key?: any }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue font-bold text-[10px] border border-neon-blue/20">
             {name.charAt(0)}
          </div>
          <div>
            <div className="text-[10px] font-bold text-white uppercase leading-none">{name}</div>
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none mt-1">{orders} TRIPS</div>
          </div>
       </div>
       <div className="text-right">
          <div className="text-[10px] font-bold text-white font-mono leading-none">{revenue}</div>
          <div className="text-[8px] font-bold text-neon-cyan uppercase leading-none mt-1 group-hover:animate-pulse">★ {rating}</div>
       </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6 animate-in fade-in duration-1000">
      <div className="relative">
         <div className="w-24 h-24 rounded-full border border-neon-blue/20 animate-[spin_10s_linear_infinite]" />
         <div className="absolute inset-0 flex items-center justify-center">
            <ShieldAlert size={32} className="opacity-40 text-neon-blue" />
         </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white neon-text-blue">{label}</h2>
        <div className="flex flex-col gap-1 items-center">
           <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Log Node: PENDING_MAPPING_SEQUENCE</p>
           <div className="hud-line w-40 mt-2" />
        </div>
      </div>
    </div>
  );
}

// --- Live Orders Components ---

const LIVE_ORDERS_MOCK = [
  {
    id: "RF-8291",
    store: "CyberGrub Central",
    type: "PRIME",
    address: "221b Baker St, Sector 14",
    distance: "2.4 KM",
    eta: "12 MIN",
    status: "PREPARING",
    rider: {
      name: "Rahul Sharma",
      verified: true,
      vehicle: "ELECTRIC_BIKE",
      rating: "4.9",
      payout: "₹45.00"
    }
  },
  {
    id: "RF-8302",
    store: "Neon Nosh Express",
    type: "CARGO",
    address: "Penthouse 4, Skyline Apts",
    distance: "1.8 KM",
    eta: "08 MIN",
    status: "PICKED_UP",
    rider: {
      name: "Suresh Kumar",
      verified: true,
      vehicle: "DRONE_ASSIST",
      rating: "4.7",
      payout: "₹62.50"
    }
  },
  {
    id: "RF-8314",
    store: "Synth Bites",
    type: "EMERGENCY",
    address: "Block C, Tech Park 2",
    distance: "4.2 KM",
    eta: "DELAYED",
    status: "DELAYED",
    rider: {
      name: "Priya Singh",
      verified: true,
      vehicle: "MAGLEV_SLED",
      rating: "4.8",
      payout: "₹88.00"
    }
  },
  {
    id: "RF-8325",
    store: "Giga Kitchen",
    type: "STANDARD",
    address: "Street 9, Old Colony",
    distance: "3.1 KM",
    eta: "18 MIN",
    status: "DELIVERED",
    rider: {
      name: "Amit Patel",
      verified: true,
      vehicle: "STANDARD_BIKE",
      rating: "4.5",
      payout: "₹38.00"
    }
  }
];

function LiveOrders() {
  const { orders, createOrder } = useOrders();
  const { riders } = useRiders();
  const { sosAlerts, resolveSOS } = useSOS();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'ALL';
  const [assigningOrder, setAssigningOrder] = useState<any>(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  const setFilter = (f: string) => {
    setSearchParams({ filter: f });
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    if (filter === 'PRIME') return o.type === 'PRIME';
    if (filter === 'EMERGENCY') return o.type === 'EMERGENCY' || o.status === 'EMERGENCY';
    if (filter === 'DELAYED') return o.status === 'DELAYED'; // Just an example
    return true;
  });

  const primeOrdersCount = orders.filter(o => o.type === 'PRIME').length;
  const criticalSOSCount = sosAlerts.length;
  const onlineRidersCount = riders.filter(r => r.status === 'ONLINE').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Assign Rider Modal */}
      <AnimatePresence>
        {assigningOrder && (
          <RiderAssignmentModal 
            order={assigningOrder} 
            onClose={() => setAssigningOrder(null)} 
          />
        )}
        {/* Create Order Modal */}
        {isCreateOrderModalOpen && (
          <CreateOrderModal 
            isOpen={isCreateOrderModalOpen} 
            onClose={() => setIsCreateOrderModalOpen(false)} 
            createOrder={createOrder} 
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-mono text-neon-blue uppercase tracking-[0.3em] mb-2 leading-none">
              <ZapIcon size={10} className="animate-pulse" /> LIVE_ORDERS_CONTROL_CENTER
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic">LOGISTICS WAR-ROOM</h1>
           <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-3">
             Real-time hyperlocal fleet monitoring & AI batch optimization
           </p>
        </div>
        <div className="flex gap-4">
           <HeaderStat label="SYSTEM HEALTH" value="99.8%" color="green" />
           <HeaderStat label="AVERAGE ETA" value="22 MIN" color="blue" />
           <button 
             onClick={() => setIsCreateOrderModalOpen(true)}
             className="px-4 py-2 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_10px_rgba(56,189,248,0.2)] hover:scale-[1.02] transition-all"
           >
            + Create Order
           </button>
           <HeaderStat label="ACTIVE LINKS" value={orders.length.toString()} color="cyan" />
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumStatCard 
          label="Orders Running" 
          value={orders.length.toString()} 
          growth="+12%" 
          color="blue" 
          icon={<Package />} 
          onClick={() => setFilter('ALL')}
        />
        <PremiumStatCard 
          label="Prime Deliveries" 
          value={primeOrdersCount.toString()} 
          growth="+24%" 
          color="orange" 
          icon={<ZapIcon />} 
          onClick={() => setFilter('PRIME')}
        />
        <PremiumStatCard 
          label="Urgent Alerts" 
          value={criticalSOSCount.toString().padStart(2, '0')} 
          growth="CRITICAL" 
          color="red" 
          icon={<ShieldAlert />} 
          onClick={() => setFilter('EMERGENCY')}
        />
        <PremiumStatCard 
          label="Riders Online" 
          value={onlineRidersCount.toString()} 
          growth="STABLE" 
          color="green" 
          icon={<Truck />} 
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Orders List & Filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between glass-panel p-2 border-white/10">
            <div className="flex gap-1">
              {[
                { id: 'ALL', label: 'All Orders', count: orders.length },
                { id: 'PRIME', label: 'Prime Orders', count: orders.filter(o => o.type === 'PRIME').length },
                { id: 'EMERGENCY', label: 'Emergency Orders', count: orders.filter(o => o.type === 'EMERGENCY' || o.status === 'EMERGENCY').length },
                { id: 'DELAYED', label: 'Delayed Orders', count: orders.filter(o => o.status === 'DELAYED').length }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all italic rounded-sm flex items-center gap-2",
                    filter === f.id ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-slate-500 hover:text-slate-200"
                  )}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[8px] font-mono",
                      filter === f.id ? "bg-cyber-black text-neon-blue" : "bg-white/10 text-slate-400"
                    )}>
                      {f.count.toString().padStart(2, '0')}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pr-2">
               <button className="p-2 border border-white/5 rounded-sm hover:bg-white/5 text-slate-500 hover:text-neon-blue transition-all">
                  <Filter size={14} />
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-widest text-white hover:border-neon-blue/40 transition-all italic">
                  Bulk Actions <ChevronRight size={14} />
               </button>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="space-y-4">
             {filteredOrders.length === 0 ? (
               <div className="p-20 text-center glass-panel border-white/5 bg-cyber-black/40">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                      <Package size={24} />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-2">No active orders detected</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    System scanning... waiting for order incoming signals from the merchant domain.
                  </p>
               </div>
             ) : (
               filteredOrders.map(order => (
                 <div key={order.id}>
                    <OrderControlCard order={order} onAssign={() => setAssigningOrder(order)} />
                 </div>
               ))
             )}
          </div>

          {filteredOrders.length > 0 && (
            <button className="w-full py-4 glass-panel border-white/5 text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] hover:text-neon-blue hover:border-neon-blue/20 transition-all italic">
              Load More Operation Data
            </button>
          )}
        </div>

        {/* Right Column: HUD Map & Side Panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Fleet Map Panel */}
          <div className="glass-panel border-neon-blue/20 p-1 relative group bg-cyber-black/40 h-[450px] overflow-hidden">
             <div className="absolute top-4 left-4 z-10">
                <div className="glass-panel bg-cyber-black/60 px-3 py-1.5 border-white/10 flex items-center gap-2">
                   <div className="w-2 h-2 bg-neon-green rounded-full animate-ping" />
                   <span className="text-[9px] font-black uppercase tracking-tight text-white leading-none">LIVE FLEET HUD</span>
                </div>
             </div>
             <div className="absolute bottom-4 right-4 z-10 glass-panel p-3 border-white/10 bg-cyber-black/80 space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-neon-blue/10 flex items-center justify-center text-neon-blue">
                      <Navigation size={16} className="animate-pulse" />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-white uppercase leading-none">RIDER_RAHUL_S</div>
                      <div className="text-[8px] font-mono text-slate-500 uppercase leading-none mt-1">SPEED: 24 KM/H</div>
                   </div>
                </div>
                <div className="hud-line" />
                <div className="grid grid-cols-2 gap-2">
                   <div className="text-[8px] font-mono text-slate-400">BATT: 88%</div>
                   <div className="text-[8px] font-mono text-neon-green">SIGNAL: EXCL</div>
                </div>
             </div>

             <div className="w-full h-full bg-cyber-deep relative overflow-hidden rounded-sm">
                <div className="absolute inset-0 opacity-10" style={{ 
                  backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                
                {/* Visual Telemetry Grid lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-[120%] h-[1px] bg-white/5 rotate-12" />
                   <div className="w-[120%] h-[1px] bg-white/5 -rotate-45" />
                   <div className="absolute w-full h-[1px] bg-neon-blue/10 animate-pulse" />
                </div>

                <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-neon-blue/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping" />
                
                {/* Rider Markers */}
                <RiderMarker style={{ top: '30%', left: '40%' }} status="active" />
                <RiderMarker style={{ top: '60%', left: '70%' }} status="emergency" />
                <RiderMarker style={{ top: '20%', left: '80%' }} status="active" />
                <RiderMarker style={{ top: '75%', left: '20%' }} status="idle" />
             </div>
          </div>

          {/* Emergency Alert Panel */}
          <div className="glass-panel border-neon-red/30 p-5 bg-neon-red/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={40} className="text-neon-red" />
             </div>
             <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-neon-red animate-bounce" size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Emergency Link Active</h3>
             </div>
             <div className="space-y-4">
                {sosAlerts.length > 0 ? sosAlerts.slice(0, 2).map((sos) => (
                  <div key={sos.id} className="p-3 bg-cyber-black/40 border border-white/5 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-mono text-neon-red uppercase font-black tracking-widest">{sos.orderId || 'S_' + sos.id.slice(-6)}</span>
                       <span className="text-[8px] font-mono text-slate-500">{format(sos.timestamp?.toDate ? sos.timestamp.toDate() : new Date(), 'HH:mm')}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-tight line-clamp-1">{sos.message}</div>
                    <div className="flex gap-2 mt-3">
                       <button 
                         onClick={() => resolveSOS(sos.id)}
                         className="flex-1 py-1.5 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[9px] font-black uppercase tracking-widest italic rounded-sm"
                       >
                          Resolve
                       </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-3 bg-cyber-black/40 border border-white/5 rounded-sm text-center">
                    <span className="text-[8px] font-mono text-slate-500 uppercase italic">NO ACTIVE EMERGENCY NODES</span>
                  </div>
                )}
             </div>
          </div>

          {/* AI Insights Panel */}
          <div className="glass-panel border-neon-cyan/20 p-5 bg-neon-cyan/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={40} className="text-neon-cyan" />
             </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-neon-cyan/10 flex items-center justify-center text-neon-cyan neon-glow-blue border border-neon-cyan/30">
                   <BrainCircuit size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Neural Insights</h3>
             </div>
             <ul className="space-y-3">
                <AIInsightItem text="Optimize Sector 14 routes for 15% faster ETA" />
                <AIInsightItem text="Predicted demand surge in Tech Park by 6 PM" />
                <AIInsightItem text="Rider #RF-772 re-assignment recommended" />
             </ul>
             <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-mono text-slate-500 uppercase">AI confidence level</span>
                   <span className="text-[10px] font-bold text-neon-cyan uppercase">96.4%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '96%' }} className="h-full bg-neon-cyan" />
                </div>
             </div>
          </div>

          {/* Rider Activity Overview */}
          <div className="glass-panel p-5 border-white/5">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Rider Link Matrix</h3>
             <div className="grid grid-cols-2 gap-3">
                <RiderMiniStat label="ONLINE" count="856" color="neon-green" />
                <RiderMiniStat label="IDLE" count="124" color="neon-orange" />
                <RiderMiniStat label="LOW BATT" count="18" color="neon-red" />
                <RiderMiniStat label="NO SIGNAL" count="4" color="slate-500" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderStat({ label, value, color }: { label: string, value: string, color: 'blue' | 'green' | 'cyan' | 'red' }) {
  const colors = {
    blue: 'text-neon-blue',
    green: 'text-neon-green',
    cyan: 'text-neon-cyan',
    red: 'text-neon-red'
  };
  return (
    <div className="text-right">
       <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</div>
       <div className={cn("text-xs font-black uppercase tracking-tight", colors[color])}>{value}</div>
    </div>
  );
}

function PremiumStatCard({ label, value, growth, color, icon, onClick }: { label: string, value: string, growth: string, color: 'blue' | 'orange' | 'red' | 'green', icon: React.ReactNode, onClick?: () => void }) {
  const themes = {
    blue: 'border-neon-blue/20 bg-neon-blue/5 text-neon-blue',
    orange: 'border-neon-orange/20 bg-neon-orange/5 text-neon-orange',
    red: 'border-neon-red/20 bg-neon-red/5 text-neon-red',
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green'
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-panel p-5 relative overflow-hidden group transition-all hover:border-white/20", 
        themes[color],
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-95 shadow-lg"
      )}
    >
       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
          {icon}
       </div>
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
             <div className={cn("p-2 rounded bg-cyber-black/40 border border-white/5")}>
                {icon}
             </div>
             <div className="text-[9px] font-black uppercase tracking-widest italic opacity-60">
                {growth}
             </div>
          </div>
          <div className="space-y-1">
             <div className="text-4xl font-black font-mono tracking-tighter text-white">{value}</div>
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</div>
          </div>
       </div>
       <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 opacity-30", themes[color].split(' ')[0].replace('border', 'bg'))} />
    </div>
  );
}

function RiderAssignmentModal({ order, onClose }: { order: any, onClose: () => void }) {
  const { riders } = useRiders();
  const { assignRider } = useOrders();
  const availableRiders = riders.filter(r => r.status === 'ONLINE');

  const handleAssign = (rider: any) => {
    assignRider(order.id, rider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-cyber-black/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-2xl border-neon-blue/20 flex flex-col max-h-full overflow-hidden bg-cyber-black/80 shadow-[0_0_50px_rgba(56,189,248,0.2)]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">SELECT RECON UNIT</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Assigning to Order #{order.id.slice(-6)}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded text-slate-500"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
           {availableRiders.length === 0 ? (
             <div className="text-center py-12">
                <Truck className="mx-auto text-slate-700 mb-4 opacity-20" size={48} />
                <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">NO AVAILABLE RIDERS DETECTED IN SECTOR</p>
             </div>
           ) : (
             availableRiders.map(rider => (
               <div 
                 key={rider.id}
                 onClick={() => handleAssign(rider)}
                 className="glass-panel p-4 border-white/5 bg-white/5 hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all cursor-pointer group flex items-center justify-between"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded border border-neon-blue/20 bg-neon-blue/10 flex items-center justify-center text-neon-blue font-black uppercase italic">
                        {rider.name.charAt(0)}
                     </div>
                     <div>
                        <div className="text-sm font-black text-white uppercase leading-none">{rider.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-mono text-slate-500">{rider.vehicle?.type} - {rider.vehicle?.number}</span>
                           <span className="text-[9px] font-bold text-neon-orange uppercase">★ {rider.rating}</span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-mono text-neon-green mb-1">ONLINE</div>
                     <button className="px-4 py-1.5 bg-neon-blue/20 text-neon-blue text-[9px] font-black uppercase tracking-widest italic rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        SELECT
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>

        <div className="p-4 bg-cyber-black/40 border-t border-white/5 flex justify-between items-center">
           <span className="text-[9px] font-mono text-slate-500 uppercase">System Ready: Sector 14 Mapping Active</span>
           <button onClick={onClose} className="px-6 py-2 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

function OrderControlCard({ order, onAssign }: { order: any, onAssign?: () => void }) {
  const { updateOrderStatus } = useOrders();
  const statusColors: any = {
    PENDING: 'text-white border-white/20 bg-white/5',
    PREPARING: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    ACCEPTED: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    PICKED: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
    IN_TRANSIT: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
    DELAYED: 'text-neon-red border-neon-red/20 bg-neon-red/5',
    DELIVERED: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    EMERGENCY: 'text-neon-red border-neon-red/30 bg-neon-red/10 animate-pulse',
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateOrderStatus(order.id, newStatus);
  };

  const hasRider = !!(order.riderId || order.rider?.id);

  return (
    <div className="glass-panel p-5 bg-cyber-black/40 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
       <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Order Info */}
          <div className="md:col-span-4 space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-neon-blue transition-colors">
                   <Package size={20} />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white uppercase italic">#{order.id.slice(-6)}</span>
                      <span className={cn(
                         "text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none",
                         order.type === 'PRIME' ? 'bg-neon-orange/20 text-neon-orange' : 'bg-neon-blue/20 text-neon-blue'
                      )}>{order.type || 'REGULAR'}</span>
                   </div>
                   <div className="text-xs font-black text-white uppercase tracking-tight mt-0.5">{order.storeName || order.store || 'Unknown Merchant'}</div>
                </div>
             </div>
             <div className="space-y-1 pl-1">
                <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                   <Navigation size={10} /> {order.destination?.address || order.address || 'Location Pending'}
                </div>
                <div className="flex items-center gap-4 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                   <div className="flex items-center gap-1"><Map size={10} /> {order.distance || '2.4 KM'}</div>
                   <div className="flex items-center gap-1"><Clock size={10} /> {order.eta || 'Calculating...'}</div>
                </div>
             </div>
          </div>

          {/* Rider Section */}
          <div className="md:col-span-4 border-x border-white/5 px-6">
             {hasRider ? (
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full border border-neon-blue/20 bg-neon-blue/10 flex items-center justify-center text-neon-blue font-bold text-xs uppercase">
                        {(order.riderName || order.rider?.name || 'U').charAt(0)}
                     </div>
                     {(order.rider?.verified || true) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center text-cyber-black">
                           <CheckCircle size={10} />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <div className="text-[11px] font-black text-white uppercase leading-none">{order.riderName || order.rider?.name || 'Awaiting Dispatch'}</div>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-mono text-slate-500 uppercase">{order.rider?.vehicle || 'BIKE'}</span>
                        <span className="text-[8px] font-bold text-neon-orange uppercase">★ {order.rider?.rating || '4.5'}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => (window as any).triggerCall({ name: order.riderName || order.rider?.name })}
                       className="p-2 border border-white/5 rounded-sm hover:bg-neon-blue/10 hover:border-neon-blue/30 text-slate-500 hover:text-neon-blue transition-all"
                     >
                       <Phone size={12} />
                     </button>
                     <button 
                       onClick={() => (window as any).triggerChat({ name: order.riderName || order.rider?.name })}
                       className="p-2 border border-white/5 rounded-sm hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                     >
                       <MessageSquare size={12} />
                     </button>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <span className="text-[10px] font-mono text-neon-orange uppercase animate-pulse">NO RIDER LINKED</span>
                  <button 
                    onClick={onAssign}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-blue hover:text-cyber-black transition-all"
                  >
                    <UserPlus size={14} /> Assign Rider
                  </button>
               </div>
             )}
          </div>

          {/* Status & Actions */}
          <div className="md:col-span-4 flex items-center justify-between pl-6 text-right">
             <div className="space-y-1">
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">STATUS_LINK</div>
                <div className={cn("text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border transition-all", statusColors[order.status] || statusColors.PENDING)}>
                   {order.status || 'PENDING'}
                </div>
             </div>
             <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  {['PICKED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) ? (
                    <button 
                      onClick={() => handleStatusUpdate('DELIVERED')}
                      className="px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[9px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-green hover:text-cyber-black transition-all"
                    >
                      Complete
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusUpdate('IN_TRANSIT')}
                      className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[9px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-blue hover:text-cyber-black transition-all"
                    >
                      Transit
                    </button>
                  )}
                </div>
                <div className="group/dropdown relative">
                   <button className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase hover:text-white transition-colors">
                      Actions <MoreHorizontal size={14} />
                   </button>
                </div>
             </div>
          </div>
       </div>
       <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-all", (statusColors[order.status] || statusColors.PENDING).split(' ')[0].replace('text', 'bg'))} />
    </div>
  );
}

function RiderMarker({ style, status }: { style: any, status: 'active' | 'idle' | 'emergency' }) {
  const colors = {
    active: 'bg-neon-blue shadow-[0_0_10px_rgba(56,189,248,0.5)]',
    idle: 'bg-neon-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]',
    emergency: 'bg-neon-red shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'
  };

  return (
    <div className="absolute" style={style}>
       <div className={cn("w-2.5 h-2.5 rounded-full border-2 border-cyber-deep", colors[status])} />
    </div>
  );
}

function AIInsightItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 group">
       <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0 animate-pulse" />
       <p className="text-[10px] font-medium text-slate-300 leading-tight group-hover:text-white transition-colors capitalize">{text}</p>
    </li>
  );
}

function RiderMiniStat({ label, count, color }: { label: string, count: string, color: string }) {
  return (
    <div className="p-3 bg-cyber-black/40 border border-white/5 rounded-sm">
       <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</div>
       <div className={cn("text-sm font-black font-mono leading-none", `text-${color}`)}>{count}</div>
    </div>
  );
}


// --- Shared Tactical Components ---

function MatrixRain() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i}
          className="absolute top-0 text-neon-red text-[8px] font-mono whitespace-nowrap transition-all duration-1000"
          style={{ 
            left: `${(i / 30) * 100}%`, 
            writingMode: 'vertical-rl',
            animation: `matrix-rain ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${Math.random() * -20}s`
          }}
        >
          {Array.from({ length: 40 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')}
        </div>
      ))}
    </div>
  );
}

function StatusIndicator({ label, value, color }: { label: string, value: string, color: 'green' | 'cyan' | 'red' | 'blue' | 'orange' }) {
  const colorMap: any = {
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    cyan: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5',
    red: 'text-neon-red border-neon-red/30 bg-neon-red/10',
    blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    orange: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5'
  };
  
  return (
    <div className={cn("glass-panel px-4 py-2 flex items-center gap-3 border-white/5 h-fit", colorMap[color])}>
       <div className={cn("w-2 h-2 rounded-full", color === 'red' ? 'animate-pulse bg-neon-red' : 'bg-current')} />
       <div className="flex flex-col">
          <span className="text-[8px] font-mono opacity-60 uppercase">{label}</span>
          <span className="text-[10px] font-black font-mono tracking-tighter uppercase">{value}</span>
       </div>
    </div>
  );
}

function EmergencyKpiCard({ label, value, sub, color, icon, pulse }: { label: string, value: string, sub: string, color: 'red' | 'orange' | 'purple' | 'blue' | 'green' | 'cyan', icon: React.ReactNode, pulse?: boolean }) {
  const colorThemes: any = {
    red: 'border-neon-red/30 text-neon-red bg-neon-red/5',
    orange: 'border-neon-orange/20 text-neon-orange bg-neon-orange/5',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
    blue: 'border-neon-blue/20 text-neon-blue bg-neon-blue/5',
    green: 'border-neon-green/20 text-neon-green bg-neon-green/5',
    cyan: 'border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5'
  };

  return (
    <div className={cn(
      "glass-panel p-5 relative overflow-hidden group hover:scale-[1.02] transition-all", 
      colorThemes[color],
      pulse && "animate-glow-pulse"
    )}>
       {/* Scanline Overlay */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
       
       <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="p-2.5 rounded-sm bg-cyber-black/60 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {icon}
             </div>
             <div className="flex items-center gap-1.5">
               <div className={cn("w-1 h-1 rounded-full", pulse ? "bg-white animate-pulse" : "bg-white/30")} />
               <div className={cn("w-1 h-1 rounded-full", pulse ? "bg-white animate-pulse delay-75" : "bg-white/30")} />
               <div className={cn("w-1 h-1 rounded-full", pulse ? "bg-white animate-pulse delay-150" : "bg-white/30")} />
             </div>
          </div>
          <div>
             <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 group-hover:opacity-100 transition-opacity">
                {label}
             </div>
             <div className="text-3xl font-black italic tracking-tighter uppercase font-orbitron group-hover:scale-105 transition-transform origin-left">
                {value}
             </div>
             <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest mt-2 group-hover:opacity-60">
                {sub}
             </div>
          </div>
       </div>
    </div>
  );
}

// --- Stores Management Components ---

const STORES_MOCK = [
  {
    id: "ST-10001",
    name: "RAjHOME Express",
    owner: "Rajesh Kumar",
    ownerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    ownerPhone: "+91 91234 56789",
    ownerEmail: "rajesh.kumar@email.com",
    area: "Kankarbagh",
    city: "Patna",
    category: "Grocery",
    status: "ACTIVE",
    rating: 4.8,
    reviews: 248,
    orders30d: 1248,
    revenue30d: "₹1,85,240",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
    verified: true,
    verificationStatus: {
      documents: "Verified",
      bankDetails: "Verified",
      gst: "Verified",
      fssai: "Verified"
    },
    joinedDate: "15 Jan 2025",
    operatingHours: "08:00 AM - 11:00 PM",
    storeType: "Partner Store"
  },
  {
    id: "ST-10002",
    name: "RAjHOME Mart",
    owner: "Amit Singh",
    ownerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    ownerPhone: "+91 91234 56780",
    ownerEmail: "amit.singh@email.com",
    area: "Boring Road",
    city: "Patna",
    category: "Supermarket",
    status: "ACTIVE",
    rating: 4.6,
    reviews: 185,
    orders30d: 985,
    revenue30d: "₹1,24,560",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200",
    verified: true,
    verificationStatus: {
        documents: "Verified",
        bankDetails: "Verified",
        gst: "Verified",
        fssai: "Verified"
    },
    joinedDate: "10 Feb 2025",
    operatingHours: "09:00 AM - 10:00 PM",
    storeType: "Prime Store"
  },
  {
    id: "ST-10003",
    name: "MedPlus Pharmacy",
    owner: "Pankaj Verma",
    ownerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pankaj",
    ownerPhone: "+91 91234 11111",
    ownerEmail: "pankaj.verma@email.com",
    area: "Patliputra",
    city: "Patna",
    category: "Medicine",
    status: "ACTIVE",
    rating: 4.9,
    reviews: 412,
    orders30d: 756,
    revenue30d: "₹98,760",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=200",
    verified: true,
    verificationStatus: {
        documents: "Verified",
        bankDetails: "Verified",
        gst: "Verified",
        fssai: "Verified"
    },
    joinedDate: "05 Mar 2025",
    operatingHours: "24 Hours",
    storeType: "Health Partner"
  },
  {
    id: "ST-10004",
    name: "Fresh Bites Store",
    owner: "Neha Kumari",
    ownerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    ownerPhone: "+91 70042 33422",
    ownerEmail: "neha.kumari@email.com",
    area: "Danapur",
    city: "Patna",
    category: "Grocery",
    status: "PENDING",
    rating: 4.2,
    reviews: 12,
    orders30d: 0,
    revenue30d: "₹0",
    image: "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=200",
    verified: false,
    verificationStatus: {
        documents: "Pending",
        bankDetails: "Pending",
        gst: "Verified",
        fssai: "Pending"
    },
    joinedDate: "12 May 2026",
    operatingHours: "10:00 AM - 08:00 PM",
    storeType: "New Partner"
  },
  {
    id: "ST-10007",
    name: "WellCare Pharmacy",
    owner: "Ravi Ranjan",
    ownerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi",
    ownerPhone: "+91 91224 55678",
    ownerEmail: "ravi.ranjan@email.com",
    area: "Exhibition Road",
    city: "Patna",
    category: "Medicine",
    status: "SUSPENDED",
    rating: 3.2,
    reviews: 86,
    orders30d: 128,
    revenue30d: "₹16,240",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=200",
    verified: true,
    verificationStatus: {
        documents: "Verified",
        bankDetails: "Verified",
        gst: "Verified",
        fssai: "Verified"
    },
    joinedDate: "02 Dec 2024",
    operatingHours: "09:00 AM - 09:00 PM",
    storeType: "General Pharmacy"
  }
];

const STORE_PERFORMANCE_DATA = [
  { name: '18 May', revenue: 15000, orders: 120 },
  { name: '19 May', revenue: 18000, orders: 150 },
  { name: '20 May', revenue: 16000, orders: 180 },
  { name: '21 May', revenue: 21000, orders: 210 },
  { name: '22 May', revenue: 19000, orders: 230 },
  { name: '23 May', revenue: 23000, orders: 198 },
  { name: '24 May', revenue: 21000, orders: 210 },
];

const CATEGORY_DATA = [
  { name: 'Grocery', value: 45, color: '#38bdf8' },
  { name: 'Beverages', value: 20, color: '#22d3ee' },
  { name: 'Snacks', value: 15, color: '#f59e0b' },
  { name: 'Personal Care', value: 10, color: '#a855f7' },
  { name: 'Others', value: 10, color: '#94a3b8' },
];

function StoresManagement() {
  const { stores, loading, updateStoreStatus } = useStores();
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
      setIsSidePanelOpen(true);
    }
  }, [stores, selectedStore]);

  if (loading && stores.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neon-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Stores Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
           <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
              <Store size={12} /> RAjFleet_STORE_NETWORK_COMMAND_NODE
           </div>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
              STORES <span className="text-neon-cyan">MANAGEMENT</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">VERSION_3.0.4</span>
           </h1>
           <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl">
             AI-powered retail operations monitoring & partner management system.
             <span className="text-neon-cyan ml-2 italic underline underline-offset-4 decoration-neon-cyan/30">Neural retail grid synchronized.</span>
           </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <StatusIndicator label="SYS_INTEGRITY" value="100%" color="green" />
           <StatusIndicator label="RETAIL_LATENCY" value="0.8ms" color="cyan" />
           <StatusIndicator label="STORES_ACTIVE" value={stores.length.toString()} color="cyan" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
        <EmergencyKpiCard label="Total Stores" value={stores.length.toString()} sub="Network coverage active" color="blue" icon={<Store />} />
        <EmergencyKpiCard label="Active Stores" value={stores.filter(s => s.status === 'ACTIVE' || s.status === 'OPEN').length.toString()} sub="Operating nodes" color="green" icon={<CheckCircle />} />
        <EmergencyKpiCard label="Pending Approval" value={stores.filter(s => s.status === 'PENDING').length.toString()} sub="Awaiting verification" color="orange" icon={<Clock />} />
        <EmergencyKpiCard label="Suspended" value={stores.filter(s => s.status === 'SUSPENDED').length.toString()} sub="Temporarily suspended" color="red" icon={<Ban />} />
        <EmergencyKpiCard label="Avg Rating" value="4.7" sub="Excellent Performance" color="cyan" icon={<Star />} />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between glass-panel p-3 border-white/5 bg-cyber-black/80 relative z-10">
        <div className="flex flex-wrap gap-2">
          {['All Status', 'All Cities', 'All Areas', 'All Categories', 'Verification Status', 'Store Type'].map(filter => (
            <div key={filter} className="relative group/filter">
               <button className="flex items-center gap-3 px-4 py-2 border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all rounded-sm">
                  {filter} <ChevronRight size={10} className="rotate-90 opacity-40" />
               </button>
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 border border-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-white/5 transition-all">
             <Filter size={12} /> More Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-white/5 transition-all">
             <History size={12} /> Reset
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex items-center gap-3 px-6 py-2.5 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] transition-all">
             <ShoppingBag size={14} /> Add Store
          </button>
          <button className="flex items-center gap-3 px-6 py-2.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
             Bulk Actions <ChevronRight size={14} className="rotate-90" />
          </button>
          <button className="flex items-center gap-3 px-6 py-2.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
             <ExternalLink size={14} /> Export
          </button>
          <button className="p-2.5 border border-white/10 text-white rounded-sm hover:bg-white/5 transition-all">
             <History size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Stores Table Container */}
        <div className={cn("transition-all duration-700", isSidePanelOpen ? "lg:col-span-8" : "lg:col-span-12")}>
           <div className="glass-panel border-white/5 bg-cyber-black/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
                         <th className="px-6 py-4 text-left font-black w-10">
                            <div className="w-4 h-4 border border-white/20 rounded-sm" />
                         </th>
                         <th className="px-6 py-4 text-left font-black">Store Details</th>
                         <th className="px-6 py-4 text-left font-black">Owner & Contact</th>
                         <th className="px-6 py-4 text-left font-black">Area / City</th>
                         <th className="px-6 py-4 text-left font-black">Category</th>
                         <th className="px-6 py-4 text-left font-black">Status</th>
                         <th className="px-6 py-4 text-left font-black">Rating</th>
                         <th className="px-6 py-4 text-left font-black whitespace-nowrap">Orders (30D)</th>
                         <th className="px-6 py-4 text-right font-black">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {stores.map(store => (
                        <tr 
                          key={store.id} 
                          onClick={() => { setSelectedStore(store); setIsSidePanelOpen(true); }}
                          className={cn(
                            "group hover:bg-white/[0.03] transition-all cursor-pointer",
                            selectedStore?.id === store.id ? "bg-neon-blue/[0.03] border-l-2 border-l-neon-blue" : ""
                          )}
                        >
                           <td className="px-6 py-6">
                              <div className="w-4 h-4 border border-white/20 rounded-sm group-hover:border-neon-blue/50" />
                           </td>
                           <td className="px-6 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-sm border border-white/10 overflow-hidden shrink-0">
                                   <img src={store.image} alt={store.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                                <div>
                                   <div className="text-[11px] font-black text-white uppercase italic tracking-widest">{store.name}</div>
                                   <div className="text-[9px] font-mono text-slate-500 mt-1">{store.id}</div>
                                   <div className="flex items-center gap-1 mt-1">
                                      <Verified size={10} className={cn(store.verified ? "text-neon-green" : "text-slate-600")} />
                                      <span className={cn("text-[8px] font-mono uppercase", store.verified ? "text-neon-green" : "text-slate-600")}>
                                        {store.verified ? "Verified" : "Pending"}
                                      </span>
                                   </div>
                                </div>
                             </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full border border-white/10 bg-cyber-deep flex items-center justify-center text-[10px] text-neon-blue font-black uppercase">
                                    {(store.owner || store.ownerEmail || 'U').charAt(0)}
                                 </div>
                                 <div className="max-w-[120px] overflow-hidden">
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest truncate">{store.owner || 'Partner Node'}</div>
                                    <div className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">{store.ownerPhone || store.ownerEmail}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="text-[10px] font-black text-white uppercase tracking-widest">{store.area}</div>
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5">{store.city}</div>
                           </td>
                           <td className="px-6 py-6">
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-neon-blue uppercase tracking-widest">
                                 {store.category}
                              </span>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                                   store.status === 'ACTIVE' ? "bg-neon-green" : 
                                   store.status === 'PENDING' ? "bg-neon-orange" : "bg-neon-red"
                                 )} />
                                 <span className={cn("text-[9px] font-black uppercase tracking-widest",
                                   store.status === 'ACTIVE' ? "text-neon-green" : 
                                   store.status === 'PENDING' ? "text-neon-orange" : "text-neon-red"
                                 )}>
                                   {store.status}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                 <Star size={12} className="text-neon-cyan fill-neon-cyan/20" />
                                 <span className="text-[10px] font-black text-white font-mono">{store.rating}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="text-[11px] font-black text-white font-mono">{store.orders30d}</div>
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5">{store.revenue30d}</div>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 border border-white/5 rounded-sm hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                    <Eye size={14} />
                                 </button>
                                 <button className="p-2 border border-white/5 rounded-sm hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                    <MoreHorizontal size={14} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-white/5 bg-cyber-black/60 flex items-center justify-between">
                 <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                   Showing 1 to 8 of 128 stores
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 border border-white/5 text-slate-500 hover:text-white disabled:opacity-30" disabled>
                       <ChevronRight size={14} className="rotate-180" />
                    </button>
                    {[1, 2, 3, '...', 16].map((p, i) => (
                       <button 
                        key={i} 
                        className={cn(
                          "w-8 h-8 flex items-center justify-center text-[10px] font-black transition-all",
                          p === 1 ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-slate-500 hover:text-white"
                        )}
                       >
                         {p}
                       </button>
                    ))}
                    <button className="p-2 border border-white/5 text-slate-500 hover:text-white">
                       <ChevronRight size={14} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Side Panel: Store Intel */}
        <AnimatePresence>
          {isSidePanelOpen && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="lg:col-span-4"
            >
               <div className="glass-panel border-white/5 bg-cyber-black/60 h-full flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 z-20">
                     <button onClick={() => setIsSidePanelOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={20} className="rotate-45" />
                     </button>
                  </div>
                  
                  {/* Store Banner */}
                  <div className="h-48 relative overflow-hidden shrink-0 cursor-crosshair">
                     <img src={selectedStore?.image} alt={selectedStore?.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100" />
                     <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent" />
                     <div className="absolute bottom-4 left-6">
                        <div className="flex items-center gap-3">
                           <div className="w-16 h-16 rounded glass-panel p-0.5 border-white/20 bg-cyber-black relative z-10 overflow-hidden">
                              <img src={selectedStore?.image} alt="logo" className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedStore?.name}</h2>
                              <div className="flex items-center gap-2 mt-2">
                                 <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                 <span className="text-[9px] font-black text-neon-green uppercase tracking-widest">{selectedStore?.status}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                     {/* Store Intel Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                           <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Store ID</div>
                           <div className="text-xs font-black text-white font-mono tracking-widest">{selectedStore?.id}</div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                           <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Verification Status</div>
                           <div className="flex items-center gap-2">
                              <Verified size={12} className={selectedStore?.verified ? "text-neon-green" : "text-neon-orange"} />
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedStore?.verified ? "text-neon-green" : "text-neon-orange")}>
                                {selectedStore?.verified ? "Verified" : "Pending"}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Verification Progress Cards */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                           <ShieldCheck size={14} className="text-neon-cyan" /> Verification_Node_Status
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                           <VerificationNode label="DOCUMENTS" status={selectedStore?.verificationStatus?.documents || 'Not Provided'} />
                           <VerificationNode label="BANK_DETAILS" status={selectedStore?.verificationStatus?.bankDetails || 'Not Provided'} />
                           <VerificationNode label="GST_ID" status={selectedStore?.verificationStatus?.gst || 'Not Provided'} />
                           <VerificationNode label="FSSAI_LICENSE" status={selectedStore?.verificationStatus?.fssai || 'Not Provided'} />
                        </div>
                     </div>

                     {/* Store Performance */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                           <TrendingUp size={14} className="text-neon-blue" /> Operating_Metrics
                        </h3>
                        <div className="space-y-4">
                           <MetricRow label="Revenue Generated" value={selectedStore?.revenue30d} />
                           <MetricRow label="Total Orders" value={selectedStore?.orders30d} />
                           <MetricRow label="Avg Store Rating" value={`${selectedStore?.rating} (${selectedStore?.reviews} reviews)`} />
                           <MetricRow label="Operating Hours" value={selectedStore?.operatingHours} />
                           <MetricRow label="Join Date" value={selectedStore?.joinedDate} />
                        </div>
                     </div>

                     {/* Quick Tactical Controls */}
                     <div className="space-y-3 pt-6 border-t border-white/10">
                        <button 
                          onClick={() => updateStoreStatus(selectedStore.id, selectedStore.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
                          className="w-full flex items-center justify-between px-6 py-4 bg-neon-red/10 border border-neon-red/30 text-neon-red text-[11px] font-black uppercase tracking-widest italic hover:bg-neon-red hover:text-cyber-black transition-all"
                        >
                           <span>{selectedStore?.status === 'SUSPENDED' ? 'RESTORE_ENTITY_PROTOCOL' : 'SUSPEND_ENTITY_PROTOCOL'}</span>
                           <Ban size={14} />
                        </button>
                        <button className="w-full flex items-center justify-between px-6 py-4 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
                           <span>TRIGGER_RE-VERIFICATION</span>
                           <ShieldAlert size={14} />
                        </button>
                        <button className="w-full flex items-center justify-between px-6 py-4 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
                           <span>CONTACT_OWNER_LINK</span>
                           <Phone size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analytics Visualization Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10 pb-12">
        {/* Performance Visualization */}
        <div className="xl:col-span-8 glass-panel p-8 border-white/5 bg-cyber-black/40">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none mb-2 italic">Neural_Performance_Feed</h3>
                 <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest italic">Live operational synchronization // 30D Window</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-blue" />
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-black">Revenue</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-black">Orders</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={STORE_PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="performanceGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '4px', fontSize: '10px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fillOpacity={1} fill="url(#performanceGlow)" strokeWidth={3} />
                  <Area type="monotone" dataKey="orders" stroke="#ffffff" strokeDasharray="5 5" fillOpacity={0} strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
              <MiniPerformanceStat label="Total Volume" value="1,248" delta="+18%" color="blue" />
              <MiniPerformanceStat label="Net Conversion" value="₹1.8M" delta="+22%" color="green" />
              <MiniPerformanceStat label="Retention Rate" value="98.5%" delta="+2.1%" color="cyan" />
              <MiniPerformanceStat label="Store Efficiency" value="4.8" delta="+0.3" color="purple" />
           </div>
        </div>

        {/* Category Analytics Hub */}
        <div className="xl:col-span-4 glass-panel p-8 border-white/5 bg-cyber-black/40 flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic mb-8">Category_Sync_Analytics</h3>
           
           <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={CATEGORY_DATA}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={10}
                       dataKey="value"
                       stroke="none"
                    >
                       {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-2xl font-black text-white font-mono tracking-tighter">1,248</div>
                 <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Total Nodes</div>
              </div>
           </div>

           <div className="mt-8 space-y-4">
              {CATEGORY_DATA.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
                   </div>
                   <div className="text-[10px] font-mono text-white font-bold">{cat.value}% <span className="text-slate-600 ml-1">({Math.round(1248 * cat.value / 100)})</span></div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Store Location Map Integration */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        <div className="xl:col-span-9 glass-panel p-1 border-white/5 bg-cyber-black relative h-[400px] group overflow-hidden">
           <div className="absolute top-6 left-6 z-10 px-4 py-2 glass-panel bg-cyber-black/80 border-white/20">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Live_Store_Uplink_Grid</h3>
           </div>
           
           <div className="absolute inset-0 bg-cyber-deep relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05]" 
                   style={{ backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              {/* Fake Map Elements */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
                 <path d="M 0 100 Q 200 50 400 150 T 800 100 T 1200 200" fill="none" stroke="#38bdf8" strokeWidth="2" />
                 <path d="M 100 0 Q 50 200 150 400 T 100 800 T 200 1200" fill="none" stroke="#38bdf8" strokeWidth="1" />
              </svg>

              {/* Store Nodes */}
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-1/3 left-1/4">
                 <div className="w-4 h-4 bg-neon-blue/40 rounded-full border border-neon-blue flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-neon-blue rounded-full" />
                 </div>
              </motion.div>
              <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-neon-green/30 rounded-full border border-neon-green" />
              <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-neon-orange/30 rounded-full border border-neon-orange" />
              
              <div className="absolute bottom-12 right-12 z-20">
                 <button className="px-6 py-3 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 transition-all flex items-center gap-2">
                    <MapPin size={14} /> VIEW_GLOBAL_GRID
                 </button>
              </div>
           </div>
        </div>

        <div className="xl:col-span-3 glass-panel p-8 border-white/5 bg-cyber-black/40 space-y-6">
           <h3 className="text-xs font-black text-white uppercase tracking-widest italic mb-6">AI_Operational_Scan</h3>
           <div className="space-y-4">
              <AIControlNode icon={<ShieldCheck size={16} />} label="Security Protocol" status="Optimal" />
              <AIControlNode icon={<Filter size={16} />} label="Demand Prediction" status="Active" highlight />
              <AIControlNode icon={<Activity size={16} />} label="Fraud Detection" status="Scanning" pulse />
              <AIControlNode icon={<TrendingUp size={16} />} label="Volume Spike" status="+14% Expected" />
           </div>
           <button className="w-full mt-6 py-4 border border-white/10 text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] italic hover:text-white hover:bg-white/5 transition-all">
             RUN_FULL_SYSTEM_DIAGNOSTIC
           </button>
        </div>
      </div>
    </div>
  );
}

function VerificationNode({ label, status }: { label: string, status: string | undefined }) {
  const isVerified = status === 'Verified';
  return (
    <div className={cn(
      "p-4 border rounded-sm flex flex-col items-center justify-center gap-3 group hover:scale-[1.02] transition-all cursor-pointer",
      isVerified ? "border-neon-green/20 bg-neon-green/5 text-neon-green" : "border-neon-orange/20 bg-neon-orange/5 text-neon-orange shadow-[0_0_15px_rgba(245,158,11,0.05)]"
    )}>
       <div className={cn("w-10 h-10 rounded border flex items-center justify-center", isVerified ? "border-neon-green/30 bg-neon-green/10" : "border-neon-orange/30 bg-neon-orange/10")}>
          {isVerified ? <ShieldCheck size={20} /> : <Clock size={20} className="animate-pulse" />}
       </div>
       <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-tight text-white mb-1">{label}</span>
          <span className="text-[9px] font-mono tracking-widest uppercase opacity-60">{status}</span>
       </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string, value: string | undefined }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 group hover:bg-white/[0.02] px-2 transition-all">
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
       <span className="text-[10px] font-mono text-white font-bold">{value}</span>
    </div>
  );
}

function MiniPerformanceStat({ label, value, delta, color }: { label: string, value: string, delta: string, color: string }) {
  const colorMap: any = {
    blue: 'text-neon-blue',
    green: 'text-neon-green',
    cyan: 'text-neon-cyan',
    purple: 'text-purple-400'
  };
  return (
    <div className="group">
       <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{label}</div>
       <div className="flex items-end gap-2">
          <div className="text-xl font-black text-white font-mono tracking-tighter">{value}</div>
          <div className={cn("text-[9px] font-mono font-black mb-1", colorMap[color])}>{delta}</div>
       </div>
    </div>
  );
}

function AIControlNode({ icon, label, status, highlight, pulse }: { icon: React.ReactNode, label: string, status: string, highlight?: boolean, pulse?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 glass-panel border-white/5 hover:border-white/20 transition-all cursor-pointer group",
      highlight && "border-neon-cyan/20 bg-neon-cyan/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
    )}>
       <div className={cn(
         "w-10 h-10 rounded border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-white/20 transition-all",
         highlight && "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10"
       )}>
          {icon}
       </div>
       <div className="flex-1">
          <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1.5">{label}</div>
          <div className="flex items-center gap-2">
             <div className={cn("w-1.5 h-1.5 rounded-full", pulse ? "bg-neon-red animate-ping" : (highlight ? "bg-neon-cyan" : "bg-neon-green"))} />
             <span className={cn("text-[8px] font-mono uppercase tracking-widest font-bold", highlight ? "text-neon-cyan" : "text-slate-500")}>{status}</span>
          </div>
       </div>
    </div>
  );
}

// --- Rider Management Components ---

const RIDERS_MOCK = [
  {
    id: "RF-10001",
    name: "Aman Kumar",
    phone: "+91 91234 56789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman",
    status: "ONLINE",
    area: "Patna East",
    city: "Patna",
    vehicle: { type: "Bike", number: "BR01XZ4921", model: "Hero Splendor+" },
    rating: 4.8,
    reviews: 128,
    completedOrders: 248,
    todayOrders: 18,
    earnings: "₹18,450",
    todayEarnings: "₹1,250",
    joinedDate: "12 Jan 2025",
    email: "aman.kumar@gmail.com",
    refCode: "RF10001",
    emergencyContact: "+91 98765 43210",
    docs: { license: "VALID", insurance: "VALID", rc: "VALID", kyc: "VALID" },
    rcExpiry: "12 Jan 2027",
    completionRate: "96%"
  },
  {
    id: "RF-10002",
    name: "Rohit Singh",
    phone: "+91 91234 67890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
    status: "BUSY",
    area: "Danapur",
    city: "Patna",
    vehicle: { type: "Bike", number: "BR01AB1234", model: "TVS Raider" },
    rating: 4.7,
    reviews: 96,
    completedOrders: 196,
    todayOrders: 12,
    earnings: "₹14,860",
    todayEarnings: "₹980",
    joinedDate: "15 Feb 2025",
    email: "rohit.singh@gmail.com",
    refCode: "RF10002",
    emergencyContact: "+91 98765 43211",
    docs: { license: "VALID", insurance: "VALID", rc: "VALID", kyc: "VALID" },
    rcExpiry: "15 Feb 2027",
    completionRate: "94%"
  },
  {
    id: "RF-10003",
    name: "Vikash Kumar",
    phone: "+91 91234 78901",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikash",
    status: "IDLE",
    area: "Patliputra",
    city: "Patna",
    vehicle: { type: "Bike", number: "BR01CD5678", model: "Honda Shine" },
    rating: 4.6,
    reviews: 78,
    completedOrders: 134,
    todayOrders: 6,
    earnings: "₹9,750",
    todayEarnings: "₹620",
    joinedDate: "10 Mar 2025",
    email: "vikash.k@gmail.com",
    refCode: "RF10003",
    emergencyContact: "+91 98765 43212",
    docs: { license: "EXPIRED", insurance: "VALID", rc: "VALID", kyc: "VALID" },
    rcExpiry: "10 Mar 2027",
    completionRate: "92%"
  },
  {
    id: "RF-10004",
    name: "Sanjay Paswan",
    phone: "+91 91234 89012",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay",
    status: "OFFLINE",
    area: "Boring Road",
    city: "Patna",
    vehicle: { type: "Bike", number: "BR01EF9012", model: "Bajaj Platina" },
    rating: 4.5,
    reviews: 66,
    completedOrders: 112,
    todayOrders: 4,
    earnings: "₹8,230",
    todayEarnings: "₹410",
    joinedDate: "05 Apr 2025",
    email: "sanjay.p@gmail.com",
    refCode: "RF10004",
    emergencyContact: "+91 98765 43213",
    docs: { license: "VALID", insurance: "VALID", rc: "REJECTED", kyc: "VALID" },
    rcExpiry: "05 Apr 2027",
    completionRate: "90%"
  },
  {
    id: "RF-10005",
    name: "Prince Kumar",
    phone: "+91 91234 90123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prince",
    status: "ONLINE",
    area: "Bailey Road",
    city: "Patna",
    vehicle: { type: "Scooter", number: "BR01GH3456", model: "Activa 6G" },
    rating: 4.9,
    reviews: 154,
    completedOrders: 312,
    todayOrders: 22,
    earnings: "₹22,680",
    todayEarnings: "₹1,840",
    joinedDate: "20 May 2025",
    email: "prince.k@gmail.com",
    refCode: "RF10005",
    emergencyContact: "+91 98765 43214",
    docs: { license: "VALID", insurance: "VALID", rc: "VALID", kyc: "VALID" },
    rcExpiry: "20 May 2027",
    completionRate: "98%"
  }
];

const RIDER_VERIFICATION_STATS = [
  { name: 'Verified', value: 40, color: '#4ade80' },
  { name: 'Pending', value: 2, color: '#f97316' },
  { name: 'Rejected', value: 0, color: '#ef4444' },
];

const RIDER_DISTRIBUTION_DATA = [
  { name: 'Patna East', value: 18, color: '#38bdf8' },
  { name: 'Patna West', value: 12, color: '#22d3ee' },
  { name: 'Patna Central', value: 7, color: '#4ade80' },
  { name: 'Other Areas', value: 5, color: '#a855f7' },
];

const DOCUMENT_EXPIRY_DATA = [
  { label: 'Driving License', count: 3, expiry: 'Expiring in 15 days', color: 'orange' },
  { label: 'RC Certificate', count: 2, expiry: 'Expiring in 15 days', color: 'orange' },
  { label: 'Insurance', count: 1, expiry: 'Expiring in 15 days', color: 'red' },
];

function RiderManagement() {
  const { riders, loading, createRider, updateRiderProfile, deactivateRider, activateRider } = useRiders();
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [editRiderId, setEditRiderId] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    if (selectedRider) {
      setEditRiderId(selectedRider.riderId || '');
      setEditRating(Number(selectedRider.rating) || 0);
    }
  }, [selectedRider]);

  useEffect(() => {
    if (selectedRider) {
      const updatedRider = riders.find(r => r.id === selectedRider.id);
      if (updatedRider && JSON.stringify(updatedRider) !== JSON.stringify(selectedRider)) {
        setSelectedRider(updatedRider);
      }
    }
  }, [riders]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddRiderModalOpen, setIsAddRiderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredRiders = riders.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <AddRiderModal 
        isOpen={isAddRiderModalOpen} 
        onClose={() => setIsAddRiderModalOpen(false)} 
        createRider={createRider} 
      />
      <MatrixRain />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Users size={12} /> RAjFleet_RIDER_COMMAND_CENTER_NODE
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
            RIDER <span className="text-neon-cyan">MANAGEMENT</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">OPS_v4.2.1</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl">
            Hyper-scale rider lifecycle & compliance monitoring system.
            <span className="text-neon-cyan ml-2 italic underline underline-offset-4 decoration-neon-cyan/30">Fleet intelligence matrix operational.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatusIndicator label="SYSTEM_HEALTH" value="OPTIMAL" color="green" />
          <StatusIndicator label="RIDERS_ONLINE" value="432" color="cyan" />
          <StatusIndicator label="AVG_RATING" value="4.8" color="cyan" />
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10 font-sans">
        <RiderMetricCard label="Online Riders" value="432" delta="12%" trend="up" icon={<Users />} color="green" />
        <RiderMetricCard label="Busy Riders" value="184" delta="8%" trend="up" icon={<Activity />} color="blue" />
        <RiderMetricCard label="Idle Riders" value="64" delta="5%" trend="down" icon={<Clock />} color="orange" />
        <RiderMetricCard label="Inactive Riders" value="28" delta="2%" trend="up" icon={<Ban />} color="red" />
        <RiderMetricCard label="Avg Rating" value="4.8" delta="0.2" trend="up" icon={<Star />} color="purple" />
        <RiderMetricCard label="Verified Riders" value="96%" delta="1.5%" trend="up" icon={<ShieldCheck />} color="cyan" />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between glass-panel p-3 border-white/5 bg-cyber-black/80 relative z-10">
        <div className="flex flex-wrap gap-2">
          {['Status', 'City', 'Area', 'Vehicle', 'Documents', 'Ratings'].map(filter => (
            <button key={filter} className="flex items-center gap-3 px-4 py-2 border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all rounded-sm">
              {filter} <ChevronRight size={10} className="rotate-90 opacity-40" />
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 border border-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-white/5 transition-all">
            <Filter size={12} /> Filters
          </button>
          <div className="relative group/search ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-neon-cyan transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search Rider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cyber-black/60 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-cyan/50 w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddRiderModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] transition-all"
          >
            <Users size={14} /> Add Rider
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
            Bulk Actions <ChevronRight size={14} className="rotate-90" />
          </button>
          <button className="p-2.5 border border-white/10 text-white rounded-sm hover:bg-white/5 transition-all">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 font-sans">
        {/* Riders Table Area */}
        <div className={cn("transition-all duration-700", isDetailOpen ? "lg:col-span-8" : "lg:col-span-12")}>
          <div className="glass-panel border-white/5 bg-cyber-black/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
                    <th className="px-6 py-4 text-left w-10">
                      <div className="w-4 h-4 border border-white/20 rounded-sm" />
                    </th>
                    <th className="px-6 py-4 text-left">Rider Details</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Vehicle</th>
                    <th className="px-6 py-4 text-left">Rating</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Orders</th>
                    <th className="px-6 py-4 text-left">Earnings</th>
                    <th className="px-6 py-4 text-left">Documents</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRiders.map(rider => (
                    <tr 
                      key={rider.id}
                      onClick={() => { setSelectedRider(rider); setIsDetailOpen(true); }}
                      className={cn(
                        "group hover:bg-white/[0.03] transition-all cursor-pointer",
                        selectedRider?.id === rider.id ? "bg-neon-cyan/[0.03] border-l-2 border-l-neon-cyan" : ""
                      )}
                    >
                      <td className="px-6 py-6 font-black">
                        <div className="w-4 h-4 border border-white/20 rounded-sm group-hover:border-neon-cyan/50" />
                      </td>
                      <td className="px-6 py-6 font-black">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img src={rider.avatar} alt={rider.name} className="w-12 h-12 rounded-full border border-white/10 bg-cyber-deep" />
                            <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cyber-black", 
                              rider.status === 'ONLINE' ? "bg-neon-green" : 
                              rider.status === 'BUSY' ? "bg-neon-blue" : "bg-slate-600"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-[11px] font-black text-white uppercase italic tracking-widest">{rider.name}</div>
                              <Verified size={10} className="text-neon-cyan" />
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 mt-1">{rider.id} • {rider.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black">
                        <StatusPill status={rider.status} />
                      </td>
                      <td className="px-6 py-6 font-black">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest font-sans">{rider.vehicle?.type || 'BIKE'}</div>
                        <div className="text-[9px] font-mono text-slate-500 mt-1">{rider.vehicle?.number || 'PENDING'}</div>
                        <div className="text-[8px] font-mono text-slate-600 uppercase">{rider.vehicle?.model || 'STANDARD'}</div>
                      </td>
                      <td className="px-6 py-6 font-black">
                        <div className="flex items-center gap-1.5">
                          <Star size={12} className="text-neon-cyan fill-neon-cyan/20" />
                          <span className="text-[11px] font-black text-white font-mono">{rider.rating}</span>
                        </div>
                        <div className="text-[8px] font-mono text-slate-500 mt-1">({rider.reviews} reviews)</div>
                      </td>
                      <td className="px-6 py-6 font-black">
                        <div className="text-[11px] font-black text-white font-mono">{rider.completedOrders}</div>
                        <div className="text-[9px] font-mono text-neon-green mt-1">+{rider.todayOrders} today</div>
                      </td>
                      <td className="px-6 py-6 font-black">
                        <div className="text-[11px] font-black text-white font-mono">{rider.earnings}</div>
                        <div className="text-[9px] font-mono text-neon-cyan mt-1">+{rider.todayEarnings} today</div>
                      </td>
                      <td className="px-6 py-6 font-black">
                         <div className="flex gap-1.5 font-black">
                           <DocIcon status={rider.docs?.license || 'PENDING'} icon={<FileText size={10} />} />
                           <DocIcon status={rider.docs?.insurance || 'PENDING'} icon={<Shield size={10} />} />
                           <DocIcon status={rider.docs?.rc || 'PENDING'} icon={<CreditCard size={10} />} />
                           <DocIcon status={rider.docs?.kyc || 'PENDING'} icon={<Fingerprint size={10} />} />
                         </div>
                      </td>
                      <td className="px-6 py-6 text-right font-black">
                        <button className="p-2 border border-white/5 rounded-sm hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-cyber-black/60 flex items-center justify-between font-mono">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                Showing {riders.length} active riders
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, '...', 44].map((p, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "w-8 h-8 flex items-center justify-center text-[10px] font-black transition-all",
                      p === 1 ? "bg-neon-cyan text-cyber-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-slate-500 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Detail Panel */}
        <AnimatePresence>
          {isDetailOpen && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="lg:col-span-4"
            >
              <div className="glass-panel border-white/5 bg-cyber-black/60 h-full flex flex-col relative overflow-hidden group/panel">
                <div className="absolute top-0 right-0 p-4 z-20">
                  <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <RotateCcw size={18} className="rotate-45" />
                  </button>
                </div>

                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-neon-cyan/10 to-transparent relative">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative group/photo cursor-pointer" onClick={() => (document.getElementById('avatar-upload') as HTMLInputElement)?.click()}>
                       <div className="absolute inset-0 bg-neon-cyan blur-[20px] opacity-20 rounded-full animate-pulse" />
                       <img src={selectedRider?.avatar || '/default-rider.png'} alt={selectedRider?.name} className="w-24 h-24 rounded-full border-2 border-neon-cyan/50 bg-cyber-black relative z-10 object-cover" />
                       <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity z-20">
                         <Upload size={24} className="text-white" />
                       </div>
                       <input id="avatar-upload" type="file" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if(file) {
                             // Simulating upload
                             toast.loading("Uploading photo...");
                             setTimeout(() => {
                                selectedRider && updateRiderProfile(selectedRider.id, { avatar: URL.createObjectURL(file) });
                                toast.dismiss();
                                toast.success("Photo updated");
                             }, 1500);
                          }
                       }} />
                       <div className={cn("absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-cyber-black z-20", 
                        selectedRider?.status === 'ONLINE' ? "bg-neon-green" : 
                        selectedRider?.status === 'BUSY' ? "bg-neon-blue" : "bg-slate-600"
                      )} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-orbitron">{selectedRider?.name} <Verified size={16} className="inline ml-1 text-neon-cyan" /></h2>
                      <div className="text-[10px] font-mono text-neon-cyan uppercase tracking-[0.3em] mt-2">{selectedRider?.riderId || 'ID: UNSET'}</div>
                      {selectedRider?.dateOfBirth && 
                        new Date(selectedRider.dateOfBirth).getDate() === new Date().getDate() && 
                        new Date(selectedRider.dateOfBirth).getMonth() === new Date().getMonth() && (
                          <div className="mt-3 p-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm text-neon-cyan text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
                            🎂 HAPPY BIRTHDAY, {selectedRider?.name.split(' ')[0]}! 🎂
                          </div>
                      )}
                      <div className="flex items-center justify-center gap-3 mt-4">
                         <div className="flex items-center gap-1.5 text-neon-cyan font-black">
                           <Star size={14} className="fill-neon-cyan/20" />
                           <span className="text-sm font-mono">{selectedRider?.rating || 'N/A'}</span>
                         </div>
                         <div className="h-4 w-px bg-white/10" />
                         <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{selectedRider?.area || 'UNASSIGNED'}</div>
                      </div>
                    </div>
                     <div className="flex gap-3 w-full mt-6">
                       <button 
                         onClick={() => (window as any).triggerCall(selectedRider)}
                         className="flex-1 flex items-center justify-center gap-2 py-3 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:scale-105 transition-all"
                       >
                         <Phone size={14} /> Call
                       </button>
                       <button 
                         onClick={() => toast.success(`Opening chat with ${selectedRider.name}...`)}
                         className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest italic rounded-sm border border-white/10 hover:bg-white/10 transition-all"
                       >
                         <MessageSquare size={14} /> Message
                       </button>
                     </div>
                  </div>
                </div>

                {/* Extended Details */}
                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoCard label="Total Orders" value={selectedRider?.completedOrders || 0} />
                            <InfoCard label="Wallet" value={`₹${selectedRider?.walletBalance || 0}`} />
                            <InfoCard label="Shift" value={selectedRider.shift || "DAY"} />
                            <InfoCard label="Vehicle" value={selectedRider.vehicle?.type || selectedRider?.vehicleType || "BIKE"} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  <DetailSection title="RIDER_INFORMATION">
                    <InfoRow label="Phone Number" value={selectedRider?.phone} isPhone onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { phone: val })} />
                    <InfoRow label="Email Address" value={selectedRider?.email} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { email: val })} />
                    <InfoRow label="Date of Birth" value={selectedRider?.dateOfBirth || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { dateOfBirth: val })} />
                    <InfoRow label="Date of Joining" value={selectedRider?.dateOfJoining || selectedRider?.joinedDate} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { dateOfJoining: val })} />
                    <InfoRow label="Ref Code" value={selectedRider?.referralCode || selectedRider?.refCode} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { referralCode: val })} />
                    <InfoRow label="Emergency Contact" value={selectedRider?.emergencyContact} isPhone onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { emergencyContact: val })} />
                  </DetailSection>

                  <DetailSection title="VEHICLE_INTEL">
                    <InfoRow label="Vehicle Type" value={selectedRider?.vehicleType || 'BIKE'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { vehicleType: val })} />
                    <InfoRow label="Brand" value={selectedRider?.brand || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { brand: val })} />
                    <InfoRow label="Model" value={selectedRider?.model || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { model: val })} />
                    <InfoRow label="Color" value={selectedRider?.color || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { color: val })} />
                    <InfoRow label="Year" value={selectedRider?.dob || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { dob: val })} />
                    <InfoRow label="Reg. State" value={selectedRider?.registrationState || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { registrationState: val })} />
                    <InfoRow label="Number Plate" value={selectedRider?.numberPlate || 'PENDING'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { numberPlate: val })} />
                    <InfoRow label="Chassis Number" value={selectedRider?.chassisNumber || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { chassisNumber: val })} />
                    <InfoRow label="DL Number" value={selectedRider?.dlNumber || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { dlNumber: val })} />
                    <InfoRow label="DL Expiry" value={selectedRider?.dlExpiry || 'N/A'} status={selectedRider?.dlExpiry && new Date(selectedRider.dlExpiry) < new Date() ? 'EXPIRED' : 'VALID'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { dlExpiry: val })} />
                    <InfoRow label="RC Number" value={selectedRider?.rcNumber || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { rcNumber: val })} />
                    <InfoRow label="RC Validity" value={selectedRider?.rcExpiry || 'N/A'} status={selectedRider?.rcExpiry && new Date(selectedRider.rcExpiry) < new Date() ? 'EXPIRED' : 'VALID'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { rcExpiry: val })} />
                    <InfoRow label="Insurance Number" value={selectedRider?.insuranceNumber || 'N/A'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { insuranceNumber: val })} />
                    <InfoRow label="Insurance Expiry" value={selectedRider?.insuranceExpiry || 'N/A'} status={selectedRider?.insuranceExpiry && new Date(selectedRider.insuranceExpiry) < new Date() ? 'EXPIRED' : 'VALID'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { insuranceExpiry: val })} />
                    <InfoRow label="Pollution Validity" value={selectedRider?.pollutionExpiry || 'N/A'} status={selectedRider?.pollutionExpiry && new Date(selectedRider.pollutionExpiry) < new Date() ? 'EXPIRED' : 'VALID'} onEdit={(val) => selectedRider && updateRiderProfile(selectedRider.id, { pollutionExpiry: val })} />
                  </DetailSection>

                  <DetailSection title="PERFORMANCE_METRICS">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Total Orders</div>
                        <div className="text-sm font-black text-white font-mono">{selectedRider?.completedOrders || 0}</div>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Completion %</div>
                        <div className="text-sm font-black text-neon-green font-mono">{selectedRider?.completionRate || '100%'}</div>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Avg Rating</div>
                        <div className="text-sm font-black text-neon-cyan font-mono">{selectedRider?.rating || '5.0'}</div>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Lifetime Earnings</div>
                        <div className="text-sm font-black text-white font-mono">{selectedRider?.earnings || '₹0'}</div>
                      </div>
                    </div>
                  </DetailSection>

                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <input 
                          className="flex-1 bg-white/5 border border-white/10 p-3 text-sm text-white" 
                          placeholder="Rider ID"
                          value={editRiderId}
                          onChange={(e) => setEditRiderId(e.target.value)}
                      />
                      <button 
                          onClick={() => selectedRider && updateRiderProfile(selectedRider.id, { riderId: editRiderId })}
                          className="px-4 py-3 bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan text-xs font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-cyan hover:text-cyber-black transition-all"
                      >
                          SAVE ID
                      </button>
                    </div>
                
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rating</span>
                      <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                  key={star}
                                  onClick={() => {
                                      setEditRating(star);
                                      selectedRider && updateRiderProfile(selectedRider.id, { rating: star.toString() });
                                  }}
                                  className={cn("text-xl transition-all", star <= editRating ? "text-neon-cyan" : "text-slate-600")}
                              >
                                  <Star size={20} className={star <= editRating ? "fill-neon-cyan" : ""} />
                              </button>
                          ))}
                      </div>
                    </div>
                    {selectedRider?.status === 'DEACTIVATED' ? (
                      <button 
                        onClick={() => selectedRider && activateRider(selectedRider.id)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[11px] font-black uppercase tracking-widest italic hover:bg-neon-green hover:text-cyber-black transition-all">
                        <span>ACTIVATE RIDER</span>
                        <CheckCircle size={14} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => selectedRider && deactivateRider(selectedRider.id)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-neon-red/10 border border-neon-red/30 text-neon-red text-[11px] font-black uppercase tracking-widest italic hover:bg-neon-red hover:text-cyber-black transition-all">
                        <span>BLOCK / DEACTIVATE RIDER</span>
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 font-sans">
        <div className="glass-panel p-6 bg-cyber-black/40">
           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 italic">Rider_Verification_Overview</h3>
           <div className="h-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={RIDER_VERIFICATION_STATS} innerRadius={45} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none">
                       {RIDER_VERIFICATION_STATS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-sans">
                 <div className="text-xl font-black text-white font-mono">96%</div>
                 <div className="text-[8px] font-mono text-slate-500 uppercase">Verified</div>
              </div>
           </div>
           <div className="mt-6 space-y-2 font-mono">
              {RIDER_VERIFICATION_STATS.map(stat => (
                <div key={stat.name} className="flex justify-between items-center font-black">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest">{stat.name}</span>
                   </div>
                   <span className="text-[9px] text-white">{stat.value} ({Math.round(stat.value / 42 * 100)}%)</span>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-panel p-6 bg-cyber-black/40">
           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 italic">Document_Expiry_Alerts</h3>
           <div className="space-y-4">
              {DOCUMENT_EXPIRY_DATA.map((alert, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-sm flex items-start gap-3 group hover:border-neon-orange/30 transition-all cursor-pointer">
                   <div className={cn("mt-1 shrink-0", alert.color === 'orange' ? 'text-neon-orange' : 'text-neon-red')}>
                      <AlertCircle size={14} className={alert.color === 'red' ? 'animate-pulse' : ''} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] font-black text-white uppercase">{alert.label}</span>
                         <span className="text-[9px] font-mono text-neon-orange font-bold font-black">{alert.count}</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{alert.expiry}</div>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-4 text-[9px] font-mono text-neon-cyan uppercase hover:underline text-center">View All Alerts</button>
        </div>

        <div className="glass-panel p-6 bg-cyber-black/40">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Top_Performing_Riders</h3>
              <button className="text-[9px] font-mono text-neon-cyan uppercase hover:underline">View All</button>
           </div>
           <div className="space-y-4">
              {riders.slice(0, 3).map((rider, i) => (
                <div key={rider.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-700 italic">{i + 1}</span>
                      <img src={rider.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                      <div>
                         <div className="text-[10px] font-black text-white uppercase tracking-widest">{rider.name}</div>
                         <div className="text-[8px] font-mono text-slate-500 uppercase truncate w-24">{rider.completedOrders} Orders</div>
                      </div>
                   </div>
                   <div className="text-[9px] font-black text-neon-cyan italic">★ {rider.rating}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-panel p-6 bg-cyber-black/40">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Rider_Distribution</h3>
              <button className="text-[9px] font-mono text-neon-cyan uppercase hover:underline">View Report</button>
           </div>
           <div className="h-32 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={RIDER_DISTRIBUTION_DATA} innerRadius={40} outerRadius={50} paddingAngle={10} dataKey="value" stroke="none">
                       {RIDER_DISTRIBUTION_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-sans">
                 <div className="text-xl font-black text-white font-mono leading-none">42</div>
                 <div className="text-[7px] font-mono text-slate-500 uppercase">Total Riders</div>
              </div>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-2 font-mono">
              {RIDER_DISTRIBUTION_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between font-black">
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[8px] text-slate-500 uppercase tracking-tighter truncate w-16">{d.name}</span>
                   </div>
                   <span className="text-[8px] text-white">{d.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function RiderMetricCard({ label, value, delta, trend, icon, color }: { label: string, value: string, delta: string, trend: 'up' | 'down', icon: React.ReactNode, color: string }) {
  const colorThemes: any = {
    red: 'border-neon-red/30 text-neon-red bg-neon-red/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]',
    orange: 'border-neon-orange/20 text-neon-orange bg-neon-orange/5',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
    blue: 'border-neon-blue/20 text-neon-blue bg-neon-blue/5',
    green: 'border-neon-green/20 text-neon-green bg-neon-green/5',
    cyan: 'border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5'
  };

  return (
    <div className={cn("glass-panel p-5 relative overflow-hidden group hover:scale-[1.02] transition-all", colorThemes[color])}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-sm bg-cyber-black/60 border border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]">
            {icon}
          </div>
          <div className={cn("text-[9px] font-mono font-black", trend === 'up' ? 'text-neon-green' : 'text-neon-red')}>
            {trend === 'up' ? '↑' : '↓'} {delta}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">{label}</div>
          <div className="text-3xl font-black italic tracking-tighter uppercase font-orbitron text-white group-hover:neon-text-blue transition-all duration-500 mt-1">{value}</div>
          <div className="h-[20px] w-full mt-2 relative">
             <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10", trend === 'up' ? 'text-neon-green' : 'text-neon-red')} />
             {/* Tiny Mock Graph */}
             <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 overflow-hidden">
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className={cn("w-1/2 h-full", trend === 'up' ? 'bg-neon-green' : 'bg-neon-red')} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: any = {
    ONLINE: 'bg-neon-green/10 text-neon-green border-neon-green/30 px-3',
    BUSY: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30 px-3',
    IDLE: 'bg-neon-orange/10 text-neon-orange border-neon-orange/30 px-4',
    OFFLINE: 'bg-white/5 text-slate-500 border-white/10 px-3',
    INACTIVE: 'bg-neon-red/10 text-neon-red border-neon-red/30 px-3'
  };
  return (
    <div className={cn("py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-dashed flex items-center justify-center gap-2", styles[status])}>
       <div className={cn("w-1 h-1 rounded-full font-sans", status === 'OFFLINE' ? 'bg-slate-700' : 'bg-current animate-pulse')} />
       {status}
    </div>
  );
}

function DocIcon({ status, icon }: { status: string, icon: React.ReactNode }) {
  const colors: any = {
     VALID: 'text-neon-green bg-neon-green/10 border-neon-green/30',
     EXPIRED: 'text-neon-orange bg-neon-orange/10 border-neon-orange/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
     REJECTED: 'text-neon-red bg-neon-red/10 border-neon-red/30',
  };
  return (
    <div className={cn("w-7 h-7 rounded flex items-center justify-center border transition-all cursor-help hover:scale-110", colors[status] || 'text-slate-700 border-white/5')}>
       {icon}
    </div>
  );
}

function DetailSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-2 group-hover:neon-text-blue transition-colors">
        <div className="w-1.5 h-1.5 bg-neon-cyan rotate-45 font-sans" /> {title}
      </h3>
      <div className="space-y-3 font-sans">
        {children}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white/5 border border-white/5 p-4 rounded-sm">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{label}</div>
            <div className="text-sm font-black text-white mt-1">{value}</div>
        </div>
    );
}

function InfoRow({ label, value, isPhone, status, onEdit }: { label: string, value: string | undefined, isPhone?: boolean, status?: string, onEdit?: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 group transition-colors hover:bg-white/[0.02] px-2 rounded-sm cursor-default">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors font-sans">{label}</span>
      <div className="flex items-center gap-2 font-sans">
         {status && <div className={cn("w-1.5 h-1.5 rounded-full", status === 'VALID' ? 'bg-neon-green' : 'bg-neon-red')} />}
         {isEditing ? (
            <input 
              className="text-[10px] font-mono text-white bg-white/10 border border-white/20 p-1 rounded-sm w-32"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (tempValue !== value) onEdit?.(tempValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (tempValue !== value) onEdit?.(tempValue);
                }
              }}
              autoFocus
            />
         ) : (
            <span className={cn("text-[10px] font-mono text-white font-bold", isPhone && "text-neon-cyan")}>{value}</span>
         )}
         {onEdit && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-neon-cyan">
              <Edit3 size={10} />
            </button>
         )}
         {isPhone && !isEditing && value && (
            <button 
              onClick={() => (window as any).triggerCall({ name: value })}
              className="w-6 h-6 rounded-sm bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue hover:bg-neon-blue hover:text-cyber-black transition-all cursor-pointer"
            >
              <Phone size={10} />
            </button>
         )}
      </div>
    </div>
  );
}

// --- Rider Verification Components ---

function RiderVerification() {
  const { riders, verifyRider } = useRiders();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  const pendingRiders = riders.filter(r => r.status === 'PENDING_VERIFICATION' || !r.verified);
  
  useEffect(() => {
    if (pendingRiders.length > 0 && !selectedRider) {
      setSelectedRider(pendingRiders[0]);
    }
  }, [pendingRiders, selectedRider]);

  const handleVerify = async (riderId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await verifyRider(riderId, status, status === 'REJECTED' ? rejectionReason : undefined);
      if (status === 'REJECTED') setRejectionReason('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <ShieldCheck size={12} /> RAjFleet_VERIFICATION_COMMAND_NODE
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
            RIDER <span className="text-neon-cyan">VERIFICATION</span> 
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator label="PENDING_VER" value={pendingRiders.length.toString()} color="cyan" />
          <StatusIndicator label="SYSTEM_HEALTH" value="SECURE" color="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 font-sans">
        {/* Verification Queue */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           {pendingRiders.map(rider => (
             <div 
               key={rider.id}
               onClick={() => setSelectedRider(rider)}
               className={cn(
                 "glass-panel p-4 border-white/5 bg-cyber-black/80 cursor-pointer transition-all",
                 selectedRider?.id === rider.id ? "border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(56,189,248,0.1)]" : "hover:border-white/20"
               )}
             >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded border border-white/10 bg-white/5 flex items-center justify-center text-slate-500 font-black italic uppercase">
                      {rider.name.charAt(0)}
                   </div>
                   <div className="flex-1">
                      <div className="text-sm font-black text-white uppercase">{rider.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">ID: {rider.id.slice(0, 8)}</div>
                   </div>
                   <ChevronRight size={16} className="text-slate-700" />
                </div>
             </div>
           ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-8">
           {selectedRider ? (
             <div className="glass-panel p-8 border-white/5 bg-cyber-black/40 space-y-8">
                <div className="flex justify-between items-start">
                   <div className="flex gap-6">
                      <div className="w-24 h-24 rounded border border-neon-blue/20 bg-neon-blue/5 flex items-center justify-center text-4xl text-neon-blue font-black italic">
                         {selectedRider.name.charAt(0)}
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white uppercase italic">{selectedRider.name}</h2>
                         <div className="flex gap-4 mt-2">
                            <span className="text-xs font-mono text-slate-500">{selectedRider.phone || 'NO_PHONE_LINKED'}</span>
                            <span className="text-xs font-mono text-neon-cyan uppercase">PENDING_REVIEW</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => selectedRider && handleVerify(selectedRider.id, 'VERIFIED')}
                        className="px-8 py-3 bg-neon-green/20 border border-neon-green/40 text-neon-green text-xs font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-green hover:text-cyber-black transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                      >
                         ACCEPT PROTOCOL
                      </button>
                      <button className="px-8 py-3 bg-neon-red/10 border border-neon-red/30 text-neon-red text-xs font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all">
                         REJECT
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-white/5">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Matrix</h4>
                      <DocumentPreview label="AADHAAR_CARD" status="VERIFIED" />
                      <DocumentPreview label="DRIVING_LICENSE" status="PENDING_SCAN" onVerify={() => selectedRider && handleVerify(selectedRider.id, 'VERIFIED')} />
                      <DocumentPreview label="PAN_CARD" status="VERIFIED" />
                   </div>
                   <div>
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Verification Actions</h4>
                       <input 
                           className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white mb-4" 
                           placeholder="Rejection Reason (if rejecting)" 
                           value={rejectionReason} 
                           onChange={(e) => setRejectionReason(e.target.value)} 
                       />
                       <button onClick={() => selectedRider && handleVerify(selectedRider.id, 'REJECTED')} className="w-full py-3 bg-neon-red/10 border border-neon-red/30 text-neon-red text-xs font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all">REJECT RIDER</button>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle Telemetry</h4>
                      <div className="glass-panel p-4 bg-white/5 border-white/5 space-y-3">
                         <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-500 uppercase">Unit Type:</span>
                            <span className="text-white">MOTOR_BIKE</span>
                         </div>
                         <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-500 uppercase">Reg Number:</span>
                            <span className="text-neon-cyan">{selectedRider.vehicleNumber || 'UP-32-XX-XXXX'}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-96 flex flex-col items-center justify-center glass-panel border-white/5 bg-white/[0.02]">
                <ShieldCheck size={48} className="text-slate-800 mb-4 opacity-20" />
                <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">SELECT UNIT FOR ARCHIVE RETRIEVAL</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({ label, status, onVerify }: { label: string, status: string, onVerify?: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-sm group hover:border-neon-blue/30 transition-all">
      <div className="flex items-center gap-3">
        <FileText size={16} className="text-slate-500 group-hover:text-neon-blue" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter",
          status === 'VERIFIED' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-orange/20 text-neon-orange'
        )}>{status}</span>
        {status !== 'VERIFIED' && onVerify && (
            <button onClick={onVerify} className="text-[8px] px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan font-bold uppercase rounded-sm hover:bg-neon-cyan hover:text-cyber-black">Verify</button>
        )}
      </div>
    </div>
  );
}

function WorkspaceInfoItem({ label, value }: { label: string, value: string | undefined }) {
  return (
    <div className="font-mono">
       <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</div>
       <div className="text-[11px] text-white font-black uppercase">{value}</div>
    </div>
  );
}

function VerificationPill({ status }: { status: string }) {
  const styles: any = {
    PENDING: 'bg-neon-orange/10 text-neon-orange border-neon-orange/30',
    UNDER_REVIEW: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
    VERIFIED: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    REJECTED: 'bg-neon-red/10 text-neon-red border-neon-red/30',
  };
  return (
    <div className={cn("px-2.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border border-dashed", styles[status])}>
       {status.replace('_', ' ')}
    </div>
  );
}

function DocumentCard(props: any) {
  const { doc } = props;
  return (
    <div className="glass-panel border-white/5 bg-cyber-black/40 overflow-hidden group/doc transition-all hover:border-neon-cyan/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)]">
       <div className="p-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{doc.label}</span>
          <span className={cn("text-[8px] font-black uppercase tracking-widest", 
            doc.status === 'VERIFIED' ? 'text-neon-green' : 
            doc.status === 'PENDING' ? 'text-neon-orange' : 
            doc.status === 'REJECTED' ? 'text-neon-red' : 'text-neon-blue'
          )}>{doc.status.replace('_', ' ')}</span>
       </div>
       <div className="aspect-[4/3] relative overflow-hidden bg-cyber-deep group-hover/doc:cursor-zoom-in">
          <img src={doc.img} alt={doc.label} className="w-full h-full object-cover opacity-60 group-hover/doc:opacity-100 group-hover/doc:scale-110 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent opacity-60" />
          <div className="absolute inset-0 scan-line opacity-20 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/doc:opacity-100 transition-opacity">
             <div className="p-3 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                <Search size={20} />
             </div>
          </div>
       </div>
       <div className="p-4 space-y-2">
          <div className="text-[10px] font-mono text-white font-bold leading-none">{doc.ref}</div>
          <div className={cn("text-[8px] font-mono uppercase tracking-widest", 
             doc.status === 'VERIFIED' ? 'text-neon-green/60' : 'text-slate-500'
          )}>
             {doc.status === 'VERIFIED' ? `Verified on ${doc.date}` : `Submitted on ${doc.date}`}
          </div>
       </div>
    </div>
  );
}

const EMERGENCY_ORDERS_MOCK = [
  {
    id: "RF-28471",
    severity: "CRITICAL",
    store: "RAjHOME Express",
    category: "Medicine",
    address: "Patliputra Industrial Area, Patna",
    distance: "6.2 KM",
    eta: "18 mins",
    delay: "23 mins delay",
    status: "DELAYED",
    payout: "₹156",
    rider: {
      name: "Aman Kumar",
      vehicle: "Bike • BR01XZ4921",
      signal: "Low Signal",
      battery: "74%",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman"
    }
  },
  {
    id: "RF-28469",
    severity: "HIGH",
    store: "RAjHOME Mart",
    category: "Grocery",
    address: "Kankarbagh Main Road, Patna",
    distance: "4.8 KM",
    eta: "14 mins",
    delay: "15 mins delay",
    status: "DELAYED",
    payout: "₹128",
    rider: {
      name: "Rohit Singh",
      vehicle: "Bike • BR01AB1234",
      signal: "Optimal",
      battery: "Low Battery",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit"
    }
  },
  {
    id: "RF-28468",
    severity: "MEDIUM",
    store: "RAjHOME Express",
    category: "Electronics",
    address: "Boring Road Crossing, Patna",
    distance: "3.1 KM",
    eta: "11 mins",
    delay: "8 mins delay",
    status: "HEAVY TRAFFIC",
    payout: "₹110",
    rider: {
      name: "Vikash Kumar",
      vehicle: "Bike • BR01CD5678",
      signal: "Optimal",
      battery: "100%",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikash"
    }
  }
];

function EmergencyOrders() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(EMERGENCY_ORDERS_MOCK[0]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
      <MatrixRain />
      {/* Matrix Background Overlay (Subtle) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Emergency Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-neon-red/20 pb-8 gap-6 relative z-10">
        <div>
           <div className="flex items-center gap-3 text-[10px] font-mono text-neon-red uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
              <ShieldAlert size={12} /> RAjFleet_EMERGENCY_NETWORK_SECURE_NODE
           </div>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
              EMERGENCY <span className="text-neon-red">CENTER</span> <div className="h-8 w-[2px] bg-neon-red/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">OPERATIONAL_v2.4.0</span>
           </h1>
           <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl">
             Real-time critical delivery monitoring & strategic intervention system. 
             <span className="text-neon-red ml-2 italic underline underline-offset-4 decoration-neon-red/30">Hacker-grade response protocols active.</span>
           </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <StatusIndicator label="SYS_INTEGRITY" value="100%" color="green" />
           <StatusIndicator label="SEC_LATENCY" value="2.1ms" color="cyan" />
           <StatusIndicator label="NODE_STATUS" value="MASTER" color="red" />
        </div>
      </div>

      {/* Tactical KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
        <EmergencyKpiCard label="Active Incidents" value="3" sub="Immediate Attention" color="red" icon={<AlertCircle />} pulse />
        <EmergencyKpiCard label="Delayed Links" value="2" sub="> 10 mins delay" color="orange" icon={<Clock />} />
        <EmergencyKpiCard label="At Risk Hubs" value="8" sub="Predictive Analysis" color="purple" icon={<BrainCircuit />} />
        <EmergencyKpiCard label="Avg Response" value="12.4m" sub="Needs Improvement" color="blue" icon={<Activity />} />
        <EmergencyKpiCard label="Extra Flux" value="₹2,450" sub="Emergency Incentives" color="green" icon={<DollarSign />} />
      </div>

      {/* Operation Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between glass-panel p-3 border-white/5 bg-cyber-black/80 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative z-10">
        <div className="flex flex-wrap gap-1">
          {['ALL', 'DELAYED', 'AT_RISK', 'CRITICAL'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all italic rounded-sm relative group overflow-hidden",
                activeTab === tab 
                  ? "bg-neon-red text-cyber-black shadow-[0_0_25px_rgba(239,68,68,0.5)] z-10" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.replace('_', ' ')}
              {activeTab === tab && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-neon-red transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="TERMINAL_SEARCH_ID..."
              className="w-full bg-cyber-black border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-red/50 transition-all font-bold"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-neon-red/10 border border-neon-red/30 text-neon-red text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all">
             RE-SYNC_BUFFER
          </button>
        </div>
      </div>

      {/* Tactical Main Frame */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* Incident Feed */}
        <div className="xl:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-neon-red rounded-full animate-pulse" />
                 Active Emergency Buffer
              </h3>
              <div className="text-[9px] font-mono text-neon-red flex items-center gap-2">
                 <Radio size={10} className="animate-pulse" /> SCANNING_PORT_9921
              </div>
           </div>
           
           <div className="space-y-4">
              {EMERGENCY_ORDERS_MOCK.map(order => (
                <div key={order.id} onClick={() => setSelectedOrder(order)}>
                  <EmergencyIncidentCard order={order} isActive={selectedOrder?.id === order.id} />
                </div>
              ))}
           </div>
           
           {/* AI Insight Alert */}
           <div className="glass-panel border-purple-500/30 bg-purple-500/5 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BrainCircuit size={48} className="text-purple-400" />
              </div>
              <div className="w-16 h-16 rounded-sm bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                 <Zap size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 italic">Neural Recovery Recommendation</h4>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl">
                   AI detects traffic congestion pattern on <span className="text-purple-400">Boring Road</span>. Suggesting alternate route derivation for <span className="text-white">RF-28469</span> via bypass node 4.
                 </p>
              </div>
              <button className="px-8 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[10px] font-black uppercase tracking-widest italic hover:bg-purple-500 hover:text-white transition-all whitespace-nowrap">
                 ACTIVATE_RECOVERY
              </button>
           </div>
        </div>

        {/* Tactical Intel Sidebar */}
        <div className="xl:col-span-4 space-y-8">
           {/* Cyber Map Telemetry */}
           <div className="glass-panel border-neon-red/20 p-1 relative overflow-hidden bg-cyber-black h-[450px] group">
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              
              <div className="relative z-10 h-full flex flex-col">
                 <div className="p-4 flex items-center justify-between border-b border-white/5 bg-cyber-black/90">
                    <div className="flex items-center gap-2">
                       <Map size={14} className="text-neon-red animate-pulse" />
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">EMERGENCY_TACTICAL_HUD</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-neon-red bg-neon-red/10 px-2 py-0.5 border border-neon-red/20">
                       LIVE_GRID_v4
                    </div>
                 </div>
                 
                 <div className="flex-1 relative bg-slate-900/40 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-40">
                       <circle cx="50%" cy="50%" r="150" fill="none" stroke="currentColor" className="text-neon-red/5" strokeDasharray="10,10" />
                       <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" className="text-neon-red/10" strokeDasharray="5,5" />
                       <path d="M 0 50% L 100% 50%" stroke="currentColor" className="text-white/5" />
                       <path d="M 50% 0 L 50% 100%" stroke="currentColor" className="text-white/5" />
                       
                       {/* Animated Radar Sweep */}
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                         className="absolute inset-0 pointer-events-none"
                         style={{ originX: '50%', originY: '50%' }}
                       >
                          <div className="w-1/2 h-full bg-gradient-to-r from-neon-red/20 to-transparent" />
                       </motion.div>
                    </svg>

                    {/* Active Incident Markers */}
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.5, 1],
                         opacity: [0.5, 1, 0.5]
                       }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute top-1/4 right-1/3 w-4 h-4 bg-neon-red/40 rounded-full border border-neon-red"
                    />
                    <div className="absolute top-1/4 right-1/3 -translate-y-6 text-[8px] font-mono text-neon-red font-black">RF-28471_CRITICAL</div>

                    <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-neon-orange/40 rounded-full border border-neon-orange" />
                    <div className="absolute bottom-1/3 left-1/4 translate-y-6 text-[8px] font-mono text-neon-orange font-black">RF-28469_WARN</div>
                 </div>
                 
                 <div className="p-4 bg-cyber-black/95 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[9px] font-mono text-slate-500 uppercase">Selected Order Info</span>
                       <span className="text-[9px] font-mono text-neon-red uppercase">{selectedOrder?.id}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-sm bg-neon-red/10 border border-neon-red/30 flex items-center justify-center text-neon-red">
                          <Radio size={24} className="animate-pulse" />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-black text-white mb-1 uppercase">
                             <span>RIDER_SIGNAL</span>
                             <span className={cn(selectedOrder?.rider.signal === 'Optimal' ? 'text-neon-green' : 'text-neon-red')}>
                               {selectedOrder?.rider.signal}
                             </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className={cn("h-full transition-all duration-1000", selectedOrder?.rider.signal === 'Optimal' ? 'bg-neon-green w-full' : 'bg-neon-red w-1/3 animate-pulse')} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Emergency Rider Statistics */}
           <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic mb-6">Fleet_Status_Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                 <EmergencyRiderMiniStat label="ACTIVE" value="42" color="green" />
                 <EmergencyRiderMiniStat label="EMERGENCY" value="3" color="red" />
                 <EmergencyRiderMiniStat label="LOW_SIGNAL" value="1" color="orange" />
                 <EmergencyRiderMiniStat label="IDLE_UNITS" value="8" color="slate" />
              </div>
              <button className="w-full mt-6 py-3 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic hover:text-white hover:bg-white/5 transition-all">
                VIEW_ALL_RIDER_NODES
              </button>
           </div>

           {/* Emergency Command Center Actions */}
           <div className="glass-panel border-neon-red/20 bg-neon-red/5 p-6 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ZapOff size={16} className="text-neon-red" /> TACTICAL_COMMAND_CENTER
              </h3>
              <div className="grid grid-cols-1 gap-3">
                 <button className="flex items-center gap-3 px-6 py-4 bg-neon-red text-cyber-black text-[11px] font-black uppercase tracking-widest italic shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.02] transition-all">
                    <Radio size={16} /> BROADCAST_SOS_ALERT
                 </button>
                 <button className="flex items-center gap-3 px-6 py-4 border border-neon-orange/40 text-neon-orange text-[11px] font-black uppercase tracking-widest italic hover:bg-neon-orange/10 transition-all">
                    <DollarSign size={16} /> SURGE_INCENTIVE_BOOST
                 </button>
                 <button className="flex items-center gap-3 px-6 py-4 border border-neon-cyan/40 text-neon-cyan text-[11px] font-black uppercase tracking-widest italic hover:bg-neon-cyan/10 transition-all">
                    <Users size={16} /> DEPLOY_BACKUP_SQUAD
                 </button>
                 <button className="flex items-center gap-3 px-6 py-4 border border-purple-500/40 text-purple-400 text-[11px] font-black uppercase tracking-widest italic hover:bg-purple-500/10 transition-all">
                    <Cpu size={16} /> ACTIVATE_AI_RECOVERY
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}


function EmergencyIncidentCard({ order, isActive }: { order: any, isActive?: boolean }) {
  const severityColors: any = {
    CRITICAL: 'text-neon-red border-neon-red/40 bg-neon-red/10 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    HIGH: 'text-neon-orange border-neon-orange/30 bg-neon-orange/5',
    MEDIUM: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
  };

  return (
    <div className={cn(
      "glass-panel p-6 bg-cyber-black/60 border-white/5 hover:border-neon-red/40 transition-all group cursor-pointer relative overflow-hidden",
      isActive ? "border-neon-red/50 bg-neon-red/[0.03] shadow-[0_0_30px_rgba(239,68,68,0.1)]" : ""
    )}>
       {/* UI Glitch Bar */}
       {isActive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon-red animate-pulse" />}
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          {/* Order Header & Intel */}
          <div className="lg:col-span-4 space-y-4">
             <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded glass-panel flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500", severityColors[order.severity])}>
                   <ShieldAlert size={28} />
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-black rounded-full border border-white/10 flex items-center justify-center text-[7px] font-black text-white">
                      !
                   </div>
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-white italic group-hover:text-neon-red transition-colors">{order.id}</span>
                      <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest", severityColors[order.severity])}>
                         {order.severity}
                      </span>
                   </div>
                   <div className="text-sm font-black text-white uppercase italic tracking-tight mt-1">{order.store}</div>
                   <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                      {order.category} <div className="w-1 h-1 rounded-full bg-slate-700" /> <span className="text-neon-red animate-pulse">{order.delay}</span>
                   </div>
                </div>
             </div>
             
             <div className="space-y-1.5 pl-2 border-l border-white/5 py-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                   <MapPin size={10} className="text-neon-red" /> {order.address}
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase">
                      <Navigation size={10} /> {order.distance}
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] text-neon-red font-mono uppercase font-bold">
                      <Clock size={10} /> {order.eta}
                   </div>
                </div>
             </div>
          </div>

          {/* Rider Telemetry */}
          <div className="lg:col-span-4 px-8 border-x border-white/5 space-y-4">
             <div className="flex items-center gap-4">
                <img src={order.rider.photo} alt={order.rider.name} className="w-12 h-12 rounded-sm border border-white/10 p-0.5 grayscale group-hover:grayscale-0 transition-all duration-700 bg-cyber-deep" />
                <div className="flex-1">
                   <div className="text-[11px] font-black text-white uppercase italic tracking-widest mb-1">{order.rider.name}</div>
                   <div className="flex items-center gap-3">
                      <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                         <Truck size={10} /> {order.rider?.vehicle || 'SCANNING...'}
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyber-black/60 border border-white/5 flex flex-col gap-1">
                   <span className="text-[7px] font-mono text-slate-600 uppercase">SIGNAL_STRENGTH</span>
                   <div className="flex items-center gap-2">
                      <Signal size={10} className={cn(order.rider.signal === 'Optimal' ? 'text-neon-green' : 'text-neon-red animate-pulse')} />
                      <span className={cn("text-[9px] font-mono", order.rider.signal === 'Optimal' ? 'text-neon-green' : 'text-neon-red')}>{order.rider.signal}</span>
                   </div>
                </div>
                <div className="p-2 bg-cyber-black/60 border border-white/5 flex flex-col gap-1">
                   <span className="text-[7px] font-mono text-slate-600 uppercase">BATTERY_NODE</span>
                   <div className="flex items-center gap-2">
                      <BatteryMedium size={10} className={cn(order.rider.battery === 'Low Battery' ? 'text-neon-red animate-pulse' : 'text-neon-green')} />
                      <span className={cn("text-[9px] font-mono", order.rider.battery === 'Low Battery' ? 'text-neon-red' : 'text-neon-green')}>{order.rider.battery}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Tactical Actions */}
          <div className="lg:col-span-4 flex items-center justify-between pl-8">
             <div className="text-right space-y-4 flex-1">
                <div className="space-y-1">
                   <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">EMERGENCY_YIELD</div>
                   <div className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{order.payout}</div>
                   <div className="text-[9px] font-black text-neon-red uppercase tracking-widest animate-pulse">+ EMERGENCY_BOOST</div>
                </div>
                <div className={cn("inline-block px-3 py-1.5 border uppercase tracking-[0.2em] font-black text-[9px] italic", severityColors[order.severity].split(' ')[0])}>
                   {order.status}
                </div>
             </div>
             
             <div className="flex flex-col gap-2 ml-8">
                <button className="px-6 py-3 bg-neon-red text-cyber-black text-[10px] font-black uppercase tracking-widest italic shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 transition-all">
                   ESCALATE_UNIT
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 glass-panel border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all italic">
                   FULL_INTEL_v3
                </button>
             </div>
          </div>
       </div>
       
       {/* Scanner Decoration Component */}
       <div className="absolute top-0 right-0 w-32 h-full opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-neon-red to-transparent" />
          <motion.div 
            animate={{ y: ['0%', '1000%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-full h-1 bg-neon-red shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
       </div>
    </div>
  );
}

function EmergencyRiderMiniStat({ label, value, color }: { label: string, value: string, color: 'green' | 'red' | 'orange' | 'slate' }) {
  const colors: any = {
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    red: 'text-neon-red border-neon-red/30 bg-neon-red/10',
    orange: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
    slate: 'text-slate-500 border-white/5 bg-white/5'
  };
  
  return (
    <div className={cn("p-4 border flex flex-col items-center justify-center rounded-sm transition-all hover:scale-105 cursor-pointer group", colors[color])}>
       <div className="text-xl font-black font-mono tracking-tighter mb-1 group-hover:scale-110 transition-transform">{value}</div>
       <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest">{label}</div>
    </div>
  );
}

const PRIME_ORDERS_MOCK = [
  {
    id: "PR-9921",
    vipName: "Sarah J. Montgomery",
    store: "Gourmet Galaxy Elite",
    type: "VIP_EXPRESS",
    priority: "CRITICAL",
    address: "Block A, Prestige Residency",
    distance: "5.2 KM",
    eta: "09 MIN",
    status: "IN_TRANSIT",
    payout: "₹450.00",
    incentive: "₹120.00",
    rider: {
      name: "Arjun Varma",
      tier: "PLATINUM",
      vehicle: "TESLA_MODEL_S",
      rating: "5.0",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
    }
  },
  {
    id: "PR-9934",
    vipName: "David Henderson",
    store: "Luxury Tech Hub",
    type: "LUXURY_DELIVERY",
    priority: "HIGH",
    address: "Skyview Tower, Floor 42",
    distance: "3.1 KM",
    eta: "14 MIN",
    status: "PICKUP_COMPLETE",
    payout: "₹680.00",
    incentive: "₹150.00",
    rider: {
      name: "Meera Nair",
      tier: "ELITE",
      vehicle: "CYBERV_DRONE",
      rating: "4.9",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera"
    }
  },
  {
    id: "PR-9942",
    vipName: "Julian Saint",
    store: "Haute Couture Salon",
    type: "VIP_PRIORITY",
    priority: "CRITICAL",
    address: "The Emperor Estate, Gate 1",
    distance: "7.8 KM",
    eta: "22 MIN",
    status: "PREPARING",
    payout: "₹920.00",
    incentive: "₹200.00",
    rider: {
      name: "Vikram Singh",
      tier: "PLATINUM",
      vehicle: "AERO_CYCLE",
      rating: "5.0",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram"
    }
  }
];

function PrimeOrders() {
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Prime Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-neon-orange/20 pb-8 gap-6">
        <div>
           <div className="flex items-center gap-3 text-[10px] font-mono text-neon-orange uppercase tracking-[0.4em] mb-3 leading-none italic">
              <Crown size={12} /> RAjFleet PRIME_COMMAND_CENTER
           </div>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4">
              ELITE <span className="text-neon-orange">OPERATIONS</span> <div className="h-8 w-[2px] bg-neon-orange/30 rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">v4.0.1_SECURE</span>
           </h1>
           <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl">
             Neural priority logistics & VIP fleet orchestration engine. 
             <span className="text-neon-orange ml-2 italic">Monitoring 432 active Prime links.</span>
           </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <PremiumHeaderWidget label="PRIME_SYNC" value="ACTIVE" color="orange" icon={<ZapIcon size={12} />} />
           <PremiumHeaderWidget label="VIP_LINKS" value="1,248" color="blue" icon={<Users size={12} />} />
           <PremiumHeaderWidget label="REVENUE_FLUX" value="₹4.2M" color="green" icon={<DollarSign size={12} />} />
        </div>
      </div>

      {/* Hero Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <PrimeKpiCard label="Prime Running" value="432" growth="+18%" color="orange" icon={<Package />} />
        <PrimeKpiCard label="VIP Activity" value="89%" growth="OPTIMAL" color="blue" icon={<Crown />} />
        <PrimeKpiCard label="Avg. Elite ETA" value="14.2m" growth="-2.4m" color="cyan" icon={<Clock />} />
        <PrimeKpiCard label="Prime Rev" value="₹682k" growth="+12%" color="green" icon={<TrendingUp />} />
        <PrimeKpiCard label="AI Efficiency" value="98.2%" growth="EXCELLENT" color="purple" icon={<BrainCircuit />} />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between glass-panel p-3 border-white/10 bg-cyber-black/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap gap-1">
          {['ALL', 'EXPRESS', 'VIP_PRIORITY', 'LUXURY', 'SCHEDULED'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all italic rounded-sm relative",
                activeTab === tab 
                  ? "bg-neon-orange text-cyber-black shadow-[0_0_20px_rgba(245,158,11,0.4)] z-10" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-neon-orange transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH PRIME_UUID / VIP..."
              className="w-full bg-cyber-black border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-orange/40 transition-all"
            />
          </div>
          <button className="p-2.5 glass-panel border-white/10 text-slate-400 hover:text-neon-orange transition-all">
            <Filter size={16} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-neon-orange/10 border border-neon-orange/30 text-neon-orange text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-orange hover:text-cyber-black transition-all">
            <Cpu size={14} /> AI_AUTO_ASSIGN
          </button>
        </div>
      </div>

      {/* Main Grid Workroom */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Prime Orders List */}
        <div className="xl:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-neon-orange rounded-full animate-pulse" />
                 Active Priority Buffer
              </h3>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">32 LINKS_SYNCED</span>
           </div>
           
           <div className="space-y-4">
              {PRIME_ORDERS_MOCK.map(order => (
                <div key={order.id}>
                  <PrimeOrderCard order={order} />
                </div>
              ))}
           </div>
           
           <button className="w-full py-5 glass-panel border-white/5 text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] hover:text-neon-orange hover:border-neon-orange/20 transition-all italic hover:bg-neon-orange/5">
             Access Cold Archive // LOAD_MORE_PRIME_BUFF
           </button>
        </div>

        {/* Intelligence Sidebar */}
        <div className="xl:col-span-4 space-y-8">
           {/* Elite Map Telemetry */}
           <div className="glass-panel border-neon-orange/20 p-1 relative overflow-hidden bg-cyber-black h-[400px] group">
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(rgba(245,158,11, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              <div className="relative z-10 h-full flex flex-col">
                 <div className="p-4 flex items-center justify-between border-b border-white/10 bg-cyber-black/60">
                    <div className="flex items-center gap-2">
                       <Map size={14} className="text-neon-orange animate-pulse" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">PRIME_HUD_V2</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-neon-orange bg-neon-orange/10 px-2 py-0.5 rounded-full">
                       <Signal size={10} /> 1.2MS LATENCY
                    </div>
                 </div>
                 
                 <div className="flex-1 relative bg-cyber-deep/50 overflow-hidden">
                    {/* Abstract HUD Map Elements */}
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                       <circle cx="50%" cy="50%" r="100" fill="none" stroke="currentColor" className="text-neon-orange/10" strokeDasharray="5,5" />
                       <circle cx="50%" cy="50%" r="50" fill="none" stroke="currentColor" className="text-neon-orange/20" strokeWidth="1" />
                       <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" className="text-white/5" />
                       <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" className="text-white/5" />
                    </svg>
                    
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-1/3 left-1/4 w-12 h-12 bg-neon-orange/5 border border-neon-orange/20 rounded-full flex items-center justify-center"
                    >
                       <MapPin size={16} className="text-neon-orange" />
                    </motion.div>
                    
                    <motion.div 
                       initial={{ x: -100, y: 100 }}
                       animate={{ x: 200, y: -50 }}
                       transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                       className="absolute"
                    >
                       <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                       <div className="text-[7px] font-mono text-neon-cyan mt-1 uppercase whitespace-nowrap">ELITE_LINK_002</div>
                    </motion.div>
                 </div>
                 
                 <div className="p-4 bg-cyber-black/80 border-t border-white/10">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-sm bg-neon-orange/10 border border-neon-orange/20 flex items-center justify-center text-neon-orange">
                          <Navigation size={20} className="animate-spin-slow" />
                       </div>
                       <div className="flex-1">
                          <div className="text-[10px] font-black text-white uppercase">ARJUN_V_ELITE</div>
                          <div className="w-full h-1 bg-white/5 mt-2 rounded-full overflow-hidden">
                             <div className="w-3/4 h-full bg-neon-orange" />
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-mono text-neon-orange">78% DIST</div>
                          <div className="text-[8px] font-mono text-slate-500 uppercase">3.2km to VIP</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* VIP Customer Highlight */}
           <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-neon-orange/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full border-2 border-neon-orange/30 bg-cyber-black p-1">
                    <div className="w-full h-full rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange">
                       <Crown size={24} />
                    </div>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white uppercase italic">VIP_MEMBERSHIP_CORE</h4>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Global Elite Tier</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <VIPStat label="Total Prime Spending" value="₹12.4M" color="green" />
                 <VIPStat label="Member Retention" value="99.2%" color="blue" />
                 <VIPStat label="Avg. Order Value" value="₹1,840" color="orange" />
              </div>
              
              <button className="w-full mt-6 py-3 border border-neon-orange/20 text-neon-orange text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-neon-orange hover:text-cyber-black transition-all">
                ACCESS VIP ARCHIVE
              </button>
           </div>

           {/* Emergency Priority Alert */}
           <div className="glass-panel border-neon-red/30 bg-neon-red/5 p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded bg-neon-red/10 border border-neon-red/30 flex items-center justify-center text-neon-red">
                    <AlertCircle size={18} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest italic">CRITICAL_DELAY_RISK</h3>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                VIP Order <span className="text-white font-black">#PR-9921</span> tracking outside expected buffer. Sector 14 gridlock detected.
              </p>
              <div className="flex gap-2">
                 <button className="flex-1 py-2.5 bg-neon-red text-cyber-black text-[10px] font-black uppercase tracking-widest italic shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                    DEPLOY BACKUP
                 </button>
                 <button className="flex-1 py-2.5 border border-neon-red/40 text-neon-red text-[10px] font-black uppercase tracking-widest italic">
                    AI_RECOVERY
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Insights & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
         {/* Prime Revenue Charts */}
         <div className="lg:col-span-12 xl:col-span-5 glass-panel p-6 border-white/5 bg-cyber-black/40">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">REVENUE_FLUX_MATRIX</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Real-time Prime Yield Analysis</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-neon-orange rounded-full" />
                     <span className="text-[9px] font-mono text-slate-500 uppercase">YIELD</span>
                  </div>
               </div>
            </div>
            
            <div className="h-48 flex items-end gap-2 group/chart">
               {[40, 65, 45, 90, 65, 80, 55, 75, 40, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                     <div className="w-full relative bg-white/5 rounded-t-sm overflow-hidden min-h-[4px]">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${val}%` }}
                           transition={{ delay: i * 0.05, duration: 1 }}
                           className="w-full absolute bottom-0 bg-gradient-to-t from-neon-orange/20 to-neon-orange shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:from-neon-orange group-hover:to-white transition-all"
                        />
                     </div>
                     <span className="text-[6px] font-mono text-slate-600 uppercase">H0{i}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* AI Neural Analytics Core */}
         <div className="lg:col-span-6 xl:col-span-4 glass-panel p-6 border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 70%)' }} />
               <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-24 -right-24 w-64 h-64 border border-purple-500/10 rounded-full"
               />
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-sm bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                     <BrainCircuit size={20} className="animate-pulse" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">NEURAL_PREDICTION_CORE</h3>
                     <p className="text-[9px] font-mono text-purple-400/60 uppercase tracking-widest mt-1 italic">Active Intelligence Stream</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <AIInsightItemPremium label="VIP Demand Volatility" value="PREDICTIVE_STABLE" confidence="98%" />
                  <AIInsightItemPremium label="Rider Fleet Efficiency" value="HIGH_CAPACITY" confidence="92%" />
                  <AIInsightItemPremium label="Route Risk Factors" value="MINIMAL_DETECTED" confidence="99.9%" />
                  <AIInsightItemPremium label="Dynamic Surge Flux" value="MANUAL_OVERRIDE" confidence="N/A" />
               </div>
            </div>
         </div>

         {/* Elite Rider Leaderboard */}
         <div className="lg:col-span-6 xl:col-span-3 glass-panel p-6 border-white/5 space-y-6">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">ELITE_RIDER_RANKINGS</h3>
            <div className="space-y-4">
               <LeaderboardItem rank={1} name="Vikram S." score="99.8" level="ELITE_PLATINUM" color="orange" />
               <LeaderboardItem rank={2} name="Sarah K." score="98.4" level="ELITE_GOLD" color="blue" />
               <LeaderboardItem rank={3} name="Meera N." score="97.2" level="ELITE_GOLD" color="cyan" />
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-neon-orange hover:border-neon-orange/40 transition-all">
               FULL_RANKING_MATRIX
            </button>
         </div>
      </div>
    </div>
  );
}

function AIInsightItemPremium({ label, value, confidence }: { label: string, value: string, confidence: string }) {
  return (
    <div className="p-3 bg-cyber-black/40 border border-purple-500/10 rounded-sm group hover:border-purple-500/30 transition-all">
       <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
          <span className="text-[8px] font-mono text-purple-400 uppercase">{confidence} CONF</span>
       </div>
       <div className="text-[10px] font-black text-purple-400 uppercase tracking-tight italic group-hover:translate-x-1 transition-transform">{value}</div>
    </div>
  );
}

function LeaderboardItem({ rank, name, score, level, color }: { rank: number, name: string, score: string, level: string, color: string }) {
  const colors: any = {
    orange: 'text-neon-orange border-neon-orange/20',
    blue: 'text-neon-blue border-neon-blue/20',
    cyan: 'text-neon-cyan border-neon-cyan/20',
    'slate-500': 'text-slate-500 border-white/10'
  };

  return (
    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-sm transition-all border border-transparent hover:border-white/5">
       <div className="text-[10px] font-mono text-slate-600 font-black w-4">0{rank}</div>
       <div className={cn("w-8 h-8 rounded-sm bg-cyber-black border flex items-center justify-center transition-all", colors[color])}>
          <Star size={14} className={rank === 1 ? "fill-neon-orange" : ""} />
       </div>
       <div className="flex-1">
          <div className="text-[10px] font-black text-white uppercase tracking-tight">{name}</div>
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{level}</div>
       </div>
       <div className="text-right">
          <div className="text-[10px] font-black text-neon-orange font-mono">{score}%</div>
          <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest leading-none">EFF_SYNC</div>
       </div>
    </div>
  );
}

function PremiumHeaderWidget({ label, value, color, icon }: { label: string, value: string, color: string, icon?: React.ReactNode }) {
  const colorMap: any = {
    orange: 'text-neon-orange border-neon-orange/20',
    blue: 'text-neon-blue border-neon-blue/20',
    green: 'text-neon-green border-neon-green/20'
  };
  
  return (
    <div className={cn("glass-panel px-4 py-2 flex flex-col gap-1 border-white/5", colorMap[color])}>
       <div className="flex items-center gap-2 text-[8px] font-mono opacity-60 uppercase tracking-[0.2em]">{icon} {label}</div>
       <div className={cn("text-sm font-black font-mono tracking-tighter uppercase", colorMap[color].split(' ')[0])}>{value}</div>
    </div>
  );
}

function PrimeKpiCard({ label, value, growth, color, icon }: { label: string, value: string, growth: string, color: 'orange' | 'blue' | 'cyan' | 'green' | 'purple', icon: React.ReactNode }) {
  const colorThemes: any = {
    orange: 'border-neon-orange/20 text-neon-orange bg-neon-orange/5',
    blue: 'border-neon-blue/20 text-neon-blue bg-neon-blue/5',
    cyan: 'border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5',
    green: 'border-neon-green/20 text-neon-green bg-neon-green/5',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/5'
  };

  return (
    <div className={cn("glass-panel p-5 relative overflow-hidden group hover:border-white/20 transition-all", colorThemes[color])}>
       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          {icon}
       </div>
       <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="p-2 rounded-sm bg-cyber-black/40 border border-white/5 text-white/80">
                {icon}
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] font-mono opacity-80">{growth}</span>
          </div>
          <div>
             <div className="text-3xl font-black font-mono tracking-tighter text-white group-hover:scale-105 transition-transform origin-left">{value}</div>
             <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">{label}</div>
          </div>
       </div>
       <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] opacity-30", colorThemes[color].split(' ')[1].replace('text', 'bg'))} />
    </div>
  );
}

function PrimeOrderCard({ order }: { order: any }) {
  const statusColors: any = {
    IN_TRANSIT: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5',
    PICKUP_COMPLETE: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
    PREPARING: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    DELAYED: 'text-neon-red border-neon-red/20 bg-neon-red/5'
  };

  return (
    <div className="glass-panel p-6 bg-cyber-black/40 border-white/10 hover:border-neon-orange/30 transition-all group relative overflow-hidden">
       {/* Background Hologram Effect */}
       <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-neon-orange/5 blur-[100px] pointer-events-none rounded-full" />
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          {/* Order Visuals */}
          <div className="lg:col-span-4 space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded glass-panel border-neon-orange/30 flex items-center justify-center text-neon-orange relative group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
                   <Crown size={28} className="animate-pulse" />
                   <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-neon-orange text-cyber-black text-[7px] font-black uppercase tracking-widest italic rounded-sm">
                      {order.priority}
                   </div>
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-white italic">{order.id}</span>
                      <span className="text-[9px] font-mono text-neon-orange font-bold uppercase tracking-widest">VIP_LINK</span>
                   </div>
                   <div className="text-sm font-black text-white uppercase italic tracking-tight">{order.vipName}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{order.store}</div>
                </div>
             </div>
             
             <div className="space-y-1.5 pl-1 border-l border-white/5 py-1">
                <div className="flex items-center gap-2 text-[9px] text-slate-400 uppercase tracking-widest font-mono">
                   <MapPin size={10} className="text-neon-orange" /> {order.address}
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase">
                      <Navigation size={10} /> {order.distance}
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] text-neon-orange font-mono uppercase font-bold">
                      <Clock size={10} /> {order.eta}
                   </div>
                </div>
             </div>
          </div>

          {/* Elite Rider Intel */}
          <div className="lg:col-span-4 px-8 border-x border-white/5 space-y-4">
             <div className="flex items-center gap-4">
                <div className="relative">
                   <img src={order.rider.photo} alt={order.rider.name} className="w-12 h-12 rounded-full border-2 border-neon-orange/40 p-0.5" />
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyber-black border border-neon-orange/30 rounded-full flex items-center justify-center text-neon-orange shadow-lg">
                      <Award size={12} />
                   </div>
                </div>
                <div className="flex-1">
                   <div className="text-[11px] font-black text-white uppercase italic tracking-widest">{order.rider.name}</div>
                   <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-neon-orange/20 text-neon-orange rounded-sm uppercase tracking-widest">Tier_{order.rider.tier}</span>
                      <span className="text-[9px] font-bold text-neon-green uppercase flex items-center gap-1">★ {order.rider.rating}</span>
                   </div>
                </div>
                <div className="flex flex-col gap-1.5">
                   <button className="p-2 border border-white/5 rounded-sm hover:border-neon-orange/30 text-slate-500 hover:text-white transition-all"><Phone size={12} /></button>
                   <button className="p-2 border border-white/5 rounded-sm hover:border-neon-orange/30 text-slate-500 hover:text-white transition-all"><MessageSquare size={12} /></button>
                </div>
             </div>
             <div className="flex items-center gap-2 bg-white/5 p-2 rounded-sm border border-white/5">
                <Truck size={12} className="text-slate-500" />
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ASSET: {order.rider?.vehicle || 'N/A'}</span>
             </div>
          </div>

          {/* Logistics Data & Actions */}
          <div className="lg:col-span-4 flex items-center justify-between pl-8">
             <div className="text-right space-y-4">
                <div className="space-y-1">
                   <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">PAYOUT_FLUX</div>
                   <div className="text-lg font-black font-mono text-white tracking-tighter leading-none">{order.payout}</div>
                   <div className="text-[9px] font-bold text-neon-green uppercase tracking-widest">+ {order.incentive} INCENTIVE</div>
                </div>
                <div className={cn("inline-block px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] border", statusColors[order.status])}>
                   {order.status.replace('_', ' ')}
                </div>
             </div>
             
             <div className="flex flex-col gap-2 ml-8">
                <button className="px-6 py-3 bg-neon-orange text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all">
                   COMMAND_TRACK
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 glass-panel border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:border-white/20 transition-all">
                   DETAILS <ChevronRight size={14} />
                </button>
             </div>
          </div>
       </div>
       
       {/* Luxury Indicator */}
       <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none transition-opacity group-hover:opacity-30", statusColors[order.status].split(' ')[0].replace('text', 'text'))}>
          <Crown size={96} className="translate-x-12 -translate-y-12 rotate-12" />
       </div>
    </div>
  );
}



// --- Analytics Hub Components ---

const ANALYTICS_REALTIME_METRICS = [
  { id: 'thru', label: 'Network Throughput', value: '4.2 GB/s', color: 'blue' },
  { id: 'lat', label: 'Regional Latency', value: '14 ms', color: 'green' },
  { id: 'eff', label: 'System Efficiency', value: '98.8%', color: 'cyan' },
  { id: 'upt', label: 'Uptime Protocol', value: '99.99%', color: 'purple' },
];

const EFFICIENCY_TRENDS = [
  { time: '08:00', load: 45, nodes: 12 },
  { time: '10:00', load: 72, nodes: 18 },
  { time: '12:00', load: 88, nodes: 24 },
  { time: '14:00', load: 65, nodes: 20 },
  { time: '16:00', load: 55, nodes: 16 },
  { time: '18:00', load: 82, nodes: 22 },
  { time: '20:00', load: 95, nodes: 28 },
  { time: '22:00', load: 60, nodes: 18 },
];

function Analytics() {
   const [timeRange, setTimeRange] = useState('Weekly');
   const [activeRegion, setActiveRegion] = useState('All');

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 relative">
         {/* Background Grid & Particles Effect */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0, 178, 255, 0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-scan shrink-0" />
         </div>

         {/* Security Header Section */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
            <div>
               <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
                  <Activity size={12} /> ANALYTICS_INTELLIGENCE_CORE_v2.0
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
                  ANALYTICS <span className="text-neon-cyan">OVERVIEW</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> 
                  <span className="text-xs font-mono text-slate-500 normal-case tracking-normal not-italic opacity-50">NODE_ANLYT_SYS_ACTIVE</span>
               </h1>
               <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
                  Real-time operational insights, business intelligence & predictive telemetry.
               </p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
               <div className="flex bg-white/5 border border-white/10 rounded-sm p-1">
                  {['Daily', 'Weekly', 'Monthly'].map(r => (
                     <button 
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={cn(
                           "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm italic",
                           timeRange === r ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(0,178,255,0.4)]" : "text-slate-500 hover:text-white"
                        )}
                     >
                        {r}
                     </button>
                  ))}
               </div>
               
               <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-sm flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_#00FF9D]" />
                     <span className="text-[9px] font-mono text-white uppercase tracking-widest leading-none">System Healthy</span>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button className="p-2 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-sm"><Filter size={14} /></button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-neon-blue/30 text-neon-blue text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-blue/10 transition-all">
                     EXPORT REPORT <Download size={14} />
                  </button>
               </div>
            </div>
         </div>

         {/* Analytics KPI Dashboard */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
            <AnalyticsKPICard label="Total Orders" value="24,856" trend="+18.6%" trendUp={true} color="blue" icon={<Package />} />
            <AnalyticsKPICard label="Completed Orders" value="22,134" trend="+17.2%" trendUp={true} color="green" icon={<CheckCircle />} />
            <AnalyticsKPICard label="Total Earnings" value="₹18,75,420" trend="+21.4%" trendUp={true} color="cyan" icon={<DollarSign />} />
            <AnalyticsKPICard label="Active Riders" value="1,248" trend="+12.8%" trendUp={true} color="purple" icon={<Users />} />
            <AnalyticsKPICard label="Cancelled Orders" value="1,286" trend="-8.7%" trendUp={false} color="red" icon={<Ban />} />
            <AnalyticsKPICard label="Customer Rating" value="4.8" trend="+0.2" trendUp={true} color="amber" icon={<Star />} />
         </div>

         {/* Secondary Intelligence Layer */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* Primary Analysis - Orders & Earnings */}
            <div className="lg:col-span-8 space-y-8">
               <div className="glass-panel border-white/5 bg-cyber-black/40 p-8 min-h-[480px] flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-[100px]" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                     <div>
                        <h3 className="text-xl font-black italic text-white uppercase leading-none mb-2">Orders & Earnings Trend</h3>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural performance modeling for {timeRange.toLowerCase()} period</p>
                     </div>
                     <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-1 bg-neon-blue rounded-full" />
                           <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Orders</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-1 bg-neon-amber rounded-full" />
                           <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Earnings (₹)</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 w-full min-h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ANALYTICS_TREND_DATA}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                           <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                           />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#050816', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                              itemStyle={{ color: '#00B2FF' }}
                           />
                           <Line type="monotone" dataKey="orders" stroke="#00B2FF" strokeWidth={3} dot={{ r: 4, fill: '#00B2FF', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px #00B2FF' }} />
                           <Line type="monotone" dataKey="earnings" stroke="#FFB020" strokeWidth={3} dot={{ r: 4, fill: '#FFB020', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px #FFB020' }} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                     <SubAnalysisMetric label="Peak Volume" value="1,245 orders" sub="22 May, 8:44 PM" color="blue" />
                     <SubAnalysisMetric label="Mean Revenue" value="₹2,42,880" sub="Daily Average" color="cyan" />
                     <SubAnalysisMetric label="Prime Usage" value="28.4%" sub="Growth: +4.2%" color="purple" />
                     <SubAnalysisMetric label="Retention" value="94.2%" sub="Stability: Strong" color="green" />
                  </div>
               </div>

               {/* City performance and Rider Performance Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                     <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Top Performing Cities</h4>
                        <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">View All</button>
                     </div>
                     <div className="space-y-4">
                        {['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'].map((city, idx) => (
                           <CityPerformanceItem 
                              key={city} 
                              city={city} 
                              orders={['6,542', '3,862', '2,945', '2,354'][idx]} 
                              growth={['+22.4%', '+18.1%', '+16.7%', '+12.8%'][idx]} 
                              earnings={['₹4,85,760', '₹2,75,410', '₹2,10,230', '₹1,65,540'][idx]}
                              idx={idx}
                           />
                        ))}
                     </div>
                  </div>

                  <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                     <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Top Performing Riders</h4>
                        <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">View All</button>
                     </div>
                     <div className="space-y-4">
                        {['Aman Kumar', 'Rohit Singh', 'Vikash Kumar', 'Sanjay Paswan'].map((rider, idx) => (
                           <RiderPerformanceItem 
                              key={rider} 
                              name={rider} 
                              trips={['156', '138', '134', '121'][idx]} 
                              rating={['4.9', '4.8', '4.8', '4.7'][idx]} 
                              revenue={['₹13,560', '₹11,240', '₹10,870', '₹9,450'][idx]}
                              idx={idx}
                           />
                        ))}
                     </div>
                  </div>
               </div>

               {/* Metric Breakdown Table */}
               <div className="glass-panel border-white/5 bg-cyber-black/40 p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Order Metrics Breakdown</h4>
                     <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">Full Report</button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest border-b border-white/5">
                              <th className="px-4 py-3">Metric</th>
                              <th className="px-4 py-3">This Week</th>
                              <th className="px-4 py-3">Last Week</th>
                              <th className="px-4 py-3 text-right">Change %</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <MetricBreakdownRow label="Total Volume" icon={<Package size={12} />} current="24,856" previous="20,951" change="+18.6%" trend="up" />
                           <MetricBreakdownRow label="Success Delivery" icon={<CheckCircle size={12} />} current="22,134" previous="18,876" change="+17.2%" trend="up" />
                           <MetricBreakdownRow label="Cancellation Ratio" icon={<Ban size={12} />} current="1,286" previous="1,408" change="-8.7%" trend="up" />
                           <MetricBreakdownRow label="Avg. Latency/Trip" icon={<Clock size={12} />} current="28 mins" previous="30 mins" change="-6.7%" trend="up" />
                           <MetricBreakdownRow label="Customer Satisfaction" icon={<Gem size={12} />} current="89.1%" previous="86.3%" change="+3.2%" trend="up" />
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* Right Side Panels - Insights & Distribution */}
            <div className="lg:col-span-4 space-y-8">
               
               {/* Orders by Type Analysis */}
               <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Orders by Type</h4>
                     <PieChartIcon size={14} className="text-neon-blue" />
                  </div>
                  <div className="flex-1 w-full min-h-[220px] relative">
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-xl font-black text-white italic">24,856</div>
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Total Orders</div>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={ORDER_TYPE_DATA}
                              cx="50%" cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={6}
                              dataKey="value"
                           >
                              {ORDER_TYPE_DATA.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#050816', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="mt-8 space-y-3">
                     {ORDER_TYPE_DATA.map(item => (
                        <div key={item.name} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{item.name} Orders</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-white italic">{item.value}</span>
                              <span className="text-[8px] font-mono text-slate-600">({item.percent}%)</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* AI Intelligence Hub */}
               <div className="glass-panel p-6 border-neon-purple/20 bg-neon-purple/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:rotate-12 transition-transform duration-700">
                     <BrainCircuit size={40} className="text-neon-purple" />
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-1.5 bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.4)] rounded-sm">
                        <Sparkles size={14} />
                     </div>
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Neural Key Insights</h4>
                  </div>
                  <div className="space-y-4">
                     <InsightItem icon={<TrendingUp size={14} />} label="Volume Spike Detected" desc="Order volume increased by 18.6% compared to last week cycle." color="green" />
                     <InsightItem icon={<Zap size={14} />} label="Prime Tier Revenue" desc="Prime orders generated ₹6,42,180 in extra tactical earnings." color="amber" />
                     <InsightItem icon={<Clock size={14} />} label="Peak Logic Calibration" desc="Peak order hours confirmed between 7 PM – 10 PM IST." color="purple" />
                     <InsightItem icon={<BarChart3 size={14} />} label="Efficiency Optimization" desc="Cancellation rate improved by 8.7% after regional tuning." color="red" />
                  </div>
                  <button className="w-full mt-8 py-3 glass-panel border-neon-purple/30 text-neon-purple text-[9px] font-black uppercase tracking-[0.3em] overflow-hidden group relative">
                     <div className="absolute inset-0 bg-neon-purple -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-20" />
                     VIEW ALL INSIGHTS_v4
                  </button>
               </div>

               {/* Map Heatmap Overview */}
               <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 min-h-[300px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Order Heatmap <span className="text-[8px] font-mono text-slate-500 ml-2">(BY CITY)</span></h4>
                     <MapPin size={14} className="text-neon-red" />
                  </div>
                  <div className="flex-1 rounded border border-white/5 bg-cyber-black relative overflow-hidden group">
                     {/* Abstract Mock Map Heatmap */}
                     <svg viewBox="0 0 400 300" className="w-full h-full opacity-60">
                        <path d="M50 200 Q 150 100 250 200 T 350 150" fill="none" stroke="rgba(0, 178, 255, 0.1)" strokeWidth="40" strokeLinecap="round" />
                        <circle cx="100" cy="180" r="15" fill="#FFB020" className="animate-pulse" opacity="0.4" />
                        <circle cx="280" cy="120" r="10" fill="#00FF9D" className="animate-pulse delay-700" opacity="0.4" />
                        <circle cx="220" cy="210" r="25" fill="#FF3B5C" className="animate-pulse delay-500" opacity="0.3" />
                        <circle cx="180" cy="150" r="20" fill="#00B2FF" className="animate-pulse delay-300" opacity="0.4" />
                     </svg>
                     <div className="absolute inset-0 p-4 font-mono text-[8px] text-slate-600 uppercase tracking-widest flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between">
                           <span>PATNA_CORE: <span className="text-neon-red">HIGH</span></span>
                           <span>GAYA_NODE: <span className="text-neon-amber">MID</span></span>
                        </div>
                        <div className="flex justify-between">
                           <span>MUZ_CELL: <span className="text-neon-green">STABLE</span></span>
                           <span>BHG_GRID: <span className="text-neon-blue">LOW</span></span>
                        </div>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[9px] font-black text-white uppercase tracking-widest italic underline decoration-neon-red underline-offset-4">Interactive Intel Map</button>
                     </div>
                  </div>
               </div>

               {/* Platform Performance Widgets */}
               <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Platform Performance</h4>
                     <Settings2 size={14} className="text-neon-blue" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <HealthWidget icon={<Globe size={12} />} label="Server Uptime" value="99.98%" status="Excellent" color="green" />
                     <HealthWidget icon={<Zap size={12} />} label="API Response" value="120ms" status="Excellent" color="green" />
                     <HealthWidget icon={<Navigation size={12} />} label="Live Tracking" value="98.7%" status="Excellent" color="green" />
                     <HealthWidget icon={<Network size={12} />} label="Order Sync" value="98.9%" status="Excellent" color="green" />
                  </div>
                  <button className="w-full mt-8 py-3 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-white/5 transition-all">
                     FULL SYSTEM VITALS
                  </button>
               </div>
            </div>
         </div>

         {/* Bottom Horizon - Forecasting & Advanced Metrics */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 font-sans">
            <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Peak Hours (Orders)</h4>
                  <TrendingUp size={14} className="text-neon-amber" />
               </div>
               <div className="flex-1 min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={PEAK_HOURS_DATA}>
                        <XAxis dataKey="time" hide />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#050816', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                           cursor={{ fill: 'rgba(255, 176, 32, 0.1)' }}
                        />
                        <Bar dataKey="val" fill="#FFB020" radius={[2, 2, 0, 0]} barSize={10} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  <span>12 AM</span>
                  <span>12 PM</span>
                  <span>11 PM</span>
               </div>
            </div>

            <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Earnings Breakdown (₹)</h4>
                  <Wallet size={14} className="text-neon-cyan" />
               </div>
               <div className="flex-1 flex gap-6 items-center">
                  <div className="w-1/2 h-full min-h-[160px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie 
                              data={[
                                 { name: 'Delivery', value: 65, color: '#00B2FF' },
                                 { name: 'Incentives', value: 15, color: '#00FF9D' },
                                 { name: 'Surge', value: 10, color: '#B026FF' },
                                 { name: 'Others', value: 10, color: '#FFB020' },
                              ]} 
                              cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value"
                           >
                              {[0, 1, 2, 3].map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={['#00B2FF', '#00FF9D', '#B026FF', '#FFB020'][index]} strokeWidth={0} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                     <AnalyticsBreakdownItem label="Delivery" value="₹12.4L" color="#00B2FF" />
                     <AnalyticsBreakdownItem label="Incentives" value="₹3.1L" color="#00FF9D" />
                     <AnalyticsBreakdownItem label="Surge" value="₹1.9L" color="#B026FF" />
                     <AnalyticsBreakdownItem label="Analytics Others" value="₹1.3L" color="#FFB020" />
                  </div>
               </div>
            </div>

            <div className="glass-panel p-6 border-neon-blue/20 bg-neon-blue/5 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target size={40} className="text-neon-blue" />
               </div>
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Predictive Analysis</h4>
                  <Activity size={14} className="text-neon-blue animate-pulse" />
               </div>
               <div className="space-y-6 flex-1">
                  <div className="p-4 bg-cyber-black/60 border border-white/5 rounded-sm relative group/item overflow-hidden cursor-pointer">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_10px_#00B2FF]" />
                     <div className="text-[9px] font-black text-white uppercase italic mb-2 tracking-widest">Revenue Forecast Q3</div>
                     <div className="text-xl font-bold text-white font-orbitron mb-2 animate-pulse tracking-tighter italic">₹24.4Cr <span className="text-[10px] text-neon-green ml-2 font-black tracking-normal not-italic font-sans">+12.4%</span></div>
                     <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Model Confidence: 92.4% Neural Map</p>
                  </div>
                  <div className="p-4 bg-cyber-black/60 border border-white/5 rounded-sm relative overflow-hidden cursor-pointer">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-purple shadow-[0_0_10px_#B026FF]" />
                     <div className="text-[9px] font-black text-white uppercase italic mb-2 tracking-widest">Growth Vector Analysis</div>
                     <div className="flex items-center gap-4">
                        <TrendingUp size={24} className="text-neon-purple" />
                        <div>
                           <div className="text-[10px] font-bold text-white uppercase">Sector-14 Expansion</div>
                           <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Recommended Rider Deployment: +40</div>
                        </div>
                     </div>
                  </div>
               </div>
               <button className="w-full mt-6 py-3 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(0,178,255,0.3)] hover:scale-[1.02] transition-transform">
                  SIMULATE GROWTH
               </button>
            </div>
         </div>
      </div>
   );
}

function AnalyticsKPICard({ label, value, trend, trendUp, color, icon }: any) {
   const colorMap: any = {
      blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,178,255,0.1)]',
      green: 'text-neon-green border-neon-green/20 bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]',
      cyan: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
      purple: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 shadow-[0_0_15px_rgba(176,38,255,0.1)]',
      amber: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5 shadow-[0_0_15px_rgba(255,176,32,0.1)]',
      red: 'text-neon-red border-neon-red/20 bg-neon-red/5 shadow-[0_0_15px_rgba(255,59,92,0.1)]',
   };

   return (
      <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 group relative overflow-hidden cursor-pointer hover:border-white/10 transition-all">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-700 pointer-events-none">
            {icon}
         </div>
         <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2 rounded-sm border", colorMap[color])}>
               {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
            <div className={cn("text-[9px] font-mono font-bold flex items-center gap-1", trendUp ? 'text-neon-green' : 'text-neon-red')}>
               {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {trend}
            </div>
         </div>
         <div className="space-y-1">
            <div className="text-2xl font-black text-white italic font-orbitron leading-none tracking-tighter group-hover:neon-text-blue transition-all">{value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic leading-none mt-2">{label}</div>
         </div>
         <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">vs 11 May - 17 May</span>
            <ChevronRight size={10} className="text-slate-700 group-hover:text-neon-blue transition-transform" />
         </div>
      </div>
   );
}

function SubAnalysisMetric({ label, value, sub, color }: any) {
   const textColor = color === 'blue' ? 'text-neon-blue' : color === 'green' ? 'text-neon-green' : color === 'purple' ? 'text-neon-purple' : 'text-neon-cyan';
   return (
      <div className="space-y-2">
         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{label}</div>
         <div className={cn("text-lg font-black italic uppercase leading-none font-orbitron", textColor)}>{value}</div>
         <div className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter whitespace-nowrap">{sub}</div>
      </div>
   );
}

function CityPerformanceItem({ city, orders, growth, earnings, idx }: any) {
   return (
      <div className="flex items-center justify-between group hover:bg-white/5 p-2 rounded transition-all cursor-pointer">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:border-neon-blue/40 transition-all">
               {idx === 0 ? <Crown size={14} /> : <MapPin size={14} />}
            </div>
            <div>
               <div className="text-[11px] font-black text-white uppercase italic tracking-wide group-hover:text-neon-blue transition-colors">{city}</div>
               <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1 leading-none">{orders} Orders</div>
            </div>
         </div>
         <div className="text-right">
            <div className="text-[10px] font-black text-white italic">{earnings}</div>
            <div className="text-[9px] font-black text-neon-green italic uppercase mt-1 leading-none">{growth}</div>
         </div>
      </div>
   );
}

function RiderPerformanceItem({ name, trips, rating, revenue, idx }: any) {
   return (
      <div className="flex items-center justify-between group hover:bg-white/5 p-2 rounded transition-all cursor-pointer border border-transparent hover:border-white/5">
         <div className="flex items-center gap-3">
            <div className="relative">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="w-8 h-8 rounded-sm border border-white/10 group-hover:border-neon-purple transition-all" alt={name} />
               {idx === 0 && <div className="absolute -top-1 -right-1 bg-neon-amber text-[8px] p-0.5 rounded-full"><Trophy size={8} className="text-cyber-black" /></div>}
            </div>
            <div>
               <div className="text-[11px] font-black text-white uppercase italic tracking-wide group-hover:text-neon-purple transition-colors">{name}</div>
               <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1 leading-none">{trips} Orders</div>
            </div>
         </div>
         <div className="text-right">
            <div className="text-[10px] font-black text-white italic">{revenue}</div>
            <div className="text-[9px] font-black text-neon-amber italic uppercase mt-1 leading-none flex items-center justify-end gap-1 font-mono">
               <Star size={8} fill="#FFB020" stroke="none" /> {rating}
            </div>
         </div>
      </div>
   );
}

function MetricBreakdownRow({ label, icon, current, previous, change, trend }: any) {
   return (
      <tr className="group hover:bg-white/5 transition-colors border-b border-white/5">
         <td className="px-4 py-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-neon-blue transition-colors border border-white/10 group-hover:border-neon-blue/20">
                  {icon}
               </div>
               <span className="text-[11px] font-black text-white uppercase italic tracking-wide group-hover:text-neon-blue transition-colors">{label}</span>
            </div>
         </td>
         <td className="px-4 py-4 text-xs font-black font-mono text-white italic">{current}</td>
         <td className="px-4 py-4 text-xs font-black font-mono text-slate-500 italic">{previous}</td>
         <td className="px-4 py-4 text-right">
            <span className={cn(
               "text-[10px] font-black italic uppercase px-2 py-1 bg-white/5 rounded",
               change.includes('+') ? 'text-neon-green' : 'text-neon-red'
            )}>{change}</span>
         </td>
      </tr>
   );
}

function InsightItem({ icon, label, desc, color }: any) {
   const colors: any = {
      green: 'text-neon-green border-neon-green bg-neon-green/10',
      amber: 'text-neon-amber border-neon-amber bg-neon-amber/10',
      purple: 'text-neon-purple border-neon-purple bg-neon-purple/10',
      red: 'text-neon-red border-neon-red bg-neon-red/10',
   };

   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
         <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-1.5 rounded-sm border", colors[color])}>
               {React.cloneElement(icon as React.ReactElement, { size: 12 })}
            </div>
            <h5 className="text-[10px] font-black text-white uppercase italic tracking-wider group-hover:text-neon-purple transition-colors">{label}</h5>
         </div>
         <p className="text-[10px] text-slate-500 italic leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
      </div>
   );
}

function HealthWidget({ icon, label, value, status, color }: any) {
   return (
      <div className="space-y-2 p-3 bg-white/5 border border-white/5 rounded-sm group hover:border-neon-blue/40 transition-all cursor-default">
         <div className="flex items-center justify-between">
            <div className="text-slate-500 group-hover:text-neon-blue transition-colors">{icon}</div>
            <div className={cn("text-[8px] font-black italic uppercase", color === 'green' ? 'text-neon-green' : 'text-neon-blue')}>{status}</div>
         </div>
         <div>
            <div className="text-sm font-black text-white font-mono group-hover:text-neon-blue transition-colors leading-none">{value}</div>
            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-1 leading-none">{label}</div>
         </div>
         <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden mt-1">
            <div className={cn("h-full", color === 'green' ? 'bg-neon-green shadow-[0_0_5px_#00FF9D]' : 'bg-neon-blue')} style={{ width: value.includes('%') ? value : '80%' }} />
         </div>
      </div>
   );
}

function AnalyticsBreakdownItem({ label, value, color }: any) {
   return (
      <div className="flex items-center justify-between group cursor-pointer">
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
         </div>
         <span className="text-[11px] font-black text-white font-orbitron italic group-hover:text-neon-cyan transition-colors">{value}</span>
      </div>
   );
}

const ANALYTICS_TREND_DATA = [
   { name: '18 May', orders: 4200, earnings: 320000 },
   { name: '19 May', orders: 4800, earnings: 350000 },
   { name: '20 May', orders: 4100, earnings: 310000 },
   { name: '21 May', orders: 5200, earnings: 410000 },
   { name: '22 May', orders: 6400, earnings: 512000 },
   { name: '23 May', orders: 5800, earnings: 480000 },
   { name: '24 May', orders: 6200, earnings: 520000 },
];

const ORDER_TYPE_DATA = [
   { name: 'All Orders', value: 16245, percent: 65.3, color: '#00B2FF' },
   { name: 'Prime Orders', value: 5387, percent: 21.7, color: '#FFB020' },
   { name: 'Emergency Orders', value: 2614, percent: 10.5, color: '#FF3B5C' },
   { name: 'Others', value: 610, percent: 2.5, color: '#7c3aed' },
];

const PEAK_HOURS_DATA = [
   { time: '12am', val: 120 },
   { time: '2am', val: 80 },
   { time: '4am', val: 45 },
   { time: '6am', val: 60 },
   { time: '8am', val: 240 },
   { time: '10am', val: 320 },
   { time: '12pm', val: 480 },
   { time: '2pm', val: 420 },
   { time: '4pm', val: 380 },
   { time: '6pm', val: 640 },
   { time: '8pm', val: 820 },
   { time: '10pm', val: 560 },
];


// --- Withdraw Request Components ---

function WithdrawRequests() {
  const { requests, processWithdrawal } = useWithdrawals();
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'ALL') return true;
    return req.status === activeTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-cyan uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <ExternalLink size={12} /> RAjFleet_WITHDRAWAL_CONTROL_HUB
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
            WITHDRAW <span className="text-neon-cyan">REQUESTS</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">FIN_payout_v2.1</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Manage rider withdrawal requests, bank transfers, and payout verification protocols.
            <span className="text-neon-cyan ml-2 italic">Banking uplink established.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatusIndicator label="SYSTEM_HEALTH" value="OPTIMAL" color="green" />
          <StatusIndicator label="PENDING_REQ" value="12" color="orange" />
          <StatusIndicator label="TOTAL_PAYOUT" value="₹2.4M" color="blue" />
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10 font-sans">
        <WithdrawalMetricCard label="Total Requests" value="1,248" delta="+12%" icon={<FileText />} color="blue" />
        <WithdrawalMetricCard label="Pending Approval" value="42" delta="Urgent" icon={<Clock />} color="orange" />
        <WithdrawalMetricCard label="Approved Today" value="156" delta="₹8.4L" icon={<CheckCircle />} color="green" />
        <WithdrawalMetricCard label="Processing" value="28" delta="Active" icon={<RotateCcw />} color="cyan" />
        <WithdrawalMetricCard label="Failed" value="4" delta="Action required" icon={<AlertTriangle />} color="red" />
        <WithdrawalMetricCard label="Amount Disbursed" value="₹24.8L" delta="This week" icon={<DollarSign />} color="purple" />
      </div>

      {/* Main Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-[calc(100vh-420px)] min-h-[600px]">
        {/* Left Panel - Request Queue */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full">
           {/* Filters & Tabs */}
           <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex flex-col xl:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-sm">
                {['All', 'Pending', 'Under Review', 'Approved', 'Processing', 'Failed'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toUpperCase())}
                    className={cn(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm",
                      activeTab === tab.toUpperCase() 
                        ? "bg-neon-cyan text-cyber-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                        : "text-slate-500 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 w-full xl:w-auto">
                 <div className="relative flex-1 xl:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-neon-cyan transition-colors" size={14} />
                    <input 
                      type="text"
                      placeholder="SEARCH_BY_RIDER_OR_TXN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-cyber-black border border-white/10 rounded-sm py-1.5 pl-9 pr-4 text-[9px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-cyan/50 transition-all"
                    />
                 </div>
                 <button className="px-3 py-1.5 border border-white/10 text-white/50 hover:text-white transition-colors">
                    <Filter size={14} />
                 </button>
              </div>
           </div>

           {/* Queue Table */}
           <div className="flex-1 overflow-hidden glass-panel border-white/5 bg-cyber-black/40 flex flex-col">
              <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                 <table className="w-full text-left font-mono">
                    <thead className="bg-white/5 border-b border-white/5 sticky top-0 z-10">
                       <tr className="bg-cyber-deep/80 backdrop-blur-md">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Rider Details</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Requested</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Wallet Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Bank info</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Risk</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredRequests.map((req) => (
                         <tr 
                           key={req.id} 
                           onClick={() => setSelectedRequest(req)}
                           className={cn(
                             "transition-all cursor-pointer group hover:bg-white/[0.03]",
                             selectedRequest.id === req.id ? "bg-neon-cyan/5 border-l-2 border-l-neon-cyan" : "border-l-2 border-l-transparent"
                           )}
                         >
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="relative">
                                     <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-lg border border-white/10 bg-cyber-black group-hover:border-neon-cyan/30 transition-colors" />
                                     {req.verified && (
                                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-blue rounded-full border-2 border-cyber-black flex items-center justify-center">
                                          <Verified size={8} className="text-white" />
                                       </div>
                                     )}
                                  </div>
                                  <div>
                                     <div className="text-[11px] font-black text-white uppercase italic tracking-widest leading-none mb-1 group-hover:text-neon-cyan transition-colors">{req.name}</div>
                                     <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">ID: {req.riderId} <span className="mx-1">•</span> {req.city}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[12px] font-black text-white font-mono">{req.requestedAmount}</div>
                               <div className="text-[8px] font-mono text-slate-500 uppercase mt-1">{req.requestTime.split(',')[1]}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-black text-slate-300 font-mono italic">{req.walletBalance}</div>
                               <div className="flex gap-1 mt-1.5">
                                  <div className="h-1 flex-1 bg-neon-green/40 rounded-full" />
                                  <div className="h-1 flex-1 bg-white/10 rounded-full" />
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-black text-white uppercase tracking-tighter">{req.bankName}</div>
                               <div className="text-[9px] font-mono text-slate-500 mt-1">{req.accountNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn(
                                 "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-block border",
                                 req.status === 'PENDING' ? "bg-neon-orange/10 border-neon-orange/30 text-neon-orange" :
                                 req.status === 'APPROVED' ? "bg-neon-green/10 border-neon-green/30 text-neon-green" :
                                 req.status === 'PROCESSING' ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" : "bg-neon-red/10 border-neon-red/30 text-neon-red"
                               )}>
                                  {req.status}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className={cn(
                                 "text-[10px] font-black flex items-center justify-center gap-1.5",
                                 req.riskScore < 15 ? "text-neon-green" : req.riskScore < 40 ? "text-neon-orange" : "text-neon-red"
                               )}>
                                  <Shield size={10} /> {req.riskScore}%
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
           <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div 
                  key={selectedRequest.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                   {/* Rider Profile Card */}
                   <div className="glass-panel border-white/10 bg-cyber-black/60 p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Fingerprint size={120} className="text-neon-cyan" />
                      </div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                         <div className="relative mb-6">
                            <img src={selectedRequest.avatar} alt={selectedRequest.name} className="w-24 h-24 rounded-2xl border-2 border-neon-cyan/30 p-1 bg-cyber-black" />
                            <div className={cn(
                              "absolute translate-x-1/2 -translate-y-1/2 top-0 right-0 w-8 h-8 rounded-full border-4 border-cyber-black flex items-center justify-center text-[10px] font-black shadow-lg",
                              (selectedRequest.trustScore || 100) > 90 ? "bg-neon-green text-cyber-black" : "bg-neon-orange text-cyber-black"
                            )}>
                               {selectedRequest.trustScore || 100}
                            </div>
                         </div>
                         <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter font-orbitron mb-1">{selectedRequest.name}</h3>
                         <div className="text-[10px] font-mono text-neon-cyan uppercase tracking-[0.3em] font-black">RIDER_RANK_ELITE_PRIME</div>
                         
                         <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-white/5">
                            <div>
                               <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Lifetime Earnings</div>
                               <div className="text-sm font-black text-white font-mono">₹{(selectedRequest.lifetimeEarnings || 0).toLocaleString()}</div>
                            </div>
                            <div>
                               <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Wallet Balance</div>
                               <div className="text-sm font-black text-white font-mono">₹{(selectedRequest.walletBalance || 0).toLocaleString()}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Bank & Request Details */}
                   <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
                      <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-6 flex items-center gap-2">
                         <CreditCard size={14} className="text-neon-cyan" /> FINANCIAL_VERIFICATION
                      </h4>
                      <div className="space-y-4">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-sm glass-panel group hover:border-neon-cyan/40 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                               <div className="text-[10px] font-black text-white uppercase tracking-tighter leading-none italic">{selectedRequest.bankName || 'HDFC Bank'}</div>
                               <Verified size={14} className="text-neon-green" />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase mb-2">
                               <span>Acc Holder: {selectedRequest.name}</span>
                               <span>IFSC: {selectedRequest.ifsc || 'HDFC0001234'}</span>
                            </div>
                            <div className="text-lg font-black text-white font-mono tracking-widest border-t border-white/5 pt-3 group-hover:text-neon-cyan transition-colors">
                               {selectedRequest.accountNumber || 'XXXX XXXX 1234'}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                               <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Requested</div>
                               <div className="text-lg font-black text-neon-cyan italic font-orbitron">₹{(selectedRequest.amount || 0).toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                               <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Status</div>
                               <div className="text-[10px] font-black text-slate-400 italic uppercase">{selectedRequest.status}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Action Controls */}
                   <div className="grid grid-cols-2 gap-4 pb-12">
                      <button 
                        onClick={() => processWithdrawal(selectedRequest.id, 'APPROVED')}
                        className="col-span-2 py-4 bg-neon-green text-cyber-black text-[12px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={selectedRequest.status !== 'PENDING'}
                      >
                         <CheckCircle size={18} /> APPROVE_WITHDRAWAL_TXN
                      </button>
                      <button 
                        onClick={() => processWithdrawal(selectedRequest.id, 'REJECTED')}
                        className="col-span-2 py-3 border border-neon-red text-neon-red text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        disabled={selectedRequest.status !== 'PENDING'}
                      >
                         <Ban size={14} /> REJECT_REQUEST
                      </button>
                   </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] italic">
                   Select a request to review
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function WithdrawalMetricCard({ label, value, delta, icon, color }: { label: string, value: string, delta: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'border-neon-blue/20 text-neon-blue from-neon-blue/[0.03]',
    green: 'border-neon-green/20 text-neon-green from-neon-green/[0.03]',
    orange: 'border-neon-orange/20 text-neon-orange from-neon-orange/[0.03]',
    cyan: 'border-neon-cyan/20 text-neon-cyan from-neon-cyan/[0.03]',
    red: 'border-neon-red/20 text-neon-red from-neon-red/[0.03]',
    purple: 'border-neon-purple/20 text-neon-purple from-neon-purple/[0.03]',
  };
  return (
    <div className={cn("glass-panel p-5 bg-gradient-to-br border transition-all hover:border-white/20 group", colors[color])}>
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded border border-white/5 flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest px-2 py-0.5 border border-white/5 rounded-sm">
             {delta}
          </div>
       </div>
       <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 leading-none">{label}</div>
          <div className="text-xl font-black text-white italic tracking-tighter uppercase font-orbitron group-hover:translate-x-1 transition-transform">{value}</div>
       </div>
       <div className="mt-4 flex gap-1 items-end h-4">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={cn("w-full bg-white/10 rounded-sm group-hover:animate-pulse", i < 7 ? colors[color].split(' ')[1] : '')}
              style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} 
            />
          ))}
       </div>
    </div>
  );
}

function VIPStat({ label, value, color }: { label: string, value: string, color: 'orange' | 'green' | 'blue' }) {
  const colors: any = {
    orange: 'text-neon-orange',
    green: 'text-neon-green',
    blue: 'text-neon-blue'
  };
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
       <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={cn("text-xs font-black font-mono", colors[color])}>{value}</span>
    </div>
  );
}

// --- Earnings & Wallet Components ---

const EARNINGS_TRANSACTIONS_MOCK = [
  { id: "TXN-28471", type: "CREDIT", description: "Delivery Earnings - Order #RF-28471", reference: "Aman Kumar", amount: "+ ₹84.00", status: "SUCCESS", date: "24 May 2026, 11:35 AM" },
  { id: "TXN-28470", type: "CREDIT", description: "Incentive - 20 Extra Orders", reference: "Rohit Singh", amount: "+ ₹300.00", status: "SUCCESS", date: "24 May 2026, 10:22 AM" },
  { id: "TXN-28469", type: "DEBIT", description: "Payout to Bank **** 2345", reference: "System Payout", amount: "- ₹5,000.00", status: "SUCCESS", date: "24 May 2026, 09:15 AM" },
  { id: "TXN-28468", type: "CREDIT", description: "Surge Bonus", reference: "Vikash Kumar", amount: "+ ₹120.00", status: "SUCCESS", date: "24 May 2026, 08:40 AM" },
  { id: "TXN-28467", type: "DEBIT", description: "Cancellation Deduction", reference: "Order #RF-28466", amount: "- ₹25.00", status: "SUCCESS", date: "24 May 2026, 08:12 AM" },
];

function EarningsAndWallet() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-purple uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <DollarSign size={12} /> RAjFleet_EARNINGS_INTELLIGENCE_NODE
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
            EARNINGS <span className="text-neon-purple">& WALLET</span> <div className="h-8 w-[2px] bg-neon-purple/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">FIN_v4.2.0</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl">
            Track earnings, wallet balance and financial analytics in the delivery ecosystem.
            <span className="text-neon-purple ml-2 italic underline underline-offset-4 decoration-neon-purple/30">Financial matrix synchronized.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatusIndicator label="SYS_INTEGRITY" value="100%" color="green" />
          <StatusIndicator label="TOTAL_BALANCE" value="₹8,75,420" color="blue" />
          <StatusIndicator label="PENDING_PAYOUTS" value="₹2,18,760" color="orange" />
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10 font-sans">
        <FinancialMetricCard label="Total Balance" value="₹8,75,420.00" delta="Available Balance" trend="up" icon={<Wallet />} color="blue" />
        <FinancialMetricCard label="Today's Earnings" value="₹1,24,680.00" delta="+12.5% from yesterday" trend="up" icon={<TrendingUp />} color="green" />
        <FinancialMetricCard label="This Week Earnings" value="₹8,42,320.00" delta="+18.4% from last week" trend="up" icon={<Calendar />} color="purple" />
        <FinancialMetricCard label="This Month Earnings" value="₹32,45,780.00" delta="+22.7% from last month" trend="up" icon={<Briefcase />} color="orange" />
        <FinancialMetricCard label="Pending Payouts" value="₹2,18,760.00" delta="To be transferred" trend="up" icon={<AlertCircle />} color="red" />
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between glass-panel p-3 border-white/5 bg-cyber-black/80 relative z-10">
        <div className="flex flex-wrap gap-1">
          {['Overview', 'Transactions', 'Payouts', 'Rider Earnings', 'Incentives'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toUpperCase())}
              className={cn(
                "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all italic rounded-sm relative group overflow-hidden",
                activeTab === tab.toUpperCase() 
                  ? "bg-neon-purple text-cyber-black shadow-[0_0_25px_rgba(176,38,255,0.5)] z-10" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-sm">
             <Calendar size={12} /> 18 May 2026 - 24 May 2026
          </div>
          <button className="flex items-center gap-3 px-4 py-2 border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all rounded-sm">
            All Cities <ChevronRight size={10} className="rotate-90 opacity-40" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 font-sans">
        {/* Left Section - Charts & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           {/* Main Earnings Chart */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none mb-2">Earnings Overview</h3>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-[2px] bg-neon-blue" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Earnings (₹)</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-[2px] border-t border-dashed border-neon-orange" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Orders</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-1">
                    {['Daily', 'Weekly', 'Monthly'].map(p => (
                      <button key={p} className={cn("px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all", p === 'Daily' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white')}>
                        {p}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="h-[300px] relative">
                 <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
                    {[180, 240, 220, 280, 320, 260, 290, 240].map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-4 group/bar">
                         <div className="relative w-12 h-[200px] bg-white/[0.02] flex items-end overflow-hidden rounded-t-sm">
                            <div 
                              className="w-full bg-gradient-to-t from-neon-blue/40 to-neon-blue group-hover/bar:brightness-125 transition-all duration-700 shadow-[0_0_20px_rgba(0,178,255,0.2)]"
                              style={{ height: `${h / 4}%` }} 
                            />
                            <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-10 pointer-events-none bg-white blur-xl" />
                         </div>
                         <div className="text-[9px] font-mono text-slate-500 uppercase">{18 + i} May</div>
                      </div>
                    ))}
                 </div>
                 {/* Decorative Line */}
                 <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.05] pointer-events-none" />
                 <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/[0.05] pointer-events-none" />
                 <div className="absolute top-3/4 left-0 w-full h-[1px] bg-white/[0.05] pointer-events-none" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-white/5">
                 <MiniStatItem label="Total Earnings" value="₹8,42,320" delta="+ 18.4%" trend="up" color="green" />
                 <MiniStatItem label="Total Orders" value="4,856" delta="+ 15.2%" trend="up" color="green" />
                 <MiniStatItem label="Avg Order Value" value="₹173.48" delta="+ 2.6%" trend="up" color="green" />
                 <MiniStatItem label="Total Incentives" value="₹1,24,560" delta="+ 20.8%" trend="up" color="green" />
                 <MiniStatItem label="Cancellation Deduction" value="₹12,340" delta="+ 4.3%" trend="down" color="red" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings Breakdown */}
              <div className="glass-panel border-white/5 bg-cyber-black/40 p-6 flex flex-col items-center">
                 <h3 className="w-full text-[11px] font-black text-white uppercase tracking-widest italic mb-8">Earnings Breakdown</h3>
                 <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    <svg className="w-full h-full -rotate-90">
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-neon-blue/20" />
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="20" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 * 0.3} className="text-neon-blue shadow-[0_0_20px_rgba(0,178,255,0.4)]" />
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="20" fill="transparent" strokeDasharray={502.4} strokeDashoffset={-502.4 * 0.7} className="text-neon-purple shadow-[0_0_20px_rgba(176,38,255,0.4)]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-[10px] font-mono text-slate-500 uppercase mb-1">Total</span>
                       <span className="text-xl font-black text-white font-mono tracking-tighter">₹8,42,320</span>
                    </div>
                 </div>
                 <div className="w-full space-y-3">
                    <BreakdownItem label="Delivery Earnings" value="₹5,42,320" percent="64.4%" color="blue" />
                    <BreakdownItem label="Incentives" value="₹1,24,560" percent="14.8%" color="purple" />
                    <BreakdownItem label="Surge / Boost" value="₹98,750" percent="11.7%" color="orange" />
                    <BreakdownItem label="Other Earnings" value="₹76,690" percent="9.1%" color="slate" />
                 </div>
              </div>

              {/* Top Earning Riders */}
              <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Top Earning Riders</h3>
                    <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:underline">View All</button>
                 </div>
                 <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Rider</span>
                    <div className="flex gap-12">
                       <span className="text-[9px] font-mono text-slate-500 uppercase">Earnings</span>
                       <span className="text-[9px] font-mono text-slate-500 uppercase">Orders</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    {[
                      { name: 'Aman Kumar', earnings: '₹18,560', orders: 152, rank: 1 },
                      { name: 'Rohit Singh', earnings: '₹16,230', orders: 138, rank: 2 },
                      { name: 'Vikash Kumar', earnings: '₹15,480', orders: 134, rank: 3 },
                      { name: 'Sanjay Paswan', earnings: '₹14,670', orders: 121, rank: 4 },
                      { name: 'Deepak Kumar', earnings: '₹13,980', orders: 115, rank: 5 },
                    ].map((rider, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] rounded-sm group hover:border-white/10 transition-all">
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full italic shrink-0",
                              rider.rank === 1 ? "bg-neon-orange text-cyber-black" : 
                              rider.rank === 2 ? "bg-slate-400 text-cyber-black" : 
                              rider.rank === 3 ? "bg-amber-700 text-cyber-black" : "bg-white/5 text-slate-500"
                            )}>{rider.rank}</div>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name}`} alt={rider.name} className="w-8 h-8 rounded-full border border-white/10 bg-cyber-deep" />
                            <span className="text-[11px] font-black text-white uppercase italic tracking-widest truncate">{rider.name}</span>
                         </div>
                         <div className="flex items-center gap-12">
                            <span className="text-[11px] font-black text-neon-green font-mono">{rider.earnings}</span>
                            <span className="text-[11px] font-black text-white font-mono w-8 text-right">{rider.orders}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Recent Transactions */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Recent Transactions</h3>
                 <div className="flex items-center gap-4">
                    <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-neon-purple transition-colors" size={14} />
                       <input 
                         type="text" 
                         placeholder="FIND_TXN_ID..."
                         className="bg-cyber-black border border-white/10 rounded-sm py-1.5 pl-9 pr-4 text-[9px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-purple/50 transition-all"
                       />
                    </div>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left font-mono">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                       <tr>
                          {['Transaction ID', 'Type', 'Description', 'Rider / Reference', 'Amount', 'Status', 'Date & Time'].map(h => (
                            <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {EARNINGS_TRANSACTIONS_MOCK.map(txn => (
                         <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-black text-white uppercase tracking-tighter italic">#{txn.id}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn("text-[9px] font-black uppercase tracking-widest", txn.type === 'CREDIT' ? 'text-neon-green' : 'text-neon-red')}>
                                  {txn.type}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] text-white opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">{txn.description}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-black text-white uppercase italic tracking-widest">{txn.reference}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn("text-[11px] font-black font-mono", txn.type === 'CREDIT' ? 'text-neon-green' : 'text-neon-red')}>
                                  {txn.amount}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="px-2.5 py-0.5 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[8px] font-black uppercase tracking-widest rounded-sm inline-block">
                                  {txn.status}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] text-slate-500 uppercase whitespace-nowrap">{txn.date}</div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t border-white/5 bg-cyber-black/60 flex items-center justify-between">
                 <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, '...', 50].map((p, i) => (
                      <button 
                        key={i} 
                        className={cn(
                          "w-7 h-7 flex items-center justify-center text-[10px] font-black transition-all rounded-sm",
                          p === 1 ? "bg-neon-purple text-cyber-black" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                    <span>10 / page</span>
                    <ChevronRight size={12} className="rotate-90" />
                 </div>
              </div>
           </div>
        </div>

        {/* Right Section - Wallet Overview */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           {/* Wallet Summary */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <CreditCard size={120} className="text-neon-blue rotate-12" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic mb-8">Wallet Summary</h3>
                 <div className="flex items-start gap-6 mb-12">
                    <div className="w-16 h-16 bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue rounded-xl shadow-[0_0_30px_rgba(0,178,255,0.2)]">
                       <Wallet size={32} />
                    </div>
                    <div>
                       <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Available Balance</div>
                       <div className="text-4xl font-black text-white italic tracking-tighter uppercase font-orbitron">
                          ₹8,75,420<span className="text-xl text-slate-500 opacity-60">.00</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                       <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">Locked Amount <Info size={12} /></span>
                       <span className="text-sm font-black text-white font-mono tracking-tight">₹1,25,000.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Pending Payouts</span>
                       <span className="text-sm font-black text-white font-mono tracking-tight">₹2,18,760.00</span>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(0,178,255,0.4)] hover:brightness-110 active:scale-95 transition-all">
                       <Plus size={16} /> Add Money
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neon-orange/20 border border-neon-orange/40 text-neon-orange text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-orange hover:text-cyber-black active:scale-95 transition-all">
                       <ArrowUpRight size={16} /> Transfer to Bank
                    </button>
                 </div>
              </div>
           </div>

           {/* Payout Overview */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Payout Overview</h3>
                 <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                       <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-2">Total Payouts (This Week)</div>
                       <div className="text-xl font-black text-white font-mono tracking-tight">₹6,23,560</div>
                    </div>
                    <div className="text-[10px] font-black text-neon-green flex items-center gap-1">
                       <TrendingUp size={12} /> + 18.5%
                    </div>
                 </div>
                 <div className="space-y-3 pt-4 border-t border-white/5">
                    <PayoutStatItem label="Successful Payouts" value="45" delta="+ 10.2%" status="success" />
                    <PayoutStatItem label="Failed Payouts" value="2" delta="+ 1.2%" status="danger" />
                    <PayoutStatItem label="Processing" value="12" delta="+ 5.6%" status="warning" />
                 </div>
              </div>
           </div>

           {/* Earnings by City */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Earnings by City</h3>
                 <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:underline">View Report</button>
              </div>
              <div className="space-y-4">
                 {[
                   { name: 'Patna', value: '₹4,23,560', percent: 75, delta: '+ 18.2%' },
                   { name: 'Gaya', value: '₹1,42,780', percent: 45, delta: '+ 12.5%' },
                   { name: 'Muzaffarpur', value: '₹1,12,640', percent: 38, delta: '+ 15.8%' },
                   { name: 'Bhagalpur', value: '₹76,230', percent: 28, delta: '+ 10.1%' },
                   { name: 'Other Cities', value: '₹87,110', percent: 32, delta: '+ 8.7%' },
                 ].map((city, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-black text-white uppercase italic tracking-widest">{city.name}</span>
                         <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-white font-mono tracking-tight">{city.value}</span>
                            <span className="text-[9px] font-black text-neon-green font-mono">{city.delta}</span>
                         </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-neon-blue shadow-[0_0_10px_rgba(0,178,255,0.3)] transition-all duration-1000"
                           style={{ width: `${city.percent}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic mb-6">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                 <QuickActionItem icon={<Send />} label="Initiate Payout" color="blue" />
                 <QuickActionItem icon={<Briefcase />} label="Bulk Payout" color="green" />
                 <QuickActionItem icon={<Download />} label="Download Report" color="purple" />
                 <QuickActionItem icon={<Settings />} label="Payout Settings" color="orange" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FinancialMetricCard({ label, value, delta, trend, icon, color }: { label: string, value: string, delta: string, trend: 'up' | 'down', icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'border-neon-blue/30 from-neon-blue/[0.05] text-neon-blue hover:border-neon-blue shadow-neon-blue/10',
    green: 'border-neon-green/30 from-neon-green/[0.05] text-neon-green hover:border-neon-green shadow-neon-green/10',
    purple: 'border-neon-purple/30 from-neon-purple/[0.05] text-neon-purple hover:border-neon-purple shadow-neon-purple/10',
    orange: 'border-neon-orange/30 from-neon-orange/[0.05] text-neon-orange hover:border-neon-orange shadow-neon-orange/10',
    red: 'border-neon-red/30 from-neon-red/[0.05] text-neon-red hover:border-neon-red shadow-neon-red/10',
  };

  return (
    <div className={cn("glass-panel p-6 bg-gradient-to-br transition-all hover:bg-white/[0.02] group", colors[color])}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
           {icon}
        </div>
        <div className={cn("text-[9px] font-black flex items-center gap-1", trend === 'up' ? 'text-neon-green' : 'text-neon-red')}>
           {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
           {delta.split(' ')[0]}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</div>
        <div className="text-2xl font-black text-white italic tracking-tighter uppercase font-orbitron">{value}</div>
        <div className="text-[9px] font-mono text-slate-600 mt-2 uppercase">{delta}</div>
      </div>
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={cn("h-full opacity-50", 
            color === 'blue' ? 'bg-neon-blue' : 
            color === 'green' ? 'bg-neon-green' : 
            color === 'purple' ? 'bg-neon-purple' : 
            color === 'orange' ? 'bg-neon-orange' : 'bg-neon-red'
         )} style={{ width: '40%' }} />
      </div>
    </div>
  );
}

function MiniStatItem({ label, value, delta, trend, color }: { label: string, value: string, delta: string, trend: 'up' | 'down', color: string }) {
  return (
    <div className="space-y-1">
       <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest truncate">{label}</div>
       <div className="text-sm font-black text-white font-mono tracking-tighter">{value}</div>
       <div className={cn("text-[8px] font-black flex items-center gap-1", color === 'green' ? 'text-neon-green' : 'text-neon-red')}>
          {trend === 'up' ? '↑' : '↓'} {delta}
       </div>
    </div>
  );
}

// --- Notifications Center Components ---

const NOTIFICATIONS_MOCK = [
  {
    id: "NOTIF-001",
    type: "CRITICAL",
    title: "Emergency Order Assigned",
    description: "Order #RF-28471 has been assigned to Aman Kumar. Immediate oversight required.",
    timestamp: "11:40 AM",
    date: "Today",
    isRead: false,
    priority: "High Priority",
    category: "System",
    orderId: "RF-28471",
    store: "RAJHOME Express",
    customer: "Rajesh Kumar",
    location: "Kankarbagh Main Road, Patna",
    eta: "14 mins",
    assignedAt: "11:40 AM, 24 May 2026",
    icon: <ShieldAlert size={16} />
  },
  {
    id: "NOTIF-002",
    type: "ORDER",
    title: "Order Picked Up",
    description: "Rohit Singh has picked up order #RF-28469 from RAJHOME Mart.",
    timestamp: "11:32 AM",
    date: "Today",
    isRead: false,
    priority: "Standard",
    category: "Order Update",
    orderId: "RF-28469",
    store: "RAJHOME Mart",
    customer: "Amit Singh",
    location: "Boring Road, Patna",
    eta: "22 mins",
    icon: <Package size={16} />
  },
  {
    id: "NOTIF-003",
    type: "EARNINGS",
    title: "Payout Credited",
    description: "₹2,450 credited to Rajesh Kumar's wallet.",
    timestamp: "11:25 AM",
    date: "Today",
    isRead: true,
    category: "Earnings",
    amount: "₹2,450",
    balance: "₹18,230",
    reference: "TXN-92841028",
    icon: <Wallet size={16} />
  },
  {
    id: "NOTIF-004",
    type: "INCENTIVE",
    title: "Incentive Unlocked",
    description: "Congratulations! 20 extra orders completed. ₹300 bonus unlocked.",
    timestamp: "11:10 AM",
    date: "Today",
    isRead: false,
    category: "Incentive",
    bonus: "₹300",
    target: "20 Orders",
    typeLabel: "Volume Bonus",
    icon: <ZapIcon size={16} />
  },
  {
    id: "NOTIF-005",
    type: "SYSTEM",
    title: "System Maintenance",
    description: "Scheduled maintenance on 26 May 2026 from 02:00 AM to 04:00 AM.",
    timestamp: "10:55 AM",
    date: "Today",
    isRead: true,
    category: "System Alert",
    impact: "Sector-A Nodes",
    duration: "2 Hours",
    icon: <Activity size={16} />
  },
  {
    id: "NOTIF-006",
    type: "ORDER",
    title: "New Order Received",
    description: "New order #RF-28465 received from Fresh Basket.",
    timestamp: "09:45 PM",
    date: "Yesterday",
    isRead: true,
    category: "Order Update",
    orderId: "RF-28465",
    store: "Fresh Basket",
    icon: <ShoppingBag size={16} />
  },
  {
    id: "NOTIF-007",
    type: "EARNINGS",
    title: "Withdrawal Successful",
    description: "₹5,000 withdrawn successfully to Bank **** 2345.",
    timestamp: "08:30 PM",
    date: "Yesterday",
    isRead: true,
    category: "Earnings",
    amount: "₹5,000",
    bank: "HDFC BANK",
    icon: <Wallet size={16} />
  },
];

function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedNotif, setSelectedNotif] = useState(NOTIFICATIONS_MOCK[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifs = NOTIFICATIONS_MOCK.filter(n => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UNREAD') return !n.isRead;
    return n.type === activeTab;
  }).filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Notifications Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Bell size={12} /> RAjFleet_NOTIFICATION_COMMAND_HUB
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron text-glow-blue">
            NOTIFICATIONS <span className="text-neon-cyan">CENTER</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">LOGS_SYS_v4.0</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Real-time alerts, updates and system notifications across the entire delivery network.
            <span className="text-neon-cyan ml-2 italic">Neural logs linked.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <StatusIndicator label="SYS_UPLINK" value="STABLE" color="green" />
           <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                 <span className="text-[9px] font-mono text-slate-500 uppercase">Live Feed</span>
              </div>
              <div className="text-[10px] font-black font-mono text-white tracking-widest">128_NEW_TODAY</div>
           </div>
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10 font-sans">
        <NotificationMetricCard label="All Notifications" value="128" delta="+18% from yesterday" icon={<Bell />} color="blue" trend="up" />
        <NotificationMetricCard label="Order Updates" value="72" delta="+14% from yesterday" icon={<Package />} color="green" trend="up" />
        <NotificationMetricCard label="Earnings & Payouts" value="18" delta="+9% from yesterday" icon={<Wallet />} color="orange" trend="up" />
        <NotificationMetricCard label="Incentives & Offers" value="22" delta="+21% from yesterday" icon={<ZapIcon />} color="purple" trend="up" />
        <NotificationMetricCard label="System Alerts" value="16" delta="+33% from yesterday" icon={<ShieldAlert />} color="red" trend="up" />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 min-h-[700px]">
        {/* Left Section - Notifications Feed */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
           {/* Filters & Tabs */}
           <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex flex-col xl:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-sm">
                {[
                  { id: 'ALL', label: 'All', count: 128 },
                  { id: 'UNREAD', label: 'Unread', count: 12 },
                  { id: 'ORDER', label: 'Order Updates', count: 72 },
                  { id: 'EARNINGS', label: 'Earnings', count: 18 },
                  { id: 'INCENTIVE', label: 'Incentives', count: 22 },
                  { id: 'SYSTEM', label: 'System', count: 16 },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2",
                      activeTab === tab.id 
                        ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(0,178,255,0.4)]" 
                        : "text-slate-500 hover:text-white"
                    )}
                  >
                    {tab.label} <span className={cn("px-1.5 py-0.5 rounded-full text-[8px]", activeTab === tab.id ? "bg-cyber-black/20" : "bg-white/5")}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-all">
                 <CheckCircle size={14} /> Mark all as read
              </button>
           </div>

           {/* Feed */}
           <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 max-h-[800px]">
              {/* Today Section */}
              <div className="space-y-4">
                 <div className="text-[10px] font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                    Today <div className="h-[1px] flex-1 bg-white/5" />
                 </div>
                 <div className="space-y-3">
                    {filteredNotifs.filter(n => n.date === 'Today').map(notif => (
                       <NotificationItem 
                          key={notif.id} 
                          notif={notif} 
                          isActive={selectedNotif.id === notif.id}
                          onClick={() => setSelectedNotif(notif)}
                       />
                    ))}
                 </div>
              </div>

              {/* Yesterday Section */}
              <div className="space-y-4">
                 <div className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest flex items-center gap-4">
                    Yesterday <div className="h-[1px] flex-1 bg-white/5" />
                 </div>
                 <div className="space-y-3">
                    {filteredNotifs.filter(n => n.date === 'Yesterday').map(notif => (
                       <NotificationItem 
                          key={notif.id} 
                          notif={notif} 
                          isActive={selectedNotif.id === notif.id}
                          onClick={() => setSelectedNotif(notif)}
                       />
                    ))}
                 </div>
              </div>

              {/* Load More */}
              <div className="flex justify-center p-8 border-t border-white/5 font-sans">
                 <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-slate-500 hover:text-neon-blue transition-colors">
                       <ChevronRight className="rotate-180" size={14} />
                    </button>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(p => (
                          <button key={p} className={cn("w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center transition-all", p === 1 ? "bg-neon-blue text-cyber-black" : "text-slate-500 hover:text-white")}>{p}</button>
                       ))}
                       <span className="text-slate-700 flex items-end px-2">...</span>
                       <button className="w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center text-slate-500 hover:text-white">13</button>
                    </div>
                    <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-slate-500 hover:text-neon-blue transition-colors">
                       <ChevronRight size={14} />
                    </button>
                    <div className="ml-8 border border-white/10 rounded overflow-hidden">
                       <select className="bg-cyber-black text-[10px] font-bold text-white px-3 py-1.5 focus:outline-none">
                          <option>10 / page</option>
                          <option>25 / page</option>
                          <option>50 / page</option>
                       </select>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Section - Details & Insights */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-12">
           <AnimatePresence mode="wait">
              <motion.div 
                key={selectedNotif.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                 {/* Detail Panel */}
                 <div className="glass-panel border-white/10 bg-cyber-black/80 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Bell size={120} className="text-neon-blue" />
                    </div>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                       <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">Notification Details</h3>
                       <button className="text-slate-500 hover:text-white transition-colors"><Plus className="rotate-45" size={16} /></button>
                    </div>
                    <div className="p-8">
                       <div className="flex items-center gap-6 mb-10">
                          <div className={cn(
                             "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500 relative",
                             selectedNotif.type === 'CRITICAL' ? "bg-neon-red/20 border-2 border-neon-red/40 neon-glow-red" :
                             selectedNotif.type === 'ORDER' ? "bg-neon-blue/20 border-2 border-neon-blue/40 neon-glow-blue" :
                             selectedNotif.type === 'EARNINGS' ? "bg-neon-green/20 border-2 border-neon-green/40 neon-glow-green" :
                             selectedNotif.type === 'INCENTIVE' ? "bg-neon-purple/20 border-2 border-neon-purple/40 neon-glow-purple" : "bg-neon-orange/20 border-2 border-neon-orange/40 neon-glow-orange"
                          )}>
                             {React.cloneElement(selectedNotif.icon as React.ReactElement, { size: 28 })}
                             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-black rounded-full border border-white/10 flex items-center justify-center">
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                                   selectedNotif.type === 'CRITICAL' ? "bg-neon-red" : 
                                   selectedNotif.type === 'ORDER' ? "bg-neon-blue" : 
                                   selectedNotif.type === 'EARNINGS' ? "bg-neon-green" : 
                                   selectedNotif.type === 'INCENTIVE' ? "bg-neon-purple" : "bg-neon-orange"
                                )} />
                             </div>
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter font-orbitron leading-none">{selectedNotif.title}</h4>
                                {selectedNotif.priority && (
                                   <span className={cn("px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest", selectedNotif.priority === 'High Priority' ? "bg-neon-red/20 text-neon-red" : "bg-white/10 text-slate-400")}>{selectedNotif.priority}</span>
                                )}
                             </div>
                             <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">{selectedNotif.description}</p>
                          </div>
                       </div>

                       {/* Contextual Info */}
                       <div className="space-y-6 pt-6 border-t border-white/5">
                          {selectedNotif.type === 'ORDER' || selectedNotif.type === 'CRITICAL' ? (
                             <div className="grid grid-cols-2 gap-y-6 font-sans">
                                <DetailInfo label="Order ID" value={selectedNotif.orderId || 'N/A'} />
                                <DetailInfo label="Store" value={selectedNotif.store || 'N/A'} />
                                <DetailInfo label="Customer" value={selectedNotif.customer || 'N/A'} />
                                <DetailInfo label="Delivery Location" value={selectedNotif.location || 'N/A'} />
                                <DetailInfo label="ETA" value={selectedNotif.eta || 'N/A'} />
                                <DetailInfo label="Assigned At" value={selectedNotif.assignedAt || 'N/A'} />
                             </div>
                          ) : selectedNotif.type === 'EARNINGS' ? (
                             <div className="grid grid-cols-2 gap-y-6 font-sans">
                                <DetailInfo label="Amount Credited" value={selectedNotif.amount || 'N/A'} />
                                <DetailInfo label="New Wallet Balance" value={selectedNotif.balance || 'N/A'} />
                                <DetailInfo label="Transaction Ref" value={selectedNotif.reference || 'N/A'} />
                                <DetailInfo label="Status" value="Success" status="green" />
                             </div>
                          ) : (
                             <div className="grid grid-cols-2 gap-y-6 font-sans">
                                <DetailInfo label="Category" value={selectedNotif.category || 'N/A'} />
                                <DetailInfo label="Timestamp" value={selectedNotif.timestamp || 'N/A'} />
                                <DetailInfo label="Node Status" value="Active" status="green" />
                                <DetailInfo label="Region" value="Patna Central" />
                             </div>
                          )}
                       </div>

                       <button className="w-full mt-10 py-3 bg-neon-red/10 border border-neon-red/30 text-neon-red text-[11px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all flex items-center justify-center gap-3">
                          View Order Details <ExternalLink size={14} />
                       </button>
                    </div>
                 </div>

                 {/* Notification Insights Widget */}
                 <div className="glass-panel border-white/10 bg-cyber-black/60 p-8">
                    <div className="flex items-center justify-between mb-10">
                       <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                          <Activity size={14} className="text-neon-blue" /> Notification Insights
                       </h4>
                       <select className="bg-white/5 border border-white/10 text-[9px] font-black text-white px-3 py-1 rounded-sm focus:outline-none uppercase italic">
                          <option>Last 7 Days</option>
                          <option>Last 30 Days</option>
                       </select>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="w-32 h-32 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                   data={[
                                      { name: 'Orders', value: 48, color: '#00B2FF' },
                                      { name: 'Earnings', value: 19, color: '#00FF9D' },
                                      { name: 'Incentives', value: 15, color: '#B026FF' },
                                      { name: 'System', value: 13, color: '#FFB020' },
                                      { name: 'Others', value: 5, color: '#475569' },
                                   ]}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={45}
                                   outerRadius={60}
                                   paddingAngle={5}
                                   dataKey="value"
                                >
                                   {[
                                      { color: '#00B2FF' },
                                      { color: '#00FF9D' },
                                      { color: '#B026FF' },
                                      { color: '#FFB020' },
                                      { color: '#475569' },
                                   ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                </Pie>
                             </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-xl font-black text-white italic font-orbitron leading-none">512</span>
                             <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Total</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-2">
                          <InsightLegend label="Order Updates" value="245 (48%)" color="blue" />
                          <InsightLegend label="Earnings" value="96 (19%)" color="green" />
                          <InsightLegend label="Incentives" value="78 (15%)" color="purple" />
                          <InsightLegend label="System Alerts" value="65 (13%)" color="orange" />
                          <InsightLegend label="Others" value="28 (5%)" color="slate" />
                       </div>
                    </div>
                 </div>

                 {/* Quick Actions Panel */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <QuickActionItem icon={<Send size={18} />} label="Broadcast Notice" color="blue" />
                       <QuickActionItem icon={<Award size={18} />} label="Send Incentive" color="orange" />
                       <QuickActionItem icon={<Bell size={18} />} label="Create Alert" color="green" />
                       <QuickActionItem icon={<ZapIcon size={18} />} label="Promo Push" color="purple" />
                    </div>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NotificationMetricCard({ label, value, delta, icon, color, trend }: { label: string, value: string, delta: string, icon: React.ReactNode, color: string, trend: 'up' | 'down' }) {
  const colors: any = {
    blue: 'border-neon-blue/20 text-neon-blue from-neon-blue/[0.03]',
    green: 'border-neon-green/20 text-neon-green from-neon-green/[0.03]',
    orange: 'border-neon-orange/20 text-neon-orange from-neon-orange/[0.03]',
    purple: 'border-neon-purple/20 text-neon-purple from-neon-purple/[0.03]',
    red: 'border-neon-red/20 text-neon-red from-neon-red/[0.03]',
  };
  return (
    <div className={cn("glass-panel p-5 bg-gradient-to-br border transition-all hover:bg-white/[0.02] group", colors[color])}>
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyber-black border border-white/5 shadow-lg relative group-hover:scale-110 transition-transform duration-500">
             {icon}
             <div className="absolute inset-0 rounded-xl bg-current opacity-5 animate-pulse" />
          </div>
          <div className="flex flex-col items-end">
             <div className={cn("text-[9px] font-black flex items-center gap-1", trend === 'up' ? "text-neon-green" : "text-neon-red")}>
                {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {delta.split(' ')[0]}
             </div>
             <div className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mt-1">Since yesterday</div>
          </div>
       </div>
       <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-3xl font-black text-white italic tracking-tighter uppercase font-orbitron leading-none">{value}</div>
       </div>
    </div>
  );
}

function NotificationItem({ notif, isActive, onClick }: { notif: any, isActive: boolean, onClick: () => void, key?: any }) {
  const typeColors: any = {
    CRITICAL: 'text-neon-red border-neon-red shadow-[0_0_10px_rgba(255,59,92,0.3)]',
    ORDER: 'text-neon-blue border-neon-blue shadow-[0_0_10px_rgba(0,178,255,0.3)]',
    EARNINGS: 'text-neon-green border-neon-green shadow-[0_0_10px_rgba(0,255,157,0.3)]',
    INCENTIVE: 'text-neon-purple border-neon-purple shadow-[0_0_10px_rgba(176,38,255,0.3)]',
    SYSTEM: 'text-neon-orange border-neon-orange shadow-[0_0_10px_rgba(255,176,32,0.3)]',
  };

  const typeBg: any = {
    CRITICAL: 'bg-neon-red/10 border-neon-red/30',
    ORDER: 'bg-neon-blue/10 border-neon-blue/30',
    EARNINGS: 'bg-neon-green/10 border-neon-green/30',
    INCENTIVE: 'bg-neon-purple/10 border-neon-purple/30',
    SYSTEM: 'bg-neon-orange/10 border-neon-orange/30',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-panel p-4 border transition-all cursor-pointer group flex items-center justify-between",
        isActive ? "border-neon-blue/40 bg-neon-blue/5 shadow-[0_0_30px_rgba(0,178,255,0.1)]" : "border-white/5 bg-cyber-black/40 hover:border-white/20",
        !notif.isRead && !isActive && "border-l-neon-blue/40"
      )}
    >
       <div className="flex items-center gap-6">
          <div className="relative">
             <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center p-2 border",
                typeBg[notif.type]
             )}>
                {React.cloneElement(notif.icon as React.ReactElement, { className: isActive ? "text-white" : "" })}
             </div>
             {!notif.isRead && (
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,178,255,0.8)] border-2 border-cyber-black" />
             )}
          </div>
          <div>
             <div className="flex items-center gap-3 mb-1">
                <h4 className={cn("text-[11px] font-black uppercase italic tracking-widest transition-colors", isActive ? "text-neon-cyan" : "text-white group-hover:text-neon-cyan")}>{notif.title}</h4>
                {notif.priority === 'High Priority' && <span className="w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse" />}
             </div>
             <p className="text-[10px] text-slate-500 font-mono tracking-tighter leading-none max-w-md truncate">{notif.description}</p>
          </div>
       </div>
       <div className="text-right flex flex-col items-end gap-2">
          <div className="text-[9px] font-mono text-slate-500 tracking-widest h-4">{notif.timestamp}</div>
          <div className={cn(
             "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border",
             notif.type === 'CRITICAL' ? "bg-neon-red/10 border-neon-red/30 text-neon-red" :
             notif.type === 'ORDER' ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" :
             notif.type === 'EARNINGS' ? "bg-neon-green/10 border-neon-green/30 text-neon-green" :
             notif.type === 'INCENTIVE' ? "bg-neon-purple/10 border-neon-purple/30 text-neon-purple" : "bg-neon-orange/10 border-neon-orange/30 text-neon-orange"
          )}>
             {notif.priority === 'High Priority' ? 'High Priority' : notif.category.split(' ')[0]}
          </div>
          <ChevronRight size={14} className={cn("transition-all duration-300", isActive ? "text-neon-blue translate-x-1" : "text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
       </div>
    </div>
  );
}

function DetailInfo({ label, value, status }: { label: string, value: string, status?: string }) {
  return (
    <div>
       <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 leading-none">{label}</div>
       <div className={cn("text-sm font-black text-white italic tracking-tighter uppercase leading-none truncate", status === 'green' && "text-neon-green")}>
          {value}
       </div>
    </div>
  );
}

function InsightLegend({ label, value, color }: { label: string, value: string, color: string }) {
  const colors: any = {
    blue: 'bg-neon-blue shadow-neon-blue',
    green: 'bg-neon-green shadow-neon-green',
    purple: 'bg-neon-purple shadow-neon-purple',
    orange: 'bg-neon-orange shadow-neon-orange',
    slate: 'bg-slate-500 shadow-slate-500',
  };
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", colors[color])} />
          <span className="text-[9px] font-black text-white uppercase italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
       </div>
       <span className="text-[9px] font-black text-slate-400 font-mono italic group-hover:text-white transition-colors">{value}</span>
    </div>
  );
}


// --- Support System Components ---

const TICKETS_MOCK = [
  {
    id: "TK-28471",
    title: "Order not received by customer",
    description: "The customer has not received the order till now. It's showing as delivered in the system.",
    customer: "Rajesh Kumar",
    location: "Kankarbagh Main Road, Patna",
    amount: "₹1,250",
    orderId: "RF-28471",
    store: "RAJHOME Express",
    type: "Customer",
    priority: "High",
    status: "Open",
    assignee: "Sneha P.",
    assigneeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    updated: "5 mins ago",
    channel: "App",
    phone: "+91 91234 56789",
    timestamp: "24 May 2026, 11:35 AM",
    category: "Order Issue",
    slaStatus: "At Risk",
    slaTime: "18m / 30m"
  },
  {
    id: "TK-28469",
    title: "Rider is not following the route",
    description: "The rider is taking a significantly longer route than suggested, causing delay.",
    rider: "Aman Kumar",
    riderId: "BR01XZ4921",
    type: "Rider",
    priority: "Medium",
    status: "In Progress",
    assignee: "Rohit S.",
    assigneeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
    updated: "12 mins ago",
    category: "Navigation",
    slaStatus: "Normal",
    slaTime: "12m / 45m"
  },
  {
    id: "TK-28468",
    title: "Refund not processed",
    description: "Customer claiming refund for order #RF-28400 has not been credited yet.",
    customer: "Vikash Singh",
    location: "Patna",
    type: "Customer",
    priority: "Low",
    status: "Open",
    assignee: "Neha R.",
    assigneeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    updated: "18 mins ago",
    category: "Payment",
  },
  {
    id: "TK-28467",
    title: "Store marked as closed but accepting orders",
    description: "Fresh Basket is marked closed on map but dispatch notifications are active.",
    store: "Fresh Basket",
    location: "Kankarbagh",
    type: "Store",
    priority: "High",
    status: "In Progress",
    assignee: "Arjun M.",
    assigneeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    updated: "25 mins ago",
    category: "Store Status",
  },
  {
    id: "TK-28465",
    title: "Wrong item delivered",
    description: "Customer received paratha instead of chicken biryani.",
    customer: "Pooja Singh",
    location: "Patna",
    type: "Customer",
    priority: "Medium",
    status: "Open",
    assignee: "Sneha P.",
    assigneeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    updated: "35 mins ago",
    category: "Food Quality",
  },
];

const AGENTS_MOCK = [
  { name: "Sneha Patel", status: "Live", resolved: 18, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha" },
  { name: "Rohit Singh", status: "Live", resolved: 14, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit" },
  { name: "Neha Raj", status: "Online", resolved: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
  { name: "Arjun Mehta", status: "Away", resolved: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
];

function SupportSystem() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(TICKETS_MOCK[0]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <MatrixRain />
      
      {/* Support Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Headset size={12} /> RAjFleet_SUPPORT_SYSTEM_V2
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron text-glow-blue">
            SUPPORT <span className="text-neon-cyan">SYSTEM</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">DISPATCH_CORE</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Manage customer & rider support with smart tools and real-time monitoring.
            <span className="text-neon-cyan ml-2 italic">Operational network active.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 font-sans">
           <StatusIndicator label="SYSTEM_HEALTHY" value="STABLE" color="green" />
           <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                 <span className="text-[9px] font-mono text-slate-500 uppercase">Live Queue</span>
              </div>
              <div className="text-[10px] font-black font-mono text-white tracking-widest">64_OPEN_TICKETS</div>
           </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10 font-sans">
        <SupportMetricCard label="Open Tickets" value="64" delta="+16% from yesterday" icon={<Headset />} color="blue" />
        <SupportMetricCard label="In Progress" value="12" delta="+8% from yesterday" icon={<Clock />} color="purple" />
        <SupportMetricCard label="Resolved Today" value="186" delta="+22% from yesterday" icon={<CheckCircle />} color="green" />
        <SupportMetricCard label="Avg. Response Time" value="2h 18m" delta="15% faster" icon={<Timer />} color="orange" />
        <SupportMetricCard label="High Priority" value="3" delta="Requires attention" icon={<AlertTriangle />} color="red" />
        <SupportMetricCard label="Customer Satisfaction" value="4.8" delta="Excellent" icon={<Star />} color="blue" />
      </div>

      {/* Main Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-[calc(100vh-420px)] min-h-[700px]">
        {/* Left Panel - Ticket Queue */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full">
           {/* Filters & Tabs */}
           <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex flex-col xl:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-sm">
                {[
                  { id: 'ALL', label: 'All Tickets', count: 64 },
                  { id: 'RIDER', label: 'Rider Support', count: 36 },
                  { id: 'CUSTOMER', label: 'Customer Support', count: 20 },
                  { id: 'STORE', label: 'Store Support', count: 8 },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2",
                      activeTab === tab.id 
                        ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(0,178,255,0.4)]" 
                        : "text-slate-500 hover:text-white"
                    )}
                  >
                    {tab.label} <span className={cn("px-1.5 py-0.5 rounded-full text-[8px]", activeTab === tab.id ? "bg-cyber-black/20" : "bg-white/5")}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                 <select className="bg-cyber-black border border-white/10 text-[9px] font-black text-white px-3 py-1.5 focus:outline-none uppercase">
                   <option>All Status</option>
                   <option>Open</option>
                   <option>Pending</option>
                   <option>Resolved</option>
                 </select>
                 <select className="bg-cyber-black border border-white/10 text-[9px] font-black text-white px-3 py-1.5 focus:outline-none uppercase">
                   <option>All Categories</option>
                   <option>Order Issue</option>
                   <option>Payment</option>
                 </select>
              </div>
           </div>

           {/* Table Queue */}
           <div className="flex-1 overflow-hidden glass-panel border-white/5 bg-cyber-black/40 flex flex-col">
              <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                 <table className="w-full text-left font-mono">
                    <thead className="bg-white/5 border-b border-white/5 sticky top-0 z-10">
                       <tr className="bg-cyber-deep/80 backdrop-blur-md">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Ticket Details</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Assignee</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Updated</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {TICKETS_MOCK.map((ticket) => (
                         <tr 
                           key={ticket.id} 
                           onClick={() => setSelectedTicket(ticket)}
                           className={cn(
                             "transition-all cursor-pointer group hover:bg-white/[0.03]",
                             selectedTicket.id === ticket.id ? "bg-neon-blue/5 border-l-2 border-l-neon-blue" : "border-l-2 border-l-transparent"
                           )}
                         >
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                                    ticket.priority === 'High' ? "bg-neon-red/10 border-neon-red/30 text-neon-red shadow-[0_0_10px_rgba(255,59,92,0.2)]" : 
                                    ticket.priority === 'Medium' ? "bg-neon-orange/10 border-neon-orange/30 text-neon-orange" : "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                                  )}>
                                     {ticket.type === 'Customer' ? <User size={16} /> : ticket.type === 'Rider' ? <Bike size={16} /> : <Store size={16} />}
                                  </div>
                                  <div>
                                     <div className="text-[11px] font-black text-white uppercase italic tracking-widest leading-none mb-1 group-hover:text-neon-cyan transition-colors">#{ticket.id} <span className={cn("ml-2 px-1.5 py-0.5 rounded-sm text-[8px] font-bold", 
                                        ticket.priority === 'High' ? "bg-neon-red/20 text-neon-red" : 
                                        ticket.priority === 'Medium' ? "bg-neon-orange/20 text-neon-orange" : "bg-neon-green/20 text-neon-green"
                                     )}>{ticket.priority}</span></div>
                                     <div className="text-[10px] font-black text-slate-300 truncate max-w-[200px] mb-1">{ticket.title}</div>
                                     <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                                        {ticket.customer || ticket.rider || ticket.store} <span className="mx-1">•</span> {ticket.location}
                                     </div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn(
                                 "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-block border",
                                 ticket.type === 'Customer' ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" :
                                 ticket.type === 'Rider' ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-neon-purple/10 border-neon-purple/30 text-neon-purple"
                               )}>
                                  {ticket.type}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn(
                                 "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-block border",
                                 ticket.priority === 'High' ? "bg-neon-red/10 border-neon-red/30 text-neon-red" :
                                 ticket.priority === 'Medium' ? "bg-neon-orange/10 border-neon-orange/30 text-neon-orange" : "bg-neon-green/10 border-neon-green/30 text-neon-green"
                               )}>
                                  {ticket.priority}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn(
                                 "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-block border",
                                 ticket.status === 'Open' ? "bg-neon-red/10 border-neon-red/30 text-neon-red animate-pulse" :
                                 ticket.status === 'In Progress' ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" : "bg-neon-green/10 border-neon-green/30 text-neon-green"
                               )}>
                                  {ticket.status}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <img src={ticket.assigneeAvatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                  <div className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter">{ticket.assignee}</div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{ticket.updated}</div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right Panel - Ticket Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
           <AnimatePresence mode="wait">
              <motion.div 
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 {/* Ticket Header Card */}
                 <div className="glass-panel border-white/10 bg-cyber-black/60 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Headset size={100} className="text-neon-cyan" />
                    </div>
                    <div className="relative z-10">
                       <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", selectedTicket.priority === 'High' ? "bg-neon-red/20 border-neon-red/40" : "bg-white/5 border-white/10 text-slate-500")}>
                                <AlertTriangle size={20} />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter font-orbitron leading-none mb-1">#{selectedTicket.id}</h3>
                                <div className={cn("px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-block border bg-neon-red/10 border-neon-red/30 text-neon-red")}>OPEN</div>
                             </div>
                          </div>
                          <button className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                       </div>
                       <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest mb-4">{selectedTicket.title}</h4>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 font-sans">
                             <User size={14} className="text-neon-blue" /> {selectedTicket.customer || selectedTicket.rider || selectedTicket.store}
                          </div>
                          {selectedTicket.phone && (
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 font-sans">
                               <Phone size={14} className="text-neon-cyan" /> {selectedTicket.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 font-sans">
                             <Calendar size={14} className="text-slate-600" /> {selectedTicket.timestamp || '24 May 2026, 11:35 AM'}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Description & Context */}
                 <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic mb-8 font-sans">
                       "{selectedTicket.description}"
                    </p>
                    
                    <div className="space-y-4">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-sm italic relative overflow-hidden group hover:border-neon-cyan/40 transition-colors">
                          <div className="flex justify-between items-center mb-4">
                             <div className="text-[9px] font-black text-white uppercase tracking-tighter">Order Context</div>
                             <ExternalLink size={12} className="text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 font-sans">
                             <DetailInfo label="Order ID" value={selectedTicket.orderId || "RF-28471"} />
                             <DetailInfo label="Store" value={selectedTicket.store || "RAJHOME Express"} />
                             <DetailInfo label="Address" value={selectedTicket.location || "Kankarbagh, Patna"} />
                             <DetailInfo label="Amount" value={selectedTicket.amount || "₹1,250"} />
                          </div>
                          <button className="w-full mt-6 py-2 border border-white/10 rounded-sm text-[9px] font-black uppercase text-slate-500 hover:text-white hover:border-white/20 transition-all">View Order Details</button>
                       </div>
                    </div>
                 </div>

                 {/* Ticket Status & Info */}
                 <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
                    <div className="grid grid-cols-2 gap-y-6 font-sans">
                       <DetailInfo label="Priority" value={selectedTicket.priority} status={selectedTicket.priority === 'High' ? 'red' : 'orange'} />
                       <DetailInfo label="Status" value={selectedTicket.status} status="red" />
                       <DetailInfo label="Category" value={selectedTicket.category || 'N/A'} />
                       <DetailInfo label="Channel" value={selectedTicket.channel || 'App'} />
                       <div className="col-span-2 pt-4 border-t border-white/5">
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">Assigned To</div>
                          <div className="flex items-center gap-3">
                             <img src={selectedTicket.assigneeAvatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                             <div>
                                <div className="text-[11px] font-black text-white uppercase italic tracking-tighter leading-none mb-1">{selectedTicket.assignee}</div>
                                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Support Executive</div>
                             </div>
                          </div>
                       </div>
                       
                       {selectedTicket.slaStatus && (
                         <div className="col-span-2 pt-4">
                            <div className="flex justify-between items-center mb-2">
                               <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">SLA Status</div>
                               <div className={cn("text-[9px] font-black italic uppercase", selectedTicket.slaStatus === 'At Risk' ? 'text-neon-red' : 'text-neon-green')}>{selectedTicket.slaStatus}</div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div 
                                  className={cn("h-full rounded-full transition-all duration-1000", selectedTicket.slaStatus === 'At Risk' ? 'bg-neon-red shadow-neon-red w-[60%]' : 'bg-neon-green w-[20%]')} 
                               />
                            </div>
                            <div className="flex justify-between mt-2 text-[8px] font-mono text-slate-600 uppercase">
                               <span>Elapsed: {selectedTicket.slaTime.split('/')[0]}</span>
                               <span>Limit: {selectedTicket.slaTime.split('/')[1]}</span>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Action Panel */}
                 <div className="grid grid-cols-2 gap-4 pb-12">
                    <button className="py-3 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,178,255,0.2)]">
                       <MessageSquare size={16} /> Reply
                    </button>
                    <button className="py-3 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                       <FileText size={16} /> Add Note
                    </button>
                    <button className="py-3 border border-neon-orange text-neon-orange text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-orange hover:text-cyber-black transition-all flex items-center justify-center gap-3">
                       <UserPlus size={16} /> Assign
                    </button>
                    <button className="py-3 border border-neon-red text-neon-red text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all flex items-center justify-center gap-3">
                       <CheckCircle size={16} /> Close Ticket
                    </button>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pb-12">
         {/* Live Agents */}
         <div className="lg:col-span-8 glass-panel border-white/5 bg-cyber-black/40 p-6">
            <div className="flex items-center justify-between mb-8">
               <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-neon-cyan" /> Live Agents
               </h5>
               <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:text-white transition-colors">View All Agents</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {AGENTS_MOCK.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/20 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                           <img src={agent.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                           <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-cyber-black", 
                              agent.status === 'Live' ? 'bg-neon-green shadow-neon-green' : 'bg-neon-orange'
                           )} />
                        </div>
                        <div>
                           <div className="text-[11px] font-black text-white uppercase italic tracking-tighter leading-none mb-1">{agent.name}</div>
                           <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{agent.status}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[12px] font-black text-white font-mono">{agent.resolved}</div>
                        <div className="text-[7px] font-mono text-slate-500 uppercase">Resolved</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Overview & Quick Actions Container */}
         <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
               <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-6">Quick Actions</h5>
               <div className="grid grid-cols-4 gap-4">
                  <QuickActionItem icon={<Send size={18} />} label="Broadcast" color="blue" />
                  <QuickActionItem icon={<HelpCircle size={18} />} label="FAQ" color="green" />
                  <QuickActionItem icon={<Shield size={18} />} label="SLA Rules" color="orange" />
                  <QuickActionItem icon={<Settings size={18} />} label="Config" color="purple" />
               </div>
            </div>

            {/* Popular Issues */}
            <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
               <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-6 flex justify-between items-center">
                  Popular Issues
                  <button className="text-[9px] font-black text-slate-500 hover:text-white transition-colors">View Report</button>
               </h5>
               <div className="space-y-4">
                  {[
                    { label: "Order not received", count: 24 },
                    { label: "Wrong item delivered", count: 18 },
                    { label: "Refund not processed", count: 16 },
                    { label: "Payment issue", count: 14 },
                    { label: "App not working", count: 12 },
                  ].map((issue, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-red shadow-neon-red opacity-50 group-hover:opacity-100" />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase transition-colors italic tracking-tighter">{issue.label}</span>
                       </div>
                       <span className="text-[10px] font-black font-mono text-slate-600 group-hover:text-neon-cyan transition-colors">{issue.count} 📥</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SupportMetricCard({ label, value, delta, icon, color }: { label: string, value: string, delta: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'border-neon-blue/20 text-neon-blue from-neon-blue/[0.03]',
    green: 'border-neon-green/20 text-neon-green from-neon-green/[0.03]',
    orange: 'border-neon-orange/20 text-neon-orange from-neon-orange/[0.03]',
    purple: 'border-neon-purple/20 text-neon-purple from-neon-purple/[0.03]',
    red: 'border-neon-red/20 text-neon-red from-neon-red/[0.03]',
  };
  return (
    <div className={cn("glass-panel p-5 bg-gradient-to-br border transition-all hover:bg-white/[0.02] group", colors[color])}>
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyber-black border border-white/5 shadow-lg group-hover:scale-110 transition-transform duration-500">
             {icon}
          </div>
          <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest px-2 py-0.5 border border-white/5 rounded-sm">
             {delta}
          </div>
       </div>
       <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-2xl font-black text-white italic tracking-tighter uppercase font-orbitron leading-none">{value}</div>
       </div>
    </div>
  );
}

function QuickActionItem({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  const colors: any = {
    blue: 'border-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-cyber-black shadow-[0_0_15px_rgba(0,178,255,0.1)] hover:shadow-[0_0_20px_rgba(0,178,255,0.4)]',
    green: 'border-neon-green/20 text-neon-green hover:bg-neon-green hover:text-cyber-black shadow-[0_0_15px_rgba(0,255,157,0.1)] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]',
    orange: 'border-neon-orange/20 text-neon-orange hover:bg-neon-orange hover:text-cyber-black shadow-[0_0_15px_rgba(255,176,32,0.1)] hover:shadow-[0_0_20px_rgba(255,176,32,0.4)]',
    purple: 'border-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-cyber-black shadow-[0_0_15px_rgba(176,38,255,0.1)] hover:shadow-[0_0_20px_rgba(176,38,255,0.4)]',
    red: 'border-neon-red/20 text-neon-red hover:bg-neon-red hover:text-cyber-black shadow-[0_0_15px_rgba(255,59,92,0.1)] hover:shadow-[0_0_20px_rgba(255,59,92,0.4)]',
  };
  return (
    <button className={cn("flex flex-col items-center gap-2 p-3 border rounded-sm transition-all group", colors[color])}>
       <div className="transition-transform group-hover:scale-110">{icon}</div>
       <span className="text-[8px] font-black uppercase tracking-widest text-center leading-[1.2]">{label}</span>
    </button>
  );
}


function BreakdownItem({ label, value, percent, color }: { label: string, value: string, percent: string, color: string }) {
  const colors: any = {
    blue: 'bg-neon-blue shadow-[0_0_8px_rgba(0,178,255,0.5)]',
    purple: 'bg-neon-purple shadow-[0_0_8px_rgba(176,38,255,0.5)]',
    orange: 'bg-neon-orange shadow-[0_0_8px_rgba(249,115,22,0.5)]',
    slate: 'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]',
  };
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", colors[color])} />
          <span className="text-[10px] font-black text-white uppercase italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
       </div>
       <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-white font-mono">{value}</span>
          <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{percent}</span>
       </div>
    </div>
  );
}

function PayoutStatItem({ label, value, delta, status }: { label: string, value: string, delta: string, status: 'success' | 'warning' | 'danger' }) {
  const colors: any = {
    success: 'text-neon-green',
    warning: 'text-neon-orange',
    danger: 'text-neon-red',
  };
  return (
    <div className="flex items-center justify-between group">
       <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">{label}</span>
       <div className="flex items-center gap-4">
          <span className={cn("text-[11px] font-black font-mono", colors[status])}>{value}</span>
          <span className={cn("text-[9px] font-black font-mono px-2 py-0.5 rounded-sm bg-white/5", colors[status])}>{delta}</span>
       </div>
    </div>
  );
}

// --- Live Tracking Map Components ---

const RIDERS_MAP_MOCK = [
  { id: 'RD-9021', name: 'Ankit Kumar', order: 'RF-8291', status: 'Delivering', lat: 25, lng: 35, speed: '24 km/h', eta: '08m', battery: 88, signal: 'EXCL', today: '₹1,240', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit' },
  { id: 'RD-8842', name: 'Neha Singh', order: 'RF-8302', status: 'Available', lat: 60, lng: 20, speed: '42 km/h', eta: '12m', battery: 92, signal: 'GOOD', today: '₹2,150', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha' },
  { id: 'RD-7751', name: 'Rohit Sharma', order: 'RF-8314', status: 'Emergency', lat: 45, lng: 65, speed: '0 km/h', eta: 'DELAYED', battery: 45, signal: 'WEAK', today: '₹850', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit' },
  { id: 'RD-6629', name: 'Suresh Yadav', order: 'RF-8325', status: 'Picked Up', lat: 15, lng: 80, speed: '38 km/h', eta: '05m', battery: 76, signal: 'EXCL', today: '₹1,820', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh' },
  { id: 'RD-5540', name: 'Priya Verma', order: 'RF-8340', status: 'Delivering', lat: 80, lng: 45, speed: '18 km/h', eta: '15m', battery: 82, signal: 'STABLE', today: '₹1,430', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
];

function LiveTrackingMap() {
  const [riders, setRiders] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, you'd use a firestore listener
    // For now, we will simulate the connection based on the existing structure
    // In a production setup, db is from firebase-admin in server.ts,
    // but in client, we need firebase/firestore
    
    // As a simplification, I'll use a polling approach or a simulated real-time 
    // update if accessible. Since I cannot easily import client-side firebase 
    // in this environment without knowing the exact setup, 
    // I will use a simple fetch for now and add a simulation note.
    
    const fetchRiders = async () => {
      // In a real implementation:
      // const q = query(collection(db, "riders"));
      // const unsubscribe = onSnapshot(q, (snapshot) => {
      //    setRiders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // });
      // return unsubscribe;
      
      const response = await fetch('/api/riders'); // Need to see if this exists
      const data = await response.json();
      setRiders(Array.isArray(data) ? data : []);
    };
    
    fetchRiders();
    const interval = setInterval(fetchRiders, 5000); // Polling as a fallback
    return () => clearInterval(interval);
  }, []);
  
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [mapMode, setMapMode] = useState('NORMAL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Need to update the render part to use 'riders' instead of RIDERS_MAP_MOCK

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden font-sans">
      <MatrixRain />
      
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10 p-1">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Radio size={12} /> GLOBAL_FLEET_SURVEILLANCE_v4.2
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron text-glow-blue">
            LIVE TRACKING <span className="text-neon-cyan">MAP</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">OPS_COMMAND_CORE</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Monitor riders, orders & fleet operations in real time. 
            <span className="text-neon-cyan ml-2 italic">Uplink established. 1,024 nodes active.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <StatusIndicator label="FLEET_SYNC" value="ACTIVE" color="cyan" />
           <StatusIndicator label="EMERGENCY_LINKS" value="03_CRITICAL" color="red" />
           <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-sm flex items-center gap-4 group hover:border-neon-blue/30 transition-all cursor-pointer">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                 <span className="text-[9px] font-mono text-slate-500 uppercase">Live Operations</span>
              </div>
              <div className="text-[10px] font-black font-mono text-white tracking-widest group-hover:text-neon-blue transition-colors italic">INITIATE_SQUAD_DEPLOYMENT</div>
           </div>
        </div>
      </div>

      {/* Analytics Toolbar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
         <TrackingMetricCard label="Active Riders" value="856" delta="+42" icon={<Truck />} color="green" />
         <TrackingMetricCard label="Orders in Transit" value="1,248" delta="+112" icon={<Package />} color="blue" />
         <TrackingMetricCard label="Avg. Delivery ETA" value="22m" delta="-4m" icon={<Timer />} color="cyan" />
         <TrackingMetricCard label="Delayed Links" value="18" delta="+2" icon={<Clock />} color="orange" />
         <TrackingMetricCard label="Emergency Alerts" value="03" delta="CRITICAL" icon={<ShieldAlert />} color="red" />
         <TrackingMetricCard label="Fleet Score" value="96.4" delta="+1.2%" icon={<Target />} color="purple" />
      </div>

      {/* Core Map UI Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-full">
         
         {/* Left Side: Live Riders Stream */}
         <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex flex-col gap-2">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                     type="text" 
                     placeholder="FILTER FLEET..."
                     className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue/50 uppercase tracking-widest"
                  />
               </div>
               <div className="flex gap-1">
                  {['ONLINE', 'BUSY', 'ALERT'].map(f => (
                    <button key={f} className="flex-1 py-1.5 border border-white/5 text-[8px] font-black uppercase text-slate-500 hover:text-white hover:border-white/20 transition-all tracking-widest">{f}</button>
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
               {RIDERS_MAP_MOCK.map((rider) => (
                  <div 
                     key={rider.id}
                     onClick={() => setSelectedRider(rider)}
                     className={cn(
                        "glass-panel p-4 border transition-all cursor-pointer group relative overflow-hidden",
                        selectedRider?.id === rider.id 
                           ? "border-neon-blue/40 bg-neon-blue/5 shadow-[0_0_20px_rgba(0,178,255,0.1)]" 
                           : "border-white/5 bg-cyber-black/40 hover:border-white/20"
                     )}
                  >
                     {selectedRider?.id === rider.id && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue shadow-neon-blue" />
                     )}
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="relative">
                              <img src={rider.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                              <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-cyber-black", 
                                 rider.status === 'Emergency' ? 'bg-neon-red animate-pulse' : 
                                 rider.status === 'Available' ? 'bg-neon-green' : 'bg-neon-blue'
                              )} />
                           </div>
                           <div>
                              <div className="text-[11px] font-black text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-neon-cyan transition-colors">{rider.name}</div>
                              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{rider.id}</div>
                           </div>
                        </div>
                        {rider.status === 'Emergency' && <ShieldAlert size={16} className="text-neon-red animate-ping" />}
                     </div>
                     <div className="grid grid-cols-2 gap-y-2">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">Order ID</span>
                           <span className="text-[9px] font-black text-white italic">{rider.order}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">Speed</span>
                           <span className="text-[9px] font-black text-neon-blue italic">{rider.speed}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">Status</span>
                           <span className={cn("text-[9px] font-black uppercase italic", 
                              rider.status === 'Emergency' ? 'text-neon-red' : 
                              rider.status === 'Available' ? 'text-neon-green' : 'text-neon-cyan'
                           )}>{rider.status}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">Today</span>
                           <span className="text-[9px] font-black text-white italic">{rider.today}</span>
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <BatteryMedium size={12} className={cn(rider.battery < 50 ? "text-neon-red" : "text-neon-green")} />
                           <span className="text-[8px] font-mono text-slate-400">{rider.battery}%</span>
                           <Signal size={12} className="text-neon-blue ml-2" />
                           <span className="text-[8px] font-mono text-slate-400">{rider.signal}</span>
                        </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => (window as any).triggerCall({ name: rider.name })}
                               className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 hover:text-neon-blue hover:border-neon-blue/40 transition-all"
                             >
                               <Target size={12} />
                             </button>
                             <button 
                               onClick={() => (window as any).triggerChat({ name: rider.name })}
                               className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 hover:text-neon-green hover:border-neon-green/40 transition-all"
                             >
                               <MessageSquare size={12} />
                             </button>
                          </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Center: Interactive Tactical Map */}
         <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-[500px]">
            <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex items-center justify-between px-4">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <Map size={14} className="text-neon-blue" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest italic">MISSION_MAP_HYPERLOCAL</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-4">
                     {['TRAFFIC', 'HEATMAP', 'SATELLITE', 'ZONES'].map(mode => (
                        <button 
                           key={mode}
                           onClick={() => setMapMode(mode)}
                           className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all", mapMode === mode ? "text-neon-cyan" : "text-slate-500 hover:text-white")}
                        >
                           {mode}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="p-2 border border-white/5 rounded-sm bg-white/5 text-slate-500 hover:text-neon-red hover:border-neon-red/30 transition-all"><ShieldAlert size={14} /></button>
                  <button className="flex items-center gap-2 px-4 py-1.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-neon-blue hover:text-cyber-black transition-all italic">LIVE_SYNC</button>
               </div>
            </div>

            <div className="flex-1 glass-panel border-white/10 bg-cyber-deep relative overflow-hidden group">
               {/* Animated Map HUD Elements */}
               <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,178,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,178,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
               </div>

               {/* Simulated Map Visuals */}
               <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0">
                  <path d="M0,100 L200,300 M500,0 L400,600 M100,600 L800,200" stroke="#00B2FF" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                  <circle cx="200" cy="300" r="100" fill="none" stroke="#B026FF" strokeWidth="1" strokeDasharray="2,2" />
                  <path d="M150,150 Q400,50 650,150 T900,450" stroke="#00FF9D" strokeWidth="1" fill="none" className="animate-pulse" />
               </svg>

               {/* Map Markers */}
               {RIDERS_MAP_MOCK.map((rider) => (
                  <motion.div 
                     key={rider.id}
                     initial={false}
                     animate={{ x: `${rider.lat}%`, y: `${rider.lng}%` }}
                     className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  >
                     <div 
                        onClick={() => setSelectedRider(rider)}
                        className={cn(
                           "relative flex items-center justify-center transition-all hover:scale-125",
                           selectedRider?.id === rider.id ? "z-30" : "z-10"
                        )}
                     >
                        <div className={cn("absolute inset-0 rounded-full animate-ping opacity-40", 
                           rider.status === 'Emergency' ? 'bg-neon-red' : 
                           rider.status === 'Available' ? 'bg-neon-green' : 'bg-neon-blue'
                        )} />
                        {selectedRider?.id === rider.id && (
                           <div className="absolute -inset-8 border border-neon-blue/30 rounded-full border-dashed animate-spin-slow opacity-60" />
                        )}
                        <div className={cn("w-10 h-10 rounded-full border-2 p-0.5", 
                           selectedRider?.id === rider.id ? "border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "border-white/20"
                        )}>
                           <img src={rider.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                        </div>
                        
                        {/* Compact Popup info - Only on hover or selection */}
                        {selectedRider?.id === rider.id && (
                           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel bg-cyber-black/90 p-2 border-neon-cyan/40 min-w-[120px] shadow-2xl animate-in zoom-in-75 duration-300">
                              <div className="text-[9px] font-black text-white italic uppercase tracking-tighter truncate">{rider.name}</div>
                              <div className="text-[7px] font-mono text-neon-blue uppercase mt-1">SPD: {rider.speed}</div>
                              <div className="text-[7px] font-mono text-neon-green uppercase">ETA: {rider.eta}</div>
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyber-black border-r border-b border-neon-cyan/40 rotate-45" />
                           </div>
                        )}
                     </div>
                  </motion.div>
               ))}

               {/* Random Emergency Alerts on Map */}
               <div className="absolute top-[20%] left-[80%] z-10">
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-neon-red/20 border border-neon-red/50 animate-pulse flex items-center justify-center">
                        <ShieldAlert size={24} className="text-neon-red" />
                     </div>
                     <div className="mt-2 glass-panel p-1 border-neon-red/30 bg-cyber-black/80">
                        <span className="text-[7px] font-black text-neon-red uppercase tracking-widest whitespace-nowrap">UNSAFE ZONE DETECTED</span>
                     </div>
                  </div>
               </div>

               {/* Map Controls Floating Overlay */}
               <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
                  <MapControlBtn icon={<Plus size={16} />} />
                  <MapControlBtn icon={<Minus size={16} />} />
                  <MapControlBtn icon={<Target size={16} />} active />
                  <MapControlBtn icon={<Eye size={16} />} />
               </div>

               {/* Map Bottom HUD */}
               <div className="absolute bottom-6 left-6 z-30 glass-panel p-3 border-white/10 bg-cyber-black/60 font-mono text-[8px] text-slate-500 uppercase tracking-widest space-y-1 backdrop-blur-md">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-cyan" /> Uplink: RJ_NET_STABLE</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-neon-green" /> Nodes: 1,024 Active</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-orange shadow-neon-orange" /> Traffic: Heavy (Sector-4)</div>
               </div>
            </div>
         </div>

         {/* Right Side: Tracking Intelligence */}
         <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full pr-2 pb-12">
            <AnimatePresence mode="wait">
               <motion.div 
                  key={selectedRider?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
               >
                  {/* Selected Rider Intelligence Card */}
                  <div className="glass-panel border-white/10 bg-cyber-black/60 p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Radio size={120} className="text-neon-cyan" />
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                 <img src={selectedRider?.avatar} className="w-16 h-16 rounded-sm border border-neon-blue/30 p-1" alt="" />
                                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue" />
                                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue" />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-white italic tracking-tighter font-orbitron leading-none mb-1 group-hover:text-neon-cyan transition-colors">{selectedRider?.name}</h3>
                                 <div className="flex items-center gap-2">
                                    <div className={cn("px-2 py-0.5 rounded-sm text-[7px] font-black uppercase tracking-widest inline-block border", 
                                       selectedRider?.status === 'Emergency' ? "bg-neon-red/10 border-neon-red/30 text-neon-red" : "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                                    )}>{selectedRider?.status?.toUpperCase()}</div>
                                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest italic font-black">STABLE_SIGNAL</span>
                                 </div>
                              </div>
                           </div>
                           <button className="text-slate-500 hover:text-white transition-colors p-1 bg-white/5 rounded-sm"><ExternalLink size={16} /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 mb-6">
                           <IntelField label="SQUAD_UNIT" value={selectedRider?.id} />
                           <IntelField label="CURRENT_ORDER" value={selectedRider?.order} status="cyan" />
                           <IntelField label="VELOCITY" value={selectedRider?.speed} />
                           <IntelField label="EST_ARRIVAL" value={selectedRider?.eta} status="green" />
                           <IntelField label="FUEL_BATTERY" value={`${selectedRider?.battery}%`} status={selectedRider?.battery < 50 ? 'red' : 'green'} />
                           <IntelField label="NETWORK_NODE" value={selectedRider?.signal} />
                        </div>

                        <div className="hud-line mb-6 opacity-30" />
                        
                           <div className="flex gap-2">
                             <button 
                               onClick={() => selectedRider && (window as any).triggerCall({ name: selectedRider.name })}
                               className="flex-1 py-2.5 bg-neon-blue text-cyber-black text-[9px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_15px_rgba(0,178,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                                <Phone size={14} /> CALL_LINK
                             </button>
                             <button 
                               onClick={() => selectedRider && (window as any).triggerChat({ name: selectedRider.name })}
                               className="flex-1 py-2.5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest italic rounded-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                             >
                                <MessageSquare size={14} /> MSG_CORE
                             </button>
                           </div>
                     </div>
                  </div>

                  {/* AI Route Intelligence */}
                  <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
                     <h5 className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                        <BrainCircuit size={14} className="animate-pulse" /> NEURAL_ROUTE_ANALYSIS
                     </h5>
                     <div className="space-y-6">
                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency Rating</span>
                              <span className="text-[9px] font-black text-neon-green italic">94.2%_OPTIMAL</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                              <div className="h-full bg-neon-green rounded-full shadow-[0_0_10px_rgba(0,255,157,0.3)] w-[94.2%]" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-white/5 border border-white/5 rounded-sm">
                              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">Traffic Impact</div>
                              <div className="text-[10px] font-black text-neon-orange uppercase italic tracking-tighter">LOW_MODERATE</div>
                           </div>
                           <div className="p-3 bg-white/5 border border-white/5 rounded-sm">
                              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">AI Recommendation</div>
                              <div className="text-[10px] font-black text-neon-cyan uppercase italic tracking-tighter">S_ROUTE_6</div>
                           </div>
                        </div>

                        <div className="p-4 border border-neon-cyan/20 bg-neon-cyan/5 rounded-sm italic">
                           <p className="text-[9px] text-slate-300 leading-relaxed">
                              "Current vector optimal. Detected potential bottleneck at Sector-4 intersection. Suggest maintaining current route via Cyber-Avenue."
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Operational Timeline */}
                  <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
                     <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-6 italic border-b border-white/5 pb-4">MISSION_TIMELINE_LOGS</h5>
                     <div className="space-y-4">
                        <TimelineStep label="Rider Arrived at Store" time="12:04 PM" status="completed" />
                        <TimelineStep label="Order Picked Up" time="12:08 PM" status="completed" />
                        <TimelineStep label="Route Optimization Started" time="12:09 PM" status="completed" />
                        <TimelineStep label="In Transit to Destination" time="12:12 PM" status="active" />
                        <TimelineStep label="Estimated Delivery" time="12:22 PM" status="pending" />
                     </div>
                  </div>

                  {/* Tactical Emergency Controls */}
                  <div className="p-6 bg-neon-red/10 border border-neon-red/30 rounded-sm group overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-red/50 animate-scan opacity-30" />
                     <h5 className="text-[10px] font-black text-neon-red uppercase tracking-widest mb-4 italic flex items-center gap-2">
                        <ShieldAlert size={14} className="animate-bounce" /> EMERGENCY_PROTOCOLS
                     </h5>
                     <div className="space-y-3">
                        <button className="w-full py-2 bg-transparent border border-neon-red/40 text-neon-red text-[9px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all">INITIATE_SQUAD_ASSIST</button>
                        <button className="w-full py-2 bg-transparent border border-neon-red/40 text-neon-red text-[9px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-cyber-black transition-all">REDIRECT_MISSION_LINK</button>
                        <button className="w-full py-3 bg-neon-red text-cyber-black text-[9px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_20px_rgba(255,59,92,0.4)]">FORCE_EMERGENCY_HALT</button>
                     </div>
                  </div>
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}

function TrackingMetricCard({ label, value, delta, icon, color }: { label: string, value: string, delta: string, icon: React.ReactNode, color: string }) {
   const colors: any = {
      blue: 'border-neon-blue/20 text-neon-blue from-neon-blue/[0.03] shadow-[0_4px_20px_rgba(0,178,255,0.05)]',
      green: 'border-neon-green/20 text-neon-green from-neon-green/[0.03] shadow-[0_4px_20px_rgba(0,255,157,0.05)]',
      cyan: 'border-neon-cyan/20 text-neon-cyan from-neon-cyan/[0.03] shadow-[0_4px_20px_rgba(0,211,255,0.05)]',
      purple: 'border-neon-purple/20 text-neon-purple from-neon-purple/[0.03] shadow-[0_4px_20px_rgba(176,38,255,0.05)]',
      orange: 'border-neon-orange/20 text-neon-orange from-neon-orange/[0.03] shadow-[0_4px_20px_rgba(255,176,32,0.05)]',
      red: 'border-neon-red/20 text-neon-red from-neon-red/[0.03] shadow-[0_4px_20px_rgba(255,59,92,0.05)]',
   };
   
   return (
      <div className={cn("glass-panel p-5 bg-gradient-to-br border transition-all hover:bg-white/[0.04] group hover:-translate-y-1 duration-500", colors[color])}>
         <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyber-black border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
               <div className="text-inherit opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:rotate-[360deg] duration-1000">
                  {React.cloneElement(icon as React.ReactElement, { size: 24 })}
               </div>
            </div>
            <div className={cn("text-[9px] font-black font-mono italic tracking-tight px-3 py-1 rounded-sm bg-white/5 border border-white/5", 
               delta === 'CRITICAL' ? 'text-neon-red animate-pulse' : 'text-slate-400'
            )}>
               {delta}
            </div>
         </div>
         <div>
            <div className="text-3xl font-black text-white font-orbitron italic tracking-tighter leading-none mb-2">{value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{label}</div>
         </div>
      </div>
   );
}

function IntelField({ label, value, status }: { label: string, value: string, status?: string }) {
   const statusColors: any = {
      cyan: 'text-neon-cyan',
      green: 'text-neon-green',
      red: 'text-neon-red',
      blue: 'text-neon-blue',
   };
   return (
      <div className="flex flex-col">
         <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1 italic opacity-60 leading-none">{label}</span>
         <span className={cn("text-[12px] font-black italic tracking-tighter transition-all hover:scale-105 origin-left cursor-default leading-none", status ? statusColors[status] : "text-white")}>{value}</span>
      </div>
   );
}

function TimelineStep({ label, time, status }: { label: string, time: string, status: 'completed' | 'active' | 'pending' }) {
   return (
      <div className="flex gap-4 group">
         <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", 
               status === 'completed' ? "bg-neon-green border-neon-green shadow-neon-green" : 
               status === 'active' ? "bg-neon-blue border-neon-blue shadow-neon-blue animate-pulse" : "bg-white/5 border-white/10"
            )}>
               {status === 'completed' && <CheckCircle size={8} className="text-cyber-black" />}
            </div>
            <div className={cn("w-[2px] h-full rounded-full transition-colors", 
               status === 'completed' ? "bg-neon-green/40" : "bg-white/5"
            )} />
         </div>
         <div className="pb-6 flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
               <span className={cn("text-[10px] font-black uppercase italic tracking-tighter leading-none", 
                  status === 'pending' ? "text-slate-500" : "text-white"
               )}>{label}</span>
               <span className="text-[8px] font-mono text-slate-500 tracking-widest">{time}</span>
            </div>
            {status === 'active' && (
               <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-neon-blue animate-shimmer w-[60%]" style={{ backgroundSize: '200% 100%' }} />
                  </div>
                  <span className="text-[7px] font-mono text-neon-blue animate-pulse">PROCEEDING...</span>
               </div>
            )}
         </div>
      </div>
   );
}

function MapControlBtn({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
   return (
      <button className={cn("w-10 h-10 glass-panel border flex items-center justify-center transition-all hover:scale-110 active:scale-95 group", 
         active ? "bg-neon-blue border-neon-blue text-cyber-black shadow-neon-blue" : "bg-cyber-black/80 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
      )}>
         {icon}
      </button>
   );
}


// --- Incentive Management Components ---

const INCENTIVES_MOCK = [
  { id: 'INC-7281', title: 'Weekend Mega Bonus', description: 'Complete more trips and earn big this weekend!', type: 'Trips', target: '40 Trips', reward: '₹1,500', duration: '24 May - 25 May 2026', status: 'Active', riders: 256, participation: 78, category: 'green' },
  { id: 'INC-8292', title: 'Prime Performer Bonus', description: 'High value deliveries bonus for prime orders', type: 'Prime Orders', target: '25 Orders', reward: '₹2,000', duration: '20 May - 27 May 2026', status: 'Active', riders: 198, participation: 64, category: 'blue' },
  { id: 'INC-9103', title: 'Emergency Booster', description: 'Extra earning for emergency deliveries', type: 'Emergency', target: '15 Orders', reward: '₹1,000', duration: '23 May - 26 May 2026', status: 'Active', riders: 142, participation: 53, category: 'red' },
  { id: 'INC-4451', title: 'Daily Target Bonus', description: 'Achieve daily target and earn bonus', type: 'Earnings', target: '₹2,500', reward: '₹300', duration: '24 May 2026', status: 'Active', riders: 312, participation: 58, category: 'green' },
  { id: 'INC-5562', title: 'New Rider Welcome Bonus', description: 'Welcome bonus for new riders', type: 'Registration', target: '1st 20 Days', reward: '₹500', duration: '01 May - 31 May 2026', status: 'Active', riders: 85, participation: 45, category: 'cyan' },
  { id: 'INC-6673', title: 'Fuel Support Incentive', description: 'Daily fuel allowance support', type: 'Earnings', target: '₹1,800', reward: '₹200', duration: '20 May - 26 May 2026', status: 'Upcoming', riders: 0, participation: 0, category: 'amber' },
  { id: 'INC-3384', title: 'Mid Month Challenge', description: 'Complete trips and earn extra', type: 'Trips', target: '60 Trips', reward: '₹2,500', duration: '01 Jun - 15 Jun 2026', status: 'Upcoming', riders: 0, participation: 0, category: 'blue' },
  { id: 'INC-2295', title: 'Festival Special Bonus', description: 'Special bonus for festival season', type: 'Earnings', target: '₹5,000', reward: '₹750', duration: '10 Jun - 20 Jun 2026', status: 'Draft', riders: 0, participation: 0, category: 'purple' },
  { id: 'INC-1106', title: 'Rider Retention Bonus', description: 'For active riders this month', type: 'Activity', target: '25 Days', reward: '₹800', duration: '05 May - 20 May 2026', status: 'Cancelled', riders: 0, participation: 0, category: 'red' },
  { id: 'INC-0017', title: 'April Performance Bonus', description: 'Monthly performance based bonus', type: 'Performance', target: 'Based on Score', reward: '₹1,200', duration: '01 Apr - 30 Apr 2026', status: 'Completed', riders: 428, participation: 100, category: 'blue' },
];

const INCENTIVE_ANALYTICS_DATA = [
  { name: 'Trips Based', value: 312500, color: '#00B2FF' },
  { name: 'Earnings Based', value: 245300, color: '#00FF9D' },
  { name: 'Prime Orders', value: 152000, color: '#FFB020' },
  { name: 'Emergency', value: 110120, color: '#FF3B5C' },
  { name: 'Others', value: 55500, color: '#B026FF' },
];

function IncentiveManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative font-sans p-1">
      <MatrixRain />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Rocket size={12} /> PERFORMANCE_MOTIVATION_v7.0
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron text-glow-blue">
            INCENTIVE <span className="text-neon-cyan">MANAGEMENT</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> <span className="text-sm font-mono text-slate-500 normal-case tracking-normal">GROWTH_OPS_CORE</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Create, manage and optimize rider incentives & performance rewards.
            <span className="text-neon-cyan ml-2 italic">Neural optimization active. ROI: +24.8%.</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <StatusIndicator label="SYSTEM_HEALTH" value="OPTIMIZED" color="green" />
           <StatusIndicator label="ACTIVE_CAMPAIGNS" value="24" color="blue" />
           <div className="bg-neon-blue text-cyber-black px-6 py-2.5 rounded-sm flex items-center gap-3 group transition-all cursor-pointer shadow-[0_0_20px_rgba(0,178,255,0.3)] hover:scale-105 active:scale-95">
              <PlusSquare size={18} />
              <div className="text-[11px] font-black font-mono tracking-widest italic">CREATE_NEW_INCENTIVE</div>
           </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
         <IncentiveCard 
            label="Total Incentives" 
            value="₹8,75,420" 
            subValue="+18.4% from last month" 
            icon={<Gift />} 
            color="blue" 
            chartColor="#00B2FF"
         />
         <IncentiveCard 
            label="Active Incentives" 
            value="24" 
            subValue="Currently running" 
            icon={<Zap />} 
            color="green" 
            chartColor="#00FF9D"
         />
         <IncentiveCard 
            label="Riders Benefited" 
            value="1,248" 
            subValue="+22.6% from last month" 
            icon={<Users />} 
            color="purple" 
            chartColor="#B026FF"
         />
         <IncentiveCard 
            label="Total Payouts" 
            value="₹7,12,340" 
            subValue="Paid to riders" 
            icon={<Wallet />} 
            color="orange" 
            chartColor="#FFB020"
         />
         <IncentiveCard 
            label="Upcoming Payouts" 
            value="₹1,63,080" 
            subValue="To be paid" 
            icon={<Calendar />} 
            color="red" 
            chartColor="#FF3B5C"
         />
      </div>

      {/* Main Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
         
         {/* Left Side: Incentives List & Filters */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Tabs & Filters */}
            <div className="flex flex-col gap-4">
               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex bg-white/5 p-1 border border-white/10 rounded-sm">
                     {['All', 'Active', 'Upcoming', 'Completed', 'Draft', 'Cancelled'].map(tab => (
                        <button 
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={cn(
                              "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all",
                              activeTab === tab ? "bg-neon-blue text-cyber-black italic shadow-lg" : "text-slate-400 hover:text-white"
                           )}
                        >
                           {tab} {tab === 'All' ? '' : `(${tab === 'Active' ? '24' : tab === 'Upcoming' ? '5' : tab === 'Completed' ? '68' : tab === 'Draft' ? '3' : '4'})`}
                        </button>
                     ))}
                  </div>
                  <div className="flex gap-2">
                     <select className="bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 focus:outline-none focus:border-neon-blue">
                        <option>ALL TYPES</option>
                        <option>TRIPS BASED</option>
                        <option>EARNINGS BASED</option>
                     </select>
                     <select className="bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 focus:outline-none focus:border-neon-blue">
                        <option>ALL CITIES</option>
                     </select>
                     <button className="flex items-center gap-2 px-4 py-2 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:border-white/30 transition-all rounded-sm">
                        <Filter size={12} /> FILTER
                     </button>
                  </div>
               </div>

               <div className="glass-panel p-2 border-white/5 bg-cyber-black/80 flex items-center gap-4">
                  <div className="relative flex-1">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                     <input 
                        type="text" 
                        placeholder="SEARCH INCENTIVE NAME, CAMPAIGN TYPE, RIDER..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue/50 uppercase tracking-widest"
                     />
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 bg-white/5 px-4 py-2.5 border border-white/10">
                     HITS: <span className="text-white">104</span>
                  </div>
               </div>
            </div>

            {/* Incentives Table */}
            <div className="glass-panel border-white/10 bg-cyber-black/60 overflow-hidden">
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                           <th className="px-6 py-4 text-left font-black">Incentive Details</th>
                           <th className="px-4 py-4 text-left font-black">Type</th>
                           <th className="px-4 py-4 text-left font-black">Target</th>
                           <th className="px-4 py-4 text-left font-black">Reward</th>
                           <th className="px-4 py-4 text-left font-black">Duration</th>
                           <th className="px-4 py-4 text-left font-black">Status</th>
                           <th className="px-4 py-4 text-right font-black">Riders</th>
                           <th className="px-6 py-4 text-center font-black">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {INCENTIVES_MOCK.map((inc) => (
                           <IncentiveRow key={inc.id} incentive={inc} />
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                     Showing 1 to 10 of 104 incentives
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="p-2 border border-white/10 text-slate-500 hover:text-white transition-all cursor-not-allowed"><ChevronRight size={14} className="rotate-180" /></button>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, '...', 11].map((p, i) => (
                           <button key={i} className={cn(
                              "w-8 h-8 flex items-center justify-center text-[10px] font-mono transition-all",
                              p === 1 ? "bg-neon-blue text-cyber-black font-black italic shadow-[0_0_10px_rgba(0,178,255,0.3)]" : "text-slate-500 hover:bg-white/5 hover:text-white"
                           )}>{p}</button>
                        ))}
                     </div>
                     <button className="p-2 border border-white/10 text-slate-500 hover:text-white transition-all"><ChevronRight size={14} /></button>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side: intelligence & Quick Actions */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Incentive Analytics Widget (Donut) */}
            <div className="glass-panel border-white/10 bg-cyber-black/60 p-6 relative overflow-hidden group">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                  <PieChartIcon size={14} className="text-neon-cyan" /> INCENTIVE_ANALYTICS
               </h5>
               <div className="h-64 relative mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={INCENTIVE_ANALYTICS_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {INCENTIVE_ANALYTICS_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: 'rgba(5, 8, 22, 0.95)', border: '1px solid rgba(0, 178, 255, 0.2)', color: '#fff' }}
                           itemStyle={{ fontSize: '10px', textTransform: 'uppercase' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-white font-orbitron italic leading-none">₹8.75L</span>
                     <span className="text-[8px] font-mono text-slate-500 uppercase mt-1">TOTAL_BUDGET</span>
                  </div>
               </div>
               <div className="space-y-3">
                  {INCENTIVE_ANALYTICS_DATA.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between group/item cursor-default">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                           <span className="text-[10px] font-black text-slate-400 group-hover/item:text-white transition-colors">{item.name}</span>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-white italic">₹{item.value.toLocaleString()}</div>
                           <div className="text-[8px] font-mono text-slate-600">({((item.value / 875420) * 100).toFixed(1)}%)</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Incentive Performance Overview */}
            <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
               <div className="flex items-center justify-between mb-6">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest italic">PERFORMANCE_OVERVIEW</h5>
                  <button className="text-[9px] font-black text-neon-blue uppercase hover:underline">VIEW_REPORT</button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <KPIWidget label="Riders Benefited" value="1,248" delta="+22.6%" color="green" />
                  <KPIWidget label="Targets Achieved" value="4,856" delta="+18.3%" color="green" />
                  <KPIWidget label="Total Amount Paid" value="₹7,12,340" delta="+20.4%" color="green" />
                  <KPIWidget label="Achievement Rate" value="89.2%" delta="+8.7%" color="green" />
               </div>
            </div>

            {/* Top Performing Incentives */}
            <div className="glass-panel border-white/10 bg-cyber-black/60 p-6">
               <div className="flex items-center justify-between mb-6">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest italic">TOP_PERFORMING</h5>
                  <button className="text-[9px] font-black text-neon-blue uppercase hover:underline">VIEW_ALL</button>
               </div>
               <div className="space-y-6">
                  {INCENTIVES_MOCK.slice(0, 4).map((inc, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center", 
                                 i === 0 ? "text-neon-blue" : i === 1 ? "text-neon-orange" : "text-neon-purple"
                              )}>
                                 {i === 0 ? <Trophy size={20} /> : i === 1 ? <Crown size={20} /> : <Award size={20} />}
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-white uppercase italic truncate max-w-[120px]">{inc.title}</div>
                                 <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TARGET: {inc.target}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] font-black text-white italic">{inc.participation}%</div>
                              <div className="text-[8px] font-mono text-slate-600 uppercase">CMPL</div>
                           </div>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                              className={cn("h-full rounded-full transition-all duration-1000", 
                                 i === 0 ? "bg-neon-blue shadow-[0_0_10px_rgba(0,178,255,0.3)]" : 
                                 i === 1 ? "bg-neon-orange shadow-[0_0_10px_rgba(255,176,32,0.3)]" : 
                                 "bg-neon-purple shadow-[0_0_10px_rgba(176,38,255,0.3)]"
                              )} 
                              style={{ width: `${inc.participation}%` }} 
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5 gap-3">
               <QuickActionBtn icon={<PlusSquare />} label="Create" />
               <QuickActionBtn icon={<Copy />} label="Duplicate" />
               <QuickActionBtn icon={<ClipboardList />} label="Templates" />
               <QuickActionBtn icon={<Settings2 />} label="Budget" />
               <QuickActionBtn icon={<History />} label="History" />
            </div>

         </div>
      </div>
    </div>
  );
}

function IncentiveCard({ label, value, subValue, icon, color, chartColor }: { label: string, value: string, subValue: string, icon: React.ReactNode, color: string, chartColor: string }) {
   const colors: any = {
      blue: 'border-neon-blue/20 text-neon-blue from-neon-blue/[0.03] shadow-[0_4px_20px_rgba(0,178,255,0.05)]',
      green: 'border-neon-green/20 text-neon-green from-neon-green/[0.03] shadow-[0_4px_20px_rgba(0,255,157,0.05)]',
      purple: 'border-neon-purple/20 text-neon-purple from-neon-purple/[0.03] shadow-[0_4px_20px_rgba(176,38,255,0.05)]',
      orange: 'border-neon-orange/20 text-neon-orange from-neon-orange/[0.03] shadow-[0_4px_20px_rgba(255,176,32,0.05)]',
      red: 'border-neon-red/20 text-neon-red from-neon-red/[0.03] shadow-[0_4px_20px_rgba(255,59,92,0.05)]',
   };

   // Mock mini chart data
   const data = Array.from({ length: 12 }, (_, i) => ({ value: 40 + Math.random() * 60 }));

   return (
      <div className={cn("glass-panel p-5 bg-gradient-to-br border transition-all hover:bg-white/[0.04] group hover:-translate-y-1 duration-500 relative overflow-hidden", colors[color])}>
         <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none px-2 translate-y-2">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                  <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke={chartColor} 
                     fill={chartColor} 
                     fillOpacity={0.1} 
                     strokeWidth={2}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyber-black border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
                  <div className="text-inherit opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:rotate-[360deg] duration-1000">
                     {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                  </div>
               </div>
               <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest italic font-bold">LIVE_DATA</div>
            </div>
            <div>
               <div className="text-3xl font-black text-white font-orbitron italic tracking-tighter leading-none mb-1 shadow-neon-white">{value}</div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2 leading-none">{label}</div>
               <div className={cn("text-[9px] font-mono font-bold italic", 
                  subValue.includes('+') ? 'text-neon-green' : subValue.includes('-') ? 'text-neon-red' : 'text-slate-500'
               )}>{subValue}</div>
            </div>
         </div>
      </div>
   );
}

function IncentiveRow({ incentive }: any) {
   const getStatusStyles = (status: string) => {
      switch(status) {
         case 'Active': return 'bg-neon-green/10 text-neon-green border-neon-green/20';
         case 'Upcoming': return 'bg-neon-orange/10 text-neon-orange border-neon-orange/20';
         case 'Completed': return 'bg-neon-blue/10 text-neon-blue border-neon-blue/20';
         case 'Cancelled': return 'bg-neon-red/10 text-neon-red border-neon-red/20';
         default: return 'bg-white/5 text-slate-400 border-white/10';
      }
   };

   return (
      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
         <td className="px-6 py-4">
            <div className="flex items-center gap-4">
               <div className={cn("w-10 h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 bg-gradient-to-br", 
                  incentive.category === 'green' ? 'text-neon-green from-neon-green/10' : 
                  incentive.category === 'red' ? 'text-neon-red from-neon-red/10' : 
                  incentive.category === 'blue' ? 'text-neon-blue from-neon-blue/10' : 
                  incentive.category === 'cyan' ? 'text-neon-cyan from-neon-cyan/10' : 
                  incentive.category === 'purple' ? 'text-neon-purple from-neon-purple/10' : 'text-neon-orange from-neon-orange/10'
               )}>
                  {incentive.type === 'Trips' ? <Trophy size={20} /> : 
                   incentive.type === 'Earnings' ? <DollarSign size={20} /> : 
                   incentive.type === 'Emergency' ? <Zap size={20} /> : 
                   incentive.type === 'Registration' ? <UserPlus size={20} /> : 
                   incentive.type === 'Performance' ? <Target size={20} /> : <Activity size={20} />}
               </div>
               <div>
                  <div className="text-[11px] font-black text-white uppercase italic tracking-tighter group-hover:text-neon-cyan transition-colors leading-none mb-1">{incentive.title}</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none truncate max-w-[200px]">{incentive.description}</div>
               </div>
            </div>
         </td>
         <td className="px-4 py-4">
            <div className={cn("inline-block px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border", getStatusStyles(incentive.status))}>
               {incentive.type}
            </div>
         </td>
         <td className="px-4 py-4">
            <div className="text-[10px] font-black text-white italic uppercase tracking-tighter">{incentive.target}</div>
         </td>
         <td className="px-4 py-4">
            <div className="text-[12px] font-black text-neon-green italic shadow-neon-green">{incentive.reward}</div>
         </td>
         <td className="px-4 py-4">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap">{incentive.duration}</div>
         </td>
         <td className="px-4 py-4">
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full shadow-lg", 
                  incentive.status === 'Active' ? 'bg-neon-green animate-pulse shadow-neon-green' : 
                  incentive.status === 'Upcoming' ? 'bg-neon-orange shadow-neon-orange' : 
                  incentive.status === 'Completed' ? 'bg-neon-blue shadow-neon-blue' : 'bg-neon-red shadow-neon-red'
               )} />
               <span className={cn("text-[9px] font-black uppercase italic tracking-widest", 
                  incentive.status === 'Active' ? 'text-neon-green' : 
                  incentive.status === 'Upcoming' ? 'text-neon-orange' : 
                  incentive.status === 'Completed' ? 'text-neon-blue' : 'text-neon-red'
               )}>{incentive.status}</span>
            </div>
         </td>
         <td className="px-4 py-4 text-right">
            <div className="flex items-center justify-end gap-2 text-white">
               <Users size={12} className="text-slate-500" />
               <span className="text-[11px] font-black italic">{incentive.riders > 0 ? incentive.riders : '-'}</span>
            </div>
         </td>
         <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
               <button className="p-2 border border-white/10 rounded-sm text-slate-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all"><BarChart4 size={14} /></button>
               <button className="p-2 border border-white/10 rounded-sm text-slate-400 hover:text-white hover:border-white/30 transition-all"><MoreHorizontal size={14} /></button>
            </div>
         </td>
      </tr>
   );
}

function KPIWidget({ label, value, delta, color }: { label: string, value: string, delta: string, color: string }) {
   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/20 transition-all group">
         <div className="text-[16px] font-black text-white italic tracking-tighter mb-1 font-orbitron">{value}</div>
         <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 truncate group-hover:text-slate-400 transition-colors leading-none">{label}</div>
         <div className="flex items-center gap-1.5">
            <TrendingUp size={10} className="text-neon-green" />
            <span className="text-[8px] font-mono text-neon-green font-bold">{delta}</span>
         </div>
      </div>
   );
}

function QuickActionBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <button className="flex flex-col items-center justify-center gap-2 p-3 glass-panel border border-white/5 bg-cyber-black/40 hover:bg-white/5 hover:border-neon-blue/30 transition-all group rounded-sm w-full">
         <div className="text-slate-500 group-hover:text-neon-blue transform group-hover:scale-110 transition-all">
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
         </div>
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      </button>
   );
}

// --- SETTINGS CENTER DASHBOARD ---

const RECENT_SETTINGS_ACTIVITY = [
  { id: 1, name: 'Payout Frequency', module: 'Payment Settings', user: 'Admin', change: 'Daily → Weekly', time: '24 May 2026, 11:35 AM', status: 'Updated' },
  { id: 2, name: 'Prime Bonus Multiplier', module: 'Prime Settings', user: 'Admin', change: '1.3x → 1.5x', time: '24 May 2026, 10:22 AM', status: 'Updated' },
  { id: 3, name: 'Auto Logout Time', module: 'Rider Settings', user: 'Admin', change: '10 mins → 15 mins', time: '24 May 2026, 09:15 AM', status: 'Updated' },
  { id: 4, name: 'Emergency Payout', module: 'Emergency Settings', user: 'Admin', change: '₹80 → ₹100', time: '24 May 2026, 08:40 AM', status: 'Updated' },
  { id: 5, name: 'Max Withdrawal Limit', module: 'Payment Settings', user: 'Admin', change: '₹8,000 → ₹10,000', time: '24 May 2026, 08:10 AM', status: 'Updated' },
];

const SETTINGS_MODULES = [
  { id: 'general', title: 'General Settings', desc: 'Manage basic system preferences, app details, language, timezone & more.', count: 12, color: 'blue', icon: <Settings2 /> },
  { id: 'payment', title: 'Payment Settings', desc: 'Payout rules, withdrawal limits, fees, settlement & payment methods.', count: 18, color: 'green', icon: <Wallet /> },
  { id: 'rider', title: 'Rider Settings', desc: 'Rider onboarding, verification, levels, bonuses, penalties & preferences.', count: 24, color: 'amber', icon: <Bike /> },
  { id: 'prime', title: 'Prime Settings', desc: 'Prime eligibility, bonus multipliers, priority rules & VIP handling.', count: 10, color: 'gold', icon: <Crown /> },
  { id: 'emergency', title: 'Emergency Settings', desc: 'Emergency order rules, alerts, payouts & escalation management.', count: 9, color: 'red', icon: <ShieldAlert /> },
  { id: 'notification', title: 'Notification Settings', desc: 'Push, SMS, Email, WhatsApp & broadcast notification controls.', count: 16, color: 'purple', icon: <Bell /> },
  { id: 'security', title: 'Security Settings', desc: 'Admin roles, access control, 2FA, sessions & security policies.', count: 14, color: 'indigo', icon: <Shield /> },
  { id: 'map', title: 'Map & Location Settings', desc: 'Map provider, tracking, geofence, location accuracy & radius.', count: 11, color: 'cyan', icon: <MapPin /> },
  { id: 'system', title: 'System Preferences', desc: 'System behavior, data retention, logs, cache & performance options.', count: 8, color: 'emerald', icon: <Cpu /> },
];

function SettingsCenter() {
  const [activeTab, setActiveTab] = useState('Overview');
  const { triggerGlobalSOS } = useSOS();
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0, 178, 255, 0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
       </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mb-3 leading-none italic animate-pulse">
            <Settings size={12} /> CONFIGURATION_COMMAND_CORE_v4.2
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic flex items-center gap-4 font-orbitron">
            SETTINGS <span className="text-neon-cyan">CENTER</span> <div className="h-8 w-[2px] bg-neon-cyan/30 -rotate-12" /> 
            <span className="text-xs font-mono text-slate-500 normal-case tracking-normal not-italic opacity-50">MASTER_HYPER_LOGIC</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-4 max-w-xl border-l-2 border-neon-cyan/20 pl-4 py-1">
            Manage system configuration, infrastructure controls, and platform policies across the neural network.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH SETTINGS..." 
                  className="bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-[9px] uppercase font-mono tracking-widest focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 w-64 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-600">CTRL /</div>
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-sm p-1">
                {['Overview', 'Performance', 'Security'].map(r => (
                    <button 
                        key={r}
                        onClick={() => setActiveTab(r)}
                        className={cn(
                            "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm italic",
                            activeTab === r ? "bg-neon-blue text-cyber-black shadow-[0_0_15px_rgba(0,178,255,0.4)]" : "text-slate-500 hover:text-white"
                        )}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <SettingsStatCard label="Active Modules" value="128" sub="All systems operational" icon={<Cpu />} color="blue" />
          <SettingsStatCard label="Admin Roles" value="24" sub="Access roles configured" icon={<Shield />} color="purple" />
          <SettingsStatCard label="Pending Updates" value="6" sub="Require attention" icon={<RotateCcw />} color="amber" />
          <SettingsStatCard label="System Uptime" value="99.98%" sub="Excellent Performance" icon={<Activity />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
                    <LayoutDashboard size={16} className="text-neon-blue" /> Settings Modules
                    <span className="text-[10px] font-mono text-slate-500 normal-case tracking-normal not-italic opacity-40">Configure all platform settings and preferences</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SETTINGS_MODULES.map(module => (
                      <SettingsModuleCard key={module.id} {...module} />
                  ))}
              </div>

              <div className="glass-panel border-neon-red/20 bg-neon-red/5 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                      <AlertTriangle size={40} className="text-neon-red" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-1.5 bg-neon-red text-white shadow-[0_0_15px_rgba(255,59,92,0.4)] rounded-sm">
                          <Zap size={14} />
                      </div>
                      <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Emergency Override <span className="text-[9px] font-mono text-slate-500 ml-2 normal-case tracking-normal not-italic">Use these controls only in critical situations</span></h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <EmergencyToggle label="Disable New Orders" sub="Stop accepting new orders" />
                      <EmergencyToggle label="Pause Payouts" sub="Temporarily pause all payouts" />
                      <EmergencyToggle label="Stop Rider Onboarding" sub="Block new rider registrations" />
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-neon-red uppercase italic tracking-widest leading-none">Global SOS Protocol</span>
                            <div className="w-2 h-2 rounded-full bg-neon-red animate-ping" />
                        </div>
                        <button 
                            onClick={() => {
                                const msg = prompt("ENTER EMERGENCY BROADCAST MESSAGE:");
                                if (msg) triggerGlobalSOS(msg);
                            }}
                            className="w-full py-3 bg-neon-red/20 border border-neon-red/40 text-neon-red text-[10px] font-black uppercase tracking-widest italic rounded-sm hover:bg-neon-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,59,92,0.2)] active:scale-95"
                        >
                            ACTIVATE GLOBAL SOS
                        </button>
                      </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-neon-red/10 flex justify-between items-center">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest italic">All emergency actions are logged and require immediate audit verification. System-wide alerts will be triggered.</p>
                  </div>
              </div>

              <div className="glass-panel border-white/5 bg-cyber-black/40 p-6">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Recent Settings Activity</h4>
                     <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">View All Activity</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                           <tr className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest border-b border-white/5">
                              <th className="px-4 py-3">Setting Name</th>
                              <th className="px-4 py-3">Module</th>
                              <th className="px-4 py-3">Changed By</th>
                              <th className="px-4 py-3">Change</th>
                              <th className="px-4 py-3 text-right">Date & Time</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {RECENT_SETTINGS_ACTIVITY.map(log => (
                               <tr key={log.id} className="group hover:bg-white/5 whitespace-nowrap">
                                   <td className="px-4 py-4 text-[10px] font-bold text-white uppercase">{log.name}</td>
                                   <td className="px-4 py-4 text-[9px] font-mono text-slate-500">{log.module}</td>
                                   <td className="px-4 py-4 text-[10px] font-black text-neon-blue italic">{log.user}</td>
                                   <td className="px-4 py-4 text-[9px] font-mono text-slate-400">{log.change}</td>
                                   <td className="px-4 py-4 text-[8px] font-mono text-slate-500 text-right">{log.time}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Security Monitor</h4>
                     <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline flex items-center gap-1">View All <ChevronRight size={10} /></button>
                  </div>
                  <div className="space-y-4">
                      <SettingsSecurityMetric label="Failed Login Attempts" value="12" status="Last 24h" color="red" icon={<Lock />} />
                      <SettingsSecurityMetric label="Suspicious IPs Blocked" value="7" status="Last 24h" color="amber" icon={<Target />} />
                      <SettingsSecurityMetric label="Active Admin Sessions" value="6" status="Online" color="green" icon={<Fingerprint />} />
                      <SettingsSecurityMetric label="Unusual Activities" value="2" status="Detected" color="red" icon={<ShieldAlert />} />
                  </div>
                  <button className="w-full mt-8 py-3 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                     <Shield size={14} /> VIEW SECURITY LOGS
                  </button>
              </div>

              <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">System Performance</h4>
                     <button className="text-[9px] font-mono text-neon-blue uppercase hover:underline">View Report</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <SettingsPerformanceWidget label="API Latency" value="120ms" status="Excellent" color="green" />
                      <SettingsPerformanceWidget label="Order Sync" value="98.7%" status="Excellent" color="green" />
                      <SettingsPerformanceWidget label="Server Uptime" value="99.98%" status="Excellent" color="green" />
                      <SettingsPerformanceWidget label="Rider Connectivity" value="97.6%" status="Good" color="amber" />
                  </div>
              </div>

              <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em] mb-8">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                      <SettingsQuickActionBtn icon={<Database size={14} />} label="Backup Database" color="blue" />
                      <SettingsQuickActionBtn icon={<Send size={14} />} label="Send Broadcast" color="green" />
                      <SettingsQuickActionBtn icon={<RotateCcw size={14} />} label="Restart Services" color="purple" />
                      <SettingsQuickActionBtn icon={<Download size={14} />} label="Export Logs" color="amber" />
                      <SettingsQuickActionBtn icon={<Trash2 size={14} />} label="Clear Cache" color="red" />
                      <SettingsQuickActionBtn icon={<Activity size={14} />} label="System Health" color="cyan" />
                  </div>
              </div>

              <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em] mb-8">System Information</h4>
                  <div className="space-y-4">
                      <SysInfoItem label="Application Version" value="v 2.4.0" />
                      <SysInfoItem label="Environment" value="Production" />
                      <SysInfoItem label="Database" value="Healthy" color="text-neon-green" />
                      <SysInfoItem label="Last Backup" value="24 May 2026, 02:30 AM" />
                      <SysInfoItem label="Server Location" value="Mumbai, India" />
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                            <span>Storage Usage</span>
                            <span className="text-white">68%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-blue w-[68%] shadow-[0_0_8px_#00B2FF]" />
                        </div>
                        <div className="text-[8px] font-mono text-slate-600 text-right uppercase">340 GB / 500 GB</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function SettingsStatCard({ label, value, sub, icon, color }: any) {
    const colorMap: any = {
        blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,178,255,0.1)]',
        purple: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 shadow-[0_0_15px_rgba(176,38,255,0.1)]',
        amber: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5 shadow-[0_0_15px_rgba(255,176,32,0.1)]',
        green: 'text-neon-green border-neon-green/20 bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]',
    };
    
    return (
        <div className="glass-panel p-6 border-white/5 bg-cyber-black/60 relative group cursor-pointer hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                {React.cloneElement(icon as React.ReactElement, { size: 40 })}
            </div>
            <div className="flex items-center gap-6">
                <div className={cn("w-14 h-14 rounded border flex items-center justify-center relative", colorMap[color])}>
                    {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                    <div className="absolute inset-0 bg-current opacity-10 animate-pulse rounded" />
                </div>
                <div>
                    <div className="text-3xl font-black text-white italic tracking-tighter uppercase font-orbitron group-hover:scale-110 transition-transform origin-left duration-300">
                        {value}
                    </div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mt-1 italic">{label}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">{sub}</div>
                </div>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full w-2/3 shadow-[0_0_10px_currentColor]", color === 'blue' ? 'bg-neon-blue' : color === 'purple' ? 'bg-neon-purple' : color === 'amber' ? 'bg-neon-amber' : 'bg-neon-green')} />
            </div>
        </div>
    );
}

function SettingsModuleCard({ title, desc, count, icon, color }: any) {
    const colorClasses: any = {
        blue: 'text-neon-blue border-neon-blue/40 bg-neon-blue/10 group-hover:bg-neon-blue/20',
        green: 'text-neon-green border-neon-green/40 bg-neon-green/10 group-hover:bg-neon-green/20',
        amber: 'text-neon-amber border-neon-amber/40 bg-neon-amber/10 group-hover:bg-neon-amber/20',
        gold: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10 group-hover:bg-yellow-500/20',
        red: 'text-neon-red border-neon-red/40 bg-neon-red/10 group-hover:bg-neon-red/20',
        purple: 'text-neon-purple border-neon-purple/40 bg-neon-purple/10 group-hover:bg-neon-purple/20',
        indigo: 'text-indigo-400 border-indigo-400/40 bg-indigo-400/10 group-hover:bg-indigo-400/20',
        cyan: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10 group-hover:bg-neon-cyan/20',
        emerald: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10 group-hover:bg-emerald-400/20',
    };

    return (
        <div className="glass-panel p-6 border-white/5 bg-cyber-black/40 group relative cursor-pointer hover:border-white/10 transition-all flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
                <div className={cn("w-12 h-12 rounded border flex items-center justify-center transition-colors", colorClasses[color])}>
                    {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                    {count} Settings
                </div>
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-black text-white italic uppercase tracking-widest mb-3 group-hover:neon-text-blue transition-all">{title}</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-mono tracking-tighter opacity-80">{desc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green/30" />
                </div>
                <div className="text-white/20 group-hover:text-neon-blue group-hover:translate-x-1 transition-all">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>
    );
}

function EmergencyToggle({ label, sub }: { label: string, sub: string }) {
    const [active, setActive] = useState(false);
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{label}</span>
                <button 
                  onClick={() => setActive(!active)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative p-1",
                    active ? "bg-neon-red shadow-[0_0_10px_rgba(255,59,92,0.5)]" : "bg-white/10"
                  )}
                >
                    <div className={cn(
                        "w-3 h-3 rounded-full bg-white transition-all transform",
                        active ? "translate-x-5" : "translate-x-0"
                    )} />
                </button>
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter leading-tight">{sub}</p>
        </div>
    );
}

function SettingsSecurityMetric({ label, value, status, color, icon }: any) {
    const colors: any = {
        red: 'text-neon-red',
        amber: 'text-neon-amber',
        green: 'text-neon-green',
    };
    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
            <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded border border-white/5 bg-white/5 flex items-center justify-center", colors[color])}>
                    {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">{label}</div>
                    <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{status}</div>
                </div>
            </div>
            <div className={cn("text-lg font-black italic font-orbitron", colors[color])}>{value}</div>
        </div>
    );
}

function SettingsPerformanceWidget({ label, value, status, color }: any) {
    const colors: any = {
        green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
        amber: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5',
    };
    return (
        <div className={cn("p-4 border rounded relative overflow-hidden group", colors[color])}>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-lg font-black text-white italic font-orbitron mb-1">{value}</div>
            <div className="flex items-center justify-between">
                <span className={cn("text-[8px] font-black uppercase tracking-widest", color === 'green' ? 'text-neon-green' : 'text-neon-amber')}>{status}</span>
                <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("w-1 h-2 rounded-full", i < 4 ? (color === 'green' ? 'bg-neon-green' : 'bg-neon-amber') : 'bg-white/10')} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SettingsQuickActionBtn({ icon, label, color }: any) {
    const colors: any = {
        blue: 'border-neon-blue/20 hover:bg-neon-blue/10 hover:text-neon-blue hover:border-neon-blue/50 text-slate-400',
        green: 'border-neon-green/20 hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green/50 text-slate-400',
        purple: 'border-neon-purple/20 hover:bg-neon-purple/10 hover:text-neon-purple hover:border-neon-purple/50 text-slate-400',
        amber: 'border-neon-amber/20 hover:bg-neon-amber/10 hover:text-neon-amber hover:border-neon-amber/50 text-slate-400',
        red: 'border-neon-red/20 hover:bg-neon-red/10 hover:text-neon-red hover:border-neon-red/50 text-slate-400',
        cyan: 'border-neon-cyan/20 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/50 text-slate-400',
    };
    return (
        <button className={cn("flex flex-col items-center justify-center gap-2 p-4 border rounded-sm transition-all duration-300 group whitespace-nowrap", colors[color])}>
            <div className="group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest italic">{label}</span>
        </button>
    );
}

function SysInfoItem({ label, value, color = 'text-white' }: any) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={cn("text-[10px] font-black uppercase italic tracking-widest text-right", color)}>{value}</span>
        </div>
    );
}

// --- ROLE & PERMISSION MANAGEMENT DASHBOARD ---

const DEPARTMENTS = ['Operations', 'Finance', 'Analytics', 'Support', 'Security', 'AI Systems'];
const ACCESS_LEVELS = [
   { label: 'Full Access', color: 'blue' },
   { label: 'Elevated', color: 'purple' },
   { label: 'Standard', color: 'green' },
   { label: 'Restricted', color: 'amber' },
   { label: 'Blocked', color: 'red' },
];

const PERMISSION_MODULES = [
   {
      id: 'ops',
      title: 'Operational Modules',
      permissions: ['Dashboard View', 'Rider Management', 'Live Order Control', 'Emergency Override', 'Location Tracking']
   },
   {
      id: 'finance',
      title: 'Financial Modules',
      permissions: ['Wallet Access', 'Earnings View', 'Payout Approval', 'Transaction Audit', 'Tax Settings']
   },
   {
      id: 'admin',
      title: 'Administrative Modules',
      permissions: ['User Management', 'Report Generation', 'Notification Broadcast', 'Incentive Config', 'AI Settings']
   },
   {
      id: 'security',
      title: 'Security Modules',
      permissions: ['Role Config', 'Audit Logs', 'API Key Management', 'Session Control', 'System Lockdown']
   }
];

const INITIAL_ROLES = [
   { id: 'R-001', name: 'Super Admin', dept: 'Security', level: 'Full Access', users: 3, permissions: 42, risk: 2, status: 'Active' },
   { id: 'R-002', name: 'Finance Manager', dept: 'Finance', level: 'Elevated', users: 5, permissions: 18, risk: 14, status: 'Active' },
   { id: 'R-003', name: 'Rider Ops Lead', dept: 'Operations', level: 'Elevated', users: 8, permissions: 24, risk: 8, status: 'Active' },
   { id: 'R-004', name: 'Support Associate', dept: 'Support', level: 'Standard', users: 24, permissions: 12, risk: 5, status: 'Active' },
   { id: 'R-005', name: 'AI Optimization Analyst', dept: 'AI Systems', level: 'Elevated', users: 4, permissions: 15, risk: 12, status: 'Active' },
   { id: 'R-006', name: 'Emergency Dispatcher', dept: 'Operations', level: 'Elevated', users: 12, permissions: 10, risk: 22, status: 'Active' },
];

function RolePermissionManagement() {
   const [roles, setRoles] = useState(INITIAL_ROLES);
   const [selectedRole, setSelectedRole] = useState<any>(INITIAL_ROLES[0]);
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('inventory'); // inventory | audit | emergency
   const [isLockingDown, setIsLockingDown] = useState(false);

   const filteredRoles = roles.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.dept.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
         {/* Security Header */}
         <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-mono text-neon-blue uppercase tracking-[0.3em] mb-2 leading-none">
                  <Fingerprint size={10} className="animate-pulse" /> // SECURITY_AUTH_KERNEL_v9.1
               </div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic flex items-center gap-3">
                  ACCESS CONTROL CORE
                  <span className="text-[10px] bg-neon-red/10 text-neon-red px-2 py-1 rounded border border-neon-red/20 not-italic tracking-widest font-mono">RBAC_STABLE</span>
               </h1>
               <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-3">
                  Enterprise-grade role management, security privileges & tactical authority protocols
               </p>
            </div>
            <div className="flex gap-4">
               <div className="glass-panel px-4 py-2 border-white/5 flex flex-col items-end">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">SYSTEM_INTEGRITY</div>
                  <div className="text-sm font-black text-neon-green italic uppercase flex items-center gap-2">
                     VERIFIED <ShieldCheck size={14} className="animate-pulse" />
                  </div>
               </div>
               <div className="glass-panel px-4 py-2 border-white/5 flex flex-col items-end">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">THREAT_LEVEL</div>
                  <div className="text-sm font-black text-neon-blue italic uppercase">LOW (ALPHA_GRIFFIN)</div>
               </div>
            </div>
         </div>

         {/* Security Intelligence Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityMetricCard 
               label="Total System Roles" 
               value="18" 
               sub="Across 6 Departments" 
               icon={<Shield />} 
               color="blue" 
            />
            <SecurityMetricCard 
               label="Privileged Users" 
               value="54" 
               sub="Active Sessions: 12" 
               icon={<Users />} 
               color="purple" 
            />
            <SecurityMetricCard 
               label="Restricted Modules" 
               value="08" 
               sub="High Security Masking" 
               icon={<Lock />} 
               color="amber" 
            />
            <SecurityMetricCard 
               label="Security Anomalies" 
               value="02" 
               sub="Resolved in last 24h" 
               icon={<ShieldAlert />} 
               color="red" 
            />
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center justify-between border-b border-white/5">
            <div className="flex gap-8">
               <button 
                  onClick={() => setActiveTab('inventory')}
                  className={cn(
                     "pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 transition-all",
                     activeTab === 'inventory' ? "text-neon-blue border-neon-blue shadow-[0_4px_10px_-4px_rgba(0,178,255,0.4)]" : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
               >
                  ROLE INVENTORY
               </button>
               <button 
                  onClick={() => setActiveTab('matrix')}
                  className={cn(
                     "pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 transition-all",
                     activeTab === 'matrix' ? "text-neon-purple border-neon-purple shadow-[0_4px_10px_-4px_rgba(176,38,255,0.4)]" : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
               >
                  PERMISSION MATRIX
               </button>
               <button 
                  onClick={() => setActiveTab('audit')}
                  className={cn(
                     "pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 transition-all",
                     activeTab === 'audit' ? "text-neon-green border-neon-green shadow-[0_4px_10px_-4px_rgba(0,255,157,0.4)]" : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
               >
                  SECURITY AUDIT LOGS
               </button>
            </div>
            <div className="flex gap-4 pb-4">
               <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-cyber-black text-[10px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_15px_rgba(0,178,255,0.2)] hover:scale-105 transition-all">
                  CREATE NEW ROLE <Plus size={14} />
               </button>
            </div>
         </div>

         {/* Main Security Workspace */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               
               {activeTab === 'inventory' && (
                  <div className="glass-panel overflow-hidden border-white/5">
                     <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input 
                                 type="text" 
                                 placeholder="FILTER AUTHORITY NODES..." 
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="bg-cyber-black border border-white/10 pl-10 pr-4 py-1.5 text-[10px] font-mono tracking-widest text-white uppercase focus:border-neon-blue/50 outline-none w-64"
                              />
                           </div>
                           <select className="bg-cyber-black border border-white/10 px-4 py-1.5 text-[10px] font-mono tracking-widest text-slate-400 uppercase outline-none">
                              <option>ALL DEPARTMENTS</option>
                              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                           </select>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                           TOTAL_NODES: {filteredRoles.length}
                        </div>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-white/5">
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Role & ID</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Department</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Access Level</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-center">Users</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-center">Risk Score</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {filteredRoles.map(role => (
                                 <RoleRow 
                                    key={role.id} 
                                    role={role} 
                                    isSelected={selectedRole?.id === role.id}
                                    onClick={() => setSelectedRole(role)}
                                 />
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {activeTab === 'matrix' && (
                  <div className="glass-panel p-6 border-neon-purple/20 bg-neon-purple/5 space-y-8">
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-lg font-black italic text-white uppercase leading-none mb-2">Permission Matrix System</h3>
                           <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Network size={10} className="text-neon-purple animate-pulse" /> Configuration for {selectedRole?.name}
                           </p>
                        </div>
                        <div className="flex gap-2">
                           <button className="px-4 py-2 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest italic hover:text-white transition-colors">RESET_MATRIX</button>
                           <button className="px-4 py-2 bg-neon-purple text-white text-[9px] font-black uppercase tracking-widest italic rounded-sm shadow-[0_0_15px_rgba(176,38,255,0.3)]">COMMIT_CHANGES_v9.1</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {PERMISSION_MODULES.map(module => (
                           <PermissionModuleCard key={module.id} module={module} />
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'audit' && (
                  <div className="glass-panel p-6 border-white/5 space-y-6 min-h-[600px] flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic flex items-center gap-2">
                           <History size={14} className="text-neon-green" /> Complete Audit Timeline
                        </h3>
                        <div className="flex gap-3">
                           <div className="relative">
                              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input type="text" value="LAST 24 HOURS" readOnly className="bg-white/5 border border-white/10 pl-8 pr-4 py-1.5 text-[9px] font-mono text-slate-300 w-32 cursor-pointer" />
                           </div>
                           <button className="p-2 border border-white/10 text-slate-400 hover:text-white"><Download size={14} /></button>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-4">
                        <AuditLogItem 
                           user="SUPER_ADMIN_ALPHA" 
                           action="MODIFIED_ROLE_PERMISSIONS" 
                           target="Finance Manager" 
                           time="12 MIN AGO" 
                           status="Verified" 
                        />
                        <AuditLogItem 
                           user="OPS_MGR_PATNA" 
                           action="LOGIN_ATTEMPT" 
                           target="Auth Core" 
                           time="45 MIN AGO" 
                           status="Success" 
                        />
                        <AuditLogItem 
                           user="UNKNOWN_PROTOCOL" 
                           action="UNAUTHORIZED_ACCESS_TRY" 
                           target="Earnings Module" 
                           time="2 HOURS AGO" 
                           status="Blocked" 
                           critical
                        />
                        <AuditLogItem 
                           user="SYSTEM_AUTO_SYC" 
                           action="PROPAGATED_PERMISSION_UPDATES" 
                           target="Global Node" 
                           time="5 HOURS AGO" 
                           status="Completed" 
                        />
                        <AuditLogItem 
                           user="FIN_ANALYST_01" 
                           action="EXPORTED_REPORT" 
                           target="Revenue_Q1.xlsx" 
                           time="Yesterday, 4:22 PM" 
                           status="Audited" 
                        />
                     </div>
                  </div>
               )}

               {/* Department Overlays */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic">
                        <Workflow size={14} className="text-neon-blue" /> Department Access Load
                     </h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={DEPARTMENTS.map(d => ({ name: d, val: Math.floor(Math.random() * 40) + 10 }))}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }} />
                           <Tooltip contentStyle={{ backgroundColor: '#050816', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }} />
                           <Bar dataKey="val" fill="#00B2FF" radius={[2, 2, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic">
                        <Terminal size={14} className="text-neon-green" /> Authority Distribution
                     </h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                           <Pie 
                              data={[
                                 { name: 'Admin', value: 40, color: '#00B2FF' },
                                 { name: 'Elevated', value: 30, color: '#B026FF' },
                                 { name: 'Standard', value: 20, color: '#00FF9D' },
                                 { name: 'Restricted', value: 10, color: '#FFB020' },
                              ]} 
                              cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                           >
                              {[0, 1, 2, 3].map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={['#00B2FF', '#B026FF', '#00FF9D', '#FFB020'][index]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#050816', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Right Intelligence Sidebar */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* AI Security Recommendations */}
               <div className="glass-panel p-6 border-neon-purple/20 bg-neon-purple/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <BrainCircuit size={40} className="text-neon-purple" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 mb-6 italic">
                     Security AI Engine <Activity size={14} className="text-neon-purple animate-pulse" />
                  </h3>

                  <div className="space-y-4">
                     <AISecurityPrompt 
                        title="Privilege Escalation Risk" 
                        desc="Finance Manager role has 4 unused elevated permissions. Recommend auto-pruning." 
                        risk="HIGH" 
                     />
                     <AISecurityPrompt 
                        title="Login Anomaly Detected" 
                        desc="Super Admin access from unusual IP segment detected. Geo-fencing recommended." 
                        risk="CRITICAL" 
                     />
                     <AISecurityPrompt 
                        title="Redundant Role Detection" 
                        desc="Role 'Support Associate' and 'CSR' share 98% permission overlap. Merge suggested." 
                        risk="LOW" 
                     />
                  </div>

                  <button className="w-full mt-6 py-4 glass-panel border-neon-purple/30 text-neon-purple text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neon-purple hover:text-white transition-all italic">
                     OPTIMIZE AUTH_KERNEL_v9
                  </button>
               </div>

               {/* Emergency Access Controls */}
               <div className="glass-panel p-6 border-neon-red/20 bg-neon-red/5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Emergency Ops</h3>
                     <ZapOff size={14} className="text-neon-red animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <EmergencyButton icon={<Lock />} label="LOCKDOWN" color="red" onClick={() => setIsLockingDown(true)} />
                     <EmergencyButton icon={<RotateCcw />} label="REVOKE ALL" color="amber" />
                     <EmergencyButton icon={<LogOut />} label="FORCE OUT" color="orange" />
                     <EmergencyButton icon={<Database />} label="SYNC CRYPTO" color="blue" />
                  </div>

                  {isLockingDown && (
                     <div className="mt-6 p-4 border border-neon-red bg-neon-red/20 rounded animate-pulse">
                        <div className="text-[10px] font-black text-neon-red uppercase tracking-widest text-center">INITIATING SYSTEM LOCKDOWN...</div>
                        <button onClick={() => setIsLockingDown(false)} className="w-full mt-4 py-1 text-[8px] font-mono text-white/50 uppercase italic underline">Abort Protocol</button>
                     </div>
                  )}
               </div>

               {/* Real-time Login/Access Feed */}
               <div className="glass-panel p-6 border-white/5 h-[350px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Access Feed</h3>
                     <Signal size={14} className="text-neon-blue animate-pulse" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                     <AccessFeedItem user="Admin_91" action="AUTH_SUCCESS" time="2s ago" role="Super Admin" />
                     <AccessFeedItem user="CSR_Rahul" action="PAGE_ENTRY" time="15s ago" role="Support" />
                     <AccessFeedItem user="Fin_Maya" action="MOD_DATA" time="1m ago" role="Finance" />
                     <AccessFeedItem user="Rider_Bot" action="API_CALL" time="3m ago" role="System" />
                     <AccessFeedItem user="Unknown" action="AUTH_FAIL" time="5m ago" role="Guest" critical />
                     <AccessFeedItem user="Admin_91" action="PAGE_EXIT" time="12m ago" role="Super Admin" />
                  </div>
               </div>

               {/* Security Health Stats */}
               <div className="glass-panel p-4 border-white/5 bg-cyber-black/40">
                  <div className="flex items-center justify-between mb-4">
                     <div className="text-[10px] font-black text-white uppercase italic">Access Integrity Info</div>
                     <ShieldCheck size={12} className="text-neon-green" />
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                           <span>Kernel Synchronization</span>
                           <span className="text-neon-green">Complete</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-neon-green" style={{ width: '100%' }} />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                           <span>Entropy Buffer Load</span>
                           <span className="text-neon-blue">14%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-neon-blue shadow-[0_0_8px_#00B2FF]" style={{ width: '14%' }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function SecurityMetricCard({ label, value, sub, icon, color }: any) {
   const colorMap: any = {
      blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,178,255,0.1)]',
      purple: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 shadow-[0_0_15px_rgba(176,38,255,0.1)]',
      amber: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5 shadow-[0_0_15px_rgba(255,176,32,0.1)]',
      red: 'text-neon-red border-neon-red/20 bg-neon-red/5 shadow-[0_0_15px_rgba(255,59,92,0.1)]',
   };

   return (
      <motion.div 
         whileHover={{ y: -5, scale: 1.02 }}
         className="glass-panel p-6 border-white/5 bg-cyber-black/40 relative overflow-hidden group cursor-pointer"
      >
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
            {icon}
         </div>
         <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2 rounded-sm border", colorMap[color])}>
               {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color === 'red' ? 'bg-neon-red' : 'bg-neon-green')} /> LIVE
            </div>
         </div>
         <div className="space-y-1">
            <div className="text-3xl font-black text-white italic font-orbitron leading-none">{value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic leading-tight">{label}</div>
         </div>
         <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase">{sub}</span>
            <ChevronRight size={12} className="text-slate-700 group-hover:text-neon-blue transition-colors" />
         </div>
      </motion.div>
   );
}

function RoleRow({ role, isSelected, onClick }: any) {
   const levelColor = role.level.includes('Full') ? 'text-neon-blue bg-neon-blue/10 border-neon-blue/20' : 
                     role.level.includes('Elevated') ? 'text-neon-purple bg-neon-purple/10 border-neon-purple/20' : 
                     'text-neon-green bg-neon-green/10 border-neon-green/20';

   return (
      <tr 
         onClick={onClick}
         className={cn(
            "group cursor-pointer transition-colors relative",
            isSelected ? "bg-white/5" : "hover:bg-white/[0.02]"
         )}
      >
         <td className="px-6 py-4">
            <div className="flex items-center gap-3">
               <div className={cn(
                  "w-8 h-8 rounded border flex items-center justify-center transition-colors shadow-[0_0_10px_transparent]",
                  isSelected ? "bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,178,255,0.3)]" : "bg-white/5 border-white/10 text-slate-500 group-hover:border-white/20"
               )}>
                  <Fingerprint size={16} />
               </div>
               <div>
                  <div className="text-[11px] font-black text-white uppercase italic tracking-wide group-hover:text-neon-blue transition-colors">{role.name}</div>
                  <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-none mt-1">{role.id}</div>
               </div>
               {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue" />}
            </div>
         </td>
         <td className="px-6 py-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role.dept}</span>
         </td>
         <td className="px-6 py-4">
            <span className={cn("px-2 py-1 rounded-[2px] border text-[8px] font-black uppercase tracking-[0.2em] italic", levelColor)}>
               {role.level}
            </span>
         </td>
         <td className="px-6 py-4 text-center">
            <span className="text-xs font-black font-mono text-white group-hover:text-neon-blue transition-colors">{role.users}</span>
         </td>
         <td className="px-6 py-4">
            <div className="flex flex-col items-center gap-1">
               <div className="text-[10px] font-black text-white italic">{role.risk}/100</div>
               <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full", role.risk > 15 ? 'bg-neon-red shadow-[0_0_5px_#FF3B5C]' : 'bg-neon-green')} style={{ width: `${role.risk}%` }} />
               </div>
            </div>
         </td>
         <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button title="Edit Authorities" className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-neon-blue hover:border-neon-blue/40 transition-all"><Edit3 size={14} /></button>
               <button title="Clone Node" className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-neon-purple hover:border-neon-purple/40 transition-all"><Copy size={14} /></button>
               <button title="Revoke Role" className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-neon-red hover:border-neon-red/40 transition-all"><Trash2 size={14} /></button>
            </div>
         </td>
      </tr>
   );
}

function PermissionModuleCard({ module }: any) {
   return (
      <div className="glass-panel p-5 border-white/5 bg-cyber-black/40 hover:border-white/10 transition-all space-y-4">
         <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-neon-purple border border-white/10">
               {module.id === 'ops' && <Workflow size={16} />}
               {module.id === 'finance' && <DollarSign size={16} />}
               {module.id === 'admin' && <Terminal size={16} />}
               {module.id === 'security' && <ShieldCheck size={16} />}
            </div>
            <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.15em]">{module.title}</h4>
         </div>
         <div className="space-y-3">
            {module.permissions.map((perm: string) => (
               <div key={perm} className="flex items-center justify-between group">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide group-hover:text-white transition-colors">{perm}</span>
                  <div className="flex items-center gap-4">
                     {['READ', 'WRITE'].map(mode => (
                        <div key={mode} className="flex flex-col items-center">
                           <span className="text-[7px] font-mono text-slate-600 mb-1">{mode}</span>
                           <button className={cn(
                              "w-8 h-4 rounded-full relative transition-all border",
                              Math.random() > 0.3 ? "bg-neon-purple/20 border-neon-purple/40 shadow-[0_0_5px_rgba(176,38,255,0.2)]" : "bg-white/5 border-white/10"
                           )}>
                              <div className={cn(
                                 "absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all",
                                 Math.random() > 0.3 ? "right-0.5 bg-neon-purple" : "left-0.5 bg-slate-700"
                              )} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

function AuditLogItem({ user, action, target, time, status, critical = false }: any) {
   return (
      <div className={cn(
         "p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/10 transition-all border-l-2",
         critical ? 'border-l-neon-red' : 'border-l-neon-green'
      )}>
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", critical ? 'bg-neon-red' : 'bg-neon-green')} />
               <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{time}</span>
            </div>
            <span className={cn(
               "text-[8px] font-black italic uppercase px-1.5 py-0.5 border rounded-sm",
               status === 'Blocked' ? 'bg-neon-red/10 border-neon-red text-neon-red' : 'bg-neon-green/10 border-neon-green/30 text-neon-green'
            )}>{status}</span>
         </div>
         <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-black text-white uppercase italic">{user}</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{action}</span>
         </div>
         <div className="mt-1 text-[9px] font-mono text-slate-600 uppercase">TARGET_OBJECT: <span className="text-slate-400 italic">{target}</span></div>
      </div>
   );
}

function AISecurityPrompt({ title, desc, risk }: any) {
   const riskColor = risk === 'CRITICAL' ? 'text-neon-red' : risk === 'HIGH' ? 'text-neon-orange' : 'text-neon-blue';

   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:bg-white/10 hover:border-white/20 transition-all group">
         <div className="flex justify-between items-center mb-2">
            <h5 className="text-[10px] font-black text-white uppercase italic tracking-wider">{title}</h5>
            <span className={cn("text-[8px] font-black italic uppercase", riskColor)}>{risk}_RISK</span>
         </div>
         <p className="text-[10px] text-slate-500 italic leading-relaxed">{desc}</p>
         <button className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-neon-purple uppercase tracking-[0.2em] italic hover:gap-3 transition-all">
            REVIEW & APPLY FIX <ArrowRight size={10} />
         </button>
      </div>
   );
}

function EmergencyButton({ icon, label, color, onClick }: any) {
   const colors: any = {
      red: 'border-neon-red/30 text-neon-red hover:bg-neon-red hover:text-white hover:border-neon-red',
      amber: 'border-neon-amber/30 text-neon-amber hover:bg-neon-amber hover:text-white hover:border-neon-amber',
      orange: 'border-neon-orange/30 text-neon-orange hover:bg-neon-orange hover:text-white hover:border-neon-orange',
      blue: 'border-neon-blue/30 text-neon-blue hover:bg-neon-blue hover:text-white hover:border-neon-blue',
   };

   return (
      <button 
         onClick={onClick}
         className={cn(
            "p-4 border bg-cyber-black flex flex-col items-center justify-center gap-2 transition-all group",
            colors[color]
         )}
      >
         {React.cloneElement(icon as React.ReactElement, { size: 18, className: "group-hover:scale-125 transition-transform" })}
         <span className="text-[9px] font-black uppercase tracking-widest italic">{label}</span>
      </button>
   );
}

function AccessFeedItem({ user, action, time, role, critical = false }: any) {
   return (
      <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
         <div className={cn(
            "w-px h-8",
            critical ? 'bg-neon-red' : 'bg-neon-blue'
         )} />
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-white uppercase truncate italic">{user}</span>
               <span className="text-[8px] font-mono text-slate-600">{time}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={cn("text-[7px] font-black uppercase tracking-tighter", critical ? 'text-neon-red' : 'text-neon-blue')}>{action}</span>
               <span className="text-[7px] font-mono text-slate-500 uppercase italic whitespace-nowrap">@{role}</span>
            </div>
         </div>
      </div>
   );
}


const AI_INSIGHT_CATEGORIES = [
   { label: 'ALL INTELLIGENCE', icon: <Target size={14} /> },
   { label: 'DELIVERY BOT', icon: <Bot size={14} /> },
   { label: 'OPERATIONS ANALYST', icon: <BarChart4 size={14} /> },
   { label: 'SYSTEM COMMAND', icon: <TerminalIcon size={14} /> },
];

const PREDICTION_DATA = [
   { time: '08:00', actual: 4200, predicted: 4000 },
   { time: '10:00', actual: 5800, predicted: 5500 },
   { time: '12:00', actual: 8200, predicted: 7800 },
   { time: '14:00', actual: 7100, predicted: 7500 },
   { time: '16:00', actual: 6400, predicted: 6800 },
   { time: '18:00', predicted: 9200 },
   { time: '20:00', predicted: 11500 },
   { time: '22:00', predicted: 8400 },
   { time: '00:00', predicted: 5200 },
];

function AIInsights() {
   const [activeCategory, setActiveCategory] = useState('ALL INTELLIGENCE');
   const [chatHistory, setChatHistory] = useState<any[]>([
     { role: 'model', content: "RAjFleet Core Intelligence initialized. I have full access to current fleet parameters. How can I help optimize operations today?" }
   ]);
   const [prompt, setPrompt] = useState('');
   const [isThinking, setIsThinking] = useState(false);
   const [proactiveInsights, setProactiveInsights] = useState<any[]>([]);
   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

   useEffect(() => {
      const fetchProactive = async () => {
         try {
            const res = await fetch('/api/admin/proactive-insights');
            const data = await res.json();
            setProactiveInsights(data);
         } catch (err) {
            console.error("Proactive scan failed");
         }
      };
      fetchProactive();
   }, []);

   const handleAskAI = async () => {
      if (!prompt.trim() || isThinking) return;
      
      const userMsg = { role: 'user', content: prompt };
      setChatHistory(prev => [...prev, userMsg]);
      setPrompt('');
      setIsThinking(true);

      try {
         const res = await fetch('/api/admin/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, history: chatHistory })
         });
         const data = await res.json();
         
         if (data.answer) {
            setChatHistory(prev => [...prev, { role: 'model', content: data.answer }]);
         } else {
            setChatHistory(prev => [...prev, { role: 'model', content: "Uplink optimization in progress. Tactical fallback mode engaged. " + (data.error || "") }]);
         }
      } catch (err: any) {
         setChatHistory(prev => [...prev, { role: 'model', content: "Neural connection timed out. Core systems remain nominal. Please re-initiate link." }]);
      } finally {
         setIsThinking(false);
      }
   };

   const generatePDFReport = async () => {
      setIsGeneratingReport(true);
      const reportElement = document.getElementById('ai-report-content');
      if (!reportElement) return;

      try {
         const canvas = await html2canvas(reportElement, { 
            scale: 2,
            backgroundColor: "#050816",
            useCORS: true
         });
         const imgData = canvas.toDataURL('image/png');
         const pdf = new jsPDF('p', 'mm', 'a4');
         const imgProps = pdf.getImageProperties(imgData);
         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
         
         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
         pdf.save(`RAJ_FLEET_OPS_REPORT_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
         toast.success("REPORT EXPORTED", { description: "Executive Report saved locally." });
      } catch (err) {
         toast.error("Export Failed", { description: "Canvas buffer overflow." });
      } finally {
         setIsGeneratingReport(false);
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
         {/* AI Header */}
         <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-mono text-neon-blue uppercase tracking-[0.3em] mb-2 leading-none">
                  <BrainCircuit size={10} className="animate-pulse" /> // RAJFLEET_AI_COMMAND_CENTER_v5
               </div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic flex items-center gap-3">
                  AI OPERATIONS INTELLIGENCE
                  <span className="text-[10px] bg-neon-blue/10 text-neon-blue px-2 py-1 rounded border border-neon-blue/20 not-italic tracking-widest font-mono">CORE_CONNECTED</span>
               </h1>
               <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-3 border-l border-neon-blue pl-3 italic font-black">
                  Tactical Advisor & Logistic Optimization Engine
               </p>
            </div>
            <div className="flex gap-4">
               <div className="glass-panel px-4 py-2 border-white/5 flex flex-col items-end bg-cyber-black/40">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">NEURAL_SYNC_LOAD</div>
                  <div className="text-sm font-black text-neon-green italic uppercase flex items-center gap-2 mt-1">
                     OPTIMAL <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  </div>
               </div>
               <button 
                 onClick={generatePDFReport}
                 disabled={isGeneratingReport}
                 className="glass-panel px-4 py-2 border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10 transition-all flex flex-col items-end cursor-pointer group hover:border-neon-blue/50"
               >
                  <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest group-hover:text-neon-blue">GENERATE_EXECUTIVE_REPORT</div>
                  <div className="text-sm font-black text-white italic uppercase flex items-center gap-2 mt-1">
                     {isGeneratingReport ? "PROCESSING..." : "EXPORT PDF"} <Download size={14} className={isGeneratingReport ? "animate-bounce" : ""} />
                  </div>
               </button>
            </div>
         </div>

         {/* Workspace Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
            
            {/* Left Column: AI Interface */}
            <div className="lg:col-span-12 glass-panel p-1 border-white/10 flex flex-col relative overflow-hidden bg-cyber-black/40">
               {/* Categories Toolbar */}
               <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-2">
                     {AI_INSIGHT_CATEGORIES.map(cat => (
                        <button 
                           key={cat.label}
                           onClick={() => setActiveCategory(cat.label)}
                           className={cn(
                              "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all italic rounded-sm border border-transparent",
                              activeCategory === cat.label 
                                 ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue shadow-[0_0_15px_rgba(56,189,248,0.1)]" 
                                 : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                           )}
                        >
                           {cat.icon} {cat.label}
                        </button>
                     ))}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2 px-4">
                    <History size={12} className="text-neon-blue" /> LATENCY: 0.4s
                  </div>
               </div>

               {/* Chat & Intelligence Viewer Side-by-Side */}
               <div className="flex-1 flex overflow-hidden lg:flex-row flex-col min-h-[600px]">
                  {/* Chat Section */}
                  <div className="lg:w-1/2 w-full flex flex-col border-r border-white/5 bg-cyber-black/20 relative">
                     <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {chatHistory.map((msg, i) => (
                           <div 
                              key={i} 
                              className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}
                           >
                              <div className="flex items-center gap-2 mb-1 opacity-60">
                                 <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                                    {msg.role === 'user' ? 'AUTH_ADMIN' : 'AI_SYSTEM_CORE'}
                                 </span>
                                 {msg.role === 'model' && <Sparkles size={8} className="text-neon-blue" />}
                              </div>
                              <div className={cn(
                                 "max-w-[95%] p-4 rounded-sm border text-[11px] leading-relaxed shadow-lg",
                                 msg.role === 'user' 
                                    ? "bg-neon-blue/10 border-neon-blue/30 text-white font-medium" 
                                    : "bg-white/[0.03] border-white/10 text-slate-300 font-sans italic"
                              )}>
                                 <AIResponseRenderer content={msg.content} />
                              </div>
                           </div>
                        ))}
                        {isThinking && (
                           <div className="flex flex-col gap-2 p-4 bg-white/5 border border-white/5 rounded-sm animate-pulse">
                              <div className="text-[9px] font-mono text-neon-blue uppercase tracking-widest italic flex items-center gap-2">
                                 <Cpu size={10} className="animate-spin" /> NEURAL_PROCESS_INIT...
                              </div>
                              <div className="flex gap-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div className="w-1/3 h-full bg-neon-blue" />
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Chat Input */}
                     <div className="p-6 bg-cyber-black/60 border-t border-white/5 backdrop-blur-md">
                        <div className="relative group">
                           <textarea 
                              value={prompt}
                              onChange={e => setPrompt(e.target.value)}
                              onKeyDown={e => {
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAskAI();
                                 }
                              }}
                              placeholder="Operational query (e.g. 'Analyze revenue risk' or 'Scan fleet health')..."
                              className="w-full bg-white/[0.02] border border-white/10 rounded-sm pl-4 pr-16 py-4 text-[11px] font-sans text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 min-h-[100px] resize-none tracking-wide"
                           />
                           <button 
                              onClick={handleAskAI}
                              disabled={isThinking || !prompt.trim()}
                              className="absolute right-4 bottom-4 w-10 h-10 bg-neon-blue text-cyber-black rounded-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_0_15px_rgba(0,178,255,0.3)]"
                           >
                              <Send size={20} />
                           </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                           <QuickAction label="Daily Summary" icon={<FileText size={12} />} onClick={() => setPrompt("Provide a complete daily operational status summary.")} />
                           <QuickAction label="Fleet Health" icon={<Truck size={12} />} onClick={() => setPrompt("Scan fleet for offline or low-performance riders.")} />
                           <QuickAction label="Revenue Risks" icon={<ShieldAlert size={12} />} onClick={() => setPrompt("Check for payment anomalies or revenue leaks.")} />
                        </div>
                     </div>
                  </div>

                  {/* Intelligence Viewer Right Pane */}
                  <div id="ai-report-content" className="lg:w-1/2 w-full p-8 space-y-8 bg-cyber-deep/10 overflow-y-auto custom-scrollbar border-l border-white/5 relative bg-[#050816]">
                     <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                          style={{ backgroundImage: 'linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                     
                     <div className="relative z-10 space-y-10">
                        {/* Executive Header (For PDF Export) */}
                        <div className="hidden pdf-only:block border-b border-neon-blue/50 pb-6 mb-10">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">RAJFLEET INTELLIGENCE SYSTEMS</h2>
                                 <p className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] mt-1 italic">Tactical Logistics Executive Summary</p>
                              </div>
                              <div className="text-right font-mono">
                                 <div className="text-[9px] text-slate-400 capitalize">{format(new Date(), 'EEEE, MMMM do yyyy')}</div>
                                 <div className="text-[9px] text-neon-blue uppercase mt-1 tracking-widest font-black">SECURE_REF: {Date.now().toString(16).toUpperCase()}</div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <h3 className="text-xs font-black text-white uppercase italic tracking-[0.3em] flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_#00B2FF]" />
                              PROACTIVE NEURAL FEED
                           </h3>
                           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Live Sync: {format(new Date(), 'HH:mm:ss')}</span>
                        </div>

                        {/* Proactive Insight Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {proactiveInsights.length > 0 ? proactiveInsights.map((insight, idx) => (
                              <div key={idx} className={cn(
                                 "glass-panel p-5 border-l-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all group",
                                 insight.type === 'RISK' ? 'border-l-neon-red' : insight.type === 'SUCCESS' ? 'border-l-neon-green' : 'border-l-neon-blue'
                              )}>
                                 <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider italic leading-tight">{insight.title}</h4>
                                    <div className={cn(
                                       "text-[8px] font-mono px-1.5 py-0.5 rounded-sm border",
                                       insight.type === 'RISK' ? 'border-neon-red/30 text-neon-red' : 'border-neon-blue/30 text-neon-blue'
                                    )}>{insight.confidence}% CONF</div>
                                 </div>
                                 <p className="text-[10px] text-slate-400 leading-relaxed font-sans mb-4 italic">{insight.description}</p>
                                 <div className="flex justify-between items-center text-[9px] font-mono uppercase border-t border-white/5 pt-3">
                                    <span className="text-slate-600 italic">IMPACT_EST:</span>
                                    <span className={cn("font-black", insight.type === 'RISK' ? 'text-neon-red' : 'text-neon-green')}>{insight.impact}</span>
                                 </div>
                              </div>
                           )) : (
                              <div className="col-span-2 py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
                                 <div className="w-12 h-12 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin mb-4" />
                                 <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] italic">Synthesizing network parameters...</div>
                              </div>
                           )}
                        </div>

                        {/* Efficiency Metrics */}
                        <div className="space-y-6">
                           <div className="glass-panel p-6 border-white/5 bg-gradient-to-br from-neon-blue/10 to-transparent">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                                 <ZapIcon size={12} className="text-neon-blue" />
                                 OPERATIONAL EFFICIENCY MATRIX
                              </h4>
                              <div className="grid grid-cols-3 gap-6">
                                 <IntelligenceStat label="Fleet Utilization" value="84.2%" trend="+4%" color="blue" />
                                 <IntelligenceStat label="Avg. Velocity" value="28km/h" trend="-1.2%" color="cyan" />
                                 <IntelligenceStat label="SLA Adherence" value="98.1%" trend="stable" color="green" />
                              </div>
                           </div>

                           <div className="glass-panel p-6 border-white/5 bg-cyber-black/40">
                              <div className="flex justify-between items-center mb-6">
                                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                    <MapPin size={12} className="text-neon-orange" />
                                    GEO_DEMAND ANALYTICS
                                 </h4>
                                 <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest font-black">ACTIVE_REGION_01</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-3 bg-white/5 border-l-2 border-neon-orange">
                                    <div className="text-[10px] font-mono text-slate-500 uppercase leading-none italic font-black">HOT ZONE ALPHA</div>
                                    <div className="text-sm font-black text-white italic mt-1 uppercase">Kankarbagh East</div>
                                 </div>
                                 <div className="p-3 bg-white/5 border-l-2 border-neon-blue">
                                    <div className="text-[10px] font-mono text-slate-500 uppercase leading-none italic font-black">PEAK LOAD TIME</div>
                                    <div className="text-sm font-black text-white italic mt-1 uppercase">19:40 - 21:00</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function AIResponseRenderer({ content }: { content: string }) {
  const jsonRegex = /```json\n([\s\S]*?)\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = jsonRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    try {
      const uiData = JSON.parse(match[1]);
      parts.push({ type: 'ui', value: uiData });
    } catch (e) {
      parts.push({ type: 'text', value: match[0] });
    }
    lastIndex = jsonRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  if (parts.length === 0) {
     return <div className="whitespace-pre-wrap font-sans text-[11px] text-slate-300 leading-relaxed italic">{content}</div>;
  }

  return (
    <div className="space-y-6">
      {parts.map((p, i) => {
        if (p.type === 'text') {
           return <div key={i} className="whitespace-pre-wrap font-sans text-[11px] text-slate-300 leading-relaxed italic">{p.value}</div>;
        }
        return <RichComponent key={i} data={p.value} />;
      })}
    </div>
  );
}

function RichComponent({ data }: any) {
   if (data.ui_component === 'table') {
      return (
         <div className="my-6 overflow-x-auto glass-panel border-white/10 bg-cyber-black/60 rounded-sm overflow-hidden shadow-2xl">
            <table className="w-full text-left font-mono text-[9px]">
               <thead>
                  <tr className="border-b border-white/10 bg-neon-blue/10">
                     {data.data.columns.map((col: string, idx: number) => (
                        <th key={idx} className="px-4 py-3 text-[8px] text-neon-blue uppercase tracking-[0.2em] font-black italic">{col}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {data.data.rows.map((row: any, rIdx: number) => (
                     <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                        {Object.values(row).map((val: any, cIdx: number) => (
                           <td key={cIdx} className="px-4 py-3 text-slate-300 font-medium">
                              {renderTableCell(val)}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      );
   }

   if (data.ui_component === 'metric_grid') {
      return (
         <div className="grid grid-cols-2 gap-3 my-4">
            {data.data.map((m: any, idx: number) => (
               <div key={idx} className="glass-panel p-4 border-white/10 bg-white/[0.02] flex flex-col justify-center gap-1 hover:border-neon-blue/30 transition-all group">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none group-hover:text-neon-blue">{m.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                     <span className="text-sm font-black text-white italic">{m.value}</span>
                     {m.trend && <span className={cn("text-[7px] font-bold", m.trend.startsWith('+') ? 'text-neon-green' : 'text-neon-red')}>{m.trend}</span>}
                  </div>
               </div>
            ))}
         </div>
      );
   }

   if (data.ui_component === 'chart') {
      return (
         <div className="my-6 h-56 w-full glass-panel p-5 border-white/10 bg-cyber-black/80 shadow-2xl relative overflow-hidden">
            <div className="text-[9px] font-mono text-neon-blue uppercase tracking-widest mb-6 italic flex items-center gap-2 font-black">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse shadow-[0_0_8px_#00B2FF]" /> {data.data.title || "Neural Data Projection"}
            </div>
            <ResponsiveContainer width="100%" height="70%">
               <AreaChart data={data.data.results}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                     contentStyle={{ background: '#050816', border: '1px solid #1e293b', borderRadius: '2px', fontSize: '10px', color: '#fff' }} 
                     itemStyle={{ color: '#00B2FF' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} strokeWidth={2} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      );
   }

   if (data.ui_component === 'rider_card') {
      const { rider } = data.data;
      return (
         <div className="my-4 glass-panel p-5 border-l-4 border-l-neon-blue bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                  <Users size={20} className="text-neon-blue" />
               </div>
               <div>
                  <h4 className="text-sm font-black text-white uppercase italic">{rider.name || 'Unknown Rider'}</h4>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{rider.id}</div>
               </div>
               <div className="ml-auto px-2 py-1 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[8px] font-black italic rounded-sm">
                  {rider.status}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
               <div>
                  <div className="text-[8px] font-mono text-slate-600 uppercase">Total Earnings</div>
                  <div className="text-xs font-black text-white mt-0.5">₹{rider.earnings || 0}</div>
               </div>
               <div>
                  <div className="text-[8px] font-mono text-slate-600 uppercase">Rating</div>
                  <div className="text-xs font-black text-white mt-0.5">{rider.rating || 'N/A'} ★</div>
               </div>
            </div>
         </div>
      );
   }

   if (data.ui_component === 'order_card') {
      const { order } = data.data;
      return (
         <div className="my-4 glass-panel p-5 border-l-4 border-l-neon-orange bg-white/[0.01]">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest mb-1">ORDER_{order.id.slice(-6)}</h4>
                  <p className="text-[10px] text-slate-400 italic">{order.customerName}</p>
               </div>
               <span className="text-[8px] font-black text-neon-orange px-1.5 py-0.5 border border-neon-orange/30 rounded-sm italic uppercase">{order.status}</span>
            </div>
            <div className="space-y-2 mb-4">
               <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-600 uppercase">Destination:</span>
                  <span className="text-slate-300 truncate ml-4 italic">{order.deliveryAddress}</span>
               </div>
               <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-600 uppercase">Amount:</span>
                  <span className="text-white font-black">₹{order.totalAmount}</span>
               </div>
            </div>
            <button className="w-full py-2 bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 hover:text-white hover:border-white/20 transition-all uppercase italic tracking-widest">
               Track Logistics Link
            </button>
         </div>
      );
   }

   return <div className="text-[9px] text-neon-red font-black border border-neon-red/20 p-3 bg-neon-red/5 font-mono uppercase italic leading-none">_INVALID_UI_PROTOCOL_BLOCK_</div>;
}

function renderTableCell(val: any) {
   if (typeof val === 'string' && val.includes('STATUS_')) {
      return (
         <span className={cn(
            "px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-tighter border",
            val === 'STATUS_COMPLETED' ? 'text-neon-green border-neon-green/30 bg-neon-green/10' : 
            val === 'STATUS_EMERGENCY' ? 'text-neon-red border-neon-red/30 bg-neon-red/10' : 
            'text-neon-blue border-neon-blue/30 bg-neon-blue/10'
         )}>{val.replace('STATUS_', '')}</span>
      );
   }
   return String(val);
}

function IntelligenceStat({ label, value, trend, color }: any) {
  const colorMap: any = {
     blue: 'text-neon-blue',
     green: 'text-neon-green',
     orange: 'text-neon-orange',
     cyan: 'text-neon-cyan'
  };

  return (
    <div className="flex flex-col gap-1">
       <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black leading-none">{label}</span>
       <div className="flex items-baseline gap-2 mt-1">
          <span className={cn("text-xl font-black italic leading-none font-orbitron", colorMap[color] || 'text-white')}>{value}</span>
          <span className={cn("text-[8px] font-bold", trend.startsWith('+') ? 'text-neon-green' : trend.startsWith('-') ? 'text-neon-red' : 'text-slate-600')}>
            {trend}
          </span>
       </div>
    </div>
  );
}

function QuickAction({ label, icon, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-white/10 bg-white/[0.03] text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/10 transition-all italic tracking-tighter"
      >
         {icon} {label}
      </button>
   );
}

function AIIntelligenceCard({ label, value, trend, icon, color, insight }: { label: string, value: string, trend: string, icon: React.ReactNode, color: string, insight: string }) {
   const colorMap: any = {
      blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,178,255,0.1)]',
      green: 'text-neon-green border-neon-green/20 bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]',
      cyan: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
      orange: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
   };

   return (
      <motion.div 
         whileHover={{ y: -5, scale: 1.02 }}
         className="glass-panel p-6 border-white/5 bg-cyber-black/40 relative overflow-hidden group cursor-pointer"
      >
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
            {icon}
         </div>
         <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2 rounded-sm border", colorMap[color])}>
               {React.cloneElement(icon as React.ReactElement, { size: 18, className: "group-hover:scale-110 transition-transform" })}
            </div>
            <div className={cn("text-[10px] font-mono font-bold px-2 py-1 bg-white/5 rounded-sm", trend.includes('+') ? 'text-neon-green' : 'text-neon-orange')}>
               {trend}
            </div>
         </div>
         <div className="space-y-1">
            <div className="text-3xl font-black text-white italic font-orbitron leading-none group-hover:text-neon-blue transition-colors">{value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic leading-tight">{label}</div>
         </div>
         <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[9px] font-mono text-slate-400 group-hover:text-white transition-colors leading-relaxed">
               <span className="text-neon-blue mr-1 italic font-black">// AI_INSIGHT:</span> {insight}
            </p>
         </div>
      </motion.div>
   );
}

function AIActionItem({ title, description, impact, confidence }: { title: string, description: string, impact: string, confidence: string }) {
   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:bg-white/10 hover:border-white/10 transition-all group flex flex-col gap-2">
         <div className="flex justify-between items-start">
            <h4 className="text-[11px] font-black text-white uppercase italic tracking-wider leading-none">{title}</h4>
            <div className="text-[8px] font-mono text-neon-purple uppercase font-black">{confidence} CONF</div>
         </div>
         <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{description}</p>
         <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
            <div className="text-[10px] font-black text-neon-green italic uppercase">{impact}</div>
            <button className="text-[9px] font-black text-white hover:text-neon-purple flex items-center gap-1 uppercase italic tracking-widest transition-colors">
               EXECUTE <ChevronRight size={10} />
            </button>
         </div>
      </div>
   );
}

function AIPanel({ label, value, trend, color, subtitle }: { label: string, value: string, trend: string, color: string, subtitle: string }) {
   const colorText = color === 'blue' ? 'text-neon-blue' : color === 'green' ? 'text-neon-green' : 'text-neon-purple';
   const colorPulse = color === 'blue' ? 'bg-neon-blue' : color === 'green' ? 'bg-neon-green' : 'bg-neon-purple';

   return (
      <div className="glass-panel p-5 border-white/5 bg-cyber-black/40 hover:border-white/10 transition-all flex flex-col gap-2">
         <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none font-black">{label}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-md", colorPulse)} />
         </div>
         <div className="flex items-baseline gap-2">
            <div className={cn("text-2xl font-black italic uppercase leading-none font-orbitron", colorText)}>{value}</div>
            <span className="text-[9px] font-mono text-slate-600 italic uppercase">{trend}</span>
         </div>
         <div className="text-[9px] font-mono text-slate-500 uppercase italic mt-1 font-black leading-none">{subtitle}</div>
      </div>
   );
}

function AnomalieRow({ title, target, prob, impact, time }: any) {
   return (
      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-sm hover:border-neon-red/30 transition-all group overflow-hidden">
         <div className="flex-1 min-w-0 mr-4">
            <div className="text-[10px] font-black text-white uppercase italic truncate mb-0.5">{title}</div>
            <div className="flex items-center gap-3">
               <span className="text-[8px] font-mono text-neon-red bg-neon-red/10 px-1 border border-neon-red/20">{target}</span>
               <span className="text-[8px] font-mono text-slate-500 uppercase whitespace-nowrap">{time}</span>
            </div>
         </div>
         <div className="text-right shrink-0">
            <div className="text-[10px] font-black text-neon-red italic uppercase leading-none">{prob} PROB</div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">{impact} Impact</div>
         </div>
      </div>
   );
}

function IntelligenceFeedItem({ insight }: any) {
   const isSystem = insight.type === 'SYSTEM';
   const isOptim = insight.type === 'OPTIMIZATION';
   const isRisk = insight.type === 'RISK';
   const isFraud = insight.type === 'FRAUD';

   return (
      <div className={cn(
         "p-4 border-l-2 bg-white/5 border-white/5 group hover:bg-white/10 transition-all",
         isOptim && "border-l-neon-blue",
         isRisk && "border-l-neon-orange",
         isFraud && "border-l-neon-red",
         isSystem && "border-l-neon-green"
      )}>
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
               {isOptim && <Target size={12} className="text-neon-blue" />}
               {isRisk && <AlertTriangle size={12} className="text-neon-orange" />}
               {isFraud && <ShieldAlert size={12} className="text-neon-red" />}
               {isSystem && <BrainCircuit size={12} className="text-neon-green" />}
               <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest italic",
                  isOptim && "text-neon-blue",
                  isRisk && "text-neon-orange",
                  isFraud && "text-neon-red",
                  isSystem && "text-neon-green"
               )}>{isSystem ? 'SYNCHRONIZATION' : insight.category || insight.type}</span>
            </div>
            <span className="text-[8px] font-mono text-slate-500">{(insight.time || 'JUST NOW')}</span>
         </div>
         <h4 className="text-[11px] font-black text-white uppercase italic leading-tight mb-2 pr-4">{insight.title}</h4>
         <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-3">{insight.description}</p>
         {insight.impact && (
            <div className="text-[9px] font-black text-neon-green italic uppercase">{insight.impact}</div>
         )}
      </div>
   );
}

function AIAssistant() {
   const [isOpen, setIsOpen] = useState(false);
   const [queryInput, setQueryInput] = useState('');
   const [history, setHistory] = useState<{ role: string, content: string }[]>([]);
   const [isThinking, setIsThinking] = useState(false);

   const handleAsk = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!queryInput.trim() || isThinking) return;

      const userMessage = queryInput.trim();
      setQueryInput('');
      setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsThinking(true);

      try {
         const res = await fetch('/api/admin/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               prompt: userMessage,
               history: history
            })
         });
         const data = await res.json();
         if (data.answer) {
            setHistory(prev => [...prev, { role: 'model', content: data.answer }]);
         } else {
            setHistory(prev => [...prev, { role: 'model', content: "Neural sync optimizing. Operating in tactical fallback mode." }]);
         }
      } catch (err) {
         setHistory(prev => [...prev, { role: 'model', content: "Intelligence synchronization failed. Local cache is healthy." }]);
      } finally {
         setIsThinking(false);
      }
   };

   return (
      <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-end">
         <AnimatePresence>
            {isOpen && (
               <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                  className="w-96 h-[550px] mb-6 glass-panel border border-neon-blue/30 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,178,255,0.2)] bg-cyber-black/95 relative backdrop-blur-2xl"
               >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neon-blue/5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neon-blue/20 flex items-center justify-center text-neon-blue border border-neon-blue/30">
                           <Cpu size={24} className="animate-pulse" />
                        </div>
                        <div>
                           <div className="text-xs font-black text-white italic uppercase tracking-wider leading-none">RAjFleet Intelligence v5.0</div>
                           <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                              <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest leading-none">Active</span>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                     {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                           <BrainCircuit size={48} className="text-neon-blue/20 mb-6 animate-pulse" />
                           <h4 className="text-xs font-black text-white uppercase italic tracking-[0.2em] mb-3">NEURAL INTERFACE READY</h4>
                           <p className="text-[10px] text-slate-500 font-mono italic">How can I assist your logistics strategy today?</p>
                           <div className="grid grid-cols-1 gap-2 mt-8 w-full">
                              {["Predict tonight's revenue", "Summarize fleet health", "Identify fraud risks"].map(prompt => (
                                 <button 
                                    key={prompt}
                                    onClick={() => { setQueryInput(prompt); }}
                                    className="px-4 py-2 border border-white/5 bg-white/5 text-[9px] font-mono text-slate-400 uppercase tracking-widest hover:border-neon-blue/30 hover:text-neon-blue transition-all text-left"
                                 >
                                    {">"} {prompt}
                                 </button>
                              ))}
                           </div>
                        </div>
                      )}

                     {history.map((msg, i) => (
                        <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                           <div className={cn(
                              "max-w-[90%] p-3 rounded text-[11px] leading-relaxed",
                              msg.role === 'user' ? 'bg-neon-blue/20 border border-neon-blue/30 text-white' : 'bg-white/5 border border-white/5 text-slate-300 italic'
                           )}>
                              <AIResponseRenderer content={msg.content} />
                           </div>
                        </div>
                     ))}
                     {isThinking && (
                        <div className="flex gap-2 p-2 text-neon-blue font-mono text-[10px] animate-pulse">
                           <Cpu size={12} className="animate-spin" /> PROCESING_VECTORS...
                        </div>
                     )}
                  </div>

                  <form onSubmit={handleAsk} className="p-4 border-t border-white/10 bg-cyber-black flex gap-3 items-center">
                     <input 
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        placeholder="ASK THE INTELLIGENCE CORE..." 
                        className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all uppercase tracking-widest"
                     />
                     <button type="submit" disabled={!queryInput.trim() || isThinking} className="w-12 h-12 rounded border border-neon-blue bg-neon-blue/10 flex items-center justify-center text-neon-blue hover:bg-neon-blue hover:text-cyber-black transition-all">
                        <Send size={18} />
                     </button>
                  </form>
               </motion.div>
            )}
         </AnimatePresence>

         <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
               "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
               isOpen ? "bg-cyber-black border border-neon-red rotate-45" : "bg-neon-blue border border-white/20"
            )}
         >
            {isOpen ? <X className="text-neon-red" size={24} /> : <BrainCircuit className="text-cyber-black" size={32} />}
         </button>
      </div>
   );
}


