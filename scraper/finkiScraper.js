const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const puppeteer = require('puppeteer');
const fs = require('fs');

const ANNOUNCEMENT_LIMIT = 10;

async function scrapeAnnouncements(page, courseUrl) {
    try {
        await page.goto(courseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        const forumLink = await page.$('a[href*="/mod/forum/view.php"]');
        if (!forumLink) return [];

        const forumUrl = await forumLink.evaluate(el => el.href);
        await page.goto(forumUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        return await page.evaluate((limit) => {
            return Array.from(document.querySelectorAll('tr.discussion.subscribed'))
                .slice(0, limit)
                .map(row => ({
                    title: row.querySelector('a.w-100.h-100.d-block')?.innerText.trim() || 'No title',
                    url: row.querySelector('a.w-100.h-100.d-block')?.href || '#',
                    author: row.querySelector('.author-info .text-truncate')?.innerText.trim() || 'Unknown',
                    date: row.querySelector('time')?.getAttribute('datetime') || 'No date'
                }));
        }, ANNOUNCEMENT_LIMIT);
    } catch (error) {
        console.error('Error scraping announcements:', error);
        return [];
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto('https://courses.finki.ukim.mk/login/index.php', { waitUntil: 'networkidle2' });
        await page.type('#username', process.env.FINKI_USER.trim());
        await page.type('#password', process.env.FINKI_PASS.trim());
        await Promise.all([page.click('.btn-submit'), page.waitForNavigation()]);

        const courses = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.coursebox .coursename a')).map(el => ({
                title: el.innerText.trim(),
                url: el.href
            }))
        );

        for (const course of courses) {
            console.log(`Scraping: ${course.title}`);
            course.announcements = await scrapeAnnouncements(page, course.url);
            console.log(`Found ${course.announcements.length} announcements`);
        }

        const filePath = './coursesData.json';
        let existingData = [];

        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const updatedData = existingData.map(existingCourse => {
            const freshCourse = courses.find(c => c.url === existingCourse.url);
            return freshCourse || existingCourse;
        });

        const newCourses = courses.filter(course =>
            !existingData.some(existing => existing.url === course.url)
        );
        updatedData.push(...newCourses);

        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        console.log("✅ All courses scraped and saved.");

    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await browser.close();
    }
})();