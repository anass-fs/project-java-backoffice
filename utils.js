const Utils = {
    
    generateId: function(array) {
        if (!array || array.length === 0) return 1;
        return Math.max(...array.map(item => item.id)) + 1;
    },

    
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    
   formatPrice: function(price) {
    return price.toFixed(2) + ' MAD';
},

    
    getData: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Erreur en lisant les données depuis localStorage (clé: ${key}):`, error);
            return [];
        }
    },

    
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Erreur en sauvegardant les données dans localStorage (clé: ${key}):`, error);
        }
    },

    
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(notification);

        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    
    getStatusBadge: function(status) {
        const badgeColors = {
            'Payée': 'success',
            'En attente': 'warning',
            'En cours': 'info',
            'Expédiée': 'primary',
            'Livrée': 'success',
            'Annulée': 'danger',
            'Admin': 'danger',
            'User': 'primary'
        };
        const color = badgeColors[status] || 'secondary';
        return `<span class="badge bg-${color}">${status}</span>`;
    },

    
    isAuthenticated: function() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER) !== null;
    },

    
    getCurrentUser: function() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    
    requireAuth: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },

    
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    
    renderPagination: function(containerId, currentPage, totalPages, totalItems, onPageClick) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Conteneur de pagination #${containerId} non trouvé.`);
            return;
        }
        container.innerHTML = '';

        if (totalPages <= 1) return; 

        const wrapper = document.createElement('nav');
        wrapper.setAttribute('aria-label', 'Page navigation');
        
        const list = document.createElement('ul');
        list.className = 'pagination justify-content-center';

        
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.textContent = 'Précédent';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) onPageClick(currentPage - 1);
        });
        prevItem.appendChild(prevLink);
        list.appendChild(prevItem);

        
        for (let p = 1; p <= totalPages; p++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${p === currentPage ? 'active' : ''}`;
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = p;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                onPageClick(p);
            });
            pageItem.appendChild(pageLink);
            list.appendChild(pageItem);
        }

        
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.textContent = 'Suivant';
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) onPageClick(currentPage + 1);
        });
        nextItem.appendChild(nextLink);
        list.appendChild(nextItem);
        
        wrapper.appendChild(list);
        container.appendChild(wrapper);
    },

    
    exportToCsv: function(filename, headers, dataRows) {
        if (!dataRows || dataRows.length === 0) {
            this.showNotification('Aucune donnée à exporter', 'error');
            return;
        }

        
        const csvContent = [
            headers.join(','),
            ...dataRows.map(row =>
                row.map(field => {
                    const str = String(field ?? '');
                    
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                }).join(',')
            )
        ].join('\n');

        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },


};