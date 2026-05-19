import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  addDoc,
  deleteDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

// Firebase Error Handler as required
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'orders');
          setLoading(false);
        });
      } else {
        setOrders([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status, 
        updatedAt: Timestamp.now() 
      });
      toast.success(`Order status updated to ${status}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const assignRider = async (orderId: string, rider: any) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', orderId), {
        riderId: rider.id,
        riderName: rider.name,
        status: 'ACCEPTED',
        updatedAt: Timestamp.now()
      });
      batch.update(doc(db, 'riders', rider.id), {
        activeOrderId: orderId,
        status: 'BUSY'
      });
      await batch.commit();
      toast.success(`Rider ${rider.name} assigned to order ${orderId}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'batch-assign-rider');
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: Timestamp.now(),
        status: 'PENDING',
        totalAmount: parseFloat(orderData.totalAmount) || 0,
      });
      toast.success(`Order ${docRef.id} created successfully`);
      return docRef;
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, 'orders');
    }
  }

  return { orders, loading, updateOrderStatus, assignRider, createOrder };
}

export function useRiders() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'riders'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setRiders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'riders');
          setLoading(false);
        });
      } else {
        setRiders([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const createRider = async (riderData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'riders'), {
        ...riderData,
        createdAt: Timestamp.now(),
        status: 'OFFLINE',
        verificationStatus: 'PENDING'
      });
      toast.success("Rider onboarded successfully");
      return docRef;
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, 'riders');
    }
  }

  const verifyRider = async (riderId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    try {
      const updateData: any = { verificationStatus: status };
      if (reason) {
          updateData.rejectionReason = reason;
      }
      await updateDoc(doc(db, 'riders', riderId), updateData);
      toast.success(`Rider verification: ${status}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `riders/${riderId}`);
    }
  }

  const updateRiderWallet = async (riderId: string, amount: number) => {
      try {
          // In real world, use transaction for atomic increment
          const riderRef = doc(db, 'riders', riderId);
          await updateDoc(riderRef, { walletBalance: amount });
      } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `riders/${riderId}`);
      }
  }

  const updateRiderProfile = async (riderId: string, profileData: any) => {
    try {
      await updateDoc(doc(db, 'riders', riderId), profileData);
      toast.success("Profile updated");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `riders/${riderId}`);
    }
  }

  const deactivateRider = async (riderId: string) => {
    try {
      await updateDoc(doc(db, 'riders', riderId), { status: 'DEACTIVATED' });
      toast.success("Rider blocked successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `riders/${riderId}`);
    }
  }

  const activateRider = async (riderId: string) => {
    try {
      await updateDoc(doc(db, 'riders', riderId), { status: 'OFFLINE' });
      toast.success("Rider activated successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `riders/${riderId}`);
    }
  }

  return { riders, loading, verifyRider, updateRiderWallet, createRider, updateRiderProfile, deactivateRider, activateRider };
}

export function useStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'stores'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setStores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'stores');
          setLoading(false);
        });
      } else {
        setStores([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const updateStoreStatus = async (storeId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'stores', storeId), { status });
      toast.success(`Store status updated to ${status}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `stores/${storeId}`);
    }
  }

  return { stores, loading, updateStoreStatus };
}

export function useSOS() {
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'sos_alerts'), where('status', '==', 'ACTIVE'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setSosAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'sos_alerts');
        });
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const resolveSOS = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'sos_alerts', alertId), { 
        status: 'RESOLVED',
        resolvedBy: auth.currentUser?.uid,
        resolvedAt: Timestamp.now()
      });
      toast.success("SOS Alert marked as RESOLVED");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `sos_alerts/${alertId}`);
    }
  }

  const triggerGlobalSOS = async (message: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action: 'GLOBAL_SOS',
        details: message,
        timestamp: Timestamp.now(),
        adminId: auth.currentUser?.uid || 'system'
      });
      toast.error("GLOBAL SOS ACTIVATED: ALERTING ALL RIDERS", {
        duration: 5000,
        style: { background: '#ef4444', color: 'white' }
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'audit_logs');
    }
  };

  return { sosAlerts, resolveSOS, triggerGlobalSOS };
}

