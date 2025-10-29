/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class CommentService {
    constructor(private readonly firebaseService: FirebaseService) { }
    
    private newsCollection() {
        return this.firebaseService.getFirestore().collection('news');
    }

    // Add comment to a news
    async addComment(newsId: string, userId: string, text: string) {
        const comment = { userId, text, createdAt: new Date() };
        const commentRef = await this.newsCollection()
            .doc(newsId)
            .collection('comments')
            .add(comment);
        return { id: commentRef.id, ...comment };
    }

    // Get comments of a news
    async getComment(newsId: string) {
        const snapshot = await this.newsCollection()
            .doc(newsId)
            .collection('comments')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}                                               