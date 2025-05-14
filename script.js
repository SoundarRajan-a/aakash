// Appwrite Configuration
const appwrite = new Appwrite();

// Initialize Appwrite client
appwrite
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('6824e979003178b7222f'); // Your project ID

// DOM Elements
const elements = {
    // Header/Navigation
    header: document.getElementById('header'),
    menuToggle: document.getElementById('menuToggle'),
    navLinks: document.getElementById('navLinks'),
    
    // Sections
    aboutContent: document.getElementById('aboutContent'),
    skillsContent: document.getElementById('skillsContent'),
    projectsContent: document.getElementById('projectsContent'),
    galleryContent: document.getElementById('galleryContent'),
    experiencesContent: document.getElementById('experiencesContent'),
    educationContent: document.getElementById('educationContent'),
    blogContent: document.getElementById('blogContent'),
    
    // Admin Dashboard
    adminDashboard: document.getElementById('adminDashboard'),
    adminAvatar: document.getElementById('adminAvatar'),
    adminName: document.getElementById('adminName'),
    logoutBtn: document.getElementById('logoutBtn'),
    closeAdminBtn: document.getElementById('closeAdminBtn'),
    
    // Login Modal
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    
    // Other Modals
    skillModal: document.getElementById('skillModal'),
    projectModal: document.getElementById('projectModal'),
    photoModal: document.getElementById('photoModal'),
    experienceModal: document.getElementById('experienceModal'),
    educationModal: document.getElementById('educationModal'),
    blogModal: document.getElementById('blogModal'),
    confirmModal: document.getElementById('confirmModal'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    
    // Loading Screen
    loadingScreen: document.getElementById('loadingScreen')
};

// Global State
let state = {
    currentUser: null,
    isAdmin: false,
    currentModal: null,
    confirmCallback: null,
    dataToDelete: null
};

// Initialize the application
function init() {
    setupEventListeners();
    checkAuthState();
    loadContent();
    
    // Hide loading screen after 1.5 seconds (simulate loading)
    setTimeout(() => {
        elements.loadingScreen.style.display = 'none';
    }, 1500);
}

// Set up event listeners
function setupEventListeners() {
    // Menu toggle
    elements.menuToggle.addEventListener('click', toggleMenu);
    
    // Login form
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close admin dashboard
    if (elements.closeAdminBtn) {
        elements.closeAdminBtn.addEventListener('click', () => {
            elements.adminDashboard.style.display = 'none';
        });
    }
    
    // Admin navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showAdminSection(section);
        });
    });
    
    // Scroll event for header
    window.addEventListener('scroll', handleScroll);
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Admin tab buttons
    document.querySelectorAll('.journey-admin-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });
    
    // Add buttons in admin
    document.getElementById('addSkillBtn').addEventListener('click', () => showModal('skillModal', 'Add New Skill'));
    document.getElementById('addProjectBtn').addEventListener('click', () => showModal('projectModal', 'Add New Project'));
    document.getElementById('addPhotoBtn').addEventListener('click', () => showModal('photoModal', 'Add New Photo'));
    document.getElementById('addExperienceBtn').addEventListener('click', () => showModal('experienceModal', 'Add New Experience'));
    document.getElementById('addEducationBtn').addEventListener('click', () => showModal('educationModal', 'Add New Education'));
    document.getElementById('addBlogBtn').addEventListener('click', () => showModal('blogModal', 'Add New Blog Post'));
    
    // Close buttons for all modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.currentModal) {
                hideModal(state.currentModal);
            }
        });
    });
    
    // Confirm modal buttons
    document.getElementById('confirmCancel').addEventListener('click', () => hideModal('confirmModal'));
    document.getElementById('confirmOk').addEventListener('click', confirmAction);
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(state.currentModal);
        }
    });
}

// Check authentication state
async function checkAuthState() {
    try {
        const user = await appwrite.account.get();
        state.currentUser = user;
        state.isAdmin = true;
        
        // Show admin dashboard button or other admin features
        document.getElementById('loginBtn').textContent = 'Dashboard';
    } catch (error) {
        state.currentUser = null;
        state.isAdmin = false;
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await appwrite.account.createEmailSession(email, password);
        state.currentUser = await appwrite.account.get();
        state.isAdmin = true;
        
        hideModal('loginModal');
        showToast('Login successful!');
        
        // Update UI
        document.getElementById('loginBtn').textContent = 'Dashboard';
    } catch (error) {
        showToast('Login failed. Please check your credentials.', 'error');
        console.error('Login error:', error);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await appwrite.account.deleteSession('current');
        state.currentUser = null;
        state.isAdmin = false;
        
        // Hide admin dashboard
        elements.adminDashboard.style.display = 'none';
        
        // Update UI
        document.getElementById('loginBtn').textContent = 'Admin';
        showToast('Logged out successfully');
    } catch (error) {
        showToast('Logout failed. Please try again.', 'error');
        console.error('Logout error:', error);
    }
}

// Toggle mobile menu
function toggleMenu() {
    elements.navLinks.classList.toggle('active');
}

// Handle scroll for header
function handleScroll() {
    if (window.scrollY > 50) {
        elements.header.classList.add('scrolled');
    } else {
        elements.header.classList.remove('scrolled');
    }
}

