import * as admin from 'firebase-admin';

let firestore: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  try {
    // Try to initialize with service account or application default credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback to application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
    
    firestore = admin.firestore();
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase Admin initialization failed - caching will be disabled:', error);
    firestore = null;
  }
}

if (!firestore) {
  firestore = admin.apps.length > 0 ? admin.firestore() : null;
}

export { firestore };
