/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import * as admin from "firebase-admin";

@Injectable()
export class BookmarkService{
    constructor(private readonly firebaseService: FirebaseService) { }
    
    private bookmarkCollection(userId: string) {
        return this.firebaseService.getFirestore()
            .collection('users')
            .doc(userId)
            .collection('bookmarks');
    }

    // 🔖 Add Bookmark
    async addBookmark(userId: string, newsId: string) {
        const ref = this.bookmarkCollection(userId).doc(newsId);
        await ref.set({
            newsId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            deleted: false
        });

        // 🧠 Update Analytics
        await this.updateAnalytics(userId);
        return { message: '🔖 Bookmark added successfully' };
    }                                                 

     // 🗑️ soft remove Bookmark
    async removeBookmark(userId: string, newsId: string) {
        const ref = this.bookmarkCollection(userId).doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) throw new NotFoundException('Bookmark not found');
        await ref.update({
            deleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        return { message: " 🗑️ Bookmark moved to trash (soft deleted)" };
    }

    // ♻️ Restore a deleted bookmark
    async restoreBookmark(userId: string, newsId: string) {
        const ref = this.bookmarkCollection(userId).doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) throw new NotFoundException('Bookmark not found');
        await ref.update({
            deleted: false,
            restoredAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        return { message: '♻️ Bookmark restored successfully' };
    }

    //🔖 List all active bookmarks
    async getBookmark(userId: string) {
        const snapshot = await this.bookmarkCollection(userId).where("deleted", "==", false).get();
        if (snapshot.empty) return { bookmark: [] };
        const bookmarks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { bookmarks };
    }

    // 🧮 update analytics ( track total bookmarks )
    private async updateAnalytics(userId: string) {
        const analyticsRef = this.firebaseService.getFirestore().collection('analytics').doc(userId);
        await analyticsRef.set(
            {
                totalBookmarks: admin.firestore.FieldValue.increment(1),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        )
    }

    // 📊 Get Analytics
    async getUserAnalytics(userId: string) {
        const doc = await this.firebaseService.getFirestore().collection('analytics').doc(userId).get();
        return doc.exists ? doc.data() : { message: 'No Analytics available yet!' };
    }
}                                               