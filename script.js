"use strict";

// =====================
// Firebase Configuration
// =====================
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

// =====================
// DOM Elements
// =====================
const elements = {
    // Parallax elements
    text: document.getElementById('text'),
    bird1: document.getElementById('bird1'),
    bird2: document.getElementById('bird2'),
    rocks: document.getElementById('rocks'),
    forest: document.getElementById('forest'),
    water: document.getElementById('water'),
    header: document.getElementById('header'),
    
    // Content sections
    contentSection: document.getElementById('contentSection'),
    journeySection: document.getElementById('journeySection'),
    publicPhotos: document.getElementById('publicPhotos'),
    
    // Navigation
    menuToggle: document.getElementById('menuToggle'),
    navLinks: document.getElementById('navLinks'),
    
    // Buttons
    homeBtn: document.getElementById('homeBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    destinationBtn: document.getElementById('destinationBtn'),
    contactBtn: document.getElementById('contactBtn'),
    journeyBtn: document.getElementById('journeyBtn'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    closeModal: document.querySelector('.close'),
    uploadSection: document.getElementById('uploadSection'),
    closeUpload: document.querySelector('.close-upload'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    uploadForm: document.getElementById('uploadForm'),
    uploadSubmitBtn: document.getElementById('uploadSubmitBtn')
};

// =====================
// State Management
// =====================
let photos = [];
let isLoading = false;

// =====================
// Authentication
// =====================
const initAuth = () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            elements.loginBtn.style.display = 'none';
            elements.logoutBtn.style.display = 'block';
            elements.uploadPhotoBtn.style.display = 'block';
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
};

// =====================
// Photo Management
// =====================
const loadPhotos = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // In a real app, you would fetch from Firestore or Storage metadata
        // For now, we'll maintain client-side array
        displayPhotos();
    } catch (error) {
        console.error("Error loading photos:", error);
        alert("Failed to load photos. Please refresh the page.");
    }
};

