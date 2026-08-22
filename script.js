const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const liveResources = {
  'Thought-Address Log': 'downloads/thought-address-log.html',
  'Inside-Outside Ledger': 'downloads/inside-outside-ledger.html',
  'The Eight Gates': 'downloads/eight-gates-map.html'
};

document.querySelectorAll('.resource-card').forEach((card) => {
  const heading = card.querySelector('h3');
  const status = card.querySelector('.status-pill');
  if (!heading || !status || !liveResources[heading.textContent.trim()]) return;

  const link = document.createElement('a');
  link.className = 'status-pill';
  link.href = liveResources[heading.textContent.trim()];
  link.textContent = 'Open printable';
  link.style.textDecoration = 'none';
  status.replaceWith(link);
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
