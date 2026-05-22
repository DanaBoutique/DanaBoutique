// ========================================
// استيراد Firebase من الملف المشترك
// ========================================
import { 
    db, 
    COLLECTION_NAME, 
    collection, 
    getDocs 
} from './firebase.js';

// ========================================
// قاموس الترجمة للمصطلحات الأساسية في الموقع
// ========================================
const translations = {
    ar: {
        "nav-home": "الرئيسية",
        "nav-categories": "الأقسام",
        "nav-products": "المنتجات",
        "hero-title": "أناقة الذهب المطلي تكتمل معكِ",
        "hero-desc": "اكتشفي تشكيلتنا الجديدة من أرقى الإكسسوارات المطلية بالذهب، المصممة لتمنحك لمسة فخامة تناسب ذوقك الرفيع وترافقك في كل لحظة.",
        "hero-btn": "تصفح التشكيلة الآن",
        "section-categories": "تسوّقي حسب القسم",
        "section-products": "أحدث القطع والمجوهرات",
        "cat-all": "الكل",
        "cat-rings": "خواتم",
        "cat-bracelets": "أساور",
        "cat-necklaces": "سلاسل",
        "stock-text": "المخزون المتاح:",
        "view-details": "عرض التفاصيل",
        "add-to-cart": "أضف للسلة 🛒",
        "currency": "دينار"
    },
    en: {
        "nav-home": "Home",
        "nav-categories": "Categories",
        "nav-products": "Products",
        "hero-title": "Pure Gold Elegance Completes You",
        "hero-desc": "Discover our new collection of the finest gold accessories specially designed to suit your refined taste.",
        "hero-btn": "Browse Collection Now",
        "section-categories": "Shop by Category",
        "section-products": "Latest Pieces & Jewelry",
        "cat-all": "All",
        "cat-rings": "Rings",
        "cat-bracelets": "Bracelets",
        "cat-necklaces": "Necklaces",
        "stock-text": "Available Stock:",
        "view-details": "View Details",
        "add-to-cart": "Add to Cart 🛒",
        "currency": "JOD"
    }
};

// تحديد اللغة الافتراضية
let currentLang = localStorage.getItem('store_lang') || 'ar';

// تعريف مصفوفة السلة
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];
let allProducts = []; // تخزين جميع المنتجات من Firebase

// ========================================
// عند تحميل الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // تطبيق اللغة
    applyLanguage(currentLang);
    
    // إضافة مستمع زر اللغة
    const langBtn = document.getElementById('lang-switcher');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('store_lang', currentLang);
            applyLanguage(currentLang);
            // إعادة عرض المنتجات باللغة الجديدة
            displayProducts(allProducts);
        });
    }
    
    // تحديث عداد السلة
    updateCartCount();
    
    // تحميل المنتجات من Firebase
    await loadProductsFromFirebase();
});

