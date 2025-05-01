// Firebase Configuration - Replace with your actual config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVya8MqR89hA3D5jVOgwKTI4zcHQ0ghtI",
  authDomain: "portfolio-2ed30.firebaseapp.com",
  projectId: "portfolio-2ed30",
  storageBucket: "portfolio-2ed30.firebasestorage.app",
  messagingSenderId: "192845449068",
  appId: "1:192845449068:web:1c3a66c7cbc6c8d05f9549",
  measurementId: "G-6PL7VVPEK5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// DOM Elements
const elements = {
    // Navigation
    menuToggle: document.getElementById('menuToggle'),
    navLinks: document.getElementById('navLinks'),
    homeBtn: document.getElementById('homeBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    destinationBtn: document.getElementById('destinationBtn'),
    contactBtn: document.getElementById('contactBtn'),
    journeyBtn: document.getElementById('journeyBtn'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    closeModal: document.querySelector('.close'),
    uploadSection: document.getElementById('uploadSection'),
    closeUpload: document.querySelector('.close-upload'),
    uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
    
    // Login Form
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    loginStatus: document.getElementById('loginStatus'),
    
    // Upload Form
    uploadForm: document.getElementById('uploadForm'),
    photoUpload: document.getElementById('photoUpload'),
    photoDescription: document.getElementById('photoDescription'),
    uploadSubmitBtn: document.getElementById('uploadSubmitBtn'),
    uploadStatus: document.getElementById('uploadStatus'),
    progressBar: document.getElementById('progressBar'),
    qualitySlider: document.getElementById('qualitySlider'),
    qualityValue: document.getElementById('qualityValue'),
    fileInfo: document.getElementById('fileInfo'),
    
    // Content
    contentSection: document.getElementById('contentSection'),
    journeySection: document.getElementById('journeySection'),
    publicPhotos: document.getElementById('publicPhotos'),
    
    // Parallax
    text: document.getElementById('text'),
    bird1: document.getElementById('bird1'),
    bird2: document.getElementById('bird2'),
    rocks: document.getElementById('rocks'),
    forest: document.getElementById('forest'),
    water: document.getElementById('water'),
    header: document.getElementById('header')
};

// App State
let currentUser = null;
let photos = [];

// Initialize Event Listeners
function initEventListeners() {
    // Menu Toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.navLinks.classList.toggle('active');
    });
    
    // Modal Controls
    elements.loginBtn.addEventListener('click', () => {
        elements.loginModal.style.display = 'block';
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.loginModal.style.display = 'none';
    });
    
    elements.uploadPhotoBtn.addEventListener('click', () => {
        elements.uploadSection.style.display = 'block';
    });
    
    elements.closeUpload.addEventListener('click', () => {
        elements.uploadSection.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) elements.loginModal.style.display = 'none';
        if (e.target === elements.uploadSection) elements.uploadSection.style.display = 'none';
    });
    
    // Navigation
    elements.homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>Welcome to My Portfolio</h2>
            <p>Explore my work and journey through this interactive showcase.</p>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>About Me</h2>
            <div class="about-content">
                <div class="profile-image"></div>
                <div class="about-text">
                    <p>Hi, I'm <span class="highlight">Soundarrajan</span>!</p>
                    <p>I'm currently pursuing a BSc in Computer Science at ES Arts and Science College.</p>
                    <p>I completed my schooling in 2023. In my free time, I enjoy playing games and listening to music.</p>
                </div>
            </div>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.destinationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>My Goals</h2>
            <div class="goals-content">
                <div class="goal-card">
                    <h3>Short-term</h3>
                    <p>Join an IT company and gain hands-on experience</p>
                </div>
                <div class="goal-card">
                    <h3>Long-term</h3>
                    <p>Start my own business and create positive impact</p>
                </div>
            </div>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>Contact Me</h2>
            <div class="social-links">
                <a href="https://facebook.com/share/1HENdXtkZx" target="_blank"><i class="fab fa-facebook"></i></a>
                <a href="mailto:soundarrajan2725@gmail.com"><i class="fas fa-envelope"></i></a>
                <a href="https://instagram.com/aakash_sr_25" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://github.com/soundarrajan25" target="_blank"><i class="fab fa-github"></i></a>
            </div>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.journeyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = '';
        elements.journeySection.style.display = 'block';
        scrollToContent();
    });
    
    // Quality Slider
    elements.qualitySlider.addEventListener('input', () => {
        elements.qualityValue.textContent = elements.qualitySlider.value;
    });
    
    // File Selection
    elements.photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.match('image.*')) {
            showStatus('Please select an image file (JPEG, PNG)', 'error', elements.uploadStatus);
            elements.uploadSubmitBtn.disabled = true;
            return;
        }
        
        // Validate file size (max 2MB before compression)
        if (file.size > 2 * 1024 * 1024) {
            showStatus('Image must be smaller than 2MB before compression', 'error', elements.uploadStatus);
            elements.uploadSubmitBtn.disabled = true;
            return;
        }
        
        // Show file info
        elements.fileInfo.innerHTML = `
            <p>Selected: ${file.name}</p>
            <p>Original size: ${(file.size / 1024).toFixed(2)} KB</p>
        `;
        elements.uploadSubmitBtn.disabled = false;
    });
    
    // Login Form
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value.trim();
        
        try {
            toggleButtonLoading(elements.loginSubmitBtn, true);
            showStatus('Logging in...', 'info', elements.loginStatus);
            
            await auth.signInWithEmailAndPassword(email, password);
            
            showStatus('Login successful!', 'success', elements.loginStatus);
            setTimeout(() => {
                elements.loginModal.style.display = 'none';
                elements.loginForm.reset();
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            showStatus(getAuthErrorMessage(error.code), 'error', elements.loginStatus);
        } finally {
            toggleButtonLoading(elements.loginSubmitBtn, false);
        }
    });
    
    // Upload Form
    elements.uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showStatus('Please login first', 'error', elements.uploadStatus);
            return;
        }

        const file = elements.photoUpload.files[0];
        const description = elements.photoDescription.value.trim();
        const quality = parseInt(elements.qualitySlider.value) / 100;

        if (!file || !description) {
            showStatus('Please select a file and enter a description', 'error', elements.uploadStatus);
            return;
        }

        try {
            // Disable form during upload
            toggleButtonLoading(elements.uploadSubmitBtn, true);
            elements.photoUpload.disabled = true;
            elements.photoDescription.disabled = true;
            elements.qualitySlider.disabled = true;
            
            showStatus('Compressing image...', 'info', elements.uploadStatus);
            elements.progressBar.style.width = '0%';

            // Step 1: Compress the image
            const compressedFile = await compressImage(file, quality);
            
            // Validate compressed size
            if (compressedFile.size > 500 * 1024) { // 500KB max
                showStatus('Compressed image is too large. Try lower quality.', 'error', elements.uploadStatus);
                toggleButtonLoading(elements.uploadSubmitBtn, false);
                return;
            }

            showStatus('Uploading to Firebase...', 'info', elements.uploadStatus);
            
            // Step 2: Upload to Firebase Storage
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `photo_${timestamp}.${fileExt}`;
            const storageRef = storage.ref(`journey/${currentUser.uid}/${fileName}`);
            
            // Upload with metadata
            const uploadTask = storageRef.put(compressedFile, {
                customMetadata: {
                    description: description,
                    originalName: file.name,
                    compressedSize: compressedFile.size.toString(),
                    quality: elements.qualitySlider.value
                }
            });

            // Progress tracking
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    elements.progressBar.style.width = `${progress}%`;
                },
                (error) => {
                    console.error("Upload error:", error);
                    showStatus(`Upload failed: ${error.message}`, 'error', elements.uploadStatus);
                    toggleButtonLoading(elements.uploadSubmitBtn, false);
                },
                async () => {
                    // Upload complete
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    showStatus("Upload successful!", "success", elements.uploadStatus);
                    
                    // Add to photos array
                    photos.unshift({
                        url: downloadURL,
                        description: description,
                        path: uploadTask.snapshot.ref.fullPath
                    });
                    
                    // Update gallery
                    displayPhotos();
                    
                    // Reset form
                    setTimeout(() => {
                        elements.uploadForm.reset();
                        elements.uploadSection.style.display = 'none';
                        elements.progressBar.style.width = '0%';
                        elements.fileInfo.innerHTML = '';
                        toggleButtonLoading(elements.uploadSubmitBtn, false);
                    }, 1500);
                }
            );
        } catch (error) {
            console.error("Error:", error);
            showStatus(`Error: ${error.message}`, 'error', elements.uploadStatus);
            toggleButtonLoading(elements.uploadSubmitBtn, false);
        }
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
        showStatus('Logged out successfully', 'success');
    });
    
    // Parallax effect
    window.addEventListener('scroll', () => {
        const value = window.scrollY;
        elements.text.style.top = `${50 + value * -0.1}%`;
        elements.bird1.style.top = `${value * -0.5}px`;
        elements.bird1.style.left = `${value * -1}px`;
        elements.bird2.style.top = `${value * -0.5}px`;
        elements.bird2.style.left = `${value * 1}px`;
        elements.header.style.background = value > 100 ? 'rgba(255,255,255,0.9)' : 'transparent';
    });
}

