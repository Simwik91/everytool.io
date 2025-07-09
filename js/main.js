function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const closeMobileMenu = document.getElementById('close-mobile-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  
  function openMobileMenu() {
    mobileNav.classList.add('active');
    mobileBackdrop.classList.add('active');
    document.body.classList.add('menu-open');
  }
  
  function closeMobileMenu() {
    mobileNav.classList.remove('active');
    mobileBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.mobile-nav .dropdown-menu').forEach(menu => {
      menu.classList.remove('active');
      const toggle = menu.parentElement.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', openMobileMenu);
  }
  
  if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenu);
  }
  
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }
  
  const links = document.querySelectorAll('.mobile-nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!link.classList.contains('dropdown-toggle')) {
        closeMobileMenu();
      }
    });
  });

  const mobileDropdownToggles = document.querySelectorAll('.mobile-nav .dropdown-toggle');
  mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdownMenu = toggle.parentElement.querySelector('.dropdown-menu');
      const isOpen = dropdownMenu.classList.contains('active');
      document.querySelectorAll('.mobile-nav .dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
        const otherToggle = menu.parentElement.querySelector('.dropdown-toggle');
        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
      });
      dropdownMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
    });
  });
}

function initDesktopDropdown() {
  const dropdownToggles = document.querySelectorAll('.nav-menu .dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdownMenu = toggle.parentElement.querySelector('.dropdown-menu');
      const isOpen = dropdownMenu.classList.contains('active');
      document.querySelectorAll('.nav-menu .dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
        const otherToggle = menu.parentElement.querySelector('.dropdown-toggle');
        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
      });
      dropdownMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen);
    });
  });

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

function populateToolsDropdown(basePath) {
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
      const items = tools.map(tool => `
        <li>
          <a href="${tool.url}" class="dropdown-item" aria-label="${tool.description}" title="${tool.description}">
            <i class="${tool.icon}"></i> ${tool.category}
          </a>
        </li>
      `).join('');
      desktopDropdown.innerHTML = items;
      mobileDropdown.innerHTML = items;
    })
    .catch(error => {
      console.error('Error loading tools:', error);
      const desktopDropdown = document.querySelector('.nav-menu .dropdown-menu');
      const mobileDropdown = document.querySelector('.mobile-nav .dropdown-menu');
      if (desktopDropdown) desktopDropdown.innerHTML = '<li><a class="dropdown-item">Error loading tools</a></li>';
      if (mobileDropdown) mobileDropdown.innerHTML = '<li><a class="dropdown-item">Error loading tools</a></li>';
    });
}

function initCookieConsent() {
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
  // Determine base path based on current URL
  const isTestPage = window.location.pathname.includes('/test/');
  const basePath = isTestPage ? '/everytool.io' : '';

  // Fetch Header
  fetch(`${basePath}/includes/header.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch header: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      const header = document.querySelector('#main-header');
      if (header) {
        header.innerHTML = data;
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
  fetch(`${basePath}/includes/footer.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch footer: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      const footer = document.querySelector('#main-footer');
      if (footer) {
        footer.innerHTML = data;
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
