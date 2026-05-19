
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc,
  where,
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';

export function useChat(targetRiderId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const adminId = auth.currentUser?.uid || 'admin_system';

  useEffect(() => {
    if (!targetRiderId) return;

    // Based on the blueprint, it's a flat 'chats' collection
    // We need to query messages where (sender == admin AND receiver == rider) OR (sender == rider AND receiver == admin)
    // This requires a composite query or client-side filtering.
    // Client-side filtering is easier and sufficient for this scale.
    
    // Querying all messages and then filtering client-side for simplicity as Firestore composite queries are restricted.
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const filteredMessages = allMessages.filter(m => 
        (m.senderId === adminId && m.receiverId === targetRiderId) || 
        (m.senderId === targetRiderId && m.receiverId === adminId)
      );
      setMessages(filteredMessages);
    });

    return unsubscribe;
  }, [targetRiderId, adminId]);

  const sendMessage = async (text: string) => {
    try {
      await addDoc(collection(db, 'chats'), {
        senderId: adminId,
        receiverId: targetRiderId,
        text,
        type: 'sent',
        read: false,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      console.error("Error sending message: ", e);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'chats', messageId), { read: true });
    } catch (e) {
      console.error("Error marking as read: ", e);
    }
  };

  return { messages, sendMessage, markAsRead };
}
