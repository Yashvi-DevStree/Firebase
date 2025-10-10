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
            });
            console.log('✅ Firebase Admin initialized successfully');
        } else {
            // Reuse existing default app
            this.app = admin.app();
            console.log('ℹ️ Firebase Admin already initialized, using existing app');
        }
    }

    getAuth(): admin.auth.Auth {
        return admin.auth(this.app);
    }

    getFirestore(): admin.firestore.Firestore {
        return admin.firestore(this.app);
    }

    getStorage(): admin.storage.Storage {
        return admin.storage(this.app);
    }
}
