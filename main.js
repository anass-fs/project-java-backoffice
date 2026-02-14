document.addEventListener('DOMContentLoaded', function() {
    
    initAuthCheck();
    
    
    initTooltips();
    
    
    setupSidebar();

    
    setupSubmenus();

    
    window.addEventListener('resize', handleResize);

    
    function initAuthCheck() {
        if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html')) {
            Utils.requireAuth();
        }
    }
    
    
    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    
    function setupSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        
        let indicator = null; 

        if (!sidebarToggle || !sidebar) return;

        indicator = sidebar.querySelector('.sidebar-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'sidebar-indicator';
            sidebar.appendChild(indicator);
        }

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            updateIndicatorVisibility(sidebar, indicator, !sidebar.classList.contains('collapsed')); 
        });

        
        sidebar.addEventListener('mouseenter', () => {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('hovered');
                const activeLink = document.querySelector('.sidebar-menu a.active');
                if (activeLink) moveIndicatorTo(indicator, activeLink); 
            }
        });
        sidebar.addEventListener('mouseleave', () => {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('hovered');
                updateIndicatorVisibility(sidebar, indicator, false); 
            }
        });

        
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        menuLinks.forEach((link, idx) => {
            link.setAttribute('role', 'menuitem');
            link.setAttribute('tabindex', '0');

            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#' || this.getAttribute('href').endsWith('#')) {
                    e.preventDefault();
                }
                menuLinks.forEach(x => x.classList.remove('active'));
                this.classList.add('active');
                moveIndicatorTo(indicator, this); 
            });

            link.addEventListener('mouseenter', function() {
                if (!sidebar.classList.contains('collapsed')) {
                    moveIndicatorTo(indicator, this); 
                }
            });

            link.addEventListener('mouseleave', function() {
                if (!sidebar.classList.contains('collapsed')) {
                    const activeLink = document.querySelector('.sidebar-menu a.active');
                    if (activeLink) moveIndicatorTo(indicator, activeLink); 
                    else if (indicator) indicator.style.opacity = '0';
                }
            });
            
            link.addEventListener('keydown', (ev) => handleKeyboardNavigation(ev, link, menuLinks, idx, indicator)); 
            link.addEventListener('focus', () => {
                if (!sidebar.classList.contains('collapsed')) {
                    moveIndicatorTo(indicator, link); 
                }
            });
        });

        
        function setInitialSidebarState() {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
            updateIndicatorVisibility(sidebar, indicator, !sidebar.classList.contains('collapsed')); 
        }
        setInitialSidebarState();
        window.addEventListener('resize', setInitialSidebarState);

        highlightActiveLink(indicator); 
    }

    
    function updateIndicatorVisibility(sidebarElement, indicatorElement, isSidebarOpen) {
        if (!indicatorElement) return;
        if (isSidebarOpen) {
            const activeLink = sidebarElement.querySelector('.sidebar-menu a.active');
            if (activeLink) {
                moveIndicatorTo(indicatorElement, activeLink);
            } else {
                indicatorElement.style.opacity = '0';
            }
        } else {
            indicatorElement.style.opacity = '0';
        }
    }

    
    function moveIndicatorTo(indicatorElement, link) {
        if (!indicatorElement || !link) return;
        const top = link.offsetTop - 6;
        indicatorElement.style.top = `${top}px`;
        indicatorElement.style.height = `${link.offsetHeight + 12}px`;
        indicatorElement.style.opacity = '1';
        indicatorElement.style.transform = 'scaleX(1.02)';
        setTimeout(() => {
            indicatorElement.style.transform = '';
        }, 220);
    }

    
    function highlightActiveLink(indicatorElement) {
        const currentPage = window.location.pathname.split('/').pop();
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        menuLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
                const sidebar = document.getElementById('sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    moveIndicatorTo(indicatorElement, link);
                }
            }
        });
    }

    
    function handleKeyboardNavigation(ev, currentLink, allLinks, currentIndex, indicatorElement) {
        if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            const next = allLinks[(currentIndex + 1) % allLinks.length];
            if (next) next.focus();
        } else if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            const prev = allLinks[(currentIndex - 1 + allLinks.length) % allLinks.length];
            if (prev) prev.focus();
        } else if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            currentLink.click();
        }
    }

    
    function setupSubmenus() {
        const submenuParents = document.querySelectorAll('.sidebar-menu li.submenu');
        submenuParents.forEach(li => {
            const a = li.querySelector('> a');
            const submenu = li.querySelector('ul');
            if (a && submenu) {
                a.setAttribute('aria-haspopup', 'true');
                a.setAttribute('aria-expanded', 'false');
                submenu.setAttribute('role', 'menu');
                li.classList.remove('open');

                a.addEventListener('click', function (e) {
                    if (this.getAttribute('href') === '#' || this.getAttribute('href').endsWith('#')) {
                        e.preventDefault();
                    }
                    const isOpen = li.classList.toggle('open');
                    this.setAttribute('aria-expanded', String(isOpen));
                });
            }
        });
    }

    
    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        let indicatorElement = sidebar ? sidebar.querySelector('.sidebar-indicator') : null; 
        const activeLink = document.querySelector('.sidebar-menu a.active');
        if (activeLink && indicatorElement) {
            moveIndicatorTo(indicatorElement, activeLink);
        }
    }

    window.addEventListener('resize', () => {
        const sidebar = document.getElementById('sidebar');
        let indicatorElement = sidebar ? sidebar.querySelector('.sidebar-indicator') : null; 
        setInitialSidebarState();
        handleResize(indicatorElement); 
    });
});