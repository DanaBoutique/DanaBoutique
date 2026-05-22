document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('add-product-form');
    const submitBtn = document.querySelector('.btn-submit-prod');

    let editModeProductId = null;

    renderAdminProductsTable();

    /*
    =========================================
    إضافة أو تعديل منتج
    =========================================
    */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let products = JSON.parse(localStorage.getItem('custom_products_list')) || [];

        /*
        =========================================
        تجهيز الصور الجانبية
        =========================================
        */
        const galleryImages = document.getElementById('prod-gallery')
            .value
            .split('\n')
            .map(img => img.trim())
            .filter(img => img !== '');

        /*
        =========================================
        إنشاء بيانات المنتج
        =========================================
        */
        const productData = {
            name: document.getElementById('prod-name').value,
            price: Number(document.getElementById('prod-price').value),
            stock: Number(document.getElementById('prod-stock').value),
            caliber: document.getElementById('prod-caliber').value,
            type: document.getElementById('prod-type').value,
            mainImage: document.getElementById('prod-main-image').value,
            gallery: galleryImages,
            description: document.getElementById('prod-desc').value,
            published: document.getElementById('prod-publish').checked,
            createdAt: new Date().toISOString()
        };

        /*
        =========================================
        وضع التعديل
        =========================================
        */
        if (editModeProductId !== null) {
            const index = products.findIndex(p => p.id === editModeProductId);

            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    ...productData
                };
                alert('تم تعديل المنتج بنجاح ✨');
            }
            editModeProductId = null;
            submitBtn.innerText = 'نشر المنتج ✨';
        }
        /*
        =========================================
        وضع الإضافة
        =========================================
        */
        else {
            const newProduct = {
                id: Date.now(),
                ...productData
            };
            products.push(newProduct);
            alert('تم إضافة المنتج بنجاح ✨');
        }

        /*
        =========================================
        حفظ البيانات
        =========================================
        */
        localStorage.setItem('custom_products_list', JSON.stringify(products));
        renderAdminProductsTable();
        form.reset();
    });

    /*
    =========================================
    عرض جدول المنتجات
    =========================================
    */
    function renderAdminProductsTable() {
        const tableContainer = document.getElementById('admin-table-wrapper');
        const products = JSON.parse(localStorage.getItem('custom_products_list')) || [];

        if (products.length === 0) {
            tableContainer.innerHTML = `
                <div class="admin-container">
                    <p style="text-align:center;">لا توجد منتجات حالياً</p>
                </div>
            `;
            return;
        }

        let tableHTML = `
            <div class="admin-container">
                <h2>المنتجات الحالية</h2>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>السعر</th>
                            <th>الكمية بالمخزن</th>
                            <th>النوع</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // 🔄 عكس الترتيب: الأقدم أولاً (في الأعلى) والأحدث في الأسفل
        // إذا أردت الأحدث في الأعلى، استخدم products.slice().reverse()
        // إذا أردت الأقدم في الأعلى (الجديد بالأسفل)، استخدم products
        const sortedProducts = products; // الأقدم أولاً

        sortedProducts.forEach(product => {
            tableHTML += `
                <tr>
                    <td>
                        <img src="${product.mainImage}" width="60" height="60" style="object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/60'">
                    </td>
                    <td>${product.name}</td>
                    <td>${product.price} دينار</td>
                    <td>${product.stock}</td>
                    <td>${product.type}</td>
                    <td>${product.published ? 'منشور ✅' : 'مخفي ❌'}</td>
                    <td>
                        <button class="btn-action-edit" onclick="prepareEditProduct(${product.id})">تعديل</button>
                        <button class="btn-action-delete" onclick="deleteProductFromAdmin(${product.id})">حذف</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        tableContainer.innerHTML = tableHTML;
    }

    /*
    =========================================
    تجهيز التعديل
    =========================================
    */
    window.prepareEditProduct = function (id) {
        const products = JSON.parse(localStorage.getItem('custom_products_list')) || [];
        const product = products.find(p => p.id === id);

        if (!product) return;

        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-stock').value = product.stock;
        document.getElementById('prod-caliber').value = product.caliber;
        document.getElementById('prod-type').value = product.type;
        document.getElementById('prod-main-image').value = product.mainImage;
        document.getElementById('prod-gallery').value = product.gallery.join('\n');
        document.getElementById('prod-desc').value = product.description;
        document.getElementById('prod-publish').checked = product.published;

        editModeProductId = id;
        submitBtn.innerText = 'حفظ التعديلات 💾';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /*
    =========================================
    حذف المنتج
    =========================================
    */
    window.deleteProductFromAdmin = function (id) {
        const confirmDelete = confirm('هل تريد حذف المنتج؟');
        if (!confirmDelete) return;

        let products = JSON.parse(localStorage.getItem('custom_products_list')) || [];
        products = products.filter(product => product.id !== id);

        localStorage.setItem('custom_products_list', JSON.stringify(products));
        renderAdminProductsTable();

        if (editModeProductId === id) {
            editModeProductId = null;
            form.reset();
            submitBtn.innerText = 'نشر المنتج ✨';
        }
        alert('تم حذف المنتج');
    };
});
