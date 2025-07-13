// main.js - Updated version with category grouping for mobile dropdown

function initMobileMenu() {
  console.log('Initializing mobile menu with fixes');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const closeMobileMenu = document.getElementById('close-mobile-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  
  function closeMobileNav() {
    mobileNav.classList.remove('active');
    mobileBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.mobile-nav .dropdown-menu').forEach(menu => {
      menu.classList.remove('active');
      const toggle = menu.parentElement.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
    
    // Show hamburger menu after closing
    if (mobileMenuToggle) mobileMenuToggle.style.display = 'block';
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNav.classList.add('active');
      mobileBackdrop.classList.add('active');
      document.body.classList.add('menu-open');
      
      // Hide hamburger menu while mobile nav is open
      mobileMenuToggle.style.display = 'none';
    });
  } else {
    console.warn('Mobile menu toggle not found');
  }
  
  if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileNav);
  }
  
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileNav);
  }
  
  const links = document.querySelectorAll('.mobile-nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!link.classList.contains('dropdown-toggle')) {
        closeMobileNav();
      }
    });
  });

  const mobileDropdownToggles = document.querySelectorAll('.mobile-nav .dropdown-toggle');
  mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdownMenu = toggle.parentElement.querySelector('.dropdown-menu');
      const isOpen = dropdownMenu.classList.contains('active');
      
      // Close other dropdowns before opening this one
      document.querySelectorAll('.mobile-nav .dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) {
          menu.classList.remove('active');
          const otherToggle = menu.parentElement.querySelector('.dropdown-toggle');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current dropdown
      dropdownMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function closeDropdownOnOutsideClick(e) {
        if (!dropdownMenu.contains(e.target) && !toggle.contains(e.target)) {
          dropdownMenu.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeDropdownOnOutsideClick);
        }
      });
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('active') && 
        !e.target.closest('#mobile-nav') && 
        !e.target.closest('.mobile-menu-btn')) {
      closeMobileNav();
    }
  });
}

