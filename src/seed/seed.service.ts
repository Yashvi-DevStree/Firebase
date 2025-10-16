/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// src/seeder/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class SeedService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async seedAdmin() {
        const auth = this.firebaseService.getAuth();
        const firestore = this.firebaseService.getFirestore();

        const email = 'admin@newsapp.com';
        const password = 'Admin@123';

        try {
            let user = await auth.getUserByEmail(email).catch(() => null);

            if (user) {
                console.log('Admin already exists');
                return;
            }

            user = await auth.createUser({
                email,
                password,
                displayName: 'Admin User',
                emailVerified: true,
            });

            await auth.setCustomUserClaims(user.uid, { role: 'admin' });
            
            await firestore.collection('users').doc(user.uid).set({
                name: 'Admin User',
                email,
                role: 'admin',
                verified: true,
                createdAt: new Date(),
            });

            console.log('✅ Admin user seeded successfully');
        } catch (err) {
            console.error('❌ Error seeding admin:', err.message || err);
        }
    }
}
               