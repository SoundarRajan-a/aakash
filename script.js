// Firebase Configuration - REPLACE WITH YOUR ACTUAL CONFIG
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
    
    // Auth
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    loginError: document.getElementById('loginError'),
    
    // Upload
    uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
    uploadSection: document.getElementById('uploadSection'),
    uploadForm: document.getElementById('uploadForm'),
    uploadSubmitBtn: document.getElementById('uploadSubmitBtn'),
    uploadError: document.getElementById('uploadError'),
    
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

// State
let photos = [];
let currentUser = null;

// Initialize Authentication
const initAuth = () => {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            // User is logged in
            elements.loginBtn.style.display = 'none';
            elements.logoutBtn.style.display = 'block';
            elements.uploadPhotoBtn.style.display = 'block';
            loadPhotos();
        } else {
            // User is logged out
            elements.loginBtn.style.display = 'block';
            elements.logoutBtn.style.display = 'none';
            elements.uploadPhotoBtn.style.display = 'none';
            photos = [];
            displayPhotos();
        }
    });
};

// Load Photos from Storage
const loadPhotos = async () => {
    try {
        if (!currentUser) return;
        
        // List all files in the user's journey folder
        const storageRef = storage.ref(`journey/${currentUser.uid}`);
        const result = await storageRef.listAll();
        
        photos = await Promise.all(result.items.map(async item => {
            const url = await item.getDownloadURL();
            // Get metadata for description (store description in metadata when uploading)
            const metadata = await item.getMetadata();
            return {
                url,
                description: metadata.customMetadata?.description || "My journey photo",
                path: item.fullPath
            };
        }));
        
        displayPhotos();
    } catch (error) {
        console.error("Error loading photos:", error);
        showToast("Failed to load photos", "error");
    }
};

// Display Photos
const displayPhotos = () => {
    elements.publicPhotos.innerHTML = '';
    
    if (photos.length === 0) {
        elements.publicPhotos.innerHTML = '<p class="no-photos">No photos yet. Upload some to start your journey!</p>';
        return;
    }
    
    photos.forEach((photo, index) => {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-box';
        photoElement.innerHTML = `
            <div class="photo-image" style="background-image: url('${photo.url}')"></div>
            <div class="photo-info">
                <p>${photo.description}</p>
                ${currentUser ? `<button class="delete-btn" data-path="${photo.path}">Delete</button>` : ''}
            </div>
        `;
        elements.publicPhotos.appendChild(photoElement);
    });
    
    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this photo?')) {
                try {
                    await storage.ref(btn.dataset.path).delete();
                    photos = photos.filter(p => p.path !== btn.dataset.path);
                    displayPhotos();
                    showToast("Photo deleted successfully", "success");
                } catch (error) {
                    console.error("Delete error:", error);
                    showToast("Failed to delete photo", "error");
                }
            }
        });
    });
};

// Handle Login
const handleLogin = async (email, password) => {
    try {
        toggleLoginButton(true);
        await auth.signInWithEmailAndPassword(email, password);
        elements.loginModal.style.display = 'none';
        elements.loginForm.reset();
        showToast("Login successful", "success");
    } catch (error) {
        console.error("Login error:", error);
        elements.loginError.textContent = getAuthErrorMessage(error.code);
    } finally {
        toggleLoginButton(false);
    }
};

// Handle Photo Upload
const handleUpload = async (file, description) => {
    try {
        toggleUploadButton(true);
        
        // Create storage reference
        const filePath = `journey/${currentUser.uid}/${Date.now()}_${file.name}`;
        const storageRef = storage.ref(filePath);
        
        // Upload file with metadata
        await storageRef.put(file, {
            customMetadata: { description }
        });
        
        // Get download URL
        const url = await storageRef.getDownloadURL();
        
        // Add to photos array
        photos.unshift({ url, description, path: filePath });
        displayPhotos();
        
        // Reset form
        elements.uploadForm.reset();
        elements.uploadSection.style.display = 'none';
        showToast("Photo uploaded successfully", "success");
    } catch (error) {
        console.error("Upload error:", error);
        elements.uploadError.textContent = getStorageErrorMessage(error.code);
    } finally {
        toggleUploadButton(false);
    }
};

