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
    scrollToContent(); // Scroll to the content section
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
    scrollToContent(); // Scroll to the content section
});

// Destination button functionality
destinationBtn.addEventListener('click', function (e) {
    e.preventDefault();
    contentSection.innerHTML = `
        <h2>My Goals</h2>
        <p><strong>Short-term Goal:</strong> To join an IT company and gain hands-on experience in the industry.</p>
        <p><strong>Long-term Goal:</strong> To start my own business and create a positive impact.</p>
    `;
    scrollToContent(); // Scroll to the content section
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
    scrollToContent(); // Scroll to the content section
});
