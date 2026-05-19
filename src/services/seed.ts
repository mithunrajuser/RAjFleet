import { 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  try {
    // Check if already seeded by looking at riders
    const ridersSnap = await getDocs(collection(db, 'riders'));
    if (!ridersSnap.empty) return;

    console.log("Seeding RAjFleet Database with Enterprise-grade records...");

    // 1. Seed Riders
    const riderData = [
      { name: "Aman Kumar", fullName: "Aman Kumar Singh", status: "ONLINE", verificationStatus: "VERIFIED", rating: 4.8, walletBalance: 1250, totalEarnings: 45000, vehicle: { type: "Bike", number: "BR01XZ4921", model: "Hero Splendor+" }, documents: { kyc: "VALID", license: "VALID", insurance: "VALID" } },
      { name: "Rohit Singh", fullName: "Rohit Kumar Singh", status: "BUSY", verificationStatus: "VERIFIED", rating: 4.7, walletBalance: 800, totalEarnings: 38000, vehicle: { type: "Bike", number: "BR01AB1234", model: "TVS Raider" }, documents: { kyc: "VALID", license: "VALID", insurance: "VALID" } },
      { name: "Vikash Kumar", fullName: "Vikash Prasad", status: "IDLE", verificationStatus: "PENDING", rating: 4.6, walletBalance: 3200, totalEarnings: 52000, vehicle: { type: "Bike", number: "BR01CD5678", model: "Honda Shine" }, documents: { kyc: "PENDING", license: "VALID", insurance: "VALID" } },
      { name: "Arjun Dev", fullName: "Arjun Dev", status: "OFFLINE", verificationStatus: "VERIFIED", rating: 4.9, walletBalance: 0, totalEarnings: 90000, vehicle: { type: "Bike", number: "BR01EF1111", model: "Royal Enfield Classic 350" }, documents: { kyc: "VALID", license: "VALID", insurance: "VALID" } }
    ];

    const riderIds: string[] = [];
    for (const r of riderData) {
      const docRef = await addDoc(collection(db, 'riders'), {
        ...r,
        email: `${r.name.toLowerCase().replace(' ', '.')}@rajfleet.com`,
        phone: "+91 98765 43210",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`,
        location: { lat: 25.5941 + (Math.random() - 0.5) * 0.1, lng: 85.1376 + (Math.random() - 0.5) * 0.1, heading: Math.random() * 360, lastUpdated: Timestamp.now() },
        createdAt: Timestamp.now()
      });
      riderIds.push(docRef.id);
    }

    // 2. Seed Stores
    const storeData = [
      { name: "Pizza Hut", status: "OPEN", category: "Food", rating: 4.5, verified: true, address: "Sector 14, Rajendra Nagar", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
      { name: "Apollo Pharmacy", status: "OPEN", category: "Medicine", rating: 4.9, verified: true, address: "Frazer Road, Patna", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400" },
      { name: "Reliance Fresh", status: "BUSY", category: "Grocery", rating: 4.3, verified: true, address: "Kankarbagh, Patna", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" }
    ];

    const storeIds: string[] = [];
    for (const s of storeData) {
      const docRef = await addDoc(collection(db, 'stores'), {
        ...s,
        ownerName: "Merchant Owner",
        ownerEmail: "owner@merchant.com",
        phone: "+91 12345 67890",
        totalOrders: Math.floor(Math.random() * 1000),
        location: { lat: 25.5941 + (Math.random() - 0.5) * 0.05, lng: 85.1376 + (Math.random() - 0.5) * 0.05 },
        createdAt: Timestamp.now()
      });
      storeIds.push(docRef.id);
    }

    // 3. Seed Customers
    const customerData = [
      { name: "Mithun Kumar", email: "mithun@user.com", phone: "+91 70044 XXXXX" },
      { name: "Anjali Singh", email: "anjali@user.com", phone: "+91 80022 XXXXX" }
    ];
    const customerIds: string[] = [];
    for (const c of customerData) {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...c,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`,
        walletBalance: 500,
        createdAt: Timestamp.now()
      });
      customerIds.push(docRef.id);
    }

    // 4. Seed Orders
    const orderTypes = ['REGULAR', 'PRIME', 'EMERGENCY'];
    const orderStatuses = ['DELIVERED', 'IN_TRANSIT', 'PICKED', 'ACCEPTED', 'PENDING'];
    
    for (let i = 0; i < 20; i++) {
        const type = orderTypes[Math.floor(Math.random() * orderTypes.length)];
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const amount = Math.floor(Math.random() * 2000) + 100;
        const riderIdx = Math.floor(Math.random() * riderIds.length);
        const storeIdx = Math.floor(Math.random() * storeIds.length);
        const customerIdx = Math.floor(Math.random() * customerIds.length);

        await addDoc(collection(db, 'orders'), {
            customerId: customerIds[customerIdx],
            customerName: customerData[customerIdx].name,
            storeId: storeIds[storeIdx],
            storeName: storeData[storeIdx].name,
            riderId: status === 'PENDING' ? '' : riderIds[riderIdx],
            riderName: status === 'PENDING' ? '' : riderData[riderIdx].name,
            status,
            type,
            amount,
            deliveryFee: 40,
            createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.now(),
            eta: "15 MIN"
        });
    }

    // 5. Seed Withdraw Requests
    await addDoc(collection(db, 'withdrawals'), {
        riderId: riderIds[0],
        riderName: riderData[0].name,
        amount: 2500,
        status: 'PENDING',
        createdAt: Timestamp.now()
    });

    // 6. Seed SOS Alert
    await addDoc(collection(db, 'sos_alerts'), {
        riderId: riderIds[1],
        riderName: riderData[1].name,
        status: 'ACTIVE',
        timestamp: Timestamp.now(),
        location: { lat: 25.5941, lng: 85.1376 }
    });

    console.log("Enterprise database seeding complete.");
  } catch (e: any) {
    console.error("Seed error", e);
  }
}

