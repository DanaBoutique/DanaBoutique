// قاموس الترجمة للمصطلحات الأساسية في الموقع
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
        "currency": "SAR"
    }
};

// تحديد اللغة الافتراضية بناء على ذاكرة المتصفح أو العربية كخيار أول
let currentLang = localStorage.getItem('store_lang') || 'ar';

document.addEventListener('DOMContentLoaded', () => {
    // تطبيق اللغة المحفوظة فور تحميل الصفحة
    applyLanguage(currentLang);

    const langBtn = document.getElementById('lang-switcher');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            // تبديل اللغة عند الضغط على الزر
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('store_lang', currentLang);
            applyLanguage(currentLang);
            // إعادة تحميل خفيفة لتحديث المنتجات الديناميكية إذا وُجدت
            window.location.reload();
        });
    }
});

// دالة تطبيق الترجمة وتغيير اتجاه الصفحة
function applyLanguage(lang) {
    const htmlTag = document.documentElement;
    const langBtn = document.getElementById('lang-switcher');

    // 1. تغيير الاتجاه واللغة في وسم HTML الرئيسي
    if (lang === 'en') {
        htmlTag.setAttribute('dir', 'ltr');
        htmlTag.setAttribute('lang', 'en');
        if (langBtn) langBtn.innerText = 'العربية';
    } else {
        htmlTag.setAttribute('dir', 'rtl');
        htmlTag.setAttribute('lang', 'ar');
        if (langBtn) langBtn.innerText = 'English';
    }

    // 2. ترجمة العناصر الثابتة التي تحمل سمة data-key
    const elementsToTranslate = document.querySelectorAll('[data-key]');
    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}// 1. تعريف مصفوفة السلة (تُحمل المنتجات من الذاكرة المحلية إذا كانت موجودة، أو تبدأ فارغة)
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

// انتظر حتى يتم تحميل الصفحة بالكامل قبل تشغيل الأكواد
document.addEventListener('DOMContentLoaded', () => {

    // أ) تحديث عداد السلة في الهيدر فور فتح الموقع
    updateCartCount();
    /*
=========================================
عرض المنتجات القادمة من لوحة التحكم
=========================================
*/

    const products =
        JSON.parse(localStorage.getItem('custom_products_list')) || [];

    const productsGrid =
        document.querySelector('.products-grid');

    /*
    =========================================
    عرض المنتجات المنشورة فقط
    =========================================
    */

    const publishedProducts =
        products.filter(product => product.published);

    if (publishedProducts.length > 0 && productsGrid) {

        productsGrid.innerHTML = '';

        publishedProducts.forEach(product => {

            productsGrid.innerHTML += `

                <div
                    class="product-card"
                    data-category="${product.type}"
                >

                    <img
                        src="${product.mainImage}"
                        alt="${product.name}"

                        onerror="
                            this.src='https://via.placeholder.com/300'
                        "
                    >

                    <h3>
                        ${product.name}
                    </h3>

                    

                    <p class="product-stock-status">

                        ${currentLang === 'ar'
                    ?
                    'الكمية المتوفرة:'
                    :
                    'Available Stock:'
                }

                        <span>

                            ${product.stock}

                        </span>

                    </p>

                    <p class="price">

                        ${product.price.toLocaleString()}

                        ${currentLang === 'ar'
                    ?
                    'دينار'
                    :
                    'JOD'
                }

                    </p>

                    <div class="product-buttons">

                        <a
                            href="html/product.html?id=${product.id}"
                            class="btn-secondary"
                        >

                            ${currentLang === 'ar'
                    ?
                    'عرض التفاصيل'
                    :
                    'View Details'
                }

                        </a>

                        <button
                            class="btn-add-cart"

                            data-id="${product.id}"
                        >

                            ${currentLang === 'ar'
                    ?
                    'أضف للسلة 🛒'
                    :
                    'Add To Cart 🛒'
                }

                        </button>

                    </div>

                </div>
            `;
        });
    }

    /*
    =========================================
    أزرار إضافة للسلة
    =========================================
    */

    const addToCartButtons =
        document.querySelectorAll('.btn-add-cart');

    addToCartButtons.forEach(button => {

        button.addEventListener('click', () => {

            const productId =
                Number(button.dataset.id);

            const selectedProduct =
                products.find(p => p.id === productId);

            if (!selectedProduct) return;

            /*
            =========================================
            منع إضافة منتج غير متوفر
            =========================================
            */

            if (selectedProduct.stock <= 0) {

                alert(
                    currentLang === 'ar'
                        ?
                        'هذا المنتج غير متوفر حالياً'
                        :
                        'This product is out of stock'
                );

                return;
            }

            /*
            =========================================
            بيانات السلة
            =========================================
            */

            const cartProduct = {

                id:
                    selectedProduct.id,

                name:
                    selectedProduct.name,

                price:
                    selectedProduct.price,

                image:
                    selectedProduct.mainImage,

                quantity:
                    1,

                stock:
                    selectedProduct.stock
            };

            addToCart(cartProduct);
        });
    });

    // د) تفعيل فلترة المنتجات حسب القسم المختار (خواتم، أساور، سلاسل)
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function () {
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
});

// 2. دالة إضافة المنتج إلى مصفوفة السلة
function addToCart(product) {
    const existingProduct = cart.find(item => item.name === product.name);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }

    localStorage.setItem('gold_store_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`تم إضافة ${product.name} إلى سلة المشتريات بنجاح! ✨`);
}

// 3. دالة تحديث عداد السلة في أعلى الموقع
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.innerText = totalItems;
    }
}
