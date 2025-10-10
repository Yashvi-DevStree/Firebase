/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class UserService {
    constructor(private readonly firebaseService: FirebaseService) { }
    
    // 🔹 Create user
    async createUser(email: string, password: string, name: string) {
        const userRecord: admin.auth.UserRecord = await this.firebaseService
            .getAuth()
            .createUser({ email, password })
        
        await this.firebaseService.getFirestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        return { uid: userRecord.uid, name, email };
    }

    // 🔹 Read all users
    async getAllUsers() {
        const snapshot = await this.firebaseService.getFirestore().collection('users').get();
        return snapshot.docs.map(doc => ({uid: doc.id, ...doc.data()}))
    }

    // 🔹 Read single user by uid
    async getUserById(uid: string) {
        const doc = await this.firebaseService.getFirestore().collection('users').doc(uid).get();
        if (!doc.exists) throw new Error('User not found');
        return { uid: doc.id, ...doc.data() };
    }

    // 🔹 Update user
    async updateUser(uid: string, data: { name?: string, email?: string }) {
        
        // Update Firestore
        await this.firebaseService.getFirestore().collection('users').doc(uid).update(data);

        // Update Firebase Auth if email is changed
        if (data.email) {
            await this.firebaseService.getAuth().updateUser(uid, { email: data.email });
        }

        const updatedDoc = await this.firebaseService.getFirestore().collection('users').doc(uid).get();
        return { uid: updatedDoc.id, ...updatedDoc.data() };
    }

    // 🔹 Delete user
    async deleteUser(uid: string) {
        await this.firebaseService.getFirestore().collection('users').doc(uid).delete();
        await this.firebaseService.getAuth().deleteUser(uid);
        return { message: `User ${uid} deleted successfully` };
    }
}