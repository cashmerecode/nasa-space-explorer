# 🚀 NASA Space Explorer: JSON Edition (updated version due to NASA API failure from lack of Ugovernment support/funding)
Explore NASA’s *Astronomy Picture of the Day (APOD)* using a stable classroom-hosted JSON feed that mirrors NASA’s live API structure. Built with **HTML**, **CSS**, and **JavaScript**, this edition demonstrates resilient API handling and real-world adaptability.

🌐 **Live Demo:** [https://cashmerecode.github.io/nasa-space-explorer/](https://cashmerecode.github.io/nasa-space-explorer/)

---

## 🌌 Overview
The **NASA Space Explorer (JSON Edition)** displays daily APOD-style entries — breathtaking images, videos, and explanations about our universe. Unlike the original NASA API version, this edition uses a **static JSON feed** to ensure reliability even when APIs are down.

**Data Feed:** `https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json`

The JSON structure matches NASA’s API fields:  
`date`, `title`, `explanation`, `media_type`, `url`, `hdurl`, and optional `thumbnail_url` for videos.

---

## 🛰️ Features
- Fetches data from a JSON feed (no API key required)  
- 9-day gallery with image, title, and date  
- Modal popup with HD image or embedded video  
- Random “Did You Know?” space fact generator  
- Supports both image and video entries  
- Skeleton loaders for smooth transitions  
- Fully responsive dark NASA theme  

---

## 🧠 Technologies Used
- **HTML5** for structure  
- **CSS3** for layout and theming  
- **JavaScript (ES6)** for fetch, async/await, and DOM updates  
- **Static JSON Feed** mirroring NASA’s APOD API  

---

## 💡 Why JSON Edition
Sometimes APIs go offline — this edition shows how developers can pivot quickly, adapt data sources, and keep apps running by switching to a cached or mirrored feed. It’s a real-world lesson in resilient front-end design.

---

## 🪐 Credits
Images and info © NASA / JPL
JSON feed © GCA Classroom (for learning use)
