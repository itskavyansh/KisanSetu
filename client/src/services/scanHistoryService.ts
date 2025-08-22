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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface ScanHistoryItem {
  id?: string;
  userId: string;
  timestamp: any; // Firestore timestamp
  crop: string;
  disease: string;
  confidence: number;
  imageUrl: string;
  result: any;
  createdAt: any; // Firestore timestamp
}

export class ScanHistoryService {
  private static COLLECTION_NAME = 'scanHistory';

  // Upload image to Firebase Storage and get download URL
  private static async uploadImageToStorage(userId: string, imageFile: File): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `crop-scans/${userId}/${timestamp}-${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image to storage:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Add new scan to user's history with image upload
  static async addScan(userId: string, scanData: Omit<ScanHistoryItem, 'id' | 'userId' | 'timestamp' | 'createdAt'>, imageFile: File): Promise<string> {
    try {
      // First upload the image to Firebase Storage
      const imageUrl = await this.uploadImageToStorage(userId, imageFile);
      
      const scanDoc = {
        userId,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...scanData,
        imageUrl // Use the Firebase Storage URL instead of blob URL
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

  // Delete specific scan from user's history and remove image from storage
  static async deleteScan(scanId: string, imageUrl?: string): Promise<void> {
    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, this.COLLECTION_NAME, scanId));
      
      // If imageUrl is provided and it's a Firebase Storage URL, delete the image too
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.warn('Failed to delete image from storage:', storageError);
          // Don't fail the whole operation if image deletion fails
        }
      }
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

      // Delete images from storage first
      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data.imageUrl && data.imageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const imageRef = ref(storage, data.imageUrl);
            await deleteObject(imageRef);
          } catch (storageError) {
            console.warn('Failed to delete image from storage:', storageError);
          }
        }
      });

      // Wait for all image deletions to complete
      await Promise.all(deletePromises);

      // Then delete all documents
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
