
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Contact Form Functionality
  const form = document.getElementById('contact-form');
  const textarea = document.getElementById('message');
  const successMessage = document.getElementById('success-message');
  
  // Auto-resize textarea
  if (textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show success message
      if (successMessage) {
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Reset form after 5 seconds
      setTimeout(() => {
        form.reset();
        if (successMessage) {
          successMessage.style.display = 'none';
        }
        
        // Reset textarea height
        if (textarea) {
          textarea.style.height = 'auto';
        }
      }, 5000);
    });
  }
  
  // Check cookie consent status
  const preferences = localStorage.getItem('cookieConsent');
  if (!preferences) {
    document.getElementById('cookie-consent').style.display = 'block';
  }
});
