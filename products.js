document.addEventListener('DOMContentLoaded', function() {
   
    Utils.requireAuth();

   
    const state = {
        data: [],
        currentPage: 1,
        pageSize: parseInt(document.getElementById('productsRowsPerPage')?.value, 10),
        searchQuery: '',
        filterCategory: '',
        filterUser: '',
        sortField: 'id',
        sortDir: 'asc'
    };

   
    function initialize() {
        
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        
        
        setupEventListeners();

        
        populateFilters();

        
        const headerMap = { 0: 'id', 1: 'name', 2: 'price', 3: 'stock', 4: 'category', 5: 'userName' };


        
        renderTable();
    }

    
    function setupEventListeners() {
        document.getElementById('addProductBtn').addEventListener('click', () => showProductModal());
        document.getElementById('productSearch').addEventListener('input', Utils.debounce(handleSearch, 250));
        document.getElementById('productFilterCategory').addEventListener('change', handleFilterChange);
        document.getElementById('productFilterUser').addEventListener('change', handleFilterChange);
        document.getElementById('productsRowsPerPage').addEventListener('change', handlePageSizeChange);
        document.getElementById('exportProductsCsvBtn').addEventListener('click', exportCsv);
        document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
    }
    
  
    function populateFilters() {
        const categories = Utils.getData(CONFIG.STORAGE_KEYS.CATEGORIES) || [];
        const categorySelect = document.getElementById('productFilterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Toutes catégories</option>';
            categories.forEach(c => categorySelect.innerHTML += `<option value="${c.name}">${c.name}</option>`);
        }

        const users = Utils.getData(CONFIG.STORAGE_KEYS.USERS) || [];
        const userSelect = document.getElementById('productFilterUser');
        if (userSelect) {
            userSelect.innerHTML = '<option value="">Tous utilisateurs</option>';
            users.forEach(u => userSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`);
        }
    }

  
    function handleSearch(e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        state.currentPage = 1;
        renderTable();
    }

    
    function handleFilterChange() {
        state.filterCategory = document.getElementById('productFilterCategory').value;
        state.filterUser = document.getElementById('productFilterUser').value;
        state.currentPage = 1;
        renderTable();
    }
    
  
    function handlePageSizeChange(e) {
        state.pageSize = parseInt(e.target.value, 10);
        state.currentPage = 1;
        renderTable();
    }

    
    function renderTable() {
        let filteredData = getFilteredAndSortedData();

        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / state.pageSize);
        state.currentPage = Math.min(state.currentPage, totalPages) || 1;

        const paginatedData = paginate(filteredData, state.currentPage, state.pageSize);
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = ''; 
        
    
        const fragment = document.createDocumentFragment();
        paginatedData.forEach(product => {
            fragment.appendChild(createProductRow(product));
        });
        tbody.appendChild(fragment);

        
        Utils.renderPagination('productsPagination', state.currentPage, totalPages, totalItems, (page) => {
            state.currentPage = page;
            renderTable();
        });
    }


    function getFilteredAndSortedData() {
        let filtered = [...state.data];

        
        if (state.searchQuery) {
            filtered = filtered.filter(p =>
                (p.name || '').toLowerCase().includes(state.searchQuery) ||
                (p.category || '').toLowerCase().includes(state.searchQuery) ||
                (p.userName || '').toLowerCase().includes(state.searchQuery)
            );
        }
        if (state.filterCategory) {
            filtered = filtered.filter(p => p.category === state.filterCategory);
        }
        if (state.filterUser) {
            filtered = filtered.filter(p => String(p.userId || '') === String(state.filterUser));
        }

        
        filtered.sort((a, b) => {
            const valA = a[state.sortField] || '';
            const valB = b[state.sortField] || '';
            
            const numFields = ['price', 'stock', 'id'];
            const comparison = numFields.includes(state.sortField)
                ? parseFloat(valA) - parseFloat(valB)
                : String(valA).localeCompare(String(valB));
            
            return state.sortDir === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }
    
    
    function paginate(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }

    function createProductRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td class="d-flex align-items-center">
                <img src="${getProductImage(product)}" alt="${product.name}" class="product-thumbnail me-2">
                <span>${product.name}</span>
            </td>
            <td>${Utils.formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>${product.userName || '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary me-1" onclick="viewProduct(${product.id})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        return row;
    }

  
    function getProductImage(product) {
        if (product.image && product.image.startsWith('data:')) {
            return product.image;
        }
        if (product.image) {
            return product.image; 
        }
        return 'assets/images/default.svg'; 
    }
    

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        
        const productData = {
            id: productId ? parseInt(productId) : Utils.generateId(products),
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value || 'assets/images/default.svg',
            userId: parseInt(document.getElementById('productUserId').value, 10) || null,
            userName: document.getElementById('productUser').value
        };

        if (productId) {
            
            const index = products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                
                if (!productData.image) {
                    productData.image = products[index].image;
                }
                products[index] = productData;
            }
        } else {
            
            products.push(productData);
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.PRODUCTS, products);
        Utils.showNotification(productId ? 'Produit modifié avec succès' : 'Produit ajouté avec succès');
        
        
        state.data = products;
        renderTable();

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    }
    
    
    function showProductModal(product = null) {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const form = document.getElementById('productForm');
        form.reset();

        
        const categorySelect = document.getElementById('productCategory');
        const categories = Utils.getData(CONFIG.STORAGE_KEYS.CATEGORIES);
        categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });

        
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('productImageFile').value = '';
        document.getElementById('productImage').value = '';
        
        const currentUser = Utils.getCurrentUser();

        if (product) {
            
            document.getElementById('productModalTitle').textContent = 'Modifier le produit';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category;
            
            document.getElementById('productUser').value = product.userName || '';
            document.getElementById('productUserId').value = product.userId || '';

            if (product.image) {
                document.getElementById('productImage').value = product.image;
                document.getElementById('previewImg').src = getProductImage(product);
                document.getElementById('imagePreview').style.display = 'block';
            }
        } else {
            
            document.getElementById('productModalTitle').textContent = 'Ajouter un produit';
            document.getElementById('productId').value = '';
            if (currentUser) {
                document.getElementById('productUser').value = currentUser.name;
                document.getElementById('productUserId').value = currentUser.id;
            }
        }
        
        modal.show();
    }

    
    function exportCsv() {
        const dataToExport = getFilteredAndSortedData();
        const headers = ['ID', 'Nom', 'Prix', 'Stock', 'Catégorie', 'Utilisateur'];
        const rows = dataToExport.map(p => [p.id, p.name, p.price, p.stock, p.category, p.userName]);
        
        Utils.exportToCsv('produits.csv', headers, rows);
    }
    
    
    window.viewProduct = (id) => {
        const product = state.data.find(p => p.id === id);
        if (!product) return;
        const body = document.getElementById('productDetailsBody');
        body.innerHTML = `
            <p><strong>ID:</strong> ${product.id}</p>
            <p><strong>Nom:</strong> ${product.name}</p>
            <p><strong>Prix:</strong> ${Utils.formatPrice(product.price)}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p><strong>Catégorie:</strong> ${product.category}</p>
            <p><strong>Utilisateur:</strong> ${product.userName || '-'}</p>
        `;
        new bootstrap.Modal(document.getElementById('productDetailsModal')).show();
    };
    
    window.editProduct = (id) => {
        const product = state.data.find(p => p.id === id);
        if (product) showProductModal(product);
    };

    window.deleteProduct = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            state.data = state.data.filter(p => p.id !== id);
            Utils.saveData(CONFIG.STORAGE_KEYS.PRODUCTS, state.data);
            Utils.showNotification('Produit supprimé avec succès');
            renderTable(); 
        }
    };
    
    window.handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { 
            Utils.showNotification("L'image est trop volumineuse (max 2MB).", 'error');
            return;
        }
        if (!file.type.startsWith('image/')) {
            Utils.showNotification("Le fichier n'est pas une image.", 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('productImage').value = e.target.result;
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    };

    window.removeImage = () => {
        document.getElementById('productImageFile').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('previewImg').src = '';
        document.getElementById('imagePreview').style.display = 'none';
    };

    initialize();
});