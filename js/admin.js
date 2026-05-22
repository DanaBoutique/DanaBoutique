// 1. استيراد دوال الفايربيس المطلوبة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. إعدادات مشروع الفايربيس (✓ تم استبدالها ببياناتك الحقيقية)
const firebaseConfig = {
    apiKey: "AIzaSyBsvRjG8XHKCw_ySSqWk8sXm5X0vVgWg3U",
    authDomain: "dana-boutique.firebaseapp.com",
    projectId: "dana-boutique",
    storageBucket: "dana-boutique.firebasestorage.app",
    messagingSenderId: "468114494092",
    appId: "1:468114494092:web:7bd33fe3c7a03a40d961a9"
};

// 3. تهيئة المشروع وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. اسم المجموعة في قاعدة البيانات
const COLLECTION_NAME = "custom_products_list";

// ========================================
// عند تحميل الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('add-product-form');
    const submitBtn = document.querySelector('.btn-submit-prod');
    let editModeProductId = null; // سيخزن الـ ID الخاص بـ Firebase

    // عرض جدول المنتجات فور تحميل الصفحة
    renderAdminProductsTable();

    /*
    =========================================
    إضافة أو تعديل منتج
    =========================================
    */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // تجهيز الصور الجانبية
        const galleryImages = document.getElementById('prod-gallery')
            .value
            .split('\n')
            .map(img => img.trim())
            .filter(img => img !== '');

        // إنشاء بيانات المنتج
        const productData = {
            name: document.getElementById('prod-name').value,
            price: Number(document.getElementById('prod-price').value),
            stock: Number(document.getElementById('prod-stock').value),
            caliber: document.getElementById('prod-caliber').value,
            type: document.getElementById('prod-type').value,
            mainImage: document.getElementById('prod-main-image').value,
            gallery: galleryImages,
            description: document.getElementById('prod-desc').value,
            published: document.getElementById('prod-publish').checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // التحقق من صحة البيانات
        if (!productData.name || !productData.price || !productData.mainImage) {
            alert('الرجاء تعبئة جميع الحقول المطلوبة');
            return;
        }

        try {
            if (editModeProductId !== null) {
                // === وضع التعديل ===
                const productRef = doc(db, COLLECTION_NAME, editModeProductId);
                await updateDoc(productRef, productData);
                
                alert('✅ تم تعديل المنتج بنجاح');
                editModeProductId = null;
                submitBtn.innerText = 'نشر المنتج ✨';
            } else {
                // === وضع الإضافة ===
                await addDoc(collection(db, COLLECTION_NAME), productData);
                alert('✅ تم إضافة المنتج بنجاح');
            }

            // تحديث الجدول وإعادة تعيين النموذج
            await renderAdminProductsTable();
            form.reset();
            
            // إعادة تعيين حالة التعديل
            editModeProductId = null;
            submitBtn.innerText = 'نشر المنتج ✨';

        } catch (error) {
            console.error("خطأ أثناء معالجة المنتج: ", error);
            alert("❌ حدث خطأ، يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى");
        }
    });

    /*
    =========================================
    عرض جدول المنتجات من Firestore
    =========================================
    */
    async function renderAdminProductsTable() {
        const tableContainer = document.getElementById('admin-table-wrapper');
        
        if (!tableContainer) {
            console.error("عنصر admin-table-wrapper غير موجود");
            return;
        }
        
        // عرض مؤقت للمعاينة
        tableContainer.innerHTML = `
            <div class="admin-container">
                <p style="text-align:center;">⏳ جاري تحميل المنتجات...</p>
            </div>
        `;
        
        try {
            // جلب جميع المنتجات من قاعدة البيانات
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            const products = [];
            
            querySnapshot.forEach((doc) => {
                products.push({ 
                    firebaseId: doc.id,  // معرف Firebase
                    ...doc.data() 
                });
            });

            if (products.length === 0) {
                tableContainer.innerHTML = `
                    <div class="admin-container">
                        <h2>المنتجات الحالية</h2>
                        <p style="text-align:center; color:#777;">📦 لا توجد منتجات حالياً</p>
                        <p style="text-align:center;">يمكنك إضافة منتج جديد من النموذج أعلاه</p>
                    </div>
                `;
                return;
            }

            // ترتيب المنتجات حسب تاريخ الإنشاء (الأحدث أولاً)
            const sortedProducts = products.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            let tableHTML = `
                <div class="admin-container">
                    <h2>📋 المنتجات الحالية (${products.length})</h2>
                    <div style="overflow-x: auto;">
                        <table class="admin-table" style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#1a1a1a; color:#f1e5cd;">
                                    <th style="padding:12px;">الصورة</th>
                                    <th style="padding:12px;">الاسم</th>
                                    <th style="padding:12px;">السعر</th>
                                    <th style="padding:12px;">الكمية</th>
                                    <th style="padding:12px;">النوع</th>
                                    <th style="padding:12px;">الحالة</th>
                                    <th style="padding:12px;">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            sortedProducts.forEach(product => {
                tableHTML += `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px; text-align:center;">
                            <img src="${product.mainImage}" 
                                 width="50" 
                                 height="50" 
                                 style="object-fit:cover; border-radius:6px;" 
                                 onerror="this.src='https://via.placeholder.com/50'">
                        </td>
                        <td style="padding:10px;"><strong>${escapeHtml(product.name)}</strong></td>
                        <td style="padding:10px;">${product.price} دينار</td>
                        <td style="padding:10px; ${product.stock <= 0 ? 'color:red; font-weight:bold;' : 'color:green;'}">
                            ${product.stock}
                        </td>
                        <td style="padding:10px;">${product.type}</td>
                        <td style="padding:10px;">
                            ${product.published ? '✅ منشور' : '❌ مخفي'}
                        </td>
                        <td style="padding:10px;">
                            <button class="btn-action-edit" 
                                    onclick="window.prepareEditProduct('${product.firebaseId}')"
                                    style="background:#c5a059; color:#1a1a1a; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; margin-left:5px;">
                                ✏️ تعديل
                            </button>
                            <button class="btn-action-delete" 
                                    onclick="window.deleteProductFromAdmin('${product.firebaseId}')"
                                    style="background:#dc3545; color:white; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">
                                🗑️ حذف
                            </button>
                        </td>
                     </tr>
                `;
            });

            tableHTML += `
                            </tbody>
                         </table>
                    </div>
                </div>
            `;
            
            tableContainer.innerHTML = tableHTML;

        } catch (error) {
            console.error("خطأ أثناء جلب المنتجات: ", error);
            tableContainer.innerHTML = `
                <div class="admin-container">
                    <h2>المنتجات الحالية</h2>
                    <p style="color:red; text-align:center;">❌ فشل جلب البيانات من السحابة</p>
                    <p style="text-align:center;">يرجى التحقق من اتصال الإنترنت وإعدادات Firebase</p>
                </div>
            `;
        }
    }

    /*
    =========================================
    تجهيز التعديل (جلب منتج محدد)
    =========================================
    */
    window.prepareEditProduct = async function (firebaseId) {
        if (!firebaseId) {
            alert("خطأ: معرف المنتج غير صالح");
            return;
        }
        
        try {
            // جلب المنتج مباشرة باستخدام ID
            const productRef = doc(db, COLLECTION_NAME, firebaseId);
            const productSnap = await getDoc(productRef);
            
            if (!productSnap.exists()) {
                alert("المنتج غير موجود");
                return;
            }
            
            const product = productSnap.data();
            
            // تعبئة النموذج بالبيانات
            document.getElementById('prod-name').value = product.name || '';
            document.getElementById('prod-price').value = product.price || '';
            document.getElementById('prod-stock').value = product.stock || 0;
            document.getElementById('prod-caliber').value = product.caliber || '21 قيراط';
            document.getElementById('prod-type').value = product.type || 'خواتم';
            document.getElementById('prod-main-image').value = product.mainImage || '';
            document.getElementById('prod-gallery').value = (product.gallery || []).join('\n');
            document.getElementById('prod-desc').value = product.description || '';
            document.getElementById('prod-publish').checked = product.published !== false;
            
            // تغيير وضع النموذج إلى التعديل
            editModeProductId = firebaseId;
            const submitBtn = document.querySelector('.btn-submit-prod');
            if (submitBtn) {
                submitBtn.innerText = '💾 حفظ التعديلات';
            }
            
            // التمرير إلى أعلى الصفحة
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            alert(`جاري تعديل المنتج: ${product.name}`);
            
        } catch (error) {
            console.error("خطأ في تجهيز التعديل: ", error);
            alert("حدث خطأ أثناء تحميل بيانات المنتج");
        }
    };

    /*
    =========================================
    حذف المنتج من Firestore
    =========================================
    */
    window.deleteProductFromAdmin = async function (firebaseId) {
        if (!firebaseId) {
            alert("خطأ: معرف المنتج غير صالح");
            return;
        }
        
        const confirmDelete = confirm('⚠️ هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.');
        if (!confirmDelete) return;
        
        try {
            // حذف المستند من قاعدة البيانات
            await deleteDoc(doc(db, COLLECTION_NAME, firebaseId));
            
            alert('✅ تم حذف المنتج بنجاح');
            
            // إعادة عرض الجدول
            await renderAdminProductsTable();
            
            // إذا كنا في وضع تعديل هذا المنتج، قم بإعادة تعيين النموذج
            if (editModeProductId === firebaseId) {
                editModeProductId = null;
                const form = document.getElementById('add-product-form');
                const submitBtn = document.querySelector('.btn-submit-prod');
                if (form) form.reset();
                if (submitBtn) submitBtn.innerText = 'نشر المنتج ✨';
            }
            
        } catch (error) {
            console.error("خطأ أثناء الحذف: ", error);
            alert("❌ لم نتمكن من حذف المنتج. يرجى المحاولة مرة أخرى");
        }
    };
    
    /*
    =========================================
    دالة مساعدة لتنظيف النص من الـ HTML
    =========================================
    */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

// تصدير الدوال للاستخدام الخارجي (إذا لزم الأمر)
export { db, COLLECTION_NAME };
