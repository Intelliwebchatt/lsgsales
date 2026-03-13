const progressBar = document.getElementById('progress-bar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('site-nav');
const revealEls = document.querySelectorAll('.reveal');
const tiltCards = document.querySelectorAll('.tilt-card');
const gateButtons = document.querySelectorAll('.gate-btn');
const gateCards = document.querySelectorAll('[data-gate-card]');
const gateFeedback = document.getElementById('gate-feedback');
const applicationFormWrap = document.getElementById('application-form-wrap');

function updateProgressBar() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${percent}%`;
}

updateProgressBar();
window.addEventListener('scroll', updateProgressBar, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const gateState = {
  experience: null,
  commission: null,
  transport: null
};

function updateGateUI() {
  gateButtons.forEach((button) => {
    const selected = gateState[button.dataset.gate] === button.dataset.value;
    button.classList.toggle('is-selected', selected);
  });

  gateCards.forEach((card) => {
    const buttons = card.querySelectorAll('.gate-btn');
    const states = Array.from(buttons).map((button) => gateState[button.dataset.gate]);
    const hasYes = states.includes('yes');
    const hasNo = states.includes('no');
    card.classList.toggle('is-yes', hasYes && !hasNo);
    card.classList.toggle('is-no', hasNo);
  });

  const values = Object.values(gateState);
  const allAnswered = values.every((value) => value !== null);
  const allYes = values.every((value) => value === 'yes');

  if (!allAnswered) {
    applicationFormWrap.hidden = true;
    gateFeedback.textContent = 'Answer all three quick checks to unlock the application.';
    gateFeedback.classList.remove('is-blocked');
    return;
  }

  if (allYes) {
    applicationFormWrap.hidden = false;
    gateFeedback.textContent = 'You look like a fit on paper. Complete the application below.';
    gateFeedback.classList.remove('is-blocked');
    return;
  }

  applicationFormWrap.hidden = true;
  gateFeedback.textContent = 'This role is usually a poor fit if any of those answers are no.';
  gateFeedback.classList.add('is-blocked');
}

gateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    gateState[button.dataset.gate] = button.dataset.value;
    updateGateUI();
  });
});

updateGateUI();

const supportsHover = window.matchMedia('(hover: hover)').matches;
if (supportsHover) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) - 0.5) * 7;
      const rotateX = ((y / bounds.height) - 0.5) * -7;
      card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function fillTrackingFields() {
  const params = new URLSearchParams(window.location.search);
  const fields = {
    'page-url': window.location.href,
    'referrer-field': document.referrer || '',
    'utm-source': params.get('utm_source') || '',
    'utm-medium': params.get('utm_medium') || '',
    'utm-campaign': params.get('utm_campaign') || '',
    'utm-content': params.get('utm_content') || '',
    'utm-term': params.get('utm_term') || ''
  };

  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });
}

fillTrackingFields();
