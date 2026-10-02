// ===== Sticky nav shadow on scroll =====
const siteNav = document.getElementById("site-nav");
if (siteNav) {
    window.addEventListener("scroll", () => {
        siteNav.classList.toggle("scrolled", window.scrollY > 10);
    });
}

// ===== Animated stat counters (home page) =====
const statNumbers = document.querySelectorAll(".stat-number");
if (statNumbers.length) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animateCount = (el) => {
        const target = Number(el.dataset.target);
        if (prefersReducedMotion) {
            el.textContent = target.toLocaleString();
            return;
        }
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    statNumbers.forEach((el) => observer.observe(el));
}

// ===== Live doctor showcase (home.html + about.html) =====
async function loadDoctorShowcase(containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch("/api/doctors");

        if (!res.ok) throw new Error("Could not load doctors");
        let doctors = await res.json();
        if (limit) doctors = doctors.slice(0, limit);

        if (!doctors.length) {
            container.innerHTML = `<p style="color:var(--ink-soft)">No doctors listed yet.</p>`;
            return;
        }

        container.innerHTML = doctors.map((doc) => {
            const initials = (doc.user?.name || "DR").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return `
        <div class="doctor-showcase-card">
          <div class="doctor-showcase-avatar">${initials}</div>
          <div class="name">Dr. ${doc.user?.name || "Unknown"}</div>
          <div class="spec">${doc.specialization} &middot; ${doc.experienceYears} yrs</div>
        </div>
      `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<p style="color:var(--ink-soft)">Doctors will appear here once the clinic is set up.</p>`;
    }
}

loadDoctorShowcase("home-doctor-list", 3);
loadDoctorShowcase("about-doctor-list", 6);

// ===== Testimonial carousel (home page) =====
const testimonials = [
    { quote: "I booked a cardiologist in under two minutes and never had to call the front desk once.", author: "Arjun Mehta, patient since 2024" },
    { quote: "Setting my weekly availability took five minutes. Patients book around it automatically now.", author: "Dr. Priya Sharma, Cardiologist" },
    { quote: "No more double-booked slots. The system catches conflicts before they happen.", author: "Dr. Rohan Mehta, Dermatologist" }
];

const testimonialText = document.getElementById("testimonial-text");
const testimonialAuthor = document.getElementById("testimonial-author");
const testimonialDots = document.getElementById("testimonial-dots");

if (testimonialText && testimonialDots) {
    let current = 0;

    function renderTestimonial(index) {
        testimonialText.textContent = `"${testimonials[index].quote}"`;
        testimonialAuthor.textContent = `— ${testimonials[index].author}`;
        testimonialDots.querySelectorAll("button").forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }

    testimonials.forEach((_, i) => {
        const dot = document.createElement("button");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
            current = i;
            renderTestimonial(current);
        });
        testimonialDots.appendChild(dot);
    });

    setInterval(() => {
        current = (current + 1) % testimonials.length;
        renderTestimonial(current);
    }, 5000);
}

// ===== FAQ accordion (contact page) =====
document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("open");

        document.querySelectorAll(".faq-item.open").forEach((openItem) => {
            openItem.classList.remove("open");
            openItem.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isOpen) {
            item.classList.add("open");
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

// ===== Contact form (client-side only for now) =====
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const successBox = document.getElementById("contact-success");
        contactForm.reset();
        successBox.classList.remove("hidden");
        setTimeout(() => successBox.classList.add("hidden"), 4000);
    });
}