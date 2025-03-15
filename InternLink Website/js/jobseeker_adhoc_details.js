// Ad hoc job data (synchronized with jobseeker_adhoc.js)
const adhocJobsData = [
    {
        id: "1",
        title: "Event Assistant",
        company: "SG Events Co",
        location: "Central",
        description: "Assist in organizing and managing a tech conference. Help with registration, guest coordination, and event logistics.",
        companyDescription: "SG Events Co is a leading event management company specializing in corporate events, conferences, and exhibitions. We deliver exceptional experiences through innovative solutions.",
        requirements: ["Communication", "Organization", "Customer Service"],
        responsibilities: [
            "Assist with event registration and check-in",
            "Guide attendees and manage crowd flow",
            "Support event logistics and setup",
            "Help coordinate with vendors and speakers",
            "Ensure smooth event operations"
        ],
        yearRequired: "Any Year",
        duration: "2 days",
        pay: "$100/day",
        eventDate: "2024-03-31",
        industry: "Event Management",
        companySize: "20-50 employees",
        website: "www.sgevents.com",
        companyLocation: "Central Business District, Singapore",
        benefits: [
            "Daily pay: $100/day",
            "Meals provided",
            "Transport allowance",
            "Certificate of participation",
            "Networking opportunities"
        ],
        applicants: 15
    },
    {
        id: "2",
        title: "Photography Assistant",
        company: "Creative Studios",
        location: "East",
        description: "Support professional photographers during a corporate event. Help with equipment setup and photo organization.",
        companyDescription: "Creative Studios is a professional photography studio known for delivering high-quality corporate and event photography services.",
        requirements: ["Photography", "Equipment Handling", "Teamwork"],
        responsibilities: [
            "Assist lead photographer",
            "Set up lighting equipment",
            "Manage photography gear",
            "Organize digital files",
            "Support post-processing tasks"
        ],
        yearRequired: "Any Year",
        duration: "1 day",
        pay: "$120/day",
        eventDate: "2024-04-05",
        industry: "Photography",
        companySize: "10-20 employees",
        website: "www.creativestudios.com",
        companyLocation: "East Coast, Singapore",
        benefits: [
            "Daily pay: $120/day",
            "Meals provided",
            "Portfolio opportunities",
            "Professional equipment exposure",
            "Reference letter available"
        ],
        applicants: 8
    },
    {
        id: "3",
        title: "Market Research Assistant",
        company: "Research Solutions",
        location: "West",
        description: "Conduct street surveys and data collection for market research project. Training provided.",
        companyDescription: "Research Solutions is a market research firm specializing in consumer behavior and market trends analysis.",
        requirements: ["Communication", "Data Collection", "Basic Excel"],
        responsibilities: [
            "Conduct surveys",
            "Record responses accurately",
            "Enter data into system",
            "Basic data analysis",
            "Report findings"
        ],
        yearRequired: "Any Year",
        duration: "3 days",
        pay: "$90/day",
        eventDate: "2024-04-10",
        industry: "Market Research",
        companySize: "30-50 employees",
        website: "www.researchsolutions.com",
        companyLocation: "Jurong, Singapore",
        benefits: [
            "Daily pay: $90/day",
            "Training provided",
            "Meal allowance",
            "Transport allowance",
            "Flexible hours"
        ],
        applicants: 12
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Store referrer for back button
    const referrer = document.referrer;
    if (referrer.includes('Find_AdHoc_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Find_AdHoc_Page.html');
    }

    const selectedJobId = localStorage.getItem('selectedJobId');
    if (selectedJobId) {
        loadJobDetails(selectedJobId);
        loadSimilarJobs(selectedJobId);
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
        <span class="duration">⏱️ ${job.duration}</span>
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

    // Update application info
    document.querySelector('.event-date').textContent = `Event Date: ${formatDate(job.eventDate)}`;
    document.querySelector('.applicants').textContent = `${job.applicants} people have applied`;
}

// Load similar jobs based on location or required skills
function loadSimilarJobs(currentJobId) {
    const currentJob = adhocJobsData.find(j => j.id === currentJobId);
    if (!currentJob) return;

    const similarJobs = adhocJobsData
        .filter(job => 
            job.id !== currentJobId && (
                job.location === currentJob.location ||
                job.requirements.some(r => currentJob.requirements.includes(r))
            )
        )
        .slice(0, 2); // Show only 2 similar jobs

    const similarJobsList = document.querySelector('.similar-jobs-list');
    similarJobsList.innerHTML = similarJobs.map(job => `
        <div class="similar-job-card" data-job-id="${job.id}">
            <h4>${job.title}</h4>
            <p class="company">${job.company}</p>
            <div class="quick-info">
                <span class="location">📍 ${job.location}</span>
                <span class="duration">⏱️ ${job.duration}</span>
                <span class="pay">💰 ${job.pay}</span>
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
    // TODO: Implement application logic
    alert('Application submitted successfully!');
}

// Handle message click
function handleMessage() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = adhocJobsData.find(j => j.id === selectedJobId);
    if (job) {
        // Store employer info for messaging
        localStorage.setItem('messageRecipient', job.company);
        window.location.href = '../messages.html';
    }
}

// Handle back button click
function handleBack() {
    const referrer = localStorage.getItem('jobListingReferrer') || 'Find_AdHoc_Page.html';
    window.location.href = referrer;
}

// Handle share click
function handleShare() {
    const jobTitle = document.querySelector('.job-title').textContent;
    const company = document.querySelector('.company-name').textContent;
    
    // Create share text
    const shareText = `Check out this ad hoc job: ${jobTitle} at ${company} on InternLink!`;
    
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
    localStorage.setItem('selectedJobId', jobId);
    loadJobDetails(jobId);
    loadSimilarJobs(jobId);
    window.scrollTo(0, 0);
}

// Update event timer
function updateEventTimer() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = adhocJobsData.find(j => j.id === selectedJobId);
    if (!job) return;

    const eventDate = new Date(job.eventDate);
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
