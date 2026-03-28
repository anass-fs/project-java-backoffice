document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    
    const state = {
        data: [],
        orders: [],
        currentPage: 1,
        pageSize: parseInt(document.getElementById('clientsRowsPerPage')?.value, 10),
        searchQuery: '',
        filterUser: '',
        filterHasOrders: '',
        sortField: 'id',
        sortDir: 'asc'
    };

    
    function initialize() {
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.CLIENTS);
        state.orders = Utils.getData(CONFIG.STORAGE_KEYS.ORDERS);
        
        setupEventListeners();
        populateFilters();

        const headerMap = { 0: 'id', 1: 'name', 2: 'email', 3: 'phone', 4: 'address', 5: 'assignedUserName', 6: 'orders' };


        renderTable();
    }

    
    function setupEventListeners() {
        document.getElementById('addClientBtn').addEventListener('click', () => showClientModal());
        document.getElementById('clientSearch').addEventListener('input', Utils.debounce(handleSearch, 250));
        document.getElementById('clientFilterUser').addEventListener('change', handleFilterChange);
        document.getElementById('clientFilterHasOrders').addEventListener('change', handleFilterChange);
        document.getElementById('clientsRowsPerPage').addEventListener('change', handlePageSizeChange);
        document.getElementById('exportClientsCsvBtn').addEventListener('click', exportCsv);
        document.getElementById('clientForm').addEventListener('submit', handleFormSubmit);
    }
    
    
    function populateFilters() {
        const users = Utils.getData(CONFIG.STORAGE_KEYS.USERS) || [];
        const userSelect = document.getElementById('clientFilterUser');
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
        state.filterUser = document.getElementById('clientFilterUser').value;
        state.filterHasOrders = document.getElementById('clientFilterHasOrders').value;
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
        
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        paginatedData.forEach(client => {
            const clientOrders = state.orders.filter(o => o.clientId === client.id);
            fragment.appendChild(createClientRow(client, clientOrders.length));
        });
        tbody.appendChild(fragment);

        Utils.renderPagination('clientsPagination', state.currentPage, totalPages, totalItems, (page) => {
            state.currentPage = page;
            renderTable();
        });
    }

    
    function getFilteredAndSortedData() {
        let filtered = [...state.data];

        if (state.searchQuery) {
            filtered = filtered.filter(c =>
                (c.name || '').toLowerCase().includes(state.searchQuery) ||
                (c.email || '').toLowerCase().includes(state.searchQuery)
            );
        }
        if (state.filterUser) {
            filtered = filtered.filter(c => String(c.assignedUserId || '') === String(state.filterUser));
        }
        if (state.filterHasOrders) {
            if (state.filterHasOrders === 'has') {
                filtered = filtered.filter(c => state.orders.some(o => o.clientId === c.id));
            } else if (state.filterHasOrders === 'no') {
                filtered = filtered.filter(c => !state.orders.some(o => o.clientId === c.id));
            }
        }

        filtered.sort((a, b) => {
            const valA = a[state.sortField] || '';
            const valB = b[state.sortField] || '';
            const comparison = String(valA).localeCompare(String(valB));
            return state.sortDir === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }
    
    function paginate(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }

    
    function createClientRow(client, orderCount) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.address}</td>
            <td>${client.assignedUserName || '-'}</td>
            <td>${orderCount}</td>
            <td>
                <button class="btn btn-sm btn-secondary me-1" onclick="viewClient(${client.id})"><i class='fas fa-eye'></i></button>
                <button class="btn btn-sm btn-primary me-1" onclick="editClient(${client.id})"><i class='fas fa-edit'></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})"><i class='fas fa-trash'></i></button>
            </td>
        `;
        return row;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const clientId = document.getElementById('clientId').value;
        const email = document.getElementById('clientEmail').value;

        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Email invalide', 'error');
            return;
        }

        if (!clientId) {
            const emailExists = state.data.some(c => c.email === email);
            if (emailExists) {
                Utils.showNotification('Cet email est déjà utilisé', 'error');
                return;
            }
        }
        
        const clientData = {
            id: clientId ? parseInt(clientId) : Utils.generateId(state.data),
            name: document.getElementById('clientName').value,
            email: email,
            phone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value,
            assignedUserId: parseInt(document.getElementById('clientUserId').value) || null,
            assignedUserName: document.getElementById('clientUser').value
        };
        
        if (clientId) {
            const index = state.data.findIndex(c => c.id === parseInt(clientId));
            if (index !== -1) state.data[index] = clientData;
        } else {
            state.data.push(clientData);
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.CLIENTS, state.data);
        Utils.showNotification(clientId ? 'Client modifié avec succès' : 'Client ajouté avec succès');
        
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
    }
    
    
    function showClientModal(client = null) {
        const modal = new bootstrap.Modal(document.getElementById('clientModal'));
        document.getElementById('clientForm').reset();
        
        const currentUser = Utils.getCurrentUser();

        if (client) {
            document.getElementById('clientModalTitle').textContent = 'Modifier le client';
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientUser').value = client.assignedUserName || '';
            document.getElementById('clientUserId').value = client.assignedUserId || '';
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.phone;
            document.getElementById('clientAddress').value = client.address;
        } else {
            document.getElementById('clientModalTitle').textContent = 'Ajouter un client';
            document.getElementById('clientId').value = '';
            if (currentUser) {
                document.getElementById('clientUser').value = currentUser.name;
                document.getElementById('clientUserId').value = currentUser.id;
            }
        }
        
        modal.show();
    }

    function exportCsv() {
        const dataToExport = getFilteredAndSortedData();
        const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Utilisateur', 'NbCommandes'];
        const rows = dataToExport.map(c => [
            c.id, c.name, c.email, c.phone, c.address, c.assignedUserName,
            state.orders.filter(o => o.clientId === c.id).length
        ]);
        
        Utils.exportToCsv('clients.csv', headers, rows);
    }
    
    
    window.viewClient = (id) => {
        const client = state.data.find(c => c.id === id);
        if (!client) return;
        const clientOrders = state.orders.filter(o => o.clientId === client.id);
        const body = document.getElementById('clientDetailsBody');
        body.innerHTML = `
            <p><strong>ID:</strong> ${client.id}</p>
            <p><strong>Nom:</strong> ${client.name}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Utilisateur:</strong> ${client.assignedUserName || '-'}</p>
            <p><strong>Commandes (${clientOrders.length}):</strong></p>
            <ul>${clientOrders.map(o => `<li>#${o.id} - ${o.status} - ${Utils.formatPrice(o.total)}</li>`).join('') || 'Aucune'}</ul>
        `;
        new bootstrap.Modal(document.getElementById('clientDetailsModal')).show();
    };
    
    window.editClient = (id) => {
        const client = state.data.find(c => c.id === id);
        if (client) showClientModal(client);
    };

    window.deleteClient = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            state.data = state.data.filter(c => c.id !== id);
            Utils.saveData(CONFIG.STORAGE_KEYS.CLIENTS, state.data);
            Utils.showNotification('Client supprimé avec succès');
            renderTable();
        }
    };

    initialize();
});