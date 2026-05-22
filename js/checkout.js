// ========================================
// جلب محتويات السلة الحالية للعميل
// ========================================
let cart = JSON.parse(localStorage.getItem('gold_store_cart')) || [];

// ========================================
// عند تحميل الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    // إضافة مستمع لتغير المحافظة
    const citySelect = document.getElementById('cust-city');
    if (citySelect) {
        citySelect.addEventListener('change', () => {
            updateDeliveryFee();
        });
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('❌ سلتك فارغة، لا يمكن إتمام الطلب!');
                return;
            }

            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const city = document.getElementById('cust-city').value;
            const address = document.getElementById('cust-address').value.trim();

            if (!name) {
                alert('الرجاء إدخال الاسم الكامل');
                return;
            }
            
            if (!phone) {
                alert('الرجاء إدخال رقم الهاتف');
                return;
            }
            
            if (!city) {
                alert('الرجاء اختيار المحافظة');
                return;
            }
            
            if (!address) {
                alert('الرجاء إدخال العنوان بالتفصيل');
                return;
            }

            const phoneRegex = /^(07|07[7-9]|079|078|077)[0-9]{7}$/;
            if (!phoneRegex.test(phone)) {
                alert('الرجاء إدخال رقم هاتف أردني صحيح (مثال: 0791234567)');
                return;
            }

            const subtotal = calculateSubtotal();
            const deliveryFee = getDeliveryFee(city);
            const totalOrderPrice = subtotal + deliveryFee;

            let rawMessage = buildWhatsAppMessage(name, phone, city, address, subtotal, deliveryFee, totalOrderPrice);
            const encodedMessage = encodeURIComponent(rawMessage);
            const myWhatsAppNumber = "962782728437";
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${myWhatsAppNumber}&text=${encodedMessage}`;

            if (confirm(`✅ هل أنت متأكد من رغبتك بتأكيد الطلب؟

📦 المجموع: ${subtotal.toLocaleString()} دينار
🚚 رسوم التوصيل: ${deliveryFee} دينار
💰 الإجمالي النهائي: ${totalOrderPrice.toLocaleString()} دينار

سيتم تحويلك إلى واتساب لتأكيد الطلب.`)) {
                
                localStorage.removeItem('gold_store_cart');
                cart = [];
                window.location.href = whatsappUrl;
            }
        });
    }
});

// ========================================
// بناء رسالة الواتساب
// ========================================
function buildWhatsAppMessage(name, phone, city, address, subtotal, deliveryFee, totalOrderPrice) {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
    
    let message = `👑 *طلب جديد من متجر دانه بوتيك* 👑\n`;
    message += `📅 *تاريخ الطلب:* ${dateStr}\n\n`;
    
    message += `👤 *بيانات العميل:*\n`;
    message += `• *الاسم:* ${escapeText(name)}\n`;
    message += `• *الجوال:* ${phone}\n`;
    message += `• *المحافظة:* ${city}\n`;
    message += `• *العنوان:* ${escapeText(address)}\n\n`;
    
    message += `🛒 *المنتجات المطلوبة:*\n`;
    message += `─"─"─"─"─"─"─"─"─\n`;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `${index + 1}. *${escapeText(item.name)}*\n`;
        message += `   • السعر: ${item.price.toLocaleString()} دينار\n`;
        message += `   • الكمية: ${item.quantity}\n`;
        message += `   • الإجمالي: ${itemTotal.toLocaleString()} دينار\n`;
        if (index < cart.length - 1) message += `\n`;
    });

    message += `\n─"─"─"─"─"─"─"─"─\n`;
    message += `📦 *المجموع الفرعي:* ${subtotal.toLocaleString()} دينار\n`;
    message += `🚚 *رسوم التوصيل:* ${deliveryFee} دينار\n`;
    message += `💰 *الإجمالي النهائي:* ${totalOrderPrice.toLocaleString()} دينار\n`;
    message += `💵 *طريقة الدفع:* الدفع عند الاستلام\n\n`;
    message += `🙏 *شكراً لثقتكم بمتجر دانه بوتيك*`;

    return message;
}

// ========================================
// حساب المجموع الفرعي
// ========================================
function calculateSubtotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
}

// ========================================
// حساب رسوم التوصيل (جميع المحافظات 2 دينار)
// ========================================
function getDeliveryFee(city) {
    return 2;
}

// ========================================
// تحديث رسوم التوصيل والإجمالي
// ========================================
function updateDeliveryFee() {
    const citySelect = document.getElementById('cust-city');
    const deliveryFeeAmount = document.getElementById('delivery-fee-amount');
    const finalPriceElement = document.getElementById('checkout-final-price');

    if (!citySelect) return;
    
    const selectedCity = citySelect.value;

    if (selectedCity) {
        const deliveryFee = getDeliveryFee(selectedCity);
        const subtotal = calculateSubtotal();
        const total = subtotal + deliveryFee;

        // تحديث رسوم التوصيل
        if (deliveryFeeAmount) {
            deliveryFeeAmount.innerText = `${deliveryFee} دينار`;
            deliveryFeeAmount.style.color = '#b8860b';
        }

        // تحديث الإجمالي النهائي
        if (finalPriceElement) {
            finalPriceElement.innerText = `${total.toLocaleString()} دينار`;
        }
    }
}

// ========================================
// عرض الفاتورة في الجانب الأيسر
// ========================================
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');
    const finalPriceElement = document.getElementById('checkout-final-price');

    if (cart.length === 0) {
        if (listContainer) listContainer.innerHTML = '<p style="color:#777; text-align:center;">🛒 السلة فارغة</p>';
        if (finalPriceElement) finalPriceElement.innerText = '0 دينار';
        return;
    }

    // عرض المنتجات
    let itemsHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsHTML += `
            <div class="checkout-item-summary" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #eee;">
                <span style="font-size: 15px; color: #333;">${escapeText(item.name)} <span style="color: #888; font-size: 13px;">× ${item.quantity}</span></span>
                <strong style="color: #c5a059; font-weight: 600;">${itemTotal.toLocaleString()} دينار</strong>
            </div>
        `;
    });

    if (listContainer) {
        listContainer.innerHTML = itemsHTML;
    }

    // تحديث الإجمالي (بدون توصيل في البداية)
    if (finalPriceElement) {
        finalPriceElement.innerText = `${subtotal.toLocaleString()} دينار`;
    }
    
    // تحديث رسوم التوصيل إذا كانت هناك محافظة محددة
    const citySelect = document.getElementById('cust-city');
    if (citySelect && citySelect.value) {
        updateDeliveryFee();
    } else {
        // تعيين رسوم التوصيل الافتراضية
        const deliveryFeeAmount = document.getElementById('delivery-fee-amount');
        if (deliveryFeeAmount) {
            deliveryFeeAmount.innerText = 'اختر المحافظة';
            deliveryFeeAmount.style.color = '#888';
        }
    }
}

// ========================================
// دالة مساعدة لتنظيف النص
// ========================================
function escapeText(text) {
    if (!text) return '';
    return text.replace(/[*_`]/g, '');
}
