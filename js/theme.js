const ThemeManager = {
   
    init: function() {
        const savedTheme = localStorage.getItem('techstore_theme') || 'light';
        this.setTheme(savedTheme);
        
        this.updateToggleButton(savedTheme);
    },
    
    
    
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('techstore_theme', theme);
        this.updateToggleButton(theme); 
    },
    
    
    toggle: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
       
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    },
    
    
    updateToggleButton: function(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun'; 
                    toggleBtn.setAttribute('title', 'Mode clair');
                } else {
                    icon.className = 'fas fa-moon'; 
                    toggleBtn.setAttribute('title', 'Mode sombre');
                }
            }
        }
    }
};


document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init(); 
    
 
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            ThemeManager.toggle();
        });
    }
});