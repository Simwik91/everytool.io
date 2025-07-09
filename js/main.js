// Mobile Menu Functionality
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
  
  function closeMobileMenuHandler() {
    mobileNav.classList.remove('active');
    mobileBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', openMobileMenu);
  }
  
  if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenuHandler);
  }
  
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenuHandler);
  }
  
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenuHandler);
  });
}

// Cookie Consent Functionality
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
  
  function checkCookieConsent() {
    const preferences = getCookiePreferences();
    if (!preferences || !preferences.hasOwnProperty('essential')) {
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
      saveCookiePreferences({
        essential: true,
        analytics: true,
        advertising: true
      });
      document.getElementById('cookie-consent').style.display = 'none';
    });
  }
  
  const rejectBtn = document.getElementById('reject-cookies');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      saveCookiePreferences({
        essential: true,
        analytics: false,
        advertising: false
      });
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
  
  checkCookieConsent();
}

// Initialize header and footer includes
document.addEventListener('DOMContentLoaded', () => {
  fetch('/includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-header').innerHTML = data;
      initMobileMenu();
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