// Image Compression
function compressImage(file, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 1200px)
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1200;
                
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with specified quality
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', quality);
            };
        };
    });
}

// Display Photos in Gallery
function displayPhotos() {
    if (photos.length === 0) {
        elements.publicPhotos.innerHTML = '<p class="no-photos">No photos yet. Upload some to start your journey!</p>';
        return;
    }
    
    elements.publicPhotos.innerHTML = '';
    
    photos.forEach(photo => {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-box';
        photoElement.innerHTML = `
            <div class="photo-image" style="background-image: url('${photo.url}')"></div>
            <div class="photo-info">
                <p>${photo.description}</p>
                <button class="delete-btn" data-path="${photo.path}">Delete</button>
            </div>
        `;
        elements.publicPhotos.appendChild(photoElement);
        
        // Add delete handler
        photoElement.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Delete this photo permanently?')) {
                try {
                    // Delete from storage
                    await storage.ref(photo.path).delete();
                    
                    // Remove from photos array
                    photos = photos.filter(p => p.path !== photo.path);
                    
                    // Update display
                    displayPhotos();
                    showStatus('Photo deleted successfully', 'success');
                } catch (error) {
                    console.error('Delete error:', error);
                    showStatus('Failed to delete photo', 'error');
                }
            }
        });
    });
}

