// ========================================
// استيراد Firebase
// ========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ========================================
// إعدادات Firebase (استبدل بقيم مشروعك)
// ========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "custom_products_list";

// ========================================
// تحميل السلة
// ========================================
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

// ========================================
// عند تحميل الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', async () => {

    updateCartCount();

    /*
    ========================================
    قراءة ID المنتج من الرابط
    ========================================
    */
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // التحقق من وجود ID في الرابط
    if (!productId) {
        showError('لم يتم تحديد المنتج المطلوب');
        return;
    }

    /*
    ========================================
    جلب المنتج من Firebase باستخدام ID
    ========================================
    */
    try {
        // جلب المنتج مباشرة باستخدام ID (أكثر كفاءة)
        const productRef = doc(db, COLLECTION_NAME, productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
            showError('المنتج غير موجود ❌');
            return;
        }
        
        const product = { 
            firebaseId: productSnap.id,
            id: productSnap.id,
            ...productSnap.data() 
        };
        
        // التحقق من أن المنتج منشور
        if (product.published === false) {
            showError('هذا المنتج غير متاح حالياً ❌');
            return;
        }
        
        // تعبئة البيانات في الصفحة
        loadProductDetails(product);
        setupAddToCart(product);
        
    } catch (error) {
        console.error("خطأ في جلب المنتج من Firebase:", error);
        showError('حدث خطأ في تحميل المنتج. يرجى المحاولة مرة أخرى');
    }
});

// ========================================
// عرض رسالة خطأ في الصفحة
// ========================================
function showError(message) {
    const container = document.querySelector('.product-details-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <h1 style="color: #c0392b;">${message}</h1>
                <a href="../index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #b8860b; color: white; text-decoration: none; border-radius: 8px;">العودة إلى المتجر</a>
            </div>
        `;
    } else {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <h1 style="color: #c0392b;">${message}</h1>
                <a href="../index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #b8860b; color: white; text-decoration: none; border-radius: 8px;">العودة إلى المتجر</a>
            </div>
        `;
    }
}

// ========================================
// تحميل بيانات المنتج داخل الصفحة
// ========================================
function loadProductDetails(product) {
    // تعيين الصورة الرئيسية
    const mainImg = document.getElementById('main-product-img');
    if (mainImg) mainImg.src = product.mainImage || 'https://via.placeholder.com/400';

    // تعيين العنوان
    const titleElem = document.getElementById('p-title');
    if (titleElem) titleElem.innerText = product.name;

    // تعيين السعر
    const priceElem = document.getElementById('p-price');
    if (priceElem) priceElem.innerText = `${product.price} دينار`;

    // تعيين الوصف
    const descElem = document.getElementById('p-description');
    if (descElem) descElem.innerText = product.description || 'لا يوجد وصف لهذا المنتج';

    // تعيين النوع
    const typeElem = document.getElementById('p-type');
    if (typeElem) typeElem.innerText = product.type;

    // تعيين العيار
    const caliberElem = document.getElementById('p-caliber');
    if (caliberElem) caliberElem.innerText = product.caliber;

    // تعيين الكمية المتوفرة
    const stockElem = document.getElementById('p-stock');
    if (stockElem) {
        stockElem.innerText = product.stock;
        if (product.stock <= 0) {
            stockElem.style.color = 'red';
        } else {
            stockElem.style.color = 'green';
        }

        // تعيين الحد الأقصى لحقل الكمية
        setupQuantityLimit(product.stock);
    }

    // تعيين حالة التوفر
    const availabilityElem = document.getElementById('p-availability');
    if (availabilityElem) {
        if (product.stock <= 0) {
            availabilityElem.innerText = 'غير متوفر';
            availabilityElem.style.color = 'red';
        } else {
            availabilityElem.innerText = 'متوفر';
            availabilityElem.style.color = 'green';
        }
    }

    // تعيين الصور المصغرة (المعرض)
    const thumbsContainer = document.getElementById('product-thumbnails');
    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        const allImages = [product.mainImage, ...(product.gallery || [])].filter(img => img && img.trim() !== '');

        if (allImages.length === 0) {
            allImages.push('https://via.placeholder.com/100');
        }

        allImages.forEach((img, index) => {
            const thumbImg = document.createElement('img');
            thumbImg.src = img;
            thumbImg.className = 'thumb-img';
            if (index === 0) thumbImg.classList.add('active');
            thumbImg.onerror = function () { this.src = 'https://via.placeholder.com/100'; };
            thumbImg.onclick = function () {
                if (mainImg) mainImg.src = img;
                document.querySelectorAll('.thumb-img').forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            };
            thumbsContainer.appendChild(thumbImg);
        });
    }
}

