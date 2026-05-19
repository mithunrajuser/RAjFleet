import { UserRole } from '../../types';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck, Fingerprint, Lock, Cpu } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleSignIn = async (role: UserRole) => {
    setLoading(true);
    try {
      await signInWithGoogle(role);
    } catch (e) {
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-deep text-slate-200 p-6 font-sans relative overflow-hidden">
      {/* HUD Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-neon-orange/5 blur-[100px] rounded-full" />
        <div className="scan-line absolute inset-0 opacity-20" />
        
        {/* Animated HUD Grid */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `linear-gradient(rgba(56,189,248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-12 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex flex-col items-center gap-4"
          >
             <img 
               src="http://rajhomeindia.com/wp-content/uploads/2026/05/RAjfleet-app.png" 
               alt="RAjFleet Logo" 
               className="h-20 w-auto object-contain"
               referrerPolicy="no-referrer"
             />
             <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-8 bg-neon-blue/30" />
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-mono leading-none">Command Pulse v3.0</p>
                <div className="h-[1px] w-8 bg-neon-blue/30" />
             </div>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-neon-blue/20 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <button 
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] bg-neon-blue text-cyber-black transition-all active:scale-[0.97] rounded-sm relative z-10 shadow-[0_0_20px_rgba(56,189,248,0.4)] italic flex items-center justify-center gap-3 overflow-hidden"
              onClick={() => handleSignIn(UserRole.RIDER)}
              disabled={loading}
            >
              <Zap size={14} />
              {loading ? "Initializing..." : "Establish Rider Link"}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30" />
            </button>
          </div>

          <button 
            className="w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] glass-panel border-white/10 text-slate-400 hover:text-white hover:border-neon-orange/40 transition-all active:scale-[0.97] rounded-sm relative group italic flex items-center justify-center gap-3"
            onClick={() => handleSignIn(UserRole.ADMIN)}
            disabled={loading}
          >
            <div className="absolute inset-0 bg-neon-orange/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
            <ShieldCheck size={14} className="group-hover:neon-text-orange" />
            Admin Command Core
          </button>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-center gap-8 opacity-20">
              <Lock size={16} />
              <Fingerprint size={16} />
              <Cpu size={16} />
           </div>
           
           <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.2em]">RAjHOME Hyperlocal Protocol</span>
              <div className="hud-line w-24" />
           </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cyber-black/80 backdrop-blur-xl z-[100] flex items-center justify-center"
          >
            <div className="text-center space-y-6">
               <div className="relative">
                 <div className="w-24 h-24 border-2 border-neon-blue/20 rounded-full animate-[spin_2s_linear_infinite]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-neon-blue rounded-full animate-ping" />
                 </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-mono text-neon-blue uppercase animate-pulse tracking-[0.5em]">Synchronizing Neural Network</p>
                  <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Bypassing standard security gates...</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

