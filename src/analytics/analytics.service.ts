/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ForbiddenException, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly firebaseService: FirebaseService) { }
    
    // 📊 Admin Dashboard summary                         
    async getDashboardData(user: any) {
        if (user.role !== 'admin') {
            throw new ForbiddenException('Access Denied. Admin only.');
        }

        const db = this.firebaseService.getFirestore();


        // 📰 Total news
        const newsSnapshot = await db.collection('news').get();
        const totalNews = newsSnapshot.size;

        // 💬 Total comments
        const commentsSnapshot = await db.collectionGroup('comments').get();
        const totalComments = commentsSnapshot.size;

        // 👍 Total reactions
        const reactionsSnapshot = await db.collectionGroup('reactions').get();
        const totalReactions = reactionsSnapshot.size;

        // 🧑‍💻 Count news per author ( for top authors )
        const authorCount: Record<string, number> = {};
        newsSnapshot.forEach(doc => {
            const authorId = doc.data().authorId;
            if (authorId) {
                authorCount[authorId] = (authorCount[authorId] || 0) + 1;
            }
        })
        const topAuthors = Object.entries(authorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([authorId, count]) => ({ authorId, newsCount: count }));
        
        return {
            totalNews,
            totalComments,
            totalReactions,
            topAuthors
        }
    }
}