// Use the same job data from jobseeker_details.js
const jobs = [
    {
        id: "1",
        title: "Software Development Intern",
        company: "Tech Solutions Pte Ltd",
        location: "Central",
        description: "Working on web application development using modern technologies and frameworks. Collaborate with senior developers on real-world projects.",
        requirements: ["JavaScript", "React", "Node.js"],
        yearRequired: "Year 2",
        duration: "3 months",
        courseRequired: "Computer Science",
        salary: "$1000/month"
    },
    {
        id: "2",
        title: "Data Analytics Intern",
        company: "DataTech Solutions",
        location: "East",
        description: "Analyzing large datasets and creating meaningful insights. Work with business intelligence tools and machine learning algorithms.",
        requirements: ["Python", "SQL", "Data Visualization"],
        yearRequired: "Year 3",
        duration: "6 months",
        courseRequired: "Data Science",
        salary: "$1200/month"
    },
    {
        id: "3",
        title: "Marketing Intern",
        company: "Global Marketing SG",
        location: "West",
        description: "Assisting in digital marketing campaigns and social media management. Create engaging content and analyze campaign performance.",
        requirements: ["Social Media", "Content Creation", "Analytics"],
        yearRequired: "Year 2",
        duration: "4 months",
        courseRequired: "Marketing",
        salary: "$900/month"
    },
    {
        id: "4",
        title: "UX/UI Design Intern",
        company: "Creative Studio SG",
        location: "Central",
        description: "Design user interfaces for web and mobile applications. Conduct user research and create wireframes and prototypes.",
        requirements: ["Figma", "Adobe XD", "User Research"],
        yearRequired: "Year 2",
        duration: "3 months",
        courseRequired: "Design",
        salary: "$1100/month"
    },
    {
        id: "5",
        title: "Finance Intern",
        company: "SG Finance Corp",
        location: "Central",
        description: "Support financial analysis and reporting. Assist in preparing financial statements and conducting market research.",
        requirements: ["Excel", "Financial Analysis", "Bloomberg"],
        yearRequired: "Year 3",
        duration: "6 months",
        courseRequired: "Finance",
        salary: "$1300/month"
    },
    {
        id: "6",
        title: "Engineering Intern",
        company: "Engineering Solutions",
        location: "North",
        description: "Work on mechanical design projects. Use CAD software and participate in product development lifecycle.",
        requirements: ["AutoCAD", "SolidWorks", "3D Modeling"],
        yearRequired: "Year 3",
        duration: "4 months",
        courseRequired: "Mechanical Engineering",
        salary: "$1200/month"
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
    // Store the referrer page for back button
    localStorage.setItem('jobListingReferrer', 'Find_internship_Page.html');
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
