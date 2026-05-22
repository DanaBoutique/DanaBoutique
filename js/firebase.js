// ========================================
// استيراد الدوال المطلوبة من Firebase (CDN مباشر)
// ========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-analytics.js";

// ========================================
// إعدادات مشروع Firebase (خاصتك)
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyBsvRjG8XHKCw_ySSqWk8sXm5X0vVgWg3U",
  authDomain: "dana-boutique.firebaseapp.com",
  projectId: "dana-boutique",
  storageBucket: "dana-boutique.firebasestorage.app",
  messagingSenderId: "468114494092",
  appId: "1:468114494092:web:7bd33fe3c7a03a40d961a9",
  measurementId: "G-1T3D84HYE3"
};

// ========================================
// تهيئة Firebase
// ========================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// ========================================
// اسم المجموعة في قاعدة البيانات
// ========================================
const COLLECTION_NAME = "custom_products_list";

// ========================================
// تصدير الدوال والمتغيرات لاستخدامها في الملفات الأخرى
// ========================================
export { 
    db, 
    COLLECTION_NAME,
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
};
