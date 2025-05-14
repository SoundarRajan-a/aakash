"use strict";

// Initialize Appwrite
const client = new Appwrite.Client();
const account = new Appwrite.Account(client);
const database = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

// Configure Appwrite client
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Replace with your endpoint
    .setProject('6825025b001922085c7f'); // Replace with your project ID

// Database and Collection IDs
const DB_ID = '6825031d00355f695121';
const PROFILE_COLLECTION_ID = '682503610027481bfca6';
const GOALS_COLLECTION_ID = '6825038200093a6e3d65';
const JOURNEY_COLLECTION_ID = '68250389000bcaa2b005';
const RESUME_COLLECTION_ID = '68250392002227756375';

// DOM Elements
const text = document.getElementById('text');
const bird1 = document.getElementById('bird1');
const bird2 = document.getElementById('bird2');
const rocks = document.getElementById('rocks');
const forest = document.getElementById('forest');
const water = document.getElementById('water');
const header = document.getElementById('header');
const contentSection = document.getElementById('contentSection');

// Navigation Elements
const homeBtn = document.getElementById('homeBtn');
const aboutBtn = document.getElementById('aboutBtn');
const destinationBtn = document.getElementById('destinationBtn');
const contactBtn = document.getElementById('contactBtn');
const journeyBtn = document.getElementById('journeyBtn');
const loginBtn = document.getElementById('loginBtn');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Menu Elements
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Modal Elements
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const adminModal = document.getElementById('adminModal');
const closeAdmin = document.querySelector('.close-admin');

// Admin Dashboard Elements
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const profileForm = document.getElementById('profileForm');
const goalsForm = document.getElementById('goalsForm');
const journeyForm = document.getElementById('journeyForm');
const resumeForm = document.getElementById('resumeForm');

// Journey Section Elements
const journeySection = document.getElementById('journeySection');
const publicPhotos = document.getElementById('publicPhotos');
const filterButtons = document.querySelectorAll('.filter-btn');

// Global State
let currentUser = null;
let profileData = null;
let goalsData = null;
let journeyData = [];
let resumeData = null;
let isEditingJourneyItem = false;
let currentEditingJourneyId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadInitialData();
    setupEventListeners();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        currentUser = await account.get();
        updateUIForAuth(true);
    } catch (error) {
        updateUIForAuth(false);
    }
}

