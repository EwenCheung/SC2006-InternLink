// Ad hoc job data (to be synchronized with employer_jobs.js)
const adhocJobsData = [
    {
        id: "7",
        type: "adhoc",
        title: "Event Assistant",
        company: "Tech Solutions Pte Ltd",
        location: "Central",
        description: "Support event setup and coordination for a major tech conference.",
        companyDescription: "Tech Solutions Pte Ltd is a leading technology company specializing in innovative software solutions. We deliver exceptional experiences through innovative solutions.",
        requirements: ["Customer Service", "Physical Setup", "Event Experience"],
        responsibilities: [
            "Assist with event registration and check-in",
            "Guide attendees and manage crowd flow",
            "Support event logistics and setup",
            "Help coordinate with vendors and speakers",
            "Ensure smooth event operations"
        ],
        adHocDuration: {
            days: 3,
            startDate: "2024-04-15",
            flexible: false
        },
        industry: "Event Management",
        companySize: "20-50 employees",
        website: "www.techsolutions.com",
        companyLocation: "Central Business District, Singapore",
        pay: "$120/day",
        benefits: [
            "Daily pay: $120/day",
            "Meals provided",
            "Transport allowance",
            "Certificate of participation",
            "Networking opportunities"
        ],
        applicants: [
            {
                id: "1",
                name: "Alice Chen",
                university: "NTU",
                year: "Year 2",
                status: "Pending"
            },
            {
                id: "2",
                name: "Bob Lee",
                university: "NUS",
                year: "Year 1",
                status: "Reviewing"
            }
        ],
        postingDate: "2024-03-01",
        views: 98
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Store referrer for back button
    const referrer = document.referrer;
    if (referrer.includes('Post_AdHoc_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Post_AdHoc_Page.html');
    }

    const selectedJobId = localStorage.getItem('selectedJobId');
    if (selectedJobId) {
        loadJobDetails(selectedJobId);
        loadApplicants(selectedJobId);
    }
    setupEventListeners();
    updateEventTimer();
});

// Load job details
function loadJobDetails(jobId) {
    const job = adhocJobsData.find(j => j.id === jobId);
    if (!job) return;

    // Update header info
    document.querySelector('.job-title').textContent = job.title;
    document.querySelector('.company-name').textContent = job.company;
    
    // Update quick info
    const quickInfo = document.querySelector('.quick-info');
    quickInfo.innerHTML = `
        <span class="location">📍 ${job.location}</span>
        <span class="duration">⏱️ ${job.adHocDuration.days} days</span>
        <span class="pay">💰 ${job.pay}</span>
    `;

    // Update company section
    document.querySelector('.company-description').textContent = job.companyDescription;
    
    // Update company details
    const companyDetails = document.querySelector('.company-details');
    companyDetails.innerHTML = `
        <div class="detail-item">
            <span class="label">Industry:</span>
            <span class="value">${job.industry}</span>
        </div>
        <div class="detail-item">
            <span class="label">Company Size:</span>
            <span class="value">${job.companySize}</span>
        </div>
        <div class="detail-item">
            <span class="label">Website:</span>
            <span class="value"><a href="https://${job.website}" target="_blank">${job.website}</a></span>
        </div>
        <div class="detail-item">
            <span class="label">Location:</span>
            <span class="value">${job.companyLocation}</span>
        </div>
    `;

    // Update job details
    document.querySelector('.description p').textContent = job.description;
    
    // Update responsibilities
    const responsibilitiesList = document.querySelector('.responsibilities-list');
    responsibilitiesList.innerHTML = job.responsibilities
        .map(resp => `<li>${resp}</li>`)
        .join('');

    // Update requirements
    const skillsRequired = document.querySelector('.skills-required');
    skillsRequired.innerHTML = job.requirements
        .map(skill => `<span>${skill}</span>`)
        .join('');

    // Update benefits
    const benefitsList = document.querySelector('.benefits-list');
    benefitsList.innerHTML = job.benefits
        .map(benefit => `<li>${benefit}</li>`)
        .join('');

    // Update job status info
    document.querySelector('.posting-date').textContent = `Posted on ${formatDate(job.postingDate)}`;
    document.querySelector('.applicants').textContent = `${job.applicants.length} people have applied`;
    document.querySelector('.views').textContent = `${job.views} views`;
    document.querySelector('.event-date').textContent = formatDate(job.adHocDuration.startDate);

    // Update applicants count in header
    document.querySelector('.applicant-count').textContent = `(${job.applicants.length})`;
}

// Load applicants list
function loadApplicants(jobId) {
    const job = adhocJobsData.find(j => j.id === jobId);
    if (!job) return;

    const applicantsList = document.querySelector('.applicants-list');
    applicantsList.innerHTML = job.applicants.map(applicant => `
        <div class="applicant-card">
            <div class="applicant-info">
                <h4>${applicant.name}</h4>
                <p>${applicant.university} - ${applicant.year}</p>
            </div>
            <div class="applicant-status">
                <span class="status ${applicant.status.toLowerCase()}">${applicant.status}</span>
                <button onclick="viewApplication('${applicant.id}')">View Application</button>
            </div>
        </div>
    `).join('');
}

// View application details
function viewApplication(applicantId) {
    // TODO: Implement view application functionality
    alert('View application functionality coming soon!');
}

// Set up event listeners
function setupEventListeners() {
    // Back button
    document.querySelector('.back-btn').addEventListener('click', handleBack);
    
    // Edit button
    document.querySelector('.edit-btn').addEventListener('click', handleEdit);
    
    // Delete button
    document.querySelector('.delete-btn').addEventListener('click', showDeleteConfirmation);
    
    // Cancel delete button
    document.querySelector('.cancel-btn').addEventListener('click', hideDeleteConfirmation);
    
    // Confirm delete button
    document.querySelector('.confirm-delete-btn').addEventListener('click', handleDelete);
}

// Handle back button click
function handleBack() {
    const referrer = localStorage.getItem('jobListingReferrer') || 'Post_AdHoc_Page.html';
    window.location.href = referrer;
}

// Handle edit button click
function handleEdit() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    localStorage.setItem('editJobId', selectedJobId);  // Store job ID for editing
    window.location.href = 'Add_Job_Post_Page.html';
}

// Show delete confirmation modal
function showDeleteConfirmation() {
    document.getElementById('deleteModal').style.display = 'flex';
}

// Hide delete confirmation modal
function hideDeleteConfirmation() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Handle delete confirmation
function handleDelete() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = adhocJobsData.find(j => j.id === selectedJobId);
    
    // TODO: Implement delete logic with backend
    alert('Post deleted successfully!');
    
    // Return to the appropriate listings page
    const referrer = localStorage.getItem('jobListingReferrer');
    const defaultPage = 'Post_AdHoc_Page.html';  // Always return to ad hoc page by default
    window.location.href = referrer || defaultPage;
}

// Update event timer
function updateEventTimer() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = adhocJobsData.find(j => j.id === selectedJobId);
    if (!job) return;

    const eventDate = new Date(job.adHocDuration.startDate);
    const now = new Date();
    const timeRemaining = eventDate - now;
    
    if (timeRemaining > 0) {
        const days = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        document.querySelector('.time-remaining').textContent = `${days} days away`;
    } else {
        document.querySelector('.time-remaining').textContent = 'Event completed';
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update event timer every minute
setInterval(updateEventTimer, 60000);
