let isUpdating = false;
let filteredCourses = [];

async function fetchData() {
    try {
        const response = await fetch('/data/coursesData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dataCourses = await response.json();
        return dataCourses;
    } catch (error) {
        console.error("Error fetching course data:", error);
        showErrorMessage("Failed to load courses. Please try again later.");
        return [];
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function showErrorMessage(message) {
    showNotification(message, 'error', 5000);
}

async function renderCourses() {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';

    try {
        const dataCourses = await fetchData();
        window.allCourses = dataCourses; // Store all courses globally
        filterCourses(); // This will handle the rendering
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
    const btnText = updateBtn.querySelector('.btn-text');

    try {
        updateBtn.disabled = true;
        loader.style.display = 'block';
        overlay.style.display = 'flex';
        btnText.textContent = 'Updating...';

        const response = await fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            await renderCourses();
            btnText.textContent = 'Updated!';
            setTimeout(() => {
                btnText.textContent = 'Refresh Data';
            }, 2000);
            showNotification('Data updated successfully!', 'success');
        } else {
            throw new Error(result.message || 'Update failed');
        }
    } catch (error) {
        console.error('Update error:', error);
        showErrorMessage('Update failed. Please try again.');
        btnText.textContent = 'Refresh Failed';
    } finally {
        updateBtn.disabled = false;
        loader.style.display = 'none';
        overlay.style.display = 'none';
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const semesterFilter = document.getElementById('semester-filter');

    searchInput.addEventListener('input', filterCourses);
    semesterFilter.addEventListener('change', filterCourses);
}

function filterCourses() {
    const searchInput = document.getElementById('search-input');
    const semesterFilter = document.getElementById('semester-filter');
    const container = document.getElementById('courses-container');
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSemester = semesterFilter.value;

    container.innerHTML = '';
    
    filteredCourses = window.allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm);
        const matchesSemester = selectedSemester === 'all' || 
            course.title.includes(selectedSemester);
        return matchesSearch && matchesSemester;
    });

    filteredCourses.forEach(course => {
        container.appendChild(createCourseCard(course));
    });

    updateStats();
}

function updateStats() {
    const statsContainer = document.getElementById('stats-container');
    const totalCourses = filteredCourses.length;
    const totalAnnouncements = filteredCourses.reduce((sum, course) => 
        sum + (course.announcements?.length || 0), 0);

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalCourses}</div>
            <div class="stat-label">Active Courses</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalAnnouncements}</div>
            <div class="stat-label">Total Announcements</div>
        </div>
    `;
}

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(icon, savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(icon, newTheme);
    });
}

function updateThemeIcon(icon, theme) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Add keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        
        // Ctrl/Cmd + R to refresh data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            updateData();
        }
        
        // Ctrl/Cmd + D to toggle dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            document.getElementById('theme-toggle').click();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeSearch();
    initializeTheme();
    initializeKeyboardShortcuts();
    renderCourses();
    document.getElementById('update-btn').addEventListener('click', updateData);
});
