import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

// تحميل بيانات الاعتماد من ملف JSON أو من متغيرات البيئة
const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH || './NumAffairesCitizenApp/src/config/numaffaires-firebase-adminsdk-fbsvc-3c07357b3f.JSON';
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(serviceAccountPath), 'utf8')
);

let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.appspot.com',
  });
} else {
  app = getApps()[0];
}

export const firebaseAdminApp = app;
export const firebaseAdminAuth = getAuth(app);
export const firebaseAdminStorage = getStorage(app);

// يمكنك الآن استيراد firebaseAdminApp أو firebaseAdminAuth أو firebaseAdminStorage من هذا الملف لاستخدام Firebase Admin SDK في أي مكان في الباكند.
// مثال:
// import { firebaseAdminAuth } from "@/lib/firebaseAdmin";
