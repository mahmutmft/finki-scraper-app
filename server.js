const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

// Middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Serve static files
app.use(express.static('public'));
// Serve the data directory
app.use('/data', express.static('data'));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.post('/scrape', (req, res) => {
    const startTime = Date.now();
    console.log('Starting scrape operation...');

    exec('node scraper/finkiScraper.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Scraping failed',
                error: error.message 
            });
        }
        if (stderr) {
            console.error(`Script errors: ${stderr}`);
        }
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Scrape completed in ${duration}s`);
        console.log(`Script output: ${stdout}`);
        
        res.json({ 
            success: true,
            duration: `${duration}s`,
            timestamp: new Date()
        });
    });
});

function getCacheKey() {
    const date = new Date();
    return crypto.createHash('md5')
        .update(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
        .digest('hex');
}

function getCachedData() {
    const cacheKey = getCacheKey();
    const cachePath = path.join(dataDir, `cache-${cacheKey}.json`);
    
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    return null;
}

function setCachedData(data) {
    const cacheKey = getCacheKey();
    const cachePath = path.join(dataDir, `cache-${cacheKey}.json`);
    fs.writeFileSync(cachePath, JSON.stringify(data));
}

app.get('/data/cached', (req, res) => {
    const cachedData = getCachedData();
    if (cachedData) {
        res.json(cachedData);
    } else {
        res.status(404).json({ error: 'No cached data available' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
}); 