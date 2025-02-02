async function fetchData() {
    try {
        let response = await fetch('/data/coursesData.json');
        let dataCourses = await response.json();

        const container = document.getElementById('courses-container');
        container.innerHTML = '';

        const sortedCourses = dataCourses.sort((a, b) => {
            const isSpecialA = ['Консултации', 'Студентски информативен центар'].includes(a.title);
            const isSpecialB = ['Консултации', 'Студентски информативен центар'].includes(b.title);
            return isSpecialA ? 1 : isSpecialB ? -1 : 0;
        });

        sortedCourses.forEach(course => {
            container.appendChild(createCourseCard(course));
        });

    } catch (error) {
        console.error("Error fetching course data:", error);
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
    `;
    return card;
}

document.addEventListener("DOMContentLoaded", fetchData);