// Show modal
function showModal(modalId, title = '') {
    state.currentModal = modalId;
    const modal = document.getElementById(modalId);
    
    if (title && modal.querySelector('h2')) {
        modal.querySelector('h2').textContent = title;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modalId) {
    if (!modalId) return;
    
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    state.currentModal = null;
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// Show confirmation modal
function showConfirm(message, callback, data = null) {
    document.getElementById('confirmModalMessage').textContent = message;
    state.confirmCallback = callback;
    state.dataToDelete = data;
    showModal('confirmModal');
}

// Confirm action
function confirmAction() {
    if (state.confirmCallback) {
        state.confirmCallback(state.dataToDelete);
    }
    hideModal('confirmModal');
}

// Show toast notification
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast ' + type;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Switch tabs
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + 'Tab') {
            content.classList.add('active');
        }
    });
}

// Switch admin tabs
function switchAdminTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.journey-admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.journey-admin-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

// Show admin section
function showAdminSection(sectionId) {
    // Update nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId + 'Section') {
            section.classList.add('active');
        }
    });
    
    // Update section title
    document.getElementById('adminSectionTitle').textContent = 
        sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

// Load content from Appwrite
async function loadContent() {
    try {
        // Load about content
        const about = await appwrite.database.getDocument('about', 'current');
        renderAboutContent(about);
        
        // Load skills
        const skills = await appwrite.database.listDocuments('skills');
        renderSkills(skills.documents);
        
        // Load projects
        const projects = await appwrite.database.listDocuments('projects');
        renderProjects(projects.documents);
        
        // Load gallery photos
        const photos = await appwrite.database.listDocuments('gallery');
        renderGallery(photos.documents);
        
        // Load experiences
        const experiences = await appwrite.database.listDocuments('experiences');
        renderExperiences(experiences.documents);
        
        // Load education
        const education = await appwrite.database.listDocuments('education');
        renderEducation(education.documents);
        
        // Load blog posts
        const blogs = await appwrite.database.listDocuments('blogs', [], 3);
        renderBlogs(blogs.documents);
        
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('Error loading content. Please try again later.', 'error');
    }
}

// Render about content
function renderAboutContent(data) {
    elements.aboutContent.innerHTML = `
        <div class="about-image">
            <img src="${appwrite.storage.getFileView('about-image', data.image)}" alt="About Me">
        </div>
        <div class="about-text">
            <h3>${data.title}</h3>
            <p>${data.content}</p>
            
            <div class="about-goals">
                <h4>My Goals</h4>
                <div class="goal-item">
                    <strong>Short-term:</strong> ${data.shortTermGoal}
                </div>
                <div class="goal-item">
                    <strong>Long-term:</strong> ${data.longTermGoal}
                </div>
            </div>
        </div>
    `;
}

// Render skills
function renderSkills(skills) {
    elements.skillsContent.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <div class="skill-icon">
                <i class="${skill.icon}"></i>
            </div>
            <h3 class="skill-name">${skill.name}</h3>
            <div class="skill-level">
                <div class="skill-level-bar" style="width: ${skill.level}%"></div>
            </div>
            <p>${skill.description}</p>
        </div>
    `).join('');
}

// Render projects
function renderProjects(projects) {
    elements.projectsContent.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-image">
                <img src="${appwrite.storage.getFileView('project-images', project.image)}" alt="${project.title}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-technologies">
                    ${project.technologies.split(',').map(tech => `
                        <span class="technology-tag">${tech.trim()}</span>
                    `).join('')}
                </div>
                <div class="project-links">
                    ${project.link ? `<a href="${project.link}" class="btn-secondary" target="_blank">View Project</a>` : ''}
                    ${project.github ? `<a href="${project.github}" class="btn-outline" target="_blank">GitHub</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Render gallery
function renderGallery(photos) {
    elements.galleryContent.innerHTML = photos.map(photo => `
        <div class="gallery-item">
            <img src="${appwrite.storage.getFileView('gallery-images', photo.image)}" alt="${photo.title}">
            <div class="gallery-overlay">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
                <small>${new Date(photo.date).toLocaleDateString()} • ${photo.location}</small>
            </div>
        </div>
    `).join('');
}

// Render experiences
function renderExperiences(experiences) {
    elements.experiencesContent.innerHTML = experiences.map((exp, index) => `
        <div class="timeline-item ${index % 2 === 0 ? 'even' : 'odd'}">
            <div class="timeline-date">
                ${new Date(exp.startDate).toLocaleDateString()} - 
                ${exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
            </div>
            <div class="timeline-content">
                <h3 class="timeline-title">${exp.title}</h3>
                <p class="timeline-company">${exp.company} • ${exp.location}</p>
                <p>${exp.description}</p>
            </div>
        </div>
    `).join('');
}

// Render education
function renderEducation(education) {
    elements.educationContent.innerHTML = education.map((edu, index) => `
        <div class="timeline-item ${index % 2 === 0 ? 'even' : 'odd'}">
            <div class="timeline-date">
                ${new Date(edu.startDate).toLocaleDateString()} - 
                ${edu.current ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
            </div>
            <div class="timeline-content">
                <h3 class="timeline-title">${edu.degree}</h3>
                <p class="timeline-company">${edu.institution} • ${edu.field}</p>
                ${edu.description ? `<p>${edu.description}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Render blogs
function renderBlogs(blogs) {
    elements.blogContent.innerHTML = blogs.map(blog => `
        <div class="blog-card">
            <div class="blog-image">
                <img src="${appwrite.storage.getFileView('blog-images', blog.image)}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span>${new Date(blog.publishDate).toLocaleDateString()}</span>
                    <span>${blog.category}</span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.excerpt}</p>
                <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `).join('');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
