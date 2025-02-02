let isUpdating = false;

async function fetchData() {
    try {
        let response = await fetch('/scraper/coursesData.json');
        let dataCourses = await response.json();
        return dataCourses;
    } catch (error) {
        console.error("Error fetching course data:", error);
        return [];
    }
}

async function renderCourses() {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';

    try {
        const dataCourses = await fetchData();


        const sortedCourses = dataCourses.sort((a, b) => {
            const isSpecialA = ['Консултации', 'Студентски информативен центар'].includes(a.title);
            const isSpecialB = ['Консултации', 'Студентски информативен центар'].includes(b.title);
            return isSpecialA ? 1 : isSpecialB ? -1 : 0;
        });

        sortedCourses.forEach(course => {
            container.appendChild(createCourseCard(course));
        });
    } catch (error) {
        console.error("Error rendering courses:", error);
    }
}

function createCourseCard(course) {

    const titleParts = course.title.split('-');
    const metaString = titleParts.length > 1 ? titleParts.pop() : '';
    const name = titleParts.join('-').trim();

    const metaParts = metaString.split('/').map(part => part.trim());
    let academicYear = '';
    let semester = 'N/A';

    if (metaParts.length > 1) {
        const yearParts = [];
        for (const part of metaParts) {
            if (part.match(/^(L|Z)$/i)) {
                semester = part.toUpperCase();
            } else {
                yearParts.push(part);
            }
        }
        academicYear = yearParts.join('/');
    }

    const semesterNames = {
        'L': 'Летен',
        'Z': 'Зимски'
    };

    const card = document.createElement('div');
    card.className = 'course-card';

    card.innerHTML = `
        ${academicYear ? `<div class="academic-year">${academicYear}</div>` : ''}
        <h3 class="course-title">${name}</h3>
        <div class="course-meta">
            ${semester !== 'N/A' ? `<span>Семестар: ${semesterNames[semester] || semester}</span>` : ''}
        </div>
        ${course.url ? `<a href="${course.url}" class="course-link" target="_blank">Види материјали</a>` : ''}
        <div class="announcements">
            <h4 class="announcements-header">Announcements (${course.announcements?.length || 0})</h4>
            <div class="announcements-list">
                ${course.announcements && course.announcements.length > 0
        ? course.announcements.slice(0, 5).map(announcement => `
                        <div class="announcement">
                            <div class="announcement-header">
                                <span class="announcement-title">${announcement.title}</span>
                                <span class="announcement-date">${announcement.date}</span>
                            </div>
                            <div class="announcement-author">By: ${announcement.author}</div>
                            <a href="${announcement.url}" class="announcement-link" target="_blank">Read More</a>
                        </div>
                      `).join('')
        : '<p>No announcements available.</p>'}
            </div>
        </div>
    `;

    const announcementHeader = card.querySelector('.announcements-header');
    const announcementList = card.querySelector('.announcements-list');
    if (announcementHeader && announcementList) {
        announcementHeader.style.cursor = 'pointer';
        announcementHeader.addEventListener('click', () => {
            announcementList.classList.toggle('expanded');
            if (announcementList.classList.contains('expanded')) {
                announcementHeader.textContent = 'Hide Announcements';
            } else {
                announcementHeader.textContent = `Announcements (${course.announcements?.length || 0})`;
            }
        });
    }

    return card;
}
async function updateData() {
    const updateBtn = document.getElementById('update-btn');
    const loader = document.querySelector('.loader');
    const overlay = document.getElementById('loading-overlay');

    try {
        updateBtn.disabled = true;
        loader.style.display = 'block';
        overlay.style.display = 'flex';

        const response = await fetch('http://localhost:3000/scrape');

        if (!response.ok) throw new Error('Update failed');

        await renderCourses();
    } catch (error) {
        console.error('Update error:', error);
        alert('Update failed. Please try again.');
    } finally {
        updateBtn.disabled = false;
        loader.style.display = 'none';
        overlay.style.display = 'none';
    }
}
document.addEventListener("DOMContentLoaded", () => {
    renderCourses();
    document.getElementById('update-btn').addEventListener('click', updateData);
});
