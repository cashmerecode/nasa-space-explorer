'use strict';

/* =======================
   DOM References
======================= */
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

// Hero (today’s APOD)
const heroImg   = document.getElementById('heroImg');
const heroTitle = document.getElementById('heroTitle');
const heroDate  = document.getElementById('heroDate');

// Modal
const modal      = document.getElementById('modal');
const modalImg   = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate  = document.getElementById('modalDate');
const modalDesc  = document.getElementById('modalDesc');
const closeModal = document.getElementById('closeModal');

/* =======================
   Config / Constants
======================= */
const API_KEY = 'QamwyZ2wenX5UKgL12Or1INNlURox2JaCY8CplWd';
const APOD_EARLIEST = '1995-06-16';
const TARGET_COUNT = 9;

/* =======================
   Random Space Facts
======================= */
const facts = [
  'One day on Venus is longer than one year on Venus.',
  'Neutron stars can spin 600 times per second.',
  'There are more stars in the universe than grains of sand on Earth.',
  'Jupiter’s Great Red Spot is a storm that’s been raging for at least 350 years.',
  'A day on Mars is just 40 minutes longer than a day on Earth.',
  'The footprints on the Moon will stay there for millions of years.',
  'Saturn could float in water because it’s mostly made of gas.',
  'The Sun accounts for 99.86% of the mass in our solar system.',
  'There’s a planet made of diamonds called 55 Cancri e.',
  'Space smells like seared steak and hot metal according to astronauts.'
];
function showRandomFact() {
  if (!factEl) return;
  const text = facts[Math.floor(Math.random() * facts.length)];
  factEl.textContent = `🛰️ Did you know? ${text}`;
}

/* =======================
   Date Helpers
======================= */
const toISO = d => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);

function setDateInputs(minISO, maxISO, startISO, endISO) {
  if (startDate) { startDate.min = minISO; startDate.max = maxISO; startDate.value = startISO; }
  if (endDate)   { endDate.min   = minISO; endDate.max   = maxISO; endDate.value   = endISO; }
}

function setDefaultDates() {
  const now = new Date();
  const end = toISO(now);
  const startObj = new Date(now);
  startObj.setDate(now.getDate() - (TARGET_COUNT - 1)); // last 9 days
  const start = toISO(startObj);
  setDateInputs(APOD_EARLIEST, end, start, end);
}

function validRange(start, end) {
  return new Date(start) <= new Date(end);
}

function setRangeAndFetch(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const s = toISO(start);
  const e = toISO(end);
  setDateInputs(APOD_EARLIEST, e, s, e);
  fetchImages();
}

/* =======================
   UI Helpers (skeletons)
======================= */
function showSkeletons(n = TARGET_COUNT) {
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

/* =======================
   Hero: today’s APOD
======================= */
async function fetchTodayForHero() {
  if (!heroImg || !heroTitle || !heroDate) return;
  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&thumbs=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const item = await res.json();

    const isVideo = item.media_type === 'video';
    const src = isVideo ? (item.thumbnail_url || '') : (item.url || item.hdurl || '');
    if (src) { heroImg.src = src; heroImg.alt = item.title || 'NASA APOD'; }
    heroTitle.textContent = item.title || 'Astronomy Picture of the Day';
    heroDate.textContent  = item.date || '';
  } catch (_) {
    // fail silently—hero is optional
  }
}

/* =======================
   Gallery Fetch
======================= */
async function fetchImages() {
  if (!gallery) return;

  const start = startDate?.value;
  const end   = endDate?.value;

  if (!start || !end) { alert('Please select both start and end dates.'); return; }
  if (!validRange(start, end)) { alert('Start date must be before or equal to end date.'); return; }

  gallery.innerHTML = '';
  loading?.classList.remove('hidden');
  showSkeletons();

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    clearSkeletons();

    if (!Array.isArray(data) || data.length === 0) {
      gallery.innerHTML = `<p>No results for this date range. Try different dates.</p>`;
      return;
    }

    const items = data
      .sort((a, b) => new Date(b.date) - new Date(a.date))  // newest first
      .slice(0, TARGET_COUNT);

    gallery.innerHTML = '';
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.media_type === 'video') {
        const host = (() => { try { return new URL(item.url).host; } catch { return 'source'; } })();
        const thumb = item.thumbnail_url ? `<img src="${item.thumbnail_url}" alt="${item.title}" loading="lazy">` : '';
        card.innerHTML = `
          ${thumb}
          <div class="info">
            <h3>${item.title || 'Untitled'} <span class="pill">VIDEO</span></h3>
            <p>${item.date || ''}</p>
            <a class="btn ghost" href="${item.url}" target="_blank" rel="noopener noreferrer">🎬 Watch on ${host}</a>
          </div>
        `;
      } else {
        const imgSrc = item.url || item.hdurl || '';
        card.innerHTML = `
          <img src="${imgSrc}" alt="${item.title || 'NASA Image'}" loading="lazy">
          <div class="info">
            <h3>${item.title || 'Untitled'}</h3>
            <p>${item.date || ''}</p>
          </div>
        `;
        card.addEventListener('click', () => openModal(item));
      }

      gallery.appendChild(card);
    }
  } catch (err) {
    console.error('APOD fetch failed:', err);
    gallery.innerHTML = `<p>🚨 Failed to load NASA data (${err.message}). Please try again later.</p>`;
  } finally {
    loading?.classList.add('hidden');
    clearSkeletons();
  }
}

/* =======================
   Modal
======================= */
function openModal(item) {
  if (!modal) return;
  const imgSrc = item.hdurl || item.url || '';
  if (modalImg)   { modalImg.src = imgSrc; modalImg.alt = item.title || 'NASA Image'; }
  if (modalTitle) modalTitle.textContent = item.title || 'Untitled';
  if (modalDate)  modalDate.textContent  = item.date || '';
  if (modalDesc)  modalDesc.textContent  = item.explanation || 'No description available.';
  modal.showModal();
}

closeModal?.addEventListener('click', () => modal.close());

// close on backdrop click
modal?.addEventListener('click', (e) => {
  const content = modal.querySelector('.modal-content');
  if (!content) return;
  const r = content.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) modal.close();
});

// esc to close (dialog handles this in most browsers; this keeps parity)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.open) modal.close();
});

/* =======================
   Events / Init
======================= */
fetchBtn?.addEventListener('click', fetchImages);

todayBtn?.addEventListener('click', () => setRangeAndFetch(1));
last7Btn?.addEventListener('click',  () => setRangeAndFetch(7));
last30Btn?.addEventListener('click', () => setRangeAndFetch(30));
newFactBtn?.addEventListener('click', showRandomFact);

window.addEventListener('load', () => {
  setDefaultDates();
  showRandomFact();
  fetchTodayForHero();
});
