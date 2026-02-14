document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    
    
    ensureDefaultUsersExist();
    
    
    if (loginForm) {
        const loginBtn = document.getElementById('loginBtn');
        const originalBtnHTML = loginBtn.innerHTML; 

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            setLoginButtonLoadingState(true); 

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const selectedRoleInput = document.getElementById('role');
            
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value.trim();
            const selectedRole = selectedRoleInput ? selectedRoleInput.value : null;

            resetValidationStates(emailInput, passwordInput); 

            const users = Utils.getData(CONFIG.STORAGE_KEYS.USERS) || [];
            
            const user = users.find(u => 
                (u.email || '').trim().toLowerCase() === email && 
                (u.password || '') === password && 
                (!selectedRole || u.role === selectedRole)
            );

            
            setTimeout(() => {
                if (user) {
                    emailInput.classList.add('is-valid');
                    passwordInput.classList.add('is-valid');
                    
                    localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
                    
                    window.location.href = 'dashboard.html'; 
                } else {
                    
                    setLoginButtonLoadingState(false, originalBtnHTML);
                    emailInput.classList.add('is-invalid');
                    passwordInput.classList.add('is-invalid');
                    Utils.showNotification('Email, mot de passe ou rôle incorrect', 'error');
                }
            }, 500); 
        });
    }
    
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER); 
            window.location.href = 'index.html'; 
        });
    }
    
    
    setupRoleSelection();

    
    displayUserName();

    
    triggerLoginCardAnimations();

    
    focusEmailField();

    
    function ensureDefaultUsersExist() {
        let users = Utils.getData(CONFIG.STORAGE_KEYS.USERS);
        if (!Array.isArray(users) || users.length === 0) {
            if (window.CONFIG && typeof window.CONFIG.initData === 'function') {
                window.CONFIG.initData(); 
                console.log('Utilisateurs par défaut initialisés.');
            }
        }
    }

    
    function setLoginButtonLoadingState(isLoading, originalHTML = '') {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;

        loginBtn.disabled = isLoading;
        if (isLoading) {
            loginBtn.classList.add('btn-loading');
            loginBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Connexion...
            `;
        } else {
            loginBtn.classList.remove('btn-loading');
            loginBtn.innerHTML = originalHTML;
        }
    }

    
    function resetValidationStates(emailInput, passwordInput) {
        emailInput.classList.remove('is-invalid', 'is-valid');
        passwordInput.classList.remove('is-invalid', 'is-valid');
    }

    
    function setupRoleSelection() {
        const roleButtons = document.querySelectorAll('.role-btn');
        const roleInput = document.getElementById('role');
        
        if (!roleButtons.length || !roleInput) return;

        roleButtons.forEach(button => {
            button.addEventListener('click', function() {
                roleButtons.forEach(btn => btn.classList.remove('active')); 
                this.classList.add('active'); 
                roleInput.value = this.getAttribute('data-role'); 
            });
        });
    }

    
    function displayUserName() {
        const currentUser = Utils.getCurrentUser();
        const userNameElement = document.getElementById('userName');
        if (userNameElement && currentUser) {
            userNameElement.textContent = currentUser.name;
        }
    }

    
    function triggerLoginCardAnimations() {
        const loginCard = document.querySelector('.login-card');
        const box = document.querySelector('.box'); 
        const ctaBtn = document.querySelector('.login-card .btn-primary');

        if (loginCard) { 
            setTimeout(() => loginCard.classList.add('animated'), 120); 

            
            
            
            if (ctaBtn) {
                setTimeout(() => ctaBtn.classList.add('pulse'), 800); 
            }
        }
    }

    
    function focusEmailField() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 400);
        }
    }
});