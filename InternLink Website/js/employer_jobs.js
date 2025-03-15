import jobListings from './jobs_data.js';

// Current company information
const currentCompany = {
    name: "Tech Solutions Pte Ltd",
    id: "1"
};

function createJobElement(job) {
    const jobBox = document.createElement('div');
    jobBox.className = 'job-box';
    
    // Common elements
    let jobInfo = `
        <h3 class="job-title">${job.title}</h3>
        <p class="job-company">${job.company}</p>
        <p class="job-description">${job.description}</p>
        <div class="job-requirements">
            <span class="location">📍 ${job.location}</span>
            <span class="duration">⏱️ ${job.duration}</span>
    `;

    // Add salary/payment based on job type
    if (job.id.startsWith('INT')) {
        jobInfo += `<span class="salary">💰 ${job.salary}</span>`;
    } else {
        jobInfo += `<span class="payment">💰 ${job.payment}</span>`;
    }

    // Add requirements
    jobInfo += `
            ${job.requirements.map(req => `<span>${req}</span>`).join('')}
        </div>
        <div class="button-container">
            <button onclick="seeDetails('${job.id}')" class="see-details-btn">View Details</button>
            <button onclick="deleteJob('${job.id}')" class="delete-btn">Delete</button>
        </div>
    `;

    jobBox.innerHTML = jobInfo;
    return jobBox;
}

// Function to display jobs in a specified container
function displayEmployerJobs(jobs, containerId = 'jobListings') {
    const jobListings = document.getElementById(containerId);
    if (!jobListings) return;
    jobListings.innerHTML = '';

    // Filter jobs based on current page
    const currentPage = window.location.pathname;
    let filteredJobs;
    
    if (currentPage.includes('Post_Internship_Page.html')) {
        filteredJobs = window.jobListings.internships;
    } else if (currentPage.includes('Post_AdHoc_Page.html')) {
        filteredJobs = window.jobListings.adhoc;
    } else {
        // On profile page, show all jobs
        filteredJobs = [...window.jobListings.internships, ...window.jobListings.adhoc];
    }

    filteredJobs.forEach(job => {
        jobListings.appendChild(createJobElement(job));
    });
}

// Function to toggle filter dropdown
function toggleFilter(event) {
    event.stopPropagation();
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.classList.toggle('show');
}

// Function to handle search and filtering
function handleSearch(event) {
    if (event) {
        event.stopPropagation();
        const filterDropdown = document.getElementById('filterDropdown');
        filterDropdown.classList.remove('show');
    }

    const searchInput = document.querySelector('.search-box input').value.toLowerCase();
    const locationSelect = document.querySelector('.filter-section select');
    const locationFilter = locationSelect ? locationSelect.value.toLowerCase() : '';

    // Get all jobs
    const allJobs = [...window.jobListings.internships, ...window.jobListings.adhoc];

    // Filter jobs
    const filtered = allJobs.filter(job => {
        const matchesSearch = 
            job.title.toLowerCase().includes(searchInput) ||
            job.description.toLowerCase().includes(searchInput) ||
            job.company.toLowerCase().includes(searchInput);
        
        const matchesLocation = !locationFilter || 
            job.location.toLowerCase() === locationFilter;

        return matchesSearch && matchesLocation;
    });

    displayEmployerJobs(filtered);
}

// Function to delete job (simplified for demo)
function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job post?')) {
        // Remove job from display
        const jobElement = document.querySelector(`[data-job-id="${jobId}"]`);
        if (jobElement) {
            jobElement.remove();
        }
    }
}

// Function to see job details
function seeDetails(jobId) {
    // Always show first job of appropriate type for demo
    if (jobId.startsWith('INT')) {
        localStorage.setItem('selectedJobId', window.jobListings.internships[0].id);
    } else {
        localStorage.setItem('selectedJobId', window.jobListings.adhoc[0].id);
    }
    // Redirect to appropriate details page
    window.location.href = jobId.startsWith('INT') ? 
        'EP_InternshipDetails_Page.html' : 
        'EP_AdHocDetails_Page.html';
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Make jobListings available globally
    window.jobListings = jobListings;
    
    // Check if we're on the profile page
    const isProfilePage = window.location.pathname.includes('EP_Profile_Page.html');
    if (isProfilePage) {
        // On profile page, show all jobs without filters
        displayEmployerJobs([...jobListings.internships, ...jobListings.adhoc], 'companyJobListings');
    } else {
        // On job listing pages, show filtered jobs with search functionality
        displayEmployerJobs();
        
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');
        
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        if (categoryFilter) categoryFilter.addEventListener('change', handleSearch);
        if (locationFilter) locationFilter.addEventListener('change', handleSearch);
    }
});

// Export functions for use in HTML
window.handleSearch = handleSearch;
window.toggleFilter = toggleFilter;
window.seeDetails = seeDetails;
window.deleteJob = deleteJob;
