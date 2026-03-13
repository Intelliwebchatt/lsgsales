// ── Mark JS as loaded (enables animations safely) ───
document.body.classList.add('js-loaded');

// ── Progress bar ─────────────────────────────────────
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  if (!progressBar) return;
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
}
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });

// ── Reveal on scroll ──────────────────────────────────
const revealEls = document.querySelectorAll('.reveal-up');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => observer.observe(el));
} else {
  // Fallback: show everything immediately
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ── Mobile nav ────────────────────────────────────────
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.getElementById('site-nav');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', function() {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when any link is tapped
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Smooth scroll for anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Tilt cards (desktop only) ─────────────────────────
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width  - 0.5;
      const y = (e.clientY - b.top)  / b.height - 0.5;
      card.style.transform = 'translateY(-4px) rotateX(' + (y * -6) + 'deg) rotateY(' + (x * 6) + 'deg)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
}

// ── Gate logic ────────────────────────────────────────
var gateState    = { experience: null, commission: null, transport: null };
var gateFeedback = document.getElementById('gate-feedback');
var formSection  = document.getElementById('application-form-wrap');
var gateButtons  = document.querySelectorAll('.gate-btn');
var gateCards    = document.querySelectorAll('[data-gate-card]');

function updateGate() {
  // Button selected states
  gateButtons.forEach(function(btn) {
    btn.classList.toggle('is-selected', gateState[btn.dataset.gate] === btn.dataset.value);
  });

  // Card states
  gateCards.forEach(function(card) {
    var btns   = card.querySelectorAll('.gate-btn');
    var hasYes = Array.from(btns).some(function(b) { return gateState[b.dataset.gate] === 'yes'; });
    var hasNo  = Array.from(btns).some(function(b) { return gateState[b.dataset.gate] === 'no'; });
    card.classList.toggle('is-yes', hasYes && !hasNo);
    card.classList.toggle('is-no', hasNo);
  });

  var vals        = Object.values(gateState);
  var allAnswered = vals.every(function(v) { return v !== null; });
  var allYes      = vals.every(function(v) { return v === 'yes'; });

  if (!allAnswered) {
    if (formSection) formSection.hidden = true;
    if (gateFeedback) {
      gateFeedback.textContent = 'Answer all three to unlock the application.';
      gateFeedback.classList.remove('is-blocked');
    }
    return;
  }

  if (allYes) {
    if (formSection) formSection.hidden = false;
    if (gateFeedback) {
      gateFeedback.textContent = 'You look like a fit on paper. Complete the application below.';
      gateFeedback.classList.remove('is-blocked');
    }
    return;
  }

  if (formSection) formSection.hidden = true;
  if (gateFeedback) {
    gateFeedback.textContent = 'This role is usually a poor fit if any answer is no.';
    gateFeedback.classList.add('is-blocked');
  }
}

gateButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    gateState[btn.dataset.gate] = btn.dataset.value;
    updateGate();
  });
});

updateGate();

// ── UTM tracking fields ───────────────────────────────
(function fillTracking() {
  var params = new URLSearchParams(window.location.search);
  var map = {
    'page-url':       window.location.href,
    'referrer-field': document.referrer || '',
    'utm-source':     params.get('utm_source')   || '',
    'utm-medium':     params.get('utm_medium')   || '',
    'utm-campaign':   params.get('utm_campaign') || '',
    'utm-content':    params.get('utm_content')  || '',
    'utm-term':       params.get('utm_term')     || ''
  };
  Object.entries(map).forEach(function(entry) {
    var el = document.getElementById(entry[0]);
    if (el) el.value = entry[1];
  });
})();
