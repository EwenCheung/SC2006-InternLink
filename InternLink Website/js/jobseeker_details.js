// Job data (to be synchronized with jobseeker_internship.js)
const jobsData = [
    {
        id: "1",
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
        applicants: 25
    },
    {
        id: "2",
        title: "Data Analytics Intern",
        company: "DataTech Solutions",
        location: "East",
        description: "Analyzing large datasets and creating meaningful insights. Work with business intelligence tools and machine learning algorithms.",
        companyDescription: "DataTech Solutions is a leading data analytics firm that helps businesses make data-driven decisions. We specialize in transforming complex data into actionable insights.",
        requirements: ["Python", "SQL", "Data Visualization"],
        responsibilities: [
            "Analyze large datasets and create insights",
            "Develop and maintain dashboards",
            "Build predictive models",
            "Collaborate with business teams",
            "Prepare data analysis reports"
        ],
        yearRequired: "Year 3",
        duration: "6 months",
        courseRequired: "Data Science",
        salary: "$1200/month",
        deadline: "2024-04-30",
        industry: "Data Analytics",
        companySize: "20-50 employees",
        website: "www.datatech.com",
        companyLocation: "East Coast, Singapore",
        benefits: [
            "Competitive salary",
            "Data science certification",
            "Flexible hours",
            "Project completion bonus",
            "Training workshops"
        ],
        applicants: 15
    },
    {
        id: "3",
        title: "Marketing Intern",
        company: "Global Marketing SG",
        location: "West",
        description: "Assisting in digital marketing campaigns and social media management. Create engaging content and analyze campaign performance.",
        companyDescription: "Global Marketing SG is a dynamic marketing agency delivering innovative digital solutions to clients across Asia. We pride ourselves on creativity and results-driven campaigns.",
        requirements: ["Social Media", "Content Creation", "Analytics"],
        responsibilities: [
            "Manage social media accounts",
            "Create marketing content",
            "Analyze campaign metrics",
            "Assist in event planning",
            "Conduct market research"
        ],
        yearRequired: "Year 2",
        duration: "4 months",
        courseRequired: "Marketing",
        salary: "$900/month",
        deadline: "2024-04-15",
        industry: "Marketing",
        companySize: "30-50 employees",
        website: "www.globalmarketingsg.com",
        companyLocation: "Jurong, Singapore",
        benefits: [
            "Monthly allowance",
            "Marketing certifications",
            "Networking events",
            "Portfolio development",
            "Performance bonuses"
        ],
        applicants: 20
    },
    {
        id: "4",
        title: "UX/UI Design Intern",
        company: "Creative Studio SG",
        location: "Central",
        description: "Design user interfaces for web and mobile applications. Conduct user research and create wireframes and prototypes.",
        companyDescription: "Creative Studio SG is an award-winning design agency creating beautiful and functional digital experiences. We believe in user-centered design and innovation.",
        requirements: ["Figma", "Adobe XD", "User Research"],
        responsibilities: [
            "Create UI wireframes",
            "Conduct user research",
            "Design user interfaces",
            "Create interactive prototypes",
            "Participate in design reviews"
        ],
        yearRequired: "Year 2",
        duration: "3 months",
        courseRequired: "Design",
        salary: "$1100/month",
        deadline: "2024-05-15",
        industry: "Design",
        companySize: "20-30 employees",
        website: "www.creativestudiosg.com",
        companyLocation: "Orchard Road, Singapore",
        benefits: [
            "Design tool subscriptions",
            "Portfolio guidance",
            "Creative workshops",
            "Design conference passes",
            "Project showcases"
        ],
        applicants: 30
    },
    {
        id: "5",
        title: "Finance Intern",
        company: "SG Finance Corp",
        location: "Central",
        description: "Support financial analysis and reporting. Assist in preparing financial statements and conducting market research.",
        companyDescription: "SG Finance Corp is a respected financial institution providing comprehensive financial services to clients across Singapore and Southeast Asia.",
        requirements: ["Excel", "Financial Analysis", "Bloomberg"],
        responsibilities: [
            "Prepare financial reports",
            "Analyze market trends",
            "Support audit processes",
            "Conduct financial research",
            "Assist in forecasting"
        ],
        yearRequired: "Year 3",
        duration: "6 months",
        courseRequired: "Finance",
        salary: "$1300/month",
        deadline: "2024-05-01",
        industry: "Finance",
        companySize: "100-200 employees",
        website: "www.sgfinance.com",
        companyLocation: "Raffles Place, Singapore",
        benefits: [
            "Competitive stipend",
            "Bloomberg certification",
            "Networking events",
            "Professional development",
            "Performance bonuses"
        ],
        applicants: 40
    },
    {
        id: "6",
        title: "Engineering Intern",
        company: "Engineering Solutions",
        location: "North",
        description: "Work on mechanical design projects. Use CAD software and participate in product development lifecycle.",
        companyDescription: "Engineering Solutions is a leading engineering firm specializing in innovative mechanical design and product development solutions.",
        requirements: ["AutoCAD", "SolidWorks", "3D Modeling"],
        responsibilities: [
            "Create CAD designs",
            "Support product development",
            "Conduct design analysis",
            "Prepare technical documentation",
            "Assist in prototyping"
        ],
        yearRequired: "Year 3",
        duration: "4 months",
        courseRequired: "Mechanical Engineering",
        salary: "$1200/month",
        deadline: "2024-04-20",
        industry: "Engineering",
        companySize: "50-100 employees",
        website: "www.engineeringsolutions.com",
        companyLocation: "Woodlands, Singapore",
        benefits: [
            "Industry certification",
            "Technical workshops",
            "Project exposure",
            "Tool allowance",
            "Safety training"
        ],
        applicants: 22
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Store referrer for back button
    const referrer = document.referrer;
    if (referrer.includes('Find_internship_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Find_internship_Page.html');
    } else if (referrer.includes('Find_AdHoc_Page.html')) {
        localStorage.setItem('jobListingReferrer', 'Find_AdHoc_Page.html');
    }

    const selectedJobId = localStorage.getItem('selectedJobId');
    if (selectedJobId) {
        loadJobDetails(selectedJobId);
        loadSimilarJobs(selectedJobId);
    }
    setupEventListeners();
    updateDeadlineTimer();
});

// Load job details
function loadJobDetails(jobId) {
    const job = jobsData.find(j => j.id === jobId);
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

    // Update application info
    document.querySelector('.deadline-date').textContent = formatDate(job.deadline);
    document.querySelector('.applicants').textContent = `${job.applicants} people have applied`;
}

// Load similar jobs based on course, location, or skills
function loadSimilarJobs(currentJobId) {
    const currentJob = jobsData.find(j => j.id === currentJobId);
    if (!currentJob) return;

    // Find similar jobs based on course, location, or skills
    const similarJobs = jobsData
        .filter(job => 
            job.id !== currentJobId && (
                job.courseRequired === currentJob.courseRequired ||
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
                <span class="salary">💰 ${job.salary}</span>
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
    const job = jobsData.find(j => j.id === selectedJobId);
    if (job) {
        // Store employer info for messaging
        localStorage.setItem('messageRecipient', job.company);
        window.location.href = '../messages.html';
    }
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
    const shareText = `Check out this internship: ${jobTitle} at ${company} on InternLink!`;
    
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

// Update deadline timer
function updateDeadlineTimer() {
    const selectedJobId = localStorage.getItem('selectedJobId');
    const job = jobsData.find(j => j.id === selectedJobId);
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
