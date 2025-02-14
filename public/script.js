let isUpdating = false;
let filteredCourses = [];

// Add this function for the showcase demo course
function getDemoShowcase() {
    return {
        title: "Web Development and Design - WINTER-2023/24",
        url: "https://github.com/mahmutmft/finki-scraper-app",
        announcements: [
            {
                title: "📝 Final Project Guidelines Released",
                author: "Dr. Alex Johnson",
                date: "2024-01-22",
                content: "Check out the updated project requirements and submission details"
            },
            {
                title: "🚀 React.js Workshop This Friday",
                author: "Dr. Alex Johnson",
                date: "2024-01-20",
                content: "Join us for an interactive session on modern React practices"
            },
            {
                title: "📚 Course Materials Updated",
                author: "Teaching Assistant Sarah",
                date: "2024-01-15",
                content: "New resources added for JavaScript and Node.js modules"
            }
        ]
    };
}

// Fetch real data and add showcase course
async function fetchData() {
    try {
        const response = await fetch('/data/coursesData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const realCourses = await response.json();
        return realCourses;
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
    const card = document.createElement('div');
    card.className = 'course-card';

    const titleParts = course.title.split('-');
    const metaString = titleParts.length > 1 ? titleParts.pop() : '';
    const name = titleParts.join('-').trim();

    card.innerHTML = `
        <div class="card-header">
            <h3 class="course-title">${name}</h3>
            <div class="semester-badge">${metaString}</div>
        </div>
        
        <div class="card-content">
            <div class="course-stats">
                <div class="stat">
                    <i class="fas fa-bullhorn"></i>
                    <span>${course.announcements?.length || 0} Announcements</span>
                </div>
                <div class="stat">
                    <i class="fas fa-calendar"></i>
                    <span>Last Updated: ${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="announcements-preview collapsed">
                ${course.announcements && course.announcements.length > 0 
                    ? course.announcements.slice(0, 3).map(announcement => `
                        <div class="announcement-item">
                            <i class="fas fa-bell"></i>
                            <div class="announcement-content">
                                <h4>${announcement.title}</h4>
                                <span class="announcement-meta">
                                    <i class="fas fa-user"></i> ${announcement.author}
                                    <i class="fas fa-clock"></i> ${new Date(announcement.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    `).join('')
                    : '<p class="no-announcements"><i class="fas fa-info-circle"></i> No announcements yet</p>'
                }
            </div>
        </div>
        
        <div class="card-actions">
            ${course.url 
                ? `<a href="${course.url}" class="action-button primary" target="_blank">
                    <i class="fas fa-external-link-alt"></i> View Course
                   </a>`
                : ''
            }
            <button class="action-button secondary toggle-announcements">
                <i class="fas fa-chevron-down"></i> Show Announcements
            </button>
        </div>
    `;

    // Add toggle functionality
    const toggleBtn = card.querySelector('.toggle-announcements');
    const announcements = card.querySelector('.announcements-preview');
    
    toggleBtn.addEventListener('click', () => {
        announcements.classList.toggle('collapsed');
        const isCollapsed = announcements.classList.contains('collapsed');
        toggleBtn.innerHTML = `
            <i class="fas fa-chevron-${isCollapsed ? 'down' : 'up'}"></i>
            ${isCollapsed ? 'Show' : 'Hide'} Announcements
        `;
    });

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

// Add modal handling
function initializeModal() {
    const modal = document.getElementById('shortcuts-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeBtn = modal.querySelector('.modal-close');

    function showModal() {
        modal.classList.add('show');
    }

    function hideModal() {
        modal.classList.remove('show');
    }

    helpBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Add '?' shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showModal();
        }
        if (e.key === 'Escape') {
            hideModal();
        }
    });
}

// Add highlight for new courses
function highlightNewCourses(oldCourses, newCourses) {
    const oldIds = new Set(oldCourses.map(c => c.url));
    return newCourses.map(course => {
        course.isNew = !oldIds.has(course.url);
        return course;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeSearch();
    initializeTheme();
    initializeKeyboardShortcuts();
    initializeModal();
    renderCourses();
    document.getElementById('update-btn').addEventListener('click', updateData);
});
