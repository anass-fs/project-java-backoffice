document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    
    const state = {
        data: [],
        orders: [],
        currentPage: 1,
        pageSize: parseInt(document.getElementById('invoicesRowsPerPage')?.value, 10),
        searchQuery: '',
        filterStatus: '',
        filterClient: '',
        sortField: 'id',
        sortDir: 'asc'
    };

    
    function initialize() {
        state.orders = Utils.getData(CONFIG.STORAGE_KEYS.ORDERS);
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.INVOICES);
        
        
        ensureInvoicesGenerated();

        setupEventListeners();
        populateFilters();

        const headerMap = { 0: 'id', 1: 'orderId', 2: 'clientName', 3: 'assignedUserName', 4: 'amount', 5: 'date', 6: 'status' };


        renderTable();
    }

    
    function ensureInvoicesGenerated() {
        if (state.data.length === 0 && state.orders.length > 0) {
            const generatedInvoices = state.orders.map(order => ({
                id: order.id,
                orderId: order.id,
                clientName: order.clientName,
                assignedUserId: order.assignedUserId || null,
                assignedUserName: order.assignedUserName || '',
                amount: order.total,
                date: order.date,
                status: 'Payée' 
            }));
            Utils.saveData(CONFIG.STORAGE_KEYS.INVOICES, generatedInvoices);
            state.data = generatedInvoices;
        }
    }

    
    function setupEventListeners() {
        document.getElementById('addInvoiceBtn').addEventListener('click', () => showInvoiceModal());
        document.getElementById('invoiceSearch').addEventListener('input', Utils.debounce(handleSearch, 250));
        document.getElementById('invoiceFilterStatus').addEventListener('change', handleFilterChange);
        document.getElementById('invoiceFilterClient').addEventListener('change', handleFilterChange);
        document.getElementById('invoicesRowsPerPage').addEventListener('change', handlePageSizeChange);
        document.getElementById('exportInvoicesCsvBtn').addEventListener('click', exportCsv);
        document.getElementById('invoiceForm').addEventListener('submit', handleFormSubmit);
        document.getElementById('invoiceOrder').addEventListener('change', handleOrderChange);
    }
    
    
    function populateFilters() {
        const clients = [...new Set(state.data.map(i => i.clientName).filter(Boolean))];
        
        const clientSelect = document.getElementById('invoiceFilterClient');
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Tous clients</option>';
            clients.forEach(c => clientSelect.innerHTML += `<option value="${c}">${c}</option>`);
        }
    }

    function handleSearch(e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        state.currentPage = 1;
        renderTable();
    }

    function handleFilterChange() {
        state.filterStatus = document.getElementById('invoiceFilterStatus').value;
        state.filterClient = document.getElementById('invoiceFilterClient').value;
        state.currentPage = 1;
        renderTable();
    }
    
    function handlePageSizeChange(e) {
        state.pageSize = parseInt(e.target.value, 10);
        state.currentPage = 1;
        renderTable();
    }
    
    
    function handleOrderChange() {
        const orderId = parseInt(this.value, 10);
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            document.getElementById('invoiceUser').value = order.assignedUserName || '';
            document.getElementById('invoiceUserId').value = order.assignedUserId || '';
        }
    }

    
    function renderTable() {
        const filteredData = getFilteredAndSortedData();
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / state.pageSize);
        state.currentPage = Math.min(state.currentPage, totalPages) || 1;

        const paginatedData = paginate(filteredData, state.currentPage, state.pageSize);
        
        const tbody = document.getElementById('invoicesTableBody');
        tbody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        paginatedData.forEach(invoice => fragment.appendChild(createInvoiceRow(invoice)));
        tbody.appendChild(fragment);

        
        Utils.renderPagination('invoicesPagination', state.currentPage, totalPages, totalItems, (page) => {
            state.currentPage = page;
            renderTable();
        });
    }

    function getFilteredAndSortedData() {
        let filtered = [...state.data];

        if (state.searchQuery) {
            const q = state.searchQuery;
            filtered = filtered.filter(i =>
                String(i.id).includes(q) ||
                String(i.orderId).includes(q) ||
                (i.clientName || '').toLowerCase().includes(q)
            );
        }
        if (state.filterStatus) filtered = filtered.filter(i => i.status === state.filterStatus);
        if (state.filterClient) filtered = filtered.filter(i => i.clientName === state.filterClient);

        filtered.sort((a, b) => {
            const valA = a[state.sortField] || '';
            const valB = b[state.sortField] || '';
            const numFields = ['id', 'amount', 'orderId'];
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

    function createInvoiceRow(invoice) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>#${invoice.orderId || invoice.id}</td>
            <td>${invoice.clientName}</td>
            <td>${invoice.assignedUserName || '-'}</td>
            <td>${Utils.formatPrice(invoice.amount)}</td>
            <td>${Utils.formatDate(invoice.date)}</td>
            <td>${Utils.getStatusBadge(invoice.status || 'Payée')}</td>
            <td>
                <button class="btn btn-sm btn-secondary me-1" onclick="viewInvoice(${invoice.id})"><i class='fas fa-eye'></i></button>
                <button class="btn btn-sm btn-primary me-1" onclick="editInvoice(${invoice.id})"><i class='fas fa-edit'></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})"><i class='fas fa-trash'></i></button>
            </td>
        `;
        return row;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const invoiceId = document.getElementById('invoiceId').value;
        const orderId = parseInt(document.getElementById('invoiceOrder').value);
        const order = state.orders.find(o => o.id === orderId);

        if (!order) {
            Utils.showNotification('Commande invalide', 'error');
            return;
        }

        const invoiceData = {
            id: invoiceId ? parseInt(invoiceId) : Utils.generateId(state.data),
            orderId: orderId,
            clientName: order.clientName,
            assignedUserId: parseInt(document.getElementById('invoiceUserId').value) || null,
            assignedUserName: document.getElementById('invoiceUser').value,
            amount: order.total,
            date: order.date,
            status: document.getElementById('invoiceStatus').value || 'Payée'
        };
        
        if (invoiceId) {
            const index = state.data.findIndex(i => i.id === parseInt(invoiceId));
            if (index !== -1) state.data[index] = invoiceData;
        } else {
            state.data.push(invoiceData);
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.INVOICES, state.data);
        Utils.showNotification(invoiceId ? 'Facture modifiée avec succès' : 'Facture ajoutée avec succès');
        
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById('invoiceModal')).hide();
    }
    
    function showInvoiceModal(invoice = null) {
        const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
        document.getElementById('invoiceForm').reset();
        
        const orderSelect = document.getElementById('invoiceOrder');
        orderSelect.innerHTML = '<option value="">Sélectionner une commande</option>';
        state.orders.forEach(order => {
            orderSelect.innerHTML += `<option value="${order.id}">Commande #${order.id} - ${order.clientName}</option>`;
        });

        const currentUser = Utils.getCurrentUser();

        if (invoice) {
            document.getElementById('invoiceModalTitle').textContent = 'Modifier la facture';
            document.getElementById('invoiceId').value = invoice.id;
            document.getElementById('invoiceOrder').value = invoice.orderId;
            document.getElementById('invoiceStatus').value = invoice.status || 'Payée';
            document.getElementById('invoiceUser').value = invoice.assignedUserName || '';
            document.getElementById('invoiceUserId').value = invoice.assignedUserId || '';
        } else {
            document.getElementById('invoiceModalTitle').textContent = 'Ajouter une facture';
            document.getElementById('invoiceId').value = '';
            if (currentUser) {
                document.getElementById('invoiceUser').value = currentUser.name;
                document.getElementById('invoiceUserId').value = currentUser.id;
            }
        }
        modal.show();
    }

    function exportCsv() {
        const dataToExport = getFilteredAndSortedData();
        const headers = ['ID', 'Commande ID', 'Client', 'Utilisateur', 'Montant', 'Date', 'Statut'];
        const rows = dataToExport.map(i => [
            i.id, i.orderId, i.clientName, i.assignedUserName, i.amount, i.date, i.status
        ]);
        Utils.exportToCsv('factures.csv', headers, rows);
    }
    
    
    window.viewInvoice = (id) => {
        const invoice = state.data.find(i => i.id === id);
        if (!invoice) return;
        const body = document.getElementById('invoiceDetailsBody');
        body.innerHTML = `
            <p><strong>Facture ID:</strong> ${invoice.id}</p>
            <p><strong>Commande ID:</strong> #${invoice.orderId}</p>
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Assigné à:</strong> ${invoice.assignedUserName || '-'}</p>
            <p><strong>Montant:</strong> ${Utils.formatPrice(invoice.amount)}</p>
            <p><strong>Statut:</strong> ${Utils.getStatusBadge(invoice.status)}</p>
            <p><strong>Date:</strong> ${Utils.formatDate(invoice.date)}</p>
        `;
        new bootstrap.Modal(document.getElementById('invoiceDetailsModal')).show();
    };
    
    window.editInvoice = (id) => {
        const invoice = state.data.find(i => i.id === id);
        if (invoice) showInvoiceModal(invoice);
    };

    window.deleteInvoice = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            state.data = state.data.filter(i => i.id !== id);
            Utils.saveData(CONFIG.STORAGE_KEYS.INVOICES, state.data);
            Utils.showNotification('Facture supprimée avec succès');
            renderTable();
        }
    };

    initialize();
});