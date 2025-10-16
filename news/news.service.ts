/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { IncrementViewsDto } from './dto/increment-views.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class NewsService {
    constructor(private readonly firebaseService: FirebaseService) { }

    private getCollection() {
        return this.firebaseService.getFirestore().collection('news');
    }

    // Create news article
    async createNews(dto: CreateNewsDto, user: any) {
        if (!['author', 'admin'].includes(user.role)) throw new ForbiddenException('Forbidden resource');

        const docRef = await this.getCollection().add({
            ...dto,
            authorId: user.uid,
            authorRole: user.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { id: docRef.id, ...dto };
    }

    async getNews() {
        const doc = await this.getCollection().doc().get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }


    async getNewsById(id: string) {
        const doc = await this.getCollection().doc(id).get();
        if (!doc.exists) throw new NotFoundException('News not found')
        return { id: doc.id, ...doc.data() };
    }

    async updateNews(id: string, dto: UpdateNewsDto, user: any) {
        const docRef = this.getCollection().doc(id);
        const doc = await docRef.get();
        if (!doc.exists) throw new NotFoundException("News not found");
        
        const data = doc.data();
        if (!data) throw new NotFoundException('News data is undefined');

        if (data.authorId !== user.uid && user.role !== 'admin') {
            throw new UnauthorizedException('Not authorized to update the news');
        }

        const updatedData = { ...dto, updatedAt: new Date() };
        await docRef.update(updatedData);
        return { id, ...data, ...updatedData };
    }

    async deleteNews(id: string, user: any) {
        const docRef = this.getCollection().doc(id);
        const doc = await docRef.get();
        if (!doc.exists) throw new NotFoundException('News not found');

        const data = doc.data();
        if (!data) throw new NotFoundException('News data is undefined');
        
        if (data.authorId !== user.uid && user.role !== 'admin') {
            throw new UnauthorizedException("Not authorized to delete news");
        }

        await docRef.delete();
        return { message: "News deleted successfully" };
    }

    // Increment views + Log subcollection entry
    async IncrementView(id: string, dto: IncrementViewsDto) {
        const newsRef = this.getCollection().doc(id);
        const doc = await newsRef.get();

        if (!doc.exists) throw new NotFoundException('news article not found');

        // atomic update using firestore increment
        await newsRef.update({
            views: admin.firestore.FieldValue.increment(dto.incrementBy),
            lastViewedAt: new Date()
        })

        // Log view in subcollection
        const viewRef = newsRef.collection('views').doc();
        await viewRef.set({
            userId: dto.userId || 'anonymous',
            viewedAt: new Date(),
            incrementBy: dto.incrementBy,
        })

        return {
            message: `Views incremented By ${dto.incrementBy}`,
            logged: `View By user ${dto.userId || 'anonymous'}`
        };
    }

    // compound query: category +  role
    // async getNewsByCategoryAndRole(category: string, role: string, limit = 5) {
    //     const snapshot = await this.getCollection()
    //         .where('category', '==', category)
    //         .where('authorRole', '==', role)
    //         .orderBy('createdAt', 'desc')
    //         .limit(limit)
    //         .get();
    //     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // }


    // pagination with cursor
    async getPaginatedNews(limit: number, startAfterId?: string) {
        let query: FirebaseFirestore.Query = this.getCollection()
            .orderBy('createdAt', 'desc')
            .limit(limit);
        
        if (startAfterId) {
            const startDoc = await this.getCollection().doc(startAfterId).get();
            query = query.startAfter(startDoc);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Array-contains query for tags
    async getNewsByTag(tag: string) {
        try {
            const db = this.firebaseService.getFirestore();
            const snapshot = await db
                .collection('news')
                .where('tags', 'array-contains', tag)
                .get();

            if (snapshot.empty) {
                return []; // no news found with this tag
            }

            // Map Firestore documents to JS objects
            const newsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return newsList;
        } catch (error) {
            console.error('Error fetching news by tag:', error.message);
            throw new Error('Failed to fetch news by tag'); // will be caught by ErrorInterceptor
        }
    }


    // Date range query
    async getNewsByDateRange(startDate: string, endDate: string) {
        const db = this.firebaseService.getFirestore();

        const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate));
        const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate));

        const snapshot = await db
            .collection('news')
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<=', endTimestamp)
            .get();

        if (snapshot.empty) return []; // no news in this range

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // OR - Like query ( category or authorRole)
    

}