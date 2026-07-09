// ================================
// Cyberpunk Portfolio Script
// ================================

// Welcome message
console.log("⚡ Welcome to Anurag Kumar's Portfolio");

// Typing Animation
const typingText = document.querySelector(".typing");

const texts = [
    "🤖 AI Developer",
    "💻 Python Learner",
    "🚀 Open Source Enthusiast",
    "⚡ Building Nexus AI",
    "🌐 Full Stack Developer"
];

let textIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {

    const current = texts[textIndex];

    if (!deleting) {
        typingText.textContent = current.substring(0, charIndex++);
    } else {
        typingText.textContent = current.substring(0, charIndex--);
    }

    let speed = deleting ? 50 : 100;

    if (!deleting && charIndex === current.length + 1) {
        deleting = true;
        speed = 1500;
    }

    if (deleting && charIndex === 0) {
        deleting = false;
        textIndex = (textIndex + 1) % texts.length;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

// Card Animation
const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }

    });

});

cards.forEach(card => {

    card.style.opacity = "0";
    card.style.transform = "translateY(50px)";
    card.style.transition = "0.8s";

    observer.observe(card);

});