const displayPhotos = () => {
    elements.publicPhotos.innerHTML = photos.length > 0 ? '' : '<p class="no-photos">No photos yet. Upload some to start your journey!</p>';
    
    photos.forEach((photo, index) => {
        const photoElement = document.createElement('div');
        photoElement.className = 'box';
        photoElement.style.backgroundImage = `url('${photo.src}')`;
        photoElement.innerHTML = `
            <div class="content">
                <p>${photo.description}</p>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        elements.publicPhotos.appendChild(photoElement);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePhoto(parseInt(btn.dataset.index));
        });
    });
};

const deletePhoto = async (index) => {
    if (!auth.currentUser || !confirm('Are you sure you want to delete this photo?')) return;
    
    try {
        const photoUrl = photos[index].src;
        const photoRef = storage.refFromURL(photoUrl);
        
        await photoRef.delete();
        photos.splice(index, 1);
        displayPhotos();
        showToast('Photo deleted successfully', 'success');
    } catch (error) {
        console.error("Delete error:", error);
        showToast('Failed to delete photo', 'error');
    }
};

// =====================
// Form Handlers
// =====================
const initLoginForm = () => {
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = elements.loginForm.email.value;
        const password = elements.loginForm.password.value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            elements.loginModal.style.display = 'none';
            showToast('Login successful!', 'success');
        } catch (error) {
            console.error("Login error:", error);
            showToast(error.message, 'error');
        }
    });
};

const initUploadForm = () => {
    elements.uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isLoading) return;
        
        const file = elements.uploadForm.photoUpload.files[0];
        const description = elements.uploadForm.photoDescription.value;
        
        if (!file || !description) {
            showToast('Please select a photo and add a description', 'error');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            showToast('Please login first', 'error');
            return;
        }
        
        try {
            isLoading = true;
            toggleUploadButton(true);
            
            // Create storage reference
            const storageRef = storage.ref(`journey/${user.uid}/${Date.now()}_${file.name}`);
            
            // Upload file
            await storageRef.put(file);
            const photoUrl = await storageRef.getDownloadURL();
            
            // Add to photos array
            photos.unshift({ src: photoUrl, description });
            
            // Update UI
            displayPhotos();
            elements.uploadForm.reset();
            elements.uploadSection.style.display = 'none';
            showToast('Photo uploaded successfully!', 'success');
        } catch (error) {
            console.error("Upload error:", error);
            showToast('Upload failed: ' + error.message, 'error');
        } finally {
            isLoading = false;
            toggleUploadButton(false);
        }
    });
};

const toggleUploadButton = (loading) => {
    const btnText = elements.uploadSubmitBtn.querySelector('.btn-text');
    const spinner = elements.uploadSubmitBtn.querySelector('.spinner');
    
    if (loading) {
        elements.uploadSubmitBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.style.display = 'block';
    } else {
        elements.uploadSubmitBtn.disabled = false;
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
};

// =====================
// UI Helpers
// =====================
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
};

const scrollToContent = () => {
    elements.contentSection.scrollIntoView({ behavior: 'smooth' });
};

// =====================
// Event Listeners
// =====================
const initEventListeners = () => {
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.navLinks.classList.toggle('active');
        elements.menuToggle.classList.toggle('active');
    });
    
    // Modal controls
    elements.loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
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
    
    elements.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
        showToast('Logged out successfully', 'success');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) {
            elements.loginModal.style.display = 'none';
        }
        if (e.target === elements.uploadSection) {
            elements.uploadSection.style.display = 'none';
        }
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
            <div class="circular"></div>
            <p>Hi, I'm <span class="highlight">Soundarrajan</span>!</p>
            <p>I'm currently pursuing a BSc in Computer Science at ES Arts and Science College.</p>
            <p>I completed my schooling in 2023, marking an important milestone in my academic journey. 
            In my free time, I enjoy playing games and listening to music, which help me relax and unwind. 
            I'm passionate about exploring new interests in the field of technology and always eager to learn and grow.</p>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.destinationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>My Goals</h2>
            <p><strong>Short-term Goal:</strong> To join an IT company and gain hands-on experience in the industry.</p>
            <p><strong>Long-term Goal:</strong> To start my own business and create a positive impact.</p>
        `;
        elements.journeySection.style.display = 'none';
        scrollToContent();
    });
    
    elements.contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.contentSection.innerHTML = `
            <h2>Contact Me</h2>
            <p>If you'd like to get in touch, feel free to reach out:</p>
            <div class="social-links">
                <a href="https://www.facebook.com/share/1HENdXtkZx" target="_blank" class="social-icon">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="mailto:soundarrajan2725@gmail.com" target="_blank" class="social-icon">
                    <i class="fas fa-envelope"></i>
                </a>
                <a href="https://www.instagram.com/aakash_sr_25" target="_blank" class="social-icon">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://github.com/soundarrajan25" target="_blank" class="social-icon">
                    <i class="fab fa-github"></i>
                </a>
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
    
    // Parallax effect
    window.addEventListener('scroll', () => {
        const value = window.scrollY;
        elements.text.style.top = 50 + value * -0.1 + '%';
        elements.bird2.style.top = value * -1.5 + 'px';
        elements.bird2.style.left = value * 2 + 'px';
        elements.bird1.style.top = value * -1.5 + 'px';
        elements.bird1.style.left = value * -5 + 'px';
        elements.rocks.style.top = value * -0.12 + 'px';
        elements.forest.style.top = value * 0.25 + 'px';
        
        // Header background change on scroll
        if (value > 100) {
            elements.header.style.background = 'rgba(255, 255, 255, 0.95)';
            elements.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            elements.header.style.background = 'var(--bg-light)';
            elements.header.style.boxShadow = 'none';
        }
    });
};

// =====================
// Initialize App
// =====================
const initApp = () => {
    initAuth();
    initEventListeners();
    initLoginForm();
    initUploadForm();
    
    // Load initial content
    elements.homeBtn.click();
};

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
