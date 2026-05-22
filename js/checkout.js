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

المجموع: ${subtotal.toLocaleString()} دينار
رسوم التوصيل: ${deliveryFee === 0 ? 'مجاني' : deliveryFee + ' دينار'}
الإجمالي النهائي: ${totalOrderPrice.toLocaleString()} دينار

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
    
    let message = `👑 *طلب جديد من متجر الجوهرة للمجوهرات* 👑\n`;
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
    message += `🚚 *رسوم التوصيل:* ${deliveryFee === 0 ? 'مجاني' : deliveryFee + ' دينار'}\n`;
    message += `💰 *الإجمالي النهائي:* ${totalOrderPrice.toLocaleString()} دينار\n`;
    message += `💵 *طريقة الدفع:* الدفع عند الاستلام\n\n`;
    message += `🙏 *شكراً لثقتكم بمتجر الجوهرة*`;

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
// حساب رسوم التوصيل
// ========================================
function getDeliveryFee(city) {
    if (city === 'عمان') return 0;
    return 5;
}

// ========================================
// تحديث رسوم التوصيل والإجمالي
// ========================================
function updateDeliveryFee() {
    const citySelect = document.getElementById('cust-city');
    const deliveryFeeGroup = document.getElementById('delivery-fee-group');
    const deliveryFeeAmount = document.getElementById('delivery-fee-amount');
    const finalPriceElement = document.getElementById('checkout-final-price');
    const deliveryRow = document.getElementById('checkout-delivery-row');
    const grandTotalRow = document.getElementById('checkout-grand-total');

    if (!citySelect) return;
    
    const selectedCity = citySelect.value;

    if (selectedCity) {
        const deliveryFee = getDeliveryFee(selectedCity);
        const subtotal = calculateSubtotal();
        const total = subtotal + deliveryFee;

        // عرض رسوم التوصيل
        if (deliveryFeeGroup) {
            deliveryFeeGroup.style.display = 'block';
        }
        
        if (deliveryFeeAmount) {
            if (deliveryFee === 0) {
                deliveryFeeAmount.innerText = 'مجاني';
                deliveryFeeAmount.style.color = 'green';
            } else {
                deliveryFeeAmount.innerText = `${deliveryFee} دينار`;
                deliveryFeeAmount.style.color = '#b8860b';
            }
        }

        // تحديث الإجمالي النهائي
        if (finalPriceElement) {
            finalPriceElement.innerText = `${total.toLocaleString()} دينار`;
        }

        // تحديث سطر رسوم التوصيل والإجمالي في الملخص
        if (deliveryRow) {
            const deliverySpan = deliveryRow.querySelector('.delivery-fee-value');
            if (deliverySpan) {
                deliverySpan.innerText = deliveryFee === 0 ? 'مجاني' : deliveryFee + ' دينار';
            }
        }
        
        if (grandTotalRow) {
            const totalSpan = grandTotalRow.querySelector('.grand-total-value');
            if (totalSpan) {
                totalSpan.innerText = `${total.toLocaleString()} دينار`;
            }
        }
    } else {
        if (deliveryFeeGroup) {
            deliveryFeeGroup.style.display = 'none';
        }
    }
}

// ========================================
// عرض الفاتورة في الجانب الأيسر (مرة واحدة فقط)
// ========================================
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');
    const finalPriceElement = document.getElementById('checkout-final-price');
    const deliveryFeeGroup = document.getElementById('delivery-fee-group');

    if (cart.length === 0) {
        if (listContainer) listContainer.innerHTML = '<p style="color:#777; text-align:center;">🛒 السلة فارغة</p>';
        if (finalPriceElement) finalPriceElement.innerText = '0 دينار';
        if (deliveryFeeGroup) deliveryFeeGroup.style.display = 'none';
        return;
    }

    // ✅ بناء محتوى الملخص مرة واحدة فقط
    let itemsHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHTML += `
            <div class="checkout-item-summary" style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span>${escapeText(item.name)} × ${item.quantity}</span>
                <strong style="color: #c5a059;">${itemTotal.toLocaleString()} دينار</strong>
            </div>
        `;
    });

    // ✅ إضافة سطر رسوم التوصيل (مرة واحدة)
    itemsHTML += `
        <div id="checkout-delivery-row" class="checkout-delivery-row" style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ddd; color: #b8860b;">
            <span>🚚 رسوم التوصيل:</span>
            <strong class="delivery-fee-value">0 دينار</strong>
        </div>
        <div id="checkout-grand-total" class="checkout-grand-total" style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #c5a059; font-weight: bold; font-size: 18px;">
            <span>💰 الإجمالي النهائي:</span>
            <strong class="grand-total-value" style="color: #c5a059;">${total.toLocaleString()} دينار</strong>
        </div>
    `;

    if (listContainer) listContainer.innerHTML = itemsHTML;

    if (finalPriceElement) {
        finalPriceElement.innerText = `${total.toLocaleString()} دينار`;
    }
    
    // تحديث رسوم التوصيل إذا كانت هناك محافظة محددة
    const citySelect = document.getElementById('cust-city');
    if (citySelect && citySelect.value) {
        updateDeliveryFee();
    }
}

// ========================================
// دالة مساعدة لتنظيف النص
// ========================================
function escapeText(text) {
    if (!text) return '';
    return text.replace(/[*_`]/g, '');
}
