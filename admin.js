document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-product-form');
    const submitBtn = form.querySelector('.btn-submit-prod');
    
    // متغير لتخزين معرف (ID) المنتج الذي يتم تعديله حالياً (إذا وُجد)
    let editModeProductId = null;

    // تشغيل دالة عرض جدول المنتجات فور فتح الصفحة
    renderAdminProductsTable();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let products = JSON.parse(localStorage.getItem('custom_products_list')) || [];

        // تجميع البيانات من الحقول
        const productData = {
            name: document.getElementById('prod-name').value,
            price: parseInt(document.getElementById('prod-price').value),
            stock: parseInt(document.getElementById('prod-stock').value),
            caliber: document.getElementById('prod-caliber').value,
            weight: document.getElementById('prod-weight').value,
            mainImage: document.getElementById('prod-img-main').value,
            thumbImage: document.getElementById('prod-img-thumb').value || document.getElementById('prod-img-main').value,
            description: document.getElementById('prod-desc').value
        };

        if (editModeProductId !== null) {
            // [وضع التعديل]: البحث عن المنتج القديم وتحديث بياناته
            const index = products.findIndex(p => p.id === editModeProductId);
            if (index !== -1) {
                products[index] = { id: editModeProductId, ...productData };
                alert('تم تحديث بيانات قطعة الذهب بنجاح! 👑');
            }
            // إنهاء وضع التعديل وإرجاع الزر لحالته الأصلية
            editModeProductId = null;
            submitBtn.innerText = 'نشر القطعة في المتجر الآن ✨';
            submitBtn.style.backgroundColor = '#1a1a1a';
        } else {
            // [وضع الإضافة]: إنشاء منتج جديد تماماً
            const newProduct = {
                id: Date.now(),
                ...productData
            };
            products.push(newProduct);
            alert('تم نشر قطعة الذهب الجديدة بنجاح! ✨');
        }

        // حفظ المصفوفة المحدثة وإعادة بناء الجدول وتنظيف الاستمارة
        localStorage.setItem('custom_products_list', JSON.stringify(products));
        renderAdminProductsTable();
        form.reset();
    });

    // دالة لبناء وعرض جدول المنتجات الحالية داخل لوحة التحكم
    function renderAdminProductsTable() {
        const tableContainer = document.getElementById('admin-table-wrapper');
        const products = JSON.parse(localStorage.getItem('custom_products_list')) || [];

        if (products.length === 0) {
            tableContainer.innerHTML = '<p style="text-align:center; color:#777; margin-top:20px;">لا توجد منتجات مضافة حالياً في المخزن.</p>';
            return;
        }

        let tableHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>الصورة</th>
                        <th>الاسم</th>
                        <th>السعر</th>
                        <th>المخزون</th>
                        <th>الوزن/العيار</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(prod => {
            tableHTML += `
                <tr>
                    <td><img src="${prod.mainImage}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><strong>${prod.name}</strong></td>
                    <td>${prod.price.toLocaleString()} ريال</td>
                    <td>${prod.stock} قطع</td>
                    <td>${prod.weight} / ${prod.caliber}</td>
                    <td>
                        <button class="btn-action-edit" onclick="prepareEditProduct(${prod.id})">تعديل ✏️</button>
                        <button class="btn-action-delete" onclick="deleteProductFromAdmin(${prod.id})">حذف 🗑️</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
    }

    // دالة لتجهيز البيانات ونقلها للاستمارة عند الضغط على "تعديل"
    window.prepareEditProduct = function(id) {
        const products = JSON.parse(localStorage.getItem('custom_products_list')) || [];
        const product = products.find(p => p.id === id);

        if (product) {
            // تعبئة الحقول بالبيانات الحالية للقطع ليقوم المستخدم بتعديلها
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-stock').value = product.stock;
            document.getElementById('prod-caliber').value = product.caliber;
            document.getElementById('prod-weight').value = product.weight;
            document.getElementById('prod-img-main').value = product.mainImage;
            document.getElementById('prod-img-thumb').value = product.thumbImage;
            document.getElementById('prod-desc').value = product.description;

            // تفعيل وضع التعديل برمجياً وبصرياً
            editModeProductId = id;
            submitBtn.innerText = 'حفظ التعديلات الجديدة 💾';
            submitBtn.style.backgroundColor = '#c5a059';
            // الصعود التلقائي لأعلى الصفحة حيث توجد الاستمارة
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // دالة لحذف المنتج نهائياً من المخزن والذاكرة
    window.deleteProductFromAdmin = function(id) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذه القطعة نهائياً من المتجر؟')) {
            let products = JSON.parse(localStorage.getItem('custom_products_list')) || [];
            products = products.filter(p => p.id !== id);
            localStorage.setItem('custom_products_list', JSON.stringify(products));
            renderAdminProductsTable();
            
            // إذا كان المستخدم يحذف منتجاً وهو في وضع تعديله حالياً، قم بإلغاء وضع التعديل
            if(editModeProductId === id) {
                editModeProductId = null;
                submitBtn.innerText = 'نشر القطعة في المتجر الآن ✨';
                form.reset();
            }
        }
    }
});
