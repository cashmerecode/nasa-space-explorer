// ===== DOM References =====
const gallery = document.getElementById('gallery');
const fetchBtn = document.getElementById('fetchBtn');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const loading = document.getElementById('loading');
const factEl = document.getElementById('spaceFact');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDesc = document.getElementById('modalDesc');
const closeModal = document.getElementById('closeModal');

// ===== NASA API Key =====
const API_KEY = 'QamwyZ2wenX5UKgL12Or1INNlURox2JaCY8CplWd';

// ===== Constants =====
const APOD_EARLIEST = '1995-06-16'; // first APOD date
const TARGET_COUNT = 9;

// ===== Random Space Facts =====
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
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  if (factEl) factEl.textContent = `🛰️ Did you know? ${randomFact}`;
}

// ===== Date Helpers =====
function toISO(d) {
  return d.toISOString().slice(0, 10);
}
function setDefaultDates() {
  const now = new Date();
  const end = toISO(now);
  const startObj = new Date(now);
  startObj.setDate(now.getDate() - (TARGET_COUNT - 1)); // 9 consecutive days
  const start = toISO(startObj);

  startDate.min = APOD_EARLIEST;
  startDate.max = end;
  endDate.min = APOD_EARLIEST;
  endDate.max = end;

  startDate.value = start;
  endDate.value = end;
}
function validRange(start, end) {
  return new Date(start) <= new Date(end);
}

// ===== UI Helpers =====
function showSkeletons(n = TARGET_COUNT) {
  loading.classList.add('hidden');
  gallery.innerHTML = `
    <div class="skeleton-grid">
      ${Array.from({ length: n }).map(() => `<div class="skeleton"></div>`).join('')}
    </div>
  `;
}
function clearSkeletons() {
  const grid = gallery.querySelector('.skeleton-grid');
  if (grid) grid.remove();
}

// ===== Fetch NASA Images =====
async function fetchImages() {
  const start = startDate.value;
  const end = endDate.value;

  if (!start || !end) {
    alert('Please select both start and end dates.');
    return;
  }
  if (!validRange(start, end)) {
    alert('Start date must be before or equal to end date.');
    return;
  }

  gallery.innerHTML = '';
  loading.classList.remove('hidden');
  showSkeletons();

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    clearSkeletons();

    if (!Array.isArray(data) || data.length === 0) {
      gallery.innerHTML = `<p>No results for this date range. Try different dates.</p>`;
      return;
    }

    // Ensure newest first and limit to 9 items
    const items = data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, TARGET_COUNT);

    gallery.innerHTML = '';
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.media_type === 'video') {
        // Video entry
        card.innerHTML = `
          <div class="info">
            <h3>${item.title} <span class="pill">VIDEO</span></h3>
            <p>${item.date}</p>
            <a class="link" href="${item.url}" target="_blank" rel="noopener noreferrer">🎬 Watch on ${new URL(item.url).host}</a>
          </div>
        `;
      } else {
        // Image entry
        const imgSrc = item.url || item.hdurl; // sometimes only hdurl is present
        card.innerHTML = `
          <img src="${imgSrc}" alt="${item.title}" loading="lazy">
          <div class="info">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          </div>
        `;
        card.addEventListener('click', () => openModal(item));
      }

      gallery.appendChild(card);
    }
  } catch (err) {
    console.error('APOD fetch failed:', err);
    gallery.innerHTML = `<p>🚨 Failed to load NASA data ( ${err.message} ). Please try again later.</p>`;
  } finally {
    loading.classList.add('hidden');
    clearSkeletons();
  }
}

// ===== Modal =====
function openModal(item) {
  const imgSrc = item.hdurl || item.url || '';
  modalImg.src = imgSrc;
  modalImg.alt = item.title || 'NASA Image';
  modalTitle.textContent = item.title || 'Untitled';
  modalDate.textContent = item.date || '';
  modalDesc.textContent = item.explanation || 'No description available.';
  modal.showModal();
}

closeModal.addEventListener('click', () => modal.close());
// Close when clicking backdrop
modal.addEventListener('click', (e) => {
  const rect = modal.querySelector('.modal-content')?.getBoundingClientRect();
  if (!rect) return;
  const clickedInside =
    e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!clickedInside) modal.close();
});
// Esc key handled automatically by <dialog>, but this keeps parity for older browsers
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.open) modal.close();
});

// ===== Event Listeners =====
fetchBtn.addEventListener('click', fetchImages);
window.addEventListener('load', () => {
  setDefaultDates();
  showRandomFact();
});
