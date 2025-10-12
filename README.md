# 🚀 NASA Space Explorer

Explore NASA’s “Astronomy Picture of the Day” (APOD) across any custom date range.  
Built using NASA’s public API with HTML, CSS, and JavaScript.  

🌐 **Live Demo:**  
👉 [https://cashmerecode.github.io/nasa-space-explorer/](https://cashmerecode.github.io/nasa-space-explorer/)

---

## 🌌 Overview

The NASA Space Explorer app connects directly to NASA’s APOD API to display daily space photos, titles, and explanations.  
Users can select any date range and instantly view nine days of space imagery — complete with a modal view, video handling, and random fun space facts.

---

## 🛰️ Features

- Fetches NASA APOD data dynamically using API calls  
- Displays 9-day gallery with image, title, and date  
- Modal popup with larger image and full explanation  
- Handles image *and* video entries  
- Random “Did You Know?” space fact each time the app loads  
- Hover zoom effects for smooth interactivity  
- Fully responsive dark NASA theme inspired by official branding  

---

## 🧠 Technologies Used

- HTML5  
- CSS3 (NASA Dark Theme)  
- JavaScript (Fetch API, DOM Manipulation)  
- NASA APOD API: [https://api.nasa.gov/](https://api.nasa.gov/)

---

## 🔑 API Usage

You can use NASA’s demo key (`DEMO_KEY`) for light testing,  
but it’s recommended to get your own key from [api.nasa.gov](https://api.nasa.gov).

To use your own key, replace this line in **script.js**:
```js
const API_KEY = 'QamwyZ2wenX5UKgL12Or1INNlURox2JaCY8CplWd';
