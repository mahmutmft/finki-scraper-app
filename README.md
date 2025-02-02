# 🎓 Faculty Courses Directory

A sophisticated web scraping solution for aggregating and displaying course information from the Faculty of Computer Science (FINKI) portal. Built with modern web technologies to demonstrate automated data collection and dynamic content rendering.

IMAGE HERE

## ✨ Features

- **Automated Course Aggregation**  
  📥 Web scraper using Puppeteer for reliable data collection
- **Dynamic Data Presentation**  
  🎨 Responsive frontend with modern UI/UX design
- **Secure Credential Management**  
  🔒 Environment variable protection for login details
- **Persistent Data Storage**  
  💾 Automatic JSON data caching for offline access
- **Cross-Platform Compatibility**  
  🌐 Mobile-first responsive design for all devices

## 🛠️ Tech Stack

- **Backend**: Node.js v18+ | Puppeteer
- **Frontend**: Vanilla JavaScript | CSS3 | HTML5
- **Tooling**: npm | dotenv

## ⚙️ Prerequisites

- Node.js v18 or newer
- npm v9 or newer
- Chrome/Chromium browser installed

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/faculty-courses-directory.git
cd faculty-courses-directory
```
### 2. Install Dependencies
```bash
npm install --production
```

### 3. Configure Environment
Create .env file with your credentials:

```env
FINKI_USER="your_university_email@students.finki.ukim.mk"
FINKI_PASS="your_secure_password"
```

### 4. Run Data Collection
```bash
node finkiscraper.js
```

### 5. Launch Application
```bash
npm start
```
Open in browser

## 📂 Project Structure
```bash
├── public/
│   └── script.js
│   └── style.css
│   └── index.html
├── scraper/
│   └── finkiScraper.js
├── data/
|   └── coursesData.json
├── package.json
└── README.md
```

