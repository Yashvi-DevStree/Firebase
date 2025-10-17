/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private app: admin.app.App;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        // Check if default app already exists
        const apps = admin.apps;
        if (!apps.length) {
            this.app = admin.initializeApp({
                credential: admin.credential.cert('firebase-service-account.json'),
                storageBucket: 'your-app.appspot.com'     // ✅ if this line exists, Storage is ready
            });
            console.log('✅ Firebase Admin initialized successfully');
        } else {
            // Reuse existing default app
            this.app = admin.app();
            console.log('ℹ️  Firebase Admin already initialized, using existing app');
        }
    }

    getAuth(): admin.auth.Auth {
        return admin.auth(this.app);
    }

    getFirestore(): admin.firestore.Firestore {
        return admin.firestore(this.app);
    }

    getStorage(): admin.storage.Storage {
        // Returns the Storage instance. You can call .bucket() on it in your StorageService
        return admin.storage(this.app);
    }
}