// Helper Functions
const toggleLoginButton = (loading) => {
    const btnText = elements.loginSubmitBtn.querySelector('.btn-text');
    const spinner = elements.loginSubmitBtn.querySelector('.spinner');
    
    elements.loginSubmitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'block';
    spinner.style.display = loading ? 'block' : 'none';
};

const toggleUploadButton = (loading) => {
    const btnText = elements.uploadSubmitBtn.querySelector('.btn-text');
    const spinner = elements.uploadSubmitBtn.querySelector('.spinner');
    
    elements.uploadSubmitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'block';
    spinner.style.display = loading ? 'block' : 'none';
};

const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const getAuthErrorMessage = (code) => {
    switch(code) {
        case 'auth/invalid-email': return 'Invalid email format';
        case 'auth/user-disabled': return 'Account disabled';
        case 'auth/user-not-found': return 'Account not found';
        case 'auth/wrong-password': return 'Incorrect password';
        default: return 'Login failed. Please try again.';
    }
};

const getStorageErrorMessage = (code) => {
    switch(code) {
        case 'storage/unauthorized': return 'You dont have permission';
        case 'storage/canceled': return 'Upload canceled';
        case 'storage/unknown': return 'Unknown error occurred';
        default: return 'Upload failed. Please try again.';
    }
};

// Event Listeners
const initEventListeners = () => {
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.navLinks.classList.toggle('active');
    });
    
    // Modals
    elements.loginBtn.addEventListener('click', () => {
        elements.loginModal.style.display = 'block';
    });
    
    elements.uploadPhotoBtn.addEventListener('click', () => {
        elements.uploadSection.style.display = 'block';
    });
    
    document.querySelectorAll('.close, .close-upload').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            elements.loginModal.style.display = 'none';
            elements.uploadSection.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) elements.loginModal.style.display = 'none';
        if (e.target === elements.uploadSection) elements.uploadSection.style.display = 'none';
    });
    
    // Forms
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value.trim();
        await handleLogin(email, password);
    });
    
    elements.uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = elements.photoUpload.files[0];
        const description = elements.photoDescription.value.trim();
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            elements.uploadError.textContent = 'File size must be less than 5MB';
            return;
        }
        
        await handleUpload(file, description);
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', () => {
        auth.signOut();
        showToast("Logged out successfully", "success");
    });
    
    // Navigation
    document.querySelectorAll('#homeBtn, #aboutBtn, #destinationBtn, #contactBtn, #journeyBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.contentSection.innerHTML = getSectionContent(btn.id);
            elements.journeySection.style.display = btn.id === 'journeyBtn' ? 'block' : 'none';
            window.scrollTo({ top: elements.contentSection.offsetTop, behavior: 'smooth' });
        });
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
};

// Section Content
const getSectionContent = (sectionId) => {
    switch(sectionId) {
        case 'homeBtn':
            return '<h2>Welcome to My Portfolio</h2><p>Explore my work and journey through this interactive showcase.</p>';
        case 'aboutBtn':
            return `
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
        case 'destinationBtn':
            return `
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
        case 'contactBtn':
            return `
                <h2>Contact Me</h2>
                <div class="social-links">
                    <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
                    <a href="mailto:soundarrajan2725@gmail.com"><i class="fas fa-envelope"></i></a>
                    <a href="https://instagram.com/aakash_sr_25" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://github.com/soundarrajan25" target="_blank"><i class="fab fa-github"></i></a>
                </div>
            `;
        default:
            return '<h2>Welcome</h2><p>Select a section to explore.</p>';
    }
};

// Initialize App
const initApp = () => {
    initAuth();
    initEventListeners();
    // Load home content by default
    elements.contentSection.innerHTML = getSectionContent('homeBtn');
};

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
