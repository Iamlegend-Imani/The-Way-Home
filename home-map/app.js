(() => {
  'use strict';

  const STORAGE_KEY = 'home-map-v0';
  const THEME_KEY = 'home-map-theme';

  const gates = [
    { name: 'Ground', prompt: 'What is actually here?', copy: 'Return to body, environment and what is verifiably present.' },
    { name: 'Know', prompt: 'What is mine?', copy: 'Notice values, needs, boundaries and the shape of self.' },
    { name: 'Decode', prompt: 'What pattern is speaking?', copy: 'Read recurring signals without turning them into destiny.' },
    { name: 'Navigate', prompt: 'Where am I in time?', copy: 'Use cycles as context for conscious choice.' },
    { name: 'Create', prompt: 'What wants to exist?', copy: 'Move from observation into aligned action and experiment.' },
    { name: 'Remember', prompt: 'What have I already learned?', copy: 'Keep memory so wisdom does not have to restart at zero.' },
    { name: 'Expand', prompt: 'What can become more alive?', copy: 'Meet possibility without abandoning capacity.' },
    { name: 'Return', prompt: 'What is true now?', copy: 'Integrate, release and begin again from the present.' }
  ];

  const domains = [
    { id: 'body', name: 'Body', prompt: 'Energy, sensation, movement, recovery and physical capacity.' },
    { id: 'mind', name: 'Mind', prompt: 'Attention, thought, learning, beliefs and mental spaciousness.' },
    { id: 'love', name: 'Love', prompt: 'Intimacy, relationships, boundaries, reciprocity and belonging.' },
    { id: 'home', name: 'Home', prompt: 'Place, safety, environment, roots and the spaces holding you.' },
    { id: 'work', name: 'Work', prompt: 'Contribution, craft, leadership, systems and livelihood.' },
    { id: 'money', name: 'Money', prompt: 'Resources, receiving, stewardship, security and possibility.' },
    { id: 'creation', name: 'Creation', prompt: 'Ideas, expression, making, play and what wants to exist.' },
    { id: 'purpose', name: 'Purpose', prompt: 'Direction, service, meaning and the work beneath the work.' },
    { id: 'spirit', name: 'Spirit', prompt: 'Intuition, practice, mystery, consciousness and connection.' },
    { id: 'community', name: 'Community', prompt: 'Friendship, kinship, networks, contribution and collective life.' },
    { id: 'nature', name: 'Nature', prompt: 'Ground, season, elements, ecology and the more-than-human world.' },
    { id: 'technology', name: 'Technology', prompt: 'Tools, information, agency, boundaries and co-creation with machines.' }
  ];

  const planetaryDays = [
    { ruler: 'Sun', title: 'Heart before performance.', copy: 'Orient toward what feels alive, generous and unmistakably yours.' },
    { ruler: 'Moon', title: 'Feel before forcing.', copy: 'Let feeling become information. Notice what needs patience, care or containment.' },
    { ruler: 'Mars', title: 'Act where authenticity is present.', copy: 'Use action to clarify what is true rather than outrun uncertainty.' },
    { ruler: 'Mercury', title: 'Think for yourself before repeating.', copy: 'Name the thing clearly. Communication gets cleaner when self-thinking is active.' },
    { ruler: 'Jupiter', title: 'Expand what can hold expansion.', copy: 'Look for possibility, but let capacity and integrity set the size of the next step.' },
    { ruler: 'Venus', title: 'Choose what is worthy of your attention.', copy: 'Notice value, beauty, pleasure, relationship and what reciprocity feels like.' },
    { ruler: 'Saturn', title: 'Structure can be a form of care.', copy: 'Simplify, complete, rest, repair and give what matters a container.' }
  ];

  const returnQuestions = [
    'What is true before you explain it?',
    'What would remain if urgency disappeared?',
    'Where are you using effort where relationship would work better?',
    'What keeps repeating because it has not been witnessed clearly?',
    'What are you ready to create without needing permission?',
    'What does your body know before your schedule speaks?',
    'What are you returning to that was never actually lost?'
  ];

  const metricNames = { energy: 'Energy', clarity: 'Clarity', capacity: 'Capacity', connection: 'Connection' };

  const blankState = () => ({
    version: 1,
    profile: null,
    domains: Object.fromEntries(domains.map(d => [d.id, { score: 5, note: '', updatedAt: null }])),
    checkins: [],
    journal: [],
    selectedDomain: 'body',
    demoLoaded: false
  });

  let state = loadState();
  let activeMetric = 'energy';
  let activeJournalId = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return blankState();
      const parsed = JSON.parse(raw);
      const base = blankState();
      return {
        ...base,
        ...parsed,
        domains: { ...base.domains, ...(parsed.domains || {}) },
        checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
        journal: Array.isArray(parsed.journal) ? parsed.journal : []
      };
    } catch (e) {
      console.warn('HOME//MAP could not read saved state.', e);
      return blankState();
    }
  }

  function saveState(message) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (message) toast(message);
  }

  function byId(id) { return document.getElementById(id); }
  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function toast(message) {
    const el = byId('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function populateSelect(select, items, selected) {
    select.innerHTML = items.map(item => {
      const value = typeof item === 'string' ? item : item.value;
      const label = typeof item === 'string' ? item : item.label;
      return `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`;
    }).join('');
  }

  function formatDate(isoOrDate, withTime = false) {
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', withTime
      ? { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }
      : { month:'short', day:'numeric', year:'numeric' }).format(d);
  }

  function moonPhase(date = new Date()) {
    // Approximate synodic phase for reflective context, not ephemeris-grade astrology.
    const synodic = 29.53058867;
    const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
    const days = (date.getTime() - knownNewMoon) / 86400000;
    const age = ((days % synodic) + synodic) % synodic;
    if (age < 1.84566) return 'New Moon';
    if (age < 5.53699) return 'Waxing Crescent';
    if (age < 9.22831) return 'First Quarter';
    if (age < 12.91963) return 'Waxing Gibbous';
    if (age < 16.61096) return 'Full Moon';
    if (age < 20.30228) return 'Waning Gibbous';
    if (age < 23.99361) return 'Last Quarter';
    if (age < 27.68493) return 'Waning Crescent';
    return 'New Moon';
  }

  function dayQuadrant(date = new Date()) {
    const h = date.getHours();
    if (h < 6) return 'Dream · 00–06';
    if (h < 12) return 'Emerge · 06–12';
    if (h < 18) return 'Express · 12–18';
    return 'Return · 18–24';
  }

  function renderToday() {
    const now = new Date();
    const p = planetaryDays[now.getDay()];
    byId('todayDate').textContent = new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric' }).format(now);
    byId('planetaryDay').textContent = p.ruler;
    byId('moonPhase').textContent = moonPhase(now);
    byId('dayQuadrant').textContent = dayQuadrant(now);
    byId('orientationTitle').textContent = p.title;
    byId('orientationCopy').textContent = p.copy;
    byId('returnQuestion').textContent = returnQuestions[now.getDay()];
    byId('currentGate').textContent = state.profile?.gate || 'Ground';

    const latest = [...state.checkins].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    if (latest) {
      const score = Math.round(latest.capacity * 10);
      byId('pulseScore').textContent = `${score}%`;
      byId('pulseRing').style.background = `conic-gradient(var(--accent) ${score * 3.6}deg, rgba(255,255,255,.07) 0deg)`;
      const domain = domains.find(d => d.id === latest.domain)?.name || 'Self';
      byId('lastState').textContent = `${domain} is speaking.`;
      byId('lastStateCopy').textContent = `${formatDate(latest.createdAt, true)} · energy ${latest.energy}/10 · clarity ${latest.clarity}/10 · capacity ${latest.capacity}/10`;
    } else {
      byId('pulseScore').textContent = '—';
      byId('pulseRing').style.background = 'conic-gradient(var(--accent) 0deg, rgba(255,255,255,.07) 0deg)';
      byId('lastState').textContent = 'No signal yet';
      byId('lastStateCopy').textContent = 'Your map becomes more useful as you add observations over time.';
    }

    renderDomainStrip();
    renderPatternPreview();
  }

  function renderDomainStrip() {
    byId('domainStrip').innerHTML = domains.map(d => {
      const data = state.domains[d.id] || { score: 5 };
      return `<button class="domain-chip" data-domain-jump="${d.id}"><strong>${d.name}</strong><span>${data.score}/10</span><div class="bar"><i style="width:${data.score * 10}%"></i></div></button>`;
    }).join('');
    document.querySelectorAll('[data-domain-jump]').forEach(btn => btn.addEventListener('click', () => {
      state.selectedDomain = btn.dataset.domainJump;
      saveState();
      switchView('map');
      renderMap();
    }));
  }

  function renderMap() {
    renderConstellation();
    renderDomainPanel();
    renderGates();
  }

  function renderConstellation() {
    const svg = byId('constellation');
    const cx = 380, cy = 380;
    const radii = [235, 288];
    const selected = state.selectedDomain || 'body';
    let html = `
      <defs><radialGradient id="nodeGlow"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
      <circle class="orbit" cx="${cx}" cy="${cy}" r="235"/><circle class="orbit" cx="${cx}" cy="${cy}" r="288"/>
    `;
    const points = domains.map((d, i) => {
      const ring = i % 2;
      const ringIndex = Math.floor(i / 2);
      const angle = (-Math.PI / 2) + (ringIndex / 6) * Math.PI * 2 + (ring ? Math.PI / 6 : 0);
      const r = radii[ring];
      return { d, x: cx + Math.cos(angle)*r, y: cy + Math.sin(angle)*r };
    });
    html += points.map(p => `<line class="link-line" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`).join('');
    html += `<g class="domain-node center-node"><circle cx="${cx}" cy="${cy}" r="66"/><text x="${cx}" y="${cy-3}">SELF</text><text class="score-text" x="${cx}" y="${cy+20}">NOTHING IS SEPARATE</text></g>`;
    html += points.map(({d,x,y}) => {
      const score = state.domains[d.id]?.score || 5;
      const radius = 31 + score * 1.7;
      return `<g class="domain-node ${d.id === selected ? 'active' : ''}" data-domain="${d.id}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" opacity="${0.52 + score * .045}"/>
        <text x="${x.toFixed(1)}" y="${(y-2).toFixed(1)}">${d.name}</text>
        <text class="score-text" x="${x.toFixed(1)}" y="${(y+17).toFixed(1)}">${score}/10</text>
      </g>`;
    }).join('');
    svg.innerHTML = html;
    svg.querySelectorAll('[data-domain]').forEach(node => node.addEventListener('click', () => {
      state.selectedDomain = node.dataset.domain;
      saveState();
      renderConstellation();
      renderDomainPanel();
    }));
  }

  function renderDomainPanel() {
    const id = state.selectedDomain || 'body';
    const domain = domains.find(d => d.id === id) || domains[0];
    const data = state.domains[id] || { score:5, note:'' };
    byId('domainPanelTitle').textContent = domain.name;
    byId('domainPanelPrompt').textContent = domain.prompt;
    byId('domainScore').value = data.score;
    byId('domainScoreLabel').textContent = `${data.score}/10`;
    byId('domainNote').value = data.note || '';
  }

  function renderGates() {
    const current = state.profile?.gate || 'Ground';
    byId('gatesGrid').innerHTML = gates.map((g,i) => `<button class="gate-card ${current === g.name ? 'active' : ''}" data-gate="${g.name}"><span>0${i+1}</span><strong>${g.name}</strong><p>${g.copy}</p></button>`).join('');
    document.querySelectorAll('[data-gate]').forEach(btn => btn.addEventListener('click', () => {
      if (!state.profile) openOnboarding();
      else {
        state.profile.gate = btn.dataset.gate;
        saveState(`Current gate: ${btn.dataset.gate}`);
        renderGates();
        renderToday();
      }
    }));
  }

  function saveSelectedDomain() {
    const id = state.selectedDomain || 'body';
    const score = Number(byId('domainScore').value);
    state.domains[id] = { score, note: byId('domainNote').value.trim(), updatedAt: new Date().toISOString() };
    saveState(`${domains.find(d=>d.id===id).name} updated`);
    renderMap();
    renderToday();
  }

  function openOnboarding() {
    const p = state.profile || {};
    byId('profileFirstName').value = p.firstName || '';
    byId('profileEmail').value = p.email || '';
    byId('profileBirthDate').value = p.birthDate || '';
    byId('profileBirthTime').value = p.birthTime || '';
    byId('profileBirthPlace').value = p.birthPlace || '';
    populateSelect(byId('profileAttention'), domains.map(d=>({value:d.id,label:d.name})), p.attention || 'body');
    populateSelect(byId('profileGate'), gates.map(g=>g.name), p.gate || 'Ground');
    byId('profileReturning').value = p.returning || '';
    byId('onboardingDialog').showModal();
  }

  function submitOnboarding(event) {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const firstName = byId('profileFirstName').value.trim();
    if (!firstName) return;
    state.profile = {
      firstName,
      email: byId('profileEmail').value.trim(),
      birthDate: byId('profileBirthDate').value,
      birthTime: byId('profileBirthTime').value,
      birthPlace: byId('profileBirthPlace').value.trim(),
      attention: byId('profileAttention').value,
      gate: byId('profileGate').value,
      returning: byId('profileReturning').value.trim(),
      updatedAt: new Date().toISOString()
    };
    state.selectedDomain = state.profile.attention;
    saveState(`Welcome home, ${firstName}.`);
    byId('onboardingDialog').close();
    renderAll();
  }

  function buildCheckinSliders() {
    const metrics = [
      ['energy','Energy','How much usable energy is present?'],
      ['clarity','Clarity','How clear does the inner signal feel?'],
      ['capacity','Capacity','How much can you genuinely hold today?'],
      ['connection','Connection','How connected do you feel to self/life?']
    ];
    byId('checkinSliders').innerHTML = metrics.map(([id,label,prompt]) => `<div class="slider-card"><header><span title="${prompt}">${label}</span><strong id="${id}Value">5</strong></header><input id="${id}Slider" type="range" min="1" max="10" value="5" /></div>`).join('');
    metrics.forEach(([id]) => byId(`${id}Slider`).addEventListener('input', e => byId(`${id}Value`).textContent = e.target.value));
  }

  function openCheckin() {
    buildCheckinSliders();
    populateSelect(byId('checkinDomain'), domains.map(d=>({value:d.id,label:d.name})), state.profile?.attention || state.selectedDomain || 'body');
    populateSelect(byId('checkinGate'), gates.map(g=>g.name), state.profile?.gate || 'Ground');
    byId('checkinNote').value = '';
    byId('checkinDialog').showModal();
  }

  function submitCheckin(event) {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const entry = {
      id: uid('checkin'),
      createdAt: new Date().toISOString(),
      energy: Number(byId('energySlider').value),
      clarity: Number(byId('claritySlider').value),
      capacity: Number(byId('capacitySlider').value),
      connection: Number(byId('connectionSlider').value),
      domain: byId('checkinDomain').value,
      gate: byId('checkinGate').value,
      note: byId('checkinNote').value.trim(),
      context: {
        dayOfWeek: new Date().getDay(),
        planetaryDay: planetaryDays[new Date().getDay()].ruler,
        moonPhase: moonPhase(),
        quadrant: dayQuadrant()
      }
    };
    state.checkins.push(entry);
    if (state.profile) state.profile.gate = entry.gate;
    state.selectedDomain = entry.domain;
    saveState('Check-in added to your map');
    byId('checkinDialog').close();
    renderAll();
  }

  function pearson(data, xKey, yKey) {
    if (data.length < 3) return null;
    const xs = data.map(d=>Number(d[xKey]));
    const ys = data.map(d=>Number(d[yKey]));
    const avg = a => a.reduce((s,v)=>s+v,0)/a.length;
    const mx = avg(xs), my = avg(ys);
    let num=0, dx=0, dy=0;
    xs.forEach((x,i)=>{ const a=x-mx,b=ys[i]-my; num+=a*b; dx+=a*a; dy+=b*b; });
    if (!dx || !dy) return 0;
    return num/Math.sqrt(dx*dy);
  }

  function renderPatternPreview() {
    const data = state.checkins;
    if (data.length < 3) {
      byId('patternPreviewTitle').textContent = 'We need a little history.';
      byId('patternPreview').textContent = `${data.length} of at least 3 observations recorded. HOME//MAP will surface correlations from your own check-ins, not universal rules.`;
      return;
    }
    const r = pearson(data, 'energy', 'clarity');
    const descriptor = Math.abs(r) >= .65 ? 'strongly' : Math.abs(r) >= .35 ? 'moderately' : 'only slightly';
    const direction = r >= 0 ? 'together' : 'in opposite directions';
    byId('patternPreviewTitle').textContent = 'A signal is beginning to appear.';
    byId('patternPreview').textContent = `Across ${data.length} recorded observations, energy and clarity have moved ${descriptor} ${direction} (r=${r.toFixed(2)}). This is a correlation in your current dataset, not a causal claim.`;
  }

  function renderPatterns() {
    renderChart();
    renderPatternCards();
  }

  function renderChart() {
    const svg = byId('patternChart');
    const data = [...state.checkins].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    byId('chartMetricTitle').textContent = metricNames[activeMetric];
    byId('chartCount').textContent = `${data.length} observation${data.length === 1 ? '' : 's'}`;
    const W=960,H=360,left=52,right=28,top=24,bottom=50,iw=W-left-right,ih=H-top-bottom;
    let html = `<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".8"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>`;
    [2,4,6,8,10].forEach(v=>{
      const y=top+ih-(v-1)/9*ih;
      html += `<line class="chart-grid-line" x1="${left}" y1="${y}" x2="${W-right}" y2="${y}"/><text class="chart-axis-text" x="${left-18}" y="${y+4}">${v}</text>`;
    });
    if (!data.length) {
      html += `<text class="chart-empty" x="${W/2}" y="${H/2}">Add a check-in, or load demo data to test the graph.</text>`;
      svg.innerHTML = html;
      return;
    }
    const points=data.map((d,i)=>{
      const x=data.length===1?left+iw/2:left+(i/(data.length-1))*iw;
      const y=top+ih-((d[activeMetric]-1)/9)*ih;
      return {x,y,d};
    });
    const line=points.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area=`${line} L ${points[points.length-1].x.toFixed(1)} ${top+ih} L ${points[0].x.toFixed(1)} ${top+ih} Z`;
    html += `<path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/>`;
    const maxLabels=Math.min(data.length,6);
    const labelIndexes=new Set(Array.from({length:maxLabels},(_,i)=>Math.round(i*(data.length-1)/Math.max(1,maxLabels-1))));
    points.forEach((p,i)=>{
      html += `<circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="5"><title>${formatDate(p.d.createdAt)} · ${metricNames[activeMetric]} ${p.d[activeMetric]}/10</title></circle>`;
      if(labelIndexes.has(i)) html += `<text class="chart-axis-text" text-anchor="middle" x="${p.x}" y="${H-18}">${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date(p.d.createdAt))}</text>`;
    });
    svg.innerHTML=html;
  }

  function renderPatternCards() {
    const data=state.checkins;
    const box=byId('patternCards');
    if(data.length<3){
      box.innerHTML=`<article class="pattern-card"><span class="eyebrow">Pattern threshold</span><strong>${data.length}/3</strong><p>Three observations unlock the first basic relationship signal. More history makes comparisons less fragile.</p></article><article class="pattern-card"><span class="eyebrow">Method</span><strong>Correlation ≠ cause</strong><p>HOME//MAP describes what moved together in your entries. It does not claim one signal caused another.</p></article><article class="pattern-card"><span class="eyebrow">Context</span><strong>Your data first</strong><p>Cycle and astrology labels can be stored as context, but your lived observations remain the primary evidence layer.</p></article>`;
      return;
    }
    const avg = key => data.reduce((s,d)=>s+Number(d[key]),0)/data.length;
    const r=pearson(data,'energy','clarity');
    const byDomain={}; data.forEach(d=>{(byDomain[d.domain] ||= []).push(d);});
    const domainRows=Object.entries(byDomain).map(([id,rows])=>({id,count:rows.length,capacity:rows.reduce((s,d)=>s+d.capacity,0)/rows.length})).sort((a,b)=>b.count-a.count);
    const frequent=domainRows[0];
    const frequentName=domains.find(d=>d.id===frequent?.id)?.name || '—';
    const byDay={}; data.forEach(d=>{const day=new Date(d.createdAt).getDay();(byDay[day] ||= []).push(d);});
    const dayRows=Object.entries(byDay).map(([day,rows])=>({day:Number(day),avg:rows.reduce((s,d)=>s+d[activeMetric],0)/rows.length,n:rows.length})).sort((a,b)=>b.avg-a.avg);
    const best=dayRows[0];
    const dayName=best?new Intl.DateTimeFormat('en-US',{weekday:'long'}).format(new Date(2026,7,16+best.day)):'—';
    box.innerHTML=`
      <article class="pattern-card"><span class="eyebrow">Energy ↔ clarity</span><strong>r = ${r.toFixed(2)}</strong><p>${Math.abs(r)>=.65?'A strong':Math.abs(r)>=.35?'A moderate':'A weak'} ${r>=0?'positive':'negative'} relationship appears in these ${data.length} observations. Treat it as a clue, not a conclusion.</p></article>
      <article class="pattern-card"><span class="eyebrow">Most recorded domain</span><strong>${esc(frequentName)}</strong><p>${frequent.count} of ${data.length} check-ins named this as the dominant domain. Frequency can reflect attention, friction, importance, or all three.</p></article>
      <article class="pattern-card"><span class="eyebrow">Highest ${metricNames[activeMetric].toLowerCase()} day</span><strong>${dayName}</strong><p>Average ${metricNames[activeMetric].toLowerCase()} ${best.avg.toFixed(1)}/10 across ${best.n} recorded ${best.n===1?'entry':'entries'} on this weekday. Small samples can change quickly.</p></article>
      <article class="pattern-card"><span class="eyebrow">Current average</span><strong>${avg(activeMetric).toFixed(1)}/10</strong><p>Your average recorded ${metricNames[activeMetric].toLowerCase()} across the current dataset.</p></article>
    `;
  }

  function loadDemoData() {
    if (state.demoLoaded && state.checkins.some(c=>c.demo)) return toast('Demo data is already loaded.');
    const now = Date.now();
    const samples = [
      [9,6,5,6,'work','Ground'],[8,7,6,7,'creation','Know'],[7,8,7,7,'body','Decode'],[5,5,4,5,'love','Navigate'],[6,7,6,6,'spirit','Create'],[8,9,8,8,'creation','Remember'],[7,8,7,9,'community','Expand'],[9,9,8,8,'work','Return']
    ];
    samples.forEach((s,i)=>{
      const createdAt=new Date(now-(samples.length-1-i)*86400000).toISOString();
      state.checkins.push({id:uid('demo'),createdAt,energy:s[0],clarity:s[1],capacity:s[2],connection:s[3],domain:s[4],gate:s[5],note:'Demo observation',demo:true,context:{dayOfWeek:new Date(createdAt).getDay(),planetaryDay:planetaryDays[new Date(createdAt).getDay()].ruler,moonPhase:moonPhase(new Date(createdAt)),quadrant:'Demo'}});
    });
    state.demoLoaded=true;
    saveState('Demo observations loaded');
    renderAll();
  }

  function renderJournal() {
    populateSelect(byId('journalGate'), gates.map(g=>g.name), state.profile?.gate || 'Ground');
    const sorted=[...state.journal].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    if(!activeJournalId && sorted.length) activeJournalId=sorted[0].id;
    byId('journalList').innerHTML=sorted.length?sorted.map(j=>`<div class="journal-item ${j.id===activeJournalId?'active':''}" data-journal-id="${j.id}"><strong>${esc(j.title || 'Untitled observation')}</strong><span>${formatDate(j.updatedAt)} · ${esc(j.gate || 'Remember')}</span></div>`).join(''):`<div class="journal-item"><strong>No entries yet.</strong><span>Your first clue can begin here.</span></div>`;
    document.querySelectorAll('[data-journal-id]').forEach(el=>el.addEventListener('click',()=>{activeJournalId=el.dataset.journalId;renderJournal();}));
    const current=state.journal.find(j=>j.id===activeJournalId);
    if(current){
      byId('journalTitleInput').value=current.title || '';
      byId('journalBody').value=current.body || '';
      byId('journalDate').textContent=formatDate(current.updatedAt,true);
      byId('journalGate').value=current.gate || 'Remember';
      byId('deleteJournalBtn').style.visibility='visible';
    } else {
      byId('journalTitleInput').value='';
      byId('journalBody').value='';
      byId('journalDate').textContent='New entry';
      byId('journalGate').value=state.profile?.gate || 'Remember';
      byId('deleteJournalBtn').style.visibility='hidden';
    }
  }

  function newJournal() {
    activeJournalId=null;
    renderJournal();
    byId('journalTitleInput').focus();
  }

  function saveJournal() {
    const now=new Date().toISOString();
    const title=byId('journalTitleInput').value.trim();
    const body=byId('journalBody').value.trim();
    const gate=byId('journalGate').value;
    if(!title && !body) return toast('Write something first.');
    if(activeJournalId){
      const j=state.journal.find(j=>j.id===activeJournalId);
      if(j) Object.assign(j,{title:title||'Untitled observation',body,gate,updatedAt:now});
    } else {
      const j={id:uid('journal'),title:title||'Untitled observation',body,gate,createdAt:now,updatedAt:now};
      state.journal.push(j); activeJournalId=j.id;
    }
    saveState('Entry remembered');
    renderJournal();
  }

  function deleteJournal() {
    if(!activeJournalId) return;
    state.journal=state.journal.filter(j=>j.id!==activeJournalId);
    activeJournalId=null;
    saveState('Entry deleted');
    renderJournal();
  }

  function renderSettings() {
    if(state.profile){
      byId('profileName').textContent=`${state.profile.firstName}’s map`;
      const bits=[state.profile.birthPlace,state.profile.gate && `Gate: ${state.profile.gate}`,state.profile.attention && `Attention: ${domains.find(d=>d.id===state.profile.attention)?.name}`].filter(Boolean);
      byId('profileMeta').textContent=bits.join(' · ') || 'Profile saved locally.';
    } else {
      byId('profileName').textContent='Your map';
      byId('profileMeta').textContent='Complete onboarding to locate yourself.';
    }
  }

  function exportData() {
    const payload=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);
    const blob=new Blob([payload],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`home-map-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
    toast('Map exported');
  }

  function importData(file) {
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(reader.result);
        if(!parsed || typeof parsed!=='object' || !Array.isArray(parsed.checkins)) throw new Error('Invalid HOME//MAP file');
        const base=blankState();
        state={...base,...parsed,domains:{...base.domains,...(parsed.domains||{})},checkins:parsed.checkins||[],journal:parsed.journal||[]};
        saveState('Map imported');
        renderAll();
      }catch(e){toast('That file is not a valid HOME//MAP export.');}
    };
    reader.readAsText(file);
  }

  function eraseAll() {
    const confirmed=window.confirm('Erase this HOME//MAP profile, every check-in, journal entry and domain note from this browser? This cannot be undone unless you exported a copy.');
    if(!confirmed) return;
    state=blankState(); activeJournalId=null; localStorage.removeItem(STORAGE_KEY); renderAll(); toast('Local map erased');
  }

  function renderProfileGreeting() {
    const heroTitle=byId('todayTitle');
    heroTitle.textContent=state.profile?.firstName ? `${state.profile.firstName}, this is your inner weather.` : 'Your inner weather';
  }

  function switchView(name) {
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
    document.querySelectorAll('.nav-item').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
    if(name==='map') renderMap();
    if(name==='patterns') renderPatterns();
    if(name==='journal') renderJournal();
    if(name==='settings') renderSettings();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderAll() {
    renderProfileGreeting();
    renderToday();
    renderMap();
    renderPatterns();
    renderJournal();
    renderSettings();
  }

  function bindEvents() {
    document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
    document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.jump)));
    byId('themeBtn').addEventListener('click',()=>{
      const light=!document.body.classList.contains('light');
      document.body.classList.toggle('light',light);
      localStorage.setItem(THEME_KEY,light?'light':'dark');
    });
    byId('quickCheckinBtn').addEventListener('click',openCheckin);
    byId('todayCheckinBtn').addEventListener('click',openCheckin);
    byId('saveDomainBtn').addEventListener('click',saveSelectedDomain);
    byId('domainScore').addEventListener('input',e=>byId('domainScoreLabel').textContent=`${e.target.value}/10`);
    byId('onboardingForm').addEventListener('submit',submitOnboarding);
    byId('checkinForm').addEventListener('submit',submitCheckin);
    byId('demoDataBtn').addEventListener('click',loadDemoData);
    document.querySelectorAll('.metric-tab').forEach(btn=>btn.addEventListener('click',()=>{
      activeMetric=btn.dataset.metric;
      document.querySelectorAll('.metric-tab').forEach(b=>b.classList.toggle('active',b===btn));
      renderPatterns();
    }));
    byId('newJournalBtn').addEventListener('click',newJournal);
    byId('saveJournalBtn').addEventListener('click',saveJournal);
    byId('deleteJournalBtn').addEventListener('click',deleteJournal);
    byId('editProfileBtn').addEventListener('click',openOnboarding);
    byId('exportBtn').addEventListener('click',exportData);
    byId('importInput').addEventListener('change',e=>importData(e.target.files?.[0]));
    byId('eraseBtn').addEventListener('click',eraseAll);
  }

  function init() {
    if(localStorage.getItem(THEME_KEY)==='light') document.body.classList.add('light');
    populateSelect(byId('journalGate'),gates.map(g=>g.name),'Remember');
    bindEvents();
    renderAll();
    if(!state.profile) setTimeout(openOnboarding,350);
  }

  init();
})();
