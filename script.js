const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem('way-home-theme');
const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#edf3f5' : '#06111f');
  if (themeButton) {
    themeButton.setAttribute('aria-pressed', String(theme === 'light'));
    const icon = themeButton.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'light' ? '☀' : '◐';
  }
}

applyTheme(savedTheme || (systemPrefersLight ? 'light' : 'dark'));

if (themeButton) {
  themeButton.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('way-home-theme', next);
    applyTheme(next);
  });
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const gateData = {
  ground: {
    number: '01', label: 'Gate I · Ground', title: 'Before the universe, meet yourself.',
    description: 'Begin with embodiment, breath, nervous-system awareness, emotion, interoception, stillness, and the difference between sensation, thought, interpretation, and belief.',
    question: 'What is happening inside me?', link: 'LIBRARY/'
  },
  know: {
    number: '02', label: 'Gate II · Know', title: 'Meet the inner landscape.',
    description: 'Explore conditioning, identity, intuition, memory, attachment, projection, self-support, self-love, boundaries, and the patterns that shape what feels like self.',
    question: 'Who am I beneath conditioning?', link: 'downloads/intuitive-system.html'
  },
  decode: {
    number: '03', label: 'Gate III · Decode', title: 'Learn the maps without becoming trapped by them.',
    description: 'Study astrology, numerology, Human Design, archetypal systems, planetary functions, and symbolic frameworks as tools for inquiry rather than authorities over your life.',
    question: 'What maps help me understand myself?', link: 'LIBRARY/nyota-yako.html'
  },
  navigate: {
    number: '04', label: 'Gate IV · Navigate', title: 'Learn the rhythms around you.',
    description: 'Work with planetary days, lunar cycles, transits, numerological rhythms, place, seasons, relationship, and timing without confusing symbolism with destiny.',
    question: 'How do time, place, cycles, and relationships affect me?', link: 'LIBRARY/'
  },
  create: {
    number: '05', label: 'Gate V · Create', title: 'Participate consciously.',
    description: 'Bring attention, intention, behavior, visualization, ritual, action, creativity, surrender, environment, and time into relationship with what you are actually building.',
    question: 'How do I consciously participate in my life?', link: 'LIBRARY/'
  },
  remember: {
    number: '06', label: 'Gate VI · Remember', title: 'Study what came before you.',
    description: 'Explore ancestry, cultural memory, inherited stories, lineage, ritual, dreams, symbolism, and what you choose to carry forward or transform.',
    question: 'What came before me, and what do I carry forward?', link: 'LIBRARY/'
  },
  expand: {
    number: '07', label: 'Gate VII · Expand', title: 'Enter advanced inquiry without abandoning discernment.',
    description: 'Explore consciousness, nonduality, karma, subtle-body traditions, sacred geometry, mysticism, metaphysics, and quantum language while keeping metaphor, tradition, and physics distinct.',
    question: 'What might consciousness, spirit, and reality be?', link: 'LIBRARY/'
  },
  return: {
    number: '08', label: 'Gate VIII · Return', title: 'Build a life, not a collection of systems.',
    description: 'Integrate body, mind, emotion, intuition, relationships, work, place, rhythm, spirit, and practice until the frameworks become tools you can set down.',
    question: 'How do I live what I have learned?', link: 'THESIS/'
  }
};

const gateButtons = document.querySelectorAll('.door-choice');
const selectedNumber = document.getElementById('selected-number');
const selectedLabel = document.getElementById('selected-label');
const selectedTitle = document.getElementById('selected-title');
const selectedDescription = document.getElementById('selected-description');
const selectedQuestion = document.getElementById('selected-question');
const selectedLink = document.getElementById('selected-link');

function selectGate(key) {
  const gate = gateData[key];
  if (!gate) return;
  gateButtons.forEach((button) => button.classList.toggle('active', button.dataset.gate === key));
  if (selectedNumber) selectedNumber.textContent = gate.number;
  if (selectedLabel) selectedLabel.textContent = gate.label;
  if (selectedTitle) selectedTitle.textContent = gate.title;
  if (selectedDescription) selectedDescription.textContent = gate.description;
  if (selectedQuestion) selectedQuestion.textContent = gate.question;
  if (selectedLink) selectedLink.href = gate.link;
}

gateButtons.forEach((button) => button.addEventListener('click', () => selectGate(button.dataset.gate)));

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