// Helper Functions
function toggleButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    
    button.disabled = loading;
    btnText.style.display = loading ? 'none' : 'block';
    spinner.style.display = loading ? 'block' : 'none';
}

function showStatus(message, type, element = null) {
    if (!element) {
        // Create temporary status message
        const status = document.createElement('div');
        status.className = `status-${type}`;
        status.textContent = message;
        status.style.position = 'fixed';
        status.style.bottom = '20px';
        status.style.left = '50%';
        status.style.transform = 'translateX(-50%)';
        status.style.padding = '10px 20px';
        status.style.borderRadius = '5px';
        status.style.zIndex = '3000';
        document.body.appendChild(status);
        
        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 300);
        }, 3000);
        return;
    }
    
    element.textContent = message;
    element.className = `status-${type}`;
}

function scrollToContent() {
    elements.contentSection.scrollIntoView({ behavior: 'smooth' });
}

function getAuthErrorMessage(code) {
    switch(code) {
        case 'auth/invalid-email': return 'Invalid email format';
        case 'auth/user-disabled': return 'Account disabled';
        case 'auth/user-not-found': return 'Account not found';
        case 'auth/wrong-password': return 'Incorrect password';
        default: return 'Login failed. Please try again.';
    }
}

// Initialize Auth State
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        // User is signed in
        elements.loginBtn.style.display = 'none';
        elements.logoutBtn.style.display = 'block';
        elements.uploadPhotoBtn.style.display = 'block';
        
        // Load existing photos
        loadPhotos();
    } else {
        // User is signed out
        elements.loginBtn.style.display = 'block';
        elements.logoutBtn.style.display = 'none';
        elements.uploadPhotoBtn.style.display = 'none';
        photos = [];
        displayPhotos();
    }
});

// Load Photos from Storage
async function loadPhotos() {
    if (!currentUser) return;
    
    try {
        const storageRef = storage.ref(`journey/${currentUser.uid}`);
        const result = await storageRef.listAll();
        
        photos = await Promise.all(result.items.map(async (itemRef) => {
            const url = await itemRef.getDownloadURL();
            const metadata = await itemRef.getMetadata();
            return {
                url,
                description: metadata.customMetadata?.description || "My journey photo",
                path: itemRef.fullPath
            };
        }));
        
        displayPhotos();
    } catch (error) {
        console.error("Error loading photos:", error);
        showStatus("Failed to load photos", "error");
    }
}

// Initialize App
function initApp() {
    initEventListeners();
    elements.homeBtn.click(); // Load home content by default
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
