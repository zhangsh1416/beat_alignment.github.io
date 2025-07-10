// Highlight Extractor Web App JavaScript
class BeatAlignmentApp {
    constructor() {
        this.apiBaseUrl = localStorage.getItem('apiServerUrl') || 'http://localhost:8000';
        this.currentJobId = null;
        this.pollingInterval = null;
        
        this.initializeEventListeners();
        this.initializeDragAndDrop();
        this.initializeRangeSliders();
    }

    initializeEventListeners() {
        // File input
        document.getElementById('videoFile').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processVideo();
        });

        // Action buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelProcessing();
        });

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadResult();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareResult();
        });

        document.getElementById('newVideoBtn').addEventListener('click', () => {
            this.startNewVideo();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startNewVideo();
        });

        // Upload area click (only when no file is selected)
        document.getElementById('uploadArea').addEventListener('click', (e) => {
            // Don't trigger file selection if clicking on a button
            if (e.target.closest('button')) return;
            
            // Only trigger file selection if no file is currently selected
            if (!this.selectedFile) {
                document.getElementById('videoFile').click();
            }
        });

        // Parameter description toggles
        this.initializeParameterDescriptions();
    }

    initializeDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    initializeRangeSliders() {
        // Update range slider values in real-time
        const ranges = ['beatStrength', 'minShotLength', 'maxShotLength'];
        
        ranges.forEach(id => {
            const slider = document.getElementById(id);
            const valueDisplay = slider.parentNode.querySelector('.range-value');
            
            // Set initial value with proper formatting
            let initialValue = parseFloat(slider.value);
            let formattedInitial = initialValue.toFixed(2);
            if (id.includes('Length')) {
                formattedInitial += 's';
            }
            valueDisplay.textContent = formattedInitial;
            
            slider.addEventListener('input', () => {
                let value = parseFloat(slider.value);
                // Format to 2 decimal places for better precision
                let formattedValue = value.toFixed(2);
                if (id.includes('Length')) {
                    formattedValue += 's';
                }
                valueDisplay.textContent = formattedValue;
            });
        });
    }

    initializeParameterDescriptions() {
        // Add click listeners to parameter help icons
        const paramHelp = document.querySelectorAll('.param-help');
        
        paramHelp.forEach(helpIcon => {
            helpIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const paramName = helpIcon.getAttribute('data-param');
                const description = document.getElementById(`desc-${paramName}`);
                
                // Close all other descriptions
                document.querySelectorAll('.param-description').forEach(desc => {
                    if (desc !== description) {
                        desc.classList.remove('show');
                    }
                });
                
                // Toggle current description
                description.classList.toggle('show');
            });
        });

        // Close descriptions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.setting-group')) {
                document.querySelectorAll('.param-description').forEach(desc => {
                    desc.classList.remove('show');
                });
            }
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        if (!validTypes.includes(file.type)) {
            this.showError('Please select a valid video file (MP4, AVI, MOV, MKV)');
            return;
        }

        // Validate file size (500MB limit)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > maxSize) {
            this.showError('File size must be under 500MB. Please compress your video or select a shorter clip.');
            return;
        }

        // Update UI
        this.selectedFile = file;
        this.updateUploadAreaWithFile(file);
        document.getElementById('processBtn').disabled = false;
    }

    updateUploadAreaWithFile(file) {
        const uploadArea = document.getElementById('uploadArea');
        const fileSize = (file.size / (1024 * 1024)).toFixed(1); // MB
        
        uploadArea.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-file-video"></i>
            </div>
            <h3>${file.name}</h3>
            <p>File size: ${fileSize} MB</p>
            <p class="file-info">Ready to process with beat alignment</p>
            <button class="browse-btn" id="chooseNewFileBtn">
                <i class="fas fa-folder-open"></i> Choose Different File
            </button>
        `;
        
        // Add event listener to the new button
        const chooseNewFileBtn = document.getElementById('chooseNewFileBtn');
        chooseNewFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.chooseNewFile();
        });
    }

    chooseNewFile() {
        // Reset selected file and UI state
        this.selectedFile = null;
        document.getElementById('videoFile').value = '';
        document.getElementById('processBtn').disabled = true;
        
        // Reset upload area to initial state
        this.resetUploadArea();
        
        // Trigger file input click
        document.getElementById('videoFile').click();
    }

    resetUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Upload Your Video</h3>
            <p>Drag and drop your video file here, or click to browse</p>
            <p class="file-info">Supported formats: MP4, AVI, MOV, MKV (Max: 500MB)</p>
            <button class="browse-btn" onclick="document.getElementById('videoFile').click()">
                <i class="fas fa-folder-open"></i> Browse Files
            </button>
        `;
    }

    async processVideo() {
        if (!this.selectedFile) {
            this.showError('Please select a video file first');
            return;
        }

        // Collect parameters
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('enable_beat_alignment', document.getElementById('beatAlignment').checked);
        formData.append('beat_strength_threshold', document.getElementById('beatStrength').value);
        formData.append('min_shot_length', document.getElementById('minShotLength').value);
        formData.append('max_shot_length', document.getElementById('maxShotLength').value);
        formData.append('alignment_method', 'magnet');

        const apiKey = document.getElementById('apiKey').value.trim();
        if (apiKey) {
            formData.append('api_key', apiKey);
        }

        try {
            this.showSection('processing-section');
            this.updateProcessingMessage('Uploading video to server...');

            const response = await fetch(`${this.apiBaseUrl}/process-video`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            this.currentJobId = result.job_id;

            this.updateProcessingMessage('Video uploaded successfully. Starting AI analysis...');
            this.startPolling();

        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Failed to upload video: ${error.message}`);
        }
    }

    startPolling() {
        this.pollingInterval = setInterval(async () => {
            await this.checkJobStatus();
        }, 5000); // Poll every 5 seconds
    }

    async checkJobStatus() {
        if (!this.currentJobId) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/status/${this.currentJobId}`);
            
            if (!response.ok) {
                throw new Error(`Status check failed: ${response.status}`);
            }

            const status = await response.json();
            this.updateProcessingUI(status);

            if (status.status === 'completed') {
                this.clearPolling();
                this.showResults(status.result_filename);
            } else if (status.status === 'failed') {
                this.clearPolling();
                this.showError(status.error || 'Processing failed');
            }

        } catch (error) {
            console.error('Status check error:', error);
            this.clearPolling();
            this.showError(`Failed to check processing status: ${error.message}`);
        }
    }

    updateProcessingUI(status) {
        // Update message
        this.updateProcessingMessage(status.message);

        // Update progress based on actual processing stage
        let progress = 0;
        let activeStep = 1;

        switch (status.status) {
            case 'pending':
                progress = 5;
                activeStep = 1;
                break;
            case 'processing':
                // Map processing stages to progress and steps
                const message = status.message.toLowerCase();
                if (message.includes('scene') || message.includes('analyzing')) {
                    progress = 25;
                    activeStep = 1;
                } else if (message.includes('chorus') || message.includes('detecting')) {
                    progress = 50;
                    activeStep = 2;
                } else if (message.includes('beat') || message.includes('alignment')) {
                    progress = 75;
                    activeStep = 3;
                } else if (message.includes('video') || message.includes('generating') || message.includes('finalizing')) {
                    progress = 90;
                    activeStep = 4;
                } else {
                    // Default processing progress
                    progress = 30;
                    activeStep = 2;
                }
                break;
            case 'completed':
                progress = 100;
                activeStep = 4;
                break;
        }

        this.updateProgress(progress);
        this.updateActiveStep(activeStep);
    }

    updateProcessingMessage(message) {
        document.getElementById('processingMessage').textContent = message;
    }

    updateProgress(percent) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressPercent').textContent = `${Math.round(percent)}%`;
    }

    updateActiveStep(stepNumber) {
        // Remove active class from all steps
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        
        // Add active class to current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
    }

    async showResults(filename) {
        this.resultFilename = filename;
        
        // Set video source
        const videoElement = document.getElementById('resultVideo');
        videoElement.src = `${this.apiBaseUrl}/download/${filename}`;
        
        // Update video info when metadata loads
        videoElement.addEventListener('loadedmetadata', () => {
            const duration = Math.round(videoElement.duration);
            document.getElementById('videoDuration').textContent = `${duration}s`;
        });

        // Get file size (approximate)
        try {
            const response = await fetch(`${this.apiBaseUrl}/download/${filename}`, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                const sizeInMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(1);
                document.getElementById('videoSize').textContent = `${sizeInMB} MB`;
            }
        } catch (error) {
            console.log('Could not get file size:', error);
        }

        this.showSection('results-section');
    }

    async downloadResult() {
        if (!this.resultFilename) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/download/${this.resultFilename}`);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.resultFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            this.showError(`Download failed: ${error.message}`);
        }
    }

    shareResult() {
        if (!this.resultFilename) return;

        const shareData = {
            title: 'Highlight Extractor - AI Video Highlight',
            text: 'Check out this AI-generated video highlight with beat alignment!',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    }

    startNewVideo() {
        // Reset state
        this.selectedFile = null;
        this.currentJobId = null;
        this.resultFilename = null;
        this.clearPolling();

        // Reset UI
        document.getElementById('videoFile').value = '';
        document.getElementById('processBtn').disabled = true;
        
        // Reset upload area using the reusable method
        this.resetUploadArea();

        this.showSection('upload-section');
    }

    cancelProcessing() {
        this.clearPolling();
        this.showSection('upload-section');
    }

    clearPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionId).classList.add('active');
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.showSection('error-section');
    }

    // API Configuration
    saveApiConfig() {
        const url = document.getElementById('apiServerUrl').value.trim();
        if (url) {
            this.apiBaseUrl = url;
            localStorage.setItem('apiServerUrl', url);
            this.closeApiModal();
            alert('API configuration saved!');
        }
    }
}

// Global functions for modal and configuration
function showApiInfo() {
    document.getElementById('apiModal').style.display = 'block';
}

function closeApiModal() {
    document.getElementById('apiModal').style.display = 'none';
}

function saveApiConfig() {
    app.saveApiConfig();
}

// Initialize app when page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BeatAlignmentApp();
    // Make app globally accessible for onclick handlers
    window.app = app;
    
    // Check if API server is accessible
    fetch(app.apiBaseUrl)
        .then(response => {
            if (response.ok) {
                console.log('API server is accessible');
            }
        })
        .catch(error => {
            console.warn('API server not accessible:', error);
            setTimeout(() => {
                if (confirm('Cannot connect to API server. Would you like to configure the server URL?')) {
                    showApiInfo();
                }
            }, 1000);
        });
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('apiModal');
    if (event.target === modal) {
        closeApiModal();
    }
}