import React, { useState } from 'react';
import { X, Search, MapPin, Calendar, Clock, DollarSign, User, Phone, Mail, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRiders, useStores } from '../../hooks/useAdminData';

export function CreateOrderModal({ isOpen, onClose, createOrder }: { isOpen: boolean, onClose: () => void, createOrder: (data: any) => Promise<any> }) {
  const { riders } = useRiders();
  const { stores } = useStores();

  const [formData, setFormData] = useState({
    orderId: `RF-${Math.floor(Math.random() * 90000) + 10000}`,
    type: 'REGULAR',
    customerName: '',
    customerMobile: '',
    customerAlternate: '',
    customerEmail: '',
    address: '',
    pincode: '',
    city: 'Delhi',
    landmark: '',
    deliveryDate: '',
    deliveryTime: '',
    riderId: '',
    paymentType: 'COD',
    totalAmount: '',
    notes: '',
    storeId: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await createOrder(formData);
    setLoading(false);
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-cyber-black border border-neon-blue/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,178,255,0.15)] text-white">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-widest text-neon-blue italic">Create Professional Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1 & 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Order ID</label>
              <input className="w-full bg-white/5 border border-white/10 p-3 text-sm rounded-sm" value={formData.orderId} onChange={(e) => setFormData({...formData, orderId: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Order Type</label>
              <select className="w-full bg-white/5 border border-white/10 p-3 text-sm rounded-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="REGULAR">Regular</option>
                <option value="PRIME">Prime</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          {/* Section 3: Customer Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-white tracking-widest border-l-2 border-neon-blue pl-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Customer Name" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
              <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Mobile Number" value={formData.customerMobile} onChange={(e) => setFormData({...formData, customerMobile: e.target.value})} />
              <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Alternate Number" value={formData.customerAlternate} onChange={(e) => setFormData({...formData, customerAlternate: e.target.value})} />
              <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Email (Optional)" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} />
            </div>
          </div>

          {/* Section 5: Address */}
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase text-white tracking-widest border-l-2 border-neon-blue pl-3">Delivery Address</h3>
             <textarea className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Full Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
             <div className="grid grid-cols-3 gap-4">
               <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Landmark" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
               <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
               <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
             </div>
          </div>

          {/* Section 6 & 7: Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Assign Rider</label>
              <select className="w-full bg-white/5 border border-white/10 p-3 text-sm rounded-sm text-white" value={formData.riderId} onChange={(e) => setFormData({...formData, riderId: e.target.value})}>
                <option value="">Select an active rider...</option>
                {riders.filter(r => r.status === 'ONLINE').map(rider => (
                    <option key={rider.id} value={rider.id}>{rider.name} (Online)</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Pickup Store</label>
              <select className="w-full bg-white/5 border border-white/10 p-3 text-sm rounded-sm text-white" value={formData.storeId} onChange={(e) => setFormData({...formData, storeId: e.target.value})}>
                <option value="">Pick a store...</option>
                {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="w-full bg-white/5 border border-white/10 p-3 text-sm" placeholder="Amount" type="number" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} />
            <select className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white" value={formData.paymentType} onChange={(e) => setFormData({...formData, paymentType: e.target.value})}>
                <option value="COD">Cash on Delivery</option>
                <option value="PREPAID">Prepaid</option>
                <option value="WALLET">Wallet</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-white/10 text-xs text-white font-bold uppercase transition-all hover:bg-white/5">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-neon-blue text-cyber-black text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:scale-105 transition-all">
            {loading ? 'Creating...' : 'Create Professional Order'}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
