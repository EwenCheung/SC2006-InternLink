// Example ad-hoc job listings data (replace with actual data from backend)
const adhocJobs = [
    {
        id: "1",
        title: "Event Assistant",
        company: "SG Events Co",
        location: "Central",
        description: "Assist in organizing and managing a tech conference. Help with registration, guest coordination, and event logistics.",
        requirements: ["Communication", "Organization", "Customer Service"],
        yearRequired: "Any Year",
        duration: "2 days",
        pay: "$100/day"
    },
    {
        id: "2",
        title: "Photography Assistant",
        company: "Creative Studios",
        location: "East",
        description: "Support professional photographers during a corporate event. Help with equipment setup and photo organization.",
        requirements: ["Photography", "Equipment Handling", "Teamwork"],
        yearRequired: "Any Year",
        duration: "1 day",
        pay: "$120/day"
    },
    {
        id: "3",
        title: "Market Research Assistant",
        company: "Research Solutions",
        location: "West",
        description: "Conduct street surveys and data collection for market research project. Training provided.",
        requirements: ["Communication", "Data Collection", "Basic Excel"],
        yearRequired: "Any Year",
        duration: "3 days",
        pay: "$90/day"
    },
    {
        id: "4",
        title: "IT Support Assistant",
        company: "Tech Support SG",
        location: "North",
        description: "Provide on-site IT support during office relocation. Help with equipment setup and basic troubleshooting.",
        requirements: ["Basic IT", "Problem Solving", "Hardware Setup"],
        yearRequired: "Any Year",
        duration: "2 days",
        pay: "$110/day"
    },
    {
        id: "5",
        title: "Food Fair Helper",
        company: "Food Festival SG",
        location: "Central",
        description: "Assist in food festival operations. Responsibilities include crowd control, food stall assistance, and general coordination.",
        requirements: ["Customer Service", "Food Handling", "Physical Work"],
        yearRequired: "Any Year",
        duration: "3 days",
        pay: "$95/day"
    },
    {
        id: "6",
        title: "Content Creator",
        company: "Digital Media Co",
        location: "South",
        description: "Create social media content for a one-day event. Photography and basic video editing skills required.",
        requirements: ["Social Media", "Photography", "Video Editing"],
        yearRequired: "Any Year",
        duration: "1 day",
        pay: "$150/day"
    }
];

// Function to display job listings
function displayAdhocJobs() {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';

    adhocJobs.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        jobBox.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <div class="job-requirements">
                <span class="location">📍 ${job.location}</span>
                <span class="duration">⏱️ ${job.duration}</span>
                <span class="pay">💰 ${job.pay}</span>
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
    
    const filteredJobs = adhocJobs.filter(job => 
        job.title.toLowerCase().includes(searchInput) ||
        job.company.toLowerCase().includes(searchInput) ||
        job.description.toLowerCase().includes(searchInput) ||
        job.requirements.some(req => req.toLowerCase().includes(searchInput))
    );

    displayFilteredAdhocJobs(filteredJobs);
}

// Function to handle filter toggle
function toggleFilter(event) {
    event.preventDefault();
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.classList.toggle('show');
}

// Function to display filtered jobs
function displayFilteredAdhocJobs(filteredJobs) {
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
                <span class="pay">💰 ${job.pay}</span>
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
    displayAdhocJobs();
});
