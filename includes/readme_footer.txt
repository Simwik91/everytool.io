Notes and Modifications
Path Adjustments: The href attributes in the footer links use absolute paths (e.g., /privacy, /terms, /gdpr) to ensure they work across all pages, regardless of the directory (e.g., /tools/barcodegenerator/index.html). The cookie settings link (#) remains unchanged as it relies on JavaScript to trigger the settings modal.
Footer ID: Added id="main-footer" to the <footer> element to serve as the placeholder for JavaScript insertion, consistent with the header implementation.
Scope: The footer is straightforward, containing only the bottom section with links and a copyright notice. The cookie consent banner and settings modal are not included, as they are separate and likely intended to remain in each index.html for now, given their dynamic behavior.
Dependencies and Implementation Guidance
To make this footer.html work when included via JavaScript (e.g., fetch('/includes/footer.html')), you need to ensure the following dependencies are handled:

External Resources:
The footer relies on the Poppins font and CSS variables defined in the <head> of the original code:

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
This must remain in the <head> of each index.html file, as it applies site-wide. No Font Awesome icons are used in the footer, so that dependency is not required here.

CSS Styles:
The footer relies on specific CSS styles from the original <style> tag. 
Relevant styles include:
:root variables (e.g., --primary, --light, --light-gray, --transition)
Global styles (e.g., *, body, .container)
Footer-specific styles (e.g., footer, .footer-bottom, .footer-links-row, .footer-bottom a, .footer-bottom p)
Responsive design media queries (e.g., @media (max-width: 768px) for .footer-links-row)

                                 
                          To avoid duplication, these styles should already be in /css/styles.css (as recommended for the header). Ensure the file includes:
css



:root {
  --primary: #4361ee;
  --light: #f8f9fa;
  --light-gray: #e9ecef;
  --transition: all 0.3s ease;
  /* Other variables as needed */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
  /* Other body styles */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

footer {
  background: linear-gradient(135deg, var(--light) 0%, #f0f4ff 100%);
  color: #000;
  padding: 60px 0 30px;
}

.footer-bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 30px;
  text-align: center;
}

.footer-bottom a {
  color: #000;
  text-decoration: none;
  transition: var(--transition);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 10px;
}

.footer-bottom a:hover, .footer-bottom a:focus {
  color: var(--primary);
  text-decoration: underline;
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.footer-links-row {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.footer-bottom p {
  color: #000;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-links-row {
    flex-direction: column;
    gap: 10px;
  }
}
Link this in each index.html:
html



<link rel="stylesheet" href="/css/styles.css">
JavaScript Functionality:
The footer includes a link (#open-settings-footer) that triggers the cookie settings modal via the openCookieSettings function in the original script. This function is part of the initCookieConsent block, which also manages the cookie consent banner and settings modal. Since the banner and modal are not part of the footer, you’ll need to ensure the JavaScript is included in each index.html.
Extract the relevant JavaScript to /js/main.js, including the initMobileMenu (from the header) and initCookieConsent functions. The footer-specific part is minimal:
javascript




function openCookieSettings() {
  const preferences = getCookiePreferences();
  const analyticsToggle = document.getElementById('analytics-toggle');
  const advertisingToggle = document.getElementById('advertising-toggle');
  if (analyticsToggle) analyticsToggle.checked = preferences.analytics;
  if (advertisingToggle) advertisingToggle.checked = preferences.advertising;
  const settings = document.getElementById('cookie-settings');
  if (settings) settings.style.display = 'flex';
}

const openSettingsFooter = document.getElementById('open-settings-footer');
if (openSettingsFooter) {
  openSettingsFooter.addEventListener('click', (e) => {
    e.preventDefault();
    openCookieSettings();
  });
}
However, since this depends on getCookiePreferences and the cookie settings modal, you’ll need the full initCookieConsent function in /js/main.js:
javascript




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
    save        
  const openSettingsFooter = document.getElementById('open-settings-footer');
  if (openSettingsFooter) {
    openSettingsFooter.addEventListener('click', (e) => {
      e.preventDefault();
      openCookieSettings();
    });
  }
  
  checkCookieConsent();
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-header').innerHTML = data;
      initMobileMenu(); // From header
    });
  fetch('/includes/footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-footer').innerHTML = data;
      initCookieConsent(); // Initialize after footer is loaded
    });
});
Include this script in each index.html:
html



<script src="/js/main.js"></script>
Placeholder in index.html:

  
Replace the original <footer> in each index.html with:

  <footer id="main-footer"></footer>
The fetch code in /js/main.js will load /includes/footer.html into this placeholder.


Cookie Consent Dependency:
The open-settings-footer link depends on the cookie settings modal (#cookie-settings) and its styles, which are currently in each index.html. For now, keep the modal and its styles in each index.html. If you later want to centralize the cookie consent banner and modal, you could move them to a separate /includes/cookie-consent.html, but this would require additional JavaScript to handle dynamic insertion.

Testing and Verification
To test this setup on GitHub Pages:

Create /includes/footer.html with the provided HTML.
Ensure /css/styles.css includes the footer-related styles and is linked in each index.html.
Update /js/main.js with the combined JavaScript for header and footer, including the fetch logic for both.
Update all index.html files to include the footer placeholder and script tags.
Push to your GitHub repository and verify on your GitHub Pages site (e.g., username.github.io/everytool.io).
Check that the footer links and cookie settings trigger work across pages (e.g., /, /tools/barcodegenerator, /blog/firstblogpost).
Verify the modal opens when clicking “Cookie Settings” in the footer.
