// تحميل السلة من الذاكرة المحلية لتحديث العداد
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // ربط زر الإضافة بالسلة
    const addBtn = document.getElementById('add-to-cart-trigger');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const name = document.getElementById('p-title').innerText;
            const priceText = document.getElementById('p-price').innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const image = document.getElementById('main-product-img').src;
            const qty = parseInt(document.getElementById('product-qty').value) || 1;

            const product = { name, price, image, quantity: qty };
            
            // إضافة المنتج حسب الكمية المختارة
            addToCartFromDetails(product);
        });
    }
});

// دالة لتغيير الصورة المعروضة عند الضغط على الصور المصغرة (Thumbnails)
window.changePreviewImage = function(src) {
    document.getElementById('main-product-img').src = src;
    
    // تغيير التحديد البصري للصورة النشطة
    const thumbs = document.querySelectorAll('.thumb-img');
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    event.target.classList.add('active');
}

function addToCartFromDetails(product) {
    const existingProduct = cart.find(item => item.name === product.name);

    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem('gold_store_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`تم إضافة ${product.name} (عدد: ${product.quantity}) إلى السلة بنجاح! ✨`);
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.innerText = totalItems;
    }
}