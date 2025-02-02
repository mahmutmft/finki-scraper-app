require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://courses.finki.ukim.mk/login/index.php', { waitUntil: 'networkidle2' });

    await page.type('#username', process.env.FINKI_USER, { delay: 100 });
    await page.type('#password', process.env.FINKI_PASS, { delay: 100 });

    await Promise.all([
        page.click('.btn-submit'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    let coursesData = [];
    const courses = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.coursebox .coursename a')).map(el => ({
            title: el.innerText.trim(),
            url: el.href
        }));
    });

    courses.forEach(course => {
        coursesData.push(course);
    });

    const filePath = './coursesData.json';
    if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath));
        coursesData = coursesData.filter(course => !existingData.some(existingCourse => existingCourse.url === course.url));
        existingData.push(...coursesData);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    } else {
        fs.writeFileSync(filePath, JSON.stringify(coursesData, null, 2));
    }

    console.log("✅ Courses scraped and saved.");
    await browser.close();
})();
