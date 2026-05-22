// جلب محتويات السلة الحالية للعميل
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    // إضافة مستمع لتغير المحافظة
    const citySelect = document.getElementById('cust-city');
    if (citySelect) {
        citySelect.addEventListener('change', updateDeliveryFee);
    }

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

            // التحقق من اختيار المحافظة
            if (!city) {
                alert('الرجاء اختيار المحافظة');
                return;
            }

            // حساب الإجمالي مع رسوم التوصيل
            const subtotal = calculateSubtotal();
            const deliveryFee = getDeliveryFee(city);
            const totalOrderPrice = subtotal + deliveryFee;

            // 1. بناء نص الفاتورة
            let rawMessage = `👑 *طلب جديد من متجر الجوهرة للمجوهرات* 👑\n\n`;
            rawMessage += `👤 *بيانات العميل:*\n`;
            rawMessage += `• *الاسم:* ${name}\n`;
            rawMessage += `• *الجوال:* ${phone}\n`;
            rawMessage += `• *المحافظة:* ${city}\n`;
            rawMessage += `• *العنوان:* ${address}\n\n`;
            rawMessage += `🛒 *المنتجات المطلوبة:*\n`;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                rawMessage += `- ${item.name} (العدد: ${item.quantity}) -> ${itemTotal.toLocaleString()} دينار\n`;
            });

            rawMessage += `\n📦 *المجموع الفرعي:* ${subtotal.toLocaleString()} دينار`;
            rawMessage += `\n🚚 *رسوم التوصيل:* ${deliveryFee === 0 ? 'مجاني' : deliveryFee + ' دينار'}`;
            rawMessage += `\n💰 *الإجمالي النهائي:* ${totalOrderPrice.toLocaleString()} دينار`;
            rawMessage += `\n💵 *طريقة الدفع:* الدفع عند الاستلام`;

            // 2. تشفير النص
            const encodedMessage = encodeURIComponent(rawMessage);

            // 3. رقم الواتساب
            const myWhatsAppNumber = "962782728437"; // بدون + وبدون مسافات

            // بناء الرابط النهائي
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${myWhatsAppNumber}&text=${encodedMessage}`;

            alert('شكرًا لثقتك بمتجر الجوهرة! ✨ سيتم تحويلك الآن للواتساب لتأكيد طلبك وتثبيت موعد الشحن.');

            // تفريغ السلة من ذاكرة المتصفح بعد الشراء بنجاح
            localStorage.removeItem('gold_store_cart');

            // التوجيه إلى الرابط الجديد
            window.location.href = whatsappUrl;
        });
    }
});

// دالة لحساب المجموع الفرعي (بدون توصيل)
function calculateSubtotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
}

// دالة لحساب رسوم التوصيل حسب المحافظة
function getDeliveryFee(city) {
    // عمان: توصيل مجاني
    if (city === 'عمان') {
        return 0;
    }
    // باقي المحافظات: 5 دينار
    return 5;
}

// دالة لتحديث رسوم التوصيل في الواجهة
function updateDeliveryFee() {
    const citySelect = document.getElementById('cust-city');
    const deliveryFeeGroup = document.getElementById('delivery-fee-group');
    const deliveryFeeAmount = document.getElementById('delivery-fee-amount');
    const finalPriceElement = document.getElementById('checkout-final-price');

    const selectedCity = citySelect.value;

    if (selectedCity) {
        const deliveryFee = getDeliveryFee(selectedCity);
        const subtotal = calculateSubtotal();
        const total = subtotal + deliveryFee;

        // عرض رسوم التوصيل
        deliveryFeeGroup.style.display = 'block';
        if (deliveryFee === 0) {
            deliveryFeeAmount.innerText = 'مجاني';
            deliveryFeeAmount.style.color = 'green';
        } else {
            deliveryFeeAmount.innerText = `${deliveryFee} دينار`;
            deliveryFeeAmount.style.color = '#b8860b';
        }

        // تحديث الإجمالي النهائي
        finalPriceElement.innerText = `${total.toLocaleString()} دينار`;

        // إضافة تفاصيل التوصيل في الملخص
        updateSummaryWithDelivery(deliveryFee);
    } else {
        deliveryFeeGroup.style.display = 'none';
    }
}

// دالة لتحديث الملخص مع رسوم التوصيل
function updateSummaryWithDelivery(deliveryFee) {
    const listContainer = document.getElementById('checkout-items-list');
    const subtotal = calculateSubtotal();

    let itemsHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
            <div class="checkout-item-summary">
                <span>${item.name} × ${item.quantity}</span>
                <strong>${itemTotal.toLocaleString()} دينار</strong>
            </div>
        `;
    });

    // إضافة سطر رسوم التوصيل
    itemsHTML += `
        <div class="checkout-delivery-row" style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd; color: #b8860b;">
            <span>🚚 رسوم التوصيل:</span>
            <strong>${deliveryFee === 0 ? 'مجاني' : deliveryFee + ' دينار'}</strong>
        </div>
    `;

    listContainer.innerHTML = itemsHTML;
}

// دالة لعرض الفاتورة في الجانب الأيسر (معدلة)
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');
    const finalPriceElement = document.getElementById('checkout-final-price');

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="color:#777;">السلة فارغة</p>';
        if (finalPriceElement) finalPriceElement.innerText = '0 دينار';
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
                <strong>${itemTotal.toLocaleString()} دينار</strong>
            </div>
        `;
    });

    listContainer.innerHTML = itemsHTML;

    // عرض الإجمالي بدون توصيل في البداية (سيتم تحديثه عند اختيار المحافظة)
    finalPriceElement.innerText = `${total.toLocaleString()} دينار`;
}
