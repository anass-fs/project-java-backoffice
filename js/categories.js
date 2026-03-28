document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    
    const state = {
        data: [],
        products: []
    };

    
    function initialize() {
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.CATEGORIES);
        state.products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        
        setupEventListeners();
        renderTable();
    }

    
    function setupEventListeners() {
        document.getElementById('addCategoryBtn').addEventListener('click', () => showCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', handleFormSubmit);
    }
    
    
    function renderTable() {
        
        state.data.forEach(category => {
            category.productCount = state.products.filter(p => p.category === category.name).length;
        });
        Utils.saveData(CONFIG.STORAGE_KEYS.CATEGORIES, state.data); 

        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        state.data.forEach(category => {
            fragment.appendChild(createCategoryRow(category));
        });
        tbody.appendChild(fragment);
    }

    
    function createCategoryRow(category) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td><span class="badge bg-primary">${category.productCount || 0}</span></td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editCategory(${category.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        return row;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const categoryId = document.getElementById('categoryId').value;
        const categoryName = document.getElementById('categoryName').value;
        
        
        if (!categoryId) {
            const nameExists = state.data.some(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (nameExists) {
                Utils.showNotification('Cette catégorie existe déjà', 'error');
                return;
            }
        }
        
        const categoryData = {
            id: categoryId ? parseInt(categoryId) : Utils.generateId(state.data),
            name: categoryName,
            productCount: 0 
        };
        
        if (categoryId) {
            
            const index = state.data.findIndex(c => c.id === parseInt(categoryId));
            if (index !== -1) {
                
                const oldName = state.data[index].name;
                state.data[index] = { ...state.data[index], ...categoryData };
                
                if (oldName !== categoryName) {
                    state.products.forEach(product => {
                        if (product.category === oldName) {
                            product.category = categoryName;
                        }
                    });
                    Utils.saveData(CONFIG.STORAGE_KEYS.PRODUCTS, state.products);
                }
            }
        } else {
            
            state.data.push(categoryData);
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.CATEGORIES, state.data);
        Utils.showNotification(categoryId ? 'Catégorie modifiée avec succès' : 'Catégorie ajoutée avec succès');
        
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
    }
    
    function showCategoryModal(category = null) {
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        document.getElementById('categoryForm').reset();
        
        if (category) {
            document.getElementById('categoryModalTitle').textContent = 'Modifier la catégorie';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
        } else {
            document.getElementById('categoryModalTitle').textContent = 'Ajouter une catégorie';
            document.getElementById('categoryId').value = '';
        }
        
        modal.show();
    }
    
    
    window.editCategory = (id) => {
        const category = state.data.find(c => c.id === id);
        if (category) showCategoryModal(category);
    };
    
    window.deleteCategory = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            const categoryToDelete = state.data.find(c => c.id === id);
            if (categoryToDelete && categoryToDelete.productCount > 0) {
                Utils.showNotification('Impossible de supprimer une catégorie qui contient des produits.', 'error');
                return;
            }
            state.data = state.data.filter(c => c.id !== id);
            Utils.saveData(CONFIG.STORAGE_KEYS.CATEGORIES, state.data);
            Utils.showNotification('Catégorie supprimée avec succès');
            renderTable();
        }
    };

    initialize();
});