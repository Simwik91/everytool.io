Dependencies and Implementation Guidance
To make this header.html work when included via JavaScript (e.g., fetch('/includes/header.html')), you need to ensure the following dependencies are handled:

External Resources:
The header relies on Font Awesome icons and Poppins font, linked in the <head> of the original code:

<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

These must remain in the <head> of each index.html file, as they are not specific to the header but apply site-wide.
CSS Styles:

The header, mobile navigation, and backdrop rely on specific CSS styles embedded in the <style> tag of the original code. Relevant styles include:
:root variables (e.g., --primary, --border-radius)
Global styles (e.g., *, body, .container)
Header-specific styles (e.g., header, .header-container, .logo, .nav-container, .nav-menu, .nav-item, .nav-link, .mobile-menu-btn)
Mobile navigation styles (e.g., .mobile-backdrop, .mobile-nav, .mobile-nav-header, .close-mobile-menu, .mobile-nav-menu, .mobile-nav-item, .mobile-nav-link)
Responsive design media queries (e.g., @media (max-width: 992px), @media (min-width: 993px), @media (max-width: 768px), @media (max-width: 576px))

To avoid duplication, extract these styles into a separate /css/styles.css file and link it in each index.html:
<link rel="stylesheet" href="/css/styles.css">
Ensure the paths in styles.css are absolute (e.g., url(/images/background.jpg)) if you reference any assets.

JavaScript Functionality:
The mobile menu functionality is handled by the initMobileMenu function in the <script> tag. Extract this into /js/main.js:
javascript

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

document.addEventListener('DOMContentLoaded', initMobileMenu);

Include this script in each index.html:
<script src="/js/main.js"></script>

If you’re also including header.html via JavaScript, ensure the fetch code runs before initMobileMenu, or add a delay to ensure the header is loaded:
javascript

document.addEventListener('DOMContentLoaded', () => {
  fetch('/includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('#main-header').innerHTML = data;
      initMobileMenu(); // Initialize after header is loaded
    });
});

Placeholder in index.html:
Replace the original <header> in each index.html with:
<header id="main-header"></header>
Ensure the fetch code is included to load /includes/header.html.
