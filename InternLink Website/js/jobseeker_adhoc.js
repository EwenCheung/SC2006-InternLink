import jobListings from './jobs_data.js';

// Function to display ad-hoc job listings
function displayAdhocJobs() {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';

    // Use only the adhoc array from our centralized data
    window.jobListings.adhoc.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        jobBox.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <div class="job-requirements">
                <span class="location">📍 ${job.location}</span>
                <span class="duration">⏱️ ${job.duration}</span>
                <span class="payment">💰 ${job.payment}</span>
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
    
    const filteredJobs = window.jobListings.adhoc.filter(job => 
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
                <span class="payment">💰 ${job.payment}</span>
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
    // For demo purposes, always show the first ad-hoc job
    localStorage.setItem('selectedJobId', window.jobListings.adhoc[0].id);
    // Store the referrer page for back button
    localStorage.setItem('jobListingReferrer', 'Find_AdHoc_Page.html');
    // Redirect to ad hoc job details page
    window.location.href = 'JS_AdHocDetails_Page.html';
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
    // Make jobListings available globally
    window.jobListings = jobListings;
    displayAdhocJobs();
});

// Export functions for use in HTML
window.handleSearch = handleSearch;
window.toggleFilter = toggleFilter;
window.seeDetails = seeDetails;
