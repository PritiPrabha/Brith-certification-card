// Birth Certificate Generator JavaScript

class BirthCertificateGenerator {
    constructor() {
        this.form = document.getElementById('certificateForm');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.certificatePreview = document.getElementById('certificatePreview');
        
        this.initializeEventListeners();
        this.setDefaultValues();
    }

    initializeEventListeners() {
        // Generate certificate button
        this.generateBtn.addEventListener('click', () => {
            this.generateCertificate();
        });

        // Download PDF button
        this.downloadBtn.addEventListener('click', () => {
            this.downloadPDF();
        });

        // Form reset
        this.form.addEventListener('reset', () => {
            this.clearPreview();
            this.downloadBtn.disabled = true;
        });

        // Real-time preview updates
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.isFormValid()) {
                    this.updatePreview();
                }
            });
        });

        // Auto-generate registration number
        document.getElementById('fullName').addEventListener('input', () => {
            this.generateRegistrationNumber();
        });

        // Auto-generate certificate number
        document.getElementById('dateOfBirth').addEventListener('change', () => {
            this.generateCertificateNumber();
        });
    }

    setDefaultValues() {
        // Set current date as registration date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('registrationDate').value = today;
        
        // Set issue date in preview
        document.getElementById('cert-issueDate').textContent = this.formatDate(today);
    }

    generateRegistrationNumber() {
        const fullName = document.getElementById('fullName').value;
        if (fullName.length >= 3) {
            const initials = fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const year = new Date().getFullYear();
            document.getElementById('registrationNumber').value = `${initials}${year}${randomNum}`;
        }
    }

    generateCertificateNumber() {
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        if (dateOfBirth) {
            const date = new Date(dateOfBirth);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            document.getElementById('certificateNumber').value = `BC${year}${month}${day}${randomNum}`;
        }
    }

    isFormValid() {
        const requiredFields = this.form.querySelectorAll('[required]');
        return Array.from(requiredFields).every(field => field.value.trim() !== '');
    }

    generateCertificate() {
        if (!this.isFormValid()) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        this.updatePreview();
        this.downloadBtn.disabled = false;
        this.showNotification('Certificate generated successfully!', 'success');
        
        // Smooth scroll to preview
        this.certificatePreview.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    updatePreview() {
        const formData = new FormData(this.form);
        
        // Update all certificate fields
        for (let [key, value] of formData.entries()) {
            const previewElement = document.getElementById(`cert-${key}`);
            if (previewElement) {
                if (key === 'dateOfBirth' || key === 'registrationDate') {
                    previewElement.textContent = this.formatDate(value);
                } else if (key === 'timeOfBirth') {
                    previewElement.textContent = this.formatTime(value);
                } else {
                    previewElement.textContent = value || '_________________';
                }
            }
        }

        // Update issuing authority in footer
        const issuingAuthority = document.getElementById('issuingAuthority').value;
        document.getElementById('cert-issuingAuthority').textContent = issuingAuthority;
    }

    clearPreview() {
        const previewFields = document.querySelectorAll('[id^="cert-"]');
        previewFields.forEach(field => {
            if (field.id === 'cert-issuingAuthority') {
                field.textContent = 'Department of Vital Records';
            } else if (field.id === 'cert-issueDate') {
                field.textContent = this.formatDate(new Date().toISOString().split('T')[0]);
            } else {
                field.textContent = '_________________';
            }
        });
    }

    formatDate(dateString) {
        if (!dateString) return '_________';
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    formatTime(timeString) {
        if (!timeString) return '_________';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    async downloadPDF() {
        try {
            // Show loading state
            const originalText = this.downloadBtn.textContent;
            this.downloadBtn.textContent = 'Generating PDF...';
            this.downloadBtn.disabled = true;

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            const certificate = document.querySelector('.certificate').cloneNode(true);
            
            // Create print document
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Birth Certificate</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            font-family: 'Times New Roman', serif;
                            background: white;
                        }
                        .certificate {
                            background: white;
                            border: 3px solid #2d3748;
                            border-radius: 10px;
                            padding: 30px;
                            font-family: 'Times New Roman', serif;
                            position: relative;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .certificate::before {
                            content: '';
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            right: 10px;
                            bottom: 10px;
                            border: 1px solid #cbd5e0;
                            border-radius: 5px;
                            pointer-events: none;
                        }
                        .certificate-header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .seal {
                            width: 60px;
                            height: 60px;
                            border: 3px solid #2d3748;
                            border-radius: 50%;
                            margin: 0 auto 15px;
                            background: #ffd700;
                            position: relative;
                        }
                        .seal::after {
                            content: '★';
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 24px;
                            color: #2d3748;
                        }
                        .certificate-header h1 {
                            font-size: 2rem;
                            color: #2d3748;
                            margin-bottom: 10px;
                            letter-spacing: 3px;
                            font-weight: bold;
                        }
                        .authority-info p {
                            font-size: 12px;
                            color: #4a5568;
                            margin: 2px 0;
                            letter-spacing: 1px;
                        }
                        .certificate-body {
                            margin-bottom: 40px;
                        }
                        .cert-field {
                            margin-bottom: 15px;
                            display: flex;
                            align-items: baseline;
                        }
                        .cert-row {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 15px;
                        }
                        .cert-field .label {
                            font-weight: bold;
                            color: #2d3748;
                            min-width: 120px;
                            font-size: 14px;
                        }
                        .cert-field .value {
                            flex: 1;
                            border-bottom: 1px solid #2d3748;
                            padding-bottom: 2px;
                            margin-left: 10px;
                            font-size: 14px;
                            min-height: 20px;
                            color: #1a202c;
                        }
                        .certificate-footer {
                            margin-top: 40px;
                        }
                        .signature-section {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                        }
                        .signature {
                            text-align: center;
                        }
                        .signature-line {
                            width: 150px;
                            height: 1px;
                            background: #2d3748;
                            margin-bottom: 5px;
                        }
                        .signature p {
                            font-size: 12px;
                            color: #4a5568;
                        }
                        .official-seal {
                            text-align: center;
                        }
                        .seal-placeholder {
                            width: 80px;
                            height: 80px;
                            border: 2px solid #2d3748;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            font-weight: bold;
                            color: #2d3748;
                            background: #ffd700;
                            margin: 0 auto;
                        }
                        .authority-footer {
                            text-align: center;
                            border-top: 1px solid #cbd5e0;
                            padding-top: 15px;
                        }
                        .authority-footer p {
                            font-size: 12px;
                            color: #4a5568;
                            margin: 2px 0;
                        }
                        .disclaimer {
                            font-style: italic;
                            opacity: 0.7;
                        }
                        @media print {
                            body { margin: 0; padding: 0; }
                            .certificate { border-radius: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${certificate.outerHTML}
                </body>
                </html>
            `);

            printWindow.document.close();
            
            // Wait for content to load then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                
                // Restore button state
                this.downloadBtn.textContent = originalText;
                this.downloadBtn.disabled = false;
                
                this.showNotification('Certificate ready for download/print!', 'success');
            }, 500);

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Error generating PDF. Please try again.', 'error');
            
            // Restore button state
            this.downloadBtn.textContent = 'Download PDF';
            this.downloadBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#4299e1'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to document
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BirthCertificateGenerator();
});

// Additional utility functions
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#f56565';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

// Auto-save form data to localStorage
function saveFormData() {
    const formData = new FormData(document.getElementById('certificateForm'));
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    localStorage.setItem('birthCertificateData', JSON.stringify(data));
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('birthCertificateData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

// Save form data on input change
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    
    const form = document.getElementById('certificateForm');
    form.addEventListener('input', saveFormData);
    form.addEventListener('change', saveFormData);
});