// Example job listings data (replace with actual data from backend)
const jobs = [
    {
        id: "1",
        title: "Software Development Intern",
        company: "Tech Solutions Pte Ltd",
        location: "Central",
        description: "Working on web application development using modern technologies.",
        requirements: ["JavaScript", "React", "Node.js"],
        yearRequired: "Year 2",
        duration: "3 months",
        courseRequired: "Computer Science"
    },
    {
        id: "2",
        title: "Data Analytics Intern",
        company: "DataTech Solutions",
        location: "East",
        description: "Analyzing large datasets and creating meaningful insights.",
        requirements: ["Python", "SQL", "Data Visualization"],
        yearRequired: "Year 3",
        duration: "6 months",
        courseRequired: "Data Science"
    },
    {
        id: "3",
        title: "Marketing Intern",
        company: "Global Marketing SG",
        location: "West",
        description: "Assisting in digital marketing campaigns and social media management.",
        requirements: ["Social Media", "Content Creation", "Analytics"],
        yearRequired: "Year 2",
        duration: "4 months",
        courseRequired: "Marketing"
    }
];

// Function to display job listings
function displayJobs() {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';

    jobs.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        jobBox.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <div class="job-requirements">
                <span class="location">📍 ${job.location}</span>
                <span class="duration">⏱️ ${job.duration}</span>
                <span class="year">🎓 ${job.yearRequired}</span>
                ${job.requirements.map(req => `<span>${req}</span>`).join('')}
            </div>
            <div class="button-container">
                <button class="see-details-btn" onclick="seeDetails('${job.id}')">See Details</button>
            </div>
        `;

        jobListings.appendChild(jobBox);
    });
}

// Function to handle search
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.querySelector('.search-box input').value.toLowerCase();
    
    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchInput) ||
        job.company.toLowerCase().includes(searchInput) ||
        job.description.toLowerCase().includes(searchInput) ||
        job.requirements.some(req => req.toLowerCase().includes(searchInput))
    );

    displayFilteredJobs(filteredJobs);
}

// Function to handle filter toggle
function toggleFilter(event) {
    event.preventDefault();
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.classList.toggle('show');
}

// Function to display filtered jobs
function displayFilteredJobs(filteredJobs) {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';

    filteredJobs.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        jobBox.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <div class="job-requirements">
                <span class="location">📍 ${job.location}</span>
                <span class="duration">⏱️ ${job.duration}</span>
                <span class="year">🎓 ${job.yearRequired}</span>
                ${job.requirements.map(req => `<span>${req}</span>`).join('')}
            </div>
            <div class="button-container">
                <button class="see-details-btn" onclick="seeDetails('${job.id}')">See Details</button>
            </div>
        `;

        jobListings.appendChild(jobBox);
    });
}

// Function to see job details
function seeDetails(jobId) {
    // Store the selected job ID in localStorage
    localStorage.setItem('selectedJobId', jobId);
    // Redirect to job details page
    window.location.href = 'JS_JobDetails_Page.html';
}

// Close filter dropdown when clicking outside
document.addEventListener('click', (event) => {
    const filterDropdown = document.getElementById('filterDropdown');
    const filterBtn = document.querySelector('.filter-btn');
    
    if (!filterDropdown.contains(event.target) && !filterBtn.contains(event.target)) {
        filterDropdown.classList.remove('show');
    }
});

// Initialize job listings on page load
document.addEventListener('DOMContentLoaded', () => {
    displayJobs();
});
