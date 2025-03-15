import jobListings from './jobs_data.js';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Store referrer for back button
    const referrer = document.referrer;
    if (referrer.includes('Find_internship_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Find_internship_Page.html');
    } else if (referrer.includes('Find_AdHoc_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Find_AdHoc_Page.html');
    }

    // Make jobListings available globally
    window.jobListings = jobListings;

    // For demo purposes, always show the first job of appropriate type
    const pageType = localStorage.getItem('jobListingReferrer');
    const isInternship = pageType === 'Find_internship_Page.html';
    const job = isInternship ? jobListings.internships[0] : jobListings.adhoc[0];
    
    loadJobDetails(job);
    loadSimilarJobs(job);
    setupEventListeners();
    updateDeadlineTimer();
});

// Load job details
function loadJobDetails(job) {
    // Update header info
    document.querySelector('.job-title').textContent = job.title;
    document.querySelector('.company-name').textContent = job.company;
    
    // Update quick info
    const quickInfo = document.querySelector('.quick-info');
    quickInfo.innerHTML = `
        <span class="location">📍 ${job.location}</span>
        <span class="duration">⏱️ ${job.duration}</span>
        <span class="payment">💰 ${job.id.startsWith('INT') ? job.salary : job.payment}</span>
    `;

    // Update company section
    document.querySelector('.company-description').textContent = 
        "A leading company in Singapore providing innovative solutions and opportunities for growth.";
    
    // Update company details
    const companyDetails = document.querySelector('.company-details');
    companyDetails.innerHTML = `
        <div class="detail-item">
            <span class="label">Industry:</span>
            <span class="value">Technology</span>
        </div>
        <div class="detail-item">
            <span class="label">Company Size:</span>
            <span class="value">50-200 employees</span>
        </div>
        <div class="detail-item">
            <span class="label">Website:</span>
            <span class="value"><a href="#" target="_blank">www.company.com</a></span>
        </div>
        <div class="detail-item">
            <span class="label">Location:</span>
            <span class="value">Singapore</span>
        </div>
    `;

    // Update job details
    document.querySelector('.description p').textContent = job.description;
    
    // Update responsibilities (using requirements as responsibilities for demo)
    const responsibilitiesList = document.querySelector('.responsibilities-list');
    responsibilitiesList.innerHTML = job.requirements
        .map(req => `<li>${req}</li>`)
        .join('');

    // Update requirements
    const skillsRequired = document.querySelector('.skills-required');
    skillsRequired.innerHTML = job.requirements
        .map(skill => `<span>${skill}</span>`)
        .join('');

    // Update benefits
    const benefitsList = document.querySelector('.benefits-list');
    benefitsList.innerHTML = `
        <li>Competitive ${job.id.startsWith('INT') ? 'stipend' : 'payment'}</li>
        <li>Flexible working hours</li>
        <li>Learning opportunities</li>
        <li>Professional development</li>
    `;

    // Update application info
    document.querySelector('.deadline-date').textContent = formatDate('2024-05-31');
    document.querySelector('.applicants').textContent = '15 people have applied';
}

// Load similar jobs
function loadSimilarJobs(currentJob) {
    // Get two similar jobs from the same category
    const similarJobs = currentJob.id.startsWith('INT') ? 
        window.jobListings.internships.slice(1, 3) : 
        window.jobListings.adhoc.slice(1, 3);

    const similarJobsList = document.querySelector('.similar-jobs-list');
    similarJobsList.innerHTML = similarJobs.map(job => `
        <div class="similar-job-card" data-job-id="${job.id}">
            <h4>${job.title}</h4>
            <p class="company">${job.company}</p>
            <div class="quick-info">
                <span class="location">📍 ${job.location}</span>
                <span class="payment">💰 ${job.id.startsWith('INT') ? job.salary : job.payment}</span>
            </div>
            <button class="see-details-btn" onclick="seeDetails('${job.id}')">See Details</button>
        </div>
    `).join('');
}

// Set up event listeners
function setupEventListeners() {
    // Apply button
    document.querySelector('.apply-btn').addEventListener('click', handleApply);
    
    // Message button
    document.querySelector('.message-btn').addEventListener('click', handleMessage);
    
    // Share button
    document.querySelector('.share-btn').addEventListener('click', handleShare);

    // Back button
    document.querySelector('.back-btn').addEventListener('click', handleBack);
}

// Handle apply click
function handleApply() {
    alert('Application submitted successfully!');
}

// Handle message click
function handleMessage() {
    const pageType = localStorage.getItem('jobListingReferrer');
    const isInternship = pageType === 'Find_internship_Page.html';
    const job = isInternship ? window.jobListings.internships[0] : window.jobListings.adhoc[0];
    
    // Store employer info for messaging
    localStorage.setItem('messageRecipient', job.company);
    window.location.href = '../messages.html';
}

// Handle back button click
function handleBack() {
    const referrer = localStorage.getItem('jobListingReferrer') || 'Find_internship_Page.html';
    window.location.href = referrer;
}

// Handle share click
function handleShare() {
    const jobTitle = document.querySelector('.job-title').textContent;
    const company = document.querySelector('.company-name').textContent;
    
    // Create share text
    const shareText = `Check out this position: ${jobTitle} at ${company} on InternLink!`;
    
    // Use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'InternLink Job Share',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback
        alert('Copy this link to share: ' + window.location.href);
    }
}

// See details of similar job
function seeDetails(jobId) {
    const job = jobId.startsWith('INT') ? 
        window.jobListings.internships[0] : 
        window.jobListings.adhoc[0];
        
    loadJobDetails(job);
    loadSimilarJobs(job);
    window.scrollTo(0, 0);
}

// Update deadline timer
function updateDeadlineTimer() {
    const deadline = new Date('2024-05-31');
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

// Export functions for use in HTML
window.handleApply = handleApply;
window.handleMessage = handleMessage;
window.handleShare = handleShare;
window.handleBack = handleBack;
window.seeDetails = seeDetails;

// Update deadline timer every minute
setInterval(updateDeadlineTimer, 60000);
