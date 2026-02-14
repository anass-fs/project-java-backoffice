
(function (window) {
  

  
  var CONFIG = {
    
    USERS: [
      { id: 1, email: 'admin@app.com', password: 'admin123', role: 'Admin', name: 'Administrateur', createdAt: new Date().toISOString(), createdById: null, createdByName: 'System' },
      { id: 2, email: 'user@app.com', password: 'user123', role: 'User', name: 'Utilisateur', createdAt: new Date().toISOString(), createdById: null, createdByName: 'System' }
    ],

    
    STORAGE_KEYS: {
      USERS: 'techstore_users',
      PRODUCTS: 'techstore_products',
      CLIENTS: 'techstore_clients',
      ORDERS: 'techstore_orders',
      INVOICES: 'techstore_invoices',
      CATEGORIES: 'techstore_categories',
      CURRENT_USER: 'techstore_current_user'
    },

    
    ORDER_STATUS: {
      PENDING: 'En attente',
      PROCESSING: 'En cours',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée'
    },

    
    initData: function () {
      
      const initializeCollection = (key, defaultData) => {
          const storedJSON = localStorage.getItem(key);
          let storedData = [];
          if (storedJSON) {
              try {
                  storedData = JSON.parse(storedJSON);
              } catch (e) {
                  console.error(`Erreur lors du parsing des données pour ${key} :`, e);
                  storedData = []; 
              }
          }
          if (!Array.isArray(storedData) || storedData.length === 0) {
              localStorage.setItem(key, JSON.stringify(defaultData));
              
          }
      };

      
      initializeCollection(this.STORAGE_KEYS.USERS, this.USERS);

      
      const defaultCategories = [
        { id: 1, name: 'Électronique' },
        { id: 2, name: 'Informatique' },
        { id: 3, name: 'Téléphonie' },
        { id: 4, name: 'Accessoires' }
      ];
      initializeCollection(this.STORAGE_KEYS.CATEGORIES, defaultCategories);

      
      const defaultProducts = [
        { id: 1, name: 'Laptop HP', price: 8999.99, stock: 15, category: 'Informatique', image: 'assets/images/laptop.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 2, name: 'iPhone 15', price: 12099.99, stock: 8, category: 'Téléphonie', image: 'assets/images/iphone.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 3, name: 'Samsung TV', price: 5999.99, stock: 12, category: 'Électronique', image: 'assets/images/tv.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 4, name: 'Casque Bluetooth', price: 799.99, stock: 25, category: 'Accessoires', image: 'assets/images/headphone.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 5, name: 'Casque', price: 799.99, stock: 25, category: 'Accessoires', image: 'assets/images/headphone.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 6, name: 'Clavier Mécanique', price: 549.99, stock: 30, category: 'Informatique', image: 'assets/images/keyboard.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 7, name: 'Souris Sans Fil', price: 210.99, stock: 45, category: 'Accessoires', image: 'assets/images/mouse.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 8, name: 'Webcam Full HD', price: 699.99, stock: 20, category: 'Informatique', image: 'assets/images/webcam.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 9, name: 'Enceinte Bluetooth', price: 929.99, stock: 18, category: 'Électronique', image: 'assets/images/speaker.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 10, name: 'Chargeur Rapide', price: 229.99, stock: 60, category: 'Accessoires', image: 'assets/images/charger.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 11, name: 'Moniteur 24"', price: 1339.99, stock: 22, category: 'Informatique', image: 'assets/images/monitor.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 12, name: 'Tablette 10"', price: 3291.99, stock: 16, category: 'Téléphonie', image: 'assets/images/tablet.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 13, name: 'Routeur Wi-Fi', price: 599.99, stock: 40, category: 'Électronique', image: 'assets/images/router.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 14, name: 'SSD 1TB', price: 449.99, stock: 35, category: 'Informatique', image: 'assets/images/ssd.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 15, name: 'Imprimante Jet', price: 1149.99, stock: 10, category: 'Électronique', image: 'assets/images/printer.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 16, name: 'Projecteur LCD', price: 899.99, stock: 6, category: 'Électronique', image: 'assets/images/projector.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 17, name: 'Drone 4K', price: 4919.99, stock: 4, category: 'Électronique', image: 'assets/images/drone.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 18, name: 'Smartwatch', price: 1990.99, stock: 28, category: 'Accessoires', image: 'assets/images/smartwatch.jpeg', userId: 1, userName: 'Administrateur' },
        { id: 19, name: 'Disque Externe 2TB', price: 890.99, stock: 50, category: 'Informatique', image: 'assets/images/external_hdd.jpeg', userId: 2, userName: 'Utilisateur' },
        { id: 20, name: 'Appareil Photo', price: 749.99, stock: 5, category: 'Électronique', image: 'assets/images/camera.svg', userId: 1, userName: 'Administrateur' }
      ];
      initializeCollection(this.STORAGE_KEYS.PRODUCTS, defaultProducts);

      
      const defaultClients = [
        { id: 1, name: 'anas zaari', email: 'anass@gmail.com', phone: '0123456789', address: '123 Rue de bir azaran', assignedUserId: 1, assignedUserName: 'Administrateur' },
        { id: 2, name: 'amin wahbi', email: 'amin@gmail.com', phone: '0987654321', address: '456 Avenue roudani', assignedUserId: 2, assignedUserName: 'Utilisateur' }
      ];
      initializeCollection(this.STORAGE_KEYS.CLIENTS, defaultClients);

      
      
      const defaultOrders = [
        {
          id: 1,
          clientId: 1,
          clientName: 'anas zaari',
          products: [{ productId: 1, quantity: 2, price: 8999.99 }], 
          total: (8999.99 * 2),
          status: this.ORDER_STATUS.PENDING,
          date: '2024-01-15',
          assignedUserId: 1, assignedUserName: 'Administrateur'
        },
        {
          id: 2,
          clientId: 2,
          clientName: 'amin wahbi',
          products: [{ productId: 2, quantity: 1, price: 12099.99 }], 
          total: 12099.99,
          status: this.ORDER_STATUS.DELIVERED,
          date: '2024-01-10',
          assignedUserId: 2, assignedUserName: 'Utilisateur'
        }
      ];
      initializeCollection(this.STORAGE_KEYS.ORDERS, defaultOrders);

      
      
      initializeCollection(this.STORAGE_KEYS.INVOICES, []);
    }
  };

  
  window.CONFIG = CONFIG;

  
  
  
  
})(window);
