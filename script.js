// Appwrite Client Setup
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('YOUR_PROJECT_ID'); // Your Project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// DOM Elements
const text = document.getElementById('text');
const bird1 = document.getElementById('bird1');
const bird2 = document.getElementById('bird2');
const rocks = document.getElementById('rocks');
const forest = document.getElementById('forest');
const water = document.getElementById('water');
const header = document.getElementById('header');
const contentSection = document.getElementById('contentSection');
const dynamicName = document.getElementById('dynamicName');

// Buttons
const homeBtn = document.getElementById('homeBtn');
const aboutBtn = document.getElementById('aboutBtn');
const destinationBtn = document.getElementById('destinationBtn');
const contactBtn = document.getElementById('contactBtn');
const journeyBtn = document.getElementById('journeyBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Admin Elements
const adminOverlay = document.getElementById('adminOverlay');
const loginModal = document.getElementById('loginModal');
const adminModal = document.getElementById('adminModal');
const closeButtons = document.querySelectorAll('.close');

// Forms
const loginForm = document.getElementById('loginForm');
const profileForm = document.getElementById('profileForm');
const projectForm = document.getElementById('projectForm');
const journeyForm = document.getElementById('journeyForm');
const blogForm = document.getElementById('blogForm');

// State
let isAdmin = false;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    loadInitialData();
    
    // Menu Toggle
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('navLinks').classList.toggle('active');
    });
    
    // Navigation
    setupNavigation();
    
    // Modal controls
    setupModals();
    
    // Admin tabs
    setupAdminTabs();
    
    // Scroll effect
    window.addEventListener('scroll', handleScroll);
});

// Check if user is authenticated
async function checkAuthState() {
    try {
        currentUser = await account.get();
        if (currentUser) {
            isAdmin = true;
            adminOverlay.style.display = 'flex';
            document.getElementById('loginBtn').textContent = 'Dashboard';
            loadAdminData();
        }
    } catch (error) {
        isAdmin = false;
        adminOverlay.style.display = 'none';
        document.getElementById('loginBtn').textContent = 'Admin';
    }
}

// Load initial data from Appwrite
async function loadInitialData() {
    try {
        // Load profile data
        const profile = await databases.listDocuments('PortfolioDB', 'profile');
        if (profile.documents.length > 0) {
            const data = profile.documents[0];
            dynamicName.textContent = data.name;
            
            // Update other profile elements as needed
        }
        
        // Load journey items
        const journeyItems = await databases.listDocuments('PortfolioDB', 'journey');
        displayJourneyItems(journeyItems.documents);
    } catch (error) {
        console.error("Error loading initial data:", error);
    }
}

// Display journey items
function displayJourneyItems(items) {
    const container = document.getElementById('publicPhotos');
    container.innerHTML = '';
    
    items.forEach(item => {
        const imageUrl = item.imageId ? storage.getFilePreview('uploads', item.imageId) : '';
        
        container.innerHTML += `
            <div class="box" style="background-image: url('${imageUrl}')">
                <div class="content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    ${isAdmin ? `<button class="delete-btn" onclick="deleteJourneyItem('${item.$id}')">Delete</button>` : ''}
                </div>
            </div>
        `;
    });
}

// Login function
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await account.createEmailSession(email, password);
        loginModal.style.display = 'none';
        checkAuthState();
    } catch (error) {
        document.getElementById('loginError').textContent = 'Invalid email or password';
        console.error("Login error:", error);
    }
});

// Logout function
logoutBtn.addEventListener('click', async () => {
    try {
        await account.deleteSession('current');
        isAdmin = false;
        adminOverlay.style.display = 'none';
        document.getElementById('loginBtn').textContent = 'Admin';
        window.location.reload();
    } catch (error) {
        console.error("Logout error:", error);
    }
});

// Admin Dashboard Functions
async function loadAdminData() {
    if (!isAdmin) return;
    
    try {
        // Load profile data
        const profile = await databases.listDocuments('PortfolioDB', 'profile');
        if (profile.documents.length > 0) {
            const data = profile.documents[0];
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profileAbout').value = data.about || '';
            document.getElementById('profileGoals').value = data.goals || '';
        }
        
        // Load projects
        const projects = await databases.listDocuments('PortfolioDB', 'projects');
        displayAdminList('projectsList', projects.documents, 'title');
        
        // Load journey items
        const journeyItems = await databases.listDocuments('PortfolioDB', 'journey');
        displayAdminList('journeyList', journeyItems.documents, 'title');
        
        // Load blogs
        const blogs = await databases.listDocuments('PortfolioDB', 'blogs');
        displayAdminList('blogsList', blogs.documents, 'title');
        
    } catch (error) {
        console.error("Error loading admin data:", error);
    }
}

function displayAdminList(elementId, items, titleField) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    items.forEach(item => {
        container.innerHTML += `
            <div class="admin-item">
                <div>
                    <h4>${item[titleField]}</h4>
                    <p>${item.description ? item.description.substring(0, 50) + '...' : ''}</p>
                </div>
                <div class="admin-actions">
                    <button class="edit-btn" onclick="editItem('${item.$collectionId}', '${item.$id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('${item.$collectionId}', '${item.$id}')">Delete</button>
                </div>
            </div>
        `;
    });
}

