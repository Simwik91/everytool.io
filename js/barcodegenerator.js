
// Barcode Generator Functionality
function initBarcodeGenerator() {
  // Constants
  const elements = {
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    singleCanvas: document.getElementById('ean-canvas'),
    customCanvas: document.getElementById('custom-canvas'),
    downloadBtn: document.getElementById('download-btn'),
    downloadSvgBtn: document.getElementById('download-svg-btn'),
    customDownloadBtn: document.getElementById('custom-download'),
    customSvgDownloadBtn: document.getElementById('custom-svg-download'),
    singleLoading: document.getElementById('single-loading'),
    batchLoading: document.getElementById('batch-loading'),
    customLoading: document.getElementById('custom-loading'),
    batchProgress: document.getElementById('batch-progress'),
    singleError: document.getElementById('single-error'),
    batchError: document.getElementById('batch-error'),
    customError: document.getElementById('custom-error'),
    singleSuccess: document.getElementById('single-success'),
    batchSuccess: document.getElementById('batch-success'),
    customSuccess: document.getElementById('custom-success'),
    eanType: document.getElementById('ean-type'),
    eanInput: document.getElementById('ean-input'),
    batchEanType: document.getElementById('batch-ean-type'),
    batchAmount: document.getElementById('batch-amount'),
    customType: document.getElementById('custom-type'),
    customInput: document.getElementById('custom-input'),
    generateSingleBtn: document.getElementById('generate-single-btn'),
    generateBatchPngBtn: document.getElementById('generate-batch-png-btn'),
    generateBatchSvgBtn: document.getElementById('generate-batch-svg-btn'),
    generateCustomBtn: document.getElementById('generate-custom-btn'),
    barcodeShowColorOptions: document.getElementById('barcode-show-color-options'),
    barcodeColorOptionsContent: document.getElementById('barcode-color-options-content'),
    barcodeFgColor: document.getElementById('barcode-fg-color'),
    barcodeBgColor: document.getElementById('barcode-bg-color'),
    barcodeTransparentBg: document.getElementById('barcode-transparent-bg'),
    
    // Text display elements
    showTextDisplay: document.getElementById('show-text-display'),
    textDisplayFields: document.getElementById('text-display-fields'),
    customText: document.getElementById('custom-text'),
    textColor: document.getElementById('text-color'),
    textSize: document.getElementById('text-size'),
    textAlign: document.getElementById('text-align'),
    
    // Copy to clipboard elements
    copyContainer: document.getElementById('copy-container'),
    copyBtn: document.getElementById('copy-btn'),
    copySuccess: document.getElementById('copy-success')
  };

  const barcodeConfig = {
    ean13: { length: 12, regex: /^\d{12,13}$/, format: 'ean13' },
    ean8: { length: 7, regex: /^\d{7,8}$/, format: 'ean8' },
    upc: { length: 11, regex: /^\d{11,12}$/, format: 'UPC' },
    itf14: { length: 13, regex: /^\d{13,14}$/, format: 'itf14' },
    code128: { regex: /^[\w\s-]+$/, format: 'code128' },
    code39: { regex: /^[0-9A-Z\s-.%*+$/]+$/, format: 'code39' },
    codabar: { regex: /^[A-D][0-9-:$/.+]*[A-D]$/, format: 'codabar' },
    pharmacode: { min: 3, max: 131070, regex: /^\d+$/, format: 'pharmacode' }
  };

  function initTextDisplay() {
    // Toggle text display fields
    elements.showTextDisplay.addEventListener('change', function() {
      elements.textDisplayFields.style.display = this.checked ? 'block' : 'none';
    });
  }

  function initCopyToClipboard() {
    // Copy button functionality
    elements.copyBtn.addEventListener('click', function() {
      const barcodeValue = elements.singleCanvas.dataset.code || elements.customCanvas.dataset.code;
      if (!barcodeValue) return;
      
      navigator.clipboard.writeText(barcodeValue)
        .then(() => {
          elements.copySuccess.style.display = 'block';
          setTimeout(() => {
            elements.copySuccess.style.display = 'none';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = barcodeValue;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          elements.copySuccess.style.display = 'block';
          setTimeout(() => {
            elements.copySuccess.style.display = 'none';
          }, 2000);
        });
    });
  }

  function addTextToBarcode(barcodeCanvas, text, options) {
    return new Promise((resolve) => {
      // If text is not enabled, return the original canvas
      if (!options.enabled || !text) {
        resolve(barcodeCanvas);
        return;
      }
      
      const barcodeWidth = barcodeCanvas.width;
      const barcodeHeight = barcodeCanvas.height;
      
      // Create the final canvas with space for text
      const padding = 20;
      const fontSize = parseInt(options.size);
      const textHeight = fontSize * 2; // Approximate height for text
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = barcodeWidth;
      finalCanvas.height = barcodeHeight + textHeight + padding;
      const ctx = finalCanvas.getContext('2d');
      
      // Fill background if not transparent
      if (!options.transparent) {
        ctx.fillStyle = options.bgColor;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      }
      
      // Draw barcode
      ctx.drawImage(barcodeCanvas, 0, 0);
      
      // Draw text
      ctx.fillStyle = options.color;
      ctx.font = `${options.size} 'Poppins', sans-serif`;
      ctx.textAlign = options.align;
      
      // Calculate text position
      let textX;
      if (options.align === 'left') {
        textX = padding;
      } else if (options.align === 'right') {
        textX = finalCanvas.width - padding;
      } else {
        textX = finalCanvas.width / 2;
      }
      
      const textY = barcodeHeight + padding;
      
      // Draw text
      ctx.fillText(text, textX, textY);
      
      resolve(finalCanvas);
    });
  }

  async function generateBarcode({ canvas, code, type, errorElement, successElement, downloadButton, svgDownloadButton, loadingElement }) {
    const ctx = canvas.getContext('2d');
    hideElements();
    loadingElement.style.display = 'block';
    downloadButton.style.display = 'none';
    svgDownloadButton.style.display = 'none';
    canvas.style.display = 'none';
    elements.copyContainer.style.display = 'none';

    if (!validateInput(code, type)) {
      showError(errorElement, 'Invalid input format for selected barcode type');
      loadingElement.style.display = 'none';
      return;
    }

    const finalCode = code || generateRandomBarcode(type);
    const isPharmacode = type === 'pharmacode';
    // Fixed size as requested
    const width = 320;
    const height = 150;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dataset.code = finalCode;
    canvas.dataset.type = type;

    try {
      // Generate the barcode with custom colors and background
      JsBarcode(canvas, finalCode, {
        format: barcodeConfig[type].format,
        displayValue: true,
        width: 2,
        height: isPharmacode ? height * 0.5 : height * 0.7,
        lineColor: elements.barcodeFgColor.value,
        textColor: elements.barcodeFgColor.value,
        background: elements.barcodeTransparentBg.checked 
          ? 'transparent' 
          : elements.barcodeBgColor.value
      });

      // Add text if enabled
      if (elements.showTextDisplay.checked) {
        let displayText = elements.customText.value.trim();
        if (!displayText) {
          displayText = finalCode;
        }
        
        // Create text options
        const textOptions = {
          enabled: true,
          size: elements.textSize.value,
          color: elements.textColor.value,
          align: elements.textAlign.value,
          transparent: elements.barcodeTransparentBg.checked,
          bgColor: elements.barcodeBgColor.value
        };
        
        // Add text to the barcode
        const textCanvas = await addTextToBarcode(canvas, displayText, textOptions);
        
        // Display results
        canvas.width = textCanvas.width;
        canvas.height = textCanvas.height;
        const newCtx = canvas.getContext('2d');
        newCtx.drawImage(textCanvas, 0, 0);
      }

      downloadButton.style.display = 'inline-block';
      svgDownloadButton.style.display = 'inline-block';
      canvas.style.display = 'block';
      
      // Show the copy to clipboard section
      elements.copyContainer.style.display = 'block';
      
      showSuccess(successElement, 'Barcode generated successfully!');
    } catch (error) {
      showError(errorElement, `Failed to generate barcode: ${error.message}`);
    } finally {
      loadingElement.style.display = 'none';
    }
  }

  function downloadBarcode(canvas, errorElement) {
    try {
      const code = canvas.dataset.code;
      const link = document.createElement('a');
      link.download = `${sanitizeFilename(code)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      showError(errorElement, 'Error downloading barcode');
    }
  }

  function downloadSVG(canvas, errorElement) {
    try {
      const code = canvas.dataset.code;
      const type = canvas.dataset.type;
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("xmlns", svgNS);
      svg.setAttribute("version", "1.1");
      svg.setAttribute("width", canvas.width);
      svg.setAttribute("height", canvas.height);
      
      // Create SVG barcode
      JsBarcode(svg, code, {
        format: barcodeConfig[type].format,
        displayValue: true,
        width: 2,
        height: canvas.height * 0.7,
        lineColor: elements.barcodeFgColor.value,
        textColor: elements.barcodeFgColor.value,
        background: elements.barcodeTransparentBg.checked 
          ? 'transparent' 
          : elements.barcodeBgColor.value
      });

      // Serialize SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      if (!svgString.includes('xmlns')) {
        svgString = svgString.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // Create blob and download
      const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFilename(code)}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showError(errorElement, 'Error generating SVG: ' + error.message);
    }
  }

  async function generateBatchBarcodes(format) {
    const type = elements.batchEanType.value;
    const amount = parseInt(elements.batchAmount.value);
    // Fixed size as requested
    const width = 320;
    const height = 150;

    if (isNaN(amount) || amount < 1 || amount > 100) {
      showError(elements.batchError, 'Please enter a number between 1 and 100');
      return;
    }

    hideElements();
    elements.batchLoading.style.display = 'block';

    // Prepare text options if enabled
    let textOptions = null;
    if (elements.showTextDisplay.checked) {
      textOptions = {
        enabled: true,
        size: elements.textSize.value,
        color: elements.textColor.value,
        align: elements.textAlign.value,
        transparent: elements.barcodeTransparentBg.checked,
        bgColor: elements.barcodeBgColor.value
      };
    }

    try {
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      const isPharmacode = type === 'pharmacode';

      for (let i = 0; i < amount; i++) {
        elements.batchProgress.textContent = `Generating barcodes: ${i + 1}/${amount}`;
        const code = generateRandomBarcode(type);
        canvas.width = width;
        canvas.height = height;

        try {
          // Generate the barcode with customization
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (format === 'svg') {
            // Create SVG element
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("xmlns", svgNS);
            svg.setAttribute("version", "1.1");
            svg.setAttribute("width", width);
            svg.setAttribute("height", height);
            
            // Generate SVG barcode
            JsBarcode(svg, code, {
              format: barcodeConfig[type].format,
              displayValue: true,
              width: 2,
              height: isPharmacode ? height * 0.5 : height * 0.7,
              lineColor: elements.barcodeFgColor.value,
              textColor: elements.barcodeFgColor.value,
              background: elements.barcodeTransparentBg.checked 
                ? 'transparent' 
                : elements.barcodeBgColor.value
            });

            // Serialize SVG
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svg);
            if (!svgString.includes('xmlns')) {
              svgString = svgString.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            zip.file(`${sanitizeFilename(code)}.svg`, svgString);
          } else {
            // Generate PNG barcode
            JsBarcode(canvas, code, {
              format: barcodeConfig[type].format,
              displayValue: true,
              width: 2,
              height: isPharmacode ? height * 0.5 : height * 0.7,
              lineColor: elements.barcodeFgColor.value,
              textColor: elements.barcodeFgColor.value,
              background: elements.barcodeTransparentBg.checked 
                ? 'transparent' 
                : elements.barcodeBgColor.value
            });

            // Add text if enabled
            let finalCanvas = canvas;
            if (textOptions) {
              let displayText = elements.customText.value.trim();
              if (!displayText) {
                displayText = code;
              }
              
              // Add text to the barcode
              finalCanvas = await addTextToBarcode(canvas, displayText, textOptions);
            }

            const dataUrl = finalCanvas.toDataURL('image/png', 1.0);
            const imgData = dataUrl.replace(/^data:image\/png;base64,/, '');
            zip.file(`${sanitizeFilename(code)}.png`, imgData, { base64: true });
          }
        } catch (err) {
          console.warn(`Error generating barcode for code ${code}: ${err.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `batch-${sanitizeFilename(type)}-${format}.zip`);
      showSuccess(elements.batchSuccess, `Successfully generated and downloaded ${amount} barcodes as ${format.toUpperCase()}s!`);
    } catch (error) {
      showError(elements.batchError, `Error creating ZIP file: ${error.message}`);
    } finally {
      elements.batchLoading.style.display = 'none';
    }
  }

  function initializeBarcodeGenerator() {
    // Initialize text display UI
    initTextDisplay();
    
    // Initialize copy to clipboard functionality
    initCopyToClipboard();
    
    // Initialize color options toggle
    if (elements.barcodeShowColorOptions && elements.barcodeColorOptionsContent) {
      elements.barcodeShowColorOptions.addEventListener('change', function() {
        elements.barcodeColorOptionsContent.style.display = this.checked ? 'block' : 'none';
      });
      
      // Set initial visibility
      elements.barcodeColorOptionsContent.style.display = 
        elements.barcodeShowColorOptions.checked ? 'block' : 'none';
    }
    
    // Tabs functionality
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        elements.tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
      });
      tab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tab.click();
        }
      });
    });

    // Input events
    elements.eanInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') elements.generateSingleBtn.click();
    });

    elements.customInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') elements.generateCustomBtn.click();
    });

    // Button click handlers
    elements.generateSingleBtn.addEventListener('click', () => generateBarcode({
      canvas: elements.singleCanvas,
      code: elements.eanInput.value.trim(),
      type: elements.eanType.value,
      errorElement: elements.singleError,
      successElement: elements.singleSuccess,
      downloadButton: elements.downloadBtn,
      svgDownloadButton: elements.downloadSvgBtn,
      loadingElement: elements.singleLoading
    }));

    elements.downloadBtn.addEventListener('click', () => downloadBarcode(elements.singleCanvas, elements.singleError));
    elements.downloadSvgBtn.addEventListener('click', () => downloadSVG(elements.singleCanvas, elements.singleError));

    elements.generateBatchPngBtn.addEventListener('click', () => generateBatchBarcodes('png'));
    elements.generateBatchSvgBtn.addEventListener('click', () => generateBatchBarcodes('svg'));

    elements.generateCustomBtn.addEventListener('click', () => {
      const code = elements.customInput.value.trim();
      if (!code) {
        showError(elements.customError, 'Please enter custom text for the barcode');
        return;
      }
      generateBarcode({
        canvas: elements.customCanvas,
        code,
        type: elements.customType.value,
        errorElement: elements.customError,
        successElement: elements.customSuccess,
        downloadButton: elements.customDownloadBtn,
        svgDownloadButton: elements.customSvgDownloadBtn,
        loadingElement: elements.customLoading
      });
    });

    elements.customDownloadBtn.addEventListener('click', () => downloadBarcode(elements.customCanvas, elements.customError));
    elements.customSvgDownloadBtn.addEventListener('click', () => downloadSVG(elements.customCanvas, elements.customError));
  }
  
  // Helper functions
  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  function hideElements() {
    [elements.singleError, elements.batchError, elements.customError,
     elements.singleSuccess, elements.batchSuccess, elements.customSuccess]
      .forEach(el => el.style.display = 'none');
  }

  function calculateChecksum(code, type) {
    let sum = 0;
    if (type === 'ean8') {
      const weights = [3, 1, 3, 1, 3, 1, 3];
      for (let i = 0; i < code.length; i++) sum += parseInt(code[i]) * weights[i];
    } else if (type === 'upc' || type === 'itf14') {
      for (let i = 0; i < code.length; i++) sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
    } else {
      const weights = [1, 3];
      for (let i = 0; i < code.length; i++) sum += parseInt(code[i]) * weights[i % 2];
    }
    return (10 - (sum % 10)) % 10;
  }

  function generateRandomEAN(type) {
    const { length } = barcodeConfig[type];
    let base = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    return base + calculateChecksum(base, type);
  }

  function validateInput(code, type) {
    const config = barcodeConfig[type];
    if (!code) return true;
    if (type === 'pharmacode') {
      const num = parseInt(code);
      return !isNaN(num) && num >= config.min && num <= config.max;
    }
    return config.regex.test(code);
  }

  function generateRandomBarcode(type) {
    if (['ean13', 'ean8', 'upc', 'itf14'].includes(type)) {
      return generateRandomEAN(type);
    }
    switch (type) {
      case 'code128':
      case 'code39':
        return Math.random().toString(36).slice(2, 12).toUpperCase();
      case 'codabar':
        return `A${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}B`;
      case 'pharmacode':
        return Math.floor(Math.random() * (barcodeConfig.pharmacode.max - barcodeConfig.pharmacode.min + 1) + barcodeConfig.pharmacode.min).toString();
      default:
        return '123456';
    }
  }

  function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z00-9-]+/g, '_').slice(0, 50) || 'barcode';
  }
  
  initializeBarcodeGenerator();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initBarcodeGenerator();
});
