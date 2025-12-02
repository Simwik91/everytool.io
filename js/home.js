
// Home page specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Search Functionality
  const initSearch = () => {
    const toolsData = [
      { name: "Barcode Generator", description: "Generate Barcodes for products or inventories.", url: "/tools/barcodegenerator", icon: "fas fa-barcode" },
      { name: "QR Generator", description: "Create QR codes for URLs, text, or contact details.", url: "/tools/qrgenerator", icon: "fas fa-qrcode" },
      { name: "Image Tools", description: "Edit, resize, or convert images with ease.", url: "/tools/imagetools", icon: "fas fa-image" },
      { name: "Video Tools", description: "Trim, convert, or compress videos quickly.", url: "/tools/videotools", icon: "fas fa-video" },
      { name: "Audio Tools", description: "Convert, trim and process audio files with advanced settings.", url: "/tools/audiotools", icon: "fas fa-music" },
      { name: "Text Tools", description: "Format, count, or generate text content.", url: "/tools/texttools", icon: "fas fa-font" },
      { name: "File Converter", description: "Convert files between various formats.", url: "/tools/fileconverter", icon: "fas fa-file-export" },
      { name: "PDF Tools", description: "Edit, merge, or compress PDF files.", url: "/tools/pdftools", icon: "fas fa-file-pdf" },
      { name: "Network Tools", description: "Check connectivity, speed, and diagnose network issues.", url: "/tools/networktools", icon: "fas fa-network-wired" }
    ];

    function renderTools(searchTerm = '') {
      const toolsGrid = document.getElementById('tools-grid');
      if (!toolsGrid) return;
      
      toolsGrid.innerHTML = '';

      const term = searchTerm.toLowerCase().trim();
      toolsData.forEach(tool => {
        if (!term || 
            tool.name.toLowerCase().includes(term) || 
            tool.description.toLowerCase().includes(term)) {
          const card = document.createElement('article');
          card.className = 'tool-card';
          card.innerHTML = `
            <div class="tool-icon">
              <i class="${tool.icon}"></i>
            </div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <a href="https://everytool.io${tool.url}" aria-label="Go to ${tool.name} tool">Go to Tool</a>
          `;
          toolsGrid.appendChild(card);
        }
      });
    }

    const searchInput = document.getElementById('tool-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderTools(searchInput.value);
      });
    }

    renderTools();
  };

  // Accessibility Functions
  const initAccessibility = () => {
    // Keyboard navigation for toggle switches
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!toggle.disabled) {
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change'));
          }
        }
      });
    });

    // Focus management for modals
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
      const focusableElements = settingsModal.querySelectorAll('button, input');
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      document.querySelector('.close-settings').addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          lastFocusable.focus();
        }
      });
      
      settingsModal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        } else if (e.key === 'Escape') {
          document.getElementById('close-settings').click();
        }
      });
    }
    
    // Focus styles for all interactive elements
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(el => {
      el.addEventListener('focus', () => {
        el.style.outline = '2px solid var(--primary)';
        el.style.outlineOffset = '2px';
      });
      
      el.addEventListener('blur', () => {
        el.style.outline = 'none';
      });
    });
  };

  // Initialize home page specific functions
  initSearch();
  initAccessibility();
});

// Wait for full page load
window.addEventListener('load', function() {
    initializeBMC();
});

function initializeBMC() {
    // Create the BMC button HTML with local image
    const bmcButtonHTML = `
        <a href="https://buymeacoffee.com/simwik91" target="_blank" class="super-bmc-btn">
            <img src="/images/bmc-new-btn-logo.svg" alt="Buy Me a Coffee" onerror="this.style.display='none'">
            Buy me a coffee
        </a>
    `;

    // Show popup immediately
    if (!sessionStorage.getItem('bmcPopupShown')) {
        const popup = document.getElementById('bmc-popup');
        const popupButtonContainer = document.getElementById('bmc-popup-button-container');
        
        if (popup && popupButtonContainer) {
            // Add button to popup
            popupButtonContainer.innerHTML = bmcButtonHTML;
            
            setTimeout(() => {
                popup.style.display = 'flex';
                sessionStorage.setItem('bmcPopupShown', 'true');
            }, 1500);
        }
    } else {
        // If popup was already shown, initialize floating button immediately
        initializeFloatingButton();
    }

    // Close button functionality
    const closeButton = document.getElementById('bmc-popup-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const popup = document.getElementById('bmc-popup');
            if (popup) {
                popup.style.display = 'none';
                initializeFloatingButton();
            }
        });
    }

    // Close popup when clicking outside
    const popup = document.getElementById('bmc-popup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.style.display = 'none';
                initializeFloatingButton();
            }
        });
    }
}

function initializeFloatingButton() {
    const floatingContainer = document.getElementById('bmc-floating');
    
    // Clear any existing content
    floatingContainer.innerHTML = '';
    
    // Create centered floating button with local image
    const floatingBtn = document.createElement('a');
    floatingBtn.href = 'https://buymeacoffee.com/simwik91';
    floatingBtn.target = '_blank';
    floatingBtn.className = 'centered-floating-bmc-btn';
    floatingBtn.innerHTML = `
        <img src="/images/bmc-new-btn-logo.svg" alt="Buy Me a Coffee" onerror="this.style.display='none'">
        Buy me a coffee
    `;
    floatingBtn.title = 'Support my work';
    
    floatingContainer.appendChild(floatingBtn);
    
    // Show the floating container
    floatingContainer.style.display = 'block';
    
    console.log('Centered Buy Me a Coffee button initialized successfully');
}
