// تحميل السلة من الذاكرة المحلية
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

// دالة لعرض المنتجات داخل صفحة السلة
function renderCart() {
    const wrapper = document.getElementById('cart-content-wrapper');
    const summaryBox = document.getElementById('cart-summary-box');
    const cartCount = document.getElementById('cart-count');
    
    // تحديث العداد العلوي
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.innerText = totalItems;

    // إذا كانت السلة فارغة
    if (cart.length === 0) {
        wrapper.innerHTML = `<p class="empty-msg">سلة المشتريات فارغة حالياً.. اذهبي للصفحة الرئيسية واختاري ما يناسبك ✨</p>`;
        summaryBox.style.display = 'none';
        return;
    }

    // إذا كانت تحتوي على منتجات، نقوم ببناء الجدول
    summaryBox.style.display = 'block';
    let tableHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>الاسم</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>الإجمالي</th>
                    <th>إجراء</th>
                </tr>
            </thead>
            <tbody>
    `;

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        tableHTML += `
            <tr>
                <td><img src="${item.image}" alt="${item.name}"></td>
                <td><strong>${item.name}</strong></td>
                <td>${item.price.toLocaleString()} ريال</td>
                <td>
                    <div class="quantity-control">
                        <button class="btn-qty" onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-qty" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td>${itemTotal.toLocaleString()} ريال</td>
                <td><button class="btn-delete" onclick="removeItem(${index})">حذف 🗑️</button></td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    wrapper.innerHTML = tableHTML;

    // تحديث المبالغ المالية في الملخص
    document.getElementById('subtotal').innerText = `${subtotal.toLocaleString()} ريال`;
    document.getElementById('final-total').innerText = `${subtotal.toLocaleString()} ريال`;
}

// دالة لتغيير الكمية (+ أو -)
window.changeQuantity = function(index, change) {
    cart[index].quantity += change;
    
    // إذا قلّت الكمية عن 1 يتم حذف المنتج تلقائياً
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveAndRefresh();
}

// دالة لحذف منتج تماماً بخلال زر الحذف
window.removeItem = function(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

// حفظ التغييرات في الذاكرة وإعادة العرض
function saveAndRefresh() {
    localStorage.setItem('gold_store_cart', JSON.stringify(cart));
    renderCart();
}