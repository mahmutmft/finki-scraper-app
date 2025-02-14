const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();

// Serve static files
app.use(express.static('public'));
// Serve the data directory
app.use('/data', express.static('data'));

// Create data directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.post('/scrape', (req, res) => {
    exec('node scraper/finkiScraper.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error}`);
            return res.status(500).json({ success: false, message: 'Scraping failed' });
        }
        if (stderr) {
            console.error(`Script errors: ${stderr}`);
        }
        console.log(`Script output: ${stdout}`);
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 