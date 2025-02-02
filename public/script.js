async function fetchData() {
    try {
        let response = await fetch('coursesData.json');
        let dataCourses = await response.json();

        const container = document.getElementById('courses-container');
        container.innerHTML = '';

        dataCourses.forEach(course => {
            container.appendChild(createCourseCard(course));
        });

    } catch (error) {
        console.error("Error fetching course data:", error);
    }
}

function createCourseCard(course) {
    const metaParts = course.title.split('-');
    const name = metaParts[0].trim();
    let year = "N/A", semester = "N/A";

    if (metaParts.length > 1) {
        const semesterParts = metaParts[1].split('/');
        year = semesterParts[0]?.trim() || "N/A";
        semester = semesterParts[1]?.trim() || "N/A";
    }

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="academic-year">${year}/${semester}</div>
        <h3 class="course-title">${name}</h3>
        <div class="course-meta">
            <span>Semester: ${semester}</span>
        </div>
        <a href="${course.url}" class="course-link" target="_blank">View Course Materials</a>
    `;
    return card;
}

document.addEventListener("DOMContentLoaded", fetchData);
