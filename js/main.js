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
    }
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
  fetch('/includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-header').innerHTML = data;
      initMobileMenu();
      initDesktopDropdown();
    })
    .catch(error => console.error('Error loading header:', error));
  
  fetch('/includes/footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-footer').innerHTML = data;
      initCookieConsent();
    })
    .catch(error => console.error('Error loading footer:', error));
});
