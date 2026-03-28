document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    const currentUser = Utils.getCurrentUser();
 
    if (!currentUser || currentUser.role !== 'Admin') {
        Utils.showNotification('Accès refusé. Seuls les administrateurs peuvent gérer les utilisateurs.', 'error');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
        return;
    }

   
    const state = {
        data: [],
        currentPage: 1,
        pageSize: parseInt(document.getElementById('rowsPerPage')?.value, 10),
        searchQuery: '',
        filterRole: '',
        filterFrom: '',
        filterTo: '',
        sortField: 'id',
        sortDir: 'asc'
    };

    
    function initialize() {
        state.data = Utils.getData(CONFIG.STORAGE_KEYS.USERS);
        
        setupEventListeners();
        
        const headerMap = { 0: 'id', 1: 'name', 2: 'email', 3: 'role', 4: 'createdByName', 5: 'createdAt' };


        renderTable();
    }

    
    function setupEventListeners() {
        document.getElementById('addUserBtn').addEventListener('click', () => showUserModal());
        document.getElementById('rowsPerPage').addEventListener('change', handlePageSizeChange);
        document.getElementById('userSearch').addEventListener('input', Utils.debounce(handleSearch, 250));
        document.getElementById('filterRole').addEventListener('change', handleFilterChange);
        document.getElementById('filterFrom').addEventListener('change', handleDateFilterChange);
        document.getElementById('filterTo').addEventListener('change', handleDateFilterChange);
        document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
        document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
        document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
    }
    
    function handleSearch(e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        state.currentPage = 1;
        renderTable();
    }

    function handleFilterChange() {
        state.filterRole = document.getElementById('filterRole').value;
        state.currentPage = 1;
        renderTable();
    }

    function handleDateFilterChange() {
        state.filterFrom = document.getElementById('filterFrom').value;
        state.filterTo = document.getElementById('filterTo').value;
        state.currentPage = 1;
        renderTable();
    }
    
    function handlePageSizeChange(e) {
        state.pageSize = parseInt(e.target.value, 10);
        state.currentPage = 1;
        renderTable();
    }

   
    function clearFilters() {
        document.getElementById('userSearch').value = '';
        document.getElementById('filterRole').value = '';
        document.getElementById('filterFrom').value = '';
        document.getElementById('filterTo').value = '';
        
        state.searchQuery = '';
        state.filterRole = '';
        state.filterFrom = '';
        state.filterTo = '';
        state.currentPage = 1;
        renderTable();
    }
    
    
    function renderTable() {
        const filteredData = getFilteredAndSortedData();
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / state.pageSize);
        state.currentPage = Math.min(state.currentPage, totalPages) || 1;

        const paginatedData = paginate(filteredData, state.currentPage, state.pageSize);
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        paginatedData.forEach(user => fragment.appendChild(createUserRow(user)));
        tbody.appendChild(fragment);

        Utils.renderPagination('usersPaginationContainer', state.currentPage, totalPages, totalItems, (page) => {
            state.currentPage = page;
            renderTable();
        });
    }

    function getFilteredAndSortedData() {
        let filtered = [...state.data];

        if (state.searchQuery) {
            filtered = filtered.filter(u =>
                (u.name || '').toLowerCase().includes(state.searchQuery) ||
                (u.email || '').toLowerCase().includes(state.searchQuery)
            );
        }
        if (state.filterRole) filtered = filtered.filter(u => u.role === state.filterRole);
        if (state.filterFrom) filtered = filtered.filter(u => u.createdAt && new Date(u.createdAt) >= new Date(state.filterFrom));
        if (state.filterTo) {
            const toDate = new Date(state.filterTo);
            toDate.setHours(23, 59, 59, 999); 
            filtered = filtered.filter(u => u.createdAt && new Date(u.createdAt) <= toDate);
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

    function createUserRow(user) {
    const row = document.createElement('tr');
    
    let actions = `
        <button class="btn btn-sm btn-secondary" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
    `;
    
    if (user.role !== 'Admin') {
        actions += ` <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>`;
    }

    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${Utils.getStatusBadge(user.role)}</td>
        <td>${user.createdByName || '-'}</td>
        <td>${Utils.formatDate(user.createdAt)}</td>
        <td>${actions}</td>
    `;
    return row;
}
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const userId = document.getElementById('userId').value;
        const name = document.getElementById('userFullName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value;
        
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Email invalide', 'error');
            return;
        }
        
        const existingUser = state.data.find(u => u.email === email && u.id !== parseInt(userId));
        if (existingUser) {
            Utils.showNotification('Cet email est déjà utilisé', 'error');
            return;
        }
        
        if (userId) {
            const index = state.data.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                state.data[index].name = name;
                state.data[index].email = email;
                state.data[index].role = role;
            }
        } else {
            const defaultPassword = 'password123';
            state.data.push({
                id: Utils.generateId(state.data),
                name,
                email,
                password: defaultPassword,
                role,
                createdAt: new Date().toISOString(),
                createdById: parseInt(document.getElementById('userCreatedById').value) || null,
                createdByName: document.getElementById('userCreatedBy').value
            });
            Utils.showNotification(`Utilisateur créé. Mot de passe: ${defaultPassword}`, 'success');
        }
        
        Utils.saveData(CONFIG.STORAGE_KEYS.USERS, state.data);
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    }
    
    function showUserModal(user = null) {
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        document.getElementById('userForm').reset();
        
        const userRoleSelect = document.getElementById('userRole');
        
        if (user) {
            
            document.getElementById('userModalTitle').textContent = 'Modifier l\'Utilisateur';
            document.getElementById('userId').value = user.id;
            document.getElementById('userFullName').value = user.name || '';
            document.getElementById('userEmail').value = user.email;
            
            userRoleSelect.innerHTML = '<option value="Admin">Admin</option><option value="User">User</option>';
            userRoleSelect.value = user.role || 'User';
            userRoleSelect.disabled = (user.id === currentUser.id);

            document.getElementById('userCreatedBy').value = user.createdByName || '-';
            document.getElementById('userCreatedById').value = user.createdById || '';
        } else {
            
            document.getElementById('userModalTitle').textContent = 'Ajouter un Utilisateur';
            document.getElementById('userId').value = '';
            
            userRoleSelect.innerHTML = '<option value="User">User</option>';
            userRoleSelect.value = 'User';
            userRoleSelect.disabled = false;

            document.getElementById('userCreatedBy').value = currentUser.name;
            document.getElementById('userCreatedById').value = currentUser.id;
        }
        modal.show();
    }

    function exportCsv() {
        const dataToExport = getFilteredAndSortedData();
        const headers = ['ID', 'Nom', 'Email', 'Rôle', 'Créé par', 'Date de création'];
        const rows = dataToExport.map(u => [u.id, u.name, u.email, u.role, u.createdByName, u.createdAt]);
        Utils.exportToCsv('utilisateurs.csv', headers, rows);
    }
    
    
    window.viewUser = (id) => {
        const user = state.data.find(u => u.id === id);
        if (!user) return;
        
        document.getElementById('userDetailsBody').innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Nom:</strong> ${user.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rôle:</strong> ${Utils.getStatusBadge(user.role)}</p>
            <p><strong>Créé par:</strong> ${user.createdByName || '-'}</p>
            <p><strong>Créé le:</strong> ${Utils.formatDate(user.createdAt)}</p>
        `;
        new bootstrap.Modal(document.getElementById('userDetailsModal')).show();
    };
    
    window.editUser = (id) => {
    const user = state.data.find(u => u.id === id);
    if (user) showUserModal(user);
};

window.deleteUser = (id) => {
    const user = state.data.find(u => u.id === id);
    if (!user) return;

    if (user.id === currentUser.id) {
        Utils.showNotification('Vous ne pouvez pas supprimer votre propre compte.', 'error');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
        state.data = state.data.filter(u => u.id !== id);
        Utils.saveData(CONFIG.STORAGE_KEYS.USERS, state.data);
        renderTable();
        Utils.showNotification('Utilisateur supprimé avec succès.', 'success');
    }
};

    initialize();
});