// ========================================
// تعيين الحد الأقصى لحقل الكمية
// ========================================
function setupQuantityLimit(stock) {
    const qtyInput = document.getElementById('product-qty');
    if (qtyInput) {
        qtyInput.max = stock;
        qtyInput.value = 1;

        // إزالة المستمعات القديمة لمنع التكرار
        const newQtyInput = qtyInput.cloneNode(true);
        qtyInput.parentNode.replaceChild(newQtyInput, qtyInput);
        
        newQtyInput.addEventListener('input', function () {
            let value = parseInt(this.value);
            if (isNaN(value)) value = 1;
            if (value > stock) {
                this.value = stock;
                alert(`الكمية المتاحة هي ${stock} فقط`);
            }
            if (value < 1) this.value = 1;
        });
        
        newQtyInput.addEventListener('change', function () {
            let value = parseInt(this.value);
            if (isNaN(value)) value = 1;
            if (value > stock) {
                this.value = stock;
                alert(`الكمية المتاحة هي ${stock} فقط`);
            }
            if (value < 1) this.value = 1;
        });
    }
}

// ========================================
// إعداد زر إضافة للسلة
// ========================================
function setupAddToCart(product) {
    const addBtn = document.getElementById('add-to-cart-trigger');
    if (!addBtn) return;

    // إزالة المستمعات القديمة
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener('click', async () => {
        const quantityInput = document.getElementById('product-qty');
        const quantity = Number(quantityInput?.value) || 1;

        // ========================================
        // جلب المنتج من Firebase للتأكد من المخزن الحالي
        // ========================================
        try {
            const productRef = doc(db, COLLECTION_NAME, product.firebaseId);
            const productSnap = await getDoc(productRef);
            
            if (!productSnap.exists()) {
                alert('حدث خطأ: المنتج غير موجود في قاعدة البيانات');
                return;
            }
            
            const currentProduct = { 
                firebaseId: productSnap.id,
                ...productSnap.data() 
            };
            
            // التحقق من الكمية المتوفرة بالمخزن
            if (currentProduct.stock <= 0) {
                alert('عذراً، نفدت الكمية من المخزن بالكامل! 😟');
                return;
            }
            
            if (quantity > currentProduct.stock) {
                alert(`الكمية المطلوبة (${quantity}) أكبر من المتاح (${currentProduct.stock})!`);
                return;
            }
            
            // 1. تحديث المخزن في Firebase
            const newStock = currentProduct.stock - quantity;
            await updateDoc(productRef, {
                stock: newStock,
                updatedAt: new Date().toISOString()
            });
            
            // تحديث الرقم المعروض على الشاشة
            const stockSpan = document.getElementById('p-stock');
            if (stockSpan) {
                stockSpan.innerText = newStock;
                if (newStock <= 0) {
                    stockSpan.style.color = 'red';
                } else {
                    stockSpan.style.color = 'green';
                }
            }
            
            // تحديث حالة التوفر
            const availabilitySpan = document.getElementById('p-availability');
            if (availabilitySpan) {
                if (newStock <= 0) {
                    availabilitySpan.innerText = 'غير متوفر';
                    availabilitySpan.style.color = 'red';
                } else {
                    availabilitySpan.innerText = 'متوفر';
                    availabilitySpan.style.color = 'green';
                }
            }
            
            // تحديث الحد الأقصى لحقل الكمية
            setupQuantityLimit(newStock);
            
            // 2. تجهيز بيانات السلة وإضافتها
            const cartProduct = {
                id: product.firebaseId,
                name: product.name,
                price: product.price,
                image: product.mainImage,
                quantity: quantity
            };
            
            addToCartFromDetails(cartProduct);
            
            // إعادة تعيين حقل الكمية إلى 1
            if (quantityInput) quantityInput.value = 1;
            
        } catch (error) {
            console.error("خطأ في إضافة المنتج للسلة:", error);
            alert("حدث خطأ أثناء إضافة المنتج. يرجى المحاولة مرة أخرى");
        }
    });
}

// ========================================
// إضافة للسلة وتحديث الـ LocalStorage للسلة
// ========================================
function addToCartFromDetails(product) {
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem('gold_store_cart', JSON.stringify(cart));
    updateCartCount();

    alert(`تم إضافة ${product.name} إلى السلة بنجاح ✨`);
}

// ========================================
// تحديث عداد السلة العلوي
// ========================================
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    cartCountElement.innerText = totalItems;
}