// Update UI based on authentication status
function updateUIForAuth(isAuthenticated) {
    if (isAuthenticated) {
        loginBtn.style.display = 'none';
        adminBtn.style.display = 'block';
        logoutBtn.style.display = 'block';
        uploadPhotoBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        adminBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        uploadPhotoBtn.style.display = 'none';
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Load profile data
        const profileResponse = await database.listDocuments(DB_ID, PROFILE_COLLECTION_ID);
        if (profileResponse.documents.length > 0) {
            profileData = profileResponse.documents[0];
            updateProfileUI();
        }

        // Load goals data
        const goalsResponse = await database.listDocuments(DB_ID, GOALS_COLLECTION_ID);
        if (goalsResponse.documents.length > 0) {
            goalsData = goalsResponse.documents[0];
            updateGoalsUI();
        }

        // Load journey data
        const journeyResponse = await database.listDocuments(DB_ID, JOURNEY_COLLECTION_ID);
        journeyData = journeyResponse.documents;
        displayJourneyItems('all');

        // Load resume data
        const resumeResponse = await database.listDocuments(DB_ID, RESUME_COLLECTION_ID);
        if (resumeResponse.documents.length > 0) {
            resumeData = resumeResponse.documents[0];
            updateResumeUI();
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        showStatus('Error loading data. Please refresh the page.', 'error');
    }
}

// Update profile UI
function updateProfileUI() {
    if (!profileData) return;

    // Update profile image if it exists
    if (profileData.image_id) {
        try {
            const profileImageUrl = storage.getFileView(DB_ID, profileData.image_id);
            document.querySelector('.circular').style.backgroundImage = `url('${profileImageUrl}')`;
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    }

    // Update about section if it's active
    if (contentSection.innerHTML.includes('About Me')) {
        aboutBtn.click();
    }
}

// Update goals UI
function updateGoalsUI() {
    if (!goalsData) return;

    // Update destination section if it's active
    if (contentSection.innerHTML.includes('My Goals')) {
        destinationBtn.click();
    }
}

// Update resume UI
function updateResumeUI() {
    if (!resumeData) return;

    const resumeLinkContainer = document.getElementById('resumeLinkContainer');
    if (resumeLinkContainer) {
        try {
            const resumeUrl = storage.getFileView(DB_ID, resumeData.file_id);
            resumeLinkContainer.innerHTML = `
                <a href="${resumeUrl}" class="resume-link" target="_blank">Download Resume</a>
                <p>Uploaded on: ${new Date(resumeData.$createdAt).toLocaleDateString()}</p>
                <p>File: ${resumeData.file_name} (${formatFileSize(resumeData.file_size)})</p>
            `;
        } catch (error) {
            console.error('Error loading resume file:', error);
            resumeLinkContainer.innerHTML = '<p>Error loading resume file</p>';
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
}

// Setup event listeners
function setupEventListeners() {
    // Menu Toggle
    menuToggle.addEventListener('click', toggleMenu);

    // Navigation Buttons
    homeBtn.addEventListener('click', showHome);
    aboutBtn.addEventListener('click', showAbout);
    destinationBtn.addEventListener('click', showDestination);
    contactBtn.addEventListener('click', showContact);
    journeyBtn.addEventListener('click', showJourney);
    adminBtn.addEventListener('click', showAdminDashboard);
    logoutBtn.addEventListener('click', handleLogout);

    // Login Modal
    loginBtn.addEventListener('click', openLoginModal);
    closeModal.addEventListener('click', closeLoginModal);

    // Admin Modal
    closeAdmin.addEventListener('click', closeAdminModal);

    // Upload Button
    uploadPhotoBtn.addEventListener('click', openAdminModal);

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    profileForm.addEventListener('submit', handleProfileUpdate);
    goalsForm.addEventListener('submit', handleGoalsUpdate);
    journeyForm.addEventListener('submit', handleJourneyItem);
    resumeForm.addEventListener('submit', handleResumeUpload);

    // Admin Tabs
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', switchTab);
    });

    // Journey Filter Buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', filterJourneyItems);
    });

    // Image Preview
    document.getElementById('profileImage').addEventListener('change', function(e) {
        previewImage(e.target, 'profileImagePreview');
    });
    document.getElementById('journeyImage').addEventListener('change', function(e) {
        previewImage(e.target, 'journeyImagePreview');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
        if (e.target === adminModal) closeAdminModal();
    });

    // Scroll effect
    window.addEventListener('scroll', handleScrollEffect);
}

// Toggle mobile menu
function toggleMenu() {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// Handle scroll parallax effect
function handleScrollEffect() {
    let value = window.scrollY;
    text.style.top = 50 + value * -0.1 + '%';
    bird2.style.top = value * -1.5 + 'px';
    bird2.style.left = value * 2 + 'px';
    bird1.style.top = value * -1.5 + 'px';
    bird1.style.left = value * -5 + 'px';
    rocks.style.top = value * -0.12 + 'px';
    forest.style.top = value * 0.25 + 'px';
    header.style.top = value * 0.5 + 'px';
}

// Scroll to content section
function scrollToContent() {
    contentSection.scrollIntoView({ behavior: 'smooth' });
}

// Show status message
function showStatus(message, type, elementId = null) {
    const statusElement = elementId ? document.getElementById(elementId) : document.getElementById('loginStatus');
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.display = 'block';
    
    // Hide status after 5 seconds
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

// Preview image before upload
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<p>No image selected</p>';
    }
}

