// جلب محتويات السلة الحالية للعميل
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('سلتك فارغة، لا يمكن إتمام الطلب!');
                return;
            }

            // جمع بيانات العميل من المدخلات
            const name = document.getElementById('cust-name').value;
            const phone = document.getElementById('cust-phone').value;
            const city = document.getElementById('cust-city').value;
            const address = document.getElementById('cust-address').value;

            // 1. بناء نص الفاتورة العادي كـ String نقي بدون تشفير يدوي
            let rawMessage = `👑 *طلب جديد من متجر الجوهرة للمجوهرات* 👑\n\n`;
            rawMessage += `👤 *بيانات العميل:*\n`;
            rawMessage += `• *الاسم:* ${name}\n`;
            rawMessage += `• *الجوال:* ${phone}\n`;
            rawMessage += `• *المدينة:* ${city}\n`;
            rawMessage += `• *العنوان:* ${address}\n\n`;
            rawMessage += `🛒 *المنتجات المطلوبة:*\n`;

            let totalOrderPrice = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalOrderPrice += itemTotal;
                rawMessage += `- ${item.name} (العدد: ${item.quantity}) -> ${itemTotal.toLocaleString()} ريال\n`;
            });

            rawMessage += `\n💰 *الإجمالي النهائي:* ${totalOrderPrice.toLocaleString()} ريال`;
            rawMessage += `\n🚚 *نوع الشحن:* مجاني - الدفع عند الاستلام`;

            // 2. تشفير النص بالكامل برمجياً لمنع خطأ 404 
            const encodedMessage = encodeURIComponent(rawMessage);

            // 3. رقم الواتساب الخاص بك (تأكد من كتابته بشكل صحيح، مثال: 966500000000)
            const myWhatsAppNumber = "+962 7 8272 8437";

            // بناء الرابط النهائي السليم
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${myWhatsAppNumber}&text=${encodedMessage}`;

            alert('شكرًا لثقتك بمتجر الجوهرة! ✨ سيتم تحويلك الآن للواتساب لتأكيد طلبك وتثبيت موعد الشحن.');

            // تفريغ السلة من ذاكرة المتصفح بعد الشراء بنجاح
            localStorage.removeItem('gold_store_cart');

            // التوجيه إلى الرابط الجديد
            window.location.href = whatsappUrl;
        });
    }
});

// دالة لعرض الفاتورة في الجانب الأيسر
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');
    const finalPriceElement = document.getElementById('checkout-final-price');

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="color:#777;">السلة فارغة</p>';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHTML += `
            <div class="checkout-item-summary">
                <span>${item.name} × ${item.quantity}</span>
                <strong>${itemTotal.toLocaleString()} ريال</strong>
            </div>
        `;
    });

    listContainer.innerHTML = itemsHTML;
    finalPriceElement.innerText = `${total.toLocaleString()} ريال`;
}
