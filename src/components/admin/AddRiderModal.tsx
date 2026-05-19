import React, { useState } from 'react';
import { X, Upload, User, Shield, Briefcase, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function AddRiderModal({ isOpen, onClose, createRider }: { isOpen: boolean, onClose: () => void, createRider: (data: any) => Promise<any> }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', alternatePhone: '', password: '', 
    gender: 'MALE', dateOfBirth: '', bloodGroup: '', emergencyContact: '', referralCode: '', riderId: '',
    vehicleType: 'BIKE', vehicleNumber: '', dlNumber: '', numberPlate: '',
    brand: '', model: '', color: '', vehicleYear: '', registrationState: '', chassisNumber: '',
    dlExpiry: '', rcNumber: '', rcExpiry: '', insuranceNumber: '', insuranceExpiry: '', pollutionExpiry: '',
    zone: 'NORTH_ZONE', shift: 'DAY', bankName: '', ifsc: '', accountNumber: '',
    dateOfJoining: '' 
  });

  const handleSubmit = async () => {
      setLoading(true);
      await createRider(formData);
      setLoading(false);
      onClose();
  };

  const tabs = [
    { id: 'info', label: 'Rider Info', icon: <User size={14}/> },
    { id: 'vehicle', label: 'Vehicle Info', icon: <Briefcase size={14}/> },
    { id: 'bank', label: 'Bank & Payout', icon: <DollarSign size={14}/> }
  ];

  return isOpen ? (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4">
      <div className="bg-cyber-black border border-neon-blue/30 w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,178,255,0.1)]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Onboard <span className="text-neon-blue">New Rider</span></h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 rounded-sm"><X size={20}/></button>
        </div>
        
        <div className="flex border-b border-white/5">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-6 py-4 text-xs font-black uppercase flex items-center gap-2", activeTab === tab.id ? "text-neon-blue border-b-2 border-neon-blue" : "text-slate-500")}>
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
             {activeTab === 'info' && (
                <div className="grid grid-cols-3 gap-6">
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400" placeholder="Date of Birth" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    <input type="password" className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Setup Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <select className="bg-white/5 border border-white/10 p-3 text-sm text-white uppercase" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                    <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400" placeholder="Date of Joining" value={formData.dateOfJoining} onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Referral Code" value={formData.referralCode} onChange={(e) => setFormData({...formData, referralCode: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-neon-cyan" placeholder="Rider ID (Manual)" value={formData.riderId} onChange={(e) => setFormData({...formData, riderId: e.target.value})} />
                </div>
            )}
            
            {activeTab === 'vehicle' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6 border-b border-white/10 pb-6">
                        <select className="bg-white/5 border border-white/10 p-3 text-sm text-white uppercase" value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}>
                          <option value="BIKE">Bike</option>
                          <option value="SCOOTER">Scooter</option>
                          <option value="EV">EV</option>
                          <option value="CAR">Car</option>
                        </select>
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Brand" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Model" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                        <input type="number" className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Year" value={formData.vehicleYear} onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})} />
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Registration State" value={formData.registrationState} onChange={(e) => setFormData({...formData, registrationState: e.target.value})} />
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Number Plate" value={formData.numberPlate} onChange={(e) => setFormData({...formData, numberPlate: e.target.value})} />
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Chassis Number" value={formData.chassisNumber} onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Driving License Number" value={formData.dlNumber} onChange={(e) => setFormData({...formData, dlNumber: e.target.value})} />
                        <div>
                           <label className="text-[10px] text-slate-400 block mb-1">DL Expiry</label>
                           <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400 w-full" placeholder="DL Expiry" value={formData.dlExpiry} onChange={(e) => setFormData({...formData, dlExpiry: e.target.value})} />
                        </div>
                        
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="RC Number" value={formData.rcNumber} onChange={(e) => setFormData({...formData, rcNumber: e.target.value})} />
                        <div>
                           <label className="text-[10px] text-slate-400 block mb-1">RC Validity</label>
                           <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400 w-full" placeholder="RC Validity" value={formData.rcExpiry} onChange={(e) => setFormData({...formData, rcExpiry: e.target.value})} />
                        </div>
                        
                        <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Insurance Number" value={formData.insuranceNumber} onChange={(e) => setFormData({...formData, insuranceNumber: e.target.value})} />
                        <div>
                           <label className="text-[10px] text-slate-400 block mb-1">Insurance Expiry</label>
                           <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400 w-full" placeholder="Insurance Expiry" value={formData.insuranceExpiry} onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})} />
                        </div>
                        
                        <div>
                           <label className="text-[10px] text-slate-400 block mb-1">Pollution Validity</label>
                           <input type="date" className="bg-white/5 border border-white/10 p-3 text-sm text-slate-400 w-full" placeholder="Pollution Validity" value={formData.pollutionExpiry} onChange={(e) => setFormData({...formData, pollutionExpiry: e.target.value})} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bank' && (
                 <div className="grid grid-cols-3 gap-6">
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Bank Name" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="Account Number" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 p-3 text-sm text-white" placeholder="IFSC Code" value={formData.ifsc} onChange={(e) => setFormData({...formData, ifsc: e.target.value})} />
                </div>
            )}
        </div>
        
        <div className="p-6 border-t border-white/10 flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-3 border border-white/10 text-white text-xs font-bold uppercase hover:bg-white/5">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-neon-blue text-cyber-black text-xs font-black uppercase shadow-[0_0_15px_rgba(56,189,248,0.3)]">{loading ? 'Processing...' : 'Onboard Rider'}</button>
        </div>
      </div>
    </div>
  ) : null;
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

