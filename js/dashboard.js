
document.addEventListener('DOMContentLoaded', function() {
    Utils.requireAuth();

    
    const state = {
        users: [],
        orders: [],
        products: [],
        categories: []
    };

    
    function initializeDashboard() {
        
        state.users = Utils.getData(CONFIG.STORAGE_KEYS.USERS);
        state.orders = Utils.getData(CONFIG.STORAGE_KEYS.ORDERS);
        state.products = Utils.getData(CONFIG.STORAGE_KEYS.PRODUCTS);
        state.categories = Utils.getData(CONFIG.STORAGE_KEYS.CATEGORIES);

        displayKPIs();
        renderCharts();
    }

    
    function displayKPIs() {
        const totalUsers = state.users.length;
        const totalOrders = state.orders.length;
        const totalRevenue = state.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const pendingOrders = state.orders.filter(o => o.status === 'En attente').length;

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = Utils.formatPrice(totalRevenue);
        document.getElementById('pendingOrders').textContent = pendingOrders;
    }

    
    function renderCharts() {
        createOrdersStatusChart();
        createMonthlySalesChart();
        createTopProductsChart();
        createCategoriesChart();
        createUsersEvolutionChart();
    }

    
    function createOrdersStatusChart() {
        const statusData = {};
        state.orders.forEach(order => {
            statusData[order.status] = (statusData[order.status] || 0) + 1;
        });

        new Chart(document.getElementById('ordersStatusChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { animateRotate: true, animateScale: true, duration: 1000 },
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 4,
                        padding: 10
                    }
                },
                cutout: '70%'
            }
        });
    }

    
    function createMonthlySalesChart() {
        const monthlySales = {};
        state.orders.forEach(order => {
            const month = new Date(order.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            monthlySales[month] = (monthlySales[month] || 0) + (order.total || 0);
        });

        new Chart(document.getElementById('monthlySalesChart'), {
            type: 'line',
            data: {
                labels: Object.keys(monthlySales),
                datasets: [{
                    label: 'Revenus',
                    data: Object.values(monthlySales),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1500, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 20 } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 4,
                        padding: 10,
                        callbacks: {
                            label: (context) => ` ${context.dataset.label}: ${Utils.formatPrice(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.08)', drawBorder: false },
                        ticks: { callback: (value) => Utils.formatPrice(value) }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    
    function createTopProductsChart() {
        const productSales = {};
        state.orders.forEach(order => {
            order.products.forEach(p => {
                const product = state.products.find(pr => pr.id === p.productId);
                if (product) {
                    productSales[product.name] = (productSales[product.name] || 0) + p.quantity;
                }
            });
        });

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        new Chart(document.getElementById('topProductsChart'), {
            type: 'bar',
            data: {
                labels: topProducts.map(p => p[0]),
                datasets: [{
                    label: 'Quantité vendue',
                    data: topProducts.map(p => p[1]),
                    backgroundColor: '#6A1B9A',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: { duration: 1200, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 4,
                        padding: 10
                    }
                },
                scales: {
                    x: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.08)', drawBorder: false }, ticks: { precision: 0 } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    
    function createCategoriesChart() {
        
        state.categories.forEach(category => {
            category.productCount = state.products.filter(p => p.category === category.name).length;
        });

        new Chart(document.getElementById('categoriesChart'), {
            type: 'pie',
            data: {
                labels: state.categories.map(c => c.name),
                datasets: [{
                    data: state.categories.map(c => c.productCount || 0),
                    backgroundColor: ['#FF6F00', '#00897B', '#D81B60', '#1E88E5', '#5E35B1'],
                    borderWidth: 1,
                    borderColor: '#fff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { animateRotate: true, animateScale: true, duration: 1000 },
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 4,
                        padding: 10,
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed}`
                        }
                    }
                }
            }
        });
    }

    
    function createUsersEvolutionChart() {
        const now = new Date();
        const monthsLabels = [];
        const userCounts = [];
        let cumulativeUsers = 0;
        
        
        const usersByMonth = {};
        state.users.forEach(user => {
            let userDate = user.createdAt ? new Date(user.createdAt) : new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
            const monthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
            usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
        });

        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            monthsLabels.push(monthLabel);
            
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            cumulativeUsers += (usersByMonth[monthKey] || 0);
            userCounts.push(cumulativeUsers);
        }
        
        new Chart(document.getElementById('usersChart'), {
            type: 'line',
            data: {
                labels: monthsLabels,
                datasets: [{
                    label: 'Total utilisateurs',
                    data: userCounts,
                    borderColor: '#03A9F4',
                    backgroundColor: 'rgba(3, 169, 244, 0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#03A9F4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#03A9F4',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1500, easing: 'easeOutQuart' },
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } } },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: 12, titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 12 },
                        borderColor: 'rgba(0, 0, 0, 0.1)', borderWidth: 1, cornerRadius: 4, displayColors: false,
                        callbacks: { label: (context) => ` Utilisateurs: ${context.parsed.y}` }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0, font: { size: 10 } }, grid: { color: 'rgba(0, 0, 0, 0.08)', drawBorder: false } },
                    x: { grid: { display: false, drawBorder: false }, ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }

    initializeDashboard();
});
