# 🎓 Faculty Courses Directory

A sophisticated web scraping solution for aggregating and displaying course information from the Faculty of Computer Science (FINKI) portal. Built with modern web technologies to demonstrate automated data collection and dynamic content rendering.

## ✨ Features

- **Automated Course Aggregation**  
  📥 Web scraper using Puppeteer for reliable data collection
- **Dynamic Data Presentation**  
  🎨 Responsive frontend with modern UI/UX design
- **Search & Filter**  
  🔍 Real-time course search and semester filtering
- **Statistics Dashboard**  
  📊 Overview of courses and announcements
- **Secure Credential Management**  
  🔒 Environment variable protection for login details
- **Persistent Data Storage**  
  💾 Automatic JSON data caching for offline access
- **Cross-Platform Compatibility**  
  🌐 Mobile-first responsive design for all devices

## 🛠️ Tech Stack

- **Backend**: Node.js v18+ | Puppeteer | Express
- **Frontend**: Vanilla JavaScript | CSS3 | HTML5
- **Tooling**: npm | dotenv

## ⚙️ Prerequisites

- Node.js v18 or newer
- npm v9 or newer
- Chrome/Chromium browser installed

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/mahmutmft/finki-scraper-app.git
cd finki-scraper-app
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Configure Environment
Create .env file in the scraper directory with your credentials:
```env
FINKI_USER="your_username"
FINKI_PASS="your_password"
```

### 4. Start the Application
```bash
npm start
```
Visit http://localhost:3000 in your browser

## 📂 Project Structure
```bash
finki-scraper-app/
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── scraper/
│   ├── finkiScraper.js
│   └── .env
├── data/
│   └── coursesData.json
├── server.js
└── package.json
```

## 🔧 Advanced Configuration

### Scraper Settings
You can customize the scraper behavior by modifying these constants:
- `ANNOUNCEMENT_LIMIT`: Maximum number of announcements to fetch per course
- `RETRY_ATTEMPTS`: Number of retry attempts for failed requests
- `TIMEOUT`: Request timeout in milliseconds

### Error Handling
The application implements comprehensive error handling:
- Automatic session renewal
- Request retries with exponential backoff
- User-friendly error messages
- Detailed error logging

