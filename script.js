'use strict';

/* DOM References */
const gallery   = document.getElementById('gallery');
const fetchBtn  = document.getElementById('fetchBtn');
const startDate = document.getElementById('startDate');
const endDate   = document.getElementById('endDate');
const loading   = document.getElementById('loading');
const factEl    = document.getElementById('spaceFact');

// Preset buttons (match HTML ids)
const todayBtn  = document.getElementById('btnToday');
const last7Btn  = document.getElementById('btn7');
const last30Btn = document.getElementById('btn30');
const newFactBtn= document.getElementById('newFactBtn');

// Hero (today’s APOD-style)
const heroImg   = document.getElementById('heroImg');
const heroTitle = document.getElementById('heroTitle');
const heroDate  = document.getElementById('heroDate');

// Modal (<dialog>)
const modal      = document.getElementById('modal');
const modalImg   = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate  = document.getElementById('modalDate');
const modalDesc  = document.getElementById('modalDesc');
const closeModal = document.getElementById('closeModal');

/* Config / Constants */
// NEW: classroom JSON feed (mirrors NASA APOD fields)
const FEED_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Kept for your date inputs; feed contains modern entries only
const APOD_EARLIEST = '1995-06-16';

// how many cards to render
let desiredCount = 9; // default for custom range / rubric

/* Random Space Facts */
const facts = [
  'One day on Venus is longer than one year on Venus; how? because it rotates so slow"',
  'Neutron stars can spin 600 times per second.',
  'There are more stars in the universe than grains of sand on Earth.',
  'Jupiter’s Great Red Spot is a storm that’s been raging for at least 350 years.',
  'A day on Mars is just 40 minutes longer than a day on Earth.',
  'The footprints on the Moon will stay there for millions of years.',
  'Saturn could float in water because it’s mostly made of gas.',
  'The Sun accounts for 99.86% of the mass in our solar system.',
  'There’s a planet made of diamonds called 55 Cancri e.',
  'Space smells like seared steak and hot metal according to astronauts.',
  'Mercury has virtually no atmosphere, so its temperature swings by 600°F between day and night.',
  'A teaspoon of a neutron star would weigh about 6 billion tons on Earth.',
  'If you could drive a car straight up, you’d reach space in just over an hour.',
  'The Milky Way is on a collision course with the Andromeda Galaxy, expected to merge in about 4.5 billion years.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'A year on Neptune lasts about 165 Earth years.',
  'There are rogue planets drifting through space with no star to orbit.',
  'Pluto’s heart-shaped region is made mostly of nitrogen ice.',
  'The hottest planet in our solar system is Venus, not Mercury.',
  'Astronauts grow about 2 inches taller in space due to spinal decompression in microgravity.',
  'A day on Mercury lasts longer than its year.',
  'Black holes do not actually “suck” matter; they pull via gravity just like any other massive object.',
  'The largest volcano in the solar system is Olympus Mons on Mars.',
  'A year on Earth is getting longer due to the Moon’s gravitational drag.',
  'The Sun will eventually expand into a red giant and engulf Mercury and Venus.',
  'The coldest known place in the universe is the Boomerang Nebula at -458°F (-272°C).',
  'Some exoplanets rain molten glass sideways due to extreme winds.',
  'The universe has no known edge; it’s still expanding in all directions.',
  'There are more trees on Earth than stars in the Milky Way.',
  'Astronauts lose bone mass in space at about 1% per month without exercise.'
];
function showRandomFact() {
  if (!factEl) return;
  const text = facts[Math.floor(Math.random() * facts.length)];
  factEl.textContent = `🛰️ Did you know? ${text}`;
}

/* Date Helpers */
// toISO adjusted for timezone so “today” isn’t tomorrow in UTC
const toISO = d => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);

function setDateInputs(minISO, maxISO, startISO, endISO) {
  if (startDate) { startDate.min = minISO; startDate.max = maxISO; startDate.value = startISO; }
  if (endDate)   { endDate.min   = minISO; endDate.max   = maxISO; endDate.value   = endISO; }
}

function setDefaultDates() {
  const now = new Date();
  const end = toISO(now);
  const startObj = new Date(now);
  // default to last 9 days for rubric
  startObj.setDate(now.getDate() - (9 - 1));
  const start = toISO(startObj);
  setDateInputs(APOD_EARLIEST, end, start, end);
  desiredCount = 9;
}

function validRange(start, end) {
  return new Date(start) <= new Date(end) && new Date(end) <= new Date();
}

function setRangeAndFetch(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const s = toISO(start);
  const e = toISO(end);
  setDateInputs(APOD_EARLIEST, e, s, e);
  desiredCount = days;          // show 1, 7, or 30 cards
  fetchImages();
}

