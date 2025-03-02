"use strict";

let text = document.getElementById('text');
let bird1 = document.getElementById('bird1');
let bird2 = document.getElementById('bird2');
let rocks = document.getElementById('rocks');
let forest = document.getElementById('forest');
let water = document.getElementById('water');
let header = document.getElementById('header');
let contentSection = document.getElementById('contentSection');

// Buttons
let homeBtn = document.getElementById('homeBtn');
let aboutBtn = document.getElementById('aboutBtn');
let destinationBtn = document.getElementById('destinationBtn');
let contactBtn = document.getElementById('contactBtn');
let journeyBtn = document.getElementById('journeyBtn');
let loginBtn = document.getElementById('loginBtn');

// Menu Toggle
let menuToggle = document.getElementById('menuToggle');
let navLinks = document.getElementById('navLinks');

// Login Modal
let loginModal = document.getElementById('loginModal');
let closeModal = document.querySelector('.close');

// Upload Button and Section
let uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
let uploadSection = document.getElementById('uploadSection');
let closeUpload = document.querySelector('.close-upload');
let uploadForm = document.getElementById('uploadForm');

// Journey Section
let journeySection = document.getElementById('journeySection');

// Public Photos Section
let publicPhotos = document.getElementById('publicPhotos');

// Array to store uploaded photos
let photos = [];

// Hardcoded username and password (for simplicity)
const USERNAME = "soundarrajan";
const PASSWORD = "soundaraakashrajan";

// Toggle Menu on Click
menuToggle.addEventListener('click', function () {
    navLinks.classList.toggle('active');
});

// Open Login Modal
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    loginModal.style.display = 'block';
});

// Close Login Modal
closeModal.addEventListener('click', function () {
    loginModal.style.display = 'none';
});

// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // Validate username and password
    if (username === USERNAME && password === PASSWORD) {
        alert('Login successful!');
        loginModal.style.display = 'none';
        uploadPhotoBtn.style.display = 'block'; // Show upload button
    } else {
        alert('Invalid username or password');
    }
});

// Open Upload Section
uploadPhotoBtn.addEventListener('click', function () {
    uploadSection.style.display = 'block';
});

// Close Upload Section
closeUpload.addEventListener('click', function () {
    uploadSection.style.display = 'none';
});

// Upload Form Submission
uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let file = document.getElementById('photoUpload').files[0];
    let description = document.getElementById('photoDescription').value;

    if (file && description) {
        let reader = new FileReader();
        reader.onload = function (e) {
            // Add the uploaded photo to the array
            photos.push({ src: e.target.result, description: description });

            // Display the uploaded photos in the Journey section
            displayPhotos();

            // Clear the form and close the upload section
            uploadForm.reset();
            uploadSection.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a photo and add a description.');
    }
});

// Function to display photos in the Journey section
function displayPhotos() {
    publicPhotos.innerHTML = ''; // Clear existing photos
    photos.forEach((photo, index) => {
        publicPhotos.innerHTML += `
            <div class="box" style="background-image: url('${photo.src}')">
                <div class="content">
                    <p>${photo.description}</p>
                    <button class="delete-btn" onclick="deletePhoto(${index})">Delete</button>
                </div>
            </div>
        `;
    });
}

// Function to delete a photo
function deletePhoto(index) {
    photos.splice(index, 1); // Remove the photo from the array
    displayPhotos(); // Refresh the display
}

// Scroll effect
window.addEventListener('scroll', function () {
    let value = window.scrollY;
    text.style.top = 50 + value * -.1 + '%';
    bird2.style.top = value * -1.5 + 'px';
    bird2.style.left = value * 2 + 'px';
    bird1.style.top = value * -1.5 + 'px';
    bird1.style.left = value * -5 + 'px';
    rocks.style.top = value * -.12 + 'px';
    forest.style.top = value * .25 + 'px';
    header.style.top = value * .5 + 'px';
});

// Function to scroll to the content section
function scrollToContent() {
    contentSection.scrollIntoView({ behavior: 'smooth' });
}

// Home button functionality
homeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = `
        <h2>Welcome to My Website</h2>
        <p>This is the home section. Feel free to explore!</p>
    `;
    journeySection.style.display = 'none'; // Hide Journey section
    scrollToContent();
});

// About button functionality
aboutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = `
        <h2>About Me</h2>
        <div class="circular"></div>
        <p>Hi, I'm <span class="highlight">Soundarrajan</span>!</p>
        <p>I’m currently pursuing a BSc in Computer Science at ES Arts and Science College.</p>
        <p> I completed my schooling in 2023, marking an important milestone in my academic journey. In my free time, I enjoy playing games and listening to music, which help me relax and unwind. I’m passionate about exploring new interests in the field of technology and always eager to learn and grow.</p>
    `;
    journeySection.style.display = 'none'; // Hide Journey section
    scrollToContent();
});

// Destination button functionality
destinationBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = `
        <h2>My Goals</h2>
        <p><strong>Short-term Goal:</strong> To join an IT company and gain hands-on experience in the industry.</p>
        <p><strong>Long-term Goal:</strong> To start my own business and create a positive impact.</p>
    `;
    journeySection.style.display = 'none'; // Hide Journey section
    scrollToContent();
});

// Contact button functionality
contactBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = `
        <h2>Contact Me</h2>
        <p>If you'd like to get in touch, feel free to reach out to me at:</p>
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
    journeySection.style.display = 'none'; // Hide Journey section
    scrollToContent();
});

// Journey button functionality
journeyBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = ''; // Clear content section
    journeySection.style.display = 'block'; // Show Journey section
    displayPhotos(); // Display uploaded photos
    scrollToContent();
});
