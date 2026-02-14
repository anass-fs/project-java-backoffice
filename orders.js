document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    
    const state = {
        data: [],
        currentPage: 1,
        pageSize: parseInt(document.getElementById('ordersRowsPerPage')?.value, 10),
        searchQuery: '',
        filterStatus: '',
        filterDate: '',
        sortField: 'id',
        sortDir: 'asc'
    };

    
    function initialize() {
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.ORDERS);
        
        setupEventListeners();
        populateFilters();

        const headerMap = { 0: 'id', 1: 'clientName', 2: 'assignedUserName', 3: 'products', 4: 'total', 5: 'status', 6: 'date' };


        renderTable();
    }

    
    function setupEventListeners() {
        document.getElementById('addOrderBtn').addEventListener('click', () => showOrderModal());
        document.getElementById('orderSearch').addEventListener('input', Utils.debounce(handleSearch, 250));
        document.getElementById('orderFilterStatus').addEventListener('change', handleFilterChange);
        document.getElementById('orderFilterDate').addEventListener('change', handleFilterChange);
        document.getElementById('ordersRowsPerPage').addEventListener('change', handlePageSizeChange);
        document.getElementById('exportOrdersCsvBtn').addEventListener('click', exportCsv);
        document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);
    }
    
    
    function populateFilters() {
        const statusSelect = document.getElementById('orderFilterStatus');
        if(statusSelect){
            statusSelect.innerHTML = '<option value="">Tous statuts</option>';
            Object.values(CONFIG.ORDER_STATUS).forEach(s => statusSelect.innerHTML += `<option value="${s}">${s}</option>`);
        }
    }

    function handleSearch(e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        state.currentPage = 1;
        renderTable();
    }

    function handleFilterChange() {
        state.filterStatus = document.getElementById('orderFilterStatus').value;
        state.filterDate = document.getElementById('orderFilterDate').value;
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
        
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        paginatedData.forEach(order => {
            fragment.appendChild(createOrderRow(order));
        });
        tbody.appendChild(fragment);

        Utils.renderPagination('ordersPagination', state.currentPage, totalPages, totalItems, (page) => {
            state.currentPage = page;
            renderTable();
        });
    }

    
    function getFilteredAndSortedData() {
        let filtered = [...state.data];

        if (state.searchQuery) {
            filtered = filtered.filter(o => 
                String(o.id).includes(state.searchQuery) ||
                (o.clientName || '').toLowerCase().includes(state.searchQuery)
            );
        }
        if (state.filterStatus) {
            filtered = filtered.filter(o => o.status === state.filterStatus);
        }
        if (state.filterDate) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let startDate;
            switch (state.filterDate) {
                case 'today':
                    startDate = today;
                    break;
                case 'this_week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start of week
                    break;
                case 'this_month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'this_year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    break;
            }

            if (startDate) {
                filtered = filtered.filter(o => new Date(o.date) >= startDate);
            }
        }

        filtered.sort((a, b) => {
            const valA = a[state.sortField] || '';
            const valB = b[state.sortField] || '';
            const numFields = ['id', 'total'];
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

    
    function createOrderRow(order) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.clientName}</td>
            <td>${order.assignedUserName || '-'}</td>
            <td>${order.products.length} produit(s)</td>
            <td>${Utils.formatPrice(order.total)}</td>
            <td>${Utils.getStatusBadge(order.status)}</td>
            <td>${Utils.formatDate(order.date)}</td>
            <td>
                <button class="btn btn-sm btn-secondary me-1" onclick="viewOrder(${order.id})"><i class='fas fa-eye'></i></button>
                <button class="btn btn-sm btn-primary me-1" onclick="editOrder(${order.id})"><i class='fas fa-edit'></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})"><i class='fas fa-trash'></i></button>
            </td>
        `;
        return row;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const orderId = document.getElementById('orderId').value;
        const clientId = parseInt(document.getElementById('orderClient').value);
        const clients = Utils.getData(CONFIG.STORAGE_KEYS.CLIENTS);
        const products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        const client = clients.find(c => c.id === clientId);
        
        const selectedProductId = document.getElementById('orderProduct').value;
        if (!selectedProductId) {
            Utils.showNotification('Veuillez sélectionner un produit', 'error');
            return;
        }
        const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
        if (!selectedProduct) {
            Utils.showNotification('Produit sélectionné invalide', 'error');
            return;
        }

        const orderProducts = [{ productId: selectedProduct.id, quantity: 1, price: selectedProduct.price }];
        const orderTotal = selectedProduct.price;
        
        const orderData = {
            id: orderId ? parseInt(orderId) : Utils.generateId(state.data),
            clientId: clientId,
            clientName: client.name,
            products: orderProducts,
            total: orderTotal,
            status: document.getElementById('orderStatus').value,
            assignedUserId: parseInt(document.getElementById('orderUserId').value) || null,
            assignedUserName: document.getElementById('orderUser').value,
            date: document.getElementById('orderDate').value
        };
        
        if (orderId) {
            const index = state.data.findIndex(o => o.id === parseInt(orderId));
            if (index !== -1) state.data[index] = { ...state.data[index], ...orderData };
        } else {
            state.data.push(orderData);
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.ORDERS, state.data);
        Utils.showNotification(orderId ? 'Commande modifiée avec succès' : 'Commande ajoutée avec succès');
        
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    }
    
    function showOrderModal(order = null) {
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        document.getElementById('orderForm').reset();

        const clients = Utils.getData(CONFIG.STORAGE_KEYS.CLIENTS);
        const clientSelect = document.getElementById('orderClient');
        clientSelect.innerHTML = '<option value="">Sélectionner un client</option>';
        clients.forEach(c => clientSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`);

        const products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        const productSelect = document.getElementById('orderProduct');
        productSelect.innerHTML = '<option value="">-- Sélectionner un produit --</option>'; // Mandatory empty option
        products.forEach(p => productSelect.innerHTML += `<option value="${p.id}" data-price="${p.price}">${p.name}</option>`);

        const statusSelect = document.getElementById('orderStatus');
        statusSelect.innerHTML = '';
        Object.values(CONFIG.ORDER_STATUS).forEach(s => statusSelect.innerHTML += `<option value="${s}">${s}</option>`);

        const currentUser = Utils.getCurrentUser();

        if (order) {
            document.getElementById('orderModalTitle').textContent = 'Modifier la commande';
            document.getElementById('orderId').value = order.id;
            document.getElementById('orderClient').value = order.clientId;
            document.getElementById('orderStatus').value = order.status;
            document.getElementById('orderDate').value = order.date;
            document.getElementById('orderUser').value = order.assignedUserName || '';
            document.getElementById('orderUserId').value = order.assignedUserId || '';
            if (order.products && order.products.length > 0) {
                document.getElementById('orderProduct').value = order.products[0].productId;
            }
        } else {
            document.getElementById('orderModalTitle').textContent = 'Ajouter une commande';
            document.getElementById('orderId').value = '';
            document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
            if (currentUser) {
                document.getElementById('orderUser').value = currentUser.name;
                document.getElementById('orderUserId').value = currentUser.id;
            }
        }
        
        modal.show();
    }

    function exportCsv() {
        const dataToExport = getFilteredAndSortedData();
        const headers = ['ID', 'Client', 'Utilisateur', 'Produits', 'Total', 'Statut', 'Date'];
        const rows = dataToExport.map(o => [
            o.id,
            o.clientName,
            o.assignedUserName || '',
            o.products.map(p => `${p.productId}x${p.quantity}`).join(';'),
            o.total,
            o.status,
            o.date
        ]);
        
        Utils.exportToCsv('commandes.csv', headers, rows);
    }
    
    
    window.viewOrder = (id) => {
        const order = state.data.find(o => o.id === id);
        if (!order) return;
        const body = document.getElementById('orderDetailsBody');
        body.innerHTML = `
            <p><strong>ID Commande:</strong> ${order.id}</p>
            <p><strong>Client:</strong> ${order.clientName}</p>
            <p><strong>Assigné à:</strong> ${order.assignedUserName || '-'}</p>
            <p><strong>Total:</strong> ${Utils.formatPrice(order.total)}</p>
            <p><strong>Statut:</strong> ${Utils.getStatusBadge(order.status)}</p>
            <p><strong>Date:</strong> ${Utils.formatDate(order.date)}</p>
            <hr>
            <h6>Produits</h6>
            <ul>
                ${order.products.map(p => `<li>ID ${p.productId} (x${p.quantity}) - ${Utils.formatPrice(p.price)}</li>`).join('')}
            </ul>
        `;
        new bootstrap.Modal(document.getElementById('orderDetailsModal')).show();
    };
    
    window.editOrder = (id) => {
        const order = state.data.find(o => o.id === id);
        if (order) showOrderModal(order);
    };

    window.deleteOrder = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            state.data = state.data.filter(o => o.id !== id);
            Utils.saveData(CONFIG.STORAGE_KEYS.ORDERS, state.data);
            Utils.showNotification('Commande supprimée avec succès');
            renderTable();
        }
    };

    initialize();
});