// Form Submissions
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const about = document.getElementById('profileAbout').value;
    const goals = document.getElementById('profileGoals').value;
    const imageFile = document.getElementById('profileImage').files[0];
    
    try {
        // Check if profile exists
        const existing = await databases.listDocuments('PortfolioDB', 'profile');
        let imageId = null;
        
        if (imageFile) {
            // Upload new image
            const upload = await storage.createFile('uploads', ID.unique(), imageFile);
            imageId = upload.$id;
        }
        
        if (existing.documents.length > 0) {
            // Update existing profile
            await databases.updateDocument(
                'PortfolioDB',
                'profile',
                existing.documents[0].$id,
                { name, about, goals, ...(imageId && { imageId }) }
            );
        } else {
            // Create new profile
            await databases.createDocument(
                'PortfolioDB',
                'profile',
                ID.unique(),
                { name, about, goals, ...(imageId && { imageId }) }
            );
        }
        
        showSuccess('Profile updated successfully!');
        loadInitialData(); // Refresh frontend
    } catch (error) {
        console.error("Error updating profile:", error);
        showError('Failed to update profile');
    }
});

journeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('journeyTitle').value;
    const description = document.getElementById('journeyDesc').value;
    const imageFile = document.getElementById('journeyImage').files[0];
    
    if (!imageFile) {
        showError('Please select an image');
        return;
    }
    
    try {
        // Upload image
        const upload = await storage.createFile('uploads', ID.unique(), imageFile);
        
        // Create journey item
        await databases.createDocument(
            'PortfolioDB',
            'journey',
            ID.unique(),
            { title, description, imageId: upload.$id }
        );
        
        showSuccess('Journey item added!');
        journeyForm.reset();
        loadAdminData(); // Refresh admin list
        loadInitialData(); // Refresh frontend
    } catch (error) {
        console.error("Error adding journey item:", error);
        showError('Failed to add journey item');
    }
});

// Delete functions
async function deleteItem(collection, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        await databases.deleteDocument('PortfolioDB', collection, id);
        showSuccess('Item deleted');
        loadAdminData(); // Refresh lists
        if (collection === 'journey') {
            loadInitialData(); // Refresh frontend journey
        }
    } catch (error) {
        console.error("Error deleting item:", error);
        showError('Failed to delete item');
    }
}

async function deleteJourneyItem(id) {
    await deleteItem('journey', id);
}

// Helper functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const forms = document.querySelectorAll('.tab-content.active form');
    if (forms.length > 0) {
        forms[0].appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const forms = document.querySelectorAll('.tab-content.active form');
    if (forms.length > 0) {
        forms[0].appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }
}

// Setup functions
function setupNavigation() {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection('home');
    });
    
    aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection('about');
    });
    
    destinationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection('goals');
    });
    
    contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection('contact');
    });
    
    journeyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('journeySection').style.display = 'block';
        contentSection.innerHTML = '';
        window.scrollTo({
            top: document.getElementById('journeySection').offsetTop - 100,
            behavior: 'smooth'
        });
    });
    
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAdmin) {
            adminModal.style.display = 'block';
        } else {
            loginModal.style.display = 'block';
        }
    });
}

function setupModals() {
    // Close modals when clicking X
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            adminModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === adminModal) adminModal.style.display = 'none';
    });
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabId = tab.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

async function loadSection(section) {
    document.getElementById('journeySection').style.display = 'none';
    
    try {
        const profile = await databases.listDocuments('PortfolioDB', 'profile');
        const data = profile.documents[0] || {};
        
        switch (section) {
            case 'home':
                contentSection.innerHTML = `
                    <h2>Welcome to My Portfolio</h2>
                    <p>This is my professional portfolio showcasing my work and journey.</p>
                `;
                break;
                
            case 'about':
                contentSection.innerHTML = `
                    <h2>About Me</h2>
                    <div class="circular" style="background-image: url('${data.imageId ? storage.getFilePreview('uploads', data.imageId) : ''}')"></div>
                    <p>Hi, I'm <span class="highlight">${data.name || 'Soundarrajan'}</span>!</p>
                    <p>${data.about || 'I am a passionate developer.'}</p>
                `;
                break;
                
            case 'goals':
                contentSection.innerHTML = `
                    <h2>My Goals</h2>
                    <p>${data.goals || 'My professional and personal goals.'}</p>
                `;
                break;
                
            case 'contact':
                contentSection.innerHTML = `
                    <h2>Contact Me</h2>
                    <div class="social-links">
                        <!-- Your existing social links -->
                    </div>
                `;
                break;
        }
        
        window.scrollTo({
            top: contentSection.offsetTop - 100,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error("Error loading section:", error);
    }
}

function handleScroll() {
    let value = window.scrollY;
    text.style.top = 50 + value * -.1 + '%';
    bird2.style.top = value * -1.5 + 'px';
    bird2.style.left = value * 2 + 'px';
    bird1.style.top = value * -1.5 + 'px';
    bird1.style.left = value * -5 + 'px';
    rocks.style.top = value * -.12 + 'px';
    forest.style.top = value * .25 + 'px';
    
    // Header effect
    if (value > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}
