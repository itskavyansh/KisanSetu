import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ScanHistoryItem {
  id?: string;
  userId: string;
  timestamp: any; // Firestore timestamp
  crop: string;
  disease: string;
  confidence: number;
  imageData?: string; // Base64 image data (optional)
  result: any;
  createdAt: any; // Firestore timestamp
}

export class ScanHistoryService {
  private static COLLECTION_NAME = 'scanHistory';

  // Convert image file to base64 for Firestore storage
  private static async imageToBase64(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  // Add new scan to user's history with base64 image
  static async addScan(userId: string, scanData: Omit<ScanHistoryItem, 'id' | 'userId' | 'timestamp' | 'createdAt'>, imageFile: File): Promise<string> {
    try {
      // Convert image to base64 for Firestore storage
      const imageData = await this.imageToBase64(imageFile);
      
      const scanDoc = {
        userId,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...scanData,
        imageData // Store base64 image data in Firestore
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), scanDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error adding scan to history:', error);
      throw new Error('Failed to save scan to history');
    }
  }

  // Get user's scan history with fallback for indexing issues
  static async getUserScanHistory(userId: string, limitCount: number = 20): Promise<ScanHistoryItem[]> {
    try {
      // Use a simple query that doesn't require complex indexing
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        limit(limitCount * 2) // Get more items to account for sorting
      );

      const querySnapshot = await getDocs(q);
      const scans: ScanHistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        scans.push({
          id: doc.id,
          ...doc.data()
        } as ScanHistoryItem);
      });

      // Sort in memory (this is more reliable and doesn't require indexes)
      scans.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
        const timeB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });

      return scans.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      throw new Error('Failed to fetch scan history');
    }
  }

  // Delete specific scan from user's history
  static async deleteScan(scanId: string): Promise<void> {
    try {
      // Delete the document from Firestore (image data is included in the document)
      await deleteDoc(doc(db, this.COLLECTION_NAME, scanId));
    } catch (error) {
      console.error('Error deleting scan:', error);
      throw new Error('Failed to delete scan');
    }
  }

  // Clear all scans for a user
  static async clearUserHistory(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      // Delete all documents (image data is included in the documents)
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error clearing scan history:', error);
      throw new Error('Failed to clear scan history');
    }
  }

  // Get scan count for a user
  static async getUserScanCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting scan count:', error);
      return 0;
    }
  }
}