// ========================================
// تحميل المنتجات من Firebase
// ========================================
async function loadProductsFromFirebase() {
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return;
    
    // عرض مؤقت للتحميل
    productsGrid.innerHTML = `
        <div style="text-align: center; padding: 50px; width: 100%;">
            ⏳ جاري تحميل المنتجات...
        </div>
    `;
    
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const products = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.published === true) { // فقط المنتجات المنشورة
                products.push({ 
                    firebaseId: doc.id,
                    id: doc.id, // للحفاظ على التوافق مع الكود القديم
                    ...data 
                });
            }
        });
        
        allProducts = products;
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="text-align: center; padding: 50px; width: 100%;">
                    📦 لا توجد منتجات متاحة حالياً
                </div>
            `;
            return;
        }
        
        // عرض المنتجات
        displayProducts(products);
        
        // تفعيل الفلترة بعد عرض المنتجات
        setupCategoryFilter();
        
    } catch (error) {
        console.error("خطأ في تحميل المنتجات من Firebase:", error);
        productsGrid.innerHTML = `
            <div style="text-align: center; padding: 50px; width: 100%; color: red;">
                ❌ فشل في تحميل المنتجات<br>
                يرجى التحقق من اتصال الإنترنت
            </div>
        `;
    }
}

// ========================================
// عرض المنتجات في الصفحة
// ========================================
function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid || products.length === 0) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.type);
        
        productCard.innerHTML = `
            <img src="${product.mainImage || 'https://via.placeholder.com/300'}" 
                 alt="${product.name}"
                 onerror="this.src='https://via.placeholder.com/300'">
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-stock-status">
                ${currentLang === 'ar' ? 'الكمية المتوفرة:' : 'Available Stock:'}
                <span style="${product.stock <= 0 ? 'color:red;' : 'color:green;'}">
                    ${product.stock}
                </span>
            </p>
            <p class="price">
                ${product.price.toLocaleString()} 
                ${currentLang === 'ar' ? 'دينار' : 'JOD'}
            </p>
            <div class="product-buttons">
                <a href="product.html?id=${product.firebaseId}" class="btn-secondary">
                    ${currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </a>
                <button class="btn-add-cart" data-id="${product.firebaseId}">
                    ${currentLang === 'ar' ? 'أضف للسلة 🛒' : 'Add To Cart 🛒'}
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // إضافة مستمعات لأزرار إضافة للسلة
    attachAddToCartListeners(products);
}

// ========================================
// إضافة مستمعات لأزرار إضافة للسلة
// ========================================
function attachAddToCartListeners(products) {
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    
    addToCartButtons.forEach(button => {
        // إزالة المستمعات القديمة لمنع التكرار
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => {
            const productId = newButton.getAttribute('data-id');
            const selectedProduct = products.find(p => p.firebaseId === productId);
            
            if (!selectedProduct) return;
            
            if (selectedProduct.stock <= 0) {
                alert(currentLang === 'ar' 
                    ? 'هذا المنتج غير متوفر حالياً' 
                    : 'This product is out of stock');
                return;
            }
            
            const cartProduct = {
                id: selectedProduct.firebaseId,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.mainImage,
                quantity: 1,
                stock: selectedProduct.stock
            };
            
            addToCart(cartProduct);
        });
    });
}

// ========================================
// تفعيل فلترة المنتجات حسب القسم
// ========================================
function setupCategoryFilter() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        // إزالة المستمعات القديمة
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function() {
            categoryItems.forEach(cat => cat.classList.remove('active-cat'));
            this.classList.add('active-cat');
            
            const selectedCategory = this.getAttribute('data-category');
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = '1'; }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ========================================
// دالة تطبيق الترجمة وتغيير اتجاه الصفحة
// ========================================
function applyLanguage(lang) {
    const htmlTag = document.documentElement;
    const langBtn = document.getElementById('lang-switcher');
    
    if (lang === 'en') {
        htmlTag.setAttribute('dir', 'ltr');
        htmlTag.setAttribute('lang', 'en');
        if (langBtn) langBtn.innerText = 'العربية';
    } else {
        htmlTag.setAttribute('dir', 'rtl');
        htmlTag.setAttribute('lang', 'ar');
        if (langBtn) langBtn.innerText = 'English';
    }
    
    // ترجمة العناصر الثابتة
    const elementsToTranslate = document.querySelectorAll('[data-key]');
    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    
    // إعادة عرض المنتجات لتحديث النصوص
    if (allProducts.length > 0) {
        displayProducts(allProducts);
    }
}

// ========================================
// إضافة المنتج إلى السلة
// ========================================
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('gold_store_cart', JSON.stringify(cart));
    updateCartCount();
    
    alert(currentLang === 'ar' 
        ? `تم إضافة ${product.name} إلى سلة المشتريات بنجاح! ✨` 
        : `${product.name} has been added to cart! ✨`);
}

// ========================================
// تحديث عداد السلة
// ========================================
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCountElement.innerText = totalItems;
    }
}

// ========================================
// دالة مساعدة لتنظيف النص من HTML
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
