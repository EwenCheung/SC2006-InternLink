// Job data (to be synchronized with employer_jobs.js)
const internshipData = [
    {
        id: "1",
        type: "internship",
        title: "Software Development Intern",
        company: "Tech Solutions Pte Ltd",
        location: "Central",
        description: "Working on web application development using modern technologies and frameworks. Collaborate with senior developers on real-world projects.",
        companyDescription: "Tech Solutions Pte Ltd is a leading technology company specializing in innovative software solutions. We are dedicated to creating cutting-edge applications that solve real-world problems.",
        requirements: ["JavaScript", "React", "Node.js"],
        responsibilities: [
            "Develop and maintain web applications",
            "Collaborate with senior developers on real projects",
            "Participate in code reviews and team meetings",
            "Write clean, maintainable code",
            "Help with testing and debugging"
        ],
        yearRequired: "Year 2",
        duration: "3 months",
        courseRequired: "Computer Science",
        salary: "$1000/month",
        deadline: "2024-03-31",
        industry: "Information Technology",
        companySize: "50-200 employees",
        website: "www.techsolutions.com",
        companyLocation: "Central Business District, Singapore",
        benefits: [
            "Monthly stipend: $1000",
            "Flexible working hours",
            "Learning opportunities with senior developers",
            "Modern office amenities",
            "Team building activities"
        ],
        applicants: [
            {
                id: "1",
                name: "John Doe",
                university: "NTU",
                year: "Year 2",
                status: "Pending"
            },
            {
                id: "2",
                name: "Jane Smith",
                university: "NUS",
                year: "Year 3",
                status: "Reviewing"
            }
        ],
        postingDate: "2024-03-01",
        views: 152
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Store referrer for back button
    const referrer = document.referrer;
    if (referrer.includes('Post_Internship_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Post_Internship_Page.html');
    }

    const selectedJobId = localStorage.getItem('selectedJobId');
    if (selectedJobId) {
        loadJobDetails(selectedJobId);
        loadApplicants(selectedJobId);
    }
    setupEventListeners();
    updateDeadlineTimer();
});

// Load job details
function loadJobDetails(jobId) {
    const job = internshipData.find(j => j.id === jobId);
    if (!job) return;

    // Update header info
    document.querySelector('.job-title').textContent = job.title;
    document.querySelector('.company-name').textContent = job.company;
    
    // Update quick info
    const quickInfo = document.querySelector('.quick-info');
    quickInfo.innerHTML = `
        <span class="location">📍 ${job.location}</span>
        <span class="duration">⏱️ ${job.duration}</span>
        <span class="year">🎓 ${job.yearRequired}</span>
        <span class="salary">💰 ${job.salary}</span>
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
    document.querySelector('.deadline-date').textContent = formatDate(job.deadline);
    
    // Update applicants count in header
    document.querySelector('.applicant-count').textContent = `(${job.applicants.length})`;
}

// Load applicants list
function loadApplicants(jobId) {
    const job = internshipData.find(j => j.id === jobId);
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
    const referrer = localStorage.getItem('jobListingReferrer') || 'Post_Internship_Page.html';
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
    // TODO: Implement delete logic with backend
    alert('Post deleted successfully!');
    
    // Return to internship listings page
    const referrer = localStorage.getItem('jobListingReferrer');
    const defaultPage = 'Post_Internship_Page.html';  // Always return to internship page by default
    window.location.href = referrer || defaultPage;
}

// Update deadline timer
function updateDeadlineTimer() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = internshipData.find(j => j.id === selectedJobId);
    if (!job) return;

    const deadline = new Date(job.deadline);
    const now = new Date();
    const timeRemaining = deadline - now;
    
    if (timeRemaining > 0) {
        const days = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        document.querySelector('.time-remaining').textContent = `${days} days remaining`;
    } else {
        document.querySelector('.time-remaining').textContent = 'Application closed';
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update deadline timer every minute
setInterval(updateDeadlineTimer, 60000);
