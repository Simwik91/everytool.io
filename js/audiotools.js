
// Import FFmpeg from CDN
import { createFFmpeg, fetchFile } from 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.0/+esm';

// FFmpeg variables
let ffmpeg = null;
let inputFile = null;
let audioDuration = 0;

function initAudioConverter() {
  const elements = {
    dropZone: document.getElementById('dropZone'),
    audioInput: document.getElementById('audioInput'),
    dropZoneText: document.getElementById('dropZoneText'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    fileType: document.getElementById('fileType'),
    fileDuration: document.getElementById('fileDuration'),
    convertBtn: document.getElementById('convertBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressMessage: document.getElementById('progressMessage'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    resultContainer: document.getElementById('resultContainer'),
    downloadLink: document.getElementById('downloadLink'),
    convertError: document.getElementById('convert-error'),
    convertSuccess: document.getElementById('convert-success'),
    convertLoading: document.getElementById('convert-loading'),
    outputFormat: document.getElementById('outputFormat'),
    bitrate: document.getElementById('bitrate'),
    sampleRate: document.getElementById('sampleRate'),
    channels: document.getElementById('channels'),
    normalizeAudio: document.getElementById('normalize-audio'),
    removeSilence: document.getElementById('remove-silence'),
    cancelBtn: document.getElementById('cancelBtn'),
    enableTrim: document.getElementById('enable-trim'),
    trimContainer: document.getElementById('trim-container'),
    trimStart: document.getElementById('trim-start'),
    trimEnd: document.getElementById('trim-end'),
    durationWarning: document.getElementById('duration-warning'),
    trimToggle: document.getElementById('trim-toggle')
  };

  let cancelRequested = false;

  function showError(message) {
    if (elements.convertError) {
      elements.convertError.textContent = message;
      elements.convertError.style.display = 'block';
    }
  }

  function showSuccess(message) {
    if (elements.convertSuccess) {
      elements.convertSuccess.textContent = message;
      elements.convertSuccess.style.display = 'block';
    }
  }

  function hideMessages() {
    if (elements.convertError) elements.convertError.style.display = 'none';
    if (elements.convertSuccess) elements.convertSuccess.style.display = 'none';
  }

  function showLoading() {
    if (elements.convertLoading) elements.convertLoading.style.display = 'block';
  }

  function hideLoading() {
    if (elements.convertLoading) elements.convertLoading.style.display = 'none';
  }

  function updateProgress(percent, msg) {
    const percentValue = Math.min(100, Math.max(0, percent));
    if (elements.progressFill) elements.progressFill.style.width = `${percentValue}%`;
    if (elements.progressMessage) elements.progressMessage.textContent = msg;
    if (elements.progressPercent) elements.progressPercent.textContent = `${Math.round(percentValue)}%`;
  }

  function validateTrimTimes() {
    if (!elements.enableTrim.checked) return true;
    
    const startTime = parseFloat(elements.trimStart.value) || 0;
    const endTime = parseFloat(elements.trimEnd.value) || 0;
    
    if (endTime <= startTime) {
      elements.durationWarning.style.display = 'block';
      return false;
    }
    
    if (endTime > audioDuration) {
      elements.trimEnd.value = audioDuration.toFixed(1);
    }
    
    elements.durationWarning.style.display = 'none';
    return true;
  }

  async function processFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    hideMessages();
    showLoading();

    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac',
      'audio/flac', 'audio/x-m4a'
    ];
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      showError('Invalid file type. Please select a supported format (MP3, WAV, OGG, AAC, FLAC, or M4A).');
      hideLoading();
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showError('File size exceeds 50MB limit. Please select a smaller file.');
      hideLoading();
      return;
    }

    try {
      inputFile = file;
      elements.dropZoneText.innerHTML = `Ready to convert:<br><strong>${file.name}</strong>`;
      elements.fileInfo.style.display = 'block';
      elements.fileName.textContent = file.name;
      elements.fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      elements.fileType.textContent = file.type || 'Unknown';

      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.style.display = 'none';
      document.body.appendChild(audio);

      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          audioDuration = audio.duration;
          const minutes = Math.floor(audioDuration / 60);
          const seconds = Math.floor(audioDuration % 60);
          elements.fileDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          // Set end time to full duration by default
          elements.trimEnd.value = audioDuration.toFixed(1);
          
          document.body.removeChild(audio);
          URL.revokeObjectURL(audio.src);
          resolve();
        };
        audio.onerror = () => reject(new Error('Failed to load audio metadata'));
      });

      elements.convertBtn.disabled = false;
      showSuccess('Audio loaded successfully!');
    } catch (error) {
      showError('Error processing audio: ' + error.message);
      elements.convertBtn.disabled = true;
    } finally {
      hideLoading();
    }
  }

  async function convertAudio() {
    if (!inputFile) return;
    
    // Validate trim times
    if (!validateTrimTimes()) {
      showError('Please correct the trim times before converting');
      return;
    }

    hideMessages();
    showLoading();
    elements.progressContainer.style.display = 'block';
    elements.resultContainer.style.display = 'none';
    elements.convertBtn.disabled = true;
    cancelRequested = false;

    try {
      // Initialize FFmpeg
      await initFFmpeg();
      
      // Set up progress handler
      ffmpeg.setProgress(({ ratio }) => {
        const percent = Math.round(ratio * 100);
        updateProgress(percent, `Processing audio... ${percent}% complete`);
      });

      // Get settings from UI
      const outputFormat = elements.outputFormat.value;
      const bitrate = elements.bitrate.value;
      const sampleRate = elements.sampleRate.value;
      const channels = elements.channels.value;
      const normalizeAudio = elements.normalizeAudio.checked;
      const removeSilence = elements.removeSilence.checked;
      const enableTrim = elements.enableTrim.checked;
      const trimStart = parseFloat(elements.trimStart.value) || 0;
      const trimEnd = parseFloat(elements.trimEnd.value) || audioDuration;

      // Prepare input filename
      const inputExt = inputFile.name.split('.').pop() || 'mp3';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${outputFormat}`;

      // Write file to FFmpeg FS
      updateProgress(10, 'Loading audio file...');
      ffmpeg.FS('writeFile', inputName, await fetchFile(inputFile));

      // Build FFmpeg command
      const args = ['-i', inputName];

      // Handle trimming
      if (enableTrim) {
        args.push('-ss', trimStart.toString());
        args.push('-to', trimEnd.toString());
      }

      // Handle audio normalization
      if (normalizeAudio) {
        args.push('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11');
      }

      // Handle silence removal
      if (removeSilence) {
        args.push('-af', 'silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB:stop_periods=-1:stop_duration=1:stop_threshold=-50dB');
      }

      // Handle bitrate/quality
      if (outputFormat === 'mp3') {
        args.push('-b:a', `${bitrate}k`);
      } else if (outputFormat === 'aac') {
        args.push('-b:a', `${bitrate}k`);
      } else if (outputFormat === 'ogg') {
        args.push('-b:a', `${bitrate}k`);
      }

      // Handle sample rate
      if (sampleRate !== 'original') {
        args.push('-ar', sampleRate);
      }

      // Handle channels
      if (channels !== 'original') {
        args.push('-ac', channels);
      }

      // Add output filename
      args.push(outputName);

      // Run FFmpeg conversion
      updateProgress(20, 'Starting conversion...');
      await ffmpeg.run(...args);

      // Check if conversion was canceled
      if (cancelRequested) {
        updateProgress(0, 'Conversion canceled');
        showError('Conversion was canceled');
        return;
      }

      // Read output file
      updateProgress(90, 'Finalizing conversion...');
      const data = ffmpeg.FS('readFile', outputName);

      // Create download URL
      let mimeType;
      switch (outputFormat) {
        case 'mp3': mimeType = 'audio/mpeg'; break;
        case 'wav': mimeType = 'audio/wav'; break;
        case 'ogg': mimeType = 'audio/ogg'; break;
        case 'aac': mimeType = 'audio/aac'; break;
      }

      const audioUrl = URL.createObjectURL(new Blob([data.buffer], { type: mimeType }));
      elements.downloadLink.href = audioUrl;
      elements.downloadLink.download = `converted.${outputFormat}`;
      elements.resultContainer.style.display = 'block';

      // Clean up
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', outputName);

      // Show success
      updateProgress(100, 'Conversion complete!');
      showSuccess('Audio converted successfully!');
    } catch (error) {
      if (!cancelRequested) {
        console.error('Conversion error:', error);
        showError(`Conversion failed: ${error.message || 'Unknown error'}`);
        updateProgress(0, 'Conversion failed');
      }
    } finally {
      hideLoading();
      elements.convertBtn.disabled = false;
    }
  }

  function initializeConverter() {
    // Drag and Drop Setup
    elements.dropZone.addEventListener('click', () => elements.audioInput.click());
    elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('drag-over');
    });
    elements.dropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('drag-over');
    });
    elements.dropZone.addEventListener('dragleave', () => {
      elements.dropZone.classList.remove('drag-over');
    });
    elements.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        elements.audioInput.files = files;
        elements.audioInput.dispatchEvent(new Event('change'));
      }
    });

    // File Input
    elements.audioInput.addEventListener('change', processFile);

    // Convert Button
    elements.convertBtn.addEventListener('click', convertAudio);

    // Cancel Button
    elements.cancelBtn.addEventListener('click', () => {
      cancelRequested = true;
      if (ffmpeg) {
        ffmpeg.exit();
      }
    });

    // Keyboard accessibility for drag zone
    elements.dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        elements.audioInput.click();
      }
    });
    
    // Trimming toggle
    elements.enableTrim.addEventListener('change', () => {
      elements.trimContainer.style.display = elements.enableTrim.checked ? 'block' : 'none';
    });
    
    // Trim time validation
    elements.trimStart.addEventListener('input', validateTrimTimes);
    elements.trimEnd.addEventListener('input', validateTrimTimes);
    
    // Click handler for the entire trim toggle area
    elements.trimToggle.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
        elements.enableTrim.checked = !elements.enableTrim.checked;
        elements.trimContainer.style.display = elements.enableTrim.checked ? 'block' : 'none';
        elements.enableTrim.dispatchEvent(new Event('change'));
      }
    });
  }

  initializeConverter();
}

async function initFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
    });
  }
  
  if (!ffmpeg.isLoaded()) {
    document.getElementById('progressMessage').textContent = 'Loading FFmpeg engine...';
    await ffmpeg.load();
  }
}

document.addEventListener('DOMContentLoaded', initAudioConverter);