/*  UI Helpers (skeletons) */
function showSkeletons(n = desiredCount) {
  if (!gallery) return;
  loading?.classList.add('hidden');
  gallery.innerHTML = `
    <div class="skeleton-grid">
      ${Array.from({ length: n }).map(() => `<div class="skeleton"></div>`).join('')}
    </div>
  `;
}
function clearSkeletons() {
  const grid = gallery?.querySelector('.skeleton-grid');
  if (grid) grid.remove();
}

/* Feed Helpers */
async function getFeed() {
  const res = await fetch(FEED_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  /** @type {Array<any>} */
  const items = await res.json();
  // normalize sort newest → oldest
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}

/* Hero: “today” entry from feed */
async function fetchTodayForHero() {
  if (!heroImg || !heroTitle || !heroDate) return;
  try {
    const items = await getFeed();
    const item = items[0]; // newest
    if (!item) return;

    const isVideo = item.media_type === 'video';
    const src = isVideo ? (item.thumbnail_url || '') : (item.url || item.hdurl || '');
    if (src) { heroImg.src = src; heroImg.alt = item.title || 'APOD'; }
    heroTitle.textContent = item.title || 'Astronomy Picture';
    heroDate.textContent  = item.date || '';
  } catch {
    // silent fail
  }
}

/*  Gallery Fetch (JSON feed + client-side filter) */
async function fetchImages() {
  if (!gallery) return;

  const start = startDate?.value;
  const end   = endDate?.value;

  if (!start || !end) { alert('Please select both start and end dates.'); return; }
  if (!validRange(start, end)) { alert('Dates must be valid and not in the future.'); return; }

  gallery.innerHTML = '';
  loading?.classList.remove('hidden');
  showSkeletons();

  try {
    const items = await getFeed();

    // Filter by inclusive date range using ISO strings
    const filtered = items.filter(it => it.date >= start && it.date <= end);

    clearSkeletons();

    if (filtered.length === 0) {
      gallery.innerHTML = `<p>No results for this date range. Try different dates.</p>`;
      return;
    }

    // render up to desiredCount
    const slice = filtered.slice(0, desiredCount);

    gallery.innerHTML = '';
    for (const item of slice) {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.media_type === 'video') {
        const host = (() => { try { return new URL(item.url).host; } catch { return 'source'; } })();
        const thumb = item.thumbnail_url ? `<img src="${item.thumbnail_url}" alt="${escapeHTML(item.title || 'Video')}" loading="lazy">` : '';
        card.innerHTML = `
          ${thumb}
          <div class="info">
            <h3>${escapeHTML(item.title || 'Untitled')} <span class="pill">VIDEO</span></h3>
            <p>${item.date || ''}</p>
            <a class="btn ghost" href="${item.url}" target="_blank" rel="noopener noreferrer">🎬 Watch on ${host}</a>
          </div>
        `;
      } else {
        const imgSrc = item.url || item.hdurl || '';
        card.innerHTML = `
          <img src="${imgSrc}" alt="${escapeHTML(item.title || 'NASA Image')}" loading="lazy">
          <div class="info">
            <h3>${escapeHTML(item.title || 'Untitled')}</h3>
            <p>${item.date || ''}</p>
          </div>
        `;
        card.addEventListener('click', () => openModal(item));
        card.tabIndex = 0;
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item); }
        });
      }

      gallery.appendChild(card);
    }
  } catch (err) {
    console.error('Feed fetch failed:', err);
    gallery.innerHTML = `<p>🚨 Failed to load data (${escapeHTML(err.message)}). Please try again later.</p>`;
  } finally {
    loading?.classList.add('hidden');
    clearSkeletons();
  }
}

/* Modal */
function openModal(item) {
  if (!modal) return;
  const imgSrc = item.hdurl || item.url || '';
  if (modalImg)   { modalImg.src = imgSrc; modalImg.alt = item.title || 'NASA Image'; }
  if (modalTitle) modalTitle.textContent = item.title || 'Untitled';
  if (modalDate)  modalDate.textContent  = item.date || '';
  if (modalDesc)  modalDesc.textContent  = item.explanation || 'No description available.';
  modal.showModal?.();
}

closeModal?.addEventListener('click', () => modal.close?.());

// close on backdrop click
modal?.addEventListener('click', (e) => {
  const content = modal.querySelector('.modal-content');
  if (!content) return;
  const r = content.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) modal.close?.();
});

// esc to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.open) modal.close?.();
});

/* Utils */
function escapeHTML(s = '') {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* Events / Init */
fetchBtn?.addEventListener('click', fetchImages);
todayBtn?.addEventListener('click', () => setRangeAndFetch(1));
last7Btn?.addEventListener('click',  () => setRangeAndFetch(7));
last30Btn?.addEventListener('click', () => setRangeAndFetch(30));
newFactBtn?.addEventListener('click', showRandomFact);

window.addEventListener('load', () => {
  setDefaultDates();
  showRandomFact();
  fetchTodayForHero(); // uses newest item from the JSON feed
});