// Switch between admin tabs
function switchTab(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Filter journey items
function filterJourneyItems(e) {
    const filter = e.target.getAttribute('data-filter');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Display filtered items
    displayJourneyItems(filter);
}

// Display journey items in public view
function displayJourneyItems(filter = 'all') {
    publicPhotos.innerHTML = '';

    if (journeyData.length === 0) {
        publicPhotos.innerHTML = '<p class="no-items">No journey items to display yet.</p>';
        return;
    }

    const filteredItems = filter === 'all' 
        ? journeyData 
        : journeyData.filter(item => item.type === filter);

    if (filteredItems.length === 0) {
        publicPhotos.innerHTML = `<p class="no-items">No ${filter} items to display.</p>`;
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'box';
        
        // Set background image if available
        if (item.image_id) {
            try {
                const imageUrl = storage.getFileView(DB_ID, item.image_id);
                itemElement.style.backgroundImage = `url('${imageUrl}')`;
            } catch (error) {
                console.error('Error loading journey item image:', error);
                itemElement.style.backgroundColor = '#f0f0f0';
            }
        } else {
            itemElement.style.backgroundColor = '#f0f0f0';
        }

        itemElement.innerHTML = `
            <div class="content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" target="_blank">View ${item.type}</a>` : ''}
            </div>
        `;

        publicPhotos.appendChild(itemElement);
    });
}

// Display journey items in admin dashboard
function displayAdminJourneyItems() {
    const journeyItemsList = document.getElementById('journeyItemsList');
    journeyItemsList.innerHTML = '';

    if (journeyData.length === 0) {
        journeyItemsList.innerHTML = '<p class="no-items">No journey items yet.</p>';
        return;
    }

    journeyData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'journey-item';
        
        let imagePreview = '';
        if (item.image_id) {
            try {
                const imageUrl = storage.getFileView(DB_ID, item.image_id);
                imagePreview = `<img src="${imageUrl}" style="max-width: 50px; max-height: 50px; margin-right: 10px;">`;
            } catch (error) {
                console.error('Error loading journey item image:', error);
            }
        }
        
        itemElement.innerHTML = `
            <div>
                <h4>${item.title} (${item.type})</h4>
                <p>${item.description.substring(0, 50)}...</p>
            </div>
            <div class="journey-item-actions">
                <button class="edit-btn" data-id="${item.$id}">Edit</button>
                <button class="delete-btn" data-id="${item.$id}">Delete</button>
            </div>
        `;
        
        journeyItemsList.appendChild(itemElement);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.journey-item-actions .delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const itemId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    await database.deleteDocument(DB_ID, JOURNEY_COLLECTION_ID, itemId);
                    showStatus('Item deleted successfully!', 'success', 'journeyStatus');
                    
                    // Reload journey data
                    const journeyResponse = await database.listDocuments(DB_ID, JOURNEY_COLLECTION_ID);
                    journeyData = journeyResponse.documents;
                    
                    displayAdminJourneyItems();
                    displayJourneyItems('all');
                } catch (error) {
                    console.error('Error deleting journey item:', error);
                    showStatus('Failed to delete item', 'error', 'journeyStatus');
                }
            }
        });
    });

    // Add event listeners to edit buttons
    document.querySelectorAll('.journey-item-actions .edit-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const itemId = e.target.getAttribute('data-id');
            const item = journeyData.find(i => i.$id === itemId);
            
            if (item) {
                // Fill the form with item data
                document.getElementById('contentType').value = item.type;
                document.getElementById('journeyTitle').value = item.title;
                document.getElementById('journeyDescription').value = item.description;
                document.getElementById('journeyLink').value = item.link || '';
                
                if (item.image_id) {
                    try {
                        const imageUrl = storage.getFileView(DB_ID, item.image_id);
                        document.getElementById('journeyImagePreview').innerHTML = `<img src="${imageUrl}" alt="Journey Item Preview">`;
                    } catch (error) {
                        console.error('Error loading image:', error);
                        document.getElementById('journeyImagePreview').innerHTML = '<p>Image not available</p>';
                    }
                } else {
                    document.getElementById('journeyImagePreview').innerHTML = '<p>No image</p>';
                }
                
                // Change form to edit mode
                isEditingJourneyItem = true;
                currentEditingJourneyId = itemId;
                document.getElementById('journeySubmitBtn').textContent = 'Update Content';
                
                // Scroll to form
                document.getElementById('journey-tab').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showStatus('Logging in...', 'warning');
        
        // First try to create the account (will fail if already exists)
        try {
            await account.create('unique()', email, password);
            showStatus('Account created! Logging in...', 'success');
        } catch (createError) {
            // Account likely already exists, proceed to login
            console.log('Account may already exist, proceeding to login');
        }
        
        // Create session
        await account.createEmailSession(email, password);
        currentUser = await account.get();
        
        updateUIForAuth(true);
        loginModal.style.display = 'none';
        document.getElementById('loginForm').reset();
        
        showStatus('Login successful!', 'success');
        loadInitialData();
    } catch (error) {
        console.error('Login error:', error);
        showStatus('Login failed: ' + error.message, 'error');
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    try {
        await account.deleteSession('current');
        currentUser = null;
        updateUIForAuth(false);
        
        if (journeySection.style.display === 'block') {
            journeyBtn.click();
        }
        
        showStatus('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showStatus('Logout failed: ' + error.message, 'error');
    }
}

// Open login modal
function openLoginModal(e) {
    e.preventDefault();
    loginModal.style.display = 'block';
    document.getElementById('loginStatus').style.display = 'none';
}

// Close login modal
function closeLoginModal() {
    loginModal.style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginStatus').style.display = 'none';
}

// Open admin modal
function openAdminModal(e) {
    if (e) e.preventDefault();
    adminModal.style.display = 'block';
    loadAdminData();
}

// Close admin modal
function closeAdminModal() {
    adminModal.style.display = 'none';
    resetJourneyForm();
}

// Load data for admin dashboard
async function loadAdminData() {
    try {
        showStatus('Loading admin data...', 'warning', 'profileStatus');
        
        // Load profile data
        const profileResponse = await database.listDocuments(DB_ID, PROFILE_COLLECTION_ID);
        if (profileResponse.documents.length > 0) {
            profileData = profileResponse.documents[0];
            document.getElementById('profileName').value = profileData.name || '';
            document.getElementById('profileTitle').value = profileData.title || '';
            document.getElementById('profileBio').value = profileData.bio || '';
            
            if (profileData.image_id) {
                try {
                    const imageUrl = storage.getFileView(DB_ID, profileData.image_id);
                    document.getElementById('profileImagePreview').innerHTML = `<img src="${imageUrl}" alt="Profile Preview">`;
                } catch (error) {
                    console.error('Error loading profile image:', error);
                    document.getElementById('profileImagePreview').innerHTML = '<p>Image not available</p>';
                }
            }
        }

        // Load goals data
        const goalsResponse = await database.listDocuments(DB_ID, GOALS_COLLECTION_ID);
        if (goalsResponse.documents.length > 0) {
            goalsData = goalsResponse.documents[0];
            document.getElementById('shortTermGoal').value = goalsData.short_term || '';
            document.getElementById('longTermGoal').value = goalsData.long_term || '';
        }

        // Load journey data
        const journeyResponse = await database.listDocuments(DB_ID, JOURNEY_COLLECTION_ID);
        journeyData = journeyResponse.documents;
        displayAdminJourneyItems();

        // Load resume data
        const resumeResponse = await database.listDocuments(DB_ID, RESUME_COLLECTION_ID);
        if (resumeResponse.documents.length > 0) {
            resumeData = resumeResponse.documents[0];
            updateResumeUI();
        }
        
        showStatus('Admin data loaded', 'success', 'profileStatus');
    } catch (error) {
        console.error('Error loading admin data:', error);
        showStatus('Failed to load admin data', 'error', 'profileStatus');
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('profileName').value;
    const title = document.getElementById('profileTitle').value;
    const bio = document.getElementById('profileBio').value;
    const imageFile = document.getElementById('profileImage').files[0];

    try {
        showStatus('Updating profile...', 'warning', 'profileStatus');
        
        let imageId = profileData?.image_id || null;

        // Upload new image if selected
        if (imageFile) {
            // Delete old image if it exists
            if (imageId) {
                try {
                    await storage.deleteFile(DB_ID, imageId);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
            
            // Upload new image
            const fileExt = imageFile.name.split('.').pop();
            const fileId = `profile_${Date.now()}.${fileExt}`;
            
            const response = await storage.createFile(
                DB_ID, 
                fileId,
                imageFile
            );
            imageId = response.$id;
        }

        // Prepare profile data
        const profile = {
            name,
            title,
            bio,
            image_id: imageId || null
        };

        if (profileData) {
            // Update existing profile
            await database.updateDocument(DB_ID, PROFILE_COLLECTION_ID, profileData.$id, profile);
        } else {
            // Create new profile
            await database.createDocument(DB_ID, PROFILE_COLLECTION_ID, 'unique()', profile);
        }

        // Reload profile data
        const profileResponse = await database.listDocuments(DB_ID, PROFILE_COLLECTION_ID);
        profileData = profileResponse.documents[0];
        updateProfileUI();
        
        showStatus('Profile updated successfully!', 'success', 'profileStatus');
        document.getElementById('profileImage').value = '';
    } catch (error) {
        console.error('Error updating profile:', error);
        showStatus('Failed to update profile: ' + error.message, 'error', 'profileStatus');
    }
}

// Handle goals update
async function handleGoalsUpdate(e) {
    e.preventDefault();
    const shortTermGoal = document.getElementById('shortTermGoal').value;
    const longTermGoal = document.getElementById('longTermGoal').value;

    try {
        showStatus('Updating goals...', 'warning', 'goalsStatus');
        
        const goals = {
            short_term: shortTermGoal,
            long_term: longTermGoal
        };

        if (goalsData) {
            // Update existing goals
            await database.updateDocument(DB_ID, GOALS_COLLECTION_ID, goalsData.$id, goals);
        } else {
            // Create new goals
            await database.createDocument(DB_ID, GOALS_COLLECTION_ID, 'unique()', goals);
        }

        // Reload goals data
        const goalsResponse = await database.listDocuments(DB_ID, GOALS_COLLECTION_ID);
        goalsData = goalsResponse.documents[0];
        updateGoalsUI();
        
        showStatus('Goals updated successfully!', 'success', 'goalsStatus');
    } catch (error) {
        console.error('Error updating goals:', error);
        showStatus('Failed to update goals: ' + error.message, 'error', 'goalsStatus');
    }
}

// Handle journey item add/update
async function handleJourneyItem(e) {
    e.preventDefault();
    const type = document.getElementById('contentType').value;
    const title = document.getElementById('journeyTitle').value;
    const description = document.getElementById('journeyDescription').value;
    const link = document.getElementById('journeyLink').value || null;
    const imageFile = document.getElementById('journeyImage').files[0];

    try {
        showStatus(isEditingJourneyItem ? 'Updating item...' : 'Adding item...', 'warning', 'journeyStatus');
        
        let imageId = null;

        // Upload image if selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileId = `${type}_${Date.now()}.${fileExt}`;
            
            const response = await storage.createFile(
                DB_ID, 
                fileId,
                imageFile
            );
            imageId = response.$id;
        }

        // Prepare journey item data
        const journeyItem = {
            type,
            title,
            description,
            link,
            image_id: imageId || null
        };

        if (isEditingJourneyItem && currentEditingJourneyId) {
            // Update existing item
            await database.updateDocument(DB_ID, JOURNEY_COLLECTION_ID, currentEditingJourneyId, journeyItem);
            showStatus('Item updated successfully!', 'success', 'journeyStatus');
        } else {
            // Create new item
            await database.createDocument(DB_ID, JOURNEY_COLLECTION_ID, 'unique()', journeyItem);
            showStatus('Item added successfully!', 'success', 'journeyStatus');
        }

        // Reset form
        resetJourneyForm();
        
        // Reload journey data
        const journeyResponse = await database.listDocuments(DB_ID, JOURNEY_COLLECTION_ID);
        journeyData = journeyResponse.documents;
        
        displayAdminJourneyItems();
        displayJourneyItems('all');
    } catch (error) {
        console.error('Error saving journey item:', error);
        showStatus('Failed to save item: ' + error.message, 'error', 'journeyStatus');
    }
}

// Reset journey form
function resetJourneyForm() {
    document.getElementById('journeyForm').reset();
    document.getElementById('journeyImagePreview').innerHTML = '';
    document.getElementById('journeySubmitBtn').textContent = 'Add Content';
    isEditingJourneyItem = false;
    currentEditingJourneyId = null;
}

// Handle resume upload
async function handleResumeUpload(e) {
    e.preventDefault();
    const file = document.getElementById('resumeFile').files[0];

    if (!file) {
        showStatus('Please select a PDF file to upload.', 'error', 'resumeStatus');
        return;
    }

    if (file.type !== 'application/pdf') {
        showStatus('Please upload a PDF file only.', 'error', 'resumeStatus');
        return;
    }

    try {
        showStatus('Uploading resume...', 'warning', 'resumeStatus');
        
        // Delete old resume if it exists
        if (resumeData) {
            try {
                await storage.deleteFile(DB_ID, resumeData.file_id);
                await database.deleteDocument(DB_ID, RESUME_COLLECTION_ID, resumeData.$id);
            } catch (error) {
                console.error('Error deleting old resume:', error);
            }
        }

        // Upload new resume file
        const fileId = `resume_${Date.now()}.pdf`;
        const fileResponse = await storage.createFile(DB_ID, fileId, file);

        // Create resume document
        const resumeDoc = {
            file_id: fileResponse.$id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
        };

        await database.createDocument(DB_ID, RESUME_COLLECTION_ID, 'unique()', resumeDoc);

        // Reload resume data
        const resumeResponse = await database.listDocuments(DB_ID, RESUME_COLLECTION_ID);
        resumeData = resumeResponse.documents[0];
        updateResumeUI();

        document.getElementById('resumeForm').reset();
        showStatus('Resume uploaded successfully!', 'success', 'resumeStatus');
    } catch (error) {
        console.error('Error uploading resume:', error);
        showStatus('Failed to upload resume: ' + error.message, 'error', 'resumeStatus');
    }
}

// Navigation functions
function showHome(e) {
    if (e) e.preventDefault();
    setActiveNav(homeBtn);
    contentSection.innerHTML = `
        <h2>Welcome to My Portfolio</h2>
        <p>Explore my journey, projects, and professional goals through this interactive portfolio website.</p>
        <p>Use the navigation menu to learn more about me and my work.</p>
    `;
    journeySection.style.display = 'none';
    scrollToContent();
}

function showAbout(e) {
    if (e) e.preventDefault();
    setActiveNav(aboutBtn);
    
    const name = profileData?.name || 'Soundarrajan';
    const title = profileData?.title || 'Computer Science Student';
    const bio = profileData?.bio || `
        Hi, I'm <span class="highlight">${name}</span>!
        I'm currently pursuing a BSc in Computer Science at ES Arts and Science College.
        I completed my schooling in 2023, marking an important milestone in my academic journey. 
        In my free time, I enjoy playing games and listening to music, which help me relax and unwind. 
        I'm passionate about exploring new interests in the field of technology and always eager to learn and grow.
    `;
    
    contentSection.innerHTML = `
        <h2>About Me</h2>
        <div class="circular"></div>
        <h3>${title}</h3>
        <p>${bio}</p>
    `;
    
    journeySection.style.display = 'none';
    scrollToContent();
    
    // Update profile image if it exists
    if (profileData?.image_id) {
        try {
            const profileImageUrl = storage.getFileView(DB_ID, profileData.image_id);
            document.querySelector('.circular').style.backgroundImage = `url('${profileImageUrl}')`;
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    }
}

function showDestination(e) {
    if (e) e.preventDefault();
    setActiveNav(destinationBtn);
    
    const shortTerm = goalsData?.short_term || 'To join an IT company and gain hands-on experience in the industry.';
    const longTerm = goalsData?.long_term || 'To start my own business and create a positive impact.';
    
    contentSection.innerHTML = `
        <h2>My Goals</h2>
        <div class="goals-container">
            <div class="goal-card">
                <h3>Short-term Goal</h3>
                <p>${shortTerm}</p>
            </div>
            <div class="goal-card">
                <h3>Long-term Goal</h3>
                <p>${longTerm}</p>
            </div>
        </div>
    `;
    journeySection.style.display = 'none';
    scrollToContent();
}

function showContact(e) {
    if (e) e.preventDefault();
    setActiveNav(contactBtn);
    contentSection.innerHTML = `
        <h2>Contact Me</h2>
        <p>If you'd like to get in touch, feel free to reach out through any of these channels:</p>
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
        ${resumeData ? `
        <div style="margin-top: 30px;">
            <h3>Download My Resume</h3>
            <a href="${storage.getFileView(DB_ID, resumeData.file_id)}" class="resume-link" target="_blank">
                Download Resume
            </a>
        </div>
        ` : ''}
    `;
    journeySection.style.display = 'none';
    scrollToContent();
}

function showJourney(e) {
    if (e) e.preventDefault();
    setActiveNav(journeyBtn);
    contentSection.innerHTML = '';
    journeySection.style.display = 'block';
    scrollToContent();
}

function showAdminDashboard(e) {
    if (e) e.preventDefault();
    adminModal.style.display = 'block';
    loadAdminData();
}

// Helper function to set active navigation
function setActiveNav(activeBtn) {
    document.querySelectorAll('#navLinks li a').forEach(link => {
        link.classList.remove('active');
    });
    activeBtn.classList.add('active');
}
