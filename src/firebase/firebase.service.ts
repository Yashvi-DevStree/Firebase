/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

// ✅ Initialize Firebase globally — this runs before Nest DI
if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(
        __dirname,
        '../../firebase-service-account.json'
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        storageBucket: 'your-app.appspot.com',
    });

    console.log('✅ Firebase Admin initialized globally');
} else {
    console.log('ℹ️ Firebase Admin already initialized');
}

@Injectable()
export class FirebaseService {
    getAuth(): admin.auth.Auth {
        return admin.auth();
    }

    getFirestore(): admin.firestore.Firestore {
        return admin.firestore();
    }

    getStorage(): admin.storage.Storage {
        return admin.storage();
    }
}
