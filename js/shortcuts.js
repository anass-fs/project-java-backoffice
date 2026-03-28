const Shortcuts = {
   
    _quickSearchModalInstance: null,
    _shortcutsHelpPanelInstance: null,

    
    init: function() {
        this._registerGlobalKeyboardShortcuts();
    },
    
   
    _registerGlobalKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
           
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openQuickSearch();
            }
            
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.toggleShortcutsHelp();
            }
            
          
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (typeof ThemeManager !== 'undefined') { 
                    ThemeManager.toggle();
                }
            }
            
           
            if (e.key === 'Escape') {
                this._closeOpenModals();
            }
            
           
            if (e.altKey) {
                this._handleAltNumberNavigation(e);
            }
        });
    },

  
    openQuickSearch: function() {
        if (!this._quickSearchModalInstance) {
            this._quickSearchModalInstance = this._createQuickSearchModal();
            document.body.appendChild(this._quickSearchModalInstance);
            this._setupQuickSearchListeners(this._quickSearchModalInstance);
        }
        const bsModal = new bootstrap.Modal(this._quickSearchModalInstance);
        bsModal.show();
       
        setTimeout(() => {
            const searchInput = this._quickSearchModalInstance.querySelector('#quickSearchInput');
            if (searchInput) searchInput.focus();
        }, 300);
    },
    
   
    _createQuickSearchModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'quickSearchModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content quick-search-modal">
                    <div class="modal-body p-4">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" id="quickSearchInput" 
                                   placeholder="Rechercher... (produits, clients, commandes)">
                        </div>
                        <div id="quickSearchResults" class="mt-3"></div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    },

    
    _setupQuickSearchListeners: function(modalElement) {
        const searchInput = modalElement.querySelector('#quickSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this._performQuickSearch(e.target.value);
            }, 250));
        }
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            if (searchInput) searchInput.value = '';
            document.getElementById('quickSearchResults').innerHTML = '';
        });
    },
    
   
    _performQuickSearch: function(query) {
        const resultsContainer = document.getElementById('quickSearchResults');
        if (!resultsContainer) return;

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        
        const products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        products.forEach(product => {
            if ((product.name || '').toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'Produit', name: product.name, url: 'products.html', icon: 'fa-box'
                });
            }
        });
        
        
        const clients = Utils.getData(CONFIG.STORAGE_KEYS.CLIENTS);
        clients.forEach(client => {
            if ((client.name || '').toLowerCase().includes(lowerQuery) || 
                (client.email || '').toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'Client', name: client.name, url: 'clients.html', icon: 'fa-user'
                });
            }
        });
        
        
        const orders = Utils.getData(CONFIG.STORAGE_KEYS.ORDERS);
        orders.forEach(order => {
            if ((order.clientName || '').toLowerCase().includes(lowerQuery) || String(order.id).includes(lowerQuery)) {
                results.push({
                    type: 'Commande', name: `Commande #${order.id} - ${order.clientName}`, url: 'orders.html', icon: 'fa-shopping-cart'
                });
            }
        });
        
        this._displaySearchResults(results);
    },
    

    _displaySearchResults: function(results) {
        const container = document.getElementById('quickSearchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mt-3">Aucun résultat trouvé</p>';
            return;
        }
        
        let html = '<div class="list-group mt-3">';
       
        results.slice(0, 5).forEach(result => {
            html += `
                <a href="${result.url}" class="list-group-item list-group-item-action">
                    <i class="fas ${result.icon} me-2"></i>
                    <strong>${result.type}:</strong> ${result.name}
                </a>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

   
    _handleAltNumberNavigation: function(e) {
        const navigationMap = {
            '1': 'dashboard.html',
            '2': 'products.html',
            '3': 'clients.html',
            '4': 'orders.html',
            '5': 'invoices.html',
            '6': 'categories.html',
            '7': 'users.html' 
        };
        const targetUrl = navigationMap[e.key];
        if (targetUrl) {
            e.preventDefault();
            window.location.href = targetUrl;
        }
    },

    _closeOpenModals: function() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });
    },
    
   
    _createShortcutsHelpPanel: function() {
        const helpPanel = document.createElement('div');
        helpPanel.id = 'shortcutsHelp';
        helpPanel.className = 'shortcuts-help-panel';
        helpPanel.innerHTML = `
            <div class="shortcuts-help-content">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5><i class="fas fa-keyboard me-2"></i>Raccourcis clavier</h5>
                    <button class="btn btn-sm btn-link" onclick="Shortcuts.toggleShortcutsHelp()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>Recherche rapide</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>O</kbd>
                        <span>Afficher/Masquer cette aide</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>D</kbd>
                        <span>Basculer le thème</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>1</kbd>
                        <span>Dashboard</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>2</kbd>
                        <span>Produits</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>3</kbd>
                        <span>Clients</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>4</kbd>
                        <span>Commandes</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>5</kbd>
                        <span>Factures</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>6</kbd>
                        <span>Catégories</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>7</kbd>
                        <span>Utilisateurs</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Fermer les modales</span>
                    </div>
                </div>
            </div>
        `;
        return helpPanel;
    },
    
   
    toggleShortcutsHelp: function() {
        if (!this._shortcutsHelpPanelInstance) {
            this._shortcutsHelpPanelInstance = this._createShortcutsHelpPanel();
            document.body.appendChild(this._shortcutsHelpPanelInstance);
        }
        this._shortcutsHelpPanelInstance.classList.toggle('show');
    }
};


document.addEventListener('DOMContentLoaded', function() {
   
    if (typeof Utils !== 'undefined' && Utils.isAuthenticated()) {
        Shortcuts.init();
    }
});
