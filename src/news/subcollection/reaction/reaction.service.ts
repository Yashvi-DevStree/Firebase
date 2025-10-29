/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
          
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class ReactionService {
    private firestore: FirebaseFirestore.Firestore;
    private newsCollection: FirebaseFirestore.CollectionReference;

    constructor(private readonly firebaseService: FirebaseService) {
        this.firestore = this.firebaseService.getFirestore();
        this.newsCollection = this.firestore.collection('news');
    }

    private reactionCollection(newsId: string) {
        return this.newsCollection.doc(newsId).collection('reactions');
    }

    // ❤️ Like or unlike a news article                                                                                                                                                    
    async toggleLike(newsId: string, userId: string) {
        const newsRef = this.newsCollection.doc(newsId);
        const newsDoc = await newsRef.get();
        if (!newsDoc.exists) return new NotFoundException('News article not found');

        const reactionRef = this.reactionCollection(newsId).doc(userId);
        const reactionDoc = await reactionRef.get();
        
        if (reactionDoc.exists && reactionDoc.data()?.type === 'like') {
            // If already liked -> remove
            await reactionRef.delete()
            await newsRef.update({
                likesCount: admin.firestore.FieldValue.increment(-1),
            })
            return { message: " ❌ Like removed successfully " };
        } else {
            await reactionRef.set({
                userId,
                type: 'like',
                createdAt: new Date()
            })
            await newsRef.update({
                likesCount: admin.firestore.FieldValue.increment(1)
            })

            return { message: " ❤️ Liked successfully " };                                                   
        }
    } 

    // ❤️ Add a custom emoji reaction                                                                                                            
    async addReaction(newsId: string, userId: string, emoji: string) {
        const newsRef = this.newsCollection.doc(newsId);
        const newsDoc = await newsRef.get();
        if (!newsDoc.exists) throw new NotFoundException('News not found');

        const reactionRef = this.reactionCollection(newsId).doc(userId);
        await reactionRef.set({     
            userId,
            emoji,
            createdAt: new Date()
        })
        return { message: `Reaction ${emoji} added successfully` };
    }

    // 🧾 Get all reactions for a news article                                                  
    async getReactions(newsId: string) {
        const snapshot = await this.reactionCollection(newsId).get();
        const reactions = snapshot.docs.map((doc) => doc.data());
        return { newsId, total: reactions.length, reactions };
    }

    // 📊 Get total reaction stats (likes + emoji breakdown)
    async getReactionStats(newsId: string) {
        const snapshot = await this.reactionCollection(newsId).get();
        if (snapshot.empty) return { newsId, total: 0, breakdown: {} };

        const breakdown: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const key = data.type || data.emoji || 'unknown';
            breakdown[key] = (breakdown[key] || 0) + 1;
        })
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        return { newsId, total, breakdown };
    }
}