export function useWithdrawals() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'withdrawals');
        });
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const processWithdrawal = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateDoc(doc(db, 'withdrawals', requestId), { status, updatedAt: Timestamp.now() });
      toast.success(`Withdrawal request ${status}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${requestId}`);
    }
  }

  return { requests, processWithdrawal };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'notifications');
          setLoading(false);
        });
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const createNotification = async (notificationData: any) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: Timestamp.now(),
        status: 'SENT',
      });
      toast.success("Notification sent successfully");
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  }

  const sendEmergencyBroadcast = async (broadcastData: any) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...broadcastData,
        createdAt: Timestamp.now(),
        status: 'ACTIVE',
        type: 'EMERGENCY',
        priority: 'HIGH',
      });
      toast.success("Emergency broadcast sent!");
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  }

  return { notifications, loading, createNotification, sendEmergencyBroadcast };
}

export function useNotificationMetrics(notifications: any[]) {
  return useMemo(() => {
    const totalSent = notifications.length;
    const deliveredCount = notifications.filter(n => n.status === 'DELIVERED').length;
    const failedCount = notifications.filter(n => n.status === 'FAILED').length;
    const scheduledCount = notifications.filter(n => n.status === 'SCHEDULED').length;
    const activeCampaigns = notifications.filter(n => n.status === 'ACTIVE').length;
    
    // Average metrics, assuming these fields for demonstration if present in data
    const avgOpenRate = notifications.reduce((acc, n) => acc + (n.openRate || 0), 0) / (totalSent || 1);
    const avgClickRate = notifications.reduce((acc, n) => acc + (n.clickRate || 0), 0) / (totalSent || 1);
    
    // Channels
    const channels = ['Push', 'SMS', 'WhatsApp', 'Email'];
    const channelData = channels.map(c => ({
        name: c,
        value: notifications.filter(n => n.channel === c).length
    }));

    // Categories
    const categories = ['Order Updates', 'Promotions', 'Alerts', 'Incentives', 'System'];
    const categoryData = categories.map(c => ({
        name: c,
        value: notifications.filter(n => n.category === c).length,
        percentage: (notifications.filter(n => n.category === c).length / (totalSent || 1)) * 100
    }));

    return {
        totalSent,
        deliveredCount,
        failedCount,
        scheduledCount,
        activeCampaigns,
        avgOpenRate: `${avgOpenRate.toFixed(1)}%`,
        avgClickRate: `${avgClickRate.toFixed(1)}%`,
        channelData,
        categoryData
    };
  }, [notifications]);
}

export function useAnalytics() {
  const { orders } = useOrders();
  const { riders } = useRiders();

  return useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + (o.amount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const activeRiders = riders.filter(r => r.status === 'ONLINE' || r.status === 'BUSY').length;
    
    // Aggregate by day for charts (mock logic based on real timestamps)
    const dailyRevenue: Record<string, number> = {};
    orders.forEach(o => {
        if (o.createdAt) {
            const date = o.createdAt.toDate ? o.createdAt.toDate().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : 'UNK';
            dailyRevenue[date] = (dailyRevenue[date] || 0) + (o.amount || 0);
        }
    });

    const revenueChartData = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => ({
        name: day,
        value: dailyRevenue[day] || 0
    }));

    return {
      totalRevenue,
      completedOrders,
      activeRiders,
      revenueChartData,
      totalOrders: orders.length,
      primeOrders: orders.filter(o => o.type === 'PRIME').length,
      emergencyOrders: orders.filter(o => o.status === 'EMERGENCY' || o.type === 'EMERGENCY').length,
      distribution: [
        { name: 'Completed', value: completedOrders, color: '#38bdf8' },
        { name: 'On Delivery', value: orders.filter(o => ['IN_TRANSIT', 'PICKED'].includes(o.status)).length, color: '#22d3ee' },
        { name: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: '#f97316' },
        { name: 'Emergencies', value: orders.filter(o => o.status === 'EMERGENCY' || o.type === 'EMERGENCY').length, color: '#ef4444' },
      ],
      hourlyChartData: [
        { time: '12 AM', total: Math.floor(orders.length * 0.1) },
        { time: '4 AM', total: Math.floor(orders.length * 0.05) },
        { time: '8 AM', total: Math.floor(orders.length * 0.15) },
        { time: '12 PM', total: Math.floor(orders.length * 0.25) },
        { time: '4 PM', total: Math.floor(orders.length * 0.3) },
        { time: '8 PM', total: Math.floor(orders.length * 0.4) },
      ]
    };
  }, [orders, riders]);
}