function initDesktopDropdown() {
  console.log('Initializing desktop dropdown');
  const dropdownToggles = document.querySelectorAll('.nav-menu .dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdownMenu = toggle.parentElement.querySelector('.dropdown-menu');
      const isOpen = dropdownMenu.classList.contains('active');
      
      // Close other dropdowns before opening this one
      document.querySelectorAll('.nav-menu .dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) {
          menu.classList.remove('active');
          const otherToggle = menu.parentElement.querySelector('.dropdown-toggle');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current dropdown
      dropdownMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.nav-menu .dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
        const toggle = menu.parentElement.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

function populateToolsDropdown(basePath, retryCount = 0, maxRetries = 2) {
  console.log(`Fetching tools.json from ${basePath}/tools/tools.json (Attempt ${retryCount + 1}/${maxRetries + 1})`);
  fetch(`${basePath}/tools/tools.json`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch tools.json: ${response.status} ${response.statusText}`);
      return response.json();
    })
    .then(tools => {
      const desktopDropdown = document.querySelector('.nav-menu .dropdown-menu');
      const mobileDropdown = document.querySelector('.mobile-nav .dropdown-menu');
      
      if (!desktopDropdown || !mobileDropdown) {
        console.warn('Dropdown menus not found');
        return;
      }
      
      // Create desktop dropdown items
      let desktopItems = '';
      tools.forEach(tool => {
        desktopItems += `
          <li>
            <a href="${tool.url}" class="dropdown-item" aria-label="${tool.description}" title="${tool.description}">
              <i class="${tool.icon}"></i> ${tool.category}
            </a>
          </li>
        `;
      });
      desktopDropdown.innerHTML = desktopItems;
      
      // Create mobile dropdown items with category grouping
      let mobileItems = '';
      let currentCategory = null;
      
      tools.forEach(tool => {
        // Add category header if category changes
        if (tool.category !== currentCategory) {
          currentCategory = tool.category;
          mobileItems += `
            <div class="dropdown-category">${tool.category}</div>
          `;
        }
        
        mobileItems += `
          <li>
            <a href="${tool.url}" class="dropdown-item" aria-label="${tool.description}" title="${tool.description}">
              <i class="${tool.icon}"></i>
              ${tool.description}
            </a>
          </li>
        `;
      });
      
      mobileDropdown.innerHTML = mobileItems;
      
      console.log('Tools dropdown populated successfully with category grouping');
    })
    .catch(error => {
      console.error('Error loading tools:', error);
      if (retryCount < maxRetries) {
        console.log(`Retrying tools.json fetch (Attempt ${retryCount + 2})`);
        setTimeout(() => populateToolsDropdown(basePath, retryCount + 1, maxRetries), 1000);
      } else {
        const desktopDropdown = document.querySelector('.nav-menu .dropdown-menu .dropdown-error');
        const mobileDropdown = document.querySelector('.mobile-nav .dropdown-menu .dropdown-error');
        if (desktopDropdown) desktopDropdown.style.display = 'block';
        if (mobileDropdown) mobileDropdown.style.display = 'block';
      }
    });
}

function initCookieConsent() {
  console.log('Initializing cookie consent');
  const COOKIE_CONSENT_KEY = 'cookieConsent';
  
  function getCookiePreferences() {
    const preferences = localStorage.getItem(COOKIE_CONSENT_KEY);
    return preferences ? JSON.parse(preferences) : { essential: true, analytics: false, advertising: false };
  }
  
  function saveCookiePreferences(preferences) {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save cookie preferences:', e);
    }
  }
  
  function showCookieConsent() {
    const preferences = getCookiePreferences();
    if (!preferences.hasOwnProperty('essential')) {
      const consent = document.getElementById('cookie-consent');
      if (consent) consent.style.display = 'block';
    } else {
      const analyticsToggle = document.getElementById('analytics-toggle');
      const advertisingToggle = document.getElementById('advertising-toggle');
      if (analyticsToggle) analyticsToggle.checked = preferences.analytics;
      if (advertisingToggle) advertisingToggle.checked = preferences.advertising;
    }
  }
  
  function openCookieSettings() {
    const preferences = getCookiePreferences();
    const analyticsToggle = document.getElementById('analytics-toggle');
    const advertisingToggle = document.getElementById('advertising-toggle');
    if (analyticsToggle) analyticsToggle.checked = preferences.analytics;
    if (advertisingToggle) advertisingToggle.checked = preferences.advertising;
    const settings = document.getElementById('cookie-settings');
    if (settings) settings.style.display = 'flex';
  }
  
  function closeCookieSettings() {
    const settings = document.getElementById('cookie-settings');
    if (settings) settings.style.display = 'none';
  }
  
  const acceptBtn = document.getElementById('accept-cookies');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      saveCookiePreferences({ essential: true, analytics: true, advertising: true });
      document.getElementById('cookie-consent').style.display = 'none';
    });
  }
  
  const rejectBtn = document.getElementById('reject-cookies');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      saveCookiePreferences({ essential: true, analytics: false, advertising: false });
      document.getElementById('cookie-consent').style.display = 'none';
    });
  }
  
  const openSettingsBtn = document.getElementById('open-settings');
  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openCookieSettings);
  
  const closeSettingsBtn = document.querySelector('.close-settings');
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeCookieSettings);
  
  const saveSettingsBtn = document.getElementById('save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      saveCookiePreferences({
        essential: true,
        analytics: document.getElementById('analytics-toggle').checked,
        advertising: document.getElementById('advertising-toggle').checked
      });
      closeCookieSettings();
      document.getElementById('cookie-consent').style.display = 'none';
    });
  }
  
  const openSettingsFooter = document.getElementById('open-settings-footer');
  if (openSettingsFooter) {
    openSettingsFooter.addEventListener('click', (e) => {
      e.preventDefault();
      openCookieSettings();
    });
  }
  
  showCookieConsent();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js loaded successfully');
  // Determine base path based on current URL
  const isTestPage = window.location.pathname.includes('/test/');
  const basePath = "";
  console.log(`Base path set to: ${basePath}`);

  // Fetch Header
  console.log(`Fetching header from ${basePath}/includes/header.html`);
  fetch(`${basePath}/includes/header.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch header: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      const header = document.querySelector('#main-header');
      if (header) {
        header.innerHTML = data;
        console.log('Header loaded successfully');
        initMobileMenu();
        initDesktopDropdown();
        populateToolsDropdown(basePath);
      } else {
        console.warn('Header element not found');
        const headerError = document.querySelector('#main-header .error-message');
        if (headerError) headerError.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error loading header:', error);
      const headerError = document.querySelector('#main-header .error-message');
      if (headerError) headerError.style.display = 'block';
    });
  
  // Fetch Footer
  console.log(`Fetching footer from ${basePath}/includes/footer.html`);
  fetch(`${basePath}/includes/footer.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch footer: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      const footer = document.querySelector('#main-footer');
      if (footer) {
        footer.innerHTML = data;
        console.log('Footer loaded successfully');
        initCookieConsent();
      } else {
        console.warn('Footer element not found');
        const footerError = document.querySelector('#main-footer .error-message');
        if (footerError) footerError.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error loading footer:', error);
      const footerError = document.querySelector('#main-footer .error-message');
      if (footerError) footerError.style.display = 'block';
    });
});

// Fallback if main.js fails to load correctly
window.addEventListener('error', (event) => {
  if (event.filename.includes('main.js')) {
    console.error('Script error in main.js:', event.message, event.lineno, event.colno);
    const headerError = document.querySelector('#main-header .error-message');
    const footerError = document.querySelector('#main-footer .error-message');
    if (headerError) headerError.style.display = 'block';
    if (footerError) footerError.style.display = 'block';
  }
});
