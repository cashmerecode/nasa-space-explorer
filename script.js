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

const API_KEY = 'DEMO_KEY';

// Random Space Facts
const facts = [
  "One day on Venus is longer than one year on Venus.",
  "Neutron stars can spin 600 times per second.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Jupiter’s Great Red Spot is a storm that’s been raging for at least 350 years.",
  "A day on Mars is just 40 minutes longer than a day on Earth.",
  "The footprints on the Moon will stay there for millions of years."
];

function showRandomFact() {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  factEl.textContent = `🛰️ Did you know? ${randomFact}`;
}

async function fetchImages() {
  const start = startDate.value;
  const end = endDate.value;
  if (!start || !end) {
    alert('Please select both start and end dates.');
    return;
  }

  gallery.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`);
    const data = await res.json();

    gallery.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.media_type === 'video') {
        card.innerHTML = `
          <div class="info">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
            <a href="${item.url}" target="_blank" class="link">🎬 View Video</a>
          </div>`;
      } else {
        card.innerHTML = `
          <img src="${item.url}" alt="${item.title}">
          <div class="info">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          </div>`;
        card.addEventListener('click', () => openModal(item));
      }

      gallery.appendChild(card);
    });
  } catch (err) {
    console.error('Fetch error:', err);
    gallery.innerHTML = '<p>Failed to load NASA data. Please try again later.</p>';
  } finally {
    loading.classList.add('hidden');
  }
}

function openModal(item) {
  modalImg.src = item.url;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalDesc.textContent = item.explanation;
  modal.showModal();
}

closeModal.addEventListener('click', () => modal.close());

fetchBtn.addEventListener('click', fetchImages);
window.addEventListener('load', showRandomFact);
